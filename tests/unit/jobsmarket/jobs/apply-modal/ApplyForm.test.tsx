/**
 * Unit Tests for ApplyForm Component
 *
 * Tests form validation, field interactions, and submission
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ApplyForm } from '@/components/jobsmarket/jobs/ApplyForm';

describe('ApplyForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Field Rendering', () => {
    it('renders all form fields', () => {
      render(<ApplyForm onSubmit={vi.fn()} onCancel={vi.fn()} isSubmitting={false} />);

      expect(screen.getByLabelText(/เงินเดือนที่คาดหวัง/)).toBeInTheDocument();
      expect(screen.getByLabelText(/ต่อรองได้/)).toBeInTheDocument();
      expect(screen.getByLabelText(/สามารถเริ่มงานได้/)).toBeInTheDocument();
      expect(screen.getByLabelText(/แนะนำตัวเอง/)).toBeInTheDocument();
    });

    it('shows optional labels for non-required fields', () => {
      render(<ApplyForm onSubmit={vi.fn()} onCancel={vi.fn()} isSubmitting={false} />);

      // Salary and headlines are optional - should have 2 instances
      const optionalLabels = screen.getAllByText(/ไม่บังคับ/);
      expect(optionalLabels).toHaveLength(2);
    });
  });

  describe('Validation', () => {
    it('prevents submission with minimum salary below zero', () => {
      const onSubmit = vi.fn();
      render(<ApplyForm onSubmit={onSubmit} onCancel={vi.fn()} isSubmitting={false} />);

      const salaryInput = screen.getByLabelText(/เงินเดือนที่คาดหวัง/);
      // Note: HTML input with min="0" may prevent negative values, but we test the validation logic
      fireEvent.change(salaryInput, { target: { value: '-1000' } });

      fireEvent.click(screen.getByRole('button', { name: /ส่งใบสมัคร/ }));

      // Validation should prevent submission
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('prevents submission with maximum salary exceeding limit', () => {
      const onSubmit = vi.fn();
      render(<ApplyForm onSubmit={onSubmit} onCancel={vi.fn()} isSubmitting={false} />);

      const salaryInput = screen.getByLabelText(/เงินเดือนที่คาดหวัง/);
      fireEvent.change(salaryInput, { target: { value: '10000000' } });

      fireEvent.click(screen.getByRole('button', { name: /ส่งใบสมัคร/ }));

      // Validation should prevent submission
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('validates headlines max length', async () => {
      const onSubmit = vi.fn();
      render(<ApplyForm onSubmit={onSubmit} onCancel={vi.fn()} isSubmitting={false} />);

      const headlinesInput = screen.getByLabelText(/แนะนำตัวเอง/);
      const longText = 'a'.repeat(501); // Exceeds 500 char limit
      fireEvent.change(headlinesInput, { target: { value: longText } });

      fireEvent.click(screen.getByRole('button', { name: /ส่งใบสมัคร/ }));

      await waitFor(() => {
        expect(screen.getByText(/ข้อความยาวเกินไป/)).toBeInTheDocument();
      });

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('allows submission after correcting invalid salary', () => {
      const onSubmit = vi.fn();
      render(<ApplyForm onSubmit={onSubmit} onCancel={vi.fn()} isSubmitting={false} />);

      const salaryInput = screen.getByLabelText(/เงินเดือนที่คาดหวัง/);

      // Enter invalid salary
      fireEvent.change(salaryInput, { target: { value: '-1000' } });
      fireEvent.click(screen.getByRole('button', { name: /ส่งใบสมัคร/ }));

      // Should not submit with invalid salary
      expect(onSubmit).not.toHaveBeenCalled();

      // Fix error by typing valid value
      fireEvent.change(salaryInput, { target: { value: '30000' } });
      fireEvent.click(screen.getByRole('button', { name: /ส่งใบสมัคร/ }));

      // Should now submit successfully
      expect(onSubmit).toHaveBeenCalled();
    });
  });

  describe('Form Submission', () => {
    it('calls onSubmit with complete form data', () => {
      const onSubmit = vi.fn();
      render(<ApplyForm onSubmit={onSubmit} onCancel={vi.fn()} isSubmitting={false} />);

      // Fill salary field
      fireEvent.change(screen.getByLabelText(/เงินเดือนที่คาดหวัง/), {
        target: { value: '50000' }
      });

      // Fill headlines
      fireEvent.change(screen.getByLabelText(/แนะนำตัวเอง/), {
        target: { value: 'I am passionate about development' }
      });

      // Submit
      fireEvent.click(screen.getByRole('button', { name: /ส่งใบสมัคร/ }));

      // Should call onSubmit with form data (isNegotiable defaults to true, overheadDays defaults to 0)
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          expectedSalary: 50000,
          headlines: 'I am passionate about development',
        })
      );
    });

    it('allows null salary when not provided', () => {
      const onSubmit = vi.fn();
      render(<ApplyForm onSubmit={onSubmit} onCancel={vi.fn()} isSubmitting={false} />);

      // Don't fill salary, submit directly
      fireEvent.click(screen.getByRole('button', { name: /ส่งใบสมัคร/ }));

      // Should call onSubmit with null salary
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          expectedSalary: null,
        })
      );
    });

    it('disables submit button while submitting', () => {
      render(<ApplyForm onSubmit={vi.fn()} onCancel={vi.fn()} isSubmitting={true} />);

      const submitButton = screen.getByRole('button', { name: /กำลังส่ง/ });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Cancel Action', () => {
    it('calls onCancel when cancel button clicked', () => {
      const onCancel = vi.fn();
      render(<ApplyForm onSubmit={vi.fn()} onCancel={onCancel} isSubmitting={false} />);

      fireEvent.click(screen.getByRole('button', { name: /ยกเลิก/ }));

      expect(onCancel).toHaveBeenCalled();
    });

    it('disables cancel button while submitting', () => {
      render(<ApplyForm onSubmit={vi.fn()} onCancel={vi.fn()} isSubmitting={true} />);

      const cancelButton = screen.getByRole('button', { name: /ยกเลิก/ });
      expect(cancelButton).toBeDisabled();
    });
  });

  describe('Character Counter', () => {
    it('shows character count for headlines', () => {
      render(<ApplyForm onSubmit={vi.fn()} onCancel={vi.fn()} isSubmitting={false} />);

      // Initial count
      expect(screen.getByText(/0\/500/)).toBeInTheDocument();

      // Type some text
      fireEvent.change(screen.getByLabelText(/แนะนำตัวเอง/), {
        target: { value: 'Hello' }
      });

      expect(screen.getByText(/5\/500/)).toBeInTheDocument();
    });
  });
});
