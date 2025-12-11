# BLS-04: Screening Stage

**Stage:** Screening  
**Version:** 1.0  
**Last Updated:** 2025-12-11  
**Actions Count:** 7

---

## Stage Overview

The Screening Stage handles company-side application review and decision-making. This stage covers the HR workflow from receiving applications through making accept/reject decisions, including candidate profile viewing, filtering, and status management.

### Stage Boundaries

| Aspect | Scope |
|--------|-------|
| **Enters from** | BLS-03 Application (candidate submits) |
| **Exits to** | BLS-05 Interview (after acceptance + scheduling), BLS-06 Communication (chat after acceptance) |
| **Primary Actor** | Company HR Staff |
| **Secondary Actors** | System (notifications, status updates) |

### Actions in This Stage

| Action ID | Action Name | Trigger | Primary Collection |
|-----------|-------------|---------|-------------------|
| BLS-04-01 | listCompanyApplications | Page load `/companies/[id]/dashboard/applications` | `job_applications` |
| BLS-04-02 | filterApplications | Filter panel change | Local state |
| BLS-04-03 | selectApplication | Card click in list | Local state |
| BLS-04-04 | markAsRead | Auto on select (if status='applied') | `job_applications` |
| BLS-04-05 | acceptApplication | Accept button click | `job_applications`, `chats` |
| BLS-04-06 | rejectApplication | Reject button + confirm | `job_applications` |
| BLS-04-07 | viewCandidateProfile | Detail panel load | `candidate_information` |

---

## BLS-04-01: listCompanyApplications

### Description
Fetch and display all job applications for the company. Loaded on `/companies/[id]/dashboard/applications` with three-panel layout (filters, list, detail).

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| COMP-R08_applications_RIS.md | Section 4.1-4.2 | Data contract, list shape |
| features_jobs.md | JOB-019 | View Company Applications feature |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | User authenticated | `sessionStateAtom === 'valid'` | Redirect to `/auth/login` |
| 2 | Company membership | `user.companyId === params.id` | Redirect to own company or 403 |
| 3 | Company approved | `company.status === 'approved'` | Redirect to `/companies/[id]/pending` |
| 4 | Has permission | Role has `view_applications` | Show limited view or 403 |

### Inputs
| Field | Type | Required | Validation | Default | Source |
|-------|------|----------|------------|---------|--------|
| companyId | string | Yes | Valid company UID | - | Route param |
| job | string | No | Valid job UID | 'all' | Query param |
| status | string | No | Valid status | 'all' | Query param |
| sort | string | No | 'newest' \| 'score' | 'newest' | Query param |

### State Changes

**SWR Cache:**
| Key Pattern | Data Shape | Config |
|-------------|------------|--------|
| `company-applications-${companyId}` | `ApplicationListItem[]` | `defaultSWRConfig` (30s) |
| `company-jobs-${companyId}` | Job list for dropdown | `staticSWRConfig` |

**Local Component State:**
| State | Initial | Purpose |
|-------|---------|---------|
| `isLoading` | true | Show skeleton |
| `selectedAppId` | First in list | Detail panel content |
| `filterState` | Default filters | Applied filters |

### Firestore Operations
| Operation | Collection | Query | Fields | Join |
|-----------|------------|-------|--------|------|
| Read | `job_applications` | `where companyId === params.id`, `orderBy updatedAt desc` | All | Candidate info |
| Read | `jobs` | `where companyId === params.id` | `uid`, `title`, `isActive` | For filter dropdown |
| Read | `candidate_information` | `where uid in candidateIds` | Profile fields | For list display |

### Server Action
```typescript
// Action: JobApplicationGetByCompany
// Location: actions/job-applications.ts

interface ListCompanyApplicationsInput {
  companyId: string;
  status?: ApplicationStatus;
  jobId?: string;
}

interface ApplicationListItem {
  uid: string;
  jobId: string;
  candidateId: string;
  companyId: string;
  hrId: string | null;
  status: ApplicationStatus;
  expectedSalary: number | null;
  isNegotiable: boolean;
  overheadDays: number;
  headlines: string;
  createdAt: number;
  updatedAt: number;
  rejectFeedback?: string;
  chatId?: string;
  
  // Denormalized candidate info
  candidateName: string;
  candidatePhoto: string | null;
  candidateHeadline: string | null;
  
  // Denormalized job info
  jobTitle: string;
  
  // Computed fields
  matchScore: number | null;
  isUnread: boolean;  // status === 'applied'
}
```

