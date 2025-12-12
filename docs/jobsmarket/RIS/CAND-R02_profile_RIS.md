# RIS: /candidates/[id]/profile

**Route ID:** CAND-R02  
**Version:** 1.0  
**Status:** Draft  
**Created:** 2025-12-09  
**Last Updated:** 2025-12-09

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-09 | Initial creation with revised inline-edit design |

---

## Design Note

> ⚠️ **IMPORTANT:** This RIS implements a **REVISED DESIGN** that **supersedes** the 5-tab design documented in `04-candidate-routes.md` Section 5.2.

| Aspect | Original Spec (04-candidate-routes.md) | Revised Design (This RIS) |
|--------|----------------------------------------|---------------------------|
| **Structure** | 5 tabs (Personal, Preferences, Resume, Preview, Onboarding) | Single scrollable page with inline-edit sections |
| **Onboarding** | Tab (`?tab=onboarding`) - skippable steps 3-5 | **Page mode** (automatic for `isOnboarded: false`) - **ALL 5 steps required** |
| **Preview** | Tab (`?tab=preview`) | **Modal/Drawer** triggered by button |
| **Editing** | Tab content forms | **Inline section editing** via drawer |
| **Tab Navigation** | Yes | **None** - single page scroll |

**Rationale:**
1. Onboarding is a blocking flow, not a parallel tab option
2. Preview is a view mode toggle, not separate content
3. Industry standard (LinkedIn, Indeed) uses inline edit, not tabs
4. Lower cognitive load for users
5. All 5 onboarding steps create minimum viable resume for job matching

---

## 1. Route Metadata

| Property | Value |
|----------|-------|
| Route Path | `/candidates/[id]/profile` |
| Shell | Candidate Shell |
| Purpose | Candidate profile management - onboarding wizard (new users) and profile editor (existing users) |
| Complexity | High (two page modes, inline editing, array fields, file uploads) |
| Phase | 1c (Foundation - Candidate Setup) |
| UI Spec | `04-candidate-routes.md` Section 5.2 (SUPERSEDED by this RIS) |

---

## 2. Domain Classification

### Primary Domain: Candidate (●)

- **Owns:** Complete candidate profile lifecycle
- **Mutations:**
  - Create/Update personal information
  - Manage work experience (array)
  - Manage education history (array)
  - Manage skills and languages (arrays)
  - Update job preferences
  - Upload/delete documents
  - Set `isOnboarded` flag
  - Toggle `isSearchable` visibility

### Secondary Domains

| Domain | Role | Access |
|--------|------|--------|
| None | - | - |

### Global Domains (via Shell)

| Domain | Requirement |
|--------|-------------|
| Auth | Session validation, owner-only access |
| Chat | FAB available (if `isOnboarded: true`) |
| Notifications | Bell icon available (if `isOnboarded: true`) |

---

## 3. Feature Mapping

### Existing Features (Preserve - P0)

| Feature ID | Feature Name | Coverage | Notes |
|------------|--------------|----------|-------|
| CAND-003 | Edit Profile (Multi-Step Wizard) | Full | Onboarding mode (revised: ALL 5 steps required) |
| CAND-004 | Update Basic Information | Full | Personal Info section + Onboarding Step 1 |
| CAND-005 | Update Work Experience | Full | Work Experience section + Onboarding Step 2 |
| CAND-006 | Update Education History | Full | Education section + Onboarding Step 3 |
| CAND-007 | Update Skills & Languages | Full | Skills section + Onboarding Step 4 |
| CAND-008 | Update About Me & Expertise | Full | About Me section (post-onboarding only) |
| CAND-009 | Edit Job Preferences | Full | Job Preferences section + Onboarding Step 5 |
| CAND-011 | Preview Public Profile | Full | Preview modal |
| CAND-012 | View Resume | Full | Export PDF from Preview modal |
| CAND-013 | Toggle Profile Visibility | Full | `isSearchable` toggle in profile header |
| CAND-017 | Update Profile Completion Status | Full | Completion percentage in header |

### New Features (Enhancements)

| Feature | Description | Priority |
|---------|-------------|----------|
| Inline Edit Pattern | Click Edit → Drawer opens → Save → Close | P0 |
| Single Page Layout | No tabs, scroll through sections | P0 |
| Auto-detect Onboarding Mode | Based on `isOnboarded` flag | P0 |
| All Steps Required | No skipping in onboarding wizard | P0 |
| Fresh Graduate Toggle | Allow users with no work experience | P0 |
| Skill Combobox | Select from list OR enter new skill | P0 |

### Future Features (Out of Scope)

| Feature | Description | Priority |
|---------|-------------|----------|
| Resume Parsing | Upload PDF to auto-fill profile | P2 |
| LinkedIn Import | Import profile from LinkedIn | P2 |
| Profile Analytics | Views, search appearances | P2 |

---

## 4. Data Contract

### 4.1 Read Operations

| Operation | Source | Purpose | Cache Key |
|-----------|--------|---------|-----------|
| `getCandidateProfile(uid)` | `candidate_information` | Load profile data | `candidate-${uid}` |
| `getCandidatePreference(uid)` | `candidate_preference` | Load job preferences | `candidate-${uid}` |
| `getMasterProvinces()` | `master_provinces` | Address dropdowns | `master-data-provinces` |
| `getMasterEducationLevels()` | `master_education_levels` | Education dropdown | `master-data-education` |
| `getMasterSkills()` | `master_skills` | Skills suggestions | `master-data-skills` |
| `getMasterLanguages()` | `master_languages` | Language dropdown | `master-data-languages` |
| `getMasterJobTypes()` | `master_job_types` | Job type options | `master-data-jobtypes` |
| `getMasterJobFunctions()` | `master_job_functions` | Position suggestions | `master-data-functions` |

