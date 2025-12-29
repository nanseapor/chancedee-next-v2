# COMP-R00 Implementation Plan

**Document Version:** 1.0
**Created:** 2025-12-19
**Purpose:** Detailed implementation plan for COMP-R00 Cross-Cutting Foundation
**Estimated Effort:** 10-14 days
**Complexity:** High (5-level state machine, role-based permissions, dual shell variants)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Deliverables Checklist](#2-deliverables-checklist)
3. [Phase-by-Phase Implementation](#3-phase-by-phase-implementation)
4. [Access Control State Machine](#4-access-control-state-machine)
5. [Permission Matrix](#5-permission-matrix)
6. [Shell Navigation Structure](#6-shell-navigation-structure)
7. [File Structure](#7-file-structure)
8. [Comparison with Candidate Auth](#8-comparison-with-candidate-auth)
9. [Dependencies](#9-dependencies)
10. [Testing Strategy](#10-testing-strategy)
11. [Risks & Mitigations](#11-risks--mitigations)
12. [Questions for Review](#12-questions-for-review)

---

## 1. Overview

### 1.1 Route Information

**Route:** Cross-cutting (no URL path)
**Purpose:** Foundation for all company routes (COMP-R01 through COMP-R08)
**Complexity:** High (5-level access control state machine, role-based permissions, dual shell variants)
**Estimated Effort:** 10-14 days

### 1.2 What COMP-R00 Provides

COMP-R00 is NOT a route itself - it's the **foundation layer** that all company routes depend on:

- ✅ **Access Control Framework**: 5-level state machine (auth → membership → status → role → permission)
- ✅ **Role & Permission System**: 5 roles, 7 permissions, complete permission matrix
- ✅ **Shell Components**: Minimal Shell (pending) + Company Shell (approved)
- ✅ **TypeScript Types**: All company domain types
- ✅ **Global State (Atoms)**: Company-related Jotai atoms
- ✅ **SWR Key Conventions**: Standardized cache keys
- ✅ **Navigation Structure**: Sidebar with permission-based visibility

### 1.3 Critical Success Factors

1. **State Machine Correctness** - Access control must handle all edge cases
2. **Permission Matrix Accuracy** - Role permissions must match specifications exactly
3. **Shell Performance** - Avoid unnecessary re-renders, lazy load components
4. **Type Safety** - Comprehensive TypeScript types prevent runtime errors
5. **Reusability** - All routes (R01-R08) should use these patterns without modification

---

## 2. Deliverables Checklist

### Phase 1: Type Definitions (Day 1) ✅

**Location:** `src/types/jobsmarket/company/`

- [ ] `CompanyRole` type (`admin` | `hr_manager` | `recruiter` | `interviewer` | `viewer`)
- [ ] `Permission` type (7 permission IDs)
- [ ] `CompanyStatus` type (`pending` | `approved` | `rejected` | `suspended`)
- [ ] `CompanyProfile` interface
- [ ] `TeamMember` interface
- [ ] `PendingEmployee` interface
- [ ] `CompanyAccessState` type (for state machine)
- [ ] `AccessCheckResult` interface
- [ ] `RoleBadgeConfig` interface
- [ ] Export all types from `index.ts`

**Verification:**
```bash
npm run build  # No TypeScript errors
```

---

### Phase 2: Access Control Hook (Days 2-4) ⚙️

**Location:** `src/hooks/jobsmarket/company/use-company-auth.ts`

- [ ] **Level 1: AUTH_CHECK** - Firebase auth check
  - [ ] Check `firebaseUserAtom !== null`
  - [ ] Redirect to `/auth/login` if not authenticated
- [ ] **Level 2: MEMBERSHIP_CHECK** - Company membership check
  - [ ] Check `user.companyId === params.id` OR `user.target_company === params.id`
  - [ ] Redirect to 403 if not member
- [ ] **Level 3: STATUS_CHECK** - Company status check
  - [ ] `pending` → Allow R01 only, redirect dashboard routes
  - [ ] `rejected` → Allow R01 only, redirect dashboard routes
  - [ ] `approved` → Proceed to role check
  - [ ] `suspended` → Limited access, show banner
- [ ] **Level 4: ROLE_CHECK** - User role resolution
  - [ ] Extract role from `user.roles[]`
  - [ ] Determine permission set based on role
- [ ] **Level 5: PERMISSION_CHECK** - Feature-level permission
  - [ ] Check if role has required permission
  - [ ] Either grant access or show 403/hide UI

**State Machine States:**
```typescript
export type CompanyAuthState =
  | "loading"              // Initial load
  | "auth_check"           // Checking Firebase auth
  | "redirect_login"       // Redirecting to login
  | "membership_check"     // Checking company membership
  | "redirect_403"         // Not a member, redirect
  | "status_check"         // Checking company status
  | "minimal_access"       // Pending/rejected, allow R01 only
  | "role_check"           // Approved, checking role
  | "permission_check"     // Checking feature permission
  | "ready";               // Access granted
```

**Return Type:**
```typescript
export interface CompanyAuthResult {
  state: CompanyAuthState;
  isLoading: boolean;
  isReady: boolean;
  currentUserId: string | null;
  companyId: string | null;
  companyStatus: CompanyStatus | null;
  userRole: CompanyRole | null;
  hasPermission: (permission: Permission) => boolean;
}
```

**Verification:**
```bash
npm run test:unit -- use-company-auth.test.ts
# Test all state transitions
# Test redirect behavior
# Test permission checking
```

---

### Phase 3: Permission System (Days 4-5) 🔒

**Location:** `src/lib/jobsmarket/company/permissions.ts`

- [ ] **Permission Matrix Constant**
  ```typescript
  export const ROLE_PERMISSIONS: Record<CompanyRole, Permission[]> = {
    admin: ['post_jobs', 'edit_jobs', 'view_applications', 'accept_reject', 'schedule_interviews', 'manage_team', 'company_settings'],
    hr_manager: ['post_jobs', 'edit_jobs', 'view_applications', 'accept_reject', 'schedule_interviews', 'company_settings'],
    recruiter: ['post_jobs', 'edit_jobs', 'view_applications', 'accept_reject', 'schedule_interviews'],
    interviewer: ['schedule_interviews'],  // view_applications is limited
    viewer: ['view_applications'],  // read-only
  };
  ```

- [ ] **Permission Checker Utility**
  ```typescript
  export function hasPermission(userRole: CompanyRole, permission: Permission): boolean {
    return ROLE_PERMISSIONS[userRole]?.includes(permission) ?? false;
  }
  ```

- [ ] **Role Checker Utilities**
  ```typescript
  export function isAdmin(userRoles: string[]): boolean {
    return userRoles.includes('admin');
  }

  export function canManageTeam(userRole: CompanyRole): boolean {
    return hasPermission(userRole, 'manage_team');
  }

  export function canManageSettings(userRole: CompanyRole): boolean {
    return hasPermission(userRole, 'company_settings');
  }
  ```

- [ ] **Permission Guard Component**
  ```typescript
  // src/components/jobsmarket/company/guards/RequirePermission.tsx
  export function RequirePermission({
    permission,
    fallback,
    children,
  }: {
    permission: Permission;
    fallback?: ReactNode;
    children: ReactNode;
  }): ReactNode
  ```

**Verification:**
```bash
npm run test:unit -- permissions.test.ts
# Test all role-permission combinations (5 roles × 7 permissions = 35 tests)
# Test edge cases (null role, invalid permission)
```

---

### Phase 4: Shell Components (Days 6-8) 🏗️

#### 4.1 Company Shell (Full Navigation)

**Location:** `src/components/jobsmarket/shells/CompanyShell.tsx`

**Pattern:** Follow `CandidateShell.tsx` structure

- [ ] **Desktop Layout**
  - [ ] Top Bar: Company logo (32×32), name, role badge, notification bell, user avatar
  - [ ] Sidebar: 6 navigation items with icons, badges, permission-based visibility
  - [ ] Main content area
  - [ ] Chat FAB (floating action button)

- [ ] **Mobile Layout**
  - [ ] Header: Company logo, name, notification bell, user avatar
  - [ ] Bottom tab bar: 4-5 primary navigation items
  - [ ] Chat FAB

- [ ] **Props Interface**
  ```typescript
  export interface CompanyShellProps {
    children: ReactNode;
    companyId: string;
    currentPath?: string;
  }
  ```

- [ ] **State Management**
  - [ ] Set `activeRoleAtom` to 'company' on mount
  - [ ] Fetch company data for header (name, logo)
  - [ ] Fetch user role for permission checks

**Components to Create:**

1. **CompanyTopBar.tsx** (Desktop Header)
   - [ ] Company logo + name (click → Settings)
   - [ ] Role badge (color-coded)
   - [ ] Notification bell (with unread count)
   - [ ] User avatar + dropdown menu

2. **CompanySidebar.tsx** (Desktop Navigation)
   - [ ] Navigation items (6 items, conditional based on permissions)
   - [ ] Badge counts (jobs, applications, pending team members)
   - [ ] Active state highlighting
   - [ ] Collapse/expand functionality

3. **CompanyMobileHeader.tsx** (Mobile Header)
   - [ ] Simplified header for mobile
   - [ ] Hamburger menu
   - [ ] Notification bell

4. **CompanyMobileNav.tsx** (Bottom Tab Bar)
   - [ ] 4-5 primary navigation items
   - [ ] Icon-only layout
   - [ ] Active state highlighting

5. **ChatFAB.tsx** (Floating Action Button)
   - [ ] Fixed position (bottom-right)
   - [ ] Unread badge
   - [ ] Opens chat drawer (not full navigation)

**Navigation Items (Sidebar):**

| Item | Thai Label | Route | Icon | Badge | Permission | Priority |
|------|-----------|-------|------|-------|-----------|----------|
| Dashboard | แดชบอร์ด | `/companies/[id]/dashboard` | Home | - | All roles | Primary |
| Jobs | ประกาศงาน | `/companies/[id]/dashboard/jobs` | Briefcase | Count | All roles | Primary |
| Applications | ใบสมัคร | `/companies/[id]/dashboard/applications` | FileText | Count | `view_applications` | Primary |
| Candidates | ค้นหาผู้สมัคร | `/companies/[id]/dashboard/candidates` | Search | - | Viewer+ | Primary |
| Team | ทีม | `/companies/[id]/dashboard/team` | Users | Count (pending) | `manage_team` | Secondary |
| Settings | การตั้งค่า | `/companies/[id]/dashboard/settings` | Settings | - | `company_settings` | Secondary |

**Conditional Visibility:**
```typescript
const navItems = [
  { id: 'dashboard', label: 'แดชบอร์ด', route: '/dashboard', icon: Home, visible: true },
  { id: 'jobs', label: 'ประกาศงาน', route: '/dashboard/jobs', icon: Briefcase, visible: true },
  { id: 'applications', label: 'ใบสมัคร', route: '/dashboard/applications', icon: FileText,
    visible: hasPermission(userRole, 'view_applications') },
  { id: 'candidates', label: 'ค้นหาผู้สมัคร', route: '/dashboard/candidates', icon: Search, visible: true },
  { id: 'team', label: 'ทีม', route: '/dashboard/team', icon: Users,
    visible: hasPermission(userRole, 'manage_team') },
  { id: 'settings', label: 'การตั้งค่า', route: '/dashboard/settings', icon: Settings,
    visible: hasPermission(userRole, 'company_settings') },
];
```

**Verification:**
```bash
# Run storybook (if available) or create test page
npm run dev
# Visit http://localhost:3000/test/company-shell
# Test all navigation items
# Test permission-based visibility (mock different roles)
# Test responsive design (desktop + mobile)
```

---

#### 4.2 Minimal Shell (Pending/Rejected Status)

**Location:** `src/components/jobsmarket/shells/MinimalShell.tsx`

**Used By:** COMP-R01 (Pending page) only

**Layout:**
- [ ] **Desktop & Mobile**
  - [ ] Simplified header: Company logo, name, logout button
  - [ ] NO sidebar
  - [ ] NO notification bell
  - [ ] NO chat FAB
  - [ ] Content area only

**Props Interface:**
```typescript
export interface MinimalShellProps {
  children: ReactNode;
  companyId: string;
}
```

**Header Components:**
- [ ] Company logo (32×32)
- [ ] Company name (truncated)
- [ ] Logout button (icon + text)

**Verification:**
```bash
# Test with COMP-R01 (pending page) when implemented
# Verify NO sidebar, NO chat, NO notifications
```

---

### Phase 5: Global State Management (Days 8-9) 📦

**Location:** `src/store/jobsmarket/company-atoms.ts`

- [ ] **Company Atoms**
  ```typescript
  // Current company data cache (for header, dashboard)
  export const companyAtom = atom<CompanyProfile | null>(null);

  // Draft state during editing (for settings page)
  export const editCompanyAtom = atom<CompanyProfile | null>(null);

  // Shell UI state
  export const companySidebarOpenAtom = atom<boolean>(true);  // Desktop sidebar
  export const companySidebarLoadingAtom = atom<boolean>(false);

  // Badge counts (for navigation items)
  export const jobCountsAtom = atom<{ active: number; draft: number; total: number } | null>(null);
  export const applicationCountsAtom = atom<{ unread: number; total: number } | null>(null);
  export const pendingEmployeeCountAtom = atom<number>(0);
  ```

- [ ] **Atom Guidelines**
  - [ ] `companyAtom`: Read everywhere, write only on SWR revalidation
  - [ ] `editCompanyAtom`: Read/write only in settings form
  - [ ] Badge atoms: Update on navigation, mutations

**SWR Key Factory:**

**Location:** `src/lib/jobsmarket/company/swr-keys.ts`

```typescript
export const companyKeys = {
  // Company data
  company: (id: string) => `company-${id}`,

  // Jobs
  jobs: (id: string) => `company-jobs-${id}`,
  jobCounts: (id: string) => `company-job-counts-${id}`,

  // Applications
  applications: (id: string) => `company-applications-${id}`,
  applicationCounts: (id: string) => `company-application-counts-${id}`,

  // Team
  staff: (id: string) => `company-staff-${id}`,
  pendingEmployees: (id: string) => `pending-employees-${id}`,
  adminCount: (id: string) => `admin-count-${id}`,

  // Settings
  addresses: (id: string) => `company-addresses-${id}`,

  // Analytics
  analytics: (id: string) => `company-analytics-${id}`,

  // Invalidate all company-related keys
  all: (id: string) => (key: string) => key.startsWith(`company-${id}`) || key.includes(id),
};
```

**Usage Pattern:**
```typescript
import { companyKeys } from '@/lib/jobsmarket/company/swr-keys';
import useSWR from 'swr';

// Fetch company data
const { data: company } = useSWR(
  companyId ? companyKeys.company(companyId) : null,
  () => getCompanyById(companyId)
);

// Invalidate after mutation
await mutate(companyKeys.company(companyId));

// Bulk invalidate all company keys
await mutate(companyKeys.all(companyId));
```

**Verification:**
```bash
npm run test:unit -- swr-keys.test.ts
# Test key generation
# Test bulk invalidation pattern
```

---

### Phase 6: Testing (Days 9-10) 🧪

#### 6.1 Unit Tests

**Location:** `tests/unit/jobsmarket/company/`

- [ ] **`permissions.test.ts`** - Permission matrix tests
  - [ ] Test all role-permission combinations (35 tests)
  - [ ] Test `hasPermission()` utility
  - [ ] Test role checker utilities
  - [ ] Test invalid inputs (null, undefined)

- [ ] **`use-company-auth.test.ts`** - Access control hook tests
  - [ ] Test state transitions (10+ states)
  - [ ] Test redirect behavior
  - [ ] Test membership check (owner + pending)
  - [ ] Test status check (4 statuses)
  - [ ] Test role resolution
  - [ ] Test permission checking

- [ ] **`swr-keys.test.ts`** - SWR key factory tests
  - [ ] Test key generation patterns
  - [ ] Test bulk invalidation
  - [ ] Test uniqueness

- [ ] **`company-atoms.test.ts`** - Atom behavior tests
  - [ ] Test atom read/write
  - [ ] Test derived atoms
  - [ ] Test atom updates

**Coverage Target:** 90%+ for all utility functions and hooks

**Run Tests:**
```bash
npm run test:unit -- company/
npm run test:unit:coverage -- company/
```

---

#### 6.2 Integration Tests

**Location:** `tests/integration/jobsmarket/company/`

- [ ] **`access-control.test.ts`** - End-to-end access control flow
  - [ ] Test full auth flow (auth → membership → status → role → permission)
  - [ ] Test with real dev database (user, company data)
  - [ ] Test all redirect scenarios
  - [ ] Test permission-based UI visibility

**Run Tests:**
```bash
npx vitest run --config vitest.integration.config.ts tests/integration/jobsmarket/company/
```

---

#### 6.3 Component Tests (Storybook or Test Page)

**Option A: Storybook Stories**

**Location:** `src/components/jobsmarket/shells/*.stories.tsx`

- [ ] `CompanyShell.stories.tsx`
  - [ ] Story: Admin role (all nav items visible)
  - [ ] Story: HR Manager role (team hidden)
  - [ ] Story: Recruiter role (team + settings hidden)
  - [ ] Story: Interviewer role (limited nav)
  - [ ] Story: Viewer role (minimal nav)
  - [ ] Story: Mobile layout
  - [ ] Story: Badge counts (jobs, applications, pending team)

- [ ] `MinimalShell.stories.tsx`
  - [ ] Story: Pending status
  - [ ] Story: Rejected status

**Option B: Test Page**

**Location:** `src/app/test/company-shell/page.tsx`

Create a test page to manually verify:
- [ ] Company Shell renders
- [ ] Navigation items show/hide based on role
- [ ] Badge counts update
- [ ] Responsive design works
- [ ] Chat FAB appears

**Run:**
```bash
npm run dev
# Visit http://localhost:3000/test/company-shell
```

---

## 3. Phase-by-Phase Implementation

### Day 1: Type Definitions ✅

**Tasks:**
1. Create `src/types/jobsmarket/company/` directory
2. Create `company.ts` with all type definitions (see Phase 1)
3. Create `permissions.ts` with enums
4. Create `index.ts` to export all types
5. Run `npm run build` to verify no TypeScript errors

**Output:**
- All company domain types available for import
- No build errors

---

### Days 2-4: Access Control Hook ⚙️

**Tasks:**
1. Create `src/hooks/jobsmarket/company/` directory
2. Implement `use-company-auth.ts` (see Phase 2)
   - Day 2: Levels 1-2 (auth + membership)
   - Day 3: Levels 3-4 (status + role)
   - Day 4: Level 5 (permission) + refine
3. Write unit tests for hook
4. Test all state transitions manually

**Output:**
- `useCompanyAuth(companyId, permission?)` hook ready
- Returns: `{ state, isLoading, isReady, userRole, hasPermission() }`
- All tests passing (90%+ coverage)

**Pattern Reference:**
```typescript
// Usage in route component
const { state, isReady, userRole, hasPermission } = useCompanyAuth(companyId);

if (!isReady) {
  return <LoadingSpinner />;
}

// Permission check
if (!hasPermission('manage_team')) {
  return <Forbidden403 />;
}

// Render page
return <TeamManagementPage />;
```

---

### Days 4-5: Permission System 🔒

**Tasks:**
1. Create `src/lib/jobsmarket/company/permissions.ts`
2. Implement permission matrix (see Phase 3)
3. Implement utility functions
4. Create `RequirePermission` guard component
5. Write unit tests (35+ test cases)

**Output:**
- Permission matrix available
- Utility functions: `hasPermission()`, `isAdmin()`, etc.
- `<RequirePermission>` component ready
- All tests passing

**Pattern Reference:**
```typescript
// In component
import { RequirePermission } from '@/components/jobsmarket/company/guards/RequirePermission';

function TeamManagementButton() {
  return (
    <RequirePermission permission="manage_team" fallback={null}>
      <Button>จัดการทีม</Button>
    </RequirePermission>
  );
}
```

---

### Days 6-8: Shell Components 🏗️

**Day 6: Company Shell Structure**
1. Create `src/components/jobsmarket/shells/CompanyShell.tsx`
2. Implement layout (top bar + sidebar + content)
3. Add responsive behavior (desktop/mobile)
4. Add `activeRoleAtom` update on mount

**Day 7: Navigation Components**
1. Create `CompanySidebar.tsx` (6 navigation items)
2. Create `CompanyTopBar.tsx` (header components)
3. Implement permission-based visibility
4. Add badge counts (jobs, applications, team)

**Day 8: Mobile & Minimal Shell**
1. Create `CompanyMobileHeader.tsx`
2. Create `CompanyMobileNav.tsx` (bottom tabs)
3. Create `ChatFAB.tsx`
4. Create `MinimalShell.tsx`
5. Test all shell variants

**Output:**
- `CompanyShell` component ready (desktop + mobile)
- `MinimalShell` component ready
- All navigation items render with correct permissions
- Badge counts display correctly
- Chat FAB appears

---

### Days 8-9: State Management 📦

**Tasks:**
1. Create `src/store/jobsmarket/company-atoms.ts`
2. Implement all atoms (see Phase 5)
3. Create `src/lib/jobsmarket/company/swr-keys.ts`
4. Implement SWR key factory
5. Write tests for atoms and keys

**Output:**
- Company atoms available
- SWR key factory ready
- Cache invalidation patterns documented

---

### Days 9-10: Testing 🧪

**Day 9: Unit Tests**
1. Write all unit tests (see Phase 6.1)
2. Achieve 90%+ coverage
3. Fix any bugs found

**Day 10: Integration Tests + Manual Testing**
1. Write integration tests (see Phase 6.2)
2. Create Storybook stories or test page
3. Manually test all shell variants
4. Manually test permission-based visibility
5. Test responsive design

**Output:**
- All tests passing
- Coverage ≥ 90%
- Manual verification complete

---

## 4. Access Control State Machine

### 4.1 Complete State Diagram

```
┌──────────────────────────────────────────────────────┐
│                    ENTRY POINT                       │
│                    (page load)                       │
└─────────────────────┬────────────────────────────────┘
                      │
                      ▼
            ┌─────────────────────┐
            │      loading        │
            └──────────┬──────────┘
                      │
                      ▼
            ┌─────────────────────┐
            │    auth_check       │◄────── Check firebaseUserAtom
            └──────────┬──────────┘
                      │
         ┌────────────┴────────────┐
         │                         │
         ▼ (NOT_AUTH)              ▼ (AUTHENTICATED)
┌──────────────────┐      ┌────────────────────┐
│ redirect_login   │      │ membership_check   │◄── Check user.companyId === id
│ → /auth/login    │      └─────────┬──────────┘
└──────────────────┘                │
                       ┌────────────┴────────────┐
                       │                         │
                       ▼ (NOT_MEMBER)            ▼ (IS_MEMBER)
              ┌──────────────────┐      ┌────────────────────┐
              │  redirect_403    │      │   status_check     │◄── Check company.status
              │  → 403 or home   │      └─────────┬──────────┘
              └──────────────────┘                │
                                    ┌─────────────┼─────────────┬─────────────┐
                                    │             │             │             │
                                    ▼ (PENDING)   ▼ (REJECTED)  ▼ (APPROVED)  ▼ (SUSPENDED)
                          ┌──────────────┐ ┌──────────────┐ ┌──────────┐ ┌──────────────┐
                          │minimal_access│ │minimal_access│ │role_check│ │limited_access│
                          │→ R01 only    │ │→ R01 only    │ └────┬─────┘ │(read-only)   │
                          └──────────────┘ └──────────────┘      │        └──────────────┘
                                                                  │
                                                                  ▼
                                                      ┌────────────────────┐
                                                      │ permission_check   │◄── hasPermission(role, perm)
                                                      └─────────┬──────────┘
                                                                │
                                              ┌─────────────────┴─────────────────┐
                                              │                                   │
                                              ▼ (HAS_PERMISSION)                  ▼ (NO_PERMISSION)
                                    ┌──────────────────┐                ┌──────────────────┐
                                    │      ready       │                │    show_403      │
                                    │  (render page)   │                │  or hide UI      │
                                    └──────────────────┘                └──────────────────┘
```

### 4.2 State Transition Table (Complete)

| Current State | Event | Next State | Guard Condition | Side Effects |
|---------------|-------|------------|-----------------|--------------|
| `loading` | `INIT` | `auth_check` | - | - |
| `auth_check` | `NOT_AUTHENTICATED` | `redirect_login` | `!firebaseUser` | `router.push('/auth/login?from=...')` |
| `auth_check` | `AUTHENTICATED` | `membership_check` | `firebaseUser !== null` | Fetch user data |
| `membership_check` | `NOT_MEMBER` | `redirect_403` | `user.companyId !== id && user.target_company !== id` | Show 403 or redirect |
| `membership_check` | `IS_MEMBER` | `status_check` | `user.companyId === id OR user.target_company === id` | Fetch company data |
| `status_check` | `IS_PENDING` | `minimal_access` | `company.status === 'pending'` | Redirect dashboard → `/companies/[id]/pending` |
| `status_check` | `IS_REJECTED` | `minimal_access` | `company.status === 'rejected'` | Redirect dashboard → `/companies/[id]/pending` |
| `status_check` | `IS_APPROVED` | `role_check` | `company.status === 'approved'` | Extract role from user.roles |
| `status_check` | `IS_SUSPENDED` | `limited_access` | `company.status === 'suspended'` | Show suspended banner, read-only |
| `role_check` | `ROLE_FOUND` | `permission_check` | `user.roles.includes('admin' | 'hr_manager' | ...)` | Set userRole |
| `permission_check` | `HAS_PERMISSION` | `ready` | `hasPermission(userRole, requiredPerm)` | Render page |
| `permission_check` | `NO_PERMISSION` | `show_403` | `!hasPermission(userRole, requiredPerm)` | Show 403 or hide UI |

### 4.3 Membership Check Special Case (COMP-R01)

**For COMP-R01 (Pending page) ONLY:**
- Allow access if `user.companyId === id` **OR** `user.target_company === id`
- Rationale: User may be pending approval, so `companyId` is null but `target_company` is set

**For all other routes (R02-R08):**
- Require `user.companyId === id` (already a member)

---

## 5. Permission Matrix

### 5.1 Complete Role-Permission Table

| Permission ID | Admin | HR Manager | Recruiter | Interviewer | Viewer |
|---------------|-------|-----------|-----------|-------------|--------|
| `post_jobs` | ✓ | ✓ | ✓ | ✗ | ✗ |
| `edit_jobs` | ✓ | ✓ | ✓ | ✗ | ✗ |
| `view_applications` | ✓ | ✓ | ✓ | Limited* | ✓ |
| `accept_reject` | ✓ | ✓ | ✓ | ✗ | ✗ |
| `schedule_interviews` | ✓ | ✓ | ✓ | ✓ | ✗ |
| `manage_team` | ✓ | ✗ | ✗ | ✗ | ✗ |
| `company_settings` | ✓ | ✓ | ✗ | ✗ | ✗ |

**Notes:**
- *Limited: Interviewer can only view applications assigned to them (not all applications)

### 5.2 Role Hierarchy

```
Admin (highest authority)
  ↓
HR Manager (all permissions except team management)
  ↓
Recruiter (job + application management)
  ↓
Interviewer (scheduling only, limited view)
  ↓
Viewer (read-only, lowest authority)
```

### 5.3 Permission Use Cases by Route

| Route | Required Permission | Fallback Behavior |
|-------|---------------------|-------------------|
| COMP-R01 (Pending) | None (status-based) | - |
| COMP-R02 (Team) | `manage_team` | Show view-only Members tab |
| COMP-R03 (Settings) | `company_settings` (Profile/Config tabs) | Show 403 or Analytics tab only |
| COMP-R04 (Dashboard) | None (all roles) | - |
| COMP-R05 (Jobs List) | None (all roles) | - |
| COMP-R06 (Create Job) | `post_jobs` | Show 403 |
| COMP-R07 (Job Detail) | `edit_jobs` (edit mode) | View mode only |
| COMP-R08 (Applications) | `view_applications` | Show 403 |
| COMP-R08 (Accept/Reject) | `accept_reject` | Hide action buttons |

---

## 6. Shell Navigation Structure

### 6.1 Company Shell (Full Navigation)

**Desktop Layout:**
```
┌────────────────────────────────────────────────────────────────┐
│ [Logo] Company Name            [Role]  [🔔]  [User Avatar ▾]  │  ← Top Bar
├────────────┬───────────────────────────────────────────────────┤
│            │                                                   │
│ Dashboard  │                                                   │
│ Jobs (3)   │                                                   │  ← Sidebar
│ Apps (12)  │           Page Content                            │     (6 items)
│ Candidates │                                                   │
│ Team (2)   │                                                   │
│ Settings   │                                                   │
│            │                                                   │
└────────────┴───────────────────────────────────────────────────┘
                                                          [💬] ← Chat FAB
```

**Mobile Layout:**
```
┌────────────────────────────────────────┐
│ [☰] Company Name        [🔔] [Avatar]  │  ← Mobile Header
├────────────────────────────────────────┤
│                                        │
│                                        │
│        Page Content                    │
│                                        │
│                                        │
├────────────────────────────────────────┤
│ [🏠] [💼] [📄] [🔍] [⚙️]               │  ← Bottom Tabs
└────────────────────────────────────────┘
                                    [💬] ← Chat FAB
```

### 6.2 Navigation Item Specifications

| Item | Thai | Route | Icon | Badge | Permission | Show When |
|------|------|-------|------|-------|-----------|-----------|
| Dashboard | แดชบอร์ด | `/companies/[id]/dashboard` | Home | - | All | Always |
| Jobs | ประกาศงาน | `/companies/[id]/dashboard/jobs` | Briefcase | Count | All | Always |
| Applications | ใบสมัคร | `/companies/[id]/dashboard/applications` | FileText | Unread | `view_applications` | Has permission |
| Candidates | ค้นหาผู้สมัคร | `/companies/[id]/dashboard/candidates` | Search | - | Viewer+ | Always |
| Team | ทีม | `/companies/[id]/dashboard/team` | Users | Pending | `manage_team` | Has permission |
| Settings | การตั้งค่า | `/companies/[id]/dashboard/settings` | Settings | - | `company_settings` | Has permission |

**Badge Counts:**
- Jobs: Active job count (from `jobCountsAtom`)
- Applications: Unread application count (from `applicationCountsAtom`)
- Team: Pending employee requests (from `pendingEmployeeCountAtom`)

### 6.3 Minimal Shell (Pending/Rejected)

**Desktop & Mobile Layout:**
```
┌────────────────────────────────────────┐
│ [Logo] Company Name      [Logout]      │  ← Minimal Header
├────────────────────────────────────────┤
│                                        │
│                                        │
│        Page Content (R01 only)         │
│                                        │
│                                        │
└────────────────────────────────────────┘
```

**Restrictions:**
- NO sidebar navigation
- NO notification bell
- NO chat FAB
- NO user avatar dropdown
- ONLY logout button

---

## 7. File Structure

### 7.1 Complete Directory Tree

```
src/
├── types/
│   └── jobsmarket/
│       └── company/
│           ├── company.ts          # CompanyProfile, CompanyStatus types
│           ├── permissions.ts      # CompanyRole, Permission types
│           ├── team.ts             # TeamMember, PendingEmployee types
│           ├── access.ts           # AccessCheckResult, CompanyAuthState types
│           └── index.ts            # Export all
│
├── hooks/
│   └── jobsmarket/
│       └── company/
│           ├── use-company-auth.ts       # Main access control hook
│           ├── use-company-role.ts       # Role resolution hook
│           ├── use-company-permissions.ts # Permission checking hook
│           └── index.ts                  # Export all
│
├── lib/
│   └── jobsmarket/
│       └── company/
│           ├── permissions.ts      # Permission matrix, hasPermission()
│           ├── swr-keys.ts         # SWR key factory
│           └── index.ts            # Export all
│
├── components/
│   └── jobsmarket/
│       └── company/
│           ├── shells/
│           │   ├── CompanyShell.tsx         # Main company layout
│           │   ├── MinimalShell.tsx         # Pending/rejected layout
│           │   ├── CompanyTopBar.tsx        # Desktop header
│           │   ├── CompanySidebar.tsx       # Desktop sidebar
│           │   ├── CompanyMobileHeader.tsx  # Mobile header
│           │   ├── CompanyMobileNav.tsx     # Mobile bottom tabs
│           │   ├── ChatFAB.tsx              # Floating action button
│           │   └── index.ts                 # Export all
│           │
│           ├── guards/
│           │   ├── RequirePermission.tsx    # Permission guard component
│           │   └── index.ts
│           │
│           ├── navigation/
│           │   ├── NavItem.tsx              # Sidebar nav item
│           │   ├── NavBadge.tsx             # Badge component
│           │   └── index.ts
│           │
│           └── shared/
│               ├── RoleBadge.tsx            # Color-coded role badge
│               ├── StatusBadge.tsx          # Company status badge
│               └── index.ts
│
├── store/
│   └── jobsmarket/
│       ├── company-atoms.ts        # Company-related Jotai atoms
│       └── index.ts
│
└── app/
    └── jobsmarket/
        └── companies/
            └── [id]/
                └── layout.tsx      # Wraps all company routes with CompanyShell
```

### 7.2 Import Pattern Example

```typescript
// In a company route component
import { useCompanyAuth } from '@/hooks/jobsmarket/company';
import { hasPermission } from '@/lib/jobsmarket/company/permissions';
import { RequirePermission } from '@/components/jobsmarket/company/guards';
import type { CompanyRole, Permission } from '@/types/jobsmarket/company';

function TeamManagementPage({ params }: { params: { id: string } }) {
  const { isReady, userRole, hasPermission } = useCompanyAuth(params.id);

  if (!isReady) return <LoadingSpinner />;

  return (
    <RequirePermission permission="manage_team" fallback={<Forbidden403 />}>
      <TeamManagementContent role={userRole} />
    </RequirePermission>
  );
}
```

---

## 8. Comparison with Candidate Auth

### 8.1 Side-by-Side Comparison

| Aspect | Candidate (CAND-R00) | Company (COMP-R00) |
|--------|---------------------|-------------------|
| **Auth Levels** | 2 (auth + ownership) | 5 (auth → membership → status → role → permission) |
| **State Machine Complexity** | Simple (4 states) | Complex (11 states) |
| **Ownership Check** | `candidateId === currentUserId` | `user.companyId === id` OR `user.target_company === id` |
| **Roles** | None | 5 roles (admin, hr_manager, recruiter, interviewer, viewer) |
| **Permissions** | None | 7 permissions |
| **Permission Matrix** | N/A | 5×7 matrix (35 combinations) |
| **Shell Variants** | 1 (CandidateShell) | 2 (CompanyShell + MinimalShell) |
| **Status Check** | Onboarding only | Company status (4 states: pending, approved, rejected, suspended) |
| **Redirect Logic** | Simple (own resource) | Complex (status-based, permission-based) |
| **Multi-User** | Single user (own profile) | Multi-user (team members, pending employees) |
| **Navigation** | 4 items | 6 items (permission-based visibility) |

### 8.2 Code Pattern Differences

**Candidate Auth (Simple):**
```typescript
// CAND-R00 pattern
const { isReady, currentUserId } = useCandidateAuth(candidateId);

if (!isReady) return <LoadingSpinner />;
if (candidateId !== currentUserId) return null; // redirected

return <DashboardContent />;
```

**Company Auth (Complex):**
```typescript
// COMP-R00 pattern
const { isReady, userRole, companyStatus, hasPermission } = useCompanyAuth(companyId);

if (!isReady) return <LoadingSpinner />;

// Status check
if (companyStatus === 'pending') return <PendingPage />;
if (companyStatus === 'suspended') return <SuspendedBanner />;

// Permission check
if (!hasPermission('manage_team')) return <Forbidden403 />;

return <TeamManagementContent role={userRole} />;
```

### 8.3 Reusable Patterns from Candidate Auth

✅ **Can Reuse:**
- State machine pattern (useEffect + setState)
- Redirect logic (router.push)
- Loading state handling
- Shell layout structure (top bar + sidebar + content)
- Jotai atom patterns
- SWR key factory pattern

❌ **Cannot Reuse:**
- Permission checking logic (candidate has none)
- Role resolution logic (candidate has no roles)
- Status-based access control (candidate only has onboarding check)
- Multi-user access patterns (candidate is single-user)

---

## 9. Dependencies

### 9.1 Requires (Must Exist Before Starting)

- ✅ **Firebase Auth** - `firebaseUserAtom` from `src/store/jobsmarket/global-atoms.ts`
- ✅ **Session State** - `sessionStateAtom` from global atoms
- ✅ **User Data** - `userAtom` or equivalent (with `companyId`, `roles[]`, `target_company`)
- ✅ **Company Information Entity** - `src/lib/database/actions/company-information.ts` (already exists)
- ✅ **Jotai** - Already installed
- ✅ **SWR** - Already installed
- ✅ **shadcn/ui Components** - Button, Badge, Sheet, Separator, etc.

### 9.2 Creates Foundation For (Blocked Until R00 Complete)

- 🔒 **COMP-R01** (Pending page) - Uses MinimalShell, access control
- 🔒 **COMP-R02** (Team management) - Uses CompanyShell, `manage_team` permission
- 🔒 **COMP-R03** (Settings) - Uses CompanyShell, `company_settings` permission
- 🔒 **COMP-R04** (Dashboard) - Uses CompanyShell, all roles
- 🔒 **COMP-R05** (Jobs list) - Uses CompanyShell, all roles
- 🔒 **COMP-R06** (Create job) - Uses CompanyShell, `post_jobs` permission
- 🔒 **COMP-R07** (Job detail) - Uses CompanyShell, `edit_jobs` permission
- 🔒 **COMP-R08** (Applications) - Uses CompanyShell, `view_applications`, `accept_reject` permissions

### 9.3 External Dependencies (npm packages)

**Already Installed:**
- `react` (v19)
- `next` (v16)
- `jotai` (v2)
- `swr` (v2)
- `lucide-react` (icons)
- `tailwindcss` (styling)

**No New Dependencies Needed** ✅

---

## 10. Testing Strategy

### 10.1 Unit Tests (Target: 90%+ Coverage)

**Location:** `tests/unit/jobsmarket/company/`

**Files to Create:**

1. **`permissions.test.ts`** (35+ tests)
   ```typescript
   describe('Permission Matrix', () => {
     describe('Admin Role', () => {
       test('should have all 7 permissions', () => { /* ... */ });
       test('should have post_jobs permission', () => { /* ... */ });
       // ... 7 tests for admin
     });

     describe('HR Manager Role', () => {
       test('should have 6 permissions', () => { /* ... */ });
       test('should NOT have manage_team permission', () => { /* ... */ });
       // ... 7 tests for hr_manager
     });

     // ... Same for recruiter, interviewer, viewer (5 roles × 7 permissions = 35 tests)
   });

   describe('hasPermission()', () => {
     test('should return true for valid permission', () => { /* ... */ });
     test('should return false for invalid permission', () => { /* ... */ });
     test('should handle null role', () => { /* ... */ });
     test('should handle undefined permission', () => { /* ... */ });
   });
   ```

2. **`use-company-auth.test.ts`** (20+ tests)
   ```typescript
   describe('useCompanyAuth Hook', () => {
     describe('State Transitions', () => {
       test('should start in loading state', () => { /* ... */ });
       test('should transition to auth_check', () => { /* ... */ });
       test('should redirect to login if not authenticated', () => { /* ... */ });
       test('should transition to membership_check if authenticated', () => { /* ... */ });
       test('should redirect to 403 if not member', () => { /* ... */ });
       test('should transition to status_check if member', () => { /* ... */ });
       test('should allow minimal access if pending', () => { /* ... */ });
       test('should allow minimal access if rejected', () => { /* ... */ });
       test('should transition to role_check if approved', () => { /* ... */ });
       test('should transition to ready if permission granted', () => { /* ... */ });
       test('should show 403 if permission denied', () => { /* ... */ });
     });

     describe('Membership Check', () => {
       test('should allow access if user.companyId === id', () => { /* ... */ });
       test('should allow access if user.target_company === id (pending)', () => { /* ... */ });
       test('should deny access if neither matches', () => { /* ... */ });
     });

     describe('Permission Check', () => {
       test('should grant access if role has permission', () => { /* ... */ });
       test('should deny access if role lacks permission', () => { /* ... */ });
     });
   });
   ```

3. **`swr-keys.test.ts`** (10+ tests)
   ```typescript
   describe('SWR Key Factory', () => {
     test('should generate company key', () => {
       expect(companyKeys.company('abc123')).toBe('company-abc123');
     });

     test('should generate jobs key', () => {
       expect(companyKeys.jobs('abc123')).toBe('company-jobs-abc123');
     });

     // ... Test all key patterns

     test('should match keys for bulk invalidation', () => {
       const matcher = companyKeys.all('abc123');
       expect(matcher('company-abc123')).toBe(true);
       expect(matcher('company-jobs-abc123')).toBe(true);
       expect(matcher('company-xyz789')).toBe(false);
     });
   });
   ```

**Run Commands:**
```bash
# Run all unit tests
npm run test:unit -- company/

# Run with coverage
npm run test:unit:coverage -- company/

# Watch mode
npm run test:unit:watch -- company/
```

**Coverage Target:**
- Functions: 90%+
- Branches: 85%+
- Lines: 90%+
- Statements: 90%+

---

### 10.2 Integration Tests

**Location:** `tests/integration/jobsmarket/company/`

**Files to Create:**

1. **`access-control.test.ts`** (End-to-end access flow)
   ```typescript
   describe('Company Access Control Integration', () => {
     beforeEach(async () => {
       // Setup: Create test user, test company in dev database
     });

     afterEach(async () => {
       // Cleanup: Remove test data
     });

     test('should allow admin to access all routes', async () => {
       // Simulate admin user accessing dashboard, team, settings
     });

     test('should prevent viewer from accessing team management', async () => {
       // Simulate viewer user trying to access team page
     });

     test('should redirect pending company to R01', async () => {
       // Simulate pending company accessing dashboard
     });

     test('should allow pending user via target_company', async () => {
       // Simulate user with target_company set accessing pending page
     });
   });
   ```

**Run Commands:**
```bash
# Run integration tests
npx vitest run --config vitest.integration.config.ts tests/integration/jobsmarket/company/
```

---

### 10.3 Component Tests (Storybook or Manual)

**Option A: Storybook Stories**

**Location:** `src/components/jobsmarket/shells/*.stories.tsx`

**Files to Create:**

1. **`CompanyShell.stories.tsx`**
   ```typescript
   export default {
     title: 'Jobsmarket/Company/Shells/CompanyShell',
     component: CompanyShell,
   };

   export const AdminRole = {
     args: {
       companyId: 'test-company',
       // Mock user with admin role
     },
   };

   export const HRManagerRole = { /* ... */ };
   export const RecruiterRole = { /* ... */ };
   export const InterviewerRole = { /* ... */ };
   export const ViewerRole = { /* ... */ };
   export const MobileLayout = { /* ... */ };
   ```

2. **`MinimalShell.stories.tsx`**
   ```typescript
   export const PendingStatus = { /* ... */ };
   export const RejectedStatus = { /* ... */ };
   ```

**Run:**
```bash
npm run storybook
# Visit http://localhost:6006
```

**Option B: Test Page**

**Location:** `src/app/test/company-shell/page.tsx`

```typescript
"use client";

import { useState } from 'react';
import { CompanyShell } from '@/components/jobsmarket/shells/CompanyShell';
import type { CompanyRole } from '@/types/jobsmarket/company';

export default function TestCompanyShellPage() {
  const [role, setRole] = useState<CompanyRole>('admin');

  return (
    <div>
      <div className="p-4 bg-gray-100">
        <h1>Company Shell Test Page</h1>
        <select value={role} onChange={(e) => setRole(e.target.value as CompanyRole)}>
          <option value="admin">Admin</option>
          <option value="hr_manager">HR Manager</option>
          <option value="recruiter">Recruiter</option>
          <option value="interviewer">Interviewer</option>
          <option value="viewer">Viewer</option>
        </select>
      </div>
      <CompanyShell companyId="test-company">
        <div className="p-8">
          <h2>Test Content</h2>
          <p>Role: {role}</p>
        </div>
      </CompanyShell>
    </div>
  );
}
```

**Run:**
```bash
npm run dev
# Visit http://localhost:3000/test/company-shell
```

---

## 11. Risks & Mitigations

### 11.1 Risk Matrix

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Complex state machine has bugs** | High | Medium | Comprehensive unit tests (20+ tests), state diagram documentation |
| **Permission edge cases missed** | High | Medium | Test all 35 role-permission combinations, manual review |
| **Shell performance issues** | Medium | Low | Lazy load navigation items, memoize components, profiling |
| **TypeScript type mismatches** | Medium | Low | Strict TypeScript config, build verification |
| **Inconsistent patterns across routes** | High | Medium | Detailed documentation, code reviews, reusable components |
| **Access control bypass** | Critical | Low | Security review, integration tests, manual testing |
| **Badge count queries slow** | Medium | Medium | SWR caching (5 min), pagination, optimize queries |
| **Mobile UI not responsive** | Medium | Low | Test on multiple devices, use responsive utilities |

### 11.2 Mitigation Strategies

**For State Machine Bugs:**
- Write exhaustive unit tests for all transitions
- Create state diagram documentation (visual reference)
- Manual testing of all paths
- Code review with focus on edge cases

**For Permission Errors:**
- Test matrix table (5 roles × 7 permissions = 35 tests)
- Create permission matrix documentation
- Manual testing with different role accounts
- Security review before production

**For Performance Issues:**
- Lazy load navigation items (React.lazy)
- Memoize shell components (React.memo)
- SWR caching with appropriate revalidation
- Profile with React DevTools Profiler

**For Type Safety:**
- Enable strict TypeScript mode
- Run `npm run build` frequently
- Use type guards for runtime checks
- Document all type interfaces

---

## 12. Questions for Review

### 12.1 Clarifications Needed

1. **User Data Structure**
   - ❓ Does `userAtom` or `user` object already include `companyId` and `roles[]`?
   - ❓ Where is `target_company` stored (for pending employees)?
   - ❓ Should we fetch user data from `userAtom` or via SWR?

2. **Company Data Access**
   - ❓ Do we have a server action `getCompanyById(id)` for fetching company profile?
   - ❓ Should we fetch company data via SWR or use `companyAtom` directly?
   - ❓ What fields are available in `CompanyProfile` from existing actions?

3. **Badge Count Queries**
   - ❓ Do we need to create new server actions for badge counts (jobs, applications, pending team)?
   - ❓ Should badge counts update real-time or on navigation?
   - ❓ What is acceptable latency for badge count queries?

4. **Chat Integration**
   - ❓ Does chat drawer component already exist?
   - ❓ Should Chat FAB be implemented in R00 or deferred to R08?
   - ❓ What is the chat drawer state management pattern?

5. **Role Switcher**
   - ❓ Should we implement role switcher in R00 (for multi-role users)?
   - ❓ Or defer to future implementation?
   - ❓ How do we detect if user has both candidate + company roles?

### 12.2 Implementation Approach Questions

1. **Should we create a separate `useCompanyShell` hook?**
   - To encapsulate shell state logic (sidebar open/close, badge counts)

2. **Should we lazy load shell navigation components?**
   - `React.lazy(() => import('./CompanySidebar'))` for performance

3. **Should we create a shared `<Shell>` base component?**
   - To reduce duplication between `CompanyShell` and `CandidateShell`

4. **Should we implement Storybook stories or test page?**
   - Or both?

5. **Should we implement accessibility (ARIA) in R00?**
   - Or defer to route implementation?

### 12.3 Testing Strategy Questions

1. **Should integration tests use Firebase emulator or real dev database?**
   - RIS specifies real dev database, but setup may be complex

2. **Should we test permission matrix exhaustively (35 tests)?**
   - Or sample testing (10-15 key combinations)?

3. **Should E2E tests for access control span multiple routes?**
   - Example: Login → Dashboard (R04) → Team (R02, permission check)

4. **What is acceptable test coverage for shell components?**
   - Aim for 90%+ like hooks, or lower threshold?

---

## 13. Acceptance Criteria

### 13.1 Definition of "COMP-R00 Complete"

COMP-R00 is complete when **ALL** of the following are true:

**Quality Gates:**
- [ ] ✅ Gate 1: `npm run build` → exits with code 0 (no TypeScript errors)
- [ ] ✅ Gate 2: `npm run lint` → no errors (warnings OK)
- [ ] ✅ Gate 4a: Unit tests → All passing, coverage ≥ 90%

**Deliverables:**
- [ ] ✅ All TypeScript types defined and exported
- [ ] ✅ `useCompanyAuth` hook implemented and tested
- [ ] ✅ Permission matrix implemented and tested
- [ ] ✅ `CompanyShell` component renders correctly (desktop + mobile)
- [ ] ✅ `MinimalShell` component renders correctly
- [ ] ✅ All 6 navigation items show/hide based on permissions
- [ ] ✅ Badge counts display correctly (jobs, applications, team)
- [ ] ✅ SWR key factory implemented and tested
- [ ] ✅ Company atoms defined

**Functional Verification:**
- [ ] ✅ Access control state machine handles all 11 states correctly
- [ ] ✅ Permission checks work for all 5 roles
- [ ] ✅ Membership check allows both `companyId` and `target_company`
- [ ] ✅ Status check redirects pending/rejected to R01
- [ ] ✅ Navigation items hide for roles without permission
- [ ] ✅ Shell switches between desktop/mobile layouts responsively

**Test Evidence:**
```
Unit Test Coverage:
File                         | % Stmts | % Branch | % Funcs | % Lines |
-----------------------------|---------|----------|---------|---------|
use-company-auth.ts          |   95.2  |   92.3   |  100    |   95.2  |
permissions.ts               |  100    |  100     |  100    |  100    |
swr-keys.ts                  |  100    |  100     |  100    |  100    |
-----------------------------|---------|----------|---------|---------|
All files                    |   96.5  |   94.1   |  100    |   96.5  |

Unit Test Results:
✓ tests/unit/jobsmarket/company/permissions.test.ts (35 tests)
✓ tests/unit/jobsmarket/company/use-company-auth.test.ts (20 tests)
✓ tests/unit/jobsmarket/company/swr-keys.test.ts (10 tests)
Test Files  3 passed (3)
Tests       65 passed (65)
```

**Manual Verification:**
- [ ] ✅ Visited test page: http://localhost:3000/test/company-shell
- [ ] ✅ Tested all 5 roles (admin, hr_manager, recruiter, interviewer, viewer)
- [ ] ✅ Verified navigation items show/hide correctly
- [ ] ✅ Verified badge counts update
- [ ] ✅ Tested responsive design (desktop → mobile)
- [ ] ✅ Tested minimal shell (pending/rejected)

**Documentation:**
- [ ] ✅ This implementation plan reviewed and approved
- [ ] ✅ State machine diagram documented
- [ ] ✅ Permission matrix documented
- [ ] ✅ File structure documented
- [ ] ✅ Usage examples documented

---

## 14. Next Steps After COMP-R00

Once COMP-R00 is complete, proceed to:

**Phase 1 Routes (Can implement in parallel):**
1. **COMP-R01** (Pending) - 3-4 days
   - Uses MinimalShell
   - Uses access control hook
   - Tests pending/rejected states

2. **COMP-R02** (Team Management) - 5-7 days
   - Uses CompanyShell
   - Uses `manage_team` permission
   - Tests role management

3. **COMP-R03** (Settings) - 5-7 days
   - Uses CompanyShell
   - Uses `company_settings` permission
   - Tests profile editing

**Estimated Timeline:**
- COMP-R00: 10-14 days
- COMP-R01, R02, R03 (parallel): 5-7 days
- **Total Phase 1: 15-21 days (3-4 weeks)**

---

## 15. Summary

**COMP-R00 Implementation Plan**

- **Complexity:** High (5-level state machine, 5 roles, 7 permissions, dual shells)
- **Estimated Effort:** 10-14 days
- **Team:** 1 developer (full-time)
- **Dependencies:** Minimal (Firebase Auth, Jotai, SWR already exist)
- **Deliverables:** Types, hooks, permission system, shell components, atoms, tests
- **Coverage Target:** 90%+ unit tests
- **Success Criteria:** All quality gates pass, all deliverables complete, manual verification successful

**Key Success Factors:**
1. ✅ State machine correctness (comprehensive tests)
2. ✅ Permission matrix accuracy (35+ tests)
3. ✅ Shell performance (lazy loading, memoization)
4. ✅ Type safety (strict TypeScript)
5. ✅ Reusability (all routes use same patterns)

**Ready to Proceed?**

Once this plan is approved, we can begin:
- **Day 1:** Type definitions
- **Days 2-4:** Access control hook
- **Days 4-5:** Permission system
- **Days 6-8:** Shell components
- **Days 8-9:** State management
- **Days 9-10:** Testing & verification

---

**Document Complete** | Implementation Plan Ready for Review
