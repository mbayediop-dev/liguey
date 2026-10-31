/** Textes de secours si la table legal_pages n'est pas encore alimentée (voir supabase/seed.sql). */
export const LEGAL_FALLBACK: Record<string, { title: string; body: string }> = {
  about: {
    title: 'Qui sommes-nous ?',
    body: "**HEROES** est une application offrant tout type de services en mettant en relation prestataires et clients. C'est le collectif de chez SushiZen qui a donné naissance à ce nouveau concept d'offre et de demande en instantané, depuis 2018.\n\n**Pourquoi utiliser HEROES ?**\n\nCar, dans ce monde où tout va vite, il faut savoir être productif et efficace, tout en faisant face aux imprévus du quotidien. Cette application vous permet justement de combiner tous ces points de manière rapide et simple.\n\nIl suffit de vous inscrire selon les conditions d'utilisation et de laisser la magie opérer au gré de vos besoins. Trouvez votre héros et donnez-lui une mission !",
  },
  cgu: {
    title: "Conditions générales d'utilisation (CGU)",
    body: "__Prix__\nLes prix sont indiqués en francs suisses, montants nets, TVA comprise.\n\n__Annulation__\nUne mission peut être annulée sans frais jusqu'à 24 heures avant le rendez-vous. Passé ce délai, le prépaiement n'est pas remboursable.\n\n__Informatique et libertés__\nToutes les données à caractère personnel seront considérées comme confidentielles.",
  },
  privacy: {
    title: 'Suivi des données',
    body: '**HEROES** traite vos données en respectant toutes les lois applicables à la protection des données. Nous traitons vos données uniquement aux fins indiquées dans la présente politique de confidentialité ou lors de la saisie de vos données.',
  },
  website: {
    title: 'heroes.swiss',
    body: 'Nous utilisons vos données pour fournir les sites web et les applis **HEROES**. Le type des données traitées dépend de la manière dont vous utilisez les fonctions et services disponibles.',
  },
};
