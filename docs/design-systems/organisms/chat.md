# Chat

## Overview

Chat components power the real-time messaging system between candidates and companies. The chat interface supports text messages, attachments, and appointment scheduling.

**Design Reference:** See `chancedee-design-guidelines.md` for colors, typography, and badge variants.

---

# 1. ConversationList

## Description

Displays a list of chat conversations with preview, timestamp, and unread indicators. Used in the chat sidebar and mobile chat list view.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| conversations | `Conversation[]` | yes | — | Conversation list |
| activeId | `string` | no | — | Currently selected conversation |
| onSelect | `(id: string) => void` | yes | — | Selection handler |
| loading | `boolean` | no | `false` | Loading state |
| searchQuery | `string` | no | — | Filter conversations |

### Conversation Type

| Property | Type | Description |
|----------|------|-------------|
| id | `string` | Conversation identifier |
| participant | `{ id, name, avatar, type }` | Other party info |
| lastMessage | `{ text, timestamp, senderId }` | Last message preview |
| unreadCount | `number` | Unread message count |
| jobContext | `{ id, title }` | Related job (optional) |
| status | `'active'` \| `'archived'` | Conversation status |

## Visual Structure

```
┌─────────────────────────────────────┐
│  🔍 ค้นหาข้อความ...                 │  ← Search input
├─────────────────────────────────────┤
│  ┌─────────────────────────────────┐│
│  │ 🏢  Company Name          14:30 ││  ← Conversation item
│  │     📋 Job Title                ││     (job context)
│  │     Last message preview...  🔵 ││     (unread indicator)
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ 👤  Candidate Name      เมื่อวาน ││
│  │     📋 Another Job              ││
│  │     You: Thanks for...         ││  ← "You:" prefix for own messages
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ ...                             ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

## Conversation Item Elements

| Element | Condition | Tailwind Classes |
|---------|-----------|------------------|
| Avatar | always | `w-12 h-12 rounded-full` |
| Participant name | always | `font-medium text-gray-900` |
| Job context | `jobContext !== null` | `text-xs text-secondary-600 flex items-center gap-1` |
| Message preview | always | `text-sm text-gray-600 truncate max-w-[200px]` |
| Timestamp | always | `text-xs text-gray-400` |
| Unread dot | `unreadCount > 0` | `w-2.5 h-2.5 bg-primary rounded-full` |
| Unread count badge | `unreadCount > 1` | `bg-primary text-white text-xs px-1.5 rounded-full` |

### Message Preview Prefix

| Condition | Prefix (Thai) | English |
|-----------|---------------|---------|
| Last message from current user | "คุณ: " | "You: " |
| Last message from other party | — (no prefix) | — |
| Attachment only | "📎 ไฟล์แนบ" | "📎 Attachment" |
| Image only | "🖼️ รูปภาพ" | "🖼️ Image" |
| Appointment card | "📅 นัดหมาย" | "📅 Appointment" |

### Timestamp Display

| Time Difference | Display (Thai) | English |
|-----------------|----------------|---------|
| < 1 minute | "เมื่อกี้" | Just now |
| < 1 hour | "{n} นาที" | {n}m |
| < 24 hours | "{HH:mm}" | {HH:mm} |
| Yesterday | "เมื่อวาน" | Yesterday |
| < 7 days | "{day}" | {day} (จ, อ, พ... / Mon, Tue...) |
| Same year | "{D} {MMM}" | {D} {MMM} (15 ธ.ค. / 15 Dec) |
| Different year | "{D}/{M}/{YY}" | {D}/{M}/{YY} |

## State Transitions

| Current State | Event | Next State | Visual Change |
|---------------|-------|------------|---------------|
| default | hover item | hover | `bg-gray-50` |
| hover | mouse leave | default | remove bg |
| default | click item | selected | `bg-secondary-50 border-l-2 border-secondary-500` |
| selected | click different | selected (new) | move selection |
| * | new message received | * | move conversation to top, update preview |

## Empty States

| Condition | Message (Thai) | English |
|-----------|----------------|---------|
| No conversations | "ยังไม่มีข้อความ" | No messages yet |
| Search no results | "ไม่พบข้อความที่ค้นหา" | No messages found |

## Accessibility

| Element | Attribute | Value |
|---------|-----------|-------|
| List container | `role` | `listbox` |
| List container | `aria-label` | "รายการสนทนา" / "Conversations" |
| Conversation item | `role` | `option` |
| Conversation item | `aria-selected` | `true` / `false` |
| Unread indicator | `aria-label` | "{n} ข้อความที่ยังไม่ได้อ่าน" / "{n} unread messages" |

---

# 2. MessageThread

## Description

Displays the message history for a conversation with infinite scroll, date separators, and real-time updates.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| messages | `Message[]` | yes | — | Message list |
| currentUserId | `string` | yes | — | Current user for alignment |
| participant | `Participant` | yes | — | Other party info |
| loading | `boolean` | no | `false` | Initial loading |
| loadingMore | `boolean` | no | `false` | Loading older messages |
| hasMore | `boolean` | no | `false` | More messages available |
| onLoadMore | `() => void` | no | — | Load more handler |
| onRetry | `(messageId: string) => void` | no | — | Retry failed message |

### Message Type

| Property | Type | Description |
|----------|------|-------------|
| id | `string` | Message identifier |
| senderId | `string` | Sender's user ID |
| type | `'text'` \| `'image'` \| `'file'` \| `'appointment'` \| `'system'` | Message type |
| content | `string` | Text content or file URL |
| metadata | `object` | Type-specific data |
| timestamp | `Date` | Send time |
| status | `'sending'` \| `'sent'` \| `'delivered'` \| `'read'` \| `'failed'` | Delivery status |

## Visual Structure

```
┌─────────────────────────────────────────────┐
│              ─── 15 ธันวาคม 2024 ───        │  ← Date separator
│                                             │
│  ┌──────────────────────┐                   │  ← Incoming message (left)
│  │ สวัสดีครับ ขอบคุณที่สนใจ │                   │
│  │ ตำแหน่งนี้ครับ         │                   │
│  └──────────────────────┘                   │
│  10:30                                      │
│                                             │
│                   ┌──────────────────────┐  │  ← Outgoing message (right)
│                   │ ขอบคุณครับ รบกวนสอบถาม │  │
│                   │ เรื่องเงินเดือนได้ไหมครับ │  │
│                   └──────────────────────┘  │
│                                  10:32 ✓✓   │  ← Read receipt
│                                             │
│  ┌──────────────────────────────────────┐   │  ← Appointment card
│  │ 📅 นัดสัมภาษณ์                        │   │
│  │ 18 ธ.ค. 2024 เวลา 14:00              │   │
│  │ 📹 Video Call                        │   │
│  │ [ยืนยัน]  [ปฏิเสธ]                    │   │
│  └──────────────────────────────────────┘   │
│                                             │
│              ─── วันนี้ ───                  │  ← Today separator
│                                             │
│                   ┌──────────────────────┐  │
│                   │ ได้ครับ ขอบคุณมากครับ    │  │
│                   └──────────────────────┘  │
│                                  14:05 ✓    │  ← Delivered (not read)
│                                             │
│                   ┌──────────────────────┐  │
│                   │ Sending...           │  │  ← Sending state
│                   └──────────────────────┘  │
│                                  ○ กำลังส่ง   │
└─────────────────────────────────────────────┘
```

## Date Separator

| Condition | Display (Thai) | English |
|-----------|----------------|---------|
| Today | "วันนี้" | Today |
| Yesterday | "เมื่อวาน" | Yesterday |
| This year | "{D} {MMMM}" | {D} {MMMM} (15 ธันวาคม / 15 December) |
| Other year | "{D} {MMMM} {YYYY}" | {D} {MMMM} {YYYY} |

**Styling:**
```
text-xs text-gray-500 text-center py-4
before/after: border-t border-gray-200 flex-1
```

## Message Status Indicators

| Status | Icon | Display (Thai) | English |
|--------|------|----------------|---------|
| `sending` | ○ (spinner) | "กำลังส่ง" | Sending |
| `sent` | ✓ | — | — |
| `delivered` | ✓✓ (gray) | — | — |
| `read` | ✓✓ (teal) | — | — |
| `failed` | ⚠️ | "ส่งไม่สำเร็จ" | Failed to send |

**Failed Message Actions:**

| Action | Thai | English |
|--------|------|---------|
| Retry | "ลองใหม่" | Retry |
| Delete | "ลบ" | Delete |

## Scroll Behavior

| Event | Behavior |
|-------|----------|
| Initial load | Scroll to bottom (latest messages) |
| New message (own) | Scroll to bottom |
| New message (other) + at bottom | Scroll to bottom |
| New message (other) + scrolled up | Show "New message" indicator |
| Scroll to top | Load more messages (if `hasMore`) |
| Load more complete | Maintain scroll position |

### New Message Indicator

```
┌─────────────────────────────────────┐
│         ↓ ข้อความใหม่ (2)            │
│           New messages (2)          │
└─────────────────────────────────────┘
```

**Styling:** `fixed bottom-20 left-1/2 -translate-x-1/2 bg-secondary-600 text-white px-4 py-2 rounded-full shadow-lg`

---

# 3. MessageBubble

## Description

Individual message display with support for text, images, files, and special card types.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| message | `Message` | yes | — | Message data |
| isOwn | `boolean` | yes | — | Sent by current user |
| showAvatar | `boolean` | no | `true` | Show sender avatar |
| showTimestamp | `boolean` | no | `true` | Show time |
| onRetry | `() => void` | no | — | Retry failed message |
| onImageClick | `(url: string) => void` | no | — | Image preview handler |
| onAppointmentAction | `(action: string) => void` | no | — | Appointment action handler |

## Variants by Message Type

### Text Message

| Property | Own Message | Other's Message |
|----------|-------------|-----------------|
| Alignment | Right | Left |
| Background | `bg-secondary-600` | `bg-gray-100` |
| Text color | `text-white` | `text-gray-900` |
| Border radius | `rounded-2xl rounded-br-md` | `rounded-2xl rounded-bl-md` |
| Max width | `max-w-[70%]` | `max-w-[70%]` |

### Image Message

```
┌─────────────────────┐
│                     │
│    [Image Preview]  │  ← max-w-[280px], rounded-lg
│                     │
└─────────────────────┘
```

- Click to open full-size in DocumentViewer
- Loading: Show skeleton with aspect ratio preserved
- Error: Show placeholder with retry

### File Message

```
┌─────────────────────────────┐
│  📄  document.pdf           │
│      1.2 MB                 │
│                    [⬇️]     │  ← Download button
└─────────────────────────────┘
```

| Element | Tailwind |
|---------|----------|
| Container | `bg-gray-50 border border-gray-200 rounded-lg p-3` |
| File icon | Based on extension (📄 pdf, 📊 xlsx, 📝 doc, etc.) |
| File name | `font-medium text-gray-900 truncate` |
| File size | `text-xs text-gray-500` |
| Download | `text-secondary-600 hover:text-secondary-700` |

### Appointment Card

```
┌──────────────────────────────────────┐
│  📅 นัดสัมภาษณ์ / Interview Scheduled │
│                                      │
│  📆 18 ธันวาคม 2024                   │
│  🕐 14:00 - 15:00 (1 ชั่วโมง)         │
│  📹 Video Call                       │
│  🔗 https://meet.google.com/...      │
│                                      │
│  ┌────────────┐  ┌────────────┐      │  ← Actions (for recipient)
│  │   ยืนยัน    │  │   ปฏิเสธ   │      │
│  │  Confirm   │  │  Decline   │      │
│  └────────────┘  └────────────┘      │
└──────────────────────────────────────┘
```

**Appointment Card States:**

| Status | Display | Actions Available |
|--------|---------|-------------------|
| `pending` | "รอการยืนยัน" / Pending | Confirm, Decline |
| `confirmed` | "ยืนยันแล้ว" ✓ (success badge) | — |
| `declined` | "ปฏิเสธแล้ว" ✕ (problem badge) | — |
| `cancelled` | "ยกเลิกแล้ว" (neutral badge) | — |
| `completed` | "เสร็จสิ้น" (neutral badge) | — |

### System Message

```
        ─── ระบบ: การสนทนาเริ่มต้นแล้ว ───
            System: Conversation started
