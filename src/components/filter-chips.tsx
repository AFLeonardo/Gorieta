import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useGradients, useTheme } from '@/hooks/use-theme';
import { haptics } from '@/lib/haptics';

export type FilterChip = {
  key: string;
  label: string;
  count?: number;
};

type FilterChipsProps = {
  chips: FilterChip[];
  selected: string;
  onSelect: (key: string) => void;
};

/** Fila desplazable de filtros tipo píldora. */
export function FilterChips({ chips, selected, onSelect }: FilterChipsProps) {
  const theme = useTheme();
  const gradients = useGradients();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      // Deja que las píldoras lleguen al borde de la pantalla al desplazarse
      style={styles.scroll}
      contentContainerStyle={styles.row}>
      {chips.map((chip) => {
        const isSelected = chip.key === selected;
        const isEmpty = chip.count === 0;
        return (
          <Pressable
            key={chip.key}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            onPress={() => {
              if (!isSelected) haptics.selection();
              onSelect(chip.key);
            }}
            style={({ pressed }) => [
              styles.chip,
              isSelected
                ? { backgroundColor: theme.tint, backgroundImage: gradients.primary }
                : { backgroundColor: theme.backgroundElement },
              (pressed || (isEmpty && !isSelected)) && styles.dimmed,
            ]}>
            <ThemedText
              type="smallBold"
              style={{ color: isSelected ? theme.onTint : theme.text }}>
              {chip.label}
              {chip.count != null && (
                <ThemedText
                  type="small"
                  style={{ color: isSelected ? theme.onTint : theme.textSecondary }}>
                  {`  ${chip.count}`}
                </ThemedText>
              )}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    marginHorizontal: -Spacing.three,
    flexGrow: 0,
  },
  row: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  chip: {
    paddingHorizontal: Spacing.three + Spacing.one,
    paddingVertical: Spacing.two + Spacing.half,
    borderRadius: 999,
  },
  dimmed: {
    opacity: 0.5,
  },
});
