import {
  BAG_STORAGE_KEY,
  BagEntry,
  sanitizeBagEntries,
  addItemsToBagEntries,
  updateBagEntryQuantity,
  resolveBagEntries,
  formatShortlistExport,
  clamp,
  wrapN,
  shortestLoopDelta,
  computeRingBodyPose,
  stepSpring,
} from './runwayMath';
import { RAIL_GARMENTS } from '../data/railData';
import { formatPrice, getCurrency, subscribeCurrency } from './currency';

const DEFAULT_STARTING_BAG: BagEntry[] = [
  { id: 6101002, quantity: 1 }, // Al-Noor White Embroidered Kurta Set (M)
  { id: 9001002, quantity: 1 }, // Noir Classic Nida Abaya (54)
  { id: 9008002, quantity: 1 }, // Dusk Mauve Pearl-Cuff Abaya (54)
];

class StylingBagController {
  private entries: BagEntry[] = [];
  private toastTimer: number | null = null;
  private lastAddedId: number | null = null;

  constructor() {
    this.load();
    subscribeCurrency(() => {
      this.render();
    });
  }

  public load(): void {
    try {
      const raw = localStorage.getItem(BAG_STORAGE_KEY);
      if (raw) {
        const parsed = sanitizeBagEntries(JSON.parse(raw));
        this.entries = parsed.length > 0 ? parsed : [...DEFAULT_STARTING_BAG];
      } else {
        this.entries = [...DEFAULT_STARTING_BAG];
      }
    } catch {
      this.entries = [...DEFAULT_STARTING_BAG];
    }
    this.renderCounter();
  }

  private save(): void {
    try {
      localStorage.setItem(BAG_STORAGE_KEY, JSON.stringify(this.entries));
    } catch {
      // Ignore storage quota errors
    }
  }

  public add(items: { id: number; quantity?: number }[], prepend = false, silentToast = false): void {
    if (prepend && items.length === 1) {
      const req = items[0];
      const qty = req.quantity ?? 1;
      const existingIdx = this.entries.findIndex((e) => e.id === req.id);
      if (existingIdx >= 0) {
        const updated = {
          id: req.id,
          quantity: clamp(this.entries[existingIdx].quantity + qty, 1, 20),
        };
        const rest = this.entries.filter((_, idx) => idx !== existingIdx);
        this.entries = [updated, ...rest];
      } else {
        this.entries = [{ id: req.id, quantity: clamp(qty, 1, 20) }, ...this.entries].slice(0, 50);
      }
      this.lastAddedId = req.id;
      this.save();
      this.render();
      this.animateBagBadge();
      if (!silentToast) {
        this.showToast('Piece saved to your styling bag');
      }
      return;
    }

    const { entries, toastMessage } = addItemsToBagEntries(this.entries, items);
    this.entries = entries;
    if (items.length > 0) {
      this.lastAddedId = items[items.length - 1].id;
    }
    this.save();
    this.render();
    this.animateBagBadge();
    if (!silentToast) {
      this.showToast(toastMessage);
    }
  }

  public updateQuantity(variantId: number, delta: number): void {
    this.lastAddedId = null;
    this.entries = updateBagEntryQuantity(this.entries, variantId, delta);
    this.save();
    this.render();
  }

  public remove(variantId: number): void {
    this.lastAddedId = null;
    this.entries = this.entries.filter((e) => e.id !== variantId);
    this.save();
    this.render();
  }

  public animateBagBadge(): void {
    const openBagBtn = document.getElementById('open-bag');
    const badge = openBagBtn?.querySelector<HTMLElement>('[data-cart-count]');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    if (badge && typeof badge.animate === 'function') {
      badge.animate(
        [
          { transform: 'scale(1)' },
          { transform: 'scale(1.45)' },
          { transform: 'scale(1)' },
        ],
        { duration: 500, easing: 'cubic-bezier(0.3, 1.6, 0.5, 1)' }
      );
    }
    if (openBagBtn && typeof openBagBtn.animate === 'function') {
      openBagBtn.animate(
        [
          { transform: 'scale(1) rotate(0deg)' },
          { transform: 'scale(1.22) rotate(-6deg)' },
          { transform: 'scale(0.94) rotate(0deg)' },
          { transform: 'scale(1) rotate(0deg)' },
        ],
        { duration: 520, easing: 'ease-out' }
      );
    }
  }

  public renderCounter(): void {
    const total = this.entries.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll<HTMLElement>('[data-cart-count]').forEach((el) => {
      el.textContent = String(total);
    });
  }

  public render(): void {
    this.renderCounter();
    const itemsContainer = document.getElementById('bag-items');
    const totalEl = document.getElementById('bag-total');
    const exportBtn = document.getElementById('export-bag') as HTMLButtonElement | null;
    const checkoutBtn = document.getElementById('checkout-bag') as HTMLButtonElement | null;
    if (!itemsContainer || !totalEl) return;

    const resolved = resolveBagEntries(this.entries);
    itemsContainer.innerHTML = '';

    if (resolved.items.length === 0) {
      const emptyNote = document.createElement('p');
      emptyNote.className = 'bag-note';
      emptyNote.textContent = 'Your styling bag is empty. Choose a size beside a piece to save it.';
      itemsContainer.appendChild(emptyNote);
      totalEl.textContent = formatPrice(0, getCurrency());
      if (exportBtn) exportBtn.disabled = true;
      if (checkoutBtn) checkoutBtn.disabled = true;
      return;
    }

    if (exportBtn) exportBtn.disabled = false;
    if (checkoutBtn) checkoutBtn.disabled = false;
    totalEl.textContent = resolved.totalFormatted;

    for (const item of resolved.items) {
      const row = document.createElement('div');
      row.className = 'drawer-row';
      if (this.lastAddedId === item.id) {
        row.classList.add('is-new');
      }

      const thumbWrap = document.createElement('div');
      thumbWrap.className = 'drawer-thumb';

      const img = document.createElement('img');
      if (typeof item.railGarmentK === 'number') {
        const gDef = RAIL_GARMENTS[item.railGarmentK];
        img.src = gDef ? gDef.image : item.image;
      } else {
        img.src = item.image;
      }
      img.alt = item.name;
      img.width = 76;
      img.height = 96;
      img.referrerPolicy = 'no-referrer';
      thumbWrap.appendChild(img);

      const details = document.createElement('div');
      details.className = 'drawer-details';

      const h3 = document.createElement('h3');
      h3.className = 'drawer-item-name';
      h3.textContent = item.name;

      const meta = document.createElement('p');
      meta.className = 'drawer-item-meta';
      meta.textContent = `Size ${item.size} · ${item.priceFormatted}`;

      const controlsRow = document.createElement('div');
      controlsRow.className = 'drawer-item-controls';

      const stepper = document.createElement('div');
      stepper.className = 'drawer-stepper';

      const minusBtn = document.createElement('button');
      minusBtn.type = 'button';
      minusBtn.className = 'drawer-step-btn';
      minusBtn.setAttribute('aria-label', `Decrease quantity of ${item.name}`);
      minusBtn.textContent = '−';
      minusBtn.addEventListener('click', () => {
        this.updateQuantity(item.id, -1);
      });

      const qtyVal = document.createElement('span');
      qtyVal.className = 'drawer-step-val';
      qtyVal.textContent = String(item.quantity);

      const plusBtn = document.createElement('button');
      plusBtn.type = 'button';
      plusBtn.className = 'drawer-step-btn';
      plusBtn.setAttribute('aria-label', `Increase quantity of ${item.name}`);
      plusBtn.textContent = '+';
      plusBtn.addEventListener('click', () => {
        this.updateQuantity(item.id, 1);
      });

      stepper.appendChild(minusBtn);
      stepper.appendChild(qtyVal);
      stepper.appendChild(plusBtn);

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'drawer-trash';
      removeBtn.setAttribute('aria-label', `Remove ${item.name}`);
      removeBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z"/></svg>`;
      removeBtn.addEventListener('click', () => {
        this.remove(item.id);
      });

      controlsRow.appendChild(stepper);
      controlsRow.appendChild(removeBtn);

      details.appendChild(h3);
      details.appendChild(meta);
      details.appendChild(controlsRow);

      const linePrice = document.createElement('div');
      linePrice.className = 'drawer-line-total';
      linePrice.textContent = item.lineTotalFormatted;

      row.appendChild(thumbWrap);
      row.appendChild(details);
      row.appendChild(linePrice);
      itemsContainer.appendChild(row);
    }
  }

