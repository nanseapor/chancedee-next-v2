# ADM-R05: Content Reports

**Document ID:** ADM-R05  
**Version:** 2.0  
**Status:** Complete  
**Created:** 2025-12-11  
**Route:** `/platform/reports`  
**Parent:** ADM-R00 (Cross-Cutting Specifications)

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | 2025-12-11 | Major rewrite: Global content_reports collection, UI State Machine |
| 1.0 | 2025-12-10 | Initial creation |

---

## Cross-References

| Topic | Reference |
|-------|-----------|
| Shell Layout | ADM-R00 Section 2 |
| Permissions | ADM-R00 Section 3 |
| List Page State Machine | ADM-R00 Section 7.2 |
| Action Modal State Machine | ADM-R00 Section 7.4 |
| Content Reports Schema | ADM-R00 Section 9.3 |
| Content Report Actions | ADM-R00 Section 10.3 |

---

## 1. Route Metadata

| Property | Value |
|----------|-------|
| Route ID | ADM-R05 |
| Route Path | `/platform/reports` |
| Shell | Platform Admin Shell |
| Purpose | Content report management and moderation |
| Min Admin Level | staff |
| UI Spec | `07-platform-admin-routes.md` Section 8.6 |

---

## 2. Feature Mapping

| Feature ID | Feature Name | Coverage |
|------------|--------------|----------|
| REPORT-001 | View Reports List | Full |
| REPORT-002 | Review Report | Full |
| REPORT-003 | Dismiss Report | Full |
| REPORT-004 | Take Action | Full |

---

## 3. Page Layout

```
+------------------------------------------------------------------+
| Content Reports                                                   |
+------------------------------------------------------------------+
| Stats: Pending: 8 | Reviewing: 2 | Today: 5                      |
+------------------------------------------------------------------+
| Tabs: [Pending (8)] [Reviewing (2)] [Resolved] [Dismissed]       |
+------------------------------------------------------------------+
| Filter: [Type v] [Severity v] [Reason v] | Search: [           ] |
+------------------------------------------------------------------+
| Report Cards                                                      |
| +--------------------------------------------------------------+ |
| | [HIGH] Job: "Senior Developer" reported for SCAM              | |
| | Reported by: Candidate | 2 hours ago                         | |
| | Same item reported 3 times                                    | |
| | [View Details] [Dismiss] [Take Action]                        | |
| +--------------------------------------------------------------+ |
| +--------------------------------------------------------------+ |
| | [MEDIUM] Company: "XYZ Ltd" reported for MISLEADING           | |
| | Reported by: Candidate | 1 day ago                           | |
| | [View Details] [Dismiss] [Take Action]                        | |
| +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
| [< Prev] Page 1 of 5 [Next >]                                    |
+------------------------------------------------------------------+
```

---

## 4. Data Contract

### 4.1 Read Operations

| Data | Source | Method |
|------|--------|--------|
| Report List | `getContentReports()` | SWR |
| Report Detail | `getContentReportDetail(id)` | Modal fetch |
| Report Counts | `getReportCounts()` | SWR |

### 4.2 Report List Item Shape

```typescript
interface ReportListItem {
  uid: string;
  targetType: 'job' | 'company' | 'message';
  targetId: string;
  targetTitle: string;
  reason: ReportReason;
  severity: 'low' | 'medium' | 'high';
  status: 'pending' | 'reviewing' | 'dismissed' | 'resolved';
  reporter: {
    type: 'candidate' | 'company' | 'admin';
  };
  reportCount: number; // same target
  createdAt: number;
  assignedTo?: string;
}
```

### 4.3 Write Operations

| Operation | Server Action | Side Effects |
|-----------|---------------|--------------|
| Start Review | `startReportReview(id)` | Update status, assign |
| Dismiss | `dismissReport(id, reason)` | Update status, log |
| Resolve | `resolveReport(id, action, options)` | Update status, apply action |

---

## 5. State Contract

### 5.1 SWR Keys

```typescript
['admin', 'reports', 'list', { status, type, severity, page }]
['admin', 'reports', 'counts']
['admin', 'reports', 'detail', reportId]
```

### 5.2 Local State

```typescript
interface ReportListState {
  activeTab: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  filters: {
    type?: 'job' | 'company' | 'message';
    severity?: 'low' | 'medium' | 'high';
    reason?: ReportReason;
    search?: string;
  };
  page: number;
  selectedReport: string | null;
  modalOpen: 'detail' | 'dismiss' | 'action' | null;
}
```

