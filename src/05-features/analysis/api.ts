import { apiClient } from '@/07-shared/api/base';
import type {
  AnalysisRequest,
  AnalysisResponse,
} from '@/05-features/analysis/model/types';

/** POST /api/v1/analysis-sessions — 뉴스 URL 분석 요청 */
export function requestAnalysis(
  payload: AnalysisRequest
): Promise<AnalysisResponse> {
  return apiClient.post<AnalysisResponse, AnalysisRequest>(
    '/analysis-sessions',
    payload
  );
}
