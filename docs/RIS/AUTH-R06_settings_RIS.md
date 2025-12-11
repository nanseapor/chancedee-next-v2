# RIS: /auth/settings

**Route ID:** AUTH-R06  
**Version:** 1.3  
**Status:** Draft  
**Created:** 2025-12-08  
**Last Updated:** 2025-12-09

**Changes in v1.3:**
- Added Cross-References section linking to AUTH-R00 shared patterns
- Renamed `navBarAtom` → `activeRoleAtom` per AUTH-R00 naming convention

**Changes in v1.2:**
- Added Section 6.1.1 Page State Transition Table (5-column format per RIS_ORCHESTRATOR_GUIDE.md)
- Added Section 6.5 Entity State Automaton
- Added Section 6.6 Component State Automaton

**Changes in v1.1:**
- Added company admin deletion restriction (sole admin cannot delete account)
- Removed data export feature from Privacy tab (hidden entirely)
- Clarified pending user tab visibility

---

## Cross-References

This document references shared specifications from **AUTH-R00_cross-cutting_RIS.md**.

| Topic | AUTH-R00 Section |
|-------|------------------|
| Server actions architecture | Section 1 |
| Error UX standards | Section 2 |
| Session management | Section 3 |
| **Global atoms (activeRoleAtom)** | **Section 4** |
| Rate limiting | Section 5 |
| i18n & Thai copy guidelines | Section 6 |
| Analytics events | Section 7 |
| Role semantics | Section 9 |
| Error code → message mapping | Appendix A |
| Thai copy reference | Appendix B |
| Server action signatures | Appendix C |

---

## 1. Route Metadata

| Property | Value |
|----------|-------|
| Route Path | `/auth/settings` |
| Shell | Dynamic (based on `activeRoleAtom`) |
| Purpose | Centralized account settings for all authenticated users |
| Complexity | Medium |
| Phase | 1 (Foundation) |
| UI Spec | `08-component-index.md` → Auth Routes → "Tab Navigation, Notification Toggles, Password Form, Privacy Settings" |

### Shell Selection

| `activeRoleAtom` | Shell | Notes |
|------------------|-------|-------|
| `candidate` | Candidate Shell | Full navigation |
| `company` | Company Shell | Full navigation |
| `chancedee` | Platform Admin Shell | Full navigation |
| `pending` | Minimal Shell | Limited access (hide Notifications tab) |
| `anonymous` | N/A | Redirect to `/auth/login` |

---

## 2. Domain Classification

### Primary Domain: Authentication

- **Owns:** Account-level settings management
- **Mutations:**
  - Change password (AUTH-008)
  - Create password for social users (AUTH-009)
  - Update notification preferences
  - Update default role preference
  - Submit account deletion request (AUTH-012)

### Secondary Domains

| Domain | Role | Access |
|--------|------|--------|
| Notifications | Preference configuration | Write: email/push toggles |
| Consent | Privacy settings | Read: link to cookie settings |
| Candidate | Context for multi-role users | Read: role availability |
| Company | Context for multi-role users | Read: role availability, company name |

### Global Domains

| Domain | Requirement |
|--------|-------------|
| Auth | User must be authenticated |
| Chat | Available via shell (except pending users) |
| Notifications | Available via shell (except pending users) |

---

## 3. Feature Mapping

### Existing Features (Preserve - P0)

| Feature ID | Feature Name | Coverage | Tab | Notes |
|------------|--------------|----------|-----|-------|
| AUTH-008 | Change Password | Full | Password | Two-step: verify old → set new |
| AUTH-009 | Create Password (Social Users) | Full | Password | For Google/Facebook-only users |
| AUTH-012 | Account Deletion Request | Full | Delete Account | Form + document upload |
| AUTH-010 | Session Management | Partial | All | Session must be valid |

### New Features (This Route Introduces)

| Feature | Description | Tab | Priority |
|---------|-------------|-----|----------|
| Default Role Preference | Multi-role users can set auto-skip behavior | Account | P0 |
| Notification Preferences | Email/push toggles per category | Notifications | P1 |
| Linked Providers Display | Show Google/Facebook connection status | Account | P2 |

### Related Features (Other Routes)

| Feature | Route | Relationship |
|---------|-------|--------------|
| Cookie Settings (CONSENT-001) | `/privacy/cookie-settings` | Privacy tab links here |
| Role Selection | `/auth/select-role` | Default role preference affects this |
| Candidate Settings | `/candidates/[id]/settings` | Links to this route via "Account Link" |
| Company Settings | `/companies/[id]/dashboard/settings` | Links to this route |

---

## 4. Data Contract

### 4.1 Read Operations

| Data | Collection | Fields | Condition | SWR Key |
|------|------------|--------|-----------|---------|
| User Account | `user_accounts` | `uid`, `roles`, `company_id`, `notification_preferences` | Authenticated | `user-data-${uid}` |
| Firebase User | Firebase Auth | `providerData`, `email`, `emailVerified` | Authenticated | N/A (client SDK) |
| Company Info | `company_information` | `name_th`, `name_en` | If multi-role user | `company-${companyId}` |
| Company Admin Count | `user_accounts` | count where `company_id` matches and has `admin` role | Delete tab, if company admin | N/A (on-demand) |

### 4.2 Write Operations

