import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COLORS, FONT_FAMILY, LAYOUT, withAlpha} from '../config/brand';
import {HOOK} from '../config/content';
import {Accent} from '../components/Accent';
import {EnergyLayer, EnergyPath} from '../components/EnergyPath';
import {Label, Slam} from '../components/Kinetic';
import {RevealLines} from '../components/RevealLines';
import {fitFontSize, measure} from '../lib/fonts';
import {EASE, progress} from '../lib/motion';
import {cue} from '../lib/timeline';

// Un aplat différent à chaque mot : noir, orange, blanc, noir
const LOOKS = [
  {bg: COLORS.black, ink: COLORS.white, label: withAlpha(COLORS.white, 0.6)},
  {bg: COLORS.orange, ink: COLORS.black, label: COLORS.black},
  {bg: COLORS.white, ink: COLORS.black, label: COLORS.orange},
  {bg: COLORS.black, ink: COLORS.orange, label: withAlpha(COLORS.white, 0.6)},
];

/** 00–03 s — Quatre contextes en rafale sur les croches, la question, la réponse. */
export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const wordCues = ['hook.w1', 'hook.w2', 'hook.w3', 'hook.w4'].map(cue);
  const qAt = cue('hook.q');
  const aAt = cue('hook.a');
  const idx = wordCues.filter((c) => frame >= c).length - 1;
  const fsWord = Math.min(...HOOK.words.map((w) => fitFontSize(w, LAYOUT.contentWidth, 700, 210, -0.02)));
  const fsQ = fitFontSize(HOOK.question[1], LAYOUT.contentWidth, 700, 170, -0.015);
  const fsA = fitFontSize(HOOK.answer[1], LAYOUT.contentWidth, 700, 170, -0.015);
  const look = frame < qAt ? LOOKS[Math.max(0, idx)] : LOOKS[0];

  const word = HOOK.words[Math.max(0, idx)];
  const wordW = measure(word, fsWord, 700, -0.02);
  const barP = frame < qAt ? progress(frame, wordCues[Math.max(0, idx)], 7, EASE.out) : 0;

  const qUnder = 700 + 2 * fsQ * 0.92 + 30;
  return (
    <AbsoluteFill style={{background: look.bg}}>
      {frame < qAt ? (
        <>
          <Label color={look.label} style={{position: 'absolute', left: LAYOUT.marginX, top: 640}}>
            {HOOK.label}
          </Label>
          <Slam key={idx} at={wordCues[Math.max(0, idx)]} from={1.18} duration={7} style={{position: 'absolute', left: LAYOUT.marginX, top: 720}}>
            <div style={{fontFamily: FONT_FAMILY, fontWeight: 700, fontSize: fsWord, letterSpacing: '-0.02em', lineHeight: 1, color: look.ink, whiteSpace: 'nowrap'}}>{word}</div>
          </Slam>
          <div style={{position: 'absolute', left: LAYOUT.marginX, top: 720 + fsWord * 1.02, width: wordW * barP, height: 14, background: idx === 1 ? COLORS.black : COLORS.orange}} />
        </>
      ) : null}

      {frame >= qAt && frame < aAt + 2 ? (
        <div style={{position: 'absolute', left: LAYOUT.marginX, top: 700}}>
          <RevealLines lines={HOOK.question} start={qAt} fontSize={fsQ} stagger={5} duration={12} exitAt={aAt - 4} exitDuration={6} />
        </div>
      ) : null}
      {frame >= qAt && frame < aAt ? (
        <EnergyLayer>
          <EnergyPath d={`M ${LAYOUT.marginX} ${qUnder} L ${LAYOUT.marginX + LAYOUT.contentWidth} ${qUnder}`} to={progress(frame, qAt + 6, 14, EASE.out)} width={8} />
        </EnergyLayer>
      ) : null}

      {frame >= aAt ? (
        <>
          <Slam at={aAt} from={1.15} duration={8} style={{position: 'absolute', left: LAYOUT.marginX, top: 700}}>
            <div style={{fontFamily: FONT_FAMILY, fontWeight: 700, fontSize: fsA, letterSpacing: '-0.015em', lineHeight: 0.92, color: COLORS.white}}>{HOOK.answer[0]}</div>
          </Slam>
          <Slam at={aAt + 5} from={1.15} duration={8} style={{position: 'absolute', left: LAYOUT.marginX, top: 700 + fsA * 0.92}}>
            <div style={{fontFamily: FONT_FAMILY, fontWeight: 700, fontSize: fsA, letterSpacing: '-0.015em', lineHeight: 0.92, color: COLORS.white, whiteSpace: 'nowrap'}}>
              <Accent text={HOOK.answer[1]} />
            </div>
          </Slam>
        </>
      ) : null}
    </AbsoluteFill>
  );
};
