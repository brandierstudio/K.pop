import { RAIL_GARMENTS } from './railData';

export interface VariantItem {
  id: number;
  a: boolean;
  o: string[];
  price?: number;
}

export interface ProductCatalogItem {
  id: string;
  name: string;
  vendor: string;
  type: string;
  price: number;
  priceFormatted: string;
  image: string;
  naturalWidth: number;
  naturalHeight: number;
  sheetHeight: number;
  optionLegend: string;
  sizes: string[];
  variants: VariantItem[];
  url: string;
  details?: string;
  care?: string;
  railGarmentK?: number;
}

export interface LookPin {
  number: number;
  productName: string;
  left: string;
  top: string;
}

export interface LookItemConfig {
  cardNumber: number;
  productId: string;
  tag?: string;
}

export interface LookDefinition {
  index: number;
  numberFormatted: string;
  key: string;
  name: string;
  description: string;
  model640: string;
  model1080: string;
  piecesLabel: string;
  compareAtAmount: number;
  bundleAmount: number;
  compareAtPrice: string;
  bundlePrice: string;
  items: LookItemConfig[];
  pins: LookPin[];
}

export const PRODUCTS_MAP: Record<string, ProductCatalogItem> = {
  // ── Look 01: Al-Noor Eid White (3 pieces) ──────────────────────────────────
  'kurta-white-eid': {
    id: 'kurta-white-eid',
    name: 'Al-Noor White Embroidered Kurta Set',
    vendor: 'Kurta Shalwar',
    type: 'From the Modest Runway',
    price: 165,
    priceFormatted: '$165.00',
    image: '/assets/modest/products/kurta-1.png',
    naturalWidth: 560,
    naturalHeight: 700,
    sheetHeight: 200,
    optionLegend: 'Size',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    details: 'Long-staple ivory cotton with tonal chikankari placket, tailored mandarin collar, and matching straight shalwar.',
    care: 'Cold gentle wash · steam press inside out',
    variants: [
      { id: 6101001, a: true, o: ['S'] },
      { id: 6101002, a: true, o: ['M'] },
      { id: 6101003, a: true, o: ['L'] },
      { id: 6101004, a: true, o: ['XL'] },
      { id: 6101005, a: true, o: ['XXL'] },
    ],
    url: '#runway-home',
  },
  'topi-white-jali': {
    id: 'topi-white-jali',
    name: 'Ivory Chikankari Jali Topi',
    vendor: 'Artisan Topi',
    type: 'From the Modest Runway',
    price: 38,
    priceFormatted: '$38.00',
    image: '/assets/modest/products/topi-1.png',
    naturalWidth: 560,
    naturalHeight: 700,
    sheetHeight: 200,
    optionLegend: 'Cap size',
    sizes: ['55 cm', '57 cm', '59 cm', '61 cm'],
    details: 'Breathable geometric jali weave stitched in pure mercerized cotton with soft structured crown.',
    care: 'Spot clean or gentle hand rinse · dry flat',
    variants: [
      { id: 6201001, a: true, o: ['55 cm'] },
      { id: 6201002, a: true, o: ['57 cm'] },
      { id: 6201003, a: true, o: ['59 cm'] },
      { id: 6201004, a: true, o: ['61 cm'] },
    ],
    url: '#runway-home',
  },
  'ring-pearl-tasbeeh': {
    id: 'ring-pearl-tasbeeh',
    name: 'Pearl & Silver Digital Tasbeeh Ring',
    vendor: 'Digital Tasbeeh',
    type: 'From the Modest Runway',
    price: 45,
    priceFormatted: '$45.00',
    image: '/assets/modest/products/ring-1.png',
    naturalWidth: 560,
    naturalHeight: 700,
    sheetHeight: 200,
    optionLegend: 'Ring size',
    sizes: ['18 mm', '20 mm', '22 mm'],
    details: 'OLED dhikr counter with silent haptic click, 33/99 vibration alerts, and water-resistant satin-pearl shell.',
    care: 'Wipe with microfiber cloth · USB-C magnetic charge',
    variants: [
      { id: 6301001, a: true, o: ['18 mm'] },
      { id: 6301002, a: true, o: ['20 mm'] },
      { id: 6301003, a: true, o: ['22 mm'] },
    ],
    url: '#runway-home',
  },

  // ── Look 02: Qasr Midnight Minimal (2 pieces — bareheaded, NO topi) ────────
  'kurta-black-minimal': {
    id: 'kurta-black-minimal',
    name: 'Qasr Jet-Black Minimal Kurta Set',
    vendor: 'Kurta Shalwar',
    type: 'From the Modest Runway',
    price: 155,
    priceFormatted: '$155.00',
    image: '/assets/modest/products/kurta-2.png',
    naturalWidth: 560,
    naturalHeight: 700,
    sheetHeight: 200,
    optionLegend: 'Size',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    details: 'Matte combed wash-and-wear suiting with concealed placket, structured band collar, and crisp tapered trouser.',
    care: 'Gentle cold wash with darks · low steam',
    variants: [
      { id: 6102001, a: true, o: ['S'] },
      { id: 6102002, a: true, o: ['M'] },
      { id: 6102003, a: true, o: ['L'] },
      { id: 6102004, a: true, o: ['XL'] },
      { id: 6102005, a: true, o: ['XXL'] },
    ],
    url: '#runway-home',
  },
  'tasbeeh-onyx-beads': {
    id: 'tasbeeh-onyx-beads',
    name: 'Matte Black Onyx 33-Bead Tasbeeh',
    vendor: 'Prayer Beads',
    type: 'From the Modest Runway',
    price: 42,
    priceFormatted: '$42.00',
    image: '/assets/modest/products/tasbeeh-2.png',
    naturalWidth: 560,
    naturalHeight: 700,
    sheetHeight: 200,
    optionLegend: 'Bead count',
    sizes: ['33 Beads', '99 Beads'],
    details: 'Hand-strung 8 mm natural matte black onyx stones finished with brushed charcoal spacers and braided silk tassel.',
    care: 'Store in included velvet pouch · avoid harsh sprays',
    variants: [
      { id: 6402001, a: true, o: ['33 Beads'] },
      { id: 6402002, a: true, o: ['99 Beads'] },
    ],
    url: '#runway-home',
  },

  // ── Look 03: Zaytoun Olive Heritage (3 pieces) ─────────────────────────────
  'kurta-olive-heritage': {
    id: 'kurta-olive-heritage',
    name: 'Zaytoun Olive Linen Kurta Set',
    vendor: 'Kurta Shalwar',
    type: 'From the Modest Runway',
    price: 170,
    priceFormatted: '$170.00',
    image: '/assets/modest/products/kurta-3.png',
    naturalWidth: 560,
    naturalHeight: 700,
    sheetHeight: 200,
    optionLegend: 'Size',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    details: 'Breathable washed European linen-cotton blend in deep olive with contrast horn buttons and relaxed side slits.',
    care: 'Gentle wash cold · line dry in shade',
    variants: [
      { id: 6103001, a: true, o: ['S'] },
      { id: 6103002, a: true, o: ['M'] },
      { id: 6103003, a: true, o: ['L'] },
      { id: 6103004, a: true, o: ['XL'] },
      { id: 6103005, a: true, o: ['XXL'] },
    ],
    url: '#runway-home',
  },
  'topi-olive-knit': {
    id: 'topi-olive-knit',
    name: 'Charcoal-Olive Textured Knit Topi',
    vendor: 'Artisan Topi',
    type: 'From the Modest Runway',
    price: 34,
    priceFormatted: '$34.00',
    image: '/assets/modest/products/topi-3.png',
    naturalWidth: 560,
    naturalHeight: 700,
    sheetHeight: 200,
    optionLegend: 'Cap size',
    sizes: ['55 cm', '57 cm', '59 cm', '61 cm'],
    details: 'Fine ribbed organic cotton knit offering a tailored low-profile silhouette and all-day ventilation.',
    care: 'Hand wash cool · reshape and air dry',
    variants: [
      { id: 6203001, a: true, o: ['55 cm'] },
      { id: 6203002, a: true, o: ['57 cm'] },
      { id: 6203003, a: true, o: ['59 cm'] },
      { id: 6203004, a: true, o: ['61 cm'] },
    ],
    url: '#runway-home',
  },
  'ring-obsidian-tasbeeh': {
    id: 'ring-obsidian-tasbeeh',
    name: 'Matte Obsidian Digital Tasbeeh Ring',
    vendor: 'Digital Tasbeeh',
    type: 'From the Modest Runway',
    price: 48,
    priceFormatted: '$48.00',
    image: '/assets/modest/products/ring-3.png',
    naturalWidth: 560,
    naturalHeight: 700,
    sheetHeight: 200,
    optionLegend: 'Ring size',
    sizes: ['18 mm', '20 mm', '22 mm'],
    details: 'Anodized matte obsidian alloy with crisp OLED counter, prayer-time vibration cues, and 7-day battery life.',
    care: 'Splash-resistant for wudu · wipe dry with soft cloth',
    variants: [
      { id: 6303001, a: true, o: ['18 mm'] },
      { id: 6303002, a: true, o: ['20 mm'] },
      { id: 6303003, a: true, o: ['22 mm'] },
    ],
    url: '#runway-home',
  },

  // ── Look 04: Sahara Sand Atelier (3 pieces) ────────────────────────────────
  'kurta-sand-atelier': {
    id: 'kurta-sand-atelier',
    name: 'Sahara Sand Embroidered Kurta Set',
    vendor: 'Kurta Shalwar',
    type: 'From the Modest Runway',
    price: 160,
    priceFormatted: '$160.00',
    image: '/assets/modest/products/kurta-4.png',
    naturalWidth: 560,
    naturalHeight: 700,
    sheetHeight: 200,
    optionLegend: 'Size',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    details: 'Warm desert-sand Egyptian cotton accented with fine tonal embroidery along the placket and cuffs.',
    care: 'Cold wash separately · warm iron',
    variants: [
      { id: 6104001, a: true, o: ['S'] },
      { id: 6104002, a: true, o: ['M'] },
      { id: 6104003, a: true, o: ['L'] },
      { id: 6104004, a: true, o: ['XL'] },
      { id: 6104005, a: true, o: ['XXL'] },
    ],
    url: '#runway-home',
  },
  'topi-sand-kufi': {
    id: 'topi-sand-kufi',
    name: 'Warm Sand Structured Kufi Topi',
    vendor: 'Artisan Topi',
    type: 'From the Modest Runway',
    price: 36,
    priceFormatted: '$36.00',
    image: '/assets/modest/products/topi-4.png',
    naturalWidth: 560,
    naturalHeight: 700,
    sheetHeight: 200,
    optionLegend: 'Cap size',
    sizes: ['55 cm', '57 cm', '59 cm', '61 cm'],
    details: 'Structured sand-tone cotton twill kufi lined in soft breathable cambric with subtle tonal stitching.',
    care: 'Spot clean gently · store upright',
    variants: [
      { id: 6204001, a: true, o: ['55 cm'] },
      { id: 6204002, a: true, o: ['57 cm'] },
      { id: 6204003, a: true, o: ['59 cm'] },
      { id: 6204004, a: true, o: ['61 cm'] },
    ],
    url: '#runway-home',
  },
  'tasbeeh-sandalwood-beads': {
    id: 'tasbeeh-sandalwood-beads',
    name: 'Natural Sandalwood 99-Bead Tasbeeh',
    vendor: 'Prayer Beads',
    type: 'From the Modest Runway',
    price: 38,
    priceFormatted: '$38.00',
    image: '/assets/modest/products/tasbeeh-4.png',
    naturalWidth: 560,
    naturalHeight: 700,
    sheetHeight: 200,
    optionLegend: 'Bead count',
    sizes: ['99 Beads', '33 Beads'],
    details: 'Smooth aromatic sandalwood beads hand-knotted on durable waxed cord with carved imam bead and cotton tassel.',
    care: 'Keep away from water to preserve natural wood scent',
    variants: [
      { id: 6404001, a: true, o: ['99 Beads'] },
      { id: 6404002, a: true, o: ['33 Beads'] },
    ],
    url: '#runway-home',
  },

  // ── Look 05: Majlis Navy Formal (2 pieces — bareheaded, NO topi) ───────────
  'kurta-navy-formal': {
    id: 'kurta-navy-formal',
    name: 'Majlis Midnight Navy Formal Kurta Set',
    vendor: 'Kurta Shalwar',
    type: 'From the Modest Runway',
    price: 195,
    priceFormatted: '$195.00',
    image: '/assets/modest/products/kurta-5.png',
    naturalWidth: 560,
    naturalHeight: 700,
    sheetHeight: 200,
    optionLegend: 'Size',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    details: 'Fine midnight-navy wool-silk suiting tailored with crisp piping, structured shoulders, and formal trouser.',
    care: 'Dry clean recommended · vertical steam',
    variants: [
      { id: 6105001, a: true, o: ['S'] },
      { id: 6105002, a: true, o: ['M'] },
      { id: 6105003, a: true, o: ['L'] },
      { id: 6105004, a: true, o: ['XL'] },
      { id: 6105005, a: true, o: ['XXL'] },
    ],
    url: '#runway-home',
  },
  'ring-gunmetal-tasbeeh': {
    id: 'ring-gunmetal-tasbeeh',
    name: 'Gunmetal Silver Digital Tasbeeh Ring',
    vendor: 'Digital Tasbeeh',
    type: 'From the Modest Runway',
    price: 52,
    priceFormatted: '$52.00',
    image: '/assets/modest/products/ring-5.png',
    naturalWidth: 560,
    naturalHeight: 700,
    sheetHeight: 200,
    optionLegend: 'Ring size',
    sizes: ['18 mm', '20 mm', '22 mm'],
    details: 'Brushed titanium-tone stainless finish with tactile side clicker, crisp LED count readout, and wudu-safe seal.',
    care: 'Wipe with dry cloth · includes travel charging case',
    variants: [
      { id: 6305001, a: true, o: ['18 mm'] },
      { id: 6305002, a: true, o: ['20 mm'] },
      { id: 6305003, a: true, o: ['22 mm'] },
    ],
    url: '#runway-home',
  },

  // ── Look 06: Layl Cream Eid Couture (3 pieces) ─────────────────────────────
  'kurta-cream-eid': {
    id: 'kurta-cream-eid',
    name: 'Layl Cream & Gold Eid Kurta Set',
    vendor: 'Kurta Shalwar',
    type: 'From the Modest Runway',
    price: 210,
    priceFormatted: '$210.00',
    image: '/assets/modest/products/kurta-6.png',
    naturalWidth: 560,
    naturalHeight: 700,
    sheetHeight: 200,
    optionLegend: 'Size',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    details: 'Lustrous raw-silk blend in warm cream enriched with subtle champagne-gold resham embroidery on collar and placket.',
    care: 'Dry clean only · press with protective cloth',
    variants: [
      { id: 6106001, a: true, o: ['S'] },
      { id: 6106002, a: true, o: ['M'] },
      { id: 6106003, a: true, o: ['L'] },
      { id: 6106004, a: true, o: ['XL'] },
      { id: 6106005, a: true, o: ['XXL'] },
    ],
    url: '#runway-home',
  },
  'topi-cream-eid': {
    id: 'topi-cream-eid',
    name: 'Cream & Champagne-Gold Eid Topi',
    vendor: 'Artisan Topi',
    type: 'From the Modest Runway',
    price: 44,
    priceFormatted: '$44.00',
    image: '/assets/modest/products/topi-6.png',
    naturalWidth: 560,
    naturalHeight: 700,
    sheetHeight: 200,
    optionLegend: 'Cap size',
    sizes: ['55 cm', '57 cm', '59 cm', '61 cm'],
    details: 'Hand-embroidered champagne geometric motifs on structured ivory silk-cotton with soft breathable lining.',
    care: 'Dry clean or gentle spot clean only',
    variants: [
      { id: 6206001, a: true, o: ['55 cm'] },
      { id: 6206002, a: true, o: ['57 cm'] },
      { id: 6206003, a: true, o: ['59 cm'] },
      { id: 6206004, a: true, o: ['61 cm'] },
    ],
    url: '#runway-home',
  },
  'tasbeeh-amber-beads': {
    id: 'tasbeeh-amber-beads',
    name: 'Amber & Tiger-Eye Stone Tasbeeh',
    vendor: 'Prayer Beads',
    type: 'From the Modest Runway',
    price: 56,
    priceFormatted: '$56.00',
    image: '/assets/modest/products/tasbeeh-6.png',
    naturalWidth: 560,
    naturalHeight: 700,
    sheetHeight: 200,
    optionLegend: 'Bead count',
    sizes: ['33 Beads', '99 Beads'],
    details: 'Polished honey-amber and natural tiger-eye gemstones paired with antique-brass accents and hand-spun gold tassel.',
    care: 'Polish gently with dry flannel · store in pouch',
    variants: [
      { id: 6406001, a: true, o: ['33 Beads'] },
      { id: 6406002, a: true, o: ['99 Beads'] },
    ],
    url: '#runway-home',
  },
};

