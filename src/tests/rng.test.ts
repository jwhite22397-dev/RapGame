import { describe, it, expect } from 'vitest';
import { SeededRNG } from '../game/engine/rng';

describe('SeededRNG', () => {
  it('should produce deterministic results with the same seed', () => {
    const rng1 = new SeededRNG(12345);
    const rng2 = new SeededRNG(12345);
    
    for (let i = 0; i < 100; i++) {
      expect(rng1.random()).toBe(rng2.random());
    }
  });
  
  it('should produce different results with different seeds', () => {
    const rng1 = new SeededRNG(12345);
    const rng2 = new SeededRNG(54321);
    
    const results1 = Array.from({ length: 10 }, () => rng1.random());
    const results2 = Array.from({ length: 10 }, () => rng2.random());
    
    expect(results1).not.toEqual(results2);
  });
  
  it('should produce values in range [0, 1) with random()', () => {
    const rng = new SeededRNG(42);
    
    for (let i = 0; i < 1000; i++) {
      const value = rng.random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
  
  it('should produce integers in range [min, max] with int()', () => {
    const rng = new SeededRNG(42);
    
    for (let i = 0; i < 1000; i++) {
      const value = rng.int(5, 10);
      expect(value).toBeGreaterThanOrEqual(5);
      expect(value).toBeLessThanOrEqual(10);
      expect(Number.isInteger(value)).toBe(true);
    }
  });
  
  it('should pick elements from array', () => {
    const rng = new SeededRNG(42);
    const array = ['a', 'b', 'c', 'd', 'e'];
    
    for (let i = 0; i < 100; i++) {
      const picked = rng.pick(array);
      expect(array).toContain(picked);
    }
  });
  
  it('should shuffle array differently than original', () => {
    const rng = new SeededRNG(42);
    const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const shuffled = rng.shuffle(array);
    
    // Should be different order
    expect(shuffled).not.toEqual(array);
    // Should contain same elements
    expect(shuffled.sort()).toEqual(array.sort());
  });
  
  it('should save and restore state', () => {
    const rng = new SeededRNG(42);
    
    // Generate some values
    rng.random();
    rng.random();
    rng.random();
    
    // Save state
    const state = rng.getState();
    
    // Generate more values
    const next1 = rng.random();
    const next2 = rng.random();
    
    // Restore state
    rng.setState(state);
    
    // Should get same values
    expect(rng.random()).toBe(next1);
    expect(rng.random()).toBe(next2);
  });
  
  it('should respect probability in chance()', () => {
    const rng = new SeededRNG(42);
    
    // 100% chance should always be true
    for (let i = 0; i < 100; i++) {
      expect(rng.chance(1)).toBe(true);
    }
    
    // 0% chance should always be false
    for (let i = 0; i < 100; i++) {
      expect(rng.chance(0)).toBe(false);
    }
  });
  
  it('should generate unique IDs', () => {
    const rng = new SeededRNG(42);
    const ids = new Set<string>();
    
    for (let i = 0; i < 1000; i++) {
      ids.add(rng.id());
    }
    
    // All IDs should be unique
    expect(ids.size).toBe(1000);
  });
});
