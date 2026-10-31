import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Txt } from './Txt';

export function SectionTitle({ children, style, light }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; light?: boolean }) {
  return (
    <View style={[styles.wrap, style]}>
      <Txt size={18} center weight={light ? 'regular' : 'semibold'}>
        {children}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({ wrap: { paddingVertical: 10 } });
