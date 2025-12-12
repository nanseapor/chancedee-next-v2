# ADM-R06: Users & Role Management

**Document ID:** ADM-R06  
**Version:** 2.0  
**Status:** Complete  
**Created:** 2025-12-11  
**Route:** `/platform/users`  
**Parent:** ADM-R00 (Cross-Cutting Specifications)

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | 2025-12-11 | Added Delete Requests tab, UI State Machine section |
| 1.0 | 2025-12-10 | Initial creation |

---

## Cross-References

| Topic | Reference |
|-------|-----------|
| Shell Layout | ADM-R00 Section 2 |
| Permissions | ADM-R00 Section 3 |
| List Page State Machine | ADM-R00 Section 7.2 |
| Detail Page State Machine | ADM-R00 Section 7.3 |
| Delete Requests Schema | ADM-R00 Section 9.5 |
| Delete Request Actions | ADM-R00 Section 10.5 |

---

## 1. Route Metadata

| Property | Value |
|----------|-------|
| Route ID | ADM-R06 |
| Route Path | `/platform/users` |
| Detail Path | `/platform/users/[userId]` |
| Shell | Platform Admin Shell |
| Purpose | User management, role assignment, delete requests |
| Min Admin Level | staff (delete: super) |
| UI Spec | `07-platform-admin-routes.md` Section 8.3 |

---

## 2. Feature Mapping

| Feature ID | Feature Name | Coverage | Min Level |
|------------|--------------|----------|-----------|
| ADMIN-012 | Manage Admin Invitations | Full | admin |
| ADMIN-013 | Generate Admin Invitation Code | Full | admin |
| ADMIN-014 | View Staff/Employee List | Full | staff |
| ADMIN-015 | Add User Role | Full | admin |
| ADMIN-016 | Remove User Role | Full | admin |
| ADMIN-017 | Set User Roles | Full | super |
| ADMIN-018 | Suspend User Account | Full | staff |
| ADMIN-019 | Reactivate User Account | Full | staff |
| ADMIN-020 | Delete User Account | Full | super |
| ADMIN-021 | Toggle Admin Role | Full | super |
| ADMIN-011 | View Delete Requests | Full | staff |

---

## 3. Page Layout

### 3.1 List Page

```
+------------------------------------------------------------------+
| Users                                            [+ Invite Staff] |
+------------------------------------------------------------------+
| Tabs: [All Users] [Admins] [Delete Requests (2)]                 |
+------------------------------------------------------------------+
| Search: [                    ] | Filter: [Role v] [Status v]     |
+------------------------------------------------------------------+
| [ ] | User            | Email           | Roles    | Status     |
+------------------------------------------------------------------+
| [ ] | John Admin      | john@cd.com     | [Super]  | Active     |
|     | [Avatar]        |                 | [Admin]  |            |
+------------------------------------------------------------------+
| [ ] | Jane Staff      | jane@cd.com     | [Staff]  | Active     |
|     | [Avatar]        |                 |          |            |
+------------------------------------------------------------------+
| [< Prev] Page 1 of 5 [Next >]                                    |
+------------------------------------------------------------------+
```

### 3.2 Delete Requests Tab

```
+------------------------------------------------------------------+
| Delete Requests                                                   |
+------------------------------------------------------------------+
| [!] 1 request is past SLA (14 days)                              |
+------------------------------------------------------------------+
| Subtabs: [Pending (2)] [Approved] [Rejected]                     |
+------------------------------------------------------------------+
| Code      | Name      | Email         | Submitted | SLA    |     |
+------------------------------------------------------------------+
| DEL-001   | John Doe  | john@...      | 2024-01-01| 3 days | [!] |
| DEL-002   | Jane Doe  | jane@...      | 2024-01-10| 10 days|     |
+------------------------------------------------------------------+
```

### 3.3 User Detail Page

```
+------------------------------------------------------------------+
| [< Back] John Admin                         [Actions v]           |
+------------------------------------------------------------------+
| [Avatar]  John Admin                                             |
|           john@admin.com | Admin since 2023                       |
|           Status: Active                                          |
+------------------------------------------------------------------+
| Tabs: [Account] [Roles] [Companies] [Activity]                   |
+------------------------------------------------------------------+
| Tab Content Area                                                  |
+------------------------------------------------------------------+
```

