/**
 * Charte BEB — valeurs relevées dans les fichiers fournis, jamais inventées.
 * - CharteGraphiqueBEB.pdf, p.5 « couleurs » (RVB digital) et p.6 « typographie ».
 * - Site groupe-beb.com (fichier HTML fourni) : mêmes #130f14 / #ea5614 / #ffffff + gris #e2e2e4.
 */
export const COLORS = {
  black: '#130f14',
  orange: '#ea5614',
  white: '#ffffff',
  grey: '#e2e2e4',
} as const;

export const FONT_FAMILY = 'Space Grotesk';

export const VIDEO = {width: 1080, height: 1920, fps: 30} as const;

/**
 * Grille de mise en page. Zone utile « réseaux sociaux » : les éléments importants
 * restent entre y = 260 et y = 1480 (interfaces Reels / LinkedIn en haut et en bas)
 * et à l'intérieur des marges latérales de 96 px.
 */
export const LAYOUT = {
  marginX: 96,
  contentWidth: 888,
  safe: {top: 260, bottom: 1480, left: 96, right: 984},
} as const;

/** Transparence sur une couleur de la charte (pas de nouvelle teinte). */
export const withAlpha = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};
