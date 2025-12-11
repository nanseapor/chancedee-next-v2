# BLS-08: Candidate Profile Stage

**Stage:** Candidate Profile  
**Version:** 2.0  
**Last Updated:** 2025-12-11  
**Actions Count:** 7

> **Revision 2.0:** Split from combined Profile stage. Company profile moved to BLS-09. Account management (password, deletion) moved to BLS-00 cross-cutting.

---

## Stage Overview

The Candidate Profile Stage handles candidate identity and preference management, including initial onboarding, profile editing, and visibility settings.

### Stage Boundaries

| Aspect | Scope |
|--------|-------|
| **Enters from** | Registration (BLS-01), Candidate Dashboard |
| **Flows to** | BLS-02 Discovery (searchable profiles), BLS-03 Application (profile data used) |
| **Primary Actor** | Candidate only |
| **Data Sources** | `candidate_information`, `candidate_preference` |

### Actions in This Stage

| Action ID | Action Name | Trigger | Primary Collection |
|-----------|-------------|---------|-------------------|
| BLS-08-01 | completeOnboarding | First login (new user) | `candidate_information` |
| BLS-08-02 | editCandidateProfile | Edit button | `candidate_information` |
| BLS-08-03 | updateJobPreferences | Preferences section | `candidate_preference` |
| BLS-08-04 | toggleProfileVisibility | Toggle switch | `candidate_information` |
| BLS-08-05 | uploadDocument | Upload button | Firebase Storage |
| BLS-08-06 | previewProfile | Preview button | Read-only |
| BLS-08-07 | updateCandidateSettings | Settings toggles | `candidate_information` |

### Profile Completion Calculation

```
┌─────────────────────────────────────────────────────────────┐
│  Personal Info (20%)  │  Work Experience (20%)              │
├───────────────────────┼─────────────────────────────────────┤
│  Education (15%)      │  Skills (15%)                       │
├───────────────────────┼─────────────────────────────────────┤
│  Job Preferences (20%)│  About Me (5%) │ Documents (5%)     │
└─────────────────────────────────────────────────────────────┘
                        Total: 100%
```

```typescript
function calculateProfileCompletion(profile: CandidateProfile, preference: JobPreference): number {
  let score = 0;
  
  // Personal Info (20%) - name, email, phone, birthdate, address
  if (profile.first_name_th && profile.last_name_th && profile.email && 
      profile.phone_number && profile.birthdate && profile.province) {
    score += 20;
  }
  
  // Work Experience (20%) - at least 1 work OR fresh_graduate
  if (profile.is_fresh_graduate || profile.works.length > 0) {
    score += 20;
  }
  
  // Education (15%) - at least 1 education
  if (profile.educations.length > 0) {
    score += 15;
  }
  
  // Skills (15%) - at least 1 skill
  if (profile.skills.length > 0) {
    score += 15;
  }
  
  // Job Preferences (20%) - all required preference fields
  if (preference?.job_types?.length > 0 && 
      preference?.positions?.length > 0 && 
      preference?.salary_min !== undefined && 
      preference?.locations?.length > 0 &&
      preference?.availability) {
    score += 20;
  }
  
  // About Me (5%)
  if (profile.about_me?.length > 0) {
    score += 5;
  }
  
  // Documents (5%)
  if (profile.documents?.length > 0) {
    score += 5;
  }
  
  return score;
}
```

---

## BLS-08-01: completeOnboarding

### Description
5-step wizard for new candidates to complete minimum viable profile. **All steps required** before accessing platform features.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| CAND-R02_profile_RIS.md | Section 6 | Onboarding wizard spec |
| features_candidates.md | CAND-003 | Multi-step wizard feature |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | User authenticated | `sessionStateAtom === 'valid'` | Redirect to login |
| 2 | Candidate role | `navBarAtom === 'candidate'` | Redirect |
| 3 | Not onboarded | `candidate.isOnboarded === false` | Show profile editor |

