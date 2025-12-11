# JOB-R02b: Apply Modal Supplement Specification

**Version:** 1.0  
**Last Updated:** 2025-12-10  
**Route:** `/jobs/[id]` (Apply Modal Component)  
**Route ID:** JOB-R02b  
**Primary Domain:** Jobs  
**Parent RIS:** JOB-R02_job-detail_RIS.md

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-10 | Initial apply modal detailed specification, covering JOB-013/014/015 features |

---

## 1. Purpose

This document supplements JOB-R02 with detailed specifications for the **Apply Modal** flow, including:
- Application form fields and validation
- Application submission flow (JOB-013)
- Application editing (JOB-015)
- Application withdrawal (JOB-014)
- Post-application state management
- Cross-domain interactions with chat and notifications

**Cross-References:**
- **JOB-R02** for sidebar state machine and page context
- **JOB-R00** for shared patterns (login prompt, error handling)
- **CAND-R04** for candidate applications tracking (destination after apply)

---

## 2. Feature Mapping

### 2.1 Features Covered

| Feature ID | Feature Name | Implementation | Notes |
|------------|--------------|----------------|-------|
| JOB-013 | Apply for Job | Apply Modal + Server Action | Primary feature |
| JOB-014 | Withdraw Application | Already Applied Card | Available after application |
| JOB-015 | Edit Application | Edit Mode in Modal | Before company response |

**Source:** `features_jobs.md` lines 796-950

### 2.2 Feature Flow Diagram

```
                    ┌─────────────────┐
                    │   JOB DETAIL    │
                    │    (JOB-R02)    │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
         NOT LOGGED IN   INCOMPLETE    READY TO APPLY
              │              │              │
              ▼              ▼              ▼
       ┌──────────┐   ┌───────────┐   ┌───────────┐
       │ LOGIN    │   │ PROFILE   │   │  APPLY    │
       │ PROMPT   │   │ BLOCK     │   │  MODAL    │
       └──────────┘   └───────────┘   └─────┬─────┘
                                            │
                                     ┌──────┴──────┐
                                     │   SUBMIT    │
                                     └──────┬──────┘
                                            │
                              ┌─────────────┼─────────────┐
                              │             │             │
                           SUCCESS       ERROR       ALREADY
                              │             │         APPLIED
                              ▼             ▼             │
                     ┌────────────┐  ┌───────────┐       │
                     │  APPLIED   │  │ SHOW ERR  │       │
                     │   CARD     │  │ RETRY     │       │
                     └─────┬──────┘  └───────────┘       │
                           │                             │
                           ├─────────────────────────────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
         VIEW JOB      MESSAGE      WITHDRAW
              │        COMPANY          │
              │            │            │
              ▼            ▼            ▼
        /jobs/[id]    /chat/[id]    JOB-014
```

---

## 3. Apply Modal Specification

### 3.1 Modal Structure

| Component | Purpose | Position | Action |
|-----------|---------|----------|--------|
| **Modal Header** | Title + close | Top | - |
| ↳ Title | "สมัครงาน" | Left | - |
| ↳ Close Button | × | Right | Close modal |
| **Job Summary** | Context | Top | - |
| ↳ Job Title | Position name | - | - |
| ↳ Company Name | Employer | - | - |
| ↳ Location | Province | - | - |
| **Form Section** | Application fields | Main | - |
| ↳ Expected Salary | Salary input | Full-width | - |
| ↳ Negotiable Toggle | Checkbox | Below salary | - |
| ↳ Availability | Dropdown | Full-width | - |
| ↳ Cover Letter | Textarea | Full-width | Optional |
| **Action Bar** | Submit controls | Bottom, sticky | - |
| ↳ Cancel Button | "ยกเลิก" | Left | Close modal |
| ↳ Submit Button | "ส่งใบสมัคร" | Right | Submit application |

### 3.2 Form Fields Detail

