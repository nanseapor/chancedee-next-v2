# BLS-00: Cross-Cutting Business Logic

**Version:** 1.1  
**Created:** 2025-12-11  
**Last Updated:** 2025-12-11  
**Status:** Draft  
**Flow Stage:** 00 - Cross-Cutting Patterns

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.1 | 2025-12-11 | Added Section 3.7 Account Management actions (changePassword, requestAccountDeletion, createPasswordForSocialUser) |
| 1.0 | 2025-12-11 | Initial creation |

---

## 1. Overview

### 1.1 Scope

This document specifies **shared business logic patterns** that apply across all domains. These are foundation-level actions that other BLS documents depend on.

- Session validation
- Role checking
- Rate limiting
- Authentication error handling
- Ownership verification
- **Account management** (password change, account deletion)

### 1.2 RIS Coverage

| RIS | Route | Relevance |
|-----|-------|-----------|
| AUTH-R00 | Cross-cutting | Session management, auth HOFs, rate limiting |
| CAND-R00 | Cross-cutting | Ownership checks, role verification |
| COMP-R00 | Cross-cutting | Access control, role permissions (dashboard routes only) |
| JOB-R00 | Cross-cutting | Guest/authenticated behavior switching |
| CHAT-R00 | Cross-cutting | Real-time connection, chat access rules |
| NOTIF-R00 | Cross-cutting | Badge counts, notification access |
| ADM-R00 | Cross-cutting | Admin role hierarchy, permission matrix |

### 1.3 Public vs Protected Routes

**Important:** Not all routes require authentication. The cross-cutting actions in this BLS apply only to **protected routes**.

| Route Pattern | Protection Level | Cross-Cutting Actions Applied |
|---------------|------------------|-------------------------------|
| `/` | Public | None (guest accessible) |
| `/jobs`, `/jobs/[id]` | Public | None (guest accessible) |
| `/companies`, `/companies/[id]` | Public | None (guest accessible) |
| `/auth/*` | Mixed | Depends on specific route |
| `/candidates/[id]/*` | Protected | validateSession → checkRole → verifyOwnership |
| `/companies/[id]/pending` | Protected | validateSession → checkRole |
| `/companies/[id]/dashboard/*` | Protected | validateSession → checkRole → verifyOwnership |
| `/chat/*` | Protected | validateSession → checkRole |
| `/notifications` | Protected | validateSession → checkRole |
| `/platform/*` | Protected | validateSession → checkRole (admin level) |

### 1.4 Data Entities Used

| Entity | Collection | Purpose |
|--------|------------|---------|
| User Accounts | `user_accounts` | Role verification, status checks |
| User Info | `user_info` | Profile completion flags |
| OTP Codes | `otp_codes` | OTP verification |
| Consent Records | `consent_records` | Terms acceptance logging |
| Activity Logs | `activity_logs` | Audit trail (admin) |

---

## 2. Actor-Action Matrix

| Action | Guest | Candidate | Company | Admin | System |
|--------|-------|-----------|---------|-------|--------|
| validateSession | | ● | ● | ● | |
| checkRole | | ● | ● | ● | |
| verifyOwnership | | ● | ● | | |
| enforceRateLimit | ● | ● | ● | ● | |
| handleAuthError | ● | ● | ● | ● | ○ |
| refreshSession | | ● | ● | ● | ○ |
| changePassword | | ● | ● | ● | |
| requestAccountDeletion | | ● | ● | ● | |
| createPasswordForSocialUser | | ● | ● | ● | |

**Legend:** ● = User initiates, ○ = System auto-triggers

---

## 3. Action Specifications

---

### 3.1 Action: validateSession

#### Purpose

Verify that the current user has a valid, non-expired session before allowing access to protected resources.

---

#### Actor

| Aspect | Value |
|--------|-------|
| **Initiator** | System (middleware/HOF) |
| **Affected** | Current user |
| **System** | Automatic on every protected request |

---

#### Entry Points

| RIS | Route | UI Trigger | Context Provided |
|-----|-------|------------|------------------|
| AUTH-R00 | All protected routes | Page load / API call | Session cookie |
| CAND-R00 | `/candidates/[id]/*` | Page load | URL params |
| COMP-R00 | `/companies/[id]/pending`, `/companies/[id]/dashboard/*` | Page load | URL params |
| ADM-R00 | `/platform/*` | Page load | URL params |

**Note:** Public routes (`/`, `/jobs`, `/jobs/[id]`, `/companies`, `/companies/[id]`) do NOT require session validation.

---

#### Input Validation

| Field | Type | Required | Rules | Error (TH) | Error (EN) |
|-------|------|----------|-------|------------|------------|
| sessionCookie | string | ✅ | Valid Firebase session cookie | กรุณาเข้าสู่ระบบ | Please log in |

---

#### Security Matrix

| Check | Requirement | Failure Code | Failure Message (TH) |
|-------|-------------|--------------|----------------------|
| Cookie Present | Required | 401 | กรุณาเข้าสู่ระบบ |
| Cookie Valid | Firebase Admin SDK verification | 401 | เซสชันไม่ถูกต้อง |
| Cookie Not Expired | maxAge 3600s (1 hour) | 401 | เซสชันหมดอายุ |

---

#### Preconditions (Guards)

