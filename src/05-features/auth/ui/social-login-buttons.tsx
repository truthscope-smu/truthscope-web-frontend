'use client';

import { useState } from 'react';
import { signInWithSocialProvider } from '@/05-features/auth/model/social-auth';
import type { SocialProvider } from '@/05-features/auth/model/social-auth';

interface SocialLoginButtonsProps {
  /** 로그인 완료 후 복귀 내부 경로 (기본 '/') */
  nextPath?: string;
}

/**
 * Google·Kakao 소셜 로그인 버튼함
 */
export function SocialLoginButtons({
  nextPath = '/',
}: SocialLoginButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  async function handleSocialLogin(provider: SocialProvider) {
    setLoadingProvider(provider);
    setError(null);
    try {
      const err = await signInWithSocialProvider(provider, nextPath);
      if (err) {
        // signInWithOAuth가 에러 문자열 반환 — 버튼 복구 + 메시지 표시함
        setError(err);
        setLoadingProvider(null);
      }
      // 정상 시 provider redirect 발생 — loading 유지(페이지 이탈)
    } catch {
      // 예외(네트워크 등) 시에도 버튼 잠금 해제 + 메시지 표시함
      setError('로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
      setLoadingProvider(null);
    }
  }

  return (
    <div
      className="flex flex-col gap-[var(--spacing-10)]"
      role="group"
      aria-label="소셜 계정으로 로그인"
    >
      {error ? (
        <p
          role="alert"
          className="font-pretendard text-sm text-[var(--color-error)]"
        >
          {error}
        </p>
      ) : null}

      {/* Google — 브랜드 SVG 4색 + 흰 배경 예외 */}
      <button
        type="button"
        disabled={loadingProvider !== null}
        onClick={() => handleSocialLogin('google')}
        aria-label="Google 계정으로 로그인"
        className="flex w-full items-center justify-center gap-[var(--spacing-10)] rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] px-[var(--spacing-20)] py-[var(--spacing-10)] font-pretendard text-sm font-medium text-[var(--color-text-primary)] transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        {loadingProvider === 'google' ? '연결 중...' : 'Google로 계속하기'}
      </button>

      {/* Kakao — #FEE500 브랜드 자산 예외 */}
      <button
        type="button"
        disabled={loadingProvider !== null}
        onClick={() => handleSocialLogin('kakao')}
        aria-label="카카오 계정으로 로그인"
        className="flex w-full items-center justify-center gap-[var(--spacing-10)] rounded-full px-[var(--spacing-20)] py-[var(--spacing-10)] font-pretendard text-sm font-medium transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        style={{ backgroundColor: '#FEE500', color: '#391B1B' }}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            fill="#391B1B"
            d="M12 3c-5.523 0-10 3.535-10 7.898 0 2.816 1.83 5.282 4.606 6.702-.158.547-.532 1.944-.556 2.062-.03.14.048.14.12.106.096-.046 2.37-1.572 3.33-2.28.792.215 1.63.333 2.5.333 5.523 0 10-3.535 10-7.898C22 6.535 17.523 3 12 3z"
          />
        </svg>
        {loadingProvider === 'kakao' ? '연결 중...' : '카카오로 계속하기'}
      </button>
    </div>
  );
}
