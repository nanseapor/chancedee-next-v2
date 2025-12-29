# Data Flow Investigation Report

**Date:** 2025-12-22 18:30 UTC+7
**Investigation:** Actual Implementation vs Assumptions
**Status:** ✅ COMPLETE - CRITICAL FINDINGS

---

## Executive Summary

**🚨 MAJOR DISCOVERY:** Our previous investigation report contained **INCORRECT ASSUMPTIONS**.

The actual problem is **NOT** what we thought. The real issue is:

1. ✅ **CORRECT:** `updateDocument()` uses Firestore `.update()` which supports partial updates
2. ❌ **WRONG ASSUMPTION:** We thought actions don't fetch the job
3. **ACTUAL PROBLEM:** Actions fetch the job but **DON'T USE IT** - they still pass partial objects to repository.update()
4. **ROOT CAUSE:** `transformToFirebaseModel()` runs BEFORE `.update()` and tries to create DocumentRefs from undefined fields

---

## 1. Repository Update Implementation

### updateDocument() Method

**Location:** [src/lib/database/utils/firebase-utils.ts:171-221](src/lib/database/utils/firebase-utils.ts#L171-L221)

**Firestore operation used:** ✅ **Firestore `.update()` method** (line 216)

```typescript
// Line 216
await docRef.update(dataToWrite);
```

**Comment in code (line 213-215):**
```typescript
// Use update() instead of set(merge: true)
// update() only modifies specified fields, preserving created_by/created_at
// Note: This will throw an error if document doesn't exist (expected behavior for updates)
```

**Performance optimization comment (lines 194-197):**
```typescript
// PERFORMANCE OPTIMIZATION: Removed docRef.get() call
// Previous implementation: Read document first to preserve created_by/created_at
// New implementation: Use update() which preserves existing fields automatically
// Savings: ~200-300ms per update + 1 Firestore read operation
```

### Data Transformation Flow

```typescript
// repository-factory.ts:152-155
async update(id: string, model: T, actorId: string): Promise<string> {
  const firebaseModel = toFirebaseModel(model, actorId, true);
  //                                     ^^^^^
  //                                     🔴 PROBLEM HAPPENS HERE!
  return updateDocument(collectionName, id, firebaseModel, actorId);
}
```

**The Issue:**
1. `toFirebaseModel()` (which is `transformToFirebaseModel` for jobs) gets called FIRST
2. It tries to create DocumentRefs from `model.companyId`, `model.createdBy`, etc.
3. If these fields are `undefined` (because model is partial), `.doc(undefined)` throws error
4. The error happens BEFORE `updateDocument()` is even called
5. Therefore, Firestore's `.update()` never gets a chance to accept the partial object

---

## 2. Status Actions Implementation

### webJobPublish - ACTUAL CODE

**Location:** [src/lib/database/actions/jobs.ts:82-100](src/lib/database/actions/jobs.ts#L82-L100)

```typescript
const webJobPublish = async (uid: string) => {
  try {
    const job = await webJobGetById(uid);  // ← LINE 84: FETCHES JOB
    if (!job) {
      return { success: false, error: "Job not found" };
    }

    const updatedJob: Partial<FirebaseJobData> = {  // ← LINES 89-92: CREATES PARTIAL
      jobStatus: "published",
      isActive: true,
    };

    await jobsRepository.update(uid, updatedJob as FirebaseJobData, "system");
    //                                ^^^^^^^^^  ← LINE 94: PASSES PARTIAL (NOT job!)
    //                                Type cast HIDES the problem
    return { success: true };
  } catch (e) {
    const error = e as Error;
    return { success: false, error: error.message };
  }
};
```

**🔴 THE SMOKING GUN:**
- Line 84: `job` is fetched and contains ALL fields
- Lines 89-92: `updatedJob` is created with ONLY 2 fields
- **Line 84's `job` variable is NEVER USED AGAIN!**
- Line 94: `updatedJob` (the partial) is passed to repository.update(), not `job`

### web Job Unpublish - ACTUAL CODE

**Location:** [src/lib/database/actions/jobs.ts:106-124](src/lib/database/actions/jobs.ts#L106-L124)

```typescript
const webJobUnpublish = async (uid: string) => {
  try {
    const job = await webJobGetById(uid);  // ← FETCHES JOB (unused!)
    if (!job) {
      return { success: false, error: "Job not found" };
    }

    const updatedJob: Partial<FirebaseJobData> = {  // ← PARTIAL
      jobStatus: "unpublished",
      isActive: false,
    };

    await jobsRepository.update(uid, updatedJob as FirebaseJobData, "system");
    //                                ^^^^^^^^^  ← PASSES PARTIAL
    return { success: true };
  } catch (e) {
    const error = e as Error;
    return { success: false, error: error.message };
  }
};
```

**Same pattern:** Fetch job, ignore it, pass partial.

### webJobClose - ACTUAL CODE

**Location:** [src/lib/database/actions/jobs.ts:130-148](src/lib/database/actions/jobs.ts#L130-L148)

```typescript
const webJobClose = async (uid: string) => {
  try {
    const job = await webJobGetById(uid);  // ← FETCHES JOB (unused!)
    if (!job) {
      return { success: false, error: "Job not found" };
    }

    const updatedJob: Partial<FirebaseJobData> = {  // ← PARTIAL
      jobStatus: "closed",
      isActive: false,
    };

    await jobsRepository.update(uid, updatedJob as FirebaseJobData, "system");
    //                                ^^^^^^^^^  ← PASSES PARTIAL
    return { success: true };
  } catch (e) {
    const error = e as Error;
    return { success: false, error: error.message };
  }
};
```

**Same pattern:** Fetch job, ignore it, pass partial.

---

## 3. Status Action Call Sites

### Where Are They Called From?

```bash
grep -rn "webJobPublish\|webJobUnpublish\|webJobClose" src/
```

**Results:**

| Action | Call Site | Status |
|--------|-----------|--------|
| `webJobPublish` | [src/hooks/jobsmarket/company/use-job-actions.ts:29](src/hooks/jobsmarket/company/use-job-actions.ts#L29) | ⚠️ Hook exists but not yet used in UI |
| `webJobPublish` | [src/hooks/jobsmarket/jobs/use-job-publish.ts:28](src/hooks/jobsmarket/jobs/use-job-publish.ts#L28) | ⚠️ Hook exists but not yet used in UI |
| `webJobUnpublish` | [src/hooks/jobsmarket/company/use-job-actions.ts:36](src/hooks/jobsmarket/company/use-job-actions.ts#L36) | ⚠️ Hook exists but not yet used in UI |
| `webJobClose` | [src/hooks/jobsmarket/company/use-job-actions.ts:43](src/hooks/jobsmarket/company/use-job-actions.ts#L43) | ⚠️ Hook exists but not yet used in UI |

**Critical Finding:**
- ❌ **NO UI COMPONENTS** currently call these actions
- ✅ Hooks exist ([use-job-actions.ts](src/hooks/jobsmarket/company/use-job-actions.ts), [use-job-publish.ts](src/hooks/jobsmarket/jobs/use-job-publish.ts))
- ❌ **NO PAGES/COMPONENTS** import or use these hooks yet
- 🧪 **ONLY TESTS** call these actions directly

**Conclusion:** This explains why the bug wasn't discovered until integration tests were written!

---

## 4. Why Does Job Wizard Work?

### COMP-R06 Job Wizard Pattern

**Search results:**
```bash
find src/app/jobsmarket/companies/[id]/dashboard/jobs/new -name "*.tsx"
```

**Result:** No files found (path doesn't exist in that exact format)

Let me check the actual wizard location:

```bash
ls -la src/app/jobsmarket/companies/
```

**Finding:** COMP-R06 wizard uses `webJobUpdate` (line 56-66 in jobs.ts), not the status actions.

### webJobUpdate Implementation

**Location:** [src/lib/database/actions/jobs.ts:56-66](src/lib/database/actions/jobs.ts#L56-L66)

```typescript
const webJobUpdate = async (
  payload: FirebaseJobData,  // ← FULL OBJECT (not Partial!)
  actorId: string,
  uid: string
) => {
  try {
    return await jobsRepository.update(uid, payload, actorId);
    //                                      ^^^^^^^
    //                                      Full FirebaseJobData object
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};
```

**Key Difference:**
- **webJobUpdate signature:** `payload: FirebaseJobData` (FULL object required)
- **Status actions:** Create `Partial<FirebaseJobData>` then cast to full

**Why it works:**
1. Job wizard form has ALL fields from the multi-step form
2. Passes complete `FirebaseJobData` object to `webJobUpdate`
3. `transformToFirebaseModel()` receives object with all fields populated
4. `.doc(appModel.companyId)` works because `companyId` exists

---

## 5. The Real Problem

### What We Thought

❌ **WRONG:** "Repository update() doesn't support partial updates"

### What's Actually Happening

✅ **CORRECT:**

1. **Firestore `.update()` DOES support partials** (line 216 of firebase-utils.ts)
2. **Actions fetch the job** (lines 84, 108, 132) - this was added at some point
3. **Actions don't use the fetched job** - they create a new partial object
4. **transformToFirebaseModel() runs before updateDocument()**
5. **transformToFirebaseModel() creates DocumentRefs from undefined fields**
6. **Firebase Admin SDK rejects `.doc(undefined)`**
7. **Error occurs BEFORE Firestore `.update()` is called**

### The Code Flow

```
webJobPublish("job123")
  ↓
Line 84: job = await webJobGetById("job123")  // ✅ Full object retrieved
  ↓
Lines 89-92: updatedJob = { jobStatus: "published", isActive: true }  // ❌ Partial created
  ↓
Line 94: jobsRepository.update("job123", updatedJob, "system")
  ↓
repository-factory.ts:153: firebaseModel = toFirebaseModel(updatedJob, "system", true)
  ↓
jobs-repository.ts:99: .doc(updatedJob.companyId)  // 💥 companyId is undefined!
  ↓
Firebase Admin SDK: Error: Value for argument "documentPath" is not a valid resource path
  ↓
Line 98: return { success: false, error: error.message }
```

### Why The Fetch Was Added

Looking at lines 84-87, 108-111, 132-135 - all three actions have:
```typescript
const job = await webJobGetById(uid);
if (!job) {
  return { success: false, error: "Job not found" };
}
```

**Hypothesis:** Someone added the fetch to validate the job exists, but **forgot** to use the fetched object for the update!

---

## 6. The Correct Fix

### Option A: Use The Fetched Job (5 minutes!)

**The Obvious Fix:**

```typescript
const webJobPublish = async (uid: string) => {
  try {
    const job = await webJobGetById(uid);
    if (!job) {
      return { success: false, error: "Job not found" };
    }

    // ✅ SPREAD THE FETCHED JOB!
    const updatedJob: FirebaseJobData = {
      ...job,  // ← USE THE FETCHED DATA
      jobStatus: "published",
      isActive: true,
    };

    // ✅ NO TYPE CAST NEEDED - it's already FirebaseJobData
    await jobsRepository.update(uid, updatedJob, "system");
    return { success: true };
  } catch (e) {
    const error = e as Error;
    return { success: false, error: error.message };
  }
};
```

**Changes needed:**
1. Line 89: Change `Partial<FirebaseJobData>` to `FirebaseJobData`
2. Line 90: Add `...job,` spread
3. Line 94: Remove `as FirebaseJobData` cast

**Effort:** 5 minutes (copy-paste to 3 other actions)
**Files:** 1 file ([src/lib/database/actions/jobs.ts](src/lib/database/actions/jobs.ts))
**Lines changed:** 12 lines total (3 per action × 4 actions)

---

## Evidence Summary

### Key Code Snippets That Prove the Problem

**Evidence 1: updateDocument uses .update() (supports partials)**
```typescript
// src/lib/database/utils/firebase-utils.ts:216
await docRef.update(dataToWrite);
```

**Evidence 2: Actions fetch but don't use the job**
```typescript
// src/lib/database/actions/jobs.ts:84-94
const job = await webJobGetById(uid);  // ← FETCHED
if (!job) {
  return { success: false, error: "Job not found" };
}

const updatedJob: Partial<FirebaseJobData> = {  // ← job NOT USED!
  jobStatus: "published",
  isActive: true,
};

await jobsRepository.update(uid, updatedJob as FirebaseJobData, "system");
```

**Evidence 3: transformToFirebaseModel creates DocumentRefs**
```typescript
// src/lib/database/repositories/jobs-repository.ts:97-99
const companyRef = getFirebaseAdminFirestore()
  .collection("company_information")
  .doc(appModel.companyId);  // ← companyId is undefined for partial!
```

**Evidence 4: No UI uses these actions yet**
```bash
grep -rn "use-job-actions\|use-job-publish" src/app/ src/components/
# Result: No matches - hooks exist but aren't imported anywhere
```

---

## Conclusion

### Summary of Findings

1. **Repository layer is CORRECT** - `updateDocument()` properly uses Firestore `.update()`
2. **Status actions have a LOGIC BUG** - They fetch the job but don't use it
3. **Type casting hides the error** - `as FirebaseJobData` tells TypeScript to ignore the problem
4. **transformToFirebaseModel runs too early** - Before partial-supporting `.update()` is called
5. **No production impact** - Actions aren't used in UI yet, only in tests

### The Real Problem Is:

**Developer error in action implementation** - Someone added the `getById()` call (probably for validation) but forgot to use the result in the update object. The type cast masked the TypeScript error that would have caught this.

### The Correct Fix Is:

**Option A: Use the fetched job (5 minutes)**

Change 12 lines in [src/lib/database/actions/jobs.ts](src/lib/database/actions/jobs.ts):
- Spread the fetched `job` object
- Remove type casts
- Change `Partial<FirebaseJobData>` to `FirebaseJobData`

**This is the ONLY fix needed.** The repository layer is working correctly.

---

**Investigation Complete:** 2025-12-22 18:40 UTC+7
**Recommendation:** Apply Option A fix immediately (5 minutes), then continue with Phase 2 implementation
