import { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';

import { ReviewCard } from '@/components/review-card';
import { Screen } from '@/components/screen';
import { Section } from '@/components/section';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { StateView } from '@/components/ui/state-view';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/use-async';
import { useAuth } from '@/hooks/use-auth';
import { useRefreshOnFocus } from '@/hooks/use-refresh-on-focus';
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

  return (
    <Screen
      title={profile.data?.username ?? 'Mi perfil'}
      subtitle={email}
      refreshing={reviews.loading}
      onRefresh={reviews.reload}>
      <Section title={`Mis reseñas${reviews.data ? ` (${reviews.data.length})` : ''}`}>
        <StateView
          loading={reviews.loading && !reviews.data}
          error={reviews.error}
          onRetry={reviews.reload}
          empty={reviews.data?.length === 0}
          emptyText="Todavía no escribes reseñas."
        />
        {reviews.data?.map((r) => <ReviewCard key={r.id} review={r} showVehicle />)}
      </Section>

      <Button title="Cerrar sesión" variant="danger" onPress={() => supabase.auth.signOut()} />
    </Screen>
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
      setError(error.message);
    } else if (isSignUp && !data.session) {
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
        <Pressable onPress={() => setMode(isSignUp ? 'signIn' : 'signUp')}>
          <ThemedText type="linkPrimary" style={styles.center}>
            {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
          </ThemedText>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.three,
  },
  center: {
    textAlign: 'center',
  },
});
