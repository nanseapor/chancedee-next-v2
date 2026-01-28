"use server";

/**
 * Interview Management Server Actions
 *
 * BLS-05: Interview Actions
 * - BLS-05-01: Schedule Interview
 * - BLS-05-02: Reschedule Interview
 * - BLS-05-03: Cancel Interview
 * - BLS-05-04: Confirm Interview
 * - BLS-05-05: Decline Interview
 */

import { getSessionUser } from "@/lib/firebase/admin-auth";
import {
  webJobInterviewGetById,
  webJobInterviewCreate,
  webJobInterviewUpdate,
} from "./job-interviews";
import {
  webJobApplicationGetById,
  webJobApplicationUpdate,
} from "./job-applications";
import { webCandidateInformationGetById, webCandidateInformationUpdate } from "./candidate-information";
import { webCompanyInformationGetById } from "./company-information";
import { webWalletTransactionCreate } from "./wallet-transactions";
import { webPocketsUpdate, webPocketsGetById } from "./pockets";
import { awardFirstInterviewReward } from "./wallet-rewards";
import {
  sendEmailNotification,
  createInterviewScheduledEmail,
  createInterviewRescheduledEmail,
  createInterviewCancelledEmail,
  createInterviewConfirmedEmail,
  createInterviewDeclinedEmail,
} from "./email-notifications";
import { messagesRepository } from "../repositories/messages-repository";
import { chatRepository } from "../repositories/chat-repository";
import { FirebaseJobInterviewData } from "@/types/interview.types";
import { MasterJobApplicationStatuses } from "@/constants/application";
import { revalidatePath } from "next/cache";

// ============================================================================
// Types
// ============================================================================

interface ScheduleInterviewInput {
  applicationId: string;
  date: string; // ISO date string YYYY-MM-DD
  from: string; // HH:mm
  to: string; // HH:mm
  channel: "online" | "onsite";
  location?: string;
  meetingLink?: string;
  note?: string;
}

interface ScheduleInterviewResult {
  success: boolean;
  interviewId?: string;
  error?: string;
}

interface ConfirmInterviewInput {
  interviewId: string;
}

interface ConfirmInterviewResult {
  success: boolean;
  rewardAwarded?: boolean;
  error?: string;
}

interface DeclineInterviewInput {
  interviewId: string;
  reason?: string;
}

interface DeclineInterviewResult {
  success: boolean;
  error?: string;
}

interface CancelInterviewInput {
  interviewId: string;
  reason?: string;
}

interface CancelInterviewResult {
  success: boolean;
  error?: string;
}

interface RescheduleInterviewInput {
  interviewId: string;
  date: string;
  from: string;
  to: string;
  channel?: "online" | "onsite";
  location?: string;
  room?: string;
}

interface RescheduleInterviewResult {
  success: boolean;
  error?: string;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Parse date and time strings to timestamp
 */
function parseAppointmentTimestamp(date: string, time: string): number {
  const dateTime = new Date(`${date}T${time}:00`);
  return dateTime.getTime();
}

/**
 * Check if a date is in the future (not today, not past)
 */
function isFutureDate(date: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  return targetDate.getTime() > today.getTime();
}

/**
 * Check if end time is after start time
 */
function isValidTimeRange(from: string, to: string): boolean {
  const fromParts = from.split(":");
  const toParts = to.split(":");
  const fromHour = parseInt(fromParts[0] || "0", 10);
  const fromMin = parseInt(fromParts[1] || "0", 10);
  const toHour = parseInt(toParts[0] || "0", 10);
  const toMin = parseInt(toParts[1] || "0", 10);

  const fromMinutes = fromHour * 60 + fromMin;
  const toMinutes = toHour * 60 + toMin;

  return toMinutes > fromMinutes;
}

// ============================================================================
// BLS-05-01: Schedule Interview
// ============================================================================

/**
 * Schedule a new interview
 *
 * Requirements:
 * - BLS-05-01.auth: User must be company member
 * - BLS-05-01.validation.exists: Application must exist
 * - BLS-05-01.validation.status: Application status must allow scheduling
 * - BLS-05-01.validation.future: Date must be in future
 * - BLS-05-01.validation.time: End time must be after start time
 * - BLS-05-01.validation.location: Location required when onsite
 * - BLS-05-01.validation.note: Note max 500 characters
 * - BLS-05-01.create: Create interview record
 * - BLS-05-01.side-effect.status: Update application status to 'scheduled'
 * - BLS-05-01.side-effect.message: Create interview message in chat
 */
export async function scheduleInterview(
  input: ScheduleInterviewInput
): Promise<ScheduleInterviewResult> {
  // 1. Authentication check
  const session = await getSessionUser();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }

