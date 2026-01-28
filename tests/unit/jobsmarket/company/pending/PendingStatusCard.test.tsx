import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PendingStatusCard from '@/app/jobsmarket/companies/[id]/pending/_components/PendingStatusCard';

describe('PendingStatusCard', () => {
  const mockCompanyId = 'test-company-123';

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<PendingStatusCard companyId={mockCompanyId} />);
    });

    it('should render status header with title', () => {
      render(<PendingStatusCard companyId={mockCompanyId} />);

      expect(screen.getByText('รอการอนุมัติ')).toBeInTheDocument();
    });

    it('should render description text', () => {
      render(<PendingStatusCard companyId={mockCompanyId} />);

      expect(screen.getByText('บริษัทของคุณอยู่ระหว่างการตรวจสอบ')).toBeInTheDocument();
    });

    it('should render timeline information', () => {
      render(<PendingStatusCard companyId={mockCompanyId} />);

      expect(screen.getByText(/1-3 วันทำการ/)).toBeInTheDocument();
    });
  });

  describe('Company Name', () => {
    it('should display company name when provided', () => {
      render(
        <PendingStatusCard
          companyId={mockCompanyId}
          companyName="บริษัท ทดสอบ จำกัด"
        />
      );

      expect(screen.getByText('บริษัท ทดสอบ จำกัด')).toBeInTheDocument();
    });

    it('should not crash when company name is not provided', () => {
      render(<PendingStatusCard companyId={mockCompanyId} />);

      // Should still render the status title
      expect(screen.getByText('รอการอนุมัติ')).toBeInTheDocument();
    });
  });

  describe('Submitted Date', () => {
    it('should display formatted date when submittedAt is provided as Date', () => {
      const testDate = new Date('2025-12-20');

      render(
        <PendingStatusCard
          companyId={mockCompanyId}
          submittedAt={testDate}
        />
      );

      // Check for "ส่งข้อมูลเมื่อ" text
      expect(screen.getByText(/ส่งข้อมูลเมื่อ/)).toBeInTheDocument();
    });

    it('should display formatted date when submittedAt is provided as timestamp', () => {
      const timestamp = Date.now();

      render(
        <PendingStatusCard
          companyId={mockCompanyId}
          submittedAt={timestamp}
        />
      );

      expect(screen.getByText(/ส่งข้อมูลเมื่อ/)).toBeInTheDocument();
    });

    it('should not display date when submittedAt is not provided', () => {
      render(<PendingStatusCard companyId={mockCompanyId} />);

      expect(screen.queryByText(/ส่งข้อมูลเมื่อ/)).not.toBeInTheDocument();
    });
  });

  describe('Child Components', () => {
    it('should render ApprovalStepper section', () => {
      render(<PendingStatusCard companyId={mockCompanyId} />);

      expect(screen.getByText('ขั้นตอนการอนุมัติ')).toBeInTheDocument();
    });

    it('should render WhileWaitingActions section', () => {
      render(<PendingStatusCard companyId={mockCompanyId} />);

      expect(screen.getByText('ระหว่างรอการอนุมัติ')).toBeInTheDocument();
    });

    it('should pass companyId to WhileWaitingActions', () => {
      const testId = 'company-xyz-999';
      const { container } = render(<PendingStatusCard companyId={testId} />);

      // Check that edit profile link uses the correct companyId
      const editLink = container.querySelector(`a[href="/jobsmarket/companies/${testId}/settings"]`);
      expect(editLink).toBeInTheDocument();
    });
  });

  describe('Layout Structure', () => {
    it('should have max-width container', () => {
      const { container } = render(<PendingStatusCard companyId={mockCompanyId} />);

      const wrapper = container.querySelector('.max-w-2xl');
      expect(wrapper).toBeInTheDocument();
    });

    it('should have proper spacing between sections', () => {
      const { container } = render(<PendingStatusCard companyId={mockCompanyId} />);

      const wrapper = container.querySelector('.space-y-6');
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe('Icon Display', () => {
    it('should render clock icon', () => {
      const { container } = render(<PendingStatusCard companyId={mockCompanyId} />);

      // Clock icon should be present
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should have yellow background for icon', () => {
      const { container } = render(<PendingStatusCard companyId={mockCompanyId} />);

      const iconWrapper = container.querySelector('.bg-yellow-100');
      expect(iconWrapper).toBeInTheDocument();
    });
  });

  describe('Cards', () => {
    it('should render multiple cards', () => {
      const { container } = render(<PendingStatusCard companyId={mockCompanyId} />);

      // Should have status header card, approval progress card, and actions section
      const cards = container.querySelectorAll('[class*="card"]');
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  describe('Integration', () => {
    it('should render complete pending view with all elements', () => {
      render(
        <PendingStatusCard
          companyId={mockCompanyId}
          companyName="บริษัท ทดสอบ จำกัด"
          submittedAt={new Date('2025-12-20')}
        />
      );

      // Header elements
      expect(screen.getByText('รอการอนุมัติ')).toBeInTheDocument();
      expect(screen.getByText('บริษัท ทดสอบ จำกัด')).toBeInTheDocument();

      // Stepper
      expect(screen.getByText('ขั้นตอนการอนุมัติ')).toBeInTheDocument();

      // Actions
      expect(screen.getByText('ระหว่างรอการอนุมัติ')).toBeInTheDocument();

      // Date
      expect(screen.getByText(/ส่งข้อมูลเมื่อ/)).toBeInTheDocument();
    });
  });
});
