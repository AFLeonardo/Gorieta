import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { CameraCapture, type CapturedPicture } from '@/components/camera-capture';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { haptics } from '@/lib/haptics';
import {
  MAX_REVIEW_PHOTOS,
  optimizeReviewPhoto,
  type LocalPhoto,
} from '@/services/review-photos';

type ReviewPhotoPickerProps = {
  photos: LocalPhoto[];
  onChange: (photos: LocalPhoto[]) => void;
  disabled?: boolean;
  /** Avisa mientras hay fotos optimizándose (para no publicar a medias). */
  onProcessingChange?: (processing: boolean) => void;
};

/** Fotos de la reseña: tomar con la cámara, elegir de la galería y quitar. */
export function ReviewPhotoPicker({
  photos,
  onChange,
  disabled,
  onProcessingChange,
}: ReviewPhotoPickerProps) {
  const theme = useTheme();
  const photosRef = useRef(photos);
  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [processing, setProcessing] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const remaining = MAX_REVIEW_PHOTOS - photos.length - processing;
  const isFull = remaining <= 0;

  useEffect(() => {
    onProcessingChange?.(processing > 0);
  }, [processing, onProcessingChange]);

  /** Optimiza (redimensiona + JPEG) antes de agregar, así miniaturas y subida usan archivos ligeros. */
  async function addPhotos(sources: CapturedPicture[]) {
    setError(null);
    setProcessing((n) => n + sources.length);
    try {
      const optimized = await Promise.all(
        sources.map((s) => optimizeReviewPhoto(s.uri, s.width && s.height ? s : undefined))
      );
      // Usa la lista más reciente: el usuario pudo quitar fotos mientras se procesaban
      onChange([...photosRef.current, ...optimized].slice(0, MAX_REVIEW_PHOTOS));
    } catch {
      setError('No se pudo procesar la foto. Intenta con otra.');
      haptics.error();
    } finally {
      setProcessing((n) => n - sources.length);
    }
  }

  async function pickFromGallery() {
    // Abrir la galería no requiere permiso (selector del sistema)
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      // Sin compresión aquí: optimizeReviewPhoto comprime una sola vez
      quality: 1,
    });
    if (result.canceled) return;
    await addPhotos(result.assets.slice(0, remaining));
  }

  return (
    <View style={styles.container}>
      {(photos.length > 0 || processing > 0) && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbs}>
          {photos.map((photo, i) => (
            <View key={photo.uri}>
              <Image source={photo.uri} style={styles.thumb} contentFit="cover" />
              {!disabled && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Quitar foto ${i + 1}`}
                  hitSlop={Spacing.one}
                  onPress={() => {
                    haptics.tap();
                    onChange(photos.filter((p) => p.uri !== photo.uri));
                  }}
                  style={styles.remove}>
                  <Icon
                    name={{ ios: 'xmark', android: 'close', web: 'close' }}
                    size={14}
                    color="#fff"
                  />
                </Pressable>
              )}
            </View>
          ))}
          {Array.from({ length: processing }, (_, i) => (
            <View
              key={`processing-${i}`}
              style={[styles.thumb, styles.processing, { backgroundColor: theme.backgroundElement }]}>
              <ActivityIndicator />
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.actions}>
        <Button
          style={styles.flex}
          variant="secondary"
          title="Cámara"
          icon={{ ios: 'camera.fill', android: 'photo_camera', web: 'photo_camera' }}
          disabled={disabled || isFull}
          onPress={() => setCameraOpen(true)}
        />
        <Button
          style={styles.flex}
          variant="secondary"
          title="Galería"
          icon={{ ios: 'photo.on.rectangle', android: 'photo_library', web: 'photo_library' }}
          disabled={disabled || isFull}
          onPress={pickFromGallery}
        />
      </View>
      {error && (
        <ThemedText type="small" themeColor="danger">
          {error}
        </ThemedText>
      )}
      <ThemedText type="small" themeColor="textSecondary">
        {processing > 0
          ? 'Optimizando fotos…'
          : isFull
          ? `Máximo ${MAX_REVIEW_PHOTOS} fotos.`
          : `Puedes agregar hasta ${remaining} foto${remaining === 1 ? '' : 's'} más.`}
      </ThemedText>

      <CameraCapture
        visible={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={(picture) => addPhotos([picture])}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  thumbs: {
    gap: Spacing.two,
  },
  thumb: {
    width: 96,
    height: 96,
    borderRadius: Spacing.three,
  },
  processing: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  remove: {
    position: 'absolute',
    top: Spacing.one,
    right: Spacing.one,
    width: 24,
    height: 24,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  flex: {
    flex: 1,
  },
});
