import React from 'react';
import {AbsoluteFill, Audio, Sequence, getStaticFiles, staticFile} from 'remotion';
import {COLORS} from './config/brand';
import {EXPERTISES} from './config/content';
import {Guides} from './components/Guides';
import {useFontsReady} from './lib/fonts';
import {TRANSITION_TAIL, scene} from './lib/timeline';
import {Expertise} from './scenes/Expertise';
import {Finale} from './scenes/Finale';
import {Hook} from './scenes/Hook';
import {Reveal} from './scenes/Reveal';
import {Terrain} from './scenes/Terrain';

export type FilmProps = {
  /** main : version avec les médias disponibles · draft : emplacements « photo terrain à fournir » + repères. */
  variant: 'main' | 'draft';
  guides: boolean;
};

export const AUDIO_FILE = 'audio/beb-sound-design.wav';

const span = (id: string, tail = TRANSITION_TAIL) => {
  const s = scene(id);
  return {from: s.from, durationInFrames: s.duration + tail};
};

export const Film: React.FC<FilmProps> = ({variant, guides}) => {
  const ready = useFontsReady();
  const hasAudio = getStaticFiles().some((f) => f.name === AUDIO_FILE);
  if (!ready) return <AbsoluteFill style={{background: COLORS.black}} />;
  const finale = scene('signature');
  return (
    <AbsoluteFill style={{background: COLORS.black}}>
      <Sequence name="00–03 Accroche" {...span('hook', 0)}>
        <Hook />
      </Sequence>
      <Sequence name="03–07 Révélation" {...span('reveal')}>
        <Reveal />
      </Sequence>
      <Sequence name="07–10 Vente" {...span('vente')}>
        <Expertise data={EXPERTISES[0]} entry="up" />
      </Sequence>
      <Sequence name="10–13 Location" {...span('location')}>
        <Expertise data={EXPERTISES[1]} entry="right" />
      </Sequence>
      <Sequence name="13–16 Maintenance" {...span('maintenance')}>
        <Expertise data={EXPERTISES[2]} entry="down" />
      </Sequence>
      <Sequence name="16–22 Terrain" {...span('terrain', 0)}>
        <Terrain variant={variant} />
      </Sequence>
      <Sequence name="22–30 Signature + CTA" from={finale.from} durationInFrames={900 - finale.from}>
        <Finale />
      </Sequence>
      {hasAudio ? <Audio src={staticFile(AUDIO_FILE)} /> : null}
      {guides ? <Guides /> : null}
    </AbsoluteFill>
  );
};
