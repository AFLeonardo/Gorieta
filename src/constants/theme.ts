/**
 * Colores, degradados, fuentes y espaciado de la app.
 * Los colores están definidos para modo claro y oscuro.
 */

import "@/global.css";

import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#1F2933",
    background: "#F6F7F3",
    backgroundElement: "#FFFFFF",
    backgroundSelected: "#E6EBE4",
    textSecondary: "#68736F",
    tint: "#0F766E",
    onTint: "#ffffff",
    star: "#F5A524",
    danger: "#D93036",
    border: "#E1E5DF",
    accent: "#F28C28", // naranja: interacciones y destacados
    brand: "#123F3A", // verde profundo: identidad
  },
  dark: {
    text: "#F1F4F0",
    background: "#0B1A18",
    backgroundElement: "#122624",
    backgroundSelected: "#1B3733",
    textSecondary: "#9DB0AA",
    tint: "#2DB3A3",
    onTint: "#06201C",
    star: "#F5B83D",
    danger: "#FF6369",
    border: "#24403B",
    accent: "#F5A04A",
    brand: "#7FD1C7",
  },
} as const;

/** Degradados (sintaxis CSS para la prop de estilo `backgroundImage`). */
export const Gradients = {
  light: {
    screen: "linear-gradient(180deg, #E3EBE2 0%, #F6F7F3 40%)",
    image: "linear-gradient(160deg, #E6EDE6 0%, #FAFBF8 100%)",
    primary: "linear-gradient(90deg, #0F766E 0%, #12877D 100%)",
  },
  dark: {
    screen: "linear-gradient(180deg, #14332F 0%, #0B1A18 45%)",
    image: "linear-gradient(160deg, #1B3A36 0%, #102321 100%)",
    primary: "linear-gradient(90deg, #0F766E 0%, #12877D 100%)",
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/** Nombres de las fuentes tal como se cargan con useFonts en app/_layout.tsx. */
export const FontFamily = {
  heading: "Manrope_700Bold",
  headingXL: "Manrope_800ExtraBold",
  body: "Inter_400Regular",
  bodyMedium: "Inter_500Medium",
  bodySemiBold: "Inter_600SemiBold",
} as const;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "var(--font-display)",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
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