  public showToast(msg: string): void {
    const statusEl = document.getElementById('bag-status');
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.classList.add('is-on');
    if (this.toastTimer !== null) {
      window.clearTimeout(this.toastTimer);
    }
    this.toastTimer = window.setTimeout(() => {
      statusEl.classList.remove('is-on');
      this.toastTimer = null;
    }, 2500);
  }

  public exportShortlist(): void {
    const resolved = resolveBagEntries(this.entries);
    if (resolved.items.length === 0) return;
    const text = formatShortlistExport(resolved.items);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kshop-pop-styling-shortlist.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

let bagInstance: StylingBagController | null = null;

export function getBagController(): StylingBagController {
  if (!bagInstance) {
    bagInstance = new StylingBagController();
  }
  return bagInstance;
}

export function openCartDrawer(): void {
  const bag = getBagController();
  bag.render();
  document.body.classList.add('drawer-open');
  const drawer = document.getElementById('cart-drawer');
  drawer?.setAttribute('aria-hidden', 'false');
}

export function closeCartDrawer(): void {
  document.body.classList.remove('drawer-open');
  const drawer = document.getElementById('cart-drawer');
  drawer?.setAttribute('aria-hidden', 'true');
}

export function initBagDialogBindings(): () => void {
  const bag = getBagController();
  bag.render();

  const openBtn = document.getElementById('open-bag');
  const closeBtn = document.getElementById('close-bag');
  const scrimBtn = document.getElementById('drawer-scrim');
  const exportBtn = document.getElementById('export-bag');
  const checkoutBtn = document.getElementById('checkout-bag');

  const onOpen = () => {
    if (document.body.classList.contains('drawer-open')) {
      closeCartDrawer();
    } else {
      openCartDrawer();
    }
  };

  const onClose = () => {
    closeCartDrawer();
  };

  const onExport = () => {
    bag.exportShortlist();
  };

  const onCheckout = () => {
    bag.showToast('Checkout preview — your K.Shop Pop selection is saved!');
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (
      e.key === 'Escape' &&
      document.body.classList.contains('drawer-open') &&
      !document.body.classList.contains('rail-qv-open')
    ) {
      closeCartDrawer();
    }
  };

  openBtn?.addEventListener('click', onOpen);
  closeBtn?.addEventListener('click', onClose);
  scrimBtn?.addEventListener('click', onClose);
  exportBtn?.addEventListener('click', onExport);
  checkoutBtn?.addEventListener('click', onCheckout);
  document.addEventListener('keydown', onKeyDown);

  return () => {
    openBtn?.removeEventListener('click', onOpen);
    closeBtn?.removeEventListener('click', onClose);
    scrimBtn?.removeEventListener('click', onClose);
    exportBtn?.removeEventListener('click', onExport);
    checkoutBtn?.removeEventListener('click', onCheckout);
    document.removeEventListener('keydown', onKeyDown);
  };
}

interface ClassicBodySpring {
  el: HTMLElement;
  hit: HTMLButtonElement | null;
  lookIdx: number;
  w: number;
  x: number;
  g: number;
  v: number;
  from: number;
  trip: boolean;
  lastBlur: number;
}

export class RunwaySectionElement extends HTMLElement {
  private cleanupFns: (() => void)[] = [];
  private initialized = false;

  connectedCallback() {
    if (this.initialized) return;
    this.initialized = true;
    this.setupRunway();
  }

  disconnectedCallback() {
    this.initialized = false;
    for (const fn of this.cleanupFns) {
      fn();
    }
    this.cleanupFns = [];
  }

  private setupRunway() {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    const stage = this.querySelector<HTMLElement>('[data-rw-stage]');
    const actorsWrap = this.querySelector<HTMLElement>('[data-rw-actors]');
    const heroesWrap = this.querySelector<HTMLElement>('[data-rw-heroes]');
    const liveEl = this.querySelector<HTMLElement>('[data-rw-live]');
    const piecesEl = this.querySelector<HTMLElement>('[data-rw-pieces]');
    const autoBtn = this.querySelector<HTMLButtonElement>('[data-rw-auto]');
    const lb = this.querySelector<HTMLElement>('[data-rw-lb]');
    const lbStage = this.querySelector<HTMLElement>('[data-rw-lb-stage]');
    const lbKicker = this.querySelector<HTMLElement>('[data-rw-lb-kicker]');
    const lbName = this.querySelector<HTMLElement>('[data-rw-lb-name]');
    const lbCloseBtn = this.querySelector<HTMLButtonElement>('[data-rw-zoom-close]');
    const panelEl = this.querySelector<HTMLElement>('.rw__panel');
    let cursorEl = this.querySelector<HTMLElement>('[data-rw-cursor]');

    if (!stage || !actorsWrap || !heroesWrap) return;

    // 1. Clone bodies 0..5 into 6..11 if not already cloned
    const existingClones = actorsWrap.querySelectorAll('[data-rw-clone]');
    existingClones.forEach((c) => c.remove());

    const origModels = Array.from(actorsWrap.querySelectorAll<HTMLElement>('[data-rw-model]'));
    const n = origModels.length; // 6
    const N = n * Math.ceil(8 / n); // 12

    for (let a = n; a < N; a++) {
      const srcModel = origModels[a % n];
      const clone = srcModel.cloneNode(true) as HTMLElement;
      clone.setAttribute('data-rw-clone', '');
      clone.setAttribute('data-index', String(a));
      const img = clone.querySelector('img');
      if (img) {
        img.loading = 'lazy';
      }
      actorsWrap.appendChild(clone);
    }

    const allModels = Array.from(actorsWrap.querySelectorAll<HTMLElement>('[data-rw-model]'));
    const heroes = Array.from(heroesWrap.querySelectorAll<HTMLElement>('[data-rw-hero]'));
    const ticks = Array.from(this.querySelectorAll<HTMLButtonElement>('[data-rw-tick]'));
    const panels = Array.from(this.querySelectorAll<HTMLElement>('[data-rw-panel]'));

    // Decode all model images
    const decodeImg = (img: HTMLImageElement) => {
      const markDecoded = () => img.classList.add('is-decoded');
      if (typeof img.decode === 'function') {
        img.decode().then(markDecoded).catch(() => {
          if (img.complete) markDecoded();
          else {
            img.addEventListener('load', markDecoded, { once: true });
            img.addEventListener('error', markDecoded, { once: true });
          }
        });
      } else if (img.complete) {
        markDecoded();
      } else {
        img.addEventListener('load', markDecoded, { once: true });
        img.addEventListener('error', markDecoded, { once: true });
      }
    };

    this.querySelectorAll<HTMLImageElement>('img[data-model-image]').forEach(decodeImg);

    // Feet detection on each hero's data-probe
    heroes.forEach((hero, lookIdx) => {
      const probeUrl = hero.getAttribute('data-probe');
      if (!probeUrl) return;
      const probeImg = new Image();
      probeImg.crossOrigin = 'anonymous';
      probeImg.onload = () => {
        try {
          const cw = 48;
          const ch = Math.max(1, Math.round((probeImg.naturalHeight / probeImg.naturalWidth) * cw));
          const canvas = document.createElement('canvas');
          canvas.width = cw;
          canvas.height = ch;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          ctx.drawImage(probeImg, 0, 0, cw, ch);
          const data = ctx.getImageData(0, 0, cw, ch).data;
          let lastRow = ch - 1;
          outer: for (let r = ch - 1; r >= 0; r--) {
            for (let c = 0; c < cw; c++) {
              if (data[(r * cw + c) * 4 + 3] > 40) {
                lastRow = r;
                break outer;
              }
            }
          }
          const footOffset = clamp((ch - 1 - lastRow) / ch, 0, 0.4);
          const footStr = footOffset.toFixed(4);
          hero.style.setProperty('--rw-foot', footStr);
          allModels.forEach((m, bIdx) => {
            if (bIdx % n === lookIdx) {
              m.style.setProperty('--rw-foot', footStr);
            }
          });
        } catch {
          // Tainted canvas or security error: silently keep offset 0
        }
      };
      probeImg.src = probeUrl;
    });

    // Initialize option pickers on all cards
    const initCardPicker = (card: HTMLElement) => {
      const picker = card.querySelector<HTMLElement>('[data-rw-picker]');
      if (!picker) return;
      const variantsScript = picker.querySelector<HTMLScriptElement>('script[data-rw-variants]');
      if (!variantsScript) return;
      let variants: { id: number; a: boolean; o: string[] }[] = [];
      try {
        variants = JSON.parse(variantsScript.textContent || '[]');
      } catch {
        variants = [];
      }
      const radios = Array.from(picker.querySelectorAll<HTMLInputElement>('input[type="radio"]'));
      const confirmBtn = picker.querySelector<HTMLButtonElement>('[data-rw-confirm]');
      const confirmLabel = picker.querySelector<HTMLElement>('[data-rw-confirm-label]');

      const updateSelection = (isInitial: boolean) => {
        const checked = radios.find((r) => r.checked);
        const selectedVal = checked ? checked.value : '';
        radios.forEach((r) => {
          const pill = r.closest('.rw__pill');
          const hasAvail = variants.some((v) => v.a && v.o[0] === r.value);
          if (pill) {
            pill.classList.toggle('is-unavailable', !hasAvail);
          }
        });
        const match = variants.find((v) => v.a && v.o[0] === selectedVal);
        if (match) {
          card.dataset.selected = String(match.id);
          if (confirmBtn) confirmBtn.disabled = false;
          if (confirmLabel) {
            confirmLabel.textContent = confirmLabel.getAttribute('data-add') || 'Add to bag';
          }
        } else {
          delete card.dataset.selected;
          if (confirmBtn) confirmBtn.disabled = true;
          if (confirmLabel) {
            confirmLabel.textContent = this.getAttribute('data-msg-soldout') || 'Sold out';
          }
        }
        if (!isInitial) {
          card.dataset.touched = '1';
        }
      };

      updateSelection(true);
      (card as unknown as { __updatePicker?: (init: boolean) => void }).__updatePicker = updateSelection;
    };

    this.querySelectorAll<HTMLElement>('[data-rw-card]').forEach(initCardPicker);

    // State variables
    const startOffset = reducedMotion ? 0 : 1.15;
    let index = 0;
    let target = 0;
    let cur = -startOffset;
    let vel = 0;
    let still = false;
    let visible = true;
    let dragging = false;
    let playing = false;
    let engaged = false;
    let panelHover = false;
    let zoomed = false;
    let autoTimer: number | null = null;
    let rafId: number | null = null;
    let lastFrameTime = 0;

    let W = 800;
    let H = 600;
    let unit = 240;
    let isMobile = window.innerWidth <= 749;
    let latchedVh = window.innerHeight;
    let latchedVw = window.innerWidth;

    const bodies: ClassicBodySpring[] = allModels.map((el, a) => {
      const g0 = wrapN(a - target, N) + startOffset;
      return {
        el,
        hit: el.querySelector<HTMLButtonElement>('[data-rw-go]'),
        lookIdx: a % n,
        w: 300,
        x: g0,
        g: g0,
        v: 0,
        from: g0,
        trip: false,
        lastBlur: -1,
      };
    });

    // Mobile size sheet host
    let sheetHost: HTMLElement | null = null;
    let activeSheetCard: HTMLElement | null = null;
    let activeSheetPicker: HTMLElement | null = null;

    const ensureSheetHost = (): HTMLElement => {
      if (sheetHost) return sheetHost;
      sheetHost = document.createElement('div');
      sheetHost.className = 'rw-sheet-host';
      const scrim = document.createElement('button');
      scrim.type = 'button';
      scrim.className = 'rw__pick-scrim';
      scrim.setAttribute('data-rw-pick-close', '');
      scrim.tabIndex = -1;
      scrim.setAttribute('aria-hidden', 'true');
      sheetHost.appendChild(scrim);
      document.body.appendChild(sheetHost);

      sheetHost.addEventListener('click', onSectionClick);
      sheetHost.addEventListener('change', onSectionChange);
      return sheetHost;
    };

    const syncSheetTokens = () => {
      if (!sheetHost) return;
      const cs = getComputedStyle(this);
      const tokens = [
        '--rw-panel',
        '--rw-text',
        '--rw-muted',
        '--rw-line',
        '--rw-accent',
        '--rw-on-accent',
        '--rw-btn-bg',
        '--rw-btn-fg',
        '--rw-btn-radius',
        '--rw-pill-radius',
        '--rw-bar-r',
        '--rw-thumb-radius',
        '--rw-pt-size',
        '--rw-price',
        '--rw-opt',
        '--rw-ease',
        '--rw-ease-sheet',
        '--rw-ease-spring',
      ];
      tokens.forEach((t) => {
        sheetHost!.style.setProperty(t, cs.getPropertyValue(t));
      });
      sheetHost.style.fontFamily = cs.fontFamily;
      sheetHost.style.color = cs.color;
    };

    const closePickerForCard = (card: HTMLElement, restoreFocus = false) => {
      const addBtn = card.querySelector<HTMLButtonElement>('[data-rw-add]');
      let picker = card.querySelector<HTMLElement>('[data-rw-picker]');
      if (!picker && activeSheetCard === card && activeSheetPicker) {
        picker = activeSheetPicker;
      }
      if (!picker) return;

      if (activeSheetCard === card && activeSheetPicker === picker) {
        card.appendChild(picker);
        activeSheetCard = null;
        activeSheetPicker = null;
        if (sheetHost) {
          sheetHost.classList.remove('is-open');
        }
        this.classList.remove('rw--picking');
      }

      picker.hidden = true;
      card.classList.remove('is-picking');
      if (addBtn && !card.classList.contains('is-added')) {
        addBtn.setAttribute('aria-expanded', 'false');
        if (restoreFocus) {
          addBtn.focus();
        }
      }
    };

    const closeAllMobileSheets = (restoreFocus = false) => {
      if (activeSheetCard) {
        closePickerForCard(activeSheetCard, restoreFocus);
      }
    };

    const openPickerForCard = (card: HTMLElement, scrollIntoViewOnDesktop = true) => {
      if (card.classList.contains('is-added')) return;
      const addBtn = card.querySelector<HTMLButtonElement>('[data-rw-add]');
      let picker = card.querySelector<HTMLElement>('[data-rw-picker]');
      if (!picker && activeSheetCard === card && activeSheetPicker) {
        picker = activeSheetPicker;
      }
      if (!picker) return;

      if (isMobile) {
        if (activeSheetCard && activeSheetCard !== card) {
          closePickerForCard(activeSheetCard, false);
        }
        const host = ensureSheetHost();
        syncSheetTokens();
        host.appendChild(picker);
        picker.hidden = false;
        host.classList.add('is-open');
        this.classList.add('rw--picking');
        activeSheetCard = card;
        activeSheetPicker = picker;
      } else {
        picker.hidden = false;
        if (scrollIntoViewOnDesktop) {
          revealCard(card);
        }
      }

      card.classList.add('is-picking');
      if (addBtn) {
        addBtn.setAttribute('aria-expanded', 'true');
      }
      const checkedRadio = picker.querySelector<HTMLInputElement>('input[type="radio"]:checked');
      if (checkedRadio) {
        checkedRadio.focus({ preventScroll: true });
      }
    };

    const redockAllSheetsToInline = () => {
      if (activeSheetCard && activeSheetPicker) {
        const card = activeSheetCard;
        const picker = activeSheetPicker;
        card.appendChild(picker);
        activeSheetCard = null;
        activeSheetPicker = null;
        if (sheetHost) {
          sheetHost.classList.remove('is-open');
        }
        this.classList.remove('rw--picking');
      }
    };

    const setStill = (val: boolean) => {
      if (still === val) return;
      still = val;
      this.classList.toggle('rw--still', still);
    };

    const allowBlur = this.getAttribute('data-blur') !== 'false';

    const put = (
      s: ClassicBodySpring,
      x: number,
      bottom: number,
      scale: number,
      opacity: number,
      blur: number,
      z: number
    ) => {
      let op = opacity;
      if (x + (s.w * scale) / 2 < -4 || x - (s.w * scale) / 2 > W + 4) {
        op = 0;
      }
      s.el.style.transform = `translate3d(${x.toFixed(2)}px, ${(-bottom).toFixed(2)}px, 0) translateX(-50%) scale(${scale.toFixed(4)})`;
      s.el.style.opacity = op.toFixed(3);
      s.el.style.zIndex = String(z);
      s.el.style.visibility = op < 0.01 ? 'hidden' : 'visible';
      s.el.style.pointerEvents = op < 0.5 ? 'none' : 'auto';

      const b = allowBlur ? Math.round(blur * 10) / 10 : 0;
      if (b !== s.lastBlur) {
        s.lastBlur = b;
        if (b <= 0.05) {
          s.el.style.removeProperty('filter');
        } else {
          s.el.style.filter = `blur(${b}px)`;
        }
      }
    };

    const renderAll = () => {
      if (!isMobile) {
        // Ring mode
        const fs = 1.08;
        for (let a = 0; a < N; a++) {
          const pose = computeRingBodyPose(a, cur, W, H, false, still, fs, N);
          put(bodies[a], pose.x, pose.bottom, pose.scale, pose.opacity, pose.blur, pose.z);
        }
      } else {
        // Classic phone mode
        const ax = 0.3;
        const ay = 22;
        const sx = 0.32;
        const sy = 22;
        const sr = 0.76;
        const ex = 0.55;
        const d = 4;

        for (let a = 0; a < N; a++) {
          const s = bodies[a];
          const goal = wrapN(a - target, N);
          let k = s.x;
          let e = -1;

          if (s.trip) {
            const denom = Math.max(0.0001, Math.abs(goal - s.from));
            const u = clamp(Math.abs(s.x - s.from) / denom, 0, 1);
            if (goal > s.from) {
              // Trip forward
              if (u < 0.5) {
                e = 2 * u * 1.4;
              } else {
                k = goal + 2 * (1 - u);
              }
            } else {
              // Trip backward
              if (u < 0.5) {
                k = s.from + 2 * u;
              } else {
                e = 2 * (1 - u) * 1.4;
              }
            }
          } else if (k < 0) {
            e = Math.min(-k, 1.4);
          }

          if (e >= 0) {
            const x = W * (ax - ex * e);
            const bottom = ay - 22 * e;
            const scale = 1 + 0.14 * e;
            const opacity = Math.max(0, 1 - 1.05 * e);
            const blur = 4 * Math.min(e, 1);
            const z = 1100;
            put(s, x, bottom, scale, opacity, blur, z);
          } else {
            const x = W * (ax + sx * k);
            const bottom = ay + sy * k;
            const scale = Math.pow(sr, k);
            let opacity = k <= d - 1 ? 1 - 0.13 * k : Math.max(0, 0.61 * (4 - k));
            if (still && Math.abs(k) < 0.02) {
              opacity = 0;
            }
            const blur = Math.min(0.9 * Math.max(0, k), 3.2);
            const z = 1000 - Math.round(10 * k);
            put(s, x, bottom, scale, opacity, blur, z);
          }
        }
      }
    };

    const tickLoop = (now: number) => {
      rafId = null;
      if (!visible || document.hidden) return;

      const dt = lastFrameTime ? Math.min(0.034, (now - lastFrameTime) / 1000) : 1 / 60;
      lastFrameTime = now;

      if (reducedMotion) {
        cur = target;
        vel = 0;
        bodies.forEach((s, a) => {
          const goal = wrapN(a - target, N);
          s.x = goal;
          s.g = goal;
          s.v = 0;
          s.trip = false;
        });
        setStill(!dragging);
        renderAll();
        return;
      }

      if (!isMobile) {
        // Ring physics
        const res = stepSpring(cur, vel, target, dt, 95);
        cur = res.cur;
        vel = res.vel;
        const settled = res.settled && !dragging;
        if (settled) {
          setStill(true);
          renderAll();
          lastFrameTime = 0;
        } else {
          setStill(false);
          renderAll();
          rafId = window.requestAnimationFrame(tickLoop);
        }
      } else {
        // Classic per-body physics
        let allSettled = !dragging;
        const K = 95;
        const C = 2 * Math.sqrt(K);
        for (let a = 0; a < N; a++) {
          const s = bodies[a];
          const goal = wrapN(a - target, N);
          if (Math.abs(goal - s.g) > N / 2 && !s.trip) {
            s.trip = true;
            s.from = s.x;
          }
          const tau = dragging ? 0.016 : s.trip ? 0.1 : 0.03 + 0.04 * Math.min(goal, 4);
          s.g += (goal - s.g) * (1 - Math.exp(-dt / tau));

          const h = dt / 3;
          for (let step = 0; step < 3; step++) {
            const acc = -K * (s.x - s.g) - C * s.v;
            s.v += acc * h;
            s.x += s.v * h;
          }

          if (s.trip && Math.abs(s.x - goal) < 0.02) {
            s.trip = false;
          }
          if (Math.abs(s.x - goal) <= 0.0006 && Math.abs(s.v) <= 0.0006) {
            s.x = goal;
            s.g = goal;
            s.v = 0;
            s.trip = false;
          } else {
            allSettled = false;
          }
        }

        if (allSettled) {
          setStill(true);
          renderAll();
          lastFrameTime = 0;
        } else {
          setStill(false);
          renderAll();
          rafId = window.requestAnimationFrame(tickLoop);
        }
      }
    };

    const kick = () => {
      if (rafId === null && visible && !document.hidden) {
        lastFrameTime = 0;
        rafId = window.requestAnimationFrame(tickLoop);
      }
    };

    const measure = () => {
      const prevMobile = isMobile;
      isMobile = window.innerWidth <= 749;

      if (prevMobile && !isMobile) {
        redockAllSheetsToInline();
      }

      if (!isMobile) {
        let headerH = 0;
        const headerEls = document.querySelectorAll<HTMLElement>(
          '.shopify-section-group-header-group, #shopify-section-header, #shopify-section-announcement-bar'
        );
        headerEls.forEach((el) => {
          if (!el.contains(this) && el.offsetParent !== null) {
            headerH += el.getBoundingClientRect().height;
          }
        });
        const frameH = Math.max(380, window.innerHeight - headerH);
        this.style.setProperty('--rw-frame-h', `${Math.round(frameH)}px`);
      } else {
        if (
          window.innerWidth !== latchedVw ||
          Math.abs(window.innerHeight - latchedVh) >= 160
        ) {
          latchedVw = window.innerWidth;
          latchedVh = window.innerHeight;
        }
        const mvh = clamp(Number(this.getAttribute('data-mheight-vh') || 109), 50, 120);
        const frameH = (latchedVh * mvh) / 100;
        this.style.setProperty('--rw-frame-h', `${Math.round(frameH)}px`);
      }

      const stageRect = stage.getBoundingClientRect();
      const newW = Math.max(200, Math.round(stageRect.width));
      const newH = Math.max(200, Math.round(stageRect.height));
      const sizeChanged = Math.abs(newW - W) > 1 || Math.abs(newH - H) > 1 || prevMobile !== isMobile;
      W = newW;
      H = newH;

      const fs = !isMobile ? 1.08 : 1;
      this.style.setProperty('--rw-fs', String(fs));

      const modelH = !isMobile
        ? Math.max(200, Math.round((H - 34 - 18) / 1.08))
        : Math.max(200, Math.round(H - 24 - 18));
      stage.style.setProperty('--rw-model-h', `${modelH}px`);

      const hx = !isMobile ? 0.5 * W : 0.3 * W;
      const hy = !isMobile ? 34 : 22;
      stage.style.setProperty('--rw-hx', `${hx.toFixed(1)}px`);
      stage.style.setProperty('--rw-hy', `${hy}px`);
      this.style.setProperty('--rw-ax', `${((hx / W) * 100).toFixed(1)}%`);

      unit = !isMobile ? Math.max(120, 0.3 * W) : Math.max(90, W * 0.32 * 1.6);

      bodies.forEach((s) => {
        s.w = s.el.offsetWidth || Math.round(modelH * 0.5625);
      });

      if (prevMobile !== isMobile) {
        if (!isMobile) {
          cur = target;
          vel = 0;
        } else {
          bodies.forEach((s, a) => {
            const goal = wrapN(a - target, N);
            s.x = goal;
            s.g = goal;
            s.v = 0;
            s.trip = false;
          });
        }
      }

      renderAll();
      if (sizeChanged) {
        kick();
      }
    };

    // Hot linking & card reveal
    const clearHot = () => {
      this.querySelectorAll('.is-hot').forEach((el) => el.classList.remove('is-hot'));
    };

    const revealCard = (card: HTMLElement) => {
      const list = card.closest<HTMLElement>('.rw__items');
      if (!list) return;
      const behavior: ScrollBehavior = reducedMotion ? 'auto' : 'smooth';
      if (list.scrollWidth > list.clientWidth + 4) {
        const listRect = list.getBoundingClientRect();
        const cardRect = card.getBoundingClientRect();
        list.scrollBy({ left: cardRect.left - listRect.left - 20, behavior });
      } else if (list.scrollHeight > list.clientHeight + 4) {
        list.scrollTo({ top: card.offsetTop - list.offsetTop - 12, behavior });
      } else {
        const cardRect = card.getBoundingClientRect();
        if (cardRect.top < 0 || cardRect.bottom > window.innerHeight - 140) {
          window.scrollBy({ top: cardRect.top - 0.3 * window.innerHeight, behavior });
        }
      }
    };

    const hot = (cardNum: number, scroll = false) => {
      clearHot();
      const activeContainer = zoomed && lbStage ? lbStage : heroes[index];
      if (activeContainer) {
        const pin = activeContainer.querySelector<HTMLElement>(`[data-rw-pin="${cardNum}"]`);
        pin?.classList.add('is-hot');
      }
      const activePanel = panels[index];
      if (activePanel) {
        const card = activePanel.querySelector<HTMLElement>(`[data-rw-card="${cardNum}"]`);
        if (card) {
          card.classList.add('is-hot');
          if (scroll) {
            revealCard(card);
          }
        }
      }
    };

    // Lightbox ("View look" popup)
    let lbCleanupTimeout: number | null = null;

    const openPopup = () => {
      if (zoomed || !lb || !lbStage) return;
      engage();
      clearHot();
      if (lbCleanupTimeout !== null) {
        window.clearTimeout(lbCleanupTimeout);
        lbCleanupTimeout = null;
      }

      const hero = heroes[index];
      if (!hero) return;
      const runwayFig = hero.querySelector<HTMLElement>('.rw__figure');
      const runwayShadow = hero.querySelector<HTMLElement>('.rw__shadow');
      if (!runwayFig) return;

      const aRect = runwayFig.getBoundingClientRect();
      lbStage.innerHTML = '';

      const wrapper = document.createElement('div');
      wrapper.className = 'rw__lb-model';
      const footVal = hero.style.getPropertyValue('--rw-foot');
      if (footVal) {
        wrapper.style.setProperty('--rw-foot', footVal);
      }

      if (runwayShadow) {
        wrapper.appendChild(runwayShadow.cloneNode(true));
      }
      const figClone = runwayFig.cloneNode(true) as HTMLElement;
      figClone.querySelector('[data-rw-zoom]')?.remove();
      figClone.querySelectorAll<HTMLButtonElement>('[data-rw-pin]').forEach((pin) => {
        pin.tabIndex = 0;
      });
      lbStage.appendChild(wrapper);
      wrapper.appendChild(figClone);

      const stageRect = lbStage.getBoundingClientRect();
      const stW = Math.max(200, stageRect.width || W - 96);
      const stH = Math.max(200, stageRect.height || H - 136);
      const h = Math.max(160, Math.min(stH, stW / 0.5625));
      wrapper.style.setProperty('--rw-model-h', `${Math.round(h)}px`);

      figClone.querySelectorAll<HTMLImageElement>('img').forEach((img) => {
        img.loading = 'eager';
        img.sizes = `${Math.round(h * 0.5625)}px`;
        decodeImg(img);
      });

      const word = lb.getAttribute('data-word') || 'Look';
      if (lbKicker) {
        lbKicker.textContent = `${word} ${String(index + 1).padStart(2, '0')}`;
      }
      if (lbName) {
        lbName.textContent = hero.getAttribute('data-name') || '';
      }

      zoomed = true;
      this.classList.add('rw--zoom');
      lb.setAttribute('aria-hidden', 'false');

      if (!reducedMotion && aRect.height > 0) {
        const bRect = figClone.getBoundingClientRect();
        if (bRect.height > 0) {
          const dx = aRect.left - bRect.left;
          const dy = aRect.bottom - bRect.bottom;
          const sc = aRect.height / bRect.height;
          wrapper.style.transition = 'none';
          wrapper.style.transformOrigin = '0 100%';
          wrapper.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0) scale(${sc.toFixed(4)})`;
          void wrapper.offsetWidth;
          wrapper.style.transition = '';
          wrapper.style.transform = '';
        }
      }

      lbCloseBtn?.focus();
    };

    const closePopup = () => {
      if (!zoomed || !lb || !lbStage) return;
      zoomed = false;
      clearHot();

      const wrapper = lbStage.querySelector<HTMLElement>('.rw__lb-model');
      const figClone = wrapper?.querySelector<HTMLElement>('.rw__figure');
      const hero = heroes[index];
      const runwayFig = hero?.querySelector<HTMLElement>('.rw__figure');

      if (!reducedMotion && wrapper && figClone && runwayFig) {
        const aRect = runwayFig.getBoundingClientRect();
        const bRect = figClone.getBoundingClientRect();
        if (aRect.height > 0 && bRect.height > 0) {
          const dx = aRect.left - bRect.left;
          const dy = aRect.bottom - bRect.bottom;
          const sc = aRect.height / bRect.height;
          wrapper.style.transformOrigin = '0 100%';
          wrapper.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0) scale(${sc.toFixed(4)})`;
        }
      }

      const focusWasInside = lb.contains(document.activeElement);
      this.classList.remove('rw--zoom');
      lb.setAttribute('aria-hidden', 'true');

      if (focusWasInside) {
        stage.focus();
      }

      if (lbCleanupTimeout !== null) {
        window.clearTimeout(lbCleanupTimeout);
      }
      lbCleanupTimeout = window.setTimeout(() => {
        if (!zoomed && lbStage) {
          lbStage.innerHTML = '';
        }
        lbCleanupTimeout = null;
      }, reducedMotion ? 0 : 950);
    };

    // Autoplay bar and timer
    const restartAutoBar = () => {
      if (autoTimer !== null) {
        window.clearTimeout(autoTimer);
        autoTimer = null;
      }
      ticks.forEach((t) => t.classList.remove('is-run'));
      if (!playing) return;
      const curTick = ticks[index];
      if (curTick) {
        void curTick.offsetWidth;
        curTick.classList.add('is-run');
      }
      const speed = Number(this.getAttribute('data-speed') || 5000);
      autoTimer = window.setTimeout(() => {
        if (
          playing &&
          visible &&
          !dragging &&
          !document.hidden &&
          !panelHover &&
          !zoomed &&
          !engaged
        ) {
          next();
        } else {
          restartAutoBar();
        }
      }, speed);
    };

    const play = (on: boolean) => {
      playing = on;
      this.classList.toggle('is-playing', playing);
      if (autoBtn) {
        autoBtn.setAttribute('aria-pressed', playing ? 'true' : 'false');
      }
      restartAutoBar();
    };

    const engage = () => {
      engaged = true;
      if (playing) {
        play(false);
      }
    };

    const computeBodyRank = (a: number): number => {
      let r = wrapN(a - Math.round(target), N);
      if (!isMobile && r > N / 2) {
        r -= N;
      }
      return r;
    };

    const updateAccessibilityRanks = () => {
      const maxRank = !isMobile ? 2 : 3;
      bodies.forEach((s, a) => {
        const k = computeBodyRank(a);
        const accessible = k !== 0 && Math.abs(k) <= maxRank;
        if (accessible) {
          s.el.removeAttribute('aria-hidden');
          if (s.hit) {
            s.hit.tabIndex = 0;
            s.hit.removeAttribute('aria-hidden');
          }
        } else {
          s.el.setAttribute('aria-hidden', 'true');
          if (s.hit) {
            s.hit.tabIndex = -1;
            s.hit.setAttribute('aria-hidden', 'true');
          }
        }
      });
    };

    const setIndex = (newIdx: number, silent = false) => {
      const prevIdx = index;
      index = wrapN(newIdx, n);
      updateAccessibilityRanks();
      kick();

      const progress = ((index + 1) / n).toFixed(3);
      this.style.setProperty('--rw-progress', progress);

      if (silent) {
        ticks.forEach((t, j) => {
          t.setAttribute('aria-current', j === index ? 'true' : 'false');
          t.classList.toggle('is-past', j < index);
        });
        heroes.forEach((h, j) => {
          const isOn = j === index;
          h.classList.toggle('is-on', isOn);
          h.setAttribute('aria-hidden', isOn ? 'false' : 'true');
          const zBtn = h.querySelector<HTMLButtonElement>('[data-rw-zoom]');
          if (zBtn) zBtn.tabIndex = isOn ? 0 : -1;
        });
        return;
      }

      if (zoomed) closePopup();
      if (isMobile) closeAllMobileSheets(false);

      heroes.forEach((h, j) => {
        const isOn = j === index;
        const wasOn = j === prevIdx && prevIdx !== index;
        h.classList.toggle('is-on', isOn);
        h.classList.toggle('was', wasOn);
        h.setAttribute('aria-hidden', isOn ? 'false' : 'true');
        const zBtn = h.querySelector<HTMLButtonElement>('[data-rw-zoom]');
        if (zBtn) zBtn.tabIndex = isOn ? 0 : -1;
      });

      if (!reducedMotion) {
        stage.classList.remove('is-sweep');
        void stage.offsetWidth;
        stage.classList.add('is-sweep');
      }

      const activeHero = heroes[index];
      if (liveEl && activeHero) {
        liveEl.textContent = activeHero.getAttribute('data-label') || '';
      }

      ticks.forEach((t, j) => {
        t.setAttribute('aria-current', j === index ? 'true' : 'false');
        t.classList.toggle('is-past', j < index);
      });

      panels.forEach((p, j) => {
        const isCurrent = j === index;
        p.hidden = !isCurrent;
        p.classList.remove('is-in');
      });

      const activePanel = panels[index];
      if (activePanel) {
        void activePanel.offsetWidth;
        activePanel.classList.add('is-in');
        const tpl = activePanel.querySelector<HTMLTemplateElement>('[data-rw-pieces-text]');
        if (piecesEl && tpl) {
          piecesEl.textContent = (tpl.content.textContent || '3 pieces').trim();
          piecesEl.classList.remove('is-swap');
          void piecesEl.offsetWidth;
          piecesEl.classList.add('is-swap');
        }
      }

      clearHot();
      restartAutoBar();
    };

    const moveTo = (T: number) => {
      target = T;
      setStill(false);
      setIndex(wrapN(Math.round(T), n));
    };

    const next = () => moveTo(Math.round(target) + 1);
    const prev = () => moveTo(Math.round(target) - 1);
    const go = (i: number) => {
      const d = shortestLoopDelta(index, i, n);
      moveTo(Math.round(target) + d);
    };

    // Check panel completion
    const checkPanelCompletion = (panel: HTMLElement) => {
      const cards = Array.from(panel.querySelectorAll<HTMLElement>('[data-rw-card]'));
      if (cards.length >= 2 && cards.every((c) => c.classList.contains('is-added'))) {
        panel.classList.add('is-complete');
        const msgEl = panel.querySelector<HTMLElement>('[data-rw-msg]');
        if (msgEl) msgEl.textContent = '';
      }
    };

    const markCardAdded = (card: HTMLElement) => {
      card.classList.remove('is-loading');
      card.classList.add('is-added');
      closePickerForCard(card, false);
      const addBtn = card.querySelector<HTMLButtonElement>('[data-rw-add]');
      if (addBtn) {
        const addedLabel = addBtn.getAttribute('data-added-label');
        if (addedLabel) addBtn.setAttribute('aria-label', addedLabel);
        addBtn.removeAttribute('aria-expanded');
      }
      if (isMobile && !reducedMotion && typeof navigator.vibrate === 'function') {
        try {
          navigator.vibrate(12);
        } catch {
          // Ignore vibrate errors
        }
      }
      const panel = card.closest<HTMLElement>('[data-rw-panel]');
      if (panel) {
        checkPanelCompletion(panel);
      }
    };

    const handleSingleConfirm = (confirmBtn: HTMLButtonElement) => {
      let card = confirmBtn.closest<HTMLElement>('[data-rw-card]');
      if (!card && activeSheetCard) {
        card = activeSheetCard;
      }
      if (!card || card.classList.contains('is-added') || card.classList.contains('is-loading')) return;
      card.dataset.touched = '1';
      const variantId = Number(card.dataset.selected);
      const panel = card.closest<HTMLElement>('[data-rw-panel]');
      const msgEl = panel?.querySelector<HTMLElement>('[data-rw-msg]');
      if (msgEl) msgEl.textContent = '';

      if (!variantId) {
        if (msgEl) {
          msgEl.textContent = this.getAttribute('data-msg-error') || 'Couldn’t add to bag. Please try again.';
        }
        return;
      }

      card.classList.add('is-loading');
      window.setTimeout(() => {
        try {
          getBagController().add([{ id: variantId, quantity: 1 }]);
          markCardAdded(card!);
        } catch {
          card!.classList.remove('is-loading');
          if (msgEl) {
            msgEl.textContent = this.getAttribute('data-msg-error') || 'Couldn’t add to bag. Please try again.';
          }
        }
      }, 240);
    };

    const handleAddFullLook = (ctaBtn: HTMLButtonElement) => {
      const panel = ctaBtn.closest<HTMLElement>('[data-rw-panel]');
      if (!panel || panel.classList.contains('is-complete') || ctaBtn.classList.contains('is-loading')) {
        return;
      }
      const msgEl = panel.querySelector<HTMLElement>('[data-rw-msg]');
      if (msgEl) msgEl.textContent = '';

      const remainingCards = Array.from(panel.querySelectorAll<HTMLElement>('[data-rw-card]')).filter(
        (c) => !c.classList.contains('is-added')
      );

      const readyCards: HTMLElement[] = [];
      const pendingCards: HTMLElement[] = [];

      remainingCards.forEach((c) => {
        const directVid = c.getAttribute('data-variant-id');
        if (directVid || (c.dataset.touched === '1' && c.dataset.selected)) {
          readyCards.push(c);
        } else {
          pendingCards.push(c);
        }
      });

      const finishPending = () => {
        if (pendingCards.length > 0) {
          if (isMobile) {
            openPickerForCard(pendingCards[0], false);
          } else {
            pendingCards.forEach((c, idx) => openPickerForCard(c, idx === 0));
          }
          revealCard(pendingCards[0]);
          const titles = pendingCards
            .map((c) => c.getAttribute('data-title') || '')
            .filter(Boolean)
            .join(', ');
          const chooseTpl = this.getAttribute('data-msg-choose') || 'Pick a size for: [items]';
          if (msgEl) {
            msgEl.textContent = chooseTpl.replace('[items]', titles);
          }
        }
      };

      if (readyCards.length > 0) {
        const itemsToAdd = readyCards.map((c) => ({
          id: Number(c.getAttribute('data-variant-id') || c.dataset.selected),
          quantity: 1,
        }));
        ctaBtn.classList.add('is-loading');
        readyCards.forEach((c) => c.classList.add('is-loading'));

        window.setTimeout(() => {
          try {
            getBagController().add(itemsToAdd);
            readyCards.forEach((c) => markCardAdded(c));
            ctaBtn.classList.remove('is-loading');
            finishPending();
          } catch {
            ctaBtn.classList.remove('is-loading');
            readyCards.forEach((c) => c.classList.remove('is-loading'));
            if (msgEl) {
              msgEl.textContent = this.getAttribute('data-msg-error') || 'Couldn’t add to bag. Please try again.';
            }
          }
        }, 280);
      } else {
        finishPending();
      }
    };

    // Click router (delegated on section and sheetHost)
    let suppressClickUntil = 0;

    const onCaptureClick = (e: MouseEvent) => {
      if (performance.now() < suppressClickUntil) {
        e.stopPropagation();
        e.preventDefault();
      }
    };

    const onSectionClick = (e: MouseEvent) => {
      const targetEl = e.target as HTMLElement | null;
      if (!targetEl) return;

      // Engage check on panel interactive controls
      if (
        panelEl &&
        panelEl.contains(targetEl) &&
        targetEl.closest('button, a, input, select, label')
      ) {
        engage();
      }

      // 1. pick-close
      if (targetEl.closest('[data-rw-pick-close]')) {
        if (activeSheetCard) {
          closePickerForCard(activeSheetCard, true);
        } else {
          const card = targetEl.closest<HTMLElement>('[data-rw-card]');
          if (card) closePickerForCard(card, true);
        }
        return;
      }

      // 2. popup close button
      if (targetEl.closest('[data-rw-zoom-close]')) {
        closePopup();
        return;
      }

      // 3. click on popup backdrop or popup stage beside model
      if (
        zoomed &&
        (targetEl === lb ||
          targetEl === lbStage ||
          (lbStage && lbStage.contains(targetEl) && !targetEl.closest('.rw__figure') && !targetEl.closest('[data-rw-pin]')))
      ) {
        closePopup();
        return;
      }

      // 4. [data-rw-zoom] opens popup
      if (targetEl.closest('[data-rw-zoom]')) {
        openPopup();
        return;
      }

      // 5. next
      if (targetEl.closest('[data-rw-next]')) {
        next();
        return;
      }

      // 6. prev
      if (targetEl.closest('[data-rw-prev]')) {
        prev();
        return;
      }

      // 7. tick
      const tickBtn = targetEl.closest<HTMLButtonElement>('[data-rw-tick]');
      if (tickBtn) {
        const i = Number(tickBtn.getAttribute('data-rw-tick') || 0);
        go(i);
        return;
      }

      // 8. autoplay toggle
      if (targetEl.closest('[data-rw-auto]')) {
        if (!playing) {
          engaged = false;
        }
        play(!playing);
        return;
      }

      // 9. pin
      const pinBtn = targetEl.closest<HTMLButtonElement>('[data-rw-pin]');
      if (pinBtn) {
        engage();
        const pinNum = Number(pinBtn.getAttribute('data-rw-pin') || 1);
        hot(pinNum, true);
        return;
      }

      // 10. queue body [data-rw-go]
      const goBtn = targetEl.closest<HTMLButtonElement>('[data-rw-go]');
      if (goBtn) {
        const modelEl = goBtn.closest<HTMLElement>('[data-rw-model]');
        if (modelEl) {
          const a = Number(modelEl.getAttribute('data-index') || 0);
          const k = computeBodyRank(a);
          if (k !== 0 && Math.abs(k) < 6) {
            moveTo(Math.round(target) + k);
          } else if (k === 0) {
            openPopup();
          }
        }
        return;
      }

      // 11. size confirm
      const confirmBtn = targetEl.closest<HTMLButtonElement>('[data-rw-confirm]');
      if (confirmBtn) {
        engage();
        handleSingleConfirm(confirmBtn);
        return;
      }

      // 12. plus button
      const addBtn = targetEl.closest<HTMLButtonElement>('[data-rw-add]');
      if (addBtn) {
        const card = addBtn.closest<HTMLElement>('[data-rw-card]');
        if (card && !card.classList.contains('is-added') && !card.classList.contains('is-loading')) {
          if (card.classList.contains('is-picking')) {
            closePickerForCard(card, false);
          } else {
            openPickerForCard(card, true);
          }
        }
        return;
      }

      // 13. add full look
      const allBtn = targetEl.closest<HTMLButtonElement>('[data-rw-all]');
      if (allBtn) {
        handleAddFullLook(allBtn);
        return;
      }
    };

    const onSectionChange = (e: Event) => {
      const targetEl = e.target as HTMLElement | null;
      if (!targetEl) return;
      engage();
      let card = targetEl.closest<HTMLElement>('[data-rw-card]');
      if (!card && activeSheetCard) {
        card = activeSheetCard;
      }
      if (card) {
        const updater = (card as unknown as { __updatePicker?: (init: boolean) => void }).__updatePicker;
        if (updater) updater(false);
      }
    };

    // Pointer drag / swipe on stage
    let pDown = false;
    let pId = -1;
    let startX = 0;
    let startY = 0;
    let startT = 0;
    let samples: { x: number; time: number }[] = [];

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (zoomed) return;
      pDown = true;
      dragging = false;
      pId = e.pointerId;
      startX = e.clientX;
      startY = e.clientY;
      startT = target;
      samples = [{ x: e.clientX, time: performance.now() }];
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!pDown || e.pointerId !== pId) return;
      if (e.pointerType === 'mouse' && (e.buttons & 1) === 0) {
        finishDrag(e);
        return;
      }
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (!dragging) {
        if (Math.abs(dy) > 10 && Math.abs(dy) >= Math.abs(dx)) {
          pDown = false;
          return;
        }
        if (Math.abs(dx) > 8 && Math.abs(dx) > 1.2 * Math.abs(dy)) {
          dragging = true;
          this.classList.add('is-dragging');
          try {
            stage.setPointerCapture(e.pointerId);
          } catch {
            // Ignore capture errors
          }
        }
      }

      if (dragging) {
        const now = performance.now();
        samples.push({ x: e.clientX, time: now });
        if (samples.length > 6) samples.shift();
        target = startT - dx / unit;
        setStill(false);
        kick();
      }
    };

