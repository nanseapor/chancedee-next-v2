# BLS-01: Onboarding Stage Business Logic

**Document ID:** BLS-01  
**Version:** 1.0  
**Status:** Draft  
**Created:** 2025-12-11  
**Last Updated:** 2025-12-11

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-11 | Initial creation with 8 onboarding actions |

---

## 1. Stage Overview

### 1.1 Purpose

This BLS specifies the business logic for the **Onboarding Stage** — user authentication, registration, password management, and initial role selection. These actions enable users to enter the platform and establish their identity.

### 1.2 RIS Coverage

| RIS | Route | Relevance |
|-----|-------|-----------|
| AUTH-R01 | `/auth/login` | Login flow, session creation, post-auth routing |
| AUTH-R02 | `/auth/register` | Registration wizard (candidate + company flows) |
| AUTH-R03 | `/auth/verify` | OTP verification for email changes |
| AUTH-R04 | `/auth/reset` | Password reset request |
| AUTH-R05 | `/auth/status` | Pending/deleted status display |
| AUTH-R06 | `/auth/settings` | Password change/create |
| AUTH-R07 | `/auth/select-role` | Multi-role user selection |

### 1.3 Data Entities Used

| Entity | Collection | Purpose |
|--------|------------|---------|
| User Accounts | `user_accounts` | User credentials, roles, status |
| User Info | `user_info` | Extended profile metadata |
| OTP Codes | `otp_codes` | Email verification codes |
| Candidate Information | `candidate_information` | Candidate profile (created on registration) |
| Company Information | `company_information` | Company profile (Mode A registration) |
| Company Requests | `company_requests` | Pending company registrations |
| Consent Records | `consent_records` | PDPA acceptance logging |
| Pockets | `pockets` | Wallet balance (signup bonus) |
| Wallet Transactions | `wallet_transactions` | Transaction history |
| Candidate Referral | `candidate_referral` | Referral tracking |

---

## 2. Actor-Action Matrix

| Action | Guest | Candidate | Company | Admin | System |
|--------|-------|-----------|---------|-------|--------|
| login | ✅ | — | — | — | — |
| register | ✅ | — | — | — | — |
| verifyOTP | ✅ | ✅ | ✅ | ✅ | — |
| sendOTP | ✅ | ✅ | ✅ | ✅ | — |
| requestPasswordReset | ✅ | — | — | — | — |
| selectRole | — | ✅* | ✅* | — | — |
| createPassword | — | ✅ | ✅ | ✅ | — |
| changePassword | — | ✅ | ✅ | ✅ | — |

**Legend:**
- ✅ = Can perform
- ✅* = Only multi-role users (has both `candidate` and `company` roles)
- — = Cannot perform / Not applicable

---

## 3. Action Specifications

### 3.1 Action: login

#### Purpose

Authenticate a user via email/password or Google OAuth and create a session.

---

#### Actor

| Aspect | Value |
|--------|-------|
| **Initiator** | Guest (unauthenticated user) |
| **Affected** | Self (becomes authenticated user) |
| **System** | Firebase Auth, Session Cookie |

---

#### Entry Points

| RIS | Route | UI Trigger | Context Provided |
|-----|-------|------------|------------------|
| AUTH-R01 | `/auth/login` | Form submit / Google button | Email, password, termsAccepted |

---

#### Input Validation

| Field | Type | Required | Rules | Error (TH) | Error (EN) |
|-------|------|----------|-------|------------|------------|
| email | string | ✅ (email flow) | Valid email format | รูปแบบอีเมลไม่ถูกต้อง | Invalid email format |
| password | string | ✅ (email flow) | Non-empty | กรุณากรอกรหัสผ่าน | Please enter password |
| termsAccepted | boolean | ✅ | Must be true | กรุณายอมรับข้อกำหนด | Please accept terms |

---

#### Security Matrix

| Check | Requirement | Failure Code | Failure Message (TH) |
|-------|-------------|--------------|----------------------|
| Terms Accepted | Must be checked | TERMS_NOT_ACCEPTED | กรุณายอมรับข้อกำหนดและนโยบาย |
| Firebase Auth | Valid credentials | INVALID_CREDENTIALS | อีเมลหรือรหัสผ่านไม่ถูกต้อง |
| Account Exists | Email registered | ACCOUNT_NOT_FOUND | ไม่พบบัญชีผู้ใช้ |
| Account Active | `is_active = true` | ACCOUNT_DELETED | บัญชีนี้ถูกลบแล้ว |
| Rate Limit | < 5 attempts / 15 min | TOO_MANY_REQUESTS | กรุณารอสักครู่แล้วลองใหม่ |

---

#### Preconditions (Guards)

| # | Condition | Failure Behavior |
|---|-----------|------------------|
| G1 | User not already authenticated | Redirect to appropriate dashboard |
| G2 | Terms checkbox checked | Show inline validation error |
| G3 | Email format valid | Show inline validation error |

---

#### State Machine

```
[IDLE] ─────────────────────────────────────────────────────┐
   │                                                         │
   │ form_submit (email) / google_click                      │
   ▼                                                         │
[AUTHENTICATING] ───────────────────────────────────────┐   │
   │                                                     │   │
   │ firebase_success                                    │   │
   ▼                                                     │   │
[FETCHING_USER] ─────────────────────────────────────┐  │   │
   │                                                  │  │   │
   │ user_data_success                               │  │   │
   ▼                                                  │  │   │
[CREATING_SESSION] ──────────────────────────────┐   │  │   │
   │                                              │   │  │   │
   │ session_success                             │   │  │   │
   ▼                                              │   │  │   │
[ROUTING] ────────────────────────────────────┐  │   │  │   │
   │                                           │  │   │  │   │
   │ (determine destination)                   │  │   │  │   │
   ▼                                           │  │   │  │   │
[REDIRECT] ──► (external)                      │  │   │  │   │
                                               │  │   │  │   │
   ┌───────────────────────────────────────────┘  │   │  │   │
   │ error at any step                            │   │  │   │
   ▼                                              │   │  │   │
[ERROR] ──────────────────────────────────────────┴───┴───┴──┘
   │ user_retry
   └──► [IDLE]
```

