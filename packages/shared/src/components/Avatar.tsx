import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { colors, fonts } from '../theme';
import { Txt } from './Txt';
import { avatarUrl } from '../lib/storage';
import { initials } from '../lib/format';

interface Props {
  /** Chemin dans le bucket avatars, URL complète ou URI locale. */
  path?: string | null;
  uri?: string | null;
  size?: number;
  profile?: { first_name?: string | null; last_name?: string | null } | null;
  style?: StyleProp<ViewStyle>;
}

export function Avatar({ path, uri, size = 44, profile, style }: Props) {
  const src = uri ?? (path && /^(https?:|file:|content:)/.test(path) ? path : avatarUrl(path));
  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: size / 2 }, style]}>
      {src ? (
        <Image source={{ uri: src }} style={{ width: size, height: size }} contentFit="cover" transition={150} recyclingKey={src} />
      ) : (
        <Txt style={{ fontFamily: fonts.semibold, fontSize: size * 0.38, color: colors.greyDark }}>{initials(profile)}</Txt>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.grey, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
});
