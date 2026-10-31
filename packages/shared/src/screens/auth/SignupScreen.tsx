import React, { useRef, useState } from 'react';
import { Alert, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, ScreenTitle } from '../../components/Screen';
import { TextField } from '../../components/TextField';
import { BottomBar } from '../../components/BottomBar';
import { StepDots } from '../../components/StepDots';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { Brand, Txt } from '../../components/Txt';
import { colors } from '../../theme';
import { useAppConfig } from '../../config/AppConfig';
import { signUpWithEmail } from '../../api/auth';
import { errorMessage, isEmail, isPassword } from '../../lib/validation';

/** Étape 1 : création du compte (e-mail + mot de passe). */
export function SignupScreen() {
  const router = useRouter();
  const { role } = useAppConfig();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const pwdRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  const confRef = useRef<React.ComponentRef<typeof TextInput>>(null);

  const emailOk = isEmail(email);
  const pwdOk = isPassword(password);
  const matchOk = confirm.length > 0 && confirm === password;
  const valid = emailOk && pwdOk && matchOk;

  const submit = async () => {
    setTouched(true);
    if (!valid) return;
    setLoading(true);
    try {
      const data = await signUpWithEmail(role, email, password);
      if (!data.session) {
        router.replace({ pathname: '/verify-email', params: { email: email.trim() } });
      }
      // Avec une session : le layout racine bascule automatiquement vers l'onboarding.
    } catch (e) {
      Alert.alert('Inscription impossible', errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Screen
        scroll
        footer={
          <>
            <StepDots count={3} current={0} />
            <BottomBar title="Suivant" onPress={submit} disabled={!valid} />
          </>
        }
      >
        <ScreenTitle>
          Créer un compte{'\n'}sur <Brand />
        </ScreenTitle>
        <TextField
          centered
          placeholder="Adresse E-Mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          error={touched && !emailOk}
          returnKeyType="next"
          onSubmitEditing={() => pwdRef.current?.focus()}
        />
        <TextField
          ref={pwdRef}
          centered
          placeholder="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="new-password"
          error={touched && !pwdOk}
          returnKeyType="next"
          onSubmitEditing={() => confRef.current?.focus()}
          containerStyle={{ marginTop: 10 }}
        />
        <TextField
          ref={confRef}
          centered
          placeholder="Confirmer le mot de passe"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          autoComplete="new-password"
          error={touched && !matchOk}
          returnKeyType="go"
          onSubmitEditing={submit}
          containerStyle={{ marginTop: 10 }}
        />
        {touched && !valid ? (
          <Txt variant="small" center color={colors.red} style={{ marginTop: 14 }}>
            {!emailOk ? 'Adresse e-mail invalide' : !pwdOk ? 'Le mot de passe doit contenir au moins 8 caractères' : 'Les mots de passe ne correspondent pas'}
          </Txt>
        ) : null}
      </Screen>
      <LoadingOverlay visible={loading} />
    </View>
  );
}
