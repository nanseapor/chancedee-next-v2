# RIS: /auth/select-role

**Route ID:** AUTH-R07  
**Version:** 1.3  
**Status:** Draft  
**Created:** 2025-12-07  
**Last Updated:** 2025-12-09

**Changes in v1.3:**
- Added Cross-References section linking to AUTH-R00 shared patterns
- Renamed `navBarAtom` → `activeRoleAtom` per AUTH-R00 naming convention

**Changes in v1.2:**
- Updated Section 6.2 to use 5-column State Transition Table format per RIS_ORCHESTRATOR_GUIDE.md
- Updated Section 6.3 to use 5-column Component State Automaton format

**Changes in v1.1:**
- Added explicit data loading requirement in Section 6.1 (block render until company name loads)

**Note:** This is a NEW route not in the original UI spec. Identified during AUTH-R01 specification as needed for multi-role user routing.

---

## Cross-References

This document references shared specifications from **AUTH-R00_cross-cutting_RIS.md**.

| Topic | AUTH-R00 Section |
|-------|------------------|
| Error UX standards | Section 2 |
| Session management | Section 3 |
| **Global atoms (activeRoleAtom)** | **Section 4** |
| i18n & Thai copy guidelines | Section 6 |
| Analytics events (role_selected) | Section 7 |
| **Role semantics & navigation priority** | **Section 9** |
| Error code → message mapping | Appendix A |
| Thai copy reference | Appendix B |

---

## 1. Route Metadata

| Property | Value |
|----------|-------|
| Route Path | `/auth/select-role` |
| Shell | Minimal Shell |
| Purpose | Allow multi-role users to select which context (candidate/company) to enter |
| Complexity | Low |
| Phase | 1 (Foundation) |
| UI Spec | N/A (new route, designed in this RIS) |

---

## 2. Domain Classification

### Primary Domain: Authentication

- **Owns:** Role selection flow, active role state management
- **Mutations:**
  - Set `activeRoleAtom` (global state)
  - Set `localStorage.lastActiveRole` (persistence)

### Secondary Domains

| Domain | Role | Access |
|--------|------|--------|
| Candidate | Destination option | Read: user has `candidate` role |
| Company | Destination option | Read: user has `company` role, fetch company name |

### Global Domains

| Domain | Requirement |
|--------|-------------|
| Auth | User must be authenticated to reach this page |
| Chat | Not available (selection page, minimal shell) |
| Notifications | Not available (selection page, minimal shell) |

---

## 3. Feature Mapping

### Existing Features (Preserve - P0)

| Feature ID | Feature Name | Coverage | Notes |
|------------|--------------|----------|-------|
| AUTH-016 | Role-Based Navigation | Partial | This route is a waypoint in the navigation flow |
| AUTH-010 | Session Management | Full | Session must be valid to reach this page |

### New Features (This Route Introduces)

| Feature | Description | Priority |
|---------|-------------|----------|
| Multi-Role Selection UI | Visual cards for candidate/company choice | P0 |
| Remember Selection | Checkbox to skip this page on future logins | P0 |
| Auto-Skip on Login | If preference saved, bypass this page | P0 |

### Related Features (Shell Level)

| Feature | Description | Where |
|---------|-------------|-------|
| Role Switcher | Switch roles after initial selection | Candidate/Company Shell headers |

---

## 4. Data Contract

### 4.1 Read Operations

| Data | Collection | Fields | Condition | SWR Key |
|------|------------|--------|-----------|---------|
| User Data | `user_accounts` | `uid`, `roles`, `company_id` | Already in `userAtom` | `user-data-${uid}` |
| Company Info | `company_information` | `name_th`, `name_en` | If user has company role | `company-${companyId}` |

**Note:** User data should already be cached from login flow. Company info may need fetch if not cached.

### 4.2 Write Operations

| Action | Target | Field | Trigger |
|--------|--------|-------|---------|
| Set active role | `activeRoleAtom` (Jotai) | Role value | Card selection |
| Persist preference | `localStorage` | `lastActiveRole` | If "Remember" checked |

