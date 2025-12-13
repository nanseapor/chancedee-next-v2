/**
 * Minimal FCM Token Test - Isolate the exact failure point
 */

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { afterEach, describe, expect, it } from "vitest";

describe("FCM Token Minimal Test", () => {
  const testIds: string[] = [];
  const actorId = "dYIwEtINrJPDzhHUVDpTx1Fq6LG2"; // Real user ID

  afterEach(async () => {
    // Cleanup
    const db = getFirebaseAdminFirestore();
    for (const id of testIds) {
      await db.collection("fcm_tokens").doc(id).delete();
    }
    testIds.length = 0;
  });

  it('should query fcm_tokens collection without filter', async () => {
    // Get all documents (no filter)
    const allDocs = await getFirebaseAdminFirestore()
      .collection("fcm_tokens")
      .get();

    expect(allDocs, "Should get collection snapshot").toBeDefined();
    console.log('✅ Unfiltered query SUCCEEDED! Found:', allDocs.docs.length, 'documents');
  }, 30000);

  it('should query fcm_tokens by fcm_token field (THE REAL TEST)', async () => {
    const existingTokenValue = "eyNQDmNcBzU5LLJbcKH64A:APA91bFEdqXP7UR5U3yl03uOMxQqd-RjZqIJdrB5ImjCszq4Sj0hDaJEFnrcuXlmvRz5dwrCQip1WDl7sItL3sE13-0VStSyt5fXGvH0t1Ifdsc9R4JZRfE";

    // THIS IS THE ACTUAL FILTERED QUERY
    const filteredQuery = getFirebaseAdminFirestore()
      .collection("fcm_tokens")
      .where("fcm_token", "==", existingTokenValue);

    expect(filteredQuery, "Filtered query should be defined").toBeDefined();

    // Execute the filtered query
    const filteredResults = await filteredQuery.get();

    expect(filteredResults, "Query results should be defined").toBeDefined();
    expect(filteredResults.empty, "Should find at least one document").toBe(false);
    console.log('✅ FILTERED query by fcm_token SUCCEEDED! Found:', filteredResults.docs.length, 'documents');
  }, 30000);
});
