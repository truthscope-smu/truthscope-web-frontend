import { describe, it, expect } from 'vitest';
import { toSafeRedirectPath } from './safe-path';

/**
 * toSafeRedirectPath — open redirect 방지 유틸 단위 테스트
 * CWE-601: 외부 URL·제어문자·백슬래시 우회 차단 검증
 */
describe('toSafeRedirectPath', () => {
  describe('통과 케이스 — 안전한 내부 경로 그대로 반환', () => {
    it('/history → /history 반환', () => {
      expect(toSafeRedirectPath('/history')).toBe('/history');
    });

    it('/analysis/new → /analysis/new 반환', () => {
      expect(toSafeRedirectPath('/analysis/new')).toBe('/analysis/new');
    });

    it('/ → / 반환', () => {
      expect(toSafeRedirectPath('/')).toBe('/');
    });

    it('/login?next=/history → 반환 (쿼리 포함 경로)', () => {
      expect(toSafeRedirectPath('/login?next=/history')).toBe(
        '/login?next=/history'
      );
    });
  });

  describe('차단 케이스 — / 폴백', () => {
    it('//evil.com → / (프로토콜 상대 URL 차단)', () => {
      expect(toSafeRedirectPath('//evil.com')).toBe('/');
    });

    it('/\\evil.com → / (백슬래시 우회 차단)', () => {
      expect(toSafeRedirectPath('/\\evil.com')).toBe('/');
    });

    it('/\\/evil.com → / (이스케이프 백슬래시 우회 차단)', () => {
      expect(toSafeRedirectPath('/\\/evil.com')).toBe('/');
    });

    it('https://evil.com → / (외부 절대 URL 차단)', () => {
      expect(toSafeRedirectPath('https://evil.com')).toBe('/');
    });

    it('탭 문자 포함 경로 → / (제어문자 0x09 차단)', () => {
      expect(toSafeRedirectPath('/\tevil.com')).toBe('/');
    });

    it('빈 문자열 → / 폴백', () => {
      expect(toSafeRedirectPath('')).toBe('/');
    });

    it('undefined → / 폴백', () => {
      expect(toSafeRedirectPath(undefined)).toBe('/');
    });

    it('null → / 폴백', () => {
      expect(toSafeRedirectPath(null)).toBe('/');
    });

    it('percent-decoding 경유 //evil.com 차단 (URLSearchParams next=%2F%2Fevil.com)', () => {
      // searchParams.get은 percent-decode된 값을 반환 → //evil.com이 함수에 전달됨
      const decoded = new URLSearchParams('next=%2F%2Fevil.com').get('next')!;
      expect(decoded).toBe('//evil.com');
      expect(toSafeRedirectPath(decoded)).toBe('/');
    });

    it('percent-decoding 경유 탭 문자 차단 (next=%09evil.com)', () => {
      const decoded = new URLSearchParams('next=%09evil.com').get('next')!;
      expect(decoded).toBe('\tevil.com');
      expect(toSafeRedirectPath(decoded)).toBe('/');
    });
  });
});
