import { AppError } from '@/07-shared/errors';
import { config } from '@/07-shared/config/config';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

interface RequestOptions<B = unknown> extends Omit<
  RequestInit,
  'body' | 'method'
> {
  body?: B;
}

interface BackendErrorBody {
  message?: string;
  statusCode?: number;
  status?: string;
}

async function request<T, B = unknown>(
  method: HttpMethod,
  path: string,
  options: RequestOptions<B> = {}
): Promise<T> {
  const { body, headers, ...rest } = options;
  const url = `${config.api.baseUrl}${path}`;
  const hasBody = body !== undefined;

  const requestHeaders = new Headers(headers);
  if (!requestHeaders.has('Accept')) {
    requestHeaders.set('Accept', 'application/json');
  }
  if (hasBody && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: requestHeaders,
      body: hasBody ? JSON.stringify(body) : undefined,
      ...rest,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }
    throw new AppError('네트워크 연결에 실패했습니다', 0);
  }

  if (!res.ok) {
    const errorBody = (await res.json().catch(() => ({}))) as BackendErrorBody;
    const message = errorBody.message ?? `요청 실패 (${res.status})`;
    throw new AppError(message, res.status);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

/**
 * Spring Boot 백엔드 API 호출 래퍼.
 * 응답 에러를 AppError로 변환하여 일관된 에러 처리를 보장한다.
 *
 * 사용 예:
 *   await apiClient.get<Article>('/articles/123');
 *   await apiClient.post<AnalysisResponse, AnalysisRequest>(
 *     '/analysis-sessions',
 *     { url }
 *   );
 */
export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>('GET', path, options),
  post: <T, B = unknown>(path: string, body?: B, options?: RequestOptions<B>) =>
    request<T, B>('POST', path, { ...options, body }),
  patch: <T, B = unknown>(
    path: string,
    body?: B,
    options?: RequestOptions<B>
  ) => request<T, B>('PATCH', path, { ...options, body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>('DELETE', path, options),
};
