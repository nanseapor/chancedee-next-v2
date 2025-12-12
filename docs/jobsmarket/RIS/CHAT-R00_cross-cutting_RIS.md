# CHAT-R00: Chat Domain Cross-Cutting Specifications

**Document ID:** CHAT-R00  
**Version:** 1.1  
**Status:** Draft  
**Created:** 2025-12-10  
**Last Updated:** 2025-12-10  
**Applies To:** CHAT-R01 (Chat List), CHAT-R02 (Chat Room)

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.1 | 2025-12-10 | Added business context: room reuse policy (1.5), chat initiation rule (1.6), chat access rule (1.7). Fixed interview channels to online/onsite only (10.6). |
| 1.0 | 2025-12-10 | Initial creation for Wave 5 chat specifications |

---

## Purpose

This document defines shared specifications, patterns, and standards that apply across all Chat domain routes. Individual RIS documents (CHAT-R01, CHAT-R02) should reference this document rather than duplicating these specifications.

**Usage Pattern:**
```markdown
> **Cross-Reference:** See CHAT-R00 Section X for [topic].
```

---

## Table of Contents

1. [Domain Overview](#1-domain-overview)
2. [Chat FAB Specification](#2-chat-fab-specification)
3. [Chat Drawer Specification](#3-chat-drawer-specification)
4. [Real-time Connection Management](#4-real-time-connection-management)
5. [Unread Tracking Pattern](#5-unread-tracking-pattern)
6. [Message Type Registry](#6-message-type-registry)
7. [Shared TypeScript Types](#7-shared-typescript-types)
8. [SWR Key Conventions](#8-swr-key-conventions)
9. [Error Handling Standards](#9-error-handling-standards)
10. [Thai Copy Reference](#10-thai-copy-reference)

**Appendices:**
- [A: Server Action Signatures](#appendix-a-server-action-signatures)
- [B: Route Cross-Reference](#appendix-b-route-cross-reference)

---

## 1. Domain Overview

### 1.1 Route Summary

The Chat domain contains 2 routes plus cross-cutting shell integration:

| Route ID | Path | Shell | Purpose | RIS Status |
|----------|------|-------|---------|------------|
| CHAT-R00 | Shell integration | All shells | FAB, Drawer, Unread badge | ✅ This document |
| CHAT-R01 | `/chat` | Candidate/Company | Chat room list | 📋 Separate RIS |
| CHAT-R02 | `/chat/[roomId]` | Candidate/Company | Messages + Interview scheduling | 📋 Separate RIS |

### 1.2 Feature Count

| Category | Count | Feature IDs |
|----------|-------|-------------|
| Room Management | 4 | CHAT-001, CHAT-002, CHAT-005, CHAT-011 |
| Messaging | 5 | CHAT-003, CHAT-004, CHAT-009, CHAT-012, CHAT-014 |
| Interview Integration | 4 | CHAT-006, CHAT-007, CHAT-008, CHAT-010 |
| Unread Tracking | 1 | CHAT-013 |
| **TOTAL** | **14** | - |

### 1.3 Domain Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                         CHAT DOMAIN                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Triggers FROM:                   Triggers TO:                   │
│  ┌─────────────┐                  ┌─────────────┐               │
│  │  COMP-R08   │──AcceptApp──────→│ Create Room │               │
│  │ Applications│                  │ Send System │               │
│  └─────────────┘                  │   Message   │               │
│                                   └─────────────┘               │
│  ┌─────────────┐                  ┌─────────────┐               │
│  │  CAND-R04   │──ViewChat───────→│ Open Room   │               │
│  │ Applications│                  └─────────────┘               │
│  └─────────────┘                                                │
│                                   ┌─────────────┐               │
│  Interview Actions:               │ Update App  │               │
│  ┌─────────────┐                  │   Status    │               │
│  │  CHAT-R02   │──Confirm────────→│ Send Notif  │               │
│  │ Schedule/   │  Decline         └─────────────┘               │
│  │ Respond     │  Cancel                                        │
│  └─────────────┘  Reschedule                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.4 Chat Room ID Generation

**Algorithm:** MD5 hash of `{companyId}::{candidateId}`

```typescript
import { MD5 } from 'crypto-js';

function generateChatRoomId(companyId: string, candidateId: string): string {
  return MD5(`${companyId}::${candidateId}`).toString();
}
```

**Properties:**
- **Deterministic:** Same parties always get same room ID
- **Idempotent:** Multiple accept actions don't create duplicate rooms
- **Unique:** Different party pairs always get different rooms

### 1.5 Room Reuse Policy

**One room per candidate×company pair regardless of number of job applications.**

| Scenario | Room Behavior |
|----------|---------------|
| Candidate applies to Job A at Company X | Room created on accept |
| Candidate applies to Job B at Company X | **Same room reused** |
| Candidate applies to Job C at Company Y | New room (different company) |

**Business Rationale:** 
- All conversations between a candidate and company stay in single thread
- Historical context preserved across multiple applications
- Simplifies chat management for both parties

### 1.6 Chat Initiation Rule

**Only companies can initiate chat.** Candidates cannot start conversations.

| Actor | Can Initiate Chat | How |
|-------|-------------------|-----|
| Company | ✅ Yes | Accept application → Room auto-created |
| Candidate | ❌ No | Must wait for company to accept |

**Business Rationale:**
- Chat is tied to application acceptance workflow
- Prevents spam/unsolicited messages to companies
- Ensures chat only exists when there's genuine hiring interest

### 1.7 Chat Access Rule

| Scenario | Chat Accessible |
|----------|-----------------|
| All applications rejected (no room exists) | ❌ No |
| At least one application accepted (room exists) | ✅ Yes |
| Application later rejected after chat created | ✅ Yes (room persists) |

**Principle:** If chat room exists, both parties can access it. Room existence = at least one acceptance happened.

---

## 2. Chat FAB Specification

### 2.1 Placement

The Chat FAB (Floating Action Button) appears in:

| Shell | Position | Visibility |
|-------|----------|------------|
| Candidate Shell | Bottom-right, above bottom nav (mobile) | Always when authenticated |
| Company Shell | Bottom-right | Always when authenticated |
| Minimal Shell | Hidden | - |
| Public Shell | Hidden | - |

### 2.2 FAB Component

```
┌─────────────────────────────┐
│                             │
│                    [💬 3]   │  ← Unread badge (red)
│                             │
│                             │
└─────────────────────────────┘
         ↑
    Position: fixed
    Right: 24px
    Bottom: 80px (mobile with nav)
    Bottom: 24px (desktop)
```

| Component | Purpose | Action |
|-----------|---------|--------|
| FAB Button | Open chat | Navigate to `/chat` |
| Unread Badge | Total unread | Show count, max "99+" |
| Chat Icon | Visual indicator | 💬 or message icon |

### 2.3 FAB State Machine

| Current State | Event | Next State | Side Effects |
|---------------|-------|------------|--------------|
| `hidden` | USER_AUTHENTICATED | `visible` | Show FAB |
| `visible` | CLICK | `visible` | Navigate to `/chat` |
| `visible` | NEW_MESSAGE | `visible` | Increment badge |
| `visible` | MESSAGES_READ | `visible` | Decrement badge |
| `visible` | USER_LOGOUT | `hidden` | Hide FAB |

### 2.4 FAB TypeScript

```typescript
interface ChatFABState {
  visible: boolean;
  unreadCount: number;
}

// Jotai atom for FAB badge
const chatUnreadTotalAtom = atom<number>(0);
```

---

## 3. Chat Drawer Specification

### 3.1 Purpose

The Chat Drawer is a slide-in panel that opens when:
1. Company accepts an application (COMP-R08 trigger)
2. User clicks on a chat notification
3. User clicks "Chat" action on an application card

**Key Behavior:** Opens in current page, does NOT navigate to `/chat`.

### 3.2 Drawer Component

```
┌───────────────────────────────────────────────────────────────────┐
│  Current Page Content                       │  Chat Drawer (400px) │
│                                             │                      │
│  [Application List]                         │  [Mini Chat View]    │
│                                             │                      │
│                                             │  - Header            │
│                                             │  - Messages          │
│                                             │  - Input             │
│                                             │                      │
└───────────────────────────────────────────────────────────────────┘
```

### 3.3 Drawer Atom

```typescript
// store/chat-atoms.tsx
interface ChatDrawerState {
  isOpen: boolean;
  chatId: string | null;
}

const chatDrawerAtom = atom<ChatDrawerState>({
  isOpen: false,
  chatId: null,
});
```

### 3.4 Drawer Hook

```typescript
// hooks/useChatDrawer.ts
export function useChatDrawer() {
  const [chatDrawer, setChatDrawer] = useAtom(chatDrawerAtom);
  
  const openDrawer = (chatId: string) => {
    setChatDrawer({ isOpen: true, chatId });
  };
  
  const closeDrawer = () => {
    setChatDrawer({ isOpen: false, chatId: null });
  };
  
  return { chatDrawer, openDrawer, closeDrawer };
}
```

### 3.5 Accept Flow Integration

> **Cross-Reference:** See COMP-R08 Section 6.2 for full accept flow.

```typescript
// COMP-R08: After accept succeeds
const handleAccept = async (applicationId: string) => {
  const result = await AcceptApplication(input);
  
  if (result.status === 200 && result.chatId) {
    // Open drawer, stay on applications page
    openDrawer(result.chatId);
    toast.success('ตอบรับใบสมัครแล้ว');
  }
};
```

---

## 4. Real-time Connection Management

### 4.1 Firestore Listener Architecture

Chat uses Firestore real-time listeners (not polling):

```typescript
// Subscribe to messages in a room
const unsubscribe = onSnapshot(
  query(
    collection(db, 'web_messages'),
    where('room_id', '==', roomId),
    orderBy('timestamp', 'desc'),
    limit(50)
  ),
  (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setChatMessages(messages);
  }
);
```

### 4.2 Connection States

| State | Description | UI Indicator |
|-------|-------------|--------------|
| `connected` | Active Firestore connection | Green dot |
| `reconnecting` | Lost connection, auto-retry | Yellow spinner |
| `disconnected` | No connection (30s+) | Red banner |
| `offline` | Device offline | Gray badge "ออฟไลน์" |

### 4.3 Listener Lifecycle

| Event | Action |
|-------|--------|
| Room selected | Subscribe to room messages |
| Room changed | Unsubscribe old, subscribe new |
| Component unmount | Unsubscribe all |
| Connection lost | Auto-reconnect with backoff |
| Connection restored | Resync messages, show "กลับมาออนไลน์แล้ว" |

### 4.4 Message Latency Target

| Metric | Target | Measurement |
|--------|--------|-------------|
| Send to appear | < 200ms | Firestore → listener |
| Initial load | < 500ms | 50 messages |
| Room list refresh | < 2 seconds | Metadata only |

---

## 5. Unread Tracking Pattern

### 5.1 Mechanism

Messages track unread status via `unread[]` array containing user IDs who haven't read the message.

```typescript
interface ChatMessage {
  id: string;
  room_id: string;
  message: string;
  timestamp: number;
  unread: string[];  // User IDs who haven't read
  // ... other fields
}
```

### 5.2 Unread Flow

**On Send:**
```typescript
// Add all recipients except sender to unread array
const unreadArray = participants.filter(id => id !== senderId);
await createMessage({ ...message, unread: unreadArray });
```

**On Read:**
```typescript
// Batch remove current user from unread arrays
const messagesToUpdate = messages.filter(m => m.unread.includes(userId));
await webMessagesBatchUpdate(messagesToUpdate.map(m => ({
  uid: m.id,
  unread: m.unread.filter(id => id !== userId)
})));
```

### 5.3 Unread Badge Calculation

```typescript
// Per-room unread count
const roomUnreadCount = messages.filter(m => 
  m.unread.includes(currentUserId)
).length;

// Total unread count (for FAB)
const totalUnread = rooms.reduce((sum, room) => 
  sum + room.unreadCount, 0
);
```

### 5.4 Unread Atoms

```typescript
// Messages with current user in unread array
const unreadMessagesAtom = atom<ChatMessage[]>([]);

// Total unread count for FAB badge
const totalUnreadAtom = atom<number>((get) => 
  get(unreadMessagesAtom).length
);
```

---

## 6. Message Type Registry

### 6.1 Message Types

| Type | Creator | Rendering | Actions |
|------|---------|-----------|---------|
| `text` | Both | Bubble (teal own, gray other) | None |
| `file` | Both | File card with icon + download | Download |
| `image` | Both | Thumbnail (max 300px) | Lightbox |
| `emoji` | Both | Large emoji (48px) | None |
| `reply` | Both | Quote block + response | None |
| `interview` | Company | Appointment card | Confirm/Decline (candidate) |
| `interview-reschedule` | Company | Card with old→new dates | Confirm/Decline |
| `offer` | Company | Job offer card | View job link |
| `system` | System | Centered, muted style | None |

### 6.2 Message Type Enum

```typescript
const MESSAGE_TYPES = {
  TEXT: 'text',
  FILE: 'file',
  IMAGE: 'image',
  EMOJI: 'emoji',
  REPLY: 'reply',
  INTERVIEW: 'interview',
  INTERVIEW_RESCHEDULE: 'interview-reschedule',
  OFFER: 'offer',
  SYSTEM: 'system',
} as const;

type MessageType = typeof MESSAGE_TYPES[keyof typeof MESSAGE_TYPES];
```

### 6.3 Interview Message Fields

For `interview` and `interview-reschedule` types:

```typescript
interface InterviewMessageFields {
  interview_id: string;
  application_id: string;
  candidate_id: string;
  company_id: string;
  job_id: string;
  schedule_date: string;        // ISO date
  schedule_time_from: string;   // HH:mm
  schedule_time_to: string;     // HH:mm
  interview_status: InterviewStatus;
  channel: 'online' | 'onsite';
  location: string;
  
  // For reschedule only
  reschedule_old_date?: string;
  reschedule_new_date?: string;
}
```

### 6.4 System Message Fields

```typescript
interface SystemMessageFields {
  system_title: string;     // Notification title
  system_company: string;   // Company name context
  system_message: string;   // Detailed message
}
```

### 6.5 Message Rendering Rules

| Type | Bubble Style | Position | Width |
|------|--------------|----------|-------|
| `text` | Rounded, colored | Left/Right | Auto (max 70%) |
| `file` | Card style | Left/Right | Fixed 280px |
| `image` | No bubble | Left/Right | Max 300px |
| `emoji` | No bubble | Left/Right | Fixed 48px |
| `interview` | Card, distinct border | Center | Full width |
| `system` | Muted, small text | Center | Auto |

---

## 7. Shared TypeScript Types

### 7.1 Core Types

```typescript
// Chat room entity
interface ChatRoom {
  uid: string;                     // MD5 hash ID
  candidateId: string;
  candidateName: string;
  companyId: string;
  companyName: string;
  responsibleHrId: string;
  responsibleHrName: string;
  lastMessageText: string | null;
  lastMessageSender: 'candidate' | 'hr';
  lastMessageTime: number;
  status: 'active' | 'pending' | 'closed';
  timestamp: number;               // Room creation time
  createdAt: number;
  updatedAt: number;
}

// Room list item (lightweight)
interface RoomListItem {
  uid: string;
  otherPartyName: string;          // Candidate or company name
  otherPartyPhoto: string | null;
  positionContext: string;         // Job title context
  lastMessage: string;
  lastMessageTime: number;
  unreadCount: number;
  hasPendingAppointment: boolean;
}

// Chat message
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
  
  // Interview-specific (optional)
  interview_id?: string;
  application_id?: string;
  schedule_date?: string;
  schedule_time_from?: string;
  schedule_time_to?: string;
  interview_status?: InterviewStatus;
  channel?: 'online' | 'onsite';
  location?: string;
  
  // System message (optional)
  system_title?: string;
  system_message?: string;
}
```

### 7.2 Interview Types

```typescript
// Interview status enum
type InterviewStatus = 
  | 'scheduled'
  | 'confirmed'
  | 'declined'
  | 'cancelled';

// Interview entity (from job_interviews collection)
interface Interview {
  uid: string;
  jobId: string;
  applicationId: string;
  candidateId: string;
  companyId: string;
  candidateName: string;
  companyName: string;
  channel: 'online' | 'onsite';
  status: InterviewStatus;
  appointment: number;           // Timestamp
  from: string;                  // HH:mm
  to: string;                    // HH:mm
  location: string;
  room?: string;                 // Video call URL or room number
  note?: string;
  isCancel: boolean;
  cancelReason?: string;
  isAccepted: boolean;
  rejectFeedback?: string;
  createdAt: number;
  updatedAt: number;
}
```

### 7.3 State Types

```typescript
// Page states for chat routes
type ChatPageState = 
  | 'loading'
  | 'ready'
  | 'empty_rooms'
  | 'room_selected'
  | 'error'
  | 'offline';

// Send message state
type SendState = 
  | 'idle'
  | 'sending'
  | 'sent'
  | 'queued'
  | 'failed';

// Interview action state
type InterviewActionState = 
  | 'idle'
  | 'schedule_modal'
  | 'scheduling'
  | 'confirming'
  | 'declining'
  | 'cancelling'
  | 'rescheduling';
```

---

## 8. SWR Key Conventions

### 8.1 Chat Domain Keys

```typescript
export const chatSWRKeys = {
  // Room list metadata
  roomsMetadata: (navBar: 'candidate' | 'company') => 
    `chat-rooms-metadata-${navBar}`,
  
  // Single room details
  room: (roomId: string) => 
    `chat-room-${roomId}`,
  
  // Room base params (with messages)
  roomBaseParams: (roomId: string) => 
    `GetChatBaseParams-${roomId || 'initial'}`,
  
  // Interview data for chat context
  interviewData: (navBar: string, userId: string) => 
    `chat-interviews-${navBar}-${userId}`,
  
  // Unread count
  unreadCount: (userId: string) => 
    `chat-unread-${userId}`,
};
```

### 8.2 Cache Configuration

| Key Pattern | Dedupe Interval | Refresh Interval | Revalidate on Focus |
|-------------|-----------------|------------------|---------------------|
| `rooms-metadata` | 30s | 60s | ✅ |
| `room-*` | 5s | - | ❌ (real-time) |
| `interviews-*` | 30s | 60s | ✅ |
| `unread-*` | 10s | 30s | ✅ |

### 8.3 Invalidation Triggers

| Event | Invalidate Keys |
|-------|-----------------|
| Send message | `room-{roomId}`, `rooms-metadata-*` |
| Accept application | `rooms-metadata-*` |
| Interview scheduled | `interviews-*`, `room-{roomId}` |
| Interview response | `interviews-*`, `room-{roomId}` |
| Mark as read | `unread-*`, `rooms-metadata-*` |

---

## 9. Error Handling Standards

### 9.1 Error Categories

| Category | HTTP | Handling | User Message |
|----------|------|----------|--------------|
| Auth required | 401 | Redirect to login | - |
| Forbidden | 403 | Show error, stay on page | "ไม่มีสิทธิ์เข้าถึง" |
| Room not found | 404 | Redirect to `/chat` | "ห้องแชทไม่พบ" |
| Message send fail | 500 | Retry option | "ส่งข้อความไม่สำเร็จ" |
| Connection lost | - | Auto-reconnect | "ขาดการเชื่อมต่อ" |
| Offline | - | Queue messages | "ออฟไลน์ - ข้อความจะส่งเมื่อกลับมาออนไลน์" |

### 9.2 Error Toast Patterns

```typescript
// Success
toast.success('ส่งข้อความแล้ว');
toast.success('ยืนยันนัดสัมภาษณ์แล้ว');

// Error with retry
toast.error('ส่งไม่สำเร็จ', {
  action: {
    label: 'ลองใหม่',
    onClick: () => retrySend()
  }
});

// Warning
toast.warning('กำลังเชื่อมต่อใหม่...');

// Info
toast.info('กลับมาออนไลน์แล้ว');
```

### 9.3 Offline Queue

```typescript
interface QueuedMessage {
  id: string;           // Temp ID
  roomId: string;
  message: ChatMessage;
  queuedAt: number;
  status: 'queued' | 'sending' | 'failed';
  retryCount: number;
}

// Store in IndexedDB for persistence
const messageQueueAtom = atom<QueuedMessage[]>([]);
```

---

## 10. Thai Copy Reference

### 10.1 Page Titles

| Route | Thai | English |
|-------|------|---------|
| CHAT-R01 | ข้อความ | Messages |
| CHAT-R02 | แชท | Chat |

### 10.2 Empty States

| State | Thai | Note |
|-------|------|------|
| No rooms (candidate) | ยังไม่มีข้อความ | + explanation |
| No rooms (company) | ยังไม่มีข้อความ | + CTA |
| No selected chat | เลือกการสนทนาเพื่อเริ่มแชท | Desktop only |

**Candidate explanation:**
"เมื่อบริษัทตอบรับใบสมัครของคุณ คุณจะสามารถแชทกับบริษัทได้ที่นี่"

### 10.3 Interview Appointment

| Status | Thai | Badge Color |
|--------|------|-------------|
| scheduled | รอการยืนยัน | Yellow |
| confirmed | ยืนยันแล้ว | Green |
| declined | ถูกปฏิเสธ | Red |
| cancelled | ยกเลิก | Gray |

### 10.4 Action Labels

| Action | Thai |
|--------|------|
| Send | ส่ง |
| Confirm | ยืนยัน |
| Decline | ปฏิเสธ |
| Cancel | ยกเลิก |
| Reschedule | เลื่อนนัด |
| Schedule interview | นัดสัมภาษณ์ |
| Send appointment | ส่งนัดหมาย |
| Download | ดาวน์โหลด |
| Retry | ลองใหม่ |
| View profile | ดูโปรไฟล์ |

### 10.5 Time/Date Format

| Context | Format | Example |
|---------|--------|---------|
| Relative time | Thai relative | เมื่อกี้, 5 นาทีที่แล้ว, เมื่อวาน |
| Appointment date | Thai full | วันพุธที่ 15 ธ.ค. 2567 |
| Time range | Thai | 14:00 - 15:00 น. |
| Date divider | Thai | วันนี้, เมื่อวาน, 13 ธ.ค. |

### 10.6 Interview Channel Labels

| Channel | Thai |
|---------|------|
| online | สัมภาษณ์ออนไลน์ |
| onsite | สัมภาษณ์ที่สำนักงาน |

> **Note:** Only 2 channels supported. No phone interview option.

### 10.7 Error Messages

| Error | Thai |
|-------|------|
| Room not found | ห้องแชทไม่พบ |
| Send failed | ส่งข้อความไม่สำเร็จ |
| File too large | ไฟล์ใหญ่เกิน 10MB |
| Invalid file type | ไม่รองรับไฟล์ประเภทนี้ |
| Connection lost | ขาดการเชื่อมต่อ |
| Back online | กลับมาออนไลน์แล้ว |
| Rate limited | กรุณารอสักครู่ |
| User deleted | ผู้ใช้ลบบัญชีแล้ว |
| Cannot send | ไม่สามารถส่งข้อความได้ |

---

## Appendix A: Server Action Signatures

### A.1 Room Management

```typescript
// Get room metadata (lightweight)
// Location: /api/chat/rooms-metadata
async function GetRoomsMetadata(navBar: 'candidate' | 'company'): Promise<{
  currentUser: User;
  chatRooms: RoomListItem[];
  viewRoom: null;
}>;

// Create chat room (called by AcceptApplication)
// Location: src/domains/chat/services/server/actions/chat-management.ts
async function startChats(params: {
  companyId: string;
  candidateId: string;
  hrId: string;
  jobId: string;
  applicationId: string;
  InitMessage: MessageInterview;
  type: MessageType;
  name: string;
  companyName: string;
}): Promise<string>; // Returns chat room hash ID
```

### A.2 Messaging

```typescript
// Send message
// Location: src/domains/chat/services/server/actions/chat-management.ts
async function sendMessageFirestore(params: {
  roomId: string;
  currentUser: { uid: string; name: string; avatar: string };
  message: {
    message: string;
    type: MessageType;
    timestamp: number;
  };
}): Promise<{
  status: 200;
  message: 'success';
  payload: ChatMessage;
}>;

// Mark messages as read
// Location: src/lib/database/actions/messages.ts
async function webMessagesBatchUpdate(
  updates: Array<{ uid: string; unread: string[] }>
): Promise<void>;
```

### A.3 Interview Actions

```typescript
// Schedule interview
// Location: src/domains/jobs/services/server/actions/interview-management.ts
async function addBooking(input: {
  date: string;
  from: string;
  to: string;
  channel: 'online' | 'onsite';
  status: InterviewStatus;
  location?: string;
  room?: string;
  note?: string;
  contact: { email: string };
  applicationId: string;
}): Promise<'success' | 'fail'>;

// Reschedule interview
async function updateBooking(input: {
  uid: string;                   // Interview ID
  date: string;
  from: string;
  to: string;
  channel: 'online' | 'onsite';
  status: InterviewStatus;
  cancelReason?: string;
  contact: { email: string };
  applicationId: string;
}): Promise<'success'>;

// Confirm/Decline interview
async function updateResposeStatus(
  bookingId: string,
  acceptedStatus: boolean       // true = confirm, false = decline
): Promise<'success'>;
```

---

## Appendix B: Route Cross-Reference

### B.1 Incoming Triggers

| Source Route | Action | Effect on Chat |
|--------------|--------|----------------|
| COMP-R08 | Accept Application | Create room, open drawer, send system message |
| COMP-R08 | Reject Application | (No chat effect) |
| CAND-R04 | Click "Chat" | Navigate to room |

### B.2 Outgoing Effects

| Chat Action | Affected Route | Effect |
|-------------|----------------|--------|
| Confirm Interview | CAND-R04 | Update application status badge |
| Decline Interview | CAND-R04 | Update application status badge |
| Cancel Interview | CAND-R04, COMP-R08 | Update status, show cancelled |

### B.3 Status Sync Table

Interview and Application status are always synchronized:

| Interview Status | Application Status | Notes |
|------------------|-------------------|-------|
| `scheduled` | `scheduled` | Created together |
| `confirmed` | `confirmed` | Candidate confirms |
| `declined` | `declined` | Candidate declines |
| `cancelled` | `accepted` | App reverts to accepted |

> **Key Decision:** `cancelled` interview reverts application to `accepted` (not a terminal state) so company can reschedule.

---

*End of CHAT-R00 Cross-Cutting Specification*
