// Save/Load system using IndexedDB via idb-keyval

import { get, set, del, keys } from 'idb-keyval';
import type { GameState, SaveData } from '../models/types';
import { rng } from '../engine/rng';

const SAVE_VERSION = 1;
const AUTOSAVE_KEY = 'rapgame-autosave';
const SAVE_PREFIX = 'rapgame-save-';

export interface SaveSlot {
  id: string;
  name: string;
  artistName: string;
  careerTier: string;
  week: number;
  timestamp: number;
}

export async function saveGame(state: GameState, slotId?: string): Promise<boolean> {
  try {
    const saveData: SaveData = {
      version: SAVE_VERSION,
      timestamp: Date.now(),
      slotId: slotId || 'autosave',
      gameState: state,
      rngState: rng().getState(),
    };
    
    const key = slotId ? `${SAVE_PREFIX}${slotId}` : AUTOSAVE_KEY;
    await set(key, saveData);
    
    return true;
  } catch (error) {
    console.error('Failed to save game:', error);
    return false;
  }
}

export async function loadGame(slotId?: string): Promise<GameState | null> {
  try {
    const key = slotId ? `${SAVE_PREFIX}${slotId}` : AUTOSAVE_KEY;
    const saveData = await get<SaveData>(key);
    
    if (!saveData) {
      return null;
    }
    
    // Version migration would go here
    if (saveData.version !== SAVE_VERSION) {
      console.warn(`Save version mismatch: ${saveData.version} vs ${SAVE_VERSION}`);
      // Attempt to migrate or handle gracefully
    }
    
    // Restore RNG state
    if (saveData.rngState) {
      rng().setState(saveData.rngState);
    }
    
    return validateGameState(saveData.gameState);
  } catch (error) {
    console.error('Failed to load game:', error);
    return null;
  }
}

export async function deleteSave(slotId: string): Promise<boolean> {
  try {
    const key = `${SAVE_PREFIX}${slotId}`;
    await del(key);
    return true;
  } catch (error) {
    console.error('Failed to delete save:', error);
    return false;
  }
}

export async function listSaves(): Promise<SaveSlot[]> {
  try {
    const allKeys = await keys();
    const saveKeys = allKeys.filter(
      k => typeof k === 'string' && (k.startsWith(SAVE_PREFIX) || k === AUTOSAVE_KEY)
    );
    
    const saves: SaveSlot[] = [];
    
    for (const key of saveKeys) {
      const saveData = await get<SaveData>(key as string);
      if (saveData?.gameState?.player) {
        saves.push({
          id: saveData.slotId,
          name: saveData.slotId === 'autosave' ? 'Autosave' : `Save ${saveData.slotId}`,
          artistName: saveData.gameState.player.artistName,
          careerTier: saveData.gameState.player.careerTier,
          week: saveData.gameState.currentWeek,
          timestamp: saveData.timestamp,
        });
      }
    }
    
    return saves.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Failed to list saves:', error);
    return [];
  }
}

export async function hasAutosave(): Promise<boolean> {
  try {
    const save = await get(AUTOSAVE_KEY);
    return save !== undefined;
  } catch {
    return false;
  }
}

export function exportSave(state: GameState): string {
  const saveData: SaveData = {
    version: SAVE_VERSION,
    timestamp: Date.now(),
    slotId: 'export',
    gameState: state,
    rngState: rng().getState(),
  };
  
  return JSON.stringify(saveData);
}

export function importSave(jsonString: string): GameState | null {
  try {
    const saveData: SaveData = JSON.parse(jsonString);
    
    if (!saveData.gameState || !saveData.version) {
      throw new Error('Invalid save format');
    }
    
    // Restore RNG state if present
    if (saveData.rngState) {
      rng().setState(saveData.rngState);
    }
    
    return validateGameState(saveData.gameState);
  } catch (error) {
    console.error('Failed to import save:', error);
    return null;
  }
}

function validateGameState(state: GameState): GameState | null {
  // Basic validation to prevent crashes from corrupted saves
  try {
    if (!state.player) return null;
    if (!state.player.artistName) return null;
    if (typeof state.currentWeek !== 'number') return null;
    if (!Array.isArray(state.songs)) state.songs = [];
    if (!Array.isArray(state.npcArtists)) state.npcArtists = [];
    if (!Array.isArray(state.producers)) state.producers = [];
    if (!Array.isArray(state.activeEvents)) state.activeEvents = [];
    if (!Array.isArray(state.news)) state.news = [];
    if (!state.charts) {
      state.charts = {
        top100: [],
        rap50: [],
        underground100: [],
        trending25: [],
      };
    }
    
    return state;
  } catch {
    return null;
  }
}
