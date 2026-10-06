// Main game state store using Zustand

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { Appearance, GameState, Genre, Archetype } from '@/game/models/types';
import { SeededRNG, setGlobalRNG } from '@/game/engine/rng';
import { createPlayer } from '@/game/engine/player';
import { initializeGameState, simulateWeek } from '@/game/engine/simulation';
import { performAction, releaseSong, resolveEvent, ActionType } from '@/game/engine/actions';
import { initializeCharts } from '@/game/engine/charts';
import { generateNPCArtists, generateProducers, generateShowOffer } from '@/game/engine/generators';
import { createLabelsFromTemplates } from '@/game/data/labels';
import { saveGame, loadGame, exportSave, importSave, hasAutosave } from '@/game/services/save';
import {
  buyLifestyleItem,
  endRelationship as endDating,
  goOnDate as simulateDate,
  performShow,
  scrapSong as scrapSongFromCatalog,
  type DateResult,
  type ShowResult,
} from '@/game/engine/lifestyle';

export type GameScreen = 
  | 'loading'
  | 'title'
  | 'new-career'
  | 'home'
  | 'career'
  | 'music'
  | 'social'
  | 'money'
  | 'song-detail'
  | 'studio'
  | 'event'
  | 'charts'
  | 'weekly-recap'
  | 'settings'
  | 'lifestyle'
  | 'performance'
  | 'date-night';

export interface UIState {
  currentScreen: GameScreen;
  selectedSongId: string | null;
  selectedEventId: string | null;
  isLoading: boolean;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showDevPanel: boolean;
  activeTab: 'home' | 'career' | 'music' | 'social' | 'money';
  lastShowResult: ShowResult | null;
  lastDateResult: DateResult | null;
}

interface GameStore {
  // Game state
  gameState: GameState | null;
  hasExistingSave: boolean;
  
  // UI state
  ui: UIState;
  
  // Actions
  initGame: () => Promise<void>;
  startNewCareer: (options: {
    artistName: string;
    realName?: string;
    hometown?: string;
    age: number;
    genre: Genre;
    archetype: Archetype;
    appearance?: Appearance;
  }) => void;
  loadExistingGame: () => Promise<boolean>;
  saveCurrentGame: () => Promise<boolean>;
  
  // Game actions
  endWeek: () => void;
  performAction: (action: ActionType, options?: Record<string, unknown>) => void;
  releaseSong: (songId: string, marketingSpend?: number) => void;
  scrapSong: (songId: string) => void;
  buyItem: (itemId: string) => void;
  bookShow: (offerId?: string) => void;
  goOnDate: () => void;
  endRelationship: () => void;
  resolveEvent: (eventId: string, choiceId: string) => void;
  
  // UI actions
  setScreen: (screen: GameScreen) => void;
  setActiveTab: (tab: UIState['activeTab']) => void;
  selectSong: (songId: string | null) => void;
  selectEvent: (eventId: string | null) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  clearToast: () => void;
  toggleDevPanel: () => void;
  
  // Export/Import
  exportGame: () => string | null;
  importGame: (json: string) => boolean;
  
  // Dev tools
  devAddCash: (amount: number) => void;
  devAddFollowers: (amount: number) => void;
  devSetHype: (amount: number) => void;
  devForceEvent: () => void;
}