| Field | Type | Required | Validation | Default | Label (Thai) |
|-------|------|----------|------------|---------|--------------|
| `expectedSalary` | number | No | >= 0, max 999,999 | null | เงินเดือนที่คาดหวัง |
| `isNegotiable` | boolean | No | - | true | ต่อรองได้ |
| `overheadDays` | enum | No | Predefined values | 0 | สามารถเริ่มงานได้ |
| `headlines` | string | No | max 500 chars | '' | แนะนำตัวเอง (ไม่บังคับ) |

### 3.3 Availability Options

| Value | Label (Thai) | Label (English) |
|-------|-------------|-----------------|
| `0` | ได้ทันที | Immediately |
| `7` | ภายใน 1 สัปดาห์ | Within 1 week |
| `15` | ภายใน 2 สัปดาห์ | Within 2 weeks |
| `30` | ภายใน 1 เดือน | Within 1 month |
| `60` | ภายใน 2 เดือน | Within 2 months |
| `90` | ภายใน 3 เดือน | Within 3 months |

### 3.4 Form State Shape

```typescript
interface ApplyFormState {
  expectedSalary: number | null;
  isNegotiable: boolean;
  overheadDays: number;       // 0, 7, 15, 30, 60, 90
  headlines: string;          // Cover letter
}

const defaultApplyForm: ApplyFormState = {
  expectedSalary: null,
  isNegotiable: true,
  overheadDays: 0,
  headlines: '',
};

// Validation
interface FormValidation {
  isValid: boolean;
  errors: {
    expectedSalary?: string;  // "เงินเดือนต้องมากกว่า 0"
    headlines?: string;       // "ข้อความยาวเกินไป"
  };
}
```

---

## 4. UI State Machine

### 4.1 Apply Modal State Automaton

```
         ┌───────────────────────────────────────────────────────┐
         │                                                       │
         ▼                                                       │
  ┌─────────────┐                                               │
  │   CLOSED    │◀─────────────────────────────────────────┐    │
  └──────┬──────┘                                          │    │
         │                                                 │    │
     OPEN_MODAL                                           │    │
   (apply click)                                          │    │
         │                                                 │    │
         ▼                                                 │    │
  ┌─────────────┐                                          │    │
  │   EDITING   │◀────────────┐                           │    │
  └──────┬──────┘             │                            │    │
         │                    │                            │    │
    ┌────┴────┐          SUBMIT_ERROR                      │    │
    │         │               │                            │    │
  SUBMIT   CANCEL/            │                            │    │
    │      DISMISS            │                            │    │
    │         │               │                            │    │
    ▼         └───────────────┼────────────────────────────┘    │
  ┌─────────────┐             │                                 │
  │ SUBMITTING  │─────────────┘                                 │
  └──────┬──────┘                                               │
         │                                                       │
    SUBMIT_SUCCESS                                               │
         │                                                       │
         ▼                                                       │
  ┌─────────────┐                                               │
  │   SUCCESS   │───────────────────────────────────────────────┘
  │  (toast +   │       (auto-close after toast)
  │  close)     │
  └─────────────┘
```

### 4.2 Modal State Transition Table

| Current State | Event | Next State | Guard Condition | Side Effects |
|---------------|-------|------------|-----------------|--------------|
| `closed` | `OPEN_MODAL` | `editing` | `isResumeCompleted` | Initialize form with defaults |
| `closed` | `OPEN_MODAL` | `closed` | `!isResumeCompleted` | Scroll to profile block |
| `editing` | `FIELD_CHANGE` | `editing` | - | Update form state |
| `editing` | `SUBMIT` | `submitting` | `form.isValid` | Disable submit button |
| `editing` | `SUBMIT` | `editing` | `!form.isValid` | Show validation errors |
| `editing` | `CANCEL` | `closed` | - | Clear form state |
| `editing` | `DISMISS` | `closed` | - | Clear form state |
| `submitting` | `SUCCESS` | `closed` | - | Show success toast, refresh application status |
| `submitting` | `ERROR` | `editing` | `!isAlreadyApplied` | Show error toast, enable button |
| `submitting` | `ERROR` | `closed` | `isAlreadyApplied` | Show info toast, transition to applied state |

