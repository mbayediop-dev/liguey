import React from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { colors, fonts } from '../theme';
import { Txt } from './Txt';

/** Pilule à sélection : grise, rouge quand sélectionnée (choix des prestations, SA/SARL, jours…). */
export function SelectPill({ label, selected, onPress, style, small }: { label: string; selected?: boolean; onPress?: () => void; style?: StyleProp<ViewStyle>; small?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        small && styles.small,
        { backgroundColor: selected ? colors.red : colors.white, opacity: pressed ? 0.85 : 1 },
        style,
      ]}
    >
      <Txt size={small ? 15 : 17} color={selected ? colors.white : colors.black} center numberOfLines={1}>
        {label}
      </Txt>
    </Pressable>
  );
}

/** Pilule bleue pleine largeur (sous-services). */
export function SubServicePill({ label, onPress, style }: { label: string; onPress?: () => void; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.blue, { opacity: pressed ? 0.85 : 1 }, style]}>
      <Txt style={{ fontFamily: fonts.bold, fontSize: 17, color: colors.white, textTransform: 'uppercase', textAlign: 'center' }}>{label}</Txt>
    </Pressable>
  );
}

/** Petite pilule ronde à bord noir (Matériel / Temps / Autre, codes TVA). */
export function TogglePill({ label, selected, onPress, style, light }: { label: string; selected?: boolean; onPress?: () => void; style?: StyleProp<ViewStyle>; light?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.toggle,
        {
          backgroundColor: selected ? colors.red : light ? colors.white : 'transparent',
          borderColor: selected ? colors.red : light ? colors.white : colors.black,
          opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      <Txt size={16} color={selected ? colors.white : colors.black}>
        {label}
      </Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: { height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  small: { height: 44, borderRadius: 22, paddingHorizontal: 14 },
  blue: { backgroundColor: colors.blue, minHeight: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 10 },
  toggle: { height: 42, borderRadius: 21, borderWidth: 1.5, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
});
