/* @vitest-environment jsdom */
// MSW server lifecycle은 vitest.setup.unit.ts에서 globally 관리.
// vitest config에 globals:true가 없어서 @testing-library/react auto-cleanup 미작동 → afterEach 명시.
import { describe, it, expect, afterEach } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from '@testing-library/react';
import { AttachToSessionButton } from '../ui/attach-to-session-button.component';
import { ArticleProvider } from '@/app/providers/article.context';
import type { ArticleSnapshot } from '@/06-entities/article';

afterEach(cleanup);

const TEST_ARTICLE_ID = '00000000-0000-0000-0000-000000000001';
const TEST_SESSION_ID = 'session_test_1';

const initialSnapshot: ArticleSnapshot = {
  id: TEST_ARTICLE_ID,
  url: 'https://example.com/news/1',
  title: 'Test Article',
  content: 'Test content',
  status: 'ATTACHED',
  sessionId: TEST_SESSION_ID,
  createdAt: '2026-05-02T12:00:00Z',
};

describe('AttachToSessionButton (Phase 21 W3-3, rev.7 A4 reframe)', () => {
  it('renders attach button when snapshot present', () => {
    render(
      <ArticleProvider initialSnapshot={initialSnapshot}>
        <AttachToSessionButton
          articleId={TEST_ARTICLE_ID}
          sessionId={TEST_SESSION_ID}
        />
      </ArticleProvider>
    );
    expect(
      screen.getByRole('button', { name: /세션에 재부착 시도/ })
    ).toBeDefined();
  });

  it('displays guidance when no snapshot in context', () => {
    render(
      <ArticleProvider>
        <AttachToSessionButton
          articleId={TEST_ARTICLE_ID}
          sessionId={TEST_SESSION_ID}
        />
      </ArticleProvider>
    );
    expect(
      screen.getByText(/부착 시연을 위해 새 분석을 먼저 시작해주세요/)
    ).toBeDefined();
  });

  it('shows 409 invariant message after click (BE auto-attach 정책)', async () => {
    render(
      <ArticleProvider initialSnapshot={initialSnapshot}>
        <AttachToSessionButton
          articleId={TEST_ARTICLE_ID}
          sessionId={TEST_SESSION_ID}
        />
      </ArticleProvider>
    );
    const button = screen.getByRole('button', { name: /세션에 재부착 시도/ });
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toContain(
        '이미 분석 세션에 부착되어 있습니다'
      );
    });
  });

  it('disables button while pending', async () => {
    render(
      <ArticleProvider initialSnapshot={initialSnapshot}>
        <AttachToSessionButton
          articleId={TEST_ARTICLE_ID}
          sessionId={TEST_SESSION_ID}
        />
      </ArticleProvider>
    );
    const button = screen.getByRole('button', {
      name: /세션에 재부착 시도/,
    }) as HTMLButtonElement;
    fireEvent.click(button);
    expect(button.disabled).toBe(true);
    await waitFor(() => {
      expect(button.disabled).toBe(false);
    });
  });
});
