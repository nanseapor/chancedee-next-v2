# BLS-05: Interview Stage

**Stage:** Interview  
**Version:** 1.0  
**Last Updated:** 2025-12-11  
**Actions Count:** 6

---

## Stage Overview

The Interview Stage handles interview scheduling, confirmation, and management between company HR and candidates. This stage is tightly integrated with the chat system where scheduling actions occur. Company schedules interviews; candidates confirm or decline.

> **Dependency Note:** All BLS-05 actions occur within a **BLS-06 Communication** chat room context. A chat room must exist before interview scheduling can happen. Interview cards appear as special message types in the chat thread. See BLS-06 for chat room infrastructure (opening rooms, sending messages, real-time sync).

### Stage Boundaries

| Aspect | Scope |
|--------|-------|
| **Enters from** | BLS-04 Screening (after application acceptance) |
| **Exits to** | BLS-09 Wallet (first interview reward), Terminal states (hire/close) |
| **Primary Actors** | Company HR (scheduling), Candidate (responding) |
| **Secondary Actors** | System (notifications, rewards) |

### Actions in This Stage

| Action ID | Action Name | Actor | Trigger | Primary Collection |
|-----------|-------------|-------|---------|-------------------|
| BLS-05-01 | scheduleInterview | Company | Schedule button in chat | `job_interviews` |
| BLS-05-02 | rescheduleInterview | Company | Edit interview in chat | `job_interviews` |
| BLS-05-03 | cancelInterview | Company | Cancel button in chat | `job_interviews` |
| BLS-05-04 | confirmInterview | Candidate | Confirm button on card | `job_interviews` |
| BLS-05-05 | declineInterview | Candidate | Decline button on card | `job_interviews` |
| BLS-05-06 | viewInterviewDetails | Both | Interview card in chat | `job_interviews` |

---

## BLS-05-01: scheduleInterview

### Description
Company HR schedules an interview for an accepted application. Creates interview record and sends chat message with interview card to candidate.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| CHAT-R02_chat-room_RIS.md | Section 3, 6.3 | Interview scheduling in chat |
| features_jobs.md | JOB-022 | Schedule Job Interview feature |
| data-entities_job-interviews.md | Full | Schema definition |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | User authenticated | `sessionStateAtom === 'valid'` | Redirect to login |
| 2 | User is company member | `activeRoleAtom === 'company'` | Hide schedule button |
| 3 | Application exists | `application !== null` | Show error |
| 4 | Application accepted | `status in ['accepted', 'applied', 'read']` | Hide schedule button |
| 5 | Chat room exists | `chatId !== null` | Create chat first |
| 6 | No pending interview | No unconfirmed interview | Show existing interview |

### Inputs
| Field | Type | Required | Validation | Default | Source |
|-------|------|----------|------------|---------|--------|
| applicationId | string | Yes | Valid application UID | - | Chat context |
| date | ISO string | Yes | Future date | - | Date picker |
| from | ISO string | Yes | Valid time | - | Time picker |
| to | ISO string | Yes | After `from` | - | Time picker |
| channel | 'online' \| 'onsite' | Yes | Valid enum | 'online' | Radio buttons |
| location | string | No (Yes if onsite) | - | '' | Text input |
| room | string | No | - | '' | Text input |
| note | string | No | max 500 chars | '' | Textarea |

### Interview Form Shape
```typescript
interface ScheduleInterviewForm {
  date: string;              // ISO date
  from: string;              // HH:mm
  to: string;                // HH:mm
  channel: 'online' | 'onsite';
  location: string;          // Required if onsite
  room?: string;             // Meeting room or video link
  note?: string;             // Additional notes
}

const defaultForm: ScheduleInterviewForm = {
  date: '',
  from: '09:00',
  to: '10:00',
  channel: 'online',
  location: '',
  room: '',
  note: '',
};
```

### State Changes

