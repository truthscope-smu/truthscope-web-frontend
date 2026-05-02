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

    // Layer 1: zod request body shape
    const parsed = ExtractArticleRequestSchema.safeParse({ url });
    if (!parsed.success) {
      setError('URL은 http(s)로 시작해야 합니다');
      setPending(false);
      return;
    }

    // Layer 2: rev.1 R1-01 fix — Article.extract(url) single param. validation-only (no return).
    try {
      Article.extract(parsed.data.url);
    } catch (e) {
      if (e instanceof InvariantViolationError) {
        setError(`URL 검증 실패: ${e.message}`);
        setPending(false);
        return;
      }
      throw e;
    }

    // Layer 3: external boundary (apiClient + AppError)
    // rev.1 CX1-01: requestArticleExtraction이 AnalysisResponse를 받아 fromAnalysisSession으로 Article 합성.
    // rev.2 R2-01/CX2-03 fix: setSnapshot 후 router.push로 분석 결과 페이지 navigate 의무.
    // rev.2 CX2-01 fix: SessionStatus → ArticleStatus 매핑 실패 시 InvariantViolationError catch.
    try {
      const article = await requestArticleExtraction(parsed.data.url);
      setSnapshot(article.toSnapshot()); // synthesized Article → Provider state
      router.push(`/analysis/${article.id}`); // sibling layout 안에 있어서 Provider state 보존
    } catch (e) {
      if (e instanceof InvariantViolationError) {
        // sessionStatus 매핑 실패 (PENDING/EXTRACTING/ANALYZING/FAILED 등)
        setError(e.message);
      } else if (e instanceof AppError) {
        setError(`서버 요청 실패: ${e.message}`);
      } else {
        setError('알 수 없는 오류');
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://..."
        disabled={pending}
        aria-label="기사 URL"
      />
      <button type="submit" disabled={pending}>
        {pending ? '분석 중...' : '분석'}
      </button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
