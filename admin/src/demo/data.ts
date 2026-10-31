/* Données fictives déterministes pour le mode démo (aucun appel réseau). */
import type {
  LegalPageRow,
  MessageRow,
  MissionExpenseRow,
  MissionRescheduleRow,
  MissionRow,
  MissionStatus,
  NotificationRow,
  PaymentRow,
  ProDocumentRow,
  ProServiceRow,
  ProfileRow,
  ReviewRow,
  ServiceRow,
  SubServiceRow,
  SupportRequestRow,
  VatRateRow,
} from '@shared/supabase/database.types';
import type { DashboardStats } from '../lib/admin';

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(20261031);
const int = (min: number, max: number) => min + Math.floor(rnd() * (max - min + 1));
const pick = <T,>(a: readonly T[]): T => a[Math.floor(rnd() * a.length)]!;
const chance = (p: number) => rnd() < p;
const round2 = (n: number) => Math.round(n * 100) / 100;
const id = (prefix: string, n: number) => `${prefix}-${String(n).padStart(4, '0')}`;
const dayAt = (offset: number, hour = 10, minute = 0) => {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  d.setDate(d.getDate() + offset);
  return d;
};
const iso = (d: Date) => d.toISOString();
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const hm = (h: number, m = 0) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;

const FIRST = ['Marion', 'Jean', 'Léa', 'Nicolas', 'Camille', 'Luca', 'Sofia', 'Mehdi', 'Anaïs', 'Thomas', 'Elena', 'Yann', 'Chloé', 'Rafael', 'Inès', 'Julien', 'Nora', 'Samuel', 'Alice', 'David'];
const LAST = ['Leuenberger', 'Doute', 'Rochat', 'Favre', 'Muller', 'Bianchi', 'Moreau', 'Haddad', 'Gauthier', 'Keller', 'Perrin', 'Da Silva', 'Bonvin', 'Nguyen', 'Zbinden', 'Roth', 'Martin', 'Chevalley', 'Oliveira', 'Schmid'];
const CITIES = [
  ['Lausanne', '1003'],
  ['Bussigny', '1030'],
  ['Renens', '1020'],
  ['Morges', '1110'],
  ['Pully', '1009'],
  ['Nyon', '1260'],
  ['Vevey', '1800'],
  ['Genève', '1201'],
  ['Yverdon-les-Bains', '1400'],
  ['Montreux', '1820'],
] as const;
const STREETS = ['Rue des Alpes', 'Avenue de la Gare', 'Chemin des Vignes', 'Rue du Lac', 'Route de Berne', 'Avenue de Rumine', 'Rue Centrale', 'Chemin de la Forêt'];

const SERVICES: [string, string, number, number][] = [
  ['electricien', 'Électricien', 49.9, 39.9],
  ['demenageur', 'Déménageur', 45, 34.9],
  ['dogsitter', 'Dogsitter', 29.9, 22.9],
  ['bricoleur', 'Bricoleur', 40, 29.9],
  ['plombier', 'Plombier', 59.9, 45],
  ['menage', 'Ménage', 35, 26.9],
  ['debarras', 'Débarras', 45, 34.9],
  ['jardinier', 'Jardinier', 39.9, 29.9],
  ['coursier', 'Coursier', 29.9, 22.9],
  ['beaute', 'Mise en beauté', 55, 42],
];
const SUBS: Record<string, string[]> = {
  electricien: ['Installation de luminaires', 'Dépannage électrique', 'Pose de prises'],
  demenageur: ['Déménagement studio', 'Déménagement appartement', 'Transport de meubles'],
  dogsitter: ['Promenade', 'Garde à domicile', 'Visite quotidienne'],
  bricoleur: ['Montage de meubles', 'Fixation murale', 'Petites réparations'],
  plombier: ['Fuite d’eau', 'Débouchage', 'Installation sanitaire'],
  menage: ['Ménage régulier', 'Grand nettoyage', 'Fin de bail'],
  debarras: ['Débarras de cave', 'Évacuation de meubles'],
  jardinier: ['Tonte', 'Taille de haies', 'Entretien de massifs'],
  coursier: ['Courses alimentaires', 'Livraison de colis'],
  beaute: ['Coiffure', 'Manucure', 'Maquillage'],
};

