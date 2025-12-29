# COMP-R06 Assessment: Job Creation Wizard

**Route:** `/companies/[id]/dashboard/jobs/new`
**Assessment Date:** 2025-12-22
**Status:** Ready for SA Approval

---

## 1. Executive Summary

### Route Purpose
Multi-step wizard for creating new job postings with auto-save functionality, draft management, scheduled publishing, and rich text editing.

### Complexity Assessment
| Aspect | Rating | Justification |
|--------|--------|---------------|
| **Overall** | **High** | 4-step wizard, auto-save, rich text editor, form validation, state management |
| **Data Operations** | Medium | Create/update drafts, publish with date calculation |
| **UI Complexity** | High | Multi-step wizard, rich text editor, auto-save indicators, navigation guards |
| **State Management** | High | Wizard state, form state, auto-save state, validation errors |
| **Business Logic** | Medium | Field validation, conditional fields, status transitions |

### Implementation Estimate
- **Test Writing:** 6-8 hours (comprehensive coverage for all steps)
- **Implementation:** 8-10 hours (wizard, auto-save, rich text, validation)
- **Total:** 14-18 hours

---

## 2. Requirements Analysis

### 2.1 Specifications Review

**Primary Sources:**
- ✅ [COMP-R06_jobs-new_RIS.md](../RIS/COMP-R06_jobs-new_RIS.md) - Complete specification
- ✅ [BLS-07_job-management.md](../BLS/BLS-07_job-management.md) - Actions BLS-07-02, BLS-07-03

**Key Requirements:**
1. **4-Step Wizard:**
   - Step 1: Basic Information (title, type, level, salary, positions)
   - Step 2: Job Details (description, requirements, skills)
   - Step 3: Location (work mode, province, BTS)
   - Step 4: Review & Publish (preview + publish options)

2. **Auto-Save:**
   - Debounce: 1000ms after field blur
   - First save creates draft with `jobStatus: 'draft'`
   - Updates URL with `?draftId=xxx`
   - Shows last saved timestamp

3. **Publishing Options:**
   - Publish Now: `jobStatus: 'published'`, immediate visibility
   - Schedule: `jobStatus: 'ontimer'`, set future date
   - Save Draft: Keep as `draft`

4. **Features:**
   - Resume editing existing draft via `?draftId=xxx`
   - Duplicate from existing job via `?duplicateFrom=xxx`
   - Rich text editor for descriptions
   - Navigation guard for unsaved changes

### 2.2 User Flows (from RIS §6)

| Flow | Steps | Exit Point |
|------|-------|------------|
| **Create New Job** | Fresh form → Fill Step 1 → Step 2 → Step 3 → Review → Publish | Job list with success toast |
| **Resume Draft** | Load draft → Edit fields → Auto-save → Publish | Job list |
| **Duplicate Job** | Copy data → Edit as needed → Publish | Job list |
| **Schedule Future** | Complete form → Review → Schedule date → Submit | Job list with "scheduled" message |
| **Save as Draft** | Partial form → Save draft button | Job list |

### 2.3 Validation Requirements (RIS §8.1)

**Step 1 Validation:**
| Field | Rule | Error Message (Thai) |
|-------|------|---------------------|
| `title` | Required, 5-100 chars | กรุณากรอกชื่อตำแหน่งงาน (5-100 ตัวอักษร) |
| `jobType` | Required | กรุณาเลือกประเภทการจ้างงาน |
| `jobLevel` | Required | กรุณาเลือกระดับตำแหน่ง |
| `numberOfPosition` | Required, >= 1 | กรุณาระบุจำนวนตำแหน่งที่รับ |
| `maxSalary` | >= minSalary | เงินเดือนสูงสุดต้องมากกว่าต่ำสุด |

**Step 2 Validation:**
| Field | Rule | Error Message (Thai) |
|-------|------|---------------------|
| `jobDescriptionDetails` | Required, >= 50 chars | กรุณากรอกรายละเอียดงาน (อย่างน้อย 50 ตัวอักษร) |
| `skills` | Min 1 item | กรุณาระบุทักษะที่ต้องการอย่างน้อย 1 รายการ |

