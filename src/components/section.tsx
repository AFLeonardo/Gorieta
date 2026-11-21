import type { PropsWithChildren } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { FontFamily, Spacing } from "@/constants/theme";
import { haptics } from "@/lib/haptics";
import { useDensity } from "@/lib/preferences";

type SectionProps = PropsWithChildren<{
  title: string;
  /** Enlace opcional a la derecha del título (p. ej. "Ver todo"). */
  action?: { label: string; onPress: () => void };
}>;

export function Section({ title, action, children }: SectionProps) {
  const density = useDensity();
  return (
    <View style={[styles.section, { gap: density.space(Spacing.three) }]}>
      <View style={styles.header}>
        <ThemedText style={styles.title} numberOfLines={1}>
          {title}
        </ThemedText>
        {action && (
          <Pressable
            accessibilityRole="button"
            hitSlop={Spacing.two}
            onPress={() => {
              haptics.tap();
              action.onPress();
            }}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <ThemedText type="smallBold" themeColor="tint">
              {action.label}
            </ThemedText>
          </Pressable>
        )}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.three,
  },
  header: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  title: {
    flexShrink: 1,
    fontFamily: FontFamily.heading,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.3,
  },
  pressed: {
    opacity: 0.6,
  },
});
