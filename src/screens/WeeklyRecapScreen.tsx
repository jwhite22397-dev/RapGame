import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatNumber, formatMoney, formatWeek } from '@/utils/format';
import { clsx } from 'clsx';

export function WeeklyRecapScreen() {
  const gameState = useGameStore((s) => s.gameState);
  const setScreen = useGameStore((s) => s.setScreen);
  
  if (!gameState) return null;
  
  const recap = gameState.weeklyRecaps[gameState.weeklyRecaps.length - 1];
  if (!recap) {
    setScreen('home');
    return null;
  }
  
  const hasGoodNews = recap.streamsGained > 0 || recap.followersGained > 0 || recap.milestones.length > 0;
  
  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      {/* Header */}
      <div className="p-4 text-center border-b border-dark-800">
        <p className="text-sm text-dark-400">{formatWeek(recap.week)}</p>
        <h1 className="text-2xl font-bold mt-1">Week {recap.week} Recap</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Main Stats */}
        <Card variant="highlight" className="text-center">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-dark-400">Streams</p>
              <p className={clsx(
                'text-2xl font-bold',
                recap.streamsGained > 0 ? 'text-accent-viral' : 'text-dark-400'
              )}>
                +{formatNumber(recap.streamsGained)}
              </p>
            </div>
            <div>
              <p className="text-sm text-dark-400">Followers</p>
              <p className={clsx(
                'text-2xl font-bold',
                recap.followersGained > 0 ? 'text-accent-viral' : 'text-dark-400'
              )}>
                +{formatNumber(recap.followersGained)}
              </p>
            </div>
          </div>
        </Card>
        
        {/* Money */}
        <div className="grid grid-cols-2 gap-3">
          <Card padding="sm" className="text-center">
            <p className="text-xs text-dark-400">Earned</p>
            <p className="text-lg font-bold text-accent-viral">
              +{formatMoney(recap.moneyEarned)}
            </p>
          </Card>
          <Card padding="sm" className="text-center">
            <p className="text-xs text-dark-400">Spent</p>
            <p className="text-lg font-bold text-red-400">
              -{formatMoney(recap.moneySpent)}
            </p>
          </Card>
        </div>
        
        {/* Hype Change */}
        {Math.abs(recap.hypeChange) > 0.5 && (
          <Card padding="sm">
            <div className="flex items-center justify-between">
              <span className="text-dark-400">Hype</span>
              <span className={clsx(
                'font-bold',
                recap.hypeChange > 0 ? 'text-accent-viral' : 'text-red-400'
              )}>
                {recap.hypeChange > 0 ? '+' : ''}{Math.round(recap.hypeChange)}
              </span>
            </div>
          </Card>
        )}
        
        {/* Chart Movements */}
        {recap.chartMovements.length > 0 && (
          <Card>
            <h3 className="font-semibold mb-3">Chart Movements</h3>
            <div className="space-y-2">
              {recap.chartMovements.map((movement, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2 bg-dark-800 rounded-lg"
                >
                  <span className="text-xl">📊</span>
                  <div>
                    <p className="font-medium text-sm">"{movement.songTitle}"</p>
                    <p className="text-xs text-dark-400">
                      {movement.movement} on {movement.chart}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
        
        {/* Milestones */}
        {recap.milestones.length > 0 && (
          <Card className="border-accent-gold/30 bg-accent-gold/5">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span className="text-xl">🏆</span> Milestones Achieved
            </h3>
            <div className="space-y-2">
              {recap.milestones.map((milestone, i) => (
                <div
                  key={i}
                  className="p-3 bg-dark-800 rounded-lg"
                >
                  <p className="font-medium text-accent-gold">{milestone}</p>
                </div>
              ))}
            </div>
          </Card>
        )}
        
        {/* Events */}
        {recap.events.length > 0 && (
          <Card>
            <h3 className="font-semibold mb-3">This Week</h3>
            <div className="space-y-2">
              {recap.events.map((event, i) => (
                <div
                  key={i}
                  className="p-3 bg-dark-800 rounded-lg text-sm"
                >
                  {event}
                </div>
              ))}
            </div>
          </Card>
        )}
        
        {/* Empty State */}
        {!hasGoodNews && recap.events.length === 0 && (
          <Card className="text-center py-8">
            <p className="text-dark-400">
              A quiet week. Keep grinding.
            </p>
          </Card>
        )}
      </div>
      
      {/* Continue Button */}
      <div className="p-4 pb-safe border-t border-dark-800">
        <Button
          onClick={() => setScreen('home')}
          fullWidth
          size="lg"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
