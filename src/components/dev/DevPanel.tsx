import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export function DevPanel() {
  const [cashAmount, setCashAmount] = useState('10000');
  const [followersAmount, setFollowersAmount] = useState('1000');
  const [hypeAmount, setHypeAmount] = useState('50');
  
  const toggleDevPanel = useGameStore((s) => s.toggleDevPanel);
  const devAddCash = useGameStore((s) => s.devAddCash);
  const devAddFollowers = useGameStore((s) => s.devAddFollowers);
  const devSetHype = useGameStore((s) => s.devSetHype);
  const endWeek = useGameStore((s) => s.endWeek);
  const gameState = useGameStore((s) => s.gameState);
  const exportGame = useGameStore((s) => s.exportGame);
  
  const handleExport = () => {
    const json = exportGame();
    if (json) {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapgame-save-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };
  
  if (!gameState) return null;
  
  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="max-w-md mx-auto p-4">
        <div className="bg-dark-900 rounded-2xl border border-dark-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-accent-viral">Dev Panel</h2>
            <button
              onClick={toggleDevPanel}
              className="p-2 text-dark-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Current State */}
            <div className="bg-dark-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-dark-300 mb-3">Current State</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Week: {gameState.currentWeek}</div>
                <div>Cash: ${gameState.player.stats.cash.toLocaleString()}</div>
                <div>Followers: {gameState.player.stats.followers.toLocaleString()}</div>
                <div>Hype: {gameState.player.stats.hype}</div>
                <div>Energy: {gameState.player.stats.energy}</div>
                <div>Tier: {gameState.player.careerTier}</div>
                <div>Songs: {gameState.songs.length}</div>
                <div>Events: {gameState.activeEvents.length}</div>
              </div>
            </div>
            
            {/* Add Cash */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={() => devAddCash(parseInt(cashAmount) || 0)}
                  variant="secondary"
                >
                  Add Cash
                </Button>
              </div>
            </div>
            
            {/* Add Followers */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={followersAmount}
                  onChange={(e) => setFollowersAmount(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={() => devAddFollowers(parseInt(followersAmount) || 0)}
                  variant="secondary"
                >
                  Add Followers
                </Button>
              </div>
            </div>
            
            {/* Set Hype */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={hypeAmount}
                  onChange={(e) => setHypeAmount(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={() => devSetHype(parseInt(hypeAmount) || 0)}
                  variant="secondary"
                >
                  Set Hype
                </Button>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-dark-300">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={endWeek} variant="secondary" size="sm">
                  Skip Week
                </Button>
                <Button onClick={() => {
                  for (let i = 0; i < 4; i++) endWeek();
                }} variant="secondary" size="sm">
                  Skip Month
                </Button>
                <Button onClick={() => {
                  for (let i = 0; i < 52; i++) endWeek();
                }} variant="secondary" size="sm">
                  Skip Year
                </Button>
                <Button onClick={handleExport} variant="secondary" size="sm">
                  Export Save
                </Button>
              </div>
            </div>
            
            {/* Attributes */}
            <div>
              <h3 className="text-sm font-semibold text-dark-300 mb-2">Attributes</h3>
              <div className="grid grid-cols-2 gap-1 text-xs bg-dark-800 rounded-xl p-3">
                {Object.entries(gameState.player.attributes).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-dark-400 capitalize">{key}</span>
                    <span>{Math.round(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
