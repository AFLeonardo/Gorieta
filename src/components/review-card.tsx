import { Link, router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { StarRating } from '@/components/star-rating';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { ImageWithSkeleton } from '@/components/ui/skeleton';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { confirmDestructive } from '@/lib/confirm';
import { haptics } from '@/lib/haptics';
import { reviewPhotoUrl } from '@/services/review-photos';
import { deleteReview } from '@/services/reviews';
import { vehicleName, type Review } from '@/types/vehicle';

type ReviewCardProps = {
  review: Review;
  /** Muestra el nombre del vehículo con enlace a su ficha (en listas generales). */
  showVehicle?: boolean;
  /** Se llama tras eliminar la reseña (para recargar la lista). */
  onDeleted?: () => void;
};

const dateFormat = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' });

export function ReviewCard({ review, showVehicle, onDeleted }: ReviewCardProps) {
  const { user } = useAuth();
  const isOwn = !!user && user.id === review.user_id;

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      {showVehicle && (
        <Link href={`/vehicle/${review.vehicle_id}`}>
          <ThemedText type="linkPrimary">{vehicleName(review)}</ThemedText>
        </Link>
      )}
      <View style={styles.header}>
        <StarRating value={review.rating} />
        <ThemedText type="small" themeColor="textSecondary">
          {dateFormat.format(new Date(review.created_at))}
        </ThemedText>
      </View>
      <ThemedText type="smallBold">{review.title}</ThemedText>
      <ThemedText type="small">{review.body}</ThemedText>
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
            />
          ))}
        </ScrollView>
      )}
      {review.pros && (
        <ThemedText type="small">
          <ThemedText type="smallBold">Pros: </ThemedText>
          {review.pros}
        </ThemedText>
      )}
      {review.cons && (
        <ThemedText type="small">
          <ThemedText type="smallBold">Contras: </ThemedText>
          {review.cons}
        </ThemedText>
      )}
      <ThemedText type="small" themeColor="textSecondary">
        {review.profiles?.username ?? 'Usuario'}
        {review.mileage != null ? ` · ${review.mileage.toLocaleString('es-MX')} km` : ''}
      </ThemedText>
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
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  photos: {
    gap: Spacing.two,
  },
  photo: {
    width: 140,
    height: 105,
    borderRadius: Spacing.two,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
