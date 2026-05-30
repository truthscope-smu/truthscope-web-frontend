import type { StalenessHint } from '@04-widgets/freshness-badge/model/types';

export interface BadgeVisual {
  label: string;
  className: string;
  ariaPrefix: string;
}

export const BADGE_CONFIG: Record<StalenessHint, BadgeVisual> = {
  fresh: {
    label: '최신',
    className: 'badge-fresh',
    ariaPrefix: '검증 최신',
  },
  stable: {
    label: '양호',
    className: 'badge-stable',
    ariaPrefix: '검증 양호',
  },
  aging: {
    label: '재확인 권장',
    className: 'badge-aging',
    ariaPrefix: '검증 재확인 권장',
  },
  stale: {
    label: '오래됨',
    className: 'badge-stale',
    ariaPrefix: '검증 오래됨',
  },
  expired: {
    label: '기한 지남',
    className: 'badge-expired',
    ariaPrefix: '검증 기한 지남',
  },
};
