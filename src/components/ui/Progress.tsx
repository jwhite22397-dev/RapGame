import { clsx } from 'clsx';

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'gradient' | 'energy' | 'hype';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = false,
  label,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  return (
    <div className={clsx('w-full', className)}>
      {(showLabel || label) && (
        <div className="flex justify-between mb-1.5 text-sm">
          <span className="text-dark-400">{label}</span>
          {showLabel && (
            <span className="text-dark-300">{Math.round(value)}/{max}</span>
          )}
        </div>
      )}
      <div
        className={clsx(
          'w-full rounded-full bg-dark-800 overflow-hidden',
          {
            'h-1': size === 'sm',
            'h-2': size === 'md',
            'h-3': size === 'lg',
          }
        )}
      >
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-500 ease-out',
            {
              'bg-white': variant === 'default',
              'bg-gradient-to-r from-purple-500 to-pink-500': variant === 'gradient',
              'bg-gradient-to-r from-green-500 to-emerald-400': variant === 'energy',
              'bg-gradient-to-r from-orange-500 to-yellow-400': variant === 'hype',
            }
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface StatBarProps {
  label: string;
  value: number;
  max?: number;
  showValue?: boolean;
  size?: 'sm' | 'md';
}

export function StatBar({
  label,
  value,
  max = 100,
  showValue = true,
  size = 'md',
}: StatBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-dark-400">{label}</span>
        {showValue && (
          <span className={clsx(
            'font-medium',
            percentage >= 70 ? 'text-accent-viral' :
            percentage >= 40 ? 'text-dark-200' :
            'text-dark-400'
          )}>
            {Math.round(value)}
          </span>
        )}
      </div>
      <div
        className={clsx(
          'w-full rounded-full bg-dark-800 overflow-hidden',
          size === 'sm' ? 'h-1.5' : 'h-2'
        )}
      >
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-300',
            percentage >= 70 ? 'bg-accent-viral' :
            percentage >= 40 ? 'bg-dark-400' :
            'bg-dark-500'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
