# CAND-R02 Implementation Plan: Candidate Profile (Onboarding + Edit)

**Route:** `/candidates/[id]/profile`
**RIS Document:** `docs/jobsmarket/RIS/CAND-R02_profile_RIS.md`
**Cross-Cutting:** `docs/jobsmarket/RIS/CAND-R00_cross-cutting_RIS.md`
**Created:** 2025-12-15
**Status:** Awaiting Approval

---

## 0. Critical Architecture Rule ⚠️

### ❌ DO NOT Create `/api/` Routes for Jobsmarket

**Rule:** Use **Server Actions ONLY** - No API routes.

| ❌ WRONG | ✅ CORRECT |
|---------|-----------|
| `fetch('/api/profile/...')` | Server action imports |
| Create new API route | Use existing server actions |

**Existing Server Actions to REUSE:**
- ✅ `webCandidateInformationGetById(uid)` - Fetch candidate profile
- ✅ `webCandidateInformationUpdate(payload, actorId, uid)` - Update candidate
- ✅ `webCandidatePreferenceGetById(uid)` - Fetch job preferences
- ✅ `webCandidatePreferenceUpdate(payload, actorId, uid)` - Update preferences

**New Server Actions REQUIRED:**
- ❌ **NONE** - All required database operations available via existing server actions
- File upload will use Firebase Storage SDK directly (client-side)

---

## 1. Executive Summary

### 1.1 Purpose
Implement candidate profile page with dual-mode functionality:
1. **Onboarding Mode** - 5-step wizard for new users (`isOnboarded: false`)
2. **Profile Mode** - Inline-edit sections for existing users (`isOnboarded: true`)

This is the **highest complexity** route in the Candidate domain, requiring:
- Conditional page mode detection
- Multi-step wizard with validation
- Array field CRUD (work, education, skills, languages)
- File uploads (documents, profile photo)
- Form validation across 10+ sections
- Profile completion calculation
- State machine implementation

### 1.2 Scope

**In Scope:**
- ✅ Page mode auto-detection via `isOnboarded` flag
- ✅ Onboarding wizard (5 steps, ALL required, no skipping)
- ✅ Profile view with inline-edit pattern (7 sections)
- ✅ Edit drawers for each section
- ✅ Array CRUD (work experience, education, skills, languages, licenses)
- ✅ Fresh graduate toggle (replaces work experience requirement)
- ✅ Skills combobox (select from master OR enter new)
- ✅ File upload (documents, profile photo)
- ✅ Profile completion percentage
- ✅ Preview modal (read-only profile view)
- ✅ PDF export from preview
- ✅ `isSearchable` toggle (profile visibility)
- ✅ Mobile responsive

**Out of Scope (Future):**
- ❌ Resume parsing (upload PDF to auto-fill)
- ❌ LinkedIn import
- ❌ Profile analytics (views, search appearances)
- ❌ AI-powered profile suggestions

### 1.3 Complexity: HIGH

**Estimated Effort:** 40-50 hours total

| Phase | Effort | Tasks |
|-------|--------|-------|
| Foundation | 4h | Route setup, mode detection, auth checks |
| Onboarding Wizard | 16h | 5 steps × 3h each + navigation |
| Profile View | 8h | 7 sections × 1h each |
| Edit Drawers | 12h | 7 drawers × 1.5h each + validation |
| Preview & Export | 4h | Modal, PDF generation |
| Tests | 12h | Unit (20+), Integration (10+), E2E (6+) |
| Polish | 4h | Loading, empty states, mobile |

**Critical Success Factors:**
1. Clean separation between onboarding and profile modes
2. All 5 wizard steps must be completed (no skipping)
3. Fresh graduate toggle must clear work experience when enabled
4. Profile completion % must match RIS Appendix C calculation
5. All array fields (work, education, skills) must support full CRUD

### 1.4 Design Supersession Notice

⚠️ **IMPORTANT:** This RIS **SUPERSEDES** the original 5-tab design in `04-candidate-routes.md` Section 5.2

| Aspect | Original Spec | Revised Design (This RIS) |
|--------|---------------|---------------------------|
| **Structure** | 5 tabs | Single scrollable page with inline-edit |
| **Onboarding** | Tab (skippable steps 3-5) | Page mode (ALL 5 steps required) |
| **Preview** | Tab | Modal/Drawer |
| **Editing** | Tab content forms | Inline section editing |

**Rationale:** Industry standard (LinkedIn, Indeed), lower cognitive load, blocking onboarding flow.

---

## 2. Requirements Analysis

### 2.1 Key Findings from RIS

**Page Mode Automaton (RIS §6.1 - CRITICAL):**

```
                    ┌─────────────────────────┐
                    │        loading          │
                    └───────────┬─────────────┘
              AUTH_SUCCESS      │       AUTH_FAILED
                    ┌───────────┴───────────────────┐
                    ▼                               ▼
        ┌───────────────────────┐         ┌─────────────────┐
        │  checking_onboarded   │         │   unauthorized  │
        └───────────┬───────────┘         └─────────────────┘
 isOnboarded=false  │  isOnboarded=true
      ┌─────────────┴─────────────┐
      ▼                           ▼
┌───────────────────────┐   ┌───────────────────────┐
│   onboarding_mode     │   │     profile_mode      │
└───────────┬───────────┘   └───────────┬───────────┘
            │ WIZARD_COMPLETE           │ OPEN_PREVIEW
            ▼                           ▼
┌───────────────────────┐   ┌───────────────────────┐
│     redirecting       │   │  preview_modal_open   │
└───────────┬───────────┘   └───────────────────────┘
            │
            ▼
    /candidates/[id]
```

**Onboarding Wizard Steps (RIS §6.2 - ALL REQUIRED):**

