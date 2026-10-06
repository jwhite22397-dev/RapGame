// Player action system

import type { GameState, Song } from '../models/types';
import { rng } from './rng';
import { BALANCE } from '../balance/constants';
import { generateSongQuality, generateSongTitle } from './generators';
import { improveAttribute } from './player';

export type ActionType =
  | 'write'
  | 'record'
  | 'makeBeats'
  | 'practice'
  | 'postContent'
  | 'shootVideo'
  | 'network'
  | 'perform'
  | 'rest'
  | 'workJob'
  | 'collaborate'
  | 'promote';

export interface ActionResult {
  success: boolean;
  message: string;
  energyCost: number;
  moneyCost: number;
  moneyGain: number;
  effects: string[];
}

export function canPerformAction(state: GameState, action: ActionType): { can: boolean; reason?: string } {
  const energy = state.player.stats.energy;
  const cash = state.player.stats.cash;
  const energyCostMap: Record<string, number> = BALANCE.energy;
  const cost = energyCostMap[action] ?? 0;
  
  if (action === 'rest') {
    return { can: true };
  }
  
  if (energy < Math.abs(cost)) {
    return { can: false, reason: 'Not enough energy' };
  }
  
  // Check money requirements for specific actions
  if (action === 'shootVideo' && cash < BALANCE.musicVideo.basic) {
    return { can: false, reason: `Need at least $${BALANCE.musicVideo.basic} for a basic video` };
  }
  
  return { can: true };
}

export function performAction(
  state: GameState,
  action: ActionType,
  options?: {
    songId?: string;
    videoTier?: 'basic' | 'standard' | 'professional' | 'premium';
    marketingSpend?: number;
    producerId?: string;
    contentType?: string;
  }
): { newState: GameState; result: ActionResult } {
  const newState: GameState = JSON.parse(JSON.stringify(state));
  const result: ActionResult = {
    success: true,
    message: '',
    energyCost: 0,
    moneyCost: 0,
    moneyGain: 0,
    effects: [],
  };
  
  const energyCostMap: Record<string, number> = BALANCE.energy;
  const energyCost = energyCostMap[action] ?? 0;
  
  switch (action) {
    case 'write':
      return handleWrite(newState, result, energyCost);
    
    case 'record':
      return handleRecord(newState, result, energyCost, options?.songId, options?.producerId);
    
    case 'rest':
      return handleRest(newState, result);
    
    case 'workJob':
      return handleWorkJob(newState, result, energyCost);
    
    case 'practice':
      return handlePractice(newState, result, energyCost);
    
    case 'postContent':
      return handlePostContent(newState, result, energyCost, options?.contentType);
    
    case 'network':
      return handleNetwork(newState, result, energyCost);
    
    case 'shootVideo':
      return handleShootVideo(newState, result, energyCost, options?.songId, options?.videoTier);
    
    case 'promote':
      return handlePromote(newState, result, energyCost, options?.songId, options?.marketingSpend);
    
    default:
      result.message = 'Unknown action';
      result.success = false;
      return { newState, result };
  }
}

function handleWrite(state: GameState, result: ActionResult, energyCost: number): { newState: GameState; result: ActionResult } {
  const r = rng();
  
  state.player.stats.energy -= energyCost;
  result.energyCost = energyCost;
  
  // Create a new song in 'writing' status
  const producer = state.producers.find(p => p.chemistry > 20) || state.producers[0];
  const qualityStats = generateSongQuality(state.player, producer);
  
  const newSong: Song = {
    id: r.id(),
    title: generateSongTitle(),
    createdWeek: state.currentWeek,
    genre: state.player.genre,
    status: 'writing',
    releaseWeek: null,
    ...qualityStats,
    featureArtistId: null,
    featureArtistName: null,
    producerId: producer?.id || null,
    producerName: producer?.name || null,
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
  };
  
  state.songs.push(newSong);
  
  // Improve writing attribute
  state.player.attributes.writing = improveAttribute(state.player.attributes.writing);
  
  result.message = `Started writing "${newSong.title}"`;
  result.effects.push('Writing skill improved');
  
  return { newState: state, result };
}

