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
