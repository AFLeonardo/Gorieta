import { LoginBanner } from "@/components/login-banner";
import { ReviewCard } from "@/components/review-card";
import { Screen } from "@/components/screen";
import { Section } from "@/components/section";
import { StateView } from "@/components/ui/state-view";
import { VehicleCard } from "@/components/vehicle-card";
import { useAsync } from "@/hooks/use-async";
import { useRefreshOnFocus } from "@/hooks/use-refresh-on-focus";
import { useSavedVehicles } from "@/hooks/use-saved-vehicles";
import { getRecentReviews, getTopVehicles } from "@/services/reviews";
import { View } from "react-native";

export default function HomeScreen() {
  const top = useAsync(() => getTopVehicles(10), []);
  const recent = useAsync(() => getRecentReviews(5), []);
  const saved = useSavedVehicles();

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
        <Section title="Top vehículos">
          {top.data && top.data.length > 0 ? (
            top.data.map((v, i) => (
              <VehicleCard
                key={v.vehicle_id}
                vehicle={v}
                rank={i + 1}
                rating={{
                  avg: Number(v.avg_rating),
                  count: Number(v.review_count),
                }}
                saved={saved.isSaved(v.vehicle_id)}
                onToggleSave={() => saved.toggle(v)}
              />
            ))
          ) : (
            <StateView
              loading={top.loading && !top.data}
              error={top.error}
              onRetry={top.reload}
              empty
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
              error={recent.error}
              onRetry={recent.reload}
              empty
              emptyText="Sé el primero en escribir una reseña."
            />
          )}
        </Section>
      </Screen>

      <LoginBanner />
    </View>
  );
}
