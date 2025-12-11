# RIS: /companies/[id]/dashboard/team

**Route ID:** COMP-R02  
**Version:** 1.0  
**Status:** Draft  
**Created:** 2025-12-09  
**Last Updated:** 2025-12-09

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-09 | Initial creation with complete state transition tables |

---

## 1. Route Metadata

| Property | Value |
|----------|-------|
| Route Path | `/companies/[id]/dashboard/team` |
| Route ID | COMP-R02 |
| Shell | Company Shell |
| Purpose | Manage team members, roles, and handle pending employee applications |
| Complexity | High |
| Phase | 1b (Company Setup) |
| UI Spec | `05-company-routes.md` Section 6.7 |

### URL Parameters

| Parameter | Type | Required | Validation |
|-----------|------|----------|------------|
| `id` | string | yes | Valid company document ID |
| `tab` | query | no | `members` (default) or `invite` |

### Access Control

| Condition | Behavior |
|-----------|----------|
| Not authenticated | Redirect → `/auth/login` |
| Not company member | Redirect → `/` or 403 page |
| Company not approved | Redirect → `/companies/[id]/pending` |
| Is Admin | Full access (both tabs) |
| Is Non-Admin (HR Manager, Recruiter, Interviewer, Viewer) | View-only (Members tab only, actions disabled) |

---

## 2. Domain Classification

### Primary Domain: Company

- **Owns:** Team member management, role assignments, employee application processing
- **Mutations:**
  - Accept pending employee (COMP-014)
  - Reject pending employee (COMP-015)
  - Toggle employee role (COMP-016)
  - Remove employee from company (COMP-017)

### Secondary Domains

| Domain | Role | Access |
|--------|------|--------|
| Auth | User identity and roles | Read: current user's admin status |
| Candidate | Employee user profiles | Read: display names, avatars |

### Global Domains

| Domain | Requirement |
|--------|-------------|
| Auth | User must be authenticated with company role |
| Chat | Available via shell FAB |
| Notifications | Available via shell bell icon |

---

## 3. Feature Mapping

### Existing Features (Preserve - P0)

| Feature ID | Feature Name | Server Action | Coverage | Tab |
|------------|--------------|---------------|----------|-----|
| COMP-012 | View Employee List | `getCompanyStaff` | Full | Members |
| COMP-013 | View Pending Employee Requests | Query `user_transfer` | Full | Members |
| COMP-014 | Accept Employee Application | `companyAdminAcceptNewEmployee` | Full | Members |
| COMP-015 | Reject Employee Application | `companyAdminRejectNewEmployee` | Full | Members |
| COMP-016 | Toggle Employee Role | `toggleEmployeeRole` | Full | Members |
| COMP-017 | Remove Employee from Company | `removeEmployee` | Full | Members |
| COMP-019 | List Company Staff | `ListCompanyStaff` | Full | Members |

### New Features (This Route Introduces)

| Feature | Description | Tab | Priority |
|---------|-------------|-----|----------|
| Permission Preview | Show role permissions when inviting | Invite | P1 |
| Pending Invitation Expiry | Visual indicator for 7-day expired invites | Members | P1 |

### Related Features (Other Routes)

| Feature | Route | Relationship |
|---------|-------|--------------|
| Company Settings | `/companies/[id]/dashboard/settings` | Link from team page header |
| Company Dashboard | `/companies/[id]/dashboard` | Parent navigation |
| Staff Request Apply | `/auth/register` (company type) | Creates pending applications |

---

## 4. Data Contract

### 4.1 Read Operations

| Data | Collection | Fields | Condition | SWR Key |
|------|------------|--------|-----------|---------|
| Company Staff | `user_info` | `uid`, `roles`, `companyId`, `createdAt`, `updatedAt` | `companyId === [id]` | `company-staff-${companyId}` |
| User Profiles | `user_accounts` | `displayName`, `email`, `profilePhoto` | staff UIDs | `user-profile-${uid}` |
| Pending Applications | `user_transfer` | `uid`, `targetCompany`, `transferApproved`, `requestTimestamp` | `targetCompany === [id]` && `transferApproved === false` | `pending-employees-${companyId}` |
| Current User | `user_info` | `uid`, `roles`, `companyId` | Authenticated | `user-data-${uid}` |
| Admin Count | `user_info` | count where `companyId` && `roles.includes('admin')` | On remove action | N/A (on-demand) |

