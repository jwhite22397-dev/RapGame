// Core game type definitions

export type Genre = 
  | 'trap'
  | 'melodic-rap'
  | 'boom-bap'
  | 'alternative'
  | 'drill'
  | 'pop-rap'
  | 'experimental'
  | 'rnb-rap';

export type Archetype = 
  | 'lyricist'
  | 'performer'
  | 'hitmaker'
  | 'hustler'
  | 'internet-kid'
  | 'visionary';

export type CareerTier = 
  | 'unknown'
  | 'local'
  | 'buzzing'
  | 'underground'
  | 'breakout'
  | 'established'
  | 'star'
  | 'superstar'
  | 'icon';

export type RelationshipLevel = 
  | 'hostile'
  | 'cold'
  | 'neutral'
  | 'good'
  | 'close';

export type SongStatus = 
  | 'idea'
  | 'writing'
  | 'recorded'
  | 'mixed'
  | 'released';

export type ProjectType = 
  | 'single'
  | 'ep'
  | 'mixtape'
  | 'album';

export type FanTier = 
  | 'casual'
  | 'follower'
  | 'core'
  | 'superfan';

export type NPCCareerTier = 
  | 'local'
  | 'underground'
  | 'rising'
  | 'established'
  | 'superstar'
  | 'icon';

export type LabelType = 
  | 'major'
  | 'independent'
  | 'boutique'
  | 'artist-friendly'
  | 'aggressive';

export type VenueType = 
  | 'open-mic'
  | 'local-club'
  | 'small-venue'
  | 'theater'
  | 'arena'
  | 'festival'
  | 'stadium';

export type QualityDescriptor = 
  | 'terrible'
  | 'poor'
  | 'mediocre'
  | 'decent'
  | 'good'
  | 'great'
  | 'excellent'
  | 'masterpiece';

export interface PlayerAttributes {
  writing: number;
  flow: number;
  melody: number;
  performance: number;
  productionKnowledge: number;
  marketing: number;
  networking: number;
  business: number;
  workEthic: number;
  charisma: number;
}

export interface PlayerStats {
  cash: number;
  followers: number;
  monthlyListeners: number;
  totalStreams: number;
  careerEarnings: number;
  hype: number;
  energy: number;
  maxEnergy: number;
}

export interface ReputationStats {
  undergroundCredibility: number;
  mainstreamRecognition: number;
  industryRespect: number;
}

export interface FanBase {
  casual: number;
  followers: number;
  core: number;
  superfans: number;
}

export interface Player {
  id: string;
  artistName: string;
  realName: string;
  hometown: string;
  age: number;
  startingAge: number;
  genre: Genre;
  archetype: Archetype;
  attributes: PlayerAttributes;
  stats: PlayerStats;
  reputation: ReputationStats;
  fanBase: FanBase;
  careerTier: CareerTier;
  hasQuitDayJob: boolean;
  labelContract: LabelContract | null;
  milestones: string[];
  awards: Award[];
}

export interface Song {
  id: string;
  title: string;
  createdWeek: number;
  genre: Genre;
  status: SongStatus;
  releaseWeek: number | null;
  
  // Quality metrics (hidden from player)
  quality: number;
  commercialAppeal: number;
  virality: number;
  replayability: number;
  originality: number;
  productionQuality: number;
  lyricalQuality: number;
  performanceQuality: number;
  
  // Feature
  featureArtistId: string | null;
  featureArtistName: string | null;
  
  // Production
  producerId: string | null;
  producerName: string | null;
  
  // Release data
  marketingSpend: number;
  hasVideo: boolean;
  
  // Performance tracking
  totalStreams: number;
  weeklyStreams: number;
  peakWeeklyStreams: number;
  totalRevenue: number;
  momentum: number;
  
  // Chart data
  chartHistory: ChartEntry[];
  peakChartPosition: number | null;
  weeksOnChart: number;
  
  // Viral tracking
  isViral: boolean;
  viralStage: number;
}

export interface ChartEntry {
  week: number;
  position: number;
  chartType: string;
}

export interface Project {
  id: string;
  title: string;
  type: ProjectType;
  songIds: string[];
  releaseWeek: number | null;
  totalStreams: number;
  firstWeekStreams: number;
  criticScore: number | null;
  fanReception: number | null;
  review: string | null;
}