### 4.3 No Server Mutations

This route does NOT write to any Firestore collections. All state changes are client-side.

---

## 5. State Contract

### 5.1 Atoms

| Atom | Type | R/W | Purpose |
|------|------|-----|---------|
| `userAtom` | `userDataProps \| null` | R | Get user roles, company_id |
| `activeRoleAtom` | `'candidate' \| 'company' \| 'chancedee' \| 'pending' \| 'anonymous'` | W | Set selected role context |
| `firebaseUserAtom` | `User \| null` | R | Verify authenticated |
| `sessionStateAtom` | `SessionState` | R | Verify session valid |

**Migration Note:** `navBarAtom` is being renamed to `activeRoleAtom` for semantic clarity. This RIS uses the new name.

### 5.2 Hooks

| Hook | Returns | Purpose |
|------|---------|---------|
| `useFirebaseAuth` | `{ user, userChancedee, loading }` | Check auth state |
| `useCompanyInfo` | `{ company, isLoading }` | Fetch company name for display |

### 5.3 Local Storage Keys

| Key | Type | Purpose |
|-----|------|---------|
| `lastActiveRole` | `'candidate' \| 'company'` | Remembered role preference |

### 5.4 Local Component State

| State | Type | Initial | Purpose |
|-------|------|---------|---------|
| `rememberChoice` | `boolean` | `false` | Checkbox state |
| `isRedirecting` | `boolean` | `false` | Prevent double-clicks |

---

## 6. UI State Machine

### 6.1 Page States

```
                    ┌─────────────────────┐
                    │    CHECK_AUTH       │
                    │  (initial load)     │
                    └──────────┬──────────┘
                               │
           ┌───────────────────┼───────────────────┐
           │                   │                   │
           ▼                   ▼                   ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  NOT_AUTHED     │  │  SINGLE_ROLE    │  │  CHECK_SAVED    │
│ → /auth/login   │  │ → auto-redirect │  │  (multi-role)   │
└─────────────────┘  └─────────────────┘  └────────┬────────┘
                                                   │
                              ┌────────────────────┼────────────────────┐
                              │                                        │
                              ▼                                        ▼
                    ┌─────────────────┐                      ┌─────────────────┐
                    │  HAS_SAVED_PREF │                      │     IDLE        │
                    │ → auto-redirect │                      │  (show cards)   │
                    └─────────────────┘                      └────────┬────────┘
                                                                      │
                                                              user selects
                                                                      │
                                                                      ▼
                                                            ┌─────────────────┐
                                                            │   REDIRECTING   │
                                                            │ → dashboard     │
                                                            └─────────────────┘
```

**Data Loading Requirement:**

The IDLE state (show selection cards) requires all data to be loaded:
- User data from `userAtom` (should already be cached from login)
- Company name from `company_information` collection (if user has company role)

Page displays a loading spinner until both are ready. Firestore latency is expected to be minimal (<100ms). If company fetch fails after timeout, fall back to displaying "นายจ้าง" as company card title.


### 6.2 Page State Transition Table

| Current State | Event | Next State | Guard Condition | Side Effects |
|---------------|-------|------------|-----------------|--------------|
| `CHECK_AUTH` | `SESSION_CHECK` | `NOT_AUTHED` | sessionState !== 'valid' | router.replace('/auth/login') |
| `CHECK_AUTH` | `SESSION_CHECK` | `SINGLE_ROLE` | roles.length === 1 | - |
| `CHECK_AUTH` | `SESSION_CHECK` | `CHECK_SAVED` | roles.length > 1 (has both candidate & company) | - |
| `SINGLE_ROLE` | `AUTO_REDIRECT` | `REDIRECTING` | - | set activeRoleAtom, navigate to role dashboard |
| `CHECK_SAVED` | `PREF_CHECK` | `HAS_SAVED_PREF` | localStorage.lastActiveRole exists && role is valid | - |
| `CHECK_SAVED` | `PREF_CHECK` | `IDLE` | no saved preference OR saved role invalid | - |
| `HAS_SAVED_PREF` | `AUTO_REDIRECT` | `REDIRECTING` | - | set activeRoleAtom, navigate to saved role dashboard |
| `IDLE` | `COMPANY_DATA_LOADED` | `IDLE` | - | show company name in card |
| `IDLE` | `COMPANY_DATA_ERROR` | `IDLE` | - | show fallback "นายจ้าง" in card |
| `IDLE` | `CARD_CLICK` | `REDIRECTING` | - | set activeRoleAtom, persist if remember checked |
| `REDIRECTING` | `NAVIGATE` | - | - | router.replace(destination) |

