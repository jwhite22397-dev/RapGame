import { ArtistAvatar } from '@/components/character/ArtistAvatar';
import { Button } from '@/components/ui/Button';
import type { Appearance } from '@/game/models/types';
import type { ShowResult } from '@/game/engine/lifestyle';
import { formatMoney } from '@/utils/format';
import { clsx } from 'clsx';

interface StageSceneProps {
  appearance: Appearance;
  artistName: string;
  result: ShowResult;
  onContinue: () => void;
}

export function StageScene({ appearance, artistName, result, onContinue }: StageSceneProps) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-black to-black" />
        <div className="stage-beam stage-beam-left" />
        <div className="stage-beam stage-beam-right" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent" />

        <div className="relative z-10 flex h-full flex-col items-center justify-end pb-8 px-4">
          <p className="mb-2 text-xs uppercase tracking-[0.3em] text-purple-200/80">
            {result.venueName} · {result.city}
          </p>
          <ArtistAvatar appearance={appearance} size="xl" mood="stage" className="shadow-2xl shadow-purple-500/20" />
          <h1 className="mt-4 text-2xl font-black tracking-tight">{artistName}</h1>
          <p className="text-sm text-dark-300 capitalize">{result.venueType.replace('-', ' ')} night</p>

          <div className="mt-6 flex items-end gap-1 h-10 opacity-70" aria-hidden>
            {Array.from({ length: 18 }).map((_, i) => (
              <div
                key={i}
                className="w-3 rounded-t-full bg-dark-700"
                style={{ height: `${18 + ((i * 17) % 22)}px` }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 space-y-4 border-t border-white/10 bg-dark-950 p-4 pb-safe">
        <div
          className={clsx(
            'rounded-2xl p-4',
            result.quality === 'unforgettable' && 'bg-accent-gold/10 border border-accent-gold/30',
            result.quality === 'solid' && 'bg-dark-800',
            result.quality === 'rough' && 'bg-red-950/40 border border-red-900/40'
          )}
        >
          <p className="text-sm font-semibold capitalize">{result.quality} set</p>
          <p className="mt-2 text-sm text-dark-200">{result.recap}</p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div className="rounded-xl bg-dark-800 p-3">
            <p className="text-xs text-dark-400">Pay</p>
            <p className="font-bold">{formatMoney(result.pay)}</p>
          </div>
          <div className="rounded-xl bg-dark-800 p-3">
            <p className="text-xs text-dark-400">Crowd</p>
            <p className="font-bold">{result.crowdSize}</p>
          </div>
          <div className="rounded-xl bg-dark-800 p-3">
            <p className="text-xs text-dark-400">Followers</p>
            <p className="font-bold text-accent-viral">+{result.followersGained}</p>
          </div>
        </div>

        <Button onClick={onContinue} fullWidth size="lg">
          Leave the venue
        </Button>
      </div>
    </div>
  );
}
