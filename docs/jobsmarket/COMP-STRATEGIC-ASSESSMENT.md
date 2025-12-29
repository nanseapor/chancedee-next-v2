# Company Routes (COMP-R*) Strategic Assessment

**Document Version:** 1.0
**Created:** 2025-12-19
**Purpose:** Comprehensive analysis of all Company route documents to determine optimal implementation order
**Scope:** COMP-R00 through COMP-R08 (8 RIS documents analyzed)

---

## Executive Summary

The Company domain consists of **8 complete RIS documents** covering a comprehensive job management platform for companies. All routes share a common shell and access control framework defined in COMP-R00.

**Key Findings:**
- **COMP-R00 MUST be implemented FIRST** - it provides the foundation for all other routes
- Routes fall into 4 natural implementation phases
- Total estimated effort: **6-8 weeks** for full implementation
- No company routes currently exist in the codebase
- Complexity level: **Very High** (complex state management, multi-domain integration, real-time features)

**Recommended Implementation Order:**
```
Phase 1: COMP-R00 → R01 → R02 → R03 (Foundation & Setup)
Phase 2: COMP-R04 → R05 (Dashboard & Job List)
Phase 3: COMP-R06 → R07 (Job CRUD)
Phase 4: COMP-R08 (Application Management)
```

---

## 1. Route Overview Matrix

| Route ID | Route Path | Purpose | Complexity | Dependencies | Priority |
|----------|------------|---------|------------|--------------|----------|
| **COMP-R00** | N/A (cross-cutting) | Shared patterns, access control, shell | **Foundation** | None | **P0 - MUST BUILD FIRST** |
| **COMP-R01** | `/companies/[id]/pending` | Pending/rejected company status | Medium | R00 (minimal) | P1 |
| **COMP-R02** | `/companies/[id]/dashboard/team` | Team member management | High | R00 access control | P1 |
| **COMP-R03** | `/companies/[id]/dashboard/settings` | Company profile & configuration | High | R00 access control | P1 |
| **COMP-R04** | `/companies/[id]/dashboard` | Dashboard metrics & overview | High | R00 + job/app data | P2 |
| **COMP-R05** | `/companies/[id]/dashboard/jobs` | Job posting management list | High | R00 + job domain | P2 |
| **COMP-R06** | `/companies/[id]/dashboard/jobs/new` | Create job (4-step wizard) | High | R05, job domain | P3 |
| **COMP-R07** | `/companies/[id]/dashboard/jobs/[jobId]` | Job detail/edit view | High | R05, job domain | P3 |
| **COMP-R08** | `/companies/[id]/dashboard/applications` | Application management | **Very High** | Job, candidate, chat domains | P4 |

**Note:** COMP-R09 (Candidate browse/search) is mentioned as planned but no RIS document exists yet.

---

## 2. COMP-R00 Analysis (Cross-Cutting)

### 2.1 What COMP-R00 Provides

**Shared Components Defined:**
- ✅ **Company Shell Variants**: Minimal Shell (R01 only) vs Full Company Shell (R02-R08)
- ✅ **Sidebar Navigation**: 6 navigation items with badges and icons
- ✅ **Header Components**: Company logo, name, role badge, notification bell, user avatar, chat FAB
- ✅ **Modal Dialog Patterns**: Standardized modal state management
- ✅ **Status Badge Components**: Color-coded status indicators

**Shared Hooks/Utilities:**
- ✅ **Access Control Hooks**: 5-level state machine (auth → membership → status → role → permission)
- ✅ **Role Permission Checker**: `hasPermission(role, action)` utility
- ✅ **SWR Key Factory**: Standardized key patterns for all routes
- ✅ **Company Status Checker**: Status lifecycle validation

**Auth/Authorization Patterns:**
- ✅ **5-Level Access Control**:
  1. AUTH_CHECK: `firebaseUserAtom !== null`
  2. MEMBERSHIP_CHECK: `user.companyId === params.id`
  3. STATUS_CHECK: Company status (pending/rejected → minimal, approved → role-based)
  4. ROLE_CHECK: User role permissions
  5. PERMISSION_CHECK: Specific action permission
- ✅ **Role Permissions Matrix**: 5 roles (Admin, HR Manager, Recruiter, Interviewer, Viewer) with 7 permissions
- ✅ **Company Status Lifecycle**: pending → approved/rejected, approved ↔ suspended

**Navigation Structure:**
```
Company Shell Sidebar:
├─ Dashboard (แดชบอร์ด)
├─ Jobs (ประกาศงาน) [with count badge]
├─ Applications (ใบสมัคร) [with count badge]
├─ Candidates (ค้นหาผู้สมัคร)
├─ Team (ทีม) [with pending count badge]
└─ Settings (การตั้งค่า)
```

**Global State (Atoms):**
```typescript
- firebaseUserAtom: User | null
- userAtom: userDataProps | null
- companyAtom: companyDataProps | null
- activeRoleAtom: string ('company')
- sessionStateAtom: SessionState
```

**SWR Key Conventions:**
```typescript
`company-${id}` - company info
`company-staff-${id}` - team members
`company-jobs-${id}` - jobs list
`company-applications-${id}` - applications
`company-job-counts-${id}` - job status counts
`job-${jobId}` - job detail
`application-detail-${appId}` - application detail
`candidate-${candidateId}` - candidate profile
`chat-${chatId}` - chat room
```

### 2.2 Assessment: Build First or Last?

**Recommendation:** ⭐ **BUILD FIRST** ⭐

**Rationale:**
1. **Every route depends on it** - Access control patterns are used by all 8 routes
2. **Shared shell components** - Minimal Shell (R01) and Company Shell (R02-R08) are defined here
3. **Type definitions** - All routes reference COMP-R00 types
4. **Permission system** - Role-based access control is foundational
5. **Navigation structure** - Sidebar navigation affects all dashboard routes
6. **Implementation efficiency** - Building R00 first prevents code duplication across routes

**What to Build in COMP-R00:**
```typescript
// 1. TypeScript Types
- companyDataProps
- userDataProps (with roles[])
- SessionState
- CompanyStatus enum
- Role enum
- Permission enum

// 2. Access Control Hooks
- useCompanyAccess(companyId): { status, role, permissions }
- usePermission(permission): boolean
- useCompanyStatus(companyId): CompanyStatus
- useRoleCheck(requiredRole): boolean

// 3. Shell Components
- CompanyShellLayout (with sidebar, header, FAB)
- MinimalShellLayout (limited header)
- CompanySidebar (navigation items with badges)
- CompanyHeader (logo, name, role, notifications, avatar)
- ChatFAB (floating action button)

// 4. Utilities
- hasPermission(role, action): boolean
- checkCompanyStatus(status): { isApproved, isPending, isRejected, isSuspended }
- swrKeyFactory: { company, jobs, applications, etc. }

// 5. Atoms (if not already in shared)
- companyAtom
- activeRoleAtom (if company-specific)
```

**Implementation Time for R00:** 1-2 weeks

---

## 3. Dependency Graph

### 3.1 Visual Dependency Map

