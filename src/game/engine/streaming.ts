// Streaming simulation system

import type { Song, Player, FanBase } from '../models/types';
import { rng } from './rng';
import { BALANCE } from '../balance/constants';

export interface StreamingResult {
  weeklyStreams: number;
  revenue: number;
  newFollowers: number;
  playlistPlacement: boolean;
  isViral: boolean;
  viralStage: number;
}

export function calculateWeeklyStreams(
  song: Song,
  player: Player,
  weeksSinceRelease: number
): StreamingResult {
  const r = rng();
  const b = BALANCE.streaming;
  
  if (song.status !== 'released' || song.releaseWeek === null) {
    return {
      weeklyStreams: 0,
      revenue: 0,
      newFollowers: 0,
      playlistPlacement: false,
      isViral: false,
      viralStage: 0,
    };
  }
  
  // Base streams from fanbase
  const fanStreams = calculateFanStreams(player.fanBase, song);
  
  // New listener potential based on quality and marketing
  const reachFactor = calculateReachFactor(song, player);
  const newListenerStreams = Math.floor(reachFactor * song.commercialAppeal);
  
  // Apply decay for older songs
  const decayFactor = calculateDecay(weeksSinceRelease, song.replayability);
  
  // Check for playlist placement (persistent boost)
  let playlistMultiplier = 1;
  const playlistChance = calculatePlaylistChance(song, player);
  const gotPlaylist = r.chance(playlistChance);
  if (gotPlaylist) {
    playlistMultiplier = b.playlistMultiplier;
  }
  
  // Check for viral moment
  let viralMultiplier = 1;
  let isViral = song.isViral;
  let viralStage = song.viralStage;
  
  if (!isViral) {
    const viralChance = calculateViralChance(song, player);
    if (r.chance(viralChance)) {
      isViral = true;
      viralStage = 1;
      viralMultiplier = BALANCE.viral.stages[0].multiplier;
    }
  } else {
    // Check if viral moment escalates
    const currentStage = BALANCE.viral.stages[viralStage - 1];
    const nextStage = BALANCE.viral.stages[viralStage];
    
    if (nextStage && r.chance(nextStage.chance)) {
      viralStage++;
      viralMultiplier = nextStage.multiplier;
    } else if (currentStage) {
      viralMultiplier = currentStage.multiplier * decayFactor;
    }
    
    // Viral moments eventually fade
    if (viralMultiplier < 1.5) {
      isViral = false;
      viralStage = 0;
    }
  }
  
  // Calculate total weekly streams
  const baseStreams = (fanStreams + newListenerStreams) * decayFactor;
  const weeklyStreams = Math.floor(
    baseStreams * playlistMultiplier * viralMultiplier * song.momentum
  );
  
  // Calculate revenue
  const revenue = calculateRevenue(weeklyStreams, player);
  
  // Calculate new followers from streams
  const followerConversion = 0.001 + (song.quality / 10000);
  const newFollowers = Math.floor(weeklyStreams * followerConversion * r.float(0.5, 1.5));
  
  return {
    weeklyStreams,
    revenue,
    newFollowers,
    playlistPlacement: gotPlaylist,
    isViral,
    viralStage,
  };
}

function calculateFanStreams(fanBase: FanBase, song: Song): number {
  const r = rng();
  const mult = BALANCE.fans.streamMultiplier;
  
  // Each fan tier contributes differently
  const casualStreams = fanBase.casual * mult.casual * r.float(0.01, 0.05);
  const followerStreams = fanBase.followers * mult.follower * r.float(0.1, 0.3);
  const coreStreams = fanBase.core * mult.core * r.float(0.3, 0.6);
  const superfanStreams = fanBase.superfans * mult.superfan * r.float(0.5, 1.0);
  
  // Better songs get more repeat listens
  const qualityMultiplier = 0.5 + (song.replayability / 100);
  
  return Math.floor(
    (casualStreams + followerStreams + coreStreams + superfanStreams) * qualityMultiplier
  );
}

