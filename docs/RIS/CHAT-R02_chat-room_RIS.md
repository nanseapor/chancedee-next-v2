# CHAT-R02: Chat Room Route Implementation Spec

**Version:** 1.1  
**Last Updated:** 2025-12-10  
**Route:** `/chat/[roomId]` (or `/chat?room={roomId}`)  
**Primary Domain:** Chat  
**Secondary Domain:** Jobs/Interview

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.1 | 2025-12-10 | Added business context: First Interview Reward details (100 coins), multiple interviews support (10.4), interview expiry behavior (10.5). Fixed CHAT-007 to Not Implemented. Fixed interview channels to online/onsite only. |
| 1.0 | 2025-12-10 | Initial RIS creation for Wave 5 |

---

## Cross-References

This document references shared specifications from:

| Document | Section | Topic |
|----------|---------|-------|
| **CHAT-R00** | Section 4 | Real-time connection management |
| **CHAT-R00** | Section 5 | Unread tracking pattern |
| **CHAT-R00** | Section 6 | Message type registry |
| **CHAT-R00** | Section 7 | Shared TypeScript types |
| **CHAT-R00** | Section 10 | Thai copy reference |
| **CHAT-R00** | Appendix A | Server action signatures |
| **COMP-R08** | Section 6.2 | Accept triggers chat creation |
| **PROJECT_INSTRUCTIONS** | Section 4.3 | Interview lifecycle |

---

## 1. Route Metadata

| Property | Value |
|----------|-------|
| Route ID | CHAT-R02 |
| Route Path | `/chat/[roomId]` or `/chat?room={roomId}` |
| Shell | Candidate Shell or Company Shell (role-based) |
| Purpose | Real-time messaging with interview scheduling |
| Complexity | High (messaging, file upload, interview scheduling, multiple actors) |
| Phase | 5 (Chat & Interview) |
| UI Spec | `06-communication-routes.md` Section 7.1 |

### Route Parameters

| Parameter | Type | Source | Validation |
|-----------|------|--------|------------|
| `roomId` | `string` | URL path or query | Must be valid room ID, user must be participant |

### Query Parameters

| Parameter | Type | Purpose | Default |
|-----------|------|---------|---------|
| `room` | `string` | Alternative to path segment | - |

### Access Control

| Condition | Check | Failure Behavior |
|-----------|-------|------------------|
| User authenticated | `sessionStateAtom === 'valid'` | Redirect to `/auth/login` |
| Room participant | User is `candidateId` or `companyId` in room | Redirect to `/chat` with error |
| Room exists | Room document exists | Redirect to `/chat` with error |
| Not deleted | User status | Redirect to `/auth/deleted` |

---

## 2. Domain Classification

### Primary Domain: Chat (▰)

- **Owns:** Message thread, send message, mark as read, file upload
- **Mutations:** `sendMessageFirestore`, `webMessagesBatchUpdate`
- **Data Source:** Firestore `web_messages` collection (real-time)

### Secondary Domain: Jobs/Interview (◧)

- **Role:** Interview scheduling within chat context
- **Mutations:** `addBooking`, `updateBooking`, `updateResposeStatus`
- **Actor Split:** Company schedules, Candidate responds

| Feature | Company Can | Candidate Can |
|---------|-------------|---------------|
| Schedule interview | ✅ | ❌ |
| Cancel interview | ✅ | ❌ |
| Reschedule interview | ✅ | ❌ |
| Confirm interview | ❌ | ✅ |
| Decline interview | ❌ | ✅ |
| View interview card | ✅ | ✅ |

### Global Domains (★) - Via Shell

| Domain | Requirement |
|--------|-------------|
| Auth | Session validation |
| Notifications | Bell icon |

---

## 3. Feature Mapping

### Existing Features (Preserve - P0)