### Wizard Steps
| Step | Name | Required Fields | Validation |
|------|------|-----------------|------------|
| 1 | Personal Info | firstName, lastName, email, phone, birthdate, province | All required |
| 2 | Work Experience | works[] OR isFreshGraduate | At least 1 entry or toggle |
| 3 | Education | educations[] | At least 1 entry |
| 4 | Skills | skills[] | At least 1 skill |
| 5 | Job Preferences | jobTypes, positions, salary, locations, availability | All required |

### Step 1: Personal Info
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| firstNameTh | string | Yes | Non-empty |
| lastNameTh | string | Yes | Non-empty |
| firstNameEn | string | No | - |
| lastNameEn | string | No | - |
| nickName | string | No | - |
| email | string | Yes | Valid email |
| phoneNumber | string | Yes | Thai mobile format |
| birthdate | Date | Yes | Age >= 15 |
| province | string | Yes | Valid province |
| district | string | No | Valid district |
| photoUrl | string | No | Valid URL |

### Step 2: Work Experience
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| isFreshGraduate | boolean | No | - |
| works | WorkExperience[] | Conditional | Required if not fresh graduate |

```typescript
interface WorkExperience {
  companyName: string;      // Required
  position: string;         // Required
  startDate: Date;          // Required
  endDate?: Date;           // Optional (null = current)
  isCurrent: boolean;
  description?: string;
}
```

### Step 3: Education
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| educations | Education[] | Yes | At least 1 entry |

```typescript
interface Education {
  institution: string;      // Required
  degree: string;           // Required (from master_education_levels)
  fieldOfStudy?: string;
  graduationYear?: number;
  gpa?: number;             // 0.00 - 4.00
}
```

### Step 4: Skills
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| skills | Skill[] | Yes | At least 1 skill |
| languages | Language[] | No | - |

```typescript
interface Skill {
  name: string;             // From master_skills or free text
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

interface Language {
  name: string;             // From master_languages
  level: 'basic' | 'conversational' | 'fluent' | 'native';
}
```

### Step 5: Job Preferences
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| jobTypes | string[] | Yes | At least 1 |
| positions | string[] | Yes | At least 1 |
| salaryMin | number | Yes | >= 0 |
| salaryMax | number | Yes | >= salaryMin |
| isNegotiable | boolean | No | - |
| locations | string[] | Yes | At least 1 province |
| workMode | string | No | 'onsite' \| 'hybrid' \| 'remote' \| 'any' |
| availability | string | Yes | Valid enum |

### State Changes

**Firestore:**
| Operation | Collection | Document ID | Fields | Condition |
|-----------|------------|-------------|--------|-----------|
| Update | `candidate_information` | candidateId | Step fields | Per step save |
| Update | `candidate_information` | candidateId | `is_onboarded: true` | Step 5 complete |
| Update | `user_info` | candidateId | `is_onboarded: true` | Step 5 complete |
| Create/Update | `candidate_preference` | candidateId | Step 5 fields | Step 5 save |

**Jotai Atoms:**
| Atom | Before | After |
|------|--------|-------|
| `candidateAtom` | Partial data | Complete profile |
| `editCandidateAtom` | Draft state | Cleared |

**SWR Cache:**
| Key | Action |
|-----|--------|
| `candidate-${uid}` | Invalidate |
| `candidate-dashboard-${uid}` | Invalidate |

### Server Actions
```typescript
// Step-wise save
async function updatePersonalInfo(uid: string, data: PersonalInfoInput): Promise<ActionResult>;
async function updateWorkExperience(uid: string, works: WorkExperience[]): Promise<ActionResult>;
async function updateEducation(uid: string, educations: Education[]): Promise<ActionResult>;
async function updateSkills(uid: string, skills: Skill[], languages: Language[]): Promise<ActionResult>;
async function updateJobPreferences(uid: string, preference: JobPreferenceInput): Promise<ActionResult>;

// Complete onboarding
async function setIsOnboarded(uid: string, value: boolean): Promise<ActionResult>;
```

### UI Feedback
| Scenario | Feedback Type | Display |
|----------|---------------|---------|
| Step saving | Button loading | Spinner |
| Validation error | Inline errors | Field-level messages |
| Step complete | Progress update | Step indicator advances |
| All complete | Success + redirect | "ยินดีต้อนรับ!" → Dashboard |