function handleRecord(
  state: GameState,
  result: ActionResult,
  energyCost: number,
  songId?: string,
  _producerId?: string
): { newState: GameState; result: ActionResult } {
  // Find a song to record
  let song: Song | undefined;
  if (songId) {
    song = state.songs.find(s => s.id === songId);
  } else {
    song = state.songs.find(s => s.status === 'writing');
  }
  
  if (!song) {
    result.success = false;
    result.message = 'No song to record. Write something first!';
    return { newState: state, result };
  }
  
  state.player.stats.energy -= energyCost;
  result.energyCost = energyCost;
  
  // Update song status
  song.status = 'mixed'; // Skip directly to mixed for simplicity
  
  // Producer chemistry improves
  if (song.producerId) {
    const producer = state.producers.find(p => p.id === song!.producerId);
    if (producer) {
      producer.chemistry = Math.min(100, producer.chemistry + 5);
    }
  }
  
  // Improve flow attribute
  state.player.attributes.flow = improveAttribute(state.player.attributes.flow);
  
  result.message = `Recorded "${song.title}"`;
  result.effects.push('Flow improved');
  
  return { newState: state, result };
}

function handleRest(state: GameState, result: ActionResult): { newState: GameState; result: ActionResult } {
  const recovery = BALANCE.energyRecovery.restBonus;
  state.player.stats.energy = Math.min(
    state.player.stats.maxEnergy,
    state.player.stats.energy + recovery
  );
  
  result.message = 'You took time to rest and recharge';
  result.effects.push(`Recovered ${recovery} energy`);
  
  return { newState: state, result };
}

function handleWorkJob(state: GameState, result: ActionResult, energyCost: number): { newState: GameState; result: ActionResult } {
  const r = rng();
  
  state.player.stats.energy -= energyCost;
  result.energyCost = energyCost;
  
  const pay = r.int(BALANCE.dayJob.basePay.min, BALANCE.dayJob.basePay.max);
  state.player.stats.cash += pay;
  state.player.stats.careerEarnings += pay;
  
  result.moneyGain = pay;
  result.message = 'Worked a shift at your day job';
  result.effects.push(`Earned $${pay}`);
  
  // Small hype penalty - you're not focused on music
  state.player.stats.hype = Math.max(0, state.player.stats.hype - 1);
  
  return { newState: state, result };
}

function handlePractice(state: GameState, result: ActionResult, energyCost: number): { newState: GameState; result: ActionResult } {
  const r = rng();
  
  state.player.stats.energy -= energyCost;
  result.energyCost = energyCost;
  
  // Improve random performance-related attribute
  const attrs: Array<'flow' | 'performance' | 'melody'> = ['flow', 'performance', 'melody'];
  const attr = r.pick(attrs);
  state.player.attributes[attr] = improveAttribute(state.player.attributes[attr], 0.8);
  
  result.message = 'Practiced and improved your craft';
  result.effects.push(`${attr.charAt(0).toUpperCase() + attr.slice(1)} improved`);
  
  return { newState: state, result };
}

function handlePostContent(
  state: GameState,
  result: ActionResult,
  energyCost: number,
  contentType?: string
): { newState: GameState; result: ActionResult } {
  const r = rng();
  
  const type = contentType || 'snippet';
  const contentData = BALANCE.content[type as keyof typeof BALANCE.content] || BALANCE.content.snippet;
  
  const actualEnergy = contentData.energy || energyCost;
  state.player.stats.energy -= actualEnergy;
  result.energyCost = actualEnergy;
  
  // Calculate engagement
  const baseEngagement = contentData.engagement * state.player.attributes.charisma;
  const followerGain = Math.floor(baseEngagement * r.float(0.5, 1.5));
  const hypeGain = Math.floor(baseEngagement * 0.1 * r.float(0.5, 1.5));
  
  state.player.stats.followers += followerGain;
  state.player.stats.hype = Math.min(BALANCE.hype.maxValue, state.player.stats.hype + hypeGain);
  
  // Improve marketing skill
  state.player.attributes.marketing = improveAttribute(state.player.attributes.marketing, 0.3);
  
  result.message = `Posted ${type} content`;
  result.effects.push(`+${followerGain} followers`);
  result.effects.push(`+${hypeGain} hype`);
  
  return { newState: state, result };
}

