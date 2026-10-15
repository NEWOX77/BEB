import React from 'react';
import {COLORS, withAlpha} from '../config/brand';

/** Lignes techniques discrètes (repères de mesure), en fond — jamais au premier plan. */
export const TechGrid: React.FC<{offsetX?: number; opacity?: number; horizonY?: number}> = ({
  offsetX = 0,
  opacity = 1,
  horizonY,
}) => {
  const cols = Array.from({length: 11}, (_, i) => i * 108);
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity}}>
      <g transform={`translate(${offsetX} 0)`}>
        {cols.map((x) => (
          <line key={x} x1={x} y1={0} x2={x} y2={1920} stroke={withAlpha(COLORS.white, 0.035)} strokeWidth={1} />
        ))}
        {cols.map((x) => (
          <line
            key={`t${x}`}
            x1={x}
            y1={horizonY !== undefined ? horizonY - 10 : 0}
            x2={x}
            y2={horizonY !== undefined ? horizonY + 10 : 0}
            stroke={withAlpha(COLORS.white, 0.18)}
            strokeWidth={1}
          />
        ))}
      </g>
      {horizonY !== undefined ? (
        <line x1={0} y1={horizonY} x2={1080} y2={horizonY} stroke={withAlpha(COLORS.white, 0.06)} strokeWidth={1} />
      ) : null}
    </svg>
  );
};
