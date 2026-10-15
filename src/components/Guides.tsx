import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FONT_FAMILY, LAYOUT, withAlpha} from '../config/brand';
import {TIMELINE} from '../lib/timeline';

/**
 * Repères de la version de travail : zones masquées par les interfaces Reels / LinkedIn,
 * nom de séquence et timecode. Jamais présents dans la version principale.
 */
export const Guides: React.FC = () => {
  const frame = useCurrentFrame();
  const s = [...TIMELINE.scenes].reverse().find((x) => frame >= x.from) ?? TIMELINE.scenes[0];
  const red = withAlpha('#ff2d2d', 0.16);
  const sec = Math.floor(frame / 30);
  const ff = String(frame % 30).padStart(2, '0');
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 0, top: 0, right: 0, height: LAYOUT.safe.top, background: red}} />
      <div style={{position: 'absolute', left: 0, top: LAYOUT.safe.bottom, right: 0, bottom: 0, background: red}} />
      <div style={{position: 'absolute', right: 0, top: 1000, width: 1080 - LAYOUT.safe.right + 24, bottom: 0, background: red}} />
      <div
        style={{
          position: 'absolute',
          left: LAYOUT.safe.left,
          top: LAYOUT.safe.top,
          width: LAYOUT.safe.right - LAYOUT.safe.left,
          height: LAYOUT.safe.bottom - LAYOUT.safe.top,
          outline: '2px dashed rgba(80, 220, 255, 0.55)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 24,
          top: 24,
          fontFamily: FONT_FAMILY,
          fontSize: 26,
          fontWeight: 500,
          color: '#ffffff',
          background: 'rgba(0,0,0,0.65)',
          padding: '8px 14px',
          letterSpacing: '0.04em',
        }}
      >
        VERSION DE TRAVAIL · {s.title} · {String(sec).padStart(2, '0')}:{ff} · img {frame}
      </div>
    </AbsoluteFill>
  );
};
