# BLS-12: Admin Stage

**Stage:** Platform Admin  
**Version:** 1.0  
**Last Updated:** 2025-12-11  
**Actions Count:** 18

---

## Stage Overview

The Admin Stage provides platform administration, moderation, and system management features. Restricted exclusively to users with the `chancedee` role (platform administrators). Desktop-only interface with comprehensive audit logging.

### Stage Boundaries

| Aspect | Scope |
|--------|-------|
| **Enters from** | Admin login, `/platform` routes |
| **Triggered by** | User reports, company requests, delete requests |
| **Primary Actors** | Staff, Admin, Super-Admin |
| **Data Sources** | Multiple collections (companies, candidates, jobs, reports, logs) |

### Admin Levels

| Level | Code | Permissions |
|-------|------|-------------|
| Staff | `staff` | View, moderate content |
| Admin | `admin` | Full management except system |
| Super-Admin | `super` | Full access including audit logs, system settings |

### Actions in This Stage

| Action ID | Action Name | Min Level | Primary Collection |
|-----------|-------------|-----------|-------------------|
| **Company Management** |
| BLS-12-01 | reviewCompanyRequests | staff | `company_requests` |
| BLS-12-02 | approveCompany | staff | `company_information` |
| BLS-12-03 | rejectCompany | staff | `company_information` |
| BLS-12-04 | suspendCompany | admin | `company_information` |
| **User Management** |
| BLS-12-05 | manageUserRoles | admin | `user_accounts` |
| BLS-12-06 | suspendUser | admin | `user_accounts` |
| BLS-12-07 | reviewDeleteRequests | super | `delete_requests` |
| BLS-12-08 | processAccountDeletion | super | `user_accounts` |
| **Content Moderation** |
| BLS-12-09 | reviewContentReports | staff | `content_reports` |
| BLS-12-10 | moderateJob | staff | `jobs` |
| **Wallet Management** |
| BLS-12-11 | searchWallets | admin | `pockets` |
| BLS-12-12 | adminDepositWithdraw | admin | `wallet_transactions` |
| **System Management** |
| BLS-12-13 | manageMasterData | admin | `master_*` |
| BLS-12-14 | sendPlatformNotification | staff | `platform_notifications` |
| BLS-12-15 | inviteStaff | admin | `admin_invitations` |
| BLS-12-16 | viewAuditLogs | super | `admin_audit_logs` |
| **Analytics** |
| BLS-12-17 | viewDashboardStats | staff | Aggregation |
| BLS-12-18 | viewAnalytics | staff | Aggregation |

---

## Admin Shell

### Desktop-Only Policy

```typescript
const ADMIN_MIN_WIDTH = 1024; // px

function AdminShell({ children }) {
  const isMobile = useMediaQuery('(max-width: 1023px)');
  if (isMobile) return <AdminMobileBlocker />;
  return <AdminLayout>{children}</AdminLayout>;
}
```

### Shell Layout

```
+-------------------------------------------------------------------------+
| [Logo]  ChanceDee Admin                    [Search] [User Name ▼]       |
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
|  Settings     [A]  |  [A] = Admin level required                        |
|  Logs         [S]  |  [S] = Super-Admin only                            |
|                    |                                                    |
+--------------------+----------------------------------------------------+
```

### Pending Count Badges

| Nav Item | Badge Shows | Query |
|----------|-------------|-------|
| Companies | Pending requests | `company_requests WHERE status = 'pending'` |
| Jobs | Reported jobs | `content_reports WHERE targetType = 'job' AND status = 'pending'` |
| Reports | Pending reports | `content_reports WHERE status = 'pending'` |

---

## BLS-12-01: reviewCompanyRequests

### Description
View and filter pending company registration requests.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| ADM-R02 | Full | Company management |
| features_admin.md | ADMIN-002 | View Company Requests |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | Admin authenticated | `chancedee` role | Redirect to login |
| 2 | Min level: staff | Level check | 403 |

### Route
**Path:** `/platform/companies`

### Data Query
```typescript
async function getCompanyRequests(
  filters: { status?: 'pending' | 'approved' | 'rejected' },
  pagination: { limit: number; cursor?: string }
): Promise<{ requests: CompanyRequest[]; nextCursor?: string }>;
```

### State Changes

