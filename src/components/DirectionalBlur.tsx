import React, {useId} from 'react';

/**
 * Flou de mouvement directionnel (SVG feGaussianBlur anisotrope), proportionnel à la vitesse.
 * Désactivé à l'arrêt : le texte reste parfaitement net pendant la lecture.
 */
export const DirectionalBlur: React.FC<{x?: number; y?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({
  x = 0,
  y = 0,
  children,
  style,
}) => {
  const id = `mb${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const sx = Math.min(Math.abs(x), 40);
  const sy = Math.min(Math.abs(y), 40);
  const active = sx > 0.2 || sy > 0.2;
  return (
    <div style={{...style, filter: active ? `url(#${id})` : undefined}}>
      {active ? (
        <svg width={0} height={0} style={{position: 'absolute'}} aria-hidden>
          <defs>
            <filter id={id} x="-20%" y="-60%" width="140%" height="220%" colorInterpolationFilters="sRGB">
              <feGaussianBlur stdDeviation={`${sx.toFixed(2)} ${sy.toFixed(2)}`} />
            </filter>
          </defs>
        </svg>
      ) : null}
      {children}
    </div>
  );
};