| Action | Collection | Fields | Server Action | Trigger |
|--------|------------|--------|---------------|---------|
| Change Password | Firebase Auth | password | `updatePassword()` | Password tab submit |
| Create Password | Firebase Auth | password provider | `signUpWithEmail()` | Password tab submit |
| Update Notifications | `user_accounts` | `notification_preferences` | `updateUserNotificationPreferences()` | Notifications tab toggle |
| Set Default Role | `localStorage` | `lastActiveRole` | N/A (client-side) | Account tab toggle/select |
| Create Delete Request | `delete_requests` | all fields | `webDeleteRequestCreate()` | Delete tab submit |
| Upload Delete Docs | Firebase Storage | files | `uploadFile()` | Delete tab file select |

### 4.3 Proposed Notification Preferences Schema

```typescript
// To be added to user_accounts collection
interface NotificationPreferences {
  email: {
    newJobs: boolean;           // Job recommendations
    applicationUpdates: boolean; // Status changes
    interviewReminders: boolean; // Interview scheduled/reminders
    weeklyDigest: boolean;       // Weekly summary
    marketing: boolean;          // Promotional emails
  };
  push: {
    newMessages: boolean;        // Chat messages
    applicationUpdates: boolean; // Status changes
    interviewReminders: boolean; // Interview alerts
  };
}

// Default values for new users
const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  email: {
    newJobs: true,
    applicationUpdates: true,
    interviewReminders: true,
    weeklyDigest: false,
    marketing: false,
  },
  push: {
    newMessages: true,
    applicationUpdates: true,
    interviewReminders: true,
  },
};
```

---

## 5. State Contract

### 5.1 Atoms

| Atom | Type | R/W | Purpose |
|------|------|-----|---------|
| `userAtom` | `userDataProps \| null` | R | Get user data, roles, company_id |
| `firebaseUserAtom` | `User \| null` | R | Get provider data, email |
| `activeRoleAtom` | `'candidate' \| 'company' \| 'chancedee' \| 'pending' \| 'anonymous'` | R | Determine shell, tab visibility |
| `sessionStateAtom` | `SessionState` | R | Verify session valid |

**Migration Note:** `navBarAtom` is being renamed to `activeRoleAtom`. This RIS uses the new name.

### 5.2 Hooks

| Hook | Returns | Purpose |
|------|---------|---------|
| `useFirebaseAuth` | `{ user, userChancedee, loading }` | Auth state, user data |
| `useCompanyInfo` | `{ company, isLoading }` | Fetch company name for display |

### 5.3 Local Storage Keys

| Key | Type | Purpose |
|-----|------|---------|
| `lastActiveRole` | `'candidate' \| 'company' \| null` | Default role preference |

### 5.4 Local Component State

| State | Type | Initial | Purpose |
|-------|------|---------|---------|
| `activeTab` | `TabId` | From URL or `'account'` | Current tab selection |
| `passwordStep` | `1 \| 2` | `1` | Password change step |
| `isSubmitting` | `boolean` | `false` | Form submission state |
| `rememberRole` | `boolean` | From localStorage | Auto-skip checkbox state |

### 5.5 SWR Keys

| Key | Data | Invalidate On |
|-----|------|---------------|
| `user-data-${uid}` | User account data | Notification preferences change |
| `company-${companyId}` | Company info | N/A (read-only here) |

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
│  NOT_AUTHED     │  │  PENDING_USER   │  │     READY       │
│ → /auth/login   │  │  (limited tabs) │  │  (all tabs)     │
└─────────────────┘  └────────┬────────┘  └────────┬────────┘
                              │                    │
                              └────────┬───────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │   TAB_ACTIVE    │
                              │  (tab content)  │
                              └─────────────────┘
```

#### 6.1.1 Page State Transition Table

| Current State | Event | Next State | Guard Condition | Side Effects |
|---------------|-------|------------|-----------------|--------------|
| `CHECK_AUTH` | `NO_SESSION` | `NOT_AUTHED` | sessionState !== 'valid' | router.replace('/auth/login') |
| `CHECK_AUTH` | `IS_PENDING` | `PENDING_USER` | roles.includes('pending') && !roles.includes('company') | hide notifications tab |
| `CHECK_AUTH` | `IS_ACTIVE` | `READY` | !roles.includes('pending') | show all tabs |
| `PENDING_USER` | `TAB_CHANGE` | `TAB_ACTIVE` | tab !== 'notifications' | setActiveTab() |
| `READY` | `TAB_CHANGE` | `TAB_ACTIVE` | - | setActiveTab() |
| `TAB_ACTIVE` | `FORM_SUBMIT` | `SUBMITTING` | form.isValid | tab-specific action |
| `SUBMITTING` | `SUCCESS` | `TAB_ACTIVE` | - | show success toast |
| `SUBMITTING` | `ERROR` | `TAB_ACTIVE` | - | show error message |

### 6.2 Tab State Machine

```
[account] ←──?tab=account──┐
    │                      │
    ├──?tab=password───→ [password]
    │                      │
    ├──?tab=notifications→ [notifications] (hidden if pending)
    │                      │
    ├──?tab=privacy────→ [privacy]
    │                      │
    └──?tab=delete─────→ [delete]