### 6.3 Component State Automaton

| Component | Current State | Event | Next State | Condition |
|-----------|---------------|-------|------------|-----------|
| `CandidateCard` | `idle` | `HOVER` | `hover` | - |
| `CandidateCard` | `hover` | `LEAVE` | `idle` | - |
| `CandidateCard` | `idle` | `CLICK` | `selected` | - |
| `CandidateCard` | `hover` | `CLICK` | `selected` | - |
| `CandidateCard` | `selected` | `REDIRECT_COMPLETE` | `idle` | reset after navigation |
| `CompanyCard` | `idle` | `HOVER` | `hover` | - |
| `CompanyCard` | `hover` | `LEAVE` | `idle` | - |
| `CompanyCard` | `idle` | `CLICK` | `selected` | - |
| `CompanyCard` | `hover` | `CLICK` | `selected` | - |
| `CompanyCard` | `selected` | `REDIRECT_COMPLETE` | `idle` | reset after navigation |
| `CompanyCard` | `loading` | `DATA_LOADED` | `idle` | show company name |
| `CompanyCard` | `loading` | `DATA_ERROR` | `idle` | show fallback name |
| `RememberCheckbox` | `unchecked` | `TOGGLE` | `checked` | - |
| `RememberCheckbox` | `checked` | `TOGGLE` | `unchecked` | - |
| `Page` | `loading` | `AUTH_READY` | `loading` | wait for user data |
| `Page` | `loading` | `DATA_READY` | `ready` | all required data loaded |
| `Page` | `ready` | `CARD_SELECTED` | `redirecting` | - |
| `Page` | `redirecting` | `NAVIGATE` | - | terminal state |

---

## 7. UI Specification

### 7.1 Layout (Desktop)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                        [ChanceDee Logo]                                 │
│                                                                         │
│                                                                         │
│                     เลือกบทบาทที่ต้องการใช้งาน                              │
│                        Select your role                                 │
│                                                                         │
│                                                                         │
│       ┌────────────────────────┐    ┌────────────────────────┐         │
│       │                        │    │                        │         │
│       │          👤            │    │          🏢            │         │
│       │                        │    │                        │         │
│       │        ผู้หางาน          │    │   {Company Name}       │         │
│       │       Candidate        │    │       Employer         │         │
│       │                        │    │                        │         │
│       │   ─────────────────    │    │   ─────────────────    │         │
│       │                        │    │                        │         │
│       │   • ค้นหาและสมัครงาน     │    │   • ลงประกาศรับสมัครงาน   │         │
│       │   • ติดตามใบสมัคร       │    │   • ดูและจัดการผู้สมัคร    │         │
│       │   • แชทกับนายจ้าง       │    │   • แชทกับผู้สมัคร        │         │
│       │                        │    │                        │         │
│       │                        │    │                        │         │
│       │     [ เข้าใช้งาน ]       │    │     [ เข้าใช้งาน ]       │         │
│       │                        │    │                        │         │
│       └────────────────────────┘    └────────────────────────┘         │
│                                                                         │
│                                                                         │
│                  ☐ จดจำการเลือกนี้ (Remember my choice)                  │
│                                                                         │
│                                                                         │
│       ──────────────────────────────────────────────────────────        │
│                                                                         │
│                     ต้องการเปลี่ยนบัญชี? [ออกจากระบบ]                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Layout (Mobile)

