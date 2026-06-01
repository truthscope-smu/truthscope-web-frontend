'use client';

import { useEffect, useState, useCallback } from 'react';
import type {
  User,
  Session,
  AuthChangeEvent,
  UserResponse,
} from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/07-shared/api/supabase/client';

interface AuthState {
  user: User | null;
  loading: boolean;
}

/**
 * 인증 상태 구독 + signOut 액션 제공함
 *
 * @returns user(null이면 미인증), loading(초기 세션 확인 중), signOut
 */
export function useAuth(): AuthState & { signOut: () => Promise<void> } {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let active = true;

    supabase.auth
      .getUser()
      .then((result: UserResponse) => {
        if (!active) return;
        setUser(result.data.user ?? null);
        setLoading(false);
      })
      .catch(() => {
        // getUser 실패 시에도 loading 해제함 (UI 무한 로딩 방지)
        if (!active) return;
        setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        if (!active) return;
        setUser(session?.user ?? null);
      }
    );

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signOut();
    // 실패 시 user를 비우지 않음(세션 잔존 가능). 성공 시 즉시 반영 + onAuthStateChange SIGNED_OUT 보강
    if (!error) {
      setUser(null);
    }
  }, []);

  return { user, loading, signOut };
}
