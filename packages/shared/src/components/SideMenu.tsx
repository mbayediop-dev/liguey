import React from 'react';
import { Modal, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';
import { Avatar } from './Avatar';
import { Txt } from './Txt';
import type { Profile } from '../types/models';
import { fullName } from '../lib/format';

type IonName = React.ComponentProps<typeof Ionicons>['name'];

export interface MenuItem {
  label: string;
  onPress: () => void;
  badge?: number;
}
export interface MenuFooterItem {
  label: string;
  icon: IonName;
  onPress: () => void;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  profile: Profile | null;
  onProfile: () => void;
  items: MenuItem[];
  footer: MenuFooterItem[];
}

/** Menu latéral droit des maquettes (00_MENU). */
export function SideMenu({ visible, onClose, profile, onProfile, items, footer }: Props) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const run = (fn: () => void) => () => {
    onClose();
    setTimeout(fn, 60);
  };
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.panel, { width: width * 0.72, paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.head}>
            <Pressable style={styles.profile} onPress={run(onProfile)}>
              <Avatar path={profile?.avatar_url} profile={profile} size={46} />
              <View style={{ flex: 1 }}>
                <Txt size={17} numberOfLines={1}>
                  {fullName(profile) || 'Mon compte'}
                </Txt>
                <Txt size={15} color={colors.greyText}>
                  Voir mon profil
                </Txt>
              </View>
            </Pressable>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={36} color={colors.black} />
            </Pressable>
          </View>

          <View style={styles.links}>
            {items.map((it) => (
              <Pressable key={it.label} onPress={run(it.onPress)} style={styles.link}>
                {it.badge ? (
                  <View style={styles.badge}>
                    <Txt size={11} lineHeight={13} color={colors.white} weight="semibold">
                      {it.badge}
                    </Txt>
                  </View>
                ) : null}
                <Txt size={30} lineHeight={42}>
                  {it.label}
                </Txt>
              </Pressable>
            ))}
          </View>

          <View style={styles.footer}>
            {footer.map((it) => (
              <Pressable key={it.label} onPress={run(it.onPress)} style={styles.footerItem}>
                <View style={styles.footerIcon}>
                  <Ionicons name={it.icon} size={22} color={colors.white} />
                </View>
                <Txt size={17}>{it.label}</Txt>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  panel: { backgroundColor: colors.white, paddingHorizontal: 20 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  profile: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  links: { flex: 1, justifyContent: 'center', gap: 2 },
  link: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.red, alignItems: 'center', justifyContent: 'center' },
  footer: { gap: 12 },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  footerIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.red, alignItems: 'center', justifyContent: 'center' },
});
