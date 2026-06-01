import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

/**
 * use-auth.ts — useAuth 훅 단위 테스트
 * Supabase 클라이언트 vi.mock 격리
 */

const mockGetUser = vi.fn();
const mockOnAuthStateChange = vi.fn();
const mockSignOut = vi.fn();
const mockUnsubscribe = vi.fn();

vi.mock('@/07-shared/api/supabase/client', () => ({
  getSupabaseBrowserClient: () => ({
    auth: {
      getUser: mockGetUser,
      onAuthStateChange: mockOnAuthStateChange,
      signOut: mockSignOut,
    },
  }),
}));

import { useAuth } from './use-auth';

const testUser = { id: 'test-user', email: 'test@example.com' };

describe('useAuth', () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    mockOnAuthStateChange.mockReset();
    mockSignOut.mockReset();
    mockUnsubscribe.mockReset();

    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    });
    mockSignOut.mockResolvedValue({});
  });

  it('초기 상태: loading=true, user=null', () => {
    // getUser가 즉시 resolve되기 전 상태
    let resolveGetUser!: (v: unknown) => void;
    mockGetUser.mockReturnValue(
      new Promise((res) => {
        resolveGetUser = res;
      })
    );

    const { result } = renderHook(() => useAuth());

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();

    // cleanup - resolve promise
    act(() => {
      resolveGetUser({ data: { user: null }, error: null });
    });
  });

  it('세션 있을 때 user 설정 + loading=false', async () => {
    mockGetUser.mockResolvedValue({ data: { user: testUser }, error: null });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(testUser);
  });

  it('세션 없을 때 user=null + loading=false', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
  });

  it('onAuthStateChange 이벤트로 user 갱신됨', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    let authChangeCallback!: (
      event: string,
      session: { user: typeof testUser } | null
    ) => void;
    mockOnAuthStateChange.mockImplementation(
      (cb: typeof authChangeCallback) => {
        authChangeCallback = cb;
        return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
      }
    );

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      authChangeCallback('SIGNED_IN', { user: testUser });
    });

    expect(result.current.user).toEqual(testUser);
  });

  it('signOut 후 user null', async () => {
    mockGetUser.mockResolvedValue({ data: { user: testUser }, error: null });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.user).toEqual(testUser);
    });

    await act(async () => {
      await result.current.signOut();
    });

    expect(result.current.user).toBeNull();
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it('getUser 실패 시에도 loading 해제됨 (무한 로딩 방지)', async () => {
    mockGetUser.mockRejectedValue(new Error('network'));

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
  });

  it('signOut 실패 시 user를 비우지 않음 (세션 잔존 가능)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: testUser }, error: null });
    mockSignOut.mockResolvedValue({ error: { message: 'signout failed' } });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.user).toEqual(testUser);
    });

    await act(async () => {
      await result.current.signOut();
    });

    expect(result.current.user).toEqual(testUser);
  });

  it('unmount 시 subscription.unsubscribe 호출됨', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const { unmount } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(mockOnAuthStateChange).toHaveBeenCalled();
    });

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });
});
