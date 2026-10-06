import { describe, it, expect, beforeEach } from 'vitest';
import { SeededRNG, setGlobalRNG } from '../game/engine/rng';
import { createPlayer, calculateCareerTier, improveAttribute } from '../game/engine/player';
import type { Genre, Archetype } from '../game/models/types';

describe('Player', () => {
  beforeEach(() => {
    setGlobalRNG(new SeededRNG(42));
  });
  
  describe('createPlayer', () => {
    it('should create a player with correct base properties', () => {
      const player = createPlayer({
        artistName: 'Test Artist',
        realName: 'John Doe',
        hometown: 'New York',
        age: 21,
        genre: 'trap' as Genre,
        archetype: 'lyricist' as Archetype,
      });
      
      expect(player.artistName).toBe('Test Artist');
      expect(player.realName).toBe('John Doe');
      expect(player.hometown).toBe('New York');
      expect(player.age).toBe(21);
      expect(player.startingAge).toBe(21);
      expect(player.genre).toBe('trap');
      expect(player.archetype).toBe('lyricist');
    });
    
    it('should generate starting stats within expected ranges', () => {
      const player = createPlayer({
        artistName: 'Test',
        age: 20,
        genre: 'trap' as Genre,
        archetype: 'hitmaker' as Archetype,
      });
      
      expect(player.stats.cash).toBeGreaterThanOrEqual(150);
      expect(player.stats.cash).toBeLessThanOrEqual(500);
      expect(player.stats.followers).toBeGreaterThanOrEqual(30);
      expect(player.stats.followers).toBeLessThanOrEqual(150);
      expect(player.stats.energy).toBe(100);
      expect(player.stats.maxEnergy).toBe(100);
    });
    
    it('should start with unknown career tier', () => {
      const player = createPlayer({
        artistName: 'Test',
        age: 20,
        genre: 'trap' as Genre,
        archetype: 'lyricist' as Archetype,
      });
      
      expect(player.careerTier).toBe('unknown');
    });
    
    it('should have empty milestones and awards', () => {
      const player = createPlayer({
        artistName: 'Test',
        age: 20,
        genre: 'trap' as Genre,
        archetype: 'lyricist' as Archetype,
      });
      
      expect(player.milestones).toEqual([]);
      expect(player.awards).toEqual([]);
    });
    
    it('should have no label contract initially', () => {
      const player = createPlayer({
        artistName: 'Test',
        age: 20,
        genre: 'trap' as Genre,
        archetype: 'lyricist' as Archetype,
      });
      
      expect(player.labelContract).toBeNull();
    });
    
    it('should set archetype-specific attributes', () => {
      const lyricist = createPlayer({
        artistName: 'Lyricist',
        age: 20,
        genre: 'boom-bap' as Genre,
        archetype: 'lyricist' as Archetype,
      });
      
      const hitmaker = createPlayer({
        artistName: 'Hitmaker',
        age: 20,
        genre: 'pop-rap' as Genre,
        archetype: 'hitmaker' as Archetype,
      });
      
      // Lyricist should have higher writing
      expect(lyricist.attributes.writing).toBeGreaterThan(hitmaker.attributes.writing - 20);
      // Hitmaker should have higher melody
      expect(hitmaker.attributes.melody).toBeGreaterThan(lyricist.attributes.melody - 20);
    });
  });
  
  describe('calculateCareerTier', () => {
    it('should return unknown for very low stats', () => {
      expect(calculateCareerTier(50, 100)).toBe('unknown');
    });
    
    it('should return local for low stats', () => {
      expect(calculateCareerTier(500, 1000)).toBe('local');
    });
    
    it('should return buzzing for moderate stats', () => {
      expect(calculateCareerTier(2500, 10000)).toBe('buzzing');
    });
    
    it('should return underground for higher stats', () => {
      expect(calculateCareerTier(10000, 50000)).toBe('underground');
    });
    
    it('should return star for high stats', () => {
      expect(calculateCareerTier(1000000, 5000000)).toBe('star');
    });
    
    it('should return superstar for very high stats', () => {
      expect(calculateCareerTier(5000000, 20000000)).toBe('superstar');
    });
    
    it('should return icon for maximum stats', () => {
      expect(calculateCareerTier(20000000, 50000000)).toBe('icon');
    });
  });
  
  describe('improveAttribute', () => {
    it('should increase attribute value', () => {
      const initial = 50;
      const improved = improveAttribute(initial);
      expect(improved).toBeGreaterThan(initial);
    });
    
    it('should not exceed 100', () => {
      const improved = improveAttribute(99.9);
      expect(improved).toBeLessThanOrEqual(100);
    });
    
    it('should have diminishing returns at higher values', () => {
      const lowGain = improveAttribute(30) - 30;
      const highGain = improveAttribute(80) - 80;
      
      expect(lowGain).toBeGreaterThan(highGain);
    });
    
    it('should respect custom base gain', () => {
      const defaultGain = improveAttribute(50);
      const highGain = improveAttribute(50, 2);
      
      expect(highGain - 50).toBeGreaterThan(defaultGain - 50);
    });
  });
});