```
COMP-R00 (Foundation)
    │
    │ (provides access control, shell, types)
    │
    ├───────────────────────────────────────────────────┐
    │                                                   │
    ▼                                                   ▼
PHASE 1: Foundation Routes                    (Job Domain Services)
├─ COMP-R01 (Pending)                         ├─ JobCreate()
├─ COMP-R02 (Team)                            ├─ JobUpdate()
└─ COMP-R03 (Settings)                        ├─ JobPostSet()
    │                                         ├─ JobUnpublish()
    │                                         ├─ JobDeactivate()
    ├─────────────────────────────────────────┤ JobDelete()
    │                                         └─ JobDuplicate()
    ▼                                                   │
PHASE 2: Dashboard & Job Foundation                     │
├─ COMP-R04 (Dashboard) ◄───────────────────────────────┤
│   └─ Needs: Job counts, app counts                    │
│                                                       │
└─ COMP-R05 (Job List) ◄────────────────────────────────┤
    │                                                   │
    │                                                   │
    ▼                                                   │
PHASE 3: Job CRUD                                       │
├─ COMP-R06 (Create Job) ◄──────────────────────────────┤
│   └─ Depends on: R05 (return to list)                │
│                                                       │
└─ COMP-R07 (Job Detail/Edit) ◄─────────────────────────┤
    │                                                   │
    │                                                   │
    ▼                                                   ▼
PHASE 4: Application Management          (Chat Domain, Notifications)
└─ COMP-R08 (Applications) ◄─────────────┬─ Chat Service
    └─ Depends on:                       ├─ Notification Service
       • Job domain (job list)           ├─ Candidate Service
       • Candidate domain (profiles)     └─ AcceptApplication()
       • Chat domain (accept flow)           (creates chat room)
```

### 3.2 Dependency Table

| Route | Depends On | Why | Blocker? |
|-------|-----------|-----|----------|
| **R00** | None | Foundation | N/A |
| **R01** | R00 (minimal) | Access control framework | ❌ No - can implement with basic auth |
| **R02** | R00 | Role permissions, staff data | ❌ No - can use local role checking |
| **R03** | R00 | Access control | ❌ No - can implement standalone |
| **R04** | R00, Job domain | Dashboard metrics (job/app counts) | ⚠️ Partial - needs job/app count queries |
| **R05** | R00, Job domain | Job list, status state | ✅ Yes - needs job service actions |
| **R06** | R05, Job domain | Create job, return to list | ✅ Yes - needs job service |
| **R07** | R05, Job domain | Edit job, analytics, status | ✅ Yes - needs job service, analytics |
| **R08** | Job, Chat, Candidate domains | Accept flow creates chat | ✅ Yes - needs chat service, notifications |

### 3.3 Can Routes Be Implemented in Parallel?

| Route Pair | Can Parallel? | Notes |
|------------|---------------|-------|
| R01 + R02 + R03 | ✅ Yes | All independent after R00 |
| R04 + R05 | ⚠️ Partial | R04 needs job count queries from R05 work |
| R06 + R07 | ❌ No | Both depend on R05 being complete |
| R05 + R06 | ⚠️ Partial | R06 needs R05 list page to return to |
| R05 + R07 | ⚠️ Partial | R07 needs R05 for navigation context |

**Optimal Parallel Groups:**
```
Phase 1 (Parallel):
  ├─ R00 (alone, first)
  └─ Then: R01 ∥ R02 ∥ R03 (all three in parallel)

Phase 2 (Sequential):
  ├─ R04 (alone, needs job domain prep)
  └─ R05 (alone, foundation for R06/R07)

Phase 3 (Parallel):
  └─ R06 ∥ R07 (both in parallel after R05)

Phase 4 (Sequential):
  └─ R08 (alone, most complex)
```

---

## 4. Individual Route Summaries

### COMP-R00: Cross-Cutting Specifications

- **Purpose:** Foundation for all Company routes
- **Key Features:**
  - Access control framework (5-level state machine)
  - Shell variants (Minimal + Company Shell)
  - Role permissions matrix (5 roles, 7 permissions)
  - Global state atoms
  - SWR key conventions
- **Data Entities:** User, Company, Staff
- **Server Actions Needed:** None (provides patterns only)
- **Dependencies:** None
- **Blocks:** ALL other routes (R01-R08)
- **Complexity:** Foundation (not a route)
- **Estimated Effort:** 1-2 weeks (includes access control hooks, shell components, types)

---

### COMP-R01: Pending Company Status

- **Purpose:** Status page while company awaits platform approval
- **Key Features:**
  - 5-step progress stepper showing approval workflow
  - "While waiting" suggested actions
  - Rejection state with reason display
  - Auto-redirect on approval to dashboard
  - Link to edit company profile (R03)
- **Data Entities:** Company (uid, name, status, is_active, rejection reason)
- **Server Actions Needed:**
  - `resubmitCompanyApplication()` (for rejected state)
- **Dependencies:** R00 (minimal shell, access control)
- **Blocks:** None
- **Complexity:** Medium (simple state display, one action)
- **Estimated Effort:** 3-4 days

**Auth Pattern:**
```typescript
// Minimal Shell (limited header, no chat/notifications)
// Must be: company admin AND (companyId === id OR target_company === id)
// Allowed only if: status === 'pending' OR 'rejected'
```

**UI Components:**
- ProgressStepper (5 steps)
- StatusCard (pending vs rejected)
- SuggestedActions (while waiting)
- RejectionReasonDisplay

---

### COMP-R02: Team Management

- **Purpose:** Manage team members, roles, pending employee applications
- **Key Features:**
  - **Members Tab**: List staff, accept/reject pending employees, toggle roles, remove members
  - **Invite Tab**: Manage invitations, show role permissions
  - Pending invitation expiry (7-day indicator)
  - Last admin check (prevent removing only admin)
  - Self-action prevention
- **Data Entities:**
  - Staff: `{ uid, roles[], companyId, createdAt, updatedAt }`
  - PendingEmployee: `{ uid, targetCompany, transferApproved, requestTimestamp }`
- **Server Actions Needed:**
  - `companyAdminAcceptNewEmployee(targetUserId)` - moves pending to staff
  - `companyAdminRejectNewEmployee(targetUserId)` - removes pending
  - `toggleEmployeeRole(targetUserId, newRole)` - add/remove admin role
  - `removeEmployee(targetUserId)` - remove from company
- **Dependencies:** R00 (access control, role permissions)
- **Blocks:** None
- **Complexity:** High (dual-tab interface, role management, validation)
- **Estimated Effort:** 5-7 days

**Auth Pattern:**
```typescript
// Full Company Shell
// Admin only for write operations
// Non-admins see view-only Members tab
```

**UI Components:**
- TeamTabs (Members, Invite)
- MembersTable (staff list with actions)
- PendingEmployeeCard (accept/reject)
- RoleToggle (admin checkbox)
- RemoveMemberModal (with last admin check)
- InviteForm

**Business Rules:**
- Cannot remove last admin
- Cannot remove self
- Pending invite expires after 7 days
- **IMMEDIATE DETACHMENT**: When user applies to new company, immediately detached from current company (no restoration on rejection)

---

### COMP-R03: Company Settings

- **Purpose:** Company profile editing, configuration, analytics
- **Key Features:**
  - **Profile Tab**: Logo, cover photo, name, industry, size, description, links, gallery, locations
  - **Config Tab**: Default job settings (location, type, auto-close days), notification preferences
  - **Analytics Tab**: Hiring funnel, job performance (read-only, all roles)
