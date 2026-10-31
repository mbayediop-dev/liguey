import type { Json, MissionRow, NotificationRow, ProfileRow, VerificationStatus } from '@shared/supabase/database.types';
import { supabase } from '../supabase';
import { isDemo } from '../demo/flag';
import { demoAdmin } from '../demo/providers';

/** Statistiques renvoyées par public.admin_dashboard_stats(). */
export interface DashboardStats {
  clients: number;
  pros: number;
  pros_pending: number;
  blocked: number;
  new_users_30d: number;
  missions_total: number;
  missions_active: number;
  missions_searching: number;
  missions_today: number;
  missions_by_status: Record<string, number>;
  revenue_month: number;
  margin_month: number;
  revenue_total: number;
  margin_total: number;
  avg_rating_pros: number;
  support_open: number;
  missions_daily: { day: string; created: number; completed: number }[];
  revenue_monthly: { month: string; revenue: number; margin: number; missions: number }[];
  top_services: { service_id: string; name: string; missions: number; revenue: number }[];
}

function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  if (res.data === null || res.data === undefined) throw new Error('Réponse vide');
  return res.data;
}

/** Actions d'administration exposées par des fonctions SQL SECURITY DEFINER (vérifient is_admin()). */
const realAdmin = {
  async stats(): Promise<DashboardStats> {
    const data = unwrap<Json>(await supabase.rpc('admin_dashboard_stats'));
    return data as unknown as DashboardStats;
  },
  async setVerification(userId: string, status: VerificationStatus, note?: string | null): Promise<ProfileRow> {
    return unwrap(await supabase.rpc('admin_set_verification', { p_user_id: userId, p_status: status, p_note: note ?? null }));
  },
  async setBlocked(userId: string, blocked: boolean, reason?: string | null): Promise<ProfileRow> {
    return unwrap(await supabase.rpc('admin_set_blocked', { p_user_id: userId, p_blocked: blocked, p_reason: reason ?? null }));
  },
  async setAdmin(userId: string, isAdmin: boolean): Promise<ProfileRow> {
    return unwrap(await supabase.rpc('admin_set_admin', { p_user_id: userId, p_admin: isAdmin }));
  },
  async cancelMission(missionId: string, reason?: string | null): Promise<MissionRow> {
    return unwrap(await supabase.rpc('admin_cancel_mission', { p_mission_id: missionId, p_reason: reason ?? null }));
  },
  async notify(userId: string, title: string, body?: string | null): Promise<NotificationRow> {
    return unwrap(await supabase.rpc('admin_notify', { p_user_id: userId, p_title: title, p_body: body ?? null }));
  },
};

export const admin: typeof realAdmin = isDemo ? demoAdmin : realAdmin;
