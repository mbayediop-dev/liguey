import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_900Black,
} from '@expo-google-fonts/poppins';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppConfigProvider, type AppConfig } from '../config/AppConfig';
import { AuthProvider, useAuth } from '../hooks/useAuth';
import { queryClient } from '../hooks/queryClient';
import { RealtimeSync } from '../hooks/realtime';
import { BiometricGate } from '../hooks/useBiometricLock';
import { IntroSplash } from '../components/IntroSplash';
import { Screen } from '../components/Screen';
import { Txt } from '../components/Txt';
import { Button } from '../components/Button';
import { colors } from '../theme';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

/**
 * Layout racine commun aux deux apps : polices, providers, écran INTRO pendant le chargement,
 * puis groupes protégés (auth) / (onboarding) / (app) selon l'état de session et de profil.
 */
export function RootLayout({ config }: { config: AppConfig }) {
  const [fontsLoaded, fontError] = useFonts({ Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold, Poppins_900Black });
  const ready = fontsLoaded || !!fontError;
  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => undefined);
  }, [ready]);
  return (
    <QueryClientProvider client={queryClient}>
      <AppConfigProvider config={config}>
        <AuthProvider>
          <StatusBar style="dark" />
          <RootNavigator fontsReady={ready} pro={config.role === 'pro'} />
        </AuthProvider>
      </AppConfigProvider>
    </QueryClientProvider>
  );
}

function RootNavigator({ fontsReady, pro }: { fontsReady: boolean; pro: boolean }) {
  const { session, profile, loading, refreshProfile, signOut } = useAuth();
  if (!fontsReady || loading) return <IntroSplash pro={pro} />;

  if (session && !profile) {
    return (
      <Screen bg={colors.white} contentStyle={styles.center}>
        <Txt variant="h2" center>
          Profil introuvable
        </Txt>
        <Txt center color={colors.greyDark} style={{ marginVertical: 16 }}>
          Impossible de charger votre profil. Vérifiez que le schéma Supabase est appliqué (dossier supabase/) puis réessayez.
        </Txt>
        <Button title="Réessayer" onPress={() => void refreshProfile()} size="md" />
        <Button title="Se déconnecter" variant="outline" onPress={() => void signOut()} size="md" style={{ marginTop: 10 }} />
      </Screen>
    );
  }

  if (profile?.is_blocked) {
    return (
      <Screen bg={colors.white} contentStyle={styles.center}>
        <Txt variant="h2" center>
          Compte suspendu
        </Txt>
        <Txt center color={colors.greyDark} style={{ marginVertical: 16 }}>
          {profile.blocked_reason ?? 'Votre compte a été suspendu. Contactez le support HEROES pour plus d’informations.'}
        </Txt>
        <Button title="Se déconnecter" variant="outline" onPress={() => void signOut()} size="md" />
      </Screen>
    );
  }

  const onboarded = !!profile?.onboarding_completed;
  // Destination autorisée pour l'état courant. Sans `redirectTo`, Expo Router renvoie vers le
  // groupe lui-même (ex. `/(auth)`) qui n'a pas de route index → « Unmatched Route ».
  const home: Href = !session ? '/(auth)/welcome' : !onboarded ? '/(onboarding)/start' : '/(app)';
  return (
    <View style={styles.flex}>
      <RealtimeSync />
      <BiometricGate>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
          <Stack.Protected guard={!session} redirectTo={home}>
            <Stack.Screen name="(auth)" />
          </Stack.Protected>
          <Stack.Protected guard={!!session && !onboarded} redirectTo={home}>
            <Stack.Screen name="(onboarding)" />
          </Stack.Protected>
          <Stack.Protected guard={!!session && onboarded} redirectTo={home}>
            <Stack.Screen name="(app)" />
          </Stack.Protected>
        </Stack>
      </BiometricGate>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { justifyContent: 'center', paddingHorizontal: 24 },
});
