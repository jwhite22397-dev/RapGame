// Content generators for NPCs, songs, labels, etc.

import type { 
  NPCArtist, Producer, Genre, NPCCareerTier,
  Player, LabelOffer, ShowOffer, VenueType
} from '../models/types';
import { rng } from './rng';
import { BALANCE } from '../balance/constants';
import {
  ARTIST_PREFIXES, ARTIST_NAMES_SINGLE, ARTIST_NAMES_COMPOUND,
  FIRST_NAMES, LAST_NAMES, CITIES, PRODUCER_NAMES,
  SONG_TITLE_WORDS, VENUE_NAMES
} from '../data/names';
import { GENRES } from '../data/genres';
import { LABEL_TEMPLATES } from '../data/labels';

export function generateArtistName(): string {
  const r = rng();
  const style = r.int(0, 4);
  
  switch (style) {
    case 0: // Single word
      return r.pick(ARTIST_NAMES_SINGLE);
    case 1: // Prefix + Name
      return `${r.pick(ARTIST_PREFIXES)} ${r.pick(ARTIST_NAMES_SINGLE)}`;
    case 2: // First name only
      return r.pick(FIRST_NAMES);
    case 3: // Two compound words
      return `${r.pick(ARTIST_NAMES_SINGLE)}${r.pick(ARTIST_NAMES_COMPOUND)}`;
    case 4: { // Initials + Name
      const first = r.pick(FIRST_NAMES);
      return `${first[0]}. ${r.pick(LAST_NAMES)}`;
    }
    default:
      return r.pick(ARTIST_NAMES_SINGLE);
  }
}

export function generateRealName(): string {
  const r = rng();
  return `${r.pick(FIRST_NAMES)} ${r.pick(LAST_NAMES)}`;
}

export function generateCity(): string {
  return rng().pick(CITIES);
}

export function generateSongTitle(): string {
  const r = rng();
  const style = r.int(0, 5);
  const words = SONG_TITLE_WORDS;
  
  switch (style) {
    case 0: // Single noun
      return r.pick(words.nouns);
    case 1: // Adjective + Noun
      return `${r.pick(words.adjectives)} ${r.pick(words.nouns)}`;
    case 2: // Verb
      return r.pick(words.verbs);
    case 3: // Phrase
      return r.pick(words.phrases);
    case 4: // Noun + Noun
      return `${r.pick(words.nouns)} ${r.pick(words.nouns)}`;
    case 5: // The + Noun
      return `The ${r.pick(words.nouns)}`;
    default:
      return r.pick(words.nouns);
  }
}

export function generateNPCArtist(targetTier?: NPCCareerTier): NPCArtist {
  const r = rng();
  const genres = Object.keys(GENRES) as Genre[];
  
  const tier = targetTier || r.weightedPick<NPCCareerTier>(
    ['local', 'underground', 'rising', 'established', 'superstar', 'icon'],
    [30, 25, 20, 15, 8, 2]
  );
  
  const tierPopularity: Record<NPCCareerTier, [number, number]> = {
    local: [100, 5000],
    underground: [5000, 50000],
    rising: [50000, 250000],
    established: [250000, 2000000],
    superstar: [2000000, 20000000],
    icon: [20000000, 100000000],
  };
  
  const [minPop, maxPop] = tierPopularity[tier];
  const popularity = r.int(minPop, maxPop);
  
  const featurePrices = BALANCE.features[tier];
  const featurePrice = r.int(featurePrices.min, featurePrices.max);
  
  return {
    id: r.id(),
    name: generateArtistName(),
    age: r.int(18, 45),
    genre: r.pick(genres),
    careerTier: tier,
    popularity,
    hype: r.int(10, 80),
    reputation: r.int(20, 90),
    featurePrice,
    willingness: r.int(20, 80),
    personality: r.pick(['friendly', 'neutral', 'difficult', 'mysterious']),
    relationshipWithPlayer: 0,
    isActive: true,
    careerMomentum: r.float(-0.1, 0.1),
  };
}

