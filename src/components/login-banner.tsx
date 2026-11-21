import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon } from "@/components/ui/icon";
import { BottomTabInset, FontFamily, Radius, Spacing } from "@/constants/theme";
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
          <Icon
            name={{ ios: "xmark", android: "close", web: "close" }}
            size={16}
            color="rgba(255, 255, 255, 0.8)"
          />
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
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    borderRadius: Radius.card,
    paddingVertical: 14,
    paddingHorizontal: 16,
    paddingRight: 44,
  },
  closeButton: { position: "absolute", top: 14, right: 14, zIndex: 1 },
  text: {
    color: "#fff",
    fontFamily: FontFamily.bodyMedium,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  // Azul cobalto aclarado: legible sobre el fondo negro del aviso
  link: { color: "#8FB0FF", fontFamily: FontFamily.bodySemiBold, fontSize: 15 },
});
