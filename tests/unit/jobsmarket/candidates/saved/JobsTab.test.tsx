import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JobsTab from '@/app/jobsmarket/candidates/[id]/saved/_components/JobsTab';
import { useSaveJobMutation } from '@/hooks/jobsmarket/useSaveJobMutation';

// Mock the mutation hook
vi.mock('@/hooks/jobsmarket/useSaveJobMutation');

describe('JobsTab', () => {
  const mockToggleSave = vi.fn();
  const mockSavedJobs = [
    {
      savedAt: Date.now(),
      job: {
        uid: 'job-1',
        title: 'Software Engineer',
        companyId: 'company-1',
        companyName: 'Tech Corp',
        companyLogo: 'https://example.com/logo.png',
        location: 'Bangkok',
        minSalary: 50000,
        maxSalary: 80000,
        isActive: true,
        jobStatus: 'published',
        createdAt: Date.now(),
      },
    },
  ];

  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock behavior
    vi.mocked(useSaveJobMutation).mockReturnValue({
      toggleSave: mockToggleSave,
      isJobSaved: vi.fn(() => true),
      isSaving: false,
    });
  });

  it('should render saved jobs list', () => {
    render(
      <JobsTab
        savedJobs={mockSavedJobs}
        isLoading={false}
        error={undefined}
        mutate={mockMutate}
      />
    );

    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Tech Corp')).toBeInTheDocument();
  });

  it('should show loading skeleton when loading', () => {
    render(
      <JobsTab
        savedJobs={undefined}
        isLoading={true}
        error={undefined}
        mutate={mockMutate}
      />
    );

    expect(screen.getByTestId('saved-jobs-skeleton')).toBeInTheDocument();
  });

  it('should show empty state when no saved jobs', () => {
    render(
      <JobsTab
        savedJobs={[]}
        isLoading={false}
        error={undefined}
        mutate={mockMutate}
      />
    );

    expect(screen.getByText('ยังไม่มีงานที่บันทึก')).toBeInTheDocument();
    expect(screen.getByText('ค้นหางาน')).toBeInTheDocument();
  });

  it('should call unsave on button click', async () => {
    const user = userEvent.setup();

    render(
      <JobsTab
        savedJobs={mockSavedJobs}
        isLoading={false}
        error={undefined}
        mutate={mockMutate}
      />
    );

    const unsaveButton = screen.getByLabelText('ยกเลิกบันทึก');
    await user.click(unsaveButton);

    expect(mockToggleSave).toHaveBeenCalledWith('job-1');
    expect(mockMutate).toHaveBeenCalled();
  });
});
