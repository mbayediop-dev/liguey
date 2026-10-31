import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Button,
  Chip,
  ChipWord,
  DayPicker,
  OptionList,
  OptionSheet,
  PageHeader,
  RECURRENCE_OPTIONS,
  TextField,
  TimeSlotPicker,
  Txt,
  addMinutes,
  colors,
  recurrenceLabel,
  toISODate,
  useAuth,
  useService,
  weekdayLabel,
  type RecurrenceKind,
} from '@heroes/shared';
import { useRequestDraft } from '@/store/requestDraft';

type Sheet = 'address' | 'date' | 'recurrence' | 'time' | null;

/** Écran « Confirmation » : phrase à trous composée de chips modifiables, puis « Reserver maintenant ». */
export default function NewRequest() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const draft = useRequestDraft();
  const service = useService(draft.serviceId ?? undefined);
  const sub = service.data?.sub_services.find((s) => s.id === draft.subServiceId);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [addr, setAddr] = useState({ street: draft.street, zip: draft.zip, city: draft.city });

  useEffect(() => {
    if (!draft.street && profile?.street) {
      draft.patch({ street: profile.street, zip: profile.zip ?? '', city: profile.city ?? '' });
      setAddr({ street: profile.street, zip: profile.zip ?? '', city: profile.city ?? '' });
    }
    if (!draft.startDate) draft.patch({ startDate: toISODate(new Date()) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  const ready = !!draft.serviceId && !!draft.street && !!draft.zip && !!draft.city && !!draft.startDate;
  const serviceName = (service.data?.name ?? 'service').toLowerCase();
  const article = /^[aeiouyéèêh]/i.test(serviceName) ? "d'un" : 'd’un';

  return (
    <View style={styles.root}>
      <PageHeader title="Confirmation" />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}>
        <Txt size={30} lineHeight={36} style={{ marginBottom: 12 }}>
          J’ai besoin {article}{'\n'}
          {serviceName} pour
        </Txt>
        <View style={styles.wrap}>
          <Chip label={(sub?.name ?? service.data?.name ?? '').toLowerCase()} onPress={() => router.back()} />
          <ChipWord>à</ChipWord>
          <Chip label={draft.street ? `${draft.street}\n${draft.zip} ${draft.city}` : 'Adresse'} onPress={() => setSheet('address')} />
          <ChipWord>dès</ChipWord>
          <Chip label={draft.startDate ? weekdayLabel(draft.startDate) : 'Jour'} onPress={() => setSheet('date')} />
          <Chip label={recurrenceLabel(draft.recurrence)} onPress={() => setSheet('recurrence')} />
          <ChipWord>à</ChipWord>
          <Chip label={`${draft.timeStart}-${addMinutes(draft.timeStart, draft.duration)}`} onPress={() => setSheet('time')} />
        </View>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Button title="Reserver maintenant" onPress={() => router.push('/request/tools')} disabled={!ready} />
      </View>

      <OptionSheet
        visible={sheet === 'address'}
        onClose={() => setSheet(null)}
        title="Adresse de la mission"
        onConfirm={() => {
          draft.patch(addr);
          setSheet(null);
        }}
        confirmDisabled={!addr.street || !addr.zip || !addr.city}
      >
        <View style={{ gap: 10 }}>
          <TextField tone="grey" placeholder="Rue, Nr." value={addr.street} onChangeText={(t) => setAddr((a) => ({ ...a, street: t }))} />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TextField tone="grey" placeholder="NPA" value={addr.zip} onChangeText={(t) => setAddr((a) => ({ ...a, zip: t }))} keyboardType="number-pad" containerStyle={{ width: 110 }} />
            <TextField tone="grey" placeholder="Ville" value={addr.city} onChangeText={(t) => setAddr((a) => ({ ...a, city: t }))} containerStyle={{ flex: 1 }} />
          </View>
        </View>
      </OptionSheet>

      <OptionSheet visible={sheet === 'date'} onClose={() => setSheet(null)} title="À partir de quel jour ?" onConfirm={() => setSheet(null)}>
        <DayPicker value={draft.startDate} onChange={(d) => draft.patch({ startDate: d })} />
      </OptionSheet>

      <OptionSheet visible={sheet === 'recurrence'} onClose={() => setSheet(null)} title="Fréquence">
        <OptionList<RecurrenceKind>
          options={RECURRENCE_OPTIONS}
          value={draft.recurrence}
          onSelect={(v) => {
            draft.patch({ recurrence: v });
            setSheet(null);
          }}
        />
      </OptionSheet>

      <OptionSheet visible={sheet === 'time'} onClose={() => setSheet(null)} title="Créneau" onConfirm={() => setSheet(null)}>
        <TimeSlotPicker start={draft.timeStart} duration={draft.duration} onChange={(s, d) => draft.patch({ timeStart: s, duration: d })} />
      </OptionSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 12 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  footer: { paddingHorizontal: 12, paddingTop: 8 },
});
