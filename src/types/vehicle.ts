/** Vehículo tal como lo devuelve CarVector (`/v1/vehicles` y `/v1/vehicles/{id}`). */
export type Vehicle = {
  id: string;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  submodel: string | null;
  horsepower: number | null;
  cylinders: number | null;
  displacement_l: number | null;
  transmission: string | null;
  drive_type: string | null;
  fuel_type: string | null;
  body_class: string | null;
  doors: number | null;
  image_url: string | null;
  image_type: 'illustration' | null;
  complaint_count: number | null;
  tsb_count: number | null;
  investigation_count: number | null;
};

/** Datos mínimos de un vehículo que guardamos junto a reseñas y guardados. */
export type VehicleSnapshot = Pick<Vehicle, 'year' | 'make' | 'model' | 'trim' | 'image_url'> & {
  vehicle_id: string;
};

export type Review = VehicleSnapshot & {
  id: string;
  user_id: string;
  rating: number;
  title: string;
  body: string;
  pros: string | null;
  cons: string | null;
  mileage: number | null;
  created_at: string;
  profiles: { username: string | null } | null;
};

export type VehicleRating = VehicleSnapshot & {
  avg_rating: number;
  review_count: number;
};

export type PriceStats = {
  min: number;
  max: number;
  mean: number;
  median: number;
  count: number;
};

export function toSnapshot(vehicle: Vehicle): VehicleSnapshot {
  return {
    vehicle_id: vehicle.id,
    year: vehicle.year,
    make: vehicle.make,
    model: vehicle.model,
    trim: vehicle.trim,
    image_url: vehicle.image_url,
  };
}

export function vehicleName(v: Pick<Vehicle, 'year' | 'make' | 'model'>) {
  return `${v.year} ${v.make} ${v.model}`;
}
