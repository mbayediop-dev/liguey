/* Types de la base HEROES, écrits à la main pour refléter supabase/migrations/20261030000000_init.sql. */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = 'client' | 'pro';
export type MissionStatus =
  | 'searching'
  | 'posted'
  | 'pending_validation'
  | 'confirmed'
  | 'start_requested'
  | 'in_progress'
  | 'completed'
  | 'cancelled';
export type RecurrenceKind = 'once' | 'weekdays' | 'daily' | 'weekly';
export type DocumentKind = 'experience' | 'commerce' | 'id_card' | 'passport' | 'residence_permit';
export type DocumentSide = 'recto' | 'verso';
export type CompanyType = 'SA' | 'SARL' | 'independant';
export type ExpenseKind = 'material' | 'time' | 'other';
export type RescheduleStatus = 'pending' | 'accepted' | 'declined';
export type NotificationKind = 'mission' | 'message' | 'system';
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';
export type SupportStatus = 'open' | 'in_progress' | 'closed';

export interface ProfileSettings {
  notifications: boolean;
  newsletter: boolean;
  touch_id: boolean;
  language: string;
  country: string;
}

export type ProfileRow = {
  id: string;
  role: UserRole;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  birth_date: string | null;
  street: string | null;
  zip: string | null;
  city: string | null;
  country: string;
  phone: string | null;
  avatar_url: string | null;
  company_type: CompanyType | null;
  rating_avg: number;
  rating_count: number;
  cgu_accepted_at: string | null;
  onboarding_completed: boolean;
  settings: Json;
  push_token: string | null;
  is_admin: boolean;
  is_blocked: boolean;
  blocked_reason: string | null;
  verification_status: VerificationStatus;
  verification_note: string | null;
  verified_at: string | null;
  search: string | null; // colonne générée (recherche back-office)
  created_at: string;
  updated_at: string;
}

export type ServiceRow = {
  id: string;
  slug: string;
  name: string;
  sort_order: number;
  client_rate_chf: number;
  pro_rate_chf: number;
  required_tools: string[];
  tools_note: string | null;
  is_active: boolean;
}

export type SubServiceRow = {
  id: string;
  service_id: string;
  name: string;
  sort_order: number;
}

export type VatRateRow = {
  code: number;
  rate: number;
  label: string;
}

export type LegalPageRow = {
  slug: string;
  title: string;
  body: string;
  updated_at: string;
}

export type ProServiceRow = {
  pro_id: string;
  service_id: string;
  created_at: string;
}

export type ProDocumentRow = {
  id: string;
  pro_id: string;
  kind: DocumentKind;
  side: DocumentSide | null;
  label: string | null;
  file_path: string;
  mime_type: string | null;
  created_at: string;
}

export type PaymentMethodRow = {
  id: string;
  user_id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  holder_name: string | null;
  provider: string;
  provider_token: string | null;
  is_default: boolean;
  created_at: string;
}

export type MissionRow = {
  id: string;
  client_id: string;
  pro_id: string | null;
  service_id: string;
  sub_service_id: string | null;
  status: MissionStatus;
  street: string;
  zip: string;
  city: string;
  start_date: string;
  time_start: string;
  time_end: string;
  recurrence: RecurrenceKind;
  description: string | null;
  client_rate_chf: number | null;
  pro_rate_chf: number | null;
  base_hours: number | null;
  base_amount_chf: number | null;
  total_ttc_chf: number | null;
  total_vat_chf: number | null;
  pro_amount_chf: number | null;
  accepted_at: string | null;
  validated_at: string | null;
  start_requested_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  client_confirmed_at: string | null;
  cancelled_at: string | null;
  cancelled_by: string | null;
  cancel_reason: string | null;
  created_at: string;
  updated_at: string;
}

export type MissionDeclineRow = {
  mission_id: string;
  pro_id: string;
  created_at: string;
}

