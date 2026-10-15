import {Easing, interpolate} from 'remotion';

/**
 * Courbes de mouvement du film. Pas de rebond : décélérations franches,
 * entrées nettes, sorties qui anticipent légèrement.
 */
export const EASE = {
  /** Arrivée : forte décélération, arrêt net (texte, révélations). */
  out: Easing.bezier(0.16, 1, 0.3, 1),
  /** Transition : accélère puis freine (balayages du tracé). */
  inOut: Easing.bezier(0.76, 0, 0.24, 1),
  /** Sortie : départ lent, fin rapide. */
  in: Easing.bezier(0.7, 0, 0.84, 0),
  /** Sortie avec anticipation discrète (léger recul avant de partir). */
  anticipate: Easing.bezier(0.55, -0.18, 0.75, 0),
  /** Mouvements de caméra lents et continus. */
  drift: Easing.bezier(0.33, 0, 0.67, 1),
  linear: Easing.linear,
};

/** Progression 0→1 entre `start` et `start + duration`, bornée. */
export const progress = (frame: number, start: number, duration: number, easing = EASE.out) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Vitesse instantanée (unités / image) d'une valeur animée, pour le flou de mouvement. */
export const velocity = (f: (frame: number) => number, frame: number) => (f(frame + 0.5) - f(frame - 0.5));