**State Descriptions:**

| State | Description | UI Display |
|-------|-------------|------------|
| IDLE | Waiting for user input | Login form |
| AUTHENTICATING | Firebase auth in progress | Loading spinner, form disabled |
| FETCHING_USER | Getting user data from Firestore | Loading spinner |
| CREATING_SESSION | Server action creating session cookie | Loading spinner |
| ROUTING | Determining post-login destination | Loading spinner |
| REDIRECT | Navigating to destination | Full-page loader |
| ERROR | Auth failed | Error message + form enabled |

---

#### Data Effects (Ordered)

| Step | Operation | Collection/Target | Fields | Condition |
|------|-----------|-------------------|--------|-----------|
| 1 | Firebase Auth | Firebase Auth | Validate credentials | Always |
| 2 | Read | `user_accounts` | All user fields | Auth success |
| 3 | Create (if new) | `user_accounts` + `candidate_information` | Default candidate profile | Google OAuth, first login |
| 4 | Update | `user_accounts` | `updated_at` | Auth success |
| 5 | Create | Session Cookie | `session` (httpOnly, 1hr) | User data fetched |
| 6 | Create | `consent_records` | Terms acceptance log | After session |

**New Google User Auto-Creation:**
When a user signs in with Google for the first time:
- Creates `user_accounts` doc with `roles: ['candidate']`
- Creates `candidate_information` doc with basic info from Google profile
- Awards signup bonus (100 coins) via wallet actions

---

#### Notifications

| Trigger | Channel | Recipient | Template |
|---------|---------|-----------|----------|
| N/A | — | — | — |

---

#### Success Criteria

| Criterion | Validation Method |
|-----------|-------------------|
| Session cookie set | `hasSessionCookie()` returns true |
| User atom populated | `userAtom` contains user data |
| Redirect executed | Browser at destination route |

---

#### Post-Login Routing Logic

| Condition | Destination |
|-----------|-------------|
| `roles.includes('deleted')` | `/auth/status?type=deleted` |
| `roles.includes('pending')` + `roles.includes('admin')` | `/companies/[id]/pending` |
| `roles.includes('pending')` + `target_company` | `/auth/status?type=staff-pending` |
| `roles.includes('chancedee')` | `/platform/dashboard` |
| Multi-role + no saved preference | `/auth/select-role` |
| Multi-role + saved preference | Saved preference dashboard |
| Single role `candidate` | `/candidates/[uid]` |
| Single role `company` | `/companies/[companyId]/dashboard` |

---

#### Test Hints

| Scenario | Setup | Expected |
|----------|-------|----------|
| Happy path - email | Valid email/password, terms checked | Session created, redirect to dashboard |
| Happy path - Google | Existing Google user | Session created, redirect |
| New Google user | First-time Google sign-in | Account created, candidate profile, redirect |
| Invalid credentials | Wrong password | Error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" |
| Deleted account | Account with `roles.includes('deleted')` | Redirect to `/auth/status?type=deleted` |
| Rate limited | 6th attempt in 15 min | Error: "กรุณารอสักครู่" |
| Multi-role user | Has both candidate + company | Redirect to `/auth/select-role` |
| Terms not accepted | Checkbox unchecked | Inline error, no submission |

---

#### Operational

| Aspect | Value |
|--------|-------|
| Rate Limit | 5 attempts / 15 minutes (Firebase enforced) |
| Timeout | 10 seconds (Firebase), 5 seconds (session creation) |
| Idempotency | Yes (same credentials = same result) |
| Cache | Session cookie (1 hour maxAge) |

---

#### Related Actions

| Action | Relationship |
|--------|--------------|
| register | Alternative for new users |
| requestPasswordReset | Recovery when password forgotten |
| selectRole | Next step for multi-role users |

---

### 3.2 Action: register

#### Purpose

Create a new user account (candidate via email/Google, or company via email with OTP verification).

---

#### Actor

| Aspect | Value |
|--------|-------|
| **Initiator** | Guest |
| **Affected** | New user account |
| **System** | Firebase Auth, Firestore, SendGrid (OTP) |

---

#### Entry Points

| RIS | Route | UI Trigger | Context Provided |
|-----|-------|------------|------------------|
| AUTH-R02 | `/auth/register` | Role selection + form submit | Role, email, password, company details |

---

#### Input Validation

**Common Fields:**

| Field | Type | Required | Rules | Error (TH) |
|-------|------|----------|-------|------------|
| email | string | ✅ | Valid email, not already registered | อีเมลนี้ถูกใช้งานแล้ว |
| password | string | ✅ | Min 8 chars, 1 lowercase, 1 uppercase, 1 digit, 1 special | รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร |
| confirmPassword | string | ✅ | Match password | รหัสผ่านไม่ตรงกัน |
| termsAccepted | boolean | ✅ | Must be true | กรุณายอมรับข้อกำหนด |

**Company Mode A (Create New):**

| Field | Type | Required | Rules | Error (TH) |
|-------|------|----------|-------|------------|
| companyNameTH | string | ✅ | Non-empty | กรุณาระบุชื่อบริษัท |
| registrationNumber | string | ✅ | 13 digits, Luhn valid | เลขทะเบียนไม่ถูกต้อง |
| industry | string | ✅ | From master list | กรุณาเลือกประเภทธุรกิจ |
| companySize | string | ✅ | S/M/L/XL/XXL | กรุณาเลือกขนาดบริษัท |
| document | File | ✅ | PDF/image, max 10MB | กรุณาอัพโหลดเอกสาร |

