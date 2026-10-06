import type { Archetype, PlayerAttributes } from '../models/types';

export interface ArchetypeData {
  id: Archetype;
  name: string;
  description: string;
  startingAttributes: PlayerAttributes;
  strengths: string[];
  weaknesses: string[];
}

export const ARCHETYPES: Record<Archetype, ArchetypeData> = {
  lyricist: {
    id: 'lyricist',
    name: 'Lyricist',
    description: 'You prioritize wordplay, storytelling, and technical skill above all else.',
    startingAttributes: {
      writing: 65,
      flow: 55,
      melody: 30,
      performance: 35,
      productionKnowledge: 40,
      marketing: 25,
      networking: 30,
      business: 25,
      workEthic: 50,
      charisma: 35,
    },
    strengths: ['Underground credibility', 'Critical acclaim', 'Loyal fanbase'],
    weaknesses: ['Slower commercial growth', 'Less viral potential'],
  },
  performer: {
    id: 'performer',
    name: 'Performer',
    description: 'The stage is your home. Live shows are where you truly shine.',
    startingAttributes: {
      writing: 40,
      flow: 50,
      melody: 45,
      performance: 70,
      productionKnowledge: 30,
      marketing: 35,
      networking: 45,
      business: 25,
      workEthic: 45,
      charisma: 60,
    },
    strengths: ['Strong live presence', 'Fan loyalty', 'Higher show income'],
    weaknesses: ['Studio recordings feel flat', 'Need to tour constantly'],
  },
  hitmaker: {
    id: 'hitmaker',
    name: 'Hitmaker',
    description: 'You have an ear for what people want to hear on repeat.',
    startingAttributes: {
      writing: 40,
      flow: 45,
      melody: 65,
      performance: 40,
      productionKnowledge: 50,
      marketing: 45,
      networking: 35,
      business: 30,
      workEthic: 40,
      charisma: 45,
    },
    strengths: ['Higher commercial appeal', 'Playlist potential', 'Mainstream crossover'],
    weaknesses: ['Critics may dismiss you', 'Pressure to repeat success'],
  },
  hustler: {
    id: 'hustler',
    name: 'Hustler',
    description: 'You treat music like a business from day one.',
    startingAttributes: {
      writing: 35,
      flow: 40,
      melody: 35,
      performance: 40,
      productionKnowledge: 35,
      marketing: 60,
      networking: 55,
      business: 65,
      workEthic: 55,
      charisma: 50,
    },
    strengths: ['Better deals', 'Industry connections', 'Smart investments'],
    weaknesses: ['May sacrifice art for commerce', 'Authenticity questioned'],
  },
  'internet-kid': {
    id: 'internet-kid',
    name: 'Internet Kid',
    description: 'You grew up online. You understand how content spreads.',
    startingAttributes: {
      writing: 40,
      flow: 40,
      melody: 50,
      performance: 30,
      productionKnowledge: 45,
      marketing: 65,
      networking: 40,
      business: 35,
      workEthic: 35,
      charisma: 55,
    },
    strengths: ['Viral potential', 'Social media growth', 'Trend awareness'],
    weaknesses: ['Live shows challenging', 'Attention can be fickle'],
  },
  visionary: {
    id: 'visionary',
    name: 'Visionary',
    description: 'You push boundaries and create sounds no one else is making.',
    startingAttributes: {
      writing: 55,
      flow: 45,
      melody: 50,
      performance: 35,
      productionKnowledge: 60,
      marketing: 30,
      networking: 35,
      business: 25,
      workEthic: 45,
      charisma: 40,
    },
    strengths: ['Critical acclaim', 'Originality bonus', 'Cult following potential'],
    weaknesses: ['Commercial appeal harder', 'May be "too different"'],
  },
};

export const ARCHETYPE_LIST = Object.values(ARCHETYPES);
