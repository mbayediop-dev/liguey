import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme';
import type { ReviewFull } from '../types/models';
import { Avatar } from './Avatar';
import { Txt } from './Txt';
import { fullName, ratingColor } from '../lib/format';

export function ReviewCard({ review }: { review: ReviewFull }) {
  const color = colors[ratingColor(Number(review.rating))];
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Avatar path={review.author?.avatar_url} profile={review.author} size={44} />
        <View style={styles.flex}>
          <Txt size={16} upper numberOfLines={1}>
            {review.mission?.service?.name ?? 'Mission'}
          </Txt>
          <Txt size={16} color={colors.red} numberOfLines={1}>
            {fullName(review.author)}
          </Txt>
        </View>
        <Txt size={18} color={color}>
          {Number(review.rating) % 1 === 0 ? Number(review.rating) : Number(review.rating).toFixed(1)} / 5
        </Txt>
      </View>
      {review.comment ? (
        <Txt size={16} style={styles.comment}>
          {review.comment}
        </Txt>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.bg, borderRadius: 12, padding: 14, marginBottom: 10 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  flex: { flex: 1 },
  comment: { marginTop: 18 },
});
