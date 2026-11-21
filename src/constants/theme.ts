/**
 * Colores, degradados, fuentes y espaciado de la app.
 * Los colores están definidos para modo claro y oscuro.
 *
 * Paleta: azul marino + naranja (coherente con el splash de atardecer/anochecer).
 */

import "@/global.css";

import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#1E293B",
    background: "#F3F6FA", // gris azulado muy suave (sin blanco puro)
    backgroundElement: "#FBFCFE", // tarjetas / superficies
    backgroundSelected: "#E3E9F2",
    textSecondary: "#475569", // un poco más oscuro para leerse bien sobre el degradado naranja
    tint: "#15375A", // azul marino: elementos interactivos activos
    onTint: "#F3F6FA",
    star: "#F2B01E",
    danger: "#D93036",
    border: "#D9E1EC",
    accent: "#F97316", // naranja: interacciones y destacados
    accentSecondary: "#FB923C",
    brand: "#102A43", // azul profundo: identidad
  },
  dark: {
    text: "#F1F5F9",
    background: "#0B132B", // azul medianoche
    backgroundElement: "#1C2541", // azul pizarra: mayor elevación
    backgroundSelected: "#2A3558",
    textSecondary: "#9AA8C0",
    tint: "#7AA2EE", // azul claro: legible sobre fondo oscuro
    onTint: "#0B132B",
    star: "#FFC24D",
    danger: "#FF6B6B",
    border: "#2B3658",
    accent: "#FF8533",
    accentSecondary: "#FFA05C",
    brand: "#A9C0F0",
  },
} as const;

/** Degradados (sintaxis CSS para la prop de estilo `backgroundImage`). */
export const Gradients = {
  light: {
    // Pequeño degradado naranja en la parte superior que se funde con el fondo
    screen: "linear-gradient(180deg, #FB923C 0%, #FDBA74 7%, #FFEDD5 16%, #F3F6FA 26%)",
    image: "linear-gradient(160deg, #E4EAF3 0%, #FBFCFE 100%)",
    primary: "linear-gradient(90deg, #102A43 0%, #1E3A8A 100%)",
    accent: "linear-gradient(90deg, #F97316 0%, #FB923C 100%)",
  },
  dark: {
    // Pequeño degradado morado en la parte superior que se funde con el fondo
    screen: "linear-gradient(180deg, #6D28D9 0%, #4C1D95 7%, #2E1065 16%, #0B132B 26%)",
    image: "linear-gradient(160deg, #1F2B52 0%, #101A36 100%)",
    primary: "linear-gradient(90deg, #7AA2EE 0%, #9DB8EE 100%)",
    accent: "linear-gradient(90deg, #FF8533 0%, #FFA05C 100%)",
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
