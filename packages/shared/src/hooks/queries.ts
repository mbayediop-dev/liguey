import { useQuery, useQueryClient } from '@tanstack/react-query';
import { sb } from '../supabase/client';
import type { MissionStatus, VatRateRow, LegalPageRow, PaymentMethodRow, ProDocumentRow, NotificationRow } from '../supabase/database.types';
import {
  ACTIVE_STATUSES,
  MISSION_SELECT,
  PROFILE_LITE,
  type Conversation,
  type Expense,
  type MissionFull,
  type Profile,
  type ProfileLite,
  type Reschedule,
  type ReviewFull,
  type ServiceWithSubs,
  type Message,
} from '../types/models';
import { keys } from './queryClient';
import { useAppConfig } from '../config/AppConfig';
import { useAuth } from './useAuth';
import { signedUrl, type Bucket } from '../lib/storage';

function throwIf<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw res.error;
  return res.data;
}

function list<T>(res: { data: T[] | null; error: { message: string } | null }): T[] {
  if (res.error) throw res.error;
  return res.data ?? [];
}

// ---------------------------------------------------------------------------
// Catalogue
// ---------------------------------------------------------------------------
export function useServices() {
  return useQuery({
    queryKey: keys.services,
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<ServiceWithSubs[]> => {
      const data = throwIf(await sb().from('services').select('*, sub_services(*)').eq('is_active', true).order('sort_order'));
      return (data as ServiceWithSubs[]).map((s) => ({
        ...s,
        sub_services: [...(s.sub_services ?? [])].sort((a, b) => a.sort_order - b.sort_order),
      }));
    },
  });
}

export function useService(id: string | undefined) {
  const q = useServices();
  return { ...q, data: q.data?.find((s) => s.id === id) };
}

export function useVatRates() {
  return useQuery({
    queryKey: keys.vatRates,
    staleTime: 60 * 60_000,
    queryFn: async (): Promise<VatRateRow[]> => list(await sb().from('vat_rates').select('*').order('code')),
  });
}

export function useLegalPage(slug: string) {
  return useQuery({
    queryKey: keys.legal(slug),
    staleTime: 60 * 60_000,
    queryFn: async (): Promise<LegalPageRow | null> => throwIf(await sb().from('legal_pages').select('*').eq('slug', slug).maybeSingle()),
  });
}

// ---------------------------------------------------------------------------
// Profils
// ---------------------------------------------------------------------------
export function useProfile(id: string | undefined) {
  return useQuery({
    queryKey: keys.profile(id ?? ''),
    enabled: !!id,
    queryFn: async (): Promise<Profile | null> => throwIf(await sb().from('profiles').select('*').eq('id', id!).maybeSingle()),
  });
}

export function useProServices(proId: string | undefined) {
  return useQuery({
    queryKey: keys.proServices(proId ?? ''),
    enabled: !!proId,
    queryFn: async (): Promise<string[]> => {
      const rows = list(await sb().from('pro_services').select('service_id').eq('pro_id', proId!));
      return rows.map((r) => r.service_id);
    },
  });
}

export function useProDocuments(proId: string | undefined) {
  return useQuery({
    queryKey: keys.proDocuments(proId ?? ''),
    enabled: !!proId,
    queryFn: async (): Promise<ProDocumentRow[]> =>
      list(await sb().from('pro_documents').select('*').eq('pro_id', proId!).order('created_at')),
  });
}

export function usePaymentMethods() {
  const { session } = useAuth();
  return useQuery({
    queryKey: keys.paymentMethods,
    enabled: !!session,
    queryFn: async (): Promise<PaymentMethodRow[]> =>
      list(await sb().from('payment_methods').select('*').order('is_default', { ascending: false }).order('created_at')),
  });
}

// ---------------------------------------------------------------------------
// Missions
// ---------------------------------------------------------------------------
const isActive = (s: MissionStatus) => (ACTIVE_STATUSES as readonly string[]).includes(s);