| Step | Section | Required Fields | Validation |
|------|---------|-----------------|------------|
| 1 | Personal Info | first_name, last_name, phone, email, birthdate, province | See RIS §8.1 |
| 2 | Work Experience | ≥1 work entry OR `is_fresh_graduate: true` | See RIS §8.2 |
| 3 | Education | Exactly 1 entry (highest level) | See RIS §8.3 |
| 4 | Skills | ≥1 skill | See RIS §8.4 |
| 5 | Job Preferences | job_types[], positions[], salary_range, locations[], availability | See RIS §8.5 |

**Fresh Graduate Toggle (RIS §6.3):**

| State | Work Entries | Toggle Behavior |
|-------|--------------|-----------------|
| `has_experience` (entries > 0) | 2 entries | Show confirm dialog "This will clear your work history" |
| `has_experience` (entries = 0) | 0 entries | Toggle immediately to `is_fresh_grad` |
| `is_fresh_grad` | 0 entries | Toggle back to `has_experience` |
| `is_fresh_grad` | Add work entry | Auto-toggle to `has_experience`, disable fresh grad |

**Profile Sections (Profile Mode):**

| Section | Editable | Data Source | Edit Pattern |
|---------|----------|-------------|--------------|
| Personal Info | ✅ | candidate_information | Drawer form |
| Work Experience | ✅ | candidate_information.works[] | Array CRUD drawer |
| Education | ✅ | candidate_information.educations[] | Array CRUD drawer |
| Skills & Languages | ✅ | candidate_information.skills[], languages[] | Multi-array drawer |
| About Me | ✅ | candidate_information.about_me, area_of_expertise | Drawer form |
| Job Preferences | ✅ | candidate_preference | Drawer form |
| Documents | ✅ | candidate_information.documents[] | Upload/delete inline |

**Profile Completion Calculation (RIS Appendix C, CAND-R00 §9):**

| Section | Weight | Requirement |
|---------|--------|-------------|
| Personal Info | 20% | name, email, phone, birthdate, address |
| Work Experience | 20% | ≥1 work OR fresh_graduate |
| Education | 15% | ≥1 education |
| Skills | 15% | ≥1 skill |
| Job Preferences | 20% | All required preference fields |
| About Me | 5% | about_me text present |
| Documents | 5% | ≥1 document uploaded |

**Array Limits (RIS §6.6):**

| Array | MIN | MAX |
|-------|-----|-----|
| Work Experience | 0 (or fresh_graduate) | 20 |
| Education | 1 | 10 |
| Skills | 1 | 50 |
| Languages | 0 | 10 |
| Documents | 0 | 5 |

**File Upload Rules (RIS §6.8):**

| Rule | Value |
|------|-------|
| Max size | 10MB |
| Allowed types | PDF, DOC, DOCX |
| Storage path | `candidates/{uid}/documents/{filename}` |
| Validation | Client-side size/type check before upload |

### 2.2 Data Contract

**Read Operations:**

| Operation | Source Collection | Purpose | Cache Key |
|-----------|------------------|---------|-----------|
| `webCandidateInformationGetById(uid)` | `candidate_information` | Load profile | `candidate-${uid}` |
| `webCandidatePreferenceGetById(uid)` | `candidate_preference` | Load preferences | `candidate-preference-${uid}` |

**Write Operations:**

| Operation | Target | Trigger | Invalidates |
|-----------|--------|---------|-------------|
| `webCandidateInformationUpdate()` | `candidate_information` | Save any section | `candidate-${uid}`, `candidate-dashboard-${uid}` |
| `webCandidatePreferenceUpdate()` | `candidate_preference` | Save step 5 / preferences | `candidate-preference-${uid}`, `candidate-${uid}` |
| Set `isOnboarded: true` | `candidate_information.is_onboarded`, `user_info.is_onboarded` | Complete wizard | All candidate keys |

**Master Data (Optional - for dropdowns):**

| Data | Usage | Priority |
|------|-------|----------|
| Provinces | Address dropdown | P0 (required) |
| Education Levels | Education form | P0 (required) |
| Job Types | Preferences | P0 (required) |
| Skills | Combobox suggestions | P1 (nice-to-have) |
| Job Functions | Preferences | P1 (nice-to-have) |

**Note:** Master data can be hardcoded initially, then replaced with API calls in future iterations.

### 2.3 State Management

**Atoms to Use:**

| Atom | Purpose | Read | Write | Source |
|------|---------|------|-------|--------|
| `candidateAtom` | Current profile | ✅ | ✅ | `@/store/jobsmarket/global-atoms` |
| `userAtom` | Current user | ✅ | ❌ | `@/store/jobsmarket/global-atoms` |
| `activeRoleAtom` | Role context | ✅ | ✅ | `@/store/jobsmarket/global-atoms` |
| `sessionStateAtom` | Session validity | ✅ | ❌ | `@/store/jobsmarket/global-atoms` |
| `authenticatedUserIdAtom` | Current user ID | ✅ | ❌ | `@/store/jobsmarket/global-atoms` |

**New Atoms Needed:**

| Atom | Type | Purpose | Location |
|------|------|---------|----------|
| `candidateProfileDraftAtom` | `Partial<FirebaseCandidateData>` | Draft state during editing | `@/store/jobsmarket/candidate-atoms` |
| `candidatePreferenceDraftAtom` | `Partial<candidatePreferences>` | Preferences draft | `@/store/jobsmarket/candidate-atoms` |
| `onboardingStepAtom` | `1 | 2 | 3 | 4 | 5` | Current wizard step | `@/store/jobsmarket/candidate-atoms` |
| `profileEditModeAtom` | `null | 'personal' | 'work' | ...` | Active edit drawer | `@/store/jobsmarket/candidate-atoms` |

**Hooks to Reuse:**