### 4.3 Form Validation State

```typescript
function validateApplyForm(form: ApplyFormState): FormValidation {
  const errors: FormValidation['errors'] = {};
  
  if (form.expectedSalary !== null && form.expectedSalary < 0) {
    errors.expectedSalary = 'เงินเดือนต้องมากกว่า 0';
  }
  
  if (form.expectedSalary !== null && form.expectedSalary > 999999) {
    errors.expectedSalary = 'เงินเดือนสูงเกินไป';
  }
  
  if (form.headlines.length > 500) {
    errors.headlines = 'ข้อความยาวเกินไป (สูงสุด 500 ตัวอักษร)';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
```

---

## 5. Data Contract

### 5.1 Application Input

| Field | Type | Required | Source | Validation |
|-------|------|----------|--------|------------|
| `jobId` | string | Yes | URL param | Valid job ID |
| `candidateId` | string | Yes | Session | Current user UID |
| `expectedSalary` | number | No | Form | >= 0 |
| `isNegotiable` | boolean | No | Form | - |
| `overheadDays` | number | No | Form | 0, 7, 15, 30, 60, 90 |
| `headlines` | string | No | Form | Max 500 chars |

### 5.2 Server Action: JobApplicationSet

**Signature:**
```typescript
async function JobApplicationSet(input: {
  jobId: string;
  candidateId: string;
  expectedSalary?: number;
  isNegotiable?: boolean;
  overheadDays?: number;
  headlines?: string;
}): Promise<{
  success: boolean;
  applicationId?: string;
  error?: string;
}>
```

**Preconditions:**
| Condition | Check | Failure Response |
|-----------|-------|------------------|
| User authenticated | Firebase ID token | Throw "Unauthorized" |
| Job exists | Document lookup | Throw "Job not found" |
| Candidate exists | Document lookup | Throw "Candidate not found" |
| Not already applied | Existing application check | Throw "Application already existed" |
| Can reapply if withdrawn | Status check | Reset status to 'applied' |

**Side Effects:**
| Effect | Target | Description |
|--------|--------|-------------|
| create/update | `web_job_applications` | New or reset application |
| invalidate | SWR cache | `candidateApplication-{uid}`, `application-{uid}-{jobId}` |
| send | Email | Notify company with candidate info |
| check | Rewards | First application reward check |

### 5.3 Application Result Display

After successful submission, the sidebar transitions to "Already Applied" state:

```typescript
interface ExistingApplication {
  applicationId: string;
  status: ApplicationStatus;
  createdAt: number;
  updatedAt: number;
  chatId?: string;  // If accepted
}

type ApplicationStatus = 
  | 'applied'      // Enum: new → DB: applied
  | 'read'
  | 'accepted'
  | 'rejected'
  | 'scheduled'
  | 'confirmed'
  | 'declined'
  | 'withdraw'
  | 'closed'
  | 'systemclosed';
```

---

## 6. Application Status Management

### 6.1 Status Transitions (Candidate Actions)

| Current State | Action | Next State | Guard | Side Effect |
|---------------|--------|------------|-------|-------------|
| `none` | APPLY | `applied` | Profile complete, job visible | Notify company |
| `applied` | WITHDRAW | `withdraw` | - | Notify company |
| `read` | WITHDRAW | `withdraw` | - | Notify company |
| `accepted` | WITHDRAW | `withdraw` | - | Notify company |
| `withdraw` | REAPPLY | `applied` | Job still visible | Reset application |

### 6.2 Status Display Mapping

