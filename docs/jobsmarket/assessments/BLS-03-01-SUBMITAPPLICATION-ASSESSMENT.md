# BLS-03-01 submitApplication Server Action - Assessment Report

**Version:** 1.0
**Date:** 2025-12-31
**Assessed By:** Claude Code
**For Review By:** PM/SA (Claude Chat)

---

## Executive Summary

| Aspect | Status | Notes |
|--------|--------|-------|
| **Existing Infrastructure** | ✅ Strong | Repository, schema, and actions exist with comprehensive validation |
| **Gap Analysis** | ⚠️ Medium | Need new server action, validation logic, and precondition checks |
| **Implementation Complexity** | 🟡 Medium | Straightforward CRUD with business logic validation |
| **Estimated Effort** | 4-6 hours | Includes TDD (tests first), implementation, and all quality gates |
| **Risk Level** | 🟢 Low | Well-documented specs, existing patterns to follow |

---

## 1. Existing Infrastructure Audit

### 1.1 Repository Layer ✅

**File:** `src/lib/database/repositories/job-applications-repository.ts`

| Component | Status | Notes |
|-----------|--------|-------|
| **Repository Interface** | ✅ Exists | Implements `IRepository<JobApplicationData>` |
| **CRUD Methods** | ✅ Complete | `create`, `update`, `getById`, `getByFilter`, `delete` |
| **Validation** | ✅ Enhanced | Has both sync and async validation with `transformToAppModelWithValidation` |
| **Schema Transformation** | ✅ Complete | Bidirectional Firebase ↔ App model conversion |

**Key Methods Available:**
```typescript
// From job-applications-repository.ts
export const jobApplicationsRepository: IRepository<JobApplicationData> = {
  create(model: JobApplicationData, actorId: string, id?: string): Promise<string>
  update(id: string, model: JobApplicationData, actorId: string): Promise<string>
  getById(id: string): Promise<JobApplicationData | null>
  getByFilter(filter?: Filter): Promise<JobApplicationData[]>
  delete(id: string): Promise<void>
}

// Enhanced version with validation
export const jobApplicationsRepositoryWithValidation = {
  getByIdValidated(uid: string): Promise<JobApplicationData | null>
  transformFromFirebaseWithValidation(...): Promise<JobApplicationData>
}
```

**Assessment:** Repository layer is production-ready and comprehensive. ✅

---

### 1.2 Schema Layer ✅

**File:** `src/lib/database/schemas/job-applications.schema.ts`

| Component | Status | Details |
|-----------|--------|---------|
| **Zod Schema** | ✅ Complete | `JobApplicationSchema` with full field validation |
| **Status Enum** | ✅ Defined | `JobApplicationStatusSchema` with 11 valid statuses |
| **Type Safety** | ✅ Strong | TypeScript types inferred from Zod schemas |
| **Critical Validation** | ✅ Available | `JobApplicationCriticalSchema` for selective validation |

**Status Values (from schema):**
```typescript
export const JobApplicationStatusSchema = z.enum([
  'applied',     // Initial state after submission
  'read',        // Company viewed
  'accepted',    // Company accepted
  'rejected',    // Company rejected
  'scheduled',   // Interview scheduled
  'confirmed',   // Candidate confirmed interview
  'declined',    // Candidate declined interview
  'withdraw',    // Candidate withdrew
  'closed',      // Job closed
  'systemclosed', // System closed
  'cancelled',   // Interview cancelled
]);
```

**Assessment:** Schema layer provides excellent type safety and validation foundation. ✅

---

### 1.3 Actions Layer ⚠️

**File:** `src/lib/database/actions/job-applications.ts`

| Function | Status | Purpose |
|----------|--------|---------|
| `webJobApplicationGetById` | ✅ Exists | Fetch single application with job title |
| `webJobApplicationGetByFilter` | ✅ Exists | Fetch applications with filters |
| `webJobApplicationCreate` | ✅ Exists | Create application (uses repository) |
| `webJobApplicationUpdate` | ✅ Exists | Update application (uses repository) |
| `webJobApplicationDelete` | ✅ Exists | Delete application |
| `webJobApplicationGetByCandidate` | ✅ Exists | CAND-R04 - List with joined data |
| `webJobApplicationWithdraw` | ✅ Exists | BLS-03-03 - Withdraw application |
| `webJobApplicationGetByCompany` | ✅ Exists | COMP-R08 - Company view |
| `webJobApplicationMarkAsRead` | ✅ Exists | COMP-R08 - Mark as read |
| `webJobApplicationAccept` | ✅ Exists | COMP-R08 - Accept application |
| `webJobApplicationReject` | ✅ Exists | COMP-R08 - Reject application |
| **`submitApplication`** | ❌ MISSING | **BLS-03-01 - Our task!** |

