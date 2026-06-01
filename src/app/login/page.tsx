import { SocialLoginButtons } from '@/05-features/auth';
import { toSafeRedirectPath } from '@/07-shared/lib';

interface LoginPageProps {
  searchParams: Promise<{ next?: string; error?: string }>;
}

const ERROR_MESSAGES: Record<string, string> = {
  auth_failed: '인증에 실패했습니다. 다시 시도해주세요.',
  oauth_cancelled: '로그인이 취소되었습니다.',
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next, error } = await searchParams;
  const safePath = toSafeRedirectPath(next);

  return (
    <main className="flex min-h-[calc(100vh-52px)] items-center justify-center px-[var(--spacing-16)]">
      <div className="w-full max-w-sm rounded-[20px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] p-[var(--spacing-32)]">
        <h1 className="mb-[var(--spacing-8)] font-pretendard text-2xl font-bold text-[var(--color-text-heading)]">
          로그인
        </h1>
        <p className="mb-[var(--spacing-24)] font-pretendard text-sm text-[var(--color-text-secondary)]">
          소셜 계정으로 간편하게 시작하세요.
        </p>

        {error ? (
          <p
            role="alert"
            className="mb-[var(--spacing-16)] rounded-lg px-[var(--spacing-16)] py-[var(--spacing-10)] font-pretendard text-sm text-[var(--color-error)]"
          >
            {ERROR_MESSAGES[error] ?? '오류가 발생했습니다.'}
          </p>
        ) : null}

        <SocialLoginButtons nextPath={safePath} />
      </div>
    </main>
  );
}
