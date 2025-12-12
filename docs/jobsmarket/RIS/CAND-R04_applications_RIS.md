# CAND-R04: Candidate Applications Route Implementation Spec

**Version:** 1.0  
**Last Updated:** 2025-12-10  
**Route:** `/candidates/[id]/applications`  
**Primary Domain:** Jobs (Candidate Context)

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-10 | Initial RIS creation with application tracking, timeline, withdraw flow |

---

## Cross-References

This document references shared specifications from:

| Document | Section | Topic |
|----------|---------|-------|
| **CAND-R00** | Section 2 | Candidate Shell specification |
| **CAND-R00** | Section 3 | Access control |
| **JOB-R00** | Section 5.1 | Application status lifecycle |
| **JOB-R02b** | Section 6 | Application status management |

---

## 1. Route Metadata

| Property | Value |
|----------|-------|
| Route ID | CAND-R04 |
| Route Path | `/candidates/[id]/applications` |
| Shell | Candidate Shell |
| Purpose | Track all job applications with status and timeline |
| Complexity | Medium |
| Phase | 4 (Application Flow) |
| UI Spec | `04-candidate-routes.md` Section 5.3 |

### Route Parameters

| Parameter | Type | Source | Validation |
|-----------|------|--------|------------|
| `id` | `string` | URL path segment | Must be candidate UID, must match current user |

### Query Parameters

| Parameter | Type | Purpose | Default |
|-----------|------|---------|---------|
| `status` | `string` | Filter by application status | `all` |

### Access Control

| Condition | Check | Failure Behavior |
|-----------|-------|------------------|
| User authenticated | `sessionStateAtom === 'valid'` | Redirect to `/auth/login` |
| Route ownership | `params.id === currentUser.uid` | Redirect to own applications |
| Active role | `activeRoleAtom === 'candidate'` | Redirect to role selection |

---

## 2. Domain Classification

### Primary Domain: Jobs (◉)

- **Owns:** Application list display, status tracking, timeline
- **Mutations:** Withdraw application (JOB-014)
- **Data Source:** Firestore `web_job_applications` collection

### Secondary Domains (◎)

| Domain | Role | Access | Condition |
|--------|------|--------|-----------|
| Candidate | Profile context | Read candidate info | Shell context |
| Company | Company display | Read company info | For job cards |
| Chat | Message company | Open chat room | Application accepted |

### Global Domains (⊙) - Via Candidate Shell

| Domain | Requirement |
|--------|-------------|
| Auth | Session validation |
| Chat | FAB in shell |
| Notifications | Bell icon in shell |

---

## 3. Feature Mapping

### Existing Features (Preserve - P0)

| Feature ID | Feature Name | Coverage | Notes |
|------------|--------------|----------|-------|
| JOB-021 | Get Application by Candidate | Full | List all applications |
| JOB-014 | Withdraw Job Application | Full | Withdraw action |

**Source:** `features_jobs.md` lines 1188-1223, 852-900

### Feature Implementation Details

#### JOB-021: Get Application by Candidate

| Aspect | Implementation |
|--------|----------------|
| Entry Point | Page load |
| Server Action | `JobApplicationGetByCandidate` |
| Data Source | Firestore `web_job_applications` filtered by `candidateId` |
| Sorting | By `updatedAt` descending |

#### JOB-014: Withdraw Job Application

| Aspect | Implementation |
|--------|----------------|
| Entry Point | Withdraw button on application card |
| Server Action | `JobApplicationDel` |
| Preconditions | Status in [applied, read, accepted] |
| Side Effects | Notify company, invalidate cache |

### New Features (Enhancements)

| Feature | Description | Priority |
|---------|-------------|----------|
| Status Tabs | Filter by application status | P0 |
| Timeline View | Show application progress | P0 |
| Interview Display | Show scheduled interview info | P0 |
| Message Company | Quick access to chat | P0 |
| Job Link | Navigate to job detail | P0 |

---

## 4. Data Contract

### 4.1 Read Operations