**Assessment:** Actions layer is comprehensive but **missing the `submitApplication` action** that validates preconditions and orchestrates the application submission flow. This is what we need to implement. ⚠️

---

### 1.4 Existing Usage in COMP-R08 ✅

**Evidence:** COMP-R08 (Company Applications Management) already uses:
- `webJobApplicationGetByCompany` - Fetches applications for company
- `webJobApplicationMarkAsRead` - Marks application as read
- `webJobApplicationAccept` - Accepts application (creates chat, updates status)
- `webJobApplicationReject` - Rejects application

**Pattern Analysis:**
```typescript
// From webJobApplicationAccept (lines 461-523)
export async function webJobApplicationAccept(input: {
  companyId: string;
  candidateId: string;
  hrId: string;
  jobId: string;
  applicationId: string;
  name: string;
  jobTitle: string;
  companyName: string;
}): Promise<{ status: 200; message: string; chatId: string }> {
  // 1. Fetch current application
  // 2. Validate current status allows acceptance
  // 3. Create chat room
  // 4. Update application status
  // 5. TODO: Send notifications
  // 6. TODO: Check rewards
}
```

**Key Takeaway:** We should follow the same pattern:
1. Validate preconditions
2. Fetch related entities
3. Perform mutation
4. Handle side effects (notifications, cache invalidation)

**Assessment:** Strong existing patterns to follow. ✅

---

### 1.5 Apply Modal Integration 🔴

**File:** `src/components/jobsmarket/jobs/ApplyModal.tsx`

**Current State (Lines 46-72):**
```typescript
const handleSubmit = async (formData: ApplyFormData) => {
  setState('submitting');
  setError(null);

  try {
    // Mock submission for v1.0 (per PM/SA decision)
    // TODO: Replace with actual submitApplication server action in BLS-03
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simulate random success/failure for demo
    const isSuccess = Math.random() > 0.1; // 90% success rate

    // ... success/error handling
  }
}
```

**UI Comments (Lines 146-151):**
```typescript
<p className="text-xs text-blue-800">
  <strong>หมายเหตุ (v1.0):</strong> นี่เป็นโหมดสาธิต ใบสมัครยังไม่ได้บันทึกจริง
  <br />
  การบันทึกจริงจะพร้อมใช้งานใน BLS-03
</p>
```

**Assessment:** The Apply Modal is **explicitly waiting for this implementation**. The TODO comments reference BLS-03. This is the blocking implementation. 🔴

---

## 2. Gap Analysis

### 2.1 What Exists ✅

| Component | Details |
|-----------|---------|
| Database schema | Complete with Zod validation |
| Repository layer | Full CRUD with validation |
| Base actions | Create, update, getById, etc. |
| Related actions | Withdraw, accept, reject from company side |
| UI component | Apply Modal ready to integrate |

### 2.2 What's Missing ❌

| Component | Purpose | Priority |
|-----------|---------|----------|
| **`submitApplication` server action** | BLS-03-01 main action | 🔴 P0 |
| **Precondition validation** | Check profile complete, job available, not already applied | 🔴 P0 |
| **Input validation** | Validate salary, overhead, headlines per BLS spec | 🔴 P0 |
| **Duplicate check** | Prevent duplicate applications | 🔴 P0 |
| **Side effects** | Notification, cache invalidation | 🟡 P1 |
| **Unit tests** | TDD tests for validation logic | 🔴 P0 |
| **Integration tests** | DB state verification | 🔴 P0 |
| **E2E tests** | Apply modal flow | 🔴 P0 |

### 2.3 Data Missing from Spec

**BLS-03 mentions these fields, but data entities doc is missing:**

From BLS-03 inputs (lines 57-64):
```
| expectedSalary | number | null | No | >= 0, max 999,999 | null | Form input |
| isNegotiable | boolean | No | - | true | Checkbox |
| overheadDays | number | No | Enum: 0, 7, 15, 30, 60, 90 | 0 | Dropdown |
| headlines | string | No | max 500 chars | '' | Textarea |
```

