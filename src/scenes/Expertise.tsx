import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COLORS, FONT_FAMILY, LAYOUT, withAlpha} from '../config/brand';
import {Expertise as ExpertiseData} from '../config/content';
import {EnergyLayer, EnergyPath, SweepLine} from '../components/EnergyPath';
import {Photo, lerpView, toScreen} from '../components/Photo';
import {RevealLines} from '../components/RevealLines';
import {DirectionalBlur} from '../components/DirectionalBlur';
import {fitFontSize, measure} from '../lib/fonts';
import {Rect, chamferFrame} from '../lib/geometry';
import {EASE, lerp, progress} from '../lib/motion';
import {TRANSITION_TAIL} from '../lib/timeline';

export const IMAGE_TOP = 740;
export const IMAGE_FRAME: Rect = {x: 0, y: IMAGE_TOP, w: 1080, h: 1920 - IMAGE_TOP};
const WORD_TOP = 330;
const WIPE = 14;

export type Entry = 'up' | 'right' | 'down';

/** Cadrage de la photo à l'image locale `f` (mouvement continu, y compris sous la transition suivante). */
export const expertiseView = (e: ExpertiseData, f: number) =>
  lerpView(e.viewFrom, e.viewTo, progress(f, 0, 90 + TRANSITION_TAIL, EASE.drift));

/** Rectangle écran du détail technique encadré (suit le mouvement de caméra). */
export const markerRect = (e: ExpertiseData, f: number, pad = 14): Rect | null => {
  if (!e.marker) return null;
  const v = expertiseView(e, f);
  const a = toScreen(v, IMAGE_FRAME, e.marker.x, e.marker.y);
  const b = toScreen(v, IMAGE_FRAME, e.marker.x + e.marker.w, e.marker.y + e.marker.h);
  return {x: a.x - pad, y: a.y - pad, w: b.x - a.x + 2 * pad, h: b.y - a.y + 2 * pad};
};

const wipePos = (entry: Entry, p: number) =>
  entry === 'up' ? lerp(1940, -20, p) : entry === 'right' ? lerp(-20, 1100, p) : lerp(-20, 1940, p);

/** Mot principal : lettres qui montent une à une dans leur masque (décalage d'une image). */
const Word: React.FC<{text: string; fontSize: number; color: string; start: number}> = ({text, fontSize, color, start}) => {
  const frame = useCurrentFrame();
  const box = fontSize * 0.86;
  const letters = [...text];
  return (
    <div style={{overflow: 'hidden', height: box + fontSize * 0.06, whiteSpace: 'nowrap'}}>
      {letters.map((ch, i) => {
        const f = (t: number) => (1 - progress(t, start + i * 1.1, 16, EASE.out)) * box * 1.12;
        const y = f(frame);
        const v = f(frame + 0.5) - f(frame - 0.5);
        return (
          <DirectionalBlur key={i} y={v * 0.2} style={{display: 'inline-block', transform: `translateY(${y}px)`}}>
            <span
              style={{
                fontFamily: FONT_FAMILY,
                fontWeight: 700,
                fontSize,
                lineHeight: `${box}px`,
                letterSpacing: '-0.02em',
                color,
              }}
            >
              {ch}
            </span>
          </DirectionalBlur>
        );
      })}
    </div>
  );
};

/**
 * 07–16 s — LES TROIS EXPERTISES (une instance par activité, 3 s chacune)
 * Logique commune : index, mot plein cadre, soulignement par le tracé, sous-titre, fait vérifié, photo.
 * Variation de mouvement : élévation (vente), travelling latéral (location), poussée + mise au point (maintenance).
 */
