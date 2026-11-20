import { wrapN } from './runwayMath';

export interface RunwayLoadPlan {
  /** Currently visible primary model (fetched immediately with high priority). */
  priority: number;
  /** Next two models preloaded right after the primary model is ready. */
  preload: number[];
  /** Remaining models deferred for lazy loading on navigation or browser idle. */
  lazy: number[];
}

/**
 * Pure sliding-window loading planner for the circular Menswear Runway.
 *
 * - Priority: active model (`activeIndex`)
 * - Preload:  next two models (`activeIndex + 1`, `activeIndex + 2`)
 * - Lazy:     all remaining models, placing the immediate left ring neighbor
 *             (`activeIndex - 1`) first so desktop ring flanking fills naturally
 *             once the priority and preload tiers settle.
 */
export function getRunwayLoadPlan(activeIndex: number, totalLooks: number): RunwayLoadPlan {
  const n = Math.max(1, Math.floor(totalLooks));
  const priority = wrapN(activeIndex, n);
  const preload: number[] = [];
  const seen = new Set<number>([priority]);

  for (let step = 1; step <= 2; step++) {
    const idx = wrapN(priority + step, n);
    if (!seen.has(idx)) {
      seen.add(idx);
      preload.push(idx);
    }
  }

  const lazy: number[] = [];
  // Immediate previous look first in lazy queue (left flank in desktop ring)
  const prevIdx = wrapN(priority - 1, n);
  if (!seen.has(prevIdx)) {
    seen.add(prevIdx);
    lazy.push(prevIdx);
  }
  for (let step = 3; step < n; step++) {
    const idx = wrapN(priority + step, n);
    if (!seen.has(idx)) {
      seen.add(idx);
      lazy.push(idx);
    }
  }

  return { priority, preload, lazy };
}

/**
 * Picks the exact responsive model URL that matches the browser's `<img srcset>`
 * selection for the current viewport and devicePixelRatio, preventing double downloads.
 */
export function selectOptimalModelUrl(
  model640: string,
  model1080: string,
  viewportWidth: number,
  devicePixelRatio: number
): string {
  const renderedCssWidth =
    viewportWidth >= 1800 ? 540 : viewportWidth >= 750 ? 420 : 320;
  const requiredPhysicalWidth = renderedCssWidth * Math.max(1, devicePixelRatio || 1);
  return requiredPhysicalWidth > 640 ? model1080 : model640;
}

export interface LookAssetDescriptor {
  index: number;
  model640: string;
  model1080: string;
  productImages: string[];
}

/**
 * In-memory decoded bitmap cache & prioritized preloader for Menswear Runway assets.
 *
 * Keeps strong references to loaded `HTMLImageElement` instances so the browser
 * retains decoded bitmaps in memory and never flashes blank frames when switching
 * between already-visited models.
 */
export class RunwayAssetCache {
  private readonly loadedImages = new Map<string, HTMLImageElement>();
  private readonly inFlight = new Map<string, Promise<void>>();
  private readonly decodedUrls = new Set<string>();
  private readonly readyLooks = new Set<number>();

  public isUrlCached(url: string): boolean {
    return this.decodedUrls.has(url);
  }

  public isLookReady(lookIdx: number): boolean {
    return this.readyLooks.has(lookIdx);
  }

  public markUrlDecoded(url: string, lookIdx?: number): void {
    if (url) {
      this.decodedUrls.add(url);
    }
    if (typeof lookIdx === 'number') {
      this.readyLooks.add(lookIdx);
    }
  }

  public getCachedUrlCount(): number {
    return this.decodedUrls.size;
  }

