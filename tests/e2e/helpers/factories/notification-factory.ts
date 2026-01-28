/**
 * Factory for creating notification test scenarios
 * Creates messages in the web_messages collection with various notification types
 *
 * IMPORTANT: Notifications are NOT a separate collection - they are message types
 * in web_messages (interview, interview-reschedule, offer, system)
 */

import {
  testDb,
  generateTestId,
  now,
  toTimestamp,
} from "../firebase-admin-test";
import {
  createTestCandidate,
  type TestCandidate,
  type CreateTestCandidateOptions,
} from "./candidate-factory";
import {
  createTestCompany,
  type TestCompany,
  type CreateTestCompanyOptions,
} from "./company-factory";

export interface CreateNotificationScenarioOptions {
  /** Options for candidate creation */
  candidateOptions?: CreateTestCandidateOptions;
  /** Options for company creation */
  companyOptions?: CreateTestCompanyOptions;
  /** Types of notifications to create */
  notificationTypes?: Array<"interview" | "interview-reschedule" | "offer" | "system">;
  /** Number of each type to create */
  countPerType?: number;
  /** Whether to mark some as read */
  includeReadNotifications?: boolean;
  /** Test name for traceability */
  testName?: string;
}

export interface NotificationScenarioResult {
  /** Created candidate */
  candidate: TestCandidate;
  /** Created companies (one per notification) */
  companies: TestCompany[];
  /** Message IDs organized by type */
  notifications: {
    interview: string[];
    interviewReschedule: string[];
    offer: string[];
    system: string[];
  };
  /** All message IDs */
  allMessageIds: string[];
  /** Chat room IDs */
  chatRoomIds: string[];
}

/**
 * Create a complete notification test scenario
 *
 * This creates:
 * 1. A candidate account
 * 2. Multiple companies
 * 3. Chat rooms between candidate and companies
 * 4. Various notification messages (interview, offer, system)
 *
 * @example
 * const scenario = await createNotificationScenario({
 *   notificationTypes: ['interview', 'offer', 'system'],
 *   countPerType: 2,
 *   testName: 'notification-filter-test',
 * });
 *
 * // Sign in as candidate
 * await signInAsCandidate(page, scenario.candidate);
 *
 * // Navigate to notifications page
 * await page.goto('/jobsmarket/notifications');
 *
 * // Check specific notification
 * await page.getByTestId(`notification-item-${scenario.notifications.interview[0]}`).click();
 */
