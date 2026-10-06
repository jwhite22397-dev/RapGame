// Main simulation loop - processes a week of game time

import type {
  GameState, WeeklyRecap, NewsItem,
  GameEvent
} from '../models/types';
import { rng, SeededRNG, setGlobalRNG } from './rng';
import { BALANCE } from '../balance/constants';
import { calculateWeeklyStreams, calculateMonthlyListeners, updateSongMomentum } from './streaming';
import { updateCharts, getChartMovement } from './charts';
import { calculateCareerTier } from './player';
import { generateLabelOffer, generateShowOffer, generateNPCArtist } from './generators';
import { getEligibleEvents, EVENT_TEMPLATES } from '../data/events';
import { checkMilestones } from '../data/milestones';
import { applyWeeklyLifestyle, ensurePlayerLifestyle } from './lifestyle';

export interface SimulationResult {
  newState: GameState;
  recap: WeeklyRecap;
}

export function simulateWeek(state: GameState): SimulationResult {
  const r = rng();
  
  // Deep clone state to avoid mutations
  const newState: GameState = JSON.parse(JSON.stringify(state));
  ensurePlayerLifestyle(newState);
  newState.currentWeek++;
  
  // Age up on birthday (every 52 weeks)
  if (newState.currentWeek % 52 === 0) {
    newState.player.age++;
  }
  
  // Initialize recap
  const recap: WeeklyRecap = {
    week: newState.currentWeek,
    streamsGained: 0,
    followersGained: 0,
    moneyEarned: 0,
    moneySpent: 0,
    hypeChange: 0,
    events: [],
    chartMovements: [],
    milestones: [],
  };
  
  // Process streams for all released songs
  let totalWeeklyStreams = 0;
  let totalRevenue = 0;
  let totalNewFollowers = 0;
  
  for (const song of newState.songs) {
    if (song.status !== 'released' || song.releaseWeek === null) continue;
    
    const weeksSinceRelease = newState.currentWeek - song.releaseWeek;
    const streamResult = calculateWeeklyStreams(song, newState.player, weeksSinceRelease);
    
    // Update song stats
    song.weeklyStreams = streamResult.weeklyStreams;
    song.totalStreams += streamResult.weeklyStreams;
    song.totalRevenue += streamResult.revenue;
    song.peakWeeklyStreams = Math.max(song.peakWeeklyStreams, streamResult.weeklyStreams);
    song.momentum = updateSongMomentum(song, streamResult.weeklyStreams);
    
    // Handle viral status
    if (streamResult.isViral && !song.isViral) {
      song.isViral = true;
      song.viralStage = streamResult.viralStage;
      recap.events.push(`"${song.title}" is going viral!`);
    } else if (streamResult.isViral) {
      song.viralStage = streamResult.viralStage;
    }
    
    totalWeeklyStreams += streamResult.weeklyStreams;
    totalRevenue += streamResult.revenue;
    totalNewFollowers += streamResult.newFollowers;
  }
  
  // Update player stats
  newState.player.stats.totalStreams += totalWeeklyStreams;
  newState.player.stats.careerEarnings += totalRevenue;
  newState.player.stats.cash += totalRevenue;
  newState.player.stats.followers += totalNewFollowers;
  newState.player.stats.monthlyListeners = calculateMonthlyListeners(
    newState.songs,
    newState.currentWeek
  );
  
  recap.streamsGained = totalWeeklyStreams;
  recap.moneyEarned = totalRevenue;
  recap.followersGained = totalNewFollowers;
  
  // Update hype (decays naturally)
  const hypeDecay = newState.player.stats.hype * (1 - BALANCE.hype.weeklyDecay);
  newState.player.stats.hype = Math.max(1, newState.player.stats.hype - hypeDecay);
  recap.hypeChange = -hypeDecay;

  const lifestyle = applyWeeklyLifestyle(newState);
  recap.hypeChange += lifestyle.hype;
  recap.followersGained += lifestyle.followers;
  recap.events.push(...lifestyle.notes);
  
  // Update fan tiers
  updateFanBase(newState);
  
  // Update career tier
  const newTier = calculateCareerTier(
    newState.player.stats.followers,
    newState.player.stats.monthlyListeners
  );
  if (newTier !== newState.player.careerTier) {
    newState.player.careerTier = newTier;
    recap.events.push(`You've reached ${newTier} status!`);
    
    // Add to timeline
    newState.careerTimeline.push({
      week: newState.currentWeek,
      age: newState.player.age,
      event: `Reached ${newTier} status`,
      type: 'milestone',
    });
  }
  
  // Update charts
  newState.charts = updateCharts(
    newState.charts,
    newState.songs,
    newState.player.artistName,
    newState.npcArtists,
    newState.currentWeek
  );
  
  // Check for chart movements
  for (const chart of [newState.charts.top100, newState.charts.rap50, newState.charts.underground100]) {
    for (const entry of chart) {
      if (entry.isPlayer) {
        const movement = getChartMovement(entry.position, entry.lastPosition);
        if (movement !== '—') {
          const chartName = chart === newState.charts.top100 ? 'Top 100' :
                           chart === newState.charts.rap50 ? 'Rap 50' : 'Underground 100';
          
          const song = newState.songs.find(s => s.id === entry.songId);
          if (song) {
            recap.chartMovements.push({
              songTitle: song.title,
              chart: chartName,
              movement: movement === 'NEW' ? `entered at #${entry.position}` :
                       movement.startsWith('↑') ? `moved up to #${entry.position}` :
                       `dropped to #${entry.position}`,
            });
            
            // Update song's chart history
            song.chartHistory.push({
              week: newState.currentWeek,
              position: entry.position,
              chartType: chartName,
            });
            
            if (song.peakChartPosition === null || entry.position < song.peakChartPosition) {
              song.peakChartPosition = entry.position;
            }
            song.weeksOnChart++;
          }
        }
      }
    }
  }
  
  // Generate random events
  const eventState = {
    careerTier: newState.player.careerTier,
    cash: newState.player.stats.cash,
    followers: newState.player.stats.followers,
    hype: newState.player.stats.hype,
    hasReleasedSong: newState.songs.some(s => s.status === 'released'),
    hasContract: newState.player.labelContract !== null,
  };
  
  const eligibleEvents = getEligibleEvents(eventState, newState.eventHistory, newState.currentWeek);
  
  // Check for new events (1-2 per week on average)
  const eventCount = r.int(0, 2);
  for (let i = 0; i < eventCount && eligibleEvents.length > 0; i++) {
    const weights = eligibleEvents.map(e => e.rarity);
    const template = r.weightedPick(eligibleEvents, weights);
    
    if (template && r.chance(template.rarity)) {
      const event = createEventFromTemplate(template, newState);
      newState.activeEvents.push(event);
    }
  }
  
  // Generate label offers
  if (r.chance(0.05) && !newState.player.labelContract) {
    const offer = generateLabelOffer(newState.player, newState.currentWeek);
    if (offer) {
      newState.labelOffers.push(offer);
      recap.events.push(`${offer.labelName} is interested in signing you!`);
    }
  }
  
  // Generate show offers — early careers get more local bookings
  const showChance = newState.currentWeek <= 6 ? 0.55 : 0.22;
  if (newState.showOffers.length === 0 && r.chance(showChance)) {
    const offer = generateShowOffer(newState.player, newState.currentWeek);
    if (offer) {
      newState.showOffers.push(offer);
      recap.events.push(`${offer.venueName} in ${offer.city} wants to book you.`);
    }
  }
  
  // Expire old offers
  newState.labelOffers = newState.labelOffers.filter(o => o.expiresWeek > newState.currentWeek);
  newState.showOffers = newState.showOffers.filter(o => o.expiresWeek > newState.currentWeek);
  
  // Update NPC artists
  updateNPCArtists(newState);
  
  // Generate news
  generateNews(newState);
  
  // Check milestones
  const milestoneState = {
    totalStreams: newState.player.stats.totalStreams,
    followers: newState.player.stats.followers,
    cash: newState.player.stats.cash,
    careerEarnings: newState.player.stats.careerEarnings,
    monthlyListeners: newState.player.stats.monthlyListeners,
    songsReleased: newState.songs.filter(s => s.status === 'released').length,
    projectsReleased: newState.projects.length,
    showsPerformed: newState.player.lifestyle?.showsPerformed ?? 0,
    chartsEntered: newState.songs.filter(s => s.chartHistory.length > 0).length,
    peakChartPosition: Math.min(...newState.songs.map(s => s.peakChartPosition || 999)),
    hasQuitDayJob: newState.player.hasQuitDayJob,
    hasLabel: newState.player.labelContract !== null,
    careerTier: newState.player.careerTier,
    goldRecords: newState.songs.filter(s => s.totalStreams >= 500000).length,
    platinumRecords: newState.songs.filter(s => s.totalStreams >= 1000000).length,
    awardCount: newState.player.awards.length,
  };
  
  const newMilestones = checkMilestones(milestoneState, newState.player.milestones);
  for (const milestone of newMilestones) {
    newState.player.milestones.push(milestone.id);
    recap.milestones.push(milestone.name);
    recap.events.push(milestone.celebrationText);
    
    newState.careerTimeline.push({
      week: newState.currentWeek,
      age: newState.player.age,
      event: milestone.name,
      type: 'milestone',
    });
  }
  
  // Restore energy
  newState.player.stats.energy = Math.min(
    newState.player.stats.maxEnergy,
    newState.player.stats.energy + BALANCE.energyRecovery.base
  );
  
  // Save recap
  newState.weeklyRecaps.push(recap);
  
  return { newState, recap };
}

