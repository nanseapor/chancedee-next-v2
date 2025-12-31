# JOB-R02b: Apply Modal Assessment

**Route ID:** JOB-R02b
**Route Type:** Modal Component (not standalone route)
**Parent Route:** JOB-R02 (Job Detail Page)
**Complexity:** Low-Medium
**Assessed By:** Claude Code (Developer Agent)
**Assessment Date:** 2025-12-31
**Estimated Duration:** 0.5-1 day (4-8 hours)

---

## Executive Summary

JOB-R02b implements the job application modal flow as a supplementary feature to JOB-R02 (Job Detail Page). This assessment covers:

- **Scope:** Apply modal UI only (server action deferred to BLS-03)
- **Key Finding:** 70% of infrastructure already built in JOB-R02
- **Deliverables:** 5 new components + 3 hooks + form validation
- **Integration:** Seamless connection with existing ApplySection
- **Testing:** ~25 tests (15 unit + 5 integration + 5 E2E)
- **Risk Level:** Low (well-defined spec, existing patterns)

**Pre-Approved Decisions from PM/SA:**
1. ✅ UI implementation only - server action deferred to BLS-03
2. ✅ Simple form: salary, availability, cover letter (optional)
3. ✅ One application per job (already enforced in ApplySection)

---

## 1. Component Analysis

### 1.1 Modal Structure

Based on JOB-R02b RIS Section 3.1, the modal requires a hierarchical component structure:

```
ApplyModal (Container)
├── Modal Header
│   ├── Title ("สมัครงาน")
│   └── Close Button (×)
├── Job Summary Card
│   ├── Job Title
│   ├── Company Name
│   └── Location
├── ApplyForm (Main Content)
│   ├── Expected Salary Input
│   ├── Negotiable Checkbox
│   ├── Availability Dropdown
│   └── Cover Letter Textarea
└── Action Bar (Sticky Footer)
    ├── Cancel Button
    └── Submit Button
```

### 1.2 Component Breakdown

| Component | Purpose | Lines | Complexity |
|-----------|---------|-------|------------|
| `ApplyModal.tsx` | Modal container + state machine | ~200 | Medium |
| `ApplyForm.tsx` | Form fields + validation | ~150 | Medium |
| `JobSummaryCard.tsx` | Context display | ~50 | Low |
| `AvailabilitySelect.tsx` | Dropdown with options | ~60 | Low |
| `FormActions.tsx` | Cancel/Submit bar | ~40 | Low |

**Total:** ~500 lines across 5 components

### 1.3 State Machine (RIS Section 4)

```typescript
type ModalState = 'closed' | 'editing' | 'submitting' | 'success';

// State transitions
closed → editing     // User clicks "Apply" button
editing → submitting // Form validated, submit clicked
editing → closed     // Cancel or dismiss
submitting → success // Server returns success
submitting → editing // Server returns error
success → closed     // Auto-close after toast
```

**Key States:**
- `closed`: Modal not visible
- `editing`: Form active, user can input
- `submitting`: API call in progress, button disabled
- `success`: Brief success state before auto-close

---

## 2. Existing Code Audit

### 2.1 Already Built in JOB-R02 ✅

| Feature | Implementation | Location | Status |
|---------|---------------|----------|--------|
| Apply button | ApplySection.tsx | `src/app/jobsmarket/jobs/[id]/_components/` | ✅ Complete |
| 5-state system | guest, incomplete, ready, applied, closed | ApplySection lines 11-59 | ✅ Complete |
| Profile check | `profileCompletion >= 80` | ApplySection line 48 | ✅ Complete |
| Login prompt | `onApplyAuth()` callback | JobDetailClient | ✅ Complete |
| Auth state | jotai atoms (session, user) | ApplySection lines 4-6 | ✅ Complete |

**Key Finding:** ApplySection is ready to trigger modal - just replace `alert()` on line 72 with modal open.

### 2.2 Reusable Patterns from JOB-R02