export async function createNotificationScenario(
  options: CreateNotificationScenarioOptions = {}
): Promise<NotificationScenarioResult> {
  const {
    notificationTypes = ["interview", "offer", "system"],
    countPerType = 1,
    includeReadNotifications = false,
    testName = "notification-test",
  } = options;

  // Create candidate
  const candidate = await createTestCandidate({
    profileLevel: "complete",
    ...options.candidateOptions,
    testName,
  });

  const companies: TestCompany[] = [];
  const notifications = {
    interview: [] as string[],
    interviewReschedule: [] as string[],
    offer: [] as string[],
    system: [] as string[],
  };
  const allMessageIds: string[] = [];
  const chatRoomIds: string[] = [];

  const candidateRef = testDb.collection("candidate_information").doc(candidate.candidateId);

  // Create notifications for each type
  for (const type of notificationTypes) {
    for (let i = 0; i < countPerType; i++) {
      // Create company for each notification
      const company = await createTestCompany({
        ...options.companyOptions,
        testName: `${testName}-${type}-${i}`,
      });
      companies.push(company);

      const companyRef = testDb.collection("company_information").doc(company.companyId);

      // Create chat room
      const chatRoomId = generateTestId("chat");
      const chatRef = testDb.collection("chats").doc(chatRoomId);
      chatRoomIds.push(chatRoomId);

      await chatRef.set({
        uid: chatRoomId,
        candidate_id: candidateRef,
        company_id: companyRef,
        candidate_name: "ทดสอบ ผู้สมัคร",
        company_name: `บริษัททดสอบ ${type} ${i + 1}`,
        job_title: `ตำแหน่ง ${type} ${i + 1}`,
        last_message_text: null,
        last_message_time: null,
        status: "active",
        timestamp: now(),
        is_test_account: true,
        test_name: testName,
        created_at: now(),
        updated_at: now(),
      });

      // Create notification message
      const messageId = generateTestId("msg");
      const messageRef = testDb.collection("messages").doc(messageId);

      // Determine if this should be read (every other one if includeReadNotifications)
      const isRead = includeReadNotifications && i % 2 === 0;
      const unread = isRead ? [] : [candidate.candidateId];

      // Create message based on type
      const baseMessage = {
        uid: messageId,
        room_id: chatRef,
        sender_id: companyRef,
        sender_name: `บริษัททดสอบ ${type} ${i + 1}`,
        sender_role: "company",
        sender_avatar: "",
        unread,
        is_test_account: true,
        test_name: testName,
        timestamp: toTimestamp(new Date(Date.now() - i * 60 * 1000)), // Stagger timestamps
        created_at: now(),
        updated_at: now(),
      };

      switch (type) {
        case "interview":
          await messageRef.set({
            ...baseMessage,
            type: "interview",
            message: `นัดสัมภาษณ์ตำแหน่ง ${i + 1}`,
            interview_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            interview_time_from: "10:00",
            interview_time_to: "11:00",
            interview_channel: "online",
            interview_status: "pending",
            job_title: `ตำแหน่ง ${type} ${i + 1}`,
          });
          notifications.interview.push(messageId);
          break;

        case "interview-reschedule":
          await messageRef.set({
            ...baseMessage,
            type: "interview-reschedule",
            message: `เลื่อนนัดสัมภาษณ์ตำแหน่ง ${i + 1}`,
            interview_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            interview_time_from: "14:00",
            interview_time_to: "15:00",
            interview_channel: "onsite",
            interview_status: "rescheduled",
            old_interview_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            job_title: `ตำแหน่ง ${type} ${i + 1}`,
          });
          notifications.interviewReschedule.push(messageId);
          break;

        case "offer":
          await messageRef.set({
            ...baseMessage,
            type: "offer",
            message: `คุณได้รับข้อเสนองานตำแหน่ง ${i + 1}`,
            job_title: `ตำแหน่ง ${type} ${i + 1}`,
            application_status: "offered",
          });
          notifications.offer.push(messageId);
          break;

        case "system":
          await messageRef.set({
            ...baseMessage,
            type: "system",
            message: `ข้อความระบบ ${i + 1}: โปรไฟล์ของคุณได้รับการยืนยัน`,
            sender_name: "ChanceDee",
            sender_id: null,
          });
          notifications.system.push(messageId);
          break;
      }

      allMessageIds.push(messageId);
    }
  }

  return {
    candidate,
    companies,
    notifications,
    allMessageIds,
    chatRoomIds,
  };
}

/**
 * Create a chat message scenario for testing "Messages" filter
 * Creates chat rooms with text/file messages (not notification types)
 */
export interface CreateChatMessageScenarioOptions {
  /** Options for candidate creation */
  candidateOptions?: CreateTestCandidateOptions;
  /** Number of chat rooms to create */
  roomCount?: number;
  /** Messages per room */
  messagesPerRoom?: number;
  /** Test name */
  testName?: string;
}

export interface ChatMessageScenarioResult {
  candidate: TestCandidate;
  companies: TestCompany[];
  rooms: Array<{
    roomId: string;
    companyId: string;
    messageIds: string[];
    unreadCount: number;
  }>;
}

