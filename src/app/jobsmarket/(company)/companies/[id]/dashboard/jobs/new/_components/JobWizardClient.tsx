"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useJobWizardForm } from "@/hooks/jobsmarket/jobs/use-job-wizard-form";
import { useJobDraft } from "@/hooks/jobsmarket/jobs/use-job-draft";
import { useJobPublish } from "@/hooks/jobsmarket/jobs/use-job-publish";
import { useAutoSave } from "@/hooks/jobsmarket/jobs/use-auto-save-field";
import { useNavigationGuard } from "@/hooks/jobsmarket/jobs/use-navigation-guard";
import { WizardHeader } from "./WizardHeader";
import { WizardNavigation } from "./WizardNavigation";
import { Step1BasicForm } from "./Step1BasicForm";
import { Step2DetailsForm } from "./Step2DetailsForm";
import { Step3LocationForm } from "./Step3LocationForm";
import { Step4Review } from "./Step4Review";
import { PublishOptionsModal } from "./PublishOptionsModal";
import { NavigationGuardModal } from "./NavigationGuardModal";
import { WizardSkeleton } from "./WizardSkeleton";
import type { JobFormData, WizardStep } from "@/types/jobsmarket/job-wizard.types";

export interface JobWizardClientProps {
  companyId: string;
  userId: string;
  draftId?: string;
  duplicateFrom?: string;
}

/**
 * Job Wizard Client - Main Orchestrator
 * Integrates all hooks and components for the job creation wizard
 */
export function JobWizardClient({
  companyId,
  userId,
  draftId: initialDraftId,
  duplicateFrom,
}: JobWizardClientProps) {
  const router = useRouter();
  const [showPublishModal, setShowPublishModal] = useState(false);

  // === WIZARD FORM STATE ===
  const {
    currentStep,
    formData,
    errors,
    isDirty,
    updateField,
    validateStep,
    goToNextStep,
    goToPreviousStep,
    jumpToStep,
    setCurrentStep,
  } = useJobWizardForm();

  // === DRAFT OPERATIONS ===
  const {
    draft,
    isLoading: isDraftLoading,
    isSaving: isDraftSaving,
    error: draftError,
    draftId,
    createDraft,
    updateDraft,
    loadDraft,
  } = useJobDraft(userId, initialDraftId);

  // === AUTO-SAVE ===
  const {
    isSaving: isAutoSaving,
    lastSaved,
    error: autoSaveError,
    markDirty,
    saveNow,
  } = useAutoSave(
    async (fieldName: string, value: any) => {
      // Auto-save handler
      if (draftId) {
        await updateDraft({ [fieldName]: value });
      } else {
        // Create draft on first auto-save
        const newDraftId = await createDraft(formData);
        // Update URL with new draft ID
        const url = new URL(window.location.href);
        url.searchParams.set("draftId", newDraftId);
        router.replace(url.pathname + url.search, { scroll: false });
      }
    },
    1000 // 1 second debounce
  );

  // === PUBLISH OPERATIONS ===
  const {
    isPublishing,
    error: publishError,
    publishNow: publishJobNow,
    schedulePublish: scheduleJobPublish,
    saveAsDraft: saveJobAsDraft,
  } = useJobPublish(draftId || "", {
    onSuccess: () => {
      router.push(`/companies/${companyId}/dashboard/jobs`);
    },
  });

  // === NAVIGATION GUARD ===
  const {
    showConfirmModal: showNavGuard,
    confirmNavigation,
    cancelNavigation,
  } = useNavigationGuard(isDirty);

  // === LOAD DRAFT OR DUPLICATE SOURCE ===
  useEffect(() => {
    if (initialDraftId && draft) {
      // Draft loaded by useJobDraft hook
      // Populate form with draft data
      Object.entries(draft).forEach(([key, value]) => {
        updateField(key as keyof JobFormData, value);
      });
    } else if (duplicateFrom) {
      // Load job to duplicate
      loadDraft(duplicateFrom);
    }
  }, [initialDraftId, duplicateFrom, draft]);

  // === COMPUTED STATE ===
  const saveStatus = isAutoSaving
    ? "saving"
    : lastSaved
      ? "saved"
      : isDirty
        ? "dirty"
        : "idle";

  const canProceed = validateStep(currentStep);

  // === HANDLERS ===
  const handleFieldChange = useCallback(
    (field: keyof JobFormData, value: any) => {
      updateField(field, value);
      markDirty(field, value);
    },
    [updateField, markDirty]
  );

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      return;
    }

    if (currentStep === 4) {
      setShowPublishModal(true);
    } else {
      goToNextStep();
    }
  };

  const handlePublishNow = async () => {
    if (!draftId) return;
    await publishJobNow();
  };

  const handleSchedule = async (date: Date) => {
    if (!draftId) return;
    await scheduleJobPublish(date);
  };

  const handleSaveDraft = async () => {
    if (!draftId) {
      // Create draft if it doesn't exist
      await createDraft(formData);
    } else {
      await saveJobAsDraft();
    }
  };

  const handleEditFromReview = (targetStep: WizardStep) => {
    jumpToStep(targetStep);
  };

  const handleManualSave = async () => {
    await saveNow();
  };

  // === LOADING STATE ===
  if (isDraftLoading) {
    return <WizardSkeleton />;
  }

  // === RENDER ===
  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      {/* Header with progress */}
      <WizardHeader
        currentStep={currentStep}
        saveStatus={saveStatus}
        lastSaved={lastSaved || undefined}
        error={autoSaveError || draftError || publishError || undefined}
        onSaveClick={handleManualSave}
      />

      {/* Current step form */}
      <div className="mt-8">
        {currentStep === 1 && (
          <Step1BasicForm
            formData={formData}
            errors={errors}
            onFieldChange={handleFieldChange}
          />
        )}
        {currentStep === 2 && (
          <Step2DetailsForm
            formData={formData}
            errors={errors}
            onFieldChange={handleFieldChange}
          />
        )}
        {currentStep === 3 && (
          <Step3LocationForm
            formData={formData}
            errors={errors}
            onFieldChange={handleFieldChange}
          />
        )}
        {currentStep === 4 && (
          <Step4Review formData={formData} onEdit={handleEditFromReview} />
        )}
      </div>

      {/* Navigation buttons */}
      <div className="mt-8">
        <WizardNavigation
          currentStep={currentStep}
          canProceed={canProceed}
          isSubmitting={isPublishing}
          onBack={goToPreviousStep}
          onNext={handleNext}
          onPublish={() => setShowPublishModal(true)}
        />
      </div>

      {/* Publish options modal */}
      <PublishOptionsModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        onPublishNow={handlePublishNow}
        onSchedule={handleSchedule}
        onSaveDraft={handleSaveDraft}
        isSubmitting={isPublishing}
      />

      {/* Navigation guard modal */}
      <NavigationGuardModal
        isOpen={showNavGuard}
        onStay={cancelNavigation}
        onLeave={confirmNavigation}
      />
    </div>
  );
}