| Pattern | Source | Reuse in JOB-R02b |
|---------|--------|-------------------|
| Form validation | SaveJobButton | Apply form fields |
| Toast notifications | LoginPromptModal | Success/error feedback |
| Modal structure | LoginPromptModal | Base modal wrapper |
| Loading states | useSaveJobMutation | Submit button |
| Error handling | getPublicJobById | Form submission |

### 2.3 Database Schema Analysis

From `job-applications.schema.ts` (lines 93-154):

**Required Fields for Application:**
```typescript
{
  jobId: string;          // From route param
  candidateId: string;    // From session
  companyId: string;      // From job data
  companyName: string;    // From job data
  status: 'applied';      // Initial status
  expectedSalary?: number;    // From form (optional)
  isNegotiable?: boolean;     // From form (default: true)
  overheadDays?: number;      // From form (default: 0)
  headlines?: string;         // From form (optional)
}
```

**Good News:** All fields map 1:1 to RIS Section 3.2 form fields specification.

---

## 3. New Deliverables List

### 3.1 Components (5 new files)

| File | Location | Purpose | Depends On |
|------|----------|---------|------------|
| `ApplyModal.tsx` | `src/components/jobsmarket/jobs/` | Modal wrapper + state machine | Dialog (shadcn) |
| `ApplyForm.tsx` | `src/components/jobsmarket/jobs/` | Form fields + validation | Form (shadcn) |
| `JobSummaryCard.tsx` | `src/components/jobsmarket/jobs/` | Job context display | Card (shadcn) |
| `AvailabilitySelect.tsx` | `src/components/jobsmarket/jobs/` | Overhead days dropdown | Select (shadcn) |
| `FormActions.tsx` | `src/components/jobsmarket/jobs/` | Sticky action bar | Button (shadcn) |

**Rationale for shared location:** These components are specific to job applications, may be reused in candidate applications page (CAND-R04).

### 3.2 Hooks (3 new files)

| Hook | Location | Purpose | Returns |
|------|----------|---------|---------|
| `useApplyModal.ts` | `src/hooks/jobsmarket/` | Modal state machine | `{ isOpen, open, close, state }` |
| `useApplyForm.ts` | `src/hooks/jobsmarket/` | Form state + validation | `{ form, errors, validate, reset }` |
| `useApplicationSubmit.ts` | `src/hooks/jobsmarket/` | Submission logic (mock for v1.0) | `{ submit, isSubmitting, error }` |

### 3.3 Server Actions (Deferred to BLS-03) ⏭️

Per PM/SA pre-decision, server actions are **NOT** in scope for JOB-R02b:

| Action | Status | Notes |
|--------|--------|-------|
| `JobApplicationSet` | ⏭️ Deferred | Will be implemented in BLS-03 |
| `JobApplicationDel` | ⏭️ Deferred | Withdraw feature in BLS-03 |
| `JobApplicationGetByCandidate` | ⏭️ Deferred | Application fetching in BLS-03 |

**v1.0 Approach:** Mock submission with success toast, don't create actual application.

### 3.4 Types (1 new file)

| File | Location | Purpose |
|------|----------|---------|
| `apply-modal.types.ts` | `src/types/jobsmarket/` | Form state, validation errors |

---

## 4. Form Validation

### 4.1 Field Validation Rules

Per RIS Section 3.2 and BLS-03-01:

| Field | Type | Required | Validation | Error Message (Thai) |
|-------|------|----------|------------|----------------------|
| `expectedSalary` | number | No | >= 0, <= 999,999 | "เงินเดือนต้องมากกว่า 0" / "เงินเดือนสูงเกินไป" |
| `isNegotiable` | boolean | No | - | - |
| `overheadDays` | number | No | Enum: 0, 7, 15, 30, 60, 90 | "กรุณาเลือกจากตัวเลือกที่กำหนด" |
| `headlines` | string | No | max 500 chars | "ข้อความยาวเกินไป (สูงสุด 500 ตัวอักษร)" |

### 4.2 Validation Logic

