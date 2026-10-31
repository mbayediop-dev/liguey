import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, View } from 'react-native';
import { colors, fonts } from '../theme';
import { images } from '../assets';
import { Txt } from './Txt';

const W = 180;
const H = Math.round((W * 248) / 357);

/** Voile de chargement : le drapeau bleu se remplit de rouge de 0 % à 100 % (écrans LOGIN 3/4/5). */
export function LoadingOverlay({ visible, done }: { visible: boolean; done?: boolean }) {
  const anim = useRef(new Animated.Value(0)).current;
  const [pct, setPct] = useState(0);
  const [shown, setShown] = useState(visible);

  useEffect(() => {
    const id = anim.addListener(({ value }) => setPct(Math.round(value * 100)));
    return () => anim.removeListener(id);
  }, [anim]);

  useEffect(() => {
    if (visible) {
      setShown(true);
      anim.setValue(0);
      Animated.timing(anim, { toValue: 0.86, duration: 1600, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
    } else if (shown) {
      Animated.timing(anim, { toValue: done ? 1 : 0, duration: 250, useNativeDriver: false }).start(() => setShown(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!shown) return null;
  const width = anim.interpolate({ inputRange: [0, 1], outputRange: [0, W] });
  return (
    <View style={styles.overlay} pointerEvents="auto">
      <View style={{ width: W, height: H }}>
        <Image source={images.flagRed} style={{ width: W, height: H, tintColor: colors.blue }} resizeMode="contain" />
        <Animated.View style={{ position: 'absolute', left: 0, top: 0, height: H, width, overflow: 'hidden' }}>
          <Image source={images.flagRed} style={{ width: W, height: H }} resizeMode="contain" />
        </Animated.View>
      </View>
      <Txt style={styles.pct}>{pct}%</Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.93)', alignItems: 'center', justifyContent: 'center', zIndex: 50 },
  pct: { fontFamily: fonts.regular, fontSize: 34, color: colors.blue, marginTop: 12 },
});