- **Data Entities:**
  ```typescript
  CompanyProfile: {
    uid, company_name, company_name_en?, industry, company_size, founded_year,
    profile_photo, cover_photo, gallery[], description,
    website, facebook, linkedin,
    addresses[{ location, details }],
    config{ job_defaults{}, notifications{} }
  }
  ```
- **Server Actions Needed:**
  - `updateCompanyProfile()` - basic fields
  - `uploadCompanyLogo()` - to Firebase Storage
  - `uploadCompanyCover()` - to Firebase Storage
  - `addCompanyAddress()`, `removeCompanyAddress()`
  - `addGalleryPhoto()`, `removeGalleryPhoto()`
  - `updateCompanyConfig()` - job defaults
  - `updateCompanyNotifications()` - email/push toggles
- **Dependencies:** R00 (access control)
- **Blocks:** R01 (links to settings for profile edit)
- **Complexity:** High (multi-tab form editing, image uploads, address CRUD)
- **Estimated Effort:** 5-7 days

**Auth Pattern:**
```typescript
// Full Company Shell
// Profile/Config: Admin & HR Manager read/write
// Analytics: All company members read-only
```

**UI Components:**
- SettingsTabs (Profile, Config, Analytics)
- ProfileForm (with image upload)
- AddressList (CRUD for locations)
- GalleryManager (image grid with upload/delete)
- ConfigForm (job defaults, notifications)
- AnalyticsCharts (hiring funnel, job performance)

---

### COMP-R04: Company Dashboard

- **Purpose:** Company overview with key metrics and quick actions
- **Key Features** (inferred from COMP-R00):
  - Dashboard metrics: jobs count, active applications, new applicants
  - Quick action buttons: Create job, View applications, Browse candidates
  - Recent activities feed
  - Team member count with pending invitations badge
- **Data Entities:** Job counts, Application counts, Staff counts
- **Server Actions Needed:**
  - `getCompanyDashboardMetrics(companyId)` - aggregated counts
  - `getRecentActivities(companyId)` - recent actions
- **Dependencies:** R00 + Job domain (job/app counts)
- **Blocks:** None (but provides navigation hub)
- **Complexity:** High (data aggregation from multiple domains)
- **Estimated Effort:** 4-5 days

**Auth Pattern:**
```typescript
// Full Company Shell
// All company members read-only
```

**UI Components:**
- DashboardGrid (4-col stats cards)
- StatsCard (jobs, applications, team, candidates)
- QuickActionsSection (CTA buttons)
- RecentActivitiesFeed (timeline)

**Note:** COMP-R04 detailed RIS not found - specifications inferred from COMP-R00. May need to request detailed RIS or extract from cross-cutting document.

---

### COMP-R05: Job Management List

- **Purpose:** View all jobs, filter by status, bulk actions, search
- **Key Features:**
  - **Status Tabs**: All, Active, Draft, Paused, Closed (with counts)
  - **Search & Filters**: By title, status, date range, match score
  - **Sortable Columns**: Title, applications, views, posted date
  - **Bulk Actions**: Pause/close multiple jobs
  - **Row Actions**: View, Edit, Pause/Resume, Publish, Close, Duplicate, Delete
  - **Mobile Card View**: Responsive design for small screens
- **Data Entities:** Job (uid, title, status, applicationCount, viewCount, postStartDate, postExpiryDate)
- **Server Actions Needed:**
  - `JobPostSet()` - publish/schedule
  - `JobUnpublish()` - pause
  - `JobDeactivate()` - close
  - `JobDelete()` - delete draft only
  - `JobDuplicate()` - copy to new draft
  - `JobBulkUnpublish()`, `JobBulkClose()` - bulk operations
- **Dependencies:** R00 + Job domain service
- **Blocks:** R06 (create job returns to this list), R07 (job detail links from this list)
- **Complexity:** High (complex filtering, state management, bulk operations)
- **Estimated Effort:** 6-8 days

**Job Status Lifecycle:**
```
draft ←→ published, ontimer (scheduled)
published ←→ unpublished
Any status → closed
draft → delete (only if no applications)
ontimer can activate early
```

**Auth Pattern:**
```typescript
// Full Company Shell
// Company member, company approved
```

**UI Components:**
- JobListHeader (search + create button)
- StatusTabs (with counts)
- JobTable (desktop) / JobCardList (mobile)
- JobRow (with action menu)
- JobStatusBadge (draft/published/paused/closed)
- BulkActionsBar (floating)
- ConfirmModal (delete, close, bulk actions)

**Data Fetching:**
```typescript
SWR: company-jobs-${id}, company-job-counts-${id}
Pagination: 20 per page
```

---

### COMP-R06: Create New Job (Wizard)

- **Purpose:** Multi-step job creation with auto-save drafts
- **Key Features:**
  - **4-Step Wizard**:
    1. Basic (title, type, level, salary, positions)
    2. Details (description, responsibilities, requirements, skills, benefits)
    3. Location (work mode, province, district, BTS, remote %)
    4. Review (preview + publish options)
  - **Auto-Save**: Field-level debounce (1s) with "Last saved" indicator
  - **Publish Options**: Publish now, schedule for future date, save as draft
  - **Resume Editing**: `?draftId=xxx` to continue editing
  - **Duplicate Job**: `?duplicateFrom=xxx` to pre-fill from existing
- **Data Entities:** Job (create draft, update, publish)
- **Server Actions Needed:**
  - `JobCreate()` - create new draft
  - `JobUpdate()` - update draft
  - `JobPostSet()` - publish/schedule job
  - Automatically indexes to MeiliSearch on publish
- **Dependencies:** R05 (return to list), Job domain service
- **Blocks:** None
- **Complexity:** High (wizard state, auto-save, rich text, conditional fields)
- **Estimated Effort:** 7-9 days

**Auto-Save Strategy:**
```typescript
- First change creates draft
- Subsequent changes update draft (debounce 1s)
- Step validation before proceeding
- Navigation guard with unsaved changes modal
```

**Form Validation:**
```typescript
Step 1: title (5-100 chars), jobType, jobLevel, positions (≥1), salary range
Step 2: description (≥50 chars), skills (≥1), benefits
Step 3: workModel, province (if onsite/hybrid)
Step 4: All steps valid before publish
```

**Auth Pattern:**
```typescript
// Full Company Shell
// Company member with post_jobs permission
```

**UI Components:**
- JobWizard (orchestrator)
- WizardHeader (progress stepper + save status)
- Step1BasicForm, Step2DetailsForm, Step3LocationForm, Step4Review
- RichTextEditor (Tiptap for description)
- SkillsInput (multi-select with autocomplete)
- LocationCascade (province → district → BTS)
- PublishOptionsModal (now/schedule/draft)
- NavigationGuardModal (unsaved changes)
- SaveIndicator (last saved timestamp)

---

### COMP-R07: Job Detail & Edit

- **Purpose:** View job performance, edit job details, manage status
- **Key Features:**
  - **View Mode**: Performance stats, 30-day views chart, recent applications, job preview
  - **Edit Mode**: Inline editing of all job fields with change tracking
  - **Status Actions**: Context-aware buttons (Publish, Unpublish, Close, Delete, Duplicate)
  - **Performance Metrics**: Total views, application count, conversion rate, days remaining
  - **Recent Applications**: List of last 5 applicants with match scores
  - **Match Score Display**: AI-calculated match breakdown (skills, experience, education, salary)