**SWR Cache Invalidations:**
| Key Pattern | Action | Timing |
|-------------|--------|--------|
| `interview-${applicationId}` | Set to new interview | After success |
| `company-applications-${companyId}` | Update application status | After success |
| `candidate-applications-${candidateId}` | Update status | Server notification |

**Local Component State:**
| State | Before | After |
|-------|--------|-------|
| `showScheduleModal` | true | false |
| `isScheduling` | false | true → false |
| `scheduleForm` | Form values | Reset to default |

### Firestore Operations
| Operation | Collection | Document ID | Fields | Condition |
|-----------|------------|-------------|--------|-----------|
| Create | `job_interviews` | Auto-generated | All interview fields | Always |
| Update | `job_applications` | applicationId | `status: 'scheduled'` | Always |
| Create | `messages` | Auto-generated | Interview message card | Always |

### Server Action
```typescript
// Action: addBooking
// Location: actions/interview-management.ts

interface ScheduleInterviewInput {
  input: {
    date: string;
    from: string;
    to: string;
    channel: 'online' | 'onsite';
    status: 'scheduled';
    location?: string;
    room?: string;
    note?: string;
    contact: {
      email: string;
    };
  };
  applicationId: string;
}

type ScheduleInterviewResult = 'success' | 'fail';
```

### UI Feedback
| Scenario | Feedback Type | Message (Thai) | Duration |
|----------|---------------|----------------|----------|
| Modal open | Modal | "นัดสัมภาษณ์" title | Until action |
| Scheduling | Button loading | Spinner | Until complete |
| Success | Toast + close modal | "นัดสัมภาษณ์เรียบร้อย" | 3s |
| Invalid date | Inline error | "กรุณาเลือกวันที่ในอนาคต" | Until fixed |
| Missing location | Inline error | "กรุณาระบุสถานที่สัมภาษณ์" | Until fixed |
| Network error | Toast | "ไม่สามารถนัดสัมภาษณ์ได้ กรุณาลองใหม่" | 5s |

### Error Handling
| Error Type | Detection | Recovery |
|------------|-----------|----------|
| Application not found | Response 'fail' | Show error, close modal |
| Past date selected | Client validation | Inline error, prevent submit |
| Network error | Catch | Keep modal, allow retry |

### Side Effects
| Effect | Target | Timing |
|--------|--------|--------|
| Create interview message | Chat thread | Server-side |
| Send email notification | Candidate | Server-side |
| Send push notification | Candidate FCM | Server-side |
| Update application status | `job_applications` | Server-side |
| Show interview card | Chat UI | Real-time via Firestore |

---

## BLS-05-02: rescheduleInterview

### Description
Company HR reschedules an existing interview to a new date/time. Sends reschedule message to chat with old and new dates.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| CHAT-R02_chat-room_RIS.md | Section 3 | Reschedule flow |
| features_jobs.md | JOB-023 | Update Interview Schedule feature |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | User authenticated | `sessionStateAtom === 'valid'` | Redirect to login |
| 2 | User is company member | `activeRoleAtom === 'company'` | Hide reschedule button |
| 3 | Interview exists | `interview !== null` | Show error |
| 4 | Status allows reschedule | `status in ['scheduled', 'confirmed', 'declined']` | Hide button |
| 5 | Not past appointment | `appointment > now` | Show expired message |

### Inputs
| Field | Type | Required | Validation | Default | Source |
|-------|------|----------|------------|---------|--------|
| interviewId | string | Yes | Valid interview UID | - | Interview card |
| date | ISO string | Yes | Future date | Current date | Date picker |
| from | ISO string | Yes | Valid time | Current from | Time picker |
| to | ISO string | Yes | After `from` | Current to | Time picker |
| channel | 'online' \| 'onsite' | Yes | Valid enum | Current | Radio buttons |
| location | string | Conditional | If onsite | Current | Text input |
| room | string | No | - | Current | Text input |

### State Changes

**SWR Cache Invalidations:**
| Key Pattern | Action | Timing |
|-------------|--------|--------|
| `interview-${applicationId}` | Update with new values | After success |

