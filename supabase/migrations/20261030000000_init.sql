-- ============================================================================
-- HEROES – schéma initial (apps mobiles Heroes [client] et Heroes Pro [prestataire])
-- Appliquer dans l'éditeur SQL du dashboard Supabase ou via `supabase db push`.
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- Types
-- ----------------------------------------------------------------------------
create type public.user_role as enum ('client', 'pro');
create type public.mission_status as enum (
  'searching',          -- demande créée, diffusée aux pros
  'posted',             -- aucun pro trouvé, demande postée pour plus tard
  'pending_validation', -- un pro a accepté, le client doit valider + prépayer
  'confirmed',          -- validée et prépayée → "PRÊT"
  'start_requested',    -- le pro a démarré, le client doit confirmer
  'in_progress',        -- "EN COURS"
  'completed',          -- terminée par le pro, facture figée
  'cancelled'
);
create type public.recurrence_kind as enum ('once', 'weekdays', 'daily', 'weekly');
create type public.document_kind as enum ('experience', 'commerce', 'id_card', 'passport', 'residence_permit');
create type public.document_side as enum ('recto', 'verso');
create type public.company_type as enum ('SA', 'SARL', 'independant');
create type public.expense_kind as enum ('material', 'time', 'other');
create type public.reschedule_status as enum ('pending', 'accepted', 'declined');
create type public.notification_kind as enum ('mission', 'message', 'system');
create type public.payment_status as enum ('pending', 'succeeded', 'failed', 'refunded');

-- ----------------------------------------------------------------------------
-- Utilitaires
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ----------------------------------------------------------------------------
-- Profils (un par utilisateur auth)
-- ----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'client',
  email text,
  first_name text,
  last_name text,
  birth_date date,
  street text,
  zip text,
  city text,
  country text not null default 'Suisse',
  phone text,
  avatar_url text,                                  -- chemin dans le bucket "avatars"
  company_type public.company_type,                  -- pro uniquement
  rating_avg numeric(3, 2) not null default 0,
  rating_count integer not null default 0,
  cgu_accepted_at timestamptz,
  onboarding_completed boolean not null default false,
  settings jsonb not null default '{"notifications": true, "newsletter": false, "touch_id": false, "language": "fr", "country": "CH"}'::jsonb,
  push_token text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index profiles_role_idx on public.profiles (role);
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_role public.user_role := 'client';
begin
  if new.raw_user_meta_data ? 'role' and new.raw_user_meta_data ->> 'role' in ('client', 'pro') then
    v_role := (new.raw_user_meta_data ->> 'role')::public.user_role;
  end if;
  insert into public.profiles (id, role, email, first_name, last_name, street, zip, city)
  values (
    new.id,
    v_role,
    new.email,
    nullif(new.raw_user_meta_data ->> 'first_name', ''),
    nullif(new.raw_user_meta_data ->> 'last_name', ''),
    nullif(new.raw_user_meta_data ->> 'street', ''),
    nullif(new.raw_user_meta_data ->> 'zip', ''),
    nullif(new.raw_user_meta_data ->> 'city', '')
  )
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- Catalogue de services
-- ----------------------------------------------------------------------------
create table public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  sort_order integer not null default 0,
  client_rate_chf numeric(10, 2) not null default 40.00,   -- prix horaire TTC payé par le client
  pro_rate_chf numeric(10, 2) not null default 29.90,      -- gain horaire TTC du pro
  required_tools text[] not null default '{}',
  tools_note text,
  is_active boolean not null default true
);

create table public.sub_services (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services (id) on delete cascade,
  name text not null,
  sort_order integer not null default 0
);
create index sub_services_service_idx on public.sub_services (service_id);

create table public.vat_rates (
  code smallint primary key,
  rate numeric(5, 2) not null,
  label text not null
);

