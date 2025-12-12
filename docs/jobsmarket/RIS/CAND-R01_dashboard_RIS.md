# CAND-R01: Candidate Dashboard Route Implementation Spec

**Version:** 1.0  
**Last Updated:** 2025-12-09  
**Route:** `/candidates/[id]`  
**Primary Domain:** Candidate

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-09 | Initial RIS creation with complete state transition tables, profile completion calculation |

---

## 1. Route Metadata

| Property | Value |
|----------|-------|
| Route ID | CAND-R01 |
| Route Path | `/candidates/[id]` |
| Shell | Candidate Shell |
| Purpose | Candidate home, activity overview and quick actions |
| Complexity | Medium |
| Phase | 1c (Candidate Setup) |
| UI Spec | `04-candidate-routes.md` Section 5.1 |

### Route Parameters

| Parameter | Type | Source | Validation |
|-----------|------|--------|------------|
| `id` | `string` | URL path segment | Must be valid candidate UID |

---

## 2. Domain Classification

### Primary Domain: Candidate (●)

- **Owns:** Dashboard display, profile completion status, user identity
- **Mutations:** None (read-only page)

### Secondary Domains (○)

| Domain | Role | Access |
|--------|------|--------|
| Jobs | Recommended jobs display, application counts | Read `web_jobs`, `web_job_applications` |
| Wallet | Coin balance display | Read `web_pockets.balance` |
| Company | Company info in applications | Read company names via denormalized fields |

### Global Domains (⊙) - Via Shell

| Domain | Requirement |
|--------|-------------|
| Auth | User must be authenticated with candidate role |
| Chat | FAB in shell, quick message access |
| Notifications | Bell icon in shell |

---

## 3. Feature Mapping

### Existing Features (Preserve - P0)

| Feature ID | Feature Name | Coverage | Notes |
|------------|--------------|----------|-------|
| CAND-002 | View Candidate Dashboard | Full | Primary feature this route implements |
| CAND-001 | Auto-Create Candidate Account | Indirect | Dashboard assumes account exists (redirects if not onboarded) |
| CAND-017 | Update Profile Completion Status | Display | Shows completion percentage, links to profile |

### New Features (Enhancements)

| Feature | Description | Priority |
|---------|-------------|----------|
| Profile Completion Card | Visual progress ring with percentage | P0 |
| Upcoming Appointments Section | Interview schedule preview | P0 |
| Application Summary Stats | 4-card status overview | P0 |
| Recommended Jobs | Personalized job suggestions | P0 |
| Earn More Modal | Ways to earn coins | P1 |
| Checklist Modal | Profile completion details | P1 |

### Not Implemented in v1.0

| Feature | Description | Status |
|---------|-------------|--------|
| Real-time Recommendation Refresh | Polling for new job matches | ☐ Future Work |
| Push Notifications for New Matches | Alert when new jobs match profile | ☐ Future Work |

---

## 4. Data Contract

### 4.1 Read Operations

| Data | Collection | Fields | Condition | SWR Key |
|------|------------|--------|-----------|---------|
| Candidate Profile | `candidate_information` | `uid`, `first_name_th`, `last_name_th`, `is_onboarded`, `is_resume_completed`, `is_searchable`, profile fields for completion % | `uid === params.id` | `candidate-${id}` |
| User Info | `user_info` | `is_onboarded`, `roles` | `uid === params.id` | `user-data-${uid}` |
| User Account | `user_accounts` | `uid`, `roles`, `email` | Current user | `user-data-${uid}` |
| Applications | `web_job_applications` | `status`, `created_at`, `job_id`, `company_id`, `company_name`, `job_title` | `candidate_id === params.id` | `job-applications-${id}` |
| Interviews | `job_interviews` | `appointment`, `status`, `channel`, `company_name`, `job_title`, `from`, `to`, `location` | `candidate_id === params.id`, upcoming only | `candidate-interviews-${id}` |
| Wallet | `web_pockets` | `balance`, `currency` | `uid === params.id`, `currency === 'coin'` | `wallet-${id}` |
| Recommended Jobs | `web_jobs` | `uid`, `title`, `company_name`, `company_logo`, `min_salary`, `max_salary`, `work_location_text`, matched fields | Based on candidate preferences | `recommended-jobs-${id}` |

