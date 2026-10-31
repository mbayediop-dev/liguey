import React, { useMemo, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Avatar,
  Button,
  IconCircle,
  InvoiceSummary,
  PageHeader,
  PetalsHeader,
  StatusWithLabel,
  Txt,
  buildInvoice,
  cancelMission,
  chf,
  colors,
  completeMission,
  deleteExpense,
  fmtTime,
  fullName,
  keys,
  requestStart,
  shortName,
  useAsyncAction,
  useExpenses,
  useMission,
  useMyReview,
  useVatRates,
} from '@heroes/shared';
import { ExpenseEditor } from './ExpenseEditor';

/** Mission côté pro : prêt → démarrage → en cours (frais, décompte) → terminée → notation du client. */
export default function ProMissionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const mission = useMission(id);
  const expenses = useExpenses(id);
  const vat = useVatRates();
  const myReview = useMyReview(id);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const m = mission.data;

  const inv = [keys.mission(id), keys.missions, keys.proStats, keys.liveRequests];
  const start = useAsyncAction(() => requestStart(id), { invalidate: inv });
  const complete = useAsyncAction(() => completeMission(id), { invalidate: inv, onSuccess: () => router.replace(`/missions/${id}/rate`) });
  const cancel = useAsyncAction(() => cancelMission(id), { invalidate: inv, onSuccess: () => router.dismissTo('/') });
  const remove = useAsyncAction(deleteExpense, { invalidate: [keys.expenses(id)] });

  const invoice = useMemo(() => (m ? buildInvoice(m, expenses.data ?? [], vat.data ?? [], 'pro') : null), [m, expenses.data, vat.data]);

  const askCancel = () =>
    Alert.alert('Annuler la mission', 'Le client sera prévenu et la mission remise en recherche.', [
      { text: 'Non', style: 'cancel' },
      { text: 'Oui, annuler', style: 'destructive', onPress: () => void cancel.run() },
    ]);

  if (!m || !invoice) {
    return (
      <View style={styles.root}>
        <PageHeader title="Mission en cours" />
      </View>
    );
  }

  const client = m.client;
  const maps = () => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${m.street}, ${m.zip} ${m.city}`)}`);
  const live = m.status === 'in_progress';
  const title = m.status === 'completed' ? 'Mission terminée' : m.status === 'cancelled' ? 'Mission annulée' : 'Mission en cours';

  return (
    <View style={styles.root}>
      <PageHeader title={title} />
      <PetalsHeader variant="leaves" height={130} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.head}>
            <Avatar path={client?.avatar_url} profile={client} size={50} />
            <Txt size={22} style={{ flex: 1 }} numberOfLines={1}>
              {fullName(client)}
            </Txt>
            {live || m.status === 'start_requested' || m.status === 'confirmed' ? (
              <StatusWithLabel status={m.status} size={40} />
            ) : (
              <View style={{ alignItems: 'flex-end' }}>
                <Txt size={18}>de {fmtTime(m.time_start)}</Txt>
                <Txt size={18}>à {fmtTime(m.time_end)}</Txt>
              </View>
            )}
          </View>

          {m.status === 'pending_validation' ? (
            <View style={styles.big}>
              <Txt size={30} lineHeight={38} weight="medium" center upper>
                En attente de validation de {shortName(client)}…
              </Txt>
              <Button title="Changer d’horaire" variant="blue" onPress={() => router.push(`/missions/${id}/reschedule`)} style={{ marginTop: 30 }} />
              <Button title="Me désister" variant="outline" onPress={askCancel} style={{ marginTop: 10 }} />
            </View>
          ) : null}

          {m.status === 'confirmed' || m.status === 'start_requested' ? (
            <View style={styles.big}>
              {m.status === 'start_requested' ? (
                <Txt size={32} lineHeight={40} weight="medium" center upper>
                  {shortName(client)} est en attente pour valider votre début de mission…
                </Txt>
              ) : (
                <>
                  <View style={styles.addressBlock}>
                    <Txt size={20} center>
                      {m.street}   {m.zip} {m.city}
                    </Txt>
                    <Button title="Voir sur Google Map" size="md" onPress={maps} style={{ marginTop: 10, paddingHorizontal: 40 }} />
                  </View>
                  <Txt size={28} lineHeight={36} weight="medium" center upper style={{ marginTop: 30 }}>
                    Prêt à démarrer ?
                  </Txt>
                </>
              )}
              <Button title="Annuler la mission" variant="blue" onPress={askCancel} style={{ marginTop: 30 }} />
              <Button title="Démarrer la mission" onPress={() => start.run()} loading={start.loading} disabled={m.status === 'start_requested'} style={{ marginTop: 10 }} />
            </View>
          ) : null}

          {live || m.status === 'completed' ? (
            <>
              <View style={styles.addressBlock}>
                <Txt size={20} center>
                  {m.street}   {m.zip} {m.city}
                </Txt>
                <Button title="Voir sur Google Map" size="md" onPress={maps} style={{ marginTop: 10, paddingHorizontal: 40 }} />
              </View>

              {live ? (
                <View style={styles.toolbar}>
                  <IconCircle name="pencil" size={46} tone={deleting ? 'red' : 'pale'} onPress={() => setDeleting((v) => !v)} />
                  <Button title="Supprimer des frais" variant="blue" size="sm" onPress={() => setDeleting((v) => !v)} disabled={(expenses.data ?? []).length === 0} style={{ flex: 1 }} textStyle={{ fontSize: 14 }} />
                  <Button title="Ajouter des frais" size="sm" onPress={() => setAdding(true)} disabled={adding} style={{ flex: 1 }} textStyle={{ fontSize: 14 }} />
                </View>
              ) : null}

              <View style={{ gap: 8, marginTop: 10 }}>
                {(expenses.data ?? []).map((e, i) => (
                  <View key={e.id} style={styles.expenseRow}>
                    {deleting && live ? <IconCircle name="trash-outline" size={46} onPress={() => remove.run(e.id)} /> : null}
                    <View style={[styles.expense, i % 2 === 1 && styles.expenseBlue]}>
                      <Txt size={16} color={i % 2 === 1 ? colors.white : colors.black} style={{ flex: 1 }} numberOfLines={1}>
                        {e.label} ({Number(vat.data?.find((v) => v.code === e.vat_code)?.rate ?? 0).toFixed(1)}%)
                      </Txt>
                      <Txt size={16} color={i % 2 === 1 ? colors.white : colors.black}>
                        + {chf(e.amount_chf)}
                      </Txt>
                    </View>
                  </View>
                ))}
                {adding ? <ExpenseEditor mission={m} vatRates={vat.data ?? []} onClose={() => setAdding(false)} /> : null}
                {deleting ? (
                  <Pressable onPress={() => setDeleting(false)} style={{ alignSelf: 'flex-end' }}>
                    <View style={styles.cancelPill}>
                      <Txt size={16} color={colors.white}>
                        Annuler
                      </Txt>
                    </View>
                  </Pressable>
                ) : null}
              </View>

              <View style={{ marginTop: 24 }}>
                <InvoiceSummary invoice={invoice} vatRates={vat.data ?? []} />
              </View>

              {live ? (
                <Button title="Mission terminée" onPress={() => complete.run()} loading={complete.loading} disabled={adding} style={{ marginTop: 20 }} />
              ) : !myReview.data ? (
                <Button title="Notez votre client" variant="blue" onPress={() => router.push(`/missions/${id}/rate`)} style={{ marginTop: 20 }} />
              ) : (
                <Txt center color={colors.greyText} style={{ marginTop: 20 }}>
                  Merci ! Votre avis a été enregistré.
                </Txt>
              )}
            </>
          ) : null}

          {m.status === 'cancelled' ? (
            <View style={styles.big}>
              <Txt size={26} center color={colors.greyDark}>
                Cette mission a été annulée.
              </Txt>
            </View>
          ) : null}

          {m.status === 'searching' || m.status === 'posted' ? (
            <View style={styles.big}>
              <Txt size={22} center color={colors.greyDark}>
                Cette demande est en recherche.
              </Txt>
              <Button title="Voir l’offre" onPress={() => router.push(`/offers/${id}`)} style={{ marginTop: 20 }} />
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.red },
  content: { paddingHorizontal: 12 },
  card: { marginTop: -24, backgroundColor: colors.bg, borderRadius: 24, overflow: 'hidden', paddingBottom: 16 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 },
  big: { padding: 20, paddingTop: 30, minHeight: 420, justifyContent: 'center' },
  addressBlock: { backgroundColor: colors.white, paddingVertical: 14, paddingHorizontal: 12, alignItems: 'center' },
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10, paddingTop: 12 },
  expenseRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10 },
  expense: { flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: colors.black, borderRadius: 24, paddingHorizontal: 18, paddingVertical: 10 },
  expenseBlue: { backgroundColor: colors.blue, borderColor: colors.blue },
  cancelPill: { backgroundColor: colors.red, borderRadius: 24, paddingHorizontal: 24, paddingVertical: 10, marginRight: 10 },
});
