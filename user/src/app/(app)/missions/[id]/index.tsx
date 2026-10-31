import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, IconCircle, MissionCard, Txt, cancelMission, colors, confirmStart, fullName, keys, useAsyncAction, useMission, useMyReview } from '@heroes/shared';
import { useRequestDraft } from '@/store/requestDraft';

/** Carte de mission présentée par-dessus le dashboard (modale transparente). Le contenu dépend du statut. */
export default function MissionModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const mission = useMission(id);
  const myReview = useMyReview(id);
  const patch = useRequestDraft((s) => s.patch);
  const [editMenu, setEditMenu] = useState(false);
  const m = mission.data;

  const inv = [keys.mission(id), keys.missions];
  const cancel = useAsyncAction(() => cancelMission(id), { invalidate: inv, onSuccess: () => router.back() });
  const confirm = useAsyncAction(() => confirmStart(id), { invalidate: inv });

  const askCancel = () =>
    Alert.alert('Annuler la mission', 'Voulez-vous vraiment annuler cette mission ?', [
      { text: 'Non', style: 'cancel' },
      { text: 'Oui, annuler', style: 'destructive', onPress: () => void cancel.run() },
    ]);

  const reorder = () => {
    if (!m) return;
    patch({ serviceId: m.service_id, subServiceId: m.sub_service_id, street: m.street, zip: m.zip, city: m.city });
    router.back();
    setTimeout(() => router.push('/request/new'), 50);
  };

  const close = () => router.back();

  if (!m) {
    return <Pressable style={styles.backdrop} onPress={close} />;
  }

  const actions = (opts: { edit?: boolean; chat?: boolean; add?: boolean; cancel?: boolean } = {}) => (
    <View style={styles.actions}>
      {opts.cancel !== false ? <IconCircle name="close" onPress={askCancel} /> : <View style={{ width: 46 }} />}
      <View style={{ flex: 1 }} />
      <IconCircle name="pencil" tone={opts.edit === false ? 'pale' : 'red'} disabled={opts.edit === false} onPress={() => setEditMenu(true)} />
      <IconCircle name="chatbubble-ellipses" tone={opts.chat === false ? 'pale' : 'red'} disabled={opts.chat === false} onPress={() => router.push(`/chat/${id}`)} />
      <IconCircle name={opts.add === false ? 'remove' : 'add'} onPress={reorder} />
    </View>
  );

  let body: React.ReactNode = null;
  let bubble: string | undefined;
  let footer: React.ReactNode = null;
  let headerRight: 'time' | 'status' = 'time';

  switch (m.status) {
    case 'searching':
    case 'posted':
      footer = (
        <>
          <Button title="Voir la recherche" variant="blue" size="md" onPress={() => { router.back(); setTimeout(() => router.push(`/missions/${id}/search`), 50); }} />
          <View style={{ height: 10 }} />
          {actions({ edit: false, chat: false })}
        </>
      );
      break;
    case 'pending_validation':
      headerRight = 'status';
      bubble = `${fullName(m.pro)}\nA ACCEPTÉ\nLA MISSION`;
      footer = (
        <>
          {actions()}
          <View style={styles.row}>
            <Button title="Annuler" variant="white" size="md" onPress={askCancel} style={{ flex: 1, borderWidth: 1, borderColor: colors.grey }} />
            <Button title="Valider" size="md" onPress={() => { router.back(); setTimeout(() => router.push(`/missions/${id}/validate`), 50); }} style={{ flex: 1 }} />
          </View>
        </>
      );
      break;
    case 'confirmed':
      headerRight = 'time';
      footer = editMenu ? (
        <View style={{ gap: 10 }}>
          <Button title="Demander un changement d'heure" variant="blue" size="md" onPress={() => { setEditMenu(false); router.push(`/missions/${id}/reschedule`); }} />
          <Button title="Annuler la mission" size="md" onPress={askCancel} />
          <Button title="Retour" variant="ghost" size="sm" onPress={() => setEditMenu(false)} />
        </View>
      ) : (
        actions()
      );
      break;
    case 'start_requested':
      headerRight = 'status';
      bubble = 'LA MISSION\nA DÉMARRÉ';
      footer = <Button title="Confirmer la mission" size="md" onPress={() => confirm.run()} loading={confirm.loading} style={{ marginHorizontal: 40 }} />;
      break;
    case 'in_progress':
      headerRight = 'status';
      body = (
        <View style={styles.hop}>
          <Txt size={40} lineHeight={46} weight="medium" center>
            HOP,{'\n'}C’EST PARTI !
          </Txt>
        </View>
      );
      footer = (
        <View style={{ gap: 10 }}>
          <Button title="Aperçu de la mission" variant="blue" size="md" onPress={() => router.push(`/missions/${id}/summary`)} />
          <Button title="Fin de la mission" size="md" onPress={() => Alert.alert('Fin de la mission', 'Votre héros clôture la mission depuis son application. Vous recevrez ensuite le résumé à valider.')} />
        </View>
      );
      break;
    case 'completed':
      headerRight = 'time';
      body = (
        <View style={styles.hop}>
          <Txt size={22} center>
            Mission terminée
          </Txt>
          <Txt size={15} center color={colors.greyDark} style={{ marginTop: 6 }}>
            {m.client_confirmed_at ? 'Merci pour votre confiance !' : 'Consultez le résumé et validez la mission.'}
          </Txt>
        </View>
      );
      footer = (
        <View style={{ gap: 10 }}>
          {!m.client_confirmed_at ? (
            <Button title="Voir le résumé" variant="blue" size="md" onPress={() => router.push(`/missions/${id}/summary`)} />
          ) : !myReview.data ? (
            <Button title="Notez votre hero" variant="blue" size="md" onPress={() => router.push(`/missions/${id}/rate`)} />
          ) : null}
          <View style={styles.actions}>
            <Button title="Re-Commander un service" size="md" onPress={reorder} style={{ flex: 1 }} textStyle={{ fontSize: 15 }} />
            <IconCircle name="pencil" tone="pale" disabled />
            <IconCircle name="chatbubble-ellipses" onPress={() => router.push(`/chat/${id}`)} />
          </View>
        </View>
      );
      break;
    case 'cancelled':
      body = (
        <View style={styles.hop}>
          <Txt size={22} center>
            Mission annulée
          </Txt>
        </View>
      );
      footer = <Button title="Re-Commander un service" size="md" onPress={reorder} />;
      break;
  }

  return (
    <View style={styles.backdrop}>
      <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      <View style={[styles.cardWrap, { paddingTop: insets.top + 56, paddingBottom: insets.bottom + 12 }]} pointerEvents="box-none">
        <MissionCard mission={m} perspective="client" headerRight={headerRight} bubble={bubble} footer={footer}>
          {body ?? undefined}
        </MissionCard>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  cardWrap: { flex: 1, paddingHorizontal: 12, justifyContent: 'flex-start' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  row: { flexDirection: 'row', gap: 10, marginTop: 12 },
  hop: { minHeight: 300, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg, padding: 20 },
});