### 4.2 Write Operations

**This is a READ-ONLY page. No mutations occur on this route.**

All write operations happen on linked routes:
- Profile updates → `/candidates/[id]/profile`
- Application actions → `/candidates/[id]/applications`
- Settings changes → `/candidates/[id]/settings`

### 4.3 Data Fetching Strategy

```typescript
// Initial page load - parallel fetches
const { data: candidate, isLoading: candidateLoading } = useSWR(
  id ? candidateKeys.candidate(id) : null,
  fetcher,
  defaultSWRConfig
);

const { data: applications } = useSWR(
  id ? candidateKeys.applications(id) : null,
  fetcher,
  defaultSWRConfig
);

const { data: interviews } = useSWR(
  id ? `candidate-interviews-${id}` : null,
  () => fetchUpcomingInterviews(id),
  defaultSWRConfig
);

const { data: wallet } = useSWR(
  id ? `wallet-${id}` : null,
  fetcher,
  defaultSWRConfig
);

const { data: recommendedJobs } = useSWR(
  id ? jobKeys.recommended(id) : null,
  fetcher,
  { ...defaultSWRConfig, revalidateOnFocus: false }
);
```

---

## 5. State Contract

### 5.1 Atoms

| Atom | Type | R/W | Purpose | Set When |
|------|------|-----|---------|----------|
| `userAtom` | `userDataProps \| null` | R | Get user data, check ownership | After auth validation |
| `candidateAtom` | `candidateDataProps \| null` | R/W | Candidate profile cache | After data fetch |
| `firebaseUserAtom` | `User \| null` | R | Firebase auth state | On auth change |
| `sessionStateAtom` | `SessionState` | R | Session validity | After session check |
| `activeRoleAtom` | `string` | R/W | Navigation context ('candidate') | On page mount |

### 5.2 Hooks

| Hook | Returns | Purpose |
|------|---------|---------|
| `useFirebaseAuth` | `{ user, userChancedee, loading }` | Auth state, user data |
| `useParams` | `{ id: string }` | Route parameters |
| `useRouter` | Next.js router | Navigation, redirects |
| `useStepCompletion` | `{ completionPercentage, missingFields }` | Profile completion calculation |

**Source:** `state-inventory_hooks-domain.md`, `state-inventory_hooks-global.md`

### 5.3 SWR Keys

| Key Pattern | Purpose | Config | Invalidation Trigger |
|-------------|---------|--------|----------------------|
| `candidate-${id}` | Candidate profile | `defaultSWRConfig` | Profile update (other routes) |
| `candidate-dashboard-${id}` | Dashboard aggregated data | `defaultSWRConfig` | Application status change |
| `job-applications-${id}` | Application list | `defaultSWRConfig` | Apply, withdraw, status change |
| `recommended-jobs-${id}` | Job recommendations | `defaultSWRConfig` | Preference update |
| `wallet-${id}` | Wallet balance | `defaultSWRConfig` | Transaction (from other routes) |
| `candidate-interviews-${id}` | Upcoming interviews | `defaultSWRConfig` | Interview scheduled/changed |

**Source:** `state-inventory_swr-keys.md`

---

## 6. UI State Machine

### 6.1 Page State Automaton ⚠️ REQUIRED

