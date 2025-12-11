# BLS-11: Notifications Stage

**Stage:** Notifications  
**Version:** 1.0  
**Last Updated:** 2025-12-11  
**Actions Count:** 8

---

## Stage Overview

The Notifications Stage manages in-app and email notification delivery for platform events. **Key architectural insight:** Notifications are NOT a separate collection—they are specific message types within the existing `web_messages` collection. The notification system provides a unified view of status-change messages and unread chat messages.

### Stage Boundaries

| Aspect | Scope |
|--------|-------|
| **Enters from** | Shell bell icon, header badge, triggered by other stages |
| **Triggered by** | BLS-03 (application), BLS-04 (screening), BLS-05 (interview), BLS-09 (company) |
| **Primary Actors** | Candidate (receive), Company (receive), System (send) |
| **Data Sources** | `web_messages` (primary), SendGrid (email), FCM (push) |

### Core Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                         web_messages                                │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Chat Messages (FAB badge)        Notification Messages (Bell)     │
│  ┌─────────────────────┐          ┌─────────────────────┐          │
│  │ • text              │          │ • application-*     │          │
│  │ • file              │          │ • interview-*       │          │
│  │ • image             │          │ • offer             │          │
│  │ • emoji             │          │ • platform          │          │
│  │ • reply             │          │ • system            │          │
│  └─────────────────────┘          └─────────────────────┘          │
│                                                                    │
│  Grouped by room in                Individual items in             │
│  "Messages" filter                 other filters                   │
└────────────────────────────────────────────────────────────────────┘
```

### Actions in This Stage

| Action ID | Action Name | Actor | Trigger | Primary Target |
|-----------|-------------|-------|---------|----------------|
| BLS-11-01 | viewNotifications | User | Navigate to `/notifications` | `web_messages` |
| BLS-11-02 | filterNotifications | User | Tab selection | Query filter |
| BLS-11-03 | markAsRead | User | Click notification | `web_messages.unread` |
| BLS-11-04 | markAllAsRead | User | "Read all" button | Batch update |
| BLS-11-05 | updateBadgeCount | System | Real-time listener | Shell state |
| BLS-11-06 | sendEmailNotification | System | Event triggered | SendGrid |
| BLS-11-07 | sendPushNotification | System | Event triggered | FCM |
| BLS-11-08 | updateNotificationSettings | User | Settings page | `candidate_information` / `company_information` |

### Notification Channels

| Channel | Technology | Purpose | Relationship |
|---------|------------|---------|--------------|
| In-app (Bell) | Firestore `web_messages` | Status updates, scheduling | Primary mechanism |
| Email | SendGrid | Out-of-app alerts | Important events |
| Push | FCM (`ff_push_notifications`) | Mobile/web alerts | Real-time delivery |

---

## Message Type Taxonomy

### Notification Types (Bell Badge)

| Type | Sender | Recipient | Trigger | Source Stage |
|------|--------|-----------|---------|--------------|
| `application-received` | System | Company | Candidate submits | BLS-03 |
| `application-accepted` | System | Candidate | Company accepts | BLS-04 |
| `application-rejected` | System | Candidate | Company rejects | BLS-04 |
| `interview` | System | Candidate | Company schedules | BLS-05 |
| `interview-reschedule` | System | Candidate | Company reschedules | BLS-05 |
| `interview-confirmed` | System | Company | Candidate confirms | BLS-05 |
| `interview-declined` | System | Company | Candidate declines | BLS-05 |
| `interview-cancelled` | System | Candidate | Company cancels | BLS-05 |
| `offer` | System | Candidate | Company sends offer | BLS-05 |
| `platform` | Platform | User | Announcements | Admin |
| `system` | System | Either | Legacy/generic | Various |

### Chat Types (FAB Badge - NOT counted in Bell)

| Type | Description |
|------|-------------|
| `text` | Plain text message |
| `file` | File attachment |
| `image` | Image attachment |
| `emoji` | Emoji reaction |
| `reply` | Reply to message |

### Type Constants
```typescript
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

