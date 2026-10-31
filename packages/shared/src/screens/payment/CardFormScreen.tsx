import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, ScreenTitle } from '../../components/Screen';
import { TextField } from '../../components/TextField';
import { BottomBar } from '../../components/BottomBar';
import { CardPreview } from '../../components/CardPreview';
import { CheckCircleBox } from '../../components/CheckBox';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { Brand, Txt } from '../../components/Txt';
import { useAuth } from '../../hooks/useAuth';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { keys } from '../../hooks/queryClient';
import { addPaymentMethod } from '../../api/profile';
import { detectBrand, formatCardNumber, formatExpiry, luhnValid, parseExpiry } from '../../lib/card';

/**
 * « Enregistrer une carte de crédit ». Aucun numéro complet ni CVV n'est stocké :
 * seuls la marque, les 4 derniers chiffres et l'expiration sont enregistrés (voir README : intégration PSP).
 */
export function CardFormScreen({ next, title = 'Enregistrer\nune carte de crédit' }: { next?: string; title?: string }) {
  const router = useRouter();
  const { session } = useAuth();
  const [holder, setHolder] = useState('');
  const [number, setNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [consent, setConsent] = useState(true);

  const brand = detectBrand(number);
  const digits = number.replace(/\D/g, '');
  const exp = parseExpiry(expiry);
  const valid = holder.trim().length > 2 && luhnValid(digits) && !!exp && cvv.length >= 3 && consent;

  const save = useAsyncAction(
    () =>
      addPaymentMethod({
        userId: session!.user.id,
        brand,
        last4: digits.slice(-4),
        expMonth: exp!.month,
        expYear: exp!.year,
        holderName: holder.trim(),
        makeDefault: true,
      }),
    {
      invalidate: [keys.paymentMethods],
      onSuccess: () => {
        if (next) router.replace(next);
        else if (router.canGoBack()) router.back();
      },
    },
  );

  const submit = () => {
    if (!luhnValid(digits)) return Alert.alert('Carte invalide', 'Vérifiez le numéro de carte.');
    if (!exp) return Alert.alert('Carte invalide', "La date d'expiration est invalide ou dépassée.");
    void save.run();
  };

  return (
    <View style={{ flex: 1 }}>
      <Screen scroll footer={<BottomBar title="Enregistrer la carte" onPress={submit} disabled={!valid} />}>
        <ScreenTitle>{title}</ScreenTitle>
        <CardPreview brand={brand} holder={holder} last4={digits.length >= 4 ? digits.slice(-4) : undefined} />
        <TextField placeholder="Nom figurant sur la carte" value={holder} onChangeText={setHolder} autoComplete="cc-name" containerStyle={{ marginTop: 10 }} />
        <TextField
          placeholder="Numéro de carte"
          value={formatCardNumber(number)}
          onChangeText={(t) => setNumber(t.replace(/\D/g, '').slice(0, 19))}
          keyboardType="number-pad"
          autoComplete="cc-number"
          containerStyle={{ marginTop: 10 }}
        />
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
          <TextField placeholder="Date d’expiration" value={expiry} onChangeText={(t) => setExpiry(formatExpiry(t))} keyboardType="number-pad" autoComplete="cc-exp" containerStyle={{ flex: 1 }} />
          <TextField placeholder="Cryptogramme" value={cvv} onChangeText={(t) => setCvv(t.replace(/\D/g, '').slice(0, 4))} keyboardType="number-pad" secureTextEntry autoComplete="cc-csc" containerStyle={{ flex: 1 }} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16 }}>
          <CheckCircleBox checked={consent} onToggle={() => setConsent((v) => !v)} size={56} />
          <Txt size={14} lineHeight={18} style={{ flex: 1 }}>
            J’autorise <Brand /> à mémoriser mes coordonnées bancaires de manière sécurisée de sorte que je n’ai pas besoin de les entrer à chaque commande.
          </Txt>
        </View>
      </Screen>
      <LoadingOverlay visible={save.loading} />
    </View>
  );
}