create table public.legal_pages (
  slug text primary key,
  title text not null,
  body text not null,
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Pros : prestations proposées et documents
-- ----------------------------------------------------------------------------
create table public.pro_services (
  pro_id uuid not null references public.profiles (id) on delete cascade,
  service_id uuid not null references public.services (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (pro_id, service_id)
);
create index pro_services_service_idx on public.pro_services (service_id);

create table public.pro_documents (
  id uuid primary key default gen_random_uuid(),
  pro_id uuid not null references public.profiles (id) on delete cascade,
  kind public.document_kind not null,
  side public.document_side,
  label text,
  file_path text not null,                          -- chemin dans le bucket "documents"
  mime_type text,
  created_at timestamptz not null default now()
);
create index pro_documents_pro_idx on public.pro_documents (pro_id);

-- ----------------------------------------------------------------------------
-- Moyens de paiement (jamais de numéro complet ni de CVV : uniquement marque, 4 derniers chiffres, expiration)
-- ----------------------------------------------------------------------------
create table public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  brand text not null,                              -- mastercard | visa | amex | unknown
  last4 text not null check (last4 ~ '^[0-9]{4}$'),
  exp_month smallint not null check (exp_month between 1 and 12),
  exp_year smallint not null,
  holder_name text,
  provider text not null default 'mock',            -- 'stripe' une fois le PSP branché
  provider_token text,                              -- id du payment method côté PSP
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create index payment_methods_user_idx on public.payment_methods (user_id);

-- ----------------------------------------------------------------------------
-- Missions (demandes)
-- ----------------------------------------------------------------------------
create table public.missions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles (id) on delete cascade,
  pro_id uuid references public.profiles (id) on delete set null,
  service_id uuid not null references public.services (id),
  sub_service_id uuid references public.sub_services (id),
  status public.mission_status not null default 'searching',
  street text not null,
  zip text not null,
  city text not null,
  start_date date not null,
  time_start time not null,
  time_end time not null,
  recurrence public.recurrence_kind not null default 'once',
  description text,
  client_rate_chf numeric(10, 2),
  pro_rate_chf numeric(10, 2),
  base_hours numeric(5, 2),
  base_amount_chf numeric(10, 2),
  total_ttc_chf numeric(10, 2),
  total_vat_chf numeric(10, 2),
  pro_amount_chf numeric(10, 2),
  accepted_at timestamptz,
  validated_at timestamptz,
  start_requested_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  client_confirmed_at timestamptz,
  cancelled_at timestamptz,
  cancelled_by uuid references public.profiles (id),
  cancel_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (time_end > time_start)
);
create index missions_client_idx on public.missions (client_id, start_date);
create index missions_pro_idx on public.missions (pro_id, start_date);
create index missions_status_service_idx on public.missions (status, service_id);
alter table public.missions replica identity full;
create trigger missions_updated_at before update on public.missions
  for each row execute function public.set_updated_at();

create or replace function public.missions_before_insert()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  s public.services%rowtype;
begin
  select * into s from public.services where id = new.service_id;
  if not found then
    raise exception 'Service inconnu';
  end if;
  new.client_rate_chf := coalesce(new.client_rate_chf, s.client_rate_chf);
  new.pro_rate_chf := coalesce(new.pro_rate_chf, s.pro_rate_chf);
  new.base_hours := greatest(0.5, round((extract(epoch from (new.time_end - new.time_start)) / 3600.0)::numeric, 2));
  new.base_amount_chf := round(new.base_hours * new.client_rate_chf, 2);
  return new;
end $$;
create trigger missions_before_insert before insert on public.missions
  for each row execute function public.missions_before_insert();

create table public.mission_declines (
  mission_id uuid not null references public.missions (id) on delete cascade,
  pro_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (mission_id, pro_id)
);

create table public.mission_reschedules (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.missions (id) on delete cascade,
  proposed_by uuid not null references public.profiles (id),
  start_date date not null,
  time_start time not null,
  time_end time not null,
  status public.reschedule_status not null default 'pending',
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  check (time_end > time_start)
);
create index mission_reschedules_mission_idx on public.mission_reschedules (mission_id, status);

create table public.mission_expenses (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.missions (id) on delete cascade,
  kind public.expense_kind not null default 'other',
  label text not null,
  amount_chf numeric(10, 2) not null check (amount_chf >= 0),
  vat_code smallint not null references public.vat_rates (code),
  minutes integer,                                  -- pour kind = 'time'
  receipt_path text,                                -- chemin dans le bucket "receipts"
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);
create index mission_expenses_mission_idx on public.mission_expenses (mission_id);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.missions (id) on delete cascade,
  payer_id uuid not null references public.profiles (id),
  payment_method_id uuid references public.payment_methods (id) on delete set null,
  amount_chf numeric(10, 2) not null,
  currency text not null default 'CHF',
  status public.payment_status not null default 'pending',
  provider text not null default 'mock',
  provider_ref text,
  created_at timestamptz not null default now()
);
create index payments_mission_idx on public.payments (mission_id);

-- ----------------------------------------------------------------------------
-- Chat, avis, notifications, support
-- ----------------------------------------------------------------------------
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.missions (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text,
  image_path text,                                  -- chemin dans le bucket "chat"
  created_at timestamptz not null default now(),
  read_at timestamptz,
  check (body is not null or image_path is not null)
);
create index messages_mission_idx on public.messages (mission_id, created_at);
alter table public.messages replica identity full;

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.missions (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  target_id uuid not null references public.profiles (id) on delete cascade,
  rating numeric(2, 1) not null check (rating >= 0 and rating <= 5),
  comment text check (char_length(comment) <= 300),
  created_at timestamptz not null default now(),
  unique (mission_id, author_id)
);
create index reviews_target_idx on public.reviews (target_id, created_at desc);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind public.notification_kind not null default 'system',
  title text not null,
  body text,
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on public.notifications (user_id, read_at, created_at desc);

