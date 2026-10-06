import { useGameStore } from '@/store/gameStore';
import { GameLayout } from '@/components/layout/GameLayout';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatNumber } from '@/utils/format';
import { clsx } from 'clsx';

export function SocialScreen() {
  const gameState = useGameStore((s) => s.gameState);
  const performAction = useGameStore((s) => s.performAction);
  
  if (!gameState) return null;
  
  const { player, npcArtists, charts } = gameState;
  const topChartArtists = charts.top100.slice(0, 5);
  const relevantNPCs = npcArtists
    .filter(a => a.isActive)
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 10);
  
  return (
    <GameLayout>
      <div className="p-4 space-y-4">
        {/* Social Stats */}
        <Card variant="highlight">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold">{formatNumber(player.stats.followers)}</p>
              <p className="text-sm text-dark-400">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{Math.round(player.stats.hype)}</p>
              <p className="text-sm text-dark-400">Hype</p>
            </div>
          </div>
        </Card>
        
        {/* Fan Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Your Fans</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            <FanTier
              label="Superfans"
              count={player.fanBase.superfans}
              description="Stream everything multiple times"
              color="text-accent-gold"
            />
            <FanTier
              label="Core Fans"
              count={player.fanBase.core}
              description="Follow your career closely"
              color="text-accent-viral"
            />
            <FanTier
              label="Followers"
              count={player.fanBase.followers}
              description="Keep up with new releases"
              color="text-accent-hype"
            />
            <FanTier
              label="Casual Listeners"
              count={player.fanBase.casual}
              description="Heard a song or two"
              color="text-dark-400"
            />
          </div>
        </Card>
        
        {/* Content Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Post Content</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-2 gap-2">
            <ContentButton
              label="Snippet"
              energy={10}
              onClick={() => performAction('postContent', { contentType: 'snippet' })}
              disabled={player.stats.energy < 10}
            />
            <ContentButton
              label="Freestyle"
              energy={20}
              onClick={() => performAction('postContent', { contentType: 'freestyle' })}
              disabled={player.stats.energy < 20}
            />
            <ContentButton
              label="Behind the Scenes"
              energy={10}
              onClick={() => performAction('postContent', { contentType: 'behindTheScenes' })}
              disabled={player.stats.energy < 10}
            />
            <ContentButton
              label="Performance Clip"
              energy={15}
              onClick={() => performAction('postContent', { contentType: 'performanceClip' })}
              disabled={player.stats.energy < 15}
            />
          </div>
        </Card>
        
        {/* Chart Artists */}
        <Card>
          <CardHeader>
            <CardTitle>Trending Artists</CardTitle>
          </CardHeader>
          <div className="space-y-2">
            {topChartArtists.map((entry, i) => (
              <div
                key={entry.songId}
                className={clsx(
                  'flex items-center gap-3 p-2 rounded-lg',
                  entry.isPlayer ? 'bg-dark-800' : ''
                )}
              >
                <span className="w-6 text-center text-dark-400 font-mono text-sm">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={clsx(
                    'font-medium truncate text-sm',
                    entry.isPlayer ? 'text-accent-viral' : ''
                  )}>
                    {entry.artistName}
                  </p>
                  <p className="text-xs text-dark-500 truncate">
                    "{entry.songTitle}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
        
        {/* Industry Artists */}
        <Card>
          <CardHeader>
            <CardTitle>Other Artists</CardTitle>
          </CardHeader>
          <div className="space-y-2">
            {relevantNPCs.map((npc) => (
              <div
                key={npc.id}
                className="flex items-center justify-between p-2 rounded-lg bg-dark-800/50"
              >
                <div>
                  <p className="font-medium text-sm">{npc.name}</p>
                  <p className="text-xs text-dark-500 capitalize">
                    {npc.careerTier} • {npc.genre.replace('-', ' ')}
                  </p>
                </div>
                <span className={clsx(
                  'text-xs px-2 py-0.5 rounded-full',
                  npc.relationshipWithPlayer > 20 ? 'bg-accent-viral/20 text-accent-viral' :
                  npc.relationshipWithPlayer < -20 ? 'bg-red-500/20 text-red-400' :
                  'bg-dark-700 text-dark-400'
                )}>
                  {npc.relationshipWithPlayer > 20 ? 'Friendly' :
                   npc.relationshipWithPlayer < -20 ? 'Cold' : 'Neutral'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </GameLayout>
  );
}

function FanTier({
  label,
  count,
  description,
  color,
}: {
  label: string;
  count: number;
  description: string;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className={clsx('font-medium text-sm', color)}>{label}</p>
        <p className="text-xs text-dark-500">{description}</p>
      </div>
      <span className="font-bold">{formatNumber(count)}</span>
    </div>
  );
}

function ContentButton({
  label,
  energy,
  onClick,
  disabled,
}: {
  label: string;
  energy: number;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'p-3 rounded-xl text-left transition-colors border border-dark-700',
        disabled
          ? 'bg-dark-900 text-dark-600 cursor-not-allowed'
          : 'bg-dark-800 hover:bg-dark-700'
      )}
    >
      <span className="text-sm font-medium block">{label}</span>
      <span className="text-xs text-dark-400">-{energy} energy</span>
    </button>
  );
}
