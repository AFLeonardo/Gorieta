/**
 * Colores, degradados, radios, sombras, fuentes y espaciado de la app.
 * Los colores están definidos para modo claro y oscuro.
 *
 * Paleta: superficies neutras + dos colores de marca con papeles distintos:
 * - Azul cobalto (`tint`): lo que se puede tocar (botones, filtros, enlaces, pestañas).
 * - Naranja (`accent`): lo que se destaca (ranking, precio, marca, avatar).
 */

import "@/global.css";

import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#0F172A",
    title: "#000000", // negro puro: títulos grandes de cada pantalla
    background: "#F5F6F8", // gris neutro muy claro
    backgroundElement: "#FFFFFF", // tarjetas / superficies
    backgroundSelected: "#EDEFF3",
    textSecondary: "#5B6475",
    tint: "#1D4ED8", // azul cobalto
    onTint: "#FFFFFF",
    star: "#F5A524",
    danger: "#DC2626",
    border: "#E5E7EB",
    accent: "#F97316", // naranja
    accentSecondary: "#FB923C",
    brand: "#1D4ED8",
  },
  dark: {
    text: "#F4F4F5",
    title: "#FFFFFF", // blanco puro: títulos grandes de cada pantalla
    background: "#000000", // negro real (pantallas OLED)
    backgroundElement: "#141416",
    backgroundSelected: "#222226",
    textSecondary: "#A1A1AA",
    tint: "#4F7DFF", // azul cobalto más claro: legible sobre negro
    onTint: "#FFFFFF",
    star: "#FFB938",
    danger: "#F87171",
    border: "#2A2A2F",
    accent: "#FF8A3D",
    accentSecondary: "#FFA35C",
    brand: "#4F7DFF",
  },
} as const;

/** Degradados (sintaxis CSS para la prop de estilo `backgroundImage`). */
export const Gradients = {
  light: {
    image: "linear-gradient(160deg, #EEF1F6 0%, #FFFFFF 100%)",
    primary: "linear-gradient(135deg, #1D4ED8 0%, #3B6BFF 100%)",
    accent: "linear-gradient(135deg, #F97316 0%, #FB923C 100%)",
  },
  dark: {
    image: "linear-gradient(160deg, #1C1C20 0%, #121214 100%)",
    primary: "linear-gradient(135deg, #3B63F0 0%, #5B85FF 100%)",
    accent: "linear-gradient(135deg, #FF8A3D 0%, #FFA35C 100%)",
  },
} as const;

/** Radios de esquina: el mismo sistema en toda la app. */
export const Radius = {
  /** Tarjetas y paneles. */
  card: 20,
  /** Elementos dentro de una tarjeta (fotos, mosaicos, campos). */
  inner: 12,
  /** Botones, filtros, insignias. */
  pill: 999,
} as const;

/**
 * Elevación de las superficies. En claro, una sombra muy suave; en oscuro las sombras no se
 * ven, así que se usa un borde finito.
 */
export const Elevation = {
  light: {
    boxShadow: "0px 1px 2px rgba(15, 23, 42, 0.05), 0px 8px 24px rgba(15, 23, 42, 0.07)",
  },
  dark: {
    borderWidth: 1,
    borderColor: "#232328",
  },
} as const;

/**
 * Fondo sólido del splash (nativo y animado): el naranja de la marca.
 * Si cambias estos valores, actualiza también `expo-splash-screen` en app.json
 * (backgroundColor y dark.backgroundColor) para que el splash nativo coincida.
 */
export const SplashColors = {
  light: "#FB923C",
  dark: "#FB923C",
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
