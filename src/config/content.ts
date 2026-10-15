/**
 * Tous les textes du film, modifiables ici sans toucher aux animations.
 *
 * Convention : un passage entre crochets passe en accent orange, ex. 'D’[ÉNERGIE] ?'.
 * Espaces :   = insécable,   = fine insécable (typographie française).
 *
 * Sources — site groupe-beb.com (fichier HTML fourni) :
 *  chiffres des compteurs (data-to-value) : 40 années d’expérience, 39 collaborateurs,
 *  1 300 contrats d’entretien dans l’ouest, 15 000 m² d’atelier et de stockage, 5 agences ;
 *  « Solutions clé en main », « vente, location, maintenance », « Groupes électrogènes de 40 à 2 500 kVA,
 *  insonorisé, stage V », « Compresseurs thermiques […] de 5 000 à 25 000 litres/mn »,
 *  « Mâts d’éclairage autonomes […] BTP, industrie, évènementiel », accessoires,
 *  « URGENCE H24 7/7 », « techniciens pouvant intervenir 24h/24 et 7j/7 », « PRÉVOIR LES IMPRÉVUS »,
 *  « quel que soit le contexte », « Demander un devis », 09 73 44 55 55, villes des agences.
 *  « Leader en Bretagne » : affirmation fournie par BEB (à pouvoir justifier en cas de diffusion publicitaire).
 */

export const HOOK = {
  label: 'QUEL QUE SOIT LE CONTEXTE',
  /** Mots qui défilent sur les croches, chacun sur un aplat différent. */
  words: ['CHANTIER.', 'ÉVÉNEMENT.', 'INDUSTRIE.', 'URGENCE.'],
  question: ['BESOIN', 'D’[ÉNERGIE] ?'],
  answer: ['BEB', 'S’EN [CHARGE.]'],
};

export const LEADER = {
  kicker: 'BEB,',
  word: 'LEADER',
  line: 'EN BRETAGNE',
  sub: ['Depuis 40 ans, l’énergie', 'des professionnels.'],
};

export const STATS = {
  label: 'BEB EN CHIFFRES',
  items: [
    {value: 40, suffix: '', label: 'ANS D’EXPÉRIENCE'},
    {value: 39, suffix: '', label: 'COLLABORATEURS'},
    {value: 1300, suffix: '', label: 'CONTRATS D’ENTRETIEN'},
    {value: 15000, suffix: ' m²', label: 'D’ATELIER ET DE STOCKAGE'},
  ],
};

export const METIERS = {
  label: 'SOLUTIONS CLÉ EN MAIN',
  words: ['VENTE[.]', 'LOCATION[.]', 'MAINTENANCE[.]'],
};

export type Picto = 'generator' | 'compressor' | 'mast';

export const MATERIELS = {
  label: 'EN LOCATION',
  cards: [
    {picto: 'generator' as Picto, name: ['GROUPES', 'ÉLECTROGÈNES'], spec: 'DE 40 À 2 500 kVA', tag: 'INSONORISÉS · STAGE V'},
    {picto: 'compressor' as Picto, name: ['COMPRESSEURS', 'THERMIQUES'], spec: '5 000 À 25 000 L/MIN', tag: 'INSONORISÉS · STAGE V'},
    {picto: 'mast' as Picto, name: ['MÂTS', 'D’ÉCLAIRAGE'], spec: 'AUTONOMES', tag: 'BTP · INDUSTRIE · ÉVÉNEMENTIEL'},
  ],
  ticker: 'BANCS DE CHARGE · CUVES GNR · ARMOIRES DE DISTRIBUTION · COFFRETS · CÂBLES BT · ',
};

export const PROXIMITE = {
  title: ['PROCHES', 'DE [VOUS.]'],
  label: '5 AGENCES DANS LE GRAND OUEST',
  /** Coordonnées GPS réelles des villes d'agences. `side` : position de l'étiquette. */
  agencies: [
    {name: 'BREST', lat: 48.3904, lon: -4.4861, side: 'below'},
    {name: 'SAINT-BRIEUC', lat: 48.5142, lon: -2.7653, side: 'above'},
    {name: 'RENNES', lat: 48.1173, lon: -1.6778, side: 'right'},
    {name: 'LORIENT', lat: 47.7483, lon: -3.37, side: 'below'},
    {name: 'NANTES', lat: 47.2184, lon: -1.5536, side: 'left'},
  ] as {name: string; lat: number; lon: number; side: 'above' | 'below' | 'left' | 'right'}[],
};

export const ASTREINTE = {
  center: 'H24',
  word: 'ASTREINTE',
  line: '24H/24 · [7J/7]',
  sub: 'Nos techniciens interviennent jour et nuit.',
};

export const REACTIVITE = {
  word: 'RÉACTIVITÉ.',
  sub: ['Une source d’énergie fiable,', 'en toutes circonstances.'],
  slogan: ['PRÉVOIR', 'LES [IMPRÉVUS.]'],
};

export const DEVIS = {
  lines: ['UN PROJET ?', 'UNE [URGENCE ?]'],
  button: 'DEMANDEZ VOTRE DEVIS',
  phone: '09 73 44 55 55',
  website: 'groupe-beb.com',
  ticker: 'L’ÉNERGIE DES POSSIBLES · ',
};