```

| Type | Message (Thai) | English |
|------|----------------|---------|
| `conversation_started` | "เริ่มการสนทนา" | Conversation started |
| `application_accepted` | "ใบสมัครได้รับการตอบรับ" | Application accepted |
| `interview_scheduled` | "นัดสัมภาษณ์เรียบร้อย" | Interview scheduled |
| `interview_confirmed` | "ยืนยันนัดสัมภาษณ์แล้ว" | Interview confirmed |
| `interview_cancelled` | "ยกเลิกนัดสัมภาษณ์" | Interview cancelled |

**Styling:** `text-xs text-gray-500 text-center py-2`

## Link Detection

URLs in text messages are automatically detected and rendered as clickable links:

| Pattern | Behavior |
|---------|----------|
| `https?://...` | Clickable link, opens in new tab |
| `meet.google.com/...` | Show "เข้าร่วมประชุม" / "Join meeting" button |
| `zoom.us/...` | Show "เข้าร่วมประชุม" / "Join meeting" button |

---

# 4. ChatInput

## Description

Message composition input with support for text, attachments, and quick actions.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| onSend | `(message: MessageInput) => void` | yes | — | Send handler |
| onTyping | `() => void` | no | — | Typing indicator handler |
| disabled | `boolean` | no | `false` | Disable input |
| placeholder | `string` | no | "พิมพ์ข้อความ..." | Input placeholder |
| maxLength | `number` | no | `2000` | Character limit |
| allowAttachments | `boolean` | no | `true` | Enable file attachments |
| quickActions | `QuickAction[]` | no | — | Quick action buttons |

