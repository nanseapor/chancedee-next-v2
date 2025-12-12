# NOTIF-R01: Notification Center Route Implementation Spec

**Version:** 2.0  
**Last Updated:** 2025-12-10  
**Route:** `/notifications`  
**Primary Domain:** Notifications

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | 2025-12-10 | Complete rewrite: notifications are chat messages, added grouped messages display, corrected filter categories and data source |
| 1.0 | 2025-12-10 | Initial creation (incorrect architecture) |

---

## Cross-References

This document references shared specifications from:

| Document | Section | Topic |
|----------|---------|-------|
| **NOTIF-R00** | Section 2 | Message type taxonomy |
| **NOTIF-R00** | Section 6 | Filter categories |
| **NOTIF-R00** | Section 7 | Shared TypeScript types |
| **NOTIF-R00** | Section 8 | Query patterns |
| **NOTIF-R00** | Section 9 | Error handling standards |
| **NOTIF-R00** | Section 10 | Thai copy reference |
| **CHAT-R00** | Section 5 | Unread tracking pattern (same mechanism) |

---

## 1. Route Metadata

| Property | Value |
|----------|-------|
| Route ID | NOTIF-R01 |
| Route Path | `/notifications` |
| Shell | Candidate Shell or Company Shell (role-based) |
| Purpose | Unified notification center - view status updates and unread messages |
| Complexity | Medium (mixed display modes, filter tabs) |
| Phase | 6 (Notifications) |
| UI Spec | `06-communication-routes.md` Section 7.2 |

### Route Parameters

None (list view, no dynamic segments).

### Query Parameters

| Parameter | Type | Purpose | Default |
|-----------|------|---------|---------|
| `filter` | `string` | Pre-select filter tab | `all` |

### Access Control

| Condition | Check | Failure Behavior |
|-----------|-------|------------------|
| User authenticated | `sessionStateAtom === 'valid'` | Redirect to `/auth/login` |
| Has candidate or company role | `navBarAtom` check | Redirect to home |
| Not deleted | User status check | Redirect to `/auth/deleted` |
| Not suspended | Account status check | Redirect to `/auth/status` |

---

## 2. Domain Classification

### Primary Domain: Notifications (▰)

- **Owns:** Unified view of notification-type messages and unread chat messages
- **Reads:** `web_messages` collection (filtered by type and unread status)
- **Writes:** `unread` array updates (mark as read)

### Key Insight

> This page does NOT have its own data collection. It provides a unified view into `web_messages` with specific filters and display modes.

### Secondary Domains (◧)

| Domain | Role | Access | Condition |
|--------|------|--------|-----------|
| Chat | Message data, room metadata | Read | Core data source |
| Auth | Settings link | Read | Navigation to notification preferences |

### Global Domains (★) - Via Shell

| Domain | Requirement |
|--------|-------------|
| Auth | Session validation, role determination |
| Notifications | Bell badge sync with this page |

---

## 3. Feature Mapping

### Core Features (This Route)

| Feature | Description | Data Source | Priority |
|---------|-------------|-------------|----------|
| View notification messages | Status updates, interview scheduling, platform notices | `web_messages` where type in notification types | P0 |
| View unread chat messages | Grouped by room | `web_messages` where type in chat types | P0 |
| Mark as read (individual) | Click item marks read + navigates | Update `unread` array | P0 |
| Mark all as read | Header action | Batch update `unread` array | P0 |
| Filter by category | Tab-based filtering | Query filter | P0 |
| Deep link navigation | Click navigates to relevant page | `action_link` or `/chat/[roomId]` | P0 |

### Message Type to Feature Mapping

| Filter Tab | Message Types | Display Mode | Click Action |
|------------|---------------|--------------|--------------|
| All | All types | Mixed | Per-item |
| Applications | `application-*`, `offer` | Individual items | `action_link` or chat |
| Messages | `text`, `file`, `image`, `emoji`, `reply` | **Grouped by room** | `/chat/[roomId]` |
| Appointments | `interview-*` | Individual items | `/chat/[roomId]` |
| System | `platform`, `system` | Individual items | `action_link` or chat |