```
                    ┌─────────────────┐
                    │    loading      │
                    │  (initial)      │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   auth_check    │
                    │                 │
                    └────────┬────────┘
                             │
               ┌─────────────┼─────────────┐
               │             │             │
               ▼             ▼             ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │ redirect │  │  owner   │  │redirect  │
        │ _login   │  │  _check  │  │_role     │
        └──────────┘  └────┬─────┘  └──────────┘
                           │
               ┌───────────┼───────────┐
               │           │           │
               ▼           ▼           ▼
        ┌──────────┐ ┌───────────┐ ┌──────────┐
        │redirect  │ │ onboard   │ │loading   │
        │_own      │ │ _check    │ │_data     │
        └──────────┘ └─────┬─────┘ └────┬─────┘
                           │            │
               ┌───────────┴───┐        │
               │               │        │
               ▼               ▼        ▼
        ┌──────────────┐ ┌──────────┐ ┌────┐
        │redirect      │ │loading   │ │idle│
        │_onboarding   │ │_data     │ │    │
        └──────────────┘ └────┬─────┘ └─┬──┘
                              │         │
                              └────┬────┘
                                   │
                              ┌────┴────┐
                              │         │
                              ▼         ▼
                        ┌──────────┐ ┌─────┐
                        │  error   │ │idle │
                        │          │ │     │
                        └──────────┘ └─────┘
```

**State Transition Table:**

| Current State | Event | Next State | Guard Condition | Side Effects |
|---------------|-------|------------|-----------------|--------------|
| `loading` | `INIT` | `auth_check` | - | Start session validation |
| `auth_check` | `AUTH_SUCCESS` | `owner_check` | `sessionState === 'valid'` | Set `activeRoleAtom` |
| `auth_check` | `AUTH_FAILED` | `redirect_login` | `sessionState === 'expired' \|\| 'none'` | - |
| `auth_check` | `WRONG_ROLE` | `redirect_role` | `!roles.includes('candidate')` | - |
| `owner_check` | `IS_OWNER` | `onboard_check` | `params.id === currentUser.uid` | - |
| `owner_check` | `NOT_OWNER` | `redirect_own` | `params.id !== currentUser.uid` | - |
| `onboard_check` | `IS_ONBOARDED` | `loading_data` | `candidate.is_onboarded === true` | - |
| `onboard_check` | `NOT_ONBOARDED` | `redirect_onboarding` | `candidate.is_onboarded === false` | - |
| `loading_data` | `DATA_SUCCESS` | `idle` | All fetches complete | Populate SWR cache |
| `loading_data` | `DATA_ERROR` | `error` | Fetch failed | Set error message |
| `error` | `RETRY` | `loading_data` | - | Clear error, refetch |
| `idle` | `REFRESH` | `loading_data` | Pull-to-refresh trigger | - |
| `redirect_login` | - | (terminal) | - | `router.push('/auth/login')` |
| `redirect_role` | - | (terminal) | - | `router.push('/auth/select-role')` |
| `redirect_own` | - | (terminal) | - | `router.push('/candidates/${currentUser.uid}')` |
| `redirect_onboarding` | - | (terminal) | - | `router.push('/candidates/${id}/profile?tab=onboarding')` |

### 6.2 Entity State Automaton

**No entity mutations on this route.** This is a read-only dashboard.

Entity state changes happen on other routes:
- Application status changes → `/candidates/[id]/applications`
- Interview status changes → `/chat` (via scheduling)
- Profile updates → `/candidates/[id]/profile`

### 6.3 Component State Automata ⚠️ REQUIRED

#### ProfileCompletionCard

| Component | Current State | Event | Next State | Condition |
|-----------|---------------|-------|------------|-----------|
| ProfileCompletionCard | `hidden` | `LOAD_COMPLETE` | `visible` | `completionPercentage < 100` |
| ProfileCompletionCard | `hidden` | `LOAD_COMPLETE` | `hidden` | `completionPercentage === 100` |
| ProfileCompletionCard | `visible` | `CLICK_RING` | `visible` | - (opens ChecklistModal) |
| ProfileCompletionCard | `visible` | `CLICK_CTA` | `visible` | - (navigates to profile) |

#### ChecklistModal

| Component | Current State | Event | Next State | Condition |
|-----------|---------------|-------|------------|-----------|
| ChecklistModal | `closed` | `OPEN` | `open` | Click on completion ring |
| ChecklistModal | `open` | `CLOSE` | `closed` | Click outside/X button |
| ChecklistModal | `open` | `CLICK_ITEM` | `closed` | - (navigates to section) |

#### EarnMoreModal