**Company Mode B (Join Existing):**

| Field | Type | Required | Rules | Error (TH) |
|-------|------|----------|-------|------------|
| selectedCompany | object | ✅ | Valid company UID | กรุณาเลือกบริษัท |
| nameCard | File | ✅ | Image, max 5MB | กรุณาอัพโหลดนามบัตร |

---

#### Security Matrix

| Check | Requirement | Failure Code | Failure Message (TH) |
|-------|-------------|--------------|----------------------|
| Email Unique | Not in Firebase Auth | EMAIL_EXISTS | อีเมลนี้ถูกใช้งานแล้ว |
| OTP Valid | Matches stored code | INVALID_OTP | รหัส OTP ไม่ถูกต้อง |
| OTP Not Expired | Within 15 minutes | OTP_EXPIRED | รหัส OTP หมดอายุ |
| Password Strong | Meets complexity | WEAK_PASSWORD | รหัสผ่านไม่ปลอดภัยเพียงพอ |
| Registration # Unique | Not already registered (Mode A) | COMPANY_EXISTS | เลขทะเบียนนี้มีในระบบแล้ว |

---

#### Preconditions (Guards)

| # | Condition | Failure Behavior |
|---|-----------|------------------|
| G1 | User not authenticated | Redirect to dashboard if logged in |
| G2 | Email not already registered | Show error + offer login link |
| G3 | OTP verified (step 2) | Cannot proceed to password step |

---

#### State Machine

```
[ROLE_SELECTION] ──────────────────────────────────────────┐
   │                                                        │
   │ role_selected (candidate)                              │
   ▼                                                        │
[CANDIDATE_FLOW] ──────────────────────────────────────┐   │
   │                                                    │   │
   │ google_click                    email_submit       │   │
   ▼                                 ▼                  │   │
[GOOGLE_AUTH]                   [SENDING_OTP]          │   │
   │                                 │                  │   │
   │ success                         │ otp_sent        │   │
   ▼                                 ▼                  │   │
[CREATE_SESSION]               [OTP_VERIFY]            │   │
   │                                 │                  │   │
   │                                 │ otp_valid       │   │
   │                                 ▼                  │   │
   │                           [SET_PASSWORD]          │   │
   │                                 │                  │   │
   │                                 │ password_set    │   │
   │                                 ▼                  │   │
   │ ◄──────────────────────── [CREATE_ACCOUNT]        │   │
   │                                 │                  │   │
   ▼                                 │                  │   │
[AWARD_BONUS] ◄──────────────────────┘                 │   │
   │                                                    │   │
   │ bonus_awarded                                      │   │
   ▼                                                    │   │
[REDIRECT_DASHBOARD] ──────────────────────────────────┴───┤
                                                           │
[ROLE_SELECTION] ──────────────────────────────────────────┤
   │                                                        │
   │ role_selected (company)                                │
   ▼                                                        │
[COMPANY_FLOW] ────────────────────────────────────────────┤
   │                                                        │
   │ email_submit                                           │
   ▼                                                        │
[SENDING_OTP] ─────────────────────────────────────────────┤
   │                                                        │
   │ otp_sent                                               │
   ▼                                                        │
[OTP_VERIFY] ──────────────────────────────────────────────┤
   │                                                        │
   │ otp_valid                                              │
   ▼                                                        │
[SET_PASSWORD] ─────────────────────────────────────────────┤
   │                                                        │
   │ password_set                                           │
   ▼                                                        │
[COMPANY_DETAILS] ─────────────────────────────────────────┤
   │                                                        │
   │ mode_a_submit              mode_b_submit               │
   ▼                            ▼                           │
[CREATE_COMPANY]           [JOIN_COMPANY]                   │
   │                            │                           │
   │ success                    │ success                   │
   ▼                            ▼                           │
[REDIRECT_PENDING] ◄────────────┘                          │
                                                           │
[ERROR] ◄──────────────────────────────────────────────────┘
```

---

#### Data Effects (Ordered)

**Candidate (Google OAuth):**

| Step | Operation | Collection/Target | Fields |
|------|-----------|-------------------|--------|
| 1 | Create | Firebase Auth | Google OAuth user |
| 2 | Create | `user_accounts` | `uid`, `email`, `roles: ['candidate']`, `is_active: true` |
| 3 | Create | `user_info` | Basic profile flags |
| 4 | Create | `candidate_information` | Name from Google, empty profile |
| 5 | Create | `pockets` | `balance: 100` (signup bonus) |
| 6 | Create | `wallet_transactions` | Signup bonus transaction |
| 7 | Create | Session Cookie | httpOnly, 1hr |
| 8 | Create | `consent_records` | Terms acceptance |
| 9 | Create (if refCode) | `candidate_referral` | Referral link |

**Candidate (Email):**

| Step | Operation | Collection/Target | Fields |
|------|-----------|-------------------|--------|
| 1 | Create | `otp_codes` | Send verification OTP |
| 2 | Update | `otp_codes` | Verify OTP |
| 3 | Create | Firebase Auth | Email/password user |
| 4-9 | Same as Google flow | — | — |

**Company Mode A (Create New):**

| Step | Operation | Collection/Target | Fields |
|------|-----------|-------------------|--------|
| 1-3 | Same as Candidate Email | — | OTP, password, Firebase Auth |
| 4 | Create | `user_accounts` | `roles: ['company', 'admin', 'pending']` |
| 5 | Upload | Firebase Storage | Company document |
| 6 | Create | `company_information` | Company details, `status: 'pending'` |
| 7 | Create | Session Cookie | — |
| 8 | Create | `consent_records` | Terms + employer terms |

**Company Mode B (Join Existing):**

