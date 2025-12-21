import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StatusTabs } from '@/components/jobsmarket/company/jobs/StatusTabs';
import type { StatusCounts } from '@/types/jobsmarket/jobs-list.types';

describe('StatusTabs', () => {
  const mockOnTabChange = vi.fn();
  const mockCounts: StatusCounts = {
    total: 25,
    active: 10,
    draft: 5,
    paused: 7,
    closed: 3,
  };

  it('renders all 5 tabs with correct labels', () => {
    render(
      <StatusTabs
        activeStatus="all"
        counts={mockCounts}
        onTabChange={mockOnTabChange}
        isLoading={false}
      />
    );

    expect(screen.getByRole('tab', { name: /ทั้งหมด/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /กำลังเปิดรับ/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /ร่าง/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /หยุดชั่วคราว/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /ปิดแล้ว/i })).toBeInTheDocument();
  });

  it('shows count badges on each tab', () => {
    render(
      <StatusTabs
        activeStatus="all"
        counts={mockCounts}
        onTabChange={mockOnTabChange}
        isLoading={false}
      />
    );

    expect(screen.getByText('25')).toBeInTheDocument(); // total
    expect(screen.getByText('10')).toBeInTheDocument(); // active
    expect(screen.getByText('5')).toBeInTheDocument();  // draft
    expect(screen.getByText('7')).toBeInTheDocument();  // paused
    expect(screen.getByText('3')).toBeInTheDocument();  // closed
  });

  it('highlights active tab based on activeStatus prop', () => {
    render(
      <StatusTabs
        activeStatus="active"
        counts={mockCounts}
        onTabChange={mockOnTabChange}
        isLoading={false}
      />
    );

    const activeTab = screen.getByRole('tab', { name: /กำลังเปิดรับ/i });
    expect(activeTab).toHaveAttribute('aria-selected', 'true');
  });

  it('clicking tab calls onTabChange with correct status', () => {
    render(
      <StatusTabs
        activeStatus="all"
        counts={mockCounts}
        onTabChange={mockOnTabChange}
        isLoading={false}
      />
    );

    const draftTab = screen.getByRole('tab', { name: /ร่าง/i });
    fireEvent.click(draftTab);

    expect(mockOnTabChange).toHaveBeenCalledWith('draft');
  });

  it('disables all tabs when isLoading is true', () => {
    render(
      <StatusTabs
        activeStatus="all"
        counts={mockCounts}
        onTabChange={mockOnTabChange}
        isLoading={true}
      />
    );

    const tabs = screen.getAllByRole('tab');
    tabs.forEach(tab => {
      expect(tab).toBeDisabled();
    });
  });
});