| Hook | Purpose | From |
|------|---------|------|
| `useCandidateAuth` | Auth + ownership checks | `@/hooks/jobsmarket/use-candidate-auth` |
| `useProfileCompletion` | Calculate completion % | `@/hooks/jobsmarket/use-profile-completion` |

**New Hooks Needed:**

| Hook | Purpose | Returns |
|------|---------|---------|
| `useOnboardingValidation` | Validate each wizard step | `{ isValid, errors, canProceed }` |
| `useArrayFieldManager` | CRUD for work/education/skills | `{ items, add, edit, delete, validate }` |
| `useFormDirtyCheck` | Track unsaved changes | `{ isDirty, reset }` |

**SWR Keys:**

| Key Pattern | Usage |
|-------------|-------|
| `candidate-${uid}` | Profile data |
| `candidate-preference-${uid}` | Job preferences |
| `candidate-dashboard-${uid}` | Dashboard (invalidate on save) |

### 2.4 Component Reuse Assessment

**Components to REUSE:**

| Component | From | Usage |
|-----------|------|-------|
| `CandidateShell` | `@/components/jobsmarket/shells/CandidateShell` | Layout wrapper |
| `Button` | `@/components/ui/button` | All buttons |
| `Input` | `@/components/ui/input` | Text fields |
| `Select` | `@/components/ui/select` | Dropdowns |
| `Textarea` | `@/components/ui/textarea` | Multi-line text |
| `Checkbox` | `@/components/ui/checkbox` | Fresh graduate toggle, etc. |
| `Dialog` | `@/components/ui/dialog` | Confirm dialogs |
| `Sheet` | `@/components/ui/sheet` | Edit drawers |
| `Card` | `@/components/ui/card` | Section containers |

**Components to CREATE:**

| Component | Purpose | Location |
|-----------|---------|----------|
| `ProfilePageClient` | Client wrapper, mode detection | `/app/jobsmarket/candidates/[id]/profile/_components/` |
| `OnboardingWizard` | 5-step wizard container | `/app/jobsmarket/candidates/[id]/profile/_components/` |
| `WizardStepIndicator` | Progress indicator (1/5, 2/5...) | `/app/jobsmarket/candidates/[id]/profile/_components/` |
| `Step1PersonalInfo` | Step 1 form | `/app/jobsmarket/candidates/[id]/profile/_components/wizard/` |
| `Step2WorkExperience` | Step 2 form + fresh grad toggle | `/app/jobsmarket/candidates/[id]/profile/_components/wizard/` |
| `Step3Education` | Step 3 form | `/app/jobsmarket/candidates/[id]/profile/_components/wizard/` |
| `Step4Skills` | Step 4 form + combobox | `/app/jobsmarket/candidates/[id]/profile/_components/wizard/` |
| `Step5JobPreferences` | Step 5 form | `/app/jobsmarket/candidates/[id]/profile/_components/wizard/` |
| `ProfileView` | Profile mode container | `/app/jobsmarket/candidates/[id]/profile/_components/` |
| `ProfileHeader` | Avatar, name, completion % | `/app/jobsmarket/candidates/[id]/profile/_components/` |
| `PersonalInfoSection` | View + edit drawer | `/app/jobsmarket/candidates/[id]/profile/_components/sections/` |
| `WorkExperienceSection` | View + array CRUD | `/app/jobsmarket/candidates/[id]/profile/_components/sections/` |
| `EducationSection` | View + array CRUD | `/app/jobsmarket/candidates/[id]/profile/_components/sections/` |
| `SkillsSection` | View + multi-array edit | `/app/jobsmarket/candidates/[id]/profile/_components/sections/` |
| `JobPreferencesSection` | View + edit drawer | `/app/jobsmarket/candidates/[id]/profile/_components/sections/` |
| `AboutMeSection` | View + edit drawer | `/app/jobsmarket/candidates/[id]/profile/_components/sections/` |
| `DocumentsSection` | Upload + list + delete | `/app/jobsmarket/candidates/[id]/profile/_components/sections/` |
| `PreviewModal` | Read-only profile view | `/app/jobsmarket/candidates/[id]/profile/_components/` |
| `EditDrawer` | Generic edit drawer base | `/components/jobsmarket/profile/` |
| `ArrayFieldManager` | Generic array CRUD UI | `/components/jobsmarket/profile/` |
| `WorkExperienceForm` | Add/edit work entry | `/components/jobsmarket/profile/forms/` |
| `EducationForm` | Add/edit education | `/components/jobsmarket/profile/forms/` |
| `SkillCombobox` | Skills autocomplete | `/components/jobsmarket/profile/forms/` |

---

## 3. Implementation Plan

### 3.1 File Structure