### 4.2 Write Operations

| Action | Collection | Fields | Server Action | Trigger |
|--------|------------|--------|---------------|---------|
| Accept Employee | `user_info` | `companyId`, `roles` (+company), remove pending | `companyAdminAcceptNewEmployee(targetUserId)` | Accept button |
| Accept Employee | `user_transfer` | `transferApproved: true` | (same as above) | (same) |
| Reject Employee | `user_info` | clear `companyId`, `roles` = ['candidate'] | `companyAdminRejectNewEmployee(targetUserId)` | Reject button |
| Reject Employee | `user_transfer` | clear `targetCompany`, `transferApproved: false` | (same as above) | (same) |
| Change Role | `user_info` | `roles` array (add/remove 'admin') | `toggleEmployeeRole(targetUserId, newRole)` | Role picker confirm |
| Remove Employee | `user_info` | clear `companyId`, `roles` = ['candidate'] | `removeEmployee(targetUserId)` | Remove confirm |

### 4.3 Derived Data

```typescript
// Admin check for current user
const isAdmin = currentUser.roles.includes('admin');

// Last admin check before removal/demotion
const adminCount = staff.filter(s => s.roles.includes('admin')).length;
const isLastAdmin = adminCount === 1 && targetUser.roles.includes('admin');

// Self-action check
const isSelf = currentUser.uid === targetUser.uid;

// Pending expiry check (7 days)
const INVITE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;
const isExpired = Date.now() - requestTimestamp > INVITE_EXPIRY_MS;
```

---

## 5. State Contract

### 5.1 Atoms

| Atom | Type | R/W | Purpose |
|------|------|-----|---------|
| `userAtom` | `userDataProps \| null` | R | Get current user's uid, roles |
| `activeRoleAtom` | `string` | R | Verify user is in company context |
| `companyIdAtom` | `string \| null` | R | Get current company ID from context |

### 5.2 SWR Keys

| Key | Data | Invalidate On |
|-----|------|---------------|
| `company-staff-${companyId}` | Team member list | Accept/Reject/Remove/Role change |
| `pending-employees-${companyId}` | Pending applications | Accept/Reject |
| `admin-count-${companyId}` | Number of admins | Role change/Remove |

### 5.3 Local Component State

| State | Type | Initial | Purpose |
|-------|------|---------|---------|
| `activeTab` | `'members' \| 'invite'` | From URL or `'members'` | Current tab selection |
| `selectedMember` | `string \| null` | `null` | Member selected for action |
| `isRolePickerOpen` | `boolean` | `false` | Role picker modal visibility |
| `isRemoveConfirmOpen` | `boolean` | `false` | Remove confirmation modal |
| `isRejectConfirmOpen` | `boolean` | `false` | Reject confirmation modal |
| `isSubmitting` | `boolean` | `false` | Action submission state |
| `inviteEmail` | `string` | `''` | Invite form email input |
| `inviteRole` | `RoleType` | `'staff'` | Selected role for invite |

### 5.4 Proposed New Hooks

```typescript
// src/domains/companies/hooks/use-company-team.ts
export function useCompanyTeam(companyId: string) {
  // Fetches and manages team member list
  // Returns: { staff, pending, isLoading, isAdmin, mutate }
}

// src/domains/companies/hooks/use-team-actions.ts
export function useTeamActions(companyId: string) {
  // Encapsulates team management actions with optimistic updates
  // Returns: { acceptEmployee, rejectEmployee, changeRole, removeEmployee }
}
```

---

## 6. UI State Machine

### 6.1 Page State Automaton

#### 6.1.1 Page State Transition Table

