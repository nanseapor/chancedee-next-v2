import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useJobWizardForm } from "@/hooks/jobsmarket/jobs/use-job-wizard-form";

describe("useJobWizardForm", () => {
  describe("Initialization", () => {
    it("should initialize with default values", () => {
      const { result } = renderHook(() => useJobWizardForm());

      expect(result.current.currentStep).toBe(1);
      expect(result.current.formData.title).toBe("");
      expect(result.current.formData.jobType).toBeUndefined();
      expect(result.current.formData.jobLevel).toBeUndefined();
      expect(result.current.formData.numberOfPosition).toBe(1);
      expect(result.current.formData.hideSalary).toBe(false);
      expect(result.current.formData.skills).toEqual([]);
      expect(result.current.formData.workModel).toBeUndefined();
      expect(result.current.errors).toEqual({});
      expect(result.current.isDirty).toBe(false);
    });

    it("should initialize with draft data when provided", () => {
      const draftData = {
        title: "Senior Developer",
        jobType: "fulltime" as const,
        jobLevel: "senior",
        numberOfPosition: 2,
        hideSalary: false,
        skills: ["React", "TypeScript"],
        workModel: "hybrid" as const,
      };

      const { result } = renderHook(() => useJobWizardForm(draftData));

      expect(result.current.formData.title).toBe("Senior Developer");
      expect(result.current.formData.jobType).toBe("fulltime");
      expect(result.current.formData.skills).toEqual(["React", "TypeScript"]);
    });
  });

  describe("Step Navigation", () => {
    it("should move to next step when current step is valid", () => {
      const { result } = renderHook(() => useJobWizardForm());

      // Fill required fields for step 1
      act(() => {
        result.current.updateField("title", "Senior Frontend Developer");
        result.current.updateField("jobType", "fulltime");
        result.current.updateField("jobLevel", "senior");
        result.current.updateField("numberOfPosition", 1);
      });

      // Move to next step
      act(() => {
        result.current.goToNextStep();
      });

      expect(result.current.currentStep).toBe(2);
    });

    it("should not move to next step when current step is invalid", () => {
      const { result } = renderHook(() => useJobWizardForm());

      // Try to move without filling required fields
      act(() => {
        result.current.goToNextStep();
      });

      expect(result.current.currentStep).toBe(1);
      expect(Object.keys(result.current.errors).length).toBeGreaterThan(0);
    });

    it("should move to previous step", () => {
      const { result } = renderHook(() => useJobWizardForm());

      // Move to step 2 first
      act(() => {
        result.current.setCurrentStep(2);
      });

      // Move back
      act(() => {
        result.current.goToPreviousStep();
      });

      expect(result.current.currentStep).toBe(1);
    });

    it("should not go below step 1", () => {
      const { result } = renderHook(() => useJobWizardForm());

      act(() => {
        result.current.goToPreviousStep();
      });

      expect(result.current.currentStep).toBe(1);
    });

    it("should not go beyond step 4", () => {
      const { result } = renderHook(() => useJobWizardForm());

      act(() => {
        result.current.setCurrentStep(4);
        result.current.goToNextStep();
      });

      expect(result.current.currentStep).toBe(4);
    });

    it("should jump to specific step from review", () => {
      const { result } = renderHook(() => useJobWizardForm());

      act(() => {
        result.current.setCurrentStep(4); // Review step
        result.current.jumpToStep(2);
      });

      expect(result.current.currentStep).toBe(2);
    });
  });

  describe("Form Field Updates", () => {
    it("should update form field and mark as dirty", () => {
      const { result } = renderHook(() => useJobWizardForm());

      act(() => {
        result.current.updateField("title", "New Job Title");
      });

      expect(result.current.formData.title).toBe("New Job Title");
      expect(result.current.isDirty).toBe(true);
    });

    it("should clear field-specific error when field is updated", () => {
      const { result } = renderHook(() => useJobWizardForm());

      // Try to proceed without title (creates error)
      act(() => {
        result.current.goToNextStep();
      });

      expect(result.current.errors.title).toBeDefined();

      // Update title
      act(() => {
        result.current.updateField("title", "Valid Title");
      });

      expect(result.current.errors.title).toBeUndefined();
    });
  });

  describe("Step Validation", () => {
    it("should validate step 1 required fields", () => {
      const { result } = renderHook(() => useJobWizardForm());

      let isValid: boolean;
      act(() => {
        isValid = result.current.validateStep(1);
      });

      expect(isValid!).toBe(false);
      expect(result.current.errors.title).toBeDefined();
      expect(result.current.errors.jobType).toBeDefined();
      expect(result.current.errors.jobLevel).toBeDefined();
    });

    it("should validate step 1 with all required fields filled", () => {
      const { result } = renderHook(() => useJobWizardForm());

      act(() => {
        result.current.updateField("title", "Frontend Developer");
        result.current.updateField("jobType", "fulltime");
        result.current.updateField("jobLevel", "mid");
        result.current.updateField("numberOfPosition", 1);
      });

      let isValid: boolean;
      act(() => {
        isValid = result.current.validateStep(1);
      });

      expect(isValid!).toBe(true);
      expect(Object.keys(result.current.errors).length).toBe(0);
    });

    it("should validate step 2 required fields", () => {
      const { result } = renderHook(() => useJobWizardForm());

      act(() => {
        result.current.setCurrentStep(2);
      });

      let isValid: boolean;
      act(() => {
        isValid = result.current.validateStep(2);
      });

      expect(isValid!).toBe(false);
      expect(result.current.errors.jobDescriptionDetails).toBeDefined();
      expect(result.current.errors.skills).toBeDefined();
    });

    it("should validate step 3 required fields based on work model", () => {
      const { result } = renderHook(() => useJobWizardForm());

      act(() => {
        result.current.setCurrentStep(3);
        result.current.updateField("workModel", "onsite");
      });

      let isValid: boolean;
      act(() => {
        isValid = result.current.validateStep(3);
      });

      expect(isValid!).toBe(false);
      expect(result.current.errors.province).toBeDefined();
    });

    it("should not require province for remote work", () => {
      const { result } = renderHook(() => useJobWizardForm());

      act(() => {
        result.current.setCurrentStep(3);
        result.current.updateField("workModel", "remote");
      });

      let isValid: boolean;
      act(() => {
        isValid = result.current.validateStep(3);
      });

      expect(isValid!).toBe(true);
      expect(result.current.errors.province).toBeUndefined();
    });
  });

  describe("Form Reset", () => {
    it("should reset form to initial state", () => {
      const { result } = renderHook(() => useJobWizardForm());

      // Make changes
      act(() => {
        result.current.updateField("title", "Test Job");
        result.current.setCurrentStep(2);
      });

      // Reset
      act(() => {
        result.current.resetForm();
      });

      expect(result.current.currentStep).toBe(1);
      expect(result.current.formData.title).toBe("");
      expect(result.current.isDirty).toBe(false);
      expect(Object.keys(result.current.errors).length).toBe(0);
    });
  });
});
