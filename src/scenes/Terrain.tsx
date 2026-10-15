import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COLORS, FONT_FAMILY, LAYOUT, withAlpha} from '../config/brand';
import {EXPERTISES, TERRAIN, TERRAIN_PLACEHOLDERS, TERRAIN_SHOTS} from '../config/content';
import {EnergyLayer, EnergyPath} from '../components/EnergyPath';
import {Photo, lerpView} from '../components/Photo';
import {Placeholder} from '../components/Placeholder';
import {RevealLines} from '../components/RevealLines';
import {fitFontSize} from '../lib/fonts';
import {Pt, Rect, chamferClip, chamferFrame, lerpRect} from '../lib/geometry';
import {EASE, lerp, progress} from '../lib/motion';
import {localCue} from '../lib/timeline';
import {markerRect} from './Expertise';

/** Fenêtre du montage : le tracé devient cadre. */
export const WINDOW: Rect = {x: LAYOUT.marginX, y: 560, w: LAYOUT.contentWidth, h: 720};
export const WINDOW_CHAMFER = 22;
const TEXT_TOP = 300;

/** Projection équirectangulaire (corrigée de la latitude) des agences dans la fenêtre. */
const projectAgencies = () => {
  const k = Math.cos((48 * Math.PI) / 180);
  const raw = TERRAIN.agencies.map((a) => ({...a, px: a.lon * k, py: -a.lat}));
  const minX = Math.min(...raw.map((a) => a.px));
  const maxX = Math.max(...raw.map((a) => a.px));
  const minY = Math.min(...raw.map((a) => a.py));
  const maxY = Math.max(...raw.map((a) => a.py));
  const availW = WINDOW.w - 240;
  const availH = WINDOW.h - 280;
  const s = Math.min(availW / (maxX - minX), availH / (maxY - minY));
  const ox = WINDOW.x + (WINDOW.w - (maxX - minX) * s) / 2;
  const oy = WINDOW.y + (WINDOW.h - (maxY - minY) * s) / 2;
  return raw.map((a) => ({...a, x: ox + (a.px - minX) * s, y: oy + (a.py - minY) * s}));
};

/**
 * 16–22 s — LE TERRAIN
 * « À VOS CÔTÉS. » : montage au tempo (1 plan par temps) de détails réels des machines, dans un cadre tracé.
 * « SUR LE TERRAIN. » : le tracé relie les 5 agences BEB du Grand Ouest (positions géographiques réelles).
 */
