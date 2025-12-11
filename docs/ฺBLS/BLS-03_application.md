# BLS-03: Application Stage

**Stage:** Application  
**Version:** 1.0  
**Last Updated:** 2025-12-11  
**Actions Count:** 5

---

## Stage Overview

The Application Stage handles job application submission, tracking, and management from the candidate perspective. This stage covers the complete application lifecycle from initial submission through withdrawal, including form handling, status monitoring, and application list management.

### Stage Boundaries

| Aspect | Scope |
|--------|-------|
| **Enters from** | BLS-02 Discovery (viewJob → Apply button) |
| **Exits to** | BLS-04 Screening (company reviews application), BLS-06 Communication (chat after acceptance) |
| **Primary Actor** | Candidate |
| **Secondary Actors** | System (status updates, notifications) |

### Actions in This Stage

| Action ID | Action Name | Trigger | Primary Collection |
|-----------|-------------|---------|-------------------|
| BLS-03-01 | submitApplication | Apply modal submit | `job_applications` |
| BLS-03-02 | editApplication | Edit button on applied card | `job_applications` |
| BLS-03-03 | withdrawApplication | Withdraw button + confirm | `job_applications` |
| BLS-03-04 | listApplications | Page load `/candidates/[id]/applications` | `job_applications` |
| BLS-03-05 | filterApplications | Status tab click | Local state |

---

## BLS-03-01: submitApplication

### Description
Submit a new job application for a specific job posting. Creates an application record linking the candidate to the job with salary expectations, availability, and optional cover letter.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| JOB-R02b_apply-modal_RIS.md | Section 3-5 | Modal flow, form fields, state machine |
| features_jobs.md | JOB-013 | Apply for Job feature |
| data-entities_job-applications.md | Full | Schema definition |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | User authenticated | `sessionStateAtom === 'valid'` | Show login prompt (JOB-R00 pattern) |
| 2 | Active role is candidate | `activeRoleAtom === 'candidate'` | Redirect to role selection |
| 3 | Profile complete | `candidateAtom.isResumeCompleted === true` | Show profile incomplete blocker |
| 4 | Job available | `job.isActive && !job.isClosed && postExpiryDate > now` | Show job unavailable banner |
| 5 | Not already applied | No existing application for job | Show "Already Applied" card |
| 6 | Not submitting | `!isSubmitting` (local state) | Ignore duplicate click |

### Inputs
| Field | Type | Required | Validation | Default | Source |
|-------|------|----------|------------|---------|--------|
| jobId | string | Yes | Valid job UID | - | Route param |
| expectedSalary | number \| null | No | >= 0, max 999,999 | null | Form input |
| isNegotiable | boolean | No | - | true | Checkbox |
| overheadDays | number | No | Enum: 0, 7, 15, 30, 60, 90 | 0 | Dropdown |
| headlines | string | No | max 500 chars | '' | Textarea |

### State Changes

**Jotai Atoms:**
| Atom | Change | Scope |
|------|--------|-------|
| None directly | - | - |

**SWR Cache Invalidations:**
| Key Pattern | Action | Timing |
|-------------|--------|--------|
| `application-${uid}-${jobId}` | Set to new application | Immediate |
| `candidate-applications-${uid}` | Revalidate | After success |
| `job-${jobId}` | Revalidate (for apply count) | After success |

**Local Component State:**
| State | Before | After |
|-------|--------|-------|
| `isSubmitting` | false | true → false |
| `modalState` | 'editing' | 'submitting' → 'success' or 'error' |
| `formErrors` | {} | Validation errors if any |

### Firestore Operations
| Operation | Collection | Document ID | Fields | Condition |
|-----------|------------|-------------|--------|-----------|
| Create | `job_applications` | Auto-generated | `jobId`, `candidateId`, `companyId`, `status: 'applied'`, `expectedSalary`, `isNegotiable`, `overheadDays`, `headlines`, `createdAt`, `updatedAt`, `createdBy`, `updatedBy` | Always |

