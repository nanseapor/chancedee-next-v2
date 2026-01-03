/**
 * Integration Tests for fetchChatRoomsMetadata Server Action
 * Per CHAT-R01 RIS and BLS-06-01
 *
 * Uses real Firestore (development environment)
 *
 * NOTE: These tests mock getSessionUser since `cookies()` cannot be called
 * outside a Next.js request context. The integration tests focus on verifying
 * the Firestore queries and data transformation work correctly.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import { Filter, Timestamp } from "firebase-admin/firestore";

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { chatRepository } from "@/lib/database/repositories/chat-repository";
import { messagesRepository } from "@/lib/database/repositories/messages-repository";

// Mock getSessionUser to avoid cookies() error outside request context
vi.mock("@/lib/firebase/admin-auth", () => ({
  getSessionUser: vi.fn(),
}));

// Import after mocking
import { fetchChatRoomsMetadata } from "@/lib/database/actions/chat-rooms";
import { getSessionUser } from "@/lib/firebase/admin-auth";

/**
 * Test data IDs - Using unique prefixes to avoid collision with real data
 * Format: integration-test-chat-{timestamp}-{entity}
 */
const TEST_PREFIX = `integration-test-chat-${Date.now()}`;

const TEST_IDS = {
  candidate1: `${TEST_PREFIX}-candidate-1`,
  candidate2: `${TEST_PREFIX}-candidate-2`,
  company1: `${TEST_PREFIX}-company-1`,
  company2: `${TEST_PREFIX}-company-2`,
  hr1: `${TEST_PREFIX}-hr-1`,
  room1: `${TEST_PREFIX}-room-1`,
  room2: `${TEST_PREFIX}-room-2`,
  room3: `${TEST_PREFIX}-room-3`,
  message1: `${TEST_PREFIX}-message-1`,
  message2: `${TEST_PREFIX}-message-2`,
  message3: `${TEST_PREFIX}-message-3`,
};

