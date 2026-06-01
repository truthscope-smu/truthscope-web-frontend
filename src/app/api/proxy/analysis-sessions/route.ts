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
// 최초 1회 + 일시 실패 시 재시도 2회. korea.kr 추출이 간헐적으로 실패(BE 5xx)하거나
// 일시 네트워크 오류가 날 때, 사용자가 분석 버튼을 다시 누르지 않아도 자동으로 재시도한다.
const MAX_ATTEMPTS = 3;

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = undefined;
  }
  // 잘못된 JSON(런타임에 따라 throw 또는 undefined 반환) + 객체가 아닌 body(배열 포함)를 일관되게 거부.
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return Response.json(
      { message: '잘못된 요청 본문입니다', statusCode: 400 },
      { status: 400 }
    );
  }

  const payload = JSON.stringify(body);

  // 자동 재시도 루프. 재시도 대상은 일시적 실패(BE 5xx, 일시 네트워크 오류)뿐이다.
  // 4xx(요청 오류)는 결정적이라 즉시 패스스루하고, 타임아웃은 이미 15초를 기다렸으므로
  // 재시도하지 않고 504로 끊는다(누적 대기 폭증 방지).
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let beRes: Response;
    try {
      beRes = await fetch(`${config.api.baseUrl}/analysis-sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: payload,
        signal: AbortSignal.timeout(15000),
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'TimeoutError') {
        return Response.json(
          { message: '분석 서버 응답이 지연되고 있습니다', statusCode: 504 },
          { status: 504 }
        );
      }
      if (attempt < MAX_ATTEMPTS) {
        continue;
      }
      return Response.json(
        { message: '분석 서버에 연결할 수 없습니다', statusCode: 502 },
        { status: 502 }
      );
    }

    // 5xx = 일시 실패로 간주. 남은 시도가 있으면 재시도, 마지막 시도면 그대로 패스스루한다.
    if (beRes.status >= 500 && attempt < MAX_ATTEMPTS) {
      continue;
    }

    // BE 응답 status + body 패스스루. body 읽기 실패 등 예기치 못한 예외도 JSON으로 감싸
    // Next 기본 에러 HTML 페이지가 클라이언트로 새어 나가지 않게 한다.
    try {
      const text = await beRes.text();
      return new Response(text, {
        status: beRes.status,
        headers: {
          'Content-Type':
            beRes.headers.get('Content-Type') ?? 'application/json',
        },
      });
    } catch {
      return Response.json(
        { message: '분석 서버 응답을 읽을 수 없습니다', statusCode: 502 },
        { status: 502 }
      );
    }
  }

  // 루프는 항상 반환하므로 정상 흐름에서 도달하지 않는다. 타입 안전용 방어 반환.
  return Response.json(
    { message: '분석 요청을 처리하지 못했습니다', statusCode: 502 },
    { status: 502 }
  );
}
