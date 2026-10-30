import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { CameraCapture } from '@/components/camera-capture';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Spacing } from '@/constants/theme';
import { MAX_REVIEW_PHOTOS, type LocalPhoto } from '@/services/review-photos';

type ReviewPhotoPickerProps = {
  photos: LocalPhoto[];
  onChange: (photos: LocalPhoto[]) => void;
  disabled?: boolean;
};

/** Fotos de la reseña: tomar con la cámara, elegir de la galería y quitar. */
export function ReviewPhotoPicker({ photos, onChange, disabled }: ReviewPhotoPickerProps) {
  const [cameraOpen, setCameraOpen] = useState(false);
  const remaining = MAX_REVIEW_PHOTOS - photos.length;
  const isFull = remaining <= 0;

  async function pickFromGallery() {
    // Abrir la galería no requiere permiso (selector del sistema)
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.7,
    });
    if (result.canceled) return;
    const picked = result.assets.map((a) => ({ uri: a.uri, mimeType: a.mimeType }));
    onChange([...photos, ...picked].slice(0, MAX_REVIEW_PHOTOS));
  }

  return (
    <View style={styles.container}>
      {photos.length > 0 && (
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
                  onPress={() => onChange(photos.filter((p) => p.uri !== photo.uri))}
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
      <ThemedText type="small" themeColor="textSecondary">
        {isFull
          ? `Máximo ${MAX_REVIEW_PHOTOS} fotos.`
          : `Puedes agregar hasta ${remaining} foto${remaining === 1 ? '' : 's'} más.`}
      </ThemedText>

      <CameraCapture
        visible={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={(uri) =>
          onChange([...photos, { uri, mimeType: 'image/jpeg' }].slice(0, MAX_REVIEW_PHOTOS))
        }
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