| Data | Collection | Fields | Condition | SWR Key |
|------|------------|--------|-----------|---------|
| Applications | `web_job_applications` | All fields | `candidateId === uid` | `candidate-applications-${uid}` |
| Job Details | `jobs` | `title`, `companyId`, `companyName`, `companyLogo`, `isActive` | `uid === app.jobId` | `job-${jobId}` |
| Company Info | `company_information` | `name`, `logo` | `uid === job.companyId` | `company-${companyId}` |
| Interview Data | `job_interviews` | All fields | `applicationId === app.uid` | `interview-${applicationId}` |

### 4.2 Application List Data Shape

```typescript
interface ApplicationListItem {
  // Application fields
  uid: string;                    // Application ID
  jobId: string;
  candidateId: string;
  companyId: string;
  status: ApplicationStatus;
  expectedSalary?: number;
  isNegotiable?: boolean;
  overheadDays?: number;
  headlines?: string;
  rejectFeedback?: string;        // If rejected
  hrId?: string;                  // Assigned HR
  chatId?: string;                // If chat created
  createdAt: number;
  updatedAt: number;
  
  // Joined fields (from job/company)
  jobTitle: string;
  companyName: string;
  companyLogo: string;
  jobIsActive: boolean;
  
  // Interview (if scheduled)
  interview?: InterviewData;
}

interface InterviewData {
  uid: string;
  status: InterviewStatus;
  appointment: number;            // Timestamp
  from: string;                   // Start time
  to: string;                     // End time
  channel: 'online' | 'onsite';
  location?: string;
  room?: string;
}

type ApplicationStatus = 
  | 'applied' | 'read' | 'accepted' | 'rejected'
  | 'scheduled' | 'confirmed' | 'declined' | 'cancelled'
  | 'withdraw' | 'closed' | 'systemclosed';

type InterviewStatus = 
  | 'scheduled' | 'confirmed' | 'declined' | 'cancelled';
```

### 4.3 Write Operations

| Action | Collection | Fields | Server Action | Trigger |
|--------|------------|--------|---------------|---------|
| Withdraw | `web_job_applications` | `status = 'withdraw'` | `JobApplicationDel` | Withdraw button |

### 4.4 Status Tab Mapping

| Tab | Status Values | Count Query |
|-----|---------------|-------------|
| ทั้งหมด (All) | `*` | Total count |
| สมัครแล้ว (Applied) | `applied`, `read` | Sum of both |
| กำลังพิจารณา (Reviewing) | `accepted` | Count |
| นัดสัมภาษณ์ (Interviewing) | `scheduled`, `confirmed` | Sum |
| ได้รับข้อเสนอ (Offers) | - | Reserved for future |
| ไม่ผ่าน (Rejected) | `rejected`, `declined` | Sum |

---

## 5. State Contract

### 5.1 Atoms Used

| Atom | Type | Access | Purpose |
|------|------|--------|---------|
| `userAtom` | `userDataProps \| null` | Read | Get candidate UID |
| `candidateAtom` | `candidateDataProps \| null` | Read | Profile context |
| `activeRoleAtom` | `string` | Read | Verify candidate role |
| `sessionStateAtom` | `SessionState` | Read | Auth state |

### 5.2 SWR Keys

| Key Pattern | Purpose | Config |
|-------------|---------|--------|
| `candidate-applications-${uid}` | All applications | `defaultSWRConfig` |
| `candidate-applications-${uid}-${status}` | Filtered by status | `defaultSWRConfig` |
| `job-${jobId}` | Job detail cache | `staticSWRConfig` |
| `interview-${applicationId}` | Interview for application | `defaultSWRConfig` |

### 5.3 Local Component State

| State | Type | Scope | Purpose |
|-------|------|-------|---------|
| `activeTab` | `StatusTab` | Page | Current filter tab |
| `expandedCards` | `Set<string>` | Page | Track expanded applications |
| `withdrawTarget` | `string \| null` | Page | Application being withdrawn |
| `isWithdrawModalOpen` | `boolean` | Page | Withdraw confirmation modal |

---

## 6. UI State Machine

### 6.1 Page State Automaton

