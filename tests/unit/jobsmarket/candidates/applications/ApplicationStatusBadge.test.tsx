import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ApplicationStatusBadge, { STATUS_CONFIG } from
  '@/app/jobsmarket/candidates/[id]/applications/_components/ApplicationStatusBadge';

describe('ApplicationStatusBadge', () => {
  const statusLabels: Record<string, string> = {
    applied: 'ส่งใบสมัครแล้ว',
    read: 'บริษัทดูแล้ว',
    accepted: 'ผ่านการคัดเลือก',
    rejected: 'ไม่ผ่านการคัดเลือก',
    scheduled: 'นัดสัมภาษณ์แล้ว',
    confirmed: 'ยืนยันสัมภาษณ์แล้ว',
    declined: 'ปฏิเสธสัมภาษณ์',
    withdraw: 'ถอนใบสมัครแล้ว',
  };

  Object.entries(statusLabels).forEach(([status, label]) => {
    it(`renders "${label}" for ${status} status`, () => {
      render(<ApplicationStatusBadge status={status} />);
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('renders status text for unknown status', () => {
    render(<ApplicationStatusBadge status="unknown" />);
    expect(screen.getByText('unknown')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<ApplicationStatusBadge status="applied" className="custom" />);
    expect(screen.getByText('ส่งใบสมัครแล้ว')).toHaveClass('custom');
  });

  it('has correct colors in config', () => {
    expect(STATUS_CONFIG.applied.className).toContain('blue');
    expect(STATUS_CONFIG.accepted.className).toContain('green');
    expect(STATUS_CONFIG.scheduled.className).toContain('orange');
    expect(STATUS_CONFIG.rejected.className).toContain('red');
  });
});
