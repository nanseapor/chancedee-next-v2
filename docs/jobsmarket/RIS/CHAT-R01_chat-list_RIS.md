# CHAT-R01: Chat Room List Route Implementation Spec

**Version:** 1.0  
**Last Updated:** 2025-12-10  
**Route:** `/chat`  
**Primary Domain:** Chat

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-10 | Initial RIS creation for Wave 5 |

---

## Cross-References

This document references shared specifications from:

| Document | Section | Topic |
|----------|---------|-------|
| **CHAT-R00** | Section 4 | Real-time connection management |
| **CHAT-R00** | Section 5 | Unread tracking pattern |
| **CHAT-R00** | Section 8 | SWR key conventions |
| **CHAT-R00** | Section 10 | Thai copy reference |
| **COMP-R08** | Section 6.2 | Accept triggers chat creation |
| **CAND-R04** | Section 7 | Chat entry from applications |

---

## 1. Route Metadata

| Property | Value |
|----------|-------|
| Route ID | CHAT-R01 |
| Route Path | `/chat` |
| Shell | Candidate Shell or Company Shell (role-based) |
| Purpose | Display list of chat rooms, select room to open |
| Complexity | Medium (two-panel layout, real-time updates) |
| Phase | 5 (Chat & Interview) |
| UI Spec | `06-communication-routes.md` Section 7.1 |

### Route Parameters

None (list view, no dynamic segments).

### Query Parameters

| Parameter | Type | Purpose | Default |
|-----------|------|---------|---------|
| `room` | `string` | Pre-select a room on load | None |
| `search` | `string` | Filter rooms by name | None |

### Access Control

| Condition | Check | Failure Behavior |
|-----------|-------|------------------|
| User authenticated | `sessionStateAtom === 'valid'` | Redirect to `/auth/login` |
| Has candidate or company role | `navBarAtom` check | Redirect to home |
| Not deleted | User status check | Redirect to `/auth/deleted` |
| Not pending | Company status check | Redirect to `/auth/pending` |

---

## 2. Domain Classification

### Primary Domain: Chat (▰)

- **Owns:** Room list, room selection, search/filter
- **Reads:** `web_chat_rooms` collection (metadata only)
- **Data Source:** `/api/chat/rooms-metadata` endpoint

### Secondary Domains (◧)

| Domain | Role | Access | Condition |
|--------|------|--------|-----------|
| Candidate | Profile photos | Read | For company view |
| Company | Profile photos | Read | For candidate view |

### Global Domains (★) - Via Shell

| Domain | Requirement |
|--------|-------------|
| Auth | Session validation, role determination |
| Notifications | Bell icon in shell |

---

## 3. Feature Mapping

### Existing Features (Preserve - P0)

| Feature ID | Feature Name | Coverage | Notes |
|------------|--------------|----------|-------|
| CHAT-001 | View Chat Rooms List | Full | Primary feature of this route |
| CHAT-011 | View Chat Rooms Metadata | Full | API endpoint for lightweight list |
| CHAT-013 | Retrieve Unread Messages | Full | Badge display per room |

**Source:** `features_chat.md` lines 123-174, 658-704, 759-802

### Feature Implementation Details

#### CHAT-001: View Chat Rooms List

| Aspect | Implementation |
|--------|----------------|
| Entry Point | Page load |
| Server Action | `GetRoomsMetadata` via API |
| Data | Room metadata (no messages) |
| Caching | SWR with 30s dedupe, 60s refresh |
| Real-time | Polling-based (metadata only) |

#### CHAT-011: View Chat Rooms Metadata

| Aspect | Implementation |
|--------|----------------|
| API Route | `GET /api/chat/rooms-metadata?navBar={role}` |
| Returns | `{ currentUser, chatRooms, viewRoom }` |
| Filters | By `candidateId` (candidate) or `companyId` (company) |
| Excludes | Corrupted rooms (`candidateId === companyId`) |

#### CHAT-013: Retrieve Unread Messages

| Aspect | Implementation |
|--------|----------------|
| Display | Badge on each room card |
| Source | `unreadCount` field from metadata |
| Update | Refresh on focus, 60s interval |
| Global | Sum shown on Chat FAB |

### New Features (Enhancements)

| Feature | Description | Priority |
|---------|-------------|----------|
| Search by name | Filter rooms by participant name | P0 |
| Appointment indicator | Show 📅 for pending interviews | P0 |
| Two-panel desktop | List + active chat side-by-side | P0 |
| Mobile stack | Full-screen list, tap to open chat | P0 |

