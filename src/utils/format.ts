// Number and text formatting utilities

export function formatNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toLocaleString();
}

export function formatMoney(amount: number, short = false): string {
  if (short) {
    if (amount >= 1_000_000) {
      return '$' + (amount / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (amount >= 1_000) {
      return '$' + (amount / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
  }
  return '$' + amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function formatWeek(week: number): string {
  const year = Math.floor(week / 52) + 1;
  const weekOfYear = (week % 52) + 1;
  return `Year ${year}, Week ${weekOfYear}`;
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function formatStreams(streams: number): string {
  return formatNumber(streams) + ' streams';
}

export function getTimeAgo(weeks: number): string {
  if (weeks === 0) return 'This week';
  if (weeks === 1) return '1 week ago';
  if (weeks < 52) return `${weeks} weeks ago`;
  
  const years = Math.floor(weeks / 52);
  if (years === 1) return '1 year ago';
  return `${years} years ago`;
}

export function getRelationshipLabel(value: number): string {
  if (value >= 80) return 'Close';
  if (value >= 50) return 'Good';
  if (value >= 20) return 'Neutral';
  if (value >= -20) return 'Cold';
  return 'Hostile';
}

export function getQualityLabel(value: number): string {
  if (value >= 90) return 'Masterpiece';
  if (value >= 80) return 'Excellent';
  if (value >= 70) return 'Great';
  if (value >= 60) return 'Good';
  if (value >= 50) return 'Decent';
  if (value >= 40) return 'Mediocre';
  if (value >= 30) return 'Poor';
  return 'Terrible';
}

export function getQualityColor(value: number): string {
  if (value >= 80) return 'text-accent-gold';
  if (value >= 60) return 'text-accent-viral';
  if (value >= 40) return 'text-dark-300';
  return 'text-red-400';
}

export function getMomentumLabel(value: number): string {
  if (value >= 1.5) return 'Exploding';
  if (value >= 1.2) return 'Rising Fast';
  if (value >= 1.05) return 'Growing';
  if (value >= 0.95) return 'Stable';
  if (value >= 0.8) return 'Declining';
  return 'Fading';
}

export function getMomentumIcon(value: number): string {
  if (value >= 1.2) return '🚀';
  if (value >= 1.05) return '📈';
  if (value >= 0.95) return '➡️';
  if (value >= 0.8) return '📉';
  return '⬇️';
}