**Step 3 Validation:**
| Field | Rule | Error Message (Thai) |
|-------|------|---------------------|
| `workModel` | Required | กรุณาเลือกรูปแบบการทำงาน |
| `province` | Required if onsite/hybrid | กรุณาเลือกจังหวัด |

---

## 3. Technical Architecture

### 3.1 Route Structure

```
src/app/companies/[id]/dashboard/jobs/new/
├── page.tsx                          # Server component, auth check
└── _components/
    ├── JobWizardClient.tsx           # Main client component
    ├── WizardHeader.tsx              # Progress, back, save status
    ├── WizardNavigation.tsx          # Back/Next buttons
    ├── Step1BasicForm.tsx            # Basic info fields
    ├── Step2DetailsForm.tsx          # Description + skills
    ├── Step3LocationForm.tsx         # Location fields
    ├── Step4Review.tsx               # Preview + publish
    ├── PublishOptionsModal.tsx       # Publish/schedule/draft modal
    └── NavigationGuardModal.tsx      # Unsaved changes confirmation
```

### 3.2 Shared Components (to create)

```
src/components/jobsmarket/jobs/
├── forms/
│   ├── RichTextEditor.tsx           # Tiptap wrapper
│   ├── SkillsTagInput.tsx           # Tag-style skill input
│   └── LocationCascade.tsx          # Province/District/BTS
├── preview/
│   └── JobPreviewCard.tsx           # Candidate view preview
└── indicators/
    └── SaveIndicator.tsx            # Auto-save status
```

### 3.3 Hooks (to create)

```
src/hooks/jobsmarket/jobs/
├── use-job-wizard-form.ts           # Wizard state + form state
├── use-job-draft.ts                 # Draft create/update operations
├── use-job-publish.ts               # Publish/schedule actions
├── use-auto-save.ts                 # Debounced auto-save logic
└── use-navigation-guard.ts          # Unsaved changes detection
```

### 3.4 Server Actions (existing, to use)

From [src/lib/database/actions/jobs.ts](../../../src/lib/database/actions/jobs.ts):

```typescript
// ✅ BLS-07-02: Create draft
webJobCreate(payload: FirebaseJobData, actorId: string, uid?: string)

// ✅ BLS-07-03: Update draft
webJobUpdate(payload: FirebaseJobData, actorId: string, uid: string)

// ✅ BLS-07-05: Publish job
webJobPublish(uid: string)
```

**Missing Actions (need to implement):**
```typescript
// BLS-07-06: Schedule job (set jobStatus: 'ontimer', postStartDate)
webJobSchedule(uid: string, scheduledDate: Date)
```

### 3.5 Data Types (existing, to use)

From [src/types/jobsmarket/jobs-list.types.ts](../../../src/types/jobsmarket/jobs-list.types.ts):

```typescript
// ✅ JobStatus type
// ✅ JobListItem (for redirects)
```

**Missing Types (need to add):**
```typescript
// Job form data for wizard
interface JobFormData {
  // Step 1
  title: string;
  jobFunctionId?: number;
  jobFunctionText?: string;
  jobType: 'fulltime' | 'parttime' | 'contract' | 'internship';
  jobLevel: string;
  department?: string;
  minSalary?: number;
  maxSalary?: number;
  hideSalary: boolean;
  numberOfPosition: number;

  // Step 2
  jobDescriptionDetails: string;  // HTML
  jobDescriptionText: string;     // Plain text
  jobResponsibilitiesDetails?: string;
  jobResponsibilitiesText?: string;
  jobRequirementsDetails?: string;
  jobRequirementsText?: string;
  skills: string[];
  benefits?: string;

  // Step 3
  workModel: 'onsite' | 'hybrid' | 'remote';
  provinceId?: number;
  province?: string;
  districtId?: number;
  district?: string;
  btsStationId?: number;
  btsStation?: string;
  remotePercentage?: number;
  fullAddress?: string;
}

// Wizard state
type WizardStep = 1 | 2 | 3 | 4;
type AutoSaveState = 'idle' | 'dirty' | 'debouncing' | 'saving' | 'saved';

// Publish options
interface PublishOptions {
  mode: 'now' | 'schedule' | 'draft';
  scheduledDate?: Date;
}
```

