import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme';
import type { Invoice } from '../lib/invoice';
import type { VatRateRow } from '../supabase/database.types';
import { chf } from '../lib/format';
import { Txt } from './Txt';

/** Décompte de mission : lignes, codes TVA, total TTC (maquettes « Mission en cours » / « Résumé de la mission »). */
export function InvoiceSummary({ invoice, vatRates, legend = true }: { invoice: Invoice; vatRates: VatRateRow[]; legend?: boolean }) {
  return (
    <View>
      {legend ? (
        <View style={styles.legend}>
          <Txt size={15} color={colors.red}>
            Code TVA%
          </Txt>
          {vatRates.map((v) => (
            <Txt key={v.code} size={15} color={colors.red}>
              {v.code}   {Number(v.rate).toFixed(1)}%
            </Txt>
          ))}
        </View>
      ) : null}
      {invoice.lines.map((l) => (
        <View key={l.key} style={styles.line}>
          <Txt size={15} style={styles.flex} numberOfLines={1}>
            {l.label} {l.detail ? <Txt size={15} color={colors.greyText}>{l.detail}</Txt> : null}
          </Txt>
          <Txt size={15}>{l.isBase ? chf(l.amount) : `+ ${chf(l.amount)}`}</Txt>
          <Txt size={15} color={colors.red} style={styles.code}>
            {l.vatCode}
          </Txt>
        </View>
      ))}
      <View style={styles.rule} />
      <View style={styles.line}>
        <View style={styles.flex} />
        <Txt size={15}>{chf(invoice.subtotal)}</Txt>
        <View style={styles.code} />
      </View>
      {invoice.vatLines.map((v) => (
        <View key={v.code} style={styles.line}>
          <Txt size={15} style={styles.flex}>
            TVA {Number(v.rate).toFixed(1)} S/{chf(v.base, { prefix: false })}.-
          </Txt>
          <Txt size={15}>{chf(v.amount)}</Txt>
          <View style={styles.code} />
        </View>
      ))}
      <View style={styles.rule} />
      <View style={styles.line}>
        <Txt size={16} style={styles.flex}>
          Total TTC à payer
        </Txt>
        <Txt size={16}>{chf(invoice.total)}</Txt>
        <View style={styles.code} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  legend: { alignItems: 'flex-end', marginBottom: 12, marginRight: 4 },
  line: { flexDirection: 'row', alignItems: 'center', paddingVertical: 3 },
  flex: { flex: 1 },
  code: { width: 20, textAlign: 'right' },
  rule: { height: 1.5, backgroundColor: colors.black, marginVertical: 6 },
});
