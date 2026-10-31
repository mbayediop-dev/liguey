-- ============================================================================
-- HEROES – back-office d'administration
-- Ajoute : administrateurs (profiles.is_admin), vérification des prestataires,
-- blocage de comptes, suivi des demandes de support, statistiques globales,
-- politiques RLS « admin » sur toutes les tables et les buckets privés.
-- À appliquer après 20261030000000_init.sql.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Colonnes supplémentaires
-- ----------------------------------------------------------------------------
create type public.verification_status as enum ('pending', 'verified', 'rejected');
create type public.support_status as enum ('open', 'in_progress', 'closed');

alter table public.profiles
  add column if not exists is_admin boolean not null default false,
  add column if not exists is_blocked boolean not null default false,
  add column if not exists blocked_reason text,
  add column if not exists verification_status public.verification_status not null default 'pending',
  add column if not exists verification_note text,
  add column if not exists verified_at timestamptz,
  -- colonne de recherche plein texte simple pour le back-office (nom, e-mail, ville, téléphone)
  add column if not exists search text generated always as (
    lower(coalesce(first_name, '') || ' ' || coalesce(last_name, '') || ' ' || coalesce(email, '') || ' '
          || coalesce(city, '') || ' ' || coalesce(phone, ''))
  ) stored;

create index if not exists profiles_admin_idx on public.profiles (is_admin) where is_admin;
create index if not exists profiles_verification_idx on public.profiles (role, verification_status);
create index if not exists profiles_created_idx on public.profiles (created_at desc);

alter table public.support_requests
  add column if not exists status public.support_status not null default 'open',
  add column if not exists admin_note text,
  add column if not exists handled_by uuid references public.profiles (id) on delete set null,
  add column if not exists handled_at timestamptz;
create index if not exists support_requests_status_idx on public.support_requests (status, created_at desc);

create index if not exists missions_created_idx on public.missions (created_at desc);
create index if not exists missions_completed_idx on public.missions (completed_at) where status = 'completed';

-- ----------------------------------------------------------------------------
-- 2. Qui est administrateur ?
-- ----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select p.is_admin from public.profiles p where p.id = auth.uid()), false);
$$;
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- Les colonnes sensibles de profiles ne sont modifiables que par un administrateur.
-- Fonction SECURITY INVOKER volontairement : current_user vaut 'authenticated' quand la requête
-- vient de l'app, et 'postgres' quand elle vient d'une fonction SECURITY DEFINER (ex. refresh_rating).
create or replace function public.profiles_protect_admin_columns()
returns trigger language plpgsql set search_path = public as $$
begin
  if current_user in ('authenticated', 'anon') and not public.is_admin() then
    if new.is_admin is distinct from old.is_admin
       or new.is_blocked is distinct from old.is_blocked
       or new.blocked_reason is distinct from old.blocked_reason
       or new.verification_status is distinct from old.verification_status
       or new.verification_note is distinct from old.verification_note
       or new.verified_at is distinct from old.verified_at
       or new.rating_avg is distinct from old.rating_avg
       or new.rating_count is distinct from old.rating_count then
      raise exception 'Modification réservée aux administrateurs';
    end if;
  end if;
  if old.is_admin and not new.is_admin and old.id = auth.uid() then
    raise exception 'Un administrateur ne peut pas retirer ses propres droits';
  end if;
  return new;
end $$;
drop trigger if exists profiles_protect_admin_columns on public.profiles;
create trigger profiles_protect_admin_columns before update on public.profiles
  for each row execute function public.profiles_protect_admin_columns();

-- ----------------------------------------------------------------------------
-- 3. Comptes bloqués : plus de nouvelle demande ni d'acceptation, exclus des diffusions
-- ----------------------------------------------------------------------------
create or replace function public.missions_before_insert()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  s public.services%rowtype;
begin
  if exists (select 1 from public.profiles p where p.id = new.client_id and p.is_blocked) then
    raise exception 'Compte suspendu';
  end if;
  select * into s from public.services where id = new.service_id;
  if not found then
    raise exception 'Service inconnu';
  end if;
  if not s.is_active then
    raise exception 'Ce service n''est plus proposé';
  end if;
  new.client_rate_chf := coalesce(new.client_rate_chf, s.client_rate_chf);
  new.pro_rate_chf := coalesce(new.pro_rate_chf, s.pro_rate_chf);
  new.base_hours := greatest(0.5, round((extract(epoch from (new.time_end - new.time_start)) / 3600.0)::numeric, 2));
  new.base_amount_chf := round(new.base_hours * new.client_rate_chf, 2);
  return new;
