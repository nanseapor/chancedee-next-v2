# COMP-R08: Company Applications Management Route Implementation Spec

**Version:** 1.0  
**Last Updated:** 2025-12-10  
**Route:** `/companies/[id]/dashboard/applications`  
**Primary Domain:** Jobs (Company Context)

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-10 | Initial RIS creation with three-panel layout, accept/reject flows, chat integration |

---

## Cross-References

This document references shared specifications from:

| Document | Section | Topic |
|----------|---------|-------|
| **COMP-R00** | Section 2 | Company Shell specification |
| **COMP-R00** | Section 3 | Access control framework |
| **COMP-R00** | Section 4 | Role permissions matrix |
| **JOB-R00** | Section 5.1 | Application status lifecycle |
| **JOB-R02b** | Section 6 | Application status management |
| **CAND-R04** | Section 4 | Application data shape (candidate mirror) |

---

## 1. Route Metadata

| Property | Value |
|----------|-------|
| Route ID | COMP-R08 |
| Route Path | `/companies/[id]/dashboard/applications` |
| Shell | Company Shell |
| Purpose | Central inbox for reviewing and managing job applications |
| Complexity | High (three-panel layout, real-time updates, chat integration) |
| Phase | 4 (Application Flow) |
| UI Spec | `05-company-routes.md` Section 6.6 |

### Route Parameters

| Parameter | Type | Source | Validation |
|-----------|------|--------|------------|
| `id` | `string` | URL path segment | Must be company UID, user must have company membership |

### Query Parameters

| Parameter | Type | Purpose | Default |
|-----------|------|---------|---------|
| `job` | `string` | Filter by specific job ID | `all` |
| `status` | `string` | Filter by application status | `all` |
| `sort` | `string` | Sort order (`newest`, `score`) | `newest` |
| `selected` | `string` | Currently selected application ID | First in list |

### Access Control

| Condition | Check | Failure Behavior |
|-----------|-------|------------------|
| User authenticated | `sessionStateAtom === 'valid'` | Redirect to `/auth/login` |
| Company membership | `user.companyId === params.id` | Redirect to own company or 403 |
| Company approved | `company.status === 'approved'` | Redirect to `/companies/[id]/pending` |
| Permission check | Role has `view_applications` | Show limited view or 403 |

> **Cross-Reference:** See COMP-R00 Section 3 for complete access control framework.

---

## 2. Domain Classification

### Primary Domain: Jobs (â—‰)

- **Owns:** Application list, status management, accept/reject workflows
- **Mutations:** Accept (JOB-016), Reject (JOB-017), Mark Read (JOB-018)
- **Data Source:** Firestore `web_job_applications` collection

### Secondary Domains (â—Ž)

| Domain | Role | Access | Condition |
|--------|------|--------|-----------|
| Company | Context provider | Read company info | Shell context |
| Candidate | Profile display | Read candidate info | Detail panel |
| Chat | Communication channel | Create room on accept | Accept action |
| Notifications | Alert candidate | Send on accept/reject | Action trigger |

### Global Domains (âŠ™) - Via Company Shell

| Domain | Requirement |
|--------|-------------|
| Auth | Session validation |
| Chat | FAB in shell, drawer for accept flow |
| Notifications | Bell icon in shell |

---

## 3. Feature Mapping

### Existing Features (Preserve - P0)

| Feature ID | Feature Name | Coverage | Notes |
|------------|--------------|----------|-------|
| JOB-016 | Accept Application | Full | Creates chat + opens drawer |
| JOB-017 | Reject Application | Full | Feedback modal |
| JOB-018 | Mark Application as Read | Full | Automatic on detail view |
| JOB-019 | View Company Applications | Full | List with filters |
| JOB-020 | Search Company Applications | Full | Filter panel |

**Source:** `features_jobs.md` lines 950-1100

### Feature Implementation Details

#### JOB-016: Accept Application

| Aspect | Implementation |
|--------|----------------|
| Entry Point | Accept button in detail panel action bar |
| Server Action | `AcceptApplication` |
| Preconditions | Application in [applied, read] status |
| Side Effects | Create chat room, update status, send notifications, check first app reward |
| UI Effect | Open chat drawer (not navigate away) |

#### JOB-017: Reject Application

| Aspect | Implementation |
|--------|----------------|
| Entry Point | Reject button in detail panel action bar |
| Server Action | `rejectApplication` |
| Preconditions | Application in [applied, read, accepted] status |
| Side Effects | Update status, send rejection email with optional feedback |
| UI Effect | Show feedback modal â†’ update list |

#### JOB-018: Mark Application as Read

| Aspect | Implementation |
|--------|----------------|
| Entry Point | Automatic on selecting application in list |
| Server Action | `readApplication` |
| Preconditions | Application in [applied] status (new/unread) |
| Side Effects | Update status to 'read' |
| UI Effect | Remove unread badge from card |

#### JOB-019: View Company Applications

