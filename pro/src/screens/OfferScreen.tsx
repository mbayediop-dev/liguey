import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Avatar,
  Button,
  DayPicker,
  OptionSheet,
  Stars,
  TimeSlotPicker,
  Txt,
  acceptMission,
  addMinutes,
  chf,
  colors,
  declineMission,
  fmtDayFull,
  fmtDayYear,
  fmtRange,
  fmtTime,
  fullName,
  keys,
  ratingColor,
  useAsyncAction,
  useMission,
} from '@heroes/shared';

/** Modale d'offre : fiche du client, détails, gain horaire → Accepter / Proposer autre date / Refuser. */
export default function OfferScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const mission = useMission(id);
  const m = mission.data;
  const [propose, setPropose] = useState(false);
  const [date, setDate] = useState<string | null>(null);
  const [start, setStart] = useState('09:00');
  const [duration, setDuration] = useState(60);

  const inv = [keys.liveRequests, keys.missions, keys.mission(id), keys.proStats];
  const accept = useAsyncAction((proposal?: { date: string; start: string; end: string }) => acceptMission(id, proposal), {
    invalidate: inv,
    onSuccess: () => {
      router.back();
      setTimeout(() => router.push(`/missions/${id}`), 60);
    },
  });
  const decline = useAsyncAction(() => declineMission(id), { invalidate: inv, onSuccess: () => router.back() });

  const close = () => router.back();
  if (!m) return <Pressable style={styles.backdrop} onPress={close} />;
  const client = m.client;
  const rating = Number(client?.rating_avg ?? 0);
  const unavailable = m.status !== 'searching' && m.status !== 'posted';

  return (
    <View style={styles.backdrop}>
      <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      <View style={[styles.card, { marginTop: insets.top + 8, marginBottom: insets.bottom + 8 }]}>
        <ScrollView contentContainerStyle={{ padding: 14 }} showsVerticalScrollIndicator={false}>
          <View style={styles.head}>
            <Avatar path={client?.avatar_url} profile={client} size={96} />
            <View style={{ flex: 1 }}>
              <Txt size={26} lineHeight={30} weight="medium">
                {fullName(client)}
              </Txt>
              <View style={styles.stars}>
                <Stars rating={rating} size={22} />
                <Txt size={15} color={colors[ratingColor(rating || 5)]}>
                  {rating.toFixed(1)}/5
                </Txt>
              </View>
            </View>
          </View>
          <View style={styles.fields}>
            <Cell label="Adresse" value={`${m.street}    ${m.zip} ${m.city}`} />
            <View style={{ flexDirection: 'row', gap: 2 }}>
              <Cell label="Date" value={fmtDayYear(m.start_date)} flex />
              <Cell label="Heure" value={fmtRange(m.time_start, m.time_end)} flex />
            </View>
            <Cell
              label="Résumé"
              value={`${fullName(client)} a besoin d’un héros ${(m.service?.name ?? '').toUpperCase()}${m.sub_service ? ` pour ${m.sub_service.name.toLowerCase()}` : ''} à ${m.street}, ${m.city}\n${fmtDayFull(m.start_date)} à ${fmtTime(m.time_start)}`}
              tall
            />
            <View style={styles.gain}>
              <Txt size={16} color={colors.red}>
                Gain horaire TTC
              </Txt>
              <Txt size={16} color={colors.red}>
                {chf(m.pro_rate_chf, { prefix: false }).replace('.', ',')} CHF/Hr
              </Txt>
            </View>
          </View>
          {unavailable ? (
            <Txt center color={colors.greyText} style={{ marginTop: 20 }}>
              Cette demande n’est plus disponible.
            </Txt>
          ) : (
            <View style={{ gap: 10, marginTop: 20 }}>
              <Button title="Accepter" onPress={() => accept.run(undefined)} loading={accept.loading} />
              <Button title="Proposer autre date et/ou heure" variant="blue" onPress={() => { setDate(m.start_date); setStart(fmtTime(m.time_start)); setPropose(true); }} textStyle={{ fontSize: 17 }} />
              <Button title="Refuser" variant="outline" onPress={() => decline.run()} loading={decline.loading} />
            </View>
          )}
        </ScrollView>
      </View>

      <OptionSheet
        visible={propose}
        onClose={() => setPropose(false)}
        title="Proposer un autre horaire"
        confirmLabel="Accepter avec cet horaire"
        confirmDisabled={!date || accept.loading}
        onConfirm={() => {
          setPropose(false);
          void accept.run({ date: date!, start, end: addMinutes(start, duration) });
        }}
      >
        <DayPicker value={date} onChange={setDate} />
        <View style={{ height: 14 }} />
        <TimeSlotPicker start={start} duration={duration} onChange={(s, d) => { setStart(s); setDuration(d); }} />
      </OptionSheet>
    </View>
  );
}

function Cell({ label, value, flex, tall }: { label: string; value: string; flex?: boolean; tall?: boolean }) {
  return (
    <View style={[styles.cell, flex && { flex: 1 }, tall && { minHeight: 150 }]}>
      <Txt variant="label">{label}</Txt>
      <Txt size={tall ? 16 : 20} lineHeight={tall ? 22 : 26}>
        {value}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  card: { flex: 1, marginHorizontal: 12, backgroundColor: colors.white, borderRadius: 24, overflow: 'hidden' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.bg, margin: -14, marginBottom: 0, padding: 14 },
  stars: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  fields: { marginTop: 24, gap: 2, borderWidth: 1, borderColor: colors.bg },
  cell: { backgroundColor: colors.white, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: colors.bg },
  gain: { flexDirection: 'row', justifyContent: 'space-between', borderWidth: 1.5, borderColor: colors.red, borderRadius: 24, paddingHorizontal: 18, paddingVertical: 10, margin: 10 },
});
