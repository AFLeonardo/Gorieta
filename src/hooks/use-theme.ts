/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors, Elevation, Gradients } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export function useTheme() {
  const scheme = useColorScheme();
  const theme = scheme === "dark" ? "dark" : "light";

  return Colors[theme];
}

/** Estilo de elevación de las tarjetas (sombra suave en claro, borde fino en oscuro). */
export function useElevation() {
  const scheme = useColorScheme();
  return Elevation[scheme === "dark" ? "dark" : "light"];
}

export function useGradients() {
  const scheme = useColorScheme();
  return Gradients[scheme === "dark" ? "dark" : "light"];
}