function handleNetwork(state: GameState, result: ActionResult, energyCost: number): { newState: GameState; result: ActionResult } {
  const r = rng();
  
  state.player.stats.energy -= energyCost;
  result.energyCost = energyCost;
  
  // Improve relationships and networking skill
  state.player.attributes.networking = improveAttribute(state.player.attributes.networking);
  
  // Small chance to improve industry respect
  if (r.chance(0.2)) {
    state.player.reputation.industryRespect = Math.min(
      100,
      state.player.reputation.industryRespect + r.int(1, 3)
    );
    result.effects.push('Industry respect increased');
  }
  
  // Might meet a producer
  if (r.chance(0.15) && state.producers.length < 10) {
    result.effects.push('Met a new producer');
  }
  
  result.message = 'Spent time networking';
  result.effects.push('Networking skill improved');
  
  return { newState: state, result };
}

function handleShootVideo(
  state: GameState,
  result: ActionResult,
  energyCost: number,
  songId?: string,
  tier?: 'basic' | 'standard' | 'professional' | 'premium'
): { newState: GameState; result: ActionResult } {
  const videoTier = tier || 'basic';
  const cost = BALANCE.musicVideo[videoTier];
  
  // Find released song without video
  let song: Song | undefined;
  if (songId) {
    song = state.songs.find(s => s.id === songId);
  } else {
    song = state.songs.find(s => s.status === 'released' && !s.hasVideo);
  }
  
  if (!song) {
    result.success = false;
    result.message = 'No released song without a video';
    return { newState: state, result };
  }
  
  if (state.player.stats.cash < cost) {
    result.success = false;
    result.message = `Need $${cost} for a ${videoTier} video`;
    return { newState: state, result };
  }
  
  state.player.stats.energy -= energyCost;
  state.player.stats.cash -= cost;
  result.energyCost = energyCost;
  result.moneyCost = cost;
  
  song.hasVideo = true;
  
  // Videos boost momentum and virality potential
  song.momentum *= 1.2;
  
  result.message = `Shot a ${videoTier} music video for "${song.title}"`;
  result.effects.push(`Spent $${cost}`);
  result.effects.push('Video boosts song visibility');
  
  return { newState: state, result };
}

function handlePromote(
  state: GameState,
  result: ActionResult,
  energyCost: number,
  songId?: string,
  spend?: number
): { newState: GameState; result: ActionResult } {
  const marketingSpend = spend || 100;
  
  let song: Song | undefined;
  if (songId) {
    song = state.songs.find(s => s.id === songId);
  } else {
    song = state.songs.find(s => s.status === 'released');
  }
  
  if (!song) {
    result.success = false;
    result.message = 'No released song to promote';
    return { newState: state, result };
  }
  
  if (state.player.stats.cash < marketingSpend) {
    result.success = false;
    result.message = `Need $${marketingSpend} for promotion`;
    return { newState: state, result };
  }
  
  state.player.stats.energy -= energyCost;
  state.player.stats.cash -= marketingSpend;
  result.energyCost = energyCost;
  result.moneyCost = marketingSpend;
  
  song.marketingSpend += marketingSpend;
  
  result.message = `Promoted "${song.title}"`;
  result.effects.push(`Spent $${marketingSpend} on promotion`);
  
  return { newState: state, result };
}

