# AUTH-R05 Implementation Plan: Status Page

**Route:** `/auth/status`
**RIS Document:** `docs/jobsmarket/RIS/AUTH-R05_status_RIS.md`
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

**Existing Server Action for Company Data:**
- ✅ `src/lib/database/actions/company-information.ts`
- Function: `webCompanyInformationGetById(uid: string)`

**Usage:**
```typescript
// Direct call
const company = await webCompanyInformationGetById(targetCompanyId);

// With SWR for caching
const { data: company } = useSWR(
  targetCompanyId ? ['company-info', targetCompanyId] : null,
  ([, id]) => webCompanyInformationGetById(id)
);
```

---

## 1. Executive Summary

### 1.1 Purpose
Implement a consolidated status page that displays account status for users in pending, deleted, or rejected states. The page auto-detects status from user data and displays appropriate UI with minimal actions (display-only in v1.0).

### 1.2 Scope
- **In Scope:** Display-only status views for deleted, staff-pending, company-pending, and rejected states
- **Out of Scope:** Account recovery, cancel staff request (deferred to future work per RIS §13)

### 1.3 Complexity: Medium
- Auto-detection logic from user roles/status
- Query parameter validation
- Multiple view states (4 types)
- Company data fetching for pending states
- Simple navigation actions only (no mutations)

---

## 2. Requirements Analysis

### 2.1 Key Findings from RIS

**Status Types (RIS §4.2):**

| Type | Detection Condition | Use Case |
|------|---------------------|----------|
| `deleted` | `roles.includes('deleted')` OR (`status === 'deleted'` AND `is_active === false`) | Account has been permanently deleted |
| `staff-pending` | `roles.includes('pending')` + `target_company` set + NOT `roles.includes('admin')` | Staff waiting for company admin approval |
| `company-pending` | `roles.includes('pending')` + `roles.includes('admin')` + `target_company` set | Company admin waiting for platform approval |
| `rejected` | Query param only (not auto-detected) | Landed from rejection email notification |

**Query Parameters (RIS §4.3):**
- `?type` - Optional hint (validated against user data, ignored if mismatch)
- `?reason` - Rejection reason (for `type=rejected` only)
- `?company` - Override company name display (for email links)

**Data Requirements (RIS §5.1):**
- User data from `userAtom` (already available)
- Target company info from `company_information` (fetch if `target_company` set)

**Key Constraints:**
- Display-only views (no mutations in v1.0)
- Deletion is permanent (no recovery button)
- No cancel button for pending requests
- All views must have logout option

### 2.2 Status Detection Priority (RIS §7.3)

```
1. Check deleted (highest priority - blocks all access)
2. Check company admin pending (has 'admin' role)
3. Check staff pending (has target_company but not admin)
4. No status → redirect to appropriate dashboard
```

**Special Case:** `?type=rejected` bypasses detection since rejected users have already lost their pending status.

### 2.3 Cross-References to AUTH-R00

- Error UX standards: AUTH-R00 §2
- Session management: AUTH-R00 §3
- Global atoms: AUTH-R00 §4 (userAtom, firebaseUserAtom, sessionStateAtom)
- Role semantics & status detection: AUTH-R00 §9
- Thai copy guidelines: AUTH-R00 §6
- Error messages: AUTH-R00 Appendix A

---

## 3. Architecture Design

### 3.1 Page State Machine (RIS §7.2)

```
CHECK_AUTH (initial load)
    ├─► NOT_AUTHED → /auth/login
    ├─► REJECTED_PARAM (?type=rejected) → Show RejectedView
    └─► DETECT_STATUS
         ├─► DELETED → Show DeletedStatusView
         ├─► COMPANY_PENDING → Show CompanyPendingView
         ├─► STAFF_PENDING → Show StaffPendingView
         └─► NO_STATUS → Redirect to dashboard
```

### 3.2 Component Hierarchy

```
page.tsx (Server Component)
  └─► StatusClient.tsx (Client Component)
       ├─► DeletedStatusView.tsx
       ├─► StaffPendingView.tsx
       │    └─► CompanyCard.tsx (shows target company)
       │    └─► ProgressStepper.tsx (3 steps)
       ├─► CompanyPendingView.tsx
       │    └─► ProgressStepper.tsx (5 steps)
       └─► RejectedView.tsx
```

### 3.3 Data Flow

**Atoms (Read-Only):**
- `userAtom` - User roles, status, target_company (already populated by auth system)
- `firebaseUserAtom` - For logout action
- `sessionStateAtom` - Verify session valid

**Server Data (SWR):**
- Company info: Fetch via existing `useCompanyInfo(targetCompanyId)` hook if needed

**No Writes:** All views are display-only in v1.0

---

## 4. Implementation Plan

### 4.1 Files to Create

