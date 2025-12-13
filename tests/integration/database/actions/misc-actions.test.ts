/**
 * Integration Tests for miscellaneous actions
 * Tests company-requests, delete, chats, and wallet-transactions
 */

import { describe, it, expect, afterEach } from "vitest";
import {
  webCompanyRequestsCreate,
  webCompanyRequestsGetById,
  webCompanyRequestsUpdate,
} from "@/lib/database/actions/company-requests";
import {
  webDeleteRequestCreate,
  webDeleteRequestGetByFilter,
} from "@/lib/database/actions/delete";
import {
  webChatCreate,
  webChatGetById,
  webChatUpdate,
} from "@/lib/database/actions/chats";
import {
  webWalletTransactionCreate,
  webWalletTransactionGetById,
} from "@/lib/database/actions/wallet-transactions";
import { generateTestId, cleanupTestData, cleanupMultipleTestData, getTestActorId, createWhereFilter } from "../test-utils";

describe("company-requests actions (integration)", () => {
  const testIds: string[] = [];
  const actorId = getTestActorId();

  afterEach(async () => {
    for (const id of testIds) {
      await cleanupTestData("company_information", id);
    }
    testIds.length = 0;
  });

  it("should create and read company request", async () => {
    const testId = generateTestId("company_req");
    testIds.push(testId);

    // Create
    const createdId = await webCompanyRequestsCreate(
      {
        uid: testId,
        companyName: "Test Company Ltd",
        firstNameTH: "สมชาย",
        lastNameTH: "ใจดี",
        email: "test@example.com",
        status: "pending",
        companyLogo: "https://example.com/logo.png",
        country: "Thailand",
        companySize: "50-100",
        attachedFiles: ["doc1.pdf", "doc2.pdf"],
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      actorId,
      testId
    );

    expect(createdId).toBe(testId);

    // Read
    const retrieved = await webCompanyRequestsGetById(testId);

    expect(retrieved).toBeDefined();
    expect(retrieved?.companyName).toBe("Test Company Ltd");
    expect(retrieved?.status).toBe("pending");
    expect(retrieved?.attachedFiles).toEqual(["doc1.pdf", "doc2.pdf"]);
  });

  it("should update company request status", async () => {
    const testId = generateTestId("company_req");
    testIds.push(testId);

    // Create
    await webCompanyRequestsCreate(
      {
        uid: testId,
        companyName: "Test Company",
        email: "test@example.com",
        status: "pending",
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      actorId,
      testId
    );

    // Update
    await webCompanyRequestsUpdate(
      {
        uid: testId,
        companyName: "Test Company",
        email: "test@example.com",
        status: "approved",
        createdBy: actorId,
        updatedBy: actorId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      actorId,
      testId
    );

    // Read
    const retrieved = await webCompanyRequestsGetById(testId);

    expect(retrieved?.status).toBe("approved");
  });
});

describe("delete-request actions (integration)", () => {
  const testIds: string[] = [];
  const actorId = getTestActorId();

  afterEach(async () => {
    for (const id of testIds) {
      await cleanupTestData("delete", id);
    }
    testIds.length = 0;
  });

  it("should create and read delete request", async () => {
    const testId = generateTestId("delete_req");
    testIds.push(testId);

    const documentCode = `DEL${Date.now()}`;

    // Create
    const createdId = await webDeleteRequestCreate(
      {
        documentCode,
        firstNameTH: "สมชาย",
        lastNameTH: "ใจดี",
        phoneNumber: "0812345678",
        email: "delete@example.com",
        status: "pending",
        attachedFiles: ["id_card.pdf"],
        createAt: Date.now(),
        createdBy: actorId,
        updateAt: Date.now(),
        updatedBy: actorId,
      },
      actorId,
      testId
    );

    expect(createdId).toBe(testId);

    // Filter
    const results = await webDeleteRequestGetByFilter(
      createWhereFilter("document_code", "==", documentCode)
    );

    expect(results).toBeDefined();
    const record = results!.find(r => r.documentCode === documentCode);
    expect(record).toBeDefined();
    expect(record?.email).toBe("delete@example.com");
  });
});

describe("chats actions (integration)", () => {
  const testIds: { collection: string; docId: string }[] = [];
  const actorId = getTestActorId();

  afterEach(async () => {
    await cleanupMultipleTestData(testIds);
    testIds.length = 0;
  });

  it("should create and read chat room", async () => {
    const testId = generateTestId("chat");
    testIds.push({ collection: "chats", docId: testId });

    const now = Date.now();

    // Create
    const createdId = await webChatCreate(
      {
        id: testId,
        companyId: "company_123",
        candidateId: "candidate_456",
        hrId: "hr_789",
        candidateName: "John Doe",
        companyName: "Test Corp",
        hrName: "Jane Smith",
        lastMessage: "Hello!",
        lastupdate: now,
      },
      actorId,
      testId
    );

    expect(createdId).toBe(testId);

    // Read
    const retrieved = await webChatGetById(testId);

    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe(testId);
    expect(retrieved?.candidateName).toBe("John Doe");
    expect(retrieved?.lastMessage).toBe("Hello!");
  });

  it("should update chat room", async () => {
    const testId = generateTestId("chat");
    testIds.push({ collection: "chats", docId: testId });

    // Create
    await webChatCreate(
      {
        id: testId,
        companyId: "company_123",
        candidateId: "candidate_456",
        hrId: "hr_789",
        candidateName: "John Doe",
        companyName: "Test Corp",
        hrName: "Jane Smith",
        lastMessage: "Hello!",
        lastupdate: Date.now(),
      },
      actorId,
      testId
    );

    // Update
    const newTimestamp = Date.now();
    await webChatUpdate(
      {
        id: testId,
        companyId: "company_123",
        candidateId: "candidate_456",
        hrId: "hr_789",
        candidateName: "John Doe",
        companyName: "Test Corp",
        hrName: "Jane Smith",
        lastMessage: "How are you?",
        lastupdate: newTimestamp,
      },
      actorId,
      testId
    );

    // Read
    const retrieved = await webChatGetById(testId);

    expect(retrieved?.lastMessage).toBe("How are you?");
  });
});

describe("wallet-transactions actions (integration)", () => {
  const testIds: string[] = [];
  const walletId = generateTestId("wallet");

  afterEach(async () => {
    for (const id of testIds) {
      await cleanupTestData("wallet_transactions", id);
    }
    testIds.length = 0;
  });

  it("should create and read wallet transaction", async () => {
    const testId = generateTestId("wallet_tx");
    testIds.push(testId);

    const now = Date.now();

    // Create
    const createdId = await webWalletTransactionCreate(
      {
        transactionId: testId,
        transactionOwner: "user_123",
        transactionOrigin: "signup_bonus",
        transactionType: "credit",
        transactionAmount: 100,
        transactionTime: now,
        remark: "Welcome bonus",
      },
      walletId,
      "THB",
      testId
    );

    expect(createdId).toBe(testId);

    // Read
    const retrieved = await webWalletTransactionGetById(testId);

    expect(retrieved).toBeDefined();
    expect(retrieved?.transactionId).toBe(testId);
    expect(retrieved?.transactionAmount).toBe(100);
    expect(retrieved?.remark).toBe("Welcome bonus");
  });
});