  // 2. Authorization check - must be company member
  if (!session.companyId) {
    throw new Error("FORBIDDEN");
  }

  // 3. Validate application exists
  const application = await webJobApplicationGetById(input.applicationId);
  if (!application) {
    throw new Error("APPLICATION_NOT_FOUND");
  }

  // 4. Validate application status allows scheduling
  const schedulableStatuses = ["accepted", "applied", "read"];
  if (!schedulableStatuses.includes(application.status)) {
    throw new Error("INVALID_APPLICATION_STATUS");
  }

  // 5. Validate date is in future
  if (!isFutureDate(input.date)) {
    throw new Error("INVALID_DATE");
  }

  // 6. Validate time range
  if (!isValidTimeRange(input.from, input.to)) {
    throw new Error("INVALID_TIME_RANGE");
  }

  // 7. Validate location for onsite
  if (input.channel === "onsite" && !input.location) {
    throw new Error("LOCATION_REQUIRED");
  }

  // 8. Validate note length
  if (input.note && input.note.length > 500) {
    throw new Error("NOTE_TOO_LONG");
  }

  // 9. Create interview record
  const appointment = parseAppointmentTimestamp(input.date, input.from);

  const interviewData: FirebaseJobInterviewData = {
    uid: "",
    jobId: application.jobId,
    applicationId: input.applicationId,
    candidateId: application.candidateId,
    companyId: application.companyId,
    candidateName: "", // Will be populated from application
    companyName: application.companyName || "",
    channel: input.channel,
    status: MasterJobApplicationStatuses.scheduled,
    appointment,
    from: input.from,
    to: input.to,
    location: input.location || "",
    room: input.meetingLink || "",
    note: input.note || "",
    isCancel: false,
    isAccepted: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const interviewId = await webJobInterviewCreate(
    interviewData,
    session.uid
  );

  // 10. Update application status to 'scheduled'
  await webJobApplicationUpdate(
    {
      ...application,
      status: MasterJobApplicationStatuses.scheduled,
    },
    session.uid,
    input.applicationId
  );

  // 11. Create interview message in chat (if chat exists)
  if (application.chatId) {
    try {
      const room = await chatRepository.getById(application.chatId);
      if (room) {
        await messagesRepository.create(
          {
            uid: "",
            roomId: application.chatId,
            messageId: "",
            senderId: session.uid,
            timestamp: Date.now(),
            type: "interview",
            message: "นัดสัมภาษณ์",
            name: "",
            avatar: "",
            unread: [],
            interviewId,
            interviewDate: input.date,
            interviewTimeFrom: input.from,
            interviewTimeTo: input.to,
            interviewChannel: input.channel,
            interviewLocation: input.location,
            interviewStatus: "scheduled",
            jobId: application.jobId,
            applicationId: input.applicationId,
            candidateId: application.candidateId,
            companyId: application.companyId,
            note: input.note,
            createdBy: session.uid,
            updatedBy: session.uid,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
          session.uid
        );
      }
    } catch (error) {
      // If message creation fails, throw to rollback
      throw new Error("Message creation failed");
    }
  }

  revalidatePath("/jobsmarket/chat");

  // 12. Send interview scheduled email notification
  if (application.candidateId) {
    const candidate = await webCandidateInformationGetById(application.candidateId);
    if (candidate?.email) {
      const candidateName = candidate.firstnameTH || candidate.nicknameTH || 'ผู้สมัคร';
      const formattedDate = formatThaiDate(input.date);

      const emailData = await createInterviewScheduledEmail(
        candidateName,
        application.jobTitle || 'ตำแหน่งงาน',
        application.companyName || 'บริษัท',
        formattedDate,
        input.from,
        input.to,
        input.channel,
        input.location
      );

      await sendEmailNotification({
        email: candidate.email,
        emailData,
        notificationType: 'interview_scheduled',
      });
    }
  }

  return {
    success: true,
    interviewId,
  };
}

/**
 * Format date to Thai format
 */
function formatThaiDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ============================================================================
// BLS-05-04: Confirm Interview
// ============================================================================

/**
 * Candidate confirms an interview
 *
 * Requirements:
 * - BLS-05-04.auth: User must be candidate
 * - BLS-05-04.validation.exists: Interview must exist
 * - BLS-05-04.validation.status: Status must be 'scheduled'
 * - BLS-05-04.validation.expired: Interview must not be expired
 * - BLS-05-04.update: Update interview status to 'confirmed'
 * - BLS-05-04.flag: Set is_accepted to true
 * - BLS-05-04.reward: Award 100 coins for first interview
 * - BLS-05-04.side-effect.status: Update application status to 'confirmed'
 */
export async function confirmInterview(
  input: ConfirmInterviewInput
): Promise<ConfirmInterviewResult> {
  // 1. Authentication check
  const session = await getSessionUser();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }

  // 2. Authorization check - must be candidate
  if (!session.candidateId || session.companyId) {
    throw new Error("FORBIDDEN");
  }

  // 3. Get interview
  const interview = await webJobInterviewGetById(input.interviewId);
  if (!interview) {
    throw new Error("INTERVIEW_NOT_FOUND");
  }

  // 4. Validate ownership
  if (interview.candidateId !== session.candidateId) {
    throw new Error("FORBIDDEN");
  }

  // 5. Validate status is 'scheduled'
  if (interview.status === "confirmed") {
    throw new Error("ALREADY_CONFIRMED");
  }
  if (interview.status === "cancelled") {
    throw new Error("INTERVIEW_CANCELLED");
  }
  if (interview.status === "declined") {
    throw new Error("INVALID_INTERVIEW_STATUS");
  }
  if (interview.status !== "scheduled") {
    throw new Error("INVALID_INTERVIEW_STATUS");
  }

  // 6. Validate not expired
  if (interview.appointment < Date.now()) {
    throw new Error("INTERVIEW_EXPIRED");
  }

  // 7. Update interview status
  const updatedInterview: FirebaseJobInterviewData = {
    ...interview,
    status: MasterJobApplicationStatuses.confirmed,
    isAccepted: true,
    updatedAt: Date.now(),
  };

  await webJobInterviewUpdate(updatedInterview, session.uid, input.interviewId);

  // 8. Update application status
  if (interview.applicationId) {
    const application = await webJobApplicationGetById(interview.applicationId);
    if (application) {
      await webJobApplicationUpdate(
        {
          ...application,
          status: MasterJobApplicationStatuses.confirmed,
        },
        session.uid,
        interview.applicationId
      );
    }
  }

  // 9. Check and award first interview reward
  let rewardAwarded = false;
  const candidateInfo = await webCandidateInformationGetById(session.candidateId);

  if (candidateInfo && !candidateInfo.isFirstInterviewerRewarded) {
    // Award 100 coins - create transaction record
    await webWalletTransactionCreate(
      {
        transactionId: "",
        transactionOwner: session.candidateId,
        transactionOrigin: "first_interview_reward",
        transactionType: "deposit",
        transactionAmount: 100,
        transactionTime: Date.now(),
        remark: "รางวัลสัมภาษณ์ครั้งแรก",
      },
      session.candidateId,
      "coin"
    );

    // Update pocket balance
    const currentPocket = await webPocketsGetById(session.candidateId, "coin");
    const currentBalance = currentPocket?.balance ?? 0;
    await webPocketsUpdate(
      {
        uid: session.candidateId,
        currency: "coin",
        balance: currentBalance + 100,
        latest: currentPocket?.latest ?? [],
      },
      session.candidateId,
      session.candidateId,
      "coin"
    );

    // Update flag
    await webCandidateInformationUpdate(
      {
        ...candidateInfo,
        isFirstInterviewerRewarded: true,
      },
      session.uid,
      session.candidateId
    );

    rewardAwarded = true;
  }

  // 10. Send interview confirmed email notification to company
  if (interview.companyId) {
    const company = await webCompanyInformationGetById(interview.companyId);
    // Email exists in Firestore but isn't typed in FirebaseCompanyData
    const companyEmail = (company as { email?: string })?.email;
    if (company && companyEmail) {
      const companyName = company.companyName || "บริษัท";
      const candidateName = candidateInfo?.firstnameTH || candidateInfo?.nicknameTH || "ผู้สมัคร";
      const application = interview.applicationId
        ? await webJobApplicationGetById(interview.applicationId)
        : null;
      const jobTitle = application?.jobTitle || "ตำแหน่งงาน";
      const interviewDateStr = new Date(interview.appointment).toISOString().split("T")[0] || "";

      const emailData = await createInterviewConfirmedEmail(
        companyName,
        candidateName,
        jobTitle,
        formatThaiDate(interviewDateStr),
        interview.from,
        interview.to,
        interview.channel as "online" | "onsite",
        interview.location
      );

      await sendEmailNotification({
        email: companyEmail,
        emailData,
        notificationType: "interview_confirmed",
      });
    }
  }

  revalidatePath("/jobsmarket/chat");

  return {
    success: true,
    rewardAwarded,
  };
}

// ============================================================================
// BLS-05-05: Decline Interview
// ============================================================================

/**
 * Candidate declines an interview
 *
 * Requirements:
 * - BLS-05-05.auth: User must be candidate
 * - BLS-05-05.validation.exists: Interview must exist
 * - BLS-05-05.validation.status: Status allows decline ['scheduled', 'confirmed']
 * - BLS-05-05.update: Update interview status to 'declined'
 * - BLS-05-05.flag: Set is_accepted to false
 * - BLS-05-05.side-effect.status: Update application status to 'declined'
 */
export async function declineInterview(
  input: DeclineInterviewInput
): Promise<DeclineInterviewResult> {
  // 1. Authentication check
  const session = await getSessionUser();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }

