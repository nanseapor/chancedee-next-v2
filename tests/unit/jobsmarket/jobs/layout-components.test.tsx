/**
 * Unit Tests: Layout Components
 *
 * Tests layout components with MOCKED dependencies.
 * These tests verify component rendering WITHOUT actual navigation.
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Directus SDK before any imports
vi.mock('@directus/sdk', () => ({
  createDirectus: vi.fn(() => ({
    with: vi.fn().mockReturnThis(),
  })),
  rest: vi.fn(() => ({})),
  staticToken: vi.fn(() => ({})),
}));

// Mock Jotai
vi.mock('jotai', async () => {
  const actual = await vi.importActual('jotai');
  return {
    ...actual,
    useAtomValue: vi.fn(),
  };
});

// Import after mocks
import { useAtomValue } from 'jotai';
import { PublicHeader } from '@/components/jobsmarket/jobs/PublicHeader';
import { PublicFooter } from '@/components/jobsmarket/jobs/PublicFooter';
import { PublicShell } from '@/components/jobsmarket/shells/PublicShell';

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('PublicHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when guest (not authenticated)', () => {
    beforeEach(() => {
      vi.mocked(useAtomValue).mockReturnValue(null);
    });

    it('renders logo linking to home', () => {
      render(<PublicHeader />);
      const logo = screen.getByText('ChanceDee');
      expect(logo.closest('a')).toHaveAttribute('href', '/');
    });

    it('renders navigation links', () => {
      render(<PublicHeader />);
      expect(screen.getByText('หางาน').closest('a')).toHaveAttribute('href', '/jobsmarket/jobs');
      expect(screen.getByText('บริษัท').closest('a')).toHaveAttribute('href', '/jobsmarket/companies');
    });

    it('renders login button', () => {
      render(<PublicHeader />);
      const loginButton = screen.getByText('เข้าสู่ระบบ');
      expect(loginButton).toBeInTheDocument();
      expect(loginButton.closest('a')).toHaveAttribute('href', '/jobsmarket/auth/login');
    });

    it('renders register button', () => {
      render(<PublicHeader />);
      const registerButton = screen.getByText('ลงทะเบียน');
      expect(registerButton).toBeInTheDocument();
      expect(registerButton.closest('a')).toHaveAttribute('href', '/jobsmarket/auth/register');
    });
  });

  describe('when authenticated', () => {
    beforeEach(() => {
      let callCount = 0;
      vi.mocked(useAtomValue).mockImplementation(() => {
        callCount++;
        // First call: sessionState
        if (callCount === 1) return 'authenticated';
        // Second call: userAtom
        if (callCount === 2) return { displayName: 'Test User' };
        // Third call: sessionState again for isAuthenticated check
        if (callCount === 3) return 'authenticated';
        // Fourth call: userAtom again
        if (callCount === 4) return { displayName: 'Test User' };
        return null;
      });
    });

    it('does not render login/register buttons', () => {
      render(<PublicHeader />);
      expect(screen.queryByText('เข้าสู่ระบบ')).not.toBeInTheDocument();
      expect(screen.queryByText('ลงทะเบียน')).not.toBeInTheDocument();
    });

    it('renders user menu with display name', () => {
      render(<PublicHeader />);
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    it('user menu links to dashboard', () => {
      render(<PublicHeader />);
      const userButton = screen.getByText('Test User');
      expect(userButton.closest('a')).toHaveAttribute('href', '/jobsmarket/candidates/dashboard');
    });
  });

  describe('when authenticated without display name', () => {
    beforeEach(() => {
      let callCount = 0;
      vi.mocked(useAtomValue).mockImplementation(() => {
        callCount++;
        if (callCount === 1) return 'authenticated';
        if (callCount === 2) return { displayName: null };
        if (callCount === 3) return 'authenticated';
        if (callCount === 4) return { displayName: null };
        return null;
      });
    });

    it('renders fallback text', () => {
      render(<PublicHeader />);
      expect(screen.getByText('บัญชีของฉัน')).toBeInTheDocument();
    });
  });
});

describe('PublicFooter', () => {
  it('renders brand section', () => {
    render(<PublicFooter />);
    expect(screen.getByText('ChanceDee')).toBeInTheDocument();
    expect(screen.getByText('แพลตฟอร์มหางานชั้นนำของไทย')).toBeInTheDocument();
  });

  it('renders brand logo linking to home', () => {
    render(<PublicFooter />);
    const brandLogo = screen.getByText('ChanceDee');
    expect(brandLogo.closest('a')).toHaveAttribute('href', '/');
  });

  it('renders job seeker section header', () => {
    render(<PublicFooter />);
    expect(screen.getByText('สำหรับผู้หางาน')).toBeInTheDocument();
  });

  it('renders job seeker links', () => {
    render(<PublicFooter />);
    expect(screen.getByText('ค้นหางาน').closest('a')).toHaveAttribute('href', '/jobsmarket/jobs');
    expect(screen.getByText('ดูบริษัท').closest('a')).toHaveAttribute('href', '/jobsmarket/companies');
  });

  it('renders employer section header', () => {
    render(<PublicFooter />);
    expect(screen.getByText('สำหรับผู้ประกอบการ')).toBeInTheDocument();
  });

  it('renders employer links', () => {
    render(<PublicFooter />);
    expect(screen.getByText('ลงประกาศงาน').closest('a')).toHaveAttribute(
      'href',
      '/jobsmarket/auth/register?role=company'
    );
  });

  it('renders legal section header', () => {
    render(<PublicFooter />);
    expect(screen.getByText('ข้อมูลเพิ่มเติม')).toBeInTheDocument();
  });

  it('renders legal links', () => {
    render(<PublicFooter />);
    expect(screen.getByText('ข้อกำหนดการใช้งาน').closest('a')).toHaveAttribute(
      'href',
      '/jobsmarket/legal/terms'
    );
    expect(screen.getByText('นโยบายความเป็นส่วนตัว').closest('a')).toHaveAttribute(
      'href',
      '/jobsmarket/privacy'
    );
  });

  it('renders copyright with current year', () => {
    render(<PublicFooter />);
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`© ${currentYear}`))).toBeInTheDocument();
  });
});

describe('PublicShell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default to unauthenticated for PublicShell tests
    vi.mocked(useAtomValue).mockReturnValue(null);
  });

  it('renders header, main content, and footer', () => {
    const { container } = render(
      <PublicShell>
        <div data-testid="content">Test Content</div>
      </PublicShell>
    );

    expect(container.querySelector('header')).toBeInTheDocument();
    expect(container.querySelector('main')).toBeInTheDocument();
    expect(container.querySelector('footer')).toBeInTheDocument();
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('renders children in main content area', () => {
    render(
      <PublicShell>
        <div data-testid="child-content">Child Content</div>
      </PublicShell>
    );

    const main = document.querySelector('main');
    expect(main).toBeInTheDocument();
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(main).toContainElement(screen.getByTestId('child-content'));
  });

  it('has flexbox layout with min-height screen', () => {
    const { container } = render(
      <PublicShell>
        <div>Content</div>
      </PublicShell>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('min-h-screen');
    expect(wrapper).toHaveClass('flex');
    expect(wrapper).toHaveClass('flex-col');
  });

  it('main content area has flex-1 for stretching', () => {
    render(
      <PublicShell>
        <div>Content</div>
      </PublicShell>
    );

    const main = document.querySelector('main');
    expect(main).toHaveClass('flex-1');
  });
});
