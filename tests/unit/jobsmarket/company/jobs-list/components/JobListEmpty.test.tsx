import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { JobListEmpty } from '@/components/jobsmarket/company/jobs/JobListEmpty';

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('JobListEmpty', () => {
  const mockCompanyId = 'test-company-123';

  it('shows "ลงประกาศงานแรก" CTA when reason is no-jobs', () => {
    render(<JobListEmpty reason="no-jobs" companyId={mockCompanyId} />);

    expect(screen.getByText('ยังไม่มีประกาศงาน')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ลงประกาศงานแรก/i })).toBeInTheDocument();
  });

  it('shows "ไม่มีงานในสถานะนี้" when reason is filtered', () => {
    render(<JobListEmpty reason="filtered" companyId={mockCompanyId} />);

    expect(screen.getByText('ไม่มีงานในสถานะนี้')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
