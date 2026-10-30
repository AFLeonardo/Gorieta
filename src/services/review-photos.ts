import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

import { supabase } from '@/lib/supabase';

const BUCKET = 'review-photos';

export const MAX_REVIEW_PHOTOS = 5;

/** Lado mayor máximo tras optimizar: nítido en pantalla completa, ~200–400 KB en JPEG. */
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.7;

/** Foto local (cámara o galería) aún sin subir. */
export type LocalPhoto = {
  uri: string;
  mimeType?: string | null;
};

/**
 * Reduce la foto a MAX_DIMENSION en su lado mayor y la recomprime como JPEG.
 * Una foto de cámara de 12 MP (3–5 MB) queda en unos cientos de KB, y HEIC/PNG
 * se convierten a JPEG, que todos los navegadores pueden mostrar.
 */
export async function optimizeReviewPhoto(
  uri: string,
  size?: { width: number; height: number }
): Promise<LocalPhoto> {
  // maxWidth/maxHeight reducen la imagen al decodificarla: nunca se carga a resolución completa
  const context = ImageManipulator.manipulate(uri, {
    maxWidth: MAX_DIMENSION,
    maxHeight: MAX_DIMENSION,
  });
  // El submuestreo al decodificar puede quedar por encima del límite; si sabemos el tamaño, ajustamos exacto
  if (size && Math.max(size.width, size.height) > MAX_DIMENSION) {
    context.resize(
      size.width >= size.height
        ? { width: MAX_DIMENSION, height: null }
        : { width: null, height: MAX_DIMENSION }
    );
  }
  const image = await context.renderAsync();
  const result = await image.saveAsync({ compress: JPEG_QUALITY, format: SaveFormat.JPEG });
  context.release();
  image.release();
  return { uri: result.uri, mimeType: 'image/jpeg' };
}

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
