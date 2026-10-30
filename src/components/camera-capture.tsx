import {
  CameraView,
  useCameraPermissions,
  type CameraType,
  type FlashMode,
} from 'expo-camera';
import { Image } from 'expo-image';
import { useRef, useState } from 'react';
import { Linking, Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Spacing } from '@/constants/theme';

type CameraCaptureProps = {
  visible: boolean;
  onClose: () => void;
  onCapture: (uri: string) => void;
};

const FLASH_CYCLE: FlashMode[] = ['off', 'auto', 'on'];

/** Cámara a pantalla completa: tomar foto → revisar → usar o repetir. */
export function CameraCapture({ visible, onClose, onCapture }: CameraCaptureProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}>
      {visible && <CameraContent onClose={onClose} onCapture={onCapture} />}
    </Modal>
  );
}

function CameraContent({ onClose, onCapture }: Omit<CameraCaptureProps, 'visible'>) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [ready, setReady] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [taking, setTaking] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function takePicture() {
    if (!ready || taking) return;
    setTaking(true);
    try {
      const picture = await cameraRef.current?.takePictureAsync({ quality: 0.7 });
      if (picture) setPreview(picture.uri);
    } catch {
      setError('No se pudo tomar la foto. Intenta de nuevo.');
    } finally {
      setTaking(false);
    }
  }

  // Permiso aún cargando
  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <Icon
          name={{ ios: 'camera.fill', android: 'photo_camera', web: 'photo_camera' }}
          size={48}
          color="#fff"
        />
        <ThemedText style={styles.lightText}>
          Gorieta necesita acceso a la cámara para tomar fotos de tu vehículo.
        </ThemedText>
        {permission.canAskAgain ? (
          <Button title="Permitir cámara" onPress={requestPermission} />
        ) : (
          <Button title="Abrir ajustes" onPress={() => Linking.openSettings()} />
        )}
        <Button title="Cancelar" variant="secondary" onPress={onClose} />
      </SafeAreaView>
    );
  }

  if (preview) {
    return (
      <View style={styles.container}>
        <Image source={preview} style={StyleSheet.absoluteFill} contentFit="contain" />
        <SafeAreaView style={styles.bottomBar} edges={['bottom']}>
          <View style={styles.previewActions}>
            <Button
              style={styles.flex}
              variant="secondary"
              title="Repetir"
              onPress={() => setPreview(null)}
            />
            <Button
              style={styles.flex}
              title="Usar foto"
              icon={{ ios: 'checkmark', android: 'check', web: 'check' }}
              onPress={() => {
                onCapture(preview);
                onClose();
              }}
            />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        flash={flash}
        onCameraReady={() => setReady(true)}
        onMountError={() => setError('No se pudo iniciar la cámara.')}
      />

      <SafeAreaView style={styles.topBar} edges={['top']}>
        <RoundButton
          label="Cerrar"
          icon={{ ios: 'xmark', android: 'close', web: 'close' }}
          onPress={onClose}
        />
        <RoundButton
          label={`Flash: ${flash}`}
          icon={
            flash === 'off'
              ? { ios: 'bolt.slash.fill', android: 'flash_off', web: 'flash_off' }
              : flash === 'auto'
                ? { ios: 'bolt.badge.automatic.fill', android: 'flash_auto', web: 'flash_auto' }
                : { ios: 'bolt.fill', android: 'flash_on', web: 'flash_on' }
          }
          onPress={() =>
            setFlash((f) => FLASH_CYCLE[(FLASH_CYCLE.indexOf(f) + 1) % FLASH_CYCLE.length])
          }
        />
      </SafeAreaView>

      <SafeAreaView style={styles.bottomBar} edges={['bottom']}>
        {error && <ThemedText style={[styles.lightText, styles.error]}>{error}</ThemedText>}
        <View style={styles.controls}>
          <View style={styles.sideSlot} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Tomar foto"
            disabled={!ready || taking}
            onPress={takePicture}
            style={({ pressed }) => [styles.shutter, (pressed || taking) && styles.shutterPressed]}>
            <View style={styles.shutterInner} />
          </Pressable>
          <View style={styles.sideSlot}>
            <RoundButton
              label="Cambiar cámara"
              icon={{
                ios: 'arrow.triangle.2.circlepath.camera.fill',
                android: 'flip_camera_ios',
                web: 'flip_camera_ios',
              }}
              onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))}
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

function RoundButton({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: React.ComponentProps<typeof Icon>['name'];
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={Spacing.two}
      onPress={onPress}
      style={({ pressed }) => [styles.roundButton, pressed && styles.shutterPressed]}>
      <Icon name={icon} size={22} color="#fff" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  lightText: {
    color: '#fff',
    textAlign: 'center',
  },
  error: {
    marginBottom: Spacing.two,
  },
  flex: {
    flex: 1,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sideSlot: {
    width: 48,
    alignItems: 'center',
  },
  previewActions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  roundButton: {
    width: 48,
    height: 48,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  shutter: {
    width: 78,
    height: 78,
    borderRadius: 999,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 62,
    height: 62,
    borderRadius: 999,
    backgroundColor: '#fff',
  },
  shutterPressed: {
    opacity: 0.6,
  },
});