function updateFanBase(state: GameState): void {
  const r = rng();
  const fans = state.player.fanBase;
  const rates = BALANCE.fans;
  
  // Some casual listeners become followers
  const newFollowers = Math.floor(fans.casual * rates.casualToFollower * r.float(0.5, 1.5));
  fans.followers += newFollowers;
  fans.casual -= newFollowers;
  
  // Some followers become core fans
  const newCore = Math.floor(fans.followers * rates.followerToCore * r.float(0.5, 1.5));
  fans.core += newCore;
  fans.followers -= newCore;
  
  // Some core fans become superfans
  const newSuper = Math.floor(fans.core * rates.coreToSuperfan * r.float(0.5, 1.5));
  fans.superfans += newSuper;
  fans.core -= newSuper;
}

function updateNPCArtists(state: GameState): void {
  const r = rng();
  
  for (const npc of state.npcArtists) {
    // Update popularity based on momentum
    npc.popularity = Math.max(100, Math.floor(npc.popularity * (1 + npc.careerMomentum)));
    
    // Randomly shift momentum
    npc.careerMomentum += r.float(-0.02, 0.02);
    npc.careerMomentum = Math.max(-0.2, Math.min(0.2, npc.careerMomentum));
    
    // Hype decays
    npc.hype = Math.max(5, npc.hype * 0.98);
    
    // Small chance of major career events
    if (r.chance(0.01)) {
      // Big hit or fall off
      if (r.chance(0.5)) {
        npc.careerMomentum = r.float(0.1, 0.3);
        npc.hype = Math.min(100, npc.hype + r.int(20, 40));
      } else {
        npc.careerMomentum = r.float(-0.2, -0.05);
      }
    }
    
    // Very small chance of retiring
    if (r.chance(0.002) && npc.age > 35) {
      npc.isActive = false;
    }
  }
  
  // Occasionally add new artists
  if (r.chance(0.02)) {
    state.npcArtists.push(generateNPCArtist());
  }
}