#### Page Components
```
src/app/jobsmarket/auth/status/
├── page.tsx                        # Server component (minimal, delegates to client)
└── _components/
    ├── StatusClient.tsx            # Main client component with detection logic
    ├── DeletedStatusView.tsx       # Deleted account view
    ├── StaffPendingView.tsx        # Staff pending view
    ├── CompanyPendingView.tsx      # Company pending view
    └── RejectedView.tsx            # Rejected view
```

#### Shared Components (if needed)
```
src/components/jobsmarket/auth/
├── StatusCard.tsx                  # Wrapper card component (optional - can use shadcn Card)
└── ProgressStepper.tsx             # Vertical progress stepper (new component)
```

**Reuse Existing:**
- `src/components/ui/card.tsx` - shadcn Card components
- `src/components/ui/button.tsx` - shadcn Button
- `src/components/ui/alert.tsx` - For info boxes
- Auth layout from `src/app/jobsmarket/auth/layout.tsx`

#### Tests
```
tests/unit/jobsmarket/auth/status/
├── status-detection.test.ts        # Test detection logic
└── status-views.test.tsx           # Test view components

tests/integration/jobsmarket/auth/status/
└── status-routing.test.ts          # Test routing behavior

tests/e2e/jobsmarket/auth/
└── status.spec.ts                  # E2E test for all status types
```

### 4.2 Server Actions

**None needed** - This is a display-only page. All required actions already exist:
- `signOutFirebase()` - For logout (from useFirebaseAuth hook)
- `router.push()` - For navigation
- Company data fetching uses existing patterns

### 4.3 State Management

**Global Atoms (Read-Only):**
```typescript
// From AUTH-R00 §4.1
import { userAtom } from '@/store/user-atom';
import { firebaseUserAtom } from '@/store/firebase-user-atom';
import { sessionStateAtom } from '@/store/session-state-atom';
```

**Local Component State:**
```typescript
const [detectedType, setDetectedType] = useState<StatusType | null>(null);
const [isLoading, setIsLoading] = useState(true);
const [companyName, setCompanyName] = useState<string>('บริษัท');
```

**Server Actions:**
```typescript
// ✅ CORRECT: Use existing database actions
import { webCompanyInformationGetById } from '@/lib/database/actions/company-information';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';

// Company fetch via server action + SWR (optional for caching)
const { data: company } = useSWR(
  targetCompanyId ? ['company-info', targetCompanyId] : null,
  ([, id]) => webCompanyInformationGetById(id)
);
```

### 4.4 Detection Logic Implementation

**File:** `StatusClient.tsx`

```typescript
type StatusType = 'deleted' | 'staff-pending' | 'company-pending' | 'rejected';

function detectStatusType(user: userDataProps): StatusType | null {
  // 1. Check deleted (highest priority)
  if (user.roles.includes('deleted') ||
      (user.status === 'deleted' && user.is_active === false)) {
    return 'deleted';
  }

  // 2. Check pending with target company
  if (user.roles.includes('pending') && user.target_company) {
    // 2a. Company admin pending platform approval
    if (user.roles.includes('admin')) {
      return 'company-pending';
    }
    // 2b. Staff pending company admin approval
    return 'staff-pending';
  }

  // 3. No matching status - should redirect
  return null;
}
```

### 4.5 Query Parameter Handling

**File:** `StatusClient.tsx`

```typescript
const searchParams = useSearchParams();
const typeParam = searchParams.get('type');
const reasonParam = searchParams.get('reason');

// Special case: rejected bypasses auto-detection
if (typeParam === 'rejected') {
  return <RejectedView reason={reasonParam} />;
}

// For other types, ignore param if doesn't match user data
const detectedType = detectStatusType(user);
```

---

## 5. UI Specification

### 5.1 Deleted View (RIS §8.2)

**Layout:**
```
┌─────────────────────────────────────────┐
│         ⚠️ บัญชีถูกลบแล้ว                │
│                                         │
│  บัญชีของคุณถูกลบจากระบบแล้ว              │
│  การลบบัญชีไม่สามารถยกเลิกได้             │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  หากต้องการใช้งานอีกครั้ง        │   │
│  │  กรุณาสมัครสมาชิกใหม่             │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [ออกจากระบบ] (Primary Button)          │
│                                         │
└─────────────────────────────────────────┘
```

**Thai Copy:**
- Title: "บัญชีถูกลบแล้ว"
- Icon: ⚠️ (Warning icon from lucide-react)
- Description: "บัญชีของคุณถูกลบจากระบบแล้ว การลบบัญชีไม่สามารถยกเลิกได้"
- Info box: "หากต้องการใช้งานอีกครั้ง กรุณาสมัครสมาชิกใหม่"
- Button: "ออกจากระบบ"

### 5.2 Staff Pending View (RIS §8.3)