```

### 6.3 Password Tab States

```
┌─────────────────────────────────────────────────────────────┐
│                    PASSWORD TAB                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    hasPasswordProvider?    ┌─────────────┐│
│  │   CHANGE    │◄──────── true ────────────►│   CREATE    ││
│  │  PASSWORD   │                            │  PASSWORD   ││
│  └──────┬──────┘                            └──────┬──────┘│
│         │                                          │       │
│         ▼                                          │       │
│  ┌─────────────┐                                   │       │
│  │   STEP 1    │                                   │       │
│  │ Verify Old  │                                   │       │
│  └──────┬──────┘                                   │       │
│         │ valid                                    │       │
│         ▼                                          │       │
│  ┌─────────────┐                                   │       │
│  │   STEP 2    │◄──────────────────────────────────┘       │
│  │  Set New    │                                           │
│  └──────┬──────┘                                           │
│         │ success                                          │
│         ▼                                                  │
│  ┌─────────────┐                                           │
│  │  AUTO_LOGOUT│ → /auth/login                             │
│  └─────────────┘                                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.4 Delete Account States

```
[idle] ──fill_form──► [form_valid] ──upload_files──► [files_ready]
                                                          │
                                                      submit
                                                          │
                                                          ▼
                                              [submitting] ──success──► [redirect]
                                                    │                      │
                                                  error                    ▼
                                                    │         /auth/delete-data-request/[code]
                                                    ▼
                                              [error_state]
```

### 6.5 Entity State Automaton

| Entity | Current State | Event | Next State | Actor | Side Effects |
|--------|---------------|-------|------------|-------|--------------|
| `Firebase Auth` (password) | `no_password` | `CREATE_PASSWORD` | `has_password` | User | signUpWithEmail() adds password provider |
| `Firebase Auth` (password) | `has_password` | `CHANGE_PASSWORD` | `has_password` | User | updatePassword() |
| `user_accounts.notification_preferences` | `current_prefs` | `TOGGLE_PREF` | `updated_prefs` | User | updateUserNotificationPreferences() |
| `delete_requests` | `(not exists)` | `CREATE_REQUEST` | `pending` | User | create doc with reason, files |
| `user_accounts` | `active` | `DELETE_INITIATED` | `deletion_pending` | User | (handled by delete request processing) |
| `localStorage.lastActiveRole` | `null` | `SET_DEFAULT` | `role_value` | User | client-side only |
| `localStorage.lastActiveRole` | `role_value` | `CLEAR_DEFAULT` | `null` | User | client-side only |

### 6.6 Component State Automaton

| Component | Current State | Event | Next State | Condition |
|-----------|---------------|-------|------------|-----------|
| `TabNavigation` | `account` | `TAB_CLICK` | `password` | ?tab=password |
| `TabNavigation` | `account` | `TAB_CLICK` | `notifications` | ?tab=notifications && !isPending |
| `TabNavigation` | `account` | `TAB_CLICK` | `privacy` | ?tab=privacy |
| `TabNavigation` | `account` | `TAB_CLICK` | `delete` | ?tab=delete |
| `TabNavigation` | `*` | `TAB_CLICK` | `account` | ?tab=account |
| `PasswordForm` | `change_step1` | `SUBMIT` | `validating` | hasPasswordProvider |
| `PasswordForm` | `create` | `SUBMIT` | `validating` | !hasPasswordProvider |
| `PasswordForm` | `validating` | `CURRENT_VALID` | `change_step2` | old password correct |
| `PasswordForm` | `validating` | `CURRENT_INVALID` | `change_step1` | old password wrong |
| `PasswordForm` | `change_step2` | `SUBMIT` | `submitting` | newPassword.isValid |
| `PasswordForm` | `create` | `SUBMIT` | `submitting` | newPassword.isValid |
| `PasswordForm` | `submitting` | `SUCCESS` | `logout_pending` | - |
| `PasswordForm` | `logout_pending` | `LOGOUT` | - | signOut(), router.push('/auth/login') |
| `NotificationToggle` | `on` | `TOGGLE` | `saving` | - |
| `NotificationToggle` | `off` | `TOGGLE` | `saving` | - |
| `NotificationToggle` | `saving` | `SAVED` | `on` | newValue === true |
| `NotificationToggle` | `saving` | `SAVED` | `off` | newValue === false |
| `NotificationToggle` | `saving` | `ERROR` | `previous_state` | - |
| `DeleteForm` | `idle` | `INPUT` | `form_valid` | reason filled |
| `DeleteForm` | `form_valid` | `FILE_SELECT` | `files_ready` | files uploaded |
| `DeleteForm` | `files_ready` | `SUBMIT` | `submitting` | - |
| `DeleteForm` | `submitting` | `SUCCESS` | `redirect` | - |
| `DeleteForm` | `submitting` | `ERROR` | `error_state` | - |
| `DeleteForm` | `redirect` | `NAVIGATE` | - | router.push('/auth/delete-data-request/{code}') |
| `RoleSelector` | `idle` | `SELECT` | `selected` | multi-role user |
| `RoleSelector` | `selected` | `SAVE_DEFAULT` | `saved` | rememberChoice checked |

---

## 7. UI Specification

### 7.1 Layout (Desktop)