### 4.2 Write Operations

| Operation | Target | Trigger | Validation |
|-----------|--------|---------|------------|
| `updatePersonalInfo(uid, data)` | `candidate_information` | Save Step 1 / Personal section | See Section 8 |
| `updateWorkExperience(uid, works[])` | `candidate_information.works` | Save Step 2 / Work section | At least 1 entry OR fresh_graduate |
| `updateEducation(uid, educations[])` | `candidate_information.educations` | Save Step 3 / Education section | At least 1 entry |
| `updateSkills(uid, skills[], languages[])` | `candidate_information.{skills,languages}` | Save Step 4 / Skills section | At least 1 skill |
| `updateJobPreferences(uid, preference)` | `candidate_preference` | Save Step 5 / Preferences section | See Section 8 |
| `updateAboutMe(uid, data)` | `candidate_information.{about_me, area_of_expertise}` | Save About section | Optional fields |
| `uploadDocument(uid, file)` | Firebase Storage → `candidate_information.documents` | Upload button | Max 10MB, PDF/DOC |
| `deleteDocument(uid, docId)` | Firebase Storage + `candidate_information.documents` | Delete button | Owner only |
| `setIsOnboarded(uid, true)` | `candidate_information.is_onboarded`, `user_info.is_onboarded` | Complete onboarding wizard | All 5 steps valid |
| `setIsSearchable(uid, boolean)` | `candidate_information.is_searchable` | Toggle switch | Boolean |

---

## 5. State Contract

### 5.1 Atoms Used

| Atom | Purpose | Read | Write |
|------|---------|------|-------|
| `candidateAtom` | Current candidate profile data | ✓ | ✓ |
| `editCandidateAtom` | Draft state during editing | ✓ | ✓ |
| `userAtom` | Current user account data | ✓ | - |
| `candidateFormValidationAtom` | Form validation state | ✓ | ✓ |
| `activeRoleAtom` | Navigation context | ✓ | - |
| `loadingAtom` | Global loading indicator | ✓ | ✓ |

### 5.2 Hooks Used

| Hook | Purpose | From |
|------|---------|------|
| `useCandidate` | Fetch/manage candidate data | `domains/candidates/hooks` |
| `useBasicInfoForm` | Personal info form state | `domains/candidates/hooks` |
| `useWorkExperienceForm` | Work experience form state | `domains/candidates/hooks` |
| `useStepCompletion` | Track wizard step completion | `domains/candidates/hooks` |
| `useSubstepValidation` | Form validation per substep | `domains/candidates/hooks` |

### 5.3 SWR Keys Used

| Key | Pattern | Usage |
|-----|---------|-------|
| `candidateKeys.candidate(uid)` | `candidate-${uid}` | Profile data |
| `candidateKeys.dashboard(uid)` | `candidate-dashboard-${uid}` | Dashboard data (invalidate on save) |
| `masterDataKeys.byType(type)` | `master-data-${type}` | Master data dropdowns |

### 5.4 Cache Invalidation

| Event | Invalidate Keys |
|-------|-----------------|
| Save any section | `candidate-${uid}`, `candidate-dashboard-${uid}` |
| Complete onboarding | `candidate-${uid}`, `candidate-dashboard-${uid}` |
| Toggle searchable | `candidate-${uid}` |
| Upload/delete document | `candidate-${uid}` |

---

## 6. UI State Machine

### 6.1 Page Mode Automaton (CRITICAL)

This is the **top-level state machine** that determines which mode to show.

| Current State | Event | Next State | Guard Condition | Side Effects |
|---------------|-------|------------|-----------------|--------------|
| `loading` | `AUTH_SUCCESS` | `checking_onboarded` | `session.valid` | Fetch candidate data |
| `loading` | `AUTH_FAILED` | `unauthorized` | `!session.valid` | - |
| `checking_onboarded` | `DATA_LOADED` | `onboarding_mode` | `!candidate.isOnboarded` | - |
| `checking_onboarded` | `DATA_LOADED` | `profile_mode` | `candidate.isOnboarded` | - |
| `checking_onboarded` | `DATA_ERROR` | `error` | - | Set error message |
| `onboarding_mode` | `WIZARD_COMPLETE` | `redirecting` | All 5 steps valid | `setIsOnboarded(true)` |
| `redirecting` | `REDIRECT_COMPLETE` | - | - | Navigate to `/candidates/[id]` |
| `profile_mode` | `OPEN_PREVIEW` | `preview_modal_open` | - | - |
| `profile_mode` | `OPEN_EDIT` | `profile_mode` | - | Open drawer for section |
| `preview_modal_open` | `CLOSE_PREVIEW` | `profile_mode` | - | - |
| `unauthorized` | - | - | - | Show 403 page |
| `error` | `RETRY` | `loading` | - | Clear error |

**State Diagram:**

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

### 6.2 Onboarding Wizard Automaton (ALL STEPS REQUIRED)

> ⚠️ **DESIGN CHANGE:** Original spec allowed skipping steps 3-5. Revised design requires ALL steps.

