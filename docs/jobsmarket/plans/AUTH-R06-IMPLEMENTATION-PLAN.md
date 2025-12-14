# AUTH-R06 Implementation Plan: Settings Page

**Route:** `/auth/settings`
**Created:** 2025-12-14
**Status:** Ready for Approval
**Complexity:** Medium (5 tabs, reusable components available)

---

## Executive Summary

### What AUTH-R06 Delivers
A centralized settings page for authenticated users with 5 tabs:
1. **Account Tab** - Email display, provider list, default role preference
2. **Password Tab** - Change password (2-step) or Create password (OAuth users)
3. **Notifications Tab** - Email/push notification preferences
4. **Privacy Tab** - Link to cookie settings
5. **Delete Account Tab** - Account deletion request flow

### Key Architecture Decisions
✅ **Reuse Existing Components:** `ChangePasswordForm` and `CreatePasswordForm` already exist
✅ **Server Actions Only:** Use `webDeleteRequestCreate`, `webUserAccountUpdate`
✅ **Tab Persistence:** URL query params (`?tab=password`)
✅ **Role-Based Tab Visibility:** Hide Notifications tab for `pending` users

---

## Questions & Answers

### Q1: What settings are available?
**A:** 5 categories across 5 tabs:
- **Account:** Email (read-only), providers (read-only), default role (multi-role users only)
- **Password:** Change (2-step) for password users, Create for OAuth-only users
- **Notifications:** Email preferences (5 toggles), Push preferences (3 toggles)
- **Privacy:** Cookie settings (link to existing `/privacy/cookie-settings`)
- **Delete Account:** Form + file upload → creates delete request

### Q2: Is this authenticated only?
**A:** YES - requires valid session. Middleware redirects to `/auth/login` if not authenticated.

### Q3: What server actions are needed?
**A:** Mix of existing and new:
- ✅ **Existing:** `webDeleteRequestCreate` (already exists in `src/lib/database/actions/delete.ts`)
- ✅ **Existing:** Firebase `updatePassword()` (used in existing ChangePasswordForm)
- ❌ **New:** `updateUserNotificationPreferences(uid, prefs)` - needs to be created
- ❌ **New:** `getCompanyAdminCount(companyId)` - for sole admin check

### Q4: Does it link to AUTH-R03 verify?
**A:** NO - Auth-R06 does NOT change email. Email change would be a future feature requiring OTP verification flow.

### Q5: What can be reused?
**A:** Significant reuse available:
- ✅ `ChangePasswordForm` - `src/components/auth/change-password.tsx`
- ✅ `CreatePasswordForm` - `src/components/auth/create-password.tsx`
- ✅ `webDeleteRequestCreate` - `src/lib/database/actions/delete.ts`
- ✅ Delete request validation - `src/lib/validations/auth/delete-request-validation.ts`
- ✅ Tab components pattern from AUTH-R02 registration wizard

---

## 0. Critical Architecture Rules

### ❌ DO NOT Create /api/ Routes
✅ **Use Server Actions Only**

**Pattern:**
```typescript
// ✅ CORRECT - Server Action
import { webDeleteRequestCreate } from '@/lib/database/actions/delete';
await webDeleteRequestCreate(payload, user.uid);

// ✅ CORRECT - Firebase client SDK
import { updatePassword } from 'firebase/auth';
await updatePassword(user, newPassword);

// ❌ WRONG - No API routes
fetch('/api/user/notifications', { ... })
```

---

## 1. Files to Create

### Page & Layout
```
src/app/jobsmarket/auth/settings/
├── page.tsx                              # Server component wrapper
└── _components/
    ├── SettingsClient.tsx                 # Main client component (tab router)
    ├── SettingsTabs.tsx                   # Tab navigation
    ├── AccountTab.tsx                     # Account tab content
    ├── PasswordTab.tsx                    # Password tab (uses existing forms)
    ├── NotificationsTab.tsx               # Notifications tab
    ├── PrivacyTab.tsx                     # Privacy tab
    └── DeleteAccountTab.tsx               # Delete account tab
```

### Server Actions (NEW)
```
src/domains/authentication/services/server/actions/
└── jobsmarket/
    └── notification-preferences.ts        # updateUserNotificationPreferences()

src/domains/companies/services/server/actions/
└── jobsmarket/
    └── admin-utils.ts                     # getCompanyAdminCount()
```

