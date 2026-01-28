/**
 * COMP-R08 Phase 4: ActionBar Component Unit Tests
 *
 * Tests for Accept/Reject action buttons.
 * Covers button visibility rules, loading states, and click handlers.
 *
 * Target: 12 tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActionBar } from '@/app/jobsmarket/companies/[id]/dashboard/applications/_components/ActionBar';
import { mockApplication, mockApplicationRead, mockApplicationAccepted, mockApplicationRejected } from './__fixtures__/applications';
import { MasterJobApplicationStatuses } from '@/constants/application';

describe('ActionBar', () => {
  const defaultProps = {
    application: mockApplication,
    onAccept: vi.fn(),
    onReject: vi.fn(),
    isAccepting: false,
    isRejecting: false,
    canManageApplications: true,
  };

  describe('Button Visibility - Status Rules', () => {
    it('shows both Accept and Reject buttons for applied status', () => {
      render(<ActionBar {...defaultProps} />);

      expect(screen.getByRole('button', { name: /ยอมรับ/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /ปฏิเสธ/ })).toBeInTheDocument();
    });

    it('shows both Accept and Reject buttons for read status', () => {
      render(<ActionBar {...defaultProps} application={mockApplicationRead} />);

      expect(screen.getByRole('button', { name: /ยอมรับ/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /ปฏิเสธ/ })).toBeInTheDocument();
    });

    it('hides Accept button but shows Reject button for accepted status', () => {
      render(<ActionBar {...defaultProps} application={mockApplicationAccepted} />);

      expect(screen.queryByRole('button', { name: /ยอมรับ/ })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /ปฏิเสธ/ })).toBeInTheDocument();
    });

    it('hides both buttons for rejected status', () => {
      render(<ActionBar {...defaultProps} application={mockApplicationRejected} />);

      expect(screen.queryByRole('button', { name: /ยอมรับ/ })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /ปฏิเสธ/ })).not.toBeInTheDocument();
    });

    it('hides both buttons for scheduled status', () => {
      const scheduledApp = { ...mockApplication, status: MasterJobApplicationStatuses.scheduled };
      render(<ActionBar {...defaultProps} application={scheduledApp} />);

      expect(screen.queryByRole('button', { name: /ยอมรับ/ })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /ปฏิเสธ/ })).not.toBeInTheDocument();
    });
  });

  describe('Permission Checks', () => {
    it('hides both buttons when canManageApplications is false', () => {
      render(<ActionBar {...defaultProps} canManageApplications={false} />);

      expect(screen.queryByRole('button', { name: /ยอมรับ/ })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /ปฏิเสธ/ })).not.toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('disables Accept button and shows loading text when isAccepting is true', () => {
      render(<ActionBar {...defaultProps} isAccepting={true} />);

      const acceptButton = screen.getByRole('button', { name: /กำลังดำเนินการ/ });
      expect(acceptButton).toBeDisabled();
    });

    it('disables Reject button when isRejecting is true', () => {
      render(<ActionBar {...defaultProps} isRejecting={true} />);

      const rejectButton = screen.getByRole('button', { name: /ปฏิเสธ/ });
      expect(rejectButton).toBeDisabled();
    });

    it('disables both buttons when either is loading', () => {
      render(<ActionBar {...defaultProps} isAccepting={true} />);

      const acceptButton = screen.getByRole('button', { name: /กำลังดำเนินการ/ });
      const rejectButton = screen.getByRole('button', { name: /ปฏิเสธ/ });

      expect(acceptButton).toBeDisabled();
      expect(rejectButton).toBeDisabled();
    });
  });

  describe('Click Handlers', () => {
    it('calls onAccept when Accept button is clicked', () => {
      const onAccept = vi.fn();
      render(<ActionBar {...defaultProps} onAccept={onAccept} />);

      const acceptButton = screen.getByRole('button', { name: /ยอมรับ/ });
      fireEvent.click(acceptButton);

      expect(onAccept).toHaveBeenCalledTimes(1);
    });

    it('calls onReject when Reject button is clicked', () => {
      const onReject = vi.fn();
      render(<ActionBar {...defaultProps} onReject={onReject} />);

      const rejectButton = screen.getByRole('button', { name: /ปฏิเสธ/ });
      fireEvent.click(rejectButton);

      expect(onReject).toHaveBeenCalledTimes(1);
    });

    it('does not call handlers when buttons are disabled', () => {
      const onAccept = vi.fn();
      const onReject = vi.fn();
      render(<ActionBar {...defaultProps} onAccept={onAccept} onReject={onReject} isAccepting={true} />);

      const acceptButton = screen.getByRole('button', { name: /กำลังดำเนินการ/ });
      const rejectButton = screen.getByRole('button', { name: /ปฏิเสธ/ });

      fireEvent.click(acceptButton);
      fireEvent.click(rejectButton);

      expect(onAccept).not.toHaveBeenCalled();
      expect(onReject).not.toHaveBeenCalled();
    });
  });
});
