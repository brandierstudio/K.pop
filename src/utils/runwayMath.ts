import { NATIVE_CATALOG } from '../data/catalogData';
import { CurrencyCode, formatPrice, getCurrency } from './currency';

export interface BagEntry {
  id: number;
  quantity: number;
}

export interface ResolvedBagItem {
  id: number;
  quantity: number;
  productId: string;
  name: string;
  size: string;
  price: number;
  lineTotal: number;
  priceFormatted: string;
  lineTotalFormatted: string;
  image: string;
  url: string;
  railGarmentK?: number;
}

export const BAG_STORAGE_KEY = 'runway-styling-bag-v3';

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function wrapN(val: number, n: number): number {
  return ((val % n) + n) % n;
}

export function shortestLoopDelta(currentIndex: number, targetIndex: number, totalLooks = 6): number {
  let d = wrapN(targetIndex - currentIndex, totalLooks);
  if (d > totalLooks / 2) {
    d -= totalLooks;
  }
  return d;
}

export interface RingPose {
  x: number;
  bottom: number;
  scale: number;
  opacity: number;
  blur: number;
  z: number;
}

export function computeRingBodyPose(
  bodyIndex: number,
  cur: number,
  W: number,
  H: number,
  isMobile: boolean,
  still: boolean,
  fs = 1.08,
  N = 12
): RingPose {
  const cx = 0.5 * W;
  const R = (isMobile ? 0.72 : 0.62) * W;
  const P = (isMobile ? 1.9 : 1.65) * W;
  const floor = H - 34;
  const horizon = 0.36 * H;
  const step = (2 * Math.PI) / N;

  let phi = ((bodyIndex - cur) * step) % (2 * Math.PI);
  if (phi <= -Math.PI) phi += 2 * Math.PI;
  if (phi > Math.PI) phi -= 2 * Math.PI;

  const zDepth = R * (1 - Math.cos(phi));
  const persp = P / (P + zDepth);
  const sl = Math.abs(phi) / step;
  const scale = persp * (1 + (fs - 1) * clamp(1 - sl, 0, 1));
  const x = cx + R * Math.sin(phi) * persp;
  const feet = horizon + (floor - horizon) * persp;
  const bottom = H - feet;
  const blur = sl <= 1 ? 1.8 * sl : Math.min(1.8 + (sl - 1) * 2, 6.5);
  let opacity = clamp((Math.cos(phi) + 0.55) / 0.3, 0, 1);
  if (still && sl < 0.02) {
    opacity = 0;
  }
  const z = Math.round(scale * 1000);

  return { x, bottom, scale, opacity, blur, z };
}

export function stepSpring(
  cur: number,
  vel: number,
  target: number,
  dt: number,
  K = 95
): { cur: number; vel: number; settled: boolean } {
  const C = 2 * Math.sqrt(K);
  const subSteps = 3;
  const h = dt / subSteps;
  let c = cur;
  let v = vel;
  for (let i = 0; i < subSteps; i++) {
    const acc = -K * (c - target) - C * v;
    v += acc * h;
    c += v * h;
  }
  const settled = Math.abs(c - target) <= 0.0005 && Math.abs(v) <= 0.0005;
  if (settled) {
    c = target;
    v = 0;
  }
  return { cur: c, vel: v, settled };
}

export function formatMoneyUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function sanitizeBagEntries(raw: unknown): BagEntry[] {
  if (!Array.isArray(raw)) return [];
  const valid: BagEntry[] = [];
  for (const item of raw) {
    if (
      item &&
      typeof item === 'object' &&
      Number.isSafeInteger((item as BagEntry).id) &&
      Number.isSafeInteger((item as BagEntry).quantity) &&
      (item as BagEntry).quantity >= 1 &&
      (item as BagEntry).quantity <= 20
    ) {
      valid.push({
        id: (item as BagEntry).id,
        quantity: (item as BagEntry).quantity,
      });
      if (valid.length >= 50) break;
    }
  }
  return valid;
}