const CHAT_MESSAGE_TYPES = [
  'text', 'file', 'image', 'emoji', 'reply',
] as const;
```

---

## BLS-11-01: viewNotifications

### Description
Display unified notification center showing status updates and unread messages across all conversations.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| NOTIF-R01_notifications_RIS.md | Full | Notification center spec |
| NOTIF-R00_cross-cutting_RIS.md | Section 2-6 | Message taxonomy |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | User authenticated | `sessionStateAtom === 'valid'` | Redirect to login |
| 2 | Has candidate or company role | `navBarAtom` check | Redirect to home |

### Route
**Path:** `/notifications`  
**Query:** `?filter=all|applications|messages|appointments|system`

### Data Query
```typescript
// For notification items (applications, appointments, system)
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

// For grouped chat rooms (messages filter)
// Group by room_id, aggregate count + latest message
```

### State Changes

**SWR Cache (Read-only):**
| Key Pattern | Data Shape | Config |
|-------------|------------|--------|
| `notifications-${filter}-${userId}` | `NotificationItem[]` | Standard |
| `notifications-grouped-messages-${userId}` | `GroupedChatRoom[]` | Standard |
| `notifications-badge-count-${userId}` | `number` | Real-time |

### UI Feedback
| Scenario | Feedback Type | Display |
|----------|---------------|---------|
| Loading | Skeleton list | Notification row placeholders |
| Empty (all) | Empty state | "ยังไม่มีการแจ้งเตือน" |
| Empty (filter) | Empty state | Filter-specific message |
| Error | Error state + retry | "ไม่สามารถโหลดการแจ้งเตือนได้" |

---

## BLS-11-02: filterNotifications

### Description
Filter notifications by category using tab-based navigation.

### Filter Categories
| Filter Value | Thai Label | Message Types | Display Mode |
|--------------|------------|---------------|--------------|
| `all` | ทั้งหมด | All types | Mixed |
| `applications` | ใบสมัคร | `application-*`, `offer` | Individual items |
| `messages` | ข้อความ | `text`, `file`, `image`, `emoji`, `reply` | **Grouped by room** |
| `appointments` | การนัดหมาย | `interview-*` | Individual items |
| `system` | ระบบ | `platform`, `system` | Individual items |

### State Changes

**Jotai Atoms:**
| Atom | Before | After |
|------|--------|-------|
| `notificationFilterAtom` | Previous filter | New filter |

**URL:**
| Before | After |
|--------|-------|
| `/notifications?filter=all` | `/notifications?filter=applications` |

### UI Feedback
| Scenario | Feedback Type | Display |
|----------|---------------|---------|
| Tab click | Active state change | Selected tab highlighted |
| Loading new filter | Skeleton | While fetching |
| Filter count | Badge | Show unread count per tab |

---

## BLS-11-03: markAsRead

### Description
Mark a single notification as read when user clicks on it. Removes user from `unread` array.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| NOTIF-R00_cross-cutting_RIS.md | Section 8 | Query patterns |
| CHAT-R00_cross-cutting_RIS.md | Section 5 | Same unread mechanism |

### Trigger
User clicks notification item → mark as read → navigate to destination.

### State Changes

**Firestore:**
| Operation | Collection | Document ID | Fields |
|-----------|------------|-------------|--------|
| Update | `web_messages` | messageId | `unread: arrayRemove(userId)`, `updated_at` |

**Jotai Atoms:**
| Atom | Before | After |
|------|--------|-------|
| `notificationBadgeCountAtom` | N | N - 1 |

### Server Action
```typescript
async function markNotificationAsRead(
  messageId: string,
  userId: string
): Promise<void> {
  await updateDoc(doc(db, 'web_messages', messageId), {
    unread: arrayRemove(userId),
    updated_at: Date.now(),
  });
}
```

### Navigation After Mark
| Message Type | Has `action_link` | Destination |
|--------------|-------------------|-------------|
| `application-*` | Yes | `action_link` URL |
| `application-*` | No | `/chat/[roomId]` |
| `interview-*` | - | `/chat/[roomId]` |
| `offer` | - | `/chat/[roomId]` |
| `platform` | Maybe | `action_link` or stay |
| Grouped room | - | `/chat/[roomId]` |

### UI Feedback
| Scenario | Feedback Type | Display |
|----------|---------------|---------|
| Clicking | Optimistic update | Item fades/removes |
| Navigate | Router push | Go to destination |
| Error | Toast + revert | "ไม่สามารถทำเครื่องหมายอ่านแล้ว" |

---

## BLS-11-04: markAllAsRead

### Description
Mark all currently displayed notifications as read. Batch update operation.

### Trigger
User clicks "อ่านทั้งหมด" button in header.

### State Changes

**Firestore:**
| Operation | Collection | Document IDs | Fields |
|-----------|------------|--------------|--------|
| Batch Update | `web_messages` | All displayed IDs | `unread: arrayRemove(userId)` |

**Jotai Atoms:**
| Atom | Before | After |
|------|--------|-------|
| `notificationBadgeCountAtom` | N | 0 (or reduced by batch count) |

### Server Action
```typescript
async function markAllNotificationsAsRead(
  userId: string,
  role: 'candidate' | 'company',
  companyId: string | null,
  filter: NotificationFilter
): Promise<{ count: number }> {
  // Get all unread message IDs for this filter
  const messages = await getUnreadMessagesForFilter(...);
  
  const batch = writeBatch(db);
  messages.forEach(msg => {
    batch.update(doc(db, 'web_messages', msg.uid), {
      unread: arrayRemove(userId),
      updated_at: Date.now(),
    });
  });
  
  await batch.commit();
  return { count: messages.length };
}
```

### UI Feedback
| Scenario | Feedback Type | Display |
|----------|---------------|---------|
| Clicking | Button loading | Spinner |
| Success | Toast + clear list | "ทำเครื่องหมายอ่านทั้งหมดแล้ว" |
| Error | Toast | "ไม่สามารถทำเครื่องหมายอ่านแล้ว" |

---

## BLS-11-05: updateBadgeCount

### Description
Real-time listener that updates the bell badge count in shell header. Separate from chat FAB badge.

### Trigger
Real-time Firestore `onSnapshot` listener on user's unread notification messages.

### Badge Separation
| Badge | Location | Message Types | Atom |
|-------|----------|---------------|------|
| Bell (🔔) | Header | `application-*`, `interview-*`, `offer`, `platform`, `system` | `notificationBadgeCountAtom` |
| Chat FAB | Bottom-right | `text`, `file`, `image`, `emoji`, `reply` | `chatUnreadCountAtom` |

### State Changes

**Jotai Atoms:**
| Atom | Trigger | Value |
|------|---------|-------|
| `notificationBadgeCountAtom` | Snapshot update | Count of unread notifications |

### Query for Badge Count
```typescript
async function getNotificationBadgeCount(
  userId: string,
  role: 'candidate' | 'company',
  companyId: string | null
): Promise<number> {
  const q = query(
    collection(db, 'web_messages'),
    where('type', 'in', NOTIFICATION_MESSAGE_TYPES),
    where('unread', 'array-contains', userId),
    role === 'company'
      ? where('company_id', '==', companyId)
      : where('candidate_id', '==', userId)
  );
  
  const snapshot = await getCountFromServer(q);
  return snapshot.data().count;
}
```

### UI Feedback
| Scenario | Feedback Type | Display |
|----------|---------------|---------|
| Count > 0 | Red badge | Number on bell icon |
| Count > 99 | Capped badge | "99+" |
| Count = 0 | No badge | Clean bell icon |
| New notification | Badge increment | Animate badge |

---

## BLS-11-06: sendEmailNotification

### Description
System-triggered action to send email notifications via SendGrid for important events.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| features_notifications.md | NOTIF-001 to NOTIF-012 | Email notification specs |

### Trigger Sources
| Event | Email Type | Recipient | Template |
|-------|------------|-----------|----------|
| Application submitted | New application | Company | `application_received` |
| Application accepted | Acceptance | Candidate | `application_accepted` |
| Application rejected | Rejection | Candidate | `application_rejected` |
| Interview scheduled | New appointment | Candidate | `interview_scheduled` |
| Interview rescheduled | Updated appointment | Candidate | `interview_rescheduled` |
| Interview cancelled | Cancellation | Candidate | `interview_cancelled` |
| Interview confirmed | Confirmation | Company | `interview_confirmed` |
| Interview declined | Decline | Company | `interview_declined` |
| Offer sent | Job offer | Candidate | `offer_sent` |
| Company approved | Approval | Company | `company_approved` |

### Server Action
```typescript
interface UnifiedEmailData {
  candidateName: string;
  subject: string;
  date?: string;
  emailTitle: string;
  greeting: string;
  mainMessage: string;
  statusBadge?: { icon: string; text: string };
  infoItems?: Array<{ label: string; value: string }>;
  nextSteps?: string[];
  actionButtons?: Array<{ text: string; url: string }>;
  highlightMessage?: string;
}

