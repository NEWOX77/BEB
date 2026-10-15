import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COLORS, FONT_FAMILY, LAYOUT, withAlpha} from '../config/brand';
import {MATERIELS} from '../config/content';
import {DirectionalBlur} from '../components/DirectionalBlur';
import {EnergyLayer, EnergyPath} from '../components/EnergyPath';
import {Label, Slam, Ticker} from '../components/Kinetic';
import {Picto} from '../components/Picto';
import {RevealLines} from '../components/RevealLines';
import {fitFontSize, measure} from '../lib/fonts';
import {chamferFrame} from '../lib/geometry';
import {EASE, lerp, progress} from '../lib/motion';
import {localCue} from '../lib/timeline';

const PUSH = 10;

/** 12,5–17 s — Matériels en location : trois cartes poussées sur le temps, pictogrammes tracés au trait. */
export const Materiels: React.FC = () => {
  const frame = useCurrentFrame();
  const starts = [1, 2, 3].map((i) => localCue('materiels', `materiels.c${i}`));
  const fsName = Math.min(...MATERIELS.cards.flatMap((c) => c.name.map((n) => fitFontSize(n, LAYOUT.contentWidth, 700, 124, -0.02))));
  const cur = starts.filter((s) => frame >= s - PUSH).length - 1;

  return (
    <AbsoluteFill style={{background: COLORS.black, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: LAYOUT.marginX, top: 272, display: 'flex', gap: 22, alignItems: 'baseline'}}>
        <Slam at={0} from={1.15}>
          <Label>{MATERIELS.label}</Label>
        </Slam>
        <Label color={withAlpha(COLORS.white, 0.45)}>{`0${Math.max(0, cur) + 1} / 03`}</Label>
      </div>

      {MATERIELS.cards.map((card, i) => {
        const s = starts[i];
        // le contenu de la carte entrante est déjà là pendant la poussée
        const c0 = i === 0 ? s : s - PUSH;
        const next = starts[i + 1];
        const xIn = i === 0 ? 0 : lerp(1080, 0, progress(frame, s - PUSH, PUSH, EASE.inOut));
        const xOut = next === undefined ? 0 : lerp(0, -1080, progress(frame, next - PUSH, PUSH, EASE.inOut));
        const x = xIn + xOut;
        if (x >= 1080 || x <= -1080) return null;
        const xf = (t: number) =>
          (i === 0 ? 0 : lerp(1080, 0, progress(t, s - PUSH, PUSH, EASE.inOut))) + (next === undefined ? 0 : lerp(0, -1080, progress(t, next - PUSH, PUSH, EASE.inOut)));
        const v = xf(frame + 0.5) - xf(frame - 0.5);
        const fsSpec = 72;
        const tagW = measure(card.tag, 26, 600, 0.14) + 44;
        return (
          <DirectionalBlur key={card.picto} x={v * 0.25} style={{position: 'absolute', inset: 0, transform: `translateX(${x}px)`}}>
            <div style={{position: 'absolute', left: 540 - 260, top: 380}}>
              <Picto kind={card.picto} width={520} progress={progress(frame, c0, 26, EASE.out)} />
            </div>
            <div style={{position: 'absolute', left: LAYOUT.marginX, top: 840}}>
              <RevealLines lines={card.name} start={c0 + 2} fontSize={fsName} stagger={3} duration={12} />
            </div>
            <div style={{position: 'absolute', left: LAYOUT.marginX, top: 840 + 2 * fsName * 0.92 + 34}}>
              <RevealLines lines={[card.spec]} start={c0 + 7} fontSize={fsSpec} color={COLORS.orange} duration={12} letterSpacingEm={-0.01} />
            </div>
            <div
              style={{
                position: 'absolute',
                left: LAYOUT.marginX + 22,
                top: 840 + 2 * fsName * 0.92 + 34 + fsSpec + 34,
                height: 56,
                display: 'flex',
                alignItems: 'center',
                fontFamily: FONT_FAMILY,
                fontWeight: 600,
                fontSize: 26,
                letterSpacing: '0.14em',
                color: COLORS.white,
                whiteSpace: 'nowrap',
                opacity: progress(frame, c0 + 12, 8, EASE.out),
              }}
            >
              {card.tag}
            </div>
            <EnergyLayer>
              <EnergyPath d={chamferFrame({x: LAYOUT.marginX, y: 840 + 2 * fsName * 0.92 + 34 + fsSpec + 34, w: tagW, h: 56}, 12)} to={progress(frame, c0 + 8, 14, EASE.out)} width={2.5} head={false} />
            </EnergyLayer>
          </DirectionalBlur>
        );
      })}

      <div style={{position: 'absolute', left: 0, top: 1372, width: 1080, height: 2, background: withAlpha(COLORS.white, 0.15)}} />
      <Ticker text={MATERIELS.ticker} fontSize={28} speed={5} color={withAlpha(COLORS.white, 0.55)} style={{top: 1392, opacity: progress(frame, 6, 12, EASE.out)}} />
      <div style={{position: 'absolute', left: 0, top: 1446, width: 1080, height: 2, background: withAlpha(COLORS.white, 0.15)}} />
    </AbsoluteFill>
  );
};