---

## 4. Data Contract

### 4.1 Read Operations

| Data | Endpoint | Method | SWR Key |
|------|----------|--------|---------|
| Room list | `/api/chat/rooms-metadata` | GET | `chat-rooms-metadata-${navBar}` |

### 4.2 Room List Response Shape

```typescript
interface RoomsMetadataResponse {
  currentUser: {
    uid: string;
    displayName: string;
    profilePhoto: string | null;
  };
  chatRooms: RoomListItem[];
  viewRoom: null;  // Not used on list page
}

interface RoomListItem {
  uid: string;                     // Room ID (MD5 hash)
  otherPartyId: string;            // Candidate or company ID
  otherPartyName: string;          // Display name
  otherPartyPhoto: string | null;  // Avatar URL
  positionContext: string | null;  // Job title (if available)
  lastMessageText: string | null;  // Preview text (truncated)
  lastMessageTime: number;         // Timestamp
  lastMessageSender: 'candidate' | 'hr';
  unreadCount: number;             // Messages with user in unread[]
  hasPendingAppointment: boolean;  // Has scheduled interview
}
```

### 4.3 API Request

```typescript
// GET /api/chat/rooms-metadata?navBar=candidate
// GET /api/chat/rooms-metadata?navBar=company

// Headers
Authorization: Bearer {firebaseToken}
```

### 4.4 Data Transformations

```typescript
// Server-side transformation (GetRoomsMetadata)
function transformRoom(room: ChatRoom, navBar: string): RoomListItem {
  const isCandidate = navBar === 'candidate';
  
  return {
    uid: room.uid,
    otherPartyId: isCandidate ? room.companyId : room.candidateId,
    otherPartyName: isCandidate ? room.companyName : room.candidateName,
    otherPartyPhoto: /* fetch from respective collection */,
    positionContext: room.jobTitle || null,
    lastMessageText: room.lastMessageText?.slice(0, 50) || null,
    lastMessageTime: room.lastMessageTime,
    lastMessageSender: room.lastMessageSender,
    unreadCount: /* calculated from messages.unread */,
    hasPendingAppointment: /* check interviews collection */,
  };
}
```

---

## 5. State Contract

### 5.1 Jotai Atoms Used

| Atom | Read | Write | Purpose |
|------|------|-------|---------|
| `navBarAtom` | ✓ | - | Determine candidate/company view |
| `chatUserAtom` | ✓ | ✓ | Current user context |
| `chatRoomsAtom` | ✓ | ✓ | Cached room list |
| `roomIdAtom` | ✓ | ✓ | Selected room ID |
| `viewRoomAtom` | ✓ | ✓ | Selected room details |

### 5.2 Local State

```typescript
// Page-level state
const [searchQuery, setSearchQuery] = useState('');
const [filteredRooms, setFilteredRooms] = useState<RoomListItem[]>([]);

// Derived state
const hasRooms = chatRooms.length > 0;
const hasResults = filteredRooms.length > 0;
```

### 5.3 SWR Hooks

```typescript
// Room list fetcher
const { data, error, isLoading, mutate } = useSWR(
  sessionState === 'valid' ? chatSWRKeys.roomsMetadata(navBar) : null,
  () => fetchRoomsMetadata(navBar),
  {
    dedupingInterval: 30000,
    revalidateOnFocus: true,
    refreshInterval: 60000,
  }
);
```

---

## 6. UI State Machine

### 6.1 Page State Machine

```
┌─────────────┐
│   loading   │
└──────┬──────┘
       │ onSuccess
       ▼
┌─────────────┐    hasRooms=false    ┌─────────────┐
│    ready    │─────────────────────→│ empty_rooms │
└──────┬──────┘                      └─────────────┘
       │ hasRooms=true
       ▼
┌─────────────┐    selectRoom        ┌─────────────┐
│  list_view  │─────────────────────→│room_selected│
└─────────────┘                      └──────┬──────┘
       ▲                                    │
       │         closeRoom (mobile)         │
       └────────────────────────────────────┘
```

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `loading` | FETCH_SUCCESS | `ready` | - | Set chatRooms |
| `loading` | FETCH_ERROR | `error` | - | Show error toast |
| `ready` | HAS_ROOMS | `list_view` | `rooms.length > 0` | - |
| `ready` | NO_ROOMS | `empty_rooms` | `rooms.length === 0` | - |
| `list_view` | SELECT_ROOM | `room_selected` | `roomId` valid | Set roomIdAtom, navigate/update |
| `room_selected` | CLOSE_ROOM | `list_view` | Mobile only | Clear roomIdAtom |
| `room_selected` | SELECT_ROOM | `room_selected` | Different room | Update roomIdAtom |
| `*` | FETCH_ERROR | `error` | - | Show error, allow retry |
| `*` | OFFLINE | `offline` | No connection | Show offline banner |