  /**
   * Preloads and decodes an image URL into the in-memory bitmap cache.
   * Deduplicates concurrent requests for the same URL.
   */
  public preloadUrl(
    url: string,
    fetchPriority: 'high' | 'low' | 'auto' = 'auto',
    lookIdx?: number
  ): Promise<void> {
    if (!url) return Promise.resolve();
    if (this.decodedUrls.has(url)) {
      if (typeof lookIdx === 'number') this.readyLooks.add(lookIdx);
      return Promise.resolve();
    }

    const existing = this.inFlight.get(url);
    if (existing) {
      return existing.then(() => {
        if (typeof lookIdx === 'number' && this.decodedUrls.has(url)) {
          this.readyLooks.add(lookIdx);
        }
      });
    }

    const promise = new Promise<void>((resolve) => {
      if (typeof Image === 'undefined') {
        this.markUrlDecoded(url, lookIdx);
        resolve();
        return;
      }

      const img = new Image();
      img.decoding = 'async';
      img.referrerPolicy = 'no-referrer';
      if ('fetchPriority' in img) {
        (img as HTMLImageElement & { fetchPriority: string }).fetchPriority = fetchPriority;
      }

      const finish = () => {
        this.loadedImages.set(url, img);
        this.markUrlDecoded(url, lookIdx);
        this.inFlight.delete(url);
        resolve();
      };

      img.src = url;

      if (typeof img.decode === 'function') {
        img.decode().then(finish).catch(() => {
          if (img.complete) {
            finish();
          } else {
            img.addEventListener('load', finish, { once: true });
            img.addEventListener('error', finish, { once: true });
          }
        });
      } else if (img.complete) {
        finish();
      } else {
        img.addEventListener('load', finish, { once: true });
        img.addEventListener('error', finish, { once: true });
      }
    });

    this.inFlight.set(url, promise);
    return promise;
  }

  /**
   * Hydrates a deferred `<img data-rw-src="..." data-rw-srcset="...">` element
   * and marks `.is-decoded` synchronously when already cached to prevent blank frames.
   */
  public hydrateModelImg(
    img: HTMLImageElement,
    lookIdx: number,
    fetchPriority: 'high' | 'low' | 'auto' = 'auto'
  ): Promise<void> {
    const deferredSrc = img.getAttribute('data-rw-src');
    const deferredSrcset = img.getAttribute('data-rw-srcset');
    const deferredSizes = img.getAttribute('data-rw-sizes');

    if ('fetchPriority' in img) {
      (img as HTMLImageElement & { fetchPriority: string }).fetchPriority = fetchPriority;
    }

    const figure = img.closest<HTMLElement>('.rw__figure');

    if (deferredSizes && !img.getAttribute('sizes')) {
      img.setAttribute('sizes', deferredSizes);
    }
    if (deferredSrcset && !img.getAttribute('srcset')) {
      img.setAttribute('srcset', deferredSrcset);
    }
    if (deferredSrc && !img.getAttribute('src')) {
      img.loading = 'eager';
      img.setAttribute('src', deferredSrc);
    }

    const activeUrl = img.currentSrc || img.getAttribute('src') || deferredSrc || '';
    const alreadyCached =
      this.isLookReady(lookIdx) ||
      (activeUrl !== '' && this.decodedUrls.has(activeUrl)) ||
      (img.complete && img.naturalWidth > 0);

    if (alreadyCached) {
      if (activeUrl) this.markUrlDecoded(activeUrl, lookIdx);
      img.classList.add('is-cached', 'is-decoded');
      figure?.classList.remove('is-img-loading');
      return Promise.resolve();
    }

    figure?.classList.add('is-img-loading');

    return new Promise<void>((resolve) => {
      const done = () => {
        const resolvedUrl = img.currentSrc || img.getAttribute('src') || activeUrl;
        if (resolvedUrl) {
          this.markUrlDecoded(resolvedUrl, lookIdx);
        } else {
          this.readyLooks.add(lookIdx);
        }
        img.classList.add('is-decoded');
        figure?.classList.remove('is-img-loading');
        resolve();
      };

      if (typeof img.decode === 'function') {
        img.decode().then(done).catch(() => {
          if (img.complete) {
            done();
          } else {
            img.addEventListener('load', done, { once: true });
            img.addEventListener('error', done, { once: true });
          }
        });
      } else if (img.complete) {
        done();
      } else {
        img.addEventListener('load', done, { once: true });
        img.addEventListener('error', done, { once: true });
      }
    });
  }
}

let sharedCache: RunwayAssetCache | null = null;

export function getRunwayAssetCache(): RunwayAssetCache {
  if (!sharedCache) {
    sharedCache = new RunwayAssetCache();
  }
  return sharedCache;
}
