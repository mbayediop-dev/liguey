import React from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

type IonName = React.ComponentProps<typeof Ionicons>['name'];

interface Props {
  name: IonName;
  onPress?: () => void;
  size?: number;
  tone?: 'red' | 'blue' | 'white' | 'grey' | 'pale';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  iconSize?: number;
}

/** Petites actions rondes des cartes mission : ✕ ✎ 💬 + 🗑 ✓ */
export function IconCircle({ name, onPress, size = 46, tone = 'red', disabled, style, iconSize }: Props) {
  const bg = tone === 'red' ? colors.red : tone === 'blue' ? colors.blue : tone === 'white' ? colors.white : tone === 'pale' ? colors.redPale : colors.grey;
  const fg = tone === 'white' ? colors.blue : colors.white;
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [styles.base, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg, opacity: disabled ? 0.45 : pressed ? 0.8 : 1 }, style]}
    >
      <Ionicons name={name} size={iconSize ?? Math.round(size * 0.5)} color={fg} />
    </Pressable>
  );
}

const styles = StyleSheet.create({ base: { alignItems: 'center', justifyContent: 'center' } });