**SWR Cache:**
| Key Pattern | Data Shape |
|-------------|------------|
| `['admin', 'companies', 'list', { page, filters }]` | `CompanyRequest[]` |

### UI Elements
| Element | Description |
|---------|-------------|
| Status filter tabs | Pending / Approved / Rejected |
| Company cards | Logo, name, industry, request date |
| Action buttons | Approve / Reject |

---

## BLS-12-02: approveCompany

### Description
Approve a pending company registration request. Updates status and sends notification.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| features_admin.md | ADMIN-003 | Approve Company |
| features_companies.md | COMP-008 | Company approval |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | Min level: staff | Level check | 403 |
| 2 | Company status pending | `status === 'pending'` | Error toast |

### State Changes

**Firestore:**
| Operation | Collection | Document ID | Fields |
|-----------|------------|-------------|--------|
| Update | `company_requests` | requestId | `status: 'approved'`, `processed_at`, `processed_by` |
| Update | `company_information` | companyId | `status: 'approved'` |

**Side Effects:**
| Effect | Target | Description |
|--------|--------|-------------|
| Email | Company admin | Approval notification |
| Audit log | `admin_audit_logs` | Action recorded |

### Server Action
```typescript
async function approveCompanyRequest(
  requestId: string,
  actorId: string
): Promise<ActionResult>;
```

### UI Feedback
| Scenario | Feedback Type | Display |
|----------|---------------|---------|
| Approving | Button loading | Spinner |
| Success | Toast + list update | "อนุมัติบริษัทสำเร็จ" |
| Error | Error toast | Error message |

---

## BLS-12-03: rejectCompany

### Description
Reject a pending company registration with reason.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| features_admin.md | ADMIN-004 | Reject Company |
| features_companies.md | COMP-009 | Company rejection |

### Inputs
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| requestId | string | Yes | Valid request ID |
| reason | string | Yes | Non-empty, max 500 chars |

### State Changes

**Firestore:**
| Operation | Collection | Document ID | Fields |
|-----------|------------|-------------|--------|
| Update | `company_requests` | requestId | `status: 'rejected'`, `rejection_reason`, `processed_at`, `processed_by` |
| Update | `company_information` | companyId | `status: 'rejected'` |

**Side Effects:**
| Effect | Target | Description |
|--------|--------|-------------|
| Email | Company admin | Rejection notification with reason |
| Audit log | `admin_audit_logs` | Action recorded |

### Server Action
```typescript
async function rejectCompanyRequest(
  requestId: string,
  reason: string,
  actorId: string
): Promise<ActionResult>;
```

---

## BLS-12-04: suspendCompany

### Description
Suspend a company account for violations. All job postings hidden.

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | Min level: admin | Level check | 403 |
| 2 | Company active | `status === 'approved'` | Error |

### Inputs
| Field | Type | Required | Options |
|-------|------|----------|---------|
| companyId | string | Yes | Valid company ID |
| reason | string | Yes | Suspension reason |
| duration | string | Yes | '7_days' \| '30_days' \| '90_days' \| 'permanent' |

### State Changes

**Firestore:**
| Operation | Collection | Document ID | Fields |
|-----------|------------|-------------|--------|
| Update | `company_information` | companyId | `status: 'suspended'`, `suspension_reason`, `suspension_ends_at` |
| Create | `suspension_records` | Auto | Full suspension record |
| Update | `jobs` (batch) | Company's jobs | `status: 'hidden'` |

### Server Action
```typescript
async function suspendCompany(
  companyId: string,
  reason: string,
  duration: SuspensionDuration,
  actorId: string
): Promise<void>;

async function reactivateCompany(
  companyId: string,
  note: string,
  actorId: string
): Promise<void>;
```

---

## BLS-12-05: manageUserRoles

### Description
Add, remove, or modify user roles. Includes admin role toggle and company assignment.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| features_admin.md | ADMIN-015 to ADMIN-024 | Role management |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | Min level: admin | Level check | 403 |
| 2 | Not self-modify | `targetId !== actorId` | Error "Cannot modify own roles" |

### Role Operations
| Operation | Server Action | Effect |
|-----------|---------------|--------|
| Add role | `adminAddUserRole` | Append to roles array |
| Remove role | `adminRemoveUserRole` | Remove from roles array |
| Set all roles | `adminSetUserRoles` | Replace entire array |
| Toggle admin | `adminToggleAdminRole` | Add/remove 'chancedee' |
| Strip to candidate | `adminStripToCandidateRole` | Set roles to ['candidate'] only |
| Assign to company | `adminAssignToCompany` | Add company role + companyId |

