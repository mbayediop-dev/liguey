import React, { useState } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { colors } from '../theme';
import { images, imageMeta } from '../assets';
import { Txt } from './Txt';

/** Visuel du dashboard client : illustration rouge et rond bleu « J'AI BESOIN D'UN SERVICE ! ». */
export function DashboardHero({ onPress, style }: { onPress: () => void; style?: StyleProp<ViewStyle> }) {
  const [w, setW] = useState(0);
  const meta = imageMeta.dashboardHero;
  const scale = w / meta.width;
  const h = meta.height * scale;
  const c = meta.circle;
  return (
    <View style={[{ width: '100%', backgroundColor: colors.red }, style]} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      {w > 0 ? (
        <View style={{ width: w, height: h }}>
          <Image source={images.dashboardHero} style={{ width: w, height: h }} contentFit="cover" />
          <Pressable
            onPress={onPress}
            style={({ pressed }) => [
              styles.circle,
              {
                left: (c.cx - c.r) * scale,
                top: (c.cy - c.r) * scale,
                width: c.r * 2 * scale,
                height: c.r * 2 * scale,
                borderRadius: c.r * scale,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              },
            ]}
          >
            <Txt size={Math.max(22, 30 * scale * 1.1)} lineHeight={Math.max(28, 38 * scale * 1.1)} color={colors.white} center weight="semibold">
              {"J'AI BESOIN\nD'UN SERVICE !"}
            </Txt>
            <Txt size={Math.max(13, 15 * scale * 1.1)} color={colors.white} center style={{ marginTop: 6 }}>
              Appuyez pour démarrer
            </Txt>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

/** Bannière d'un service (image découpée des maquettes, texte inclus). */
export function ServiceBanner({ slug, name, onPress, style }: { slug: string; name?: string; onPress?: () => void; style?: StyleProp<ViewStyle> }) {
  const [w, setW] = useState(0);
  const src = images.services[slug];
  const h = (w * imageMeta.serviceBanner.height) / imageMeta.serviceBanner.width;
  return (
    <Pressable onPress={onPress} onLayout={(e) => setW(e.nativeEvent.layout.width)} style={({ pressed }) => [styles.banner, { opacity: pressed ? 0.9 : 1 }, style]}>
      {w > 0 && src ? (
        <Image source={src} style={{ width: w, height: h }} contentFit="cover" />
      ) : (
        // Prestation sans visuel découpé (ex. ajoutée depuis le back-office) : bandeau rouge avec le nom
        <View style={[styles.bannerFallback, { height: w > 0 ? h : 80 }]}>
          {name ? (
            <Txt variant="h2" color={colors.white} style={styles.bannerFallbackText}>
              {name.toUpperCase()}
            </Txt>
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

/** Bandeau décoratif rouge/bleu (pétales) en haut des écrans Recherche / Mission en cours. */
export function PetalsHeader({ variant = 'petals', height = 110 }: { variant?: 'petals' | 'leaves'; height?: number }) {
  return <Image source={variant === 'petals' ? images.headerPetals : images.headerLeaves} style={{ width: '100%', height }} contentFit="cover" />;
}

const styles = StyleSheet.create({
  circle: { position: 'absolute', backgroundColor: colors.blue, alignItems: 'center', justifyContent: 'center', padding: 20 },
  banner: { borderRadius: 16, overflow: 'hidden', backgroundColor: colors.red },
  bannerFallback: { justifyContent: 'center', paddingHorizontal: 24 },
  bannerFallbackText: { letterSpacing: 1 },
});
