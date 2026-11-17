export interface RailCropRect {
  y: number;
  h: number;
  hookX: number;
}

export interface RailGarmentDef {
  k: number;
  id: string;
  name: string;
  category: string;
  price: number;
  priceFormatted: string;
  tagPrice: string;
  sizes: string[];
  variants: { id: number; a: boolean; o: string[] }[];
  crops: {
    side: RailCropRect;
    front: RailCropRect;
    back: RailCropRect;
  };
}

export const RAIL_SHEETS = {
  side:
    'https://images.higgs.ai/?default=1&output=webp&url=' +
    encodeURIComponent(
      'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261113_115504_3ab92758-5854-4a1c-85db-ff8efd929e86.png'
    ) +
    '&w=1360&q=85',
  front:
    'https://images.higgs.ai/?default=1&output=webp&url=' +
    encodeURIComponent(
      'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261113_115743_54dc8c72-0be0-4858-bd0c-10ecb399c16c.png'
    ) +
    '&w=1360&q=85',
  back:
    'https://images.higgs.ai/?default=1&output=webp&url=' +
    encodeURIComponent(
      'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261113_115613_7d45aea6-1bea-41ff-b878-72d7c8bcb9da.png'
    ) +
    '&w=1360&q=85',
};

export const RAIL_GARMENTS: RailGarmentDef[] = [
  {
    k: 0,
    id: 'rail-noir-tailored-blazer',
    name: 'Noir Tailored Blazer',
    category: 'Tailoring',
    price: 690,
    priceFormatted: '$690.00',
    tagPrice: '$690',
    sizes: ['S', 'M', 'L', 'XL'],
    variants: [
      { id: 9001001, a: true, o: ['S'] },
      { id: 9001002, a: true, o: ['M'] },
      { id: 9001003, a: true, o: ['L'] },
      { id: 9001004, a: true, o: ['XL'] },
    ],
    crops: {
      side: { y: 44, h: 619, hookX: 185 },
      front: { y: 79, h: 552, hookX: 175 },
      back: { y: 76, h: 515, hookX: 176 },
    },
  },
  {
    k: 1,
    id: 'rail-ivory-belted-trench',
    name: 'Ivory Belted Trench',
    category: 'Outerwear',
    price: 690,
    priceFormatted: '$690.00',
    tagPrice: '$690',
    sizes: ['S', 'M', 'L', 'XL'],
    variants: [
      { id: 9002001, a: true, o: ['S'] },
      { id: 9002002, a: true, o: ['M'] },
      { id: 9002003, a: true, o: ['L'] },
      { id: 9002004, a: true, o: ['XL'] },
    ],
    crops: {
      side: { y: 45, h: 860, hookX: 514 },
      front: { y: 76, h: 900, hookX: 511 },
      back: { y: 60, h: 890, hookX: 508 },
    },
  },
  {
    k: 2,
    id: 'rail-oxblood-silk-slip',
    name: 'Oxblood Silk Slip',
    category: 'Evening',
    price: 690,
    priceFormatted: '$690.00',
    tagPrice: '$690',
    sizes: ['S', 'M', 'L', 'XL'],
    variants: [
      { id: 9003001, a: true, o: ['S'] },
      { id: 9003002, a: true, o: ['M'] },
      { id: 9003003, a: true, o: ['L'] },
      { id: 9003004, a: true, o: ['XL'] },
    ],
    crops: {
      side: { y: 45, h: 876, hookX: 834 },
      front: { y: 76, h: 913, hookX: 848 },
      back: { y: 60, h: 901, hookX: 845 },
    },
  },
  {
    k: 3,
    id: 'rail-taupe-wool-blazer',
    name: 'Taupe Wool Blazer',
    category: 'Tailoring',
    price: 690,
    priceFormatted: '$690.00',
    tagPrice: '$690',
    sizes: ['S', 'M', 'L', 'XL'],
    variants: [
      { id: 9004001, a: true, o: ['S'] },
      { id: 9004002, a: true, o: ['M'] },
      { id: 9004003, a: true, o: ['L'] },
      { id: 9004004, a: true, o: ['XL'] },
    ],
    crops: {
      side: { y: 45, h: 606, hookX: 1169 },
      front: { y: 80, h: 550, hookX: 1179 },
      back: { y: 76, h: 520, hookX: 1180 },
    },
  },
  {
    k: 4,
    id: 'rail-champagne-bias-slip',
    name: 'Champagne Bias Slip',
    category: 'Evening',
    price: 690,
    priceFormatted: '$690.00',
    tagPrice: '$690',
    sizes: ['S', 'M', 'L', 'XL'],
    variants: [
      { id: 9005001, a: true, o: ['S'] },
      { id: 9005002, a: true, o: ['M'] },
      { id: 9005003, a: true, o: ['L'] },
      { id: 9005004, a: true, o: ['XL'] },
    ],
    crops: {
      side: { y: 1024, h: 937, hookX: 177 },
      front: { y: 1024, h: 936, hookX: 177 },
      back: { y: 1026, h: 931, hookX: 175 },
    },
  },
  {
    k: 5,
    id: 'rail-pearl-silk-slip',
    name: 'Pearl Silk Slip',
    category: 'Evening',
    price: 690,
    priceFormatted: '$690.00',
    tagPrice: '$690',
    sizes: ['S', 'M', 'L', 'XL'],
    variants: [
      { id: 9006001, a: true, o: ['S'] },
      { id: 9006002, a: true, o: ['M'] },
      { id: 9006003, a: true, o: ['L'] },
      { id: 9006004, a: true, o: ['XL'] },
    ],
    crops: {
      side: { y: 1024, h: 936, hookX: 511 },
      front: { y: 1024, h: 940, hookX: 513 },
      back: { y: 1026, h: 929, hookX: 508 },
    },
  },
  {
    k: 6,
    id: 'rail-taupe-belted-trench',
    name: 'Taupe Belted Trench',
    category: 'Outerwear',
    price: 690,
    priceFormatted: '$690.00',
    tagPrice: '$690',
    sizes: ['S', 'M', 'L', 'XL'],
    variants: [
      { id: 9007001, a: true, o: ['S'] },
      { id: 9007002, a: true, o: ['M'] },
      { id: 9007003, a: true, o: ['L'] },
      { id: 9007004, a: true, o: ['XL'] },
    ],
    crops: {
      side: { y: 1024, h: 907, hookX: 825 },
      front: { y: 1024, h: 894, hookX: 851 },
      back: { y: 1024, h: 901, hookX: 845 },
    },
  },
  {
    k: 7,
    id: 'rail-oxblood-satin-gown',
    name: 'Oxblood Satin Gown',
    category: 'Evening',
    price: 690,
    priceFormatted: '$690.00',
    tagPrice: '$690',
    sizes: ['S', 'M', 'L', 'XL'],
    variants: [
      { id: 9008001, a: true, o: ['S'] },
      { id: 9008002, a: true, o: ['M'] },
      { id: 9008003, a: true, o: ['L'] },
      { id: 9008004, a: true, o: ['XL'] },
    ],
    crops: {
      side: { y: 1024, h: 962, hookX: 1166 },
      front: { y: 1024, h: 938, hookX: 1185 },
      back: { y: 1024, h: 934, hookX: 1184 },
    },
  },
];