| Current State | Event | Next State | Guard Condition | Side Effects |
|---------------|-------|------------|-----------------|--------------|
| `loading` | `DATA_LOADED` | `idle` | - | Render content |
| `loading` | `AUTH_FAILED` | `redirect` | - | router.replace('/auth/login') |
| `loading` | `NOT_MEMBER` | `redirect` | user.companyId !== id | router.replace('/') |
| `loading` | `COMPANY_PENDING` | `redirect` | company.status === 'pending' | router.replace(`/companies/${id}/pending`) |
| `idle` | `TAB_SWITCH` | `idle` | - | Update URL ?tab=, setActiveTab() |
| `idle` | `OPEN_ROLE_PICKER` | `editing_role` | isAdmin && !isSelf | setSelectedMember(), setRolePickerOpen(true) |
| `idle` | `OPEN_REMOVE_CONFIRM` | `confirming_remove` | isAdmin && !isSelf && !isLastAdmin | setSelectedMember(), setRemoveConfirmOpen(true) |
| `idle` | `OPEN_ACCEPT_CONFIRM` | `confirming_accept` | isAdmin && hasPending | setSelectedMember() |
| `idle` | `OPEN_REJECT_CONFIRM` | `confirming_reject` | isAdmin && hasPending | setSelectedMember(), setRejectConfirmOpen(true) |
| `editing_role` | `CANCEL` | `idle` | - | setRolePickerOpen(false), clearSelectedMember() |
| `editing_role` | `SUBMIT_ROLE` | `submitting_role` | newRole !== currentRole | - |
| `submitting_role` | `SUCCESS` | `idle` | - | mutate SWR, toast success, close modal |
| `submitting_role` | `ERROR` | `editing_role` | - | toast error |
| `confirming_remove` | `CANCEL` | `idle` | - | setRemoveConfirmOpen(false) |
| `confirming_remove` | `CONFIRM_REMOVE` | `submitting_remove` | - | - |
| `submitting_remove` | `SUCCESS` | `idle` | - | mutate SWR, toast success, close modal |
| `submitting_remove` | `ERROR` | `confirming_remove` | - | toast error |
| `confirming_accept` | `CANCEL` | `idle` | - | clearSelectedMember() |
| `confirming_accept` | `CONFIRM_ACCEPT` | `submitting_accept` | - | - |
| `submitting_accept` | `SUCCESS` | `idle` | - | mutate both SWR keys, toast success |
| `submitting_accept` | `ERROR` | `idle` | - | toast error |
| `confirming_reject` | `CANCEL` | `idle` | - | setRejectConfirmOpen(false) |
| `confirming_reject` | `CONFIRM_REJECT` | `submitting_reject` | - | - |
| `submitting_reject` | `SUCCESS` | `idle` | - | mutate pending SWR, toast success |
| `submitting_reject` | `ERROR` | `confirming_reject` | - | toast error |

#### 6.1.2 Page State Diagram

```
                    ┌─────────────────────┐
                    │      loading        │
                    └──────────┬──────────┘
                               │
           ┌───────────────────┼───────────────────┐
           │                   │                   │
           ▼                   ▼                   ▼
    ┌──────────┐        ┌──────────┐        ┌──────────┐
    │ redirect │        │   idle   │◄───────│  error   │
    └──────────┘        └────┬─────┘        └──────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
  ┌──────────────┐   ┌─────────────────┐   ┌─────────────────┐
  │ editing_role │   │confirming_remove│   │confirming_accept│
  └──────┬───────┘   └────────┬────────┘   └────────┬────────┘
         │                    │                     │
         ▼                    ▼                     ▼
  ┌──────────────┐   ┌─────────────────┐   ┌─────────────────┐
  │submitting_   │   │  submitting_    │   │  submitting_    │
  │    role      │   │     remove      │   │     accept      │
  └──────────────┘   └─────────────────┘   └─────────────────┘
```

### 6.2 Entity State Automaton

#### 6.2.1 Team Member State Transitions

| Entity | Current State | Event | Next State | Actor | Side Effects |
|--------|---------------|-------|------------|-------|--------------|
| Member | `staff` | `PROMOTE_TO_ADMIN` | `admin` | Admin | Add 'admin' to roles array |
| Member | `admin` | `DEMOTE_TO_STAFF` | `staff` | Admin | Remove 'admin' from roles array |
| Member | `staff` | `REMOVE` | `removed` | Admin | Clear companyId, roles = ['candidate'] |
| Member | `admin` | `REMOVE` | `removed` | Admin | Guard: !isLastAdmin; Clear companyId, roles = ['candidate'] |
| Member | `*` | `SELF_LEAVE` | `removed` | Self | Guard: !isLastAdmin; Clear companyId |