### Server Action
```typescript
// Action: JobApplicationSet
// Location: actions/job-applications.ts

interface SubmitApplicationInput {
  jobId: string;
  expectedSalary?: number | null;
  isNegotiable?: boolean;
  overheadDays?: number;
  headlines?: string;
}

interface SubmitApplicationResult {
  success: boolean;
  applicationId?: string;
  error?: 'ALREADY_APPLIED' | 'JOB_CLOSED' | 'PROFILE_INCOMPLETE' | 'NETWORK_ERROR';
}
```

### UI Feedback
| Scenario | Feedback Type | Message (Thai) | Duration |
|----------|---------------|----------------|----------|
| Submitting | Button loading | Spinner + "กำลังส่ง..." | Until complete |
| Success | Toast + modal close | "ส่งใบสมัครเรียบร้อย" | 3s |
| Already applied | Modal auto-transition | Show "Already Applied" card | - |
| Job closed | Banner in modal | "ตำแหน่งนี้ปิดรับสมัครแล้ว" | - |
| Profile incomplete | Blocker | "กรุณากรอกข้อมูลให้ครบก่อนสมัคร" | - |
| Network error | Toast | "ไม่สามารถส่งใบสมัครได้ กรุณาลองใหม่" | 5s |
| Validation error | Inline field error | Field-specific message | Until fixed |

### Error Handling
| Error Type | Detection | Recovery |
|------------|-----------|----------|
| Already applied | Response code | Auto-transition to applied state |
| Job closed/expired | Response code | Show banner, disable form |
| Profile incomplete | Pre-check | Link to profile page |
| Network error | Catch in mutation | Keep modal open, show retry |
| Rate limited | Response code | Toast with countdown |
| Validation | Client-side | Highlight field, show message |

### Side Effects
| Effect | Target | Timing |
|--------|--------|--------|
| Create notification | Company (HR) | Server-side after create |
| Update job apply count | `jobs` collection | Server-side |
| Close modal | UI | After success |
| Scroll to applied card | UI | After modal closes |

---

## BLS-03-02: editApplication

### Description
Edit an existing job application before the company has reviewed it. Only available when application status is 'applied' (not yet read by company).

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| JOB-R02b_apply-modal_RIS.md | Section 6 | Edit flow specification |
| features_jobs.md | JOB-015 | Edit Application feature |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | User authenticated | `sessionStateAtom === 'valid'` | Redirect to login |
| 2 | Application exists | Fetched application !== null | Show error |
| 3 | Application owned | `application.candidateId === currentUser.uid` | Show error |
| 4 | Status is 'applied' | `application.status === 'applied'` | Hide edit button |
| 5 | Job still active | `job.isActive` | Show job unavailable |

### Inputs
| Field | Type | Required | Validation | Default | Source |
|-------|------|----------|------------|---------|--------|
| applicationId | string | Yes | Valid application UID | - | Existing application |
| expectedSalary | number \| null | No | >= 0, max 999,999 | Current value | Form input |
| isNegotiable | boolean | No | - | Current value | Checkbox |
| overheadDays | number | No | Enum: 0, 7, 15, 30, 60, 90 | Current value | Dropdown |
| headlines | string | No | max 500 chars | Current value | Textarea |

### State Changes

**SWR Cache Invalidations:**
| Key Pattern | Action | Timing |
|-------------|--------|--------|
| `application-${uid}-${jobId}` | Update with new values | Immediate (optimistic) |
| `candidate-applications-${uid}` | Revalidate | After success |

**Local Component State:**
| State | Before | After |
|-------|--------|-------|
| `isEditing` | false | true → false |
| `formData` | Current values | Updated values |

### Firestore Operations
| Operation | Collection | Document ID | Fields | Condition |
|-----------|------------|-------------|--------|-----------|
| Update | `job_applications` | applicationId | `expectedSalary`, `isNegotiable`, `overheadDays`, `headlines`, `updatedAt`, `updatedBy` | `status === 'applied'` |

### Server Action
```typescript
// Action: JobApplicationSet (update mode)
// Location: actions/job-applications.ts

interface EditApplicationInput {
  applicationId: string;
  expectedSalary?: number | null;
  isNegotiable?: boolean;
  overheadDays?: number;
  headlines?: string;
}

interface EditApplicationResult {
  success: boolean;
  error?: 'NOT_FOUND' | 'NOT_OWNER' | 'ALREADY_PROCESSED' | 'NETWORK_ERROR';
}
```