---

## 4. Data Contract

### 4.1 Data Source

**Collection:** `web_messages`

All notification data comes from the existing messages collection. This page queries specific message types with unread status.

### 4.2 Query for Notification Items (Applications, Appointments, System)

```typescript
// Individual notification items
const notificationQuery = query(
  collection(db, 'web_messages'),
  where('type', 'in', FILTER_MESSAGE_TYPES[filter]),
  where('unread', 'array-contains', userId),
  role === 'company'
    ? where('company_id', '==', companyId)
    : where('candidate_id', '==', userId),
  orderBy('timestamp', 'desc'),
  limit(50)
);
```

### 4.3 Query for Grouped Chat Rooms (Messages Filter)

```typescript
// Step 1: Get unread chat messages
const chatMessagesQuery = query(
  collection(db, 'web_messages'),
  where('type', 'in', ['text', 'file', 'image', 'emoji', 'reply']),
  where('unread', 'array-contains', userId),
  role === 'company'
    ? where('company_id', '==', companyId)
    : where('candidate_id', '==', userId)
);

// Step 2: Group by room_id in application code
// Step 3: Aggregate count, latest message, timestamp per room
```

### 4.4 Notification Item Shape

> **Cross-Reference:** See NOTIF-R00 Section 7.2 for full type definition.

```typescript
interface NotificationItem {
  uid: string;
  type: MessageType;
  title: string;           // From system_title
  description: string;     // From system_message
  timestamp: number;
  isRead: boolean;
  actionLink: string | null;
  roomId: string;
  companyName?: string;
  jobTitle?: string;
}
```

### 4.5 Grouped Chat Room Shape

```typescript
interface GroupedChatRoom {
  roomId: string;
  otherPartyName: string;
  otherPartyAvatar: string;
  unreadCount: number;
  lastMessageText: string;
  lastMessageTimestamp: number;
}
```

### 4.6 Mark as Read Operation

```typescript
// Same as chat - remove user from unread array
async function markAsRead(messageId: string, userId: string): Promise<void> {
  await updateDoc(doc(db, 'web_messages', messageId), {
    unread: arrayRemove(userId),
    updated_at: Date.now(),
  });
}
```

### 4.7 Mark All as Read Operation

```typescript
// Batch update all displayed messages
async function markAllAsRead(
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

## 5. State Contract

### 5.1 Jotai Atoms

| Atom | Type | Purpose | Initial | Location |
|------|------|---------|---------|----------|
| `notificationFilterAtom` | `NotificationFilter` | Active filter tab | `'all'` | New |
| `notificationBadgeCountAtom` | `number` | Bell badge count (shared with shell) | `0` | Shared |

### 5.2 SWR Keys

| Key Pattern | Purpose | Filter |
|-------------|---------|--------|
| `notifications-${filter}-${userId}` | Notification items | applications, appointments, system |
| `notifications-grouped-messages-${userId}` | Grouped chat rooms | messages |
| `notifications-badge-count-${userId}` | Bell badge | - |

### 5.3 Custom Hooks

```typescript
// Main data hook
function useNotifications(filter: NotificationFilter) {
  const { userId, role, companyId } = useCurrentUser();
  
  // Different query for "messages" filter (grouped)
  if (filter === 'messages') {
    return useGroupedChatRooms(userId, role, companyId);
  }
  
  // Individual items for other filters
  return useNotificationItems(userId, role, companyId, filter);
}

// Individual notification items
function useNotificationItems(
  userId: string,
  role: 'candidate' | 'company',
  companyId: string | null,
  filter: NotificationFilter
) {
  const key = `notifications-${filter}-${userId}`;
  
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => fetchNotificationItems(userId, role, companyId, filter),
    {
      revalidateOnFocus: true,
      dedupingInterval: 30000,
    }
  );
  
  return {
    items: data ?? [],
    isLoading,
    error,
    refresh: mutate,
  };
}

