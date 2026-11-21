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
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { useGradients, useTheme } from "@/hooks/use-theme";

type ScreenProps = PropsWithChildren<{
  title?: string;
  subtitle?: string;
  headerRight?: ReactNode;
  /** false en pantallas fuera de las pestañas (no hay tab bar debajo). */
  withTabBar?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  /** Contenido a todo lo ancho, pegado arriba (sin márgenes). Desactiva el degradado del fondo. */
  hero?: ReactNode;
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
  children,
}: ScreenProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();
  const gradients = useGradients();
  const pullRefreshing = usePullRefreshing(refreshing);
  const riseStyle = useRiseOnFocus(withTabBar);
  const scrollRef = useRef<ScrollViewInstance>(null);
  useResetScrollOnFocus(scrollRef, withTabBar);

  const paddingBottom =
    safeAreaInsets.bottom + (withTabBar ? BottomTabInset : 0) + Spacing.three;

  const contentPlatformStyle = Platform.select({
    web: {
      paddingTop: Spacing.six + Spacing.three,
      paddingBottom: Spacing.four,
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
        backgroundImage: hero ? undefined : gradients.screen,
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
        <Animated.View style={[styles.container, riseStyle]}>
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
 * Animación de entrada: el contenido sube un poco y aparece cada vez que la pestaña toma
 * el foco. Solo en pestañas (las pantallas apiladas ya tienen su propia transición) y
 * nunca con "Reducir movimiento" activado.
 */
function useRiseOnFocus(enabled: boolean) {
  const reduceMotion = useReducedMotion();
  const offset = useSharedValue(0);
  const opacity = useSharedValue(1);

  useFocusEffect(
    useCallback(() => {
      if (!enabled || reduceMotion) return;
      const timing = { duration: 380, easing: Easing.out(Easing.cubic) };
      // Salta a la posición inicial (sin animar) y desde ahí sube
      offset.set(withSequence(withTiming(28, { duration: 0 }), withTiming(0, timing)));
      opacity.set(withSequence(withTiming(0, { duration: 0 }), withTiming(1, timing)));
    }, [enabled, reduceMotion, offset, opacity]),
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
    fontSize: 40,
    lineHeight: 44,
    fontWeight: 800,
    letterSpacing: -0.8,
  },
});
