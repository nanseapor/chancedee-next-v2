"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import type { CompanyRole } from "@/types/jobsmarket/company/roles";
import {
  acceptNewEmployee,
  rejectNewEmployee,
  toggleEmployeeRole,
  removeEmployee,
} from "@/lib/database/actions/company-team";

export interface UseTeamActionsOptions {
  /** Company ID for team actions */
  companyId: string;
  /** Callback when an action succeeds (for data refresh) */
  onSuccess?: () => void | Promise<void>;
}

export interface UseTeamActionsReturn {
  /** Accept a pending employee */
  acceptEmployee: (userId: string) => Promise<boolean>;
  /** Reject a pending employee */
  rejectEmployee: (userId: string) => Promise<boolean>;
  /** Change an employee's role */
  changeRole: (userId: string, newRole: CompanyRole) => Promise<boolean>;
  /** Remove an employee from company */
  removeEmployee: (userId: string) => Promise<boolean>;
  /** Loading state for accept action */
  isAccepting: boolean;
  /** Loading state for reject action */
  isRejecting: boolean;
  /** Loading state for role change action */
  isChangingRole: boolean;
  /** Loading state for remove action */
  isRemoving: boolean;
  /** Last error */
  error: Error | null;
}

/**
 * Hook to handle team management actions
 *
 * @example
 * ```tsx
 * const { acceptEmployee, rejectEmployee, isAccepting } = useTeamActions({
 *   companyId: "company-123",
 *   onSuccess: () => mutate(), // refresh team data
 * });
 *
 * await acceptEmployee("user-456");
 * ```
 */
export function useTeamActions(
  options: UseTeamActionsOptions
): UseTeamActionsReturn {
  const { companyId, onSuccess } = options;

  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isChangingRole, setIsChangingRole] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleAcceptEmployee = useCallback(
    async (userId: string): Promise<boolean> => {
      setIsAccepting(true);
      setError(null);

      try {
        const result = await acceptNewEmployee(companyId, userId);

        if (result.success) {
          toast.success("ตอบรับสำเร็จ", {
            description: "เพิ่มพนักงานเข้าทีมแล้ว",
          });
          await onSuccess?.();
          return true;
        } else {
          const errorMsg = result.error || "ไม่สามารถตอบรับได้";
          setError(new Error(errorMsg));
          toast.error("เกิดข้อผิดพลาด", {
            description: errorMsg,
          });
          return false;
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        setError(new Error(errorMsg));
        toast.error("เกิดข้อผิดพลาด", {
          description: errorMsg,
        });
        return false;
      } finally {
        setIsAccepting(false);
      }
    },
    [companyId, onSuccess]
  );

  const handleRejectEmployee = useCallback(
    async (userId: string): Promise<boolean> => {
      setIsRejecting(true);
      setError(null);

      try {
        const result = await rejectNewEmployee(companyId, userId);

        if (result.success) {
          toast.success("ปฏิเสธสำเร็จ", {
            description: "ปฏิเสธคำขอเข้าร่วมทีมแล้ว",
          });
          await onSuccess?.();
          return true;
        } else {
          const errorMsg = result.error || "ไม่สามารถปฏิเสธได้";
          setError(new Error(errorMsg));
          toast.error("เกิดข้อผิดพลาด", {
            description: errorMsg,
          });
          return false;
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        setError(new Error(errorMsg));
        toast.error("เกิดข้อผิดพลาด", {
          description: errorMsg,
        });
        return false;
      } finally {
        setIsRejecting(false);
      }
    },
    [companyId, onSuccess]
  );

  const handleChangeRole = useCallback(
    async (userId: string, newRole: CompanyRole): Promise<boolean> => {
      setIsChangingRole(true);
      setError(null);

      try {
        const result = await toggleEmployeeRole(companyId, userId, newRole);

        if (result.success) {
          toast.success("เปลี่ยนบทบาทสำเร็จ", {
            description: "อัปเดตบทบาทของสมาชิกแล้ว",
          });
          await onSuccess?.();
          return true;
        } else {
          const errorMsg = result.error || "ไม่สามารถเปลี่ยนบทบาทได้";
          setError(new Error(errorMsg));
          toast.error("เกิดข้อผิดพลาด", {
            description: errorMsg,
          });
          return false;
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        setError(new Error(errorMsg));
        toast.error("เกิดข้อผิดพลาด", {
          description: errorMsg,
        });
        return false;
      } finally {
        setIsChangingRole(false);
      }
    },
    [companyId, onSuccess]
  );

  const handleRemoveEmployee = useCallback(
    async (userId: string): Promise<boolean> => {
      setIsRemoving(true);
      setError(null);

      try {
        const result = await removeEmployee(companyId, userId);

        if (result.success) {
          toast.success("ลบสมาชิกสำเร็จ", {
            description: "ลบสมาชิกออกจากทีมแล้ว",
          });
          await onSuccess?.();
          return true;
        } else {
          const errorMsg = result.error || "ไม่สามารถลบสมาชิกได้";
          setError(new Error(errorMsg));
          toast.error("เกิดข้อผิดพลาด", {
            description: errorMsg,
          });
          return false;
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        setError(new Error(errorMsg));
        toast.error("เกิดข้อผิดพลาด", {
          description: errorMsg,
        });
        return false;
      } finally {
        setIsRemoving(false);
      }
    },
    [companyId, onSuccess]
  );

  return {
    acceptEmployee: handleAcceptEmployee,
    rejectEmployee: handleRejectEmployee,
    changeRole: handleChangeRole,
    removeEmployee: handleRemoveEmployee,
    isAccepting,
    isRejecting,
    isChangingRole,
    isRemoving,
    error,
  };
}