const now = new Date();
const base = {
  settings: { notifications: true, newsletter: false, touch_id: false, language: 'fr', country: 'CH' },
};

export const services: ServiceRow[] = SERVICES.map(([slug, name, c, p], i) => ({
  id: `svc-${slug}`,
  slug,
  name,
  sort_order: i + 1,
  client_rate_chf: c,
  pro_rate_chf: p,
  required_tools: ['Outillage de base'],
  tools_note: null,
  is_active: true,
}));

export const sub_services: SubServiceRow[] = services.flatMap((s) =>
  (SUBS[s.slug] ?? []).map((name, j) => ({ id: `sub-${s.slug}-${j + 1}`, service_id: s.id, name, sort_order: j + 1 })),
);

export const vat_rates: VatRateRow[] = [
  { code: 1, rate: 8.1, label: 'Taux normal' },
  { code: 2, rate: 2.6, label: 'Taux réduit' },
];

export const legal_pages: LegalPageRow[] = [
  { slug: 'about', title: 'À propos de HEROES', body: '# HEROES\n\nDes héros du quotidien pour vos services à domicile.', updated_at: iso(dayAt(-40)) },
  { slug: 'cgu', title: 'Conditions générales', body: '# Conditions générales d’utilisation\n\n1. Objet\n2. Inscription\n3. Paiement', updated_at: iso(dayAt(-12)) },
  { slug: 'privacy', title: 'Confidentialité', body: '# Politique de confidentialité\n\nVos données restent en Suisse.', updated_at: iso(dayAt(-12)) },
  { slug: 'website', title: 'Site web', body: 'https://heroes.swiss', updated_at: iso(dayAt(-90)) },
];

function profile(n: number, role: 'client' | 'pro', created: Date, extra: Partial<ProfileRow> = {}): ProfileRow {
  const first = pick(FIRST);
  const last = pick(LAST);
  const [city, zip] = pick(CITIES);
  const p: ProfileRow = {
    id: id(role === 'pro' ? 'pro' : 'cli', n),
    role,
    email: `${first}.${last}`.toLowerCase().replace(/[^a-z.]/g, '') + `${n}@exemple.ch`,
    first_name: first,
    last_name: last,
    birth_date: `${int(1965, 2002)}-${String(int(1, 12)).padStart(2, '0')}-${String(int(1, 28)).padStart(2, '0')}`,
    street: `${pick(STREETS)} ${int(1, 80)}`,
    zip,
    city,
    country: 'Suisse',
    phone: `+41 7${int(6, 9)} ${int(100, 999)} ${int(10, 99)} ${int(10, 99)}`,
    avatar_url: null,
    company_type: role === 'pro' ? pick(['independant', 'independant', 'SARL', 'SA'] as const) : null,
    rating_avg: 0,
    rating_count: 0,
    cgu_accepted_at: iso(created),
    onboarding_completed: true,
    settings: base.settings,
    push_token: chance(0.7) ? 'ExponentPushToken[demo]' : null,
    is_admin: false,
    is_blocked: false,
    blocked_reason: null,
    verification_status: role === 'pro' ? 'verified' : 'pending',
    verification_note: null,
    verified_at: role === 'pro' ? iso(created) : null,
    search: null,
    created_at: iso(created),
    updated_at: iso(created),
    ...extra,
  };
  p.search = [p.first_name, p.last_name, p.email, p.city, p.phone].join(' ').toLowerCase();
  return p;
}

export const profiles: ProfileRow[] = [];
profiles.push(
  profile(1, 'client', dayAt(-200), { id: 'admin-1', first_name: 'Ada', last_name: 'Admin', email: 'admin@heroes.swiss', is_admin: true, city: 'Lausanne' }),
);
for (let i = 1; i <= 26; i++) profiles.push(profile(i, 'client', dayAt(-int(1, 180), int(8, 20))));
for (let i = 1; i <= 16; i++) {
  const extra: Partial<ProfileRow> = {};
  if (i <= 3) {
    extra.verification_status = 'pending';
    extra.verified_at = null;
  } else if (i === 4) {
    extra.verification_status = 'rejected';
    extra.verified_at = null;
    extra.verification_note = 'Pièce d’identité illisible';
  }
  if (i === 16) extra.onboarding_completed = false;
  profiles.push(profile(i, 'pro', dayAt(-int(5, 240), int(8, 20)), extra));
}
profiles[5]!.is_blocked = true;
profiles[5]!.blocked_reason = 'Impayés répétés';

