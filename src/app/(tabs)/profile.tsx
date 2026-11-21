import { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Switch, View } from 'react-native';

import { ReviewCard } from '@/components/review-card';
import { Screen } from '@/components/screen';
import { Section } from '@/components/section';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { ReviewCardSkeleton, SkeletonList } from '@/components/ui/skeleton';
import { StateView } from '@/components/ui/state-view';
import { TextField } from '@/components/ui/text-field';
import { FontFamily, Radius, Spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/use-async';
import { useAuth } from '@/hooks/use-auth';
import { useRefreshOnFocus } from '@/hooks/use-refresh-on-focus';
import { useElevation, useTheme } from '@/hooks/use-theme';
import { haptics } from '@/lib/haptics';
import {
  setDensityLevel,
  setMotionLevel,
  useMotion,
  usePreferences,
  type DensityLevel,
  type MotionLevel,
} from '@/lib/preferences';
import { areSoundsEnabled, setSoundsEnabled } from '@/lib/sounds';
import { supabase } from '@/lib/supabase';
import { getUserReviews } from '@/services/reviews';

export default function ProfileScreen() {
  const { user } = useAuth();
  return user ? <Account userId={user.id} email={user.email} /> : <AuthForm />;
}

function Account({ userId, email }: { userId: string; email?: string }) {
  const profile = useAsync(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data as { username: string | null };
  }, [userId]);
  const reviews = useAsync(() => getUserReviews(userId), [userId]);
  useRefreshOnFocus(reviews.reload);
  const theme = useTheme();
  const initial = (profile.data?.username ?? email ?? '?').charAt(0).toUpperCase();

  return (
    <Screen
      title={profile.data?.username ?? 'Mi perfil'}
      subtitle={email}
      headerRight={
        <View style={[styles.avatar, { backgroundColor: theme.accent }]}>
          <ThemedText style={styles.avatarText}>{initial}</ThemedText>
        </View>
      }
      refreshing={reviews.loading}
      onRefresh={reviews.reload}>
      <Section title={`Mis reseñas${reviews.data ? ` (${reviews.data.length})` : ''}`}>
        <StateView
          loading={reviews.loading && !reviews.data}
          skeleton={
            <SkeletonList count={2}>
              <ReviewCardSkeleton />
            </SkeletonList>
          }
          error={reviews.error}
          onRetry={reviews.reload}
          empty={reviews.data?.length === 0}
          emptyIcon={{ ios: 'square.and.pencil', android: 'edit_note', web: 'edit_note' }}
          emptyText="Todavía no escribes reseñas."
        />
        {reviews.data?.map((r) => (
          <ReviewCard key={r.id} review={r} showVehicle onDeleted={reviews.reload} />
        ))}
      </Section>

      <Section title="Preferencias">
        <SoundsToggle />
        <MotionPreference />
        <DensityPreference />
      </Section>

      <Button title="Cerrar sesión" variant="danger" onPress={() => supabase.auth.signOut()} />
    </Screen>
  );
}

const MOTION_OPTIONS: { value: MotionLevel; label: string }[] = [
  { value: 'off', label: 'Apagado' },
  { value: 'subtle', label: 'Sutil' },
  { value: 'normal', label: 'Normal' },
  { value: 'intense', label: 'Intenso' },
];

const MOTION_HINTS: Record<MotionLevel, string> = {
  off: 'Sin animaciones: todo aparece al instante.',
  subtle: 'Animaciones cortas y discretas.',
  normal: 'Animaciones suaves al cambiar de pestaña y al tocar.',
  intense: 'Entradas con rebote y botones que reaccionan más al tocar.',
};

function MotionPreference() {
  const elevation = useElevation();
  const { motion } = usePreferences();
  // El sistema manda: con "Reducir movimiento" activado no se anima nada
  const systemReduced = useMotion().level === 'off' && motion !== 'off';

  return (
    <ThemedView
      type="backgroundElement"
      style={[styles.preferenceColumn, elevation]}>
      <View style={styles.preferenceHeader}>
        <ThemedText type="smallBold">Intensidad de movimiento</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {systemReduced
            ? 'Tu teléfono tiene activado "Reducir movimiento", así que las animaciones están apagadas.'
            : MOTION_HINTS[motion]}
        </ThemedText>
      </View>
      <SegmentedControl
        accessibilityLabel="Intensidad de movimiento"
        options={MOTION_OPTIONS}
        value={motion}
        onChange={setMotionLevel}
      />
    </ThemedView>
  );
}

