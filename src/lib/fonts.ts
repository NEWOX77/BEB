import {loadFont} from '@remotion/fonts';
import {continueRender, delayRender, staticFile} from 'remotion';
import {FONT_FAMILY} from '../config/brand';

/** Space Grotesk (charte p.6), fichiers locaux — licence SIL OFL (public/fonts/OFL-LICENSE.txt). */
const WEIGHTS = [300, 400, 500, 600, 700] as const;

export const fontsLoaded: Promise<void> = Promise.all(
  WEIGHTS.map((w) =>
    loadFont({
      family: FONT_FAMILY,
      url: staticFile(`fonts/space-grotesk-latin-${w}-normal.woff2`),
      weight: String(w),
    }),
  ),
).then(() => undefined);

// Aucune image n'est capturée avant le chargement des polices.
const handle = delayRender('Chargement de Space Grotesk');
fontsLoaded.then(() => continueRender(handle));

let canvas: HTMLCanvasElement | null = null;

/** Largeur d'un texte en px (police chargée), interlettrage en em compris. */
export const measure = (text: string, fontSize: number, weight: number, letterSpacingEm = 0) => {
  canvas = canvas ?? document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  ctx.font = `${weight} ${fontSize}px "${FONT_FAMILY}"`;
  const plain = text.replace(/[[\]]/g, '');
  return ctx.measureText(plain).width + letterSpacingEm * fontSize * Math.max(0, [...plain].length - 1);
};

/** Corps maximal pour que `text` tienne dans `maxWidth`. */
export const fitFontSize = (text: string, maxWidth: number, weight: number, maxSize: number, letterSpacingEm = 0) => {
  const w100 = measure(text, 100, weight, letterSpacingEm);
  return Math.min(maxSize, Math.floor((maxWidth / w100) * 100));
};

import {useEffect, useState} from 'react';

/** Bloque le rendu tant que les polices ne sont pas prêtes (mesures de texte fiables). */
export const useFontsReady = () => {
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender('Polices prêtes pour la mise en page'));
  useEffect(() => {
    fontsLoaded.then(() => setReady(true));
  }, []);
  useEffect(() => {
    if (ready) continueRender(handle);
  }, [ready, handle]);
  return ready;
};
