import React, { useRef, useState } from 'react';
import { Alert, Pressable, TextInput, View } from 'react-native';
import { Screen, ScreenTitle } from '../../components/Screen';
import { TextField } from '../../components/TextField';
import { BottomBar } from '../../components/BottomBar';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { BrandName, Txt } from '../../components/Txt';
import { colors } from '../../theme';
import { useAppConfig } from '../../config/AppConfig';
import { signInWithEmail, sendPasswordReset } from '../../api/auth';
import { errorMessage, isEmail } from '../../lib/validation';

export function LoginScreen() {
  const { brandSuffix, scheme } = useAppConfig();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const pwdRef = useRef<React.ComponentRef<typeof TextInput>>(null);

  const submit = async () => {
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      setDone(true);
    } catch (e) {
      Alert.alert('Connexion impossible', errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const forgot = () => {
    if (!isEmail(email)) {
      Alert.alert('Mot de passe oublié', 'Saisissez d’abord votre adresse e-mail.');
      return;
    }
    sendPasswordReset(email, scheme)
      .then(() => Alert.alert('E-mail envoyé', 'Suivez le lien reçu pour choisir un nouveau mot de passe.'))
      .catch((e) => Alert.alert('Oups', errorMessage(e)));
  };

  return (
    <View style={{ flex: 1 }}>
      <Screen bg={colors.white} scroll footer={<BottomBar title="Se connecter" onPress={submit} disabled={!isEmail(email) || password.length < 6} />}>
        <ScreenTitle>
          Connectez-vous{'\n'}sur <BrandName suffix={brandSuffix} />
        </ScreenTitle>
        <TextField
          tone="grey"
          centered
          placeholder="Adresse E-Mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          onSubmitEditing={() => pwdRef.current?.focus()}
        />
        <TextField
          ref={pwdRef}
          tone="grey"
          centered
          placeholder="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={submit}
          containerStyle={{ marginTop: 10 }}
        />
        <Pressable onPress={forgot} style={{ marginTop: 18 }} hitSlop={8}>
          <Txt variant="small" center color={colors.greyText}>
            Mot de passe oublié ?
          </Txt>
        </Pressable>
      </Screen>
      <LoadingOverlay visible={loading} done={done} />
    </View>
  );
}
