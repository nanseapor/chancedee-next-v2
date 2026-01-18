# RIS: /companies/[id]/dashboard

**Route ID:** COMP-R04  
**Version:** 1.0  
**Status:** Draft  
**Created:** 2025-12-10  
**Last Updated:** 2025-12-10

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-10 | Initial RIS creation for company dashboard |

---

## 1. Route Metadata

| Property | Value |
|----------|-------|
| Route Path | `/companies/[id]/dashboard` |
| Route ID | COMP-R04 |
| Shell | Company Shell |
| Purpose | Company hub with metrics, quick stats, and quick access to key features |
| Complexity | Medium |
| Phase | 3 (Job Management) |
| UI Spec | `05-company-routes.md` Section 6.2 |

### Route Parameters

| Parameter | Type | Source | Validation |
|-----------|------|--------|------------|
| `id` | `string` | URL path segment | Must be valid company ID |

---

## 2. Domain Classification

### Primary Domain: Company

- **Owns:** Dashboard metrics, quick stats, welcome header
- **Aggregates:** Jobs count, applications count, interviews count

### Secondary Domains

| Domain | Role | Access |
|--------|------|--------|
| Jobs | Quick stats: active jobs count, performance metrics | Read: job counts and metrics |
| Applications | Recent applications display, pending actions count | Read: application list and counts |
| Chat | Upcoming interviews display | Read: interview schedule |

### Global Domains (Shell-Injected)

| Domain | Requirement |
|--------|-------------|
| Auth | User must be authenticated, must be company member of `[id]` |
| Chat | FAB available for messaging |
| Notifications | Bell icon with unread count |

---

## 3. Feature Mapping

### Existing Features (Preserve - P0)

| Feature ID | Feature Name | Coverage | Notes |
|------------|--------------|----------|-------|
| COMP-010 | View Company Dashboard | Full | Main dashboard view with metrics |
| JOB-009 | View Job by Company | Partial | Quick stats for active jobs count |

### New Features (This Route Introduces)

| Feature | Description | Priority |
|---------|-------------|----------|
| Quick Stats Grid | 4-card grid with key metrics | P0 |
| Upcoming Interviews | Week view of scheduled interviews | P0 |
| Recent Applications Table | Last 5 applications with quick actions | P0 |
| Job Performance Summary | Views vs apps chart for top jobs | P1 |

### Not Implemented in v1.0

| Feature | Description | Status |
|---------|-------------|--------|
| Real-time Metrics | Live updating stats | ☐ Future Work |
| Advanced Analytics | Detailed conversion funnels | ☐ Future Work |

---

## 4. Data Contract

### 4.1 Read Operations

| Data | Collection | Fields | Condition | SWR Key |
|------|------------|--------|-----------|---------|
| Company Data | `company_information` | `uid`, `company_name`, `profile_photo`, `status` | `uid === params.id` | `company-${id}` |
| User Data | `user_accounts` | `uid`, `roles`, `companyId`, `display_name` | Current user | `user-data-${uid}` |
| Active Jobs Count | `web_jobs` | Aggregation | `company_id === params.id AND jobStatus IN ['published', 'ontimer'] AND is_active = true` | `company-jobs-${id}` |
| Recent Applications | `web_job_applications` | `uid`, `status`, `job_id`, `candidate_id`, `created_at` | `company_id === params.id` ORDER BY `created_at` DESC LIMIT 5 | `company-applications-${id}` |
| Upcoming Interviews | `web_job_interviews` | `uid`, `appointment`, `status`, `candidate_id`, `job_id` | `company_id === params.id AND status IN ['scheduled', 'confirmed'] AND appointment >= now` | `company-interviews-${id}` |
| Dashboard Stats | Aggregated | Active jobs, new apps (7d), pending actions, interviews this week | `company_id === params.id` | `company-dashboard-${id}` |

### 4.2 Write Operations

| Action | Server Action | Collection | Fields Modified | Guard |
|--------|---------------|------------|-----------------|-------|
| Accept Application | `acceptApplication` | `web_job_applications` | `status`, `chatId` | Role: `admin`, `hr`, `recruiter` |
| Reject Application | `rejectApplication` | `web_job_applications` | `status`, `reject_feedback` | Role: `admin`, `hr`, `recruiter` |

### 4.3 Data Fetching Strategy

