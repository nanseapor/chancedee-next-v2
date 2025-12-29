# BLS-06: Communication Stage

**Stage:** Communication  
**Version:** 1.1  
**Last Updated:** 2025-12-11  
**Actions Count:** 7

> **Revision 1.1:** Corrected API references to server actions for architectural consistency.

---

## Stage Overview

The Communication Stage handles the real-time chat infrastructure between candidates and companies. This stage provides the messaging foundation that BLS-05 (Interview) builds upon for scheduling interactions.

> **Architecture Note:** Notifications and Chat share the same `messages` collection but use different message types. Chat types (`text`, `file`, `image`, `emoji`, `reply`) show in FAB badge and are covered here. Notification types (`application-*`, `interview-*`, `offer`, `platform`, `system`) show in Bell badge and are covered in BLS-10.

### Stage Boundaries

| Aspect | Scope |
|--------|-------|
| **Enters from** | BLS-04 Screening (acceptApplication creates chat room) |
| **Used by** | BLS-05 Interview (scheduling happens within chat context) |
| **Primary Actors** | Candidate, Company HR |
| **Data Source** | `chats` and `messages` collections (Firestore real-time) |

### Actions in This Stage

| Action ID | Action Name | Actor | Trigger | Primary Collection |
|-----------|-------------|-------|---------|-------------------|
| BLS-06-01 | listChatRooms | Both | Navigate to `/chat` | `chats` |
| BLS-06-02 | openChatRoom | Both | Select room | `chats`, `messages` |
| BLS-06-03 | sendTextMessage | Both | Send button | `messages` |
| BLS-06-04 | sendAttachment | Both | Attach file/image | `messages` |
| BLS-06-05 | markMessagesAsRead | Both | View messages | `messages` |
| BLS-06-06 | loadMessageHistory | Both | Scroll up | `messages` |
| BLS-06-07 | searchChatRooms | Both | Search input | Client-side |

### Room Creation Policy

**Chat rooms are created automatically by BLS-04 acceptApplication.** This stage does not create rooms directly.

| Rule | Description |
|------|-------------|
| **One room per pair** | One room per candidate×company pair regardless of job count |
| **Company initiates** | Only companies can initiate chat (via accept) |
| **Room ID** | `MD5('{companyId}::{candidateId}')` - deterministic |
| **Persists** | Room persists even if application later rejected |

---

## BLS-06-01: listChatRooms

### Description
Display paginated list of chat rooms for the logged-in user. Shows other party's name, last message preview, unread count, and appointment indicator.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| CHAT-R01_chat-list_RIS.md | Full | Chat list page spec |
| features_chat.md | CHAT-001, CHAT-011 | View rooms, metadata |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | User authenticated | `sessionStateAtom === 'valid'` | Redirect to login |
| 2 | Has candidate or company role | `navBarAtom` check | Redirect to home |
| 3 | Not deleted | User status | Redirect to `/auth/deleted` |
| 4 | Not pending (company) | Company status | Redirect to `/auth/pending` |

### Inputs
| Field | Type | Required | Validation | Default | Source |
|-------|------|----------|------------|---------|--------|
| navBar | 'candidate' \| 'company' | Yes | Valid role | - | `navBarAtom` |

### State Changes

**SWR Cache:**
| Key Pattern | Data Shape | Config |
|-------------|------------|--------|
| `chat-rooms-metadata-${navBar}` | `RoomsMetadataResponse` | `dedupingInterval: 30000, refreshInterval: 60000` |

**Jotai Atoms:**
| Atom | Before | After |
|------|--------|-------|
| `chatRoomsAtom` | Previous data | Updated room list |
| `chatUserAtom` | null | Current user context |

### Server Action
```typescript
// Server Action: fetchChatRoomsMetadata
async function fetchChatRoomsMetadata(navBar: 'candidate' | 'company'): Promise<RoomsMetadataResponse>;

interface RoomsMetadataResponse {
  currentUser: {
    uid: string;
    displayName: string;
    profilePhoto: string | null;
  };
  chatRooms: RoomListItem[];
  viewRoom: null;
}

interface RoomListItem {
  uid: string;                     // Room ID (MD5 hash)
  otherPartyId: string;            // Candidate or company ID
  otherPartyName: string;          // Display name
  otherPartyPhoto: string | null;  // Avatar URL
  positionContext: string | null;  // Job title (if available)
  lastMessageText: string | null;  // Preview (truncated 50 chars)
  lastMessageTime: number;         // Timestamp
  lastMessageSender: 'candidate' | 'hr';
  unreadCount: number;             // Chat-type messages only
  hasPendingAppointment: boolean;  // Has scheduled interview
}
```