```
src/
├── app/
│   └── jobsmarket/
│       └── candidates/
│           └── [id]/
│               └── profile/
│                   ├── page.tsx                         # Server component wrapper
│                   └── _components/
│                       ├── ProfilePageClient.tsx       # Client root, mode detection
│                       ├── OnboardingWizard.tsx        # Wizard container
│                       ├── WizardStepIndicator.tsx     # Progress UI
│                       ├── ProfileView.tsx             # Profile mode container
│                       ├── ProfileHeader.tsx           # Avatar, completion %
│                       ├── PreviewModal.tsx            # Read-only preview
│                       ├── wizard/
│                       │   ├── Step1PersonalInfo.tsx
│                       │   ├── Step2WorkExperience.tsx
│                       │   ├── Step3Education.tsx
│                       │   ├── Step4Skills.tsx
│                       │   └── Step5JobPreferences.tsx
│                       └── sections/
│                           ├── PersonalInfoSection.tsx
│                           ├── WorkExperienceSection.tsx
│                           ├── EducationSection.tsx
│                           ├── SkillsSection.tsx
│                           ├── JobPreferencesSection.tsx
│                           ├── AboutMeSection.tsx
│                           └── DocumentsSection.tsx
├── components/
│   └── jobsmarket/
│       └── profile/
│           ├── EditDrawer.tsx                  # Generic drawer base
│           ├── ArrayFieldManager.tsx           # Generic array CRUD
│           └── forms/
│               ├── WorkExperienceForm.tsx
│               ├── EducationForm.tsx
│               ├── SkillCombobox.tsx
│               └── LanguageForm.tsx
├── hooks/
│   └── jobsmarket/
│       ├── use-onboarding-validation.ts
│       ├── use-array-field-manager.ts
│       └── use-form-dirty-check.ts
├── store/
│   └── jobsmarket/
│       └── candidate-atoms.ts                  # New atoms
└── lib/
    └── validations/
        └── candidates/
            ├── personal-info-validation.ts
            ├── work-experience-validation.ts
            ├── education-validation.ts
            ├── skills-validation.ts           # EXISTS (reuse)
            ├── languages-validation.ts        # EXISTS (reuse)
            ├── licenses-validation.ts         # EXISTS (reuse)
            └── job-preferences-validation.ts

tests/
├── unit/
│   └── jobsmarket/
│       └── candidates/
│           └── profile/
│               ├── onboarding-wizard.test.ts
│               ├── profile-sections.test.ts
│               ├── array-field-manager.test.ts
│               ├── profile-completion.test.ts
│               └── validation.test.ts
├── integration/
│   └── jobsmarket/
│       └── candidates/
│           └── profile/
│               ├── onboarding-flow.test.ts
│               ├── profile-save.test.ts
│               ├── fresh-graduate-toggle.test.ts
│               └── file-upload.test.ts
└── e2e/
    └── jobsmarket/
        └── candidates/
            └── profile/
                ├── onboarding-wizard.spec.ts
                ├── profile-edit.spec.ts
                ├── array-crud.spec.ts
                ├── preview-export.spec.ts
                └── mobile.spec.ts
```

### 3.2 Implementation Phases

**Phase 1: Foundation (4h)**

- [ ] 1.1 Route setup (`page.tsx`) with candidateId extraction
- [ ] 1.2 `ProfilePageClient` with auth checks using `useCandidateAuth`
- [ ] 1.3 Mode detection logic (`isOnboarded` flag check)
- [ ] 1.4 Create new atoms in `candidate-atoms.ts`
- [ ] 1.5 SWR setup for fetching candidate + preference data

**Phase 2: Onboarding Mode (16h)**

**Batch 2A: Wizard Container (2h)**
- [ ] 2A.1 `OnboardingWizard` container component
- [ ] 2A.2 `WizardStepIndicator` (1/5 → 2/5 → ... → 5/5)
- [ ] 2A.3 Navigation buttons (Back, Next, Finish)
- [ ] 2A.4 Step state management via `onboardingStepAtom`

**Batch 2B: Step 1 - Personal Info (3h)**
- [ ] 2B.1 `Step1PersonalInfo` form component
- [ ] 2B.2 Validation schema (`personal-info-validation.ts`)
- [ ] 2B.3 Province dropdown (hardcoded or master data)
- [ ] 2B.4 Birthdate picker with age ≥18 validation
- [ ] 2B.5 Next button enabled when valid

**Batch 2C: Step 2 - Work Experience (4h)**
- [ ] 2C.1 `Step2WorkExperience` form component
- [ ] 2C.2 Fresh graduate toggle with confirm dialog
- [ ] 2C.3 `WorkExperienceForm` for add/edit
- [ ] 2C.4 Array CRUD (add, edit, delete)
- [ ] 2C.5 Validation: ≥1 work OR fresh_graduate
- [ ] 2C.6 Current job toggle (only one can be current)

**Batch 2D: Step 3 - Education (3h)**
- [ ] 2D.1 `Step3Education` form component
- [ ] 2D.2 `EducationForm` for single entry
- [ ] 2D.3 Education level dropdown (master data)
- [ ] 2D.4 Validation: exactly 1 entry (highest level)
- [ ] 2D.5 GPA validation (0.00-4.00)

**Batch 2E: Step 4 - Skills (3h)**
- [ ] 2E.1 `Step4Skills` form component
- [ ] 2E.2 `SkillCombobox` (select OR enter new)
- [ ] 2E.3 Skills array display with tags
- [ ] 2E.4 Language array (optional)
- [ ] 2E.5 Validation: ≥1 skill

**Batch 2F: Step 5 - Job Preferences (3h)**
- [ ] 2F.1 `Step5JobPreferences` form component
- [ ] 2F.2 Job types multi-select (≥1)
- [ ] 2F.3 Positions array (≥1)
- [ ] 2F.4 Salary range (min ≤ max)
- [ ] 2F.5 Locations multi-select (≥1)
- [ ] 2F.6 Availability dropdown
- [ ] 2F.7 Finish button → `setIsOnboarded(true)` → redirect to dashboard

**Gate Check:** Run build, lint, dev server, all tests after Phase 2

**Phase 3: Profile Mode (8h)**

**Batch 3A: Profile Header (2h)**
- [ ] 3A.1 `ProfileHeader` component
- [ ] 3A.2 Avatar display + edit button
- [ ] 3A.3 Profile completion ring (from `useProfileCompletion`)
- [ ] 3A.4 Preview button → opens `PreviewModal`
- [ ] 3A.5 `isSearchable` toggle

