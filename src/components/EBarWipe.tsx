import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {EASE, lerp, progress} from '../lib/motion';

/**
 * Transition « barres du E » : trois bandes chanfreinées (les branches du E du logo)
 * couvrent l'écran en décalé, la scène change dessous à l'image `at`, puis elles repartent.
 */
export const EBarWipe: React.FC<{at: number; color: string}> = ({at, color}) => {
  const frame = useCurrentFrame();
  if (frame < at - 10 || frame > at + 14) return null;
  const h = 1920 / 3;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {[0, 1, 2].map((i) => {
        const inP = progress(frame, at - 9 + i * 2, 9 - i * 2, EASE.in);
        const outP = progress(frame, at + i * 2, 9, EASE.out);
        const x = frame < at ? lerp(-1300, 0, inP) : lerp(0, 1300, outP);
        const c = 120;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - 60,
              top: i * h - 1,
              width: 1080 + 120 + c,
              height: h + 2,
              background: color,
              clipPath: `polygon(0 0, calc(100% - ${c}px) 0, 100% ${c}px, 100% 100%, ${c}px 100%, 0 calc(100% - ${c}px))`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