  // 2. Authorization check - must be candidate
  if (!session.candidateId || session.companyId) {
    throw new Error("FORBIDDEN");
  }

  // 3. Get interview
  const interview = await webJobInterviewGetById(input.interviewId);
  if (!interview) {
    throw new Error("INTERVIEW_NOT_FOUND");
  }

  // 4. Validate ownership
  if (interview.candidateId !== session.candidateId) {
    throw new Error("FORBIDDEN");
  }

  // 5. Validate status
  if (interview.status === "declined") {
    throw new Error("ALREADY_DECLINED");
  }
  if (interview.status === "cancelled") {
    throw new Error("INTERVIEW_CANCELLED");
  }

  const declineableStatuses = ["scheduled", "confirmed"];
  if (!declineableStatuses.includes(interview.status)) {
    throw new Error("INVALID_INTERVIEW_STATUS");
  }

  // 6. Update interview status
  const updatedInterview: FirebaseJobInterviewData = {
    ...interview,
    status: MasterJobApplicationStatuses.declined,
    isAccepted: false,
    rejectFeedback: input.reason || "",
    updatedAt: Date.now(),
  };

  await webJobInterviewUpdate(updatedInterview, session.uid, input.interviewId);

  // 7. Update application status
  if (interview.applicationId) {
    const application = await webJobApplicationGetById(interview.applicationId);
    if (application) {
      await webJobApplicationUpdate(
        {
          ...application,
          status: MasterJobApplicationStatuses.declined,
        },
        session.uid,
        interview.applicationId
      );
    }
  }