export function useMyMissions(opts: { statuses?: readonly MissionStatus[]; enabled?: boolean } = {}) {
  const { role } = useAppConfig();
  const { session } = useAuth();
  const statuses = opts.statuses;
  return useQuery({
    queryKey: [...keys.missions, role, statuses ?? 'all'],
    enabled: !!session && opts.enabled !== false,
    refetchInterval: 20_000,
    queryFn: async (): Promise<MissionFull[]> => {
      let q = sb()
        .from('missions')
        .select(MISSION_SELECT)
        .eq(role === 'pro' ? 'pro_id' : 'client_id', session!.user.id)
        .order('start_date', { ascending: true })
        .order('time_start', { ascending: true });
      if (statuses?.length) q = q.in('status', [...statuses]);
      return throwIf(await q) as unknown as MissionFull[];
    },
  });
}

export function useMission(id: string | undefined) {
  return useQuery({
    queryKey: keys.mission(id ?? ''),
    enabled: !!id,
    refetchInterval: (q) => {
      const m = q.state.data as MissionFull | null | undefined;
      return m && isActive(m.status) ? 6_000 : false;
    },
    queryFn: async (): Promise<MissionFull | null> =>
      throwIf(await sb().from('missions').select(MISSION_SELECT).eq('id', id!).maybeSingle()) as unknown as MissionFull | null,
  });
}

/** Côté pro : demandes en recherche visibles pour mes prestations (filtrage par la RLS). */
export function useLiveRequests() {
  const { session } = useAuth();
  return useQuery({
    queryKey: keys.liveRequests,
    enabled: !!session,
    refetchInterval: 10_000,
    queryFn: async (): Promise<MissionFull[]> =>
      throwIf(
        await sb()
          .from('missions')
          .select(MISSION_SELECT)
          .in('status', ['searching', 'posted'])
          .is('pro_id', null)
          .order('created_at', { ascending: false }),
      ) as unknown as MissionFull[],
  });
}

export function useExpenses(missionId: string | undefined) {
  return useQuery({
    queryKey: keys.expenses(missionId ?? ''),
    enabled: !!missionId,
    queryFn: async (): Promise<Expense[]> =>
      list(await sb().from('mission_expenses').select('*').eq('mission_id', missionId!).order('created_at')),
  });
}

export function useReschedules(missionId: string | undefined) {
  return useQuery({
    queryKey: keys.reschedules(missionId ?? ''),
    enabled: !!missionId,
    queryFn: async (): Promise<Reschedule[]> =>
      list(await sb().from('mission_reschedules').select('*').eq('mission_id', missionId!).order('created_at', { ascending: false })),
  });
}

export function useAvailableCount(serviceId: string | undefined) {
  return useQuery({
    queryKey: keys.availableCount(serviceId ?? ''),
    enabled: !!serviceId,
    refetchInterval: 15_000,
    queryFn: async (): Promise<number> => throwIf(await sb().rpc('count_available_pros', { p_service_id: serviceId! })) ?? 0,
  });
}

export interface ProStats {
  month_revenue: number;
  today_revenue: number;
  jobs_done_month: number;
  jobs_upcoming: number;
  hours_month: number;
}

export function useProStats() {
  const { session } = useAuth();
  return useQuery({
    queryKey: keys.proStats,
    enabled: !!session,
    queryFn: async (): Promise<ProStats> => {
      const data = throwIf(await sb().rpc('pro_dashboard_stats'));
      const d = (data ?? {}) as Partial<Record<keyof ProStats, number>>;
      return {
        month_revenue: Number(d.month_revenue ?? 0),
        today_revenue: Number(d.today_revenue ?? 0),
        jobs_done_month: Number(d.jobs_done_month ?? 0),
        jobs_upcoming: Number(d.jobs_upcoming ?? 0),
        hours_month: Number(d.hours_month ?? 0),
      };
    },
  });
}

