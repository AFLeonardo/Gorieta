import type { PropsWithChildren, ReactNode } from "react";
import {
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
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
          <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} />
        ) : undefined
      }
    >
      {hero}
      <View style={styles.row}>
        <View style={styles.container}>
          {title && (
            <View style={styles.header}>
              <View style={styles.headerText}>
                <ThemedText type="title" style={styles.title}>
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
        </View>
      </View>
    </ScrollView>
  );
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
  title: {
    fontSize: 40,
    lineHeight: 44,
    fontWeight: 800,
  },
});
