# RIS: /auth/status

**Route ID:** AUTH-R05  
**Version:** 1.3  
**Status:** Draft  
**Created:** 2025-12-08  
**Last Updated:** 2025-12-09

**Changes in v1.3:**
- Added Cross-References section linking to AUTH-R00 shared patterns

**Changes in v1.2:**
- Updated Section 7.2 to use 5-column State Transition Table format per RIS_ORCHESTRATOR_GUIDE.md
- Added user action events (LOGOUT_CLICK, HOME_CLICK, etc.) to state table

**Changes in v1.1:**
- Simplified to current system reality (only `active` and `deleted` statuses exist)
- Removed account recovery feature (not implemented, deletion is permanent)
- Moved cancel staff request to Future Work (action not implemented)
- Added Section 7.2-7.4: State transition table, detection logic, and query parameter validation
- Added Section 13: Limitations & Future Work
- Updated all UI views to remove unimplemented action buttons
- All views now have consistent logout option

---

## Cross-References

This document references shared specifications from **AUTH-R00_cross-cutting_RIS.md**.

| Topic | AUTH-R00 Section |
|-------|------------------|
| Error UX standards | Section 2 |
| Session management | Section 3 |
| Global atoms | Section 4 |
| i18n & Thai copy guidelines | Section 6 |
| **Role semantics & status detection** | **Section 9** |
| Error code → message mapping | Appendix A |
| Thai copy reference | Appendix B |

---

## 1. Route Metadata

| Property | Value |
|----------|-------|
| Route Path | `/auth/status` |
| Shell | Minimal Shell |
| Purpose | Consolidated status page for pending, deleted, and rejected account states |
| Complexity | Medium |
| Phase | 1 (Foundation) |
| UI Spec | `03-auth-routes.md` Section 4.6 (partial) |

---

## 2. Domain Classification

### Primary Domain: Authentication

- **Owns:** Status display (read-only in v1.0)
- **Mutations:** None in v1.0 (see Section 13: Future Work)

### Secondary Domains

| Domain | Role | Access |
|--------|------|--------|
| Company | Staff-pending display | Read: `target_company` → fetch company name |
| Company | Company-pending display | Read: `company_information.status` |

### Global Domains

| Domain | Requirement |
|--------|-------------|
| Auth | User must be authenticated to reach this page |
| Chat | Not available (minimal shell) |
| Notifications | Not available (minimal shell) |

---

## 3. Feature Mapping

### Existing Features (Preserve - P0)

| Feature ID | Feature Name | Coverage | Notes |
|------------|--------------|----------|-------|
| AUTH-015 | Pending Status Management | Full | Display waiting status with progress |
| AUTH-012 | Account Deletion Request | Partial | Display deletion confirmation (no recovery) |
| AUTH-016 | Role-Based Navigation | Full | Route users here based on status |
| COMP-015 | Reject Employee Application | Display | Show rejection notification (via email link) |
| COMP-008 | Reject Company Request | Display | Show rejection notification (via email link) |

### New Features (This Route Introduces)

| Feature | Description | Priority |
|---------|-------------|----------|
| Consolidated Status Page | Single route for all status types via query param | P0 |
| Status Auto-Detection | Page detects status from user data, ignores invalid `?type` | P0 |

### Not Implemented in v1.0

| Feature | Description | Status |
|---------|-------------|--------|
| Account Recovery UI | Button to restore deleted account | ❌ Future Work |
| Cancel Staff Request | Button to withdraw pending staff application | ❌ Future Work |

### Deprecated Routes

| Old Route | Replacement | Migration |
|-----------|-------------|-----------|
| `/auth/pending` | `/auth/status` (auto-detect) | Redirect to new route |
| `/auth/deleted` | `/auth/status?type=deleted` | Redirect to new route |

---

## 4. Status Type Configuration

### 4.1 Current System Reality

**`user_accounts` fields:**