### UI Feedback
| Scenario | Feedback Type | Display |
|----------|---------------|---------|
| Loading | Skeleton | Three-panel skeleton layout |
| Empty (no apps) | Empty state | "ยังไม่มีผู้สมัครงาน" + CTA to post jobs |
| Empty (no jobs) | Empty state | "กรุณาสร้างประกาศงานเพื่อรับใบสมัคร" |
| Error | Error state | "ไม่สามารถโหลดข้อมูลได้" + Retry |
| Success | Application list | Cards with unread badges |

### Error Handling
| Error Type | Detection | Recovery |
|------------|-----------|----------|
| Network error | SWR error state | Show error + retry button |
| Unauthorized | 401 response | Redirect to login |
| No permission | 403 response | Show limited view |
| Company not approved | Status check | Redirect to pending page |

---

## BLS-04-02: filterApplications

### Description
Filter the applications list by job, status, date range, or match score. Updates URL query params for shareable filtered views.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| COMP-R08_applications_RIS.md | Section 5, 7 | Filter panel, state machine |
| features_jobs.md | JOB-020 | Search Company Applications |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | Applications loaded | `applications !== undefined` | Show loading state |
| 2 | Jobs loaded | `companyJobs !== undefined` | Disable job filter |

### Inputs
| Field | Type | Required | Validation | Default | Source |
|-------|------|----------|------------|---------|--------|
| jobId | string \| null | No | Valid job UID or null | null | Dropdown |
| statuses | ApplicationStatus[] | No | Valid status array | [] (all) | Checkboxes |
| dateFrom | Date \| null | No | Valid date | null | Date picker |
| dateTo | Date \| null | No | >= dateFrom | null | Date picker |
| minScore | number | No | 0-100 | 0 | Range slider |
| maxScore | number | No | 0-100, >= minScore | 100 | Range slider |
| sortBy | SortOption | No | Valid sort | 'newest' | Dropdown |

### Filter State Shape
```typescript
interface FilterState {
  jobId: string | null;
  statuses: ApplicationStatus[];
  dateFrom: Date | null;
  dateTo: Date | null;
  minScore: number;
  maxScore: number;
}

type SortOption = 'newest' | 'oldest' | 'score_high' | 'score_low';

const defaultFilterState: FilterState = {
  jobId: null,
  statuses: [],
  dateFrom: null,
  dateTo: null,
  minScore: 0,
  maxScore: 100,
};
```

### State Changes

**URL State:**
| Param | Value | Sync |
|-------|-------|------|
| `job` | jobId or omitted | Bidirectional |
| `status` | Comma-separated statuses | Bidirectional |
| `sort` | Sort option | Bidirectional |

**Local Component State:**
| State | Before | After |
|-------|--------|-------|
| `filterState` | Previous | New filter values |
| `filteredApplications` | Previous result | New filtered result |
| `selectedAppId` | Current | First in filtered list |

### Filter Logic
```typescript
function filterApplications(
  applications: ApplicationListItem[],
  filters: FilterState,
  sort: SortOption
): ApplicationListItem[] {
  let result = applications;
  
  // Filter by job
  if (filters.jobId) {
    result = result.filter(app => app.jobId === filters.jobId);
  }
  
  // Filter by statuses
  if (filters.statuses.length > 0) {
    result = result.filter(app => filters.statuses.includes(app.status));
  }
  
  // Filter by date range
  if (filters.dateFrom) {
    result = result.filter(app => app.createdAt >= filters.dateFrom.getTime());
  }
  if (filters.dateTo) {
    result = result.filter(app => app.createdAt <= filters.dateTo.getTime());
  }
  
  // Filter by match score
  result = result.filter(app => 
    (app.matchScore ?? 0) >= filters.minScore &&
    (app.matchScore ?? 100) <= filters.maxScore
  );
  
  // Sort
  return sortApplications(result, sort);
}

function sortApplications(
  apps: ApplicationListItem[],
  sort: SortOption
): ApplicationListItem[] {
  switch (sort) {
    case 'newest': return [...apps].sort((a, b) => b.createdAt - a.createdAt);
    case 'oldest': return [...apps].sort((a, b) => a.createdAt - b.createdAt);
    case 'score_high': return [...apps].sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
    case 'score_low': return [...apps].sort((a, b) => (a.matchScore ?? 0) - (b.matchScore ?? 0));
  }
}
```

