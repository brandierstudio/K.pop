export type RailCategory =
  | 'All'
  | 'Everyday'
  | 'Formal'
  | 'Open Abaya'
  | 'Closed Abaya'
  | 'Occasion'
  | 'Prayer Wear'
  | 'Dark Tones'
  | 'Soft Tones';

export const RAIL_CATEGORIES: readonly RailCategory[] = [
  'All',
  'Everyday',
  'Formal',
  'Open Abaya',
  'Closed Abaya',
  'Occasion',
  'Prayer Wear',
  'Dark Tones',
  'Soft Tones',
] as const;

export interface RailGarmentDef {
  k: number;
  id: string;
  name: string;
  category: Exclude<RailCategory, 'All'>;
  tags: Exclude<RailCategory, 'All'>[];
  fabric: string;
  color: string;
  sleeveStyle: string;
  occasion: string;
  care: string;
  description: string;
  price: number;
  priceFormatted: string;
  tagPrice: string;
  sizes: string[];
  variants: { id: number; a: boolean; o: string[] }[];
  image: string;
  detailImage: string;
  aspectHeight: number;
}

export const RAIL_GARMENTS: RailGarmentDef[] = [
  {
    k: 0,
    id: 'rail-noir-nida-abaya',
    name: 'Noir Classic Nida Abaya',
    category: 'Closed Abaya',
    tags: ['Everyday', 'Closed Abaya', 'Dark Tones'],
    fabric: 'Korean Nida Crepe',
    color: 'Jet Black',
    sleeveStyle: 'Tailored Straight Cuff',
    occasion: 'Daily & Studio',
    care: 'Cold gentle hand wash · steam vertically',
    description:
      'Fluid, breathable Korean Nida cut in a clean A-line drape with concealed front placket and structured cuffs.',
    price: 145,
    priceFormatted: '$145.00',
    tagPrice: '$145',
    sizes: ['52', '54', '56', '58', '60'],
    variants: [
      { id: 9001001, a: true, o: ['52'] },
      { id: 9001002, a: true, o: ['54'] },
      { id: 9001003, a: true, o: ['56'] },
      { id: 9001004, a: true, o: ['58'] },
      { id: 9001005, a: true, o: ['60'] },
    ],
    image: '/assets/modest/abayas/abaya-1.png',
    detailImage: '/assets/modest/abayas/abaya-1-detail.png',
    aspectHeight: 920,
  },
  {
    k: 1,
    id: 'rail-obsidian-satin-bisht',
    name: 'Obsidian Satin-Lapel Bisht',
    category: 'Formal',
    tags: ['Formal', 'Open Abaya', 'Occasion', 'Dark Tones'],
    fabric: 'Matte Crepe & Silk Satin',
    color: 'Obsidian Black',
    sleeveStyle: 'Draped Bisht Wing',
    occasion: 'Evening & Formal',
    care: 'Dry clean recommended · low-heat steam',
    description:
      'Architectural front-open bisht silhouette framed with lustrous satin lapels and sweeping fluid sleeves.',
    price: 195,
    priceFormatted: '$195.00',
    tagPrice: '$195',
    sizes: ['52', '54', '56', '58', '60'],
    variants: [
      { id: 9002001, a: true, o: ['52'] },
      { id: 9002002, a: true, o: ['54'] },
      { id: 9002003, a: true, o: ['56'] },
      { id: 9002004, a: true, o: ['58'] },
      { id: 9002005, a: true, o: ['60'] },
    ],
    image: '/assets/modest/abayas/abaya-2.png',
    detailImage: '/assets/modest/abayas/abaya-2-detail.png',
    aspectHeight: 940,
  },
  {
    k: 2,
    id: 'rail-espresso-pleated-farasha',
    name: 'Espresso Pleated Farasha',
    category: 'Occasion',
    tags: ['Closed Abaya', 'Occasion', 'Everyday', 'Dark Tones'],
    fabric: 'Micro-Pleated Georgette',
    color: 'Espresso Cocoa',
    sleeveStyle: 'Flowing Butterfly Drape',
    occasion: 'Gatherings & Dinner',
    care: 'Hand wash cold · hang dry to preserve pleats',
    description:
      'Fine vertical micro-pleats cascade effortlessly from shoulder to hem for weightless modest movement.',
    price: 175,
    priceFormatted: '$175.00',
    tagPrice: '$175',
    sizes: ['52', '54', '56', '58', '60'],
    variants: [
      { id: 9003001, a: true, o: ['52'] },
      { id: 9003002, a: true, o: ['54'] },
      { id: 9003003, a: true, o: ['56'] },
      { id: 9003004, a: true, o: ['58'] },
      { id: 9003005, a: true, o: ['60'] },
    ],
    image: '/assets/modest/abayas/abaya-3.png',
    detailImage: '/assets/modest/abayas/abaya-3-detail.png',
    aspectHeight: 930,
  },
  {
    k: 3,
    id: 'rail-charcoal-botanical-open',
    name: 'Charcoal Embroidered Open Abaya',
    category: 'Formal',
    tags: ['Formal', 'Open Abaya', 'Occasion', 'Dark Tones'],
    fabric: 'Heavy Medina Crepe',
    color: 'Deep Charcoal & Silver',
    sleeveStyle: 'Embroidered Bell Cuff',
    occasion: 'Eid & Formal Events',
    care: 'Dry clean only to protect silver threadwork',
    description:
      'Tonal silver botanical threadwork traces the front placket and flared cuffs of this refined open abaya.',
    price: 215,
    priceFormatted: '$215.00',
    tagPrice: '$215',
    sizes: ['52', '54', '56', '58', '60'],
    variants: [
      { id: 9004001, a: true, o: ['52'] },
      { id: 9004002, a: true, o: ['54'] },
      { id: 9004003, a: true, o: ['56'] },
      { id: 9004004, a: true, o: ['58'] },
      { id: 9004005, a: true, o: ['60'] },
    ],
    image: '/assets/modest/abayas/abaya-4.png',
    detailImage: '/assets/modest/abayas/abaya-4-detail.png',
    aspectHeight: 935,
  },
  {
    k: 4,
    id: 'rail-olive-belted-trench-abaya',
    name: 'Zaytoun Belted Trench Abaya',
    category: 'Open Abaya',
    tags: ['Everyday', 'Open Abaya', 'Soft Tones'],
    fabric: 'Structured Cotton-Tencel',
    color: 'Muted Olive Sage',
    sleeveStyle: 'Tab-Cuff Raglan',
    occasion: 'Travel & Daytime',
    care: 'Gentle machine wash cold · warm iron',
    description:
      'Modern layered trench-inspired open abaya with removable self-tie belt and crisp storm-flap tailoring.',
    price: 185,
    priceFormatted: '$185.00',
    tagPrice: '$185',
    sizes: ['52', '54', '56', '58', '60'],
    variants: [
      { id: 9005001, a: true, o: ['52'] },
      { id: 9005002, a: true, o: ['54'] },
      { id: 9005003, a: true, o: ['56'] },
      { id: 9005004, a: true, o: ['58'] },
      { id: 9005005, a: true, o: ['60'] },
    ],
    image: '/assets/modest/abayas/abaya-5.png',
    detailImage: '/assets/modest/abayas/abaya-5-detail.png',
    aspectHeight: 925,
  },
  {
    k: 5,
    id: 'rail-midnight-khimar-prayer',
    name: 'Midnight Layered Prayer Abaya',
    category: 'Prayer Wear',
    tags: ['Prayer Wear', 'Closed Abaya', 'Everyday', 'Dark Tones'],
    fabric: 'Breathable Medina Silk',
    color: 'Midnight Navy',
    sleeveStyle: 'Integrated Khimar Cape',
    occasion: 'Salah, Umrah & Masjid',
    care: 'Cold gentle wash · zero-iron travel drape',
    description:
      'Opaque, wrinkle-resistant full-coverage prayer abaya with flowing layered cape and secure elastic wrist cuffs.',
    price: 135,
    priceFormatted: '$135.00',
    tagPrice: '$135',
    sizes: ['52', '54', '56', '58', '60'],
    variants: [
      { id: 9006001, a: true, o: ['52'] },
      { id: 9006002, a: true, o: ['54'] },
      { id: 9006003, a: true, o: ['56'] },
      { id: 9006004, a: true, o: ['58'] },
      { id: 9006005, a: true, o: ['60'] },
    ],
    image: '/assets/modest/abayas/abaya-6.png',
    detailImage: '/assets/modest/abayas/abaya-6-detail.png',
    aspectHeight: 945,
  },
  {
    k: 6,
    id: 'rail-sand-linen-everyday',
    name: 'Sahara Linen Everyday Abaya',
    category: 'Everyday',
    tags: ['Everyday', 'Closed Abaya', 'Soft Tones'],
    fabric: 'Washed Linen-Crepe Blend',
    color: 'Warm Sand Beige',
    sleeveStyle: 'Relaxed Turnback Cuff',
    occasion: 'Daytime & Warm Weather',
    care: 'Gentle wash cold · shade dry & light steam',
    description:
      'Airy warm-sand linen blend woven for year-round comfort with deep side pockets and refined tonal topstitching.',
    price: 155,
    priceFormatted: '$155.00',
    tagPrice: '$155',
    sizes: ['52', '54', '56', '58', '60'],
    variants: [
      { id: 9007001, a: true, o: ['52'] },
      { id: 9007002, a: true, o: ['54'] },
      { id: 9007003, a: true, o: ['56'] },
      { id: 9007004, a: true, o: ['58'] },
      { id: 9007005, a: true, o: ['60'] },
    ],
    image: '/assets/modest/abayas/abaya-7.png',
    detailImage: '/assets/modest/abayas/abaya-7-detail.png',
    aspectHeight: 925,
  },
  {
    k: 7,
    id: 'rail-mauve-chiffon-eid',
    name: 'Dusk Mauve Pearl-Cuff Abaya',
    category: 'Occasion',
    tags: ['Occasion', 'Formal', 'Open Abaya', 'Soft Tones'],
    fabric: 'Double-Layer Silk Chiffon',
    color: 'Dusty Rose Mauve',
    sleeveStyle: 'Hand-Beaded Pearl Cuff',
    occasion: 'Eid & Celebrations',
    care: 'Dry clean only · protect pearl embellishments',
    description:
      'Ethereal double-layer chiffon over a matching modest slip, finished with luminous hand-sewn pearl cuffs.',
    price: 235,
    priceFormatted: '$235.00',
    tagPrice: '$235',
    sizes: ['52', '54', '56', '58', '60'],
    variants: [
      { id: 9008001, a: true, o: ['52'] },
      { id: 9008002, a: true, o: ['54'] },
      { id: 9008003, a: true, o: ['56'] },
      { id: 9008004, a: true, o: ['58'] },
      { id: 9008005, a: true, o: ['60'] },
    ],
    image: '/assets/modest/abayas/abaya-8.png',
    detailImage: '/assets/modest/abayas/abaya-8-detail.png',
    aspectHeight: 940,
  },
];

