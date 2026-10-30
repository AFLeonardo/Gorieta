import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type SearchBarProps = Omit<TextInputProps, 'onChangeText' | 'onSubmitEditing'> & {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
};

/** Barra de búsqueda tipo píldora con botón para limpiar. */
export function SearchBar({ value, onChangeText, onSubmit, style, ...rest }: SearchBarProps) {
  const theme = useTheme();

  return (
    <View style={[styles.bar, { backgroundColor: theme.backgroundElement }, style]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        autoCorrect={false}
        placeholderTextColor={theme.textSecondary}
        style={[styles.input, { color: theme.text }]}
        {...rest}
      />
      {value.length > 0 && (
        <Pressable
          accessibilityLabel="Limpiar búsqueda"
          hitSlop={Spacing.two}
          onPress={() => onChangeText('')}>
          <Icon
            name={{ ios: 'xmark.circle.fill', android: 'cancel', web: 'cancel' }}
            size={18}
            color={theme.textSecondary}
          />
        </Pressable>
      )}
      <Pressable accessibilityLabel="Buscar" hitSlop={Spacing.two} onPress={onSubmit}>
        <Icon
          name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
          size={22}
          color={theme.textSecondary}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    minHeight: 56,
    paddingLeft: Spacing.four,
    paddingRight: Spacing.three,
    borderRadius: 999,
  },
  input: {
    flex: 1,
    fontSize: 17,
    paddingVertical: Spacing.three,
  },
});