function createEventFromTemplate(template: typeof EVENT_TEMPLATES[0], state: GameState): GameEvent {
  const r = rng();
  
  // Replace placeholders in description
  let description = template.description;
  description = description.replace('{city}', r.pick(['Atlanta', 'Houston', 'LA', 'Chicago', 'Miami']));
  description = description.replace('{producerName}', r.pick(['Metro Nova', 'SoundWave', 'BeatKing']));
  description = description.replace('{quality}', r.pick(['promising', 'unique', 'hard', 'melodic']));
  description = description.replace('{artistName}', state.npcArtists[0]?.name || 'Unknown Artist');
  description = description.replace('{followers}', r.int(1000, 50000).toLocaleString());
  
  return {
    id: r.id(),
    type: template.id,
    title: template.title,
    description,
    week: state.currentWeek,
    choices: template.choices.map(c => ({
      id: c.id,
      text: c.text,
      cost: c.cost,
      effects: c.effects,
    })),
    resolved: false,
  };
}

function generateNews(state: GameState): void {
  const r = rng();
  
  // Generate 2-4 news items per week
  const count = r.int(2, 4);
  
  for (let i = 0; i < count; i++) {
    const newsType = r.pick(['npc', 'industry', 'chart']);
    let headline: string;
    let category: NewsItem['category'];
    
    switch (newsType) {
      case 'npc': {
        const npc = r.pick(state.npcArtists.filter(a => a.isActive));
        const templates = [
          `${npc.name} announces new project`,
          `${npc.name}'s latest track gains momentum`,
          `${npc.name} signs new deal`,
          `${npc.name} teases upcoming release`,
          `${npc.name} reaches career milestone`,
        ];
        headline = r.pick(templates);
        category = 'npc';
        break;
      }
      case 'chart': {
        const chartSong = r.pick(state.charts.top100.slice(0, 10));
        const templates = [
          `"${chartSong.songTitle}" by ${chartSong.artistName} holds #${chartSong.position}`,
          `${chartSong.artistName} dominates charts`,
          `New entries shake up this week's rankings`,
        ];
        headline = r.pick(templates);
        category = 'chart';
        break;
      }
      default: {
        const templates = [
          'Industry experts predict streaming growth',
          'New playlist placements drive discovery',
          'Live performance bookings surge',
          'Independent artists gaining market share',
          'Social media driving new music discovery',
        ];
        headline = r.pick(templates);
        category = 'industry';
      }
    }
    
    state.news.push({
      id: r.id(),
      week: state.currentWeek,
      headline,
      category,
    });
  }
  
  // Keep only recent news
  state.news = state.news.slice(-50);
}

export function initializeGameState(seed?: number): GameState {
  const gameSeed = seed ?? Date.now();
  const rngInstance = new SeededRNG(gameSeed);
  setGlobalRNG(rngInstance);
  
  return {
    version: 1,
    seed: gameSeed,
    currentWeek: 0,
    player: null as unknown as GameState['player'], // Will be set during career creation
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
    charts: {
      top100: [],
      rap50: [],
      underground100: [],
      trending25: [],
    },
    news: [],
    weeklyRecaps: [],
    careerTimeline: [],
  };
}
