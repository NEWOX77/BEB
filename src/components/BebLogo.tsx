import React, {useId} from 'react';
import {COLORS} from '../config/brand';
import {LOGO_B_HEIGHT, LOGO_LETTERS, LOGO_VIEWBOX} from '../brand/logoPaths';

/** Abscisses (unités du viewBox) de chaque lettre B · E · B, pour les masques de révélation. */
const LETTER_X: [number, number][] = [
  [177.6, 231.8],
  [238.4, 292.6],
  [297.3, 351.5],
];

type Props = {
  width: number;
  /** Révélation de chaque lettre (0 → 1). Masque vertical + légère montée, jamais de déformation. */
  reveal?: [number, number, number];
  style?: React.CSSProperties;
};

/** Hauteur affichée et zone de protection (= hauteur du B, charte p.2) pour une largeur donnée. */
export const logoMetrics = (width: number) => {
  const k = width / LOGO_VIEWBOX.width;
  return {height: LOGO_VIEWBOX.height * k, protection: LOGO_B_HEIGHT * k};
};

/** Logo BEB sans baseline, tracés exacts de la charte. */
export const BebLogo: React.FC<Props> = ({width, reveal = [1, 1, 1], style}) => {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const {height} = logoMetrics(width);
  const vb = LOGO_VIEWBOX;
  return (
    <svg
      width={width}
      height={height}
      viewBox={`${vb.x} ${vb.y} ${vb.width} ${vb.height}`}
      style={{display: 'block', overflow: 'visible', ...style}}
    >
      <defs>
        {LETTER_X.map(([x0, x1], i) => {
          const p = Math.max(0, Math.min(1, reveal[i]));
          return (
            <clipPath id={`${uid}c${i}`} key={i}>
              <rect x={x0} y={vb.y + vb.height * (1 - p) - 0.5} width={x1 - x0} height={vb.height * p + 1} />
            </clipPath>
          );
        })}
      </defs>
      {LOGO_LETTERS.map((l, i) => {
        const p = Math.max(0, Math.min(1, reveal[i]));
        if (p <= 0) return null;
        return (
          <g key={i} clipPath={p < 1 ? `url(#${uid}c${i})` : undefined}>
            <path
              d={l.d}
              fill={l.color === 'orange' ? COLORS.orange : COLORS.white}
              transform={`translate(0 ${((1 - p) * vb.height * 0.35).toFixed(3)})`}
            />
          </g>
        );
      })}
    </svg>
  );
};