```typescript
interface ApplyFormErrors {
  expectedSalary?: string;
  headlines?: string;
}

function validateApplyForm(form: ApplyFormState): {
  isValid: boolean;
  errors: ApplyFormErrors;
} {
  const errors: ApplyFormErrors = {};

  // Salary validation
  if (form.expectedSalary !== null) {
    if (form.expectedSalary < 0) {
      errors.expectedSalary = 'เงินเดือนต้องมากกว่า 0';
    }
    if (form.expectedSalary > 999999) {
      errors.expectedSalary = 'เงินเดือนสูงเกินไป';
    }
  }

  // Headlines validation
  if (form.headlines.length > 500) {
    errors.headlines = 'ข้อความยาวเกินไป (สูงสุด 500 ตัวอักษร)';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
```

### 4.3 Form Defaults

```typescript
const defaultApplyForm: ApplyFormState = {
  expectedSalary: null,    // Empty, not required
  isNegotiable: true,      // Default per RIS
  overheadDays: 0,         // "ได้ทันที" (Immediately)
  headlines: '',           // Empty, optional
};
```

---

## 5. Integration Points

### 5.1 Triggering Modal from ApplySection

**Current Code (ApplySection.tsx lines 69-72):**
```typescript
case 'ready':
  // For v1.0: Show placeholder or redirect to contact
  // TODO: Open ApplyModal in JOB-R02b
  alert('สมัครงาน feature coming soon!');
  break;
```

**Updated Integration:**
```typescript
// 1. Add modal state to JobDetailClient
const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

// 2. Pass opener to ApplySection
<ApplySection
  job={job}
  isJobAvailable={isJobAvailable}
  profileCompletion={profileCompletion}
  onApply={() => setIsApplyModalOpen(true)}  // NEW
  onApplyAuth={handleApplyAuth}
/>

// 3. Render modal in JobDetailClient
{isApplyModalOpen && (
  <ApplyModal
    job={job}
    isOpen={isApplyModalOpen}
    onClose={() => setIsApplyModalOpen(false)}
  />
)}
```

**Changes Required:**
- ApplySection: Replace `alert()` with `onApply()` callback
- JobDetailClient: Add modal state + render ApplyModal
- **Lines Changed:** ~15 (minimal impact)

### 5.2 Post-Submission Flow

**v1.0 (Mock Submission):**
```typescript
async function handleSubmit() {
  setIsSubmitting(true);

  // Mock delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Show success toast
  toast.success('ส่งใบสมัครเรียบร้อย (Demo - ยังไม่ได้บันทึกจริง)');

  // Close modal
  closeModal();

  setIsSubmitting(false);
}
```

**v2.0 (Real Submission - BLS-03):**
```typescript
async function handleSubmit() {
  const result = await submitApplication({
    jobId: job.uid,
    ...formData
  });

  if (result.success) {
    toast.success('ส่งใบสมัครเรียบร้อย');
    // Invalidate SWR cache
    mutate(`application-${uid}-${jobId}`);
    closeModal();
  } else {
    toast.error(result.error);
  }
}
```

### 5.3 Modal Accessibility

Per RIS Section 11, modal must implement:

| Requirement | Implementation |
|-------------|----------------|
| Focus trap | Use shadcn Dialog (has built-in) |
| Escape key | Dialog `onOpenChange` |
| `aria-modal` | Dialog sets automatically |
| `aria-labelledby` | Point to modal title |
| Initial focus | `autoFocus` on first input |
| Return focus | Dialog handles automatically |

**Good News:** shadcn `Dialog` component provides all accessibility out of the box.

---

## 6. Test Plan

### 6.1 Unit Tests (~15 tests)

**File:** `tests/unit/jobsmarket/jobs/apply-modal/ApplyForm.test.tsx`

| Test Group | Tests | Focus |
|------------|-------|-------|
| Form Initialization | 3 | Default values, props |
| Field Updates | 4 | Each field updates correctly |
| Validation | 5 | Salary min/max, headlines length |
| Form Reset | 1 | Clear after submit |
| Error Display | 2 | Error messages show/hide |

**File:** `tests/unit/jobsmarket/jobs/apply-modal/useApplyModal.test.ts`

