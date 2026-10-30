import type { Vehicle } from '@/types/vehicle';

/**
 * Categorías del filtro "tipo de auto". CarVector no filtra por carrocería, así que
 * clasificamos en la app con `body_class` y `fuel_type` (valores estilo NHTSA vPIC,
 * p. ej. "Sport Utility Vehicle (SUV)/Multi-Purpose Vehicle (MPV)").
 */
export type VehicleType = {
  key: string;
  label: string;
  matches: (v: Pick<Vehicle, 'body_class' | 'fuel_type'>) => boolean;
};

const body = (pattern: RegExp) => (v: Pick<Vehicle, 'body_class'>) =>
  pattern.test(v.body_class ?? '');

const isHybrid = (v: Pick<Vehicle, 'fuel_type'>) =>
  /hybrid|híbrido/i.test(v.fuel_type ?? '') ||
  (/electric/i.test(v.fuel_type ?? '') && /gasoline|diesel/i.test(v.fuel_type ?? ''));

const isElectric = (v: Pick<Vehicle, 'fuel_type'>) =>
  /electric/i.test(v.fuel_type ?? '') && !isHybrid(v);

export const VEHICLE_TYPES: VehicleType[] = [
  { key: 'suv', label: 'SUV', matches: body(/suv|sport utility|crossover|cuv|mpv/i) },
  { key: 'sedan', label: 'Sedán', matches: body(/sedan|saloon/i) },
  { key: 'pickup', label: 'Pickup', matches: body(/pickup|truck/i) },
  { key: 'hatchback', label: 'Hatchback', matches: body(/hatchback|liftback/i) },
  { key: 'sport', label: 'Deportivo', matches: body(/coupe|convertible|cabriolet|roadster/i) },
  { key: 'van', label: 'Van', matches: body(/van|wagon/i) },
  { key: 'electric', label: 'Eléctrico', matches: isElectric },
  { key: 'hybrid', label: 'Híbrido', matches: isHybrid },
];

/** Etiqueta corta de carrocería para mostrar en tarjetas (ignora las de combustible). */
export function bodyTypeLabel(v: Pick<Vehicle, 'body_class' | 'fuel_type'>) {
  const type = VEHICLE_TYPES.find(
    (t) => t.key !== 'electric' && t.key !== 'hybrid' && t.matches(v)
  );
  return type?.label ?? v.body_class ?? null;
}

const FUEL_LABELS: [RegExp, string][] = [
  [/flex/i, 'Flex'],
  [/diesel/i, 'Diésel'],
  [/gasoline/i, 'Gasolina'],
  [/electric/i, 'Eléctrico'],
];

export function fuelLabel(v: Pick<Vehicle, 'fuel_type'>) {
  if (!v.fuel_type) return null;
  if (isHybrid(v)) return 'Híbrido';
  return FUEL_LABELS.find(([re]) => re.test(v.fuel_type!))?.[1] ?? v.fuel_type;
}
