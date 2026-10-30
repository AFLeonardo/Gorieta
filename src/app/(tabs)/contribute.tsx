import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ReviewPhotoPicker } from '@/components/review-photo-picker';
import { Screen } from '@/components/screen';
import { Section } from '@/components/section';
import { StarRating } from '@/components/star-rating';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { StateView } from '@/components/ui/state-view';
import { TextField } from '@/components/ui/text-field';
import { VehicleCard } from '@/components/vehicle-card';
import { VehicleSearchForm } from '@/components/vehicle-search-form';
import { Spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/use-async';
import { useAuth } from '@/hooks/use-auth';
import { useKeepAwakeWhileFocused } from '@/hooks/use-keep-awake-while-focused';
import { haptics } from '@/lib/haptics';
import { getVehicle, searchVehicles, type VehicleQuery } from '@/services/carvector';
import type { LocalPhoto } from '@/services/review-photos';
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
        <ReviewForm
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

type ReviewFormProps = {
  userId: string;
  vehicle: VehicleSnapshot;
  onChangeVehicle: () => void;
};

function ReviewForm({ userId, vehicle, onChangeVehicle }: ReviewFormProps) {
  // Escribir una reseña larga (o tomar fotos) toma tiempo: que no se apague la pantalla
  useKeepAwakeWhileFocused('review-form');

  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [pros, setPros] = useState('');
  const [cons, setCons] = useState('');
  const [mileage, setMileage] = useState('');
  const [photos, setPhotos] = useState<LocalPhoto[]>([]);
  const [processingPhotos, setProcessingPhotos] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = rating > 0 && title.trim().length >= 3 && body.trim().length >= 10;

  async function submit() {
    if (!isValid) return;
    setSubmitting(true);
    setError(null);
    try {
      const parsedMileage = Number.parseInt(mileage, 10);
      await createReview(
        userId,
        {
          ...vehicle,
          rating,
          title: title.trim(),
          body: body.trim(),
          pros: pros.trim() || undefined,
          cons: cons.trim() || undefined,
          mileage: Number.isNaN(parsedMileage) ? undefined : parsedMileage,
        },
        photos
      );
      haptics.success();
      router.push(`/vehicle/${vehicle.vehicle_id}`);
      onChangeVehicle();
    } catch (e) {
      haptics.error();
      setError(e instanceof Error ? e.message : 'No se pudo publicar la reseña.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Section title="Vehículo">
        <VehicleCard vehicle={vehicle} onPress={onChangeVehicle} />
        <ThemedText type="small" themeColor="textSecondary">
          Toca la tarjeta para elegir otro vehículo.
        </ThemedText>
      </Section>

      <Section title="Tu calificación">
        <StarRating value={rating} size={36} onChange={setRating} />
      </Section>

      <View style={styles.fields}>
        <TextField
          label="Título"
          placeholder="Resume tu experiencia"
          value={title}
          onChangeText={setTitle}
          maxLength={120}
        />
        <TextField
          label="Reseña"
          placeholder="¿Cómo ha sido tenerlo? Consumo, confiabilidad, comodidad…"
          value={body}
          onChangeText={setBody}
          multiline
          maxLength={4000}
        />
        <TextField label="Pros (opcional)" value={pros} onChangeText={setPros} />
        <TextField label="Contras (opcional)" value={cons} onChangeText={setCons} />
        <TextField
          label="Kilometraje (opcional)"
          placeholder="Ej. 45000"
          value={mileage}
          onChangeText={setMileage}
          keyboardType="number-pad"
        />
      </View>

      <Section title="Fotos (opcional)">
        <ReviewPhotoPicker
          photos={photos}
          onChange={setPhotos}
          disabled={submitting}
          onProcessingChange={setProcessingPhotos}
        />
      </Section>

      {error && <ThemedText themeColor="danger">{error}</ThemedText>}
      <Button
        title={submitting && photos.length > 0 ? 'Subiendo fotos…' : 'Publicar reseña'}
        onPress={submit}
        disabled={!isValid || processingPhotos}
        loading={submitting}
      />
    </>
  );
}

const styles = StyleSheet.create({
  fields: {
    gap: Spacing.three,
  },
});