// ---------------------------------------------------------------------------
// Chat & notifications
// ---------------------------------------------------------------------------
export function useMessages(missionId: string | undefined) {
  return useQuery({
    queryKey: keys.messages(missionId ?? ''),
    enabled: !!missionId,
    refetchInterval: 8_000,
    queryFn: async (): Promise<Message[]> =>
      list(await sb().from('messages').select('*').eq('mission_id', missionId!).order('created_at')),
  });
}

export function useConversations() {
  const { session } = useAuth();
  const services = useServices();
  return useQuery({
    queryKey: keys.conversations,
    enabled: !!session && !!services.data,
    refetchInterval: 20_000,
    queryFn: async (): Promise<Conversation[]> => {
      const rows = list(await sb().from('conversations').select('*').order('updated_at', { ascending: false }));
      const ids = [...new Set(rows.flatMap((r) => [r.client_id, r.pro_id]))];
      const profiles = ids.length ? list(await sb().from('profiles').select(PROFILE_LITE).in('id', ids)) : [];
      const byId = new Map<string, ProfileLite>(profiles.map((p) => [p.id, p as ProfileLite]));
      return rows
        .map((r) => ({
          ...r,
          client: byId.get(r.client_id) ?? null,
          pro: byId.get(r.pro_id) ?? null,
          service: services.data?.find((s) => s.id === r.service_id) ?? null,
        }))
        .sort((a, b) => (b.last_at ?? b.updated_at).localeCompare(a.last_at ?? a.updated_at));
    },
  });
}

export function useUnreadCounts() {
  const { session } = useAuth();
  return useQuery({
    queryKey: keys.unread,
    enabled: !!session,
    refetchInterval: 20_000,
    queryFn: async (): Promise<{ messages: number; notifications: number }> => {
      const data = throwIf(await sb().rpc('unread_counts'));
      const d = (data ?? {}) as { messages?: number; notifications?: number };
      return { messages: Number(d.messages ?? 0), notifications: Number(d.notifications ?? 0) };
    },
  });
}

export function useNotifications() {
  const { session } = useAuth();
  return useQuery({
    queryKey: keys.notifications,
    enabled: !!session,
    queryFn: async (): Promise<NotificationRow[]> =>
      list(await sb().from('notifications').select('*').order('created_at', { ascending: false }).limit(100)),
  });
}

// ---------------------------------------------------------------------------
// Avis
// ---------------------------------------------------------------------------
export function useReviews(targetId: string | undefined) {
  return useQuery({
    queryKey: keys.reviews(targetId ?? ''),
    enabled: !!targetId,
    queryFn: async (): Promise<ReviewFull[]> =>
      throwIf(
        await sb()
          .from('reviews')
          .select(`*, author:profiles!reviews_author_id_fkey(${PROFILE_LITE}), mission:missions(id, service_id, service:services(name))`)
          .eq('target_id', targetId!)
          .order('created_at', { ascending: false }),
      ) as unknown as ReviewFull[],
  });
}

export function useMyReview(missionId: string | undefined) {
  const { session } = useAuth();
  return useQuery({
    queryKey: keys.myReview(missionId ?? ''),
    enabled: !!missionId && !!session,
    queryFn: async () =>
      throwIf(
        await sb().from('reviews').select('*').eq('mission_id', missionId!).eq('author_id', session!.user.id).maybeSingle(),
      ),
  });
}

// ---------------------------------------------------------------------------
// Fichiers privés
// ---------------------------------------------------------------------------
export function useSignedUrl(bucket: Bucket, path: string | null | undefined) {
  return useQuery({
    queryKey: keys.signed(bucket, path ?? ''),
    enabled: !!path,
    staleTime: 50 * 60_000,
    queryFn: () => signedUrl(bucket, path!, 3600),
  });
}

export function useInvalidate() {
  const qc = useQueryClient();
  return (...ks: readonly (readonly unknown[])[]) => Promise.all(ks.map((k) => qc.invalidateQueries({ queryKey: k as unknown[] })));
}
