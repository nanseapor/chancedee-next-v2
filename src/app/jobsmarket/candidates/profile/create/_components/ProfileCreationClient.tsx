"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast-notification";
import { Step1PersonalInfo, Step1FormData } from "./Step1PersonalInfo";
import { Step2WorkExperience, Step2FormData } from "./Step2WorkExperience";
import { Step3Education, Step3FormData } from "./Step3Education";
import { Step4Skills, Step4FormData } from "./Step4Skills";
import { Step5JobPreferences, Step5FormData } from "./Step5JobPreferences";
import { useProfileWizard } from "@/hooks/jobsmarket/use-profile-wizard";
import {
  webCandidateSavePersonalInfo,
  webCandidateSaveWorkExperience,
  webCandidateSaveEducation,
  webCandidateSaveSkills,
  webCandidateSetIsOnboarded,
} from "@/lib/database/actions/candidate-information";
import { webCandidateSavePreferences } from "@/lib/database/actions/candidate-preference";
import { webUserInfoSetIsOnboarded } from "@/lib/database/actions/user-info";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EDUCATION_LEVELS } from "@/lib/constants/jobsmarket/education";

export interface ProfileCreationClientProps {
  /** User ID */
  uid: string;
  /** Initial data (if resuming) */
  initialData?: {
    step1?: Partial<Step1FormData>;
    step2?: Partial<Step2FormData>;
    step3?: Partial<Step3FormData>;
    step4?: Partial<Step4FormData>;
    step5?: Partial<Step5FormData>;
  };
}

/**
 * Profile Creation Client Component
 *
 * Multi-step wizard for creating candidate profile (CAND-R02)
 * Wraps the wizard UI and manages client-side state
 *
 * Steps:
 * 1. Personal Information
 * 2. Work Experience
 * 3. Education
 * 4. Skills & Languages
 * 5. Job Preferences
 */