| # | Condition | Check | Fail Code | Fail Message (TH) |
|---|-----------|-------|-----------|-------------------|
| G1 | Session cookie exists | `cookies().get('session')` | 401 | กรุณาเข้าสู่ระบบ |
| G2 | Cookie is valid JWT | Firebase Admin `verifySessionCookie()` | 401 | เซสชันไม่ถูกต้อง |
| G3 | User account exists | `user_accounts.doc(uid)` exists | 401 | ไม่พบบัญชีผู้ใช้ |
| G4 | Account not deleted | `user.deletedAt` is null | 401 | บัญชีนี้ถูกลบแล้ว |

---

#### State Machine

##### Happy Path

| # | From | Event | To | Guard | UI Effect |
|---|------|-------|-----|-------|-----------|
| 1 | checking | COOKIE_FOUND | validating | Cookie exists | Show loading |
| 2 | validating | FIREBASE_VALID | fetching_user | JWT verified | - |
| 3 | fetching_user | USER_EXISTS | valid | Account found | Proceed to route |

##### Error Cases

| # | From | Event | To | Trigger | Message (TH) | Recovery |
|---|------|-------|-----|---------|--------------|----------|
| E1 | checking | NO_COOKIE | redirect_login | Cookie missing | กรุณาเข้าสู่ระบบ | Redirect to /auth/login |
| E2 | validating | FIREBASE_INVALID | redirect_login | JWT invalid/expired | เซสชันหมดอายุ | Redirect to /auth/session-expired |
| E3 | fetching_user | USER_NOT_FOUND | redirect_login | Account deleted | บัญชีนี้ถูกลบแล้ว | Redirect to /auth/login |
| E4 | validating | FIREBASE_ERROR | error | Network/service error | เกิดข้อผิดพลาด | Show retry button |

##### Edge Cases

| # | Scenario | From | Event | Handling |
|---|----------|------|-------|----------|
| X1 | Session expires during use | valid | API_401 | Show session expiry modal, allow re-auth |
| X2 | Concurrent tabs, one logs out | valid | STORAGE_LOGOUT | Sync across tabs, redirect all |
| X3 | Token refresh race condition | refreshing | CONCURRENT_REFRESH | Debounce, use latest |

---

#### Data Effects (Ordered)

| # | Entity | Collection | Op | Fields | Await | Rollback |
|---|--------|------------|-----|--------|-------|----------|
| 1 | - | - | READ | Session cookie | ✅ | - |
| 2 | User Account | `user_accounts` | READ | uid, roles, status | ✅ | - |

---

#### Notifications

| # | Channel | Recipient | Trigger | Message (TH) | Template |
|---|---------|-----------|---------|--------------|----------|
| N1 | Toast | User | Session expired during use | เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่ | session_expired |

---

#### Success Criteria

| Criteria | Verification |
|----------|--------------|
| Valid session confirmed | Firebase Admin SDK returns decoded token |
| User account retrieved | `user_accounts` document loaded |
| Auth context populated | `{ uid, user }` passed to action |

---

#### Test Hints

| Test Case | Type | Priority | Setup | Assert |
|-----------|------|----------|-------|--------|
| Valid session | Unit | P0 | Valid cookie | Returns user context |
| Expired session | Unit | P0 | Expired cookie | 401, redirect to login |
| Missing cookie | Unit | P0 | No cookie | 401, redirect to login |
| Deleted user | Unit | P1 | User with deletedAt | 401, specific message |
| Firebase service down | Integration | P2 | Mock timeout | Show error, retry |

---

#### Operational

| Aspect | Value | Notes |
|--------|-------|-------|
| Rate Limit | N/A | Per-request validation |
| Timeout | 5s | Firebase verification |
| Idempotent | Yes | Read-only |
| Cache Invalidation | N/A | No cache |

---

#### Related Actions

| Action | Relationship | BLS |
|--------|--------------|-----|
| refreshSession | Extends session before expiry | BLS-00 |
| login | Creates session | BLS-01 |
| logout | Destroys session | BLS-01 |

---

### 3.2 Action: checkRole

#### Purpose

Verify that the authenticated user has the required role(s) to access a resource or perform an action.

---

#### Actor

| Aspect | Value |
|--------|-------|
| **Initiator** | System (after validateSession) |
| **Affected** | Current user |
| **System** | Automatic role verification |

---

#### Entry Points

| RIS | Route | UI Trigger | Context Provided |
|-----|-------|------------|------------------|
| CAND-R00 | `/candidates/[id]/*` | Page load | Required: `candidate` |
| COMP-R00 | `/companies/[id]/pending` | Page load | Required: `company` (any status) |
| COMP-R00 | `/companies/[id]/dashboard/*` | Page load | Required: `company` (approved) |
| ADM-R00 | `/platform/*` | Page load | Required: `chancedee` |

**Note:** Public routes `/companies` and `/companies/[id]` do NOT require role check - they are accessible to guests.

---

#### Input Validation

| Field | Type | Required | Rules | Error (TH) | Error (EN) |
|-------|------|----------|-------|------------|------------|
| requiredRoles | string[] | ✅ | At least one role | - | - |
| userRoles | string[] | ✅ | From auth context | - | - |

---

#### Security Matrix

| Check | Requirement | Failure Code | Failure Message (TH) |
|-------|-------------|--------------|----------------------|
| Role Match | User has at least one required role | 403 | ไม่มีสิทธิ์เข้าถึง |
| Role Active | Role not suspended/revoked | 403 | บทบาทถูกระงับ |

---

#### Preconditions (Guards)

| # | Condition | Check | Fail Code | Fail Message (TH) |
|---|-----------|-------|-----------|-------------------|
| G1 | Session valid | validateSession passed | 401 | กรุณาเข้าสู่ระบบ |
| G2 | Has required role | `user.roles.some(r => required.includes(r))` | 403 | ไม่มีสิทธิ์เข้าถึง |
| G3 | Role not suspended | Role-specific status check | 403 | บทบาทถูกระงับ |

