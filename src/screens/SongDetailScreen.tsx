import { useGameStore } from '@/store/gameStore';
import { Header } from '@/components/layout/Header';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AlbumCover } from '@/components/ui/AlbumCover';
import { formatNumber, formatMoney, getMomentumLabel, getQualityLabel, getTimeAgo } from '@/utils/format';
import { clsx } from 'clsx';

export function SongDetailScreen() {
  const gameState = useGameStore((s) => s.gameState);
  const selectedSongId = useGameStore((s) => s.ui.selectedSongId);
  const selectSong = useGameStore((s) => s.selectSong);
  const setScreen = useGameStore((s) => s.setScreen);
  const performAction = useGameStore((s) => s.performAction);
  
  if (!gameState || !selectedSongId) {
    setScreen('music');
    return null;
  }
  
  const song = gameState.songs.find(s => s.id === selectedSongId);
  if (!song) {
    setScreen('music');
    return null;
  }
  
  const weeksSinceRelease = song.releaseWeek !== null 
    ? gameState.currentWeek - song.releaseWeek 
    : 0;
  
  const handleBack = () => {
    selectSong(null);
    setScreen('music');
  };
  
  return (
    <div className="screen-root bg-dark-950">
      <Header title="Song Details" showBack onBack={handleBack} />
      
      <div className="p-4 space-y-4">
        {/* Song Header */}
        <div className="flex gap-4">
          <AlbumCover seed={song.id} size="xl" />
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h1 className="text-xl font-bold truncate">{song.title}</h1>
            <p className="text-dark-400 text-sm capitalize">{song.genre.replace('-', ' ')}</p>
            {song.releaseWeek !== null && (
              <p className="text-dark-500 text-sm mt-1">
                Released {getTimeAgo(weeksSinceRelease)}
              </p>
            )}
          </div>
        </div>
        
        {/* Status Badges */}
        <div className="flex flex-wrap gap-2">
          {song.isViral && (
            <span className="px-3 py-1 rounded-full bg-accent-fire/20 text-accent-fire text-sm font-medium">
              🔥 Viral
            </span>
          )}
          {song.hasVideo && (
            <span className="px-3 py-1 rounded-full bg-dark-800 text-dark-300 text-sm">
              🎬 Has Video
            </span>
          )}
          {song.peakChartPosition && (
            <span className="px-3 py-1 rounded-full bg-accent-gold/20 text-accent-gold text-sm">
              📊 Peak #{song.peakChartPosition}
            </span>
          )}
        </div>
        
        {/* Performance Stats */}
        {song.status === 'released' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Card padding="sm" className="text-center">
                <p className="text-xs text-dark-400">Total Streams</p>
                <p className="text-xl font-bold">{formatNumber(song.totalStreams)}</p>
              </Card>
              <Card padding="sm" className="text-center">
                <p className="text-xs text-dark-400">This Week</p>
                <p className="text-xl font-bold text-accent-viral">
                  {formatNumber(song.weeklyStreams)}
                </p>
              </Card>
              <Card padding="sm" className="text-center">
                <p className="text-xs text-dark-400">Total Revenue</p>
                <p className="text-xl font-bold">{formatMoney(song.totalRevenue)}</p>
              </Card>
              <Card padding="sm" className="text-center">
                <p className="text-xs text-dark-400">Momentum</p>
                <p className={clsx(
                  'text-xl font-bold',
                  song.momentum >= 1.05 ? 'text-accent-viral' :
                  song.momentum <= 0.95 ? 'text-red-400' : ''
                )}>
                  {getMomentumLabel(song.momentum)}
                </p>
              </Card>
            </div>
            
            {/* Chart History */}
            {song.chartHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Chart History</CardTitle>
                </CardHeader>
                <div className="space-y-2">
                  {song.chartHistory.slice(-5).reverse().map((entry, i) => (
                    <div
                      key={i}
                      className="flex justify-between text-sm p-2 bg-dark-800 rounded-lg"
                    >
                      <span className="text-dark-400">Week {entry.week}</span>
                      <span>#{entry.position} on {entry.chartType}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        )}
        
        {/* Song Quality (Hidden Stats - Show descriptively) */}
        <Card>
          <CardHeader>
            <CardTitle>Song Quality</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <QualityRow label="Overall" value={song.quality} />
            <QualityRow label="Commercial Appeal" value={song.commercialAppeal} />
            <QualityRow label="Replayability" value={song.replayability} />
            <QualityRow label="Originality" value={song.originality} />
            <QualityRow label="Production" value={song.productionQuality} />
            <QualityRow label="Lyrics" value={song.lyricalQuality} />
          </div>
        </Card>
        
        {/* Credits */}
        <Card>
          <CardHeader>
            <CardTitle>Credits</CardTitle>
          </CardHeader>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-dark-400">Artist</span>
              <span>{gameState.player.artistName}</span>
            </div>
            {song.producerName && (
              <div className="flex justify-between">
                <span className="text-dark-400">Producer</span>
                <span>{song.producerName}</span>
              </div>
            )}
            {song.featureArtistName && (
              <div className="flex justify-between">
                <span className="text-dark-400">Feature</span>
                <span>{song.featureArtistName}</span>
              </div>
            )}
          </div>
        </Card>
        
        {/* Actions */}
        {song.status === 'released' && !song.hasVideo && (
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => performAction('shootVideo', { songId: song.id, videoTier: 'basic' })}
              disabled={gameState.player.stats.cash < 800 || gameState.player.stats.energy < 35}
            >
              Shoot Music Video ($800)
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}

function QualityRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-dark-400">{label}</span>
      <span className={clsx(
        'font-medium',
        value >= 80 ? 'text-accent-gold' :
        value >= 60 ? 'text-accent-viral' :
        value >= 40 ? 'text-dark-300' :
        'text-dark-500'
      )}>
        {getQualityLabel(value)}
      </span>
    </div>
  );
}