// Grouped chat rooms for "messages" filter
function useGroupedChatRooms(
  userId: string,
  role: 'candidate' | 'company',
  companyId: string | null
) {
  const key = `notifications-grouped-messages-${userId}`;
  
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => fetchGroupedChatRooms(userId, role, companyId),
    {
      revalidateOnFocus: true,
      dedupingInterval: 30000,
    }
  );
  
  return {
    rooms: data ?? [],
    isLoading,
    error,
    refresh: mutate,
  };
}

// Mark as read with optimistic update
function useMarkAsRead() {
  const { mutate } = useSWRConfig();
  
  return async (messageId: string, userId: string) => {
    // Optimistic update
    // Call API
    // Revalidate badge count
    await markAsRead(messageId, userId);
    mutate(key => key?.toString().startsWith('notifications-'));
  };
}
```

---

## 6. UI State Machine

### 6.1 Page State Machine

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `loading` | FETCH_SUCCESS | `ready` | items.length > 0 | Render list |
| `loading` | FETCH_SUCCESS | `empty` | items.length === 0 | Show empty state |
| `loading` | FETCH_ERROR | `error` | - | Show error UI |
| `ready` | CHANGE_FILTER | `loading` | Different filter | Fetch with new filter, update URL |
| `ready` | MARK_ALL_READ | `marking` | hasUnread | Start batch update |
| `ready` | ITEM_CLICK | `ready` | - | Mark read, navigate |
| `marking` | MARK_SUCCESS | `ready` | - | Update badges, refresh list |
| `marking` | MARK_ERROR | `ready` | - | Toast error, rollback |
| `empty` | CHANGE_FILTER | `loading` | Different filter | Fetch new filter |
| `error` | RETRY | `loading` | - | Refetch |

### 6.2 Page State Diagram

```
                    ┌─────────┐
           ┌───────→│ loading │←──────────┐
           │        └────┬────┘           │
           │             │                │
           │   ┌─────────┼─────────┐      │
           │   │         │         │      │
           │   ▼         ▼         ▼      │
      ┌────┴────┐   ┌─────────┐   ┌───────┴─┐
      │  ready  │   │  empty  │   │  error  │
      └────┬────┘   └────┬────┘   └─────────┘
           │             │
           │ MARK_ALL    │ CHANGE_FILTER
           ▼             │
      ┌─────────┐        │
      │ marking │────────┘
      └─────────┘
```

### 6.3 Filter State

| Current Filter | Event | Next Filter | Side Effects |
|----------------|-------|-------------|--------------|
| `all` | SELECT_APPLICATIONS | `applications` | Update URL `?filter=applications` |
| `all` | SELECT_MESSAGES | `messages` | Update URL, switch to grouped view |
| `all` | SELECT_APPOINTMENTS | `appointments` | Update URL |
| `all` | SELECT_SYSTEM | `system` | Update URL |
| Any | SELECT_ALL | `all` | Update URL `?filter=all` |

---

## 7. Component-Action Wiring

### 7.1 Page Layout

```
┌────────────────────────────────────────────────────────────┐
│  Page Header                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ การแจ้งเตือน                        [อ่านทั้งหมด]    │  │
│  └──────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────┤
│  Filter Tabs                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ [ทั้งหมด] [ใบสมัคร] [ข้อความ(3)] [นัดหมาย] [ระบบ]    │  │
│  └──────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────┤
│  Content (varies by filter)                                │
│                                                            │
│  [For Applications/Appointments/System filters:]           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 📄 ใบสมัครของคุณได้รับการตอบรับ           2 นาที  ● │  │
│  │    บริษัท ABC - Software Engineer                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  [For Messages filter (grouped):]                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 💬 บริษัท ABC                         3 ข้อความ  ●  │  │
│  │    สวัสดีครับ ขอสอบถาม...             2 นาที        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### 7.2 Component Hierarchy