| Step | Operation | Collection/Target | Fields |
|------|-----------|-------------------|--------|
| 1-3 | Same as Candidate Email | — | OTP, password, Firebase Auth |
| 4 | Create | `user_accounts` | `roles: ['candidate', 'pending']`, `target_company` |
| 5 | Upload | Firebase Storage | Name card image |
| 6 | Create | Session Cookie | — |
| 7 | Create | `consent_records` | Terms |

---

#### Notifications

| Trigger | Channel | Recipient | Template |
|---------|---------|-----------|----------|
| OTP sent | Email | Registering user | SendGrid `d-49496573d0954f62a25110c564ad89d3` |
| Company registered (Mode A) | Email | Platform admins | New company review notification |

---

#### Success Criteria

| Flow | Criterion | Validation Method |
|------|-----------|-------------------|
| Candidate | Session created, redirect to dashboard | At `/candidates/[uid]` |
| Company Mode A | Session created, redirect to pending | At `/companies/[id]/pending` |
| Company Mode B | Session created, redirect to status | At `/auth/status?type=staff-pending` |

---

#### Test Hints

| Scenario | Setup | Expected |
|----------|-------|----------|
| Candidate Google | New Google user | Account + profile created, 100 coin bonus |
| Candidate Email | Valid email, OTP verified | Account created, redirect to dashboard |
| Company Mode A | Valid company details | Company pending, redirect to pending page |
| Company Mode B | Select existing company | Staff pending, redirect to status page |
| Duplicate email | Email already registered | Error: "อีเมลนี้ถูกใช้งานแล้ว" |
| Invalid OTP | Wrong 6-digit code | Error: "รหัส OTP ไม่ถูกต้อง" |
| Expired OTP | After 15 minutes | Error: "รหัส OTP หมดอายุ" |
| Invalid registration # | Fails Luhn check | Inline validation error |
| Referral code | Valid `?refCode` param | Both parties awarded bonus |

---

#### Operational

| Aspect | Value |
|--------|-------|
| Rate Limit (OTP) | 3 requests / 5 minutes |
| Rate Limit (Register) | 3 accounts / hour per IP |
| OTP Expiry | 15 minutes |
| Timeout | 30 seconds (file upload), 10 seconds (other) |
| Idempotency | No (each registration creates new account) |

---

#### Related Actions

| Action | Relationship |
|--------|--------------|
| login | Alternative for existing users |
| verifyOTP | Sub-action for email verification |
| sendOTP | Sub-action to request OTP |

---

### 3.3 Action: sendOTP

#### Purpose

Send a 6-digit OTP code to an email address for verification.

---

#### Actor

| Aspect | Value |
|--------|-------|
| **Initiator** | Guest (registration) or Authenticated user (email change) |
| **Affected** | OTP codes collection |
| **System** | SendGrid email |

---

#### Entry Points

| RIS | Route | UI Trigger | Context Provided |
|-----|-------|------------|------------------|
| AUTH-R02 | `/auth/register` | Email form submit | Email address |
| AUTH-R03 | `/auth/verify` | Page load / Resend click | Email address, purpose |

---

#### Input Validation

| Field | Type | Required | Rules | Error (TH) |
|-------|------|----------|-------|------------|
| email | string | ✅ | Valid email format | รูปแบบอีเมลไม่ถูกต้อง |

---

#### Security Matrix

| Check | Requirement | Failure Code | Failure Message (TH) |
|-------|-------------|--------------|----------------------|
| Rate Limit | < 3 requests / 5 min | OTP_RATE_LIMITED | กรุณารอสักครู่ก่อนขอรหัสใหม่ |
| Email Format | Valid format | INVALID_EMAIL | รูปแบบอีเมลไม่ถูกต้อง |

---

#### Preconditions (Guards)

| # | Condition | Failure Behavior |
|---|-----------|------------------|
| G1 | Valid email format | Inline validation error |
| G2 | Not rate limited | Show cooldown message |

---

#### State Machine

```
[IDLE] ─────────────────────────────────┐
   │                                     │
   │ submit_email                        │
   ▼                                     │
[SENDING] ──────────────────────────┐   │
   │                                 │   │
   │ send_success                    │   │
   ▼                                 │   │
[SENT] ────────────────────────┐    │   │
   │                            │    │   │
   │ resend_click (after 60s)   │    │   │
   └────────────────────────────┴────┘   │
                                         │
[ERROR] ◄────────────────────────────────┘
```

---

#### Data Effects (Ordered)

| Step | Operation | Collection/Target | Fields |
|------|-----------|-------------------|--------|
| 1 | Update | `otp_codes` | Set old OTPs for email to `status: 'invalidated'` |
| 2 | Create | `otp_codes` | `email`, `otp_code` (6 digits), `ref_code` (10 chars), `status: 'active'`, `create_date` |
| 3 | Send | SendGrid | Email with OTP |

---

#### Notifications

| Trigger | Channel | Recipient | Template |
|---------|---------|-----------|----------|
| OTP created | Email | Target email | SendGrid OTP template |

---

#### Success Criteria

| Criterion | Validation Method |
|-----------|-------------------|
| OTP record created | `otp_codes` doc exists |
| Email sent | SendGrid API success |
| refCode returned | Client receives ref code for verification |

---

#### Test Hints

| Scenario | Setup | Expected |
|----------|-------|----------|
| First request | New email | OTP sent, refCode returned |
| Resend | After 60s cooldown | New OTP sent, old invalidated |
| Rate limited | 4th request in 5 min | Error with countdown |
| Invalid email | Bad format | Validation error |

---

#### Operational

| Aspect | Value |
|--------|-------|
| Rate Limit | 3 requests / 5 minutes per email |
| OTP Length | 6 digits |
| Ref Code Length | 10 characters |
| OTP Expiry | 15 minutes |
| Resend Cooldown | 60 seconds |