**Batch 3B: Profile Sections - View Only (6h)**
- [ ] 3B.1 `ProfileView` container
- [ ] 3B.2 `PersonalInfoSection` (view mode)
- [ ] 3B.3 `WorkExperienceSection` (view mode with list)
- [ ] 3B.4 `EducationSection` (view mode with list)
- [ ] 3B.5 `SkillsSection` (view mode with tags)
- [ ] 3B.6 `JobPreferencesSection` (view mode summary)
- [ ] 3B.7 `AboutMeSection` (view mode)
- [ ] 3B.8 `DocumentsSection` (list with delete)
- [ ] 3B.9 Edit button on each section

**Gate Check:** Run build, lint, dev server after Phase 3

**Phase 4: Edit Drawers (12h)**

**Batch 4A: Generic Components (3h)**
- [ ] 4A.1 `EditDrawer` base component (Sheet wrapper)
- [ ] 4A.2 `ArrayFieldManager` generic CRUD UI
- [ ] 4A.3 Dirty state tracking (`useFormDirtyCheck`)
- [ ] 4A.4 Discard confirmation dialog

**Batch 4B: Personal Info Edit (2h)**
- [ ] 4B.1 Personal info edit drawer
- [ ] 4B.2 Form with same fields as Step 1
- [ ] 4B.3 Save → update candidate_information
- [ ] 4B.4 Invalidate SWR cache

**Batch 4C: Work Experience Edit (3h)**
- [ ] 4C.1 Work experience edit drawer
- [ ] 4C.2 Reuse `WorkExperienceForm`
- [ ] 4C.3 Array CRUD (add, edit, delete)
- [ ] 4C.4 Fresh graduate toggle (with confirm if clearing entries)
- [ ] 4C.5 Save → update works array

**Batch 4D: Education Edit (2h)**
- [ ] 4D.1 Education edit drawer
- [ ] 4D.2 Reuse `EducationForm`
- [ ] 4D.3 Array CRUD
- [ ] 4D.4 Save → update educations array

**Batch 4E: Skills Edit (2h)**
- [ ] 4E.1 Skills edit drawer
- [ ] 4E.2 Reuse `SkillCombobox`
- [ ] 4E.3 Multi-array edit (skills + languages)
- [ ] 4E.4 Save → update both arrays

**Batch 4F: Job Preferences Edit (2h)**
- [ ] 4F.1 Job preferences edit drawer
- [ ] 4F.2 Reuse Step 5 form
- [ ] 4F.3 Save → update candidate_preference collection

**Batch 4G: About Me Edit (1h)**
- [ ] 4G.1 About me edit drawer
- [ ] 4G.2 Textarea for about_me, area_of_expertise, achievement
- [ ] 4G.3 Save → update candidate_information

**Gate Check:** Run all gates after Phase 4

**Phase 5: Preview & Export (4h)**

- [ ] 5.1 `PreviewModal` component (read-only view)
- [ ] 5.2 Print functionality (`window.print()`)
- [ ] 5.3 PDF export (use library like `html2pdf` or `jsPDF`)
- [ ] 5.4 Format preview in resume-like layout

**Phase 6: File Upload (4h)**

- [ ] 6.1 Document upload component (file input)
- [ ] 6.2 File validation (size ≤10MB, type PDF/DOC)
- [ ] 6.3 Upload progress indicator
- [ ] 6.4 Firebase Storage integration
- [ ] 6.5 Save document metadata to candidate_information.documents[]
- [ ] 6.6 Delete functionality
- [ ] 6.7 Avatar upload (separate or reuse)

**Phase 7: Tests (12h)**

**Batch 7A: Unit Tests (4h)**
- [ ] 7A.1 Onboarding wizard navigation tests
- [ ] 7A.2 Profile sections rendering tests
- [ ] 7A.3 Array field manager tests (add, edit, delete)
- [ ] 7A.4 Profile completion calculation tests
- [ ] 7A.5 Validation schema tests (5 steps)
- [ ] 7A.6 Fresh graduate toggle logic tests
- [ ] 7A.7 Skill combobox tests

**Batch 7B: Integration Tests (4h)**
- [ ] 7B.1 Onboarding flow end-to-end (step 1 → 5)
- [ ] 7B.2 Profile save operations (with real server actions)
- [ ] 7B.3 Fresh graduate toggle clearing work history
- [ ] 7B.4 File upload flow
- [ ] 7B.5 Cache invalidation tests
- [ ] 7B.6 `isOnboarded` flag update on completion

**Batch 7C: E2E Tests (4h)**
- [ ] 7C.1 Complete onboarding wizard (Playwright)
- [ ] 7C.2 Edit profile sections (Playwright)
- [ ] 7C.3 Add/edit/delete work experience (Playwright)
- [ ] 7C.4 Preview and export PDF (Playwright)
- [ ] 7C.5 File upload (Playwright)
- [ ] 7C.6 Mobile responsive tests (Playwright)

**Gate Check:** Run all 4 gates after Phase 7

**Phase 8: Polish (4h)**

- [ ] 8.1 Loading states (skeleton screens)
- [ ] 8.2 Empty states (no work experience, no skills, etc.)
- [ ] 8.3 Error states (save failed, upload failed)
- [ ] 8.4 Mobile responsive refinements
- [ ] 8.5 Thai localization review (all copy from RIS)
- [ ] 8.6 Accessibility (keyboard nav, screen reader)
- [ ] 8.7 Performance optimization (lazy load sections)

**Final Gate Check:** All 4 gates must pass

---

## 4. Validation Rules Summary

### Step 1: Personal Information

| Field | Rule | Error Message (Thai) |
|-------|------|----------------------|
| `first_name_th` | Required, 1-100 chars | กรุณากรอกชื่อ |
| `last_name_th` | Required, 1-100 chars | กรุณากรอกนามสกุล |
| `email` | Required, valid format | กรุณากรอกอีเมลที่ถูกต้อง |
| `phone` | Required, 10 digits, starts with 0 | กรุณากรอกเบอร์โทรศัพท์ 10 หลัก |
| `birthdate` | Required, age ≥18 | ต้องมีอายุ 18 ปีขึ้นไป |
| `province` | Required | กรุณาเลือกจังหวัด |

