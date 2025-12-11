# ADM-R09: Admin Audit Logs

**Document ID:** ADM-R09  
**Version:** 2.0  
**Status:** Complete  
**Created:** 2025-12-11  
**Route:** `/platform/logs`  
**Parent:** ADM-R00 (Cross-Cutting Specifications)

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | 2025-12-11 | Major rewrite: Global admin_audit_logs, Super-Admin only, UI State Machine |
| 1.0 | 2025-12-10 | Initial creation |

---

## Cross-References

| Topic | Reference |
|-------|-----------|
| Shell Layout | ADM-R00 Section 2 |
| Permissions | ADM-R00 Section 3 |
| List Page State Machine | ADM-R00 Section 7.2 |
| Admin Audit Logs Schema | ADM-R00 Section 9.2 |
| Audit Log Actions | ADM-R00 Section 10.2 |

---

## 1. Route Metadata

| Property | Value |
|----------|-------|
| Route ID | ADM-R09 |
| Route Path | `/platform/logs` |
| Shell | Platform Admin Shell |
| Purpose | Admin action audit trail |
| Min Admin Level | **super** (entire route restricted) |
| UI Spec | `07-platform-admin-routes.md` Section 8.7 |

---

## 2. Access Restriction

**This entire route is restricted to Super-Admin only.**

```typescript
// Route guard
export default function AuditLogsPage() {
  const adminLevel = useAtomValue(adminLevelAtom);
  
  if (adminLevel !== 'super') {
    return <AccessDenied message="Super-Admin access required" />;
  }
  
  return <AuditLogsDashboard />;
}
```

---

## 3. Feature Mapping

| Feature ID | Feature Name | Coverage |
|------------|--------------|----------|
| AUDIT-001 | View Audit Logs | Full |
| AUDIT-002 | Filter Audit Logs | Full |
| AUDIT-003 | Export Audit Logs | Full |
| AUDIT-004 | View Log Details | Full |

---

## 4. Page Layout

```
+------------------------------------------------------------------+
| Admin Audit Logs                                   [Super Only]   |
+------------------------------------------------------------------+
| Quick Stats                                                       |
| Today: 45 | Critical: 2 | By You: 12                             |
+------------------------------------------------------------------+
| Filters:                                                          |
| Date: [From     ] - [To       ] | Actor: [All v]                 |
| Category: [All v] | Severity: [All v] | Search: [              ] |
+------------------------------------------------------------------+
| [Apply Filters] [Clear] [Export]                                  |
+------------------------------------------------------------------+
| Log Entries                                                       |
| +--------------------------------------------------------------+ |
| | [INFO] 14:32 - John Admin approved company "ABC Corp"         | |
| | Category: company | Entity: ABC Corp                          | |
| +--------------------------------------------------------------+ |
| | [WARN] 14:15 - Jane Staff suspended user "user123"            | |
| | Category: user | Entity: user123 | Reason: Policy violation   | |
| +--------------------------------------------------------------+ |
| | [CRIT] 13:45 - System risk threshold changed: 50 -> 70        | |
| | Category: system | Actor: Super Admin                         | |
| +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
| [< Prev] Page 1 of 50 [Next >]                                   |
+------------------------------------------------------------------+
```

---

## 5. Data Contract

### 5.1 Read Operations

| Data | Source | Method |
|------|--------|--------|
| Log List | `queryAdminAuditLogs(filters, pagination)` | SWR |
| Log Detail | In-memory from list | Modal |
| Quick Stats | `getAuditLogStats()` | SWR |

### 5.2 Audit Log Entry Shape

```typescript
interface AuditLogEntry {
  uid: string;
  timestamp: number;
  actor: {
    uid: string;
    email: string;
    displayName: string;
    role: 'staff' | 'admin' | 'super';
  };
  action: string;
  actionCategory: AdminActionCategory;
  entity: {
    type: string;
    id: string;
    name?: string;
  };
  changes?: {
    field: string;
    before: any;
    after: any;
  }[];
  metadata: {
    reason?: string;
    ip?: string;
    userAgent?: string;
    requestId?: string;
    route?: string;
  };
  severity: 'info' | 'warning' | 'critical';
}

type AdminActionCategory = 
  | 'company' 
  | 'candidate' 
  | 'job' 
  | 'user' 
  | 'wallet' 
  | 'system' 
  | 'master_data' 
  | 'report' 
  | 'access';
```

### 5.3 Quick Stats Shape

```typescript
interface AuditLogStats {
  todayCount: number;
  criticalCount: number;
  byCurrentUser: number;
}
```