**Layout:**
```
┌─────────────────────────────────────────┐
│         ⏳ รอการอนุมัติ                   │
│                                         │
│  คำขอเข้าร่วม {companyName} ของคุณ       │
│  กำลังรอการอนุมัติจากผู้ดูแลระบบของบริษัท │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  [Company Logo]  {companyName}  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  ✓ ส่งคำขอแล้ว                   │   │
│  │  ◐ รอผู้ดูแลอนุมัติ ← highlighted │   │
│  │  ○ เข้าร่วมบริษัท                │   │
│  └─────────────────────────────────┘   │
│                                         │
│  เราจะแจ้งผลทางอีเมลเมื่อมีการตอบกลับ     │
│                                         │
│  [กลับสู่หน้าหลัก] (Primary)             │
│  [ออกจากระบบ] (Link)                    │
│                                         │
└─────────────────────────────────────────┘
```

**Thai Copy:**
- Title: "รอการอนุมัติ"
- Icon: ⏳ (Hourglass from lucide-react: `Clock` or `Timer`)
- Description: "คำขอเข้าร่วม {companyName} ของคุณกำลังรอการอนุมัติจากผู้ดูแลระบบของบริษัท"
- Progress steps: ["ส่งคำขอแล้ว", "รอผู้ดูแลอนุมัติ", "เข้าร่วมบริษัท"]
- Note: "เราจะแจ้งผลทางอีเมลเมื่อมีการตอบกลับ"
- Primary button: "กลับสู่หน้าหลัก" → `/candidates/${uid}`
- Logout link: "ออกจากระบบ"

### 5.3 Company Pending View (RIS §8.4)

**Layout:**
```
┌─────────────────────────────────────────┐
│         ⏳ รอการตรวจสอบ                   │
│                                         │
│  คำขอลงทะเบียนบริษัทของคุณกำลังรอการตรวจสอบ │
│  โดยทีมงาน ChanceDee                     │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  ✓ บัญชีสร้างแล้ว                 │   │
│  │  ✓ ข้อมูลบริษัทส่งแล้ว             │   │
│  │  ◐ กำลังตรวจสอบเอกสาร ← animated │   │
│  │  ○ รอการอนุมัติ                   │   │
│  │  ○ อนุมัติแล้ว                    │   │
│  └─────────────────────────────────┘   │
│                                         │
│  โดยประมาณ 1-2 วันทำการ                  │
│  เราจะแจ้งผลทางอีเมล                     │
│                                         │
│  [แก้ไขข้อมูลบริษัท] (Primary)           │
│  [ออกจากระบบ] (Link)                    │
│                                         │
└─────────────────────────────────────────┘
```

**Thai Copy:**
- Title: "รอการตรวจสอบ"
- Icon: ⏳
- Description: "คำขอลงทะเบียนบริษัทของคุณกำลังรอการตรวจสอบโดยทีมงาน ChanceDee"
- Progress steps: ["บัญชีสร้างแล้ว", "ข้อมูลบริษัทส่งแล้ว", "กำลังตรวจสอบเอกสาร", "รอการอนุมัติ", "อนุมัติแล้ว"]
- Time estimate: "โดยประมาณ 1-2 วันทำการ"
- Note: "เราจะแจ้งผลทางอีเมล"
- Primary button: "แก้ไขข้อมูลบริษัท" → `/companies/${target_company}/pending`
- Logout link: "ออกจากระบบ"

### 5.4 Rejected View (RIS §8.5)

**Layout:**
```
┌─────────────────────────────────────────┐
│         ❌ คำขอถูกปฏิเสธ                  │
│                                         │
│  {rejectionReason || "คำขอของคุณไม่ได้   │
│  รับการอนุมัติ"}                         │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  สิ่งที่คุณสามารถทำได้:           │   │
│  │  • ตรวจสอบเอกสารที่ส่งมา          │   │
│  │  • แก้ไขข้อมูลตามเหตุผลที่ระบุ     │   │
│  │  • ส่งคำขอใหม่อีกครั้ง            │   │
│  │  • ติดต่อทีมงาน CHANCEDEE         │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [ติดต่อฝ่ายสนับสนุน] [กลับสู่หน้าหลัก]   │
│  [ออกจากระบบ] (Link)                    │
│                                         │
└─────────────────────────────────────────┘
```

**Thai Copy:**
- Title: "คำขอถูกปฏิเสธ"
- Icon: ❌ (X or XCircle from lucide-react)
- Reason: Display `?reason` param or default: "คำขอของคุณไม่ได้รับการอนุมัติ"
- Next steps:
  - "ตรวจสอบเอกสารที่ส่งมา"
  - "แก้ไขข้อมูลตามเหตุผลที่ระบุ"
  - "ส่งคำขอใหม่อีกครั้ง"
  - "ติดต่อทีมงาน CHANCEDEE หากมีข้อสงสัย"
- Secondary button: "ติดต่อฝ่ายสนับสนุน" → `mailto:support@chancedee.com`
- Primary button: "กลับสู่หน้าหลัก" → `/candidates/${uid}`
- Logout link: "ออกจากระบบ"

