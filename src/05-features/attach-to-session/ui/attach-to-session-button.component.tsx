'use client';
import { useState } from 'react';
import { requestAttachToSession } from '@/06-entities/article';
import { useArticle } from '@/app/providers/article.context';
import { AppError } from '@/07-shared/errors';

interface Props {
  articleId: string;
  sessionId: string;
}

/**
 * Phase 21 W3-3 (rev.7 A4 reframe): BE PR #28 + #29 머지 후 real wiring.
 *
 * BE auto-attach 정책 (Article.extract().attachTo(session)) 결과로 article은
 * `POST /analysis-sessions` 시점에 이미 ATTACHED 상태로 저장됨.
 * 따라서 본 button의 attach 호출은 **항상 409 ConflictException 반환**.
 *
 * 학습 가치 (rev.7 A4 reframe LOCK):
 *   1. aggregate lifecycle invariant 시각화 — DDD aggregate가 자기 상태를 보호
 *   2. 409 ConflictException UX 패턴 — apiClient AppError → user-facing 메시지
 *   3. real network call 시연 (msw handler가 실제 BE 응답 shape 모킹)
 *
 * 핵심 차이 (rev.1 client-only PoC vs rev.7 real wiring):
 *   - rev.1: probe Article instance + local snapshot 교체 (no network)
 *   - rev.7: requestAttachToSession() 호출 → catch AppError(409) → user 안내
 */
export function AttachToSessionButton({ articleId, sessionId }: Props) {
  const { snapshot, setSnapshot } = useArticle();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleClick = async () => {
    if (pending) return;
    setError(null);
    setPending(true);

    try {
      const updated = await requestAttachToSession(articleId, sessionId);
      // 정상 흐름 (현재 BE 정책상 도달 불가 — production attach는 항상 409):
      // future Phase 22+에서 auto-attach 정책 분리 시 도달 가능.
      setSnapshot(updated.toSnapshot());
    } catch (e) {
      if (e instanceof AppError && e.statusCode === 409) {
        setError(
          '이 기사는 이미 분석 세션에 부착되어 있습니다. (재부착 invariant 시연)'
        );
      } else if (e instanceof AppError) {
        setError(e.message);
      } else {
        throw e;
      }
    } finally {
      setPending(false);
    }
  };

  // rev.7 A4: button을 항상 표시 (재부착 거부 invariant 학습 시연 의도).
  // snapshot이 없으면 articleId 컨텍스트가 일치하지 않으므로 안내만.
  if (!snapshot) {
    return (
      <p className="text-sm text-[var(--color-text-secondary)]">
        부착 시연을 위해 새 분석을 먼저 시작해주세요.
      </p>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="rounded px-[var(--spacing-16)] py-[var(--spacing-8)] bg-[var(--color-accent-blue)] text-[var(--color-text-on-brand)] disabled:opacity-50"
      >
        {pending ? '부착 시도 중...' : '세션에 재부착 시도 (시연)'}
      </button>
      {error && (
        <p
          role="alert"
          className="mt-[var(--spacing-8)] text-sm text-[var(--color-error)]"
        >
          {error}
        </p>
      )}
    </div>
  );
}
