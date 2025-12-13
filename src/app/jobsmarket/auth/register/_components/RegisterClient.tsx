/**
 * Register Client Component
 * Per AUTH-R02 Implementation Plan Section 5
 * Per RIS AUTH-R02 §6 - State Machine Implementation
 *
 * Orchestrates the entire registration flow for both candidate and company roles
 */

"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAtom } from "jotai";
import {
  registerPageStateAtom,
  selectedRoleAtom,
  companyModeAtom,
  emailAtom,
} from "@/store/jobsmarket/register-atoms";
import { useOTPVerification } from "@/hooks/jobsmarket/use-otp-verification";

// Components
import { RoleSelectCard } from "@/components/jobsmarket/auth/RoleSelectCard";
import { CandidateAuthForm } from "@/components/jobsmarket/auth/CandidateAuthForm";
import { CompanyModeSelect } from "@/components/jobsmarket/auth/CompanyModeSelect";
import { CompanyAuthForm } from "@/components/jobsmarket/auth/CompanyAuthForm";
import { OTPVerifyForm } from "@/components/jobsmarket/auth/OTPVerifyForm";
import { OTPResendButton } from "@/components/jobsmarket/auth/OTPResendButton";
import { PasswordCreateForm } from "@/components/jobsmarket/auth/PasswordCreateForm";
import { CompanyDetailsFormModeA } from "@/components/jobsmarket/auth/CompanyDetailsFormModeA";
import { CompanyDetailsFormModeB } from "@/components/jobsmarket/auth/CompanyDetailsFormModeB";
import { RegistrationSuccessCard } from "@/components/jobsmarket/auth/RegistrationSuccessCard";

/**
 * Main Registration Client Component
 * State machine controller
 */
