# RIS: /companies/[id]/pending

**Route ID:** COMP-R01  
**Version:** 1.0  
**Status:** Draft  
**Created:** 2025-12-09  
**Last Updated:** 2025-12-09

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-09 | Initial RIS creation with complete state transition tables |

---

## 1. Route Metadata

| Property | Value |
|----------|-------|
| Route Path | `/companies/[id]/pending` |
| Route ID | COMP-R01 |
| Shell | Minimal Shell (limited Company Shell) |
| Purpose | Status page for companies awaiting platform approval |
| Complexity | Medium |
| Phase | 1b (Company Setup) |
| UI Spec | `05-company-routes.md` Section 6.1 |

### Route Parameters

| Parameter | Type | Source | Validation |
|-----------|------|--------|------------|
| `id` | `string` | URL path segment | Must be valid company ID |

---

## 2. Domain Classification

### Primary Domain: Company

- **Owns:** Company status display, pending state UI
- **Mutations:** Edit company profile (links to settings), resubmit on rejection

### Secondary Domains

| Domain | Role | Access |
|--------|------|--------|
| Jobs | "While waiting" job draft preparation | Write: create draft jobs (won't publish until approved) |
| Candidate | "While waiting" candidate browsing | Read: limited/preview candidate search |

### Global Domains (Shell-Injected)

| Domain | Requirement |
|--------|-------------|
| Auth | User must be authenticated, must be company admin of `[id]` |
| Chat | Not available (minimal shell) |
| Notifications | Not available (minimal shell) |

---

## 3. Feature Mapping

### Existing Features (Preserve - P0)

| Feature ID | Feature Name | Coverage | Notes |
|------------|--------------|----------|-------|
| COMP-003 | Create Company Registration Request | Display | Show pending status after creation |
| COMP-005 | Edit Pending Company Profile | Action | Link to company settings for editing |
| COMP-007 | Approve Company Request (Admin) | Display | Show when admin approves → redirect |
| COMP-008 | Reject Company Request (Admin) | Display | Show rejection state with reason |

### New Features (This Route Introduces)

| Feature | Description | Priority |
|---------|-------------|----------|
| 5-Step Progress Stepper | Visual progress of approval workflow | P0 |
| "While Waiting" Actions | Suggested preparatory tasks during pending state | P0 |
| Rejection State UI | Display rejection reason with corrective actions | P0 |
| Auto-Redirect on Approval | If status changes to approved, redirect to dashboard | P0 |

### Not Implemented in v1.0

| Feature | Description | Status |
|---------|-------------|--------|
| Approval Polling | Real-time status check for approval | ☐ Future Work - rely on email notification |
| Push Notifications | Notify user when status changes | ☐ Future Work |

---

## 4. Data Contract

### 4.1 Read Operations

| Data | Collection | Fields | Condition | SWR Key |
|------|------------|--------|-----------|---------|
| Company Data | `company_information` | `uid`, `company_name`, `profile_photo`, `status`, `is_active` | `uid === params.id` | `company-${id}` |
| Company Contact | `contact` (subcollection) | `email`, `phone` | Linked to company | `company-contact-${id}` |
| User Data | `user_accounts` | `uid`, `roles`, `companyId`, `target_company` | Current user | `user-data-${uid}` |
| Rejection Info | `company_information` | `rejection_reason`, `rejected_at`, `rejected_by` | If `status === 'rejected'` | Included in company data |

### 4.2 Write Operations

| Action | Server Action | Collection | Fields Modified | Guard |
|--------|---------------|------------|-----------------|-------|
| Edit Profile | Link to `/companies/[id]/dashboard/settings` | N/A | N/A | `status === 'pending'` |
| Resubmit | `ResubmitCompanyRequest` | `company_information` | `status: 'pending'`, clear rejection fields | `status === 'rejected'` |

### 4.3 Data Fetching Strategy

```typescript
// Initial page load
const { data: company, isLoading } = useSWR(
  id ? companyKeys.company(id) : null,
  fetcher,
  defaultSWRConfig
);

// Access control check
const { data: user } = useSWR(
  firebaseUser?.uid ? `user-data-${firebaseUser.uid}` : null,
  fetcher
);
```

---

## 5. State Contract

### 5.1 Atoms

| Atom | Type | R/W | Purpose |
|------|------|-----|---------|
| `userAtom` | `userDataProps \| null` | R | Get user roles, companyId |
| `firebaseUserAtom` | `User \| null` | R | Verify authenticated |
| `sessionStateAtom` | `SessionState` | R | Verify session valid |
| `activeRoleAtom` | `string` | R/W | Navigation context (should be 'pending') |
| `companyAtom` | `companyDataProps \| null` | R/W | Current company data cache |

### 5.2 Hooks

| Hook | Returns | Purpose |
|------|---------|---------|
| `useFirebaseAuth` | `{ user, loading, signOutFirebase }` | Check auth state, logout |
| `useCompanyInfo` | `{ company, isLoading, error }` | Fetch company data by ID |
| `useRouter` | Next.js router | Navigation, redirects |
| `useParams` | `{ id: string }` | Get route params |

### 5.3 SWR Keys

| Key Pattern | Purpose | Config |
|-------------|---------|--------|
| `company-${id}` | Company full data | `defaultSWRConfig` |
| `user-data-${uid}` | User account data | `defaultSWRConfig` |

### 5.4 Local Component State

| State | Type | Initial | Purpose |
|-------|------|---------|---------|
| `pageState` | `PageState` | `'loading'` | Current page state machine state |
| `detectedStatus` | `CompanyStatus \| null` | `null` | Company status from data |
| `activeStep` | `number` | `3` | Current step in stepper (Step 3 = reviewing) |

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
    [ACCESS_CHECK]          [STATUS_CHECK]          [error_view]
           │                       │
    ┌──────┼──────┐         ┌──────┼──────┬──────┐
    │      │      │         │      │      │      │
    ▼      ▼      ▼         ▼      ▼      ▼      ▼
[redirect] [idle] [redirect] [pending] [rejected] [approved] [not_found]
 (login)         (own co.)  (view)    (view)     (redirect)  (view)
```

#### Page State Transition Table

| Current State | Event | Next State | Guard Condition | Side Effects |
|---------------|-------|------------|-----------------|--------------|
| `loading` | `AUTH_LOADED` | `auth_check` | - | - |
| `loading` | `AUTH_ERROR` | `redirect_login` | - | `router.push('/auth/login')` |
| `auth_check` | `NOT_AUTHENTICATED` | `redirect_login` | `!firebaseUser` | `router.push('/auth/login')` |
| `auth_check` | `AUTHENTICATED` | `loading_data` | `firebaseUser !== null` | Fetch company data |
| `loading_data` | `DATA_LOADED` | `access_check` | - | Set `detectedStatus` |
| `loading_data` | `DATA_ERROR` | `error` | - | Set error message |
| `loading_data` | `COMPANY_NOT_FOUND` | `not_found` | `company === null` | - |
| `access_check` | `IS_OWNER` | `status_check` | `user.companyId === id` OR `user.target_company === id` | - |
| `access_check` | `NOT_OWNER` | `redirect_own` | `user.companyId !== id` | `router.push(/companies/[user.companyId]/pending)` |
| `access_check` | `NO_COMPANY` | `redirect_login` | `!user.companyId && !user.target_company` | `router.push('/auth/login')` |
| `status_check` | `IS_PENDING` | `pending_view` | `company.status === 'pending'` | Set `activeStep = 3` |
| `status_check` | `IS_REJECTED` | `rejected_view` | `company.status === 'rejected'` | Load rejection reason |
| `status_check` | `IS_APPROVED` | `redirect_dashboard` | `company.status === 'approved'` | `router.push(/companies/[id]/dashboard)` |
| `status_check` | `IS_SUSPENDED` | `redirect_dashboard` | `company.status === 'suspended'` | `router.push(/companies/[id]/dashboard)` |
| `pending_view` | `LOGOUT_CLICK` | `logging_out` | - | Call `signOutFirebase()` |
| `pending_view` | `BROWSE_CANDIDATES_CLICK` | `pending_view` | - | `router.push(/companies/[id]/dashboard/candidates)` |
| `pending_view` | `PREPARE_JOBS_CLICK` | `pending_view` | - | `router.push(/companies/[id]/dashboard/jobs/new)` |
| `pending_view` | `COMPLETE_PROFILE_CLICK` | `pending_view` | - | `router.push(/companies/[id]/dashboard/settings)` |
| `pending_view` | `CONTACT_SUPPORT_CLICK` | `pending_view` | - | Open support channel |
| `rejected_view` | `EDIT_INFO_CLICK` | `rejected_view` | - | `router.push(/companies/[id]/dashboard/settings)` |
| `rejected_view` | `CONTACT_SUPPORT_CLICK` | `rejected_view` | - | Open support channel |
| `rejected_view` | `LOGOUT_CLICK` | `logging_out` | - | Call `signOutFirebase()` |
| `logging_out` | `LOGOUT_SUCCESS` | `redirect_login` | - | `router.push('/auth/login')` |
| `logging_out` | `LOGOUT_ERROR` | `pending_view` | - | Show error toast |
| `error` | `RETRY_CLICK` | `loading_data` | - | Refetch company data |
| `not_found` | `HOME_CLICK` | `redirect_home` | - | `router.push('/')` |

### 6.2 Entity State Automaton - Company

| Entity | Current State | Event | Next State | Actor | Side Effects |
|--------|---------------|-------|------------|-------|--------------|
| `Company` | `(none)` | `CREATE_COMPANY` | `pending` | User | Create `company_information` doc, `is_active: false` |
| `Company` | `pending` | `APPROVE` | `approved` | Platform Admin | Set `is_active: true`, notify company admin via email |
| `Company` | `pending` | `REJECT` | `rejected` | Platform Admin | Set `rejection_reason`, notify company admin via email |
| `Company` | `rejected` | `RESUBMIT` | `pending` | Company Admin | Clear rejection fields, reset for review |
| `Company` | `approved` | `SUSPEND` | `suspended` | Platform Admin | Set `is_active: false`, unpublish all jobs |
| `Company` | `suspended` | `UNSUSPEND` | `approved` | Platform Admin | Set `is_active: true` (jobs remain unpublished) |

#### Company Status Lifecycle Diagram

```
[none] ───CREATE──→ [pending + is_active:false]
                          │
                ┌─────────┴─────────┐
                │                   │
            APPROVE             REJECT
                │                   │
                ▼                   ▼
   [approved + is_active:true]   [rejected + is_active:false]
                │                   │
            SUSPEND             RESUBMIT
                │                   │
                ▼                   │
   [suspended + is_active:false]   │
                │                   │
            UNSUSPEND               │
                │                   │
                ▼                   ▼
   [approved + is_active:true] ←───┘
```

### 6.3 Component State Automaton - Progress Stepper

| Component | Current State | Event | Next State | Condition | Side Effect |
|-----------|---------------|-------|------------|-----------|-------------|
| `Stepper` | `step_1_done` | `RENDER` | `step_1_done` | Always | Show green check |
| `Stepper` | `step_2_done` | `RENDER` | `step_2_done` | Always | Show green check |
| `Stepper` | `step_3_active` | `RENDER` | `step_3_active` | `status === 'pending'` | Show animated spinner |
| `Stepper` | `step_3_failed` | `RENDER` | `step_3_failed` | `status === 'rejected'` | Show red X |
| `Stepper` | `step_4_pending` | `RENDER` | `step_4_pending` | `status === 'pending'` | Show gray circle |
| `Stepper` | `step_5_pending` | `RENDER` | `step_5_pending` | `status === 'pending'` | Show gray circle |

#### Stepper Steps Reference

| Step | Label (Thai) | Icon State (Pending) | Icon State (Rejected) |
|------|--------------|----------------------|-----------------------|
| 1 | ✓ บัญชีสร้างแล้ว | Green check | Green check |
| 2 | ✓ ข้อมูลบริษัทส่งแล้ว | Green check | Green check |
| 3 | ⟳ กำลังตรวจสอบเอกสาร | Animated spinner | Red X |
| 4 | ○ รอการอนุมัติ | Gray circle | Gray circle |
| 5 | ○ อนุมัติแล้ว | Gray circle | Gray circle |

---

## 7. Component-Action Wiring

### 7.1 Pending View Components

| Component | User Action | Handler | State Transition | Side Effects |
|-----------|-------------|---------|------------------|--------------|
| `LogoutButton` | Click | `handleLogout` | `pending_view` → `logging_out` | Call `signOutFirebase()` |
| `BrowseCandidatesCard` | Click | `handleBrowseCandidates` | - | Navigate to `/companies/[id]/dashboard/candidates` |
| `PrepareJobsCard` | Click | `handlePrepareJobs` | - | Navigate to `/companies/[id]/dashboard/jobs/new` |
| `CompleteProfileCard` | Click | `handleCompleteProfile` | - | Navigate to `/companies/[id]/dashboard/settings` |
| `ContactSupportLink` | Click | `handleContactSupport` | - | Open LINE/email support |

### 7.2 Rejection View Components

| Component | User Action | Handler | State Transition | Side Effects |
|-----------|-------------|---------|------------------|--------------|
| `EditInfoButton` | Click | `handleEditInfo` | - | Navigate to `/companies/[id]/dashboard/settings?from=rejected` |
| `ContactSupportButton` | Click | `handleContactSupport` | - | Open LINE/email support |
| `LogoutButton` | Click | `handleLogout` | `rejected_view` → `logging_out` | Call `signOutFirebase()` |

### 7.3 Action Handlers

```typescript
// Logout handler
const handleLogout = async () => {
  setPageState('logging_out');
  try {
    await signOutFirebase();
    router.push('/auth/login');
  } catch (error) {
    toast.error('ไม่สามารถออกจากระบบได้');
    setPageState(detectedStatus === 'rejected' ? 'rejected_view' : 'pending_view');
  }
};

// Navigation handlers
const handleBrowseCandidates = () => {
  router.push(`/companies/${id}/dashboard/candidates`);
};

const handlePrepareJobs = () => {
  router.push(`/companies/${id}/dashboard/jobs/new`);
};

const handleCompleteProfile = () => {
  router.push(`/companies/${id}/dashboard/settings`);
};

const handleEditInfo = () => {
  router.push(`/companies/${id}/dashboard/settings?from=rejected`);
};

// Support handler
const handleContactSupport = () => {
  // Open LINE Official Account or support email
  window.open('https://line.me/R/ti/p/@chancedee', '_blank');
};
```

---

## 8. Error Handling

### 8.1 Error States

| Error Type | User Message (Thai) | Recovery Action |
|------------|---------------------|-----------------|
| `AUTH_ERROR` | ไม่สามารถยืนยันตัวตนได้ | Redirect to login |
| `COMPANY_NOT_FOUND` | ไม่พบข้อมูลบริษัท | Show not found view, link to home |
| `FETCH_ERROR` | เกิดข้อผิดพลาดในการโหลดข้อมูล | Retry button |
| `UNAUTHORIZED` | คุณไม่มีสิทธิ์เข้าถึงหน้านี้ | Redirect to own company |
| `LOGOUT_ERROR` | ไม่สามารถออกจากระบบได้ | Toast error, remain on page |

### 8.2 Error Recovery Paths

| Error State | Primary Recovery | Secondary Recovery |
|-------------|------------------|-------------------|
| `error` | Click "ลองใหม่" button | Navigate to home |
| `not_found` | Click "กลับหน้าหลัก" button | - |
| `redirect_login` | Auto-redirect to `/auth/login` | - |

### 8.3 Error UI Components

```typescript
// Error view component structure
interface ErrorViewProps {
  errorType: 'FETCH_ERROR' | 'COMPANY_NOT_FOUND' | 'UNAUTHORIZED';
  onRetry?: () => void;
  onHome?: () => void;
}
```

---

## 9. UI Layout Specification

### 9.1 Pending View Layout

| Component | Purpose | Position | Responsive | Notes |
|-----------|---------|----------|------------|-------|
| **Status Card** | Main container | Center, max 600px | Full-width mobile | White card with shadow |
| ↳ Company Header | Branding | Top | - | - |
| ↳↳ Logo | Company logo | Left | Center mobile | 64x64, rounded |
| ↳↳ Name | Company name | Right | Below logo mobile | Typography: h2 |
| ↳ Status Tracker | Progress stepper | - | Vertical | 5 steps |
| ↳ Time Estimate | "โดยประมาณ 1-2 วันทำการ" | Below stepper | - | Muted text |
| ↳ Email Note | "เราจะแจ้งผลทางอีเมล" | - | - | Muted text |
| **While Waiting Section** | Preparatory actions | Below status | - | - |
| ↳ Section Title | "ระหว่างรอ คุณสามารถ..." | - | - | Typography: h3 |
| ↳ Action Cards | Grid of 3 cards | 3 cols | 1 col mobile | Clickable cards |
| **Contact Section** | Support | Bottom | - | - |
| ↳ Question Text | "มีคำถาม?" | - | - | - |
| ↳ Contact Link | Support channel | - | - | Opens LINE |
| **Logout Button** | Exit | Bottom | Full-width | Ghost button |

### 9.2 Rejection View Layout

| Component | Purpose | Position | Notes |
|-----------|---------|----------|-------|
| **Status Card** | Main container | Center, max 600px | Red accent border |
| ↳ Rejection Icon | ✗ icon | Top center | Red color, large |
| ↳ Title | "การลงทะเบียนไม่ได้รับการอนุมัติ" | Center | Typography: h2 |
| ↳ Reason Card | Admin-provided reason | Below title | Gray background |
| ↳ Description | "คุณสามารถแก้ไขและส่งใหม่ได้" | Below reason | Muted text |
| **Action Buttons** | Next steps | Below description | Stacked |
| ↳ Edit Button | "แก้ไขข้อมูล" | Primary | Orange/brand color |
| ↳ Support Button | "ติดต่อฝ่ายสนับสนุน" | Secondary | Outline style |
| **Logout Button** | Exit | Bottom | Ghost button |

---

## 10. Implementation Checklist

### 10.1 Route Setup

- [ ] Create `/app/companies/[id]/pending/page.tsx`
- [ ] Configure route metadata (title, description)
- [ ] Set up Minimal Shell wrapper

### 10.2 State Management

- [ ] Create `useCompanyPendingPage` hook for page state machine
- [ ] Wire atoms: `userAtom`, `firebaseUserAtom`, `sessionStateAtom`, `activeRoleAtom`
- [ ] Set up SWR for company data fetching
- [ ] Implement access control check

### 10.3 Components

- [ ] Create `CompanyPendingCard` wrapper component
- [ ] Create `ApprovalStepper` component (5 steps, animated)
- [ ] Create `WhileWaitingSection` with action cards
- [ ] Create `RejectionView` component with reason display
- [ ] Create `StatusPageLogout` button component
- [ ] Create `ContactSupport` component

### 10.4 Navigation

- [ ] Implement redirect for approved companies → dashboard
- [ ] Implement redirect for non-owners → own company
- [ ] Implement "while waiting" navigation actions
- [ ] Implement logout with redirect to login

### 10.5 Error Handling

- [ ] Implement loading skeleton
- [ ] Implement error view with retry
- [ ] Implement not found view
- [ ] Add toast notifications for errors

### 10.6 Testing

- [ ] Test: Pending company sees stepper at step 3
- [ ] Test: Rejected company sees rejection reason
- [ ] Test: Approved company redirects to dashboard
- [ ] Test: Non-owner redirects to own company
- [ ] Test: Unauthenticated redirects to login
- [ ] Test: "While waiting" actions navigate correctly
- [ ] Test: Logout works from both pending and rejected views
- [ ] Test: Mobile responsive layout

---

## 11. Decisions Log

| Decision | Chosen | Rationale | Date |
|----------|--------|-----------|------|
| No polling for approval | Email notification primary | Simpler implementation, polling complexity not justified for 1-2 day approval time | 2025-12-09 |
| Minimal Shell | No chat/notifications | Pending companies don't have full platform access yet | 2025-12-09 |
| "While waiting" limited access | Preview only for candidates, drafts only for jobs | Balance UX with pending status restrictions | 2025-12-09 |
| Combined pending/rejected view | Single route with conditional UI | Similar patterns, reduces route proliferation | 2025-12-09 |
| Resubmit clears rejection | Return to pending status | Standard re-review workflow | 2025-12-09 |
| Access via `target_company` OR `companyId` | Support both pending admin and approved admin cases | `target_company` set during company creation, `companyId` set after approval | 2025-12-09 |
| Use `activeRoleAtom` (renamed from `navBarAtom`) | Better semantic meaning | Per PROJECT_INSTRUCTIONS decisions | 2025-12-09 |

---

## 12. Related Routes

| Route | Relationship |
|-------|--------------|
| `/auth/login` | Predecessor → routes here after company registration |
| `/auth/register` | Predecessor → creates company then redirects here |
| `/auth/status` | Alternative → for staff-pending, not company-pending |
| `/companies/[id]/dashboard` | Destination → redirect when approved |
| `/companies/[id]/dashboard/settings` | Linked → edit profile action |
| `/companies/[id]/dashboard/jobs/new` | Linked → prepare jobs action |
| `/companies/[id]/dashboard/candidates` | Linked → browse candidates action |

---

## 13. Open Questions

| Question | Status | Notes |
|----------|--------|-------|
| Rejection reason field location | ✓ Resolved | Stored in `company_information.rejection_reason` |
| Resubmit server action | ⏳ Needs Implementation | `ResubmitCompanyRequest` action to create |
| "While waiting" access level | ✓ Resolved | Limited preview access, no publishing |
| Support channel | ⏳ Needs Configuration | LINE Official Account URL |

---

## Appendix A: TypeScript Types

```typescript
// Company status enum
type CompanyStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

// Page states
type PageState = 
  | 'loading'
  | 'auth_check'
  | 'loading_data'
  | 'access_check'
  | 'status_check'
  | 'pending_view'
  | 'rejected_view'
  | 'logging_out'
  | 'error'
  | 'not_found'
  | 'redirect_login'
  | 'redirect_dashboard'
  | 'redirect_own';

// Route params
interface CompanyPendingParams {
  id: string;
}

// Company data shape (relevant fields)
interface CompanyPendingData {
  uid: string;
  company_name: string;
  profile_photo?: string;
  status: CompanyStatus;
  is_active: boolean;
  rejection_reason?: string;
  rejected_at?: number;
  rejected_by?: string;
}

// User data shape (relevant fields)
interface UserPendingData {
  uid: string;
  roles: string[];
  companyId?: string;
  target_company?: string;
}

// Step configuration
interface StepConfig {
  step: number;
  label: string;
  icon: 'check' | 'spinner' | 'x' | 'circle';
  status: 'completed' | 'active' | 'pending' | 'failed';
}

// While waiting action
interface WhileWaitingAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  disabled?: boolean;
}
```

---

## Appendix B: Component File Structure

```
src/
├── app/
│   └── companies/
│       └── [id]/
│           └── pending/
│               └── page.tsx              # Main page component
├── components/
│   └── companies/
│       ├── pending/
│       │   ├── CompanyPendingPage.tsx    # Page orchestrator
│       │   ├── ApprovalStepper.tsx       # 5-step progress
│       │   ├── PendingStatusCard.tsx     # Pending state view
│       │   ├── RejectedStatusCard.tsx    # Rejection state view
│       │   ├── WhileWaitingSection.tsx   # Action cards
│       │   └── WhileWaitingCard.tsx      # Individual action card
│       └── shared/
│           └── CompanyHeader.tsx         # Logo + name header
├── hooks/
│   └── companies/
│       └── use-company-pending-page.ts   # Page state machine hook
└── domains/
    └── companies/
        └── services/
            └── server/
                └── actions/
                    └── company-request-management.ts  # ResubmitCompanyRequest
