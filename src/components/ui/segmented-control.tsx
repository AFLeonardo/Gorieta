import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useGradients, useTheme } from '@/hooks/use-theme';
import { haptics } from '@/lib/haptics';

type Option<T extends string> = { value: T; label: string };

type SegmentedControlProps<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
};

/** Selector de una opción entre pocas, con el estilo de los filtros (píldora azul marino). */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: SegmentedControlProps<T>) {
  const theme = useTheme();
  const gradients = useGradients();

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      style={[styles.track, { backgroundColor: theme.backgroundSelected }]}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            onPress={() => {
              if (selected) return;
              haptics.selection();
              onChange(option.value);
            }}
            style={[
              styles.segment,
              selected && { backgroundColor: theme.tint, backgroundImage: gradients.primary },
            ]}>
            <ThemedText
              type="smallBold"
              numberOfLines={1}
              style={[styles.label, { color: selected ? theme.onTint : theme.textSecondary }]}>
              {option.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderRadius: 999,
    padding: Spacing.half,
  },
  segment: {
    flex: 1,
    minHeight: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.one,
  },
  label: {
    fontSize: 13,
  },
});