---

## 4. Data Contract

### 4.1 Read Operations

| Data | Source | Method |
|------|--------|--------|
| User List | `getAdminUsers()` | SWR |
| Admin List | `getAdminAdmins()` | SWR |
| Delete Requests | `getDeleteRequests()` | SWR |
| User Detail | `getAdminUserDetail(id)` | SWR |

### 4.2 User List Item Shape

```typescript
interface AdminUserListItem {
  uid: string;
  name: string;
  email: string;
  avatar?: string;
  roles: string[];
  adminLevel?: 'staff' | 'admin' | 'super';
  isActive: boolean;
  createdAt: number;
  lastLogin?: number;
}
```

### 4.3 Delete Request Item Shape

```typescript
interface DeleteRequestItem {
  uid: string;
  requestCode: string;
  userName: string;
  userEmail: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: number;
  slaDaysRemaining: number;
  documents: string[];
}
```

### 4.4 Write Operations

| Operation | Server Action | Min Level | Side Effects |
|-----------|---------------|-----------|--------------|
| Invite Staff | `sendAdminInvitation(email, level)` | admin | Send email |
| Add Role | `adminAddUserRole(id, role)` | admin | Update roles |
| Remove Role | `adminRemoveUserRole(id, role)` | admin | Update roles |
| Set Roles | `adminSetUserRoles(id, roles)` | super | Replace roles |
| Suspend | `adminSuspendUser(id, reason)` | staff | Set isActive=false |
| Reactivate | `adminReactivateUser(id)` | staff | Set isActive=true |
| Delete | `adminDeleteUser(id)` | super | Add 'deleted' role |
| Approve Delete | `approveDeleteRequest(id)` | staff | Schedule deletion |
| Reject Delete | `rejectDeleteRequest(id, reason)` | staff | Set cooldown |

---

## 5. State Contract

### 5.1 SWR Keys

```typescript
['admin', 'users', 'list', { page, search, filters }]
['admin', 'users', 'admins', { page }]
['admin', 'users', 'delete-requests', { status }]
['admin', 'users', 'detail', userId]
['admin', 'users', 'activity', userId]
```

### 5.2 Local State

```typescript
interface UserListState {
  activeTab: 'all' | 'admins' | 'delete-requests';
  deleteSubtab: 'pending' | 'approved' | 'rejected';
  search: string;
  filters: {
    role?: string;
    status?: 'active' | 'suspended';
  };
  page: number;
  selectedIds: string[];
  modalOpen: 'invite' | 'role' | 'suspend' | null;
}

interface UserDetailState {
  activeTab: 'account' | 'roles' | 'companies' | 'activity';
  actionModal: 'edit-roles' | 'suspend' | 'delete' | null;
}
```

---

## 6. UI State Machine

### 6.1 Users List Page State Machine

Extends ADM-R00 Section 7.2 (Shared List Page State Machine).

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `LOADING` | `DATA_LOADED` | `READY` | items.length > 0 | setUsers(items) |
| `LOADING` | `DATA_LOADED` | `EMPTY` | items.length === 0 | - |
| `LOADING` | `FETCH_ERROR` | `ERROR` | always | setError(err) |
| `READY` | `TAB_CHANGE` | `LOADING` | always | setActiveTab(tab), resetPage() |
| `READY` | `SEARCH` | `LOADING` | always | setSearch(query), resetPage() |
| `READY` | `FILTER_CHANGE` | `LOADING` | always | setFilters(f), resetPage() |
| `READY` | `ROW_CLICK` | - | always | router.push(`/platform/users/${id}`) |
| `READY` | `INVITE_CLICK` | `INVITE_OPEN` | adminLevel >= 'admin' | openInviteModal() |
| `INVITE_OPEN` | `SUBMIT` | `PROCESSING` | form.isValid | sendInvitation(email, level) |
| `INVITE_OPEN` | `CANCEL` | `READY` | always | closeModal() |
| `PROCESSING` | `SUCCESS` | `READY` | always | toast.success(), closeModal() |
| `PROCESSING` | `ERROR` | `INVITE_OPEN` | always | toast.error(err) |
| `ERROR` | `RETRY` | `LOADING` | always | refetch() |