// 20 curated abaya positions suspended along the curved brass rail
export const RAIL_SEQUENCE: number[] = [
  0, 6, 1, 7, 2, 4, 3, 5, 0, 7, 4, 1, 6, 2, 5, 3, 7, 0, 4, 6,
];

// Subtle organic paper hang-tag angles (degrees)
export const TAG_ROTATIONS: number[] = [-4, 3, -3, 5, -4, 3, -5, 4, -3, 4];

export function matchesRailCategory(
  garment: RailGarmentDef,
  activeCategory: string
): boolean {
  if (!activeCategory || activeCategory === 'All') return true;
  return (
    garment.category === activeCategory ||
    garment.tags.includes(activeCategory as Exclude<RailCategory, 'All'>)
  );
}

export function computeRailY(
  x: number,
  W: number,
  railTop: number,
  sag: number,
  u: number
): number {
  const halfW = Math.max(1, W / 2);
  const t = (x - halfW) / halfW;
  return (railTop + sag * (1 - t * t)) * u;
}

/**
 * Wraps a linear rail coordinate into a seamless infinite loop centered
 * around viewportWidth / 2 so garments enter and exit smoothly off-screen.
 */
export function wrapRailX(
  rawX: number,
  loopWidth: number,
  viewportWidth: number
): number {
  if (loopWidth <= 0) return rawX;
  const center = viewportWidth / 2;
  const halfLoop = loopWidth / 2;
  const rel = (((rawX - center + halfLoop) % loopWidth) + loopWidth) % loopWidth - halfLoop;
  return center + rel;
}

/**
 * Shortest signed index delta along a circular rail of length `count`.
 * Used so hovering piece 0 smoothly parts piece (count - 1) on the left and piece 1 on the right.
 */
export function shortestRailIndexDelta(
  fromIdx: number,
  toIdx: number,
  count: number
): number {
  if (count <= 0) return 0;
  let d = (((toIdx - fromIdx) % count) + count) % count;
  if (d > count / 2) d -= count;
  return d;
}
