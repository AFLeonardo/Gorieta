import { supabase } from '@/lib/supabase';
import type { VehicleSnapshot } from '@/types/vehicle';

export async function getSavedVehicles() {
  const { data, error } = await supabase
    .from('saved_vehicles')
    .select('vehicle_id, year, make, model, trim, image_url')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as VehicleSnapshot[];
}

export async function isVehicleSaved(vehicleId: string) {
  const { count, error } = await supabase
    .from('saved_vehicles')
    .select('vehicle_id', { count: 'exact', head: true })
    .eq('vehicle_id', vehicleId);
  if (error) throw error;
  return (count ?? 0) > 0;
}

export async function saveVehicle(userId: string, vehicle: VehicleSnapshot) {
  const { error } = await supabase.from('saved_vehicles').insert({ ...vehicle, user_id: userId });
  if (error) throw error;
}

export async function unsaveVehicle(vehicleId: string) {
  const { error } = await supabase.from('saved_vehicles').delete().eq('vehicle_id', vehicleId);
  if (error) throw error;
}
