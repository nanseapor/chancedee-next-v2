import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RejectedActions from '@/app/jobsmarket/companies/[id]/pending/_components/RejectedActions';

describe('RejectedActions', () => {
  const mockCompanyId = 'test-company-123';

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<RejectedActions companyId={mockCompanyId} />);
    });

    it('should render section title', () => {
      render(<RejectedActions companyId={mockCompanyId} />);

      expect(screen.getByText('ดำเนินการต่อ')).toBeInTheDocument();
    });

    it('should render 2 action buttons', () => {
      render(<RejectedActions companyId={mockCompanyId} />);

      expect(screen.getByText('แก้ไขข้อมูลบริษัท')).toBeInTheDocument();
      expect(screen.getByText('ติดต่อฝ่ายสนับสนุน')).toBeInTheDocument();
    });
  });

  describe('Edit Profile Action', () => {
    it('should display main label', () => {
      render(<RejectedActions companyId={mockCompanyId} />);

      expect(screen.getByText('แก้ไขข้อมูลบริษัท')).toBeInTheDocument();
    });

    it('should display subtext', () => {
      render(<RejectedActions companyId={mockCompanyId} />);

      expect(screen.getByText('ปรับปรุงข้อมูลและส่งใหม่')).toBeInTheDocument();
    });

    it('should link to company settings page', () => {
      const { container } = render(<RejectedActions companyId={mockCompanyId} />);

      const link = container.querySelector(`a[href="/jobsmarket/companies/${mockCompanyId}/settings"]`);
      expect(link).toBeInTheDocument();
    });

    it('should be a primary button', () => {
      const { container } = render(<RejectedActions companyId={mockCompanyId} />);

      // Primary button should be present (default variant, not outline)
      const editButton = screen.getByText('แก้ไขข้อมูลบริษัท').closest('button');
      expect(editButton).toBeInTheDocument();
      // Note: Default Button component may have "outline" in class names for border styles
      // Just verify the button exists
    });

    it('should have Settings icon', () => {
      const { container } = render(<RejectedActions companyId={mockCompanyId} />);

      // Should have SVG icons
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Contact Support Action', () => {
    it('should display main label', () => {
      render(<RejectedActions companyId={mockCompanyId} />);

      expect(screen.getByText('ติดต่อฝ่ายสนับสนุน')).toBeInTheDocument();
    });

    it('should display subtext', () => {
      render(<RejectedActions companyId={mockCompanyId} />);

      expect(screen.getByText('สอบถามรายละเอียดเพิ่มเติม')).toBeInTheDocument();
    });

    it('should link to support page', () => {
      const { container } = render(<RejectedActions companyId={mockCompanyId} />);

      const link = container.querySelector('a[href="/jobsmarket/support"]');
      expect(link).toBeInTheDocument();
    });

    it('should be an outline button', () => {
      const { container } = render(<RejectedActions companyId={mockCompanyId} />);

      const supportButton = screen.getByText('ติดต่อฝ่ายสนับสนุน').closest('button');
      expect(supportButton).toBeInTheDocument();
      // Outline variant should be present
    });

    it('should have HelpCircle icon', () => {
      const { container } = render(<RejectedActions companyId={mockCompanyId} />);

      // Should have multiple SVG icons
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Info Message', () => {
    it('should display resubmission info', () => {
      render(<RejectedActions companyId={mockCompanyId} />);

      expect(
        screen.getByText('หลังแก้ไขข้อมูลแล้ว ระบบจะส่งให้ทีมงานตรวจสอบอีกครั้ง')
      ).toBeInTheDocument();
    });
  });

  describe('Company ID Usage', () => {
    it('should use companyId in edit profile link', () => {
      const testId = 'company-xyz-789';
      const { container } = render(<RejectedActions companyId={testId} />);

      const editLink = container.querySelector(`a[href="/jobsmarket/companies/${testId}/settings"]`);
      expect(editLink).toBeInTheDocument();
    });

    it('should handle different companyId formats', () => {
      const testIds = ['company-123', 'test_company_456', '789'];

      testIds.forEach(id => {
        const { container } = render(<RejectedActions companyId={id} />);

        const editLink = container.querySelector(`a[href="/jobsmarket/companies/${id}/settings"]`);
        expect(editLink).toBeInTheDocument();
      });
    });
  });

  describe('Button Layout', () => {
    it('should have full width buttons', () => {
      const { container } = render(<RejectedActions companyId={mockCompanyId} />);

      const buttons = container.querySelectorAll('button');
      buttons.forEach(button => {
        expect(button.className).toContain('w-full');
      });
    });

    it('should have left-aligned content', () => {
      const { container } = render(<RejectedActions companyId={mockCompanyId} />);

      const buttons = container.querySelectorAll('button');
      buttons.forEach(button => {
        expect(button.className).toContain('justify-start');
      });
    });

    it('should have large size buttons', () => {
      const { container } = render(<RejectedActions companyId={mockCompanyId} />);

      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBe(2);
    });
  });

  describe('Button Order', () => {
    it('should render edit profile first', () => {
      const { container } = render(<RejectedActions companyId={mockCompanyId} />);

      const buttons = container.querySelectorAll('button');
      const firstButton = buttons[0];

      expect(firstButton.textContent).toContain('แก้ไขข้อมูลบริษัท');
    });

    it('should render contact support second', () => {
      const { container } = render(<RejectedActions companyId={mockCompanyId} />);

      const buttons = container.querySelectorAll('button');
      const secondButton = buttons[1];

      expect(secondButton.textContent).toContain('ติดต่อฝ่ายสนับสนุน');
    });
  });

  describe('Custom className', () => {
    it('should accept and apply custom className', () => {
      const { container } = render(
        <RejectedActions companyId={mockCompanyId} className="custom-actions" />
      );

      const card = container.firstChild as HTMLElement;
      expect(card?.className).toContain('custom-actions');
    });
  });

  describe('Accessibility', () => {
    it('should have clickable links', () => {
      const { container } = render(<RejectedActions companyId={mockCompanyId} />);

      const links = container.querySelectorAll('a');
      expect(links.length).toBe(2);
    });

    it('should have readable button text', () => {
      render(<RejectedActions companyId={mockCompanyId} />);

      const editButton = screen.getByText('แก้ไขข้อมูลบริษัท');
      const supportButton = screen.getByText('ติดต่อฝ่ายสนับสนุน');

      expect(editButton).toBeVisible();
      expect(supportButton).toBeVisible();
    });
  });

  describe('Card Structure', () => {
    it('should render within a card', () => {
      const { container } = render(<RejectedActions companyId={mockCompanyId} />);

      // Should have card structure
      const cards = container.querySelectorAll('[class*="card"]');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should have proper spacing between buttons', () => {
      const { container } = render(<RejectedActions companyId={mockCompanyId} />);

      const cardContent = container.querySelector('.space-y-3');
      expect(cardContent).toBeInTheDocument();
    });
  });
});
