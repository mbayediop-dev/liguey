import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { colors, fonts } from '../theme';
import { Txt } from './Txt';

export type ButtonVariant = 'primary' | 'blue' | 'outline' | 'facebook' | 'white' | 'black' | 'ghost';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  size?: 'lg' | 'md' | 'sm';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  left?: React.ReactNode;
}

const HEIGHTS = { lg: 64, md: 52, sm: 40 } as const;

export function Button({ title, onPress, variant = 'primary', disabled, loading, size = 'lg', style, textStyle, left }: ButtonProps) {
  const inactive = disabled || loading;
  const bg =
    variant === 'primary'
      ? inactive
        ? colors.redSoft
        : colors.red
      : variant === 'blue'
        ? inactive
          ? colors.blueSoft
          : colors.blue
        : variant === 'facebook'
          ? colors.facebook
          : variant === 'white'
            ? colors.white
            : variant === 'black'
              ? colors.black
              : 'transparent';
  const fg = variant === 'outline' || variant === 'white' || variant === 'ghost' ? colors.black : colors.white;
  const fontSize = size === 'lg' ? 19 : size === 'md' ? 16 : 14;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { height: HEIGHTS[size], backgroundColor: bg, opacity: pressed && !inactive ? 0.85 : 1 },
        variant === 'outline' && { borderWidth: 1.5, borderColor: inactive ? colors.grey : colors.black },
        variant === 'ghost' && inactive && { opacity: 0.5 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.row}>
          {left}
          <Txt style={[{ fontFamily: fonts.semibold, fontSize, color: fg, lineHeight: fontSize + 6 }, textStyle]} numberOfLines={1}>
            {title}
          </Txt>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: 999, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
