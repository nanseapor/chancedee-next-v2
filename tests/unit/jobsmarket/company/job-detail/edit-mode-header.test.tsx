import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EditModeHeader } from '@/app/jobsmarket/companies/[id]/dashboard/jobs/[jobId]/_components/EditModeHeader';

describe('EditModeHeader', () => {
  const defaultProps = {
    jobTitle: 'Software Engineer',
    isDirty: false,
    isSaving: false,
    onSave: vi.fn(),
    onCancel: vi.fn(),
  };

  describe('Rendering', () => {
    it('should display job title', () => {
      render(<EditModeHeader {...defaultProps} />);
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    });

    it('should show "กำลังแก้ไข" label', () => {
      render(<EditModeHeader {...defaultProps} />);
      expect(screen.getByText(/กำลังแก้ไข/)).toBeInTheDocument();
    });

    it('should render save and cancel buttons', () => {
      render(<EditModeHeader {...defaultProps} />);
      expect(screen.getByRole('button', { name: /บันทึก/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /ยกเลิก/i })).toBeInTheDocument();
    });
  });

  describe('Save Button', () => {
    it('should be disabled when not dirty', () => {
      render(<EditModeHeader {...defaultProps} isDirty={false} />);
      expect(screen.getByRole('button', { name: /บันทึก/i })).toBeDisabled();
    });

    it('should be enabled when dirty', () => {
      render(<EditModeHeader {...defaultProps} isDirty={true} />);
      expect(screen.getByRole('button', { name: /บันทึก/i })).toBeEnabled();
    });

    it('should show loading state when saving', () => {
      render(<EditModeHeader {...defaultProps} isSaving={true} />);
      expect(screen.getByText(/กำลังบันทึก/i)).toBeInTheDocument();
    });

    it('should call onSave when clicked', () => {
      const onSave = vi.fn();
      render(<EditModeHeader {...defaultProps} isDirty={true} onSave={onSave} />);
      fireEvent.click(screen.getByRole('button', { name: /บันทึก/i }));
      expect(onSave).toHaveBeenCalled();
    });

    it('should be disabled when validation errors exist', () => {
      render(<EditModeHeader {...defaultProps} isDirty={true} validationErrors={2} />);
      expect(screen.getByRole('button', { name: /บันทึก/i })).toBeDisabled();
    });
  });

  describe('Cancel Button', () => {
    it('should call onCancel when clicked', () => {
      const onCancel = vi.fn();
      render(<EditModeHeader {...defaultProps} onCancel={onCancel} />);
      fireEvent.click(screen.getByRole('button', { name: /ยกเลิก/i }));
      expect(onCancel).toHaveBeenCalled();
    });

    it('should be disabled when saving', () => {
      render(<EditModeHeader {...defaultProps} isSaving={true} />);
      expect(screen.getByRole('button', { name: /ยกเลิก/i })).toBeDisabled();
    });
  });

  describe('Validation Errors', () => {
    it('should display error count when errors exist', () => {
      render(<EditModeHeader {...defaultProps} validationErrors={3} />);
      expect(screen.getByText(/พบข้อผิดพลาด 3 รายการ/)).toBeInTheDocument();
    });

    it('should not display error text when no errors', () => {
      render(<EditModeHeader {...defaultProps} validationErrors={0} />);
      expect(screen.queryByText(/พบข้อผิดพลาด/)).not.toBeInTheDocument();
    });
  });

  describe('Dirty State', () => {
    it('should show unsaved changes message when dirty', () => {
      render(<EditModeHeader {...defaultProps} isDirty={true} />);
      expect(screen.getByText(/มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก/)).toBeInTheDocument();
    });

    it('should not show message when not dirty', () => {
      render(<EditModeHeader {...defaultProps} isDirty={false} />);
      expect(screen.queryByText(/มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก/)).not.toBeInTheDocument();
    });
  });
});
