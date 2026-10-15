import {Config} from '@remotion/cli/config';

// Sortie : MP4 H.264, 1080 × 1920, 30 i/s, yuv420p (compatible Instagram / LinkedIn), audio AAC.
Config.setEntryPoint('./src/index.ts');
// Images PNG intermédiaires : pas de double compression, plage vidéo standard (yuv420p, pas yuvj420p)
Config.setVideoImageFormat('png');
Config.setCodec('h264');
Config.setCrf(14);
Config.setX264Preset('slow');
Config.setPixelFormat('yuv420p');
Config.setAudioCodec('aac');
Config.setOverwriteOutput(true);

// Navigateur déjà installé (ex. environnement sans accès au téléchargement de Chrome Headless Shell)
if (process.env.REMOTION_BROWSER_EXECUTABLE) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER_EXECUTABLE);
}
