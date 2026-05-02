import { http, HttpResponse } from 'msw';
import { config } from '@/07-shared/config/config';

/**
 * rev.7 P21-5-1 contract (BE PR #28 d9b6168 + #29 6ad70ec 머지 후):
 *
 * 1. POST /analysis-sessions → { sessionId, status, articleId }
 *    (PR #29 articleId 노출 — auto-attach 정책으로 즉시 ATTACHED 상태 저장)
 * 2. GET /articles/{id} → ArticleResponse { id, url, title, content, status, sessionId, createdAt }
 *    (PR #28 ArticleController.findById)
 * 3. POST /articles/{id}/attach { sessionId } → 200 ArticleResponse | 409 ConflictException
 *    (PR #28 ArticleController.attach — auto-attach 정책으로 재호출은 항상 409)
 */

interface ArticleExtractionResponse {
  sessionId: string;
  status: string;
  articleId: string;
}

interface ArticleResponse {
  id: string;
  url: string;
  title: string | null;
  content: string | null;
  status: 'EXTRACTED' | 'ATTACHED';
  sessionId: string | null;
  createdAt: string;
}

interface ApiErrorResponse {
  status: string;
  statusCode: number;
  message: string;
}

const TEST_ARTICLE_ID = '00000000-0000-0000-0000-000000000001';
const TEST_SESSION_ID = 'session_test_1';

export const handlers = [
  // 1. extract-article real endpoint
  http.post(`${config.api.baseUrl}/analysis-sessions`, async () => {
    const response: ArticleExtractionResponse = {
      sessionId: TEST_SESSION_ID,
      status: 'EXTRACTING',
      articleId: TEST_ARTICLE_ID,
    };
    return HttpResponse.json(response, { status: 201 });
  }),
  // 2. findArticleById real endpoint (rev.7)
  http.get(`${config.api.baseUrl}/articles/:id`, async ({ params }) => {
    const response: ArticleResponse = {
      id: params.id as string,
      url: 'https://example.com/test-article',
      title: 'Test Article',
      content: 'Test content body',
      status: 'ATTACHED',
      sessionId: TEST_SESSION_ID,
      createdAt: '2026-05-02T12:00:00Z',
    };
    return HttpResponse.json(response, { status: 200 });
  }),
  // 3. attach real endpoint — A4 reframe로 항상 409 (재부착 거부 invariant)
  http.post(`${config.api.baseUrl}/articles/:id/attach`, async () => {
    const error: ApiErrorResponse = {
      status: 'CONFLICT',
      statusCode: 409,
      message: '이 기사는 이미 분석 세션에 부착되어 있습니다',
    };
    return HttpResponse.json(error, { status: 409 });
  }),
];
