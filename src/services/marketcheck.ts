/**
 * Cliente de MarketCheck para precios de mercado.
 *
 * El endpoint de predicción de MarketCheck requiere VIN; como en Gorieta navegamos por
 * año/marca/modelo, usamos las estadísticas de precio de los anuncios activos
 * (`/v2/search/car/active?stats=price`) para mostrar un rango de mercado.
 *
 * Nota: igual que con CarVector, mueve esto a una Edge Function antes de publicar.
 */
import type { PriceStats, Vehicle } from '@/types/vehicle';

const BASE_URL = 'https://api.marketcheck.com/v2';
const API_KEY = process.env.EXPO_PUBLIC_MARKETCHECK_API_KEY;

type ActiveSearchResponse = {
  num_found: number;
  stats?: { price?: PriceStats };
};

export async function getMarketPrice(
  vehicle: Pick<Vehicle, 'year' | 'make' | 'model'>
): Promise<PriceStats | null> {
  const url = new URL(`${BASE_URL}/search/car/active`);
  url.searchParams.set('api_key', API_KEY ?? '');
  url.searchParams.set('year', String(vehicle.year));
  url.searchParams.set('make', vehicle.make);
  url.searchParams.set('model', vehicle.model);
  url.searchParams.set('stats', 'price');
  url.searchParams.set('rows', '0');

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`MarketCheck ${res.status}: ${await res.text()}`);
  }
  const data = (await res.json()) as ActiveSearchResponse;
  const price = data.stats?.price;
  return price && price.count > 0 ? price : null;
}
