import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { GameLayout } from '@/components/layout/GameLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AlbumCover } from '@/components/ui/AlbumCover';
import { ReleaseModal } from '@/components/music/ReleaseModal';
import { formatNumber, formatMoney, getMomentumLabel, getQualityLabel } from '@/utils/format';
import { clsx } from 'clsx';
import type { Song } from '@/game/models/types';

export function MusicScreen() {
  const gameState = useGameStore((s) => s.gameState);
  const releaseSong = useGameStore((s) => s.releaseSong);
  const scrapSong = useGameStore((s) => s.scrapSong);
  const selectSong = useGameStore((s) => s.selectSong);

  const [activeTab, setActiveTab] = useState<'released' | 'unreleased'>('unreleased');
  const [releaseModalSong, setReleaseModalSong] = useState<Song | null>(null);
  const [marketingSpend, setMarketingSpend] = useState(0);

  if (!gameState) return null;

  const { songs, player } = gameState;
  const releasedSongs = songs.filter((s) => s.status === 'released').reverse();
  const unreleasedSongs = songs.filter((s) => s.status !== 'released');
  const displaySongs = activeTab === 'released' ? releasedSongs : unreleasedSongs;
  const canRelease = (song: Song) => song.status === 'mixed' || song.status === 'recorded';

  return (
    <GameLayout>
      <div className="p-4 space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('released')}
            className={clsx(
              'flex-1 rounded-xl px-4 py-2 text-sm font-medium',
              activeTab === 'released' ? 'bg-white text-dark-950' : 'bg-dark-800 text-dark-400'
            )}
          >
            Released ({releasedSongs.length})
          </button>
          <button
            onClick={() => setActiveTab('unreleased')}
            className={clsx(
              'flex-1 rounded-xl px-4 py-2 text-sm font-medium',
              activeTab === 'unreleased' ? 'bg-white text-dark-950' : 'bg-dark-800 text-dark-400'
            )}
          >
            Unreleased ({unreleasedSongs.length})
          </button>
        </div>

        {activeTab === 'released' && releasedSongs.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <Card padding="sm" className="text-center">
              <p className="text-xs text-dark-400">Total Streams</p>
              <p className="text-lg font-bold">{formatNumber(releasedSongs.reduce((sum, s) => sum + s.totalStreams, 0))}</p>
            </Card>
            <Card padding="sm" className="text-center">
              <p className="text-xs text-dark-400">Catalog Value</p>
              <p className="text-lg font-bold">{formatMoney(releasedSongs.reduce((sum, s) => sum + s.totalRevenue, 0), true)}</p>
            </Card>
          </div>
        )}

        <div className="space-y-3">
          {displaySongs.length === 0 && (
            <Card className="py-8 text-center">
              <p className="text-dark-400">
                {activeTab === 'released' ? "You haven't released any songs yet." : 'No songs in progress. Go write something!'}
              </p>
            </Card>
          )}

          {displaySongs.map((song) => (
            <Card
              key={song.id}
              interactive={song.status === 'released'}
              onClick={() => song.status === 'released' ? selectSong(song.id) : undefined}
            >
              <div className="flex gap-4">
                <AlbumCover seed={song.id} size="lg" />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold">{song.title}</h3>
                  {song.status === 'released' ? (
                    <>
                      <p className="text-sm text-dark-400">{formatNumber(song.totalStreams)} total streams</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className={clsx(
                          'rounded-full px-2 py-0.5 text-xs',
                          song.momentum >= 1.05 ? 'bg-accent-viral/20 text-accent-viral' :
                          song.momentum <= 0.95 ? 'bg-red-500/20 text-red-400' : 'bg-dark-700 text-dark-300'
                        )}>
                          {getMomentumLabel(song.momentum)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm capitalize text-dark-400">Status: {song.status}</p>
                      <div className="mt-2">
                        <span className="rounded-full bg-dark-700 px-2 py-0.5 text-xs">
                          Quality: {getQualityLabel(song.quality)}
                        </span>
                      </div>
                      <div className="mt-3 flex gap-2">
                        {canRelease(song) && (
                          <Button size="sm" onClick={() => { setMarketingSpend(0); setReleaseModalSong(song); }}>
                            Release
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => scrapSong(song.id)}>
                          Scrap
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <ReleaseModal
        song={releaseModalSong}
        cash={player.stats.cash}
        marketingSpend={marketingSpend}
        onMarketingSpend={setMarketingSpend}
        onClose={() => setReleaseModalSong(null)}
        onRelease={() => {
          if (releaseModalSong) {
            releaseSong(releaseModalSong.id, marketingSpend);
            setReleaseModalSong(null);
          }
        }}
      />
    </GameLayout>
  );
}