const clients = profiles.filter((p) => p.role === 'client' && !p.is_admin);
const pros = profiles.filter((p) => p.role === 'pro');

export const pro_services: (ProServiceRow & { id: string })[] = pros.flatMap((p) => {
  const picked = new Set<string>();
  const count = int(1, 3);
  while (picked.size < count) picked.add(pick(services).id);
  return [...picked].map((sid) => ({ id: `${p.id}_${sid}`, pro_id: p.id, service_id: sid, created_at: p.created_at }));
});

export const pro_documents: ProDocumentRow[] = pros.flatMap((p, i) => {
  const docs: ProDocumentRow[] = [
    { id: `doc-${i}-1`, pro_id: p.id, kind: 'experience', side: null, label: 'CV', file_path: `${p.id}/cv.pdf`, mime_type: 'application/pdf', created_at: p.created_at },
    { id: `doc-${i}-2`, pro_id: p.id, kind: 'id_card', side: 'recto', label: null, file_path: `${p.id}/id-recto.jpg`, mime_type: 'image/jpeg', created_at: p.created_at },
    { id: `doc-${i}-3`, pro_id: p.id, kind: 'id_card', side: 'verso', label: null, file_path: `${p.id}/id-verso.jpg`, mime_type: 'image/jpeg', created_at: p.created_at },
  ];
  if (p.company_type !== 'independant') docs.push({ id: `doc-${i}-4`, pro_id: p.id, kind: 'commerce', side: null, label: 'Extrait RC', file_path: `${p.id}/rc.pdf`, mime_type: 'application/pdf', created_at: p.created_at });
  return docs;
});

export const missions: MissionRow[] = [];
export const mission_expenses: MissionExpenseRow[] = [];
export const payments: PaymentRow[] = [];
export const reviews: ReviewRow[] = [];
export const messages: MessageRow[] = [];
export const mission_reschedules: MissionRescheduleRow[] = [];

const COMMENTS_C = ['Super héros, ponctuel et efficace !', 'Très bon travail, je recommande.', 'Correct, un peu en retard.', 'Parfait du début à la fin.', 'Travail soigné, merci !'];
const COMMENTS_P = ['Cliente très aimable.', 'Mission claire, bonne communication.', 'Accès un peu compliqué mais tout s’est bien passé.'];
const DESCR = ['Monter une étagère et fixer un miroir', 'Grand nettoyage avant état des lieux', 'Promenade du chien 2× par jour', 'Tonte et taille des haies', 'Remplacer un luminaire', 'Déménager un studio au 3e étage', 'Déboucher l’évier de la cuisine', 'Courses de la semaine'];

