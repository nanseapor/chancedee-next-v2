# ADM-R04: Jobs Moderation

**Document ID:** ADM-R04  
**Version:** 2.0  
**Status:** Complete  
**Created:** 2025-12-11  
**Route:** `/platform/jobs`  
**Parent:** ADM-R00 (Cross-Cutting Specifications)

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | 2025-12-11 | Added UI State Machine section, content reports integration |
| 1.0 | 2025-12-10 | Initial creation |

---

## Cross-References

| Topic | Reference |
|-------|-----------|
| Shell Layout | ADM-R00 Section 2 |
| Permissions | ADM-R00 Section 3 |
| List Page State Machine | ADM-R00 Section 7.2 |
| Detail Page State Machine | ADM-R00 Section 7.3 |
| Content Reports Schema | ADM-R00 Section 9.3 |

---

## 1. Route Metadata

| Property | Value |
|----------|-------|
| Route ID | ADM-R04 |
| Route Path | `/platform/jobs` |
| Detail Path | `/platform/jobs/[jobId]` |
| Shell | Platform Admin Shell |
| Purpose | Job listing moderation |
| Min Admin Level | staff |
| UI Spec | `07-platform-admin-routes.md` Section 8.5 |

---

## 2. Feature Mapping

| Feature ID | Feature Name | Coverage |
|------------|--------------|----------|
| ADMIN-005 | View Job Listings | Full |
| JOB-MOD-001 | Unpublish Job | Full |
| JOB-MOD-002 | Remove Job | Full |
| JOB-MOD-003 | View Reports | Full |

---

## 3. Page Layout

### 3.1 List Page

```
+------------------------------------------------------------------+
| Jobs                                                              |
+------------------------------------------------------------------+
| [!] 3 jobs have been reported and need review                    |
+------------------------------------------------------------------+
| Tabs: [All] [Published] [Reported (3)] [Unpublished]             |
+------------------------------------------------------------------+
| Search: [                    ] | Filter: [Company v] [Industry v]|
+------------------------------------------------------------------+
| [ ] | Job Title       | Company     | Status    | Reports | Date |
+------------------------------------------------------------------+
| [ ] | Senior Dev      | ABC Corp    | Published | 0       | Jan  |
|     | Bangkok, IT     |             |           |         | 2024 |
+------------------------------------------------------------------+
| [ ] | Marketing Mgr   | XYZ Ltd     | Published | 3       | Feb  |
|     | Remote, Sales   |             | [!]       |         | 2024 |
+------------------------------------------------------------------+
| Bulk Actions: [Unpublish] [Remove]                               |
+------------------------------------------------------------------+
| [< Prev] Page 1 of 15 [Next >]                                   |
+------------------------------------------------------------------+
```

### 3.2 Detail Page

```
+------------------------------------------------------------------+
| [< Back] Senior Developer                   [Actions v]           |
+------------------------------------------------------------------+
| ABC Corporation | Bangkok | Technology                            |
| Status: Published | Applications: 25 | Views: 150                |
+------------------------------------------------------------------+
| Tabs: [Details] [Reports] [Applications]                          |
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
| Job List | `getAdminJobs()` | SWR |
| Job Detail | `getAdminJobDetail(id)` | SWR |
| Job Reports | `getJobReports(id)` | SWR |
| Job Applications | `getJobApplications(id)` | SWR |

### 4.2 Job List Item Shape

```typescript
interface AdminJobListItem {
  uid: string;
  title: string;
  company: {
    uid: string;
    name: string;
    logo?: string;
  };
  status: 'published' | 'unpublished' | 'filled' | 'removed';
  reportCount: number;
  applicationCount: number;
  location: string;
  industry: string;
  createdAt: number;
}
```

### 4.3 Write Operations

| Operation | Server Action | Side Effects |
|-----------|---------------|--------------|
| Unpublish | `unpublishJob(id, reason)` | Update status, notify company |
| Remove | `removeJob(id, reason)` | Soft delete, +15 company risk, notify |

---

## 5. State Contract

### 5.1 SWR Keys

```typescript
['admin', 'jobs', 'list', { tab, page, search, filters }]
['admin', 'jobs', 'detail', jobId]
['admin', 'jobs', 'reports', jobId]
['admin', 'jobs', 'applications', jobId]
```

### 5.2 Local State

```typescript
interface JobListState {
  activeTab: 'all' | 'published' | 'reported' | 'unpublished';
  search: string;
  filters: {
    company?: string;
    industry?: string;
  };
  page: number;
  selectedIds: string[];
}

