import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COLORS, FONT_FAMILY, LAYOUT, withAlpha} from '../config/brand';
import {ASTREINTE} from '../config/content';
import {Slam} from '../components/Kinetic';
import {RevealLines} from '../components/RevealLines';
import {fitFontSize} from '../lib/fonts';
import {EASE, progress} from '../lib/motion';
import {localCue} from '../lib/timeline';

const CX = 540;
const CY = 620;
const R = 230;

/** 22–25 s — Astreinte : un cadran de 24 h se remplit en 2 s, « H24 », « ASTREINTE 24H/24 · 7J/7 ». */
export const Astreinte: React.FC = () => {
  const frame = useCurrentFrame();
  const textAt = localCue('astreinte', 'astreinte.text');
  const sweep = progress(frame, 2, 58, EASE.inOut);
  const fs = fitFontSize(ASTREINTE.word, LAYOUT.contentWidth, 700, 220, -0.025);
  const ang = -Math.PI / 2 + sweep * Math.PI * 2;
  const circ = 2 * Math.PI * R;
  return (
    <AbsoluteFill style={{background: COLORS.black}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <circle cx={CX} cy={CY} r={R} fill="none" stroke={withAlpha(COLORS.white, 0.12)} strokeWidth={14} />
        <circle
          cx={CX}
          cy={CY}
          r={R}
          fill="none"
          stroke={COLORS.orange}
          strokeWidth={14}
          strokeDasharray={`${circ * sweep} ${circ}`}
          transform={`rotate(-90 ${CX} ${CY})`}
        />
        {Array.from({length: 24}, (_, i) => {
          const a = -Math.PI / 2 + (i / 24) * Math.PI * 2;
          const on = progress(frame, i * 0.9, 4, EASE.out);
          const major = i % 6 === 0;
          const r0 = R + 26;
          const r1 = R + (major ? 64 : 44);
          const lit = sweep * 24 >= i;
          return (
            <line
              key={i}
              x1={CX + Math.cos(a) * r0}
              y1={CY + Math.sin(a) * r0}
              x2={CX + Math.cos(a) * (r0 + (r1 - r0) * on)}
              y2={CY + Math.sin(a) * (r0 + (r1 - r0) * on)}
              stroke={lit ? COLORS.orange : withAlpha(COLORS.white, 0.5)}
              strokeWidth={major ? 6 : 3}
            />
          );
        })}
        <line x1={CX} y1={CY} x2={CX + Math.cos(ang) * (R - 40)} y2={CY + Math.sin(ang) * (R - 40)} stroke={COLORS.white} strokeWidth={6} opacity={progress(frame, 2, 6, EASE.out)} />
        <circle cx={CX} cy={CY} r={10} fill={COLORS.orange} />
      </svg>
      <Slam at={4} from={1.3} duration={9} origin="50% 50%" style={{position: 'absolute', left: CX - 300, top: CY - 80, width: 600, textAlign: 'center'}}>
        <div style={{fontFamily: FONT_FAMILY, fontWeight: 700, fontSize: 150, lineHeight: '160px', letterSpacing: '-0.03em', color: COLORS.white, textShadow: `0 0 30px ${COLORS.black}`}}>{ASTREINTE.center}</div>
      </Slam>
      <div style={{position: 'absolute', left: LAYOUT.marginX, top: 960}}>
        <RevealLines lines={[ASTREINTE.word]} start={textAt} fontSize={fs} duration={12} />
      </div>
      <div style={{position: 'absolute', left: LAYOUT.marginX, top: 960 + fs * 0.92 + 18}}>
        <RevealLines lines={[ASTREINTE.line]} start={textAt + 6} fontSize={92} duration={12} />
      </div>
      <div style={{position: 'absolute', left: LAYOUT.marginX, top: 960 + fs * 0.92 + 18 + 92 + 44}}>
        <RevealLines lines={[ASTREINTE.sub]} start={textAt + 12} fontSize={42} weight={500} lineHeight={1.15} letterSpacingEm={-0.005} color={COLORS.grey} duration={12} />
      </div>
    </AbsoluteFill>
  );
};
