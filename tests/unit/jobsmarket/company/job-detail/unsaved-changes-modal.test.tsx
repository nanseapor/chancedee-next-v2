import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UnsavedChangesModal } from '@/app/jobsmarket/companies/[id]/dashboard/jobs/[jobId]/_components/modals/UnsavedChangesModal';

describe('UnsavedChangesModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onDiscard: vi.fn(),
    onSave: vi.fn(),
  };

  describe('Visibility', () => {
    it('should be visible when isOpen is true', () => {
      render(<UnsavedChangesModal {...defaultProps} isOpen={true} />);
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    it('should not be visible when isOpen is false', () => {
      render(<UnsavedChangesModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
  });

  describe('Content', () => {
    it('should display warning title', () => {
      render(<UnsavedChangesModal {...defaultProps} />);
      expect(screen.getByText(/มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก/i)).toBeInTheDocument();
    });

    it('should display warning message', () => {
      render(<UnsavedChangesModal {...defaultProps} />);
      expect(screen.getByText(/คุณต้องการบันทึกการเปลี่ยนแปลงก่อนออกหรือไม่/i)).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should call onDiscard when discard button clicked', () => {
      const onDiscard = vi.fn();
      render(<UnsavedChangesModal {...defaultProps} onDiscard={onDiscard} />);
      fireEvent.click(screen.getByRole('button', { name: /ไม่บันทึก/i }));
      expect(onDiscard).toHaveBeenCalled();
    });

    it('should call onSave when save button clicked', () => {
      const onSave = vi.fn();
      render(<UnsavedChangesModal {...defaultProps} onSave={onSave} />);
      fireEvent.click(screen.getByRole('button', { name: /^บันทึก$/i }));
      expect(onSave).toHaveBeenCalled();
    });

    it('should call onClose when cancel button clicked', () => {
      const onClose = vi.fn();
      render(<UnsavedChangesModal {...defaultProps} onClose={onClose} />);
      fireEvent.click(screen.getByRole('button', { name: /ยกเลิก/i }));
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Button Order and Styling', () => {
    it('should render three action buttons', () => {
      render(<UnsavedChangesModal {...defaultProps} />);
      expect(screen.getByRole('button', { name: /ยกเลิก/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /ไม่บันทึก/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^บันทึก$/i })).toBeInTheDocument();
    });
  });
});
