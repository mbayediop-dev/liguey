import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, CardPreview, LoadingOverlay, PageHeader, PlusRect, Txt, chf, colors, keys, useAsyncAction, useMission, usePaymentMethods, validateMission } from '@heroes/shared';

/** « Sélectionnez un moyen de paiement » → total + avertissement → « Valider le prépaiement ». */
export default function Prepay() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const mission = useMission(id);
  const cards = usePaymentMethods();
  const [selected, setSelected] = useState<string | null>(null);
  const [step, setStep] = useState<0 | 1>(0);

  useEffect(() => {
    if (!selected && cards.data?.length) setSelected(cards.data.find((c) => c.is_default)?.id ?? cards.data[0]!.id);
  }, [cards.data, selected]);

  const pay = useAsyncAction(() => validateMission(id, selected), {
    invalidate: [keys.mission(id), keys.missions],
    onSuccess: () => router.replace(`/missions/${id}/scheduled`),
  });

  const m = mission.data;
  const card = cards.data?.find((c) => c.id === selected);

  return (
    <View style={styles.root}>
      <PageHeader title={step === 0 ? 'Selectionnez un moyen de paiement' : 'Ajouter une nouvelle carte'} onBack={() => (step === 1 ? setStep(0) : router.back())} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}>
        {step === 0 ? (
          <>
            <Txt size={17} center color={colors.greyText} style={{ marginBottom: 10 }}>
              Carte(s) déjà enregistrée(s)
            </Txt>
            {(cards.data ?? []).map((c) => (
              <Pressable key={c.id} onPress={() => setSelected(c.id)} style={{ marginBottom: 10 }}>
                <CardPreview brand={c.brand} last4={c.last4} holder={c.holder_name} dimmed={selected !== c.id} />
              </Pressable>
            ))}
            <PlusRect onPress={() => router.push('/payment/new')} height={cards.data?.length ? 160 : 260} />
          </>
        ) : (
          <>
            {card ? <CardPreview brand={card.brand} last4={card.last4} holder={card.holder_name} /> : null}
            <View style={styles.totalRow}>
              <Txt variant="label">Total</Txt>
              <Txt size={34} lineHeight={40}>
                {chf(m?.base_amount_chf)}
              </Txt>
            </View>
            <View style={styles.warn}>
              <Txt variant="label">Attention</Txt>
              <Txt size={18} lineHeight={24}>
                Votre carte va a présent être débitée. En cas d’annulation il vous faut annuler 24H avant le rendez-vous de votre demande. Si avant 24H, le service sera non remboursable.
              </Txt>
            </View>
          </>
        )}
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        {step === 0 ? (
          <Button title="Confirmer" onPress={() => setStep(1)} disabled={!selected} />
        ) : (
          <Button title="Valider le prépaiement" onPress={() => pay.run()} loading={pay.loading} />
        )}
      </View>
      <LoadingOverlay visible={pay.loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 12, paddingTop: 16 },
  totalRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', borderTopWidth: 1.5, borderBottomWidth: 1.5, borderColor: colors.black, marginTop: 50, paddingVertical: 10 },
  warn: { paddingTop: 10 },
  footer: { position: 'absolute', left: 12, right: 12, bottom: 0 },
});
