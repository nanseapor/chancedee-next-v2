# AUTH-R02 SA Review - Issue Resolution

**Date:** 2025-12-13
**Reviewer:** SA (Software Architect)
**Status:** ⚠️ BLOCKING ISSUES FOUND

---

## Document Precedence Applied

Per PROJECT_INSTRUCTIONS §4.4:

| Priority | Document Type | Authority |
|----------|---------------|-----------|
| **1** | **RIS** documents | **Source of truth for NEW implementation** |
| **2** | BLS documents | Business logic specifications |

**Rule:** When RIS and BLS conflict, **RIS wins** but deviations must be documented.

---

## BLOCKING ISSUES

### ❌ Issue 1: Rate Limit Discrepancy

#### Problem

Three different sources specify different rate limits:

| Source | Send OTP | Verify OTP |
|--------|----------|------------|
| **BLS-01 §3.3** | 3 requests / 5 minutes | 5 attempts / OTP |
| **Existing Code** (`rate-limiter.ts`) | **5 requests / 15 minutes** | **5 attempts / 10 minutes** |
| RIS AUTH-R02 §15 | 10 requests / 15 minutes | 5 attempts / 5 minutes |

#### Resolution: ✅ **Use existing implementation (AUTH-R00 already deployed)**

**Rationale:**
- AUTH-R00 infrastructure is already implemented and deployed
- `otp-actions.ts` already uses `withRateLimit` with `OTP_REQUEST` and `OTP_VERIFY` configs
- Changing rate limits now would break existing code
- Existing limits (5/15min, 5/10min) are **more permissive** than BLS-01 (3/5min) but **more restrictive** than RIS (10/15min)
- Middle ground is acceptable for security + UX

**Implementation:**
```typescript
// ALREADY IMPLEMENTED in src/lib/utils/server/rate-limiter.ts

export const RATE_LIMIT_CONFIGS = {
  OTP_REQUEST: {
    maxAttempts: 5,              // ← Use this
    windowMs: 15 * 60 * 1000,    // 15 minutes
    blockDurationMs: 30 * 60 * 1000,
  },
  OTP_VERIFY: {
    maxAttempts: 5,              // ← Use this
    windowMs: 10 * 60 * 1000,    // 10 minutes
    blockDurationMs: 30 * 60 * 1000,
  },
};
```

**Action Required:**
- ✅ No code changes needed (already correct)
- ✅ Document deviation in plan Section 15 (new section)
- ✅ Update BLS-01 to match implementation (future task, not blocking)

---

### ❌ Issue 2: Company Mode B Roles (CRITICAL ERROR)

#### Problem

**Implementation plan says:**
> `createCompanyAccountPending`: Create user_accounts with `roles=['company', 'admin', 'pending']`

**BLS-01 §3.2 Data Effects (Company Mode B) says:**
> Step 4: Create `user_accounts` with `roles: ['candidate', 'pending']`, `target_company`

#### Resolution: ✅ **Two separate roles for Mode A vs Mode B**

**Correct Roles:**

| Mode | `roles` Array | `target_company` | After Approval |
|------|---------------|------------------|----------------|
| **Mode A** (Create New) | `['company', 'admin', 'pending']` | `newCompanyId` | `['company', 'admin']` |
| **Mode B** (Join Existing) | `['candidate', 'pending']` | `existingCompanyId` | `['candidate', 'company']` (staff) |

**Why Different:**
- **Mode A:** User is creating a NEW company → will be company admin when approved
- **Mode B:** User is joining EXISTING company → will be staff member when approved
- Mode B users start with `candidate` role as fallback (can use platform while waiting)

**Implementation Fix:**

Option A: **Two separate server actions (RECOMMENDED)**
```typescript
// Mode A: Create new company
async function createCompanyAccountModeA(data) {
  await webUserAccountsCreate({
    uid: data.firebaseUid,
    email: data.email,
    roles: ['company', 'admin', 'pending'], // ← Mode A roles
    transfer: {
      target_company: newCompanyId,
      transfer_approved: false,
    }
  });
}

// Mode B: Join existing company
async function createCompanyAccountModeB(data) {
  await webUserAccountsCreate({
    uid: data.firebaseUid,
    email: data.email,
    roles: ['candidate', 'pending'], // ← Mode B roles (DIFFERENT!)
    transfer: {
      target_company: selectedCompanyId,
      transfer_approved: false,
    }
  });
}
```

