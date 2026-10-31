/* eslint-disable @typescript-eslint/no-require-imports */
export const images = {
  flagRed: require('../assets/images/flag-red.png'),
  flagSmall: require('../assets/images/flag-small.png'),
  logoHeroes: require('../assets/images/logo-heroes.png'),
  logoHeroesPro: require('../assets/images/logo-heroes-pro-hd.png'),
  wordmarkHeroes: require('../assets/images/wordmark-heroes.png'),
  wordmarkHeroesPro: require('../assets/images/wordmark-heroes-pro.png'),
  dashboardHero: require('../assets/images/dashboard-hero.png'),
  illusMission: require('../assets/images/illus-mission.png'),
  illusClouds: require('../assets/images/illus-clouds.png'),
  headerPetals: require('../assets/images/header-petals.png'),
  headerLeaves: require('../assets/images/header-leaves.png'),
  brandMastercard: require('../assets/images/brand-mastercard.png'),
  brandVisa: require('../assets/images/brand-visa.png'),
  brandAmex: require('../assets/images/brand-amex.png'),
  services: {
    electricien: require('../assets/images/service-electricien.png'),
    demenageur: require('../assets/images/service-demenageur.png'),
    dogsitter: require('../assets/images/service-dogsitter.png'),
    bricoleur: require('../assets/images/service-bricoleur.png'),
    plombier: require('../assets/images/service-plombier.png'),
    menage: require('../assets/images/service-menage.png'),
    debarras: require('../assets/images/service-debarras.png'),
    jardinier: require('../assets/images/service-jardinier.png'),
    coursier: require('../assets/images/service-coursier.png'),
    beaute: require('../assets/images/service-beaute.png'),
  } as Record<string, number>,
} as const;

/** Dimensions natives des visuels découpés depuis les maquettes (750 px de large). */
export const imageMeta = {
  dashboardHero: { width: 750, height: 774, circle: { cx: 375, cy: 347, r: 240 } },
  illusClouds: { width: 702, height: 852, circle: { cx: 351, cy: 392, r: 258 } },
  illusMission: { width: 702, height: 867 },
  serviceBanner: { width: 722, height: 160 },
} as const;
