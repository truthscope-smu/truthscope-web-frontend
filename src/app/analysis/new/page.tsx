'use client';
import { ExtractArticleForm } from '@/05-features/extract-article';

export default function NewAnalysisPage() {
  return (
    <main className="p-[var(--spacing-24)]">
      <h1 className="text-[var(--color-text-heading)] text-lg font-bold">
        새 분석 시작
      </h1>
      <p className="mt-[var(--spacing-10)] text-[var(--color-text-secondary)]">
        분석할 뉴스 URL을 입력해주세요.
      </p>
      <div className="mt-[var(--spacing-16)]">
        <ExtractArticleForm />
      </div>
    </main>
  );
}
