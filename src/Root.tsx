import React from 'react';
import {Composition} from 'remotion';
import {VIDEO} from './config/brand';
import {Film, FilmProps} from './Film';
import {TIMELINE} from './lib/timeline';

export const RemotionRoot: React.FC = () => (
  <>
    {/* Version principale : uniquement des médias réels fournis, sans repères. */}
    <Composition
      id="BEB-Main"
      component={Film}
      durationInFrames={TIMELINE.durationInFrames}
      fps={VIDEO.fps}
      width={VIDEO.width}
      height={VIDEO.height}
      defaultProps={{variant: 'main', guides: false} satisfies FilmProps}
    />
    {/* Version de travail : emplacements des photos terrain à fournir + zones d'interface + timecode. */}
    <Composition
      id="BEB-Draft"
      component={Film}
      durationInFrames={TIMELINE.durationInFrames}
      fps={VIDEO.fps}
      width={VIDEO.width}
      height={VIDEO.height}
      defaultProps={{variant: 'draft', guides: true} satisfies FilmProps}
    />
  </>
);
