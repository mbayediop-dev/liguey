import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme';
import { Txt } from './Txt';

export function EmptyState({ text, sub }: { text: string; sub?: string }) {
  return (
    <View style={styles.wrap}>
      <Txt size={17} center color={colors.greyText}>
        {text}
      </Txt>
      {sub ? (
        <Txt variant="small" center color={colors.greyText} style={{ marginTop: 6 }}>
          {sub}
        </Txt>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({ wrap: { paddingVertical: 40, paddingHorizontal: 24 } });
