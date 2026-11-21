import { LoginBanner } from "@/components/login-banner";
import { ReviewCard } from "@/components/review-card";
import { Screen } from "@/components/screen";
import { SearchEntry } from "@/components/search-entry";
import { Section } from "@/components/section";
import {
  ReviewCardSkeleton,
  SkeletonList,
  VehicleCardSkeleton,
} from "@/components/ui/skeleton";
import { StateView } from "@/components/ui/state-view";
import { VehicleCard } from "@/components/vehicle-card";
import { useAsync } from "@/hooks/use-async";
import { useRefreshOnFocus } from "@/hooks/use-refresh-on-focus";
import { useSavedVehicles } from "@/hooks/use-saved-vehicles";
import { getRecentReviews, getTopVehicles } from "@/services/reviews";
import { Spacing } from "@/constants/theme";
import { ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";

const CAROUSEL_GAP = Spacing.three;

export default function HomeScreen() {
  const top = useAsync(() => getTopVehicles(10), []);
  const recent = useAsync(() => getRecentReviews(5), []);
  const saved = useSavedVehicles();
  const { width: windowWidth } = useWindowDimensions();
  // Se asoma la siguiente tarjeta: invita a deslizar
  const cardWidth = Math.min(windowWidth * 0.8, 360);

  useRefreshOnFocus(top.reload);
  useRefreshOnFocus(recent.reload);
  // Si se quitó un guardado desde otra pestaña, el ícono se actualiza al volver.
  useRefreshOnFocus(saved.reload);

  return (
    <View style={{ flex: 1 }}>
      <Screen
        title="GORIETA"
        subtitle="Decide mejor con la experiencia de otros conductores."
        refreshing={top.loading || recent.loading}
        onRefresh={() => {
          top.reload();
          recent.reload();
          saved.reload();
        }}
      >
        <SearchEntry />

        <Section title="Top vehículos">
          {top.data && top.data.length > 0 ? (
            // Carrusel con imán: cada deslizamiento se detiene justo en una tarjeta
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={cardWidth + CAROUSEL_GAP}
              decelerationRate="fast"
              style={styles.carousel}
              contentContainerStyle={styles.carouselContent}
            >
              {top.data.map((v, i) => (
                <VehicleCard
                  key={v.vehicle_id}
                  vehicle={v}
                  width={cardWidth}
                  rank={i + 1}
                  rating={{
                    avg: Number(v.avg_rating),
                    count: Number(v.review_count),
                  }}
                  saved={saved.isSaved(v.vehicle_id)}
                  onToggleSave={() => saved.toggle(v)}
                />
              ))}
            </ScrollView>
          ) : (
            <StateView
              loading={top.loading && !top.data}
              skeleton={
                <View style={styles.carouselSkeleton}>
                  <VehicleCardSkeleton width={cardWidth} />
                  <VehicleCardSkeleton width={cardWidth} />
                </View>
              }
              error={top.error}
              onRetry={top.reload}
              empty
              emptyIcon={{ ios: "trophy", android: "emoji_events", web: "emoji_events" }}
              emptyText="Aún no hay suficientes reseñas para armar el Top."
            />
          )}
        </Section>

        <Section title="Reseñas recientes">
          {recent.data && recent.data.length > 0 ? (
            recent.data.map((r) => (
              <ReviewCard
                key={r.id}
                review={r}
                showVehicle
                onDeleted={() => {
                  recent.reload();
                  top.reload();
                }}
              />
            ))
          ) : (
            <StateView
              loading={recent.loading && !recent.data}
              skeleton={
                <SkeletonList count={2}>
                  <ReviewCardSkeleton />
                </SkeletonList>
              }
              error={recent.error}
              onRetry={recent.reload}
              empty
              emptyIcon={{ ios: "text.bubble", android: "rate_review", web: "rate_review" }}
              emptyText="Sé el primero en escribir una reseña."
            />
          )}
        </Section>
      </Screen>

      <LoginBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  // Llega hasta los bordes de la pantalla al deslizar (compensa el margen de Screen)
  // El margen/padding vertical deja espacio a la sombra de las tarjetas (el carrusel recorta)
  carousel: {
    marginHorizontal: -Spacing.three,
    marginVertical: -Spacing.three,
    flexGrow: 0,
  },
  carouselContent: {
    gap: CAROUSEL_GAP,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  carouselSkeleton: {
    flexDirection: "row",
    gap: CAROUSEL_GAP,
    overflow: "hidden",
  },
});
