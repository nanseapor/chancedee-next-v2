# ADM-R03: Candidates Management

**Document ID:** ADM-R03  
**Version:** 2.0  
**Status:** Complete  
**Created:** 2025-12-11  
**Route:** `/platform/candidates`  
**Parent:** ADM-R00 (Cross-Cutting Specifications)

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | 2025-12-11 | Added UI State Machine section, English only |
| 1.0 | 2025-12-10 | Initial creation |

---

## Cross-References

| Topic | Reference |
|-------|-----------|
| Shell Layout | ADM-R00 Section 2 |
| Permissions | ADM-R00 Section 3 |
| List Page State Machine | ADM-R00 Section 7.2 |
| Detail Page State Machine | ADM-R00 Section 7.3 |
| Action Modal State Machine | ADM-R00 Section 7.4 |

---

## 1. Route Metadata

| Property | Value |
|----------|-------|
| Route ID | ADM-R03 |
| Route Path | `/platform/candidates` |
| Detail Path | `/platform/candidates/[candidateId]` |
| Shell | Platform Admin Shell |
| Purpose | Candidate management and moderation |
| Min Admin Level | staff |
| UI Spec | `07-platform-admin-routes.md` Section 8.4 |

---

## 2. Feature Mapping

| Feature ID | Feature Name | Coverage |
|------------|--------------|----------|
| ADMIN-006 | View Candidate Profiles | Full |
| ADMIN-007 | View Candidate Details | Full |
| ADMIN-018 | Suspend User Account | Full |
| ADMIN-019 | Reactivate User Account | Full |
| ADMIN-020 | Delete User Account | Full |

---

## 3. Page Layout

### 3.1 List Page

```
+------------------------------------------------------------------+
| Candidates                                                        |
+------------------------------------------------------------------+
| Search: [                    ] | Filter: [Status v] [Verified v] |
+------------------------------------------------------------------+
| [ ] | Candidate       | Status   | Verified | Applications | Reg |
+------------------------------------------------------------------+
| [ ] | John Doe        | Active   | Yes      | 15           | Jan |
|     | john@email.com  |          | [Check]  |              | 2024|
+------------------------------------------------------------------+
| [ ] | Jane Smith      | Suspended| No       | 3            | Mar |
|     | jane@email.com  | [Badge]  |          |              | 2024|
+------------------------------------------------------------------+
| Bulk Actions: [Suspend] [Reactivate]                             |
+------------------------------------------------------------------+
| [< Prev] Page 1 of 25 [Next >]                                   |
+------------------------------------------------------------------+
```

### 3.2 Detail Page

```
+------------------------------------------------------------------+
| [< Back] John Doe                           [Actions v]           |
+------------------------------------------------------------------+
| [Avatar]  John Doe                                               |
|           john@example.com | Bangkok | Software Developer         |
|           Status: Active | Verified: Yes                         |
+------------------------------------------------------------------+
| Tabs: [Profile] [Applications] [Activity] [Flags]                |
+------------------------------------------------------------------+
| Tab Content Area                                                  |
|                                                                  |
+------------------------------------------------------------------+
```

---

## 4. Data Contract

### 4.1 Read Operations

| Data | Source | Method |
|------|--------|--------|
| Candidate List | `getAdminCandidates()` | SWR |
| Candidate Detail | `getAdminCandidateDetail(id)` | SWR |
| Applications | `getCandidateApplications(id)` | SWR |
| Activity Logs | `getCandidateActivity(id)` | SWR |

### 4.2 Candidate List Item Shape

```typescript
interface AdminCandidateListItem {
  uid: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'active' | 'suspended' | 'deleted';
  isVerified: boolean;
  applicationCount: number;
  registeredAt: number;
  lastActive: number;
}
```

### 4.3 Write Operations

| Operation | Server Action | Side Effects |
|-----------|---------------|--------------|
| Suspend | `adminSuspendUser(id, reason)` | Update isActive, log audit |
| Reactivate | `adminReactivateUser(id)` | Update isActive, log audit |
| Delete | `adminDeleteUser(id)` | Add 'deleted' role, log audit |

---

