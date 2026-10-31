-- Scénario de bout en bout exécuté avec la RLS (rôle authenticated + claim sub).
\set ON_ERROR_STOP on
\set client '11111111-1111-1111-1111-111111111111'
\set pro '22222222-2222-2222-2222-222222222222'
\set other '33333333-3333-3333-3333-333333333333'

insert into auth.users (id, email, raw_user_meta_data) values
  (:'client', 'client@test.ch', '{"role":"client","first_name":"Marion","last_name":"Leuenberger","street":"Rue des Alpes 11","zip":"1032","city":"Bussigny"}'),
  (:'pro', 'pro@test.ch', '{"role":"pro","first_name":"Jean","last_name":"Doute"}'),
  (:'other', 'other@test.ch', '{"role":"pro","first_name":"Autre","last_name":"Pro"}');
select id, role, first_name, last_name, city from public.profiles order by role, first_name;

-- --- le pro choisit ses prestations
set role authenticated;
select set_config('request.jwt.claim.sub', :'pro', false);
insert into public.pro_services (pro_id, service_id) select :'pro', id from public.services where slug in ('bricoleur', 'menage');
update public.profiles set onboarding_completed = true, avatar_url = :'pro' || '/a.jpg' where id = :'pro';

-- --- le client s'enregistre et crée une demande
select set_config('request.jwt.claim.sub', :'client', false);
update public.profiles set onboarding_completed = true where id = :'client';
insert into public.payment_methods (user_id, brand, last4, exp_month, exp_year, holder_name)
  values (:'client', 'mastercard', '0003', 10, 2030, 'Marion Leuenberger') returning id as pm_id \gset
insert into public.missions (client_id, service_id, sub_service_id, street, zip, city, start_date, time_start, time_end, recurrence, description)
  select :'client', s.id, ss.id, 'Rue des Alpes 11', '1032', 'Bussigny', current_date + 1, '10:00', '10:30', 'weekdays', 'Monter une étagère'
  from public.services s join public.sub_services ss on ss.service_id = s.id
  where s.slug = 'bricoleur' order by ss.sort_order limit 1
  returning id as m_id, status, base_hours, base_amount_chf, client_rate_chf, pro_rate_chf \gset
\echo mission créée :m_id status :status hours :base_hours amount :base_amount_chf
select public.count_available_pros(service_id) as pros_dispo from public.missions where id = :'m_id';

-- --- un pro qui ne propose pas ce service ne voit rien
select set_config('request.jwt.claim.sub', :'other', false);
select count(*) as visible_pour_autre_pro from public.missions;

-- --- le bon pro voit la demande et la notification, puis accepte
select set_config('request.jwt.claim.sub', :'pro', false);
select id = :'m_id' as visible_pour_pro, status from public.missions;
select title, body from public.notifications where user_id = :'pro';
select status, pro_id = :'pro' as attribue from public.accept_mission(:'m_id');

-- --- le client valide et prépaye
select set_config('request.jwt.claim.sub', :'client', false);
select title from public.notifications where user_id = :'client' order by created_at desc limit 1;
select status, validated_at is not null as validee from public.validate_mission(:'m_id', :'pm_id');
select amount_chf, status, provider from public.payments where mission_id = :'m_id';

-- --- changement d'horaire proposé par le client, accepté par le pro
select status from public.propose_reschedule(:'m_id', (current_date + 2)::date, '11:30', '12:00');
select set_config('request.jwt.claim.sub', :'pro', false);
select id as r_id from public.mission_reschedules where mission_id = :'m_id' and status = 'pending' \gset
select start_date = current_date + 2 as date_mise_a_jour, time_start from public.respond_reschedule(:'r_id', true);

-- --- démarrage
select status from public.request_start(:'m_id');
select set_config('request.jwt.claim.sub', :'client', false);
select status from public.confirm_start(:'m_id');

-- --- frais et clôture par le pro
select set_config('request.jwt.claim.sub', :'pro', false);
insert into public.mission_expenses (mission_id, kind, label, amount_chf, vat_code, created_by) values (:'m_id', 'material', 'Produits vaisselle', 4.90, 2, :'pro');
insert into public.mission_expenses (mission_id, kind, label, amount_chf, vat_code, minutes, created_by) values (:'m_id', 'time', 'Temps supplémentaire', 20.00, 1, 30, :'pro');
select status, total_ttc_chf, total_vat_chf, pro_amount_chf from public.complete_mission(:'m_id');

-- --- le client confirme, note le pro ; le pro note le client
select set_config('request.jwt.claim.sub', :'client', false);
select client_confirmed_at is not null as confirmee from public.confirm_completion(:'m_id');
insert into public.reviews (mission_id, author_id, target_id, rating, comment) values (:'m_id', :'client', :'pro', 4.5, 'Super héros !');
select set_config('request.jwt.claim.sub', :'pro', false);
insert into public.reviews (mission_id, author_id, target_id, rating, comment) values (:'m_id', :'pro', :'client', 5, 'Cliente très aimable !');
select id = :'pro' as est_pro, rating_avg, rating_count from public.profiles where id in (:'pro', :'client') order by role;

-- --- chat et compteurs
select set_config('request.jwt.claim.sub', :'client', false);
insert into public.messages (mission_id, sender_id, body) values (:'m_id', :'client', 'Bonjour !');
select set_config('request.jwt.claim.sub', :'pro', false);
select public.unread_counts() as avant_lecture;
select mission_id = :'m_id' as conv, last_body, unread from public.conversations;
select public.mark_messages_read(:'m_id');
select public.unread_counts() as apres_lecture;
select public.pro_dashboard_stats() as stats_pro;

-- --- garde-fous : un client ne peut pas accepter, un étranger ne peut rien lire
select set_config('request.jwt.claim.sub', :'client', false);
do $$ begin
  perform public.accept_mission('11111111-1111-1111-1111-111111111111'::uuid);
  raise exception 'un client a pu accepter une mission';
exception when others then
  if sqlerrm like '%Réservé aux prestataires%' then raise notice 'OK: accept_mission refusé au client'; else raise; end if;
end $$;
select set_config('request.jwt.claim.sub', :'other', false);
select count(*) as messages_visibles_etranger from public.messages;
select count(*) as frais_visibles_etranger from public.mission_expenses;
reset role;
\echo SCENARIO OK
