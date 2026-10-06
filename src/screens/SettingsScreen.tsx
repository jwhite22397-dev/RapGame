import { useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export function SettingsScreen() {
  const setScreen = useGameStore((s) => s.setScreen);
  const gameState = useGameStore((s) => s.gameState);
  const exportGame = useGameStore((s) => s.exportGame);
  const importGame = useGameStore((s) => s.importGame);
  const showToast = useGameStore((s) => s.showToast);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleExport = () => {
    const json = exportGame();
    if (json) {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapgame-${gameState?.player?.artistName || 'save'}-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Save exported successfully!', 'success');
    }
  };
  
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const json = event.target?.result as string;
      const success = importGame(json);
      if (success) {
        showToast('Save imported successfully!', 'success');
      } else {
        showToast('Failed to import save file', 'error');
      }
    };
    reader.readAsText(file);
    
    // Reset input
    e.target.value = '';
  };
  
  const handleBack = () => {
    if (gameState) {
      setScreen('home');
    } else {
      setScreen('title');
    }
  };
  
  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center border-b border-dark-800">
        <button
          onClick={handleBack}
          className="p-2 -ml-2 text-dark-400 hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="flex-1 text-center font-semibold">Settings</h1>
        <div className="w-10" />
      </header>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Save Management */}
        <Card>
          <h3 className="font-semibold mb-4">Save Data</h3>
          <div className="space-y-3">
            <Button
              onClick={handleExport}
              variant="secondary"
              fullWidth
              disabled={!gameState}
            >
              Export Save
            </Button>
            <Button
              onClick={handleImportClick}
              variant="secondary"
              fullWidth
            >
              Import Save
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </div>
          <p className="text-xs text-dark-500 mt-3">
            Export your save to back it up or transfer between devices.
          </p>
        </Card>
        
        {/* About */}
        <Card>
          <h3 className="font-semibold mb-4">About</h3>
          <div className="space-y-2 text-sm text-dark-400">
            <p><strong className="text-white">RAP GAME</strong> v0.1.0</p>
            <p>A music career simulation game.</p>
            <p className="mt-4 text-xs text-dark-500">
              All artists, labels, and events in this game are fictional.
            </p>
          </div>
        </Card>
        
        {/* Danger Zone */}
        {gameState && (
          <Card className="border-red-900/50">
            <h3 className="font-semibold text-red-400 mb-4">Danger Zone</h3>
            <Button
              variant="danger"
              fullWidth
              onClick={() => {
                if (confirm('Are you sure you want to reset your career? This cannot be undone.')) {
                  // Clear local storage and reload
                  localStorage.clear();
                  window.location.reload();
                }
              }}
            >
              Reset Career
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
