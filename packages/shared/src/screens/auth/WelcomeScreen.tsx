import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, ScreenTitle } from '../../components/Screen';
import { Button } from '../../components/Button';
import { BrandName } from '../../components/Txt';
import { colors } from '../../theme';
import { useAppConfig } from '../../config/AppConfig';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { signInWithFacebook } from '../../api/auth';

export function WelcomeScreen() {
  const router = useRouter();
  const { brandSuffix, scheme } = useAppConfig();
  const fb = useAsyncAction(() => signInWithFacebook(scheme), { errorTitle: 'Connexion Facebook' });
  return (
    <Screen bg={colors.white} edges={['top', 'bottom', 'left', 'right']}>
      <ScreenTitle>
        Bienvenue sur{'\n'}
        <BrandName suffix={brandSuffix} />
      </ScreenTitle>
      <View style={{ flex: 1 }} />
      <Button variant="facebook" title="Se connecter avec Facebook" onPress={() => fb.run()} loading={fb.loading} />
      <Button title="Créer un compte" onPress={() => router.push('/signup')} style={{ marginTop: 10 }} />
      <Button variant="outline" title="Se connecter" onPress={() => router.push('/login')} style={{ marginTop: 10 }} />
    </Screen>
  );
}