**Local Component State:**
| State | Before | After |
|-------|--------|-------|
| `showRescheduleModal` | true | false |
| `isRescheduling` | false | true → false |

### Firestore Operations
| Operation | Collection | Document ID | Fields | Condition |
|-----------|------------|-------------|--------|-----------|
| Update | `job_interviews` | interviewId | `date`, `from`, `to`, `channel`, `location`, `updatedAt` | Always |
| Update | `job_applications` | applicationId | `status: 'scheduled'` | If was declined |
| Create | `messages` | Auto-generated | Reschedule message with old/new dates | Always |

### Server Action
```typescript
// Action: updateBooking
// Location: actions/interview-management.ts

interface RescheduleInterviewInput {
  input: {
    uid: string;
    date: string;
    from: string;
    to: string;
    channel: 'online' | 'onsite';
    status: 'scheduled';
    location?: string;
    room?: string;
    contact: {
      email: string;
    };
  };
  applicationId: string;
}

type RescheduleInterviewResult = 'success';
```

### UI Feedback
| Scenario | Feedback Type | Message (Thai) | Duration |
|----------|---------------|----------------|----------|
| Modal open | Modal | "เปลี่ยนวันนัดสัมภาษณ์" title | Until action |
| Rescheduling | Button loading | Spinner | Until complete |
| Success | Toast + close modal | "เปลี่ยนวันนัดเรียบร้อย" | 3s |
| Network error | Toast | "ไม่สามารถเปลี่ยนวันนัดได้" | 5s |

### Side Effects
| Effect | Target | Timing |
|--------|--------|--------|
| Create reschedule message | Chat thread | Server-side |
| Send email notification | Candidate | Server-side |
| Send push notification | Candidate FCM | Server-side |
| Reset interview status | If was declined | Server-side |

---

## BLS-05-03: cancelInterview

### Description
Company HR cancels an interview with optional reason. Updates status and notifies candidate.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| CHAT-R02_chat-room_RIS.md | Section 4.4 | Cancel operation |
| features_jobs.md | JOB-023 | Update with cancel status |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | User authenticated | `sessionStateAtom === 'valid'` | Redirect to login |
| 2 | User is company member | `activeRoleAtom === 'company'` | Hide cancel button |
| 3 | Interview exists | `interview !== null` | Show error |
| 4 | Status cancellable | `status in ['scheduled', 'confirmed']` | Hide button |
| 5 | Confirmation given | User clicked confirm | Close modal |

### Inputs
| Field | Type | Required | Validation | Default | Source |
|-------|------|----------|------------|---------|--------|
| interviewId | string | Yes | Valid interview UID | - | Interview card |
| cancelReason | string | No | max 500 chars | '' | Modal textarea |

### State Changes

**SWR Cache Invalidations:**
| Key Pattern | Action | Timing |
|-------------|--------|--------|
| `interview-${applicationId}` | Update status to cancelled | Immediate |
| `company-applications-${companyId}` | Update status | After success |

**Local Component State:**
| State | Before | After |
|-------|--------|-------|
| `showCancelModal` | true | false |
| `isCancelling` | false | true → false |

### Firestore Operations
| Operation | Collection | Document ID | Fields | Condition |
|-----------|------------|-------------|--------|-----------|
| Update | `job_interviews` | interviewId | `status: 'cancelled'`, `isCancel: true`, `cancelReason` | Always |
| Update | `job_applications` | applicationId | `status: 'cancelled'` | Always |

### Server Action
```typescript
// Action: updateBooking (with cancel)
// Location: actions/interview-management.ts

interface CancelInterviewInput {
  input: {
    uid: string;
    status: 'cancelled';
    cancelReason?: string;
  };
  applicationId: string;
}
```

### UI Feedback
| Scenario | Feedback Type | Message (Thai) | Duration |
|----------|---------------|----------------|----------|
| Confirm modal | Modal | "ยกเลิกนัดสัมภาษณ์?" | Until action |
| Cancelling | Button loading | Spinner | Until complete |
| Success | Toast + close modal | "ยกเลิกนัดสัมภาษณ์แล้ว" | 3s |
| Network error | Toast | "ไม่สามารถยกเลิกได้" | 5s |

