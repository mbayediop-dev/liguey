import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

interface Props {
  rating: number;
  size?: number;
  color?: string;
  onChange?: (value: number) => void;
  gap?: number;
}

export function Stars({ rating, size = 18, color = colors.red, onChange, gap = 2 }: Props) {
  const filled = Math.floor(Number(rating) + 0.001);
  return (
    <View style={[styles.row, { gap }]}>
      {[1, 2, 3, 4, 5].map((i) => {
        const icon = i <= filled ? 'star' : 'star-outline';
        const node = <Ionicons name={icon} size={size} color={color} />;
        return onChange ? (
          <Pressable key={i} onPress={() => onChange(i)} hitSlop={6}>
            {node}
          </Pressable>
        ) : (
          <View key={i}>{node}</View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center' } });
