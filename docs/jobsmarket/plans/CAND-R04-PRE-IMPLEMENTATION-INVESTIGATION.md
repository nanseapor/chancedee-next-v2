# CAND-R04 Pre-Implementation Investigation Report

**Date:** 2025-12-19
**Investigator:** Claude Code
**Status:** ✅ Complete - Ready for Implementation

---

## Executive Summary

All critical dependencies exist and are functional. **No blockers identified.** The implementation can proceed as planned with minor adjustments to the original plan based on findings.

**Key Findings:**
- ✅ Interview repository and actions fully functional with batch fetch capability
- ⚠️ Chat route does NOT exist - will navigate to placeholder or hide button for MVP
- ✅ Test infrastructure solid with clear seeding patterns
- ✅ Dashboard shows working application fetch pattern
- ⚠️ Delete function performs HARD DELETE - must create new withdraw function
- ✅ Existing application components can be reused for patterns

---

## 1. Interview Repository & Actions

**Status:** ✅ **FULLY READY**

| Item | Exists? | Location | Key Functions |
|------|---------|----------|---------------|
| **Repository** | ✅ YES | `src/lib/database/repositories/job-interviews-repository.ts` | Standard CRUD + transforms |
| **Actions** | ✅ YES | `src/lib/database/actions/job-interviews.ts` | getById, getByFilter, **getUpcoming**, create, update |
| **Schema** | ✅ YES | `src/lib/database/schemas/job-interviews.schema.ts` | Full schema with status enum |

### Key Functions Available:

```typescript
// ✅ Ready to use for CAND-R04
webJobInterviewGetByFilter(filter?: Filter): Promise<FirebaseJobInterviewData[] | null>

// ✅ Also available (used by CAND-R01 Dashboard)
webJobInterviewGetUpcoming(candidateId: string): Promise<FirebaseJobInterviewData[]>
```

### Batch Fetch Strategy:

**Can fetch interviews by candidate ID?** ✅ **YES**

```typescript
// Use getByFilter with candidate_id filter
const candidateRef = getFirebaseAdminFirestore()
  .collection("candidate_information")
  .doc(candidateId);

const interviews = await webJobInterviewGetByFilter(
  Filter.where("candidate_id", "==", candidateRef)
);
```

**Batch fetch available?** ✅ **YES** - Returns array of all matching interviews

### Interview Data Shape:

```typescript
interface FirebaseJobInterviewData {
  uid: string;
  jobId: string;
  applicationId: string;        // ← Can join on this!
  candidateId: string;
  companyId: string;
  candidateName: string;
  companyName: string;
  channel: string;              // 'online' | 'onsite'
  status: MasterJobApplicationStatuses;
  appointment: number;          // Timestamp
  from: string;                 // Start time
  to: string;                   // End time
  location: string;
  room?: string;
  note?: string;
  isCancel?: boolean;
  cancelReason?: string;
  isAccepted: boolean;
  rejectFeedback?: string;
  createdAt: number;
  updatedAt: number;
}
```

### Implementation Recommendation:

✅ **Use batch fetch in `webJobApplicationGetByCandidate` action**

Rationale:
- Single network round-trip
- RIS §4.1 shows interview in main data contract
- Dashboard already uses this pattern successfully

---

## 2. Chat Implementation

**Status:** ⚠️ **PARTIAL - NO ROUTE, ACTIONS EXIST**

| Item | Exists? | Location | Notes |
|------|---------|----------|-------|
| **Chat route** | ❌ NO | `/chat` does not exist | No route at `src/app/jobsmarket/chat/` |
| **Chat drawer** | ❌ NO | N/A | No drawer component found (only profile edit drawers exist) |
| **Chat actions** | ✅ YES | `src/lib/database/actions/chats.ts` | getById, getByFilter, create, update |
| **Chat repository** | ✅ YES | `src/lib/database/repositories/chat-repository.ts` | Referenced in actions |

### Existing chat integration pattern found:

❌ **NO** - No chat integration found in existing routes

