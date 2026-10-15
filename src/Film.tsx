import React from 'react';
import {AbsoluteFill, Audio, Sequence, getStaticFiles, staticFile} from 'remotion';
import {COLORS} from './config/brand';
import {EBarWipe} from './components/EBarWipe';
import {Guides} from './components/Guides';
import {useFontsReady} from './lib/fonts';
import {cue, scene} from './lib/timeline';
import {Astreinte} from './scenes/Astreinte';
import {Chiffres} from './scenes/Chiffres';
import {Devis} from './scenes/Devis';
import {Hook} from './scenes/Hook';
import {Leader} from './scenes/Leader';
import {LogoSting} from './scenes/LogoSting';
import {Materiels} from './scenes/Materiels';
import {Metiers} from './scenes/Metiers';
import {Proximite} from './scenes/Proximite';
import {Reactivite} from './scenes/Reactivite';

export type FilmProps = {
  /** Repères de la version de travail : zones d'interface réseaux sociaux + timecode. */
  guides: boolean;
};

export const AUDIO_FILE = 'audio/beb-sound-design.wav';

const SCENES: [string, string, React.FC][] = [
  ['hook', 'Accroche', Hook],
  ['logo', 'Logo', LogoSting],
  ['leader', 'Leader en Bretagne', Leader],
  ['chiffres', 'Chiffres', Chiffres],
  ['metiers', 'Métiers', Metiers],
  ['materiels', 'Matériels en location', Materiels],
  ['proximite', 'Proximité', Proximite],
  ['astreinte', 'Astreinte', Astreinte],
  ['reactivite', 'Réactivité', Reactivite],
  ['devis', 'Devis', Devis],
];

/** Transitions « barres du E » (couleur choisie pour contraster avec les deux scènes). */
const WIPES: [string, string][] = [
  ['chiffres.in', COLORS.white],
  ['metiers.in', COLORS.orange],
  ['proximite.in', COLORS.orange],
  ['devis.in', COLORS.orange],
];

export const Film: React.FC<FilmProps> = ({guides}) => {
  const ready = useFontsReady();
  const hasAudio = getStaticFiles().some((f) => f.name === AUDIO_FILE);
  if (!ready) return <AbsoluteFill style={{background: COLORS.black}} />;
  return (
    <AbsoluteFill style={{background: COLORS.black}}>
      {SCENES.map(([id, name, C]) => {
        const s = scene(id);
        return (
          <Sequence key={id} name={name} from={s.from} durationInFrames={s.duration}>
            <C />
          </Sequence>
        );
      })}
      {WIPES.map(([id, color]) => (
        <EBarWipe key={id} at={cue(id)} color={color} />
      ))}
      {hasAudio ? <Audio src={staticFile(AUDIO_FILE)} /> : null}
      {guides ? <Guides /> : null}
    </AbsoluteFill>
  );
};
