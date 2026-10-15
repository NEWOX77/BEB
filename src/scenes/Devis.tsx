import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COLORS, FONT_FAMILY, LAYOUT, withAlpha} from '../config/brand';
import {DEVIS} from '../config/content';
import {BebLogo, logoMetrics} from '../components/BebLogo';
import {Ticker} from '../components/Kinetic';
import {RevealLines} from '../components/RevealLines';
import {fitFontSize} from '../lib/fonts';
import {EASE, progress} from '../lib/motion';
import {localCue} from '../lib/timeline';

const LOGO_W = 340;
const LOGO_TOP = 280;

/** 28–34 s — Appel à l'action : « UN PROJET ? UNE URGENCE ? » → bouton « DEMANDEZ VOTRE DEVIS », téléphone, site. */
export const Devis: React.FC = () => {
  const frame = useCurrentFrame();
  const l1 = localCue('devis', 'devis.l1');
  const l2 = localCue('devis', 'devis.l2');
  const btnAt = localCue('devis', 'devis.button');
  const contactAt = localCue('devis', 'devis.contact');
  const m = logoMetrics(LOGO_W);
  const top = LOGO_TOP + m.height + m.protection + 20;
  const fs = Math.min(...DEVIS.lines.map((l) => fitFontSize(l, LAYOUT.contentWidth, 700, 132, -0.015)));
  const btn = {x: LAYOUT.marginX, y: top + 2 * fs * 0.92 + 70, w: LAYOUT.contentWidth, h: 150};
  const fill = progress(frame, btnAt, 10, EASE.out);
  const fsBtn = fitFontSize(DEVIS.button, btn.w - 180, 700, 64, 0);
  const letter = (i: number) => progress(frame, 2 + i * 3, 10, EASE.out);
  // Reflet qui balaie le bouton toutes les 1,5 s pendant la tenue finale
  const glintT = frame - (btnAt + 24);
  const glint = glintT > 0 ? (glintT % 45) / 18 : -1;
  const nudge = frame > btnAt + 16 ? Math.sin(((frame - btnAt) / 15) * Math.PI) * 8 : 0;
  const c = 30;
  return (
    <AbsoluteFill style={{background: COLORS.black}}>
      <div style={{position: 'absolute', left: LAYOUT.marginX, top: LOGO_TOP}}>
        <BebLogo width={LOGO_W} reveal={[letter(0), letter(1), letter(2)]} />
      </div>
      <div style={{position: 'absolute', left: LAYOUT.marginX, top}}>
        <RevealLines lines={[DEVIS.lines[0]]} start={l1} fontSize={fs} duration={12} />
      </div>
      <div style={{position: 'absolute', left: LAYOUT.marginX, top: top + fs * 0.92}}>
        <RevealLines lines={[DEVIS.lines[1]]} start={l2} fontSize={fs} duration={12} />
      </div>

      <div
        style={{
          position: 'absolute',
          left: btn.x,
          top: btn.y,
          width: btn.w,
          height: btn.h,
          background: COLORS.orange,
          clipPath: `polygon(0 0, ${btn.w * fill - c}px 0, ${btn.w * fill}px ${c}px, ${btn.w * fill}px 100%, ${c}px 100%, 0 calc(100% - ${c}px))`,
          overflow: 'hidden',
        }}
      >
        {glint >= 0 && glint <= 1 ? (
          <div style={{position: 'absolute', top: 0, left: -300 + glint * (btn.w + 600), width: 220, height: '100%', background: `linear-gradient(100deg, transparent, ${withAlpha(COLORS.white, 0.45)}, transparent)`}} />
        ) : null}
        <div
          style={{
            position: 'absolute',
            left: 44,
            top: 0,
            height: btn.h,
            display: 'flex',
            alignItems: 'center',
            fontFamily: FONT_FAMILY,
            fontWeight: 700,
            fontSize: fsBtn,
            letterSpacing: '0.01em',
            color: COLORS.black,
            whiteSpace: 'nowrap',
            opacity: progress(frame, btnAt + 4, 6, EASE.out),
            transform: `translateX(${(1 - progress(frame, btnAt + 4, 12, EASE.out)) * -30}px)`,
          }}
        >
          {DEVIS.button}
        </div>
        <div
          style={{
            position: 'absolute',
            right: 44,
            top: 0,
            height: btn.h,
            display: 'flex',
            alignItems: 'center',
            fontFamily: FONT_FAMILY,
            fontWeight: 500,
            fontSize: 80,
            color: COLORS.black,
            opacity: progress(frame, btnAt + 8, 6, EASE.out),
            transform: `translateX(${nudge}px)`,
          }}
        >
          →
        </div>
      </div>

      <div style={{position: 'absolute', left: LAYOUT.marginX, top: btn.y + btn.h + 52}}>
        <RevealLines lines={[DEVIS.phone]} start={contactAt} fontSize={92} weight={700} lineHeight={1} letterSpacingEm={0} duration={12} />
      </div>
      <div style={{position: 'absolute', left: LAYOUT.marginX, top: btn.y + btn.h + 52 + 92 + 30}}>
        <RevealLines lines={[DEVIS.website]} start={contactAt + 6} fontSize={48} weight={500} lineHeight={1.1} letterSpacingEm={0.01} color={COLORS.grey} duration={12} />
      </div>

      <div style={{position: 'absolute', left: 0, top: 1420, width: 1080, height: 2, background: withAlpha(COLORS.white, 0.12), opacity: progress(frame, contactAt + 6, 10, EASE.out)}} />
      <Ticker text={DEVIS.ticker} fontSize={30} speed={2.5} color={COLORS.orange} tracking={0.3} style={{top: 1440, opacity: progress(frame, contactAt + 6, 14, EASE.out)}} />
    </AbsoluteFill>
  );
};
