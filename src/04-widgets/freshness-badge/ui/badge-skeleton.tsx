import styles from '@04-widgets/freshness-badge/ui/freshness-badge.module.css';

export function BadgeSkeleton() {
  return (
    <span className={`${styles.badge} ${styles.skeleton}`} aria-hidden="true" />
  );
}
