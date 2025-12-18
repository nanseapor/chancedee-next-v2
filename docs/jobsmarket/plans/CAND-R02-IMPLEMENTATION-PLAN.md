# CAND-R02 Consolidated Plan (Single Source of Truth)

**Route:** `/candidates/[id]/profile` + `/candidates/profile/create`  
**RIS Document:** `CAND-R02_profile_RIS.md`  
**Status:** 🟡 70% Complete  
**Last Updated:** 2025-12-16  

> ⚠️ **THIS IS THE ONLY PLAN DOCUMENT FOR CAND-R02**
> 
> Supersedes:
> - `CAND-R02-IMPLEMENTATION-PLAN.md` (original)
> - `CAND-R02-BATCH-3C-IMPLEMENTATION-PLAN.md` (sub-plan)
> - `CAND-R02-TASK-TRACKER.md` (stale tracker)
>
> Claude Code: Reference ONLY this document.

---

## 1. SA Approved Decisions

| Decision | Question | Answer | Notes |
|----------|----------|--------|-------|
| Q1 | Master Data Strategy | **Option A: Hardcode** | Province list in constants |
| Q2 | Profile Photo Location | **Option B: Profile Mode only** | Not in onboarding wizard |
| Q3 | PDF Export | **Use Existing API** | ~~jsPDF~~ → `NEXT_PUBLIC_PDF_GENERATOR_API_URL` |
| Q4 | Preview | **Option A: Modal** | Per RIS spec |
| Q5 | Skills Input | **Option A: Combobox + custom** | Autocomplete with free entry |

**Note on Q3:** Original decision was jsPDF, but existing PDF API was discovered. Using existing API is correct.

---

## 2. Architecture Rules

### ❌ DO NOT
- Create `/api/` routes for jobsmarket
- Use jsPDF/html2canvas (use existing PDF API)
- Skip tests or defer them without SA approval
- Claim "complete" when functionality is stubbed

### ✅ DO
- Use Server Actions only
- Use existing PDF API (`NEXT_PUBLIC_PDF_GENERATOR_API_URL`)
- Use Meilisearch for search (when needed)
- Write tests alongside implementation
- Report actual status (stubbed vs functional)

---

## 3. Scope Summary

### In Scope ✅
- Page mode auto-detection (onboarding vs profile)
- Onboarding wizard (5 steps, ALL required)
- Profile view with inline-edit sections
- Edit drawers for each section
- Array CRUD (work, education, skills, languages)
- Fresh graduate toggle
- File upload (documents, profile photo)
- Profile completion percentage
- Preview modal
- PDF export (using existing API)
- isSearchable toggle

### Out of Scope ❌
- Resume parsing (PDF → auto-fill)
- LinkedIn import
- Profile analytics
- AI-powered suggestions

---

## 4. Batch Structure (Definitive)

### Phase 3: UI Implementation

| Batch | Content | Status | Unit Tests |
|-------|---------|--------|------------|
| **3A** | Foundation: Page, mode detection, wizard hook | ✅ Done | 29 |
| **3B** | Onboarding Wizard: Steps 1-5 | ✅ Done | 173 |
| **3C** | Profile View: 7 read-only sections | ✅ Done | 47 |
| **3D** | Edit Drawers: 6 drawers (UI only) | ✅ Done | 39 |
| **3E** | Preview Modal + PDF Export | ✅ Done | 28 |

**Phase 3 Total: 316 unit tests**

### Phase 4: Backend & Features

| Batch | Content | Status | Tests |
|-------|---------|--------|-------|
| **4A** | Server Actions: Real Firestore writes | ⏳ Pending | TBD |
| **4B** | Document Upload: Firebase Storage | ⏳ Pending | TBD |
| **4C** | Polish: isSearchable, mobile, loading states | ⏳ Pending | TBD |

### Phase 5: Testing

| Batch | Content | Status | Tests |
|-------|---------|--------|-------|
| **5A** | Integration Tests | ⏳ Pending | 10+ required |
| **5B** | E2E Tests | ⏳ Pending | 6+ required |

---

## 5. Completed Work Detail

### Batch 3A: Foundation ✅

**Files Created:**
```
src/app/jobsmarket/candidates/profile/create/page.tsx
src/app/jobsmarket/candidates/profile/create/_components/ProfileCreationClient.tsx
src/hooks/jobsmarket/use-profile-wizard.ts
```

**Tests:** `tests/unit/jobsmarket/candidates/profile/use-profile-wizard.test.ts` (29 tests)

---

### Batch 3B: Onboarding Wizard ✅

**Files Created:**
```
src/app/jobsmarket/candidates/profile/create/_components/
├── Step1PersonalInfo.tsx
├── Step2WorkExperience.tsx
├── Step3Education.tsx
├── Step4Skills.tsx
└── Step5JobPreferences.tsx

src/lib/constants/jobsmarket/
├── thailand-geography.ts (77 provinces, 928 districts)
├── personal-info.ts
├── education.ts
├── skills.ts
└── job-preferences.ts
```

**Tests:** 173 unit tests across all step components
- Includes Radix UI polyfill fix (`tests/setup/radix-polyfill.ts`)