create table public.support_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Fonctions d'aide (sécurité)
-- ----------------------------------------------------------------------------
create or replace function public.is_mission_participant(p_mission_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.missions m
    where m.id = p_mission_id and (m.client_id = auth.uid() or m.pro_id = auth.uid())
  );
$$;

create or replace function public.my_role()
returns public.user_role language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.display_name(p_user_id uuid)
returns text language sql stable security definer set search_path = public as $$
  select trim(coalesce(first_name, '') || ' ' || coalesce(last_name, '')) from public.profiles where id = p_user_id;
$$;

-- ----------------------------------------------------------------------------
-- Avis → recalcul de la note
-- ----------------------------------------------------------------------------
create or replace function public.refresh_rating()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_target uuid := coalesce(new.target_id, old.target_id);
begin
  update public.profiles p set
    rating_avg = coalesce((select round(avg(r.rating), 2) from public.reviews r where r.target_id = v_target), 0),
    rating_count = (select count(*) from public.reviews r where r.target_id = v_target)
  where p.id = v_target;
  return coalesce(new, old);
end $$;
create trigger reviews_refresh_rating after insert or update or delete on public.reviews
  for each row execute function public.refresh_rating();

-- ----------------------------------------------------------------------------
-- Notifications automatiques
-- ----------------------------------------------------------------------------
create or replace function public.notify_mission_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_service text;
  v_client text;
  v_pro text;
begin
  select upper(name) into v_service from public.services where id = new.service_id;
  v_client := public.display_name(new.client_id);
  if new.pro_id is not null then
    v_pro := public.display_name(new.pro_id);
  end if;

  if tg_op = 'INSERT' then
    if new.status = 'searching' then
      insert into public.notifications (user_id, kind, title, body, data)
      select ps.pro_id, 'mission', 'Vous avez une mission !', v_service || ' à ' || new.city || ' – appuyez pour voir',
             jsonb_build_object('mission_id', new.id, 'status', new.status)
      from public.pro_services ps
      join public.profiles p on p.id = ps.pro_id
      where ps.service_id = new.service_id and p.onboarding_completed;
    end if;
    return new;
  end if;

  if old.status is distinct from new.status then
    if new.status = 'searching' and old.status = 'posted' then
      insert into public.notifications (user_id, kind, title, body, data)
      select ps.pro_id, 'mission', 'Vous avez une mission !', v_service || ' à ' || new.city || ' – appuyez pour voir',
             jsonb_build_object('mission_id', new.id, 'status', new.status)
      from public.pro_services ps
      join public.profiles p on p.id = ps.pro_id
      where ps.service_id = new.service_id and p.onboarding_completed
        and not exists (select 1 from public.mission_declines d where d.mission_id = new.id and d.pro_id = ps.pro_id);
    elsif new.status = 'pending_validation' then
      insert into public.notifications (user_id, kind, title, body, data)
      values (new.client_id, 'mission', v_pro || ' a accepté la mission', 'Validez pour agender votre ' || v_service,
              jsonb_build_object('mission_id', new.id, 'status', new.status));
    elsif new.status = 'confirmed' and new.pro_id is not null then
      insert into public.notifications (user_id, kind, title, body, data)
      values (new.pro_id, 'mission', 'Mission confirmée', v_client || ' a validé la mission ' || v_service,
              jsonb_build_object('mission_id', new.id, 'status', new.status));
    elsif new.status = 'start_requested' then
      insert into public.notifications (user_id, kind, title, body, data)
      values (new.client_id, 'mission', 'La mission a démarré', 'Confirmez le début de mission de ' || v_pro,
              jsonb_build_object('mission_id', new.id, 'status', new.status));
    elsif new.status = 'in_progress' and new.pro_id is not null then
      insert into public.notifications (user_id, kind, title, body, data)
      values (new.pro_id, 'mission', 'Hop, c''est parti !', v_client || ' a confirmé le début de la mission',
              jsonb_build_object('mission_id', new.id, 'status', new.status));
    elsif new.status = 'completed' then
      insert into public.notifications (user_id, kind, title, body, data)
      values (new.client_id, 'mission', 'Mission terminée', 'Consultez le résumé et notez votre héros',
              jsonb_build_object('mission_id', new.id, 'status', new.status));
    elsif new.status = 'cancelled' then
      if new.cancelled_by = new.client_id and new.pro_id is not null then
        insert into public.notifications (user_id, kind, title, body, data)
        values (new.pro_id, 'mission', 'Mission annulée', v_client || ' a annulé la mission ' || v_service,
                jsonb_build_object('mission_id', new.id, 'status', new.status));
      elsif new.cancelled_by is distinct from new.client_id then
        insert into public.notifications (user_id, kind, title, body, data)
        values (new.client_id, 'mission', 'Mission annulée', coalesce(v_pro, 'Le prestataire') || ' a annulé la mission ' || v_service,
                jsonb_build_object('mission_id', new.id, 'status', new.status));
      end if;
    end if;
  end if;
  return new;
