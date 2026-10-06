import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { StageScene } from '@/components/scenes/StageScene';

export function PerformanceScreen() {
  const gameState = useGameStore((s) => s.gameState);
  const lastShowResult = useGameStore((s) => s.ui.lastShowResult);
  const setScreen = useGameStore((s) => s.setScreen);

  useEffect(() => {
    if (!lastShowResult) setScreen('home');
  }, [lastShowResult, setScreen]);

  if (!gameState || !lastShowResult) {
    return null;
  }

  return (
    <StageScene
      appearance={gameState.player.appearance}
      artistName={gameState.player.artistName}
      result={lastShowResult}
      onContinue={() => setScreen('home')}
    />
  );
}
