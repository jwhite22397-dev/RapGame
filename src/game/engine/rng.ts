// Seeded PRNG using xorshift128+ algorithm
// Deterministic random number generation for reproducible game states

export class SeededRNG {
  private state: [number, number, number, number];
  
  constructor(seed?: number) {
    const s = seed ?? Date.now();
    // Initialize state from seed using splitmix64
    this.state = [0, 0, 0, 0];
    let x = s;
    for (let i = 0; i < 4; i++) {
      x = Math.imul(x ^ (x >>> 30), 0x9e3779b9);
      x = (x ^ (x >>> 27)) >>> 0;
      this.state[i] = x >>> 0;
    }
    // Ensure non-zero state
    if (this.state.every(v => v === 0)) {
      this.state[0] = 1;
    }
  }
  
  // Get current state for serialization
  getState(): number[] {
    return [...this.state];
  }
  
  // Restore state from serialization
  setState(state: number[]): void {
    if (state.length === 4) {
      this.state = [state[0], state[1], state[2], state[3]];
    }
  }
  
  // Generate next random 32-bit integer
  private next(): number {
    let [s0, s1, s2, s3] = this.state;
    const result = (s0 + s3) >>> 0;
    const t = (s1 << 9) >>> 0;
    
    s2 ^= s0;
    s3 ^= s1;
    s1 ^= s2;
    s0 ^= s3;
    s2 ^= t;
    s3 = ((s3 << 11) | (s3 >>> 21)) >>> 0;
    
    this.state = [s0, s1, s2, s3];
    return result;
  }
  
  // Random float [0, 1)
  random(): number {
    return this.next() / 0x100000000;
  }
  
  // Random integer [min, max] inclusive
  int(min: number, max: number): number {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }
  
  // Random float [min, max)
  float(min: number, max: number): number {
    return this.random() * (max - min) + min;
  }
  
  // Random boolean with given probability
  chance(probability: number): boolean {
    return this.random() < probability;
  }
  
  // Pick random element from array
  pick<T>(array: T[]): T {
    return array[Math.floor(this.random() * array.length)];
  }
  
  // Shuffle array (Fisher-Yates)
  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(this.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  
  // Weighted random selection
  weightedPick<T>(items: T[], weights: number[]): T {
    const total = weights.reduce((a, b) => a + b, 0);
    let r = this.random() * total;
    for (let i = 0; i < items.length; i++) {
      r -= weights[i];
      if (r <= 0) return items[i];
    }
    return items[items.length - 1];
  }
  
  // Normal distribution (Box-Muller transform)
  normal(mean: number = 0, stdDev: number = 1): number {
    const u1 = this.random();
    const u2 = this.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z * stdDev + mean;
  }
  
  // Clamped normal distribution
  normalClamped(mean: number, stdDev: number, min: number, max: number): number {
    const value = this.normal(mean, stdDev);
    return Math.max(min, Math.min(max, value));
  }
  
  // Generate a unique ID
  id(): string {
    return this.next().toString(36) + this.next().toString(36);
  }
}

// Global RNG instance - will be initialized with game seed
let globalRNG: SeededRNG = new SeededRNG();

export function setGlobalRNG(rng: SeededRNG): void {
  globalRNG = rng;
}

export function getGlobalRNG(): SeededRNG {
  return globalRNG;
}

export function rng(): SeededRNG {
  return globalRNG;
}
