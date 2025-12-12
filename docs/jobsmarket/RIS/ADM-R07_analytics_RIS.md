# ADM-R07: Analytics Dashboard

**Document ID:** ADM-R07  
**Version:** 2.0  
**Status:** Complete  
**Created:** 2025-12-11  
**Route:** `/platform/analytics`  
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
| Access Control State Machine | ADM-R00 Section 7.1 |

---

## 1. Route Metadata

| Property | Value |
|----------|-------|
| Route ID | ADM-R07 |
| Route Path | `/platform/analytics` |
| Shell | Platform Admin Shell |
| Purpose | Platform-wide analytics and insights |
| Min Admin Level | staff |
| UI Spec | `07-platform-admin-routes.md` Section 8.9 |

---

## 2. Feature Mapping

| Feature ID | Feature Name | Coverage |
|------------|--------------|----------|
| ADMIN-033 | Get Dashboard Statistics | Full |
| ANALYTICS-001 | View Platform Metrics | Full |
| ANALYTICS-002 | Export Reports | Full |

---

## 3. Page Layout

```
+------------------------------------------------------------------+
| Analytics                                                         |
+------------------------------------------------------------------+
| Date Range: [Last 7 days v] [Custom] | [Refresh] [Export]        |
+------------------------------------------------------------------+
| KPI Cards                                                         |
| +------------+ +------------+ +------------+ +------------+      |
| | Users      | | Jobs       | | Apps       | | Hires      |      |
| | 3,450      | | 234        | | 1,200      | | 45         |      |
| | +12%       | | +5%        | | +18%       | | +22%       |      |
| +------------+ +------------+ +------------+ +------------+      |
+------------------------------------------------------------------+
| Charts Row 1                                                      |
| +-----------------------------+ +-----------------------------+  |
| | User Growth                 | | Jobs Posted                 |  |
| | [Line Chart]                | | [Bar Chart]                 |  |
| +-----------------------------+ +-----------------------------+  |
+------------------------------------------------------------------+
| Charts Row 2                                                      |
| +-----------------------------+ +-----------------------------+  |
| | Applications                | | Job Functions               |  |
| | [Area Chart]                | | [Pie Chart]                 |  |
| +-----------------------------+ +-----------------------------+  |
+------------------------------------------------------------------+
```

---

## 4. Data Contract

### 4.1 Read Operations

| Data | Source | Method |
|------|--------|--------|
| KPI Stats | `getAnalyticsKPIs(dateRange)` | SWR |
| Chart Data | `getAnalyticsChart(type, dateRange)` | SWR |
| Full Dashboard | `getAnalyticsDashboard(dateRange)` | SWR |

### 4.2 Analytics Data Shape

```typescript
interface AnalyticsData {
  dateRange: { from: number; to: number };
  
  kpis: {
    users: { value: number; change: number; direction: 'up' | 'down' | 'flat' };
    jobs: { value: number; change: number; direction: 'up' | 'down' | 'flat' };
    applications: { value: number; change: number; direction: 'up' | 'down' | 'flat' };
    hires: { value: number; change: number; direction: 'up' | 'down' | 'flat' };
  };
  
  charts: {
    userGrowth: ChartData;
    jobsPosted: ChartData;
    applications: ChartData;
    jobFunctions: PieChartData;
  };
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
  }[];
}

interface PieChartData {
  labels: string[];
  values: number[];
}
```

### 4.3 Export Operation

| Operation | Server Action | Output |
|-----------|---------------|--------|
| Export Report | `exportAnalyticsReport(dateRange, format, sections)` | Download URL |

---

## 5. State Contract

### 5.1 SWR Keys

```typescript
['admin', 'analytics', 'dashboard', { dateRange }]
['admin', 'analytics', 'kpis', { dateRange }]
['admin', 'analytics', 'chart', chartType, { dateRange }]
```

### 5.2 Local State

```typescript
interface AnalyticsState {
  dateRange: {
    preset: 'last_7_days' | 'last_30_days' | 'last_90_days' | 'this_month' | 'last_month' | 'this_year' | 'custom';
    from?: Date;
    to?: Date;
  };
  exportModalOpen: boolean;
  exportFormat: 'csv' | 'xlsx';
  exportSections: string[];
}
```

---

## 6. UI State Machine

### 6.1 Analytics Page State Machine

**States:** `LOADING`, `READY`, `REFRESHING`, `EXPORTING`, `ERROR`

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `LOADING` | `DATA_LOADED` | `READY` | always | setData(analytics) |
| `LOADING` | `FETCH_ERROR` | `ERROR` | always | setError(err) |
| `READY` | `DATE_RANGE_CHANGE` | `LOADING` | always | setDateRange(range), refetch() |
| `READY` | `PRESET_SELECT` | `LOADING` | always | setPreset(preset), refetch() |
| `READY` | `CUSTOM_RANGE` | `READY` | always | openDatePicker() |
| `READY` | `CUSTOM_APPLY` | `LOADING` | from <= to | setCustomRange(from, to), refetch() |
| `READY` | `REFRESH_CLICK` | `REFRESHING` | always | refetch() |
| `READY` | `EXPORT_CLICK` | `EXPORT_MODAL` | always | openExportModal() |
| `REFRESHING` | `DATA_LOADED` | `READY` | always | setData(analytics) |
| `REFRESHING` | `FETCH_ERROR` | `READY` | always | toast.error('Refresh failed') |
| `EXPORT_MODAL` | `FORMAT_SELECT` | `EXPORT_MODAL` | always | setFormat(format) |
| `EXPORT_MODAL` | `SECTION_TOGGLE` | `EXPORT_MODAL` | always | toggleSection(section) |
| `EXPORT_MODAL` | `SUBMIT` | `EXPORTING` | sections.length > 0 | exportReport() |
| `EXPORT_MODAL` | `SUBMIT` | `EXPORT_MODAL` | sections.length === 0 | showError('Select sections') |
| `EXPORT_MODAL` | `CANCEL` | `READY` | always | closeModal() |
| `EXPORTING` | `SUCCESS` | `READY` | always | downloadFile(url), closeModal() |
| `EXPORTING` | `ERROR` | `EXPORT_MODAL` | always | toast.error(err) |
| `ERROR` | `RETRY` | `LOADING` | always | clearError(), refetch() |

