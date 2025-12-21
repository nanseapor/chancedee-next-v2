import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { JobActionMenu } from '@/components/jobsmarket/company/jobs/JobActionMenu';
import type { JobListItem } from '@/types/jobsmarket/jobs-list.types';

describe('JobActionMenu', () => {
  const mockOnAction = vi.fn();

  const createMockJob = (overrides: Partial<JobListItem> = {}): JobListItem => ({
    uid: 'job-123',
    title: 'Test Job',
    jobStatus: 'draft',
    isActive: true,
    applicationCount: 0,
    unreadApplicationCount: 0,
    viewCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  });

  it('shows "ดู" (View) action always', () => {
    const job = createMockJob({ jobStatus: 'closed' });
    render(<JobActionMenu job={job} onAction={mockOnAction} />);

    expect(screen.getByRole('menuitem', { name: /ดู/i })).toBeInTheDocument();
  });

  it('shows "แก้ไข" (Edit) when job status is not closed', () => {
    const job = createMockJob({ jobStatus: 'draft' });
    render(<JobActionMenu job={job} onAction={mockOnAction} />);

    expect(screen.getByRole('menuitem', { name: /แก้ไข/i })).toBeInTheDocument();
  });

  it('hides "แก้ไข" (Edit) when job status is closed', () => {
    const job = createMockJob({ jobStatus: 'closed' });
    render(<JobActionMenu job={job} onAction={mockOnAction} />);

    expect(screen.queryByRole('menuitem', { name: /แก้ไข/i })).not.toBeInTheDocument();
  });

  it('shows "หยุดชั่วคราว" (Pause) when status is published', () => {
    const job = createMockJob({ jobStatus: 'published' });
    render(<JobActionMenu job={job} onAction={mockOnAction} />);

    expect(screen.getByRole('menuitem', { name: /หยุดชั่วคราว/i })).toBeInTheDocument();
  });

  it('shows "เปิดรับ" (Resume) when status is unpublished', () => {
    const job = createMockJob({ jobStatus: 'unpublished' });
    render(<JobActionMenu job={job} onAction={mockOnAction} />);

    expect(screen.getByRole('menuitem', { name: /เปิดรับ/i })).toBeInTheDocument();
  });

  it('shows "เผยแพร่" (Publish) when status is draft', () => {
    const job = createMockJob({ jobStatus: 'draft' });
    render(<JobActionMenu job={job} onAction={mockOnAction} />);

    expect(screen.getByRole('menuitem', { name: /เผยแพร่/i })).toBeInTheDocument();
  });

  it('shows "เผยแพร่" (Publish) when status is ontimer', () => {
    const job = createMockJob({ jobStatus: 'ontimer' });
    render(<JobActionMenu job={job} onAction={mockOnAction} />);

    expect(screen.getByRole('menuitem', { name: /เผยแพร่/i })).toBeInTheDocument();
  });

  it('shows "ปิดรับสมัคร" (Close) when status is not closed', () => {
    const job = createMockJob({ jobStatus: 'published' });
    render(<JobActionMenu job={job} onAction={mockOnAction} />);

    expect(screen.getByRole('menuitem', { name: /ปิดรับสมัคร/i })).toBeInTheDocument();
  });

  it('shows "คัดลอก" (Duplicate) always', () => {
    const job = createMockJob({ jobStatus: 'closed' });
    render(<JobActionMenu job={job} onAction={mockOnAction} />);

    expect(screen.getByRole('menuitem', { name: /คัดลอก/i })).toBeInTheDocument();
  });

  it('shows "ลบ" (Delete) only for draft status with applicationCount === 0', () => {
    const job = createMockJob({ jobStatus: 'draft', applicationCount: 0 });
    render(<JobActionMenu job={job} onAction={mockOnAction} />);

    expect(screen.getByRole('menuitem', { name: /ลบ/i })).toBeInTheDocument();
  });

  it('hides "ลบ" (Delete) for draft status with applications', () => {
    const job = createMockJob({ jobStatus: 'draft', applicationCount: 5 });
    render(<JobActionMenu job={job} onAction={mockOnAction} />);

    expect(screen.queryByRole('menuitem', { name: /ลบ/i })).not.toBeInTheDocument();
  });

  it('hides "ลบ" (Delete) for non-draft status', () => {
    const job = createMockJob({ jobStatus: 'published', applicationCount: 0 });
    render(<JobActionMenu job={job} onAction={mockOnAction} />);

    expect(screen.queryByRole('menuitem', { name: /ลบ/i })).not.toBeInTheDocument();
  });
});