### Navigation Guards
| Guard | Condition | Behavior |
|-------|-----------|----------|
| Back button | Unsaved changes | Confirm discard modal |
| Browser back | During wizard | Warn about progress loss |
| Direct URL | Not onboarded | Redirect to step 1 |

---

## BLS-08-02: editCandidateProfile

### Description
Edit existing profile sections via inline edit pattern. Click section → drawer opens → save → close.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| CAND-R02_profile_RIS.md | Section 6.2, 7 | Inline edit pattern |
| features_candidates.md | CAND-004 to CAND-008 | Update features |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | User authenticated | Session valid | Redirect |
| 2 | Onboarded | `candidate.isOnboarded === true` | Show onboarding |
| 3 | Owner | `candidateId === user.uid` | Access denied |

### Editable Sections
| Section | Fields | Drawer Title | Feature ID |
|---------|--------|--------------|------------|
| Personal Info | name, contact, birthdate, address, photo | ข้อมูลส่วนตัว | CAND-004 |
| Work Experience | works[] (add/edit/delete) | ประสบการณ์ทำงาน | CAND-005 |
| Education | educations[] (add/edit/delete) | ประวัติการศึกษา | CAND-006 |
| Skills & Languages | skills[], languages[] | ทักษะและภาษา | CAND-007 |
| About Me | aboutMe, areaOfExpertise, achievement | เกี่ยวกับฉัน | CAND-008 |

### State Changes

**Jotai Atoms:**
| Atom | Before | After |
|------|--------|-------|
| `editCandidateAtom` | null | Section draft |
| `candidateAtom` | Current | Updated on save |

**SWR Cache:**
| Key | Action |
|-----|--------|
| `candidate-${uid}` | Invalidate on save |
| `candidate-dashboard-${uid}` | Invalidate on save |

### Server Actions
```typescript
// Section updates (same as onboarding but for existing data)
async function updatePersonalInfo(uid: string, data: PersonalInfoInput): Promise<ActionResult>;
async function updateWorkExperience(uid: string, works: WorkExperience[]): Promise<ActionResult>;
async function updateEducation(uid: string, educations: Education[]): Promise<ActionResult>;
async function updateSkills(uid: string, skills: Skill[], languages: Language[]): Promise<ActionResult>;
async function updateAboutMe(uid: string, data: AboutMeInput): Promise<ActionResult>;
```

### UI Feedback
| Scenario | Feedback Type | Display |
|----------|---------------|---------|
| Opening section | Drawer slide | Section form appears |
| Saving | Button loading | Spinner |
| Success | Toast + close drawer | "บันทึกแล้ว" |
| Validation error | Inline errors | Field-level messages |
| Discard changes | Modal | "ยกเลิกการแก้ไข?" |

---

## BLS-08-03: updateJobPreferences

### Description
Update job search preferences including desired positions, salary, locations, and availability.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| CAND-R02_profile_RIS.md | Section 4.2 | Job preferences |
| features_candidates.md | CAND-009 | Edit Job Preferences |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | User authenticated | Session valid | Redirect |
| 2 | Onboarded | `candidate.isOnboarded === true` | Block access |

### Inputs
| Field | Type | Required | Validation | Default |
|-------|------|----------|------------|---------|
| jobTypes | string[] | Yes | Valid enums | [] |
| positions | string[] | Yes | >= 1 | [] |
| salaryMin | number | Yes | >= 0 | null |
| salaryMax | number | Yes | >= salaryMin | null |
| isNegotiable | boolean | No | - | false |
| locations | string[] | Yes | >= 1 | [] |
| workMode | string | No | Valid enum | 'any' |
| availability | string | Yes | Valid enum | null |

### Availability Options
| Value | Thai Label |
|-------|------------|
| `immediately` | ทันที |
| `1_week` | ภายใน 1 สัปดาห์ |
| `2_weeks` | ภายใน 2 สัปดาห์ |
| `1_month` | ภายใน 1 เดือน |
| `2_months` | ภายใน 2 เดือน |
| `3_months_plus` | มากกว่า 3 เดือน |