### State Changes

**Firestore:**
| Operation | Collection | Document ID | Fields |
|-----------|------------|-------------|--------|
| Update | `user_accounts` | userId | `roles` array |
| Update | `user_info` | userId | `company_id` (if assigning) |

### Server Actions
```typescript
async function adminAddUserRole(userId: string, role: string, actorId: string): Promise<void>;
async function adminRemoveUserRole(userId: string, role: string, actorId: string): Promise<void>;
async function adminSetUserRoles(userId: string, roles: string[], actorId: string): Promise<void>;
async function adminToggleAdminRole(userId: string, actorId: string): Promise<void>;
async function adminStripToCandidateRole(userId: string, actorId: string): Promise<void>;
async function adminAssignToCompany(userId: string, companyId: string, role: string, actorId: string): Promise<void>;
```

---

## BLS-12-06: suspendUser

### Description
Suspend or reactivate a user account.

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | Min level: admin | Level check | 403 |
| 2 | Not self | `userId !== actorId` | Error |

### State Changes

**Firestore:**
| Operation | Collection | Document ID | Fields |
|-----------|------------|-------------|--------|
| Update | `user_accounts` | userId | `is_active: false`, `status: 'suspended'` |
| Create | `suspension_records` | Auto | Suspension details |

### Server Actions
```typescript
async function adminSuspendUser(
  userId: string,
  reason: string,
  duration: SuspensionDuration,
  actorId: string
): Promise<void>;

async function adminReactivateUser(
  userId: string,
  note: string,
  actorId: string
): Promise<void>;
```

---

## BLS-12-07: reviewDeleteRequests

### Description
View and process account deletion requests. Super-admin only.

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | Min level: super | Level check | 403 |

### Route
**Path:** `/platform/users?tab=delete-requests`

### Data Query
```typescript
async function getDeleteRequests(
  filters: { status?: 'pending' | 'approved' | 'rejected' },
  pagination: { limit: number; cursor?: string }
): Promise<{ 
  requests: DeleteRequest[]; 
  counts: { pending: number; approved: number; rejected: number };
  slaBreach: number;  // Requests past 14-day SLA
}>;
```

### Delete Request Schema
```typescript
interface DeleteRequest {
  uid: string;
  userId: string;
  userEmail: string;
  userName: string;
  reason: string;
  documentUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: number;
  processedBy?: string;
  processedAt?: number;
  rejectionReason?: string;
  deletionScheduledAt?: number;  // 90 days after approval
}
```

---

## BLS-12-08: processAccountDeletion

### Description
Approve or reject account deletion requests.

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | Min level: super | Level check | 403 |

### State Changes (Approve)

**Firestore:**
| Operation | Collection | Document ID | Fields |
|-----------|------------|-------------|--------|
| Update | `delete_requests` | requestId | `status: 'approved'`, `processedBy`, `processedAt`, `deletionScheduledAt` |

**Side Effects:**
| Effect | Description |
|--------|-------------|
| Email | Confirmation to user |
| Schedule | Deletion scheduled for 90 days |

### State Changes (Reject)

**Firestore:**
| Operation | Collection | Document ID | Fields |
|-----------|------------|-------------|--------|
| Update | `delete_requests` | requestId | `status: 'rejected'`, `rejectionReason`, `canResubmitAfter` (30 days) |

### Server Actions
```typescript
async function approveDeleteRequest(requestId: string, actorId: string): Promise<void>;
async function rejectDeleteRequest(requestId: string, reason: string, actorId: string): Promise<void>;
```

---

## BLS-12-09: reviewContentReports

### Description
Review and action user-submitted content reports.

### Route
**Path:** `/platform/reports`

### Report Types
| Target Type | Examples |
|-------------|----------|
| `job` | Misleading job posting |
| `company` | Fake company profile |
| `message` | Inappropriate chat message |

### Report Status Flow
```
[pending] → [reviewing] → [resolved | dismissed]
```

