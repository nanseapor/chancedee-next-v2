/**
 * COMP-R02: useTeamActions Hook Tests
 *
 * Tests for team management actions:
 * - Accept employee
 * - Reject employee
 * - Change role
 * - Remove employee
 * - Loading states per action
 * - Error handling
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

// Mock server actions
const mockAcceptNewEmployee = vi.fn();
const mockRejectNewEmployee = vi.fn();
const mockToggleEmployeeRole = vi.fn();
const mockRemoveEmployee = vi.fn();

vi.mock("@/lib/database/actions/company-team", () => ({
  acceptNewEmployee: (...args: unknown[]) => mockAcceptNewEmployee(...args),
  rejectNewEmployee: (...args: unknown[]) => mockRejectNewEmployee(...args),
  toggleEmployeeRole: (...args: unknown[]) => mockToggleEmployeeRole(...args),
  removeEmployee: (...args: unknown[]) => mockRemoveEmployee(...args),
}));

// Mock toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Import the real hook
import { useTeamActions } from "@/hooks/jobsmarket/company/use-team-actions";

// Mock data
const mockCompanyId = "comp-test-123";
const mockTargetUserId = "user-member-456";

describe("useTeamActions Hook - COMP-R02", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("acceptEmployee", () => {
    it("should call server action with user ID", async () => {
      mockAcceptNewEmployee.mockResolvedValue({ success: true });

      const { result } = renderHook(() =>
        useTeamActions({ companyId: mockCompanyId })
      );

      await act(async () => {
        await result.current.acceptEmployee(mockTargetUserId);
      });

      expect(mockAcceptNewEmployee).toHaveBeenCalledWith(
        mockCompanyId,
        mockTargetUserId
      );
    });

    it("should call onSuccess callback after accepting", async () => {
      mockAcceptNewEmployee.mockResolvedValue({ success: true });
      const mockOnSuccess = vi.fn();

      const { result } = renderHook(() =>
        useTeamActions({ companyId: mockCompanyId, onSuccess: mockOnSuccess })
      );

      await act(async () => {
        await result.current.acceptEmployee(mockTargetUserId);
      });

      expect(mockOnSuccess).toHaveBeenCalled();
    });

    it("should set isAccepting true during action", async () => {
      let resolvePromise: () => void;
      mockAcceptNewEmployee.mockReturnValue(
        new Promise((resolve) => {
          resolvePromise = () => resolve({ success: true });
        })
      );

      const { result } = renderHook(() =>
        useTeamActions({ companyId: mockCompanyId })
      );

      // Start the action (don't await)
      let actionPromise: Promise<boolean>;
      act(() => {
        actionPromise = result.current.acceptEmployee(mockTargetUserId);
      });

      // Check loading state
      expect(result.current.isAccepting).toBe(true);

      // Resolve and finish
      await act(async () => {
        resolvePromise!();
        await actionPromise;
      });

      expect(result.current.isAccepting).toBe(false);
    });

    it("should handle accept error gracefully", async () => {
      mockAcceptNewEmployee.mockResolvedValue({
        success: false,
        error: "Accept failed",
      });

      const { result } = renderHook(() =>
        useTeamActions({ companyId: mockCompanyId })
      );

      await act(async () => {
        const success = await result.current.acceptEmployee(mockTargetUserId);
        expect(success).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe("rejectEmployee", () => {
    it("should call server action with user ID", async () => {
      mockRejectNewEmployee.mockResolvedValue({ success: true });

      const { result } = renderHook(() =>
        useTeamActions({ companyId: mockCompanyId })
      );

      await act(async () => {
        await result.current.rejectEmployee(mockTargetUserId);
      });

      expect(mockRejectNewEmployee).toHaveBeenCalledWith(
        mockCompanyId,
        mockTargetUserId
      );
    });

    it("should call onSuccess callback after rejecting", async () => {
      mockRejectNewEmployee.mockResolvedValue({ success: true });
      const mockOnSuccess = vi.fn();

      const { result } = renderHook(() =>
        useTeamActions({ companyId: mockCompanyId, onSuccess: mockOnSuccess })
      );

      await act(async () => {
        await result.current.rejectEmployee(mockTargetUserId);
      });

      expect(mockOnSuccess).toHaveBeenCalled();
    });

    it("should set isRejecting true during action", async () => {
      let resolvePromise: () => void;
      mockRejectNewEmployee.mockReturnValue(
        new Promise((resolve) => {
          resolvePromise = () => resolve({ success: true });
        })
      );

      const { result } = renderHook(() =>
        useTeamActions({ companyId: mockCompanyId })
      );

      // Start the action (don't await)
      let actionPromise: Promise<boolean>;
      act(() => {
        actionPromise = result.current.rejectEmployee(mockTargetUserId);
      });

      // Check loading state
      expect(result.current.isRejecting).toBe(true);

      // Resolve and finish
      await act(async () => {
        resolvePromise!();
        await actionPromise;
      });

      expect(result.current.isRejecting).toBe(false);
    });
  });

  describe("changeRole", () => {
    it("should call server action with user ID and new role", async () => {
      mockToggleEmployeeRole.mockResolvedValue({ success: true });

      const { result } = renderHook(() =>
        useTeamActions({ companyId: mockCompanyId })
      );

      await act(async () => {
        await result.current.changeRole(mockTargetUserId, "admin");
      });

      expect(mockToggleEmployeeRole).toHaveBeenCalledWith(
        mockCompanyId,
        mockTargetUserId,
        "admin"
      );
    });

    it("should call onSuccess callback after changing role", async () => {
      mockToggleEmployeeRole.mockResolvedValue({ success: true });
      const mockOnSuccess = vi.fn();

      const { result } = renderHook(() =>
        useTeamActions({ companyId: mockCompanyId, onSuccess: mockOnSuccess })
      );

      await act(async () => {
        await result.current.changeRole(mockTargetUserId, "admin");
      });

      expect(mockOnSuccess).toHaveBeenCalled();
    });

    it("should set isChangingRole true during action", async () => {
      let resolvePromise: () => void;
      mockToggleEmployeeRole.mockReturnValue(
        new Promise((resolve) => {
          resolvePromise = () => resolve({ success: true });
        })
      );

      const { result } = renderHook(() =>
        useTeamActions({ companyId: mockCompanyId })
      );

      // Start the action (don't await)
      let actionPromise: Promise<boolean>;
      act(() => {
        actionPromise = result.current.changeRole(mockTargetUserId, "admin");
      });

      // Check loading state
      expect(result.current.isChangingRole).toBe(true);

      // Resolve and finish
      await act(async () => {
        resolvePromise!();
        await actionPromise;
      });

      expect(result.current.isChangingRole).toBe(false);
    });

    it("should handle change role error gracefully", async () => {
      mockToggleEmployeeRole.mockResolvedValue({
        success: false,
        error: "Cannot demote last admin",
      });

      const { result } = renderHook(() =>
        useTeamActions({ companyId: mockCompanyId })
      );

      await act(async () => {
        const success = await result.current.changeRole(
          mockTargetUserId,
          "viewer"
        );
        expect(success).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe("removeEmployee", () => {
    it("should call server action with user ID", async () => {
      mockRemoveEmployee.mockResolvedValue({ success: true });

      const { result } = renderHook(() =>
        useTeamActions({ companyId: mockCompanyId })
      );

      await act(async () => {
        await result.current.removeEmployee(mockTargetUserId);
      });

      expect(mockRemoveEmployee).toHaveBeenCalledWith(
        mockCompanyId,
        mockTargetUserId
      );
    });

    it("should call onSuccess callback after removing", async () => {
      mockRemoveEmployee.mockResolvedValue({ success: true });
      const mockOnSuccess = vi.fn();

      const { result } = renderHook(() =>
        useTeamActions({ companyId: mockCompanyId, onSuccess: mockOnSuccess })
      );

      await act(async () => {
        await result.current.removeEmployee(mockTargetUserId);
      });

      expect(mockOnSuccess).toHaveBeenCalled();
    });

    it("should set isRemoving true during action", async () => {
      let resolvePromise: () => void;
      mockRemoveEmployee.mockReturnValue(
        new Promise((resolve) => {
          resolvePromise = () => resolve({ success: true });
        })
      );

      const { result } = renderHook(() =>
        useTeamActions({ companyId: mockCompanyId })
      );

      // Start the action (don't await)
      let actionPromise: Promise<boolean>;
      act(() => {
        actionPromise = result.current.removeEmployee(mockTargetUserId);
      });

      // Check loading state
      expect(result.current.isRemoving).toBe(true);

      // Resolve and finish
      await act(async () => {
        resolvePromise!();
        await actionPromise;
      });

      expect(result.current.isRemoving).toBe(false);
    });

    it("should handle remove error gracefully", async () => {
      mockRemoveEmployee.mockResolvedValue({
        success: false,
        error: "Cannot remove self",
      });

      const { result } = renderHook(() =>
        useTeamActions({ companyId: mockCompanyId })
      );

      await act(async () => {
        const success = await result.current.removeEmployee(mockTargetUserId);
        expect(success).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe("Loading States", () => {
    it("should have all loading states false initially", () => {
      const { result } = renderHook(() =>
        useTeamActions({ companyId: mockCompanyId })
      );

      expect(result.current.isAccepting).toBe(false);
      expect(result.current.isRejecting).toBe(false);
      expect(result.current.isChangingRole).toBe(false);
      expect(result.current.isRemoving).toBe(false);
    });

    it("should only have one loading state true at a time", async () => {
      let resolvePromise: () => void;
      mockAcceptNewEmployee.mockReturnValue(
        new Promise((resolve) => {
          resolvePromise = () => resolve({ success: true });
        })
      );

      const { result } = renderHook(() =>
        useTeamActions({ companyId: mockCompanyId })
      );

      // Start accept action
      let actionPromise: Promise<boolean>;
      act(() => {
        actionPromise = result.current.acceptEmployee(mockTargetUserId);
      });

      // Only isAccepting should be true
      expect(result.current.isAccepting).toBe(true);
      expect(result.current.isRejecting).toBe(false);
      expect(result.current.isChangingRole).toBe(false);
      expect(result.current.isRemoving).toBe(false);

      // Resolve
      await act(async () => {
        resolvePromise!();
        await actionPromise;
      });
    });
  });
});