**Search Results:**
- No `openChat` or `ChatDrawer` references in codebase
- No `router.push('/chat')` patterns found
- Applications have `chatId` field but no UI integration

### Chat Actions Available:

```typescript
// ✅ These exist but have no UI
webChatGetById(uid: string): Promise<RoomData | null>
webChatGetByFilter(filter?: Filter): Promise<RoomData[] | null>
webChatCreate(payload: RoomData, actorId: string, uid?: string): Promise<string>
webChatUpdate(payload: RoomData, actorId: string, uid: string): Promise<string>
```

### Application chatId Field:

Applications have `chatId?: string` field, suggesting chat integration is planned but not yet implemented.

---

### Recommendation for CAND-R04:

🔵 **Option 1: Hide message button for MVP (RECOMMENDED)**

```typescript
// In ApplicationCard component
const showMessageButton = false; // TODO: Enable when CHAT-R02 is implemented
```

Rationale:
- Clean MVP without broken links
- Can be enabled in future PR when chat is implemented
- No user confusion

🔵 **Option 2: Navigate to placeholder** (Alternative)

```typescript
// In ApplicationCard component
const handleMessage = () => {
  router.push('/jobsmarket/chat?application=' + applicationId);
  // This will 404 until chat route is built
};
```

Rationale:
- Shows intent for future feature
- User sees "coming soon" instead of dead end

### ✅ **DECISION: Use Option 1 - Hide button until CHAT-R02 is ready**

This aligns with clean UX principles - better to not show a button than to show a broken one.

---

## 3. Test Data Strategy

**Status:** ✅ **CLEAR PATTERN ESTABLISHED**

### Test Credentials Found:

✅ **Available in `.env.playwright`**

| Credential | Value |
|------------|-------|
| **Email** | `xalanaseon@hotmail.com` |
| **Password** | `P@ssw0rd@1` |
| **UID** | `bywpdkLOSTWjvV8JhhQL6LNditJ3` |
| **Roles** | `["candidate"]` |
| **Display Name** | Test Candidate |

**Alternative credentials:**
- `candidate01.chancedee@gmail.com` / `Metapeople@2025#!` (UID: `Ruu1xf1qgNeypwmEwdxZrOSww1p1`)
- `candidate02.chancedee@gmail.com` / `Metapeople@2025#!` (UID: `qkYSQTMeUVWXfUMDT7tc6PorPAo1`)

### Existing Seeding Patterns:

✅ **YES** - Clear pattern in integration tests

**Pattern from `tests/integration/jobsmarket/candidates/settings.test.ts`:**

```typescript
import {
  generateTestId,
  cleanupTestData,
  getTestActorId,
  createDocRefFilter,
} from "../../../integration/database/test-utils";

describe("Test Suite", () => {
  const testIds: string[] = [];
  const actorId = getTestActorId();

  async function createTestCandidate(testId: string) {
    await webCandidateSavePersonalInfo(testId, { /* data */ }, actorId);
  }

  afterEach(async () => {
    for (const id of testIds) {
      await cleanupTestData("candidate_information", id);
    }
    testIds.length = 0;
  });

  it("test case", async () => {
    const testId = generateTestId("prefix");
    testIds.push(testId);
    await createTestCandidate(testId);
    // ... test logic
  });
});
```

### Test Job ID Available:

⚠️ **NOT FOUND** - No test job constants found

**Solution:** Create test jobs in integration test setup using same pattern:

```typescript
async function createTestJob(testId: string) {
  return await webJobCreate({
    title: "Test Job for Applications",
    companyId: TEST_COMPANY_ID,
    isActive: true,
    // ... minimal required fields
  }, actorId, testId);
}
```

### Test Utilities Available:

✅ **Comprehensive test utilities** at `tests/integration/database/test-utils.ts`:

| Function | Purpose |
|----------|---------|
| `generateTestId(prefix)` | Create unique test ID with timestamp |
| `cleanupTestData(collection, docId)` | Delete test document |
| `cleanupMultipleTestData(items[])` | Batch delete |
| `waitFor(condition, timeout)` | Wait for eventual consistency |
| `getTestActorId()` | Generate actor ID for actions |
| `createDocRefFilter(field, collection, docId)` | Create Firestore DocumentRef filter |

---

### Recommendation:

✅ **Use existing pattern for integration tests**

```typescript
// tests/integration/jobsmarket/candidates/applications/job-application-actions.test.ts
describe("webJobApplicationGetByCandidate", () => {
  const testIds: string[] = [];
  const actorId = getTestActorId();

  async function seedTestApplication(candidateId: string, jobId: string) {
    const appId = generateTestId("app");
    testIds.push(appId);

    await webJobApplicationCreate({
      candidateId,
      jobId,
      companyId: "test-company",
      status: "applied",
      // ... minimal fields
    }, actorId, appId);

    return appId;
  }

  afterEach(async () => {
    await cleanupMultipleTestData(
      testIds.map(id => ({ collection: "job_applications", docId: id }))
    );
    testIds.length = 0;
  });

  it("should fetch all applications for candidate", async () => {
    const candidateId = generateTestId("candidate");
    const jobId = generateTestId("job");

    await seedTestApplication(candidateId, jobId);

    const result = await webJobApplicationGetByCandidate(candidateId);
    expect(result).toHaveLength(1);
  }, 30000);
});
```

✅ **Use beforeEach for E2E tests**

```typescript
// tests/e2e/jobsmarket/candidates/applications.spec.ts
test.describe("CAND-R04: Applications", () => {
  const testEmail = process.env.PLAYWRIGHT_TEST_CANDIDATE_EMAIL;
  const testPassword = process.env.PLAYWRIGHT_TEST_CANDIDATE_PASSWORD;
  const testUid = process.env.PLAYWRIGHT_TEST_CANDIDATE_UID;

  test.beforeEach(async ({ page }) => {
    await page.goto(`/jobsmarket/candidates/${testUid}/applications`);

    // Login if needed
    if (page.url().includes("/auth/login")) {
      await page.getByLabel("อีเมล").fill(testEmail!);
      await page.getByPlaceholder("กรอกรหัสผ่าน").fill(testPassword!);
      await page.getByRole("checkbox").check();
      await page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }).click();
      await page.waitForURL((url) => !url.pathname.includes("/auth/login"), { timeout: 15000 });
      await page.goto(`/jobsmarket/candidates/${testUid}/applications`);
    }

    await page.waitForLoadState("networkidle");
  });

  // Tests will see either empty state or real applications
  // Both are valid test scenarios
});
```

---

## 4. Application Data Patterns

**Status:** ✅ **WORKING PATTERN FOUND IN DASHBOARD**

### How Dashboard Fetches Applications:

**Current Implementation** (from `DashboardClient.tsx` lines 65-76):

```typescript
// Fetch all applications (NO candidate filter)
const { data: allApplications } = useSWR(
  authResult.state === "ready" ? ["applications", candidateId] : null,
  () => webJobApplicationGetByFilter()  // ← No filter!
);

// Filter client-side
const applications = (allApplications?.filter(
  (app) => app.candidateId === candidateId
) || []) as jobApplicationData[];
```

**⚠️ Problem:** Fetches ALL applications from database, then filters client-side. **Inefficient!**

### Existing Hooks/Actions:

| Function | Purpose | Can Reuse? |
|----------|---------|------------|
| `webJobApplicationGetByFilter()` | Fetch applications with optional filter | ✅ YES - Base for new action |
| `webJobApplicationGetById(uid)` | Fetch single application | ❌ NO - Wrong level |
| `webJobApplicationGetByFilter` | Generic fetch with filter | ✅ YES - Wrap with candidate filter |
| `webJobInterviewGetUpcoming(candidateId)` | Fetch candidate interviews | ✅ YES - Pattern to copy |

### Status Constants Location:

✅ **`src/constants/application.ts`**