| Component | Current State | Event | Next State | Condition |
|-----------|---------------|-------|------------|-----------|
| EarnMoreModal | `closed` | `OPEN` | `open` | Click "รับเพิ่ม" link |
| EarnMoreModal | `open` | `CLOSE` | `closed` | Click outside/X button |

#### AppointmentsSection

| Component | Current State | Event | Next State | Condition |
|-----------|---------------|-------|------------|-----------|
| AppointmentsSection | `loading` | `FETCH_SUCCESS` | `loaded` | `interviews.length > 0` |
| AppointmentsSection | `loading` | `FETCH_SUCCESS` | `hidden` | `interviews.length === 0` |
| AppointmentsSection | `loading` | `FETCH_ERROR` | `error` | Fetch failed |
| AppointmentsSection | `error` | `RETRY` | `loading` | Click retry |
| AppointmentsSection | `loaded` | `VIEW_ALL` | `loaded` | - (navigates to /chat) |

#### RecommendationsSection

| Component | Current State | Event | Next State | Condition |
|-----------|---------------|-------|------------|-----------|
| RecommendationsSection | `loading` | `FETCH_SUCCESS` | `loaded` | `jobs.length > 0` |
| RecommendationsSection | `loading` | `FETCH_SUCCESS` | `empty` | `jobs.length === 0` |
| RecommendationsSection | `loading` | `FETCH_ERROR` | `error` | Fetch failed (non-critical) |
| RecommendationsSection | `loading` | `SERVICE_DOWN` | `service_down` | Recommendation service unavailable |
| RecommendationsSection | `error` | `RETRY` | `loading` | Click retry |
| RecommendationsSection | `empty` | `CLICK_CTA` | `empty` | - (navigates to profile) |
| RecommendationsSection | `service_down` | - | `service_down` | Gracefully hidden |

#### ApplicationSummary

| Component | Current State | Event | Next State | Condition |
|-----------|---------------|-------|------------|-----------|
| ApplicationSummary | `loading` | `FETCH_SUCCESS` | `loaded` | Always (show zeros if empty) |
| ApplicationSummary | `loading` | `FETCH_ERROR` | `error` | Fetch failed |
| ApplicationSummary | `loaded` | `CLICK_STAT` | `loaded` | - (navigates to applications with filter) |
| ApplicationSummary | `error` | `RETRY` | `loading` | Click retry |

---

## 7. Component-Action Wiring

### Welcome Header

| Component | User Action | Handler | Result |
|-----------|-------------|---------|--------|
| Greeting | - | - | Display "สวัสดี, {first_name}" |
| Date | - | - | Display Thai format date |

### Profile Completion Card

| Component | User Action | Handler | Result |
|-----------|-------------|---------|--------|
| Completion Ring | Click | `openChecklistModal()` | Open checklist modal |
| CTA Button | Click | `router.push('/candidates/${id}/profile?tab=onboarding')` | Navigate to profile |
| Missing Item | Click | `router.push('/candidates/${id}/profile?tab=${section}')` | Navigate to specific section |

### Coin Balance

| Component | User Action | Handler | Result |
|-----------|-------------|---------|--------|
| Earn More Link | Click | `openEarnMoreModal()` | Open earn more modal |

### Upcoming Appointments

| Component | User Action | Handler | Result |
|-----------|-------------|---------|--------|
| View All Link | Click | `router.push('/chat')` | Navigate to chat (with appointments) |
| Appointment Card | Click | `router.push('/chat/${roomId}')` | Navigate to specific chat |
| Message Action | Click | `router.push('/chat/${roomId}')` | Navigate to chat |

### Application Summary

| Component | User Action | Handler | Result |
|-----------|-------------|---------|--------|
| Applied Card | Click | `router.push('/candidates/${id}/applications?status=applied')` | Navigate with filter |
| Reviewing Card | Click | `router.push('/candidates/${id}/applications?status=reviewing')` | Navigate with filter |
| Interview Card | Click | `router.push('/candidates/${id}/applications?status=interviewing')` | Navigate with filter |
| Offers Card | Click | `router.push('/candidates/${id}/applications?status=offers')` | Navigate with filter |

### Recent Applications

