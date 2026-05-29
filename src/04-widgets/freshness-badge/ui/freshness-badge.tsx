'use client';

import { useEffect, useState } from 'react';
import type {
  FreshnessBadgeProps,
  StalenessHint,
} from '@04-widgets/freshness-badge/model/types';
import { computeStalenessHint } from '@04-widgets/freshness-badge/lib/compute-staleness-hint';
import { formatRelativeTime } from '@04-widgets/freshness-badge/lib/format-relative-time';
import { BADGE_CONFIG } from '@04-widgets/freshness-badge/lib/badge-config';
import { BadgeSkeleton } from '@04-widgets/freshness-badge/ui/badge-skeleton';
import styles from '@04-widgets/freshness-badge/ui/freshness-badge.module.css';

export function FreshnessBadge({ createdAtMs, nowMs }: FreshnessBadgeProps) {
  const [hint, setHint] = useState<StalenessHint | null>(null);
  const [relative, setRelative] = useState<string>('');

  useEffect(() => {
    setHint(computeStalenessHint(createdAtMs, nowMs));
    setRelative(formatRelativeTime(createdAtMs, nowMs));
  }, [createdAtMs, nowMs]);

  if (hint === null) return <BadgeSkeleton />;

  const v = BADGE_CONFIG[hint];
  return (
    <span
      role="status"
      aria-label={`${v.ariaPrefix} · ${relative}`}
      className={`${styles.badge} ${styles[v.className]}`}
    >
      <span aria-hidden="true" className={styles.icon}>
        {v.icon}
      </span>
      <span className={styles.label}>{v.label}</span>
      <span aria-hidden="true" className={styles.dot}>
        ·
      </span>
      <span className={styles.relative}>{relative}</span>
    </span>
  );
}
