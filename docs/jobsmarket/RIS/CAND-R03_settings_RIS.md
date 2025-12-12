# CAND-R03: Candidate Settings Route Implementation Spec

**Version:** 1.0  
**Status:** Draft  
**Created:** 2025-12-09  
**Last Updated:** 2025-12-09  
**Route:** `/candidates/[id]/settings`  
**Primary Domain:** Candidate

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-09 | Initial specification |

---

## 1. Route Metadata

| Property | Value |
|----------|-------|
| Route Path | `/candidates/[id]/settings` |
| Route ID | CAND-R03 |
| Shell | Candidate Shell |
| Purpose | Candidate-specific settings (profile visibility, application defaults, notifications) |
| Complexity | Low |
| Phase | 1c (Foundation - Candidate Setup) |
| UI Spec | `04-candidate-routes.md` → Section 5.5 |

### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Candidate UID (must match authenticated user) |

### Access Control

| Requirement | Implementation |
|-------------|----------------|
| Authentication | Required |
| Role | `candidate` |
| Ownership | `params.id === userAtom.uid` |
| Failure | Redirect to own settings page |

---

## 2. Domain Classification

### Primary Domain: Candidate (●)

- **Owns:** Candidate-specific settings
- **Mutations:**
  - Toggle profile visibility (`is_searchable`)
  - Update application preferences
  - Update notification preferences

### Secondary Domains

| Domain | Role | Access |
|--------|------|--------|
| Notifications (○) | Preference configuration | Write: email/push toggles |

### Global Domains (via Shell)

| Domain | Requirement |
|--------|-------------|
| Auth (⊙) | Session validation |
| Chat (⊙) | FAB available |
| Notifications (⊙) | Bell icon in header |

---

## 3. Feature Mapping

### Existing Features (Preserve - P0)

| Feature ID | Feature Name | Coverage | Notes |
|------------|--------------|----------|-------|
| CAND-013 | Toggle Profile Visibility | Full | `is_searchable` toggle with MeiliSearch sync |

### New Features (This Route Introduces)

| Feature | Description | Priority |
|---------|-------------|----------|
| Auto Cover Letter Toggle | Default cover letter for applications | P1 |
| Default Cover Letter Text | Reusable cover letter content | P1 |
| Email Job Recommendations Toggle | Opt in/out of job recommendation emails | P1 |
| Push Notifications Toggle | Enable/disable push notifications | P1 |

### Related Features (Other Routes)

| Feature | Route | Relationship |
|---------|-------|--------------|
| Account Settings (AUTH-008, AUTH-009, AUTH-012) | `/auth/settings` | Linked via Account Settings card |
| Role Selection (AUTH-R07) | `/auth/select-role` | Indirect (default role lives in auth settings) |

---

## 4. Data Contract

### 4.1 Read Operations

| Data | Collection | Fields | Condition | SWR Key |
|------|------------|--------|-----------|---------|
| Candidate Info | `candidate_information` | `uid`, `is_searchable`, `auto_attach_cover_letter`, `default_cover_letter`, `email_job_recommendations` | Authenticated + owner | `candidate-${uid}` |
| User Account | `user_accounts` | `uid`, `roles` | Authenticated | `user-data-${uid}` |
| FCM Token Status | `fcm_tokens` | `fcm_token`, `status` | By uid | On-demand query |

### 4.2 Write Operations

| Action | Collection | Fields | Server Action | Trigger |
|--------|------------|--------|---------------|---------|
| Update Profile Visibility | `candidate_information` | `is_searchable` | `updateCandidateSettings()` | Toggle change |
| Update Application Prefs | `candidate_information` | `auto_attach_cover_letter`, `default_cover_letter` | `updateCandidateSettings()` | Toggle/text change |
| Update Email Notif Prefs | `candidate_information` | `email_job_recommendations` | `updateCandidateSettings()` | Toggle change |
| Register FCM Token | `fcm_tokens` | `fcm_token`, `device_type`, `status` | `registerFCMToken()` | Push enabled + permission granted |
| Deactivate FCM Token | `fcm_tokens` | `status: 'inactive'` | `deactivateFCMToken()` | Push disabled |
| Sync Search Index | MeiliSearch | Visibility flag | Background (triggered by `is_searchable` change) | Async side effect |

### 4.3 Proposed Schema Additions

