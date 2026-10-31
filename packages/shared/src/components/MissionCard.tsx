import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { colors } from '../theme';
import type { MissionFull } from '../types/models';
import { Avatar } from './Avatar';
import { Txt } from './Txt';
import { StatusWithLabel } from './StatusDot';
import { fmtDay, fmtRange, fullName } from '../lib/format';
import { images, imageMeta } from '../assets';

interface Props {
  mission: MissionFull;
  perspective: 'client' | 'pro';
  /** 'time' : date + créneau ; 'status' : libellé + pastille. */
  headerRight?: 'time' | 'status' | 'none';
  tone?: 'white' | 'blue';
  children?: React.ReactNode;
  footer?: React.ReactNode;
  /** Message affiché dans un rond bleu par-dessus l'illustration. */
  bubble?: string;
}

/** Carte mission présentée par-dessus le dashboard (fond assombri). */
export function MissionCard({ mission, perspective, headerRight = 'time', tone = 'white', children, footer, bubble }: Props) {
  const other = perspective === 'client' ? mission.pro : mission.client;
  const light = tone === 'blue';
  return (
    <View style={[styles.card, light && { backgroundColor: colors.blue }]}>
      <View style={styles.header}>
        <Avatar path={other?.avatar_url} profile={other} size={50} />
        <View style={styles.flex}>
          <Txt size={19} upper color={light ? colors.white : colors.black} numberOfLines={1}>
            {mission.service?.name ?? 'Service'}
          </Txt>
          <Txt size={19} color={colors.red} numberOfLines={1}>
            {other ? fullName(other) : perspective === 'client' ? 'Recherche en cours…' : `à ${mission.city}`}
          </Txt>
          {mission.sub_service ? (
            <Txt size={16} color={light ? colors.white : colors.black} numberOfLines={1}>
              {mission.sub_service.name}
            </Txt>
          ) : null}
        </View>
        {headerRight === 'time' ? (
          <View style={{ alignItems: 'flex-end' }}>
            <Txt size={18} color={light ? colors.white : colors.black}>
              {fmtDay(mission.start_date)}
            </Txt>
            <Txt size={18} color={light ? colors.white : colors.black}>
              {fmtRange(mission.time_start, mission.time_end)}
            </Txt>
          </View>
        ) : headerRight === 'status' ? (
          <StatusWithLabel status={mission.status} light={light} />
        ) : null}
      </View>
      {children ?? <IllustrationBody bubble={bubble} />}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );
}

/** Illustration rouge (os + collier) ou nuages avec un rond bleu porteur de message. */
export function IllustrationBody({ bubble, height }: { bubble?: string; height?: number }) {
  const { width } = useWindowDimensions();
  const w = width - 24;
  const meta = bubble ? imageMeta.illusClouds : imageMeta.illusMission;
  const scale = w / meta.width;
  const h = height ?? Math.min(meta.height * scale, 420);
  const circle = bubble ? imageMeta.illusClouds.circle : null;
  return (
    <View style={{ width: w, height: h, overflow: 'hidden', backgroundColor: colors.red }}>
      <Image source={bubble ? images.illusClouds : images.illusMission} style={{ width: w, height: meta.height * scale }} contentFit="cover" />
      {bubble && circle ? (
        <View
          style={{
            position: 'absolute',
            left: (circle.cx - circle.r) * scale,
            top: (circle.cy - circle.r) * scale - (meta.height * scale - h) / 2,
            width: circle.r * 2 * scale,
            height: circle.r * 2 * scale,
            borderRadius: circle.r * scale,
            backgroundColor: colors.blue,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <Txt size={Math.max(22, 30 * scale * 1.1)} lineHeight={Math.max(28, 38 * scale * 1.1)} color={colors.white} center weight="medium" upper>
            {bubble}
          </Txt>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: 20, overflow: 'hidden', width: '100%' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 12 },
  flex: { flex: 1 },
  footer: { paddingHorizontal: 12, paddingVertical: 14 },
});
