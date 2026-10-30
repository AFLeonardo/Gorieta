import { useFocusEffect } from 'expo-router';
import { useCallback, useRef } from 'react';

/** Vuelve a cargar los datos cuando la pantalla recupera el foco (no en el primer montaje). */
export function useRefreshOnFocus(reload: () => void) {
  const firstFocus = useRef(true);

  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) {
        firstFocus.current = false;
        return;
      }
      reload();
    }, [reload])
  );
}