```
┌─────────────────────────────────────────────────────────────────┐
│  [← กลับ]                    การตั้งค่าบัญชี                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [บัญชี] [รหัสผ่าน] [การแจ้งเตือน] [ความเป็นส่วนตัว] [ลบบัญชี]      │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │                    [Tab Content]                        │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Tab Configuration

| Tab ID | Thai Label | English | Visible When | Default |
|--------|------------|---------|--------------|---------|
| `account` | บัญชี | Account | Always | ✓ |
| `password` | รหัสผ่าน | Password | Always | |
| `notifications` | การแจ้งเตือน | Notifications | `activeRole !== 'pending'` | |
| `privacy` | ความเป็นส่วนตัว | Privacy | Always | |
| `delete` | ลบบัญชี | Delete Account | Always | |

### 7.3 Account Tab Layout

```
┌─────────────────────────────────────────────────────────────┐
│  บัญชี                                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  อีเมล                                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  user@example.com                        [Google]   │   │
│  └─────────────────────────────────────────────────────┘   │
│  ✓ ยืนยันอีเมลแล้ว                                           │
│                                                             │
│  ────────────────────────────────────────────────────────   │
│                                                             │
│  ผู้ให้บริการที่เชื่อมต่อ                                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [G] Google                              เชื่อมต่อแล้ว │   │
│  │  [f] Facebook                            ไม่ได้เชื่อมต่อ │   │
│  │  [✉] อีเมล/รหัสผ่าน                        เชื่อมต่อแล้ว │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ────────────────────────────────────────────────────────   │
│  (Below section only shown for multi-role users)            │
│                                                             │
│  บทบาทเริ่มต้นเมื่อเข้าสู่ระบบ                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ☑ ข้ามหน้าเลือกบทบาท                                │   │
│  │                                                     │   │
│  │  บทบาทที่เลือกไว้: [ผู้หางาน ▼]                        │   │
│  │                   ├─ ผู้หางาน                        │   │
│  │                   └─ นายจ้าง ({Company Name})        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  เมื่อยกเลิกเลือก จะแสดงหน้าเลือกบทบาททุกครั้งที่เข้าสู่ระบบ       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Account Tab Components

| Component | Purpose | Condition | Action |
|-----------|---------|-----------|--------|
| Email Display | Show registered email | Always | Read-only |
| Email Verified Badge | Show verification status | Always | Read-only |
| Provider List | Show linked auth providers | Always | Read-only (future: unlink) |
| Default Role Section | Auto-skip role selection | `roles.length > 1` | Toggle + Dropdown |
| Auto-Skip Checkbox | Enable/disable auto-skip | Multi-role | Toggle localStorage |
| Role Dropdown | Select default role | Auto-skip enabled | Update localStorage |

#### Default Role Logic

```typescript
// Visibility check
const isMultiRole = user.roles.includes('candidate') && user.roles.includes('company');

// Read current preference
const savedRole = localStorage.getItem('lastActiveRole'); // 'candidate' | 'company' | null
const autoSkipEnabled = savedRole !== null;

// Toggle handler
function handleAutoSkipToggle(enabled: boolean) {
  if (!enabled) {
    // Clear preference - will show select-role page on next login
    localStorage.removeItem('lastActiveRole');
  } else {
    // Set to current active role
    localStorage.setItem('lastActiveRole', activeRole);
  }
}

// Change default role
function handleDefaultRoleChange(role: 'candidate' | 'company') {
  localStorage.setItem('lastActiveRole', role);
}
```

### 7.4 Password Tab Layout

#### Change Password Form (AUTH-008)

```
┌─────────────────────────────────────────────────────────────┐
│  เปลี่ยนรหัสผ่าน                                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ขั้นตอนที่ 1: ยืนยันรหัสผ่านเดิม                                │
│                                                             │
│  อีเมล                                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  user@example.com                                   │   │
│  └─────────────────────────────────────────────────────┘   │
│  (Read-only)                                                │
│                                                             │
│  รหัสผ่านเดิม *                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ••••••••                                     [👁]  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│                                        [ยืนยันรหัสผ่าน]      │
│                                                             │
└─────────────────────────────────────────────────────────────┘

(After Step 1 success)

┌─────────────────────────────────────────────────────────────┐
│  เปลี่ยนรหัสผ่าน                                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ขั้นตอนที่ 2: ตั้งรหัสผ่านใหม่                                  │
│                                                             │
│  รหัสผ่านใหม่ *                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ••••••••                                     [👁]  │   │
│  └─────────────────────────────────────────────────────┘   │
│  [████████░░] ปานกลาง                                       │
│                                                             │
│  ยืนยันรหัสผ่านใหม่ *                                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ••••••••                                     [👁]  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  รหัสผ่านต้องมี:                                              │
│  ✓ อย่างน้อย 8 ตัวอักษร                                      │
│  ✓ ตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว                                │
│  ✓ ตัวพิมพ์เล็กอย่างน้อย 1 ตัว                                │
│  ✓ ตัวเลขอย่างน้อย 1 ตัว                                     │
│  ✗ อักขระพิเศษอย่างน้อย 1 ตัว                                │
│                                                             │
│                                        [เปลี่ยนรหัสผ่าน]      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Create Password Form (AUTH-009)

```
┌─────────────────────────────────────────────────────────────┐
│  สร้างรหัสผ่าน                                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  คุณเข้าสู่ระบบด้วย Google เพิ่มรหัสผ่านเพื่อเข้าสู่ระบบด้วยอีเมลได้  │
│                                                             │
│  อีเมล                                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  user@example.com                                   │   │
│  └─────────────────────────────────────────────────────┘   │
│  (Read-only, from Firebase user)                            │
│                                                             │
│  รหัสผ่าน *                                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ••••••••                                     [👁]  │   │
│  └─────────────────────────────────────────────────────┘   │
│  [████████░░] ปานกลาง                                       │
│                                                             │
│  ยืนยันรหัสผ่าน *                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ••••••••                                     [👁]  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  (Same password requirements checklist)                     │
│                                                             │
│                                        [สร้างรหัสผ่าน]       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Password Tab Logic