end $$;
create trigger missions_notify after insert or update on public.missions
  for each row execute function public.notify_mission_change();

create or replace function public.notify_new_message()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  m public.missions%rowtype;
  v_recipient uuid;
begin
  select * into m from public.missions where id = new.mission_id;
  v_recipient := case when new.sender_id = m.client_id then m.pro_id else m.client_id end;
  if v_recipient is not null then
    insert into public.notifications (user_id, kind, title, body, data)
    values (v_recipient, 'message', public.display_name(new.sender_id),
            coalesce(left(new.body, 120), 'Photo'),
            jsonb_build_object('mission_id', new.mission_id, 'message_id', new.id));
  end if;
  return new;
end $$;
create trigger messages_notify after insert on public.messages
  for each row execute function public.notify_new_message();

create or replace function public.notify_reschedule()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  m public.missions%rowtype;
  v_recipient uuid;
begin
  select * into m from public.missions where id = new.mission_id;
  if tg_op = 'INSERT' then
    v_recipient := case when new.proposed_by = m.client_id then m.pro_id else m.client_id end;
    if v_recipient is not null then
      insert into public.notifications (user_id, kind, title, body, data)
      values (v_recipient, 'mission', 'Changement d''horaire proposé',
              public.display_name(new.proposed_by) || ' propose le ' || to_char(new.start_date, 'DD.MM.YYYY') || ' de ' ||
              to_char(new.time_start, 'HH24:MI') || ' à ' || to_char(new.time_end, 'HH24:MI'),
              jsonb_build_object('mission_id', new.mission_id, 'reschedule_id', new.id));
    end if;
  elsif new.status <> old.status then
    insert into public.notifications (user_id, kind, title, body, data)
    values (new.proposed_by, 'mission',
            case when new.status = 'accepted' then 'Nouvel horaire accepté' else 'Nouvel horaire refusé' end,
            null, jsonb_build_object('mission_id', new.mission_id, 'reschedule_id', new.id));
  end if;
  return new;
end $$;
create trigger reschedules_notify after insert or update on public.mission_reschedules
  for each row execute function public.notify_reschedule();

-- ----------------------------------------------------------------------------
-- RPC : cycle de vie d'une mission (toutes les transitions passent par ici)
-- ----------------------------------------------------------------------------
create or replace function public.count_available_pros(p_service_id uuid)
returns integer language sql stable security definer set search_path = public as $$
  select count(distinct ps.pro_id)::integer
  from public.pro_services ps
  join public.profiles p on p.id = ps.pro_id
  where ps.service_id = p_service_id and p.onboarding_completed and p.role = 'pro';
$$;

create or replace function public.accept_mission(
  p_mission_id uuid,
  p_new_date date default null,
  p_new_start time default null,
  p_new_end time default null
)
returns public.missions language plpgsql security definer set search_path = public as $$
declare
  m public.missions%rowtype;
begin
  if public.my_role() <> 'pro' then
    raise exception 'Réservé aux prestataires';
  end if;
  select * into m from public.missions where id = p_mission_id for update;
  if not found then raise exception 'Mission introuvable'; end if;
  if m.status not in ('searching', 'posted') or m.pro_id is not null then
    raise exception 'Cette mission n''est plus disponible';
  end if;
  if not exists (select 1 from public.pro_services where pro_id = auth.uid() and service_id = m.service_id) then
    raise exception 'Vous ne proposez pas ce service';
  end if;

  update public.missions
  set pro_id = auth.uid(), status = 'pending_validation', accepted_at = now()
  where id = p_mission_id
  returning * into m;

  if p_new_date is not null and p_new_start is not null and p_new_end is not null then
    insert into public.mission_reschedules (mission_id, proposed_by, start_date, time_start, time_end)
    values (p_mission_id, auth.uid(), p_new_date, p_new_start, p_new_end);
  end if;
  return m;
end $$;