```typescript
// Fields to add to candidate_information collection
interface CandidateSettingsFields {
  is_searchable: boolean;           // Existing field
  auto_attach_cover_letter: boolean; // New field - default false
  default_cover_letter: string;      // New field - default ''
  email_job_recommendations: boolean; // New field - default true
}
```

---

## 5. State Contract

### 5.1 Atoms

| Atom | Type | R/W | Purpose |
|------|------|-----|---------|
| `userAtom` | `userDataProps \| null` | R | Get user uid for ownership check |
| `candidateAtom` | `candidateDataProps \| null` | R/W | Current candidate data including settings |
| `activeRoleAtom` | `string` | R | Shell context verification |

### 5.2 Hooks

| Hook | Returns | Purpose |
|------|---------|---------|
| `useFirebaseAuth` | `{ user, userChancedee, loading }` | Auth state |
| `useCandidate` | `{ candidate, isLoading, mutate }` | Candidate data with mutation |

### 5.3 SWR Keys

| Key Pattern | Purpose | Invalidate On |
|-------------|---------|---------------|
| `candidate-${uid}` | Full candidate data | Any settings change |

### 5.4 Local Component State

| State | Type | Initial | Purpose |
|-------|------|---------|---------|
| `isSaving` | `Record<string, boolean>` | `{}` | Per-field saving state |
| `coverLetterDraft` | `string` | From data | Debounced textarea value |
| `pushPermissionState` | `PermissionState` | From browser | Browser notification permission |

---

## 6. UI State Machine

### 6.1 Page State Automaton

| Current State | Event | Next State | Guard Condition | Side Effects |
|---------------|-------|------------|-----------------|--------------|
| `loading` | `AUTH_CHECK` | `checking_auth` | - | - |
| `checking_auth` | `AUTH_SUCCESS` | `checking_owner` | User authenticated | - |
| `checking_auth` | `AUTH_FAILED` | `redirecting` | Not authenticated | `redirect('/auth/login')` |
| `checking_owner` | `IS_OWNER` | `loading_settings` | `uid === params.id` | - |
| `checking_owner` | `NOT_OWNER` | `redirecting` | `uid !== params.id` | `redirect(\`/candidates/${uid}/settings\`)` |
| `loading_settings` | `LOAD_SUCCESS` | `idle` | Settings data loaded | `populateForm()` |
| `loading_settings` | `LOAD_ERROR` | `error` | - | `showError()` |
| `idle` | `TOGGLE_CHANGE` | `saving` | - | `optimisticUpdate()` |
| `idle` | `TEXT_CHANGE` | `idle` | - | `updateDraft()`, `debounce(save, 500)` |
| `saving` | `SAVE_SUCCESS` | `idle` | - | `showToast('บันทึกแล้ว')` |
| `saving` | `SAVE_ERROR` | `idle` | - | `revertToggle()`, `showError()` |
| `error` | `RETRY` | `loading_settings` | - | - |

#### State Diagram

```
[loading] ──AUTH_CHECK──▶ [checking_auth] ──AUTH_SUCCESS──▶ [checking_owner]
                                │                                │
                          AUTH_FAILED                       IS_OWNER
                                │                                │
                                ▼                                ▼
                          [redirecting]                  [loading_settings]
                                                                │
                                              ┌─────────────────┴─────────────────┐
                                        LOAD_SUCCESS                        LOAD_ERROR
                                              │                                   │
                                              ▼                                   ▼
                                           [idle] ◄──────RETRY────────────── [error]
                                              │
                                    TOGGLE_CHANGE / TEXT_CHANGE
                                              │
                                              ▼
                                          [saving]
                                              │
                                    ┌─────────┴─────────┐
                              SAVE_SUCCESS         SAVE_ERROR
                                    │                   │
                                    └─────▶ [idle] ◄────┘
```

### 6.2 Toggle Component Automaton (Generic)

| Current State | Event | Next State | Guard Condition | Side Effects |
|---------------|-------|------------|-----------------|--------------|
| `off` | `TOGGLE` | `saving_on` | - | `optimisticUpdate(true)` |
| `on` | `TOGGLE` | `saving_off` | - | `optimisticUpdate(false)` |
| `saving_on` | `SUCCESS` | `on` | - | `invalidateCache()` |
| `saving_on` | `ERROR` | `off` | - | `revert()`, `showErrorToast()` |
| `saving_off` | `SUCCESS` | `off` | - | `invalidateCache()` |
| `saving_off` | `ERROR` | `on` | - | `revert()`, `showErrorToast()` |

### 6.3 Cover Letter Section Automaton