### UI Feedback
| Scenario | Feedback Type | Display |
|----------|---------------|---------|
| Filter applied | Instant update | Update list immediately |
| Empty result | Empty state | "ไม่พบใบสมัครที่ตรงกับเงื่อนไข" |
| Active filters | Badge count | Number on filter button |
| Clear filters | Reset button | "ล้างตัวกรอง" |

---

## BLS-04-03: selectApplication

### Description
Select an application from the list to view its details in the detail panel. Updates URL for deep linking.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| COMP-R08_applications_RIS.md | Section 6.2, 8.2 | Detail panel, component wiring |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | Application exists | In filtered list | No action |
| 2 | Not already selected | `selectedAppId !== appId` | No action |

### Inputs
| Field | Type | Required | Validation | Default | Source |
|-------|------|----------|------------|---------|--------|
| applicationId | string | Yes | Valid application UID | - | Card click |

### State Changes

**URL State:**
| Param | Value |
|-------|-------|
| `selected` | applicationId |

**Local Component State:**
| State | Before | After |
|-------|--------|-------|
| `selectedAppId` | Previous | New applicationId |
| `detailLoading` | false | true → false |

### Side Effects
| Effect | Condition | Target |
|--------|-----------|--------|
| Trigger markAsRead | `application.status === 'applied'` | BLS-04-04 |
| Load candidate profile | Always | BLS-04-07 |
| Update URL | Always | Query param `selected` |

### UI Feedback
| Scenario | Feedback Type | Display |
|----------|---------------|---------|
| Selection | Visual highlight | Card border/background change |
| Loading detail | Skeleton | Detail panel skeleton |
| Detail loaded | Content | Full profile + actions |

---

## BLS-04-04: markAsRead

### Description
Automatically mark an application as read when HR views it. Only triggers when status is 'applied' (unread). Silent background action.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| COMP-R08_applications_RIS.md | Section 3 | JOB-018 implementation |
| features_jobs.md | JOB-018 | Mark Application as Read |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | Application selected | `selectedAppId !== null` | No action |
| 2 | Status is 'applied' | `application.status === 'applied'` | Skip (already read) |
| 3 | User has permission | Role has `view_applications` | Skip |

### Inputs
| Field | Type | Required | Validation | Default | Source |
|-------|------|----------|------------|---------|--------|
| applicationId | string | Yes | Valid application UID | - | Selected application |

### State Changes

**SWR Cache Invalidations:**
| Key Pattern | Action | Timing |
|-------------|--------|--------|
| `company-applications-${companyId}` | Update item status | Immediate (optimistic) |

**Local Component State:**
| State | Before | After |
|-------|--------|-------|
| Application in list | `isUnread: true` | `isUnread: false` |

### Firestore Operations
| Operation | Collection | Document ID | Fields | Condition |
|-----------|------------|-------------|--------|-----------|
| Update | `job_applications` | applicationId | `status: 'read'`, `updatedAt` | `status === 'applied'` |

### Server Action
```typescript
// Action: readApplication
// Location: actions/job-applications.ts

interface MarkAsReadInput {
  applicationId: string;
}

interface MarkAsReadResult {
  success: boolean;
}
```

### UI Feedback
| Scenario | Feedback Type | Display |
|----------|---------------|---------|
| Success | Badge removal | Remove unread indicator from card |
| Failure | Silent | No user feedback (non-critical) |

### Error Handling
| Error Type | Detection | Recovery |
|------------|-----------|----------|
| Already read | Response | Ignore, update local state |
| Network error | Catch | Silent fail, retry on next select |

