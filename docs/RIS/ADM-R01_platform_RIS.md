# ADM-R01: Platform Dashboard

**Document ID:** ADM-R01  
**Version:** 2.0  
**Status:** Complete  
**Created:** 2025-12-11  
**Route:** `/platform`  
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
| Error Handling | ADM-R00 Section 8 |

---

## 1. Route Metadata

| Property | Value |
|----------|-------|
| Route ID | ADM-R01 |
| Route Path | `/platform` |
| Shell | Platform Admin Shell |
| Purpose | Admin landing page with metrics and pending actions |
| Min Admin Level | staff |
| UI Spec | `07-platform-admin-routes.md` Section 8.1 |

---

## 2. Feature Mapping

| Feature ID | Feature Name | Coverage |
|------------|--------------|----------|
| ADMIN-001 | View Admin Dashboard | Full |
| ADMIN-033 | Get Dashboard Statistics | Full |

---

## 3. Page Layout

```
+------------------------------------------------------------------+
| Welcome Header                                                    |
| "Platform Admin" | [Admin Name] [Role Badge]                     |
+------------------------------------------------------------------+
| Quick Stats (4 cards)                                            |
| +------------+ +------------+ +------------+ +------------+      |
| | Companies  | | Candidates | | Jobs       | | Reports    |      |
| | 1,234      | | 5,678      | | 890        | | 12         |      |
| | +5% WoW    | | +12% WoW   | | -2% WoW    | | New        |      |
| +------------+ +------------+ +------------+ +------------+      |
+------------------------------------------------------------------+
| Pending Actions                                                   |
| +---------------------------+ +---------------------------+       |
| | Company Requests (5)      | | Content Reports (8)       |       |
| | [View All]                | | [View All]                |       |
| +---------------------------+ +---------------------------+       |
| +---------------------------+ +---------------------------+       |
| | Flagged Jobs (3)          | | Delete Requests (2)       |       |
| | [View All]                | | [SLA Warning Badge]       |       |
| +---------------------------+ +---------------------------+       |
+------------------------------------------------------------------+
| Quick Links                                                       |
| [Invite Staff] [Analytics] [Settings] [Send Notification]        |
+------------------------------------------------------------------+
```

---

## 4. Data Contract

### 4.1 Read Operations

| Data | Source | Refresh |
|------|--------|---------|
| Dashboard Stats | `getDashboardStats()` | 5 min |
| Pending Counts | `getPendingCounts()` | 1 min |
| Admin User | `adminUserAtom` | Session |

### 4.2 Dashboard Stats Shape

```typescript
interface DashboardStats {
  companies: {
    total: number;
    weekChange: number; // percentage
    weekChangeDirection: 'up' | 'down' | 'flat';
  };
  candidates: {
    total: number;
    weekChange: number;
    weekChangeDirection: 'up' | 'down' | 'flat';
  };
  jobs: {
    total: number;
    weekChange: number;
    weekChangeDirection: 'up' | 'down' | 'flat';
  };
  reports: {
    total: number;
    isNew: boolean;
  };
}
```

### 4.3 Pending Counts Shape

```typescript
interface PendingCounts {
  companyRequests: number;
  contentReports: number;
  flaggedJobs: number;
  deleteRequests: {
    count: number;
    slaBreach: number; // requests past SLA
  };
}
```

---

## 5. State Contract

### 5.1 Atoms Used

| Atom | Read | Write | Purpose |
|------|------|-------|---------|
| `adminUserAtom` | Yes | No | Current admin info |
| `adminLevelAtom` | Yes | No | Permission checks |
| `adminPendingCountsAtom` | Yes | Yes | Badge counts |

### 5.2 SWR Keys

```typescript
['admin', 'dashboard', 'stats']
['admin', 'dashboard', 'pending-counts']
```

---

## 6. UI State Machine

### 6.1 Dashboard Page State Machine

**States:** `INITIALIZING`, `LOADING`, `READY`, `REFRESHING`, `ERROR`

```
                    +------------------+
                    |   INITIALIZING   |
                    | (access check)   |
                    +--------+---------+
                             |
                    [ACCESS_GRANTED]
                             |
                             v
                    +------------------+
                    |     LOADING      |
                    | (fetch stats)    |
                    +--------+---------+
                             |
            +----------------+----------------+
            |                                 |
            v                                 v
    +---------------+                +----------------+
    |     ERROR     |                |     READY      |
    | (show error)  |                | (show content) |
    +-------+-------+                +-------+--------+
            |                                |
            v                        +-------+-------+
        [RETRY]                      |               |
            |                        v               v
            v                 [AUTO_REFRESH]  [MANUAL_REFRESH]
         LOADING                     |               |
                                     v               v
                              +----------------+
                              |   REFRESHING   |
                              | (update stats) |
                              +-------+--------+
                                      |
                              +-------+-------+
                              |               |
                              v               v
                           READY           ERROR
```

