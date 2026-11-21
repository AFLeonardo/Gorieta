/**
 * Cliente de MarketCheck: precio de mercado y fotos reales de anuncios.
 *
 * El endpoint de predicción de MarketCheck requiere VIN; como en Gorieta navegamos por
 * año/marca/modelo, usamos los anuncios activos (`/v2/search/car/active`): las estadísticas
 * dan el rango de precio y los propios anuncios traen fotos (`media.photo_links`).
 * Ambos salen de UNA sola petición.
 *
 * Cuota: el plan gratuito permite ~500 peticiones al mes, así que cada resultado se guarda
 * en caché (ver vehicle-images.ts) y las listas nunca llaman a la API: solo leen la caché.
 *
 * Nota: igual que con CarVector, mueve esto a una Edge Function antes de publicar.
 */
import { getLocalMarketData } from '@/services/local-vehicles';
import { cacheMarketData, getCachedMarketData, type MarketData } from '@/services/vehicle-images';
import type { Vehicle } from '@/types/vehicle';

const BASE_URL = 'https://api.marketcheck.com/v2';
const API_KEY = process.env.EXPO_PUBLIC_MARKETCHECK_API_KEY;

/** Anuncios a revisar para elegir la mejor foto. */
const LISTINGS_TO_SCAN = 8;
/** Un anuncio con pocas fotos suele traer solo un "imagen no disponible" del concesionario. */
const MIN_PHOTOS = 3;
/** El precio cambia poco de un día a otro: no gastes cuota repitiendo la misma consulta. */
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const PLACEHOLDER_PATTERN = /not[-_]?available|no[-_]?(image|photo)|placeholder|coming[-_]?soon/i;

type Listing = {
  media?: { photo_links?: string[] };
};

type ActiveSearchResponse = {
  num_found: number;
  listings?: Listing[];
  stats?: { price?: MarketData['price'] };
};

/** Precio de mercado y una foto real para un año/marca/modelo (con caché de 24 h). */
export async function getMarketData(
  vehicle: Pick<Vehicle, 'year' | 'make' | 'model'>
): Promise<MarketData> {
  // Los vehículos del dataset local ya traen precio y foto: no gastan cuota
  const local = getLocalMarketData(vehicle);
  if (local) return { ...local, fetchedAt: Date.now() };

  const cached = getCachedMarketData(vehicle);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) return cached;

  const url = new URL(`${BASE_URL}/search/car/active`);
  url.searchParams.set('api_key', API_KEY ?? '');
  url.searchParams.set('year', String(vehicle.year));
  url.searchParams.set('make', vehicle.make);
  url.searchParams.set('model', vehicle.model);
  url.searchParams.set('stats', 'price');
  url.searchParams.set('rows', String(LISTINGS_TO_SCAN));

  const res = await fetch(url.toString());
  if (!res.ok) {
    // Sin cuota o con error: mejor datos viejos que nada
    if (cached) return cached;
    throw new Error(`MarketCheck ${res.status}: ${await res.text()}`);
  }
  const data = (await res.json()) as ActiveSearchResponse;
  const price = data.stats?.price;

  const result: MarketData = {
    price: price && price.count > 0 ? price : null,
    // Si esta vez no hubo foto válida, conserva la que ya teníamos
    photo: pickPhoto(data.listings ?? []) ?? cached?.photo ?? null,
    fetchedAt: Date.now(),
  };
  cacheMarketData(vehicle, result);
  return result;
}

/**
 * Elige la portada del anuncio con más fotos: suelen ser concesionarios con sesión
 * profesional, y su primera foto casi siempre es el exterior en vista 3/4.
 */
function pickPhoto(listings: Listing[]) {
  let best: string[] = [];
  for (const listing of listings) {
    const photos = (listing.media?.photo_links ?? []).filter(
      (url) => url.startsWith('https://') && !PLACEHOLDER_PATTERN.test(url)
    );
    if (photos.length > best.length) best = photos;
  }
  return best.length >= MIN_PHOTOS ? best[0] : null;
}
