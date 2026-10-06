import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { GameLayout } from '@/components/layout/GameLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AlbumCover } from '@/components/ui/AlbumCover';
import { Modal } from '@/components/ui/Modal';
import { formatNumber, formatMoney, getMomentumLabel, getQualityLabel } from '@/utils/format';
import { clsx } from 'clsx';
import type { Song } from '@/game/models/types';

export function MusicScreen() {
  const gameState = useGameStore((s) => s.gameState);
  const releaseSong = useGameStore((s) => s.releaseSong);
  const selectSong = useGameStore((s) => s.selectSong);
  
  const [activeTab, setActiveTab] = useState<'released' | 'unreleased'>('released');
  const [releaseModalSong, setReleaseModalSong] = useState<Song | null>(null);
  const [marketingSpend, setMarketingSpend] = useState(0);
  
  if (!gameState) return null;
  
  const { songs, player } = gameState;
  const releasedSongs = songs.filter(s => s.status === 'released').reverse();
  const unreleasedSongs = songs.filter(s => s.status !== 'released');
  const displaySongs = activeTab === 'released' ? releasedSongs : unreleasedSongs;
  
  const handleRelease = () => {
    if (releaseModalSong) {
      releaseSong(releaseModalSong.id, marketingSpend);
      setReleaseModalSong(null);
      setMarketingSpend(0);
    }
  };
  
  const canRelease = (song: Song) => song.status === 'mixed' || song.status === 'recorded';
  
  return (
    <GameLayout>
      <div className="p-4 space-y-4">
        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('released')}
            className={clsx(
              'flex-1 py-2 px-4 rounded-xl font-medium text-sm transition-colors',
              activeTab === 'released'
                ? 'bg-white text-dark-950'
                : 'bg-dark-800 text-dark-400'
            )}
          >
            Released ({releasedSongs.length})
          </button>
          <button
            onClick={() => setActiveTab('unreleased')}
            className={clsx(
              'flex-1 py-2 px-4 rounded-xl font-medium text-sm transition-colors',
              activeTab === 'unreleased'
                ? 'bg-white text-dark-950'
                : 'bg-dark-800 text-dark-400'
            )}
          >
            Unreleased ({unreleasedSongs.length})
          </button>
        </div>
        
        {/* Catalog Stats (for released) */}
        {activeTab === 'released' && releasedSongs.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <Card padding="sm" className="text-center">
              <p className="text-xs text-dark-400">Total Streams</p>
              <p className="text-lg font-bold">
                {formatNumber(releasedSongs.reduce((sum, s) => sum + s.totalStreams, 0))}
              </p>
            </Card>
            <Card padding="sm" className="text-center">
              <p className="text-xs text-dark-400">Catalog Value</p>
              <p className="text-lg font-bold">
                {formatMoney(releasedSongs.reduce((sum, s) => sum + s.totalRevenue, 0), true)}
              </p>
            </Card>
          </div>
        )}
        
        {/* Song List */}
        <div className="space-y-3">
          {displaySongs.length === 0 && (
            <Card className="text-center py-8">
              <p className="text-dark-400">
                {activeTab === 'released' 
                  ? "You haven't released any songs yet."
                  : "No songs in progress. Go write something!"}
              </p>
            </Card>
          )}
          
          {displaySongs.map((song) => (
            <Card
              key={song.id}
              interactive
              onClick={() => song.status === 'released' ? selectSong(song.id) : undefined}
            >
              <div className="flex gap-4">
                <AlbumCover seed={song.id} size="lg" />
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{song.title}</h3>
                  
                  {song.status === 'released' ? (
                    <>
                      <p className="text-sm text-dark-400">
                        {formatNumber(song.totalStreams)} total streams
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className={clsx(
                          'text-xs px-2 py-0.5 rounded-full',
                          song.momentum >= 1.05 ? 'bg-accent-viral/20 text-accent-viral' :
                          song.momentum <= 0.95 ? 'bg-red-500/20 text-red-400' :
                          'bg-dark-700 text-dark-300'
                        )}>
                          {getMomentumLabel(song.momentum)}
                        </span>
                        {song.peakChartPosition && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-accent-gold/20 text-accent-gold">
                            Peak #{song.peakChartPosition}
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-dark-400 capitalize">
                        Status: {song.status}
                      </p>
                      <div className="mt-2 flex gap-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-dark-700">
                          Quality: {getQualityLabel(song.quality)}
                        </span>
                      </div>
                      {canRelease(song) && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="mt-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            setReleaseModalSong(song);
                          }}
                        >
                          Release Song
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Release Modal */}
      <Modal
        isOpen={!!releaseModalSong}
        onClose={() => setReleaseModalSong(null)}
        title="Release Song"
      >
        {releaseModalSong && (
          <div className="space-y-6">
            <div className="flex gap-4">
              <AlbumCover seed={releaseModalSong.id} size="lg" />
              <div>
                <h3 className="font-semibold">{releaseModalSong.title}</h3>
                <p className="text-sm text-dark-400">
                  Quality: {getQualityLabel(releaseModalSong.quality)}
                </p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-3">
                Marketing Budget
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[0, 100, 500].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setMarketingSpend(amount)}
                    disabled={player.stats.cash < amount}
                    className={clsx(
                      'p-3 rounded-xl text-sm transition-colors',
                      marketingSpend === amount
                        ? 'bg-white text-dark-950'
                        : player.stats.cash < amount
                          ? 'bg-dark-900 text-dark-600 cursor-not-allowed'
                          : 'bg-dark-800 hover:bg-dark-700'
                    )}
                  >
                    {amount === 0 ? 'Free' : formatMoney(amount)}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setReleaseModalSong(null)}
                fullWidth
              >
                Cancel
              </Button>
              <Button
                onClick={handleRelease}
                fullWidth
                disabled={player.stats.cash < marketingSpend}
              >
                Release!
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </GameLayout>
  );
}
