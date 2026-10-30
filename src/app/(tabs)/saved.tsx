import { router } from 'expo-router';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { StateView } from '@/components/ui/state-view';
import { VehicleCard } from '@/components/vehicle-card';
import { useAsync } from '@/hooks/use-async';
import { useAuth } from '@/hooks/use-auth';
import { useRefreshOnFocus } from '@/hooks/use-refresh-on-focus';
import { getSavedVehicles } from '@/services/saved';

export default function SavedScreen() {
  const { user } = useAuth();
  const saved = useAsync(getSavedVehicles, [user?.id], { enabled: !!user });

  useRefreshOnFocus(saved.reload);

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
        error={saved.error}
        onRetry={saved.reload}
        empty={saved.data?.length === 0}
        emptyText="Aún no guardas vehículos. Usa el botón Guardar en la ficha de un vehículo."
      />
      {saved.data?.map((v) => <VehicleCard key={v.vehicle_id} vehicle={v} />)}
    </Screen>
  );
}
