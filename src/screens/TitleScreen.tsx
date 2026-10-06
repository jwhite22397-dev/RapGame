import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/Button';

export function TitleScreen() {
  const hasExistingSave = useGameStore((s) => s.hasExistingSave);
  const setScreen = useGameStore((s) => s.setScreen);
  const loadExistingGame = useGameStore((s) => s.loadExistingGame);
  
  const handleContinue = async () => {
    const success = await loadExistingGame();
    if (!success) {
      // If load fails, start new career
      setScreen('new-career');
    }
  };
  
  return (
    <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center p-6">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-b from-purple-900/20 via-dark-950 to-dark-950" />
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center text-center">
        {/* Logo */}
        <div className="mb-12">
          <h1 className="text-5xl font-black tracking-tight bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
            RAP GAME
          </h1>
          <p className="text-dark-400 mt-2 text-sm tracking-widest uppercase">
            Rise to the Top
          </p>
        </div>
        
        {/* Menu */}
        <div className="w-full space-y-4">
          {hasExistingSave && (
            <Button
              onClick={handleContinue}
              fullWidth
              size="lg"
            >
              Continue Career
            </Button>
          )}
          
          <Button
            onClick={() => setScreen('new-career')}
            variant={hasExistingSave ? 'secondary' : 'primary'}
            fullWidth
            size="lg"
          >
            New Career
          </Button>
          
          <Button
            onClick={() => setScreen('settings')}
            variant="ghost"
            fullWidth
          >
            Settings
          </Button>
        </div>
        
        {/* Version */}
        <p className="mt-12 text-dark-600 text-xs">
          Version 0.1.0 MVP
        </p>
      </div>
      
      {/* Decorative elements */}
      <div className="fixed top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="fixed bottom-1/4 right-1/4 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl" />
    </div>
  );
}