### QuickAction Type

| Property | Type | Description |
|----------|------|-------------|
| id | `string` | Action identifier |
| label | `string` | Button label |
| icon | `ReactNode` | Button icon |
| onClick | `() => void` | Action handler |

## Visual Structure

```
┌─────────────────────────────────────────────────────┐
│  [📅 นัดสัมภาษณ์]                                    │  ← Quick actions (optional)
├─────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────┐  │
│  │ 📎 document.pdf                          [✕]  │  │  ← Attachment preview
│  └───────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────┤
│  [📎]  พิมพ์ข้อความ...                        [➤]  │  ← Input row
│        Type a message...                           │
└─────────────────────────────────────────────────────┘
```

## Elements

| Element | Condition | Tailwind |
|---------|-----------|----------|
| Quick actions row | `quickActions.length > 0` | `flex gap-2 px-4 py-2 border-b` |
| Quick action button | — | `text-sm text-secondary-600 border border-secondary-200 rounded-full px-3 py-1 hover:bg-secondary-50` |
| Attachment preview | `attachments.length > 0` | `bg-gray-50 px-4 py-2` |
| Attachment item | — | `flex items-center gap-2 bg-white border rounded px-2 py-1` |
| Remove attachment | — | `text-gray-400 hover:text-gray-600` |
| Input container | — | `flex items-end gap-2 px-4 py-3 border-t` |
| Attach button | `allowAttachments` | `p-2 text-gray-400 hover:text-gray-600` |
| Text input | — | `flex-1 resize-none max-h-32 border-0 focus:ring-0` |
| Send button | — | `p-2 text-secondary-600 hover:text-secondary-700 disabled:text-gray-300` |

