import React, {useId} from 'react';
import {COLORS} from '../config/brand';
import {LOGO_BASELINE_GLYPHS, LOGO_BASELINE_VIEWBOX, LOGO_B_HEIGHT, LOGO_LETTERS, LOGO_VIEWBOX} from '../brand/logoPaths';

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
  /** Si défini : version « avec base-line » de la charte, révélée de gauche à droite (0 → 1). */
  baseline?: number;
  style?: React.CSSProperties;
};

/** Hauteur affichée et zone de protection (= hauteur du B, charte p.2) pour une largeur donnée. */
export const logoMetrics = (width: number, withBaseline = false) => {
  const k = width / LOGO_VIEWBOX.width;
  return {height: (withBaseline ? LOGO_BASELINE_VIEWBOX.height : LOGO_VIEWBOX.height) * k, protection: LOGO_B_HEIGHT * k};
};

/** Logo BEB, tracés exacts de la charte. */
export const BebLogo: React.FC<Props> = ({width, reveal = [1, 1, 1], baseline, style}) => {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const withBase = baseline !== undefined;
  const vb = withBase ? LOGO_BASELINE_VIEWBOX : LOGO_VIEWBOX;
  const {height} = logoMetrics(width, withBase);
  const lh = LOGO_VIEWBOX.height;
  const bp = Math.max(0, Math.min(1, baseline ?? 0));
  return (
    <svg width={width} height={height} viewBox={`${vb.x} ${vb.y} ${vb.width} ${vb.height}`} style={{display: 'block', overflow: 'visible', ...style}}>
      <defs>
        {LETTER_X.map(([x0, x1], i) => {
          const p = Math.max(0, Math.min(1, reveal[i]));
          return (
            <clipPath id={`${uid}c${i}`} key={i}>
              <rect x={x0} y={LOGO_VIEWBOX.y + lh * (1 - p) - 0.5} width={x1 - x0} height={lh * p + 1} />
            </clipPath>
          );
        })}
        <clipPath id={`${uid}base`}>
          <rect x={vb.x - 1} y={LOGO_VIEWBOX.y + lh} width={(vb.width + 2) * bp} height={vb.height} />
        </clipPath>
      </defs>
      {LOGO_LETTERS.map((l, i) => {
        const p = Math.max(0, Math.min(1, reveal[i]));
        if (p <= 0) return null;
        return (
          <g key={i} clipPath={p < 1 ? `url(#${uid}c${i})` : undefined}>
            <path d={l.d} fill={l.color === 'orange' ? COLORS.orange : COLORS.white} transform={`translate(0 ${((1 - p) * lh * 0.35).toFixed(3)})`} />
          </g>
        );
      })}
      {withBase && bp > 0 ? (
        <g clipPath={`url(#${uid}base)`}>
          {LOGO_BASELINE_GLYPHS.map((g, i) => (
            <path key={i} d={g.d} fill={COLORS.orange} transform={`translate(${g.x} ${g.y})`} />
          ))}
        </g>
      ) : null}
    </svg>
  );
};