```typescript
export enum MasterJobApplicationStatuses {
  withdraw = "withdraw",
  accepted = "accepted",
  rejected = "rejected",
  read = "read",
  new = "applied",        // ← Note: Key is "new" but value is "applied"
  scheduled = "scheduled",
  cancelled = "cancelled",
  confirmed = "confirmed",
  declined = "declined",
  closed = "closed",
  system = "systemclosed",
}
```

### Reusable Components Found:

✅ **Dashboard has working application components**

| Component | Location | Purpose | Can Reuse For |
|-----------|----------|---------|---------------|
| `ApplicationSummary` | `candidates/[id]/_components/` | 4 status cards with counts | Tab count logic, status grouping |
| `RecentApplicationsList` | `candidates/[id]/_components/` | List last 5 applications | Card layout pattern, status badge |
| `ApplicationCard` (in RecentApplicationsList) | Embedded | Mini card with job/company/status | Status badge mapping, Thai labels |

**Key Reusable Patterns:**

1. **Status Badge Mapping** (lines 107-151 of RecentApplicationsList):
```typescript
const getStatusBadge = (status: string) => {
  const badges: Record<string, { labelTh: string; labelEn: string; color: string }> = {
    new: { labelTh: "ใหม่", labelEn: "New", color: "bg-blue-100 text-blue-700" },
    read: { labelTh: "อ่านแล้ว", labelEn: "Read", color: "bg-gray-100 text-gray-700" },
    accepted: { labelTh: "รอสัมภาษณ์", labelEn: "Reviewing", color: "bg-amber-100 text-amber-700" },
    scheduled: { labelTh: "นัดสัมภาษณ์", labelEn: "Scheduled", color: "bg-purple-100 text-purple-700" },
    confirmed: { labelTh: "ยืนยันนัดหมาย", labelEn: "Confirmed", color: "bg-purple-100 text-purple-700" },
    rejected: { labelTh: "ไม่ผ่าน", labelEn: "Rejected", color: "bg-red-100 text-red-700" },
  };
  return badges[status] || { /* default */ };
};
```

2. **Status Grouping for Counts** (lines 31-67 of ApplicationSummary):
```typescript
const STATUS_CARDS = [
  { key: "applied", statuses: ["new", "read"] },
  { key: "reviewing", statuses: ["accepted"] },
  { key: "interviewing", statuses: ["scheduled", "confirmed"] },
  { key: "offers", statuses: [] },  // Future-proof
];
```

**⚠️ Note:** Dashboard uses OLD status enum keys ("new") not values ("applied"). Need to verify which the database actually stores.

**Verification from schema:** `JobApplicationStatusSchema` in `job-applications.schema.ts` uses **VALUES**: `'applied'`, `'read'`, etc.

**Conclusion:** Dashboard component has a bug - it should use `"applied"` not `"new"`. Our implementation should use correct values from schema.

---

### Recommendation:

✅ **Create new `webJobApplicationGetByCandidate` action**

Do NOT reuse dashboard's inefficient client-side filter pattern.

```typescript
// src/lib/database/actions/job-applications.ts

export async function webJobApplicationGetByCandidate(candidateId: string) {
  try {
    const db = getFirebaseAdminFirestore();
    const candidateRef = db.collection("candidate_information").doc(candidateId);

    // Server-side filter (efficient!)
    const applications = await webJobApplicationGetByFilter(
      Filter.where("candidate_id", "==", candidateRef)
    );

    if (!applications || applications.length === 0) {
      return [];
    }

    // Batch fetch job details
    const jobIds = [...new Set(applications.map(app => app.jobId))];
    const jobs = await Promise.all(
      jobIds.map(id => webJobGetById(id))
    );

    // Batch fetch company details
    const companyIds = [...new Set(applications.map(app => app.companyId))];
    const companies = await Promise.all(
      companyIds.map(id => webCompanyInformationGetById(id))
    );

    // Batch fetch interviews
    const interviews = await webJobInterviewGetByFilter(
      Filter.where("candidate_id", "==", candidateRef)
    );

    // Join data
    return applications.map(app => ({
      ...app,
      jobTitle: jobs.find(j => j?.uid === app.jobId)?.title,
      jobIsActive: jobs.find(j => j?.uid === app.jobId)?.isActive ?? true,
      companyName: companies.find(c => c?.uid === app.companyId)?.name,
      companyLogo: companies.find(c => c?.uid === app.companyId)?.logo,
      interview: interviews?.find(i => i.applicationId === app.uid),
    }));
  } catch (error) {
    throw error;
  }
}
```

