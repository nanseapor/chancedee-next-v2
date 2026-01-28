import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { JobListSkeleton } from '@/components/jobsmarket/company/jobs/JobListSkeleton';

describe('JobListSkeleton', () => {
  it('renders 5 placeholder rows', () => {
    const { container } = render(<JobListSkeleton />);

    // Count skeleton rows (assuming each row has a test-id or specific class)
    const skeletonRows = container.querySelectorAll('[data-testid="skeleton-row"]');
    expect(skeletonRows.length).toBe(5);
  });
});
