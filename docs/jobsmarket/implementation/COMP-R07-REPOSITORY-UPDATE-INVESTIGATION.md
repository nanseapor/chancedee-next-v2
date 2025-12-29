# Repository Update Investigation Report

**Date:** 2025-12-22
**Investigation:** jobsRepository.update() Partial Update Issue
**Investigator:** Claude Code
**Status:** ✅ COMPLETE

---

## 1. Usage Analysis

### jobsRepository.update() Call Sites

| File | Line | Caller | Data Passed | Type Cast | Current Status |
|------|------|--------|-------------|-----------|----------------|
| [jobs.ts](src/lib/database/actions/jobs.ts#L62) | 62 | `webJobUpdate` | **FULL** `FirebaseJobData` | No | ✅ **WORKS** (used by job wizard) |
| [jobs.ts](src/lib/database/actions/jobs.ts#L94) | 94 | `webJobPublish` | **PARTIAL** (2 fields) | ❌ `as FirebaseJobData` | ❌ **FAILS** |
| [jobs.ts](src/lib/database/actions/jobs.ts#L118) | 118 | `webJobUnpublish` | **PARTIAL** (2 fields) | ❌ `as FirebaseJobData` | ❌ **FAILS** |
| [jobs.ts](src/lib/database/actions/jobs.ts#L142) | 142 | `webJobClose` | **PARTIAL** (2 fields) | ❌ `as FirebaseJobData` | ❌ **FAILS** |
| [jobs.ts](src/lib/database/actions/jobs.ts#L177) | 177 | `webJobSchedule` | **PARTIAL** (3 fields) | ❌ `as FirebaseJobData` | ❓ **UNTESTED** |

### Total Usages: 5

**Pattern Identified:**
- **1 action** (`webJobUpdate`) passes FULL object → ✅ **Works**
- **4 actions** pass PARTIAL objects with type cast → ❌ **Fail in tests**

---

## 2. Repository Implementation Analysis

### Method Signature

```typescript
// src/lib/database/repositories/interfaces/repository.interface.ts:67
update(id: string, model: T, actorId: string): Promise<string>;
//                  ^^^^^^
//                  Expects FULL model T (FirebaseJobData)
```

### repository-factory.ts Implementation

```typescript
// src/lib/database/repositories/repository-factory.ts:152-155
async update(id: string, model: T, actorId: string): Promise<string> {
  const firebaseModel = toFirebaseModel(model, actorId, true);
  //                                     ^^^^^
  //                                     Passes model to transform function
  return updateDocument(collectionName, id, firebaseModel, actorId);
}
```

### transformToFirebaseModel() Behavior

```typescript
// src/lib/database/repositories/jobs-repository.ts:86-99
function transformToFirebaseModel(
  appModel: FirebaseJobData,  // ← Expects FULL object
  actorId: string,
  isUpdate = false
): FirebaseJobType {
  const creatorRef = getFirebaseAdminFirestore()
    .collection("user_accounts")
    .doc(isUpdate && appModel.createdBy ? appModel.createdBy : actorId);
    //               ^^^^^^^^^^^^^^^^^^
    //               For updates: tries to use appModel.createdBy
    //               For partial updates: appModel.createdBy is UNDEFINED!

  const updatorRef = getFirebaseAdminFirestore()
    .collection("user_accounts")
    .doc(actorId);  // ← This is OK, always provided

  const companyRef = getFirebaseAdminFirestore()
    .collection("company_information")
    .doc(appModel.companyId);  // ← For partial updates: appModel.companyId is UNDEFINED!
    //   ^^^^^^^^^^^^^^^^^^^
    //   🔴 ERROR SOURCE: Firebase Admin SDK rejects .doc(undefined)

  return {
    uid: appModel.uid || "",           // ← undefined for partial
    company_id: appModel.companyId,    // ← undefined for partial
    company_ref: companyRef,           // ← CREATED FROM undefined!
    company_name: appModel.companyName,// ← undefined for partial
    // ... ALL OTHER FIELDS become undefined for partial updates
  };
}
```

### Error-Causing Code Path

**The Problem:**
```typescript
// When webJobPublish calls:
const updatedJob: Partial<FirebaseJobData> = {
  jobStatus: "published",
  isActive: true,
};

await jobsRepository.update(uid, updatedJob as FirebaseJobData, "system");
//                                ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//                                Type cast LIES to TypeScript!
//                                updatedJob.companyId is UNDEFINED

// Inside transformToFirebaseModel:
const companyRef = getFirebaseAdminFirestore()
  .collection("company_information")
  .doc(undefined);  // ← 💥 BOOM! Firebase Admin SDK error
```

**Firebase Admin SDK Error:**
```
Error: Value for argument "documentPath" is not a valid resource path.
Path must be a non-empty string.
```

---

## 3. Root Cause Determination

**Is this a bug?** ✅ **YES - Design Flaw**

**The actual problem is:**

The `transformToFirebaseModel` function **always creates DocumentRefs** for `createdBy`, `companyId`, etc., regardless of whether those fields exist in the input object. When a partial update is passed (with only `jobStatus` and `isActive`), the function tries to create DocumentRefs from `undefined` values, which Firebase Admin SDK rejects.

**The problem occurs because:**

1. **Interface Contract Mismatch**
   - `IRepository<T>.update()` signature says it expects `model: T` (FULL object)
   - BUT the implementation doesn't enforce this
   - Type casting (`as FirebaseJobData`) **hides the violation**

2. **Transform Function Assumes Full Object**
   - `transformToFirebaseModel()` assumes ALL fields exist
   - No null/undefined checks before creating DocumentRefs
   - No distinction between "update partial fields" vs "replace entire document"

3. **Type Safety Violation**
   ```typescript
   // ❌ WRONG - Lying to TypeScript
   const updatedJob: Partial<FirebaseJobData> = { ... };
   await jobsRepository.update(uid, updatedJob as FirebaseJobData, "system");
   //                                ^^^^^^^^^^^^^^^^^^^^^^^^
   //                                This cast hides the type error!

   // ✅ CORRECT - Would fail at compile time without cast
   await jobsRepository.update(uid, updatedJob, "system");
   //                                ^^^^^^^^^
   // Error: Argument of type 'Partial<FirebaseJobData>'
   //        is not assignable to parameter of type 'FirebaseJobData'
   ```

---

## 4. Comparison with Other Repositories

| Repository | Transform Function | Handles Partial? | Creates DocumentRefs? |
|------------|-------------------|------------------|----------------------|
| `jobs-repository` | `transformToFirebaseModel` | ❌ NO | ✅ YES (3 refs: creator, updator, company) |
| `company-information-repository` | `transformToFirebaseModel` | ❌ NO | ✅ YES (2 refs: creator, updator) |
| `job-applications-repository` | `transformToFirebaseModel` | ❌ NO | ✅ YES (6 refs!) |

**Pattern:** **ALL repositories have this issue!**

This is a **systemic design flaw** in the repository layer, not unique to jobs.

---

## 5. Impact Assessment

### Current Impact

| Code Path | Works? | Reason |
|-----------|--------|--------|
| **Job Wizard (COMP-R06)** | ✅ YES | `webJobUpdate` passes FULL object from form state |
| **webJobPublish** | ❌ NO | Partial update with type cast |
| **webJobUnpublish** | ❌ NO | Partial update with type cast |
| **webJobClose** | ❌ NO | Partial update with type cast |
| **webJobSchedule** | ❓ UNKNOWN | Partial update, untested |
| **Integration Tests** | ❌ NO | Exposes the bug |
| **COMP-R07 Implementation** | ✅ UNBLOCKED | New actions don't use partial updates |

### If NOT Fixed

| Affected Area | Impact | Severity |
|---------------|--------|----------|
| **COMP-R06 Job Wizard** | ✅ No impact | Working correctly with full objects |
| **COMP-R05 Jobs List** | ❓ Unknown | Status action buttons not yet implemented |
| **COMP-R07 Job Detail** | ✅ No impact | Will use fetch-then-update pattern OR new actions won't update |
| **Future Features** | ⚠️ High risk | Any code using partial updates will fail |
| **Integration Tests** | ❌ 5/19 failing | Test coverage reduced |

### Production Status

**Is this breaking production now?** ❌ **NO**

**Evidence:**
1. **Job wizard works** - Uses `webJobUpdate` with full objects
2. **Status actions not in UI yet** - `webJobPublish`, `webJobUnpublish`, `webJobClose` are only called from integration tests
3. **No UI implementation** - COMP-R05 jobs list doesn't have status action buttons yet
4. **Tests are new** - Integration tests written during COMP-R07 Phase 2, not pre-existing

**Conclusion:** This is a **latent bug** discovered by tests, not an active production issue.

---

## 6. Fix Options

### Option A: Fetch-Full-Update Pattern (QUICK FIX - 30 minutes)

**Approach:** Modify status actions to fetch full job, then update.

```typescript
// BEFORE (fails)
const webJobPublish = async (uid: string) => {
  const updatedJob: Partial<FirebaseJobData> = {
    jobStatus: "published",
    isActive: true,
  };
  await jobsRepository.update(uid, updatedJob as FirebaseJobData, "system");
};

// AFTER (works)
const webJobPublish = async (uid: string) => {
  const job = await webJobGetById(uid);
  if (!job) return { success: false, error: "Job not found" };

  const updatedJob: FirebaseJobData = {
    ...job,  // ✅ Preserve all fields
    jobStatus: "published",
    isActive: true,
  };
  await jobsRepository.update(uid, updatedJob, "system");
};
```

**Pros:**
- ✅ Quick fix (30min for 4 actions)
- ✅ No repository changes needed
- ✅ Works with current type system
- ✅ Makes tests pass immediately

**Cons:**
- ❌ Extra database read per update (2 operations instead of 1)
- ❌ Potential race condition (read-modify-write gap)
- ❌ Doesn't fix root cause

**Effort:** 30 minutes
**Risk:** LOW
**Scope:** 4 files in [src/lib/database/actions/jobs.ts](src/lib/database/actions/jobs.ts)

---

### Option B: Repository Partial Update Support (PROPER FIX - 4-6 hours)

**Approach:** Refactor repository layer to natively support partial updates.

#### B1. Update Interface

```typescript
// src/lib/database/repositories/interfaces/repository.interface.ts
export interface IRepository<T> {
  // ... existing methods ...

  /**
   * Update an existing document (full replacement)
   */
  update(id: string, model: T, actorId: string): Promise<string>;

  /**
   * Patch an existing document (partial update)
   */
  patch?(id: string, updates: Partial<T>, actorId: string): Promise<string>;
}
```

#### B2. Implement Firestore .update() instead of .set()

```typescript
// New helper in repository-factory.ts
async patch(id: string, updates: Partial<T>, actorId: string): Promise<string> {
  const db = getFirebaseAdminFirestore();
  const docRef = db.collection(collectionName).doc(id);

  // Only create Firebase fields for provided keys
  const firebaseUpdates: Record<string, unknown> = {
    updated_by: db.collection("user_accounts").doc(actorId),
    updated_at: Timestamp.now(),
  };

  // Map only the fields that exist in updates
  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      firebaseUpdates[toSnakeCase(key)] = value;
    }
  }

  await docRef.update(firebaseUpdates);  // ← Firestore .update(), not .set()
  return id;
}
```

#### B3. Update Actions

```typescript
const webJobPublish = async (uid: string) => {
  const updatedJob: Partial<FirebaseJobData> = {
    jobStatus: "published",
    isActive: true,
  };
  await jobsRepository.patch!(uid, updatedJob, "system");  // ← Use patch
};
```

**Pros:**
- ✅ Proper solution, fixes root cause
- ✅ Single database operation
- ✅ No race conditions
- ✅ Supports future partial updates
- ✅ Can be rolled out gradually (optional method)

**Cons:**
- ❌ Requires repository layer refactoring
- ❌ Need to implement for ALL repositories (future work)
- ❌ Higher implementation effort
- ❌ Need extensive testing

**Effort:** 4-6 hours (jobs repository only), 20-30 hours (all repositories)
**Risk:** MEDIUM
**Scope:**
- [repository-factory.ts](src/lib/database/repositories/repository-factory.ts)
- [repository.interface.ts](src/lib/database/repositories/interfaces/repository.interface.ts)
- [jobs.ts](src/lib/database/actions/jobs.ts)
- All integration tests

---

### Option C: Firestore Field-Level Update (COMPROMISE - 2 hours)

**Approach:** Use Firestore's native `.update()` directly in actions, bypass repository.

```typescript
const webJobPublish = async (uid: string) => {
  const db = getFirebaseAdminFirestore();
  const jobRef = db.collection("jobs").doc(uid);

  await jobRef.update({
    job_status: "published",
    is_active: true,
    updated_at: Timestamp.now(),
    updated_by: db.collection("user_accounts").doc("system"),
  });

  return { success: true };
};
```

**Pros:**
- ✅ Uses Firestore's native partial update
- ✅ Single database operation
- ✅ No repository changes
- ✅ Fast to implement

**Cons:**
- ❌ Bypasses repository layer (breaks abstraction)
- ❌ Duplicate transform logic (camelCase → snake_case)
- ❌ Hard to maintain (two update patterns)
- ❌ Inconsistent with codebase architecture

**Effort:** 2 hours
**Risk:** MEDIUM (architectural inconsistency)
**Scope:** 4 files in [src/lib/database/actions/jobs.ts](src/lib/database/actions/jobs.ts)

---

## 7. Recommendation

### **Recommended Fix: Option A (Fetch-Full-Update Pattern)**

**Rationale:**

1. **Minimal Risk** - No repository changes, works with current system
2. **Fastest Implementation** - 30 minutes vs 2-6 hours
3. **COMP-R07 is Unblocked** - New actions don't need this fix
4. **Production Unaffected** - Not a live bug, tests will pass
5. **Performance Impact is Negligible** - Status changes are infrequent user actions
6. **Future-Proof** - Option B can still be done later as a refactoring task

**Why not Option B now?**
- COMP-R07 Phase 2 goal is to implement `fetchJobAnalytics` and `fetchJobApplications`
- Repository refactoring is a **separate architectural improvement task**
- Phase 2 is already delayed by this investigation
- Perfect is the enemy of done - ship working code first

**Why not Option C?**
- Breaks architectural patterns
- Creates technical debt
- Not worth the 1.5 hour savings over Option A

---

### Implementation Plan for Option A

**Duration:** 30 minutes

**Files to Modify:** [src/lib/database/actions/jobs.ts](src/lib/database/actions/jobs.ts)

**Changes:**
```typescript
// Fix webJobPublish (lines 82-100)
const webJobPublish = async (uid: string) => {
  try {
    const job = await webJobGetById(uid);
    if (!job) return { success: false, error: "Job not found" };

    const updatedJob: FirebaseJobData = {
      ...job,
      jobStatus: "published",
      isActive: true,
    };

    await jobsRepository.update(uid, updatedJob, "system");
    return { success: true };
  } catch (e) {
    const error = e as Error;
    return { success: false, error: error.message };
  }
};

// Repeat for:
// - webJobUnpublish (lines 106-124)
// - webJobClose (lines 130-148)
// - webJobSchedule (lines 155-183)
```

**Test Verification:**
```bash
npx vitest run --config vitest.integration.config.ts \
  tests/integration/jobsmarket/company/job-detail/job-detail-actions.test.ts
```

**Expected Outcome:** 18/19 tests passing (1 schema mismatch test still fails, unrelated)

---

### Future Work: Option B (Post-COMP-R07)

**Create Technical Debt Ticket:**
- **Title:** Implement partial update support in repository layer
- **Priority:** P2 (nice-to-have improvement)
- **Effort:** 20-30 hours (all repositories)
- **Benefit:** Performance optimization, cleaner API
- **Dependencies:** None
- **Blocker For:** None

---

## 8. Conclusion

### Summary of Findings

1. **Root Cause Identified:** `transformToFirebaseModel()` creates DocumentRefs from undefined fields in partial updates, causing Firebase Admin SDK error

2. **Systemic Issue:** All repositories using `repository-factory.ts` have this design flaw

3. **Production Impact:** ❌ **NONE** - Latent bug discovered by new tests, not affecting live code

4. **Blocking Status:** ❌ **NOT BLOCKING** for COMP-R07 Phase 2

5. **Test Failures:** 5/19 tests failing, all due to this single root cause

### Clear Recommendation

✅ **Proceed with COMP-R07 Phase 2 implementation** (`fetchJobAnalytics`, `fetchJobApplications`)

✅ **Apply Option A quick fix in parallel** (30 minutes, low risk)

📋 **File Option B as future technical debt** (architectural improvement, P2 priority)

---

**Investigation Complete:** 2025-12-22 18:15 UTC+7
**Next Action:** Await PM/SA approval to proceed with Phase 2A + Option A fix
