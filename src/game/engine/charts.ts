// Chart simulation system

import type { ChartState, ChartSong, Song, NPCArtist } from '../models/types';
import { rng } from './rng';
import { BALANCE } from '../balance/constants';
import { generateSongTitle } from './generators';

export function initializeCharts(npcArtists: NPCArtist[]): ChartState {
  return {
    top100: generateInitialChart(npcArtists, 100, 'top100'),
    rap50: generateInitialChart(npcArtists, 50, 'rap50'),
    underground100: generateInitialChart(npcArtists, 100, 'underground100'),
    trending25: generateInitialChart(npcArtists, 25, 'trending25'),
  };
}

function generateInitialChart(
  npcArtists: NPCArtist[],
  size: number,
  chartType: string
): ChartSong[] {
  const r = rng();
  const chart: ChartSong[] = [];
  
  // Filter artists by chart type relevance
  let eligibleArtists: NPCArtist[];
  
  if (chartType === 'underground100') {
    eligibleArtists = npcArtists.filter(a => 
      ['local', 'underground', 'rising'].includes(a.careerTier)
    );
  } else if (chartType === 'top100') {
    eligibleArtists = npcArtists.filter(a => 
      ['established', 'superstar', 'icon'].includes(a.careerTier)
    );
  } else {
    eligibleArtists = [...npcArtists];
  }
  
  // Shuffle and pick artists
  const shuffled = r.shuffle(eligibleArtists);
  
  for (let i = 0; i < Math.min(size, shuffled.length); i++) {
    const artist = shuffled[i];
    const position = i + 1;
    
    // Higher chart positions = more streams
    const streamMultiplier = Math.pow(0.92, position - 1);
    const baseStreams = chartType === 'underground100' ? 500000 : 5000000;
    const streams = Math.floor(baseStreams * streamMultiplier * r.float(0.7, 1.3));
    
    chart.push({
      songId: r.id(),
      artistName: artist.name,
      songTitle: generateSongTitle(),
      isPlayer: false,
      position,
      lastPosition: null,
      peakPosition: position,
      weeksOnChart: r.int(1, 20),
      streams,
    });
  }
  
  return chart;
}

export function updateCharts(
  charts: ChartState,
  playerSongs: Song[],
  playerName: string,
  npcArtists: NPCArtist[],
  _currentWeek: number
): ChartState {
  
  // Process each chart
  const newCharts: ChartState = {
    top100: updateSingleChart(charts.top100, playerSongs, playerName, npcArtists, 'top100', BALANCE.charts.top100Entry, 100),
    rap50: updateSingleChart(charts.rap50, playerSongs, playerName, npcArtists, 'rap50', BALANCE.charts.rap50Entry, 50),
    underground100: updateSingleChart(charts.underground100, playerSongs, playerName, npcArtists, 'underground100', BALANCE.charts.underground100Entry, 100),
    trending25: updateTrendingChart(charts.trending25, playerSongs, playerName, npcArtists),
  };
  
  return newCharts;
}