- **Data Entities:** Job (detail), JobApplications (recent 5), JobAnalytics (views, conversion)
- **Server Actions Needed:**
  - `JobUpdate()` - save changes
  - `JobPostSet()` - publish/schedule
  - `JobUnpublish()` - pause
  - `JobDeactivate()` - close
  - `JobDelete()` - draft only, no apps
  - `JobDuplicate()` - create draft copy
- **Dependencies:** R05 (navigation context), Job domain service
- **Blocks:** None
- **Complexity:** High (dual mode, complex state, analytics, field tracking)
- **Estimated Effort:** 7-9 days

**Query Parameters:**
```
?mode=view|edit (default: view)
?tab=overview|applications|settings
```

**Stats Cards:**
- Views (vs last 7 days trend)
- Applications (new this week, link to R08)
- Conversion rate (apps/views %)
- Days remaining until expiry

**Status Action Matrix:**
| Status | Edit | Publish | Unpublish | Close | Duplicate | Delete |
|--------|------|---------|-----------|-------|-----------|--------|
| draft | ✓ | ✓ | ✗ | ✓ | ✓ | ✓* |
| ontimer | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| published | ✓ | ✗ | ✓ | ✓ | ✓ | ✗ |
| unpublished | ✓ | ✓ | ✗ | ✓ | ✓ | ✗ |
| closed | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |

*Delete only if no applications

**Auth Pattern:**
```typescript
// Full Company Shell
// Cannot edit closed jobs
// Company member, company approved
```

**UI Components:**
- JobDetailPage (orchestrator)
- JobDetailHeader (title, status badge, actions)
- StatusActionButtons (context-aware)
- JobStatsCards (4 metrics)
- JobViewsChart (30-day line chart)
- RecentApplicationsList (last 5 with match scores)
- JobPreviewCard
- JobEditForm (in edit mode)
- EditFormSection (collapsible)
- ChangesSidebar (track dirty fields)
- CloseJobModal, DeleteJobModal, DiscardChangesModal

**Data Fetching:**
```typescript
SWR: job-${jobId}, job-applications-${jobId}, job-analytics-${jobId}
Analytics refresh: 60 seconds
```

---

### COMP-R08: Application Management

- **Purpose:** Central inbox for reviewing and accepting/rejecting applications
- **Key Features:**
  - **Three-Panel Layout** (Desktop):
    1. Filter Panel (left, 250px): Job filter, status, date range, match score slider
    2. Application List (center, 350px): Cards with candidate info
    3. Detail Panel (right, flex): Full candidate profile, actions
  - **Filter Options**: By job, status, date range, match score range
  - **List Sorting**: By newest (default) or match score
  - **Match Score**: AI-calculated 0-100 with color coding
  - **Mobile UI**: List view with swipe actions (right=accept, left=reject)
  - **Accept Flow**: Accept → Create chat room → Open chat drawer → Send notification
  - **Reject Flow**: Reject → Optional feedback modal → Send notification
  - **Candidate Profile**: Full profile with skills, experience, education, resume
  - **Internal Notes**: HR-only notes per application
  - **Resume Quick View**: Inline PDF preview or download
- **Data Entities:**
  ```typescript
  ApplicationListItem: {
    uid, jobId, candidateId, companyId, hrId, status,
    expectedSalary, isNegotiable, overheadDays, headlines,
    createdAt, updatedAt, rejectFeedback, chatId,
    candidateName, candidatePhoto, candidateHeadline,
    jobTitle, matchScore, isUnread
  }

  ApplicationDetail extends ApplicationListItem: {
    candidate: { /* full profile */ },
    matchBreakdown: { total, skillMatch, experienceMatch, educationMatch, salaryMatch },
    job: { /* full job details */ },
    interviews: [],
    notes: InternalNote[]
  }
  ```
- **Server Actions Needed:**
  - `AcceptApplication()` - Update status, create chat room, send notification, check first app reward
  - `rejectApplication()` - Update status, send rejection email with optional feedback
  - `readApplication()` - Update status from 'applied' to 'read' (automatic on select)
  - `JobApplicationGetByCompany()` - Fetch paginated list (20 per page)
  - `addApplicationNote()` - Add internal HR note
- **Dependencies:** Job domain, Candidate domain, Chat domain, Notification system
- **Blocks:** None
- **Complexity:** **Very High** (three-panel layout, real-time updates, chat integration, complex data shapes)
- **Estimated Effort:** 10-12 days

**Application Status Lifecycle:**
```
applied → read → accepted → scheduled → confirmed
           ↘      ↓              ↓
            → rejected      → declined
```

**Accept Flow Details:**
1. User clicks Accept
2. Server: Update status, create chat room (MD5 hash), award first app reward if first
3. UI: Remove unread badge, update status indicator
4. UI: **Open chat drawer** (slide from right, do NOT navigate)
5. Send system message to chat

**Chat Room Creation:**
```typescript
{
  uid: MD5(`${companyId}-${candidateId}`),
  companyId, candidateId, companyName, candidateName,
  responsibleHrId, responsibleHrName,
  status: 'active', timestamp
}
```

**Match Score Color Coding:**
- 🟢 Green: 80-100 (excellent match)
- 🔵 Teal: 60-79 (good match)
- 🟡 Yellow: 40-59 (fair match)
- ⚪ Gray: <40 (poor match)

**Auth Pattern:**
```typescript
// Full Company Shell
// Company member, company approved
// view_applications permission (limited for interviewer)
// Cannot modify applications without accept_reject permission
```

**UI Components:**
- ApplicationsPage (orchestrator)
- FilterPanel (job dropdown, status checkboxes, date picker, score slider)
- ApplicationList, ApplicationCard (avatar, name, match score, status, time)
- DetailPanel, CandidateDetail, MatchBreakdownCard
- ResumeViewer (PDF preview)
- InternalNotesSection
- ActionBar (Accept/Reject/Schedule/Message buttons)
- RejectModal (with optional feedback textarea)
- ConfirmAcceptModal
- Mobile: DetailOverlay, SwipeDetection

**Performance:**
- Pagination: 20 initial, infinite scroll for more
- SWR caching: 30 seconds for applications, 5 minutes for candidate profiles
- Lazy load resume PDF
- Optimistic updates for actions

**Empty States:**
- No applications: "ยังไม่มีผู้สมัคร" with "สร้างประกาศงาน" CTA
- Filter no results: "ไม่มีผู้สมัครในเกณฑ์นี้" with "ลบตัวกรอง"
- No jobs posted: "ยังไม่มีประกาศงาน"

---

## 5. Existing Code Analysis

### Server Actions Available

Checked existing company-related actions in `src/lib/database/actions/`:

| Action | File | Can Reuse? | Notes |
|--------|------|------------|-------|
| `company-information.ts` | ✅ Exists | **YES** | Base company profile operations |
| `company-requests.ts` | ✅ Exists | **YES** | Company approval/rejection (for R01) |
| `company-data-props.ts` | ✅ Exists | **YES** | Type definitions |
| `company-requests-data-props.ts` | ✅ Exists | **YES** | Type definitions for requests |

