/**
 * Unit Tests for JobSummaryCard Component
 *
 * Tests job information display in modal header
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { JobSummaryCard } from '@/components/jobsmarket/jobs/JobSummaryCard';
import type { ApplyModalJob } from '@/types/jobsmarket/apply-modal.types';

describe('JobSummaryCard', () => {
  it('displays job title and company name', () => {
    const job: ApplyModalJob = {
      uid: 'test-123',
      title: 'Senior Developer',
      companyName: 'Test Company',
      companyId: 'company-123',
    };

    render(<JobSummaryCard job={job} />);

    expect(screen.getByText('Senior Developer')).toBeInTheDocument();
    expect(screen.getByText('Test Company')).toBeInTheDocument();
  });

  it('displays company logo when provided', () => {
    const job: ApplyModalJob = {
      uid: 'test-123',
      title: 'Senior Developer',
      companyName: 'Test Company',
      companyId: 'company-123',
      companyLogo: '/logo.png',
    };

    render(<JobSummaryCard job={job} />);

    const logo = screen.getByAltText('Test Company');
    expect(logo).toBeInTheDocument();
  });

  it('displays location when provided', () => {
    const job: ApplyModalJob = {
      uid: 'test-123',
      title: 'Senior Developer',
      companyName: 'Test Company',
      companyId: 'company-123',
      workLocationText: 'Bangkok, Thailand',
    };

    render(<JobSummaryCard job={job} />);

    expect(screen.getByText('Bangkok, Thailand')).toBeInTheDocument();
  });

  it('shows fallback icon when no logo provided', () => {
    const job: ApplyModalJob = {
      uid: 'test-123',
      title: 'Senior Developer',
      companyName: 'Test Company',
      companyId: 'company-123',
    };

    const { container } = render(<JobSummaryCard job={job} />);

    // Should have Building2 icon as fallback
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
