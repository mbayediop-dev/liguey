import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Button,
  IconCircle,
  MissionCard,
  PageHeader,
  PetalsHeader,
  SearchRing,
  Txt,
  cancelMission,
  chf,
  colors,
  fullName,
  keys,
  postMission,
  relaunchSearch,
  useAsyncAction,
  useAvailableCount,
  useMission,
} from '@heroes/shared';

const NO_RESULT_AFTER_MS = 45_000;

/** « Recherche en cours… » → « X a accepté la mission » / « Désolé, aucun résultat pour l'instant… ». */
export default function Search() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const mission = useMission(id);
  const m = mission.data;
  const count = useAvailableCount(m?.service_id);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (m?.status !== 'searching') return;
    setTimedOut(false);
    const started = new Date(m.updated_at).getTime();
    const remaining = Math.max(0, NO_RESULT_AFTER_MS - (Date.now() - started));
    const t = setTimeout(() => setTimedOut(true), remaining);
    return () => clearTimeout(t);
  }, [m?.status, m?.updated_at]);

  useEffect(() => {
    if (m && ['confirmed', 'start_requested', 'in_progress', 'completed', 'cancelled'].includes(m.status)) {
      router.replace(`/missions/${id}`);
    }
  }, [m, id, router]);

  const inv = [keys.mission(id), keys.missions];
  const cancel = useAsyncAction(() => cancelMission(id), { invalidate: inv, onSuccess: () => router.dismissTo('/') });
  const post = useAsyncAction(() => postMission(id), { invalidate: inv, onSuccess: () => router.dismissTo('/') });
  const relaunch = useAsyncAction(() => relaunchSearch(id), { invalidate: inv, onSuccess: () => setTimedOut(false) });

  if (!m) {
    return (
      <View style={styles.root}>
        <PageHeader title="Recherche" />
      </View>
    );
  }

  const serviceName = (m.service?.name ?? '').toUpperCase();

  if (m.status === 'pending_validation') {
    return (
      <View style={styles.root}>
        <PageHeader title="Recherche" />
        <PetalsHeader height={90} />
        <View style={[styles.overlay, { paddingBottom: insets.bottom + 12 }]}>
          <MissionCard
            mission={m}
            perspective="client"
            headerRight="status"
            bubble={`${fullName(m.pro)}\nA ACCEPTÉ\nLA MISSION`}
            footer={
              <View style={styles.actions}>
                <IconCircle name="close" onPress={() => cancel.run()} />
                <View style={styles.waiting}>
                  <Txt size={15} color={colors.white}>
                    En attente…
                  </Txt>
                </View>
                <IconCircle name="pencil" onPress={() => router.push(`/missions/${id}/reschedule`)} />
                <IconCircle name="chatbubble-ellipses" onPress={() => router.push(`/chat/${id}`)} />
                <IconCircle name="add" onPress={() => router.push(`/profile/${m.pro_id}`)} />
              </View>
            }
          />
          <View style={styles.bottomRow}>
            <Button title="Annuler" variant="white" onPress={() => cancel.run()} style={{ flex: 1 }} />
            <Button title="Valider" onPress={() => router.push(`/missions/${id}/validate`)} style={{ flex: 1 }} />
          </View>
        </View>
      </View>
    );
  }

  const noResult = m.status === 'posted' || timedOut;

  return (
    <View style={styles.root}>
      <PageHeader title="Recherche" />
      <PetalsHeader height={110} />
      <View style={[styles.card, { marginBottom: insets.bottom + 100 }]}>
        {noResult ? (
          <>
            <Txt size={24} lineHeight={30} center>
              {m.status === 'posted' ? 'Demande postée' : 'Désolé'}
            </Txt>
            <Txt size={20} lineHeight={26} center>
              {m.status === 'posted' ? 'Nous vous préviendrons dès qu’un héros accepte.' : 'Aucun résultats pour l’instant…'}
            </Txt>
            <View style={{ flex: 1 }} />
            {m.status === 'searching' ? <Button title="Poster ma demande" onPress={() => post.run()} loading={post.loading} /> : null}
            <Button title="Relancer la recherche" variant="blue" onPress={() => relaunch.run()} loading={relaunch.loading} style={{ marginTop: 10 }} />
            <Button title="Annuler la recherche" variant="outline" onPress={() => cancel.run()} style={{ marginTop: 10 }} />
          </>
        ) : (
          <>
            <Txt size={22} center>
              Veuillez patienter
            </Txt>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <SearchRing size={250}>
                <Txt size={22} center>
                  Recherche en cours…
                </Txt>
              </SearchRing>
            </View>
            <Txt size={20} lineHeight={26} center>
              Pour l’instant,{'\n'}
              {count.data ?? 0} <Txt size={20} weight="black">{serviceName}</Txt> disponibles{'\n'}pour {chf(m.base_amount_chf, { prefix: false })} CHF
            </Txt>
          </>
        )}
      </View>
      {!noResult ? (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <Button title="Annuler la recherche" variant="white" onPress={() => cancel.run()} loading={cancel.loading} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.red },
  card: { flex: 1, marginTop: -40, marginHorizontal: 12, backgroundColor: colors.white, borderRadius: 24, padding: 18 },
  footer: { position: 'absolute', left: 12, right: 12, bottom: 0 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', marginTop: -90, paddingTop: 100, paddingHorizontal: 12, justifyContent: 'flex-end' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  waiting: { flex: 1, height: 46, borderRadius: 23, backgroundColor: colors.redSoft, alignItems: 'center', justifyContent: 'center' },
  bottomRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
});