| Status | Badge Color | Label (Thai) | Actions Available |
|--------|-------------|--------------|-------------------|
| `applied` | Blue | ส่งใบสมัครแล้ว | View Job, Withdraw |
| `read` | Gray | บริษัทดูแล้ว | View Job, Withdraw |
| `accepted` | Green | ผ่านการคัดเลือก | View Job, Message, Withdraw |
| `rejected` | Red | ไม่ผ่านการคัดเลือก | View Job |
| `scheduled` | Orange | นัดสัมภาษณ์แล้ว | View Job, Message, Confirm/Decline |
| `confirmed` | Green | ยืนยันสัมภาษณ์แล้ว | View Job, Message |
| `declined` | Gray | ปฏิเสธสัมภาษณ์ | View Job |
| `withdraw` | Gray | ถอนใบสมัครแล้ว | View Job, Reapply |
| `closed` | Gray | ปิดรับสมัครแล้ว | View Job |
| `systemclosed` | Gray | ปิดโดยระบบ | View Job |

---

## 7. Already Applied Card Specification

### 7.1 Card Structure

| Component | Purpose | Condition | Action |
|-----------|---------|-----------|--------|
| **Status Icon** | Visual indicator | Always | - |
| ↳ ✓ Check (green) | Applied/Accepted | `status in [applied, read, accepted, scheduled, confirmed]` | - |
| ↳ ✕ Cross (red) | Rejected | `status === rejected` | - |
| ↳ — Dash (gray) | Withdrawn/Closed | `status in [withdraw, closed, systemclosed]` | - |
| **Title** | "คุณสมัครงานนี้แล้ว" | Always | - |
| **Applied Date** | "เมื่อ DD MMM YYYY" | Always | - |
| **Status Badge** | Current status | Always | Color-coded |
| **Interview Info** | If scheduled | `status in [scheduled, confirmed]` | - |
| ↳ Date/Time | Interview appointment | - | - |
| ↳ Type | online/onsite | - | - |
| **Action Buttons** | Available actions | Varies by status | - |
| ↳ View Application | "ดูใบสมัคร" | Always | → .../applications |
| ↳ Message Company | "ส่งข้อความ" | `status in [accepted, scheduled, confirmed]` | → /chat/[roomId] |
| ↳ Withdraw | "ถอนใบสมัคร" | `status in [applied, read, accepted]` | Confirm modal |
| ↳ Reapply | "สมัครอีกครั้ง" | `status === withdraw && job.isActive` | Open apply modal |

### 7.2 Withdraw Confirmation Modal

| Component | Purpose | Action |
|-----------|---------|--------|
| Title | "ถอนใบสมัคร" | - |
| Message | "คุณแน่ใจหรือไม่ว่าต้องการถอนใบสมัครนี้?" | - |
| Warning | "การถอนใบสมัครจะไม่สามารถยกเลิกได้" | - |
| Cancel Button | "ยกเลิก" | Close modal |
| Confirm Button | "ถอนใบสมัคร" (red) | Execute withdraw |

---

## 8. Component-Action Wiring

### 8.1 Apply Modal Components

| Component | Trigger | Action | State Change |
|-----------|---------|--------|--------------|
| Close Button (×) | Click | `closeModal()` | modal → closed |
| Backdrop | Click | `closeModal()` | modal → closed |
| Escape Key | Keydown | `closeModal()` | modal → closed |
| Expected Salary Input | Change | `updateField('expectedSalary', value)` | form update |
| Negotiable Checkbox | Change | `updateField('isNegotiable', !current)` | form update |
| Availability Dropdown | Change | `updateField('overheadDays', value)` | form update |
| Cover Letter Textarea | Change | `updateField('headlines', value)` | form update |
| Cancel Button | Click | `closeModal()` | modal → closed |
| Submit Button | Click | `submitApplication()` | modal → submitting |

### 8.2 Already Applied Card Components

| Component | Trigger | Action | Navigation |
|-----------|---------|--------|------------|
| View Application | Click | - | → /candidates/[id]/applications |
| Message Company | Click | `openChat(chatId)` | → /chat/[roomId] or open drawer |
| Withdraw Button | Click | `openWithdrawConfirm()` | Open confirm modal |
| Reapply Button | Click | `openApplyModal()` | Open modal (pre-fill previous data) |

