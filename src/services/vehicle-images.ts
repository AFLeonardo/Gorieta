/**
 * Caché de datos de MarketCheck (precio + foto real) por año/marca/modelo.
 *
 * Vive en memoria y en localStorage (respaldado por SQLite en iOS/Android), así que
 * sobrevive a reinicios. Las listas usan `useVehicleImage` para mostrar la foto real si
 * ya la conocemos, sin gastar cuota de la API; si no, caen en la ilustración de CarVector.
 */
import { useSyncExternalStore } from 'react';

import type { PriceStats, Vehicle, VehicleSnapshot } from '@/types/vehicle';

export type MarketData = {
  price: PriceStats | null;
  /** URL de una foto real del modelo, o null si ningún anuncio tenía una buena. */
  photo: string | null;
  fetchedAt: number;
};

type ModelKey = Pick<Vehicle, 'year' | 'make' | 'model'>;

const PREFIX = 'gorieta:market:';
const memory = new Map<string, MarketData | null>();
const listeners = new Set<() => void>();
let version = 0;

function keyOf(v: ModelKey) {
  return `${PREFIX}${v.year}|${v.make.trim().toLowerCase()}|${v.model.trim().toLowerCase()}`;
}

export function getCachedMarketData(v: ModelKey): MarketData | null {
  const key = keyOf(v);
  if (memory.has(key)) return memory.get(key) ?? null;
  let data: MarketData | null = null;
  try {
    const raw = globalThis.localStorage?.getItem(key);
    data = raw ? (JSON.parse(raw) as MarketData) : null;
  } catch {
    data = null;
  }
  memory.set(key, data);
  return data;
}

export function cacheMarketData(v: ModelKey, data: MarketData) {
  const key = keyOf(v);
  memory.set(key, data);
  try {
    globalThis.localStorage?.setItem(key, JSON.stringify(data));
  } catch {
    // Sin almacenamiento: la caché dura solo esta sesión
  }
  version++;
  listeners.forEach((notify) => notify());
}

/** Mejor imagen conocida: foto real de MarketCheck si está en caché, si no la de CarVector. */
export function bestVehicleImage(v: ModelKey & Pick<VehicleSnapshot, 'image_url'>) {
  return getCachedMarketData(v)?.photo ?? v.image_url;
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  return () => listeners.delete(notify);
}

/**
 * Igual que `bestVehicleImage`, pero se actualiza sola cuando llega una foto nueva
 * (por ejemplo, al abrir la ficha de un vehículo que también aparece en una lista).
 */
export function useVehicleImage(v: ModelKey & Pick<VehicleSnapshot, 'image_url'>) {
  useSyncExternalStore(
    subscribe,
    () => version,
    () => version
  );
  return bestVehicleImage(v);
}
