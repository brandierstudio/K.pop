/**
 * LEGACY BACKUP — Original K.Shop Pop Section 1 ("Try the Look." Western Streetwear Runway)
 * Preserved verbatim prior to the Islamic Modest Fashion redesign so the previous catalog
 * and looks can be restored at any time upon request.
 */

export interface LegacyProductVariant {
  id: number;
  a: boolean;
  o: string[];
  price?: number;
}

export interface LegacyProductDef {
  id: string;
  name: string;
  vendor: string;
  price: number;
  priceFormatted: string;
  image: string;
  url: string;
  optionLegend: string;
  sizes: string[];
  naturalWidth: number;
  naturalHeight: number;
  sheetHeight: number;
  variants: LegacyProductVariant[];
}

export interface LegacyLookPin {
  number: number;
  productId: string;
  productName: string;
  left: string;
  top: string;
}

export interface LegacyLookItemConfig {
  cardNumber: number;
  productId: string;
  tag?: string;
}

export interface LegacyLookDef {
  index: number;
  key: string;
  numberFormatted: string;
  name: string;
  piecesLabel: string;
  model640: string;
  model1080: string;
  compareAtPrice: string;
  bundlePrice: string;
  pins: LegacyLookPin[];
  items: LegacyLookItemConfig[];
}

const LEGACY_ASSETS_BASE = 'https://reel-ref-try-the-look.vercel.app/assets';

export const LEGACY_PRODUCTS_MAP: Record<string, LegacyProductDef> = {
  'tatum-5-orbit-copy': {
    id: 'tatum-5-orbit-copy',
    name: 'Tatum 5 "Orbit" (Copy)',
    vendor: 'Runway Studio',
    price: 149,
    priceFormatted: '$149.00',
    image: `${LEGACY_ASSETS_BASE}/tatum-5-orbit-copy.jpg`,
    url: '#the-rail',
    optionLegend: 'Shoe Size',
    sizes: ['40', '41', '42', '43', '44'],
    naturalWidth: 1600,
    naturalHeight: 1600,
    sheetHeight: 160,
    variants: [
      { id: 57015167025457, a: true, o: ['40'] },
      { id: 57015167058225, a: true, o: ['41'] },
      { id: 57015167090993, a: true, o: ['42'] },
      { id: 57015167123761, a: true, o: ['43'] },
      { id: 57015167156529, a: true, o: ['44'] },
    ],
  },
  'tatum-5-orbit': {
    id: 'tatum-5-orbit',
    name: 'Tatum 5 "Orbit"',
    vendor: 'Runway Studio',
    price: 149,
    priceFormatted: '$149.00',
    image: `${LEGACY_ASSETS_BASE}/tatum-5-orbit.jpg`,
    url: '#the-rail',
    optionLegend: 'Shoe Size',
    sizes: ['40', '41', '42', '43', '44'],
    naturalWidth: 1600,
    naturalHeight: 1600,
    sheetHeight: 160,
    variants: [
      { id: 57015112008001, a: true, o: ['40'] },
      { id: 57015112040769, a: true, o: ['41'] },
      { id: 57015112073537, a: true, o: ['42'] },
      { id: 57015112106305, a: true, o: ['43'] },
      { id: 57015112139073, a: true, o: ['44'] },
    ],
  },
  'wide-jeans': {
    id: 'wide-jeans',
    name: 'Wide Jeans',
    vendor: 'Runway Studio',
    price: 129,
    priceFormatted: '$129.00',
    image: `${LEGACY_ASSETS_BASE}/wide-jeans.jpg`,
    url: '#the-rail',
    optionLegend: 'Size',
    sizes: ['S', 'M', 'L', 'XL'],
    naturalWidth: 1600,
    naturalHeight: 1999,
    sheetHeight: 200,
    variants: [
      { id: 56986295894321, a: true, o: ['S'] },
      { id: 56986295927089, a: true, o: ['M'] },
      { id: 56986295959857, a: true, o: ['L'] },
      { id: 56986295992625, a: true, o: ['XL'] },
    ],
  },
  'tshirt': {
    id: 'tshirt',
    name: 'Tshirt',
    vendor: 'Runway Studio',
    price: 199,
    priceFormatted: '$199.00',
    image: `${LEGACY_ASSETS_BASE}/tshirt.jpg`,
    url: '#the-rail',
    optionLegend: 'Size',
    sizes: ['S', 'L', 'M', 'XL'],
    naturalWidth: 1600,
    naturalHeight: 1999,
    sheetHeight: 200,
    variants: [
      { id: 56986320372017, a: true, o: ['S'] },
      { id: 56986320404785, a: true, o: ['L'] },
      { id: 56986320437553, a: true, o: ['M'] },
      { id: 56986320470321, a: true, o: ['XL'] },
    ],
  },
  'tatum-5-orbit-copy-1': {
    id: 'tatum-5-orbit-copy-1',
    name: 'Tatum 5 "Orbit" (Copy)',
    vendor: 'Runway Studio',
    price: 149,
    priceFormatted: '$149.00',
    image: `${LEGACY_ASSETS_BASE}/tatum-5-orbit-copy-1.jpg`,
    url: '#the-rail',
    optionLegend: 'Shoe Size',
    sizes: ['40', '41', '42', '43', '44'],
    naturalWidth: 1600,
    naturalHeight: 1600,
    sheetHeight: 160,
    variants: [
      { id: 57015179968817, a: true, o: ['40'] },
      { id: 57015180001585, a: true, o: ['41'] },
      { id: 57015180034353, a: true, o: ['42'] },
      { id: 57015180067121, a: true, o: ['43'] },
      { id: 57015180099889, a: true, o: ['44'] },
    ],
  },
  'wide-jeans-copy-1': {
    id: 'wide-jeans-copy-1',
    name: 'Wide Jeans (Copy)',
    vendor: 'Runway Studio',
    price: 129,
    priceFormatted: '$129.00',
    image: `${LEGACY_ASSETS_BASE}/wide-jeans-copy-1.jpg`,
    url: '#the-rail',
    optionLegend: 'Size',
    sizes: ['S', 'M', 'L', 'XL'],
    naturalWidth: 1600,
    naturalHeight: 1999,
    sheetHeight: 200,
    variants: [
      { id: 57015159488817, a: true, o: ['S'] },
      { id: 57015159521585, a: true, o: ['M'] },
      { id: 57015159554353, a: true, o: ['L'] },
      { id: 57015159587121, a: true, o: ['XL'] },
    ],
  },
  'tshirt-copy': {
    id: 'tshirt-copy',
    name: 'Tshirt (Copy)',
    vendor: 'Runway Studio',
    price: 199,
    priceFormatted: '$199.00',
    image: `${LEGACY_ASSETS_BASE}/tshirt-copy.jpg`,
    url: '#the-rail',
    optionLegend: 'Size',
    sizes: ['S', 'L', 'M', 'XL'],
    naturalWidth: 1600,
    naturalHeight: 1999,
    sheetHeight: 200,
    variants: [
      { id: 57015175414065, a: true, o: ['S'] },
      { id: 57015175446833, a: true, o: ['L'] },
      { id: 57015175479601, a: true, o: ['M'] },
      { id: 57015175512369, a: true, o: ['XL'] },
    ],
  },
  'wide-jeans-copy': {
    id: 'wide-jeans-copy',
    name: 'Wide Jeans (Copy)',
    vendor: 'Runway Studio',
    price: 129,
    priceFormatted: '$129.00',
    image: `${LEGACY_ASSETS_BASE}/wide-jeans-copy.jpg`,
    url: '#the-rail',
    optionLegend: 'Size',
    sizes: ['S', 'M', 'L', 'XL'],
    naturalWidth: 1600,
    naturalHeight: 1999,
    sheetHeight: 200,
    variants: [
      { id: 57015158473009, a: true, o: ['S'] },
      { id: 57015158505777, a: true, o: ['M'] },
      { id: 57015158538545, a: true, o: ['L'] },
      { id: 57015158571313, a: true, o: ['XL'] },
    ],
  },
};