| Component | User Action | Handler | Result |
|-----------|-------------|---------|--------|
| View All Link | Click | `router.push('/candidates/${id}/applications')` | Navigate to applications |
| Application Row | Click | `router.push('/candidates/${id}/applications/${appId}')` | Navigate to detail |

### Recommended Jobs

| Component | User Action | Handler | Result |
|-----------|-------------|---------|--------|
| View All Link | Click | `router.push('/jobs')` | Navigate to job search |
| Job Card | Click | `router.push('/jobs/${jobId}')` | Navigate to job detail |
| Empty State CTA | Click | `router.push('/candidates/${id}/profile')` | Navigate to profile |

---

## 8. Error Handling

### 8.1 Error Types

| Error Type | Display Method | Recovery Action | Thai Message |
|------------|----------------|-----------------|--------------|
| Auth Error (401) | Redirect | Redirect to login | - |
| Forbidden (403) | Redirect | Redirect to own dashboard | - |
| Not Found (404) | Full page | Show 404 page | ไม่พบข้อมูล |
| Network Error | Toast + inline | Retry button | เกิดข้อผิดพลาดในการเชื่อมต่อ |
| Data Fetch Error | Section-level | Retry per section | เกิดข้อผิดพลาด กรุณาลองอีกครั้ง |
| Recommendation Service Down | Hide section | Graceful degradation | (section hidden) |

### 8.2 Graceful Degradation

| Section | On Error | Behavior |
|---------|----------|----------|
| Profile Completion | Error | Hide card, show toast |
| Coin Balance | Error | Show "0" with error state |
| Appointments | Empty | Hide section entirely |
| Applications | Error | Show retry button |
| Recommendations | Service down | Hide section (no error shown) |

### 8.3 Error State Recovery

```typescript
// Example: Section-level error recovery
const handleRetry = async () => {
  setError(null);
  await mutate(candidateKeys.applications(id));
};
```

---

## 9. Implementation Checklist

### Pre-Implementation

- [ ] Verify `candidate_information` collection schema
- [ ] Confirm `is_onboarded` field location (user_info vs candidate_information)
- [ ] Review shell integration points (Chat FAB, Notification bell)

### Core Implementation

- [ ] **9.1** Implement page state machine with auth/owner/onboard checks
- [ ] **9.2** Create isOnboarded redirect guard (critical path)
- [ ] **9.3** Implement owner check redirect
- [ ] **9.4** Implement profile completion calculation hook
- [ ] **9.5** Build Welcome Header with Thai date formatting
- [ ] **9.6** Build Profile Completion Card with ring component
- [ ] **9.7** Build Checklist Modal with field mapping
- [ ] **9.8** Build Coin Balance display with Earn More modal
- [ ] **9.9** Build Appointments Section with conditional rendering
- [ ] **9.10** Build Application Summary with stat cards
- [ ] **9.11** Build Recent Applications list (last 5)
- [ ] **9.12** Build Recommended Jobs carousel

### Data Integration

- [ ] **9.13** Set up SWR fetchers for all data sources
- [ ] **9.14** Implement parallel data fetching
- [ ] **9.15** Implement error boundaries per section
- [ ] **9.16** Configure SWR deduplication

### Testing

- [ ] **9.17** Test auth redirect (unauthenticated user)
- [ ] **9.18** Test owner redirect (wrong candidate ID)
- [ ] **9.19** Test onboarding redirect (is_onboarded=false)
- [ ] **9.20** Test empty states for all sections
- [ ] **9.21** Test error states and recovery
- [ ] **9.22** Test responsive layout (mobile/tablet/desktop)

---

## 10. Decisions Log