```typescript
<NotificationPage>
  <PageHeader>
    <Title>การแจ้งเตือน</Title>
    <MarkAllReadButton onClick={handleMarkAllRead} />
  </PageHeader>
  
  <FilterTabs
    activeFilter={filter}
    counts={filterCounts}
    onFilterChange={handleFilterChange}
  />
  
  {filter === 'messages' ? (
    <GroupedMessagesList
      rooms={groupedRooms}
      onRoomClick={handleRoomClick}
    />
  ) : (
    <NotificationList
      items={notifications}
      onItemClick={handleItemClick}
    />
  )}
  
  <EmptyState visible={isEmpty} filter={filter} />
  <ErrorState visible={hasError} onRetry={retry} />
</NotificationPage>
```

### 7.3 Component-Action Matrix

| Component | Action | Handler | Side Effects |
|-----------|--------|---------|--------------|
| Filter Tab | Click | `handleFilterChange(filter)` | Update URL, fetch new data |
| Mark All Read Button | Click | `handleMarkAllRead()` | Batch update, refresh list, sync badge |
| Notification Item | Click | `handleItemClick(item)` | Mark read, navigate to `action_link` or chat |
| Grouped Room | Click | `handleRoomClick(roomId)` | Navigate to `/chat/[roomId]` (marks read on open) |
| Error Retry Button | Click | `retry()` | Refetch current filter |

### 7.4 Notification Item Component (Individual)

```typescript
interface NotificationItemProps {
  item: NotificationItem;
  onClick: () => void;
}

function NotificationItem({ item, onClick }: NotificationItemProps) {
  const icon = getIconForType(item.type);
  
  return (
    <button 
      onClick={onClick}
      className={cn(
        'w-full p-4 flex items-start gap-3 hover:bg-gray-50',
        !item.isRead && 'bg-blue-50/30'
      )}
    >
      {/* Icon */}
      <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', icon.bgColor)}>
        <span>{icon.emoji}</span>
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0 text-left">
        <p className={cn('text-sm', !item.isRead && 'font-semibold')}>
          {item.title}
        </p>
        <p className="text-xs text-gray-500 truncate">
          {item.description}
        </p>
        {item.companyName && (
          <p className="text-xs text-gray-400 mt-1">
            {item.companyName} {item.jobTitle && `- ${item.jobTitle}`}
          </p>
        )}
      </div>
      
      {/* Meta */}
      <div className="flex flex-col items-end gap-1">
        <span className="text-xs text-gray-400">
          {formatRelativeTime(item.timestamp)}
        </span>
        {!item.isRead && (
          <span className="w-2 h-2 bg-blue-500 rounded-full" />
        )}
      </div>
    </button>
  );
}
```

### 7.5 Grouped Chat Room Component (Messages Filter)

```typescript
interface GroupedRoomProps {
  room: GroupedChatRoom;
  onClick: () => void;
}

function GroupedRoomItem({ room, onClick }: GroupedRoomProps) {
  return (
    <button 
      onClick={onClick}
      className="w-full p-4 flex items-start gap-3 hover:bg-gray-50 bg-blue-50/30"
    >
      {/* Avatar */}
      <Avatar src={room.otherPartyAvatar} size="md" />
      
      {/* Content */}
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">
            {room.otherPartyName}
          </p>
          <span className="text-xs text-teal-600 font-medium">
            {room.unreadCount} ข้อความ
          </span>
        </div>
        <p className="text-xs text-gray-500 truncate mt-1">
          {room.lastMessageText}
        </p>
      </div>
      
      {/* Meta */}
      <div className="flex flex-col items-end gap-1">
        <span className="text-xs text-gray-400">
          {formatRelativeTime(room.lastMessageTimestamp)}
        </span>
        <span className="w-2 h-2 bg-blue-500 rounded-full" />
      </div>
    </button>
  );
}
```

### 7.6 Filter Tabs Component