### UI Feedback
| Scenario | Feedback Type | Display |
|----------|---------------|---------|
| Loading | Skeleton list | 5 placeholder cards |
| Empty (candidate) | Empty state | "ยังไม่มีข้อความ" + explanation |
| Empty (company) | Empty state | "ยังไม่มีข้อความ" + CTA |
| Error | Toast + retry | "ไม่สามารถโหลดรายการแชทได้" |
| Offline | Cached data | Show stale with indicator |

### Error Handling
| Error Type | Detection | Recovery |
|------------|-----------|----------|
| Server action error | Thrown exception | Show retry button |
| Auth expired | Auth state change | Redirect to login |
| Network offline | Fetch exception | Show cached data |

---

## BLS-06-02: openChatRoom

### Description
Open a specific chat room and subscribe to real-time message updates. Marks messages as read automatically.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| CHAT-R02_chat-room_RIS.md | Section 1-5 | Room open, real-time |
| features_chat.md | CHAT-002 | Open Chat Room feature |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | User authenticated | `sessionStateAtom === 'valid'` | Redirect to login |
| 2 | Room exists | Room document exists | Redirect to `/chat` with error |
| 3 | User is participant | User is `candidateId` or `companyId` | Access denied |

### Inputs
| Field | Type | Required | Validation | Default | Source |
|-------|------|----------|------------|---------|--------|
| roomId | string | Yes | Valid room UID | - | URL param or click |

### State Changes

**Jotai Atoms:**
| Atom | Before | After |
|------|--------|-------|
| `roomIdAtom` | null or previous | Selected room ID |
| `viewRoomAtom` | null | Room details |
| `chatMessagesAtom` | [] | Messages array |

**Real-time Subscription:**
| Collection | Query | Listener |
|------------|-------|----------|
| `messages` | `where('roomId', '==', roomId)`, `orderBy('timestamp', 'desc')`, `limit(50)` | `onSnapshot` |

### Firestore Operations
| Operation | Collection | Document ID | Fields | Condition |
|-----------|------------|-------------|--------|-----------|
| Read | `chats` | roomId | Room metadata | On open |
| Subscribe | `messages` | - | Last 50 messages | Real-time |

### UI Feedback
| Scenario | Feedback Type | Display |
|----------|---------------|---------|
| Loading | Skeleton | Message bubbles placeholder |
| Room not found | Toast + redirect | "ห้องแชทไม่พบ" |
| Connection lost | Banner | "ขาดการเชื่อมต่อ" |
| Reconnected | Banner (dismiss) | "กลับมาออนไลน์แล้ว" |

### Side Effects
| Effect | Target | Timing |
|--------|--------|--------|
| Subscribe to messages | Firestore listener | On mount |
| Mark messages as read | `messages.unread` | After load (BLS-06-05) |
| Update URL | `?room={roomId}` | Immediate |
| Unsubscribe | Listener cleanup | On unmount |

---

## BLS-06-03: sendTextMessage

### Description
Send a text message in the current chat room. Optimistic UI with retry on failure.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| CHAT-R02_chat-room_RIS.md | Section 6.2, 7.2 | Send state machine |
| features_chat.md | CHAT-003, CHAT-014 | Send message, update last |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | User authenticated | `sessionStateAtom === 'valid'` | Redirect to login |
| 2 | Room open | `roomIdAtom !== null` | Show error |
| 3 | Message not empty | `message.trim().length > 0` | Disable send button |
| 4 | Not rate limited | Throttle check | Show "กรุณารอสักครู่" |

### Inputs
| Field | Type | Required | Validation | Default | Source |
|-------|------|----------|------------|---------|--------|
| message | string | Yes | Non-empty, max 2000 chars | - | Text input |
| roomId | string | Yes | Current room | - | `roomIdAtom` |

### Message Shape
```typescript
interface SendMessagePayload {
  roomId: string;
  currentUser: {
    uid: string;
    name: string;
    avatar: string;
  };
  message: {
    message: string;
    type: 'text';
    timestamp: number;
  };
}
```

### State Changes

**Optimistic Update:**
| State | Before | After (Optimistic) | After (Confirmed) |
|-------|--------|-------------------|-------------------|
| `chatMessagesAtom` | Messages[] | + pending message | Replace with server response |
| Message input | Text | Cleared | - |
| Send button | Enabled | Disabled (sending) | Enabled |

