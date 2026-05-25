'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  Article,
  InvariantViolationError,
  requestArticleExtraction,
} from '@/06-entities/article';
import { ExtractArticleRequestSchema } from '@05-features/extract-article/model/schema';
import { AppError } from '@/07-shared/errors';
import { useArticle } from '@/app/providers/article.context';

export function ExtractArticleForm() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const { setSnapshot } = useArticle();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setPending(true);

    const parsed = ExtractArticleRequestSchema.safeParse({ url: url.trim() });
    if (!parsed.success) {
      setError('http(s)로 시작하는 기사 URL을 입력해 주세요.');
      setPending(false);
      return;
    }

    try {
      Article.extract(parsed.data.url);
    } catch (e) {
      if (e instanceof InvariantViolationError) {
        setError(e.message);
        setPending(false);
        return;
      }
      throw e;
    }

    try {
      const article = await requestArticleExtraction(parsed.data.url);
      setSnapshot(article.toSnapshot());
      router.push(`/analysis/${article.id}`);
    } catch (e) {
      if (e instanceof InvariantViolationError) {
        setError(e.message);
      } else if (e instanceof AppError) {
        setError(`분석 요청에 실패했습니다. ${e.message}`);
      } else {
        setError('분석 요청 중 알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <form className="mt-[var(--spacing-24)]" onSubmit={handleSubmit}>
      <label
        className="block text-sm text-[var(--color-text-secondary)]"
        htmlFor="analysis-url"
      >
        분석할 기사 URL
      </label>
      <div className="mt-[var(--spacing-10)] flex min-h-12 items-center rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface-base)] px-[var(--spacing-16)]">
        <input
          aria-describedby={error ? 'analysis-url-error' : undefined}
          aria-invalid={Boolean(error)}
          className="min-w-0 flex-1 bg-transparent text-base text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-secondary)] disabled:cursor-not-allowed"
          disabled={pending}
          id="analysis-url"
          onChange={(e) => {
            setUrl(e.target.value);
            if (error) {
              setError(null);
            }
          }}
          placeholder="https://..."
          type="url"
          value={url}
        />
      </div>
      <button
        className="mt-[var(--spacing-16)] inline-flex h-10 w-full items-center justify-center rounded-full bg-[var(--color-action-hero)] px-[var(--spacing-20)] text-base font-medium text-[var(--color-text-on-brand)] transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-primary)] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? '분석 중' : '분석 시작'}
      </button>
      <p className="mt-[var(--spacing-16)] text-xs leading-5 text-[var(--color-text-secondary)]">
        분석 결과는 참고용이며, 최종 판단을 대체하지 않습니다.
      </p>
      {error && (
        <p
          className="mt-[var(--spacing-10)] text-sm font-semibold text-[var(--color-error)]"
          id="analysis-url-error"
          role="alert"
        >
          {error}
        </p>
      )}
    </form>
  );
}