```
┌─────────────────────────────────┐
│                                 │
│       [ChanceDee Logo]          │
│                                 │
│    เลือกบทบาทที่ต้องการใช้งาน      │
│       Select your role          │
│                                 │
│  ┌───────────────────────────┐  │
│  │           👤              │  │
│  │         ผู้หางาน           │  │
│  │        Candidate          │  │
│  │   ───────────────────     │  │
│  │   • ค้นหาและสมัครงาน       │  │
│  │   • ติดตามใบสมัคร         │  │
│  │   • แชทกับนายจ้าง         │  │
│  │                           │  │
│  │      [ เข้าใช้งาน ]        │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │           🏢              │  │
│  │    {Company Name}         │  │
│  │        Employer           │  │
│  │   ───────────────────     │  │
│  │   • ลงประกาศรับสมัครงาน    │  │
│  │   • ดูและจัดการผู้สมัคร     │  │
│  │   • แชทกับผู้สมัคร         │  │
│  │                           │  │
│  │      [ เข้าใช้งาน ]        │  │
│  └───────────────────────────┘  │
│                                 │
│  ☐ จดจำการเลือกนี้              │
│                                 │
│  ─────────────────────────────  │
│  ต้องการเปลี่ยนบัญชี? [ออกจากระบบ] │
│                                 │
└─────────────────────────────────┘
```

### 7.3 Component Specifications

| Component | Purpose | Position | Responsive | Action | Notes |
|-----------|---------|----------|------------|--------|-------|
| **Logo** | Brand + navigation | Top center | Same | Click → `/` | ChanceDee logo |
| **Page Title** | Context | Below logo | Same | - | Thai primary, English secondary |
| **Role Card Container** | Hold cards | Center | Stack on mobile | - | Flex row → column |
| **Candidate Card** | Select candidate role | Left (top mobile) | Full width mobile | Click → redirect | Always visible for multi-role |
| **Company Card** | Select company role | Right (bottom mobile) | Full width mobile | Click → redirect | Shows company name |
| └─ Company Name | Identification | Card title | - | - | Fetched from `company_information` |
| **Remember Checkbox** | Persist preference | Below cards | Same | Toggle state | Saves to localStorage |
| **Logout Link** | Account switch | Bottom | Same | Click → logout | For users wanting different account |

### 7.4 Role Card Component Detail

```
┌──────────────────────────────────────┐
│                                      │
│              [Icon]                  │   48x48px, centered
│                                      │
│           {Role Title TH}            │   text-xl font-semibold
│           {Role Title EN}            │   text-sm text-gray-500
│                                      │
│      ─────────────────────────       │   Divider
│                                      │
│      • {Feature 1}                   │   text-sm, bullet list
│      • {Feature 2}                   │   3 items max
│      • {Feature 3}                   │
│                                      │
│                                      │
│         ┌─────────────────┐          │
│         │    เข้าใช้งาน     │          │   Primary button
│         └─────────────────┘          │
│                                      │
└──────────────────────────────────────┘

Card States:
- idle: bg-white border-gray-200
- hover: bg-gray-50 border-primary shadow-md
- selected: bg-primary-50 border-primary-500 (brief, before redirect)
```

### 7.5 Card Content

**Candidate Card:**
| Element | Thai | English |
|---------|------|---------|
| Icon | 👤 (or Lucide `User` icon) | - |
| Title | ผู้หางาน | Candidate |
| Feature 1 | ค้นหาและสมัครงาน | - |
| Feature 2 | ติดตามใบสมัคร | - |
| Feature 3 | แชทกับนายจ้าง | - |
| Button | เข้าใช้งาน | - |

**Company Card:**
| Element | Thai | English |
|---------|------|---------|
| Icon | 🏢 (or Lucide `Building2` icon) | - |
| Title | {company.name_th} | Employer |
| Feature 1 | ลงประกาศรับสมัครงาน | - |
| Feature 2 | ดูและจัดการผู้สมัคร | - |
| Feature 3 | แชทกับผู้สมัคร | - |
| Button | เข้าใช้งาน | - |

---

## 8. Component-Action Wiring

