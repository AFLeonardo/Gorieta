/**
 * Preferencias visuales del usuario: intensidad de movimiento y densidad visual.
 *
 * Se guardan en localStorage (respaldado por SQLite en iOS/Android) y cualquier componente
 * que use `useMotion` / `useDensity` se actualiza al instante cuando cambian.
 */
import { useSyncExternalStore } from 'react';
import { useReducedMotion } from 'react-native-reanimated';

export type MotionLevel = 'off' | 'subtle' | 'normal' | 'intense';
export type DensityLevel = 'compact' | 'comfortable' | 'spacious';

type Preferences = { motion: MotionLevel; density: DensityLevel };

const STORAGE_KEY = 'gorieta:preferences';
const DEFAULTS: Preferences = { motion: 'normal', density: 'comfortable' };

let current = load();
const listeners = new Set<() => void>();

function load(): Preferences {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Preferences>) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

function update(patch: Partial<Preferences>) {
  current = { ...current, ...patch };
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    // Sin almacenamiento: la preferencia dura solo esta sesión
  }
  listeners.forEach((notify) => notify());
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  return () => listeners.delete(notify);
}

export function usePreferences() {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => current
  );
}

export const setMotionLevel = (motion: MotionLevel) => update({ motion });
export const setDensityLevel = (density: DensityLevel) => update({ density });

// ───────────── Movimiento ─────────────

export type MotionConfig = {
  level: MotionLevel;
  /** false si el usuario eligió "Apagado" o el sistema tiene "Reducir movimiento". */
  enabled: boolean;
  /** Desplazamiento (px) de la animación de entrada de cada pestaña. */
  riseOffset: number;
  /** Duración (ms) de la animación de entrada. */
  riseDuration: number;
  /** Entrada con rebote (resorte) en vez de una curva suave. */
  riseBounce: boolean;
  /** Escala de los botones al presionarlos (1 = sin cambio). */
  pressScale: number;
  /** Escala de las tarjetas al presionarlas. */
  cardPressScale: number;
  /** Opacidad mínima del "respirar" de los skeletons (1 = estáticos). */
  skeletonMinOpacity: number;
};

const MOTION: Record<MotionLevel, Omit<MotionConfig, 'level' | 'enabled'>> = {
  off: {
    riseOffset: 0,
    riseDuration: 0,
    riseBounce: false,
    pressScale: 1,
    cardPressScale: 1,
    skeletonMinOpacity: 1,
  },
  subtle: {
    riseOffset: 12,
    riseDuration: 260,
    riseBounce: false,
    pressScale: 0.985,
    cardPressScale: 0.99,
    skeletonMinOpacity: 0.7,
  },
  normal: {
    riseOffset: 28,
    riseDuration: 380,
    riseBounce: false,
    pressScale: 0.97,
    cardPressScale: 0.98,
    skeletonMinOpacity: 0.45,
  },
  intense: {
    riseOffset: 56,
    riseDuration: 520,
    riseBounce: true,
    pressScale: 0.93,
    cardPressScale: 0.95,
    skeletonMinOpacity: 0.25,
  },
};

/** Configuración de animaciones según la preferencia (y "Reducir movimiento" del sistema). */
export function useMotion(): MotionConfig {
  const { motion } = usePreferences();
  const reduceMotion = useReducedMotion();
  const level: MotionLevel = reduceMotion ? 'off' : motion;
  return { level, enabled: level !== 'off', ...MOTION[level] };
}

// ───────────── Densidad ─────────────

export type DensityConfig = {
  level: DensityLevel;
  /** Multiplica un espaciado base (Spacing.*) según la densidad. */
  space: (base: number) => number;
  /** Alto de las tarjetas de vehículo (Top, Guardados). */
  vehicleCardHeight: number;
  vehicleCardCompactHeight: number;
  /** Alto de la foto en las tarjetas de resultados de búsqueda. */
  showcaseImageHeight: number;
};

const DENSITY: Record<DensityLevel, { factor: number; card: number; compactCard: number; showcase: number }> = {
  compact: { factor: 0.65, card: 200, compactCard: 200, showcase: 170 },
  comfortable: { factor: 1, card: 260, compactCard: 250, showcase: 230 },
  spacious: { factor: 1.3, card: 300, compactCard: 280, showcase: 270 },
};

export function useDensity(): DensityConfig {
  const { density } = usePreferences();
  const d = DENSITY[density];
  return {
    level: density,
    space: (base) => Math.round(base * d.factor),
    vehicleCardHeight: d.card,
    vehicleCardCompactHeight: d.compactCard,
    showcaseImageHeight: d.showcase,
  };
}