## 5. State Contract

### 5.1 SWR Keys

```typescript
['admin', 'candidates', 'list', { page, search, filters }]
['admin', 'candidates', 'detail', candidateId]
['admin', 'candidates', 'applications', candidateId]
['admin', 'candidates', 'activity', candidateId]
['admin', 'candidates', 'flags', candidateId]
```

### 5.2 Local State

```typescript
interface CandidateListState {
  search: string;
  filters: {
    status?: 'active' | 'suspended' | 'deleted';
    verified?: boolean;
  };
  page: number;
  selectedIds: string[];
}

interface CandidateDetailState {
  activeTab: 'profile' | 'applications' | 'activity' | 'flags';
  actionModal: 'suspend' | 'reactivate' | null;
  confirmDialog: 'delete' | null;
}
```

---

## 6. UI State Machine

### 6.1 Candidates List Page State Machine

Extends ADM-R00 Section 7.2 (Shared List Page State Machine).

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `LOADING` | `DATA_LOADED` | `READY` | items.length > 0 | setCandidates(items) |
| `LOADING` | `DATA_LOADED` | `EMPTY` | items.length === 0 | - |
| `LOADING` | `FETCH_ERROR` | `ERROR` | always | setError(err) |
| `READY` | `SEARCH` | `LOADING` | always | setSearch(query), resetPage() |
| `READY` | `FILTER_CHANGE` | `LOADING` | always | setFilters(f), resetPage() |
| `READY` | `ROW_CLICK` | - | always | router.push(`/platform/candidates/${id}`) |
| `READY` | `SELECT_ITEM` | `READY` | always | toggleSelection(id) |
| `READY` | `SELECT_ALL` | `READY` | always | selectAllVisible() |
| `READY` | `BULK_SUSPEND` | `BULK_ACTION` | selectedIds.length > 0 | openModal('suspend') |
| `READY` | `BULK_REACTIVATE` | `BULK_ACTION` | selectedIds.length > 0 | openModal('reactivate') |
| `BULK_ACTION` | `CONFIRM` | `PROCESSING` | always | executeBulkAction() |
| `BULK_ACTION` | `CANCEL` | `READY` | always | closeModal() |
| `PROCESSING` | `SUCCESS` | `READY` | always | toast.success(), refetch(), clearSelection() |
| `PROCESSING` | `ERROR` | `READY` | always | toast.error(err) |
| `ERROR` | `RETRY` | `LOADING` | always | refetch() |

### 6.2 Candidate Detail Page State Machine

Extends ADM-R00 Section 7.3 (Shared Detail Page State Machine).

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `LOADING` | `DATA_LOADED` | `READY` | candidate !== null | setCandidate(data) |
| `LOADING` | `NOT_FOUND` | `NOT_FOUND` | candidate === null | - |
| `LOADING` | `FETCH_ERROR` | `ERROR` | always | setError(err) |
| `NOT_FOUND` | `GO_BACK` | - | always | router.push('/platform/candidates') |
| `READY` | `TAB_CHANGE` | `READY` | always | setActiveTab(tab) |
| `READY` | `OPEN_SUSPEND` | `ACTION_MODAL` | status === 'active' | setModal('suspend') |
| `READY` | `OPEN_REACTIVATE` | `ACTION_MODAL` | status === 'suspended' | setModal('reactivate') |
| `READY` | `OPEN_DELETE` | `CONFIRMING` | always | setConfirm('delete') |
| `ACTION_MODAL` | `SUBMIT` | `SAVING` | form.isValid | executeAction() |
| `ACTION_MODAL` | `CANCEL` | `READY` | always | closeModal() |
| `SAVING` | `SUCCESS` | `READY` | always | toast.success(), refetch() |
| `SAVING` | `ERROR` | `ACTION_MODAL` | always | setFormError(err) |
| `CONFIRMING` | `CONFIRM` | `EXECUTING` | always | deleteUser(id) |
| `CONFIRMING` | `CANCEL` | `READY` | always | closeDialog() |
| `EXECUTING` | `SUCCESS` | - | always | toast.success(), router.push('/platform/candidates') |
| `EXECUTING` | `ERROR` | `READY` | always | toast.error(err) |
| `ERROR` | `RETRY` | `LOADING` | always | refetch() |

