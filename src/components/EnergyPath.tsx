import React from 'react';
import {getLength, getPointAtLength} from '@remotion/paths';
import {COLORS} from '../config/brand';

/**
 * Le tracé d'énergie : un trait orange qui se dessine le long d'un chemin.
 * `from`/`to` (0 → 1) bornent la portion visible : la tête avance, la queue peut la rattraper.
 * À utiliser à l'intérieur de <EnergyLayer>.
 */
export const EnergyPath: React.FC<{
  d: string;
  from?: number;
  to: number;
  width?: number;
  color?: string;
  head?: boolean;
  opacity?: number;
}> = ({d, from = 0, to, width = 6, color = COLORS.orange, head = true, opacity = 1}) => {
  const L = getLength(d);
  const a = Math.max(0, Math.min(1, from));
  const b = Math.max(0, Math.min(1, to));
  if (b <= a || L <= 0) return null;
  const visible = (b - a) * L;
  const tip = getPointAtLength(d, b * L);
  return (
    <g opacity={opacity}>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinejoin="miter"
        strokeLinecap="butt"
        strokeDasharray={`${visible} ${L + 2}`}
        strokeDashoffset={-a * L}
      />
      {head && tip && b < 0.999 ? <Head x={tip.x} y={tip.y} size={width} /> : null}
    </g>
  );
};

/** Point chaud en tête de tracé : cœur clair, halo court. Sobre, sans particules. */
export const Head: React.FC<{x: number; y: number; size: number; intensity?: number}> = ({x, y, size, intensity = 1}) => (
  <g opacity={intensity}>
    <circle cx={x} cy={y} r={size * 4.5} fill="url(#beb-head-glow)" />
    <circle cx={x} cy={y} r={size * 0.7} fill={COLORS.white} />
  </g>
);

/** Ligne de balayage (transition) avec traînée = flou de mouvement dans le sens du déplacement. */
export const SweepLine: React.FC<{
  axis: 'x' | 'y';
  pos: number;
  velocity: number;
  length: number;
  width?: number;
  start?: number;
}> = ({axis, pos, velocity, length, width = 6, start = 0}) => {
  const trail = Math.min(260, Math.abs(velocity) * 2.2);
  const dir = Math.sign(velocity) || 1;
  if (axis === 'y') {
    return (
      <g>
        {trail > 2 ? (
          <rect
            x={start}
            y={dir > 0 ? pos - trail : pos}
            width={length}
            height={trail}
            fill={`url(#beb-trail-${dir > 0 ? 'down' : 'up'})`}
          />
        ) : null}
        <rect x={start} y={pos - width / 2} width={length} height={width} fill={COLORS.orange} />
      </g>
    );
  }
  return (
    <g>
      {trail > 2 ? (
        <rect
          x={dir > 0 ? pos - trail : pos}
          y={start}
          width={trail}
          height={length}
          fill={`url(#beb-trail-${dir > 0 ? 'right' : 'left'})`}
        />
      ) : null}
      <rect x={pos - width / 2} y={start} width={width} height={length} fill={COLORS.orange} />
    </g>
  );
};

/** Calque SVG plein cadre + dégradés partagés du tracé. */
export const EnergyLayer: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <svg
    width={1080}
    height={1920}
    viewBox="0 0 1080 1920"
    style={{position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none', ...style}}
  >
    <defs>
      <radialGradient id="beb-head-glow">
        <stop offset="0%" stopColor="#ffffff" stopOpacity={0.9} />
        <stop offset="22%" stopColor={COLORS.orange} stopOpacity={0.75} />
        <stop offset="100%" stopColor={COLORS.orange} stopOpacity={0} />
      </radialGradient>
      {(
        [
          ['down', 0, 0, 0, 1],
          ['up', 0, 1, 0, 0],
          ['right', 0, 0, 1, 0],
          ['left', 1, 0, 0, 0],
        ] as const
      ).map(([id, x1, y1, x2, y2]) => (
        <linearGradient key={id} id={`beb-trail-${id}`} x1={x1} y1={y1} x2={x2} y2={y2}>
          <stop offset="0%" stopColor={COLORS.orange} stopOpacity={0} />
          <stop offset="100%" stopColor={COLORS.orange} stopOpacity={0.45} />
        </linearGradient>
      ))}
    </defs>
    {children}
  </svg>
);
