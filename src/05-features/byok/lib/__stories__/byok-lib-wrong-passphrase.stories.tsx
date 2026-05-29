'use client';

import 'fake-indexeddb/auto';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React, { useEffect, useState } from 'react';
import {
  saveKey,
  unwrapKey,
  KeyAlreadyExistsError,
  PassphraseIncorrectError,
} from '@/05-features/byok/lib';

// ──────────────────────────────────────────────────────────────────────────────
// Storybook 시나리오 2: Wrong passphrase
// 사전 저장된 record에 잘못된 passphrase로 unwrapKey 시 PassphraseIncorrectError UI 표시
// ──────────────────────────────────────────────────────────────────────────────

// 사전 seed record (이 story 로드 시 자동 저장)
const SEED_USER_ID = 'storybook-wrong-pass-user';
const SEED_KEY_NAME = 'wrong-pass-test-key';
const SEED_CORRECT_PASSPHRASE = 'correct-passphrase-456';
const SEED_API_KEY = 'AIzaSyWrongPassTestKey1234567890123456';

type Status = 'idle' | 'loading' | 'error' | 'success' | 'seeded';

function WrongPassphraseForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [wrongPassphrase, setWrongPassphrase] = useState('');

  // story 마운트 시 seed record 저장
  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        await saveKey({
          userId: SEED_USER_ID,
          provider: 'google-ai',
          providerId: 'generativelanguage.googleapis.com',
          keyName: SEED_KEY_NAME,
          plaintextKey: new TextEncoder().encode(
            SEED_API_KEY
          ) as Uint8Array<ArrayBuffer>,
          passphrase: SEED_CORRECT_PASSPHRASE,
        });
        if (mounted) {
          setStatus('seeded');
          setMessage(
            'seed record 저장 완료 — 잘못된 passphrase로 복호화를 시도하세요'
          );
        }
      } catch (e) {
        if (e instanceof KeyAlreadyExistsError) {
          // 이미 존재하는 경우(story 재로드) 정상 — seeded 상태로 전환
          if (mounted) {
            setStatus('seeded');
            setMessage(
              'seed record 이미 존재 — 잘못된 passphrase로 복호화를 시도하세요'
            );
          }
        } else {
          // 예상치 못한 저장 실패 — error 상태로 분기
          if (mounted) {
            setStatus('error');
            setMessage(
              `seed 저장 실패: ${e instanceof Error ? e.message : String(e)}`
            );
          }
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleTryUnlock = async () => {
    setStatus('loading');
    setMessage('');
    try {
      await unwrapKey({
        userId: SEED_USER_ID,
        provider: 'google-ai',
        keyName: SEED_KEY_NAME,
        passphrase: wrongPassphrase,
      });
      setStatus('success');
      setMessage('복호화 성공 (정확한 passphrase를 입력했습니다)');
    } catch (e) {
      if (e instanceof PassphraseIncorrectError) {
        setStatus('error');
        setMessage(`PassphraseIncorrectError: ${e.message}`);
      } else {
        setStatus('error');
        setMessage(`오류: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  };

  const seedStatusColor =
    status === 'seeded'
      ? 'var(--color-success-strong)'
      : status === 'idle'
        ? 'var(--color-text-secondary)'
        : 'var(--color-brand-secondary)';

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
        BYOK Lib — Wrong Passphrase
      </h2>
      <p
        style={{
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--font-body-sm-size)',
        }}
      >
        사전 저장된 record에 잘못된 passphrase로 복호화를 시도합니다.
        <br />
        AES-GCM auth tag 검증 실패 시 <strong>PassphraseIncorrectError</strong>
        를 표시합니다.
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
          color: seedStatusColor,
        }}
      >
        Seed 상태: {message || '초기화 중...'}
      </div>

      <div style={{ marginBottom: 'var(--spacing-16)' }}>
        <label
          style={{
            display: 'block',
            marginBottom: 'var(--spacing-6)',
            fontSize: 'var(--font-body-sm-size)',
          }}
        >
          잘못된 Passphrase 입력
        </label>
        <input
          name="passphrase"
          type="password"
          value={wrongPassphrase}
          onChange={(e) => setWrongPassphrase(e.target.value)}
          placeholder="잘못된 passphrase를 입력하세요"
          style={{
            width: '100%',
            padding: 'var(--spacing-8)',
            borderRadius: 'var(--spacing-6)',
            border: '1px solid var(--color-border-subtle)',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <button
        type="button"
        onClick={() => void handleTryUnlock()}
        disabled={status === 'loading' || status === 'idle'}
        style={{
          padding: 'var(--spacing-8) var(--spacing-16)',
          background:
            status === 'loading'
              ? 'var(--color-text-secondary)'
              : 'var(--color-error)',
          color: 'var(--color-text-on-error)',
          border: 'none',
          borderRadius: 'var(--spacing-6)',
          cursor:
            status === 'loading' || status === 'idle'
              ? 'not-allowed'
              : 'pointer',
        }}
      >
        복호화 시도 (unwrapKey)
      </button>

      {status === 'error' && (
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

      {status === 'success' && (
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
    </div>
  );
}

const meta = {
  title: 'BYOK Lib/Wrong Passphrase',
  component: WrongPassphraseForm,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        story:
          'BYOK lib Scenario 2 — 잘못된 passphrase 입력 시 PassphraseIncorrectError UI 표시. ' +
          'AES-GCM auth tag 검증 실패 분기 검증.',
      },
    },
  },
} satisfies Meta<typeof WrongPassphraseForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
