# Integration Tests for Database Actions

This directory contains integration tests that verify database actions work correctly with real Firebase connections.

## Overview

These tests verify the complete write-read cycle through the repository pattern:
1. **Create** data using action functions
2. **Read** data back from Firestore
3. **Update** data and verify changes
4. **Filter** data with queries
5. **Clean up** test data after each test

## Test Coverage

### Migrated Repository Actions
- ✅ **user-transfer** - User company transfer requests
- ✅ **user-info** - User roles and permissions (including array operations)
- ✅ **candidate-screening** - Candidate verification status
- ✅ **candidate-preference** - Job preferences and expectations
- ✅ **candidate-referral** - Referral tracking
- ✅ **company-requests** - Company registration requests
- ✅ **delete** - Account deletion requests
- ✅ **chats** - Chat room management
- ✅ **wallet-transactions** - Transaction history

## Prerequisites

### Firebase Admin SDK Configuration

Integration tests require Firebase Admin SDK credentials. Set these environment variables:

```bash
# Required environment variables
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**How to get credentials:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings > Service Accounts
4. Click "Generate New Private Key"
5. Download the JSON file
6. Extract the values to environment variables

**Important:** Never commit credentials to git. Add them to `.env.local` or use environment-specific configuration.

## Running Tests

### Run all integration tests
```bash
npm run test:integration
```

### Run in watch mode (for development)
```bash
npm run test:integration:watch
```

### Run specific test file
```bash
npm run test:integration -- user-transfer
```

**Note:** If you see "Firebase Admin SDK is not configured", check that the environment variables above are set correctly.

## Test Structure

```
tests/integration/
├── README.md                          # This file
├── database/
│   ├── test-utils.ts                  # Shared test utilities
│   └── actions/
│       ├── user-transfer.test.ts      # User transfer tests
│       ├── user-info.test.ts          # User info tests
│       ├── candidate-actions.test.ts  # Candidate-related tests
│       └── misc-actions.test.ts       # Other action tests
```

## Important Notes

### Firebase Connection
- Tests use **real Firebase Admin SDK** connection
- Requires proper Firebase credentials in environment
- Uses production/development Firestore (be careful!)

### Test Data Cleanup
- Each test generates unique IDs with timestamps
- Cleanup happens automatically in `afterEach` hooks
- Test IDs are prefixed with collection name (e.g., `user_transfer_test_...`)

### Test Isolation
- Tests run **sequentially** to avoid rate limits
- Each test is independent with its own test data
- Cleanup ensures no data leakage between tests

### Timeouts
- Default timeout: **30 seconds** (for network operations)
- Configurable in `vitest.integration.config.ts`

## Writing New Integration Tests

Example structure:

```typescript
import { describe, it, expect, afterEach } from "vitest";
import { webYourActionCreate, webYourActionGetById } from "@/lib/database/actions/your-action";
import { generateTestId, cleanupTestData, getTestActorId } from "../test-utils";

describe("your-action (integration)", () => {
  const testIds: string[] = [];
  const actorId = getTestActorId();

  afterEach(async () => {
    for (const id of testIds) {
      await cleanupTestData("your_collection", id);
    }
    testIds.length = 0;
  });

  it("should create and read data", async () => {
    const testId = generateTestId("your_prefix");
    testIds.push(testId);

    // Create
    await webYourActionCreate({ /* data */ }, actorId, testId);

    // Read
    const result = await webYourActionGetById(testId);

    // Assert
    expect(result).toBeDefined();
    expect(result?.someField).toBe("expected value");
  });
});
```

## Debugging Failed Tests

1. **Check Firebase credentials**
   ```bash
   echo $GOOGLE_APPLICATION_CREDENTIALS
   ```

2. **Enable verbose logging**
   ```bash
   DEBUG=* npm run test:integration
   ```

3. **Check for leftover test data**
   - Look for documents with `_test_` in their IDs
   - Clean up manually if needed

4. **Verify Firestore rules**
   - Integration tests use Admin SDK (bypasses rules)
   - But network issues may still occur

## Best Practices

1. **Always cleanup test data** - Use `afterEach` hooks
2. **Use unique IDs** - Use `generateTestId()` helper
3. **Test happy path first** - Then edge cases
4. **Keep tests independent** - Don't rely on other test data
5. **Use meaningful test names** - Describe what's being tested

## Troubleshooting

### Tests hanging
- Check Firebase connection
- Verify timeout settings
- Look for missing `await` keywords

### Cleanup errors
- Non-critical - test data might remain
- Can be cleaned up manually
- Consider using Firebase Emulator for safer testing

### Rate limiting
- Tests run sequentially to avoid this
- If still occurring, add delays between tests
- Consider using Firebase Emulator

## Future Improvements

- [ ] Use Firebase Emulator for safer testing
- [ ] Add performance benchmarks
- [ ] Test concurrent operations
- [ ] Add stress tests for repository pattern
- [ ] Test error scenarios (network failures, etc.)