#### 6.2.2 Pending Employee State Transitions

| Entity | Current State | Event | Next State | Actor | Side Effects |
|--------|---------------|-------|------------|-------|--------------|
| Pending | `pending` | `ACCEPT` | `active_member` | Admin | Set companyId, add 'company' role, remove 'pending', transferApproved=true |
| Pending | `pending` | `REJECT` | `standalone_candidate` | Admin | Clear companyId, roles=['candidate'], clear targetCompany |
| Pending | `pending` | `EXPIRE` | `expired` | System | After 7 days - visual only, still actionable |
| Pending | `pending` | `CANCEL_BY_USER` | `cancelled` | Pending User | Clear targetCompany (user-initiated) |

### 6.3 Component State Automaton

#### 6.3.1 Role Picker Modal

| Component | Current State | Event | Next State | Condition |
|-----------|---------------|-------|------------|-----------|
| RolePickerModal | `closed` | `OPEN` | `open` | isAdmin && !isSelf |
| RolePickerModal | `open` | `SELECT_ROLE` | `open` | - (update selection) |
| RolePickerModal | `open` | `CANCEL` | `closed` | - |
| RolePickerModal | `open` | `CONFIRM` | `submitting` | selectedRole !== currentRole |
| RolePickerModal | `submitting` | `SUCCESS` | `closed` | - |
| RolePickerModal | `submitting` | `ERROR` | `open` | - (show error in modal) |

#### 6.3.2 Remove Confirmation Modal

| Component | Current State | Event | Next State | Condition |
|-----------|---------------|-------|------------|-----------|
| RemoveConfirmModal | `closed` | `OPEN` | `open` | isAdmin && !isSelf && !isLastAdmin |
| RemoveConfirmModal | `open` | `CANCEL` | `closed` | - |
| RemoveConfirmModal | `open` | `CONFIRM` | `submitting` | - |
| RemoveConfirmModal | `submitting` | `SUCCESS` | `closed` | - |
| RemoveConfirmModal | `submitting` | `ERROR` | `open` | - |

#### 6.3.3 Tab Navigation

| Component | Current State | Event | Next State | Condition |
|-----------|---------------|-------|------------|-----------|
| TabNav | `members` | `CLICK_INVITE` | `invite` | isAdmin |
| TabNav | `invite` | `CLICK_MEMBERS` | `members` | - |
| TabNav | `*` | `URL_CHANGE` | `*` | Sync with ?tab= param |

### 6.4 Invite Form State (Admin Only)

| Current State | Event | Next State | Guard Condition | Side Effects |
|---------------|-------|------------|-----------------|--------------|
| `idle` | `INPUT_EMAIL` | `idle` | - | setInviteEmail() |
| `idle` | `SELECT_ROLE` | `idle` | - | setInviteRole() |
| `idle` | `SUBMIT` | `validating` | - | - |
| `validating` | `VALID` | `submitting` | isValidEmail && !isSelf && !isExistingMember | - |
| `validating` | `INVALID_EMAIL` | `error` | - | setError('รูปแบบอีเมลไม่ถูกต้อง') |
| `validating` | `INVITE_SELF` | `error` | email === currentUser.email | setError('ไม่สามารถเชิญตัวเอง') |
| `validating` | `ALREADY_MEMBER` | `error` | emailInMemberList | setError('เป็นสมาชิกอยู่แล้ว') |
| `submitting` | `SUCCESS` | `success` | - | toast, resetForm() |
| `submitting` | `ERROR` | `error` | - | setError(message) |
| `success` | `RESET` | `idle` | After 2s | clearForm() |
| `error` | `DISMISS` | `idle` | - | clearError() |

---

## 7. Component-Action Wiring