| Feature ID | Feature Name | Coverage | Actor |
|------------|--------------|----------|-------|
| CHAT-002 | Open Chat Room | Full | Both |
| CHAT-003 | Send Text Message | Full | Both |
| CHAT-004 | Mark Messages as Read | Full | Both |
| CHAT-006 | Send Interview Scheduling Message | Full | Company |
| CHAT-007 | Send Job Offer Message | **Not Implemented** | Company |
| CHAT-008 | Send Interview Reschedule Message | Full | Company |
| CHAT-009 | Load Message History | Full | Both |
| CHAT-010 | Get Interview Data in Chat Context | Full | Both |
| CHAT-012 | Send System Notification Messages | Full | System |
| CHAT-014 | Update Last Message in Room | Full | System |

**Source:** `features_chat.md` (14 features total)

> **Note on CHAT-007:** The legacy "job offer" feature was actually interview invitation functionality, not formal job offers. Formal job offer workflow is **not implemented** in current system. The interview scheduling features (CHAT-006, CHAT-008) cover the actual functionality.

### Feature Implementation Details

#### CHAT-002: Open Chat Room

| Aspect | Implementation |
|--------|----------------|
| Entry Point | Room selection from CHAT-R01, direct URL, drawer |
| Real-time | Firestore `onSnapshot` listener |
| Initial Load | Last 50 messages |
| Mark as Read | Automatic on view |

#### CHAT-003: Send Text Message

| Aspect | Implementation |
|--------|----------------|
| Entry Point | Message input + send button |
| Server Action | `sendMessageFirestore` |
| Optimistic | Show immediately with "sending" state |
| Failure | Retry option, queue if offline |

#### Interview Features (JOB-022 to JOB-025)

| Feature | Feature ID | Implementation |
|---------|------------|----------------|
| Schedule Interview | JOB-022 | Modal form → `addBooking` |
| Reschedule Interview | JOB-023 | Edit form → `updateBooking` |
| Confirm Interview | JOB-024 | Card button → `updateResposeStatus(true)` |
| Decline Interview | JOB-025 | Card button → `updateResposeStatus(false)` |

---

## 4. Data Contract

### 4.1 Read Operations

| Data | Source | Method | Real-time |
|------|--------|--------|-----------|
| Messages | Firestore `web_messages` | `onSnapshot` | ✅ |
| Room details | Firestore `web_chat_rooms` | Query | ❌ |
| Interview data | `/api/chat/interview-data` | SWR | ❌ |
| Other party profile | Candidate/Company info | SWR | ❌ |

### 4.2 Message Data Shape

```typescript
interface ChatMessage {
  uid: string;
  room_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar: string | null;
  type: MessageType;
  message: string;
  timestamp: number;
  unread: string[];
  attachments?: string | string[];
  
  // Interview-specific fields
  interview_id?: string;
  application_id?: string;
  candidate_id?: string;
  company_id?: string;
  job_id?: string;
  schedule_date?: string;
  schedule_time_from?: string;
  schedule_time_to?: string;
  interview_status?: InterviewStatus;
  channel?: 'online' | 'onsite';
  location?: string;
  
  // Reschedule fields
  reschedule_old_date?: string;
  reschedule_new_date?: string;
  
  // Job offer fields
  job_title?: string;
  action_link?: string;
  
  // System message fields
  system_title?: string;
  system_company?: string;
  system_message?: string;
  
  // Audit
  createdBy: string;
  updatedBy: string;
  createdAt: number;
  updatedAt: number;
}
```

### 4.3 Interview Data Shape

```typescript
interface InterviewConsolidatedData {
  interview: Interview;
  application: {
    uid: string;
    status: ApplicationStatus;
    jobTitle: string;
  };
  job: {
    uid: string;
    title: string;
    company_name: string;
  };
}
```

### 4.4 Write Operations

| Operation | Server Action | Payload | Side Effects |
|-----------|---------------|---------|--------------|
| Send message | `sendMessageFirestore` | Message data | Update last_message in room |
| Schedule interview | `addBooking` | Interview details | Create interview, update app, send notification |
| Confirm interview | `updateResposeStatus(true)` | Interview ID | Update interview + app, notify |
| Decline interview | `updateResposeStatus(false)` | Interview ID | Update interview + app, notify |
| Cancel interview | `updateBooking` | Interview ID + cancel | Update interview, notify |
| Reschedule | `updateBooking` | New details | Create message, notify |