interface JobDetailState {
  activeTab: 'details' | 'reports' | 'applications';
  actionModal: 'unpublish' | 'remove' | null;
}
```

---

## 6. UI State Machine

### 6.1 Jobs List Page State Machine

Extends ADM-R00 Section 7.2 (Shared List Page State Machine).

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `LOADING` | `DATA_LOADED` | `READY` | items.length > 0 | setJobs(items), checkReportedCount() |
| `LOADING` | `DATA_LOADED` | `EMPTY` | items.length === 0 | - |
| `LOADING` | `FETCH_ERROR` | `ERROR` | always | setError(err) |
| `READY` | `TAB_CHANGE` | `LOADING` | always | setActiveTab(tab), resetPage() |
| `READY` | `SEARCH` | `LOADING` | always | setSearch(query), resetPage() |
| `READY` | `FILTER_CHANGE` | `LOADING` | always | setFilters(f), resetPage() |
| `READY` | `ROW_CLICK` | - | always | router.push(`/platform/jobs/${id}`) |
| `READY` | `SELECT_ITEM` | `READY` | always | toggleSelection(id) |
| `READY` | `BULK_UNPUBLISH` | `BULK_ACTION` | selectedIds.length > 0 | openModal('unpublish') |
| `READY` | `BULK_REMOVE` | `BULK_ACTION` | selectedIds.length > 0 | openModal('remove') |
| `BULK_ACTION` | `SUBMIT` | `PROCESSING` | reason valid | executeBulkAction() |
| `BULK_ACTION` | `CANCEL` | `READY` | always | closeModal() |
| `PROCESSING` | `SUCCESS` | `READY` | always | toast.success(), refetch(), clearSelection() |
| `PROCESSING` | `ERROR` | `READY` | always | toast.error(err) |
| `ERROR` | `RETRY` | `LOADING` | always | refetch() |

### 6.2 Reported Banner State Machine

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `HIDDEN` | `REPORTS_EXIST` | `VISIBLE` | reportedCount > 0 | showBanner(count) |
| `VISIBLE` | `REPORTS_CLEARED` | `HIDDEN` | reportedCount === 0 | - |
| `VISIBLE` | `BANNER_CLICK` | - | always | setActiveTab('reported') |
| `VISIBLE` | `DISMISS` | `DISMISSED` | always | - |
| `DISMISSED` | `REPORTS_CHANGED` | `VISIBLE` | newCount > previousCount | showBanner(count) |

### 6.3 Job Detail Page State Machine

Extends ADM-R00 Section 7.3 (Shared Detail Page State Machine).

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `LOADING` | `DATA_LOADED` | `READY` | job !== null | setJob(data) |
| `LOADING` | `NOT_FOUND` | `NOT_FOUND` | job === null | - |
| `LOADING` | `FETCH_ERROR` | `ERROR` | always | setError(err) |
| `NOT_FOUND` | `GO_BACK` | - | always | router.push('/platform/jobs') |
| `READY` | `TAB_CHANGE` | `READY` | always | setActiveTab(tab) |
| `READY` | `OPEN_UNPUBLISH` | `ACTION_MODAL` | status === 'published' | setModal('unpublish') |
| `READY` | `OPEN_REMOVE` | `ACTION_MODAL` | status !== 'removed' | setModal('remove') |
| `ACTION_MODAL` | `SUBMIT` | `SAVING` | reason valid | executeAction() |
| `ACTION_MODAL` | `CANCEL` | `READY` | always | closeModal() |
| `SAVING` | `SUCCESS` | `READY` | always | toast.success(), refetch() |
| `SAVING` | `ERROR` | `ACTION_MODAL` | always | setFormError(err) |
| `ERROR` | `RETRY` | `LOADING` | always | refetch() |

### 6.4 Unpublish Modal State Machine

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `CLOSED` | `OPEN` | `OPEN` | always | setTarget(job), initForm() |
| `OPEN` | `REASON_SELECT` | `OPEN` | always | setReason(value) |
| `OPEN` | `NOTE_CHANGE` | `OPEN` | always | setNote(value) |
| `OPEN` | `SUBMIT` | `PROCESSING` | reason selected | unpublishJob(id, reason) |
| `OPEN` | `SUBMIT` | `OPEN` | !reason | showError('Select reason') |
| `OPEN` | `CANCEL` | `CLOSED` | always | resetForm() |
| `PROCESSING` | `SUCCESS` | `CLOSED` | always | toast.success(), onSuccess() |
| `PROCESSING` | `ERROR` | `OPEN` | always | toast.error(err) |

### 6.5 Remove Modal State Machine

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `CLOSED` | `OPEN` | `OPEN` | always | setTarget(job), initForm() |
| `OPEN` | `REASON_SELECT` | `OPEN` | always | setReason(value) |
| `OPEN` | `SUBMIT` | `PROCESSING` | reason selected | removeJob(id, reason) |
| `OPEN` | `SUBMIT` | `OPEN` | !reason | showError('Select reason') |
| `OPEN` | `CANCEL` | `CLOSED` | always | resetForm() |
| `PROCESSING` | `SUCCESS` | `CLOSED` | always | toast.success(), onSuccess() |
| `PROCESSING` | `ERROR` | `OPEN` | always | toast.error(err) |

---

## 7. Tab Content

### 7.1 Details Tab

- Job title and description
- Requirements
- Compensation range
- Location and work type
- Company information
- Posted date and expiry

### 7.2 Reports Tab

- List of reports for this job
- Report details (reason, reporter, date)
- Quick actions (dismiss, escalate)
- Link to full report in ADM-R05

### 7.3 Applications Tab

- Application list
- Application status
- Candidate info
- Application dates

---

## 8. Remove Job Impact

Removing a job affects company risk score:

| Action | Risk Score Impact |
|--------|-------------------|
| Remove for scam | +20 |
| Remove for policy violation | +15 |
| Remove for inappropriate | +15 |
| Remove for other | +10 |

Warning message in modal:
> "Removing this job will increase the company's risk score by +15 points."

---

## 9. Implementation Checklist

### Phase 1: List Page
- [ ] Create jobs list page
- [ ] Implement tabs (All, Published, Reported, Unpublished)
- [ ] Add reported jobs banner
- [ ] Create job row component
- [ ] Implement selection and bulk actions

### Phase 2: Detail Page
- [ ] Create job detail page
- [ ] Implement job info display
- [ ] Add tab navigation
- [ ] Create Details tab content
- [ ] Create Reports tab content

### Phase 3: Actions
- [ ] Implement unpublish modal with reasons
- [ ] Implement remove modal with warning
- [ ] Connect to company risk score
- [ ] Add audit logging

### Phase 4: Reports Integration
- [ ] Wire reports from content_reports collection
- [ ] Show report count badges
- [ ] Link to ADM-R05 for detailed review

---

## 10. Files to Create

| File | Purpose |
|------|---------|
| `src/app/(platform)/platform/jobs/page.tsx` | List page |
| `src/app/(platform)/platform/jobs/[id]/page.tsx` | Detail page |
| `src/domains/admin/components/jobs/JobList.tsx` | List component |
| `src/domains/admin/components/jobs/JobRow.tsx` | Row component |
| `src/domains/admin/components/jobs/ReportedBanner.tsx` | Warning banner |
| `src/domains/admin/components/jobs/JobDetail.tsx` | Detail component |
| `src/domains/admin/components/jobs/DetailsTab.tsx` | Details tab |
| `src/domains/admin/components/jobs/ReportsTab.tsx` | Reports tab |
| `src/domains/admin/components/jobs/ApplicationsTab.tsx` | Applications tab |
| `src/domains/admin/components/jobs/UnpublishModal.tsx` | Unpublish modal |
| `src/domains/admin/components/jobs/RemoveModal.tsx` | Remove modal |
| `src/domains/admin/hooks/useAdminJobs.ts` | List data hook |
| `src/domains/admin/hooks/useAdminJobDetail.ts` | Detail data hook |

---

*End of ADM-R04 Jobs Moderation RIS v2.0*