### Server Actions
```typescript
async function getContentReports(
  filters: { status?: string; targetType?: string },
  pagination: { limit: number; cursor?: string }
): Promise<{ reports: ContentReport[]; counts: { pending: number; reviewing: number } }>;

async function startReportReview(reportId: string, actorId: string): Promise<void>;
async function dismissReport(reportId: string, reason: string, actorId: string): Promise<void>;
async function resolveReport(
  reportId: string,
  actionTaken: string,
  additionalActions: { suspendTarget?: boolean; removeContent?: boolean; warnTarget?: boolean },
  actorId: string
): Promise<void>;
```

---

## BLS-12-10: moderateJob

### Description
Hide, remove, or restore job postings.

### Actions
| Action | Effect |
|--------|--------|
| Hide | Set `status: 'hidden'`, not visible in search |
| Remove | Set `status: 'removed'`, permanent |
| Restore | Set `status: 'published'`, visible again |

### Server Actions
```typescript
async function hideJob(jobId: string, reason: string, actorId: string): Promise<void>;
async function removeJob(jobId: string, reason: string, actorId: string): Promise<void>;
async function restoreJob(jobId: string, note: string, actorId: string): Promise<void>;
```

---

## BLS-12-11: searchWallets

### Description
Search for user wallets by phone number or company name.

### Route
**Path:** `/platform/loyalty/coin-system`

### Search Types
| Type | Input | Query |
|------|-------|-------|
| Candidate | Phone number (0xxxxxxxxx) | Firebase Auth → `user_accounts` |
| Company | Company name | `company_information` text search |

### Server Actions
```typescript
async function searchCandidateWallet(phone: string): Promise<WalletSearchResult[]>;
async function searchCompanyWallet(companyName: string): Promise<WalletSearchResult[]>;
```

---

## BLS-12-12: adminDepositWithdraw

### Description
Deposit or withdraw coins from user wallets.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| features_admin.md | ADMIN-008, ADMIN-009 | Wallet management |
| features_wallet.md | WALLET-010, WALLET-011 | Admin operations |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | Min level: admin | Level check | 403 |
| 2 | Sufficient balance (withdraw) | `balance >= amount` | Error "ยอดเงินไม่เพียงพอ" |

### Inputs
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| targetUserId | string | Yes | Valid user ID |
| amount | number | Yes | > 0 |
| currency | string | Yes | 'coin' \| 'star' |
| type | string | Yes | 'deposit' \| 'withdraw' |
| remark | string | No | Max 500 chars |

### State Changes

**Firestore:**
| Operation | Collection | Document ID | Fields |
|-----------|------------|-------------|--------|
| Update | `pockets/{currency}` | userId | `balance: balance ± amount` |
| Create | `wallet_transactions` | Auto | Transaction record |

### Server Actions
```typescript
async function adminDepositCoins(
  targetUserId: string,
  amount: number,
  currency: 'coin' | 'star',
  remark: string | undefined,
  actorId: string
): Promise<ActionResult>;

async function adminWithdrawCoins(
  targetUserId: string,
  amount: number,
  currency: 'coin' | 'star',
  remark: string | undefined,
  actorId: string
): Promise<ActionResult>;
```

---

## BLS-12-13: manageMasterData

### Description
CRUD operations on system reference data (job functions, types, skills, etc.).

### Route
**Path:** `/platform/settings/master-data`

### Master Data Categories
| Category | Collection | Purpose |
|----------|------------|---------|
| Job Functions | `master_job_functions` | Position categories |
| Job Types | `master_job_types` | Employment types |
| Career Levels | `master_career_levels` | Experience levels |
| Education Levels | `master_education_levels` | Qualifications |
| Skills | `master_skills` | Competencies |

### Master Data Item Schema
```typescript
interface MasterDataItem {
  code: string;
  label: string;       // Thai display
  icon?: string;
  sort: number;
  is_active: boolean;  // Soft delete flag
  created_at: number;
  updated_at: number;
  created_by: string;
  updated_by: string;
}
```

### Server Actions
```typescript
async function addMasterDataItem(
  category: string,
  item: MasterDataItemInput,
  actorId: string
): Promise<{ id: string }>;

async function updateMasterDataItem(
  category: string,
  itemId: string,
  changes: Partial<MasterDataItemInput>,
  actorId: string
): Promise<void>;

async function deleteMasterDataItem(
  category: string,
  itemId: string,
  actorId: string
): Promise<void>;  // Soft delete: is_active = false
```

---

## BLS-12-14: sendPlatformNotification

### Description
Create and send platform-wide announcements to users.