| Current State | Event | Next State | Guard Condition | Side Effects |
|---------------|-------|------------|-----------------|--------------|
| `step_1` | `NEXT` | `step_2` | `step1Valid` | `saveStep1()` |
| `step_1` | `SAVE_DRAFT` | `step_1` | - | `saveDraft()` |
| `step_2` | `NEXT` | `step_3` | `step2Valid` (work OR freshGrad) | `saveStep2()` |
| `step_2` | `BACK` | `step_1` | - | - |
| `step_2` | `TOGGLE_FRESH_GRAD` | `step_2` | - | See Fresh Graduate automaton |
| `step_3` | `NEXT` | `step_4` | `hasOneEducation` | `saveStep3()` |
| `step_3` | `BACK` | `step_2` | - | - |
| `step_4` | `NEXT` | `step_5` | `hasAtLeastOneSkill` | `saveStep4()` |
| `step_4` | `BACK` | `step_3` | - | - |
| `step_5` | `FINISH` | `complete` | `step5Valid` | `saveStep5()`, `setIsOnboarded(true)` |
| `step_5` | `BACK` | `step_4` | - | - |
| `complete` | - | - | - | Navigate to `/candidates/[id]` |

**Step 1: Personal Information**

Required fields: `first_name`, `last_name`, `phone`, `email`, `birthdate`, `address` (province)

**Step 2: Work Experience**

Required: At least 1 work entry OR `is_fresh_graduate: true`

**Step 3: Education**

Required: Exactly 1 education entry (highest level)

**Step 4: Skills**

Required: At least 1 skill

**Step 5: Job Preferences**

Required: `job_types[]` (≥1), `positions[]` (≥1), `salary_range`, `locations[]` (≥1), `availability`

### 6.3 Fresh Graduate Toggle Automaton

| Current State | Event | Next State | Guard Condition | Side Effects |
|---------------|-------|------------|-----------------|--------------|
| `has_experience` | `TOGGLE_FRESH_GRAD` | `confirm_clear` | `workEntries.length > 0` | `showConfirmDialog()` |
| `has_experience` | `TOGGLE_FRESH_GRAD` | `is_fresh_grad` | `workEntries.length === 0` | `setFreshGrad(true)` |
| `confirm_clear` | `CONFIRM` | `is_fresh_grad` | - | `clearWorkEntries()`, `setFreshGrad(true)` |
| `confirm_clear` | `CANCEL` | `has_experience` | - | - |
| `is_fresh_grad` | `TOGGLE_FRESH_GRAD` | `has_experience` | - | `setFreshGrad(false)` |
| `is_fresh_grad` | `ADD_WORK` | `has_experience` | - | `setFreshGrad(false)` |

### 6.4 Skill Selection Automaton

| Current State | Event | Next State | Guard Condition | Side Effects |
|---------------|-------|------------|-----------------|--------------|
| `idle` | `FOCUS_INPUT` | `searching` | - | `showSuggestions()` |
| `searching` | `TYPE` | `searching` | - | `filterSuggestions(query)` |
| `searching` | `SELECT_SUGGESTION` | `idle` | - | `addSkill(selected)`, `clearInput()` |
| `searching` | `ENTER_NEW` | `idle` | `query.length > 0` | `addSkill(newSkill)`, `clearInput()` |
| `searching` | `BLUR` | `idle` | - | `hideSuggestions()` |
| `idle` | `REMOVE_SKILL` | `idle` | `skills.length > 1` | `removeSkill(id)` |
| `idle` | `REMOVE_SKILL` | `idle` | `skills.length === 1` | `showError("ต้องมีอย่างน้อย 1 ทักษะ")` |

### 6.5 Section Edit Automaton (Profile Mode)

Each editable section follows this pattern:

| Current State | Event | Next State | Guard Condition | Side Effects |
|---------------|-------|------------|-----------------|--------------|
| `viewing` | `EDIT_CLICK` | `editing` | - | `openDrawer(section)` |
| `editing` | `FORM_CHANGE` | `editing` | - | `setDirty(true)` |
| `editing` | `SAVE` | `saving` | `formValid` | - |
| `editing` | `CANCEL` | `confirm_discard` | `isDirty` | `showConfirm()` |
| `editing` | `CANCEL` | `viewing` | `!isDirty` | `closeDrawer()` |
| `confirm_discard` | `CONFIRM` | `viewing` | - | `discardChanges()`, `closeDrawer()` |
| `confirm_discard` | `CANCEL` | `editing` | - | - |
| `saving` | `SUCCESS` | `viewing` | - | `closeDrawer()`, `invalidateCache()`, `showToast("บันทึกแล้ว")` |
| `saving` | `ERROR` | `editing` | - | `showError(message)` |

### 6.6 Array Field Automaton (Work Experience, Education)

| Current State | Event | Next State | Guard Condition | Side Effects |
|---------------|-------|------------|-----------------|--------------|
| `list_view` | `ADD_CLICK` | `adding` | `items.length < MAX` | `openForm(empty)` |
| `list_view` | `ADD_CLICK` | `list_view` | `items.length >= MAX` | `showError("เพิ่มได้สูงสุด X รายการ")` |
| `list_view` | `EDIT_ITEM` | `editing_item` | - | `openForm(item)` |
| `list_view` | `DELETE_ITEM` | `confirm_delete` | - | `showConfirm()` |
| `adding` | `SAVE` | `list_view` | `formValid` | `appendItem()` |
| `adding` | `CANCEL` | `list_view` | - | - |
| `editing_item` | `SAVE` | `list_view` | `formValid` | `updateItem()` |
| `editing_item` | `CANCEL` | `list_view` | - | - |
| `confirm_delete` | `CONFIRM` | `list_view` | `items.length > MIN` | `removeItem()` |
| `confirm_delete` | `CONFIRM` | `list_view` | `items.length <= MIN` | `showError("ต้องมีอย่างน้อย X รายการ")` |
| `confirm_delete` | `CANCEL` | `list_view` | - | - |

