import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COLORS} from '../config/brand';
import {BebLogo, logoMetrics} from '../components/BebLogo';
import {EnergyLayer, EnergyPath} from '../components/EnergyPath';
import {chamferFrame} from '../lib/geometry';
import {EASE, lerp, progress} from '../lib/motion';
import {localCue} from '../lib/timeline';

const W = 620;

/** 03–05 s — Le logo frappe lettre par lettre sur les croches ; une onde (le cadre de protection) s'en échappe. */
export const LogoSting: React.FC = () => {
  const frame = useCurrentFrame();
  const at = (id: string) => localCue('logo', id);
  const m = logoMetrics(W, true);
  const x = 540 - W / 2;
  const y = 860 - m.height / 2;
  const letter = (id: string) => progress(frame, at(id), 8, EASE.out);
  const punch = lerp(1.06, 1, progress(frame, at('logo.b1'), 20, EASE.out));
  // Cadre à la distance de protection (hauteur du B), qui se dessine puis s'élargit en onde
  const B = m.protection;
  const draw = progress(frame, at('logo.b1'), 12, EASE.out);
  const wave = progress(frame, at('logo.b2') + 4, 26, EASE.out);
  const grow = lerp(0, 260, wave);
  const rect = {x: x - B - grow, y: y - B - grow, w: W + 2 * (B + grow), h: m.height + 2 * (B + grow)};
  return (
    <AbsoluteFill style={{background: COLORS.black}}>
      <EnergyLayer>
        <EnergyPath d={chamferFrame(rect, 40)} to={draw} width={lerp(5, 1, wave)} opacity={1 - wave} head={false} />
      </EnergyLayer>
      <div style={{position: 'absolute', left: x, top: y, transform: `scale(${punch})`, transformOrigin: '50% 50%'}}>
        <BebLogo width={W} reveal={[letter('logo.b1'), letter('logo.e'), letter('logo.b2')]} baseline={progress(frame, at('logo.base'), 14, EASE.out)} />
      </div>
    </AbsoluteFill>
  );
};
