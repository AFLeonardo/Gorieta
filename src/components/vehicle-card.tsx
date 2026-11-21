import { router } from "expo-router";
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
import { Icon } from "@/components/ui/icon";
import { ImageWithSkeleton } from "@/components/ui/skeleton";
import { FontFamily, Radius, Spacing } from "@/constants/theme";
import { useElevation, useTheme } from "@/hooks/use-theme";
import { haptics } from "@/lib/haptics";
import { useDensity, useMotion } from "@/lib/preferences";
import { useVehicleImage } from "@/services/vehicle-images";
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
  /** Ancho fijo (carruseles); por defecto ocupa todo el ancho disponible. */
  width?: number;
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
  width,
  onPress,
  saved,
  onToggleSave,
}: VehicleCardProps) {
  const theme = useTheme();
  const elevation = useElevation();
  const [localSaved, setLocalSaved] = useState(false);
  const { cardPressScale } = useMotion();
  const density = useDensity();
  // Foto real si ya la conocemos (caché de MarketCheck); si no carga, la ilustración
  const photo = useVehicleImage(vehicle);
  const [photoFailed, setPhotoFailed] = useState(false);
  const imageUri = photoFailed ? vehicle.image_url : photo;
  const isSaved = saved ?? localSaved;

  const toggleSave = (e: GestureResponderEvent) => {
    // Evita que el toque también abra la ficha del vehículo (el botón está dentro del Link).
    e.stopPropagation();
    e.preventDefault();
    const next = !isSaved;
    // Sin onToggleSave nadie más da respuesta háptica (useSavedVehicles ya la da)
    if (!onToggleSave) {
      if (next) haptics.toggleOn();
      else haptics.toggleOff();
    }
    setLocalSaved(next);
    onToggleSave?.(next);
  };

  const open = () => {
    haptics.tap();
    if (onPress) onPress();
    else router.push(`/vehicle/${vehicle.vehicle_id}`);
  };

  return (
    <Pressable
      accessibilityRole={onPress ? "button" : "link"}
      accessibilityLabel={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
      onPress={open}
      style={({ pressed }) => [
        compact && styles.compact,
        width !== undefined && { width },
        pressed && styles.pressed,
        pressed && { transform: [{ scale: cardPressScale }] },
      ]}
    >
      <ThemedView
        type="backgroundSelected"
        style={[
          styles.card,
          elevation,
          {
            height: compact
              ? density.vehicleCardCompactHeight
              : density.vehicleCardHeight,
          },
        ]}
      >
        {/* Foto a toda la tarjeta */}
        <ImageWithSkeleton
          key={imageUri}
          source={imageUri}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
          skeletonColor={theme.border}
          onError={() => {
            if (imageUri !== vehicle.image_url) setPhotoFailed(true);
          }}
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
                : "rgba(0, 0, 0, 0.45)",
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={
            isSaved ? "Quitar de guardados" : "Guardar vehículo"
          }
        >
          <Icon
            name={
              isSaved
                ? { ios: "bookmark.fill", android: "bookmark", web: "bookmark" }
                : { ios: "bookmark", android: "bookmark_border", web: "bookmark_border" }
            }
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
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.85,
  },
  compact: {
    width: 220,
  },
  card: {
    borderRadius: Radius.card,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "70%",
    backgroundImage:
      "linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.55) 45%, rgba(0, 0, 0, 0.88) 100%)",
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
