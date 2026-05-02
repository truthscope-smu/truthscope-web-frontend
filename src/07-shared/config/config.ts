/**
 * 환경변수 중앙 관리
 * process.env 접근은 이 파일에서만 수행
 */
export const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  },
  api: {
    /** Spring Boot Base URL (prefix 포함, 예: http://localhost:8080/api/v1) */
    baseUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1',
  },
} as const;
