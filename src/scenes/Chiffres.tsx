import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COLORS, LAYOUT, withAlpha} from '../config/brand';
import {STATS} from '../config/content';
import {EnergyLayer, EnergyPath} from '../components/EnergyPath';
import {Counter, Label, Slam} from '../components/Kinetic';
import {RevealLines} from '../components/RevealLines';
import {EASE, progress} from '../lib/motion';
import {localCue} from '../lib/timeline';

const ROW0 = 360;
const STEP = 278;

/** 07–11 s — Les chiffres du site, un par temps : compteurs, filets tracés, libellés. */
export const Chiffres: React.FC = () => {
  const frame = useCurrentFrame();
  const at = [1, 2, 3, 4].map((i) => localCue('chiffres', `chiffres.c${i}`));
  return (
    <AbsoluteFill style={{background: COLORS.black}}>
      <Slam at={2} from={1.1} style={{position: 'absolute', left: LAYOUT.marginX, top: 270}}>
        <Label>{STATS.label}</Label>
      </Slam>
      <EnergyLayer>
        {STATS.items.map((_, i) => (
          <EnergyPath
            key={i}
            d={`M ${LAYOUT.marginX} ${ROW0 + i * STEP - 18} L ${LAYOUT.marginX + LAYOUT.contentWidth} ${ROW0 + i * STEP - 18}`}
            to={progress(frame, at[i] - 2, 10, EASE.out)}
            width={3}
            color={i === 0 ? COLORS.orange : withAlpha(COLORS.white, 0.28)}
          />
        ))}
      </EnergyLayer>
      {STATS.items.map((s, i) => (
        <React.Fragment key={s.label}>
          <Slam at={at[i]} from={1.25} duration={9} style={{position: 'absolute', left: LAYOUT.marginX - 6, top: ROW0 + i * STEP - 10}}>
            <div style={{lineHeight: 1}}>
              <Counter at={at[i]} value={s.value} suffix={s.suffix} fontSize={168} duration={20} />
            </div>
          </Slam>
          <div style={{position: 'absolute', left: LAYOUT.marginX, top: ROW0 + i * STEP + 172}}>
            <RevealLines lines={[s.label]} start={at[i] + 4} fontSize={36} weight={600} letterSpacingEm={0.1} color={COLORS.grey} duration={12} />
          </div>
        </React.Fragment>
      ))}
    </AbsoluteFill>
  );
};
