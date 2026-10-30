import { router } from 'expo-router';
import { useCallback, useState } from 'react';

import { useAsync } from '@/hooks/use-async';
import { useAuth } from '@/hooks/use-auth';
import { getSavedVehicles, saveVehicle, unsaveVehicle } from '@/services/saved';
import type { VehicleSnapshot } from '@/types/vehicle';

/** Estado de guardados para listas: qué vehículos están guardados y cómo alternarlos. */
export function useSavedVehicles() {
  const { user } = useAuth();
  const saved = useAsync(getSavedVehicles, [user?.id], { enabled: !!user });
  // Cambios locales que aún no se reflejan en `saved.data`
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [pendingId, setPendingId] = useState<string | null>(null);

  const isSaved = (vehicleId: string) =>
    overrides[vehicleId] ?? saved.data?.some((v) => v.vehicle_id === vehicleId) ?? false;

  async function toggle(vehicle: VehicleSnapshot) {
    if (!user) {
      router.navigate('/profile');
      return;
    }
    const wasSaved = isSaved(vehicle.vehicle_id);
    setPendingId(vehicle.vehicle_id);
    try {
      if (wasSaved) await unsaveVehicle(vehicle.vehicle_id);
      else await saveVehicle(user.id, vehicle);
      setOverrides((o) => ({ ...o, [vehicle.vehicle_id]: !wasSaved }));
    } finally {
      setPendingId(null);
    }
  }

  const { reload: reloadSaved } = saved;
  const reload = useCallback(() => {
    setOverrides({});
    reloadSaved();
  }, [reloadSaved]);

  return { isSaved, toggle, pendingId, reload };
}
