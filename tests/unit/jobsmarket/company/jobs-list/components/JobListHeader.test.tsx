import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { JobListHeader } from '@/components/jobsmarket/company/jobs/JobListHeader';

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('JobListHeader', () => {
  const mockOnSearch = vi.fn();
  const mockCompanyId = 'test-company-123';

  it('renders title "ประกาศงาน"', () => {
    render(
      <JobListHeader
        companyId={mockCompanyId}
        onSearch={mockOnSearch}
        canCreateJobs={true}
      />
    );

    expect(screen.getByRole('heading', { name: 'ประกาศงาน' })).toBeInTheDocument();
  });

  it('renders search input with placeholder', () => {
    render(
      <JobListHeader
        companyId={mockCompanyId}
        onSearch={mockOnSearch}
        canCreateJobs={true}
      />
    );

    const searchInput = screen.getByPlaceholderText('ค้นหาตำแหน่งงาน');
    expect(searchInput).toBeInTheDocument();
  });

  it('renders create button linking to /jobs/new', () => {
    render(
      <JobListHeader
        companyId={mockCompanyId}
        onSearch={mockOnSearch}
        canCreateJobs={true}
      />
    );

    const createButton = screen.getByRole('link', { name: /ลงประกาศงานใหม่/i });
    expect(createButton).toBeInTheDocument();
    expect(createButton).toHaveAttribute('href', `/jobsmarket/companies/${mockCompanyId}/dashboard/jobs/new`);
  });

  it('search input triggers debounced callback after 300ms', async () => {
    vi.useFakeTimers();

    render(
      <JobListHeader
        companyId={mockCompanyId}
        onSearch={mockOnSearch}
        canCreateJobs={true}
      />
    );

    const searchInput = screen.getByPlaceholderText('ค้นหาตำแหน่งงาน');

    fireEvent.change(searchInput, { target: { value: 'developer' } });

    // Should not call immediately
    expect(mockOnSearch).not.toHaveBeenCalled();

    // Fast-forward 300ms
    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('developer');
    });

    vi.useRealTimers();
  });

  it('create button hidden if user lacks post_jobs permission', () => {
    render(
      <JobListHeader
        companyId={mockCompanyId}
        onSearch={mockOnSearch}
        canCreateJobs={false}
      />
    );

    const createButton = screen.queryByRole('link', { name: /ลงประกาศงานใหม่/i });
    expect(createButton).not.toBeInTheDocument();
  });
});
