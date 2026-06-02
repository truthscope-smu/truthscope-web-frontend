// api/base 직접 import — @/07-shared/api barrel은 next/headers(server-only) 재export라
// Edge/browser 번들 오염 위험. 기존 backend.ts 패턴 정합.
import { apiClient } from '@/07-shared/api/base';
import type { AnalysisSessionListItem } from '@/06-entities/analysis-session/model/types';

/**
 * GET /api/v1/analysis-sessions — 인증 사용자 분석 이력 목록.
 * Server Component(app/history/page.tsx)에서 호출하며, accessToken은 호출자가 주입한다.
 * 401 시 apiClient가 AppError(401)로 변환 — page에서 catch해 /login 리다이렉트(CX-8).
 */
export async function findMyAnalysisSessions(
  accessToken: string
): Promise<AnalysisSessionListItem[]> {
  return apiClient.get<AnalysisSessionListItem[]>('/analysis-sessions', {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
}
