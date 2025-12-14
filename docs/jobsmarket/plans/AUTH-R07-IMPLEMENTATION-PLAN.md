# AUTH-R07 Implementation Plan: Select Role Page

**Route:** `/auth/select-role`
**RIS Document:** `docs/jobsmarket/RIS/AUTH-R07_select-role_RIS.md`
**Created:** 2025-12-14
**Status:** Awaiting Approval

---

## 0. Critical Architecture Rule ⚠️

### ❌ DO NOT Create `/api/` Routes for Jobsmarket

**Rule:** Use **Server Actions ONLY** - No API routes.

| ❌ WRONG | ✅ CORRECT |
|---------|-----------|
| `fetch('/api/companies/...')` | `webCompanyInformationGetById(id)` |
| Create new API route | Create server action in `src/domains/*/services/server/actions/jobsmarket/` |
| SWR with API URL | SWR with server action function |

**Existing Server Actions for This Route:**
- ✅ `src/lib/database/actions/company-information.ts`
  - Function: `webCompanyInformationGetById(uid: string)` - Fetch company name for display
- ✅ `src/domains/authentication/services/server/actions/auth-session.ts`
  - Function: `logout()` - Logout handler

**No new server actions required** - This is a client-side navigation route using existing atoms and hooks.

---

## 1. Executive Summary

### 1.1 Purpose
Implement a role selection page that allows multi-role users (those with both `candidate` and `company` roles) to choose which context to enter after login. This prevents confusion and provides a clear entry point for users who can access both job seeker and employer features.

### 1.2 Scope
- **In Scope:**
  - Display selection cards for candidate and company roles
  - Fetch and display company name for company card
  - Remember selection via localStorage (optional)
  - Auto-skip page if preference saved
  - Auto-redirect single-role users
  - Logout option
- **Out of Scope:**
  - Role management (adding/removing roles)
  - Role switcher component (in shells, not this page)
  - Settings page integration (deferred)

### 1.3 Complexity: Low
- Simple navigation page with no mutations
- Uses existing atoms (`activeRoleAtom`, `userAtom`)
- Single data fetch (company name)
- Defensive routing logic handled by existing `navigateUserByRole()` hook
- No server actions needed

---

## 2. Requirements Analysis

### 2.1 Key Findings from RIS

**Page Purpose (RIS §1):**
- Minimal shell page (no header/nav)
- Show only for multi-role users
- Auto-skip if preference saved

**User Journey (RIS §6.1):**
```
Login → CHECK_AUTH → Multiple paths:
  - Not authenticated → /auth/login
  - Single role → auto-redirect to dashboard
  - Multi-role + saved preference → auto-redirect to saved dashboard
  - Multi-role + no preference → SHOW selection cards
```

**Role Selection Cards (RIS §7.4, §7.5):**

| Card | Icon | Title (TH) | Features |
|------|------|-----------|----------|
| Candidate | 👤 User | ผู้หางาน | • ค้นหาและสมัครงาน<br>• ติดตามใบสมัคร<br>• แชทกับนายจ้าง |
| Company | 🏢 Building2 | {company.name_th} | • ลงประกาศรับสมัครงาน<br>• ดูและจัดการผู้สมัคร<br>• แชทกับผู้สมัคร |

**Data Requirements (RIS §4.1):**
- User data: Already in `userAtom` (from login flow)
- Company name: Fetch from `company_information` if user has `company` role
- Fallback: Show "นายจ้าง" if company fetch fails

**State Management (RIS §5):**
- Read: `userAtom`, `firebaseUserAtom`, `sessionStateAtom`
- Write: `activeRoleAtom` (on card click)
- localStorage: `lastActiveRole` (if remember checked)