---

### Batch 3C: Profile View Mode ✅

**Files Created:**
```
src/app/jobsmarket/candidates/[id]/profile/page.tsx
src/app/jobsmarket/candidates/[id]/profile/_components/
├── ProfileViewClient.tsx
├── ProfileHeader.tsx
├── PersonalInfoSection.tsx
├── WorkExperienceSection.tsx
├── EducationSection.tsx
├── SkillsSection.tsx
├── JobPreferencesSection.tsx
└── DocumentsSection.tsx (placeholder UI)
```

**Tests:** 47 unit tests in `tests/unit/jobsmarket/candidates/profile-view/`

---

### Batch 3D: Edit Drawers ✅

**Files Created:**
```
src/app/jobsmarket/candidates/[id]/profile/_components/
├── PersonalInfoEditDrawer.tsx
├── WorkExperienceEditDrawer.tsx
├── EducationEditDrawer.tsx
├── SkillsEditDrawer.tsx
├── JobPreferencesEditDrawer.tsx
└── AboutMeEditDrawer.tsx
```

**Tests:** 39 unit tests

**⚠️ IMPORTANT:** Server actions are **STUBBED** with `console.log()`. Batch 4A must implement real saves.

---

### Batch 3E: Preview + PDF ✅

**Files Created:**
```
src/lib/jobsmarket/services/pdf-service.ts
src/lib/jobsmarket/hooks/use-pdf-export.ts
src/app/jobsmarket/candidates/[id]/profile/_components/PreviewModal.tsx
```

**Tests:** 28 unit tests

**PDF Integration:**
- Uses existing API: `POST ${NEXT_PUBLIC_PDF_GENERATOR_API_URL}/generateResumePdf`
- Supports templates: template1, template2, template3 (default: template3)
- Requires Firebase Auth token

---

## 6. Remaining Work Detail

### Batch 4A: Server Actions ⏳

**Purpose:** Replace stubbed `console.log()` calls with real Firestore operations.

**Server Actions to Implement:**

| Action | Collection | Purpose |
|--------|------------|---------|
| `webCandidateSaveWorkExperience` | `candidate_information.works[]` | Save work array |
| `webCandidateSaveEducation` | `candidate_information.educations[]` | Save education array |
| `webCandidateSaveSkills` | `candidate_information.skills[]`, `languages[]` | Save skills + languages |
| `webCandidateSavePreferences` | `candidate_preference` | Save job preferences |
| `webCandidateSaveAboutMe` | `candidate_information.about_me` | Save about text |

**Wizard Completion Logic:**

```typescript
// When wizard completes (all 5 steps done):
// MUST set isOnboarded: true in BOTH collections

await updateCandidateInformation(uid, { is_onboarded: true });
await updateUserInfo(uid, { is_onboarded: true });

// Then redirect to dashboard
router.push(`/jobsmarket/candidates/${uid}`);
```

**Cache Invalidation:**
- Replace `window.location.reload()` with SWR `mutate()` calls
- Invalidate: `candidate-${uid}`, `candidate-preference-${uid}`

**Files to Modify:**
```
src/lib/database/actions/candidate-information.ts (add new actions)
src/app/jobsmarket/candidates/[id]/profile/_components/*EditDrawer.tsx (wire up actions)
src/app/jobsmarket/candidates/profile/create/_components/ProfileCreationClient.tsx (wizard complete)
```

**Tests Required:** Unit tests for each server action

---

### Batch 4B: Document Upload ⏳

**Purpose:** Real file upload functionality using Firebase Storage.

**Features:**
- Upload documents (PDF, DOC, DOCX)
- Upload profile photo (JPG, PNG)
- Delete documents
- File size validation (max 10MB)
- File type validation
- Progress indicator during upload

**Storage Paths:**
```
candidates/{uid}/documents/{filename}
candidates/{uid}/photo/profile.{ext}
```

**Files to Create:**
```
src/lib/jobsmarket/services/storage-service.ts
src/lib/jobsmarket/hooks/use-file-upload.ts
```

**Files to Modify:**
```
src/app/jobsmarket/candidates/[id]/profile/_components/DocumentsSection.tsx
src/app/jobsmarket/candidates/[id]/profile/_components/ProfileHeader.tsx (photo upload)
```

**Tests Required:** Unit tests for upload/delete operations

---

### Batch 4C: Polish ⏳

**Purpose:** Wire up remaining functionality and verify quality.

**isSearchable Toggle:**
```typescript
// ProfileHeader.tsx - currently stubbed
const handleToggleSearchable = async (value: boolean) => {
  // TODO: Implement real update
  await webCandidateUpdateSearchable(uid, value);
  mutate(`candidate-${uid}`);
};
```

**Checklist:**
- [ ] isSearchable toggle → real Firestore update
- [ ] Loading states for all async operations
- [ ] Error states and error boundaries
- [ ] Empty states review
- [ ] Mobile responsive verification
- [ ] Bottom tab bar on mobile
- [ ] Edit drawers full-screen on mobile
- [ ] Touch-friendly buttons (min 44×44px)