```typescript
const FILTER_TABS: { value: NotificationFilter; label: string }[] = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'applications', label: 'ใบสมัคร' },
  { value: 'messages', label: 'ข้อความ' },
  { value: 'appointments', label: 'การนัดหมาย' },
  { value: 'system', label: 'ระบบ' },
];

function FilterTabs({ 
  activeFilter, 
  counts, 
  onFilterChange 
}: FilterTabsProps) {
  return (
    <div className="flex gap-2 p-2 overflow-x-auto border-b">
      {FILTER_TABS.map(tab => (
        <button
          key={tab.value}
          onClick={() => onFilterChange(tab.value)}
          className={cn(
            'px-4 py-2 rounded-full text-sm whitespace-nowrap transition',
            activeFilter === tab.value
              ? 'bg-teal-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          {tab.label}
          {counts[tab.value] > 0 && (
            <span className="ml-1">({counts[tab.value]})</span>
          )}
        </button>
      ))}
    </div>
  );
}
```

---

## 8. Error Handling

### 8.1 Error Scenarios

> **Cross-Reference:** See NOTIF-R00 Section 9 for error handling standards.

| Scenario | Display | Recovery Action |
|----------|---------|-----------------|
| Initial fetch failed | Full-page error state | Retry button |
| Mark read failed | Toast error | Auto-retry once |
| Mark all read failed | Toast error | Retry via button |
| Deep link invalid | Toast "เนื้อหาไม่พร้อมใช้งาน" | Stay on page |
| Network offline | Toast warning | Show cached data |

### 8.2 Error State Component

```typescript
function NotificationErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        ไม่สามารถโหลดการแจ้งเตือนได้
      </h3>
      <p className="text-sm text-gray-500 mb-6 text-center">
        กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตและลองใหม่อีกครั้ง
      </p>
      <Button onClick={onRetry}>ลองใหม่</Button>
    </div>
  );
}
```

---

## 9. Empty States

### 9.1 Empty State Variants

| Filter | Condition | Message |
|--------|-----------|---------|
| All | No unread items | ยังไม่มีการแจ้งเตือน |
| Applications | No application notifications | ไม่มีการแจ้งเตือนเกี่ยวกับใบสมัคร |
| Messages | No unread messages | ไม่มีข้อความใหม่ |
| Appointments | No appointment notifications | ไม่มีการแจ้งเตือนเกี่ยวกับการนัดหมาย |
| System | No system notifications | ไม่มีการแจ้งเตือนจากระบบ |

### 9.2 Empty State Component

```typescript
function EmptyState({ filter }: { filter: NotificationFilter }) {
  const messages: Record<NotificationFilter, string> = {
    all: 'ยังไม่มีการแจ้งเตือน',
    applications: 'ไม่มีการแจ้งเตือนเกี่ยวกับใบสมัคร',
    messages: 'ไม่มีข้อความใหม่',
    appointments: 'ไม่มีการแจ้งเตือนเกี่ยวกับการนัดหมาย',
    system: 'ไม่มีการแจ้งเตือนจากระบบ',
  };
  
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <Bell className="w-16 h-16 text-gray-300 mb-4" />
      <p className="text-sm text-gray-500">{messages[filter]}</p>
    </div>
  );
}
```

---

## 10. Navigation & Deep Linking

### 10.1 Click Navigation Logic

```typescript
async function handleItemClick(item: NotificationItem) {
  // 1. Mark as read (optimistic)
  await markAsRead(item.uid, userId);
  
  // 2. Navigate based on action_link presence
  if (item.actionLink) {
    router.push(item.actionLink);
  } else {
    router.push(`/chat/${item.roomId}`);
  }
}

async function handleRoomClick(roomId: string) {
  // Messages in room will be marked read when chat opens
  router.push(`/chat/${roomId}`);
}
```

### 10.2 Navigation Destinations by Type

| Message Type | Navigation | Destination |
|--------------|------------|-------------|
| `application-received` | `action_link` or chat | Company app review |
| `application-accepted` | `action_link` or chat | Candidate app list |
| `application-rejected` | `action_link` | Candidate app list |
| `interview` | `/chat/[roomId]` | Chat with interview card |
| `interview-reschedule` | `/chat/[roomId]` | Chat with interview card |
| `interview-confirmed` | `/chat/[roomId]` | Chat |
| `interview-declined` | `/chat/[roomId]` | Chat |
| `interview-cancelled` | `/chat/[roomId]` | Chat |
| `offer` | `/chat/[roomId]` | Chat with offer card |
| `platform` | `action_link` or stay | Varies |
| `system` | `action_link` or chat | Varies |
| Grouped room | `/chat/[roomId]` | Chat room |