---

## 5. State Contract

### 5.1 Jotai Atoms Used

| Atom | Read | Write | Purpose |
|------|------|-------|---------|
| `roomIdAtom` | ✓ | ✓ | Current room ID |
| `viewRoomAtom` | ✓ | ✓ | Current room details |
| `chatMessagesAtom` | ✓ | ✓ | Messages in current room |
| `unreadMessagesAtom` | ✓ | ✓ | Unread tracking |
| `chatUserAtom` | ✓ | ✓ | Current user context |
| `navBarAtom` | ✓ | - | Role (candidate/company) |
| `chatProfileCollapsedAtom` | ✓ | ✓ | Side panel state |
| `isMobileAtom` | ✓ | ✓ | Mobile detection |
| `chatParticipantAtom` | ✓ | ✓ | Participant IDs |

### 5.2 Local State

```typescript
// Message input state
const [messageText, setMessageText] = useState('');
const [isSending, setIsSending] = useState(false);
const [attachments, setAttachments] = useState<File[]>([]);

// Interview modal state
const [showScheduleModal, setShowScheduleModal] = useState(false);
const [showRescheduleModal, setShowRescheduleModal] = useState(false);
const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);

// Action states
const [actionState, setActionState] = useState<InterviewActionState>('idle');
```

### 5.3 SWR Hooks

```typescript
// Interview data for chat context
const { data: interviewData } = useSWR(
  roomId ? chatSWRKeys.interviewData(navBar, userId) : null,
  () => fetchInterviewData(navBar, userId),
  { refreshInterval: 60000 }
);

// Room base params
const { data: roomData } = useSWR(
  roomId ? chatSWRKeys.roomBaseParams(roomId) : null,
  () => fetchRoomBaseParams(roomId)
);
```

---

## 6. UI State Machines

### 6.1 Page State Machine

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `loading` | ROOM_LOADED | `ready` | - | Subscribe to messages |
| `loading` | ROOM_NOT_FOUND | `error` | - | Show error, redirect |
| `ready` | MESSAGES_LOADED | `messaging` | - | Display messages |
| `messaging` | SEND_MESSAGE | `messaging` | Message valid | Call server action |
| `messaging` | CONNECTION_LOST | `reconnecting` | - | Show banner |
| `reconnecting` | CONNECTION_RESTORED | `messaging` | - | Resync messages |
| `*` | USER_OFFLINE | `offline` | - | Queue messages locally |
| `offline` | USER_ONLINE | `messaging` | - | Sync queued messages |

### 6.2 Message Send State Machine

```
┌─────────┐
│  idle   │
└────┬────┘
     │ SEND
     ▼
┌─────────┐
│ sending │
└────┬────┘
     │
     ├─── SUCCESS ──→ [sent] → back to idle
     │
     └─── FAILURE ──→ [failed] → show retry
                         │
                         └── RETRY → [sending]
```

| Current | Event | Next | Side Effects |
|---------|-------|------|--------------|
| `idle` | SEND | `sending` | Optimistic UI, call action |
| `sending` | SUCCESS | `sent` | Clear input, reset to idle |
| `sending` | FAILURE | `failed` | Show retry button |
| `failed` | RETRY | `sending` | Retry send |
| `failed` | DISCARD | `idle` | Remove failed message |

### 6.3 Interview Scheduling State Machine (Company Actor)

```
┌─────────┐
│  idle   │
└────┬────┘
     │ OPEN_SCHEDULE_MODAL
     ▼
┌─────────────┐
│schedule_modal│
└──────┬──────┘
       │ SUBMIT
       ▼
┌─────────────┐
│ scheduling  │
└──────┬──────┘
       │
       ├─── SUCCESS ──→ [idle] + close modal + toast
       │
       └─── FAILURE ──→ [schedule_modal] + error toast
```