### 6.2 Room Selection State

| Current State | Event | Next State | Side Effects |
|---------------|-------|------------|--------------|
| `none_selected` | SELECT | `selecting` | Highlight room |
| `selecting` | LOAD_SUCCESS | `selected` | Show chat in right panel |
| `selecting` | LOAD_ERROR | `none_selected` | Show error toast |
| `selected` | SELECT_OTHER | `selecting` | Clear current, load new |
| `selected` | CLOSE | `none_selected` | Clear roomIdAtom |

---

## 7. Component-Action Wiring

### 7.1 Desktop Layout

```
┌────────────────────────────────────────────────────────────────────┐
│  Chat Header: "ข้อความ"                                            │
├──────────────────────┬─────────────────────────────────────────────┤
│  Conversation List   │                                             │
│  (300px fixed)       │         Active Chat Window                  │
│                      │         (CHAT-R02 embedded)                 │
│  ┌────────────────┐  │                                             │
│  │ Search Bar     │  │                                             │
│  └────────────────┘  │                                             │
│                      │                                             │
│  ┌────────────────┐  │                                             │
│  │ Room Card 1    │◀─┼── Selected (highlight)                      │
│  │ • Avatar       │  │                                             │
│  │ • Name         │  │                                             │
│  │ • Last msg     │  │                                             │
│  │ • Time + Badge │  │                                             │
│  └────────────────┘  │                                             │
│                      │                                             │
│  ┌────────────────┐  │                                             │
│  │ Room Card 2    │  │                                             │
│  └────────────────┘  │                                             │
│                      │                                             │
└──────────────────────┴─────────────────────────────────────────────┘
```

### 7.2 Mobile Layout

```
┌─────────────────────────┐
│  Chat Header            │
├─────────────────────────┤
│                         │
│  Search Bar             │
│                         │
│  ┌───────────────────┐  │
│  │ Room Card 1       │──┼── Tap → Navigate to /chat?room={id}
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │ Room Card 2       │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │ Room Card 3       │  │
│  └───────────────────┘  │
│                         │
└─────────────────────────┘
```

### 7.3 Component Actions

| Component | Event | Action | Effect |
|-----------|-------|--------|--------|
| Search Bar | onChange | `setSearchQuery` | Filter rooms client-side |
| Search Bar | onClear | `setSearchQuery('')` | Reset filter |
| Room Card | onClick | `selectRoom(roomId)` | Set roomIdAtom, show chat |
| Room Card | onSwipe (mobile) | - | Reserved for future |
| Empty State CTA | onClick | Navigate | `/candidates/{id}/applications` or similar |

### 7.4 Room Card Component

| Element | Data Source | Behavior |
|---------|-------------|----------|
| Avatar | `otherPartyPhoto` | Fallback to initials |
| Name | `otherPartyName` | Truncate > 20 chars |
| Position | `positionContext` | Small text, optional |
| Last Message | `lastMessageText` | Truncate > 30 chars |
| Timestamp | `lastMessageTime` | Relative time (Thai) |
| Unread Badge | `unreadCount` | Hide if 0, show count |
| Appointment Icon | `hasPendingAppointment` | 📅 if true |

---

## 8. Error Handling

### 8.1 Error States

| Error | Display | Recovery |
|-------|---------|----------|
| Fetch failed | Toast + retry button | Retry on click |
| Room not found | Redirect to list | Clear roomIdAtom |
| Auth expired | Redirect to login | - |
| Forbidden | Error page | Back to home |

### 8.2 Error Messages

```typescript
const errorMessages = {
  fetchFailed: 'ไม่สามารถโหลดรายการแชทได้',
  roomNotFound: 'ห้องแชทไม่พบ',
  connectionLost: 'ขาดการเชื่อมต่อ',
  retryLabel: 'ลองใหม่',
};
```

---

## 9. Empty States

### 9.1 Candidate Empty State

```
┌─────────────────────────────────────┐
│                                     │
│           [Message Icon]            │
│                                     │
│         ยังไม่มีข้อความ              │
│                                     │
│  เมื่อบริษัทตอบรับใบสมัครของคุณ       │
│  คุณจะสามารถแชทกับบริษัทได้ที่นี่      │
│                                     │
│       [ไปที่ใบสมัคร]                  │
│                                     │
└─────────────────────────────────────┘
```