```typescript
// Dashboard stats aggregation
const { data: dashboardStats, isLoading: statsLoading } = useSWR(
  companyId ? `company-dashboard-${companyId}` : null,
  () => fetchDashboardStats(companyId),
  defaultSWRConfig
);

// Recent applications
const { data: recentApps, isLoading: appsLoading } = useSWR(
  companyId ? companyKeys.applications(companyId) : null,
  () => fetchRecentApplications(companyId, { limit: 5 }),
  defaultSWRConfig
);

// Upcoming interviews
const { data: interviews, isLoading: interviewsLoading } = useSWR(
  companyId ? `company-interviews-${companyId}` : null,
  () => fetchUpcomingInterviews(companyId),
  defaultSWRConfig
);
```

---

## 5. State Contract

### 5.1 Atoms

| Atom | Type | R/W | Purpose |
|------|------|-----|---------|
| `userAtom` | `userDataProps \| null` | R | Get user roles, companyId, display name |
| `firebaseUserAtom` | `User \| null` | R | Verify authenticated |
| `sessionStateAtom` | `SessionState` | R | Verify session valid |
| `activeRoleAtom` | `string` | R/W | Navigation context ('company') |
| `companyAtom` | `companyDataProps \| null` | R/W | Current company data cache |

### 5.2 Hooks

| Hook | Returns | Purpose |
|------|---------|---------|
| `useFirebaseAuth` | `{ user, loading, signOutFirebase }` | Auth state |
| `useCompanyInfo` | `{ company, isLoading, error }` | Company data by ID |
| `useCompanyDashboard` | `{ stats, recentApps, interviews, isLoading }` | Dashboard aggregated data |
| `useRouter` | Next.js router | Navigation |
| `useParams` | `{ id: string }` | Route params |

### 5.3 SWR Keys

| Key Pattern | Purpose | Config |
|-------------|---------|--------|
| `company-${id}` | Company profile data | `defaultSWRConfig` |
| `company-dashboard-${id}` | Dashboard stats | `defaultSWRConfig` |
| `company-jobs-${id}` | Company jobs list | `defaultSWRConfig` |
| `company-applications-${id}` | Applications list | `defaultSWRConfig` |
| `company-interviews-${id}` | Interviews list | `defaultSWRConfig` |

### 5.4 Local Component State

| State | Type | Initial | Purpose |
|-------|------|---------|---------|
| `pageState` | `PageState` | `'loading'` | Page state machine |
| `selectedTab` | `'overview' \| 'performance'` | `'overview'` | Dashboard section toggle |

---

## 6. UI State Machine

### 6.1 Page State Automaton

```
                    ┌─────────────────────────────┐
                    │        LOADING              │
                    │    (initial load)           │
                    └─────────────┬───────────────┘
                                  │
           ┌──────────────────────┼──────────────────────┐
           │                      │                      │
           ▼                      ▼                      ▼
┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
│    AUTH_CHECK       │ │   DATA_LOADED       │ │    LOAD_ERROR       │
│ (verify user auth)  │ │(data fetched)       │ │  (fetch failed)     │
└──────────┬──────────┘ └──────────┬──────────┘ └──────────┬──────────┘
           │                       │                       │
           ▼                       ▼                       ▼
    [ACCESS_CHECK]          [DASHBOARD_READY]        [error_view]
           │                       │
    ┌──────┼──────┐               │
    │      │      │               │
    ▼      ▼      ▼               ▼
[redirect][idle][redirect]   [dashboard_view]
 (login)       (403/pending)
```

#### Page State Transition Table

| Current State | Event | Next State | Guard Condition | Side Effects |
|---------------|-------|------------|-----------------|--------------|
| `loading` | `AUTH_LOADED` | `auth_check` | - | - |
| `loading` | `AUTH_ERROR` | `redirect_login` | - | `router.push('/auth/login')` |
| `auth_check` | `NOT_AUTHENTICATED` | `redirect_login` | `!firebaseUser` | `router.push('/auth/login')` |
| `auth_check` | `AUTHENTICATED` | `access_check` | `firebaseUser` exists | Fetch user data |
| `access_check` | `NOT_MEMBER` | `redirect_403` | `user.companyId !== params.id` | Show 403 or redirect |
| `access_check` | `COMPANY_PENDING` | `redirect_pending` | `company.status === 'pending'` | `router.push('/companies/${id}/pending')` |
| `access_check` | `COMPANY_REJECTED` | `redirect_pending` | `company.status === 'rejected'` | `router.push('/companies/${id}/pending')` |
| `access_check` | `ACCESS_GRANTED` | `loading_data` | Valid member, approved company | Begin data fetch |
| `loading_data` | `DATA_SUCCESS` | `dashboard_ready` | All data loaded | Render dashboard |
| `loading_data` | `DATA_ERROR` | `error` | Fetch failed | Show error with retry |
| `dashboard_ready` | `REFRESH` | `loading_data` | Manual refresh | Refetch all data |
| `error` | `RETRY` | `loading_data` | User clicks retry | Refetch all data |