| Component | Trigger | Action | Effect |
|-----------|---------|--------|--------|
| **Logo** | Click | `router.push('/')` | Navigate to home |
| **Candidate Card** | Click | `handleRoleSelect('candidate')` | Set state, redirect |
| **Company Card** | Click | `handleRoleSelect('company')` | Set state, redirect |
| **Remember Checkbox** | Change | `setRememberChoice(!rememberChoice)` | Toggle local state |
| **Logout Link** | Click | `handleLogout()` | Sign out, redirect to login |

### 8.1 Role Selection Handler

```typescript
async function handleRoleSelect(role: 'candidate' | 'company') {
  // 1. Prevent double-clicks
  if (isRedirecting) return;
  setIsRedirecting(true);
  
  // 2. Update global state
  setActiveRole(role);
  
  // 3. Persist if checkbox checked
  if (rememberChoice) {
    localStorage.setItem('lastActiveRole', role);
  }
  
  // 4. Determine destination
  let destination: string;
  if (role === 'candidate') {
    destination = `/candidates/${user.uid}`;
  } else {
    destination = `/companies/${user.company_id}/dashboard`;
  }
  
  // 5. Handle redirect param if present
  const searchParams = new URLSearchParams(window.location.search);
  const redirectUrl = searchParams.get('redirect');
  if (redirectUrl && isValidRedirect(redirectUrl, role)) {
    destination = redirectUrl;
  }
  
  // 6. Navigate (replace history)
  router.replace(destination);
}
```

### 8.2 Logout Handler

```typescript
async function handleLogout() {
  // 1. Clear localStorage preference
  localStorage.removeItem('lastActiveRole');
  
  // 2. Call logout server action
  await logout();
  
  // 3. Sign out Firebase
  await signOutFirebase();
  
  // 4. Redirect to login
  router.replace('/auth/login');
}
```

---

## 9. Query Parameters

| Param | Type | Purpose | Behavior |
|-------|------|---------|----------|
| `?redirect=[url]` | string | Post-selection destination | Override default dashboard if valid |
| `?from=login` | string | Indicates source | Analytics/logging only |
| `?from=switcher` | string | From Role Switcher | May show different UI text (future) |

### 9.1 Redirect Validation

```typescript
function isValidRedirect(url: string, selectedRole: 'candidate' | 'company'): boolean {
  // Must be internal URL
  if (!url.startsWith('/')) return false;
  
  // Role-appropriate paths
  if (selectedRole === 'candidate') {
    return /^\/candidates\//.test(url) || 
           /^\/jobs\//.test(url) || 
           /^\/chat/.test(url) ||
           /^\/notifications/.test(url);
  }
  
  if (selectedRole === 'company') {
    return /^\/companies\//.test(url) || 
           /^\/chat/.test(url) ||
           /^\/notifications/.test(url);
  }
  
  return false;
}
```

---

## 10. Auto-Skip Logic (Login Flow Integration)

This logic should be added to `navigateUserByRole()` in the login flow:

```typescript
// In navigateUserByRole() after determining user has multiple roles
if (hasRole('candidate') && hasRole('company') && !hasRole('chancedee')) {
  // Check for saved preference
  const savedRole = localStorage.getItem('lastActiveRole') as 'candidate' | 'company' | null;
  
  if (savedRole && hasRole(savedRole)) {
    // Valid saved preference - skip select-role page
    setActiveRole(savedRole);
    
    if (savedRole === 'candidate') {
      return router.replace(`/candidates/${user.uid}`);
    } else {
      return router.replace(`/companies/${user.company_id}/dashboard`);
    }
  }
  
  // No saved preference - show select-role page
  return router.replace('/auth/select-role');
}
```

### 10.1 Clearing Saved Preference

Users can clear their saved preference via:

1. **This page:** Unchecking "Remember" and selecting a role doesn't save
2. **Settings page:** `/candidates/[id]/settings` or `/companies/[id]/dashboard/settings` → Account tab → "เปลี่ยนบทบาทเริ่มต้น" (Change default role)
3. **Logout:** Clears `localStorage.lastActiveRole`

---