**New Actions Needed:**
- Team management actions (R02): accept/reject employee, toggle role, remove member
- Settings actions (R03): update profile, upload images, manage addresses
- Job domain actions (R05-R07): JobCreate, JobUpdate, JobPostSet, JobUnpublish, JobDeactivate, JobDelete, JobDuplicate
- Application actions (R08): AcceptApplication, rejectApplication, readApplication, addApplicationNote

### Hooks Available

Checked `src/hooks/jobsmarket/`:

| Hook | File | Can Reuse? |
|------|------|------------|
| `use-candidate-auth.ts` | ✅ Exists | **PATTERN ONLY** (need company equivalent) |
| `use-navigation.ts` | ✅ Exists | **YES** (if domain-agnostic) |
| `use-profile-completion.ts` | ✅ Exists | **NO** (candidate-specific) |
| `use-file-upload.ts` | ✅ Exists | **YES** (for R03 image uploads) |

**New Hooks Needed:**
- `useCompanyAccess(companyId)` - 5-level access control
- `usePermission(permission)` - role permission check
- `useCompanyStatus(companyId)` - company status check
- `useJobWizard()` - wizard state management (R06)
- `useAutoSave(data, saveFn)` - auto-save debounce (R06)

### Components Available

No company-specific components exist yet. Need to create:

**Shared Components (from R00):**
- CompanyShellLayout
- MinimalShellLayout
- CompanySidebar
- CompanyHeader
- ChatFAB

**Reusable from shadcn/ui:**
- Tabs (for R02, R03, R05, R07, R08)
- Modal/Dialog (all routes)
- Button (all routes)
- Badge (status badges)
- Card (job cards, application cards)
- Table (job list, team list)
- Form components (Input, Select, Textarea, Checkbox)

---

## 6. Implementation Order Recommendation

### Option A: Cross-Cutting First (Foundation-First Approach) ⭐ RECOMMENDED

```
Phase 1: Foundation (Week 1-2)
├─ 1. COMP-R00 (cross-cutting) - shared foundation
│     └─ Deliverables: Access control hooks, shell components, types, SWR factory
│
├─ 2. COMP-R01 (Pending) - simplest route
│     └─ Deliverables: Minimal shell test, basic routing
│
├─ 3. COMP-R02 (Team) - independent feature
│     └─ Deliverables: Team actions, role management
│
└─ 4. COMP-R03 (Settings) - independent feature
      └─ Deliverables: Profile editing, image uploads

Phase 2: Dashboard & Job Foundation (Week 3-4)
├─ 5. COMP-R04 (Dashboard) - main entry point
│     └─ Deliverables: Dashboard metrics, navigation hub
│
└─ 6. COMP-R05 (Jobs List) - core job feature
      └─ Deliverables: Job list, status tabs, bulk actions, job domain services

Phase 3: Job CRUD (Week 4-5)
├─ 7. COMP-R06 (Create Job) - depends on R05
│     └─ Deliverables: 4-step wizard, auto-save, rich text editor
│
└─ 8. COMP-R07 (Job Detail) - depends on R05
      └─ Deliverables: Dual mode (view/edit), analytics, status actions

Phase 4: Application Management (Week 6-8)
└─ 9. COMP-R08 (Applications) - most complex
      └─ Deliverables: Three-panel layout, accept/reject flows, chat integration
```

**Pros:**
- ✅ Solid foundation prevents rework
- ✅ Access control patterns established early
- ✅ Shared components reused across all routes
- ✅ Type safety from the start
- ✅ Can implement Phase 1 routes in parallel after R00
- ✅ Clear dependencies respected

**Cons:**
- ⚠️ R00 takes 1-2 weeks before any visible route
- ⚠️ Need to design patterns without full context of all routes

**Total Estimated Time:** 6-8 weeks

---

### Option B: Feature Routes First, Cross-Cutting Last (Extract-Pattern Approach)

```
Phase 1: Build One Complete Route (Week 1-2)
└─ 1. COMP-R04 (Dashboard) - extract patterns as you go

Phase 2: Add More Routes (Week 3-4)
├─ 2. COMP-R05 (Jobs List)
└─ 3. COMP-R06 (Create Job)

Phase 3: Consolidate Patterns (Week 5)
└─ 4. COMP-R00 (extract common patterns, refactor)

Phase 4: Remaining Routes (Week 6-8)
├─ 5. COMP-R01, R02, R03
├─ 6. COMP-R07
└─ 7. COMP-R08
```

**Pros:**
- ✅ Working route visible quickly
- ✅ Patterns emerge from real usage
- ✅ Learn requirements by building

**Cons:**
- ❌ Risk of duplication across routes
- ❌ Refactoring burden when extracting R00
- ❌ Access control patterns may be inconsistent
- ❌ Breaking changes during refactor
- ❌ May miss cross-cutting concerns until late

**Total Estimated Time:** 7-9 weeks (includes refactoring)

---

### Option C: Hybrid Approach (Partial Foundation, Then Iterate)

```
Phase 1: Minimal Foundation (Week 1)
└─ 1. COMP-R00 (partial) - types, basic access control, shell skeleton

Phase 2: Build Core Features (Week 2-4)
├─ 2. COMP-R04 (Dashboard)
├─ 3. COMP-R05 (Jobs List)
└─ 4. COMP-R06 (Create Job)

Phase 3: Complete Foundation (Week 4-5)
└─ 5. COMP-R00 (complete) - full access control, all shell features

Phase 4: Remaining Routes (Week 5-8)
├─ 6. COMP-R01, R02, R03
├─ 7. COMP-R07
└─ 8. COMP-R08
```

**Pros:**
- ✅ Balance between foundation and quick wins
- ✅ Basic patterns established early
- ✅ Routes visible sooner than Option A

**Cons:**
- ⚠️ Partial foundation may need rework
- ⚠️ Two passes on R00 (initial + complete)
- ⚠️ Risk of inconsistent patterns during Phase 2

**Total Estimated Time:** 6-8 weeks

---

### ⭐ Strategic Recommendation: Option A (Foundation-First)

**Recommended Order:** **Option A - Cross-Cutting First**

**Reasoning:**
1. **Access control is critical** - COMP-R00 defines a complex 5-level access control system. Getting this wrong early means rework across all routes.
2. **Shell components are shared** - 7 of 8 routes use the same Company Shell. Building it once prevents duplication.
3. **Role permissions are complex** - 5 roles, 7 permissions, status-based access. This needs careful implementation.
4. **Type safety matters** - With 8 routes sharing data structures, defining types first prevents type conflicts.
5. **Parallel work possible** - After R00, Phase 1 routes (R01, R02, R03) can be done in parallel by different developers.
6. **Quality over speed** - 1-2 weeks for solid foundation pays off over 6-8 week project.

**Implementation Sequence:**

**Week 1-2: Foundation**
```
Solo: COMP-R00 (access control, shell, types)
Parallel after R00: COMP-R01 ∥ COMP-R02 ∥ COMP-R03
```

**Week 3-4: Dashboard & Job List**
```
Sequential: COMP-R04 → COMP-R05
(R05 provides job domain foundation)
```

**Week 4-5: Job CRUD**
```
Parallel: COMP-R06 ∥ COMP-R07
(both depend on R05, can work in parallel)
```

**Week 6-8: Application Management**
```
Solo: COMP-R08 (most complex, integrates everything)
```

---

## 7. Special Considerations