---

#### Related Actions

| Action | Relationship |
|--------|--------------|
| verifyOTP | Consumes the OTP |
| register | Parent flow |

---

### 3.4 Action: verifyOTP

#### Purpose

Verify a 6-digit OTP code matches the stored code for an email.

---

#### Actor

| Aspect | Value |
|--------|-------|
| **Initiator** | Guest (registration) or Authenticated user (email change) |
| **Affected** | OTP codes collection |
| **System** | Firestore |

---

#### Entry Points

| RIS | Route | UI Trigger | Context Provided |
|-----|-------|------------|------------------|
| AUTH-R02 | `/auth/register` | OTP form submit | refCode, otpCode |
| AUTH-R03 | `/auth/verify` | OTP form submit | refCode, otpCode |

---

#### Input Validation

| Field | Type | Required | Rules | Error (TH) |
|-------|------|----------|-------|------------|
| refCode | string | ✅ | 10 characters | รหัสอ้างอิงไม่ถูกต้อง |
| otpCode | string | ✅ | 6 digits | รหัส OTP ต้องมี 6 หลัก |

---

#### Security Matrix

| Check | Requirement | Failure Code | Failure Message (TH) |
|-------|-------------|--------------|----------------------|
| OTP Exists | Found by refCode | OTP_NOT_FOUND | ไม่พบรหัส OTP |
| OTP Not Used | `status !== 'used'` | OTP_ALREADY_USED | รหัส OTP ถูกใช้งานแล้ว |
| OTP Not Expired | Within 15 min | OTP_EXPIRED | รหัส OTP หมดอายุ |
| OTP Matches | Code matches | INVALID_OTP | รหัส OTP ไม่ถูกต้อง |
| Rate Limit | < 5 attempts / OTP | OTP_RATE_LIMITED | ลองผิดหลายครั้งเกินไป |

---

#### Preconditions (Guards)

| # | Condition | Failure Behavior |
|---|-----------|------------------|
| G1 | refCode provided | Show error |
| G2 | otpCode is 6 digits | Inline validation |

---

#### State Machine

```
[IDLE] ─────────────────────────────────┐
   │                                     │
   │ submit_otp                          │
   ▼                                     │
[VERIFYING] ────────────────────────┐   │
   │                                 │   │
   │ verify_success                  │   │
   ▼                                 │   │
[VERIFIED] ─► (proceed to next step) │   │
                                     │   │
   ┌─────────────────────────────────┘   │
   │ verify_error                        │
   ▼                                     │
[ERROR] ─────────────────────────────────┘
   │ retry
   └──► [IDLE]
```

---

#### Data Effects (Ordered)

| Step | Operation | Collection/Target | Fields |
|------|-----------|-------------------|--------|
| 1 | Read | `otp_codes` | Find by refCode |
| 2 | Validate | — | Check status, expiry, code match |
| 3 | Update | `otp_codes` | Set `status: 'used'` |

---

#### Success Criteria

| Criterion | Validation Method |
|-----------|-------------------|
| OTP marked used | `status` changed to 'used' |
| Flow proceeds | Next step rendered |

---

#### Test Hints

| Scenario | Setup | Expected |
|----------|-------|----------|
| Valid OTP | Correct 6 digits within 15 min | Success, proceed |
| Wrong OTP | Incorrect digits | Error: "รหัส OTP ไม่ถูกต้อง" |
| Expired OTP | After 15 minutes | Error: "รหัส OTP หมดอายุ" |
| Already used | Re-submit same OTP | Error: "รหัส OTP ถูกใช้งานแล้ว" |
| 6th attempt | After 5 wrong tries | Rate limit error |

---

#### Operational

| Aspect | Value |
|--------|-------|
| Rate Limit | 5 attempts per OTP |
| Timeout | 5 seconds |
| Idempotency | No (OTP consumed on success) |

---

#### Related Actions

| Action | Relationship |
|--------|--------------|
| sendOTP | Produces the OTP |
| register | Parent flow |

---

### 3.5 Action: requestPasswordReset

#### Purpose

Request a password reset email for an account.

---

#### Actor

| Aspect | Value |
|--------|-------|
| **Initiator** | Guest (forgot password) |
| **Affected** | Firebase Auth |
| **System** | Firebase Auth (sends email) |

---

#### Entry Points

| RIS | Route | UI Trigger | Context Provided |
|-----|-------|------------|------------------|
| AUTH-R04 | `/auth/reset` | Form submit | Email address |

---

#### Input Validation

| Field | Type | Required | Rules | Error (TH) |
|-------|------|----------|-------|------------|
| email | string | ✅ | Valid email format | รูปแบบอีเมลไม่ถูกต้อง |

---

#### Security Matrix

| Check | Requirement | Failure Code | Failure Message (TH) |
|-------|-------------|--------------|----------------------|
| Rate Limit | Firebase enforced | TOO_MANY_REQUESTS | กรุณารอสักครู่แล้วลองใหม่ |

**Note:** For security, we return success even if email doesn't exist (prevents enumeration).

---

#### Preconditions (Guards)

| # | Condition | Failure Behavior |
|---|-----------|------------------|
| G1 | Valid email format | Inline validation error |

---

#### State Machine

```
[IDLE] ─────────────────────────────────┐
   │                                     │
   │ form_submit                         │
   ▼                                     │
[SUBMITTING] ───────────────────────┐   │
   │                                 │   │
   │ firebase_success                │   │
   ▼                                 │   │
[SUCCESS] ─► (show confirmation)     │   │
                                     │   │
   ┌─────────────────────────────────┘   │
   │ firebase_error                      │
   ▼                                     │
[ERROR] ─────────────────────────────────┘
   │ retry
   └──► [IDLE]
```