| Aspect | Implementation |
|--------|----------------|
| Entry Point | Page load |
| Server Action | `JobApplicationGetByCompany` |
| Data Source | Firestore `web_job_applications` filtered by `companyId` |
| Sorting | By `updatedAt` descending (default), or by match score |

#### JOB-020: Search Company Applications

| Aspect | Implementation |
|--------|----------------|
| Entry Point | Filter panel changes |
| Client-side | Filter already loaded applications |
| Parameters | Job ID, status, date range, match score range |

### New Features (Enhancements)

| Feature | Description | Priority |
|---------|-------------|----------|
| Three-Panel Layout | Desktop master-detail with filters | P0 |
| Match Score Display | Show AI-calculated match percentage | P0 |
| Bulk Actions | Select multiple for bulk accept/reject | P1 |
| Internal Notes | HR-only notes per application | P1 |
| Resume Quick View | Inline PDF preview | P0 |
| Mobile Swipe Actions | Swipe left/right for quick decisions | P0 |

---

## 4. Data Contract

### 4.1 Read Operations

| Data | Collection | Fields | Condition | SWR Key |
|------|------------|--------|-----------|---------|
| Applications | `web_job_applications` | All fields | `companyId === params.id` | `company-applications-${companyId}` |
| Job Details | `jobs` | `uid`, `title`, `jobStatus`, `isActive` | `companyId === params.id` | `company-jobs-${companyId}` |
| Candidate Info | `candidate_information` | Profile fields | `uid === app.candidateId` | `candidate-${candidateId}` |
| Interview Data | `job_interviews` | All fields | `applicationId === app.uid` | `interview-${applicationId}` |

### 4.2 Application List Data Shape

```typescript
interface ApplicationListItem {
  // Application fields
  uid: string;                    // Application ID
  jobId: string;                  // Job reference
  candidateId: string;            // Candidate reference
  companyId: string;              // Company reference
  hrId: string | null;            // Assigned HR (after accept)
  status: ApplicationStatus;      // Current status
  expectedSalary: number | null;  // Candidate's expected salary
  isNegotiable: boolean;          // Salary negotiable
  overheadDays: number;           // Days until available
  headlines: string;              // Cover letter / intro
  createdAt: number;              // Application timestamp
  updatedAt: number;              // Last update timestamp
  rejectFeedback?: string;        // Rejection reason (if rejected)
  chatId?: string;                // Chat room ID (if accepted)
  
  // Denormalized candidate info
  candidateName: string;
  candidatePhoto: string | null;
  candidateHeadline: string | null;
  
  // Denormalized job info
  jobTitle: string;
  
  // Computed fields
  matchScore: number | null;      // AI-calculated 0-100
  isUnread: boolean;              // status === 'applied'
}
```

### 4.3 Application Detail Data Shape

```typescript
interface ApplicationDetail extends ApplicationListItem {
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
  
  // Match breakdown
  matchBreakdown: {
    total: number;
    skillMatch: number;      // % of required skills matched
    experienceMatch: number; // Years alignment
    educationMatch: number;  // Level alignment
    salaryMatch: number;     // Salary range fit
  } | null;
  
  // Related job
  job: {
    uid: string;
    title: string;
    status: JobStatus;
    isActive: boolean;
    positions: number;
    minSalary: number | null;
    maxSalary: number | null;
    requiredSkills: string[];
    requiredExperience: string;
    requiredEducation: string[];
  };
  
  // Interview history (if any)
  interviews: Interview[];
  
  // Internal notes
  notes: InternalNote[];
}

interface InternalNote {
  uid: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: number;
}
```

### 4.4 Write Operations

| Action | Collection | Fields | Server Action | Trigger |
|--------|------------|--------|---------------|---------|
| Accept Application | `web_job_applications` | status, hrId, chatId | `AcceptApplication` | Accept button |
| Reject Application | `web_job_applications` | status, hrId, rejectFeedback | `rejectApplication` | Reject confirm |
| Mark as Read | `web_job_applications` | status | `readApplication` | Select in list |
| Add Note | `application_notes` | Full note | `addApplicationNote` | Save note |

### 4.5 Application Status Reference

