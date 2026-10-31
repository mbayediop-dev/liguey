import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, ScreenTitle } from '../../components/Screen';
import { BottomBar } from '../../components/BottomBar';
import { DayPicker, TimeSlotPicker, addMinutes } from '../../components/OptionSheet';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Txt } from '../../components/Txt';
import { colors } from '../../theme';
import { useMission, useReschedules } from '../../hooks/queries';
import { useAuth } from '../../hooks/useAuth';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { keys } from '../../hooks/queryClient';
import { proposeReschedule, respondReschedule } from '../../api/missions';
import { fmtDayYear, fmtRange, fmtTime } from '../../lib/format';

function minutesBetween(a: string, b: string) {
  const [ah, am] = a.split(':').map(Number);
  const [bh, bm] = b.split(':').map(Number);
  return ((bh ?? 0) * 60 + (bm ?? 0)) - ((ah ?? 0) * 60 + (am ?? 0));
}

/** « Demander un changement d'heure » / « Proposer autre date et/ou heure ». */
export function RescheduleScreen({ missionId }: { missionId: string }) {
  const router = useRouter();
  const { session } = useAuth();
  const me = session!.user.id;
  const mission = useMission(missionId);
  const reschedules = useReschedules(missionId);
  const m = mission.data;
  const [date, setDate] = useState<string | null>(m?.start_date ?? null);
  const [start, setStart] = useState(fmtTime(m?.time_start) || '09:00');
  const [duration, setDuration] = useState(m ? Math.max(30, minutesBetween(fmtTime(m.time_start), fmtTime(m.time_end))) : 60);

  const propose = useAsyncAction(() => proposeReschedule(missionId, date!, start, addMinutes(start, duration)), {
    invalidate: [keys.reschedules(missionId), keys.mission(missionId)],
    onSuccess: () => router.back(),
  });
  const respond = useAsyncAction((id: string, accept: boolean) => respondReschedule(id, accept), {
    invalidate: [keys.reschedules(missionId), keys.mission(missionId), keys.missions],
  });

  const pendingFromOther = (reschedules.data ?? []).filter((r) => r.status === 'pending' && r.proposed_by !== me);
  const myPending = (reschedules.data ?? []).find((r) => r.status === 'pending' && r.proposed_by === me);

  return (
    <Screen scroll footer={<BottomBar title="Proposer cet horaire" onPress={() => propose.run()} disabled={!date} loading={propose.loading} />}>
      <ScreenTitle>Changement{'\n'}d’horaire</ScreenTitle>
      {m ? (
        <Txt size={16} color={colors.greyDark} style={{ marginBottom: 16 }}>
          Actuellement : {fmtDayYear(m.start_date)}, {fmtRange(m.time_start, m.time_end)}
        </Txt>
      ) : null}
      {pendingFromOther.map((r) => (
        <Card key={r.id} style={{ marginBottom: 12 }}>
          <Txt size={16} weight="semibold">
            Nouvel horaire proposé
          </Txt>
          <Txt size={18} style={{ marginVertical: 6 }}>
            {fmtDayYear(r.start_date)} · {fmtRange(r.time_start, r.time_end)}
          </Txt>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button title="Refuser" variant="outline" size="md" onPress={() => respond.run(r.id, false)} style={{ flex: 1 }} />
            <Button title="Accepter" size="md" onPress={() => respond.run(r.id, true)} style={{ flex: 1 }} />
          </View>
        </Card>
      ))}
      {myPending ? (
        <Card tone="grey" style={{ marginBottom: 12 }}>
          <Txt size={15} color={colors.greyDark}>
            Votre proposition ({fmtDayYear(myPending.start_date)} · {fmtRange(myPending.time_start, myPending.time_end)}) est en attente de réponse.
          </Txt>
        </Card>
      ) : null}
      <Txt size={14} color={colors.greyText} style={{ marginBottom: 8 }}>
        Nouvelle date
      </Txt>
      <DayPicker value={date} onChange={setDate} />
      <View style={{ height: 18 }} />
      <TimeSlotPicker start={start} duration={duration} onChange={(s, d) => { setStart(s); setDuration(d); }} />
    </Screen>
  );
}
