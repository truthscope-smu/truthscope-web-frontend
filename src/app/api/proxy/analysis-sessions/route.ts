import { config } from '@/07-shared/config/config';

export const runtime = 'edge';

/**
 * 키리스(BYOK 미설정) 분석 요청 전용 same-origin 레인. (#45 / ADR-025)
 *
 * X-User-Gemini-Key를 주입하거나 전달하지 않는다 → BE가 헤더 부재 시 서버 기본 키로
 * fallback한다(NewsController). 따라서 이 핸들러는 "키 은닉·남용 방지"가 목적이 아니라
 * same-origin(CORS 회피) + BE URL 은닉 + 향후 rate limit/감사 seam이 목적이다.
 * (키는 원래 BE 서버측에만 있어 클라이언트에 노출된 적이 없다.)
 *
 * rate limit(남용 방지)은 본 핸들러 범위 밖 — 후속(BE Bucket4j #89 또는 Edge).
 * BYOK 설정 사용자의 우회 분기도 범위 밖 — BYOK attach 배선이 생기면 이 레인 앞에서 분기한다.
 */
export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = undefined;
  }
  // 잘못된 JSON(런타임에 따라 throw 또는 undefined 반환) + 객체가 아닌 body를 일관되게 거부.
  if (typeof body !== 'object' || body === null) {
    return Response.json(
      { message: '잘못된 요청 본문입니다', statusCode: 400 },
      { status: 400 }
    );
  }

  let beRes: Response;
  try {
    beRes = await fetch(`${config.api.baseUrl}/analysis-sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    });
  } catch {
    return Response.json(
      { message: '분석 서버에 연결할 수 없습니다', statusCode: 502 },
      { status: 502 }
    );
  }

  // BE 응답 status + body를 그대로 패스스루한다.
  // (4xx/5xx를 AppError로 변환하는 책임은 클라이언트 apiClient가 담당.)
  const text = await beRes.text();
  return new Response(text, {
    status: beRes.status,
    headers: {
      'Content-Type': beRes.headers.get('Content-Type') ?? 'application/json',
    },
  });
}