create or replace function public.decline_mission(p_mission_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if public.my_role() <> 'pro' then
    raise exception 'Réservé aux prestataires';
  end if;
  insert into public.mission_declines (mission_id, pro_id) values (p_mission_id, auth.uid())
  on conflict do nothing;
end $$;

create or replace function public.post_mission(p_mission_id uuid)
returns public.missions language plpgsql security definer set search_path = public as $$
declare
  m public.missions%rowtype;
begin
  update public.missions set status = 'posted'
  where id = p_mission_id and client_id = auth.uid() and status = 'searching'
  returning * into m;
  if not found then raise exception 'Transition impossible'; end if;
  return m;
end $$;

create or replace function public.relaunch_search(p_mission_id uuid)
returns public.missions language plpgsql security definer set search_path = public as $$
declare
  m public.missions%rowtype;
begin
  update public.missions set status = 'searching'
  where id = p_mission_id and client_id = auth.uid() and status = 'posted'
  returning * into m;
  if not found then raise exception 'Transition impossible'; end if;
  return m;
end $$;

-- Le client valide le pro qui a accepté et prépaye (paiement simulé tant qu'aucun PSP n'est branché).
create or replace function public.validate_mission(p_mission_id uuid, p_payment_method_id uuid default null)
returns public.missions language plpgsql security definer set search_path = public as $$
declare
  m public.missions%rowtype;
  r public.mission_reschedules%rowtype;
begin
  select * into m from public.missions where id = p_mission_id for update;
  if not found or m.client_id <> auth.uid() then raise exception 'Mission introuvable'; end if;
  if m.status <> 'pending_validation' then raise exception 'Transition impossible'; end if;
  if p_payment_method_id is not null and not exists (
    select 1 from public.payment_methods where id = p_payment_method_id and user_id = auth.uid()
  ) then
    raise exception 'Moyen de paiement invalide';
  end if;

  -- applique une éventuelle proposition d'horaire du pro
  select * into r from public.mission_reschedules
  where mission_id = p_mission_id and status = 'pending' and proposed_by = m.pro_id
  order by created_at desc limit 1;
  if found then
    update public.mission_reschedules set status = 'accepted', resolved_at = now() where id = r.id;
    update public.missions set start_date = r.start_date, time_start = r.time_start, time_end = r.time_end
    where id = p_mission_id;
  end if;

  insert into public.payments (mission_id, payer_id, payment_method_id, amount_chf, status, provider, provider_ref)
  values (p_mission_id, auth.uid(), p_payment_method_id, m.base_amount_chf, 'succeeded', 'mock', 'mock_' || gen_random_uuid()::text);

  update public.missions set status = 'confirmed', validated_at = now()
  where id = p_mission_id
  returning * into m;
  return m;
end $$;

create or replace function public.request_start(p_mission_id uuid)
returns public.missions language plpgsql security definer set search_path = public as $$
declare
  m public.missions%rowtype;
begin
  update public.missions set status = 'start_requested', start_requested_at = now()
  where id = p_mission_id and pro_id = auth.uid() and status = 'confirmed'
  returning * into m;
  if not found then raise exception 'Transition impossible'; end if;
  return m;
end $$;

create or replace function public.confirm_start(p_mission_id uuid)
returns public.missions language plpgsql security definer set search_path = public as $$
declare
  m public.missions%rowtype;
begin
  update public.missions set status = 'in_progress', started_at = now()
  where id = p_mission_id and client_id = auth.uid() and status = 'start_requested'
  returning * into m;
  if not found then raise exception 'Transition impossible'; end if;
  return m;
end $$;

-- Le pro termine : la facture est figée (montants TTC, TVA incluse).
create or replace function public.complete_mission(p_mission_id uuid)
returns public.missions language plpgsql security definer set search_path = public as $$
declare
  m public.missions%rowtype;
  v_base numeric(10, 2);
  v_exp numeric(10, 2);
  v_vat numeric(10, 2);
  v_rate1 numeric(5, 2);
begin
  select * into m from public.missions where id = p_mission_id for update;
  if not found or m.pro_id <> auth.uid() then raise exception 'Mission introuvable'; end if;
  if m.status <> 'in_progress' then raise exception 'Transition impossible'; end if;

  select rate into v_rate1 from public.vat_rates where code = 1;
  v_base := round(m.base_hours * m.client_rate_chf, 2);
  select coalesce(sum(amount_chf), 0) into v_exp from public.mission_expenses where mission_id = p_mission_id;
  select coalesce(sum(round(e.amount_chf - e.amount_chf / (1 + v.rate / 100), 2)), 0) into v_vat
  from public.mission_expenses e join public.vat_rates v on v.code = e.vat_code
  where e.mission_id = p_mission_id;
  v_vat := v_vat + round(v_base - v_base / (1 + coalesce(v_rate1, 0) / 100), 2);

  update public.missions set
    status = 'completed',
    completed_at = now(),
    total_ttc_chf = v_base + v_exp,
    total_vat_chf = v_vat,
    pro_amount_chf = round(m.base_hours * m.pro_rate_chf, 2) + v_exp
  where id = p_mission_id
  returning * into m;
  return m;
end $$;

create or replace function public.confirm_completion(p_mission_id uuid)
returns public.missions language plpgsql security definer set search_path = public as $$
declare
  m public.missions%rowtype;
begin
  update public.missions set client_confirmed_at = now()
  where id = p_mission_id and client_id = auth.uid() and status = 'completed'
  returning * into m;
  if not found then raise exception 'Transition impossible'; end if;
  return m;
end $$;

create or replace function public.cancel_mission(p_mission_id uuid, p_reason text default null)
returns public.missions language plpgsql security definer set search_path = public as $$
declare
  m public.missions%rowtype;
begin
  select * into m from public.missions where id = p_mission_id for update;
  if not found or (m.client_id <> auth.uid() and m.pro_id is distinct from auth.uid()) then
    raise exception 'Mission introuvable';
  end if;
  if m.status in ('completed', 'cancelled') then raise exception 'Transition impossible'; end if;

  -- un pro qui se désiste avant le démarrage libère la mission plutôt que de l'annuler
  if m.pro_id = auth.uid() and m.status in ('pending_validation', 'confirmed') then
    insert into public.mission_declines (mission_id, pro_id) values (p_mission_id, auth.uid()) on conflict do nothing;
    update public.missions set pro_id = null, status = 'searching', accepted_at = null, validated_at = null
    where id = p_mission_id returning * into m;
    insert into public.notifications (user_id, kind, title, body, data)
    values (m.client_id, 'mission', 'Le prestataire s''est désisté', 'Nous recherchons un autre héros pour vous',
            jsonb_build_object('mission_id', m.id, 'status', m.status));
    return m;
  end if;

  update public.missions set status = 'cancelled', cancelled_at = now(), cancelled_by = auth.uid(), cancel_reason = p_reason
  where id = p_mission_id
  returning * into m;
  return m;
end $$;

create or replace function public.propose_reschedule(p_mission_id uuid, p_date date, p_start time, p_end time)
returns public.mission_reschedules language plpgsql security definer set search_path = public as $$
declare
  r public.mission_reschedules%rowtype;
begin
  if not public.is_mission_participant(p_mission_id) then raise exception 'Mission introuvable'; end if;
  if not exists (select 1 from public.missions where id = p_mission_id and status in ('pending_validation', 'confirmed')) then
    raise exception 'Changement impossible à ce stade';
  end if;
  update public.mission_reschedules set status = 'declined', resolved_at = now()
  where mission_id = p_mission_id and status = 'pending' and proposed_by = auth.uid();
  insert into public.mission_reschedules (mission_id, proposed_by, start_date, time_start, time_end)
  values (p_mission_id, auth.uid(), p_date, p_start, p_end)
  returning * into r;
  return r;
end $$;

create or replace function public.respond_reschedule(p_reschedule_id uuid, p_accept boolean)
returns public.missions language plpgsql security definer set search_path = public as $$
declare
  r public.mission_reschedules%rowtype;
  m public.missions%rowtype;
begin
  select * into r from public.mission_reschedules where id = p_reschedule_id for update;
  if not found or r.status <> 'pending' then raise exception 'Proposition introuvable'; end if;
  if r.proposed_by = auth.uid() or not public.is_mission_participant(r.mission_id) then
    raise exception 'Action non autorisée';
  end if;
  update public.mission_reschedules
  set status = case when p_accept then 'accepted' else 'declined' end::public.reschedule_status, resolved_at = now()
  where id = p_reschedule_id;
  if p_accept then
    update public.missions set start_date = r.start_date, time_start = r.time_start, time_end = r.time_end
    where id = r.mission_id;
  end if;
  select * into m from public.missions where id = r.mission_id;
  return m;
end $$;

create or replace function public.mark_messages_read(p_mission_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_mission_participant(p_mission_id) then raise exception 'Mission introuvable'; end if;
  update public.messages set read_at = now()
  where mission_id = p_mission_id and sender_id <> auth.uid() and read_at is null;
  update public.notifications set read_at = now()
  where user_id = auth.uid() and kind = 'message' and read_at is null and (data ->> 'mission_id')::uuid = p_mission_id;
end $$;

create or replace function public.unread_counts()
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'messages', (
      select count(*) from public.messages msg
      join public.missions m on m.id = msg.mission_id
      where msg.read_at is null and msg.sender_id <> auth.uid()
        and (m.client_id = auth.uid() or m.pro_id = auth.uid())
    ),
    'notifications', (
      select count(*) from public.notifications n where n.user_id = auth.uid() and n.read_at is null and n.kind <> 'message'
    )
  );
$$;

create or replace function public.pro_dashboard_stats()
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'month_revenue', coalesce((
      select sum(pro_amount_chf) from public.missions
      where pro_id = auth.uid() and status = 'completed'
        and date_trunc('month', completed_at) = date_trunc('month', now())), 0),
    'today_revenue', coalesce((
      select sum(pro_amount_chf) from public.missions
      where pro_id = auth.uid() and status = 'completed' and completed_at::date = current_date), 0),
    'jobs_done_month', (
      select count(*) from public.missions
      where pro_id = auth.uid() and status = 'completed'
        and date_trunc('month', completed_at) = date_trunc('month', now())),
    'jobs_upcoming', (
      select count(*) from public.missions
      where pro_id = auth.uid() and status in ('pending_validation', 'confirmed', 'start_requested', 'in_progress')),
    'hours_month', coalesce((
      select sum(base_hours) from public.missions
      where pro_id = auth.uid() and status = 'completed'
        and date_trunc('month', completed_at) = date_trunc('month', now())), 0)
  );
