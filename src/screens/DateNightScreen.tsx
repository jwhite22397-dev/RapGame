import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { DateScene } from '@/components/scenes/DateScene';

export function DateNightScreen() {
  const gameState = useGameStore((s) => s.gameState);
  const lastDateResult = useGameStore((s) => s.ui.lastDateResult);
  const setScreen = useGameStore((s) => s.setScreen);

  useEffect(() => {
    if (!lastDateResult) setScreen('lifestyle');
  }, [lastDateResult, setScreen]);

  if (!gameState || !lastDateResult) {
    return null;
  }

  return (
    <DateScene
      appearance={gameState.player.appearance}
      result={lastDateResult}
      onContinue={() => setScreen('home')}
    />
  );
}
