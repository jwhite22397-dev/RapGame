import type { Genre } from '../models/types';

export interface GenreData {
  id: Genre;
  name: string;
  description: string;
  popularity: number; // 0-100, affects baseline commercial potential
  undergroundCred: number; // 0-100
  crossoverPotential: number; // 0-100
}

export const GENRES: Record<Genre, GenreData> = {
  trap: {
    id: 'trap',
    name: 'Trap',
    description: 'Hard-hitting 808s and aggressive flows.',
    popularity: 85,
    undergroundCred: 50,
    crossoverPotential: 75,
  },
  'melodic-rap': {
    id: 'melodic-rap',
    name: 'Melodic Rap',
    description: 'Melody-driven hooks with emotional delivery.',
    popularity: 90,
    undergroundCred: 40,
    crossoverPotential: 90,
  },
  'boom-bap': {
    id: 'boom-bap',
    name: 'Boom Bap',
    description: 'Classic sample-based production and lyrical focus.',
    popularity: 45,
    undergroundCred: 95,
    crossoverPotential: 30,
  },
  alternative: {
    id: 'alternative',
    name: 'Alternative Hip-Hop',
    description: 'Genre-bending sounds that defy convention.',
    popularity: 55,
    undergroundCred: 80,
    crossoverPotential: 60,
  },
  drill: {
    id: 'drill',
    name: 'Drill',
    description: 'Dark, sliding beats with aggressive energy.',
    popularity: 75,
    undergroundCred: 70,
    crossoverPotential: 65,
  },
  'pop-rap': {
    id: 'pop-rap',
    name: 'Pop Rap',
    description: 'Radio-ready crossover appeal.',
    popularity: 95,
    undergroundCred: 20,
    crossoverPotential: 100,
  },
  experimental: {
    id: 'experimental',
    name: 'Experimental',
    description: 'Avant-garde sounds pushing sonic boundaries.',
    popularity: 25,
    undergroundCred: 90,
    crossoverPotential: 20,
  },
  'rnb-rap': {
    id: 'rnb-rap',
    name: 'R&B/Rap',
    description: 'Smooth vocals blended with hip-hop production.',
    popularity: 80,
    undergroundCred: 45,
    crossoverPotential: 85,
  },
};

export const GENRE_LIST = Object.values(GENRES);
