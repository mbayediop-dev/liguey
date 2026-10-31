-- ============================================================================
-- HEROES – données de référence (catalogue, TVA, pages légales)
-- Idempotent : peut être rejoué.
-- ============================================================================

insert into public.vat_rates (code, rate, label) values
  (1, 8.10, 'Taux normal'),
  (2, 2.60, 'Taux réduit')
on conflict (code) do update set rate = excluded.rate, label = excluded.label;

insert into public.services (slug, name, sort_order, client_rate_chf, pro_rate_chf, required_tools, tools_note) values
  ('electricien', 'Électricien', 1, 49.90, 39.90, array['Multimètre', 'Tournevis isolés', 'Pince à dénuder'], 'Le prestataire apporte son outillage de base. Le matériel (prises, luminaires, câbles) est facturé en frais supplémentaires.'),
  ('demenageur', 'Déménageur', 2, 45.00, 34.90, array['Diable', 'Sangles', 'Couvertures de protection'], 'Prévoyez les cartons fermés et un accès dégagé. Le véhicule utilitaire n''est pas inclus.'),
  ('dogsitter', 'Dogsitter', 3, 29.90, 22.90, array['Laisse', 'Sacs à déjections', 'Friandises'], 'Merci d''indiquer les habitudes de votre compagnon et son carnet de vaccination.'),
  ('bricoleur', 'Bricoleur', 4, 40.00, 29.90, array['Perceuse-visseuse', 'Niveau à bulle', 'Caisse à outils'], 'Les chevilles, vis et consommables sont facturés en frais supplémentaires.'),
  ('plombier', 'Plombier', 5, 59.90, 45.00, array['Clé à molette', 'Furet', 'Joints et téflon'], 'Coupez l''arrivée d''eau si une fuite est en cours.'),
  ('menage', 'Ménage', 6, 35.00, 26.90, array['Produits ménagers', 'Gants en latex', 'Chiffons microfibre'], 'Le client met à disposition l''aspirateur et le matériel de nettoyage lourd.'),
  ('debarras', 'Débarras', 7, 45.00, 34.90, array['Sacs de gravats', 'Gants de manutention', 'Diable'], 'Les frais de déchetterie sont facturés en frais supplémentaires.'),
  ('jardinier', 'Jardinier', 8, 39.90, 29.90, array['Sécateur', 'Cisaille', 'Râteau'], 'La tondeuse et le taille-haie électrique sont fournis par le client sauf mention contraire.'),
  ('coursier', 'Coursier', 9, 29.90, 22.90, array['Sac isotherme', 'Vélo ou scooter'], 'Les courses alimentaires sont avancées par le prestataire et facturées en frais supplémentaires sur ticket.'),
  ('beaute', 'Mise en beauté', 10, 55.00, 42.00, array['Sèche-cheveux', 'Brosses', 'Kit manucure'], 'Prestation à domicile. Les produits spécifiques sont facturés en frais supplémentaires.')
on conflict (slug) do update set
  name = excluded.name, sort_order = excluded.sort_order, client_rate_chf = excluded.client_rate_chf,
  pro_rate_chf = excluded.pro_rate_chf, required_tools = excluded.required_tools, tools_note = excluded.tools_note;