---

## BLS-04-05: acceptApplication

### Description
Accept a job application, creating a chat room between HR and candidate. Opens chat drawer for immediate communication.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| COMP-R08_applications_RIS.md | Section 3, 9 | Accept flow |
| features_jobs.md | JOB-016 | Accept Application feature |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | User authenticated | `sessionStateAtom === 'valid'` | Redirect to login |
| 2 | Has permission | Role has `manage_applications` | Hide accept button |
| 3 | Application selected | `selectedAppId !== null` | Disable button |
| 4 | Status acceptable | `status in ['applied', 'read']` | Hide accept button |
| 5 | Not processing | `!isAccepting` | Ignore duplicate click |

### Inputs
| Field | Type | Required | Validation | Default | Source |
|-------|------|----------|------------|---------|--------|
| applicationId | string | Yes | Valid application UID | - | Selected application |
| companyId | string | Yes | Current company | - | Route param |
| candidateId | string | Yes | From application | - | Application data |
| hrId | string | Yes | Current user | - | Auth context |
| jobId | string | Yes | From application | - | Application data |
| name | string | Yes | Candidate name | - | Application data |
| jobTitle | string | Yes | Job title | - | Application data |
| companyName | string | Yes | Company name | - | Company context |

### State Changes

**SWR Cache Invalidations:**
| Key Pattern | Action | Timing |
|-------------|--------|--------|
| `company-applications-${companyId}` | Update item status | Immediate (optimistic) |
| `application-detail-${appId}` | Update status + chatId | After success |
| `chat-rooms-${companyId}` | Add new chat | After success |

**Local Component State:**
| State | Before | After |
|-------|--------|-------|
| `isAccepting` | false | true → false |
| `actionState` | 'idle' | 'accepting' → 'chat_drawer' |

### Firestore Operations
| Operation | Collection | Document ID | Fields | Condition |
|-----------|------------|-------------|--------|-----------|
| Update | `job_applications` | applicationId | `status: 'accepted'`, `hrId`, `chatId`, `updatedAt` | Always |
| Create | `chats` | Auto-generated | Room between company and candidate | Always |

### Server Action
```typescript
// Action: AcceptApplication
// Location: actions/job-applications.ts

interface AcceptApplicationInput {
  companyId: string;
  candidateId: string;
  hrId: string;
  jobId: string;
  applicationId: string;
  name: string;
  jobTitle: string;
  companyName: string;
}

interface AcceptApplicationResult {
  status: 200;
  message: string;
  chatId: string;
}
```

### UI Feedback
| Scenario | Feedback Type | Message (Thai) | Duration |
|----------|---------------|----------------|----------|
| Processing | Button loading | Spinner | Until complete |
| Success | Toast + drawer | "ตอบรับใบสมัครแล้ว" + Open chat drawer | 3s |
| Already processed | Toast | "ดำเนินการแล้ว" | 3s |
| Network error | Toast | "ไม่สามารถตอบรับได้ กรุณาลองใหม่" | 5s |

### Error Handling
| Error Type | Detection | Recovery |
|------------|-----------|----------|
| Already accepted | Response code | Refresh status, show toast |
| Candidate withdrew | Response code | Remove from list, show toast |
| Network error | Catch | Keep button, allow retry |

### Side Effects
| Effect | Target | Timing |
|--------|--------|--------|
| Create chat room | `chats` collection | Server-side |
| Send notification | Candidate (push + email) | Server-side |
| Check first app reward | Candidate wallet | Server-side |
| Open chat drawer | UI | After success |
| Update status badge | List card | Immediate |

---

## BLS-04-06: rejectApplication

### Description
Reject a job application with optional feedback message. Shows confirmation modal with feedback textarea.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| COMP-R08_applications_RIS.md | Section 3, 9 | Reject flow |
| features_jobs.md | JOB-017 | Reject Application feature |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | User authenticated | `sessionStateAtom === 'valid'` | Redirect to login |
| 2 | Has permission | Role has `manage_applications` | Hide reject button |
| 3 | Application selected | `selectedAppId !== null` | Disable button |
| 4 | Status rejectable | `status in ['applied', 'read', 'accepted']` | Hide reject button |
| 5 | Confirmation given | User clicked confirm | Close modal, no action |