### Tests
```
tests/unit/jobsmarket/auth/settings/
├── notification-preferences.test.ts       # Notification update logic
└── sole-admin-check.test.ts              # Company admin count logic

tests/integration/jobsmarket/auth/settings/
├── tab-navigation.test.tsx               # Tab switching, URL sync
├── password-forms.test.tsx               # Reused forms integration
└── delete-flow.test.tsx                  # Delete request flow

tests/e2e/jobsmarket/auth/settings.spec.ts # E2E for all tabs
```

---

## 2. Server Actions Plan

### 2.1 Existing Actions (Reuse)

**✅ Delete Request** (`src/lib/database/actions/delete.ts`)
```typescript
webDeleteRequestCreate(payload: DeleteRequestPayload, actorId: string)
// Already exists - use as-is
```

**✅ Password Change** (Firebase Client SDK)
```typescript
// In src/components/auth/change-password.tsx
await signInWithEmailAndPassword(auth, email, oldPassword); // Step 1
await updatePassword(user, newPassword); // Step 2
await signOut(auth); // Auto-logout
router.push('/auth/login');
```

**✅ Password Create** (Firebase Client SDK)
```typescript
// In src/components/auth/create-password.tsx
await signInWithEmailAndPassword(auth, email, newPassword);
// No logout - stay on page with success message
```

### 2.2 New Actions (Create)

**❌ Notification Preferences**
```typescript
// Location: src/domains/authentication/services/server/actions/jobsmarket/notification-preferences.ts
"use server";

import { webUserDataPropsUpdate } from '@/lib/database/actions/user-data-props';

export async function updateUserNotificationPreferences(
  uid: string,
  preferences: NotificationPreferences
) {
  try {
    await webUserDataPropsUpdate(uid, {
      notification_preferences: preferences
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
```

**❌ Company Admin Count**
```typescript
// Location: src/domains/companies/services/server/actions/jobsmarket/admin-utils.ts
"use server";

import { webUserDataPropsGetByFilter } from '@/lib/database/actions/user-data-props';
import { Filter } from 'firebase-admin/firestore';

export async function getCompanyAdminCount(companyId: string): Promise<number> {
  try {
    const filter: Filter = Filter.and(
      Filter.where('info.companyId', '==', companyId),
      Filter.where('info.roles', 'array-contains', 'admin')
    );

    const admins = await webUserDataPropsGetByFilter({ userInfoFilter: filter });
    return admins?.length || 0;
  } catch (error) {
    console.error('Error counting company admins:', error);
    return 0;
  }
}
```

---

## 3. State Management

### 3.1 Atoms (Read-Only)
```typescript
import { useAtomValue } from 'jotai';
import { userAtom, firebaseUserAtom, activeRoleAtom } from '@/store/atom-store';

// Read user data
const user = useAtomValue(userAtom);
const firebaseUser = useAtomValue(firebaseUserAtom);
const activeRole = useAtomValue(activeRoleAtom);
```

### 3.2 SWR Keys
```typescript
// Notification preferences
const { data: user } = useSWR(
  firebaseUser?.uid ? ['user-data', firebaseUser.uid] : null,
  ([, uid]) => webUserDataPropsGetById(uid)
);

const notificationPrefs = user?.notification_preferences || DEFAULT_NOTIFICATION_PREFERENCES;
```

### 3.3 Local Storage
```typescript
// Default role preference (multi-role users only)
const savedRole = localStorage.getItem('lastActiveRole'); // 'candidate' | 'company' | null
const autoSkipEnabled = savedRole !== null;

function handleAutoSkipToggle(enabled: boolean) {
  if (!enabled) {
    localStorage.removeItem('lastActiveRole');
  } else {
    localStorage.setItem('lastActiveRole', activeRole);
  }
}
```

### 3.4 Local Component State
```typescript
const [activeTab, setActiveTab] = useState<TabId>('account'); // From URL or default
const [passwordStep, setPasswordStep] = useState<1 | 2>(1); // Change password flow
const [isSubmitting, setIsSubmitting] = useState(false); // Form submission
```

---

## 4. Component Architecture

### 4.1 Page Structure
```
page.tsx (server component)
  │
  └─► SettingsClient (client component)
      ├─► SettingsTabs (tab navigation)
      └─► Tab Content (conditional render based on activeTab)
          ├─► AccountTab
          ├─► PasswordTab
          │   ├─► ChangePasswordForm (reused)
          │   └─► CreatePasswordForm (reused)
          ├─► NotificationsTab
          ├─► PrivacyTab
          └─► DeleteAccountTab
```