for (let i = 1; i <= 150; i++) {
  const offset = int(-70, 12);
  const date = dayAt(offset, 0);
  const service = pick(services);
  const subs = sub_services.filter((s) => s.service_id === service.id);
  const client = pick(clients);
  const startH = int(8, 17);
  const hours = pick([1, 1.5, 2, 2, 3, 4]);
  const endH = startH + Math.floor(hours);
  const endM = (hours % 1) * 60;
  const created = dayAt(offset - int(1, 6), int(8, 21), int(0, 59));
  let status: MissionStatus;
  if (offset < -1) status = chance(0.8) ? 'completed' : chance(0.6) ? 'cancelled' : 'completed';
  else if (offset <= 0) status = pick(['in_progress', 'start_requested', 'completed', 'confirmed'] as const);
  else status = pick(['confirmed', 'confirmed', 'pending_validation', 'searching', 'searching', 'posted'] as const);
  const pro = status === 'searching' || status === 'posted' ? null : pick(pros.filter((p) => p.verification_status === 'verified' && p.onboarding_completed));
  const baseAmount = round2(hours * service.client_rate_chf);
  const m: MissionRow = {
    id: id('mis', i),
    client_id: client.id,
    pro_id: pro?.id ?? null,
    service_id: service.id,
    sub_service_id: subs.length ? pick(subs).id : null,
    status,
    street: client.street ?? 'Rue du Lac 1',
    zip: client.zip ?? '1000',
    city: client.city ?? 'Lausanne',
    start_date: ymd(date),
    time_start: hm(startH),
    time_end: hm(endH, endM),
    recurrence: pick(['once', 'once', 'once', 'weekly', 'weekdays'] as const),
    description: pick(DESCR),
    client_rate_chf: service.client_rate_chf,
    pro_rate_chf: service.pro_rate_chf,
    base_hours: hours,
    base_amount_chf: baseAmount,
    total_ttc_chf: null,
    total_vat_chf: null,
    pro_amount_chf: null,
    accepted_at: null,
    validated_at: null,
    start_requested_at: null,
    started_at: null,
    completed_at: null,
    client_confirmed_at: null,
    cancelled_at: null,
    cancelled_by: null,
    cancel_reason: null,
    created_at: iso(created),
    updated_at: iso(created),
  };
  const order: MissionStatus[] = ['pending_validation', 'confirmed', 'start_requested', 'in_progress', 'completed'];
  const reached = (s: MissionStatus) => order.indexOf(status) >= order.indexOf(s) || (status === 'cancelled' && chance(0.5));
  if (pro && reached('pending_validation')) m.accepted_at = iso(dayAt(offset - 1, int(8, 20)));
  if (pro && reached('confirmed')) {
    m.validated_at = iso(dayAt(offset - 1, int(9, 21)));
    payments.push({ id: `pay-${i}`, mission_id: m.id, payer_id: client.id, payment_method_id: null, amount_chf: baseAmount, currency: 'CHF', status: status === 'cancelled' ? 'refunded' : 'succeeded', provider: 'mock', provider_ref: `mock_${i}`, created_at: m.validated_at });
  }
  if (pro && reached('start_requested')) m.start_requested_at = iso(dayAt(offset, startH, 2));
  if (pro && reached('in_progress')) m.started_at = iso(dayAt(offset, startH, 5));
  if (pro && status === 'completed') {
    let extra = 0;
    let extraPro = 0;
    if (chance(0.35)) {
      const amount = pick([4.9, 12.5, 24, 35.9]);
      mission_expenses.push({ id: `exp-${i}-1`, mission_id: m.id, kind: 'material', label: pick(['Produits', 'Vis et chevilles', 'Sacs de gravats', 'Fournitures']), amount_chf: amount, vat_code: pick([1, 2]), minutes: null, receipt_path: `${m.id}/ticket.jpg`, created_by: pro.id, created_at: iso(dayAt(offset, endH)) });
      extra += amount;
      extraPro += amount;
    }
    if (chance(0.25)) {
      const minutes = pick([15, 30, 45]);
      const amount = round2((minutes / 60) * service.client_rate_chf);
      mission_expenses.push({ id: `exp-${i}-2`, mission_id: m.id, kind: 'time', label: 'Temps supplémentaire', amount_chf: amount, vat_code: 1, minutes, receipt_path: null, created_by: pro.id, created_at: iso(dayAt(offset, endH)) });
      extra += amount;
      extraPro += round2((minutes / 60) * service.pro_rate_chf);
    }
    m.completed_at = iso(dayAt(offset, endH, int(0, 30)));
    m.client_confirmed_at = chance(0.85) ? iso(dayAt(offset, endH + 1)) : null;
    m.total_ttc_chf = round2(baseAmount + extra);
    m.total_vat_chf = round2(m.total_ttc_chf - m.total_ttc_chf / 1.081);
    m.pro_amount_chf = round2(hours * service.pro_rate_chf + extraPro);
    if (chance(0.8)) reviews.push({ id: `rev-${i}-c`, mission_id: m.id, author_id: client.id, target_id: pro.id, rating: pick([3, 4, 4, 4.5, 5, 5, 5]), comment: pick(COMMENTS_C), created_at: iso(dayAt(offset + 1, 9)) });
    if (chance(0.5)) reviews.push({ id: `rev-${i}-p`, mission_id: m.id, author_id: pro.id, target_id: client.id, rating: pick([4, 5, 5]), comment: pick(COMMENTS_P), created_at: iso(dayAt(offset + 1, 10)) });
    if (chance(0.3)) {
      messages.push({ id: `msg-${i}-1`, mission_id: m.id, sender_id: client.id, body: 'Bonjour, le code de l’immeuble est 2580.', image_path: null, created_at: iso(dayAt(offset - 1, 18)), read_at: iso(dayAt(offset - 1, 18, 20)) });
      messages.push({ id: `msg-${i}-2`, mission_id: m.id, sender_id: pro.id, body: 'Merci, à demain !', image_path: null, created_at: iso(dayAt(offset - 1, 18, 25)), read_at: null });
    }
  }
  if (status === 'cancelled') {
    m.cancelled_at = iso(dayAt(offset - 1, int(8, 22)));
    m.cancelled_by = chance(0.7) ? client.id : (pro?.id ?? client.id);
    m.cancel_reason = pick(['Empêchement', 'Plus besoin', null, 'Doublon']);
  }
  if (pro && chance(0.08)) {
    mission_reschedules.push({ id: `res-${i}`, mission_id: m.id, proposed_by: chance(0.5) ? pro.id : client.id, start_date: ymd(dayAt(offset + 1)), time_start: hm(startH + 1), time_end: hm(endH + 1, endM), status: pick(['accepted', 'declined', 'pending'] as const), created_at: iso(dayAt(offset - 2, 12)), resolved_at: null });
  }
  missions.push(m);
}

