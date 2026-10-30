/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://unistyl.es/), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0E1B33',
    background: '#EEF2F8',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#DDE5F2',
    textSecondary: '#5B6B85',
    tint: '#2F6FED',
    onTint: '#ffffff',
    star: '#F5A524',
    danger: '#D93036',
    border: '#D5DDEA',
  },
  dark: {
    text: '#F2F5FA',
    background: '#0A1222',
    backgroundElement: '#16213A',
    backgroundSelected: '#22304F',
    textSecondary: '#9AA8C2',
    tint: '#4C8DFF',
    onTint: '#ffffff',
    star: '#F5B83D',
    danger: '#FF6369',
    border: '#2A3858',
  },
} as const;

/** Degradados (sintaxis CSS para la prop de estilo `backgroundImage`). */
export const Gradients = {
  light: {
    screen: 'linear-gradient(180deg, #D6E2F5 0%, #EEF2F8 40%)',
    image: 'linear-gradient(160deg, #DCE7F7 0%, #F5F8FD 100%)',
    primary: 'linear-gradient(90deg, #2F6FED 0%, #4C8DFF 100%)',
  },
  dark: {
    screen: 'linear-gradient(180deg, #1C3260 0%, #0A1222 45%)',
    image: 'linear-gradient(160deg, #22365E 0%, #121D33 100%)',
    primary: 'linear-gradient(90deg, #2F6FED 0%, #4C8DFF 100%)',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