export function ProfileCreationClient({
  uid,
  initialData,
}: ProfileCreationClientProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  // Draft data for each step (in-memory)
  const [draftData, setDraftData] = React.useState({
    step1: initialData?.step1,
    step2: initialData?.step2,
    step3: initialData?.step3,
    step4: initialData?.step4,
    step5: initialData?.step5,
  });

  // Wizard state
  const wizard = useProfileWizard({
    totalSteps: 5,
    initialStep: 1,
    onComplete: handleWizardComplete,
  });

  // Handle Step 1 submission
  async function handleStep1Submit(data: Step1FormData) {
    setIsLoading(true);

    try {
      // Save to Firestore
      await webCandidateSavePersonalInfo(uid, data, uid);

      // Save draft
      setDraftData((prev) => ({ ...prev, step1: data }));

      // Mark step as completed
      wizard.completeStep();
      wizard.setStepValid(1, true);

      addToast("บันทึกข้อมูลส่วนตัวสำเร็จ", "success");

      // Move to step 2
      wizard.nextStep();
    } catch (error) {
      console.error("Error saving personal info:", error);
      addToast("เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง", "error");
    } finally {
      setIsLoading(false);
    }
  }

  // Handle Step 2 submission
  async function handleStep2Submit(data: Step2FormData) {
    setIsLoading(true);

    try {
      // Transform and save work experience to Firestore
      const transformedWorks = data.works.map(work => ({
        company: work.company,
        position: work.position,
        start_month: 1,
        start_year: work.start_year,
        end_month: work.is_current ? undefined : 12,
        end_year: work.is_current ? undefined : work.end_year,
        is_current: work.is_current,
        note: work.description,
      }));

      await webCandidateSaveWorkExperience(uid, transformedWorks, uid);

      // Save draft
      setDraftData((prev) => ({ ...prev, step2: data }));

      // Mark step as completed
      wizard.completeStep();
      wizard.setStepValid(2, true);

      addToast("บันทึกประสบการณ์ทำงานสำเร็จ", "success");

      // Move to step 3
      wizard.nextStep();
    } catch (error) {
      console.error("Error saving work experience:", error);
      addToast("เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง", "error");
    } finally {
      setIsLoading(false);
    }
  }

  // Handle Step 3 submission
  async function handleStep3Submit(data: Step3FormData) {
    setIsLoading(true);

    try {
      // Map education level string to number
      const levelMap: Record<string, number> = {
        'below_bachelor': 0,
        'bachelor': 1,
        'master': 2,
        'doctorate': 3,
      };

      // Transform and save education to Firestore
      const levelEntry = EDUCATION_LEVELS.find(
        level => level.label === data.education.level
      );
      const levelNumber = levelEntry ? levelMap[levelEntry.value] ?? 0 : 0;

      const transformedEducations = [{
        institution: data.education.institution,
        level: levelNumber,
        level_label: data.education.level,
        faculty: data.education.faculty,
        end_year: data.education.graduation_year,
        gpa: data.education.gpa?.toString(),
      }];

      await webCandidateSaveEducation(uid, transformedEducations, uid);

      // Save draft
      setDraftData((prev) => ({ ...prev, step3: data }));

      // Mark step as completed
      wizard.completeStep();
      wizard.setStepValid(3, true);

      addToast("บันทึกประวัติการศึกษาสำเร็จ", "success");

      // Move to step 4
      wizard.nextStep();
    } catch (error) {
      console.error("Error saving education:", error);
      addToast("เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง", "error");
    } finally {
      setIsLoading(false);
    }
  }

  // Handle Step 4 submission
  async function handleStep4Submit(data: Step4FormData) {
    setIsLoading(true);

    try {
      // Transform and save skills & languages to Firestore
      const transformedData = {
        skills: data.skills.map(skillName => ({
          name: skillName,
        })),
        languages: data.languages.map(lang => ({
          name: lang.name,
          level: lang.level,
        })),
      };

      await webCandidateSaveSkills(uid, transformedData, uid);

      // Save draft
      setDraftData((prev) => ({ ...prev, step4: data }));

      // Mark step as completed
      wizard.completeStep();
      wizard.setStepValid(4, true);

      addToast("บันทึกทักษะและภาษาสำเร็จ", "success");

      // Move to step 5
      wizard.nextStep();
    } catch (error) {
      console.error("Error saving skills & languages:", error);
      addToast("เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง", "error");
    } finally {
      setIsLoading(false);
    }
  }

  // Handle Step 5 submission
  async function handleStep5Submit(data: Step5FormData) {
    setIsLoading(true);

    try {
      // Transform and save job preferences to Firestore
      const transformedData = {
        job_types: data.job_types,
        positions: data.positions,
        salary_min: data.salary_min,
        salary_max: data.salary_max,
        is_negotiable: false,
        locations: data.locations,
        availability: data.availability as 'immediately' | '2_weeks' | '1_month' | '2_months_plus',
      };

      await webCandidateSavePreferences(uid, transformedData, uid);

      // Save draft
      setDraftData((prev) => ({ ...prev, step5: data }));

      // Mark step as completed
      wizard.completeStep();
      wizard.setStepValid(5, true);

      addToast("บันทึกความต้องการงานสำเร็จ", "success");

      // Wizard will auto-call onComplete after last step
    } catch (error) {
      console.error("Error saving job preferences:", error);
      addToast("เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง", "error");
    } finally {
      setIsLoading(false);
    }
  }

  // Handle wizard completion (after all 5 steps)
  async function handleWizardComplete() {
    setIsLoading(true);

    try {
      // Set isOnboarded flag in BOTH collections
      await Promise.all([
        webCandidateSetIsOnboarded(uid, true, uid),
        webUserInfoSetIsOnboarded(uid, true, uid),
      ]);

      addToast("สร้างโปรไฟล์สำเร็จ!", "success");

      // Redirect to profile dashboard
      router.push(`/jobsmarket/candidates/${uid}`);
    } catch (error) {
      console.error("Error completing onboarding:", error);
      addToast("เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง", "error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      {/* Wizard Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">สร้างโปรไฟล์ของคุณ</h1>
        <p className="mt-2 text-muted-foreground">
          กรอกข้อมูลให้ครบถ้วนเพื่อเพิ่มโอกาสในการได้งาน
        </p>

        {/* Progress Bar */}
        <div className="mt-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">
              ขั้นตอนที่ {wizard.currentStep} จาก {wizard.totalSteps}
            </span>
            <span className="text-muted-foreground">{wizard.progress}%</span>
          </div>
          <Progress value={wizard.progress} className="h-2" />
        </div>

        {/* Step Indicator */}
        <div className="mt-6 grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((step) => {
            const stepInfo = wizard.getStepInfo(step);
            const isCurrent = wizard.currentStep === step;
            const isCompleted = stepInfo?.isCompleted;

            return (
              <div
                key={step}
                className={`rounded-md p-2 text-center text-xs ${
                  isCurrent
                    ? "bg-primary text-primary-foreground"
                    : isCompleted
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <div className="font-medium">{step}</div>
                <div className="mt-1 truncate">{stepInfo?.title}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader className="sr-only">
          <h2>ขั้นตอนที่ {wizard.currentStep}</h2>
        </CardHeader>
        <CardContent className="p-6">
          {/* Step 1: Personal Information */}
          {wizard.currentStep === 1 && (
            <Step1PersonalInfo
              initialData={draftData.step1}
              onSubmit={handleStep1Submit}
              showBackButton={false}
              submitText="ถัดไป"
              isLoading={isLoading}
            />
          )}

          {/* Step 2: Work Experience */}
          {wizard.currentStep === 2 && (
            <Step2WorkExperience
              initialData={draftData.step2}
              onSubmit={handleStep2Submit}
              onBack={wizard.previousStep}
              showBackButton={true}
              submitText="ถัดไป"
              isLoading={isLoading}
            />
          )}

          {/* Step 3: Education */}
          {wizard.currentStep === 3 && (
            <Step3Education
              initialData={draftData.step3}
              onSubmit={handleStep3Submit}
              onBack={wizard.previousStep}
              showBackButton={true}
              submitText="ถัดไป"
              isLoading={isLoading}
            />
          )}

          {/* Step 4: Skills & Languages */}
          {wizard.currentStep === 4 && (
            <Step4Skills
              initialData={draftData.step4}
              onSubmit={handleStep4Submit}
              onBack={wizard.previousStep}
              showBackButton={true}
              submitText="ถัดไป"
              isLoading={isLoading}
            />
          )}

          {/* Step 5: Job Preferences */}
          {wizard.currentStep === 5 && (
            <Step5JobPreferences
              initialData={draftData.step5}
              onSubmit={handleStep5Submit}
              onBack={wizard.previousStep}
              showBackButton={true}
              submitText="เสร็จสิ้น"
              isLoading={isLoading}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
