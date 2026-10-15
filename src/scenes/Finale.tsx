import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COLORS, FONT_FAMILY, LAYOUT, withAlpha} from '../config/brand';
import {CTA, SIGNATURE} from '../config/content';
import {BebLogo, logoMetrics} from '../components/BebLogo';
import {EnergyLayer, EnergyPath} from '../components/EnergyPath';
import {Photo} from '../components/Photo';
import {RevealLines} from '../components/RevealLines';
import {TechGrid} from '../components/TechGrid';
import {fitFontSize} from '../lib/fonts';
import {chamferFrame, lerpRect} from '../lib/geometry';
import {EASE, lerp, progress} from '../lib/motion';
import {localCue} from '../lib/timeline';
import {WINDOW, WINDOW_CHAMFER} from './Terrain';

// Signature : logo centré, zone de protection respectée (≥ hauteur du B tout autour)
const SIG_LOGO_W = 640;
const SIG_LOGO_TOP = 590;
// Appel à l'action : logo en haut à gauche
const CTA_LOGO_W = 340;
const CTA_LOGO_TOP = 280;

/**
 * 22–30 s — SIGNATURE puis APPEL À L'ACTION (une seule scène : le logo reste à l'écran et se déplace).
 * Le cadre du terrain se resserre en un trait sous le logo ; ce trait devient ensuite le bouton de contact.
 */
export const Finale: React.FC = () => {
  const frame = useCurrentFrame();
  const sigLogo = localCue('signature', 'signature.logo');
  const sigText = localCue('signature', 'signature.text');
  const ctaIn = localCue('signature', 'cta.in');
  const ctaL1 = localCue('signature', 'cta.l1');
  const ctaL2 = localCue('signature', 'cta.l2');
  const ctaContact = localCue('signature', 'cta.contact');

  const sig = logoMetrics(SIG_LOGO_W);
  const ruleY = SIG_LOGO_TOP + sig.height + sig.protection;
  const ruleRect = {x: 540 - 60, y: ruleY, w: 120, h: 0};

  // Le cadre se resserre (rythme ralenti : courbes plus longues)
  const collapse = progress(frame, 0, 28, EASE.inOut);
  const frameRect = lerpRect(WINDOW, ruleRect, collapse);
  const ruleOut = progress(frame, ctaIn - 4, 14, EASE.in);

  // Logo : révélation lettre par lettre puis déplacement vers l'appel à l'action
  const letter = (i: number) => progress(frame, sigLogo + i * 4, 22, EASE.out);
  const move = progress(frame, ctaIn, 26, EASE.inOut);
  const logoW = lerp(SIG_LOGO_W, CTA_LOGO_W, move);
  const logoX = lerp(540 - SIG_LOGO_W / 2, LAYOUT.marginX, move);
  const logoY = lerp(SIG_LOGO_TOP, CTA_LOGO_TOP, move);

  const glow = progress(frame, 8, 40, EASE.drift) * (1 - move);

  // Appel à l'action
  const cta = logoMetrics(CTA_LOGO_W);
  const ctaTop = CTA_LOGO_TOP + cta.height + cta.protection + 20;
  const fsCta = fitFontSize(CTA.lines[0], LAYOUT.contentWidth, 700, 128, -0.015);
  const lines2Top = ctaTop + fsCta * 0.92 + 6;
  const btn = {x: LAYOUT.marginX, y: lines2Top + 2 * fsCta * 0.92 + 64, w: LAYOUT.contentWidth, h: 132};
  const btnDraw = progress(frame, ctaContact - 3, 22, EASE.out);
  const machineIn = progress(frame, ctaIn + 6, 40, EASE.out);

  return (
    <AbsoluteFill style={{background: COLORS.black, isolation: 'isolate'}}>
      <TechGrid opacity={0.45 * (1 - move)} />
      <div
        style={{
          position: 'absolute',
          left: 540 - 560,
          top: SIG_LOGO_TOP + sig.height / 2 - 380,
          width: 1120,
          height: 760,
          background: `radial-gradient(ellipse at 50% 50%, ${withAlpha(COLORS.white, 0.075)} 0%, transparent 62%)`,
          opacity: glow,
        }}
      />

      {/* Le héros revient en pied de composition finale */}
      <div style={{position: 'absolute', inset: 0, opacity: machineIn, transform: `translateY(${(1 - machineIn) * 50}px)`, mixBlendMode: 'lighten'}}>
        <Photo media="g330_34" view={{cx: 1040, cy: 600, scale: 0.6}} frame={{x: 0, y: 1190, w: 1080, h: 730}} filter="brightness(0.72)" />
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 1188,
            width: 1080,
            height: 220,
            background: `linear-gradient(180deg, ${COLORS.black} 0%, ${withAlpha(COLORS.black, 0)} 100%)`,
          }}
        />
      </div>

      <div style={{position: 'absolute', left: logoX, top: logoY}}>
        <BebLogo width={logoW} reveal={[letter(0), letter(1), letter(2)]} />
      </div>

      <div style={{position: 'absolute', left: 0, width: 1080, top: ruleY + 44}}>
        <RevealLines
          lines={SIGNATURE.lines}
          start={sigText}
          fontSize={92}
          weight={300}
          lineHeight={1.04}
          letterSpacingEm={-0.01}
          stagger={5}
          duration={22}
          align="center"
          exitAt={ctaIn - 4}
          exitDuration={12}
        />
      </div>

      <div style={{position: 'absolute', left: LAYOUT.marginX, top: ctaTop}}>
        <RevealLines lines={CTA.lines} start={ctaL1} fontSize={fsCta} duration={15} />
      </div>
      <div style={{position: 'absolute', left: LAYOUT.marginX, top: lines2Top}}>
        <RevealLines lines={CTA.lines2} start={ctaL2} fontSize={fsCta} stagger={4} duration={15} />
      </div>

      <div style={{position: 'absolute', left: btn.x + 44, top: btn.y + (btn.h - 76 * 1.0) / 2 + 2}}>
        <RevealLines lines={[CTA.phone]} start={ctaContact + 4} fontSize={76} weight={600} lineHeight={1} letterSpacingEm={0.01} duration={15} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: btn.x + btn.w - 104,
          top: btn.y + 22,
          fontFamily: FONT_FAMILY,
          fontWeight: 500,
          fontSize: 76,
          lineHeight: '88px',
          color: COLORS.orange,
          opacity: progress(frame, ctaContact + 10, 10, EASE.out),
          transform: `translateX(${(1 - progress(frame, ctaContact + 10, 16, EASE.out)) * -24}px)`,
        }}
      >
        →
      </div>
      <div style={{position: 'absolute', left: LAYOUT.marginX, top: btn.y + btn.h + 34}}>
        <RevealLines lines={[CTA.website]} start={ctaContact + 10} fontSize={46} weight={500} lineHeight={1.1} letterSpacingEm={0.01} color={COLORS.grey} duration={15} />
      </div>

      <EnergyLayer>
        {collapse < 1 || ruleOut < 1 ? (
          <EnergyPath
            d={collapse < 1 ? chamferFrame(frameRect, lerp(WINDOW_CHAMFER, 0, collapse)) : `M ${ruleRect.x} ${ruleY} L ${ruleRect.x + ruleRect.w} ${ruleY}`}
            from={collapse < 1 ? 0 : ruleOut}
            to={1}
            width={lerp(3, 4, collapse)}
            head={false}
          />
        ) : null}
        <EnergyPath d={chamferFrame(btn, 24)} to={btnDraw} width={3} />
      </EnergyLayer>
    </AbsoluteFill>
  );
};
