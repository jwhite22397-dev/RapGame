// Centralized game balance constants
// All tunable values for easy adjustment

export const BALANCE = {
  // Starting conditions ranges
  starting: {
    cash: { min: 150, max: 500 },
    followers: { min: 30, max: 150 },
    hype: { min: 1, max: 5 },
    energy: 100,
    maxEnergy: 100,
  },
  
  // Energy costs for actions
  energy: {
    write: 25,
    record: 30,
    makeBeats: 25,
    practice: 20,
    postContent: 15,
    shootVideo: 35,
    network: 25,
    performLocalShow: 35,
    performMediumShow: 45,
    performLargeShow: 60,
    rest: -50, // Restores energy
    workJob: 45,
    collaborate: 35,
    promote: 20,
  },
  
  // Weekly energy recovery
  energyRecovery: {
    base: 70,
    restBonus: 30,
  },
  
  // Day job
  dayJob: {
    basePay: { min: 350, max: 650 },
    energyCost: 45,
  },
  
  // Streaming economics
  streaming: {
    ratePerStream: 0.004, // $0.004 per stream
    labelCut: 0.15, // Labels take 15% before royalty split
    playlistMultiplier: 2.5,
    viralMultiplier: { min: 3, max: 15 },
    weeklyDecayRate: 0.92, // Songs lose ~8% streams per week
    catalogMinimum: 0.05, // Songs never go below 5% of peak
  },
  
  // Song quality factors
  songQuality: {
    attributeWeight: 0.6,
    producerWeight: 0.25,
    randomWeight: 0.15,
    collaborationBonus: 0.1,
    experienceBonus: 0.002, // Per song released
    maxExperienceBonus: 0.15,
  },
  
  // Attribute progression
  attributes: {
    baseGain: 0.5,
    diminishingReturnsStart: 50,
    diminishingReturnsRate: 0.02,
    maxValue: 100,
  },
  
  // Fan conversion rates
  fans: {
    casualToFollower: 0.05,
    followerToCore: 0.02,
    coreToSuperfan: 0.005,
    streamMultiplier: {
      casual: 1,
      follower: 2,
      core: 5,
      superfan: 15,
    },
  },
  
  // Hype mechanics
  hype: {
    maxValue: 100,
    weeklyDecay: 0.95,
    releaseBoost: { min: 3, max: 15 },
    showBoost: { min: 1, max: 10 },
    contentBoost: { min: 0.5, max: 3 },
    viralBoost: { min: 10, max: 40 },
  },
  
  // Reputation
  reputation: {
    maxValue: 100,
    qualityWeight: 0.6,
    consistencyWeight: 0.3,
    buzzWeight: 0.1,
  },
  
  // Marketing
  marketing: {
    tiers: [
      { cost: 0, reachMultiplier: 1 },
      { cost: 100, reachMultiplier: 1.5 },
      { cost: 500, reachMultiplier: 2.5 },
      { cost: 2500, reachMultiplier: 5 },
      { cost: 10000, reachMultiplier: 10 },
      { cost: 50000, reachMultiplier: 20 },
    ],
  },
  
  // Chart thresholds (weekly streams needed)
  charts: {
    underground100Entry: 1000,
    rap50Entry: 10000,
    top100Entry: 50000,
    trending25Entry: 25000,
  },
  
  // Career tier thresholds
  careerTiers: {
    unknown: { followers: 0, monthlyListeners: 0 },
    local: { followers: 500, monthlyListeners: 1000 },
    buzzing: { followers: 2500, monthlyListeners: 10000 },
    underground: { followers: 10000, monthlyListeners: 50000 },
    breakout: { followers: 50000, monthlyListeners: 250000 },
    established: { followers: 250000, monthlyListeners: 1000000 },
    star: { followers: 1000000, monthlyListeners: 5000000 },
    superstar: { followers: 5000000, monthlyListeners: 20000000 },
    icon: { followers: 20000000, monthlyListeners: 50000000 },
  },
  
  // Show pay scales
  shows: {
    'open-mic': { basePay: 0, maxPay: 50, capacity: 50 },
    'local-club': { basePay: 50, maxPay: 300, capacity: 150 },
    'small-venue': { basePay: 200, maxPay: 1500, capacity: 500 },
    'theater': { basePay: 2000, maxPay: 15000, capacity: 2000 },
    'arena': { basePay: 25000, maxPay: 150000, capacity: 15000 },
    'festival': { basePay: 10000, maxPay: 500000, capacity: 50000 },
    'stadium': { basePay: 200000, maxPay: 2000000, capacity: 60000 },
  },
  
  // Label interest thresholds
  labels: {
    boutique: { followers: 5000, hype: 15 },
    independent: { followers: 25000, hype: 25 },
    artistFriendly: { followers: 50000, hype: 35 },
    major: { followers: 100000, hype: 50 },
    aggressive: { followers: 150000, hype: 45 },
  },
  
  // Viral probability thresholds
  viral: {
    baseChance: 0.002,
    qualityMultiplier: 0.001,
    hypenessMultiplier: 0.0005,
    stages: [
      { name: 'small spike', multiplier: 3, chance: 0.7 },
      { name: 'regional buzz', multiplier: 5, chance: 0.4 },
      { name: 'internet trend', multiplier: 10, chance: 0.2 },
      { name: 'major viral moment', multiplier: 25, chance: 0.08 },
      { name: 'global breakout', multiplier: 50, chance: 0.02 },
    ],
  },
  
  // Content posting
  content: {
    snippet: { engagement: 1.2, energy: 10 },
    freestyle: { engagement: 1.5, energy: 20 },
    behindTheScenes: { engagement: 0.8, energy: 10 },
    musicVideoClip: { engagement: 2.0, energy: 15 },
    personalPost: { engagement: 0.6, energy: 5 },
    controversialTake: { engagement: 2.5, energy: 10, riskFactor: 0.3 },
    performanceClip: { engagement: 1.8, energy: 15 },
  },
  
  // Music video costs
  musicVideo: {
    basic: 800,
    standard: 2500,
    professional: 10000,
    premium: 50000,
  },
  
  // Producer costs
  producers: {
    unknown: { min: 100, max: 300 },
    developing: { min: 300, max: 800 },
    established: { min: 800, max: 2500 },
    hot: { min: 2500, max: 10000 },
    elite: { min: 10000, max: 50000 },
  },
  
  // Feature costs
  features: {
    local: { min: 0, max: 200 },
    underground: { min: 200, max: 1000 },
    rising: { min: 1000, max: 5000 },
    established: { min: 5000, max: 25000 },
    superstar: { min: 50000, max: 200000 },
    icon: { min: 200000, max: 1000000 },
  },
  
  // Milestones
  milestones: {
    streams: [1000, 10000, 100000, 1000000, 10000000, 100000000, 1000000000],
    followers: [100, 1000, 10000, 100000, 1000000, 10000000],
    cash: [1000, 10000, 100000, 1000000, 10000000, 100000000],
  },
  
  // Awards (annual)
  awards: {
    nominationThreshold: {
      artistOfYear: { tier: 'star', followers: 500000 },
      albumOfYear: { streams: 10000000 },
      songOfYear: { streams: 50000000 },
      breakthrough: { tier: 'breakout', weeksActive: 52 },
    },
  },
} as const;

export type BalanceConfig = typeof BALANCE;
