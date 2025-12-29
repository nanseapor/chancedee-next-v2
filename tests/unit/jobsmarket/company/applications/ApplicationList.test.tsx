/**
 * COMP-R08: ApplicationList Component Unit Tests
 *
 * Tests for application list container component.
 * Covers loading, empty, error, and data states.
 *
 * Target: 10-15 tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ApplicationList } from '@/app/jobsmarket/companies/[id]/dashboard/applications/_components/ApplicationList';
import { mockApplicationList } from './__fixtures__/applications';

describe('ApplicationList', () => {
  const defaultProps = {
    applications: mockApplicationList,
    isLoading: false,
    isError: false,
    selectedApplicationId: null,
    onSelectApplication: vi.fn(),
  };

  describe('Loading State', () => {
    it('renders loading skeletons when isLoading is true', () => {
      const { container } = render(
        <ApplicationList {...defaultProps} isLoading={true} />
      );

      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('renders 8 skeleton cards in loading state', () => {
      const { container } = render(
        <ApplicationList {...defaultProps} isLoading={true} />
      );

      // Each skeleton card has 4 skeleton elements (avatar, 3 lines)
      const skeletons = container.querySelectorAll('[class*="h-"]');
      expect(skeletons.length).toBeGreaterThan(8);
    });

    it('shows fixed width container during loading', () => {
      const { container } = render(
        <ApplicationList {...defaultProps} isLoading={true} />
      );

      const listContainer = container.querySelector('.w-\\[350px\\]');
      expect(listContainer).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('shows error message when isError is true', () => {
      render(<ApplicationList {...defaultProps} isError={true} />);

      expect(screen.getByText(/เกิดข้อผิดพลาดในการโหลดข้อมูล/)).toBeInTheDocument();
    });

    it('shows retry instruction in error state', () => {
      render(<ApplicationList {...defaultProps} isError={true} />);

      expect(screen.getByText(/กรุณาลองใหม่อีกครั้ง/)).toBeInTheDocument();
    });

    it('shows error icon in error state', () => {
      const { container } = render(
        <ApplicationList {...defaultProps} isError={true} />
      );

      const errorIcon = container.querySelector('svg');
      expect(errorIcon).toBeInTheDocument();
      expect(errorIcon).toHaveClass('text-red-300');
    });

    it('shows list title even in error state', () => {
      render(<ApplicationList {...defaultProps} isError={true} />);

      expect(screen.getByText(/ใบสมัครงาน/)).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('shows empty message when applications is empty array', () => {
      render(<ApplicationList {...defaultProps} applications={[]} />);

      expect(screen.getByText(/ยังไม่มีใบสมัครงาน/)).toBeInTheDocument();
    });

    it('shows empty message when applications is undefined', () => {
      render(<ApplicationList {...defaultProps} applications={undefined} />);

      expect(screen.getByText(/ยังไม่มีใบสมัครงาน/)).toBeInTheDocument();
    });

    it('shows empty icon in empty state', () => {
      const { container } = render(
        <ApplicationList {...defaultProps} applications={[]} />
      );

      const emptyIcon = container.querySelector('svg');
      expect(emptyIcon).toBeInTheDocument();
      expect(emptyIcon).toHaveClass('text-gray-300');
    });

    it('shows count as "0 รายการ" in empty state', () => {
      render(<ApplicationList {...defaultProps} applications={[]} />);

      expect(screen.getByText(/0 รายการ/)).toBeInTheDocument();
    });

    it('shows descriptive message in empty state', () => {
      render(<ApplicationList {...defaultProps} applications={[]} />);

      expect(
        screen.getByText(/เมื่อมีผู้สมัครงานตำแหน่งของคุณ ใบสมัครจะแสดงที่นี่/)
      ).toBeInTheDocument();
    });
  });

  describe('Data State', () => {
    it('renders list header with title', () => {
      render(<ApplicationList {...defaultProps} />);

      expect(screen.getByText(/ใบสมัครงาน/)).toBeInTheDocument();
    });

    it('shows correct count of applications', () => {
      render(<ApplicationList {...defaultProps} />);

      expect(screen.getByText(`${mockApplicationList.length} รายการ`)).toBeInTheDocument();
    });

    it('renders all application cards', () => {
      render(<ApplicationList {...defaultProps} />);

      // Check correct number of cards rendered (using button role)
      const cards = screen.getAllByRole('button');
      expect(cards.length).toBe(mockApplicationList.length);
    });

    it('passes isSelected correctly to cards', () => {
      const selectedId = mockApplicationList[0].uid;
      const { container } = render(
        <ApplicationList {...defaultProps} selectedApplicationId={selectedId} />
      );

      // Selected card should have bg-secondary-50 class
      const selectedCards = container.querySelectorAll('.bg-secondary-50');
      expect(selectedCards.length).toBeGreaterThan(0);
    });

    it('calls onSelectApplication when card is clicked', () => {
      const onSelect = vi.fn();
      render(<ApplicationList {...defaultProps} onSelectApplication={onSelect} />);

      // Click first application card
      const cards = screen.getAllByRole('button');
      fireEvent.click(cards[0]);

      expect(onSelect).toHaveBeenCalledWith(mockApplicationList[0].uid);
    });

    it('has sticky header in data state', () => {
      const { container } = render(<ApplicationList {...defaultProps} />);

      const header = container.querySelector('.sticky');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass('top-0', 'z-10');
    });

    it('has scrollable container', () => {
      const { container } = render(<ApplicationList {...defaultProps} />);

      const scrollContainer = container.querySelector('.overflow-y-auto');
      expect(scrollContainer).toBeInTheDocument();
    });
  });

  describe('Layout and Styling', () => {
    it('maintains fixed 350px width across all states', () => {
      const { container: loading } = render(
        <ApplicationList {...defaultProps} isLoading={true} />
      );
      const { container: error } = render(
        <ApplicationList {...defaultProps} isError={true} />
      );
      const { container: empty } = render(
        <ApplicationList {...defaultProps} applications={[]} />
      );
      const { container: data } = render(<ApplicationList {...defaultProps} />);

      expect(loading.querySelector('.w-\\[350px\\]')).toBeInTheDocument();
      expect(error.querySelector('.w-\\[350px\\]')).toBeInTheDocument();
      expect(empty.querySelector('.w-\\[350px\\]')).toBeInTheDocument();
      expect(data.querySelector('.w-\\[350px\\]')).toBeInTheDocument();
    });

    it('has right border for list separation', () => {
      const { container } = render(<ApplicationList {...defaultProps} />);

      const listContainer = container.querySelector('.border-r');
      expect(listContainer).toBeInTheDocument();
      expect(listContainer).toHaveClass('border-gray-200');
    });

    it('uses white background', () => {
      const { container } = render(<ApplicationList {...defaultProps} />);

      const listContainer = container.querySelector('.bg-white');
      expect(listContainer).toBeInTheDocument();
    });
  });
});
