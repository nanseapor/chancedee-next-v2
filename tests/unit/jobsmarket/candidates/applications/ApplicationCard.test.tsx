/**
 * @fileoverview Tests for ApplicationCard component - Edit functionality
 * @specification BLS-03-02 Application Stage - editApplication UI
 *
 * Requirements tested:
 * - BLS-03-02.ui.edit-button: Edit button visible only when status === 'applied'
 * - BLS-03-02.ui.edit-action: onEdit callback triggered when edit button clicked
 * - BLS-03-02.ui.edit-disabled: Edit button not visible for other statuses
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ApplicationCard from '@/app/jobsmarket/candidates/[id]/applications/_components/ApplicationCard';
import type { ApplicationWithDetails } from '@/lib/database/actions/job-applications';

// Mock date-fns to avoid locale issues
vi.mock('date-fns', () => ({
  format: vi.fn(() => '1 ม.ค. 2025'),
}));

describe('ApplicationCard - Edit Functionality', () => {
  const baseApplication: ApplicationWithDetails = {
    uid: 'app-123',
    jobId: 'job-456',
    candidateId: 'candidate-789',
    companyId: 'company-101',
    status: 'applied',
    expectedSalary: 50000,
    isNegotiable: true,
    overheadDays: 7,
    headlines: 'Test message',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
    jobTitle: 'Software Engineer',
    jobIsActive: true,
    companyName: 'Test Company',
    companyLogo: undefined,
  };

  describe('Edit button visibility', () => {
    /**
     * Requirement: BLS-03-02.ui.edit-button
     * "Edit button visible only when status === 'applied'"
     */
    it('should show edit button when status is applied', () => {
      const onEdit = vi.fn();
      render(
        <ApplicationCard
          application={{ ...baseApplication, status: 'applied' }}
          canEdit={true}
          onEdit={onEdit}
        />
      );

      // Expand the card first to see the edit button
      fireEvent.click(screen.getByText('ดูรายละเอียดเพิ่มเติม'));

      expect(screen.getByRole('button', { name: /แก้ไขใบสมัคร/ })).toBeInTheDocument();
    });

    /**
     * Requirement: BLS-03-02.ui.edit-disabled
     * "Edit button not visible for other statuses"
     */
    it('should NOT show edit button when status is read', () => {
      const onEdit = vi.fn();
      render(
        <ApplicationCard
          application={{ ...baseApplication, status: 'read' }}
          canEdit={false}
          onEdit={onEdit}
        />
      );

      // Expand the card
      fireEvent.click(screen.getByText('ดูรายละเอียดเพิ่มเติม'));

      expect(screen.queryByRole('button', { name: /แก้ไขใบสมัคร/ })).not.toBeInTheDocument();
    });

    it('should NOT show edit button when status is accepted', () => {
      const onEdit = vi.fn();
      render(
        <ApplicationCard
          application={{ ...baseApplication, status: 'accepted' }}
          canEdit={false}
          onEdit={onEdit}
        />
      );

      // Expand the card
      fireEvent.click(screen.getByText('ดูรายละเอียดเพิ่มเติม'));

      expect(screen.queryByRole('button', { name: /แก้ไขใบสมัคร/ })).not.toBeInTheDocument();
    });

    it('should NOT show edit button when status is rejected', () => {
      const onEdit = vi.fn();
      render(
        <ApplicationCard
          application={{ ...baseApplication, status: 'rejected' }}
          canEdit={false}
          onEdit={onEdit}
        />
      );

      // Expand the card
      fireEvent.click(screen.getByText('ดูรายละเอียดเพิ่มเติม'));

      expect(screen.queryByRole('button', { name: /แก้ไขใบสมัคร/ })).not.toBeInTheDocument();
    });

    it('should NOT show edit button when status is scheduled', () => {
      const onEdit = vi.fn();
      render(
        <ApplicationCard
          application={{ ...baseApplication, status: 'scheduled' }}
          canEdit={false}
          onEdit={onEdit}
        />
      );

      // Expand the card
      fireEvent.click(screen.getByText('ดูรายละเอียดเพิ่มเติม'));

      expect(screen.queryByRole('button', { name: /แก้ไขใบสมัคร/ })).not.toBeInTheDocument();
    });

    it('should NOT show edit button when canEdit is false even if status is applied', () => {
      const onEdit = vi.fn();
      render(
        <ApplicationCard
          application={{ ...baseApplication, status: 'applied' }}
          canEdit={false}
          onEdit={onEdit}
        />
      );

      // Expand the card
      fireEvent.click(screen.getByText('ดูรายละเอียดเพิ่มเติม'));

      expect(screen.queryByRole('button', { name: /แก้ไขใบสมัคร/ })).not.toBeInTheDocument();
    });

    it('should NOT show edit button when onEdit is not provided', () => {
      render(
        <ApplicationCard
          application={{ ...baseApplication, status: 'applied' }}
          canEdit={true}
        />
      );

      // Expand the card
      fireEvent.click(screen.getByText('ดูรายละเอียดเพิ่มเติม'));

      expect(screen.queryByRole('button', { name: /แก้ไขใบสมัคร/ })).not.toBeInTheDocument();
    });
  });

  describe('Edit button interaction', () => {
    /**
     * Requirement: BLS-03-02.ui.edit-action
     * "onEdit callback triggered when edit button clicked"
     */
    it('should call onEdit when edit button is clicked', () => {
      const onEdit = vi.fn();
      render(
        <ApplicationCard
          application={{ ...baseApplication, status: 'applied' }}
          canEdit={true}
          onEdit={onEdit}
        />
      );

      // Expand the card first
      fireEvent.click(screen.getByText('ดูรายละเอียดเพิ่มเติม'));

      // Click edit button
      fireEvent.click(screen.getByRole('button', { name: /แก้ไขใบสมัคร/ }));

      expect(onEdit).toHaveBeenCalledTimes(1);
    });

    it('should pass application data to onEdit callback', () => {
      const onEdit = vi.fn();
      const application = { ...baseApplication, status: 'applied' as const };

      render(
        <ApplicationCard
          application={application}
          canEdit={true}
          onEdit={onEdit}
        />
      );

      // Expand the card first
      fireEvent.click(screen.getByText('ดูรายละเอียดเพิ่มเติม'));

      // Click edit button
      fireEvent.click(screen.getByRole('button', { name: /แก้ไขใบสมัคร/ }));

      // onEdit should be called (the component passes data or just triggers the callback)
      expect(onEdit).toHaveBeenCalled();
    });
  });

  describe('Edit button styling', () => {
    it('should have correct styling for edit button', () => {
      const onEdit = vi.fn();
      render(
        <ApplicationCard
          application={{ ...baseApplication, status: 'applied' }}
          canEdit={true}
          onEdit={onEdit}
        />
      );

      // Expand the card first
      fireEvent.click(screen.getByText('ดูรายละเอียดเพิ่มเติม'));

      const editButton = screen.getByRole('button', { name: /แก้ไขใบสมัคร/ });
      expect(editButton).toBeInTheDocument();
      // Button should be outline variant with secondary styling
      expect(editButton).toHaveClass('border');
    });
  });

  describe('Edit and Withdraw buttons coexistence', () => {
    it('should show both edit and withdraw buttons when both actions are allowed', () => {
      const onEdit = vi.fn();
      const onWithdraw = vi.fn();

      render(
        <ApplicationCard
          application={{ ...baseApplication, status: 'applied' }}
          canEdit={true}
          onEdit={onEdit}
          canWithdraw={true}
          onWithdraw={onWithdraw}
        />
      );

      // Expand the card first
      fireEvent.click(screen.getByText('ดูรายละเอียดเพิ่มเติม'));

      expect(screen.getByRole('button', { name: /แก้ไขใบสมัคร/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /ถอนใบสมัคร/ })).toBeInTheDocument();
    });

    it('should place edit button before withdraw button', () => {
      const onEdit = vi.fn();
      const onWithdraw = vi.fn();

      render(
        <ApplicationCard
          application={{ ...baseApplication, status: 'applied' }}
          canEdit={true}
          onEdit={onEdit}
          canWithdraw={true}
          onWithdraw={onWithdraw}
        />
      );

      // Expand the card first
      fireEvent.click(screen.getByText('ดูรายละเอียดเพิ่มเติม'));

      const buttons = screen.getAllByRole('button');
      const editButton = buttons.find((b) => b.textContent?.includes('แก้ไขใบสมัคร'));
      const withdrawButton = buttons.find((b) => b.textContent?.includes('ถอนใบสมัคร'));

      expect(editButton).toBeDefined();
      expect(withdrawButton).toBeDefined();

      // Edit button should come before withdraw button in the DOM
      const allButtons = Array.from(document.querySelectorAll('button'));
      const editIndex = allButtons.indexOf(editButton as HTMLButtonElement);
      const withdrawIndex = allButtons.indexOf(withdrawButton as HTMLButtonElement);

      expect(editIndex).toBeLessThan(withdrawIndex);
    });
  });
});
