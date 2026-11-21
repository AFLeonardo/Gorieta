import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type IconName = React.ComponentProps<typeof Icon>['name'];

const EMPTY_ICON: IconName = { ios: 'tray', android: 'inbox', web: 'inbox' };
const ERROR_ICON: IconName = {
  ios: 'exclamationmark.triangle',
  android: 'error',
  web: 'error',
};

type StateViewProps = {
  loading?: boolean;
  error?: Error | null;
  empty?: boolean;
  emptyText?: string;
  onRetry?: () => void;
  /** Se muestra en lugar del indicador de carga (ver components/ui/skeleton.tsx). */
  skeleton?: ReactNode;
  /** Ícono del estado vacío (por defecto, una bandeja). */
  emptyIcon?: IconName;
};

/**
 * Muestra carga, error o vacío. Devuelve null si ninguno aplica,
 * para que la pantalla renderice su contenido normal.
 */
export function StateView({
  loading,
  error,
  empty,
  emptyText,
  onRetry,
  skeleton,
  emptyIcon = EMPTY_ICON,
}: StateViewProps) {
  const theme = useTheme();
  const badge = (name: IconName, color: string) => (
    <View style={[styles.badge, { backgroundColor: theme.backgroundSelected }]}>
      <Icon name={name} size={26} color={color} />
    </View>
  );

  if (loading && skeleton) return <>{skeleton}</>;
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.container}>
        {badge(ERROR_ICON, theme.danger)}
        <ThemedText themeColor="danger" style={styles.text}>
          {error.message}
        </ThemedText>
        {onRetry && <Button title="Reintentar" variant="secondary" onPress={onRetry} />}
      </View>
    );
  }
  if (empty) {
    return (
      <View style={styles.container}>
        {badge(emptyIcon, theme.textSecondary)}
        <ThemedText themeColor="textSecondary" style={styles.text}>
          {emptyText}
        </ThemedText>
      </View>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.five,
  },
  text: {
    textAlign: 'center',
    maxWidth: 320,
  },
  badge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