### 4.2 Tab Navigation Logic
```typescript
// URL sync pattern
const searchParams = useSearchParams();
const router = useRouter();

const tabFromUrl = searchParams.get('tab') as TabId | null;
const [activeTab, setActiveTab] = useState<TabId>(tabFromUrl || 'account');

function handleTabChange(newTab: TabId) {
  setActiveTab(newTab);
  router.replace(`/jobsmarket/auth/settings?tab=${newTab}`);
}
```

### 4.3 Tab Visibility
```typescript
const isMultiRole = user?.roles.includes('candidate') && user?.roles.includes('company');
const isPending = activeRole === 'pending';

const tabs = [
  { id: 'account', label: 'บัญชี', visible: true },
  { id: 'password', label: 'รหัสผ่าน', visible: true },
  { id: 'notifications', label: 'การแจ้งเตือน', visible: !isPending }, // Hidden for pending
  { id: 'privacy', label: 'ความเป็นส่วนตัว', visible: true },
  { id: 'delete', label: 'ลบบัญชี', visible: true },
];
```

---

## 5. Reusable Components

### 5.1 Password Forms (Existing - Reuse)

**ChangePasswordForm** (`src/components/auth/change-password.tsx`)
- Already implements 2-step flow:
  - Step 1: Verify old password via `signInWithEmailAndPassword()`
  - Step 2: Set new password via `updatePassword()`
  - Auto-logout after success
- ✅ **Use as-is or adapt for AUTH-R06 context**

**CreatePasswordForm** (`src/components/auth/create-password.tsx`)
- Single-step password creation for OAuth users
- ✅ **Use as-is or adapt for AUTH-R06 context**

### 5.2 Delete Request (Existing - Reuse)

**webDeleteRequestCreate** (`src/lib/database/actions/delete.ts`)
```typescript
await webDeleteRequestCreate({
  documentCode: `delete-${generateId()}`,
  firstNameTh: form.firstNameTh,
  lastNameTh: form.lastNameTh,
  phoneNumber: form.phoneNumber,
  email: form.email,
  attachedFiles: uploadedFileUrls,
  status: 'pending'
}, user.uid);
```

---

## 6. Delete Account Tab - Sole Admin Check

### 6.1 Flow
```
1. User lands on Delete tab
2. Check if user is company admin (roles.includes('admin') && roles.includes('company'))
3. If yes → fetch company admin count via getCompanyAdminCount(user.company_id)
4. If count === 1 → Show blocking message
5. Else → Show delete form
```

### 6.2 Implementation
```typescript
const { data: canDelete, isLoading } = useSWR(
  user?.roles.includes('admin') && user?.roles.includes('company') && user?.info?.companyId
    ? ['can-delete', user.uid]
    : null,
  async () => {
    const count = await getCompanyAdminCount(user.info.companyId!);
    return count > 1;
  }
);

if (isLoading) return <LoadingSpinner />;

if (canDelete === false) {
  return <SoleAdminBlockingMessage companyName={companyName} />;
}

return <DeleteAccountForm />;
```

---

## 7. Notifications Tab - Schema & UI

### 7.1 Schema (Add to user_accounts)
```typescript
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

### 7.2 Toggle Handler
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
    // Auto-save - no toast needed
  } catch (error) {
    toast.error('บันทึกการตั้งค่าไม่สำเร็จ');
    // Revert toggle visually
  }
}
```

---

## 8. Test Coverage Plan

### 8.1 Unit Tests (3 files)

**notification-preferences.test.ts**
- Test `updateUserNotificationPreferences()` server action
- Test default preferences merge
- Test error handling

**sole-admin-check.test.ts**
- Test `getCompanyAdminCount()` returns correct count
- Test filter logic for company + admin roles
- Test error handling

**tab-visibility.test.ts**
- Test pending users don't see Notifications tab
- Test multi-role users see default role section
- Test single-role users don't see default role section

### 8.2 Integration Tests (3 files)

**tab-navigation.test.tsx**
- Test tab switching updates URL
- Test URL ?tab= param sets initial tab
- Test browser back/forward navigation

**password-forms.test.tsx**
- Test ChangePasswordForm integration (reused component)
- Test CreatePasswordForm integration (reused component)
- Test auto-logout after password change