---

## 6. UI State Machine

### 6.1 Reports List Page State Machine

Extends ADM-R00 Section 7.2 (Shared List Page State Machine).

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `LOADING` | `DATA_LOADED` | `READY` | items.length > 0 | setReports(items), setCounts(counts) |
| `LOADING` | `DATA_LOADED` | `EMPTY` | items.length === 0 | setCounts(counts) |
| `LOADING` | `FETCH_ERROR` | `ERROR` | always | setError(err) |
| `READY` | `TAB_CHANGE` | `LOADING` | always | setActiveTab(tab), resetPage() |
| `READY` | `FILTER_CHANGE` | `LOADING` | always | setFilters(f), resetPage() |
| `READY` | `SEARCH` | `LOADING` | always | setSearch(query), resetPage() |
| `READY` | `CARD_CLICK` | `DETAIL_OPEN` | always | setSelectedReport(id), openModal('detail') |
| `READY` | `DISMISS_CLICK` | `DISMISS_OPEN` | always | setSelectedReport(id), openModal('dismiss') |
| `READY` | `ACTION_CLICK` | `ACTION_OPEN` | always | setSelectedReport(id), openModal('action') |
| `DETAIL_OPEN` | `START_REVIEW` | `PROCESSING` | status === 'pending' | startReportReview(id) |
| `DETAIL_OPEN` | `DISMISS` | `DISMISS_OPEN` | always | switchModal('dismiss') |
| `DETAIL_OPEN` | `TAKE_ACTION` | `ACTION_OPEN` | always | switchModal('action') |
| `DETAIL_OPEN` | `CLOSE` | `READY` | always | closeModal() |
| `DISMISS_OPEN` | `SUBMIT` | `PROCESSING` | reason selected | dismissReport(id, reason) |
| `DISMISS_OPEN` | `CANCEL` | `READY` | always | closeModal() |
| `ACTION_OPEN` | `SUBMIT` | `PROCESSING` | action selected | resolveReport(id, action, options) |
| `ACTION_OPEN` | `CANCEL` | `READY` | always | closeModal() |
| `PROCESSING` | `SUCCESS` | `READY` | always | toast.success(), refetch(), closeModal() |
| `PROCESSING` | `ERROR` | Previous modal | always | toast.error(err) |
| `ERROR` | `RETRY` | `LOADING` | always | refetch() |

### 6.2 Report Card State Machine

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `IDLE` | `HOVER` | `HOVERED` | always | showActions() |
| `HOVERED` | `LEAVE` | `IDLE` | always | hideActions() |
| `IDLE` | `CLICK` | - | always | openDetailModal(report) |
| `HOVERED` | `DISMISS_CLICK` | - | always | openDismissModal(report) |
| `HOVERED` | `ACTION_CLICK` | - | always | openActionModal(report) |

### 6.3 Detail Modal State Machine

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `CLOSED` | `OPEN` | `LOADING` | always | fetchReportDetail(id) |
| `LOADING` | `DATA_LOADED` | `OPEN` | always | setReport(data) |
| `LOADING` | `ERROR` | `ERROR` | always | setError(err) |
| `OPEN` | `START_REVIEW` | `REVIEWING` | status === 'pending' | startReview() |
| `REVIEWING` | `SUCCESS` | `OPEN` | always | updateStatus('reviewing') |
| `OPEN` | `DISMISS` | - | always | closeAndOpenDismiss() |
| `OPEN` | `ACTION` | - | always | closeAndOpenAction() |
| `OPEN` | `VIEW_TARGET` | - | always | navigateToTarget(targetType, targetId) |
| `OPEN` | `CLOSE` | `CLOSED` | always | - |
| `ERROR` | `RETRY` | `LOADING` | always | fetchReportDetail(id) |
| `ERROR` | `CLOSE` | `CLOSED` | always | - |