end $$;

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
  if exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_blocked) then
    raise exception 'Compte suspendu';
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

create or replace function public.count_available_pros(p_service_id uuid)
returns integer language sql stable security definer set search_path = public as $$
  select count(distinct ps.pro_id)::integer
  from public.pro_services ps
  join public.profiles p on p.id = ps.pro_id
  where ps.service_id = p_service_id and p.onboarding_completed and p.role = 'pro' and not p.is_blocked;
$$;

-- Notifications de mission : exclut les pros bloqués des diffusions et gère l'annulation par HEROES.
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
      where ps.service_id = new.service_id and p.onboarding_completed and not p.is_blocked;
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
      where ps.service_id = new.service_id and p.onboarding_completed and not p.is_blocked
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
      if new.cancelled_by = new.client_id then
        if new.pro_id is not null then
          insert into public.notifications (user_id, kind, title, body, data)
          values (new.pro_id, 'mission', 'Mission annulée', v_client || ' a annulé la mission ' || v_service,
                  jsonb_build_object('mission_id', new.id, 'status', new.status));
        end if;
      elsif new.cancelled_by is not distinct from new.pro_id then
        insert into public.notifications (user_id, kind, title, body, data)
        values (new.client_id, 'mission', 'Mission annulée', coalesce(v_pro, 'Le prestataire') || ' a annulé la mission ' || v_service,
                jsonb_build_object('mission_id', new.id, 'status', new.status));
      else
        -- annulation par un administrateur : les deux parties sont prévenues
        insert into public.notifications (user_id, kind, title, body, data)
        select u, 'mission', 'Mission annulée par HEROES',
               'La mission ' || v_service || ' du ' || to_char(new.start_date, 'DD.MM.YYYY') || ' a été annulée'
               || coalesce(' : ' || new.cancel_reason, ''),
               jsonb_build_object('mission_id', new.id, 'status', new.status)
        from unnest(array_remove(array[new.client_id, new.pro_id], null)) as u;
      end if;
    end if;
  end if;
  return new;
end $$;

-- ----------------------------------------------------------------------------
-- 4. Actions d'administration (RPC)
-- ----------------------------------------------------------------------------
create or replace function public.admin_set_verification(
  p_user_id uuid,
  p_status public.verification_status,
  p_note text default null
)
returns public.profiles language plpgsql security definer set search_path = public as $$
declare
  p public.profiles%rowtype;
begin
  if not public.is_admin() then raise exception 'Réservé aux administrateurs'; end if;
  update public.profiles
  set verification_status = p_status,
      verification_note = p_note,
      verified_at = case when p_status = 'verified' then now() else null end
  where id = p_user_id
  returning * into p;
  if not found then raise exception 'Utilisateur introuvable'; end if;

  insert into public.notifications (user_id, kind, title, body, data)
  values (
    p_user_id, 'system',
    case p_status
      when 'verified' then 'Profil vérifié'
      when 'rejected' then 'Profil non validé'
      else 'Profil en cours de vérification'
    end,
    case p_status
      when 'verified' then 'Bienvenue chez HEROES ! Votre profil est validé.'
      when 'rejected' then coalesce(p_note, 'Merci de compléter ou corriger vos documents.')
      else coalesce(p_note, 'Nous vérifions vos documents.')
    end,
    jsonb_build_object('verification_status', p_status)
  );
  return p;
end $$;

create or replace function public.admin_set_blocked(p_user_id uuid, p_blocked boolean, p_reason text default null)
returns public.profiles language plpgsql security definer set search_path = public as $$
declare
  p public.profiles%rowtype;
begin
  if not public.is_admin() then raise exception 'Réservé aux administrateurs'; end if;
  if p_user_id = auth.uid() then raise exception 'Impossible de bloquer son propre compte'; end if;
  update public.profiles
  set is_blocked = p_blocked, blocked_reason = case when p_blocked then p_reason else null end
  where id = p_user_id
  returning * into p;
  if not found then raise exception 'Utilisateur introuvable'; end if;

  insert into public.notifications (user_id, kind, title, body, data)
  values (
    p_user_id, 'system',
    case when p_blocked then 'Compte suspendu' else 'Compte réactivé' end,
    case when p_blocked then coalesce(p_reason, 'Contactez le support HEROES pour plus d''informations.')
         else 'Vous pouvez de nouveau utiliser HEROES.' end,
    jsonb_build_object('is_blocked', p_blocked)
  );
  return p;
