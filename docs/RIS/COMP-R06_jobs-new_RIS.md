# RIS: /companies/[id]/dashboard/jobs/new

**Route ID:** COMP-R06  
**Version:** 1.0  
**Status:** Draft  
**Created:** 2025-12-10  
**Last Updated:** 2025-12-10

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-10 | Initial RIS creation for job creation wizard |

---

## 1. Route Metadata

| Property | Value |
|----------|-------|
| Route Path | `/companies/[id]/dashboard/jobs/new` |
| Route ID | COMP-R06 |
| Shell | Company Shell |
| Purpose | Create new job posting via multi-step wizard |
| Complexity | High |
| Phase | 3 (Job Management) |
| UI Spec | `05-company-routes.md` Section 6.4 |

### Route Parameters

| Parameter | Type | Source | Validation |
|-----------|------|--------|------------|
| `id` | `string` | URL path segment | Must be valid company ID |

### Query Parameters

| Parameter | Type | Default | Purpose |
|-----------|------|---------|---------|
| `draftId` | `string` | - | Resume editing existing draft |
| `duplicateFrom` | `string` | - | Pre-fill from existing job |

---

## 2. Domain Classification

### Primary Domain: Company (Job Management)

- **Owns:** Job creation workflow, draft management
- **Mutations:** Create job, save draft, publish job

### Secondary Domains

| Domain | Role | Access |
|--------|------|--------|
| Jobs | Entity operations | Write: Create new job |
| MeiliSearch | Indexing on publish | Write: Index new job |

### Global Domains (Shell-Injected)

| Domain | Requirement |
|--------|-------------|
| Auth | User must be authenticated, company member |
| Chat | FAB available |
| Notifications | Bell icon available |

---

## 3. Feature Mapping

### Existing Features (Preserve - P0)

| Feature ID | Feature Name | Coverage | Notes |
|------------|--------------|----------|-------|
| JOB-004 | Create Job | Full | 4-step wizard |
| JOB-006 | Publish Job | Action | Publish option at end |

### New Features (This Route Introduces)

| Feature | Description | Priority |
|---------|-------------|----------|
| Auto-save drafts | Save progress on field blur | P0 |
| Schedule publishing | Set future publish date | P0 |
| Duplicate job | Pre-fill from existing | P1 |
| Rich text editor | Job description formatting | P0 |

### Not Implemented in v1.0

| Feature | Description | Status |
|---------|-------------|--------|
| AI-generated description | Auto-generate from title | â˜ Future Work |
| Template library | Save/load job templates | â˜ Future Work |

---

## 4. Data Contract

### 4.1 Read Operations

| Data | Collection | Fields | Condition | SWR Key |
|------|------------|--------|-----------|---------|
| Company Data | `company_information` | `uid`, `company_name`, `status` | `uid === params.id` | `company-${id}` |
| Draft Job | `web_jobs` | All fields | `uid === query.draftId` | `job-${draftId}` |
| Source Job | `web_jobs` | All fields | `uid === query.duplicateFrom` | `job-${duplicateFrom}` |
| Job Functions | Static/Firestore | Enum list | - | `job-functions` |
| Provinces | Static | Thai provinces | - | Static data |

### 4.2 Write Operations

| Action | Server Action | Collection | Fields Modified | Guard |
|--------|---------------|------------|-----------------|-------|
| Create Draft | `JobCreate` | `web_jobs` | All fields, `jobStatus: 'draft'` | Company member |
| Update Draft | `JobUpdate` | `web_jobs` | Changed fields | Owner of draft |
| Publish Now | `JobPostSet` | `web_jobs` | `jobStatus: 'published'`, dates | Owner, fields valid |
| Schedule | `JobPostSet` | `web_jobs` | `jobStatus: 'ontimer'`, dates | Owner, fields valid |
| Save as Draft | `JobUpdate` | `web_jobs` | Keep `jobStatus: 'draft'` | Owner |

### 4.3 Auto-Save Strategy

```typescript
// Field-level auto-save with debounce
const debouncedSave = useDebouncedCallback(
  async (fieldName: string, value: any) => {
    if (!draftId) {
      // First save creates draft
      const newDraft = await createJobDraft({ ...formData, [fieldName]: value });
      router.replace(`?draftId=${newDraft.uid}`, { shallow: true });
    } else {
      // Subsequent saves update draft
      await updateJobDraft(draftId, { [fieldName]: value });
    }
    setLastSaved(new Date());
  },
  1000 // 1 second debounce
);
```

---

## 5. State Contract

### 5.1 Atoms

