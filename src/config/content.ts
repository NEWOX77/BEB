/**
 * Tous les textes et médias du film, modifiables ici sans toucher aux animations.
 *
 * Convention : un passage entre crochets est mis en accent orange, ex. 'D’[ÉNERGIE.]'
 * (règle unique : le mot-clé de chaque titre, comme le « E » orange du logo).
 * Espaces :   = insécable,   = fine insécable (typographie française).
 *
 * Sources des informations factuelles (aucune donnée inventée) :
 * - « neuf et occasion », « de 40 à 2 500 kVA », « SAV 24h/24 et 7j/7 », « 5 agences »,
 *   villes, téléphone : site groupe-beb.com (fichier HTML fourni).
 * - « groupe-beb.com » : également imprimé sur les machines photographiées.
 */

export type MediaKey = keyof typeof MEDIA;

/** Photos réelles fournies (dimensions en pixels source). */
export const MEDIA = {
  g330_34: {src: 'media/beb-330kva-34-fond-noir.jpg', w: 2000, h: 1329, label: 'Groupe 330 kVA (305-13), vue 3/4'},
  g66_34: {src: 'media/beb-66kva-34-fond-noir.jpg', w: 2000, h: 1331, label: 'Groupe 66 kVA (60-04), vue 3/4'},
  g66_34_cut: {src: 'media/beb-66kva-34-detoure.png', w: 2000, h: 1331, label: 'Groupe 66 kVA, vue 3/4, détouré'},
  g66_face: {src: 'media/beb-66kva-face-fond-noir.jpg', w: 2000, h: 1331, label: 'Groupe 66 kVA, face'},
  g66_face_cut: {src: 'media/beb-66kva-face-detoure.png', w: 2000, h: 1331, label: 'Groupe 66 kVA, face, détouré'},
} as const;

/** Cadrage d'une photo : point source (cx, cy) placé au centre du cadre, à l'échelle `scale`. */
export type View = {cx: number; cy: number; scale: number};

export const HOOK = {
  lines: ['VOS PROJETS'],
  lines2: ['ONT BESOIN', 'D’[ÉNERGIE.]'],
  media: 'g330_34' as MediaKey,
  // Détail serré : panneau de commande, baseline, prises et grilles du 330 kVA
  viewFrom: {cx: 640, cy: 540, scale: 1.5} as View,
  viewTo: {cx: 610, cy: 540, scale: 1.5} as View,
};

export const REVEAL = {
  lines: ['NOUS LA METTONS', 'EN [ACTION.]'],
  media: 'g66_34_cut' as MediaKey,
  /** Boîte englobante de la machine dans la photo détourée (calculée par make_cutouts.py). */
  bbox: {x: 406, y: 122, w: 1169, h: 1084},
};

export type Expertise = {
  id: 'vente' | 'location' | 'maintenance';
  index: string;
  word: string;
  sub: string[];
  tag: string;
  theme: 'dark' | 'light';
  media: MediaKey;
  viewFrom: View;
  viewTo: View;
  /** Détail technique encadré par le tracé (coordonnées source), optionnel. */
  marker?: {x: number; y: number; w: number; h: number};
};