| Current | Event | Next | Guard | Side Effects |
|---------|-------|------|-------|--------------|
| `idle` | OPEN_SCHEDULE | `schedule_modal` | Company role | Open modal |
| `schedule_modal` | SUBMIT | `scheduling` | Form valid | Call addBooking |
| `scheduling` | SUCCESS | `idle` | - | Close modal, toast, refresh |
| `scheduling` | FAILURE | `schedule_modal` | - | Show error |
| `schedule_modal` | CANCEL | `idle` | - | Close modal |
| `idle` | OPEN_RESCHEDULE | `reschedule_modal` | Has interview | Pre-fill form |
| `reschedule_modal` | SUBMIT | `rescheduling` | Form valid | Call updateBooking |
| `rescheduling` | SUCCESS | `idle` | - | Close modal, toast |
| `idle` | CANCEL_INTERVIEW | `cancelling` | Has interview | Confirm dialog |
| `cancelling` | CONFIRM | `idle` | - | Call updateBooking(cancel) |

### 6.4 Interview Response State Machine (Candidate Actor)

```
┌─────────────────┐
│ viewing_card    │ ← Initial state when card visible
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│confirm │ │decline │
└────┬───┘ └────┬───┘
     │          │
     ▼          ▼
┌─────────┐ ┌─────────┐
│confirmed│ │declined │
└─────────┘ └─────────┘
```

| Current | Event | Next | Guard | Side Effects |
|---------|-------|------|-------|--------------|
| `viewing_card` | CONFIRM | `confirming` | Candidate role | Call updateResposeStatus(true) |
| `viewing_card` | DECLINE | `declining` | Candidate role | Call updateResposeStatus(false) |
| `confirming` | SUCCESS | `confirmed` | - | Update card, toast, check reward |
| `confirming` | FAILURE | `viewing_card` | - | Error toast |
| `declining` | SUCCESS | `declined` | - | Update card, toast |
| `declining` | FAILURE | `viewing_card` | - | Error toast |

### 6.5 Appointment Card Status Rendering

| Status | Thai | Badge Color | Candidate Actions | Company Actions |
|--------|------|-------------|-------------------|-----------------|
| `scheduled` | รอการยืนยัน | Yellow | [ยืนยัน] [ปฏิเสธ] | [ยกเลิก] [เลื่อนนัด] |
| `confirmed` | ยืนยันแล้ว | Green | None | [ยกเลิก] |
| `declined` | ถูกปฏิเสธ | Red | None | [นัดใหม่] |
| `cancelled` | ยกเลิก | Gray | None | [นัดใหม่] |

---

## 7. Component-Action Wiring

### 7.1 Chat Room Layout

```
┌────────────────────────────────────────────────────────────────┐
│  Chat Header                                                    │
│  [← Back] [Avatar] [Name] [Status] [•••]                       │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Message Thread (scrollable)                                    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Date Divider: วันนี้                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [Avatar] ┌─────────────────┐                                   │
│           │ Other's message │  ← Gray bubble                    │
│           └─────────────────┘                                   │
│                                                                 │
│                      ┌─────────────────┐                        │
│                      │  Own message    │ ← Teal bubble          │
│                      └─────────────────┘ [✓✓]                   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Appointment Card (interview type message)                │   │
│  │ 📅 นัดสัมภาษณ์                        [รอการยืนยัน]      │   │
│  │ วันพุธที่ 15 ธ.ค. 2567                                   │   │
│  │ 14:00 - 15:00 น.                                         │   │
│  │ สัมภาษณ์ทางวิดีโอ                                         │   │
│  │                                                           │   │
│  │ [ยืนยัน]  [ปฏิเสธ]  ← Candidate only                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
├────────────────────────────────────────────────────────────────┤
│  Input Area                                                     │
│  [📎] [___________________________] [นัดสัมภาษณ์] [→]          │
│                                    ↑ Company only               │
└────────────────────────────────────────────────────────────────┘
```

### 7.2 Message Input Actions

| Element | Event | Action | Condition |
|---------|-------|--------|-----------|
| Text Input | onChange | `setMessageText` | - |
| Text Input | onKeyDown (Enter) | `sendMessage` | Not empty |
| Send Button | onClick | `sendMessage` | Not empty |
| Attach Button | onClick | Open file picker | - |
| File Picker | onSelect | `addAttachment` | Valid file |
| Schedule Button | onClick | `setShowScheduleModal(true)` | Company only |