---

#### Data Effects (Ordered)

| Step | Operation | Collection/Target | Fields |
|------|-----------|-------------------|--------|
| 1 | Call | Firebase Auth | `sendPasswordResetEmail(email)` |

**Note:** Firebase handles the email sending and password reset link. No Firestore writes needed.

---

#### Notifications

| Trigger | Channel | Recipient | Template |
|---------|---------|-----------|----------|
| Request submitted | Email | Target email (if exists) | Firebase password reset template |

---

#### Success Criteria

| Criterion | Validation Method |
|-----------|-------------------|
| Firebase call completes | No error thrown |
| Success UI shown | Confirmation message displayed |

---

#### Test Hints

| Scenario | Setup | Expected |
|----------|-------|----------|
| Valid email | Registered email | Success message (email sent) |
| Unknown email | Non-existent email | Success message (security) |
| Rate limited | Many requests | Error: "กรุณารอสักครู่" |
| Invalid format | Bad email | Inline validation error |

---

#### Operational

| Aspect | Value |
|--------|-------|
| Rate Limit | Firebase enforced |
| Timeout | 10 seconds |
| Idempotency | Yes (same email = same result) |

---

#### Related Actions

| Action | Relationship |
|--------|--------------|
| login | Return after reset |

---

### 3.6 Action: selectRole

#### Purpose

Allow multi-role users to choose which context (candidate or company) to enter.

---

#### Actor

| Aspect | Value |
|--------|-------|
| **Initiator** | Authenticated multi-role user |
| **Affected** | Client state only |
| **System** | Jotai atoms, localStorage |

---

#### Entry Points

| RIS | Route | UI Trigger | Context Provided |
|-----|-------|------------|------------------|
| AUTH-R07 | `/auth/select-role` | Role card click | Selected role |

---

#### Input Validation

| Field | Type | Required | Rules | Error (TH) |
|-------|------|----------|-------|------------|
| selectedRole | string | ✅ | 'candidate' or 'company' | — |
| rememberChoice | boolean | ❌ | — | — |

---

#### Security Matrix

| Check | Requirement | Failure Code | Failure Message (TH) |
|-------|-------------|--------------|----------------------|
| Authenticated | Session valid | 401 | กรุณาเข้าสู่ระบบ |
| Has Role | User has selected role | INVALID_ROLE | คุณไม่มีบทบาทนี้ |

---

#### Preconditions (Guards)

