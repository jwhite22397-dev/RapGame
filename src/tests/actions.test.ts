import { describe, it, expect, beforeEach } from 'vitest';
import { SeededRNG, setGlobalRNG } from '../game/engine/rng';
import { performAction, releaseSong, canPerformAction } from '../game/engine/actions';
import { createPlayer } from '../game/engine/player';
import { generateProducers } from '../game/engine/generators';
import type { GameState, Genre, Archetype } from '../game/models/types';

describe('Actions', () => {
  let gameState: GameState;
  
  beforeEach(() => {
    const rng = new SeededRNG(42);
    setGlobalRNG(rng);
    
    gameState = {
      version: 1,
      seed: 42,
      currentWeek: 1,
      player: createPlayer({
        artistName: 'Test Artist',
        age: 21,
        genre: 'trap' as Genre,
        archetype: 'lyricist' as Archetype,
      }),
      songs: [],
      projects: [],
      producers: generateProducers(3),
      npcArtists: [],
      labels: [],
      labelOffers: [],
      showOffers: [],
      relationships: [],
      activeEvents: [],
      eventHistory: [],
      charts: { top100: [], rap50: [], underground100: [], trending25: [] },
      news: [],
      weeklyRecaps: [],
      careerTimeline: [],
    };
  });
  
  describe('canPerformAction', () => {
    it('should allow action with enough energy', () => {
      gameState.player.stats.energy = 100;
      const result = canPerformAction(gameState, 'write');
      expect(result.can).toBe(true);
    });
    
    it('should deny action without enough energy', () => {
      gameState.player.stats.energy = 10;
      const result = canPerformAction(gameState, 'record');
      expect(result.can).toBe(false);
      expect(result.reason).toContain('energy');
    });
    
    it('should always allow rest', () => {
      gameState.player.stats.energy = 0;
      const result = canPerformAction(gameState, 'rest');
      expect(result.can).toBe(true);
    });
  });
  
  describe('performAction - write', () => {
    it('should create a new song', () => {
      const { newState, result } = performAction(gameState, 'write');
      
      expect(result.success).toBe(true);
      expect(newState.songs.length).toBe(1);
      expect(newState.songs[0].status).toBe('writing');
    });
    
    it('should consume energy', () => {
      const initialEnergy = gameState.player.stats.energy;
      const { newState } = performAction(gameState, 'write');
      
      expect(newState.player.stats.energy).toBeLessThan(initialEnergy);
    });
    
    it('should improve writing attribute', () => {
      const initialWriting = gameState.player.attributes.writing;
      const { newState } = performAction(gameState, 'write');
      
      expect(newState.player.attributes.writing).toBeGreaterThan(initialWriting);
    });
  });
  
  describe('performAction - record', () => {
    it('should fail without a song to record', () => {
      const { result } = performAction(gameState, 'record');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('No song');
    });
    
    it('should record a song in writing status', () => {
      // First write a song
      const { newState: stateAfterWrite } = performAction(gameState, 'write');
      
      // Then record it
      const { newState, result } = performAction(stateAfterWrite, 'record');
      
      expect(result.success).toBe(true);
      expect(newState.songs[0].status).toBe('mixed');
    });
  });
  
  describe('performAction - rest', () => {
    it('should restore energy', () => {
      gameState.player.stats.energy = 30;
      const { newState } = performAction(gameState, 'rest');
      
      expect(newState.player.stats.energy).toBeGreaterThan(30);
    });
    
    it('should not exceed max energy', () => {
      gameState.player.stats.energy = 90;
      const { newState } = performAction(gameState, 'rest');
      
      expect(newState.player.stats.energy).toBeLessThanOrEqual(gameState.player.stats.maxEnergy);
    });
  });
  
  describe('performAction - workJob', () => {
    it('should earn money', () => {
      const initialCash = gameState.player.stats.cash;
      const { newState, result } = performAction(gameState, 'workJob');
      
      expect(result.success).toBe(true);
      expect(newState.player.stats.cash).toBeGreaterThan(initialCash);
    });
    
    it('should consume energy', () => {
      const initialEnergy = gameState.player.stats.energy;
      const { newState } = performAction(gameState, 'workJob');
      
      expect(newState.player.stats.energy).toBeLessThan(initialEnergy);
    });
    
    it('should update career earnings', () => {
      const initialEarnings = gameState.player.stats.careerEarnings;
      const { newState } = performAction(gameState, 'workJob');
      
      expect(newState.player.stats.careerEarnings).toBeGreaterThan(initialEarnings);
    });
  });
  
  describe('performAction - postContent', () => {
    it('should gain followers', () => {
      const initialFollowers = gameState.player.stats.followers;
      const { newState } = performAction(gameState, 'postContent', { contentType: 'snippet' });
      
      expect(newState.player.stats.followers).toBeGreaterThan(initialFollowers);
    });
    
    it('should increase hype', () => {
      const initialHype = gameState.player.stats.hype;
      const { newState } = performAction(gameState, 'postContent', { contentType: 'snippet' });
      
      expect(newState.player.stats.hype).toBeGreaterThan(initialHype);
    });
  });
  
  describe('releaseSong', () => {
    it('should fail for non-existent song', () => {
      const { success, message } = releaseSong(gameState, 'fake-id');
      
      expect(success).toBe(false);
      expect(message).toContain('not found');
    });
    
    it('should fail for song in writing status', () => {
      const { newState } = performAction(gameState, 'write');
      const songId = newState.songs[0].id;
      
      const { success } = releaseSong(newState, songId);
      
      expect(success).toBe(false);
    });
    
    it('should release a mixed song', () => {
      // Write and record a song
      let state = gameState;
      state = performAction(state, 'write').newState;
      state = performAction(state, 'record').newState;
      
      const songId = state.songs[0].id;
      const { newState, success } = releaseSong(state, songId);
      
      expect(success).toBe(true);
      expect(newState.songs[0].status).toBe('released');
      expect(newState.songs[0].releaseWeek).toBe(state.currentWeek);
    });
    
    it('should deduct marketing spend', () => {
      let state = gameState;
      state.player.stats.cash = 1000;
      state = performAction(state, 'write').newState;
      state = performAction(state, 'record').newState;
      
      const songId = state.songs[0].id;
      const { newState } = releaseSong(state, songId, { marketingSpend: 500 });
      
      expect(newState.player.stats.cash).toBeLessThan(1000);
      expect(newState.songs[0].marketingSpend).toBe(500);
    });
    
    it('should add to career timeline', () => {
      let state = gameState;
      state = performAction(state, 'write').newState;
      state = performAction(state, 'record').newState;
      
      const songId = state.songs[0].id;
      const initialTimelineLength = state.careerTimeline.length;
      
      const { newState } = releaseSong(state, songId);
      
      expect(newState.careerTimeline.length).toBeGreaterThan(initialTimelineLength);
    });
  });
});
