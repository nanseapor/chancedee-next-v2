/**
 * Unit tests for usePdfExport hook
 * CAND-R02 Batch 3E
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { usePdfExport } from "@/lib/jobsmarket/hooks/use-pdf-export";
import * as pdfService from "@/lib/jobsmarket/services/pdf-service";

// Mock dependencies
vi.mock("@/lib/jobsmarket/services/pdf-service");
vi.mock("@/hooks/use-toast-notification", () => ({
  useToast: () => ({
    addToast: vi.fn(),
  }),
}));

describe("usePdfExport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return initial state", () => {
    const { result } = renderHook(() =>
      usePdfExport({ candidateId: "test-uid", candidateName: "Test User" })
    );

    expect(result.current.isGenerating).toBe(false);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.exportPdf).toBe("function");
  });

  it("should set isGenerating to true during export", async () => {
    vi.mocked(pdfService.downloadResumePdf).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    const { result } = renderHook(() =>
      usePdfExport({ candidateId: "test-uid", candidateName: "Test User" })
    );

    act(() => {
      result.current.exportPdf();
    });

    expect(result.current.isGenerating).toBe(true);

    await waitFor(() => {
      expect(result.current.isGenerating).toBe(false);
    });
  });

  it("should call downloadResumePdf with correct parameters", async () => {
    vi.mocked(pdfService.downloadResumePdf).mockResolvedValue();

    const { result } = renderHook(() =>
      usePdfExport({ candidateId: "test-uid-123", candidateName: "John Doe" })
    );

    await act(async () => {
      await result.current.exportPdf("template2");
    });

    expect(pdfService.downloadResumePdf).toHaveBeenCalledWith(
      "test-uid-123",
      "John Doe",
      "template2"
    );
  });

  it("should use default template when not specified", async () => {
    vi.mocked(pdfService.downloadResumePdf).mockResolvedValue();

    const { result } = renderHook(() =>
      usePdfExport({ candidateId: "test-uid", candidateName: "Test" })
    );

    await act(async () => {
      await result.current.exportPdf();
    });

    expect(pdfService.downloadResumePdf).toHaveBeenCalledWith(
      "test-uid",
      "Test",
      "template3"
    );
  });

  it("should handle errors and set error state", async () => {
    const mockError = {
      code: "API_ERROR" as const,
      message: "API failed",
    };

    vi.mocked(pdfService.downloadResumePdf).mockRejectedValue(mockError);

    const { result } = renderHook(() =>
      usePdfExport({ candidateId: "test-uid", candidateName: "Test" })
    );

    await act(async () => {
      await result.current.exportPdf();
    });

    await waitFor(() => {
      expect(result.current.error).toEqual(mockError);
      expect(result.current.isGenerating).toBe(false);
    });
  });

  it("should clear error on new export attempt", async () => {
    const mockError = {
      code: "API_ERROR" as const,
      message: "First error",
    };

    vi.mocked(pdfService.downloadResumePdf)
      .mockRejectedValueOnce(mockError)
      .mockResolvedValueOnce();

    const { result } = renderHook(() =>
      usePdfExport({ candidateId: "test-uid", candidateName: "Test" })
    );

    // First call - should fail
    await act(async () => {
      await result.current.exportPdf();
    });

    await waitFor(() => {
      expect(result.current.error).toEqual(mockError);
    });

    // Second call - should succeed and clear error
    await act(async () => {
      await result.current.exportPdf();
    });

    await waitFor(() => {
      expect(result.current.error).toBe(null);
      expect(result.current.isGenerating).toBe(false);
    });
  });
});