export async function createChatMessageScenario(
  options: CreateChatMessageScenarioOptions = {}
): Promise<ChatMessageScenarioResult> {
  const {
    roomCount = 2,
    messagesPerRoom = 3,
    testName = "chat-message-test",
  } = options;

  const candidate = await createTestCandidate({
    profileLevel: "complete",
    ...options.candidateOptions,
    testName,
  });

  const companies: TestCompany[] = [];
  const rooms: ChatMessageScenarioResult["rooms"] = [];

  const candidateRef = testDb.collection("candidate_information").doc(candidate.candidateId);

  for (let r = 0; r < roomCount; r++) {
    const company = await createTestCompany({ testName: `${testName}-room-${r}` });
    companies.push(company);

    const companyRef = testDb.collection("company_information").doc(company.companyId);

    // Create chat room
    const roomId = generateTestId("chat");
    const chatRef = testDb.collection("chats").doc(roomId);

    await chatRef.set({
      uid: roomId,
      candidate_id: candidateRef,
      company_id: companyRef,
      candidate_name: "ทดสอบ ผู้สมัคร",
      company_name: `บริษัททดสอบ ${r + 1}`,
      job_title: `ตำแหน่ง ${r + 1}`,
      last_message_text: null,
      last_message_time: null,
      status: "active",
      timestamp: now(),
      is_test_account: true,
      test_name: testName,
      created_at: now(),
      updated_at: now(),
    });

    const messageIds: string[] = [];
    let unreadCount = 0;

    // Create messages
    for (let m = 0; m < messagesPerRoom; m++) {
      const messageId = generateTestId("msg");
      const messageRef = testDb.collection("messages").doc(messageId);

      // Alternate between sender (company sends even, candidate sends odd)
      const isFromCompany = m % 2 === 0;
      // First message from company is unread
      const isUnread = isFromCompany && m === 0;
      if (isUnread) unreadCount++;

      await messageRef.set({
        uid: messageId,
        room_id: chatRef,
        sender_id: isFromCompany ? companyRef : candidateRef,
        sender_name: isFromCompany ? `บริษัททดสอบ ${r + 1}` : "ทดสอบ ผู้สมัคร",
        sender_role: isFromCompany ? "company" : "candidate",
        type: m === 2 ? "file" : "text", // Third message is a file
        message: m === 2 ? "document.pdf" : `ข้อความทดสอบ ${m + 1}`,
        sender_avatar: "",
        unread: isUnread ? [candidate.candidateId] : [],
        is_test_account: true,
        test_name: testName,
        timestamp: toTimestamp(new Date(Date.now() - (messagesPerRoom - m) * 60 * 1000)),
        created_at: now(),
        updated_at: now(),
      });

      messageIds.push(messageId);
    }

    rooms.push({
      roomId,
      companyId: company.companyId,
      messageIds,
      unreadCount,
    });
  }

  return {
    candidate,
    companies,
    rooms,
  };
}

/**
 * Predefined notification scenarios
 */
export const NotificationScenarios = {
  /**
   * Full notification scenario with all types
   */
  allTypes: () =>
    createNotificationScenario({
      notificationTypes: ["interview", "interview-reschedule", "offer", "system"],
      countPerType: 2,
      includeReadNotifications: true,
      testName: "all-notification-types",
    }),

  /**
   * Interview notifications only
   */
  interviewsOnly: () =>
    createNotificationScenario({
      notificationTypes: ["interview", "interview-reschedule"],
      countPerType: 3,
      testName: "interview-notifications",
    }),

  /**
   * Application notifications (offers)
   */
  offersOnly: () =>
    createNotificationScenario({
      notificationTypes: ["offer"],
      countPerType: 3,
      testName: "offer-notifications",
    }),

  /**
   * System notifications only
   */
  systemOnly: () =>
    createNotificationScenario({
      notificationTypes: ["system"],
      countPerType: 3,
      testName: "system-notifications",
    }),

  /**
   * Empty notifications (for testing empty state)
   */
  empty: async () => {
    const candidate = await createTestCandidate({
      profileLevel: "complete",
      testName: "empty-notifications",
    });
    return {
      candidate,
      companies: [],
      notifications: {
        interview: [],
        interviewReschedule: [],
        offer: [],
        system: [],
      },
      allMessageIds: [],
      chatRoomIds: [],
    };
  },

  /**
   * Chat messages for "Messages" filter
   */
  chatMessages: () =>
    createChatMessageScenario({
      roomCount: 3,
      messagesPerRoom: 4,
      testName: "chat-messages-filter",
    }),
};