### 7.1 Members Tab Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  ทีมงาน                                                         │
├─────────────────────────────────────────────────────────────────┤
│  [สมาชิก] [เชิญสมาชิก]                                           │
│    ↑ active    ↑ Admin only                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ ชื่อ        │ อีเมล           │ บทบาท  │ สถานะ │ ⋮      │  │
│  ├───────────────────────────────────────────────────────────┤  │
│  │ [👤] นาย ก  │ a@email.com    │ [Admin]│ Active │ [⋮]    │  │
│  │ [👤] นาง ข  │ b@email.com    │ [Staff]│ Active │ [⋮]    │  │
│  │ [👤] นาย ค  │ c@email.com    │ [Staff]│ Active │ [⋮]    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  คำขอที่รอการตอบรับ (2)                                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ [👤] นาย ง │ d@email.com │ 2 วันที่แล้ว │[ตอบรับ][ปฏิเสธ]│  │
│  │ [👤] นาง จ │ e@email.com │ [หมดอายุ]   │[ส่งอีก][ปฏิเสธ]│  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Member Row Actions

| Component | Action | Condition | Handler |
|-----------|--------|-----------|---------|
| ActionMenu (⋮) | Render | isAdmin | Show dropdown |
| "เปลี่ยนบทบาท" | Click | isAdmin && !isSelf | openRolePicker(memberId) |
| "ลบออก" | Click | isAdmin && !isSelf && !isLastAdmin | openRemoveConfirm(memberId) |
| Role Badge | Display | Always | Show current role |
| "ลบออก" | Disabled | isSelf \|\| isLastAdmin | Show tooltip explaining why |

### 7.3 Pending Application Actions

| Component | Action | Condition | Handler |
|-----------|--------|-----------|---------|
| "ตอบรับ" Button | Click | isAdmin | acceptEmployee(userId) |
| "ปฏิเสธ" Button | Click | isAdmin | openRejectConfirm(userId) |
| "ส่งอีกครั้ง" | Click | isAdmin && isExpired | resendNotification(userId) |
| Expired Badge | Display | isExpired | Visual indicator only |

### 7.4 Invite Tab Layout (Admin Only)

```
┌─────────────────────────────────────────────────────────────────┐
│  เชิญสมาชิกใหม่                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  อีเมล                                                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ example@email.com                                       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  บทบาท                                                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ ○ แอดมิน - สิทธิ์เต็มรูปแบบ                              │    │
│  │ ○ ผู้จัดการ HR - จัดการทุกอย่างยกเว้นทีม                  │    │
│  │ ● นักสรรหา - โพสต์/แก้ไขงาน, จัดการใบสมัคร               │    │
│  │ ○ ผู้สัมภาษณ์ - ดูใบสมัครที่มอบหมาย, นัดสัมภาษณ์          │    │
│  │ ○ ผู้ดู - ดูข้อมูลเท่านั้น                                │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌ สิทธิ์ของบทบาทนี้ ─────────────────────────────────────────┐  │
│  │ ✓ โพสต์งาน  ✓ แก้ไขงาน  ✓ ดูใบสมัคร                      │  │
│  │ ✓ ตอบรับ/ปฏิเสธ  ✓ นัดสัมภาษณ์  ✗ จัดการทีม              │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ข้อความส่วนตัว (ไม่บังคับ)                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              ส่งคำเชิญ                                   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.5 Role Picker Modal

```
┌─────────────────────────────────────────────────────────────────┐
│  เปลี่ยนบทบาท - นาง ข                                    [✕]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  บทบาทปัจจุบัน: นักสรรหา                                        │
│                                                                 │
│  เลือกบทบาทใหม่:                                                │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ ○ แอดมิน                                                │    │
│  │ ○ ผู้จัดการ HR                                          │    │
│  │ ● นักสรรหา (ปัจจุบัน)                                    │    │
│  │ ○ ผู้สัมภาษณ์                                           │    │
│  │ ○ ผู้ดู                                                 │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌───────────────────┐  ┌───────────────────┐                   │
│  │      ยกเลิก       │  │     บันทึก        │                   │
│  └───────────────────┘  └───────────────────┘                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Error Handling

### 8.1 Error States