**Limits:**

| Array | MIN | MAX |
|-------|-----|-----|
| Work Experience | 0 (or fresh_graduate) | 20 |
| Education | 1 | 10 |
| Skills | 1 | 50 |
| Languages | 0 | 10 |
| Documents | 0 | 5 |

### 6.7 Preview Modal Automaton

| Current State | Event | Next State | Guard Condition | Side Effects |
|---------------|-------|------------|-----------------|--------------|
| `closed` | `OPEN` | `open` | - | `openModal()` |
| `open` | `CLOSE` | `closed` | - | `closeModal()` |
| `open` | `PRINT` | `open` | - | `window.print()` |
| `open` | `EXPORT_PDF` | `exporting` | - | - |
| `exporting` | `SUCCESS` | `open` | - | `downloadFile()`, `showToast("ดาวน์โหลดแล้ว")` |
| `exporting` | `ERROR` | `open` | - | `showError("ส่งออกไม่สำเร็จ")` |

### 6.8 File Upload Automaton

| Current State | Event | Next State | Guard Condition | Side Effects |
|---------------|-------|------------|-----------------|--------------|
| `idle` | `SELECT_FILE` | `validating` | - | - |
| `validating` | `VALID` | `uploading` | `fileSize <= 10MB && validType` | - |
| `validating` | `INVALID_SIZE` | `idle` | `fileSize > 10MB` | `showError("ไฟล์ใหญ่เกิน 10MB")` |
| `validating` | `INVALID_TYPE` | `idle` | `!validType` | `showError("รองรับเฉพาะ PDF, DOC")` |
| `uploading` | `PROGRESS` | `uploading` | - | `setProgress(%)` |
| `uploading` | `SUCCESS` | `idle` | - | `addToDocuments()`, `showToast("อัปโหลดแล้ว")` |
| `uploading` | `ERROR` | `idle` | - | `showError("อัปโหลดไม่สำเร็จ")` |
| `uploading` | `CANCEL` | `idle` | - | `abortUpload()` |

---

## 7. Component-Action Wiring

### 7.1 Onboarding Mode Components

| Component | Action | State Machine Event | Side Effects |
|-----------|--------|---------------------|--------------|
| `WizardStepIndicator` | Display | Read `currentStep` | - |
| `Step1PersonalInfo` | Submit | `NEXT` | `saveStep1()` |
| `Step2WorkExperience` | Submit | `NEXT` | `saveStep2()` |
| `Step2WorkExperience` | Toggle Fresh Grad | `TOGGLE_FRESH_GRAD` | See 6.3 |
| `Step3Education` | Submit | `NEXT` | `saveStep3()` |
| `Step4Skills` | Submit | `NEXT` | `saveStep4()` |
| `Step5JobPreferences` | Submit | `FINISH` | `saveStep5()`, `setIsOnboarded(true)` |
| `BackButton` | Click | `BACK` | Navigate to previous step |
| `NextButton` | Click | `NEXT` or `FINISH` | Validate & submit |

### 7.2 Profile View Components

| Component | Action | State Machine Event | Side Effects |
|-----------|--------|---------------------|--------------|
| `ProfileHeader` | Display | - | Show name, avatar, completion % |
| `ProfileHeader.Avatar` | Click Edit | Open upload dialog | - |
| `ProfileHeader.PreviewButton` | Click | `OPEN_PREVIEW` | Open preview modal |
| `ProfileHeader.ExportButton` | Click | Open export options | - |
| `ProfileHeader.SearchableToggle` | Toggle | - | `setIsSearchable()` |
| `PersonalInfoSection` | Click Edit | `EDIT_CLICK` | Open personal info drawer |
| `WorkExperienceSection` | Click Edit | `EDIT_CLICK` | Open work drawer |
| `WorkExperienceSection` | Click Add | `ADD_CLICK` | Open work form |
| `EducationSection` | Click Edit | `EDIT_CLICK` | Open education drawer |
| `SkillsSection` | Click Edit | `EDIT_CLICK` | Open skills drawer |
| `JobPreferencesSection` | Click Edit | `EDIT_CLICK` | Open preferences drawer |
| `AboutMeSection` | Click Edit | `EDIT_CLICK` | Open about drawer |
| `DocumentsSection` | Click Upload | `SELECT_FILE` | Open file picker |
| `DocumentsSection.DeleteButton` | Click | `DELETE_ITEM` | Confirm & delete |

### 7.3 Edit Drawer Components

| Component | Action | State Machine Event | Side Effects |
|-----------|--------|---------------------|--------------|
| `EditDrawer` | Open | `editing` state enter | Focus first field |
| `EditDrawer.SaveButton` | Click | `SAVE` | Validate & save |
| `EditDrawer.CancelButton` | Click | `CANCEL` | Check dirty, confirm |
| `EditDrawer.Form` | Change | `FORM_CHANGE` | Set dirty flag |

