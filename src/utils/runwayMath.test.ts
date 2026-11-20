import test from 'node:test';
import assert from 'node:assert/strict';
import {
  wrapN,
  shortestLoopDelta,
  computeRingBodyPose,
  stepSpring,
  sanitizeBagEntries,
  addItemsToBagEntries,
  updateBagEntryQuantity,
  resolveBagEntries,
  formatShortlistExport,
} from './runwayMath';
import {
  LOOKS,
  PRODUCTS_MAP,
  NATIVE_CATALOG,
  PERFUME_CATALOG_DEFS,
  perfumePriceForSize,
  findPerfumeVariantId,
} from '../data/catalogData';
import {
  RAIL_CATEGORIES,
  RAIL_GARMENTS,
  RAIL_SEQUENCE,
  computeRailY,
  matchesRailCategory,
  shortestRailIndexDelta,
  wrapRailX,
} from '../data/railData';
import { formatPrice, PKR_EXCHANGE_RATE, setCurrency, getCurrency } from './currency';

test('Islamic menswear catalog has 6 strictly synced looks (3/2/3/3/2/3 pieces) and 29 total products (16 Runway + 8 Abayas + 5 Perfumes)', () => {
  assert.equal(LOOKS.length, 6);
  assert.equal(Object.keys(PRODUCTS_MAP).length, 29);

  // Exact worn item counts per model (Looks 02 & 05 are bareheaded -> no topi)
  const expectedCounts = [3, 2, 3, 3, 2, 3];
  LOOKS.forEach((look, idx) => {
    assert.equal(
      look.items.length,
      expectedCounts[idx],
      `Look ${look.numberFormatted} (${look.name}) item count mismatch`
    );
    assert.equal(look.pins.length, look.items.length, `Look ${look.numberFormatted} pin count mismatch`);
    assert.equal(look.piecesLabel, `${expectedCounts[idx]} pieces`);

    // Verify 1:1 pin-to-product synchronization & transparent PNG product cutouts
    look.items.forEach((itemCfg, i) => {
      const product = PRODUCTS_MAP[itemCfg.productId];
      assert.ok(product, `Missing product ${itemCfg.productId}`);
      assert.ok(product.image.endsWith('.png'), `Runway product ${product.id} must use transparent PNG cutout`);
      assert.ok(Boolean(product.details), `Runway product ${product.id} should include expandable details`);
      const pin = look.pins[i];
      assert.equal(pin.number, itemCfg.cardNumber);
      assert.equal(pin.productName, product.name);
    });

    // Verify bundle price is exact 10% off compareAt sum of worn items
    const sum = look.items.reduce((acc, it) => acc + PRODUCTS_MAP[it.productId].price, 0);
    assert.equal(look.compareAtAmount, sum);
    assert.equal(look.bundleAmount, Number((sum * 0.9).toFixed(2)));
    assert.equal(look.compareAtPrice, `$${sum.toFixed(2)}`);
    assert.equal(look.bundlePrice, `$${(sum * 0.9).toFixed(2)}`);
  });

  // Verify bareheaded models (Look 02 & Look 05) do NOT include any topi product
  for (const bareIdx of [1, 4]) {
    const ids = LOOKS[bareIdx].items.map((it) => it.productId);
    assert.ok(
      ids.every((id) => !id.startsWith('topi-')),
      `Bareheaded Look ${bareIdx + 1} must not contain a topi`
    );
  }

  // Verify zero external Shopify links exist anywhere in the catalog
  for (const prod of Object.values(PRODUCTS_MAP)) {
    assert.ok(!prod.url.includes('myshopify.com'), `Found external URL on ${prod.id}`);
  }
  for (const item of NATIVE_CATALOG.items) {
    assert.ok(!item.url.includes('myshopify.com'), `Found external URL on ${item.name}`);
  }
});

test('The Rail modest abaya collection has 8 unique abayas, 20 hanging positions, multi-tag filters, and exact quadratic curve math', () => {
  assert.equal(RAIL_GARMENTS.length, 8);
  assert.equal(RAIL_SEQUENCE.length, 20);
  assert.ok(RAIL_CATEGORIES.includes('Prayer Wear'));
  assert.ok(RAIL_CATEGORIES.includes('Open Abaya'));
  assert.ok(RAIL_CATEGORIES.includes('Closed Abaya'));

  // Every abaya has local transparent PNG silhouette, transparent PNG Check Fabric cutout, care note, and 52-60 length sizes
  for (const g of RAIL_GARMENTS) {
    assert.ok(g.image.startsWith('/assets/modest/abayas/abaya-') && g.image.endsWith('.png'));
    assert.ok(g.detailImage.endsWith('-detail.png'));
    assert.ok(g.care.length > 0);
    assert.deepEqual(g.sizes, ['52', '54', '56', '58', '60']);
  }

  // Multi-tag category matching
  assert.equal(
    RAIL_GARMENTS.filter((g) => matchesRailCategory(g, 'All')).length,
    8
  );
  assert.ok(
    RAIL_GARMENTS.filter((g) => matchesRailCategory(g, 'Open Abaya')).length >= 3
  );
  assert.ok(
    RAIL_GARMENTS.filter((g) => matchesRailCategory(g, 'Prayer Wear')).length >= 1
  );
  assert.ok(
    RAIL_GARMENTS.filter((g) => matchesRailCategory(g, 'Soft Tones')).length >= 2
  );

  // Quadratic curve endpoints & midpoint
  const W = 1440;
  const railTop = 280;
  const sag = 68;
  const u = 1;
  assert.equal(computeRailY(0, W, railTop, sag, u), 280);
  assert.equal(computeRailY(W, W, railTop, sag, u), 280);
  assert.equal(computeRailY(W / 2, W, railTop, sag, u), 348);
});

