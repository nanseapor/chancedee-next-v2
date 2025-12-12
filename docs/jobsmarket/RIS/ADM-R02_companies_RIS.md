# ADM-R02: Companies Management

**Document ID:** ADM-R02  
**Version:** 2.0  
**Status:** Complete  
**Created:** 2025-12-11  
**Route:** `/platform/companies`  
**Parent:** ADM-R00 (Cross-Cutting Specifications)

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | 2025-12-11 | Added UI State Machine section, company screening integration |
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
| Company Screening Schema | ADM-R00 Section 9.1 |

---

## 1. Route Metadata

| Property | Value |
|----------|-------|
| Route ID | ADM-R02 |
| Route Path | `/platform/companies` |
| Detail Path | `/platform/companies/[companyId]` |
| Shell | Platform Admin Shell |
| Purpose | Company management and approval |
| Min Admin Level | staff |
| UI Spec | `07-platform-admin-routes.md` Section 8.2 |

---

## 2. Feature Mapping

| Feature ID | Feature Name | Coverage |
|------------|--------------|----------|
| ADMIN-002 | View Company Requests | Full |
| ADMIN-003 | Approve Company Registration | Full |
| ADMIN-004 | Reject Company Registration | Full |
| COMP-008 | Approve Company Request | Full |
| COMP-009 | Reject Company Request | Full |

---

## 3. Page Layout

### 3.1 List Page

```
+------------------------------------------------------------------+
| Companies                                        [+ Invite]       |
+------------------------------------------------------------------+
| Tabs: [All] [Pending (5)] [Flagged (3)] [Suspended]              |
+------------------------------------------------------------------+
| Search: [                    ] | Filter: [Status v] [Risk v]     |
+------------------------------------------------------------------+
| [ ] | Company         | Status    | Risk  | Jobs | Registered   |
+------------------------------------------------------------------+
| [ ] | ABC Corp        | Approved  | 25    | 12   | 2024-01-15   |
|     | [Logo] abc@...  |           | [Bar] |      |              |
+------------------------------------------------------------------+
| [ ] | XYZ Ltd         | Pending   | -     | 0    | 2024-03-20   |
|     | [Logo] xyz@...  | [Review]  |       |      |              |
+------------------------------------------------------------------+
| Bulk Actions: [Approve] [Reject] [Suspend]                       |
+------------------------------------------------------------------+
| [< Prev] Page 1 of 10 [Next >]                                   |
+------------------------------------------------------------------+
```

### 3.2 Detail Page

```
+------------------------------------------------------------------+
| [< Back] ABC Corporation                    [Actions v]           |
+------------------------------------------------------------------+
| [Logo]  ABC Corporation                                          |
|         abc@example.com | Bangkok | Technology                    |
|         Status: Approved | Risk Score: 25/100 [=====-----]       |
+------------------------------------------------------------------+
| Tabs: [Overview] [Team] [Jobs] [Screening] [Requests]            |
+------------------------------------------------------------------+
| Tab Content Area                                                  |
|                                                                  |
| (varies by tab selection)                                        |
|                                                                  |
+------------------------------------------------------------------+
```

---

## 4. Data Contract

### 4.1 Read Operations

| Data | Source | Method |
|------|--------|--------|
| Company List | `getAdminCompanies()` | SWR |
| Company Detail | `getAdminCompanyDetail(id)` | SWR |
| Company Screening | `getCompanyScreening(id)` | SWR |
| Pending Requests | `getCompanyRequests()` | SWR |

### 4.2 Company List Item Shape

```typescript
interface AdminCompanyListItem {
  uid: string;
  name: string;
  email: string;
  logo?: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  riskScore: number | null;
  jobCount: number;
  registeredAt: number;
  province?: string;
  industry?: string;
}
```

### 4.3 Write Operations

| Operation | Server Action | Side Effects |
|-----------|---------------|--------------|
| Approve | `approveCompanyRequest(id)` | Initialize screening, send email |
| Reject | `rejectCompanyRequest(id, reason)` | Send rejection email |
| Suspend | `suspendCompany(id, reason, duration)` | Update screening +50 risk |
| Reactivate | `reactivateCompany(id, note)` | Update screening -25 risk |

---

## 5. State Contract

### 5.1 SWR Keys

```typescript
['admin', 'companies', 'list', { tab, page, search, filters }]
['admin', 'companies', 'detail', companyId]
['admin', 'companies', 'screening', companyId]
['admin', 'companies', 'requests', companyId]
['admin', 'companies', 'team', companyId]
```

### 5.2 Local State