### 7.3 Schedule Interview Modal (Company Only)

```
┌─────────────────────────────────────────┐
│  นัดสัมภาษณ์                       [×]  │
├─────────────────────────────────────────┤
│                                         │
│  วันที่ [______________________📅]      │
│                                         │
│  เวลาเริ่ม [____] เวลาสิ้นสุด [____]   │
│                                         │
│  ประเภทการสัมภาษณ์                      │
│  ○ สัมภาษณ์ออนไลน์                      │
│  ○ สัมภาษณ์ที่สำนักงาน                  │
│                                         │
│  ลิงก์/สถานที่                          │
│  [________________________________]     │
│                                         │
│  หมายเหตุ (ไม่บังคับ)                    │
│  [________________________________]     │
│                                         │
│           [ยกเลิก]  [ส่งนัดหมาย]         │
└─────────────────────────────────────────┘
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| date | Date picker | ✅ | Min: today |
| from | Time picker | ✅ | - |
| to | Time picker | ✅ | After `from` |
| channel | Radio group | ✅ | `online` or `onsite` only |
| location | Text | Conditional | Required if `onsite` |
| link | URL | Conditional | Required if `online` |
| note | Textarea | ❌ | Max 500 chars |

> **Note:** Only 2 interview channels supported: `online` (สัมภาษณ์ออนไลน์) and `onsite` (สัมภาษณ์ที่สำนักงาน). No phone interview option.

### 7.4 Appointment Card Actions

| Action | Actor | Handler | Server Action |
|--------|-------|---------|---------------|
| Confirm | Candidate | `handleConfirm(interviewId)` | `updateResposeStatus(id, true)` |
| Decline | Candidate | `handleDecline(interviewId)` | `updateResposeStatus(id, false)` |
| Cancel | Company | `handleCancel(interviewId)` | `updateBooking({ status: 'cancelled' })` |
| Reschedule | Company | `handleReschedule(interview)` | Opens reschedule modal |

### 7.5 File Attachment

| Type | Render | Action |
|------|--------|--------|
| Image (jpg, png, gif) | Thumbnail | Lightbox on click |
| PDF | File card | Download |
| Document (doc, docx) | File card | Download |
| Other | File card | Download |

| Validation | Limit | Error Message |
|------------|-------|---------------|
| Max size | 10MB | ไฟล์ใหญ่เกิน 10MB |
| Allowed types | jpg, png, gif, pdf, doc, docx | ไม่รองรับไฟล์ประเภทนี้ |

---

## 8. Error Handling

### 8.1 Message Send Errors

| Error | Display | Recovery |
|-------|---------|----------|
| Network error | Message shows ⚠️ + retry | Retry button |
| Room not found | Toast + redirect | Navigate to `/chat` |
| Auth expired | Redirect to login | - |
| Rate limited | Toast "กรุณารอสักครู่" | Auto-retry after delay |

### 8.2 Interview Action Errors

| Error | Display | Recovery |
|-------|---------|----------|
| Schedule failed | Toast in modal | Keep modal open |
| Confirm failed | Toast on card | Retry button |
| Already responded | Toast "ตอบกลับแล้ว" | Update card state |
| Interview cancelled | Update card | Remove action buttons |

### 8.3 Connection Errors

| State | Display | Behavior |
|-------|---------|----------|
| Reconnecting | Yellow banner "กำลังเชื่อมต่อ..." | Auto-reconnect |
| Disconnected 30s+ | Red banner "ขาดการเชื่อมต่อ" | Show queue indicator |
| Offline | Gray badge "ออฟไลน์" | Queue messages |
| Back online | Green toast "กลับมาออนไลน์แล้ว" | Sync queued messages |

---

## 9. Offline Behavior

### 9.1 Feature Availability

| Feature | Offline | Queued |
|---------|---------|--------|
| View cached messages | ✅ | - |
| Send text message | Queue | ✅ |
| Send file | ❌ Block | - |
| Schedule interview | ❌ Block | - |
| Confirm/Decline | Queue | ✅ |

### 9.2 Message Queue

```typescript
interface QueuedMessage {
  tempId: string;              // Local ID
  roomId: string;
  message: ChatMessage;
  queuedAt: number;
  status: 'queued' | 'sending' | 'failed';
  retryCount: number;
}