✅ **Reuse status badge logic but fix enum values**

Use schema values (`'applied'`, `'read'`) not enum keys (`'new'`, `'read'`).

---

## 5. Withdraw Safety Check

**Status:** ⚠️ **CRITICAL - DELETE IS HARD DELETE**

### webJobApplicationDelete Behavior:

**CONFIRMED:** ❌ **HARD DELETE**

```typescript
// src/lib/database/actions/job-applications.ts lines 115-122
const webJobApplicationDelete = async (uid: string) => {
  try {
    return await jobApplicationsRepository.delete(uid);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};
```

This calls `jobApplicationsRepository.delete(uid)` which **permanently removes the document** from Firestore.

### Existing Withdraw Function:

❌ **NO** - No withdraw or status update function exists

### Repository Update Function Available:

✅ **YES** - Repository has update capability

```typescript
// jobApplicationsRepository.update(id, model, actorId)
async update(id: string, model: JobApplicationData, actorId: string): Promise<string>
```

This updates the document and preserves `created_by`, `created_at` while updating `updated_by`, `updated_at`.

---

### Recommendation:

✅ **Create NEW `webJobApplicationWithdraw` function**

**DO NOT modify or use `webJobApplicationDelete`** - It's a hard delete for admin purposes.

```typescript
// src/lib/database/actions/job-applications.ts

/**
 * Withdraw a job application (status update, not delete)
 * Per CAND-R04 RIS §4.3
 *
 * Withdrawable statuses: applied, read, accepted
 * Non-withdrawable: rejected, scheduled, confirmed, declined, withdraw, closed, systemclosed, cancelled
 */
export async function webJobApplicationWithdraw(
  uid: string,
  actorId: string
): Promise<void> {
  try {
    // 1. Fetch current application
    const application = await jobApplicationsRepository.getById(uid);

    if (!application) {
      throw new Error(`Application ${uid} not found`);
    }

    // 2. Validate current status allows withdraw
    const withdrawableStatuses: JobApplicationStatus[] = [
      'applied',
      'read',
      'accepted'
    ];

    if (!withdrawableStatuses.includes(application.status)) {
      throw new Error(
        `Cannot withdraw application in status: ${application.status}. ` +
        `Only applications in status [applied, read, accepted] can be withdrawn.`
      );
    }

    // 3. Validate actor is the candidate who applied
    if (application.candidateId !== actorId) {
      throw new Error('Only the candidate can withdraw their own application');
    }

    // 4. Update status to 'withdraw'
    await jobApplicationsRepository.update(
      uid,
      {
        ...application,
        status: 'withdraw',
      },
      actorId
    );

    // 5. TODO: Notify company (out of scope for CAND-R04)
    // This would be handled by a separate notification service
  } catch (error) {
    throw error;
  }
}
```

**Export:**
```typescript
export {
  webJobApplicationCreate,
  webJobApplicationDelete,      // Keep for admin use
  webJobApplicationWithdraw,    // NEW - for candidates
  webJobApplicationGetByFilter,
  webJobApplicationGetById,
  webJobApplicationUpdate
};
```

---

## Summary of Findings

