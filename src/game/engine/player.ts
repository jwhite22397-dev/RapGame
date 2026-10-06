// Player creation and management

import type { Player, Genre, Archetype, PlayerAttributes } from '../models/types';
import { rng } from './rng';
import { BALANCE } from '../balance/constants';
import { ARCHETYPES } from '../data/archetypes';
import { generateCity } from './generators';

export interface NewCareerOptions {
  artistName: string;
  realName?: string;
  hometown?: string;
  age: number;
  genre: Genre;
  archetype: Archetype;
}

export function createPlayer(options: NewCareerOptions): Player {
  const r = rng();
  const b = BALANCE.starting;
  const archetypeData = ARCHETYPES[options.archetype];
  
  // Generate randomized starting conditions
  const startingCash = r.int(b.cash.min, b.cash.max);
  const startingFollowers = r.int(b.followers.min, b.followers.max);
  const startingHype = r.int(b.hype.min, b.hype.max);
  
  // Apply slight randomization to archetype attributes
  const attributes = randomizeAttributes(archetypeData.startingAttributes);
  
  return {
    id: r.id(),
    artistName: options.artistName,
    realName: options.realName || '',
    hometown: options.hometown || generateCity(),
    age: options.age,
    startingAge: options.age,
    genre: options.genre,
    archetype: options.archetype,
    attributes,
    stats: {
      cash: startingCash,
      followers: startingFollowers,
      monthlyListeners: 0,
      totalStreams: 0,
      careerEarnings: 0,
      hype: startingHype,
      energy: b.energy,
      maxEnergy: b.maxEnergy,
    },
    reputation: {
      undergroundCredibility: getInitialReputation(options.archetype, 'underground'),
      mainstreamRecognition: 0,
      industryRespect: 0,
    },
    fanBase: {
      casual: Math.floor(startingFollowers * 0.8),
      followers: Math.floor(startingFollowers * 0.15),
      core: Math.floor(startingFollowers * 0.04),
      superfans: Math.floor(startingFollowers * 0.01),
    },
    careerTier: 'unknown',
    hasQuitDayJob: false,
    labelContract: null,
    milestones: [],
    awards: [],
  };
}

function randomizeAttributes(base: PlayerAttributes): PlayerAttributes {
  const r = rng();
  const variance = 5;
  
  const randomize = (value: number): number => {
    const adjusted = value + r.int(-variance, variance);
    return Math.max(1, Math.min(100, adjusted));
  };
  
  return {
    writing: randomize(base.writing),
    flow: randomize(base.flow),
    melody: randomize(base.melody),
    performance: randomize(base.performance),
    productionKnowledge: randomize(base.productionKnowledge),
    marketing: randomize(base.marketing),
    networking: randomize(base.networking),
    business: randomize(base.business),
    workEthic: randomize(base.workEthic),
    charisma: randomize(base.charisma),
  };
}

function getInitialReputation(archetype: Archetype, type: 'underground' | 'mainstream'): number {
  const undergroundBoosts: Partial<Record<Archetype, number>> = {
    lyricist: 15,
    visionary: 10,
    performer: 5,
  };
  
  if (type === 'underground') {
    return undergroundBoosts[archetype] || 0;
  }
  
  return 0;
}

export function improveAttribute(
  current: number,
  baseGain: number = BALANCE.attributes.baseGain
): number {
  const b = BALANCE.attributes;
  
  // Diminishing returns after threshold
  let gain = baseGain;
  if (current >= b.diminishingReturnsStart) {
    const overThreshold = current - b.diminishingReturnsStart;
    gain = baseGain * Math.pow(1 - b.diminishingReturnsRate, overThreshold);
  }
  
  return Math.min(b.maxValue, current + gain);
}

export function calculateCareerTier(
  followers: number,
  monthlyListeners: number
): Player['careerTier'] {
  const tiers = BALANCE.careerTiers;
  
  // Check from highest to lowest
  if (followers >= tiers.icon.followers && monthlyListeners >= tiers.icon.monthlyListeners) {
    return 'icon';
  }
  if (followers >= tiers.superstar.followers && monthlyListeners >= tiers.superstar.monthlyListeners) {
    return 'superstar';
  }
  if (followers >= tiers.star.followers && monthlyListeners >= tiers.star.monthlyListeners) {
    return 'star';
  }
  if (followers >= tiers.established.followers && monthlyListeners >= tiers.established.monthlyListeners) {
    return 'established';
  }
  if (followers >= tiers.breakout.followers && monthlyListeners >= tiers.breakout.monthlyListeners) {
    return 'breakout';
  }
  if (followers >= tiers.underground.followers && monthlyListeners >= tiers.underground.monthlyListeners) {
    return 'underground';
  }
  if (followers >= tiers.buzzing.followers && monthlyListeners >= tiers.buzzing.monthlyListeners) {
    return 'buzzing';
  }
  if (followers >= tiers.local.followers && monthlyListeners >= tiers.local.monthlyListeners) {
    return 'local';
  }
  
  return 'unknown';
}

export function formatCareerTier(tier: Player['careerTier']): string {
  const labels: Record<Player['careerTier'], string> = {
    unknown: 'Unknown',
    local: 'Local Artist',
    buzzing: 'Buzzing',
    underground: 'Underground',
    breakout: 'Breakout',
    established: 'Established',
    star: 'Star',
    superstar: 'Superstar',
    icon: 'Icon',
  };
  return labels[tier];
}

export function getAttributeDescription(value: number): string {
  if (value >= 90) return 'Elite';
  if (value >= 75) return 'Excellent';
  if (value >= 60) return 'Strong';
  if (value >= 45) return 'Decent';
  if (value >= 30) return 'Developing';
  if (value >= 15) return 'Weak';
  return 'Poor';
}