-- sous-services
with data (service_slug, name, sort_order) as (
  values
  ('electricien', 'Panne électrique', 1), ('electricien', 'Installation de luminaire', 2), ('electricien', 'Prise & interrupteur', 3),
  ('electricien', 'Tableau électrique', 4), ('electricien', 'Petits travaux électriques', 5),
  ('demenageur', 'Déménagement complet', 1), ('demenageur', 'Transport de meubles', 2), ('demenageur', 'Emballage / déballage', 3),
  ('demenageur', 'Montage & démontage de meubles', 4), ('demenageur', 'Aide au portage', 5),
  ('dogsitter', 'Garder mon chien', 1), ('dogsitter', 'Promenade', 2), ('dogsitter', 'Visite à domicile', 3),
  ('dogsitter', 'Garde de nuit', 4), ('dogsitter', 'Toilettage simple', 5),
  ('bricoleur', 'Bricolage général', 1), ('bricoleur', 'Monter un/des meubles', 2), ('bricoleur', 'Réparations diverses', 3),
  ('bricoleur', 'Fixation au mur', 4), ('bricoleur', 'Petits travaux de plomberie', 5), ('bricoleur', 'Petits travaux électriques', 6),
  ('bricoleur', 'Peinture intérieur', 7), ('bricoleur', 'Peinture extérieur', 8), ('bricoleur', 'Refaire des joints', 9),
  ('plombier', 'Fuite d''eau', 1), ('plombier', 'Débouchage', 2), ('plombier', 'Installation sanitaire', 3),
  ('plombier', 'Robinetterie', 4), ('plombier', 'Chauffe-eau', 5),
  ('menage', 'Ménage régulier', 1), ('menage', 'Grand nettoyage', 2), ('menage', 'Nettoyage de fin de bail', 3),
  ('menage', 'Repassage', 4), ('menage', 'Vitres', 5),
  ('debarras', 'Débarras d''appartement', 1), ('debarras', 'Encombrants', 2), ('debarras', 'Déchetterie', 3),
  ('debarras', 'Cave & grenier', 4), ('debarras', 'Évacuation de meubles', 5),
  ('jardinier', 'Tonte de pelouse', 1), ('jardinier', 'Taille de haies', 2), ('jardinier', 'Entretien du jardin', 3),
  ('jardinier', 'Plantation', 4), ('jardinier', 'Désherbage', 5),
  ('coursier', 'Livraison de colis', 1), ('coursier', 'Courses alimentaires', 2), ('coursier', 'Documents urgents', 3),
  ('coursier', 'Pharmacie', 4), ('coursier', 'Autre course', 5),
  ('beaute', 'Manucure', 1), ('beaute', 'Pédicure', 2), ('beaute', 'Brushing', 3),
  ('beaute', 'Coiffure à domicile', 4), ('beaute', 'Maquillage', 5)
)
insert into public.sub_services (service_id, name, sort_order)
select s.id, d.name, d.sort_order
from data d join public.services s on s.slug = d.service_slug
where not exists (select 1 from public.sub_services ss where ss.service_id = s.id and ss.name = d.name);

