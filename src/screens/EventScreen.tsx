import { useGameStore } from '@/store/gameStore';
import { Card } from '@/components/ui/Card';
import { formatMoney } from '@/utils/format';
import { clsx } from 'clsx';

export function EventScreen() {
  const gameState = useGameStore((s) => s.gameState);
  const selectedEventId = useGameStore((s) => s.ui.selectedEventId);
  const resolveEvent = useGameStore((s) => s.resolveEvent);
  const setScreen = useGameStore((s) => s.setScreen);
  
  if (!gameState || !selectedEventId) {
    setScreen('home');
    return null;
  }
  
  const event = gameState.activeEvents.find(e => e.id === selectedEventId);
  if (!event || event.resolved) {
    setScreen('home');
    return null;
  }
  
  const player = gameState.player;
  
  const canAffordChoice = (choice: NonNullable<typeof event.choices>[0]) => {
    if (!choice.cost) return true;
    if (choice.cost.type === 'money') {
      return player.stats.cash >= choice.cost.amount;
    }
    if (choice.cost.type === 'energy') {
      return player.stats.energy >= choice.cost.amount;
    }
    return true;
  };
  
  return (
    <div className="screen-frame bg-dark-950">
      {/* Header */}
      <header className="flex shrink-0 items-center border-b border-dark-800 p-4">
        <button
          onClick={() => setScreen('home')}
          className="p-2 -ml-2 text-dark-400 hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h1 className="flex-1 text-center font-semibold">Event</h1>
        <div className="w-10" />
      </header>
      
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overflow-x-hidden p-4">
        {/* Event Card */}
        <Card variant="highlight" padding="lg">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-dark-800 flex items-center justify-center text-3xl">
              {event.type === 'opportunity' ? '✨' :
               event.type === 'setback' ? '⚠️' :
               event.type === 'success' ? '🎉' :
               event.type === 'viral' ? '🔥' : '📣'}
            </div>
            <h2 className="text-xl font-bold mb-2">{event.title}</h2>
            <p className="text-dark-300">{event.description}</p>
          </div>
        </Card>
        
        {/* Choices */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-dark-400">What do you do?</h3>
          
          {event.choices?.map((choice) => {
            const canAfford = canAffordChoice(choice);
            
            return (
              <button
                key={choice.id}
                onClick={() => canAfford && resolveEvent(event.id, choice.id)}
                disabled={!canAfford}
                className={clsx(
                  'w-full p-4 rounded-xl text-left transition-all',
                  'border-2',
                  canAfford
                    ? 'bg-dark-800 border-dark-700 hover:border-white active:scale-[0.99]'
                    : 'bg-dark-900 border-dark-800 opacity-50 cursor-not-allowed'
                )}
              >
                <p className="font-medium">{choice.text}</p>
                
                {choice.cost && (
                  <p className={clsx(
                    'text-sm mt-1',
                    canAfford ? 'text-dark-400' : 'text-red-400'
                  )}>
                    {choice.cost.type === 'money' 
                      ? `Costs ${formatMoney(choice.cost.amount)}`
                      : `Costs ${choice.cost.amount} energy`}
                  </p>
                )}
                
                {/* Show effect hints */}
                {choice.effects.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {choice.effects.slice(0, 3).map((effect, i) => (
                      <span
                        key={i}
                        className={clsx(
                          'text-xs px-2 py-0.5 rounded-full',
                          effect.value > 0 ? 'bg-accent-viral/20 text-accent-viral' :
                          effect.value < 0 ? 'bg-red-500/20 text-red-400' :
                          'bg-dark-700 text-dark-400'
                        )}
                      >
                        {effect.value > 0 ? '+' : ''}{effect.value} {effect.type}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