---

## 4. Reusable Code Audit

### 4.1 Existing Server Actions ✅

| Action | File | Purpose | Status |
|--------|------|---------|--------|
| `webJobCreate` | `jobs.ts:43` | Create new draft | ✅ Ready to use |
| `webJobUpdate` | `jobs.ts:56` | Update draft | ✅ Ready to use |
| `webJobPublish` | `jobs.ts:82` | Publish job | ✅ Ready to use |
| `webJobGetById` | `jobs.ts:16` | Fetch draft/duplicate source | ✅ Ready to use |

### 4.2 Missing Functionality ⚠️

**Server Actions to Implement:**
1. `webJobSchedule(uid, scheduledDate)` - Set job to `ontimer` status with future date
   - Sets `jobStatus: 'ontimer'`
   - Sets `postStartDate: scheduledDate`
   - Sets `postExpiryDate: scheduledDate + 30 days`

**Rich Text Editor:**
- Need to integrate Tiptap or similar library
- Must generate both HTML (`jobDescriptionDetails`) and plain text (`jobDescriptionText`) versions

**Location Data:**
- Province list (static Thai provinces)
- District cascade (based on province)
- BTS/MRT station list (static or from Firestore)

### 4.3 Design System Components ✅

From [COMP-R05 implementation](../../../src/app/companies/[id]/dashboard/jobs/page.tsx):

```typescript
// ✅ Already using shadcn/ui components
- Button (Primary, Secondary, Outline variants)
- Input, Select, Checkbox
- Card, Badge
- Tabs
- Dialog/Modal
```

**New Components Needed:**
- Rich Text Editor (Tiptap)
- Tag Input (for skills)
- Date Picker (for scheduling)
- Progress Indicator (wizard steps)

---

## 5. State Management Strategy

### 5.1 Wizard State Machine (RIS §6.1)

```typescript
// Wizard states
type WizardState =
  | 'loading'          // Check for draft/duplicate
  | 'step_1_basic'
  | 'step_2_details'
  | 'step_3_location'
  | 'step_4_review'
  | 'publishing'       // Publishing/scheduling in progress
  | 'success';         // Complete, redirect to list

// Transitions
const wizardTransitions = {
  loading: ['step_1_basic'],
  step_1_basic: ['step_2_details'],
  step_2_details: ['step_1_basic', 'step_3_location'],
  step_3_location: ['step_2_details', 'step_4_review'],
  step_4_review: ['step_3_location', 'publishing'],
  publishing: ['success', 'step_4_review'], // success or error
  success: [], // terminal state
};
```

### 5.2 Auto-Save State Machine (RIS §6.2)

```typescript
type AutoSaveState = 'idle' | 'dirty' | 'debouncing' | 'saving' | 'saved';

// Auto-save flow
idle → (field change) → dirty → (blur) → debouncing → (1s) → saving → saved
                                  ↑                                      ↓
                                  └──────── (new change) ───────────────┘
```

**Implementation:**
```typescript
const debouncedSave = useDebouncedCallback(
  async (fieldName: string, value: any) => {
    if (!draftId) {
      // First save creates draft
      const newDraft = await webJobCreate({ ...formData, [fieldName]: value }, userId);
      router.replace(`?draftId=${newDraft}`, { shallow: true });
    } else {
      // Subsequent saves update draft
      await webJobUpdate({ [fieldName]: value }, userId, draftId);
    }
    setLastSaved(new Date());
  },
  1000
);
```

### 5.3 Form State

```typescript
interface WizardFormState {
  // Wizard control
  currentStep: WizardStep;
  isLoading: boolean;

  // Form data
  formData: JobFormData;
  errors: Record<string, string>;

  // Auto-save
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  draftId: string | null;

  // Publish modal
  publishModalOpen: boolean;
  publishOptions: PublishOptions | null;
}
```

---

## 6. Test Strategy

### 6.1 Unit Tests (90%+ coverage required)

**Test Files to Create:**
```
tests/unit/jobsmarket/companies/jobs/
├── use-job-wizard-form.test.ts
├── use-job-draft.test.ts
├── use-job-publish.test.ts
├── use-auto-save.test.ts
├── use-navigation-guard.test.ts
├── validation-utils.test.ts
└── rich-text-utils.test.ts
```