Option B: **Single action with mode parameter**
```typescript
async function createCompanyAccount(data: {
  firebaseUid: string;
  email: string;
  mode: 'new' | 'join';
  targetCompanyId: string;
}) {
  const roles = data.mode === 'new'
    ? ['company', 'admin', 'pending']  // Mode A
    : ['candidate', 'pending'];         // Mode B

  await webUserAccountsCreate({
    uid: data.firebaseUid,
    email: data.email,
    roles, // ← Conditional based on mode
    transfer: {
      target_company: data.targetCompanyId,
      transfer_approved: false,
    }
  });
}
```

**Action Required:**
- ✅ Update plan Section 2.2 to show TWO separate actions OR conditional logic
- ✅ Update plan Section 4.5.3 and 4.5.4 payloads with correct roles
- ✅ Update Thai copy for different success messages

---

### ❌ Issue 3: Post-Registration Routing

#### Problem

BLS-01 and RIS AUTH-R02 specify **different destinations** after registration:

| Flow | BLS-01 Destination | RIS AUTH-R02 Destination |
|------|-------------------|-------------------------|
| Candidate | `/candidates/[uid]` | `/candidates/[uid]?tab=onboarding` |
| Company Mode A | `/companies/[id]/pending` | Stay on `/auth/register?step=pending&mode=new` |
| Company Mode B | `/auth/status?type=staff-pending` | Stay on `/auth/register?step=pending&mode=join` |

#### Resolution: ✅ **Follow RIS (higher precedence) with deviation note**

**Per Document Precedence Rule:** RIS wins.

**RIS Routing (USE THIS):**

```typescript
// After successful registration

// Candidate
if (role === 'candidate') {
  router.push(`/candidates/${uid}?tab=onboarding`);
}

// Company Mode A
if (mode === 'new') {
  // Stay on page, show success card
  setStep(3);
  updateURL('?role=company&step=pending&mode=new');
}

// Company Mode B
if (mode === 'join') {
  // Stay on page, show success card
  setStep(3);
  updateURL('?role=company&step=pending&mode=join');
}
```

**Deviation Note:**
> BLS-01 specifies redirecting to separate pages (`/companies/[id]/pending`, `/auth/status?type=staff-pending`), but RIS AUTH-R02 keeps the user on the registration page with a success card. This provides better UX by showing the context of what was just completed. The success card includes a "Check Status" link to navigate to the status pages if desired.

**Action Required:**
- ✅ Update plan Section 5.1 (State Machine) with correct SUCCESS state destinations
- ✅ Add deviation note in Section 15 (BLS-01 Deviations)
- ✅ Update E2E test assertions to check for query params instead of redirects

---

## NON-BLOCKING ISSUES (Should Address)

### ⚠️ Issue 4: Platform Admin Notification (Mode A)

**BLS-01 §3.2 Notifications:**
> Company registered (Mode A) → Email → Platform admins → New company review notification

**Currently Missing:** Platform admin email notification trigger.

**Resolution:** Add to `createNewCompany` action.

```typescript
async function createNewCompany(data) {
  // ... create company_information ...

  // Send notification to platform admins
  await sendEmailNotification({
    to: process.env.PLATFORM_ADMIN_EMAILS?.split(',') || [],
    template: 'company-registration-pending',
    data: {
      companyName: data.companyName,
      taxId: data.taxId,
      requestorEmail: data.email,
      reviewUrl: `${baseUrl}/platform/companies/pending/${companyId}`
    }
  });

  return { success: true, companyId };
}
```

**Action Required:**
- ✅ Add notification step to Section 2.3 (Action Implementation Details)
- ✅ Add to Section 4.2 (Write Operations) table
- ✅ Create email template spec in future RIS

