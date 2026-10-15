import React from 'react';
import {useCurrentFrame} from 'remotion';
import {COLORS, FONT_FAMILY} from '../config/brand';
import {measure} from '../lib/fonts';
import {EASE, lerp, progress} from '../lib/motion';

/**
 * Impact typographique : l'élément arrive légèrement plus grand et se pose net (pas de rebond),
 * avec un flou bref qui disparaît à l'arrêt.
 */
export const Slam: React.FC<{
  at: number;
  from?: number;
  duration?: number;
  until?: number;
  origin?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({at, from = 1.22, duration = 9, until, origin = '0% 50%', children, style}) => {
  const frame = useCurrentFrame();
  if (frame < at || (until !== undefined && frame >= until)) return null;
  const p = progress(frame, at, duration, EASE.out);
  const blur = (1 - p) * 7;
  return (
    <div
      style={{
        ...style,
        transform: `scale(${lerp(from, 1, p)})`,
        transformOrigin: origin,
        opacity: Math.min(1, (frame - at + 1) / 2),
        filter: blur > 0.3 ? `blur(${blur.toFixed(2)}px)` : undefined,
      }}
    >
      {children}
    </div>
  );
};

/** Compteur qui défile jusqu'à sa valeur (chiffres à chasse fixe, séparateur de milliers français). */
export const Counter: React.FC<{at: number; value: number; duration?: number; suffix?: string; fontSize: number; color?: string; suffixColor?: string}> = ({
  at,
  value,
  duration = 20,
  suffix = '',
  fontSize,
  color = COLORS.white,
  suffixColor = COLORS.orange,
}) => {
  const frame = useCurrentFrame();
  const v = Math.round(value * progress(frame, at, duration, EASE.out));
  const txt = v.toLocaleString('fr-FR').replace(/\s/g, ' ');
  return (
    <span style={{fontFamily: FONT_FAMILY, fontWeight: 700, fontSize, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', color, whiteSpace: 'nowrap'}}>
      {txt}
      <span style={{color: suffixColor, fontSize: fontSize * 0.55, letterSpacing: '0'}}>{suffix}</span>
    </span>
  );
};

/** Bandeau défilant continu (texte répété), vitesse en px / image. */
export const Ticker: React.FC<{text: string; fontSize: number; speed?: number; color?: string; weight?: number; tracking?: number; style?: React.CSSProperties}> = ({
  text,
  fontSize,
  speed = 4,
  color = COLORS.grey,
  weight = 600,
  tracking = 0.16,
  style,
}) => {
  const frame = useCurrentFrame();
  const w = measure(text, fontSize, weight, tracking) + tracking * fontSize;
  const reps = Math.ceil(1080 / w) + 2;
  const x = -((frame * speed) % w);
  return (
    <div style={{position: 'absolute', left: 0, width: 1080, overflow: 'hidden', whiteSpace: 'nowrap', ...style}}>
      <div style={{transform: `translateX(${x}px)`, fontFamily: FONT_FAMILY, fontSize, fontWeight: weight, letterSpacing: `${tracking}em`, color}}>
        {Array.from({length: reps}, () => text).join('')}
      </div>
    </div>
  );
};

/** Petit libellé en capitales espacées, façon baseline du logo. */
export const Label: React.FC<{children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties}> = ({children, color = COLORS.orange, size = 30, style}) => (
  <div style={{fontFamily: FONT_FAMILY, fontWeight: 600, fontSize: size, letterSpacing: '0.2em', color, whiteSpace: 'nowrap', ...style}}>{children}</div>
);
