import React from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, shadow } from '../theme';

export function Card({ children, style, onPress, tone = 'white' }: { children?: React.ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; tone?: 'white' | 'grey' | 'blue' }) {
  const bg = tone === 'blue' ? colors.blue : tone === 'grey' ? colors.bg : colors.white;
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [styles.card, { backgroundColor: bg, opacity: pressed ? 0.9 : 1 }, style]}>
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.card, { backgroundColor: bg }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: 16, ...shadow.card },
});
