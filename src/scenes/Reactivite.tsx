import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COLORS, FONT_FAMILY, LAYOUT, withAlpha} from '../config/brand';
import {REACTIVITE} from '../config/content';
import {Accent} from '../components/Accent';
import {Slam} from '../components/Kinetic';
import {RevealLines} from '../components/RevealLines';
import {fitFontSize} from '../lib/fonts';
import {EASE, lerp, progress} from '../lib/motion';
import {localCue} from '../lib/timeline';

// Lignes de vitesse (positions fixes, déterministes)
const STREAKS = [
  {y: 640, len: 520, d: 0},
  {y: 700, len: 300, d: 3},
  {y: 1010, len: 640, d: 1},
  {y: 1080, len: 380, d: 5},
  {y: 1150, len: 460, d: 2},
  {y: 1250, len: 260, d: 4},
];

/** 25–28 s — « RÉACTIVITÉ. » sur aplat orange avec lignes de vitesse, puis « PRÉVOIR LES IMPRÉVUS. » sur blanc. */
export const Reactivite: React.FC = () => {
  const frame = useCurrentFrame();
  const sloganAt = localCue('reactivite', 'reactivite.slogan');
  const fs = fitFontSize(REACTIVITE.word, LAYOUT.contentWidth, 700, 220, -0.025);
  const fsS = fitFontSize(REACTIVITE.slogan[1].replace(/[[\]]/g, ''), LAYOUT.contentWidth, 700, 170, -0.02);
  if (frame >= sloganAt) {
    return (
      <AbsoluteFill style={{background: COLORS.white}}>
        {REACTIVITE.slogan.map((l, i) => (
          <Slam key={l} at={sloganAt + i * 5} from={1.25} duration={8} style={{position: 'absolute', left: LAYOUT.marginX, top: 720 + i * fsS * 0.95}}>
            <div style={{fontFamily: FONT_FAMILY, fontWeight: 700, fontSize: fsS, lineHeight: 1, letterSpacing: '-0.02em', color: COLORS.black, whiteSpace: 'nowrap'}}>
              <Accent text={l} />
            </div>
          </Slam>
        ))}
        <div style={{position: 'absolute', left: LAYOUT.marginX, top: 720 + 2 * fsS * 0.95 + 30, width: LAYOUT.contentWidth * progress(frame, sloganAt + 8, 16, EASE.out), height: 12, background: COLORS.black}} />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{background: COLORS.orange, overflow: 'hidden'}}>
      {STREAKS.map((s, i) => {
        const p = progress(frame, s.d, 22, EASE.out);
        const x = lerp(-s.len - 200, 1180, p);
        return <div key={i} style={{position: 'absolute', left: x, top: s.y, width: s.len, height: 8, background: `linear-gradient(90deg, ${withAlpha(COLORS.black, 0)}, ${COLORS.black})`}} />;
      })}
      <Slam at={0} from={1.35} duration={9} style={{position: 'absolute', left: LAYOUT.marginX, top: 760}}>
        <div style={{fontFamily: FONT_FAMILY, fontWeight: 700, fontSize: fs, lineHeight: 1, letterSpacing: '-0.025em', color: COLORS.black, whiteSpace: 'nowrap'}}>{REACTIVITE.word}</div>
      </Slam>
      <div style={{position: 'absolute', left: LAYOUT.marginX, top: 760 + fs + 30, width: LAYOUT.contentWidth}}>
        <RevealLines lines={REACTIVITE.sub} start={8} fontSize={50} weight={500} lineHeight={1.15} letterSpacingEm={-0.005} color={COLORS.black} stagger={3} duration={12} />
      </div>
    </AbsoluteFill>
  );
};
