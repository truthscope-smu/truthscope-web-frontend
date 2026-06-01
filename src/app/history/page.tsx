import { redirect } from 'next/navigation';
import { HistoryPage } from '@/03-pages';
import { getSupabaseServerClient } from '@/07-shared/api/supabase/server';

export default async function History() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/history');
  }

  return <HistoryPage />;
}