    const finishDrag = (e: PointerEvent) => {
      if (!pDown || e.pointerId !== pId) return;
      pDown = false;
      if (!dragging) return;

      dragging = false;
      this.classList.remove('is-dragging');
      suppressClickUntil = performance.now() + 60;

      const dx = e.clientX - startX;
      const first = samples[0];
      const last = samples[samples.length - 1];
      const dt = Math.max(1, last.time - first.time);
      const vx = (last.x - first.x) / dt;
      const sign = -1;
      const from = Math.round(startT);

      if (isMobile) {
        if (Math.abs(dx) > 30 || Math.abs(vx) > 0.3) {
          moveTo(from + sign * (dx > 0 ? 1 : -1));
        } else {
          moveTo(from);
        }
      } else {
        let nextTarget = Math.round(target + (sign * vx * 160) / unit);
        if (nextTarget === from && Math.abs(vx) > 0.3) {
          nextTarget = from + sign * (vx > 0 ? 1 : -1);
        }
        nextTarget = clamp(nextTarget, from - 2, from + 2);
        moveTo(nextTarget);
      }
    };

    // Trackpad wheel
    let wheelAcc = 0;
    let wheelLockedUntil = 0;
    const onStageWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      if (performance.now() < wheelLockedUntil) return;
      wheelAcc += e.deltaX;
      if (Math.abs(wheelAcc) > 45) {
        if (wheelAcc > 0) next();
        else prev();
        wheelAcc = 0;
        wheelLockedUntil = performance.now() + 520;
      }
    };

    // Keyboard
    const onStageKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prev();
      }
    };

    const onKeyDownGlobal = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeSheetCard) {
          e.preventDefault();
          closePickerForCard(activeSheetCard, true);
        } else if (zoomed) {
          e.preventDefault();
          closePopup();
        }
      }
    };

    // Custom cursor (desktop fine pointer only)
    let cursorRaf: number | null = null;
    let cx = 0;
    let cy = 0;
    let tx = 0;
    let ty = 0;
    let cursorInitialized = false;

    if (finePointer && cursorEl) {
      this.classList.add('rw--cursor');
      const stepCursor = () => {
        cursorRaf = null;
        if (!cursorEl) return;
        const factor = reducedMotion ? 1 : 0.18;
        cx += (tx - cx) * factor;
        cy += (ty - cy) * factor;
        cursorEl.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
        if (Math.hypot(tx - cx, ty - cy) >= 0.2) {
          cursorRaf = window.requestAnimationFrame(stepCursor);
        }
      };

      const onStageMouseMove = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse' || !cursorEl) return;
        const r = stage.getBoundingClientRect();
        tx = e.clientX - r.left;
        ty = e.clientY - r.top;
        if (!cursorInitialized) {
          cursorInitialized = true;
          cx = tx;
          cy = ty;
          cursorEl.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
        }
        cursorEl.classList.add('is-on');

        const elUnder = e.target as HTMLElement | null;
        const overZoom = !dragging && !!elUnder?.closest('.rw__hero.is-on [data-rw-zoom]');
        const overLink =
          !dragging &&
          (!!elUnder?.closest('[data-rw-pin]') || !!elUnder?.closest('[data-rw-go]'));

        cursorEl.classList.toggle('is-view', overZoom);
        cursorEl.classList.toggle('is-link', overLink);

        if (cursorRaf === null) {
          cursorRaf = window.requestAnimationFrame(stepCursor);
        }
      };

      const onStageMouseLeave = () => {
        if (!cursorEl) return;
        cursorEl.classList.remove('is-on', 'is-link', 'is-view');
        cursorInitialized = false;
      };

      stage.addEventListener('pointermove', onStageMouseMove);
      stage.addEventListener('pointerleave', onStageMouseLeave);
      this.cleanupFns.push(() => {
        stage.removeEventListener('pointermove', onStageMouseMove);
        stage.removeEventListener('pointerleave', onStageMouseLeave);
        if (cursorRaf !== null) window.cancelAnimationFrame(cursorRaf);
      });
    } else if (cursorEl) {
      cursorEl.remove();
      cursorEl = null;
    }

    // Panel hover & row hot linking
    const onPanelPointerEnter = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') {
        panelHover = true;
      }
    };
    const onPanelPointerLeave = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') {
        panelHover = false;
        clearHot();
        restartAutoBar();
      }
    };
    const onPanelPointerOver = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const card = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-rw-card]');
      if (card) {
        const num = Number(card.getAttribute('data-rw-card') || 0);
        if (num) hot(num, false);
      }
    };
    const onPanelPointerOut = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const card = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-rw-card]');
      const related = e.relatedTarget as HTMLElement | null;
      if (card && (!related || !card.contains(related))) {
        clearHot();
      }
    };

    if (panelEl) {
      panelEl.addEventListener('pointerenter', onPanelPointerEnter);
      panelEl.addEventListener('pointerleave', onPanelPointerLeave);
      panelEl.addEventListener('pointerover', onPanelPointerOver);
      panelEl.addEventListener('pointerout', onPanelPointerOut);
      this.cleanupFns.push(() => {
        panelEl.removeEventListener('pointerenter', onPanelPointerEnter);
        panelEl.removeEventListener('pointerleave', onPanelPointerLeave);
        panelEl.removeEventListener('pointerover', onPanelPointerOver);
        panelEl.removeEventListener('pointerout', onPanelPointerOut);
      });
    }

    // Attach listeners
    this.addEventListener('click', onCaptureClick, true);
    this.addEventListener('click', onSectionClick);
    this.addEventListener('change', onSectionChange);
    stage.addEventListener('pointerdown', onPointerDown);
    stage.addEventListener('pointermove', onPointerMove);
    stage.addEventListener('pointerup', finishDrag);
    stage.addEventListener('pointercancel', finishDrag);
    stage.addEventListener('wheel', onStageWheel, { passive: false });
    stage.addEventListener('keydown', onStageKeyDown);
    document.addEventListener('keydown', onKeyDownGlobal);

    // Resize handling
    let resizeTimeout: number | null = null;
    const onWindowResize = () => {
      if (resizeTimeout !== null) window.clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        measure();
      }, 120);
    };
    window.addEventListener('resize', onWindowResize);

    const ro = new ResizeObserver(() => {
      measure();
    });
    ro.observe(stage);

    // Visibility & Intro reveal observers
    this.classList.add('rw--js');
    if (reducedMotion) {
      this.classList.add('is-revealed');
    } else {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          this.classList.add('is-revealed');
        });
      });
    }

    const visObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        visible = entry.isIntersecting;
        if (visible) {
          this.classList.add('is-revealed');
          kick();
          restartAutoBar();
        }
      },
      { threshold: 0 }
    );
    visObserver.observe(this);

    const onVisibilityChange = () => {
      if (!document.hidden && visible) {
        kick();
        restartAutoBar();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    // Initial calls
    measure();
    setIndex(0, true);
    if (this.getAttribute('data-autoplay') === 'true' && !reducedMotion) {
      play(true);
    }

    this.cleanupFns.push(() => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      if (autoTimer !== null) window.clearTimeout(autoTimer);
      if (resizeTimeout !== null) window.clearTimeout(resizeTimeout);
      if (lbCleanupTimeout !== null) window.clearTimeout(lbCleanupTimeout);
      visObserver.disconnect();
      ro.disconnect();
      this.removeEventListener('click', onCaptureClick, true);
      this.removeEventListener('click', onSectionClick);
      this.removeEventListener('change', onSectionChange);
      stage.removeEventListener('pointerdown', onPointerDown);
      stage.removeEventListener('pointermove', onPointerMove);
      stage.removeEventListener('pointerup', finishDrag);
      stage.removeEventListener('pointercancel', finishDrag);
      stage.removeEventListener('wheel', onStageWheel);
      stage.removeEventListener('keydown', onStageKeyDown);
      document.removeEventListener('keydown', onKeyDownGlobal);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('resize', onWindowResize);
      redockAllSheetsToInline();
      if (sheetHost) {
        sheetHost.removeEventListener('click', onSectionClick);
        sheetHost.removeEventListener('change', onSectionChange);
        sheetHost.remove();
        sheetHost = null;
      }
    });
  }
}

export function registerRunwayCustomElement() {
  if (!customElements.get('runway-section')) {
    customElements.define('runway-section', RunwaySectionElement);
  }
}