### 6.3 Suspend Modal State Machine

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `CLOSED` | `OPEN` | `OPEN` | always | setTarget(candidate), initForm() |
| `OPEN` | `REASON_CHANGE` | `OPEN` | always | setReason(value) |
| `OPEN` | `SUBMIT` | `PROCESSING` | reason.length > 0 | suspendUser(id, reason) |
| `OPEN` | `SUBMIT` | `OPEN` | reason.length === 0 | showError('Reason required') |
| `OPEN` | `CANCEL` | `CLOSED` | always | resetForm() |
| `PROCESSING` | `SUCCESS` | `CLOSED` | always | toast.success(), onSuccess() |
| `PROCESSING` | `ERROR` | `OPEN` | always | toast.error(err) |

### 6.4 Delete Confirmation State Machine

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `HIDDEN` | `SHOW` | `VISIBLE` | always | setTarget(candidate) |
| `VISIBLE` | `CONFIRM` | `PROCESSING` | always | deleteUser(id) |
| `VISIBLE` | `CANCEL` | `HIDDEN` | always | - |
| `PROCESSING` | `SUCCESS` | `HIDDEN` | always | toast.success(), redirectToList() |
| `PROCESSING` | `ERROR` | `VISIBLE` | always | toast.error(err) |

---

## 7. Tab Content

### 7.1 Profile Tab

- Personal information (name, email, phone)
- Contact details
- Work preferences
- Resume/CV link
- Profile completion percentage

### 7.2 Applications Tab

- Application history list
- Application status (applied, accepted, rejected)
- Company and job details
- Application dates

### 7.3 Activity Tab

- Recent activity logs
- Login history
- Profile updates
- Application submissions

### 7.4 Flags Tab

- Content flags (if any)
- Report history
- Admin notes

---

## 8. Actions Menu

| Action | Condition | Min Level |
|--------|-----------|-----------|
| View Profile | Always | staff |
| Suspend Account | status === 'active' | staff |
| Reactivate Account | status === 'suspended' | staff |
| Delete Account | Always | super |

---

## 9. Implementation Checklist

### Phase 1: List Page
- [ ] Create candidates list page
- [ ] Implement search functionality
- [ ] Add status and verification filters
- [ ] Create candidate row component
- [ ] Implement selection and bulk actions

### Phase 2: Detail Page
- [ ] Create candidate detail page
- [ ] Implement header with status badges
- [ ] Add tab navigation
- [ ] Create Profile tab content
- [ ] Create Applications tab content

### Phase 3: Actions
- [ ] Implement suspend modal
- [ ] Implement reactivate action
- [ ] Implement delete confirmation (super only)
- [ ] Add audit logging

### Phase 4: Activity
- [ ] Create Activity tab
- [ ] Create Flags tab
- [ ] Wire activity logging

---

## 10. Files to Create

| File | Purpose |
|------|---------|
| `src/app/(platform)/platform/candidates/page.tsx` | List page |
| `src/app/(platform)/platform/candidates/[id]/page.tsx` | Detail page |
| `src/domains/admin/components/candidates/CandidateList.tsx` | List component |
| `src/domains/admin/components/candidates/CandidateRow.tsx` | Row component |
| `src/domains/admin/components/candidates/CandidateDetail.tsx` | Detail component |
| `src/domains/admin/components/candidates/ProfileTab.tsx` | Profile tab |
| `src/domains/admin/components/candidates/ApplicationsTab.tsx` | Applications tab |
| `src/domains/admin/components/candidates/ActivityTab.tsx` | Activity tab |
| `src/domains/admin/components/candidates/FlagsTab.tsx` | Flags tab |
| `src/domains/admin/components/candidates/SuspendModal.tsx` | Suspend modal |
| `src/domains/admin/hooks/useAdminCandidates.ts` | List data hook |
| `src/domains/admin/hooks/useAdminCandidateDetail.ts` | Detail data hook |

---

*End of ADM-R03 Candidates Management RIS v2.0*
