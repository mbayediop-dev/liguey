import React from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { Txt } from './Txt';

/** Croix « + » blanche avec son ombre bleue décalée, signature graphique des maquettes. */
export function PlusMark({ size = 72, thickness = 6 }: { size?: number; thickness?: number }) {
  const bar = (vertical: boolean, color: string, dx: number, dy: number) => (
    <View
      style={{
        position: 'absolute',
        backgroundColor: color,
        width: vertical ? thickness : size,
        height: vertical ? size : thickness,
        left: (vertical ? (size - thickness) / 2 : 0) + dx,
        top: (vertical ? 0 : (size - thickness) / 2) + dy,
      }}
    />
  );
  return (
    <View style={{ width: size, height: size }}>
      {bar(true, colors.blue, -3, 3)}
      {bar(false, colors.blue, -3, 3)}
      {bar(true, colors.white, 0, 0)}
      {bar(false, colors.white, 0, 0)}
    </View>
  );
}

/** Coche blanche avec ombre bleue (écrans « Mission validée », paiement réussi). */
export function CheckMark({ size = 120 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name="checkmark-sharp" size={size} color={colors.blue} style={{ position: 'absolute', left: -4, top: 4 }} />
      <Ionicons name="checkmark-sharp" size={size} color={colors.white} />
    </View>
  );
}

interface CircleProps {
  size?: number;
  color?: string;
  onPress?: () => void;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

export function BigCircle({ size = 260, color = colors.red, onPress, children, style, disabled }: CircleProps) {
  return (
    <Pressable
      disabled={disabled || !onPress}
      onPress={onPress}
      style={({ pressed }) => [
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.9 : 1 },
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

/** Grand rond rouge « + » (photo de profil, documents). icon = 'plus' | 'clip' | 'check'. */
export function PlusCircle({ size = 260, onPress, icon = 'plus', style }: { size?: number; onPress?: () => void; icon?: 'plus' | 'clip' | 'check'; style?: StyleProp<ViewStyle> }) {
  return (
    <BigCircle size={size} onPress={onPress} style={style}>
      {icon === 'plus' ? (
        <PlusMark size={size * 0.28} />
      ) : icon === 'clip' ? (
        <View>
          <Ionicons name="attach-outline" size={size * 0.34} color={colors.blue} style={{ position: 'absolute', left: -3, top: 3 }} />
          <Ionicons name="attach-outline" size={size * 0.34} color={colors.white} />
        </View>
      ) : (
        <CheckMark size={size * 0.4} />
      )}
    </BigCircle>
  );
}

/** Zone rectangulaire rouge « + » (carte bancaire, recto/verso d'un document). */
export function PlusRect({ label, onPress, height = 220, color = colors.red, style, children }: { label?: string; onPress?: () => void; height?: number; color?: string; style?: StyleProp<ViewStyle>; children?: React.ReactNode }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.rect, { height, backgroundColor: color, opacity: pressed ? 0.9 : 1 }, style]}>
      {label ? (
        <Txt weight="semibold" size={22} color={colors.white} style={styles.rectLabel}>
          {label}
        </Txt>
      ) : null}
      {children ?? <PlusMark size={56} thickness={5} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  rect: { borderRadius: 16, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  rectLabel: { position: 'absolute', left: 16, top: 12 },
});
