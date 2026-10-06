import { useGameStore } from '@/store/gameStore';
import { formatMoney, formatWeek } from '@/utils/format';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightContent?: React.ReactNode;
}

export function Header({ title, showBack, onBack, rightContent }: HeaderProps) {
  const setScreen = useGameStore((s) => s.setScreen);
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      setScreen('home');
    }
  };
  
  return (
    <header className="sticky top-0 bg-dark-950/90 backdrop-blur-lg z-30 border-b border-dark-800/50">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          {showBack && (
            <button
              onClick={handleBack}
              className="p-2 -ml-2 text-dark-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {title && (
            <h1 className="text-lg font-semibold text-white truncate">{title}</h1>
          )}
        </div>
        
        {rightContent && (
          <div className="flex items-center gap-2">
            {rightContent}
          </div>
        )}
      </div>
    </header>
  );
}

export function GameHeader() {
  const gameState = useGameStore((s) => s.gameState);
  const setScreen = useGameStore((s) => s.setScreen);
  const toggleDevPanel = useGameStore((s) => s.toggleDevPanel);
  
  if (!gameState) return null;
  
  const { player, currentWeek } = gameState;
  
  return (
    <header className="sticky top-0 bg-dark-950/90 backdrop-blur-lg z-30 border-b border-dark-800/50">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold">
            {player.artistName[0]}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{player.artistName}</p>
            <p className="text-xs text-dark-400">{formatWeek(currentWeek)}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-white">{formatMoney(player.stats.cash)}</p>
            <p className="text-xs text-dark-400">Energy: {player.stats.energy}</p>
          </div>
          
          <button
            onClick={() => setScreen('settings')}
            className="p-2 text-dark-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          
          {import.meta.env.DEV && (
            <button
              onClick={toggleDevPanel}
              className="p-2 text-dark-400 hover:text-accent-viral transition-colors"
              title="Dev Tools"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