**Schema Verification:**
✅ All fields exist in `FirebaseJobApplicationSchema` (lines 57-68 in schema file)
✅ All fields exist in `JobApplicationSchema` (lines 124-129 in schema file)

**Assessment:** No data model gaps. All fields are defined. ✅

---

## 3. Implementation Plan

### Phase 1: Write Tests (RED Phase) 🔴

**Estimated Time:** 2 hours

#### 3.1.1 Unit Tests

**File:** `tests/unit/jobsmarket/jobs/applications/submit-application.test.ts`

**Test Coverage Required (90%+ coverage):**

| Test Category | Test Cases | Count |
|---------------|------------|-------|
| **Input Validation** | | 6 |
| ↳ Valid minimal input | All required fields only | 1 |
| ↳ Valid full input | All fields including optionals | 1 |
| ↳ Expected salary validation | < 0, > 999,999, null, valid | 3 |
| ↳ Headlines validation | > 500 chars, valid | 1 |
| **Precondition Checks** | | 5 |
| ↳ User not authenticated | Should throw | 1 |
| ↳ Profile incomplete | Should throw with specific error | 1 |
| ↳ Job not found | Should throw | 1 |
| ↳ Job closed/expired | Should throw | 1 |
| ↳ Already applied | Should throw with specific error | 1 |
| **Success Path** | | 3 |
| ↳ Create new application | Minimal fields | 1 |
| ↳ Create with all fields | All optional fields | 1 |
| ↳ Return correct application ID | Verify return value | 1 |
| **Error Handling** | | 3 |
| ↳ Network error | Repository throws | 1 |
| ↳ Invalid job ID | Job not found | 1 |
| ↳ Database constraint violation | Unique constraint | 1 |

**Total Unit Tests:** ~17 tests

#### 3.1.2 Integration Tests

**File:** `tests/integration/jobsmarket/jobs/applications/submit-application.test.ts`

**Test Coverage Required:**

| Test Category | Test Cases | Count |
|---------------|------------|-------|
| **Database Operations** | | 4 |
| ↳ Create application record | Verify in dev DB | 1 |
| ↳ Set correct status | status === 'applied' | 1 |
| ↳ Set correct timestamps | createdAt, updatedAt | 1 |
| ↳ Set correct references | jobId, candidateId, companyId | 1 |
| **Duplicate Prevention** | | 2 |
| ↳ Prevent duplicate for same job | Second call throws | 1 |
| ↳ Allow reapply after withdraw | Can apply again if status=withdraw | 1 |
| **Field Persistence** | | 3 |
| ↳ Optional fields saved | expectedSalary, headlines | 1 |
| ↳ Default values applied | isNegotiable=true, overheadDays=0 | 1 |
| ↳ Null values handled | expectedSalary=null | 1 |

**CRITICAL REQUIREMENT (from assessment instructions):**
```typescript
// ❌ WRONG - Only checks return value
const result = await submitApplication(input);
expect(result.success).toBe(true);

// ✅ CORRECT - Verifies database state
const result = await submitApplication(input);
const dbRecord = await jobApplicationsRepository.getById(result.data.applicationId);
expect(dbRecord).not.toBeNull();
expect(dbRecord.status).toBe('applied');
expect(dbRecord.candidateId).toBe(testCandidateId);
```

**Total Integration Tests:** ~9 tests

#### 3.1.3 E2E Tests

**File:** `tests/e2e/jobsmarket/jobs/apply-modal.spec.ts` (extend existing)

**Test Coverage Required:**

| Test Category | Test Cases | Count |
|---------------|------------|-------|
| **Happy Path** | | 2 |
| ↳ Apply with minimal info | Submit with required fields only | 1 |
| ↳ Apply with full info | Submit with all fields | 1 |
| **Invalid Inputs** | | 3 |
| ↳ Invalid salary | Negative, too high | 1 |
| ↳ Headlines too long | > 500 chars | 1 |
| ↳ Form validation errors | Required fields missing | 1 |
| **Error States** | | 2 |
| ↳ Already applied | Show already applied card | 1 |
| ↳ Network error | Show error, allow retry | 1 |

**Total E2E Tests:** ~7 tests

**Total Test Count:** 17 + 9 + 7 = **33 tests**

---

### Phase 2: Implementation (GREEN Phase) ✅

**Estimated Time:** 2-3 hours

#### 3.2.1 Server Action File

