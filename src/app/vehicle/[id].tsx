import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { ReviewCard } from '@/components/review-card';
import { Screen } from '@/components/screen';
import { Section } from '@/components/section';
import { StarRating } from '@/components/star-rating';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import {
  ImageWithSkeleton,
  ReviewCardSkeleton,
  Skeleton,
  SkeletonList,
  VehicleCardSkeleton,
  VehicleDetailSkeleton,
} from '@/components/ui/skeleton';
import { StateView } from '@/components/ui/state-view';
import { VehicleCard } from '@/components/vehicle-card';
import { Spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/use-async';
import { useAuth } from '@/hooks/use-auth';
import { useRefreshOnFocus } from '@/hooks/use-refresh-on-focus';
import { useTheme } from '@/hooks/use-theme';
import { haptics } from '@/lib/haptics';
import { getSimilarVehicles, getVehicle } from '@/services/carvector';
import { getMarketPrice } from '@/services/marketcheck';
import { getVehicleRating, getVehicleReviews } from '@/services/reviews';
import { isVehicleSaved, saveVehicle, unsaveVehicle } from '@/services/saved';
import { toSnapshot, vehicleName, type Vehicle } from '@/types/vehicle';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export default function VehicleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vehicle = useAsync(() => getVehicle(id), [id]);
  const { height: windowHeight } = useWindowDimensions();

  if (!vehicle.data) {
    if (vehicle.loading) {
      return (
        <Screen
          withTabBar={false}
          hero={<VehicleDetailSkeleton heroHeight={windowHeight / 3} />}
        />
      );
    }
    return (
      <Screen withTabBar={false}>
        <StateView error={vehicle.error} onRetry={vehicle.reload} />
      </Screen>
    );
  }

  return <VehicleDetail vehicle={vehicle.data} />;
}

function VehicleDetail({ vehicle }: { vehicle: Vehicle }) {
  const { user } = useAuth();
  const price = useAsync(() => getMarketPrice(vehicle), [vehicle.id]);
  const rating = useAsync(() => getVehicleRating(vehicle.id), [vehicle.id]);
  const reviews = useAsync(() => getVehicleReviews(vehicle.id), [vehicle.id]);
  const similar = useAsync(() => getSimilarVehicles(vehicle), [vehicle.id]);

  useRefreshOnFocus(rating.reload);
  useRefreshOnFocus(reviews.reload);

  const ownReview = user ? reviews.data?.find((r) => r.user_id === user.id) : undefined;

  return (
    <Screen withTabBar={false} hero={<HeroImage uri={vehicle.image_url} />}>
      <Stack.Screen options={{ title: `${vehicle.make} ${vehicle.model}` }} />

      <View style={styles.hero}>
        <ThemedText type="subtitle">{vehicleName(vehicle)}</ThemedText>
        {vehicle.trim && <ThemedText themeColor="textSecondary">{vehicle.trim}</ThemedText>}
        {rating.data && (
          <View style={styles.ratingRow}>
            <StarRating value={Number(rating.data.avg_rating)} size={20} />
            <ThemedText themeColor="textSecondary">
              {Number(rating.data.avg_rating).toFixed(1)} · {rating.data.review_count} reseñas
            </ThemedText>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <SaveButton vehicle={vehicle} />
        <Button
          style={styles.flex}
          title={ownReview ? 'Editar mi reseña' : 'Escribir reseña'}
          onPress={() =>
            ownReview
              ? router.push({
                  pathname: '/review/[id]',
                  params: { id: ownReview.id },
                })
              : // dismissTo regresa a las pestañas ya abiertas; navigate apilaría otra copia
                router.dismissTo({
                  pathname: '/contribute',
                  params: { vehicleId: vehicle.id },
                })
          }
        />
      </View>

      <Section title="Precio de mercado">
        <ThemedView type="backgroundElement" style={styles.panel}>
          {price.data ? (
            <>
              <ThemedText type="subtitle">{currency.format(price.data.median)}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Mediana de {price.data.count} anuncios activos · rango{' '}
                {currency.format(price.data.min)} – {currency.format(price.data.max)}
              </ThemedText>
            </>
          ) : (
            <StateView
              loading={price.loading}
              skeleton={
                <>
                  <Skeleton width="45%" height={28} />
                  <Skeleton width="80%" height={12} />
                </>
              }
              error={price.error}
              onRetry={price.reload}
              empty
              emptyText="No hay anuncios activos para calcular un precio."
            />
          )}
        </ThemedView>
      </Section>

      <Section title="Especificaciones">
        <ThemedView type="backgroundElement" style={styles.panel}>
          <Spec label="Motor" value={engineLabel(vehicle)} />
          <Spec label="Potencia" value={vehicle.horsepower && `${vehicle.horsepower} hp`} />
          <Spec label="Transmisión" value={vehicle.transmission} />
          <Spec label="Tracción" value={vehicle.drive_type} />
          <Spec label="Combustible" value={vehicle.fuel_type} />
          <Spec label="Carrocería" value={vehicle.body_class} />
          <Spec label="Puertas" value={vehicle.doors} />
        </ThemedView>
      </Section>

      <Section title="Fallas comunes">
        <ThemedView type="backgroundElement" style={styles.panel}>
          <Spec label="Quejas registradas" value={vehicle.complaint_count ?? 0} />
          <Spec label="Boletines técnicos" value={vehicle.tsb_count ?? 0} />
          <Spec label="Investigaciones" value={vehicle.investigation_count ?? 0} />
          <ThemedText type="small" themeColor="textSecondary">
            Próximamente: detalle de fallas comunes por modelo.
          </ThemedText>
        </ThemedView>
      </Section>

      <Section title="Autos similares">
        {similar.data && similar.data.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carousel}>
            {similar.data.map((v) => (
              <VehicleCard key={v.id} vehicle={toSnapshot(v)} compact />
            ))}
          </ScrollView>
        ) : (
          <StateView
            loading={similar.loading}
            skeleton={
              <View style={styles.carouselSkeleton}>
                <VehicleCardSkeleton compact />
                <VehicleCardSkeleton compact />
              </View>
            }
            error={similar.error}
            onRetry={similar.reload}
            empty
            emptyText="No encontramos otras versiones de este modelo."
          />
        )}
      </Section>

      <Section title="Reseñas">
        <StateView
          loading={reviews.loading && !reviews.data}
          skeleton={
            <SkeletonList count={2}>
              <ReviewCardSkeleton />
            </SkeletonList>
          }
          error={reviews.error}
          onRetry={reviews.reload}
          empty={reviews.data?.length === 0}
          emptyText="Este vehículo aún no tiene reseñas."
        />
        {reviews.data?.map((r) => (
          <ReviewCard
            key={r.id}
            review={r}
            onDeleted={() => {
              reviews.reload();
              rating.reload();
            }}
          />
        ))}
      </Section>
    </Screen>
  );
}