| Status Value | Display (Thai) | Can Accept | Can Reject | Can Schedule |
|--------------|----------------|------------|------------|--------------|
| `applied` | à¸ªà¸¡à¸±à¸„à¸£à¹à¸¥à¹‰à¸§ | âœ“ | âœ“ | âœ— |
| `read` | à¸”à¸¹à¹à¸¥à¹‰à¸§ | âœ“ | âœ“ | âœ— |
| `accepted` | à¸•à¸­à¸šà¸£à¸±à¸šà¹à¸¥à¹‰à¸§ | âœ— | âœ“ | âœ“ |
| `rejected` | à¸›à¸à¸´à¹€à¸ªà¸˜à¹à¸¥à¹‰à¸§ | âœ— | âœ— | âœ— |
| `scheduled` | à¸™à¸±à¸”à¸ªà¸±à¸¡à¸ à¸²à¸©à¸“à¹Œ | âœ— | âœ— | âœ— (reschedule) |
| `confirmed` | à¸¢à¸·à¸™à¸¢à¸±à¸™à¸ªà¸±à¸¡à¸ à¸²à¸©à¸“à¹Œ | âœ— | âœ— | âœ— |
| `declined` | à¸›à¸à¸´à¹€à¸ªà¸˜à¸ªà¸±à¸¡à¸ à¸²à¸©à¸“à¹Œ | âœ— | âœ— | âœ“ |
| `withdraw` | à¸–à¸­à¸™à¹ƒà¸šà¸ªà¸¡à¸±à¸„à¸£ | âœ— | âœ— | âœ— |
| `closed` | à¸‡à¸²à¸™à¸›à¸´à¸”à¸£à¸±à¸š | âœ— | âœ— | âœ— |
| `systemclosed` | à¸«à¸¡à¸”à¸­à¸²à¸¢à¸¸ | âœ— | âœ— | âœ— |

> **Cross-Reference:** See PROJECT_INSTRUCTIONS.md Section 4.1 for complete lifecycle.

---

## 5. State Machine

### 5.1 Page State Machine

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                     COMP-R05 Page States                     â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

                         â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                         â”‚ LOADING  â”‚
                         â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”˜
                              â”‚
              â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
              â”‚               â”‚               â”‚
         AUTH_FAIL       LOAD_SUCCESS    LOAD_ERROR
              â”‚               â”‚               â”‚
              â–¼               â–¼               â–¼
        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
        â”‚ REDIRECT â”‚   â”‚   READY   â”‚   â”‚   ERROR   â”‚
        â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â””â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”˜   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                             â”‚
           â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
           â”‚                 â”‚                 â”‚
      HAS_APPS          NO_APPS           NO_JOBS
           â”‚                 â”‚                 â”‚
           â–¼                 â–¼                 â–¼
    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â”‚  LIST_VIEW  â”‚  â”‚ EMPTY_APPS  â”‚   â”‚  EMPTY_JOBS â”‚
    â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
           â”‚
    â”Œâ”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”
    â”‚             â”‚
 SELECT        FILTER
    â”‚             â”‚
    â–¼             â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ DETAIL  â”‚  â”‚ FILTERED â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 5.2 State Definitions

| State | Description | UI |
|-------|-------------|-----|
| `loading` | Initial data fetch | Skeleton loaders |
| `ready` | Data loaded, ready for interaction | Full UI |
| `list_view` | Applications exist, viewing list | Three-panel layout |
| `detail` | Specific application selected | Detail panel populated |
| `filtered` | Filters applied | Filtered list shown |
| `empty_apps` | No applications match criteria | Empty state with CTA |
| `empty_jobs` | Company has no jobs posted | Prompt to create job |
| `error` | Load failed | Error message + retry |
| `redirect` | Access denied | Redirect to appropriate route |

### 5.3 Action State Machine

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                  Application Action States                   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

                         â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                         â”‚   IDLE   â”‚
                         â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”˜
                              â”‚
         â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
         â”‚                    â”‚                    â”‚
    CLICK_ACCEPT        CLICK_REJECT         CLICK_READ
         â”‚                    â”‚                    â”‚
         â–¼                    â–¼                    â–¼
   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”       â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
   â”‚ ACCEPTING â”‚       â”‚  REJECT   â”‚        â”‚ MARKING  â”‚
   â”‚           â”‚       â”‚  MODAL    â”‚        â”‚   READ   â”‚
   â””â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”˜       â””â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”˜        â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”˜
         â”‚                   â”‚                   â”‚
    â”Œâ”€â”€â”€â”€â”´â”€â”€â”€â”€â”         â”Œâ”€â”€â”€â”€â”´â”€â”€â”€â”€â”              â”‚
    â”‚         â”‚         â”‚         â”‚              â”‚
 SUCCESS   ERROR     CONFIRM   CANCEL            â”‚
    â”‚         â”‚         â”‚         â”‚              â”‚
    â–¼         â–¼         â–¼         â–¼              â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ CHAT  â”‚ â”‚RETRY â”‚ â”‚ REJECTINGâ”‚ â”‚IDLEâ”‚     â”‚ UPDATED  â”‚
â”‚DRAWER â”‚ â”‚TOAST â”‚ â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”˜     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
â””â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”˜      â”‚
                   â”Œâ”€â”€â”€â”€â”´â”€â”€â”€â”€â”
                   â”‚         â”‚
                SUCCESS   ERROR
                   â”‚         â”‚
                   â–¼         â–¼
              â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”
              â”‚UPDATED â”‚ â”‚RETRY â”‚
              â””â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”˜
