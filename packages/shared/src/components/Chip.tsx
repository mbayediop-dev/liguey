import React from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '../theme';
import { Txt } from './Txt';

/** Gros chips rouges de l'écran de confirmation (« garder mon chien », « Rue des Alpes 11 »…). */
export function Chip({ label, onPress, style, size = 26 }: { label: string; onPress?: () => void; style?: StyleProp<ViewStyle>; size?: number }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.chip, { opacity: pressed ? 0.85 : 1 }, style]}>
      <Txt size={size} lineHeight={size + 6} color={colors.white}>
        {label}
      </Txt>
    </Pressable>
  );
}

export function ChipWord({ children, size = 26 }: { children: string; size?: number }) {
  return (
    <Txt size={size} lineHeight={size + 6} style={styles.word}>
      {children}
    </Txt>
  );
}

const styles = StyleSheet.create({
  chip: { backgroundColor: colors.red, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, marginRight: 10, marginBottom: 10, maxWidth: '100%' },
  word: { marginRight: 10, marginBottom: 10, paddingVertical: 10 },
});
