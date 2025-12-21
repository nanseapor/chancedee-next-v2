import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeleteJobModal } from '@/components/jobsmarket/company/jobs/DeleteJobModal';

describe('DeleteJobModal', () => {
  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();

  it('displays job title', () => {
    render(
      <DeleteJobModal
        isOpen={true}
        jobTitle="Senior Developer"
        hasApplications={false}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText(/Senior Developer/i)).toBeInTheDocument();
  });

  it('displays permanent warning', () => {
    render(
      <DeleteJobModal
        isOpen={true}
        jobTitle="Senior Developer"
        hasApplications={false}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText(/การดำเนินการนี้ไม่สามารถยกเลิกได้/i)).toBeInTheDocument();
  });

  it('shows warning if job has applications', () => {
    render(
      <DeleteJobModal
        isOpen={true}
        jobTitle="Senior Developer"
        hasApplications={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText(/ไม่สามารถลบงานที่มีใบสมัครได้/i)).toBeInTheDocument();
  });

  it('confirm button disabled if job has applications', () => {
    render(
      <DeleteJobModal
        isOpen={true}
        jobTitle="Senior Developer"
        hasApplications={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const confirmButton = screen.getByRole('button', { name: /ยืนยัน/i });
    expect(confirmButton).toBeDisabled();
  });

  it('confirm button enabled if job has no applications', () => {
    render(
      <DeleteJobModal
        isOpen={true}
        jobTitle="Senior Developer"
        hasApplications={false}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const confirmButton = screen.getByRole('button', { name: /ยืนยัน/i });
    expect(confirmButton).not.toBeDisabled();

    fireEvent.click(confirmButton);
    expect(mockOnConfirm).toHaveBeenCalled();
  });
});
