import { router, useLocalSearchParams } from 'expo-router';

import { ReviewForm } from '@/components/review-form';
import { Screen } from '@/components/screen';
import { Section } from '@/components/section';
import { ThemedText } from '@/components/themed-text';
import { PanelSkeleton, VehicleCardSkeleton } from '@/components/ui/skeleton';
import { StateView } from '@/components/ui/state-view';
import { VehicleCard } from '@/components/vehicle-card';
import { useAsync } from '@/hooks/use-async';
import { useAuth } from '@/hooks/use-auth';
import { storedReviewPhotos } from '@/services/review-photos';
import { getReview, updateReview } from '@/services/reviews';
import type { Review } from '@/types/vehicle';

/** Editar una reseña propia (/review/<id>). */
export default function EditReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const review = useAsync(() => getReview(id), [id]);

  if (!review.data) {
    return (
      <Screen withTabBar={false}>
        <StateView
          loading={review.loading}
          skeleton={
            <>
              <VehicleCardSkeleton />
              <PanelSkeleton rows={4} />
            </>
          }
          error={review.error}
          onRetry={review.reload}
        />
      </Screen>
    );
  }

  if (review.data.user_id !== user?.id) {
    return (
      <Screen withTabBar={false}>
        <ThemedText themeColor="textSecondary">Solo puedes editar tus propias reseñas.</ThemedText>
      </Screen>
    );
  }

  return <EditForm review={review.data} />;
}

function EditForm({ review }: { review: Review }) {
  return (
    <Screen withTabBar={false}>
      <Section title="Vehículo">
        <VehicleCard vehicle={review} />
      </Section>

      <ReviewForm
        initial={{
          rating: review.rating,
          title: review.title,
          body: review.body,
          pros: review.pros ?? undefined,
          cons: review.cons ?? undefined,
          mileage: review.mileage ?? undefined,
        }}
        initialPhotos={storedReviewPhotos(review.photos)}
        submitLabel="Guardar cambios"
        errorMessage="No se pudo guardar la reseña."
        onSubmit={async (content, photos) => {
          await updateReview(review, content, photos);
          if (router.canGoBack()) router.back();
          else router.replace(`/vehicle/${review.vehicle_id}`);
        }}
      />
    </Screen>
  );
}
