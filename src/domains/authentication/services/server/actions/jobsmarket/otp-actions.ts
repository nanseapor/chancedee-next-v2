"use server";

/**
 * OTP Actions for Jobsmarket
 * Per BLS-01 §3.3 (sendVerificationOTPEmail), §3.4 (verifyOTPCode)
 * Per AUTH-R00 §8 Cross-Cutting Infrastructure
 *
 * Provides OTP generation, sending, and verification for:
 * - Email verification during registration
 * - Email change verification
 */

import { Filter } from "firebase-admin/firestore";
import client, { type MailDataRequired } from "@sendgrid/mail";
import { randomInt } from "crypto";
import {
  webOTPCodesCreate,
  webOTPCodesGetById,
  webOTPCodesGetByFilter,
  webOTPCodesUpdate,
} from "@/lib/database/actions/otp-codes";
import { withRateLimit } from "@/lib/utils/server/with-rate-limit";
import { getThaiErrorMessage } from "@/domains/authentication/utils/error-messages";
import type { FirebaseOTPData } from "@/types/auth.types";

/**
 * OTP send request input
 */
interface SendOTPInput {
  email: string;
}

/**
 * OTP send result
 */
interface SendOTPResult {
  success: boolean;
  refCode?: string;
  error?: string;
}

/**
 * OTP verify request input
 */
interface VerifyOTPInput {
  refCode: string;
  otpCode: string;
}

/**
 * OTP verify result
 */
interface VerifyOTPResult {
  success: boolean;
  error?: string;
}

/**
 * Send OTP verification email (implementation)
 * Per BLS-01 §3.3
 *
 * Flow:
 * 1. Generate 6-digit OTP and 10-char refCode
 * 2. Invalidate previous OTPs for same email
 * 3. Create new OTP record in otp_codes
 * 4. Send email via SendGrid
 * 5. Return refCode to client (NOT the OTP itself)
 *
 * @param input - Contains email address
 * @returns Success with refCode or error message
 */
async function sendVerificationOTPEmailImpl(
  input: SendOTPInput
): Promise<SendOTPResult> {
  try {
    const { email } = input;

    // Validate email format
    if (!isValidEmail(email)) {
      return {
        success: false,
        error: getThaiErrorMessage("INVALID_EMAIL").message,
      };
    }

    // Step 1: Generate OTP and refCode
    const otpCode = generateOTPCode(); // 6 digits
    const refCode = generateRefCode(); // 10 chars

    // Step 2: Invalidate previous OTPs for this email
    try {
      const emailFilter = Filter.where("email", "==", email);
      const statusFilter = Filter.where("status", "==", null);
      const filter = Filter.and(emailFilter, statusFilter);
      const existingOTPs = await webOTPCodesGetByFilter(filter);

      if (existingOTPs && existingOTPs.length > 0) {
        // Mark old OTPs as invalidated
        for (const otp of existingOTPs) {
          await webOTPCodesUpdate(
            {
              ...otp,
              status: "invalidated",
            },
            otp.uid,
            "system"
          );
        }
      }
    } catch (invalidateError) {
      console.warn("Failed to invalidate previous OTPs:", invalidateError);
      // Continue anyway - not critical
    }

    // Step 3: Store in Firestore
    const otpData: FirebaseOTPData = {
      uid: refCode, // Document ID = refCode
      email,
      otpCode,
      refCode,
      createDate: Date.now(),
      // status omitted = active (undefined in TS, null in Firestore)
    };

    await webOTPCodesCreate(otpData, refCode, "system");

    // Step 4: Send email via SendGrid
    try {
      await sendOTPEmail(email, otpCode, refCode);
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
      return {
        success: false,
        error: getThaiErrorMessage("OTP_SEND_FAILED").message,
      };
    }

    // Step 5: Return refCode only (not OTP)
    return {
      success: true,
      refCode,
    };
  } catch (error) {
    console.error("Send OTP failed:", error);
    return {
      success: false,
      error: getThaiErrorMessage("UNKNOWN_ERROR").message,
    };
  }
}

/**
 * Verify OTP code (implementation)
 * Per BLS-01 §3.4
 *
 * Flow:
 * 1. Fetch OTP record by refCode
 * 2. Check exists → OTP_NOT_FOUND
 * 3. Check status === null → OTP_ALREADY_USED
 * 4. Check within 15 minutes → OTP_EXPIRED
 * 5. Compare codes (constant-time) → INVALID_OTP
 * 6. Update status to 'verified'
 * 7. Return success
 *
 * @param input - Contains refCode and otpCode
 * @returns Success or error message
 */
