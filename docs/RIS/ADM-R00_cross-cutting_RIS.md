# ADM-R00: Platform Admin Cross-Cutting Specifications

**Document ID:** ADM-R00  
**Version:** 2.1  
**Status:** Complete  
**Created:** 2025-12-11  
**Last Updated:** 2025-12-11

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 2.1 | 2025-12-11 | Added UI State Machine sections with 5-column tables, English only |
| 2.0 | 2025-12-11 | Major revision: Added data schemas, server actions, role hierarchy |
| 1.0 | 2025-12-10 | Initial creation |

---

## Purpose

This document defines shared specifications, patterns, data schemas, and **state machines** that apply across all Platform Admin routes. **Claude Code should read this document first before implementing any ADM route.**

---

## Table of Contents

1. [Domain Overview](#1-domain-overview)
2. [Admin Shell Specification](#2-admin-shell-specification)
3. [Role Hierarchy and Permissions](#3-role-hierarchy-and-permissions)
4. [Access Control Framework](#4-access-control-framework)
5. [Global State Atoms](#5-global-state-atoms)
6. [SWR Key Conventions](#6-swr-key-conventions)
7. [Shared UI State Machines](#7-shared-ui-state-machines)
8. [Error Handling Standards](#8-error-handling-standards)
9. [Data Entity Schemas](#9-data-entity-schemas)
10. [Server Action Specifications](#10-server-action-specifications)

---

## 1. Domain Overview

### 1.1 Route Summary

| Route ID | Path | Purpose | Min Level |
|----------|------|---------|-----------|
| ADM-R01 | `/platform` | Dashboard home | staff |
| ADM-R02 | `/platform/companies` | Company management | staff |
| ADM-R03 | `/platform/candidates` | Candidate management | staff |
| ADM-R04 | `/platform/jobs` | Job moderation | staff |
| ADM-R05 | `/platform/reports` | Content reports | staff |
| ADM-R06 | `/platform/users` | User and role management | staff |
| ADM-R07 | `/platform/analytics` | Analytics dashboard | staff |
| ADM-R08 | `/platform/settings` | System settings | admin (system: super) |
| ADM-R09 | `/platform/logs` | Admin audit logs | super |
| ADM-R10 | `/platform/notifications` | Platform notifications | staff |

### 1.2 Desktop-Only Policy

The Admin interface is **desktop-only**. Mobile access is blocked.

```typescript
const ADMIN_MIN_WIDTH = 1024; // px

function AdminShell({ children }) {
  const isMobile = useMediaQuery('(max-width: 1023px)');
  if (isMobile) return <AdminMobileBlocker />;
  return <AdminLayout>{children}</AdminLayout>;
}
```

---

## 2. Admin Shell Specification

### 2.1 Shell Layout

```
+-------------------------------------------------------------------------+
| [Logo]  ChanceDee Admin                    [Search] [User Name v]       |
+--------------------+----------------------------------------------------+
|                    |                                                    |
|  Dashboard         |                                                    |
|  Companies    (5)  |              Main Content Area                     |
|  Candidates        |                                                    |
|  Jobs         (3)  |              (Route-specific content)              |
|  Reports      (8)  |                                                    |
|  Users             |                                                    |
|  Analytics         |                                                    |
|  ----------        |                                                    |
|  Notifications     |                                                    |
|  Settings          |                                                    |
|  Logs         [S]  |  [S] = Super-Admin only                            |
|                    |                                                    |
+--------------------+----------------------------------------------------+
```

### 2.2 Shell Properties

| Property | Value |
|----------|-------|
| Sidebar Width | 280px fixed |
| Header Height | 64px |
| Content Padding | 24px |
| Theme | Purple accent (#7C3AED) |
| Background | Gray-50 (#F9FAFB) |

### 2.3 Pending Count Badges

| Nav Item | Badge Shows | Data Source |
|----------|-------------|-------------|
| Companies | Pending requests | `company_requests WHERE status = 'pending'` |
| Jobs | Reported jobs | `content_reports WHERE targetType = 'job' AND status = 'pending'` |
| Reports | Pending reports | `content_reports WHERE status = 'pending'` |

---

## 3. Role Hierarchy and Permissions

### 3.1 Admin Levels

| Level | Code | Description |
|-------|------|-------------|
| Staff | `staff` | Operations team - view and moderate content |
| Admin | `admin` | Platform admin - full management except system |
| Super-Admin | `super` | Full access including system settings and audit |

### 3.2 Permission Matrix

| Feature | Staff | Admin | Super |
|---------|-------|-------|-------|
| View Dashboard | Yes | Yes | Yes |
| Manage Companies | Yes | Yes | Yes |
| Manage Candidates | Yes | Yes | Yes |
| Moderate Jobs | Yes | Yes | Yes |
| Handle Reports | Yes | Yes | Yes |
| View Analytics | Yes | Yes | Yes |
| Send Notifications | Yes | Yes | Yes |
| Manage Master Data | No | Yes | Yes |
| Manage Loyalty | No | Yes | Yes |
| Invite Staff | No | Yes | Yes |
| View Audit Logs | No | No | Yes |
| System Settings | No | No | Yes |
| Delete Accounts | No | No | Yes |
| Promote Admin Levels | No | No | Yes |

### 3.3 Permission Check Helper

```typescript
function requireAdminLevel(required: AdminLevel, current: AdminLevel): boolean {
  const levels = { staff: 1, admin: 2, super: 3 };
  return levels[current] >= levels[required];
}
```

---

## 4. Access Control Framework

### 4.1 Authentication Requirements

| Property | Value |
|----------|-------|
| Session Duration | 5 days |
| Required Role | `chancedee` in user_accounts.roles |
| 2FA Required | Yes (production) |
| Session Storage | Firebase Auth + httpOnly cookie |

---

## 5. Global State Atoms

### 5.1 Admin Atoms

```typescript
// src/domains/admin/atoms/admin-atoms.ts

export const adminUserAtom = atom<AdminUserInfo | null>(null);

export const adminLevelAtom = atom((get) => {
  const user = get(adminUserAtom);
  return user?.adminLevel || 'staff';
});

export const adminSidebarCollapsedAtom = atom<boolean>(false);

export const adminPendingCountsAtom = atom<{
  companies: number;
  jobs: number;
  reports: number;
}>({ companies: 0, jobs: 0, reports: 0 });

export const adminSelectedItemsAtom = atom<string[]>([]);

export const adminBulkModeAtom = atom<boolean>(false);
```

---

## 6. SWR Key Conventions

### 6.1 Key Patterns

```typescript
// Pattern: ['admin', domain, action, ...params]

// Dashboard
['admin', 'dashboard', 'stats']
['admin', 'dashboard', 'pending-counts']

// Companies
['admin', 'companies', 'list', { page, filters }]
['admin', 'companies', 'detail', companyId]
['admin', 'companies', 'screening', companyId]

// Candidates
['admin', 'candidates', 'list', { page, filters }]
['admin', 'candidates', 'detail', candidateId]

// Jobs
['admin', 'jobs', 'list', { page, filters }]
['admin', 'jobs', 'detail', jobId]

// Reports
['admin', 'reports', 'list', { status, page }]
['admin', 'reports', 'detail', reportId]

// Users
['admin', 'users', 'list', { page, filters }]
['admin', 'users', 'detail', userId]
['admin', 'users', 'delete-requests', { status }]

// Analytics
['admin', 'analytics', 'dashboard', { dateRange }]

// Settings
['admin', 'settings', 'master-data', category]
['admin', 'settings', 'loyalty']
['admin', 'settings', 'system']

// Logs
['admin', 'logs', 'list', { filters, page }]

// Notifications
['admin', 'notifications', 'list', { status, page }]
```

---

## 7. Shared UI State Machines

### 7.1 Admin Access Control State Machine

This state machine applies to the Admin Shell and controls access to all admin routes.

**States:** `INITIALIZING`, `NO_SESSION`, `LOADING`, `AUTHORIZED`, `UNAUTHORIZED`, `ROLE_CHECK`, `READY`, `FEATURE_BLOCKED`, `ERROR`

#### Access Control Transition Table

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `INITIALIZING` | `SESSION_MISSING` | `NO_SESSION` | sessionState !== 'valid' | - |
| `INITIALIZING` | `SESSION_FOUND` | `LOADING` | sessionState === 'valid' | fetchAdminUser() |
| `INITIALIZING` | `SESSION_ERROR` | `ERROR` | fetch throws | setError(err) |
| `NO_SESSION` | `AUTO_REDIRECT` | - | always | router.replace('/auth/login') |
| `LOADING` | `USER_LOADED` | `AUTHORIZED` | user.roles.includes('chancedee') | setAdminUser(user) |
| `LOADING` | `USER_LOADED` | `UNAUTHORIZED` | !user.roles.includes('chancedee') | - |
| `LOADING` | `FETCH_ERROR` | `ERROR` | always | setError(err) |
| `UNAUTHORIZED` | `AUTO_REDIRECT` | - | always | router.replace('/403') |
| `AUTHORIZED` | `CHECK_PERMISSION` | `ROLE_CHECK` | always | checkAdminLevel(route) |
| `ROLE_CHECK` | `PERMISSION_GRANTED` | `READY` | hasRequiredLevel | - |
| `ROLE_CHECK` | `PERMISSION_DENIED` | `FEATURE_BLOCKED` | !hasRequiredLevel | - |
| `ERROR` | `RETRY` | `INITIALIZING` | always | clearError() |

---

### 7.2 Shared List Page State Machine

Used by: ADM-R02, ADM-R03, ADM-R04, ADM-R05, ADM-R06, ADM-R09, ADM-R10

**States:** `LOADING`, `EMPTY`, `READY`, `FILTERING`, `SELECTING`, `SELECTED`, `BULK_ACTION`, `PROCESSING`, `ERROR`

#### List Page Transition Table

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `LOADING` | `DATA_LOADED` | `READY` | items.length > 0 | setItems(items) |
| `LOADING` | `DATA_LOADED` | `EMPTY` | items.length === 0 | - |
| `LOADING` | `FETCH_ERROR` | `ERROR` | always | setError(err), toast.error() |
| `READY` | `CHANGE_FILTER` | `FILTERING` | always | - |
| `READY` | `CHANGE_TAB` | `FILTERING` | always | setActiveTab(tab) |
| `READY` | `SEARCH` | `FILTERING` | always | setSearchQuery(q) |
| `FILTERING` | `FILTER_APPLIED` | `LOADING` | always | resetPagination(), refetch() |
| `READY` | `SELECT_ITEM` | `SELECTING` | always | addToSelection(id) |
| `SELECTING` | `SELECT_ITEM` | `SELECTING` | always | toggleSelection(id) |
| `SELECTING` | `SELECT_ALL` | `SELECTED` | always | selectAllVisible() |
| `SELECTING` | `DESELECT_ALL` | `READY` | always | clearSelection() |
| `SELECTED` | `BULK_ACTION` | `BULK_ACTION` | selectedCount > 0 | openConfirmModal() |
| `BULK_ACTION` | `CONFIRM` | `PROCESSING` | always | executeBulkAction() |
| `BULK_ACTION` | `CANCEL` | `SELECTED` | always | closeModal() |
| `PROCESSING` | `SUCCESS` | `READY` | always | toast.success(), refetch(), clearSelection() |
| `PROCESSING` | `ERROR` | `SELECTED` | always | toast.error(err) |
| `READY` | `ROW_CLICK` | - | always | router.push(detailUrl) |
| `READY` | `PAGE_CHANGE` | `LOADING` | always | setPage(n), refetch() |
| `EMPTY` | `CHANGE_FILTER` | `FILTERING` | always | - |
| `ERROR` | `RETRY` | `LOADING` | always | clearError(), refetch() |

---

### 7.3 Shared Detail Page State Machine

Used by: ADM-R02, ADM-R03, ADM-R04, ADM-R06 (detail views)

**States:** `LOADING`, `NOT_FOUND`, `READY`, `ACTION_MODAL`, `CONFIRMING`, `SAVING`, `EXECUTING`, `ERROR`

#### Detail Page Transition Table

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `LOADING` | `DATA_LOADED` | `READY` | entity !== null | setEntity(data) |
| `LOADING` | `NOT_FOUND` | `NOT_FOUND` | entity === null | - |
| `LOADING` | `FETCH_ERROR` | `ERROR` | always | setError(err) |
| `NOT_FOUND` | `GO_BACK` | - | always | router.push(listUrl) |
| `READY` | `TAB_CHANGE` | `READY` | always | setActiveTab(tab) |
| `READY` | `ACTION_CLICK` | `ACTION_MODAL` | !isDestructive | openModal(action) |
| `READY` | `ACTION_CLICK` | `CONFIRMING` | isDestructive | openConfirmDialog() |
| `ACTION_MODAL` | `SUBMIT` | `SAVING` | form.isValid | executeAction() |
| `ACTION_MODAL` | `CANCEL` | `READY` | always | closeModal() |
| `SAVING` | `SUCCESS` | `READY` | always | toast.success(), refetch(), closeModal() |
| `SAVING` | `ERROR` | `ACTION_MODAL` | always | toast.error(err), setFormError() |
| `CONFIRMING` | `CONFIRM` | `EXECUTING` | always | executeDestructiveAction() |
| `CONFIRMING` | `CANCEL` | `READY` | always | closeDialog() |
| `EXECUTING` | `SUCCESS` | `READY` | !shouldRedirect | toast.success(), refetch() |
| `EXECUTING` | `SUCCESS` | - | shouldRedirect | toast.success(), router.push(listUrl) |
| `EXECUTING` | `ERROR` | `READY` | always | toast.error(err) |
| `ERROR` | `RETRY` | `LOADING` | always | clearError(), refetch() |

---

### 7.4 Shared Action Modal State Machine

Used for: Suspend, Reject, Approve, Delete, Edit modals across all admin routes

**States:** `CLOSED`, `OPEN`, `VALIDATING`, `SUBMITTING`

#### Action Modal Transition Table

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `CLOSED` | `OPEN_MODAL` | `OPEN` | always | initForm(defaults), setTargetEntity(entity) |
| `OPEN` | `INPUT_CHANGE` | `OPEN` | always | updateField(name, value) |
| `OPEN` | `BLUR` | `VALIDATING` | always | validateField(name) |
| `VALIDATING` | `VALID` | `OPEN` | validation passes | clearFieldError(name) |
| `VALIDATING` | `INVALID` | `OPEN` | validation fails | setFieldError(name, err) |
| `OPEN` | `CANCEL` | `CLOSED` | always | resetForm() |
| `OPEN` | `SUBMIT` | `SUBMITTING` | form.isValid | - |
| `OPEN` | `SUBMIT` | `OPEN` | !form.isValid | showValidationErrors() |
| `SUBMITTING` | `SUCCESS` | `CLOSED` | always | toast.success(), onSuccess(), resetForm() |
| `SUBMITTING` | `ERROR` | `OPEN` | always | toast.error(err), setSubmitError(err) |

---

### 7.5 Confirmation Dialog State Machine

Used for destructive actions (delete, suspend, etc.)

**States:** `HIDDEN`, `VISIBLE`, `PROCESSING`

#### Confirmation Dialog Transition Table

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `HIDDEN` | `SHOW` | `VISIBLE` | always | setMessage(msg), setAction(action) |
| `VISIBLE` | `CONFIRM` | `PROCESSING` | always | executeAction() |
| `VISIBLE` | `CANCEL` | `HIDDEN` | always | - |
| `PROCESSING` | `SUCCESS` | `HIDDEN` | always | onConfirm(), toast.success() |
| `PROCESSING` | `ERROR` | `VISIBLE` | always | showError(err) |

---

## 8. Error Handling Standards

### 8.1 Error Types

| Code | Message | When |
|------|---------|------|
| `UNAUTHORIZED` | Not authorized | No admin session |
| `INSUFFICIENT_ROLE` | Insufficient permissions | Admin level too low |
| `NOT_FOUND` | Data not found | Entity does not exist |
| `VALIDATION_ERROR` | Invalid data | Input validation failed |
| `CONFLICT` | Data conflict | State conflict |
| `SELF_ACTION_BLOCKED` | Cannot perform action on yourself | Trying to modify own account |
| `LAST_ADMIN_BLOCKED` | Cannot remove last admin | Would remove last super-admin |
| `IN_USE` | Data is in use | Cannot delete referenced data |

### 8.2 Toast Messages

```typescript
// Success patterns
toast.success('Company approved successfully');
toast.success('Account suspended');
toast.success('Changes saved');

// Error patterns
toast.error('An error occurred. Please try again.');
toast.error('Permission denied');

// Warning patterns
toast.warning('Please select at least one item');

// Info patterns
toast.info('Processing...');
```

---

## 9. Data Entity Schemas

### 9.1 Company Screening

**Collection:** `company_screening`  
**Document ID:** `{companyId}`

```typescript
interface CompanyScreening {
  uid: string;
  createdBy: string;
  updatedBy: string;
  createdAt: number;
  updatedAt: number;
  profileStatus: 'verified' | 'unverified' | 'flagged' | 'suspended';
  flagCount: number;
  riskScore: number; // 0-100
  documentVerification: boolean;
  addressVerification: boolean;
  lastActive: number;
  totalJobsPosted: number;
  totalJobsRemoved: number;
  suspiciousTextFlags: number;
}
```

**Risk Score Impact:**

| Event | Score Change |
|-------|--------------|
| Report received | +5 to +20 (based on severity) |
| Suspicious text detected | +10 |
| Job removed by admin | +15 |
| Account suspended | +50 |
| Account reactivated | -25 |
| 30 days clean | -5 (min 0) |

### 9.2 Admin Audit Logs

**Collection:** `admin_audit_logs`

```typescript
interface AdminAuditLog {
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

**Retention Policy:**

| Severity | Retention |
|----------|-----------|
| info | 90 days |
| warning | 180 days |
| critical | 365 days |

### 9.3 Content Reports

**Collection:** `content_reports`

```typescript
interface ContentReport {
  uid: string;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  targetType: 'job' | 'company' | 'message';
  targetId: string;
  targetOwnerId: string;
  targetOwnerType: 'company' | 'candidate';
  targetSnapshot?: {
    title?: string;
    content?: string;
    imageUrl?: string;
  };
  reason: ReportReason;
  reasonDetail?: string;
  severity: 'low' | 'medium' | 'high';
  reporter: {
    uid: string;
    type: 'candidate' | 'company' | 'admin';
    email?: string;
  };
  status: 'pending' | 'reviewing' | 'dismissed' | 'resolved';
  assignedTo?: string;
  reviewedBy?: string;
  reviewedAt?: number;
  resolution?: string;
  actionTaken?: string;
}

type ReportReason = 
  | 'scam' 
  | 'harassment' 
  | 'inappropriate_content' 
  | 'discrimination' 
  | 'misleading' 
  | 'spam' 
  | 'other';
```

**Severity Auto-Assignment:**

| Reason | Severity |
|--------|----------|
| scam | high |
| harassment | high |
| discrimination | high |
| inappropriate_content | medium |
| misleading | medium |
| spam | low |
| other | low |

### 9.4 Platform Notifications

**Collection:** `platform_notifications`

```typescript
interface PlatformNotification {
  uid: string;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  title: string;
  message: string;
  imageUrl?: string;
  actionUrl?: string;
  audience: {
    type: 'all' | 'role' | 'segment';
    roles?: ('candidate' | 'company')[];
    segmentQuery?: {
      filters: Record<string, any>;
      estimatedCount?: number;
    };
  };
  recipientCount: number;
  channels: ('push' | 'in_app' | 'email')[];
  scheduledAt?: number;
  distributionTime?: string; // e.g., "2h" for spread over 2 hours
  sentAt?: number;
  status: NotificationStatus;
  deliveryStats?: {
    push: { sent: number; delivered: number; failed: number };
    email: { sent: number; opened: number; bounced: number };
    inApp: { created: number; read: number };
  };
}

type NotificationStatus = 
  | 'draft' 
  | 'scheduled' 
  | 'sending' 
  | 'sent' 
  | 'cancelled' 
  | 'failed';
```

### 9.5 Delete Requests (Updates)

**Collection:** `delete_requests` (existing, with new fields)

```typescript
interface DeleteRequest {
  uid: string;
  userId: string;
  userEmail: string;
  userName: string;
  requestCode: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: number;
  documents: string[];
  // NEW FIELDS
  processedBy?: string;
  processedAt?: number;
  rejectionReason?: string;
  canResubmitAfter?: number; // timestamp, 30 days after rejection
  deletionScheduledAt?: number; // 90 days after approval
  deletionCompletedAt?: number;
}
```

**SLA:** 14 days to process from submission

---

## 10. Server Action Specifications

### 10.1 Company Screening Actions

```typescript
async function initializeCompanyScreening(
  companyId: string, 
  actorId: string
): Promise<void>;

async function updateCompanyRiskScore(
  companyId: string, 
  delta: number, 
  reason: string, 
  actorId: string
): Promise<{ newScore: number }>;

async function suspendCompany(
  companyId: string, 
  reason: string, 
  duration: '7_days' | '30_days' | '90_days' | 'permanent', 
  actorId: string
): Promise<void>;

async function reactivateCompany(
  companyId: string, 
  note: string, 
  actorId: string
): Promise<void>;

async function getCompanyScreening(
  companyId: string
): Promise<CompanyScreening | null>;
```

### 10.2 Admin Audit Actions

```typescript
async function logAdminAction(
  actor: { uid: string; email: string; displayName: string; role: AdminLevel },
  action: string,
  category: AdminActionCategory,
  entity: { type: string; id: string; name?: string },
  options?: {
    changes?: { field: string; before: any; after: any }[];
    reason?: string;
    severity?: 'info' | 'warning' | 'critical';
  }
): Promise<string>; // returns log ID

async function queryAdminAuditLogs(
  filters: {
    dateFrom?: number;
    dateTo?: number;
    actorId?: string;
    category?: AdminActionCategory;
    severity?: string;
    search?: string;
  },
  pagination: { limit: number; cursor?: string },
  actorId: string // must be super admin
): Promise<{ logs: AdminAuditLog[]; nextCursor?: string; total: number }>;

async function exportAdminAuditLogs(
  filters: { dateFrom: number; dateTo: number },
  format: 'csv' | 'xlsx',
  actorId: string
): Promise<{ downloadUrl: string; expiresAt: number }>;
```

### 10.3 Content Report Actions

```typescript
async function submitContentReport(
  targetType: 'job' | 'company' | 'message',
  targetId: string,
  reason: ReportReason,
  reasonDetail: string | undefined,
  reporterId: string,
  reporterType: 'candidate' | 'company'
): Promise<{ reportId: string }>;

async function getContentReports(
  filters: {
    status?: string;
    targetType?: string;
    severity?: string;
    search?: string;
  },
  pagination: { limit: number; cursor?: string },
  actorId: string
): Promise<{ 
  reports: ContentReport[]; 
  nextCursor?: string; 
  counts: { pending: number; reviewing: number; today: number } 
}>;

async function startReportReview(
  reportId: string, 
  actorId: string
): Promise<void>;

async function dismissReport(
  reportId: string, 
  reason: string, 
  actorId: string
): Promise<void>;

async function resolveReport(
  reportId: string,
  actionTaken: string,
  additionalActions: { 
    suspendTarget?: boolean; 
    removeContent?: boolean; 
    warnTarget?: boolean 
  },
  actorId: string
): Promise<void>;
```

### 10.4 Platform Notification Actions

```typescript
async function createPlatformNotification(
  data: {
    title: string;
    message: string;
    imageUrl?: string;
    actionUrl?: string;
    audience: PlatformNotification['audience'];
    channels: ('push' | 'in_app' | 'email')[];
    scheduledAt?: number;
    distributionTime?: string;
  },
  actorId: string
): Promise<{ notificationId: string; recipientCount: number }>;

async function getNotificationRecipientCount(
  audience: PlatformNotification['audience']
): Promise<number>;

async function getPlatformNotifications(
  filters: { status?: NotificationStatus },
  pagination: { limit: number; cursor?: string },
  actorId: string
): Promise<{ notifications: PlatformNotification[]; nextCursor?: string }>;

async function sendPlatformNotificationNow(
  notificationId: string, 
  actorId: string
): Promise<void>;

async function cancelPlatformNotification(
  notificationId: string, 
  actorId: string
): Promise<void>;
```

### 10.5 Delete Request Actions

```typescript
async function getDeleteRequests(
  filters: { status?: string },
  pagination: { limit: number; cursor?: string },
  actorId: string
): Promise<{ 
  requests: DeleteRequest[]; 
  nextCursor?: string; 
  counts: { pending: number; approved: number; rejected: number }; 
  slaBreach: number 
}>;

async function approveDeleteRequest(
  requestId: string, 
  actorId: string
): Promise<void>;
// Side effects: 
// - Set deletionScheduledAt = now + 90 days
// - Send confirmation email
// - Log audit action

async function rejectDeleteRequest(
  requestId: string, 
  reason: string, 
  actorId: string
): Promise<void>;
// Side effects:
// - Set canResubmitAfter = now + 30 days
// - Send rejection email with reason
// - Log audit action
```

---

## Appendix A: TypeScript Types

```typescript
export type AdminLevel = 'staff' | 'admin' | 'super';

export type SuspensionDuration = '7_days' | '30_days' | '90_days' | 'permanent';

export interface AdminUserInfo {
  uid: string;
  email: string;
  displayName: string;
  adminLevel: AdminLevel;
  avatarUrl?: string;
}

export interface ListPageState {
  items: any[];
  loading: boolean;
  error: Error | null;
  page: number;
  totalPages: number;
  filters: Record<string, any>;
  selectedIds: string[];
  bulkActionOpen: boolean;
}

export interface DetailPageState {
  entity: any | null;
  loading: boolean;
  error: Error | null;
  activeTab: string;
  modalOpen: boolean;
  confirmOpen: boolean;
  saving: boolean;
}
```

---

## Appendix B: Route Cross-Reference

| Route | Primary Data | Shared State Machines Used |
|-------|--------------|---------------------------|
| ADM-R01 | Aggregated stats | Access Control |
| ADM-R02 | company_information, company_screening | Access Control, List Page, Detail Page, Action Modal |
| ADM-R03 | candidate_information | Access Control, List Page, Detail Page, Action Modal |
| ADM-R04 | web_jobs, content_reports | Access Control, List Page, Detail Page, Action Modal |
| ADM-R05 | content_reports | Access Control, List Page, Action Modal |
| ADM-R06 | user_accounts, delete_requests | Access Control, List Page, Detail Page, Action Modal |
| ADM-R07 | Aggregated analytics | Access Control |
| ADM-R08 | master_*, system_settings | Access Control, Action Modal |
| ADM-R09 | admin_audit_logs | Access Control, List Page |
| ADM-R10 | platform_notifications | Access Control, List Page, Action Modal |

---

*End of ADM-R00 Cross-Cutting Specifications v2.1*
