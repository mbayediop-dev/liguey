import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { sb } from '../supabase/client';
import { useAuth } from './useAuth';
import { keys } from './queryClient';

type Row = Record<string, unknown>;

function rowOf(payload: RealtimePostgresChangesPayload<Row>): Row {
  const n = payload.new as Row | undefined;
  if (n && Object.keys(n).length) return n;
  return (payload.old as Row) ?? {};
}

/**
 * Une seule souscription Realtime par session : chaque changement invalide les requêtes concernées.
 * La RLS filtre côté serveur ce que l'utilisateur a le droit de voir.
 */
export function RealtimeSync() {
  const { session } = useAuth();
  const qc = useQueryClient();
  const userId = session?.user.id;

  useEffect(() => {
    if (!userId) return;
    const inv = (k: readonly unknown[]) => qc.invalidateQueries({ queryKey: k as unknown[] });
    const channel = sb()
      .channel(`sync-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'missions' }, (p: RealtimePostgresChangesPayload<Row>) => {
        const row = rowOf(p);
        inv(keys.missions);
        inv(keys.liveRequests);
        inv(keys.conversations);
        inv(keys.proStats);
        if (typeof row.id === 'string') inv(keys.mission(row.id));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (p: RealtimePostgresChangesPayload<Row>) => {
        const row = rowOf(p);
        if (typeof row.mission_id === 'string') inv(keys.messages(row.mission_id));
        inv(keys.conversations);
        inv(keys.unread);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        inv(keys.notifications);
        inv(keys.unread);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mission_expenses' }, (p: RealtimePostgresChangesPayload<Row>) => {
        const row = rowOf(p);
        if (typeof row.mission_id === 'string') inv(keys.expenses(row.mission_id));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mission_reschedules' }, (p: RealtimePostgresChangesPayload<Row>) => {
        const row = rowOf(p);
        if (typeof row.mission_id === 'string') {
          inv(keys.reschedules(row.mission_id));
          inv(keys.mission(row.mission_id));
        }
      })
      .subscribe();
    return () => {
      void sb().removeChannel(channel);
    };
  }, [userId, qc]);

  return null;
}
