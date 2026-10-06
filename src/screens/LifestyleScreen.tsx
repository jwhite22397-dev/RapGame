import { useGameStore } from '@/store/gameStore';
import { GameLayout } from '@/components/layout/GameLayout';
import { Header } from '@/components/layout/Header';
import { ArtistAvatar } from '@/components/character/ArtistAvatar';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { DATE_COST, SHOP_ITEMS } from '@/game/data/lifestyle';
import { formatMoney } from '@/utils/format';
import { clsx } from 'clsx';

const CATEGORIES = [
  { id: 'studio', label: 'Studio' },
  { id: 'jewelry', label: 'Jewelry' },
  { id: 'fit', label: 'Fits' },
  { id: 'flex', label: 'Flex' },
] as const;

export function LifestyleScreen() {
  const gameState = useGameStore((s) => s.gameState);
  const setScreen = useGameStore((s) => s.setScreen);
  const buyItem = useGameStore((s) => s.buyItem);
  const goOnDate = useGameStore((s) => s.goOnDate);
  const endRelationship = useGameStore((s) => s.endRelationship);

  if (!gameState) return null;

  const { player } = gameState;
  const owned = new Set(player.lifestyle.ownedItemIds);

  return (
    <GameLayout hideNav hideHeader>
      <Header title="Lifestyle" showBack onBack={() => setScreen('home')} />
      <div className="space-y-4 p-4">
        <Card variant="highlight" className="flex items-center gap-4">
          <ArtistAvatar appearance={player.appearance} size="lg" />
          <div>
            <h2 className="text-lg font-bold">{player.artistName}</h2>
            <p className="text-sm text-dark-400">Mood {Math.round(player.lifestyle.mood)}</p>
            <p className="text-sm text-dark-300">{formatMoney(player.stats.cash)} on hand</p>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Date</CardTitle>
          </CardHeader>
          {player.lifestyle.dating ? (
            <div className="space-y-3">
              <p className="text-sm">
                Seeing <span className="font-semibold">{player.lifestyle.dating.partnerName}</span>
                {' · '}
                <span className="capitalize text-dark-300">{player.lifestyle.dating.status}</span>
              </p>
              <p className="text-xs text-dark-400">
                Chemistry {Math.round(player.lifestyle.dating.chemistry)} · {player.lifestyle.dating.weeksTogether} weeks
              </p>
              <div className="flex gap-2">
                <Button
                  fullWidth
                  onClick={goOnDate}
                  disabled={player.stats.cash < DATE_COST.money || player.stats.energy < DATE_COST.energy}
                >
                  Go out (${DATE_COST.money})
                </Button>
                <Button variant="ghost" onClick={endRelationship}>
                  Cool off
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-dark-300">
                Take a night off the grind. Sometimes the next song comes from that.
              </p>
              <Button
                onClick={goOnDate}
                disabled={player.stats.cash < DATE_COST.money || player.stats.energy < DATE_COST.energy}
              >
                Go out · ${DATE_COST.money} · -{DATE_COST.energy} energy
              </Button>
            </div>
          )}
        </Card>

        {CATEGORIES.map((category) => {
          const items = SHOP_ITEMS.filter((item) => item.category === category.id);
          return (
            <Card key={category.id}>
              <CardHeader>
                <CardTitle>{category.label}</CardTitle>
              </CardHeader>
              <div className="space-y-3">
                {items.map((item) => {
                  const isOwned = owned.has(item.id);
                  const locked = !!(item.unlockFollowers && player.stats.followers < item.unlockFollowers);
                  return (
                    <div
                      key={item.id}
                      className={clsx(
                        'rounded-xl border border-dark-700 p-3',
                        isOwned && 'border-accent-gold/40 bg-accent-gold/5'
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="mt-1 text-xs text-dark-400">{item.description}</p>
                          {item.weeklyHype > 0 && (
                            <p className="mt-1 text-xs text-accent-viral">+{item.weeklyHype} weekly hype</p>
                          )}
                          {item.recordEnergyDiscount > 0 && (
                            <p className="mt-1 text-xs text-accent-viral">
                              Recording -{item.recordEnergyDiscount} energy
                            </p>
                          )}
                        </div>
                        {isOwned ? (
                          <span className="text-xs font-semibold text-accent-gold">Owned</span>
                        ) : (
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={locked || player.stats.cash < item.price}
                            onClick={() => buyItem(item.id)}
                          >
                            {locked ? `${item.unlockFollowers}+ fans` : formatMoney(item.price)}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>
    </GameLayout>
  );
}
