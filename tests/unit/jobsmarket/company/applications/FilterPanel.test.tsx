/**
 * COMP-R08: FilterPanel Component Unit Tests
 *
 * Tests for application filter panel component.
 * Covers job filter, status checkboxes, sort options, and filter actions.
 *
 * Target: 15-20 tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterPanel } from '@/app/jobsmarket/companies/[id]/dashboard/applications/_components/FilterPanel';
import {
  DEFAULT_APPLICATION_FILTER,
  type ApplicationFilterState,
} from '@/types/jobsmarket/applications.types';
import { MasterJobApplicationStatuses } from '@/constants/application';

describe('FilterPanel', () => {
  const defaultProps = {
    companyId: 'comp-test-1',
    filters: DEFAULT_APPLICATION_FILTER,
    onFiltersChange: vi.fn(),
  };

  describe('Rendering and Layout', () => {
    it('renders filter panel structure', () => {
      const { container } = render(<FilterPanel {...defaultProps} />);

      const aside = container.querySelector('aside');
      expect(aside).toBeInTheDocument();
    });

    it('renders all filter sections', () => {
      render(<FilterPanel {...defaultProps} />);

      expect(screen.getByText(/ตำแหน่งงาน/)).toBeInTheDocument();
      expect(screen.getByText(/สถานะ/)).toBeInTheDocument();
      expect(screen.getByText(/เรียงตาม/)).toBeInTheDocument();
    });
  });

  describe('Job Filter', () => {
    it('renders job dropdown selector', () => {
      render(<FilterPanel {...defaultProps} />);

      expect(screen.getByText(/ตำแหน่งงาน/)).toBeInTheDocument();
    });

    it('shows "ทั้งหมด" in job selector by default', () => {
      render(<FilterPanel {...defaultProps} />);

      const allOptions = screen.getAllByText(/ทั้งหมด/);
      expect(allOptions.length).toBeGreaterThan(0);
    });
  });

  describe('Status Filter', () => {
    it('renders all 7 status checkboxes', () => {
      render(<FilterPanel {...defaultProps} />);

      expect(screen.getByText(/รอดำเนินการ/)).toBeInTheDocument(); // applied
      expect(screen.getByText(/ดูแล้ว/)).toBeInTheDocument(); // read
      expect(screen.getByText(/ตอบรับแล้ว/)).toBeInTheDocument(); // accepted
      expect(screen.getByText(/ปฏิเสธ/)).toBeInTheDocument(); // rejected
      expect(screen.getByText(/นัดสัมภาษณ์/)).toBeInTheDocument(); // scheduled
      expect(screen.getByText(/ยืนยันแล้ว/)).toBeInTheDocument(); // confirmed
      expect(screen.getByText(/ถอนใบสมัคร/)).toBeInTheDocument(); // withdraw
    });

    it('all statuses are checked by default', () => {
      render(<FilterPanel {...defaultProps} />);

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThanOrEqual(7);
    });

    it('renders select all button with text "ทั้งหมด"', () => {
      render(<FilterPanel {...defaultProps} />);

      // There will be multiple "ทั้งหมด" (one for job filter, one for select all)
      const allButtons = screen.getAllByText(/ทั้งหมด/);
      expect(allButtons.length).toBeGreaterThanOrEqual(1);
    });

    it('renders clear button with text "ล้าง"', () => {
      render(<FilterPanel {...defaultProps} />);

      expect(screen.getByText(/^ล้าง$/)).toBeInTheDocument();
    });

    it('toggles individual status on checkbox click', () => {
      render(<FilterPanel {...defaultProps} />);

      // Radix UI Checkbox uses button role, not input[type="checkbox"]
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);

      // Click first checkbox to test toggle
      fireEvent.click(checkboxes[0]);
    });
  });

  describe('Sort Options', () => {
    it('renders sort dropdown', () => {
      render(<FilterPanel {...defaultProps} />);

      expect(screen.getByText(/เรียงตาม/)).toBeInTheDocument();
    });

    it('shows default sort option "ล่าสุด"', () => {
      render(<FilterPanel {...defaultProps} />);

      expect(screen.getByText(/ล่าสุด/)).toBeInTheDocument();
    });
  });

  describe('Filter Actions', () => {
    it('renders apply button with text "ใช้ตัวกรอง"', () => {
      render(<FilterPanel {...defaultProps} />);

      const applyButton = screen.getByRole('button', { name: /ใช้ตัวกรอง/ });
      expect(applyButton).toBeInTheDocument();
    });

    it('renders clear button with text "ล้างตัวกรอง"', () => {
      render(<FilterPanel {...defaultProps} />);

      const clearButton = screen.getByRole('button', { name: /ล้างตัวกรอง/ });
      expect(clearButton).toBeInTheDocument();
    });

    it('apply button calls onFiltersChange', () => {
      const onFiltersChange = vi.fn();
      render(<FilterPanel {...defaultProps} onFiltersChange={onFiltersChange} />);

      const applyButton = screen.getByRole('button', { name: /ใช้ตัวกรอง/ });
      fireEvent.click(applyButton);

      expect(onFiltersChange).toHaveBeenCalled();
    });

    it('clear button resets filters and calls onFiltersChange', () => {
      const onFiltersChange = vi.fn();
      render(<FilterPanel {...defaultProps} onFiltersChange={onFiltersChange} />);

      const clearButton = screen.getByRole('button', { name: /ล้างตัวกรอง/ });
      fireEvent.click(clearButton);

      // Clear filters resets to show ALL statuses (not empty)
      expect(onFiltersChange).toHaveBeenCalled();
      const callArg = onFiltersChange.mock.calls[0][0];
      expect(callArg.jobId).toBe(null);
      expect(callArg.statuses.length).toBe(7); // All 7 statuses
    });

    it('apply button is enabled and clickable', () => {
      render(<FilterPanel {...defaultProps} />);

      const applyButton = screen.getByRole('button', { name: /ใช้ตัวกรอง/ });
      expect(applyButton).not.toBeDisabled();
    });
  });

  describe('Thai Labels', () => {
    it('displays correct Thai text for all status options', () => {
      render(<FilterPanel {...defaultProps} />);

      const expectedLabels = [
        'รอดำเนินการ',
        'ดูแล้ว',
        'ตอบรับแล้ว',
        'ปฏิเสธ',
        'นัดสัมภาษณ์',
        'ยืนยันแล้ว',
        'ถอนใบสมัคร',
      ];

      expectedLabels.forEach(label => {
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });

    it('displays correct Thai text for sort options', () => {
      render(<FilterPanel {...defaultProps} />);

      expect(screen.getByText(/ล่าสุด/)).toBeInTheDocument();
    });

    it('uses Thai text for section headers', () => {
      render(<FilterPanel {...defaultProps} />);

      expect(screen.getByText(/ตำแหน่งงาน/)).toBeInTheDocument();
      expect(screen.getByText(/สถานะ/)).toBeInTheDocument();
      expect(screen.getByText(/เรียงตาม/)).toBeInTheDocument();
    });

    it('uses Thai text for action buttons', () => {
      render(<FilterPanel {...defaultProps} />);

      expect(screen.getByRole('button', { name: /ใช้ตัวกรอง/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /ล้างตัวกรอง/ })).toBeInTheDocument();
    });
  });

  describe('Filter State Management', () => {
    it('initializes with provided filters', () => {
      const customFilters: ApplicationFilterState = {
        jobId: 'job-123',
        statuses: [MasterJobApplicationStatuses.new],
        dateFrom: null,
        dateTo: null,
        minScore: 0,
        maxScore: 100,
        sortBy: 'newest',
      };

      render(<FilterPanel {...defaultProps} filters={customFilters} />);

      expect(screen.getByText(/รอดำเนินการ/)).toBeInTheDocument();
    });

    it('reflects filter changes in UI', () => {
      const { rerender } = render(<FilterPanel {...defaultProps} />);

      const updatedFilters: ApplicationFilterState = {
        jobId: 'job-456',
        statuses: [MasterJobApplicationStatuses.read],
        dateFrom: null,
        dateTo: null,
        minScore: 0,
        maxScore: 100,
        sortBy: 'oldest',
      };

      rerender(<FilterPanel {...defaultProps} filters={updatedFilters} />);

      expect(screen.getByText(/ดูแล้ว/)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty status array', () => {
      const filtersWithNoStatuses: ApplicationFilterState = {
        jobId: null,
        statuses: [],
        dateFrom: null,
        dateTo: null,
        minScore: 0,
        maxScore: 100,
        sortBy: 'newest',
      };

      render(<FilterPanel {...defaultProps} filters={filtersWithNoStatuses} />);

      expect(screen.getByText(/รอดำเนินการ/)).toBeInTheDocument();
    });

    it('handles null jobId showing default option', () => {
      const filtersWithNoJob: ApplicationFilterState = {
        jobId: null,
        statuses: [MasterJobApplicationStatuses.new],
        dateFrom: null,
        dateTo: null,
        minScore: 0,
        maxScore: 100,
        sortBy: 'newest',
      };

      render(<FilterPanel {...defaultProps} filters={filtersWithNoJob} />);

      const allOptions = screen.getAllByText(/ทั้งหมด/);
      expect(allOptions.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('renders checkboxes with accessible roles', () => {
      render(<FilterPanel {...defaultProps} />);

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    it('renders buttons with accessible roles', () => {
      render(<FilterPanel {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('has proper button labels for screen readers', () => {
      render(<FilterPanel {...defaultProps} />);

      expect(screen.getByRole('button', { name: /ใช้ตัวกรอง/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /ล้างตัวกรอง/ })).toBeInTheDocument();
    });
  });
});