### 7.4 State Transitions (Detailed)

**Personal Info Save Flow:**

```
User clicks [บันทึก]
    │
    ├─► Validate form (client-side)
    │   ├─► Invalid: Show field errors, STAY in editing
    │   └─► Valid: Continue
    │
    ├─► Set state → saving
    │
    ├─► Call updatePersonalInfo(uid, data)
    │   │
    │   ├─► Success:
    │   │   ├─► Invalidate SWR cache
    │   │   ├─► Close drawer
    │   │   ├─► Show toast "บันทึกแล้ว"
    │   │   └─► Set state → viewing
    │   │
    │   └─► Error:
    │       ├─► Show error message
    │       └─► Set state → editing
```

**Onboarding Complete Flow:**

```
User clicks [เสร็จสิ้น] on Step 5
    │
    ├─► Validate step 5 form
    │   ├─► Invalid: Show errors, STAY on step 5
    │   └─► Valid: Continue
    │
    ├─► Call saveStep5(uid, preference)
    │
    ├─► Call setIsOnboarded(uid, true)
    │   ├─► Update candidate_information.is_onboarded
    │   └─► Update user_info.is_onboarded
    │
    ├─► Invalidate all candidate SWR keys
    │
    ├─► Set state → complete
    │
    └─► Navigate to /candidates/[id]
        (Dashboard with success message)
```

---

## 8. Validation Rules

### 8.1 Step 1: Personal Information

| Field | Rule | Error Message (Thai) |
|-------|------|----------------------|
| `first_name` | Required, 1-100 chars, Thai or English | กรุณากรอกชื่อ |
| `last_name` | Required, 1-100 chars, Thai or English | กรุณากรอกนามสกุล |
| `email` | Required, valid email format | กรุณากรอกอีเมลที่ถูกต้อง |
| `phone` | Required, 10 digits, starts with 0 | กรุณากรอกเบอร์โทรศัพท์ 10 หลัก |
| `birthdate` | Required, age ≥ 18 | ต้องมีอายุ 18 ปีขึ้นไป |
| `province` | Required, from master data | กรุณาเลือกจังหวัด |
| `district` | Optional, from master data | - |

### 8.2 Step 2: Work Experience

| Field | Rule | Error Message (Thai) |
|-------|------|----------------------|
| `works[]` | Required: ≥1 entry OR `is_fresh_graduate=true` | กรุณาเพิ่มประสบการณ์ หรือเลือกนักศึกษาจบใหม่ |
| `works[].company` | Required, 1-200 chars | กรุณากรอกชื่อบริษัท |
| `works[].position` | Required, 1-200 chars | กรุณากรอกตำแหน่ง |
| `works[].start_month` | Required, 1-12 | กรุณาเลือกเดือนเริ่มงาน |
| `works[].start_year` | Required, 1950-current | กรุณาเลือกปีเริ่มงาน |
| `works[].end_month` | Required if `!is_current` | กรุณาเลือกเดือนสิ้นสุด |
| `works[].end_year` | Required if `!is_current`, ≥ start_year | ปีสิ้นสุดต้องมากกว่าหรือเท่ากับปีเริ่มต้น |
| `works[].is_current` | Boolean, only one can be true | - |

### 8.3 Step 3: Education

| Field | Rule | Error Message (Thai) |
|-------|------|----------------------|
| `educations[]` | Required: exactly 1 entry (highest) | กรุณาเพิ่มประวัติการศึกษา |
| `educations[].level` | Required, from master data | กรุณาเลือกระดับการศึกษา |
| `educations[].institution` | Required, 1-200 chars | กรุณากรอกชื่อสถาบัน |
| `educations[].faculty` | Required, 1-100 chars | กรุณากรอกคณะ/สาขา |
| `educations[].graduation_year` | Required, 1950-current | กรุณาเลือกปีที่จบ |
| `educations[].gpa` | Optional, 0.00-4.00 | เกรดเฉลี่ยต้องอยู่ระหว่าง 0.00-4.00 |

### 8.4 Step 4: Skills

| Field | Rule | Error Message (Thai) |
|-------|------|----------------------|
| `skills[]` | Required: ≥1 skill | กรุณาเพิ่มอย่างน้อย 1 ทักษะ |
| `skills[].name` | Required, 1-100 chars | - |
| `skills[].level` | Optional, enum | - |
| `languages[]` | Optional | - |
| `languages[].name` | Required if added | กรุณาเลือกภาษา |
| `languages[].level` | Required if added | กรุณาเลือกระดับความสามารถ |

### 8.5 Step 5: Job Preferences

| Field | Rule | Error Message (Thai) |
|-------|------|----------------------|
| `job_types[]` | Required: ≥1 selected | กรุณาเลือกประเภทงานอย่างน้อย 1 รายการ |
| `positions[]` | Required: ≥1 position | กรุณาเพิ่มตำแหน่งที่สนใจอย่างน้อย 1 ตำแหน่ง |
| `salary_min` | Required, ≥0 | กรุณากรอกเงินเดือนขั้นต่ำ |
| `salary_max` | Required, ≥ salary_min | เงินเดือนสูงสุดต้องมากกว่าหรือเท่ากับขั้นต่ำ |
| `locations[]` | Required: ≥1 location | กรุณาเลือกพื้นที่ทำงานอย่างน้อย 1 แห่ง |
| `availability` | Required, enum | กรุณาเลือกความพร้อมเริ่มงาน |