export const LEGACY_LOOKS: LegacyLookDef[] = [
  {
    index: 0,
    key: '1_1',
    numberFormatted: '01',
    name: 'The City Edit',
    piecesLabel: '3 pieces',
    model640: `${LEGACY_ASSETS_BASE}/model-1-640.webp`,
    model1080: `${LEGACY_ASSETS_BASE}/model-1-1080.webp`,
    compareAtPrice: '$477.00',
    bundlePrice: '$429.30',
    pins: [
      { number: 1, productId: 'tatum-5-orbit-copy', productName: 'Tatum 5 "Orbit" (Copy)', left: '54%', top: '87%' },
      { number: 2, productId: 'wide-jeans', productName: 'Wide Jeans', left: '47%', top: '60%' },
      { number: 3, productId: 'tshirt', productName: 'Tshirt', left: '49%', top: '26%' },
    ],
    items: [
      { cardNumber: 1, productId: 'tatum-5-orbit-copy', tag: 'New' },
      { cardNumber: 2, productId: 'wide-jeans' },
      { cardNumber: 3, productId: 'tshirt' },
    ],
  },
  {
    index: 1,
    key: '2_2',
    numberFormatted: '02',
    name: 'Gallery Opening',
    piecesLabel: '3 pieces',
    model640: `${LEGACY_ASSETS_BASE}/model-2-640.webp`,
    model1080: `${LEGACY_ASSETS_BASE}/model-2-1080.webp`,
    compareAtPrice: '$477.00',
    bundlePrice: '$429.30',
    pins: [
      { number: 1, productId: 'tatum-5-orbit-copy-1', productName: 'Tatum 5 "Orbit" (Copy)', left: '50%', top: '34%' },
      { number: 2, productId: 'wide-jeans-copy-1', productName: 'Wide Jeans (Copy)', left: '51%', top: '61%' },
      { number: 3, productId: 'tshirt-copy', productName: 'Tshirt (Copy)', left: '52%', top: '88%' },
    ],
    items: [
      { cardNumber: 1, productId: 'tatum-5-orbit-copy-1', tag: 'New' },
      { cardNumber: 2, productId: 'wide-jeans-copy-1' },
      { cardNumber: 3, productId: 'tshirt-copy' },
    ],
  },
  {
    index: 2,
    key: '3_3',
    numberFormatted: '03',
    name: 'Sunday Morning',
    piecesLabel: '3 pieces',
    model640: `${LEGACY_ASSETS_BASE}/model-3-640.webp`,
    model1080: `${LEGACY_ASSETS_BASE}/model-3-1080.webp`,
    compareAtPrice: '$477.00',
    bundlePrice: '$429.30',
    pins: [
      { number: 1, productId: 'tatum-5-orbit-copy', productName: 'Tatum 5 "Orbit" (Copy)', left: '49%', top: '33%' },
      { number: 2, productId: 'wide-jeans-copy', productName: 'Wide Jeans (Copy)', left: '51%', top: '61%' },
      { number: 3, productId: 'tshirt', productName: 'Tshirt', left: '52%', top: '88%' },
    ],
    items: [
      { cardNumber: 1, productId: 'tatum-5-orbit-copy', tag: 'New' },
      { cardNumber: 2, productId: 'wide-jeans-copy' },
      { cardNumber: 3, productId: 'tshirt' },
    ],
  },
  {
    index: 3,
    key: '4_4',
    numberFormatted: '04',
    name: 'Late Dinner',
    piecesLabel: '3 pieces',
    model640: `${LEGACY_ASSETS_BASE}/model-4-640.webp`,
    model1080: `${LEGACY_ASSETS_BASE}/model-4-1080.webp`,
    compareAtPrice: '$477.00',
    bundlePrice: '$429.30',
    pins: [
      { number: 1, productId: 'tatum-5-orbit', productName: 'Tatum 5 "Orbit"', left: '50%', top: '34%' },
      { number: 2, productId: 'wide-jeans-copy-1', productName: 'Wide Jeans (Copy)', left: '51%', top: '61%' },
      { number: 3, productId: 'tshirt', productName: 'Tshirt', left: '52%', top: '88%' },
    ],
    items: [
      { cardNumber: 1, productId: 'tatum-5-orbit', tag: 'New' },
      { cardNumber: 2, productId: 'wide-jeans-copy-1' },
      { cardNumber: 3, productId: 'tshirt' },
    ],
  },
  {
    index: 4,
    key: '5_5',
    numberFormatted: '05',
    name: 'Long Weekend',
    piecesLabel: '3 pieces',
    model640: `${LEGACY_ASSETS_BASE}/model-5-640.webp`,
    model1080: `${LEGACY_ASSETS_BASE}/model-5-1080.webp`,
    compareAtPrice: '$477.00',
    bundlePrice: '$429.30',
    pins: [
      { number: 1, productId: 'tatum-5-orbit-copy', productName: 'Tatum 5 "Orbit" (Copy)', left: '50%', top: '35%' },
      { number: 2, productId: 'wide-jeans-copy', productName: 'Wide Jeans (Copy)', left: '51%', top: '61%' },
      { number: 3, productId: 'tshirt-copy', productName: 'Tshirt (Copy)', left: '52%', top: '88%' },
    ],
    items: [
      { cardNumber: 1, productId: 'tatum-5-orbit-copy', tag: 'New' },
      { cardNumber: 2, productId: 'wide-jeans-copy' },
      { cardNumber: 3, productId: 'tshirt-copy' },
    ],
  },
  {
    index: 5,
    key: '6_6',
    numberFormatted: '06',
    name: 'Studio Day',
    piecesLabel: '3 pieces',
    model640: `${LEGACY_ASSETS_BASE}/model-6-640.webp`,
    model1080: `${LEGACY_ASSETS_BASE}/model-6-1080.webp`,
    compareAtPrice: '$477.00',
    bundlePrice: '$429.30',
    pins: [
      { number: 1, productId: 'tatum-5-orbit-copy', productName: 'Tatum 5 "Orbit" (Copy)', left: '50%', top: '34%' },
      { number: 2, productId: 'wide-jeans', productName: 'Wide Jeans', left: '51%', top: '61%' },
      { number: 3, productId: 'tshirt-copy', productName: 'Tshirt (Copy)', left: '52%', top: '88%' },
    ],
    items: [
      { cardNumber: 1, productId: 'tatum-5-orbit-copy', tag: 'New' },
      { cardNumber: 2, productId: 'wide-jeans' },
      { cardNumber: 3, productId: 'tshirt-copy' },
    ],
  },
];