### Route
**Path:** `/platform/notifications`

### Inputs
| Field | Type | Required | Options |
|-------|------|----------|---------|
| title | string | Yes | Max 100 chars |
| message | string | Yes | Max 500 chars |
| imageUrl | string | No | Valid URL |
| actionUrl | string | No | Deep link |
| audience | object | Yes | See below |
| channels | array | Yes | 'push' \| 'in_app' \| 'email' |
| scheduledAt | number | No | Future timestamp |

### Audience Options
| Type | Description |
|------|-------------|
| `{ type: 'all' }` | All users |
| `{ type: 'role', role: 'candidate' }` | All candidates |
| `{ type: 'role', role: 'company' }` | All companies |
| `{ type: 'segment', segmentId: string }` | Specific segment |

### Server Actions
```typescript
async function createPlatformNotification(
  data: PlatformNotificationInput,
  actorId: string
): Promise<{ notificationId: string; recipientCount: number }>;

async function sendPlatformNotificationNow(notificationId: string, actorId: string): Promise<void>;
async function cancelPlatformNotification(notificationId: string, actorId: string): Promise<void>;
```

---

## BLS-12-15: inviteStaff

### Description
Generate invitation codes for new admin staff.

### Route
**Path:** `/platform/dashboard/new-employee/invite`

### Invitation Flow
```
[Generate code] → [Share with new staff] → [Staff registers with code] → [Code marked used]
```

### State Changes

**Firestore:**
| Operation | Collection | Document ID | Fields |
|-----------|------------|-------------|--------|
| Create | `admin_invitations` | Auto | `code`, `isUsed: false`, `createdAt`, `created_by` |

### Server Actions
```typescript
async function generateAdminInvitation(actorId: string): Promise<{ code: string }>;
async function checkAdminInvitationCode(code: string): Promise<{ valid: boolean; alreadyUsed: boolean }>;
async function applyAdminInvitation(code: string, userId: string): Promise<void>;
```

---

## BLS-12-16: viewAuditLogs

### Description
View admin action audit logs. Super-admin only.

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | Min level: super | Level check | 403 |

### Route
**Path:** `/platform/logs`

### Audit Log Schema
```typescript
interface AdminAuditLog {
  uid: string;
  timestamp: number;
  actor: {
    uid: string;
    email: string;
    displayName: string;
    role: AdminLevel;
  };
  action: string;
  category: 'company' | 'candidate' | 'job' | 'user' | 'system' | 'wallet';
  entity: {
    type: string;
    id: string;
    name?: string;
  };
  changes?: Array<{ field: string; before: any; after: any }>;
  reason?: string;
  severity: 'info' | 'warning' | 'critical';
  ipAddress?: string;
  userAgent?: string;
}
```

### Server Actions
```typescript
async function queryAdminAuditLogs(
  filters: {
    dateFrom?: number;
    dateTo?: number;
    actorId?: string;
    category?: string;
    severity?: string;
    search?: string;
  },
  pagination: { limit: number; cursor?: string },
  actorId: string
): Promise<{ logs: AdminAuditLog[]; nextCursor?: string; total: number }>;

async function exportAdminAuditLogs(
  filters: { dateFrom: number; dateTo: number },
  format: 'csv' | 'xlsx',
  actorId: string
): Promise<{ downloadUrl: string; expiresAt: number }>;
```

---

## BLS-12-17: viewDashboardStats

### Description
View admin dashboard with key platform metrics.

### Route
**Path:** `/platform` (Dashboard home)

### Dashboard Metrics
| Metric | Source | Display |
|--------|--------|---------|
| Total Companies | `company_information` count | Card with growth % |
| Total Candidates | `candidate_information` count | Card with growth % |
| Active Jobs | `jobs WHERE status = 'published'` | Card with growth % |
| Interviews This Month | `job_interviews` count | Card with growth % |
| Pending Company Requests | `company_requests WHERE status = 'pending'` | Badge |
| Pending Reports | `content_reports WHERE status = 'pending'` | Badge |

### Server Action
```typescript
async function getDashboardStats(): Promise<{
  totalCompanies: { count: number; growth: number };
  totalCandidates: { count: number; growth: number };
  activeJobs: { count: number; growth: number };
  interviews: { count: number; growth: number };
  successRate: { percentage: number; total: number; successful: number };
  popularPositions: Array<{ name: string; count: number }>;
}>;
```

