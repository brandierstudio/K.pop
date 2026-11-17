import React, { useEffect, useRef, useState } from 'react';
import {
  RAIL_GARMENTS,
  RAIL_SEQUENCE,
  RAIL_SHEETS,
  TAG_ROTATIONS,
  computeRailY,
  computeCropStyle,
} from '../data/railData';
import { getBagController } from '../utils/runwayElement';
import { clamp } from '../utils/runwayMath';

const CATEGORIES = ['All Pieces', 'Tailoring', 'Outerwear', 'Evening'] as const;

interface PieceMotionState {
  offset: number;
  swayAngle: number;
  swayVel: number;
}

export default function RailSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const railZoneRef = useRef<HTMLDivElement | null>(null);
  const pathShadowRef = useRef<SVGPathElement | null>(null);
  const pathTubeRef = useRef<SVGPathElement | null>(null);
  const pathHighlightRef = useRef<SVGPathElement | null>(null);
  const pieceElsRef = useRef<(HTMLDivElement | null)[]>([]);
  const swayElsRef = useRef<(HTMLDivElement | null)[]>([]);
  const sideFaceElsRef = useRef<(HTMLDivElement | null)[]>([]);
  const frontFaceElsRef = useRef<(HTMLDivElement | null)[]>([]);
  const shadowElsRef = useRef<(HTMLDivElement | null)[]>([]);
  const hitElsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const thumbElRef = useRef<HTMLDivElement | null>(null);
  const qvLayerRef = useRef<HTMLDivElement | null>(null);
  const qvImgWrapRef = useRef<HTMLDivElement | null>(null);
  const qvFrontFaceRef = useRef<HTMLDivElement | null>(null);
  const qvBackFaceRef = useRef<HTMLDivElement | null>(null);
  const qvRodRef = useRef<HTMLDivElement | null>(null);

  const [activeCategory, setActiveCategory] = useState<string>('All Pieces');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [qvIdx, setQvIdx] = useState<number | null>(null);
  const [qvView, setQvView] = useState<'front' | 'back'>('front');
  const [qvSize, setQvSize] = useState<string>('S');
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [sheetsLoaded, setSheetsLoaded] = useState<{ side: boolean; front: boolean; back: boolean }>({
    side: false,
    front: false,
    back: false,
  });

  const hoveredIdxRef = useRef<number | null>(null);
  const qvIdxRef = useRef<number | null>(null);
  const activeCategoryRef = useRef<string>('All Pieces');
  const isAddingRef = useRef<boolean>(false);
  const qvTokenRef = useRef<number>(0);

  hoveredIdxRef.current = hoveredIdx;
  qvIdxRef.current = qvIdx;
  activeCategoryRef.current = activeCategory;
  isAddingRef.current = isAdding;

  // Preload the 3 transparent garment sheets
  useEffect(() => {
    let mounted = true;
    const preloadSheet = (key: 'side' | 'front' | 'back', url: string) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        const done = () => {
          if (mounted) {
            setSheetsLoaded((prev) => ({ ...prev, [key]: true }));
          }
          resolve();
        };
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
    };

    const pSide = preloadSheet('side', RAIL_SHEETS.side);
    const pFront = preloadSheet('front', RAIL_SHEETS.front);
    preloadSheet('back', RAIL_SHEETS.back);

    const failsafe = window.setTimeout(() => {
      if (mounted) {
        setIsReady(true);
      }
    }, 1200);

    Promise.all([pSide, pFront]).then(() => {
      window.clearTimeout(failsafe);
      if (mounted) {
        setIsReady(true);
      }
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

    let railTop = isMobile ? 292 : 270;
    let railSag = isMobile ? 30 : 74;
    let gap = isMobile ? 80 : 121;
    let gs = isMobile ? 0.3 : 0.455;
    let start = isMobile ? 46 : 113;

    let target = 0;
    let cur = 0;
    let vel = 0;
    let maxScroll = 0;

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

      railTop = isMobile ? 292 : 270;
      railSag = isMobile ? 30 : 74;
      gap = isMobile ? 80 : 121;
      gs = isMobile ? 0.3 : 0.455;
      start = isMobile ? 46 : 113;

      section.style.setProperty('--u', `${u.toFixed(4)}px`);
      section.style.setProperty('--rail-top', String(railTop));
      section.style.setProperty('--rail-sag', String(railSag));
      section.style.setProperty('--gap', String(gap));
      section.style.setProperty('--gs', String(gs));
      section.style.setProperty('--start', String(start));

      maxScroll = Math.max(0, (2 * start + (RAIL_SEQUENCE.length - 1) * gap) * u - W);
      target = clamp(target, 0, maxScroll);

      // Update SVG Quadratic curve
      const y0 = computeRailY(0, W, railTop, railSag, u);
      const yMid = computeRailY(W / 2, W, railTop, railSag, u);
      const yc = 2 * yMid - y0;

      if (pathShadowRef.current) {
        const sy0 = y0 + 4 * u;
        const syc = yc + 4 * u;
        pathShadowRef.current.setAttribute('d', `M0 ${sy0.toFixed(2)} Q ${(W / 2).toFixed(2)} ${syc.toFixed(2)} ${W.toFixed(2)} ${sy0.toFixed(2)}`);
        pathShadowRef.current.setAttribute('stroke-width', `${(3 * u).toFixed(2)}`);
      }
      if (pathTubeRef.current) {
        pathTubeRef.current.setAttribute('d', `M0 ${y0.toFixed(2)} Q ${(W / 2).toFixed(2)} ${yc.toFixed(2)} ${W.toFixed(2)} ${y0.toFixed(2)}`);
        pathTubeRef.current.setAttribute('stroke-width', `${(5.2 * u).toFixed(2)}`);
      }
      if (pathHighlightRef.current) {
        const hy0 = y0 - 1.3 * u;
        const hyc = yc - 1.3 * u;
        pathHighlightRef.current.setAttribute('d', `M0 ${hy0.toFixed(2)} Q ${(W / 2).toFixed(2)} ${hyc.toFixed(2)} ${W.toFixed(2)} ${hy0.toFixed(2)}`);
        pathHighlightRef.current.setAttribute('stroke-width', `${(1.1 * u).toFixed(2)}`);
      }

      // Paint each garment's side and front faces at scale s = gs * u
      const s = gs * u;
      RAIL_SEQUENCE.forEach((k, i) => {
        const gDef = RAIL_GARMENTS[k];
        if (!gDef) return;

        const sideEl = sideFaceElsRef.current[i];
        if (sideEl) {
          const st = computeCropStyle(RAIL_SHEETS.side, gDef.crops.side, s);
          Object.assign(sideEl.style, st);
        }

        const frontEl = frontFaceElsRef.current[i];
        if (frontEl) {
          const st = computeCropStyle(RAIL_SHEETS.front, gDef.crops.front, s);
          Object.assign(frontEl.style, st);
        }

        const sideH = (gDef.crops.side.h + 6) * s;
        const shadowEl = shadowElsRef.current[i];
        if (shadowEl) {
          const shW = 110 * (gs / 0.48) * u;
          const shH = 16 * u;
          shadowEl.style.width = `${shW.toFixed(1)}px`;
          shadowEl.style.height = `${shH.toFixed(1)}px`;
          shadowEl.style.left = `${(-shW / 2).toFixed(1)}px`;
          shadowEl.style.top = `${(sideH + 4 * u).toFixed(1)}px`;
        }

        const hitEl = hitElsRef.current[i];
        if (hitEl) {
          const hitW = gap * u;
          hitEl.style.width = `${hitW.toFixed(1)}px`;
          hitEl.style.height = `${sideH.toFixed(1)}px`;
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
          motionStates[i].swayVel += i % 2 === 0 ? 1.6 : -1.6;
        }, i * 70 + 420);
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
    const neighborTable = [0, 50, 24, 9, 0];

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
      const neighborUnit = (gs / 0.48) * u;

      for (let i = 0; i < RAIL_SEQUENCE.length; i++) {
        const st = motionStates[i];
        let targetOffset = 0;
        if (hIdx !== null && hIdx !== i) {
          const d = i - hIdx;
          const sign = d > 0 ? 1 : -1;
          const mag = neighborTable[Math.min(Math.abs(d), 4)];
          targetOffset = sign * mag * neighborUnit;
        }
        if (reducedMotion) {
          st.offset = targetOffset;
        } else {
          st.offset += (targetOffset - st.offset) * 0.16;
        }

        const x = (start + i * gap) * u - cur + st.offset;
        const y = computeRailY(x, W, railTop, railSag, u) - 3 * u;

        const pieceEl = pieceElsRef.current[i];
        if (pieceEl) {
          pieceEl.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
        }

        if (!reducedMotion) {
          const targetAngle = clamp(-vel * 0.22, -7, 7);
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
        const progress = maxScroll > 0 ? clamp(cur / maxScroll, 0, 1) : 0;
        thumbElRef.current.style.left = `${(progress * 42).toFixed(2)}%`;
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
        target = clamp(startTarget - dx * 1.15, 0, maxScroll);
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
      target = clamp(target - releaseVelocity * 260, 0, maxScroll);
    };

    const onCaptureClick = (e: MouseEvent) => {
      if (performance.now() < suppressClickUntil) {
        e.stopPropagation();
        e.preventDefault();
      }
    };

    // Wheel on railZone (horizontal wheel or when hovering the rail zone)
    const onWheel = (e: WheelEvent) => {
      if (qvIdxRef.current !== null) return;
      // Allow horizontal wheel or vertical wheel when scrolling within the rail
      const domDelta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      const nextTarget = clamp(target + domDelta * 0.9, 0, maxScroll);
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || (nextTarget !== target && e.shiftKey)) {
        e.preventDefault();
        target = nextTarget;
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
        target = clamp(target + gap * u, 0, maxScroll);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        target = clamp(target - gap * u, 0, maxScroll);
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

    // Expose a helper on the section ref for jumping or nudging sway
    (section as unknown as {
      __nudgePiece?: (idx: number, impulse: number) => void;
      __scrollByGap?: (dir: number) => void;
    }).__nudgePiece = (idx: number, impulse: number) => {
      if (motionStates[idx]) {
        motionStates[idx].swayVel += impulse;
      }
    };
    (section as unknown as {
      __scrollByGap?: (dir: number) => void;
    }).__scrollByGap = (dir: number) => {
      target = clamp(target + dir * gap * u * 2.5, 0, maxScroll);
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

  // Paint Quick-View front and back faces whenever qvIdx changes or window resizes
  useEffect(() => {
    if (qvIdx === null) return;
    const section = sectionRef.current;
    const qvImgWrap = qvImgWrapRef.current;
    const qvFront = qvFrontFaceRef.current;
    const qvBack = qvBackFaceRef.current;
    const qvRod = qvRodRef.current;
    if (!section || !qvImgWrap || !qvFront || !qvBack) return;

    const paintQv = () => {
      const rect = section.getBoundingClientRect();
      const W = rect.width || window.innerWidth;
      const H = rect.height || window.innerHeight;
      const isMobile = W <= 820;
      const u = isMobile ? Math.min(W / 390, H / 780) : Math.min(W / 1440, H / 900);

      const k = RAIL_SEQUENCE[qvIdx];
      const gDef = RAIL_GARMENTS[k];
      if (!gDef) return;

      let s = 0.9 * u;
      let hookX = 440 * u;
      let hookY = 62 * u;

      if (isMobile) {
        hookX = W / 2;
        hookY = 64 * u;
        const maxTallerH = Math.max(gDef.crops.front.h, gDef.crops.back.h) + 6;
        const availSpace = Math.max(160, H - 340 * u - hookY);
        s = Math.min(0.46 * u, availSpace / maxTallerH);
      }

      qvImgWrap.style.left = `${hookX.toFixed(1)}px`;
      qvImgWrap.style.top = `${hookY.toFixed(1)}px`;

      if (qvRod) {
        qvRod.style.left = `${hookX.toFixed(1)}px`;
        qvRod.style.height = `${hookY.toFixed(1)}px`;
      }

      const frontStyle = computeCropStyle(RAIL_SHEETS.front, gDef.crops.front, s);
      Object.assign(qvFront.style, frontStyle);

      const backStyle = computeCropStyle(RAIL_SHEETS.back, gDef.crops.back, s);
      Object.assign(qvBack.style, backStyle);
    };

    paintQv();
    window.addEventListener('resize', paintQv);
    return () => window.removeEventListener('resize', paintQv);
  }, [qvIdx]);

  const openQuickView = (idx: number) => {
    if (isAddingRef.current) return;
    const section = sectionRef.current;
    const pieceEl = pieceElsRef.current[idx];
    const sideFace = sideFaceElsRef.current[idx];
    const frontFace = frontFaceElsRef.current[idx];
    if (!section || !pieceEl) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const token = ++qvTokenRef.current;

    const sourceFace = hoveredIdx === idx && frontFace ? frontFace : sideFace;
    const fromRect = sourceFace?.getBoundingClientRect();

    setQvIdx(idx);
    setQvView('front');
    setQvSize('S');
    document.body.classList.add('rail-qv-open');

    window.requestAnimationFrame(() => {
      if (qvTokenRef.current !== token) return;
      const qvImgWrap = qvImgWrapRef.current;
      const qvFront = qvFrontFaceRef.current;
      if (!qvImgWrap) return;

      qvImgWrap.getAnimations().forEach((a) => a.cancel());
      qvImgWrap.style.opacity = '1';
      qvImgWrap.style.transform = 'translate(0px, 0px) scale(1)';

      if (!qvFront || reducedMotion || !fromRect || fromRect.height === 0) return;

      const toRect = qvFront.getBoundingClientRect();
      if (toRect.height === 0) return;

      const dx = fromRect.left + fromRect.width / 2 - (toRect.left + toRect.width / 2);
      const dy = fromRect.top - toRect.top;
      const scaleRatio = fromRect.height / toRect.height;

      const anim = qvImgWrap.animate(
        [
          {
            transform: `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) scale(${scaleRatio.toFixed(3)})`,
            opacity: 0.6,
          },
          {
            transform: 'translate(0px, 0px) scale(1)',
            opacity: 1,
          },
        ],
        {
          duration: 680,
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
    const qvFront = qvFrontFaceRef.current;
    const sideFace = sideFaceElsRef.current[closingIdx];

    if (qvImgWrap && qvFront && sideFace) {
      const toRect = sideFace.getBoundingClientRect();
      const fromRect = qvFront.getBoundingClientRect();
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
            duration: 480,
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
      const activeFaceEl = qvView === 'back' ? qvBackFaceRef.current : qvFrontFaceRef.current;
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
        const endScale = Math.max(0.04, (bagRect.height * 1.6) / Math.max(1, faceRect.height));
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

      // Reappear on its hook with a gentle drop and sway nudge +1.4
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
    }, 1000);
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
      aria-label="The Rail — All Products Collection"
    >
      <div className="rail-stage" ref={stageRef}>
        {/* Eyebrow */}
        <div className="rail-eyebrow">
          <span className="rail-eyebrow-primary">NEW COLLECTION</span>
          <span className="rail-eyebrow-div" aria-hidden="true" />
          <span className="rail-eyebrow-secondary">EVENING &amp; TAILORING</span>
        </div>

        {/* Headline ("Silhouettes that hang right.") */}
        <h2 className="rail-headline">
          <span className="rail-word rail-word-1" style={{ '--wj': 0 } as React.CSSProperties}>
            Silhouettes
          </span>
          <span className="rail-word rail-word-2" style={{ '--wj': 1 } as React.CSSProperties}>
            that
          </span>
          <span className="rail-word rail-word-3" style={{ '--wj': 2 } as React.CSSProperties}>
            hang
          </span>
          <span className="rail-word rail-word-4" style={{ '--wj': 3 } as React.CSSProperties}>
            right.
          </span>
        </h2>

        {/* Interactive Category Filter Pills ("choose my own" product filter) */}
        <div className="rail-filters" role="group" aria-label="Filter collection by category">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`rail-filter-btn${activeCategory === cat ? ' is-active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Curved Gold Rail SVG */}
        <svg className="rail-svg" aria-hidden="true">
          <defs>
            <linearGradient id="rail-gold-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFE4F2" />
              <stop offset="45%" stopColor="#D6A6C4" />
              <stop offset="100%" stopColor="#8C587A" />
            </linearGradient>
          </defs>
          <path ref={pathShadowRef} fill="none" stroke="rgba(80, 35, 65, 0.12)" />
          <path ref={pathTubeRef} fill="none" stroke="url(#rail-gold-grad)" />
          <path ref={pathHighlightRef} fill="none" stroke="rgba(255, 248, 252, 0.88)" />
        </svg>

        {/* Interactive Rail Zone with 20 Hanging Garments */}
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
            const isDimmedByFilter =
              activeCategory !== 'All Pieces' && gDef.category !== activeCategory;

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
                        className="rail-face rail-face-side"
                        ref={(el) => {
                          sideFaceElsRef.current[i] = el;
                        }}
                      />
                      <div
                        className="rail-face rail-face-front"
                        ref={(el) => {
                          frontFaceElsRef.current[i] = el;
                        }}
                      />
                      <div
                        className="rail-tag"
                        style={{ transform: `rotate(${tagDeg}deg)` }}
                      >
                        <span className="rail-tag-hole" />
                        <span className="rail-tag-text">{gDef.tagPrice}</span>
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
                  aria-label={`${gDef.name}, ${gDef.tagPrice}`}
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
            <span className="rail-hint-desktop">Hover a piece · click to look closer</span>
            <span className="rail-hint-touch">Tap a piece · tap again to look closer</span>
          </div>
          <div className={`rail-hover-label${hoveredGarment ? ' is-in' : ''}`}>
            <span className="rail-hover-name">{hoveredGarment?.name || ''}</span>
            <span className="rail-hover-price">{hoveredGarment?.priceFormatted || '$690.00'}</span>
          </div>
        </div>

        {/* Bottom Centre: Progress Track + Arrows */}
        <div className="rail-progress-wrap">
          <div className="rail-progress-track">
            <div className="rail-progress-thumb" ref={thumbElRef} />
          </div>
        </div>

        {/* Bottom Right: Editorial Copy & Link */}
        <div className="rail-footer-right">
          <p className="rail-copy-lines">
            Cut from Italian silk and wool.
            <br />
            Tailored to order. Made to last.
          </p>
          <a
            href="#runway-home"
            className="rail-shop-link"
            onClick={(e) => {
              e.preventDefault();
              const sec = sectionRef.current as unknown as { __scrollByGap?: (d: number) => void };
              sec?.__scrollByGap?.(1);
            }}
          >
            <span>Explore the Rail</span>
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

      {/* Quick-View Layer (.qv) */}
      <div
        className={`rail-qv${qvIdx !== null ? ' is-open' : ''}`}
        ref={qvLayerRef}
        aria-hidden={qvIdx === null ? 'true' : 'false'}
      >
        <div className="rail-qv-rod" ref={qvRodRef} />

        <div className="rail-qv-img" ref={qvImgWrapRef}>
          <div
            className={`rail-qv-face rail-qv-front${qvView === 'front' ? ' is-active' : ''}`}
            ref={qvFrontFaceRef}
          />
          <div
            className={`rail-qv-face rail-qv-back${qvView === 'back' ? ' is-active' : ''}`}
            ref={qvBackFaceRef}
          />
        </div>

        {activeQvGarment && qvIdx !== null && (
          <div className="rail-qv-info">
            <div className="rail-qv-stagger" style={{ '--qj': 0 } as React.CSSProperties}>
              <span className="rail-qv-counter">{qvIdx + 1} / 20</span>
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
              {activeQvGarment.priceFormatted}
            </div>

            <div
              className="rail-qv-tabs rail-qv-stagger"
              style={{ '--qj': 3 } as React.CSSProperties}
            >
              <button
                type="button"
                className={`rail-qv-tab${qvView === 'front' ? ' is-active' : ''}`}
                onClick={() => setQvView('front')}
              >
                Front
              </button>
              <button
                type="button"
                className={`rail-qv-tab${qvView === 'back' ? ' is-active' : ''}`}
                onClick={() => {
                  if (sheetsLoaded.back) {
                    setQvView('back');
                  }
                }}
              >
                Back
              </button>
            </div>

            <div
              className="rail-qv-size-label rail-qv-stagger"
              style={{ '--qj': 4 } as React.CSSProperties}
            >
              SIZE
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
                  <span>Add to cart</span>
                )}
              </button>
            </div>

            <div
              className="rail-qv-meta rail-qv-stagger"
              style={{ '--qj': 7 } as React.CSSProperties}
            >
              <span>{activeQvGarment.name}</span>
              <a
                href="#runway-home"
                onClick={(e) => {
                  e.preventDefault();
                  closeQuickView(true);
                  document.getElementById('runway-home')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Pair on the Runway
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
