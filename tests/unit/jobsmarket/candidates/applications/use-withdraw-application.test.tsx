import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import React from 'react';

// Mock dependencies
vi.mock('@/lib/database/actions/job-applications', () => ({
  webJobApplicationWithdraw: vi.fn(),
}));

vi.mock('@/hooks/use-toast-notification', () => ({
  useToast: () => ({
    addToast: vi.fn(),
  }),
}));

import { webJobApplicationWithdraw } from '@/lib/database/actions/job-applications';
import { useWithdrawApplication } from '@/hooks/jobsmarket/candidates/use-withdraw-application';

const mockWebJobApplicationWithdraw = vi.mocked(webJobApplicationWithdraw);

// Test wrapper
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map() }}>
    {children}
  </SWRConfig>
);

describe('useWithdrawApplication', () => {
  const defaultOptions = {
    candidateId: 'candidate-123',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockWebJobApplicationWithdraw.mockResolvedValue(undefined);
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(
      () => useWithdrawApplication(defaultOptions),
      { wrapper }
    );

    expect(result.current.isWithdrawing).toBe(false);
    expect(result.current.withdrawingId).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should call server action with correct parameters', async () => {
    const { result } = renderHook(
      () => useWithdrawApplication(defaultOptions),
      { wrapper }
    );

    await act(async () => {
      await result.current.withdraw('app-123');
    });

    expect(mockWebJobApplicationWithdraw).toHaveBeenCalledWith('app-123', 'candidate-123');
  });

  it('should set isWithdrawing to true during withdrawal', async () => {
    // Make the server action slow
    mockWebJobApplicationWithdraw.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    const { result } = renderHook(
      () => useWithdrawApplication(defaultOptions),
      { wrapper }
    );

    act(() => {
      result.current.withdraw('app-123');
    });

    expect(result.current.isWithdrawing).toBe(true);
    expect(result.current.withdrawingId).toBe('app-123');

    await waitFor(() => {
      expect(result.current.isWithdrawing).toBe(false);
    });
  });

  it('should call onSuccess callback on successful withdrawal', async () => {
    const onSuccess = vi.fn();
    const { result } = renderHook(
      () => useWithdrawApplication({ ...defaultOptions, onSuccess }),
      { wrapper }
    );

    await act(async () => {
      await result.current.withdraw('app-123');
    });

    expect(onSuccess).toHaveBeenCalled();
  });

  it('should set error and call onError callback on failure', async () => {
    const testError = new Error('Withdrawal failed');
    mockWebJobApplicationWithdraw.mockRejectedValueOnce(testError);

    const onError = vi.fn();
    const { result } = renderHook(
      () => useWithdrawApplication({ ...defaultOptions, onError }),
      { wrapper }
    );

    await act(async () => {
      await result.current.withdraw('app-123');
    });

    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toBe('Withdrawal failed');
    expect(onError).toHaveBeenCalledWith(testError);
  });

  it('should clear error when clearError is called', async () => {
    const testError = new Error('Withdrawal failed');
    mockWebJobApplicationWithdraw.mockRejectedValueOnce(testError);

    const { result } = renderHook(
      () => useWithdrawApplication(defaultOptions),
      { wrapper }
    );

    await act(async () => {
      await result.current.withdraw('app-123');
    });

    expect(result.current.error).toBeDefined();

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('should not call server action when candidateId is empty', async () => {
    const { result } = renderHook(
      () => useWithdrawApplication({ candidateId: '' }),
      { wrapper }
    );

    await act(async () => {
      await result.current.withdraw('app-123');
    });

    expect(mockWebJobApplicationWithdraw).not.toHaveBeenCalled();
  });

  it('should not call server action when applicationId is empty', async () => {
    const { result } = renderHook(
      () => useWithdrawApplication(defaultOptions),
      { wrapper }
    );

    await act(async () => {
      await result.current.withdraw('');
    });

    expect(mockWebJobApplicationWithdraw).not.toHaveBeenCalled();
  });
});
