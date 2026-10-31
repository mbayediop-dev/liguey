import React from 'react';
import { Alert, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../components/Screen';
import { PageHeader } from '../../components/PageHeader';
import { PlusRect } from '../../components/PlusCircle';
import { CardPreview } from '../../components/CardPreview';
import { IconCircle } from '../../components/IconCircle';
import { Txt } from '../../components/Txt';
import { EmptyState } from '../../components/EmptyState';
import { colors } from '../../theme';
import { usePaymentMethods } from '../../hooks/queries';
import { useAuth } from '../../hooks/useAuth';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { keys } from '../../hooks/queryClient';
import { deletePaymentMethod, setDefaultPaymentMethod } from '../../api/profile';

/** Gestion des cartes enregistrées (Paramètres → Changer de carte de paiement). */
export function PaymentMethodsScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const cards = usePaymentMethods();
  const del = useAsyncAction(deletePaymentMethod, { invalidate: [keys.paymentMethods] });
  const def = useAsyncAction((id: string) => setDefaultPaymentMethod(session!.user.id, id), { invalidate: [keys.paymentMethods] });
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <PageHeader title="Moyens de paiement" />
      <Screen scroll edges={['left', 'right']}>
        {(cards.data ?? []).length === 0 ? <EmptyState text="Aucune carte enregistrée" /> : null}
        <View style={{ gap: 12 }}>
          {(cards.data ?? []).map((c) => (
            <View key={c.id}>
              <Pressable onPress={() => (c.is_default ? undefined : def.run(c.id))}>
                <CardPreview brand={c.brand} last4={c.last4} holder={c.holder_name} dimmed={!c.is_default} />
              </Pressable>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 6, paddingTop: 8 }}>
                <Txt variant="small" color={c.is_default ? colors.red : colors.greyText}>
                  {c.is_default ? 'Carte par défaut' : 'Appuyer pour utiliser cette carte'} · exp. {String(c.exp_month).padStart(2, '0')}/{String(c.exp_year).slice(-2)}
                </Txt>
                <IconCircle
                  name="trash-outline"
                  size={40}
                  onPress={() =>
                    Alert.alert('Supprimer la carte', `Supprimer la carte •••• ${c.last4} ?`, [
                      { text: 'Annuler', style: 'cancel' },
                      { text: 'Supprimer', style: 'destructive', onPress: () => void del.run(c.id) },
                    ])
                  }
                />
              </View>
            </View>
          ))}
          <PlusRect onPress={() => router.push('/payment/new')} height={180} />
        </View>
      </Screen>
    </View>
  );
}