| Atom | Type | R/W | Purpose |
|------|------|-----|---------|
| `userAtom` | `userDataProps \| null` | R | Get user roles, companyId |
| `firebaseUserAtom` | `User \| null` | R | Verify authenticated |
| `companyAtom` | `companyDataProps \| null` | R | Company data for defaults |

### 5.2 Hooks

| Hook | Returns | Purpose |
|------|---------|---------|
| `useJobForm` | Form state, validation, handlers | Wizard form management |
| `useJobDraft` | `{ draft, saveDraft, createDraft }` | Draft operations |
| `useJobPublish` | `{ publish, schedule }` | Publishing actions |
| `useRouter` | Next.js router | Navigation, URL updates |
| `useSearchParams` | Query params | Draft ID, duplicate source |

### 5.3 SWR Keys

| Key Pattern | Purpose | Config |
|-------------|---------|--------|
| `company-${id}` | Company data | Shell-level |
| `job-${draftId}` | Draft being edited | `refreshInterval: 0` |
| `job-functions` | Job function enum | `revalidateOnFocus: false` |

### 5.4 Local Component State

| State | Type | Initial | Purpose |
|-------|------|---------|---------|
| `currentStep` | `1 \| 2 \| 3 \| 4` | `1` | Active wizard step |
| `formData` | `JobFormData` | Empty/draft | Form values |
| `errors` | `Record<string, string>` | `{}` | Validation errors |
| `isDirty` | `boolean` | `false` | Unsaved changes flag |
| `lastSaved` | `Date \| null` | `null` | Last auto-save timestamp |
| `isSaving` | `boolean` | `false` | Save in progress |
| `publishModal` | `PublishModalState` | `null` | Publish options modal |

---

## 6. UI State Machine

### 6.1 Wizard State Automaton