### 7.1 COMP-R01 (Pending) Special Case

**What Makes It Special:**
- Only route using **Minimal Shell** (limited header, no sidebar)
- Accessible by **pending OR rejected** companies
- Access check allows `companyId === id OR target_company === id`
- Auto-redirect on approval to dashboard

**When to Implement:**
- Implement **early** (Phase 1) to test Minimal Shell variant
- Helps validate access control framework works for non-approved companies
- Simple enough to implement quickly after R00

**Testing Focus:**
- [ ] Minimal Shell renders correctly (no sidebar, limited header)
- [ ] Pending status shows progress stepper
- [ ] Rejected status shows rejection reason
- [ ] Auto-redirect on approval works
- [ ] Link to R03 (settings) works
- [ ] Cannot access dashboard routes while pending

---

### 7.2 Company vs Candidate Patterns

**How Similar Are Company Routes to Candidate Routes?**

Checked existing candidate routes for reusable patterns:

| Pattern | Candidate | Company | Reusable? |
|---------|-----------|---------|-----------|
| **Shell Layout** | CandidateShell | CompanyShell | ❌ Structure similar, content different |
| **Access Control** | Simple (user owns profile) | Complex (5-level, role-based) | ⚠️ Pattern similar, logic different |
| **Dashboard** | CAND-R01 | COMP-R04 | ⚠️ Layout similar, metrics different |
| **Profile Editing** | CAND-R02 (wizard) | COMP-R03 (tabs) | ❌ Different UX pattern |
| **Settings** | CAND-R03 | COMP-R03 | ✅ Tab pattern reusable |
| **Applications** | CAND-R04 (candidate view) | COMP-R08 (company view) | ⚠️ Same entity, opposite perspective |

**Key Differences:**
- **Access Control**: Candidate routes are simpler (user owns their profile). Company routes have role-based access (admin, HR, recruiter, etc.)
- **Shell Sidebar**: Candidate has 4 items, Company has 6 items
- **Profile Editing**: Candidate uses wizard (step-by-step), Company uses tabs (all sections accessible)
- **Applications**: Candidate views their applications (read-only), Company manages all applications (accept/reject)

**Reusable Patterns:**
1. ✅ **Tab-based Settings** (CAND-R03 → COMP-R03)
2. ✅ **Dashboard Cards** (stat cards layout)
3. ✅ **Modal Patterns** (confirm delete, etc.)
4. ✅ **Status Badges** (color-coded indicators)
5. ⚠️ **Access Control Hooks** (structure reusable, logic different)

---

### 7.3 Job Management Cluster (R05, R06, R07)

**Should They Be Implemented Together?**

**Analysis:**
- COMP-R05 (List), COMP-R06 (Create), COMP-R07 (Detail/Edit) form a **CRUD cluster**
- They all depend on the **same job domain service**
- They share **job status state machine** (draft → published → paused → closed)
- They share **UI components** (status badges, action menus, modals)

**Recommendation:** ⚠️ **Sequential, not together**

**Sequence:**
```
1. R05 (List) - FIRST
   └─ Provides: Job status badges, action patterns, list navigation

2. R06 (Create) + R07 (Detail) - PARALLEL
   └─ Both use: R05 patterns, job domain service, status machine
```

**Why Sequential for R05:**
- R05 establishes job domain service (JobCreate, JobUpdate, etc.)
- R05 defines job status state machine
- R05 creates shared UI components (StatusBadge, ActionMenu)
- R06 needs R05 list page to "return to list" after creating
- R07 needs R05 for navigation context

**Why Parallel for R06 + R07:**
- Both depend on R05 (no dependency on each other)
- Both use same job service
- Different developers can work on each
- R06 focuses on forms/wizard, R07 focuses on view/edit mode

**Effort Estimate:**
- R05: 6-8 days (foundation)
- R06 + R07: 7-9 days each (can parallel → 7-9 days total if 2 developers)

---

### 7.4 Critical Dependencies to Resolve First

Before starting Company routes, ensure these services are ready:

**Job Domain Service (Required for Phase 2-4):**
```typescript
// MUST exist before COMP-R05
✅ JobCreate(companyId, jobData)
✅ JobUpdate(jobId, jobData)
✅ JobPostSet(jobId, status, dates)
✅ JobUnpublish(jobId)
✅ JobDeactivate(jobId)
✅ JobDelete(jobId) - with application check
✅ JobDuplicate(jobId)
✅ JobBulkUnpublish(jobIds)
✅ JobBulkClose(jobIds)
```

**Chat Domain Service (Required for Phase 4):**
```typescript
// MUST exist before COMP-R08
✅ createChatRoom(companyId, candidateId, hrId)
✅ getChatRoom(chatId)
✅ sendMessage(chatId, message)
```

**Candidate Profile Service (Required for Phase 4):**
```typescript
// MUST exist before COMP-R08
✅ getCandidateProfile(candidateId)
✅ getCandidateResume(candidateId)
```

**Notification Service (Required for Phase 4):**
```typescript
// MUST exist before COMP-R08
✅ sendApplicationAcceptedNotification(applicationId)
✅ sendApplicationRejectedNotification(applicationId, feedback)
```

**MeiliSearch Integration (Required for Phase 3-4):**
```typescript
// MUST exist before COMP-R06
✅ indexJobToMeiliSearch(jobId) - on publish
✅ removeJobFromMeiliSearch(jobId) - on close/delete
```

**Analytics Service (Optional for Phase 3):**
```typescript
// Nice to have for COMP-R07
⚠️ getJobViewAnalytics(jobId, dateRange)
⚠️ getJobConversionRate(jobId)
```

---

## 8. Effort Estimation

| Route | Est. Days | Est. Hours | Confidence | Notes |
|-------|-----------|------------|------------|-------|
| **COMP-R00** | 10-14 | 80-112 | High | Foundation work, access control, shell |
| **COMP-R01** | 3-4 | 24-32 | High | Simple state display |
| **COMP-R02** | 5-7 | 40-56 | Medium | Dual-tab, role management |
| **COMP-R03** | 5-7 | 40-56 | Medium | Multi-tab forms, image uploads |
| **COMP-R04** | 4-5 | 32-40 | Medium | Dashboard metrics aggregation |
| **COMP-R05** | 6-8 | 48-64 | Medium | Job list, filters, bulk actions |
| **COMP-R06** | 7-9 | 56-72 | Low | Wizard, auto-save, rich text |
| **COMP-R07** | 7-9 | 56-72 | Low | Dual mode, analytics, status actions |
| **COMP-R08** | 10-12 | 80-96 | Low | Three-panel layout, chat integration |
| **Total** | **57-75** | **456-600** | | |

**Total Estimated Effort:** **6-8 weeks** (assuming 1 full-time developer, 8 hours/day)

**With 2 Developers:**
- Phase 1: 2-3 weeks (R00 solo, then R01 ∥ R02 ∥ R03)
- Phase 2: 2 weeks (R04 → R05)
- Phase 3: 1-2 weeks (R06 ∥ R07)
- Phase 4: 2-3 weeks (R08)
- **Total: 7-10 weeks**

**Confidence Levels:**
- **High**: Well-defined patterns, similar to existing work
- **Medium**: Some complexity, dependencies clear
- **Low**: High complexity, multiple integrations, new patterns

