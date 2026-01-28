import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CloseJobModal } from '@/components/jobsmarket/company/jobs/CloseJobModal';

describe('CloseJobModal', () => {
  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();

  it('displays job title', () => {
    render(
      <CloseJobModal
        isOpen={true}
        jobTitle="Senior Developer"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText(/Senior Developer/i)).toBeInTheDocument();
  });

  it('displays warning text', () => {
    render(
      <CloseJobModal
        isOpen={true}
        jobTitle="Senior Developer"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText(/งานนี้จะถูกซ่อนจากผู้สมัคร/i)).toBeInTheDocument();
  });

  it('confirm button triggers onConfirm callback', () => {
    render(
      <CloseJobModal
        isOpen={true}
        jobTitle="Senior Developer"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const confirmButton = screen.getByRole('button', { name: /ยืนยัน/i });
    fireEvent.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalled();
  });

  it('cancel button triggers onCancel callback', () => {
    render(
      <CloseJobModal
        isOpen={true}
        jobTitle="Senior Developer"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /ยกเลิก/i });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });
});
