/**
 * Cliente de CarVector (https://carvector.io/docs/api): especificaciones, imágenes y recalls.
 *
 * Respaldo: si CarVector no responde (cuota agotada, sin red, sin key) las búsquedas usan
 * el dataset local de 50 vehículos (src/data/vehicles.ts). Con
 * EXPO_PUBLIC_VEHICLE_SOURCE=local se usa solo el dataset y nunca se llama a la API.
 *
 * Nota: las variables EXPO_PUBLIC_ se incrustan en el bundle de la app. Antes de publicar,
 * mueve estas llamadas a una Supabase Edge Function para no exponer la API key.
 */
import {
  getLocalSimilarVehicles,
  getLocalVehicle,
  LOCAL_ID_PREFIX,
  searchLocalVehicles,
} from '@/services/local-vehicles';
import type { Vehicle } from '@/types/vehicle';

const BASE_URL = 'https://api.carvector.io/v1';
const API_KEY = process.env.EXPO_PUBLIC_CARVECTOR_API_KEY;

/**
 * Cuando la API no está disponible dejamos de llamarla en esta sesión: cada intento
 * fallido solo agregaría espera antes de caer en el dataset local.
 */
let apiUnavailable = process.env.EXPO_PUBLIC_VEHICLE_SOURCE === 'local' || !API_KEY;

class ApiUnavailableError extends Error {}

type SearchResponse = {
  count: number;
  limit: number;
  offset: number;
  results: Vehicle[];
};

export type VehicleQuery = {
  year?: number;
  make?: string;
  model?: string;
  limit?: number;
  offset?: number;
};

// ───────────── Caché ─────────────
// El plan gratuito de CarVector da 500 llamadas al MES para toda la cuenta. Las
// especificaciones de un modelo no cambian, así que cada respuesta se guarda en
// localStorage (SQLite en iOS/Android) y se reutiliza: repetir una búsqueda o abrir una
// ficha ya vista no gasta llamadas. Además, cada vehículo que llega en una búsqueda se
// guarda por id, así que abrir su ficha después tampoco gasta.
const CACHE_PREFIX = 'gorieta:carvector:';
const VEHICLE_PREFIX = `${CACHE_PREFIX}vehicle:`;
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

type CacheEntry<T> = { data: T; at: number };

function readCache<T>(key: string): CacheEntry<T> | null {
  try {
    const raw = globalThis.localStorage?.getItem(key);
    return raw ? (JSON.parse(raw) as CacheEntry<T>) : null;
  } catch {
    return null;
  }
}

function writeCache(key: string, data: unknown) {
  try {
    globalThis.localStorage?.setItem(key, JSON.stringify({ data, at: Date.now() }));
  } catch {
    // Sin espacio o sin almacenamiento: seguimos sin caché
  }
}

function rememberVehicles(data: unknown) {
  const results = (data as Partial<SearchResponse>)?.results;
  const vehicles = Array.isArray(results) ? results : [data as Vehicle];
  for (const v of vehicles) {
    if (v && typeof v.id === 'string') writeCache(VEHICLE_PREFIX + v.id, v);
  }
}

async function request<T>(path: string, params: Record<string, string | number | undefined> = {}) {
  const url = new URL(BASE_URL + path);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') url.searchParams.set(key, String(value));
  }
  url.searchParams.sort();
  const cacheKey = CACHE_PREFIX + url.pathname + url.search;

  const cached = readCache<T>(cacheKey);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.data;
  if (apiUnavailable) {
    if (cached) return cached.data;
    throw new ApiUnavailableError('CarVector no disponible');
  }

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  if (!res.ok) {
    // Sin cuota o caído: mejor datos guardados (aunque sean viejos) que una pantalla de error
    if (cached) return cached.data;
    if (res.status === 429) {
      apiUnavailable = true;
      throw new Error(
        'Se alcanzó el límite mensual de consultas de vehículos. Intenta con un vehículo que ya hayas visto.'
      );
    }
    throw new Error(`CarVector ${res.status}: ${await res.text()}`);
  }
  const data = (await res.json()) as T;
  writeCache(cacheKey, data);
  rememberVehicles(data);
  return data;
}

export async function searchVehicles(query: VehicleQuery): Promise<SearchResponse> {
  try {
    return await request<SearchResponse>('/vehicles', query);
  } catch {
    // Sin cuota, sin red o sin key: el dataset local mantiene la app funcionando
    return searchLocalVehicles(query);
  }
}

/**
 * Convierte texto libre ("Toyota Corolla 2020", "Land Rover Defender", "Corolla") en
 * posibles consultas, de la más a la menos probable. CarVector necesita marca y modelo
 * por separado, así que probamos marcas de una y dos palabras, y por último solo modelo.
 */
export function parseVehicleText(text: string, year?: number): VehicleQuery[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const yearIndex = words.findIndex((w) => /^(19|20)\d{2}$/.test(w));
  if (yearIndex >= 0) year ??= Number(words.splice(yearIndex, 1)[0]);
  if (words.length === 0) return year ? [{ year }] : [];

  const candidates: VehicleQuery[] = [];
  for (const makeWords of [1, 2]) {
    if (makeWords > words.length) break;
    candidates.push({
      year,
      make: words.slice(0, makeWords).join(' '),
      model: words.slice(makeWords).join(' ') || undefined,
    });
  }
  candidates.push({ year, model: words.join(' ') });
  return candidates;
}

/** Busca con texto libre; devuelve el primer intento con resultados. */
export async function searchVehiclesByText(text: string, year?: number, limit = 100) {
  let last: SearchResponse = { count: 0, limit, offset: 0, results: [] };
  for (const query of parseVehicleText(text, year)) {
    last = await searchVehicles({ ...query, limit });
    if (last.results.length > 0) break;
  }
  return last;
}

export async function getVehicle(id: string) {
  if (id.startsWith(LOCAL_ID_PREFIX)) {
    const local = getLocalVehicle(id);
    if (!local) throw new Error('No encontramos este vehículo.');
    return local;
  }
  // Si ya llegó en una búsqueda, no hace falta pedirlo otra vez
  const known = readCache<Vehicle>(VEHICLE_PREFIX + id);
  if (known) return known.data;
  try {
    return await request<Vehicle>(`/vehicles/${encodeURIComponent(id)}`);
  } catch (e) {
    if (e instanceof ApiUnavailableError) {
      throw new Error(
        'Este vehículo no está disponible sin conexión al catálogo. Búscalo de nuevo desde Búsqueda.'
      );
    }
    throw e;
  }
}

/** Otras versiones del mismo modelo (otros años y trims), sin incluir el vehículo actual. */
export async function getSimilarVehicles(vehicle: Vehicle, limit = 10) {
  if (vehicle.id.startsWith(LOCAL_ID_PREFIX)) return getLocalSimilarVehicles(vehicle, limit);
  const { results } = await searchVehicles({
    make: vehicle.make,
    model: vehicle.model,
    limit: 50,
  });
  return results
    .filter((v) => v.id !== vehicle.id)
    .sort((a, b) => Math.abs(a.year - vehicle.year) - Math.abs(b.year - vehicle.year))
    .slice(0, limit);
}
