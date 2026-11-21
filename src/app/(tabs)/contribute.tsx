import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { ReviewForm } from '@/components/review-form';
import { Screen } from '@/components/screen';
import { Section } from '@/components/section';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { StateView } from '@/components/ui/state-view';
import { VehicleCard } from '@/components/vehicle-card';
import { VehicleSearchForm } from '@/components/vehicle-search-form';
import { useAsync } from '@/hooks/use-async';
import { useAuth } from '@/hooks/use-auth';
import { getVehicle, searchVehicles, type VehicleQuery } from '@/services/carvector';
import { createReview } from '@/services/reviews';
import { toSnapshot, type VehicleSnapshot } from '@/types/vehicle';

export default function ContributeScreen() {
  const { user } = useAuth();
  const { vehicleId } = useLocalSearchParams<{ vehicleId?: string }>();

  // Vehículo preseleccionado al llegar desde la ficha (/contribute?vehicleId=…)
  const preselected = useAsync(() => getVehicle(vehicleId!), [vehicleId], {
    enabled: !!vehicleId,
  });
  const [picked, setPicked] = useState<VehicleSnapshot | null>(null);
  const vehicle = picked ?? (preselected.data ? toSnapshot(preselected.data) : null);

  if (!user) {
    return (
      <Screen title="Contribuir" subtitle="Comparte tu experiencia con un vehículo.">
        <ThemedText themeColor="textSecondary">
          Inicia sesión para escribir reseñas y ayudar a otros a decidir.
        </ThemedText>
        <Button title="Iniciar sesión" onPress={() => router.navigate('/profile')} />
      </Screen>
    );
  }

  return (
    <Screen title="Contribuir" subtitle="Comparte tu experiencia con un vehículo.">
      {vehicle ? (
        <ContributeForm
          userId={user.id}
          vehicle={vehicle}
          onChangeVehicle={() => {
            setPicked(null);
            router.setParams({ vehicleId: undefined });
          }}
        />
      ) : vehicleId && preselected.loading ? (
        <StateView loading />
      ) : (
        <VehiclePicker onPick={setPicked} />
      )}
    </Screen>
  );
}

function VehiclePicker({ onPick }: { onPick: (v: VehicleSnapshot) => void }) {
  const [query, setQuery] = useState<VehicleQuery | null>(null);
  const results = useAsync(() => searchVehicles({ ...query, limit: 30 }), [query], {
    enabled: query !== null,
  });

  return (
    <>
      <Section title="1. Elige el vehículo">
        <VehicleSearchForm onSearch={setQuery} loading={results.loading} />
      </Section>
      <StateView
        error={results.error}
        onRetry={results.reload}
        empty={results.data?.results.length === 0}
        emptyText="No encontramos vehículos con esos datos."
      />
      {results.data?.results.map((v) => {
        const snapshot = toSnapshot(v);
        return <VehicleCard key={v.id} vehicle={snapshot} onPress={() => onPick(snapshot)} />;
      })}
    </>
  );
}

type ContributeFormProps = {
  userId: string;
  vehicle: VehicleSnapshot;
  onChangeVehicle: () => void;
};

function ContributeForm({ userId, vehicle, onChangeVehicle }: ContributeFormProps) {
  return (
    <>
      <Section title="Vehículo">
        <VehicleCard vehicle={vehicle} onPress={onChangeVehicle} />
        <ThemedText type="small" themeColor="textSecondary">
          Toca la tarjeta para elegir otro vehículo.
        </ThemedText>
      </Section>

      <ReviewForm
        submitLabel="Publicar reseña"
        errorMessage="No se pudo publicar la reseña."
        onSubmit={async (content, photos) => {
          await createReview(userId, { ...vehicle, ...content }, photos);
          router.push(`/vehicle/${vehicle.vehicle_id}`);
          onChangeVehicle();
        }}
      />
    </>
  );
}
