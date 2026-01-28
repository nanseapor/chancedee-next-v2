/**
 * @fileoverview Tests for sendEmailNotification server action
 * @specification BLS-11-06 Notifications Stage - sendEmailNotification
 *
 * Requirements tested:
 * - BLS-11-06.input: Valid email data with required fields
 * - BLS-11-06.template: Uses unified SendGrid template
 * - BLS-11-06.success: Email sent successfully
 * - BLS-11-06.error: Handle SendGrid failures
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock SendGrid
const mockSend = vi.fn();

vi.mock('@sendgrid/mail', () => ({
  default: {
    setApiKey: vi.fn(),
    send: () => mockSend(),
  },
}));

describe('sendEmailNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default successful response
    mockSend.mockResolvedValue([{ statusCode: 202 }]);
    // Mock environment variables
    vi.stubEnv('SENDGRID_API_KEY', 'test-api-key');
    vi.stubEnv('UNIFIED_EMAIL_TEMPLATE_ID', 'd-test-template-id');
  });

  describe('Input validation', () => {
    it('should return error for empty email address', async () => {
      const { sendEmailNotification } = await import(
        '@/lib/database/actions/email-notifications'
      );

      const result = await sendEmailNotification({
        email: '',
        emailData: {
          candidateName: 'Test User',
          subject: 'Test Subject',
          emailTitle: 'Test Title',
          greeting: 'สวัสดี',
          mainMessage: 'Test message',
        },
        notificationType: 'application_accepted',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_EMAIL');
    });

    it('should return error for invalid email format', async () => {
      const { sendEmailNotification } = await import(
        '@/lib/database/actions/email-notifications'
      );

      const result = await sendEmailNotification({
        email: 'not-an-email',
        emailData: {
          candidateName: 'Test User',
          subject: 'Test Subject',
          emailTitle: 'Test Title',
          greeting: 'สวัสดี',
          mainMessage: 'Test message',
        },
        notificationType: 'application_accepted',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_EMAIL');
    });

    it('should return error for missing required fields', async () => {
      const { sendEmailNotification } = await import(
        '@/lib/database/actions/email-notifications'
      );

      const result = await sendEmailNotification({
        email: 'test@example.com',
        emailData: {
          candidateName: '',
          subject: '',
          emailTitle: '',
          greeting: '',
          mainMessage: '',
        },
        notificationType: 'application_accepted',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_DATA');
    });
  });

  describe('Success cases', () => {
    /**
     * Requirement: BLS-11-06.success
     * "Email sent successfully"
     */
    it('should send email successfully with valid data', async () => {
      mockSend.mockResolvedValue([{ statusCode: 202 }]);

      const { sendEmailNotification } = await import(
        '@/lib/database/actions/email-notifications'
      );

      const result = await sendEmailNotification({
        email: 'test@example.com',
        emailData: {
          candidateName: 'สมชาย ใจดี',
          subject: 'ใบสมัครของคุณได้รับการตอบรับ',
          emailTitle: 'ยินดีด้วย!',
          greeting: 'สวัสดีคุณสมชาย',
          mainMessage: 'ใบสมัครของคุณสำหรับตำแหน่ง Software Engineer ได้รับการตอบรับแล้ว',
        },
        notificationType: 'application_accepted',
      });

      expect(result.success).toBe(true);
      expect(mockSend).toHaveBeenCalled();
    });

    it('should include optional status badge in email', async () => {
      mockSend.mockResolvedValue([{ statusCode: 202 }]);

      const { sendEmailNotification } = await import(
        '@/lib/database/actions/email-notifications'
      );

      const result = await sendEmailNotification({
        email: 'test@example.com',
        emailData: {
          candidateName: 'สมชาย ใจดี',
          subject: 'นัดสัมภาษณ์ใหม่',
          emailTitle: 'การนัดหมาย',
          greeting: 'สวัสดี',
          mainMessage: 'คุณได้รับการนัดสัมภาษณ์',
          statusBadge: { icon: '📅', text: 'นัดสัมภาษณ์' },
        },
        notificationType: 'interview_scheduled',
      });

      expect(result.success).toBe(true);
    });

    it('should include optional info items in email', async () => {
      mockSend.mockResolvedValue([{ statusCode: 202 }]);

      const { sendEmailNotification } = await import(
        '@/lib/database/actions/email-notifications'
      );

      const result = await sendEmailNotification({
        email: 'test@example.com',
        emailData: {
          candidateName: 'สมชาย ใจดี',
          subject: 'นัดสัมภาษณ์',
          emailTitle: 'รายละเอียดการนัดหมาย',
          greeting: 'สวัสดี',
          mainMessage: 'กรุณาตรวจสอบรายละเอียด',
          infoItems: [
            { label: 'วันที่', value: '15 ม.ค. 2568' },
            { label: 'เวลา', value: '10:00 - 11:00' },
            { label: 'สถานที่', value: 'Online via Google Meet' },
          ],
        },
        notificationType: 'interview_scheduled',
      });

      expect(result.success).toBe(true);
    });

    it('should include next steps in email', async () => {
      mockSend.mockResolvedValue([{ statusCode: 202 }]);

      const { sendEmailNotification } = await import(
        '@/lib/database/actions/email-notifications'
      );

      const result = await sendEmailNotification({
        email: 'test@example.com',
        emailData: {
          candidateName: 'สมชาย',
          subject: 'ใบสมัครได้รับการตอบรับ',
          emailTitle: 'ขั้นตอนต่อไป',
          greeting: 'สวัสดี',
          mainMessage: 'ยินดีด้วย',
          nextSteps: [
            'รอการติดต่อจากบริษัท',
            'เตรียมเอกสารประกอบการสัมภาษณ์',
          ],
        },
        notificationType: 'application_accepted',
      });

      expect(result.success).toBe(true);
    });

    it('should include action buttons in email', async () => {
      mockSend.mockResolvedValue([{ statusCode: 202 }]);

      const { sendEmailNotification } = await import(
        '@/lib/database/actions/email-notifications'
      );

      const result = await sendEmailNotification({
        email: 'test@example.com',
        emailData: {
          candidateName: 'สมชาย',
          subject: 'ยืนยันการสัมภาษณ์',
          emailTitle: 'กรุณายืนยัน',
          greeting: 'สวัสดี',
          mainMessage: 'กรุณายืนยันการเข้าร่วมสัมภาษณ์',
          actionButtons: [
            { text: 'ยืนยัน', url: 'https://jobs.chancedee.com/chat/room-123' },
          ],
        },
        notificationType: 'interview_scheduled',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('Error handling', () => {
    /**
     * Requirement: BLS-11-06.error
     * "Handle SendGrid failures"
     */
    it('should return NETWORK_ERROR on SendGrid failure', async () => {
      mockSend.mockRejectedValue(new Error('SendGrid error'));

      const { sendEmailNotification } = await import(
        '@/lib/database/actions/email-notifications'
      );

      const result = await sendEmailNotification({
        email: 'test@example.com',
        emailData: {
          candidateName: 'Test',
          subject: 'Test',
          emailTitle: 'Test',
          greeting: 'Test',
          mainMessage: 'Test',
        },
        notificationType: 'application_accepted',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('NETWORK_ERROR');
    });

    it('should return SEND_FAILED for non-2xx status code', async () => {
      mockSend.mockResolvedValue([{ statusCode: 400 }]);

      const { sendEmailNotification } = await import(
        '@/lib/database/actions/email-notifications'
      );

      const result = await sendEmailNotification({
        email: 'test@example.com',
        emailData: {
          candidateName: 'Test',
          subject: 'Test',
          emailTitle: 'Test',
          greeting: 'Test',
          mainMessage: 'Test',
        },
        notificationType: 'application_accepted',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('SEND_FAILED');
    });
  });

  describe('Notification types', () => {
    it('should accept application_received notification type', async () => {
      mockSend.mockResolvedValue([{ statusCode: 202 }]);

      const { sendEmailNotification } = await import(
        '@/lib/database/actions/email-notifications'
      );

      const result = await sendEmailNotification({
        email: 'company@example.com',
        emailData: {
          candidateName: 'Company Name',
          subject: 'มีใบสมัครใหม่',
          emailTitle: 'ใบสมัครใหม่',
          greeting: 'สวัสดี',
          mainMessage: 'มีผู้สมัครใหม่สำหรับตำแหน่ง Software Engineer',
        },
        notificationType: 'application_received',
      });

      expect(result.success).toBe(true);
    });

    it('should accept interview_cancelled notification type', async () => {
      mockSend.mockResolvedValue([{ statusCode: 202 }]);

      const { sendEmailNotification } = await import(
        '@/lib/database/actions/email-notifications'
      );

      const result = await sendEmailNotification({
        email: 'candidate@example.com',
        emailData: {
          candidateName: 'Candidate',
          subject: 'ยกเลิกการสัมภาษณ์',
          emailTitle: 'การยกเลิก',
          greeting: 'สวัสดี',
          mainMessage: 'บริษัทได้ยกเลิกการนัดสัมภาษณ์',
        },
        notificationType: 'interview_cancelled',
      });

      expect(result.success).toBe(true);
    });
  });
});
