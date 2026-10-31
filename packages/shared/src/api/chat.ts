import { sb } from '../supabase/client';
import { newFileName, uploadLocalFile } from '../lib/storage';
import { rpc } from './missions';

export async function sendMessage(missionId: string, senderId: string, body: string) {
  const { error } = await sb().from('messages').insert({ mission_id: missionId, sender_id: senderId, body: body.trim() });
  if (error) throw error;
}

export async function sendImageMessage(missionId: string, senderId: string, uri: string, mime = 'image/jpeg') {
  const path = `${missionId}/${newFileName(mime)}`;
  await uploadLocalFile({ bucket: 'chat', path, uri, contentType: mime });
  const { error } = await sb().from('messages').insert({ mission_id: missionId, sender_id: senderId, image_path: path });
  if (error) throw error;
}

export const markMessagesRead = (missionId: string) => rpc('mark_messages_read', { p_mission_id: missionId });

export async function markNotificationsRead(ids?: string[]) {
  let q = sb().from('notifications').update({ read_at: new Date().toISOString() }).is('read_at', null);
  if (ids?.length) q = q.in('id', ids);
  const { error } = await q;
  if (error) throw error;
}

export async function addReview(input: { missionId: string; authorId: string; targetId: string; rating: number; comment: string }) {
  const { error } = await sb().from('reviews').insert({
    mission_id: input.missionId,
    author_id: input.authorId,
    target_id: input.targetId,
    rating: input.rating,
    comment: input.comment.trim() || null,
  });
  if (error) throw error;
}