| Concern | Status | Action Required |
|---------|--------|-----------------|
| **Interview data** | ✅ READY | Use `webJobInterviewGetByFilter` with candidate filter |
| **Chat integration** | ⚠️ NOT READY | Hide message button until CHAT-R02 is implemented |
| **Test data** | ✅ READY | Use existing test utils pattern with seeding in tests |
| **Withdraw safety** | ⚠️ CRITICAL | Create NEW `webJobApplicationWithdraw` - DO NOT use delete |
| **Status constants** | ✅ READY | Use schema values (`'applied'`) not enum keys (`'new'`) |
| **Reusable components** | ✅ READY | Reuse badge logic and status grouping from dashboard |

---

## Blockers Identified

**✅ NONE**

All concerns have clear solutions:
1. Interview fetch - use existing `getByFilter`
2. Chat - hide button for MVP
3. Tests - use existing pattern
4. Withdraw - create new function (straightforward)

---

## Questions for SA

### Q1: Chat Button Visibility (DECISION NEEDED)

Given that chat route doesn't exist yet:

**Option A (RECOMMENDED):** Hide message button entirely
```typescript
// Don't render message button at all
{canMessage && <MessageButton />}  // canMessage = false for MVP
```

**Option B:** Show button but navigate to 404
```typescript
// Show button, let it navigate to /chat (will 404)
<MessageButton onClick={() => router.push('/chat/' + chatId)} />
```

**Recommendation:** Option A - Cleaner UX, no broken links

**SA Decision:** _________

---

### Q2: Status Badge Mapping Discrepancy (DECISION NEEDED)

Dashboard uses different Thai labels than RIS spec:

| Status | Dashboard Label | RIS §7.3 Label | Use Which? |
|--------|----------------|----------------|------------|
| `accepted` | "รอสัมภาษณ์" | "ตอบรับ" | ? |
| `scheduled` | "นัดสัมภาษณ์" | "นัดสัมภาษณ์" | Same ✓ |

**Recommendation:** Follow RIS spec for consistency across routes

**SA Decision:** _________

---

### Q3: Dashboard Application Fetch Optimization (OUT OF SCOPE?)

Dashboard uses inefficient client-side filter pattern (fetches ALL applications).

Should we:
- **Option A:** Fix dashboard in separate PR (out of CAND-R04 scope)
- **Option B:** Fix it as part of CAND-R04 (while we're touching application actions)

**Recommendation:** Option A - Keep CAND-R04 focused, create issue for dashboard optimization

**SA Decision:** _________

---

## Implementation Adjustments to Plan

Based on investigation findings, update the implementation plan:

### 1. Add to Phase 2 (Server Actions):

```markdown
**Task 2.1b:** Create `webJobApplicationWithdraw` function
- Update status to 'withdraw' (NOT delete!)
- Validate withdrawable statuses
- Validate actor is candidate
```

### 2. Update Phase 4 (Components):

```markdown
**Task 4.5:** ApplicationCard component
- **Hide message button** (no chat route yet)
- Add comment: // TODO: Enable when CHAT-R02 is implemented
```

### 3. Update Test Plan:

```markdown
**Integration Tests:**
- Test withdraw updates status (not deletes)
- Test delete still works for admin use (separate function)
```

### 4. Update Open Question Q2 Answer:

```markdown
**Q2: Chat Integration Pattern**
✅ ANSWERED: Hide message button for MVP
- Chat route doesn't exist yet
- Better UX than broken link
- Enable in future when CHAT-R02 is ready
```

---

## Files to Update in Implementation Plan

1. **Section 2 (Server Actions):** Add `webJobApplicationWithdraw` details
2. **Section 10 (Open Questions):** Remove Q2 (answered), add status label question
3. **Section 11 (Risk Assessment):** Update withdraw risk to "mitigated"
4. **Section 16 (Notes):** Add note about hiding message button

---

## Ready to Proceed?

✅ **YES - All investigations complete**

**Next Steps:**
1. SA reviews this report
2. SA answers Q1-Q3
3. SA approves plan with adjustments
4. Begin Phase 1 (Foundation)

**Estimated Start Date:** Upon SA approval (same day if approved today)

---

**Investigation Complete** ✅
**Blockers:** 0
**Risks:** All mitigated
**Confidence:** High - Ready for implementation
