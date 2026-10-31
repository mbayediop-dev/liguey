export interface FaqEntry {
  title: string;
  body: string;
}

export const FAQ: FaqEntry[] = [
  {
    title: 'Méthode de paiements',
    body: 'Le prépaiement est débité sur la carte enregistrée au moment où vous validez le héros qui a accepté votre demande. Les frais supplémentaires ajoutés pendant la mission sont facturés à la fin de celle-ci.',
  },
  {
    title: '(dés)Inscription à la newsletter',
    body: 'Vous pouvez activer ou désactiver la newsletter à tout moment depuis Paramètres → Newsletter.',
  },
  {
    title: 'Remboursements',
    body: "Une mission annulée plus de 24 heures avant le rendez-vous est intégralement remboursée. Passé ce délai, le prépaiement n'est pas remboursable.",
  },
  {
    title: 'Comment annuler une mission ?',
    body: "Ouvrez la mission depuis la page d'accueil ou l'agenda, puis appuyez sur la croix ou sur « Annuler la mission ». Le héros est prévenu immédiatement.",
  },
  {
    title: 'Compte client',
    body: 'Vos informations personnelles, votre photo et vos cartes se gèrent depuis « Voir mon profil » et « Paramètres ». La suppression du compte se demande via le formulaire ci-dessous.',
  },
  {
    title: 'Partenaires HEROES',
    body: "Vous êtes prestataire ? Téléchargez l'application HEROES PRO, créez votre profil avec vos justificatifs et recevez les demandes en direct.",
  },
];

export const CONTACT = {
  hotline: '0800 830 233',
  hotlineNote: '(Gratuit depuis une ligne fixe en Suisse)',
  hours: 'joignable du lundi au dimanche de 7h à 22h',
  company: 'HEROES',
  address: ['Rue Marterey 13', '1005 Lausanne', 'Suisse'],
  phone: '021 123 45 67',
  fax: '021 123 45 68',
  email: 'service@heroes.swiss',
  legalRep: 'SushiZen',
  register: 'Enregistrée au Registre du Commerce de Lausanne - Suisse',
  uid: 'CHE-123.456.789 TVA',
  taxId: '12/345/67891',
  website: 'https://heroes.swiss',
};
