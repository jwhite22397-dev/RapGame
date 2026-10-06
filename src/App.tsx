import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';

// Screens
import { TitleScreen } from '@/screens/TitleScreen';
import { NewCareerScreen } from '@/screens/NewCareerScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { CareerScreen } from '@/screens/CareerScreen';
import { MusicScreen } from '@/screens/MusicScreen';
import { SocialScreen } from '@/screens/SocialScreen';
import { MoneyScreen } from '@/screens/MoneyScreen';
import { WeeklyRecapScreen } from '@/screens/WeeklyRecapScreen';
import { EventScreen } from '@/screens/EventScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { SongDetailScreen } from '@/screens/SongDetailScreen';
import { LifestyleScreen } from '@/screens/LifestyleScreen';
import { PerformanceScreen } from '@/screens/PerformanceScreen';
import { DateNightScreen } from '@/screens/DateNightScreen';

function App() {
  const currentScreen = useGameStore((s) => s.ui.currentScreen);
  const isLoading = useGameStore((s) => s.ui.isLoading);
  const initGame = useGameStore((s) => s.initGame);
  
  useEffect(() => {
    initGame();
  }, [initGame]);
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  switch (currentScreen) {
    case 'title':
      return <TitleScreen />;
    case 'new-career':
      return <NewCareerScreen />;
    case 'home':
      return <HomeScreen />;
    case 'career':
      return <CareerScreen />;
    case 'music':
      return <MusicScreen />;
    case 'social':
      return <SocialScreen />;
    case 'money':
      return <MoneyScreen />;
    case 'weekly-recap':
      return <WeeklyRecapScreen />;
    case 'event':
      return <EventScreen />;
    case 'settings':
      return <SettingsScreen />;
    case 'song-detail':
      return <SongDetailScreen />;
    case 'lifestyle':
      return <LifestyleScreen />;
    case 'performance':
      return <PerformanceScreen />;
    case 'date-night':
      return <DateNightScreen />;
    default:
      return <TitleScreen />;
  }
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-dark-700 border-t-white rounded-full animate-spin mx-auto mb-4" />
        <p className="text-dark-400">Loading...</p>
      </div>
    </div>
  );
}

export default App;