### 5.4 Export Operation

| Operation | Server Action | Restrictions |
|-----------|---------------|--------------|
| Export Logs | `exportAdminAuditLogs(filters, format)` | Max 90 days, Max 10K rows |

---

## 6. State Contract

### 6.1 SWR Keys

```typescript
['admin', 'logs', 'list', { filters, page }]
['admin', 'logs', 'stats']
```

### 6.2 Local State

```typescript
interface AuditLogsState {
  filters: {
    dateFrom?: Date;
    dateTo?: Date;
    actorId?: string;
    category?: AdminActionCategory;
    severity?: 'info' | 'warning' | 'critical';
    search?: string;
  };
  page: number;
  selectedLog: AuditLogEntry | null;
  detailModalOpen: boolean;
  exportModalOpen: boolean;
}
```

---

## 7. UI State Machine

### 7.1 Audit Logs Page State Machine

Extends ADM-R00 Section 7.2 (Shared List Page State Machine).

**States:** `LOADING`, `READY`, `FILTERING`, `EXPORTING`, `ERROR`, `ACCESS_DENIED`

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `LOADING` | `ACCESS_CHECK` | `ACCESS_DENIED` | adminLevel !== 'super' | showAccessDenied() |
| `LOADING` | `ACCESS_CHECK` | `LOADING` | adminLevel === 'super' | fetchLogs() |
| `LOADING` | `DATA_LOADED` | `READY` | always | setLogs(logs), setStats(stats) |
| `LOADING` | `FETCH_ERROR` | `ERROR` | always | setError(err) |
| `READY` | `FILTER_CHANGE` | `READY` | always | updateFilter(name, value) |
| `READY` | `APPLY_FILTERS` | `FILTERING` | always | - |
| `READY` | `CLEAR_FILTERS` | `LOADING` | always | resetFilters(), refetch() |
| `FILTERING` | `FILTERS_APPLIED` | `LOADING` | always | refetch() |
| `READY` | `SEARCH` | `LOADING` | always | setSearch(query), refetch() |
| `READY` | `ROW_CLICK` | `DETAIL_OPEN` | always | setSelectedLog(log), openModal() |
| `READY` | `EXPORT_CLICK` | `EXPORT_MODAL` | always | openExportModal() |
| `READY` | `PAGE_CHANGE` | `LOADING` | always | setPage(n), refetch() |
| `DETAIL_OPEN` | `CLOSE` | `READY` | always | closeModal() |
| `DETAIL_OPEN` | `VIEW_ENTITY` | - | always | navigateToEntity(type, id) |
| `EXPORT_MODAL` | `SUBMIT` | `EXPORTING` | dateRange valid | exportLogs(filters, format) |
| `EXPORT_MODAL` | `SUBMIT` | `EXPORT_MODAL` | dateRange > 90 days | showError('Max 90 days') |
| `EXPORT_MODAL` | `CANCEL` | `READY` | always | closeModal() |
| `EXPORTING` | `SUCCESS` | `READY` | always | downloadFile(url), closeModal() |
| `EXPORTING` | `ERROR` | `EXPORT_MODAL` | always | toast.error(err) |
| `ERROR` | `RETRY` | `LOADING` | always | refetch() |
| `ACCESS_DENIED` | - | - | always | - |

### 7.2 Filter Panel State Machine

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `COLLAPSED` | `EXPAND` | `EXPANDED` | always | showFilters() |
| `EXPANDED` | `COLLAPSE` | `COLLAPSED` | always | hideFilters() |
| `EXPANDED` | `DATE_FROM_CHANGE` | `EXPANDED` | always | setDateFrom(date) |
| `EXPANDED` | `DATE_TO_CHANGE` | `EXPANDED` | always | setDateTo(date) |
| `EXPANDED` | `ACTOR_CHANGE` | `EXPANDED` | always | setActor(id) |
| `EXPANDED` | `CATEGORY_CHANGE` | `EXPANDED` | always | setCategory(cat) |
| `EXPANDED` | `SEVERITY_CHANGE` | `EXPANDED` | always | setSeverity(sev) |
| `EXPANDED` | `APPLY` | - | always | emitApplyFilters() |
| `EXPANDED` | `CLEAR` | `EXPANDED` | always | resetAllFilters() |

### 7.3 Log Entry Card State Machine

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `COLLAPSED` | `CLICK` | - | always | openDetailModal(log) |
| `COLLAPSED` | `HOVER` | `HOVERED` | always | showPreview() |
| `HOVERED` | `LEAVE` | `COLLAPSED` | always | hidePreview() |