export const EXPERTISES: Expertise[] = [
  {
    id: 'vente',
    index: '01',
    word: 'VENTE',
    sub: ['La puissance adaptée', 'à vos besoins.'],
    tag: 'NEUF ET OCCASION',
    theme: 'dark',
    media: 'g330_34',
    // Le plus gros groupe, cadré sans le marquage « LOUEUR » : mouvement vertical (élévation)
    viewFrom: {cx: 810, cy: 660, scale: 0.9},
    viewTo: {cx: 810, cy: 600, scale: 0.9},
  },
  {
    id: 'location',
    index: '02',
    word: 'LOCATION',
    sub: ['L’énergie au rythme', 'de vos projets.'],
    tag: 'DE 40 À 2 500 kVA',
    theme: 'light',
    media: 'g66_face_cut',
    // Marquage réel « LOUEUR D’ÉNERGIE » + numéro de parc « 60-04 » : travelling latéral
    viewFrom: {cx: 1080, cy: 640, scale: 0.68},
    viewTo: {cx: 990, cy: 640, scale: 0.68},
  },
  {
    id: 'maintenance',
    index: '03',
    word: 'MAINTENANCE',
    sub: ['La fiabilité', 's’entretient.'],
    tag: 'SAV 24H/24 · 7J/7',
    theme: 'dark',
    media: 'g66_34',
    // Tableau de commande, disjoncteurs et prises : poussée lente + mise au point
    viewFrom: {cx: 690, cy: 470, scale: 1.42},
    viewTo: {cx: 690, cy: 470, scale: 1.56},
    marker: {x: 592, y: 244, w: 190, h: 118},
  },
];

/** Plans du montage « À VOS CÔTÉS. » — uniquement des détails réels des machines fournies. */
export const TERRAIN_SHOTS: {media: MediaKey; from: View; to: View; caption: string}[] = [
  {media: 'g330_34', from: {cx: 470, cy: 430, scale: 1.55}, to: {cx: 500, cy: 430, scale: 1.55}, caption: 'Panneau de commande 330 kVA'},
  {media: 'g66_face', from: {cx: 560, cy: 1050, scale: 1.55}, to: {cx: 530, cy: 1050, scale: 1.55}, caption: 'Numéro de parc 60-04'},
  {media: 'g330_34', from: {cx: 930, cy: 470, scale: 1.35}, to: {cx: 960, cy: 470, scale: 1.35}, caption: 'Grilles et portes 330 kVA'},
  {media: 'g66_34', from: {cx: 690, cy: 400, scale: 1.7}, to: {cx: 660, cy: 400, scale: 1.7}, caption: 'Contrôleur 66 kVA'},
  {media: 'g66_34', from: {cx: 600, cy: 700, scale: 1.65}, to: {cx: 630, cy: 700, scale: 1.65}, caption: 'Prises et disjoncteurs'},
  {media: 'g330_34', from: {cx: 790, cy: 1040, scale: 1.4}, to: {cx: 760, cy: 1040, scale: 1.4}, caption: 'Numéro de parc 305-13'},
];

/** Emplacements prévus pour les vraies photos de terrain (version de travail). */
export const TERRAIN_PLACEHOLDERS = [
  'Intervention d’un technicien BEB',
  'Groupe installé sur site client',
  'Livraison / mise en place',
  'Raccordement électrique',
  'Atelier de maintenance',
  'Équipe BEB sur le terrain',
];

export const TERRAIN = {
  line1: 'À VOS CÔTÉS.',
  line2: 'SUR LE [TERRAIN.]',
  networkLabel: '5 AGENCES · GRAND OUEST',
  /** Coordonnées GPS des 5 villes d'agences citées sur le site (ordre de tracé du réseau). */
  agencies: [
    {name: 'BREST', lat: 48.3904, lon: -4.4861, labelSide: 'below'},
    {name: 'SAINT-BRIEUC', lat: 48.5142, lon: -2.7653, labelSide: 'above'},
    {name: 'RENNES', lat: 48.1173, lon: -1.6778, labelSide: 'above'},
    {name: 'NANTES', lat: 47.2184, lon: -1.5536, labelSide: 'left'},
    {name: 'LORIENT', lat: 47.7483, lon: -3.3700, labelSide: 'below'},
  ] as {name: string; lat: number; lon: number; labelSide: 'above' | 'below' | 'left' | 'right'}[],
};

export const SIGNATURE = {
  lines: ['L’énergie', 'des possibles.'],
};

export const CTA = {
  lines: ['UN PROJET ?'],
  lines2: ['PARLONS', '[ÉNERGIE.]'],
  phone: '09 73 44 55 55',
  website: 'groupe-beb.com',
};