### 6.2 Delete Requests Tab State Machine

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `LOADING` | `DATA_LOADED` | `READY` | requests.length > 0 | setRequests(data), checkSLA() |
| `LOADING` | `DATA_LOADED` | `EMPTY` | requests.length === 0 | - |
| `LOADING` | `FETCH_ERROR` | `ERROR` | always | setError(err) |
| `READY` | `SUBTAB_CHANGE` | `LOADING` | always | setSubtab(tab) |
| `READY` | `ROW_CLICK` | `DETAIL_OPEN` | always | openRequestDetail(id) |
| `READY` | `APPROVE_CLICK` | `APPROVE_CONFIRM` | always | setSelectedRequest(id) |
| `READY` | `REJECT_CLICK` | `REJECT_OPEN` | always | setSelectedRequest(id), openRejectModal() |
| `DETAIL_OPEN` | `CLOSE` | `READY` | always | closeModal() |
| `DETAIL_OPEN` | `APPROVE` | `APPROVE_CONFIRM` | always | switchToConfirm() |
| `DETAIL_OPEN` | `REJECT` | `REJECT_OPEN` | always | switchToReject() |
| `APPROVE_CONFIRM` | `CONFIRM` | `PROCESSING` | always | approveDeleteRequest(id) |
| `APPROVE_CONFIRM` | `CANCEL` | `READY` | always | closeModal() |
| `REJECT_OPEN` | `SUBMIT` | `PROCESSING` | reason provided | rejectDeleteRequest(id, reason) |
| `REJECT_OPEN` | `CANCEL` | `READY` | always | closeModal() |
| `PROCESSING` | `SUCCESS` | `READY` | always | toast.success(), refetch() |
| `PROCESSING` | `ERROR` | Previous modal | always | toast.error(err) |
| `ERROR` | `RETRY` | `LOADING` | always | refetch() |

### 6.3 User Detail Page State Machine

Extends ADM-R00 Section 7.3 (Shared Detail Page State Machine).

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `LOADING` | `DATA_LOADED` | `READY` | user !== null | setUser(data) |
| `LOADING` | `NOT_FOUND` | `NOT_FOUND` | user === null | - |
| `LOADING` | `FETCH_ERROR` | `ERROR` | always | setError(err) |
| `NOT_FOUND` | `GO_BACK` | - | always | router.push('/platform/users') |
| `READY` | `TAB_CHANGE` | `READY` | always | setActiveTab(tab) |
| `READY` | `OPEN_EDIT_ROLES` | `ACTION_MODAL` | adminLevel >= 'admin' | setModal('edit-roles') |
| `READY` | `OPEN_SUSPEND` | `ACTION_MODAL` | user.isActive && !isSelf | setModal('suspend') |
| `READY` | `OPEN_REACTIVATE` | `ACTION_MODAL` | !user.isActive | setModal('reactivate') |
| `READY` | `OPEN_DELETE` | `CONFIRMING` | adminLevel === 'super' && !isSelf | setConfirm('delete') |
| `ACTION_MODAL` | `SUBMIT` | `SAVING` | form.isValid | executeAction() |
| `ACTION_MODAL` | `CANCEL` | `READY` | always | closeModal() |
| `SAVING` | `SUCCESS` | `READY` | always | toast.success(), refetch() |
| `SAVING` | `ERROR` | `ACTION_MODAL` | always | setFormError(err) |
| `CONFIRMING` | `CONFIRM` | `EXECUTING` | always | deleteUser(id) |
| `CONFIRMING` | `CANCEL` | `READY` | always | closeDialog() |
| `EXECUTING` | `SUCCESS` | - | always | toast.success(), router.push('/platform/users') |
| `EXECUTING` | `ERROR` | `READY` | always | toast.error(err) |
| `ERROR` | `RETRY` | `LOADING` | always | refetch() |

### 6.4 Invite Modal State Machine

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `CLOSED` | `OPEN` | `OPEN` | always | initForm() |
| `OPEN` | `EMAIL_CHANGE` | `OPEN` | always | setEmail(value) |
| `OPEN` | `LEVEL_CHANGE` | `OPEN` | always | setLevel(value) |
| `OPEN` | `SUBMIT` | `SUBMITTING` | email valid | sendInvitation(email, level) |
| `OPEN` | `SUBMIT` | `OPEN` | !email valid | showValidationError() |
| `OPEN` | `CANCEL` | `CLOSED` | always | resetForm() |
| `SUBMITTING` | `SUCCESS` | `CLOSED` | always | toast.success('Invitation sent'), onSuccess() |
| `SUBMITTING` | `ERROR` | `OPEN` | always | toast.error(err) |