// Notes moyennes des profils à partir des avis
for (const p of profiles) {
  const got = reviews.filter((r) => r.target_id === p.id);
  p.rating_count = got.length;
  p.rating_avg = got.length ? round2(got.reduce((s, r) => s + Number(r.rating), 0) / got.length) : 0;
}

export const support_requests: SupportRequestRow[] = [
  { id: 'sup-1', user_id: clients[2]!.id, message: 'Je n’arrive pas à ajouter ma carte de paiement, l’application affiche une erreur.', status: 'open', admin_note: null, handled_by: null, handled_at: null, created_at: iso(dayAt(0, 8, 42)) },
  { id: 'sup-2', user_id: pros[1]!.id, message: 'Mon virement du mois dernier n’est pas arrivé.', status: 'open', admin_note: null, handled_by: null, handled_at: null, created_at: iso(dayAt(-1, 17, 10)) },
  { id: 'sup-3', user_id: clients[7]!.id, message: 'Le héros n’est pas venu, que faire ?', status: 'open', admin_note: null, handled_by: null, handled_at: null, created_at: iso(dayAt(-1, 9, 5)) },
  { id: 'sup-4', user_id: pros[6]!.id, message: 'Comment ajouter une nouvelle prestation à mon profil ?', status: 'in_progress', admin_note: 'Réponse envoyée, en attente de retour', handled_by: 'admin-1', handled_at: iso(dayAt(-2, 11)), created_at: iso(dayAt(-3, 14, 30)) },
  { id: 'sup-5', user_id: clients[11]!.id, message: 'Facture introuvable pour la mission du 12.', status: 'closed', admin_note: 'Facture renvoyée par e-mail', handled_by: 'admin-1', handled_at: iso(dayAt(-6, 10)), created_at: iso(dayAt(-7, 16)) },
  { id: 'sup-6', user_id: clients[4]!.id, message: 'Peut-on réserver un ménage toutes les deux semaines ?', status: 'closed', admin_note: null, handled_by: 'admin-1', handled_at: iso(dayAt(-12, 10)), created_at: iso(dayAt(-13, 12)) },
];

export const notifications: NotificationRow[] = Array.from({ length: 40 }, (_, i) => {
  const u = pick(profiles);
  const kind = pick(['mission', 'mission', 'message', 'system'] as const);
  const title = kind === 'mission' ? pick(['Vous avez une mission !', 'Mission confirmée', 'Mission terminée']) : kind === 'message' ? 'Nouveau message' : pick(['Profil vérifié', 'Réponse du support HEROES']);
  const at = dayAt(-int(0, 20), int(7, 22), int(0, 59));
  return { id: `ntf-${i + 1}`, user_id: u.id, kind, title, body: kind === 'system' ? 'Bienvenue chez HEROES !' : 'Appuyez pour voir', data: {}, read_at: chance(0.6) ? iso(at) : null, created_at: iso(at) };
});