### 6.2 Dashboard Page Transition Table

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `INITIALIZING` | `ACCESS_GRANTED` | `LOADING` | hasAccess | fetchDashboardData() |
| `INITIALIZING` | `ACCESS_DENIED` | - | !hasAccess | router.replace('/403') |
| `LOADING` | `DATA_LOADED` | `READY` | always | setStats(data), setPendingCounts(counts) |
| `LOADING` | `FETCH_ERROR` | `ERROR` | always | setError(err) |
| `READY` | `AUTO_REFRESH` | `REFRESHING` | interval elapsed | silentRefetch() |
| `READY` | `MANUAL_REFRESH` | `REFRESHING` | user clicks refresh | refetch() |
| `READY` | `NAV_CLICK` | - | always | router.push(targetUrl) |
| `REFRESHING` | `DATA_LOADED` | `READY` | always | setStats(data) |
| `REFRESHING` | `FETCH_ERROR` | `READY` | always | toast.error('Refresh failed') |
| `ERROR` | `RETRY` | `LOADING` | always | clearError(), refetch() |

### 6.3 Stat Card State Machine

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `LOADING` | `DATA_LOADED` | `READY` | always | displayValue(value) |
| `READY` | `REFRESH` | `LOADING` | always | showSkeleton() |
| `READY` | `CLICK` | - | always | router.push(detailUrl) |

### 6.4 Pending Action Card State Machine

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `LOADING` | `DATA_LOADED` | `READY` | count > 0 | showCount(count) |
| `LOADING` | `DATA_LOADED` | `EMPTY` | count === 0 | showZeroState() |
| `READY` | `CLICK` | - | always | router.push(listUrl) |
| `EMPTY` | `CLICK` | - | always | router.push(listUrl) |

---

## 7. Component-Action Wiring

| Component | Trigger | Action | Effect |
|-----------|---------|--------|--------|
| Stat Card (Companies) | Click | Navigate | Go to /platform/companies |
| Stat Card (Candidates) | Click | Navigate | Go to /platform/candidates |
| Stat Card (Jobs) | Click | Navigate | Go to /platform/jobs |
| Stat Card (Reports) | Click | Navigate | Go to /platform/reports |
| Pending Card (Company Requests) | Click | Navigate | Go to /platform/companies?tab=pending |
| Pending Card (Content Reports) | Click | Navigate | Go to /platform/reports |
| Pending Card (Flagged Jobs) | Click | Navigate | Go to /platform/jobs?tab=reported |
| Pending Card (Delete Requests) | Click | Navigate | Go to /platform/users?tab=delete-requests |
| Quick Link (Invite Staff) | Click | Navigate | Go to /platform/users?action=invite |
| Quick Link (Analytics) | Click | Navigate | Go to /platform/analytics |
| Quick Link (Settings) | Click | Navigate | Go to /platform/settings |
| Quick Link (Send Notification) | Click | Navigate | Go to /platform/notifications?action=new |
| Refresh Button | Click | Refetch | Manual refresh of all stats |

---

## 8. Error Handling

| Error | Display | Action |
|-------|---------|--------|
| Stats fetch failed | Error card with retry | Show retry button |
| Partial data failure | Show available data | Toast error for failed section |
| Session expired | Redirect to login | router.replace('/auth/login') |

---

## 9. Refresh Intervals

| Data | Interval |
|------|----------|
| Dashboard Stats | 5 minutes |
| Pending Counts | 1 minute |

---

## 10. Implementation Checklist

### Phase 1: Layout
- [ ] Create dashboard page component
- [ ] Implement welcome header
- [ ] Create stat card component
- [ ] Create pending action card component
- [ ] Create quick links section

### Phase 2: Data
- [ ] Implement getDashboardStats server action
- [ ] Implement getPendingCounts server action
- [ ] Set up SWR hooks with refresh intervals
- [ ] Connect atoms for pending counts

### Phase 3: Interactions
- [ ] Wire navigation on card clicks
- [ ] Implement manual refresh
- [ ] Add loading skeletons
- [ ] Add error states

### Phase 4: Polish
- [ ] Add trend indicators (up/down arrows)
- [ ] Add SLA warning badges
- [ ] Optimize refresh performance
- [ ] Add analytics tracking

---

## 11. Files to Create

| File | Purpose |
|------|---------|
| `src/app/(platform)/platform/page.tsx` | Page component |
| `src/domains/admin/components/dashboard/DashboardStats.tsx` | Stats grid |
| `src/domains/admin/components/dashboard/StatCard.tsx` | Individual stat card |
| `src/domains/admin/components/dashboard/PendingActions.tsx` | Pending section |
| `src/domains/admin/components/dashboard/PendingCard.tsx` | Pending action card |
| `src/domains/admin/components/dashboard/QuickLinks.tsx` | Quick links section |
| `src/domains/admin/hooks/useDashboardStats.ts` | Stats data hook |
| `src/domains/admin/hooks/usePendingCounts.ts` | Counts data hook |

---

*End of ADM-R01 Platform Dashboard RIS v2.0*