// Register all 8 modest Rail abayas into the unified catalog so all sections share one cart
for (const rg of RAIL_GARMENTS) {
  PRODUCTS_MAP[rg.id] = {
    id: rg.id,
    name: rg.name,
    vendor: rg.category,
    type: 'The Abaya Rail',
    price: rg.price,
    priceFormatted: rg.priceFormatted,
    image: rg.image,
    naturalWidth: 760,
    naturalHeight: 1040,
    sheetHeight: 220,
    optionLegend: 'Abaya length',
    sizes: rg.sizes,
    variants: rg.variants,
    url: '#the-rail',
    details: rg.description,
    care: rg.care,
    railGarmentK: rg.k,
  };
}

export interface PerfumeCatalogDef {
  id: string;
  sku: string;
  name: string;
  asset: 'red' | 'pink' | 'amber' | 'blue' | 'green';
  basePrice: number;
  variantBaseId: number;
}

export const PERFUME_CATALOG_DEFS: PerfumeCatalogDef[] = [
  { id: 'cerise', sku: 'DEMO-CERISE', name: 'Cerise Noire', asset: 'red', basePrice: 210, variantBaseId: 9101000 },
  { id: 'rose', sku: 'DEMO-ROSE', name: 'Rose Éclat', asset: 'pink', basePrice: 185, variantBaseId: 9102000 },
  { id: 'golden', sku: 'DEMO-AMBER', name: 'Golden Amber', asset: 'amber', basePrice: 240, variantBaseId: 9103000 },
  { id: 'silver', sku: 'DEMO-MIST', name: 'Silver Mist', asset: 'blue', basePrice: 165, variantBaseId: 9104000 },
  { id: 'vetiver', sku: 'DEMO-VETIVER', name: 'Vetiver Forest', asset: 'green', basePrice: 260, variantBaseId: 9105000 },
];

