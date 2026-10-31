import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, InvoiceSummary, PageHeader, Txt, buildInvoice, chf, colors, confirmCompletion, keys, useAsyncAction, useExpenses, useMission, useMyReview, useVatRates } from '@heroes/shared';

/** « Résumé de la mission » côté client : frais, TVA, total → Valider → notation du héros. */
export default function Summary() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const mission = useMission(id);
  const expenses = useExpenses(id);
  const vat = useVatRates();
  const myReview = useMyReview(id);
  const m = mission.data;
  const invoice = useMemo(() => (m ? buildInvoice(m, expenses.data ?? [], vat.data ?? [], 'client') : null), [m, expenses.data, vat.data]);
  const confirm = useAsyncAction(() => confirmCompletion(id), {
    invalidate: [keys.mission(id), keys.missions],
    onSuccess: () => router.replace(`/missions/${id}/rate`),
  });
  if (!m || !invoice) return <View style={styles.root} />;
  const canValidate = m.status === 'completed' && !m.client_confirmed_at;
  return (
    <View style={styles.root}>
      <PageHeader plain />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        <Txt variant="h1" style={{ marginBottom: 14 }}>
          Résumé de{'\n'}la mission
        </Txt>
        <View style={{ gap: 8, marginBottom: 20 }}>
          {(expenses.data ?? []).map((e, i) => (
            <View key={e.id} style={[styles.expense, i % 2 === 1 && styles.expenseBlue]}>
              <Txt size={16} color={i % 2 === 1 ? colors.white : colors.black} style={{ flex: 1 }}>
                {e.label} ({Number(vat.data?.find((v) => v.code === e.vat_code)?.rate ?? 0).toFixed(1)}%)
              </Txt>
              <Txt size={16} color={i % 2 === 1 ? colors.white : colors.black}>
                + {chf(e.amount_chf)}
              </Txt>
            </View>
          ))}
          {(expenses.data ?? []).length === 0 ? <Txt color={colors.greyText}>Aucun frais supplémentaire</Txt> : null}
        </View>
        <View style={{ flex: 1 }} />
        <InvoiceSummary invoice={invoice} vatRates={vat.data ?? []} />
        {canValidate ? (
          <Button title="Valider" onPress={() => confirm.run()} loading={confirm.loading} style={{ marginTop: 20 }} />
        ) : m.status === 'completed' && !myReview.data ? (
          <Button title="Notez votre hero" onPress={() => router.push(`/missions/${id}/rate`)} style={{ marginTop: 20 }} />
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 12, paddingTop: 4, flexGrow: 1 },
  expense: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: colors.black, borderRadius: 24, paddingHorizontal: 18, paddingVertical: 10 },
  expenseBlue: { backgroundColor: colors.blue, borderColor: colors.blue },
});
