import type { ReactNode } from 'react';
import { clsx } from 'clsx';
import { BottomNav } from './BottomNav';
import { GameHeader } from './Header';
import { Toast } from '../ui/Toast';
import { DevPanel } from '../dev/DevPanel';
import { useGameStore } from '@/store/gameStore';

interface GameLayoutProps {
  children: ReactNode;
  hideNav?: boolean;
  hideHeader?: boolean;
}

export function GameLayout({ children, hideNav, hideHeader }: GameLayoutProps) {
  const showDevPanel = useGameStore((s) => s.ui.showDevPanel);
  
  return (
    <div className="min-h-screen bg-dark-950 text-white">
      {/* Desktop side panels */}
      <div className="hidden lg:flex fixed inset-0 justify-center">
        <div className="w-full max-w-7xl flex">
          {/* Left panel */}
          <aside className="w-80 border-r border-dark-800 bg-dark-900/50 p-6 overflow-y-auto">
            <LeftSidePanel />
          </aside>
          
          {/* Main content area */}
          <main className="flex-1 max-w-lg" />
          
          {/* Right panel */}
          <aside className="w-80 border-l border-dark-800 bg-dark-900/50 p-6 overflow-y-auto">
            <RightSidePanel />
          </aside>
        </div>
      </div>
      
      {/* Main mobile content */}
      <div className="max-w-lg mx-auto min-h-screen flex flex-col relative">
        {!hideHeader && <GameHeader />}
        
        <main className={clsx(
          'flex-1 overflow-y-auto',
          !hideNav && 'pb-20'
        )}>
          {children}
        </main>
        
        {!hideNav && <BottomNav />}
      </div>
      
      <Toast />
      
      {showDevPanel && <DevPanel />}
    </div>
  );
}

function LeftSidePanel() {
  const gameState = useGameStore((s) => s.gameState);
  
  if (!gameState) return null;
  
  const { player, news } = gameState;
  const recentNews = news.slice(-10).reverse();
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Career Overview</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-dark-400">Status</span>
            <span className="capitalize">{player.careerTier}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-dark-400">Age</span>
            <span>{player.age}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-dark-400">Genre</span>
            <span className="capitalize">{player.genre.replace('-', ' ')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-dark-400">Label</span>
            <span>{player.labelContract?.labelName || 'Independent'}</span>
          </div>
        </div>
      </div>
      
      <div>
        <h2 className="text-lg font-semibold mb-4">Industry News</h2>
        <div className="space-y-3">
          {recentNews.map((item) => (
            <div
              key={item.id}
              className="text-sm text-dark-300 border-l-2 border-dark-700 pl-3 py-1"
            >
              {item.headline}
            </div>
          ))}
          {recentNews.length === 0 && (
            <p className="text-sm text-dark-500">No news yet...</p>
          )}
        </div>
      </div>
    </div>
  );
}

function RightSidePanel() {
  const gameState = useGameStore((s) => s.gameState);
  
  if (!gameState) return null;
  
  const { charts, player } = gameState;
  const top10 = charts.top100.slice(0, 10);
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Top 100</h2>
        <div className="space-y-2">
          {top10.map((entry) => (
            <div
              key={entry.songId}
              className={clsx(
                'flex items-center gap-3 text-sm p-2 rounded-lg',
                entry.isPlayer ? 'bg-dark-800' : ''
              )}
            >
              <span className="w-6 text-right text-dark-400 font-mono">
                {entry.position}
              </span>
              <div className="min-w-0 flex-1">
                <p className={clsx(
                  'truncate font-medium',
                  entry.isPlayer ? 'text-accent-viral' : 'text-white'
                )}>
                  {entry.songTitle}
                </p>
                <p className="truncate text-dark-400 text-xs">
                  {entry.artistName}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-dark-800 rounded-lg p-3">
            <p className="text-xs text-dark-400">Songs</p>
            <p className="text-xl font-bold">
              {gameState.songs.filter(s => s.status === 'released').length}
            </p>
          </div>
          <div className="bg-dark-800 rounded-lg p-3">
            <p className="text-xs text-dark-400">Chart Hits</p>
            <p className="text-xl font-bold">
              {gameState.songs.filter(s => s.peakChartPosition !== null).length}
            </p>
          </div>
          <div className="bg-dark-800 rounded-lg p-3">
            <p className="text-xs text-dark-400">Milestones</p>
            <p className="text-xl font-bold">
              {player.milestones.length}
            </p>
          </div>
          <div className="bg-dark-800 rounded-lg p-3">
            <p className="text-xs text-dark-400">Awards</p>
            <p className="text-xl font-bold">
              {player.awards.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
