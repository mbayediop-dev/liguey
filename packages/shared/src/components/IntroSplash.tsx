import React from 'react';
import { Image, StyleSheet, View, useWindowDimensions } from 'react-native';
import { colors } from '../theme';
import { images } from '../assets';
import { Txt } from './Txt';

/** Écran INTRO : logo drapeau, « Loading please wait ». */
export function IntroSplash({ pro }: { pro?: boolean }) {
  const { width } = useWindowDimensions();
  const w = width * 0.95;
  return (
    <View style={styles.root}>
      <Image source={pro ? images.logoHeroesPro : images.logoHeroes} style={{ width: w, height: (w * 248) / 357 }} resizeMode="contain" />
      <View style={styles.bottom}>
        <Txt size={13} color={colors.red} center>
          Loading please wait
        </Txt>
        <Txt size={13} color={colors.red} center>
          {new Date().getFullYear()} © Heroes all rights reserved
        </Txt>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  bottom: { position: 'absolute', bottom: 28, left: 0, right: 0 },
});