$$;

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.sub_services enable row level security;
alter table public.vat_rates enable row level security;
alter table public.legal_pages enable row level security;
alter table public.pro_services enable row level security;
alter table public.pro_documents enable row level security;
alter table public.payment_methods enable row level security;
alter table public.missions enable row level security;
alter table public.mission_declines enable row level security;
alter table public.mission_reschedules enable row level security;
alter table public.mission_expenses enable row level security;
alter table public.payments enable row level security;
alter table public.messages enable row level security;
alter table public.reviews enable row level security;
alter table public.notifications enable row level security;
alter table public.support_requests enable row level security;

-- profils : lisibles par tout utilisateur connecté, modifiables par soi-même
create policy profiles_select on public.profiles for select to authenticated using (true);
create policy profiles_update on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- catalogue : lecture publique
create policy services_select on public.services for select using (true);
create policy sub_services_select on public.sub_services for select using (true);
create policy vat_rates_select on public.vat_rates for select using (true);
create policy legal_pages_select on public.legal_pages for select using (true);

-- prestations d'un pro
create policy pro_services_select on public.pro_services for select to authenticated using (true);
create policy pro_services_insert on public.pro_services for insert to authenticated with check (pro_id = auth.uid());
create policy pro_services_delete on public.pro_services for delete to authenticated using (pro_id = auth.uid());

