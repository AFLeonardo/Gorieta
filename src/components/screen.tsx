import { useFocusEffect } from "expo-router";
import {
  useCallback,
  useRef,
  useState,
  type PropsWithChildren,
  type ReactNode,
  type RefObject,
} from "react";
import {
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewInstance,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useDensity, useMotion } from "@/lib/preferences";

type ScreenProps = PropsWithChildren<{
  title?: string;
  subtitle?: string;
  headerRight?: ReactNode;
  /** false en pantallas fuera de las pestañas (no hay tab bar debajo). */
  withTabBar?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  /** Contenido a todo lo ancho, pegado arriba (sin márgenes). */
  hero?: ReactNode;
  /** Espacio extra al final para que una barra flotante no tape el último contenido. */
  bottomInset?: number;
}>;

/** Contenedor desplazable con márgenes seguros, usado por todas las pantallas. */
export function Screen({
  title,
  subtitle,
  headerRight,
  withTabBar = true,
  refreshing,
  onRefresh,
  hero,
  bottomInset = 0,
  children,
}: ScreenProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();
  const pullRefreshing = usePullRefreshing(refreshing);
  const riseStyle = useRiseOnFocus(withTabBar);
  const density = useDensity();
  const densityStyle = { gap: density.space(Spacing.four) };
  const scrollRef = useRef<ScrollViewInstance>(null);
  useResetScrollOnFocus(scrollRef, withTabBar);

  const paddingBottom =
    safeAreaInsets.bottom +
    (withTabBar ? BottomTabInset : 0) +
    Spacing.three +
    bottomInset;

  const contentPlatformStyle = Platform.select({
    web: {
      paddingTop: Spacing.six + Spacing.three,
      paddingBottom: Spacing.four + bottomInset,
    },
    default: {
      paddingTop: safeAreaInsets.top,
      paddingBottom,
    },
  });
  const heroStyle = hero ? { paddingTop: 0 } : null;

  return (
    <ScrollView
      ref={scrollRef}
      style={{
        flex: 1,
        backgroundColor: theme.background,
      }}
      contentInsetAdjustmentBehavior="never"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[contentPlatformStyle, heroStyle]}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={pullRefreshing.visible}
            onRefresh={() => {
              pullRefreshing.start();
              onRefresh();
            }}
          />
        ) : undefined
      }
    >
      {hero}
      <View style={styles.row}>
        <Animated.View style={[styles.container, densityStyle, riseStyle]}>
          {title && (
            <View style={styles.header}>
              <View style={styles.headerText}>
                <ThemedText type="title" themeColor="title" style={styles.title}>
                  {title}
                </ThemedText>
                {subtitle && (
                  <ThemedText themeColor="textSecondary">{subtitle}</ThemedText>
                )}
              </View>
              {headerRight}
            </View>
          )}
          {children}
        </Animated.View>
      </View>
    </ScrollView>
  );
}

/**
 * Indicador de pull-to-refresh solo cuando el usuario jala la pantalla.
 *
 * Antes se pasaba el `loading` de la pantalla directo al RefreshControl: en iOS eso mostraba
 * el indicador en cada carga automática (al abrir o al volver a la pestaña), empujando el
 * contenido hacia abajo. Ahora se muestra al jalar y se oculta cuando termina esa recarga.
 */
function usePullRefreshing(refreshing: boolean | undefined) {
  const [pull, setPull] = useState<{ sawLoading: boolean } | null>(null);

  // Ajuste de estado durante el render (patrón recomendado por React para reaccionar a props)
  if (pull && !pull.sawLoading && refreshing) setPull({ sawLoading: true });
  if (pull?.sawLoading && !refreshing) setPull(null);

  const start = useCallback(() => {
    setPull({ sawLoading: false });
    // Si los datos salieron de caché y nunca hubo carga, no dejes el indicador girando
    setTimeout(() => setPull((p) => (p && !p.sawLoading ? null : p)), 800);
  }, []);

  return { visible: pull !== null, start };
}

/** Cada pestaña vuelve a comenzar arriba al recuperar el foco. */
function useResetScrollOnFocus(
  scrollRef: RefObject<ScrollViewInstance | null>,
  enabled: boolean,
) {
  useFocusEffect(
    useCallback(() => {
      if (!enabled) return;
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, [enabled, scrollRef]),
  );
}

/**
 * Animación de entrada: el contenido sube y aparece cada vez que la pestaña toma el foco.
 * Distancia, duración y rebote dependen de la intensidad de movimiento elegida en Perfil
 * (ver lib/preferences.ts). Solo en pestañas: las pantallas apiladas ya tienen su propia
 * transición.
 */
function useRiseOnFocus(enabled: boolean) {
  const motion = useMotion();
  const offset = useSharedValue(0);
  const opacity = useSharedValue(1);
  const { riseOffset, riseDuration, riseBounce } = motion;
  const animate = enabled && motion.enabled;

  useFocusEffect(
    useCallback(() => {
      if (!animate) return;
      const timing = { duration: riseDuration, easing: Easing.out(Easing.cubic) };
      // Salta a la posición inicial (sin animar) y desde ahí sube; en "Intenso", con rebote
      const rise = riseBounce
        ? withSpring(0, { damping: 11, stiffness: 120, mass: 0.9 })
        : withTiming(0, timing);
      offset.set(withSequence(withTiming(riseOffset, { duration: 0 }), rise));
      opacity.set(withSequence(withTiming(0, { duration: 0 }), withTiming(1, timing)));
    }, [animate, riseOffset, riseDuration, riseBounce, offset, opacity]),
  );

  return useAnimatedStyle(() => ({
    opacity: opacity.get(),
    transform: [{ translateY: offset.get() }],
  }));
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
  },
  container: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
    flexShrink: 1,
    paddingHorizontal: Spacing.three,
    gap: Spacing.four,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingTop: Spacing.three,
  },
  headerText: {
    flex: 1,
  },
  // Título grande al estilo de las apps nativas: color puro (ver Colors.*.title) y letras
  // un poco más juntas, que a este tamaño se ven más firmes.
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: 800,
    letterSpacing: -0.8,
  },
});
