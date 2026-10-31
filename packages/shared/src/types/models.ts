import type {
  MissionExpenseRow,
  MissionRescheduleRow,
  MissionRow,
  MessageRow,
  ProfileRow,
  ReviewRow,
  ServiceRow,
  SubServiceRow,
  ConversationRow,
  NotificationRow,
} from '../supabase/database.types';

export type Profile = ProfileRow;
export type Service = ServiceRow;
export type SubService = SubServiceRow;
export type Mission = MissionRow;
export type Message = MessageRow;
export type Review = ReviewRow;
export type Expense = MissionExpenseRow;
export type Reschedule = MissionRescheduleRow;
export type Notification = NotificationRow;

export type ProfileLite = Pick<
  ProfileRow,
  'id' | 'first_name' | 'last_name' | 'avatar_url' | 'rating_avg' | 'rating_count' | 'phone' | 'city'
>;

export type ServiceWithSubs = ServiceRow & { sub_services: SubServiceRow[] };

export type ServiceLite = Pick<
  ServiceRow,
  'id' | 'slug' | 'name' | 'client_rate_chf' | 'pro_rate_chf' | 'required_tools' | 'tools_note'
>;

export type MissionFull = MissionRow & {
  service: ServiceLite | null;
  sub_service: Pick<SubServiceRow, 'id' | 'name'> | null;
  client: ProfileLite | null;
  pro: ProfileLite | null;
};

export type ReviewFull = ReviewRow & {
  author: ProfileLite | null;
  mission: (Pick<MissionRow, 'id' | 'service_id'> & { service: Pick<ServiceRow, 'name'> | null }) | null;
};

export type Conversation = ConversationRow & {
  client: ProfileLite | null;
  pro: ProfileLite | null;
  service: Pick<ServiceRow, 'name' | 'slug'> | null;
};

export const PROFILE_LITE = 'id, first_name, last_name, avatar_url, rating_avg, rating_count, phone, city';

export const MISSION_SELECT =
  `*, service:services(id, slug, name, client_rate_chf, pro_rate_chf, required_tools, tools_note), sub_service:sub_services(id, name), client:profiles!missions_client_id_fkey(${PROFILE_LITE}), pro:profiles!missions_pro_id_fkey(${PROFILE_LITE})` as const;

export const ACTIVE_STATUSES = [
  'searching',
  'posted',
  'pending_validation',
  'confirmed',
  'start_requested',
  'in_progress',
] as const;
export const UPCOMING_STATUSES = ['pending_validation', 'confirmed', 'start_requested', 'in_progress'] as const;
