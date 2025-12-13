/**
 * Integration Tests for pockets (wallet) actions
 * Tests wallet pocket read and update operations
 */

import {
  webPocketsGetById,
  webPocketsUpdate,
} from "@/lib/database/actions/pockets";
import {
  webWalletTransactionCreate,
} from "@/lib/database/actions/wallet-transactions";
import { currency } from "@/types/wallet.types";
import { afterEach, describe, expect, it } from "vitest";
import { cleanupMultipleTestData, generateTestId, getTestActorId } from "../test-utils";

describe("pockets actions (integration)", () => {
  const testIds: Array<{ collection: string; docId: string }> = [];
  const actorId = getTestActorId();

  afterEach(async () => {
    await cleanupMultipleTestData(testIds);
    testIds.length = 0;
  });

  it("should read and update pocket balance", async () => {
    const walletId = generateTestId("wallet");
    const currency = "coin";

    // Create initial pocket by updating it
    await webPocketsUpdate(
      {
        uid: walletId,
        currency,
        balance: 1000,
        latest: [],
      },
      actorId,
      walletId,
      currency
    );

    testIds.push({ collection: currency, docId: walletId });

    // Read
    const retrieved = await webPocketsGetById(walletId, currency);

    expect(retrieved).toBeDefined();
    expect(retrieved?.uid).toBe(walletId);
    expect(retrieved?.currency).toBe(currency);
    expect(retrieved?.balance).toBe(1000);
    expect(retrieved?.latest).toBeDefined();
  }, 30000);

  it("should update pocket balance with transactions", async () => {
    const walletId = generateTestId("wallet");
    const currency = "coin";

    // Create initial pocket
    await webPocketsUpdate(
      {
        uid: walletId,
        currency,
        balance: 500,
        latest: [],
      },
      actorId,
      walletId,
      currency
    );

    testIds.push({ collection: currency, docId: walletId });

    // Create some transactions
    const tx1Id = generateTestId("tx1");
    testIds.push({ collection: "wallet_transactions", docId: tx1Id });
    await webWalletTransactionCreate(
      {
        transactionId: tx1Id,
        transactionOwner: walletId,
        transactionOrigin: "deposit",
        transactionType: "credit",
        transactionAmount: 500,
        transactionTime: Date.now(),
        remark: "Test deposit",
      },
      walletId,
      currency,
      tx1Id
    );

    // Update pocket with new balance
    await webPocketsUpdate(
      {
        uid: walletId,
        currency,
        balance: 1000, // 500 + 500
        latest: [],
      },
      actorId,
      walletId,
      currency
    );

    // Read
    const retrieved = await webPocketsGetById(walletId, currency);

    expect(retrieved?.balance).toBe(1000);
  }, 30000);

  it("should track latest transactions in pocket", async () => {
    const walletId = generateTestId("wallet");
    const currency = "coin";

    // Create initial pocket
    await webPocketsUpdate(
      {
        uid: walletId,
        currency,
        balance: 0,
        latest: [],
      },
      actorId,
      walletId,
      currency
    );

    testIds.push({ collection: currency, docId: walletId });

    // Create multiple transactions
    const transactionIds: string[] = [];
    let currentBalance = 0;

    for (let i = 0; i < 5; i++) {
      const txId = generateTestId(`tx_${i}`);
      testIds.push({ collection: "wallet_transactions", docId: txId });
      transactionIds.push(txId);

      const amount = 100 * (i + 1);
      currentBalance += amount;

      await webWalletTransactionCreate(
        {
          transactionId: txId,
          transactionOwner: walletId,
          transactionOrigin: "test",
          transactionType: "credit",
          transactionAmount: amount,
          transactionTime: Date.now() + i,
          remark: `Transaction ${i}`,
        },
        walletId,
        currency,
        txId
      );

      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    // Update pocket with final balance
    await webPocketsUpdate(
      {
        uid: walletId,
        currency,
        balance: currentBalance,
        latest: [],
      },
      actorId,
      walletId,
      currency
    );

    // Read
    const retrieved = await webPocketsGetById(walletId, currency);

    expect(retrieved?.balance).toBe(currentBalance);
    expect(retrieved?.latest).toBeDefined();
    // Latest should contain transaction details
    expect(Array.isArray(retrieved?.latest)).toBe(true);
  }, 30000);

  it("should handle different currencies", async () => {
    const walletId = generateTestId("wallet_multi");
    const currencies = ["coin", "star"];

    for (const currency of currencies) {
      await webPocketsUpdate(
        {
          uid: walletId,
          currency,
          balance: 1000,
          latest: [],
        },
        actorId,
        walletId,
        currency as currency
      );

      testIds.push({ collection: currency, docId: walletId });
    }

    // Read each currency pocket
    for (const currency of currencies) {
      const retrieved = await webPocketsGetById(walletId, currency as currency);
      expect(retrieved).toBeDefined();
      expect(retrieved?.currency).toBe(currency);
      expect(retrieved?.balance).toBe(1000);
    }
  }, 30000);

  it("should handle debit and credit transactions", async () => {
    const walletId = generateTestId("wallet");
    const currency = "coin";
    let balance = 1000;

    // Create initial pocket
    await webPocketsUpdate(
      {
        uid: walletId,
        currency,
        balance,
        latest: [],
      },
      actorId,
      walletId,
      currency
    );

    testIds.push({ collection: currency, docId: walletId });

    // Credit transaction
    const creditTxId = generateTestId("tx_credit");
    testIds.push({ collection: "wallet_transactions", docId: creditTxId });
    await webWalletTransactionCreate(
      {
        transactionId: creditTxId,
        transactionOwner: walletId,
        transactionOrigin: "deposit",
        transactionType: "credit",
        transactionAmount: 500,
        transactionTime: Date.now(),
        remark: "Deposit",
      },
      walletId,
      currency,
      creditTxId
    );
    balance += 500;

    // Debit transaction
    const debitTxId = generateTestId("tx_debit");
    testIds.push({ collection: "wallet_transactions", docId: debitTxId });
    await webWalletTransactionCreate(
      {
        transactionId: debitTxId,
        transactionOwner: walletId,
        transactionOrigin: "withdrawal",
        transactionType: "debit",
        transactionAmount: 200,
        transactionTime: Date.now() + 1000,
        remark: "Withdrawal",
      },
      walletId,
      currency,
      debitTxId
    );
    balance -= 200;

    // Update pocket
    await webPocketsUpdate(
      {
        uid: walletId,
        currency,
        balance,
        latest: [],
      },
      actorId,
      walletId,
      currency
    );

    // Read
    const retrieved = await webPocketsGetById(walletId, currency);

    expect(retrieved?.balance).toBe(1300); // 1000 + 500 - 200
  }, 30000);

  it("should return null for non-existent pocket", async () => {
    const nonExistentId = generateTestId("nonexistent");
    const result = await webPocketsGetById(nonExistentId, "coin");
    expect(result).toBeNull();
  }, 30000);

  it("should handle zero balance", async () => {
    const walletId = generateTestId("wallet_zero");
    const currency = "coin";

    // Create pocket with zero balance
    await webPocketsUpdate(
      {
        uid: walletId,
        currency,
        balance: 0,
        latest: [],
      },
      actorId,
      walletId,
      currency
    );

    testIds.push({ collection: currency, docId: walletId });

    // Read
    const retrieved = await webPocketsGetById(walletId, currency);

    expect(retrieved).toBeDefined();
    expect(retrieved?.balance).toBe(0);
  }, 30000);

  it("should handle large balance values", async () => {
    const walletId = generateTestId("wallet_large");
    const currency = "coin";
    const largeBalance = 1000000; // 1 million

    // Create pocket with large balance
    await webPocketsUpdate(
      {
        uid: walletId,
        currency,
        balance: largeBalance,
        latest: [],
      },
      actorId,
      walletId,
      currency
    );

    testIds.push({ collection: currency, docId: walletId });

    // Read
    const retrieved = await webPocketsGetById(walletId, currency);

    expect(retrieved).toBeDefined();
    expect(retrieved?.balance).toBe(largeBalance);
  }, 30000);

  it("should update pocket multiple times", async () => {
    const walletId = generateTestId("wallet_updates");
    const currency = "coin";

    testIds.push({ collection: currency, docId: walletId });

    const balances = [100, 250, 500, 750, 1000];

    for (const balance of balances) {
      await webPocketsUpdate(
        {
          uid: walletId,
          currency,
          balance,
          latest: [],
        },
        actorId,
        walletId,
        currency
      );

      const retrieved = await webPocketsGetById(walletId, currency);
      expect(retrieved?.balance).toBe(balance);
    }

    // Final read
    const final = await webPocketsGetById(walletId, currency);
    expect(final?.balance).toBe(1000);
  }, 30000);
});
