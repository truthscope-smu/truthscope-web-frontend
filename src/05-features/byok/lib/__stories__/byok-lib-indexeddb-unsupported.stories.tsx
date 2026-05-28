'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React, { useEffect, useState } from 'react';
import {
  isAvailable,
  IndexedDBNotSupportedError,
} from '@/05-features/byok/lib';

// ──────────────────────────────────────────────────────────────────────────────
// Storybook 시나리오 3: IndexedDB unsupported
// globalThis.indexedDB를 undefined로 mock하여 IndexedDBNotSupportedError UI 표시
// Safari Private 모드, 구형 브라우저 미지원 분기 검증
// ──────────────────────────────────────────────────────────────────────────────

type CheckStatus = 'idle' | 'checking' | 'available' | 'unavailable' | 'error';

// IndexedDB 미지원 시나리오를 보여주는 mock 컴포넌트
function IndexedDBUnsupportedForm() {
  const [status, setStatus] = useState<CheckStatus>('idle');
  const [message, setMessage] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);

  // 컴포넌트 마운트 시 실제 IndexedDB 가용성 확인
  useEffect(() => {
    void (async () => {
      setStatus('checking');
      const available = await isAvailable();
      if (available) {
        setStatus('available');
        setMessage('현재 환경: IndexedDB 사용 가능');
      } else {
        setStatus('unavailable');
        setMessage('현재 환경: IndexedDB 미지원 (IndexedDBNotSupportedError)');
      }
    })();
  }, []);

  const handleSimulateUnsupported = async () => {
    setIsSimulating(true);
    setStatus('checking');
    setMessage('');

    // globalThis.indexedDB를 undefined로 임시 mock
    const originalIndexedDB = globalThis.indexedDB;
    // @ts-expect-error: IndexedDB 미지원 환경 시뮬레이션용
    globalThis.indexedDB = undefined;

    try {
      // isAvailable은 false를 반환하고, 실제 storage 함수들은 IndexedDBNotSupportedError를 throw
      const available = await isAvailable();

      if (!available) {
        // IndexedDBNotSupportedError를 직접 throw하여 UI에 표시
        throw new IndexedDBNotSupportedError(
          'IndexedDB is not available in this environment (Safari Private 또는 미지원 브라우저)'
        );
      }

      setStatus('available');
      setMessage('IndexedDB 사용 가능');
    } catch (e) {
      if (e instanceof IndexedDBNotSupportedError) {
        setStatus('unavailable');
        setMessage(`IndexedDBNotSupportedError: ${e.message}`);
      } else {
        setStatus('error');
        setMessage(
          `예상치 못한 오류: ${e instanceof Error ? e.message : String(e)}`
        );
      }
    } finally {
      // globalThis.indexedDB 복원
      globalThis.indexedDB = originalIndexedDB;
      setIsSimulating(false);
    }
  };

  const statusColor = {
    idle: 'var(--color-text-secondary)',
    checking: 'var(--color-brand-secondary)',
    available: 'var(--color-success-strong)',
    unavailable: 'var(--color-error)',
    error: 'var(--color-error)',
  }[status];

  return (
    <div
      style={{
        fontFamily: 'Pretendard, sans-serif',
        maxWidth: 480,
        padding: 'var(--spacing-24)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 8,
      }}
    >
      <h2 style={{ marginTop: 0, color: 'var(--color-brand-primary)' }}>
        BYOK Lib — IndexedDB Unsupported
      </h2>
      <p
        style={{
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--font-body-sm-size)',
        }}
      >
        IndexedDB가 미지원되는 환경(Safari Private 모드, 구형 브라우저)에서의
        에러 상태 표시.
        <br />
        isAvailable() 반환 false → <strong>
          IndexedDBNotSupportedError
        </strong>{' '}
        표시.
        <br />
        AI 분석이며 기관 검증이 아닙니다. 참고 용도로만 활용하세요.
      </p>

      <div
        style={{
          padding: 'var(--spacing-10)',
          borderRadius: 'var(--spacing-6)',
          background: 'var(--color-bg-surface-sunken)',
          marginBottom: 'var(--spacing-16)',
          fontSize: 'var(--font-body-sm-size)',
        }}
      >
        <strong>현재 환경 상태:</strong>{' '}
        <span style={{ color: statusColor }}>
          {status === 'idle'
            ? '확인 중...'
            : status === 'checking'
              ? '확인 중...'
              : message}
        </span>
      </div>

      <div
        style={{
          padding: 'var(--spacing-10)',
          borderRadius: 'var(--spacing-6)',
          /* amber-50: 디자인 토큰 미정의, Phase 23+ 토큰화 후보 */
          background: '#fff8e1',
          marginBottom: 'var(--spacing-16)',
          fontSize: 'var(--font-body-sm-size)',
          /* orange-800: 디자인 토큰 미정의, Phase 23+ 토큰화 후보 */
          color: '#e65100',
        }}
      >
        ⚠️ 시뮬레이션: 버튼 클릭 시 globalThis.indexedDB를 undefined로 임시
        설정하여 미지원 환경을 재현합니다.
      </div>

      <button
        type="button"
        onClick={() => void handleSimulateUnsupported()}
        disabled={isSimulating || status === 'checking'}
        style={{
          padding: 'var(--spacing-8) var(--spacing-16)',
          background: isSimulating
            ? 'var(--color-text-secondary)'
            : 'var(--color-error)',
          color: 'var(--color-text-on-error)',
          border: 'none',
          borderRadius: 'var(--spacing-6)',
          cursor:
            isSimulating || status === 'checking' ? 'not-allowed' : 'pointer',
        }}
      >
        {isSimulating ? '시뮬레이션 중...' : 'IndexedDB 미지원 시뮬레이션'}
      </button>

      {status === 'unavailable' && (
        <div
          className="error-message"
          style={{
            marginTop: 'var(--spacing-16)',
            padding: 'var(--spacing-10)',
            borderRadius: 'var(--spacing-6)',
            background: 'var(--color-error-subtle)',
            color: 'var(--color-error)',
            fontSize: 'var(--font-body-sm-size)',
            fontFamily: 'monospace',
          }}
        >
          {message}
        </div>
      )}

      {status === 'available' && !isSimulating && (
        <div
          style={{
            marginTop: 'var(--spacing-16)',
            padding: 'var(--spacing-10)',
            borderRadius: 'var(--spacing-6)',
            background: 'var(--color-success-subtle)',
            color: 'var(--color-success-strong)',
            fontSize: 'var(--font-body-sm-size)',
          }}
        >
          {message}
        </div>
      )}

      <div
        style={{
          marginTop: 'var(--spacing-16)',
          padding: 'var(--spacing-10)',
          borderRadius: 'var(--spacing-6)',
          /* indigo-50: 디자인 토큰 미정의, Phase 23+ 토큰화 후보 */
          background: '#e8eaf6',
          fontSize: 'var(--font-label-size)',
          /* indigo-600: 디자인 토큰 미정의, Phase 23+ 토큰화 후보 */
          color: '#3949ab',
        }}
      >
        <strong>R5 (Safari ITP):</strong> navigator.storage.persist() 호출로 7일
        자동 삭제 방어. requestPersistentStorage() → boolean 반환 (Precondition
        6).
      </div>
    </div>
  );
}

const meta = {
  title: 'BYOK Lib/IndexedDB Unsupported',
  component: IndexedDBUnsupportedForm,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        story:
          'BYOK lib Scenario 3 — IndexedDB 미지원 환경(Safari Private, 구형 브라우저) 에러 표시. ' +
          'globalThis.indexedDB = undefined mock으로 IndexedDBNotSupportedError 분기 검증.',
      },
    },
  },
} satisfies Meta<typeof IndexedDBUnsupportedForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
