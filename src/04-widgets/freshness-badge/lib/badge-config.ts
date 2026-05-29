import type { StalenessHint } from '@04-widgets/freshness-badge/model/types';

export interface BadgeVisual {
  label: string;
  icon: string;
  className: string;
  ariaPrefix: string;
}

export const BADGE_CONFIG: Record<StalenessHint, BadgeVisual> = {
  fresh: {
    label: '최신',
    icon: '✓',
    className: 'badge-fresh',
    ariaPrefix: '검증 최신',
  },
  stable: {
    label: '안정',
    icon: '◐',
    className: 'badge-stable',
    ariaPrefix: '검증 안정',
  },
  aging: {
    label: '노후화',
    icon: '◑',
    className: 'badge-aging',
    ariaPrefix: '검증 노후화',
  },
  stale: {
    label: '노후',
    icon: '◓',
    className: 'badge-stale',
    ariaPrefix: '검증 노후',
  },
  expired: {
    label: '만료',
    icon: '⚠',
    className: 'badge-expired',
    ariaPrefix: '검증 만료',
  },
};
