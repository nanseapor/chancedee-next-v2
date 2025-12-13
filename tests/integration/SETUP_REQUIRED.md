# Integration Tests - Setup Required

## ⚠️ Firebase Admin SDK Configuration Needed

The integration tests were created successfully but **require Firebase Admin SDK credentials to run**.

### Current Status

✅ **Created:**
- 4 test files with 21 comprehensive tests
- Test utilities and helpers
- Server-only package mock
- Integration test configuration
- Documentation

❌ **Missing:**
- Firebase Admin SDK environment variables

### Error You'll See Without Setup

```
Error: Firebase Admin SDK is not configured
```

## 🔧 How to Set Up

### Step 1: Get Firebase Service Account Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **chancedee-prd**
3. Go to **Project Settings** → **Service Accounts**
4. Click **"Generate New Private Key"**
5. Download the JSON file

### Step 2: Set Environment Variables

The JSON file contains these fields you need:

```json
{
  "project_id": "chancedee-prd",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@chancedee-prd.iam.gserviceaccount.com"
}
```

**Option A: Add to `.env.local` (recommended for development)**

Create or edit `.env.local` in the project root:

```bash
FIREBASE_ADMIN_PROJECT_ID=chancedee-prd
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@chancedee-prd.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**Option B: Export in your shell session**

```bash
export FIREBASE_ADMIN_PROJECT_ID=chancedee-prd
export FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@chancedee-prd.iam.gserviceaccount.com
export FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

⚠️ **Important:** Never commit `.env.local` or credentials to git!

### Step 3: Run Tests

```bash
# Run all integration tests
npm run test:integration

# Run in watch mode
npm run test:integration:watch

# Run specific test
npm run test:integration -- user-transfer
```

## 📊 What the Tests Cover

All 21 tests verify the migrated database actions work correctly:

### User Transfer (4 tests)
- Create and read user transfer records
- Update user transfer records
- Filter by target company
- Handle non-existent records

### User Info (5 tests)
- CRUD operations for user info
- Array union/remove operations for roles
- Filter by role

### Candidate Actions (6 tests)
- Candidate screening CRUD with filtering
- Candidate preferences CRUD
- Candidate referral CRUD

### Miscellaneous (6 tests)
- Company requests CRUD
- Delete requests with filtering
- Chat rooms CRUD
- Wallet transactions

## ⚠️ Data Safety

**These tests write to your REAL Firebase database!**

- Tests use unique IDs with timestamps to avoid collisions
- Automatic cleanup runs after each test
- Tests run sequentially to avoid rate limits
- Consider using Firebase Emulator for safer testing (see README)

## 🔍 Troubleshooting

### Tests hang or timeout
- Check Firebase connection
- Verify credentials are correct
- Ensure no missing `await` keywords

### "Firebase Admin SDK is not configured"
- Verify all 3 environment variables are set
- Check for typos in variable names
- Ensure private key includes `\n` newlines

### Rate limiting errors
- Tests already run sequentially
- Add delays if needed
- Consider Firebase Emulator

## 📚 More Information

See [tests/integration/README.md](./README.md) for:
- Detailed test structure
- Writing new tests
- Best practices
- Future improvements
