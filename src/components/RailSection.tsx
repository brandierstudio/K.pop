import React, { useEffect, useRef, useState } from 'react';
import {
  RAIL_CATEGORIES,
  RAIL_GARMENTS,
  RAIL_SEQUENCE,
  TAG_ROTATIONS,
  computeRailY,
  matchesRailCategory,
  shortestRailIndexDelta,
  wrapRailX,
} from '../data/railData';
import { getBagController } from '../utils/runwayElement';
import { clamp } from '../utils/runwayMath';
import { CurrencyCode, formatPrice } from '../utils/currency';

interface PieceMotionState {
  offset: number;
  swayAngle: number;
  swayVel: number;
}

const ABAYA_NAT_W = 760;
const ABAYA_NAT_H = 1040;

interface RailSectionProps {
  currency: CurrencyCode;
}

export default function RailSection({ currency }: RailSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const railZoneRef = useRef<HTMLDivElement | null>(null);
  const pathShadowRef = useRef<SVGPathElement | null>(null);
  const pathTubeRef = useRef<SVGPathElement | null>(null);
  const pathHighlightRef = useRef<SVGPathElement | null>(null);
  const pieceElsRef = useRef<(HTMLDivElement | null)[]>([]);
  const swayElsRef = useRef<(HTMLDivElement | null)[]>([]);
  const garmentFaceElsRef = useRef<(HTMLDivElement | null)[]>([]);
  const shadowElsRef = useRef<(HTMLDivElement | null)[]>([]);
  const hitElsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const thumbElRef = useRef<HTMLDivElement | null>(null);
  const qvLayerRef = useRef<HTMLDivElement | null>(null);
  const qvImgWrapRef = useRef<HTMLDivElement | null>(null);
  const qvFullFaceRef = useRef<HTMLDivElement | null>(null);
  const qvDetailFaceRef = useRef<HTMLDivElement | null>(null);
  const qvRodRef = useRef<HTMLDivElement | null>(null);

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [qvIdx, setQvIdx] = useState<number | null>(null);
  const [qvView, setQvView] = useState<'full' | 'detail'>('full');
  const [qvSize, setQvSize] = useState<string>('54');
  const [qvMoreOpen, setQvMoreOpen] = useState<boolean>(false);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);

  const hoveredIdxRef = useRef<number | null>(null);
  const qvIdxRef = useRef<number | null>(null);
  const activeCategoryRef = useRef<string>('All');
  const isAddingRef = useRef<boolean>(false);
  const qvTokenRef = useRef<number>(0);

  hoveredIdxRef.current = hoveredIdx;
  qvIdxRef.current = qvIdx;
  activeCategoryRef.current = activeCategory;
  isAddingRef.current = isAdding;

  // Preload all 8 transparent abaya silhouettes
  useEffect(() => {
    let mounted = true;
    const preload = (url: string) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        const done = () => resolve();
        img.onload = () => {
          if (typeof img.decode === 'function') {
            img.decode().then(done).catch(done);
          } else {
            done();
          }
        };
        img.onerror = done;
        img.src = url;
      });

    const failsafe = window.setTimeout(() => {
      if (mounted) setIsReady(true);
    }, 900);

    Promise.all(RAIL_GARMENTS.map((g) => preload(g.image))).then(() => {
      window.clearTimeout(failsafe);
      if (mounted) setIsReady(true);
    });

    return () => {
      mounted = false;
      window.clearTimeout(failsafe);
    };
  }, []);

  // Main Rail Physics, Sizing (--u), Curve Redraw, Inertia & Sway Loop
  useEffect(() => {
    const section = sectionRef.current;
    const railZone = railZoneRef.current;
    if (!section || !railZone) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchDevice = window.matchMedia('(hover: none)').matches;

    let W = section.clientWidth || window.innerWidth;
    let H = section.clientHeight || window.innerHeight;
    let isMobile = W <= 820;
    let u = isMobile ? Math.min(W / 390, H / 780) : Math.min(W / 1440, H / 900);

    let railTop = isMobile ? 250 : 264;
    let railSag = isMobile ? 24 : 62;
    let gap = isMobile ? 90 : 126;
    let gs = isMobile ? 0.315 : 0.445;
    let start = isMobile ? 54 : 118;

    let target = 0;
    let cur = 0;
    let vel = 0;
    let loopW = RAIL_SEQUENCE.length * gap * u;

    const motionStates: PieceMotionState[] = RAIL_SEQUENCE.map(() => ({
      offset: 0,
      swayAngle: 0,
      swayVel: 0,
    }));

    const updateLayoutMetrics = () => {
      if (!section) return;
      const rect = section.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      W = rect.width;
      H = rect.height;
      isMobile = W <= 820;
      u = isMobile ? Math.min(W / 390, H / 780) : Math.min(W / 1440, H / 900);

      railTop = isMobile ? 250 : 264;
      railSag = isMobile ? 24 : 62;
      gap = isMobile ? 90 : 126;
      gs = isMobile ? 0.315 : 0.445;
      start = isMobile ? 54 : 118;

      section.style.setProperty('--u', `${u.toFixed(4)}px`);
      section.style.setProperty('--rail-top', String(railTop));
      section.style.setProperty('--rail-sag', String(railSag));
      section.style.setProperty('--gap', String(gap));
      section.style.setProperty('--gs', String(gs));
      section.style.setProperty('--start', String(start));

      // Continuous infinite rail circumference (always wider than viewport so wrapping happens off-screen)
      loopW = Math.max(W + gap * u * 2, RAIL_SEQUENCE.length * gap * u);

      // Update SVG Quadratic curve
      const y0 = computeRailY(0, W, railTop, railSag, u);
      const yMid = computeRailY(W / 2, W, railTop, railSag, u);
      const yc = 2 * yMid - y0;

      if (pathShadowRef.current) {
        const sy0 = y0 + 4 * u;
        const syc = yc + 4 * u;
        pathShadowRef.current.setAttribute(
          'd',
          `M0 ${sy0.toFixed(2)} Q ${(W / 2).toFixed(2)} ${syc.toFixed(2)} ${W.toFixed(2)} ${sy0.toFixed(2)}`
        );
        pathShadowRef.current.setAttribute('stroke-width', `${(3.2 * u).toFixed(2)}`);
      }
      if (pathTubeRef.current) {
        pathTubeRef.current.setAttribute(
          'd',
          `M0 ${y0.toFixed(2)} Q ${(W / 2).toFixed(2)} ${yc.toFixed(2)} ${W.toFixed(2)} ${y0.toFixed(2)}`
        );
        pathTubeRef.current.setAttribute('stroke-width', `${(5.4 * u).toFixed(2)}`);
      }
      if (pathHighlightRef.current) {
        const hy0 = y0 - 1.3 * u;
        const hyc = yc - 1.3 * u;
        pathHighlightRef.current.setAttribute(
          'd',
          `M0 ${hy0.toFixed(2)} Q ${(W / 2).toFixed(2)} ${hyc.toFixed(2)} ${W.toFixed(2)} ${hy0.toFixed(2)}`
        );
        pathHighlightRef.current.setAttribute('stroke-width', `${(1.1 * u).toFixed(2)}`);
      }

      // Size each hanging abaya face anchored at its centered top hanger hook
      const s = gs * u;
      RAIL_SEQUENCE.forEach((k, i) => {
        const gDef = RAIL_GARMENTS[k];
        if (!gDef) return;

        const faceH = gDef.aspectHeight * s;
        const faceW = faceH * (ABAYA_NAT_W / ABAYA_NAT_H);

        const faceEl = garmentFaceElsRef.current[i];
        if (faceEl) {
          faceEl.style.width = `${faceW.toFixed(2)}px`;
          faceEl.style.height = `${faceH.toFixed(2)}px`;
          faceEl.style.left = `${(-faceW / 2).toFixed(2)}px`;
          faceEl.style.top = '0px';
        }

        const shadowEl = shadowElsRef.current[i];
        if (shadowEl) {
          const shW = 114 * (gs / 0.45) * u;
          const shH = 16 * u;
          shadowEl.style.width = `${shW.toFixed(1)}px`;
          shadowEl.style.height = `${shH.toFixed(1)}px`;
          shadowEl.style.left = `${(-shW / 2).toFixed(1)}px`;
          shadowEl.style.top = `${(faceH + 6 * u).toFixed(1)}px`;
        }

        const hitEl = hitElsRef.current[i];
        if (hitEl) {
          const hitW = gap * u;
          hitEl.style.width = `${hitW.toFixed(1)}px`;
          hitEl.style.height = `${faceH.toFixed(1)}px`;
          hitEl.style.left = `${(-hitW / 2).toFixed(1)}px`;
          hitEl.style.top = '0px';
        }
      });
    };

    updateLayoutMetrics();

    // Intro swing impulse when section enters viewport
    let introDone = false;
    const triggerIntroSwings = () => {
      if (introDone || reducedMotion) return;
      introDone = true;
      RAIL_SEQUENCE.forEach((_, i) => {
        window.setTimeout(() => {
          motionStates[i].swayVel += i % 2 === 0 ? 1.4 : -1.4;
        }, i * 65 + 380);
      });
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          section.classList.add('is-in-view');
          triggerIntroSwings();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(section);

    // Animation loop
    let rafId = 0;
    let lastTime = performance.now();
    const neighborTable = [0, 62, 28, 10, 0];

    const stepFrame = (now: number) => {
      const elapsed = Math.max(1, now - lastTime);
      lastTime = now;
      const dt = Math.min(3, elapsed / 16.667);

      const prevCur = cur;
      if (reducedMotion) {
        cur = target;
        vel = 0;
      } else {
        cur += (target - cur) * (1 - Math.pow(1 - 0.085, dt));
        vel = (cur - prevCur) / dt;
      }

      const hIdx = hoveredIdxRef.current;
      const neighborUnit = (gs / 0.45) * u;

      for (let i = 0; i < RAIL_SEQUENCE.length; i++) {
        const st = motionStates[i];
        let targetOffset = 0;
        if (hIdx !== null && hIdx !== i) {
          const d = shortestRailIndexDelta(hIdx, i, RAIL_SEQUENCE.length);
          const sign = d > 0 ? 1 : -1;
          const mag = neighborTable[Math.min(Math.abs(d), 4)];
          targetOffset = sign * mag * neighborUnit;
        }
        if (reducedMotion) {
          st.offset = targetOffset;
        } else {
          st.offset += (targetOffset - st.offset) * 0.16;
        }

        const rawX = (start + i * gap) * u - cur;
        const wrappedBaseX = wrapRailX(rawX, loopW, W);
        const x = wrappedBaseX + st.offset;
        const y = computeRailY(x, W, railTop, railSag, u) - 3 * u;

        const pieceEl = pieceElsRef.current[i];
        if (pieceEl) {
          pieceEl.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
        }

        if (!reducedMotion) {
          const targetAngle = clamp(-vel * 0.22, -6.5, 6.5);
          st.swayVel += (targetAngle - st.swayAngle) * 0.05 * dt;
          st.swayVel *= Math.pow(0.88, dt);
          st.swayAngle += st.swayVel * dt;
        } else {
          st.swayAngle = 0;
          st.swayVel = 0;
        }

        const swayEl = swayElsRef.current[i];
        if (swayEl) {
          swayEl.style.transform = `rotate(${st.swayAngle.toFixed(2)}deg)`;
        }
      }

      if (thumbElRef.current) {
        const progress = loopW > 0 ? (((cur % loopW) + loopW) % loopW) / loopW : 0;
        thumbElRef.current.style.left = `${(progress * 75).toFixed(2)}%`;
      }

      rafId = window.requestAnimationFrame(stepFrame);
    };

    rafId = window.requestAnimationFrame(stepFrame);

    // Pointer Drag on Rail Zone
    let pDown = false;
    let pId = -1;
    let startX = 0;
    let startY = 0;
    let startTarget = 0;
    let isDragging = false;
    let suppressClickUntil = 0;
    let dragSamples: { x: number; t: number }[] = [];

    const onPointerDown = (e: PointerEvent) => {
      if (qvIdxRef.current !== null) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      pDown = true;
      isDragging = false;
      pId = e.pointerId;
      startX = e.clientX;
      startY = e.clientY;
      startTarget = target;
      dragSamples = [{ x: e.clientX, t: performance.now() }];
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!pDown || e.pointerId !== pId) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (!isDragging) {
        if (isTouchDevice && Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) {
          pDown = false;
          return;
        }
        if (Math.abs(dx) > 6) {
          isDragging = true;
          railZone.classList.add('is-dragging');
          setHoveredIdx(null);
          try {
            railZone.setPointerCapture(e.pointerId);
          } catch {
            // ignore
          }
        }
      }

      if (isDragging) {
        const now = performance.now();
        dragSamples.push({ x: e.clientX, t: now });
        if (dragSamples.length > 6) dragSamples.shift();
        target = startTarget - dx * 1.15;
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!pDown || e.pointerId !== pId) return;
      pDown = false;
      if (!isDragging) return;
      isDragging = false;
      railZone.classList.remove('is-dragging');
      suppressClickUntil = performance.now() + 80;

      const first = dragSamples[0];
      const last = dragSamples[dragSamples.length - 1];
      const dtMs = Math.max(1, last.t - first.t);
      const releaseVelocity = (last.x - first.x) / dtMs;
      target = target - releaseVelocity * 280;
    };

    const onCaptureClick = (e: MouseEvent) => {
      if (performance.now() < suppressClickUntil) {
        e.stopPropagation();
        e.preventDefault();
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (qvIdxRef.current !== null) return;
      const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      if (isHorizontal || e.shiftKey) {
        e.preventDefault();
        const domDelta = isHorizontal ? e.deltaX : e.deltaY;
        target += domDelta * 0.92;
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (qvIdxRef.current !== null) {
        if (e.key === 'Escape') {
          e.preventDefault();
          closeQuickView(true);
        }
        return;
      }
      if (!section.matches(':hover') && !section.contains(document.activeElement)) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        target += gap * u;
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        target -= gap * u;
      }
    };

    const ro = new ResizeObserver(() => {
      updateLayoutMetrics();
    });
    ro.observe(section);
    window.addEventListener('resize', updateLayoutMetrics);

    railZone.addEventListener('pointerdown', onPointerDown);
    railZone.addEventListener('pointermove', onPointerMove);
    railZone.addEventListener('pointerup', onPointerUp);
    railZone.addEventListener('pointercancel', onPointerUp);
    railZone.addEventListener('click', onCaptureClick, true);
    railZone.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeyDown);

    const secHelper = section as unknown as {
      __nudgePiece?: (idx: number, impulse: number) => void;
      __scrollByGap?: (dir: number) => void;
      __scrollToPiece?: (idx: number) => void;
      __scrollToCategory?: (cat: string) => void;
    };
    secHelper.__nudgePiece = (idx: number, impulse: number) => {
      if (motionStates[idx]) {
        motionStates[idx].swayVel += impulse;
      }
    };
    secHelper.__scrollByGap = (dir: number) => {
      target += dir * gap * u * 3;
    };
    secHelper.__scrollToPiece = (idx: number) => {
      const currentX = wrapRailX((start + idx * gap) * u - cur, loopW, W);
      const deltaToCenter = currentX - W * 0.5;
      target = cur + deltaToCenter;
    };
    secHelper.__scrollToCategory = (cat: string) => {
      let bestDelta: number | null = null;
      for (let i = 0; i < RAIL_SEQUENCE.length; i++) {
        const gDef = RAIL_GARMENTS[RAIL_SEQUENCE[i]];
        if (!matchesRailCategory(gDef, cat)) continue;
        const currentX = wrapRailX((start + i * gap) * u - cur, loopW, W);
        const delta = currentX - W * 0.5;
        if (bestDelta === null || Math.abs(delta) < Math.abs(bestDelta)) {
          bestDelta = delta;
        }
      }
      if (bestDelta !== null) {
        target = cur + bestDelta;
      }
    };

    return () => {
      window.cancelAnimationFrame(rafId);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('resize', updateLayoutMetrics);
      railZone.removeEventListener('pointerdown', onPointerDown);
      railZone.removeEventListener('pointermove', onPointerMove);
      railZone.removeEventListener('pointerup', onPointerUp);
      railZone.removeEventListener('pointercancel', onPointerUp);
      railZone.removeEventListener('click', onCaptureClick, true);
      railZone.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  // Size Quick-View Full Silhouette & Fabric Detail panels
  useEffect(() => {
    if (qvIdx === null) return;
    const section = sectionRef.current;
    const qvImgWrap = qvImgWrapRef.current;
    const qvFull = qvFullFaceRef.current;
    const qvDetail = qvDetailFaceRef.current;
    const qvRod = qvRodRef.current;
    if (!section || !qvImgWrap || !qvFull || !qvDetail) return;

    const paintQv = () => {
      const rect = section.getBoundingClientRect();
      const W = rect.width || window.innerWidth;
      const H = rect.height || window.innerHeight;
      const isMobile = W <= 820;
      const u = isMobile ? Math.min(W / 390, H / 780) : Math.min(W / 1440, H / 900);

      let hookX = W * 0.29;
      let hookY = 66 * u;
      let faceH = Math.min(H - 110 * u, 740 * u);

      if (isMobile) {
        hookX = W / 2;
        hookY = 58 * u;
        faceH = Math.max(220, Math.min(H - 360 * u - hookY, 370 * u));
      }

      const faceW = faceH * (ABAYA_NAT_W / ABAYA_NAT_H);

      qvImgWrap.style.left = `${hookX.toFixed(1)}px`;
      qvImgWrap.style.top = `${hookY.toFixed(1)}px`;

      if (qvRod) {
        qvRod.style.top = `${hookY.toFixed(1)}px`;
        qvRod.style.left = '0px';
      }

      qvFull.style.width = `${faceW.toFixed(1)}px`;
      qvFull.style.height = `${faceH.toFixed(1)}px`;
      qvFull.style.left = `${(-faceW / 2).toFixed(1)}px`;
      qvFull.style.top = '0px';

      const detW = Math.min(faceW * 0.96, 420 * u);
      const detH = detW * (820 / 720);
      qvDetail.style.width = `${detW.toFixed(1)}px`;
      qvDetail.style.height = `${detH.toFixed(1)}px`;
      qvDetail.style.left = `${(-detW / 2).toFixed(1)}px`;
      qvDetail.style.top = `${Math.max(12, (faceH - detH) * 0.28).toFixed(1)}px`;
    };

    paintQv();
    window.addEventListener('resize', paintQv);
    return () => window.removeEventListener('resize', paintQv);
  }, [qvIdx]);

  const handleCategorySelect = (cat: string) => {
    setActiveCategory(cat);
    if (cat === 'All') return;
    const secHelper = sectionRef.current as unknown as {
      __scrollToCategory?: (c: string) => void;
    };
    secHelper?.__scrollToCategory?.(cat);
  };

  const openQuickView = (idx: number) => {
    if (isAddingRef.current) return;
    const section = sectionRef.current;
    const pieceEl = pieceElsRef.current[idx];
    const sourceFace = garmentFaceElsRef.current[idx];
    if (!section || !pieceEl) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const token = ++qvTokenRef.current;
    const fromRect = sourceFace?.getBoundingClientRect();

    setQvIdx(idx);
    setQvView('full');
    setQvSize('54');
    setQvMoreOpen(false);
    document.body.classList.add('rail-qv-open');

    window.requestAnimationFrame(() => {
      if (qvTokenRef.current !== token) return;
      const qvImgWrap = qvImgWrapRef.current;
      const qvFull = qvFullFaceRef.current;
      if (!qvImgWrap) return;

      qvImgWrap.getAnimations().forEach((a) => a.cancel());
      qvImgWrap.style.opacity = '1';
      qvImgWrap.style.transform = 'translate(0px, 0px) scale(1)';

      if (!qvFull || reducedMotion || !fromRect || fromRect.height === 0) return;

      const toRect = qvFull.getBoundingClientRect();
      if (toRect.height === 0) return;

      const dx = fromRect.left + fromRect.width / 2 - (toRect.left + toRect.width / 2);
      const dy = fromRect.top - toRect.top;
      const scaleRatio = fromRect.height / toRect.height;

      const anim = qvImgWrap.animate(
        [
          {
            transform: `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) scale(${scaleRatio.toFixed(3)})`,
            opacity: 0.65,
          },
          {
            transform: 'translate(0px, 0px) scale(1)',
            opacity: 1,
          },
        ],
        {
          duration: 640,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        }
      );
      anim.onfinish = () => {
        anim.cancel();
      };
    });
  };

  const closeQuickView = (withFlight = true) => {
    if (qvIdx === null) return;
    const closingIdx = qvIdx;
    const token = ++qvTokenRef.current;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!withFlight || reducedMotion) {
      qvImgWrapRef.current?.getAnimations().forEach((a) => a.cancel());
      document.body.classList.remove('rail-qv-open');
      setQvIdx(null);
      return;
    }

    const qvImgWrap = qvImgWrapRef.current;
    const qvFull = qvFullFaceRef.current;
    const railFace = garmentFaceElsRef.current[closingIdx];

    if (qvImgWrap && qvFull && railFace) {
      const toRect = railFace.getBoundingClientRect();
      const fromRect = qvFull.getBoundingClientRect();
      if (toRect.height > 0 && fromRect.height > 0) {
        const dx = toRect.left + toRect.width / 2 - (fromRect.left + fromRect.width / 2);
        const dy = toRect.top - fromRect.top;
        const scaleRatio = toRect.height / fromRect.height;

        qvImgWrap.getAnimations().forEach((a) => a.cancel());
        const anim = qvImgWrap.animate(
          [
            { transform: 'translate(0px, 0px) scale(1)', opacity: 1 },
            {
              transform: `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) scale(${scaleRatio.toFixed(3)})`,
              opacity: 0,
            },
          ],
          {
            duration: 460,
            easing: 'cubic-bezier(0.55, 0, 0.2, 1)',
          }
        );

        document.body.classList.remove('rail-qv-open');
        anim.onfinish = () => {
          anim.cancel();
          if (qvTokenRef.current === token) {
            setQvIdx(null);
          }
        };
        return;
      }
    }

    qvImgWrap?.getAnimations().forEach((a) => a.cancel());
    document.body.classList.remove('rail-qv-open');
    setQvIdx(null);
  };

  const handlePieceClick = (idx: number) => {
    const isTouchDevice = window.matchMedia('(hover: none)').matches;
    if (isTouchDevice && hoveredIdx !== idx) {
      setHoveredIdx(idx);
      return;
    }
    openQuickView(idx);
  };

  const handleAddToCartFromQv = () => {
    if (qvIdx === null || isAdding) return;
    const activePieceIdx = qvIdx;
    const k = RAIL_SEQUENCE[activePieceIdx];
    const gDef = RAIL_GARMENTS[k];
    if (!gDef) return;

    const variant = gDef.variants.find((v) => v.o[0] === qvSize) || gDef.variants[0];
    if (!variant) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      getBagController().add([{ id: variant.id, quantity: 1 }], true);
      closeQuickView(false);
      return;
    }

    setIsAdding(true);

    window.setTimeout(() => {
      const activeFaceEl = qvView === 'detail' ? qvDetailFaceRef.current : qvFullFaceRef.current;
      const openBagBtn = document.getElementById('open-bag');
      const section = sectionRef.current;
      const u = section ? parseFloat(getComputedStyle(section).getPropertyValue('--u')) || 1 : 1;

      if (activeFaceEl && openBagBtn) {
        const faceRect = activeFaceEl.getBoundingClientRect();
        const bagRect = openBagBtn.getBoundingClientRect();

        const clone = activeFaceEl.cloneNode(true) as HTMLDivElement;
        clone.style.position = 'fixed';
        clone.style.left = `${faceRect.left.toFixed(1)}px`;
        clone.style.top = `${faceRect.top.toFixed(1)}px`;
        clone.style.width = `${faceRect.width.toFixed(1)}px`;
        clone.style.height = `${faceRect.height.toFixed(1)}px`;
        clone.style.margin = '0';
        clone.style.zIndex = '2147483600';
        clone.style.pointerEvents = 'none';
        clone.style.transformOrigin = '50% 42%';
        clone.style.opacity = '1';
        document.body.appendChild(clone);

        const startCx = faceRect.left + faceRect.width * 0.5;
        const startCy = faceRect.top + faceRect.height * 0.42;
        const endCx = bagRect.left + bagRect.width * 0.5;
        const endCy = bagRect.top + bagRect.height * 0.5;

        const fullDx = endCx - startCx;
        const fullDy = endCy - startCy;
        const endScale = Math.max(0.05, (bagRect.height * 1.6) / Math.max(1, faceRect.height));
        const midScale = (1 + endScale) * 0.42;

        const flyAnim = clone.animate(
          [
            {
              transform: 'translate3d(0px, 0px, 0) scale(1)',
              opacity: 1,
            },
            {
              transform: `translate3d(${(fullDx * 0.45).toFixed(1)}px, ${(fullDy * 0.45 - 90 * u).toFixed(1)}px, 0) scale(${midScale.toFixed(3)})`,
              opacity: 0.9,
              offset: 0.45,
            },
            {
              transform: `translate3d(${fullDx.toFixed(1)}px, ${fullDy.toFixed(1)}px, 0) scale(${endScale.toFixed(3)})`,
              opacity: 0.35,
            },
          ],
          {
            duration: 820,
            easing: 'cubic-bezier(0.55, 0.05, 0.35, 1)',
            fill: 'forwards',
          }
        );

        flyAnim.onfinish = () => {
          clone.remove();
          getBagController().add([{ id: variant.id, quantity: 1 }], true);
        };
      } else {
        getBagController().add([{ id: variant.id, quantity: 1 }], true);
      }

      setIsAdding(false);
      closeQuickView(false);

      const pieceDropEl = pieceElsRef.current[activePieceIdx]?.querySelector<HTMLElement>('.rail-drop');
      if (pieceDropEl && typeof pieceDropEl.animate === 'function') {
        pieceDropEl.getAnimations().forEach((a) => a.cancel());
        const dropAnim = pieceDropEl.animate(
          [
            { transform: `translate3d(0, ${(-22 * u).toFixed(1)}px, 0)`, opacity: 0.25 },
            { transform: 'translate3d(0, 0px, 0)', opacity: 1 },
          ],
          {
            duration: 480,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          }
        );
        dropAnim.onfinish = () => {
          dropAnim.cancel();
        };
      }
      const secHelper = section as unknown as { __nudgePiece?: (idx: number, imp: number) => void };
      secHelper?.__nudgePiece?.(activePieceIdx, 1.4);
    }, 650);
  };

  const hoveredGarment =
    hoveredIdx !== null ? RAIL_GARMENTS[RAIL_SEQUENCE[hoveredIdx]] : null;
  const activeQvGarment =
    qvIdx !== null ? RAIL_GARMENTS[RAIL_SEQUENCE[qvIdx]] : null;

  return (
    <section
      id="the-rail"
      ref={sectionRef}
      className={`rail-section${isReady ? ' is-ready' : ' is-loading'}${qvIdx !== null ? ' is-qv-open' : ''}`}
      aria-label="The Rail — Modest Abaya & Outerwear Collection"
    >
      <div className="rail-stage" ref={stageRef}>
        {/* Eyebrow */}
        <div className="rail-eyebrow">
          <span className="rail-eyebrow-primary">MODEST ATELIER</span>
          <span className="rail-eyebrow-div" aria-hidden="true" />
          <span className="rail-eyebrow-secondary">ABAYAS &amp; OUTERWEAR</span>
        </div>

        {/* Headline */}
        <h2 className="rail-headline">
          <span className="rail-word rail-word-1" style={{ '--wj': 0 } as React.CSSProperties}>
            Modest
          </span>
          <span className="rail-word rail-word-2" style={{ '--wj': 1 } as React.CSSProperties}>
            drape,
          </span>
          <span className="rail-word rail-word-3" style={{ '--wj': 2 } as React.CSSProperties}>
            tailored
          </span>
          <span className="rail-word rail-word-4" style={{ '--wj': 3 } as React.CSSProperties}>
            right.
          </span>
        </h2>

        {/* Interactive Modest Wear Category Filters */}
        <div className="rail-filters" role="group" aria-label="Filter abayas by style and occasion">
          {RAIL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategorySelect(cat)}
              className={`rail-filter-btn${activeCategory === cat ? ' is-active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Curved Brushed-Brass Rail SVG */}
        <svg className="rail-svg" aria-hidden="true">
          <defs>
            <linearGradient id="rail-gold-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F4E6C8" />
              <stop offset="48%" stopColor="#C2A068" />
              <stop offset="100%" stopColor="#7C5E34" />
            </linearGradient>
          </defs>
          <path ref={pathShadowRef} fill="none" stroke="rgba(38, 29, 18, 0.14)" />
          <path ref={pathTubeRef} fill="none" stroke="url(#rail-gold-grad)" />
          <path ref={pathHighlightRef} fill="none" stroke="rgba(255, 252, 245, 0.85)" />
        </svg>

        {/* Interactive Rail Zone with 20 Suspended Abayas */}
        <div
          className="rail-zone"
          ref={railZoneRef}
          onMouseLeave={() => setHoveredIdx(null)}
        >
          {RAIL_SEQUENCE.map((k, i) => {
            const gDef = RAIL_GARMENTS[k];
            const tagDeg = TAG_ROTATIONS[i % TAG_ROTATIONS.length];
            const isHovered = hoveredIdx === i;
            const isHiddenInQv = qvIdx === i;
            const isDimmedByFilter = !matchesRailCategory(gDef, activeCategory);

            return (
              <div
                key={`rail-piece-${i}`}
                ref={(el) => {
                  pieceElsRef.current[i] = el;
                }}
                className={`rail-g${isHovered ? ' hov' : ''}${isHiddenInQv ? ' is-qv-hidden' : ''}${
                  isDimmedByFilter ? ' is-dimmed' : ''
                }`}
                style={{ '--gi': i } as React.CSSProperties}
              >
                <div className="rail-drop">
                  <div
                    className="rail-sway"
                    ref={(el) => {
                      swayElsRef.current[i] = el;
                    }}
                  >
                    <div className="rail-lift">
                      <div
                        className="rail-face rail-face-garment"
                        ref={(el) => {
                          garmentFaceElsRef.current[i] = el;
                        }}
                      >
                        <img
                          src={gDef.image}
                          alt={gDef.name}
                          draggable={false}
                          loading="eager"
                          decoding="async"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div
                        className="rail-tag"
                        style={{ transform: `rotate(${tagDeg}deg)` }}
                      >
                        <span className="rail-tag-hole" />
                        <span className="rail-tag-text">
                          {formatPrice(gDef.price, currency, true)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="rail-shadow"
                  ref={(el) => {
                    shadowElsRef.current[i] = el;
                  }}
                />

                <button
                  type="button"
                  className="rail-hit"
                  ref={(el) => {
                    hitElsRef.current[i] = el;
                  }}
                  aria-label={`${gDef.name}, ${gDef.fabric}, ${formatPrice(gDef.price, currency, true)}`}
                  onPointerEnter={(e) => {
                    if (e.pointerType === 'mouse' && !isAdding) {
                      setHoveredIdx(i);
                    }
                  }}
                  onPointerLeave={(e) => {
                    if (e.pointerType === 'mouse') {
                      setHoveredIdx((prev) => (prev === i ? null : prev));
                    }
                  }}
                  onClick={() => handlePieceClick(i)}
                />
              </div>
            );
          })}
        </div>

        {/* Bottom Left: Hint & Hovered Garment Label */}
        <div className="rail-footer-left">
          <div className={`rail-hint${hoveredGarment ? ' is-out' : ''}`}>
            <span className="rail-hint-rule" aria-hidden="true" />
            <span className="rail-hint-desktop">Drag continuously · click an abaya to inspect</span>
            <span className="rail-hint-touch">Swipe rail continuously · tap to inspect</span>
          </div>
          <div className={`rail-hover-label${hoveredGarment ? ' is-in' : ''}`}>
            <span className="rail-hover-name">{hoveredGarment?.name || ''}</span>
            <span className="rail-hover-price">
              {hoveredGarment
                ? `${hoveredGarment.fabric} · ${formatPrice(hoveredGarment.price, currency)}`
                : ''}
            </span>
          </div>
        </div>

        {/* Bottom Centre: Progress Track */}
        <div className="rail-progress-wrap">
          <div className="rail-progress-track">
            <div className="rail-progress-thumb" ref={thumbElRef} />
          </div>
        </div>

        {/* Bottom Right: Editorial Copy & Link */}
        <div className="rail-footer-right">
          <p className="rail-copy-lines">
            Korean Nida, washed linen &amp; silk chiffon.
            <br />
            Tailored for effortless modest grace.
          </p>
          <a
            href="#the-rail"
            className="rail-shop-link"
            onClick={(e) => {
              e.preventDefault();
              const sec = sectionRef.current as unknown as { __scrollByGap?: (d: number) => void };
              sec?.__scrollByGap?.(1);
            }}
          >
            <span>Glide the Rail</span>
            <svg
              width={15}
              height={10}
              viewBox="0 0 15 10"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.3}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M1 5h13M10 1l4 4-4 4" />
            </svg>
          </a>
        </div>
      </div>

      {/* Quick-View Layer (.rail-qv) */}
      <div
        className={`rail-qv${qvIdx !== null ? ' is-open' : ''}`}
        ref={qvLayerRef}
        aria-hidden={qvIdx === null ? 'true' : 'false'}
      >
        <div className="rail-qv-rod" ref={qvRodRef} />

        <div className="rail-qv-img" ref={qvImgWrapRef}>
          <div
            className={`rail-qv-face rail-qv-front${qvView === 'full' ? ' is-active' : ''}`}
            ref={qvFullFaceRef}
          >
            {activeQvGarment && (
              <img
                src={activeQvGarment.image}
                alt={activeQvGarment.name}
                draggable={false}
                referrerPolicy="no-referrer"
              />
            )}
          </div>
          <div
            className={`rail-qv-face rail-qv-detail${qvView === 'detail' ? ' is-active' : ''}`}
            ref={qvDetailFaceRef}
          >
            {activeQvGarment && (
              <img
                src={activeQvGarment.detailImage}
                alt={`${activeQvGarment.name} fabric detail`}
                draggable={false}
                referrerPolicy="no-referrer"
              />
            )}
          </div>
        </div>

        {activeQvGarment && qvIdx !== null && (
          <div className="rail-qv-info">
            <div className="rail-qv-stagger" style={{ '--qj': 0 } as React.CSSProperties}>
              <span className="rail-qv-counter">
                {activeQvGarment.category} · {qvIdx + 1} / {RAIL_SEQUENCE.length}
              </span>
            </div>

            <h3
              className="rail-qv-name rail-qv-stagger"
              style={{ '--qj': 1 } as React.CSSProperties}
            >
              {activeQvGarment.name}
            </h3>

            <div
              className="rail-qv-price rail-qv-stagger"
              style={{ '--qj': 2 } as React.CSSProperties}
            >
              {formatPrice(activeQvGarment.price, currency)}
            </div>

            <p
              className="rail-qv-specs rail-qv-stagger"
              style={{ '--qj': 2.4 } as React.CSSProperties}
            >
              {activeQvGarment.fabric} · {activeQvGarment.color}
            </p>

            <div
              className="rail-qv-tabs rail-qv-stagger"
              style={{ '--qj': 3 } as React.CSSProperties}
            >
              <button
                type="button"
                className={`rail-qv-tab${qvView === 'full' ? ' is-active' : ''}`}
                onClick={() => setQvView('full')}
              >
                Full View
              </button>
              <button
                type="button"
                className={`rail-qv-tab${qvView === 'detail' ? ' is-active' : ''}`}
                onClick={() => setQvView('detail')}
              >
                Check Fabric
              </button>
            </div>

            <div
              className="rail-qv-more rail-qv-stagger"
              style={{ '--qj': 3.5 } as React.CSSProperties}
            >
              <button
                type="button"
                className="rail-qv-more-btn"
                aria-expanded={qvMoreOpen}
                onClick={() => setQvMoreOpen((prev) => !prev)}
              >
                <span>{qvMoreOpen ? 'Hide details' : 'Learn More · Fabric & Care'}</span>
                <span className={`rail-qv-more-chev${qvMoreOpen ? ' is-open' : ''}`} aria-hidden="true">
                  ▾
                </span>
              </button>
              {qvMoreOpen && (
                <div className="rail-qv-more-body">
                  <p className="rail-qv-desc">{activeQvGarment.description}</p>
                  <p className="rail-qv-detail-meta">
                    {activeQvGarment.sleeveStyle} · {activeQvGarment.occasion}
                  </p>
                  <p className="rail-qv-care">{activeQvGarment.care}</p>
                </div>
              )}
            </div>

            <div
              className="rail-qv-size-label rail-qv-stagger"
              style={{ '--qj': 4 } as React.CSSProperties}
            >
              ABAYA LENGTH (INCHES)
            </div>

            <div
              className="rail-qv-sizes rail-qv-stagger"
              style={{ '--qj': 5 } as React.CSSProperties}
            >
              {activeQvGarment.sizes.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  className={`rail-qv-pill${qvSize === sz ? ' is-selected' : ''}`}
                  onClick={() => setQvSize(sz)}
                >
                  {sz}
                </button>
              ))}
            </div>

            <div
              className="rail-qv-cta-wrap rail-qv-stagger"
              style={{ '--qj': 6 } as React.CSSProperties}
            >
              <button
                type="button"
                className={`rail-qv-add${isAdding ? ' is-adding' : ''}`}
                onClick={handleAddToCartFromQv}
                disabled={isAdding}
              >
                {isAdding ? (
                  <>
                    <span className="rail-qv-spinner" aria-hidden="true" />
                    <span>Adding…</span>
                  </>
                ) : (
                  <span>Add to bag · {formatPrice(activeQvGarment.price, currency)}</span>
                )}
              </button>
            </div>

            <div
              className="rail-qv-meta rail-qv-stagger"
              style={{ '--qj': 7 } as React.CSSProperties}
            >
              <span>{activeQvGarment.occasion}</span>
              <a
                href="#perfume-showroom-v5"
                onClick={(e) => {
                  e.preventDefault();
                  closeQuickView(true);
                  document
                    .getElementById('perfume-showroom-v5')
                    ?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Explore Scent Gallery
              </a>
            </div>
          </div>
        )}

        <button
          type="button"
          className="rail-qv-close"
          onClick={() => closeQuickView(true)}
        >
          Close ×
        </button>
      </div>
    </section>
  );
}