```typescript
// Determine which form to show
const hasPasswordProvider = firebaseUser?.providerData.some(
  p => p.providerId === 'password'
);

if (hasPasswordProvider) {
  // Show ChangePasswordForm (AUTH-008)
  // Step 1: Verify old password via signInWithEmailAndPassword()
  // Step 2: Set new password via updatePassword()
  // After success: Auto logout, redirect to /auth/login
} else {
  // Show CreatePasswordForm (AUTH-009)
  // Single step: Set new password
  // After success: Refresh session, stay on page with success message
}
```

### 7.5 Notifications Tab Layout

```
┌─────────────────────────────────────────────────────────────┐
│  การแจ้งเตือน                                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  การแจ้งเตือนทางอีเมล                                          │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  งานที่แนะนำ                                          │   │
│  │  รับอีเมลแนะนำงานที่ตรงกับโปรไฟล์ของคุณ            [●○] │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  อัปเดตใบสมัคร                                        │   │
│  │  รับแจ้งเตือนเมื่อสถานะใบสมัครเปลี่ยนแปลง           [●○] │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  การนัดสัมภาษณ์                                       │   │
│  │  รับแจ้งเตือนการนัดสัมภาษณ์และเตือนความจำ         [●○] │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  สรุปรายสัปดาห์                                       │   │
│  │  รับอีเมลสรุปกิจกรรมทุกสัปดาห์                     [○●] │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  ข่าวสารและโปรโมชั่น                                   │   │
│  │  รับข่าวสารและโปรโมชั่นจาก ChanceDee             [○●] │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  การแจ้งเตือนแบบพุช                                          │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ข้อความใหม่                                          │   │
│  │  รับแจ้งเตือนเมื่อมีข้อความใหม่ในแชท               [●○] │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  อัปเดตใบสมัคร                                        │   │
│  │  รับแจ้งเตือนเมื่อสถานะใบสมัครเปลี่ยนแปลง           [●○] │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  การนัดสัมภาษณ์                                       │   │
│  │  รับแจ้งเตือนการนัดสัมภาษณ์                         [●○] │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  การเปลี่ยนแปลงจะบันทึกอัตโนมัติ                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Notification Toggle Handler

```typescript
async function handleNotificationToggle(
  channel: 'email' | 'push',
  type: string,
  enabled: boolean
) {
  const newPreferences = {
    ...currentPreferences,
    [channel]: {
      ...currentPreferences[channel],
      [type]: enabled,
    },
  };
  
  try {
    await updateUserNotificationPreferences(user.uid, newPreferences);
    mutate(); // Refresh SWR cache
    // No toast needed - auto-save indicator shows status
  } catch (error) {
    toast.error('บันทึกการตั้งค่าไม่สำเร็จ');
    // Revert toggle visually
  }
}
```

### 7.6 Privacy Tab Layout

```
┌─────────────────────────────────────────────────────────────┐
│  ความเป็นส่วนตัว                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  การตั้งค่าคุกกี้                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  จัดการความยินยอมคุกกี้                               │   │
│  │  ควบคุมว่าเราใช้คุกกี้ประเภทใดบ้างในการให้บริการ        │   │
│  │                                                     │   │
│  │  สถานะปัจจุบัน:                                       │   │
│  │  • คุกกี้จำเป็น: เปิดใช้งาน                            │   │
│  │  • คุกกี้วิเคราะห์: {enabled ? 'เปิด' : 'ปิด'}        │   │
│  │  • คุกกี้การตลาด: {enabled ? 'เปิด' : 'ปิด'}        │   │
│  │  • คุกกี้ฟังก์ชัน: {enabled ? 'เปิด' : 'ปิด'}         │   │
│  │                                                     │   │
│  │                              [จัดการการตั้งค่าคุกกี้ →] │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Privacy Tab Actions

| Action | Destination | Notes |
|--------|-------------|-------|
| จัดการการตั้งค่าคุกกี้ | `/privacy/cookie-settings` | External route |

### 7.7 Delete Account Tab Layout

```
┌─────────────────────────────────────────────────────────────┐
│  ลบบัญชี                                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  (If user is sole company admin - show blocking message)    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ⚠️ ไม่สามารถลบบัญชีได้                               │   │
│  │                                                     │   │
│  │  คุณเป็นผู้ดูแลระบบคนเดียวของบริษัท {Company Name}     │   │
│  │  กรุณาแต่งตั้งผู้ดูแลระบบคนอื่นก่อนลบบัญชี               │   │
│  │                                                     │   │
│  │                    [ไปที่การจัดการทีม →]              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  (Otherwise - show normal delete form)                      │
│                                                             │
│  ⚠️ คำเตือน                                                  │
│  ─────────────────────────────────────────────────────────  │
│  การลบบัญชีจะ:                                               │
│  • ลบข้อมูลส่วนตัวทั้งหมดของคุณ                               │
│  • ยกเลิกใบสมัครงานทั้งหมดที่ยังดำเนินการอยู่                    │
│  • ลบประวัติการสนทนาทั้งหมด                                  │
│  • ไม่สามารถกู้คืนได้หลังจาก 30 วัน                            │
│                                                             │
│  ข้อมูลสำหรับยืนยันตัวตน                                       │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ชื่อ (ภาษาไทย) *                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  นามสกุล (ภาษาไทย) *                                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  เบอร์โทรศัพท์ *                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  อีเมล *                                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  user@example.com                                   │   │
│  └─────────────────────────────────────────────────────┘   │
│  (Pre-filled, editable)                                     │
│                                                             │
│  เอกสารยืนยันตัวตน *                                          │
│  ─────────────────────────────────────────────────────────  │
│  อัปโหลดสำเนาบัตรประชาชนหรือเอกสารยืนยันตัวตน                  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [📎 เลือกไฟล์]                                      │   │
│  │                                                     │   │
│  │  รองรับไฟล์: JPG, PNG, PDF (สูงสุด 5MB ต่อไฟล์)        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  (If files uploaded)                                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📄 document1.pdf                           [🗑️]    │   │
│  │  📄 id_card.jpg                             [🗑️]    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ☐ ฉันเข้าใจว่าการลบบัญชีไม่สามารถย้อนกลับได้หลังจาก 30 วัน     │
│                                                             │
│                                    [ยกเลิก] [ส่งคำขอลบบัญชี]  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Delete Account Form Schema

```typescript
const DeleteRequestFormSchema = z.object({
  firstNameTh: z.string().min(1, 'กรุณากรอกชื่อ'),
  lastNameTh: z.string().min(1, 'กรุณากรอกนามสกุล'),
  phoneNumber: z.string().regex(PHONE_REGEX_THAI, 'รูปแบบเบอร์โทรไม่ถูกต้อง'),
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
  confirmUnderstand: z.literal(true, {
    errorMap: () => ({ message: 'กรุณายืนยันว่าคุณเข้าใจ' }),
  }),
});

