import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, shadow } from '../theme';
import type { MissionFull } from '../types/models';
import { Avatar } from './Avatar';
import { Txt } from './Txt';
import { StatusDot, StatusWithLabel } from './StatusDot';
import { fmtDay, fmtRange, fullName } from '../lib/format';

interface Props {
  mission: MissionFull;
  perspective: 'client' | 'pro';
  onPress?: () => void;
  /** Variante compacte et grisée pour l'historique. */
  past?: boolean;
  showAvatar?: boolean;
}

/** Ligne de mission des listes (MissionItem) (dashboard, « Mes demandes », agenda). Bleue quand la mission est en cours. */
export function MissionItem({ mission, perspective, onPress, past, showAvatar = true }: Props) {
  const other = perspective === 'client' ? mission.pro : mission.client;
  const live = mission.status === 'in_progress' || mission.status === 'start_requested';
  const fg = live ? colors.white : past ? colors.greyText : colors.black;
  const nameColor = live ? colors.red : past ? colors.redSoft : colors.red;
  const searching = mission.status === 'searching' || mission.status === 'posted';
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, live && styles.live, past && styles.past, pressed && { opacity: 0.85 }]}
    >
      {showAvatar && !past ? <Avatar path={other?.avatar_url} profile={other} size={52} /> : null}
      <View style={styles.mid}>
        <Txt size={18} upper color={fg} numberOfLines={1}>
          {mission.service?.name ?? 'Service'}
        </Txt>
        <Txt size={18} color={nameColor} numberOfLines={1}>
          {other ? fullName(other) : searching ? (perspective === 'client' ? 'Recherche en cours…' : `à ${mission.city}`) : `à ${mission.city}`}
        </Txt>
      </View>
      {live ? (
        <StatusWithLabel status={mission.status} light />
      ) : (
        <View style={styles.right}>
          <View style={{ alignItems: 'flex-end' }}>
            <Txt size={18} color={fg}>
              {fmtDay(mission.start_date)}
            </Txt>
            <Txt size={18} color={fg}>
              {fmtRange(mission.time_start, mission.time_end)}
            </Txt>
          </View>
          {!past ? <StatusDot status={mission.status} size={40} /> : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    minHeight: 84,
    ...shadow.card,
  },
  live: { backgroundColor: colors.blue },
  past: { backgroundColor: colors.bg, shadowOpacity: 0, elevation: 0, minHeight: 64, paddingVertical: 8 },
  mid: { flex: 1 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