| Error | Display | Recovery |
|-------|---------|----------|
| Network error | Toast: "เกิดข้อผิดพลาด กรุณาลองใหม่" | Retry button in toast |
| Not authorized | Redirect to login | Clear session, redirect |
| Not admin (action attempted) | Toast: "คุณไม่มีสิทธิ์ดำเนินการนี้" | Disable UI, refresh data |
| Member not found | Toast: "ไม่พบสมาชิก" | Refresh member list |
| Accept/Reject failed | Toast: "ไม่สามารถดำเนินการได้" | Keep modal open, retry |
| Last admin removal | Modal: "ต้องมี Admin อย่างน้อย 1 คน" | Close modal, explain |
| Self-action attempted | UI disabled + tooltip | N/A (prevented by UI) |

### 8.2 Exception Component Mapping

| Exception | Component | Display |
|-----------|-----------|---------|
| Not admin | InviteTab | Hide entire tab |
| Not admin | ActionMenu | Don't render |
| Invite self | InviteForm | Error: "ไม่สามารถเชิญตัวเอง" |
| Invite existing | InviteForm | Error: "เป็นสมาชิกอยู่แล้ว" |
| Remove self | RemoveButton | Disabled + tooltip |
| Remove last admin | RemoveButton | Disabled + tooltip |
| Change own role | RolePicker | Don't show option for self |
| Pending expired | PendingRow | Badge "หมดอายุ" + resend option |

### 8.3 Loading States

| Component | Loading State |
|-----------|---------------|
| MemberTable | Skeleton rows (3-5) |
| PendingSection | Skeleton rows (2) |
| RolePickerModal | Button shows spinner |
| AcceptButton | Spinner, disabled |
| RejectButton | Spinner, disabled |

---

## 9. Implementation Checklist

### 9.1 Route & Page

- [ ] Create route file: `app/companies/[id]/dashboard/team/page.tsx`
- [ ] Implement auth guard (redirect if not authenticated)
- [ ] Implement company membership check
- [ ] Implement admin check for Invite tab visibility
- [ ] Support `?tab=` query parameter

### 9.2 Components

- [ ] Create `TeamPage` main component
- [ ] Create `TeamTabNavigation` component
- [ ] Create `MemberTable` component
- [ ] Create `MemberRow` component with action menu
- [ ] Create `PendingApplicationsSection` component
- [ ] Create `PendingApplicationRow` component
- [ ] Create `InviteTab` component (Admin only)
- [ ] Create `InviteForm` component
- [ ] Create `RolePickerModal` component
- [ ] Create `RemoveConfirmModal` component
- [ ] Create `RejectConfirmModal` component
- [ ] Create `PermissionPreview` component
- [ ] Create `RoleBadge` component

### 9.3 Server Actions

- [ ] Implement/verify `getCompanyStaff(companyId)`
- [ ] Implement/verify `getPendingEmployees(companyId)`
- [ ] Implement/verify `companyAdminAcceptNewEmployee(targetUserId)`
- [ ] Implement/verify `companyAdminRejectNewEmployee(targetUserId)`
- [ ] Implement/verify `toggleEmployeeRole(targetUserId, newRole)`
- [ ] Implement/verify `removeEmployee(targetUserId)`
- [ ] Implement `sendTeamInvitation(email, role, companyId)` (if invite system needed)

### 9.4 State Management

- [ ] Create `useCompanyTeam` hook
- [ ] Create `useTeamActions` hook
- [ ] Wire SWR keys for caching
- [ ] Implement optimistic updates for accept/reject
- [ ] Implement cache invalidation on mutations

### 9.5 Validation

- [ ] Admin check before any mutation
- [ ] Self-action prevention
- [ ] Last admin protection
- [ ] Email validation for invites
- [ ] Duplicate member check

### 9.6 Testing

- [ ] Test: Admin can view both tabs
- [ ] Test: Non-admin sees only Members tab
- [ ] Test: Admin can change member role
- [ ] Test: Admin cannot change own role
- [ ] Test: Admin can remove member
- [ ] Test: Admin cannot remove self
- [ ] Test: Last admin cannot be removed/demoted
- [ ] Test: Admin can accept pending application
- [ ] Test: Admin can reject pending application
- [ ] Test: Expired pending shows badge and resend option
- [ ] Test: Tab persistence via URL
- [ ] Test: Loading states render correctly
- [ ] Test: Error states show appropriate messages