test('wrapN and shortestLoopDelta wrap circular carousel indices properly', () => {
  assert.equal(wrapN(-1, 6), 5);
  assert.equal(wrapN(6, 6), 0);
  assert.equal(shortestLoopDelta(0, 5, 6), -1);
  assert.equal(shortestLoopDelta(5, 0, 6), 1);
  assert.equal(shortestLoopDelta(1, 4, 6), 3);
});

test('computeRingBodyPose matches exact slot 0 and slot 1 geometry on desktop', () => {
  const W = 1000;
  const H = 800;
  const frontMoving = computeRingBodyPose(0, 0, W, H, false, false, 1.08, 12);
  assert.ok(Math.abs(frontMoving.scale - 1.08) < 0.001);
  assert.ok(Math.abs(frontMoving.x - 500) < 0.001);
  assert.equal(frontMoving.blur, 0);
  assert.equal(frontMoving.opacity, 1);
  assert.equal(frontMoving.z, 1080);

  const frontStill = computeRingBodyPose(0, 0, W, H, false, true, 1.08, 12);
  assert.equal(frontStill.opacity, 0);

  const slot1 = computeRingBodyPose(1, 0, W, H, false, true, 1.08, 12);
  assert.ok(Math.abs(slot1.scale - 0.952) < 0.01);
  assert.ok(Math.abs(slot1.blur - 1.8) < 0.01);
  assert.equal(slot1.opacity, 1);
});

test('stepSpring converges critically damped spring towards target', () => {
  let cur = -1.15;
  let vel = 0;
  for (let i = 0; i < 120; i++) {
    const res = stepSpring(cur, vel, 0, 1 / 60, 95);
    cur = res.cur;
    vel = res.vel;
  }
  assert.equal(cur, 0);
  assert.equal(vel, 0);
});

test('unified styling bag handles Menswear Runway + Abaya Rail + quantity steps + shortlist export', () => {
  const sanitized = sanitizeBagEntries([{ id: 6101002, quantity: 1 }, { bad: true }]);
  assert.equal(sanitized.length, 1);

  const afterSingle = addItemsToBagEntries([], [{ id: 6101002, quantity: 1 }]);
  assert.equal(afterSingle.toastMessage, 'Piece saved to your styling bag');
  assert.equal(afterSingle.entries.length, 1);

  const afterLook = addItemsToBagEntries(afterSingle.entries, [
    { id: 6101002, quantity: 1 }, // Al-Noor White Embroidered Kurta Set (M) $165
    { id: 9001002, quantity: 1 }, // Noir Classic Nida Abaya (54) $145
  ]);
  assert.equal(afterLook.toastMessage, 'Look saved to your styling bag');
  assert.equal(afterLook.entries.length, 2);
  assert.equal(afterLook.entries[0].quantity, 2);

  const resolved = resolveBagEntries(afterLook.entries);
  assert.equal(resolved.totalQuantity, 3);
  assert.equal(resolved.subtotal, 165 * 2 + 145);
  assert.equal(resolved.subtotalFormatted, 'Reference subtotal $475.00');
  assert.equal(resolved.items[1].railGarmentK, 0);

  const steppedDown = updateBagEntryQuantity(afterLook.entries, 6101002, -1);
  assert.equal(steppedDown[0].quantity, 1);
  const removed = updateBagEntryQuantity(steppedDown, 6101002, -1);
  assert.equal(removed.length, 1);

  const txt = formatShortlistExport(resolved.items);
  assert.ok(txt.includes('RUNWAY — STYLING SHORTLIST'));
  assert.ok(txt.includes('Noir Classic Nida Abaya · Size 54 · Quantity 1'));
});