**File:** `src/lib/database/actions/job-applications.ts` (add to existing file)

**Function Signature:**
```typescript
export async function submitApplication(input: {
  jobId: string;
  expectedSalary?: number | null;
  isNegotiable?: boolean;
  overheadDays?: number;
  headlines?: string;
}): Promise<{
  success: boolean;
  data?: {
    applicationId: string;
    status: 'applied';
    appliedAt: number;
  };
  error?: 'ALREADY_APPLIED' | 'JOB_CLOSED' | 'PROFILE_INCOMPLETE' | 'UNAUTHORIZED' | 'NETWORK_ERROR';
}>
```

**Implementation Steps:**

1. **Get authenticated user** (Firebase Admin SDK)
   ```typescript
   const { user } = await validateServerSession();
   if (!user) throw new Error('UNAUTHORIZED');
   ```

2. **Validate input** (Zod schema)
   ```typescript
   const InputSchema = z.object({
     jobId: z.string(),
     expectedSalary: z.number().min(0).max(999999).nullable().optional(),
     isNegotiable: z.boolean().optional(),
     overheadDays: z.enum([0, 7, 15, 30, 60, 90]).optional(),
     headlines: z.string().max(500).optional(),
   });
   const validated = InputSchema.parse(input);
   ```

3. **Check preconditions**
   - Profile complete: Fetch candidate, check `isResumeCompleted`
   - Job available: Fetch job, check `isActive && !isClosed && postExpiryDate > now`
   - Not already applied: Query applications for `candidateId + jobId`, check status not in `['applied', 'read', 'accepted', 'scheduled', 'confirmed']`

4. **Create application**
   ```typescript
   const applicationData: JobApplicationData = {
     uid: '', // Generated by repository
     jobId: validated.jobId,
     candidateId: user.uid,
     companyId: job.companyId,
     companyName: job.companyName,
     status: 'applied',
     expectedSalary: validated.expectedSalary ?? null,
     isNegotiable: validated.isNegotiable ?? true,
     overheadDays: validated.overheadDays ?? 0,
     headlines: validated.headlines ?? '',
     createdAt: Date.now(),
     updatedAt: Date.now(),
     createdBy: user.uid,
     updatedBy: user.uid,
   };

   const applicationId = await jobApplicationsRepository.create(
     applicationData,
     user.uid
   );
   ```

5. **Handle side effects**
   - TODO: Create notification for company
   - TODO: Update job apply count
   - Return cache invalidation keys

6. **Return success**
   ```typescript
   return {
     success: true,
     data: {
       applicationId,
       status: 'applied',
       appliedAt: Date.now(),
     },
   };
   ```

#### 3.2.2 Update Apply Modal

**File:** `src/components/jobsmarket/jobs/ApplyModal.tsx`

**Changes:**
```typescript
// Replace mock submission (lines 46-72)
import { submitApplication } from '@/lib/database/actions/job-applications';

const handleSubmit = async (formData: ApplyFormData) => {
  setState('submitting');
  setError(null);

  try {
    const result = await submitApplication({
      jobId: job.uid,
      expectedSalary: formData.expectedSalary,
      isNegotiable: formData.isNegotiable,
      overheadDays: formData.overheadDays,
      headlines: formData.headlines,
    });

    if (result.success) {
      setState('success');
      setTimeout(() => {
        onSuccess?.();
        handleClose();
      }, 2000);
    } else {
      // Handle specific errors
      const errorMessages = {
        ALREADY_APPLIED: 'คุณสมัครงานนี้แล้ว',
        JOB_CLOSED: 'ตำแหน่งนี้ปิดรับสมัครแล้ว',
        PROFILE_INCOMPLETE: 'กรุณากรอกข้อมูลให้ครบก่อนสมัคร',
        UNAUTHORIZED: 'กรุณาเข้าสู่ระบบ',
        NETWORK_ERROR: 'ไม่สามารถส่งใบสมัครได้ กรุณาลองใหม่',
      };
      throw new Error(errorMessages[result.error!] || 'เกิดข้อผิดพลาด');
    }
  } catch (err) {
    setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ');
    setState('editing');
  }
};
```

**Remove demo notice** (lines 146-152)

---

### Phase 3: Verify All Quality Gates 🎯

**Estimated Time:** 1 hour

