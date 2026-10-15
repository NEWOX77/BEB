import React from 'react';
import {COLORS} from '../config/brand';
import {Picto as PictoKind} from '../config/content';

/**
 * Pictogrammes au trait (schémas, pas des représentations réalistes),
 * dessinés progressivement par le tracé d'énergie. Coins chanfreinés comme le logo.
 */
const circle = (cx: number, cy: number, r: number) => `M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0`;

const PATHS: Record<PictoKind, string[]> = {
  generator: [
    'M 40 90 H 330 L 370 130 V 250 H 40 Z',
    'M 20 275 H 390',
    'M 60 250 V 275 M 350 250 V 275',
    'M 75 130 H 150 M 75 160 H 150 M 75 190 H 150 M 75 220 H 150',
    'M 190 125 H 330 V 225 H 190 Z',
    'M 212 145 H 262 V 180 H 212 Z',
    'M 290 90 V 55 H 318',
  ],
  compressor: [
    'M 70 95 H 300 L 345 140 V 235 H 70 Z',
    'M 130 95 V 72 H 250 V 95',
    'M 100 135 H 180 M 100 165 H 180 M 100 195 H 180',
    'M 215 130 H 305 V 200 H 215 Z',
    circle(210, 262, 30),
    'M 70 215 L 15 250 M 35 237 V 285',
  ],
  mast: [
    'M 200 250 V 70',
    'M 120 70 H 280',
    'M 120 25 H 190 V 70 M 210 70 V 25 H 280 V 70 M 120 25 V 70',
    'M 135 90 L 115 125 M 165 90 L 160 125 M 235 90 L 240 125 M 265 90 L 285 125',
    'M 120 250 H 300 L 320 270 V 290 H 120 Z',
    'M 120 270 L 60 300 M 300 280 L 360 300',
    circle(210, 300, 16),
  ],
};

export const Picto: React.FC<{kind: PictoKind; progress: number; width: number; stroke?: number}> = ({kind, progress, width, stroke = 7}) => {
  const paths = PATHS[kind];
  const n = paths.length;
  return (
    <svg width={width} height={(width * 320) / 400} viewBox="0 0 400 320" style={{display: 'block', overflow: 'visible'}}>
      {paths.map((d, i) => {
        // chaque trait commence un peu après le précédent
        const p = Math.max(0, Math.min(1, progress * (1 + (n - 1) * 0.35) - i * 0.35));
        if (p <= 0) return null;
        return (
          <path
            key={i}
            d={d}
            pathLength={1}
            fill="none"
            stroke={i === 0 ? COLORS.orange : COLORS.white}
            strokeWidth={i === 0 ? stroke * 1.25 : stroke}
            strokeLinejoin="miter"
            strokeLinecap="square"
            strokeDasharray="1 1"
            strokeDashoffset={1 - p}
          />
        );
      })}
    </svg>
  );
};