**delete-flow.test.tsx**
- Test delete form validation
- Test sole admin blocking
- Test file upload
- Test submission and redirect

### 8.3 E2E Tests (1 file)

**status.spec.ts**
- Test all 5 tabs render correctly
- Test notification toggles save
- Test password change flow
- Test delete request submission
- Test sole admin blocking message

---

## 9. Implementation Phases

### Phase 1: Core Structure & Account Tab (Day 1)
1. Create page.tsx and SettingsClient.tsx
2. Create SettingsTabs.tsx with URL sync
3. Create AccountTab.tsx:
   - Email display (from firebaseUser)
   - Provider list (from firebaseUser.providerData)
   - Default role section (multi-role only, localStorage)
4. Write unit tests for tab visibility logic

### Phase 2: Password & Privacy Tabs (Day 1-2)
1. Create PasswordTab.tsx:
   - Import existing ChangePasswordForm
   - Import existing CreatePasswordForm
   - Add conditional render based on hasPasswordProvider
2. Create PrivacyTab.tsx:
   - Simple link to `/privacy/cookie-settings`
3. Write integration tests for password forms

### Phase 3: Notifications Tab (Day 2)
1. Create NotificationsTab.tsx with toggles
2. Create `updateUserNotificationPreferences()` server action
3. Add schema to user_accounts (if not exists)
4. Write unit tests for notification update logic

### Phase 4: Delete Account Tab (Day 2-3)
1. Create DeleteAccountTab.tsx
2. Create `getCompanyAdminCount()` server action
3. Add sole admin check and blocking message
4. Reuse existing `webDeleteRequestCreate` action
5. Write integration tests for delete flow

### Phase 5: Tests & Polish (Day 3)
1. E2E tests for all tabs
2. Quality gates (build, lint, dev server, tests)

---

## 10. Quality Gates Checklist

```bash
# Gate 1: Build
npm run build

# Gate 2: Lint
npm run lint

# Gate 3: Dev server
npm run dev
# Visit http://localhost:3000/jobsmarket/auth/settings

# Gate 4: Tests
npm run test:unit -- tests/unit/jobsmarket/auth/settings
npx playwright test tests/e2e/jobsmarket/auth/settings.spec.ts
```

---

## 11. Thai Copy Checklist

### Page Title
- "การตั้งค่าบัญชี" (Account Settings)

### Tab Labels
- บัญชี (Account)
- รหัสผ่าน (Password)
- การแจ้งเตือน (Notifications)
- ความเป็นส่วนตัว (Privacy)
- ลบบัญชี (Delete Account)

### Account Tab
- "อีเมล" (Email)
- "ผู้ให้บริการที่เชื่อมต่อ" (Connected Providers)
- "บทบาทเริ่มต้นเมื่อเข้าสู่ระบบ" (Default Role on Login)
- "ข้ามหน้าเลือกบทบาท" (Skip role selection)

### Notifications Tab
- "การแจ้งเตือนทางอีเมล" (Email Notifications)
- "การแจ้งเตือนแบบพุช" (Push Notifications)
- "งานที่แนะนำ" (Job Recommendations)
- "อัปเดตใบสมัคร" (Application Updates)
- "การนัดสัมภาษณ์" (Interview Reminders)
- "สรุปรายสัปดาห์" (Weekly Digest)
- "ข่าวสารและโปรโมชั่น" (News and Promotions)
- "ข้อความใหม่" (New Messages)
- "การเปลี่ยนแปลงจะบันทึกอัตโนมัติ" (Changes will be saved automatically)

### Delete Account Tab
- "ลบบัญชี" (Delete Account)
- "คำเตือน" (Warning)
- "ข้อมูลสำหรับยืนยันตัวตน" (Identity Verification Information)
- "เอกสารยืนยันตัวตน" (Identity Documents)
- "ฉันเข้าใจว่าการลบบัญชีไม่สามารถย้อนกลับได้หลังจาก 30 วัน" (I understand deletion is irreversible after 30 days)
- "ส่งคำขอลบบัญชี" (Submit Delete Request)
- **Sole Admin Blocking:**
  - "ไม่สามารถลบบัญชีได้" (Cannot Delete Account)
  - "คุณเป็นผู้ดูแลระบบคนเดียวของบริษัท" (You are the sole admin of the company)
  - "กรุณาแต่งตั้งผู้ดูแลระบบคนอื่นก่อนลบบัญชี" (Please appoint another admin before deleting your account)