## 11. Error Handling

| Error | Condition | Display | Recovery |
|-------|-----------|---------|----------|
| Not authenticated | No session/Firebase user | Redirect | → `/auth/login` |
| Single role only | User has only one role | Auto-redirect | → that role's dashboard |
| Company fetch failed | Can't load company name | Show fallback | Display "นายจ้าง" instead of company name |
| Invalid saved role | localStorage role not in user's roles | Clear & show page | Remove invalid localStorage, show selection |
| Network error on redirect | Navigation fails | Toast | Show retry option |

### 11.1 Error Display

No inline errors on this page. Errors trigger redirects or fallbacks.

### 11.2 Defensive Checks

```typescript
// Page load checks
useEffect(() => {
  // 1. Must be authenticated
  if (!user || sessionState !== 'valid') {
    router.replace('/auth/login');
    return;
  }
  
  // 2. Platform admin bypasses this
  if (user.roles.includes('chancedee')) {
    router.replace('/platform/dashboard');
    return;
  }
  
  // 3. Pending users shouldn't be here
  if (user.roles.includes('pending')) {
    router.replace('/auth/status?type=pending');
    return;
  }
  
  // 4. Single role - auto redirect
  const hasCandidate = user.roles.includes('candidate');
  const hasCompany = user.roles.includes('company') && user.company_id;
  
  if (hasCandidate && !hasCompany) {
    router.replace(`/candidates/${user.uid}`);
    return;
  }
  
  if (hasCompany && !hasCandidate) {
    router.replace(`/companies/${user.company_id}/dashboard`);
    return;
  }
  
  // 5. Check saved preference
  const savedRole = localStorage.getItem('lastActiveRole');
  if (savedRole === 'candidate' && hasCandidate) {
    setActiveRole('candidate');
    router.replace(`/candidates/${user.uid}`);
    return;
  }
  if (savedRole === 'company' && hasCompany) {
    setActiveRole('company');
    router.replace(`/companies/${user.company_id}/dashboard`);
    return;
  }
  
  // 6. Clear invalid saved preference
  if (savedRole && savedRole !== 'candidate' && savedRole !== 'company') {
    localStorage.removeItem('lastActiveRole');
  }
  
  // 7. Show selection UI
  setPageReady(true);
}, [user, sessionState]);
```

---

## 12. Accessibility

| Element | Requirement | Implementation |
|---------|-------------|----------------|
| Cards | Keyboard navigable | `tabIndex={0}`, `onKeyDown` for Enter/Space |
| Cards | Screen reader | `role="button"`, `aria-label="เลือกบทบาท {role}"` |
| Checkbox | Label association | `<label htmlFor="remember">` |
| Focus | Visible indicator | Focus ring on cards and checkbox |
| Page | Title | `<title>เลือกบทบาท - ChanceDee</title>` |

---

## 13. Analytics Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `page_view` | Page load | `page: '/auth/select-role'` |
| `role_selected` | Card click | `role`, `remembered`, `source` |
| `auto_skip` | Saved pref used | `role`, `source: 'saved_preference'` |
| `logout_from_select` | Logout clicked | - |

---

## 14. Implementation Checklist

### 14.1 Page Component

- [ ] Create `/app/auth/select-role/page.tsx`
- [ ] Implement CHECK_AUTH state
- [ ] Implement auto-skip for saved preference
- [ ] Implement auto-redirect for single role
- [ ] Implement defensive redirects (chancedee, pending)

### 14.2 UI Components

- [ ] Create `RoleSelectionCard` component
- [ ] Implement card hover/selected states
- [ ] Add Remember checkbox
- [ ] Add Logout link
- [ ] Responsive layout (flex → stack)

### 14.3 State Management

- [ ] Wire `activeRoleAtom` (or `navBarAtom` until renamed)
- [ ] Wire `localStorage.lastActiveRole`
- [ ] Add company name fetch hook

### 14.4 Integration

- [ ] Update `navigateUserByRole()` to check saved preference
- [ ] Update `navigateUserByRole()` to route multi-role users here
- [ ] Add to middleware route protection (require auth)