-- pages légales (textes repris des maquettes ; les CGU sont un exemple à remplacer par le texte définitif)
insert into public.legal_pages (slug, title, body) values
('about', 'Qui sommes-nous ?',
'**HEROES** est une application offrant tout type de services en mettant en relation prestataires et clients. C''est le collectif de chez SushiZen qui a donné naissance à ce nouveau concept d''offre et de demande en instantané, depuis 2018.

**Pourquoi utiliser HEROES ?**

Car, dans ce monde où tout va vite, il faut savoir être productif et efficace, tout en faisant face aux imprévus du quotidien. Cette application vous permet justement de combiner tous ces points de manière rapide et simple. Vous pouvez désormais vivre dans l''air du temps, tout en profitant de vos moments à vous.

Il suffit de vous inscrire selon les conditions d''utilisation et de laisser la magie opérer au gré de vos besoins. Trouvez votre héros et donnez-lui une mission !'),
('cgu', 'Conditions générales d''utilisation (CGU)',
'Dans la liste des exemples fournis par la Confédération Suisse, vous trouverez notamment l''exemple ci-dessous (source : CGV outletbike.ch et laredoute.ch)

__Prix__
Les prix de ce catalogue sont indiqués en francs suisses, montants nets, TVA comprise et garantis.
Les articles bénéficiant d''une garantie sont soumis aux conditions de l''offre valable lors de l''achat. La garantie prend effet à la date de livraison de l''article, justifiée par le document d''accompagnement (facture) que nous vous demandons de conserver soigneusement. Ne sont pas couverts : les dommages dus à un mauvais entretien, au non respect du mode d''emploi, ou à une usure normale.

__Disponibilité__
Notre engagement de livraison est nul en cas de défaillance ou non-respect des délais d''approvisionnement de la part de nos propres fournisseurs, et dans la mesure où cette indisponibilité n''est pas imputable à VOTRE ENTREPRISE. En cas d''indisponibilité d''un article, nous vous en informons dans les meilleurs délais.

__Retour ou échange de marchandises__
Les articles doivent être renvoyés intacts et complets dans leur emballage d''origine (avec les étiquettes comportant leurs références), accompagnés du bordereau de livraison, dans un délai de 7 jours après réception de votre colis. Les frais de port liés au retour sont à votre charge. Dans le cas d''une commande échange, les frais de port de votre nouvelle commande vous sont offerts.

__Garantie légales__
Vérifiez l''état des marchandises livrées sans attendre pour exclure des vices de matière et de fabrication manifestes, ainsi que des dommages dus au transport. Conformément à la loi, vous êtes obligé de nous signaler tout défaut ou anomalie affectant les marchandises livrées pour nous permettre d''y remédier.

__Informatique et libertés__
Toutes les données à caractère personnel seront considérées comme confidentielles. Les informations nécessaires à la gestion de la commande feront l''objet d''un traitement informatique et peuvent être communiquées à des entreprises associées dans le cadre de la gestion de la commande.'),
('privacy', 'Suivi des données',
'**HEROES** vous propose divers services que vous pouvez utiliser de différentes manières. Selon que vous nous contactez en ligne, par téléphone, personnellement ou de toute autre manière et selon les services que vous utilisez, diverses données provenant de différentes sources sont communiquées. Beaucoup des données que nous traitons sont des données que vous nous communiquez lorsque vous utilisez nos services ou lorsque vous nous contactez, par exemple lorsque vous vous enregistrez et indiquez à cet effet votre nom, votre adresse électronique ou votre adresse. Nous recevons également des données techniques relatives à votre terminal et des données d''accès que nous saisissions automatiquement lors de votre interaction avec nos services. Il peut par exemple s''agir d''informations sur le terminal que vous utilisez. Nous recueillons d''autres données par l''intermédiaire de nos analyses de données (par ex. dans le cadre d''études de marché et d''évaluations des clients). Le cas échéant, nous recevons également des données vous concernant par l''intermédiaire de tiers, par exemple des agences de renseignements et des prestataires de services de paiement.

**HEROES** traite vos données en respectant toutes les lois applicables à la protection des données. À cet égard, nous respectons bien entendu les principes du droit relatif à la protection des données applicable au traitement des données à caractère personnel. Ainsi, nous traitons en principe vos données uniquement aux fins indiquées dans la présente politique de confidentialité ou lors de la saisie de vos données. Il s''agit en premier lieu du traitement des achats et de la mise à disposition, de la personnalisation, du développement et de la sécurité de nos services. En outre, nous utilisons vos données dans les limites des règles strictes du droit suisse et européen relatif à la protection des données, mais aussi à d''autres fins, comme le développement produits, la recherche scientifique et l''étude de marché, pour l''optimisation des processus commerciaux, l''adaptation de nos services aux besoins, et la publicité personnalisée.

Le développement et la mise à disposition de fonctionnalités et de services personnalisés sont essentiels à nos yeux. Indépendamment du lieu, de l''heure et du terminal utilisé, nous vous offrons une expérience individuelle et une offre parfaitement adaptée à vos intérêts personnels. Ainsi, le traitement de vos données aux fins de personnalisation de nos services fait partie intégrante des services proposés par **HEROES**.

Nous vous proposons divers services de newsletters. Lorsque vous vous abonnez à un service de newsletters, vous recevez des informations sur les thèmes traités dans les newsletters. En outre, il existe également des newsletters spécifiques à chaque service et qui en font partie intégrante. Lorsque nos newsletters sont consultées, nous saisissons également des données relatives au terminal et des données d''accès.

En liaison avec nos services, nous vous présentons des informations et des offres de **HEROES** en fonction de vos intérêts. Vous recevrez ces suggestions personnelles même si vous n''êtes pas abonné(e) à notre newsletter. Pour choisir les suggestions individuelles, nous utilisons tout d''abord, conformément à la loi, vos données actuelles d''achat et les données concernant vos intérêts d''où nous retirons les services qui vous intéressent, en fonction des intérêts et des préférences que vous nous avez indiqués, ainsi que de vos données de profil.

Nos partenaires publicitaires et nous utilisons vos données pour vous présenter des publicités personnalisées dans les services de **HEROES** et sur les sites web et applis d''autres exploitants. À cet égard, nos partenaires publicitaires et nous utilisons les technologies internet usuelles sur le marché. Ainsi, nous pouvons vous présenter des publicités ciblées et vous soumettre des publicités et des offres qui vous intéressent réellement.'),
('website', 'heroes.swiss',
'Nous utilisons vos données pour fournir les sites web et les applis **HEROES**. Outre les données relatives au terminal et les données d''accès générées lors de chaque utilisation de ces services, le type des données traitées, ainsi que les objectifs du traitement des données, dépendent de la manière dont vous utilisez les fonctions et services disponibles via nos services. En outre, nous utilisons les données générées lors de l''utilisation de nos services afin de déterminer la manière dont notre offre en ligne est utilisée. Nous utilisons ces informations notamment dans le cadre de la personnalisation afin d''améliorer nos services et de proposer des publicités personnalisées.')
on conflict (slug) do update set title = excluded.title, body = excluded.body, updated_at = now();
