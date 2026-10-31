import React from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { PageHeader } from '../../components/PageHeader';
import { Avatar } from '../../components/Avatar';
import { Txt } from '../../components/Txt';
import { EmptyState } from '../../components/EmptyState';
import { colors } from '../../theme';
import { useConversations } from '../../hooks/queries';
import { useAppConfig } from '../../config/AppConfig';
import { fmtDateTime, fullName } from '../../lib/format';

export function ChatListScreen() {
  const router = useRouter();
  const { role } = useAppConfig();
  const convs = useConversations();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <PageHeader title="Chat" />
      <FlatList
        data={convs.data ?? []}
        keyExtractor={(c) => c.mission_id}
        contentContainerStyle={styles.content}
        ListEmptyComponent={<EmptyState text={convs.isLoading ? 'Chargement…' : 'Aucune conversation'} sub="Une conversation s’ouvre dès qu’un héros accepte une mission." />}
        renderItem={({ item }) => {
          const other = role === 'pro' ? item.client : item.pro;
          return (
            <Pressable style={styles.row} onPress={() => router.push(`/chat/${item.mission_id}`)}>
              <Avatar path={other?.avatar_url} profile={other} size={52} />
              <View style={{ flex: 1 }}>
                <View style={styles.top}>
                  <Txt size={17} numberOfLines={1} style={{ flex: 1 }}>
                    {fullName(other) || 'Conversation'}
                  </Txt>
                  {item.last_at ? (
                    <Txt variant="caption">{fmtDateTime(item.last_at)}</Txt>
                  ) : null}
                </View>
                <Txt variant="small" color={colors.red} upper numberOfLines={1}>
                  {item.service?.name ?? ''}
                </Txt>
                <Txt variant="small" color={colors.greyDark} numberOfLines={1}>
                  {item.last_body ?? (item.last_image_path ? 'Photo' : 'Dites bonjour !')}
                </Txt>
              </View>
              {Number(item.unread) > 0 ? (
                <View style={styles.badge}>
                  <Txt size={12} lineHeight={14} color={colors.white} weight="semibold">
                    {item.unread}
                  </Txt>
                </View>
              ) : null}
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 12, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderRadius: 16, padding: 12 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: { minWidth: 22, height: 22, borderRadius: 11, backgroundColor: colors.red, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
});
