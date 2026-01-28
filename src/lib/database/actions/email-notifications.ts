"use server";

import client, { type MailDataRequired } from "@sendgrid/mail";
import type {
  UnifiedEmailData,
  NotificationType,
  SendEmailNotificationInput,
  SendEmailNotificationResult,
} from "./email-notifications.types";

// Re-export types for consumers
export type {
  UnifiedEmailData,
  NotificationType,
  SendEmailNotificationInput,
  SendEmailNotificationResult,
} from "./email-notifications.types";

/**
 * Email Notification Server Actions
 *
 * @specification BLS-11-06
 *
 * Sends transactional emails for platform events using SendGrid.
 */

/**
 * Simple email validation regex
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate required email data fields
 */
function validateEmailData(data: UnifiedEmailData): boolean {
  return !!(
    data.candidateName?.trim() &&
    data.subject?.trim() &&
    data.emailTitle?.trim() &&
    data.greeting?.trim() &&
    data.mainMessage?.trim()
  );
}

/**
 * BLS-11-06: sendEmailNotification
 *
 * Send a transactional email notification using SendGrid unified template.
 *
 * @param input - Email notification input
 * @returns SendEmailNotificationResult
 */
export async function sendEmailNotification(
  input: SendEmailNotificationInput
): Promise<SendEmailNotificationResult> {
  const { email, emailData, notificationType } = input;

  // Input validation: Email
  if (!email || !isValidEmail(email)) {
    return { success: false, error: "INVALID_EMAIL" };
  }

  // Input validation: Required fields
  if (!validateEmailData(emailData)) {
    return { success: false, error: "INVALID_DATA" };
  }

  try {
    const API_KEY = process.env.SENDGRID_API_KEY;
    const TEMPLATE_ID =
      process.env.UNIFIED_EMAIL_TEMPLATE_ID || "d-0fe292fbc3394bbd847595b6c49b2e64";

    if (!API_KEY) {
      console.error("SENDGRID_API_KEY not configured");
      return { success: false, error: "NETWORK_ERROR" };
    }

    client.setApiKey(API_KEY);

    // Prepare Thai-formatted date if not provided
    const formattedDate =
      emailData.date ||
      new Date().toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

    // Build the mail data
    const mailData: MailDataRequired = {
      from: {
        email: "noreply@chancedee.com",
        name: "ChanceDee Jobs",
      },
      subject: emailData.subject,
      templateId: TEMPLATE_ID,
      personalizations: [
        {
          to: [{ email }],
          dynamicTemplateData: {
            candidateName: emailData.candidateName,
            subject: emailData.subject,
            date: formattedDate,
            emailTitle: emailData.emailTitle,
            greeting: emailData.greeting,
            mainMessage: emailData.mainMessage,
            statusBadge: emailData.statusBadge,
            infoItems: emailData.infoItems,
            nextSteps: emailData.nextSteps,
            actionButtons: emailData.actionButtons,
            highlightMessage: emailData.highlightMessage,
            // Include notification type for tracking
            notificationType,
          },
        },
      ],
      categories: [notificationType],
    };

    const [response] = await client.send(mailData);

    // Check for successful status codes (2xx)
    if (response.statusCode >= 200 && response.statusCode < 300) {
      console.log(
        `Email sent successfully to ${email} for ${notificationType}: status ${response.statusCode}`
      );
      return { success: true };
    } else {
      console.error(
        `Email send failed with status ${response.statusCode}`
      );
      return { success: false, error: "SEND_FAILED" };
    }
  } catch (error) {
    console.error("Error sending email notification:", error);
    return { success: false, error: "NETWORK_ERROR" };
  }
}

/**
 * Helper function to create application accepted email data
 */
export async function createApplicationAcceptedEmail(
  candidateName: string,
  jobTitle: string,
  companyName: string
): Promise<UnifiedEmailData> {
  return {
    candidateName,
    subject: `ใบสมัครของคุณสำหรับตำแหน่ง ${jobTitle} ได้รับการตอบรับ`,
    emailTitle: "ยินดีด้วย! 🎉",
    greeting: `สวัสดีคุณ${candidateName}`,
    mainMessage: `ใบสมัครของคุณสำหรับตำแหน่ง ${jobTitle} ที่ ${companyName} ได้รับการตอบรับเบื้องต้นแล้ว`,
    statusBadge: { icon: "✅", text: "ผ่านการคัดเลือก" },
    nextSteps: [
      "รอการติดต่อจากบริษัทเพื่อนัดสัมภาษณ์",
      "เตรียมเอกสารประกอบการสัมภาษณ์",
      "ตรวจสอบอีเมลและการแจ้งเตือนในแอปเป็นประจำ",
    ],
    actionButtons: [
      { text: "ดูรายละเอียด", url: "https://jobs.chancedee.com/chat" },
    ],
  };
}

/**
 * Helper function to create application rejected email data
 */
