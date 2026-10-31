import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';
import { Txt } from './Txt';

interface Props {
  title?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  /** Sans fond blanc ni ombre (pages légales, paramètres). */
  plain?: boolean;
  hideBack?: boolean;
}

/** En-tête blanc avec chevron retour et titre centré (Agenda, Message, Recherche…). */
export function PageHeader({ title, onBack, right, plain, hideBack }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const back = onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')));
  return (
    <View style={[styles.wrap, { paddingTop: insets.top }, plain ? styles.plain : styles.white]}>
      <View style={styles.row}>
        <View style={styles.side}>
          {!hideBack ? (
            <Pressable onPress={back} hitSlop={12} style={styles.back}>
              <Ionicons name="chevron-back" size={30} color={colors.black} />
            </Pressable>
          ) : null}
        </View>
        <Txt size={20} center numberOfLines={1} style={styles.title}>
          {title ?? ''}
        </Txt>
        <View style={[styles.side, { alignItems: 'flex-end' }]}>{right}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {},
  white: { backgroundColor: colors.white, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2, zIndex: 2 },
  plain: { backgroundColor: 'transparent' },
  row: { height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  side: { width: 64, justifyContent: 'center' },
  back: { padding: 4 },
  title: { flex: 1 },
});