### 6.2 KPI Card State Machine

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `LOADING` | `DATA_LOADED` | `READY` | always | displayValue(value, change) |
| `READY` | `REFRESH` | `LOADING` | always | showSkeleton() |

### 6.3 Chart Card State Machine

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `LOADING` | `DATA_LOADED` | `READY` | always | renderChart(data) |
| `LOADING` | `FETCH_ERROR` | `ERROR` | always | showChartError() |
| `READY` | `REFRESH` | `LOADING` | always | showChartSkeleton() |
| `READY` | `HOVER` | `READY` | always | showTooltip(point) |
| `ERROR` | `RETRY` | `LOADING` | always | refetchChart() |

### 6.4 Date Range Picker State Machine

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `CLOSED` | `OPEN` | `SELECTING` | always | showPicker() |
| `SELECTING` | `SELECT_FROM` | `SELECTING` | always | setFromDate(date) |
| `SELECTING` | `SELECT_TO` | `SELECTING` | always | setToDate(date) |
| `SELECTING` | `APPLY` | `CLOSED` | from && to && from <= to | applyRange(from, to) |
| `SELECTING` | `APPLY` | `SELECTING` | !from || !to || from > to | showError('Invalid range') |
| `SELECTING` | `CANCEL` | `CLOSED` | always | resetSelection() |

### 6.5 Export Modal State Machine

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `CLOSED` | `OPEN` | `OPEN` | always | initExportOptions() |
| `OPEN` | `FORMAT_CHANGE` | `OPEN` | always | setFormat(format) |
| `OPEN` | `SECTION_TOGGLE` | `OPEN` | always | toggleSection(section) |
| `OPEN` | `SELECT_ALL` | `OPEN` | always | selectAllSections() |
| `OPEN` | `DESELECT_ALL` | `OPEN` | always | deselectAllSections() |
| `OPEN` | `SUBMIT` | `EXPORTING` | sections.length > 0 | startExport() |
| `OPEN` | `CANCEL` | `CLOSED` | always | - |
| `EXPORTING` | `SUCCESS` | `CLOSED` | always | downloadFile(url), toast.success() |
| `EXPORTING` | `ERROR` | `OPEN` | always | toast.error(err) |

---

## 7. Date Range Presets

| Preset | Range |
|--------|-------|
| Last 7 days | now - 7 days to now |
| Last 30 days | now - 30 days to now |
| Last 90 days | now - 90 days to now |
| This month | Start of month to now |
| Last month | Previous month start to end |
| This year | Start of year to now |
| Custom | User-selected from/to |

---

## 8. Chart Types

| Chart | Type | Data |
|-------|------|------|
| User Growth | Line | Total, New, Active users over time |
| Jobs Posted | Bar | Posted, Published, Filled counts |
| Applications | Area | Submitted, Accepted, Rejected |
| Job Functions | Pie/Donut | Distribution by function |

---

## 9. Export Options

### 9.1 Formats

| Format | Extension | Features |
|--------|-----------|----------|
| CSV | .csv | Raw data, all sections |
| Excel | .xlsx | Multiple sheets, charts |

### 9.2 Sections

| Section | Content |
|---------|---------|
| Users | User growth data |
| Jobs | Job posting data |
| Applications | Application metrics |
| Hires | Hiring conversion |

---

## 10. Implementation Checklist

### Phase 1: Layout
- [ ] Create analytics page
- [ ] Implement date range selector
- [ ] Create KPI card component
- [ ] Create chart card container

### Phase 2: Charts
- [ ] Implement line chart (User Growth)
- [ ] Implement bar chart (Jobs Posted)
- [ ] Implement area chart (Applications)
- [ ] Implement pie chart (Job Functions)

### Phase 3: Data
- [ ] Create analytics server actions
- [ ] Set up SWR hooks
- [ ] Implement date range filtering
- [ ] Add auto-refresh

### Phase 4: Export
- [ ] Create export modal
- [ ] Implement CSV export
- [ ] Implement Excel export
- [ ] Add download handling

---

## 11. Files to Create

| File | Purpose |
|------|---------|
| `src/app/(platform)/platform/analytics/page.tsx` | Page |
| `src/domains/admin/components/analytics/AnalyticsDashboard.tsx` | Dashboard |
| `src/domains/admin/components/analytics/DateRangeSelector.tsx` | Date picker |
| `src/domains/admin/components/analytics/KPICards.tsx` | KPI grid |
| `src/domains/admin/components/analytics/KPICard.tsx` | Single KPI |
| `src/domains/admin/components/analytics/ChartCard.tsx` | Chart container |
| `src/domains/admin/components/analytics/UserGrowthChart.tsx` | Line chart |
| `src/domains/admin/components/analytics/JobsPostedChart.tsx` | Bar chart |
| `src/domains/admin/components/analytics/ApplicationsChart.tsx` | Area chart |
| `src/domains/admin/components/analytics/JobFunctionsChart.tsx` | Pie chart |
| `src/domains/admin/components/analytics/ExportModal.tsx` | Export modal |
| `src/domains/admin/hooks/useAnalytics.ts` | Data hook |

---

*End of ADM-R07 Analytics Dashboard RIS v2.0*