| Current State | Event | Next State | Guard Condition | Side Effects |
|---------------|-------|------------|-----------------|--------------|
| `collapsed` | `TOGGLE_ON` | `expanded` | Auto-attach toggled ON | `showTextarea()` |
| `expanded` | `TOGGLE_OFF` | `collapsed` | Auto-attach toggled OFF | `hideTextarea()` |
| `expanded` | `TEXT_CHANGE` | `editing` | - | `updateDraft()` |
| `editing` | `DEBOUNCE_COMPLETE` | `saving` | 500ms elapsed | `saveCoverLetter()` |
| `editing` | `TEXT_CHANGE` | `editing` | - | `resetDebounce()`, `updateDraft()` |
| `saving` | `SUCCESS` | `expanded` | - | `showSavedIndicator()` |
| `saving` | `ERROR` | `expanded` | - | `showErrorToast()` |

### 6.4 Push Notification Permission Automaton

| Current State | Event | Next State | Guard Condition | Side Effects |
|---------------|-------|------------|-----------------|--------------|
| `unknown` | `CHECK_PERMISSION` | `granted` | `Notification.permission === 'granted'` | - |
| `unknown` | `CHECK_PERMISSION` | `denied` | `Notification.permission === 'denied'` | - |
| `unknown` | `CHECK_PERMISSION` | `default` | `Notification.permission === 'default'` | - |
| `default` | `TOGGLE_ON` | `requesting` | User enables push | `Notification.requestPermission()` |
| `requesting` | `PERMISSION_GRANTED` | `registering` | User grants permission | `registerFCMToken()` |
| `requesting` | `PERMISSION_DENIED` | `denied` | User denies permission | `showDeniedMessage()` |
| `registering` | `REGISTER_SUCCESS` | `granted` | FCM token registered | `updateToggle(true)` |
| `registering` | `REGISTER_ERROR` | `default` | Registration failed | `showErrorToast()` |
| `granted` | `TOGGLE_OFF` | `deactivating` | User disables push | `deactivateFCMToken()` |
| `deactivating` | `SUCCESS` | `default` | - | `updateToggle(false)` |
| `deactivating` | `ERROR` | `granted` | - | `revertToggle()`, `showErrorToast()` |
| `denied` | `TOGGLE_ON` | `denied` | User tries to enable | `showInstructions()` |

---

## 7. Component-Action Wiring

| Component | User Action | Handler | Server Action | Optimistic? | Side Effects |
|-----------|-------------|---------|---------------|-------------|--------------|
| AccountLinkCard | Click | `handleAccountClick` | - | N/A | `router.push('/auth/settings')` |
| ProfileVisibilityToggle | Toggle | `handleVisibilityToggle` | `updateCandidateSettings({ is_searchable })` | Yes | Invalidate `candidate-${uid}`, sync MeiliSearch |
| CoverLetterToggle | Toggle | `handleCoverLetterToggle` | `updateCandidateSettings({ auto_attach_cover_letter })` | Yes | Show/hide textarea |
| CoverLetterTextarea | Change | `handleCoverLetterChange` | `updateCandidateSettings({ default_cover_letter })` (debounced 500ms) | No | Update draft state |
| EmailNotifToggle | Toggle | `handleEmailNotifToggle` | `updateCandidateSettings({ email_job_recommendations })` | Yes | - |
| PushNotifToggle | Toggle | `handlePushToggle` | `registerFCMToken()` / `deactivateFCMToken()` | Yes | May trigger browser permission dialog |

---

## 8. Error Handling

| Error | User-Facing Message | Display | Recovery |
|-------|---------------------|---------|----------|
| Settings load failed | "ไม่สามารถโหลดการตั้งค่า" | Toast + retry button | Click retry |
| Toggle save failed | "บันทึกไม่สำเร็จ กรุณาลองใหม่" | Toast | Toggle reverts, user can retry |
| Cover letter save failed | "บันทึกจดหมายสมัครงานไม่สำเร็จ" | Toast | Auto-retry after 3s |
| FCM registration failed | "ไม่สามารถเปิดการแจ้งเตือน" | Toast + instructions | Link to browser settings |
| Not owner | - | Redirect | Auto-redirect to own settings |
| Not authenticated | - | Redirect | Redirect to `/auth/login` |
| Network error | "ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่" | Toast | Manual retry |

### Error Recovery Matrix