**Auto-Skip Logic (RIS §10):**
- Already implemented in `useNavigation` hook ([use-navigation.ts:82-98](src/hooks/jobsmarket/use-navigation.ts#L82-L98))
- Checks `localStorage.lastActiveRole`
- Auto-redirects if valid preference found

### 2.2 Existing Architecture Assessment

**✅ What's Already Built:**

| Component | Location | Status |
|-----------|----------|--------|
| `activeRoleAtom` | [global-atoms.ts:33](src/store/jobsmarket/global-atoms.ts#L33) | ✅ Ready |
| `navigateUserByRole()` hook | [use-navigation.ts:32](src/hooks/jobsmarket/use-navigation.ts#L32) | ✅ Ready |
| `saveRolePreference()` helper | [use-navigation.ts:168](src/hooks/jobsmarket/use-navigation.ts#L168) | ✅ Ready |
| Auto-skip logic | [use-navigation.ts:82-98](src/hooks/jobsmarket/use-navigation.ts#L82-L98) | ✅ Ready |
| Company data fetch | [company-information.ts](src/lib/database/actions/company-information.ts) | ✅ Ready |
| Logout action | [auth-session.ts](src/domains/authentication/services/server/actions/auth-session.ts) | ✅ Ready |

**Result:** This route is primarily a **UI implementation** - all backend logic exists.

### 2.3 Cross-References to AUTH-R00

- Error UX standards: AUTH-R00 §2 (toast for network errors)
- Session management: AUTH-R00 §3 (redirect if session invalid)
- Global atoms: AUTH-R00 §4.1 (`activeRoleAtom`, `userAtom`)
- Role semantics: AUTH-R00 §9 (navigation priority)
- Analytics events: AUTH-R00 §7.2 (`role_selected`)

### 2.4 Integration Points

**Login Flow Integration:**
- `navigateUserByRole()` already routes multi-role users to `/auth/select-role`
- No changes needed to login flow

**Settings Integration (Future):**
- Per RIS §10.1, users can change default role in settings
- Deferred to settings page implementation

**Role Switcher (Future):**
- Users can switch roles after selection via shell header component
- Not part of this route

---

## 3. Technical Design

### 3.1 File Structure

```
src/app/jobsmarket/auth/select-role/
├── page.tsx                          # Server component wrapper
└── _components/
    ├── SelectRoleClient.tsx          # Main client component
    ├── RoleCard.tsx                  # Reusable card component
    └── RememberCheckbox.tsx          # Checkbox component

tests/
├── unit/jobsmarket/auth/select-role/
│   ├── role-detection.test.ts        # Auto-redirect logic
│   └── redirect-validation.test.ts   # Query param validation
├── integration/jobsmarket/auth/select-role/
│   ├── select-role-client.test.tsx   # Full page rendering
│   ├── role-card.test.tsx            # Card interactions
│   └── remember-preference.test.tsx  # localStorage handling
└── e2e/jobsmarket/auth/
    └── select-role.spec.ts           # E2E flows
```

**Total Files:** 3 source + 6 test files = 9 files

### 3.2 Component Architecture

**Page Hierarchy:**
```
page.tsx (Server Component)
  └─► SelectRoleClient.tsx (Client Component)
      ├─► RoleCard (Candidate)
      ├─► RoleCard (Company)
      └─► RememberCheckbox
```

**State Flow:**
```
User clicks card
  ↓
handleRoleSelect(role)
  ↓
1. Check isRedirecting guard
2. setActiveRole(role) via Jotai
3. saveRolePreference(role, rememberChoice) if checked
4. router.replace(destination)
```

### 3.3 Component Specifications

#### 3.3.1 page.tsx (Server Component)

**Purpose:** Wrapper for metadata and server-side concerns

```typescript
import { Metadata } from "next";
import { SelectRoleClient } from "./_components/SelectRoleClient";

export const metadata: Metadata = {
  title: "เลือกบทบาท - ChanceDee",
  description: "Select your role to continue",
};

export default function SelectRolePage() {
  return <SelectRoleClient />;
}
```

**Lines:** ~15 lines

---

#### 3.3.2 SelectRoleClient.tsx (Client Component)

**Purpose:** Main page logic and layout

**Props:** None

**State:**
- `rememberChoice: boolean` - Checkbox state
- `isRedirecting: boolean` - Prevent double-clicks
- `companyName: string | null` - Fetched company name

**Atoms (read):**
- `userAtom` - Get user roles, uid, company_id
- `firebaseUserAtom` - Verify authenticated
- `sessionStateAtom` - Verify session valid

**Atoms (write):**
- `activeRoleAtom` - Set selected role

**Hooks:**
- `useAtomValue(userAtom)`
- `useSetAtom(activeRoleAtom)`
- `useRouter()` from next/navigation
- `useSWR()` for company name fetch

**Key Functions:**

```typescript
async function handleRoleSelect(role: 'candidate' | 'company') {
  // Per RIS §8.1
  if (isRedirecting) return;
  setIsRedirecting(true);

  setActiveRole(role);

  if (rememberChoice) {
    saveRolePreference(role, true);
  }

  // Handle redirect param if present
  const searchParams = new URLSearchParams(window.location.search);
  const redirectUrl = searchParams.get('redirect');

  let destination: string;
  if (redirectUrl && isValidRedirect(redirectUrl, role)) {
    destination = redirectUrl;
  } else {
    destination = role === 'candidate'
      ? `/jobsmarket/candidates/${user.uid}`
      : `/jobsmarket/companies/${user.company_id}/dashboard`;
  }

  router.replace(destination);
}

async function handleLogout() {
  // Per RIS §8.2
  localStorage.removeItem('lastActiveRole');
  await logout();
  router.replace('/jobsmarket/auth/login');
}

function isValidRedirect(url: string, role: 'candidate' | 'company'): boolean {
  // Per RIS §9.1
  if (!url.startsWith('/')) return false;

  if (role === 'candidate') {
    return /^\/jobsmarket\/(candidates\/|jobs\/|chat|notifications)/.test(url);
  }

  if (role === 'company') {
    return /^\/jobsmarket\/(companies\/|chat|notifications)/.test(url);
  }

  return false;
}
```

**Defensive Checks (useEffect):**
```typescript
useEffect(() => {
  // Per RIS §11.2

  // 1. Must be authenticated
  if (!user || !firebaseUser) {
    router.replace('/jobsmarket/auth/login');
    return;
  }

  // 2. Platform admin bypasses
  if (user.roles.includes('chancedee')) {
    router.replace('/platform/dashboard');
    return;
  }

  // 3. Pending users shouldn't be here
  if (user.roles.includes('pending')) {
    router.replace('/jobsmarket/auth/status?type=pending');
    return;
  }

  // 4. Deleted users
  if (user.roles.includes('deleted')) {
    router.replace('/jobsmarket/auth/status?type=deleted');
    return;
  }

  // 5. Single role - auto redirect
  const hasCandidate = user.roles.includes('candidate');
  const hasCompany = user.roles.includes('company') && user.company_id;

  if (hasCandidate && !hasCompany) {
    router.replace(`/jobsmarket/candidates/${user.uid}`);
    return;
  }

  if (hasCompany && !hasCandidate) {
    router.replace(`/jobsmarket/companies/${user.company_id}/dashboard`);
    return;
  }

  // 6. Valid multi-role user - show page
  setPageReady(true);
}, [user, firebaseUser]);
```

**Company Name Fetch:**
```typescript
const { data: companyData } = useSWR(
  user?.company_id ? ['company-info', user.company_id] : null,
  ([, id]) => webCompanyInformationGetById(id),
  {
    revalidateOnFocus: false,
    fallbackData: { name_th: 'นายจ้าง' }, // Fallback per RIS §6.1
  }
);
```

**Layout:**
```tsx
<div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
  {/* Logo */}
  <div className="mb-8">
    <Link href="/">
      <Image src="/logo.svg" alt="ChanceDee" width={120} height={40} />
    </Link>
  </div>

  {/* Title */}
  <div className="text-center mb-12">
    <h1 className="text-2xl font-semibold text-gray-900">
      เลือกบทบาทที่ต้องการใช้งาน
    </h1>
    <p className="text-sm text-gray-500 mt-1">Select your role</p>
  </div>

  {/* Cards */}
  <div className="flex flex-col md:flex-row gap-6 mb-8">
    <RoleCard
      role="candidate"
      title="ผู้หางาน"
      subtitle="Candidate"
      icon={<User className="w-12 h-12 text-primary" />}
      features={[
        'ค้นหาและสมัครงาน',
        'ติดตามใบสมัคร',
        'แชทกับนายจ้าง',
      ]}
      onSelect={() => handleRoleSelect('candidate')}
      disabled={isRedirecting}
    />

    <RoleCard
      role="company"
      title={companyData?.name_th || 'นายจ้าง'}
      subtitle="Employer"
      icon={<Building2 className="w-12 h-12 text-primary" />}
      features={[
        'ลงประกาศรับสมัครงาน',
        'ดูและจัดการผู้สมัคร',
        'แชทกับผู้สมัคร',
      ]}
      onSelect={() => handleRoleSelect('company')}
      disabled={isRedirecting}
    />
  </div>

  {/* Remember Checkbox */}
  <RememberCheckbox
    checked={rememberChoice}
    onChange={setRememberChoice}
  />

  {/* Logout Link */}
  <div className="mt-8 text-center">
    <button
      onClick={handleLogout}
      className="text-sm text-gray-500 hover:text-gray-700"
    >
      ต้องการเปลี่ยนบัญชี? <span className="text-primary">ออกจากระบบ</span>
    </button>
  </div>
</div>
```

**Lines:** ~250 lines

---

#### 3.3.3 RoleCard.tsx (Reusable Component)

**Purpose:** Display individual role selection card with hover states

**Props:**
```typescript
interface RoleCardProps {
  role: 'candidate' | 'company';
  title: string;          // Thai title (ผู้หางาน or company name)
  subtitle: string;       // English subtitle
  icon: React.ReactNode;  // Lucide icon
  features: string[];     // Bullet list (3 items)
  onSelect: () => void;
  disabled?: boolean;
}
```

**State:**
- `isHovered: boolean` - Hover state for visual feedback

**Styling (per RIS §7.4):**
- Idle: `bg-white border-gray-200`
- Hover: `bg-gray-50 border-primary shadow-md`
- Disabled: `opacity-50 cursor-not-allowed`

**Accessibility (per RIS §12):**
- `tabIndex={0}` for keyboard navigation
- `role="button"`
- `aria-label="เลือกบทบาท {title}"`
- `onKeyDown` handler for Enter/Space

**Layout:**
```tsx
<div
  className={cn(
    "w-full md:w-80 p-8 rounded-lg border-2 cursor-pointer transition-all",
    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
    isHovered ? "bg-gray-50 border-primary shadow-md" : "bg-white border-gray-200",
    disabled && "opacity-50 cursor-not-allowed"
  )}
  onClick={disabled ? undefined : onSelect}
  onMouseEnter={() => setIsHovered(true)}
  onMouseLeave={() => setIsHovered(false)}
  onKeyDown={handleKeyDown}
  tabIndex={disabled ? -1 : 0}
  role="button"
  aria-label={`เลือกบทบาท ${title}`}
>
  {/* Icon */}
  <div className="flex justify-center mb-4">{icon}</div>

  {/* Title */}
  <div className="text-center mb-4">
    <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
    <p className="text-sm text-gray-500">{subtitle}</p>
  </div>

  {/* Divider */}
  <div className="border-t border-gray-200 my-4" />

  {/* Features */}
  <ul className="space-y-2 mb-6">
    {features.map((feature, i) => (
      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
        <span className="text-gray-400">•</span>
        <span>{feature}</span>
      </li>
    ))}
  </ul>

  {/* Button */}
  <Button
    className="w-full"
    variant={isHovered ? "default" : "outline"}
    disabled={disabled}
  >
    เข้าใช้งาน
  </Button>
</div>
```

**Lines:** ~80 lines

---

#### 3.3.4 RememberCheckbox.tsx

**Purpose:** Checkbox for saving role preference

**Props:**
```typescript
interface RememberCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}
```

**Layout:**
```tsx
<div className="flex items-center gap-2">
  <Checkbox
    id="remember-choice"
    checked={checked}
    onCheckedChange={onChange}
  />
  <label
    htmlFor="remember-choice"
    className="text-sm text-gray-700 cursor-pointer"
  >
    จดจำการเลือกนี้ (Remember my choice)
  </label>
</div>
```

**Lines:** ~20 lines

---

### 3.4 Query Parameter Handling

**Supported Parameters (per RIS §9):**

| Param | Type | Purpose | Validation |
|-------|------|---------|------------|
| `?redirect` | URL string | Post-selection destination | `isValidRedirect()` |
| `?from` | string | Source tracking (analytics) | No validation |

**Usage Example:**
```
/auth/select-role?redirect=/jobsmarket/jobs/123&from=login
```

**Validation Logic (per RIS §9.1):**
```typescript
function isValidRedirect(url: string, role: 'candidate' | 'company'): boolean {
  // Must be internal URL
  if (!url.startsWith('/')) return false;

  // Must start with /jobsmarket
  if (!url.startsWith('/jobsmarket/')) return false;

  // Role-appropriate paths
  if (role === 'candidate') {
    return /^\/jobsmarket\/(candidates\/|jobs\/|chat|notifications)/.test(url);
  }

  if (role === 'company') {
    return /^\/jobsmarket\/(companies\/|chat|notifications)/.test(url);
  }

  return false;
}
```

---

### 3.5 Analytics Events

**Per AUTH-R00 §7.2 and RIS §13:**

| Event | Trigger | Properties |
|-------|---------|------------|
| `page_view` | Page load | `page: '/auth/select-role'` |
| `role_selected` | Card click | `role: 'candidate' \| 'company'`, `remembered: boolean`, `source: string` |
| `auto_skip` | Saved pref used | `role: string`, `source: 'saved_preference'` |
| `logout_from_select` | Logout clicked | - |

**Implementation:**
```typescript
// On card click
gtag('event', 'role_selected', {
  role,
  remembered: rememberChoice,
  source: searchParams.get('from') || 'direct',
});

// On auto-skip (in useEffect)
gtag('event', 'auto_skip', {
  role: savedRole,
  source: 'saved_preference',
});
```

---

## 4. Test Strategy

### 4.1 Test Coverage Matrix

| Test Type | Files | Coverage Target | Priority |
|-----------|-------|----------------|----------|
| Unit | 2 files | Role detection, redirect validation | P0 |
| Integration | 3 files | Component rendering, interactions | P0 |
| E2E | 1 file | Full flows (multi-role, auto-skip, remember) | P0 |

**Total Tests Estimate:** ~40-50 tests

---

### 4.2 Unit Tests (2 files, ~15 tests)

#### tests/unit/jobsmarket/auth/select-role/role-detection.test.ts

**Coverage:**
- ✅ Auto-redirect for single-role users (candidate only)
- ✅ Auto-redirect for single-role users (company only)
- ✅ Auto-redirect for platform admin (chancedee)
- ✅ Auto-redirect for deleted users
- ✅ Auto-redirect for pending users
- ✅ Show page for multi-role users (candidate + company)
- ✅ Auto-skip with saved preference (candidate)
- ✅ Auto-skip with saved preference (company)
- ✅ Ignore invalid saved preference

**Lines:** ~150 lines

---

#### tests/unit/jobsmarket/auth/select-role/redirect-validation.test.ts

**Coverage:**
- ✅ Valid candidate redirects (candidates/, jobs/, chat, notifications)
- ✅ Valid company redirects (companies/, chat, notifications)
- ✅ Invalid redirects (external URLs, wrong role paths)
- ✅ Redirect param parsing
- ✅ Default destinations (no redirect param)

**Lines:** ~100 lines

---

### 4.3 Integration Tests (3 files, ~25 tests)

#### tests/integration/jobsmarket/auth/select-role/select-role-client.test.tsx

**Coverage:**
- ✅ Renders candidate card with correct content
- ✅ Renders company card with company name
- ✅ Renders company card with fallback name if fetch fails
- ✅ Shows remember checkbox
- ✅ Shows logout link
- ✅ Shows loading state while checking auth
- ✅ Redirects if not authenticated
- ✅ Redirects if single role
- ✅ Prevents double-clicks (isRedirecting guard)
- ✅ Analytics events fired on selection

**Lines:** ~250 lines

---

#### tests/integration/jobsmarket/auth/select-role/role-card.test.tsx

**Coverage:**
- ✅ Renders card with all props
- ✅ Hover state changes styling
- ✅ Click triggers onSelect
- ✅ Keyboard navigation (Enter, Space)
- ✅ Disabled state prevents interaction
- ✅ Accessibility attributes present

**Lines:** ~150 lines

---

#### tests/integration/jobsmarket/auth/select-role/remember-preference.test.tsx

**Coverage:**
- ✅ Checkbox toggles state
- ✅ saveRolePreference() called with remember=true
- ✅ saveRolePreference() called with remember=false
- ✅ localStorage updated correctly
- ✅ Auto-skip on next login if remembered

**Lines:** ~120 lines

---

### 4.4 E2E Tests (1 file, ~10 tests)

#### tests/e2e/jobsmarket/auth/select-role.spec.ts

**Test Scenarios:**

1. **Multi-role user sees selection**
   - Login as user with both roles
   - Verify redirected to `/auth/select-role`
   - Verify both cards displayed

2. **Candidate selection flow**
   - Click candidate card
   - Verify `activeRoleAtom` set
   - Verify redirected to `/candidates/{uid}`

3. **Company selection flow**
   - Click company card with company name displayed
   - Verify `activeRoleAtom` set
   - Verify redirected to `/companies/{id}/dashboard`

4. **Remember preference**
   - Check "Remember" checkbox
   - Select candidate
   - Logout and login again
   - Verify auto-skip to candidate dashboard

5. **Clear preference**
   - Uncheck "Remember"
   - Select company
   - Logout and login again
   - Verify shown selection page again

6. **Redirect param**
   - Navigate to `/auth/select-role?redirect=/jobsmarket/jobs/123`
   - Select candidate
   - Verify redirected to `/jobs/123`

7. **Invalid redirect param**
   - Navigate with invalid redirect
   - Select role
   - Verify redirected to default dashboard

8. **Logout from selection**
   - Click logout link
   - Verify localStorage cleared
   - Verify redirected to login

9. **Single-role auto-redirect**
   - Login as candidate-only user
   - Verify never shown selection page
   - Verify auto-redirected to candidate dashboard

10. **Company name fetch failure**
    - Mock company fetch to fail
    - Verify fallback "นายจ้าง" displayed

**Lines:** ~300 lines

---

### 4.5 Test Credentials

**Per CLAUDE.md Gate 4a:**
```bash
# Check available test credentials
cat .env.playwright | grep -E "^(TEST_|E2E_)"
```

**E2E Tests Will Use:**
- `TEST_USER_EMAIL` / `TEST_USER_PASSWORD` - Multi-role user
- `TEST_CANDIDATE_EMAIL` / `TEST_CANDIDATE_PASSWORD` - Candidate-only user
- `TEST_COMPANY_EMAIL` / `TEST_COMPANY_PASSWORD` - Company-only user

**Skip Guard:**
```typescript
test.skip(!process.env.TEST_USER_EMAIL, 'Test credentials not configured');
```

---

## 5. Implementation Checklist

### Phase 1: Setup & Structure
- [ ] Create route directory: `src/app/jobsmarket/auth/select-role/`
- [ ] Create components directory: `_components/`
- [ ] Create test directories (unit, integration, e2e)

### Phase 2: Components (TDD)
- [ ] Write unit tests for role detection
- [ ] Write unit tests for redirect validation
- [ ] Write integration tests for SelectRoleClient
- [ ] Write integration tests for RoleCard
- [ ] Write integration tests for RememberCheckbox
- [ ] Implement `page.tsx`
- [ ] Implement `SelectRoleClient.tsx`
- [ ] Implement `RoleCard.tsx`
- [ ] Implement `RememberCheckbox.tsx`
- [ ] Run unit + integration tests → all pass

### Phase 3: E2E Tests
- [ ] Write E2E test scenarios (10 tests)
- [ ] Run E2E tests → all pass or acceptable skips

### Phase 4: Quality Gates
- [ ] Gate 1: `npm run build` → exit code 0
- [ ] Gate 2: `npm run lint` → no errors
- [ ] Gate 3: `npm run dev` → route loads without error
- [ ] Gate 4: Tests run → X passed, Y skipped, 0 failed

### Phase 5: Manual Verification
- [ ] Visit `/auth/select-role` in browser
- [ ] Test multi-role flow
- [ ] Test remember preference
- [ ] Test logout
- [ ] Test responsive layout (mobile)

### Phase 6: Documentation
- [ ] Add analytics event tracking
- [ ] Verify accessibility (keyboard nav, screen reader)
- [ ] Update this plan with actual test counts

---

## 6. Risk Assessment

### 6.1 Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Company fetch fails | Low | Low | Fallback to "นายจ้าง" per RIS §6.1 |
| Race condition on double-click | Low | Medium | `isRedirecting` guard implemented |
| Invalid localStorage data | Low | Low | Validation in `getSavedRolePreference()` |
| User roles change during session | Very Low | Medium | Defensive checks in useEffect |

### 6.2 UX Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| User confused about "Remember" | Medium | Low | Clear label with English translation |
| User wants to change saved preference | Medium | Medium | Logout clears preference (documented) |
| User accidentally clicks wrong role | Low | Low | Easy to switch via Role Switcher later |

---

## 7. Dependencies

### 7.1 Existing Code (No Changes Needed)

- ✅ `activeRoleAtom` in [global-atoms.ts:33](src/store/jobsmarket/global-atoms.ts#L33)
- ✅ `navigateUserByRole()` in [use-navigation.ts:32](src/hooks/jobsmarket/use-navigation.ts#L32)
- ✅ `saveRolePreference()` in [use-navigation.ts:168](src/hooks/jobsmarket/use-navigation.ts#L168)
- ✅ Auto-skip logic in [use-navigation.ts:82-98](src/hooks/jobsmarket/use-navigation.ts#L82-L98)
- ✅ `webCompanyInformationGetById()` in `src/lib/database/actions/company-information.ts`
- ✅ `logout()` in `src/domains/authentication/services/server/actions/auth-session.ts`

### 7.2 External Dependencies

- ✅ `lucide-react` (User, Building2 icons) - already installed
- ✅ `@/components/ui/button` - already exists
- ✅ `@/components/ui/checkbox` - already exists
- ✅ `next/image` - built-in
- ✅ `jotai` - already installed
- ✅ `swr` - already installed

**No new dependencies required.**

---

## 8. Open Questions for Human Review

### 8.1 Design Questions

1. **Logo source:** Do we have a `/logo.svg` file, or should I use a different path?
   - **Fallback:** Use text "ChanceDee" if no logo found

2. **Company name loading state:** Should we show a skeleton or just wait?
   - **Proposed:** Show skeleton in card title while loading

3. **Analytics implementation:** Should I use Google Analytics (`gtag`) or a different service?
   - **Proposed:** Use `gtag` per existing patterns

### 8.2 Behavior Questions

1. **Saved preference clearing:** Currently only clears on logout. Should settings page also clear it?
   - **RIS says:** Deferred to settings implementation (§10.1)

2. **Redirect param priority:** Should redirect override saved preference?
   - **RIS suggests:** Yes, redirect param should override (§8.1 step 5)

3. **Mobile layout:** Cards stack vertically - is this acceptable?
   - **RIS shows:** Yes, per §7.2 mobile mockup

---

## 9. Implementation Notes

### 9.1 Why This Is Low Complexity

- No server mutations
- No complex state machines
- Existing hooks handle all business logic
- Simple UI with 2 cards and 1 checkbox
- Auto-skip logic already implemented
- No new atoms or actions needed

### 9.2 Future Enhancements (Out of Scope)

Per RIS §18 (Open Questions):

1. **Settings page integration:** Change default role in settings
   - Deferred to AUTH-R06 settings implementation

2. **Role Switcher integration:** Quick toggle from shell header
   - Already exists in shell spec, not part of this route

3. **Multi-company support:** If user has multiple companies
   - Not supported in v1 (single `company_id` only)

---

## 10. Success Criteria

### 10.1 Functional Requirements

- ✅ Multi-role users see selection page
- ✅ Single-role users auto-redirect
- ✅ Company name displays correctly
- ✅ Remember checkbox saves preference
- ✅ Saved preference skips page on next login
- ✅ Logout clears preference
- ✅ Redirect param works correctly
- ✅ All defensive checks work (deleted, pending, etc.)

### 10.2 Quality Gates

- ✅ Build passes (Gate 1)
- ✅ Lint passes with no errors (Gate 2)
- ✅ Dev server starts and route loads (Gate 3)
- ✅ All tests pass or acceptable skips (Gate 4)

### 10.3 Acceptance Criteria

- [ ] Manual test: Login as multi-role user → see selection
- [ ] Manual test: Select candidate → redirect to candidate dashboard
- [ ] Manual test: Select company → redirect to company dashboard
- [ ] Manual test: Check remember → logout → login → auto-skip
- [ ] Manual test: Uncheck remember → logout → login → see selection
- [ ] Manual test: Click logout → redirected to login
- [ ] Manual test: Mobile responsive (cards stack)

---

## 11. Estimated Effort

| Phase | Files | Lines of Code | Effort |
|-------|-------|---------------|--------|
| Source Code | 3 files | ~365 LOC | 2 hours |
| Unit Tests | 2 files | ~250 LOC | 1.5 hours |
| Integration Tests | 3 files | ~520 LOC | 2 hours |
| E2E Tests | 1 file | ~300 LOC | 2 hours |
| **Total** | **9 files** | **~1,435 LOC** | **~7.5 hours** |

**Complexity:** Low
**Risk:** Low
**Dependencies:** None (all exist)

---

## 12. Appendix: Component Props Reference

### RoleCardProps
```typescript
interface RoleCardProps {
  role: 'candidate' | 'company';
  title: string;          // Thai title
  subtitle: string;       // English subtitle
  icon: React.ReactNode;  // Lucide icon element
  features: string[];     // 3 bullet points
  onSelect: () => void;
  disabled?: boolean;
}
```

### RememberCheckboxProps
```typescript
interface RememberCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}
```

### SelectRoleClientProps
```typescript
// No props - reads from atoms
interface SelectRoleClientProps {}
```

---

## 13. Appendix: File Size Estimates

| File | Lines | Reason |
|------|-------|--------|
| `page.tsx` | 15 | Minimal wrapper |
| `SelectRoleClient.tsx` | 250 | Main logic + layout + defensive checks |
| `RoleCard.tsx` | 80 | Card component with states |
| `RememberCheckbox.tsx` | 20 | Simple checkbox |
| **Unit tests** | 250 | 2 files, ~15 tests |
| **Integration tests** | 520 | 3 files, ~25 tests |
| **E2E tests** | 300 | 1 file, ~10 scenarios |
| **TOTAL** | **1,435** | |

---

*End of AUTH-R07 Implementation Plan*
