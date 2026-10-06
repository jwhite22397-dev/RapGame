import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { GameLayout } from '@/components/layout/GameLayout';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/Progress';
import { AlbumCover } from '@/components/ui/AlbumCover';
import { ArtistAvatar } from '@/components/character/ArtistAvatar';
import { ReleaseModal } from '@/components/music/ReleaseModal';
import { formatNumber } from '@/utils/format';
import { recordEnergyFor } from '@/game/engine/lifestyle';
import { canPerformAction } from '@/game/engine/actions';
import type { Song } from '@/game/models/types';
import { clsx } from 'clsx';

export function HomeScreen() {
  const gameState = useGameStore((s) => s.gameState);
  const endWeek = useGameStore((s) => s.endWeek);
  const setScreen = useGameStore((s) => s.setScreen);
  const selectEvent = useGameStore((s) => s.selectEvent);
  const performAction = useGameStore((s) => s.performAction);
  const releaseSong = useGameStore((s) => s.releaseSong);
  const scrapSong = useGameStore((s) => s.scrapSong);
  const bookShow = useGameStore((s) => s.bookShow);

  const [releaseSongTarget, setReleaseSongTarget] = useState<Song | null>(null);
  const [marketingSpend, setMarketingSpend] = useState(0);

  if (!gameState) return null;

  const { player, songs, activeEvents, news, showOffers } = gameState;
  const releasedSongs = songs.filter((s) => s.status === 'released');
  const readySongs = songs.filter((s) => s.status === 'mixed' || s.status === 'recorded');
  const drafts = songs.filter((s) => s.status === 'writing' || s.status === 'idea');
  const latestSong = releasedSongs[releasedSongs.length - 1];
  const pendingEvents = activeEvents.filter((e) => !e.resolved);
  const recentNews = news.slice(-5).reverse();
  const recordEnergy = recordEnergyFor(gameState);
  const writeCheck = canPerformAction(gameState, 'write');
  const showOffer = showOffers[0];

  return (
    <GameLayout>
      <div className="p-4 space-y-4">
        <Card variant="highlight" className="flex items-center gap-4">
          <ArtistAvatar appearance={player.appearance} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-widest text-dark-400">This week</p>
            <h2 className="truncate text-xl font-bold">{player.artistName}</h2>
            <p className="text-sm capitalize text-dark-300">{player.careerTier.replace('-', ' ')}</p>
            <button
              onClick={() => setScreen('lifestyle')}
              className="mt-2 text-sm font-medium text-accent-viral"
            >
              Shop · Studio · Date →
            </button>
          </div>
        </Card>

        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Followers" value={formatNumber(player.stats.followers)} trend={player.stats.hype > 20 ? 'up' : undefined} />
          <StatCard label="Streams" value={formatNumber(player.stats.totalStreams)} />
          <StatCard label="Monthly" value={formatNumber(player.stats.monthlyListeners)} />
        </div>

        <Card>
          <div className="space-y-4">
            <ProgressBar value={player.stats.energy} max={player.stats.maxEnergy} variant="energy" label="Energy" showLabel />
            <ProgressBar value={player.stats.hype} max={100} variant="hype" label="Hype" showLabel />
          </div>
        </Card>

        {readySongs.length > 0 && (
          <Card variant="highlight" className="border border-accent-viral/30">
            <CardHeader>
              <CardTitle>Ready to drop</CardTitle>
              <span className="text-xs text-accent-viral">{readySongs.length} recorded</span>
            </CardHeader>
            <div className="space-y-3">
              {readySongs.slice(0, 2).map((song) => (
                <div key={song.id} className="flex gap-3 rounded-xl bg-dark-800 p-3">
                  <AlbumCover seed={song.id} size="md" />
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate font-semibold">{song.title}</h4>
                    <p className="text-xs text-dark-400">Recorded and waiting on you.</p>
                    <div className="mt-2 flex gap-2">
                      <Button size="sm" onClick={() => { setMarketingSpend(0); setReleaseSongTarget(song); }}>
                        Release
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => scrapSong(song.id)}>
                        Scrap
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {drafts.length > 0 && readySongs.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>In the vault</CardTitle>
            </CardHeader>
            <p className="mb-3 text-sm text-dark-300">
              {drafts.length} unfinished {drafts.length === 1 ? 'song' : 'songs'}. Record or scrap so they do not pile up.
            </p>
            <div className="space-y-2">
              {drafts.slice(0, 3).map((song) => (
                <div key={song.id} className="flex items-center justify-between rounded-xl bg-dark-800 px-3 py-2">
                  <span className="truncate text-sm">{song.title}</span>
                  <Button size="sm" variant="ghost" onClick={() => scrapSong(song.id)}>Scrap</Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {showOffer && (
          <Card className="overflow-hidden border border-purple-500/30 bg-gradient-to-br from-purple-950/50 to-dark-900">
            <p className="text-xs uppercase tracking-widest text-purple-200/80">Tonight</p>
            <h3 className="mt-1 text-lg font-bold">{showOffer.venueName}</h3>
            <p className="text-sm text-dark-300">{showOffer.city} · ${showOffer.pay} · -{showOffer.energyCost} energy</p>
            <Button
              className="mt-3"
              onClick={() => bookShow(showOffer.id)}
              disabled={player.stats.energy < showOffer.energyCost}
            >
              Take the stage
            </Button>
          </Card>
        )}

        {pendingEvents.length > 0 && (
          <Card variant="highlight">
            <CardHeader>
              <CardTitle>Opportunities</CardTitle>
              <span className="text-xs bg-accent-fire px-2 py-0.5 rounded-full">{pendingEvents.length} new</span>
            </CardHeader>
            <div className="space-y-2">
              {pendingEvents.slice(0, 3).map((event) => (
                <button
                  key={event.id}
                  onClick={() => selectEvent(event.id)}
                  className="w-full rounded-xl bg-dark-800 p-3 text-left hover:bg-dark-700"
                >
                  <h4 className="text-sm font-medium">{event.title}</h4>
                  <p className="mt-1 line-clamp-1 text-xs text-dark-400">{event.description}</p>
                </button>
              ))}
            </div>
          </Card>
        )}

        {latestSong && (
          <Card>
            <CardHeader>
              <CardTitle>Latest Release</CardTitle>
              <button onClick={() => setScreen('music')} className="text-xs text-dark-400 hover:text-white">View All</button>
            </CardHeader>
            <div className="flex gap-4">
              <AlbumCover seed={latestSong.id} size="lg" />
              <div className="min-w-0 flex-1">
                <h4 className="truncate font-semibold">{latestSong.title}</h4>
                <p className="text-sm text-dark-400">{formatNumber(latestSong.weeklyStreams)} streams this week</p>
              </div>
            </div>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Studio</CardTitle>
            {player.lifestyle.studioTier > 0 && (
              <span className="text-xs text-accent-gold">{player.lifestyle.studioTier === 2 ? 'Pro room' : 'Home studio'}</span>
            )}
          </CardHeader>
          <div className="grid grid-cols-2 gap-2">
            <ActionButton onClick={() => performAction('write')} disabled={!writeCheck.can || player.stats.energy < 25} energy={25}>
              Write Song
            </ActionButton>
            <ActionButton
              onClick={() => performAction('record')}
              disabled={player.stats.energy < recordEnergy || !songs.some((s) => s.status === 'writing')}
              energy={recordEnergy}
            >
              Record
            </ActionButton>
            <ActionButton onClick={() => performAction('practice')} disabled={player.stats.energy < 20} energy={20}>
              Practice
            </ActionButton>
            <ActionButton onClick={() => performAction('postContent', { contentType: 'snippet' })} disabled={player.stats.energy < 15} energy={15}>
              Post Content
            </ActionButton>
          </div>
          {!writeCheck.can && writeCheck.reason && (
            <p className="mt-3 text-xs text-amber-300">{writeCheck.reason}</p>
          )}
        </Card>

        {!player.hasQuitDayJob && (
          <Card className="border-dashed">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Day Job</h4>
                <p className="text-sm text-dark-400">Work a shift for cash</p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => performAction('workJob')} disabled={player.stats.energy < 45}>
                Work ($350-650)
              </Button>
            </div>
          </Card>
        )}

        {recentNews.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Industry News</CardTitle>
            </CardHeader>
            <div className="space-y-2">
              {recentNews.map((item) => (
                <div key={item.id} className="border-l-2 border-dark-700 py-1 pl-3 text-sm text-dark-300">
                  {item.headline}
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="pb-8 pt-4">
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

      <ReleaseModal
        song={releaseSongTarget}
        cash={player.stats.cash}
        marketingSpend={marketingSpend}
        onMarketingSpend={setMarketingSpend}
        onClose={() => setReleaseSongTarget(null)}
        onRelease={() => {
          if (releaseSongTarget) {
            releaseSong(releaseSongTarget.id, marketingSpend);
            setReleaseSongTarget(null);
          }
        }}
      />
    </GameLayout>
  );
}

function StatCard({ label, value, trend }: { label: string; value: string; trend?: 'up' | 'down' }) {
  return (
    <Card padding="sm" className="text-center">
      <p className="text-xs text-dark-400">{label}</p>
      <p className="mt-0.5 text-lg font-bold">{value}</p>
      {trend && <span className={clsx('text-xs', trend === 'up' ? 'text-accent-viral' : 'text-red-400')}>{trend === 'up' ? '↑' : '↓'}</span>}
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
        'rounded-xl border border-dark-700 p-3 text-left transition-colors',
        disabled ? 'cursor-not-allowed bg-dark-900 text-dark-600' : 'bg-dark-800 text-white hover:bg-dark-700'
      )}
    >
      <span className="block text-sm font-medium">{children}</span>
      <span className="text-xs text-dark-400">-{energy} energy</span>
    </button>
  );
}
