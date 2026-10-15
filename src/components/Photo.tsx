import React from 'react';
import {Img, staticFile} from 'remotion';
import {MEDIA, MediaKey, View} from '../config/content';
import {Rect} from '../lib/geometry';
import {lerp} from '../lib/motion';

export const lerpView = (a: View, b: View, t: number): View => ({
  cx: lerp(a.cx, b.cx, t),
  cy: lerp(a.cy, b.cy, t),
  scale: lerp(a.scale, b.scale, t),
});

/** Coordonnées écran d'un point source de la photo, pour un cadrage donné. */
export const toScreen = (view: View, frame: Rect, sx: number, sy: number) => ({
  x: frame.x + frame.w / 2 + (sx - view.cx) * view.scale,
  y: frame.y + frame.h / 2 + (sy - view.cy) * view.scale,
});

/**
 * Photo réelle cadrée dans un rectangle écran. Mise à l'échelle par la mise en page
 * (rééchantillonnage de qualité), proportions toujours conservées.
 * `blend="lighten"` : le noir pur du fond photo se fond dans le noir charte #130f14.
 */
export const Photo: React.FC<{
  media: MediaKey;
  view: View;
  frame: Rect;
  blend?: 'lighten' | 'normal';
  filter?: string;
  style?: React.CSSProperties;
}> = ({media, view, frame, blend = 'normal', filter, style}) => {
  const m = MEDIA[media];
  const w = m.w * view.scale;
  const h = m.h * view.scale;
  return (
    <div
      style={{
        position: 'absolute',
        left: frame.x,
        top: frame.y,
        width: frame.w,
        height: frame.h,
        overflow: 'hidden',
        mixBlendMode: blend,
        ...style,
      }}
    >
      <Img
        src={staticFile(m.src)}
        style={{
          position: 'absolute',
          left: frame.w / 2 - view.cx * view.scale,
          top: frame.h / 2 - view.cy * view.scale,
          width: w,
          height: h,
          maxWidth: 'none',
          filter,
        }}
      />
    </div>
  );
};
