import type { Appearance, JewelryId, OutfitId } from '../models/types';

export type ShopCategory = 'studio' | 'jewelry' | 'fit' | 'flex';

export interface ShopItem {
  id: string;
  name: string;
  category: ShopCategory;
  price: number;
  description: string;
  weeklyHype: number;
  weeklyFollowers: number;
  recordEnergyDiscount: number;
  songQualityBonus: number;
  studioTier: number;
  appearance?: Partial<Appearance>;
  unlockFollowers?: number;
}

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'home-studio',
    name: 'Home Studio',
    category: 'studio',
    price: 2500,
    description: 'Record at home. Recording costs less energy and no session fees.',
    weeklyHype: 0,
    weeklyFollowers: 0,
    recordEnergyDiscount: 12,
    songQualityBonus: 4,
    studioTier: 1,
  },
  {
    id: 'pro-studio',
    name: 'Pro Room',
    category: 'studio',
    price: 18000,
    description: 'Treated room, better monitors. Recording is cheap on energy and songs come out cleaner.',
    weeklyHype: 1,
    weeklyFollowers: 0,
    recordEnergyDiscount: 18,
    songQualityBonus: 10,
    studioTier: 2,
    unlockFollowers: 2500,
  },
  {
    id: 'gold-chain',
    name: 'Gold Chain',
    category: 'jewelry',
    price: 800,
    description: 'A simple Cuban. People notice when you step out.',
    weeklyHype: 2,
    weeklyFollowers: 8,
    recordEnergyDiscount: 0,
    songQualityBonus: 0,
    studioTier: 0,
    appearance: { jewelry: 'chain' },
  },
  {
    id: 'iced-chain',
    name: 'Iced Chain',
    category: 'jewelry',
    price: 6500,
    description: 'Catches every camera. Flex that actually moves the algorithm.',
    weeklyHype: 5,
    weeklyFollowers: 40,
    recordEnergyDiscount: 0,
    songQualityBonus: 0,
    studioTier: 0,
    appearance: { jewelry: 'iced' },
    unlockFollowers: 1000,
  },
  {
    id: 'diamond-set',
    name: 'Diamond Set',
    category: 'jewelry',
    price: 45000,
    description: 'The full ice. Hype walks in before you do.',
    weeklyHype: 10,
    weeklyFollowers: 180,
    recordEnergyDiscount: 0,
    songQualityBonus: 0,
    studioTier: 0,
    appearance: { jewelry: 'diamond' },
    unlockFollowers: 25000,
  },
  {
    id: 'stage-fit',
    name: 'Stage Fit',
    category: 'fit',
    price: 450,
    description: 'Looks like you came to perform, even at an open mic.',
    weeklyHype: 1,
    weeklyFollowers: 5,
    recordEnergyDiscount: 0,
    songQualityBonus: 0,
    studioTier: 0,
    appearance: { outfit: 'stage' },
  },
  {
    id: 'designer-fit',
    name: 'Designer Fit',
    category: 'fit',
    price: 4200,
    description: 'The look people screenshot. Charisma in fabric form.',
    weeklyHype: 3,
    weeklyFollowers: 25,
    recordEnergyDiscount: 0,
    songQualityBonus: 0,
    studioTier: 0,
    appearance: { outfit: 'luxury' },
    unlockFollowers: 2000,
  },
  {
    id: 'used-whip',
    name: 'Used Whip',
    category: 'flex',
    price: 3800,
    description: 'You stop taking the bus to sessions. Shows up. Gets you there.',
    weeklyHype: 2,
    weeklyFollowers: 12,
    recordEnergyDiscount: 0,
    songQualityBonus: 0,
    studioTier: 0,
    unlockFollowers: 400,
  },
  {
    id: 'sports-car',
    name: 'Sports Car',
    category: 'flex',
    price: 85000,
    description: 'The arrival. Parking-lot movies write themselves.',
    weeklyHype: 8,
    weeklyFollowers: 150,
    recordEnergyDiscount: 0,
    songQualityBonus: 0,
    studioTier: 0,
    unlockFollowers: 50000,
  },
];

export const DATE_COST = { money: 80, energy: 20 };
export const UNRELEASED_SONG_CAP = 8;

export function defaultAppearance(): Appearance {
  return {
    skinTone: 'brown',
    hairStyle: 'fade',
    hairColor: 'black',
    outfit: 'street',
    jewelry: 'none',
    glasses: false,
  };
}

export function defaultLifestyle() {
  return {
    ownedItemIds: [] as string[],
    studioTier: 0,
    mood: 55,
    dating: null,
    showsPerformed: 0,
  };
}

export function getOwnedItems(ownedIds: string[]): ShopItem[] {
  return SHOP_ITEMS.filter((item) => ownedIds.includes(item.id));
}

export function getRecordEnergyCost(ownedIds: string[], studioTier: number): number {
  const base = 30;
  const discount = Math.max(
    0,
    ...getOwnedItems(ownedIds).map((item) => item.recordEnergyDiscount),
    studioTier >= 2 ? 18 : studioTier >= 1 ? 12 : 0
  );
  return Math.max(8, base - discount);
}

export function getStudioQualityBonus(ownedIds: string[], studioTier: number): number {
  const fromItems = Math.max(0, ...getOwnedItems(ownedIds).map((item) => item.songQualityBonus));
  const fromTier = studioTier >= 2 ? 10 : studioTier >= 1 ? 4 : 0;
  return Math.max(fromItems, fromTier);
}

export function jewelryFromOwned(ownedIds: string[]): JewelryId {
  if (ownedIds.includes('diamond-set')) return 'diamond';
  if (ownedIds.includes('iced-chain')) return 'iced';
  if (ownedIds.includes('gold-chain')) return 'chain';
  return 'none';
}

export function outfitFromOwned(ownedIds: string[], current: OutfitId): OutfitId {
  if (ownedIds.includes('designer-fit')) return 'luxury';
  if (ownedIds.includes('stage-fit')) return 'stage';
  return current;
}
