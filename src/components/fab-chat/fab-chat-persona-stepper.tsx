"use client";

import { saveUserPersona } from "@/domains/fab-chat/services/server/actions/persona";
import { selectOptionsGet } from "@/domains/admin/services/server/actions/master-data-management";
import { getFirebaseAuth } from "@/lib/firebase";
import { type educationHistory } from "@/types/candidate.types";
import { type PersonaData } from "@/types/persona.types";
import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { ErrorMessage } from "./persona-steps/error-message";
import { PersonaLoading } from "./persona-steps/persona-loading";
import { StepBirthdate } from "./persona-steps/step-birthdate";
import { StepCareerLevel } from "./persona-steps/step-career-level";
import { StepConsent } from "./persona-steps/step-consent";
import { StepEducation } from "./persona-steps/step-education";
import { StepGender } from "./persona-steps/step-gender";
import { WelcomeMessage } from "./persona-steps/welcome-message";

type PersonaStepperProps = {
  onComplete: () => void;
  missingFields: string[];
  existingData?: PersonaData;
};

export function FabChatPersonaStepper({
  onComplete,
  missingFields,
  existingData,
}: PersonaStepperProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Initialize form data with existing data if available
  const [careerLevel, setCareerLevel] = useState<string>(
    existingData?.careerLevel || "",
  );
  const [birthdate, setBirthdate] = useState<Date>(
    existingData?.birthdate ? new Date(existingData.birthdate) : new Date(),
  );
  const [hasSelectedBirthdate, setHasSelectedBirthdate] = useState(
    !!existingData?.birthdate,
  );
  const [gender, setGender] = useState<string>(existingData?.gender || "");
  const [selectedMonth, setSelectedMonth] = useState<number>(
    existingData?.birthdate
      ? new Date(existingData.birthdate).getMonth() + 1
      : new Date().getMonth() + 1,
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    existingData?.birthdate
      ? new Date(existingData.birthdate).getFullYear()
      : new Date().getFullYear(),
  );
  const [isConsent, setIsConsent] = useState<boolean>(
    existingData?.isConsent || false,
  );

  // Initialize highest education with existing data or defaults
  const [highestEducation, setHighestEducation] = useState<educationHistory>(() => {
    // Check if existing data has valid education level
    if (existingData?.educationLevel && existingData.educationLevel.length > 0) {
      const existing = existingData.educationLevel[0];
      // Validate that required fields exist and are valid
      if (existing.educationLevel && existing.educationLevel > 0) {
        return existing;
      }
    }

    // Return default empty state if no valid existing data
    return {
      endYear: 0,
      gpax: "",
      highlights: "",
      institution: "",
      major: "",
      minor: "",
      note: "",
      educationLabel: "",
      educationLevel: 0,
      startYear: 0,
    };
  });

  // Fetch education level options
  const { data: educationLevelOptions } = useSWR(
    "master_education_levels",
    async () =>
      selectOptionsGet({
        collectionName: "master_education_levels",
        code: "",
      }),
  );

  // Auto-scroll to bottom when new step appears
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [currentStep]);

  const handleStepNavigation = () => {
    // Just move to next step (don't save yet)
    if (currentStep < 4) {
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, 300);
    }
  };

  const handleBirthdateChange = (date: Date) => {
    setBirthdate(date);
    setHasSelectedBirthdate(true);
  };

  const handleFinalSave = async () => {
    // Final step - save ALL collected data
    setIsSaving(true);
    setError(null);

    console.log("🚀 handleFinalSave called with state:", {
      careerLevel,
      birthdate: birthdate.getTime(),
      hasSelectedBirthdate,
      gender,
      educationLevel: highestEducation.educationLevel,
      educationMajor: highestEducation.major,
      educationInstitution: highestEducation.institution,
      isConsent,
      currentStep,
    });

    try {
      const user = getFirebaseAuth().currentUser;
      if (!user) {
        setError("กรุณาเข้าสู่ระบบอีกครั้ง");
        setIsSaving(false);
        return;
      }

      // Validate all required fields before saving
      if (!careerLevel) {
        setError("กรุณาเลือกระดับประสบการณ์การทำงาน");
        setIsSaving(false);
        return;
      }

      if (!hasSelectedBirthdate || !birthdate) {
        setError("กรุณาเลือกวันเดือนปีเกิด");
        setIsSaving(false);
        return;
      }

      if (!gender) {
        setError("กรุณาเลือกเพศ");
        setIsSaving(false);
        return;
      }

      if (
        !highestEducation.educationLevel ||
        !highestEducation.major ||
        !highestEducation.institution
      ) {
        setError(
          "กรุณากรอกข้อมูลการศึกษาให้ครบถ้วน (ระดับการศึกษา, สาขาวิชา, สถาบัน)",
        );
        setIsSaving(false);
        return;
      }

      if (!isConsent) {
        setError("กรุณายอมรับข้อตกลงและเงื่อนไข");
        setIsSaving(false);
        return;
      }

      const idToken = await user.getIdToken();

      // Prepare education data - only keep highest education level
      let finalEducationArray: educationHistory[] = [];

      if (
        existingData?.educationLevel &&
        existingData.educationLevel.length > 0
      ) {
        const existingHighest = existingData.educationLevel[0];
        const newLevel = highestEducation.educationLevel;
        const existingLevel = existingHighest.educationLevel;

        // Validate that existingLevel is a valid number > 0
        if (!existingLevel || existingLevel <= 0) {
          // Existing data is invalid, replace with new data
          finalEducationArray = [highestEducation];
          console.log(`✨ Replacing invalid education data with level ${newLevel}`);
        } else if (newLevel >= existingLevel) {
          // New level is same or higher - update the record
          finalEducationArray = [highestEducation];
          console.log(
            `📝 Updating education: Level ${existingLevel} → ${newLevel}`,
          );
        } else {
          // New level is lower - keep existing higher education, show warning
          finalEducationArray = existingData.educationLevel;
          console.log(
            `⚠️ Keeping existing higher education level ${existingLevel}, ignoring input level ${newLevel}`,
          );
          const educationLabelText = existingHighest.educationLabel || `ระดับ ${existingLevel}`;
          setError(`คุณมีวุฒิการศึกษา${educationLabelText}อยู่แล้ว`);
          setIsSaving(false);
          return;
        }
      } else {
        // No existing education - use new input
        finalEducationArray = [highestEducation];
        console.log(
          `✨ Adding new education: Level ${highestEducation.educationLevel}`,
        );
      }

      const personaData: PersonaData = {
        careerLevel: careerLevel,
        birthdate: birthdate.getTime(),
        gender: gender,
        educationLevel: finalEducationArray,
        isConsent: isConsent,
      };

      console.log(`💾 Saving all persona data:`, personaData);
      const result = await saveUserPersona(idToken, personaData);
      console.log(`${result.success ? "✅" : "❌"} Save result:`, result);

      if (result.success) {
        // Show loading transition before calling onComplete
        setIsLoading(true);
        setTimeout(() => {
          onComplete();
        }, 1000);
      } else {
        setError(result.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        setIsSaving(false);
      }
    } catch (err) {
      console.error("Error saving persona:", err);
      setError("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      setIsSaving(false);
    }
  };

  // Show loading transition after all steps complete
  if (isLoading) {
    return <PersonaLoading />;
  }

  return (
    <div className="absolute inset-0 bg-gray-50 dark:bg-gray-800 flex flex-col z-10">
      {/* Chat Messages Container */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3"
      >
        {/* Welcome Message */}
        <WelcomeMessage />

        {/* Step 1: Career Level */}
        {currentStep >= 0 && (
          <StepCareerLevel
            value={careerLevel}
            onChange={setCareerLevel}
            onNext={handleStepNavigation}
            currentStep={currentStep}
            isSaving={isSaving}
          />
        )}

        {/* Step 2: Birthdate */}
        {currentStep >= 1 && (
          <StepBirthdate
            birthdate={birthdate}
            onBirthdateChange={handleBirthdateChange}
            hasSelected={hasSelectedBirthdate}
            onNext={handleStepNavigation}
            currentStep={currentStep}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
          />
        )}

        {/* Step 3: Gender */}
        {currentStep >= 2 && (
          <StepGender
            value={gender}
            onChange={setGender}
            onNext={handleStepNavigation}
            currentStep={currentStep}
            isSaving={isSaving}
          />
        )}

        {/* Step 4: Education */}
        {currentStep >= 3 && (
          <StepEducation
            education={highestEducation}
            onEducationChange={setHighestEducation}
            educationOptions={educationLevelOptions || []}
            onNext={handleStepNavigation}
            currentStep={currentStep}
          />
        )}

        {/* Step 5: Consent */}
        {currentStep >= 4 && (
          <StepConsent
            isConsent={isConsent}
            onConsentChange={setIsConsent}
            onSave={handleFinalSave}
            isSaving={isSaving}
            currentStep={currentStep}
          />
        )}

        {/* Error Message */}
        {error && <ErrorMessage error={error} />}
      </div>

      {/* Message Input Placeholder (disabled) */}
      <div className="p-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="relative">
          <input
            type="text"
            disabled
            placeholder="พิมพ์ข้อความของคุณ..."
            className="w-full px-4 py-3 pr-12 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-sm text-gray-400 dark:text-gray-500 cursor-not-allowed"
          />
          <button
            disabled
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-gray-300 dark:bg-gray-600 text-white cursor-not-allowed"
            aria-label="ส่งข้อความ"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <path d="m22 2-7 20-4-9-9-4Z" />
              <path d="M22 2 11 13" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