/**
 * Imagen a todo lo ancho, como máximo 1/3 de la altura de la pantalla. El último
 * cuarto se funde con el fondo mediante un degradado.
 */
function HeroImage({ uri }: { uri: Vehicle['image_url'] }) {
  const theme = useTheme();
  const { width, height: windowHeight } = useWindowDimensions();
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);

  const maxHeight = windowHeight / 3;
  const height = aspectRatio ? Math.min(width / aspectRatio, maxHeight) : maxHeight;

  return (
    <View style={{ height }}>
      <ImageWithSkeleton
        source={uri}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={200}
        onLoad={({ source }) => {
          if (source.width && source.height) setAspectRatio(source.width / source.height);
        }}
      />
      <LinearGradient
        colors={[`${theme.background}00`, theme.background]}
        style={styles.heroFade}
        pointerEvents="none"
      />
    </View>
  );
}

function SaveButton({ vehicle }: { vehicle: Vehicle }) {
  const { user } = useAuth();
  const saved = useAsync(() => isVehicleSaved(vehicle.id), [vehicle.id, user?.id], {
    enabled: !!user,
  });
  const [override, setOverride] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const isSaved = override ?? saved.data ?? false;

  async function toggle() {
    if (!user) {
      router.dismissTo('/profile');
      return;
    }
    if (isSaved) haptics.toggleOff();
    else haptics.toggleOn();
    setBusy(true);
    try {
      if (isSaved) await unsaveVehicle(vehicle.id);
      else await saveVehicle(user.id, toSnapshot(vehicle));
      setOverride(!isSaved);
    } catch {
      haptics.error();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button
      style={styles.flex}
      variant="secondary"
      title={isSaved ? 'Guardado ✓' : 'Guardar'}
      loading={busy || saved.loading}
      haptic={!user}
      onPress={toggle}
    />
  );
}

function Spec({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value == null || value === '') return null;
  return (
    <View style={styles.spec}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="smallBold">{value}</ThemedText>
    </View>
  );
}

function engineLabel(v: Vehicle) {
  const parts = [
    v.displacement_l && `${v.displacement_l} L`,
    v.cylinders && `${v.cylinders} cil.`,
  ].filter(Boolean);
  return parts.length ? parts.join(' · ') : null;
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: Spacing.one,
    paddingTop: Spacing.three,
  },
  heroFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '25%',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  flex: {
    flex: 1,
  },
  panel: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  spec: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  carousel: {
    gap: Spacing.two,
  },
  carouselSkeleton: {
    flexDirection: 'row',
    gap: Spacing.two,
    overflow: 'hidden',
  },
});