## Send Button State

| Condition | State | Tailwind |
|-----------|-------|----------|
| Empty input + no attachments | disabled | `text-gray-300 cursor-not-allowed` |
| Has text or attachments | enabled | `text-secondary-600 hover:text-secondary-700` |
| Sending | loading | Show spinner |

## Quick Actions by Context

### Company → Candidate

| Action | Thai | English | Icon |
|--------|------|---------|------|
| `schedule_interview` | นัดสัมภาษณ์ | Schedule Interview | 📅 |
| `request_documents` | ขอเอกสารเพิ่มเติม | Request Documents | 📄 |

### Candidate → Company

| Action | Thai | English | Icon |
|--------|------|---------|------|
| `ask_status` | สอบถามสถานะ | Ask Status | ❓ |

## Attachment Handling

### Allowed File Types

| Category | Extensions | Max Size |
|----------|------------|----------|
| Documents | pdf, doc, docx | 10 MB |
| Images | jpg, jpeg, png, gif | 5 MB |
| Spreadsheets | xls, xlsx | 10 MB |

### Upload Flow

| Step | State | Event | Next State | Side Effect |
|------|-------|-------|------------|-------------|
| 1 | idle | click attach | selecting | open file picker |
| 2 | selecting | file selected | validating | — |
| 3 | validating | valid file | uploading | show progress |
| 3 | validating | invalid (size) | idle | toast: "ไฟล์ใหญ่เกินไป (สูงสุด {n} MB)" / "File too large (max {n} MB)" |
| 3 | validating | invalid (type) | idle | toast: "ประเภทไฟล์ไม่รองรับ" / "File type not supported" |
| 4 | uploading | complete | attached | show preview |
| 4 | uploading | error | idle | toast: "อัปโหลดไม่สำเร็จ" / "Upload failed" |
| 5 | attached | remove click | idle | remove from list |
| 5 | attached | send click | sending | send message with attachment |

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Enter | Send message (if not empty) |
| Shift + Enter | New line |
| Escape | Clear input / close attachment preview |

