import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {COLORS, LAYOUT, withAlpha} from '../config/brand';
import {MEDIA, REVEAL} from '../config/content';
import {BebLogo, logoMetrics} from '../components/BebLogo';
import {EnergyLayer, EnergyPath} from '../components/EnergyPath';
import {RevealLines} from '../components/RevealLines';
import {TechGrid} from '../components/TechGrid';
import {fitFontSize} from '../lib/fonts';
import {EASE, lerp, progress} from '../lib/motion';
import {localCue} from '../lib/timeline';
import {SPLIT_Y} from './Hook';

/** Ligne de sol : le tracé s'y pose et la machine repose dessus. */
export const FLOOR_Y = 1280;
const LOGO_W = 340;

/**
 * 03–07 s — RÉVÉLATION
 * Le tracé s'ouvre en deux : l'image se découvre, la ligne basse devient le sol du groupe.
 * Démarreur, le moteur prend : la lumière s'allume. Puis le logo, puis le texte.
 */
export const Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const engine = localCue('reveal', 'reveal.engine');
  const logoAt = localCue('reveal', 'reveal.logo');
  const textAt = localCue('reveal', 'reveal.text');

  const open = progress(frame, 0, 20, EASE.out);
  const settle = progress(frame, 0, 24, EASE.out);
  const lightOn = progress(frame, engine, 10, EASE.out);
  const cam = progress(frame, 0, 140, EASE.drift);

  // Machine détourée : boîte englobante centrée, posée sur la ligne de sol, légère poussée caméra
  const m = MEDIA[REVEAL.media];
  const s = lerp(0.705, 0.74, cam);
  const bb = REVEAL.bbox;
  const left = 540 - (bb.x + bb.w / 2) * s;
  const top = FLOOR_Y - (bb.y + bb.h) * s;

  const upperY = SPLIT_Y * (1 - open);
  const lowerY = lerp(SPLIT_Y, FLOOR_Y, settle);
  const x0 = lerp(-20, LAYOUT.marginX, settle);
  const x1 = lerp(1100, 1080 - LAYOUT.marginX, settle);

  const logo = logoMetrics(LOGO_W);
  const logoTop = FLOOR_Y + logo.protection + 4; // zone de protection = hauteur du B
  const letter = (i: number) => progress(frame, logoAt + i * 3, 14, EASE.out);

  const fsText = fitFontSize(REVEAL.lines[0], LAYOUT.contentWidth, 700, 104, -0.015);

  return (
    <AbsoluteFill style={{background: COLORS.black}}>
      <AbsoluteFill
        style={{
          clipPath: `inset(${(SPLIT_Y * (1 - open)).toFixed(2)}px 0 ${((1920 - SPLIT_Y) * (1 - open)).toFixed(2)}px 0)`,
        }}
      >
        <TechGrid offsetX={-cam * 18} opacity={0.5 + 0.5 * lightOn} horizonY={FLOOR_Y} />
        {/* Halo de lumière derrière le groupe : il s'allume quand le moteur prend */}
        <div
          style={{
            position: 'absolute',
            left: 540 - 620,
            top: FLOOR_Y - 820,
            width: 1240,
            height: 1000,
            background: `radial-gradient(ellipse at 50% 55%, ${withAlpha(COLORS.white, 0.11)} 0%, ${withAlpha(COLORS.white, 0.04)} 38%, transparent 68%)`,
            opacity: 0.25 + 0.75 * lightOn,
          }}
        />
        {/* Lumière du tracé sur le sol */}
        <div
          style={{
            position: 'absolute',
            left: LAYOUT.marginX,
            top: FLOOR_Y,
            width: LAYOUT.contentWidth,
            height: 90,
            background: `linear-gradient(180deg, ${withAlpha(COLORS.orange, 0.22)} 0%, transparent 100%)`,
            opacity: settle * (0.4 + 0.6 * lightOn),
          }}
        />
        {/* Reflet au sol */}
        <div
          style={{
            position: 'absolute',
            left,
            top: FLOOR_Y,
            width: m.w * s,
            height: 260,
            overflow: 'hidden',
            opacity: 0.1 + 0.06 * lightOn,
            WebkitMaskImage: 'linear-gradient(180deg, #000 0%, transparent 100%)',
            maskImage: 'linear-gradient(180deg, #000 0%, transparent 100%)',
          }}
        >
          <Img
            src={staticFile(m.src)}
            style={{
              position: 'absolute',
              left: 0,
              top: -(bb.y + bb.h) * s,
              width: m.w * s,
              height: m.h * s,
              maxWidth: 'none',
              transform: 'scaleY(-1)',
              transformOrigin: `50% ${((bb.y + bb.h) / m.h) * 100}%`,
            }}
          />
        </div>
        {/* Le groupe électrogène */}
        <Img
          src={staticFile(m.src)}
          style={{
            position: 'absolute',
            left,
            top,
            width: m.w * s,
            height: m.h * s,
            maxWidth: 'none',
            filter: `brightness(${0.82 + 0.18 * lightOn})`,
          }}
        />
      </AbsoluteFill>

      <EnergyLayer>
        <EnergyPath d={`M -20 ${upperY} L 1100 ${upperY}`} to={1} width={6} opacity={1 - progress(frame, 6, 12, EASE.out)} head={false} />
        <EnergyPath d={`M ${x0} ${lowerY} L ${x1} ${lowerY}`} to={1} width={lerp(6, 4, settle)} head={false} />
      </EnergyLayer>

      <div style={{position: 'absolute', left: LAYOUT.marginX, top: logoTop}}>
        <BebLogo width={LOGO_W} reveal={[letter(0), letter(1), letter(2)]} />
      </div>

      <div style={{position: 'absolute', left: LAYOUT.marginX, top: 300}}>
        <RevealLines lines={REVEAL.lines} start={textAt} fontSize={fsText} stagger={4} />
      </div>
    </AbsoluteFill>
  );
};
