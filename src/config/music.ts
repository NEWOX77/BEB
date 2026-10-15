/**
 * Musique du commerce (fournie par BEB) : déposer le fichier dans public/audio/ sous l'un de ces noms.
 * S'il est présent, il remplace la maquette sonore synthétisée ; les impacts synchronisés
 * (public/audio/beb-sfx.wav, `npm run audio:sfx`) peuvent être conservés par-dessus.
 * Le calage se règle avec `python3 scripts/analyze_music.py public/audio/musique.mp3`.
 */
export const MUSIC = {
  candidates: ['audio/musique.mp3', 'audio/musique.m4a', 'audio/musique.wav'],
  /** Point de départ dans le morceau (secondes) — à caler pour que le drop tombe sur le logo (3 s). */
  startFrom: 0,
  volume: 1,
  /** Fondu de sortie sur les dernières images. */
  fadeOutFrames: 24,
  /** Volume des impacts synchronisés par-dessus la musique (0 pour les couper). */
  sfxVolume: 0.45,
};