  // 8. Send interview declined email notification to company
  if (interview.companyId) {
    const company = await webCompanyInformationGetById(interview.companyId);
    // Email exists in Firestore but isn't typed in FirebaseCompanyData
    const companyEmail = (company as { email?: string })?.email;
    if (company && companyEmail) {
      const companyName = company.companyName || "บริษัท";
      const candidate = await webCandidateInformationGetById(session.candidateId);
      const candidateName = candidate?.firstnameTH || candidate?.nicknameTH || "ผู้สมัคร";
      const application = interview.applicationId
        ? await webJobApplicationGetById(interview.applicationId)
        : null;
      const jobTitle = application?.jobTitle || "ตำแหน่งงาน";
      const interviewDateStr = new Date(interview.appointment).toISOString().split("T")[0] || "";

      const emailData = await createInterviewDeclinedEmail(
        companyName,
        candidateName,
        jobTitle,
        formatThaiDate(interviewDateStr),
        interview.from,
        interview.to,
        input.reason
      );

      await sendEmailNotification({
        email: companyEmail,
        emailData,
        notificationType: "interview_declined",
      });
    }
  }

  revalidatePath("/jobsmarket/chat");

  return {
    success: true,
  };
}

// ============================================================================
// BLS-05-03: Cancel Interview
// ============================================================================