test('Perfume Showroom catalog remains 100% preserved across all 5 bottles and 50/100/150 ml pricing', () => {
  assert.equal(PERFUME_CATALOG_DEFS.length, 5);
  assert.equal(perfumePriceForSize(210, 50), 175);
  assert.equal(perfumePriceForSize(210, 100), 210);
  assert.equal(perfumePriceForSize(210, 150), 255);

  const cerise50 = findPerfumeVariantId('cerise', 50);
  const vetiver150 = findPerfumeVariantId('vetiver', 150);
  assert.ok(cerise50 !== null && vetiver150 !== null);
  assert.equal(findPerfumeVariantId('cerise', 999), null);

  const afterPerfumes = addItemsToBagEntries([], [
    { id: cerise50!, quantity: 1 },
    { id: vetiver150!, quantity: 2 },
  ]);
  const resolved = resolveBagEntries(afterPerfumes.entries);
  assert.equal(resolved.totalQuantity, 3);
  assert.equal(resolved.items[0].size, '50 ml');
  assert.equal(resolved.items[0].price, 175);
  assert.equal(resolved.items[1].size, '150 ml');
  assert.equal(resolved.items[1].price, 305);
  assert.equal(resolved.subtotal, 175 + 305 * 2);
  assert.equal(resolved.totalFormatted, '$785.00');
});

test('infinite continuous rail math wraps smoothly across loop boundaries in both directions', () => {
  const W = 1440;
  const loopW = 2520; // 20 slots * 126px
  // Center remains unchanged
  assert.equal(wrapRailX(720, loopW, W), 720);
  // Scrolling far right wraps cleanly back into [center - loopW/2, center + loopW/2)
  const wrappedNeg = wrapRailX(720 - loopW - 100, loopW, W);
  assert.equal(wrappedNeg, 620);
  const wrappedPos = wrapRailX(720 + loopW + 100, loopW, W);
  assert.equal(wrappedPos, 820);

  // Circular neighbor index delta across piece 0 and piece 19
  assert.equal(shortestRailIndexDelta(0, 19, 20), -1);
  assert.equal(shortestRailIndexDelta(19, 0, 20), 1);
  assert.equal(shortestRailIndexDelta(0, 1, 20), 1);
  assert.equal(shortestRailIndexDelta(0, 18, 20), -2);
});

test('USD and PKR currency formatting converts consistently across Runway, Rail, Perfume, and Cart Drawer', () => {
  assert.equal(getCurrency(), 'USD');
  assert.equal(formatPrice(145, 'USD'), '$145.00');
  assert.equal(formatPrice(145, 'USD', true), '$145');
  assert.equal(formatPrice(145, 'PKR'), `PKR ${(145 * PKR_EXCHANGE_RATE).toLocaleString('en-US')}`);
  assert.equal(formatPrice(145, 'PKR', true), `Rs ${(145 * PKR_EXCHANGE_RATE).toLocaleString('en-US')}`);

  setCurrency('PKR');
  assert.equal(getCurrency(), 'PKR');
  const resolvedPKR = resolveBagEntries([{ id: 6101002, quantity: 1 }], NATIVE_CATALOG, 'PKR');
  assert.equal(resolvedPKR.totalFormatted, `PKR ${(165 * PKR_EXCHANGE_RATE).toLocaleString('en-US')}`);
  setCurrency('USD');
  assert.equal(getCurrency(), 'USD');
});

test('Runway staged loading prioritizes active model, preloads next two, and lazy-loads remaining with in-memory caching', async () => {
  const { getRunwayLoadPlan, selectOptimalModelUrl, RunwayAssetCache } = await import('./runwayAssets');

  // Initial load at Look 0: Model 1 priority -> Models 2 & 3 preload -> remaining lazy (left flank 5 first)
  const plan0 = getRunwayLoadPlan(0, 6);
  assert.equal(plan0.priority, 0);
  assert.deepEqual(plan0.preload, [1, 2]);
  assert.deepEqual(plan0.lazy, [5, 3, 4]);

  // Sliding window at Look 4 wraps circularly: 4 priority -> [5, 0] preload -> [3, 1, 2] lazy
  const plan4 = getRunwayLoadPlan(4, 6);
  assert.equal(plan4.priority, 4);
  assert.deepEqual(plan4.preload, [5, 0]);
  assert.deepEqual(plan4.lazy, [3, 1, 2]);

  // Optimal responsive WebP selection matches srcset breakpoints
  assert.equal(
    selectOptimalModelUrl('/m-640.webp', '/m-1080.webp', 390, 1),
    '/m-640.webp'
  );
  assert.equal(
    selectOptimalModelUrl('/m-640.webp', '/m-1080.webp', 1440, 2),
    '/m-1080.webp'
  );

  // Every look uses responsive WebP variants & exact precomputed footOffset
  for (const look of LOOKS) {
    assert.ok(look.model640.endsWith('-640.webp'), `${look.name} should use 640w WebP`);
    assert.ok(look.model1080.endsWith('.webp'), `${look.name} should use 1080w WebP`);
    assert.ok(look.footOffset > 0 && look.footOffset < 0.1, `${look.name} should have precomputed footOffset`);
  }

  // In-memory cache marks URLs & looks ready and deduplicates preloads
  const cache = new RunwayAssetCache();
  assert.equal(cache.isLookReady(0), false);
  await cache.preloadUrl(LOOKS[0].model640, 'high', 0);
  assert.equal(cache.isUrlCached(LOOKS[0].model640), true);
  assert.equal(cache.isLookReady(0), true);
  assert.equal(cache.getCachedUrlCount(), 1);
});