// Files handled separately via useFileUpload hook
```

#### Delete Account Flow

```typescript
// Check if user can delete account
async function canDeleteAccount(user: User): Promise<{
  canDelete: boolean;
  reason?: string;
  companyName?: string;
}> {
  // Check if user is company admin
  if (user.roles.includes('company') && user.roles.includes('admin') && user.company_id) {
    // Fetch company admin count
    const adminCount = await getCompanyAdminCount(user.company_id);
    if (adminCount === 1) {
      const company = await getCompanyInfo(user.company_id);
      return {
        canDelete: false,
        reason: 'sole_admin',
        companyName: company.name_th,
      };
    }
  }
  return { canDelete: true };
}

async function handleDeleteRequest(formData: DeleteRequestForm, files: File[]) {
  setIsSubmitting(true);
  
  try {
    // 0. Verify user can delete (should already be checked, but double-check)
    const { canDelete } = await canDeleteAccount(user);
    if (!canDelete) {
      toast.error('ไม่สามารถลบบัญชีได้ในขณะนี้');
      setIsSubmitting(false);
      return;
    }
    
    // 1. Generate document code
    const documentCode = `delete-request-${generateRandomString(8)}-${Date.now()}`;
    
    // 2. Upload files to Firebase Storage
    const uploadedUrls = await Promise.all(
      files.map(file => 
        uploadFile(file, `delete-requests/${documentCode}/${file.name}`)
      )
    );
    
    // 3. Create delete request in Firestore
    await webDeleteRequestCreate({
      documentCode,
      firstNameTh: formData.firstNameTh,
      lastNameTh: formData.lastNameTh,
      phoneNumber: formData.phoneNumber,
      email: formData.email,
      attachedFiles: uploadedUrls,
      status: 'pending',
    }, user.uid);
    
    // 4. Redirect to confirmation page
    router.push(`/auth/delete-data-request/${documentCode}`);
    
  } catch (error) {
    toast.error('เกิดข้อผิดพลาดในการส่งคำขอลบข้อมูล');
    setIsSubmitting(false);
  }
}
```

---

## 8. Component-Action Wiring

### 8.1 Account Tab

| Component | Trigger | Action | Effect |
|-----------|---------|--------|--------|
| Email Display | - | - | Read-only display |
| Provider List | - | - | Read-only display |
| Auto-Skip Checkbox | Click | `handleAutoSkipToggle()` | Update localStorage |
| Role Dropdown | Change | `handleDefaultRoleChange()` | Update localStorage |

### 8.2 Password Tab

| Component | Trigger | Action | Effect |
|-----------|---------|--------|--------|
| Old Password Input | Submit | `signInWithEmailAndPassword()` | Verify credential |
| New Password Input | Change | Validate against PASSWORD_REGEX | Update strength indicator |
| Confirm Password Input | Change | Compare with new password | Show match status |
| Submit Button (Change) | Click | `updatePassword()` | Auto-logout, redirect |
| Submit Button (Create) | Click | `signUpWithEmail()` | Add password provider |

### 8.3 Notifications Tab

| Component | Trigger | Action | Effect |
|-----------|---------|--------|--------|
| Email Toggle (any) | Click | `handleNotificationToggle('email', type)` | Update user_accounts |
| Push Toggle (any) | Click | `handleNotificationToggle('push', type)` | Update user_accounts |

### 8.4 Privacy Tab

| Component | Trigger | Action | Effect |
|-----------|---------|--------|--------|
| Cookie Settings Link | Click | `router.push()` | Navigate to /privacy/cookie-settings |

### 8.5 Delete Account Tab

| Component | Trigger | Action | Effect |
|-----------|---------|--------|--------|
| Form Fields | Change | Validate with Zod | Update form state |
| File Upload | Select | `handleFileSelect()` | Add to file list |
| File Remove | Click | `handleFileRemove()` | Remove from file list |
| Cancel Button | Click | `router.back()` | Navigate back |
| Submit Button | Click | `handleDeleteRequest()` | Create request, redirect |

---

## 9. Error Handling

### 9.1 Authentication Errors

| Error | Condition | Display (Thai) | Recovery |
|-------|-----------|----------------|----------|
| Session expired | Session validation fails | เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่ | Redirect to /auth/login |
| Not authenticated | No user in context | - | Redirect to /auth/login |

### 9.2 Password Tab Errors

| Error | Condition | Display (Thai) | Recovery |
|-------|-----------|----------------|----------|
| Wrong old password | `signInWithEmailAndPassword` fails | รหัสผ่านเดิมไม่ถูกต้อง | Clear input, retry |
| Password mismatch | Confirm !== New | รหัสผ่านไม่ตรงกัน | Fix input |
| Weak password | Fails PASSWORD_REGEX | รหัสผ่านไม่ปลอดภัยเพียงพอ | Show requirements |
| Update failed | `updatePassword` fails | เปลี่ยนรหัสผ่านไม่สำเร็จ | Toast, retry |
| Too many attempts | Firebase rate limit | กรุณารอสักครู่แล้วลองใหม่ | Wait 5 minutes |

### 9.3 Notifications Tab Errors

| Error | Condition | Display (Thai) | Recovery |
|-------|-----------|----------------|----------|
| Save failed | Firestore write fails | บันทึกการตั้งค่าไม่สำเร็จ | Toast, revert toggle |
| Load failed | Firestore read fails | โหลดการตั้งค่าไม่สำเร็จ | Retry button |

### 9.4 Delete Account Tab Errors

| Error | Condition | Display (Thai) | Recovery |
|-------|-----------|----------------|----------|
| Sole company admin | User is only admin of company | ไม่สามารถลบบัญชีได้ คุณเป็นผู้ดูแลระบบคนเดียว | Link to team management |
| Invalid file type | Not JPG/PNG/PDF | รองรับเฉพาะไฟล์ JPG, PNG, PDF | Toast, reject file |
| File too large | > 5MB | ไฟล์ใหญ่เกิน 5MB | Toast, reject file |
| Upload failed | Storage write fails | อัปโหลดไฟล์ไม่สำเร็จ | Toast, retry |
| No files attached | Submit with 0 files | กรุณาแนบไฟล์ | Validation error |
| Submit failed | Firestore write fails | เกิดข้อผิดพลาดในการส่งคำขอลบข้อมูล | Toast, retry |

---

## 10. Implementation Checklist

### 10.1 Page Component

- [ ] Create `/app/auth/settings/page.tsx`
- [ ] Implement auth check and redirect
- [ ] Implement shell selection based on `activeRoleAtom`
- [ ] Implement pending user tab filtering
- [ ] Handle URL query param for tab (`?tab=`)
- [ ] Implement back navigation with `router.back()`

### 10.2 Tab Components

- [ ] Create `AccountTab` component
  - [ ] Email and verified badge display
  - [ ] Provider list display
  - [ ] Default role section (multi-role only)
- [ ] Create `PasswordTab` component
  - [ ] `ChangePasswordForm` (AUTH-008)
  - [ ] `CreatePasswordForm` (AUTH-009)
  - [ ] Password strength indicator
  - [ ] Auto-logout after change
- [ ] Create `NotificationsTab` component
  - [ ] Email preference toggles
  - [ ] Push preference toggles
  - [ ] Auto-save indicator
- [ ] Create `PrivacyTab` component
  - [ ] Cookie settings summary
  - [ ] Link to /privacy/cookie-settings
- [ ] Create `DeleteAccountTab` component
  - [ ] Sole admin check and blocking message
  - [ ] Form with validation
  - [ ] File upload with preview
  - [ ] Confirmation checkbox
  - [ ] Submit handler

### 10.3 Server Actions

- [ ] Create `updateUserNotificationPreferences()` action
- [ ] Verify `webDeleteRequestCreate()` exists and works
- [ ] Verify file upload to `delete-requests/` folder works

### 10.4 State Management

- [ ] Wire `userAtom` for user data
- [ ] Wire `activeRoleAtom` for shell selection
- [ ] Wire localStorage for `lastActiveRole`
- [ ] Create SWR key for notification preferences

### 10.5 Data Schema

- [ ] Add `notification_preferences` field to `user_accounts` schema
- [ ] Create migration for existing users (set defaults)

### 10.6 Integration

- [ ] Update `/candidates/[id]/settings` to link to this route
- [ ] Update `/companies/[id]/dashboard/settings` to link to this route
- [ ] Add to middleware route protection (require auth)

### 10.7 Testing

- [ ] Test: All 5 tabs render correctly
- [ ] Test: Pending users don't see Notifications tab
- [ ] Test: Multi-role users see default role section
- [ ] Test: Single-role users don't see default role section
- [ ] Test: Password change → auto-logout → redirect to login
- [ ] Test: Password create (social user) → stay on page
- [ ] Test: Notification toggles save correctly
- [ ] Test: Delete request form validation
- [ ] Test: Delete request file upload
- [ ] Test: Delete request submission and redirect
- [ ] Test: Tab persistence via URL
- [ ] Test: Back navigation

---

## 11. Decisions Log

| Decision | Chosen | Rationale | Date |
|----------|--------|-----------|------|
| Tab persistence | URL query param `?tab=` | Enables deep-linking, better back-button behavior | 2025-12-08 |
| Notification preferences storage | `user_accounts` collection | Role-agnostic, applies to all user contexts | 2025-12-08 |
| Privacy tab content | Link to `/privacy/cookie-settings` | Reuse existing CONSENT-001 implementation | 2025-12-08 |
| Delete account position | Separate tab (Tab 5) | Visual separation, prevents accidental clicks | 2025-12-08 |
| Password change behavior | Auto-logout → `/auth/login` | Security best practice | 2025-12-08 |
| Password create behavior | Stay on page, show success | No session invalidation needed | 2025-12-08 |
| Back navigation | `router.back()` | Users arrive from different contexts | 2025-12-08 |
| Pending user shell | Minimal Shell | Consistent with `/auth/pending` | 2025-12-08 |
| Pending user tabs | Hide Notifications | No job notifications relevant yet | 2025-12-08 |
| Unauthenticated deletion | Out of scope (document in public routes) | This route requires authentication | 2025-12-08 |
| State atom naming | Use `activeRoleAtom` | Semantic clarity, migration from `navBarAtom` | 2025-12-08 |

---

## 12. System Constraints Reference

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

## 13. Related Routes

| Route | Relationship |
|-------|--------------|
| `/auth/login` | Redirect destination after password change |
| `/auth/select-role` | Default role preference affects auto-skip behavior |
| `/auth/delete-data-request/[code]` | Destination after delete request submission |
| `/candidates/[id]/settings` | Links to this route via "Account Link" |
| `/companies/[id]/dashboard/settings` | Links to this route |
| `/privacy/cookie-settings` | Privacy tab links here |

---

## 14. Open Questions

| Question | Status | Notes |
|----------|--------|-------|
| Unlink social provider | ⏳ Deferred | Future feature - currently read-only |
| Unauthenticated deletion channel | ⏳ Deferred | Needs public route spec (e.g., /help/delete-account) |

### Resolved Questions

| Question | Resolution | Date |
|----------|------------|------|
| Data export request implementation | Hidden entirely - not in scope for v1 | 2025-12-08 |
| Pending user tab visibility | All tabs except Notifications (pending applies to company role, not account-level settings) | 2025-12-08 |
| Company admin deletion | Sole admin cannot delete - show blocking message with link to team management | 2025-12-08 |
| Deep-linking to Delete tab | No deep-linking needed for auth-required pages - `router.back()` is fine | 2025-12-08 |

---

## Appendix A: TypeScript Types

```typescript
// Tab configuration
type TabId = 'account' | 'password' | 'notifications' | 'privacy' | 'delete';

