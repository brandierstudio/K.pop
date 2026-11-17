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
  RAIL_SHEETS,
  RAIL_GARMENTS,
  RAIL_SEQUENCE,
  computeRailY,
  computeCropStyle,
} from '../data/railData';

test('catalog has 6 looks and 21 unique products (8 Runway + 8 Rail + 5 Perfume) with zero external store links', () => {
  assert.equal(LOOKS.length, 6);
  assert.equal(Object.keys(PRODUCTS_MAP).length, 21);
  assert.equal(LOOKS[0].name, 'The City Edit');
  assert.equal(LOOKS[1].name, 'Gallery Opening');
  assert.equal(LOOKS[5].name, 'Studio Day');
  assert.equal(PRODUCTS_MAP['tatum-5-orbit-copy'].price, 149);
  assert.equal(PRODUCTS_MAP['tshirt'].price, 199);
  assert.deepEqual(PRODUCTS_MAP['tshirt'].sizes, ['S', 'L', 'M', 'XL']);
  assert.equal(PRODUCTS_MAP['rail-noir-tailored-blazer'].price, 690);
  assert.equal(PRODUCTS_MAP['rail-oxblood-satin-gown'].price, 690);

  // Verify zero external Shopify links exist anywhere in the catalog
  for (const prod of Object.values(PRODUCTS_MAP)) {
    assert.ok(!prod.url.includes('myshopify.com'), `Found external URL on ${prod.id}`);
  }
  for (const item of NATIVE_CATALOG.items) {
    assert.ok(!item.url.includes('myshopify.com'), `Found external URL on ${item.name}`);
  }
});

test('The Rail data has 8 unique silhouettes, 20 hanging pieces, and exact quadratic curve & crop math', () => {
  assert.equal(RAIL_GARMENTS.length, 8);
  assert.equal(RAIL_SEQUENCE.length, 20);

  // Quadratic curve endpoints & midpoint
  const W = 1440;
  const railTop = 240;
  const sag = 55;
  const u = 1;
  assert.equal(computeRailY(0, W, railTop, sag, u), 240);
  assert.equal(computeRailY(W, W, railTop, sag, u), 240);
  assert.equal(computeRailY(W / 2, W, railTop, sag, u), 295);

  // Crop style calculation for k=0 (Noir Tailored Blazer) side view at scale 0.5
  const crop = computeCropStyle(RAIL_SHEETS.side, RAIL_GARMENTS[0].crops.side, 0.5);
  assert.equal(crop.width, '170.00px');
  assert.equal(crop.left, '-85.00px');
  assert.equal(crop.height, `${((619 + 6) * 0.5).toFixed(2)}px`);
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

  // At rest (still=true), front body drops to opacity 0 so hero takes over
  const frontStill = computeRingBodyPose(0, 0, W, H, false, true, 1.08, 12);
  assert.equal(frontStill.opacity, 0);

  // Slot +1
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

test('styling bag logic adds, increments, steps quantity, resolves, and formats shortlist export', () => {
  const sanitized = sanitizeBagEntries([{ id: 57015167025457, quantity: 1 }, { bad: true }]);
  assert.equal(sanitized.length, 1);

  const afterSingle = addItemsToBagEntries([], [{ id: 57015167025457, quantity: 1 }]);
  assert.equal(afterSingle.toastMessage, 'Piece saved to your styling bag');
  assert.equal(afterSingle.entries.length, 1);

  const afterLook = addItemsToBagEntries(afterSingle.entries, [
    { id: 57015167025457, quantity: 1 },
    { id: 9001002, quantity: 1 }, // Noir Tailored Blazer (M) from The Rail
  ]);
  assert.equal(afterLook.toastMessage, 'Look saved to your styling bag');
  assert.equal(afterLook.entries.length, 2);
  assert.equal(afterLook.entries[0].quantity, 2);

  const resolved = resolveBagEntries(afterLook.entries);
  assert.equal(resolved.totalQuantity, 3);
  assert.equal(resolved.subtotal, 149 * 2 + 690);
  assert.equal(resolved.subtotalFormatted, 'Reference subtotal $988.00');
  assert.equal(resolved.items[1].railGarmentK, 0);

  // Test quantity stepper decrement and removal at 0
  const steppedDown = updateBagEntryQuantity(afterLook.entries, 57015167025457, -1);
  assert.equal(steppedDown[0].quantity, 1);
  const removed = updateBagEntryQuantity(steppedDown, 57015167025457, -1);
  assert.equal(removed.length, 1);

  const txt = formatShortlistExport(resolved.items);
  assert.ok(txt.includes('RUNWAY — STYLING SHORTLIST'));
  assert.ok(txt.includes('Noir Tailored Blazer · Size M · Quantity 1'));
});

test('Perfume Showroom catalog supports all 5 bottles, 50/100/150 ml size pricing, and unified bag totals', () => {
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

