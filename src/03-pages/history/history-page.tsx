import type { AnalysisSessionListItem } from '@/06-entities/analysis-session';
import {
  BadgeCheckIcon,
  ChevronRightIcon,
  ICON_SIZE,
} from '@/07-shared/ui/icons';

// ADR-019 정합 라벨 — "신뢰도 점수" 표현 회피(신뢰도 직접 등치 금지).
const SCORE_LABEL = '검증 가능 주장 기준 종합 점수';
const EMPTY_SCORE = '검증 가능 주장 없음';

const DATE_FMT = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

function formatDate(iso: string): string {
  return DATE_FMT.format(new Date(iso));
}

function statusLabel(status: string): string {
  switch (status) {
    case 'COMPLETED':
      return '검증 완료';
    case 'FAILED':
      return '분석 실패';
    default:
      return '분석 중';
  }
}

interface HistoryItemProps {
  session: AnalysisSessionListItem;
}

function HistoryItem({ session: s }: HistoryItemProps) {
  const displayDate = formatDate(s.completedAt ?? s.requestedAt);
  const scoreDisplay =
    s.totalScore === null ? EMPTY_SCORE : `${s.totalScore}/100`;
  const canLink = s.status === 'COMPLETED' && s.articleId !== null;

  return (
    <li className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface-raised)] p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--color-brand-subtle)] text-[var(--color-brand-primary)]">
          <BadgeCheckIcon aria-hidden="true" className={ICON_SIZE.md} />
        </div>

        <div className="flex-grow">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="font-pretendard text-[var(--color-text-secondary)] text-xs font-semibold uppercase tracking-wider">
              {statusLabel(s.status)}
            </span>
            <span className="text-[var(--color-text-secondary)] text-xs">
              {displayDate}
            </span>
          </div>
          <p className="font-pretendard text-[var(--color-text-heading)] text-base font-bold">
            {s.articleTitle ?? (s.articleUrl ? s.articleUrl : '기사 제목 없음')}
          </p>
          {s.articleDomain && (
            <p className="font-pretendard text-[var(--color-text-secondary)] mt-0.5 text-xs">
              {s.articleDomain}
            </p>
          )}
        </div>

        <div className="flex items-center gap-6 md:flex-shrink-0">
          <div className="text-right">
            <div className="font-pretendard text-[var(--color-action-hero)] text-xl font-black">
              {scoreDisplay}
            </div>
            <div className="font-pretendard text-[var(--color-text-secondary)] text-xs">
              {SCORE_LABEL}
            </div>
          </div>

          {canLink ? (
            <a
              href={`/analysis/${s.articleId}`}
              aria-label="상세 보기"
              className="text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-heading)]"
            >
              <ChevronRightIcon aria-hidden="true" className={ICON_SIZE.sm} />
            </a>
          ) : (
            <span
              aria-hidden="true"
              className="text-[var(--color-border-subtle)]"
            >
              <ChevronRightIcon className={ICON_SIZE.sm} />
            </span>
          )}
        </div>
      </div>
    </li>
  );
}

interface HistoryPageProps {
  sessions: AnalysisSessionListItem[];
}

export function HistoryPage({ sessions }: HistoryPageProps) {
  return (
    <main className="mx-auto max-w-7xl px-8 py-12">
      <header className="mb-12">
        <h1 className="font-pretendard text-[var(--color-text-heading)] mb-2 text-5xl font-black tracking-tighter">
          분석 이력
        </h1>
        <p className="font-pretendard text-[var(--color-text-secondary)] max-w-2xl text-body-md">
          내가 검증한 기사들의 결과를 모아봅니다.
        </p>
      </header>

      {sessions.length === 0 ? (
        <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface-raised)] p-12 text-center">
          <p className="font-pretendard text-[var(--color-text-secondary)] text-body-md">
            아직 분석 이력이 없습니다. 기사를 분석하면 여기에 표시됩니다.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {sessions.map((s) => (
            <HistoryItem key={s.sessionId} session={s} />
          ))}
        </ul>
      )}
    </main>
  );
}