### State Changes

**Firestore:**
| Operation | Collection | Document ID | Fields | Condition |
|-----------|------------|-------------|--------|-----------|
| Update | `candidate_preference` | candidateId | All preference fields | Always |

**SWR Cache:**
| Key | Action |
|-----|--------|
| `candidate-${uid}` | Invalidate |

### Server Action
```typescript
async function updateJobPreferences(uid: string, preference: JobPreferenceInput): Promise<ActionResult>;
```

### UI Feedback
| Scenario | Feedback Type | Display |
|----------|---------------|---------|
| Saving | Button loading | Spinner |
| Success | Toast | "บันทึกความต้องการแล้ว" |

---

## BLS-08-04: toggleProfileVisibility

### Description
Toggle `isSearchable` flag to control whether companies can find this candidate in search.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| CAND-R03_settings_RIS.md | Section 4.2 | Visibility toggle |
| features_candidates.md | CAND-013 | Toggle Profile Visibility |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | User authenticated | Session valid | Redirect |
| 2 | Onboarded | `candidate.isOnboarded === true` | Hide toggle |

### Inputs
| Field | Type | Required | Validation | Default | Source |
|-------|------|----------|------------|---------|--------|
| isSearchable | boolean | Yes | - | false | Toggle state |

### State Changes

**Firestore:**
| Operation | Collection | Document ID | Fields | Condition |
|-----------|------------|-------------|--------|-----------|
| Update | `candidate_information` | candidateId | `is_searchable` | Always |

**MeiliSearch:**
| Operation | Index | Document ID | Condition |
|-----------|-------|-------------|-----------|
| Upsert | `candidates` | candidateId | When `isSearchable: true` |
| Delete | `candidates` | candidateId | When `isSearchable: false` |

**SWR Cache:**
| Key | Action |
|-----|--------|
| `candidate-${uid}` | Optimistic update |

### Server Action
```typescript
async function setIsSearchable(uid: string, value: boolean): Promise<ActionResult>;

// Internally triggers MeiliSearch sync
async function syncCandidateSearchIndex(uid: string, isSearchable: boolean): Promise<void>;
```

### UI Feedback
| Scenario | Feedback Type | Display |
|----------|---------------|---------|
| Toggling | Optimistic update | Instant toggle |
| Success | Toast | "บันทึกแล้ว" |
| Error | Revert toggle + toast | "บันทึกไม่สำเร็จ กรุณาลองใหม่" |

### Visibility States
| State | In Firestore | In MeiliSearch | Companies Can Find |
|-------|--------------|----------------|-------------------|
| Visible | `is_searchable: true` | Indexed | Yes |
| Hidden | `is_searchable: false` | Not indexed | No |

---

## BLS-08-05: uploadDocument

### Description
Upload resume, certificates, or other documents to profile.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| CAND-R02_profile_RIS.md | Section 4.2 | Document upload |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | User authenticated | Session valid | Redirect |
| 2 | File valid | Type and size check | Show error |
| 3 | Under limit | documents.length < 10 | Show error |

### Inputs
| Field | Type | Required | Validation | Default | Source |
|-------|------|----------|------------|---------|--------|
| file | File | Yes | PDF/DOC/DOCX, max 10MB | - | File picker |
| documentType | string | No | 'resume' \| 'certificate' \| 'other' | 'other' | Dropdown |

### File Validation
| Check | Rule | Error Message |
|-------|------|---------------|
| Type | PDF, DOC, DOCX only | "รองรับไฟล์ PDF, DOC, DOCX เท่านั้น" |
| Size | Max 10MB | "ไฟล์ใหญ่เกิน 10MB" |
| Count | Max 10 documents | "อัปโหลดได้สูงสุด 10 ไฟล์" |

### State Changes

**Firebase Storage:**
| Operation | Path | Condition |
|-----------|------|-----------|
| Upload | `candidates/{uid}/documents/{timestamp}_{filename}` | Valid file |

