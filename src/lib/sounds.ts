/**
 * Sonidos cortos de interfaz. Se reproducen junto con los hápticos (ver lib/haptics.ts).
 *
 * - Respetan el modo silencio del teléfono y se mezclan con la música de otras apps.
 * - El usuario puede desactivarlos desde su perfil; la preferencia se guarda en localStorage
 *   (respaldado por SQLite en iOS/Android).
 * - Como los hápticos, son "fire and forget": nunca bloquean ni lanzan errores.
 */
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

const SOURCES = {
  tap: require('../../assets/sounds/tap.wav'),
  select: require('../../assets/sounds/select.wav'),
  pop: require('../../assets/sounds/pop.wav'),
  success: require('../../assets/sounds/success.wav'),
  error: require('../../assets/sounds/error.wav'),
} as const;

export type SoundName = keyof typeof SOURCES;

/** Volumen por sonido: los de navegación más bajos para que no cansen. */
const VOLUME: Record<SoundName, number> = {
  tap: 0.35,
  select: 0.3,
  pop: 0.45,
  success: 0.5,
  error: 0.5,
};

const STORAGE_KEY = 'gorieta:sounds-enabled';

let enabled = readEnabled();
let players: Partial<Record<SoundName, AudioPlayer>> | null = null;

function readEnabled() {
  try {
    return globalThis.localStorage?.getItem(STORAGE_KEY) !== 'false';
  } catch {
    return true;
  }
}

/** Crea los reproductores la primera vez que se necesitan (no en el arranque de la app). */
function getPlayers() {
  if (players) return players;
  players = {};
  setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers' }).catch(() => {});
  for (const name of Object.keys(SOURCES) as SoundName[]) {
    try {
      const player = createAudioPlayer(SOURCES[name]);
      player.volume = VOLUME[name];
      players[name] = player;
    } catch {
      // Sin audio disponible: la app sigue funcionando con solo hápticos
    }
  }
  return players;
}

export function playSound(name: SoundName) {
  if (!enabled) return;
  try {
    const player = getPlayers()[name];
    if (!player) return;
    player.seekTo(0).catch(() => {});
    player.play();
  } catch {
    // Ignorado a propósito: un sonido fallido no debe romper la interacción
  }
}

export function areSoundsEnabled() {
  return enabled;
}

export function setSoundsEnabled(value: boolean) {
  enabled = value;
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, String(value));
  } catch {
    // Si no se puede guardar, la preferencia dura solo esta sesión
  }
}
