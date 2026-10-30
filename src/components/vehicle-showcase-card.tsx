import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Spacing } from '@/constants/theme';
import { bodyTypeLabel, fuelLabel } from '@/constants/vehicle-types';
import { useGradients, useTheme } from '@/hooks/use-theme';
import type { Vehicle } from '@/types/vehicle';

type VehicleShowcaseCardProps = {
  vehicle: Vehicle;
  saved: boolean;
  saving?: boolean;
  onToggleSave: () => void;
};

/** Tarjeta grande de resultado: imagen, marca, modelo, datos clave y acciones. */
export function VehicleShowcaseCard({
  vehicle,
  saved,
  saving,
  onToggleSave,
}: VehicleShowcaseCardProps) {
  const theme = useTheme();
  const gradients = useGradients();
  const type = bodyTypeLabel(vehicle);
  const openDetails = () => router.push(`/vehicle/${vehicle.id}`);

  const stats = [
    {
      icon: { ios: 'bolt.fill', android: 'bolt', web: 'bolt' },
      value: vehicle.horsepower ? `${vehicle.horsepower} hp` : null,
      label: 'Potencia',
    },
    {
      icon: { ios: 'gauge.with.dots.needle.67percent', android: 'speed', web: 'speed' },
      value: engineLabel(vehicle),
      label: 'Motor',
    },
    {
      icon: { ios: 'fuelpump.fill', android: 'local_gas_station', web: 'local_gas_station' },
      value: fuelLabel(vehicle),
      label: 'Combustible',
    },
  ] as const;

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`Ver ${vehicle.year} ${vehicle.make} ${vehicle.model}`}
        onPress={openDetails}
        style={({ pressed }) => pressed && styles.pressed}>
        <View style={[styles.imageWrap, { backgroundImage: gradients.image }]}>
          <Image
            source={vehicle.image_url}
            style={styles.image}
            contentFit="contain"
            transition={200}
          />
          {type && (
            <View style={[styles.badge, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText type="smallBold">{type}</ThemedText>
            </View>
          )}
          <View style={[styles.badge, styles.yearBadge, { backgroundColor: theme.tint }]}>
            <ThemedText type="smallBold" style={{ color: theme.onTint }}>
              {vehicle.year}
            </ThemedText>
          </View>
        </View>

        <View style={styles.body}>
          <ThemedText type="smallBold" themeColor="tint">
            {vehicle.make}
          </ThemedText>
          <ThemedText style={styles.model} numberOfLines={2}>
            {vehicle.model}
          </ThemedText>
          {vehicle.trim && (
            <ThemedText themeColor="textSecondary" numberOfLines={2}>
              {vehicle.trim}
            </ThemedText>
          )}
        </View>
      </Pressable>

      <View style={styles.stats}>
        {stats.map((stat, i) => (
          <View
            key={stat.label}
            style={[styles.stat, i > 0 && { borderLeftWidth: 1, borderLeftColor: theme.border }]}>
            <Icon name={stat.icon} size={22} color={theme.text} />
            <ThemedText type="smallBold" numberOfLines={1}>
              {stat.value ?? '—'}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {stat.label}
            </ThemedText>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <Button
          style={styles.flex}
          variant="secondary"
          title="Ver detalles"
          onPress={openDetails}
        />
        <Button
          style={styles.flex}
          title={saved ? 'Guardado' : 'Guardar'}
          icon={
            saved
              ? { ios: 'bookmark.fill', android: 'bookmark', web: 'bookmark' }
              : { ios: 'bookmark', android: 'bookmark_border', web: 'bookmark_border' }
          }
          loading={saving}
          onPress={onToggleSave}
        />
      </View>
    </ThemedView>
  );
}

function engineLabel(v: Vehicle) {
  if (v.displacement_l) return `${v.displacement_l} L`;
  if (v.cylinders) return `${v.cylinders} cil.`;
  return null;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.five,
    overflow: 'hidden',
    paddingBottom: Spacing.three,
    gap: Spacing.three,
  },
  pressed: {
    opacity: 0.8,
  },
  imageWrap: {
    height: 200,
    margin: Spacing.two,
    borderRadius: Spacing.four,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '85%',
  },
  badge: {
    position: 'absolute',
    top: Spacing.three,
    left: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 999,
  },
  yearBadge: {
    left: undefined,
    right: Spacing.three,
  },
  body: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.one,
    gap: Spacing.half,
  },
  model: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: 800,
  },
  stats: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.three,
  },
  stat: {
    flex: 1,
    gap: Spacing.half,
    paddingHorizontal: Spacing.two,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  flex: {
    flex: 1,
  },
});
