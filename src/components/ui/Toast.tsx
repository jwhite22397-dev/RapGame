import { clsx } from 'clsx';
import { useGameStore } from '@/store/gameStore';

export function Toast() {
  const toast = useGameStore((s) => s.ui.toast);
  const clearToast = useGameStore((s) => s.clearToast);
  
  if (!toast) return null;
  
  return (
    <div
      className={clsx(
        'fixed top-4 left-1/2 -translate-x-1/2 z-[100]',
        'px-4 py-3 rounded-xl shadow-lg',
        'animate-slide-down',
        'max-w-[90vw] text-center',
        {
          'bg-dark-800 text-white border border-dark-700': toast.type === 'info',
          'bg-green-900/90 text-green-100 border border-green-700': toast.type === 'success',
          'bg-red-900/90 text-red-100 border border-red-700': toast.type === 'error',
        }
      )}
      onClick={clearToast}
    >
      <p className="text-sm font-medium">{toast.message}</p>
    </div>
  );
}
