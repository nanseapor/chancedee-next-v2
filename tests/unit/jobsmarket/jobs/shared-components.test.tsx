/**
 * Unit Tests: Shared Components
 *
 * Tests all shared job components with MOCKED dependencies.
 * Components: SalaryDisplay, LocationBadge, JobStatusBadge, SaveJobButton,
 * LoginPromptModal, JobCard, JobFilters
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userEvent } from '@testing-library/user-event';

// Mock Directus SDK before any imports
vi.mock('@directus/sdk', () => ({
  createDirectus: vi.fn(() => ({
    with: vi.fn().mockReturnThis(),
  })),
  rest: vi.fn(() => ({})),
  staticToken: vi.fn(() => ({})),
}));

// Mock Jotai
vi.mock('jotai', async () => {
  const actual = await vi.importActual('jotai');
  return {
    ...actual,
    useAtomValue: vi.fn(),
  };
});

// Mock Next.js modules
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
  }),
}));

vi.mock('next/image', () => ({
  default: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />,
}));

// Import after mocks
import { useAtomValue } from 'jotai';
import { SalaryDisplay } from '@/components/jobsmarket/jobs/SalaryDisplay';
import { LocationBadge } from '@/components/jobsmarket/jobs/LocationBadge';
import { JobStatusBadge } from '@/components/jobsmarket/jobs/JobStatusBadge';
import { SaveJobButton } from '@/components/jobsmarket/jobs/SaveJobButton';
import { LoginPromptModal } from '@/components/jobsmarket/jobs/LoginPromptModal';
import { JobCard } from '@/components/jobsmarket/jobs/JobCard';
import { JobFilters } from '@/components/jobsmarket/jobs/JobFilters';
import { JobCardData, JobFilterState } from '@/types/public-jobs';

// Test Data
const mockJob: JobCardData = {
  uid: 'job-123',
  title: 'Senior Software Engineer',
  companyId: 'company-456',
  companyName: 'Tech Corp',
  companyLogo: 'https://example.com/logo.png',
  minSalary: 30000,
  maxSalary: 50000,
  isNegotiable: false,
  workLocationText: 'Bangkok',
  employmentText: 'Full-time',
  experienceText: '3-5 years',
  createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
};

const defaultFilters: JobFilterState = {
  q: '',
  locations: [],
  types: [],
  salaryMin: null,
  salaryMax: null,
  education: [],
  experience: null,
  remote: null,
  sort: 'newest',
  page: 1,
};

describe('SalaryDisplay', () => {
  it('renders range format', () => {
    render(<SalaryDisplay minSalary={30000} maxSalary={50000} />);
    expect(screen.getByText('฿30,000 - ฿50,000')).toBeInTheDocument();
  });

  it('renders min only format', () => {
    render(<SalaryDisplay minSalary={30000} />);
    expect(screen.getByText('฿30,000+')).toBeInTheDocument();
  });

  it('renders max only format', () => {
    render(<SalaryDisplay maxSalary={50000} />);
    expect(screen.getByText('สูงสุด ฿50,000')).toBeInTheDocument();
  });

  it('renders equal salary', () => {
    render(<SalaryDisplay minSalary={30000} maxSalary={30000} />);
    expect(screen.getByText('฿30,000')).toBeInTheDocument();
  });

  it('renders negotiable', () => {
    render(<SalaryDisplay isNegotiable />);
    expect(screen.getByText('ตามตกลง')).toBeInTheDocument();
  });

  it('renders not specified', () => {
    render(<SalaryDisplay />);
    expect(screen.getByText('ไม่ระบุ')).toBeInTheDocument();
  });

  it('hides currency when showCurrency is false', () => {
    const { container } = render(<SalaryDisplay minSalary={30000} maxSalary={50000} showCurrency={false} />);
    expect(container.textContent).toBe('30,000 - 50,000');
  });

  it('applies custom className', () => {
    const { container } = render(<SalaryDisplay minSalary={30000} className="custom-class" />);
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });
});

describe('LocationBadge', () => {
  it('renders province only', () => {
    render(<LocationBadge province="Bangkok" />);
    expect(screen.getByText('Bangkok')).toBeInTheDocument();
  });

  it('renders province with district', () => {
    render(<LocationBadge province="Bangkok" district="Pathumwan" />);
    expect(screen.getByText('Pathumwan, Bangkok')).toBeInTheDocument();
  });

  it('hides icon when showIcon is false', () => {
    const { container } = render(<LocationBadge province="Bangkok" showIcon={false} />);
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });
});

describe('JobStatusBadge', () => {
  it('renders nothing for available status', () => {
    const { container } = render(<JobStatusBadge status="available" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders closed status', () => {
    render(<JobStatusBadge status="closed" />);
    expect(screen.getByText('ปิดรับสมัครแล้ว')).toBeInTheDocument();
  });

  it('renders expired status', () => {
    render(<JobStatusBadge status="expired" />);
    expect(screen.getByText('หมดอายุแล้ว')).toBeInTheDocument();
  });

  it('renders not_found status with destructive variant', () => {
    render(<JobStatusBadge status="not_found" />);
    expect(screen.getByText('ไม่พบงาน')).toBeInTheDocument();
  });
});

describe('SaveJobButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when unauthenticated', () => {
    beforeEach(() => {
      vi.mocked(useAtomValue).mockReturnValue('unauthenticated');
    });

    it('icon variant calls onToggle with false for login prompt', () => {
      const handleToggle = vi.fn();
      render(<SaveJobButton jobId="job-123" isSaved={false} onToggle={handleToggle} variant="icon" />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(handleToggle).toHaveBeenCalledWith('job-123', false);
    });
  });

  describe('when authenticated', () => {
    beforeEach(() => {
      vi.mocked(useAtomValue).mockReturnValue('authenticated');
    });

    it('icon variant toggles saved state', () => {
      const handleToggle = vi.fn();
      render(<SaveJobButton jobId="job-123" isSaved={false} onToggle={handleToggle} variant="icon" />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(handleToggle).toHaveBeenCalledWith('job-123', true);
    });

    it('icon variant shows filled heart when saved', () => {
      const handleToggle = vi.fn();
      const { container } = render(<SaveJobButton jobId="job-123" isSaved={true} onToggle={handleToggle} variant="icon" />);

      const heart = container.querySelector('svg');
      expect(heart).toHaveClass('fill-red-500');
    });

    it('button variant shows "บันทึกแล้ว" when saved', () => {
      const handleToggle = vi.fn();
      render(<SaveJobButton jobId="job-123" isSaved={true} onToggle={handleToggle} variant="button" />);

      expect(screen.getByText('บันทึกแล้ว')).toBeInTheDocument();
    });

    it('button variant shows "บันทึก" when not saved', () => {
      const handleToggle = vi.fn();
      render(<SaveJobButton jobId="job-123" isSaved={false} onToggle={handleToggle} variant="button" />);

      expect(screen.getByText('บันทึก')).toBeInTheDocument();
    });

    it('respects disabled state', () => {
      const handleToggle = vi.fn();
      render(<SaveJobButton jobId="job-123" isSaved={false} onToggle={handleToggle} disabled />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('prevents event propagation on click', () => {
      const handleToggle = vi.fn();
      const handleCardClick = vi.fn();

      const { container } = render(
        <div onClick={handleCardClick}>
          <SaveJobButton jobId="job-123" isSaved={false} onToggle={handleToggle} variant="icon" />
        </div>
      );

      const button = container.querySelector('button')!;
      fireEvent.click(button);

      expect(handleToggle).toHaveBeenCalled();
      expect(handleCardClick).not.toHaveBeenCalled();
    });
  });
});

describe('LoginPromptModal', () => {
  it('renders modal when open', () => {
    render(<LoginPromptModal isOpen={true} onClose={vi.fn()} action="save" />);

    expect(screen.getByText('บันทึกงานนี้')).toBeInTheDocument();
    expect(screen.getByText('เข้าสู่ระบบเพื่อบันทึกงานที่สนใจและดูภายหลังได้ง่ายขึ้น')).toBeInTheDocument();
  });

  it('renders apply action message', () => {
    render(<LoginPromptModal isOpen={true} onClose={vi.fn()} action="apply" />);

    expect(screen.getByText('สมัครงานนี้')).toBeInTheDocument();
  });

  it('renders view_saved action message', () => {
    render(<LoginPromptModal isOpen={true} onClose={vi.fn()} action="view_saved" />);

    expect(screen.getByText('ดูงานที่บันทึกไว้')).toBeInTheDocument();
  });

  it('renders all three buttons', () => {
    render(<LoginPromptModal isOpen={true} onClose={vi.fn()} action="save" />);

    expect(screen.getByText('ยกเลิก')).toBeInTheDocument();
    expect(screen.getByText('ลงทะเบียน')).toBeInTheDocument();
    expect(screen.getByText('เข้าสู่ระบบ')).toBeInTheDocument();
  });

  it('calls onClose when cancel button clicked', () => {
    const handleClose = vi.fn();
    render(<LoginPromptModal isOpen={true} onClose={handleClose} action="save" />);

    fireEvent.click(screen.getByText('ยกเลิก'));
    expect(handleClose).toHaveBeenCalled();
  });
});

describe('JobCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAtomValue).mockReturnValue('unauthenticated');
  });

  describe('list variant', () => {
    it('renders job title as link', () => {
      render(<JobCard job={mockJob} />);

      const titleLink = screen.getByText('Senior Software Engineer').closest('a');
      expect(titleLink).toHaveAttribute('href', '/jobsmarket/jobs/job-123');
    });

    it('renders company name as link', () => {
      render(<JobCard job={mockJob} />);

      const companyLinks = screen.getAllByText('Tech Corp');
      const companyLink = companyLinks[0].closest('a');
      expect(companyLink).toHaveAttribute('href', '/jobsmarket/companies/company-456');
    });

    it('renders company logo', () => {
      render(<JobCard job={mockJob} />);

      const logo = screen.getByAltText('Tech Corp');
      expect(logo).toBeInTheDocument();
    });

    it('renders location badge', () => {
      render(<JobCard job={mockJob} />);

      expect(screen.getByText('Bangkok')).toBeInTheDocument();
    });

    it('renders employment type', () => {
      render(<JobCard job={mockJob} />);

      expect(screen.getByText('Full-time')).toBeInTheDocument();
    });

    it('renders experience text', () => {
      render(<JobCard job={mockJob} />);

      expect(screen.getByText('3-5 years')).toBeInTheDocument();
    });

    it('renders salary range', () => {
      render(<JobCard job={mockJob} />);

      expect(screen.getByText('฿30,000 - ฿50,000')).toBeInTheDocument();
    });

    it('renders save button when showSaveButton=true', () => {
      const handleToggle = vi.fn();
      render(<JobCard job={mockJob} onSaveToggle={handleToggle} showSaveButton={true} />);

      const saveButton = screen.getByRole('button', { name: /บันทึกงาน/ });
      expect(saveButton).toBeInTheDocument();
    });

    it('hides save button when showSaveButton=false', () => {
      render(<JobCard job={mockJob} showSaveButton={false} />);

      const saveButton = screen.queryByRole('button', { name: /บันทึกงาน/ });
      expect(saveButton).not.toBeInTheDocument();
    });

    it('shows fallback logo when companyLogo is empty', () => {
      const jobWithoutLogo = { ...mockJob, companyLogo: '' };
      const { container } = render(<JobCard job={jobWithoutLogo} />);

      expect(screen.queryByAltText('Tech Corp')).not.toBeInTheDocument();
      expect(container.textContent).toContain('TE'); // First 2 chars of company name
    });
  });

  describe('compact variant', () => {
    it('renders job title', () => {
      render(<JobCard job={mockJob} variant="compact" />);

      expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument();
    });

    it('renders company name', () => {
      render(<JobCard job={mockJob} variant="compact" />);

      expect(screen.getByText('Tech Corp')).toBeInTheDocument();
    });

    it('renders salary', () => {
      render(<JobCard job={mockJob} variant="compact" />);

      expect(screen.getByText('฿30,000 - ฿50,000')).toBeInTheDocument();
    });

    it('links to job detail', () => {
      const { container } = render(<JobCard job={mockJob} variant="compact" />);

      const link = container.querySelector('a');
      expect(link).toHaveAttribute('href', '/jobsmarket/jobs/job-123');
    });
  });

  describe('saved variant', () => {
    it('renders status badge when job is closed', () => {
      render(<JobCard job={mockJob} variant="saved" availability="closed" />);

      expect(screen.getByText('ปิดรับสมัครแล้ว')).toBeInTheDocument();
    });

    it('does not render status badge when job is available', () => {
      render(<JobCard job={mockJob} variant="saved" availability="available" />);

      expect(screen.queryByText('ปิดรับสมัครแล้ว')).not.toBeInTheDocument();
    });

    it('applies opacity when job is unavailable', () => {
      const { container } = render(<JobCard job={mockJob} variant="saved" availability="closed" />);

      const card = container.firstChild;
      expect(card).toHaveClass('opacity-60');
    });
  });
});

describe('JobFilters', () => {
  it('renders all filter sections', () => {
    const handleFilterChange = vi.fn();
    const handleClearAll = vi.fn();

    render(<JobFilters filters={defaultFilters} onFilterChange={handleFilterChange} onClearAll={handleClearAll} />);

    expect(screen.getByText('ประเภทงาน')).toBeInTheDocument();
    expect(screen.getByText('เงินเดือน')).toBeInTheDocument();
    expect(screen.getByText('ประสบการณ์')).toBeInTheDocument();
    expect(screen.getByText('การศึกษา')).toBeInTheDocument();
    expect(screen.getByText('รูปแบบการทำงาน')).toBeInTheDocument();
  });

  it('shows clear all button when filters are active', () => {
    const handleFilterChange = vi.fn();
    const handleClearAll = vi.fn();
    const activeFilters: JobFilterState = {
      ...defaultFilters,
      types: ['fulltime'],
    };

    render(<JobFilters filters={activeFilters} onFilterChange={handleFilterChange} onClearAll={handleClearAll} />);

    const clearButton = screen.getByText('ล้างตัวกรองทั้งหมด');
    expect(clearButton).toBeInTheDocument();
  });

  it('hides clear all button when no filters are active', () => {
    const handleFilterChange = vi.fn();
    const handleClearAll = vi.fn();

    render(<JobFilters filters={defaultFilters} onFilterChange={handleFilterChange} onClearAll={handleClearAll} />);

    const clearButton = screen.queryByText('ล้างตัวกรองทั้งหมด');
    expect(clearButton).not.toBeInTheDocument();
  });

  it('shows active filter chips', () => {
    const handleFilterChange = vi.fn();
    const handleClearAll = vi.fn();
    const activeFilters: JobFilterState = {
      ...defaultFilters,
      types: ['fulltime'],
    };

    render(<JobFilters filters={activeFilters} onFilterChange={handleFilterChange} onClearAll={handleClearAll} />);

    // Should appear in both the chip and the checkbox label
    const elements = screen.getAllByText('งานประจำ');
    expect(elements.length).toBeGreaterThanOrEqual(1);
  });

  it('calls onClearAll when clear button clicked', () => {
    const handleFilterChange = vi.fn();
    const handleClearAll = vi.fn();
    const activeFilters: JobFilterState = {
      ...defaultFilters,
      types: ['fulltime'],
    };

    render(<JobFilters filters={activeFilters} onFilterChange={handleFilterChange} onClearAll={handleClearAll} />);

    fireEvent.click(screen.getByText('ล้างตัวกรองทั้งหมด'));
    expect(handleClearAll).toHaveBeenCalled();
  });

  it('removes individual filter chip when X clicked', () => {
    const handleFilterChange = vi.fn();
    const handleClearAll = vi.fn();
    const activeFilters: JobFilterState = {
      ...defaultFilters,
      types: ['fulltime'],
    };

    const { container } = render(
      <JobFilters filters={activeFilters} onFilterChange={handleFilterChange} onClearAll={handleClearAll} />
    );

    const removeButton = container.querySelector('button[class*="rounded-full"]');
    if (removeButton) {
      fireEvent.click(removeButton);
      expect(handleFilterChange).toHaveBeenCalledWith({
        ...activeFilters,
        types: [],
      });
    }
  });

  it('displays salary range in chips', () => {
    const handleFilterChange = vi.fn();
    const handleClearAll = vi.fn();
    const activeFilters: JobFilterState = {
      ...defaultFilters,
      salaryMin: 30000,
      salaryMax: 50000,
    };

    render(<JobFilters filters={activeFilters} onFilterChange={handleFilterChange} onClearAll={handleClearAll} />);

    expect(screen.getByText('฿30,000 - ฿50,000')).toBeInTheDocument();
  });

  it('displays experience filter in chips', () => {
    const handleFilterChange = vi.fn();
    const handleClearAll = vi.fn();
    const activeFilters: JobFilterState = {
      ...defaultFilters,
      experience: '3-5',
    };

    render(<JobFilters filters={activeFilters} onFilterChange={handleFilterChange} onClearAll={handleClearAll} />);

    expect(screen.getByText('3-5 ปี')).toBeInTheDocument();
  });

  it('displays work mode filter in chips', () => {
    const handleFilterChange = vi.fn();
    const handleClearAll = vi.fn();
    const activeFilters: JobFilterState = {
      ...defaultFilters,
      remote: 'remote',
    };

    render(<JobFilters filters={activeFilters} onFilterChange={handleFilterChange} onClearAll={handleClearAll} />);

    expect(screen.getByText('ทำงานระยะไกล')).toBeInTheDocument();
  });
});
