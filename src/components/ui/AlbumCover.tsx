import { useMemo } from 'react';
import { clsx } from 'clsx';

interface AlbumCoverProps {
  seed: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

// Generate procedural album cover using gradients and patterns
export function AlbumCover({ seed, size = 'md', className }: AlbumCoverProps) {
  const { gradient, pattern, overlay } = useMemo(() => generateCoverStyle(seed), [seed]);
  
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  };
  
  return (
    <div
      className={clsx(
        'rounded-lg overflow-hidden relative flex-shrink-0',
        sizeClasses[size],
        className
      )}
      style={{ background: gradient }}
    >
      {/* Pattern overlay */}
      <div
        className="absolute inset-0 opacity-30"
        style={{ background: pattern }}
      />
      {/* Dark overlay for depth */}
      <div
        className="absolute inset-0"
        style={{ background: overlay }}
      />
    </div>
  );
}

function generateCoverStyle(seed: string) {
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash;
  }
  
  // Generate colors based on hash
  const hue1 = Math.abs(hash % 360);
  const hue2 = (hue1 + 40 + (hash % 80)) % 360;
  
  const sat1 = 60 + (hash % 30);
  const sat2 = 50 + (hash % 40);
  
  const light1 = 35 + (hash % 25);
  const light2 = 25 + (hash % 30);
  
  // Gradient styles
  const gradientTypes = [
    `linear-gradient(135deg, hsl(${hue1}, ${sat1}%, ${light1}%), hsl(${hue2}, ${sat2}%, ${light2}%))`,
    `linear-gradient(180deg, hsl(${hue1}, ${sat1}%, ${light1}%), hsl(${hue2}, ${sat2}%, ${light2}%))`,
    `radial-gradient(circle at 30% 30%, hsl(${hue1}, ${sat1}%, ${light1}%), hsl(${hue2}, ${sat2}%, ${light2}%))`,
    `conic-gradient(from 45deg, hsl(${hue1}, ${sat1}%, ${light1}%), hsl(${hue2}, ${sat2}%, ${light2}%), hsl(${hue1}, ${sat1}%, ${light1}%))`,
  ];
  
  const gradient = gradientTypes[Math.abs(hash) % gradientTypes.length];
  
  // Pattern overlay
  const patternTypes = [
    `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)`,
    `repeating-radial-gradient(circle at 50% 50%, transparent, transparent 5px, rgba(0,0,0,0.1) 5px, rgba(0,0,0,0.1) 10px)`,
    `linear-gradient(90deg, transparent 50%, rgba(255,255,255,0.03) 50%)`,
    'none',
  ];
  
  const pattern = patternTypes[Math.abs(hash >> 4) % patternTypes.length];
  
  // Overlay for depth
  const overlay = `linear-gradient(135deg, transparent 30%, rgba(0,0,0,0.3) 100%)`;
  
  return { gradient, pattern, overlay };
}

// Placeholder cover for songs without art
export function PlaceholderCover({ size = 'md', className }: Omit<AlbumCoverProps, 'seed'>) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  };
  
  return (
    <div
      className={clsx(
        'rounded-lg bg-dark-800 flex items-center justify-center flex-shrink-0',
        sizeClasses[size],
        className
      )}
    >
      <svg className="w-1/2 h-1/2 text-dark-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
      </svg>
    </div>
  );
}
