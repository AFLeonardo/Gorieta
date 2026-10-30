import { supabase } from '@/lib/supabase';

const BUCKET = 'review-photos';

export const MAX_REVIEW_PHOTOS = 5;

/** Foto local (cámara o galería) aún sin subir. */
export type LocalPhoto = {
  uri: string;
  mimeType?: string | null;
};

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
};

/**
 * Sube las fotos a `<userId>/…` (las políticas de Storage solo permiten esa carpeta)
 * y devuelve sus rutas. Si una falla, borra las que ya se subieron.
 */
export async function uploadReviewPhotos(userId: string, photos: LocalPhoto[]) {
  const paths: string[] = [];
  try {
    for (const photo of photos) {
      const contentType = photo.mimeType && EXTENSIONS[photo.mimeType] ? photo.mimeType : 'image/jpeg';
      const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${EXTENSIONS[contentType]}`;
      // fetch funciona con file:// (nativo) y blob:/data: (web)
      const body = await (await fetch(photo.uri)).arrayBuffer();

      const { error } = await supabase.storage.from(BUCKET).upload(path, body, { contentType });
      if (error) throw error;
      paths.push(path);
    }
    return paths;
  } catch (e) {
    await removeReviewPhotos(paths);
    throw e;
  }
}

export async function removeReviewPhotos(paths: string[]) {
  if (paths.length === 0) return;
  await supabase.storage.from(BUCKET).remove(paths);
}

export function reviewPhotoUrl(path: string) {
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