### 8.3 Withdraw Flow

```typescript
async function withdrawApplication(applicationId: string) {
  // 1. Show confirmation modal
  const confirmed = await showConfirmModal({
    title: 'ถอนใบสมัคร',
    message: 'คุณแน่ใจหรือไม่ว่าต้องการถอนใบสมัครนี้?',
    confirmLabel: 'ถอนใบสมัคร',
    confirmVariant: 'destructive',
  });
  
  if (!confirmed) return;
  
  // 2. Call server action
  const result = await JobApplicationDel({
    applicationId,
    jobId,
    token: await getIdToken(),
  });
  
  // 3. Handle result
  if (result.success) {
    toast.success('ถอนใบสมัครสำเร็จ');
    mutate(`application-${uid}-${jobId}`);
  } else {
    toast.error('ถอนใบสมัครไม่สำเร็จ');
  }
}
```

---

## 9. Error Handling

### 9.1 Apply Errors

| Error Type | Condition | Display (Thai) | Recovery |
|------------|-----------|----------------|----------|
| Already Applied | Application exists | คุณสมัครงานนี้แล้ว | Auto-transition to applied state |
| Profile Incomplete | `!isResumeCompleted` | กรุณากรอกข้อมูลให้ครบก่อนสมัคร | Link to profile |
| Job Closed | `jobStatus === 'closed'` | ตำแหน่งนี้ปิดรับสมัครแล้ว | Show closed banner |
| Job Expired | `postExpiryDate < now` | ประกาศงานหมดอายุแล้ว | Show expired banner |
| Network Error | Submit failed | ไม่สามารถส่งใบสมัครได้ กรุณาลองใหม่ | Keep modal open, retry |
| Rate Limited | Too many attempts | กรุณารอสักครู่ | Toast with countdown |
| Validation Error | Invalid form data | Field-specific message | Highlight field |

### 9.2 Withdraw Errors

| Error Type | Condition | Display (Thai) | Recovery |
|------------|-----------|----------------|----------|
| Already Processed | Status changed | ดำเนินการแล้ว | Refresh status |
| Network Error | Submit failed | ถอนใบสมัครไม่สำเร็จ | Retry |
| Not Owner | Wrong candidate | ไม่สามารถถอนใบสมัครได้ | - |

---

## 10. Cross-Domain Integration

### 10.1 After Application Accepted

When company accepts application (COMP-R05 action):

| Trigger | Side Effect | Target Route |
|---------|-------------|--------------|
| Accept | Create chat room | CHAT-R01 (new room appears) |
| Accept | Update `chatId` in application | JOB-R02 (Message button enabled) |
| Accept | Send notification | Notification bell + email |

### 10.2 Message Company Button

```typescript
function handleMessageClick(application: ExistingApplication) {
  if (application.chatId) {
    // Option 1: Navigate to chat page
    router.push(`/chat/${application.chatId}`);
    
    // Option 2: Open chat drawer (preferred UX per project decision)
    openChatDrawer(application.chatId);
  } else {
    // No chat room yet (shouldn't happen if button is visible)
    toast.error('ยังไม่สามารถส่งข้อความได้');
  }
}
```

### 10.3 Notification Triggers

| Event | Notification Message | Target |
|-------|---------------------|--------|
| Candidate applies | "มีผู้สมัครใหม่สำหรับ [Job]" | Company |
| Application withdrawn | "ผู้สมัคร [Name] ถอนใบสมัคร" | Company |

---

## 11. Accessibility

### 11.1 Modal Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Focus trap | Focus stays within modal when open |
| Escape to close | Escape key closes modal |
| aria-modal | `aria-modal="true"` on modal container |
| aria-labelledby | Points to modal title |
| Initial focus | Focus on first input field |
| Return focus | Focus returns to apply button on close |