```
                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                    â”‚        LOADING              â”‚
                    â”‚    (check draft/duplicate)  â”‚
                    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                  â”‚
                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                    â”‚                           â”‚
                    â–¼                           â–¼
             [load_draft]               [fresh_start]
                    â”‚                           â”‚
                    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                â”‚
                                â–¼
                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                    â”‚       STEP_1_BASIC          â”‚
                    â”‚  Title, Type, Level, Salary â”‚
                    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                  â”‚
                             VALIDATE_STEP_1
                                  â”‚
                                  â–¼
                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                    â”‚       STEP_2_DETAILS        â”‚
                    â”‚  Description, Requirements  â”‚
                    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                  â”‚
                             VALIDATE_STEP_2
                                  â”‚
                                  â–¼
                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                    â”‚       STEP_3_LOCATION       â”‚
                    â”‚  Work Mode, Province, BTS   â”‚
                    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                  â”‚
                             VALIDATE_STEP_3
                                  â”‚
                                  â–¼
                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                    â”‚       STEP_4_REVIEW         â”‚
                    â”‚    Preview + Publish Opts   â”‚
                    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                  â”‚
                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                    â”‚             â”‚             â”‚
                    â–¼             â–¼             â–¼
            [publish_now]  [schedule]    [save_draft]
                    â”‚             â”‚             â”‚
                    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                  â”‚
                                  â–¼
                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                    â”‚         SUCCESS             â”‚
                    â”‚   â†’ Navigate to job list    â”‚
                    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

#### Wizard Step Transition Table

| Current State | Event | Next State | Guard Condition | Side Effects |
|---------------|-------|------------|-----------------|--------------|
| `loading` | `DRAFT_FOUND` | `step_1_basic` | `draftId` in URL | Load draft data |
| `loading` | `DUPLICATE_FOUND` | `step_1_basic` | `duplicateFrom` in URL | Copy source data |
| `loading` | `NO_DRAFT` | `step_1_basic` | No query params | Fresh form |
| `step_1_basic` | `NEXT` | `step_2_details` | Step 1 valid | Auto-save |
| `step_2_details` | `BACK` | `step_1_basic` | - | - |
| `step_2_details` | `NEXT` | `step_3_location` | Step 2 valid | Auto-save |
| `step_3_location` | `BACK` | `step_2_details` | - | - |
| `step_3_location` | `NEXT` | `step_4_review` | Step 3 valid | Auto-save |
| `step_4_review` | `BACK` | `step_3_location` | - | - |
| `step_4_review` | `PUBLISH_NOW` | `publishing` | All steps valid | Set dates, publish |
| `step_4_review` | `SCHEDULE` | `publishing` | All valid, future date | Set ontimer |
| `step_4_review` | `SAVE_DRAFT` | `success` | - | Keep as draft |
| `publishing` | `SUCCESS` | `success` | - | Navigate to list |
| `publishing` | `ERROR` | `step_4_review` | - | Show error toast |

### 6.2 Auto-Save State Machine

| Current State | Event | Next State | Guard Condition | Side Effects |
|---------------|-------|------------|-----------------|--------------|
| `idle` | `FIELD_CHANGE` | `dirty` | - | Mark dirty |
| `dirty` | `FIELD_BLUR` | `debouncing` | - | Start 1s timer |
| `debouncing` | `FIELD_CHANGE` | `debouncing` | - | Reset timer |
| `debouncing` | `TIMER_COMPLETE` | `saving` | - | Execute save |
| `saving` | `SAVE_SUCCESS` | `saved` | - | Update lastSaved |
| `saving` | `SAVE_ERROR` | `dirty` | - | Show error toast |
| `saved` | `FIELD_CHANGE` | `dirty` | - | Mark dirty again |

### 6.3 Navigation Guard State Machine

| Current State | Event | Next State | Guard Condition | Side Effects |
|---------------|-------|------------|-----------------|--------------|
| `idle` | `NAVIGATE_ATTEMPT` | `confirming` | `isDirty === true` | Show modal |
| `confirming` | `CONFIRM_LEAVE` | `navigating` | - | Allow navigation |
| `confirming` | `CANCEL` | `idle` | - | Stay on page |
| `navigating` | `NAVIGATION_COMPLETE` | `idle` | - | Reset state |

---

## 7. Component-Action Wiring

### 7.1 Wizard Header

| Component | Data Source | Action | Target |
|-----------|-------------|--------|--------|
| Back Button | - | Click | Navigation guard â†’ list |
| Step Indicator | `currentStep` | - | Visual progress |
| Save Status | `lastSaved`, `isSaving` | - | "à¸šà¸±à¸™à¸—à¸¶à¸à¸£à¹ˆà¸²à¸‡à¹à¸¥à¹‰à¸§ HH:mm" |

### 7.2 Step 1: Basic Information

| Field | Type | Required | Validation | Server Field |
|-------|------|----------|------------|--------------|
| Job Title | Text input | Yes | Min 5 chars, max 100 | `title` |
| Department | Select | No | From enum | `jobFunctionId`, `jobFunctionText` |
| Job Type | Radio | Yes | Full/Part/Contract/Intern | `jobType` |
| Level | Select | Yes | From enum | `jobLevel` |
| Salary Min | Number | No | >= 0 | `minSalary` |
| Salary Max | Number | No | >= minSalary | `maxSalary` |
| Hide Salary | Checkbox | No | - | `hideSalary` |
| Positions | Number | Yes | >= 1 | `numberOfPosition` |

### 7.3 Step 2: Job Details

| Field | Type | Required | Validation | Server Field |
|-------|------|----------|------------|--------------|
| Description | Rich Text | Yes | Min 50 chars | `jobDescriptionDetails`, `jobDescriptionText` |
| Responsibilities | Rich Text | No | - | `jobResponsibilitiesDetails`, `jobResponsibilitiesText` |
| Requirements | Rich Text | No | - | `jobRequirementsDetails`, `jobRequirementsText` |
| Skills | Tag Input | Yes | Min 1 skill | `skills[]` |
| Benefits | Multi-select | No | From enum | `benefits[]` |

### 7.4 Step 3: Location

| Field | Type | Required | Validation | Server Field |
|-------|------|----------|------------|--------------|
| Work Mode | Radio | Yes | Onsite/Hybrid/Remote | `workModel` |
| Province | Select | Conditional | Required if not full remote | `provinceId`, `province` |
| District | Select | No | - | `districtId`, `district` |
| BTS/MRT | Select | No | - | `btsStationId`, `btsStation` |
| Remote % | Slider | Conditional | Required if hybrid | `remotePercentage` |
| Full Address | Textarea | No | - | `fullAddress` |

### 7.5 Step 4: Review & Publish

| Component | Data Source | Action | Target |
|-----------|-------------|--------|--------|
| Preview Card | `formData` | - | Job preview as candidate sees |
| Edit Section | Click on section | `GO_TO_STEP` | Jump to step |
| Publish Now | Button | `PUBLISH_NOW` | Immediate publish |
| Schedule | Date picker + Button | `SCHEDULE` | Set future date |
| Save Draft | Button | `SAVE_DRAFT` | Keep as draft |

### 7.6 Publish Options

| Option | Action | Result |
|--------|--------|--------|
| Publish Now | `jobStatus: 'published'`, `postStartDate: now`, `postExpiryDate: now + 30d` | Immediately visible |
| Schedule | `jobStatus: 'ontimer'`, `postStartDate: futureDate`, `postExpiryDate: start + 30d` | Visible on date |
| Save as Draft | `jobStatus: 'draft'` | Not visible |

---

## 8. Error Handling

### 8.1 Validation Errors (Per Step)

**Step 1:**
| Field | Validation | Error Message |
|-------|------------|---------------|
| `title` | Required, 5-100 chars | "à¸à¸£à¸¸à¸“à¸²à¸à¸£à¸­à¸à¸Šà¸·à¹ˆà¸­à¸•à¸³à¹à¸«à¸™à¹ˆà¸‡à¸‡à¸²à¸™ (5-100 à¸•à¸±à¸§à¸­à¸±à¸à¸©à¸£)" |
| `jobType` | Required | "à¸à¸£à¸¸à¸“à¸²à¹€à¸¥à¸·à¸­à¸à¸›à¸£à¸°à¹€à¸ à¸—à¸à¸²à¸£à¸ˆà¹‰à¸²à¸‡à¸‡à¸²à¸™" |
| `jobLevel` | Required | "à¸à¸£à¸¸à¸“à¸²à¹€à¸¥à¸·à¸­à¸à¸£à¸°à¸”à¸±à¸šà¸•à¸³à¹à¸«à¸™à¹ˆà¸‡" |
| `maxSalary` | >= minSalary | "à¹€à¸‡à¸´à¸™à¹€à¸”à¸·à¸­à¸™à¸ªà¸¹à¸‡à¸ªà¸¸à¸”à¸•à¹‰à¸­à¸‡à¸¡à¸²à¸à¸à¸§à¹ˆà¸²à¸•à¹ˆà¸³à¸ªà¸¸à¸”" |
| `numberOfPosition` | >= 1 | "à¸à¸£à¸¸à¸“à¸²à¸£à¸°à¸šà¸¸à¸ˆà¸³à¸™à¸§à¸™à¸•à¸³à¹à¸«à¸™à¹ˆà¸‡à¸—à¸µà¹ˆà¸£à¸±à¸š" |

**Step 2:**
| Field | Validation | Error Message |
|-------|------------|---------------|
| `jobDescriptionDetails` | Required, min 50 chars | "à¸à¸£à¸¸à¸“à¸²à¸à¸£à¸­à¸à¸£à¸²à¸¢à¸¥à¸°à¹€à¸­à¸µà¸¢à¸”à¸‡à¸²à¸™ (à¸­à¸¢à¹ˆà¸²à¸‡à¸™à¹‰à¸­à¸¢ 50 à¸•à¸±à¸§à¸­à¸±à¸à¸©à¸£)" |
| `skills` | Min 1 | "à¸à¸£à¸¸à¸“à¸²à¸£à¸°à¸šà¸¸à¸—à¸±à¸à¸©à¸°à¸—à¸µà¹ˆà¸•à¹‰à¸­à¸‡à¸à¸²à¸£à¸­à¸¢à¹ˆà¸²à¸‡à¸™à¹‰à¸­à¸¢ 1 à¸£à¸²à¸¢à¸à¸²à¸£" |

**Step 3:**
| Field | Validation | Error Message |
|-------|------------|---------------|
| `workModel` | Required | "à¸à¸£à¸¸à¸“à¸²à¹€à¸¥à¸·à¸­à¸à¸£à¸¹à¸›à¹à¸šà¸šà¸à¸²à¸£à¸—à¸³à¸‡à¸²à¸™" |
| `province` | Required if onsite/hybrid | "à¸à¸£à¸¸à¸“à¸²à¹€à¸¥à¸·à¸­à¸à¸ˆà¸±à¸‡à¸«à¸§à¸±à¸”" |

### 8.2 Server Errors

| Error Type | Display | Recovery |
|------------|---------|----------|
| `DRAFT_SAVE_ERROR` | Toast | Auto-retry in 5s |
| `PUBLISH_ERROR` | Toast + modal stays | Manual retry |
| `DUPLICATE_NOT_FOUND` | Toast | Redirect to fresh form |
| `SESSION_EXPIRED` | Modal | Save draft, redirect to login |

### 8.3 Navigation Guard

| Scenario | Behavior |
|----------|----------|
| Browser back with unsaved | Show confirm modal |
| Tab close with unsaved | `beforeunload` warning |
| Session expired | Auto-save draft, store return URL |

---

## 9. Implementation Checklist

### 9.1 Access Control
- [ ] Verify company membership
- [ ] Check company approval status
- [ ] Verify user can create jobs (role check)

### 9.2 Form Setup
- [ ] Initialize form state (empty/draft/duplicate)
- [ ] Implement step validation
- [ ] Wire auto-save with debounce
- [ ] Track dirty state

### 9.3 UI Components
- [ ] Create WizardHeader with progress
- [ ] Create Step1BasicForm
- [ ] Create Step2DetailsForm with rich text
- [ ] Create Step3LocationForm with conditional fields
- [ ] Create Step4ReviewPreview
- [ ] Create PublishOptionsModal
- [ ] Create NavigationGuardModal

### 9.4 Rich Text Editor
- [ ] Integrate Tiptap/similar editor
- [ ] Handle HTML (Details) and plain text (Text) field pairs
- [ ] Strip HTML for text version

### 9.5 Location Fields
- [ ] Province dropdown with Thai provinces
- [ ] District cascade from province
- [ ] BTS/MRT station search
- [ ] Conditional visibility based on work mode

### 9.6 Publishing
- [ ] Implement publish now action
- [ ] Implement schedule with date picker
- [ ] Auto-calculate expiry date (+30 days)
- [ ] Index to MeiliSearch on publish

### 9.7 Testing
- [ ] Test: Step navigation with validation
- [ ] Test: Auto-save creates/updates draft
- [ ] Test: Resume editing existing draft
- [ ] Test: Duplicate pre-fills correctly
- [ ] Test: Publish now creates published job
- [ ] Test: Schedule creates ontimer job
- [ ] Test: Browser back confirmation
- [ ] Test: Mobile responsive wizard

---

## 10. Decisions Log

| Decision | Chosen | Rationale | Date |
|----------|--------|-----------|------|
| 4-step wizard | Yes | Per UI spec, reduces cognitive load | 2025-12-10 |
| Auto-save on blur (1s debounce) | Yes | Balance responsiveness and API calls | 2025-12-10 |
| postExpiryDate = start + 30 days | Yes | Per feature spec, automatic expiry | 2025-12-10 |
| Rich text for descriptions | Yes | Better job presentation | 2025-12-10 |
| Dual fields (HTML + text) | Yes | Search indexing needs plain text | 2025-12-10 |

---

## 11. Related Routes

| Route | Relationship |
|-------|--------------|
| `/companies/[id]/dashboard/jobs` | Return destination (COMP-R06) |
| `/companies/[id]/dashboard/jobs/[jobId]` | Edit existing job (COMP-R08) |
| `/jobs/[id]` | Preview as candidate (JOB-R02) |

---

## 12. Cross-References

This document references shared specifications from:

| Document | Section | Topic |
|----------|---------|-------|
| COMP-R00 | Section 2-4 | Shell, access control, roles |
| JOB-R00 | Section 3-4 | Job entity lifecycle |
| PROJECT_INSTRUCTIONS | Section 4.2 | Job status state machine |

---

## Appendix A: TypeScript Types

```typescript
// Wizard steps
type WizardStep = 1 | 2 | 3 | 4;

