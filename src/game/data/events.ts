import type { CareerTier, GameEvent, EventEffect } from '../models/types';

export interface EventTemplate {
  id: string;
  type: string;
  title: string;
  description: string;
  rarity: number; // 0-1, lower = rarer
  cooldownWeeks: number;
  requirements?: {
    minCareerTier?: CareerTier;
    maxCareerTier?: CareerTier;
    minCash?: number;
    minFollowers?: number;
    minHype?: number;
    hasReleasedSong?: boolean;
    hasDayJob?: boolean;
    isIndependent?: boolean;
    hasPendingOffer?: boolean;
  };
  choices: EventChoiceTemplate[];
  tags: string[];
}

export interface EventChoiceTemplate {
  id: string;
  text: string;
  cost?: { type: 'money' | 'energy'; amount: number };
  effects: EventEffect[];
  successChance?: number;
  outcomeText?: { success: string; failure: string };
}

export const EVENT_TEMPLATES: EventTemplate[] = [
  // OPPORTUNITY EVENTS
  {
    id: 'local-promoter-show',
    type: 'opportunity',
    title: 'Local Show Opportunity',
    description: 'A promoter from {city} heard your music and wants to book you for a small show.',
    rarity: 0.4,
    cooldownWeeks: 4,
    requirements: { hasReleasedSong: true },
    choices: [
      {
        id: 'accept',
        text: 'Accept the booking',
        cost: { type: 'energy', amount: 35 },
        effects: [
          { type: 'money', value: 150 },
          { type: 'hype', value: 2 },
          { type: 'attribute', target: 'performance', value: 1 },
          { type: 'followers', value: 25 },
        ],
      },
      {
        id: 'decline',
        text: 'Pass on it',
        effects: [],
      },
    ],
    tags: ['show', 'opportunity'],
  },
  {
    id: 'producer-beats',
    type: 'opportunity',
    title: 'Producer Reaches Out',
    description: 'A producer named {producerName} sent you some beats. They sound {quality}.',
    rarity: 0.35,
    cooldownWeeks: 3,
    requirements: { hasReleasedSong: true },
    choices: [
      {
        id: 'work-together',
        text: 'Start working together',
        effects: [
          { type: 'unlock-producer', value: 1 },
          { type: 'relationship', target: 'producer', value: 10 },
        ],
      },
      {
        id: 'pass',
        text: 'Not feeling the sound',
        effects: [],
      },
    ],
    tags: ['producer', 'opportunity'],
  },
  {
    id: 'blog-feature',
    type: 'opportunity',
    title: 'Blog Wants to Feature You',
    description: 'An underground music blog wants to write about your latest release.',
    rarity: 0.3,
    cooldownWeeks: 6,
    requirements: { hasReleasedSong: true, minHype: 10 },
    choices: [
      {
        id: 'accept',
        text: 'Do the interview',
        cost: { type: 'energy', amount: 15 },
        effects: [
          { type: 'hype', value: 5 },
          { type: 'followers', value: 100 },
          { type: 'reputation', target: 'underground', value: 3 },
        ],
      },
      {
        id: 'decline',
        text: 'Too busy right now',
        effects: [],
      },
    ],
    tags: ['press', 'opportunity'],
  },
  {
    id: 'studio-discount',
    type: 'opportunity',
    title: 'Studio Time Deal',
    description: 'Your engineer is offering discounted studio time this week - 50% off.',
    rarity: 0.25,
    cooldownWeeks: 8,
    requirements: {},
    choices: [
      {
        id: 'book-session',
        text: 'Book the session',
        cost: { type: 'money', amount: 150 },
        effects: [
          { type: 'studio-credit', value: 2 },
        ],
      },
      {
        id: 'skip',
        text: 'Save the money',
        effects: [],
      },
    ],
    tags: ['studio', 'opportunity'],
  },
  {
    id: 'collab-request',
    type: 'opportunity',
    title: 'Collaboration Request',
    description: '{artistName} wants to do a song together. They have {followers} followers.',
    rarity: 0.2,
    cooldownWeeks: 5,
    requirements: { hasReleasedSong: true, minFollowers: 500 },
    choices: [
      {
        id: 'accept',
        text: 'Let\'s make it happen',
        effects: [
          { type: 'start-collab', value: 1 },
          { type: 'relationship', target: 'artist', value: 15 },
        ],
      },
      {
        id: 'decline',
        text: 'Not the right fit',
        effects: [
          { type: 'relationship', target: 'artist', value: -5 },
        ],
      },
    ],
    tags: ['collaboration', 'opportunity'],
  },
  
  // SOCIAL EVENTS
  {
    id: 'snippet-attention',
    type: 'social',
    title: 'Snippet Getting Attention',
    description: 'A snippet you posted is getting more attention than usual. People want the full song.',
    rarity: 0.15,
    cooldownWeeks: 6,
    requirements: { hasReleasedSong: true, minFollowers: 200 },
    choices: [
      {
        id: 'rush-release',
        text: 'Drop it immediately',
        effects: [
          { type: 'hype', value: 8 },
          { type: 'song-boost', target: 'latest', value: 1.5 },
        ],
      },
      {
        id: 'build-hype',
        text: 'Tease it more first',
        effects: [
          { type: 'hype', value: 4 },
          { type: 'next-release-boost', value: 1.3 },
        ],
      },
      {
        id: 'ignore',
        text: 'Keep working on it',
        effects: [],
      },
    ],
    tags: ['social', 'viral'],
  },
  {
    id: 'fan-page-appears',
    type: 'social',
    title: 'Fan Page Created',
    description: 'Someone created a fan page dedicated to your music. You have real fans now.',
    rarity: 0.1,
    cooldownWeeks: 52,
    requirements: { minFollowers: 1000 },
    choices: [
      {
        id: 'acknowledge',
        text: 'Shout them out',
        effects: [
          { type: 'hype', value: 3 },
          { type: 'core-fans', value: 50 },
        ],
      },
      {
        id: 'ignore',
        text: 'Stay mysterious',
        effects: [
          { type: 'core-fans', value: 20 },
        ],
      },
    ],
    tags: ['social', 'milestone'],
  },
  {
    id: 'controversial-post',
    type: 'social',
    title: 'Post Goes Controversial',
    description: 'Something you posted is causing debate. People are taking sides.',
    rarity: 0.12,
    cooldownWeeks: 10,
    requirements: { minFollowers: 500 },
    choices: [
      {
        id: 'double-down',
        text: 'Stand on it',
        effects: [
          { type: 'hype', value: 10 },
          { type: 'followers', value: 500 },
          { type: 'core-fans', value: -100 },
          { type: 'reputation', target: 'industry', value: -5 },
        ],
        successChance: 0.6,
        outcomeText: {
          success: 'People respect you for staying real.',
          failure: 'The backlash is worse than expected.',
        },
      },
      {
        id: 'delete',
        text: 'Delete and move on',
        effects: [
          { type: 'hype', value: -2 },
        ],
      },
      {
        id: 'clarify',
        text: 'Explain what you meant',
        effects: [
          { type: 'hype', value: 3 },
        ],
      },
    ],
    tags: ['social', 'controversy'],
  },
  
  // SETBACK EVENTS
  {
    id: 'laptop-breaks',
    type: 'setback',
    title: 'Equipment Failure',
    description: 'Your laptop crashed and you lost some unreleased work.',
    rarity: 0.08,
    cooldownWeeks: 26,
    requirements: {},
    choices: [
      {
        id: 'buy-new',
        text: 'Buy new equipment',
        cost: { type: 'money', amount: 800 },
        effects: [
          { type: 'attribute', target: 'productionKnowledge', value: 2 },
        ],
      },
      {
        id: 'repair',
        text: 'Try to repair it',
        cost: { type: 'money', amount: 200 },
        effects: [],
        successChance: 0.5,
        outcomeText: {
          success: 'Managed to recover most files.',
          failure: 'Lost the work for good.',
        },
      },
      {
        id: 'borrow',
        text: 'Borrow equipment for now',
        effects: [
          { type: 'energy-penalty', value: -10 },
        ],
      },
    ],
    tags: ['setback', 'equipment'],
  },
  {
    id: 'show-cancels',
    type: 'setback',
    title: 'Show Cancelled',
    description: 'A venue cancelled your upcoming show without warning.',
    rarity: 0.1,
    cooldownWeeks: 12,
    requirements: { minCareerTier: 'local' },
    choices: [
      {
        id: 'find-another',
        text: 'Try to find another venue',
        cost: { type: 'energy', amount: 25 },
        effects: [],
        successChance: 0.4,
        outcomeText: {
          success: 'Found a last-minute replacement.',
          failure: 'No luck this time.',
        },
      },
      {
        id: 'accept',
        text: 'Accept it and focus on music',
        effects: [
          { type: 'attribute', target: 'writing', value: 1 },
        ],
      },
    ],
    tags: ['setback', 'show'],
  },
  {
    id: 'collab-falls-through',
    type: 'setback',
    title: 'Collaboration Falls Through',
    description: 'An artist you were working with ghosted and never sent their verse.',
    rarity: 0.15,
    cooldownWeeks: 8,
    requirements: { hasReleasedSong: true },
    choices: [
      {
        id: 'release-solo',
        text: 'Release it as a solo track',
        effects: [
          { type: 'song-quality-penalty', value: -5 },
        ],
      },
      {
        id: 'find-replacement',
        text: 'Find a replacement feature',
        cost: { type: 'energy', amount: 20 },
        effects: [],
        successChance: 0.6,
        outcomeText: {
          success: 'Found someone even better.',
          failure: 'Couldn\'t find anyone in time.',
        },
      },
      {
        id: 'scrap',
        text: 'Scrap the track',
        effects: [],
      },
    ],
    tags: ['setback', 'collaboration'],
  },
  {
    id: 'bad-review',
    type: 'setback',
    title: 'Negative Review',
    description: 'A blogger wrote a harsh review of your latest release.',
    rarity: 0.2,
    cooldownWeeks: 6,
    requirements: { hasReleasedSong: true, minFollowers: 1000 },
    choices: [
      {
        id: 'respond',
        text: 'Respond publicly',
        effects: [
          { type: 'hype', value: 3 },
          { type: 'reputation', target: 'industry', value: -3 },
        ],
      },
      {
        id: 'ignore',
        text: 'Let the music speak',
        effects: [
          { type: 'reputation', target: 'underground', value: 2 },
        ],
      },
      {
        id: 'learn',
        text: 'Take the criticism seriously',
        effects: [
          { type: 'attribute', target: 'writing', value: 2 },
          { type: 'hype', value: -1 },
        ],
      },
    ],
    tags: ['setback', 'press'],
  },
  
  // INDUSTRY EVENTS
  {
    id: 'manager-interest',
    type: 'industry',
    title: 'Manager Interested',
    description: 'Someone who manages artists wants to talk about working together.',
    rarity: 0.08,
    cooldownWeeks: 16,
    requirements: { minFollowers: 5000, isIndependent: true },
    choices: [
      {
        id: 'meet',
        text: 'Take the meeting',
        cost: { type: 'energy', amount: 15 },
        effects: [
          { type: 'relationship', target: 'manager', value: 20 },
          { type: 'attribute', target: 'networking', value: 2 },
        ],
      },
      {
        id: 'decline',
        text: 'Not ready for that',
        effects: [],
      },
    ],
    tags: ['industry', 'opportunity'],
  },
  {
    id: 'label-scout',
    type: 'industry',
    title: 'Label Scout at Show',
    description: 'You notice someone from a record label at your show.',
    rarity: 0.06,
    cooldownWeeks: 12,
    requirements: { minFollowers: 10000 },
    choices: [
      {
        id: 'perform-hard',
        text: 'Give the performance of your life',
        cost: { type: 'energy', amount: 20 },
        effects: [
          { type: 'label-interest', value: 15 },
          { type: 'reputation', target: 'industry', value: 5 },
        ],
      },
      {
        id: 'normal',
        text: 'Just do your thing',
        effects: [
          { type: 'label-interest', value: 5 },
        ],
      },
    ],
    tags: ['industry', 'label'],
  },
  {
    id: 'playlist-curator',
    type: 'industry',
    title: 'Playlist Curator Notice',
    description: 'A popular playlist curator messaged you about your latest song.',
    rarity: 0.12,
    cooldownWeeks: 8,
    requirements: { hasReleasedSong: true, minFollowers: 2000 },
    choices: [
      {
        id: 'send-track',
        text: 'Send them the track',
        effects: [
          { type: 'playlist-chance', value: 0.3 },
          { type: 'relationship', target: 'curator', value: 10 },
        ],
      },
      {
        id: 'ignore',
        text: 'Stay independent',
        effects: [],
      },
    ],
    tags: ['industry', 'playlist'],
  },
  
  // SUCCESS EVENTS
  {
    id: 'show-goes-crazy',
    type: 'success',
    title: 'Show Goes Incredible',
    description: 'Tonight\'s show exceeded all expectations. The crowd was electric.',
    rarity: 0.15,
    cooldownWeeks: 6,
    requirements: { minCareerTier: 'local' },
    choices: [
      {
        id: 'celebrate',
        text: 'Celebrate with the team',
        effects: [
          { type: 'hype', value: 8 },
          { type: 'followers', value: 200 },
          { type: 'core-fans', value: 100 },
          { type: 'attribute', target: 'performance', value: 2 },
        ],
      },
    ],
    tags: ['success', 'show'],
  },
  {
    id: 'big-artist-cosign',
    type: 'success',
    title: 'Major Cosign',
    description: 'A much bigger artist posted about your music. Your notifications are going crazy.',
    rarity: 0.03,
    cooldownWeeks: 26,
    requirements: { minFollowers: 5000 },
    choices: [
      {
        id: 'thank',
        text: 'Publicly thank them',
        effects: [
          { type: 'hype', value: 25 },
          { type: 'followers', value: 2000 },
          { type: 'reputation', target: 'industry', value: 10 },
          { type: 'relationship', target: 'cosign-artist', value: 20 },
        ],
      },
      {
        id: 'play-cool',
        text: 'Play it cool',
        effects: [
          { type: 'hype', value: 20 },
          { type: 'followers', value: 1500 },
          { type: 'reputation', target: 'underground', value: 5 },
        ],
      },
    ],
    tags: ['success', 'viral'],
  },
  {
    id: 'song-placement',
    type: 'success',
    title: 'Song Placed',
    description: 'Your song was placed in a popular video/show. Streams are spiking.',
    rarity: 0.04,
    cooldownWeeks: 20,
    requirements: { hasReleasedSong: true, minFollowers: 10000 },
    choices: [
      {
        id: 'capitalize',
        text: 'Capitalize on the moment',
        cost: { type: 'money', amount: 500 },
        effects: [
          { type: 'song-boost', target: 'placed', value: 3 },
          { type: 'hype', value: 15 },
          { type: 'money', value: 5000 },
        ],
      },
      {
        id: 'let-ride',
        text: 'Let it ride',
        effects: [
          { type: 'song-boost', target: 'placed', value: 2 },
          { type: 'hype', value: 8 },
          { type: 'money', value: 3000 },
        ],
      },
    ],
    tags: ['success', 'placement'],
  },
  
  // FINANCIAL EVENTS
  {
    id: 'unexpected-royalties',
    type: 'financial',
    title: 'Royalty Check',
    description: 'You received a larger than expected royalty payment from back catalog streams.',
    rarity: 0.15,
    cooldownWeeks: 12,
    requirements: { hasReleasedSong: true },
    choices: [
      {
        id: 'collect',
        text: 'Nice!',
        effects: [
          { type: 'money', value: 500 },
        ],
      },
    ],
    tags: ['financial', 'positive'],
  },
  {
    id: 'expensive-month',
    type: 'financial',
    title: 'Expensive Month',
    description: 'Life hit you with unexpected expenses this month.',
    rarity: 0.12,
    cooldownWeeks: 8,
    requirements: {},
    choices: [
      {
        id: 'pay',
        text: 'Handle it',
        cost: { type: 'money', amount: 400 },
        effects: [],
      },
      {
        id: 'work-extra',
        text: 'Pick up extra work shifts',
        cost: { type: 'energy', amount: 40 },
        effects: [
          { type: 'money', value: 600 },
        ],
      },
    ],
    tags: ['financial', 'setback'],
  },
  
  // PERSONAL EVENTS
  {
    id: 'creative-breakthrough',
    type: 'personal',
    title: 'Creative Breakthrough',
    description: 'Something clicked. You feel more inspired than you have in weeks.',
    rarity: 0.1,
    cooldownWeeks: 10,
    requirements: {},
    choices: [
      {
        id: 'channel',
        text: 'Channel it into music',
        cost: { type: 'energy', amount: 30 },
        effects: [
          { type: 'next-song-quality', value: 15 },
          { type: 'attribute', target: 'writing', value: 2 },
        ],
      },
      {
        id: 'rest',
        text: 'Save the energy',
        effects: [
          { type: 'next-song-quality', value: 5 },
        ],
      },
    ],
    tags: ['personal', 'positive'],
  },
  {
    id: 'burnout-warning',
    type: 'personal',
    title: 'Feeling Burned Out',
    description: 'You\'ve been grinding hard. The fatigue is starting to show.',
    rarity: 0.15,
    cooldownWeeks: 16,
    requirements: {},
    choices: [
      {
        id: 'rest',
        text: 'Take time to recharge',
        effects: [
          { type: 'energy-recovery-bonus', value: 30 },
          { type: 'hype', value: -2 },
        ],
      },
      {
        id: 'push-through',
        text: 'Push through it',
        effects: [
          { type: 'energy-penalty', value: -20 },
          { type: 'attribute', target: 'workEthic', value: 2 },
        ],
      },
    ],
    tags: ['personal', 'warning'],
  },
  {
    id: 'local-legend-advice',
    type: 'personal',
    title: 'Advice from a Veteran',
    description: 'An older artist from your city reaches out with some career advice.',
    rarity: 0.08,
    cooldownWeeks: 20,
    requirements: { minCareerTier: 'local' },
    choices: [
      {
        id: 'listen',
        text: 'Listen carefully',
        effects: [
          { type: 'attribute', target: 'business', value: 3 },
          { type: 'attribute', target: 'networking', value: 2 },
          { type: 'relationship', target: 'mentor', value: 15 },
        ],
      },
      {
        id: 'dismiss',
        text: 'Your generation is different',
        effects: [],
      },
    ],
    tags: ['personal', 'mentor'],
  },
  
  // VIRAL EVENTS (special category)
  {
    id: 'tiktok-moment',
    type: 'viral',
    title: 'Content Going Viral',
    description: 'Creators are using your song in their videos. Streams are climbing fast.',
    rarity: 0.02,
    cooldownWeeks: 12,
    requirements: { hasReleasedSong: true },
    choices: [
      {
        id: 'create-trend',
        text: 'Post your own video with a dance/meme',
        cost: { type: 'energy', amount: 20 },
        effects: [
          { type: 'viral-boost', value: 2 },
          { type: 'hype', value: 20 },
        ],
        successChance: 0.5,
        outcomeText: {
          success: 'Your video takes off and accelerates the trend.',
          failure: 'It didn\'t land, but the song is still moving.',
        },
      },
      {
        id: 'promo-spend',
        text: 'Spend $2,500 on promotion',
        cost: { type: 'money', amount: 2500 },
        effects: [
          { type: 'viral-boost', value: 1.5 },
          { type: 'hype', value: 15 },
        ],
      },
      {
        id: 'let-grow',
        text: 'Let it grow organically',
        effects: [
          { type: 'viral-boost', value: 1 },
          { type: 'hype', value: 10 },
          { type: 'reputation', target: 'underground', value: 3 },
        ],
      },
    ],
    tags: ['viral', 'major'],
  },
  {
    id: 'meme-potential',
    type: 'viral',
    title: 'Meme Potential',
    description: 'A moment from your video/song is becoming a meme format.',
    rarity: 0.03,
    cooldownWeeks: 16,
    requirements: { hasReleasedSong: true, minFollowers: 3000 },
    choices: [
      {
        id: 'lean-in',
        text: 'Lean into it',
        effects: [
          { type: 'hype', value: 15 },
          { type: 'followers', value: 1000 },
          { type: 'reputation', target: 'mainstream', value: 3 },
          { type: 'reputation', target: 'underground', value: -2 },
        ],
      },
      {
        id: 'distance',
        text: 'Distance yourself from it',
        effects: [
          { type: 'hype', value: 5 },
          { type: 'reputation', target: 'underground', value: 2 },
        ],
      },
    ],
    tags: ['viral', 'meme'],
  },
];