| Field | Type | Current Values |
|-------|------|----------------|
| `is_active` | boolean | `true` or `false` |
| `status` | string | Only `"active"` or `"deleted"` in practice |
| `roles` | string[] | May include `"pending"`, `"deleted"` |
| `target_company` | string | Set when pending company/staff request |

**Deletion Flow (Current):**
1. User submits deletion request (AUTH-012)
2. Platform admin approves → `is_active = false`, `status = "deleted"`, `roles` includes `"deleted"`
3. Account is permanently inaccessible (no grace period recovery)
4. User must re-register if they want to use ChanceDee again

### 4.2 Status Types Matrix

| Type | Detection Condition | Use Case | Data Source |
|------|---------------------|----------|-------------|
| `deleted` | `roles.includes('deleted')` OR (`status === 'deleted'` AND `is_active === false`) | Account has been deleted | `user_accounts` |
| `staff-pending` | `roles.includes('pending')` + `target_company` set + NOT `roles.includes('admin')` | Staff waiting for company admin approval | `user_accounts` |
| `company-pending` | `roles.includes('pending')` + `roles.includes('admin')` + `target_company` set | Company admin waiting for platform approval | `user_accounts` + link to `/companies/[id]/pending` |
| `rejected` | Query param only (not auto-detected) | Landed from rejection email notification | `?type=rejected&reason=...` |

### 4.3 Query Parameters

| Param | Required | Values | Purpose |
|-------|----------|--------|---------|
| `?type` | No | `deleted`, `staff-pending`, `company-pending`, `rejected` | Hint for status type (validated against user data) |
| `?reason` | Conditional | String | Rejection reason (for `type=rejected` only) |
| `?company` | No | Company ID | Override company name display (for email links) |

---

## 5. Data Contract

### 5.1 Read Operations

| Data | Collection | Fields | Condition | SWR Key |
|------|------------|--------|-----------|---------|
| User Data | `user_accounts` | `uid`, `roles`, `status`, `is_active`, `target_company`, `company_id` | Already in `userAtom` | `user-data-${uid}` |
| Target Company | `company_information` | `company_name`, `profile_photo` | If `target_company` set | `company-${targetCompanyId}` |

### 5.2 Write Operations

**None in v1.0** — All mutation actions are Future Work.

| Action | Status | Dependency |
|--------|--------|------------|
| Account Recovery | ❌ Future Work | Requires grace period implementation, `account_health` subcollection |
| Cancel Staff Request | ❌ Future Work | Requires confirmation UX for IMMEDIATE DETACHMENT warning |

---

## 6. State Contract

### 6.1 Atoms

| Atom | Type | R/W | Purpose |
|------|------|-----|---------|
| `userAtom` | `userDataProps \| null` | R | Get user roles, status, target_company |
| `firebaseUserAtom` | `User \| null` | R | Verify authenticated |
| `sessionStateAtom` | `SessionState` | R | Verify session valid |

### 6.2 Hooks

| Hook | Returns | Purpose |
|------|---------|---------|
| `useFirebaseAuth` | `{ user, loading, signOutFirebase }` | Check auth state, logout |
| `useCompanyInfo` | `{ company, isLoading }` | Fetch target company name |

### 6.3 Local Component State

| State | Type | Initial | Purpose |
|-------|------|---------|---------|
| `detectedType` | `StatusType \| null` | `null` | Auto-detected status type |
| `isLoading` | `boolean` | `true` | Initial detection loading |

---


## 7. UI State Machine

### 7.1 Page State Automaton

```
                    ┌─────────────────────────┐
                    │      CHECK_AUTH         │
                    │    (initial load)       │
                    └───────────┬─────────────┘
                                │
           ┌────────────────────┼────────────────────┐
           │                    │                    │
           ▼                    ▼                    ▼
┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
│    NOT_AUTHED       │ │   DETECT_STATUS     │ │   REJECTED_PARAM    │
│  → /auth/login      │ │  (check user data)  │ │  (?type=rejected)   │
└─────────────────────┘ └──────────┬──────────┘ └──────────┬──────────┘
                                   │                       │
          ┌────────────────────────┼───────────────────────┤
          │            │           │           │           │
          ▼            ▼           ▼           ▼           ▼
   ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐
   │  DELETED  │ │  STAFF_   │ │ COMPANY_  │ │ NO_STATUS │ │ REJECTED  │
   │ (display) │ │  PENDING  │ │ PENDING   │ │→ dashboard│ │ (display) │
   └───────────┘ └───────────┘ └───────────┘ └───────────┘ └───────────┘
```