-- documents : strictement privés
create policy pro_documents_all on public.pro_documents for all to authenticated using (pro_id = auth.uid()) with check (pro_id = auth.uid());

-- moyens de paiement : privés
create policy payment_methods_all on public.payment_methods for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- missions
create policy missions_select on public.missions for select to authenticated using (
  client_id = auth.uid()
  or pro_id = auth.uid()
  or (
    status in ('searching', 'posted') and pro_id is null
    and exists (select 1 from public.pro_services ps where ps.pro_id = auth.uid() and ps.service_id = missions.service_id)
    and not exists (select 1 from public.mission_declines d where d.mission_id = missions.id and d.pro_id = auth.uid())
  )
);
create policy missions_insert on public.missions for insert to authenticated with check (
  client_id = auth.uid() and status = 'searching' and public.my_role() = 'client'
);
create policy missions_update_client on public.missions for update to authenticated
  using (client_id = auth.uid() and status in ('searching', 'posted'))
  with check (client_id = auth.uid() and status in ('searching', 'posted'));

create policy mission_declines_select on public.mission_declines for select to authenticated using (pro_id = auth.uid());
create policy mission_declines_insert on public.mission_declines for insert to authenticated with check (pro_id = auth.uid());

create policy mission_reschedules_select on public.mission_reschedules for select to authenticated
  using (public.is_mission_participant(mission_id) or proposed_by = auth.uid());

create policy mission_expenses_select on public.mission_expenses for select to authenticated
  using (public.is_mission_participant(mission_id));
create policy mission_expenses_write on public.mission_expenses for all to authenticated
  using (exists (select 1 from public.missions m where m.id = mission_id and m.pro_id = auth.uid() and m.status in ('confirmed', 'start_requested', 'in_progress')))
  with check (created_by = auth.uid() and exists (select 1 from public.missions m where m.id = mission_id and m.pro_id = auth.uid() and m.status in ('confirmed', 'start_requested', 'in_progress')));

create policy payments_select on public.payments for select to authenticated using (public.is_mission_participant(mission_id));

create policy messages_select on public.messages for select to authenticated using (public.is_mission_participant(mission_id));
create policy messages_insert on public.messages for insert to authenticated
  with check (sender_id = auth.uid() and public.is_mission_participant(mission_id));
create policy messages_update on public.messages for update to authenticated
  using (public.is_mission_participant(mission_id) and sender_id <> auth.uid());

create policy reviews_select on public.reviews for select to authenticated using (true);
create policy reviews_insert on public.reviews for insert to authenticated with check (
  author_id = auth.uid() and exists (
    select 1 from public.missions m
    where m.id = mission_id and m.status = 'completed'
      and ((m.client_id = auth.uid() and target_id = m.pro_id) or (m.pro_id = auth.uid() and target_id = m.client_id))
  )
);

create policy notifications_select on public.notifications for select to authenticated using (user_id = auth.uid());
create policy notifications_update on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy notifications_delete on public.notifications for delete to authenticated using (user_id = auth.uid());

create policy support_requests_insert on public.support_requests for insert to authenticated with check (user_id = auth.uid());
create policy support_requests_select on public.support_requests for select to authenticated using (user_id = auth.uid());