### Step 2: Work Experience

| Field | Rule | Error Message (Thai) |
|-------|------|----------------------|
| `works[]` | ≥1 entry OR `is_fresh_graduate=true` | กรุณาเพิ่มประสบการณ์ หรือเลือกนักศึกษาจบใหม่ |
| `works[].company` | Required, 1-200 chars | กรุณากรอกชื่อบริษัท |
| `works[].position` | Required, 1-200 chars | กรุณากรอกตำแหน่ง |
| `works[].start_year` | Required, 1950-current | กรุณาเลือกปีเริ่มงาน |
| `works[].end_year` | Required if `!is_current`, ≥ start_year | ปีสิ้นสุดต้องมากกว่าหรือเท่ากับปีเริ่มต้น |

### Step 3: Education

| Field | Rule | Error Message (Thai) |
|-------|------|----------------------|
| `educations[]` | Exactly 1 entry | กรุณาเพิ่มประวัติการศึกษา |
| `educations[].level` | Required | กรุณาเลือกระดับการศึกษา |
| `educations[].institution` | Required, 1-200 chars | กรุณากรอกชื่อสถาบัน |
| `educations[].faculty` | Required, 1-100 chars | กรุณากรอกคณะ/สาขา |
| `educations[].graduation_year` | Required, 1950-current | กรุณาเลือกปีที่จบ |
| `educations[].gpa` | Optional, 0.00-4.00 | เกรดเฉลี่ยต้องอยู่ระหว่าง 0.00-4.00 |

### Step 4: Skills

| Field | Rule | Error Message (Thai) |
|-------|------|----------------------|
| `skills[]` | ≥1 skill | กรุณาเพิ่มอย่างน้อย 1 ทักษะ |
| `skills[].name` | Required, 1-100 chars | - |
| `languages[]` | Optional | - |

### Step 5: Job Preferences

| Field | Rule | Error Message (Thai) |
|-------|------|----------------------|
| `job_types[]` | ≥1 selected | กรุณาเลือกประเภทงานอย่างน้อย 1 รายการ |
| `positions[]` | ≥1 position | กรุณาเพิ่มตำแหน่งที่สนใจอย่างน้อย 1 ตำแหน่ง |
| `salary_min` | Required, ≥0 | กรุณากรอกเงินเดือนขั้นต่ำ |
| `salary_max` | Required, ≥ salary_min | เงินเดือนสูงสุดต้องมากกว่าหรือเท่ากับขั้นต่ำ |
| `locations[]` | ≥1 location | กรุณาเลือกพื้นที่ทำงานอย่างน้อย 1 แห่ง |
| `availability` | Required | กรุณาเลือกความพร้อมเริ่มงาน |

---

## 5. Test Coverage Plan

### 5.1 Unit Tests (Target: 90%+ business logic, 80%+ utilities)

**Estimated: 20-25 tests**

| Test Suite | Tests | Coverage Target |
|------------|-------|-----------------|
| Onboarding wizard navigation | 5 | Step transitions, validation |
| Profile sections | 7 | Each section renders correctly |
| Array field manager | 5 | Add, edit, delete, validation |
| Profile completion calc | 4 | All weight combinations |
| Validation schemas | 8 | All 5 steps × edge cases |
| Fresh graduate toggle | 3 | Enable, disable, confirm |
| Skill combobox | 3 | Select, enter new, remove |

### 5.2 Integration Tests (Target: MINIMUM 10)

**Estimated: 10-12 tests**

| Test Suite | Tests | Coverage |
|------------|-------|----------|
| Onboarding flow | 3 | Complete wizard, skip validation, fresh grad flow |
| Profile save | 3 | Personal info, work experience, preferences |
| Fresh graduate toggle | 2 | Clear work history, disable on add work |
| File upload | 2 | Upload document, delete document |
| Cache invalidation | 2 | After save, after onboarding complete |

### 5.3 E2E Tests (Target: MINIMUM 6)

**Estimated: 6-8 tests**

| Test Suite | Tests | Coverage |
|------------|-------|----------|
| Onboarding wizard | 2 | Complete flow, validation errors |
| Profile edit | 2 | Edit personal info, edit work experience |
| Array CRUD | 1 | Add/edit/delete education |
| Preview & export | 1 | Open preview, export PDF |
| Mobile | 1 | Mobile responsive wizard |
| File upload | 1 | Upload + delete document |

**Total Test Estimate: 36-45 tests**

---

## 6. State Machine Verification

Per RIS §6, all state machines must be implemented and tested:

### 6.1 Page Mode Automaton

| State | Event | Next State | Test Coverage |
|-------|-------|------------|---------------|
| `loading` | `AUTH_SUCCESS` | `checking_onboarded` | Unit test |
| `checking_onboarded` | `DATA_LOADED` (isOnboarded=false) | `onboarding_mode` | E2E test |
| `checking_onboarded` | `DATA_LOADED` (isOnboarded=true) | `profile_mode` | E2E test |
| `onboarding_mode` | `WIZARD_COMPLETE` | `redirecting` | E2E test |
| `profile_mode` | `OPEN_PREVIEW` | `preview_modal_open` | E2E test |

### 6.2 Onboarding Wizard Automaton

| State | Event | Next State | Test Coverage |
|-------|-------|------------|---------------|
| `step_1` | `NEXT` (valid) | `step_2` | Unit + E2E |
| `step_2` | `NEXT` (valid) | `step_3` | Unit + E2E |
| `step_3` | `NEXT` (valid) | `step_4` | Unit + E2E |
| `step_4` | `NEXT` (valid) | `step_5` | Unit + E2E |
| `step_5` | `FINISH` (valid) | `complete` | E2E |
| `step_X` | `BACK` | `step_{X-1}` | Unit test |

