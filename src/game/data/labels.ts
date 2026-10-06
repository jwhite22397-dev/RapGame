import type { Label, LabelType } from '../models/types';

export interface LabelTemplate {
  name: string;
  type: LabelType;
  prestige: number;
  marketingPower: number;
  advanceRange: [number, number];
  royaltyRange: [number, number];
  marketingRange: [number, number];
}

export const LABEL_TEMPLATES: LabelTemplate[] = [
  // Major labels
  {
    name: 'Northstar Records',
    type: 'major',
    prestige: 95,
    marketingPower: 100,
    advanceRange: [500000, 5000000],
    royaltyRange: [12, 18],
    marketingRange: [100000, 1000000],
  },
  {
    name: 'Empire Sound Group',
    type: 'major',
    prestige: 90,
    marketingPower: 95,
    advanceRange: [400000, 4000000],
    royaltyRange: [14, 20],
    marketingRange: [80000, 800000],
  },
  {
    name: 'Atlantic Wave Records',
    type: 'major',
    prestige: 92,
    marketingPower: 98,
    advanceRange: [450000, 4500000],
    royaltyRange: [13, 19],
    marketingRange: [90000, 900000],
  },
  
  // Independent labels
  {
    name: 'Underground Kingdom',
    type: 'independent',
    prestige: 70,
    marketingPower: 55,
    advanceRange: [50000, 300000],
    royaltyRange: [25, 40],
    marketingRange: [15000, 100000],
  },
  {
    name: 'Streetlights Music',
    type: 'independent',
    prestige: 65,
    marketingPower: 50,
    advanceRange: [40000, 250000],
    royaltyRange: [28, 45],
    marketingRange: [10000, 80000],
  },
  
  // Boutique labels
  {
    name: 'Curated Sound',
    type: 'boutique',
    prestige: 80,
    marketingPower: 40,
    advanceRange: [20000, 150000],
    royaltyRange: [35, 50],
    marketingRange: [5000, 50000],
  },
  {
    name: 'Midnight Collective',
    type: 'boutique',
    prestige: 75,
    marketingPower: 35,
    advanceRange: [15000, 100000],
    royaltyRange: [40, 55],
    marketingRange: [3000, 40000],
  },
  
  // Artist-friendly labels
  {
    name: 'Creator\'s Circle',
    type: 'artist-friendly',
    prestige: 72,
    marketingPower: 45,
    advanceRange: [30000, 200000],
    royaltyRange: [45, 60],
    marketingRange: [8000, 60000],
  },
  {
    name: 'Freedom Records',
    type: 'artist-friendly',
    prestige: 68,
    marketingPower: 42,
    advanceRange: [25000, 180000],
    royaltyRange: [50, 65],
    marketingRange: [6000, 50000],
  },
  
  // Aggressive labels
  {
    name: 'Predator Music Group',
    type: 'aggressive',
    prestige: 78,
    marketingPower: 85,
    advanceRange: [200000, 1500000],
    royaltyRange: [10, 15],
    marketingRange: [50000, 400000],
  },
  {
    name: 'Shark Tank Records',
    type: 'aggressive',
    prestige: 75,
    marketingPower: 80,
    advanceRange: [180000, 1200000],
    royaltyRange: [8, 14],
    marketingRange: [40000, 350000],
  },
];

export function createLabelsFromTemplates(): Label[] {
  return LABEL_TEMPLATES.map((template, index) => ({
    id: `label-${index}`,
    name: template.name,
    type: template.type,
    prestige: template.prestige,
    marketingPower: template.marketingPower,
    artistRoster: [],
  }));
}

export const LABEL_TYPE_DESCRIPTIONS: Record<LabelType, string> = {
  major: 'Massive reach and resources, but demanding contracts and less creative control.',
  independent: 'Good balance of support and freedom, more artist-focused deals.',
  boutique: 'Smaller but curated roster, high attention per artist, fair deals.',
  'artist-friendly': 'Best royalty rates and creative freedom, limited marketing muscle.',
  aggressive: 'Big advances and marketing push, but the most demanding terms.',
};
