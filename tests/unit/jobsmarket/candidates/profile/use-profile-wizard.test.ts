/**
 * Unit Tests for use-profile-wizard Hook
 * CAND-R02: Profile Creation Wizard State Management
 *
 * Tests multi-step wizard navigation, completion tracking, and validation state
 */

import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

import { useProfileWizard } from "@/hooks/jobsmarket/use-profile-wizard";

describe("useProfileWizard", () => {
  describe("Initialization", () => {
    it("should initialize with default values", () => {
      const { result } = renderHook(() => useProfileWizard());

      expect(result.current.currentStep).toBe(1);
      expect(result.current.totalSteps).toBe(5);
      expect(result.current.isFirstStep).toBe(true);
      expect(result.current.isLastStep).toBe(false);
      expect(result.current.canGoNext).toBe(true);
      expect(result.current.canGoBack).toBe(false);
      expect(result.current.progress).toBe(0); // 0/5 steps completed
    });

    it("should initialize with custom total steps", () => {
      const { result } = renderHook(() =>
        useProfileWizard({ totalSteps: 3 })
      );

      expect(result.current.totalSteps).toBe(3);
      expect(result.current.currentStep).toBe(1);
    });

    it("should initialize with custom initial step", () => {
      const { result } = renderHook(() =>
        useProfileWizard({ initialStep: 3 })
      );

      expect(result.current.currentStep).toBe(3);
      expect(result.current.isFirstStep).toBe(false);
      expect(result.current.isLastStep).toBe(false);
    });
  });

  describe("Navigation", () => {
    it("should move to next step", () => {
      const { result } = renderHook(() => useProfileWizard());

      expect(result.current.currentStep).toBe(1);

      act(() => {
        result.current.nextStep();
      });

      expect(result.current.currentStep).toBe(2);
      expect(result.current.isFirstStep).toBe(false);
    });

    it("should move to previous step", () => {
      const { result } = renderHook(() =>
        useProfileWizard({ initialStep: 3 })
      );

      expect(result.current.currentStep).toBe(3);

      act(() => {
        result.current.previousStep();
      });

      expect(result.current.currentStep).toBe(2);
    });

    it("should not go beyond last step", () => {
      const { result } = renderHook(() =>
        useProfileWizard({ initialStep: 5 })
      );

      expect(result.current.currentStep).toBe(5);
      expect(result.current.canGoNext).toBe(false);

      act(() => {
        result.current.nextStep();
      });

      // Should remain at step 5
      expect(result.current.currentStep).toBe(5);
    });

    it("should not go before first step", () => {
      const { result } = renderHook(() => useProfileWizard());

      expect(result.current.currentStep).toBe(1);
      expect(result.current.canGoBack).toBe(false);

      act(() => {
        result.current.previousStep();
      });

      // Should remain at step 1
      expect(result.current.currentStep).toBe(1);
    });

    it("should go to specific step", () => {
      const { result } = renderHook(() => useProfileWizard());

      act(() => {
        result.current.goToStep(4);
      });

      expect(result.current.currentStep).toBe(4);
    });

    it("should not go to invalid step number", () => {
      const { result } = renderHook(() => useProfileWizard());

      act(() => {
        result.current.goToStep(10); // Beyond totalSteps
      });

      // Should remain at step 1
      expect(result.current.currentStep).toBe(1);

      act(() => {
        result.current.goToStep(0); // Before first step
      });

      // Should remain at step 1
      expect(result.current.currentStep).toBe(1);
    });
  });

  describe("Step Completion Tracking", () => {
    it("should mark current step as completed", () => {
      const { result } = renderHook(() => useProfileWizard());

      // Initially 0% (0/5)
      expect(result.current.progress).toBe(0);

      act(() => {
        result.current.completeStep();
      });

      // 1/5 = 20%
      expect(result.current.progress).toBe(20);

      const stepInfo = result.current.getStepInfo(1);
      expect(stepInfo?.isCompleted).toBe(true);
    });

    it("should track multiple completed steps", () => {
      const { result } = renderHook(() => useProfileWizard());

      act(() => {
        result.current.completeStep(); // Mark Step 1 as complete
      });

      act(() => {
        result.current.nextStep(); // Move to Step 2
      });

      act(() => {
        result.current.completeStep(); // Mark Step 2 as complete
      });

      act(() => {
        result.current.nextStep(); // Move to Step 3
      });

      act(() => {
        result.current.completeStep(); // Mark Step 3 as complete
      });

      // 3/5 = 60%
      expect(result.current.progress).toBe(60);
      expect(result.current.getStepInfo(1)?.isCompleted).toBe(true);
      expect(result.current.getStepInfo(2)?.isCompleted).toBe(true);
      expect(result.current.getStepInfo(3)?.isCompleted).toBe(true);
      expect(result.current.getStepInfo(4)?.isCompleted).toBe(false);
    });

    it("should call onComplete when last step is completed", () => {
      const onComplete = vi.fn();
      const { result } = renderHook(() =>
        useProfileWizard({ totalSteps: 5, initialStep: 5, onComplete })
      );

      expect(onComplete).not.toHaveBeenCalled();

      act(() => {
        result.current.completeStep();
      });

      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it("should not call onComplete when non-last step is completed", () => {
      const onComplete = vi.fn();
      const { result } = renderHook(() =>
        useProfileWizard({ initialStep: 1, onComplete })
      );

      act(() => {
        result.current.completeStep();
      });

      expect(onComplete).not.toHaveBeenCalled();
    });
  });

  describe("Step Validation State", () => {
    it("should set step as valid", () => {
      const { result } = renderHook(() => useProfileWizard());

      const stepInfo = result.current.getStepInfo(1);
      expect(stepInfo?.isValid).toBe(false);

      act(() => {
        result.current.setStepValid(1, true);
      });

      const updatedStepInfo = result.current.getStepInfo(1);
      expect(updatedStepInfo?.isValid).toBe(true);
    });

    it("should set step as invalid", () => {
      const { result } = renderHook(() => useProfileWizard());

      act(() => {
        result.current.setStepValid(2, true);
      });

      expect(result.current.getStepInfo(2)?.isValid).toBe(true);

      act(() => {
        result.current.setStepValid(2, false);
      });

      expect(result.current.getStepInfo(2)?.isValid).toBe(false);
    });

    it("should track validation state independently from completion", () => {
      const { result } = renderHook(() => useProfileWizard());

      act(() => {
        result.current.completeStep();
        result.current.setStepValid(1, true);
      });

      const stepInfo = result.current.getStepInfo(1);
      expect(stepInfo?.isCompleted).toBe(true);
      expect(stepInfo?.isValid).toBe(true);

      // Mark as invalid but still completed
      act(() => {
        result.current.setStepValid(1, false);
      });

      const updatedStepInfo = result.current.getStepInfo(1);
      expect(updatedStepInfo?.isCompleted).toBe(true);
      expect(updatedStepInfo?.isValid).toBe(false);
    });
  });

  describe("Step Information", () => {
    it("should return step info with Thai labels", () => {
      const { result } = renderHook(() => useProfileWizard());

      const step1 = result.current.getStepInfo(1);
      expect(step1?.id).toBe(1);
      expect(step1?.title).toBe("ข้อมูลส่วนตัว");
      expect(step1?.description).toBe("ชื่อ, เบอร์โทร, อีเมล, ที่อยู่");

      const step2 = result.current.getStepInfo(2);
      expect(step2?.title).toBe("การศึกษา");

      const step3 = result.current.getStepInfo(3);
      expect(step3?.title).toBe("ประสบการณ์ทำงาน");

      const step4 = result.current.getStepInfo(4);
      expect(step4?.title).toBe("ทักษะและภาษา");

      const step5 = result.current.getStepInfo(5);
      expect(step5?.title).toBe("ความต้องการงาน");
    });

    it("should return undefined for invalid step number", () => {
      const { result } = renderHook(() => useProfileWizard());

      expect(result.current.getStepInfo(0)).toBeUndefined();
      expect(result.current.getStepInfo(10)).toBeUndefined();
    });
  });

  describe("Progress Calculation", () => {
    it("should calculate 0% with no completed steps", () => {
      const { result } = renderHook(() => useProfileWizard());

      expect(result.current.progress).toBe(0);
    });

    it("should calculate 20% with 1/5 completed", () => {
      const { result } = renderHook(() => useProfileWizard());

      act(() => {
        result.current.completeStep();
      });

      expect(result.current.progress).toBe(20);
    });

    it("should calculate 40% with 2/5 completed", () => {
      const { result } = renderHook(() => useProfileWizard());

      act(() => {
        result.current.completeStep(); // Complete step 1
      });

      act(() => {
        result.current.nextStep(); // Move to step 2
      });

      act(() => {
        result.current.completeStep(); // Complete step 2
      });

      expect(result.current.progress).toBe(40);
    });

    it("should calculate 100% with 5/5 completed", () => {
      const { result } = renderHook(() => useProfileWizard());

      for (let i = 1; i <= 5; i++) {
        act(() => {
          result.current.completeStep();
        });

        if (i < 5) {
          act(() => {
            result.current.nextStep();
          });
        }
      }

      expect(result.current.progress).toBe(100);
    });
  });

  describe("First/Last Step Flags", () => {
    it("should identify first step correctly", () => {
      const { result } = renderHook(() => useProfileWizard());

      expect(result.current.isFirstStep).toBe(true);

      act(() => {
        result.current.nextStep();
      });

      expect(result.current.isFirstStep).toBe(false);
    });

    it("should identify last step correctly", () => {
      const { result } = renderHook(() =>
        useProfileWizard({ initialStep: 5 })
      );

      expect(result.current.isLastStep).toBe(true);

      act(() => {
        result.current.previousStep();
      });

      expect(result.current.isLastStep).toBe(false);
    });
  });

  describe("Reset Functionality", () => {
    it("should reset to initial state", () => {
      const { result } = renderHook(() =>
        useProfileWizard({ initialStep: 1 })
      );

      // Make some changes
      act(() => {
        result.current.completeStep(); // Complete step 1
        result.current.setStepValid(1, true);
      });

      act(() => {
        result.current.nextStep(); // Move to step 2
      });

      act(() => {
        result.current.completeStep(); // Complete step 2
        result.current.setStepValid(2, true);
      });

      act(() => {
        result.current.nextStep(); // Move to step 3
      });

      expect(result.current.currentStep).toBe(3);
      expect(result.current.progress).toBe(40);

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.currentStep).toBe(1);
      expect(result.current.progress).toBe(0);
      expect(result.current.getStepInfo(1)?.isCompleted).toBe(false);
      expect(result.current.getStepInfo(1)?.isValid).toBe(false);
      expect(result.current.getStepInfo(2)?.isCompleted).toBe(false);
      expect(result.current.getStepInfo(2)?.isValid).toBe(false);
    });
  });

  describe("onStepChange Callback", () => {
    it("should call onStepChange when moving to next step", () => {
      const onStepChange = vi.fn();
      const { result } = renderHook(() =>
        useProfileWizard({ onStepChange })
      );

      act(() => {
        result.current.nextStep();
      });

      expect(onStepChange).toHaveBeenCalledWith(2);
    });

    it("should call onStepChange when moving to previous step", () => {
      const onStepChange = vi.fn();
      const { result } = renderHook(() =>
        useProfileWizard({ initialStep: 3, onStepChange })
      );

      act(() => {
        result.current.previousStep();
      });

      expect(onStepChange).toHaveBeenCalledWith(2);
    });

    it("should call onStepChange when going to specific step", () => {
      const onStepChange = vi.fn();
      const { result } = renderHook(() =>
        useProfileWizard({ onStepChange })
      );

      act(() => {
        result.current.goToStep(4);
      });

      expect(onStepChange).toHaveBeenCalledWith(4);
    });

    it("should not call onStepChange when navigation is invalid", () => {
      const onStepChange = vi.fn();
      const { result } = renderHook(() =>
        useProfileWizard({ initialStep: 5, onStepChange })
      );

      onStepChange.mockClear(); // Clear initial call

      act(() => {
        result.current.nextStep(); // Can't go beyond step 5
      });

      expect(onStepChange).not.toHaveBeenCalled();
    });
  });
});
