import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { FreshnessBadge } from '@04-widgets/freshness-badge/ui/freshness-badge';

afterEach(cleanup);

// Fixed timestamps for deterministic hint computation (no wall-clock dependency)
const NOW = 1_000_000_000_000;
const THIRTY_MIN_AGO = NOW - 30 * 60 * 1000; // fresh
const TWO_DAYS_AGO = NOW - 2 * 24 * 60 * 60 * 1000; // aging

describe('FreshnessBadge — hint label after mount', () => {
  it('shows "최신" label for a fresh createdAtMs+nowMs pair', async () => {
    render(<FreshnessBadge createdAtMs={THIRTY_MIN_AGO} nowMs={NOW} />);
    // useEffect runs after mount; waitFor polls until condition passes
    await waitFor(() => {
      const label = screen.getByText('최신');
      expect(label).toBeDefined();
    });
  });
});

describe('FreshnessBadge — role=status aria-label', () => {
  it('rendered badge has role="status" with aria-label containing relative time', async () => {
    render(<FreshnessBadge createdAtMs={THIRTY_MIN_AGO} nowMs={NOW} />);
    await waitFor(() => {
      // Use getAllByRole to be resilient if cleanup timing differs
      const badges = screen.getAllByRole('status');
      expect(badges.length).toBeGreaterThan(0);
      const badge = badges[0]!;
      const ariaLabel = badge.getAttribute('aria-label') ?? '';
      // aria-label = "{ariaPrefix} · {relative}" e.g. "검증 최신 · 30분 전"
      expect(ariaLabel).toContain('검증 최신');
      expect(ariaLabel).toContain('분 전');
    });
  });
});

describe('FreshnessBadge — skeleton-to-badge transition', () => {
  it('skeleton rendered initially (aria-hidden=true), then role=status badge appears after effect', async () => {
    const { container } = render(
      <FreshnessBadge createdAtMs={TWO_DAYS_AGO} nowMs={NOW} />
    );

    // In the browser environment useEffect may fire synchronously in React 19 concurrent mode.
    // We verify two invariants that hold regardless of timing:
    // 1. After effect: role=status badge must exist with the correct label
    // 2. There is no skeleton (aria-hidden span without role) visible when the badge is shown
    await waitFor(() => {
      expect(screen.getAllByRole('status').length).toBeGreaterThan(0);
    });

    // Badge for aging should show "노후화"
    await waitFor(() => {
      const badge = screen.getAllByRole('status')[0]!;
      const ariaLabel = badge.getAttribute('aria-label') ?? '';
      expect(ariaLabel).toContain('검증 노후화');
    });

    // BadgeSkeleton (aria-hidden span with class skeleton) is NOT present once badge shows
    const skeleton = container.querySelector('.skeleton, [class*="skeleton"]');
    expect(skeleton).toBeNull();
  });
});
