import { clsx } from 'clsx';
import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'highlight' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  interactive = false,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-2xl',
        {
          // Variants
          'bg-dark-900 border border-dark-800': variant === 'default',
          'bg-gradient-to-br from-dark-800 to-dark-900 border border-dark-700': variant === 'highlight',
          'bg-dark-900/50 backdrop-blur-lg border border-dark-800/50': variant === 'glass',
          
          // Padding
          'p-0': padding === 'none',
          'p-3': padding === 'sm',
          'p-4': padding === 'md',
          'p-6': padding === 'lg',
          
          // Interactive
          'cursor-pointer transition-all duration-200 hover:border-dark-600 active:scale-[0.99]': interactive,
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx('flex items-center justify-between mb-3', className)}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h3 className={clsx('font-semibold text-white', className)}>
      {children}
    </h3>
  );
}
