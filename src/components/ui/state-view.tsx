import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';

type StateViewProps = {
  loading?: boolean;
  error?: Error | null;
  empty?: boolean;
  emptyText?: string;
  onRetry?: () => void;
};

/**
 * Muestra carga, error o vacío. Devuelve null si ninguno aplica,
 * para que la pantalla renderice su contenido normal.
 */
export function StateView({ loading, error, empty, emptyText, onRetry }: StateViewProps) {
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
  },
});