```

### 5.4 State Transitions

| Current | Event | Next | Side Effect |
|---------|-------|------|-------------|
| `idle` | Click accept | `accepting` | Call AcceptApplication |
| `accepting` | Success | `chat_drawer` | Open chat drawer, update list |
| `accepting` | Error | `idle` | Show error toast |
| `idle` | Click reject | `reject_modal` | Show feedback modal |
| `reject_modal` | Confirm | `rejecting` | Call rejectApplication |
| `reject_modal` | Cancel | `idle` | Close modal |
| `rejecting` | Success | `idle` | Update list, show success toast |
| `rejecting` | Error | `idle` | Show error toast |
| `idle` | Select unread | `marking_read` | Call readApplication |
| `marking_read` | Complete | `idle` | Remove unread badge |

---

## 6. UI Component Specification

### 6.1 Three-Panel Layout (Desktop)

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Company Shell Header                                                 â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚           â”‚                      â”‚                                   â”‚
â”‚  FILTER   â”‚    APPLICATION       â”‚          DETAIL                   â”‚
â”‚  PANEL    â”‚       LIST           â”‚          PANEL                    â”‚
â”‚           â”‚                      â”‚                                   â”‚
â”‚  250px    â”‚       350px          â”‚          flex                     â”‚
â”‚  fixed    â”‚       fixed          â”‚          grow                     â”‚
â”‚           â”‚                      â”‚                                   â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â” â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚ â”‚ Job â–¼ â”‚ â”‚ â”‚ â— John Doe       â”‚ â”‚ â”‚      Candidate Detail       â”‚  â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚ â”‚   Frontend Dev   â”‚ â”‚ â”‚                             â”‚  â”‚
â”‚           â”‚ â”‚   Match: 85%     â”‚ â”‚ â”‚  [Photo]  John Doe          â”‚  â”‚
â”‚ Status    â”‚ â”‚   2 hours ago    â”‚ â”‚ â”‚           Frontend Dev      â”‚  â”‚
â”‚ â–¡ New     â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚ â”‚           Match: 85%        â”‚  â”‚
â”‚ â–¡ Read    â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚ â”‚                             â”‚  â”‚
â”‚ â˜‘ Acceptedâ”‚ â”‚   Jane Smith     â”‚ â”‚ â”‚  Skills: React, Node, ...   â”‚  â”‚
â”‚           â”‚ â”‚   Backend Dev    â”‚ â”‚ â”‚                             â”‚  â”‚
â”‚ Date      â”‚ â”‚   Match: 72%     â”‚ â”‚ â”‚  Experience: 5 years        â”‚  â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â” â”‚ â”‚   1 day ago      â”‚ â”‚ â”‚                             â”‚  â”‚
â”‚ â”‚ Range â”‚ â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚ â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚  â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚                      â”‚ â”‚  â”‚ Resume [View] [DL]  â”‚    â”‚  â”‚
â”‚           â”‚                      â”‚ â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚  â”‚
â”‚ Score     â”‚                      â”‚ â”‚                             â”‚  â”‚
â”‚ â”œâ”€â”€â”€â”€â—‹â”€â”€â”€â”¤â”‚                      â”‚ â”‚  Internal Notes             â”‚  â”‚
â”‚ 0      100â”‚                      â”‚ â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚  â”‚
â”‚           â”‚                      â”‚ â”‚  â”‚ Add note...         â”‚    â”‚  â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â” â”‚                      â”‚ â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚  â”‚
â”‚ â”‚ Apply â”‚ â”‚                      â”‚ â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤  â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚                      â”‚ â”‚  [à¸•à¸­à¸šà¸£à¸±à¸š]      [à¸›à¸à¸´à¹€à¸ªà¸˜]     â”‚  â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â” â”‚                      â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚ â”‚ Clear â”‚ â”‚                      â”‚                                   â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚                      â”‚                                   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 6.2 Filter Panel Components

| Component | Purpose | Type | Options |
|-----------|---------|------|---------|
| **Job Filter** | Filter by job posting | Dropdown | All company jobs |
| **Status Filter** | Filter by app status | Checkboxes | New, Read, Accepted, Scheduled, etc. |
| **Date Range** | Filter by application date | Date picker | From/To dates |
| **Match Score** | Filter by match percentage | Range slider | 0-100 |
| **Apply Button** | Apply filters | Button | "à¸à¸£à¸­à¸‡" |
| **Clear Button** | Reset filters | Button link | "à¸¥à¹‰à¸²à¸‡à¸•à¸±à¸§à¸à¸£à¸­à¸‡" |

### 6.3 Application List Card

| Component | Content | Position | Notes |
|-----------|---------|----------|-------|
| **Avatar** | Candidate photo | Left | 48Ã—48, fallback initials |
| **Name** | Candidate name | Top | Bold |
| **Position** | Job they applied for | Below name | Gray text |
| **Match Score** | Score badge | Top-right | Color-coded |
| **Applied Date** | Relative time | Bottom | "2 à¸Šà¸±à¹ˆà¸§à¹‚à¸¡à¸‡à¸—à¸µà¹ˆà¹à¸¥à¹‰à¸§" |
| **Status Dot** | Current status | Bottom-left | Color indicator |
| **Unread Badge** | New indicator | On avatar | Blue dot if unread |

**Match Score Colors:**
| Range | Color | Badge |
|-------|-------|-------|
| 80-100% | Green | Excellent |
| 60-79% | Teal | Good |
| 40-59% | Yellow | Fair |
| 0-39% | Gray | Low |

### 6.4 Detail Panel Components

| Section | Components | Actions |
|---------|------------|---------|
| **Header** | Photo, name, headline, contact info | - |
| **Match Breakdown** | Total score + breakdown bars | - |
| **Profile Summary** | Experience, education, skills | Expand sections |
| **Resume Section** | PDF viewer/download | View, Download |
| **Application Info** | Expected salary, availability, cover letter | - |
| **Internal Notes** | Note list + add form | Add note |
| **Action Bar** | Accept/Reject buttons | Primary actions |

### 6.5 Action Bar Specification

| Button | Label | Style | Action | Condition |
|--------|-------|-------|--------|-----------|
| **Accept** | "à¸•à¸­à¸šà¸£à¸±à¸š" | Primary teal | Accept flow | Status in [applied, read] |
| **Reject** | "à¸›à¸à¸´à¹€à¸ªà¸˜" | Outline red | Reject flow | Status in [applied, read, accepted] |
| **Schedule** | "à¸™à¸±à¸”à¸ªà¸±à¸¡à¸ à¸²à¸©à¸“à¹Œ" | Primary orange | Schedule flow | Status === 'accepted' |
| **Message** | "à¸ªà¹ˆà¸‡à¸‚à¹‰à¸­à¸„à¸§à¸²à¸¡" | Outline | Open chat | chatId exists |

---

## 7. Accept Flow Specification

### 7.1 Accept Action Sequence

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚   Click    â”‚â”€â”€â”€â–¶â”‚   Server    â”‚â”€â”€â”€â–¶â”‚  Create Chat  â”‚â”€â”€â”€â–¶â”‚  Open Chat   â”‚
â”‚   Accept   â”‚    â”‚   Action    â”‚    â”‚     Room      â”‚    â”‚   Drawer     â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                        â”‚                   â”‚                    â”‚
                        â–¼                   â–¼                    â–¼
                 â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                 â”‚   Update    â”‚    â”‚    Send       â”‚    â”‚    Send      â”‚
                 â”‚   Status    â”‚    â”‚ Notification  â”‚    â”‚   System     â”‚
                 â”‚ 'accepted'  â”‚    â”‚  to Candidate â”‚    â”‚   Message    â”‚
                 â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 7.2 Server Action: AcceptApplication

**Input:**
```typescript
interface AcceptApplicationInput {
  companyId: string;
  candidateId: string;
  hrId: string;         // Current user
  jobId: string;
  applicationId: string;
  name: string;         // Candidate name
  jobTitle: string;
  companyName: string;
}
```

**Side Effects:**
1. Update `web_job_applications` â†’ status = 'accepted', hrId = actor
2. Create `chats` room with MD5 hash ID
3. Update application with chatId
4. Send email notification to candidate
5. Create push notification
6. Check first application reward â†’ award coins if first

**Output:**
```typescript
interface AcceptApplicationOutput {
  status: 200;
  message: string;
  chatId: string;       // For opening drawer
}
```

### 7.3 Chat Room Creation

| Field | Value | Source |
|-------|-------|--------|
| `uid` | MD5(`${companyId}-${candidateId}`) | Generated |
| `companyId` | Application company | Input |
| `candidateId` | Application candidate | Input |
| `companyName` | Company display name | Lookup |
| `candidateName` | Candidate display name | Lookup |
| `responsibleHrId` | Current HR user | Session |
| `responsibleHrName` | HR display name | Session |
| `status` | 'active' | Default |
| `timestamp` | Now | Generated |

### 7.4 UI After Accept

1. **Update list** - Remove unread badge, update status indicator
2. **Open chat drawer** - Slide in from right (do NOT navigate away)
3. **Show success toast** - "à¸•à¸­à¸šà¸£à¸±à¸šà¹ƒà¸šà¸ªà¸¡à¸±à¸„à¸£à¹€à¸£à¸µà¸¢à¸šà¸£à¹‰à¸­à¸¢"
4. **Send system message** - "HR à¹„à¸”à¹‰à¸•à¸­à¸šà¸£à¸±à¸šà¹ƒà¸šà¸ªà¸¡à¸±à¸„à¸£à¸‚à¸­à¸‡à¸„à¸¸à¸“à¹à¸¥à¹‰à¸§"

---

## 8. Reject Flow Specification

### 8.1 Reject Modal Structure

| Component | Purpose | Content |
|-----------|---------|---------|
| **Header** | Modal title | "à¸›à¸à¸´à¹€à¸ªà¸˜à¹ƒà¸šà¸ªà¸¡à¸±à¸„à¸£" |
| **Candidate Info** | Context | Name, job title |
| **Feedback Field** | Optional reason | Textarea (max 500 chars) |
| **Hint Text** | Guidance | "à¸œà¸¹à¹‰à¸ªà¸¡à¸±à¸„à¸£à¸ˆà¸°à¹„à¸”à¹‰à¸£à¸±à¸šà¹€à¸«à¸•à¸¸à¸œà¸¥à¸™à¸µà¹‰à¸—à¸²à¸‡à¸­à¸µà¹€à¸¡à¸¥ (à¹„à¸¡à¹ˆà¸šà¸±à¸‡à¸„à¸±à¸š)" |
| **Cancel Button** | Abort | "à¸¢à¸à¹€à¸¥à¸´à¸" |
| **Confirm Button** | Execute | "à¸¢à¸·à¸™à¸¢à¸±à¸™à¸›à¸à¸´à¹€à¸ªà¸˜" (Red) |

### 8.2 Server Action: rejectApplication

**Input:**
```typescript
interface RejectApplicationInput {
  applicationId: string;
  payload: JobApplicationData;
  rejectedMessage: string;  // Optional feedback
  actorId: string;
}
```

**Side Effects:**
1. Update `web_job_applications` â†’ status = 'rejected', rejectFeedback = message, hrId = actor
2. Send email notification with rejection message
3. Create push notification

**Output:**
```typescript
interface RejectApplicationOutput {
  success: true;
}
```

### 8.3 UI After Reject

1. **Close modal**
2. **Update list** - Move to rejected, update status indicator
3. **Clear detail panel** - Select next application or show empty
4. **Show success toast** - "à¸›à¸à¸´à¹€à¸ªà¸˜à¹ƒà¸šà¸ªà¸¡à¸±à¸„à¸£à¹€à¸£à¸µà¸¢à¸šà¸£à¹‰à¸­à¸¢"
5. **Invalidate cache** - Refresh application list

---

## 9. Mobile Specification

### 9.1 Mobile Layout

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Header: à¹ƒà¸šà¸ªà¸¡à¸±à¸„à¸£ (X)   [Filter â–¼]â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                  â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚ â— John Doe          85%   â”‚  â”‚
â”‚  â”‚   Frontend Developer      â”‚  â”‚
â”‚  â”‚   2 hours ago      â”€â”€â–¶    â”‚  â”‚ â† Swipe actions
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                  â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚   Jane Smith        72%   â”‚  â”‚
â”‚  â”‚   Backend Developer       â”‚  â”‚
â”‚  â”‚   1 day ago        â”€â”€â–¶    â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                  â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚   Bob Wilson        68%   â”‚  â”‚
â”‚  â”‚   Full Stack Dev          â”‚  â”‚
â”‚  â”‚   3 days ago       â”€â”€â–¶    â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 9.2 Mobile Interactions

| Interaction | Action |
|-------------|--------|
| Tap card | Open full-screen detail |
| Swipe right | Quick accept (with confirmation) |
| Swipe left | Quick reject (opens modal) |
| Tap filter icon | Open bottom sheet filters |
| Pull to refresh | Reload applications |

### 9.3 Mobile Detail View

Full-screen overlay with:
- Back button (â†)
- All detail sections (scrollable)
- Fixed action bar at bottom
- Chat drawer still opens as overlay

---

## 10. Error Handling

### 10.1 Error States

| Error | Display | Recovery |
|-------|---------|----------|
| Load failed | "à¹„à¸¡à¹ˆà¸ªà¸²à¸¡à¸²à¸£à¸–à¹‚à¸«à¸¥à¸”à¹ƒà¸šà¸ªà¸¡à¸±à¸„à¸£à¹„à¸”à¹‰" | Retry button |
| Accept failed | Toast "à¹„à¸¡à¹ˆà¸ªà¸²à¸¡à¸²à¸£à¸–à¸•à¸­à¸šà¸£à¸±à¸šà¹„à¸”à¹‰" | Auto-retry once |
| Reject failed | Toast "à¹„à¸¡à¹ˆà¸ªà¸²à¸¡à¸²à¸£à¸–à¸›à¸à¸´à¹€à¸ªà¸˜à¹„à¸”à¹‰" | Retry button in modal |
| Already processed | Toast "à¸”à¸³à¹€à¸™à¸´à¸™à¸à¸²à¸£à¹à¸¥à¹‰à¸§" | Refresh list |
| Concurrent update | Toast "à¸¡à¸µà¸à¸²à¸£à¸­à¸±à¸žà¹€à¸”à¸—à¹ƒà¸«à¸¡à¹ˆ" | Auto-refresh |
| Network offline | Banner "à¹„à¸¡à¹ˆà¸¡à¸µà¸à¸²à¸£à¹€à¸Šà¸·à¹ˆà¸­à¸¡à¸•à¹ˆà¸­" | Auto-retry on reconnect |

### 10.2 Exception Components

| Exception | Display |
|-----------|---------|
| Candidate hidden profile | "à¸œà¸¹à¹‰à¸ªà¸¡à¸±à¸„à¸£à¸‹à¹ˆà¸­à¸™à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸šà¸²à¸‡à¸ªà¹ˆà¸§à¸™" |
| Candidate deleted account | Gray card "à¸œà¸¹à¹‰à¸ªà¸¡à¸±à¸„à¸£à¸¥à¸šà¸šà¸±à¸à¸Šà¸µà¹à¸¥à¹‰à¸§" |
| Job closed | Banner "à¸‡à¸²à¸™à¸›à¸´à¸”à¸£à¸±à¸šà¸ªà¸¡à¸±à¸„à¸£à¹à¸¥à¹‰à¸§" |
| Resume unavailable | "à¹„à¸¡à¹ˆà¸¡à¸µà¹„à¸Ÿà¸¥à¹Œ Resume" |
| Match score unavailable | Show "N/A" with gray badge |

---

## 11. Empty States

### 11.1 No Applications

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                  ðŸ“­                      â”‚
â”‚                                         â”‚
â”‚        à¸¢à¸±à¸‡à¹„à¸¡à¹ˆà¸¡à¸µà¹ƒà¸šà¸ªà¸¡à¸±à¸„à¸£                    â”‚
â”‚                                         â”‚
â”‚   à¹€à¸¡à¸·à¹ˆà¸­à¸¡à¸µà¸œà¸¹à¹‰à¸ªà¸¡à¸±à¸„à¸£à¹€à¸‚à¹‰à¸²à¸¡à¸² à¸ˆà¸°à¹à¸ªà¸”à¸‡à¸—à¸µà¹ˆà¸™à¸µà¹ˆ        â”‚
â”‚                                         â”‚
â”‚        [à¹à¸Šà¸£à¹Œà¸¥à¸´à¸‡à¸à¹Œà¸›à¸£à¸°à¸à¸²à¸¨à¸‡à¸²à¸™]              â”‚
â”‚                                         â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 11.2 Filter No Results

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                  ðŸ”                      â”‚
â”‚                                         â”‚
â”‚     à¹„à¸¡à¹ˆà¸¡à¸µà¹ƒà¸šà¸ªà¸¡à¸±à¸„à¸£à¹ƒà¸™à¸ªà¸–à¸²à¸™à¸°à¸™à¸µà¹‰                 â”‚
â”‚                                         â”‚
â”‚        [à¸¥à¹‰à¸²à¸‡à¸•à¸±à¸§à¸à¸£à¸­à¸‡]                     â”‚
â”‚                                         â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 11.3 No Jobs Posted

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                  ðŸ“‹                      â”‚
â”‚                                         â”‚
â”‚        à¸¢à¸±à¸‡à¹„à¸¡à¹ˆà¸¡à¸µà¸›à¸£à¸°à¸à¸²à¸¨à¸‡à¸²à¸™                  â”‚
â”‚                                         â”‚
â”‚    à¸ªà¸£à¹‰à¸²à¸‡à¸›à¸£à¸°à¸à¸²à¸¨à¸‡à¸²à¸™à¹€à¸žà¸·à¹ˆà¸­à¹€à¸£à¸´à¹ˆà¸¡à¸£à¸±à¸šà¹ƒà¸šà¸ªà¸¡à¸±à¸„à¸£       â”‚
â”‚                                         â”‚
â”‚        [à¸¥à¸‡à¸›à¸£à¸°à¸à¸²à¸¨à¸‡à¸²à¸™à¹à¸£à¸]                  â”‚
â”‚                                         â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## 12. Performance Considerations

### 12.1 Data Loading Strategy

| Data | Strategy | Cache TTL |
|------|----------|-----------|
| Application list | SWR with pagination | 30 seconds |
| Candidate profile | Load on select | 5 minutes |
| Resume PDF | Lazy load | Session |
| Match scores | Pre-computed | 1 hour |

### 12.2 Pagination

- Initial load: 20 applications
- Load more: Infinite scroll or "Load More" button
- High volume (100+): Encourage using filters

### 12.3 Real-time Updates

| Event | Source | Action |
|-------|--------|--------|
| New application | FCM push | Add to list with animation |
| Candidate withdrew | FCM push | Remove from list |
| Status changed (other HR) | Polling | Refresh affected item |

---

## 13. Accessibility

### 13.1 Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Move between panels |
| `â†‘/â†“` | Navigate application list |
| `Enter` | Select application |
| `A` | Accept (with focus on detail) |
| `R` | Reject (with focus on detail) |
| `Esc` | Close modal/drawer |

### 13.2 Screen Reader

| Element | Announcement |
|---------|--------------|
| Application card | "{Name}, {Position}, Match {Score}%, {Status}, applied {Time}" |
| Action button | "{Action} application from {Name}" |
| Status change | "{Name}'s application has been {action}" |

---

## 14. Analytics Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `applications_viewed` | Page load | `company_id`, `count` |
| `application_selected` | Card click | `application_id`, `match_score` |
| `application_accepted` | Accept success | `application_id`, `job_id`, `time_to_decision` |
| `application_rejected` | Reject success | `application_id`, `job_id`, `has_feedback` |
| `filter_applied` | Filter change | `filter_type`, `filter_value` |
| `resume_viewed` | PDF opened | `application_id` |

---

## 15. Test Scenarios

### 15.1 Critical Paths

| Scenario | Steps | Expected |
|----------|-------|----------|
| Accept application | View â†’ Select â†’ Accept | Chat drawer opens, status updates |
| Reject with feedback | View â†’ Select â†’ Reject â†’ Enter feedback â†’ Confirm | Status updates, email sent |
| Filter by job | Open filter â†’ Select job â†’ Apply | List shows only that job's applications |
| Mobile swipe accept | Swipe right â†’ Confirm | Status updates, toast shown |

### 15.2 Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Accept already accepted | Toast "à¸”à¸³à¹€à¸™à¸´à¸™à¸à¸²à¸£à¹à¸¥à¹‰à¸§" |
| Reject withdrawn app | Error "à¸œà¸¹à¹‰à¸ªà¸¡à¸±à¸„à¸£à¸–à¸­à¸™à¹ƒà¸šà¸ªà¸¡à¸±à¸„à¸£à¹à¸¥à¹‰à¸§" |
| Concurrent HR actions | Last write wins, show notification |
| Very long candidate name | Truncate with ellipsis |
| Missing resume | Show "à¹„à¸¡à¹ˆà¸¡à¸µà¹„à¸Ÿà¸¥à¹Œ Resume" placeholder |

---

## 16. Implementation Checklist

### Phase 1: Core List View
- [ ] Create three-panel layout component
- [ ] Implement filter panel with all filters
- [ ] Implement application list with cards
- [ ] Implement basic detail panel
- [ ] Add SWR data fetching
- [ ] Add loading states

### Phase 2: Actions
- [ ] Implement Accept flow with chat creation
- [ ] Implement chat drawer integration
- [ ] Implement Reject flow with modal
- [ ] Implement mark as read
- [ ] Add optimistic updates
- [ ] Add error handling

### Phase 3: Enhanced Features
- [ ] Add match score display and breakdown
- [ ] Add internal notes feature
- [ ] Add resume viewer
- [ ] Add bulk actions

### Phase 4: Mobile
- [ ] Implement mobile list view
- [ ] Implement mobile detail overlay
- [ ] Add swipe gestures
- [ ] Add bottom sheet filters

### Phase 5: Polish
- [ ] Add real-time updates
- [ ] Add keyboard navigation
- [ ] Add analytics
- [ ] Add empty states
- [ ] Performance optimization

---

## Appendix A: TypeScript Types

```typescript
// Application status enum
type ApplicationStatus = 
  | 'applied'
  | 'read'
  | 'accepted'
  | 'rejected'
  | 'scheduled'
  | 'confirmed'
  | 'declined'
  | 'cancelled'
  | 'withdraw'
  | 'closed'
  | 'systemclosed';

