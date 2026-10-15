import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COLORS, FONT_FAMILY, LAYOUT, withAlpha} from '../config/brand';
import {PROXIMITE} from '../config/content';
import {MAP_COAST, MAP_RINGS, MAP_SIZE, project} from '../data/grandOuest';
import {EnergyLayer, EnergyPath} from '../components/EnergyPath';
import {Label} from '../components/Kinetic';
import {RevealLines} from '../components/RevealLines';
import {fitFontSize} from '../lib/fonts';
import {EASE, progress} from '../lib/motion';
import {localCue} from '../lib/timeline';

const MAP_TOP = 560;
const S = LAYOUT.contentWidth / MAP_SIZE.w;
const toXY = ([x, y]: [number, number]): [number, number] => [LAYOUT.marginX + x * S, MAP_TOP + y * S];

/** 17–22 s — « PROCHES DE VOUS. » : le tracé dessine la côte réelle, les 5 agences s'allument et se relient. */
export const Proximite: React.FC = () => {
  const frame = useCurrentFrame();
  const coastAt = localCue('proximite', 'proximite.coast');
  const agAt = [1, 2, 3, 4, 5].map((i) => localCue('proximite', `proximite.a${i}`));
  const labelAt = localCue('proximite', 'proximite.label');
  const fs = fitFontSize(PROXIMITE.title[0], LAYOUT.contentWidth, 700, 150, -0.02);

  const rings = MAP_RINGS.map((r) => `M ${r.map((p) => toXY(p).map((v) => v.toFixed(1)).join(' ')).join(' L ')} Z`);
  const coastLines = MAP_COAST.map((r) => `M ${r.map((p) => toXY(p).map((v) => v.toFixed(1)).join(' ')).join(' L ')}`);
  const coast = progress(frame, coastAt, 30, EASE.inOut);
  const fill = progress(frame, coastAt + 20, 16, EASE.out);
  const pts = PROXIMITE.agencies.map((a) => ({...a, xy: toXY(project(a.lat, a.lon))}));
  // Le réseau : Brest → Saint-Brieuc → Rennes → Nantes → Lorient → Brest
  const order = [0, 1, 2, 4, 3, 0];
  const net = `M ${order.map((i) => pts[i].xy.map((v) => v.toFixed(1)).join(' ')).join(' L ')}`;
  const netP = progress(frame, agAt[4] + 4, 26, EASE.inOut);
  const halo = progress(frame, labelAt, 18, EASE.out);

  return (
    <AbsoluteFill style={{background: COLORS.black}}>
      <div style={{position: 'absolute', left: LAYOUT.marginX, top: 268}}>
        <RevealLines lines={PROXIMITE.title} start={4} fontSize={fs} stagger={5} duration={12} />
      </div>

      <EnergyLayer>
        <defs>
          <linearGradient id="beb-land-fade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0.7" stopColor="#fff" stopOpacity={1} />
            <stop offset="1" stopColor="#fff" stopOpacity={0} />
          </linearGradient>
          <mask id="beb-land-mask" maskUnits="userSpaceOnUse" x={0} y={0} width={1080} height={1920}>
            <rect x={LAYOUT.marginX} y={MAP_TOP} width={LAYOUT.contentWidth} height={MAP_SIZE.h * S} fill="url(#beb-land-fade)" />
          </mask>
          <radialGradient id="beb-halo">
            <stop offset="0%" stopColor={COLORS.orange} stopOpacity={0.35} />
            <stop offset="100%" stopColor={COLORS.orange} stopOpacity={0} />
          </radialGradient>
        </defs>
        <g mask="url(#beb-land-mask)">
          {rings.map((d, i) => (
            <path key={`f${i}`} d={d} fill={withAlpha(COLORS.white, 0.08 * fill)} stroke="none" />
          ))}
        </g>
        {pts.map((p, i) => (
          <circle key={`h${i}`} cx={p.xy[0]} cy={p.xy[1]} r={150 * halo} fill="url(#beb-halo)" opacity={halo} />
        ))}
        <g mask="url(#beb-land-mask)">
          {coastLines.map((d, i) => (
            <EnergyPath key={`c${i}`} d={d} to={coast} width={3} color={withAlpha(COLORS.white, 0.85)} head={false} />
          ))}
        </g>
        <EnergyPath d={net} to={netP} width={4} />
        {pts.map((p, i) => {
          const pop = progress(frame, agAt[i], 8, EASE.out);
          if (pop <= 0) return null;
          // onde de proximité qui se répète toutes les 30 images
          const cyc = ((frame - agAt[i]) % 30) / 30;
          return (
            <g key={p.name}>
              <circle cx={p.xy[0]} cy={p.xy[1]} r={14 + 46 * cyc} fill="none" stroke={COLORS.orange} strokeWidth={3} opacity={(1 - cyc) * 0.8} />
              <circle cx={p.xy[0]} cy={p.xy[1]} r={16 * (0.4 + 0.6 * pop) * (1 + 0.5 * (1 - pop))} fill={COLORS.orange} />
              <circle cx={p.xy[0]} cy={p.xy[1]} r={6} fill={COLORS.white} />
            </g>
          );
        })}
      </EnergyLayer>

      {pts.map((p, i) => {
        const lit = progress(frame, agAt[i] + 1, 10, EASE.out);
        const [x, y] = p.xy;
        const pos: React.CSSProperties =
          p.side === 'above'
            ? {left: x - 200, top: y - 70, width: 400, textAlign: 'center'}
            : p.side === 'below'
              ? {left: x - 200, top: y + 30, width: 400, textAlign: 'center'}
              : p.side === 'left'
                ? {left: x - 432, top: y - 20, width: 400, textAlign: 'right'}
                : {left: x + 32, top: y - 20, width: 400, textAlign: 'left'};
        return (
          <div
            key={p.name}
            style={{
              position: 'absolute',
              ...pos,
              fontFamily: FONT_FAMILY,
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: COLORS.white,
              opacity: lit,
              transform: `translateY(${(1 - lit) * 10}px)`,
            }}
          >
            <span style={{background: withAlpha(COLORS.black, 0.82), padding: '4px 10px'}}>{p.name}</span>
          </div>
        );
      })}

      <div style={{position: 'absolute', left: LAYOUT.marginX, top: MAP_TOP + MAP_SIZE.h * S + 40, opacity: progress(frame, labelAt, 10, EASE.out), transform: `translateY(${(1 - progress(frame, labelAt, 14, EASE.out)) * 16}px)`}}>
        <Label size={34}>{PROXIMITE.label}</Label>
      </div>
    </AbsoluteFill>
  );
};
