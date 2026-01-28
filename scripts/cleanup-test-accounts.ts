#!/usr/bin/env npx ts-node
/**
 * Cleanup script for test accounts
 *
 * Run manually when:
 * - Test data grows too large (1M+ records)
 * - Schema changes require fresh test data
 * - Before major release testing
 *
 * Usage:
 *   npm run test:cleanup              # Delete all test accounts
 *   npm run test:cleanup -- --dry-run # Preview without deleting
 *   npm run test:cleanup -- --older-than=7  # Delete accounts older than 7 days
 *   npm run test:cleanup -- --suite=e2e     # Delete only e2e test accounts
 */

import { loadEnvConfig } from "@next/env";
import { initializeApp, cert, getApps, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";

// Load environment variables
const projectDir = process.cwd();
loadEnvConfig(projectDir);

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  dryRun: args.includes("--dry-run"),
  olderThan: parseInt(
    args.find((a) => a.startsWith("--older-than="))?.split("=")[1] || "0",
    10
  ),
  suite: args.find((a) => a.startsWith("--suite="))?.split("=")[1],
  limit: parseInt(
    args.find((a) => a.startsWith("--limit="))?.split("=")[1] || "0",
    10
  ),
};

// Initialize Firebase Admin
let auth: Auth;
let db: Firestore;

function initializeAdmin() {
  let app: App;

  if (getApps().length === 0) {
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
      /\\n/g,
      "\n"
    );
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;

    if (!privateKey || !projectId || !clientEmail) {
      throw new Error("Firebase Admin SDK credentials not configured");
    }

    app = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } else {
    const existingApp = getApps()[0];
    if (!existingApp) {
      throw new Error("Firebase Admin SDK not initialized");
    }
    app = existingApp;
  }

  auth = getAuth(app);
  db = getFirestore(app);
  db.settings({ ignoreUndefinedProperties: true });
}

interface CleanupStats {
  usersFound: number;
  usersDeleted: number;
  documentsDeleted: number;
  errors: string[];
}

async function main() {
  console.log("🧹 Test Account Cleanup Script");
  console.log("================================");
  console.log(`Options: ${JSON.stringify(options)}`);
  console.log("");

  initializeAdmin();

  const stats: CleanupStats = {
    usersFound: 0,
    usersDeleted: 0,
    documentsDeleted: 0,
    errors: [],
  };

  // 1. Find all test accounts
  console.log("🔍 Finding test accounts...");
  const testUsers: { uid: string; email?: string; createdAt?: number }[] = [];
  let nextPageToken: string | undefined;

  do {
    const listResult = await auth.listUsers(1000, nextPageToken);

    for (const user of listResult.users) {
      const claims = user.customClaims as Record<string, unknown> | undefined;

      if (claims?.isTestAccount) {
        // Apply filters
        if (options.suite && claims.testSuite !== options.suite) {
          continue;
        }

        if (options.olderThan > 0) {
          const createdAt = claims.createdAt as number | undefined;
          if (createdAt) {
            const ageInDays = (Date.now() - createdAt) / (1000 * 60 * 60 * 24);
            if (ageInDays < options.olderThan) {
              continue;
            }
          }
        }

        testUsers.push({
          uid: user.uid,
          email: user.email,
          createdAt: claims.createdAt as number | undefined,
        });

        // Apply limit if specified
        if (options.limit > 0 && testUsers.length >= options.limit) {
          break;
        }
      }
    }

    nextPageToken = listResult.pageToken;

    // Break if limit reached
    if (options.limit > 0 && testUsers.length >= options.limit) {
      break;
    }
  } while (nextPageToken);

  stats.usersFound = testUsers.length;
  console.log(`📋 Found ${testUsers.length} test accounts`);

  if (testUsers.length === 0) {
    console.log("✅ No test accounts to delete");
    return;
  }

  if (options.dryRun) {
    console.log("");
    console.log("🔍 DRY RUN - Would delete these accounts:");
    testUsers.slice(0, 20).forEach((u) => {
      console.log(`   - ${u.email || u.uid}`);
    });
    if (testUsers.length > 20) {
      console.log(`   ... and ${testUsers.length - 20} more`);
    }
    console.log("");
    console.log("Run without --dry-run to actually delete.");
    return;
  }

  // 2. Delete users and related data
  console.log("");
  console.log("🗑️  Deleting test accounts and related data...");

  for (const user of testUsers) {
    try {
      await deleteUserAndRelatedData(user.uid, stats);
      stats.usersDeleted++;

      if (stats.usersDeleted % 10 === 0) {
        console.log(`   Progress: ${stats.usersDeleted}/${testUsers.length}`);
      }
    } catch (error) {
      stats.errors.push(`Failed to delete ${user.uid}: ${error}`);
    }
  }

  // 3. Clean up orphaned test documents
  console.log("");
  console.log("🧹 Cleaning orphaned test documents...");
  await cleanupOrphanedTestDocuments(stats);

  // 4. Print summary
  console.log("");
  console.log("================================");
  console.log("📊 Cleanup Summary");
  console.log(`   Users found: ${stats.usersFound}`);
  console.log(`   Users deleted: ${stats.usersDeleted}`);
  console.log(`   Documents deleted: ${stats.documentsDeleted}`);
  console.log(`   Errors: ${stats.errors.length}`);

  if (stats.errors.length > 0) {
    console.log("");
    console.log("⚠️  Errors:");
    stats.errors.slice(0, 10).forEach((e) => console.log(`   - ${e}`));
    if (stats.errors.length > 10) {
      console.log(`   ... and ${stats.errors.length - 10} more errors`);
    }
  }

  console.log("");
  console.log("✅ Cleanup complete");
}

