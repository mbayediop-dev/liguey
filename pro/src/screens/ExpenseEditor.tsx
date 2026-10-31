import React, { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  IconCircle,
  TogglePill,
  Txt,
  addExpense,
  chooseFileSource,
  colors,
  fonts,
  keys,
  newFileName,
  uploadLocalFile,
  useAsyncAction,
  useAuth,
  type ExpenseKind,
  type MissionFull,
  type PickedFile,
  type VatRateRow,
} from '@heroes/shared';

const KINDS: { value: ExpenseKind; label: string }[] = [
  { value: 'material', label: 'Matériel' },
  { value: 'time', label: 'Temps' },
  { value: 'other', label: 'Autre' },
];

/** Formulaire « Ajouter des frais » : type, descriptif, prix, TVA, justificatif. */
export function ExpenseEditor({ mission, vatRates, onClose }: { mission: MissionFull; vatRates: VatRateRow[]; onClose: () => void }) {
  const { session } = useAuth();
  const [kind, setKind] = useState<ExpenseKind>('material');
  const [label, setLabel] = useState('');
  const [francs, setFrancs] = useState('');
  const [cents, setCents] = useState('');
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('30');
  const [vatCode, setVatCode] = useState<number>(vatRates[0]?.code ?? 1);
  const [receipt, setReceipt] = useState<PickedFile | null>(null);
  const [touched, setTouched] = useState(false);

  const totalMinutes = Number(hours || 0) * 60 + Number(minutes || 0);
  const amount = kind === 'time' ? Math.round(((Number(mission.client_rate_chf ?? 0) * totalMinutes) / 60) * 100) / 100 : Number(francs || 0) + Number(cents || 0) / 100;
  const valid = kind === 'time' ? totalMinutes > 0 : label.trim().length > 0 && amount > 0;
  const rate = vatRates.find((v) => v.code === (kind === 'time' ? 1 : vatCode))?.rate ?? 0;

  const save = useAsyncAction(
    async () => {
      let receiptPath: string | null = null;
      if (receipt) {
        receiptPath = `${mission.id}/${newFileName(receipt.mime)}`;
        await uploadLocalFile({ bucket: 'receipts', path: receiptPath, uri: receipt.uri, contentType: receipt.mime });
      }
      await addExpense({
        missionId: mission.id,
        createdBy: session!.user.id,
        kind,
        label: kind === 'time' ? 'Temps supplémentaire' : label.trim(),
        amount: Math.round(amount * 100) / 100,
        vatCode: kind === 'time' ? 1 : vatCode,
        minutes: kind === 'time' ? totalMinutes : null,
        receiptPath,
      });
    },
    { invalidate: [keys.expenses(mission.id)], onSuccess: onClose },
  );

  const submit = () => {
    setTouched(true);
    if (!valid) return;
    void save.run();
  };

  const isTime = kind === 'time';
  return (
    <View style={[styles.box, isTime ? styles.boxOutline : styles.boxBlue]}>
      <View style={styles.row}>
        <Txt size={20} color={isTime ? colors.black : colors.white}>
          Type
        </Txt>
        <View style={{ flex: 1 }} />
        {KINDS.map((k) => (
          <TogglePill key={k.value} label={k.label} selected={kind === k.value} onPress={() => setKind(k.value)} light={!isTime} style={{ marginLeft: 6 }} />
        ))}
      </View>

      {isTime ? (
        <View style={styles.field}>
          <Txt size={20}>Temps</Txt>
          <View style={{ flex: 1 }} />
          <TextInput value={hours} onChangeText={(t) => setHours(t.replace(/\D/g, '').slice(0, 2))} keyboardType="number-pad" style={styles.num} />
          <Txt size={20} color={colors.red}>
            heures
          </Txt>
          <TextInput value={minutes} onChangeText={(t) => setMinutes(t.replace(/\D/g, '').slice(0, 2))} keyboardType="number-pad" style={styles.num} />
          <Txt size={20} color={colors.red}>
            minutes
          </Txt>
        </View>
      ) : (
        <>
          <View style={styles.field}>
            <Txt size={20}>Descriptif</Txt>
            <TextInput value={label} onChangeText={setLabel} placeholder="Produits vaisselle" placeholderTextColor={touched && !label ? colors.red : colors.greyText} style={styles.text} />
          </View>
          <View style={styles.field}>
            <Txt size={20}>Prix CHF</Txt>
            <View style={{ flex: 1 }} />
            <TextInput value={francs} onChangeText={(t) => setFrancs(t.replace(/\D/g, '').slice(0, 5))} keyboardType="number-pad" placeholder="0" placeholderTextColor={touched && !amount ? colors.red : colors.greyText} style={styles.num} />
            <Txt size={20} color={colors.red}>
              CHF
            </Txt>
            <TextInput value={cents} onChangeText={(t) => setCents(t.replace(/\D/g, '').slice(0, 2))} keyboardType="number-pad" placeholder="00" placeholderTextColor={colors.greyText} style={styles.num} />
            <Txt size={20} color={colors.red}>
              centimes
            </Txt>
          </View>
          <View style={styles.field}>
            <Txt size={20}>% TVA</Txt>
            <View style={{ flex: 1 }} />
            {vatRates.map((v) => (
              <TogglePill key={v.code} label={`${Number(v.rate).toFixed(1)}%`} selected={vatCode === v.code} onPress={() => setVatCode(v.code)} style={{ marginLeft: 8 }} />
            ))}
          </View>
          <View style={styles.row}>
            <IconCircle name="attach-outline" size={50} onPress={() => chooseFileSource({ allowPdf: true }).then((f) => f && setReceipt(f))} />
            <View style={[styles.attach, receipt && { backgroundColor: colors.red }]}>
              <Txt size={17} color={receipt ? colors.white : 'rgba(255,255,255,0.7)'} numberOfLines={1}>
                {receipt ? receipt.name ?? 'Justificatif joint' : 'Joindre ticket d’achat/facture'}
              </Txt>
              {receipt ? <Ionicons name="checkmark" size={20} color={colors.white} /> : null}
            </View>
          </View>
        </>
      )}

      <View style={[styles.row, { marginTop: 10 }]}>
        <Txt size={15} color={isTime ? colors.black : colors.white} style={{ flex: 1 }}>
          Frais supplémentaires CHF {amount.toFixed(2)} + ({Number(rate).toFixed(1)}%)
        </Txt>
        <IconCircle name="close" size={50} onPress={onClose} />
        <IconCircle name="checkmark" size={50} onPress={submit} disabled={save.loading} />
      </View>
      {touched && !valid ? (
        <Txt size={15} center color={isTime ? colors.red : colors.white} style={{ marginTop: 6 }}>
          Tous les champs sont obligatoires
        </Txt>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderRadius: 24, padding: 12, gap: 10 },
  boxBlue: { backgroundColor: colors.blue },
  boxOutline: { borderWidth: 1.5, borderColor: colors.black, backgroundColor: colors.white },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  field: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.bg, borderRadius: 24, paddingHorizontal: 14, minHeight: 56 },
  text: { flex: 1, fontFamily: fonts.regular, fontSize: 20, textAlign: 'right', backgroundColor: colors.white, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, marginVertical: 6 },
  num: { minWidth: 42, fontFamily: fonts.regular, fontSize: 20, textAlign: 'right', paddingVertical: 6, color: colors.black },
  attach: { flex: 1, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.25)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 14 },
});
