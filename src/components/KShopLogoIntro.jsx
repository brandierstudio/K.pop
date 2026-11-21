import React, { useEffect, useRef, useState } from 'react';
import './KShopLogoIntro.css';

/**
 * K.Shop Pop native opening animation.
 * Uses three independent SVG paths; no video, screenshot, image requests,
 * external animation libraries, or changes to the underlying store.
 */
const SEEN_KEY = 'kshop-pop-intro-seen-v1';
const DURATION = 3.46;

const clamp = (value) => Math.max(0, Math.min(1, value));
const mix = (from, to, progress) => from + (to - from) * progress;
const outQuint = (x) => 1 - Math.pow(1 - x, 5);
const inOutCubic = (x) =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

function shouldShowIntro() {
  if (typeof window === 'undefined') return false;
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    return window.sessionStorage.getItem(SEEN_KEY) !== '1';
  } catch {
    return true;
  }
}

export default function KShopLogoIntro() {
  const [visible, setVisible] = useState(shouldShowIntro);
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const centerRef = useRef(null);
  const logoRef = useRef(null);
  const leftCurtainRef = useRef(null);
  const rightCurtainRef = useRef(null);
  const finishRef = useRef(() => {});

  useEffect(() => {
    if (!visible) return undefined;

    const originalOverflow = document.body.style.overflow;
    const lastFocused = document.activeElement;
    const left = leftRef.current;
    const right = rightRef.current;
    const center = centerRef.current;
    const logo = logoRef.current;
    const curtainLeft = leftCurtainRef.current;
    const curtainRight = rightCurtainRef.current;

    if (!left || !right || !center || !logo || !curtainLeft || !curtainRight) {
      setVisible(false);
      return undefined;
    }

    let raf = 0;
    let fallbackTimer = 0;
    let completed = false;

    const render = (time) => {
      // The central group's transform is a literal SVG constant, never animated.
      const assemble = outQuint(clamp((time - 0.46) / 0.77));
      const open = inOutCubic(clamp((time - 2.75) / 0.68));
      const releaseDistance = open * 380;
      left.setAttribute('transform', 'translate(' + (mix(-970, 0, assemble) - releaseDistance) + ' 0)');
      right.setAttribute('transform', 'translate(' + (mix(970, 0, assemble) + releaseDistance) + ' 0)');

      const white = inOutCubic(clamp((time - 1.62) / 0.5));
      const channel = Math.round(white * 255);
      center.setAttribute('fill', 'rgb(' + channel + ',' + channel + ',' + channel + ')');

      // Subtle glow belongs to the center ONLY. Outer elements stay pure black.
      const charge = 0.18 + 0.12 * Math.sin(time * 6) ** 2;
      const collision = Math.max(0, 1 - Math.abs(time - 1.31) / 0.18);
      const becomingWhite = Math.max(0, 1 - Math.abs(time - 1.86) / 0.48);
      const glow = (charge + collision * 0.34 + becomingWhite * 0.46) * (1 - open);
      const glowRgb = white > 0.52 ? '255,255,255' : '65,65,65';
      center.style.filter =
        'drop-shadow(0 0 ' + mix(1.5, 7, glow).toFixed(2) +
        'px rgba(' + glowRgb + ',' + (glow * 0.77).toFixed(3) + '))';

      // During unlock, the vector fades early so the REAL website is unobstructed.
      center.style.opacity = String(1 - clamp((time - 2.66) / 0.21));
      const sideOpacity = 1 - clamp((time - 2.75) / 0.22);
      left.style.opacity = String(sideOpacity);
      right.style.opacity = String(sideOpacity);
      logo.style.opacity = String(1 - clamp((time - 2.76) / 0.28));

      // These panels are real DOM layers over the mounted K.Shop Pop page.
      curtainLeft.style.transform = 'translate3d(' + (-open * 100) + '%,0,0)';
      curtainRight.style.transform = 'translate3d(' + (open * 100) + '%,0,0)';
    };

    const finish = () => {
      if (completed) return;
      completed = true;
      window.cancelAnimationFrame(raf);
      window.clearTimeout(fallbackTimer);
      document.body.style.overflow = originalOverflow;
      try { window.sessionStorage.setItem(SEEN_KEY, '1'); } catch {}
      setVisible(false);
      if (lastFocused && lastFocused !== document.body && typeof lastFocused.focus === 'function') {
        try { lastFocused.focus({ preventScroll: true }); } catch {}
      }
    };
    finishRef.current = finish;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') finish();
      // The overlay contains one control. Prevent keyboard tabbing into hidden content.
      if (event.key === 'Tab') {
        event.preventDefault();
        const skip = document.querySelector('[data-kshop-intro-skip]');
        if (skip) skip.focus();
      }
    };

    const startTime = performance.now();
    const tick = (now) => {
      if (completed) return;
      const elapsed = (now - startTime) / 1000;
      render(elapsed);
      if (elapsed >= DURATION) finish();
      else raf = window.requestAnimationFrame(tick);
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);
    render(0);
    raf = window.requestAnimationFrame(tick);
    // Failsafe: never leave a visitor behind the overlay if the tab is throttled.
    fallbackTimer = window.setTimeout(finish, 6500);

    return () => {
      completed = true;
      window.cancelAnimationFrame(raf);
      window.clearTimeout(fallbackTimer);
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="kshop-intro-overlay" role="dialog" aria-modal="true" aria-label="K.Shop Pop opening">
      <div ref={leftCurtainRef} className="kshop-intro-curtain kshop-intro-curtain--left" aria-hidden="true" />
      <div ref={rightCurtainRef} className="kshop-intro-curtain kshop-intro-curtain--right" aria-hidden="true" />

      <div className="kshop-intro-logo" ref={logoRef} aria-hidden="true">
        <svg viewBox="500 200 540 450" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
          <g ref={leftRef} fill="#000000">
            <path d="M605,256 L585,268 L569,284 L562,294 L555,308 L549,328 L549,334 L548,335 L548,517 L551,532 L558,550 L571,569 L583,581 L599,592 L612,598 L625,602 L635,603 L636,604 L768,604 L701,523 L631,441 L629,437 L629,431 L631,427 L642,415 L665,385 L744,307 L807,247 L637,247 L636,248 L625,249 Z" />
          </g>
          <g ref={rightRef} fill="#000000">
            <path d="M856,247 L719,399 L707,411 L703,418 L703,424 L862,604 L954,604 L967,599 L975,593 L980,587 L985,578 L988,561 L984,546 L975,535 L927,485 L873,426 L976,324 L979,320 L982,312 L982,295 L979,285 L971,271 L961,261 L946,252 L928,247 Z" />
          </g>
          <g transform="translate(-63 9)">
            <path ref={centerRef} fill="#000000" d="M895,258 L853,258 L850,261 L847,261 L844,264 L838,267 L827,281 L810,298 L807,303 L783,328 L744,373 L726,391 L723,396 L705,415 L704,418 L705,427 L738,463 L747,475 L762,490 L771,502 L786,517 L795,529 L807,541 L816,553 L837,575 L840,580 L856,596 L858,596 L862,599 L874,599 L877,596 L880,596 L884,592 L890,580 L890,571 L886,563 L761,427 L761,414 L764,409 L775,398 L777,394 L794,376 L803,364 L815,352 L824,340 L836,328 L838,324 L854,307 L863,295 L896,259 Z" />
          </g>
        </svg>
      </div>

      <button
        type="button"
        className="kshop-intro-skip"
        data-kshop-intro-skip=""
        onClick={() => finishRef.current()}
        aria-label="Skip opening animation"
      >
        Skip intro <span aria-hidden="true">↗</span>
      </button>
    </div>
  );
}
