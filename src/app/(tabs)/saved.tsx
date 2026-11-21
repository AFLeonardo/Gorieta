import { router } from 'expo-router';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { SkeletonList, VehicleCardSkeleton } from '@/components/ui/skeleton';
import { StateView } from '@/components/ui/state-view';
import { VehicleCard } from '@/components/vehicle-card';
import { useAsync } from '@/hooks/use-async';
import { useAuth } from '@/hooks/use-auth';
import { useRefreshOnFocus } from '@/hooks/use-refresh-on-focus';
import { useSavedVehicles } from '@/hooks/use-saved-vehicles';
import { getSavedVehicles } from '@/services/saved';

export default function SavedScreen() {
  const { user } = useAuth();
  const saved = useAsync(getSavedVehicles, [user?.id], { enabled: !!user });
  // Permite quitar (y volver a guardar) desde la lista; la tarjeta se queda hasta recargar
  const toggles = useSavedVehicles();

  useRefreshOnFocus(saved.reload);
  useRefreshOnFocus(toggles.reload);

  if (!user) {
    return (
      <Screen title="Guardados" subtitle="Los vehículos que te interesan, en un solo lugar.">
        <ThemedText themeColor="textSecondary">
          Inicia sesión para guardar vehículos y compararlos después.
        </ThemedText>
        <Button title="Iniciar sesión" onPress={() => router.navigate('/profile')} />
      </Screen>
    );
  }

  return (
    <Screen
      title="Guardados"
      subtitle="Los vehículos que te interesan, en un solo lugar."
      refreshing={saved.loading}
      onRefresh={saved.reload}>
      <StateView
        loading={saved.loading && !saved.data}
        skeleton={
          <SkeletonList count={3}>
            <VehicleCardSkeleton />
          </SkeletonList>
        }
        error={saved.error}
        onRetry={saved.reload}
        empty={saved.data?.length === 0}
        emptyIcon={{ ios: 'bookmark', android: 'bookmark_border', web: 'bookmark_border' }}
        emptyText="Aún no guardas vehículos. Usa el botón Guardar en la ficha de un vehículo."
      />
      {saved.data?.map((v) => (
        <VehicleCard
          key={v.vehicle_id}
          vehicle={v}
          saved={toggles.isSaved(v.vehicle_id)}
          onToggleSave={() => toggles.toggle(v)}
        />
      ))}
    </Screen>
  );
}
