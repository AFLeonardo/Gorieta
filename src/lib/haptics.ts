/**
 * Retroalimentación háptica y sonora unificada. En Android usa `performAndroidHapticsAsync`
 * (motor háptico del sistema, recomendado por Expo); en iOS el Taptic Engine.
 * En web no vibra (la API de vibración del navegador resulta molesta), pero sí suena.
 * Cada evento reproduce además un sonido corto (ver lib/sounds.ts).
 * Las llamadas son "fire and forget": nunca bloquean ni lanzan errores.
 */
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { playSound, type SoundName } from '@/lib/sounds';

function run(ios: () => Promise<void>, android: Haptics.AndroidHaptics, sound?: SoundName) {
  if (Platform.OS === 'ios') ios().catch(() => {});
  else if (Platform.OS === 'android') Haptics.performAndroidHapticsAsync(android).catch(() => {});
  if (sound) playSound(sound);
}

export const haptics = {
  /** Toque de botón. */
  tap: () =>
    run(
      () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
      Haptics.AndroidHaptics.Virtual_Key,
      'tap'
    ),
  /** Cambio de selección: pestañas, chips, estrellas. */
  selection: () =>
    run(() => Haptics.selectionAsync(), Haptics.AndroidHaptics.Segment_Tick, 'select'),
  /** Activar algo (guardar un vehículo): un "pop" más alegre que un toque normal. */
  toggleOn: () =>
    run(
      () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
      Haptics.AndroidHaptics.Toggle_On,
      'pop'
    ),
  /** Desactivar algo (quitar de guardados). */
  toggleOff: () =>
    run(
      () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
      Haptics.AndroidHaptics.Toggle_Off,
      'tap'
    ),
  /**
   * Acción principal con peso, como el disparador de la cámara. Sin sonido propio:
   * la cámara ya reproduce el del obturador.
   */
  impact: () =>
    run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), Haptics.AndroidHaptics.Confirm),
  success: () =>
    run(
      () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
      Haptics.AndroidHaptics.Confirm,
      'success'
    ),
  error: () =>
    run(
      () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
      Haptics.AndroidHaptics.Reject,
      'error'
    ),
};