| Error Type | Automatic Recovery | User Action Required |
|------------|-------------------|---------------------|
| Network timeout | Retry with backoff (3 attempts) | Manual retry after exhausted |
| Validation error | None | Fix input |
| Permission denied | None | Browser settings |
| Server error (5xx) | Retry once | Manual retry |
| Auth expired | Redirect to login | Re-login |

---

## 9. Implementation Checklist

### 9.1 Page Setup

- [ ] Create route file `app/candidates/[id]/settings/page.tsx`
- [ ] Implement auth check (ownership validation)
- [ ] Add redirect logic for non-owner access
- [ ] Wire Candidate Shell

### 9.2 UI Components

- [ ] Create `CandidateSettingsPage` container
- [ ] Create `AccountLinkCard` component
- [ ] Create `ProfileVisibilitySection` with toggle
- [ ] Create `ApplicationPreferencesSection` with toggle + textarea
- [ ] Create `NotificationPreferencesSection` with toggles

### 9.3 Data Layer

- [ ] Add fields to `candidate_information` schema:
  - [ ] `auto_attach_cover_letter: boolean`
  - [ ] `default_cover_letter: string`
  - [ ] `email_job_recommendations: boolean`
- [ ] Create server action `updateCandidateSettings()`
- [ ] Create server action `registerFCMToken()`
- [ ] Create server action `deactivateFCMToken()`

### 9.4 State Management

- [ ] Wire `candidateAtom` for settings data
- [ ] Wire `userAtom` for ownership check
- [ ] Create SWR mutation for settings updates
- [ ] Implement optimistic updates for toggles

### 9.5 Push Notifications

- [ ] Implement browser permission check
- [ ] Wire FCM token registration
- [ ] Handle permission denied state
- [ ] Implement token deactivation

### 9.6 Testing

- [ ] Test: Settings load correctly for owner
- [ ] Test: Non-owner redirected to own settings
- [ ] Test: Profile visibility toggle saves correctly
- [ ] Test: Profile visibility syncs with MeiliSearch
- [ ] Test: Cover letter toggle shows/hides textarea
- [ ] Test: Cover letter debounced save works
- [ ] Test: Email notification toggle saves correctly
- [ ] Test: Push notification toggle triggers permission request
- [ ] Test: Push notification handles denied permission
- [ ] Test: All toggles revert on save error

---

## 10. Decisions Log

| Decision | Chosen | Rationale | Date |
|----------|--------|-----------|------|
| Settings storage location | `candidate_information` | Keep candidate settings together, avoid new collection | 2025-12-09 |
| Toggle save pattern | Optimistic update with revert | Better UX - instant feedback | 2025-12-09 |
| Cover letter save | Debounced (500ms) | Avoid excessive API calls while typing | 2025-12-09 |
| Push notifications | FCM via `fcm_tokens` collection | Existing infrastructure | 2025-12-09 |
| Account settings link | Navigate to `/auth/settings` | Centralized account settings (AUTH-R06) | 2025-12-09 |
| Ownership redirect | Redirect to own settings | Users shouldn't see "access denied" for settings | 2025-12-09 |

---

## Appendix A: TypeScript Interfaces

```typescript
// Settings form state
interface CandidateSettings {
  is_searchable: boolean;
  auto_attach_cover_letter: boolean;
  default_cover_letter: string;
  email_job_recommendations: boolean;
}

// Toggle save state tracking
interface ToggleSaveState {
  [fieldName: string]: {
    saving: boolean;
    originalValue: boolean;
  };
}

// Push notification permission states
type PushPermissionState = 
  | 'unknown'
  | 'granted' 
  | 'denied' 
  | 'default'
  | 'requesting'
  | 'registering'
  | 'deactivating';

// Server action input
interface UpdateCandidateSettingsInput {
  uid: string;
  is_searchable?: boolean;
  auto_attach_cover_letter?: boolean;
  default_cover_letter?: string;
  email_job_recommendations?: boolean;
}

// Server action response
interface UpdateCandidateSettingsResponse {
  success: boolean;
  error?: string;
  data?: CandidateSettings;
}
```

---

## Appendix B: Server Actions