| Test Group | Tests | Focus |
|------------|-------|-------|
| State Transitions | 5 | closed ↔ editing ↔ submitting ↔ success |
| Modal Opening | 2 | Profile check before open |
| Modal Closing | 3 | Cancel, escape, backdrop |

**Total Unit Tests:** 15

### 6.2 Integration Tests (~5 tests)

**File:** `tests/integration/jobsmarket/jobs/apply-modal-integration.test.ts`

| Test | Focus |
|------|-------|
| Modal opens from ApplySection | Click "Apply" → modal visible |
| Form submission (mock) | Submit → success toast → modal closes |
| Validation blocks submission | Invalid form → submit disabled |
| Cancel closes modal | Cancel button → modal closes, form reset |
| Already applied blocks modal | hasApplied=true → modal doesn't open |

**Total Integration Tests:** 5

### 6.3 E2E Tests (~5 tests)

**File:** `tests/e2e/jobsmarket/jobs/apply-modal.spec.ts`

| Test ID | Scenario | Steps | Expected |
|---------|----------|-------|----------|
| APM-E2E-01 | Open modal | Click "Apply" | Modal opens with form |
| APM-E2E-02 | Fill and submit | Enter data → submit | Success toast, modal closes |
| APM-E2E-03 | Cancel modal | Open → cancel | Modal closes, no toast |
| APM-E2E-04 | Validation error | Invalid salary → submit | Error message visible |
| APM-E2E-05 | Escape closes | Open → press Escape | Modal closes |

**Total E2E Tests:** 5

**Grand Total:** 25 tests (15 unit + 5 integration + 5 E2E)

---

## 7. Phase Breakdown

### Phase 1: Component Structure (2-3 hours)

**Deliverables:**
- [ ] `ApplyModal.tsx` - Shell with open/close state
- [ ] `ApplyForm.tsx` - Form layout (no validation yet)
- [ ] `JobSummaryCard.tsx` - Job context display
- [ ] `AvailabilitySelect.tsx` - Dropdown options
- [ ] `FormActions.tsx` - Action bar
- [ ] Integration: Connect ApplySection → ApplyModal

**Tests:** None (write in Phase 2)

**Gate:** Modal opens and closes, form renders

---

### Phase 2: Form Logic + Validation (2-3 hours)

**Deliverables:**
- [ ] `useApplyForm.ts` - Form state management
- [ ] `useApplyModal.ts` - Modal state machine
- [ ] Validation logic per Section 4
- [ ] Error message display
- [ ] Field-level validation feedback

**Tests:**
- [ ] 15 unit tests (form + modal hook)
- [ ] 5 integration tests

**Gate:** All unit + integration tests passing, validation works

---

### Phase 3: Submit + E2E Testing (1-2 hours)

**Deliverables:**
- [ ] `useApplicationSubmit.ts` - Mock submission
- [ ] Success toast integration
- [ ] Modal close after success
- [ ] Loading state on submit button

**Tests:**
- [ ] 5 E2E tests

**Gate:** All E2E tests passing, flow works end-to-end

---

### Phase 4: Polish + Quality Gates (1 hour)

**Deliverables:**
- [ ] Accessibility audit (focus trap, aria labels)
- [ ] Character counter for headlines
- [ ] Loading spinner during submit
- [ ] Error recovery (network failure)

**Tests:**
- [ ] Run full test suite
- [ ] Manual browser testing

**Gate:** All quality gates pass (build, lint, tests)

---

**Total Estimated Time:** 6-9 hours (0.75-1.1 days)

---

## 8. Open Questions

### Q1: Mock vs Real Submission in v1.0?

**Question:** Should the modal submit a real application to Firebase or show a "coming soon" message?

**Options:**
- **A) Full Mock:** Show toast "Demo - ยังไม่ได้บันทึกจริง", don't touch database
- **B) Partial Mock:** Write to test collection, show on staging only
- **C) Real Submit:** Implement full server action now (not deferred)

