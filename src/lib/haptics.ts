/**
 * Retroalimentación háptica unificada. En Android usa `performAndroidHapticsAsync`
 * (motor háptico del sistema, recomendado por Expo); en iOS el Taptic Engine.
 * En web no hace nada: la API de vibración del navegador resulta molesta para la UI.
 * Las llamadas son "fire and forget": nunca bloquean ni lanzan errores.
 */
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

function run(ios: () => Promise<void>, android: Haptics.AndroidHaptics) {
  if (Platform.OS === 'ios') ios().catch(() => {});
  else if (Platform.OS === 'android') Haptics.performAndroidHapticsAsync(android).catch(() => {});
}

export const haptics = {
  /** Toque de botón. */
  tap: () =>
    run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), Haptics.AndroidHaptics.Virtual_Key),
  /** Cambio de selección: pestañas, chips, estrellas. */
  selection: () => run(() => Haptics.selectionAsync(), Haptics.AndroidHaptics.Segment_Tick),
  /** Acción principal con peso, como el disparador de la cámara. */
  impact: () =>
    run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), Haptics.AndroidHaptics.Confirm),
  success: () =>
    run(
      () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
      Haptics.AndroidHaptics.Confirm
    ),
  error: () =>
    run(
      () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
      Haptics.AndroidHaptics.Reject
    ),
};