| # | Decision | Chosen | Rationale | Date |
|---|----------|--------|-----------|------|
| 1 | Collection name | `candidate_information` | Per PROJECT_INSTRUCTIONS.md decision log | 2025-12-08 |
| 2 | isOnboarded redirect target | `/candidates/[id]/profile?tab=onboarding` | New design uses unified profile page with tab | 2025-12-09 |
| 3 | Owner check behavior | Redirect to own dashboard | Prevent viewing other candidates' dashboards | 2025-12-09 |
| 4 | Appointments section | Hide if empty | Per UI spec Section 5.1 | 2025-12-09 |
| 5 | Profile completion at 100% | Hide completion card | Per UI spec Section 5.1 | 2025-12-09 |
| 6 | Recommendation service down | Hide section gracefully | Don't show error for non-critical feature | 2025-12-09 |
| 7 | Navigation context atom | `activeRoleAtom` | Per PROJECT_INSTRUCTIONS.md rename from navBarAtom | 2025-12-09 |
| 8 | Application status categories | Applied, Reviewing, Interviewing, Offers | Aggregated from detailed statuses | 2025-12-09 |

---

## Appendices

### Appendix A: TypeScript Interfaces

```typescript
// Candidate profile data
interface CandidateDataProps {
  uid: string;
  first_name_th: string;
  last_name_th: string;
  first_name_en?: string;
  last_name_en?: string;
  nick_name_th?: string;
  email: string;
  phone_number?: string;
  avatar_url?: string;
  
  // Address
  address_line_1?: string;
  district?: string;
  province?: string;
  post_code?: string;
  
  // Professional
  about_me?: string;
  area_of_expertise?: string;
  achievement?: string;
  experience_years?: number;
  
  // Arrays
  educations?: Education[];
  works?: WorkExperience[];
  skills?: Skill[];
  languages?: Language[];
  licenses?: License[];
  
  // Status flags
  is_active: boolean;
  is_searchable: boolean;
  is_onboarded: boolean;
  is_preference_set: boolean;
  is_resume_completed: boolean;
  is_verified: boolean;
  
  // Timestamps
  created_at: number;
  updated_at: number;
}

// Application summary
interface ApplicationSummary {
  applied: number;      // Status: applied, viewed
  reviewing: number;    // Status: reviewing, under_review
  interviewing: number; // Status: interview, scheduled, confirmed
  offers: number;       // Status: offer, accepted
}

// Recent application item
interface RecentApplication {
  id: string;
  company_logo: string;
  company_name: string;
  job_title: string;
  applied_date: number;
  status: ApplicationStatus;
  next_action?: string;
}

// Upcoming interview
interface UpcomingInterview {
  id: string;
  appointment: number;
  from: string;
  to: string;
  company_name: string;
  job_title: string;
  channel: 'online' | 'onsite';
  status: 'pending' | 'confirmed';
  location?: string;
  room_id: string;
}

// Recommended job
interface RecommendedJob {
  uid: string;
  title: string;
  company_name: string;
  company_logo: string;
  min_salary?: number;
  max_salary?: number;
  work_location_text: string;
  match_score?: number; // Percentage 0-100
}

// Profile completion
interface ProfileCompletion {
  percentage: number;
  missing_sections: MissingSection[];
}

interface MissingSection {
  key: string;
  label_th: string;
  tab: string; // Profile tab to navigate to
  priority: number;
}

// Wallet
interface WalletBalance {
  balance: number;
  currency: 'coin';
}
```

### Appendix B: Server Actions (Read-only for this route)

This route does not call any server actions directly. All data is fetched via SWR with API routes.

**API Routes Used:**

```typescript
// GET /api/candidates/[id]/profile
// Returns: CandidateDataProps

// GET /api/candidates/[id]/applications
// Returns: { applications: RecentApplication[], summary: ApplicationSummary }

// GET /api/candidates/[id]/interviews/upcoming
// Returns: UpcomingInterview[]

// GET /api/wallets/[id]
// Returns: WalletBalance

// GET /api/jobs/recommended/[candidateId]
// Returns: RecommendedJob[]
```

### Appendix C: Profile Completion Calculation

**Source:** `features_candidates.md` CAND-017

#### Completion Criteria

The profile completion percentage is calculated based on required and optional fields across multiple sections.

**Required Fields (Must complete for 100%):**

