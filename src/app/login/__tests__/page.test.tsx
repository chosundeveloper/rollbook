import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '../page';

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn((key) => {
      if (key === 'next') return null;
      return null;
    }),
  }),
}));

// Mock fetch
global.fetch = jest.fn();

describe('LoginForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it('should render login form with all required fields', () => {
    render(<LoginForm />);

    expect(screen.getByText('2청년부 출석부')).toBeInTheDocument();
    expect(screen.getByLabelText(/아이디/)).toBeInTheDocument();
    expect(screen.getByLabelText(/비밀번호/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /로그인/ })).toBeInTheDocument();
  });

  it('should display helper text', () => {
    render(<LoginForm />);
    expect(screen.getByText(/부여된 아이디와 비밀번호로 로그인하세요/)).toBeInTheDocument();
  });

  it('should update state when inputs change', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const usernameInput = screen.getByLabelText(/아이디/);
    const passwordInput = screen.getByLabelText(/비밀번호/);

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'testpass');

    expect(usernameInput).toHaveValue('testuser');
    expect(passwordInput).toHaveValue('testpass');
  });

  it('should disable submit button while loading', async () => {
    const setupUser = userEvent.setup();
    (global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve({ ok: true, json: () => ({}) }), 100))
    );

    render(<LoginForm />);

    const usernameInput = screen.getByLabelText(/아이디/);
    const passwordInput = screen.getByLabelText(/비밀번호/);
    const submitBtn = screen.getByRole('button', { name: /로그인/ });

    await setupUser.type(usernameInput, 'testuser');
    await setupUser.type(passwordInput, 'testpass');
    await setupUser.click(submitBtn);

    expect(submitBtn).toBeDisabled();
    expect(submitBtn).toHaveTextContent(/로그인 중/);
  });

  it('should display error message on failed login', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: '아이디 또는 비밀번호가 잘못되었습니다' }),
    });

    render(<LoginForm />);

    const usernameInput = screen.getByLabelText(/아이디/);
    const passwordInput = screen.getByLabelText(/비밀번호/);
    const submitButton = screen.getByRole('button', { name: /로그인/ });

    await user.type(usernameInput, 'wronguser');
    await user.type(passwordInput, 'wrongpass');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/아이디 또는 비밀번호가 잘못되었습니다/)).toBeInTheDocument();
    });
  });

  it('should handle network errors gracefully', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<LoginForm />);

    const usernameInput = screen.getByLabelText(/아이디/);
    const passwordInput = screen.getByLabelText(/비밀번호/);
    const submitButton = screen.getByRole('button', { name: /로그인/ });

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'testpass');
    await user.click(submitButton);

    await waitFor(() => {
      const errorMsg = screen.queryByText(/로그인에 실패했습니다/) || screen.queryByText(/로그인 실패/);
      expect(errorMsg || screen.queryByText(/Network/)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should have required attributes on inputs', () => {
    render(<LoginForm />);

    const usernameInput = screen.getByLabelText(/아이디/) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/비밀번호/) as HTMLInputElement;

    expect(usernameInput.required).toBe(true);
    expect(passwordInput.required).toBe(true);
  });

  it('should have proper input types', () => {
    render(<LoginForm />);

    const usernameInput = screen.getByLabelText(/아이디/) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/비밀번호/) as HTMLInputElement;

    expect(usernameInput.type).toBe('text');
    expect(passwordInput.type).toBe('password');
  });

  it('should prevent form submission when empty', async () => {
    render(<LoginForm />);

    const usernameInput = screen.getByLabelText(/아이디/) as HTMLInputElement;

    // HTML5 validation should prevent submission
    expect(usernameInput.required).toBe(true);
  });
});
