import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BulkActionModal } from '@/components/jobsmarket/company/jobs/BulkActionModal';

describe('BulkActionModal', () => {
  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();

  it('displays selected count for pause action', () => {
    render(
      <BulkActionModal
        isOpen={true}
        actionType="pause"
        selectedCount={5}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText(/5 รายการ/i)).toBeInTheDocument();
    expect(screen.getByText(/หยุดชั่วคราว/i)).toBeInTheDocument();
  });

  it('displays selected count for close action', () => {
    render(
      <BulkActionModal
        isOpen={true}
        actionType="close"
        selectedCount={3}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText(/3 รายการ/i)).toBeInTheDocument();
    expect(screen.getByText(/ปิด/i)).toBeInTheDocument();
  });

  it('confirm button triggers bulk action', () => {
    render(
      <BulkActionModal
        isOpen={true}
        actionType="pause"
        selectedCount={5}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const confirmButton = screen.getByRole('button', { name: /ยืนยัน/i });
    fireEvent.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalled();
  });
});
