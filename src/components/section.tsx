import type { PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export function Section({
  title,
  children,
}: PropsWithChildren<{ title: string }>) {
  const theme = useTheme();
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={[styles.accent, { backgroundColor: theme.accent }]} />
        <ThemedText
          type="smallBold"
          themeColor="textSecondary"
          style={styles.title}
        >
          {title}
        </ThemedText>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  accent: {
    width: 4,
    height: 16,
    borderRadius: 2,
  },
  title: {
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontSize: 17,
  },
});