### 7.2 Page State Transition Table

| Current State | Event | Next State | Guard Condition | Side Effects |
|---------------|-------|------------|-----------------|--------------|
| `CHECK_AUTH` | `SESSION_CHECK` | `NOT_AUTHED` | sessionState !== 'valid' | router.replace('/auth/login') |
| `CHECK_AUTH` | `SESSION_CHECK` | `REJECTED_PARAM` | sessionState === 'valid' && ?type=rejected present | - |
| `CHECK_AUTH` | `SESSION_CHECK` | `DETECT_STATUS` | sessionState === 'valid' && no ?type=rejected | - |
| `DETECT_STATUS` | `STATUS_DETECTED` | `DELETED` | roles.includes('deleted') OR (status === 'deleted' && !is_active) | render DeletedStatusView |
| `DETECT_STATUS` | `STATUS_DETECTED` | `COMPANY_PENDING` | roles.includes('pending') && target_company && roles.includes('admin') | render CompanyPendingView |
| `DETECT_STATUS` | `STATUS_DETECTED` | `STAFF_PENDING` | roles.includes('pending') && target_company && !roles.includes('admin') | render StaffPendingView |
| `DETECT_STATUS` | `STATUS_DETECTED` | `NO_STATUS` | none of above conditions | - |
| `NO_STATUS` | `AUTO_REDIRECT` | - | roles.includes('company') && company_id | router.replace('/companies/${company_id}/dashboard') |
| `NO_STATUS` | `AUTO_REDIRECT` | - | roles.includes('candidate') | router.replace('/candidates/${uid}') |
| `NO_STATUS` | `AUTO_REDIRECT` | - | fallback | router.replace('/') |
| `REJECTED_PARAM` | `RENDER` | `REJECTED` | - | render RejectedView with ?reason param |
| `DELETED` | `LOGOUT_CLICK` | - | - | signOutFirebase(), router.push('/auth/login') |
| `STAFF_PENDING` | `HOME_CLICK` | - | - | router.push('/candidates/${uid}') |
| `STAFF_PENDING` | `LOGOUT_CLICK` | - | - | signOutFirebase(), router.push('/auth/login') |
| `COMPANY_PENDING` | `EDIT_CLICK` | - | - | router.push('/companies/${target_company}/pending') |
| `COMPANY_PENDING` | `LOGOUT_CLICK` | - | - | signOutFirebase(), router.push('/auth/login') |
| `REJECTED` | `HOME_CLICK` | - | - | router.push('/candidates/${uid}') |
| `REJECTED` | `SUPPORT_CLICK` | - | - | window.open('mailto:support@chancedee.com') |
| `REJECTED` | `LOGOUT_CLICK` | - | - | signOutFirebase(), router.push('/auth/login') |

### 7.3 Detection Priority Order

```typescript
function detectStatusType(user: userDataProps): StatusType | null {
  // 1. Check for deleted status (highest priority - blocks all access)
  if (user.roles.includes('deleted') || 
      (user.status === 'deleted' && user.is_active === false)) {
    return 'deleted';
  }
  
  // 2. Check for pending status with target company
  if (user.roles.includes('pending') && user.target_company) {
    // 2a. Company admin pending platform approval
    if (user.roles.includes('admin')) {
      return 'company-pending';
    }
    // 2b. Staff pending company admin approval
    return 'staff-pending';
  }
  
  // 3. No matching status - user should be redirected to dashboard
  return null;
}
```

### 7.4 Query Parameter Validation

