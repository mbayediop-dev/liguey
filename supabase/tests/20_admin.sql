-- Scénario back-office : s'exécute après 10_scenario.sql sur la même base (réutilise ses utilisateurs).
\set ON_ERROR_STOP on
\set client '11111111-1111-1111-1111-111111111111'
\set pro '22222222-2222-2222-2222-222222222222'
\set other '33333333-3333-3333-3333-333333333333'
\set admin '44444444-4444-4444-4444-444444444444'

insert into auth.users (id, email, raw_user_meta_data) values
  (:'admin', 'admin@test.ch', '{"first_name":"Ada","last_name":"Admin"}');
-- amorçage du premier administrateur (comme documenté : depuis l'éditeur SQL, rôle postgres)
update public.profiles set is_admin = true where id = :'admin';

-- --- un utilisateur ordinaire : ni auto-promotion, ni stats, ni accès aux données des autres
set role authenticated;
select set_config('request.jwt.claim.sub', :'other', false);
do $$ begin
  update public.profiles set is_admin = true where id = '33333333-3333-3333-3333-333333333333';
  raise exception 'un utilisateur a pu se promouvoir administrateur';
exception when others then
  if sqlerrm like '%réservée aux administrateurs%' then raise notice 'OK: auto-promotion refusée'; else raise; end if;
end $$;
do $$ begin
  update public.profiles set rating_avg = 5, rating_count = 99 where id = '33333333-3333-3333-3333-333333333333';
  raise exception 'un utilisateur a pu modifier sa note';
exception when others then
  if sqlerrm like '%réservée aux administrateurs%' then raise notice 'OK: note non falsifiable'; else raise; end if;
end $$;
do $$ begin
  perform public.admin_dashboard_stats();
  raise exception 'les statistiques sont accessibles à un non-administrateur';
exception when others then
  if sqlerrm like '%Réservé aux administrateurs%' then raise notice 'OK: stats refusées au non-admin'; else raise; end if;
end $$;
select public.is_admin() as autre_est_admin, count(*) as missions_visibles_autre from public.missions;
-- "other" se déclare disponible pour le ménage (sera bloqué ensuite)
insert into public.pro_services (pro_id, service_id) select :'other', id from public.services where slug = 'menage';
update public.profiles set onboarding_completed = true where id = :'other';

-- --- l'administrateur voit tout et administre le catalogue
select set_config('request.jwt.claim.sub', :'admin', false);
select public.is_admin() as admin_est_admin;
select count(*) as missions_visibles_admin from public.missions;
select count(*) as messages_visibles_admin from public.messages;
select count(*) as frais_visibles_admin from public.mission_expenses;
select count(*) as paiements_visibles_admin from public.payments;
select first_name, role from public.profiles where search ilike '%leuenb%';
update public.services set client_rate_chf = 42.00 where slug = 'bricoleur' returning slug, client_rate_chf;
insert into public.sub_services (service_id, name, sort_order)
  select id, 'Montage de meubles (test)', 99 from public.services where slug = 'bricoleur' returning name;
update public.legal_pages set title = title where slug = 'cgu' returning slug, updated_at >= now() - interval '1 minute' as touchee;
update public.vat_rates set label = label where code = 1 returning code, rate;

-- --- vérification d'un prestataire → notification
select verification_status, verified_at is not null as verifie from public.admin_set_verification(:'pro', 'verified', null);
select title from public.notifications where user_id = :'pro' order by created_at desc limit 1;

-- --- blocage de "other" : exclu des diffusions et de l'acceptation
select is_blocked, blocked_reason from public.admin_set_blocked(:'other', true, 'Comportement inapproprié');
select public.count_available_pros(id) as pros_dispo_menage from public.services where slug = 'menage';

select set_config('request.jwt.claim.sub', :'client', false);
insert into public.missions (client_id, service_id, street, zip, city, start_date, time_start, time_end, description)
  select :'client', id, 'Rue des Alpes 11', '1032', 'Bussigny', current_date + 3, '14:00', '15:00', 'Test admin'
  from public.services where slug = 'menage'
  returning id as m2 \gset
select set_config('request.jwt.claim.sub', :'other', false);
select set_config('test.m2', :'m2', false);
select count(*) as notifs_mission_pour_bloque from public.notifications
  where user_id = :'other' and (data ->> 'mission_id') = :'m2';
do $$ begin
  perform public.accept_mission(current_setting('test.m2')::uuid);
  raise exception 'un compte bloqué a pu accepter une mission';
exception when others then
  if sqlerrm like '%Compte suspendu%' then raise notice 'OK: acceptation refusée au compte bloqué'; else raise; end if;
end $$;

-- --- annulation par l'administrateur → les deux parties sont prévenues
select set_config('request.jwt.claim.sub', :'admin', false);
select status, cancel_reason, cancelled_by = :'admin' as par_admin from public.admin_cancel_mission(:'m2', 'Doublon');
select title, body from public.notifications where user_id = :'client' order by created_at desc limit 1;

-- --- support : demande du client, traitement et réponse de l'admin
select set_config('request.jwt.claim.sub', :'client', false);
insert into public.support_requests (user_id, message) values (:'client', 'Je n''arrive pas à payer') returning id as sr \gset
select set_config('request.jwt.claim.sub', :'admin', false);
update public.support_requests set status = 'closed', admin_note = 'Résolu', handled_by = :'admin', handled_at = now()
  where id = :'sr' returning status, admin_note;
select (public.admin_notify(:'client', 'Réponse du support', 'C''est réglé !')).title as notif_envoyee;

-- --- blocage d'un client : plus de nouvelle demande, puis réactivation
select is_blocked from public.admin_set_blocked(:'client', true, 'Impayés');
select set_config('request.jwt.claim.sub', :'client', false);
do $$ begin
  insert into public.missions (client_id, service_id, street, zip, city, start_date, time_start, time_end)
    select '11111111-1111-1111-1111-111111111111', id, 'Rue', '1000', 'Lausanne', current_date + 1, '09:00', '10:00'
    from public.services where slug = 'menage';
  raise exception 'un client bloqué a pu créer une demande';
exception when others then
  if sqlerrm like '%Compte suspendu%' then raise notice 'OK: demande refusée au client bloqué'; else raise; end if;
end $$;
select set_config('request.jwt.claim.sub', :'admin', false);
select is_blocked from public.admin_set_blocked(:'client', false, null);

-- --- statistiques
select public.admin_dashboard_stats() - 'missions_daily' - 'revenue_monthly' - 'top_services' as stats;
select jsonb_array_length(public.admin_dashboard_stats() -> 'missions_daily') as jours,
       jsonb_array_length(public.admin_dashboard_stats() -> 'revenue_monthly') as mois,
       jsonb_array_length(public.admin_dashboard_stats() -> 'top_services') as services;

-- --- garde-fous admin
do $$ begin
  perform public.admin_set_admin('44444444-4444-4444-4444-444444444444'::uuid, false);
  raise exception 'un administrateur a pu retirer ses propres droits';
exception when others then
  if sqlerrm like '%propres droits%' then raise notice 'OK: auto-retrait refusé'; else raise; end if;
end $$;
select is_admin as other_promu from public.admin_set_admin(:'other', true);
select is_admin as other_retrograde from public.admin_set_admin(:'other', false);

-- --- stockage : les buckets privés sont lisibles par l'admin, pas par un tiers
reset role;
insert into storage.objects (bucket_id, name) values ('documents', :'pro' || '/id-recto.jpg');
set role authenticated;
select set_config('request.jwt.claim.sub', :'admin', false);
select count(*) as objets_documents_admin from storage.objects where bucket_id = 'documents';
select set_config('request.jwt.claim.sub', :'other', false);
select count(*) as objets_documents_tiers from storage.objects where bucket_id = 'documents';
reset role;
\echo ADMIN OK
