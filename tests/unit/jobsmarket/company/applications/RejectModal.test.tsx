/**
 * COMP-R08 Phase 4: RejectModal Component Unit Tests
 *
 * Tests for reject confirmation modal with feedback textarea.
 * Covers modal visibility, form input, and submission.
 *
 * Target: 10 tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RejectModal } from '@/app/jobsmarket/companies/[id]/dashboard/applications/_components/RejectModal';

describe('RejectModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    isSubmitting: false,
    candidateName: 'สมชาย ใจดี',
    jobTitle: 'Full Stack Developer',
  };

  describe('Modal Visibility', () => {
    it('renders modal when isOpen is true', () => {
      render(<RejectModal {...defaultProps} />);

      // Check for title using heading role (AlertDialogTitle renders as h2)
      expect(screen.getByRole('heading', { name: /ปฏิเสธใบสมัคร/ })).toBeInTheDocument();
    });

    it('does not render modal when isOpen is false', () => {
      render(<RejectModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByText(/ปฏิเสธใบสมัคร/)).not.toBeInTheDocument();
    });
  });

  describe('Modal Content', () => {
    it('displays candidate name in confirmation message', () => {
      render(<RejectModal {...defaultProps} />);

      expect(screen.getByText(new RegExp(defaultProps.candidateName))).toBeInTheDocument();
    });

    it('displays job title in confirmation message', () => {
      render(<RejectModal {...defaultProps} />);

      expect(screen.getByText(new RegExp(defaultProps.jobTitle))).toBeInTheDocument();
    });

    it('renders feedback textarea with Thai label', () => {
      render(<RejectModal {...defaultProps} />);

      expect(screen.getByText(/ข้อความถึงผู้สมัคร/)).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('shows optional label for feedback field', () => {
      render(<RejectModal {...defaultProps} />);

      expect(screen.getByText(/ไม่บังคับ/)).toBeInTheDocument();
    });
  });

  describe('User Interaction', () => {
    it('allows entering feedback text', () => {
      render(<RejectModal {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'ขอบคุณที่สมัคร แต่ไม่ผ่านการพิจารณาครั้งนี้' } });

      expect(textarea).toHaveValue('ขอบคุณที่สมัคร แต่ไม่ผ่านการพิจารณาครั้งนี้');
    });

    it('calls onConfirm with feedback when confirm button clicked', async () => {
      const onConfirm = vi.fn();
      render(<RejectModal {...defaultProps} onConfirm={onConfirm} />);

      const textarea = screen.getByRole('textbox');
      const feedback = 'ขอบคุณสำหรับการสมัคร';

      fireEvent.change(textarea, { target: { value: feedback } });

      const confirmButton = screen.getByRole('button', { name: /ยืนยันการปฏิเสธ/ });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(onConfirm).toHaveBeenCalledWith(feedback);
      });
    });

    it('calls onConfirm with empty string when no feedback entered', async () => {
      const onConfirm = vi.fn();
      render(<RejectModal {...defaultProps} onConfirm={onConfirm} />);

      const confirmButton = screen.getByRole('button', { name: /ยืนยันการปฏิเสธ/ });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(onConfirm).toHaveBeenCalledWith('');
      });
    });

    it('calls onClose when cancel button clicked', () => {
      const onClose = vi.fn();
      render(<RejectModal {...defaultProps} onClose={onClose} />);

      const cancelButton = screen.getByRole('button', { name: /ยกเลิก/ });
      fireEvent.click(cancelButton);

      // onClose is called when cancel button is clicked
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('disables confirm button when isSubmitting is true', () => {
      render(<RejectModal {...defaultProps} isSubmitting={true} />);

      // When isSubmitting is true, button text changes to "กำลังดำเนินการ..."
      const confirmButton = screen.getByRole('button', { name: /กำลังดำเนินการ/ });
      expect(confirmButton).toBeDisabled();
    });

    it('disables cancel button when isSubmitting is true', () => {
      render(<RejectModal {...defaultProps} isSubmitting={true} />);

      const cancelButton = screen.getByRole('button', { name: /ยกเลิก/ });
      expect(cancelButton).toBeDisabled();
    });

    it('disables textarea when isSubmitting is true', () => {
      render(<RejectModal {...defaultProps} isSubmitting={true} />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeDisabled();
    });
  });
});