### 6.2 Quick Action State Machine (Application Accept/Reject)

| Current State | Event | Next State | Guard Condition | Side Effects |
|---------------|-------|------------|-----------------|--------------|
| `idle` | `ACCEPT_CLICK` | `confirming_accept` | Application visible | Show confirm dialog |
| `confirming_accept` | `CONFIRM` | `processing` | User confirms | Call `acceptApplication` |
| `confirming_accept` | `CANCEL` | `idle` | User cancels | Close dialog |
| `processing` | `SUCCESS` | `accepted` | Server success | Invalidate apps, open chat drawer |
| `processing` | `ERROR` | `error` | Server error | Show toast, stay on dialog |
| `idle` | `REJECT_CLICK` | `confirming_reject` | Application visible | Show reject dialog |
| `confirming_reject` | `CONFIRM` | `processing` | User provides feedback | Call `rejectApplication` |
| `confirming_reject` | `CANCEL` | `idle` | User cancels | Close dialog |

---

## 7. Component-Action Wiring

### 7.1 Welcome Header

| Component | Data Source | Action | Target |
|-----------|-------------|--------|--------|
| Company Logo | `company.profile_photo` | Click | → Settings |
| Company Name | `company.company_name` | - | - |
| User Greeting | `user.display_name` | - | - |
| Role Badge | `user.roles` | - | Color-coded by role |

### 7.2 Quick Stats Grid

| Stat Card | Data Source | Click Action | Notes |
|-----------|-------------|--------------|-------|
| Active Jobs | `dashboardStats.activeJobsCount` | → `/companies/[id]/dashboard/jobs` | Show count + trend |
| New Applications (7d) | `dashboardStats.newAppsCount` | → `/companies/[id]/dashboard/applications` | Badge if unread |
| Pending Actions | `dashboardStats.pendingActionsCount` | → `/companies/[id]/dashboard/applications?filter=pending` | Requires action |
| Interviews This Week | `dashboardStats.interviewsCount` | → `/chat` | Scheduled interviews |

### 7.3 Upcoming Appointments Section

| Component | Data Source | Action | Notes |
|-----------|-------------|--------|-------|
| Section Title | Static: "การนัดหมายที่กำลังจะถึง" | - | - |
| View All Link | - | → `/chat` | - |
| Calendar View | `interviews` | - | Week view |
| Appointment Item | Individual interview | Click → `/chat/[roomId]` | Show time, candidate, position |

### 7.4 Recent Applications Table

| Column | Data Source | Action | Notes |
|--------|-------------|--------|-------|
| Candidate Photo | `application.candidate.profile_photo` | - | Avatar |
| Candidate Name | `application.candidate.display_name` | - | - |
| Position | `application.job.title` | - | - |
| Applied Date | `application.created_at` | - | Relative time |
| Match Score | Computed | - | Color-coded badge |
| Accept Button | - | `acceptApplication(appId)` | Opens chat drawer |
| Reject Button | - | `rejectApplication(appId)` | Opens feedback dialog |

### 7.5 Job Performance Section (Optional)

| Component | Data Source | Action | Notes |
|-----------|-------------|--------|-------|
| Section Title | Static: "ประสิทธิภาพประกาศงาน" | - | - |
| Mini Chart | `dashboardStats.jobPerformance` | - | Views vs Apps |
| Top Jobs List | `dashboardStats.topJobs` | Click → `/companies/[id]/dashboard/jobs/[jobId]` | Best performing |

---

## 8. Error Handling

### 8.1 Error States