| Scenario | `?type` Value | User Data Match? | Behavior |
|----------|---------------|------------------|----------|
| Valid rejected link | `rejected` | N/A (special case) | Show rejected view |
| Valid hint matching | `staff-pending` | Yes (user is staff-pending) | Show staff-pending view |
| Invalid hint mismatch | `deleted` | No (user is staff-pending) | Ignore param, auto-detect → staff-pending |
| Invalid hint mismatch | `staff-pending` | No (user is deleted) | Ignore param, auto-detect → deleted |
| Missing param | (none) | - | Auto-detect from user data |
| Unknown value | `invalid-type` | - | Ignore param, auto-detect |

**Note:** `?type=rejected` is special — it bypasses auto-detection since rejected users have already lost their pending status and cannot be detected from user data.

---

---

## 8. UI Specification

### 8.1 Layout Structure (All Types)

```
┌─────────────────────────────────────────────────────────────┐
│                      [ChanceDee Logo]                       │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                                                       │  │
│  │                    [Status Icon]                      │  │
│  │                    [Title]                            │  │
│  │                                                       │  │
│  │                    [Description]                      │  │
│  │                                                       │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │            [Type-Specific Content]              │  │  │
│  │  │            (Progress Stepper, Info, etc.)       │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                                                       │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │            [Action Buttons]                     │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                                                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│                        [ออกจากระบบ]                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 Type: `deleted`

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    ⚠️ บัญชีถูกลบแล้ว                          │
│                                                             │
│  บัญชีของคุณถูกลบจากระบบแล้ว                                  │
│  การลบบัญชีไม่สามารถยกเลิกได้                                 │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  หากต้องการใช้งานอีกครั้ง กรุณาสมัครสมาชิกใหม่          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              [ออกจากระบบ]  (Primary)                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Components:**

| Component | Purpose | Data Source |
|-----------|---------|-------------|
| Warning Icon | Visual indicator | Static ⚠️ |
| Title | "บัญชีถูกลบแล้ว" | Static |
| Description | Permanent deletion notice | Static |
| Re-register Note | Guide for new registration | Static |
| Logout Button | Primary action | Calls `signOutFirebase()` |

**Note:** No recovery button — deletion is permanent in current system.

### 8.3 Type: `staff-pending`

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    ⏳ รอการอนุมัติ                            │
│                                                             │
│  คำขอเข้าร่วม {companyName} ของคุณกำลังรอการอนุมัติ            │
│  จากผู้ดูแลระบบของบริษัท                                      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [Company Logo]  {companyName}                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ✓ ส่งคำขอแล้ว                                       │   │
│  │  ◐ รอผู้ดูแลอนุมัติ  ← (highlighted)                  │   │
│  │  ○ เข้าร่วมบริษัท                                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  เราจะแจ้งผลทางอีเมลเมื่อมีการตอบกลับ                          │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         [กลับสู่หน้าหลัก]  (Primary)                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [ออกจากระบบ]                                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Components:**

| Component | Purpose | Data Source |
|-----------|---------|-------------|
| Hourglass Icon | Visual indicator | Static ⏳ |
| Title | "รอการอนุมัติ" | Static |
| Company Card | Show target company | Fetch from `company_information` via `target_company` |
| Progress Stepper | 3-step vertical stepper | Static (step 2 highlighted) |
| Email Note | Notification method | Static |
| Home Button | Primary action | Navigate to `/candidates/${uid}` |
| Logout Link | Secondary action | Calls `signOutFirebase()` |

**Note:** No cancel button in v1.0 — see Section 13 (Future Work).

### 8.4 Type: `company-pending`

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    ⏳ รอการตรวจสอบ                           │
│                                                             │
│  คำขอลงทะเบียนบริษัทของคุณกำลังรอการตรวจสอบ                   │
│  โดยทีมงาน ChanceDee                                        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ✓ บัญชีสร้างแล้ว                                    │   │
│  │  ✓ ข้อมูลบริษัทส่งแล้ว                                │   │
│  │  ◐ กำลังตรวจสอบเอกสาร  ← (highlighted, animated)     │   │
│  │  ○ รอการอนุมัติ                                      │   │
│  │  ○ อนุมัติแล้ว                                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  โดยประมาณ 1-2 วันทำการ                                      │
│  เราจะแจ้งผลทางอีเมล                                         │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         [แก้ไขข้อมูลบริษัท]  (Primary)                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [ออกจากระบบ]                                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Components:**

| Component | Purpose | Data Source |
|-----------|---------|-------------|
| Hourglass Icon | Visual indicator | Static ⏳ |
| Title | "รอการตรวจสอบ" | Static |
| Progress Stepper | 5-step vertical stepper | Static (step 3 highlighted) |
| Time Estimate | "1-2 วันทำการ" | Static |
| Email Note | Notification method | Static |
| Edit Button | Primary action | Navigate to `/companies/${target_company}/pending` |
| Logout Link | Secondary action | Calls `signOutFirebase()` |

**Note:** This is a lightweight view that links to the full company pending workspace at `/companies/[id]/pending`.

### 8.5 Type: `rejected`

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    ❌ คำขอถูกปฏิเสธ                          │
│                                                             │
│  {rejectionReason || "คำขอของคุณไม่ได้รับการอนุมัติ"}         │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  สิ่งที่คุณสามารถทำได้:                                │   │
│  │  • ตรวจสอบเอกสารที่ส่งมา                              │   │
│  │  • แก้ไขข้อมูลตามเหตุผลที่ระบุ                         │   │
│  │  • ส่งคำขอใหม่อีกครั้ง                                 │   │
│  │  • ติดต่อทีมงาน CHANCEDEE หากมีข้อสงสัย               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌────────────────┐    ┌────────────────┐                  │
│  │ [ติดต่อฝ่ายสนับสนุน] │    │ [กลับสู่หน้าหลัก] │                  │
│  │  (Secondary)   │    │   (Primary)    │                  │
│  └────────────────┘    └────────────────┘                  │
│                                                             │
│  [ออกจากระบบ]                                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Components:**

| Component | Purpose | Data Source |
|-----------|---------|-------------|
| X Icon | Visual indicator | Static ❌ |
| Title | "คำขอถูกปฏิเสธ" | Static |
| Reason | Rejection reason | `?reason` query param or default message |
| Next Steps Card | Guidance for user | Static list |
| Support Button | Secondary action | `mailto:support@chancedee.com` |
| Home Button | Primary action | Navigate to `/candidates/${uid}` |
| Logout Link | Tertiary action | Calls `signOutFirebase()` |

---

## 9. Component-Action Wiring

### 9.1 Navigation Actions Only (v1.0)

| View | Component | Trigger | Action |
|------|-----------|---------|--------|
| All | Logo | Click | `router.push('/')` |
| All | Logout Link/Button | Click | `signOutFirebase()` → `router.push('/auth/login')` |
| staff-pending | Home Button | Click | `router.push('/candidates/${uid}')` |
| company-pending | Edit Button | Click | `router.push('/companies/${target_company}/pending')` |
| rejected | Support Button | Click | `window.open('mailto:support@chancedee.com')` |
| rejected | Home Button | Click | `router.push('/candidates/${uid}')` |

**Note:** No mutation actions in v1.0. See Section 13 for Future Work.

---

## 10. Error Handling

### 10.1 Status Detection Errors

| Error | Condition | Display | Recovery |
|-------|-----------|---------|----------|
| No session | `sessionState !== 'valid'` | Redirect | → `/auth/login` |
| No matching status | User has no pending/deleted status | Redirect | → appropriate dashboard |
| Invalid type param | `?type` doesn't match user data | Ignore param | Auto-detect from user data |
| Company fetch failed | Target company not found | Show "บริษัท" | Continue with generic name |

### 10.2 Network Errors

| Error | Condition | Display | Recovery |
|-------|-----------|---------|----------|
| Company info failed | SWR fetch error | Show placeholder | Retry on refresh |
| Session expired | Cookie invalid | Redirect | → `/auth/login` |

---

## 11. System Constraints

### Current Constraints

| Constraint | Detail |
|------------|--------|
| Single-company model | Users belong to ONE company (`company_id: string`) |
| Multi-role definition | `candidate` + `company`, NOT multiple companies |
| IMMEDIATE DETACHMENT | When applying to new company, user is detached from old company immediately |
| Permanent deletion | No recovery — deletion is final |
| NO RESTORATION policy | Rejected staff are NOT restored to previous company |

### State Rename (Migration Note)

| Old | New | Reason |
|-----|-----|--------|
| `navBarAtom` | `activeRoleAtom` | Semantic — role drives UI, not vice versa |

---

## 12. Implementation Checklist

### 12.1 Page Component

- [ ] Create `/app/auth/status/page.tsx`
- [ ] Implement CHECK_AUTH guard
- [ ] Implement status auto-detection logic (Section 7.3)
- [ ] Handle `?type` and `?reason` query params (Section 7.4)
- [ ] Render appropriate view based on detected type

### 12.2 UI Components

- [ ] Create `StatusCard` wrapper component
- [ ] Create `DeletedStatusView` component (display only, no recovery)
- [ ] Create `StaffPendingView` component (display only, no cancel)
- [ ] Create `CompanyPendingView` component
- [ ] Create `RejectedView` component
- [ ] Create `ProgressStepper` component (vertical, 3-5 steps)
- [ ] Ensure all views have logout option

### 12.3 Hooks

- [ ] Reuse `useCompanyInfo()` for target company name

### 12.4 Navigation Updates

- [ ] Update `navigateUserByRole()` to route to `/auth/status`
- [ ] Add redirects from deprecated routes (`/auth/pending`, `/auth/deleted`)

### 12.5 Testing

- [ ] Test: Deleted user sees permanent deletion message
- [ ] Test: Staff-pending shows correct company name
- [ ] Test: Company-pending links to full workspace
- [ ] Test: Rejected shows reason from query param
- [ ] Test: Auto-detection ignores invalid `?type`
- [ ] Test: User with no status redirects to dashboard
- [ ] Test: All views have working logout
- [ ] Test: Fallback company name when fetch fails

---

## 13. Limitations & Future Work

### 13.1 Current Limitations

| Limitation | Impact | Workaround |
|------------|--------|------------|
| No account recovery | Deleted users cannot recover | Must re-register |
| No cancel staff request | Cannot withdraw applications | Wait for approval/rejection |
| No suspension/ban distinction | All inactive = deleted | Admin manually manages |
| No rejection history | Reason only in email | User checks email |

### 13.2 Future Work: Account Health Subcollection

**Status:** Not yet designed

**Purpose:** Track account events (deletion, suspension, requests, recovery)

**Proposed Fields:**
- `event_type`: 'deletion_requested' | 'deleted' | 'suspended' | 'recovered'
- `timestamp`: When event occurred
- `actor_id`: Who performed action (user or admin)
- `reason`: Optional reason string
- `metadata`: Additional context

**Dependency:** Requires separate data entity design session

### 13.3 Future Work: Account Recovery

**Status:** Business logic not implemented

**Requirements:**
1. Change deletion flow to `status: 'delete_pending'` with 30-day grace period
2. Create `recoverDeletedAccount()` server action
3. Store previous roles for restoration
4. Recovery resets to candidate-only (no company restoration)
5. UI: Add recovery button, show days remaining countdown

**Implementation Notes:**
```typescript
// Proposed server action
async function recoverDeletedAccount(uid: string): Promise<{
  success: boolean;
  restoredRoles?: string[];
  error?: string;
}>;
// - Validate within grace period
// - Remove 'deleted' from roles
// - Set status = 'active', is_active = true
// - Restore to candidate-only
```

### 13.4 Future Work: Cancel Staff Request

**Status:** Action not implemented

**Requirements:**
1. Create `cancelStaffRequest()` server action
2. Strong confirmation UI with IMMEDIATE DETACHMENT warning
3. Warning text: "คุณจะไม่สามารถกลับไปบริษัทเดิมได้"
4. Action removes pending status, returns to candidate-only

**Implementation Notes:**
```typescript
// Proposed server action
async function cancelStaffRequest(uid: string): Promise<{
  success: boolean;
  error?: string;
}>;
// - Remove 'pending', 'company' from roles
// - Keep 'candidate' role
// - Clear target_company
// - Note: Same effect as rejection but user-initiated
```

---

## 14. Decisions Log

| Decision | Chosen | Rationale | Date |
|----------|--------|-----------|------|
| Consolidate status routes | Single `/auth/status` with types | Easier maintenance, single source of truth | 2025-12-08 |
| Auto-detect from user data | Ignore invalid `?type` | Robust when opening in new tab/window | 2025-12-08 |
| No polling | Email notification primary | Simpler implementation, sufficient UX | 2025-12-08 |
| Company-pending links out | To `/companies/[id]/pending` | That route has full editing UI already | 2025-12-08 |
| Rejected via email link only | Not auto-detected | Rejected users lose pending status | 2025-12-08 |
| Deprecate `/auth/pending` | Redirect to `/auth/status` | Consolidation | 2025-12-08 |
| No recovery in v1.0 | Display only | Business logic not implemented, deletion is permanent | 2025-12-08 |
| No cancel in v1.0 | Display only | Needs DETACHMENT warning UX, action not implemented | 2025-12-08 |
| Consistent logout | All views | UX consistency, user always has exit option | 2025-12-08 |

---

## 15. Related Routes

| Route | Relationship |
|-------|--------------|
| `/auth/login` | Predecessor — routes here for pending/deleted users |
| `/auth/register` | Predecessor — routes here after company registration |
| `/companies/[id]/pending` | Destination — full company pending workspace |
| `/candidates/[id]` | Destination — home button destination |
| `/auth/settings` | Related — account deletion request originates here |

---

## 16. Open Questions

| Question | Status | Notes |
|----------|--------|-------|
| Grace period implementation | ⏳ Future Work | Requires system changes, see Section 13.3 |
| Email template for rejection links | ⏳ Design needed | Should link to `/auth/status?type=rejected&reason=...` |
| Cancel request confirmation UX | ⏳ Future Work | Needs IMMEDIATE DETACHMENT warning design |

---

## Appendix A: TypeScript Types

```typescript
// Status types
type StatusType = 'deleted' | 'staff-pending' | 'company-pending' | 'rejected';