/** Même structure que la RPC admin_dashboard_stats(), calculée sur les fixtures. */
export function demoStats(): DashboardStats {
  const month = now.toISOString().slice(0, 7);
  const completed = missions.filter((m) => m.status === 'completed');
  const inMonth = completed.filter((m) => (m.completed_at ?? '').slice(0, 7) === month);
  const sum = (arr: MissionRow[], f: (m: MissionRow) => number) => round2(arr.reduce((s, m) => s + f(m), 0));
  const byStatus: Record<string, number> = {};
  for (const m of missions) byStatus[m.status] = (byStatus[m.status] ?? 0) + 1;
  const today = ymd(now);
  const daily = Array.from({ length: 30 }, (_, i) => {
    const d = ymd(dayAt(i - 29));
    return { day: d, created: missions.filter((m) => m.created_at.slice(0, 10) === d).length, completed: completed.filter((m) => (m.completed_at ?? '').slice(0, 10) === d).length };
  });
  const monthly = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const rows = completed.filter((m) => (m.completed_at ?? '').slice(0, 7) === key);
    return { month: key, revenue: sum(rows, (m) => Number(m.total_ttc_chf ?? 0)), margin: sum(rows, (m) => Number(m.total_ttc_chf ?? 0) - Number(m.pro_amount_chf ?? 0)), missions: rows.length };
  });
  const top = services
    .map((s) => {
      const rows = missions.filter((m) => m.service_id === s.id);
      return { service_id: s.id, name: s.name, missions: rows.length, revenue: sum(rows.filter((m) => m.status === 'completed'), (m) => Number(m.total_ttc_chf ?? 0)) };
    })
    .sort((a, b) => b.missions - a.missions)
    .slice(0, 5);
  const ratedPros = pros.filter((p) => p.rating_count > 0);
  return {
    clients: profiles.filter((p) => p.role === 'client').length,
    pros: pros.length,
    pros_pending: pros.filter((p) => p.onboarding_completed && p.verification_status === 'pending').length,
    blocked: profiles.filter((p) => p.is_blocked).length,
    new_users_30d: profiles.filter((p) => new Date(p.created_at) >= dayAt(-30)).length,
    missions_total: missions.length,
    missions_active: missions.filter((m) => !['completed', 'cancelled'].includes(m.status)).length,
    missions_searching: missions.filter((m) => m.status === 'searching' || m.status === 'posted').length,
    missions_today: missions.filter((m) => m.start_date === today && ['confirmed', 'start_requested', 'in_progress'].includes(m.status)).length,
    missions_by_status: byStatus,
    revenue_month: sum(inMonth, (m) => Number(m.total_ttc_chf ?? 0)),
    margin_month: sum(inMonth, (m) => Number(m.total_ttc_chf ?? 0) - Number(m.pro_amount_chf ?? 0)),
    revenue_total: sum(completed, (m) => Number(m.total_ttc_chf ?? 0)),
    margin_total: sum(completed, (m) => Number(m.total_ttc_chf ?? 0) - Number(m.pro_amount_chf ?? 0)),
    avg_rating_pros: ratedPros.length ? round2(ratedPros.reduce((s, p) => s + Number(p.rating_avg), 0) / ratedPros.length) : 0,
    support_open: support_requests.filter((s) => s.status !== 'closed').length,
    missions_daily: daily,
    revenue_monthly: monthly,
    top_services: top,
  };
}

export const demoData = {
  profiles,
  services,
  sub_services,
  vat_rates: vat_rates.map((v) => ({ ...v, id: v.code })),
  legal_pages: legal_pages.map((l) => ({ ...l, id: l.slug })),
  pro_services,
  pro_documents,
  missions,
  mission_expenses,
  mission_reschedules,
  payments,
  messages,
  reviews,
  notifications,
  support_requests,
};