end $$;

create or replace function public.admin_set_admin(p_user_id uuid, p_admin boolean)
returns public.profiles language plpgsql security definer set search_path = public as $$
declare
  p public.profiles%rowtype;
begin
  if not public.is_admin() then raise exception 'Réservé aux administrateurs'; end if;
  if p_user_id = auth.uid() and not p_admin then
    raise exception 'Un administrateur ne peut pas retirer ses propres droits';
  end if;
  update public.profiles set is_admin = p_admin where id = p_user_id returning * into p;
  if not found then raise exception 'Utilisateur introuvable'; end if;
  return p;
end $$;

create or replace function public.admin_cancel_mission(p_mission_id uuid, p_reason text default null)
returns public.missions language plpgsql security definer set search_path = public as $$
declare
  m public.missions%rowtype;
begin
  if not public.is_admin() then raise exception 'Réservé aux administrateurs'; end if;
  select * into m from public.missions where id = p_mission_id for update;
  if not found then raise exception 'Mission introuvable'; end if;
  if m.status in ('completed', 'cancelled') then raise exception 'Transition impossible'; end if;
  update public.missions
  set status = 'cancelled', cancelled_at = now(), cancelled_by = auth.uid(), cancel_reason = p_reason
  where id = p_mission_id
  returning * into m;
  return m;
end $$;

-- Message système envoyé par un administrateur à un utilisateur (apparaît dans ses notifications).
create or replace function public.admin_notify(p_user_id uuid, p_title text, p_body text default null)
returns public.notifications language plpgsql security definer set search_path = public as $$
declare
  n public.notifications%rowtype;
begin
  if not public.is_admin() then raise exception 'Réservé aux administrateurs'; end if;
  if coalesce(trim(p_title), '') = '' then raise exception 'Titre requis'; end if;
  insert into public.notifications (user_id, kind, title, body, data)
  values (p_user_id, 'system', p_title, p_body, jsonb_build_object('from', 'admin'))
  returning * into n;
  return n;
end $$;

-- Tableau de bord : compteurs, chiffre d'affaires, séries temporelles.
create or replace function public.admin_dashboard_stats()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  v jsonb;
begin
  if not public.is_admin() then raise exception 'Réservé aux administrateurs'; end if;
  select jsonb_build_object(
    'clients', (select count(*) from public.profiles where role = 'client'),
    'pros', (select count(*) from public.profiles where role = 'pro'),
    'pros_pending', (select count(*) from public.profiles
                     where role = 'pro' and onboarding_completed and verification_status = 'pending'),
    'blocked', (select count(*) from public.profiles where is_blocked),
    'new_users_30d', (select count(*) from public.profiles where created_at >= now() - interval '30 days'),
    'missions_total', (select count(*) from public.missions),
    'missions_active', (select count(*) from public.missions
                        where status in ('searching', 'posted', 'pending_validation', 'confirmed', 'start_requested', 'in_progress')),
    'missions_searching', (select count(*) from public.missions where status in ('searching', 'posted')),
    'missions_today', (select count(*) from public.missions
                       where start_date = current_date and status in ('confirmed', 'start_requested', 'in_progress')),
    'missions_by_status', (select coalesce(jsonb_object_agg(status, n), '{}'::jsonb)
                           from (select status, count(*) n from public.missions group by status) s),
    'revenue_month', (select coalesce(sum(total_ttc_chf), 0) from public.missions
                      where status = 'completed' and date_trunc('month', completed_at) = date_trunc('month', now())),
    'margin_month', (select coalesce(sum(total_ttc_chf - pro_amount_chf), 0) from public.missions
                     where status = 'completed' and date_trunc('month', completed_at) = date_trunc('month', now())),
    'revenue_total', (select coalesce(sum(total_ttc_chf), 0) from public.missions where status = 'completed'),
    'margin_total', (select coalesce(sum(total_ttc_chf - pro_amount_chf), 0) from public.missions where status = 'completed'),
    'avg_rating_pros', (select coalesce(round(avg(rating_avg), 2), 0) from public.profiles where role = 'pro' and rating_count > 0),
    'support_open', (select count(*) from public.support_requests where status <> 'closed'),
    'missions_daily', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'day', to_char(d, 'YYYY-MM-DD'),
        'created', (select count(*) from public.missions m where m.created_at::date = d),
        'completed', (select count(*) from public.missions m where m.status = 'completed' and m.completed_at::date = d)
      ) order by d), '[]'::jsonb)
      from generate_series(current_date - 29, current_date, interval '1 day') as d
    ),
    'revenue_monthly', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'month', to_char(mo, 'YYYY-MM'),
        'revenue', (select coalesce(sum(total_ttc_chf), 0) from public.missions m
                    where m.status = 'completed' and date_trunc('month', m.completed_at) = mo),
        'margin', (select coalesce(sum(total_ttc_chf - pro_amount_chf), 0) from public.missions m
                   where m.status = 'completed' and date_trunc('month', m.completed_at) = mo),
        'missions', (select count(*) from public.missions m
                     where m.status = 'completed' and date_trunc('month', m.completed_at) = mo)
      ) order by mo), '[]'::jsonb)
      from generate_series(date_trunc('month', now()) - interval '5 months', date_trunc('month', now()), interval '1 month') as mo
    ),
    'top_services', (
      select coalesce(jsonb_agg(jsonb_build_object('service_id', service_id, 'name', name, 'missions', n, 'revenue', revenue) order by n desc), '[]'::jsonb)
      from (
        select m.service_id, s.name, count(*) n, coalesce(sum(m.total_ttc_chf) filter (where m.status = 'completed'), 0) revenue
        from public.missions m join public.services s on s.id = m.service_id
        group by m.service_id, s.name order by n desc limit 5
      ) t
    )
  ) into v;
  return v;