| Element | Value |
|---------|-------|
| Title | ยังไม่มีข้อความ |
| Description | เมื่อบริษัทตอบรับใบสมัครของคุณ คุณจะสามารถแชทกับบริษัทได้ที่นี่ |
| CTA | ไปที่ใบสมัคร → `/candidates/{id}/applications` |

### 9.2 Company Empty State

```
┌─────────────────────────────────────┐
│                                     │
│           [Message Icon]            │
│                                     │
│         ยังไม่มีข้อความ              │
│                                     │
│  เมื่อคุณตอบรับใบสมัคร               │
│  ระบบจะสร้างห้องแชทอัตโนมัติ          │
│                                     │
│        [ดูใบสมัคร]                   │
│                                     │
└─────────────────────────────────────┘
```

| Element | Value |
|---------|-------|
| Title | ยังไม่มีข้อความ |
| Description | เมื่อคุณตอบรับใบสมัคร ระบบจะสร้างห้องแชทอัตโนมัติ |
| CTA | ดูใบสมัคร → `/companies/{id}/dashboard/applications` |

### 9.3 No Selected Chat (Desktop)

```
┌─────────────────────────────────────┐
│                                     │
│           [Chat Icon]               │
│                                     │
│   เลือกการสนทนาเพื่อเริ่มแชท         │
│                                     │
└─────────────────────────────────────┘
```

### 9.4 No Search Results

```
┌─────────────────────────────────────┐
│                                     │
│         [Search Icon]               │
│                                     │
│    ไม่พบการสนทนาที่ตรงกับ            │
│      "{searchQuery}"                │
│                                     │
│        [ล้างการค้นหา]                │
│                                     │
└─────────────────────────────────────┘
```

---

## 10. Implementation Checklist

### Phase 1: Core List
- [ ] Create page component at `/chat/page.tsx`
- [ ] Implement room list with SWR fetching
- [ ] Create room card component
- [ ] Add loading skeleton
- [ ] Add empty states (candidate/company)
- [ ] Implement responsive layout (desktop/mobile)

### Phase 2: Search & Filter
- [ ] Add search bar component
- [ ] Implement client-side filtering
- [ ] Add no results state
- [ ] Add clear search button

### Phase 3: Room Selection
- [ ] Implement room selection state
- [ ] Add selected highlight style
- [ ] Handle URL query param (`?room=`)
- [ ] Desktop: Show chat in right panel
- [ ] Mobile: Navigate to chat view

### Phase 4: Real-time Updates
- [ ] Implement SWR refresh interval
- [ ] Handle new message updates
- [ ] Update unread badges
- [ ] Handle connection state

### Phase 5: Polish
- [ ] Add appointment indicator (📅)
- [ ] Implement relative time formatting (Thai)
- [ ] Add accessibility (keyboard nav)
- [ ] Add analytics events
- [ ] Error handling and toasts

---

## 11. Decisions Log

| Decision | Value | Rationale | Date |
|----------|-------|-----------|------|
| Metadata-only fetch | No messages in list | 10x performance improvement | 2025-12-10 |
| Polling for list | 60s refresh interval | Real-time not needed for list metadata | 2025-12-10 |
| Client-side search | Filter loaded rooms | Fast, no server round-trip | 2025-12-10 |
| Desktop two-panel | List + embedded CHAT-R02 | Standard chat UX pattern | 2025-12-10 |
| Mobile stack nav | Full-screen transitions | Better mobile UX | 2025-12-10 |
| URL param for room | `?room={id}` | Shareable links, browser history | 2025-12-10 |

---

## Appendix: TypeScript Types

```typescript
// Page state
type ChatListPageState = 
  | 'loading'
  | 'ready'
  | 'list_view'
  | 'room_selected'
  | 'empty_rooms'
  | 'error'
  | 'offline';

// Room selection state
type RoomSelectionState = 
  | 'none_selected'
  | 'selecting'
  | 'selected';

// Props for room card
interface RoomCardProps {
  room: RoomListItem;
  isSelected: boolean;
  onSelect: (roomId: string) => void;
}

// Props for empty state
interface EmptyStateProps {
  type: 'candidate' | 'company' | 'no_selected' | 'no_results';
  searchQuery?: string;
  onClearSearch?: () => void;
}

// Search state
interface SearchState {
  query: string;
  isSearching: boolean;
}
```

---

*End of CHAT-R01 Route Implementation Specification*
