import { useGameStore } from '@/store/gameStore';
import { GameLayout } from '@/components/layout/GameLayout';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatMoney, formatNumber } from '@/utils/format';

export function MoneyScreen() {
  const gameState = useGameStore((s) => s.gameState);
  const setScreen = useGameStore((s) => s.setScreen);
  
  if (!gameState) return null;
  
  const { player, songs } = gameState;
  const releasedSongs = songs.filter(s => s.status === 'released');
  
  // Calculate weekly income
  const weeklyStreams = releasedSongs.reduce((sum, s) => sum + s.weeklyStreams, 0);
  const streamingRate = player.labelContract 
    ? 0.004 * 0.85 * (player.labelContract.royaltyPercent / 100)
    : 0.004;
  const weeklyStreamingIncome = weeklyStreams * streamingRate;
  
  // Top earning songs
  const topEarners = [...releasedSongs]
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 5);
  
  return (
    <GameLayout>
      <div className="p-4 space-y-4">
        {/* Cash Balance */}
        <Card variant="highlight" className="text-center">
          <p className="text-sm text-dark-400 mb-1">Cash Balance</p>
          <p className="text-4xl font-bold">{formatMoney(player.stats.cash)}</p>
          <Button className="mt-4" variant="secondary" onClick={() => setScreen('lifestyle')}>
            Spend on studio, chains, dates
          </Button>
        </Card>
        
        {/* Overview */}
        <div className="grid grid-cols-2 gap-3">
          <Card padding="sm">
            <p className="text-xs text-dark-400">Career Earnings</p>
            <p className="text-lg font-bold">{formatMoney(player.stats.careerEarnings, true)}</p>
          </Card>
          <Card padding="sm">
            <p className="text-xs text-dark-400">Weekly Income</p>
            <p className="text-lg font-bold text-accent-viral">
              +{formatMoney(weeklyStreamingIncome, true)}
            </p>
          </Card>
        </div>
        
        {/* Income Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Income Sources</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            <IncomeRow
              label="Streaming"
              amount={weeklyStreamingIncome}
              description={`${formatNumber(weeklyStreams)} streams @ $${streamingRate.toFixed(4)}`}
            />
            {/* Show features etc when implemented */}
          </div>
        </Card>
        
        {/* Contract Terms */}
        {player.labelContract && (
          <Card className="border-amber-500/30">
            <CardHeader>
              <CardTitle>Label Contract</CardTitle>
              <span className="text-xs text-amber-400">Active</span>
            </CardHeader>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-dark-400">Label</span>
                <span>{player.labelContract.labelName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">Your Royalty</span>
                <span>{player.labelContract.royaltyPercent}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">Advance</span>
                <span>{formatMoney(player.labelContract.advance)}</span>
              </div>
              {player.labelContract.recoupable && (
                <div className="flex justify-between">
                  <span className="text-dark-400">Recouped</span>
                  <span>
                    {formatMoney(player.labelContract.recouped)} / {formatMoney(player.labelContract.advance)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-dark-400">Albums Owed</span>
                <span>
                  {player.labelContract.albumsRequired - player.labelContract.albumsDelivered}
                </span>
              </div>
            </div>
          </Card>
        )}
        
        {/* Top Earners */}
        {topEarners.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Top Earning Songs</CardTitle>
            </CardHeader>
            <div className="space-y-2">
              {topEarners.map((song, i) => (
                <div
                  key={song.id}
                  className="flex items-center justify-between p-2 bg-dark-800/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-dark-700 flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-medium text-sm">{song.title}</p>
                      <p className="text-xs text-dark-500">
                        {formatNumber(song.totalStreams)} streams
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-accent-viral">
                    {formatMoney(song.totalRevenue, true)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
        
        {/* Financial Tips */}
        <Card className="bg-dark-900/50">
          <h4 className="font-medium text-sm mb-2">Tips</h4>
          <ul className="text-sm text-dark-400 space-y-1">
            <li>• Release consistently to build passive income</li>
            <li>• Higher hype = more new listeners = more streams</li>
            <li>• Quality songs have better long-term catalog value</li>
            {!player.hasQuitDayJob && (
              <li>• Day job pays {formatMoney(350)}-{formatMoney(650)} per shift</li>
            )}
          </ul>
        </Card>
      </div>
    </GameLayout>
  );
}

function IncomeRow({
  label,
  amount,
  description,
}: {
  label: string;
  amount: number;
  description: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium text-sm">{label}</p>
        <p className="text-xs text-dark-500">{description}</p>
      </div>
      <span className="font-semibold text-accent-viral">
        +{formatMoney(amount, true)}/wk
      </span>
    </div>
  );
}
