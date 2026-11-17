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
  compareAtPrice: string;
  bundlePrice: string;
  items: LookItemConfig[];
  pins: LookPin[];
}

export const PRODUCTS_MAP: Record<string, ProductCatalogItem> = {
  'tatum-5-orbit-copy': {
    id: 'tatum-5-orbit-copy',
    name: 'Air Jordan 12 Retro',
    vendor: 'Signature Footwear',
    type: 'From the lookbook',
    price: 149,
    priceFormatted: '$149.00',
    image: 'https://reel-ref-try-the-look.vercel.app/assets/source-tatum-5-orbit-copy.webp',
    naturalWidth: 400,
    naturalHeight: 400,
    sheetHeight: 160,
    optionLegend: 'Shoe size',
    sizes: ['40', '41', '42', '43', '44', '45', '46'],
    variants: [
      { id: 57015167025457, a: true, o: ['40'] },
      { id: 57015167058225, a: true, o: ['41'] },
      { id: 57015167090993, a: true, o: ['42'] },
      { id: 57015167123761, a: true, o: ['43'] },
      { id: 57015167156529, a: true, o: ['44'] },
      { id: 57015167189297, a: true, o: ['45'] },
      { id: 57015167222065, a: true, o: ['46'] },
    ],
    url: '#the-rail',
  },
  tshirt: {
    id: 'tshirt',
    name: 'Tshirt',
    vendor: 'Studio Jersey',
    type: 'From the lookbook',
    price: 199,
    priceFormatted: '$199.00',
    image: 'https://reel-ref-try-the-look.vercel.app/assets/source-tshirt.webp',
    naturalWidth: 400,
    naturalHeight: 563,
    sheetHeight: 225,
    optionLegend: 'Size',
    sizes: ['S', 'L', 'M', 'XL'],
    variants: [
      { id: 56835911582001, a: true, o: ['S'] },
      { id: 56835911614769, a: true, o: ['L'] },
      { id: 56835911647537, a: true, o: ['M'] },
      { id: 56835911680305, a: true, o: ['XL'] },
    ],
    url: '#the-rail',
  },
  sweatshirt: {
    id: 'sweatshirt',
    name: 'Sweatshirt',
    vendor: 'Studio Fleece',
    type: 'From the lookbook',
    price: 199,
    priceFormatted: '$199.00',
    image: 'https://reel-ref-try-the-look.vercel.app/assets/source-sweatshirt.webp',
    naturalWidth: 400,
    naturalHeight: 581,
    sheetHeight: 232,
    optionLegend: 'Size',
    sizes: ['S', 'L', 'M', 'XL'],
    variants: [
      { id: 56835806396721, a: true, o: ['S'] },
      { id: 56835806429489, a: true, o: ['L'] },
      { id: 56835806462257, a: true, o: ['M'] },
      { id: 56835806495025, a: true, o: ['XL'] },
    ],
    url: '#the-rail',
  },
  'tatum-5-orbit': {
    id: 'tatum-5-orbit',
    name: 'Tatum 5 Orbit',
    vendor: 'Signature Footwear',
    type: 'From the lookbook',
    price: 149,
    priceFormatted: '$149.00',
    image: 'https://reel-ref-try-the-look.vercel.app/assets/source-tatum-5-orbit.webp',
    naturalWidth: 400,
    naturalHeight: 400,
    sheetHeight: 160,
    optionLegend: 'Shoe size',
    sizes: ['40', '41', '42', '43', '44', '45', '46'],
    variants: [
      { id: 57015166730545, a: true, o: ['40'] },
      { id: 57015166763313, a: true, o: ['41'] },
      { id: 57015166796081, a: true, o: ['42'] },
      { id: 57015166828849, a: true, o: ['43'] },
      { id: 57015166861617, a: true, o: ['44'] },
      { id: 57015166894385, a: true, o: ['45'] },
      { id: 57015166927153, a: true, o: ['46'] },
    ],
    url: '#the-rail',
  },
  'hoodie-black': {
    id: 'hoodie-black',
    name: 'Hoodie Black',
    vendor: 'Studio Fleece',
    type: 'From the lookbook',
    price: 199,
    priceFormatted: '$199.00',
    image: 'https://reel-ref-try-the-look.vercel.app/assets/source-hoodie-black.webp',
    naturalWidth: 400,
    naturalHeight: 536,
    sheetHeight: 214,
    optionLegend: 'Size',
    sizes: ['S', 'L', 'M', 'XL'],
    variants: [
      { id: 56836251681073, a: true, o: ['S'] },
      { id: 56836251713841, a: true, o: ['L'] },
      { id: 56836251746609, a: true, o: ['M'] },
      { id: 56836251779377, a: true, o: ['XL'] },
    ],
    url: '#the-rail',
  },
  'sweatshirt-plus': {
    id: 'sweatshirt-plus',
    name: 'Sweatshirt Plus',
    vendor: 'Studio Fleece',
    type: 'From the lookbook',
    price: 199,
    priceFormatted: '$199.00',
    image: 'https://reel-ref-try-the-look.vercel.app/assets/source-sweatshirt-plus.webp',
    naturalWidth: 400,
    naturalHeight: 610,
    sheetHeight: 244,
    optionLegend: 'Size',
    sizes: ['S', 'L', 'M', 'XL'],
    variants: [
      { id: 56836143743281, a: true, o: ['S'] },
      { id: 56836143776049, a: true, o: ['L'] },
      { id: 56836143808817, a: true, o: ['M'] },
      { id: 56836143841585, a: true, o: ['XL'] },
    ],
    url: '#the-rail',
  },
  hoodie: {
    id: 'hoodie',
    name: 'Hoodie',
    vendor: 'Studio Fleece',
    type: 'From the lookbook',
    price: 199,
    priceFormatted: '$199.00',
    image: 'https://reel-ref-try-the-look.vercel.app/assets/source-hoodie.webp',
    naturalWidth: 400,
    naturalHeight: 555,
    sheetHeight: 222,
    optionLegend: 'Size',
    sizes: ['S', 'L', 'M', 'XL'],
    variants: [
      { id: 56836002185521, a: true, o: ['S'] },
      { id: 56836002218289, a: true, o: ['L'] },
      { id: 56836002251057, a: true, o: ['M'] },
      { id: 56836002283825, a: true, o: ['XL'] },
    ],
    url: '#the-rail',
  },
  'air-jordan-12-retro-copy': {
    id: 'air-jordan-12-retro-copy',
    name: 'Luka 5',
    vendor: 'Signature Footwear',
    type: 'From the lookbook',
    price: 149,
    priceFormatted: '$149.00',
    image: 'https://reel-ref-try-the-look.vercel.app/assets/source-air-jordan-12-retro-copy.webp',
    naturalWidth: 400,
    naturalHeight: 400,
    sheetHeight: 160,
    optionLegend: 'Shoe size',
    sizes: ['40', '41', '42', '43', '44', '45', '46'],
    variants: [
      { id: 57015176364337, a: true, o: ['40'] },
      { id: 57015176397105, a: true, o: ['41'] },
      { id: 57015176429873, a: true, o: ['42'] },
      { id: 57015176462641, a: true, o: ['43'] },
      { id: 57015176495409, a: true, o: ['44'] },
      { id: 57015176528177, a: true, o: ['45'] },
      { id: 57015176560945, a: true, o: ['46'] },
    ],
    url: '#the-rail',
  },
};

