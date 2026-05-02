'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ICON_SIZE,
  BarChart3Icon as BarChart3,
  Link2Icon as Link2,
  TriangleAlertIcon as AlertTriangle,
} from '@/07-shared/ui/icons';

/**
 * 05-features — Analysis Form
 * 사용자의 기사 URL 입력을 처리하고 유효성 검사 및 분석 요청을 담당합니다.
 */
export function AnalysisForm() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState(false);
  const router = useRouter();

  const handleAnalyze = () => {
    // 간단한 URL 유효성 검증 (정규식)
    const urlPattern =
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;

    if (!urlPattern.test(url)) {
      setError(true);
      return;
    }

    setError(false);
    // 임시: 동적 [id] 라우트로 이동(실서비스에서는 API 응답의 세션 ID 사용)
    const analysisId = encodeURIComponent(url);
    router.push(`/analysis/${analysisId}`);
  };

  return (
    <div className="max-w-2xl w-full flex flex-col gap-1.5">
      {/* Visual Label for Accessibility */}
      <label
        className="text-on-surface-variant font-pretendard text-xs font-semibold px-1"
        htmlFor="news-url"
      >
        뉴스 URL 분석
      </label>
      <div className="bg-surface-container-highest focus-within:ring-secondary flex flex-col gap-4 rounded-xl p-2 transition-all duration-300 focus-within:ring-2 focus-within:ring-offset-4 md:flex-row shadow-sm hover:shadow-md">
        <div className="flex flex-1 items-center gap-2 px-4">
          <Link2
            className={`text-on-surface-variant ${ICON_SIZE.sm}`}
            aria-hidden="true"
          />
          <input
            id="news-url"
            className="text-on-surface placeholder:text-outline-variant font-pretendard w-full border-none bg-transparent py-4 font-medium focus:ring-0"
            placeholder="분석할 기사 URL을 입력하세요"
            type="text"
            value={url}
            aria-invalid={error}
            aria-describedby={error ? 'news-url-error' : undefined}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError(false);
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
          />
        </div>
        <button
          className="bg-primary text-on-primary hover:bg-primary-container font-pretendard inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-8 font-bold transition-all active:scale-[0.98]"
          type="button"
          onClick={handleAnalyze}
        >
          <BarChart3 className={ICON_SIZE.md} aria-hidden="true" />
          분석하기
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div
          id="news-url-error"
          role="alert"
          className="text-error flex items-center gap-1.5 px-1 text-sm font-medium font-pretendard"
        >
          <AlertTriangle className={ICON_SIZE.sm} aria-hidden="true" />
          올바른 URL 형식이 아닙니다. 다시 확인해주세요.
        </div>
      )}
    </div>
  );
}
