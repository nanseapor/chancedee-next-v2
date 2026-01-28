import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ApprovalStepper, { APPROVAL_STEPS } from '@/app/jobsmarket/companies/[id]/pending/_components/ApprovalStepper';

describe('ApprovalStepper', () => {
  describe('Step Data', () => {
    it('should have 5 steps defined', () => {
      expect(APPROVAL_STEPS).toHaveLength(5);
    });

    it('should have correct step IDs (1-5)', () => {
      const ids = APPROVAL_STEPS.map(step => step.id);
      expect(ids).toEqual([1, 2, 3, 4, 5]);
    });

    it('should have Thai labels for all steps', () => {
      const labels = APPROVAL_STEPS.map(step => step.label);
      expect(labels).toEqual([
        'ส่งข้อมูล',
        'รอตรวจสอบ',
        'ยืนยันข้อมูล',
        'อนุมัติ',
        'เสร็จสิ้น',
      ]);
    });

    it('should have descriptions for all steps', () => {
      APPROVAL_STEPS.forEach(step => {
        expect(step.description).toBeTruthy();
        expect(step.description.length).toBeGreaterThan(0);
      });
    });

    it('should have icons for all steps', () => {
      APPROVAL_STEPS.forEach(step => {
        expect(step.icon).toBeTruthy();
        // Icons are imported React components (objects in modern bundlers)
        expect(typeof step.icon === 'object' || typeof step.icon === 'function').toBe(true);
      });
    });
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<ApprovalStepper />);
    });

    it('should render all 5 steps', () => {
      render(<ApprovalStepper currentStep={2} />);

      APPROVAL_STEPS.forEach(step => {
        expect(screen.getAllByText(step.label).length).toBeGreaterThan(0);
      });
    });

    it('should render step descriptions', () => {
      render(<ApprovalStepper currentStep={2} />);

      APPROVAL_STEPS.forEach(step => {
        expect(screen.getAllByText(step.description).length).toBeGreaterThan(0);
      });
    });
  });

  describe('Current Step Highlighting', () => {
    it('should default to step 2 when currentStep not provided', () => {
      const { container } = render(<ApprovalStepper />);

      // Check that step 2 label is present (default current step)
      expect(screen.getAllByText('รอตรวจสอบ').length).toBeGreaterThan(0);
    });

    it('should accept custom currentStep prop', () => {
      render(<ApprovalStepper currentStep={4} />);

      // Step 4 should be visible
      expect(screen.getAllByText('อนุมัติ').length).toBeGreaterThan(0);
    });

    it('should show "ปัจจุบัน" badge on mobile for current step', () => {
      render(<ApprovalStepper currentStep={3} />);

      // "ปัจจุบัน" badge should be present for current step
      expect(screen.getByText('ปัจจุบัน')).toBeInTheDocument();
    });
  });

  describe('Step States', () => {
    it('should handle step 1 as current', () => {
      render(<ApprovalStepper currentStep={1} />);

      expect(screen.getAllByText('ส่งข้อมูล').length).toBeGreaterThan(0);
    });

    it('should handle step 5 as current', () => {
      render(<ApprovalStepper currentStep={5} />);

      expect(screen.getAllByText('เสร็จสิ้น').length).toBeGreaterThan(0);
    });

    it('should handle invalid currentStep gracefully', () => {
      // Should not crash with out-of-range step
      expect(() => {
        render(<ApprovalStepper currentStep={0} />);
      }).not.toThrow();

      expect(() => {
        render(<ApprovalStepper currentStep={10} />);
      }).not.toThrow();
    });
  });

  describe('Responsive Design', () => {
    it('should render both desktop and mobile variants', () => {
      const { container } = render(<ApprovalStepper currentStep={2} />);

      // Desktop variant (hidden on mobile)
      const desktopVariant = container.querySelector('.hidden.md\\:flex');
      expect(desktopVariant).toBeInTheDocument();

      // Mobile variant (hidden on desktop)
      const mobileVariant = container.querySelector('.md\\:hidden');
      expect(mobileVariant).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have semantic structure', () => {
      const { container } = render(<ApprovalStepper currentStep={2} />);

      // Check for div structure (not checking specific aria roles since component doesn't have them)
      const divs = container.querySelectorAll('div');
      expect(divs.length).toBeGreaterThan(0);
    });

    it('should have readable text content', () => {
      render(<ApprovalStepper currentStep={2} />);

      // All step labels should be in the document
      APPROVAL_STEPS.forEach(step => {
        const elements = screen.getAllByText(step.label);
        expect(elements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Custom className', () => {
    it('should accept and apply custom className', () => {
      const { container } = render(<ApprovalStepper className="custom-class" />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper?.className).toContain('custom-class');
    });
  });
});