### UI Feedback
| Scenario | Feedback Type | Message (Thai) | Duration |
|----------|---------------|----------------|----------|
| Saving | Button loading | Spinner + "กำลังบันทึก..." | Until complete |
| Success | Toast | "บันทึกการแก้ไขแล้ว" | 3s |
| Already processed | Toast + refresh | "ใบสมัครถูกดำเนินการแล้ว" | 5s |
| Network error | Toast | "บันทึกไม่สำเร็จ กรุณาลองใหม่" | 5s |

### Error Handling
| Error Type | Detection | Recovery |
|------------|-----------|----------|
| Status changed | Response code | Refresh status, hide edit |
| Not owner | Response code | Show error, no retry |
| Network error | Catch | Keep modal open, retry |

---

## BLS-03-03: withdrawApplication

### Description
Withdraw a job application. Available when status is in withdrawable states ('applied', 'read', 'accepted', 'scheduled', 'confirmed'). Requires confirmation modal.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| JOB-R02b_apply-modal_RIS.md | Section 7 | Withdraw flow |
| CAND-R04_applications_RIS.md | Section 4.3, 8.3 | Withdraw from list |
| features_jobs.md | JOB-014 | Withdraw Application feature |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | User authenticated | `sessionStateAtom === 'valid'` | Redirect to login |
| 2 | Application exists | Fetched application !== null | Show error |
| 3 | Application owned | `application.candidateId === currentUser.uid` | Show error |
| 4 | Status withdrawable | `status in ['applied', 'read', 'accepted', 'scheduled', 'confirmed']` | Hide withdraw button |
| 5 | Confirmation given | User clicked confirm in modal | Close modal, no action |

### Inputs
| Field | Type | Required | Validation | Default | Source |
|-------|------|----------|------------|---------|--------|
| applicationId | string | Yes | Valid application UID | - | Application card/modal |

### State Changes

**SWR Cache Invalidations:**
| Key Pattern | Action | Timing |
|-------------|--------|--------|
| `application-${uid}-${jobId}` | Set status to 'withdraw' | Immediate (optimistic) |
| `candidate-applications-${uid}` | Revalidate | After success |
| `candidate-applications-${uid}-${statusFilter}` | Revalidate | After success |

**Local Component State:**
| State | Before | After |
|-------|--------|-------|
| `showWithdrawModal` | true | false |
| `isWithdrawing` | false | true → false |

### Firestore Operations
| Operation | Collection | Document ID | Fields | Condition |
|-----------|------------|-------------|--------|-----------|
| Update | `job_applications` | applicationId | `status: 'withdraw'`, `updatedAt`, `updatedBy` | Status is withdrawable |

### Server Action
```typescript
// Action: JobApplicationDel
// Location: actions/job-applications.ts

interface WithdrawApplicationInput {
  applicationId: string;
}

interface WithdrawApplicationResult {
  success: boolean;
  error?: 'NOT_FOUND' | 'NOT_OWNER' | 'ALREADY_PROCESSED' | 'NETWORK_ERROR';
}
```

### UI Feedback
| Scenario | Feedback Type | Message (Thai) | Duration |
|----------|---------------|----------------|----------|
| Confirm modal | Modal | "ยืนยันการถอนใบสมัคร?" | Until action |
| Withdrawing | Button loading | Spinner | Until complete |
| Success | Toast | "ถอนใบสมัครแล้ว" | 3s |
| Already processed | Toast | "ใบสมัครถูกดำเนินการแล้ว" | 5s |
| Network error | Toast | "ถอนใบสมัครไม่สำเร็จ" | 5s |

### Error Handling
| Error Type | Detection | Recovery |
|------------|-----------|----------|
| Already processed | Response code | Refresh list, show updated status |
| Network error | Catch | Keep modal, allow retry |
| Not owner | Response code | Show error message |