---

## 11. Implementation Checklist

### Phase 1: Core Page Structure (P0)

- [ ] Page component with shell integration
- [ ] Page header with title and mark all read button
- [ ] Filter tabs component
- [ ] URL sync with `?filter=` query param
- [ ] Basic loading state
- [ ] Basic error state

### Phase 2: Individual Notification Items (P0)

- [ ] Query for notification-type messages
- [ ] NotificationItem component
- [ ] Icon mapping for message types
- [ ] Click to mark read + navigate
- [ ] Empty states per filter

### Phase 3: Grouped Messages Display (P0)

- [ ] Query for chat-type messages
- [ ] Group by room_id logic
- [ ] GroupedRoomItem component
- [ ] Click to navigate to chat
- [ ] Unread count per room

### Phase 4: Mark All Read (P0)

- [ ] Mark all read button
- [ ] Batch update implementation
- [ ] Badge sync with shell bell
- [ ] Success/error toast feedback

### Phase 5: Polish (P1)

- [ ] Optimistic updates
- [ ] Skeleton loading states
- [ ] Transition animations
- [ ] Pull-to-refresh (mobile)
- [ ] Real-time updates when new messages arrive

---

## 12. Decisions Log

| Decision | Value | Rationale | Date |
|----------|-------|-----------|------|
| Notifications are chat messages | `web_messages` collection | Consolidate on existing infrastructure | 2025-12-10 |
| Separate badge counts | Bell ≠ FAB | Clear mental model for users | 2025-12-10 |
| Unified view in page | Both notifications + messages | Single place to see everything | 2025-12-10 |
| Messages grouped by room | Not individual items | Avoid flooding with chat messages | 2025-12-10 |
| Click marks read immediately | Before navigation | Clear feedback, accurate counts | 2025-12-10 |
| Mark all read affects displayed only | Filter-scoped | Predictable behavior | 2025-12-10 |
| Platform room for rejections | `MD5('system::userId')` | Handle case where company room doesn't exist | 2025-12-10 |
| New message types | `application-*`, `interview-*`, etc. | Better filtering than generic `system` | 2025-12-10 |

---

## 13. Thai Copy Summary

### Headers
| Key | Thai |
|-----|------|
| Page title | การแจ้งเตือน |
| Mark all read | อ่านทั้งหมด |

### Filter Tabs
| Key | Thai |
|-----|------|
| All | ทั้งหมด |
| Applications | ใบสมัคร |
| Messages | ข้อความ |
| Appointments | การนัดหมาย |
| System | ระบบ |

### Empty States
| Filter | Thai |
|--------|------|
| All | ยังไม่มีการแจ้งเตือน |
| Applications | ไม่มีการแจ้งเตือนเกี่ยวกับใบสมัคร |
| Messages | ไม่มีข้อความใหม่ |
| Appointments | ไม่มีการแจ้งเตือนเกี่ยวกับการนัดหมาย |
| System | ไม่มีการแจ้งเตือนจากระบบ |

### Timestamps
| Key | Thai |
|-----|------|
| Just now | เมื่อสักครู่ |
| X minutes ago | X นาทีที่แล้ว |
| X hours ago | X ชั่วโมงที่แล้ว |
| Yesterday | เมื่อวาน |
| X days ago | X วันที่แล้ว |

### Actions
| Key | Thai |
|-----|------|
| Retry | ลองใหม่ |
| Message count | X ข้อความ |

### Errors
| Key | Thai |
|-----|------|
| Load failed | ไม่สามารถโหลดการแจ้งเตือนได้ |
| Mark read failed | ไม่สามารถทำเครื่องหมายอ่านแล้ว |
| Content unavailable | เนื้อหาไม่พร้อมใช้งาน |

---

*End of NOTIF-R01 Notification Center Route Implementation Spec v2.0*
