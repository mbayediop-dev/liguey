import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';

/** Rendu minimal : paragraphes, **gras** (graisse logo pour HEROES) et __souligné__. */
export function RichText({ body, size = 17 }: { body: string; size?: number }) {
  const paragraphs = body.split(/\n\s*\n/);
  return (
    <View style={{ gap: 14 }}>
      {paragraphs.map((p, i) => (
        <Text key={i} style={[styles.p, { fontSize: size, lineHeight: Math.round(size * 1.35) }]}>
          {renderInline(p)}
        </Text>
      ))}
    </View>
  );
}

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|__[^_]+__)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const inner = part.slice(2, -2);
      const isBrand = inner.trim() === 'HEROES';
      return (
        <Text key={i} style={isBrand ? styles.brand : styles.bold}>
          {inner}
        </Text>
      );
    }
    if (part.startsWith('__') && part.endsWith('__')) {
      return (
        <Text key={i} style={styles.underline}>
          {part.slice(2, -2)}
        </Text>
      );
    }
    return <Text key={i}>{part}</Text>;
  });
}

const styles = StyleSheet.create({
  p: { fontFamily: fonts.regular, color: colors.black },
  bold: { fontFamily: fonts.semibold },
  brand: { fontFamily: fonts.black, letterSpacing: -0.5 },
  underline: { textDecorationLine: 'underline' },
});