export const useGameStore = create<GameStore>()(
  subscribeWithSelector((set, get) => ({
    gameState: null,
    hasExistingSave: false,
    
    ui: {
      currentScreen: 'loading',
      selectedSongId: null,
      selectedEventId: null,
      isLoading: true,
      toast: null,
      showDevPanel: false,
      activeTab: 'home',
      lastShowResult: null,
      lastDateResult: null,
    },
    
    initGame: async () => {
      const hasSave = await hasAutosave();
      set({ 
        hasExistingSave: hasSave,
        ui: { ...get().ui, currentScreen: 'title', isLoading: false }
      });
    },
    
    startNewCareer: (options) => {
      const seed = Date.now();
      const rngInstance = new SeededRNG(seed);
      setGlobalRNG(rngInstance);
      
      // Initialize game state
      const state = initializeGameState(seed);
      
      // Create player
      state.player = createPlayer(options);
      
      // Generate world
      state.npcArtists = generateNPCArtists(40);
      state.producers = generateProducers(12);
      state.labels = createLabelsFromTemplates();
      state.charts = initializeCharts(state.npcArtists);
      const firstShow = generateShowOffer(state.player, 0);
      if (firstShow) {
        firstShow.expiresWeek = 3;
        state.showOffers.push(firstShow);
      }
      
      // Add starting timeline entry
      state.careerTimeline.push({
        week: 0,
        age: state.player.age,
        event: 'Started music career',
        type: 'milestone',
      });
      
      set({ 
        gameState: state,
        ui: { ...get().ui, currentScreen: 'home', activeTab: 'home' }
      });
      
      // Autosave
      saveGame(state);
    },
    
    loadExistingGame: async () => {
      const state = await loadGame();
      if (state) {
        set({ 
          gameState: state,
          ui: { ...get().ui, currentScreen: 'home', activeTab: 'home' }
        });
        return true;
      }
      return false;
    },
    
    saveCurrentGame: async () => {
      const { gameState } = get();
      if (gameState) {
        return await saveGame(gameState);
      }
      return false;
    },
    
    endWeek: () => {
      const { gameState } = get();
      if (!gameState) return;
      
      const { newState } = simulateWeek(gameState);
      
      set({ 
        gameState: newState,
        ui: { ...get().ui, currentScreen: 'weekly-recap' }
      });
      
      // Autosave after each week
      saveGame(newState);
    },
    
    performAction: (action, options) => {
      const { gameState } = get();
      if (!gameState) return;
      
      const { newState, result } = performAction(gameState, action, options);
      
      set({ gameState: newState });
      
      if (result.success) {
        get().showToast(result.message, 'success');
      } else {
        get().showToast(result.message, 'error');
      }
    },
    
    releaseSong: (songId, marketingSpend = 0) => {
      const { gameState } = get();
      if (!gameState) return;
      
      const { newState, success, message } = releaseSong(gameState, songId, { marketingSpend });
      
      set({ gameState: newState });
      get().showToast(message, success ? 'success' : 'error');
      
      if (success) {
        saveGame(newState);
      }
    },

    scrapSong: (songId) => {
      const { gameState } = get();
      if (!gameState) return;
      const { newState, success, message } = scrapSongFromCatalog(gameState, songId);
      set({ gameState: newState });
      get().showToast(message, success ? 'success' : 'error');
      if (success) saveGame(newState);
    },

    buyItem: (itemId) => {
      const { gameState } = get();
      if (!gameState) return;
      const { newState, success, message } = buyLifestyleItem(gameState, itemId);
      set({ gameState: newState });
      get().showToast(message, success ? 'success' : 'error');
      if (success) saveGame(newState);
    },

    bookShow: (offerId) => {
      const { gameState } = get();
      if (!gameState) return;
      const { newState, success, message, result } = performShow(gameState, offerId);
      set({
        gameState: newState,
        ui: {
          ...get().ui,
          lastShowResult: result ?? null,
          currentScreen: success && result ? 'performance' : get().ui.currentScreen,
        },
      });
      if (!success) get().showToast(message, 'error');
      if (success) saveGame(newState);
    },

    goOnDate: () => {
      const { gameState } = get();
      if (!gameState) return;
      const { newState, success, message, result } = simulateDate(gameState);
      set({
        gameState: newState,
        ui: {
          ...get().ui,
          lastDateResult: result ?? null,
          currentScreen: success && result ? 'date-night' : get().ui.currentScreen,
        },
      });
      if (!success) get().showToast(message, 'error');
      if (success) saveGame(newState);
    },

    endRelationship: () => {
      const { gameState } = get();
      if (!gameState) return;
      const { newState, success, message } = endDating(gameState);
      set({ gameState: newState });
      get().showToast(message, success ? 'info' : 'error');
      if (success) saveGame(newState);
    },
    
    resolveEvent: (eventId, choiceId) => {
      const { gameState } = get();
      if (!gameState) return;
      
      const { newState, success } = resolveEvent(gameState, eventId, choiceId);
      
      set({ gameState: newState });
      
      if (success) {
        set({ ui: { ...get().ui, selectedEventId: null, currentScreen: 'home' } });
      }
    },
    
    setScreen: (screen) => {
      set({ ui: { ...get().ui, currentScreen: screen } });
    },
    
    setActiveTab: (tab) => {
      const screenMap: Record<UIState['activeTab'], GameScreen> = {
        home: 'home',
        career: 'career',
        music: 'music',
        social: 'social',
        money: 'money',
      };
      set({ ui: { ...get().ui, activeTab: tab, currentScreen: screenMap[tab] } });
    },
    
    selectSong: (songId) => {
      set({ 
        ui: { 
          ...get().ui, 
          selectedSongId: songId,
          currentScreen: songId ? 'song-detail' : get().ui.currentScreen
        } 
      });
    },
    
    selectEvent: (eventId) => {
      set({ 
        ui: { 
          ...get().ui, 
          selectedEventId: eventId,
          currentScreen: eventId ? 'event' : get().ui.currentScreen
        } 
      });
    },
    
    showToast: (message, type = 'info') => {
      set({ ui: { ...get().ui, toast: { message, type } } });
      setTimeout(() => get().clearToast(), 3000);
    },
    
    clearToast: () => {
      set({ ui: { ...get().ui, toast: null } });
    },
    
    toggleDevPanel: () => {
      set({ ui: { ...get().ui, showDevPanel: !get().ui.showDevPanel } });
    },
    
    exportGame: () => {
      const { gameState } = get();
      if (!gameState) return null;
      return exportSave(gameState);
    },
    
    importGame: (json) => {
      const state = importSave(json);
      if (state) {
        set({ 
          gameState: state,
          ui: { ...get().ui, currentScreen: 'home' }
        });
        return true;
      }
      return false;
    },
    
    // Dev tools
    devAddCash: (amount) => {
      const { gameState } = get();
      if (!gameState) return;
      
      const newState = { ...gameState };
      newState.player = { ...newState.player };
      newState.player.stats = { ...newState.player.stats };
      newState.player.stats.cash += amount;
      
      set({ gameState: newState });
    },
    
    devAddFollowers: (amount) => {
      const { gameState } = get();
      if (!gameState) return;
      
      const newState = { ...gameState };
      newState.player = { ...newState.player };
      newState.player.stats = { ...newState.player.stats };
      newState.player.stats.followers += amount;
      
      set({ gameState: newState });
    },
    
    devSetHype: (amount) => {
      const { gameState } = get();
      if (!gameState) return;
      
      const newState = { ...gameState };
      newState.player = { ...newState.player };
      newState.player.stats = { ...newState.player.stats };
      newState.player.stats.hype = Math.max(0, Math.min(100, amount));
      
      set({ gameState: newState });
    },
    
    devForceEvent: () => {
      // Force trigger an event for testing
      const { gameState, showToast } = get();
      if (!gameState) return;
      
      showToast('Dev: Event system triggered', 'info');
    },
  }))
);