```
              ┌─────────────┐
              │   LOADING   │
              │(fetch apps) │
              └──────┬──────┘
                     │
       ┌─────────────┼─────────────┐
       │             │             │
       ▼             ▼             ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│    IDLE     │ │    EMPTY    │ │    ERROR    │
│ (has apps)  │ │ (no apps)   │ │  (failed)   │
└──────┬──────┘ └─────────────┘ └──────┬──────┘
       │                               │
       │                               │
       ▼                               ▼
  ┌─────────────┐                ┌─────────────┐
  │ WITHDRAWING │                │    IDLE     │
  └──────┬──────┘                │   (retry)   │
         │                       └─────────────┘
    ┌────┴────┐
    │         │
 SUCCESS    ERROR
    │         │
    ▼         ▼
  IDLE      IDLE
(refresh)  (toast)
```

### 6.2 Page State Transition Table

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `loading` | `FETCH_SUCCESS` | `idle` | `apps.length > 0` | Set applications data |
| `loading` | `FETCH_SUCCESS` | `empty` | `apps.length === 0` | - |
| `loading` | `FETCH_ERROR` | `error` | - | Set error message |
| `idle` | `TAB_CHANGE` | `loading` | - | Fetch with new filter |
| `idle` | `EXPAND_CARD` | `idle` | - | Toggle card expansion |
| `idle` | `WITHDRAW_CLICK` | `idle` | - | Open withdraw modal |
| `idle` | `WITHDRAW_CONFIRM` | `withdrawing` | - | Call server action |
| `withdrawing` | `SUCCESS` | `idle` | - | Refresh list, close modal, toast |
| `withdrawing` | `ERROR` | `idle` | - | Show error toast, close modal |
| `error` | `RETRY` | `loading` | - | Re-fetch |
| `empty` | `TAB_CHANGE` | `loading` | - | Fetch with new filter |

### 6.3 Application Card State

```typescript
type CardState = 'collapsed' | 'expanded';

// Card state transitions
| Current | Event | Next | Side Effect |
|---------|-------|------|-------------|
| collapsed | CLICK | expanded | Show timeline |
| expanded | CLICK | collapsed | Hide timeline |
| expanded | CLICK_OUTSIDE | collapsed | Hide timeline |
```

---

## 7. Component Layout

### 7.1 Page Structure

