import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { JobTable } from '@/components/jobsmarket/company/jobs/JobTable';
import type { JobListItem } from '@/types/jobsmarket/jobs-list.types';

// Mock next/navigation for JobRow's useRouter
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  usePathname: () => '/companies/test/jobs',
  useSearchParams: () => new URLSearchParams(),
}));

describe('JobTable', () => {
  const mockJobs: JobListItem[] = [
    {
      uid: 'job-1',
      title: 'Senior Developer',
      jobStatus: 'published',
      isActive: true,
      applicationCount: 10,
      unreadApplicationCount: 2,
      viewCount: 50,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      uid: 'job-2',
      title: 'Junior Designer',
      jobStatus: 'draft',
      isActive: false,
      applicationCount: 0,
      unreadApplicationCount: 0,
      viewCount: 5,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ];

  const mockOnSelect = vi.fn();
  const mockOnSort = vi.fn();
  const mockOnPageChange = vi.fn();

  it('renders table headers with correct Thai labels', () => {
    render(
      <JobTable
        jobs={mockJobs}
        selectedJobs={new Set()}
        onSelectJob={mockOnSelect}
        onSelectAll={vi.fn()}
        onSort={mockOnSort}
        currentPage={1}
        totalPages={1}
        onPageChange={mockOnPageChange}
      />
    );

    expect(screen.getByRole('columnheader', { name: /ตำแหน่ง/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /แผนก/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /ใบสมัคร/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /ผู้เข้าชม/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /วันที่ลง/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /สถานะ/i })).toBeInTheDocument();
  });

  it('renders job rows from jobs prop', () => {
    render(
      <JobTable
        jobs={mockJobs}
        selectedJobs={new Set()}
        onSelectJob={mockOnSelect}
        onSelectAll={vi.fn()}
        onSort={mockOnSort}
        currentPage={1}
        totalPages={1}
        onPageChange={mockOnPageChange}
      />
    );

    expect(screen.getByText('Senior Developer')).toBeInTheDocument();
    expect(screen.getByText('Junior Designer')).toBeInTheDocument();
  });

  it('shows JobListEmpty when jobs array is empty', () => {
    render(
      <JobTable
        jobs={[]}
        selectedJobs={new Set()}
        onSelectJob={mockOnSelect}
        onSelectAll={vi.fn()}
        onSort={mockOnSort}
        currentPage={1}
        totalPages={1}
        onPageChange={mockOnPageChange}
      />
    );

    expect(screen.getByText('ยังไม่มีประกาศงาน')).toBeInTheDocument();
  });

  it('shows JobListSkeleton when isLoading is true', () => {
    render(
      <JobTable
        jobs={[]}
        selectedJobs={new Set()}
        onSelectJob={mockOnSelect}
        onSelectAll={vi.fn()}
        onSort={mockOnSort}
        isLoading={true}
        currentPage={1}
        totalPages={1}
        onPageChange={mockOnPageChange}
      />
    );

    expect(screen.getByTestId('job-list-skeleton')).toBeInTheDocument();
  });

  it('checkbox in header selects/deselects all jobs', () => {
    const mockOnSelectAll = vi.fn();

    render(
      <JobTable
        jobs={mockJobs}
        selectedJobs={new Set()}
        onSelectJob={mockOnSelect}
        onSelectAll={mockOnSelectAll}
        onSort={mockOnSort}
        currentPage={1}
        totalPages={1}
        onPageChange={mockOnPageChange}
      />
    );

    const selectAllCheckbox = screen.getByRole('checkbox', { name: /select all/i });
    fireEvent.click(selectAllCheckbox);

    expect(mockOnSelectAll).toHaveBeenCalled();
  });

  it('displays pagination controls when totalPages > 1', () => {
    render(
      <JobTable
        jobs={mockJobs}
        selectedJobs={new Set()}
        onSelectJob={mockOnSelect}
        onSelectAll={vi.fn()}
        onSort={mockOnSort}
        currentPage={1}
        totalPages={3}
        onPageChange={mockOnPageChange}
      />
    );

    expect(screen.getByRole('navigation', { name: /pagination/i })).toBeInTheDocument();
  });
});
