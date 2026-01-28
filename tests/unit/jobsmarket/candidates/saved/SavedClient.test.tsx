import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SavedClient from '@/app/jobsmarket/candidates/[id]/saved/_components/SavedClient';
import { useRouter, useSearchParams } from 'next/navigation';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
  usePathname: vi.fn(() => '/candidates/test-id/saved'),
}));

// Mock auth hook
vi.mock('@/hooks/jobsmarket/use-candidate-auth', () => ({
  useCandidateAuth: vi.fn(() => ({
    state: 'ready',
    isLoading: false,
    isReady: true,
    currentUserId: 'test-candidate-123',
    setOnboardingComplete: vi.fn(),
  })),
}));

// Mock saved jobs hook
vi.mock('@/hooks/jobsmarket/candidates/use-saved-jobs', () => ({
  useSavedJobs: vi.fn(() => ({
    savedJobs: [],
    isLoading: false,
    error: undefined,
    mutate: vi.fn(),
  })),
}));

describe('SavedClient', () => {
  const mockRouter = {
    push: vi.fn(),
    replace: vi.fn(),
  };

  const mockSearchParams = new URLSearchParams();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue(mockRouter as any);
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any);
  });

  it('should render Jobs tab by default', () => {
    render(<SavedClient candidateId="test-candidate-123" />);

    expect(screen.getByText('งานที่บันทึก')).toBeInTheDocument();
    expect(screen.getByText('การค้นหาที่บันทึก')).toBeInTheDocument();
    expect(screen.getByText('การแจ้งเตือนงาน')).toBeInTheDocument();
  });

  it('should switch tabs on click', async () => {
    const user = userEvent.setup();

    render(<SavedClient candidateId="test-candidate-123" />);

    const searchesTab = screen.getByText('การค้นหาที่บันทึก');
    await user.click(searchesTab);

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('?tab=searches');
    });
  });

  it('should show loading state when auth is not ready', async () => {
    // Import and temporarily override the mock
    const candidateAuthModule = await import('@/hooks/jobsmarket/use-candidate-auth');
    const originalMock = vi.mocked(candidateAuthModule.useCandidateAuth);

    // Override for this test
    originalMock.mockReturnValueOnce({
      state: 'loading',
      isLoading: true,
      isReady: false,
      currentUserId: null,
      setOnboardingComplete: vi.fn(),
    });

    render(<SavedClient candidateId="test-candidate-123" />);

    expect(screen.getByText('กำลังโหลด...')).toBeInTheDocument();
  });

  it('should render content when auth is ready', async () => {
    // Default mock already returns ready state, just render
    render(<SavedClient candidateId="test-candidate-123" />);

    await waitFor(() => {
      expect(screen.getByText('รายการที่บันทึก')).toBeVisible();
    });
  });
});