---

## BLS-12-18: viewAnalytics

### Description
View detailed analytics with charts and trends.

### Route
**Path:** `/platform/analytics`

### Analytics Sections
| Section | Metrics |
|---------|---------|
| Hiring Funnel | Jobs → Views → Applications → Interviews → Hires |
| Time Series | Applications, interviews, hires over time |
| Top Companies | By applications, hires |
| Top Positions | Most applied, most hired |
| Geographic | Applications by province |

### Server Action
```typescript
async function getAnalyticsDashboard(
  dateRange: { from: number; to: number }
): Promise<AnalyticsData>;
```

---

## Permission Matrix

| Action | Staff | Admin | Super |
|--------|-------|-------|-------|
| reviewCompanyRequests | ✓ | ✓ | ✓ |
| approveCompany | ✓ | ✓ | ✓ |
| rejectCompany | ✓ | ✓ | ✓ |
| suspendCompany | ✗ | ✓ | ✓ |
| manageUserRoles | ✗ | ✓ | ✓ |
| suspendUser | ✗ | ✓ | ✓ |
| reviewDeleteRequests | ✗ | ✗ | ✓ |
| processAccountDeletion | ✗ | ✗ | ✓ |
| reviewContentReports | ✓ | ✓ | ✓ |
| moderateJob | ✓ | ✓ | ✓ |
| searchWallets | ✗ | ✓ | ✓ |
| adminDepositWithdraw | ✗ | ✓ | ✓ |
| manageMasterData | ✗ | ✓ | ✓ |
| sendPlatformNotification | ✓ | ✓ | ✓ |
| inviteStaff | ✗ | ✓ | ✓ |
| viewAuditLogs | ✗ | ✗ | ✓ |
| viewDashboardStats | ✓ | ✓ | ✓ |
| viewAnalytics | ✓ | ✓ | ✓ |

---

## Audit Logging

All admin actions are logged to `admin_audit_logs` collection:

```typescript
async function logAdminAction(
  actor: { uid: string; email: string; displayName: string; role: AdminLevel },
  action: string,
  category: 'company' | 'candidate' | 'job' | 'user' | 'system' | 'wallet',
  entity: { type: string; id: string; name?: string },
  options?: {
    changes?: Array<{ field: string; before: any; after: any }>;
    reason?: string;
    severity?: 'info' | 'warning' | 'critical';
  }
): Promise<string>;
```

### Logged Actions
| Category | Actions |
|----------|---------|
| company | approve, reject, suspend, reactivate |
| candidate | suspend, reactivate |
| job | hide, remove, restore |
| user | add_role, remove_role, set_roles, suspend, delete |
| wallet | deposit, withdraw |
| system | master_data_*, notification_*, invitation_* |

---

## Stage Integration Points

### Entry Points (from other stages)
| Source | Trigger | Entry Action |
|--------|---------|--------------|
| BLS-01 | Admin invitation code | inviteStaff (apply) |
| BLS-08 | Account deletion request | reviewDeleteRequests |
| User report | Content flag | reviewContentReports |

### Triggered By (other stages create work)
| Source Stage | Source Action | Creates Work For |
|--------------|---------------|------------------|
| BLS-01 | Company registration | reviewCompanyRequests |
| BLS-00 | requestAccountDeletion | reviewDeleteRequests |
| Any | Report content | reviewContentReports |

### Exit Points (admin actions affect other stages)
| Admin Action | Affects Stage | Effect |
|--------------|---------------|--------|
| approveCompany | BLS-07 | Company can post jobs |
| suspendCompany | BLS-02 | Company/jobs hidden |
| adminDepositWithdraw | BLS-10 | Balance changes |
| sendPlatformNotification | BLS-11 | Creates `platform` messages |

---

## Related Documents

| Document | Relationship |
|----------|--------------|
| ADM-R00_cross-cutting_RIS.md | Admin cross-cutting patterns |
| ADM-R01 to ADM-R10 | Individual admin route specs |
| features_admin.md | Admin feature definitions (ADMIN-001 to ADMIN-034) |
| BLS-00_cross-cutting.md | Account management (delete requests source) |
| BLS-10_wallet.md | Wallet system integration |
| BLS-11_notifications.md | Platform notifications |

---

*End of BLS-12 Admin Stage*
