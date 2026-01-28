import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useApplicationCounts } from '@/hooks/jobsmarket/candidates/use-application-counts';

const createApp = (status: string, uid: string) => ({
  uid,
  status,
  jobId: 'j1',
  candidateId: 'c1',
  companyId: 'co1',
  jobTitle: 'Test',
  jobIsActive: true,
  companyName: 'Company',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  interview: null,
});

describe('useApplicationCounts', () => {
  it('returns zeros for undefined', () => {
    const { result } = renderHook(() => useApplicationCounts(undefined));
    expect(result.current).toEqual({
      all: 0, applied: 0, reviewing: 0, interviewing: 0, rejected: 0,
    });
  });

  it('counts applied + read under applied', () => {
    const apps = [createApp('applied', '1'), createApp('read', '2')] as any;
    const { result } = renderHook(() => useApplicationCounts(apps));
    expect(result.current.applied).toBe(2);
  });

  it('counts accepted under reviewing', () => {
    const apps = [createApp('accepted', '1')] as any;
    const { result } = renderHook(() => useApplicationCounts(apps));
    expect(result.current.reviewing).toBe(1);
  });

  it('counts scheduled + confirmed under interviewing', () => {
    const apps = [createApp('scheduled', '1'), createApp('confirmed', '2')] as any;
    const { result } = renderHook(() => useApplicationCounts(apps));
    expect(result.current.interviewing).toBe(2);
  });

  it('counts rejected + declined under rejected', () => {
    const apps = [createApp('rejected', '1'), createApp('declined', '2')] as any;
    const { result } = renderHook(() => useApplicationCounts(apps));
    expect(result.current.rejected).toBe(2);
  });

  it('counts withdraw only in all', () => {
    const apps = [createApp('withdraw', '1')] as any;
    const { result } = renderHook(() => useApplicationCounts(apps));
    expect(result.current.all).toBe(1);
    expect(result.current.applied).toBe(0);
  });
});
