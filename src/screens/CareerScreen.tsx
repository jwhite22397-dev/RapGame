import { useGameStore } from '@/store/gameStore';
import { GameLayout } from '@/components/layout/GameLayout';
import { ArtistAvatar } from '@/components/character/ArtistAvatar';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatBar } from '@/components/ui/Progress';
import { formatCareerTier } from '@/game/engine/player';
import { formatWeek } from '@/utils/format';
import { clsx } from 'clsx';

export function CareerScreen() {
  const gameState = useGameStore((s) => s.gameState);
  const setScreen = useGameStore((s) => s.setScreen);
  
  if (!gameState) return null;
  
  const { player, careerTimeline } = gameState;
  const recentTimeline = [...careerTimeline].reverse().slice(0, 20);
  
  return (
    <GameLayout>
      <div className="p-4 space-y-4">
        {/* Career Overview */}
        <Card variant="highlight">
          <div className="text-center">
            <ArtistAvatar appearance={player.appearance} size="xl" className="mx-auto mb-4" />
            <h2 className="text-xl font-bold">{player.artistName}</h2>
            <p className="text-dark-400">{player.realName || 'Anonymous'}</p>
            <p className="text-sm text-dark-500 mt-1">
              Age {player.age} • {player.hometown}
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-dark-800 rounded-full">
              <span className={clsx(
                'w-2 h-2 rounded-full',
                player.careerTier === 'icon' ? 'bg-accent-gold' :
                player.careerTier === 'superstar' ? 'bg-accent-hype' :
                'bg-accent-viral'
              )} />
              <span className="font-semibold">{formatCareerTier(player.careerTier)}</span>
            </div>
            <Button className="mt-4" variant="secondary" size="sm" onClick={() => setScreen('lifestyle')}>
              Change look / shop
            </Button>
          </div>
        </Card>
        
        {/* Attributes */}
        <Card>
          <CardHeader>
            <CardTitle>Attributes</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            <StatBar label="Writing" value={player.attributes.writing} />
            <StatBar label="Flow" value={player.attributes.flow} />
            <StatBar label="Melody" value={player.attributes.melody} />
            <StatBar label="Performance" value={player.attributes.performance} />
            <StatBar label="Production Knowledge" value={player.attributes.productionKnowledge} />
            <StatBar label="Marketing" value={player.attributes.marketing} />
            <StatBar label="Networking" value={player.attributes.networking} />
            <StatBar label="Business" value={player.attributes.business} />
            <StatBar label="Charisma" value={player.attributes.charisma} />
          </div>
        </Card>
        
        {/* Reputation */}
        <Card>
          <CardHeader>
            <CardTitle>Reputation</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            <StatBar label="Underground Credibility" value={player.reputation.undergroundCredibility} />
            <StatBar label="Mainstream Recognition" value={player.reputation.mainstreamRecognition} />
            <StatBar label="Industry Respect" value={player.reputation.industryRespect} />
          </div>
        </Card>
        
        {/* Milestones */}
        {player.milestones.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Milestones</CardTitle>
              <span className="text-sm text-dark-400">{player.milestones.length} achieved</span>
            </CardHeader>
            <div className="flex flex-wrap gap-2">
              {player.milestones.slice(-10).map((m, i) => (
                <span
                  key={i}
                  className="text-xs px-3 py-1.5 bg-dark-800 rounded-full"
                >
                  {m.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </span>
              ))}
            </div>
          </Card>
        )}
        
        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Career Timeline</CardTitle>
          </CardHeader>
          <div className="relative">
            <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-dark-800" />
            <div className="space-y-4 pl-8">
              {recentTimeline.map((entry, i) => (
                <div key={i} className="relative">
                  <div className={clsx(
                    'absolute -left-6 w-3 h-3 rounded-full border-2 border-dark-950',
                    entry.type === 'milestone' ? 'bg-accent-gold' :
                    entry.type === 'release' ? 'bg-accent-viral' :
                    'bg-dark-600'
                  )} />
                  <p className="text-sm">{entry.event}</p>
                  <p className="text-xs text-dark-500">
                    Age {entry.age} • {formatWeek(entry.week)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Card>
        
        {/* Contract */}
        {player.labelContract && (
          <Card>
            <CardHeader>
              <CardTitle>Contract</CardTitle>
            </CardHeader>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-dark-400">Label</span>
                <span>{player.labelContract.labelName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">Royalty Rate</span>
                <span>{player.labelContract.royaltyPercent}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">Albums Required</span>
                <span>{player.labelContract.albumsDelivered}/{player.labelContract.albumsRequired}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">Masters</span>
                <span className="capitalize">{player.labelContract.masterOwnership}</span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </GameLayout>
  );
}
