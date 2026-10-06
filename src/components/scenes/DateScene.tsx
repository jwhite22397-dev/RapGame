import { ArtistAvatar } from '@/components/character/ArtistAvatar';
import { Button } from '@/components/ui/Button';
import type { Appearance } from '@/game/models/types';
import type { DateResult } from '@/game/engine/lifestyle';

interface DateSceneProps {
  appearance: Appearance;
  result: DateResult;
  onContinue: () => void;
}

export function DateScene({ appearance, result, onContinue }: DateSceneProps) {
  return (
    <div className="screen-root flex flex-col bg-[#120c10] text-white">
      <div className="relative min-h-[42vh] min-w-0 flex-1 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-rose-950/80 via-[#1a1014] to-black" />
        <div className="absolute left-8 top-16 h-24 w-24 rounded-full bg-amber-200/20 blur-2xl" />
        <div className="absolute right-10 top-24 h-16 w-16 rounded-full bg-rose-400/20 blur-xl" />

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-rose-200/70">Night out</p>
          <div className="mt-8 flex items-end gap-4">
            <ArtistAvatar appearance={appearance} size="lg" mood="date" />
            <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-gradient-to-b from-rose-900 to-dark-900 text-4xl">
              {result.partnerName[0]}
            </div>
          </div>
          <h1 className="mt-6 text-2xl font-bold">{result.partnerName}</h1>
          <p className="mt-1 text-sm capitalize text-rose-200/80">{result.status}</p>
        </div>
      </div>

      <div className="shrink-0 space-y-4 border-t border-white/10 bg-dark-950 p-4 pb-safe">
        <div className="rounded-2xl bg-dark-800 p-4">
          <p className="text-sm text-dark-100">{result.scene}</p>
          <p className="mt-3 text-sm font-medium text-rose-200">{result.outcome}</p>
        </div>
        <Button onClick={onContinue} fullWidth size="lg">
          Head home
        </Button>
      </div>
    </div>
  );
}
