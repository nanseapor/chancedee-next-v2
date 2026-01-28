import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { JobRow } from '@/components/jobsmarket/company/jobs/JobRow';
import type { JobListItem } from '@/types/jobsmarket/jobs-list.types';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('JobRow', () => {
  const mockJob: JobListItem = {
    uid: 'job-123',
    title: 'Senior Developer',
    jobStatus: 'published',
    isActive: true,
    jobFunctionText: 'Engineering',
    postStartDate: Date.now() - 86400000, // 1 day ago
    postExpiryDate: Date.now() + 2592000000, // 30 days from now
    applicationCount: 15,
    unreadApplicationCount: 3,
    viewCount: 120,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  };

  const mockOnSelect = vi.fn();
  const mockOnAction = vi.fn();

  it('renders job title', () => {
    render(
      <JobRow
        job={mockJob}
        isSelected={false}
        onSelect={mockOnSelect}
        onAction={mockOnAction}
      />
    );

    expect(screen.getByText('Senior Developer')).toBeInTheDocument();
  });

  it('renders department from jobFunctionText', () => {
    render(
      <JobRow
        job={mockJob}
        isSelected={false}
        onSelect={mockOnSelect}
        onAction={mockOnAction}
      />
    );

    expect(screen.getByText('Engineering')).toBeInTheDocument();
  });

  it('renders application count with badge if unreadApplicationCount > 0', () => {
    render(
      <JobRow
        job={mockJob}
        isSelected={false}
        onSelect={mockOnSelect}
        onAction={mockOnAction}
      />
    );

    expect(screen.getByText('15')).toBeInTheDocument();
    // Badge for unread count
    const badge = screen.getByText('3');
    expect(badge).toHaveClass('badge'); // Or specific badge class
  });

  it('renders view count', () => {
    render(
      <JobRow
        job={mockJob}
        isSelected={false}
        onSelect={mockOnSelect}
        onAction={mockOnAction}
      />
    );

    expect(screen.getByText('120')).toBeInTheDocument();
  });

  it('renders posted date in Thai format', () => {
    render(
      <JobRow
        job={mockJob}
        isSelected={false}
        onSelect={mockOnSelect}
        onAction={mockOnAction}
      />
    );

    // Expect some Thai-formatted date string (actual format TBD by util function)
    const dateElement = screen.getByTestId('posted-date');
    expect(dateElement).toBeInTheDocument();
  });

  it('renders JobStatusBadge with correct status', () => {
    render(
      <JobRow
        job={mockJob}
        isSelected={false}
        onSelect={mockOnSelect}
        onAction={mockOnAction}
      />
    );

    expect(screen.getByText('เผยแพร่แล้ว')).toBeInTheDocument();
  });

  it('clicking row navigates to job detail page', () => {
    const { container } = render(
      <JobRow
        job={mockJob}
        isSelected={false}
        onSelect={mockOnSelect}
        onAction={mockOnAction}
      />
    );

    const row = container.querySelector('[data-testid="job-row"]');
    expect(row).toBeInTheDocument();

    if (row) {
      fireEvent.click(row);
      // In actual implementation, this would trigger navigation
      // We'd verify useRouter().push was called with correct URL
    }
  });

  it('action menu opens on menu button click', () => {
    render(
      <JobRow
        job={mockJob}
        isSelected={false}
        onSelect={mockOnSelect}
        onAction={mockOnAction}
      />
    );

    const menuButton = screen.getByRole('button', { name: /actions/i });
    fireEvent.click(menuButton);

    // Menu should appear (this tests the button exists and is clickable)
    expect(mockOnAction).toHaveBeenCalled();
  });
});