// IndexedDB storage for persistence
const MESSAGE_QUEUE_KEY = 'chancedee_message_queue';
```

### 9.3 Sync Process

1. Connection restored
2. Load queue from IndexedDB
3. For each queued message:
   - Set status to 'sending'
   - Call `sendMessageFirestore`
   - On success: Remove from queue
   - On failure: Increment retryCount, mark failed
4. Show "กลับมาออนไลน์แล้ว" banner (3s)
5. Refresh message list

---

## 10. Interview Lifecycle (Entity State Machine)

> **Cross-Reference:** See PROJECT_INSTRUCTIONS Section 4.3 for complete lifecycle.

### 10.1 Interview Entity States

| Current | Event | Next | Actor | Guard | Side Effects |
|---------|-------|------|-------|-------|--------------|
| `none` | SCHEDULE | `scheduled` | Company | App `accepted` | Create interview, update app, notify, create message |
| `scheduled` | CONFIRM | `confirmed` | Candidate | - | Update interview, update app, notify, check reward |
| `scheduled` | DECLINE | `declined` | Candidate | - | Update interview, update app, notify |
| `scheduled` | CANCEL | `cancelled` | Company | - | Update interview, notify |
| `scheduled` | RESCHEDULE | `scheduled` | Company | - | Cancel old, create new, notify |
| `confirmed` | CANCEL | `cancelled` | Company | - | Update interview, notify |
| `cancelled` | RESCHEDULE | `scheduled` | Company | - | Create new interview, notify |
| `declined` | RESCHEDULE | `scheduled` | Company | - | Create new interview, notify |

### 10.2 Interview-Application Status Sync

| Interview Status | Application Status | Notes |
|------------------|-------------------|-------|
| `scheduled` | `scheduled` | Always synced |
| `confirmed` | `confirmed` | Always synced |
| `declined` | `declined` | Always synced |
| `cancelled` | `accepted` | **Reverts** - allows reschedule |

### 10.3 First Interview Reward

**Business Purpose:** Incentivize candidates to complete their first interview on the platform.

| Aspect | Value |
|--------|-------|
| Reward amount | **100 coins** |
| Trigger | First `CONFIRM` action by candidate |
| Feature type | Permanent platform feature |
| Clawback | None (if interview cancelled after reward, coins kept) |
| Prevention | `isFirstInterviewerRewarded` flag blocks duplicate rewards |

**Flow:**
1. Candidate confirms interview
2. Check `candidate.isFirstInterviewerRewarded === false`
3. If false → Award 100 coins, set flag to `true`
4. If true → No reward (already received lifetime reward)

**Edge Cases:**
| Scenario | Reward Given |
|----------|--------------|
| First confirm on platform | ✅ Yes (100 coins) |
| Second confirm (any interview) | ❌ No (flag already true) |
| Confirm → Cancel → Confirm again | ❌ No (flag set on first confirm) |
| Interview cancelled after reward | ✅ Coins kept (no clawback) |

### 10.4 Multiple Interviews Support

**Business Rule:** Company can schedule multiple interviews for the same application.

| Scenario | Allowed |
|----------|---------|
| Schedule first interview | ✅ Yes |
| Schedule second interview while first pending | ✅ Yes |
| Schedule after candidate confirmed previous | ✅ Yes |
| Schedule after candidate declined | ✅ Yes (reschedule) |

**Use Cases:**
- Technical interview → HR interview → Final interview
- Panel interviews on different dates
- Re-interview after initial decline

**Implementation:**
- Each interview is a separate entity with own status lifecycle
- Multiple interview message cards can appear in chat
- Each card has independent confirm/decline actions

### 10.5 Interview Expiry

**Expired interviews are cleaned up by CRON job, not real-time UI.**

| Aspect | Behavior |
|--------|----------|
| Auto-status change | ❌ No (CRON handles backend) |
| UI assumption | Do NOT assume automatic expiry |
| Display | Show interview as-is until CRON updates |

**Implication for UI:**
- Interview card may show past date with `scheduled` status
- This is expected until backend CRON runs
- Do not add client-side expiry logic

---

## 11. Implementation Checklist

### Phase 1: Core Messaging
- [ ] Create chat room component
- [ ] Implement Firestore message listener
- [ ] Create message bubble components (own/other)
- [ ] Add message input with send
- [ ] Add date dividers
- [ ] Implement auto-scroll on new messages
- [ ] Add mark as read on view

### Phase 2: Message Types
- [ ] Implement text message rendering
- [ ] Implement file message rendering
- [ ] Implement image message with lightbox
- [ ] Implement emoji message (large)
- [ ] Implement system message (centered)
- [ ] Implement reply message (quote block)

### Phase 3: Interview Card
- [ ] Create appointment card component
- [ ] Implement status badge rendering
- [ ] Add confirm/decline buttons (candidate)
- [ ] Add cancel/reschedule buttons (company)
- [ ] Implement reschedule card (old→new dates)

### Phase 4: Interview Scheduling
- [ ] Create schedule modal component
- [ ] Implement form validation
- [ ] Add channel type selection (online/onsite)
- [ ] Implement addBooking action
- [ ] Implement reschedule flow
- [ ] Implement cancel flow

### Phase 5: Interview Response
- [ ] Implement confirm action
- [ ] Implement decline action
- [ ] Add first interview reward check
- [ ] Update card state after response

### Phase 6: File Upload
- [ ] Implement file picker
- [ ] Add file validation (size, type)
- [ ] Implement upload to Firestore Storage
- [ ] Show upload progress
- [ ] Handle upload errors

### Phase 7: Offline Support
- [ ] Implement message queue (IndexedDB)
- [ ] Add queued message indicator
- [ ] Implement sync on reconnect
- [ ] Block file upload when offline
- [ ] Block scheduling when offline

### Phase 8: Polish
- [ ] Add connection status banner
- [ ] Implement retry for failed messages
- [ ] Add accessibility (keyboard nav)
- [ ] Add analytics events
- [ ] Performance optimization (virtual scroll)

---

## 12. Decisions Log

| Decision | Value | Rationale | Date |
|----------|-------|-----------|------|
| Real-time via Firestore | `onSnapshot` listener | < 200ms latency, native support | 2025-12-10 |
| Interview in chat | Special message type | In-context scheduling, no navigation | 2025-12-10 |
| Status sync | Always match interview/app | Data consistency, single source of truth | 2025-12-10 |
| Cancelled → accepted | Revert app status | Allows reschedule without new application | 2025-12-10 |
| Offline queue | IndexedDB | Persist across refresh | 2025-12-10 |
| No file upload offline | Block | Cannot upload without connection | 2025-12-10 |
| 50 messages initial | Pagination | Performance, load more on scroll | 2025-12-10 |

---

## Appendix A: TypeScript Types

```typescript
// Page state
type ChatRoomPageState = 
  | 'loading'
  | 'ready'
  | 'messaging'
  | 'reconnecting'
  | 'offline'
  | 'error';