**Recommendation:** **Option A (Full Mock)**
- Aligns with PM/SA decision to defer server action to BLS-03
- Allows UI testing without database side effects
- Faster implementation (no server action complexity)
- Clear messaging to users that it's demo mode

---

### Q2: Where to Place ApplyModal Component?

**Question:** Should ApplyModal be in shared `src/components/jobsmarket/jobs/` or co-located with JobDetailClient?

**Options:**
- **A) Shared:** `src/components/jobsmarket/jobs/ApplyModal.tsx`
- **B) Co-located:** `src/app/jobsmarket/jobs/[id]/_components/ApplyModal.tsx`

**Recommendation:** **Option A (Shared)**
- Modal will be reused in candidate applications page (CAND-R04) for editing applications
- Follows existing pattern (SaveJobButton, LoginPromptModal are shared)
- Better for testing (easier to mock/import)

---

### Q3: Pre-fill Form with Candidate Data?

**Question:** Should the form pre-fill salary expectations from candidate profile if available?

**Consideration:** RIS doesn't specify, but UX could be improved.

**Recommendation:** **No pre-fill for v1.0**
- RIS Section 3.4 shows all fields starting empty/default
- Pre-fill adds complexity (profile data fetching)
- Can be added in v1.1 based on user feedback

---

### Q4: Show Profile Preview Before Submit?

**Question:** RIS mentions "ApplicationPreview" component - should we show candidate profile before submit?

**From RIS Section 3:** Component list includes `ApplicationPreview.tsx`

**Recommendation:** **Defer to v1.1**
- Not mentioned in state machine or required flows
- Adds complexity (profile data display)
- Simple form submission is sufficient for v1.0
- Can add as enhancement if users request

---

## 9. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Scope creep** (adding features not in RIS) | Medium | High | Strict adherence to RIS Section 3-5 only |
| **Integration issues** with ApplySection | Low | Medium | Existing code review shows clean interfaces |
| **Form validation edge cases** | Low | Low | Comprehensive unit tests in Phase 2 |
| **Accessibility gaps** | Low | Medium | Use shadcn Dialog (built-in a11y) |
| **State management bugs** | Medium | Medium | State machine tests + E2E coverage |

**Overall Risk Level:** **Low**

Rationale:
- Well-defined spec (RIS + BLS)
- Existing patterns to follow (LoginPromptModal, SaveJobButton)
- Deferred server action reduces complexity
- Strong test coverage plan

---

## 10. Dependencies

### External Dependencies

| Dependency | Purpose | Already Installed |
|------------|---------|-------------------|
| `shadcn/ui Dialog` | Modal wrapper | ✅ Yes |
| `shadcn/ui Form` | Form handling | ✅ Yes |
| `shadcn/ui Select` | Dropdown | ✅ Yes |
| `react-hook-form` | Form state | ✅ Yes (via shadcn) |
| `zod` | Validation | ✅ Yes |
| `sonner` | Toast notifications | ✅ Yes |

**Good News:** No new dependencies needed.

### Internal Dependencies

| Component | Status | Notes |
|-----------|--------|-------|
| ApplySection | ✅ Built | Needs minor update (replace alert) |
| JobDetailClient | ✅ Built | Add modal state |
| Job availability logic | ✅ Built | Already in JobDetailSidebar |
| Auth atoms | ✅ Built | sessionStateAtom, userAtom |
| Profile completion | ⚠️ Placeholder | Returns 0, needs real fetch (CAND-R01) |

**Blocker:** Profile completion check currently returns hardcoded `0`.
- **Impact:** "Incomplete" state won't show correctly
- **Workaround:** Keep placeholder for v1.0, fix when CAND-R01 is built
- **Note:** This doesn't block modal implementation

---

## 11. Comparison: Estimated vs Actual (JOB-R02 Reference)

**JOB-R02 Experience:**
- **Estimated:** 8-12 hours across 4 phases
- **Actual:** ~10.5 hours
- **Variance:** +5% (within estimate)

**JOB-R02b Estimate Confidence:**
- **Based on:** Simpler scope (no server component, no search logic)
- **Adjustment:** -30% from JOB-R02 estimate
- **Final:** 6-9 hours (0.75-1.1 days)
- **Confidence:** High (similar patterns, well-defined spec)

