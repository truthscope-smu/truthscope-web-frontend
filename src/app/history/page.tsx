import { redirect } from 'next/navigation';
import { HistoryPage } from '@/03-pages';
import { getSupabaseServerClient } from '@/07-shared/api/supabase/server';
import { findMyAnalysisSessions } from '@/06-entities/analysis-session';
import { AppError } from '@/07-shared/errors';

export default async function History() {
  const supabase = await getSupabaseServerClient();

  // 보안: getUser()로 네트워크 검증 후, getSession()으로 액세스 토큰 취득(@supabase/ssr 권고).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/history');
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    redirect('/login?next=/history');
  }

  let sessions;
  try {
    sessions = await findMyAnalysisSessions(session.access_token);
  } catch (e) {
    // 토큰 stale/만료 시 401 AppError → /login 리다이렉트(CX-8/H-2).
    // redirect()는 내부적으로 throw하므로 try 안에서 쓰지 않는다.
    if (e instanceof AppError && e.statusCode === 401) {
      redirect('/login?next=/history');
    }
    // 그 외 에러(5xx 등)는 error.tsx 경계로 전파.
    throw e;
  }

  return <HistoryPage sessions={sessions} />;
}