// Message send state
type MessageSendState = 
  | 'idle'
  | 'sending'
  | 'sent'
  | 'failed';

// Interview action state
type InterviewActionState = 
  | 'idle'
  | 'schedule_modal'
  | 'scheduling'
  | 'reschedule_modal'
  | 'rescheduling'
  | 'confirming'
  | 'declining'
  | 'cancelling';

// Schedule form data
interface ScheduleFormData {
  date: string;              // ISO date
  from: string;              // HH:mm
  to: string;                // HH:mm
  channel: 'online' | 'onsite';  // Only 2 channels supported
  location: string;
  room?: string;             // Video link or room number
  note?: string;
}

// Interview card props
interface AppointmentCardProps {
  message: ChatMessage;
  interview: Interview;
  isCandidate: boolean;
  onConfirm: () => void;
  onDecline: () => void;
  onCancel: () => void;
  onReschedule: () => void;
  actionState: InterviewActionState;
}

// Message bubble props
interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  showAvatar: boolean;        // First in group
  sendState?: MessageSendState;
  onRetry?: () => void;
}
```

---

## Appendix B: Message Type Render Specs

### B.1 Text Message

```tsx
<div className={cn(
  "max-w-[70%] rounded-lg px-4 py-2",
  isOwn ? "bg-teal-600 text-white ml-auto" : "bg-gray-100"
)}>
  <p>{message.message}</p>
  <div className="flex items-center justify-end gap-1 mt-1">
    <span className="text-xs opacity-70">{formatTime(message.timestamp)}</span>
    {isOwn && <ReadReceipt status={readStatus} />}
  </div>
