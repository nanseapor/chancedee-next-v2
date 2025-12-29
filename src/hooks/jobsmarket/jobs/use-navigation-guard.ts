import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

/**
 * Navigation guard hook
 * Prevents navigation when there are unsaved changes
 *
 * @param isDirty - Whether there are unsaved changes
 */
export function useNavigationGuard(isDirty: boolean) {
  const router = useRouter();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  /**
   * Check if navigation should be blocked
   */
  const shouldBlockNavigation = useCallback(() => {
    return isDirty;
  }, [isDirty]);

  /**
   * Attempt to navigate to a path
   * If dirty, shows confirmation modal instead
   */
  const attemptNavigation = useCallback(
    (path: string) => {
      if (isDirty) {
        setShowConfirmModal(true);
        setPendingPath(path);
      } else {
        router.push(path);
      }
    },
    [isDirty, router]
  );

  /**
   * Confirm navigation (user clicked "Leave")
   */
  const confirmNavigation = useCallback(() => {
    if (pendingPath) {
      router.push(pendingPath);
    }
    setShowConfirmModal(false);
    setPendingPath(null);
  }, [pendingPath, router]);

  /**
   * Cancel navigation (user clicked "Stay")
   */
  const cancelNavigation = useCallback(() => {
    setShowConfirmModal(false);
    setPendingPath(null);
  }, []);

  /**
   * Close confirmation modal when form becomes clean
   */
  useEffect(() => {
    if (!isDirty && showConfirmModal) {
      setShowConfirmModal(false);
      setPendingPath(null);
    }
  }, [isDirty, showConfirmModal]);

  /**
   * Handle browser beforeunload event
   */
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        // Modern browsers require returnValue to be set
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  return {
    shouldBlockNavigation,
    attemptNavigation,
    confirmNavigation,
    cancelNavigation,
    showConfirmModal,
    pendingPath,
  };
}