---

#### State Machine

##### Happy Path

| # | From | Event | To | Guard | UI Effect |
|---|------|-------|-----|-------|-----------|
| 1 | checking | ROLE_MATCH | authorized | Role found | Proceed |
| 2 | authorized | ENTER_ROUTE | ready | - | Show content |

##### Error Cases

| # | From | Event | To | Trigger | Message (TH) | Recovery |
|---|------|-------|-----|---------|--------------|----------|
| E1 | checking | NO_ROLE | redirect_role | Missing role | ไม่มีสิทธิ์เข้าถึง | Redirect to /auth/select-role |
| E2 | checking | ROLE_SUSPENDED | blocked | Role suspended | บทบาทถูกระงับ | Show status page |

##### Edge Cases

| # | Scenario | From | Event | Handling |
|---|----------|------|-------|----------|
| X1 | User has multiple roles | checking | ROLE_MATCH | Use activeRoleAtom preference |
| X2 | Company role pending approval | checking | ROLE_PENDING | Show COMP-R01 pending page |
| X3 | Admin level insufficient | authorized | FEATURE_BLOCKED | Show feature blocked message |

---

#### Data Effects (Ordered)

| # | Entity | Collection | Op | Fields | Await | Rollback |
|---|--------|------------|-----|--------|-------|----------|
| 1 | User Account | `user_accounts` | READ | roles | ✅ | - |
| 2 | Company Info | `company_information` | READ | status (if company) | ✅ | - |

---

#### Notifications

| # | Channel | Recipient | Trigger | Message (TH) | Template |
|---|---------|-----------|---------|--------------|----------|
| N1 | Toast | User | Role missing | คุณไม่มีสิทธิ์เข้าถึงส่วนนี้ | access_denied |

---

#### Success Criteria

| Criteria | Verification |
|----------|--------------|
| Role verified | User has required role |
| Role status valid | Role not suspended/pending |
| Active role set | `activeRoleAtom` updated |

---

#### Test Hints

| Test Case | Type | Priority | Setup | Assert |
|-----------|------|----------|-------|--------|
| Has required role | Unit | P0 | User with role | Access granted |
| Missing role | Unit | P0 | User without role | 403, redirect |
| Multiple roles | Unit | P1 | User with both | Use activeRole preference |
| Suspended company | Integration | P1 | Company status = suspended | Limited access |

---

#### Operational

| Aspect | Value | Notes |
|--------|-------|-------|
| Rate Limit | N/A | Per-request check |
| Timeout | 2s | Database read |
| Idempotent | Yes | Read-only |
| Cache Invalidation | N/A | No cache |

---

#### Related Actions

| Action | Relationship | BLS |
|--------|--------------|-----|
| validateSession | Must pass first | BLS-00 |
| selectRole | Sets activeRole | BLS-01 |

---

### 3.3 Action: verifyOwnership

#### Purpose