export const Terrain: React.FC<{variant: 'main' | 'draft'}> = ({variant}) => {
  const frame = useCurrentFrame();
  const cuts = [
    0,
    localCue('terrain', 'terrain.cut2'),
    localCue('terrain', 'terrain.cut3'),
    localCue('terrain', 'terrain.cut4'),
    localCue('terrain', 'terrain.cut5'),
    localCue('terrain', 'terrain.cut6'),
  ];
  const phase2 = localCue('terrain', 'terrain.l2');
  const nodes = [1, 2, 3, 4, 5].map((i) => localCue('terrain', `terrain.node${i}`));
  const exitAt = 162;

  // Cadre : le repère technique de la maintenance s'agrandit en fenêtre de montage
  const from = markerRect(EXPERTISES[2], 90) ?? WINDOW;
  const grow = progress(frame, 0, 14, EASE.inOut);
  const rect = lerpRect(from, WINDOW, grow);
  const chamfer = lerp(12, WINDOW_CHAMFER, grow);

  // Montage : un plan par temps, léger glissement alterné dans chaque plan
  const shotIndex = Math.max(0, cuts.filter((c) => frame >= c).length - 1);
  const shotStart = cuts[shotIndex];
  const shotEnd = shotIndex < cuts.length - 1 ? cuts[shotIndex + 1] : phase2;
  const shot = TERRAIN_SHOTS[shotIndex];
  const shotView = lerpView(shot.from, shot.to, progress(frame, shotStart, shotEnd - shotStart + 8, EASE.linear));
  const montageOpacity = 1 - progress(frame, phase2, 8, EASE.out);

  // Réseau d'agences
  const agencies = projectAgencies();
  const loop: Pt[] = [...agencies.map((a) => [a.x, a.y] as Pt), [agencies[0].x, agencies[0].y]];
  const segTimes = [...nodes, nodes[4] + (nodes[4] - nodes[3])];
  const seg = segTimes.findIndex((t, i) => i < segTimes.length - 1 && frame < segTimes[i + 1]);
  const lens = loop.slice(1).map((p, i) => Math.hypot(p[0] - loop[i][0], p[1] - loop[i][1]));
  const total = lens.reduce((a, b) => a + b, 0);
  let travelled = 0;
  if (frame >= segTimes[0]) {
    const i = seg === -1 ? lens.length : seg;
    travelled = lens.slice(0, i).reduce((a, b) => a + b, 0);
    if (i < lens.length) travelled += lens[i] * progress(frame, segTimes[i], segTimes[i + 1] - segTimes[i], EASE.inOut);
  }
  const networkPath = `M ${loop.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L ')}`;
  const mapFade = 1 - progress(frame, exitAt, 12, EASE.out);
  const dotsIn = progress(frame, phase2 + 4, 10, EASE.out);

  const fs = fitFontSize(TERRAIN.line2, LAYOUT.contentWidth, 700, 112, -0.015);

  return (
    <AbsoluteFill style={{background: COLORS.black}}>
      {/* Montage dans le cadre */}
      <AbsoluteFill style={{clipPath: chamferClip(rect, chamfer), opacity: montageOpacity, isolation: 'isolate', background: COLORS.black}}>
        {frame < phase2 + 8 ? (
          variant === 'draft' ? (
            <Placeholder frame={WINDOW} index={shotIndex} label={TERRAIN_PLACEHOLDERS[shotIndex]} />
          ) : (
            <Photo media={shot.media} view={shotView} frame={WINDOW} blend="lighten" />
          )
        ) : null}
      </AbsoluteFill>

      {/* Réseau des agences */}
      <AbsoluteFill style={{opacity: mapFade}}>
        <EnergyLayer>
          <EnergyPath d={networkPath} to={travelled / total} width={3} />
          {agencies.map((a, i) => {
            const lit = progress(frame, nodes[i], 8, EASE.out);
            const ping = progress(frame, nodes[i], 16, EASE.out);
            return (
              <g key={a.name} opacity={dotsIn}>
                {lit > 0 && ping < 1 ? (
                  <circle cx={a.x} cy={a.y} r={10 + 26 * ping} fill="none" stroke={COLORS.orange} strokeWidth={2} opacity={1 - ping} />
                ) : null}
                <circle cx={a.x} cy={a.y} r={10} fill={lit > 0 ? COLORS.orange : withAlpha(COLORS.white, 0.35)} />
                <circle cx={a.x} cy={a.y} r={3.5} fill={COLORS.white} opacity={lit} />
              </g>
            );
          })}
        </EnergyLayer>
        {agencies.map((a, i) => {
          const lit = progress(frame, nodes[i] + 1, 10, EASE.out);
          const pos: React.CSSProperties =
            a.labelSide === 'above'
              ? {left: a.x - 200, top: a.y - 62, width: 400, textAlign: 'center'}
              : a.labelSide === 'below'
                ? {left: a.x - 200, top: a.y + 26, width: 400, textAlign: 'center'}
                : a.labelSide === 'left'
                  ? {left: a.x - 424, top: a.y - 18, width: 400, textAlign: 'right'}
                  : {left: a.x + 24, top: a.y - 18, width: 400, textAlign: 'left'};
          return (
            <div
              key={a.name}
              style={{
                position: 'absolute',
                ...pos,
                fontFamily: FONT_FAMILY,
                fontSize: 26,
                fontWeight: 600,
                letterSpacing: '0.16em',
                color: withAlpha(COLORS.white, 0.88),
                opacity: lit,
                transform: `translateY(${(1 - lit) * 8}px)`,
              }}
            >
              {a.name}
            </div>
          );
        })}
        <div
          style={{
            position: 'absolute',
            left: WINDOW.x,
            top: WINDOW.y + WINDOW.h + 34,
            fontFamily: FONT_FAMILY,
            fontSize: 30,
            fontWeight: 600,
            letterSpacing: '0.18em',
            color: COLORS.orange,
            opacity: progress(frame, nodes[0], 12, EASE.out),
            transform: `translateX(${(1 - progress(frame, nodes[0], 16, EASE.out)) * -16}px)`,
            whiteSpace: 'nowrap',
          }}
        >
          {TERRAIN.networkLabel}
        </div>
      </AbsoluteFill>

      <EnergyLayer>
        <EnergyPath d={chamferFrame(rect, chamfer)} to={1} width={3} head={false} />
      </EnergyLayer>

      <div style={{position: 'absolute', left: LAYOUT.marginX, top: TEXT_TOP}}>
        <RevealLines lines={[TERRAIN.line1]} start={4} fontSize={fs} exitAt={exitAt} />
      </div>
      <div style={{position: 'absolute', left: LAYOUT.marginX, top: TEXT_TOP + fs * 0.92 + 8}}>
        <RevealLines lines={[TERRAIN.line2]} start={phase2} fontSize={fs} exitAt={exitAt + 2} />
      </div>
    </AbsoluteFill>
  );
};