### Side Effects
| Effect | Target | Timing |
|--------|--------|--------|
| Send cancellation message | Chat thread | Server-side |
| Send email notification | Candidate | Server-side |
| Send push notification | Candidate FCM | Server-side |

---

## BLS-05-04: confirmInterview

### Description
Candidate confirms attendance to a scheduled interview. Updates status and triggers first interview reward check.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| CHAT-R02_chat-room_RIS.md | Section 3 | Confirm action |
| features_jobs.md | JOB-024 | Candidate Accepts Interview feature |
| features_jobs.md | JOB-027 | First Interview Reward check |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | User authenticated | `sessionStateAtom === 'valid'` | Redirect to login |
| 2 | User is candidate | `activeRoleAtom === 'candidate'` | Hide confirm button |
| 3 | Interview exists | `interview !== null` | Show error |
| 4 | Status is scheduled | `interview.status === 'scheduled'` | Hide confirm button |
| 5 | Not expired | `appointment > now` | Show expired message |

### Inputs
| Field | Type | Required | Validation | Default | Source |
|-------|------|----------|------------|---------|--------|
| bookingId | string | Yes | Valid interview UID | - | Interview card |

### State Changes

**SWR Cache Invalidations:**
| Key Pattern | Action | Timing |
|-------------|--------|--------|
| `interview-${applicationId}` | Update status to confirmed | Immediate |
| `candidate-applications-${candidateId}` | Update status | After success |

**Local Component State:**
| State | Before | After |
|-------|--------|-------|
| `isConfirming` | false | true → false |
| Interview card | "ยืนยัน" button | "ยืนยันแล้ว" badge |

### Firestore Operations
| Operation | Collection | Document ID | Fields | Condition |
|-----------|------------|-------------|--------|-----------|
| Update | `job_interviews` | bookingId | `status: 'confirmed'`, `isAccepted: true` | Always |
| Update | `job_applications` | applicationId | `status: 'confirmed'` | Always |
| Update | `messages` | Related messages | Update status | All related |

### Server Action
```typescript
// Action: updateResposeStatus
// Location: actions/interview-management.ts

interface ConfirmInterviewInput {
  bookingId: string;
  acceptedStatus: true;
}

type ConfirmInterviewResult = 'success';
```

### UI Feedback
| Scenario | Feedback Type | Message (Thai) | Duration |
|----------|---------------|----------------|----------|
| Confirming | Button loading | Spinner | Until complete |
| Success | Toast + card update | "ยืนยันนัดสัมภาษณ์แล้ว" | 3s |
| Reward earned | Toast (special) | "ได้รับ 100 เหรียญ!" | 5s |
| Already confirmed | Toast | "ยืนยันแล้ว" | 3s |
| Expired | Toast | "นัดสัมภาษณ์หมดอายุแล้ว" | 5s |
| Network error | Toast | "ไม่สามารถยืนยันได้ กรุณาลองใหม่" | 5s |

### Error Handling
| Error Type | Detection | Recovery |
|------------|-----------|----------|
| Already confirmed | Status check | Show current status |
| Interview cancelled | Status check | Show cancelled message |
| Expired | Time check | Show expired, disable button |
| Network error | Catch | Keep button, allow retry |

### Side Effects
| Effect | Target | Timing |
|--------|--------|--------|
| Update interview message | Chat card status | Server-side |
| Send email notification | Company | Server-side |
| Send push notification | Company FCM | Server-side |
| Check first interview reward | Wallet (100 coins) | Server-side |
| Update `isFirstInterviewerRewarded` | Candidate data | If first interview |
| Show calendar add option | UI | After success |

---

## BLS-05-05: declineInterview

