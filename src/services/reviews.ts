import { supabase } from '@/lib/supabase';
import { removeReviewPhotos, uploadReviewPhotos, type LocalPhoto } from '@/services/review-photos';
import type { Review, VehicleRating, VehicleSnapshot } from '@/types/vehicle';

const REVIEW_COLUMNS = '*, profiles(username)';

/** Mínimo de reseñas para entrar al Top, evita que una sola reseña de 5★ domine. */
const TOP_MIN_REVIEWS = 2;

/** Campos que el usuario escribe en el formulario de reseña. */
export type ReviewContent = {
  rating: number;
  title: string;
  body: string;
  pros?: string;
  cons?: string;
  mileage?: number;
};

export type NewReview = VehicleSnapshot & ReviewContent;

export async function getReview(id: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select(REVIEW_COLUMNS)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Esta reseña ya no existe.');
  return data as Review;
}

export async function getVehicleReviews(vehicleId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select(REVIEW_COLUMNS)
    .eq('vehicle_id', vehicleId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Review[];
}

export async function getRecentReviews(limit = 10) {
  const { data, error } = await supabase
    .from('reviews')
    .select(REVIEW_COLUMNS)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as Review[];
}

export async function getUserReviews(userId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select(REVIEW_COLUMNS)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Review[];
}

export async function getTopVehicles(limit = 10) {
  const { data, error } = await supabase
    .from('vehicle_ratings')
    .select('*')
    .gte('review_count', TOP_MIN_REVIEWS)
    .order('avg_rating', { ascending: false })
    .order('review_count', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as VehicleRating[];
}

export async function getVehicleRating(vehicleId: string) {
  const { data, error } = await supabase
    .from('vehicle_ratings')
    .select('*')
    .eq('vehicle_id', vehicleId)
    .maybeSingle();
  if (error) throw error;
  return data as VehicleRating | null;
}

export async function createReview(userId: string, review: NewReview, photos: LocalPhoto[] = []) {
  const photoPaths = await uploadReviewPhotos(userId, photos);
  const { error } = await supabase
    .from('reviews')
    .insert({ ...review, user_id: userId, photos: photoPaths });
  if (error) {
    // La reseña no se creó: no dejes fotos huérfanas en Storage
    await removeReviewPhotos(photoPaths);
    if (error.code === '23505') throw new Error('Ya escribiste una reseña para este vehículo.');
    throw error;
  }
}

/**
 * Actualiza una reseña propia. `photos` es la lista final: las que traen `path` ya
 * están subidas y se conservan; las demás se suben ahora. Las fotos que el usuario
 * quitó se borran de Storage solo si la actualización tuvo éxito.
 */
export async function updateReview(
  review: Pick<Review, 'id' | 'user_id' | 'photos'>,
  content: ReviewContent,
  photos: LocalPhoto[]
) {
  const newPaths = await uploadReviewPhotos(
    review.user_id,
    photos.filter((p) => !p.path)
  );
  let uploaded = 0;
  const finalPaths = photos.map((p) => p.path ?? newPaths[uploaded++]);

  const { data, error } = await supabase
    .from('reviews')
    .update({
      ...content,
      // Un campo opcional vaciado debe quedar en null, no conservar el valor anterior
      pros: content.pros ?? null,
      cons: content.cons ?? null,
      mileage: content.mileage ?? null,
      photos: finalPaths,
      updated_at: new Date().toISOString(),
    })
    .eq('id', review.id)
    .select('id');
  if (error || !data?.length) {
    await removeReviewPhotos(newPaths);
    throw error ?? new Error('No se pudo actualizar la reseña.');
  }
  await removeReviewPhotos(review.photos.filter((path) => !finalPaths.includes(path)));
}

export async function deleteReview(review: Pick<Review, 'id' | 'photos'>) {
  const { data, error } = await supabase.from('reviews').delete().eq('id', review.id).select('id');
  if (error) throw error;
  // RLS no da error si la fila no es tuya: simplemente no borra nada
  if (!data?.length) throw new Error('No se pudo eliminar la reseña.');
  await removeReviewPhotos(review.photos);
}
