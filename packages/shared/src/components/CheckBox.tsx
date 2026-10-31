import React from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

/** Case à cocher ronde rouge avec coche blanche ombrée de bleu (CGU, consentement carte). */
export function CheckCircleBox({ checked, onToggle, size = 56, style }: { checked: boolean; onToggle: () => void; size?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable onPress={onToggle} hitSlop={8} style={[styles.base, { width: size, height: size, borderRadius: size / 2 }, checked ? styles.on : styles.off, style]}>
      {checked ? (
        <View>
          <Ionicons name="checkmark-outline" size={size * 0.6} color={colors.blue} style={{ position: 'absolute', left: -2, top: 2 }} />
          <Ionicons name="checkmark-outline" size={size * 0.6} color={colors.white} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  on: { backgroundColor: colors.red },
  off: { borderWidth: 2, borderColor: colors.red, backgroundColor: 'transparent' },
});
