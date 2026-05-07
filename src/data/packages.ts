/**
 * Single source of truth for the four Aconcagua expedition packages.
 * Translation keys reference existing pricing.cardN.* keys in src/i18n/*.ts.
 * heroImageSrc uses /hero.webp as a placeholder — swap per-package images here later.
 */

export interface Package {
  id: 1 | 2 | 3 | 4;
  nameKey: string;
  priceKey: string;
  featureKeys: string[];
  badgeKey?: string;
  featured: boolean;
  heroImageSrc: string;
}

export const packages: ReadonlyArray<Package> = [
  {
    id: 1,
    nameKey: 'pricing.card1.name',
    priceKey: 'pricing.card1.price',
    featureKeys: [
      'pricing.card1.feature1',
      'pricing.card1.feature2',
      'pricing.card1.feature3',
      'pricing.card1.feature4',
    ],
    featured: false,
    heroImageSrc: '/hero.webp', // placeholder — replace with per-package hero image
  },
  {
    id: 2,
    nameKey: 'pricing.card2.name',
    priceKey: 'pricing.card2.price',
    featureKeys: [
      'pricing.card2.feature1',
      'pricing.card2.feature2',
      'pricing.card2.feature3',
      'pricing.card2.feature4',
      'pricing.card2.feature5',
      'pricing.card2.feature6',
      'pricing.card2.feature7',
    ],
    featured: false,
    heroImageSrc: '/hero.webp', // placeholder — replace with per-package hero image
  },
  {
    id: 3,
    nameKey: 'pricing.card3.name',
    priceKey: 'pricing.card3.price',
    featureKeys: [
      'pricing.card3.feature1',
      'pricing.card3.feature2',
      'pricing.card3.feature3',
      'pricing.card3.feature4',
      'pricing.card3.feature5',
      'pricing.card3.feature6',
      'pricing.card3.feature7',
      'pricing.card3.feature8',
      'pricing.card3.feature9',
    ],
    badgeKey: 'pricing.card3.badge',
    featured: true,
    heroImageSrc: '/hero.webp', // placeholder — replace with per-package hero image
  },
  {
    id: 4,
    nameKey: 'pricing.card4.name',
    priceKey: 'pricing.card4.price',
    featureKeys: [
      'pricing.card4.feature1',
      'pricing.card4.feature2',
      'pricing.card4.feature3',
    ],
    featured: false,
    heroImageSrc: '/hero.webp', // placeholder — replace with per-package hero image
  },
] as const;

/**
 * Look up a package by numeric id (1–4).
 * Returns undefined if the id is not found.
 */
export function getPackageById(id: number): Package | undefined {
  return packages.find(p => p.id === id);
}