export function validateCatalog(catalog = NATIVE_CATALOG): boolean {
  if (!catalog || !Array.isArray(catalog.items)) {
    throw new Error('The product list is unavailable.');
  }
  for (const item of catalog.items) {
    if (
      typeof item.id !== 'string' ||
      typeof item.name !== 'string' ||
      typeof item.price !== 'number' ||
      !Number.isFinite(item.price) ||
      item.price < 0 ||
      !Array.isArray(item.variants)
    ) {
      throw new Error('The product list is unavailable.');
    }
    for (const v of item.variants) {
      if (
        !Number.isSafeInteger(v.id) ||
        typeof v.a !== 'boolean' ||
        !Array.isArray(v.o) ||
        !v.o.every((opt) => typeof opt === 'string') ||
        (typeof (v as { price?: unknown }).price !== 'undefined' &&
          (typeof (v as { price?: unknown }).price !== 'number' ||
            !Number.isFinite((v as { price: number }).price) ||
            (v as { price: number }).price < 0))
      ) {
        throw new Error('The product list is unavailable.');
      }
    }
  }
  return true;
}

export function findVariantInCatalog(
  variantId: number,
  catalog = NATIVE_CATALOG
): { product: (typeof NATIVE_CATALOG.items)[0]; variant: { id: number; a: boolean; o: string[]; price?: number } } | null {
  for (const product of catalog.items) {
    for (const variant of product.variants) {
      if (variant.id === variantId) {
        return { product, variant };
      }
    }
  }
  return null;
}

export function addItemsToBagEntries(
  currentEntries: BagEntry[],
  newItems: { id: number; quantity?: number }[],
  catalog = NATIVE_CATALOG
): { entries: BagEntry[]; toastMessage: string } {
  validateCatalog(catalog);
  const next = currentEntries.map((e) => ({ ...e }));

  for (const req of newItems) {
    const qty = req.quantity ?? 1;
    const found = findVariantInCatalog(req.id, catalog);
    if (!found || !found.variant.a) {
      throw new Error('Please choose an available size.');
    }
    const existing = next.find((e) => e.id === req.id);
    if (existing) {
      existing.quantity = clamp(existing.quantity + qty, 1, 20);
    } else if (next.length < 50) {
      next.push({ id: req.id, quantity: clamp(qty, 1, 20) });
    }
  }

  const toastMessage =
    newItems.length > 1
      ? 'Look saved to your styling bag'
      : 'Piece saved to your styling bag';

  return { entries: next, toastMessage };
}

export function updateBagEntryQuantity(
  currentEntries: BagEntry[],
  variantId: number,
  delta: number
): BagEntry[] {
  const next: BagEntry[] = [];
  for (const entry of currentEntries) {
    if (entry.id === variantId) {
      const newQty = entry.quantity + delta;
      if (newQty >= 1) {
        next.push({ id: entry.id, quantity: clamp(newQty, 1, 20) });
      }
    } else {
      next.push({ ...entry });
    }
  }
  return next;
}

export function resolveBagEntries(
  entries: BagEntry[],
  catalog = NATIVE_CATALOG,
  currency: CurrencyCode = getCurrency()
): { items: ResolvedBagItem[]; totalQuantity: number; subtotal: number; subtotalFormatted: string; totalFormatted: string } {
  validateCatalog(catalog);
  const items: ResolvedBagItem[] = [];
  let totalQuantity = 0;
  let subtotal = 0;

  for (const entry of entries) {
    const found = findVariantInCatalog(entry.id, catalog);
    if (!found) continue;
    const size = found.variant.o[0] || '';
    const unitPrice = typeof found.variant.price === 'number' ? found.variant.price : found.product.price;
    const lineTotal = unitPrice * entry.quantity;
    totalQuantity += entry.quantity;
    subtotal += lineTotal;
    items.push({
      id: entry.id,
      quantity: entry.quantity,
      productId: found.product.id,
      name: found.product.name,
      size,
      price: unitPrice,
      lineTotal,
      priceFormatted: formatPrice(unitPrice, currency),
      lineTotalFormatted: formatPrice(lineTotal, currency),
      image: found.product.image,
      url: found.product.url,
      railGarmentK: (found.product as { railGarmentK?: number }).railGarmentK,
    });
  }

  return {
    items,
    totalQuantity,
    subtotal,
    subtotalFormatted: subtotal > 0 ? `Reference subtotal ${formatPrice(subtotal, currency)}` : '',
    totalFormatted: formatPrice(subtotal, currency),
  };
}

export function formatShortlistExport(resolvedItems: ResolvedBagItem[]): string {
  const parts: string[] = [
    'RUNWAY — STYLING SHORTLIST',
    'Reference prices; no order or payment has been placed.',
    '',
  ];
  for (const item of resolvedItems) {
    parts.push(`${item.name} · Size ${item.size} · Quantity ${item.quantity}\n${item.url}`);
  }
  return parts.join('\n\n');
}
