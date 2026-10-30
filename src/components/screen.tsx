import type { PropsWithChildren, ReactNode } from 'react';
import { Platform, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ScreenProps = PropsWithChildren<{
  title?: string;
  subtitle?: string;
  headerRight?: ReactNode;
  /** false en pantallas fuera de las pestañas (no hay tab bar debajo). */
  withTabBar?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}>;

/** Contenedor desplazable con márgenes seguros, usado por todas las pantallas. */
export function Screen({
  title,
  subtitle,
  headerRight,
  withTabBar = true,
  refreshing,
  onRefresh,
  children,
}: ScreenProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + (withTabBar ? BottomTabInset : 0) + Spacing.three,
  };

  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
    },
    web: {
      paddingTop: Spacing.six + Spacing.three,
      paddingBottom: Spacing.four,
    },
  });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentInset={insets}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} />
        ) : undefined
      }>
      <View style={styles.container}>
        {title && (
          <View style={styles.header}>
            <View style={styles.headerText}>
              <ThemedText type="subtitle">{title}</ThemedText>
              {subtitle && <ThemedText themeColor="textSecondary">{subtitle}</ThemedText>}
            </View>
            {headerRight}
          </View>
        )}
        {children}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  container: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
    flexShrink: 1,
    paddingHorizontal: Spacing.three,
    gap: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingTop: Spacing.three,
  },
  headerText: {
    flex: 1,
  },
});