export function RegisterClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State atoms
  const [pageState, setPageState] = useAtom(registerPageStateAtom);
  const [selectedRole, setSelectedRole] = useAtom(selectedRoleAtom);
  const [companyMode, setCompanyMode] = useAtom(companyModeAtom);
  const [email] = useAtom(emailAtom);

  // OTP hook
  const {
    sendOTP,
    verifyOTP,
    resendOTP,
    isLoading: otpLoading,
    countdown,
    refCode,
  } = useOTPVerification();

  /**
   * Initialize state from URL query parameters
   * Per RIS AUTH-R02 §6 - URL state restoration
   */
  useEffect(() => {
    const role = searchParams.get("role") as "candidate" | "company" | null;
    const mode = searchParams.get("mode") as "new" | "join" | null;
    const step = searchParams.get("step");

    if (role) {
      setSelectedRole(role);
    }

    if (mode && role === "company") {
      setCompanyMode(mode);
    }

    // Restore state based on step parameter
    if (step === "pending") {
      setPageState("pending");
    }
  }, [searchParams, setSelectedRole, setCompanyMode, setPageState]);

  /**
   * Update URL with current state
   */
  const updateURL = (params: string) => {
    router.replace(`/jobsmarket/auth/register${params}`, { scroll: false });
  };

  /**
   * State Machine Transitions
   * Per RIS AUTH-R02 §6.1 and §6.2
   */

  // Step 1: Role Select
  const handleRoleSelect = (role: "candidate" | "company") => {
    setSelectedRole(role);

    if (role === "candidate") {
      setPageState("auth_form");
      updateURL("?role=candidate");
    } else {
      // Company: show mode select
      updateURL("?role=company");
      // Note: We'll show CompanyModeSelect component directly
    }
  };

  // Step 2: Company Mode Select (company only)
  const handleCompanyModeSelect = (mode: "new" | "join") => {
    setCompanyMode(mode);
    setPageState("auth_form");
    updateURL(`?role=company&mode=${mode}`);
  };

  // Step 3: Google Auth (candidate only)
  const handleGoogleAuth = async () => {
    setPageState("google_auth");

    try {
      // TODO: Implement Firebase Google OAuth
      // const { getAuth, signInWithPopup, GoogleAuthProvider } = await import("firebase/auth");
      // const auth = getAuth(app);
      // const provider = new GoogleAuthProvider();
      // const result = await signInWithPopup(auth, provider);

      console.log("Google OAuth not yet implemented");
    } catch (error) {
      console.error("Google auth error:", error);
      setPageState("auth_form");
    }
  };

  // Step 4: Email Submit (triggers OTP send)
  const handleEmailSubmit = async (email: string) => {
    setPageState("sending_otp");

    const result = await sendOTP(email);

    if (result.success) {
      setPageState("otp_verify");
    } else {
      setPageState("auth_form");
    }
  };

  // Step 5: OTP Verify
  const handleOTPVerify = async (otpCode: string) => {
    const result = await verifyOTP(otpCode);

    if (result.success) {
      // Next step depends on role
      if (selectedRole === "candidate") {
        setPageState("create_password");
      } else {
        // Company: create password
        setPageState("create_password");
      }
    }
  };

  // Step 6: OTP Resend
  const handleOTPResend = async () => {
    await resendOTP(email);
  };

  // Step 7: Password Create (for email flow)
  const handlePasswordCreate = async (password: string) => {
    setPageState("creating_firebase");

    try {
      // TODO: Create Firebase Auth user with email/password
      // const { getAuth, createUserWithEmailAndPassword } = await import("firebase/auth");
      // const auth = getAuth(app);
      // const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // const firebaseUid = userCredential.user.uid;

      console.log("Firebase user creation not yet implemented");

      // For now, continue to next step
      if (selectedRole === "candidate") {
        setPageState("creating_account");
        // TODO: Call createCandidateAccountEmail server action
        // const result = await createCandidateAccountEmail({ firebaseUid, email });

        // On success: redirect to onboarding
        // router.push(`/jobsmarket/candidates/${firebaseUid}?tab=onboarding`);
      } else {
        // Company: show company details form
        setPageState("company_details");
      }
    } catch (error) {
      console.error("Password create error:", error);
      setPageState("create_password");
    }
  };

  // Step 8: Company Details Submit (Mode A)
  const handleCompanyDetailsModeA = async (data: any) => {
    setPageState("uploading_doc");

    try {
      // TODO: Upload document to Firebase Storage
      // TODO: Create company_information and user_accounts
      // const result = await createCompanyAccountModeA({ ...data });

      console.log("Company Mode A submission not yet implemented");

      setPageState("pending");
      updateURL(`?role=company&mode=new&step=pending`);
    } catch (error) {
      console.error("Company Mode A error:", error);
      setPageState("company_details");
    }
  };

  // Step 9: Company Details Submit (Mode B)
  const handleCompanyDetailsModeB = async (data: any) => {
    setPageState("uploading_doc");

    try {
      // TODO: Upload name card to Firebase Storage
      // TODO: Create user_accounts with pending status
      // const result = await createCompanyAccountModeB({ ...data });

      console.log("Company Mode B submission not yet implemented");

      setPageState("pending");
      updateURL(`?role=company&mode=join&step=pending`);
    } catch (error) {
      console.error("Company Mode B error:", error);
      setPageState("company_details");
    }
  };

  // Stub for company search (Mode B)
  const handleCompanySearch = async (query: string) => {
    // TODO: Implement company search via Firestore
    console.log("Company search:", query);
    return [];
  };

  /**
   * Render based on current state
   * Per RIS AUTH-R02 §6.1 and §6.2 state diagrams
   */
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        {/* State: role_select */}
        {pageState === "role_select" && (
          <RoleSelectCard onSelectRole={handleRoleSelect} />
        )}

        {/* State: Company mode select (before auth_form) */}
        {selectedRole === "company" && pageState === "role_select" && (
          <CompanyModeSelect onSelectMode={handleCompanyModeSelect} />
        )}

        {/* State: auth_form - Candidate */}
        {(pageState === "auth_form" || pageState === "sending_otp") && selectedRole === "candidate" && (
          <CandidateAuthForm
            onGoogleAuth={handleGoogleAuth}
            onEmailSubmit={handleEmailSubmit}
            isLoading={pageState === "sending_otp"}
          />
        )}

        {/* State: auth_form - Company */}
        {(pageState === "auth_form" || pageState === "sending_otp") && selectedRole === "company" && (
          <CompanyAuthForm
            onEmailSubmit={handleEmailSubmit}
            onBack={() => {
              setSelectedRole(null);
              setPageState("role_select");
              updateURL("");
            }}
            isLoading={pageState === "sending_otp"}
          />
        )}

        {/* State: otp_verify */}
        {pageState === "otp_verify" && (
          <div className="space-y-4">
            <OTPVerifyForm
              email={email}
              refCode={refCode}
              isLoading={otpLoading}
              onVerify={handleOTPVerify}
            />
            <OTPResendButton
              countdown={countdown}
              isLoading={otpLoading}
              onResend={handleOTPResend}
            />
          </div>
        )}

        {/* State: create_password */}
        {(pageState === "create_password" || pageState === "creating_firebase") && (
          <PasswordCreateForm
            onSubmit={handlePasswordCreate}
            isLoading={pageState === "creating_firebase"}
          />
        )}

        {/* State: company_details - Mode A */}
        {(pageState === "company_details" || pageState === "uploading_doc" || pageState === "submitting_request") && companyMode === "new" && (
          <CompanyDetailsFormModeA
            onSubmit={handleCompanyDetailsModeA}
            onBack={() => setPageState("create_password")}
            isLoading={pageState === "uploading_doc" || pageState === "submitting_request"}
          />
        )}

        {/* State: company_details - Mode B */}
        {(pageState === "company_details" || pageState === "uploading_doc" || pageState === "submitting_request") && companyMode === "join" && (
          <CompanyDetailsFormModeB
            onSearchCompany={handleCompanySearch}
            onSubmit={handleCompanyDetailsModeB}
            onBack={() => setPageState("create_password")}
            isLoading={pageState === "uploading_doc" || pageState === "submitting_request"}
          />
        )}

        {/* State: pending or success */}
        {(pageState === "pending" || pageState === "success") && selectedRole && (
          <RegistrationSuccessCard
            role={selectedRole}
            mode={selectedRole === "company" ? companyMode : undefined}
          />
        )}

        {/* Loading States */}
        {["creating_firebase", "creating_session", "creating_account", "uploading_doc", "submitting_request"].includes(pageState) && (
          <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-gray-600">
              {pageState === "creating_firebase" && "กำลังสร้างบัญชี..."}
              {pageState === "creating_session" && "กำลังสร้างเซสชัน..."}
              {pageState === "creating_account" && "กำลังบันทึกข้อมูล..."}
              {pageState === "uploading_doc" && "กำลังอัพโหลดเอกสาร..."}
              {pageState === "submitting_request" && "กำลังส่งคำขอ..."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
