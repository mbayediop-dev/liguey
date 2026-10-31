import fakeDataProvider from 'ra-data-fakerest';
import type { AuthProvider, DataProvider, GetListParams, GetManyReferenceParams } from 'react-admin';
import { demoData, demoStats, missions, notifications, profiles } from './data';
import type { DashboardStats } from '../lib/admin';

/** Convertit les filtres PostgREST (`champ@op`) en suffixes FakeRest (`champ_op`, `q`). */
function convertFilter(filter: Record<string, unknown> = {}): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(filter)) {
    if (value === undefined || value === null || value === '') continue;
    const [field, op] = key.split('@');
    if (!op) out[field!] = value;
    else if (op === 'ilike' || op === 'like') out[field === 'search' ? 'q' : `${field}_q`] = value;
    else if (op === 'gte' || op === 'lte' || op === 'gt' || op === 'lt' || op === 'neq') out[`${field}_${op}`] = value;
    else out[field!] = value;
  }
  return out;
}

const base = fakeDataProvider(demoData, false);

export const demoDataProvider: DataProvider = {
  ...base,
  getList: (resource, params: GetListParams) => base.getList(resource, { ...params, filter: convertFilter(params.filter) }),
  getManyReference: (resource, params: GetManyReferenceParams) => base.getManyReference(resource, { ...params, filter: convertFilter(params.filter) }),
};

export const demoAuthProvider: AuthProvider = {
  login: async () => undefined,
  logout: async () => undefined,
  checkAuth: async () => undefined,
  checkError: async () => undefined,
  getPermissions: async () => 'admin',
  getIdentity: async () => ({ id: 'admin-1', fullName: 'Ada Admin' }),
};

const delay = () => new Promise((r) => setTimeout(r, 300));

export const demoAdmin = {
  async stats(): Promise<DashboardStats> {
    await delay();
    return demoStats();
  },
  async setVerification(userId: string, status: 'pending' | 'verified' | 'rejected', note?: string | null) {
    await delay();
    const p = profiles.find((x) => x.id === userId);
    if (!p) throw new Error('Utilisateur introuvable');
    p.verification_status = status;
    p.verification_note = note ?? null;
    p.verified_at = status === 'verified' ? new Date().toISOString() : null;
    return p;
  },
  async setBlocked(userId: string, blocked: boolean, reason?: string | null) {
    await delay();
    const p = profiles.find((x) => x.id === userId);
    if (!p) throw new Error('Utilisateur introuvable');
    p.is_blocked = blocked;
    p.blocked_reason = blocked ? (reason ?? null) : null;
    return p;
  },
  async setAdmin(userId: string, isAdmin: boolean) {
    await delay();
    const p = profiles.find((x) => x.id === userId);
    if (!p) throw new Error('Utilisateur introuvable');
    p.is_admin = isAdmin;
    return p;
  },
  async cancelMission(missionId: string, reason?: string | null) {
    await delay();
    const m = missions.find((x) => x.id === missionId);
    if (!m) throw new Error('Mission introuvable');
    m.status = 'cancelled';
    m.cancelled_at = new Date().toISOString();
    m.cancelled_by = 'admin-1';
    m.cancel_reason = reason ?? null;
    return m;
  },
  async notify(userId: string, title: string, body?: string | null) {
    await delay();
    const n = { id: `ntf-${notifications.length + 1}`, user_id: userId, kind: 'system' as const, title, body: body ?? null, data: { from: 'admin' }, read_at: null, created_at: new Date().toISOString() };
    notifications.unshift(n);
    return n;
  },
};