```
┌─────────────────────────────────────────────────────────────┐
│ Candidate Shell Header                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Page Title: "ใบสมัครงานของฉัน"                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Status Tabs                                          │   │
│  │ [ทั้งหมด] [สมัครแล้ว] [กำลังพิจารณา] [นัดสัมภาษณ์] [ไม่ผ่าน] │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Results Count: "XX ใบสมัคร"                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Application Card 1                              [▼] │   │
│  │ ┌───────┐ Company Name                              │   │
│  │ │ Logo  │ Job Title                    [Status]     │   │
│  │ └───────┘ Applied: DD MMM YYYY                      │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ Timeline (expanded)                                  │   │
│  │ ✓ สมัครงาน - DD MMM                                   │   │
│  │ ✓ บริษัทดูใบสมัคร - DD MMM                             │   │
│  │ ◯ รอการตอบรับ                                         │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ [ดูประกาศงาน] [ส่งข้อความ] [ถอนใบสมัคร]               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Application Card 2...                                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Application Card Components

| Component | Purpose | Position | Action |
|-----------|---------|----------|--------|
| **Card Header** | Overview | Top | Toggle expand |
| ↳ Company Logo | 48×48 | Left | - |
| ↳ Company Name | Employer | Top | → /companies/[id] |
| ↳ Job Title | Position (bold) | Below company | → /jobs/[id] |
| ↳ Applied Date | "สมัครเมื่อ DD MMM" | Below title | - |
| ↳ Status Badge | Current status | Right | - |
| ↳ Next Action | If applicable | Below badge | - |
| ↳ Expand Arrow | ▼ / ▲ | Right | Toggle timeline |
| **Timeline** | Progress tracking | Expanded area | - |
| ↳ Timeline Items | Status history | Vertical | - |
| **Action Buttons** | Available actions | Bottom | - |
| ↳ View Job | "ดูประกาศงาน" | Left | → /jobs/[id] |
| ↳ Message | "ส่งข้อความ" | Center | → /chat/[roomId] |
| ↳ Withdraw | "ถอนใบสมัคร" | Right | Open confirm modal |

### 7.3 Timeline Items

| Status | Icon | Label | Timestamp |
|--------|------|-------|-----------|
| Applied | ✓ (green) | สมัครงานแล้ว | createdAt |
| Read | ✓ (green) | บริษัทดูใบสมัคร | Read timestamp |
| Accepted | ✓ (green) | ตอบรับ | Accept timestamp |
| Scheduled | ◯ (orange) | นัดสัมภาษณ์ [Date] | appointment |
| Confirmed | ✓ (green) | ยืนยันสัมภาษณ์แล้ว | Confirm timestamp |
| Declined | ✕ (red) | ปฏิเสธสัมภาษณ์ | Decline timestamp |
| Rejected | ✕ (red) | ไม่ผ่านการคัดเลือก | Reject timestamp |
| Pending | ○ (gray) | รอการตอบรับ | - |

---

## 8. Component-Action Wiring

### 8.1 Status Tab Components

| Component | Trigger | Action | State Change |
|-----------|---------|--------|--------------|
| Tab Button | Click | `setActiveTab(status)` | Filter applications |
| Tab Badge | - | - | Display count |

### 8.2 Application Card Components

| Component | Trigger | Action | Navigation/Effect |
|-----------|---------|--------|-------------------|
| Card Header | Click | `toggleExpand(appId)` | Expand/collapse |
| Company Logo | Click | - | → /companies/[id] |
| Company Name | Click | - | → /companies/[id] |
| Job Title | Click | - | → /jobs/[id] |
| View Job Button | Click | - | → /jobs/[id] |
| Message Button | Click | `openChat(chatId)` | → /chat/[roomId] or drawer |
| Withdraw Button | Click | `openWithdrawModal(appId)` | Open modal |
| Interview Card | Click | - | Show interview details |

### 8.3 Withdraw Modal Components

| Component | Trigger | Action | Effect |
|-----------|---------|--------|--------|
| Cancel Button | Click | `closeWithdrawModal()` | Close modal |
| Confirm Button | Click | `withdrawApplication()` | Execute withdraw |
| Backdrop | Click | `closeWithdrawModal()` | Close modal |

---

## 9. Error Handling

### 9.1 Page-Level Errors

| Error Type | Condition | Display | Recovery |
|------------|-----------|---------|----------|
| Network Error | Fetch failed | Error state + retry | Retry button |
| Unauthorized | Not logged in | Redirect | → /auth/login |
| Wrong User | ID mismatch | Redirect | → own applications |

### 9.2 Action Errors

| Error Type | Condition | Display (Thai) | Recovery |
|------------|-----------|----------------|----------|
| Withdraw Failed | Network error | ถอนใบสมัครไม่สำเร็จ | Toast + retry |
| Already Processed | Status changed | ใบสมัครถูกดำเนินการแล้ว | Refresh list |
| Job Deleted | Job no longer exists | ประกาศงานถูกลบแล้ว | Show limited info |
| Company Suspended | Company inactive | - | Hide company link |

---

## 10. Empty States

### 10.1 No Applications

| Component | Display |
|-----------|---------|
| Illustration | Empty inbox graphic |
| Title | "คุณยังไม่ได้สมัครงาน" |
| Description | "เริ่มสมัครงานเพื่อติดตามสถานะได้ที่นี่" |
| CTA Button | "ค้นหางาน" → /jobs |

### 10.2 No Results in Filter

| Component | Display |
|-----------|---------|
| Message | "ไม่มีใบสมัครในสถานะนี้" |
| Suggestion | Links to other tabs with count |

---

## 11. Interview Display

### 11.1 Interview Card (When Scheduled)

| Component | Purpose | Display |
|-----------|---------|---------|
| Date Badge | Interview date | DD MMM YYYY |
| Time | Time slot | HH:MM - HH:MM |
| Type Icon | Channel | Video/Phone/In-person |
| Location | If onsite | Address text |
| Status | Interview status | Badge |
| **Actions** | | |
| Confirm | If scheduled | "ยืนยันสัมภาษณ์" button |
| Decline | If scheduled | "ปฏิเสธสัมภาษณ์" button |
| Add to Calendar | If confirmed | Calendar link |

### 11.2 Interview Actions

| Action | Route | Side Effect |
|--------|-------|-------------|
| Confirm Interview | CHAT-R02 | Update status to confirmed |
| Decline Interview | CHAT-R02 | Update status to declined |
| View Chat | CHAT-R02 | Navigate to chat room |

> **Note:** Interview confirmation/decline actions are handled in CHAT-R02, not on this page. This page only displays status and provides navigation.

---

## 12. Accessibility

### 12.1 Page Accessibility

| Component | ARIA | Keyboard |
|-----------|------|----------|
| Page title | `<h1>` | - |
| Status tabs | `role="tablist"`, `role="tab"` | Arrow keys |
| Tab panel | `role="tabpanel"` | - |
| Results count | `aria-live="polite"` | - |

### 12.2 Card Accessibility

| Component | ARIA | Keyboard |
|-----------|------|----------|
| Card container | `role="article"` | - |
| Expand button | `aria-expanded`, `aria-controls` | Enter/Space |
| Timeline | `role="list"` | - |
| Timeline item | `role="listitem"` | - |
| Status badge | `aria-label` with full status | - |

### 12.3 Focus Management

| Scenario | Focus Target |
|----------|--------------|
| Page load | Page title |
| Tab change | First card in filtered list |
| Card expand | Timeline container |
| Card collapse | Card header |
| Withdraw success | Next card or empty state |

---

## 13. Test Scenarios

### 13.1 Load and Display

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| R03-01 | Load with applications | Navigate to page | Show skeleton, then list |
| R03-02 | Load empty | Navigate (no apps) | Show empty state |
| R03-03 | Filter by status | Click "สมัครแล้ว" tab | Show filtered, count updates |
| R03-04 | Filter no results | Filter to empty tab | Show "no results" message |

### 13.2 Card Interactions

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| R03-05 | Expand card | Click card | Timeline shows |
| R03-06 | Collapse card | Click expanded card | Timeline hides |
| R03-07 | Navigate to job | Click job title | → /jobs/[id] |
| R03-08 | Message company | Click message (accepted) | Open chat |
| R03-09 | Message hidden | View applied status | No message button |

### 13.3 Withdraw Flow

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| R03-10 | Withdraw success | Confirm withdraw | Status changes, toast |
| R03-11 | Withdraw cancel | Click cancel | Modal closes, no change |
| R03-12 | Withdraw error | Network fail | Error toast, can retry |
| R03-13 | Withdraw unavailable | View rejected app | No withdraw button |

### 13.4 Interview Display

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| R03-14 | View scheduled | Expand scheduled app | Interview details shown |
| R03-15 | Confirmed interview | Expand confirmed | Calendar link visible |

---

## 14. Implementation Checklist

### 14.1 Components

- [ ] `ApplicationsPage` - Page container
- [ ] `StatusTabs` - Filter tabs
- [ ] `ApplicationCard` - Card component
- [ ] `ApplicationTimeline` - Progress timeline
- [ ] `InterviewCard` - Interview display
- [ ] `WithdrawModal` - Confirmation modal
- [ ] `EmptyState` - No applications display

### 14.2 Hooks

- [ ] `useApplications` - Fetch applications with filter
- [ ] `useWithdrawApplication` - Withdraw mutation
- [ ] `useApplicationCounts` - Tab counts

### 14.3 Server Actions

- [ ] `JobApplicationGetByCandidate` - Fetch list
- [ ] `JobApplicationDel` - Withdraw

### 14.4 Integration Points

- [ ] Status badge component (shared)
- [ ] Chat drawer integration
- [ ] Timeline component
- [ ] SWR cache sync with JOB-R02

---

## 15. Related Documents

| Document | Relationship |
|----------|--------------|
| `CAND-R00_cross-cutting_RIS.md` | Candidate shell, access control |
| `JOB-R00_cross-cutting_RIS.md` | Application status lifecycle |
| `JOB-R02_job-detail_RIS.md` | Apply flow, status display |
| `JOB-R02b_apply-modal_RIS.md` | Withdraw specification |
| `COMP-R05_applications_RIS.md` | Company-side view |
| `CHAT-R02` | Interview actions (planned) |
| `features_jobs.md` | Feature definitions |
| `04-candidate-routes.md` | UI specification |

---

*End of JOB-R03 Candidate Applications Route Implementation Spec*
