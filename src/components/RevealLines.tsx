import React from 'react';
import {useCurrentFrame} from 'remotion';
import {COLORS, FONT_FAMILY} from '../config/brand';
import {EASE, progress} from '../lib/motion';
import {Accent} from './Accent';
import {DirectionalBlur} from './DirectionalBlur';

type Props = {
  lines: string[];
  /** Image locale de début d'apparition de la première ligne. */
  start: number;
  fontSize: number;
  weight?: number;
  color?: string;
  accentColor?: string;
  stagger?: number;
  duration?: number;
  lineHeight?: number;
  letterSpacingEm?: number;
  /** Image locale de début de sortie (optionnelle). */
  exitAt?: number;
  exitDuration?: number;
  align?: 'left' | 'center';
  style?: React.CSSProperties;
};

/**
 * Lignes de texte révélées par un masque : chaque ligne monte depuis sa ligne de base,
 * décalage court entre lignes, arrivée en décélération franche, flou de mouvement vertical.
 */
export const RevealLines: React.FC<Props> = ({
  lines,
  start,
  fontSize,
  weight = 700,
  color = COLORS.white,
  accentColor,
  stagger = 3,
  duration = 16,
  lineHeight = 0.92,
  letterSpacingEm = -0.015,
  exitAt,
  exitDuration = 10,
  align = 'left',
  style,
}) => {
  const frame = useCurrentFrame();
  const box = fontSize * lineHeight;
  // Marges internes du masque : accents des capitales (É, À, Ô) et virgules jamais coupés.
  const padTop = fontSize * 0.24;
  const padBottom = fontSize * 0.1;
  return (
    <div style={{...style}}>
      {lines.map((line, i) => {
        const s = start + i * stagger;
        const offset = (f: number) => {
          const pin = progress(f, s, duration, EASE.out);
          const pout = exitAt === undefined ? 0 : progress(f, exitAt + i * 2, exitDuration, EASE.in);
          return (1 - pin) * (box + padTop + padBottom) - pout * (box + padTop + padBottom);
        };
        const y = offset(frame);
        const fade = exitAt === undefined ? 1 : 1 - progress(frame, exitAt + i * 2, exitDuration * 0.7, EASE.out);
        const vy = offset(frame + 0.5) - offset(frame - 0.5);
        return (
          <div
            key={i}
            style={{
              overflow: 'hidden',
              height: box + padTop + padBottom,
              marginTop: i === 0 ? -padTop : -(padTop + padBottom),
              paddingTop: padTop,
              textAlign: align,
            }}
          >
            <DirectionalBlur y={vy * 0.22} style={{transform: `translateY(${y}px)`, opacity: fade}}>
              <div
                style={{
                  fontFamily: FONT_FAMILY,
                  fontWeight: weight,
                  fontSize,
                  lineHeight: `${box}px`,
                  letterSpacing: `${letterSpacingEm}em`,
                  color,
                  whiteSpace: 'nowrap',
                }}
              >
                <Accent text={line} color={accentColor} />
              </div>
            </DirectionalBlur>
          </div>
        );
      })}
    </div>
  );
};

/** Hauteur occupée par un bloc RevealLines (pour enchaîner les blocs). */
export const blockHeight = (n: number, fontSize: number, lineHeight = 0.92) => n * fontSize * lineHeight;
