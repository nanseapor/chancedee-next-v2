# RIS: /auth/session-expired

**Route ID:** AUTH-R08  
**Version:** 1.2  
**Status:** Draft  
**Created:** 2025-12-08  
**Last Updated:** 2025-12-09

**Changes in v1.2:**
- Added Cross-References section linking to AUTH-R00 shared patterns

**Changes in v1.1:**
- Updated Section 6.2 to use 5-column State Transition Table format per RIS_ORCHESTRATOR_GUIDE.md

---

## Cross-References

This document references shared specifications from **AUTH-R00_cross-cutting_RIS.md**.

| Topic | AUTH-R00 Section |
|-------|------------------|
| Error UX standards | Section 2 |
| **Session management (expiry detection, modal vs route)** | **Section 3** |
| i18n & Thai copy guidelines | Section 6 |
| Query parameter conventions (?redirect) | Section 12 |
| Thai copy reference | Appendix B |

---

## 1. Route Metadata

| Property | Value |
|----------|-------|
| Route Path | `/auth/session-expired` |
| Shell | Minimal Shell |
| Purpose | Display session expiry notification and provide re-login path |
| Complexity | Low |
| Phase | 1 (Foundation) |
| UI Spec | `01-navigation-shells.md` Section 2.6 (Minimal Shell) |
| Auth Required | No (session already expired) |

---

## 2. Domain Classification

### Primary Domain: Authentication

- **Owns:** Session expiry display, re-login navigation
- **Mutations:** None (display-only route)

### Secondary Domains

None - this is a terminal display route with no secondary domain dependencies.

### Global Domains

| Domain | Requirement |
|--------|-------------|
| Auth | Source of redirect (session expired state) |
| Chat | Not available (session expired) |
| Notifications | Not available (session expired) |

---

## 3. Feature Mapping

| Feature ID | Feature Name | Coverage | Reference |
|------------|--------------|----------|-----------|
| AUTH-011 | Session Expiration Handling | Full | `features_authentication.md` lines 699-745 |
| AUTH-010 | Session Management | Reference | `features_authentication.md` lines 637-696 |

### AUTH-011 Implementation Notes

Per `features_authentication.md` AUTH-011:
- Triggered by automatic redirect when session expires
- Clears localStorage (`sessionCreated`, `lastActivity`)
- Calls Firebase `signOut()` to clear client-side auth state
- Originally had 10-second auto-redirect countdown (optional for new implementation)
- Manual "Re-login" button for immediate navigation

---

## 4. Data Contract

### 4.1 Read Operations

| Data | Collection | Fields | SWR Key |
|------|------------|--------|---------|
| None | - | - | - |

This route performs **no data fetching**. User is already logged out.

### 4.2 Write Operations

| Action | Collection | Server Action | Trigger |
|--------|------------|---------------|---------|
| None | - | - | - |

No write operations. Cleanup should already be done by the session expiry detection mechanism before redirect.

---

## 5. State Contract

### 5.1 Atoms (Read-Only Context)

| Atom | Type | R/W | Purpose |
|------|------|-----|---------|
| `sessionStateAtom` | `'expired'` | R | Should be `'expired'` when arriving here |

**Note:** By the time user reaches this page, the session state should already be `'expired'` or `'none'`. This route does not modify atoms.

### 5.2 Hooks

| Hook | Returns | Purpose |
|------|---------|---------|
| `useSearchParams` | Query params | Read `?redirect` parameter |
| `useRouter` | Navigation | Navigate to login or home |

### 5.3 SWR Keys

None - this route does not use SWR data fetching.

### 5.4 Local Component State

| State | Type | Initial | Purpose |
|-------|------|---------|---------|
| None required | - | - | Static display page |

---

## 6. UI State Machine

### 6.1 Page State Automaton

This route has a single display state with navigation events:

```
[DISPLAY]
    │
    ├── "เข้าสู่ระบบอีกครั้ง" clicked ──► Navigate to /auth/login
    │
    ├── "กลับหน้าแรก" clicked ──► Navigate to /
    │
    └── Logo clicked ──► Navigate to /
```

### 6.2 Page State Transition Table

| Current State | Event | Next State | Guard Condition | Side Effects |
|---------------|-------|------------|-----------------|--------------|
| `DISPLAY` | `LOGIN_CLICK` | - | - | router.push('/auth/login' + redirectParam) |
| `DISPLAY` | `HOME_CLICK` | - | - | router.push('/') |
| `DISPLAY` | `LOGO_CLICK` | - | - | router.push('/') |

**Note:** This is a terminal page with a single display state. All events navigate away from the page, so there is no "Next State" within this route.

---

## 7. Component-Action Wiring

| Component | Trigger | Action | Effect |
|-----------|---------|--------|--------|
| ChanceDee Logo | Click | `router.push('/')` | Navigate to home |
| "เข้าสู่ระบบอีกครั้ง" Button | Click | `handleLogin()` | Navigate to login with optional redirect |
| "กลับหน้าแรก" Link | Click | `router.push('/')` | Navigate to home |