async function verifyOTPCodeImpl(
  input: VerifyOTPInput
): Promise<VerifyOTPResult> {
  try {
    const { refCode, otpCode } = input;

    // Step 1: Fetch OTP record
    const otpRecord = await webOTPCodesGetById(refCode);

    if (!otpRecord) {
      return {
        success: false,
        error: getThaiErrorMessage("OTP_NOT_FOUND").message,
      };
    }

    // Step 2: Check status
    if (otpRecord.status === "verified") {
      return {
        success: false,
        error: getThaiErrorMessage("OTP_ALREADY_USED").message,
      };
    }

    if (otpRecord.status === "invalidated" || otpRecord.status === "expired") {
      return {
        success: false,
        error: getThaiErrorMessage("OTP_EXPIRED").message,
      };
    }

    // Step 3: Check expiry (15 minutes)
    const TTL_MS = 15 * 60 * 1000; // 15 minutes
    const createdAt = otpRecord.createDate;
    const now = Date.now();

    if (now - createdAt > TTL_MS) {
      // Mark as expired
      await webOTPCodesUpdate(
        { ...otpRecord, status: "expired" },
        refCode,
        "system"
      );
      return {
        success: false,
        error: getThaiErrorMessage("OTP_EXPIRED").message,
      };
    }

    // Step 4: Compare OTP (constant-time to prevent timing attacks)
    const isValid = constantTimeCompare(otpCode, otpRecord.otpCode);

    if (!isValid) {
      return {
        success: false,
        error: getThaiErrorMessage("INVALID_OTP").message,
      };
    }

    // Step 5: Mark as verified
    await webOTPCodesUpdate(
      { ...otpRecord, status: "verified" },
      refCode,
      "system"
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error("Verify OTP failed:", error);
    return {
      success: false,
      error: getThaiErrorMessage("UNKNOWN_ERROR").message,
    };
  }
}

/**
 * Send OTP email via SendGrid
 * Per BLS-01 §3.3 Email Template
 *
 * @param email - Recipient email
 * @param otpCode - 6-digit OTP
 * @param refCode - 10-char reference code
 */
async function sendOTPEmail(
  email: string,
  otpCode: string,
  refCode: string
): Promise<void> {
  const API_KEY = String(process.env.SENDGRID_API_KEY);
  client.setApiKey(API_KEY);

  const OTP_TEMPLATE_ID = "d-49496573d0954f62a25110c564ad89d3";

  const mailData: MailDataRequired = {
    from: "admin@chancedee.com",
    subject: "OTP from CHANCEDEE",
    templateId: OTP_TEMPLATE_ID,
    personalizations: [
      {
        to: [{ email }],
        dynamicTemplateData: {
          refCode,
          otpCode,
          date: new Date().toLocaleDateString("th-TH", {
            timeZone: "Asia/Bangkok",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      },
    ],
  };

  await client.send(mailData);
}

/**
 * Generate 6-digit OTP code
 * Uses crypto.randomInt for secure random generation
 */
function generateOTPCode(): string {
  return randomInt(100000, 999999).toString();
}

/**
 * Generate 10-character reference code
 * Uses alphanumeric characters, excluding ambiguous ones (0, O, I, 1)
 */
function generateRefCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Exclude 0, O, I, 1
  let result = "";

  for (let i = 0; i < 10; i++) {
    const randomIndex = randomInt(0, chars.length);
    result += chars[randomIndex];
  }

  return result;
}

/**
 * Constant-time string comparison to prevent timing attacks
 * Per security best practices for OTP verification
 *
 * @param a - First string
 * @param b - Second string
 * @returns True if strings are equal
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Validate email format
 *
 * @param email - Email address to validate
 * @returns True if valid email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * EXPORTED: Send OTP verification email with rate limiting
 * Rate limit: 5 requests per 15 minutes per email (AUTH-R00 config)
 */
export async function sendVerificationOTPEmail(
  input: SendOTPInput
): Promise<SendOTPResult> {
  // Call the rate-limited impl using withRateLimit's wrapper pattern
  const wrappedFn = withRateLimit(
    sendVerificationOTPEmailImpl,
    "OTP_REQUEST",
    (i: SendOTPInput) => i.email
  );
  return await wrappedFn(input);
}

/**
 * EXPORTED: Verify OTP code with rate limiting
 * Rate limit: 5 attempts per 10 minutes per refCode (AUTH-R00 config)
 */
export async function verifyOTPCode(
  input: VerifyOTPInput
): Promise<VerifyOTPResult> {
  // Call the rate-limited impl using withRateLimit's wrapper pattern
  const wrappedFn = withRateLimit(
    verifyOTPCodeImpl,
    "OTP_VERIFY",
    (i: VerifyOTPInput) => i.refCode
  );
  return await wrappedFn(input);
}