**Firestore:**
| Operation | Collection | Document ID | Fields | Condition |
|-----------|------------|-------------|--------|-----------|
| Update (array union) | `candidate_information` | candidateId | `documents[]` | Upload success |

```typescript
interface DocumentInfo {
  uid: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  documentType: 'resume' | 'certificate' | 'other';
  uploadedAt: number;
}
```

### Server Actions
```typescript
async function uploadDocument(uid: string, file: File, documentType?: string): Promise<ActionResult<DocumentInfo>>;
async function deleteDocument(uid: string, docId: string): Promise<ActionResult>;
```

### UI Feedback
| Scenario | Feedback Type | Display |
|----------|---------------|---------|
| Uploading | Progress bar | 0-100% |
| Success | Toast + list update | "อัปโหลดสำเร็จ" |
| Error | Toast | "อัปโหลดไม่สำเร็จ" |
| Delete confirm | Modal | "ลบเอกสาร?" |
| Delete success | Toast + list update | "ลบเอกสารแล้ว" |

---

## BLS-08-06: previewProfile

### Description
Preview profile as it appears to companies. Option to export as PDF.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| CAND-R02_profile_RIS.md | Section 3 | Preview modal |
| features_candidates.md | CAND-011, CAND-012 | Preview, View Resume |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | User authenticated | Session valid | Redirect |
| 2 | Has profile data | Profile exists | Show empty state |

### Inputs
| Field | Type | Required | Validation | Default | Source |
|-------|------|----------|------------|---------|--------|
| - | - | - | - | - | Button click |

### State Changes

**Local Component State:**
| State | Before | After |
|-------|--------|-------|
| `isPreviewOpen` | false | true |

### Preview Content
| Section | Data Source | Display |
|---------|-------------|---------|
| Header | candidateAtom | Photo, name, headline |
| Contact | candidateAtom | Email, phone (masked) |
| About | candidateAtom | aboutMe text |
| Experience | candidateAtom.works | Timeline format |
| Education | candidateAtom.educations | List format |
| Skills | candidateAtom.skills | Tag chips |
| Languages | candidateAtom.languages | With proficiency |
| Documents | candidateAtom.documents | Download links |

### Server Action
```typescript
// PDF export
async function exportProfilePDF(uid: string): Promise<ActionResult<Blob>>;
```

### UI Feedback
| Scenario | Feedback Type | Display |
|----------|---------------|---------|
| Opening | Modal/drawer | Full profile preview |
| Exporting PDF | Button loading | Spinner |
| PDF ready | Download | Browser download dialog |

---

## BLS-08-07: updateCandidateSettings

### Description
Update candidate-specific settings including auto cover letter, email notifications, and push notifications.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| CAND-R03_settings_RIS.md | Full | Settings page spec |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | User authenticated | Session valid | Redirect |
| 2 | Owner | `params.id === user.uid` | Redirect to own settings |

### Settings Fields
| Field | Type | Description | Default |
|-------|------|-------------|---------|
| autoAttachCoverLetter | boolean | Auto-attach cover letter to applications | false |
| defaultCoverLetter | string | Reusable cover letter text (max 2000 chars) | '' |
| emailJobRecommendations | boolean | Receive job recommendation emails | true |

### Push Notification Settings
| Field | Type | Description | Default |
|-------|------|-------------|---------|
| pushEnabled | boolean | Enable push notifications | false |

**Push Permission Flow:**
```
User toggles ON → Check browser permission
  → 'granted' → Register FCM token
  → 'denied' → Show "enable in browser settings" message
  → 'default' → Request permission
    → granted → Register FCM token
    → denied → Show message, revert toggle
```

### State Changes

**Firestore:**
| Operation | Collection | Document ID | Fields | Condition |
|-----------|------------|-------------|--------|-----------|
| Update | `candidate_information` | candidateId | Settings fields | Always |

**FCM Tokens:**
| Operation | Collection | Document ID | Fields | Condition |
|-----------|------------|-------------|--------|-----------|
| Create | `fcm_tokens` | Auto | `user_id`, `token`, `device_type`, `status: 'active'` | Push enabled + permission granted |
| Update | `fcm_tokens` | tokenId | `status: 'inactive'` | Push disabled |

