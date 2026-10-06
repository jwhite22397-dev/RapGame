import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { ArtistAvatar } from '@/components/character/ArtistAvatar';
import { ARCHETYPE_LIST } from '@/game/data/archetypes';
import { GENRE_LIST } from '@/game/data/genres';
import { defaultAppearance } from '@/game/data/lifestyle';
import type { Appearance, Genre, Archetype, HairStyle, SkinTone } from '@/game/models/types';
import { clsx } from 'clsx';

export function NewCareerScreen() {
  const setScreen = useGameStore((s) => s.setScreen);
  const startNewCareer = useGameStore((s) => s.startNewCareer);
  
  const [step, setStep] = useState(1);
  const [artistName, setArtistName] = useState('');
  const [realName, setRealName] = useState('');
  const [hometown, setHometown] = useState('');
  const [age, setAge] = useState(21);
  const [genre, setGenre] = useState<Genre>('trap');
  const [archetype, setArchetype] = useState<Archetype>('lyricist');
  const [appearance, setAppearance] = useState<Appearance>(defaultAppearance());
  
  const handleSubmit = () => {
    if (!artistName.trim()) return;
    
    startNewCareer({
      artistName: artistName.trim(),
      realName: realName.trim() || undefined,
      hometown: hometown.trim() || undefined,
      age,
      genre,
      archetype,
      appearance,
    });
  };
  
  const canProceed = step === 1 ? artistName.trim().length > 0 : true;
  const totalSteps = 4;
  
  return (
    <div className="screen-frame bg-dark-950">
      {/* Header */}
      <header className="flex shrink-0 items-center p-4">
        <button
          onClick={() => step > 1 ? setStep(step - 1) : setScreen('title')}
          className="p-2 -ml-2 text-dark-400 hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 text-center">
          <span className="text-sm text-dark-400">Step {step} of {totalSteps}</span>
        </div>
        <div className="w-10" />
      </header>
      
      {/* Progress bar */}
      <div className="mb-6 shrink-0 px-4">
        <div className="h-1 bg-dark-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>
      
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 pb-safe">
        {/* Step 1: Identity */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Who are you?</h2>
              <p className="text-dark-400">Create your artist identity</p>
            </div>
            
            <Input
              label="Artist Name"
              placeholder="Your stage name"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              autoFocus
            />
            
            <Input
              label="Real Name (Optional)"
              placeholder="Your real name"
              value={realName}
              onChange={(e) => setRealName(e.target.value)}
            />
            
            <Input
              label="Hometown (Optional)"
              placeholder="Where you from?"
              value={hometown}
              onChange={(e) => setHometown(e.target.value)}
            />
            
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-dark-300">Starting Age</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={16}
                  max={35}
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value))}
                  className="flex-1 accent-white"
                />
                <span className="w-12 text-center font-semibold">{age}</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Step 2: Sound */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">What's your sound?</h2>
              <p className="text-dark-400">Choose your primary genre</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {GENRE_LIST.map((g) => (
                <Card
                  key={g.id}
                  interactive
                  padding="sm"
                  variant={genre === g.id ? 'highlight' : 'default'}
                  className={clsx(
                    genre === g.id && 'ring-2 ring-white'
                  )}
                  onClick={() => setGenre(g.id)}
                >
                  <h3 className="font-semibold text-sm">{g.name}</h3>
                  <p className="text-xs text-dark-400 mt-1 line-clamp-2">
                    {g.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        {/* Step 3: Archetype */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">What's your approach?</h2>
              <p className="text-dark-400">Choose your archetype</p>
            </div>
            
            <div className="space-y-3">
              {ARCHETYPE_LIST.map((a) => (
                <Card
                  key={a.id}
                  interactive
                  padding="md"
                  variant={archetype === a.id ? 'highlight' : 'default'}
                  className={clsx(
                    archetype === a.id && 'ring-2 ring-white'
                  )}
                  onClick={() => setArchetype(a.id)}
                >
                  <h3 className="font-semibold">{a.name}</h3>
                  <p className="text-sm text-dark-400 mt-1">
                    {a.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {a.strengths.map((s, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 bg-dark-800 rounded-full text-accent-viral"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div className="mb-6 text-center">
              <h2 className="mb-2 text-2xl font-bold">How do you look?</h2>
              <p className="text-dark-400">You can change clothes and jewelry later with money.</p>
            </div>
            <div className="flex justify-center">
              <ArtistAvatar appearance={appearance} size="xl" />
            </div>
            <LookPicker
              label="Skin"
              options={['deep', 'brown', 'tan', 'olive', 'fair']}
              value={appearance.skinTone}
              onChange={(skinTone) => setAppearance({ ...appearance, skinTone: skinTone as SkinTone })}
            />
            <LookPicker
              label="Hair"
              options={['fade', 'short', 'curls', 'braids', 'locs', 'long']}
              value={appearance.hairStyle}
              onChange={(hairStyle) => setAppearance({ ...appearance, hairStyle: hairStyle as HairStyle })}
            />
            <LookPicker
              label="Hair color"
              options={['black', 'brown', 'blonde', 'red', 'silver']}
              value={appearance.hairColor}
              onChange={(hairColor) => setAppearance({ ...appearance, hairColor: hairColor as Appearance['hairColor'] })}
            />
            <button
              className="text-sm text-dark-300"
              onClick={() => setAppearance({ ...appearance, glasses: !appearance.glasses })}
            >
              {appearance.glasses ? 'Remove glasses' : 'Add glasses'}
            </button>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="shrink-0 border-t border-dark-800 p-4 pb-safe">
        <Button
          onClick={() => step < totalSteps ? setStep(step + 1) : handleSubmit()}
          fullWidth
          size="lg"
          disabled={!canProceed}
        >
          {step < totalSteps ? 'Continue' : 'Start Career'}
        </Button>
      </div>
    </div>
  );
}

function LookPicker({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm text-dark-300">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={clsx(
              'rounded-full px-3 py-1.5 text-sm capitalize',
              value === option ? 'bg-white text-dark-950' : 'bg-dark-800 text-dark-300'
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