### Description
Candidate declines a scheduled interview. Company can reschedule after decline.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| CHAT-R02_chat-room_RIS.md | Section 3 | Decline action |
| features_jobs.md | JOB-025 | Candidate Declines Interview feature |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | User authenticated | `sessionStateAtom === 'valid'` | Redirect to login |
| 2 | User is candidate | `activeRoleAtom === 'candidate'` | Hide decline button |
| 3 | Interview exists | `interview !== null` | Show error |
| 4 | Status allows decline | `status in ['scheduled', 'confirmed']` | Hide decline button |

### Inputs
| Field | Type | Required | Validation | Default | Source |
|-------|------|----------|------------|---------|--------|
| bookingId | string | Yes | Valid interview UID | - | Interview card |

### State Changes

**SWR Cache Invalidations:**
| Key Pattern | Action | Timing |
|-------------|--------|--------|
| `interview-${applicationId}` | Update status to declined | Immediate |
| `candidate-applications-${candidateId}` | Update status | After success |

**Local Component State:**
| State | Before | After |
|-------|--------|-------|
| `isDeclining` | false | true → false |
| Interview card | Action buttons | "ปฏิเสธแล้ว" badge |

### Firestore Operations
| Operation | Collection | Document ID | Fields | Condition |
|-----------|------------|-------------|--------|-----------|
| Update | `job_interviews` | bookingId | `status: 'declined'`, `isAccepted: false` | Always |
| Update | `job_applications` | applicationId | `status: 'declined'` | Always |
| Update | `messages` | Related messages | Update status | All related |

### Server Action
```typescript
// Action: updateResposeStatus
// Location: actions/interview-management.ts

interface DeclineInterviewInput {
  bookingId: string;
  acceptedStatus: false;
}

type DeclineInterviewResult = 'success';
```

### UI Feedback
| Scenario | Feedback Type | Message (Thai) | Duration |
|----------|---------------|----------------|----------|
| Confirm modal | Modal | "ปฏิเสธนัดสัมภาษณ์?" | Until action |
| Declining | Button loading | Spinner | Until complete |
| Success | Toast + card update | "ปฏิเสธนัดสัมภาษณ์แล้ว" | 3s |
| Network error | Toast | "ไม่สามารถปฏิเสธได้" | 5s |

### Side Effects
| Effect | Target | Timing |
|--------|--------|--------|
| Update interview message | Chat card status | Server-side |
| Send email notification | Company | Server-side |
| Send push notification | Company FCM | Server-side |
| Enable reschedule option | For company | After decline |

---

## BLS-05-06: viewInterviewDetails

### Description
Display interview details in an interview card within the chat. Both parties can view; actions depend on role and status.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| CHAT-R02_chat-room_RIS.md | Section 4.3 | Interview data shape |
| features_jobs.md | JOB-028 | Get Interview Data feature |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | User authenticated | `sessionStateAtom === 'valid'` | Redirect to login |
| 2 | User is participant | User in chat room | Access denied |
| 3 | Interview exists | Interview record found | Show placeholder |

### Inputs
| Field | Type | Required | Validation | Default | Source |
|-------|------|----------|------------|---------|--------|
| interviewId | string | Yes | Valid interview UID | - | Message data |
| applicationId | string | Yes | Valid application UID | - | Message data |

### State Changes

**SWR Cache:**
| Key Pattern | Data Shape | Config |
|-------------|------------|--------|
| `interview-data-${role}-${userId}` | `InterviewConsolidatedData` | `refreshInterval: 60000` |

### Interview Card Display
```typescript
interface InterviewCardProps {
  interview: {
    uid: string;
    status: InterviewStatus;
    appointment: number;
    from: string;
    to: string;
    channel: 'online' | 'onsite';
    location?: string;
    room?: string;
    note?: string;
  };
  job: {
    title: string;
    companyName: string;
  };
  role: 'candidate' | 'company';
}
```