**Risk Factors:**
- ⚠️ Job domain service may need significant work (not estimated here)
- ⚠️ Chat integration complexity unknown
- ⚠️ MeiliSearch integration may have surprises
- ⚠️ Rich text editor (Tiptap) learning curve
- ⚠️ Mobile UI for R05, R06, R07, R08 adds effort

---

## 9. Questions for Strategic Decision

### 9.1 Clarifications Needed

1. **COMP-R04 (Dashboard) Detailed RIS**
   - ❓ Is there a detailed RIS for COMP-R04, or should we extract from COMP-R00?
   - ❓ What specific metrics should the dashboard show?
   - ❓ Should we implement R04 early or defer until job/app routes are ready?

2. **Job Domain Service Readiness**
   - ❓ Do job domain services already exist in `src/domains/job/services/`?
   - ❓ If not, who will implement them? (Company routes or separate task?)
   - ❓ Should we implement job services as part of COMP-R05 or before?

3. **Chat Integration**
   - ❓ Is chat domain service ready for COMP-R08?
   - ❓ Should chat open in drawer (as specified) or full page?
   - ❓ Who owns chat service implementation?

4. **MeiliSearch Integration**
   - ❓ Is MeiliSearch job indexing ready?
   - ❓ Should COMP-R06 (create job) handle indexing or delegate to service?

5. **Notification System**
   - ❓ Is notification service (email/push) ready for COMP-R08?
   - ❓ What email templates are needed for accept/reject flows?

6. **Team Allocation**
   - ❓ How many developers will work on Company routes?
   - ❓ Should we parallelize Phase 1 routes (R01, R02, R03)?
   - ❓ Should we parallelize Phase 3 routes (R06, R07)?

### 9.2 Implementation Approach Questions

1. **Should we implement COMP-R00 as a separate package/module?**
   - Could be `src/lib/company-shell/` or `src/components/company/shell/`

2. **Should access control hooks be reusable for other domains?**
   - Abstract pattern for `useAccess(domain, permissions)`?

3. **Should job status state machine be extracted to a separate utility?**
   - Reusable across R05, R06, R07

4. **Should we create a dedicated job service layer?**
   - `src/services/jobsmarket/job/` with all job operations

### 9.3 Testing Strategy Questions

1. **Should E2E tests for job flows span multiple routes?**
   - Example: Create job (R06) → View in list (R05) → Edit (R07) → Accept application (R08)

2. **Should we test role permissions exhaustively?**
   - 5 roles × 7 permissions × 8 routes = 280 test cases (can we prioritize?)

3. **Should integration tests use real dev database or Firebase emulator?**
   - RIS requires real dev database, but setup may be complex

---

## 10. Attachments

### 10.1 Route Feature Matrix

| Feature | R00 | R01 | R02 | R03 | R04 | R05 | R06 | R07 | R08 |
|---------|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| **Auth & Access** |
| Company auth | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Role-based access | ✓ | | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Permission check | ✓ | | ✓ | ✓ | | ✓ | ✓ | ✓ | ✓ |
| Status check | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Shell Components** |
| Minimal Shell | ✓ | ✓ | | | | | | | |
| Company Shell | ✓ | | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Sidebar nav | ✓ | | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Chat FAB | ✓ | | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Notification bell | ✓ | | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Job Management** |
| Job CRUD | | | | | | ✓ | ✓ | ✓ | |
| Job status machine | | | | | | ✓ | ✓ | ✓ | |
| Job list/filter | | | | | | ✓ | | | |
| Job wizard | | | | | | | ✓ | | |
| Job analytics | | | | | | | | ✓ | |
| **Team Management** |
| Team list | | | ✓ | | | | | | |
| Accept/reject employee | | | ✓ | | | | | | |
| Role toggle | | | ✓ | | | | | | |
| Remove member | | | ✓ | | | | | | |
| **Application Management** |
| Application list | | | | | | | | | ✓ |
| Accept/reject app | | | | | | | | | ✓ |
| Chat integration | | | | | | | | | ✓ |
| Candidate profile view | | | | | | | | | ✓ |
| Match score | | | | | | | | | ✓ |
| **Settings & Config** |
| Company profile edit | | | | ✓ | | | | | |
| Image uploads | | | | ✓ | | | | | |
| Address CRUD | | | | ✓ | | | | | |
| Job defaults config | | | | ✓ | | | | | |
| Notification prefs | | | | ✓ | | | | | |
| Analytics view | | | | ✓ | | | | | |
| **Dashboard & Metrics** |
| Dashboard cards | | | | | ✓ | | | | |
| Quick actions | | | | | ✓ | | | | |
| Recent activities | | | | | ✓ | | | | |

### 10.2 Server Action Inventory

| Action | Used By | Priority | Exists? |
|--------|---------|----------|---------|
| `updateCompanyProfile()` | R03 | P1 | ⚠️ Check |
| `uploadCompanyMedia()` | R03 | P1 | ❌ No |
| `toggleEmployeeRole()` | R02 | P1 | ❌ No |
| `acceptNewEmployee()` | R02 | P1 | ❌ No |
| `rejectNewEmployee()` | R02 | P1 | ❌ No |
| `removeEmployee()` | R02 | P1 | ❌ No |
| `resubmitCompanyApplication()` | R01 | P1 | ⚠️ Check |
| `JobCreate()` | R06 | P2 | ❌ No |
| `JobUpdate()` | R06, R07 | P2 | ❌ No |
| `JobPostSet()` | R05, R06, R07 | P2 | ❌ No |
| `JobUnpublish()` | R05, R07 | P2 | ❌ No |
| `JobDeactivate()` | R05, R07 | P2 | ❌ No |
| `JobDelete()` | R05, R07 | P2 | ❌ No |
| `JobDuplicate()` | R05, R07 | P2 | ❌ No |
| `JobBulkUnpublish()` | R05 | P2 | ❌ No |
| `JobBulkClose()` | R05 | P2 | ❌ No |
| `AcceptApplication()` | R08 | P4 | ❌ No |
| `rejectApplication()` | R08 | P4 | ❌ No |
| `readApplication()` | R08 | P4 | ❌ No |
| `addApplicationNote()` | R08 | P4 | ❌ No |
| `getCompanyDashboardMetrics()` | R04 | P2 | ❌ No |

**Summary:**
- ✅ Exists: 4 (company profile, company requests)
- ⚠️ Check: 2 (may exist but need to verify)
- ❌ Need to Create: 18

### 10.3 Component Hierarchy (COMP-R00)

```
src/
├── components/
│   └── jobsmarket/
│       └── company/
│           ├── shell/
│           │   ├── CompanyShellLayout.tsx
│           │   ├── MinimalShellLayout.tsx
│           │   ├── CompanySidebar.tsx
│           │   ├── CompanyHeader.tsx
│           │   └── ChatFAB.tsx
│           │
│           ├── access/
│           │   ├── AccessGuard.tsx
│           │   ├── PermissionGate.tsx
│           │   └── StatusGuard.tsx
│           │
│           └── shared/
│               ├── StatusBadge.tsx
│               ├── RoleBadge.tsx
│               └── ConfirmModal.tsx
│
├── hooks/
│   └── jobsmarket/
│       └── company/
│           ├── useCompanyAccess.ts
│           ├── usePermission.ts
│           ├── useCompanyStatus.ts
│           └── useRoleCheck.ts
│
├── lib/
│   └── company/
│       ├── access-control.ts (utility functions)
│       ├── permissions.ts (permission matrix)
│       └── swr-keys.ts (key factory)
│
└── types/
    └── jobsmarket/
        └── company/
            ├── company.ts (companyDataProps)
            ├── staff.ts (staffDataProps)
            └── permissions.ts (Role, Permission enums)
```

