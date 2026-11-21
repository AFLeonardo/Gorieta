import { Alert, Platform } from 'react-native';

/**
 * Pide confirmación antes de una acción destructiva. En web `Alert` no admite botones,
 * así que se usa el diálogo nativo del navegador.
 */
export function confirmDestructive(title: string, message: string, confirmLabel: string) {
  if (Platform.OS === 'web') return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  return new Promise<boolean>((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
        {
          text: confirmLabel,
          style: 'destructive',
          onPress: () => resolve(true),
        },
      ],
      { cancelable: true, onDismiss: () => resolve(false) }
    );
  });
}