</div>
```

### B.2 Appointment Card

```tsx
<div className="border rounded-lg p-4 my-2 max-w-md">
  <div className="flex justify-between items-start">
    <h4 className="font-semibold flex items-center gap-2">
      📅 นัดสัมภาษณ์
    </h4>
    <StatusBadge status={message.interview_status} />
  </div>
  
  <div className="mt-3 space-y-2 text-sm">
    <div className="flex items-center gap-2">
      <CalendarIcon />
      <span>{formatThaiDate(message.schedule_date)}</span>
    </div>
    <div className="flex items-center gap-2">
      <ClockIcon />
      <span>{message.schedule_time_from} - {message.schedule_time_to} น.</span>
    </div>
    <div className="flex items-center gap-2">
      <ChannelIcon type={message.channel} />
      <span>{channelLabel[message.channel]}</span>
    </div>
    {message.location && (
      <div className="flex items-center gap-2">
        <LocationIcon />
        <span>{message.location}</span>
      </div>
    )}
  </div>
  
  {/* Candidate actions */}
  {isCandidate && message.interview_status === 'scheduled' && (
    <div className="flex gap-2 mt-4">
      <Button onClick={onConfirm} variant="primary">ยืนยัน</Button>
      <Button onClick={onDecline} variant="outline">ปฏิเสธ</Button>
    </div>
  )}
  
  {/* Company actions */}
  {isCompany && message.interview_status === 'scheduled' && (
    <div className="flex gap-2 mt-4">
      <Button onClick={onCancel} variant="outline">ยกเลิก</Button>
      <Button onClick={onReschedule} variant="outline">เลื่อนนัด</Button>
    </div>
  )}
</div>
```

### B.3 System Message

```tsx
<div className="text-center text-sm text-gray-500 my-4">
  <span className="bg-gray-100 px-3 py-1 rounded-full">
    {message.system_message || message.message}
  </span>
</div>
```

---

## Appendix C: Server Action Error Handling

```typescript
// Send message with error handling
async function handleSendMessage(message: string) {
  setSendState('sending');
  
  try {
    await sendMessageFirestore({
      roomId,
      currentUser: { uid, name, avatar },
      message: {
        message,
        type: 'text',
        timestamp: Date.now(),
      }
    });
    setSendState('sent');
    setMessageText('');
  } catch (error) {
    setSendState('failed');
    if (error.code === 'ROOM_NOT_FOUND') {
      toast.error('ห้องแชทไม่พบ');
      router.push('/chat');
    } else {
      toast.error('ส่งข้อความไม่สำเร็จ', {
        action: { label: 'ลองใหม่', onClick: () => handleSendMessage(message) }
      });
    }
  }
}

// Confirm interview with error handling
async function handleConfirmInterview(interviewId: string) {
  setActionState('confirming');
  
  try {
    await updateResposeStatus(interviewId, true);
    setActionState('idle');
    toast.success('ยืนยันนัดสัมภาษณ์แล้ว');
    mutate(chatSWRKeys.interviewData(navBar, userId));
  } catch (error) {
    setActionState('idle');
    if (error.message.includes('already')) {
      toast.info('ตอบกลับแล้ว');
    } else {
      toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่');
    }
  }
}
```

---

*End of CHAT-R02 Route Implementation Specification*
