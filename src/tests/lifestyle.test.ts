import { describe, it, expect, beforeEach } from 'vitest';
import { SeededRNG, setGlobalRNG } from '../game/engine/rng';
import { createPlayer } from '../game/engine/player';
import { performAction } from '../game/engine/actions';
import { buyLifestyleItem, recordEnergyFor, scrapSong } from '../game/engine/lifestyle';
import type { GameState, Genre, Archetype } from '../game/models/types';

function freshState(): GameState {
  return {
    version: 2,
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
    producers: [],
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
}

describe('Lifestyle and catalog', () => {
  beforeEach(() => {
    setGlobalRNG(new SeededRNG(42));
  });

  it('scraps unreleased songs', () => {
    let state = freshState();
    state = performAction(state, 'write').newState;
    const songId = state.songs[0].id;

    const { newState, success } = scrapSong(state, songId);
    expect(success).toBe(true);
    expect(newState.songs).toHaveLength(0);
  });

  it('does not scrap released songs', () => {
    let state = freshState();
    state = performAction(state, 'write').newState;
    state = performAction(state, 'record').newState;
    const songId = state.songs[0].id;
    state.songs[0].status = 'released';

    const { success } = scrapSong(state, songId);
    expect(success).toBe(false);
  });

  it('blocks writing after the unreleased cap', () => {
    let state = freshState();
    for (let i = 0; i < 8; i++) {
      state.player.stats.energy = 100;
      state = performAction(state, 'write').newState;
    }
    expect(state.songs).toHaveLength(8);

    state.player.stats.energy = 100;
    const { result } = performAction(state, 'write');
    expect(result.success).toBe(false);
  });

  it('home studio reduces record energy', () => {
    const state = freshState();
    state.player.stats.cash = 10000;
    const before = recordEnergyFor(state);

    const bought = buyLifestyleItem(state, 'home-studio');
    expect(bought.success).toBe(true);
    expect(recordEnergyFor(bought.newState)).toBeLessThan(before);
    expect(bought.newState.player.lifestyle.studioTier).toBe(1);
  });

  it('gold chain changes jewelry appearance', () => {
    const state = freshState();
    state.player.stats.cash = 2000;
    const { newState, success } = buyLifestyleItem(state, 'gold-chain');
    expect(success).toBe(true);
    expect(newState.player.appearance.jewelry).toBe('chain');
    expect(newState.player.lifestyle.ownedItemIds).toContain('gold-chain');
  });
});