### Inputs
| Field | Type | Required | Validation | Default | Source |
|-------|------|----------|------------|---------|--------|
| applicationId | string | Yes | Valid application UID | - | Selected application |
| rejectedMessage | string | No | max 500 chars | '' | Modal textarea |
| actorId | string | Yes | Current user | - | Auth context |

### State Changes

**SWR Cache Invalidations:**
| Key Pattern | Action | Timing |
|-------------|--------|--------|
| `company-applications-${companyId}` | Update item status | Immediate (optimistic) |
| `application-detail-${appId}` | Update status + feedback | After success |

**Local Component State:**
| State | Before | After |
|-------|--------|-------|
| `showRejectModal` | false | true → false |
| `isRejecting` | false | true → false |
| `rejectFeedback` | '' | User input |

### Firestore Operations
| Operation | Collection | Document ID | Fields | Condition |
|-----------|------------|-------------|--------|-----------|
| Update | `job_applications` | applicationId | `status: 'rejected'`, `rejectFeedback`, `hrId`, `updatedAt` | Always |

### Server Action
```typescript
// Action: rejectApplication
// Location: actions/job-applications.ts

interface RejectApplicationInput {
  applicationId: string;
  payload: JobApplicationData;  // Current application object
  rejectedMessage: string;
  actorId: string;
}

interface RejectApplicationResult {
  success: boolean;
}
```

### UI Feedback
| Scenario | Feedback Type | Message (Thai) | Duration |
|----------|---------------|----------------|----------|
| Modal open | Modal | "ปฏิเสธใบสมัคร" title | Until action |
| Processing | Button loading | Spinner | Until complete |
| Success | Toast + close modal | "ปฏิเสธใบสมัครแล้ว" | 3s |
| Already processed | Toast | "ดำเนินการแล้ว" | 3s |
| Candidate withdrew | Toast | "ผู้สมัครถอนใบสมัครแล้ว" | 3s |
| Network error | Toast | "ไม่สามารถปฏิเสธได้ กรุณาลองใหม่" | 5s |

### Reject Modal Structure
| Component | Purpose | Display |
|-----------|---------|---------|
| Title | Modal header | "ปฏิเสธใบสมัคร" |
| Warning | Confirm message | "ยืนยันการปฏิเสธ {candidateName}?" |
| Feedback textarea | Optional message | Placeholder: "เหตุผลในการปฏิเสธ (ไม่บังคับ)" |
| Cancel button | Close modal | "ยกเลิก" |
| Confirm button | Execute reject | "ยืนยันปฏิเสธ" |

### Error Handling
| Error Type | Detection | Recovery |
|------------|-----------|----------|
| Already rejected | Response code | Refresh status, close modal |
| Candidate withdrew | Response code | Remove from list, close modal |
| Network error | Catch | Keep modal, allow retry |

### Side Effects
| Effect | Target | Timing |
|--------|--------|--------|
| Send rejection email | Candidate email | Server-side |
| Send notification | Candidate (push) | Server-side |
| Close modal | UI | After success |
| Select next application | UI | After success |

---

## BLS-04-07: viewCandidateProfile

### Description
Load and display candidate's full profile in the detail panel when an application is selected. Includes work experience, education, skills, and resume.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| COMP-R08_applications_RIS.md | Section 4.3, 6.2 | Detail data shape, panel layout |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | Application selected | `selectedAppId !== null` | Show empty panel |
| 2 | Candidate exists | Candidate record found | Show error state |

### Inputs
| Field | Type | Required | Validation | Default | Source |
|-------|------|----------|------------|---------|--------|
| candidateId | string | Yes | Valid candidate UID | - | Selected application |
| applicationId | string | Yes | For context | - | Selected application |

### State Changes

**SWR Cache:**
| Key Pattern | Data Shape | Config |
|-------------|------------|--------|
| `candidate-${candidateId}` | CandidateProfile | `staticSWRConfig` (5 min) |
| `application-detail-${appId}` | ApplicationDetail | `defaultSWRConfig` |

