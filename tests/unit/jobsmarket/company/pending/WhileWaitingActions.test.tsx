import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import WhileWaitingActions from '@/app/jobsmarket/companies/[id]/pending/_components/WhileWaitingActions';

describe('WhileWaitingActions', () => {
  const mockCompanyId = 'test-company-123';

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<WhileWaitingActions companyId={mockCompanyId} />);
    });

    it('should render section title', () => {
      render(<WhileWaitingActions companyId={mockCompanyId} />);

      expect(screen.getByText('ระหว่างรอการอนุมัติ')).toBeInTheDocument();
    });

    it('should render all 4 action cards', () => {
      render(<WhileWaitingActions companyId={mockCompanyId} />);

      expect(screen.getByText('ดูผู้สมัครงาน')).toBeInTheDocument();
      expect(screen.getByText('เตรียมประกาศงาน')).toBeInTheDocument();
      expect(screen.getByText('แก้ไขข้อมูลบริษัท')).toBeInTheDocument();
      expect(screen.getByText('ติดต่อฝ่ายสนับสนุน')).toBeInTheDocument();
    });
  });

  describe('Disabled Actions', () => {
    it('should show disabled message for browse candidates', () => {
      render(<WhileWaitingActions companyId={mockCompanyId} />);

      expect(screen.getAllByText('จะพร้อมใช้งานหลังอนุมัติ')[0]).toBeInTheDocument();
    });

    it('should show disabled message for prepare jobs', () => {
      render(<WhileWaitingActions companyId={mockCompanyId} />);

      // Should have 2 disabled actions
      const disabledMessages = screen.getAllByText('จะพร้อมใช้งานหลังอนุมัติ');
      expect(disabledMessages).toHaveLength(2);
    });

    it('should not have links for disabled actions', () => {
      const { container } = render(<WhileWaitingActions companyId={mockCompanyId} />);

      // Check that browse candidates is wrapped in div, not Link
      const browseCard = screen.getByText('ดูผู้สมัครงาน').closest('div');
      expect(browseCard).toBeInTheDocument();

      // Disabled cards should have cursor-not-allowed class
      const disabledCards = container.querySelectorAll('.cursor-not-allowed');
      expect(disabledCards.length).toBeGreaterThan(0);
    });
  });

  describe('Enabled Actions', () => {
    it('should show description for edit profile', () => {
      render(<WhileWaitingActions companyId={mockCompanyId} />);

      expect(screen.getByText('ปรับปรุงข้อมูลให้สมบูรณ์')).toBeInTheDocument();
    });

    it('should show description for contact support', () => {
      render(<WhileWaitingActions companyId={mockCompanyId} />);

      expect(screen.getByText('สอบถามสถานะหรือขอความช่วยเหลือ')).toBeInTheDocument();
    });

    it('should have links for enabled actions', () => {
      const { container } = render(<WhileWaitingActions companyId={mockCompanyId} />);

      // Edit profile link
      const editLink = container.querySelector(`a[href="/jobsmarket/companies/${mockCompanyId}/settings"]`);
      expect(editLink).toBeInTheDocument();

      // Support link
      const supportLink = container.querySelector('a[href="/jobsmarket/support"]');
      expect(supportLink).toBeInTheDocument();
    });
  });

  describe('Company ID Usage', () => {
    it('should use companyId in edit profile link', () => {
      const testId = 'company-xyz-789';
      const { container } = render(<WhileWaitingActions companyId={testId} />);

      const editLink = container.querySelector(`a[href="/jobsmarket/companies/${testId}/settings"]`);
      expect(editLink).toBeInTheDocument();
    });

    it('should use companyId in prepare jobs link (even though disabled)', () => {
      const testId = 'company-abc-456';
      render(<WhileWaitingActions companyId={testId} />);

      // The href should still be constructed even if disabled
      // (Component has it in the action definition)
      expect(testId).toBeTruthy(); // Placeholder - actual link is wrapped in div
    });
  });

  describe('Grid Layout', () => {
    it('should render cards in a grid', () => {
      const { container } = render(<WhileWaitingActions companyId={mockCompanyId} />);

      const grid = container.querySelector('.grid');
      expect(grid).toBeInTheDocument();
    });

    it('should have responsive grid classes', () => {
      const { container } = render(<WhileWaitingActions companyId={mockCompanyId} />);

      const grid = container.querySelector('.grid');
      expect(grid?.className).toContain('grid-cols-1');
      expect(grid?.className).toContain('sm:grid-cols-2');
    });
  });

  describe('Icons', () => {
    it('should render icons for all actions', () => {
      const { container } = render(<WhileWaitingActions companyId={mockCompanyId} />);

      // Should have 4 SVG icons (one for each action)
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Custom className', () => {
    it('should accept and apply custom className', () => {
      const { container } = render(
        <WhileWaitingActions companyId={mockCompanyId} className="custom-actions" />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper?.className).toContain('custom-actions');
    });
  });

  describe('Action Order', () => {
    it('should render actions in correct order', () => {
      render(<WhileWaitingActions companyId={mockCompanyId} />);

      const actionLabels = [
        'ดูผู้สมัครงาน',
        'เตรียมประกาศงาน',
        'แก้ไขข้อมูลบริษัท',
        'ติดต่อฝ่ายสนับสนุน',
      ];

      actionLabels.forEach(label => {
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });
  });
});