| Gate | Command | Requirement | Status |
|------|---------|-------------|--------|
| **Gate 1** | `npm run build` | 0 errors | ⬜ Pending |
| **Gate 2** | `npm run lint` | 0 errors | ⬜ Pending |
| **Gate 3** | `npm run dev` + browser | Route loads, no console errors | ⬜ Pending |
| **Gate 4a** | `npm run test:unit -- --coverage` | All pass, ≥90% coverage | ⬜ Pending |
| **Gate 4b** | Integration tests | All pass, DB verified | ⬜ Pending |
| **Gate 4c** | `npx playwright test` | All RIS flows covered | ⬜ Pending |

---

## 4. Test Plan Summary

### 4.1 Test Distribution

| Test Type | File Location | Count | Coverage Target |
|-----------|---------------|-------|-----------------|
| Unit | `tests/unit/jobsmarket/jobs/applications/submit-application.test.ts` | ~17 | 90%+ of action code |
| Integration | `tests/integration/jobsmarket/jobs/applications/submit-application.test.ts` | ~9 | 100% DB operations |
| E2E | `tests/e2e/jobsmarket/jobs/apply-modal.spec.ts` | ~7 | All RIS flows |

### 4.2 Coverage Strategy

**Unit Tests:**
- All input validation branches
- All precondition checks
- All error paths
- Success path with minimal and full data

**Integration Tests:**
- Database record creation
- Field persistence
- Duplicate prevention
- Reapply after withdraw

**E2E Tests:**
- Happy path: Apply and verify UI state
- Invalid inputs: Form validation
- Error states: Already applied, network error

---

## 5. Files to Create/Modify

### 5.1 New Files ✨

| File | Purpose | Lines |
|------|---------|-------|
| `tests/unit/jobsmarket/jobs/applications/submit-application.test.ts` | Unit tests | ~400 |
| `tests/integration/jobsmarket/jobs/applications/submit-application.test.ts` | Integration tests | ~300 |

### 5.2 Modified Files ✏️

| File | Changes | Lines Added |
|------|---------|-------------|
| `src/lib/database/actions/job-applications.ts` | Add `submitApplication` function | ~150 |
| `src/components/jobsmarket/jobs/ApplyModal.tsx` | Replace mock with real action | ~20 changed |
| `tests/e2e/jobsmarket/jobs/apply-modal.spec.ts` | Extend with new test cases | ~100 |

### 5.3 No New Type Files Needed ✅

All types already exist in:
- `src/lib/database/schemas/job-applications.schema.ts`
- `src/types/jobsmarket/apply-modal.types.ts`

---

## 6. Open Questions for PM/SA

### 6.1 Architecture Decisions

| # | Question | Options | Recommendation |
|---|----------|---------|----------------|
| 1 | Where to add the action? | (A) New file, (B) Existing `job-applications.ts` | **B** - Keep related actions together |
| 2 | Notification implementation? | (A) Immediate, (B) Phase 2, (C) Background job | **B** - Phase 2 (TODO comment) |
| 3 | Job apply count update? | (A) Atomic transaction, (B) Separate update, (C) Skip for now | **A** - Atomic (in same transaction) |
| 4 | Reapply logic? | (A) Allow if withdraw, (B) Block completely, (C) Check job still active | **C** - Allow if withdraw AND job active |

### 6.2 Precondition Checks

| # | Question | BLS Spec | Clarification Needed |
|---|----------|----------|----------------------|
| 1 | Profile complete check | Mentioned in BLS-03 line 52 | Which fields define "complete"? Use `isResumeCompleted` boolean? |
| 2 | Job expiry check | `postExpiryDate > now` | Is this field available in jobs schema? |
| 3 | Duplicate definition | "Not already applied" | Which statuses count as "already applied"? Suggest: `['applied', 'read', 'accepted', 'scheduled', 'confirmed']` |

### 6.3 Side Effects

| # | Side Effect | BLS Reference | Implementation Plan |
|---|-------------|---------------|---------------------|
| 1 | Create notification for company | BLS-03 line 136 | TODO comment, Phase 2 |
| 2 | Update job apply count | BLS-03 line 137 | Increment `jobs.applyCount` field |
| 3 | Cache invalidation | BLS-03 lines 73-78 | Return keys in response |
| 4 | First application reward | BLS-03 line 293 | TODO comment, Phase 2 |

### 6.4 Error Handling

