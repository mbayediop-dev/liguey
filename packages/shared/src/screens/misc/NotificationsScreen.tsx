import React, { useEffect } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '../../components/PageHeader';
import { Txt } from '../../components/Txt';
import { EmptyState } from '../../components/EmptyState';
import { colors } from '../../theme';
import { useNotifications } from '../../hooks/queries';
import { keys } from '../../hooks/queryClient';
import { markNotificationsRead } from '../../api/chat';
import { fmtDateTime } from '../../lib/format';

export function NotificationsScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const notifs = useNotifications();
  const unread = (notifs.data ?? []).filter((n) => !n.read_at).map((n) => n.id);

  useEffect(() => {
    if (unread.length) {
      markNotificationsRead(unread)
        .then(() => Promise.all([qc.invalidateQueries({ queryKey: [...keys.unread] }), qc.invalidateQueries({ queryKey: [...keys.notifications] })]))
        .catch(() => undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unread.length]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <PageHeader title="Notifications" />
      <FlatList
        data={notifs.data ?? []}
        keyExtractor={(n) => n.id}
        contentContainerStyle={styles.content}
        ListEmptyComponent={<EmptyState text={notifs.isLoading ? 'Chargement…' : 'Aucune notification'} />}
        renderItem={({ item }) => {
          const data = (item.data ?? {}) as { mission_id?: string };
          const go = () => {
            if (!data.mission_id) return;
            router.push(item.kind === 'message' ? `/chat/${data.mission_id}` : `/missions/${data.mission_id}`);
          };
          return (
            <Pressable style={[styles.row, !item.read_at && styles.unread]} onPress={go}>
              <View style={styles.icon}>
                <Ionicons name={item.kind === 'message' ? 'chatbubble-ellipses' : 'flash'} size={22} color={colors.white} />
              </View>
              <View style={{ flex: 1 }}>
                <Txt size={16} weight={item.read_at ? 'regular' : 'semibold'}>
                  {item.title}
                </Txt>
                {item.body ? (
                  <Txt variant="small" color={colors.greyDark} numberOfLines={2}>
                    {item.body}
                  </Txt>
                ) : null}
                <Txt variant="caption" style={{ marginTop: 2 }}>
                  {fmtDateTime(item.created_at)}
                </Txt>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 12, gap: 8 },
  row: { flexDirection: 'row', gap: 12, backgroundColor: colors.white, borderRadius: 14, padding: 12, alignItems: 'center' },
  unread: { borderLeftWidth: 4, borderLeftColor: colors.red },
  icon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.red, alignItems: 'center', justifyContent: 'center' },
});