// Page state
type PageState = 
  | 'loading'
  | 'ready'
  | 'list_view'
  | 'detail'
  | 'filtered'
  | 'empty_apps'
  | 'empty_jobs'
  | 'error'
  | 'redirect';

// Action state
type ActionState = 
  | 'idle'
  | 'accepting'
  | 'reject_modal'
  | 'rejecting'
  | 'marking_read'
  | 'chat_drawer';

// Filter state
interface FilterState {
  jobId: string | null;
  statuses: ApplicationStatus[];
  dateFrom: Date | null;
  dateTo: Date | null;
  minScore: number;
  maxScore: number;
}

// Sort options
type SortOption = 'newest' | 'oldest' | 'score_high' | 'score_low';
```

---

## Appendix B: Server Action Signatures

```typescript
// Accept application
async function AcceptApplication(input: {
  companyId: string;
  candidateId: string;
  hrId: string;
  jobId: string;
  applicationId: string;
  name: string;
  jobTitle: string;
  companyName: string;
}): Promise<{ status: 200; message: string; chatId: string }>;

// Reject application
async function rejectApplication(input: {
  applicationId: string;
  payload: JobApplicationData;
  rejectedMessage: string;
  actorId: string;
}): Promise<true>;

// Mark as read
async function readApplication(input: {
  applicationId: string;
}): Promise<true>;

// Get company applications
async function JobApplicationGetByCompany(input: {
  companyId: string;
  status?: ApplicationStatus;
  jobId?: string;
}): Promise<ApplicationListItem[]>;

// Add internal note
async function addApplicationNote(input: {
  applicationId: string;
  authorId: string;
  content: string;
}): Promise<InternalNote>;
```

---

## Appendix C: SWR Key Reference

| Key Pattern | Usage | Invalidate On |
|-------------|-------|---------------|
| `company-applications-${companyId}` | Application list | Accept, Reject, New app |
| `application-detail-${appId}` | Single application | Accept, Reject, Note add |
| `candidate-${candidateId}` | Candidate profile | Candidate update |
| `company-jobs-${companyId}` | Job dropdown | Job create/update |
| `chat-${chatId}` | Chat room | Message sent |

---

*End of COMP-R08 Route Implementation Specification*