### 5.5 Shared: ProgressStepper Component

**New component to create:**

```typescript
interface Step {
  label: string;
  status: 'completed' | 'current' | 'upcoming';
}

interface ProgressStepperProps {
  steps: Step[];
  variant?: 'staff' | 'company'; // For styling differences
}
```

**Visual:**
- Vertical layout
- Completed: ✓ (green)
- Current: ◐ (blue, animated)
- Upcoming: ○ (gray)

---

## 6. Component Action Wiring

### 6.1 Navigation Actions (RIS §9.1)

**All Views:**
- Logout → `signOutFirebase()` then `router.push('/auth/login')`

**Staff Pending:**
- Home button → `router.push(\`/candidates/\${uid}\`)`

**Company Pending:**
- Edit button → `router.push(\`/companies/\${target_company}/pending\`)`

**Rejected:**
- Support button → `window.open('mailto:support@chancedee.com')`
- Home button → `router.push(\`/candidates/\${uid}\`)`

**No Status (Auto-redirect):**
```typescript
if (user.roles.includes('company') && user.company_id) {
  router.replace(`/companies/${user.company_id}/dashboard`);
} else if (user.roles.includes('candidate')) {
  router.replace(`/candidates/${user.uid}`);
} else {
  router.replace('/');
}
```

---

## 7. Test Coverage Plan

### 7.1 Unit Tests (`tests/unit/jobsmarket/auth/status/`)

**status-detection.test.ts:**
```typescript
describe('detectStatusType', () => {
  it('detects deleted status from roles', () => {
    const user = { roles: ['deleted'], ...defaults };
    expect(detectStatusType(user)).toBe('deleted');
  });

  it('detects deleted status from status field', () => {
    const user = { status: 'deleted', is_active: false, roles: [], ...defaults };
    expect(detectStatusType(user)).toBe('deleted');
  });

  it('detects company-pending for admin with target_company', () => {
    const user = {
      roles: ['company', 'admin', 'pending'],
      target_company: 'comp-123',
      ...defaults
    };
    expect(detectStatusType(user)).toBe('company-pending');
  });

  it('detects staff-pending for non-admin with target_company', () => {
    const user = {
      roles: ['candidate', 'pending'],
      target_company: 'comp-123',
      ...defaults
    };
    expect(detectStatusType(user)).toBe('staff-pending');
  });

  it('returns null for active user with no pending status', () => {
    const user = { roles: ['candidate'], status: 'active', ...defaults };
    expect(detectStatusType(user)).toBeNull();
  });

  it('prioritizes deleted over pending', () => {
    const user = {
      roles: ['deleted', 'pending'],
      target_company: 'comp-123',
      ...defaults
    };
    expect(detectStatusType(user)).toBe('deleted');
  });
});
```

**status-views.test.tsx:**
- Test each view component renders correctly
- Test logout button calls signOutFirebase
- Test navigation buttons route correctly
- Test company name display in pending views
- Test reason display in rejected view

### 7.2 Integration Tests (`tests/integration/jobsmarket/auth/status/`)

**status-routing.test.ts:**
```typescript
describe('Status page routing', () => {
  it('redirects to login if not authenticated', async () => {
    // Test sessionState !== 'valid' → /auth/login
  });

  it('shows deleted view for deleted user', async () => {
    // Mock userAtom with deleted status
    // Verify DeletedStatusView renders
  });

  it('ignores invalid type param and auto-detects', async () => {
    // Load with ?type=deleted but user is staff-pending
    // Verify shows StaffPendingView (auto-detected)
  });

  it('shows rejected view when type=rejected param present', async () => {
    // Load with ?type=rejected&reason=test
    // Verify RejectedView renders with reason
  });

  it('redirects to dashboard when no status detected', async () => {
    // Mock active candidate user
    // Verify redirect to /candidates/${uid}
  });

  it('fetches target company info for pending views', async () => {
    // Mock staff-pending user with target_company
    // Verify company name fetched and displayed
  });
});
```

### 7.3 E2E Tests (`tests/e2e/jobsmarket/auth/status.spec.ts`)

**If test credentials support creating pending/deleted users:**

```typescript
test.describe('AUTH-R05: Status Page', () => {
  test('deleted user sees deletion message and can logout', async ({ page }) => {
    // Login as deleted user (if test account available)
    // Verify page shows "บัญชีถูกลบแล้ว"
    // Click logout, verify redirect to /auth/login
  });

  test('staff-pending shows company name and progress', async ({ page }) => {
    // Login as staff-pending user
    // Verify company name displays
    // Verify 3-step progress stepper
    // Click "กลับสู่หน้าหลัก", verify redirect
  });

  test('company-pending shows edit button', async ({ page }) => {
    // Login as company-pending user
    // Verify 5-step progress stepper
    // Click "แก้ไขข้อมูลบริษัท", verify redirect to pending workspace
  });

  test('rejected view via query param shows reason', async ({ page }) => {
    // Navigate to /auth/status?type=rejected&reason=test
    // Verify reason displays
    // Click support button, verify mailto link
  });

  test('invalid type param ignored, auto-detects correct status', async ({ page }) => {
    // Login as staff-pending user
    // Navigate to /auth/status?type=deleted
    // Verify shows staff-pending view (not deleted)
  });
});
```