interface TabConfig {
  id: TabId;
  labelTh: string;
  labelEn: string;
  visibleWhen: (activeRole: string) => boolean;
}

const TAB_CONFIG: TabConfig[] = [
  { id: 'account', labelTh: 'บัญชี', labelEn: 'Account', visibleWhen: () => true },
  { id: 'password', labelTh: 'รหัสผ่าน', labelEn: 'Password', visibleWhen: () => true },
  { id: 'notifications', labelTh: 'การแจ้งเตือน', labelEn: 'Notifications', visibleWhen: (role) => role !== 'pending' },
  { id: 'privacy', labelTh: 'ความเป็นส่วนตัว', labelEn: 'Privacy', visibleWhen: () => true },
  { id: 'delete', labelTh: 'ลบบัญชี', labelEn: 'Delete Account', visibleWhen: () => true },
];

// Notification preferences
interface NotificationPreferences {
  email: {
    newJobs: boolean;
    applicationUpdates: boolean;
    interviewReminders: boolean;
    weeklyDigest: boolean;
    marketing: boolean;
  };
  push: {
    newMessages: boolean;
    applicationUpdates: boolean;
    interviewReminders: boolean;
  };
}

// Delete request form
interface DeleteRequestForm {
  firstNameTh: string;
  lastNameTh: string;
  phoneNumber: string;
  email: string;
  confirmUnderstand: boolean;
}