### 11.2 Form Accessibility

| Component | Accessibility |
|-----------|---------------|
| Salary input | `aria-describedby` for format hint |
| Checkbox | Proper label association |
| Dropdown | Keyboard navigation support |
| Textarea | Character count announcement |
| Submit button | `aria-busy` during submission |
| Error messages | `aria-live="polite"` |

### 11.3 Screen Reader Announcements

| Event | Announcement |
|-------|--------------|
| Modal opened | "กรอกใบสมัครงาน" |
| Validation error | Error message text |
| Submitting | "กำลังส่งใบสมัคร" |
| Success | "ส่งใบสมัครเรียบร้อย" |
| Error | Error message text |

---

## 12. Test Scenarios

### 12.1 Apply Flow Tests

| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| APM-01 | Open apply modal | Complete profile → Click apply | Modal opens with empty form |
| APM-02 | Fill and submit | Enter salary, select availability, submit | Success toast, modal closes |
| APM-03 | Submit without salary | Leave salary empty, submit | Succeeds (salary optional) |
| APM-04 | Cover letter max length | Enter 501 characters | Validation error shown |
| APM-05 | Already applied | Return to job after applying | Already Applied card shown |
| APM-06 | Network error on submit | Submit with network off | Error toast, modal stays open |
| APM-07 | Race condition | Submit twice quickly | Only one application created |

### 12.2 Withdraw Flow Tests

| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| WTD-01 | Withdraw from applied | Click withdraw, confirm | Status changes to withdraw |
| WTD-02 | Cancel withdraw | Click withdraw, cancel | No change, modal closes |
| WTD-03 | Reapply after withdraw | Withdraw, click reapply | Apply modal opens, new application |
| WTD-04 | Withdraw network error | Confirm with network off | Error toast, can retry |

### 12.3 Status Display Tests

| ID | Scenario | Expected Display |
|----|----------|------------------|
| STD-01 | Just applied | Blue badge "ส่งใบสมัครแล้ว" |
| STD-02 | Company viewed | Gray badge "บริษัทดูแล้ว" |
| STD-03 | Accepted | Green badge + Message button |
| STD-04 | Scheduled | Orange badge + Interview info |
| STD-05 | Rejected | Red badge, no actions |
| STD-06 | Withdrawn | Gray badge + Reapply button |

---

## 13. Implementation Checklist

### 13.1 Components

- [ ] `ApplyModal` - Main modal container
- [ ] `ApplyForm` - Form fields and validation
- [ ] `AlreadyAppliedCard` - Post-application display
- [ ] `WithdrawConfirmModal` - Withdrawal confirmation
- [ ] `ApplicationStatusBadge` - Status display

### 13.2 Hooks

- [ ] `useApplyModal` - Modal state management
- [ ] `useApplicationForm` - Form state and validation
- [ ] `useApplicationStatus` - Fetch existing application

### 13.3 Server Actions

- [ ] `JobApplicationSet` - Create/update application
- [ ] `JobApplicationDel` - Withdraw application
- [ ] `JobApplicationGetByCandidate` - Fetch existing

### 13.4 Integration Points

- [ ] Profile completion check before modal open
- [ ] SWR cache invalidation after submit
- [ ] Toast notifications
- [ ] Chat drawer integration for Message button
- [ ] Notification trigger after apply

---

## 14. Related Documents

| Document | Relationship |
|----------|--------------|
| `JOB-R02_job-detail_RIS.md` | Parent route specification |
| `JOB-R00_cross-cutting_RIS.md` | Shared patterns |
| `JOB-R03_applications_RIS.md` | Destination for "View Application" |
| `COMP-R05_applications_RIS.md` | Company-side application handling |
| `features_jobs.md` | Feature definitions |
| `data-entities_job-interviews.md` | Interview schema |

---

*End of JOB-R02+ Apply Modal Supplement Specification*