**Note:** May need to skip if test accounts don't include pending/deleted states:
```typescript
test.skip(!hasTestPendingAccounts, 'Pending/deleted test accounts not available');
```

---

## 8. Thai Copy Checklist

### 8.1 All Required Thai Strings

**Page Titles:**
- [x] "สถานะบัญชี" (Account Status)

**Deleted View:**
- [x] "บัญชีถูกลบแล้ว" (Account Deleted)
- [x] "บัญชีของคุณถูกลบจากระบบแล้ว" (Your account has been deleted from the system)
- [x] "การลบบัญชีไม่สามารถยกเลิกได้" (Account deletion cannot be undone)
- [x] "หากต้องการใช้งานอีกครั้ง กรุณาสมัครสมาชิกใหม่" (If you want to use again, please register a new account)
- [x] "ออกจากระบบ" (Logout)

**Staff Pending View:**
- [x] "รอการอนุมัติ" (Waiting for Approval)
- [x] "คำขอเข้าร่วม {companyName} ของคุณกำลังรอการอนุมัติจากผู้ดูแลระบบของบริษัท"
- [x] "ส่งคำขอแล้ว" (Request Sent)
- [x] "รอผู้ดูแลอนุมัติ" (Waiting for Admin Approval)
- [x] "เข้าร่วมบริษัท" (Join Company)
- [x] "เราจะแจ้งผลทางอีเมลเมื่อมีการตอบกลับ" (We will notify via email when there's a response)
- [x] "กลับสู่หน้าหลัก" (Back to Home)

**Company Pending View:**
- [x] "รอการตรวจสอบ" (Waiting for Review)
- [x] "คำขอลงทะเบียนบริษัทของคุณกำลังรอการตรวจสอบโดยทีมงาน ChanceDee"
- [x] "บัญชีสร้างแล้ว" (Account Created)
- [x] "ข้อมูลบริษัทส่งแล้ว" (Company Info Submitted)
- [x] "กำลังตรวจสอบเอกสาร" (Reviewing Documents)
- [x] "รอการอนุมัติ" (Waiting for Approval)
- [x] "อนุมัติแล้ว" (Approved)
- [x] "โดยประมาณ 1-2 วันทำการ" (Approximately 1-2 business days)
- [x] "เราจะแจ้งผลทางอีเมล" (We will notify via email)
- [x] "แก้ไขข้อมูลบริษัท" (Edit Company Info)

**Rejected View:**
- [x] "คำขอถูกปฏิเสธ" (Request Rejected)
- [x] "คำขอของคุณไม่ได้รับการอนุมัติ" (Default rejection message)
- [x] "สิ่งที่คุณสามารถทำได้:" (What you can do:)
- [x] "ตรวจสอบเอกสารที่ส่งมา" (Review submitted documents)
- [x] "แก้ไขข้อมูลตามเหตุผลที่ระบุ" (Fix info based on stated reason)
- [x] "ส่งคำขอใหม่อีกครั้ง" (Submit new request)
- [x] "ติดต่อทีมงาน CHANCEDEE หากมีข้อสงสัย" (Contact CHANCEDEE team if you have questions)
- [x] "ติดต่อฝ่ายสนับสนุน" (Contact Support)

**Fallback:**
- [x] "บริษัท" (Company - for failed company name fetch)

### 8.2 Tone & Guidelines (AUTH-R00 §6)

- [x] Use semi-formal tone (พิมพ์เล็ก)
- [x] Use "กรุณา" for requests
- [x] Direct but friendly for errors
- [x] Clear, action-oriented instructions

---

## 9. Error Handling

### 9.1 Detection Errors (RIS §10.1)

| Error | Condition | Display | Recovery |
|-------|-----------|---------|----------|
| No session | `sessionState !== 'valid'` | Redirect | → `/auth/login` |
| No matching status | User has no pending/deleted status | Redirect | → appropriate dashboard |
| Invalid type param | `?type` doesn't match user data | Ignore param | Auto-detect from user data |
| Company fetch failed | Target company not found | Show "บริษัท" | Continue with generic name |

### 9.2 Network Errors (RIS §10.2)

| Error | Condition | Display | Recovery |
|-------|-----------|---------|----------|
| Company info failed | SWR fetch error | Show placeholder "บริษัท" | Retry on refresh (SWR auto-retry) |
| Session expired | Cookie invalid | Redirect | → `/auth/login` |

**Error Display Method:**
- Use toast for transient errors (company fetch failure)
- Use redirect for blocking errors (no session)
- No error UI for invalid params (silently ignore)

---

## 10. Accessibility

### 10.1 ARIA Labels

- Progress stepper: `role="progressbar"`, `aria-label="ขั้นตอนการดำเนินการ"`
- Status icons: `aria-label` for screen readers
- Buttons: Clear labels, no icon-only buttons

### 10.2 Keyboard Navigation

- All buttons keyboard accessible
- Logout link focusable
- Tab order: Status icon → Title → Description → Actions

### 10.3 Semantic HTML

- Use proper heading hierarchy (h1 for title)
- Use `<main>` for content
- Use semantic button elements

---

## 11. Performance Considerations

### 11.1 Data Fetching

**Company Info (Server Action Pattern):**
```typescript
// ✅ CORRECT: Use existing server action
import { webCompanyInformationGetById } from '@/lib/database/actions/company-information';

// Option 1: Direct useEffect fetch
const [companyName, setCompanyName] = useState<string>('บริษัท');

useEffect(() => {
  if (targetCompanyId) {
    webCompanyInformationGetById(targetCompanyId)
      .then(data => setCompanyName(data?.company_name || 'บริษัท'))
      .catch(() => setCompanyName('บริษัท'));
  }
}, [targetCompanyId]);

// Option 2: Use SWR with Server Action (preferred for caching)
const { data: company } = useSWR(
  targetCompanyId ? ['company-info', targetCompanyId] : null,
  ([, id]) => webCompanyInformationGetById(id),
  {
    onError: () => {}, // Silent fallback
    revalidateOnFocus: false
  }
);

const companyName = company?.company_name || 'บริษัท';
```

**❌ WRONG - DO NOT DO THIS:**
```typescript
// ❌ NO API routes for jobsmarket
const { data } = useSWR(`/api/companies/${id}`, fetcher);
```

**Optimization:**
- SWR deduplicates requests (when using Option 2)
- No polling needed (static data)
- Fallback to placeholder on error
- Server action executes on server, returns minimal data

### 11.2 Client Bundle Size

- All views lazy-loaded via dynamic imports (optional optimization)
- ProgressStepper shared component
- Minimal dependencies (lucide-react icons already in use)

---

## 12. Security Considerations

### 12.1 Authentication

**Guard:**
```typescript
// Check session state first
if (sessionState !== 'valid') {
  router.replace('/auth/login');
  return null;
}
```

**Authorization:**
- No sensitive data exposed (only user's own status)
- Company name is public info (safe to show)
- No mutations, so no CSRF concerns

### 12.2 Query Parameter Validation

**Sanitize inputs:**
```typescript
// Only allow specific type values
const validTypes = ['deleted', 'staff-pending', 'company-pending', 'rejected'];
const type = searchParams.get('type');
const isValidType = type && validTypes.includes(type);

// Sanitize reason (prevent XSS)
const reason = searchParams.get('reason');
const sanitizedReason = reason ? escapeHtml(reason) : null;
```

---

## 13. Discrepancies Found

### 13.1 RIS vs Existing Implementation

**None identified** - This is a new route.

### 13.2 RIS vs AUTH-R00 Cross-Cutting

**Alignment verified:**
- Error handling follows AUTH-R00 §2 patterns
- Uses standard atoms from AUTH-R00 §4
- Thai copy follows AUTH-R00 §6 guidelines
- Role detection uses AUTH-R00 §9 semantics

### 13.3 Clarifications Needed

**None** - RIS is comprehensive and clear.

---

## 14. Dependencies

### 14.1 Existing Code Required

**Atoms:**
- `src/store/user-atom.ts` (userAtom)
- `src/store/firebase-user-atom.ts` (firebaseUserAtom)
- `src/store/session-state-atom.ts` (sessionStateAtom)

**Server Actions:**
- ✅ `src/lib/database/actions/company-information.ts` (webCompanyInformationGetById) - **EXISTS**

**Hooks:**
- `src/hooks/useFirebaseAuth.ts` (for signOutFirebase)

**Types:**
- `src/types/user.ts` (userDataProps)
- `src/types/company.types.ts` (FirebaseCompanyData)

**UI Components:**
- `src/components/ui/card.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/alert.tsx`
- Icons from `lucide-react`

### 14.2 New Dependencies Required

**None** - All required packages already in use.

---

## 15. Migration/Deprecation

### 15.1 Deprecated Routes (RIS §3.4)

**Add redirects for old routes:**

```typescript
// src/app/jobsmarket/auth/pending/page.tsx
import { redirect } from 'next/navigation';

export default function PendingPage() {
  redirect('/jobsmarket/auth/status');
}
```

```typescript
// src/app/jobsmarket/auth/deleted/page.tsx
import { redirect } from 'next/navigation';

export default function DeletedPage() {
  redirect('/jobsmarket/auth/status?type=deleted');
}
```

### 15.2 Update Navigation

**Update `navigateUserByRole()` function:**

Verify existing routing logic already points deleted/pending users to `/auth/status`. If not, update:

```typescript
// In src/lib/navigation/navigateUserByRole.ts (or similar)

if (user.roles.includes('deleted')) {
  return '/jobsmarket/auth/status?type=deleted';
}

if (user.roles.includes('pending')) {
  if (user.roles.includes('admin')) {
    return `/jobsmarket/companies/${user.company_id}/pending`;
  }
  return '/jobsmarket/auth/status?type=staff-pending';
}
```

---

## 16. Implementation Phases

### Phase 1: Core Detection & Routing (Priority: P0)
**Files:**
- `page.tsx`
- `StatusClient.tsx`
- Detection logic
- Query parameter handling
- Auto-redirect for no-status users

**Tests:**
- Unit tests for detection logic
- Integration tests for routing

### Phase 2: View Components (Priority: P0)
**Files:**
- `DeletedStatusView.tsx`
- `StaffPendingView.tsx`
- `CompanyPendingView.tsx`
- `RejectedView.tsx`
- `ProgressStepper.tsx`

**Tests:**
- Unit tests for each view component
- E2E tests for display and navigation

### Phase 3: Company Data Fetching (Priority: P0)
**Files:**
- Company fetch logic in pending views
- Fallback handling for failed fetches

**Tests:**
- Integration tests for company fetch
- Error state tests

### Phase 4: Polish & Deprecation (Priority: P1)
**Files:**
- Redirect pages for deprecated routes
- Update navigation logic
- Accessibility improvements
- Performance optimizations

**Tests:**
- E2E tests for deprecated route redirects
- Accessibility audit

---

## 17. Quality Gates Checklist

### Gate 1: Build Must Pass ⛔ STOP
```bash
npm run build
```
- [ ] No TypeScript errors
- [ ] All `"use client"` components are async if they export server actions
- [ ] No import/export errors

### Gate 2: Lint Must Pass ⛔ STOP
```bash
npm run lint
```
- [ ] No ESLint errors (warnings OK)

### Gate 3: Dev Server Must Start ⛔ STOP
```bash
npm run dev
```
- [ ] Navigate to `/auth/status` (with test account if available)
- [ ] No console errors (red)
- [ ] Page loads without crash

### Gate 4: Tests Must Run ⛔ STOP
```bash
npm run test:unit
npx playwright test tests/e2e/jobsmarket/auth/status.spec.ts --project=chromium
```
- [ ] All tests pass (or documented skips)
- [ ] Test coverage ≥80% for new code

---

## 18. Success Criteria

### 18.1 Functional Requirements

- [ ] Deleted users see permanent deletion message with logout button
- [ ] Staff-pending users see company name and 3-step progress
- [ ] Company-pending users see 5-step progress and edit button
- [ ] Rejected users (via query param) see reason and next steps
- [ ] Invalid `?type` param is ignored, correct status auto-detected
- [ ] Users with no status are redirected to appropriate dashboard
- [ ] All views have working logout functionality
- [ ] Company name fetch failure shows fallback "บริษัท"

### 18.2 Non-Functional Requirements

- [ ] Page loads in <1 second (no mutations, minimal data fetch)
- [ ] Thai copy follows AUTH-R00 tone guidelines
- [ ] All interactive elements are keyboard accessible
- [ ] No console errors or warnings
- [ ] Mobile responsive (all views work on small screens)

### 18.3 Documentation

- [ ] Implementation notes added to this plan
- [ ] Test results documented
- [ ] Any deviations from RIS documented with rationale

---

## 19. Risks & Mitigations

### 19.1 Risk: No Test Accounts for Pending/Deleted States

**Impact:** Cannot fully test E2E flows for all status types

**Mitigation:**
- Create unit/integration tests with mocked data
- Document E2E tests as "skip if no test accounts"
- Manual testing with staging data if available

### 19.2 Risk: Company Fetch Failure

**Impact:** Pending views show generic "บริษัท" instead of company name

**Mitigation:**
- Graceful fallback already designed
- SWR auto-retry on network errors
- Error logged for debugging
- Does not block page functionality

### 19.3 ~~Risk: `useCompanyInfo` Hook Doesn't Exist~~ RESOLVED

**✅ Status:** Server action already exists - `webCompanyInformationGetById`

**No mitigation needed** - Use existing server action directly with or without SWR wrapper.

---

## 20. Open Questions for Approval

### 20.1 Test Account Availability

**Question:** Do we have test credentials for deleted/pending users in `.env.playwright`?

**Options:**
- If yes: Full E2E coverage
- If no: Unit/integration tests only, E2E tests skipped

**Recommendation:** Proceed with unit/integration tests, E2E as best-effort

### 20.2 Company Data Fetching ~~Hook~~ Server Action

**✅ RESOLVED:** Existing server action found at `src/lib/database/actions/company-information.ts`

**Action:** `webCompanyInformationGetById(uid: string)`

**Usage Pattern:**
```typescript
// Direct fetch
const company = await webCompanyInformationGetById(targetCompanyId);

// Or with SWR for caching
const { data: company } = useSWR(
  targetCompanyId ? ['company-info', targetCompanyId] : null,
  ([, id]) => webCompanyInformationGetById(id)
);
```

**No custom hook needed** - Use server action directly.

### 20.3 ProgressStepper Component Location

**Question:** Create as shared component or co-located?

**Options:**
1. Shared: `src/components/jobsmarket/auth/ProgressStepper.tsx`
2. Co-located: `src/app/jobsmarket/auth/status/_components/ProgressStepper.tsx`

**Recommendation:** Co-located (only used in this route for now, can be promoted later)

---

## 21. Approval Checklist

Before implementation, confirm:

- [ ] RIS document reviewed and understood
- [ ] No blocking questions remain
- [ ] All discrepancies resolved
- [ ] Test strategy approved (unit/integration primary, E2E best-effort)
- [ ] Thai copy approved
- [ ] UI mockups/wireframes approved (using RIS §8 text descriptions)
- [ ] Quality gates understood and agreed

---

## 22. Post-Implementation Verification

After implementation, verify:

- [ ] All quality gates passed (build, lint, dev, tests)
- [ ] Manual testing completed for all 4 status types
- [ ] Logout works from all views
- [ ] Auto-detection prioritizes deleted > company-pending > staff-pending
- [ ] Invalid query params silently ignored
- [ ] Deprecated routes redirect correctly
- [ ] Company name fallback works when fetch fails
- [ ] Mobile responsive check passed
- [ ] Accessibility audit passed (keyboard navigation, ARIA labels)
- [ ] No console errors or warnings

---

## Appendix A: File Structure Summary

```
src/app/jobsmarket/auth/status/
├── page.tsx                              # Server component (minimal)
└── _components/
    ├── StatusClient.tsx                  # Main client component with detection
    ├── DeletedStatusView.tsx             # Deleted view
    ├── StaffPendingView.tsx              # Staff pending view
    ├── CompanyPendingView.tsx            # Company pending view
    ├── RejectedView.tsx                  # Rejected view
    └── ProgressStepper.tsx               # Vertical progress stepper

tests/unit/jobsmarket/auth/status/
├── status-detection.test.ts              # Test detection logic
└── status-views.test.tsx                 # Test view components

tests/integration/jobsmarket/auth/status/
└── status-routing.test.ts                # Test routing behavior

tests/e2e/jobsmarket/auth/
└── status.spec.ts                        # E2E test for all status types

# Optional/Deprecated
src/app/jobsmarket/auth/pending/page.tsx  # Redirect to /auth/status
src/app/jobsmarket/auth/deleted/page.tsx  # Redirect to /auth/status?type=deleted
```

---

## Appendix B: Key Code Snippets

### Detection Logic
```typescript
function detectStatusType(user: userDataProps): StatusType | null {
  if (user.roles.includes('deleted') ||
      (user.status === 'deleted' && user.is_active === false)) {
    return 'deleted';
  }

  if (user.roles.includes('pending') && user.target_company) {
    if (user.roles.includes('admin')) {
      return 'company-pending';
    }
    return 'staff-pending';
  }

  return null;
}
```

### Query Parameter Handling
```typescript
const searchParams = useSearchParams();
const typeParam = searchParams.get('type');
const reasonParam = searchParams.get('reason');

if (typeParam === 'rejected') {
  return <RejectedView reason={reasonParam || undefined} />;
}

const detectedType = detectStatusType(user);
```

### Company Fetch with Server Action
```typescript
// ✅ CORRECT: Use existing server action
import { webCompanyInformationGetById } from '@/lib/database/actions/company-information';

// Option 1: Direct fetch with useEffect
const [companyName, setCompanyName] = useState('บริษัท');

useEffect(() => {
  if (targetCompanyId) {
    webCompanyInformationGetById(targetCompanyId)
      .then(data => setCompanyName(data?.company_name || 'บริษัท'))
      .catch(() => setCompanyName('บริษัท'));
  }
}, [targetCompanyId]);

// Option 2: SWR with server action (preferred - caching)
const { data: company } = useSWR(
  targetCompanyId ? ['company-info', targetCompanyId] : null,
  ([, id]) => webCompanyInformationGetById(id),
  { onError: () => {} }
);

const companyName = company?.company_name || 'บริษัท';
```

---

**Plan Status:** Ready for Review
**Estimated Implementation Time:** 2-3 days (including tests)
**Complexity:** Medium
**Confidence:** High (RIS is comprehensive, no mutations, clear requirements)