---

## 12. Implementation Checklist

### Pre-Implementation
- [x] Read JOB-R02b RIS document
- [x] Read BLS-03 Application document
- [x] Audit existing ApplySection code
- [x] Review job-applications schema
- [x] Create assessment document

### Phase 1: Component Structure
- [ ] Create `ApplyModal.tsx` shell
- [ ] Create `ApplyForm.tsx` layout
- [ ] Create `JobSummaryCard.tsx`
- [ ] Create `AvailabilitySelect.tsx`
- [ ] Create `FormActions.tsx`
- [ ] Update ApplySection to trigger modal
- [ ] Update JobDetailClient to render modal
- [ ] **Gate:** Modal opens/closes, form renders

### Phase 2: Form Logic
- [ ] Create `useApplyForm.ts` hook
- [ ] Create `useApplyModal.ts` hook
- [ ] Implement validation logic
- [ ] Add error message display
- [ ] Write 15 unit tests
- [ ] Write 5 integration tests
- [ ] **Gate:** All tests passing

### Phase 3: Submit + E2E
- [ ] Create `useApplicationSubmit.ts` (mock)
- [ ] Add toast notifications
- [ ] Add loading states
- [ ] Write 5 E2E tests
- [ ] **Gate:** E2E tests passing

### Phase 4: Polish
- [ ] Accessibility audit
- [ ] Character counter for headlines
- [ ] Error recovery flows
- [ ] Run Gate 1 (build)
- [ ] Run Gate 2 (lint)
- [ ] Manual browser testing
- [ ] **Gate:** All quality gates pass

### Completion
- [ ] Create PR with completion evidence
- [ ] Update todo list
- [ ] Report to PM/SA

---

## 13. Related Documents

| Document | Path | Purpose |
|----------|------|---------|
| **JOB-R02b RIS** | `docs/jobsmarket/RIS/JOB-R02b_apply-modal_RIS.md` | Primary specification |
| **BLS-03 Application** | `docs/jobsmarket/BLS/BLS-03_application.md` | Business logic |
| **JOB-R02 RIS** | `docs/jobsmarket/RIS/JOB-R02_job-detail_RIS.md` | Parent route |
| **JOB-R00 RIS** | `docs/jobsmarket/RIS/JOB-R00_cross-cutting_RIS.md` | Shared patterns |
| **Job Applications Schema** | `src/lib/database/schemas/job-applications.schema.ts` | Database schema |

---

## 14. Assessment Summary

### Key Findings

1. **70% Built:** ApplySection, auth flow, profile check already complete
2. **Clear Scope:** UI only, server action deferred to BLS-03
3. **Low Risk:** Well-defined spec, existing patterns, no new dependencies
4. **Fast Implementation:** 6-9 hours estimated (similar to JOB-R02 Phase 2)
5. **Test Coverage:** 25 tests planned (15 unit + 5 integration + 5 E2E)

### Recommendations

1. **Use Full Mock for v1.0:** Show demo toast, don't touch database
2. **Place in Shared Location:** `src/components/jobsmarket/jobs/`
3. **Follow shadcn Patterns:** Leverage Dialog, Form, Select components
4. **Defer Enhancements:** No profile preview, no pre-fill for v1.0
5. **Focus on Core Flow:** Modal open → form fill → validate → submit (mock) → close

### Open Questions for PM/SA

1. ~~**Server Action Scope:**~~ ✅ **Answered:** Deferred to BLS-03
2. ~~**Form Fields:**~~ ✅ **Answered:** Salary, availability, cover letter
3. **Profile Preview:** Defer to v1.1? **→ Need confirmation**
4. **Pre-fill Salary:** Skip for v1.0? **→ Need confirmation**

### Next Steps

Upon approval:
1. Begin Phase 1 implementation (component structure)
2. Follow TDD workflow (write tests first)
3. Run quality gates after each phase
4. Report completion with test evidence

---

*End of JOB-R02b Assessment*