---

### ⚠️ Issue 5: OTP Resend Cooldown

**BLS-01 §3.3 Operational:**
> Resend Cooldown: 60 seconds

**Currently in Plan:** Not explicitly specified.

**Resolution:** Add to `OTPResendButton` spec.

```typescript
// In use-otp-verification.ts hook
const [cooldownSeconds, setCooldownSeconds] = useState(60);

useEffect(() => {
  if (cooldownSeconds > 0) {
    const timer = setTimeout(() => {
      setCooldownSeconds(prev => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }
}, [cooldownSeconds]);

// In OTPResendButton.tsx
<Button disabled={cooldownSeconds > 0}>
  {cooldownSeconds > 0
    ? `ส่งรหัสใหม่ได้ในอีก ${cooldownSeconds} วินาที`
    : 'ส่งรหัสใหม่'}
</Button>
```

**Action Required:**
- ✅ Add cooldown spec to Section 3.3 (Hooks) - `useOTPVerification`
- ✅ Add Thai copy to Section 6.3 (OTP Verification)
- ✅ Add test case: "Resend button disabled for 60 seconds after send"

---

### ⚠️ Issue 6: Consent Records Creation

**BLS-01 §3.2 Data Effects:**
- Candidate Google: Step 8 - Create `consent_records`
- Candidate Email: Step 8 - Create `consent_records`
- Company Mode A: Step 8 - Create `consent_records`
- Company Mode B: Step 7 - Create `consent_records`

**Currently in Plan:** Mentioned but not detailed in server action specs.

**Resolution:** Add explicit consent logging to all registration actions.

```typescript
async function createCandidateAccount(data) {
  // ... create user_accounts + candidate_information + wallet ...

  // Step 8: Log consent record
  await webConsentRecordsCreate({
    uid: generateUUID(),
    user_id: data.firebaseUid,
    session_id: null,
    ip_hash: hashIp(clientIP).substring(0, 16),
    user_agent: headers['user-agent'],
    policy_version: '2.0',
    preferences: {
      essential: true,
      analytics: data.analyticsAccepted || true,
      marketing: data.marketingAccepted || true,
      functional: true
    },
    consent_method: 'registration',
    created_by: data.firebaseUid,
    created_at: serverTimestamp()
  });
}
```

**Action Required:**
- ✅ Add consent record step to Section 2.3 (createCandidateAccount detail)
- ✅ Add consent record step to Section 2.3 (createNewCompany detail)
- ✅ Add consent record step to Section 2.3 (joinExistingCompany detail)
- ✅ Add to Section 4.2 (Write Operations) table
- ✅ Import `webConsentRecordsCreate` from existing repository actions

---

## Summary of Required Changes

### Immediate (Blocking)

| Issue | Section | Change |
|-------|---------|--------|
| Rate limits | 2.1, 15 | Document deviation, no code changes |
| Company Mode B roles | 2.2, 4.5.4 | Fix roles array, split server actions |
| Post-reg routing | 5.1, 15 | Update SUCCESS state, add deviation note |

### Follow-Up (Non-Blocking)

| Issue | Section | Change |
|-------|---------|--------|
| Admin notification | 2.3, 4.2 | Add email trigger to createNewCompany |
| OTP cooldown | 3.3, 6.3 | Add 60s spec to hook and Thai copy |
| Consent records | 2.3, 4.2 | Add explicit consent logging steps |

---

## Updated Implementation Checklist

- [ ] Fix Company Mode B roles (`['candidate', 'pending']` not `['company', 'admin', 'pending']`)
- [ ] Update routing to stay on page with query params (RIS precedence)
- [ ] Add Section 15: BLS-01 Deviations
- [ ] Document rate limit deviation (existing code wins)
- [ ] Add admin notification to Mode A flow
- [ ] Add 60-second cooldown to OTP resend
- [ ] Add consent record creation to all registration actions

---

*SA Review Date: 2025-12-13*
*Resolution Author: Implementation Team*
*Status: ⏳ AWAITING PLAN UPDATE*
