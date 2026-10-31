import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';
import { images } from '../assets';
import { Txt } from './Txt';
import { useAppConfig } from '../config/AppConfig';

interface Props {
  onMenu: () => void;
  badge?: number;
  onBadge?: () => void;
}

/** En-tête principal : wordmark HEROES (+ PRO), pastille de notifications, menu burger. */
export function AppHeader({ onMenu, badge = 0, onBadge }: Props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { brandSuffix } = useAppConfig();
  return (
    <View style={[styles.wrap, { paddingTop: insets.top }]}>
      <View style={styles.row}>
        <Pressable onPress={() => router.navigate('/')} style={styles.brand} hitSlop={8}>
          <Image source={images.wordmarkHeroes} style={styles.wordmark} resizeMode="contain" />
          {brandSuffix ? (
            <Txt size={26} lineHeight={30} style={{ marginLeft: 6 }}>
              {brandSuffix}
            </Txt>
          ) : null}
        </Pressable>
        <View style={styles.right}>
          {badge > 0 ? (
            <Pressable onPress={onBadge} hitSlop={8} style={styles.badge}>
              <Txt size={13} lineHeight={16} color={colors.white} weight="medium">
                {badge > 99 ? '99+' : badge}
              </Txt>
            </Pressable>
          ) : null}
          <Pressable onPress={onMenu} hitSlop={10} accessibilityLabel="Menu">
            <Ionicons name="menu" size={36} color={colors.black} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.white, zIndex: 3 },
  row: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12 },
  brand: { flexDirection: 'row', alignItems: 'center' },
  wordmark: { width: 106, height: 26 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  badge: { minWidth: 24, height: 24, borderRadius: 12, backgroundColor: colors.red, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
});
