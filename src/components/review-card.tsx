import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { StarRating } from '@/components/star-rating';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { reviewPhotoUrl } from '@/services/review-photos';
import { vehicleName, type Review } from '@/types/vehicle';

type ReviewCardProps = {
  review: Review;
  /** Muestra el nombre del vehículo con enlace a su ficha (en listas generales). */
  showVehicle?: boolean;
};

const dateFormat = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' });

export function ReviewCard({ review, showVehicle }: ReviewCardProps) {
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
            <Image
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
    </ThemedView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
