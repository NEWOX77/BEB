/**
 * Musique du commerce (fournie par BEB) : déposer le fichier dans public/audio/ sous l'un de ces noms.
 * S'il est présent, il remplace la maquette sonore synthétisée ; les impacts synchronisés
 * (public/audio/beb-sfx.wav, `npm run audio:sfx`) peuvent être conservés par-dessus.
 * Le calage se règle avec `python3 scripts/analyze_music.py public/audio/musique.mp3`.
 */
export const MUSIC = {
  candidates: ['audio/musique.mp3', 'audio/musique.m4a', 'audio/musique.wav'],
  /**
   * Point de départ dans le morceau (secondes). Justice « Genesis » : 117,06 BPM, drop à 38,68 s.
   * Départ à 35,60 s (sur un temps) → le drop tombe sur l'apparition du logo (scène « logo », 3 s).
   */
  startFrom: 35.602,
  volume: 0.9,
  /** Fondu de sortie sur les dernières images. */
  fadeOutFrames: 24,
  /** Volume des impacts synchronisés par-dessus la musique (0 pour les couper). */
  sfxVolume: 0.35,
};
