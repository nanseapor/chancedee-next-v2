# COMP-R01 (Pending) Assessment Report

**Date:** 2025-12-20
**Assessor:** Claude (AI Assistant)
**Status:** Ready for Implementation

---

## 1. Route Overview

| Property | Value |
|----------|-------|
| **Route Path** | `/jobsmarket/companies/[id]/pending` |
| **Route ID** | COMP-R01 |
| **Purpose** | Status page for companies awaiting platform approval |
| **Shell** | MinimalShell (header-only, no navigation) |
| **Complexity** | Low-Medium |
| **Estimated Effort** | 1-2 days |
| **Phase** | 2 - Independent Routes (First company route) |

---

## 2. RIS Requirements Summary

### 2.1 Core Features

**Status Display:**
- [ ] 5-step progress stepper (animated)
- [ ] Pending state UI with time estimate ("1-2 business days")
- [ ] Rejection state UI with admin reason
- [ ] Email notification note

**"While Waiting" Actions (Pending State):**
- [ ] Browse candidates (preview mode)
- [ ] Prepare job drafts (won't publish until approved)
- [ ] Complete company profile (link to settings)
- [ ] Contact support

**Rejection State Actions:**
- [ ] Edit company information
- [ ] Contact support
- [ ] Resubmit for approval

**Navigation/Access Control:**
- [ ] Auto-redirect if approved → `/companies/[id]/dashboard`
- [ ] Auto-redirect if suspended → `/companies/[id]/dashboard`
- [ ] Redirect non-owners to their own company
- [ ] Redirect unauthenticated users to login
- [ ] Logout functionality

### 2.2 UI Components Required

| Component | Status | Source |
|-----------|--------|--------|
| **MinimalShell** | ✅ Exists | COMP-R00 Phase 3 |
| **ApprovalStepper** | ❌ New | 5 steps with animated spinner |
| **PendingStatusCard** | ❌ New | Main pending view |
| **RejectedStatusCard** | ❌ New | Rejection view with reason |
| **WhileWaitingSection** | ❌ New | 3 action cards |
| **WhileWaitingCard** | ❌ New | Individual action card |
| **ContactSupport** | ❌ New | Support link component |
| **CompanyHeader** | ❌ New | Logo + company name |
| **ErrorViews** | ❌ New | Error, not found, loading states |

### 2.3 Data Requirements

**Entities:**
- `company_information` - Company status, profile, rejection reason
- `user_accounts` - User roles, companyId, target_company

**Required Fields:**
```typescript
interface CompanyPendingData {
  uid: string;
  companyName: string;
  profilePhoto?: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  isActive: boolean;
  rejection_reason?: string;  // For rejected state
  rejected_at?: number;       // For rejected state
  rejected_by?: string;       // For rejected state
}

interface UserData {
  uid: string;
  companyId?: string;          // Set after approval
  target_company?: string;     // Set during registration
}
```

**API Calls:**
- ✅ `webCompanyInformationGetById(id)` - Get company data (exists)
- ❌ `resubmitCompanyRequest(id)` - Resubmit after rejection (needs creation)

---

## 3. Existing Code Analysis

### 3.1 Available from COMP-R00 ✅

**Hooks:**
- ✅ `useCompanyAuth` - 5-level access control state machine
  - Handles auth check, membership check, status check
  - Returns `isLoading`, `isReady`, `access`, `role`, `hasPermission`
  - `access.useMinimalShell` tells us to use MinimalShell
  - `access.companyStatus` gives us current company status

**Components:**
- ✅ `MinimalShell` - Header-only layout
  - Props: `companyName`, `companyLogo`
  - Has logout button built-in
  - No navigation, no chat, no notifications

**Types:**
- ✅ `CompanyStatus` - 'pending' | 'approved' | 'rejected' | 'suspended'
- ✅ `CompanyProfile` - Company data interface
- ✅ `AccessCheckState` - 9 access states

**Utilities:**
- ✅ SWR key factory - `companySwrKeys.profile(id)`
- ✅ Company fetcher - `fetchCompanyProfile(companyId)`

### 3.2 Available from Existing Codebase ✅

**Database Actions:**
- ✅ `webCompanyInformationGetById(uid)` - Fetch company data
- ✅ `webCompanyInformationUpdate(payload, actorId, uid)` - Update company
- ❌ No resubmit action - needs creation

**Types:**
- ✅ `FirebaseCompanyData` - Has `status`, `rejection_reason` fields
- ✅ `companyDataProps` - Full company type with `rejectedBy`, `rejectedAt`

**Atoms:**
- ✅ `userAtom` - Global user state
- ✅ `firebaseUserAtom` - Firebase auth state

### 3.3 Needs to be Created ❌

**Page Components:**
- ❌ `/app/jobsmarket/companies/[id]/pending/page.tsx` - Main page
- ❌ `/app/jobsmarket/companies/[id]/pending/_components/PendingPageClient.tsx` - Client component

**UI Components (Pending View):**
- ❌ `ApprovalStepper.tsx` - 5-step progress with animations
- ❌ `PendingStatusCard.tsx` - Main pending state view
- ❌ `WhileWaitingSection.tsx` - 3 action cards container
- ❌ `WhileWaitingCard.tsx` - Individual action card
- ❌ `CompanyHeaderSimple.tsx` - Logo + name header

**UI Components (Rejection View):**
- ❌ `RejectedStatusCard.tsx` - Rejection state with reason

**Shared Components:**
- ❌ `ContactSupportLink.tsx` - Support channel link
- ❌ `LoadingSkeleton.tsx` - Page loading state
- ❌ `ErrorView.tsx` - Error states

**Server Actions:**
- ❌ `resubmitCompanyRequest.ts` - Clear rejection, set status to pending

**Hooks (Optional):**
- ❌ `useCompanyPendingPage.ts` - Page-specific state machine (optional, can inline)

---

## 4. Implementation Plan

### Phase 1: Route Setup (~2 hours)

**Task 1.1: Create Route Structure**
- Create `/app/jobsmarket/companies/[id]/pending/page.tsx`
- Set up metadata (title, description)
- Configure as Server Component that delegates to Client Component

**Task 1.2: Create Client Component**
- Create `_components/PendingPageClient.tsx`
- Use `"use client"` directive
- Wire up `useCompanyAuth` hook
- Handle loading, error, and access states

**Deliverables:**
- Route file structure
- Basic page routing working
- MinimalShell rendering

### Phase 2: Pending State UI (~4 hours)

**Task 2.1: Create ApprovalStepper Component**
- 5 steps with labels (Thai text)
- Step states: completed (✓), active (spinner), pending (○), failed (✗)
- Animated spinner for step 3 (pending state)
- Responsive: horizontal on desktop, vertical on mobile

**Task 2.2: Create PendingStatusCard**
- Company header (logo + name)
- ApprovalStepper integration
- Time estimate text
- Email notification note
- Contact support link

**Task 2.3: Create WhileWaitingSection**
- Section title: "ระหว่างรอ คุณสามารถ..."
- Grid of 3 action cards:
  1. Browse candidates (preview)
  2. Prepare job drafts
  3. Complete company profile
- Responsive: 3 cols → 1 col mobile

**Task 2.4: Create WhileWaitingCard**
- Icon + title + description
- Clickable card with hover state
- Navigate to respective routes
- Optional "disabled" state for preview features

**Deliverables:**
- Complete pending state UI
- All "while waiting" actions functional
- Responsive design

### Phase 3: Rejection State UI (~2 hours)

**Task 3.1: Create RejectedStatusCard**
- Red X icon at top
- Title: "การลงทะเบียนไม่ได้รับการอนุมัติ"
- Rejection reason display (from `rejection_reason` field)
- Description: "คุณสามารถแก้ไขและส่งใหม่ได้"
- Red accent border on card

**Task 3.2: Create Action Buttons**
- Primary: "แก้ไขข้อมูล" → navigate to settings
- Secondary: "ติดต่อฝ่ายสนับสนุน" → open support
- Logout button at bottom

**Deliverables:**
- Complete rejection state UI
- Edit and support actions working

### Phase 4: Navigation & Redirects (~1 hour)

**Task 4.1: Implement Auto-Redirects**
- Approved companies → `/companies/[id]/dashboard`
- Suspended companies → `/companies/[id]/dashboard`
- Non-owners → own company pending page
- Unauthenticated → `/jobsmarket/auth/login`

**Task 4.2: Implement "While Waiting" Navigation**
- Browse candidates → `/companies/[id]/dashboard/candidates` (preview)
- Prepare jobs → `/companies/[id]/dashboard/jobs/new` (draft mode)
- Complete profile → `/companies/[id]/dashboard/settings`

**Task 4.3: Implement Support Action**
- Open LINE Official Account: `https://line.me/R/ti/p/@chancedee`
- Or support email if LINE not configured

**Deliverables:**
- All redirects working
- All navigation working
- Support channel opens

### Phase 5: Error Handling (~2 hours)

**Task 5.1: Create Error Views**
- Loading skeleton (shows while fetching data)
- Error view with retry button
- Not found view (company doesn't exist)
- Toast notifications for errors

**Task 5.2: Implement Error Recovery**
- Retry button refetches company data
- "กลับหน้าหลัก" button navigates to home
- Logout error shows toast, stays on page

**Deliverables:**
- All error states handled
- User can recover from errors

### Phase 6: Resubmit Action (Optional - Can defer) (~1 hour)

**Task 6.1: Create Server Action**
- Create `resubmitCompanyRequest.ts`
- Clear `rejection_reason`, `rejected_at`, `rejected_by`
- Set `status: 'pending'`
- Return success/error

**Task 6.2: Wire to UI**
- Add "ส่งใหม่" button to rejected view
- Show loading state during resubmit
- Redirect to pending view after success

**Deliverables:**
- Resubmit functionality working
- UI updates after resubmit

**Note:** This can be deferred to after initial implementation. Rejected companies can use "Edit Information" to update and wait for admin re-review without explicit resubmit action.

### Phase 7: Testing (~3 hours)

**Task 7.1: Unit Tests**
- `ApprovalStepper.test.tsx` - Test all step states
- `PendingStatusCard.test.tsx` - Test pending view
- `RejectedStatusCard.test.tsx` - Test rejection view
- `WhileWaitingCard.test.tsx` - Test action cards

**Task 7.2: Integration Tests**
- Test access control (owner vs non-owner)
- Test status redirects (approved, suspended)
- Test auth redirect (unauthenticated)

**Task 7.3: E2E Tests**
- Pending company sees stepper at step 3
- Rejected company sees rejection reason
- Approved company redirects to dashboard
- Non-owner redirects to own company
- "While waiting" actions navigate correctly
- Logout works from both pending and rejected
- Mobile responsive layout

**Deliverables:**
- Unit tests: ~20 tests
- Integration tests: ~10 tests
- E2E tests: ~8 tests
- All tests passing

---

## 5. State Machine Analysis

### 5.1 Page State Machine

The RIS defines a complex 14-state page state machine. However, **we can simplify this** by using `useCompanyAuth` hook:

**Simplified States:**
```typescript
type SimplifiedPageState =
  | 'loading'        // useCompanyAuth.isLoading === true
  | 'pending_view'   // access.companyStatus === 'pending'
  | 'rejected_view'  // access.companyStatus === 'rejected'
  | 'error'          // useCompanyAuth.error !== null
  | 'not_found'      // company === null
  | 'unauthorized';  // !isReady && !isLoading
```

**Why Simplified?**
- `useCompanyAuth` already handles:
  - Auth check (loading → auth_check → redirect if not authed)
  - Membership check (access_check → redirect if not owner)
  - Status check (status_check → redirect if approved/suspended)
  - Role check (determines access level)

**Our Responsibility:**
- Handle `isLoading` → show skeleton
- Handle `!isReady && !isLoading` → show error or redirect (hook may auto-redirect)
- Handle `isReady && companyStatus === 'pending'` → show pending view
- Handle `isReady && companyStatus === 'rejected'` → show rejection view

### 5.2 Company Status Lifecycle

From RIS:
```
[none] ──CREATE──→ [pending + isActive:false]
                         │
               ┌─────────┴─────────┐
               │                   │
           APPROVE             REJECT
               │                   │
               ▼                   ▼
  [approved + isActive:true]   [rejected + isActive:false]
               │                   │
           SUSPEND             RESUBMIT
               │                   │
               ▼                   │
  [suspended + isActive:false]    │
               │                   │
           UNSUSPEND               │
               │                   │
               ▼                   ▼
  [approved + isActive:true] ←────┘
```

**Relevant for COMP-R01:**
- We only show UI for `pending` and `rejected` states
- `approved` and `suspended` auto-redirect to dashboard (handled by `useCompanyAuth`)
- Resubmit action moves `rejected` → `pending`

---

## 6. Component Architecture

### 6.1 File Structure

```
src/
├── app/jobsmarket/companies/[id]/pending/
│   ├── page.tsx                       # Server Component (metadata, wrapper)
│   └── _components/
│       ├── PendingPageClient.tsx      # Main client component
│       ├── ApprovalStepper.tsx        # 5-step progress
│       ├── PendingStatusCard.tsx      # Pending state view
│       ├── RejectedStatusCard.tsx     # Rejection state view
│       ├── WhileWaitingSection.tsx    # Action cards container
│       ├── WhileWaitingCard.tsx       # Individual action card
│       ├── CompanyHeaderSimple.tsx    # Logo + name
│       ├── ContactSupportLink.tsx     # Support link
│       ├── LoadingSkeleton.tsx        # Loading state
│       └── ErrorView.tsx              # Error states
│
├── lib/database/actions/
│   └── company-requests.ts            # Add resubmitCompanyRequest
│
└── types/jobsmarket/company/
    └── pending.ts                     # Page-specific types (optional)
```

### 6.2 Component Props

**ApprovalStepper:**
```typescript
interface ApprovalStepperProps {
  status: 'pending' | 'rejected';
  currentStep?: number;  // Default: 3 for pending, 3 for rejected
  className?: string;
}
```

**PendingStatusCard:**
```typescript
interface PendingStatusCardProps {
  companyName: string;
  companyLogo?: string;
}
```

**RejectedStatusCard:**
```typescript
interface RejectedStatusCardProps {
  companyName: string;
  companyLogo?: string;
  rejectionReason?: string;
  rejectedAt?: number;
  onEdit: () => void;
  onSupport: () => void;
}
```

**WhileWaitingCard:**
```typescript
interface WhileWaitingCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  disabled?: boolean;
}
```

---

## 7. Data Flow

### 7.1 Page Load Sequence

```
1. User navigates to /companies/[id]/pending
   ↓
2. page.tsx (Server Component) renders
   - Sets metadata
   - Passes companyId to client component
   ↓
3. PendingPageClient.tsx mounts
   - Calls useCompanyAuth({ companyId })
   ↓
4. useCompanyAuth executes 5-level state machine:
   - Level 1: Auth check → redirect if not authed
   - Level 2: Membership check → redirect if not member
   - Level 3: Status check → redirect if approved/suspended
   - Level 4: Role check → determine role
   - Level 5: Permission check (not used for pending page)
   ↓
5. If status === 'pending':
   - Render MinimalShell
   - Render PendingStatusCard
   - Render WhileWaitingSection
   ↓
6. If status === 'rejected':
   - Render MinimalShell
   - Render RejectedStatusCard
   - Show rejection reason
   ↓
7. If isLoading:
   - Render LoadingSkeleton
   ↓
8. If error:
   - Render ErrorView
```

### 7.2 SWR Data Fetching

```typescript
// useCompanyAuth internally uses:
const { data: company, error } = useSWR(
  companySwrKeys.profile(companyId),
  () => fetchCompanyProfile(companyId)
);

const { data: membership } = useSWR(
  companySwrKeys.membership(user?.uid, companyId),
  () => fetchUserMembership(user!.uid, companyId)
);
```

We don't need to call SWR ourselves - `useCompanyAuth` handles it.

---

## 8. Questions for SA

### 8.1 Clarifications Needed

**Q1:** Should "Browse Candidates" and "Prepare Jobs" be **fully functional** or **disabled/preview** for pending companies?
- RIS says: "Limited/preview candidate search" and "Draft jobs (won't publish)"
- **Proposed:** Link to routes but show "preview mode" or "draft only" UI in those routes
- **Alternative:** Disable cards with "Available after approval" message

**Q2:** Resubmit action - should we implement in Phase 1 or defer?
- RIS shows resubmit action for rejected companies
- **Proposed:** Defer to Phase 2 - rejected companies can use "Edit Information" and admin re-reviews
- **Alternative:** Implement minimal resubmit that just clears rejection and sets status to pending

**Q3:** Should we use existing `companyDataProps` or create simplified `CompanyPendingData` type?
- `companyDataProps` has many optional fields we don't need
- **Proposed:** Use existing type for consistency
- **Alternative:** Create simplified interface for this page

**Q4:** Support channel - LINE Official Account or email?
- RIS references LINE: `https://line.me/R/ti/p/@chancedee`
- **Proposed:** Use LINE as primary, add email as fallback
- **Need:** Confirm LINE account handle is correct

### 8.2 Implementation Decisions

**D1:** Simplified vs Full State Machine
- **Decision:** Use simplified 5-state machine, leverage `useCompanyAuth`
- **Rationale:** Don't duplicate logic that already exists in the hook

**D2:** Component Location
- **Decision:** Co-locate components in `_components/` folder
- **Rationale:** Follows Next.js 13+ conventions, easy to move to shared later if reused

**D3:** Resubmit Action Priority
- **Decision:** Defer to after initial implementation (not blocking)
- **Rationale:** Rejected companies can still edit profile via settings

---

## 9. Dependencies

### 9.1 External Packages (Already Available)

- ✅ `next` (v16.0.10) - App Router
- ✅ `react` (v19) - UI library
- ✅ `swr` (v2.2.5) - Data fetching
- ✅ `jotai` (v2.10.3) - Global state
- ✅ `lucide-react` (v0.469.0) - Icons
- ✅ `@testing-library/react` (v16.1.0) - Testing
- ✅ `vitest` (v4.0.15) - Test runner

### 9.2 Internal Dependencies (COMP-R00)

- ✅ `useCompanyAuth` - Access control hook
- ✅ `MinimalShell` - Header-only layout
- ✅ `companySwrKeys` - SWR key factory
- ✅ `fetchCompanyProfile` - Company data fetcher
- ✅ Company types (CompanyStatus, CompanyProfile, etc.)

### 9.3 shadcn/ui Components Needed

- ✅ `Button` - All CTAs
- ✅ `Card` - Status cards
- ❌ `Badge` - Step indicators (or use custom)
- ❌ `Alert` - Error messages (or use custom)
- ❌ `Skeleton` - Loading state

Most components exist. May need to install Badge and Alert if not present.

---

## 10. Risks & Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| **rejection_reason field missing** | High | Low | Check FirebaseCompanyData type - field exists as optional |
| **target_company field not set** | High | Medium | Fallback to companyId check, both supported in useCompanyAuth |
| **LINE Official Account URL wrong** | Low | Medium | Confirm URL with SA, easy to fix |
| **"While waiting" routes don't exist yet** | Medium | High | Phase links to dashboard routes (COMP-R04+), implement preview/draft mode there |
| **Resubmit action needed urgently** | Medium | Low | Can defer - rejected companies use edit + admin review |

---

## 11. Success Criteria

### 11.1 Functional Requirements ✅

- [ ] Pending companies see 5-step stepper at step 3 (animated)
- [ ] Rejected companies see rejection reason
- [ ] Approved companies auto-redirect to dashboard
- [ ] Suspended companies auto-redirect to dashboard
- [ ] Non-owners redirect to their own company
- [ ] Unauthenticated users redirect to login
- [ ] "While waiting" actions navigate to correct routes
- [ ] Contact support opens LINE Official Account
- [ ] Logout works from both pending and rejected views

### 11.2 Non-Functional Requirements ✅

- [ ] Mobile responsive (stack layout on mobile)
- [ ] Loading states for all async operations
- [ ] Error handling with retry capability
- [ ] Accessible (ARIA labels, keyboard navigation)
- [ ] Performance (< 1s initial load, use SWR caching)

### 11.3 Quality Gates ✅

- [ ] Build passes (0 errors)
- [ ] Lint passes (0 errors)
- [ ] Unit tests pass (≥20 tests, ≥90% coverage)
- [ ] Integration tests pass (≥10 tests)
- [ ] E2E tests pass (≥8 tests)

---

## 12. Estimation Summary

| Phase | Tasks | Hours | Confidence |
|-------|-------|-------|------------|
| Phase 1: Route Setup | 2 | 2h | High |
| Phase 2: Pending UI | 4 | 4h | High |
| Phase 3: Rejection UI | 2 | 2h | High |
| Phase 4: Navigation | 3 | 1h | High |
| Phase 5: Error Handling | 2 | 2h | High |
| Phase 6: Resubmit (Optional) | 2 | 1h | Medium |
| Phase 7: Testing | 3 | 3h | High |
| **Total** | **18 tasks** | **15h** | **~2 days** |

**Breakdown:**
- **Implementation:** 12 hours (Phases 1-6)
- **Testing:** 3 hours (Phase 7)
- **Buffer:** ~2 hours for unexpected issues

---

## 13. Ready to Proceed?

### ✅ YES - Ready for Implementation

**Checklist:**
- ✅ RIS document fully analyzed (COMP-R01_pending_RIS.md)
- ✅ COMP-R00 foundation verified (all hooks and components exist)
- ✅ Existing database actions identified (webCompanyInformationGetById)
- ✅ Data schema validated (FirebaseCompanyData has required fields)
- ✅ Implementation plan detailed (7 phases, 18 tasks)
- ✅ Success criteria defined (functional + non-functional + quality gates)
- ✅ Risks identified with mitigations
- ✅ Dependencies confirmed (all exist or easy to create)
- ✅ Questions documented for SA (4 clarifications)

**No Blockers Identified.**

**Recommendations:**
1. **Start with simplified implementation:**
   - Skip resubmit action (defer to Phase 6 or later)
   - Link "while waiting" to dashboard routes (implement preview/draft mode there)
   - Use LINE for support (confirm URL with SA)

2. **Follow CAND-R04 7-phase approach:**
   - Phase 1: Route setup
   - Phases 2-5: UI implementation
   - Phase 6: Optional enhancements
   - Phase 7: Comprehensive testing

3. **Test early and often:**
   - Write unit tests alongside components
   - Integration tests after navigation wired
   - E2E tests at the end

---

## 14. Next Steps

**If approved to proceed:**

1. **Create implementation plan document** (COMP-R01-IMPLEMENTATION-PLAN.md)
2. **Begin Phase 1: Route Setup**
3. **Create todo list** with 18 tasks from phases above
4. **Implement iteratively** with quality gates after each phase

**If clarifications needed:**

1. **Answer Questions 1-4** from Section 8.1
2. **Confirm LINE Official Account URL**
3. **Decide on resubmit action priority**
4. **Proceed once decisions made**

---

**Assessment Complete. Awaiting approval to begin implementation.**
