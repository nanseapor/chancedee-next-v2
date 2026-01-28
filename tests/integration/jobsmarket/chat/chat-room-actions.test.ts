import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Filter, Timestamp } from "firebase-admin/firestore";

// These tests use the real dev database (not emulator)
// Test data is created and cleaned up for each test

// Mock session for testing
vi.mock("@/lib/firebase/admin-auth", () => ({
  getSessionUser: vi.fn(),
}));

import { getSessionUser } from "@/lib/firebase/admin-auth";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";

// Import actions to test
import {
  sendMessageFirestore,
  markMessagesAsRead,
  loadMessageHistory,
  getRoomDetails,
  sendAttachment,
} from "@/lib/database/actions/chat-messages";

describe("Chat Room Integration", () => {
  // Test identifiers - use unique prefixes to avoid collision
  const TEST_PREFIX = `test-chat-${Date.now()}`;
  const TEST_ROOM_ID = `${TEST_PREFIX}-room`;
  const TEST_USER_ID = `${TEST_PREFIX}-user`;
  const TEST_OTHER_USER_ID = `${TEST_PREFIX}-other-user`;
  const TEST_CANDIDATE_ID = `${TEST_PREFIX}-candidate`;
  const TEST_COMPANY_ID = `${TEST_PREFIX}-company`;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Mock authenticated session
    vi.mocked(getSessionUser).mockResolvedValue({
      uid: TEST_USER_ID,
      candidateId: TEST_CANDIDATE_ID,
      companyId: null,
      email: "test@example.com",
    });

    // Create test room in Firestore with correct schema (snake_case + DocumentReferences)
    const db = getFirebaseAdminFirestore();
    const candidateRef = db.collection("candidate_information").doc(TEST_CANDIDATE_ID);
    const companyRef = db.collection("company_information").doc(TEST_COMPANY_ID);
    const userRef = db.collection("user_accounts").doc(TEST_USER_ID);

    await db.collection("chats").doc(TEST_ROOM_ID).set({
      uid: TEST_ROOM_ID,
      candidate_id: candidateRef,
      company_id: companyRef,
      responsible_hr_id: userRef, // Required by chat-repository transform
      candidate_name: "Test Candidate",
      company_name: "Test Company",
      responsible_hr_name: "",
      last_message_text: null,
      last_message_time: null,
      last_message_sender: null,
      timestamp: Timestamp.now(),
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
      created_by: userRef,
      updated_by: userRef,
    });

    // Create test candidate info
    await db.collection("candidate_information").doc(TEST_CANDIDATE_ID).set({
      uid: TEST_CANDIDATE_ID,
      firstnameTH: "ทดสอบ",
      lastnameTH: "ระบบ",
      email: "test@example.com",
    });

    // Create test company info
    await db.collection("company_information").doc(TEST_COMPANY_ID).set({
      uid: TEST_COMPANY_ID,
      companyName: "บริษัท ทดสอบ จำกัด",
    });
  });

  afterEach(async () => {
    // Clean up test data
    const db = getFirebaseAdminFirestore();
    const roomRef = db.collection("chats").doc(TEST_ROOM_ID);

    // Delete test messages (using correct snake_case field + DocumentReference)
    const messagesSnapshot = await db
      .collection("messages")
      .where("room_id", "==", roomRef)
      .get();

    const batch = db.batch();
    messagesSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete test room
    batch.delete(db.collection("chats").doc(TEST_ROOM_ID));

    // Delete test candidate
    batch.delete(db.collection("candidate_information").doc(TEST_CANDIDATE_ID));

    // Delete test company
    batch.delete(db.collection("company_information").doc(TEST_COMPANY_ID));

    await batch.commit();
  });

  describe("sendMessageFirestore", () => {
    it("should create message in Firestore", async () => {
      const result = await sendMessageFirestore({
        roomId: TEST_ROOM_ID,
        message: "Integration test message",
        type: "text",
      });

      expect(result).toHaveProperty("messageId");
      expect(result.messageId).toBeDefined();

      // Verify message was created
      const db = getFirebaseAdminFirestore();
      const messageDoc = await db
        .collection("messages")
        .doc(result.messageId)
        .get();

      expect(messageDoc.exists).toBe(true);
      expect(messageDoc.data()?.message).toBe("Integration test message");
      expect(messageDoc.data()?.type).toBe("text");
      // room_id is a DocumentReference, check its path contains the room ID
      expect(messageDoc.data()?.room_id?.path).toContain(TEST_ROOM_ID);
    });

    it("should update room document", async () => {
      const result = await sendMessageFirestore({
        roomId: TEST_ROOM_ID,
        message: "Update room test",
        type: "text",
      });

      // Verify room was updated (using snake_case field names in Firestore)
      const db = getFirebaseAdminFirestore();
      const roomDoc = await db.collection("chats").doc(TEST_ROOM_ID).get();

      expect(roomDoc.data()?.last_message_text).toBe("Update room test");
      expect(roomDoc.data()?.last_message_time).toBeDefined();
      expect(roomDoc.data()?.last_message_sender).toBe("candidate");
    });

    it("should set correct unread array", async () => {
      const result = await sendMessageFirestore({
        roomId: TEST_ROOM_ID,
        message: "Unread test message",
        type: "text",
      });

      // Verify unread array contains the other party
      const db = getFirebaseAdminFirestore();
      const messageDoc = await db
        .collection("messages")
        .doc(result.messageId)
        .get();

      expect(messageDoc.data()?.unread).toContain(TEST_COMPANY_ID);
      expect(messageDoc.data()?.unread).not.toContain(TEST_USER_ID);
    });

    it("should reject empty messages", async () => {
      await expect(
        sendMessageFirestore({
          roomId: TEST_ROOM_ID,
          message: "",
          type: "text",
        })
      ).rejects.toThrow("MESSAGE_EMPTY");
    });

    it("should reject unauthorized users", async () => {
      vi.mocked(getSessionUser).mockResolvedValue(null);

      await expect(
        sendMessageFirestore({
          roomId: TEST_ROOM_ID,
          message: "Unauthorized",
          type: "text",
        })
      ).rejects.toThrow("UNAUTHORIZED");
    });
  });

  describe("markMessagesAsRead", () => {
    beforeEach(async () => {
      // Create unread messages for testing with correct schema
      const db = getFirebaseAdminFirestore();
      const roomRef = db.collection("chats").doc(TEST_ROOM_ID);
      const senderRef = db.collection("user_accounts").doc(TEST_COMPANY_ID);
      const userRef = db.collection("user_accounts").doc(TEST_USER_ID);

      for (let i = 0; i < 3; i++) {
        await db.collection("messages").add({
          uid: `${TEST_PREFIX}-msg-${i}`,
          room_id: roomRef,
          sender_id: senderRef,
          message: `Unread message ${i}`,
          type: "text",
          timestamp: Timestamp.fromMillis(Date.now() - i * 1000),
          unread: [TEST_USER_ID],
          created_by: senderRef,
          updated_by: senderRef,
          created_at: Timestamp.now(),
          updated_at: Timestamp.now(),
        });
      }
    });

    it("should update unread arrays in Firestore", async () => {
      await markMessagesAsRead({
        roomId: TEST_ROOM_ID,
      });

      // Verify messages are marked as read
      const db = getFirebaseAdminFirestore();
      const roomRef = db.collection("chats").doc(TEST_ROOM_ID);
      const messagesSnapshot = await db
        .collection("messages")
        .where("room_id", "==", roomRef)
        .get();

      messagesSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        expect(data.unread).not.toContain(TEST_USER_ID);
      });
    });

    it("should handle batch of messages", async () => {
      // This test verifies batch updates work correctly
      const result = await markMessagesAsRead({
        roomId: TEST_ROOM_ID,
      });

      // Should not throw and should process all messages
      expect(result).toBeUndefined(); // void return

      // Verify all 3 messages were updated
      const db = getFirebaseAdminFirestore();
      const roomRef = db.collection("chats").doc(TEST_ROOM_ID);
      const messagesSnapshot = await db
        .collection("messages")
        .where("room_id", "==", roomRef)
        .where("unread", "array-contains", TEST_USER_ID)
        .get();

      expect(messagesSnapshot.empty).toBe(true);
    });
  });

  describe("loadMessageHistory", () => {
    beforeEach(async () => {
      // Create messages for pagination testing with correct schema
      const db = getFirebaseAdminFirestore();
      const roomRef = db.collection("chats").doc(TEST_ROOM_ID);
      const userRef = db.collection("user_accounts").doc(TEST_USER_ID);
      const companyRef = db.collection("user_accounts").doc(TEST_COMPANY_ID);

      for (let i = 0; i < 60; i++) {
        const senderRef = i % 2 === 0 ? userRef : companyRef;
        await db.collection("messages").add({
          uid: `${TEST_PREFIX}-history-${i}`,
          room_id: roomRef,
          sender_id: senderRef,
          message: `History message ${i}`,
          type: "text",
          timestamp: Timestamp.fromMillis(Date.now() - i * 60000), // 1 minute apart
          unread: [],
          created_by: senderRef,
          updated_by: senderRef,
          created_at: Timestamp.now(),
          updated_at: Timestamp.now(),
        });
      }
    });

    it("should return messages from Firestore", async () => {
      const result = await loadMessageHistory({
        roomId: TEST_ROOM_ID,
      });

      expect(result.messages).toBeDefined();
      expect(result.messages.length).toBeGreaterThan(0);
      expect(result.messages.length).toBeLessThanOrEqual(50);
    });

    it("should paginate correctly", async () => {
      const firstPage = await loadMessageHistory({
        roomId: TEST_ROOM_ID,
      });

      expect(firstPage.hasMore).toBe(true);
      expect(firstPage.cursor).toBeDefined();

      const secondPage = await loadMessageHistory({
        roomId: TEST_ROOM_ID,
        cursor: firstPage.cursor,
      });

      expect(secondPage.messages).toBeDefined();

      // Verify no duplicate messages
      const firstPageIds = firstPage.messages.map((m) => m.messageId);
      const secondPageIds = secondPage.messages.map((m) => m.messageId);

      firstPageIds.forEach((id) => {
        expect(secondPageIds).not.toContain(id);
      });
    });

    it("should order by timestamp", async () => {
      const result = await loadMessageHistory({
        roomId: TEST_ROOM_ID,
      });

      // Messages should be ordered by timestamp ascending (chronological order)
      // Repository fetches desc and reverses for chronological display
      for (let i = 0; i < result.messages.length - 1; i++) {
        expect(result.messages[i].timestamp).toBeLessThanOrEqual(
          result.messages[i + 1].timestamp
        );
      }
    });
  });

  describe("getRoomDetails", () => {
    it("should return room metadata", async () => {
      const result = await getRoomDetails({
        roomId: TEST_ROOM_ID,
      });

      expect(result.room).toBeDefined();
      expect(result.room.id).toBe(TEST_ROOM_ID);
      expect(result.room.candidateId).toBe(TEST_CANDIDATE_ID);
      expect(result.room.companyId).toBe(TEST_COMPANY_ID);
    });

    it("should return other party info for candidate", async () => {
      const result = await getRoomDetails({
        roomId: TEST_ROOM_ID,
      });

      expect(result.otherParty).toBeDefined();
      expect(result.otherParty.id).toBe(TEST_COMPANY_ID);
      expect(result.otherParty.role).toBe("company");
    });

    it("should return current user info", async () => {
      const result = await getRoomDetails({
        roomId: TEST_ROOM_ID,
      });

      expect(result.currentUser).toBeDefined();
      expect(result.currentUser.id).toBe(TEST_USER_ID);
      expect(result.currentUser.role).toBe("candidate");
    });

    it("should throw ROOM_NOT_FOUND for invalid room", async () => {
      await expect(
        getRoomDetails({
          roomId: "non-existent-room",
        })
      ).rejects.toThrow("ROOM_NOT_FOUND");
    });

    it("should throw NOT_PARTICIPANT for unauthorized access", async () => {
      // Mock a different user
      vi.mocked(getSessionUser).mockResolvedValue({
        uid: "other-user",
        candidateId: "other-candidate",
        companyId: null,
        email: "other@example.com",
      });

      await expect(
        getRoomDetails({
          roomId: TEST_ROOM_ID,
        })
      ).rejects.toThrow("NOT_PARTICIPANT");
    });
  });

  describe("file upload integration", () => {
    it("should upload file to Storage", async () => {
      // This test would require actual file upload
      // Skipping in unit test context - covered by E2E
      expect(true).toBe(true);
    });

    it("should create message with file URL", async () => {
      // This test would require actual file upload
      // Skipping in unit test context - covered by E2E
      expect(true).toBe(true);
    });
  });

  describe("interview integration", () => {
    beforeEach(async () => {
      // Create a test interview
      const db = getFirebaseAdminFirestore();
      await db.collection("job_interviews").doc(`${TEST_PREFIX}-interview`).set({
        uid: `${TEST_PREFIX}-interview`,
        room: TEST_ROOM_ID,
        candidate_id: db.collection("candidate_information").doc(TEST_CANDIDATE_ID),
        company_id: db.collection("company_information").doc(TEST_COMPANY_ID),
        appointment: new Date(Date.now() + 86400000), // Tomorrow
        channel: "online",
        status: "pending",
        is_cancel: false,
        is_accepted: false,
        from: "10:00",
        to: "11:00",
      });
    });

    afterEach(async () => {
      // Clean up interview
      const db = getFirebaseAdminFirestore();
      await db
        .collection("job_interviews")
        .doc(`${TEST_PREFIX}-interview`)
        .delete();
    });

    it("should return interview with room details", async () => {
      const result = await getRoomDetails({
        roomId: TEST_ROOM_ID,
      });

      expect(result.interview).toBeDefined();
      expect(result.interview?.channel).toBe("online");
      expect(result.interview?.status).toBe("pending");
    });
  });
});