export const Expertise: React.FC<{data: ExpertiseData; entry: Entry}> = ({data, entry}) => {
  const frame = useCurrentFrame();
  const dark = data.theme === 'dark';
  const bg = dark ? COLORS.black : COLORS.white;
  const ink = dark ? COLORS.white : COLORS.black;

  // Transition d'entrée : le tracé balaie l'écran et découvre la séquence
  const wp = progress(frame, 0, WIPE, EASE.inOut);
  const pos = wipePos(entry, wp);
  const vel = wipePos(entry, progress(frame + 0.5, 0, WIPE, EASE.inOut)) - wipePos(entry, progress(frame - 0.5, 0, WIPE, EASE.inOut));
  const clip =
    wp >= 1
      ? undefined
      : entry === 'up'
        ? `inset(${pos.toFixed(2)}px 0 0 0)`
        : entry === 'right'
          ? `inset(0 ${(1080 - pos).toFixed(2)}px 0 0)`
          : `inset(0 0 ${(1920 - pos).toFixed(2)}px 0)`;

  // Typographie
  const fsWord = fitFontSize(data.word, LAYOUT.contentWidth, 700, 228, -0.02);
  const wordW = Math.min(LAYOUT.contentWidth, measure(data.word, fsWord, 700, -0.02));
  const underlineY = WORD_TOP + fsWord * 0.86 + 22;
  const subTop = underlineY + 40;
  const fsSub = 50;
  const tagTop = subTop + fsSub * 1.12 * data.sub.length + 34;
  const fsTag = 27;
  const tagW = measure(data.tag, fsTag, 600, 0.14) + 48;
  const tagH = 58;

  // Image
  const view = expertiseView(data, frame);
  const focus = data.id === 'maintenance' ? progress(frame, 2, 24, EASE.out) : 1;
  const marker = markerRect(data, frame);

  return (
    <AbsoluteFill>
    <AbsoluteFill style={{clipPath: clip}}>
      <AbsoluteFill style={{background: bg, isolation: 'isolate'}}>
        <Photo
          media={data.media}
          view={view}
          frame={IMAGE_FRAME}
          blend={dark ? 'lighten' : 'normal'}
          filter={focus < 1 ? `blur(${((1 - focus) * 9).toFixed(2)}px)` : undefined}
        />
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: IMAGE_TOP - 2,
            width: 1080,
            height: 230,
            background: `linear-gradient(180deg, ${bg} 0%, ${withAlpha(bg, 0.6)} 45%, ${withAlpha(bg, 0)} 100%)`,
          }}
        />
      </AbsoluteFill>

      <div style={{position: 'absolute', left: LAYOUT.marginX, top: 268}}>
        <RevealLines
          lines={[`[${data.index}]  /  03`]}
          start={5}
          fontSize={30}
          weight={600}
          letterSpacingEm={0.16}
          color={withAlpha(ink, 0.45)}
          duration={14}
        />
      </div>

      <div style={{position: 'absolute', left: LAYOUT.marginX, top: WORD_TOP}}>
        <Word text={data.word} fontSize={fsWord} color={ink} start={7} />
      </div>

      <div style={{position: 'absolute', left: LAYOUT.marginX, top: subTop}}>
        <RevealLines lines={data.sub} start={20} fontSize={fsSub} weight={400} lineHeight={1.12} letterSpacingEm={-0.005} color={withAlpha(ink, dark ? 0.9 : 0.85)} stagger={3} />
      </div>

      <div
        style={{
          position: 'absolute',
          left: LAYOUT.marginX + 24,
          top: tagTop,
          height: tagH,
          display: 'flex',
          alignItems: 'center',
          fontFamily: FONT_FAMILY,
          fontSize: fsTag,
          fontWeight: 600,
          letterSpacing: '0.14em',
          color: ink,
          whiteSpace: 'nowrap',
          opacity: progress(frame, 36, 10, EASE.out),
          transform: `translateX(${(1 - progress(frame, 36, 14, EASE.out)) * -16}px)`,
        }}
      >
        {data.tag}
      </div>

      <EnergyLayer>
        <EnergyPath d={`M ${LAYOUT.marginX} ${underlineY} L ${LAYOUT.marginX + wordW} ${underlineY}`} to={progress(frame, 14, 18, EASE.out)} width={6} />
        <EnergyPath d={chamferFrame({x: LAYOUT.marginX, y: tagTop, w: tagW, h: tagH}, 12)} to={progress(frame, 30, 16, EASE.out)} width={2.5} head={false} />
        {marker ? <EnergyPath d={chamferFrame(marker, 12)} to={progress(frame, 40, 18, EASE.out)} width={3} /> : null}
      </EnergyLayer>
    </AbsoluteFill>
    {wp > 0 && wp < 1 ? (
      <EnergyLayer>
        <SweepLine axis={entry === 'right' ? 'x' : 'y'} pos={pos} velocity={vel} length={entry === 'right' ? 1920 : 1080} />
      </EnergyLayer>
    ) : null}
    </AbsoluteFill>
  );
};