### Side Effects
| Effect | Target | Timing |
|--------|--------|--------|
| Notify company | Company notification | Server-side |
| Update tab counts | UI | After cache revalidation |
| Close confirmation modal | UI | After success |
| Focus management | Next card or empty state | After success |

---

## BLS-03-04: listApplications

### Description
Fetch and display all job applications for the current candidate. Loaded on `/candidates/[id]/applications` page with joined job and company data.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| CAND-R04_applications_RIS.md | Section 4.1-4.2 | Data contract, list shape |
| features_jobs.md | JOB-021 | Get Application by Candidate |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | User authenticated | `sessionStateAtom === 'valid'` | Redirect to `/auth/login` |
| 2 | Route ownership | `params.id === currentUser.uid` | Redirect to own applications |
| 3 | Active role is candidate | `activeRoleAtom === 'candidate'` | Redirect to role selection |

### Inputs
| Field | Type | Required | Validation | Default | Source |
|-------|------|----------|------------|---------|--------|
| candidateId | string | Yes | Current user UID | - | Route param / Auth |

### State Changes

**SWR Cache:**
| Key Pattern | Data Shape | Config |
|-------------|------------|--------|
| `candidate-applications-${uid}` | `ApplicationListItem[]` | `defaultSWRConfig` |

**Local Component State:**
| State | Initial | Purpose |
|-------|---------|---------|
| `isLoading` | true | Show skeleton |
| `error` | null | Error state |

### Firestore Operations
| Operation | Collection | Query | Fields | Join |
|-----------|------------|-------|--------|------|
| Read | `job_applications` | `where candidateId === uid`, `orderBy updatedAt desc` | All | Job title, company info |
| Read | `jobs` | `where uid in applicationJobIds` | `title`, `companyId`, `isActive` | - |
| Read | `company_information` | `where uid in companyIds` | `name`, `logo` | - |
| Read | `job_interviews` | `where applicationId in applicationIds` | All | For scheduled apps |

### Server Action
```typescript
// Action: JobApplicationGetByCandidate
// Location: actions/job-applications.ts

interface ListApplicationsInput {
  candidateId: string;
}

interface ApplicationListItem {
  uid: string;
  jobId: string;
  candidateId: string;
  companyId: string;
  status: ApplicationStatus;
  expectedSalary?: number;
  isNegotiable?: boolean;
  overheadDays?: number;
  headlines?: string;
  rejectFeedback?: string;
  hrId?: string;
  chatId?: string;
  createdAt: number;
  updatedAt: number;
  
  // Joined fields
  jobTitle: string;
  companyName: string;
  companyLogo: string;
  jobIsActive: boolean;
  
  // Interview (if scheduled)
  interview?: InterviewData;
}

type ApplicationStatus = 
  | 'applied' | 'read' | 'accepted' | 'rejected'
  | 'scheduled' | 'confirmed' | 'declined' | 'cancelled'
  | 'withdraw' | 'closed' | 'systemclosed';
```

### UI Feedback
| Scenario | Feedback Type | Display |
|----------|---------------|---------|
| Loading | Skeleton cards | 3-5 placeholder cards |
| Empty | Empty state | Illustration + "คุณยังไม่ได้สมัครงาน" + CTA "ค้นหางาน" |
| Error | Error state | "ไม่สามารถโหลดข้อมูลได้" + Retry button |
| Success | Application list | Cards with status badges |

### Error Handling
| Error Type | Detection | Recovery |
|------------|-----------|----------|
| Network error | SWR error state | Show error + retry button |
| Unauthorized | 401 response | Redirect to login |
| Wrong user | ID mismatch check | Redirect to own page |

---

## BLS-03-05: filterApplications

### Description
Filter the applications list by status category. Updates the visible list without refetching from server (client-side filtering from cached data).

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| CAND-R04_applications_RIS.md | Section 4.4, 8.1 | Tab mapping, component wiring |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | Applications loaded | `applications !== undefined` | Show loading state |

### Inputs
| Field | Type | Required | Validation | Default | Source |
|-------|------|----------|------------|---------|--------|
| statusFilter | StatusTab | Yes | Valid tab value | 'all' | Tab click |

