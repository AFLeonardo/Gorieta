import { SymbolView, type SymbolViewProps } from 'expo-symbols';

import { useTheme } from '@/hooks/use-theme';

type IconProps = {
  /** SF Symbol (iOS) y Material Symbol (Android y web). */
  name: SymbolViewProps['name'];
  size?: number;
  color?: string;
};

export function Icon({ name, size = 20, color }: IconProps) {
  const theme = useTheme();
  return <SymbolView name={name} size={size} tintColor={color ?? theme.text} />;
}