**Local Component State:**
| State | Before | After |
|-------|--------|-------|
| `messageText` | User input | '' (cleared) |
| `isSending` | false | true → false |

### Firestore Operations
| Operation | Collection | Document ID | Fields | Condition |
|-----------|------------|-------------|--------|-----------|
| Create | `messages` | Auto-generated | Message fields + `unread: [otherPartyId]` | Always |
| Update | `chats` | roomId | `lastMessageText`, `lastMessageTime`, `lastMessageSender` | After send |

### Server Action
```typescript
// Action: sendMessageFirestore
// Location: actions/chat-management.ts

async function sendMessageFirestore(params: SendMessagePayload): Promise<{
  status: 200;
  message: 'success';
  payload: ChatMessage;
}>;
```

### UI Feedback
| Scenario | Feedback Type | Display |
|----------|---------------|---------|
| Sending | Message bubble | "Sending..." indicator |
| Success | Message bubble | Double-check (✓✓) |
| Failed | Message bubble + retry | ⚠️ + "ลองใหม่" button |
| Rate limited | Toast | "กรุณารอสักครู่" |

### Error Handling
| Error Type | Detection | Recovery |
|------------|-----------|----------|
| Network error | Catch | Show retry button on message |
| Server error | Response status | Keep message, allow retry |
| Room not found | 404 | Redirect to chat list |

---

## BLS-06-04: sendAttachment

### Description
Send file or image attachment in chat. Uploads to storage, then creates message with file URL.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| CHAT-R02_chat-room_RIS.md | Section 7.5 | File attachment spec |
| features_chat.md | CHAT-003 | Send message (file type) |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | User authenticated | `sessionStateAtom === 'valid'` | Redirect to login |
| 2 | Room open | `roomIdAtom !== null` | Show error |
| 3 | Valid file type | Extension in allowed list | "ไม่รองรับไฟล์ประเภทนี้" |
| 4 | File size OK | Size ≤ 10MB | "ไฟล์ใหญ่เกิน 10MB" |

### Inputs
| Field | Type | Required | Validation | Default | Source |
|-------|------|----------|------------|---------|--------|
| file | File | Yes | See validation | - | File picker |
| roomId | string | Yes | Current room | - | `roomIdAtom` |

### File Validation
| Validation | Limit | Error Message |
|------------|-------|---------------|
| Max size | 10MB | ไฟล์ใหญ่เกิน 10MB |
| Allowed types | jpg, png, gif, pdf, doc, docx | ไม่รองรับไฟล์ประเภทนี้ |

### Message Type by File
| File Extension | Message Type | Render |
|----------------|--------------|--------|
| jpg, png, gif, webp | `image` | Thumbnail, lightbox on click |
| pdf | `file` | File card, download |
| doc, docx | `file` | File card, download |
| Other | `file` | File card, download |

### State Changes

**Local Component State:**
| State | Before | After |
|-------|--------|-------|
| `isUploading` | false | true → false |
| `uploadProgress` | 0 | 0-100 → 0 |
| `attachments` | [] | [] (cleared after send) |

### Operations
| Step | Operation | Target | Description |
|------|-----------|--------|-------------|
| 1 | Upload | Firebase Storage | Upload file, get URL |
| 2 | Create | `messages` | Create message with fileUrl |
| 3 | Update | `chats` | Update lastMessage |

### UI Feedback
| Scenario | Feedback Type | Display |
|----------|---------------|---------|
| Uploading | Progress bar | Percentage or indeterminate |
| Success | Message bubble | Image thumbnail or file card |
| Failed | Toast | "อัปโหลดไฟล์ไม่สำเร็จ" |
| Invalid file | Toast | Error message |

---

## BLS-06-05: markMessagesAsRead

### Description
Mark messages as read by removing current user from `unread` array. Triggered automatically when viewing messages and manually when opening room.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| CHAT-R00_cross-cutting_RIS.md | Section 5 | Unread tracking pattern |
| features_chat.md | CHAT-004, CHAT-013 | Mark as read, unread tracking |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | User authenticated | `sessionStateAtom === 'valid'` | Skip |
| 2 | Has unread messages | Messages with user in `unread` | No-op |

### Inputs
| Field | Type | Required | Validation | Default | Source |
|-------|------|----------|------------|---------|--------|
| messageIds | string[] | Yes | Valid message UIDs | - | Visible messages |
| userId | string | Yes | Current user | - | Auth context |

