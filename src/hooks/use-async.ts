import { useCallback, useEffect, useState } from 'react';

type AsyncState<T> = {
  data: T | undefined;
  error: Error | null;
  loading: boolean;
  reload: () => void;
};

type Settled<T> = { key: string; data?: T; error: Error | null };

/**
 * Ejecuta `fn` al montar y cada vez que cambien `deps`. Ignora respuestas obsoletas y
 * conserva los datos anteriores mientras recarga (útil para pull-to-refresh).
 * Pasa `enabled: false` para no ejecutar (por ejemplo, sin sesión iniciada).
 */
export function useAsync<T>(
  fn: () => Promise<T>,
  deps: readonly unknown[],
  { enabled = true }: { enabled?: boolean } = {}
): AsyncState<T> {
  const [nonce, setNonce] = useState(0);
  const [settled, setSettled] = useState<Settled<T> | null>(null);
  const key = enabled ? JSON.stringify([deps, nonce]) : null;

  useEffect(() => {
    if (key === null) return;
    let cancelled = false;
    fn()
      .then((data) => !cancelled && setSettled({ key, data, error: null }))
      .catch(
        (e: unknown) =>
          !cancelled &&
          setSettled((prev) => ({
            key,
            data: prev?.data,
            error: e instanceof Error ? e : new Error(String(e)),
          }))
      );
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  return {
    data: enabled ? settled?.data : undefined,
    error: settled?.key === key ? settled.error : null,
    loading: key !== null && settled?.key !== key,
    reload,
  };
}