const DENSITY_OPTIONS: { value: DensityLevel; label: string }[] = [
  { value: 'compact', label: 'Compacta' },
  { value: 'comfortable', label: 'Cómoda' },
  { value: 'spacious', label: 'Amplia' },
];

const DENSITY_HINTS: Record<DensityLevel, string> = {
  compact: 'Más contenido por pantalla: tarjetas más bajas y menos espacio entre elementos.',
  comfortable: 'El equilibrio por defecto entre contenido y espacio.',
  spacious: 'Más aire entre elementos y fotos más grandes.',
};

function DensityPreference() {
  const elevation = useElevation();
  const { density } = usePreferences();

  return (
    <ThemedView
      type="backgroundElement"
      style={[styles.preferenceColumn, elevation]}>
      <View style={styles.preferenceHeader}>
        <ThemedText type="smallBold">Densidad visual</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {DENSITY_HINTS[density]}
        </ThemedText>
      </View>
      <SegmentedControl
        accessibilityLabel="Densidad visual"
        options={DENSITY_OPTIONS}
        value={density}
        onChange={setDensityLevel}
      />
    </ThemedView>
  );
}

function SoundsToggle() {
  const theme = useTheme();
  const elevation = useElevation();
  const [enabled, setEnabled] = useState(areSoundsEnabled);

  return (
    <ThemedView
      type="backgroundElement"
      style={[styles.preference, elevation]}>
      <View style={styles.preferenceText}>
        <ThemedText type="smallBold">Sonidos</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Sonidos breves al tocar botones. Respetan el modo silencio.
        </ThemedText>
      </View>
      <Switch
        accessibilityLabel="Sonidos"
        value={enabled}
        onValueChange={(value) => {
          setSoundsEnabled(value);
          setEnabled(value);
          // Al activarlos, el "pop" sirve de muestra
          if (value) haptics.toggleOn();
          else haptics.toggleOff();
        }}
        trackColor={{ true: theme.accent, false: theme.backgroundSelected }}
      />
    </ThemedView>
  );
}

function AuthForm() {
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSignUp = mode === 'signUp';

  async function submit() {
    setLoading(true);
    setError(null);
    const { data, error } = isSignUp
      ? await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { username: username.trim() || null } },
        })
      : await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);

    if (error) {
      haptics.error();
      setError(error.message);
      return;
    }
    haptics.success();
    if (isSignUp && !data.session) {
      const message = 'Revisa tu correo para confirmar tu cuenta.';
      if (Platform.OS === 'web') setError(message);
      else Alert.alert('Cuenta creada', message);
    }
  }

  return (
    <Screen
      title={isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
      subtitle="Guarda vehículos y comparte tus reseñas.">
      <View style={styles.form}>
        {isSignUp && (
          <TextField
            label="Nombre de usuario"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoComplete="username"
          />
        )}
        <TextField
          label="Correo"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
        />
        <TextField
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
        />
        {error && <ThemedText themeColor="danger">{error}</ThemedText>}
        <Button
          title={isSignUp ? 'Crear cuenta' : 'Entrar'}
          onPress={submit}
          loading={loading}
          disabled={!email || password.length < 6}
        />
        <Pressable
          onPress={() => {
            haptics.selection();
            setMode(isSignUp ? 'signIn' : 'signUp');
          }}>
          <ThemedText type="linkPrimary" style={styles.center}>
            {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
          </ThemedText>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  preference: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: Radius.card,
    padding: Spacing.three,
  },
  // En columna, sin flex: 1 (que en un contenedor de alto automático puede colapsar)
  preferenceHeader: {
    gap: Spacing.half,
  },
  preferenceColumn: {
    gap: Spacing.three,
    borderRadius: Radius.card,
    padding: Spacing.three,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontFamily: FontFamily.headingXL,
    fontSize: 22,
    lineHeight: 28,
  },
  preferenceText: {
    flex: 1,
    gap: Spacing.half,
  },
  form: {
    gap: Spacing.three,
  },
  center: {
    textAlign: 'center',
  },
});