### Status Tab Mapping
| Tab ID | Label (Thai) | Status Values | Count Logic |
|--------|--------------|---------------|-------------|
| `all` | ทั้งหมด | `*` | Total count |
| `applied` | สมัครแล้ว | `applied`, `read` | Sum of both |
| `reviewing` | กำลังพิจารณา | `accepted` | Count |
| `interviewing` | นัดสัมภาษณ์ | `scheduled`, `confirmed` | Sum |
| `rejected` | ไม่ผ่าน | `rejected`, `declined` | Sum |

### State Changes

**Local Component State:**
| State | Before | After |
|-------|--------|-------|
| `activeTab` | Current tab | New tab |
| `filteredApplications` | Previous filter | New filter result |

**URL State (optional):**
| Param | Value |
|-------|-------|
| `status` | Tab ID |

### Filter Logic
```typescript
function filterApplications(
  applications: ApplicationListItem[],
  tab: StatusTab
): ApplicationListItem[] {
  if (tab === 'all') return applications;
  
  const statusMap: Record<StatusTab, ApplicationStatus[]> = {
    applied: ['applied', 'read'],
    reviewing: ['accepted'],
    interviewing: ['scheduled', 'confirmed'],
    rejected: ['rejected', 'declined'],
  };
  
  return applications.filter(app => 
    statusMap[tab].includes(app.status)
  );
}

function getTabCounts(
  applications: ApplicationListItem[]
): Record<StatusTab, number> {
  return {
    all: applications.length,
    applied: applications.filter(a => ['applied', 'read'].includes(a.status)).length,
    reviewing: applications.filter(a => a.status === 'accepted').length,
    interviewing: applications.filter(a => ['scheduled', 'confirmed'].includes(a.status)).length,
    rejected: applications.filter(a => ['rejected', 'declined'].includes(a.status)).length,
  };
}
```

### UI Feedback
| Scenario | Feedback Type | Display |
|----------|---------------|---------|
| Tab change | Instant filter | Update list immediately |
| Empty filter | Empty state | "ไม่มีใบสมัครในสถานะนี้" |
| Count badges | Tab badges | Number on each tab |

### Accessibility
| Requirement | Implementation |
|-------------|----------------|
| Tab role | `role="tablist"` on container, `role="tab"` on buttons |
| Selected state | `aria-selected="true"` on active tab |
| Panel association | `aria-controls` pointing to panel |
| Keyboard navigation | Arrow keys between tabs |
| Live region | `aria-live="polite"` on results count |

---

## Stage Integration Points

### Entry Points (from other stages)
| Source Stage | Source Action | Entry Action | Trigger |
|--------------|---------------|--------------|---------|
| BLS-02 Discovery | viewJob | submitApplication | Click "สมัครงาน" button |
| BLS-02 Discovery | viewJob | - | Deep link `?apply=true` |

### Exit Points (to other stages)
| Exit Action | Target Stage | Target Action | Trigger |
|-------------|--------------|---------------|---------|
| submitApplication success | BLS-04 Screening | (Company receives) | Server notification |
| View chat after acceptance | BLS-06 Communication | openChatRoom | Click "ส่งข้อความ" |
| View job detail | BLS-02 Discovery | viewJob | Click job title |

### Cross-Stage Cache Dependencies
| This Stage Action | Affects Stage | Cache Key | Invalidation |
|-------------------|---------------|-----------|--------------|
| submitApplication | BLS-02 | `job-${jobId}` | Revalidate apply count |
| withdrawApplication | BLS-04 | Company application list | Server-side notification |

---

## Related Documents

| Document | Relationship |
|----------|--------------|
| JOB-R02b_apply-modal_RIS.md | Modal specifications, form fields |
| CAND-R04_applications_RIS.md | Applications list route |
| JOB-R00_cross-cutting_RIS.md | Shared patterns (login prompt) |
| features_jobs.md | Feature definitions JOB-013/014/015/021 |
| data-entities_job-applications.md | Schema and status lifecycle |
| BLS-02_discovery.md | Preceding stage (job viewing) |
| BLS-04_screening.md | Following stage (company review) |

---

*End of BLS-03 Application Stage*