// Also register all 8 Rail garments into the unified catalog so both sections share one cart!
for (const rg of RAIL_GARMENTS) {
  PRODUCTS_MAP[rg.id] = {
    id: rg.id,
    name: rg.name,
    vendor: rg.category,
    type: 'The Rail Collection',
    price: rg.price,
    priceFormatted: rg.priceFormatted,
    image: '/assets/aistudio/kshop_pop_icon.png',
    naturalWidth: 340,
    naturalHeight: 900,
    sheetHeight: 220,
    optionLegend: 'Size',
    sizes: rg.sizes,
    variants: rg.variants,
    url: '#the-rail',
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
    key: 'bndthK',
    name: 'The City Edit',
    description: 'A charcoal knit and easy denim.',
    model640: 'https://reel-ref-try-the-look.vercel.app/assets/model-1-640.webp',
    model1080: 'https://reel-ref-try-the-look.vercel.app/assets/original-look-1.webp',
    piecesLabel: '3 pieces',
    compareAtPrice: '$547.00',
    bundlePrice: '$492.30',
    items: [
      { cardNumber: 1, productId: 'tatum-5-orbit-copy' },
      { cardNumber: 2, productId: 'tshirt' },
      { cardNumber: 3, productId: 'sweatshirt' },
    ],
    pins: [
      { number: 1, productName: 'Air Jordan 12 Retro', left: '47%', top: '27%' },
      { number: 2, productName: 'Tshirt', left: '48%', top: '58%' },
      { number: 3, productName: 'Sweatshirt', left: '45%', top: '96%' },
    ],
  },
  {
    index: 1,
    numberFormatted: '02',
    key: 'XckgG6',
    name: 'Gallery Opening',
    description: 'A clean white tee and relaxed denim.',
    model640: 'https://reel-ref-try-the-look.vercel.app/assets/model-5-640.webp',
    model1080: 'https://reel-ref-try-the-look.vercel.app/assets/original-look-5.webp',
    piecesLabel: '3 pieces',
    compareAtPrice: '$547.00',
    bundlePrice: '$492.30',
    items: [
      { cardNumber: 1, productId: 'tatum-5-orbit' },
      { cardNumber: 2, productId: 'hoodie-black', tag: 'New' },
      { cardNumber: 3, productId: 'tshirt' },
    ],
    pins: [
      { number: 1, productName: 'Tatum 5 Orbit', left: '50%', top: '28%' },
      { number: 2, productName: 'Hoodie Black', left: '48%', top: '58%' },
      { number: 3, productName: 'Tshirt', left: '45%', top: '88%' },
    ],
  },
  {
    index: 2,
    numberFormatted: '03',
    key: 'rLfAhC',
    name: 'Gallery Opening',
    description: 'Olive knitwear. A grounded palette.',
    model640: 'https://reel-ref-try-the-look.vercel.app/assets/model-4-640.webp',
    model1080: 'https://reel-ref-try-the-look.vercel.app/assets/original-look-4.webp',
    piecesLabel: '3 pieces',
    compareAtPrice: '$547.00',
    bundlePrice: '$492.30',
    items: [
      { cardNumber: 1, productId: 'sweatshirt-plus' },
      { cardNumber: 2, productId: 'tatum-5-orbit', tag: 'New' },
      { cardNumber: 3, productId: 'tshirt' },
    ],
    pins: [
      { number: 1, productName: 'Sweatshirt Plus', left: '50%', top: '28%' },
      { number: 2, productName: 'Tatum 5 Orbit', left: '48%', top: '58%' },
      { number: 3, productName: 'Tshirt', left: '45%', top: '88%' },
    ],
  },
  {
    index: 3,
    numberFormatted: '04',
    key: 'FKg67q',
    name: 'Studio Day',
    description: 'Black, white and laid-back denim.',
    model640: 'https://reel-ref-try-the-look.vercel.app/assets/model-6-640.webp',
    model1080: 'https://reel-ref-try-the-look.vercel.app/assets/original-look-6.webp',
    piecesLabel: '3 pieces',
    compareAtPrice: '$547.00',
    bundlePrice: '$492.30',
    items: [
      { cardNumber: 1, productId: 'hoodie-black' },
      { cardNumber: 2, productId: 'tatum-5-orbit-copy' },
      { cardNumber: 3, productId: 'tshirt' },
    ],
    pins: [
      { number: 1, productName: 'Hoodie Black', left: '50%', top: '28%' },
      { number: 2, productName: 'Air Jordan 12 Retro', left: '48%', top: '58%' },
      { number: 3, productName: 'Tshirt', left: '45%', top: '88%' },
    ],
  },
  {
    index: 4,
    numberFormatted: '05',
    key: '8KREEE',
    name: 'Studio Day',
    description: 'Burgundy layers. A tailored perspective.',
    model640: 'https://reel-ref-try-the-look.vercel.app/assets/model-3-640.webp',
    model1080: 'https://reel-ref-try-the-look.vercel.app/assets/original-look-3.webp',
    piecesLabel: '3 pieces',
    compareAtPrice: '$547.00',
    bundlePrice: '$492.30',
    items: [
      { cardNumber: 1, productId: 'sweatshirt' },
      { cardNumber: 2, productId: 'tatum-5-orbit' },
      { cardNumber: 3, productId: 'tshirt' },
    ],
    pins: [
      { number: 1, productName: 'Sweatshirt', left: '50%', top: '28%' },
      { number: 2, productName: 'Tatum 5 Orbit', left: '48%', top: '58%' },
      { number: 3, productName: 'Tshirt', left: '45%', top: '88%' },
    ],
  },
  {
    index: 5,
    numberFormatted: '06',
    key: 'N3bfm9',
    name: 'Studio Day',
    description: 'A grey crew and your favourite denim.',
    model640: 'https://reel-ref-try-the-look.vercel.app/assets/model-2-640.webp',
    model1080: 'https://reel-ref-try-the-look.vercel.app/assets/original-look-2.webp',
    piecesLabel: '3 pieces',
    compareAtPrice: '$547.00',
    bundlePrice: '$492.30',
    items: [
      { cardNumber: 1, productId: 'hoodie' },
      { cardNumber: 2, productId: 'air-jordan-12-retro-copy' },
      { cardNumber: 3, productId: 'tshirt' },
    ],
    pins: [
      { number: 1, productName: 'Hoodie', left: '50%', top: '28%' },
      { number: 2, productName: 'Luka 5', left: '48%', top: '58%' },
      { number: 3, productName: 'Tshirt', left: '45%', top: '88%' },
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
