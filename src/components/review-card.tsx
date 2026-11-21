import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { StarRating } from '@/components/star-rating';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { ImageWithSkeleton } from '@/components/ui/skeleton';
import { FontFamily, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useElevation, useTheme } from '@/hooks/use-theme';
import { confirmDestructive } from '@/lib/confirm';
import { haptics } from '@/lib/haptics';
import { useDensity } from '@/lib/preferences';
import { reviewPhotoUrl } from '@/services/review-photos';
import { deleteReview } from '@/services/reviews';
import type { Review } from '@/types/vehicle';

type ReviewCardProps = {
  review: Review;
  /** El nombre del vehículo enlaza a su ficha (en listas generales; en la ficha no hace falta). */
  showVehicle?: boolean;
  /** Se llama tras eliminar la reseña (para recargar la lista). */
  onDeleted?: () => void;
};

const dateFormat = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' });

export function ReviewCard({ review, showVehicle, onDeleted }: ReviewCardProps) {
  const { user } = useAuth();
  const theme = useTheme();
  const density = useDensity();
  const elevation = useElevation();
  const isOwn = !!user && user.id === review.user_id;
  const username = review.profiles?.username ?? 'Usuario';

  // Marca, modelo y año, en ese orden, con el naranja de las tarjetas del Top
  const vehicleTitle = (
    <ThemedText style={[styles.vehicle, { color: theme.accentSecondary }]} numberOfLines={2}>
      {review.make} {review.model} {review.year}
    </ThemedText>
  );

  return (
    <ThemedView
      type="backgroundElement"
      style={[
        styles.card,
        elevation,
        {
          padding: density.space(Spacing.three),
          gap: density.space(Spacing.two),
        },
      ]}>
      {showVehicle ? (
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={`Ver ${review.make} ${review.model} ${review.year}`}
          hitSlop={Spacing.one}
          onPress={() => {
            haptics.tap();
            router.push(`/vehicle/${review.vehicle_id}`);
          }}
          style={({ pressed }) => pressed && styles.pressed}>
          {vehicleTitle}
        </Pressable>
      ) : (
        vehicleTitle
      )}

      <View style={styles.ratingRow}>
        <StarRating value={review.rating} />
        <ThemedText type="smallBold">{review.rating.toFixed(1)}</ThemedText>
        {review.mileage != null && (
          <View style={[styles.pill, { backgroundColor: theme.backgroundSelected }]}>
            <Icon
              name={{ ios: 'gauge.with.dots.needle.33percent', android: 'speed', web: 'speed' }}
              size={13}
              color={theme.textSecondary}
            />
            <ThemedText type="small" themeColor="textSecondary">
              {review.mileage.toLocaleString('es-MX')} km
            </ThemedText>
          </View>
        )}
      </View>

      <ThemedText type="smallBold" style={styles.title}>
        {review.title}
      </ThemedText>
      <ThemedText type="small" style={styles.body}>
        {review.body}
      </ThemedText>
      {review.photos?.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.photos}>
          {review.photos.map((path) => (
            <ImageWithSkeleton
              key={path}
              source={reviewPhotoUrl(path)}
              style={styles.photo}
              contentFit="cover"
              transition={200}
              skeletonRadius={Spacing.two}
            />
          ))}
        </ScrollView>
      )}

      {review.pros && (
        <View style={styles.proCon}>
          <Icon
            name={{ ios: 'hand.thumbsup.fill', android: 'thumb_up', web: 'thumb_up' }}
            size={14}
            color={theme.tint}
          />
          <ThemedText type="small" style={styles.flex}>
            <ThemedText type="smallBold">Pros: </ThemedText>
            {review.pros}
          </ThemedText>
        </View>
      )}
      {review.cons && (
        <View style={styles.proCon}>
          <Icon
            name={{ ios: 'hand.thumbsdown.fill', android: 'thumb_down', web: 'thumb_down' }}
            size={14}
            color={theme.danger}
          />
          <ThemedText type="small" style={styles.flex}>
            <ThemedText type="smallBold">Contras: </ThemedText>
            {review.cons}
          </ThemedText>
        </View>
      )}

      {/* Firma: usuario · fecha de publicación */}
      <View style={[styles.signature, { borderTopColor: theme.border }]}>
        <View style={[styles.avatar, { backgroundColor: theme.accent }]}>
          <ThemedText type="smallBold" style={styles.avatarText}>
            {username.charAt(0).toUpperCase()}
          </ThemedText>
        </View>
        <ThemedText type="small" themeColor="textSecondary" style={styles.flex} numberOfLines={1}>
          {username} · {dateFormat.format(new Date(review.created_at))}
        </ThemedText>
      </View>

      {isOwn && <OwnerActions review={review} onDeleted={onDeleted} />}
    </ThemedView>
  );
}

/** Editar / eliminar, visibles solo para el autor de la reseña. */
function OwnerActions({ review, onDeleted }: { review: Review; onDeleted?: () => void }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    const ok = await confirmDestructive(
      '¿Eliminar reseña?',
      'Se borrarán también sus fotos. Esta acción no se puede deshacer.',
      'Eliminar'
    );
    if (!ok) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteReview(review);
      haptics.success();
      onDeleted?.();
    } catch (e) {
      haptics.error();
      setError(e instanceof Error ? e.message : 'No se pudo eliminar la reseña.');
      setDeleting(false);
    }
  }

  return (
    <>
      <View style={styles.actions}>
        <Button
          style={styles.flex}
          variant="secondary"
          title="Editar"
          icon={{ ios: 'pencil', android: 'edit', web: 'edit' }}
          disabled={deleting}
          onPress={() => router.push({ pathname: '/review/[id]', params: { id: review.id } })}
        />
        <Button
          style={styles.flex}
          variant="danger"
          title="Eliminar"
          icon={{ ios: 'trash', android: 'delete', web: 'delete' }}
          loading={deleting}
          onPress={remove}
        />
      </View>
      {error && (
        <ThemedText type="small" themeColor="danger">
          {error}
        </ThemedText>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.card,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  pressed: {
    opacity: 0.7,
  },
  vehicle: {
    fontFamily: FontFamily.heading,
    fontSize: 20,
    lineHeight: 26,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: 999,
    marginLeft: 'auto',
  },
  title: {
    fontSize: 16,
    lineHeight: 22,
  },
  body: {
    lineHeight: 20,
  },
  photos: {
    gap: Spacing.two,
  },
  photo: {
    width: 140,
    height: 105,
    borderRadius: Spacing.two,
  },
  proCon: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  signature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.two,
    marginTop: Spacing.one,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 16,
  },
  flex: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
});