export type MissionRescheduleRow = {
  id: string;
  mission_id: string;
  proposed_by: string;
  start_date: string;
  time_start: string;
  time_end: string;
  status: RescheduleStatus;
  created_at: string;
  resolved_at: string | null;
}

export type MissionExpenseRow = {
  id: string;
  mission_id: string;
  kind: ExpenseKind;
  label: string;
  amount_chf: number;
  vat_code: number;
  minutes: number | null;
  receipt_path: string | null;
  created_by: string;
  created_at: string;
}

export type PaymentRow = {
  id: string;
  mission_id: string;
  payer_id: string;
  payment_method_id: string | null;
  amount_chf: number;
  currency: string;
  status: PaymentStatus;
  provider: string;
  provider_ref: string | null;
  created_at: string;
}

export type MessageRow = {
  id: string;
  mission_id: string;
  sender_id: string;
  body: string | null;
  image_path: string | null;
  created_at: string;
  read_at: string | null;
}

export type ReviewRow = {
  id: string;
  mission_id: string;
  author_id: string;
  target_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export type NotificationRow = {
  id: string;
  user_id: string;
  kind: NotificationKind;
  title: string;
  body: string | null;
  data: Json;
  read_at: string | null;
  created_at: string;
}

export type SupportRequestRow = {
  id: string;
  user_id: string;
  message: string;
  status: SupportStatus;
  admin_note: string | null;
  handled_by: string | null;
  handled_at: string | null;
  created_at: string;
}

export type ConversationRow = {
  mission_id: string;
  client_id: string;
  pro_id: string;
  service_id: string;
  status: MissionStatus;
  start_date: string;
  updated_at: string;
  last_body: string | null;
  last_image_path: string | null;
  last_at: string | null;
  unread: number;
}

type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type Rel = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

const _rels = {
  profilesToUsers: [] as Rel[],
};
void _rels;

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Optional<ProfileRow, 'role' | 'email' | 'first_name' | 'last_name' | 'birth_date' | 'street' | 'zip' | 'city' | 'country' | 'phone' | 'avatar_url' | 'company_type' | 'rating_avg' | 'rating_count' | 'cgu_accepted_at' | 'onboarding_completed' | 'settings' | 'push_token' | 'is_admin' | 'is_blocked' | 'blocked_reason' | 'verification_status' | 'verification_note' | 'verified_at' | 'search' | 'created_at' | 'updated_at'>;
        Update: Partial<ProfileRow>;
        Relationships: [];
      };
      services: {
        Row: ServiceRow;
        Insert: Optional<ServiceRow, 'id' | 'sort_order' | 'client_rate_chf' | 'pro_rate_chf' | 'required_tools' | 'tools_note' | 'is_active'>;
        Update: Partial<ServiceRow>;
        Relationships: [];
      };
      sub_services: {
        Row: SubServiceRow;
        Insert: Optional<SubServiceRow, 'id' | 'sort_order'>;
        Update: Partial<SubServiceRow>;
        Relationships: [
          { foreignKeyName: 'sub_services_service_id_fkey'; columns: ['service_id']; isOneToOne: false; referencedRelation: 'services'; referencedColumns: ['id'] },
        ];
      };
      vat_rates: {
        Row: VatRateRow;
        Insert: VatRateRow;
        Update: Partial<VatRateRow>;
        Relationships: [];
      };
      legal_pages: {
        Row: LegalPageRow;
        Insert: Optional<LegalPageRow, 'updated_at'>;
        Update: Partial<LegalPageRow>;
        Relationships: [];
      };
      pro_services: {
        Row: ProServiceRow;
        Insert: Optional<ProServiceRow, 'created_at'>;
        Update: Partial<ProServiceRow>;
        Relationships: [
          { foreignKeyName: 'pro_services_pro_id_fkey'; columns: ['pro_id']; isOneToOne: false; referencedRelation: 'profiles'; referencedColumns: ['id'] },
          { foreignKeyName: 'pro_services_service_id_fkey'; columns: ['service_id']; isOneToOne: false; referencedRelation: 'services'; referencedColumns: ['id'] },
        ];
      };
      pro_documents: {
        Row: ProDocumentRow;
        Insert: Optional<ProDocumentRow, 'id' | 'side' | 'label' | 'mime_type' | 'created_at'>;
        Update: Partial<ProDocumentRow>;
        Relationships: [
          { foreignKeyName: 'pro_documents_pro_id_fkey'; columns: ['pro_id']; isOneToOne: false; referencedRelation: 'profiles'; referencedColumns: ['id'] },
        ];
      };
      payment_methods: {
        Row: PaymentMethodRow;
        Insert: Optional<PaymentMethodRow, 'id' | 'holder_name' | 'provider' | 'provider_token' | 'is_default' | 'created_at'>;
        Update: Partial<PaymentMethodRow>;
        Relationships: [
          { foreignKeyName: 'payment_methods_user_id_fkey'; columns: ['user_id']; isOneToOne: false; referencedRelation: 'profiles'; referencedColumns: ['id'] },
        ];
      };
      missions: {
        Row: MissionRow;
        Insert: Optional<MissionRow, 'id' | 'pro_id' | 'sub_service_id' | 'status' | 'recurrence' | 'description' | 'client_rate_chf' | 'pro_rate_chf' | 'base_hours' | 'base_amount_chf' | 'total_ttc_chf' | 'total_vat_chf' | 'pro_amount_chf' | 'accepted_at' | 'validated_at' | 'start_requested_at' | 'started_at' | 'completed_at' | 'client_confirmed_at' | 'cancelled_at' | 'cancelled_by' | 'cancel_reason' | 'created_at' | 'updated_at'>;
        Update: Partial<MissionRow>;
        Relationships: [
          { foreignKeyName: 'missions_client_id_fkey'; columns: ['client_id']; isOneToOne: false; referencedRelation: 'profiles'; referencedColumns: ['id'] },
          { foreignKeyName: 'missions_pro_id_fkey'; columns: ['pro_id']; isOneToOne: false; referencedRelation: 'profiles'; referencedColumns: ['id'] },
          { foreignKeyName: 'missions_service_id_fkey'; columns: ['service_id']; isOneToOne: false; referencedRelation: 'services'; referencedColumns: ['id'] },
          { foreignKeyName: 'missions_sub_service_id_fkey'; columns: ['sub_service_id']; isOneToOne: false; referencedRelation: 'sub_services'; referencedColumns: ['id'] },
          { foreignKeyName: 'missions_cancelled_by_fkey'; columns: ['cancelled_by']; isOneToOne: false; referencedRelation: 'profiles'; referencedColumns: ['id'] },
        ];
      };
      mission_declines: {
        Row: MissionDeclineRow;
        Insert: Optional<MissionDeclineRow, 'created_at'>;
        Update: Partial<MissionDeclineRow>;
        Relationships: [
          { foreignKeyName: 'mission_declines_mission_id_fkey'; columns: ['mission_id']; isOneToOne: false; referencedRelation: 'missions'; referencedColumns: ['id'] },
          { foreignKeyName: 'mission_declines_pro_id_fkey'; columns: ['pro_id']; isOneToOne: false; referencedRelation: 'profiles'; referencedColumns: ['id'] },
        ];
      };
      mission_reschedules: {
        Row: MissionRescheduleRow;
        Insert: Optional<MissionRescheduleRow, 'id' | 'status' | 'created_at' | 'resolved_at'>;
        Update: Partial<MissionRescheduleRow>;
        Relationships: [
          { foreignKeyName: 'mission_reschedules_mission_id_fkey'; columns: ['mission_id']; isOneToOne: false; referencedRelation: 'missions'; referencedColumns: ['id'] },
          { foreignKeyName: 'mission_reschedules_proposed_by_fkey'; columns: ['proposed_by']; isOneToOne: false; referencedRelation: 'profiles'; referencedColumns: ['id'] },
        ];
      };
      mission_expenses: {
        Row: MissionExpenseRow;
        Insert: Optional<MissionExpenseRow, 'id' | 'kind' | 'minutes' | 'receipt_path' | 'created_at'>;
        Update: Partial<MissionExpenseRow>;
        Relationships: [
          { foreignKeyName: 'mission_expenses_mission_id_fkey'; columns: ['mission_id']; isOneToOne: false; referencedRelation: 'missions'; referencedColumns: ['id'] },
          { foreignKeyName: 'mission_expenses_vat_code_fkey'; columns: ['vat_code']; isOneToOne: false; referencedRelation: 'vat_rates'; referencedColumns: ['code'] },
          { foreignKeyName: 'mission_expenses_created_by_fkey'; columns: ['created_by']; isOneToOne: false; referencedRelation: 'profiles'; referencedColumns: ['id'] },
        ];
      };
      payments: {
        Row: PaymentRow;
        Insert: Optional<PaymentRow, 'id' | 'payment_method_id' | 'currency' | 'status' | 'provider' | 'provider_ref' | 'created_at'>;
        Update: Partial<PaymentRow>;
        Relationships: [
          { foreignKeyName: 'payments_mission_id_fkey'; columns: ['mission_id']; isOneToOne: false; referencedRelation: 'missions'; referencedColumns: ['id'] },
          { foreignKeyName: 'payments_payer_id_fkey'; columns: ['payer_id']; isOneToOne: false; referencedRelation: 'profiles'; referencedColumns: ['id'] },
          { foreignKeyName: 'payments_payment_method_id_fkey'; columns: ['payment_method_id']; isOneToOne: false; referencedRelation: 'payment_methods'; referencedColumns: ['id'] },
        ];
      };
      messages: {
        Row: MessageRow;
        Insert: Optional<MessageRow, 'id' | 'body' | 'image_path' | 'created_at' | 'read_at'>;
        Update: Partial<MessageRow>;
        Relationships: [
          { foreignKeyName: 'messages_mission_id_fkey'; columns: ['mission_id']; isOneToOne: false; referencedRelation: 'missions'; referencedColumns: ['id'] },
          { foreignKeyName: 'messages_sender_id_fkey'; columns: ['sender_id']; isOneToOne: false; referencedRelation: 'profiles'; referencedColumns: ['id'] },
        ];
      };
      reviews: {
        Row: ReviewRow;
        Insert: Optional<ReviewRow, 'id' | 'comment' | 'created_at'>;
        Update: Partial<ReviewRow>;
        Relationships: [
          { foreignKeyName: 'reviews_mission_id_fkey'; columns: ['mission_id']; isOneToOne: false; referencedRelation: 'missions'; referencedColumns: ['id'] },
          { foreignKeyName: 'reviews_author_id_fkey'; columns: ['author_id']; isOneToOne: false; referencedRelation: 'profiles'; referencedColumns: ['id'] },
          { foreignKeyName: 'reviews_target_id_fkey'; columns: ['target_id']; isOneToOne: false; referencedRelation: 'profiles'; referencedColumns: ['id'] },
        ];
      };
      notifications: {
        Row: NotificationRow;
        Insert: Optional<NotificationRow, 'id' | 'kind' | 'body' | 'data' | 'read_at' | 'created_at'>;
        Update: Partial<NotificationRow>;
        Relationships: [
          { foreignKeyName: 'notifications_user_id_fkey'; columns: ['user_id']; isOneToOne: false; referencedRelation: 'profiles'; referencedColumns: ['id'] },
        ];
      };
      support_requests: {
        Row: SupportRequestRow;
        Insert: Optional<SupportRequestRow, 'id' | 'status' | 'admin_note' | 'handled_by' | 'handled_at' | 'created_at'>;
        Update: Partial<SupportRequestRow>;
        Relationships: [
          { foreignKeyName: 'support_requests_user_id_fkey'; columns: ['user_id']; isOneToOne: false; referencedRelation: 'profiles'; referencedColumns: ['id'] },
        ];
      };
    };
    Views: {
      conversations: {
        Row: ConversationRow;
        Relationships: [
          { foreignKeyName: 'missions_client_id_fkey'; columns: ['client_id']; isOneToOne: false; referencedRelation: 'profiles'; referencedColumns: ['id'] },
          { foreignKeyName: 'missions_pro_id_fkey'; columns: ['pro_id']; isOneToOne: false; referencedRelation: 'profiles'; referencedColumns: ['id'] },
          { foreignKeyName: 'missions_service_id_fkey'; columns: ['service_id']; isOneToOne: false; referencedRelation: 'services'; referencedColumns: ['id'] },
        ];
      };
    };
    Functions: {
      accept_mission: {
        Args: { p_mission_id: string; p_new_date?: string | null; p_new_start?: string | null; p_new_end?: string | null };
        Returns: MissionRow;
      };
      decline_mission: { Args: { p_mission_id: string }; Returns: undefined };
      post_mission: { Args: { p_mission_id: string }; Returns: MissionRow };
      relaunch_search: { Args: { p_mission_id: string }; Returns: MissionRow };
      validate_mission: { Args: { p_mission_id: string; p_payment_method_id?: string | null }; Returns: MissionRow };
      request_start: { Args: { p_mission_id: string }; Returns: MissionRow };
      confirm_start: { Args: { p_mission_id: string }; Returns: MissionRow };
      complete_mission: { Args: { p_mission_id: string }; Returns: MissionRow };
      confirm_completion: { Args: { p_mission_id: string }; Returns: MissionRow };
      cancel_mission: { Args: { p_mission_id: string; p_reason?: string | null }; Returns: MissionRow };
      propose_reschedule: { Args: { p_mission_id: string; p_date: string; p_start: string; p_end: string }; Returns: MissionRescheduleRow };
      respond_reschedule: { Args: { p_reschedule_id: string; p_accept: boolean }; Returns: MissionRow };
      mark_messages_read: { Args: { p_mission_id: string }; Returns: undefined };
      unread_counts: { Args: Record<string, never>; Returns: Json };
      pro_dashboard_stats: { Args: Record<string, never>; Returns: Json };
      count_available_pros: { Args: { p_service_id: string }; Returns: number };
      is_mission_participant: { Args: { p_mission_id: string }; Returns: boolean };
      my_role: { Args: Record<string, never>; Returns: UserRole };
      display_name: { Args: { p_user_id: string }; Returns: string };
      is_admin: { Args: Record<string, never>; Returns: boolean };
      admin_set_verification: { Args: { p_user_id: string; p_status: VerificationStatus; p_note?: string | null }; Returns: ProfileRow };
      admin_set_blocked: { Args: { p_user_id: string; p_blocked: boolean; p_reason?: string | null }; Returns: ProfileRow };
      admin_set_admin: { Args: { p_user_id: string; p_admin: boolean }; Returns: ProfileRow };
      admin_cancel_mission: { Args: { p_mission_id: string; p_reason?: string | null }; Returns: MissionRow };
      admin_notify: { Args: { p_user_id: string; p_title: string; p_body?: string | null }; Returns: NotificationRow };
      admin_dashboard_stats: { Args: Record<string, never>; Returns: Json };
    };
    Enums: {
      user_role: UserRole;
      mission_status: MissionStatus;
      recurrence_kind: RecurrenceKind;
      document_kind: DocumentKind;
      document_side: DocumentSide;
      company_type: CompanyType;
      expense_kind: ExpenseKind;
      reschedule_status: RescheduleStatus;
      notification_kind: NotificationKind;
      payment_status: PaymentStatus;
      verification_status: VerificationStatus;
      support_status: SupportStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