### 7.4 Detail Modal State Machine

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `CLOSED` | `OPEN` | `OPEN` | always | setLog(log) |
| `OPEN` | `CLOSE` | `CLOSED` | always | - |
| `OPEN` | `VIEW_ACTOR` | - | always | navigateToUser(actorId) |
| `OPEN` | `VIEW_ENTITY` | - | always | navigateToEntity(type, id) |
| `OPEN` | `COPY_REQUEST_ID` | `OPEN` | always | copyToClipboard(requestId), toast.info('Copied') |

### 7.5 Export Modal State Machine

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `CLOSED` | `OPEN` | `OPEN` | always | initExportForm(currentFilters) |
| `OPEN` | `DATE_RANGE_CHANGE` | `OPEN` | always | setExportRange(from, to) |
| `OPEN` | `FORMAT_CHANGE` | `OPEN` | always | setFormat(format) |
| `OPEN` | `SUBMIT` | `EXPORTING` | range <= 90 days | exportLogs() |
| `OPEN` | `SUBMIT` | `OPEN` | range > 90 days | showError('Maximum 90 days') |
| `OPEN` | `CANCEL` | `CLOSED` | always | - |
| `EXPORTING` | `SUCCESS` | `CLOSED` | always | downloadFile(url), toast.success() |
| `EXPORTING` | `ERROR` | `OPEN` | always | toast.error(err) |

---

## 8. Severity Display

| Severity | Badge Color | Icon | Description |
|----------|-------------|------|-------------|
| info | Green | Check | Normal operations |
| warning | Yellow | Warning | Notable actions |
| critical | Red | Alert | Security/system critical |

---

## 9. Action Categories

| Category | Example Actions |
|----------|-----------------|
| company | approve, reject, suspend, reactivate |
| candidate | suspend, reactivate, delete |
| job | unpublish, remove |
| user | add_role, remove_role, set_roles, invite |
| wallet | deposit, withdraw |
| system | change_threshold, toggle_maintenance, toggle_feature |
| master_data | add, update, delete |
| report | dismiss, resolve |
| access | login, logout, permission_denied |

---

## 10. Retention Policy

| Severity | Retention Period |
|----------|------------------|
| info | 90 days |
| warning | 180 days |
| critical | 365 days |

---

## 11. Export Limits

| Limit | Value |
|-------|-------|
| Max Date Range | 90 days |
| Max Rows | 10,000 |
| Formats | CSV, XLSX |
| Download Expiry | 1 hour |

---

## 12. Implementation Checklist

### Phase 1: Access Control
- [ ] Implement super-admin route guard
- [ ] Create access denied component
- [ ] Add audit log for denied access attempts

### Phase 2: List View
- [ ] Create logs list page
- [ ] Implement quick stats bar
- [ ] Create log entry card component
- [ ] Add severity badges

### Phase 3: Filtering
- [ ] Create filter panel
- [ ] Implement date range picker
- [ ] Add actor dropdown
- [ ] Add category and severity filters
- [ ] Implement search

### Phase 4: Detail Modal
- [ ] Create detail modal
- [ ] Show all log fields
- [ ] Display changes diff
- [ ] Add entity navigation links

### Phase 5: Export
- [ ] Create export modal
- [ ] Implement CSV export
- [ ] Implement XLSX export
- [ ] Add download handling

---

## 13. Files to Create

| File | Purpose |
|------|---------|
| `src/app/(platform)/platform/logs/page.tsx` | Page |
| `src/domains/admin/components/logs/AuditLogsList.tsx` | List component |
| `src/domains/admin/components/logs/LogStatsBar.tsx` | Quick stats |
| `src/domains/admin/components/logs/LogFilterPanel.tsx` | Filters |
| `src/domains/admin/components/logs/LogEntryCard.tsx` | Log card |
| `src/domains/admin/components/logs/SeverityBadge.tsx` | Severity indicator |
| `src/domains/admin/components/logs/CategoryBadge.tsx` | Category indicator |
| `src/domains/admin/components/logs/LogDetailModal.tsx` | Detail modal |
| `src/domains/admin/components/logs/ChangesDiff.tsx` | Changes display |
| `src/domains/admin/components/logs/ExportModal.tsx` | Export modal |
| `src/domains/admin/components/logs/AccessDenied.tsx` | Access denied |
| `src/domains/admin/hooks/useAuditLogs.ts` | Logs hook |
| `src/domains/admin/hooks/useAuditLogStats.ts` | Stats hook |

---

*End of ADM-R09 Admin Audit Logs RIS v2.0*