```

---

## Appendix C: Source References

| Section | Source |
|---------|--------|
| UI specification | `05-company-routes.md` Section 6.1 |
| Company status lifecycle | `features_companies.md` State Machines section |
| Company approval (COMP-007) | `features_companies.md` COMP-007 |
| Company rejection (COMP-008) | `features_companies.md` COMP-008 |
| Company creation (COMP-003) | `features_companies.md` COMP-003 |
| Company data schema | `data-entities_company-requests.md` |
| User transfer schema | `data-entities_user-transfer.md` |
| Company status enum | `data-entities__enums.md` CompanyStatus |
| SWR key patterns | `state-inventory_swr-keys.md` Company Keys |
| Atom reference | `state-inventory_atoms.md` Company Atoms |
| Similar page pattern | `AUTH-R05_status_RIS.md` |

---

## Appendix D: Thai Copy Reference

| Key | Thai Text | English Equivalent |
|-----|-----------|-------------------|
| `page_title` | รอการอนุมัติ | Pending Approval |
| `step_1` | บัญชีสร้างแล้ว | Account Created |
| `step_2` | ข้อมูลบริษัทส่งแล้ว | Company Info Submitted |
| `step_3` | กำลังตรวจสอบเอกสาร | Reviewing Documents |
| `step_4` | รอการอนุมัติ | Awaiting Approval |
| `step_5` | อนุมัติแล้ว | Approved |
| `time_estimate` | โดยประมาณ 1-2 วันทำการ | Approximately 1-2 business days |
| `email_note` | เราจะแจ้งผลทางอีเมล | We will notify you via email |
| `while_waiting_title` | ระหว่างรอ คุณสามารถ... | While waiting, you can... |
| `browse_candidates` | ค้นหาผู้สมัคร | Browse Candidates |
| `prepare_jobs` | เตรียมประกาศงาน | Prepare Job Postings |
| `complete_profile` | เพิ่มเติมข้อมูลบริษัท | Complete Company Profile |
| `question_text` | มีคำถาม? | Have questions? |
| `contact_support` | ติดต่อฝ่ายสนับสนุน | Contact Support |
| `logout` | ออกจากระบบ | Logout |
| `rejected_title` | การลงทะเบียนไม่ได้รับการอนุมัติ | Registration Not Approved |
| `rejected_description` | คุณสามารถแก้ไขและส่งใหม่ได้ | You can edit and resubmit |
| `edit_info` | แก้ไขข้อมูล | Edit Information |
| `error_fetch` | เกิดข้อผิดพลาดในการโหลดข้อมูล | Error loading data |
| `error_not_found` | ไม่พบข้อมูลบริษัท | Company not found |
| `retry` | ลองใหม่ | Try Again |
| `go_home` | กลับหน้าหลัก | Go to Home |

---

*End of RIS: /companies/[id]/pending (COMP-R01) v1.0*
