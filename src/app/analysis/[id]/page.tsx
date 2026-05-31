import { notFound } from 'next/navigation';
import Link from 'next/link';
import { findArticleVerification } from '@/06-entities/article'; // A1: 루트 배럴
import { ResultCard, buildResultCardSnapshot } from '@/04-widgets/result-card';
import { PollIsland } from './poll-island';

interface Props {
  params: Promise<{ id: string }>; // Next 15 params는 Promise
}

export default async function AnalysisDetailPage({ params }: Props) {
  const { id } = await params;

  // 네트워크 실패는 throw → error.tsx 처리
  const dto = await findArticleVerification(id);

  // 404: 미존재/미검증 → not-found.tsx
  if (!dto) notFound();

  const isPending =
    dto.status === 'PENDING' ||
    dto.status === 'EXTRACTING' ||
    dto.status === 'ANALYZING';

  // A2: FAILED 분기 — 빈 ResultCard silent 렌더 방지
  if (dto.status === 'FAILED') {
    return (
      <main className="mx-auto max-w-4xl px-[var(--spacing-24)] py-[var(--spacing-32)]">
        <h1 className="text-2xl font-semibold text-[var(--color-text-heading)]">
          분석 결과
        </h1>
        <p
          className="mt-[var(--spacing-16)] text-[var(--color-error)]"
          role="alert"
        >
          분석에 실패했습니다. URL을 다시 확인해주세요.
        </p>
        <Link
          className="mt-[var(--spacing-16)] inline-flex h-9 items-center rounded-full border border-[var(--color-border-subtle)] px-[var(--spacing-16)] text-sm text-[var(--color-brand-secondary)] hover:bg-[var(--color-brand-subtle)] hover:text-[var(--color-brand-primary)]"
          href="/analysis/new"
        >
          새 분석 시작
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-[var(--spacing-24)] py-[var(--spacing-32)]">
      <header className="mb-[var(--spacing-24)] flex items-start justify-between gap-[var(--spacing-16)]">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text-heading)]">
            분석 결과
          </h1>
          {dto.title && (
            <p className="mt-[var(--spacing-8)] text-sm text-[var(--color-text-secondary)]">
              {dto.title}
            </p>
          )}
        </div>
      </header>
      {isPending ? (
        <PollIsland articleId={id} />
      ) : (
        <ResultCard snapshot={buildResultCardSnapshot(dto)} />
      )}
    </main>
  );
}