---

## 10. Decisions Log

| Decision | Chosen | Rationale | Date |
|----------|--------|-----------|------|
| Tab persistence | URL query param `?tab=` | Consistent with other tabbed pages (AUTH-R06) | 2025-12-09 |
| Default tab | `members` | Most common use case is viewing team | 2025-12-09 |
| Invite mechanism | Via pending application system | No separate invite collection exists; uses `user_transfer` | 2025-12-09 |
| Pending vs Invited | Single "pending" concept | System uses application-based joining, not invitation codes | 2025-12-09 |
| Role options | 5 roles (Admin, HR Manager, Recruiter, Interviewer, Viewer) | Matches UI spec role permissions matrix | 2025-12-09 |
| Pending expiry | 7 days, visual indicator only | Users can still be accepted after expiry, just shows warning | 2025-12-09 |
| Self-action prevention | UI-level (disabled buttons) | Better UX than server errors | 2025-12-09 |
| Last admin protection | Count admins before action | Prevent accidental lockout | 2025-12-09 |
| Invite tab access | Admin only | Matches UI spec "Admin+ only" | 2025-12-09 |

---

## 11. Open Questions

| Question | Status | Notes |
|----------|--------|-------|
| Team invitation system | ⏳ Deferred | Current system uses application-based joining; no email invite codes |
| Resend notification implementation | ⏳ Needs clarification | What notification is sent for pending applications? |
| Multiple admins scenario | ⏳ Needs clarification | Can there be multiple admins? (UI suggests yes) |

### Resolved Questions

| Question | Resolution | Date |
|----------|------------|------|
| Invite mechanism | Uses existing `user_transfer` pending application system, not separate invitations | 2025-12-09 |
| Default tab | `members` - consistent with read-before-write pattern | 2025-12-09 |
| Pending expiry behavior | Visual indicator only, actions still allowed | 2025-12-09 |

---

## Appendix A: TypeScript Types

```typescript
// Tab configuration
type TabId = 'members' | 'invite';

interface TabConfig {
  id: TabId;
  labelTh: string;
  labelEn: string;
  visibleWhen: (isAdmin: boolean) => boolean;
}

const TAB_CONFIG: TabConfig[] = [
  { id: 'members', labelTh: 'สมาชิก', labelEn: 'Members', visibleWhen: () => true },
  { id: 'invite', labelTh: 'เชิญสมาชิก', labelEn: 'Invite', visibleWhen: (isAdmin) => isAdmin },
];

// Role types
type CompanyRole = 'admin' | 'hr_manager' | 'recruiter' | 'interviewer' | 'viewer';

interface RoleConfig {
  id: CompanyRole;
  labelTh: string;
  labelEn: string;
  permissions: Permission[];
}

type Permission = 
  | 'post_jobs'
  | 'edit_jobs'
  | 'view_applications'
  | 'accept_reject'
  | 'schedule_interviews'
  | 'manage_team'
  | 'company_settings';

// Team member
interface TeamMember {
  uid: string;
  displayName: string;
  email: string;
  profilePhoto?: string;
  roles: string[];
  companyId: string;
  lastActiveAt?: number;
  createdAt: number;
}

// Pending application
interface PendingEmployee {
  uid: string;
  displayName: string;
  email: string;
  profilePhoto?: string;
  targetCompany: string;
  requestTimestamp: number;
  transferApproved: boolean;
  isExpired: boolean;
}

// Action handlers
interface TeamActions {
  acceptEmployee: (userId: string) => Promise<void>;
  rejectEmployee: (userId: string) => Promise<void>;
  changeRole: (userId: string, newRole: CompanyRole) => Promise<void>;
  removeEmployee: (userId: string) => Promise<void>;
}

// Invite form
interface InviteFormData {
  email: string;
  role: CompanyRole;
  personalMessage?: string;
}
```

---

## Appendix B: Component File Structure

