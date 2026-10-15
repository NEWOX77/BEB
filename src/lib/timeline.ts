import timeline from '../config/timeline.json';

export type SceneId = (typeof timeline.scenes)[number]['id'];
export const TIMELINE = timeline;

export const scene = (id: string) => {
  const s = timeline.scenes.find((x) => x.id === id);
  if (!s) throw new Error(`Scène inconnue : ${id}`);
  return s;
};

/** Image absolue d'un repère (cue) de timeline.json. */
export const cue = (id: string) => {
  const c = timeline.cues.find((x) => x.id === id);
  if (!c) throw new Error(`Repère inconnu : ${id}`);
  return c.frame;
};

/** Image d'un repère, relative au début de sa scène (pour les <Sequence>). */
export const localCue = (sceneId: string, cueId: string) => cue(cueId) - scene(sceneId).from;

/** Chaque scène reste affichée quelques images de plus, sous la transition de la suivante. */
export const TRANSITION_TAIL = 18;