### 6.4 Dismiss Modal State Machine

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `CLOSED` | `OPEN` | `OPEN` | always | setTarget(report), initForm() |
| `OPEN` | `REASON_SELECT` | `OPEN` | always | setReason(value) |
| `OPEN` | `NOTE_CHANGE` | `OPEN` | always | setNote(value) |
| `OPEN` | `SUBMIT` | `SUBMITTING` | reason selected | dismissReport(id, reason) |
| `OPEN` | `SUBMIT` | `OPEN` | !reason | showError('Select reason') |
| `OPEN` | `CANCEL` | `CLOSED` | always | resetForm() |
| `SUBMITTING` | `SUCCESS` | `CLOSED` | always | toast.success(), onSuccess() |
| `SUBMITTING` | `ERROR` | `OPEN` | always | toast.error(err) |

### 6.5 Take Action Modal State Machine

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `CLOSED` | `OPEN` | `OPEN` | always | setTarget(report), initForm() |
| `OPEN` | `ACTION_SELECT` | `OPEN` | always | setAction(value), updateOptions() |
| `OPEN` | `OPTION_TOGGLE` | `OPEN` | always | toggleOption(option) |
| `OPEN` | `SUBMIT` | `SUBMITTING` | action selected | resolveReport(id, action, options) |
| `OPEN` | `SUBMIT` | `OPEN` | !action | showError('Select action') |
| `OPEN` | `CANCEL` | `CLOSED` | always | resetForm() |
| `SUBMITTING` | `SUCCESS` | `CLOSED` | always | toast.success(), onSuccess() |
| `SUBMITTING` | `ERROR` | `OPEN` | always | toast.error(err) |

---

## 7. Severity Display

| Severity | Color | Icon | Priority |
|----------|-------|------|----------|
| high | Red | Exclamation | Process first |
| medium | Yellow | Warning | Process normally |
| low | Gray | Info | Can defer |

---

## 8. Report Count Highlighting

| Count | Display | Style |
|-------|---------|-------|
| 1-2 | Normal | Default |
| 3-4 | Warning | Yellow highlight |
| 5+ | Urgent | Red highlight, badge "Urgent" |

---

## 9. Actions by Target Type

### 9.1 Job Reports

| Action | Effect |
|--------|--------|
| Remove Content | Unpublish job, +15 company risk |
| Suspend Company | Suspend company account, +50 risk |
| Warn | Send warning to company |

### 9.2 Company Reports

| Action | Effect |
|--------|--------|
| Suspend Company | Suspend company account, +50 risk |
| Warn | Send warning to company |

### 9.3 Message Reports

| Action | Effect |
|--------|--------|
| Remove Message | Delete message from chat |
| Suspend Sender | Suspend sender account |
| Warn | Send warning to sender |

---

## 10. Dismiss Reasons

| Reason | Description |
|--------|-------------|
| no_violation | Content does not violate policies |
| duplicate | Already handled in another report |
| insufficient_info | Not enough information to act |
| false_report | Report appears to be false/malicious |
| other | Other reason (requires note) |

---

## 11. Implementation Checklist

### Phase 1: List Page
- [ ] Create reports list page
- [ ] Implement stats bar
- [ ] Create tab navigation
- [ ] Create report card component
- [ ] Add severity badges

### Phase 2: Modals
- [ ] Create detail modal
- [ ] Create dismiss modal with reasons
- [ ] Create take action modal
- [ ] Wire modal transitions

### Phase 3: Actions
- [ ] Implement start review
- [ ] Implement dismiss flow
- [ ] Implement resolve flow with options
- [ ] Connect to company risk score

### Phase 4: Polish
- [ ] Add report count badges
- [ ] Implement urgent highlighting
- [ ] Add keyboard navigation
- [ ] Optimize refetch

---

## 12. Files to Create

| File | Purpose |
|------|---------|
| `src/app/(platform)/platform/reports/page.tsx` | List page |
| `src/domains/admin/components/reports/ReportList.tsx` | List component |
| `src/domains/admin/components/reports/ReportStatsBar.tsx` | Stats bar |
| `src/domains/admin/components/reports/ReportCard.tsx` | Report card |
| `src/domains/admin/components/reports/SeverityBadge.tsx` | Severity indicator |
| `src/domains/admin/components/reports/ReportDetailModal.tsx` | Detail modal |
| `src/domains/admin/components/reports/DismissModal.tsx` | Dismiss modal |
| `src/domains/admin/components/reports/TakeActionModal.tsx` | Action modal |
| `src/domains/admin/hooks/useContentReports.ts` | List data hook |
| `src/domains/admin/hooks/useReportCounts.ts` | Counts hook |

---

*End of ADM-R05 Content Reports RIS v2.0*