### 6.3 Fresh Graduate Toggle Automaton

| State | Event | Next State | Test Coverage |
|-------|-------|------------|---------------|
| `has_experience` (entries > 0) | `TOGGLE_FRESH_GRAD` | `confirm_clear` | Unit test |
| `confirm_clear` | `CONFIRM` | `is_fresh_grad` | Integration test |
| `confirm_clear` | `CANCEL` | `has_experience` | Unit test |
| `is_fresh_grad` | `ADD_WORK` | `has_experience` | Integration test |

### 6.4 Section Edit Automaton

| State | Event | Next State | Test Coverage |
|-------|-------|------------|---------------|
| `viewing` | `EDIT_CLICK` | `editing` | E2E test |
| `editing` | `SAVE` (valid) | `saving` → `viewing` | Integration test |
| `editing` | `CANCEL` (dirty) | `confirm_discard` | Unit test |
| `editing` | `CANCEL` (clean) | `viewing` | Unit test |

---

## 7. Thai Copy Checklist

All user-facing text from RIS §11 and Appendix B:

### Onboarding Wizard

| Element | Thai | English |
|---------|------|---------|
| Page Title | กรอกโปรไฟล์ | Complete Profile |
| Step 1 Heading | ข้อมูลส่วนตัว | Personal Information |
| Step 2 Heading | ประสบการณ์ทำงาน | Work Experience |
| Step 3 Heading | ประวัติการศึกษา | Education |
| Step 4 Heading | ทักษะและภาษา | Skills & Languages |
| Step 5 Heading | ความต้องการงาน | Job Preferences |
| Back Button | ย้อนกลับ | Back |
| Next Button | ถัดไป | Next |
| Finish Button | เสร็จสิ้น | Finish |
| Fresh Graduate Toggle | ฉันเป็นนักศึกษาจบใหม่ | I'm a fresh graduate |

### Profile Mode

| Element | Thai | English |
|---------|------|---------|
| Page Title | โปรไฟล์ของฉัน | My Profile |
| Profile Completion | ความสมบูรณ์ของโปรไฟล์ | Profile Completion |
| Preview Button | แสดงตัวอย่าง | Preview |
| Export Button | ส่งออก PDF | Export PDF |
| Searchable Toggle | เปิดให้นายจ้างค้นหาได้ | Visible to employers |
| Edit Button | แก้ไข | Edit |
| Save Button | บันทึก | Save |
| Cancel Button | ยกเลิก | Cancel |

### Error Messages (from Validation Rules above)

All error messages already listed in Section 4.

---

## 8. Dependencies

### 8.1 Prerequisites

**Required (BLOCKING):**
- ✅ CAND-R01 Dashboard - Shell component implemented
- ✅ `useCandidateAuth` hook - Auth pattern established
- ✅ `useProfileCompletion` hook - Completion calc available
- ✅ Server actions - `webCandidateInformationUpdate`, `webCandidatePreferenceUpdate`

**None - all prerequisites complete.**

### 8.2 This Route Blocks

| Route | Dependency | Reason |
|-------|------------|--------|
| CAND-R03 Settings | Profile structure | Reuses profile sections pattern |
| JOB-RXX Applications | Candidate onboarded | Applications require `isOnboarded: true` |
| JOB-RXX Job Apply | Profile complete | Job applications require profile |

### 8.3 Shell Reuse

**Shell:** Candidate Shell (from CAND-R01) ✅