### Unread Array Pattern
```typescript
// Message document
{
  uid: 'msg123',
  unread: ['candidateId', 'companyId'],  // Users who haven't read
  // ... other fields
}

// Mark as read = remove user from array
await updateDoc(doc(db, 'messages', messageId), {
  unread: arrayRemove(userId),
  updatedAt: Date.now(),
});
```

### State Changes

**Firestore:**
| Operation | Collection | Document ID | Fields | Condition |
|-----------|------------|-------------|--------|-----------|
| Update | `messages` | Each messageId | `unread: arrayRemove(userId)` | User in unread |

**Derived State:**
| State | Before | After |
|-------|--------|-------|
| Room unread count | N | 0 (for this room) |
| FAB badge | Total unread | Decremented |

### Server Action
```typescript
// Action: webMessagesBatchUpdate
// Location: actions/messages.ts

async function webMessagesBatchUpdate(
  updates: Array<{ uid: string; unread: string[] }>
): Promise<void>;
```

### Trigger Points
| Trigger | Timing | Scope |
|---------|--------|-------|
| Room opened | On load complete | All visible messages |
| Scroll into view | Intersection observer | Newly visible messages |
| Real-time new | After 1s visible | New incoming messages |

### UI Feedback
| Scenario | Feedback Type | Display |
|----------|---------------|---------|
| Success | Silent | Badge decrements |
| Error | Silent retry | Auto-retry once |

---

## BLS-06-06: loadMessageHistory

### Description
Load older messages when user scrolls to top of message thread. Pagination via timestamp cursor.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| features_chat.md | CHAT-009 | Load Message History |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | Room open | `roomIdAtom !== null` | No-op |
| 2 | Has more messages | `hasMoreMessages === true` | Hide load more |
| 3 | Not already loading | `isLoadingMore === false` | Debounce |

### Inputs
| Field | Type | Required | Validation | Default | Source |
|-------|------|----------|------------|---------|--------|
| roomId | string | Yes | Current room | - | `roomIdAtom` |
| beforeTimestamp | number | Yes | Oldest message timestamp | - | First message in list |
| limit | number | No | 1-50 | 30 | Constant |

### State Changes

**Local Component State:**
| State | Before | After |
|-------|--------|-------|
| `isLoadingMore` | false | true → false |
| `hasMoreMessages` | true | true or false |

**Jotai Atoms:**
| Atom | Before | After |
|------|--------|-------|
| `chatMessagesAtom` | Messages[] | Prepend older messages |

### Firestore Query
```typescript
const olderMessagesQuery = query(
  collection(db, 'messages'),
  where('roomId', '==', roomId),
  where('timestamp', '<', beforeTimestamp),
  orderBy('timestamp', 'desc'),
  limit(30)
);
```

### UI Feedback
| Scenario | Feedback Type | Display |
|----------|---------------|---------|
| Loading | Spinner | At top of thread |
| No more messages | Text | "ไม่มีข้อความเพิ่มเติม" (or hide) |
| Error | Toast | "โหลดข้อความไม่สำเร็จ" |

### Trigger
| Trigger | Method |
|---------|--------|
| Scroll to top | Intersection observer on sentinel |
| Pull down (mobile) | Pull-to-refresh gesture |

---

## BLS-06-07: searchChatRooms

### Description
Filter chat rooms by participant name. Client-side search on loaded room list.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| CHAT-R01_chat-list_RIS.md | Section 5.2, 7.3 | Search implementation |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | Rooms loaded | `chatRooms.length > 0` | No results |

### Inputs
| Field | Type | Required | Validation | Default | Source |
|-------|------|----------|------------|---------|--------|
| query | string | No | - | '' | Search input |

### State Changes

**Local Component State:**
| State | Before | After |
|-------|--------|-------|
| `searchQuery` | '' | User input |
| `filteredRooms` | All rooms | Filtered subset |

### Search Logic
```typescript
function filterRooms(rooms: RoomListItem[], query: string): RoomListItem[] {
  if (!query.trim()) return rooms;
  
  const normalizedQuery = query.toLowerCase().trim();
  
  return rooms.filter(room => 
    room.otherPartyName.toLowerCase().includes(normalizedQuery) ||
    room.positionContext?.toLowerCase().includes(normalizedQuery)
  );
}
```

### UI Feedback
| Scenario | Feedback Type | Display |
|----------|---------------|---------|
| Searching | Instant filter | Updated list |
| No results | Empty state | "ไม่พบการสนทนาที่ตรงกับ "{query}"" |
| Clear search | Button | Reset to all rooms |