| # | Condition | Failure Behavior |
|---|-----------|------------------|
| G1 | User authenticated | Redirect to `/auth/login` |
| G2 | User has multiple roles | Auto-redirect to single role dashboard |
| G3 | User has selected role | Show error (shouldn't happen) |

---

#### State Machine

```
[CHECK_AUTH] ───────────────────────────────────────────┐
   │                                                     │
   │ authenticated + multi_role                          │
   ▼                                                     │
[CHECK_SAVED_PREF] ─────────────────────────────────┐   │
   │                                                 │   │
   │ no_saved_pref                                   │   │
   ▼                                                 │   │
[IDLE] ─────────────────────────────────────────┐   │   │
   │                                             │   │   │
   │ role_selected                               │   │   │
   ▼                                             │   │   │
[REDIRECTING] ──────────────────────────────────┴───┘   │
   │                                                     │
   ▼                                                     │
(dashboard) ◄────────────────────────────────────────────┘
                                                         
   has_saved_pref ──► [REDIRECTING]
   single_role ──► [REDIRECTING]
   not_authenticated ──► /auth/login
```

---

#### Data Effects (Ordered)

| Step | Operation | Collection/Target | Fields |
|------|-----------|-------------------|--------|
| 1 | Write | `activeRoleAtom` (Jotai) | Selected role |
| 2 | Write (if remember) | `localStorage.lastActiveRole` | Selected role |

**Note:** No server-side data changes. All state is client-side.

---

#### Success Criteria

| Criterion | Validation Method |
|-----------|-------------------|
| activeRoleAtom set | Atom contains selected role |
| Redirect executed | Browser at appropriate dashboard |
| Preference saved (if checked) | localStorage contains role |

---

#### Test Hints

| Scenario | Setup | Expected |
|----------|-------|----------|
| Select candidate | Multi-role user | Redirect to `/candidates/[uid]` |
| Select company | Multi-role user | Redirect to `/companies/[companyId]/dashboard` |
| Remember checked | Select + check remember | localStorage saved, skip on next login |
| Remember unchecked | Select without remember | No localStorage, show page on next login |
| Single role | User with only candidate | Auto-redirect, don't show page |

---

#### Operational

| Aspect | Value |
|--------|-------|
| Rate Limit | N/A |
| Timeout | N/A (client-side) |
| Idempotency | Yes |
| Cache | localStorage for preference |

---

#### Related Actions

| Action | Relationship |
|--------|--------------|
| login | Predecessor (routes here) |

---

### 3.7 Action: createPassword

#### Purpose

Create a password for OAuth-only users (Google/Facebook) to enable email login.

---

#### Actor

| Aspect | Value |
|--------|-------|
| **Initiator** | Authenticated user (OAuth-only) |
| **Affected** | Firebase Auth |
| **System** | Firebase Auth |

---

#### Entry Points

| RIS | Route | UI Trigger | Context Provided |
|-----|-------|------------|------------------|
| AUTH-R06 | `/auth/settings` (Password tab) | Form submit | New password, confirm |

---

#### Input Validation

| Field | Type | Required | Rules | Error (TH) |
|-------|------|----------|-------|------------|
| newPassword | string | ✅ | Min 8 chars, complexity rules | รหัสผ่านไม่ปลอดภัยเพียงพอ |
| confirmPassword | string | ✅ | Match newPassword | รหัสผ่านไม่ตรงกัน |

---

#### Security Matrix

| Check | Requirement | Failure Code | Failure Message (TH) |
|-------|-------------|--------------|----------------------|
| Authenticated | Session valid | 401 | กรุณาเข้าสู่ระบบ |
| OAuth Only | No password provider | ALREADY_HAS_PASSWORD | บัญชีนี้มีรหัสผ่านอยู่แล้ว |
| Password Strong | Meets complexity | WEAK_PASSWORD | รหัสผ่านไม่ปลอดภัยเพียงพอ |

---

#### Preconditions (Guards)

| # | Condition | Failure Behavior |
|---|-----------|------------------|
| G1 | User authenticated | Redirect to login |
| G2 | User is OAuth-only | Show "change password" instead |

---

#### State Machine

```
[IDLE] ─────────────────────────────────┐
   │                                     │
   │ form_submit                         │
   ▼                                     │
[CREATING] ─────────────────────────┐   │
   │                                 │   │
   │ success                         │   │
   ▼                                 │   │
[SUCCESS] ─► (show confirmation)     │   │
                                     │   │
   ┌─────────────────────────────────┘   │
   │ error                               │
   ▼                                     │
[ERROR] ─────────────────────────────────┘
   │ retry
   └──► [IDLE]
```

---

#### Data Effects (Ordered)

| Step | Operation | Collection/Target | Fields |
|------|-----------|-------------------|--------|
| 1 | Link | Firebase Auth | Link email/password provider |

---

#### Success Criteria

| Criterion | Validation Method |
|-----------|-------------------|
| Password provider added | Firebase user has password provider |
| Can login with email | Email/password login works |

---

#### Test Hints

| Scenario | Setup | Expected |
|----------|-------|----------|
| Create password | OAuth-only user, valid password | Password created, success toast |
| Weak password | Short or simple password | Validation error |
| Already has password | User with password provider | Show change password instead |

---

#### Operational

| Aspect | Value |
|--------|-------|
| Rate Limit | N/A |
| Timeout | 10 seconds |
| Idempotency | No (links provider) |

---

#### Related Actions

| Action | Relationship |
|--------|--------------|
| changePassword | Alternative for password users |
| login | Can use email/password after |

---

### 3.8 Action: changePassword

#### Purpose

Change the password for an existing email/password user.

---

#### Actor

| Aspect | Value |
|--------|-------|
| **Initiator** | Authenticated user (with password) |
| **Affected** | Firebase Auth |
| **System** | Firebase Auth |

---

#### Entry Points

| RIS | Route | UI Trigger | Context Provided |
|-----|-------|------------|------------------|
| AUTH-R06 | `/auth/settings` (Password tab) | Form submit | Current password, new password |

---

#### Input Validation

| Field | Type | Required | Rules | Error (TH) |
|-------|------|----------|-------|------------|
| currentPassword | string | ✅ | Non-empty | กรุณากรอกรหัสผ่านปัจจุบัน |
| newPassword | string | ✅ | Min 8 chars, complexity rules | รหัสผ่านไม่ปลอดภัยเพียงพอ |
| confirmPassword | string | ✅ | Match newPassword | รหัสผ่านไม่ตรงกัน |

---

#### Security Matrix

| Check | Requirement | Failure Code | Failure Message (TH) |
|-------|-------------|--------------|----------------------|
| Authenticated | Session valid | 401 | กรุณาเข้าสู่ระบบ |
| Has Password | Password provider exists | NO_PASSWORD | บัญชีนี้ไม่มีรหัสผ่าน |
| Current Valid | Re-authenticate success | WRONG_PASSWORD | รหัสผ่านปัจจุบันไม่ถูกต้อง |
| New Strong | Meets complexity | WEAK_PASSWORD | รหัสผ่านไม่ปลอดภัยเพียงพอ |
| Not Same | New ≠ Current | SAME_PASSWORD | รหัสผ่านใหม่ต้องไม่เหมือนรหัสเดิม |

---

#### Preconditions (Guards)

| # | Condition | Failure Behavior |
|---|-----------|------------------|
| G1 | User authenticated | Redirect to login |
| G2 | User has password provider | Show "create password" instead |

---

#### State Machine

```
[STEP_1_VERIFY] ────────────────────────────────────────┐
   │                                                     │
   │ submit_current_password                             │
   ▼                                                     │
[VERIFYING] ────────────────────────────────────────┐   │
   │                                                 │   │
   │ verify_success                                  │   │
   ▼                                                 │   │
[STEP_2_NEW] ───────────────────────────────────┐   │   │
   │                                             │   │   │
   │ submit_new_password                         │   │   │
   ▼                                             │   │   │
[CHANGING] ─────────────────────────────────┐   │   │   │
   │                                         │   │   │   │
   │ change_success                          │   │   │   │
   ▼                                         │   │   │   │
[SUCCESS] ─► (show confirmation, reset)      │   │   │   │
                                             │   │   │   │
[ERROR] ◄────────────────────────────────────┴───┴───┴───┘
```

**Note:** Two-step process:
1. Verify current password (re-authenticate)
2. Set new password

---

#### Data Effects (Ordered)

| Step | Operation | Collection/Target | Fields |
|------|-----------|-------------------|--------|
| 1 | Re-auth | Firebase Auth | Verify current password |
| 2 | Update | Firebase Auth | Set new password |

---

#### Success Criteria

| Criterion | Validation Method |
|-----------|-------------------|
| Password changed | Firebase updatePassword succeeds |
| Can login with new | New password works |

---

#### Test Hints

| Scenario | Setup | Expected |
|----------|-------|----------|
| Valid change | Correct current, valid new | Success toast, form reset |
| Wrong current | Incorrect current password | Error: "รหัสผ่านปัจจุบันไม่ถูกต้อง" |
| Weak new | Simple new password | Validation error |
| Same password | New = Current | Error: "รหัสผ่านใหม่ต้องไม่เหมือนรหัสเดิม" |

---

#### Operational

| Aspect | Value |
|--------|-------|
| Rate Limit | N/A |
| Timeout | 10 seconds |
| Idempotency | Yes (same new password = same result) |

---

#### Related Actions

| Action | Relationship |
|--------|--------------|
| createPassword | Alternative for OAuth users |
| requestPasswordReset | Alternative when forgotten |

---

## 4. Data Entity Verification

### 4.1 Collections Used

| Collection | Source Document | Verified Fields |
|------------|-----------------|-----------------|
| `user_accounts` | `data-entities_user-accounts.md` | uid, email, roles, company_id, is_active, status, target_company |
| `user_info` | `data-entities_user-info.md` | roles, isVerified, isOnboarded |
| `otp_codes` | `data-entities_otp-codes.md` | email, otp_code, ref_code, status, create_date |
| `candidate_information` | `data-entities_candidate-information.md` | All profile fields |
| `company_information` | `data-entities_company-information.md` | company_name, status |
| `consent_records` | `data-entities_consent-records.md` | All consent fields |
| `pockets` | `data-entities_pockets.md` | balance |
| `wallet_transactions` | `data-entities_wallet-transactions.md` | Transaction fields |
| `candidate_referral` | `data-entities_candidate-referral.md` | Referral fields |

### 4.2 Inconsistencies Found

| Issue | Location | Resolution |
|-------|----------|------------|
| None identified | — | — |

---

## 5. Cross-Cutting Concerns

### 5.1 Authentication Required Actions

| Action | Auth Required | Pre-Auth Allowed |
|--------|---------------|------------------|
| login | No | ✅ |
| register | No | ✅ |
| sendOTP | No (registration) / Yes (email change) | Partial |
| verifyOTP | No (registration) / Yes (email change) | Partial |
| requestPasswordReset | No | ✅ |
| selectRole | Yes | — |
| createPassword | Yes | — |
| changePassword | Yes | — |

### 5.2 Rate Limiting Summary

| Action | Limit | Window | Enforced By |
|--------|-------|--------|-------------|
| login | 5 attempts | 15 min | Firebase |
| register | 3 accounts | 1 hour | Application |
| sendOTP | 3 requests | 5 min | Application |
| verifyOTP | 5 attempts | Per OTP | Application |
| requestPasswordReset | Varies | — | Firebase |

### 5.3 Error Handling Pattern

All actions follow the standard error handling pattern from BLS-00:

```typescript
try {
  // Action logic
} catch (error) {
  // Map to specific error code
  // Return Thai error message
  // Log for debugging
  return { success: false, error: { code, message } };
}
```

---

## 6. Appendix: Password Validation Rules

```typescript
// Matching existing PASSWORD_REGEX from features_authentication.md
const PASSWORD_RULES = {
  minLength: 8,
  requireLowercase: true,  // [a-z]
  requireUppercase: true,  // [A-Z]
  requireDigit: true,      // \d
  requireSpecial: true,    // [@$!%*?&]
};

const PASSWORD_ERRORS = {
  tooShort: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร',
  noLowercase: 'ต้องมีตัวอักษรพิมพ์เล็ก',
  noUppercase: 'ต้องมีตัวอักษรพิมพ์ใหญ่',
  noDigit: 'ต้องมีตัวเลข',
  noSpecial: 'ต้องมีอักขระพิเศษ (@$!%*?&)',
};
```

---

## 7. Appendix: Post-Login Routing Flowchart

```
                    ┌─────────────────────┐
                    │   Login Success     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Check Deleted?     │
                    └──────────┬──────────┘
                               │
              ┌────────────────┴────────────────┐
              │ yes                              │ no
              ▼                                  ▼
    ┌─────────────────┐              ┌─────────────────────┐
    │ /auth/status    │              │  Check Pending?     │
    │ ?type=deleted   │              └──────────┬──────────┘
    └─────────────────┘                         │
                                   ┌────────────┴────────────┐
                                   │ yes                      │ no
                                   ▼                          ▼
                         ┌─────────────────┐      ┌─────────────────────┐
                         │ Has Admin role? │      │  Check Chancedee?   │
                         └────────┬────────┘      └──────────┬──────────┘
                                  │                          │
                    ┌─────────────┴─────────────┐            │
                    │ yes                        │ no        │
                    ▼                            ▼           │
          ┌───────────────────┐    ┌───────────────────┐     │
          │ /companies/[id]   │    │ /auth/status      │     │
          │ /pending          │    │ ?type=staff-pending│    │
          └───────────────────┘    └───────────────────┘     │
                                                             │
                                               ┌─────────────┴─────────────┐
                                               │ yes                        │ no
                                               ▼                            ▼
                                     ┌─────────────────┐      ┌─────────────────────┐
                                     │ /platform/      │      │  Multi-Role?        │
                                     │ dashboard       │      └──────────┬──────────┘
                                     └─────────────────┘                 │
                                                            ┌────────────┴────────────┐
                                                            │ yes                      │ no
                                                            ▼                          ▼
                                                  ┌─────────────────┐    ┌─────────────────────┐
                                                  │ Saved Pref?     │    │ Single Role         │
                                                  └────────┬────────┘    │ Dashboard           │
                                                           │             └─────────────────────┘
                                              ┌────────────┴────────────┐
                                              │ yes                      │ no
                                              ▼                          ▼
                                    ┌─────────────────┐      ┌─────────────────────┐
                                    │ Saved Pref      │      │ /auth/select-role   │
                                    │ Dashboard       │      └─────────────────────┘
                                    └─────────────────┘
```

---

*End of BLS-01: Onboarding Stage Business Logic v1.0*
