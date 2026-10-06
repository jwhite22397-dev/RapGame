export interface MilestoneTemplate {
  id: string;
  name: string;
  description: string;
  category: 'streams' | 'followers' | 'money' | 'chart' | 'career' | 'release' | 'show' | 'achievement';
  condition: (state: MilestoneCheckState) => boolean;
  celebrationText: string;
  icon: string;
}

export interface MilestoneCheckState {
  totalStreams: number;
  followers: number;
  cash: number;
  careerEarnings: number;
  monthlyListeners: number;
  songsReleased: number;
  projectsReleased: number;
  showsPerformed: number;
  chartsEntered: number;
  peakChartPosition: number | null;
  hasQuitDayJob: boolean;
  hasLabel: boolean;
  careerTier: string;
  goldRecords: number;
  platinumRecords: number;
  awardCount: number;
}

export const MILESTONES: MilestoneTemplate[] = [
  // Stream milestones
  {
    id: 'streams-1k',
    name: 'First 1,000 Streams',
    description: 'Your music has been streamed 1,000 times.',
    category: 'streams',
    condition: (s) => s.totalStreams >= 1000,
    celebrationText: 'People are actually listening!',
    icon: '🎵',
  },
  {
    id: 'streams-10k',
    name: '10K Streams',
    description: 'Your music has been streamed 10,000 times.',
    category: 'streams',
    condition: (s) => s.totalStreams >= 10000,
    celebrationText: 'You\'re building real momentum.',
    icon: '🎵',
  },
  {
    id: 'streams-100k',
    name: '100K Streams',
    description: 'Your music has been streamed 100,000 times.',
    category: 'streams',
    condition: (s) => s.totalStreams >= 100000,
    celebrationText: 'A hundred thousand people have heard your voice.',
    icon: '🔥',
  },
  {
    id: 'streams-1m',
    name: 'First Million',
    description: 'Your music has been streamed 1,000,000 times.',
    category: 'streams',
    condition: (s) => s.totalStreams >= 1000000,
    celebrationText: 'One million streams. This is real.',
    icon: '💫',
  },
  {
    id: 'streams-10m',
    name: '10 Million Streams',
    description: 'Your music has been streamed 10,000,000 times.',
    category: 'streams',
    condition: (s) => s.totalStreams >= 10000000,
    celebrationText: 'Ten million streams. You\'re undeniable.',
    icon: '⭐',
  },
  {
    id: 'streams-100m',
    name: '100 Million Streams',
    description: 'Your music has been streamed 100,000,000 times.',
    category: 'streams',
    condition: (s) => s.totalStreams >= 100000000,
    celebrationText: 'One hundred million. You\'re a phenomenon.',
    icon: '👑',
  },
  
  // Follower milestones
  {
    id: 'followers-100',
    name: 'First 100 Followers',
    description: 'You have 100 people following your journey.',
    category: 'followers',
    condition: (s) => s.followers >= 100,
    celebrationText: 'Your first real audience.',
    icon: '👥',
  },
  {
    id: 'followers-1k',
    name: '1K Followers',
    description: 'You have 1,000 followers.',
    category: 'followers',
    condition: (s) => s.followers >= 1000,
    celebrationText: 'A thousand people believe in you.',
    icon: '👥',
  },
  {
    id: 'followers-10k',
    name: '10K Followers',
    description: 'You have 10,000 followers.',
    category: 'followers',
    condition: (s) => s.followers >= 10000,
    celebrationText: 'You have a real fanbase now.',
    icon: '🔥',
  },
  {
    id: 'followers-100k',
    name: '100K Followers',
    description: 'You have 100,000 followers.',
    category: 'followers',
    condition: (s) => s.followers >= 100000,
    celebrationText: 'A hundred thousand strong.',
    icon: '💫',
  },
  {
    id: 'followers-1m',
    name: '1 Million Followers',
    description: 'You have 1,000,000 followers.',
    category: 'followers',
    condition: (s) => s.followers >= 1000000,
    celebrationText: 'One million people rocking with you.',
    icon: '⭐',
  },
  
  // Money milestones
  {
    id: 'money-1k',
    name: 'First $1,000',
    description: 'You\'ve earned $1,000 from your music career.',
    category: 'money',
    condition: (s) => s.careerEarnings >= 1000,
    celebrationText: 'Your music is making real money.',
    icon: '💵',
  },
  {
    id: 'money-10k',
    name: '$10,000 Earned',
    description: 'You\'ve earned $10,000 from your music career.',
    category: 'money',
    condition: (s) => s.careerEarnings >= 10000,
    celebrationText: 'Ten thousand dollars from doing what you love.',
    icon: '💵',
  },
  {
    id: 'money-100k',
    name: '$100,000 Earned',
    description: 'You\'ve earned $100,000 from your music career.',
    category: 'money',
    condition: (s) => s.careerEarnings >= 100000,
    celebrationText: 'Six figures from music. The dream is real.',
    icon: '💰',
  },
  {
    id: 'money-1m',
    name: 'First Million',
    description: 'You\'ve earned $1,000,000 from your music career.',
    category: 'money',
    condition: (s) => s.careerEarnings >= 1000000,
    celebrationText: 'You\'re a millionaire.',
    icon: '💎',
  },
  
  // Chart milestones
  {
    id: 'chart-entry',
    name: 'First Chart Entry',
    description: 'Your song appeared on a chart for the first time.',
    category: 'chart',
    condition: (s) => s.chartsEntered >= 1,
    celebrationText: 'You\'re on the charts!',
    icon: '📊',
  },
  {
    id: 'chart-top50',
    name: 'Top 50',
    description: 'You reached the Top 50.',
    category: 'chart',
    condition: (s) => s.peakChartPosition !== null && s.peakChartPosition <= 50,
    celebrationText: 'Breaking into the Top 50.',
    icon: '📊',
  },
  {
    id: 'chart-top10',
    name: 'Top 10',
    description: 'You reached the Top 10.',
    category: 'chart',
    condition: (s) => s.peakChartPosition !== null && s.peakChartPosition <= 10,
    celebrationText: 'You\'re in the Top 10!',
    icon: '🏆',
  },
  {
    id: 'chart-number1',
    name: '#1 Record',
    description: 'You have a #1 song.',
    category: 'chart',
    condition: (s) => s.peakChartPosition === 1,
    celebrationText: 'NUMBER ONE. You did it.',
    icon: '👑',
  },
  
  // Career milestones
  {
    id: 'quit-day-job',
    name: 'Full-Time Artist',
    description: 'You quit your day job to focus on music.',
    category: 'career',
    condition: (s) => s.hasQuitDayJob,
    celebrationText: 'Music is your job now.',
    icon: '🎤',
  },
  {
    id: 'signed',
    name: 'Signed',
    description: 'You signed your first record deal.',
    category: 'career',
    condition: (s) => s.hasLabel,
    celebrationText: 'You\'re a signed artist.',
    icon: '📝',
  },
  {
    id: 'tier-buzzing',
    name: 'Buzzing',
    description: 'You\'ve reached buzzing status.',
    category: 'career',
    condition: (s) => ['buzzing', 'underground', 'breakout', 'established', 'star', 'superstar', 'icon'].includes(s.careerTier),
    celebrationText: 'People are starting to talk.',
    icon: '🐝',
  },
  {
    id: 'tier-breakout',
    name: 'Breakout',
    description: 'You\'ve broken out.',
    category: 'career',
    condition: (s) => ['breakout', 'established', 'star', 'superstar', 'icon'].includes(s.careerTier),
    celebrationText: 'You broke through.',
    icon: '🚀',
  },
  {
    id: 'tier-star',
    name: 'Star',
    description: 'You\'re a star.',
    category: 'career',
    condition: (s) => ['star', 'superstar', 'icon'].includes(s.careerTier),
    celebrationText: 'You\'re a star now.',
    icon: '⭐',
  },
  {
    id: 'tier-superstar',
    name: 'Superstar',
    description: 'You\'re a superstar.',
    category: 'career',
    condition: (s) => ['superstar', 'icon'].includes(s.careerTier),
    celebrationText: 'Superstar status achieved.',
    icon: '🌟',
  },
  {
    id: 'tier-icon',
    name: 'Icon',
    description: 'You\'ve become an icon.',
    category: 'career',
    condition: (s) => s.careerTier === 'icon',
    celebrationText: 'You\'re an icon. A legend.',
    icon: '👑',
  },
  
  // Release milestones
  {
    id: 'first-song',
    name: 'First Release',
    description: 'You released your first song.',
    category: 'release',
    condition: (s) => s.songsReleased >= 1,
    celebrationText: 'Your music is out in the world.',
    icon: '🎵',
  },
  {
    id: 'songs-10',
    name: '10 Songs Released',
    description: 'You\'ve released 10 songs.',
    category: 'release',
    condition: (s) => s.songsReleased >= 10,
    celebrationText: 'Building a real catalog.',
    icon: '📀',
  },
  {
    id: 'first-project',
    name: 'First Project',
    description: 'You released your first project.',
    category: 'release',
    condition: (s) => s.projectsReleased >= 1,
    celebrationText: 'Your first body of work.',
    icon: '💿',
  },
  {
    id: 'gold-record',
    name: 'Gold Record',
    description: 'You have a gold-certified song.',
    category: 'release',
    condition: (s) => s.goldRecords >= 1,
    celebrationText: 'Gold! 500,000 units moved.',
    icon: '🥇',
  },
  {
    id: 'platinum-record',
    name: 'Platinum Record',
    description: 'You have a platinum-certified song.',
    category: 'release',
    condition: (s) => s.platinumRecords >= 1,
    celebrationText: 'Platinum! A million units.',
    icon: '🏆',
  },
  
  // Show milestones
  {
    id: 'first-show',
    name: 'First Show',
    description: 'You performed your first show.',
    category: 'show',
    condition: (s) => s.showsPerformed >= 1,
    celebrationText: 'You performed for a crowd.',
    icon: '🎤',
  },
  {
    id: 'shows-10',
    name: '10 Shows',
    description: 'You\'ve performed 10 shows.',
    category: 'show',
    condition: (s) => s.showsPerformed >= 10,
    celebrationText: 'You\'re a seasoned performer.',
    icon: '🎤',
  },
  {
    id: 'shows-50',
    name: '50 Shows',
    description: 'You\'ve performed 50 shows.',
    category: 'show',
    condition: (s) => s.showsPerformed >= 50,
    celebrationText: 'A true road warrior.',
    icon: '🎸',
  },
  
  // Achievement milestones
  {
    id: 'first-award',
    name: 'First Award',
    description: 'You won your first award.',
    category: 'achievement',
    condition: (s) => s.awardCount >= 1,
    celebrationText: 'Award-winning artist.',
    icon: '🏆',
  },
];

export function checkMilestones(
  state: MilestoneCheckState,
  achievedMilestones: string[]
): MilestoneTemplate[] {
  return MILESTONES.filter(m => 
    !achievedMilestones.includes(m.id) && m.condition(state)
  );
}