## Character Limit

| Count | Display |
|-------|---------|
| < 1800 | Hidden |
| 1800-2000 | Show count `{current}/{max}` in gray |
| 1950-2000 | Show count in amber |
| = 2000 | Show count in red, prevent further input |

---

# 5. TypingIndicator

## Description

Shows when the other party is typing a message.

## Visual Structure

```
┌──────────────────┐
│  ●  ●  ●         │  ← Animated dots
└──────────────────┘
  กำลังพิมพ์...
  Typing...
```

## Animation

Three dots with staggered bounce animation:

```css
@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-4px); }
}

.dot-1 { animation: typing 1s infinite 0ms; }
.dot-2 { animation: typing 1s infinite 150ms; }
.dot-3 { animation: typing 1s infinite 300ms; }
```

## Display Logic

| Event | Action |
|-------|--------|
| Receive typing signal | Show indicator |
| No signal for 3s | Hide indicator |
| Receive message | Hide indicator |

---

# 6. ChatHeader

## Description

Header bar for the active conversation showing participant info and actions.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| participant | `Participant` | yes | — | Other party info |
| jobContext | `JobContext` | no | — | Related job |
| onBack | `() => void` | no | — | Back button handler (mobile) |
| onViewProfile | `() => void` | no | — | View profile handler |
| onViewJob | `() => void` | no | — | View job handler |
| actions | `ActionConfig[]` | no | — | Additional actions |

## Visual Structure

```
┌─────────────────────────────────────────────────────────┐
│  [←]  👤 Participant Name              [👁] [⋮]        │
│       📋 Job Title                                     │
│       🟢 ออนไลน์ / Online                              │
└─────────────────────────────────────────────────────────┘
```

## Elements

| Element | Condition | Action |
|---------|-----------|--------|
| Back button | mobile only | `onBack` |
| Avatar | always | `onViewProfile` |
| Name | always | `onViewProfile` |
| Job context | `jobContext !== null` | `onViewJob` |
| Online status | `participant.isOnline` | — |
| View profile | desktop | `onViewProfile` |
| More actions | `actions.length > 0` | show menu |

## Online Status

| Status | Display (Thai) | English | Tailwind |
|--------|----------------|---------|----------|
| Online | "ออนไลน์" | Online | `text-green-600` + 🟢 |
| Offline | "ออฟไลน์" | Offline | `text-gray-400` |
| Last seen | "ออนไลน์เมื่อ {time}" | Last seen {time} | `text-gray-400` |

---

# 7. Shared Patterns

## Chat Layout

### Desktop (Two-Panel)

```
┌──────────────────┬──────────────────────────────────────┐
│                  │  ChatHeader                          │
│  ConversationList├──────────────────────────────────────┤
│                  │                                      │
│  [Search]        │  MessageThread                       │
│                  │                                      │
│  [Conv 1]        │                                      │
│  [Conv 2] ●      │                                      │
│  [Conv 3]        │                                      │
│                  ├──────────────────────────────────────┤
│                  │  ChatInput                           │
└──────────────────┴──────────────────────────────────────┘
     280px                    flex-1
```

### Mobile (Single Panel with Navigation)

| View | Content |
|------|---------|
| List view | ConversationList (full screen) |
| Chat view | ChatHeader + MessageThread + ChatInput |
| Transition | Slide left/right |

## Real-time Updates

| Event | Source | Action |
|-------|--------|--------|
| New message | WebSocket | Add to thread, update conversation list |
| Typing indicator | WebSocket | Show/hide TypingIndicator |
| Read receipt | WebSocket | Update message status |
| Online status | WebSocket | Update participant status |

## Accessibility

| Element | Attribute | Value |
|---------|-----------|-------|
| Chat container | `role` | `log` |
| Chat container | `aria-live` | `polite` |
| Message | `role` | `article` |
| Own message | `aria-label` | "คุณ: {preview}" / "You: {preview}" |
| Other message | `aria-label` | "{name}: {preview}" |
| Input | `aria-label` | "พิมพ์ข้อความ" / "Type a message" |
| Send button | `aria-label` | "ส่งข้อความ" / "Send message" |

---

*End of Chat Organism Specification*
