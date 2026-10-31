import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../theme';

/** Anneau rouge avec segment bleu en rotation (écran « Recherche en cours… »). */
export function SearchRing({ size = 250, stroke = 18, children, spinning = true }: { size?: number; stroke?: number; children?: React.ReactNode; spinning?: boolean }) {
  const rot = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!spinning) return;
    const loop = Animated.loop(Animated.timing(rot, { toValue: 1, duration: 2200, easing: Easing.linear, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [rot, spinning]);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const rotate = rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ rotate }] }]}>
        <Svg width={size} height={size}>
          <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.red} strokeWidth={stroke} fill="none" />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={colors.blue}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={`${c * 0.28} ${c * 0.72}`}
            strokeLinecap="butt"
          />
        </Svg>
      </Animated.View>
      {children}
    </View>
  );
}
