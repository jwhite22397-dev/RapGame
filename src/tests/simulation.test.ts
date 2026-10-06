import { describe, it, expect, beforeEach } from 'vitest';
import { SeededRNG, setGlobalRNG } from '../game/engine/rng';
import { initializeGameState, simulateWeek } from '../game/engine/simulation';
import { createPlayer } from '../game/engine/player';
import { generateNPCArtists, generateProducers } from '../game/engine/generators';
import { createLabelsFromTemplates } from '../game/data/labels';
import { initializeCharts } from '../game/engine/charts';
import type { GameState, Genre, Archetype } from '../game/models/types';

describe('Simulation', () => {
  let gameState: GameState;
  
  beforeEach(() => {
    const seed = 42;
    const rng = new SeededRNG(seed);
    setGlobalRNG(rng);
    
    gameState = initializeGameState(seed);
    gameState.player = createPlayer({
      artistName: 'Test Artist',
      age: 21,
      genre: 'trap' as Genre,
      archetype: 'lyricist' as Archetype,
    });
    gameState.npcArtists = generateNPCArtists(20);
    gameState.producers = generateProducers(5);
    gameState.labels = createLabelsFromTemplates();
    gameState.charts = initializeCharts(gameState.npcArtists);
  });
  
  describe('initializeGameState', () => {
    it('should create a game state with correct version', () => {
      const state = initializeGameState(12345);
      expect(state.version).toBe(1);
    });
    
    it('should store the seed', () => {
      const state = initializeGameState(12345);
      expect(state.seed).toBe(12345);
    });
    
    it('should start at week 0', () => {
      const state = initializeGameState(12345);
      expect(state.currentWeek).toBe(0);
    });
    
    it('should have empty arrays for collections', () => {
      const state = initializeGameState(12345);
      expect(state.songs).toEqual([]);
      expect(state.projects).toEqual([]);
      expect(state.activeEvents).toEqual([]);
    });
  });
  
  describe('simulateWeek', () => {
    it('should increment week counter', () => {
      const { newState } = simulateWeek(gameState);
      expect(newState.currentWeek).toBe(1);
    });
    
    it('should restore energy', () => {
      gameState.player.stats.energy = 20;
      const { newState } = simulateWeek(gameState);
      expect(newState.player.stats.energy).toBeGreaterThan(20);
    });
    
    it('should decay hype', () => {
      gameState.player.stats.hype = 50;
      const { newState } = simulateWeek(gameState);
      expect(newState.player.stats.hype).toBeLessThan(50);
    });
    
    it('should produce a weekly recap', () => {
      const { recap } = simulateWeek(gameState);
      expect(recap).toBeDefined();
      expect(recap.week).toBe(1);
      expect(typeof recap.streamsGained).toBe('number');
      expect(typeof recap.followersGained).toBe('number');
      expect(typeof recap.moneyEarned).toBe('number');
    });
    
    it('should update NPC artists', () => {
      const originalPopularities = gameState.npcArtists.map(a => a.popularity);
      const { newState } = simulateWeek(gameState);
      const newPopularities = newState.npcArtists.map(a => a.popularity);
      
      // At least some should have changed
      const changed = originalPopularities.some((p, i) => p !== newPopularities[i]);
      expect(changed).toBe(true);
    });
    
    it('should generate news', () => {
      const { newState } = simulateWeek(gameState);
      expect(newState.news.length).toBeGreaterThan(0);
    });
    
    it('should not crash with released songs', () => {
      // Add a released song
      gameState.songs.push({
        id: 'test-song',
        title: 'Test Song',
        createdWeek: 0,
        genre: 'trap',
        status: 'released',
        releaseWeek: 0,
        quality: 70,
        commercialAppeal: 60,
        virality: 50,
        replayability: 55,
        originality: 65,
        productionQuality: 70,
        lyricalQuality: 75,
        performanceQuality: 60,
        featureArtistId: null,
        featureArtistName: null,
        producerId: null,
        producerName: null,
        marketingSpend: 0,
        hasVideo: false,
        totalStreams: 0,
        weeklyStreams: 0,
        peakWeeklyStreams: 0,
        totalRevenue: 0,
        momentum: 1.0,
        chartHistory: [],
        peakChartPosition: null,
        weeksOnChart: 0,
        isViral: false,
        viralStage: 0,
      });
      
      expect(() => simulateWeek(gameState)).not.toThrow();
    });
    
    it('should calculate streams for released songs', () => {
      // Add a released song
      gameState.player.stats.followers = 10000;
      gameState.player.fanBase = {
        casual: 8000,
        followers: 1500,
        core: 400,
        superfans: 100,
      };
      
      gameState.songs.push({
        id: 'test-song',
        title: 'Test Song',
        createdWeek: 0,
        genre: 'trap',
        status: 'released',
        releaseWeek: 0,
        quality: 70,
        commercialAppeal: 60,
        virality: 50,
        replayability: 55,
        originality: 65,
        productionQuality: 70,
        lyricalQuality: 75,
        performanceQuality: 60,
        featureArtistId: null,
        featureArtistName: null,
        producerId: null,
        producerName: null,
        marketingSpend: 0,
        hasVideo: false,
        totalStreams: 0,
        weeklyStreams: 0,
        peakWeeklyStreams: 0,
        totalRevenue: 0,
        momentum: 1.0,
        chartHistory: [],
        peakChartPosition: null,
        weeksOnChart: 0,
        isViral: false,
        viralStage: 0,
      });
      
      const { newState, recap } = simulateWeek(gameState);
      
      expect(recap.streamsGained).toBeGreaterThan(0);
      expect(newState.songs[0].totalStreams).toBeGreaterThan(0);
    });
    
    it('should age player on birthday', () => {
      gameState.currentWeek = 51;
      const { newState } = simulateWeek(gameState);
      expect(newState.player.age).toBe(22);
    });
  });
});