export async function createApplicationRejectedEmail(
  candidateName: string,
  jobTitle: string,
  companyName: string,
  feedback?: string
): Promise<UnifiedEmailData> {
  return {
    candidateName,
    subject: `อัปเดตสถานะใบสมัครสำหรับตำแหน่ง ${jobTitle}`,
    emailTitle: "ผลการพิจารณาใบสมัคร",
    greeting: `สวัสดีคุณ${candidateName}`,
    mainMessage: `ขอบคุณที่สนใจสมัครตำแหน่ง ${jobTitle} ที่ ${companyName} หลังจากพิจารณาอย่างรอบคอบแล้ว เราขอแจ้งให้ทราบว่าใบสมัครของคุณยังไม่ผ่านการคัดเลือกในครั้งนี้`,
    statusBadge: { icon: "📋", text: "ไม่ผ่านการคัดเลือก" },
    highlightMessage: feedback,
    nextSteps: [
      "ค้นหาตำแหน่งงานอื่นที่เหมาะสมกับคุณ",
      "ปรับปรุงโปรไฟล์เพื่อเพิ่มโอกาสในการสมัครครั้งต่อไป",
    ],
    actionButtons: [
      { text: "ค้นหางานใหม่", url: "https://jobs.chancedee.com/jobs" },
    ],
  };
}

/**
 * Helper function to create interview scheduled email data
 */
export async function createInterviewScheduledEmail(
  candidateName: string,
  jobTitle: string,
  companyName: string,
  date: string,
  timeFrom: string,
  timeTo: string,
  channel: "online" | "onsite",
  location?: string
): Promise<UnifiedEmailData> {
  return {
    candidateName,
    subject: `นัดสัมภาษณ์สำหรับตำแหน่ง ${jobTitle}`,
    emailTitle: "คุณได้รับการนัดสัมภาษณ์! 📅",
    greeting: `สวัสดีคุณ${candidateName}`,
    mainMessage: `${companyName} ได้นัดสัมภาษณ์คุณสำหรับตำแหน่ง ${jobTitle} กรุณายืนยันหรือปฏิเสธการนัดหมายนี้`,
    statusBadge: { icon: "📅", text: "นัดสัมภาษณ์" },
    infoItems: [
      { label: "วันที่", value: date },
      { label: "เวลา", value: `${timeFrom} - ${timeTo}` },
      { label: "รูปแบบ", value: channel === "online" ? "ออนไลน์" : "ที่สถานที่" },
      ...(location ? [{ label: "สถานที่", value: location }] : []),
    ],
    nextSteps: [
      "กรุณายืนยันหรือปฏิเสธการนัดหมายภายใน 48 ชั่วโมง",
      "เตรียมเอกสารและพอร์ตโฟลิโอ (ถ้ามี)",
      channel === "online"
        ? "ตรวจสอบการเชื่อมต่ออินเทอร์เน็ตและอุปกรณ์"
        : "ศึกษาเส้นทางไปสถานที่สัมภาษณ์",
    ],
    actionButtons: [
      { text: "ยืนยันนัดสัมภาษณ์", url: "https://jobs.chancedee.com/chat" },
    ],
  };
}

/**
 * Helper function to create interview rescheduled email data
 */
export async function createInterviewRescheduledEmail(
  candidateName: string,
  jobTitle: string,
  companyName: string,
  oldDate: string,
  oldTimeFrom: string,
  oldTimeTo: string,
  newDate: string,
  newTimeFrom: string,
  newTimeTo: string,
  channel: "online" | "onsite",
  location?: string
): Promise<UnifiedEmailData> {
  return {
    candidateName,
    subject: `เปลี่ยนแปลงเวลาสัมภาษณ์สำหรับตำแหน่ง ${jobTitle}`,
    emailTitle: "มีการเปลี่ยนแปลงนัดสัมภาษณ์ 📅",
    greeting: `สวัสดีคุณ${candidateName}`,
    mainMessage: `${companyName} ได้เปลี่ยนแปลงเวลานัดสัมภาษณ์สำหรับตำแหน่ง ${jobTitle} กรุณายืนยันหรือปฏิเสธการนัดหมายใหม่นี้`,
    statusBadge: { icon: "🔄", text: "เลื่อนนัดสัมภาษณ์" },
    infoItems: [
      { label: "วันที่เดิม", value: `${oldDate} (${oldTimeFrom} - ${oldTimeTo})` },
      { label: "วันที่ใหม่", value: newDate },
      { label: "เวลาใหม่", value: `${newTimeFrom} - ${newTimeTo}` },
      { label: "รูปแบบ", value: channel === "online" ? "ออนไลน์" : "ที่สถานที่" },
      ...(location ? [{ label: "สถานที่", value: location }] : []),
    ],
    nextSteps: [
      "กรุณายืนยันหรือปฏิเสธการนัดหมายใหม่ภายใน 48 ชั่วโมง",
      "ตรวจสอบตารางของคุณให้ตรงกับเวลานัดหมายใหม่",
    ],
    actionButtons: [
      { text: "ยืนยันนัดสัมภาษณ์", url: "https://jobs.chancedee.com/chat" },
    ],
  };
}

