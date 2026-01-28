import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { JobStatusBadge } from '@/components/jobsmarket/company/jobs/JobStatusBadge';
import type { JobStatus } from '@/types/job.types';

describe('JobStatusBadge', () => {
  it('renders "เผยแพร่แล้ว" for published status with green styling', () => {
    render(<JobStatusBadge status="published" />);

    const badge = screen.getByText('เผยแพร่แล้ว');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-green-100', 'text-green-700');
  });

  it('renders "ร่าง" for draft status with gray styling', () => {
    render(<JobStatusBadge status="draft" />);

    const badge = screen.getByText('ร่าง');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-gray-100', 'text-gray-700');
  });

  it('renders "หยุดชั่วคราว" for unpublished status with yellow styling', () => {
    render(<JobStatusBadge status="unpublished" />);

    const badge = screen.getByText('หยุดชั่วคราว');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-amber-100', 'text-amber-700');
  });

  it('renders "ปิดแล้ว" for closed status with red styling', () => {
    render(<JobStatusBadge status="closed" />);

    const badge = screen.getByText('ปิดแล้ว');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-rose-100', 'text-rose-700');
  });

  it('renders "รอเผยแพร่" for ontimer status with blue styling', () => {
    render(<JobStatusBadge status="ontimer" />);

    const badge = screen.getByText('รอเผยแพร่');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-blue-100', 'text-blue-700');
  });
});
