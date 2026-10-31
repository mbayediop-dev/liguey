import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import type { MissionStatus } from '../supabase/database.types';
import { Txt } from './Txt';
import { statusLabel } from '../lib/format';

/** Pastille d'état des maquettes : gris (en attente), bleu (prêt), rouge cerclé (en cours), coche (terminée). */
export function StatusDot({ status, size = 44, light }: { status: MissionStatus; size?: number; light?: boolean }) {
  const r = size / 2;
  switch (status) {
    case 'confirmed':
      return (
        <View style={[styles.ring, { width: size, height: size, borderRadius: r, borderColor: colors.blue, backgroundColor: light ? colors.white : 'transparent' }]}>
          <View style={{ width: size - 10, height: size - 10, borderRadius: r, backgroundColor: colors.blue }} />
        </View>
      );
    case 'start_requested':
    case 'in_progress':
      return (
        <View style={[styles.ring, { width: size, height: size, borderRadius: r, borderColor: colors.red, backgroundColor: light ? colors.white : 'transparent' }]}>
          <View style={{ width: size - 10, height: size - 10, borderRadius: r, backgroundColor: colors.red }} />
        </View>
      );
    case 'completed':
      return (
        <View style={[styles.solid, { width: size, height: size, borderRadius: r, backgroundColor: colors.red }]}>
          <Ionicons name="checkmark" size={size * 0.6} color={colors.white} />
        </View>
      );
    case 'cancelled':
      return (
        <View style={[styles.solid, { width: size, height: size, borderRadius: r, backgroundColor: colors.grey }]}>
          <Ionicons name="close" size={size * 0.6} color={colors.white} />
        </View>
      );
    case 'searching':
    case 'posted':
      return <View style={[styles.ring, { width: size, height: size, borderRadius: r, borderColor: colors.grey }]} />;
    default:
      return <View style={{ width: size, height: size, borderRadius: r, backgroundColor: colors.grey }} />;
  }
}

export function StatusWithLabel({ status, light, size = 44 }: { status: MissionStatus; light?: boolean; size?: number }) {
  return (
    <View style={styles.row}>
      <Txt size={18} color={light ? colors.white : colors.black} style={{ fontFamily: 'Poppins_400Regular' }}>
        {statusLabel(status)}
      </Txt>
      <StatusDot status={status} size={size} light={light} />
    </View>
  );
}

const styles = StyleSheet.create({
  ring: { borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  solid: { alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