### 7.1 Component Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                      [ChanceDee Logo]                           │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                                                           │  │
│  │                   ⏱️ เซสชันหมดอายุ                        │  │
│  │                                                           │  │
│  │  เซสชันของคุณหมดอายุแล้ว                                   │  │
│  │  กรุณาเข้าสู่ระบบอีกครั้งเพื่อดำเนินการต่อ                    │  │
│  │                                                           │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │           [เข้าสู่ระบบอีกครั้ง]                        │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │                                                           │  │
│  │                    [กลับหน้าแรก]                          │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│              [ข้อกำหนดการใช้งาน] | [นโยบายความเป็นส่วนตัว]       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Query Parameters

| Param | Type | Purpose | Example |
|-------|------|---------|---------|
| `redirect` | `string` (URL-encoded) | URL to redirect back after re-login | `?redirect=%2Fcandidates%2F123` |

### 8.1 Redirect Parameter Handling

```typescript
// Read redirect param
const searchParams = useSearchParams();
const redirectUrl = searchParams.get('redirect');

// Handle login navigation
function handleLogin() {
  const loginUrl = redirectUrl 
    ? `/auth/login?redirect=${encodeURIComponent(redirectUrl)}`
    : '/auth/login';
  router.push(loginUrl);
}
```

**Validation:** The redirect URL should be validated server-side when used on `/auth/login` to prevent open redirect vulnerabilities. This route just passes it through.

---

## 9. Session Expiry Modal vs Session Expired Route

Per `00-global-components.md` Section 1.5, there are two mechanisms for handling session expiry:

| Mechanism | When Used | Behavior |
|-----------|-----------|----------|
| **Session Expiry Modal** | User still on authenticated page, API returns 401 | In-page modal overlay, re-auth without leaving page, preserves page state, retries failed request |
| **`/auth/session-expired` Route** | Middleware detects expired cookie OR redirect from session renewal hook | Full page redirect, clean slate UX, user must navigate back manually |

### 9.1 Trigger Scenarios

**Session Expiry Modal triggered when:**
- API call during active use returns 401
- User can re-authenticate in-place and continue

**`/auth/session-expired` route triggered when:**
- Middleware intercepts request with expired/invalid session cookie
- `useSessionRenewal` hook detects expiry and redirects
- User navigates to protected route after session expired

### 9.2 Implementation Note

The `/auth/session-expired` route is the "final destination" when in-place re-auth is not possible or when the user has been idle too long. The Session Expiry Modal is a softer, in-context approach for active users.

---

## 10. Error Handling

| Error | Condition | Display | Recovery |
|-------|-----------|---------|----------|
| N/A | - | - | - |

This is a display-only page. No error states are expected. Navigation failures would be handled by the browser.

---

## 11. Implementation Checklist

### 11.1 Page Component

- [ ] Create `/app/auth/session-expired/page.tsx`
- [ ] Use Minimal Shell layout
- [ ] Read `?redirect` query parameter
- [ ] Display expiry message (Thai)
- [ ] "เข้าสู่ระบบอีกครั้ง" primary button (Teal)
- [ ] "กลับหน้าแรก" secondary link
- [ ] Logo links to home
- [ ] Minimal footer with legal links

### 11.2 Optional Enhancements

- [ ] Auto-redirect countdown (10 seconds) - per AUTH-011 original behavior
- [ ] Countdown display "กำลังนำคุณไปหน้าเข้าสู่ระบบใน X วินาที..."
- [ ] Cancel countdown on any user interaction

### 11.3 Testing

- [ ] Direct navigation to `/auth/session-expired` displays correctly
- [ ] `?redirect` parameter passed to login page
- [ ] "เข้าสู่ระบบอีกครั้ง" navigates to `/auth/login`
- [ ] "กลับหน้าแรก" navigates to `/`
- [ ] Logo navigates to `/`
- [ ] Page renders correctly on mobile

---

## 12. System Constraints

| Constraint | Value | Notes |
|------------|-------|-------|
| Session duration | 1-hour cookie | May be extended to 1-day in future |
| Expiry detection | Middleware + `useSessionRenewal` hook | Checks cookie validity |
| Auto-refresh | Not implemented | User must re-login manually |

### 12.1 State Rename (Migration Note)

| Old | New | Reason |
|-----|-----|--------|
| `navBarAtom` | `activeRoleAtom` | Semantic — role drives UI, not vice versa |

*Note: This route doesn't use `activeRoleAtom` since session is already expired and user is effectively unauthenticated.*

---

## 13. Decisions Log

| Decision | Chosen | Rationale |
|----------|--------|-----------|
| No auto-redirect countdown | Defer | Keep simple for v1.0, add if requested |
| Pass-through redirect param | Yes | Preserves user intent, validate on login |
| No data fetching | Yes | User already logged out, nothing to fetch |
| Static display only | Yes | Simplest implementation for notification page |

---

## 14. Source References

| Section | Source File |
|---------|-------------|
| AUTH-011 Session Expiration | `features_authentication.md` lines 699-745 |
| AUTH-010 Session Management | `features_authentication.md` lines 637-696 |
| Session Expiry Modal | `00-global-components.md` Section 1.5 |
| Minimal Shell | `01-navigation-shells.md` Section 2.6 |
| sessionStateAtom | `state-inventory_atoms.md` lines 38-46 |

---

*End of RIS: /auth/session-expired (AUTH-R08) v1.1*