function calculateReachFactor(song: Song, player: Player): number {
  // How many new people can discover the song
  const baseReach = player.stats.hype * 10;
  
  // Marketing tier multiplier
  const marketingTier = BALANCE.marketing.tiers.find(
    t => t.cost <= song.marketingSpend
  ) || BALANCE.marketing.tiers[0];
  
  const marketingMultiplier = marketingTier.reachMultiplier;
  
  // Follower network effect
  const networkEffect = Math.sqrt(player.stats.followers) * 0.1;
  
  return (baseReach + networkEffect) * marketingMultiplier;
}

function calculateDecay(weeksSinceRelease: number, replayability: number): number {
  const b = BALANCE.streaming;
  
  // Base decay rate adjusted by replayability
  const adjustedDecay = b.weeklyDecayRate + (replayability / 1000);
  
  // Calculate decayed value
  const decayed = Math.pow(adjustedDecay, weeksSinceRelease);
  
  // Never go below minimum (catalog floor)
  return Math.max(b.catalogMinimum, decayed);
}

function calculatePlaylistChance(song: Song, player: Player): number {
  // Very low base chance
  let chance = 0.005;
  
  // Quality matters
  chance += song.quality / 2000;
  
  // Commercial appeal matters
  chance += song.commercialAppeal / 1500;
  
  // Hype matters
  chance += player.stats.hype / 500;
  
  // Industry reputation helps
  chance += player.reputation.industryRespect / 1000;
  
  // Marketing spend increases odds
  if (song.marketingSpend >= 500) chance += 0.02;
  if (song.marketingSpend >= 2500) chance += 0.05;
  if (song.marketingSpend >= 10000) chance += 0.1;
  
  // Cap at reasonable maximum
  return Math.min(chance, 0.4);
}

function calculateViralChance(song: Song, player: Player): number {
  const b = BALANCE.viral;
  
  let chance = b.baseChance;
  
  // Quality increases viral potential
  chance += song.quality * b.qualityMultiplier;
  
  // Virality stat is key
  chance += song.virality * b.qualityMultiplier;
  
  // Current hype helps
  chance += player.stats.hype * b.hypenessMultiplier;
  
  // Music video helps
  if (song.hasVideo) chance *= 1.5;
  
  // Marketing spend helps
  if (song.marketingSpend >= 2500) chance *= 1.3;
  if (song.marketingSpend >= 10000) chance *= 1.5;
  
  return Math.min(chance, 0.15); // Cap at 15%
}

function calculateRevenue(streams: number, player: Player): number {
  const b = BALANCE.streaming;
  let rate = b.ratePerStream;
  
  // If signed, apply label cut first
  if (player.labelContract) {
    const labelCut = b.labelCut;
    const artistRoyalty = player.labelContract.royaltyPercent / 100;
    rate = rate * (1 - labelCut) * artistRoyalty;
  }
  
  return Math.floor(streams * rate * 100) / 100;
}

export function calculateMonthlyListeners(songs: Song[], _currentWeek: number): number {
  // Sum of unique listeners from all songs in last 4 weeks
  const recentSongs = songs.filter(s => 
    s.status === 'released' && 
    s.releaseWeek !== null
  );
  
  let totalWeeklyStreams = 0;
  for (const song of recentSongs) {
    totalWeeklyStreams += song.weeklyStreams;
  }
  
  // Rough estimate: monthly listeners = weekly streams * listener multiplier
  // (accounts for repeat listens)
  return Math.floor(totalWeeklyStreams * 0.4);
}

export function updateSongMomentum(song: Song, weeklyStreams: number): number {
  // Momentum increases if streams are growing, decreases if falling
  const previousStreams = song.weeklyStreams;
  
  if (previousStreams === 0) {
    return 1.0;
  }
  
  const ratio = weeklyStreams / previousStreams;
  
  // Smooth momentum changes
  const currentMomentum = song.momentum;
  const targetMomentum = ratio;
  
  // Move 20% toward target each week
  return currentMomentum + (targetMomentum - currentMomentum) * 0.2;
}