export const PERFUME_SIZE_MLS = [50, 100, 150] as const;

export function perfumePriceForSize(basePrice: number, ml: number): number {
  return basePrice + (ml === 50 ? -35 : ml === 150 ? 45 : 0);
}

for (const pd of PERFUME_CATALOG_DEFS) {
  PRODUCTS_MAP[pd.id] = {
    id: pd.id,
    name: pd.name,
    vendor: 'The Scent Gallery',
    type: 'The Perfume Showroom',
    price: pd.basePrice,
    priceFormatted: `$${pd.basePrice.toFixed(2)}`,
    image: '/assets/aistudio/kshop_pop_icon.png',
    naturalWidth: 420,
    naturalHeight: 800,
    sheetHeight: 220,
    optionLegend: 'Size',
    sizes: PERFUME_SIZE_MLS.map((ml) => `${ml} ml`),
    variants: PERFUME_SIZE_MLS.map((ml) => ({
      id: pd.variantBaseId + ml,
      a: true,
      o: [`${ml} ml`],
      price: perfumePriceForSize(pd.basePrice, ml),
    })),
    url: '#perfume-showroom-v5',
  };
}

export function findPerfumeVariantId(productId: string, sizeMl: number): number | null {
  const product = PRODUCTS_MAP[productId];
  if (!product) return null;
  const label = `${sizeMl} ml`;
  const variant = product.variants.find((v) => v.a && v.o[0] === label);
  return variant ? variant.id : null;
}