**Coverage Areas:**
1. **Wizard navigation:**
   - Next/back transitions
   - Step validation blocking
   - Jump to step from review

2. **Form validation:**
   - All required fields
   - Length validation (title 5-100, description >= 50)
   - Salary range validation (max >= min)
   - Conditional validation (province for onsite/hybrid)

3. **Auto-save:**
   - Debounce behavior
   - First save creates draft
   - Subsequent saves update
   - URL updates with draftId

4. **Rich text:**
   - HTML to plain text conversion
   - Minimum character validation
   - XSS prevention

### 6.2 Integration Tests

**Test File:**
```
tests/integration/jobsmarket/companies/jobs/
└── job-wizard-actions.test.ts
```

**Test Cases:**
1. Create draft via `webJobCreate`
2. Update draft via `webJobUpdate`
3. Publish job via `webJobPublish`
4. Schedule job via `webJobSchedule` (new)
5. Load existing draft
6. Duplicate job data copy

### 6.3 E2E Tests (Playwright)

**Test File:**
```
tests/e2e/jobsmarket/companies/jobs/
└── create-job.spec.ts
```

**Test Scenarios (from RIS §9.7):**

**Happy Path:**
1. ✅ Create new job from scratch
   - Fill all 4 steps
   - Validate auto-save indicator
   - Publish now
   - Verify redirect to jobs list

2. ✅ Schedule future publication
   - Complete form
   - Select schedule option
   - Pick future date
   - Verify `jobStatus: 'ontimer'`

3. ✅ Save as draft
   - Partial form (step 1-2 only)
   - Click "Save as Draft"
   - Verify redirect + draft in list

4. ✅ Resume editing draft
   - Navigate to `/new?draftId=xxx`
   - Verify form pre-filled
   - Edit and save
   - Verify updates persist

5. ✅ Duplicate existing job
   - Navigate to `/new?duplicateFrom=xxx`
   - Verify form pre-filled with copy
   - Edit title
   - Publish as new job

**Invalid Inputs:**
1. ❌ Submit step 1 with missing title
2. ❌ Submit step 1 with title < 5 chars
3. ❌ Submit step 1 with maxSalary < minSalary
4. ❌ Submit step 2 with description < 50 chars
5. ❌ Submit step 2 with no skills
6. ❌ Submit step 3 with onsite but no province
7. ❌ Schedule with past date

**Error States:**
1. ⚠️ Auto-save fails (network error)
2. ⚠️ Publish fails (validation error)
3. ⚠️ Draft not found (404)
4. ⚠️ Browser back with unsaved changes (navigation guard)

---

## 7. Implementation Risks

### 7.1 High-Risk Areas

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Rich Text Editor complexity** | High | Use battle-tested library (Tiptap), test thoroughly |
| **Auto-save race conditions** | Medium | Debounce + optimistic locking, test concurrent edits |
| **Form state loss on refresh** | High | Store draft ID in URL, resume from server |
| **Navigation guard edge cases** | Medium | Test browser back, tab close, session timeout |
| **Conditional validation** | Medium | Centralized validation logic, comprehensive tests |

### 7.2 Technical Decisions

| Decision | Option A | Option B | Chosen | Rationale |
|----------|----------|----------|--------|-----------|
| **Rich Text Editor** | Tiptap | Quill | **Tiptap** | React-first, extensible, modern |
| **Auto-save trigger** | onChange | onBlur | **onBlur + debounce** | Balance UX and API calls |
| **Draft storage** | URL only | URL + localStorage | **URL only** | Server is source of truth |
| **Wizard navigation** | Router-based | Client state | **Client state** | Faster, no unnecessary re-renders |
| **Publish date calculation** | Client | Server | **Server** | Consistent, timezone-safe |

### 7.3 External Dependencies

**New npm packages needed:**
```json
{
  "@tiptap/react": "^2.x",
  "@tiptap/starter-kit": "^2.x",
  "@tiptap/extension-placeholder": "^2.x",
  "react-day-picker": "^8.x"  // for date picker
}
```

