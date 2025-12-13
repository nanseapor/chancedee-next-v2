/**
 * Integration Tests for messages actions
 * Tests messaging CRUD, batch operations, and room filtering
 */

import { describe, it, expect, afterEach } from "vitest";
import {
  webMessagesCreate,
  webMessagesGetByRoomId,
  webMessagesGetByFilter,
  webMessagesUpdate,
  webMessagesBatchUpdate,
  webMessagesDelete,
} from "@/lib/database/actions/messages";
import { generateTestId, cleanupMultipleTestData, getTestActorId, createWhereFilter, createDocRefFilter } from "../test-utils";

describe("messages actions (integration)", () => {
  const testIds: Array<{ collection: string; docId: string }> = [];
  const actorId = getTestActorId();

  afterEach(async () => {
    await cleanupMultipleTestData(testIds);
    testIds.length = 0;
  });

  it("should create and read message", async () => {
    const testId = generateTestId("message");
    testIds.push({ collection: "messages", docId: testId });

    const roomId = generateTestId("room");
    const senderId = generateTestId("sender");

    // Create
    const createdId = await webMessagesCreate(
      {
        uid: testId,
        roomId,
        messageId: testId,
        senderId,
        name: "Test Sender",
        avatar: "https://example.com/avatar.png",
        message: "Hello, this is a test message",
        type: "text",
        unread: [senderId],
        timestamp: Date.now(),
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      actorId,
      testId
    );

    expect(createdId).toBe(testId);

    // Read via room ID filter
    const messages = await webMessagesGetByRoomId(roomId);

    expect(messages).toBeDefined();
    const testMessage = messages!.find(m => m.uid === testId);
    expect(testMessage).toBeDefined();
    expect(testMessage?.message).toBe("Hello, this is a test message");
    expect(testMessage?.type).toBe("text");
    expect(testMessage?.unread).toContain(senderId);
  }, 30000);

  it("should update message", async () => {
    const testId = generateTestId("message");
    testIds.push({ collection: "messages", docId: testId });

    const roomId = generateTestId("room");
    const senderId = generateTestId("sender");
    const receiverId = generateTestId("receiver");

    // Create
    await webMessagesCreate(
      {
        uid: testId,
        roomId,
        messageId: testId,
        senderId,
        name: "Test Sender",
        avatar: "https://example.com/avatar.png",
        message: "Original message",
        type: "text",
        unread: [receiverId],
        timestamp: Date.now(),
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      actorId,
      testId
    );

    // Update - mark as read by removing from unread array
    await webMessagesUpdate(
      {
        uid: testId,
        roomId,
        messageId: testId,
        senderId,
        name: "Test Sender",
        avatar: "https://example.com/avatar.png",
        message: "Original message",
        type: "text",
        unread: [], // Mark as read
        timestamp: Date.now(),
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      actorId,
      testId
    );

    // Read
    const messages = await webMessagesGetByRoomId(roomId);
    const testMessage = messages!.find(m => m.uid === testId);

    expect(testMessage?.unread.length).toBe(0);
  }, 30000);

  it("should handle different message types", async () => {
    const roomId = generateTestId("room");
    const senderId = generateTestId("sender");
    const messageTypes = ["text", "image", "file", "video"];
    const createdIds: string[] = [];

    // Create messages of different types
    for (const type of messageTypes) {
      const testId = generateTestId(`message_${type}`);
      testIds.push({ collection: "messages", docId: testId });
      createdIds.push(testId);

      await webMessagesCreate(
        {
          uid: testId,
          roomId,
          messageId: testId,
          senderId,
          name: "Test Sender",
          avatar: "https://example.com/avatar.png",
          message: type === "text" ? `This is a ${type} message` : "",
          type,
          unread: [],
          timestamp: Date.now(),
          attachments: type !== "text" ? `https://example.com/${type}.jpg` : undefined,
          createdBy: actorId,
          updatedBy: actorId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        actorId,
        testId
      );
    }

    // Read all messages in room
    const messages = await webMessagesGetByRoomId(roomId);

    expect(messages).toBeDefined();
    for (let i = 0; i < messageTypes.length; i++) {
      const message = messages!.find(m => m.uid === createdIds[i]);
      expect(message).toBeDefined();
      expect(message?.type).toBe(messageTypes[i]);
    }
  }, 30000);

  it("should batch update messages (mark multiple as read)", async () => {
    const roomId = generateTestId("room");
    const senderId = generateTestId("sender");
    const receiverId = generateTestId("receiver");
    const messageCount = 5;
    const messageIds: string[] = [];

    // Create multiple unread messages
    for (let i = 0; i < messageCount; i++) {
      const testId = generateTestId(`message_${i}`);
      testIds.push({ collection: "messages", docId: testId });
      messageIds.push(testId);

      await webMessagesCreate(
        {
          uid: testId,
          roomId,
          messageId: testId,
          senderId,
          name: "Test Sender",
          avatar: "https://example.com/avatar.png",
          message: `Message ${i}`,
          type: "text",
          unread: [receiverId],
          timestamp: Date.now() + i,
          createdBy: actorId,
          updatedBy: actorId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        actorId,
        testId
      );
    }

    // Batch update - mark all as read
    const batchPayload = messageIds.map(messageId => ({
      uid: messageId,
      roomId,
      messageId,
      senderId,
      name: "Test Sender",
      avatar: "https://example.com/avatar.png",
      message: "Updated message",
      type: "text" as const,
      unread: [], // Mark as read
      timestamp: Date.now(),
      createdBy: actorId,
      updatedBy: actorId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }));

    await webMessagesBatchUpdate(batchPayload, actorId);

    // Verify all messages are marked as read
    const messages = await webMessagesGetByRoomId(roomId);
    expect(messages).toBeDefined();

    for (const messageId of messageIds) {
      const message = messages!.find(m => m.uid === messageId);
      expect(message?.unread.length).toBe(0);
    }
  }, 30000);

  it("should filter messages by sender", async () => {
    const testId = generateTestId("message");
    testIds.push({ collection: "messages", docId: testId });

    const roomId = generateTestId("room");
    const senderId = generateTestId("sender_unique");

    // Create
    await webMessagesCreate(
      {
        uid: testId,
        roomId,
        messageId: testId,
        senderId,
        name: "Unique Sender",
        avatar: "https://example.com/avatar.png",
        message: "Message from specific sender",
        type: "text",
        unread: [],
        timestamp: Date.now(),
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      actorId,
      testId
    );

    // Filter by sender - use DocumentReference for sender_id field
    const results = await webMessagesGetByFilter(
      createDocRefFilter("sender_id", "user_accounts", senderId)
    );

    expect(results).toBeDefined();
    const testMessage = results!.find(m => m.uid === testId);
    expect(testMessage).toBeDefined();
    expect(testMessage?.senderId).toBe(senderId);
  }, 30000);

  it("should filter messages by room", async () => {
    const testId = generateTestId("message");
    testIds.push({ collection: "messages", docId: testId });

    const roomId = generateTestId("room_specific");
    const senderId = generateTestId("sender");

    // Create message
    await webMessagesCreate(
      {
        uid: testId,
        roomId,
        messageId: testId,
        senderId,
        name: "Test Sender",
        avatar: "https://example.com/avatar.png",
        message: "Message in specific room",
        type: "text",
        unread: [],
        timestamp: Date.now(),
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      actorId,
      testId
    );

    // Filter
    const results = await webMessagesGetByRoomId(roomId);

    expect(results).toBeDefined();
    const testMessage = results!.find(m => m.uid === testId);
    expect(testMessage).toBeDefined();
    expect(testMessage?.roomId).toBe(roomId);
  }, 30000);

  it("should get all messages in a room ordered by timestamp", async () => {
    const roomId = generateTestId("room_ordered");
    const senderId = generateTestId("sender");
    const messageCount = 3;

    // Create messages with different timestamps
    for (let i = 0; i < messageCount; i++) {
      const testId = generateTestId(`ordered_msg_${i}`);
      testIds.push({ collection: "messages", docId: testId });

      await webMessagesCreate(
        {
          uid: testId,
          roomId,
          messageId: testId,
          senderId,
          name: "Test Sender",
          avatar: "https://example.com/avatar.png",
          message: `Message ${i}`,
          type: "text",
          unread: [],
          timestamp: Date.now() + (i * 1000), // Increment timestamp
          createdBy: actorId,
          updatedBy: actorId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        actorId,
        testId
      );
    }

    // Get all messages in room
    const messages = await webMessagesGetByRoomId(roomId);

    expect(messages).toBeDefined();
    expect(messages!.length).toBeGreaterThanOrEqual(messageCount);

    // Filter to our test messages
    const testMessages = messages!
      .filter(m => m.message?.startsWith("Message "))
      .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

    expect(testMessages.length).toBe(messageCount);
    expect(testMessages[0]?.message).toBe("Message 0");
    expect(testMessages[2]?.message).toBe("Message 2");
  }, 30000);

  it("should delete message", async () => {
    const testId = generateTestId("message");
    testIds.push({ collection: "messages", docId: testId });

    const roomId = generateTestId("room");
    const senderId = generateTestId("sender");

    // Create
    await webMessagesCreate(
      {
        uid: testId,
        roomId,
        messageId: testId,
        senderId,
        name: "Test Sender",
        avatar: "https://example.com/avatar.png",
        message: "Delete me",
        type: "text",
        unread: [],
        timestamp: Date.now(),
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      actorId,
      testId
    );

    // Verify it exists
    let messages = await webMessagesGetByRoomId(roomId);
    let testMessage = messages!.find(m => m.uid === testId);
    expect(testMessage).toBeDefined();

    // Delete
    await webMessagesDelete(testId);

    // Verify it's deleted
    messages = await webMessagesGetByRoomId(roomId);
    testMessage = messages?.find(m => m.uid === testId);
    expect(testMessage).toBeUndefined();
  }, 30000);

  it("should handle message with file attachment", async () => {
    const testId = generateTestId("message");
    testIds.push({ collection: "messages", docId: testId });

    const roomId = generateTestId("room");
    const senderId = generateTestId("sender");

    // Create message with file
    await webMessagesCreate(
      {
        uid: testId,
        roomId,
        messageId: testId,
        senderId,
        name: "Test Sender",
        avatar: "https://example.com/avatar.png",
        message: "",
        type: "file",
        unread: [],
        timestamp: Date.now(),
        attachments: "https://example.com/document.pdf",
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      actorId,
      testId
    );

    // Read
    const messages = await webMessagesGetByRoomId(roomId);
    const testMessage = messages!.find(m => m.uid === testId);

    expect(testMessage).toBeDefined();
    expect(testMessage?.type).toBe("file");
    expect(testMessage?.attachments).toBe("https://example.com/document.pdf");
  }, 30000);

  it("should handle conversation between two users", async () => {
    const roomId = generateTestId("room_conversation");
    const user1Id = generateTestId("user1");
    const user2Id = generateTestId("user2");

    // User 1 sends message
    const msg1Id = generateTestId("msg1");
    testIds.push({ collection: "messages", docId: msg1Id });
    await webMessagesCreate(
      {
        uid: msg1Id,
        roomId,
        messageId: msg1Id,
        senderId: user1Id,
        name: "User 1",
        avatar: "https://example.com/user1.png",
        message: "Hi there!",
        type: "text",
        unread: [user2Id],
        timestamp: Date.now(),
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      actorId,
      msg1Id
    );

    // User 2 responds
    const msg2Id = generateTestId("msg2");
    testIds.push({ collection: "messages", docId: msg2Id });
    await webMessagesCreate(
      {
        uid: msg2Id,
        roomId,
        messageId: msg2Id,
        senderId: user2Id,
        name: "User 2",
        avatar: "https://example.com/user2.png",
        message: "Hello! How can I help?",
        type: "text",
        unread: [user1Id],
        timestamp: Date.now() + 1000,
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      actorId,
      msg2Id
    );

    // User 1 sends another message
    const msg3Id = generateTestId("msg3");
    testIds.push({ collection: "messages", docId: msg3Id });
    await webMessagesCreate(
      {
        uid: msg3Id,
        roomId,
        messageId: msg3Id,
        senderId: user1Id,
        name: "User 1",
        avatar: "https://example.com/user1.png",
        message: "I have a question about the job posting",
        type: "text",
        unread: [user2Id],
        timestamp: Date.now() + 2000,
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      actorId,
      msg3Id
    );

    // Get all messages in conversation
    const messages = await webMessagesGetByRoomId(roomId);

    expect(messages).toBeDefined();
    const conversationMessages = messages!
      .filter(m => [msg1Id, msg2Id, msg3Id].includes(m.uid!))
      .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

    expect(conversationMessages.length).toBe(3);
    expect(conversationMessages[0]?.senderId).toBe(user1Id);
    expect(conversationMessages[1]?.senderId).toBe(user2Id);
    expect(conversationMessages[2]?.senderId).toBe(user1Id);
  }, 30000);
});
