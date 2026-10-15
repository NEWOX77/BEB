import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COLORS, FONT_FAMILY, LAYOUT} from '../config/brand';
import {METIERS} from '../config/content';
import {Accent} from '../components/Accent';
import {Label, Slam} from '../components/Kinetic';
import {fitFontSize} from '../lib/fonts';
import {EASE, progress} from '../lib/motion';
import {localCue} from '../lib/timeline';

/** 11–12,5 s — Aplat blanc : les trois métiers frappent sur les croches. */
export const Metiers: React.FC = () => {
  const frame = useCurrentFrame();
  const at = [1, 2, 3].map((i) => localCue('metiers', `metiers.w${i}`));
  const fs = Math.min(...METIERS.words.map((w) => fitFontSize(w, LAYOUT.contentWidth, 700, 200, -0.025)));
  const top = 620;
  return (
    <AbsoluteFill style={{background: COLORS.white}}>
      <Slam at={2} from={1.1} style={{position: 'absolute', left: LAYOUT.marginX, top: top - 80}}>
        <Label>{METIERS.label}</Label>
      </Slam>
      {METIERS.words.map((w, i) => (
        <Slam key={w} at={at[i]} from={1.3} duration={8} style={{position: 'absolute', left: LAYOUT.marginX, top: top + i * fs * 0.98}}>
          <div style={{fontFamily: FONT_FAMILY, fontWeight: 700, fontSize: fs, lineHeight: 1, letterSpacing: '-0.025em', color: COLORS.black, whiteSpace: 'nowrap'}}>
            <Accent text={w} />
          </div>
        </Slam>
      ))}
      <div style={{position: 'absolute', left: LAYOUT.marginX, top: top + 3 * fs * 0.98 + 24, width: LAYOUT.contentWidth * progress(frame, at[2] + 2, 14, EASE.out), height: 12, background: COLORS.orange}} />
    </AbsoluteFill>
  );
};
