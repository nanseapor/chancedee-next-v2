import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SavedJobCard from '@/app/jobsmarket/candidates/[id]/saved/_components/SavedJobCard';

describe('SavedJobCard', () => {
  const mockJob = {
    uid: 'job-1',
    title: 'Senior Developer',
    companyId: 'company-1',
    companyName: 'Amazing Co',
    companyLogo: 'https://example.com/logo.png',
    workLocationText: 'Bangkok',
    employmentText: 'Full-time',
    experienceText: '2-5 years',
    minSalary: 60000,
    maxSalary: 100000,
    isNegotiable: false,
    isActive: true,
    jobStatus: 'published',
    createdAt: Date.now(),
  };

  const mockSavedAt = Date.now() - 86400000; // 1 day ago
  const mockOnUnsave = vi.fn();

  it('should render job details correctly', () => {
    render(
      <SavedJobCard
        job={mockJob}
        savedAt={mockSavedAt}
        onUnsave={mockOnUnsave}
      />
    );

    expect(screen.getByText('Senior Developer')).toBeInTheDocument();
    expect(screen.getByText('Amazing Co')).toBeInTheDocument();
    expect(screen.getByText('Bangkok')).toBeInTheDocument();
  });

  it('should show closed badge for inactive jobs', () => {
    const inactiveJob = {
      ...mockJob,
      isActive: false,
      jobStatus: 'closed',
    };

    render(
      <SavedJobCard
        job={inactiveJob}
        savedAt={mockSavedAt}
        onUnsave={mockOnUnsave}
      />
    );

    expect(screen.getByText('ปิดรับสมัครแล้ว')).toBeInTheDocument();
  });

  it('should trigger unsave callback on unsave button click', async () => {
    const user = userEvent.setup();

    render(
      <SavedJobCard
        job={mockJob}
        savedAt={mockSavedAt}
        onUnsave={mockOnUnsave}
      />
    );

    const unsaveButton = screen.getByLabelText('ยกเลิกบันทึก');
    await user.click(unsaveButton);

    expect(mockOnUnsave).toHaveBeenCalledWith('job-1');
  });
});