```typescript
interface CompanyListState {
  activeTab: 'all' | 'pending' | 'flagged' | 'suspended';
  search: string;
  filters: {
    status?: string;
    riskMin?: number;
    riskMax?: number;
  };
  page: number;
  selectedIds: string[];
  bulkModalOpen: boolean;
  bulkAction: 'approve' | 'reject' | 'suspend' | null;
}

interface CompanyDetailState {
  activeTab: 'overview' | 'team' | 'jobs' | 'screening' | 'requests';
  actionModal: 'suspend' | 'reactivate' | 'verify' | null;
  confirmDialog: 'delete' | null;
}
```

---

## 6. UI State Machine

### 6.1 Companies List Page State Machine

Extends ADM-R00 Section 7.2 (Shared List Page State Machine) with company-specific transitions.

**Additional States:** `APPROVING`, `REJECTING`, `SUSPENDING`

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `LOADING` | `DATA_LOADED` | `READY` | items.length > 0 | setCompanies(items) |
| `LOADING` | `DATA_LOADED` | `EMPTY` | items.length === 0 | - |
| `LOADING` | `FETCH_ERROR` | `ERROR` | always | setError(err) |
| `READY` | `TAB_CHANGE` | `LOADING` | always | setActiveTab(tab), resetPage() |
| `READY` | `SEARCH` | `LOADING` | always | setSearch(query), resetPage() |
| `READY` | `FILTER_CHANGE` | `LOADING` | always | setFilters(f), resetPage() |
| `READY` | `ROW_CLICK` | - | always | router.push(`/platform/companies/${id}`) |
| `READY` | `SELECT_ITEM` | `READY` | always | toggleSelection(id) |
| `READY` | `SELECT_ALL` | `READY` | always | selectAllVisible() |
| `READY` | `BULK_APPROVE` | `APPROVING` | selectedIds.length > 0 | openBulkModal('approve') |
| `READY` | `BULK_REJECT` | `REJECTING` | selectedIds.length > 0 | openBulkModal('reject') |
| `READY` | `BULK_SUSPEND` | `SUSPENDING` | selectedIds.length > 0 | openBulkModal('suspend') |
| `APPROVING` | `CONFIRM` | `PROCESSING` | always | bulkApprove(selectedIds) |
| `APPROVING` | `CANCEL` | `READY` | always | closeBulkModal() |
| `REJECTING` | `SUBMIT` | `PROCESSING` | reason provided | bulkReject(selectedIds, reason) |
| `REJECTING` | `CANCEL` | `READY` | always | closeBulkModal() |
| `SUSPENDING` | `SUBMIT` | `PROCESSING` | reason + duration | bulkSuspend(selectedIds, reason, duration) |
| `SUSPENDING` | `CANCEL` | `READY` | always | closeBulkModal() |
| `PROCESSING` | `SUCCESS` | `READY` | always | toast.success(), refetch(), clearSelection() |
| `PROCESSING` | `ERROR` | `READY` | always | toast.error(err) |
| `ERROR` | `RETRY` | `LOADING` | always | refetch() |

### 6.2 Company Detail Page State Machine

Extends ADM-R00 Section 7.3 (Shared Detail Page State Machine).

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `LOADING` | `DATA_LOADED` | `READY` | company !== null | setCompany(data) |
| `LOADING` | `NOT_FOUND` | `NOT_FOUND` | company === null | - |
| `LOADING` | `FETCH_ERROR` | `ERROR` | always | setError(err) |
| `NOT_FOUND` | `GO_BACK` | - | always | router.push('/platform/companies') |
| `READY` | `TAB_CHANGE` | `READY` | always | setActiveTab(tab) |
| `READY` | `OPEN_SUSPEND` | `ACTION_MODAL` | status !== 'suspended' | setModal('suspend') |
| `READY` | `OPEN_REACTIVATE` | `ACTION_MODAL` | status === 'suspended' | setModal('reactivate') |
| `READY` | `OPEN_VERIFY` | `ACTION_MODAL` | always | setModal('verify') |
| `ACTION_MODAL` | `SUBMIT` | `SAVING` | form.isValid | executeAction() |
| `ACTION_MODAL` | `CANCEL` | `READY` | always | closeModal() |
| `SAVING` | `SUCCESS` | `READY` | always | toast.success(), refetch() |
| `SAVING` | `ERROR` | `ACTION_MODAL` | always | setFormError(err) |
| `ERROR` | `RETRY` | `LOADING` | always | refetch() |

### 6.3 Approval Modal State Machine

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `CLOSED` | `OPEN` | `OPEN` | always | setTarget(company) |
| `OPEN` | `CONFIRM` | `PROCESSING` | always | approveCompany(id) |
| `OPEN` | `CANCEL` | `CLOSED` | always | - |
| `PROCESSING` | `SUCCESS` | `CLOSED` | always | toast.success(), onSuccess() |
| `PROCESSING` | `ERROR` | `OPEN` | always | toast.error(err) |

