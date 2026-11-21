import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BottomTabInset, Spacing } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { haptics } from "@/lib/haptics";

export function LoginBanner({
  message = "Inicia sesión para guardar vehículos y escribir reseñas.",
}: {
  message?: string;
}) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(true);

  if (user || !visible) return null;

  return (
    <Animated.View
      entering={FadeInDown.duration(250)}
      exiting={FadeOutDown.duration(200)}
      style={[
        styles.wrapper,
        { bottom: insets.bottom + BottomTabInset + Spacing.two },
      ]}
    >
      <View style={styles.card}>
        <Pressable
          style={styles.closeButton}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Cerrar aviso"
          onPress={() => {
            haptics.selection();
            setVisible(false);
          }}
        >
          <Text style={styles.closeText}>✕</Text>
        </Pressable>

        <Text style={styles.text}>{message}</Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Iniciar sesión"
          onPress={() => {
            haptics.tap();
            router.navigate("/profile");
          }}
        >
          <Text style={styles.link}>Iniciar sesión</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 12,
    right: 12,
    zIndex: 100,
    elevation: 10,
  },
  card: {
    backgroundColor: "rgba(0, 0, 0, 0.82)",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    paddingRight: 44,
  },
  closeButton: { position: "absolute", top: 10, right: 12, zIndex: 1 },
  closeText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  text: { color: "#fff", fontSize: 14, marginBottom: 8 },
  link: { color: "#4da3ff", fontSize: 15, fontWeight: "600" },
});
