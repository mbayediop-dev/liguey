import React, { useMemo } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { addDays } from 'date-fns';
import { colors } from '../theme';
import { Txt } from './Txt';
import { SelectPill } from './Pill';
import { Button } from './Button';
import { fmtDay, toISODate, weekdayLabel } from '../lib/format';

interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  confirmLabel?: string;
  onConfirm?: () => void;
  confirmDisabled?: boolean;
}

/** Feuille modale basse réutilisée pour les sélecteurs (adresse, jour, récurrence, créneau). */
export function OptionSheet({ visible, onClose, title, children, confirmLabel = 'Valider', onConfirm, confirmDisabled }: SheetProps) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 12 }]}>
          {title ? (
            <Txt size={22} style={styles.title}>
              {title}
            </Txt>
          ) : null}
          <ScrollView style={{ maxHeight: 420 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
          {onConfirm ? <Button title={confirmLabel} onPress={onConfirm} disabled={confirmDisabled} size="md" style={{ marginTop: 14 }} /> : null}
        </View>
      </View>
    </Modal>
  );
}

export function OptionList<T extends string>({ options, value, onSelect }: { options: { value: T; label: string }[]; value: T | null; onSelect: (v: T) => void }) {
  return (
    <View style={{ gap: 8 }}>
      {options.map((o) => (
        <SelectPill key={o.value} label={o.label} selected={o.value === value} onPress={() => onSelect(o.value)} style={{ backgroundColor: o.value === value ? colors.red : colors.bg }} />
      ))}
    </View>
  );
}

/** Choix d'un jour parmi les 30 prochains. */
export function DayPicker({ value, onChange, days = 30 }: { value: string | null; onChange: (iso: string) => void; days?: number }) {
  const list = useMemo(() => Array.from({ length: days }).map((_, i) => toISODate(addDays(new Date(), i))), [days]);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
      {list.map((iso) => {
        const sel = iso === value;
        return (
          <Pressable key={iso} onPress={() => onChange(iso)} style={[styles.day, sel && { backgroundColor: colors.red }]}>
            <Txt size={13} color={sel ? colors.white : colors.greyText}>
              {weekdayLabel(iso).slice(0, 3)}
            </Txt>
            <Txt size={16} color={sel ? colors.white : colors.black}>
              {fmtDay(iso)}
            </Txt>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export const TIME_SLOTS = Array.from({ length: 33 }).map((_, i) => {
  const h = 6 + Math.floor(i / 2);
  const m = i % 2 ? '30' : '00';
  return `${String(h).padStart(2, '0')}:${m}`;
});

export const DURATIONS = [30, 60, 90, 120, 180, 240, 300, 360, 480];

export function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = (h ?? 0) * 60 + (m ?? 0) + minutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export function durationLabel(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (!h) return `${m} min`;
  return m ? `${h}h${m}` : `${h}h`;
}

/** Heure de début + durée → créneau. */
export function TimeSlotPicker({ start, duration, onChange }: { start: string; duration: number; onChange: (start: string, duration: number) => void }) {
  return (
    <View style={{ gap: 14 }}>
      <Txt size={14} color={colors.greyText}>
        Heure de début
      </Txt>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {TIME_SLOTS.map((t) => (
          <SelectPill key={t} label={t} small selected={t === start} onPress={() => onChange(t, duration)} style={{ backgroundColor: t === start ? colors.red : colors.bg }} />
        ))}
      </ScrollView>
      <Txt size={14} color={colors.greyText}>
        Durée
      </Txt>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {DURATIONS.map((d) => (
          <SelectPill key={d} label={durationLabel(d)} small selected={d === duration} onPress={() => onChange(start, d)} style={{ backgroundColor: d === duration ? colors.red : colors.bg }} />
        ))}
      </ScrollView>
      <Txt size={16} center>
        {start} – {addMinutes(start, duration)}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 16, paddingTop: 18 },
  title: { marginBottom: 12 },
  day: { backgroundColor: colors.bg, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, alignItems: 'center', minWidth: 84 },
});
