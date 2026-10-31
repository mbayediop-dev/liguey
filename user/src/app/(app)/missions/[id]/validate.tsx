import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar, Button, PageHeader, PetalsHeader, Stars, Txt, colors, fmtDayYear, fmtRange, fullName, rateLabel, useMission } from '@heroes/shared';

/** Fiche du héros ayant accepté (tarif horaire TTC) → « Suivant » → « Confirmation » → « Prépaiement ». */
export default function Validate() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const mission = useMission(id);
  const m = mission.data;
  const [step, setStep] = useState<0 | 1>(0);
  if (!m) return <View style={styles.root} />;
  const pro = m.pro;
  return (
    <View style={styles.root}>
      <PageHeader title={step === 0 ? 'Recherche' : 'Confirmation'} onBack={() => (step === 1 ? setStep(0) : router.back())} />
      <PetalsHeader height={90} />
      <View style={styles.rate}>
        <Txt size={34} lineHeight={40} color={colors.white} center>
          {rateLabel(m.client_rate_chf)}
        </Txt>
      </View>
      <View style={[styles.card, { marginBottom: insets.bottom + 12 }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.head}>
            <Avatar path={pro?.avatar_url} profile={pro} size={96} />
            <View style={{ flex: 1 }}>
              <Txt size={26} lineHeight={30} weight="medium">
                {fullName(pro)}
              </Txt>
              <View style={styles.stars}>
                <Stars rating={Number(pro?.rating_avg ?? 0)} size={20} />
                <Txt size={15} color={colors.red}>
                  {Number(pro?.rating_avg ?? 0).toFixed(2)}/5
                </Txt>
              </View>
            </View>
          </View>
          <View style={styles.fields}>
            <Row label="Adresse" value={`${m.street}   ${m.zip} ${m.city}`} />
            <View style={{ flexDirection: 'row' }}>
              <Row label="Date" value={fmtDayYear(m.start_date)} flex />
              <Row label="Heure" value={fmtRange(m.time_start, m.time_end)} flex />
            </View>
            <Row label="Résumé" value={m.description ?? ''} tall />
          </View>
        </ScrollView>
        {step === 0 ? (
          <Button title="Suivant" onPress={() => setStep(1)} />
        ) : (
          <Button title="Prépaiement" onPress={() => router.push(`/missions/${id}/prepay`)} />
        )}
      </View>
    </View>
  );
}

function Row({ label, value, flex, tall }: { label: string; value: string; flex?: boolean; tall?: boolean }) {
  return (
    <View style={[styles.row, flex && { flex: 1 }, tall && { minHeight: 120 }]}>
      <Txt variant="label">{label}</Txt>
      <Txt size={tall ? 16 : 20} lineHeight={tall ? 22 : 26}>
        {value}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.red },
  rate: { marginTop: -70, marginHorizontal: 12, backgroundColor: colors.blue, borderRadius: 20, paddingVertical: 14 },
  card: { flex: 1, marginTop: 10, marginHorizontal: 12, backgroundColor: colors.white, borderRadius: 24, padding: 16 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stars: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  fields: { marginTop: 14, gap: 2 },
  row: { backgroundColor: colors.bg, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: colors.white },
});
