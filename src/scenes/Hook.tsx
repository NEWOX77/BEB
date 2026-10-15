import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COLORS, LAYOUT, withAlpha} from '../config/brand';
import {HOOK} from '../config/content';
import {EnergyLayer, EnergyPath} from '../components/EnergyPath';
import {Photo, lerpView} from '../components/Photo';
import {RevealLines} from '../components/RevealLines';
import {fitFontSize} from '../lib/fonts';
import {EASE, progress} from '../lib/motion';
import {cue} from '../lib/timeline';

/** Ligne horizontale où l'accroche se referme (et où la révélation s'ouvrira). */
export const SPLIT_Y = 960;

/**
 * 00–03 s — ACCROCHE
 * Détail serré du 330 kVA, une lumière rasante révèle la matière. Texte franc dès la 1re seconde.
 * Fin : le tracé traverse l'écran et l'image se referme sur lui.
 */
export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const photoFrame = {x: 0, y: 0, w: 1080, h: 1360};
  const view = lerpView(HOOK.viewFrom, HOOK.viewTo, progress(frame, 0, 90, EASE.drift));

  // Lumière rasante : un front lumineux diagonal balaie le métal et le laisse éclairé
  const sweep = progress(frame, 0, 58, EASE.inOut);
  const pos = -30 + sweep * 160; // % le long du dégradé
  const glint = 1 - progress(frame, 50, 16, EASE.out);

  // Typo : corps calculés pour tenir dans la colonne de 888 px
  const fs1 = fitFontSize(HOOK.lines[0], LAYOUT.contentWidth, 700, 168, -0.015);
  const fs2 = Math.min(fs1 * 0.78, fitFontSize(HOOK.lines2.reduce((a, b) => (a.length > b.length ? a : b)), LAYOUT.contentWidth, 700, 130, -0.015));
  const textTop = 1010;

  // Le tracé traverse l'écran, puis l'image se referme sur lui
  const lineP = progress(frame, cue('hook.charge') + 2, 18, EASE.inOut);
  const close = progress(frame, 72, 18, EASE.inOut);

  return (
    <AbsoluteFill style={{background: COLORS.black}}>
      <AbsoluteFill
        style={{
          clipPath: `inset(${(SPLIT_Y * close).toFixed(2)}px 0 ${((1920 - SPLIT_Y) * close).toFixed(2)}px 0)`,
          isolation: 'isolate',
          background: COLORS.black,
        }}
      >
        {/* Matière dans l'ombre */}
        <Photo media={HOOK.media} view={view} frame={photoFrame} blend="lighten" filter="brightness(0.16) contrast(1.15)" />
        {/* Matière révélée par la lumière */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            WebkitMaskImage: `linear-gradient(118deg, #000 ${pos - 22}%, transparent ${pos + 8}%)`,
            maskImage: `linear-gradient(118deg, #000 ${pos - 22}%, transparent ${pos + 8}%)`,
            mixBlendMode: 'lighten',
          }}
        >
          <Photo media={HOOK.media} view={view} frame={photoFrame} filter="contrast(1.06) saturate(1.04)" />
        </div>
        {/* Reflet sur l'arête du front lumineux */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 1080,
            height: photoFrame.h,
            background: `linear-gradient(118deg, transparent ${pos - 14}%, ${withAlpha(COLORS.white, 0.16)} ${pos - 4}%, transparent ${pos + 6}%)`,
            mixBlendMode: 'screen',
            opacity: glint,
          }}
        />
        {/* Fondu bas vers le noir charte, sous le texte */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 760,
            width: 1080,
            height: photoFrame.h - 760 + 2,
            background: `linear-gradient(180deg, ${withAlpha(COLORS.black, 0)} 0%, ${withAlpha(COLORS.black, 0.85)} 55%, ${COLORS.black} 100%)`,
          }}
        />
        <div style={{position: 'absolute', left: LAYOUT.marginX, top: textTop}}>
          <RevealLines lines={HOOK.lines} start={cue('hook.l1')} fontSize={fs1} duration={14} />
          <div style={{height: 14}} />
          <RevealLines lines={HOOK.lines2} start={cue('hook.l2')} fontSize={fs2} stagger={4} duration={15} />
        </div>
      </AbsoluteFill>

      <EnergyLayer>
        <EnergyPath d={`M -20 ${SPLIT_Y} L 1100 ${SPLIT_Y}`} to={lineP} width={6} />
      </EnergyLayer>
    </AbsoluteFill>
  );
};