---

## 9. Error Handling

### 9.1 HTTP Errors

| Error | Display | Recovery |
|-------|---------|----------|
| 401 Unauthorized | Redirect to `/auth/login?redirect=...` | Re-authenticate |
| 403 Forbidden | 403 page "ไม่มีสิทธิ์เข้าถึง" | Go to own profile |
| 404 Not Found | 404 page "ไม่พบหน้านี้" | Go to dashboard |
| 500 Server Error | Toast "เกิดข้อผิดพลาด กรุณาลองใหม่" | Retry button |

### 9.2 Validation Errors

| Error | Display | Location |
|-------|---------|----------|
| Field validation | Inline error below field | Form field |
| Form validation | Toast summary | Top of form |
| Array minimum | Toast "ต้องมีอย่างน้อย X รายการ" | Above array |
| Array maximum | Toast "เพิ่มได้สูงสุด X รายการ" | Add button |

### 9.3 File Upload Errors

| Error | Display | Recovery |
|-------|---------|----------|
| File too large | Toast "ไฟล์ใหญ่เกิน 10MB" | Select smaller file |
| Invalid type | Toast "รองรับเฉพาะ PDF, DOC" | Select valid file |
| Upload failed | Toast "อัปโหลดไม่สำเร็จ" | Retry button |
| Network error | Toast "ไม่มีการเชื่อมต่อ" | Retry when online |

### 9.4 Save Errors

| Error | Display | Recovery |
|-------|---------|----------|
| Save failed | Toast "บันทึกไม่สำเร็จ" | Retry button |
| Concurrent edit | Toast "ข้อมูลถูกแก้ไขโดยอุปกรณ์อื่น" | Reload & retry |
| Session expired | Modal "เซสชันหมดอายุ" | Re-login |

---

## 10. Implementation Checklist

### Phase 1: Foundation

- [ ] 1.1 Route setup with dynamic `[id]` parameter
- [ ] 1.2 Page mode detection based on `isOnboarded`
- [ ] 1.3 Owner-only access middleware
- [ ] 1.4 SWR data fetching with `candidateKeys.candidate(uid)`

### Phase 2: Onboarding Mode

- [ ] 2.1 `OnboardingWizard` container component
- [ ] 2.2 `WizardStepIndicator` with 5 steps (all required)
- [ ] 2.3 Step 1: Personal Info form
- [ ] 2.4 Step 2: Work Experience with Fresh Graduate toggle
- [ ] 2.5 Step 3: Education (single entry)
- [ ] 2.6 Step 4: Skills with combobox pattern
- [ ] 2.7 Step 5: Job Preferences
- [ ] 2.8 Wizard navigation (Back/Next/Finish)
- [ ] 2.9 `setIsOnboarded(true)` on complete
- [ ] 2.10 Redirect to dashboard on complete

### Phase 3: Profile Mode

- [ ] 3.1 `ProfileHeader` with avatar, name, completion
- [ ] 3.2 `PersonalInfoSection` with inline view
- [ ] 3.3 `WorkExperienceSection` with array display
- [ ] 3.4 `EducationSection` with array display
- [ ] 3.5 `SkillsSection` with tags display
- [ ] 3.6 `JobPreferencesSection` with summary view
- [ ] 3.7 `AboutMeSection` with text display
- [ ] 3.8 `DocumentsSection` with file list
- [ ] 3.9 Edit button on each section

### Phase 4: Edit Drawers

- [ ] 4.1 `EditDrawer` base component
- [ ] 4.2 Personal Info edit form
- [ ] 4.3 Work Experience edit form (array CRUD)
- [ ] 4.4 Education edit form (array CRUD)
- [ ] 4.5 Skills edit form
- [ ] 4.6 Job Preferences edit form
- [ ] 4.7 About Me edit form
- [ ] 4.8 Dirty state detection
- [ ] 4.9 Discard confirmation modal

### Phase 5: Preview Modal

- [ ] 5.1 `PreviewModal` component
- [ ] 5.2 Read-only profile view
- [ ] 5.3 Print functionality
- [ ] 5.4 PDF export

### Phase 6: File Upload

- [ ] 6.1 Document upload component
- [ ] 6.2 File validation (size, type)
- [ ] 6.3 Upload progress indicator
- [ ] 6.4 Document list with delete

### Phase 7: Polish

- [ ] 7.1 Loading states
- [ ] 7.2 Error states
- [ ] 7.3 Empty states
- [ ] 7.4 Mobile responsive
- [ ] 7.5 Thai localization
- [ ] 7.6 Accessibility (keyboard, screen reader)

---

## 11. Decisions Log

| Decision | Chosen | Rationale | Date |
|----------|--------|-----------|------|
| Remove 5-tab structure | Inline-edit sections | Lower cognitive load, industry standard (LinkedIn) | 2025-12-09 |
| Onboarding as page mode | Auto-detect via `isOnboarded` flag | Onboarding is blocking flow, not parallel choice | 2025-12-09 |
| All 5 steps required | No skipping | Creates minimum viable resume for job matching | 2025-12-09 |
| Fresh graduate option | Toggle in Step 2 | Allows users without work experience to complete | 2025-12-09 |
| Single education in onboarding | Exactly 1 entry (highest) | Simplifies onboarding, can add more later in profile mode | 2025-12-09 |
| Skills: select or enter | Combobox pattern | Flexibility while maintaining data quality | 2025-12-09 |
| Preview as modal | Button triggers modal | View toggle, not separate content | 2025-12-09 |
| Supersedes 04-candidate-routes.md Section 5.2 | Yes | UX improvements discovered during RIS analysis | 2025-12-09 |
| Collection name | `candidate_information` | Per PROJECT_INSTRUCTIONS.md key decisions | 2025-12-09 |
| Atom name | `activeRoleAtom` | Per PROJECT_INSTRUCTIONS.md key decisions | 2025-12-09 |