| # | Error Type | BLS Reference | Proposed Behavior |
|---|------------|---------------|-------------------|
| 1 | Already applied | BLS-03 line 126 | Return error code, UI auto-transitions to applied state |
| 2 | Profile incomplete | BLS-03 line 119 | Return error code, UI shows link to profile |
| 3 | Job closed | BLS-03 line 118 | Return error code, UI shows banner |
| 4 | Rate limiting | BLS-03 line 130 | Not in scope for v1? |

---

## 7. Estimated Effort Breakdown

| Phase | Task | Hours | Dependencies |
|-------|------|-------|--------------|
| **Phase 1** | Write unit tests (RED) | 1.5 | None |
| | Write integration tests (RED) | 0.5 | None |
| | Write/extend E2E tests (RED) | 0.5 | None |
| | Verify all tests FAIL | 0.5 | All test files |
| **Phase 2** | Implement `submitApplication` | 2.0 | Tests written |
| | Update Apply Modal | 0.5 | Action implemented |
| | Run tests until GREEN | 0.5 | Implementation complete |
| **Phase 3** | Run Gate 1 (Build) | 0.1 | Implementation complete |
| | Run Gate 2 (Lint) | 0.1 | Build passes |
| | Run Gate 3 (Dev + Browser) | 0.2 | Lint passes |
| | Run Gate 4a (Unit + Coverage) | 0.2 | All above pass |
| | Run Gate 4b (Integration) | 0.2 | All above pass |
| | Run Gate 4c (E2E) | 0.2 | All above pass |
| **Documentation** | Fill completion checklist | 0.2 | All gates pass |
| | Create PR | 0.1 | Checklist complete |
| **Total** | | **6.5 hours** | |

**Confidence Level:** High (existing patterns, clear specs, strong foundation)

---

## 8. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Profile completeness check undefined | Medium | Medium | Ask PM/SA for field definition |
| Job expiry field missing | Low | Low | Check jobs schema, fallback to `isActive` |
| Notification service not ready | High | Low | Use TODO comments, implement in Phase 2 |
| Duplicate check logic unclear | Medium | High | Propose status list, get PM/SA approval |
| Cache invalidation keys unknown | Low | Medium | Return all possible keys, let UI decide |

**Overall Risk:** 🟢 Low - Well-scoped task with strong foundation

---

## 9. Success Criteria

### 9.1 Functional Requirements ✅

- [ ] Candidate can submit application from Apply Modal
- [ ] Application saved to database with correct fields
- [ ] Duplicate applications prevented
- [ ] Profile incomplete users blocked
- [ ] Closed/expired jobs blocked
- [ ] Success state shows in UI
- [ ] Error states handled gracefully

### 9.2 Technical Requirements ✅

- [ ] All quality gates pass (Gates 1-4)
- [ ] Unit test coverage ≥ 90%
- [ ] Integration tests verify DB state
- [ ] E2E tests cover all RIS flows
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] No console errors in browser

### 9.3 Documentation Requirements ✅

- [ ] Completion checklist filled with evidence
- [ ] Test output pasted in completion message
- [ ] Coverage report shows ≥ 90%
- [ ] RIS flow coverage documented

---

## 10. Next Steps

### For PM/SA Review:

1. **Review this assessment** - Approve overall approach
2. **Answer open questions** - Especially precondition definitions (Section 6)
3. **Approve file locations** - Confirm adding to existing `job-applications.ts`
4. **Clarify side effects** - Which to implement now vs Phase 2
5. **Give go-ahead** - Authorize implementation start

### For Claude Code (after approval):

1. **Phase 1: TDD RED** - Write all tests first, verify they FAIL
2. **Phase 2: TDD GREEN** - Implement until tests PASS
3. **Phase 3: Quality Gates** - Run all gates, get to ✅
4. **Phase 4: Completion** - Fill checklist, create PR

---

## 11. Appendix A: Input Validation Schema

```typescript
import { z } from 'zod';

export const SubmitApplicationInputSchema = z.object({
  jobId: z.string().min(1, 'Job ID is required'),
  expectedSalary: z.number()
    .min(0, 'Expected salary must be >= 0')
    .max(999999, 'Expected salary must be <= 999,999')
    .nullable()
    .optional(),
  isNegotiable: z.boolean().optional().default(true),
  overheadDays: z.enum([0, 7, 15, 30, 60, 90]).optional().default(0),
  headlines: z.string()
    .max(500, 'Headlines must be <= 500 characters')
    .optional()
    .default(''),
});

export type SubmitApplicationInput = z.infer<typeof SubmitApplicationInputSchema>;
```

