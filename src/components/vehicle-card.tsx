import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { useState } from "react";
import {
  type GestureResponderEvent,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { StarRating } from "@/components/star-rating";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { FontFamily, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { type VehicleSnapshot } from "@/types/vehicle";

const ON_IMAGE = "#F1F5F9";

type VehicleCardProps = {
  vehicle: VehicleSnapshot;
  rating?: { avg: number; count: number };
  /** Posición en el Top (1, 2, 3…). */
  rank?: number;
  /** Precio del vehículo (opcional). */
  price?: number | null;
  /** Variante compacta para carruseles horizontales. */
  compact?: boolean;
  /** Si se pasa, la tarjeta llama a esta función en vez de abrir la ficha del vehículo. */
  onPress?: () => void;
  /** Estado de guardado controlado desde fuera (opcional). */
  saved?: boolean;
  /** Se llama al tocar el botón de guardar (opcional). */
  onToggleSave?: (next: boolean) => void;
};

function formatPrice(value: number) {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

export function VehicleCard({
  vehicle,
  rating,
  rank,
  price,
  compact,
  onPress,
  saved,
  onToggleSave,
}: VehicleCardProps) {
  const theme = useTheme();
  const [localSaved, setLocalSaved] = useState(false);
  const isSaved = saved ?? localSaved;

  const toggleSave = (e: GestureResponderEvent) => {
    // Evita que el toque también abra la ficha del vehículo (el botón está dentro del Link).
    e.stopPropagation();
    e.preventDefault();
    const next = !isSaved;
    setLocalSaved(next);
    onToggleSave?.(next);
  };

  const card = (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        compact && styles.compact,
        pressed && styles.pressed,
      ]}
    >
      <ThemedView
        type="backgroundSelected"
        style={[styles.card, compact ? styles.cardCompact : styles.cardRegular]}
      >
        {/* Foto a toda la tarjeta */}
        <Image
          source={vehicle.image_url}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
        />

        {/* Degradado inferior hacia la foto */}
        <View style={styles.gradient} pointerEvents="none" />

        {/* Posición en el Top (arriba izquierda) */}
        {rank ? (
          <View style={[styles.rankBadge, { backgroundColor: theme.accent }]}>
            <ThemedText type="smallBold" style={styles.rankText}>
              #{rank}
            </ThemedText>
          </View>
        ) : null}

        {/* Guardar (arriba derecha) */}
        <Pressable
          onPress={toggleSave}
          hitSlop={10}
          style={[
            styles.saveButton,
            {
              backgroundColor: isSaved
                ? theme.accent
                : "rgba(11, 19, 43, 0.55)",
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={
            isSaved ? "Quitar de guardados" : "Guardar vehículo"
          }
        >
          <Ionicons
            name={isSaved ? "bookmark" : "bookmark-outline"}
            size={16}
            color={ON_IMAGE}
          />
        </Pressable>

        {/* Información sobre el degradado */}
        <View style={styles.info}>
          {rating && (
            <View style={styles.ratingRow}>
              <StarRating value={rating.avg} size={14} />
              <ThemedText type="small" style={styles.ratingText}>
                {rating.avg.toFixed(1)} ({rating.count})
              </ThemedText>
            </View>
          )}

          <View style={styles.titleBlock}>
            <ThemedText
              type="smallBold"
              numberOfLines={1}
              style={[styles.make, { color: theme.accentSecondary }]}
            >
              {vehicle.make}
            </ThemedText>
            <ThemedText type="default" numberOfLines={1} style={styles.model}>
              {vehicle.model}
            </ThemedText>
            <ThemedText type="small" numberOfLines={1} style={styles.year}>
              {vehicle.year}
              {vehicle.trim ? ` · ${vehicle.trim}` : ""}
            </ThemedText>
          </View>

          {price != null && (
            <ThemedText
              type="default"
              style={[styles.price, { color: theme.accent }]}
            >
              {formatPrice(price)}
            </ThemedText>
          )}
        </View>
      </ThemedView>
    </Pressable>
  );

  if (onPress) return card;
  return (
    <Link href={`/vehicle/${vehicle.vehicle_id}`} asChild>
      {card}
    </Link>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.85,
  },
  compact: {
    width: 220,
  },
  card: {
    borderRadius: Spacing.three,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  cardRegular: {
    height: 260,
  },
  cardCompact: {
    height: 250,
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "70%",
    backgroundImage:
      "linear-gradient(180deg, rgba(11, 19, 43, 0) 0%, rgba(11, 19, 43, 0.75) 45%, rgba(11, 19, 43, 0.96) 100%)",
  },
  rankBadge: {
    position: "absolute",
    top: Spacing.two,
    left: Spacing.two,
    minWidth: 32,
    height: 28,
    paddingHorizontal: Spacing.two,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: {
    color: "#FFFFFF",
    fontFamily: FontFamily.heading,
  },
  saveButton: {
    position: "absolute",
    top: Spacing.two,
    right: Spacing.two,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
  ratingText: {
    color: ON_IMAGE,
  },
  titleBlock: {
    gap: 0,
  },
  make: {
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontSize: 12,
    lineHeight: 16,
  },
  model: {
    color: ON_IMAGE,
    fontFamily: FontFamily.heading,
    fontSize: 20,
    lineHeight: 26,
  },
  year: {
    color: ON_IMAGE,
    opacity: 0.8,
  },
  price: {
    fontFamily: FontFamily.headingXL,
    fontSize: 20,
    lineHeight: 26,
  },
});