// Provider info
interface ProviderInfo {
  providerId: string;
  displayName: string | null;
  email: string | null;
  connected: boolean;
}
```

---

## Appendix B: Component File Structure

```
src/
├── app/
│   └── auth/
│       └── settings/
│           └── page.tsx              # Main page component
├── components/
│   └── auth/
│       └── settings/
│           ├── AccountTab.tsx        # Account tab content
│           ├── PasswordTab.tsx       # Password tab content
│           ├── ChangePasswordForm.tsx
│           ├── CreatePasswordForm.tsx
│           ├── NotificationsTab.tsx  # Notifications tab content
│           ├── PrivacyTab.tsx        # Privacy tab content
│           ├── DeleteAccountTab.tsx  # Delete account tab content
│           └── SettingsTabs.tsx      # Tab navigation
├── domains/
│   └── authentication/
│       └── services/
│           └── server/
│               └── actions/
│                   └── notification-preferences.ts  # New server action
└── hooks/
    └── useNotificationPreferences.ts  # SWR hook for preferences
```

---

## Appendix C: Source References

| Section | Source |
|---------|--------|
| Password change (AUTH-008) | `features_authentication.md` lines 507-576 |
| Password create (AUTH-009) | `features_authentication.md` lines 579-634 |
| Account deletion (AUTH-012) | `features_authentication.md` lines 748-810 |
| Component list | `08-component-index.md` line 88 |
| Notification preferences structure | `feature-gaps_by-domain_candidates.md` lines 122-141 |
| Delete request schema | `data-entities_delete-requests.md` |
| Consent features | `features_consent.md` |
| Default role preference | `AUTH-R07_select-role_RIS.md` Section 10 |
| Candidate settings link | `04-candidate-routes.md` lines 420-424 |
| navBarAtom | `state-inventory_atoms.md` lines 401-409 |

---

*End of RIS: /auth/settings (AUTH-R06) v1.0*
