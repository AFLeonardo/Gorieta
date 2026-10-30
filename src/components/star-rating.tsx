import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type StarRatingProps = {
  value: number;
  size?: number;
  /** Si se pasa, las estrellas son seleccionables. */
  onChange?: (value: number) => void;
};

export function StarRating({ value, size = 16, onChange }: StarRatingProps) {
  const theme = useTheme();
  const rounded = Math.round(value);

  return (
    <View style={styles.row} accessibilityLabel={`${value} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const star = (
          <ThemedText
            style={{
              fontSize: size,
              lineHeight: size * 1.25,
              color: n <= rounded ? theme.star : theme.border,
            }}>
            ★
          </ThemedText>
        );
        return onChange ? (
          <Pressable
            key={n}
            hitSlop={Spacing.one}
            accessibilityRole="button"
            accessibilityLabel={`${n} estrellas`}
            onPress={() => onChange(n)}>
            {star}
          </Pressable>
        ) : (
          <View key={n}>{star}</View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.half,
  },
});
