import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, ScreenTitle } from '../../components/Screen';
import { TextField } from '../../components/TextField';
import { BottomBar } from '../../components/BottomBar';
import { StepDots } from '../../components/StepDots';
import { Txt } from '../../components/Txt';
import { colors } from '../../theme';
import { useAuth } from '../../hooks/useAuth';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { updateProfile } from '../../api/profile';
import { nonEmpty } from '../../lib/validation';

/** « Nous en dire plus sur vous » : prénom, nom, adresse. */
export function InfosScreen({ next, dot = 0, dots = 3 }: { next: string; dot?: number; dots?: number }) {
  const router = useRouter();
  const { profile, session, setProfile } = useAuth();
  const [firstName, setFirstName] = useState(profile?.first_name ?? '');
  const [lastName, setLastName] = useState(profile?.last_name ?? '');
  const [street, setStreet] = useState(profile?.street ?? '');
  const [zip, setZip] = useState(profile?.zip ?? '');
  const [city, setCity] = useState(profile?.city ?? '');
  const [touched, setTouched] = useState(false);

  const valid = [firstName, lastName, street, zip, city].every(nonEmpty);
  const save = useAsyncAction(
    () =>
      updateProfile(session!.user.id, {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        street: street.trim(),
        zip: zip.trim(),
        city: city.trim(),
      }),
    {
      onSuccess: (p) => {
        setProfile(p);
        router.push(next);
      },
    },
  );

  const submit = () => {
    setTouched(true);
    if (!valid) return;
    void save.run();
  };

  const err = (v: string) => touched && !nonEmpty(v);

  return (
    <Screen
      scroll
      footer={
        <>
          <StepDots count={dots} current={dot} />
          <BottomBar title="Suivant" onPress={submit} disabled={!valid} loading={save.loading} />
        </>
      }
    >
      <ScreenTitle sub="Toutes les informations que vous insérez sont tenues confidentielles et ne sont transmises à aucune tierces personnes">
        Nous en dire plus{'\n'}sur vous
      </ScreenTitle>
      <TextField placeholder="Prénom" value={firstName} onChangeText={setFirstName} error={err(firstName)} autoComplete="given-name" />
      <TextField placeholder="Nom" value={lastName} onChangeText={setLastName} error={err(lastName)} autoComplete="family-name" containerStyle={{ marginTop: 10 }} />
      <TextField placeholder="Rue, Nr." value={street} onChangeText={setStreet} error={err(street)} autoComplete="street-address" containerStyle={{ marginTop: 10 }} centered={!street} />
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
        <TextField placeholder="NPA" value={zip} onChangeText={setZip} error={err(zip)} keyboardType="number-pad" autoComplete="postal-code" containerStyle={{ width: 120 }} />
        <TextField placeholder="Ville" value={city} onChangeText={setCity} error={err(city)} containerStyle={{ flex: 1 }} />
      </View>
      {touched && !valid ? (
        <Txt size={15} center color={colors.red} style={{ marginTop: 14 }}>
          Veuillez remplir les champs manquants
        </Txt>
      ) : null}
    </Screen>
  );
}