**Note:** Profile page will be accessible even if `isOnboarded: false` (it's the onboarding destination).

---

## 9. Component Reuse Analysis

### 9.1 From CAND-R01 (Reuse)

| Component | Reuse How | Modifications |
|-----------|-----------|---------------|
| `CandidateShell` | Wrap entire profile page | None - already supports `isOnboarded: false` |
| `useCandidateAuth` | Auth + ownership check | Set `requireOnboarded: false` (allow profile access for onboarding) |
| `useProfileCompletion` | Calculate completion % | None - reuse as-is |

### 9.2 New Components to Create

See Section 3.1 file structure for complete list.

**Key Shared Components (reusable across profile):**
- `EditDrawer` - Base drawer wrapper
- `ArrayFieldManager` - Generic array CRUD UI
- `WorkExperienceForm` - Used in wizard + edit drawer
- `EducationForm` - Used in wizard + edit drawer
- `SkillCombobox` - Used in wizard + edit drawer

---

## 10. Open Questions for SA Review

### Q1: Master Data Strategy

**Question:** Should we hardcode dropdowns initially or fetch from master data collections?

**Options:**
- **Option A:** Hardcode all dropdowns (provinces, education levels, job types) → Faster to implement, update via code
- **Option B:** Fetch from Firestore master data collections → More flexible, update via admin panel

**Recommendation:** Option A for initial implementation (Province list is stable, ~77 items). Can migrate to master data in future iteration.

**Decision:** [ SA to decide ]

---

### Q2: Profile Photo Upload

**Question:** Where should profile photo upload be located?

**Options:**
- **Option A:** In Step 1 (Personal Info) during onboarding
- **Option B:** Only in Profile Mode header (onboarding = text-only)
- **Option C:** Both locations

**Recommendation:** Option B (Profile Mode only). Onboarding focuses on minimum viable resume. Photo can be added later.

**Decision:** [ SA to decide ]

---

### Q3: PDF Export Library

**Question:** Which library should we use for PDF export?

**Options:**
- **Option A:** `jsPDF` + `html2canvas` (screenshot approach)
- **Option B:** `react-pdf/renderer` (structured PDF generation)
- **Option C:** Server-side with Puppeteer (higher quality, slower)

**Recommendation:** Option A (client-side, fast, good enough quality).

**Decision:** [ SA to decide ]

---

### Q4: Preview Modal vs Full Page

**Question:** Should preview be a modal or full-page route?

**Options:**
- **Option A:** Modal (as specified in RIS)
- **Option B:** Full-page route `/candidates/[id]/profile/preview`

**Recommendation:** Option A per RIS. Modal is faster, no navigation required.

**Decision:** [ SA to decide ]

---

### Q5: Skills Master Data

**Question:** Do we have a skills master data collection, or should skills be free-text only?

**Options:**
- **Option A:** Combobox with master data suggestions + allow custom entries
- **Option B:** Free-text only (no suggestions)
- **Option C:** Strict master data only (no custom entries)

**Recommendation:** Option A (best UX - guides users but allows flexibility).

**Decision:** [ SA to check if master_skills collection exists ]

---

## 11. Estimated Complexity Breakdown

| Component Type | Count | Avg Effort | Total |
|----------------|-------|------------|-------|
| Route pages | 1 | 1h | 1h |
| Client wrappers | 1 | 2h | 2h |
| Wizard steps | 5 | 3h | 15h |
| Profile sections | 7 | 1h | 7h |
| Edit drawers | 7 | 1.5h | 10.5h |
| Shared components | 5 | 2h | 10h |
| Hooks | 3 | 2h | 6h |
| Validation schemas | 5 | 1h | 5h |
| Unit tests | 25 | 0.3h | 7.5h |
| Integration tests | 12 | 0.5h | 6h |
| E2E tests | 8 | 1h | 8h |
| Polish & fixes | - | - | 4h |
| **Total** | **79** | **-** | **82h** |

**Adjusted for efficiency:** ~50 hours (accounting for component reuse and parallel work)

---

## 12. Success Criteria

### 12.1 Functional Requirements

- [ ] ✅ Page mode auto-detection works (onboarding vs profile)
- [ ] ✅ All 5 onboarding steps complete without errors
- [ ] ✅ Cannot skip wizard steps
- [ ] ✅ Fresh graduate toggle clears work history (with confirm)
- [ ] ✅ Profile completion % matches RIS calculation
- [ ] ✅ All profile sections editable via drawers
- [ ] ✅ Array CRUD works (add, edit, delete)
- [ ] ✅ File upload works (documents, size/type validation)
- [ ] ✅ Preview modal shows read-only profile
- [ ] ✅ PDF export works from preview
- [ ] ✅ `isSearchable` toggle updates successfully
- [ ] ✅ On wizard complete: `isOnboarded` set to `true` in both collections
- [ ] ✅ Redirect to dashboard after onboarding complete

### 12.2 Quality Gates (ALL must pass)

- [ ] ✅ Gate 1: `npm run build` exits with code 0
- [ ] ✅ Gate 2: `npm run lint` has no errors
- [ ] ✅ Gate 3: `npm run dev` → route loads at `/jobsmarket/candidates/[id]/profile`
- [ ] ✅ Gate 4: All tests pass (36+ tests total)
  - [ ] Unit tests: 20+ passing, 90%+ coverage on business logic
  - [ ] Integration tests: 10+ passing
  - [ ] E2E tests: 6+ passing

### 12.3 Performance

- [ ] ✅ Initial page load < 2s
- [ ] ✅ Step transitions < 100ms
- [ ] ✅ Section edit drawer opens < 200ms
- [ ] ✅ File upload shows progress indicator
- [ ] ✅ Profile completion recalculates instantly

### 12.4 Accessibility

- [ ] ✅ Keyboard navigation works (Tab, Enter, Esc)
- [ ] ✅ Screen reader announces wizard progress
- [ ] ✅ All form fields have labels
- [ ] ✅ Error messages are accessible

### 12.5 Mobile Responsive

- [ ] ✅ Onboarding wizard works on mobile
- [ ] ✅ Edit drawers are full-screen on mobile
- [ ] ✅ Touch-friendly buttons (min 44×44px)

---

## 13. Completion Report Template

```markdown
# CAND-R02 Implementation Completion Report

## Quality Gates

### Gate 1: Build
```bash
npm run build
```
**Result:** ✅ PASS / ❌ FAIL
**Output:**
```
[paste last few lines]
```

### Gate 2: Lint
```bash
npm run lint
```
**Result:** ✅ PASS / ❌ FAIL
**Errors:** [count]

### Gate 3: Dev Server
```bash
npm run dev
```
**Result:** ✅ PASS / ❌ FAIL
**URL Tested:** http://localhost:3000/jobsmarket/candidates/[test-uid]/profile
**Observations:** [describe what you tested]

### Gate 4: Tests
```bash
npm run test:unit
npm run test:integration
npx playwright test tests/e2e/jobsmarket/candidates/profile.spec.ts
```
**Result:** ✅ PASS / ❌ FAIL
**Summary:**
- Unit: X/X passing
- Integration: Y/Y passing
- E2E: Z/Z passing

## Implementation Evidence

**Onboarding Mode Screenshot:**
[Attach screenshot of wizard at step 3]

**Profile Mode Screenshot:**
[Attach screenshot of profile with all sections]

**Preview Modal Screenshot:**
[Attach screenshot of preview]

## Test Coverage

**Unit Test Coverage:**
- Business logic: X%
- Utilities: Y%

**Files Created:** [count]
**Lines of Code:** [count]

## Sign-Off

Implementation Status: ✅ COMPLETE / 🔄 IN PROGRESS
Quality Gates: ✅ ALL PASS / ❌ [count] FAILED
Production Ready: ✅ YES / ❌ NO

**SA Approval:** [ ]
**Date:** YYYY-MM-DD
```

---

*End of CAND-R02 Implementation Plan*
