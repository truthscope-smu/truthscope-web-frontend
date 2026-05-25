import { ExtractArticleForm } from '@/05-features/extract-article';

const previewRows = [
  ['출처 투명성', '높음'],
  ['추가 확인 필요', '2건'],
  ['SIFT 매핑', '완료'],
] as const;

const steps = [
  ['URL 수신', '기사와 분석 세션 연결'],
  ['주장 분리', '검증 가능 항목과 보류 사유 구분'],
  ['결과 카드', '점수, 출처, SIFT 근거 표시'],
] as const;

const supportCards = [
  {
    title: '주장별로 확인합니다.',
    body: '기사 전체를 한 번에 판단하지 않고, 주요 주장을 나누어 검토합니다.',
    link: '분석 방법 보기',
  },
  {
    title: '근거 출처를 함께 봅니다.',
    body: '점수만 보여주지 않고, 판단에 사용된 출처와 확인 상태를 함께 정리합니다.',
    link: '결과 예시 보기',
  },
  {
    title: '보류 항목도 표시합니다.',
    body: '근거가 부족하거나 시점 확인이 필요한 내용은 추가 확인 항목으로 구분합니다.',
    link: '분석 시작',
  },
] as const;

export default function NewAnalysisPage() {
  return (
    <main className="bg-[var(--color-bg-surface-sunken)] text-[var(--color-text-primary)]">
      <section className="mx-auto max-w-7xl px-[var(--spacing-20)] py-[var(--spacing-20)]">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-b from-[var(--color-bg-base)] via-[var(--color-bg-surface-base)] to-[var(--color-bg-surface-sunken)]">
          <div className="grid gap-[var(--spacing-32)] px-[var(--spacing-24)] py-[var(--spacing-48)] lg:grid-cols-[minmax(0,1fr)_408px] lg:px-[var(--spacing-48)]">
            <section className="text-center">
              <p className="text-sm font-semibold text-[var(--color-text-secondary)]">
                TruthScope
              </p>
              <h1 className="mx-auto mt-[var(--spacing-10)] max-w-4xl text-5xl font-semibold leading-tight text-[var(--color-text-heading)] md:text-7xl">
                뉴스 기사 신뢰도 분석을 시작하세요.
              </h1>
              <p className="mx-auto mt-[var(--spacing-16)] max-w-3xl text-2xl leading-snug text-[var(--color-text-secondary)]">
                기사 URL을 입력하면 주요 주장, 근거 출처, 추가 확인 항목을
                정리합니다.
              </p>
              <div className="mt-[var(--spacing-24)] flex flex-wrap justify-center gap-[var(--spacing-16)]">
                <a
                  className="inline-flex h-10 items-center rounded-full bg-[var(--color-action-hero)] px-[var(--spacing-20)] text-base font-medium text-[var(--color-text-on-brand)] transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-primary)]"
                  href="#analysis-url"
                >
                  분석 시작
                </a>
                <a
                  className="inline-flex h-10 items-center px-[var(--spacing-6)] text-base text-[var(--color-brand-secondary)] hover:text-[var(--color-brand-primary)]"
                  href="#analysis-preview"
                >
                  결과 미리 보기 &gt;
                </a>
              </div>

              <div
                className="relative mx-auto mt-[var(--spacing-48)] min-h-[360px] max-w-3xl"
                id="analysis-preview"
              >
                <div className="absolute left-1/2 top-[var(--spacing-32)] w-[min(92%,650px)] -translate-x-1/2 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] p-[var(--spacing-24)] ambient-shadow">
                  <div className="flex items-start justify-between gap-[var(--spacing-20)] border-b border-[var(--color-border-subtle)] pb-[var(--spacing-16)] text-left">
                    <div className="text-7xl font-semibold leading-none text-[var(--color-text-heading)]">
                      82
                      <span className="text-lg font-normal text-[var(--color-text-secondary)]">
                        /100
                      </span>
                    </div>
                    <div className="rounded-full bg-[var(--color-brand-subtle)] px-[var(--spacing-10)] py-[var(--spacing-6)] text-xs font-medium text-[var(--color-brand-primary)]">
                      검증 가능 주장 기준
                    </div>
                  </div>
                  <div className="mt-[var(--spacing-16)] grid gap-[var(--spacing-10)]">
                    {previewRows.map(([label, value]) => (
                      <div
                        className="grid grid-cols-[1fr_auto] rounded-lg bg-[var(--color-bg-surface-sunken)] px-[var(--spacing-16)] py-[var(--spacing-10)] text-left text-sm"
                        key={label}
                      >
                        <span className="text-[var(--color-text-secondary)]">
                          {label}
                        </span>
                        <strong className="font-semibold text-[var(--color-text-primary)]">
                          {value}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <aside className="grid content-start gap-[var(--spacing-16)]">
              <section className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] p-[var(--spacing-24)]">
                <h2 className="text-3xl font-semibold leading-tight text-[var(--color-text-heading)]">
                  기사 URL을 입력하세요.
                </h2>
                <p className="mt-[var(--spacing-8)] text-base leading-7 text-[var(--color-text-secondary)]">
                  분석 세션을 만들고, 기사 데이터를 결과 화면에 연결합니다.
                </p>
                <ExtractArticleForm />
              </section>

              <section className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] p-[var(--spacing-24)]">
                <h2 className="text-3xl font-semibold leading-tight text-[var(--color-text-heading)]">
                  검증 흐름
                </h2>
                <p className="mt-[var(--spacing-8)] text-base leading-7 text-[var(--color-text-secondary)]">
                  기사 URL을 입력한 뒤 결과 카드가 만들어지기까지의 과정을
                  안내합니다.
                </p>
                <div className="mt-[var(--spacing-20)] overflow-hidden rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface-base)]">
                  {steps.map(([title, body], index) => (
                    <div
                      className="grid grid-cols-[34px_1fr_auto] items-center gap-[var(--spacing-10)] border-b border-[var(--color-border-subtle)] px-[var(--spacing-16)] py-[var(--spacing-16)] last:border-b-0"
                      key={title}
                    >
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-[var(--color-brand-subtle)] text-sm font-semibold text-[var(--color-brand-primary)]">
                        {index + 1}
                      </div>
                      <div>
                        <strong className="block text-base font-semibold text-[var(--color-text-primary)]">
                          {title}
                        </strong>
                        <span className="mt-[var(--spacing-6)] block text-sm text-[var(--color-text-secondary)]">
                          {body}
                        </span>
                      </div>
                      <span className="text-xl text-[var(--color-brand-secondary)]">
                        &rsaquo;
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </aside>
          </div>
        </div>

        <section className="grid gap-[var(--spacing-16)] py-[var(--spacing-16)] lg:grid-cols-3">
          {supportCards.map((card, index) => {
            const bgClass =
              index === 1
                ? 'bg-[var(--color-bg-surface-base)]'
                : index === 2
                  ? 'bg-[var(--color-bg-surface-raised)]'
                  : 'bg-[var(--color-bg-base)]';
            return (
              <article
                className={`min-h-[210px] rounded-2xl border border-[var(--color-border-subtle)] p-[var(--spacing-32)] text-center ${bgClass}`}
                key={card.title}
              >
                <h3 className="text-3xl font-semibold text-[var(--color-text-heading)]">
                  {card.title}
                </h3>
                <p className="mx-auto mt-[var(--spacing-10)] max-w-xs text-base leading-7 text-[var(--color-text-secondary)]">
                  {card.body}
                </p>
                <a
                  className="mt-[var(--spacing-20)] inline-flex h-8 items-center rounded-full px-[var(--spacing-10)] text-sm text-[var(--color-brand-secondary)] transition-colors hover:bg-[var(--color-brand-subtle)] hover:text-[var(--color-brand-primary)]"
                  href={index === 2 ? '#analysis-url' : '#analysis-preview'}
                >
                  {card.link} &gt;
                </a>
              </article>
            );
          })}
        </section>
      </section>
    </main>
  );
}
