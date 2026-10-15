// Rend des images fixes aux images demandées (contrôle qualité) puis une planche contact.
// Usage : node scripts/stills.mjs [BEB-Main|BEB-Draft] 8,45,120,...
import {bundle} from '@remotion/bundler';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';

const [, , compId = 'BEB-Main', framesArg = '8,45,88,100,135,170,205,240,280,330,370,420,470,486,520,575,625,650,690,740,790,820,850,899'] = process.argv;
const frames = framesArg.split(',').map(Number);
const outDir = path.resolve('out/stills', compId);
fs.mkdirSync(outDir, {recursive: true});

const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public')});
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE ?? null;
const browser = await openBrowser('chrome', {browserExecutable});
const composition = await selectComposition({serveUrl, id: compId, puppeteerInstance: browser, browserExecutable});
for (const frame of frames) {
  const output = path.join(outDir, `f${String(frame).padStart(3, '0')}.png`);
  await renderStill({composition, serveUrl, output, frame, puppeteerInstance: browser, browserExecutable, overwrite: true});
  console.log('ok', output);
}
await browser.close({silent: true});
