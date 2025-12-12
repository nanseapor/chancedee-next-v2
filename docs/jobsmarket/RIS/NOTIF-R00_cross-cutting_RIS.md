# NOTIF-R00: Notifications Domain Cross-Cutting Specifications

**Document ID:** NOTIF-R00  
**Version:** 2.0  
**Status:** Draft  
**Created:** 2025-12-10  
**Last Updated:** 2025-12-10  
**Applies To:** NOTIF-R01 (Notification Center)

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | 2025-12-10 | Complete rewrite: notifications are chat messages in `web_messages`, not `ff_push_notifications`. Added message type taxonomy, filter categories, grouped messages display. |
| 1.0 | 2025-12-10 | Initial creation (incorrect architecture) |

---

## Purpose

This document defines shared specifications, patterns, and standards that apply across all Notifications domain routes and shell integration. The primary RIS document (NOTIF-R01) should reference this document rather than duplicating these specifications.

**Key Architecture Insight:**
> Notifications are NOT a separate collection. They are specific message types within the existing `web_messages` collection. The notification system provides a unified view of status-change messages and unread chat messages across all rooms.

---

## Table of Contents

1. [Domain Overview](#1-domain-overview)
2. [Message Type Taxonomy](#2-message-type-taxonomy)
3. [Room Types](#3-room-types)
4. [Shell Bell Specification](#4-shell-bell-specification)
5. [Notification Dropdown Specification](#5-notification-dropdown-specification)
6. [Filter Categories](#6-filter-categories)
7. [Shared TypeScript Types](#7-shared-typescript-types)
8. [Query Patterns](#8-query-patterns)
9. [Error Handling Standards](#9-error-handling-standards)
10. [Thai Copy Reference](#10-thai-copy-reference)

**Appendices:**
- [A: Message Type Enum](#appendix-a-message-type-enum)
- [B: Server Action Signatures](#appendix-b-server-action-signatures)
- [C: Route Cross-Reference](#appendix-c-route-cross-reference)

---

## 1. Domain Overview

### 1.1 Route Summary

| Route ID | Path | Shell | Purpose | RIS Status |
|----------|------|-------|---------|------------|
| NOTIF-R00 | Shell integration | All authenticated shells | Bell icon, badge, dropdown | ✅ This document |
| NOTIF-R01 | `/notifications` | Candidate/Company | Notification center page | 📋 Separate RIS |

### 1.2 Core Architecture

**Notifications = Chat Messages**

The notification system is built on top of the chat infrastructure:

```
┌─────────────────────────────────────────────────────────────────────┐
│                         web_messages                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Chat Messages (FAB badge)        Notification Messages (Bell badge) │
│  ┌─────────────────────┐          ┌─────────────────────┐           │
│  │ • text              │          │ • application-*     │           │
│  │ • file              │          │ • interview-*       │           │
│  │ • image             │          │ • offer             │           │
│  │ • emoji             │          │ • platform          │           │
│  │ • reply             │          │ • system (legacy)   │           │
│  └─────────────────────┘          └─────────────────────┘           │
│                                                                      │
│  Grouped by room in                Individual items in               │
│  "Messages" filter                 other filters                     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.3 Two Badge Counts (Separate)

| Badge | Location | Message Types | Purpose |
|-------|----------|---------------|---------|
| **Bell** | Header (notifications) | `application-*`, `interview-*`, `offer`, `platform`, `system` | Status changes, scheduling, announcements |
| **Chat FAB** | Bottom-right | `text`, `file`, `image`, `emoji`, `reply` | Active conversations |

**Unified View:** The `/notifications` page shows BOTH via filter tabs, but badges are counted separately.

### 1.4 Notification Channels

| Channel | Technology | Purpose | Relationship |
|---------|------------|---------|--------------|
| Email | SendGrid | Out-of-app alerts | Sent for important events; independent of chat |
| Chat Message | Firestore (`web_messages`) | In-app notifications | Primary notification mechanism |

**Note:** `ff_push_notifications` is for FCM push delivery only, not the notification center data source.

---

## 2. Message Type Taxonomy

### 2.1 Notification Message Types (Bell Badge)

| Type | Sender | Recipient | Trigger | Room |
|------|--------|-----------|---------|------|
| `application-received` | System | Company | Candidate submits application | Company :: Candidate |
| `application-accepted` | System | Candidate | Company accepts application | Company :: Candidate |
| `application-rejected` | System | Candidate | Company rejects application | Platform :: User * |
| `interview` | System | Candidate | Company schedules interview | Company :: Candidate |
| `interview-reschedule` | System | Candidate | Company reschedules interview | Company :: Candidate |
| `interview-confirmed` | System | Company | Candidate confirms interview | Company :: Candidate |
| `interview-declined` | System | Company | Candidate declines interview | Company :: Candidate |
| `interview-cancelled` | System | Candidate | Company cancels interview | Company :: Candidate |
| `offer` | System | Candidate | Company sends job offer | Company :: Candidate |
| `platform` | Platform | User | Announcements, maintenance | Platform :: User |
| `system` | System | Either | Legacy/generic status changes | Either |

*Note: `application-rejected` may go to Platform room if Company room doesn't exist yet.

### 2.2 Chat Message Types (FAB Badge)

| Type | Description | Display in Notifications |
|------|-------------|-------------------------|
| `text` | Plain text message | Grouped by room |
| `file` | File attachment | Grouped by room |
| `image` | Image attachment | Grouped by room |
| `emoji` | Emoji reaction | Grouped by room |
| `reply` | Reply to message | Grouped by room |

### 2.3 Type Constants

```typescript
// Notification types (Bell badge)
const NOTIFICATION_MESSAGE_TYPES = [
  'application-received',
  'application-accepted', 
  'application-rejected',
  'interview',
  'interview-reschedule',
  'interview-confirmed',
  'interview-declined',
  'interview-cancelled',
  'offer',
  'platform',
  'system',
] as const;

// Chat types (FAB badge)
const CHAT_MESSAGE_TYPES = [
  'text',
  'file', 
  'image',
  'emoji',
  'reply',
] as const;

type NotificationMessageType = typeof NOTIFICATION_MESSAGE_TYPES[number];
type ChatMessageType = typeof CHAT_MESSAGE_TYPES[number];
type MessageType = NotificationMessageType | ChatMessageType;
```

---

## 3. Room Types

### 3.1 Company :: Candidate Room

**Purpose:** Communication between company and candidate for hiring process.

| Property | Value |
|----------|-------|
| Room ID | `MD5('{companyId}::{candidateId}')` |
| `company_id` | Company document ID |
| `candidate_id` | Candidate document ID |
| Contains | All message types |

### 3.2 Platform :: User Room

**Purpose:** Platform-to-user direct notifications.

| Property | Value |
|----------|-------|
| Room ID | `MD5('system::{userId}')` |
| `company_id` | `''` (empty string) |
| `candidate_id` | User's candidate ID (if candidate) |
| Contains | `platform`, `system`, `application-rejected` (when no company room) |

### 3.3 Room Type Detection

```typescript
function isPlatformRoom(message: Message): boolean {
  return message.company_id === '';
}

function isCompanyRoom(message: Message): boolean {
  return message.company_id !== '';
}
```

---

## 4. Shell Bell Specification

### 4.1 Placement

| Shell | Position | Visibility |
|-------|----------|------------|
| Candidate Shell | Header right, before avatar | When authenticated |
| Company Shell | Header right, before avatar | When authenticated |
| Minimal Shell | Hidden | - |
| Public Shell | Hidden | - |

### 4.2 Bell Component Layout

```
┌──────────────────────────────────────────────────────────────┐
│  [Logo]   Nav Items...              [🔔 5] [Avatar ▼]        │
│                                       ↑                       │
│                           Bell with notification badge        │
└──────────────────────────────────────────────────────────────┘
```

### 4.3 Badge Count Query

**Bell badge counts ONLY notification-type messages:**

```typescript
// Pseudocode for bell badge count
const bellBadgeCount = await countMessages({
  where: [
    { field: 'type', op: 'in', value: NOTIFICATION_MESSAGE_TYPES },
    { field: 'unread', op: 'array-contains', value: currentUserId },
    // Role-based filter
    role === 'company' 
      ? { field: 'company_id', op: '==', value: userCompanyId }
      : { field: 'candidate_id', op: '==', value: userUid }
  ]
});
```

### 4.4 Bell Visual Specs

| Element | Property | Value |
|---------|----------|-------|
| Bell icon | Size | 24px |
| Bell icon | Color (default) | Gray-600 |
| Bell icon | Color (has unread) | Teal-600 |
| Badge | Size | 18px min-width |
| Badge | Background | Red-500 |
| Badge | Text | White, 12px, bold |
| Badge | Position | Top-right, offset -4px |
| Badge | Max display | "99+" |

### 4.5 Bell State Machine

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `hidden` | USER_AUTHENTICATED | `idle` | - | Fetch unread count |
| `idle` | FETCH_SUCCESS | `ready` | count ≥ 0 | Show badge if > 0 |
| `idle` | FETCH_ERROR | `error` | - | Log error, show bell without badge |
| `ready` | CLICK | `dropdown_open` | Desktop | Open dropdown |
| `ready` | CLICK | `ready` | Mobile | Navigate to `/notifications` |
| `ready` | NEW_NOTIFICATION | `ready` | - | Increment badge |
| `ready` | NOTIFICATION_READ | `ready` | - | Decrement badge |
| `dropdown_open` | OUTSIDE_CLICK | `ready` | - | Close dropdown |
| `dropdown_open` | ITEM_CLICK | `ready` | - | Close, navigate |
| `ready` | USER_LOGOUT | `hidden` | - | Hide bell |

---

## 5. Notification Dropdown Specification

### 5.1 Purpose

Quick preview showing recent notification-type messages. **Desktop only** — on mobile, bell tap navigates directly to `/notifications`.

### 5.2 Dropdown Layout

```
┌─────────────────────────────────┐
│  การแจ้งเตือน        [อ่านทั้งหมด] │
├─────────────────────────────────┤
│  📄 ใบสมัครของคุณได้รับการตอบรับ   │  ← application-accepted
│     บริษัท ABC          2 นาที  ●│
├─────────────────────────────────┤
│  📅 นัดสัมภาษณ์ใหม่              │  ← interview
│     บริษัท XYZ          1 ชม.    │
├─────────────────────────────────┤
│  ⚙️ ระบบจะปิดปรับปรุง...         │  ← platform
│     ChanceDee          เมื่อวาน  │
├─────────────────────────────────┤
│        [ดูทั้งหมด →]              │
└─────────────────────────────────┘
     Width: 360px
     Max Height: 400px
```

### 5.3 Dropdown Shows Notification Types Only

The dropdown preview shows only `NOTIFICATION_MESSAGE_TYPES`, not chat messages. Users see chat messages via:
1. Chat FAB badge
2. "Messages" filter tab in notification center

### 5.4 Dropdown Components

| Component | Purpose | Action |
|-----------|---------|--------|
| Header | Title + mark all read | - |
| ↳ Title | "การแจ้งเตือน" | - |
| ↳ Mark All Read | "อ่านทั้งหมด" | Mark displayed notifications as read |
| Notification List | 5 recent notification-type messages | Scrollable |
| ↳ Notification Item | Single notification | Click to navigate |
| Footer | View all link | Navigate to `/notifications` |

### 5.5 Dropdown State Machine

| Current State | Event | Next State | Side Effects |
|---------------|-------|------------|--------------|
| `closed` | BELL_CLICK | `loading` | Fetch recent 5 notification messages |
| `loading` | FETCH_SUCCESS | `open` | Show items |
| `loading` | FETCH_ERROR | `error` | Show error state |
| `open` | ITEM_CLICK | `closed` | Mark read, navigate to `action_link` or chat |
| `open` | MARK_ALL_READ | `open` | API call, clear badges |
| `open` | VIEW_ALL_CLICK | `closed` | Navigate to `/notifications` |
| `open` | OUTSIDE_CLICK | `closed` | - |

---

## 6. Filter Categories

### 6.1 Filter to Message Type Mapping

| Filter | Thai | Message Types | Display Style |
|--------|------|---------------|---------------|
| All | ทั้งหมด | All types | Mixed (notifications individual, messages grouped) |
| Applications | ใบสมัคร | `application-received`, `application-accepted`, `application-rejected`, `offer` | Individual items |
| Messages | ข้อความ | `text`, `file`, `image`, `emoji`, `reply` | **Grouped by room** |
| Appointments | การนัดหมาย | `interview`, `interview-reschedule`, `interview-confirmed`, `interview-declined`, `interview-cancelled` | Individual items |
| System | ระบบ | `platform`, `system` | Individual items |

### 6.2 Filter Constants

```typescript
type NotificationFilter = 'all' | 'applications' | 'messages' | 'appointments' | 'system';

const FILTER_MESSAGE_TYPES: Record<NotificationFilter, MessageType[]> = {
  all: [...NOTIFICATION_MESSAGE_TYPES, ...CHAT_MESSAGE_TYPES],
  applications: ['application-received', 'application-accepted', 'application-rejected', 'offer'],
  messages: ['text', 'file', 'image', 'emoji', 'reply'],
  appointments: ['interview', 'interview-reschedule', 'interview-confirmed', 'interview-declined', 'interview-cancelled'],
  system: ['platform', 'system'],
};
```

### 6.3 "Messages" Filter Grouping

Unlike other filters that show individual notification items, the "Messages" filter groups chat messages by room:

```
┌─────────────────────────────────────────┐
│ 💬 บริษัท ABC                    3 ข้อความ │
│    สวัสดีครับ ขอสอบถาม...        2 นาที  ●│
├─────────────────────────────────────────┤
│ 💬 บริษัท XYZ                    1 ข้อความ │
│    ขอบคุณครับ...                 1 ชม.    │
└─────────────────────────────────────────┘
```

**Fields for grouped display:**
- Company/sender name: from room data
- Unread count: count of messages where `unread` contains user
- Last message preview: `text` field of most recent message
- Timestamp: most recent message timestamp
- Click action: Navigate to `/chat/[roomId]`

---

## 7. Shared TypeScript Types

### 7.1 Message (from web_messages)

```typescript
interface Message {
  uid: string;
  message_id: string;
  room_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar: string;
  type: MessageType;
  
  // Content fields
  text?: string;
  file_url?: string;
  file_type?: string;
  file_size?: number;
  emoji_code?: string;
  emoji_url?: string;
  
  // Context fields
  application_id?: string;
  candidate_id: string;
  company_id: string;
  job_id?: string;
  job_title?: string;
  candidate_name?: string;
  
  // Interview fields
  interview_id?: string;
  status?: string;
  channel?: 'online' | 'onsite';
  location?: string;
  note?: string;
  schedule_date?: string;
  schedule_time_from?: string;
  schedule_time_to?: string;
  reschedule_old_date?: string;
  reschedule_new_date?: string;
  reschedule_time_from?: string;
  reschedule_time_to?: string;
  
  // System message fields
  system_title?: string;
  system_company?: string;
  system_message?: string;
  action_link?: string;
  
  // Tracking
  timestamp: number;
  unread: string[];  // Array of user IDs who haven't read
  
  // Audit
  created_by: string;
  updated_by: string;
  created_at: number;
  updated_at: number;
}
```

### 7.2 Notification Item (UI Display)

```typescript
interface NotificationItem {
  uid: string;
  type: MessageType;
  title: string;           // From system_title
  description: string;     // From system_message
  timestamp: number;
  isRead: boolean;         // !unread.includes(currentUserId)
  
  // Navigation
  actionLink: string | null;  // From action_link field
  roomId: string;             // From room_id
  
  // Context
  companyName?: string;
  companyId?: string;
  jobTitle?: string;
}
```

### 7.3 Grouped Chat Room (for Messages filter)

```typescript
interface GroupedChatRoom {
  roomId: string;
  otherPartyName: string;      // Company name (for candidate) or Candidate name (for company)
  otherPartyAvatar: string;
  unreadCount: number;
  lastMessageText: string;
  lastMessageTimestamp: number;
}
```

### 7.4 Filter State

```typescript
interface NotificationFilterState {
  activeFilter: NotificationFilter;
  counts: Record<NotificationFilter, number>;
}
```

---

## 8. Query Patterns

### 8.1 Notification Messages Query (Individual Items)

```typescript
// For Applications, Appointments, System filters
async function getNotificationMessages(
  userId: string,
  role: 'candidate' | 'company',
  companyId: string | null,
  filter: NotificationFilter
): Promise<Message[]> {
  const types = FILTER_MESSAGE_TYPES[filter];
  
  const constraints = [
    where('type', 'in', types),
    where('unread', 'array-contains', userId),
    role === 'company'
      ? where('company_id', '==', companyId)
      : where('candidate_id', '==', userId),
    orderBy('timestamp', 'desc'),
    limit(50),
  ];
  
  return query(collection(db, 'web_messages'), ...constraints);
}
```

### 8.2 Grouped Chat Rooms Query (Messages Filter)

```typescript
// For Messages filter - group by room
async function getUnreadChatRooms(
  userId: string,
  role: 'candidate' | 'company',
  companyId: string | null
): Promise<GroupedChatRoom[]> {
  // Step 1: Get all unread chat-type messages
  const chatTypes = FILTER_MESSAGE_TYPES['messages'];
  
  const messages = await query(
    collection(db, 'web_messages'),
    where('type', 'in', chatTypes),
    where('unread', 'array-contains', userId),
    role === 'company'
      ? where('company_id', '==', companyId)
      : where('candidate_id', '==', userId),
  );
  
  // Step 2: Group by room_id
  const roomGroups = groupBy(messages, 'room_id');
  
  // Step 3: For each room, get metadata and aggregate
  return Object.entries(roomGroups).map(([roomId, msgs]) => ({
    roomId,
    unreadCount: msgs.length,
    lastMessageText: msgs[0].text,
    lastMessageTimestamp: msgs[0].timestamp,
    // Fetch room metadata for other party name/avatar
  }));
}
```

### 8.3 Bell Badge Count Query

```typescript
async function getNotificationBadgeCount(
  userId: string,
  role: 'candidate' | 'company',
  companyId: string | null
): Promise<number> {
  const constraints = [
    where('type', 'in', NOTIFICATION_MESSAGE_TYPES),
    where('unread', 'array-contains', userId),
    role === 'company'
      ? where('company_id', '==', companyId)
      : where('candidate_id', '==', userId),
  ];
  
  const snapshot = await getCountFromServer(
    query(collection(db, 'web_messages'), ...constraints)
  );
  
  return snapshot.data().count;
}
```

### 8.4 Mark as Read

```typescript
// Same mechanism as chat - remove user from unread array
async function markNotificationAsRead(
  messageId: string,
  userId: string
): Promise<void> {
  await updateDoc(doc(db, 'web_messages', messageId), {
    unread: arrayRemove(userId),
    updated_at: Date.now(),
  });
}

// Mark multiple (for "Mark All Read")
async function markAllNotificationsAsRead(
  messageIds: string[],
  userId: string
): Promise<void> {
  const batch = writeBatch(db);
  
  messageIds.forEach(id => {
    batch.update(doc(db, 'web_messages', id), {
      unread: arrayRemove(userId),
      updated_at: Date.now(),
    });
  });
  
  await batch.commit();
}
```

---

## 9. Error Handling Standards

### 9.1 Error Scenarios

| Scenario | User Impact | Handling |
|----------|-------------|----------|
| Fetch failed | No notifications shown | Show error state with retry |
| Mark read failed | Badge incorrect | Rollback optimistic update, toast error |
| Deep link target deleted | Navigation fails | Toast "เนื้อหาไม่พร้อมใช้งาน", stay on page |
| Network offline | Stale data | Show cached, block mutations |

### 9.2 Toast Messages

```typescript
// Error toasts
toast.error('ไม่สามารถโหลดการแจ้งเตือนได้');           // Fetch failed
toast.error('ไม่สามารถทำเครื่องหมายอ่านแล้ว');        // Mark read failed
toast.error('เนื้อหาไม่พร้อมใช้งาน');                  // Deep link invalid

// Info toasts  
toast.info('ทำเครื่องหมายอ่านทั้งหมดแล้ว');           // Mark all success
```

---

## 10. Thai Copy Reference

### 10.1 Page & Section Headers

| Key | Thai |
|-----|------|
| Page title | การแจ้งเตือน |
| Mark all read | อ่านทั้งหมด |
| View all | ดูทั้งหมด |

### 10.2 Filter Tab Labels

| Filter | Thai |
|--------|------|
| All | ทั้งหมด |
| Applications | ใบสมัคร |
| Messages | ข้อความ |
| Appointments | การนัดหมาย |
| System | ระบบ |

### 10.3 Notification Type Titles

| Type | Thai Title Template |
|------|---------------------|
| `application-received` | มีใบสมัครใหม่สำหรับ {jobTitle} |
| `application-accepted` | ใบสมัครของคุณได้รับการตอบรับ |
| `application-rejected` | ใบสมัครของคุณไม่ผ่านการพิจารณา |
| `interview` | นัดสัมภาษณ์ใหม่ |
| `interview-reschedule` | เลื่อนนัดสัมภาษณ์ |
| `interview-confirmed` | ผู้สมัครยืนยันนัดสัมภาษณ์ |
| `interview-declined` | ผู้สมัครปฏิเสธนัดสัมภาษณ์ |
| `interview-cancelled` | ยกเลิกนัดสัมภาษณ์ |
| `offer` | ข้อเสนองาน |
| `platform` | (from system_title) |
| `system` | (from system_title) |

### 10.4 Empty States

| State | Thai |
|-------|------|
| No notifications | ยังไม่มีการแจ้งเตือน |
| No in category | ไม่มีการแจ้งเตือนประเภทนี้ |
| No unread messages | ไม่มีข้อความใหม่ |

### 10.5 Timestamp Formatting

| Relative Time | Thai |
|---------------|------|
| Just now (< 1 min) | เมื่อสักครู่ |
| X minutes ago | X นาทีที่แล้ว |
| X hours ago | X ชั่วโมงที่แล้ว |
| Yesterday | เมื่อวาน |
| X days ago | X วันที่แล้ว |

### 10.6 Messages Filter Display

| Element | Thai |
|---------|------|
| Unread count suffix | ข้อความ |
| Example | 3 ข้อความ |

---

## Appendix A: Message Type Enum

```typescript
// src/types/messages.ts

// Notification types (count toward Bell badge)
enum NotificationMessageType {
  APPLICATION_RECEIVED = 'application-received',
  APPLICATION_ACCEPTED = 'application-accepted',
  APPLICATION_REJECTED = 'application-rejected',
  INTERVIEW = 'interview',
  INTERVIEW_RESCHEDULE = 'interview-reschedule',
  INTERVIEW_CONFIRMED = 'interview-confirmed',
  INTERVIEW_DECLINED = 'interview-declined',
  INTERVIEW_CANCELLED = 'interview-cancelled',
  OFFER = 'offer',
  PLATFORM = 'platform',
  SYSTEM = 'system',
}

// Chat types (count toward FAB badge)
enum ChatMessageType {
  TEXT = 'text',
  FILE = 'file',
  IMAGE = 'image',
  EMOJI = 'emoji',
  REPLY = 'reply',
}
```

---

## Appendix B: Server Action Signatures

### B.1 Read Operations

```typescript
// Get notification badge count (Bell)
async function getNotificationBadgeCount(
  userId: string,
  role: 'candidate' | 'company',
  companyId: string | null
): Promise<number>;

// Get notification messages for a filter
async function getNotificationMessages(
  userId: string,
  role: 'candidate' | 'company', 
  companyId: string | null,
  filter: NotificationFilter,
  cursor?: string,
  limit?: number
): Promise<{ messages: Message[]; nextCursor?: string }>;

// Get grouped chat rooms (for Messages filter)
async function getUnreadChatRooms(
  userId: string,
  role: 'candidate' | 'company',
  companyId: string | null
): Promise<GroupedChatRoom[]>;
```

### B.2 Write Operations

```typescript
// Mark single message as read
async function markMessageAsRead(
  messageId: string,
  userId: string
): Promise<void>;

// Mark all displayed messages as read
async function markAllAsRead(
  userId: string,
  role: 'candidate' | 'company',
  companyId: string | null,
  filter: NotificationFilter
): Promise<{ count: number }>;
```

---

## Appendix C: Route Cross-Reference

### C.1 Message Creation Triggers

| Source Route | Event | Message Type | Recipient |
|--------------|-------|--------------|-----------|
| JOB-R02b | Apply submitted | `application-received` | Company |
| COMP-R08 | Application accepted | `application-accepted` | Candidate |
| COMP-R08 | Application rejected | `application-rejected` | Candidate |
| CHAT-R02 | Interview scheduled | `interview` | Candidate |
| CHAT-R02 | Interview rescheduled | `interview-reschedule` | Candidate |
| CHAT-R02 | Interview confirmed | `interview-confirmed` | Company |
| CHAT-R02 | Interview declined | `interview-declined` | Company |
| CHAT-R02 | Interview cancelled | `interview-cancelled` | Candidate |
| CHAT-R02 | Offer sent | `offer` | Candidate |
| Admin/CRON | Platform announcement | `platform` | Users |

### C.2 Navigation from Notifications

| Click Action | Destination |
|--------------|-------------|
| Notification item with `action_link` | `action_link` URL |
| Notification item without `action_link` | `/chat/[roomId]` |
| Grouped chat room (Messages filter) | `/chat/[roomId]` |

---

*End of NOTIF-R00 Cross-Cutting Specification v2.0*
