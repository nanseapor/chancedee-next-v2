import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StatusTabs from '@/app/jobsmarket/candidates/[id]/applications/_components/StatusTabs';

const mockCounts = { all: 10, applied: 3, reviewing: 2, interviewing: 2, rejected: 3 };

describe('StatusTabs', () => {
  it('renders all 5 tabs', () => {
    render(<StatusTabs activeTab="all" counts={mockCounts} onChange={() => {}} />);

    expect(screen.getByText('ทั้งหมด')).toBeInTheDocument();
    expect(screen.getByText('สมัครแล้ว')).toBeInTheDocument();
    expect(screen.getByText('กำลังพิจารณา')).toBeInTheDocument();
    expect(screen.getByText('นัดสัมภาษณ์')).toBeInTheDocument();
    expect(screen.getByText('ไม่ผ่าน')).toBeInTheDocument();
  });

  it('displays count badges', () => {
    render(<StatusTabs activeTab="all" counts={mockCounts} onChange={() => {}} />);
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('calls onChange when clicked', () => {
    const onChange = vi.fn();
    render(<StatusTabs activeTab="all" counts={mockCounts} onChange={onChange} />);

    fireEvent.click(screen.getByText('สมัครแล้ว'));
    expect(onChange).toHaveBeenCalledWith('applied');
  });

  it('marks active tab with aria-selected', () => {
    render(<StatusTabs activeTab="applied" counts={mockCounts} onChange={() => {}} />);

    const appliedTab = screen.getByRole('tab', { name: /สมัครแล้ว/i });
    expect(appliedTab).toHaveAttribute('aria-selected', 'true');
  });
});