### 6.4 Reject Modal State Machine

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `CLOSED` | `OPEN` | `OPEN` | always | setTarget(company), initForm() |
| `OPEN` | `REASON_CHANGE` | `OPEN` | always | setReason(value) |
| `OPEN` | `SUBMIT` | `PROCESSING` | reason.length > 0 | rejectCompany(id, reason) |
| `OPEN` | `SUBMIT` | `OPEN` | reason.length === 0 | showError('Reason required') |
| `OPEN` | `CANCEL` | `CLOSED` | always | resetForm() |
| `PROCESSING` | `SUCCESS` | `CLOSED` | always | toast.success(), onSuccess() |
| `PROCESSING` | `ERROR` | `OPEN` | always | toast.error(err) |

### 6.5 Suspend Modal State Machine

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `CLOSED` | `OPEN` | `OPEN` | always | setTarget(company), initForm() |
| `OPEN` | `REASON_CHANGE` | `OPEN` | always | setReason(value) |
| `OPEN` | `DURATION_CHANGE` | `OPEN` | always | setDuration(value) |
| `OPEN` | `SUBMIT` | `PROCESSING` | reason + duration valid | suspendCompany(id, reason, duration) |
| `OPEN` | `SUBMIT` | `OPEN` | !valid | showValidationErrors() |
| `OPEN` | `CANCEL` | `CLOSED` | always | resetForm() |
| `PROCESSING` | `SUCCESS` | `CLOSED` | always | toast.success(), onSuccess() |
| `PROCESSING` | `ERROR` | `OPEN` | always | toast.error(err) |

---

## 7. Risk Score Display

### 7.1 Score Colors

| Range | Color | Label |
|-------|-------|-------|
| 0-25 | Green | Low Risk |
| 26-50 | Yellow | Medium Risk |
| 51-75 | Orange | High Risk |
| 76-100 | Red | Critical |

### 7.2 Risk Bar Component

```typescript
<RiskScoreBar 
  score={25} 
  max={100}
  showLabel={true}
  size="sm" // sm | md | lg
/>
```

---

## 8. Tab Content

### 8.1 Overview Tab

- Company basic info
- Contact information
- Documents (business registration, etc.)
- Quick stats (jobs posted, applications received)

### 8.2 Team Tab (Admin+ only)

- List of company staff
- Role assignments
- Invite status

### 8.3 Jobs Tab

- Active jobs list
- Job status breakdown
- Quick actions (unpublish, remove)

### 8.4 Screening Tab

- Risk score breakdown
- Activity logs
- Content flags
- Suspension history

### 8.5 Requests Tab (if pending)

- Original request details
- Submitted documents
- Approval/rejection actions

---

## 9. Implementation Checklist

### Phase 1: List Page
- [ ] Create companies list page
- [ ] Implement tabs (All, Pending, Flagged, Suspended)
- [ ] Add search and filters
- [ ] Create company row component
- [ ] Implement selection and bulk actions

### Phase 2: Detail Page
- [ ] Create company detail page
- [ ] Implement header with status
- [ ] Add tab navigation
- [ ] Create Overview tab content
- [ ] Create Screening tab with risk score

### Phase 3: Actions
- [ ] Implement approve modal
- [ ] Implement reject modal with reason
- [ ] Implement suspend modal with duration
- [ ] Implement reactivate modal
- [ ] Add audit logging

### Phase 4: Integration
- [ ] Connect company screening data
- [ ] Wire risk score updates
- [ ] Test bulk actions
- [ ] Add activity logging

---

## 10. Files to Create

| File | Purpose |
|------|---------|
| `src/app/(platform)/platform/companies/page.tsx` | List page |
| `src/app/(platform)/platform/companies/[id]/page.tsx` | Detail page |
| `src/domains/admin/components/companies/CompanyList.tsx` | List component |
| `src/domains/admin/components/companies/CompanyRow.tsx` | Row component |
| `src/domains/admin/components/companies/CompanyDetail.tsx` | Detail component |
| `src/domains/admin/components/companies/CompanyHeader.tsx` | Detail header |
| `src/domains/admin/components/companies/CompanyTabs.tsx` | Tab navigation |
| `src/domains/admin/components/companies/ScreeningTab.tsx` | Screening tab |
| `src/domains/admin/components/companies/ApproveModal.tsx` | Approve modal |
| `src/domains/admin/components/companies/RejectModal.tsx` | Reject modal |
| `src/domains/admin/components/companies/SuspendModal.tsx` | Suspend modal |
| `src/domains/admin/components/shared/RiskScoreBar.tsx` | Risk indicator |
| `src/domains/admin/hooks/useAdminCompanies.ts` | List data hook |
| `src/domains/admin/hooks/useAdminCompanyDetail.ts` | Detail data hook |

---

*End of ADM-R02 Companies Management RIS v2.0*