---

## 8. Quality Gates Preparation

### 8.1 Gate 1: Build

**Potential Issues:**
- Missing `async` on server actions ✅ Already correct
- TypeScript errors from new types ⚠️ Need to add `JobFormData` types
- Import path errors ⚠️ Use absolute imports with `@/`

**Pre-flight Checks:**
```bash
# Add types first
# Then run build
npm run build
```

### 8.2 Gate 2: Lint

**Potential Issues:**
- Unused variables in wizard steps
- Missing dependency arrays in hooks

**Pre-flight Checks:**
```bash
npm run lint
```

### 8.3 Gate 3: Dev Server

**Manual Verification:**
1. Navigate to `/companies/[testCompanyId]/dashboard/jobs/new`
2. Verify wizard renders
3. Fill step 1, check auto-save
4. Progress through all steps
5. Check browser console for errors

### 8.4 Gate 4: Tests

**Coverage Target:** 90%+ for all new code

**Unit Tests:**
- All hooks (5 files)
- Validation utils
- Rich text utils

**Integration Tests:**
- Server action calls
- Draft create/update/publish

**E2E Tests:**
- All 5 happy paths
- All 7 invalid input cases
- All 4 error states

---

## 9. Test-First Implementation Plan

### Phase 1: Write Tests (RED) ⏱️ 6-8 hours

**Step 1:** Unit tests for hooks
```bash
tests/unit/jobsmarket/companies/jobs/
├── use-job-wizard-form.test.ts      # Wizard state, navigation
├── use-job-draft.test.ts            # Draft create/update
├── use-job-publish.test.ts          # Publish/schedule
├── use-auto-save.test.ts            # Debounce logic
└── use-navigation-guard.test.ts     # Unsaved changes
```

**Step 2:** Integration tests for server actions
```bash
tests/integration/jobsmarket/companies/jobs/
└── job-wizard-actions.test.ts       # Create, update, publish, schedule
```

**Step 3:** E2E test outlines
```bash
tests/e2e/jobsmarket/companies/jobs/
└── create-job.spec.ts               # All user flows
```

