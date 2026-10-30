import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

/**
 * Evita que la pantalla se apague mientras la pantalla está enfocada.
 * No usamos `useKeepAwake`: las pestañas siguen montadas al cambiar de tab,
 * así que mantendría la pantalla encendida en toda la app.
 */
export function useKeepAwakeWhileFocused(tag: string) {
  useFocusEffect(
    useCallback(() => {
      // Puede fallar en navegadores sin Wake Lock; no es crítico
      activateKeepAwakeAsync(tag).catch(() => {});
      return () => {
        deactivateKeepAwake(tag).catch(() => {});
      };
    }, [tag])
  );
}
