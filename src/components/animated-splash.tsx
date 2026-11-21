import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";

import { SplashColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

const LOGOS = {
  light: require("@/assets/images/logo-diurno.png"),
  dark: require("@/assets/images/logo-diurno.png"),
} as const;

type Props = {
  onFinish: () => void;
  onReady?: () => void;
  /** Tiempo (ms) que se queda visible con el logo ya mostrado. */
  duration?: number;
};

export default function AnimatedSplash({
  onFinish,
  onReady,
  duration = 2000,
}: Props) {
  const scheme = useColorScheme();
  const mode = scheme === "dark" ? "dark" : "light";
  const backgroundColor = SplashColors[mode];
  const logo = LOGOS[mode];

  const [logoOpacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.delay(duration),
    ]).start(({ finished }) => {
      if (finished) onFinish();
    });
  }, [duration, logoOpacity, onFinish]);

  return (
    // Fondo sólido, igual al del splash nativo: no hay salto de color al pasar de uno a otro
    <View style={[styles.container, { backgroundColor }]} onLayout={onReady}>
      <Animated.View style={[styles.logoSlot, { opacity: logoOpacity }]}>
        <Image source={logo} style={styles.logo} contentFit="contain" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  logoSlot: {
    width: 300,
    height: 300,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: { width: "100%", height: "100%" },
});
