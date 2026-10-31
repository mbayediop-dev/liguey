import React from 'react';
import { Alert, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen, ScreenTitle } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Txt } from '../../components/Txt';
import { colors } from '../../theme';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { resendConfirmation } from '../../api/auth';

export function VerifyEmailScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const resend = useAsyncAction(() => resendConfirmation(email ?? ''), {
    onSuccess: () => Alert.alert('E-mail renvoyé', `Un nouveau lien a été envoyé à ${email}.`),
  });
  return (
    <Screen edges={['top', 'bottom', 'left', 'right']}>
      <ScreenTitle>Vérifiez votre{'\n'}e-mail</ScreenTitle>
      <Txt size={16}>
        Nous avons envoyé un lien de confirmation à <Txt size={16} weight="semibold">{email}</Txt>. Ouvrez-le, puis revenez vous connecter : votre inscription reprendra là où vous l’avez laissée.
      </Txt>
      <Txt variant="small" color={colors.greyDark} style={{ marginTop: 14 }}>
        Astuce développeur : la confirmation d’e-mail se désactive dans Supabase → Authentication → Providers → Email.
      </Txt>
      <View style={{ flex: 1 }} />
      <Button title="Se connecter" onPress={() => router.replace('/login')} />
      <Button title="Renvoyer l’e-mail" variant="outline" onPress={() => resend.run()} loading={resend.loading} style={{ marginTop: 10 }} />
    </Screen>
  );
}