### 10.4 Thai Localization Requirements

All routes require Thai UI text. Key categories:

**Navigation Items (R00):**
- แดชบอร์ด (Dashboard)
- ประกาศงาน (Jobs)
- ใบสมัคร (Applications)
- ค้นหาผู้สมัคร (Candidates)
- ทีม (Team)
- การตั้งค่า (Settings)

**Action Buttons:**
- บันทึก (Save)
- ยกเลิก (Cancel)
- ลบ (Delete)
- แก้ไข (Edit)
- ปิดรับสมัคร (Close)
- เผยแพร่ (Publish)
- หยุดชั่วคราว (Pause)
- ลบ (Delete)
- คัดลอก (Duplicate)

**Status Labels:**
- ฉบับร่าง (Draft)
- กำลังรับสมัคร (Published/Active)
- หยุดชั่วคราว (Paused/Unpublished)
- ปิดรับสมัคร (Closed)
- รออนุมัติ (Pending)
- ถูกปฏิเสธ (Rejected)
- ได้รับการอนุมัติ (Approved)

**Application Status:**
- รอดูใบสมัคร (Applied)
- อ่านแล้ว (Read)
- ตอบรับ (Accepted)
- นัดสัมภาษณ์แล้ว (Scheduled)
- ปฏิเสธ (Rejected)

**Empty States:**
- ยังไม่มีประกาศงาน (No jobs yet)
- ยังไม่มีผู้สมัคร (No applications yet)
- ยังไม่มีทีมงาน (No team members yet)

---

## 11. Final Recommendations

### 11.1 Implementation Strategy

**⭐ Recommended Approach: Option A (Foundation-First)**

**Phase-by-Phase Plan:**

**Phase 1: Foundation (Weeks 1-2) - CRITICAL PATH**
```
Week 1-2: COMP-R00 (Solo)
├─ Access control hooks
├─ Shell components (Minimal + Company)
├─ Type definitions
├─ Permission matrix
└─ SWR key factory

Then Parallel:
├─ COMP-R01 (Developer A) - 3-4 days
├─ COMP-R02 (Developer B) - 5-7 days
└─ COMP-R03 (Developer A after R01) - 5-7 days
```

**Phase 2: Dashboard & Job List (Weeks 3-4)**
```
Week 3: COMP-R04 (Dashboard)
├─ Implement job domain services first (if not exist)
├─ Dashboard metrics aggregation
└─ Navigation hub

Week 4: COMP-R05 (Job List)
├─ Job list with filters
├─ Status tabs
├─ Bulk actions
└─ Job domain service integration
```

**Phase 3: Job CRUD (Weeks 4-5)**
```
Parallel:
├─ COMP-R06 (Developer A) - 7-9 days
│   ├─ 4-step wizard
│   ├─ Auto-save
│   └─ Rich text editor
│
└─ COMP-R07 (Developer B) - 7-9 days
    ├─ View/edit dual mode
    ├─ Analytics
    └─ Status actions
```

**Phase 4: Application Management (Weeks 6-8)**
```
Week 6-8: COMP-R08 (Both developers)
├─ Three-panel layout (Developer A)
├─ Chat integration (Developer B)
├─ Accept/reject flows (Developer A)
├─ Candidate profile view (Developer B)
└─ Mobile UI (Both)
```

### 11.2 Success Criteria

**Phase 1 Complete When:**
- [ ] All routes (R01-R08) can use COMP-R00 access control
- [ ] Company Shell renders with sidebar, header, FAB
- [ ] Minimal Shell renders for pending companies
- [ ] Role permissions matrix enforced
- [ ] R01, R02, R03 fully functional with tests passing

**Phase 2 Complete When:**
- [ ] Dashboard shows real metrics
- [ ] Job list displays with filters and bulk actions
- [ ] Job status tabs work correctly
- [ ] Job domain services fully tested

**Phase 3 Complete When:**
- [ ] Can create job via 4-step wizard
- [ ] Auto-save works in wizard
- [ ] Can edit job in R07 view/edit mode
- [ ] Job status actions work correctly

**Phase 4 Complete When:**
- [ ] Can accept/reject applications
- [ ] Chat opens on accept
- [ ] Candidate profile displays correctly
- [ ] Mobile UI works (swipe actions)

### 11.3 Risk Mitigation

| Risk | Mitigation |
|------|------------|
| **Job domain service not ready** | Implement in parallel with COMP-R05, allocate 1 week |
| **Chat integration complex** | Prototype chat drawer early, test with mock data |
| **MeiliSearch issues** | Implement job indexing separately, decouple from CRUD |
| **Rich text editor learning curve** | Start Tiptap research early, have fallback (plain textarea) |
| **Mobile UI for complex layouts (R08)** | Design mobile-first, use responsive utilities |
| **Access control bugs** | Write comprehensive unit tests for useCompanyAccess hook |
| **Role permission confusion** | Create visual permission matrix documentation |

### 11.4 Decision Points

**Must Decide Before Starting:**
1. ✅ **Implement COMP-R00 first** (yes, Foundation-First approach)
2. ⚠️ **Job domain service ownership** (who implements JobCreate, JobUpdate, etc.?)
3. ⚠️ **Chat service readiness** (available for Phase 4?)
4. ⚠️ **Team allocation** (1 or 2 developers?)
5. ⚠️ **COMP-R04 detailed spec** (use inferred specs or request detailed RIS?)

**Can Decide During Implementation:**
- Exact UI component library choices (shadcn/ui already decided)
- Mobile UI details (can iterate)
- Analytics dashboard specifics (can defer)
- Notification email templates (can use basic templates first)

---

## 12. Conclusion

The Company domain is **comprehensive, well-structured, and ready for implementation**. The 8 RIS documents provide detailed specifications covering the full job management workflow from company setup to application acceptance.

**Key Takeaways:**

1. **COMP-R00 MUST be implemented first** - it provides the foundation (access control, shell, types) for all other routes.

2. **Implementation order is clear**: Foundation (R00-R03) → Dashboard (R04-R05) → Job CRUD (R06-R07) → Applications (R08).

3. **Total effort: 6-8 weeks** with 1 developer, **7-10 weeks** with 2 developers (parallelization helps but limited).

4. **Complexity is very high** - complex access control, multi-domain integration, real-time features, mobile UI.

5. **Critical dependencies**: Job domain service, Chat service, Notification service, MeiliSearch integration must be ready.

6. **Parallel work opportunities**: R01 ∥ R02 ∥ R03 in Phase 1, R06 ∥ R07 in Phase 3.

**Next Steps:**

1. ✅ **Approve this strategic assessment**
2. ⚠️ **Clarify job domain service ownership**
3. ⚠️ **Verify chat/notification service readiness**
4. ⚠️ **Allocate team resources** (1 or 2 developers)
5. ✅ **Begin COMP-R00 implementation** (1-2 weeks)

---

**Document Complete** | Strategic Assessment Ready for Review
