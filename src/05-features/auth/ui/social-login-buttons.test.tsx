import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from '@testing-library/react';

afterEach(cleanup);

/**
 * SocialLoginButtons — 브라우저 단위 테스트 (browser project)
 * signInWithSocialProvider vi.mock 격리
 */

vi.mock('@/05-features/auth/model/social-auth', () => ({
  signInWithSocialProvider: vi.fn(),
}));

import { SocialLoginButtons } from './social-login-buttons';
import { signInWithSocialProvider } from '@/05-features/auth/model/social-auth';

const mockSignIn = vi.mocked(signInWithSocialProvider);

describe('SocialLoginButtons', () => {
  beforeEach(() => {
    mockSignIn.mockReset();
    // 기본: 정상 동작 (redirect 발생 → 반환값 null)
    mockSignIn.mockResolvedValue(null);
  });

  it('Google·Kakao 버튼 2개가 렌더됨', () => {
    render(<SocialLoginButtons />);

    expect(screen.getByLabelText('Google 계정으로 로그인')).toBeInTheDocument();
    expect(screen.getByLabelText('카카오 계정으로 로그인')).toBeInTheDocument();
  });

  it('Google 버튼 클릭 시 signInWithSocialProvider("google", ...) 호출됨', async () => {
    render(<SocialLoginButtons nextPath="/history" />);

    fireEvent.click(screen.getByLabelText('Google 계정으로 로그인'));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(1);
      expect(mockSignIn).toHaveBeenCalledWith('google', '/history');
    });
  });

  it('Kakao 버튼 클릭 시 signInWithSocialProvider("kakao", ...) 호출됨', async () => {
    render(<SocialLoginButtons nextPath="/" />);

    fireEvent.click(screen.getByLabelText('카카오 계정으로 로그인'));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(1);
      expect(mockSignIn).toHaveBeenCalledWith('kakao', '/');
    });
  });

  it('로딩 중에는 두 버튼 모두 disabled됨', async () => {
    // resolve를 보류하여 loading 상태 유지
    let resolveLogin!: (v: null) => void;
    mockSignIn.mockReturnValue(
      new Promise<null>((res) => {
        resolveLogin = res;
      })
    );

    render(<SocialLoginButtons />);

    fireEvent.click(screen.getByLabelText('Google 계정으로 로그인'));

    await waitFor(() => {
      expect(screen.getByLabelText('Google 계정으로 로그인')).toBeDisabled();
      expect(screen.getByLabelText('카카오 계정으로 로그인')).toBeDisabled();
    });

    // cleanup
    resolveLogin(null);
  });

  it('에러 반환 시 alert 역할 요소에 에러 메시지 표시됨', async () => {
    mockSignIn.mockResolvedValue('소셜 로그인 오류 발생');

    render(<SocialLoginButtons />);

    fireEvent.click(screen.getByLabelText('Google 계정으로 로그인'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        '소셜 로그인 오류 발생'
      );
    });
  });

  it('에러 후 버튼은 다시 활성화됨', async () => {
    mockSignIn.mockResolvedValue('에러');

    render(<SocialLoginButtons />);

    fireEvent.click(screen.getByLabelText('Google 계정으로 로그인'));

    await waitFor(() => {
      expect(
        screen.getByLabelText('Google 계정으로 로그인')
      ).not.toBeDisabled();
    });
  });
});