/**
 * Company cancels an interview
 *
 * Requirements:
 * - BLS-05-03.auth: User must be company member
 * - BLS-05-03.validation.exists: Interview must exist
 * - BLS-05-03.validation.status: Status is cancellable ['scheduled', 'confirmed']
 * - BLS-05-03.update: Update interview status to 'cancelled'
 * - BLS-05-03.flag: Set is_cancel to true
 * - BLS-05-03.reason: Accept optional cancel reason (max 500 chars)
 * - BLS-05-03.side-effect.status: Update application status to 'cancelled'
 */
export async function cancelInterview(
  input: CancelInterviewInput
): Promise<CancelInterviewResult> {
  // 1. Authentication check
  const session = await getSessionUser();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }

  // 2. Authorization check - must be company member
  if (!session.companyId) {
    throw new Error("FORBIDDEN");
  }

  // 3. Get interview
  const interview = await webJobInterviewGetById(input.interviewId);
  if (!interview) {
    throw new Error("INTERVIEW_NOT_FOUND");
  }

  // 4. Validate ownership
  if (interview.companyId !== session.companyId) {
    throw new Error("FORBIDDEN");
  }

  // 5. Validate status
  if (interview.status === "cancelled") {
    throw new Error("ALREADY_CANCELLED");
  }
  if (interview.status === "declined") {
    throw new Error("INVALID_INTERVIEW_STATUS");
  }

  const cancellableStatuses = ["scheduled", "confirmed"];
  if (!cancellableStatuses.includes(interview.status)) {
    throw new Error("INVALID_INTERVIEW_STATUS");
  }

  // 6. Validate reason length
  if (input.reason && input.reason.length > 500) {
    throw new Error("REASON_TOO_LONG");
  }

  // 7. Update interview status
  const updatedInterview: FirebaseJobInterviewData = {
    ...interview,
    status: MasterJobApplicationStatuses.cancelled,
    isCancel: true,
    cancelReason: input.reason || "",
    updatedAt: Date.now(),
  };

  await webJobInterviewUpdate(updatedInterview, session.uid, input.interviewId);

  // 8. Update application status
  if (interview.applicationId) {
    const application = await webJobApplicationGetById(interview.applicationId);
    if (application) {
      await webJobApplicationUpdate(
        {
          ...application,
          status: MasterJobApplicationStatuses.cancelled,
        },
        session.uid,
        interview.applicationId
      );
    }
  }

  // 9. Send interview cancelled email notification
  if (interview.candidateId) {
    const candidate = await webCandidateInformationGetById(interview.candidateId);
    if (candidate?.email) {
      const candidateName = candidate.firstnameTH || candidate.nicknameTH || "ผู้สมัคร";
      const application = interview.applicationId
        ? await webJobApplicationGetById(interview.applicationId)
        : null;
      const jobTitle = application?.jobTitle || "ตำแหน่งงาน";
      const companyName = application?.companyName || "บริษัท";
      const interviewDateStr = new Date(interview.appointment).toISOString().split("T")[0] || "";

      const emailData = await createInterviewCancelledEmail(
        candidateName,
        jobTitle,
        companyName,
        formatThaiDate(interviewDateStr),
        interview.from,
        interview.to,
        input.reason
      );

      await sendEmailNotification({
        email: candidate.email,
        emailData,
        notificationType: "interview_cancelled",
      });
    }
  }

  revalidatePath("/jobsmarket/chat");

  return {
    success: true,
  };
}

// ============================================================================
// BLS-05-02: Reschedule Interview
// ============================================================================

/**
 * Company reschedules an interview
 *
 * Requirements:
 * - BLS-05-02.auth: User must be company member
 * - BLS-05-02.validation.exists: Interview must exist
 * - BLS-05-02.validation.status: Status allows reschedule ['scheduled', 'confirmed', 'declined']
 * - BLS-05-02.validation.future: New date must be in future
 * - BLS-05-02.update: Update interview with new date/time
 * - BLS-05-02.status-reset: Reset status to 'scheduled'
 * - BLS-05-02.side-effect.message: Create reschedule chat message (old→new)
 */