async function deleteUserAndRelatedData(uid: string, stats: CleanupStats) {
  // Find user_accounts document
  const userDoc = await db.collection("user_accounts").doc(uid).get();

  if (userDoc.exists) {
    const userData = userDoc.data();
    const userRef = userDoc.ref;

    // Delete candidate_information if exists
    const candidateDocs = await db
      .collection("candidate_information")
      .where("userId", "==", userRef)
      .limit(10)
      .get();

    for (const doc of candidateDocs.docs) {
      await deleteRelatedDocuments("candidateId", doc.ref, stats);
      await doc.ref.delete();
      stats.documentsDeleted++;
    }

    // Delete company_information if exists
    const companyDocs = await db
      .collection("company_information")
      .where("userId", "==", userRef)
      .limit(10)
      .get();

    for (const doc of companyDocs.docs) {
      await deleteRelatedDocuments("companyId", doc.ref, stats);
      await doc.ref.delete();
      stats.documentsDeleted++;
    }

    // Delete user_accounts document
    await userRef.delete();
    stats.documentsDeleted++;
  }

  // Delete Firebase Auth user
  await auth.deleteUser(uid);
}

async function deleteRelatedDocuments(
  fieldName: string,
  ref: FirebaseFirestore.DocumentReference,
  stats: CleanupStats
) {
  const collections = [
    "job_applications",
    "job_interviews",
    "chats",
    "messages",
    "wallet_transactions",
    "jobs",
  ];

  for (const collectionName of collections) {
    try {
      const docs = await db
        .collection(collectionName)
        .where(fieldName, "==", ref)
        .limit(500)
        .get();

      for (const doc of docs.docs) {
        await doc.ref.delete();
        stats.documentsDeleted++;
      }
    } catch (error) {
      // Some collections might not have this field, ignore
    }
  }
}

async function cleanupOrphanedTestDocuments(stats: CleanupStats) {
  const collections = [
    "jobs",
    "job_applications",
    "job_interviews",
    "chats",
    "messages",
    "candidate_information",
    "company_information",
  ];

  for (const collectionName of collections) {
    try {
      const docs = await db
        .collection(collectionName)
        .where("isTestAccount", "==", true)
        .limit(500)
        .get();

      if (docs.size > 0) {
        const batch = db.batch();
        let batchCount = 0;

        for (const doc of docs.docs) {
          batch.delete(doc.ref);
          batchCount++;

          // Firestore batch limit is 500
          if (batchCount >= 500) {
            await batch.commit();
            stats.documentsDeleted += batchCount;
            console.log(`   Deleted ${batchCount} orphaned docs from ${collectionName}`);
            break;
          }
        }

        if (batchCount > 0 && batchCount < 500) {
          await batch.commit();
          stats.documentsDeleted += batchCount;
          console.log(`   Deleted ${batchCount} orphaned docs from ${collectionName}`);
        }
      }
    } catch (error) {
      stats.errors.push(`Failed to clean ${collectionName}: ${error}`);
    }
  }
}

// Run
main().catch((error) => {
  console.error("❌ Cleanup failed:", error);
  process.exit(1);
});