export function getEligibleEvents(
  state: {
    careerTier: CareerTier;
    cash: number;
    followers: number;
    hype: number;
    hasReleasedSong: boolean;
    hasContract: boolean;
  },
  eventHistory: GameEvent[],
  currentWeek: number
): EventTemplate[] {
  const tierOrder: CareerTier[] = [
    'unknown', 'local', 'buzzing', 'underground', 'breakout',
    'established', 'star', 'superstar', 'icon'
  ];
  const currentTierIndex = tierOrder.indexOf(state.careerTier);

  return EVENT_TEMPLATES.filter(template => {
    const req = template.requirements || {};
    
    // Check career tier bounds
    if (req.minCareerTier) {
      const minIndex = tierOrder.indexOf(req.minCareerTier);
      if (currentTierIndex < minIndex) return false;
    }
    if (req.maxCareerTier) {
      const maxIndex = tierOrder.indexOf(req.maxCareerTier);
      if (currentTierIndex > maxIndex) return false;
    }
    
    // Check other requirements
    if (req.minCash && state.cash < req.minCash) return false;
    if (req.minFollowers && state.followers < req.minFollowers) return false;
    if (req.minHype && state.hype < req.minHype) return false;
    if (req.hasReleasedSong && !state.hasReleasedSong) return false;
    if (req.isIndependent && state.hasContract) return false;
    
    // Check cooldown
    const lastOccurrence = eventHistory.find(e => e.type === template.id);
    if (lastOccurrence && currentWeek - lastOccurrence.week < template.cooldownWeeks) {
      return false;
    }
    
    return true;
  });
}