### 14.5 Testing

- [ ] Test: Multi-role user sees selection
- [ ] Test: Single role user auto-redirects
- [ ] Test: Saved preference skips page
- [ ] Test: Unchecked "Remember" doesn't save
- [ ] Test: Logout clears preference
- [ ] Test: Invalid localStorage handled gracefully
- [ ] Test: Company name displays correctly
- [ ] Test: Mobile responsive layout

---

## 15. Decisions Log

| Decision | Chosen | Rationale | Date |
|----------|--------|-----------|------|
| Remember checkbox behavior | Skips page on future logins | Better UX for regular users, Role Switcher available for changes | 2025-12-07 |
| Browser back behavior | `router.replace()` | User already authenticated, back to login is confusing | 2025-12-07 |
| Selection animation | Immediate redirect | Login redirect already provides loading feedback | 2025-12-07 |
| Single role handling | Auto-redirect silently | Defensive code, shouldn't happen if routing correct | 2025-12-07 |
| Company name fetch | Accept additional fetch | Likely cached, better UX than generic "นายจ้าง" | 2025-12-07 |
| State atom naming | Use `activeRoleAtom` in spec | Semantic clarity, migration from `navBarAtom` | 2025-12-07 |

---

## 16. System Constraints Reference

### Current Constraints

| Constraint | Detail |
|------------|--------|
| Single-company model | Users belong to ONE company (`company_id: string`, not array) |
| Multi-role definition | `candidate` + `company`, NOT multiple companies |
| Session duration | 1-hour cookie (migration to 1-day planned) |
| Role switching | Updates `activeRoleAtom` globally, persists to localStorage |

### State Rename (Migration Note)

| Old | New | Reason |
|-----|-----|--------|
| `navBarAtom` | `activeRoleAtom` | Semantic — role drives UI, not vice versa |

---

## 17. Related Routes

| Route | Relationship |
|-------|--------------|
| `/auth/login` | Predecessor — routes here for multi-role users |
| `/candidates/[id]` | Destination — candidate dashboard |
| `/companies/[id]/dashboard` | Destination — company dashboard |
| `/candidates/[id]/settings` | Related — can change default role |
| `/companies/[id]/dashboard/settings` | Related — can change default role |

---

## 18. Open Questions

| Question | Status | Notes |
|----------|--------|-------|
| Settings UI for changing default role | ⏳ Deferred | Add to settings page spec when created |
| Role Switcher "change default" option | ⏳ Deferred | Consider adding to Role Switcher dropdown |

---

## Appendix A: TypeScript Types

```typescript
// Role selection
type SelectableRole = 'candidate' | 'company';

// Page state
type PageState = 
  | 'checking' 
  | 'ready' 
  | 'redirecting';

// Query params
interface SelectRoleQueryParams {
  redirect?: string;
  from?: 'login' | 'switcher';
}

// Card props
interface RoleCardProps {
  role: SelectableRole;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  features: string[];
  onSelect: () => void;
  disabled?: boolean;
}

// Company info (for display)
interface CompanyDisplayInfo {
  name_th: string;
  name_en?: string;
}
```

---

## Appendix B: Component File Structure

```
src/
├── app/
│   └── auth/
│       └── select-role/
│           └── page.tsx           # Main page component
├── components/
│   └── auth/
│       └── RoleSelectionCard.tsx  # Reusable card component
└── hooks/
    └── useCompanyInfo.ts          # Company name fetch (if not exists)
```

---

## Appendix C: Source References

| Section | Source |
|---------|--------|
| Multi-role routing | `AUTH-R01_login_RIS.md` Section 9.3 |
| Role Switcher component | `01-navigation-shells.md` Section 2.10 |
| Shell transitions | `01-navigation-shells.md` Section 2.9 |
| User roles structure | `data-entities_user-info.md` |
| navBarAtom | `state-inventory_atoms.md` line 401 |
| navigateUserByRole | `features_authentication.md` AUTH-016 |

---

*End of RIS: /auth/select-role (AUTH-R07) v1.2*
