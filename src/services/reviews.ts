import { supabase } from '@/lib/supabase';
import type { Review, VehicleRating, VehicleSnapshot } from '@/types/vehicle';

const REVIEW_COLUMNS = '*, profiles(username)';

/** Mínimo de reseñas para entrar al Top, evita que una sola reseña de 5★ domine. */
const TOP_MIN_REVIEWS = 2;

export type NewReview = VehicleSnapshot & {
  rating: number;
  title: string;
  body: string;
  pros?: string;
  cons?: string;
  mileage?: number;
};

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

export async function createReview(userId: string, review: NewReview) {
  const { error } = await supabase.from('reviews').insert({ ...review, user_id: userId });
  if (error) {
    if (error.code === '23505') throw new Error('Ya escribiste una reseña para este vehículo.');
    throw error;
  }
}

export async function deleteReview(id: string) {
  const { error } = await supabase.from('reviews').delete().eq('id', id);
  if (error) throw error;
}
