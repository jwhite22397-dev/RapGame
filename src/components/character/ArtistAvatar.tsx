import { clsx } from 'clsx';
import type { Appearance } from '@/game/models/types';
import { defaultAppearance } from '@/game/data/lifestyle';

const SKIN: Record<Appearance['skinTone'], string> = {
  deep: '#3b2416',
  brown: '#6b3f24',
  tan: '#c68642',
  olive: '#8d5b32',
  fair: '#e0ac69',
};

const HAIR: Record<Appearance['hairColor'], string> = {
  black: '#16110d',
  brown: '#4a2c14',
  blonde: '#d4b06a',
  red: '#8b3a1a',
  silver: '#c5c5c8',
};

const OUTFIT: Record<Appearance['outfit'], { shirt: string; accent: string }> = {
  street: { shirt: '#1f2937', accent: '#ef4444' },
  studio: { shirt: '#111827', accent: '#6b7280' },
  stage: { shirt: '#0f0f0f', accent: '#a855f7' },
  luxury: { shirt: '#1e1b4b', accent: '#f59e0b' },
};

interface ArtistAvatarProps {
  appearance?: Appearance;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  mood?: 'neutral' | 'stage' | 'date';
}

const SIZES = {
  sm: 'w-10 h-10',
  md: 'w-16 h-16',
  lg: 'w-28 h-28',
  xl: 'w-44 h-44',
};

export function ArtistAvatar({
  appearance,
  size = 'md',
  className,
  mood = 'neutral',
}: ArtistAvatarProps) {
  const look = appearance ?? defaultAppearance();
  const skin = SKIN[look.skinTone];
  const hair = HAIR[look.hairColor];
  const clothes = OUTFIT[look.outfit];
  const spotlight = mood === 'stage';
  const glowId = `glow-${look.skinTone}-${look.hairStyle}-${look.jewelry}-${size}-${mood}`;

  return (
    <div
      className={clsx(
        'relative overflow-hidden rounded-2xl bg-gradient-to-b from-dark-700 to-dark-900',
        SIZES[size],
        className
      )}
      aria-hidden
    >
      <svg viewBox="0 0 160 160" className="h-full w-full">
        <defs>
          <radialGradient id={glowId} cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor={spotlight ? '#c084fc' : '#334155'} stopOpacity="0.55" />
            <stop offset="100%" stopColor="#0f0f0f" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="160" height="160" fill={`url(#${glowId})`} />

        {/* shoulders */}
        <path d="M18 160 C28 112 50 98 80 98 C110 98 132 112 142 160 Z" fill={clothes.shirt} />
        <path d="M18 160 C28 112 50 98 80 98 C90 98 98 99 106 102 L100 160 Z" fill={clothes.accent} opacity="0.35" />

        {/* neck */}
        <rect x="70" y="86" width="20" height="18" rx="6" fill={skin} />

        {/* head */}
        <ellipse cx="80" cy="62" rx="28" ry="32" fill={skin} />

        {renderHair(look.hairStyle, hair)}

        {/* ears */}
        <ellipse cx="50" cy="66" rx="5" ry="7" fill={skin} />
        <ellipse cx="110" cy="66" rx="5" ry="7" fill={skin} />

        {/* face */}
        <ellipse cx="70" cy="64" rx="3.2" ry="3.6" fill="#111" />
        <ellipse cx="90" cy="64" rx="3.2" ry="3.6" fill="#111" />
        <path d="M76 76 Q80 80 84 76" fill="none" stroke="#2a1a12" strokeWidth="1.6" strokeLinecap="round" />

        {look.glasses && (
          <g fill="none" stroke="#e5e7eb" strokeWidth="2">
            <rect x="60" y="58" width="16" height="12" rx="3" />
            <rect x="84" y="58" width="16" height="12" rx="3" />
            <path d="M76 64 H84" />
          </g>
        )}

        {renderJewelry(look.jewelry)}
      </svg>
    </div>
  );
}

function renderHair(style: Appearance['hairStyle'], color: string) {
  switch (style) {
    case 'curls':
      return (
        <g fill={color}>
          <circle cx="58" cy="34" r="10" />
          <circle cx="72" cy="28" r="11" />
          <circle cx="88" cy="28" r="11" />
          <circle cx="102" cy="34" r="10" />
          <circle cx="64" cy="42" r="8" />
          <circle cx="96" cy="42" r="8" />
        </g>
      );
    case 'braids':
      return (
        <g fill={color}>
          <path d="M52 48 Q50 22 80 20 Q110 22 108 48 Q100 30 80 28 Q60 30 52 48" />
          <rect x="56" y="48" width="5" height="36" rx="2" />
          <rect x="66" y="50" width="5" height="40" rx="2" />
          <rect x="89" y="50" width="5" height="40" rx="2" />
          <rect x="99" y="48" width="5" height="36" rx="2" />
        </g>
      );
    case 'locs':
      return (
        <g fill={color}>
          <path d="M50 50 Q48 18 80 18 Q112 18 110 50 L104 42 Q80 24 56 42 Z" />
          {[54, 62, 70, 86, 94, 102].map((x) => (
            <rect key={x} x={x} y="42" width="5" height="44" rx="2.5" />
          ))}
        </g>
      );
    case 'long':
      return (
        <g fill={color}>
          <path d="M48 70 Q46 20 80 18 Q114 20 112 70 L108 118 Q80 100 52 118 Z" />
        </g>
      );
    case 'short':
      return <path d="M52 58 Q50 26 80 24 Q110 26 108 58 Q96 36 80 34 Q64 36 52 58" fill={color} />;
    default:
      return (
        <g fill={color}>
          <path d="M51 60 Q48 28 80 22 Q112 28 109 60 Q98 38 80 36 Q62 38 51 60" />
          <path d="M50 62 L48 78 L54 64 Z" />
        </g>
      );
  }
}

function renderJewelry(jewelry: Appearance['jewelry']) {
  if (jewelry === 'none') return null;

  if (jewelry === 'chain') {
    return (
      <g fill="none" stroke="#f5d76e" strokeWidth="3">
        <ellipse cx="80" cy="108" rx="16" ry="10" />
        <circle cx="80" cy="118" r="2.4" fill="#f5d76e" stroke="none" />
      </g>
    );
  }

  if (jewelry === 'iced') {
    return (
      <g>
        <ellipse cx="80" cy="107" rx="17" ry="10" fill="none" stroke="#f8fafc" strokeWidth="3.4" />
        <ellipse cx="80" cy="112" rx="14" ry="8" fill="none" stroke="#fbbf24" strokeWidth="2" />
        <circle cx="80" cy="120" r="3" fill="#e5e7eb" />
      </g>
    );
  }

  return (
    <g>
      <ellipse cx="80" cy="106" rx="18" ry="11" fill="none" stroke="#f8fafc" strokeWidth="4" />
      <ellipse cx="80" cy="111" rx="15" ry="8" fill="none" stroke="#38bdf8" strokeWidth="2" />
      <circle cx="80" cy="120" r="3.4" fill="#fde68a" />
      <circle cx="68" cy="108" r="1.4" fill="#fff" />
      <circle cx="93" cy="109" r="1.4" fill="#fff" />
    </g>
  );
}
