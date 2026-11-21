import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icon } from '@/components/ui/icon';
import { Radius, Spacing } from '@/constants/theme';
import { useElevation, useTheme } from '@/hooks/use-theme';
import { haptics } from '@/lib/haptics';

/** Acceso rápido a Búsqueda con forma de barra de búsqueda (en Inicio). */
export function SearchEntry() {
  const theme = useTheme();
  const elevation = useElevation();

  return (
    <Pressable
      accessibilityRole="search"
      accessibilityLabel="Buscar un vehículo"
      onPress={() => {
        haptics.tap();
        router.navigate('/search');
      }}
      style={({ pressed }) => [
        styles.bar,
        elevation,
        { backgroundColor: theme.backgroundElement },
        pressed && styles.pressed,
      ]}>
      <Icon name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }} color={theme.tint} />
      <ThemedText themeColor="textSecondary" numberOfLines={1} style={styles.text}>
        Busca un auto… ej. Toyota Corolla
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    minHeight: 52,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
  },
  text: {
    flex: 1,
  },
  pressed: {
    opacity: 0.8,
  },
});