| Error Type | Display | Recovery |
|------------|---------|----------|
| `AUTH_ERROR` | Redirect to login | Auto-redirect |
| `ACCESS_DENIED` | 403 page or redirect | Link to home |
| `COMPANY_PENDING` | Redirect to pending page | Auto-redirect |
| `DATA_FETCH_ERROR` | Error card with retry | Retry button |
| `NETWORK_ERROR` | Offline banner | Auto-retry on reconnect |
| `ACCEPT_ERROR` | Toast: "เกิดข้อผิดพลาด กรุณาลองใหม่" | Retry in dialog |
| `REJECT_ERROR` | Toast with error message | Retry in dialog |

### 8.2 Error Recovery

```typescript
const handleRetry = async () => {
  setPageState('loading_data');
  await Promise.all([
    mutate(`company-dashboard-${companyId}`),
    mutate(companyKeys.applications(companyId)),
    mutate(`company-interviews-${companyId}`),
  ]);
};
```

---

## 9. Implementation Checklist

### 9.1 Access Control
- [ ] Verify user authenticated via `firebaseUserAtom`
- [ ] Check company membership: `user.companyId === params.id`
- [ ] Check company status: redirect if `pending` or `rejected`
- [ ] Apply role-based visibility for actions

### 9.2 Data Fetching
- [ ] Implement `fetchDashboardStats` server action
- [ ] Implement `fetchRecentApplications` with limit
- [ ] Implement `fetchUpcomingInterviews` with date filter
- [ ] Set up SWR caching with appropriate configs

### 9.3 UI Components
- [ ] Create WelcomeHeader component
- [ ] Create QuickStatsGrid with 4 stat cards
- [ ] Create UpcomingAppointments section (hide if empty)
- [ ] Create RecentApplicationsTable with quick actions
- [ ] Create JobPerformance section (optional, hide if no data)

### 9.4 Actions
- [ ] Wire Accept button to `acceptApplication` → chat drawer
- [ ] Wire Reject button to feedback dialog → `rejectApplication`
- [ ] Invalidate caches on successful actions

### 9.5 Empty States
- [ ] No jobs: CTA to create first job
- [ ] No applications: Message with share link suggestion
- [ ] No interviews: Hide section entirely

### 9.6 Testing
- [ ] Test: Dashboard loads with all sections
- [ ] Test: Stat cards link to correct routes
- [ ] Test: Accept application opens chat drawer
- [ ] Test: Reject application shows feedback dialog
- [ ] Test: Empty states display correctly
- [ ] Test: Pending company redirects to pending page
- [ ] Test: Non-member gets 403
- [ ] Test: Mobile responsive layout

---

## 10. Decisions Log

| Decision | Chosen | Rationale | Date |
|----------|--------|-----------|------|
| Hide interviews section if empty | Yes | Cleaner UX, no placeholder needed | 2025-12-10 |
| Accept → Chat Drawer (not navigate) | Per PROJECT_INSTRUCTIONS | Better UX, stay in context | 2025-12-10 |
| 7-day window for "new" applications | Matches spec | Standard reporting window | 2025-12-10 |
| Job performance section optional | Yes | May not have data for new companies | 2025-12-10 |
| Redirect pending/rejected to COMP-R01 | Yes | Single status page for non-approved | 2025-12-10 |

---

## 11. Related Routes

| Route | Relationship |
|-------|--------------|
| `/companies/[id]/pending` | Redirect if not approved (COMP-R01) |
| `/companies/[id]/dashboard/jobs` | Stat card destination (COMP-R05) |
| `/companies/[id]/dashboard/jobs/new` | Empty state CTA (COMP-R06) |
| `/companies/[id]/dashboard/applications` | Stat card + view all destination (COMP-R08) |
| `/chat` | Interviews destination, accept action opens drawer |
| `/companies/[id]/dashboard/settings` | Logo click destination (COMP-R03) |

---

## 12. Cross-References

This document references shared specifications from **COMP-R00_cross-cutting_RIS.md**.

| Topic | COMP-R00 Section |
|-------|------------------|
| Shell selection | Section 2 |
| Access control | Section 3 |
| Role permissions | Section 4 |
| Company status lifecycle | Section 5 |
| Shared atoms | Section 7 |
| SWR key patterns | Section 8 |
| Error handling | Section 9 |
| Thai copy | Section 10 |

---

## Appendix A: TypeScript Types