// Page state
type PageState = 
  | 'checking' 
  | 'loading-data'
  | 'ready';

// Query params
interface StatusQueryParams {
  type?: StatusType;
  reason?: string;
  company?: string;
}

// Detection result
interface DetectionResult {
  type: StatusType | null;
  targetCompanyId?: string;
}
```

---

## Appendix B: Component File Structure

```
src/
├── app/
│   └── auth/
│       └── status/
│           └── page.tsx              # Main page component
├── components/
│   └── auth/
│       ├── StatusCard.tsx            # Wrapper container
│       ├── DeletedStatusView.tsx     # Deleted account view (display only)
│       ├── StaffPendingView.tsx      # Staff pending view (display only)
│       ├── CompanyPendingView.tsx    # Company pending view
│       ├── RejectedView.tsx          # Rejected view
│       └── ProgressStepper.tsx       # Vertical progress stepper
```

---

## Appendix C: Source References

| Section | Source |
|---------|--------|
| Pending routing logic | `AUTH-R01_login_RIS.md` Section 9.5 |
| Deleted account handling | `AUTH-R01_login_RIS.md` Section 10.2 |
| IMMEDIATE DETACHMENT | `features_companies.md` COMP-018 |
| Rejection side effects | `features_companies.md` COMP-015 |
| Company pending workspace | `05-company-routes.md` Section 6.1 |
| Email notifications | `features_notifications.md` NOTIF-012 |
| Delete requests schema | `data-entities_delete-requests.md` |
| User roles structure | `data-entities_user-info.md` |
| Admin deletion action | `features_admin.md` ADMIN-020 |

---

*End of RIS: /auth/status (AUTH-R05) v1.2*