---

## Appendix A: TypeScript Interfaces

```typescript
// Page Mode
type PageMode = 'loading' | 'checking_onboarded' | 'onboarding_mode' | 'profile_mode' | 'preview_modal_open' | 'redirecting' | 'unauthorized' | 'error';

// Wizard Step
type WizardStep = 'step_1' | 'step_2' | 'step_3' | 'step_4' | 'step_5' | 'complete';

// Section Edit State
type SectionEditState = 'viewing' | 'editing' | 'saving' | 'confirm_discard';

// Array Item State
type ArrayItemState = 'list_view' | 'adding' | 'editing_item' | 'confirm_delete';

// Fresh Graduate State
type FreshGraduateState = 'has_experience' | 'confirm_clear' | 'is_fresh_grad';

// Skill Search State
type SkillSearchState = 'idle' | 'searching';

// File Upload State
type FileUploadState = 'idle' | 'validating' | 'uploading';

// Preview Modal State
type PreviewModalState = 'closed' | 'open' | 'exporting';

// Candidate Profile Data
interface CandidateProfile {
  uid: string;
  first_name_th: string;
  last_name_th: string;
  first_name_en?: string;
  last_name_en?: string;
  nick_name_th?: string;
  email: string;
  phone_number: string;
  birthdate: Timestamp;
  address_line_1?: string;
  district?: string;
  province: string;
  post_code?: string;
  about_me?: string;
  area_of_expertise?: string;
  achievement?: string;
  experience_years?: number;
  educations: Education[];
  works: WorkExperience[];
  skills: Skill[];
  languages: Language[];
  licenses: Certificate[];
  documents?: Document[];
  is_active: boolean;
  is_searchable: boolean;
  is_onboarded: boolean;
  is_preference_set: boolean;
  is_resume_completed: boolean;
  is_fresh_graduate?: boolean;
  photo_url?: string;
  created_at: number;
  updated_at: number;
}

// Work Experience
interface WorkExperience {
  id: string;
  company: string;
  position: string;
  job_industry?: string;
  job_function?: string;
  start_month: number;
  start_year: number;
  end_month?: number;
  end_year?: number;
  is_current: boolean;
  salary?: number;
  note?: string;
}

// Education
interface Education {
  id: string;
  institution: string;
  level: number;
  level_label: string;
  faculty: string;
  minor?: string;
  start_year?: number;
  end_year: number;
  gpa?: string;
  highlights?: string;
}

// Skill
interface Skill {
  id: string;
  name: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  is_certified?: boolean;
  certificate_name?: string;
  certificate_score?: string;
}

// Language
interface Language {
  id: string;
  name: string;
  level: 'พื้นฐาน' | 'ปานกลาง' | 'ดี' | 'ดีมาก' | 'เชี่ยวชาญ';
  is_certified?: boolean;
  certificate_name?: string;
  certificate_score?: string;
}

// Certificate
interface Certificate {
  id: string;
  name: string;
  issuer?: string;
  certified_date: number;
  score?: string;
  note?: string;
  url?: string;
}

// Job Preference
interface JobPreference {
  uid: string;
  job_types: string[];
  positions: string[];
  job_functions?: string[];
  job_industries?: string[];
  salary_min: number;
  salary_max: number;
  is_negotiable: boolean;
  locations: string[];
  work_mode?: 'onsite' | 'hybrid' | 'remote' | 'any';
  availability: 'immediately' | '2_weeks' | '1_month' | '2_months_plus';
  expected_start_date?: Timestamp;
  i_am?: string;
  i_am_looking_for?: string[];
  i_values?: string[];
  headlines?: string;
  created_at: number;
  updated_at: number;
}
```

---

## Appendix B: Server Actions

```typescript
// Profile Updates
export async function updatePersonalInfo(uid: string, data: PersonalInfoInput): Promise<ActionResult>;
export async function updateWorkExperience(uid: string, works: WorkExperience[]): Promise<ActionResult>;
export async function updateEducation(uid: string, educations: Education[]): Promise<ActionResult>;
export async function updateSkills(uid: string, skills: Skill[], languages: Language[]): Promise<ActionResult>;
export async function updateJobPreferences(uid: string, preference: JobPreferenceInput): Promise<ActionResult>;
export async function updateAboutMe(uid: string, data: AboutMeInput): Promise<ActionResult>;

// Lifecycle
export async function setIsOnboarded(uid: string, value: boolean): Promise<ActionResult>;
export async function setIsSearchable(uid: string, value: boolean): Promise<ActionResult>;

// Documents
export async function uploadDocument(uid: string, file: File): Promise<ActionResult<DocumentInfo>>;
export async function deleteDocument(uid: string, docId: string): Promise<ActionResult>;

// Export
export async function exportProfilePDF(uid: string): Promise<ActionResult<Blob>>;
```

---

## Appendix C: Profile Completion Calculation