export const LOOKS: LookDefinition[] = [
  {
    index: 0,
    numberFormatted: '01',
    key: 'alNoor01',
    name: 'Al-Noor Eid White',
    description: 'Chikankari white kurta shalwar, ivory jali topi, and pearl digital tasbeeh ring.',
    model640: '/assets/modest/models/model-1.png',
    model1080: '/assets/modest/models/model-1.png',
    piecesLabel: '3 pieces',
    compareAtAmount: 248,
    bundleAmount: 223.2,
    compareAtPrice: '$248.00',
    bundlePrice: '$223.20',
    items: [
      { cardNumber: 1, productId: 'kurta-white-eid', tag: 'Eid Edit' },
      { cardNumber: 2, productId: 'topi-white-jali' },
      { cardNumber: 3, productId: 'ring-pearl-tasbeeh' },
    ],
    pins: [
      { number: 1, productName: 'Al-Noor White Embroidered Kurta Set', left: '50%', top: '32%' },
      { number: 2, productName: 'Ivory Chikankari Jali Topi', left: '50%', top: '8%' },
      { number: 3, productName: 'Pearl & Silver Digital Tasbeeh Ring', left: '55%', top: '43%' },
    ],
  },
  {
    index: 1,
    numberFormatted: '02',
    key: 'qasr02',
    name: 'Qasr Midnight Minimal',
    description: 'Architectural jet-black kurta set paired with matte black onyx prayer beads.',
    model640: '/assets/modest/models/model-2.png',
    model1080: '/assets/modest/models/model-2.png',
    piecesLabel: '2 pieces',
    compareAtAmount: 197,
    bundleAmount: 177.3,
    compareAtPrice: '$197.00',
    bundlePrice: '$177.30',
    items: [
      { cardNumber: 1, productId: 'kurta-black-minimal', tag: 'Minimal' },
      { cardNumber: 2, productId: 'tasbeeh-onyx-beads' },
    ],
    pins: [
      { number: 1, productName: 'Qasr Jet-Black Minimal Kurta Set', left: '49%', top: '34%' },
      { number: 2, productName: 'Matte Black Onyx 33-Bead Tasbeeh', left: '54%', top: '53%' },
    ],
  },
  {
    index: 2,
    numberFormatted: '03',
    key: 'zaytoun03',
    name: 'Zaytoun Olive Heritage',
    description: 'Breathable deep-olive linen kurta set, textured knit topi, and obsidian digital ring.',
    model640: '/assets/modest/models/model-3.png',
    model1080: '/assets/modest/models/model-3.png',
    piecesLabel: '3 pieces',
    compareAtAmount: 252,
    bundleAmount: 226.8,
    compareAtPrice: '$252.00',
    bundlePrice: '$226.80',
    items: [
      { cardNumber: 1, productId: 'kurta-olive-heritage' },
      { cardNumber: 2, productId: 'topi-olive-knit' },
      { cardNumber: 3, productId: 'ring-obsidian-tasbeeh' },
    ],
    pins: [
      { number: 1, productName: 'Zaytoun Olive Linen Kurta Set', left: '49%', top: '34%' },
      { number: 2, productName: 'Charcoal-Olive Textured Knit Topi', left: '50%', top: '8%' },
      { number: 3, productName: 'Matte Obsidian Digital Tasbeeh Ring', left: '56%', top: '44%' },
    ],
  },
  {
    index: 3,
    numberFormatted: '04',
    key: 'sahara04',
    name: 'Sahara Sand Atelier',
    description: 'Warm sand embroidered cotton kurta set, matching kufi topi, and sandalwood tasbeeh.',
    model640: '/assets/modest/models/model-4.png',
    model1080: '/assets/modest/models/model-4.png',
    piecesLabel: '3 pieces',
    compareAtAmount: 234,
    bundleAmount: 210.6,
    compareAtPrice: '$234.00',
    bundlePrice: '$210.60',
    items: [
      { cardNumber: 1, productId: 'kurta-sand-atelier' },
      { cardNumber: 2, productId: 'topi-sand-kufi' },
      { cardNumber: 3, productId: 'tasbeeh-sandalwood-beads' },
    ],
    pins: [
      { number: 1, productName: 'Sahara Sand Embroidered Kurta Set', left: '49%', top: '35%' },
      { number: 2, productName: 'Warm Sand Structured Kufi Topi', left: '50%', top: '8%' },
      { number: 3, productName: 'Natural Sandalwood 99-Bead Tasbeeh', left: '54%', top: '53%' },
    ],
  },
  {
    index: 4,
    numberFormatted: '05',
    key: 'majlis05',
    name: 'Majlis Navy Formal',
    description: 'Silk-piped midnight navy formal kurta shalwar with gunmetal digital tasbeeh ring.',
    model640: '/assets/modest/models/model-5.png',
    model1080: '/assets/modest/models/model-5.png',
    piecesLabel: '2 pieces',
    compareAtAmount: 247,
    bundleAmount: 222.3,
    compareAtPrice: '$247.00',
    bundlePrice: '$222.30',
    items: [
      { cardNumber: 1, productId: 'kurta-navy-formal', tag: 'Formal' },
      { cardNumber: 2, productId: 'ring-gunmetal-tasbeeh' },
    ],
    pins: [
      { number: 1, productName: 'Majlis Midnight Navy Formal Kurta Set', left: '49%', top: '34%' },
      { number: 2, productName: 'Gunmetal Silver Digital Tasbeeh Ring', left: '56%', top: '44%' },
    ],
  },
  {
    index: 5,
    numberFormatted: '06',
    key: 'layl06',
    name: 'Layl Cream Eid Couture',
    description: 'Champagne-embroidered cream Eid kurta set, matching Eid topi, and amber stone tasbeeh.',
    model640: '/assets/modest/models/model-6.png',
    model1080: '/assets/modest/models/model-6.png',
    piecesLabel: '3 pieces',
    compareAtAmount: 310,
    bundleAmount: 279,
    compareAtPrice: '$310.00',
    bundlePrice: '$279.00',
    items: [
      { cardNumber: 1, productId: 'kurta-cream-eid', tag: 'Atelier' },
      { cardNumber: 2, productId: 'topi-cream-eid' },
      { cardNumber: 3, productId: 'tasbeeh-amber-beads' },
    ],
    pins: [
      { number: 1, productName: 'Layl Cream & Gold Eid Kurta Set', left: '49%', top: '34%' },
      { number: 2, productName: 'Cream & Champagne-Gold Eid Topi', left: '50%', top: '8%' },
      { number: 3, productName: 'Amber & Tiger-Eye Stone Tasbeeh', left: '55%', top: '53%' },
    ],
  },
];

export const NATIVE_CATALOG = {
  source: '#runway-home',
  looks: LOOKS.map((l) => ({
    name: l.name,
    description: l.description,
    image: l.model1080,
    products: l.items.map((it) => it.productId),
  })),
  items: Object.values(PRODUCTS_MAP).map((p) => ({
    id: p.id,
    name: p.name,
    type: p.type,
    price: p.price,
    image: p.image,
    sizes: p.sizes,
    variants: p.variants,
    url: p.url,
    railGarmentK: p.railGarmentK,
  })),
};

export function setProductImage(productId: string, imageUrl: string): void {
  if (!imageUrl) return;
  if (PRODUCTS_MAP[productId]) {
    PRODUCTS_MAP[productId].image = imageUrl;
  }
  const nativeItem = NATIVE_CATALOG.items.find((item) => item.id === productId);
  if (nativeItem) {
    nativeItem.image = imageUrl;
  }
}