**SWR Cache:**
| Key | Action |
|-----|--------|
| `candidate-${uid}` | Invalidate |

### Server Action
```typescript
interface UpdateCandidateSettingsInput {
  uid: string;
  is_searchable?: boolean;
  auto_attach_cover_letter?: boolean;
  default_cover_letter?: string;
  email_job_recommendations?: boolean;
}

async function updateCandidateSettings(input: UpdateCandidateSettingsInput): Promise<ActionResult>;
async function registerFCMToken(uid: string, token: string, deviceType: string): Promise<ActionResult>;
async function deactivateFCMToken(tokenId: string): Promise<ActionResult>;
```

### UI Feedback
| Scenario | Feedback Type | Display |
|----------|---------------|---------|
| Toggle change | Optimistic update | Instant |
| Text change | Debounced save (500ms) | "กำลังบันทึก..." → "บันทึกแล้ว" |
| Success | Toast | "บันทึกแล้ว" |
| Push denied | Error message | "กรุณาเปิดการแจ้งเตือนในการตั้งค่าเบราว์เซอร์" |
| Error | Revert + toast | "บันทึกไม่สำเร็จ กรุณาลองใหม่" |

---

## Settings Page Layout

**Route:** `/candidates/[id]/settings`

| Section | Component | Actions |
|---------|-----------|---------|
| Account Link | Card → `/auth/settings` | Navigate to account settings |
| Profile Visibility | Toggle | BLS-08-04 |
| Application Settings | Toggle + textarea | BLS-08-07 (cover letter) |
| Notifications | Toggles | BLS-08-07 (email/push) |

---

## Stage Integration Points

### Entry Points (from other stages)
| Source Stage | Source Action | Entry Action | Trigger |
|--------------|---------------|--------------|---------|
| BLS-01 Onboarding | register | completeOnboarding | First login, `isOnboarded: false` |
| Any | Dashboard link | editCandidateProfile | Profile card click |
| Any | Settings link | updateCandidateSettings | Sidebar navigation |

### Exit Points (to other stages)
| Exit Action | Target Stage | Target Action | Trigger |
|-------------|--------------|---------------|---------|
| completeOnboarding | BLS-02 Discovery | searchJobs | Redirect after onboarding |
| toggleProfileVisibility (true) | BLS-02 | - | MeiliSearch index update |

### Cross-Stage Dependencies
| This Stage Action | Affects Stage | Effect |
|-------------------|---------------|--------|
| toggleProfileVisibility | BLS-02 Discovery | Candidate searchability in MeiliSearch |
| updateJobPreferences | BLS-02 Discovery | Job matching algorithm accuracy |
| completeOnboarding | All | Unlocks platform features |

---

## Permissions Matrix

| Action | Candidate (Owner) | Candidate (Other) | Company | Admin |
|--------|-------------------|-------------------|---------|-------|
| completeOnboarding | ✓ | ✗ | ✗ | ✗ |
| editCandidateProfile | ✓ | ✗ | ✗ | ✗ |
| updateJobPreferences | ✓ | ✗ | ✗ | ✗ |
| toggleProfileVisibility | ✓ | ✗ | ✗ | ✗ |
| uploadDocument | ✓ | ✗ | ✗ | ✗ |
| previewProfile | ✓ | ✗ | Read | Read |
| updateCandidateSettings | ✓ | ✗ | ✗ | ✗ |

---

## Related Documents

| Document | Relationship |
|----------|--------------|
| CAND-R02_profile_RIS.md | Candidate profile page specification |
| CAND-R03_settings_RIS.md | Candidate settings page specification |
| features_candidates.md | Candidate feature definitions (CAND-003 to CAND-017) |
| data-entities_candidate-information.md | Candidate schema |
| data-entities_candidate-preference.md | Preference schema |
| BLS-00_cross-cutting.md | Account management actions (password, deletion) |
| BLS-02_discovery.md | Uses `isSearchable` for candidate search |
| BLS-03_application.md | Uses profile data for applications |

---

*End of BLS-08 Candidate Profile Stage*