// 20 pieces on the rail in the exact k order from the specification:
export const RAIL_SEQUENCE: number[] = [
  0, 1, 2, 3, 4, 0, 5, 6, 7, 0, 4, 1, 2, 3, 5, 6, 7, 1, 4, 3,
];

// Repeating price tag angles (degrees)
export const TAG_ROTATIONS: number[] = [-5, 4, -3, 6, -4, 3, -6, 4, -3, 5];

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

export function computeCropStyle(
  sheetUrl: string,
  crop: RailCropRect,
  s: number
): {
  width: string;
  height: string;
  left: string;
  top: string;
  backgroundImage: string;
  backgroundSize: string;
  backgroundPosition: string;
} {
  const w = 340 * s;
  const h = (crop.h + 6) * s;
  const left = -170 * s;
  const bgW = 1360 * s;
  const bgX = -(crop.hookX - 170) * s;
  const bgY = -crop.y * s;
  return {
    width: `${w.toFixed(2)}px`,
    height: `${h.toFixed(2)}px`,
    left: `${left.toFixed(2)}px`,
    top: '0px',
    backgroundImage: `url("${sheetUrl}")`,
    backgroundSize: `${bgW.toFixed(2)}px auto`,
    backgroundPosition: `${bgX.toFixed(2)}px ${bgY.toFixed(2)}px`,
  };
}