### 6.5 Edit Roles Modal State Machine

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `CLOSED` | `OPEN` | `OPEN` | always | setTarget(user), initRoles(user.roles) |
| `OPEN` | `TOGGLE_ROLE` | `OPEN` | !isSelf | toggleRole(role) |
| `OPEN` | `TOGGLE_ROLE` | `OPEN` | isSelf | showError('Cannot modify own roles') |
| `OPEN` | `SET_ADMIN_LEVEL` | `OPEN` | adminLevel === 'super' | setAdminLevel(level) |
| `OPEN` | `SUBMIT` | `SUBMITTING` | hasChanges | saveRoles(userId, roles) |
| `OPEN` | `SUBMIT` | `OPEN` | !hasChanges | showInfo('No changes') |
| `OPEN` | `CANCEL` | `CLOSED` | always | resetForm() |
| `SUBMITTING` | `SUCCESS` | `CLOSED` | always | toast.success(), onSuccess() |
| `SUBMITTING` | `ERROR` | `OPEN` | always | toast.error(err) |

---

## 7. SLA Tracking

### 7.1 SLA Calculation

- SLA: 14 days from submission
- Grace period after approval: 90 days before deletion

### 7.2 SLA Status Colors

| Days Remaining | Color | Icon |
|----------------|-------|------|
| 7+ days | Green | None |
| 4-6 days | Yellow | Warning |
| 1-3 days | Red | Alert |
| Overdue | Red + Pulse | Urgent |

---

## 8. Guards and Restrictions

| Action | Guard | Error Message |
|--------|-------|---------------|
| Edit own roles | Blocked | Cannot modify your own roles |
| Remove last super | Blocked | Must have at least one super-admin |
| Delete self | Blocked | Cannot delete your own account |
| Suspend self | Blocked | Cannot suspend your own account |

---

## 9. Implementation Checklist

### Phase 1: Users List
- [ ] Create users list page
- [ ] Implement All Users tab
- [ ] Implement Admins tab
- [ ] Add search and filters
- [ ] Create user row component

### Phase 2: Delete Requests
- [ ] Create Delete Requests tab
- [ ] Implement SLA tracking
- [ ] Create request detail modal
- [ ] Implement approve flow
- [ ] Implement reject flow

### Phase 3: User Detail
- [ ] Create user detail page
- [ ] Implement Account tab
- [ ] Implement Roles tab
- [ ] Implement Activity tab
- [ ] Add action modals

### Phase 4: Invitations
- [ ] Create invite modal
- [ ] Implement invitation generation
- [ ] Send invitation emails

---

## 10. Files to Create

| File | Purpose |
|------|---------|
| `src/app/(platform)/platform/users/page.tsx` | List page |
| `src/app/(platform)/platform/users/[id]/page.tsx` | Detail page |
| `src/domains/admin/components/users/UserList.tsx` | Users list |
| `src/domains/admin/components/users/AdminList.tsx` | Admins list |
| `src/domains/admin/components/users/DeleteRequestsList.tsx` | Delete requests |
| `src/domains/admin/components/users/UserRow.tsx` | User row |
| `src/domains/admin/components/users/DeleteRequestRow.tsx` | Request row |
| `src/domains/admin/components/users/SLABadge.tsx` | SLA indicator |
| `src/domains/admin/components/users/UserDetail.tsx` | Detail component |
| `src/domains/admin/components/users/InviteModal.tsx` | Invite modal |
| `src/domains/admin/components/users/EditRolesModal.tsx` | Roles modal |
| `src/domains/admin/components/users/DeleteRequestModal.tsx` | Request detail |
| `src/domains/admin/components/users/ApproveConfirmDialog.tsx` | Approve confirm |
| `src/domains/admin/components/users/RejectModal.tsx` | Reject modal |
| `src/domains/admin/hooks/useAdminUsers.ts` | Users hook |
| `src/domains/admin/hooks/useDeleteRequests.ts` | Requests hook |

---

*End of ADM-R06 Users & Role Management RIS v2.0*
