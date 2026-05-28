'use client';

import 'fake-indexeddb/auto';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React, { useState } from 'react';
import {
  saveKey,
  unwrapKey,
  lockAll,
  isAvailable,
} from '@/05-features/byok/lib';
import type { ApiProvider } from '@/05-features/byok/lib/types';

// ──────────────────────────────────────────────────────────────────────────────
// Storybook 시나리오 1: Happy path
// 정상 등록 + 복호화 성공 흐름을 검증하는 mock UI form
// passphrase 분실 시 record 삭제 후 재등록만 가능 (복구 불가, Precondition 1)
// ──────────────────────────────────────────────────────────────────────────────

type Status = 'idle' | 'loading' | 'saved' | 'decrypted' | 'error';

function HappyPathForm() {
  const [provider, setProvider] = useState<ApiProvider>('google-ai');
  const [passphrase, setPassphrase] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [decryptedPreview, setDecryptedPreview] = useState('');

  const handleSave = async () => {
    setStatus('loading');
    setMessage('');
    try {
      const available = await isAvailable();
      if (!available) {
        throw new Error('IndexedDB를 사용할 수 없는 환경입니다');
      }
      await saveKey({
        userId: 'storybook-user-1',
        provider,
        providerId:
          provider === 'google-ai'
            ? 'generativelanguage.googleapis.com'
            : provider === 'google-fact-check'
              ? 'factchecktools.googleapis.com'
              : 'custom',
        keyName: 'storybook-test-key',
        plaintextKey: new TextEncoder().encode(
          apiKey
        ) as Uint8Array<ArrayBuffer>,
        passphrase,
      });
      setStatus('saved');
      setMessage('저장됨 — IndexedDB에 AES-GCM 암호화 완료');
    } catch (e) {
      setStatus('error');
      setMessage(`오류: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  const handleDecrypt = async () => {
    setStatus('loading');
    setMessage('');
    try {
      const rawDEK = await unwrapKey({
        userId: 'storybook-user-1',
        provider,
        keyName: 'storybook-test-key',
        passphrase,
      });
      // raw bytes를 base64로 미리보기 (실제 사용 시에는 즉시 zero-fill 필요)
      const preview = btoa(
        Array.from(rawDEK)
          .map((b) => String.fromCharCode(b))
          .join('')
      ).slice(0, 20);
      setDecryptedPreview(`DEK (base64 첫 20자): ${preview}...`);
      // caller zero-fill 의무 시뮬레이션 (ADR-004 §c)
      rawDEK.fill(0);
      setStatus('decrypted');
      setMessage('복호화 성공 — DEK raw bytes 반환 후 즉시 zero-fill 완료');
    } catch (e) {
      setStatus('error');
      setMessage(`오류: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  const handleLockAll = () => {
    lockAll();
    setMessage('lockAll 호출 — 메모리 내 모든 DEK zero-fill 완료');
  };

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
      <h2 style={{ marginTop: 0, color: '#0f2d52' }}>BYOK Lib — Happy Path</h2>
      <p style={{ color: '#444', fontSize: 14 }}>
        API key를 passphrase로 암호화하여 IndexedDB에 저장합니다.
        <br />
        <strong>passphrase 분실 시 복구 불가</strong> — 삭제 후 재등록만
        가능합니다.
      </p>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>
          Provider
        </label>
        <select
          name="provider"
          value={provider}
          onChange={(e) => setProvider(e.target.value as ApiProvider)}
          style={{
            width: '100%',
            padding: 8,
            borderRadius: 4,
            border: '1px solid #ccc',
          }}
        >
          <option value="google-ai">google-ai</option>
          <option value="google-fact-check">google-fact-check</option>
          <option value="custom">custom</option>
        </select>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>
          Passphrase (8~128자)
        </label>
        <input
          name="passphrase"
          type="password"
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
          placeholder="최소 8자 이상"
          style={{
            width: '100%',
            padding: 8,
            borderRadius: 4,
            border: '1px solid #ccc',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>
          API Key
        </label>
        <input
          name="apiKey"
          type="text"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder={
            provider === 'custom'
              ? '8~512자 임의 문자열'
              : 'AIzaSy...로 시작하는 39자 키'
          }
          style={{
            width: '100%',
            padding: 8,
            borderRadius: 4,
            border: '1px solid #ccc',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={status === 'loading'}
          style={{
            padding: '8px 16px',
            background: '#0f2d52',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: status === 'loading' ? 'not-allowed' : 'pointer',
          }}
        >
          저장 (saveKey)
        </button>
        <button
          type="button"
          onClick={() => void handleDecrypt()}
          disabled={status === 'loading'}
          style={{
            padding: '8px 16px',
            background: '#285c9f',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: status === 'loading' ? 'not-allowed' : 'pointer',
          }}
        >
          복호화 (unwrapKey)
        </button>
        <button
          type="button"
          onClick={handleLockAll}
          style={{
            padding: '8px 16px',
            background: '#444',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          잠금 (lockAll)
        </button>
      </div>

      {message && (
        <div
          className={status === 'error' ? 'error-message' : 'success-message'}
          style={{
            marginTop: 16,
            padding: 12,
            borderRadius: 4,
            background: status === 'error' ? '#fff0f0' : '#f0fff4',
            color: status === 'error' ? '#c62828' : '#2e7d32',
            fontSize: 14,
          }}
        >
          {message}
        </div>
      )}

      {decryptedPreview && status === 'decrypted' && (
        <div
          style={{
            marginTop: 8,
            padding: 12,
            borderRadius: 4,
            background: '#e3f2fd',
            color: '#0d47a1',
            fontSize: 13,
            fontFamily: 'monospace',
          }}
        >
          {decryptedPreview}
        </div>
      )}
    </div>
  );
}

const meta = {
  title: 'BYOK Lib/Happy Path',
  component: HappyPathForm,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        story:
          'BYOK lib Scenario 1 — saveKey + unwrapKey + lockAll happy path. ' +
          'passphrase 분실 시 record 삭제 후 재등록만 가능 (복구 불가, Precondition 1).',
      },
    },
  },
} satisfies Meta<typeof HappyPathForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
