import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BulkActionsBar } from '@/components/jobsmarket/company/jobs/BulkActionsBar';

describe('BulkActionsBar', () => {
  const mockOnBulkPause = vi.fn();
  const mockOnBulkClose = vi.fn();
  const mockOnClearSelection = vi.fn();

  it('hidden when selectedCount is 0', () => {
    const { container } = render(
      <BulkActionsBar
        selectedCount={0}
        hasPublishedJobs={false}
        hasNonClosedJobs={false}
        onBulkPause={mockOnBulkPause}
        onBulkClose={mockOnBulkClose}
        onClearSelection={mockOnClearSelection}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('displays selected count (e.g., "เลือกแล้ว 3 รายการ")', () => {
    render(
      <BulkActionsBar
        selectedCount={3}
        hasPublishedJobs={true}
        hasNonClosedJobs={true}
        onBulkPause={mockOnBulkPause}
        onBulkClose={mockOnBulkClose}
        onClearSelection={mockOnClearSelection}
      />
    );

    expect(screen.getByText(/เลือกแล้ว 3 รายการ/i)).toBeInTheDocument();
  });

  it('shows "หยุดทั้งหมด" button when any selected job is published', () => {
    render(
      <BulkActionsBar
        selectedCount={2}
        hasPublishedJobs={true}
        hasNonClosedJobs={true}
        onBulkPause={mockOnBulkPause}
        onBulkClose={mockOnBulkClose}
        onClearSelection={mockOnClearSelection}
      />
    );

    expect(screen.getByRole('button', { name: /หยุดทั้งหมด/i })).toBeInTheDocument();
  });

  it('shows "ปิดทั้งหมด" button when any selected job is not closed', () => {
    render(
      <BulkActionsBar
        selectedCount={2}
        hasPublishedJobs={false}
        hasNonClosedJobs={true}
        onBulkPause={mockOnBulkPause}
        onBulkClose={mockOnBulkClose}
        onClearSelection={mockOnClearSelection}
      />
    );

    expect(screen.getByRole('button', { name: /ปิดทั้งหมด/i })).toBeInTheDocument();
  });

  it('"ล้างการเลือก" button clears all selections', () => {
    render(
      <BulkActionsBar
        selectedCount={2}
        hasPublishedJobs={true}
        hasNonClosedJobs={true}
        onBulkPause={mockOnBulkPause}
        onBulkClose={mockOnBulkClose}
        onClearSelection={mockOnClearSelection}
      />
    );

    const clearButton = screen.getByRole('button', { name: /ล้างการเลือก/i });
    fireEvent.click(clearButton);

    expect(mockOnClearSelection).toHaveBeenCalled();
  });
});