-- Les RPC ne sont exécutables que par des utilisateurs connectés
revoke execute on function public.accept_mission(uuid, date, time, time) from public, anon;
revoke execute on function public.decline_mission(uuid) from public, anon;
revoke execute on function public.post_mission(uuid) from public, anon;
revoke execute on function public.relaunch_search(uuid) from public, anon;
revoke execute on function public.validate_mission(uuid, uuid) from public, anon;
revoke execute on function public.request_start(uuid) from public, anon;
revoke execute on function public.confirm_start(uuid) from public, anon;
revoke execute on function public.complete_mission(uuid) from public, anon;
revoke execute on function public.confirm_completion(uuid) from public, anon;
revoke execute on function public.cancel_mission(uuid, text) from public, anon;
revoke execute on function public.propose_reschedule(uuid, date, time, time) from public, anon;
revoke execute on function public.respond_reschedule(uuid, boolean) from public, anon;
revoke execute on function public.mark_messages_read(uuid) from public, anon;
revoke execute on function public.unread_counts() from public, anon;
revoke execute on function public.pro_dashboard_stats() from public, anon;
grant execute on function public.accept_mission(uuid, date, time, time) to authenticated;
grant execute on function public.decline_mission(uuid) to authenticated;
grant execute on function public.post_mission(uuid) to authenticated;
grant execute on function public.relaunch_search(uuid) to authenticated;
grant execute on function public.validate_mission(uuid, uuid) to authenticated;
grant execute on function public.request_start(uuid) to authenticated;
grant execute on function public.confirm_start(uuid) to authenticated;
grant execute on function public.complete_mission(uuid) to authenticated;
grant execute on function public.confirm_completion(uuid) to authenticated;
grant execute on function public.cancel_mission(uuid, text) to authenticated;
grant execute on function public.propose_reschedule(uuid, date, time, time) to authenticated;
grant execute on function public.respond_reschedule(uuid, boolean) to authenticated;
grant execute on function public.mark_messages_read(uuid) to authenticated;
grant execute on function public.unread_counts() to authenticated;
grant execute on function public.pro_dashboard_stats() to authenticated;
grant execute on function public.count_available_pros(uuid) to anon, authenticated;

-- ----------------------------------------------------------------------------
-- Realtime
-- ----------------------------------------------------------------------------
alter publication supabase_realtime add table public.missions;
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.mission_expenses;
alter publication supabase_realtime add table public.mission_reschedules;

-- ----------------------------------------------------------------------------
-- Storage : buckets et policies
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('documents', 'documents', false, 20971520, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  ('receipts', 'receipts', false, 20971520, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  ('chat', 'chat', false, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- avatars : lecture publique, écriture dans son propre dossier {uid}/...
create policy "avatars_public_read" on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars_insert_own" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars_update_own" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars_delete_own" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- documents : privés, dossier {uid}/...
create policy "documents_own" on storage.objects for all to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

-- reçus : dossier {mission_id}/..., lecture par les participants, écriture par le pro de la mission
create policy "receipts_read_participants" on storage.objects for select to authenticated
  using (bucket_id = 'receipts' and public.is_mission_participant(((storage.foldername(name))[1])::uuid));
create policy "receipts_write_pro" on storage.objects for insert to authenticated
  with check (bucket_id = 'receipts' and exists (
    select 1 from public.missions m where m.id = ((storage.foldername(name))[1])::uuid and m.pro_id = auth.uid()));
create policy "receipts_delete_pro" on storage.objects for delete to authenticated
  using (bucket_id = 'receipts' and exists (
    select 1 from public.missions m where m.id = ((storage.foldername(name))[1])::uuid and m.pro_id = auth.uid()));

-- chat : dossier {mission_id}/..., participants uniquement
create policy "chat_participants_read" on storage.objects for select to authenticated
  using (bucket_id = 'chat' and public.is_mission_participant(((storage.foldername(name))[1])::uuid));
create policy "chat_participants_write" on storage.objects for insert to authenticated
  with check (bucket_id = 'chat' and public.is_mission_participant(((storage.foldername(name))[1])::uuid));

-- ----------------------------------------------------------------------------
-- Vue : conversations (une par mission avec un pro attribué), respecte la RLS de l'appelant
-- ----------------------------------------------------------------------------
create view public.conversations with (security_invoker = true) as
select
  m.id as mission_id,
  m.client_id,
  m.pro_id,
  m.service_id,
  m.status,
  m.start_date,
  m.updated_at,
  (select msg.body from public.messages msg where msg.mission_id = m.id order by msg.created_at desc limit 1) as last_body,
  (select msg.image_path from public.messages msg where msg.mission_id = m.id order by msg.created_at desc limit 1) as last_image_path,
  (select msg.created_at from public.messages msg where msg.mission_id = m.id order by msg.created_at desc limit 1) as last_at,
  (select count(*) from public.messages msg where msg.mission_id = m.id and msg.read_at is null and msg.sender_id <> auth.uid()) as unread
from public.missions m
where m.pro_id is not null and m.status not in ('searching', 'posted');

grant select on public.conversations to authenticated;
