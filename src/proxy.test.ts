import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';

/**
 * proxy.ts — /history 인증 가드 단위 테스트
 * updateSession vi.mock 격리
 */

vi.mock('@/07-shared/api/supabase/middleware', () => ({
  updateSession: vi.fn(),
}));

import { proxy } from './proxy';
import { updateSession } from '@/07-shared/api/supabase/middleware';

const mockUpdateSession = vi.mocked(updateSession);

function makeRequest(pathname: string): NextRequest {
  return new NextRequest(`http://localhost${pathname}`);
}

function makeAuthenticatedResponse() {
  return {
    response: NextResponse.next(),
    user: {
      id: 'user-1',
      email: 'test@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as User,
  };
}

function makeUnauthenticatedResponse() {
  return {
    response: NextResponse.next(),
    user: null,
  };
}

describe('proxy', () => {
  beforeEach(() => {
    mockUpdateSession.mockReset();
  });

  it('/history 미인증 접근 시 /login?next=/history로 redirect함', async () => {
    mockUpdateSession.mockResolvedValue(makeUnauthenticatedResponse());

    const request = makeRequest('/history');
    const response = await proxy(request);

    expect(response.status).toBe(307);
    const location = response.headers.get('location');
    expect(location).toContain('/login');
    expect(location).toContain('next=%2Fhistory');
  });

  it('/history 하위 경로 미인증 접근 시 redirect됨', async () => {
    mockUpdateSession.mockResolvedValue(makeUnauthenticatedResponse());

    const request = makeRequest('/history/detail');
    const response = await proxy(request);

    expect(response.status).toBe(307);
    const location = response.headers.get('location');
    expect(location).toContain('/login');
    expect(location).toContain('next=%2Fhistory%2Fdetail');
  });

  it('/history 인증 사용자 접근 시 통과함 (redirect 없음)', async () => {
    mockUpdateSession.mockResolvedValue(makeAuthenticatedResponse());

    const request = makeRequest('/history');
    const response = await proxy(request);

    expect(response.status).not.toBe(307);
    expect(response.status).not.toBe(302);
    expect(response.status).toBe(200);
  });

  it('/analysis/new 미인증 접근 시 가드 미적용 (통과)', async () => {
    mockUpdateSession.mockResolvedValue(makeUnauthenticatedResponse());

    const request = makeRequest('/analysis/new');
    const response = await proxy(request);

    expect(response.status).not.toBe(307);
    expect(response.status).not.toBe(302);
    expect(response.status).toBe(200);
  });

  it('/login 미인증 접근 시 가드 미적용 (통과)', async () => {
    mockUpdateSession.mockResolvedValue(makeUnauthenticatedResponse());

    const request = makeRequest('/login');
    const response = await proxy(request);

    expect(response.status).not.toBe(307);
    expect(response.status).not.toBe(302);
    expect(response.status).toBe(200);
  });

  it('/history-other 경로는 가드 미적용 (정확 매칭, 오보호 방지)', async () => {
    mockUpdateSession.mockResolvedValue(makeUnauthenticatedResponse());

    const request = makeRequest('/history-other');
    const response = await proxy(request);

    expect(response.status).not.toBe(307);
    expect(response.status).not.toBe(302);
    expect(response.status).toBe(200);
  });

  it('/ 경로 미인증 접근 시 가드 미적용 (익명 분석 흐름 보존)', async () => {
    mockUpdateSession.mockResolvedValue(makeUnauthenticatedResponse());

    const request = makeRequest('/');
    const response = await proxy(request);

    expect(response.status).not.toBe(307);
    expect(response.status).not.toBe(302);
    expect(response.status).toBe(200);
  });
});