| Section | Fields | Weight |
|---------|--------|--------|
| Identity | `first_name_th`, `last_name_th` | 15% |
| Contact | `phone_number`, `email` (verified) | 15% |
| Photo | `avatar_url` | 10% |
| Work Experience | At least 1 entry OR `is_new_graduate=true` | 20% |
| Education | At least 1 entry | 15% |
| About Me | `about_me` (min 50 chars) | 10% |
| Area of Expertise | `area_of_expertise` | 10% |
| Preferences | `is_preference_set=true` | 5% |

**Calculation Formula:**

```typescript
function calculateProfileCompletion(candidate: CandidateDataProps): ProfileCompletion {
  let score = 0;
  const missingFields: MissingSection[] = [];
  
  // Identity (15%)
  if (candidate.first_name_th && candidate.last_name_th) {
    score += 15;
  } else {
    missingFields.push({ key: 'identity', label_th: 'ข้อมูลส่วนตัว', tab: 'personal', priority: 1 });
  }
  
  // Contact (15%)
  if (candidate.phone_number && candidate.email) {
    score += 15;
  } else {
    missingFields.push({ key: 'contact', label_th: 'ข้อมูลติดต่อ', tab: 'personal', priority: 2 });
  }
  
  // Photo (10%)
  if (candidate.avatar_url) {
    score += 10;
  } else {
    missingFields.push({ key: 'photo', label_th: 'รูปโปรไฟล์', tab: 'personal', priority: 3 });
  }
  
  // Work Experience (20%)
  if ((candidate.works && candidate.works.length > 0) || candidate.is_new_graduate) {
    score += 20;
  } else {
    missingFields.push({ key: 'work', label_th: 'ประสบการณ์ทำงาน', tab: 'resume', priority: 4 });
  }
  
  // Education (15%)
  if (candidate.educations && candidate.educations.length > 0) {
    score += 15;
  } else {
    missingFields.push({ key: 'education', label_th: 'ประวัติการศึกษา', tab: 'resume', priority: 5 });
  }
  
  // About Me (10%)
  if (candidate.about_me && candidate.about_me.length >= 50) {
    score += 10;
  } else {
    missingFields.push({ key: 'about', label_th: 'เกี่ยวกับฉัน', tab: 'resume', priority: 6 });
  }
  
  // Area of Expertise (10%)
  if (candidate.area_of_expertise) {
    score += 10;
  } else {
    missingFields.push({ key: 'expertise', label_th: 'ความเชี่ยวชาญ', tab: 'resume', priority: 7 });
  }
  
  // Preferences (5%)
  if (candidate.is_preference_set) {
    score += 5;
  } else {
    missingFields.push({ key: 'preferences', label_th: 'ความต้องการงาน', tab: 'preferences', priority: 8 });
  }
  
  return {
    percentage: score,
    missing_sections: missingFields.sort((a, b) => a.priority - b.priority).slice(0, 3)
  };
}
```

**Display Rules:**
- Show top 3 missing sections in completion card
- Hide completion card if percentage = 100%
- Completion ring: Orange (#db6726) for progress, gray for remaining

### Appendix D: Application Status Mapping

**Status Aggregation for Summary Cards:**

| Summary Category | Underlying Statuses |
|------------------|---------------------|
| Applied (สมัครแล้ว) | `applied`, `viewed` |
| Reviewing (กำลังพิจารณา) | `reviewing`, `under_review`, `accepted` |
| Interviewing (นัดสัมภาษณ์) | `interview`, `scheduled`, `confirmed` |
| Offers (ได้รับข้อเสนอ) | `offer` |

**Excluded from counts:** `rejected`, `withdrawn`, `closed`

### Appendix E: Related Routes

| Route | Relationship |
|-------|--------------|
| `/candidates/[id]/profile` | CAND-R02 - Links via completion card, redirect target for onboarding |
| `/candidates/[id]/applications` | Links via stat cards and "View All" |
| `/candidates/[id]/saved` | Links via sidebar navigation |
| `/candidates/[id]/settings` | CAND-R03 - Links via sidebar navigation |
| `/jobs` | Links via "View All" on recommendations |
| `/jobs/[id]` | Links via job cards |
| `/chat` | Links via appointments "View All" and "Message" actions |

---

*End of RIS: /candidates/[id] (CAND-R01) v1.0*
