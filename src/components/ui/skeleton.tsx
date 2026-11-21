import { Image, type ImageProps } from 'expo-image';
import { useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type SkeletonProps = {
  width?: DimensionValue;
  height?: DimensionValue;
  radius?: number;
  /** Color base; por defecto `backgroundSelected` (contrasta con las tarjetas). */
  color?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * Bloque gris que "respira" mientras carga el contenido real. Con "Reducir movimiento"
 * activado en el sistema se queda estático.
 */
export function Skeleton({
  width = '100%',
  height = 16,
  radius = Spacing.two,
  color,
  style,
}: SkeletonProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) return;
    opacity.value = withRepeat(
      withTiming(0.45, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [opacity, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        { width, height, borderRadius: radius, backgroundColor: color ?? theme.backgroundSelected },
        animatedStyle,
        style,
      ]}
    />
  );
}

/**
 * `expo-image` con un skeleton debajo que desaparece cuando la imagen termina de cargar
 * (o falla). Acepta las mismas props que `Image`.
 */
export function ImageWithSkeleton({
  style,
  onLoad,
  onError,
  skeletonRadius = 0,
  skeletonColor,
  ...props
}: ImageProps & { skeletonRadius?: number; skeletonColor?: string }) {
  const [loaded, setLoaded] = useState(false);
  const hasSource = props.source != null && props.source !== '';

  return (
    <View style={[style as StyleProp<ViewStyle>, styles.imageWrap]}>
      {hasSource && !loaded && (
        <Skeleton
          height="100%"
          radius={skeletonRadius}
          color={skeletonColor}
          style={StyleSheet.absoluteFill}
        />
      )}
      <Image
        {...props}
        style={StyleSheet.absoluteFill}
        onLoad={(e) => {
          setLoaded(true);
          onLoad?.(e);
        }}
        onError={(e) => {
          setLoaded(true);
          onError?.(e);
        }}
      />
    </View>
  );
}

// ───────────── Plantillas con la forma de cada componente ─────────────

/** Repite un skeleton `count` veces (listas). */
export function SkeletonList({ count = 3, children }: { count?: number; children: ReactNode }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <View key={i}>{children}</View>
      ))}
    </>
  );
}

/** Forma de `VehicleCard`: foto completa con el texto abajo. */
export function VehicleCardSkeleton({ compact }: { compact?: boolean }) {
  return (
    <ThemedView
      type="backgroundElement"
      style={[styles.vehicleCard, compact ? styles.vehicleCardCompact : styles.vehicleCardRegular]}>
      <Skeleton width="30%" height={12} />
      <Skeleton width="65%" height={22} />
      <Skeleton width="40%" height={14} />
    </ThemedView>
  );
}

/** Forma de `VehicleShowcaseCard`: imagen, títulos, tres datos y dos botones. */
export function ShowcaseCardSkeleton() {
  return (
    <ThemedView type="backgroundElement" style={styles.showcase}>
      <Skeleton height={200} radius={Spacing.four} />
      <View style={styles.showcaseBody}>
        <Skeleton width="30%" height={14} />
        <Skeleton width="70%" height={30} />
      </View>
      <View style={styles.row}>
        <Skeleton height={56} style={styles.flex} />
        <Skeleton height={56} style={styles.flex} />
        <Skeleton height={56} style={styles.flex} />
      </View>
      <View style={styles.row}>
        <Skeleton height={48} radius={999} style={styles.flex} />
        <Skeleton height={48} radius={999} style={styles.flex} />
      </View>
    </ThemedView>
  );
}

/** Forma de `ReviewCard`. */
export function ReviewCardSkeleton() {
  return (
    <ThemedView type="backgroundElement" style={styles.panel}>
      <View style={styles.spaceBetween}>
        <Skeleton width={96} height={16} />
        <Skeleton width={72} height={12} />
      </View>
      <Skeleton width="55%" height={16} />
      <Skeleton height={12} />
      <Skeleton width="85%" height={12} />
      <Skeleton width="35%" height={12} />
    </ThemedView>
  );
}

/** Panel con filas etiqueta / valor (precio, especificaciones). */
export function PanelSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <ThemedView type="backgroundElement" style={styles.panel}>
      {Array.from({ length: rows }, (_, i) => (
        <View key={i} style={styles.spaceBetween}>
          <Skeleton width="35%" height={14} />
          <Skeleton width="25%" height={14} />
        </View>
      ))}
    </ThemedView>
  );
}

/** Ficha del vehículo mientras llega de CarVector. */
export function VehicleDetailSkeleton({ heroHeight }: { heroHeight: number }) {
  return (
    <View style={styles.detail}>
      <Skeleton height={heroHeight} radius={0} />
      <View style={styles.detailBody}>
        <View style={styles.detailTitle}>
          <Skeleton width="70%" height={26} />
          <Skeleton width="40%" height={16} />
        </View>
        <View style={styles.row}>
          <Skeleton height={48} radius={999} style={styles.flex} />
          <Skeleton height={48} radius={999} style={styles.flex} />
        </View>
        <PanelSkeleton rows={2} />
        <PanelSkeleton rows={5} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  imageWrap: {
    overflow: 'hidden',
  },
  flex: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vehicleCard: {
    borderRadius: Spacing.three,
    justifyContent: 'flex-end',
    padding: Spacing.three,
    gap: Spacing.two,
  },
  vehicleCardRegular: {
    height: 260,
  },
  vehicleCardCompact: {
    width: 220,
    height: 250,
  },
  showcase: {
    borderRadius: Spacing.five,
    padding: Spacing.two,
    paddingBottom: Spacing.three,
    gap: Spacing.three,
  },
  showcaseBody: {
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  panel: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  detail: {
    gap: Spacing.four,
  },
  detailBody: {
    paddingHorizontal: Spacing.three,
    gap: Spacing.four,
  },
  detailTitle: {
    alignItems: 'center',
    gap: Spacing.two,
  },
});
