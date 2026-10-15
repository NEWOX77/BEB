import React from 'react';
import {Composition} from 'remotion';
import {VIDEO} from './config/brand';
import {Film, FilmProps} from './Film';
import {TIMELINE} from './lib/timeline';

export const RemotionRoot: React.FC = () => (
  <>
    {/* Version de diffusion. */}
    <Composition
      id="BEB-Main"
      component={Film}
      durationInFrames={TIMELINE.durationInFrames}
      fps={VIDEO.fps}
      width={VIDEO.width}
      height={VIDEO.height}
      defaultProps={{guides: false} satisfies FilmProps}
    />
    {/* Version de travail : zones d'interface réseaux sociaux + timecode. */}
    <Composition
      id="BEB-Draft"
      component={Film}
      durationInFrames={TIMELINE.durationInFrames}
      fps={VIDEO.fps}
      width={VIDEO.width}
      height={VIDEO.height}
      defaultProps={{guides: true} satisfies FilmProps}
    />
  </>
);
