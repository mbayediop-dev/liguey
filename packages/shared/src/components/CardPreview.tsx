import React from 'react';
import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '../theme';
import { images } from '../assets';
import { Txt } from './Txt';

interface Props {
  brand: string;
  last4?: string | null;
  holder?: string | null;
  /** Numéro complet masqué côté formulaire : seul le dernier groupe est affiché. */
  number?: string;
  style?: StyleProp<ViewStyle>;
  dimmed?: boolean;
  height?: number;
}

const BG: Record<string, string> = { mastercard: colors.cardGrey, visa: colors.cardBlue, amex: colors.cardBeige, unknown: '#D9D9D9' };

/** Carte bancaire stylisée des maquettes (HEROES, puce, logo du réseau). */
export function CardPreview({ brand, last4, holder, style, dimmed, height = 220 }: Props) {
  const logo = brand === 'mastercard' ? images.brandMastercard : brand === 'visa' ? images.brandVisa : brand === 'amex' ? images.brandAmex : null;
  return (
    <View style={[styles.card, { backgroundColor: BG[brand] ?? BG.unknown, height }, dimmed && { opacity: 0.6 }, style]}>
      <Image source={images.wordmarkHeroes} style={styles.wordmark} resizeMode="contain" />
      {last4 ? (
        <View style={styles.meta}>
          <Txt size={16} lineHeight={18}>
            •••• •••• •••• {last4}
          </Txt>
          <Txt size={16} lineHeight={18}>
            {(holder ?? '').toUpperCase()}   {brand.toUpperCase()}
          </Txt>
        </View>
      ) : null}
      <View style={styles.chip}>
        <View style={styles.chipLineH} />
        <View style={styles.chipLineV} />
        <View style={styles.chipCenter} />
      </View>
      {logo ? <Image source={logo} style={[styles.logo, brand === 'amex' && styles.amex]} resizeMode="contain" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 18, padding: 18, overflow: 'hidden' },
  wordmark: { width: 104, height: 24 },
  meta: { position: 'absolute', right: 18, top: 14, alignItems: 'flex-end' },
  chip: { position: 'absolute', left: 22, top: 74, width: 62, height: 60, borderRadius: 10, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.7)' },
  chipLineH: { position: 'absolute', left: 0, right: 0, top: 29, height: 1.5, backgroundColor: 'rgba(255,255,255,0.7)' },
  chipLineV: { position: 'absolute', top: 0, bottom: 0, left: 30, width: 1.5, backgroundColor: 'rgba(255,255,255,0.7)' },
  chipCenter: { position: 'absolute', left: 20, top: 18, width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.7)' },
  logo: { position: 'absolute', right: 18, bottom: 12, width: 80, height: 60 },
  amex: { width: 60, height: 60 },
});
