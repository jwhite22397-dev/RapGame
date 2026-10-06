import { useGameStore } from '@/store/gameStore';
import { GameLayout } from '@/components/layout/GameLayout';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/Progress';
import { AlbumCover } from '@/components/ui/AlbumCover';
import { formatNumber } from '@/utils/format';
import { clsx } from 'clsx';

export function HomeScreen() {
  const gameState = useGameStore((s) => s.gameState);
  const endWeek = useGameStore((s) => s.endWeek);
  const setScreen = useGameStore((s) => s.setScreen);
  const selectEvent = useGameStore((s) => s.selectEvent);
  const performAction = useGameStore((s) => s.performAction);
  
  if (!gameState) return null;
  
  const { player, songs, activeEvents, news } = gameState;
  const releasedSongs = songs.filter(s => s.status === 'released');
  const latestSong = releasedSongs[releasedSongs.length - 1];
  const pendingEvents = activeEvents.filter(e => !e.resolved);
  const recentNews = news.slice(-5).reverse();
  
  return (
    <GameLayout>
      <div className="p-4 space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            label="Followers"
            value={formatNumber(player.stats.followers)}
            trend={player.stats.hype > 20 ? 'up' : undefined}
          />
          <StatCard
            label="Streams"
            value={formatNumber(player.stats.totalStreams)}
          />
          <StatCard
            label="Monthly"
            value={formatNumber(player.stats.monthlyListeners)}
          />
        </div>
        
        {/* Energy & Hype */}
        <Card>
          <div className="space-y-4">
            <ProgressBar
              value={player.stats.energy}
              max={player.stats.maxEnergy}
              variant="energy"
              label="Energy"
              showLabel
            />
            <ProgressBar
              value={player.stats.hype}
              max={100}
              variant="hype"
              label="Hype"
              showLabel
            />
          </div>
        </Card>
        
        {/* Active Events */}
        {pendingEvents.length > 0 && (
          <Card variant="highlight">
            <CardHeader>
              <CardTitle>Opportunities</CardTitle>
              <span className="text-xs bg-accent-fire px-2 py-0.5 rounded-full">
                {pendingEvents.length} new
              </span>
            </CardHeader>
            <div className="space-y-2">
              {pendingEvents.slice(0, 3).map((event) => (
                <button
                  key={event.id}
                  onClick={() => selectEvent(event.id)}
                  className="w-full text-left p-3 bg-dark-800 rounded-xl hover:bg-dark-700 transition-colors"
                >
                  <h4 className="font-medium text-sm">{event.title}</h4>
                  <p className="text-xs text-dark-400 mt-1 line-clamp-1">
                    {event.description}
                  </p>
                </button>
              ))}
            </div>
          </Card>
        )}
        
        {/* Latest Release */}
        {latestSong && (
          <Card>
            <CardHeader>
              <CardTitle>Latest Release</CardTitle>
              <button 
                onClick={() => setScreen('music')}
                className="text-xs text-dark-400 hover:text-white"
              >
                View All
              </button>
            </CardHeader>
            <div className="flex gap-4">
              <AlbumCover seed={latestSong.id} size="lg" />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold truncate">{latestSong.title}</h4>
                <p className="text-sm text-dark-400">
                  {formatNumber(latestSong.weeklyStreams)} streams this week
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className={clsx(
                    'text-xs px-2 py-0.5 rounded-full',
                    latestSong.momentum >= 1.05 ? 'bg-accent-viral/20 text-accent-viral' :
                    latestSong.momentum <= 0.95 ? 'bg-red-500/20 text-red-400' :
                    'bg-dark-700 text-dark-300'
                  )}>
                    {latestSong.momentum >= 1.05 ? '📈 Growing' :
                     latestSong.momentum <= 0.95 ? '📉 Declining' : '➡️ Stable'}
                  </span>
                  {latestSong.isViral && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent-hype/20 text-accent-hype">
                      🔥 Viral
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}
        
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Studio</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-2 gap-2">
            <ActionButton
              onClick={() => performAction('write')}
              disabled={player.stats.energy < 25}
              energy={25}
            >
              Write Song
            </ActionButton>
            <ActionButton
              onClick={() => performAction('record')}
              disabled={player.stats.energy < 30 || !songs.some(s => s.status === 'writing')}
              energy={30}
            >
              Record
            </ActionButton>
            <ActionButton
              onClick={() => performAction('practice')}
              disabled={player.stats.energy < 20}
              energy={20}
            >
              Practice
            </ActionButton>
            <ActionButton
              onClick={() => performAction('postContent', { contentType: 'snippet' })}
              disabled={player.stats.energy < 15}
              energy={15}
            >
              Post Content
            </ActionButton>
          </div>
        </Card>
        
        {/* Day Job (if not quit) */}
        {!player.hasQuitDayJob && (
          <Card className="border-dashed">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Day Job</h4>
                <p className="text-sm text-dark-400">Work a shift for cash</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => performAction('workJob')}
                disabled={player.stats.energy < 45}
              >
                Work ($350-650)
              </Button>
            </div>
          </Card>
        )}
        
        {/* News Feed */}
        {recentNews.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Industry News</CardTitle>
            </CardHeader>
            <div className="space-y-2">
              {recentNews.map((item) => (
                <div
                  key={item.id}
                  className="text-sm text-dark-300 border-l-2 border-dark-700 pl-3 py-1"
                >
                  {item.headline}
                </div>
              ))}
            </div>
          </Card>
        )}
        
        {/* End Week Button */}
        <div className="pt-4 pb-8">
          <Button
            onClick={endWeek}
            fullWidth
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
          >
            End Week →
          </Button>
        </div>
      </div>
    </GameLayout>
  );
}

function StatCard({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend?: 'up' | 'down';
}) {
  return (
    <Card padding="sm" className="text-center">
      <p className="text-xs text-dark-400">{label}</p>
      <p className="text-lg font-bold mt-0.5">{value}</p>
      {trend && (
        <span className={clsx(
          'text-xs',
          trend === 'up' ? 'text-accent-viral' : 'text-red-400'
        )}>
          {trend === 'up' ? '↑' : '↓'}
        </span>
      )}
    </Card>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
  energy,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  energy: number;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'p-3 rounded-xl text-left transition-colors',
        'border border-dark-700',
        disabled
          ? 'bg-dark-900 text-dark-600 cursor-not-allowed'
          : 'bg-dark-800 hover:bg-dark-700 text-white'
      )}
    >
      <span className="text-sm font-medium block">{children}</span>
      <span className="text-xs text-dark-400">-{energy} energy</span>
    </button>
  );
}