// Form data structure
interface JobFormData {
  // Step 1: Basic
  title: string;
  jobFunctionId?: number;
  jobFunctionText?: string;
  jobType: 'fulltime' | 'parttime' | 'contract' | 'internship';
  jobLevel: string;
  minSalary?: number;
  maxSalary?: number;
  hideSalary: boolean;
  numberOfPosition: number;
  
  // Step 2: Details
  jobDescriptionDetails: string;  // HTML
  jobDescriptionText: string;     // Plain text
  jobResponsibilitiesDetails?: string;
  jobResponsibilitiesText?: string;
  jobRequirementsDetails?: string;
  jobRequirementsText?: string;
  skills: string[];
  benefits: string[];
  
  // Step 3: Location
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
type WizardState = 
  | 'loading'
  | 'step_1_basic'
  | 'step_2_details'
  | 'step_3_location'
  | 'step_4_review'
  | 'publishing'
  | 'success';

// Auto-save state
type AutoSaveState = 'idle' | 'dirty' | 'debouncing' | 'saving' | 'saved';

// Publish options
interface PublishOptions {
  mode: 'now' | 'schedule' | 'draft';
  scheduledDate?: Date;
}

// Step validation result
interface StepValidation {
  isValid: boolean;
  errors: Record<string, string>;
}
```

---

## Appendix B: Component File Structure

```
src/
â”œâ”€â”€ app/
â”‚   â””â”€â”€ companies/
â”‚       â””â”€â”€ [id]/
â”‚           â””â”€â”€ dashboard/
â”‚               â””â”€â”€ jobs/
â”‚                   â””â”€â”€ new/
â”‚                       â””â”€â”€ page.tsx              # New job page
â”œâ”€â”€ components/
â”‚   â””â”€â”€ companies/
â”‚       â””â”€â”€ jobs/
â”‚           â””â”€â”€ wizard/
â”‚               â”œâ”€â”€ JobWizard.tsx                 # Main wizard orchestrator
â”‚               â”œâ”€â”€ WizardHeader.tsx              # Progress, back, save status
â”‚               â”œâ”€â”€ WizardNavigation.tsx          # Back/Next buttons
â”‚               â”œâ”€â”€ Step1BasicForm.tsx            # Basic info fields
â”‚               â”œâ”€â”€ Step2DetailsForm.tsx          # Description, skills
â”‚               â”œâ”€â”€ Step3LocationForm.tsx         # Work mode, location
â”‚               â”œâ”€â”€ Step4Review.tsx               # Preview + publish
â”‚               â”œâ”€â”€ JobPreviewCard.tsx            # Candidate view preview
â”‚               â”œâ”€â”€ PublishOptionsModal.tsx       # Publish/schedule modal
â”‚               â”œâ”€â”€ NavigationGuardModal.tsx      # Unsaved changes modal
â”‚               â”œâ”€â”€ RichTextEditor.tsx            # Tiptap wrapper
â”‚               â”œâ”€â”€ SkillsInput.tsx               # Tag-style skill input
â”‚               â”œâ”€â”€ LocationCascade.tsx           # Province/District/BTS
â”‚               â””â”€â”€ SaveIndicator.tsx             # Auto-save status
â”œâ”€â”€ hooks/
â”‚   â””â”€â”€ companies/
â”‚       â””â”€â”€ jobs/
â”‚           â”œâ”€â”€ use-job-form.ts                   # Form state management
â”‚           â”œâ”€â”€ use-job-draft.ts                  # Draft operations
â”‚           â”œâ”€â”€ use-job-publish.ts                # Publish actions
â”‚           â”œâ”€â”€ use-auto-save.ts                  # Auto-save logic
â”‚           â””â”€â”€ use-navigation-guard.ts           # Unsaved changes guard
â””â”€â”€ domains/
    â””â”€â”€ jobs/
        â””â”€â”€ services/
            â””â”€â”€ server/
                â””â”€â”€ actions/
                    â”œâ”€â”€ job-create.ts             # Create draft
                    â”œâ”€â”€ job-update.ts             # Update draft
                    â””â”€â”€ job-publish.ts            # Publish/schedule
```

---

## Appendix C: Thai Copy Reference

| Key | Thai Text | English Equivalent |
|-----|-----------|-------------------|
| `page_title` | à¸¥à¸‡à¸›à¸£à¸°à¸à¸²à¸¨à¸‡à¸²à¸™à¹ƒà¸«à¸¡à¹ˆ | Create New Job |
| `step_1_title` | à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸žà¸·à¹‰à¸™à¸à¸²à¸™ | Basic Information |
| `step_2_title` | à¸£à¸²à¸¢à¸¥à¸°à¹€à¸­à¸µà¸¢à¸”à¸‡à¸²à¸™ | Job Details |
| `step_3_title` | à¸ªà¸–à¸²à¸™à¸—à¸µà¹ˆà¸—à¸³à¸‡à¸²à¸™ | Work Location |
| `step_4_title` | à¸•à¸£à¸§à¸ˆà¸ªà¸­à¸šà¹à¸¥à¸°à¹€à¸œà¸¢à¹à¸žà¸£à¹ˆ | Review & Publish |
| `btn_next` | à¸–à¸±à¸”à¹„à¸› | Next |
| `btn_back` | à¸¢à¹‰à¸­à¸™à¸à¸¥à¸±à¸š | Back |
| `btn_publish` | à¹€à¸œà¸¢à¹à¸žà¸£à¹ˆà¸—à¸±à¸™à¸—à¸µ | Publish Now |
| `btn_schedule` | à¸•à¸±à¹‰à¸‡à¹€à¸§à¸¥à¸²à¹€à¸œà¸¢à¹à¸žà¸£à¹ˆ | Schedule |
| `btn_save_draft` | à¸šà¸±à¸™à¸—à¸¶à¸à¹€à¸›à¹‡à¸™à¸£à¹ˆà¸²à¸‡ | Save as Draft |
| `save_status` | à¸šà¸±à¸™à¸—à¸¶à¸à¸£à¹ˆà¸²à¸‡à¹à¸¥à¹‰à¸§ | Draft saved |
| `field_title` | à¸Šà¸·à¹ˆà¸­à¸•à¸³à¹à¸«à¸™à¹ˆà¸‡à¸‡à¸²à¸™ | Job Title |
| `field_dept` | à¹à¸œà¸™à¸/à¸à¹ˆà¸²à¸¢ | Department |
| `field_type` | à¸›à¸£à¸°à¹€à¸ à¸—à¸à¸²à¸£à¸ˆà¹‰à¸²à¸‡à¸‡à¸²à¸™ | Employment Type |
| `field_level` | à¸£à¸°à¸”à¸±à¸šà¸•à¸³à¹à¸«à¸™à¹ˆà¸‡ | Job Level |
| `field_salary` | à¹€à¸‡à¸´à¸™à¹€à¸”à¸·à¸­à¸™ | Salary |
| `field_salary_min` | à¸•à¹ˆà¸³à¸ªà¸¸à¸” | Minimum |
| `field_salary_max` | à¸ªà¸¹à¸‡à¸ªà¸¸à¸” | Maximum |
| `field_hide_salary` | à¹„à¸¡à¹ˆà¹à¸ªà¸”à¸‡à¹€à¸‡à¸´à¸™à¹€à¸”à¸·à¸­à¸™ | Hide Salary |
| `field_positions` | à¸ˆà¸³à¸™à¸§à¸™à¸—à¸µà¹ˆà¸£à¸±à¸š | Positions Available |
| `field_description` | à¸£à¸²à¸¢à¸¥à¸°à¹€à¸­à¸µà¸¢à¸”à¸‡à¸²à¸™ | Job Description |
| `field_responsibilities` | à¸«à¸™à¹‰à¸²à¸—à¸µà¹ˆà¸£à¸±à¸šà¸œà¸´à¸”à¸Šà¸­à¸š | Responsibilities |
| `field_requirements` | à¸„à¸¸à¸“à¸ªà¸¡à¸šà¸±à¸•à¸´ | Requirements |
| `field_skills` | à¸—à¸±à¸à¸©à¸°à¸—à¸µà¹ˆà¸•à¹‰à¸­à¸‡à¸à¸²à¸£ | Required Skills |
| `field_benefits` | à¸ªà¸§à¸±à¸ªà¸”à¸´à¸à¸²à¸£ | Benefits |
| `field_work_mode` | à¸£à¸¹à¸›à¹à¸šà¸šà¸à¸²à¸£à¸—à¸³à¸‡à¸²à¸™ | Work Mode |
| `work_onsite` | à¸—à¸³à¸‡à¸²à¸™à¸—à¸µà¹ˆà¸­à¸­à¸Ÿà¸Ÿà¸´à¸¨ | On-site |
| `work_hybrid` | à¹„à¸®à¸šà¸£à¸´à¸” | Hybrid |
| `work_remote` | à¸—à¸³à¸‡à¸²à¸™à¸—à¸²à¸‡à¹„à¸à¸¥ | Remote |
| `field_province` | à¸ˆà¸±à¸‡à¸«à¸§à¸±à¸” | Province |
| `field_district` | à¹€à¸‚à¸•/à¸­à¸³à¹€à¸ à¸­ | District |
| `field_bts` | à¸ªà¸–à¸²à¸™à¸µ BTS/MRT | BTS/MRT Station |
| `field_remote_pct` | à¸ªà¸±à¸”à¸ªà¹ˆà¸§à¸™à¸—à¸³à¸‡à¸²à¸™à¸—à¸²à¸‡à¹„à¸à¸¥ | Remote Percentage |
| `field_address` | à¸—à¸µà¹ˆà¸­à¸¢à¸¹à¹ˆà¹€à¸•à¹‡à¸¡ | Full Address |
| `publish_title` | à¹€à¸œà¸¢à¹à¸žà¸£à¹ˆà¸›à¸£à¸°à¸à¸²à¸¨à¸‡à¸²à¸™ | Publish Job |
| `publish_now_desc` | à¸‡à¸²à¸™à¸ˆà¸°à¹à¸ªà¸”à¸‡à¸—à¸±à¸™à¸—à¸µà¹à¸¥à¸°à¸«à¸¡à¸”à¸­à¸²à¸¢à¸¸à¹ƒà¸™ 30 à¸§à¸±à¸™ | Job will be visible immediately, expires in 30 days |
| `schedule_desc` | à¹€à¸¥à¸·à¸­à¸à¸§à¸±à¸™à¸—à¸µà¹ˆà¸•à¹‰à¸­à¸‡à¸à¸²à¸£à¹€à¸œà¸¢à¹à¸žà¸£à¹ˆ | Select publish date |
| `unsaved_title` | à¸¡à¸µà¸à¸²à¸£à¹€à¸›à¸¥à¸µà¹ˆà¸¢à¸™à¹à¸›à¸¥à¸‡à¸—à¸µà¹ˆà¸¢à¸±à¸‡à¹„à¸¡à¹ˆà¹„à¸”à¹‰à¸šà¸±à¸™à¸—à¸¶à¸ | Unsaved Changes |
| `unsaved_desc` | à¸„à¸¸à¸“à¸•à¹‰à¸­à¸‡à¸à¸²à¸£à¸­à¸­à¸à¸ˆà¸²à¸à¸«à¸™à¹‰à¸²à¸™à¸µà¹‰à¸«à¸£à¸·à¸­à¹„à¸¡à¹ˆ? | Do you want to leave this page? |
| `unsaved_stay` | à¸­à¸¢à¸¹à¹ˆà¸•à¹ˆà¸­ | Stay |
| `unsaved_leave` | à¸­à¸­à¸ | Leave |
| `success_published` | à¹€à¸œà¸¢à¹à¸žà¸£à¹ˆà¸‡à¸²à¸™à¸ªà¸³à¹€à¸£à¹‡à¸ˆ | Job published successfully |
| `success_scheduled` | à¸•à¸±à¹‰à¸‡à¹€à¸§à¸¥à¸²à¹€à¸œà¸¢à¹à¸žà¸£à¹ˆà¸ªà¸³à¹€à¸£à¹‡à¸ˆ | Job scheduled successfully |
| `success_draft` | à¸šà¸±à¸™à¸—à¸¶à¸à¸£à¹ˆà¸²à¸‡à¸ªà¸³à¹€à¸£à¹‡à¸ˆ | Draft saved successfully |

---

## Appendix D: Validation Rules Summary

| Step | Field | Rule | Message |
|------|-------|------|---------|
| 1 | title | required, 5-100 chars | à¸à¸£à¸¸à¸“à¸²à¸à¸£à¸­à¸à¸Šà¸·à¹ˆà¸­à¸•à¸³à¹à¸«à¸™à¹ˆà¸‡à¸‡à¸²à¸™ |
| 1 | jobType | required | à¸à¸£à¸¸à¸“à¸²à¹€à¸¥à¸·à¸­à¸à¸›à¸£à¸°à¹€à¸ à¸—à¸à¸²à¸£à¸ˆà¹‰à¸²à¸‡à¸‡à¸²à¸™ |
| 1 | jobLevel | required | à¸à¸£à¸¸à¸“à¸²à¹€à¸¥à¸·à¸­à¸à¸£à¸°à¸”à¸±à¸šà¸•à¸³à¹à¸«à¸™à¹ˆà¸‡ |
| 1 | numberOfPosition | required, >= 1 | à¸à¸£à¸¸à¸“à¸²à¸£à¸°à¸šà¸¸à¸ˆà¸³à¸™à¸§à¸™à¸•à¸³à¹à¸«à¸™à¹ˆà¸‡ |
| 1 | maxSalary | >= minSalary if both set | à¹€à¸‡à¸´à¸™à¹€à¸”à¸·à¸­à¸™à¸ªà¸¹à¸‡à¸ªà¸¸à¸”à¸•à¹‰à¸­à¸‡à¸¡à¸²à¸à¸à¸§à¹ˆà¸²à¸•à¹ˆà¸³à¸ªà¸¸à¸” |
| 2 | jobDescriptionDetails | required, >= 50 chars | à¸à¸£à¸¸à¸“à¸²à¸à¸£à¸­à¸à¸£à¸²à¸¢à¸¥à¸°à¹€à¸­à¸µà¸¢à¸”à¸‡à¸²à¸™ |
| 2 | skills | required, >= 1 item | à¸à¸£à¸¸à¸“à¸²à¸£à¸°à¸šà¸¸à¸—à¸±à¸à¸©à¸°à¸­à¸¢à¹ˆà¸²à¸‡à¸™à¹‰à¸­à¸¢ 1 à¸£à¸²à¸¢à¸à¸²à¸£ |
| 3 | workModel | required | à¸à¸£à¸¸à¸“à¸²à¹€à¸¥à¸·à¸­à¸à¸£à¸¹à¸›à¹à¸šà¸šà¸à¸²à¸£à¸—à¸³à¸‡à¸²à¸™ |
| 3 | province | required if onsite/hybrid | à¸à¸£à¸¸à¸“à¸²à¹€à¸¥à¸·à¸­à¸à¸ˆà¸±à¸‡à¸«à¸§à¸±à¸” |
| 4 | scheduledDate | > now if scheduling | à¸§à¸±à¸™à¸—à¸µà¹ˆà¸•à¹‰à¸­à¸‡à¹€à¸›à¹‡à¸™à¸­à¸™à¸²à¸„à¸• |

---

*End of RIS: /companies/[id]/dashboard/jobs/new (COMP-R06) v1.0*