function updateSingleChart(
  currentChart: ChartSong[],
  playerSongs: Song[],
  playerName: string,
  npcArtists: NPCArtist[],
  chartType: string,
  entryThreshold: number,
  maxSize: number
): ChartSong[] {
  const r = rng();
  
  // Collect all entries with updated streams
  const entries: ChartSong[] = [];
  
  // Update existing NPC entries
  for (const entry of currentChart) {
    if (!entry.isPlayer) {
      // NPC songs fluctuate
      const streamChange = r.float(0.7, 1.3);
      const newStreams = Math.floor(entry.streams * streamChange);
      
      // Songs eventually fall off
      const fallOffChance = entry.weeksOnChart > 15 ? 0.15 : 0.05;
      if (r.chance(fallOffChance)) {
        continue; // Drop from chart
      }
      
      entries.push({
        ...entry,
        lastPosition: entry.position,
        weeksOnChart: entry.weeksOnChart + 1,
        streams: newStreams,
      });
    }
  }
  
  // Check player songs for chart eligibility
  const releasedPlayerSongs = playerSongs.filter(s => 
    s.status === 'released' && s.weeklyStreams >= entryThreshold
  );
  
  for (const song of releasedPlayerSongs) {
    const existingEntry = currentChart.find(e => e.isPlayer && e.songId === song.id);
    
    if (existingEntry) {
      entries.push({
        ...existingEntry,
        lastPosition: existingEntry.position,
        weeksOnChart: existingEntry.weeksOnChart + 1,
        streams: song.weeklyStreams,
      });
    } else {
      // New chart entry!
      entries.push({
        songId: song.id,
        artistName: playerName,
        songTitle: song.title,
        isPlayer: true,
        position: 0, // Will be set after sorting
        lastPosition: null,
        peakPosition: 100,
        weeksOnChart: 1,
        streams: song.weeklyStreams,
      });
    }
  }
  
  // Add new NPC songs to fill gaps
  while (entries.length < maxSize) {
    const artist = r.pick(npcArtists);
    const position = entries.length + 1;
    const streamMultiplier = Math.pow(0.92, position - 1);
    const baseStreams = chartType === 'underground100' ? 300000 : 3000000;
    
    entries.push({
      songId: r.id(),
      artistName: artist.name,
      songTitle: generateSongTitle(),
      isPlayer: false,
      position: 0,
      lastPosition: null,
      peakPosition: position,
      weeksOnChart: 1,
      streams: Math.floor(baseStreams * streamMultiplier * r.float(0.5, 1.0)),
    });
  }
  
  // Sort by streams and assign positions
  entries.sort((a, b) => b.streams - a.streams);
  
  return entries.slice(0, maxSize).map((entry, index) => ({
    ...entry,
    position: index + 1,
    peakPosition: Math.min(entry.peakPosition, index + 1),
  }));
}

function updateTrendingChart(
  currentChart: ChartSong[],
  playerSongs: Song[],
  playerName: string,
  npcArtists: NPCArtist[]
): ChartSong[] {
  const r = rng();
  const entries: ChartSong[] = [];
  
  // Trending is based on momentum/growth, not raw streams
  // Player songs with growing streams
  const growingSongs = playerSongs.filter(s => 
    s.status === 'released' && 
    s.momentum > 1.1 &&
    s.weeklyStreams >= BALANCE.charts.trending25Entry
  );
  
  for (const song of growingSongs) {
    entries.push({
      songId: song.id,
      artistName: playerName,
      songTitle: song.title,
      isPlayer: true,
      position: 0,
      lastPosition: currentChart.find(e => e.songId === song.id)?.position || null,
      peakPosition: currentChart.find(e => e.songId === song.id)?.peakPosition || 25,
      weeksOnChart: (currentChart.find(e => e.songId === song.id)?.weeksOnChart || 0) + 1,
      streams: song.weeklyStreams,
    });
  }
  
  // Fill with NPCs
  while (entries.length < 25) {
    const artist = r.pick(npcArtists);
    entries.push({
      songId: r.id(),
      artistName: artist.name,
      songTitle: generateSongTitle(),
      isPlayer: false,
      position: 0,
      lastPosition: null,
      peakPosition: 25,
      weeksOnChart: 1,
      streams: r.int(30000, 500000),
    });
  }
  
  // Sort and assign positions
  entries.sort((a, b) => b.streams - a.streams);
  
  return entries.slice(0, 25).map((entry, index) => ({
    ...entry,
    position: index + 1,
    peakPosition: Math.min(entry.peakPosition, index + 1),
  }));
}

export function getChartMovement(current: number, last: number | null): string {
  if (last === null) return 'NEW';
  if (current < last) return `↑${last - current}`;
  if (current > last) return `↓${current - last}`;
  return '—';
}

export function formatChartPosition(position: number): string {
  if (position === 1) return '#1';
  return `#${position}`;
}