```typescript
// src/domains/candidates/services/server/actions/candidate-settings.ts

'use server';

import { authenticateSession } from '@/lib/auth/session';
import { webCandidateInformationUpdate } from '@/lib/database/actions/candidate-information';

export async function updateCandidateSettings(
  input: UpdateCandidateSettingsInput
): Promise<UpdateCandidateSettingsResponse> {
  const session = await authenticateSession();
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }
  
  // Verify ownership
  if (session.uid !== input.uid) {
    return { success: false, error: 'Forbidden' };
  }
  
  try {
    await webCandidateInformationUpdate(input.uid, {
      ...(input.is_searchable !== undefined && { is_searchable: input.is_searchable }),
      ...(input.auto_attach_cover_letter !== undefined && { auto_attach_cover_letter: input.auto_attach_cover_letter }),
      ...(input.default_cover_letter !== undefined && { default_cover_letter: input.default_cover_letter }),
      ...(input.email_job_recommendations !== undefined && { email_job_recommendations: input.email_job_recommendations }),
    });
    
    // Trigger MeiliSearch sync if visibility changed
    if (input.is_searchable !== undefined) {
      await syncCandidateSearchIndex(input.uid, input.is_searchable);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Failed to update candidate settings:', error);
    return { success: false, error: 'Failed to save settings' };
  }
}
```

---

## Appendix C: Component File Structure

```
src/
├── app/
│   └── candidates/
│       └── [id]/
│           └── settings/
│               └── page.tsx              # Main page component
├── components/
│   └── candidates/
│       └── settings/
│           ├── CandidateSettingsPage.tsx # Container component
│           ├── AccountLinkCard.tsx       # Link to /auth/settings
│           ├── ProfileVisibilitySection.tsx
│           ├── ApplicationPreferencesSection.tsx
│           ├── NotificationPreferencesSection.tsx
│           └── SettingsToggle.tsx        # Reusable toggle with loading state
├── domains/
│   └── candidates/
│       └── services/
│           └── server/
│               └── actions/
│                   └── candidate-settings.ts  # Server actions
└── hooks/
    └── useCandidateSettings.ts           # SWR hook for settings
```

---

## Appendix D: Source References

| Section | Source |
|---------|--------|
| UI Layout | `04-candidate-routes.md` lines 409-438 |
| Profile Visibility Feature (CAND-013) | `features_candidates.md` lines 647-692 |
| FCM Tokens Schema | `data-entities_fcm-tokens.md` |
| Candidate Information Fields | `features_candidates.md` lines 965-975 |
| SWR Keys Pattern | `state-inventory_swr-keys.md` lines 17-55 |
| Account Settings Link Pattern | `AUTH-R06_settings_RIS.md` line 100 |
| Optimistic Update Pattern | `features_candidates.md` lines 1006-1007 |

---

## Appendix E: Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| `is_searchable` | Boolean only | - |
| `auto_attach_cover_letter` | Boolean only | - |
| `default_cover_letter` | Max 2000 characters | "จดหมายสมัครงานต้องไม่เกิน 2000 ตัวอักษร" |
| `email_job_recommendations` | Boolean only | - |

---

## Appendix F: Thai Copy Reference

| Element | Thai | English (for reference) |
|---------|------|------------------------|
| Page Title | การตั้งค่า | Settings |
| Account Link Title | การตั้งค่าบัญชี | Account Settings |
| Account Link Description | รหัสผ่าน, อีเมล, ความเป็นส่วนตัว | Password, email, privacy |
| Profile Visibility Section | การมองเห็นโปรไฟล์ | Profile Visibility |
| Profile Visibility Toggle | อนุญาตให้บริษัทค้นหาโปรไฟล์ของฉัน | Allow companies to find my profile |
| Profile Visibility Description | เมื่อเปิด บริษัทจะสามารถค้นหาและดูโปรไฟล์ของคุณได้ | When enabled, companies can search and view your profile |
| Application Prefs Section | การตั้งค่าการสมัคร | Application Settings |
| Cover Letter Toggle | แนบจดหมายสมัครงานอัตโนมัติ | Auto-attach cover letter |
| Cover Letter Label | จดหมายสมัครงานเริ่มต้น: | Default cover letter: |
| Notification Section | การแจ้งเตือนงาน | Job Notifications |
| Email Notif Toggle | รับงานแนะนำทางอีเมล | Receive job recommendations via email |
| Push Notif Toggle | รับการแจ้งเตือนแบบ Push | Receive push notifications |
| Save Success | บันทึกแล้ว | Saved |
| Save Error | บันทึกไม่สำเร็จ กรุณาลองใหม่ | Save failed, please try again |
| Push Denied Message | กรุณาเปิดการแจ้งเตือนในการตั้งค่าเบราว์เซอร์ | Please enable notifications in browser settings |

---

*End of RIS: /candidates/[id]/settings (CAND-R03) v1.0*