### Data Shape
```typescript
interface ApplicationDetail {
  // Application info
  uid: string;
  status: ApplicationStatus;
  expectedSalary: number | null;
  isNegotiable: boolean;
  overheadDays: number;
  headlines: string;
  createdAt: number;
  jobTitle: string;
  
  // Extended candidate profile
  candidate: {
    uid: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    photo: string | null;
    headline: string | null;
    aboutMe: string | null;
    workExperience: WorkExperience[];
    education: Education[];
    skills: string[];
    languages: Language[];
    resumeUrl: string | null;
    expectedSalary: number | null;
    currentSalary: number | null;
  };
  
  // Match breakdown (if available)
  matchBreakdown?: {
    total: number;
    skillMatch: number;
    experienceMatch: number;
    educationMatch: number;
    salaryMatch: number;
  };
}

interface WorkExperience {
  company: string;
  position: string;
  startDate: number;
  endDate: number | null;
  isCurrent: boolean;
  description: string;
}

interface Education {
  institution: string;
  degree: string;
  field: string;
  graduationYear: number;
}

interface Language {
  language: string;
  proficiency: 'basic' | 'conversational' | 'fluent' | 'native';
}
```

### UI Feedback
| Scenario | Feedback Type | Display |
|----------|---------------|---------|
| Loading | Skeleton | Profile skeleton in detail panel |
| Success | Full profile | Photo, info, experience, skills, resume |
| No resume | Placeholder | "ไม่มีไฟล์ Resume" |
| Error | Error state | "ไม่สามารถโหลดข้อมูลผู้สมัคร" |

### Detail Panel Sections
| Section | Content | Actions |
|---------|---------|---------|
| Header | Photo, name, headline | - |
| Contact | Email, phone | Copy to clipboard |
| Application Info | Expected salary, availability, cover letter | - |
| Match Score | Score breakdown with visualization | - |
| Experience | Work history timeline | - |
| Education | Degrees and institutions | - |
| Skills | Tag cloud | - |
| Resume | PDF viewer or download link | View, Download |
| Actions | Accept/Reject buttons | Primary actions |

---

## Stage Integration Points

### Entry Points (from other stages)
| Source Stage | Source Action | Entry Action | Trigger |
|--------------|---------------|--------------|---------|
| BLS-03 Application | submitApplication | listCompanyApplications | New application notification |
| BLS-06 Communication | viewChatList | selectApplication | Click application link in chat |

### Exit Points (to other stages)
| Exit Action | Target Stage | Target Action | Trigger |
|-------------|--------------|---------------|---------|
| acceptApplication | BLS-06 Communication | openChatRoom | Chat drawer opens |
| acceptApplication | BLS-05 Interview | (Company schedules) | After acceptance |
| rejectApplication | - | - | Terminal state for candidate |

### Cross-Stage Cache Dependencies
| This Stage Action | Affects Stage | Cache Key | Invalidation |
|-------------------|---------------|-----------|--------------|
| acceptApplication | BLS-06 | `chat-rooms-${companyId}` | New chat created |
| acceptApplication | BLS-03 | `candidate-applications-${uid}` | Status update |
| rejectApplication | BLS-03 | `candidate-applications-${uid}` | Status update |
| markAsRead | BLS-03 | `candidate-applications-${uid}` | Status update |

---

## Permissions Matrix

| Role | listApplications | filterApplications | selectApplication | markAsRead | acceptApplication | rejectApplication |
|------|------------------|-------------------|-------------------|------------|-------------------|-------------------|
| Owner | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Admin | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| HR | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Viewer | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |

---

## Related Documents

| Document | Relationship |
|----------|--------------|
| COMP-R08_applications_RIS.md | Primary route specification |
| COMP-R00_cross-cutting_RIS.md | Shell and access control |
| features_jobs.md | Feature definitions JOB-016/017/018/019/020 |
| data-entities_job-applications.md | Schema and status lifecycle |
| BLS-03_application.md | Preceding stage (candidate applies) |
| BLS-05_interview.md | Following stage (interview scheduling) |
| BLS-06_communication.md | Chat integration after acceptance |

---

*End of BLS-04 Screening Stage*