Verify that the authenticated user owns or has permission to access a specific resource (e.g., their own profile, their company's data).

---

#### Actor

| Aspect | Value |
|--------|-------|
| **Initiator** | System (after checkRole) |
| **Affected** | Current user |
| **System** | Automatic ownership verification |

---

#### Entry Points

| RIS | Route | UI Trigger | Context Provided |
|-----|-------|------------|------------------|
| CAND-R00 | `/candidates/[id]/*` | Page load | URL param `id` vs `user.uid` |
| COMP-R00 | `/companies/[id]/dashboard/*` | Page load | URL param `id` vs `user.companyId` |

**Note:** Public routes `/companies/[id]` (company profile) do NOT require ownership - anyone can view.

---

#### Input Validation

| Field | Type | Required | Rules | Error (TH) | Error (EN) |
|-------|------|----------|-------|------------|------------|
| resourceId | string | ✅ | From URL params | - | - |
| userId | string | ✅ | From auth context | - | - |
| ownershipType | enum | ✅ | 'self' | 'company' | 'admin' | - | - |

---

#### Security Matrix

| Check | Requirement | Failure Code | Failure Message (TH) |
|-------|-------------|--------------|----------------------|
| Self Ownership | resourceId === user.uid | Redirect | - |
| Company Ownership | resourceId === user.companyId | Redirect | - |
| Admin Override | user.roles.includes('chancedee') | N/A | Admin can view all |

---

#### Preconditions (Guards)

| # | Condition | Check | Fail Code | Fail Message (TH) |
|---|-----------|-------|-----------|-------------------|
| G1 | Valid resource ID | ID format valid | 404 | ไม่พบข้อมูล |
| G2 | Ownership match | ID matches user's resource | Redirect | - |

---

#### State Machine

##### Happy Path

| # | From | Event | To | Guard | UI Effect |
|---|------|-------|-----|-------|-----------|
| 1 | checking | IS_OWNER | authorized | IDs match | Proceed |
| 2 | checking | IS_ADMIN | authorized | Admin role | Proceed |

##### Error Cases

| # | From | Event | To | Trigger | Message (TH) | Recovery |
|---|------|-------|-----|---------|--------------|----------|
| E1 | checking | NOT_OWNER | redirect_own | IDs don't match | - | Redirect to own resource |

##### Edge Cases

| # | Scenario | From | Event | Handling |
|---|----------|------|-------|----------|
| X1 | Admin viewing other's resource | checking | IS_ADMIN | Allow with admin badge |
| X2 | Shared resource (team member) | checking | IS_TEAM_MEMBER | Allow with team role |

---

#### Data Effects (Ordered)

| # | Entity | Collection | Op | Fields | Await | Rollback |
|---|--------|------------|-----|--------|-------|----------|
| 1 | - | - | READ | URL params | ✅ | - |

---

#### Notifications

| # | Channel | Recipient | Trigger | Message (TH) | Template |
|---|---------|-----------|---------|--------------|----------|
| - | - | - | - | - | - |

**Note:** No notification - silent redirect to own resource.

---

#### Success Criteria

| Criteria | Verification |
|----------|--------------|
| Ownership verified | IDs match OR admin override |
| Correct redirect | Non-owner redirected to own resource |

---

#### Test Hints

| Test Case | Type | Priority | Setup | Assert |
|-----------|------|----------|-------|--------|
| Owner access | Unit | P0 | User accessing own | Access granted |
| Non-owner access | Unit | P0 | User accessing other's | Redirect to own |
| Admin access | Unit | P1 | Admin accessing any | Access granted |
| Team member access | Integration | P1 | Team member accessing company | Access granted |

---

#### Operational

| Aspect | Value | Notes |
|--------|-------|-------|
| Rate Limit | N/A | Per-request check |
| Timeout | N/A | No async operation |
| Idempotent | Yes | Read-only |
| Cache Invalidation | N/A | No cache |

---

#### Related Actions

| Action | Relationship | BLS |
|--------|--------------|-----|
| checkRole | Must pass first | BLS-00 |

---

### 3.4 Action: enforceRateLimit

#### Purpose

Prevent abuse by limiting the number of requests a user can make within a time window.

---

#### Actor

| Aspect | Value |
|--------|-------|
| **Initiator** | System (before action execution) |
| **Affected** | Current user/IP |
| **System** | Automatic rate limiting |

---

#### Entry Points

| RIS | Route | UI Trigger | Context Provided |
|-----|-------|------------|------------------|
| AUTH-R00 | All mutation endpoints | Form submit | User ID or IP |
| JOB-R00 | Job applications | Apply click | User ID |
| CHAT-R00 | Message sending | Send click | User ID |

---

#### Input Validation

| Field | Type | Required | Rules | Error (TH) | Error (EN) |
|-------|------|----------|-------|------------|------------|
| identifier | string | ✅ | User ID or IP address | - | - |
| action | string | ✅ | Action name for limit lookup | - | - |

---

#### Security Matrix

| Check | Requirement | Failure Code | Failure Message (TH) |
|-------|-------------|--------------|----------------------|
| Under Limit | Count < max for window | 429 | กรุณารอสักครู่ |

---

#### Preconditions (Guards)

| # | Condition | Check | Fail Code | Fail Message (TH) |
|---|-----------|-------|-----------|-------------------|
| G1 | Under rate limit | Redis/memory counter check | 429 | กรุณารอสักครู่ |

---

#### State Machine

##### Happy Path

| # | From | Event | To | Guard | UI Effect |
|---|------|-------|-----|-------|-----------|
| 1 | checking | UNDER_LIMIT | allowed | count < max | Proceed with action |
| 2 | allowed | INCREMENT | allowed | - | Counter +1 |

##### Error Cases

| # | From | Event | To | Trigger | Message (TH) | Recovery |
|---|------|-------|-----|---------|--------------|----------|
| E1 | checking | OVER_LIMIT | blocked | count >= max | กรุณารอสักครู่ | Show countdown |

##### Edge Cases

| # | Scenario | From | Event | Handling |
|---|----------|------|-------|----------|
| X1 | Rate limit storage fails | checking | STORAGE_ERROR | Allow action (fail open) |
| X2 | Burst limit hit | allowed | BURST_LIMIT | Throttle response |

---

#### Data Effects (Ordered)

| # | Entity | Collection | Op | Fields | Await | Rollback |
|---|--------|------------|-----|--------|-------|----------|
| 1 | Rate Limit Counter | Redis/Memory | READ | count, windowStart | ✅ | - |
| 2 | Rate Limit Counter | Redis/Memory | UPDATE | count +1 | ❌ | - |

---

#### Notifications

| # | Channel | Recipient | Trigger | Message (TH) | Template |
|---|---------|-----------|---------|--------------|----------|
| N1 | Toast | User | Rate limited | กรุณารอสักครู่ (X วินาที) | rate_limited |

---

#### Success Criteria

| Criteria | Verification |
|----------|--------------|
| Under limit | Action proceeds |
| Counter incremented | Counter +1 after action |

---

#### Test Hints

| Test Case | Type | Priority | Setup | Assert |
|-----------|------|----------|-------|--------|
| Under limit | Unit | P0 | Fresh counter | Action allowed |
| At limit | Unit | P0 | Counter at max | 429 returned |
| Window reset | Unit | P1 | Wait for window | Counter resets |
| Storage failure | Integration | P2 | Mock Redis fail | Fail open |

---

#### Operational

| Aspect | Value | Notes |
|--------|-------|-------|
| Rate Limit | Per action (see table below) | Varies by action type |
| Timeout | 100ms | Redis lookup |
| Idempotent | No | Counter increments |
| Cache Invalidation | TTL-based | Window expiry |

**Rate Limits by Action:**

| Action | Limit | Window | Scope |
|--------|-------|--------|-------|
| login | 5 | 15 min | IP + email |
| register | 3 | 1 hour | IP |
| sendOTP | 3 | 5 min | email |
| verifyOTP | 5 | 5 min | email |
| applyJob | 10 | 1 hour | user |
| sendMessage | 60 | 1 min | user |
| saveJob | 30 | 1 min | user |

---

#### Related Actions

| Action | Relationship | BLS |
|--------|--------------|-----|
| All mutations | Apply before executing | All BLS |

---

### 3.5 Action: handleAuthError

#### Purpose

Provide consistent error handling and user feedback for authentication failures across all domains.

---

#### Actor

| Aspect | Value |
|--------|-------|
| **Initiator** | System (on auth error) |
| **Affected** | Current user |
| **System** | Automatic error handling |

---

#### Entry Points

| RIS | Route | UI Trigger | Context Provided |
|-----|-------|------------|------------------|
| AUTH-R00 | All routes | API 401/403 response | Error code, context |

---

#### Input Validation

| Field | Type | Required | Rules | Error (TH) | Error (EN) |
|-------|------|----------|-------|------------|------------|
| errorCode | number | ✅ | 401, 403, 429 | - | - |
| errorType | string | ❌ | Specific error type | - | - |
| context | object | ❌ | Additional context | - | - |

---

#### Security Matrix

| Check | Requirement | Failure Code | Failure Message (TH) |
|-------|-------------|--------------|----------------------|
| N/A | Error handler | N/A | N/A |

---

#### Preconditions (Guards)

| # | Condition | Check | Fail Code | Fail Message (TH) |
|---|-----------|-------|-----------|-------------------|
| - | - | - | - | - |

**Note:** No guards - this is the error handler itself.

---

#### State Machine

##### Happy Path

| # | From | Event | To | Guard | UI Effect |
|---|------|-------|-----|-------|-----------|
| 1 | any | AUTH_ERROR | handling | Error received | Determine action |
| 2 | handling | ERROR_401 | show_modal | Session expired | Show re-auth modal |
| 3 | handling | ERROR_403 | show_toast | Access denied | Show toast, stay |
| 4 | handling | ERROR_429 | show_toast | Rate limited | Show countdown toast |

##### Error Cases

| # | From | Event | To | Trigger | Message (TH) | Recovery |
|---|------|-------|-----|---------|--------------|----------|
| - | - | - | - | - | - | - |

**Note:** This IS the error handler.

##### Edge Cases

| # | Scenario | From | Event | Handling |
|---|----------|------|-------|----------|
| X1 | Multiple 401s in sequence | handling | REPEAT_401 | Debounce, show once |
| X2 | Error during modal re-auth | reauth_modal | REAUTH_FAIL | Close modal, redirect to login |

---

#### Data Effects (Ordered)

| # | Entity | Collection | Op | Fields | Await | Rollback |
|---|--------|------------|-----|--------|-------|----------|
| 1 | - | - | - | - | - | - |

**Note:** No data effects - UI only.

---

#### Notifications

| # | Channel | Recipient | Trigger | Message (TH) | Template |
|---|---------|-----------|---------|--------------|----------|
| N1 | Modal | User | 401 (session expired) | เซสชันหมดอายุ | session_expired_modal |
| N2 | Toast | User | 403 (access denied) | ไม่มีสิทธิ์เข้าถึง | access_denied |
| N3 | Toast | User | 429 (rate limited) | กรุณารอ X วินาที | rate_limited |
| N4 | Toast | User | Network error | ไม่สามารถเชื่อมต่อได้ | network_error |

---

#### Success Criteria

| Criteria | Verification |
|----------|--------------|
| Error shown | User sees appropriate feedback |
| Recovery path clear | User knows how to proceed |

---

#### Test Hints

| Test Case | Type | Priority | Setup | Assert |
|-----------|------|----------|-------|--------|
| 401 shows modal | Unit | P0 | Mock 401 response | Modal appears |
| 403 shows toast | Unit | P0 | Mock 403 response | Toast appears |
| 429 shows countdown | Unit | P1 | Mock 429 response | Countdown visible |
| Modal re-auth works | Integration | P1 | Enter creds in modal | Session restored |

---

#### Operational

| Aspect | Value | Notes |
|--------|-------|-------|
| Rate Limit | N/A | Error handler |
| Timeout | N/A | UI only |
| Idempotent | Yes | Display only |
| Cache Invalidation | N/A | No cache |

---

#### Related Actions

| Action | Relationship | BLS |
|--------|--------------|-----|
| validateSession | Triggers auth errors | BLS-00 |
| checkRole | Triggers auth errors | BLS-00 |
| login | Recovery from errors | BLS-01 |

---

### 3.6 Action: refreshSession

#### Purpose

Proactively renew the session cookie before it expires to maintain seamless user experience.

---

#### Actor

| Aspect | Value |
|--------|-------|
| **Initiator** | System (client-side timer) |
| **Affected** | Current user |
| **System** | Automatic renewal via `useSessionRenewal` hook |

---

#### Entry Points

| RIS | Route | UI Trigger | Context Provided |
|-----|-------|------------|------------------|
| AUTH-R00 | All authenticated routes | Timer (every 5 min) | Current session state |

---

#### Input Validation

| Field | Type | Required | Rules | Error (TH) | Error (EN) |
|-------|------|----------|-------|------------|------------|
| idToken | string | ✅ | Valid Firebase ID token | - | - |

---

#### Security Matrix

| Check | Requirement | Failure Code | Failure Message (TH) |
|-------|-------------|--------------|----------------------|
| Token Valid | Firebase ID token not expired | 401 | เซสชันหมดอายุ |
| User Active | Activity within last 5 min | Skip | - |

---

#### Preconditions (Guards)

| # | Condition | Check | Fail Code | Fail Message (TH) |
|---|-----------|-------|-----------|-------------------|
| G1 | User is active | lastActivity within 5 min | Skip | - |
| G2 | Token expires soon | JWT exp < 10 min away | Skip | - |
| G3 | Not already refreshing | refreshing flag false | Skip | - |

---

#### State Machine

##### Happy Path

| # | From | Event | To | Guard | UI Effect |
|---|------|-------|-----|-------|-----------|
| 1 | idle | TIMER_TICK | checking | 5 min elapsed | - |
| 2 | checking | NEEDS_REFRESH | refreshing | exp < 10 min | - |
| 3 | refreshing | SUCCESS | idle | New cookie set | Silent update |

##### Error Cases

| # | From | Event | To | Trigger | Message (TH) | Recovery |
|---|------|-------|-----|---------|--------------|----------|
| E1 | refreshing | FAILED | idle | Network error | - | Retry on next tick |
| E2 | refreshing | TOKEN_EXPIRED | expired | Token expired | เซสชันหมดอายุ | Show modal |

##### Edge Cases

| # | Scenario | From | Event | Handling |
|---|----------|------|-------|----------|
| X1 | User idle for >1 hour | checking | USER_IDLE | Skip refresh, let session expire |
| X2 | Multiple tabs refreshing | refreshing | CONCURRENT_REFRESH | Use mutex/leader election |

---

#### Data Effects (Ordered)

| # | Entity | Collection | Op | Fields | Await | Rollback |
|---|--------|------------|-----|--------|-------|----------|
| 1 | Session Cookie | - | UPDATE | New session cookie | ✅ | - |
| 2 | localStorage | - | UPDATE | sessionCreated timestamp | ❌ | - |

---

#### Notifications

| # | Channel | Recipient | Trigger | Message (TH) | Template |
|---|---------|-----------|---------|--------------|----------|
| - | - | - | - | - | - |

**Note:** Silent operation - no user notification on success.

---

#### Success Criteria

| Criteria | Verification |
|----------|--------------|
| Cookie refreshed | New session cookie with extended expiry |
| Activity tracked | lastActivity timestamp updated |

---

#### Test Hints

| Test Case | Type | Priority | Setup | Assert |
|-----------|------|----------|-------|--------|
| Refresh when needed | Unit | P0 | Token expires in 5 min | New cookie set |
| Skip when not needed | Unit | P0 | Token expires in 30 min | No API call |
| Skip when idle | Unit | P1 | No activity for 10 min | No API call |
| Handle network error | Integration | P1 | Mock network fail | Retry on next tick |

---

#### Operational

| Aspect | Value | Notes |
|--------|-------|-------|
| Rate Limit | 1/5 min | Timer-based |
| Timeout | 10s | Server action |
| Idempotent | Yes | Can retry safely |
| Cache Invalidation | N/A | Cookie-based |

---

#### Related Actions

| Action | Relationship | BLS |
|--------|--------------|-----|
| validateSession | Uses refreshed session | BLS-00 |
| login | Creates initial session | BLS-01 |

---

## 3.7 Account Management Actions

The following actions are accessible from `/auth/settings` and apply to ALL authenticated users regardless of role (candidate, company, admin). They are documented here in BLS-00 because they are truly cross-cutting.

---

### 3.7.1 Action: changePassword

#### Purpose

Allow authenticated users to change their account password. Requires verification of current password first.

---

#### Actor

| Aspect | Value |
|--------|-------|
| **Initiator** | User (candidate, company, or admin) |
| **Affected** | Current user's account |
| **Route** | `/auth/settings?tab=password` |

---

#### Source Documents

| Document | Section | Purpose |
|----------|---------|---------|
| AUTH-R06_settings_RIS.md | Section 3, 7.2 | Password change feature |
| features_authentication.md | AUTH-008 | Change Password feature |

---

#### Preconditions (Guards)

| # | Condition | Check | Fail Code | Fail Message (TH) |
|---|-----------|-------|-----------|-------------------|
| G1 | User authenticated | `sessionStateAtom === 'valid'` | 401 | กรุณาเข้าสู่ระบบ |
| G2 | Has password auth | Not social-only user | - | Show "Create Password" flow instead |

---

#### Input Validation

| Field | Type | Required | Rules | Error (TH) |
|-------|------|----------|-------|------------|
| currentPassword | string | ✅ | Must match current | รหัสผ่านไม่ถูกต้อง |
| newPassword | string | ✅ | Min 8 chars, at least 1 number, 1 letter | รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร ประกอบด้วยตัวเลขและตัวอักษร |
| confirmPassword | string | ✅ | Must match newPassword | รหัสผ่านไม่ตรงกัน |

---

#### State Machine

##### Happy Path

| # | From | Event | To | Guard | UI Effect |
|---|------|-------|-----|-------|-----------|
| 1 | idle | SUBMIT | verifying | Form valid | Show loading |
| 2 | verifying | CURRENT_VALID | updating | Firebase re-auth success | Continue |
| 3 | updating | SUCCESS | success | Password updated | Show success toast |

##### Error Cases

| # | From | Event | To | Trigger | Message (TH) | Recovery |
|---|------|-------|-----|---------|--------------|----------|
| E1 | verifying | WRONG_PASSWORD | idle | Re-auth failed | รหัสผ่านไม่ถูกต้อง | Clear current password field |
| E2 | updating | WEAK_PASSWORD | idle | Firebase rejection | รหัสผ่านไม่ปลอดภัย | Show requirements |
| E3 | updating | NETWORK_ERROR | idle | Network failure | เกิดข้อผิดพลาด กรุณาลองใหม่ | Show retry |

---

#### Data Effects (Ordered)

| # | Entity | Collection | Op | Fields | Await | Rollback |
|---|--------|------------|-----|--------|-------|----------|
| 1 | Firebase Auth | - | UPDATE | Password credential | ✅ | - |

**Note:** Password is stored in Firebase Authentication, not Firestore.

---

#### Server Action

```typescript
async function changePassword(
  currentPassword: string, 
  newPassword: string
): Promise<ActionResult>;
```

**Implementation Notes:**
1. Re-authenticate user with `reauthenticateWithCredential()`
2. Call `updatePassword()` with new password
3. Optionally invalidate other sessions

---

#### UI Feedback

| Scenario | Feedback Type | Display |
|----------|---------------|---------|
| Submitting | Button loading | Spinner |
| Wrong current | Inline error | "รหัสผ่านไม่ถูกต้อง" |
| Weak password | Inline error | Password requirements |
| Success | Toast + clear form | "เปลี่ยนรหัสผ่านสำเร็จ" |

---

#### Related Actions

| Action | Relationship | BLS |
|--------|--------------|-----|
| login | Uses password credential | BLS-01 |
| validateSession | Session continues after change | BLS-00 |

---

### 3.7.2 Action: requestAccountDeletion

#### Purpose

Allow users to submit an account deletion request with reason and optional supporting document. Request is queued for admin review.

---

#### Actor

| Aspect | Value |
|--------|-------|
| **Initiator** | User (candidate, company member, or admin) |
| **Affected** | Current user's account |
| **Route** | `/auth/settings?tab=delete` |

---

#### Source Documents

| Document | Section | Purpose |
|----------|---------|---------|
| AUTH-R06_settings_RIS.md | Section 3, 7.4 | Delete account feature |
| features_authentication.md | AUTH-012 | Account Deletion Request |

---

#### Preconditions (Guards)

| # | Condition | Check | Fail Code | Fail Message (TH) |
|---|-----------|-------|-----------|-------------------|
| G1 | User authenticated | `sessionStateAtom === 'valid'` | 401 | กรุณาเข้าสู่ระบบ |
| G2 | Not sole company admin | If admin, company has other admins | 400 | โปรดแต่งตั้งผู้ดูแลระบบคนใหม่ก่อน |
| G3 | No pending request | No existing delete request | 400 | มีคำขอลบบัญชีที่รอดำเนินการอยู่แล้ว |

---

#### Input Validation

| Field | Type | Required | Rules | Error (TH) |
|-------|------|----------|-------|------------|
| reason | string | ✅ | Non-empty, max 1000 chars | กรุณาระบุเหตุผล |
| document | File | ❌ | PDF/image, max 5MB | ไฟล์ต้องเป็น PDF หรือรูปภาพ ขนาดไม่เกิน 5MB |

---

#### State Machine

##### Happy Path

| # | From | Event | To | Guard | UI Effect |
|---|------|-------|-----|-------|-----------|
| 1 | idle | CLICK_DELETE | confirming | - | Show confirmation modal |
| 2 | confirming | CONFIRM | submitting | User confirms | Show loading |
| 3 | submitting | SUCCESS | submitted | Request created | Show success, redirect |

##### Error Cases

| # | From | Event | To | Trigger | Message (TH) | Recovery |
|---|------|-------|-----|---------|--------------|----------|
| E1 | confirming | CANCEL | idle | User cancels | - | Close modal |
| E2 | submitting | SOLE_ADMIN | idle | Company admin check | โปรดแต่งตั้งผู้ดูแลระบบคนใหม่ก่อน | Navigate to team settings |
| E3 | submitting | PENDING_EXISTS | idle | Existing request | มีคำขอลบบัญชีที่รอดำเนินการอยู่แล้ว | Show status |

---

#### Data Effects (Ordered)

| # | Entity | Collection | Op | Fields | Await | Rollback |
|---|--------|------------|-----|--------|-------|----------|
| 1 | Delete Request | `delete_requests` | CREATE | See schema below | ✅ | - |
| 2 | Document | Firebase Storage | CREATE | If file provided | ✅ | Delete on error |

**Delete Request Schema:**
```typescript
interface DeleteRequest {
  uid: string;           // Auto-generated
  user_id: string;       // Requesting user
  reason: string;        // User-provided reason
  document_url?: string; // Optional supporting document
  status: 'pending' | 'approved' | 'rejected';
  created_at: number;
  updated_at: number;
  reviewed_by?: string;  // Admin who reviewed
  reviewed_at?: number;
  review_note?: string;
}
```

---

#### Server Action

```typescript
interface DeletionRequestInput {
  reason: string;
  document?: File;
}

async function submitDeletionRequest(
  input: DeletionRequestInput
): Promise<ActionResult>;
```

**Implementation Notes:**
1. Check sole admin guard
2. Check existing pending request
3. Upload document if provided
4. Create `delete_requests` document
5. Send notification to platform admin

---

#### UI Feedback

| Scenario | Feedback Type | Display |
|----------|---------------|---------|
| Click delete | Confirmation modal | "คุณแน่ใจหรือไม่ว่าต้องการลบบัญชี?" |
| Submitting | Button loading | Spinner |
| Success | Toast + redirect | "ส่งคำขอลบบัญชีแล้ว ทีมงานจะตรวจสอบและติดต่อกลับ" → redirect to home |
| Sole admin | Error toast | "โปรดแต่งตั้งผู้ดูแลระบบคนใหม่ก่อน" |
| Pending exists | Info toast | "มีคำขอลบบัญชีที่รอดำเนินการอยู่แล้ว" |

---

#### Notifications

| # | Channel | Recipient | Trigger | Message (TH) | Template |
|---|---------|-----------|---------|--------------|----------|
| N1 | Email | User | Request submitted | ได้รับคำขอลบบัญชีของคุณแล้ว | delete_request_received |
| N2 | In-app | Platform Admin | Request submitted | มีคำขอลบบัญชีใหม่ | admin_delete_request |

---

#### Related Actions

| Action | Relationship | BLS |
|--------|--------------|-----|
| reviewDeletionRequest | Admin processes request | BLS-12 (Admin) |
| logout | After deletion approved | BLS-01 |

---

### 3.7.3 Action: createPasswordForSocialUser

#### Purpose

Allow users who registered via Google/Facebook to create a password for their account.

---

#### Actor

| Aspect | Value |
|--------|-------|
| **Initiator** | User (social-only account) |
| **Affected** | Current user's account |
| **Route** | `/auth/settings?tab=password` |

---

#### Source Documents

| Document | Section | Purpose |
|----------|---------|---------|
| AUTH-R06_settings_RIS.md | Section 7.2 | Create password for social users |
| features_authentication.md | AUTH-009 | Create Password feature |

---

#### Preconditions (Guards)

| # | Condition | Check | Fail Code | Fail Message (TH) |
|---|-----------|-------|-----------|-------------------|
| G1 | User authenticated | `sessionStateAtom === 'valid'` | 401 | กรุณาเข้าสู่ระบบ |
| G2 | Social-only user | No password provider linked | - | Show "Change Password" instead |

---

#### Input Validation

| Field | Type | Required | Rules | Error (TH) |
|-------|------|----------|-------|------------|
| newPassword | string | ✅ | Min 8 chars, complexity | รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร |
| confirmPassword | string | ✅ | Must match newPassword | รหัสผ่านไม่ตรงกัน |

---

#### Server Action

```typescript
async function createPasswordForSocialUser(
  newPassword: string
): Promise<ActionResult>;
```

**Implementation Notes:**
1. Link email/password provider to existing account
2. Use `linkWithCredential()` with EmailAuthProvider

---

#### UI Feedback

| Scenario | Feedback Type | Display |
|----------|---------------|---------|
| Submitting | Button loading | Spinner |
| Success | Toast | "สร้างรหัสผ่านสำเร็จ" |
| Weak password | Inline error | Password requirements |

---

## 4. Cross-Cutting Concerns

### 4.1 Error Handling Pattern

All cross-cutting actions follow this error handling pattern:

1. **Try operation**
2. **Catch specific errors** (Firebase, Network, Business)
3. **Map to user-friendly message** (Thai primary)
4. **Log for debugging** (structured logging)
5. **Return consistent response shape** `{ success, error?, code? }`

### 4.2 Caching Strategy

| Pattern | Use Case | TTL |
|---------|----------|-----|
| No cache | Session validation | - |
| SWR | User profile data | 5 min |
| Local storage | Role preference | Permanent |

### 4.3 Audit Logging

Cross-cutting actions log to console in development. In production, critical auth events are logged to `activity_logs` collection:

- Login success/failure
- Session refresh
- Role changes
- Permission denials

---

## 5. Data Entity Verification

| Entity Used in BLS | Data-Entity File | Collection Name | RIS Reference | Status |
|--------------------|------------------|-----------------|---------------|--------|
| User Accounts | ✅ `data-entities_user-accounts.md` | `user_accounts` | AUTH-R00 | ✅ Match |
| User Info | ✅ `data-entities_user-info.md` | `user_info` | AUTH-R00 | ✅ Match |
| OTP Codes | ✅ `data-entities_otp-codes.md` | `otp_codes` | AUTH-R00 | ✅ Match |
| Consent Records | ✅ `data-entities_consent-records.md` | `consent_records` | AUTH-R00 | ✅ Match |
| Activity Logs | ✅ `data-entities_activity-logs.md` | `activity_logs` | ADM-R00 | ✅ Match |

### Status Legend

- ✅ Match - RIS and data-entity agree
- ⚠️ Name mismatch - Data-entity exists but RIS uses different name  
- 🆕 New entity? - RIS references collection not in data-entities
- ❌ Missing - BLS needs it but no data-entity exists

---

## 6. Inconsistencies Found

| Source | Section | Says | Should Be | Notes |
|--------|---------|------|-----------|-------|
| - | - | - | - | No inconsistencies found |

---

## 7. Open Questions

| # | Question | Context | Decision |
|---|----------|---------|----------|
| Q1 | Should rate limit counters persist across server restarts? | Redis vs in-memory | Use Redis in production |
| Q2 | Should failed refresh attempts notify user? | Silent vs explicit | Silent with retry |

---

## 8. References

### Source Documents

- AUTH-R00_cross-cutting_RIS.md
- CAND-R00_cross-cutting_RIS.md
- COMP-R00_cross-cutting_RIS.md
- JOB-R00_cross-cutting_RIS.md
- CHAT-R00_cross-cutting_RIS.md
- NOTIF-R00_cross-cutting_RIS.md
- ADM-R00_cross-cutting_RIS.md

### Data Entities

- data-entities_user-accounts.md
- data-entities_user-info.md
- data-entities_otp-codes.md
- data-entities_consent-records.md
- data-entities_activity-logs.md

### Related BLS

- BLS-01_onboarding.md (login, logout, register)
- All other BLS documents depend on this one

---

*End of BLS-00: Cross-Cutting Business Logic v1.1*