export interface Producer {
  id: string;
  name: string;
  quality: number;
  style: Genre[];
  basePrice: number;
  popularity: number;
  chemistry: number;
}

export interface NPCArtist {
  id: string;
  name: string;
  age: number;
  genre: Genre;
  careerTier: NPCCareerTier;
  popularity: number;
  hype: number;
  reputation: number;
  featurePrice: number;
  willingness: number;
  personality: 'friendly' | 'neutral' | 'difficult' | 'mysterious';
  relationshipWithPlayer: number;
  isActive: boolean;
  careerMomentum: number;
}

export interface Label {
  id: string;
  name: string;
  type: LabelType;
  prestige: number;
  marketingPower: number;
  artistRoster: string[];
}

export interface LabelOffer {
  id: string;
  labelId: string;
  labelName: string;
  advance: number;
  royaltyPercent: number;
  albumsRequired: number;
  masterOwnership: 'artist' | 'label' | 'split';
  marketingCommitment: number;
  recoupable: boolean;
  expiresWeek: number;
}

export interface LabelContract {
  labelId: string;
  labelName: string;
  signedWeek: number;
  advance: number;
  royaltyPercent: number;
  albumsRequired: number;
  albumsDelivered: number;
  masterOwnership: 'artist' | 'label' | 'split';
  marketingCommitment: number;
  recoupable: boolean;
  recouped: number;
  isActive: boolean;
}

export interface Venue {
  id: string;
  name: string;
  type: VenueType;
  city: string;
  capacity: number;
  basePay: number;
  prestigeRequired: number;
}

export interface ShowOffer {
  id: string;
  venueId: string;
  venueName: string;
  venueType: VenueType;
  city: string;
  pay: number;
  week: number;
  energyCost: number;
  expiresWeek: number;
}

export interface Relationship {
  entityId: string;
  entityType: 'artist' | 'producer' | 'manager' | 'executive' | 'promoter';
  entityName: string;
  level: number; // -100 to 100
}

export interface Award {
  id: string;
  name: string;
  category: string;
  year: number;
  week: number;
}

export interface GameEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  week: number;
  choices?: EventChoice[];
  resolved: boolean;
  choiceMade?: string;
  effects?: EventEffect[];
}

export interface EventChoice {
  id: string;
  text: string;
  cost?: { type: 'money' | 'energy'; amount: number };
  effects: EventEffect[];
}

export interface EventEffect {
  type: string;
  target?: string;
  value: number;
  description?: string;
}

export interface WeeklyRecap {
  week: number;
  streamsGained: number;
  followersGained: number;
  moneyEarned: number;
  moneySpent: number;
  hypeChange: number;
  events: string[];
  chartMovements: { songTitle: string; chart: string; movement: string }[];
  milestones: string[];
}

export interface NewsItem {
  id: string;
  week: number;
  headline: string;
  category: 'industry' | 'player' | 'npc' | 'chart';
}

export interface GameState {
  version: number;
  seed: number;
  currentWeek: number;
  player: Player;
  songs: Song[];
  projects: Project[];
  producers: Producer[];
  npcArtists: NPCArtist[];
  labels: Label[];
  labelOffers: LabelOffer[];
  showOffers: ShowOffer[];
  relationships: Relationship[];
  activeEvents: GameEvent[];
  eventHistory: GameEvent[];
  charts: ChartState;
  news: NewsItem[];
  weeklyRecaps: WeeklyRecap[];
  careerTimeline: TimelineEntry[];
}

export interface ChartState {
  top100: ChartSong[];
  rap50: ChartSong[];
  underground100: ChartSong[];
  trending25: ChartSong[];
}

export interface ChartSong {
  songId: string;
  artistName: string;
  songTitle: string;
  isPlayer: boolean;
  position: number;
  lastPosition: number | null;
  peakPosition: number;
  weeksOnChart: number;
  streams: number;
}

export interface TimelineEntry {
  week: number;
  age: number;
  event: string;
  type: 'milestone' | 'release' | 'contract' | 'achievement' | 'event';
}

export interface SaveData {
  version: number;
  timestamp: number;
  slotId: string;
  gameState: GameState;
  rngState: number[];
}