export async function rescheduleInterview(
  input: RescheduleInterviewInput
): Promise<RescheduleInterviewResult> {
  // 1. Authentication check
  const session = await getSessionUser();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }

  // 2. Authorization check - must be company member
  if (!session.companyId) {
    throw new Error("FORBIDDEN");
  }

  // 3. Get interview
  const interview = await webJobInterviewGetById(input.interviewId);
  if (!interview) {
    throw new Error("INTERVIEW_NOT_FOUND");
  }

  // 4. Validate ownership
  if (interview.companyId !== session.companyId) {
    throw new Error("FORBIDDEN");
  }

  // 5. Validate status allows reschedule
  if (interview.status === "cancelled") {
    throw new Error("INTERVIEW_CANCELLED");
  }

  const reschedulableStatuses = ["scheduled", "confirmed", "declined", "rescheduled"];
  if (!reschedulableStatuses.includes(interview.status)) {
    throw new Error("INVALID_INTERVIEW_STATUS");
  }

  // 6. Validate new date is in future
  if (!isFutureDate(input.date)) {
    throw new Error("INVALID_DATE");
  }

  // 7. Validate time range
  if (!isValidTimeRange(input.from, input.to)) {
    throw new Error("INVALID_TIME_RANGE");
  }

  // 8. Store old interview details for message
  const oldDate = new Date(interview.appointment).toISOString().split("T")[0] || "";
  const oldFrom = interview.from;
  const oldTo = interview.to;

  // 9. Update interview with new schedule
  const newAppointment = parseAppointmentTimestamp(input.date, input.from);

  const updatedInterview: FirebaseJobInterviewData = {
    ...interview,
    appointment: newAppointment,
    from: input.from,
    to: input.to,
    channel: input.channel || interview.channel,
    location: input.location ?? interview.location,
    room: input.room ?? interview.room,
    status: MasterJobApplicationStatuses.scheduled, // Reset status
    isCancel: false,
    isAccepted: false,
    updatedAt: Date.now(),
  };

  await webJobInterviewUpdate(updatedInterview, session.uid, input.interviewId);

  // 10. Update application status if was declined
  if (interview.applicationId) {
    const application = await webJobApplicationGetById(interview.applicationId);
    if (application && (application.status === MasterJobApplicationStatuses.declined || application.status === MasterJobApplicationStatuses.cancelled)) {
      await webJobApplicationUpdate(
        {
          ...application,
          status: MasterJobApplicationStatuses.scheduled,
        },
        session.uid,
        interview.applicationId
      );
    }
  }

  // 11. Create reschedule message in chat
  if (interview.applicationId) {
    const application = await webJobApplicationGetById(interview.applicationId);
    if (application?.chatId) {
      try {
        const room = await chatRepository.getById(application.chatId);
        if (room) {
          await messagesRepository.create(
            {
              uid: "",
              roomId: application.chatId,
              messageId: "",
              senderId: session.uid,
              timestamp: Date.now(),
              type: "interview-reschedule",
              message: "เลื่อนนัดสัมภาษณ์",
              name: "",
              avatar: "",
              unread: [],
              interviewId: input.interviewId,
              interviewDate: input.date,
              interviewTimeFrom: input.from,
              interviewTimeTo: input.to,
              oldInterviewDate: oldDate,
              oldInterviewTimeFrom: oldFrom,
              oldInterviewTimeTo: oldTo,
              newInterviewDate: input.date,
              jobId: application.jobId,
              applicationId: interview.applicationId,
              candidateId: interview.candidateId,
              companyId: interview.companyId,
              createdBy: session.uid,
              updatedBy: session.uid,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
            session.uid
          );
        }
      } catch (error) {
        throw new Error("Message error");
      }
    }
  }

  // 12. Send interview rescheduled email notification
  if (interview.candidateId) {
    const candidate = await webCandidateInformationGetById(interview.candidateId);
    if (candidate?.email) {
      const candidateName = candidate.firstnameTH || candidate.nicknameTH || "ผู้สมัคร";
      const application = interview.applicationId
        ? await webJobApplicationGetById(interview.applicationId)
        : null;
      const jobTitle = application?.jobTitle || "ตำแหน่งงาน";
      const companyName = application?.companyName || "บริษัท";

      const emailData = await createInterviewRescheduledEmail(
        candidateName,
        jobTitle,
        companyName,
        formatThaiDate(oldDate),
        oldFrom,
        oldTo,
        formatThaiDate(input.date),
        input.from,
        input.to,
        (input.channel || interview.channel) as "online" | "onsite",
        input.location || interview.location
      );

      await sendEmailNotification({
        email: candidate.email,
        emailData,
        notificationType: "interview_rescheduled",
      });
    }
  }

  revalidatePath("/jobsmarket/chat");

  return {
    success: true,
  };
}