### Card Content by Status
| Status | Badge Color | Candidate Actions | Company Actions |
|--------|-------------|-------------------|-----------------|
| `scheduled` | Orange | Confirm, Decline | Reschedule, Cancel |
| `confirmed` | Green | Add to Calendar | Reschedule, Cancel |
| `declined` | Red | - | Reschedule |
| `cancelled` | Gray | - | Schedule New |
| `closed` | Gray | - | - |

### Interview Card Layout
| Section | Content |
|---------|---------|
| Header | Status badge |
| Date/Time | Day, Date, Time range |
| Channel | Online/Onsite icon + label |
| Location | Address or meeting link (if provided) |
| Note | Additional notes (if provided) |
| Actions | Role-specific buttons |

### UI Feedback
| Scenario | Feedback Type | Display |
|----------|---------------|---------|
| Loading | Skeleton card | Placeholder |
| Expired | Muted card | "หมดอายุแล้ว" overlay |
| Past date | Info badge | "สัมภาษณ์เสร็จสิ้น" |

---

## Interview Status Lifecycle

```
                    ┌─────────────┐
                    │   (none)    │
                    └──────┬──────┘
                           │ Schedule (Company)
                           ▼
                    ┌─────────────┐
          ┌────────│  scheduled  │────────┐
          │        └──────┬──────┘        │
          │ Decline       │ Confirm       │ Cancel
          │ (Candidate)   │ (Candidate)   │ (Company)
          ▼               ▼               ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │ declined │    │ confirmed│    │cancelled │
    └────┬─────┘    └────┬─────┘    └──────────┘
         │ Reschedule    │ Cancel
         │ (Company)     │ (Company)
         └───────┬───────┴───────┐
                 ▼               ▼
          ┌──────────┐    ┌──────────┐
          │scheduled │    │cancelled │
          └──────────┘    └──────────┘
```

---

## Stage Integration Points

### Entry Points (from other stages)
| Source Stage | Source Action | Entry Action | Trigger |
|--------------|---------------|--------------|---------|
| BLS-04 Screening | acceptApplication | scheduleInterview | Chat opened, schedule button |
| BLS-06 Communication | openChatRoom | viewInterviewDetails | Interview card in thread |

### Exit Points (to other stages)
| Exit Action | Target Stage | Target Action | Trigger |
|-------------|--------------|---------------|---------|
| confirmInterview | BLS-09 Wallet | First interview reward | If first confirmed interview |
| Interview complete | - | - | Terminal: proceed to hire/close |

### Cross-Stage Cache Dependencies
| This Stage Action | Affects Stage | Cache Key | Invalidation |
|-------------------|---------------|-----------|--------------|
| scheduleInterview | BLS-03 | `candidate-applications-${uid}` | Status → scheduled |
| scheduleInterview | BLS-04 | `company-applications-${companyId}` | Status → scheduled |
| confirmInterview | BLS-03 | `candidate-applications-${uid}` | Status → confirmed |
| confirmInterview | BLS-09 | Wallet balance | If first interview reward |
| declineInterview | BLS-03 | `candidate-applications-${uid}` | Status → declined |
| cancelInterview | BLS-03, BLS-04 | Both application lists | Status → cancelled |

---

## Permissions Matrix

| Action | Company | Candidate |
|--------|---------|-----------|
| scheduleInterview | ✓ | ✗ |
| rescheduleInterview | ✓ | ✗ |
| cancelInterview | ✓ | ✗ |
| confirmInterview | ✗ | ✓ |
| declineInterview | ✗ | ✓ |
| viewInterviewDetails | ✓ | ✓ |

---

## Related Documents

| Document | Relationship |
|----------|--------------|
| CHAT-R02_chat-room_RIS.md | Primary route (interview actions in chat) |
| features_jobs.md | Feature definitions JOB-022/023/024/025/027/028 |
| data-entities_job-interviews.md | Schema and status values |
| BLS-04_screening.md | Preceding stage (acceptance) |
| BLS-06_communication.md | Chat context where scheduling occurs |
| BLS-09_wallet.md | First interview reward integration |

---

*End of BLS-05 Interview Stage*