**Tests Required:** Manual testing checklist + any missing unit tests

---

### Batch 5A: Integration Tests ⏳

**Minimum 10 tests required.**

**Test Scenarios:**

| # | Scenario | What to Test |
|---|----------|--------------|
| 1 | Wizard complete flow | Steps 1→2→3→4→5 with valid data |
| 2 | Edit drawer save | Open → Edit → Save → Data persists |
| 3 | isOnboarded (candidate_information) | Flag set after wizard complete |
| 4 | isOnboarded (user_info) | Flag set after wizard complete |
| 5 | Document upload | Upload → List → Delete |
| 6 | PDF export | Generate → Download |
| 7 | isSearchable toggle | Toggle → Persists |
| 8 | Profile completion calculation | Matches RIS Appendix C |
| 9 | Mode switching | isOnboarded determines mode |
| 10 | Fresh graduate toggle | Clears work history with confirmation |

**File:** `tests/integration/jobsmarket/candidates/profile/`

---

### Batch 5B: E2E Tests ⏳

**Minimum 6 tests required.**

**Test Scenarios:**

| # | Scenario | User Journey |
|---|----------|--------------|
| 1 | New user onboarding | Login → Wizard → Complete → Dashboard |
| 2 | Edit profile | Login → Profile → Edit section → Save |
| 3 | Upload document | Profile → Documents → Upload → Verify |
| 4 | Export PDF | Profile → Preview → Download PDF |
| 5 | Fresh graduate flow | Wizard Step 2 → Toggle → Confirm → Continue |
| 6 | Mobile navigation | Mobile view → Bottom tabs → Navigate |

**File:** `tests/e2e/jobsmarket/candidates/profile/`

---

## 7. Dependencies & Services

### Existing Services (Use, Don't Recreate)

| Service | Environment Variable | Purpose |
|---------|---------------------|---------|
| PDF Generator | `NEXT_PUBLIC_PDF_GENERATOR_API_URL` | Resume PDF export |
| Meilisearch | `NEXT_PUBLIC_MEILI_SEARCH_HOST` | Search (not needed for CAND-R02) |
| Firebase Storage | (configured) | File uploads |
| Firebase Auth | (configured) | Authentication |

### Server Actions (Existing)

| Action | Location | Purpose |
|--------|----------|---------|
| `webCandidateInformationGetById` | `candidate-information.ts` | Fetch profile |
| `webCandidateInformationUpdate` | `candidate-information.ts` | Update profile |
| `webCandidatePreferenceGetById` | `candidate-preference.ts` | Fetch preferences |
| `webCandidatePreferenceUpdate` | `candidate-preference.ts` | Update preferences |
| `webCandidateSavePersonalInfo` | `candidate-information.ts` | Save step 1 |

---

## 8. Quality Gates

All batches must pass before completion:

| Gate | Command | Requirement |
|------|---------|-------------|
| Gate 1 | `npm run build` | Exit code 0 |
| Gate 2 | `npm run lint` | No errors (warnings OK) |
| Gate 3 | `npm run dev` | Route loads without errors |
| Gate 4 | `npm run test:unit` | All tests pass |
| Gate 5 | `npm run test:integration` | All tests pass (after 5A) |
| Gate 6 | `npx playwright test` | All tests pass (after 5B) |

---

## 9. Success Criteria

### Functional Requirements

- [ ] Page mode auto-detection works
- [ ] All 5 onboarding steps complete without errors
- [ ] Cannot skip wizard steps
- [ ] Fresh graduate toggle clears work history (with confirm)
- [ ] Profile completion % matches RIS calculation
- [ ] All profile sections editable via drawers
- [ ] Array CRUD works (add, edit, delete)
- [ ] File upload works (documents, profile photo)
- [ ] Preview modal shows read-only profile
- [ ] PDF export works from preview
- [ ] isSearchable toggle updates successfully
- [ ] On wizard complete: isOnboarded set to true in BOTH collections
- [ ] Redirect to dashboard after onboarding complete

### Test Requirements

| Type | Minimum | Current |
|------|---------|---------|
| Unit Tests | 300+ | 316 ✅ |
| Integration Tests | 10 | 0 ⏳ |
| E2E Tests | 6 | 0 ⏳ |

### Performance

- [ ] Initial page load < 2s
- [ ] Step transitions < 100ms
- [ ] File upload shows progress indicator

---

## 10. Current Status Summary

```
CAND-R02 Progress: ████████████████████░░░░░░░░ 70%

✅ Phase 3 (UI Implementation): COMPLETE
   - 5 batches done
   - 316 unit tests
   - All UI components created

⏳ Phase 4 (Backend & Features): NOT STARTED
   - Server actions stubbed
   - Document upload placeholder
   - Polish items pending

⏳ Phase 5 (Testing): NOT STARTED
   - Integration tests needed
   - E2E tests needed
```

---

## 11. Next Action

**Batch 4A: Server Actions**

Claude Code should proceed with implementing real server actions to replace stubbed functionality. See Section 6 for detailed requirements.

---

*End of CAND-R02 Consolidated Plan*