/**
 * Helper function to create interview cancelled email data
 */
export async function createInterviewCancelledEmail(
  candidateName: string,
  jobTitle: string,
  companyName: string,
  date: string,
  timeFrom: string,
  timeTo: string,
  reason?: string
): Promise<UnifiedEmailData> {
  return {
    candidateName,
    subject: `ยกเลิกนัดสัมภาษณ์สำหรับตำแหน่ง ${jobTitle}`,
    emailTitle: "การนัดสัมภาษณ์ถูกยกเลิก",
    greeting: `สวัสดีคุณ${candidateName}`,
    mainMessage: `${companyName} ได้ยกเลิกการนัดสัมภาษณ์สำหรับตำแหน่ง ${jobTitle} ที่กำหนดไว้`,
    statusBadge: { icon: "❌", text: "ยกเลิกนัดสัมภาษณ์" },
    infoItems: [
      { label: "วันที่", value: date },
      { label: "เวลา", value: `${timeFrom} - ${timeTo}` },
    ],
    highlightMessage: reason,
    nextSteps: [
      "รอการติดต่อจากบริษัทหากมีการนัดหมายใหม่",
      "ค้นหาตำแหน่งงานอื่นที่เหมาะสมกับคุณ",
    ],
    actionButtons: [
      { text: "ค้นหางานใหม่", url: "https://jobs.chancedee.com/jobs" },
    ],
  };
}

/**
 * Helper function to create interview confirmed email data (for company)
 */
export async function createInterviewConfirmedEmail(
  companyName: string,
  candidateName: string,
  jobTitle: string,
  date: string,
  timeFrom: string,
  timeTo: string,
  channel: "online" | "onsite",
  location?: string
): Promise<UnifiedEmailData> {
  return {
    candidateName: companyName, // Using candidateName field for recipient name
    subject: `ผู้สมัครยืนยันนัดสัมภาษณ์สำหรับตำแหน่ง ${jobTitle}`,
    emailTitle: "การยืนยันนัดสัมภาษณ์ ✅",
    greeting: `สวัสดี ${companyName}`,
    mainMessage: `${candidateName} ได้ยืนยันนัดสัมภาษณ์สำหรับตำแหน่ง ${jobTitle} แล้ว`,
    statusBadge: { icon: "✅", text: "ยืนยันนัดสัมภาษณ์" },
    infoItems: [
      { label: "ผู้สมัคร", value: candidateName },
      { label: "ตำแหน่ง", value: jobTitle },
      { label: "วันที่", value: date },
      { label: "เวลา", value: `${timeFrom} - ${timeTo}` },
      { label: "รูปแบบ", value: channel === "online" ? "ออนไลน์" : "ที่สถานที่" },
      ...(location ? [{ label: "สถานที่", value: location }] : []),
    ],
    nextSteps: [
      "เตรียมคำถามและเอกสารสำหรับการสัมภาษณ์",
      channel === "online" ? "ส่งลิงก์ประชุมให้ผู้สมัคร" : "เตรียมสถานที่สัมภาษณ์",
    ],
    actionButtons: [
      { text: "ดูรายละเอียด", url: "https://jobs.chancedee.com/chat" },
    ],
  };
}

/**
 * Helper function to create interview declined email data (for company)
 */
export async function createInterviewDeclinedEmail(
  companyName: string,
  candidateName: string,
  jobTitle: string,
  date: string,
  timeFrom: string,
  timeTo: string,
  reason?: string
): Promise<UnifiedEmailData> {
  return {
    candidateName: companyName, // Using candidateName field for recipient name
    subject: `ผู้สมัครปฏิเสธนัดสัมภาษณ์สำหรับตำแหน่ง ${jobTitle}`,
    emailTitle: "การปฏิเสธนัดสัมภาษณ์",
    greeting: `สวัสดี ${companyName}`,
    mainMessage: `${candidateName} ได้ปฏิเสธนัดสัมภาษณ์สำหรับตำแหน่ง ${jobTitle}`,
    statusBadge: { icon: "⚠️", text: "ปฏิเสธนัดสัมภาษณ์" },
    infoItems: [
      { label: "ผู้สมัคร", value: candidateName },
      { label: "ตำแหน่ง", value: jobTitle },
      { label: "วันที่", value: date },
      { label: "เวลา", value: `${timeFrom} - ${timeTo}` },
    ],
    highlightMessage: reason,
    nextSteps: [
      "พิจารณาเสนอเวลาสัมภาษณ์ใหม่หากยังสนใจผู้สมัคร",
      "พิจารณาผู้สมัครคนอื่น",
    ],
    actionButtons: [
      { text: "ดูผู้สมัครอื่น", url: "https://jobs.chancedee.com/companies" },
    ],
  };
}
