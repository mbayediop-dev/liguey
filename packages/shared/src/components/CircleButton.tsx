import React from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

type IonName = React.ComponentProps<typeof Ionicons>['name'];

interface Props {
  onPress?: () => void;
  icon?: IonName;
  size?: number;
  color?: string;
  iconColor?: string;
  iconSize?: number;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  outline?: boolean;
}

/** Bouton rond : grand bouton « retour » bleu (64) ou petites actions rouges (44). */
export function CircleButton({ onPress, icon, size = 64, color = colors.blue, iconColor = colors.white, iconSize, disabled, style, children, outline }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: outline ? 'transparent' : color,
          borderWidth: outline ? 1.5 : 0,
          borderColor: color,
          opacity: disabled ? 0.45 : pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      {children ?? (icon ? <Ionicons name={icon} size={iconSize ?? Math.round(size * 0.46)} color={outline ? color : iconColor} /> : null)}
    </Pressable>
  );
}

export function BackButton({ onPress, style }: { onPress?: () => void; style?: StyleProp<ViewStyle> }) {
  return <CircleButton onPress={onPress} icon="arrow-back" size={64} color={colors.blue} iconSize={30} style={style} />;
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
});
