/**
 * 내부 리다이렉트 경로 안전 검증함 (open redirect 방지, CWE-601)
 * 허용: '/'로 시작 + '//' 미시작 + 백슬래시/제어문자 없음
 * 비허용 입력은 '/'로 폴백함
 *
 * @param input - 검증 대상 경로 (next 쿼리 등, searchParams.get은 이미 percent-decoding됨)
 * @returns 안전한 내부 경로 또는 '/'
 */
const SAFE_PATH_REGEX = /^\/(?!\/|\\)[^\x00-\x1f\x7f\\]*$/;

export function toSafeRedirectPath(input: string | undefined | null): string {
  if (!input) return '/';
  return SAFE_PATH_REGEX.test(input) ? input : '/';
}
