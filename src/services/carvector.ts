/**
 * Cliente de CarVector (https://carvector.io/docs/api): especificaciones, imágenes y recalls.
 *
 * Nota: las variables EXPO_PUBLIC_ se incrustan en el bundle de la app. Antes de publicar,
 * mueve estas llamadas a una Supabase Edge Function para no exponer la API key.
 */
import type { Vehicle } from '@/types/vehicle';

const BASE_URL = 'https://api.carvector.io/v1';
const API_KEY = process.env.EXPO_PUBLIC_CARVECTOR_API_KEY;

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

async function request<T>(path: string, params: Record<string, string | number | undefined> = {}) {
  const url = new URL(BASE_URL + path);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') url.searchParams.set(key, String(value));
  }

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  if (!res.ok) {
    throw new Error(`CarVector ${res.status}: ${await res.text()}`);
  }
  return (await res.json()) as T;
}

export function searchVehicles(query: VehicleQuery) {
  return request<SearchResponse>('/vehicles', query);
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

export function getVehicle(id: string) {
  return request<Vehicle>(`/vehicles/${encodeURIComponent(id)}`);
}

/** Otras versiones del mismo modelo (otros años y trims), sin incluir el vehículo actual. */
export async function getSimilarVehicles(vehicle: Vehicle, limit = 10) {
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
