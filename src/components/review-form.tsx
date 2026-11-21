import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ReviewPhotoPicker } from '@/components/review-photo-picker';
import { Section } from '@/components/section';
import { StarRating } from '@/components/star-rating';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useKeepAwakeWhileFocused } from '@/hooks/use-keep-awake-while-focused';
import { haptics } from '@/lib/haptics';
import type { LocalPhoto } from '@/services/review-photos';
import type { ReviewContent } from '@/services/reviews';

type ReviewFormProps = {
  /** Valores iniciales al editar una reseña existente. */
  initial?: ReviewContent;
  initialPhotos?: LocalPhoto[];
  submitLabel: string;
  errorMessage: string;
  onSubmit: (content: ReviewContent, photos: LocalPhoto[]) => Promise<void>;
};

/** Calificación, textos y fotos de una reseña. Se usa para crear y para editar. */
export function ReviewForm({
  initial,
  initialPhotos = [],
  submitLabel,
  errorMessage,
  onSubmit,
}: ReviewFormProps) {
  // Escribir una reseña larga (o tomar fotos) toma tiempo: que no se apague la pantalla
  useKeepAwakeWhileFocused('review-form');

  const [rating, setRating] = useState(initial?.rating ?? 0);
  const [title, setTitle] = useState(initial?.title ?? '');
  const [body, setBody] = useState(initial?.body ?? '');
  const [pros, setPros] = useState(initial?.pros ?? '');
  const [cons, setCons] = useState(initial?.cons ?? '');
  const [mileage, setMileage] = useState(initial?.mileage?.toString() ?? '');
  const [photos, setPhotos] = useState<LocalPhoto[]>(initialPhotos);
  const [processingPhotos, setProcessingPhotos] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = rating > 0 && title.trim().length >= 3 && body.trim().length >= 10;
  const hasNewPhotos = photos.some((p) => !p.path);

  async function submit() {
    if (!isValid) return;
    setSubmitting(true);
    setError(null);
    try {
      const parsedMileage = Number.parseInt(mileage, 10);
      await onSubmit(
        {
          rating,
          title: title.trim(),
          body: body.trim(),
          pros: pros.trim() || undefined,
          cons: cons.trim() || undefined,
          mileage: Number.isNaN(parsedMileage) ? undefined : parsedMileage,
        },
        photos
      );
      haptics.success();
    } catch (e) {
      haptics.error();
      setError(e instanceof Error ? e.message : errorMessage);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Section title="Tu calificación">
        <StarRating value={rating} size={36} onChange={setRating} />
      </Section>

      <View style={styles.fields}>
        <TextField
          label="Título"
          placeholder="Resume tu experiencia"
          value={title}
          onChangeText={setTitle}
          maxLength={120}
        />
        <TextField
          label="Reseña"
          placeholder="¿Cómo ha sido tenerlo? Consumo, confiabilidad, comodidad…"
          value={body}
          onChangeText={setBody}
          multiline
          maxLength={4000}
        />
        <TextField label="Pros (opcional)" value={pros} onChangeText={setPros} />
        <TextField label="Contras (opcional)" value={cons} onChangeText={setCons} />
        <TextField
          label="Kilometraje (opcional)"
          placeholder="Ej. 45000"
          value={mileage}
          onChangeText={setMileage}
          keyboardType="number-pad"
        />
      </View>

      <Section title="Fotos (opcional)">
        <ReviewPhotoPicker
          photos={photos}
          onChange={setPhotos}
          disabled={submitting}
          onProcessingChange={setProcessingPhotos}
        />
      </Section>

      {error && <ThemedText themeColor="danger">{error}</ThemedText>}
      <Button
        title={submitting && hasNewPhotos ? 'Subiendo fotos…' : submitLabel}
        onPress={submit}
        disabled={!isValid || processingPhotos}
        loading={submitting}
      />
    </>
  );
}

const styles = StyleSheet.create({
  fields: {
    gap: Spacing.three,
  },
});
