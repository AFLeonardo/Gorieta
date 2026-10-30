import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { StarRating } from '@/components/star-rating';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { vehicleName, type VehicleSnapshot } from '@/types/vehicle';

type VehicleCardProps = {
  vehicle: VehicleSnapshot;
  rating?: { avg: number; count: number };
  /** Posición en el Top (1, 2, 3…). */
  rank?: number;
  /** Variante compacta para carruseles horizontales. */
  compact?: boolean;
  /** Si se pasa, la tarjeta llama a esta función en vez de abrir la ficha del vehículo. */
  onPress?: () => void;
};

export function VehicleCard({ vehicle, rating, rank, compact, onPress }: VehicleCardProps) {
  const card = (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [compact && styles.compact, pressed && styles.pressed]}>
      <ThemedView
        type="backgroundElement"
        style={[styles.card, compact ? styles.cardColumn : styles.cardRow]}>
        <Image
          source={vehicle.image_url}
          style={compact ? styles.imageCompact : styles.image}
          contentFit="contain"
          transition={200}
        />
        <View style={styles.info}>
          <ThemedText type="smallBold" numberOfLines={2}>
            {rank ? `#${rank} · ` : ''}
            {vehicleName(vehicle)}
          </ThemedText>
          {vehicle.trim && (
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
              {vehicle.trim}
            </ThemedText>
          )}
          {rating && (
            <View style={styles.ratingRow}>
              <StarRating value={rating.avg} size={14} />
              <ThemedText type="small" themeColor="textSecondary">
                {rating.avg.toFixed(1)} ({rating.count})
              </ThemedText>
            </View>
          )}
        </View>
      </ThemedView>
    </Pressable>
  );

  if (onPress) return card;
  return (
    <Link href={`/vehicle/${vehicle.vehicle_id}`} asChild>
      {card}
    </Link>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.7,
  },
  compact: {
    width: 180,
  },
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.two,
    gap: Spacing.two,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardColumn: {
    flexDirection: 'column',
  },
  image: {
    width: 96,
    height: 64,
    borderRadius: Spacing.two,
  },
  imageCompact: {
    width: '100%',
    height: 100,
    borderRadius: Spacing.two,
  },
  info: {
    flex: 1,
    gap: Spacing.half,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
});
