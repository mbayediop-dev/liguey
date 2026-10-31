import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Linking, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PageHeader } from '../../components/PageHeader';
import { Avatar } from '../../components/Avatar';
import { Txt } from '../../components/Txt';
import { IconCircle } from '../../components/IconCircle';
import { colors, fonts } from '../../theme';
import { useMessages, useMission, useSignedUrl } from '../../hooks/queries';
import { useAuth } from '../../hooks/useAuth';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { keys } from '../../hooks/queryClient';
import { markMessagesRead, sendImageMessage, sendMessage } from '../../api/chat';
import { pickImage } from '../../hooks/usePicker';
import { fmtClock, fullName } from '../../lib/format';
import type { Message } from '../../types/models';

export function ChatThreadScreen({ missionId }: { missionId: string }) {
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const me = session!.user.id;
  const mission = useMission(missionId);
  const messages = useMessages(missionId);
  const [text, setText] = useState('');
  const other = mission.data ? (mission.data.client_id === me ? mission.data.pro : mission.data.client) : null;

  const unreadFromOther = useMemo(() => (messages.data ?? []).some((m) => m.sender_id !== me && !m.read_at), [messages.data, me]);
  useEffect(() => {
    if (unreadFromOther) markMessagesRead(missionId).catch(() => undefined);
  }, [unreadFromOther, missionId]);

  const send = useAsyncAction(
    async () => {
      const body = text.trim();
      if (!body) return;
      setText('');
      await sendMessage(missionId, me, body);
    },
    { invalidate: [keys.messages(missionId), keys.conversations] },
  );
  const sendPhoto = useAsyncAction(
    async () => {
      const f = await pickImage({ allowsEditing: false });
      if (f) await sendImageMessage(missionId, me, f.uri, f.mime);
    },
    { invalidate: [keys.messages(missionId), keys.conversations] },
  );

  const data = useMemo(() => [...(messages.data ?? [])].reverse(), [messages.data]);
  const lastMineRead = useMemo(() => (messages.data ?? []).filter((m) => m.sender_id === me && m.read_at).slice(-1)[0]?.id, [messages.data, me]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <PageHeader
        title="Message"
        right={
          other?.phone ? (
            <IconCircle name="call" size={44} onPress={() => Linking.openURL(`tel:${other.phone}`)} />
          ) : null
        }
      />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
        <FlatList
          data={data}
          inverted
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Bubble msg={item} mine={item.sender_id === me} other={other} seen={item.id === lastMineRead} />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Txt center color={colors.greyText}>
                {other ? `Écrivez à ${fullName(other)}` : 'Aucun message'}
              </Txt>
            </View>
          }
        />
        <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
          <Pressable onPress={() => sendPhoto.run()} hitSlop={8} style={styles.attach}>
            <Ionicons name="camera-outline" size={26} color={colors.greyDark} />
          </Pressable>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Votre message…"
            placeholderTextColor={colors.greyText}
            style={styles.input}
            multiline
          />
          <IconCircle name="checkmark" size={56} onPress={() => send.run()} disabled={!text.trim() || send.loading} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function Bubble({ msg, mine, other, seen }: { msg: Message; mine: boolean; other: { avatar_url: string | null; first_name: string | null; last_name: string | null } | null; seen: boolean }) {
  const { profile } = useAuth();
  const avatar = mine ? profile : other;
  return (
    <View style={[styles.bubbleRow, mine && styles.mineRow]}>
      {!mine ? <Avatar path={avatar?.avatar_url} profile={avatar} size={36} /> : null}
      <View style={{ maxWidth: '78%' }}>
        {msg.image_path ? (
          <ChatImage path={msg.image_path} />
        ) : (
          <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
            <Txt size={16} color={mine ? colors.black : colors.white}>
              {msg.body}
            </Txt>
          </View>
        )}
        <View style={[styles.meta, mine && { alignItems: 'flex-end' }]}>
          <Txt variant="caption">{fmtClock(msg.created_at)}</Txt>
          {mine && seen ? (
            <Txt variant="caption" color={colors.green}>
              Vu ✓
            </Txt>
          ) : null}
        </View>
      </View>
      {mine ? <Avatar path={avatar?.avatar_url} profile={avatar} size={36} /> : null}
    </View>
  );
}

function ChatImage({ path }: { path: string }) {
  const url = useSignedUrl('chat', path);
  return <Image source={url.data ? { uri: url.data } : undefined} style={styles.image} contentFit="cover" />;
}

const styles = StyleSheet.create({
  list: { padding: 12, gap: 12 },
  empty: { paddingVertical: 60, transform: [{ scaleY: -1 }] },
  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  mineRow: { justifyContent: 'flex-end' },
  bubble: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8 },
  theirs: { backgroundColor: colors.black },
  mine: { backgroundColor: colors.bubbleGrey },
  meta: { marginTop: 4, paddingHorizontal: 6 },
  image: { width: 240, height: 200, borderRadius: 14, backgroundColor: colors.grey },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 12, paddingTop: 8, backgroundColor: colors.bg },
  attach: { height: 56, justifyContent: 'center', paddingHorizontal: 2 },
  input: { flex: 1, minHeight: 56, maxHeight: 120, backgroundColor: colors.white, borderRadius: 28, paddingHorizontal: 18, paddingVertical: 14, fontFamily: fonts.regular, fontSize: 16 },
});
