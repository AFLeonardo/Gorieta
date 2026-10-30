import { ActivityIndicator, Pressable, StyleSheet, type PressableProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icon } from '@/components/ui/icon';
import { Spacing } from '@/constants/theme';
import { useGradients, useTheme } from '@/hooks/use-theme';
import { haptics } from '@/lib/haptics';

type ButtonProps = Omit<PressableProps, 'children'> & {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: React.ComponentProps<typeof Icon>['name'];
  loading?: boolean;
  /** Vibración al tocar. `false` cuando la pantalla da su propia respuesta háptica. */
  haptic?: boolean;
};

export function Button({
  title,
  variant = 'primary',
  icon,
  loading,
  haptic = true,
  disabled,
  style,
  onPress,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const gradients = useGradients();
  const background = {
    primary: { backgroundColor: theme.tint, backgroundImage: gradients.primary },
    secondary: { backgroundColor: theme.backgroundSelected },
    danger: { backgroundColor: theme.backgroundSelected },
  }[variant];
  const color = { primary: theme.onTint, secondary: theme.text, danger: theme.danger }[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={(e) => {
        if (haptic) haptics.tap();
        onPress?.(e);
      }}
      style={(state) => [
        styles.button,
        background,
        (state.pressed || isDisabled) && styles.dimmed,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <>
          {icon && <Icon name={icon} size={18} color={color} />}
          <ThemedText type="smallBold" style={{ color }}>
            {title}
          </ThemedText>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    paddingHorizontal: Spacing.four,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  dimmed: {
    opacity: 0.6,
  },
});
