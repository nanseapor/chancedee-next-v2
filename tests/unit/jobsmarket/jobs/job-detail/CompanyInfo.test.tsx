import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CompanyInfo } from '@/app/jobsmarket/jobs/[id]/_components/CompanyInfo';

describe('CompanyInfo', () => {
  const mockCompany = {
    uid: 'company-123',
    name: 'Test Company Ltd.',
    logo: 'https://example.com/logo.png',
    industry: 'Technology',
    size: '100-500',
    location: 'Bangkok, Thailand',
    about: 'We are a leading technology company focused on innovation and excellence in software development.',
  };

  describe('Rendering', () => {
    it('should render company name', () => {
      render(<CompanyInfo company={mockCompany} />);
      expect(screen.getByText('Test Company Ltd.')).toBeInTheDocument();
    });

    it('should render section title', () => {
      render(<CompanyInfo company={mockCompany} />);
      expect(screen.getByText('เกี่ยวกับบริษัท')).toBeInTheDocument();
    });

    it('should render company logo when provided', () => {
      render(<CompanyInfo company={mockCompany} />);
      const logo = screen.getByAltText('Test Company Ltd.');
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute('src', expect.stringContaining('logo.png'));
    });

    it('should render fallback icon when logo is not provided', () => {
      const companyWithoutLogo = { ...mockCompany, logo: undefined };
      const { container } = render(<CompanyInfo company={companyWithoutLogo} />);

      // Building2 icon should be present as fallback
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should render industry when provided', () => {
      render(<CompanyInfo company={mockCompany} />);
      expect(screen.getByText('Technology')).toBeInTheDocument();
    });

    it('should render location when provided', () => {
      render(<CompanyInfo company={mockCompany} />);
      expect(screen.getByText('Bangkok, Thailand')).toBeInTheDocument();
    });

    it('should render company size when provided', () => {
      render(<CompanyInfo company={mockCompany} />);
      expect(screen.getByText(/100-500 พนักงาน/i)).toBeInTheDocument();
    });

    it('should render about text when provided', () => {
      render(<CompanyInfo company={mockCompany} />);
      expect(screen.getByText(/We are a leading technology company/i)).toBeInTheDocument();
    });

    it('should render view company link', () => {
      render(<CompanyInfo company={mockCompany} />);
      const link = screen.getByRole('link', { name: /ดูข้อมูลบริษัท/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/companies/company-123');
    });
  });

  describe('Optional fields', () => {
    it('should not render industry section when industry is not provided', () => {
      const companyWithoutIndustry = { ...mockCompany, industry: undefined };
      render(<CompanyInfo company={companyWithoutIndustry} />);
      expect(screen.queryByText('Technology')).not.toBeInTheDocument();
    });

    it('should not render location section when location is not provided', () => {
      const companyWithoutLocation = { ...mockCompany, location: undefined };
      render(<CompanyInfo company={companyWithoutLocation} />);
      expect(screen.queryByText('Bangkok, Thailand')).not.toBeInTheDocument();
    });

    it('should not render size section when size is not provided', () => {
      const companyWithoutSize = { ...mockCompany, size: undefined };
      render(<CompanyInfo company={companyWithoutSize} />);
      expect(screen.queryByText(/พนักงาน/i)).not.toBeInTheDocument();
    });

    it('should not render about section when about is not provided', () => {
      const companyWithoutAbout = { ...mockCompany, about: undefined };
      render(<CompanyInfo company={companyWithoutAbout} />);
      expect(screen.queryByText(/We are a leading/i)).not.toBeInTheDocument();
    });

    it('should render correctly with minimal company data', () => {
      const minimalCompany = {
        uid: 'company-456',
        name: 'Minimal Company',
      };
      render(<CompanyInfo company={minimalCompany} />);

      expect(screen.getByText('Minimal Company')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /ดูข้อมูลบริษัท/i })).toHaveAttribute(
        'href',
        '/companies/company-456'
      );
    });
  });

  describe('Icons', () => {
    it('should show MapPin icon for location', () => {
      const { container } = render(<CompanyInfo company={mockCompany} />);
      const locationText = screen.getByText('Bangkok, Thailand');
      const parentDiv = locationText.closest('div');

      // MapPin icon should be in the same div
      expect(parentDiv?.querySelector('svg')).toBeInTheDocument();
    });

    it('should show Users icon for company size', () => {
      const { container } = render(<CompanyInfo company={mockCompany} />);
      const sizeText = screen.getByText(/100-500 พนักงาน/i);
      const parentDiv = sizeText.closest('div');

      // Users icon should be in the same div
      expect(parentDiv?.querySelector('svg')).toBeInTheDocument();
    });

    it('should show ExternalLink icon in view company link', () => {
      const { container } = render(<CompanyInfo company={mockCompany} />);
      const link = screen.getByRole('link', { name: /ดูข้อมูลบริษัท/i });

      // ExternalLink icon should be in the link
      expect(link.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Text truncation', () => {
    it('should apply line-clamp-3 to about text', () => {
      const { container } = render(<CompanyInfo company={mockCompany} />);
      const aboutText = screen.getByText(/We are a leading technology company/i);

      expect(aboutText).toHaveClass('line-clamp-3');
    });

    it('should handle very long about text', () => {
      const longAbout = 'Lorem ipsum dolor sit amet. '.repeat(50);
      const companyWithLongAbout = { ...mockCompany, about: longAbout };

      render(<CompanyInfo company={companyWithLongAbout} />);
      const aboutText = screen.getByText(new RegExp(longAbout.substring(0, 20)));

      expect(aboutText).toBeInTheDocument();
      expect(aboutText).toHaveClass('line-clamp-3');
    });
  });

  describe('Links and navigation', () => {
    it('should have correct href for company link', () => {
      render(<CompanyInfo company={mockCompany} />);
      const link = screen.getByRole('link', { name: /ดูข้อมูลบริษัท/i });

      expect(link).toHaveAttribute('href', '/companies/company-123');
    });

    it('should use correct uid in company link', () => {
      const companyWithDifferentUid = { ...mockCompany, uid: 'different-uid-789' };
      render(<CompanyInfo company={companyWithDifferentUid} />);

      const link = screen.getByRole('link', { name: /ดูข้อมูลบริษัท/i });
      expect(link).toHaveAttribute('href', '/companies/different-uid-789');
    });
  });

  describe('Styling', () => {
    it('should apply secondary color to company link', () => {
      render(<CompanyInfo company={mockCompany} />);
      const link = screen.getByRole('link', { name: /ดูข้อมูลบริษัท/i });

      expect(link).toHaveClass('text-secondary');
    });

    it('should have hover underline on company link', () => {
      render(<CompanyInfo company={mockCompany} />);
      const link = screen.getByRole('link', { name: /ดูข้อมูลบริษัท/i });

      expect(link).toHaveClass('hover:underline');
    });
  });
});
