/**
 * Integration Test Setup
 * Validates Firebase Admin SDK configuration before running tests
 */

import { beforeAll } from "vitest";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// Load environment variables from .env.local
const envLocalPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
  console.log("📁 Loaded environment from .env.local");
} else {
  console.warn("⚠️  .env.local file not found at:", envLocalPath);
}

// Load test credentials from .env.playwright
const envPlaywrightPath = path.resolve(process.cwd(), ".env.playwright");
if (fs.existsSync(envPlaywrightPath)) {
  dotenv.config({ path: envPlaywrightPath });
  console.log("🎭 Loaded test credentials from .env.playwright");
} else {
  console.warn("⚠️  .env.playwright file not found - some tests may be skipped");
}

beforeAll(() => {
  const requiredEnvVars = [
    "FIREBASE_ADMIN_PROJECT_ID",
    "FIREBASE_ADMIN_CLIENT_EMAIL",
    "FIREBASE_ADMIN_PRIVATE_KEY",
  ];

  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error("\n❌ Firebase Admin SDK is not configured");
    console.error("\nMissing environment variables:");
    missingVars.forEach((varName) => {
      console.error(`  - ${varName}`);
    });
    console.error("\n📚 See tests/integration/README.md for setup instructions");
    console.error("\n💡 To get credentials:");
    console.error("   1. Go to Firebase Console > Project Settings > Service Accounts");
    console.error("   2. Click 'Generate New Private Key'");
    console.error("   3. Set environment variables from downloaded JSON\n");

    throw new Error(
      `Integration tests require Firebase Admin SDK credentials. Missing: ${missingVars.join(", ")}`
    );
  }

  console.log("✅ Firebase Admin SDK configured");
});
