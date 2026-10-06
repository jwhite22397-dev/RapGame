import { AlbumCover } from '@/components/ui/AlbumCover';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { Song } from '@/game/models/types';
import { formatMoney, getQualityLabel } from '@/utils/format';
import { clsx } from 'clsx';

interface ReleaseModalProps {
  song: Song | null;
  cash: number;
  marketingSpend: number;
  onMarketingSpend: (amount: number) => void;
  onClose: () => void;
  onRelease: () => void;
}

export function ReleaseModal({
  song,
  cash,
  marketingSpend,
  onMarketingSpend,
  onClose,
  onRelease,
}: ReleaseModalProps) {
  return (
    <Modal isOpen={!!song} onClose={onClose} title="Release Song">
      {song && (
        <div className="space-y-6">
          <div className="flex gap-4">
            <AlbumCover seed={song.id} size="lg" />
            <div>
              <h3 className="font-semibold">{song.title}</h3>
              <p className="text-sm text-dark-400">
                Quality: {getQualityLabel(song.quality)}
              </p>
            </div>
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium text-dark-300">
              Marketing Budget
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[0, 100, 500].map((amount) => (
                <button
                  key={amount}
                  onClick={() => onMarketingSpend(amount)}
                  disabled={cash < amount}
                  className={clsx(
                    'rounded-xl p-3 text-sm transition-colors',
                    marketingSpend === amount
                      ? 'bg-white text-dark-950'
                      : cash < amount
                        ? 'cursor-not-allowed bg-dark-900 text-dark-600'
                        : 'bg-dark-800 hover:bg-dark-700'
                  )}
                >
                  {amount === 0 ? 'Free' : formatMoney(amount)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose} fullWidth>
              Cancel
            </Button>
            <Button onClick={onRelease} fullWidth disabled={cash < marketingSpend}>
              Drop it
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