export function releaseSong(
  state: GameState,
  songId: string,
  options?: { marketingSpend?: number }
): { newState: GameState; success: boolean; message: string } {
  const newState: GameState = JSON.parse(JSON.stringify(state));
  
  const song = newState.songs.find(s => s.id === songId);
  
  if (!song) {
    return { newState, success: false, message: 'Song not found' };
  }
  
  if (song.status === 'released') {
    return { newState, success: false, message: 'Song already released' };
  }
  
  if (song.status === 'writing' || song.status === 'idea') {
    return { newState, success: false, message: 'Song not ready - needs to be recorded first' };
  }
  
  const marketingSpend = options?.marketingSpend || 0;
  if (newState.player.stats.cash < marketingSpend) {
    return { newState, success: false, message: 'Not enough money for marketing' };
  }
  
  song.status = 'released';
  song.releaseWeek = newState.currentWeek;
  song.marketingSpend = marketingSpend;
  newState.player.stats.cash -= marketingSpend;
  
  // Hype boost from release
  const r = rng();
  const hyneBoost = r.int(BALANCE.hype.releaseBoost.min, BALANCE.hype.releaseBoost.max);
  newState.player.stats.hype = Math.min(BALANCE.hype.maxValue, newState.player.stats.hype + hyneBoost);
  
  // Add to timeline
  newState.careerTimeline.push({
    week: newState.currentWeek,
    age: newState.player.age,
    event: `Released "${song.title}"`,
    type: 'release',
  });
  
  return { newState, success: true, message: `Released "${song.title}"!` };
}

export function resolveEvent(
  state: GameState,
  eventId: string,
  choiceId: string
): { newState: GameState; success: boolean; message: string } {
  const newState: GameState = JSON.parse(JSON.stringify(state));
  
  const event = newState.activeEvents.find(e => e.id === eventId);
  if (!event) {
    return { newState, success: false, message: 'Event not found' };
  }
  
  const choice = event.choices?.find(c => c.id === choiceId);
  if (!choice) {
    return { newState, success: false, message: 'Choice not found' };
  }
  
  // Check cost
  if (choice.cost) {
    if (choice.cost.type === 'money' && newState.player.stats.cash < choice.cost.amount) {
      return { newState, success: false, message: 'Not enough money' };
    }
    if (choice.cost.type === 'energy' && newState.player.stats.energy < choice.cost.amount) {
      return { newState, success: false, message: 'Not enough energy' };
    }
    
    // Deduct cost
    if (choice.cost.type === 'money') {
      newState.player.stats.cash -= choice.cost.amount;
    } else {
      newState.player.stats.energy -= choice.cost.amount;
    }
  }
  
  // Apply effects
  for (const effect of choice.effects) {
    applyEffect(newState, effect);
  }
  
  // Mark as resolved
  event.resolved = true;
  event.choiceMade = choiceId;
  event.effects = choice.effects;
  
  // Move to history
  newState.eventHistory.push(event);
  newState.activeEvents = newState.activeEvents.filter(e => e.id !== eventId);
  
  return { newState, success: true, message: 'Choice made' };
}

function applyEffect(state: GameState, effect: { type: string; target?: string; value: number }): void {
  switch (effect.type) {
    case 'money':
      state.player.stats.cash += effect.value;
      state.player.stats.careerEarnings += Math.max(0, effect.value);
      break;
    case 'hype':
      state.player.stats.hype = Math.max(0, Math.min(100, state.player.stats.hype + effect.value));
      break;
    case 'followers':
      state.player.stats.followers += effect.value;
      break;
    case 'core-fans':
      state.player.fanBase.core += effect.value;
      break;
    case 'reputation':
      if (effect.target === 'underground') {
        state.player.reputation.undergroundCredibility = Math.max(0, Math.min(100, state.player.reputation.undergroundCredibility + effect.value));
      } else if (effect.target === 'mainstream') {
        state.player.reputation.mainstreamRecognition = Math.max(0, Math.min(100, state.player.reputation.mainstreamRecognition + effect.value));
      } else if (effect.target === 'industry') {
        state.player.reputation.industryRespect = Math.max(0, Math.min(100, state.player.reputation.industryRespect + effect.value));
      }
      break;
    case 'attribute':
      if (effect.target && effect.target in state.player.attributes) {
        const key = effect.target as keyof typeof state.player.attributes;
        state.player.attributes[key] = Math.max(0, Math.min(100, state.player.attributes[key] + effect.value));
      }
      break;
  }
}