```
src/
├── app/
│   └── companies/
│       └── [id]/
│           └── dashboard/
│               └── team/
│                   └── page.tsx              # Main page component
├── components/
│   └── company/
│       └── team/
│           ├── TeamPage.tsx                  # Page container
│           ├── TeamTabNavigation.tsx         # Tab switcher
│           ├── MemberTable.tsx               # Staff table
│           ├── MemberRow.tsx                 # Single member row
│           ├── MemberActionMenu.tsx          # ⋮ dropdown
│           ├── PendingApplicationsSection.tsx
│           ├── PendingApplicationRow.tsx
│           ├── InviteTab.tsx                 # Admin-only invite form
│           ├── InviteForm.tsx
│           ├── PermissionPreview.tsx         # Role permissions display
│           ├── RolePickerModal.tsx
│           ├── RemoveConfirmModal.tsx
│           ├── RejectConfirmModal.tsx
│           └── RoleBadge.tsx                 # Color-coded role badge
├── domains/
│   └── companies/
│       ├── hooks/
│       │   ├── use-company-team.ts           # Team data fetching
│       │   └── use-team-actions.ts           # Team mutations
│       └── services/
│           └── server/
│               └── actions/
│                   └── company-team.ts       # Server actions
└── types/
    └── company-team.ts                       # Type definitions
```

---

## Appendix C: Role Permissions Matrix

| Permission | Admin | HR Manager | Recruiter | Interviewer | Viewer |
|------------|-------|------------|-----------|-------------|--------|
| โพสต์งาน (Post jobs) | ✓ | ✓ | ✓ | ✗ | ✗ |
| แก้ไขงาน (Edit jobs) | ✓ | ✓ | ✓ | ✗ | ✗ |
| ดูใบสมัคร (View applications) | ✓ | ✓ | ✓ | Limited | ✓ |
| ตอบรับ/ปฏิเสธ (Accept/Reject) | ✓ | ✓ | ✓ | ✗ | ✗ |
| นัดสัมภาษณ์ (Schedule interviews) | ✓ | ✓ | ✓ | ✓ | ✗ |
| จัดการทีม (Manage team) | ✓ | ✗ | ✗ | ✗ | ✗ |
| ตั้งค่าบริษัท (Company settings) | ✓ | ✓ | ✗ | ✗ | ✗ |

### Role Descriptions (Thai)

| Role | Thai | Description |
|------|------|-------------|
| Admin | แอดมิน | สิทธิ์เต็มรูปแบบ - จัดการได้ทุกอย่าง |
| HR Manager | ผู้จัดการ HR | จัดการทุกอย่างยกเว้นสมาชิกทีม |
| Recruiter | นักสรรหา | โพสต์งาน, จัดการใบสมัคร, นัดสัมภาษณ์ |
| Interviewer | ผู้สัมภาษณ์ | ดูใบสมัครที่มอบหมาย, นัดหมายสัมภาษณ์ |
| Viewer | ผู้ดู | ดูข้อมูลเท่านั้น |

---

## Appendix D: Source References

| Section | Source |
|---------|--------|
| UI Layout | `05-company-routes.md` Section 6.7 (lines 453-541) |
| Role Permissions Matrix | `05-company-routes.md` lines 517-528 |
| View Employee List (COMP-012) | `features_companies.md` line 20 |
| View Pending Requests (COMP-013) | `features_companies.md` line 21 |
| Accept Employee (COMP-014) | `features_companies.md` lines 259-295 |
| Reject Employee (COMP-015) | `features_companies.md` lines 298-327 |
| Toggle Role (COMP-016) | `features_companies.md` line 24 |
| Remove Employee (COMP-017) | `features_companies.md` line 25 |
| User Info Schema | `data-entities_user-info.md` |
| User Transfer Schema | `data-entities_user-transfer.md` |
| Company Atoms | `state-inventory_atoms.md` lines 219-243 |
| Auth Settings Tab Pattern | `AUTH-R06_settings_RIS.md` |
| Employee Transfer Lifecycle | `features_companies.md` lines 58-80 |

---

*End of RIS: /companies/[id]/dashboard/team (COMP-R02) v1.0*