export function generateProducer(tier?: 'unknown' | 'developing' | 'established' | 'hot' | 'elite'): Producer {
  const r = rng();
  const genres = Object.keys(GENRES) as Genre[];
  
  const producerTier = tier || r.weightedPick(
    ['unknown', 'developing', 'established', 'hot', 'elite'] as const,
    [25, 30, 25, 15, 5]
  );
  
  const tierQuality = {
    unknown: [30, 50],
    developing: [45, 65],
    established: [60, 80],
    hot: [75, 90],
    elite: [85, 98],
  };
  
  const [minQ, maxQ] = tierQuality[producerTier];
  const priceRange = BALANCE.producers[producerTier];
  
  return {
    id: r.id(),
    name: r.pick(PRODUCER_NAMES),
    quality: r.int(minQ, maxQ),
    style: r.shuffle(genres).slice(0, r.int(1, 3)),
    basePrice: r.int(priceRange.min, priceRange.max),
    popularity: producerTier === 'elite' ? r.int(80, 100) : 
                producerTier === 'hot' ? r.int(60, 85) :
                producerTier === 'established' ? r.int(40, 65) :
                producerTier === 'developing' ? r.int(20, 45) : r.int(5, 25),
    chemistry: 0,
  };
}

export function generateSongQuality(
  player: Player,
  producer?: Producer,
  isCollab: boolean = false
): {
  quality: number;
  commercialAppeal: number;
  virality: number;
  replayability: number;
  originality: number;
  productionQuality: number;
  lyricalQuality: number;
  performanceQuality: number;
} {
  const r = rng();
  const attrs = player.attributes;
  const b = BALANCE.songQuality;
  
  // Base quality from attributes
  const writingBase = attrs.writing * 0.3 + attrs.flow * 0.2;
  const melodyBase = attrs.melody * 0.25;
  const performanceBase = attrs.performance * 0.15;
  const productionBase = (producer?.quality || attrs.productionKnowledge) * 0.3;
  
  // Experience bonus (caps out)
  const songsReleased = player.milestones.filter(m => m.includes('songs-')).length;
  const expBonus = Math.min(songsReleased * b.experienceBonus, b.maxExperienceBonus);
  
  // Chemistry bonus with producer
  const chemistryBonus = producer ? (producer.chemistry / 100) * 0.1 : 0;
  
  // Collaboration bonus
  const collabBonus = isCollab ? b.collaborationBonus : 0;
  
  // Random variance
  const variance = r.normal(0, 10);
  
  // Calculate final qualities
  const baseQuality = (writingBase + melodyBase + performanceBase + productionBase) / 100;
  const finalMultiplier = 1 + expBonus + chemistryBonus + collabBonus;
  
  const clamp = (v: number) => Math.max(0, Math.min(100, v));
  
  return {
    quality: clamp((baseQuality * 100 * finalMultiplier) + variance),
    commercialAppeal: clamp(
      (attrs.melody * 0.4 + attrs.marketing * 0.2 + r.int(0, 40)) * finalMultiplier
    ),
    virality: clamp(
      (attrs.charisma * 0.3 + attrs.marketing * 0.2 + r.int(0, 50)) * finalMultiplier
    ),
    replayability: clamp(
      (attrs.melody * 0.4 + attrs.flow * 0.3 + r.int(0, 30)) * finalMultiplier
    ),
    originality: clamp(
      (attrs.writing * 0.4 + attrs.productionKnowledge * 0.3 + r.int(0, 30)) * finalMultiplier
    ),
    productionQuality: clamp(
      (producer?.quality || attrs.productionKnowledge) + r.int(-10, 10)
    ),
    lyricalQuality: clamp(
      attrs.writing * 0.7 + attrs.flow * 0.3 + r.int(-10, 10)
    ),
    performanceQuality: clamp(
      attrs.performance * 0.5 + attrs.flow * 0.3 + attrs.charisma * 0.2 + r.int(-10, 10)
    ),
  };
}

