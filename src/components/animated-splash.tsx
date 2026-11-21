import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { Animated, StyleSheet } from "react-native";

import { useColorScheme } from "@/hooks/use-color-scheme";

const PALETTES = {
  light: ["#102A43", "#7C2D12", "#F97316"], // atardecer
  dark: ["#050B14", "#102A43", "#1E3A8A"], // anochecer
} as const;

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
  const colors = PALETTES[mode];
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
    <LinearGradient
      colors={colors}
      locations={[0, 0.55, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
      onLayout={onReady}
    >
      <Animated.View style={[styles.logoSlot, { opacity: logoOpacity }]}>
        <Image source={logo} style={styles.logo} contentFit="contain" />
      </Animated.View>
    </LinearGradient>
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
