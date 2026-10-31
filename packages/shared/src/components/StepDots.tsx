import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme';

/** Indicateur d'étapes : l'étape courante est bleue, les autres rouges (cf. maquettes d'inscription). */
export function StepDots({ count = 3, current = 0, light }: { count?: number; current?: number; light?: boolean }) {
  return (
    <View style={styles.row}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={[styles.dot, { backgroundColor: light ? (i === current ? colors.blue : colors.white) : i === current ? colors.blue : colors.red }]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', gap: 14, paddingVertical: 10 },
  dot: { width: 12, height: 12, borderRadius: 6 },
});