**Verification:**
- ✅ All tests FAIL (components don't exist yet)
- ✅ Gate 1 (Build) passes
- ✅ Gate 2 (Lint) passes

### Phase 2: Implementation (GREEN) ⏱️ 8-10 hours

**Step 1:** Server actions (if missing)
```typescript
// Add webJobSchedule action
src/lib/database/actions/jobs.ts
```

**Step 2:** Types
```typescript
// Add JobFormData, WizardStep, etc.
src/types/jobsmarket/job-wizard.types.ts
```

**Step 3:** Hooks (one at a time)
```typescript
src/hooks/jobsmarket/jobs/
├── use-job-wizard-form.ts
├── use-job-draft.ts
├── use-job-publish.ts
├── use-auto-save.ts
└── use-navigation-guard.ts
```

**Step 4:** Shared components
```typescript
src/components/jobsmarket/jobs/
├── forms/RichTextEditor.tsx
├── forms/SkillsTagInput.tsx
├── forms/LocationCascade.tsx
└── preview/JobPreviewCard.tsx
```

**Step 5:** Wizard components
```typescript
src/app/companies/[id]/dashboard/jobs/new/_components/
├── JobWizardClient.tsx
├── WizardHeader.tsx
├── Step1BasicForm.tsx
├── Step2DetailsForm.tsx
├── Step3LocationForm.tsx
├── Step4Review.tsx
└── PublishOptionsModal.tsx
```

**Step 6:** Page
```typescript
src/app/companies/[id]/dashboard/jobs/new/page.tsx
```

**Run tests after each component:**
```bash
npm run test:unit -- use-job-wizard-form
npm run test:unit -- use-job-draft
# etc.
```

### Phase 3: Verify All Gates ⏱️ 1-2 hours

```bash
# Gate 1: Build
npm run build

# Gate 2: Lint
npm run lint

# Gate 3: Dev Server
npm run dev
# Visit /companies/[id]/dashboard/jobs/new in browser

# Gate 4a: Unit Tests
npm run test:unit -- --coverage
# Verify ≥ 90% coverage

# Gate 4b: Integration Tests (if applicable)
npx vitest run --config vitest.integration.config.ts

# Gate 4c: E2E Tests
npx playwright test tests/e2e/jobsmarket/companies/jobs/create-job.spec.ts --project=chromium
```

---

## 10. Dependencies & Blockers

### 10.1 Prerequisites

**Must exist before starting:**
- ✅ Company shell (COMP-R00)
- ✅ Jobs list page (COMP-R05) - for redirect target
- ✅ Server actions: `webJobCreate`, `webJobUpdate`, `webJobPublish`

**Must implement during:**
- ⚠️ `webJobSchedule` server action (new)
- ⚠️ Rich text editor component
- ⚠️ Province/district/BTS data source

### 10.2 Unblocked Routes

After COMP-R06 is complete, can implement:
- COMP-R07: Job detail/edit page (uses same form components)
- COMP-R08: Job applications list (jobs are published)

---

## 11. Success Criteria

### 11.1 Functional Requirements ✅

- [ ] All 4 wizard steps functional
- [ ] Auto-save creates/updates draft every 1s after blur
- [ ] Resume draft from `?draftId=xxx`
- [ ] Duplicate job from `?duplicateFrom=xxx`
- [ ] Publish now → `jobStatus: 'published'`
- [ ] Schedule → `jobStatus: 'ontimer'` with future date
- [ ] Save draft → `jobStatus: 'draft'`
- [ ] Navigation guard on unsaved changes
- [ ] Rich text editor with HTML + plain text output

### 11.2 Quality Gates ✅

- [ ] Gate 1: Build passes (0 errors)
- [ ] Gate 2: Lint passes (0 errors)
- [ ] Gate 3: Dev server + browser (no console errors)
- [ ] Gate 4a: Unit tests pass with ≥ 90% coverage
- [ ] Gate 4b: Integration tests pass (if applicable)
- [ ] Gate 4c: E2E tests pass (all RIS flows covered)

### 11.3 Test Coverage ✅

- [ ] Unit: 5 hooks, validation utils, rich text utils
- [ ] Integration: Create, update, publish, schedule actions
- [ ] E2E: 5 happy paths, 7 invalid inputs, 4 error states

---

## 12. Open Questions for SA

### 12.1 Rich Text Editor

**Q1:** Which rich text editor library do you prefer?
- **Option A:** Tiptap (modern, React-first, extensible)
- **Option B:** Quill (battle-tested, simpler)
- **Option C:** Draft.js (Facebook, older)

**Recommendation:** Tiptap - best React integration, modern, well-maintained

### 12.2 Province/District/BTS Data

**Q2:** Where should location data come from?
- **Option A:** Static JSON file in `/public/data/`
- **Option B:** Firestore collection
- **Option C:** External API

**Recommendation:** Static JSON for provinces/districts, Firestore for BTS stations (may change)

### 12.3 Auto-Save UX

**Q3:** Should auto-save be:
- **Option A:** Silent (only show timestamp)
- **Option B:** Show toast on each save
- **Option C:** Show inline indicator only

**Recommendation:** Option C (inline indicator) - less intrusive, clear feedback

### 12.4 Draft Expiry

**Q4:** Should drafts auto-delete after N days of inactivity?
- **Option A:** Yes, delete after 30 days
- **Option B:** No, keep forever
- **Option C:** Mark as "stale" but don't delete

**Recommendation:** Option A (30 days) - prevent clutter, align with job expiry

---

## 13. Approval Checklist

Before proceeding to Phase 1 (tests), SA must approve:

- [ ] Architecture decisions (§3)
- [ ] State management strategy (§5)
- [ ] Test strategy (§6)
- [ ] Implementation plan (§9)
- [ ] Answers to open questions (§12)

**SA Approval:**
- Date: _____________
- Approved by: _____________
- Notes: _____________

---

**Assessment Status:** ✅ Ready for SA Review

**Next Steps:**
1. SA reviews and approves
2. Answer open questions (§12)
3. Begin Phase 1: Write tests (TDD RED)
4. Proceed to Phase 2: Implementation (TDD GREEN)
5. Verify all gates (Phase 3)