async function sendEmailNotification(
  email: string,
  emailData: UnifiedEmailData,
  notificationType: NotificationType
): Promise<ActionResult> {
  const response = await sendgrid.send({
    to: email,
    from: 'noreply@chancedee.com',
    templateId: 'd-0fe292fbc3394bbd847595b6c49b2e64',
    dynamicTemplateData: emailData,
    categories: [notificationType],
  });
  
  return { success: response.statusCode === 200 };
}
```

### Email Template Fields
| Field | Type | Purpose |
|-------|------|---------|
| `candidateName` | string | Recipient name |
| `subject` | string | Email subject line |
| `date` | string | Thai formatted date |
| `emailTitle` | string | Header title |
| `greeting` | string | Personalized greeting |
| `mainMessage` | string | Primary content |
| `statusBadge` | object | Status indicator |
| `infoItems` | array | Key-value pairs |
| `nextSteps` | array | Action checklist |
| `actionButtons` | array | CTA buttons |

---

## BLS-11-07: sendPushNotification

### Description
System-triggered action to create push notification record for FCM delivery.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| features_notifications.md | NOTIF-002 | Push notification spec |

### State Changes

**Firestore:**
| Operation | Collection | Document ID | Fields |
|-----------|------------|-------------|--------|
| Create | `ff_push_notifications` | Auto | See schema below |

### Push Notification Schema
```typescript
interface PushNotification {
  notification_title: string;      // Thai title
  notification_text: string;       // Body text
  notification_image_url: string;  // Badge/thumbnail
  initial_page_name: string;       // Deep link destination
  parameter_data: string;          // JSON params
  user_refs: DocumentReference;    // Reference to user
  created_at: Timestamp;
  updated_at: Timestamp;
}
```

### Server Action
```typescript
async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  deepLink: string,
  params?: Record<string, any>
): Promise<ActionResult> {
  const userRef = doc(db, 'user_accounts', userId);
  
  await addDoc(collection(db, 'ff_push_notifications'), {
    notification_title: title,
    notification_text: body,
    notification_image_url: 'https://chancedee.com/icon.png',
    initial_page_name: deepLink,
    parameter_data: JSON.stringify(params ?? {}),
    user_refs: userRef,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
  
  return { success: true };
}
```

### FCM Delivery
- Push notification records are processed by FCM Cloud Functions
- Delivered to mobile/web apps via FCM subscription
- User must have active FCM token in `fcm_tokens` collection

---

## BLS-11-08: updateNotificationSettings

### Description
Update user's notification preferences for email and push notifications.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| CAND-R03_settings_RIS.md | Section 4.4 | Candidate notification settings |
| COMP-R03_settings_RIS.md | Section 4.3 | Company notification settings |

### Settings (Candidate)
| Setting | Type | Description | Default |
|---------|------|-------------|---------|
| `emailJobRecommendations` | boolean | Job recommendation emails | true |
| `emailApplicationUpdates` | boolean | Application status emails | true |
| `pushEnabled` | boolean | Enable push notifications | false |

### Settings (Company)
| Setting | Type | Description | Default |
|---------|------|-------------|---------|
| `notifyNewApplication` | boolean | Email on new application | true |
| `dailySummaryEnabled` | boolean | Daily summary email | false |
| `dailySummaryTime` | string | Time for summary (HH:mm) | '09:00' |
| `interviewReminderHours` | number | Hours before reminder | 24 |

### State Changes

**Firestore:**
| Operation | Collection | Document ID | Fields |
|-----------|------------|-------------|--------|
| Update | `candidate_information` | candidateId | Notification settings |
| Update | `company_information` | companyId | `config.notifications` |

**FCM Tokens:**
| Operation | Collection | Condition |
|-----------|------------|-----------|
| Create | `fcm_tokens` | Push enabled + permission granted |
| Update (inactive) | `fcm_tokens` | Push disabled |

### Server Action
```typescript
interface NotificationSettingsInput {
  emailJobRecommendations?: boolean;
  emailApplicationUpdates?: boolean;
  pushEnabled?: boolean;
}

async function updateNotificationSettings(
  userId: string,
  role: 'candidate' | 'company',
  settings: NotificationSettingsInput
): Promise<ActionResult>;
```

### UI Feedback
| Scenario | Feedback Type | Display |
|----------|---------------|---------|
| Toggle change | Optimistic update | Instant |
| Success | Toast | "บันทึกการตั้งค่าแล้ว" |
| Push permission denied | Error message | "กรุณาเปิดการแจ้งเตือนในการตั้งค่าเบราว์เซอร์" |

---

## Notification Creation Triggers

### From BLS-03 Application
| Action | Creates Message Type | Recipient |
|--------|---------------------|-----------|
| submitApplication | `application-received` | Company |

### From BLS-04 Screening
| Action | Creates Message Type | Recipient | Also Sends |
|--------|---------------------|-----------|------------|
| acceptApplication | `application-accepted` | Candidate | Email, Push |
| rejectApplication | `application-rejected` | Candidate | Email |

### From BLS-05 Interview
| Action | Creates Message Type | Recipient | Also Sends |
|--------|---------------------|-----------|------------|
| scheduleInterview | `interview` | Candidate | Email, Push, Chat |
| rescheduleInterview | `interview-reschedule` | Candidate | Email, Push, Chat |
| cancelInterview | `interview-cancelled` | Candidate | Email, Push, Chat |
| confirmInterview | `interview-confirmed` | Company | Email, Push |
| declineInterview | `interview-declined` | Company | Email, Push |

### From Admin
| Action | Creates Message Type | Recipient |
|--------|---------------------|-----------|
| sendAnnouncement | `platform` | All users / segment |
| approveCompany | `system` | Company (email only) |

---

## Stage Integration Points

### Entry Points (from other stages)
| Source | Trigger | Entry Action |
|--------|---------|--------------|
| Shell header | Bell icon click | viewNotifications |
| Dropdown | "ดูทั้งหมด" link | viewNotifications |

### Triggered By (other stages create notifications)
| Source Stage | Source Action | Notification Action |
|--------------|---------------|---------------------|
| BLS-03 | submitApplication | Create `application-received` message |
| BLS-04 | acceptApplication | Create `application-accepted` + email + push |
| BLS-04 | rejectApplication | Create `application-rejected` + email |
| BLS-05 | scheduleInterview | Create `interview` + email + push + chat |
| BLS-05 | confirmInterview | Create `interview-confirmed` + email |
| BLS-09 | Company approval | Email notification |

### Exit Points (navigation from notifications)
| Click Target | Destination |
|--------------|-------------|
| Application notification | Applications list or chat |
| Interview notification | Chat room |
| Grouped chat room | Chat room |
| Platform announcement | `action_link` or stay |

---

## Permissions Matrix

| Action | Candidate | Company | Admin |
|--------|-----------|---------|-------|
| viewNotifications | ✓ Own | ✓ Company's | ✓ All |
| filterNotifications | ✓ | ✓ | ✓ |
| markAsRead | ✓ Own | ✓ Company's | ✗ |
| markAllAsRead | ✓ Own | ✓ Company's | ✗ |
| updateBadgeCount | ✓ System | ✓ System | ✗ |
| sendEmailNotification | System | System | ✓ |
| sendPushNotification | System | System | ✓ |
| updateNotificationSettings | ✓ Own | ✓ Company's | ✗ |

---

## Thai Copy Reference

### Page Headers
| Key | Thai |
|-----|------|
| Page title | การแจ้งเตือน |
| Mark all read | อ่านทั้งหมด |
| View all | ดูทั้งหมด |

### Filter Tabs
| Filter | Thai |
|--------|------|
| All | ทั้งหมด |
| Applications | ใบสมัคร |
| Messages | ข้อความ |
| Appointments | การนัดหมาย |
| System | ระบบ |

### Notification Titles
| Type | Thai Template |
|------|---------------|
| `application-received` | มีใบสมัครใหม่สำหรับ {jobTitle} |
| `application-accepted` | ใบสมัครของคุณได้รับการตอบรับ |
| `application-rejected` | ใบสมัครของคุณไม่ผ่านการพิจารณา |
| `interview` | นัดสัมภาษณ์ใหม่ |
| `interview-reschedule` | เลื่อนนัดสัมภาษณ์ |
| `interview-confirmed` | ผู้สมัครยืนยันนัดสัมภาษณ์ |
| `interview-declined` | ผู้สมัครปฏิเสธนัดสัมภาษณ์ |
| `interview-cancelled` | ยกเลิกนัดสัมภาษณ์ |
| `offer` | ข้อเสนองาน |

### Empty States
| Filter | Thai |
|--------|------|
| All | ยังไม่มีการแจ้งเตือน |
| Applications | ไม่มีการแจ้งเตือนเกี่ยวกับใบสมัคร |
| Messages | ไม่มีข้อความใหม่ |
| Appointments | ไม่มีการแจ้งเตือนเกี่ยวกับการนัดหมาย |
| System | ไม่มีการแจ้งเตือนจากระบบ |

### Timestamps
| Relative | Thai |
|----------|------|
| Just now | เมื่อสักครู่ |
| X minutes ago | X นาทีที่แล้ว |
| X hours ago | X ชั่วโมงที่แล้ว |
| Yesterday | เมื่อวาน |
| X days ago | X วันที่แล้ว |

---

## Related Documents

| Document | Relationship |
|----------|--------------|
| NOTIF-R00_cross-cutting_RIS.md | Cross-cutting notification patterns |
| NOTIF-R01_notifications_RIS.md | Notification center page spec |
| features_notifications.md | Notification feature definitions |
| CHAT-R00_cross-cutting_RIS.md | Same `unread` mechanism |
| BLS-03_application.md | Triggers `application-received` |
| BLS-04_screening.md | Triggers `application-accepted/rejected` |
| BLS-05_interview.md | Triggers `interview-*` notifications |
| BLS-06_communication.md | Chat message delivery (FAB badge) |

---

*End of BLS-11 Notifications Stage*