### Error Messages
- "บันทึกการตั้งค่าไม่สำเร็จ" (Failed to save settings)
- "เกิดข้อผิดพลาดในการส่งคำขอลบข้อมูล" (Error submitting delete request)
- "ไฟล์ใหญ่เกิน 5MB" (File exceeds 5MB)
- "ประเภทไฟล์ไม่รองรับ" (Unsupported file type)

---

## 12. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| ✅ **Existing password forms may not integrate cleanly** | RESOLVED - Forms are standalone, can be imported directly |
| ✅ **notification_preferences field doesn't exist yet** | Add to user_accounts schema with default values |
| ✅ **Sole admin check may be slow (Firestore query)** | Use SWR with stale-while-revalidate, cache result |
| ⚠️ **Multi-role users switching roles while on settings** | Use current activeRoleAtom as source of truth for UI behavior |

---

## 13. Open Questions

| Question | Answer | Status |
|----------|--------|--------|
| Should we add email change functionality? | NO - Deferred to future. Too complex for v1 (requires OTP, transfer existing data) | ✅ Resolved |
| Should Password tab auto-detect provider? | YES - Check `firebaseUser.providerData.some(p => p.providerId === 'password')` | ✅ Resolved |
| Should we allow provider unlinking? | NO - Read-only for v1. Future feature. | ✅ Resolved |
| Where to store notification preferences? | user_accounts.notification_preferences field | ✅ Resolved |

---

## Appendix A: Reusable Component Locations

```
✅ src/components/auth/change-password.tsx       - ChangePasswordForm
✅ src/components/auth/create-password.tsx       - CreatePasswordForm
✅ src/lib/database/actions/delete.ts           - webDeleteRequestCreate
✅ src/lib/validations/auth/delete-request-validation.ts - Delete request schema
```

---

## Appendix B: Code Snippets

### Tab Navigation Component
```typescript
// src/app/jobsmarket/auth/settings/_components/SettingsTabs.tsx
"use client";

interface Tab {
  id: TabId;
  label: string;
  visible: boolean;
}

export function SettingsTabs({ activeTab, onTabChange, tabs }: Props) {
  return (
    <div className="border-b border-border">
      <nav className="flex space-x-8">
        {tabs.filter(t => t.visible).map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "py-4 px-1 border-b-2 font-medium text-sm",
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
```

### Notification Toggle Component
```typescript
// src/app/jobsmarket/auth/settings/_components/NotificationToggle.tsx
"use client";

export function NotificationToggle({
  channel,
  type,
  label,
  description,
  enabled,
  onToggle
}: Props) {
  const [isUpdating, setIsUpdating] = useState(false);

  async function handleToggle() {
    setIsUpdating(true);
    try {
      await onToggle(channel, type, !enabled);
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="flex items-start justify-between py-4">
      <div className="flex-1">
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch
        checked={enabled}
        onCheckedChange={handleToggle}
        disabled={isUpdating}
      />
    </div>
  );
}
```

---

## Appendix C: Implementation Checklist (Copy to PR)

When creating the PR, include this checklist:

```markdown
## Implementation Complete

### Files Created
- [x] page.tsx
- [x] SettingsClient.tsx
- [x] SettingsTabs.tsx
- [x] AccountTab.tsx
- [x] PasswordTab.tsx
- [x] NotificationsTab.tsx
- [x] PrivacyTab.tsx
- [x] DeleteAccountTab.tsx
- [x] notification-preferences.ts (server action)
- [x] admin-utils.ts (server action)

### Quality Gates
- [x] Gate 1: `npm run build` → exits with code 0
- [x] Gate 2: `npm run lint` → no errors
- [x] Gate 3: `npm run dev` → route loads without errors
- [x] Gate 4: Tests → X passed, Y skipped, 0 failed

### Test Coverage
- [x] Unit tests (3 files)
- [x] Integration tests (3 files)
- [x] E2E tests (1 file)

### Manual Verification
- [x] All 5 tabs render correctly
- [x] Password change auto-logout works
- [x] Notification toggles save
- [x] Delete form validation works
- [x] Sole admin blocking message shows
- [x] Multi-role users see default role section
- [x] Pending users don't see Notifications tab
```

---

**End of AUTH-R06 Implementation Plan**
