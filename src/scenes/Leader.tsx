import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COLORS, FONT_FAMILY, LAYOUT} from '../config/brand';
import {LEADER} from '../config/content';
import {DirectionalBlur} from '../components/DirectionalBlur';
import {Slam} from '../components/Kinetic';
import {RevealLines} from '../components/RevealLines';
import {fitFontSize, measure} from '../lib/fonts';
import {EASE, progress} from '../lib/motion';

/** 05–07 s — Aplat orange : « LEADER EN BRETAGNE », lettres en cascade. */
export const Leader: React.FC = () => {
  const frame = useCurrentFrame();
  const fs = fitFontSize(LEADER.word, LAYOUT.contentWidth, 700, 300, -0.03);
  const fsLine = fitFontSize(LEADER.line, LAYOUT.contentWidth, 700, 132, -0.015);
  const top = 560;
  const box = fs * 0.82;
  const wordW = measure(LEADER.word, fs, 700, -0.03);
  return (
    <AbsoluteFill style={{background: COLORS.orange}}>
      <Slam at={0} from={1.3} duration={8} style={{position: 'absolute', left: LAYOUT.marginX, top: top - 90}}>
        <div style={{fontFamily: FONT_FAMILY, fontWeight: 700, fontSize: 72, color: COLORS.black, lineHeight: 1}}>{LEADER.kicker}</div>
      </Slam>
      <div style={{position: 'absolute', left: LAYOUT.marginX, top, height: box, overflow: 'hidden', whiteSpace: 'nowrap'}}>
        {[...LEADER.word].map((ch, i) => {
          const f = (t: number) => (1 - progress(t, 2 + i * 1.5, 12, EASE.out)) * box * 1.1;
          const y = f(frame);
          return (
            <DirectionalBlur key={i} y={(f(frame + 0.5) - f(frame - 0.5)) * 0.2} style={{display: 'inline-block', transform: `translateY(${y}px)`}}>
              <span style={{fontFamily: FONT_FAMILY, fontWeight: 700, fontSize: fs, lineHeight: `${box}px`, letterSpacing: '-0.03em', color: COLORS.black}}>{ch}</span>
            </DirectionalBlur>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: LAYOUT.marginX, top: top + box + 18, width: wordW * progress(frame, 8, 14, EASE.out), height: 12, background: COLORS.black}} />
      <div style={{position: 'absolute', left: LAYOUT.marginX, top: top + box + 64}}>
        <RevealLines lines={[LEADER.line]} start={10} fontSize={fsLine} color={COLORS.white} duration={12} />
      </div>
      <div style={{position: 'absolute', left: LAYOUT.marginX, top: top + box + 64 + fsLine + 40}}>
        <RevealLines lines={LEADER.sub} start={18} fontSize={46} weight={500} lineHeight={1.15} letterSpacingEm={-0.005} color={COLORS.black} stagger={3} duration={14} />
      </div>
    </AbsoluteFill>
  );
};