```typescript
function calculateProfileCompletion(profile: CandidateProfile, preference: JobPreference): number {
  const weights = {
    personal_info: 20,    // name, email, phone, birthdate, address
    work_experience: 20,  // at least 1 work OR fresh_graduate
    education: 15,        // at least 1 education
    skills: 15,           // at least 1 skill
    job_preferences: 20,  // all required preference fields
    about_me: 5,          // about_me text
    documents: 5,         // at least 1 document
  };

  let score = 0;

  // Personal Info (20%)
  if (profile.first_name_th && profile.last_name_th && profile.email && 
      profile.phone_number && profile.birthdate && profile.province) {
    score += weights.personal_info;
  }

  // Work Experience (20%)
  if (profile.is_fresh_graduate || profile.works.length > 0) {
    score += weights.work_experience;
  }

  // Education (15%)
  if (profile.educations.length > 0) {
    score += weights.education;
  }

  // Skills (15%)
  if (profile.skills.length > 0) {
    score += weights.skills;
  }

  // Job Preferences (20%)
  if (preference && preference.job_types?.length > 0 && 
      preference.positions?.length > 0 && 
      preference.salary_min !== undefined && 
      preference.salary_max !== undefined &&
      preference.locations?.length > 0 &&
      preference.availability) {
    score += weights.job_preferences;
  }

  // About Me (5%)
  if (profile.about_me && profile.about_me.length > 0) {
    score += weights.about_me;
  }

  // Documents (5%)
  if (profile.documents && profile.documents.length > 0) {
    score += weights.documents;
  }

  return score;
}
```

---

## Appendix D: Field-to-Collection Mapping

| UI Field | Collection | Field Path |
|----------|------------|------------|
| First Name (TH) | `candidate_information` | `first_name_th` |
| Last Name (TH) | `candidate_information` | `last_name_th` |
| First Name (EN) | `candidate_information` | `first_name_en` |
| Last Name (EN) | `candidate_information` | `last_name_en` |
| Nickname | `candidate_information` | `nick_name_th` |
| Email | `candidate_information` | `email` |
| Phone | `candidate_information` | `phone_number` |
| Birthdate | `candidate_information` | `birthdate` |
| Province | `candidate_information` | `province` |
| District | `candidate_information` | `district` |
| Sub-district | `candidate_information` | `sub_district` |
| Postal Code | `candidate_information` | `post_code` |
| Address Line | `candidate_information` | `address_line_1` |
| Photo URL | `candidate_information` | `photo_url` |
| About Me | `candidate_information` | `about_me` |
| Expertise | `candidate_information` | `area_of_expertise` |
| Achievement | `candidate_information` | `achievement` |
| Work Experience | `candidate_information` | `works[]` |
| Education | `candidate_information` | `educations[]` |
| Skills | `candidate_information` | `skills[]` |
| Languages | `candidate_information` | `languages[]` |
| Certificates | `candidate_information` | `licenses[]` |
| Documents | `candidate_information` | `documents[]` |
| Fresh Graduate | `candidate_information` | `is_fresh_graduate` |
| Searchable | `candidate_information` | `is_searchable` |
| Onboarded | `candidate_information` | `is_onboarded` |
| Job Types | `candidate_preference` | `job_types` |
| Positions | `candidate_preference` | `positions` |
| Salary Min | `candidate_preference` | `salary_min` |
| Salary Max | `candidate_preference` | `salary_max` |
| Negotiable | `candidate_preference` | `is_negotiable` |
| Locations | `candidate_preference` | `locations` |
| Availability | `candidate_preference` | `availability` |
| Work Mode | `candidate_preference` | `work_mode` |

---

## Appendix E: Skills Master Data Structure

```typescript
// Master Skills (from master_skills collection)
interface MasterSkill {
  id: string;
  name: string;
  category?: string;    // e.g., "Programming", "Design", "Communication"
  is_popular: boolean;  // Show in popular suggestions
}

// Skill Selection Behavior
// 1. User can SELECT from master_skills (autocomplete)
// 2. User can ENTER new skill (free text) → stored in profile only
// 3. Popular skills shown as quick-select chips
// 4. Search filters master_skills by name (case-insensitive, partial match)

// Popular Skills (default display)
const popularSkills = [
  'Microsoft Office',
  'Excel',
  'Communication',
  'English',
  'Customer Service',
  'Sales',
  'Marketing',
  'Accounting',
];
```

---

## Appendix F: Education Levels (Master Data)

| Value | Thai Label | English Label |
|-------|------------|---------------|
| 1 | มัธยมศึกษาตอนต้น | Junior High School |
| 2 | มัธยมศึกษาตอนปลาย | Senior High School |
| 3 | ปวช. | Vocational Certificate |
| 4 | ปวส. | High Vocational Certificate |
| 5 | ปริญญาตรี | Bachelor's Degree |
| 6 | ปริญญาโท | Master's Degree |
| 7 | ปริญญาเอก | Doctoral Degree |

---

## Appendix G: Availability Options

| Value | Thai Label |
|-------|------------|
| `immediately` | ทันที |
| `1_week` | ภายใน 1 สัปดาห์ |
| `2_weeks` | ภายใน 2 สัปดาห์ |
| `1_month` | ภายใน 1 เดือน |
| `2_months` | ภายใน 2 เดือน |
| `3_months_plus` | มากกว่า 3 เดือน |
| `custom` | ระบุวันที่ |

---

*End of RIS Document*
