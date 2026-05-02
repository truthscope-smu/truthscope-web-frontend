import { http, HttpResponse } from 'msw';
import { config } from '@/07-shared/config/config';

/**
 * rev.1 CX1-01 fix: BE PR #27 file list 실측 결과 ArticleController 부재 — `/articles/*` endpoint 없음.
 * Phase 21은 `POST /analysis-sessions` 단일 endpoint만 real wiring.
 *
 * BE 응답 shape (실제 contract):
 *   ArticleExtractionResponse { sessionId: string, status: string }
 *
 * Article class는 Layer 2 preflight + domain unit test 학습 도구로 사용.
 * `findArticleById` / `requestAttachToSession` (Phase 22+ ArticleController 작성 시 추가).
 */

// rev.3 R3-04/CX3-03 fix: 기존 `05-features/analysis/model/types.ts`의 AnalysisResponse와 동명 충돌 회피.
// entity api에서는 ArticleExtractionResponse로 명명 분리 (BE는 동일 endpoint, FE는 의미별 type).
interface ArticleExtractionResponse {
  sessionId: string;
  status: string;
}

export const handlers = [
  // Phase 21 IN scope: 유일한 real BE endpoint
  http.post(`${config.api.baseUrl}/analysis-sessions`, async () => {
    // rev.3 R3-02/CX3-01 fix: BE 성공 응답 정상 status는 'EXTRACTING' (실측).
    const response: ArticleExtractionResponse = {
      sessionId: 'session_test_1',
      status: 'EXTRACTING',
    };
    return HttpResponse.json(response, { status: 201 });
  }),
  // Phase 22+ OUT-OF-SCOPE:
  // - `GET /articles/:id` (BE controller 작성 후)
  // - `POST /articles/:id/attach` (BE attach endpoint 작성 후)
  // - Supabase REST (PostgREST shape)
];