export function generateLabelOffer(
  player: Player,
  currentWeek: number
): LabelOffer | null {
  const r = rng();
  const b = BALANCE.labels;
  
  // Check if player qualifies for any label interest
  const eligibleLabels = LABEL_TEMPLATES.filter(label => {
    const req = b[label.type as keyof typeof b];
    if (!req) return false;
    return player.stats.followers >= req.followers && player.stats.hype >= req.hype;
  });
  
  if (eligibleLabels.length === 0) return null;
  
  // Pick a random eligible label
  const template = r.pick(eligibleLabels);
  
  // Generate offer terms
  const advance = r.int(template.advanceRange[0], template.advanceRange[1]);
  const royalty = r.int(template.royaltyRange[0], template.royaltyRange[1]);
  const marketing = r.int(template.marketingRange[0], template.marketingRange[1]);
  
  // Better deals for higher reputation
  const repBonus = player.reputation.industryRespect / 100;
  const adjustedRoyalty = Math.min(royalty + Math.floor(repBonus * 10), 70);
  
  return {
    id: r.id(),
    labelId: `label-${LABEL_TEMPLATES.indexOf(template)}`,
    labelName: template.name,
    advance,
    royaltyPercent: adjustedRoyalty,
    albumsRequired: r.int(2, 4),
    masterOwnership: template.type === 'artist-friendly' ? 'artist' :
                     template.type === 'aggressive' ? 'label' : 'split',
    marketingCommitment: marketing,
    recoupable: template.type !== 'artist-friendly',
    expiresWeek: currentWeek + r.int(2, 4),
  };
}

export function generateShowOffer(
  player: Player,
  currentWeek: number
): ShowOffer | null {
  const r = rng();
  const b = BALANCE.shows;
  
  // Determine eligible venue types based on career tier
  const tierVenues: Record<string, VenueType[]> = {
    unknown: ['open-mic'],
    local: ['open-mic', 'local-club'],
    buzzing: ['local-club', 'small-venue'],
    underground: ['local-club', 'small-venue', 'theater'],
    breakout: ['small-venue', 'theater', 'festival'],
    established: ['theater', 'arena', 'festival'],
    star: ['arena', 'festival', 'stadium'],
    superstar: ['arena', 'festival', 'stadium'],
    icon: ['arena', 'festival', 'stadium'],
  };
  
  const eligibleTypes = tierVenues[player.careerTier] || ['open-mic'];
  const venueType = r.pick(eligibleTypes);
  const venueData = b[venueType];
  
  // Calculate pay based on popularity
  const popMultiplier = Math.min(player.stats.followers / 10000, 10);
  const pay = Math.floor(
    r.int(venueData.basePay, venueData.maxPay) * (1 + popMultiplier * 0.1)
  );
  
  const energyCosts: Record<VenueType, number> = {
    'open-mic': 25,
    'local-club': 35,
    'small-venue': 40,
    'theater': 50,
    'arena': 60,
    'festival': 55,
    'stadium': 65,
  };
  
  return {
    id: r.id(),
    venueId: r.id(),
    venueName: r.pick(VENUE_NAMES),
    venueType,
    city: generateCity(),
    pay,
    week: currentWeek + r.int(1, 3),
    energyCost: energyCosts[venueType],
    expiresWeek: currentWeek + 1,
  };
}

export function generateNPCArtists(count: number): NPCArtist[] {
  const artists: NPCArtist[] = [];
  const tiers: NPCCareerTier[] = ['local', 'underground', 'rising', 'established', 'superstar', 'icon'];
  
  // Ensure good distribution
  const distribution = {
    local: Math.floor(count * 0.25),
    underground: Math.floor(count * 0.25),
    rising: Math.floor(count * 0.2),
    established: Math.floor(count * 0.15),
    superstar: Math.floor(count * 0.1),
    icon: Math.floor(count * 0.05),
  };
  
  for (const tier of tiers) {
    for (let i = 0; i < distribution[tier]; i++) {
      artists.push(generateNPCArtist(tier));
    }
  }
  
  return artists;
}

export function generateProducers(count: number): Producer[] {
  const producers: Producer[] = [];
  const tiers = ['unknown', 'developing', 'established', 'hot', 'elite'] as const;
  
  const distribution = {
    unknown: Math.floor(count * 0.3),
    developing: Math.floor(count * 0.3),
    established: Math.floor(count * 0.2),
    hot: Math.floor(count * 0.15),
    elite: Math.floor(count * 0.05),
  };
  
  for (const tier of tiers) {
    for (let i = 0; i < distribution[tier]; i++) {
      producers.push(generateProducer(tier));
    }
  }
  
  return producers;
}

export function generateChartSong(
  npc: NPCArtist,
  basePosition: number
): { artistName: string; songTitle: string; streams: number } {
  const r = rng();
  
  // Estimate streams based on position
  const maxStreams = 50000000;
  const positionFactor = Math.pow(0.95, basePosition - 1);
  const streams = Math.floor(maxStreams * positionFactor * r.float(0.7, 1.3));
  
  return {
    artistName: npc.name,
    songTitle: generateSongTitle(),
    streams,
  };
}