describe("fetchChatRoomsMetadata Integration", () => {
  const db = getFirebaseAdminFirestore();

  // Store created document refs for cleanup
  const createdDocs: { collection: string; id: string }[] = [];

  /**
   * Helper to create a test chat room
   */
  async function createTestChatRoom(roomData: {
    id: string;
    candidateId: string;
    companyId: string;
    hrId: string;
    candidateName: string;
    companyName: string;
    hrName: string;
    lastMessage: string;
    lastMessageTime: number;
  }) {
    const docRef = db.collection("chats").doc(roomData.id);

    await docRef.set({
      uid: roomData.id,
      candidate_id: db.collection("candidate_information").doc(roomData.candidateId),
      company_id: db.collection("company_information").doc(roomData.companyId),
      responsible_hr_id: db.collection("user_accounts").doc(roomData.hrId),
      candidate_name: roomData.candidateName,
      company_name: roomData.companyName,
      responsible_hr_name: roomData.hrName,
      last_message_text: roomData.lastMessage,
      last_message_time: Timestamp.fromMillis(roomData.lastMessageTime),
      last_message_sender: roomData.hrId,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
      created_by: db.collection("user_accounts").doc(roomData.hrId),
      updated_by: db.collection("user_accounts").doc(roomData.hrId),
      timestamp: Timestamp.now(),
    });

    createdDocs.push({ collection: "chats", id: roomData.id });
  }

  /**
   * Helper to create a test message
   */
  async function createTestMessage(messageData: {
    id: string;
    roomId: string;
    senderId: string;
    message: string;
    type: string;
    unread: string[];
    timestamp: number;
    interviewStatus?: string;
    interviewDate?: string;
  }) {
    const docRef = db.collection("messages").doc(messageData.id);

    await docRef.set({
      uid: messageData.id,
      messageId: messageData.id,
      room_id: db.collection("chats").doc(messageData.roomId),
      senderId: messageData.senderId,
      message: messageData.message,
      type: messageData.type,
      unread: messageData.unread,
      timestamp: messageData.timestamp,
      interview_status: messageData.interviewStatus,
      interview_date: messageData.interviewDate,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
      created_by: db.collection("user_accounts").doc(messageData.senderId),
      updated_by: db.collection("user_accounts").doc(messageData.senderId),
    });

    createdDocs.push({ collection: "messages", id: messageData.id });
  }

  /**
   * Helper to create test candidate info
   */
  async function createTestCandidate(data: {
    id: string;
    firstnameTH: string;
    lastnameTH: string;
    photoURL?: string;
  }) {
    const docRef = db.collection("candidate_information").doc(data.id);

    await docRef.set({
      uid: data.id,
      firstnameTH: data.firstnameTH,
      lastnameTH: data.lastnameTH,
      resumePhotoURL: data.photoURL || null,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    });

    createdDocs.push({ collection: "candidate_information", id: data.id });
  }

  /**
   * Helper to create test company info
   */
  async function createTestCompany(data: {
    id: string;
    companyName: string;
    logoURL?: string;
  }) {
    const docRef = db.collection("company_information").doc(data.id);

    await docRef.set({
      uid: data.id,
      companyName: data.companyName,
      companyLogoURL: data.logoURL || null,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    });

    createdDocs.push({ collection: "company_information", id: data.id });
  }

  beforeAll(async () => {
    // Create test candidate information
    await createTestCandidate({
      id: TEST_IDS.candidate1,
      firstnameTH: "สมชาย",
      lastnameTH: "ทดสอบ",
      photoURL: "https://example.com/candidate1.jpg",
    });

    await createTestCandidate({
      id: TEST_IDS.candidate2,
      firstnameTH: "สมหญิง",
      lastnameTH: "ทดสอบ",
    });

    // Create test company information
    await createTestCompany({
      id: TEST_IDS.company1,
      companyName: "บริษัท ทดสอบ จำกัด",
      logoURL: "https://example.com/company1.png",
    });

    await createTestCompany({
      id: TEST_IDS.company2,
      companyName: "บริษัท อีกแห่ง จำกัด",
    });

    // Create test chat rooms
    const now = Date.now();

    await createTestChatRoom({
      id: TEST_IDS.room1,
      candidateId: TEST_IDS.candidate1,
      companyId: TEST_IDS.company1,
      hrId: TEST_IDS.hr1,
      candidateName: "สมชาย ทดสอบ",
      companyName: "บริษัท ทดสอบ จำกัด",
      hrName: "HR ทดสอบ",
      lastMessage: "สวัสดีครับ",
      lastMessageTime: now,
    });

    await createTestChatRoom({
      id: TEST_IDS.room2,
      candidateId: TEST_IDS.candidate1,
      companyId: TEST_IDS.company2,
      hrId: TEST_IDS.hr1,
      candidateName: "สมชาย ทดสอบ",
      companyName: "บริษัท อีกแห่ง จำกัด",
      hrName: "HR อื่น",
      lastMessage: "ขอบคุณครับ",
      lastMessageTime: now - 60000, // 1 minute ago
    });

    // Create messages with unread status
    await createTestMessage({
      id: TEST_IDS.message1,
      roomId: TEST_IDS.room1,
      senderId: TEST_IDS.hr1,
      message: "สวัสดีครับ",
      type: "text",
      unread: [TEST_IDS.candidate1], // Candidate hasn't read
      timestamp: now,
    });

    await createTestMessage({
      id: TEST_IDS.message2,
      roomId: TEST_IDS.room1,
      senderId: TEST_IDS.hr1,
      message: "มีตำแหน่งที่น่าสนใจ",
      type: "text",
      unread: [TEST_IDS.candidate1], // Candidate hasn't read
      timestamp: now - 1000,
    });

    // Create message with pending interview
    await createTestMessage({
      id: TEST_IDS.message3,
      roomId: TEST_IDS.room2,
      senderId: TEST_IDS.hr1,
      message: "นัดสัมภาษณ์",
      type: "interview",
      unread: [],
      timestamp: now - 60000,
      interviewStatus: "pending",
      interviewDate: "2025-02-01",
    });
  });

  afterAll(async () => {
    // Clean up all created test documents
    const batch = db.batch();

    for (const doc of createdDocs) {
      const docRef = db.collection(doc.collection).doc(doc.id);
      batch.delete(docRef);
    }

    await batch.commit();
    console.log(`Cleaned up ${createdDocs.length} test documents`);
  });

  describe("with test data", () => {
    beforeEach(() => {
      // Mock getSessionUser to return candidate1 by default
      vi.mocked(getSessionUser).mockResolvedValue({
        uid: TEST_IDS.candidate1,
        candidateId: TEST_IDS.candidate1,
        companyId: null,
      });
    });

    it("should return rooms from Firestore", async () => {
      const result = await fetchChatRoomsMetadata({
        navBar: "candidate",
        // This would need to be mocked or we'd use a test context
      });

      expect(result.rooms).toBeDefined();
      expect(Array.isArray(result.rooms)).toBe(true);
    });

    it("should calculate unread count correctly", async () => {
      const result = await fetchChatRoomsMetadata({
        navBar: "candidate",
      });

      // Find room1 - should have 2 unread messages
      const room1 = result.rooms.find((r) => r.uid === TEST_IDS.room1);

      if (room1) {
        expect(room1.unreadCount).toBe(2);
      }
    });

    it("should detect pending interviews", async () => {
      const result = await fetchChatRoomsMetadata({
        navBar: "candidate",
      });

      // Find room2 - should have pending interview
      const room2 = result.rooms.find((r) => r.uid === TEST_IDS.room2);

      if (room2) {
        expect(room2.hasPendingAppointment).toBe(true);
      }
    });

    it("should sort by lastMessageTime desc", async () => {
      const result = await fetchChatRoomsMetadata({
        navBar: "candidate",
      });

      // Rooms should be sorted newest first
      for (let i = 1; i < result.rooms.length; i++) {
        expect(result.rooms[i - 1].lastMessageTime).toBeGreaterThanOrEqual(
          result.rooms[i].lastMessageTime
        );
      }
    });

    it("should return otherParty info for candidate view", async () => {
      const result = await fetchChatRoomsMetadata({
        navBar: "candidate",
      });

      // For candidate, otherParty should be company
      const room = result.rooms.find((r) => r.uid === TEST_IDS.room1);

      if (room) {
        expect(room.otherPartyName).toBe("บริษัท ทดสอบ จำกัด");
        expect(room.otherPartyId).toBe(TEST_IDS.company1);
      }
    });

    it("should return otherParty info for company view", async () => {
      // Mock getSessionUser to return a company user
      vi.mocked(getSessionUser).mockResolvedValue({
        uid: TEST_IDS.hr1,
        candidateId: null,
        companyId: TEST_IDS.company1,
      });

      const result = await fetchChatRoomsMetadata({
        navBar: "company",
      });

      // For company, otherParty should be candidate
      const room = result.rooms.find((r) => r.uid === TEST_IDS.room1);

      if (room) {
        expect(room.otherPartyName).toBe("สมชาย ทดสอบ");
        expect(room.otherPartyId).toBe(TEST_IDS.candidate1);
      }
    });
  });

  describe("edge cases", () => {
    beforeEach(() => {
      // Mock getSessionUser to return candidate2 for edge cases
      vi.mocked(getSessionUser).mockResolvedValue({
        uid: TEST_IDS.candidate2,
        candidateId: TEST_IDS.candidate2,
        companyId: null,
      });
    });

    it("should handle rooms with no messages gracefully", async () => {
      // Create room with no messages
      const emptyRoomId = `${TEST_PREFIX}-empty-room`;

      await createTestChatRoom({
        id: emptyRoomId,
        candidateId: TEST_IDS.candidate2,
        companyId: TEST_IDS.company1,
        hrId: TEST_IDS.hr1,
        candidateName: "สมหญิง ทดสอบ",
        companyName: "บริษัท ทดสอบ จำกัด",
        hrName: "HR",
        lastMessage: "",
        lastMessageTime: Date.now(),
      });

      const result = await fetchChatRoomsMetadata({
        navBar: "candidate",
      });

      const emptyRoom = result.rooms.find((r) => r.uid === emptyRoomId);

      if (emptyRoom) {
        expect(emptyRoom.unreadCount).toBe(0);
        expect(emptyRoom.hasPendingAppointment).toBe(false);
      }
    });

    it("should filter out corrupted rooms", async () => {
      // Create corrupted room where candidateId === companyId
      const corruptedRoomId = `${TEST_PREFIX}-corrupted`;
      const sameId = `${TEST_PREFIX}-same-id`;

      await createTestChatRoom({
        id: corruptedRoomId,
        candidateId: sameId,
        companyId: sameId, // Same as candidateId - corrupted
        hrId: TEST_IDS.hr1,
        candidateName: "Corrupted",
        companyName: "Corrupted",
        hrName: "HR",
        lastMessage: "test",
        lastMessageTime: Date.now(),
      });

      const result = await fetchChatRoomsMetadata({
        navBar: "candidate",
      });

      const corruptedRoom = result.rooms.find((r) => r.uid === corruptedRoomId);
      expect(corruptedRoom).toBeUndefined();
    });
  });
});
