/**
 * Búsquedas sobre el dataset local (src/data/vehicles.ts), con la misma forma de
 * respuesta que CarVector para que el resto de la app no note la diferencia.
 */
import { LOCAL_VEHICLES } from '@/data/vehicles';
import type { PriceStats, Vehicle } from '@/types/vehicle';

export const LOCAL_ID_PREFIX = 'gz-';

/** Formas comunes de escribir una marca. */
const MAKE_ALIASES: Record<string, string> = {
  chevy: 'chevrolet',
  vw: 'volkswagen',
  mercedes: 'mercedes-benz',
  benz: 'mercedes-benz',
};

/** "CR-V", "crv" y "Cr V" se comparan igual. */
function norm(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function matchesMake(vehicle: Vehicle, make: string) {
  const wanted = MAKE_ALIASES[make.trim().toLowerCase()] ?? make;
  return norm(vehicle.make).startsWith(norm(wanted));
}

function matchesModel(vehicle: Vehicle, model: string) {
  const wanted = norm(model);
  return wanted.length > 0 && norm(vehicle.model).includes(wanted);
}

export type LocalQuery = {
  year?: number;
  make?: string;
  model?: string;
  limit?: number;
  offset?: number;
};

export function searchLocalVehicles({ year, make, model, limit = 100, offset = 0 }: LocalQuery) {
  const matches = LOCAL_VEHICLES.map((e) => e.vehicle).filter(
    (v) =>
      (year === undefined || v.year === year) &&
      (!make || matchesMake(v, make)) &&
      (!model || matchesModel(v, model))
  );
  return {
    count: matches.length,
    limit,
    offset,
    results: matches.slice(offset, offset + limit),
  };
}

export function getLocalVehicle(id: string) {
  return LOCAL_VEHICLES.find((e) => e.vehicle.id === id)?.vehicle ?? null;
}

/** Precio y foto guardados en el dataset para un año/marca/modelo (sin llamar a MarketCheck). */
export function getLocalMarketData(
  v: Pick<Vehicle, 'year' | 'make' | 'model'>
): { price: PriceStats; photo: string | null } | null {
  const entry = LOCAL_VEHICLES.find(
    (e) =>
      e.vehicle.year === v.year &&
      norm(e.vehicle.make) === norm(v.make) &&
      norm(e.vehicle.model) === norm(v.model)
  );
  return entry ? { price: entry.price, photo: entry.vehicle.image_url } : null;
}

/**
 * El dataset tiene un solo año por modelo, así que "autos similares" son los de la
 * misma carrocería con potencia más parecida.
 */
export function getLocalSimilarVehicles(vehicle: Vehicle, limit = 10) {
  return LOCAL_VEHICLES.map((e) => e.vehicle)
    .filter((v) => v.id !== vehicle.id && v.body_class === vehicle.body_class)
    .sort(
      (a, b) =>
        Math.abs((a.horsepower ?? 0) - (vehicle.horsepower ?? 0)) -
        Math.abs((b.horsepower ?? 0) - (vehicle.horsepower ?? 0))
    )
    .slice(0, limit);
}