```typescript
// Page states
type PageState = 
  | 'loading'
  | 'auth_check'
  | 'access_check'
  | 'loading_data'
  | 'dashboard_ready'
  | 'error'
  | 'redirect_login'
  | 'redirect_pending'
  | 'redirect_403';

// Dashboard stats shape
interface DashboardStats {
  activeJobsCount: number;
  newAppsCount: number;         // Last 7 days
  pendingActionsCount: number;  // Unread + awaiting action
  interviewsCount: number;      // This week
  jobPerformance?: {
    labels: string[];
    views: number[];
    applications: number[];
  };
  topJobs?: Array<{
    jobId: string;
    title: string;
    views: number;
    applications: number;
    conversionRate: number;
  }>;
}

// Recent application
interface RecentApplication {
  uid: string;
  status: ApplicationStatus;
  createdAt: number;
  job: {
    uid: string;
    title: string;
  };
  candidate: {
    uid: string;
    displayName: string;
    profilePhoto?: string;
  };
  matchScore?: number;
}

// Upcoming interview
interface UpcomingInterview {
  uid: string;
  appointment: number;
  status: 'scheduled' | 'confirmed';
  chatRoomId: string;
  job: {
    uid: string;
    title: string;
  };
  candidate: {
    uid: string;
    displayName: string;
    profilePhoto?: string;
  };
}
```

---

## Appendix B: Component File Structure

```
src/
├── app/
│   └── jobsmarket/
│       └── companies/
│           └── [id]/
│               └── dashboard/
│                   └── page.tsx              # Main page component
├── components/
│   └── jobsmarket/
│       └── companies/
│           └── dashboard/
│               ├── CompanyDashboardPage.tsx  # Page orchestrator
│               ├── WelcomeHeader.tsx         # Logo, name, greeting
│               ├── QuickStatsGrid.tsx        # 4-card grid
│               ├── StatCard.tsx              # Individual stat card
│               ├── UpcomingAppointments.tsx  # Interview calendar
│               ├── AppointmentItem.tsx       # Single appointment
│               ├── RecentApplications.tsx    # Applications table
│               ├── ApplicationRow.tsx        # Single application row
│               ├── QuickActionButtons.tsx    # Accept/Reject buttons
│               ├── AcceptDialog.tsx          # Confirm accept modal
│               ├── RejectDialog.tsx          # Reject feedback modal
│               └── JobPerformance.tsx        # Optional metrics
├── hooks/
│   └── jobsmarket/
│       └── companies/
│           └── use-company-dashboard.ts      # Dashboard data hook
└── domains/
    └── companies/
        └── services/
            └── server/
                └── actions/
                    └── jobsmarket/
                        └── dashboard-stats.ts # Dashboard aggregation
```

---

## Appendix C: Thai Copy Reference

| Key | Thai Text | English Equivalent |
|-----|-----------|-------------------|
| `page_title` | แดชบอร์ด | Dashboard |
| `welcome_greeting` | สวัสดี, [Name] | Hello, [Name] |
| `stat_active_jobs` | ประกาศงาน | Job Postings |
| `stat_new_apps` | ใบสมัครใหม่ (7 วัน) | New Applications (7 days) |
| `stat_pending` | รอดำเนินการ | Pending Actions |
| `stat_interviews` | สัมภาษณ์สัปดาห์นี้ | Interviews This Week |
| `upcoming_title` | การนัดหมายที่กำลังจะถึง | Upcoming Appointments |
| `view_all` | ดูทั้งหมด | View All |
| `recent_apps_title` | ใบสมัครล่าสุด | Recent Applications |
| `col_candidate` | ผู้สมัคร | Candidate |
| `col_position` | ตำแหน่ง | Position |
| `col_date` | วันที่ | Date |
| `col_match` | คะแนน | Match Score |
| `btn_accept` | รับ | Accept |
| `btn_reject` | ไม่รับ | Reject |
| `performance_title` | ประสิทธิภาพประกาศงาน | Job Performance |
| `empty_no_jobs` | ยังไม่มีประกาศงาน | No Job Postings Yet |
| `empty_create_job` | ลงประกาศงานแรก | Create First Job |
| `empty_no_apps` | ยังไม่มีใบสมัคร | No Applications Yet |
| `empty_share_hint` | แชร์ลิงก์ประกาศงาน | Share Your Job Links |
| `error_load` | เกิดข้อผิดพลาดในการโหลดข้อมูล | Error Loading Data |
| `btn_retry` | ลองใหม่ | Try Again |

---

*End of RIS: /companies/[id]/dashboard (COMP-R04) v1.0*
