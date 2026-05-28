'use client';

import 'fake-indexeddb/auto';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React, { useEffect, useState } from 'react';
import {
  saveKey,
  unwrapKey,
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
      } catch {
        // 이미 존재하는 경우(story 재로드) 무시
        if (mounted) {
          setStatus('seeded');
          setMessage(
            'seed record 이미 존재 — 잘못된 passphrase로 복호화를 시도하세요'
          );
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
    status === 'seeded' ? '#2e7d32' : status === 'idle' ? '#888' : '#0d47a1';

  return (
    <div
      style={{
        fontFamily: 'Pretendard, sans-serif',
        maxWidth: 480,
        padding: 24,
        border: '1px solid #e0e0e0',
        borderRadius: 8,
      }}
    >
      <h2 style={{ marginTop: 0, color: '#0f2d52' }}>
        BYOK Lib — Wrong Passphrase
      </h2>
      <p style={{ color: '#444', fontSize: 14 }}>
        사전 저장된 record에 잘못된 passphrase로 복호화를 시도합니다.
        <br />
        AES-GCM auth tag 검증 실패 시 <strong>PassphraseIncorrectError</strong>
        를 표시합니다.
      </p>

      <div
        style={{
          padding: 10,
          borderRadius: 4,
          background: '#f5f5f5',
          marginBottom: 16,
          fontSize: 13,
          color: seedStatusColor,
        }}
      >
        Seed 상태: {message || '초기화 중...'}
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>
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
            padding: 8,
            borderRadius: 4,
            border: '1px solid #ccc',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <button
        type="button"
        onClick={() => void handleTryUnlock()}
        disabled={status === 'loading' || status === 'idle'}
        style={{
          padding: '8px 16px',
          background: status === 'loading' ? '#999' : '#c62828',
          color: 'white',
          border: 'none',
          borderRadius: 4,
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
            marginTop: 16,
            padding: 12,
            borderRadius: 4,
            background: '#fff0f0',
            color: '#c62828',
            fontSize: 13,
            fontFamily: 'monospace',
          }}
        >
          {message}
        </div>
      )}

      {status === 'success' && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            borderRadius: 4,
            background: '#f0fff4',
            color: '#2e7d32',
            fontSize: 14,
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
