import React from 'react';
import {COLORS, FONT_FAMILY, withAlpha} from '../config/brand';
import {Rect} from '../lib/geometry';

/**
 * Emplacement de média manquant (version de travail uniquement).
 * Clairement identifié : jamais confondu avec une vraie photo.
 */
export const Placeholder: React.FC<{frame: Rect; index: number; label: string}> = ({frame, index, label}) => (
  <div
    style={{
      position: 'absolute',
      left: frame.x,
      top: frame.y,
      width: frame.w,
      height: frame.h,
      background: `repeating-linear-gradient(135deg, ${withAlpha(COLORS.white, 0.05)} 0 2px, transparent 2px 26px)`,
      outline: `2px dashed ${withAlpha(COLORS.white, 0.45)}`,
      outlineOffset: -14,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 18,
      fontFamily: FONT_FAMILY,
      color: COLORS.white,
      textAlign: 'center',
    }}
  >
    <div style={{fontSize: 30, fontWeight: 600, letterSpacing: '0.2em', color: COLORS.orange}}>
      PHOTO TERRAIN À FOURNIR
    </div>
    <div style={{fontSize: 40, fontWeight: 500, maxWidth: frame.w - 120}}>{label}</div>
    <div style={{fontSize: 24, fontWeight: 400, opacity: 0.6, letterSpacing: '0.08em'}}>
      public/media/terrain/terrain-0{index + 1}.jpg
    </div>
  </div>
);
