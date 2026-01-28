import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RejectionReasonCard from '@/app/jobsmarket/companies/[id]/pending/_components/RejectionReasonCard';

describe('RejectionReasonCard', () => {
  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<RejectionReasonCard />);
    });

    it('should render card header', () => {
      render(<RejectionReasonCard />);

      expect(screen.getByText('เหตุผลที่ไม่อนุมัติ')).toBeInTheDocument();
    });

    it('should render alert title', () => {
      render(<RejectionReasonCard />);

      expect(screen.getByText('ไม่ผ่านการอนุมัติ')).toBeInTheDocument();
    });
  });

  describe('Rejection Reason', () => {
    it('should display default reason when none provided', () => {
      render(<RejectionReasonCard />);

      expect(
        screen.getByText('ข้อมูลบริษัทไม่ครบถ้วนหรือไม่ถูกต้อง กรุณาตรวจสอบและแก้ไขข้อมูล')
      ).toBeInTheDocument();
    });

    it('should display custom reason when provided', () => {
      const customReason = 'ไม่มีเอกสารยืนยันตัวตน กรุณาอัปโหลดสำเนาบัตรประชาชน';

      render(<RejectionReasonCard reason={customReason} />);

      expect(screen.getByText(customReason)).toBeInTheDocument();
    });

    it('should not display default reason when custom reason provided', () => {
      const customReason = 'เหตุผลที่กำหนดเอง';

      render(<RejectionReasonCard reason={customReason} />);

      expect(
        screen.queryByText('ข้อมูลบริษัทไม่ครบถ้วนหรือไม่ถูกต้อง กรุณาตรวจสอบและแก้ไขข้อมูล')
      ).not.toBeInTheDocument();
    });
  });

  describe('Rejected Date', () => {
    it('should display formatted date when rejectedAt is provided as Date', () => {
      const testDate = new Date('2025-12-20T14:30:00');

      render(<RejectionReasonCard rejectedAt={testDate} />);

      expect(screen.getByText(/แจ้งผลเมื่อ/)).toBeInTheDocument();
    });

    it('should display formatted date when rejectedAt is provided as timestamp', () => {
      const timestamp = new Date('2025-12-20T14:30:00').getTime();

      render(<RejectionReasonCard rejectedAt={timestamp} />);

      expect(screen.getByText(/แจ้งผลเมื่อ/)).toBeInTheDocument();
    });

    it('should not display date when rejectedAt is not provided', () => {
      render(<RejectionReasonCard />);

      expect(screen.queryByText(/แจ้งผลเมื่อ/)).not.toBeInTheDocument();
    });

    it('should format date in Thai locale with time', () => {
      const testDate = new Date('2025-12-20T14:30:00');

      render(<RejectionReasonCard rejectedAt={testDate} />);

      // Should include time (14:30)
      const dateElement = screen.getByText(/แจ้งผลเมื่อ/);
      expect(dateElement.textContent).toMatch(/14:30/);
    });
  });

  describe('Alert Styling', () => {
    it('should render destructive alert variant', () => {
      const { container } = render(<RejectionReasonCard />);

      // Alert with destructive variant should have specific classes
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeInTheDocument();
    });

    it('should have red color scheme', () => {
      const { container } = render(<RejectionReasonCard />);

      const alert = container.querySelector('.bg-red-50');
      expect(alert).toBeInTheDocument();
    });
  });

  describe('Icon Display', () => {
    it('should render AlertCircle icon', () => {
      const { container } = render(<RejectionReasonCard />);

      // Icon should be present
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Custom className', () => {
    it('should accept and apply custom className', () => {
      const { container } = render(<RejectionReasonCard className="custom-rejection" />);

      const card = container.firstChild as HTMLElement;
      expect(card?.className).toContain('custom-rejection');
    });
  });

  describe('Complete Rendering', () => {
    it('should render all elements when all props provided', () => {
      const testProps = {
        reason: 'เหตุผลการปฏิเสธ',
        rejectedAt: new Date('2025-12-20T14:30:00'),
        className: 'test-class',
      };

      render(<RejectionReasonCard {...testProps} />);

      expect(screen.getByText('เหตุผลที่ไม่อนุมัติ')).toBeInTheDocument();
      expect(screen.getByText('ไม่ผ่านการอนุมัติ')).toBeInTheDocument();
      expect(screen.getByText(testProps.reason)).toBeInTheDocument();
      expect(screen.getByText(/แจ้งผลเมื่อ/)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string reason', () => {
      render(<RejectionReasonCard reason="" />);

      // Should show default reason
      expect(
        screen.getByText('ข้อมูลบริษัทไม่ครบถ้วนหรือไม่ถูกต้อง กรุณาตรวจสอบและแก้ไขข้อมูล')
      ).toBeInTheDocument();
    });

    it('should handle very long reason text', () => {
      const longReason = 'เหตุผล'.repeat(100);

      expect(() => {
        render(<RejectionReasonCard reason={longReason} />);
      }).not.toThrow();
    });

    it('should handle invalid date gracefully', () => {
      const invalidDate = new Date('invalid');

      expect(() => {
        render(<RejectionReasonCard rejectedAt={invalidDate} />);
      }).not.toThrow();
    });
  });
});