end $$;

revoke execute on function public.admin_set_verification(uuid, public.verification_status, text) from public, anon;
revoke execute on function public.admin_set_blocked(uuid, boolean, text) from public, anon;
revoke execute on function public.admin_set_admin(uuid, boolean) from public, anon;
revoke execute on function public.admin_cancel_mission(uuid, text) from public, anon;
revoke execute on function public.admin_notify(uuid, text, text) from public, anon;
revoke execute on function public.admin_dashboard_stats() from public, anon;
grant execute on function public.admin_set_verification(uuid, public.verification_status, text) to authenticated;
grant execute on function public.admin_set_blocked(uuid, boolean, text) to authenticated;
grant execute on function public.admin_set_admin(uuid, boolean) to authenticated;
grant execute on function public.admin_cancel_mission(uuid, text) to authenticated;
grant execute on function public.admin_notify(uuid, text, text) to authenticated;
grant execute on function public.admin_dashboard_stats() to authenticated;

-- ----------------------------------------------------------------------------
-- 5. RLS : accès complet des administrateurs (politiques permissives, cumulées aux existantes)
-- ----------------------------------------------------------------------------
create policy profiles_admin on public.profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy services_admin on public.services for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy sub_services_admin on public.sub_services for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy vat_rates_admin on public.vat_rates for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy legal_pages_admin on public.legal_pages for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy pro_services_admin on public.pro_services for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy pro_documents_admin on public.pro_documents for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy payment_methods_admin_select on public.payment_methods for select to authenticated using (public.is_admin());
create policy missions_admin on public.missions for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy mission_declines_admin_select on public.mission_declines for select to authenticated using (public.is_admin());
create policy mission_reschedules_admin_select on public.mission_reschedules for select to authenticated using (public.is_admin());
create policy mission_expenses_admin on public.mission_expenses for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy payments_admin on public.payments for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy messages_admin_select on public.messages for select to authenticated using (public.is_admin());
create policy messages_admin_delete on public.messages for delete to authenticated using (public.is_admin());
create policy reviews_admin_select on public.reviews for select to authenticated using (public.is_admin());
create policy reviews_admin_delete on public.reviews for delete to authenticated using (public.is_admin());
create policy notifications_admin on public.notifications for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy support_requests_admin on public.support_requests for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Buckets privés : lecture (URL signées) pour les administrateurs
create policy "admin_read_private_buckets" on storage.objects for select to authenticated
  using (bucket_id in ('documents', 'receipts', 'chat') and public.is_admin());

-- ----------------------------------------------------------------------------
-- 6. Premier administrateur
-- ----------------------------------------------------------------------------
-- Créez d'abord le compte (inscription dans une app, ou Authentication → Users → Add user dans le
-- dashboard Supabase), puis exécutez dans l'éditeur SQL :
--   update public.profiles set is_admin = true
--   where id = (select id from auth.users where email = 'admin@exemple.ch');
