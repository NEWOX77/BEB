import React from 'react';
import {COLORS} from '../config/brand';

/** Rend 'SUR LE [TERRAIN.]' avec le passage entre crochets en orange charte. */
export const Accent: React.FC<{text: string; color?: string}> = ({text, color = COLORS.orange}) => {
  const parts = text.split(/(\[[^\]]*\])/g).filter(Boolean);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('[') ? (
          <span key={i} style={{color}}>
            {p.slice(1, -1)}
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
};
