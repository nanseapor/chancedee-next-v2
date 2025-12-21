import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RejectedStatusCard from '@/app/jobsmarket/companies/[id]/pending/_components/RejectedStatusCard';

describe('RejectedStatusCard', () => {
  const mockCompanyId = 'test-company-123';

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<RejectedStatusCard companyId={mockCompanyId} />);
    });

    it('should render status header with title', () => {
      render(<RejectedStatusCard companyId={mockCompanyId} />);

      // Text appears twice (header + alert title), so use getAllByText
      const elements = screen.getAllByText('ไม่ผ่านการอนุมัติ');
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should render apology message', () => {
      render(<RejectedStatusCard companyId={mockCompanyId} />);

      expect(screen.getByText('ขออภัย บริษัทของคุณไม่ผ่านการอนุมัติในครั้งนี้')).toBeInTheDocument();
    });

    it('should render instruction message', () => {
      render(<RejectedStatusCard companyId={mockCompanyId} />);

      expect(screen.getByText('กรุณาตรวจสอบเหตุผลด้านล่างและดำเนินการแก้ไข')).toBeInTheDocument();
    });
  });

  describe('Company Name', () => {
    it('should display company name when provided', () => {
      render(
        <RejectedStatusCard
          companyId={mockCompanyId}
          companyName="บริษัท ทดสอบ จำกัด"
        />
      );

      expect(screen.getByText('บริษัท ทดสอบ จำกัด')).toBeInTheDocument();
    });

    it('should not crash when company name is not provided', () => {
      render(<RejectedStatusCard companyId={mockCompanyId} />);

      // Should still render the status title (appears twice)
      const elements = screen.getAllByText('ไม่ผ่านการอนุมัติ');
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  describe('Rejection Reason', () => {
    it('should render RejectionReasonCard with custom reason', () => {
      const customReason = 'เอกสารไม่ครบถ้วน กรุณาอัปโหลดเอกสารเพิ่มเติม';

      render(
        <RejectedStatusCard
          companyId={mockCompanyId}
          rejectionReason={customReason}
        />
      );

      expect(screen.getByText(customReason)).toBeInTheDocument();
    });

    it('should render default reason when none provided', () => {
      render(<RejectedStatusCard companyId={mockCompanyId} />);

      // Should show default reason from RejectionReasonCard
      expect(
        screen.getByText('ข้อมูลบริษัทไม่ครบถ้วนหรือไม่ถูกต้อง กรุณาตรวจสอบและแก้ไขข้อมูล')
      ).toBeInTheDocument();
    });
  });

  describe('Rejected Date', () => {
    it('should pass rejectedAt to RejectionReasonCard', () => {
      const testDate = new Date('2025-12-20T14:30:00');

      render(
        <RejectedStatusCard
          companyId={mockCompanyId}
          rejectedAt={testDate}
        />
      );

      expect(screen.getByText(/แจ้งผลเมื่อ/)).toBeInTheDocument();
    });

    it('should not show date when rejectedAt is not provided', () => {
      render(<RejectedStatusCard companyId={mockCompanyId} />);

      expect(screen.queryByText(/แจ้งผลเมื่อ/)).not.toBeInTheDocument();
    });
  });

  describe('Child Components', () => {
    it('should render RejectionReasonCard', () => {
      render(<RejectedStatusCard companyId={mockCompanyId} />);

      expect(screen.getByText('เหตุผลที่ไม่อนุมัติ')).toBeInTheDocument();
    });

    it('should render RejectedActions', () => {
      render(<RejectedStatusCard companyId={mockCompanyId} />);

      expect(screen.getByText('ดำเนินการต่อ')).toBeInTheDocument();
      expect(screen.getByText('แก้ไขข้อมูลบริษัท')).toBeInTheDocument();
      expect(screen.getByText('ติดต่อฝ่ายสนับสนุน')).toBeInTheDocument();
    });

    it('should pass companyId to RejectedActions', () => {
      const testId = 'company-xyz-999';
      const { container } = render(<RejectedStatusCard companyId={testId} />);

      // Check that edit profile link uses the correct companyId
      const editLink = container.querySelector(`a[href="/jobsmarket/companies/${testId}/settings"]`);
      expect(editLink).toBeInTheDocument();
    });
  });

  describe('Layout Structure', () => {
    it('should have max-width container', () => {
      const { container } = render(<RejectedStatusCard companyId={mockCompanyId} />);

      const wrapper = container.querySelector('.max-w-2xl');
      expect(wrapper).toBeInTheDocument();
    });

    it('should have proper spacing between sections', () => {
      const { container } = render(<RejectedStatusCard companyId={mockCompanyId} />);

      const wrapper = container.querySelector('.space-y-6');
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe('Icon Display', () => {
    it('should render X circle icon', () => {
      const { container } = render(<RejectedStatusCard companyId={mockCompanyId} />);

      // X icon should be present
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should have red background for icon', () => {
      const { container } = render(<RejectedStatusCard companyId={mockCompanyId} />);

      const iconWrapper = container.querySelector('.bg-red-100');
      expect(iconWrapper).toBeInTheDocument();
    });
  });

  describe('Header Styling', () => {
    it('should have red title text', () => {
      const { container } = render(<RejectedStatusCard companyId={mockCompanyId} />);

      // Text appears twice, find the one with text-red-700 class
      const titles = screen.getAllByText('ไม่ผ่านการอนุมัติ');
      const hasRedTitle = titles.some(title => title.className.includes('text-red-700'));
      expect(hasRedTitle).toBe(true);
    });
  });

  describe('Cards', () => {
    it('should render multiple cards', () => {
      const { container } = render(<RejectedStatusCard companyId={mockCompanyId} />);

      // Should have status header card, rejection reason card, and actions card
      const cards = container.querySelectorAll('[class*="card"]');
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  describe('Integration', () => {
    it('should render complete rejected view with all elements', () => {
      render(
        <RejectedStatusCard
          companyId={mockCompanyId}
          companyName="บริษัท ทดสอบ จำกัด"
          rejectionReason="เอกสารไม่ครบถ้วน"
          rejectedAt={new Date('2025-12-20T14:30:00')}
        />
      );

      // Header elements (text appears twice)
      const titles = screen.getAllByText('ไม่ผ่านการอนุมัติ');
      expect(titles.length).toBeGreaterThan(0);
      expect(screen.getByText('บริษัท ทดสอบ จำกัด')).toBeInTheDocument();

      // Rejection reason
      expect(screen.getByText('เหตุผลที่ไม่อนุมัติ')).toBeInTheDocument();
      expect(screen.getByText('เอกสารไม่ครบถ้วน')).toBeInTheDocument();

      // Actions
      expect(screen.getByText('ดำเนินการต่อ')).toBeInTheDocument();

      // Date
      expect(screen.getByText(/แจ้งผลเมื่อ/)).toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    it('should handle all optional props', () => {
      const fullProps = {
        companyId: 'test-123',
        companyName: 'Test Company',
        rejectionReason: 'Test reason',
        rejectedAt: new Date(),
      };

      expect(() => {
        render(<RejectedStatusCard {...fullProps} />);
      }).not.toThrow();
    });

    it('should handle minimal props', () => {
      expect(() => {
        render(<RejectedStatusCard companyId={mockCompanyId} />);
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty company name', () => {
      render(
        <RejectedStatusCard
          companyId={mockCompanyId}
          companyName=""
        />
      );

      // Should still render without crashing (text appears twice)
      const titles = screen.getAllByText('ไม่ผ่านการอนุมัติ');
      expect(titles.length).toBeGreaterThan(0);
    });

    it('should handle very long rejection reason', () => {
      const longReason = 'เหตุผล'.repeat(50);

      expect(() => {
        render(
          <RejectedStatusCard
            companyId={mockCompanyId}
            rejectionReason={longReason}
          />
        );
      }).not.toThrow();
    });

    it('should handle invalid date', () => {
      const invalidDate = new Date('invalid');

      expect(() => {
        render(
          <RejectedStatusCard
            companyId={mockCompanyId}
            rejectedAt={invalidDate}
          />
        );
      }).not.toThrow();
    });
  });
});