---

## Chat FAB Badge

The Chat FAB shows unread count for **chat-type messages only**.

### Badge Count Query
```typescript
// Count messages where:
// - type in ['text', 'file', 'image', 'emoji', 'reply']
// - unread array-contains userId
// - (candidate) candidate_id === userId
// - (company) company_id === companyId

const CHAT_MESSAGE_TYPES = ['text', 'file', 'image', 'emoji', 'reply'];
```

### FAB State Machine
| Current State | Event | Next State | Side Effects |
|---------------|-------|------------|--------------|
| `hidden` | USER_AUTHENTICATED | `visible` | Show FAB |
| `visible` | CLICK | `visible` | Navigate to `/chat` |
| `visible` | NEW_MESSAGE | `visible` | Increment badge |
| `visible` | MESSAGES_READ | `visible` | Decrement badge |
| `visible` | USER_LOGOUT | `hidden` | Hide FAB |

---

## Message Types Owned by This Stage

| Type | Description | Badge |
|------|-------------|-------|
| `text` | Plain text message | FAB (Chat) |
| `file` | File attachment | FAB (Chat) |
| `image` | Image attachment | FAB (Chat) |
| `emoji` | Emoji-only message | FAB (Chat) |
| `reply` | Reply to message | FAB (Chat) |

**Not owned by this stage (see BLS-10 Notifications):**
- `application-*` types
- `interview-*` types
- `offer`, `platform`, `system`

---

## Stage Integration Points

### Entry Points (from other stages)
| Source Stage | Source Action | Entry Action | Trigger |
|--------------|---------------|--------------|---------|
| BLS-04 Screening | acceptApplication | openChatRoom | Auto-open drawer |
| BLS-03 Application | viewApplication | openChatRoom | "Chat" button |
| BLS-10 Notifications | clickNotification | openChatRoom | Navigate to room |

### Exit Points (to other stages)
| Exit Action | Target Stage | Target Action | Trigger |
|-------------|--------------|---------------|---------|
| openChatRoom | BLS-05 Interview | scheduleInterview | Schedule button in chat |
| sendMessage (interview type) | BLS-05 | viewInterviewDetails | Interview card created |

### Cross-Stage Dependencies
| This Stage Action | Affects Stage | Cache Key | Effect |
|-------------------|---------------|-----------|--------|
| sendMessage | BLS-10 | `notifications-badge-${userId}` | Increment if notification type |
| markMessagesAsRead | BLS-10 | `notifications-badge-${userId}` | Decrement |

---

## Shared Unread Tracking Pattern

Both BLS-06 (Chat) and BLS-10 (Notifications) use the same mechanism:

```typescript
// Message has unread array
{
  uid: 'msg123',
  type: 'text',  // or 'interview', etc.
  unread: ['user1', 'user2'],  // Users who haven't read
}

// Mark as read = remove user from array
async function markAsRead(messageId: string, userId: string): Promise<void> {
  await updateDoc(doc(db, 'messages', messageId), {
    unread: arrayRemove(userId),
    updatedAt: Date.now(),
  });
}

// Badge count = query where unread contains user
// Filtered by message type for FAB vs Bell
```

---

## Permissions Matrix

| Action | Candidate | Company |
|--------|-----------|---------|
| listChatRooms | ✓ | ✓ |
| openChatRoom | ✓ (if participant) | ✓ (if participant) |
| sendTextMessage | ✓ | ✓ |
| sendAttachment | ✓ | ✓ |
| markMessagesAsRead | ✓ | ✓ |
| loadMessageHistory | ✓ | ✓ |
| searchChatRooms | ✓ | ✓ |

---

## Related Documents

| Document | Relationship |
|----------|--------------|
| CHAT-R00_cross-cutting_RIS.md | Shared patterns, FAB spec, unread tracking |
| CHAT-R01_chat-list_RIS.md | Room list page specification |
| CHAT-R02_chat-room_RIS.md | Chat room page specification |
| features_chat.md | Feature definitions CHAT-001 to CHAT-014 |
| data-entities_chats.md | Chat room schema |
| data-entities_messages.md | Message schema |
| BLS-04_screening.md | Creates chat room on accept |
| BLS-05_interview.md | Interview scheduling within chat |
| BLS-10_notifications.md | Notification-type messages, Bell badge |

---

*End of BLS-06 Communication Stage*