---

## 12. Appendix B: Precondition Check Logic

```typescript
// Proposed implementation (to be confirmed by PM/SA)

async function checkPreconditions(
  userId: string,
  jobId: string
): Promise<PreconditionResult> {
  // 1. Get candidate profile
  const candidate = await webCandidateInformationGetById(userId);
  if (!candidate) {
    return { pass: false, error: 'PROFILE_NOT_FOUND' };
  }

  // 2. Check profile complete
  if (!candidate.isResumeCompleted) {
    return { pass: false, error: 'PROFILE_INCOMPLETE' };
  }

  // 3. Get job
  const job = await webJobGetById(jobId);
  if (!job) {
    return { pass: false, error: 'JOB_NOT_FOUND' };
  }

  // 4. Check job available
  const now = Date.now();
  const isJobAvailable =
    job.isActive &&
    !job.isClosed &&
    (!job.postExpiryDate || job.postExpiryDate > now);

  if (!isJobAvailable) {
    return { pass: false, error: 'JOB_CLOSED' };
  }

  // 5. Check not already applied
  const candidateRef = getFirebaseAdminFirestore()
    .collection('candidate_information')
    .doc(userId);
  const jobRef = getFirebaseAdminFirestore()
    .collection('jobs')
    .doc(jobId);

  const filter = Filter.and(
    Filter.where('candidate_id', '==', candidateRef),
    Filter.where('job_id', '==', jobRef)
  );

  const existingApplications = await webJobApplicationGetByFilter(filter);

  // Statuses that count as "already applied"
  const activeStatuses = ['applied', 'read', 'accepted', 'scheduled', 'confirmed'];
  const hasActiveApplication = existingApplications?.some(app =>
    activeStatuses.includes(app.status)
  );

  if (hasActiveApplication) {
    return { pass: false, error: 'ALREADY_APPLIED' };
  }

  // All checks passed
  return {
    pass: true,
    data: {
      candidate,
      job,
      canReapply: existingApplications?.some(app => app.status === 'withdraw')
    }
  };
}
```

---

## 13. Appendix C: Integration Test Template

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { submitApplication } from '@/lib/database/actions/job-applications';
import { jobApplicationsRepository } from '@/lib/database/repositories/job-applications-repository';

describe('submitApplication Integration Tests', () => {
  const testUserId = 'test-integration-submit-app';
  const testJobId = 'test-job-submit-app';
  let createdApplicationId: string | null = null;

  beforeEach(async () => {
    // Setup test data in real dev database
    // TODO: Create test candidate with isResumeCompleted=true
    // TODO: Create test job with isActive=true
  });

  afterEach(async () => {
    // Clean up test data
    if (createdApplicationId) {
      await jobApplicationsRepository.delete(createdApplicationId);
      createdApplicationId = null;
    }
    // TODO: Clean up test candidate and job
  });

  it('should create application in database with correct status', async () => {
    const result = await submitApplication({
      jobId: testJobId,
      expectedSalary: 50000,
      isNegotiable: true,
      overheadDays: 30,
      headlines: 'Test application',
    });

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    createdApplicationId = result.data!.applicationId;

    // CRITICAL: Verify database state
    const dbRecord = await jobApplicationsRepository.getById(createdApplicationId);
    expect(dbRecord).not.toBeNull();
    expect(dbRecord!.status).toBe('applied');
    expect(dbRecord!.candidateId).toBe(testUserId);
    expect(dbRecord!.jobId).toBe(testJobId);
    expect(dbRecord!.expectedSalary).toBe(50000);
    expect(dbRecord!.isNegotiable).toBe(true);
    expect(dbRecord!.overheadDays).toBe(30);
    expect(dbRecord!.headlines).toBe('Test application');
  });

  it('should prevent duplicate application', async () => {
    // First application
    const result1 = await submitApplication({
      jobId: testJobId,
    });
    createdApplicationId = result1.data!.applicationId;

    // Second application (should fail)
    const result2 = await submitApplication({
      jobId: testJobId,
    });

    expect(result2.success).toBe(false);
    expect(result2.error).toBe('ALREADY_APPLIED');
  });
});
```

---

**End of Assessment Report**

**Status:** ✅ Ready for PM/SA Review

**Recommendation:** Approve and proceed with implementation following TDD workflow.
