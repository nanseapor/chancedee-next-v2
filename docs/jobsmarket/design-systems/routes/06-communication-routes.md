# ChanceDee Layout Component Specification
## Section 7: Communication Routes (2 routes)

**Version:** 2.0  
**Date:** December 2024

---

## 7.1 `/chat` - Messaging Center

**Shell:** Candidate Shell or Company Shell (based on user role)  
**Purpose:** Real-time chat between candidates and companies with interview scheduling

### Key Behaviors
- Chat rooms are **auto-created** when a company accepts an application
- Companies can schedule interviews via special appointment card messages
- Messages queue when offline and sync when back online

---

### Desktop Layout (Two-Panel)

```
┌─────────────────────────────────────────────────────────────────┐
│                         Chat Header                              │
├────────────────────┬────────────────────────────────────────────┤
│                    │                                            │
│  Conversation      │           Active Chat Window               │
│  List              │                                            │
│  (300px)           │                                            │
│                    │                                            │
│                    │                                            │
│                    ├────────────────────────────────────────────┤
│                    │           Message Input Area               │
└────────────────────┴────────────────────────────────────────────┘
```

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Chat Header** | Page title | Top | - | - | "ข้อความ" |
| **Conversation List** | All chats | Left, 300px | Full-screen mobile | - | - |
| ↳ Search Bar | Find conversations | Top | - | Search | Search by name |
| ↳ Conversation Items | Chat list | Scrollable | - | - | - |
| ↳↳ Conversation Item | Single chat | Row | - | Select chat | Clickable |
| ↳↳↳ Avatar | Photo | Left, 48px | - | - | Company logo / Candidate photo |
| ↳↳↳ Name | Party name | Top | - | - | Truncate > 20 chars |
| ↳↳↳ Position Context | Job title | Below name | - | - | Small text |
| ↳↳↳ Last Message | Preview | Below position | - | - | Truncate > 30 chars |
| ↳↳↳ Timestamp | Relative time | Top-right | - | - | - |
| ↳↳↳ Unread Badge | Count | Right | - | - | Hide if 0 |
| ↳↳↳ Appointment Icon | 📅 | Right | - | - | If pending appointment |
| **Active Chat Window** | Selected chat | Right, flex | Full-screen mobile | - | - |
| ↳ Chat Header | Conversation info | Top, sticky | - | - | - |
| ↳↳ Avatar | Photo | Left | - | - | - |
| ↳↳ Name | Party name | Center | - | → profile | Link to profile |
| ↳↳ Position | Job context | Below name | - | - | - |
| ↳↳ Status | Online/Offline | - | - | - | Green dot if online |
| ↳↳ Actions Menu | ⋮ | Right | - | Opens menu | View profile, Report |
| ↳ Message Thread | Messages | Scrollable | - | - | - |
| ↳↳ Message Bubble | Single message | - | - | - | See below |
| ↳↳ Appointment Card | Interview invite | - | - | - | See below |
| ↳↳ Date Divider | Day separator | Center | - | - | "วันนี้", "เมื่อวาน", date |
| ↳ Input Area | Compose | Bottom, sticky | - | - | - |
| ↳↳ Attach Button | File upload | Left | - | Opens file picker | 📎 icon |
| ↳↳ Text Input | Message text | Center | - | - | Multiline, auto-grow |
| ↳↳ Schedule Button | Interview (Company) | Right | - | Opens schedule modal | Company only, "นัดสัมภาษณ์" |
| ↳↳ Send Button | Send message | Right | - | Send message | Arrow icon |

---

### Message Bubble Component

| Component | Purpose | Position | Action | Notes/Edge Case |
|-----------|---------|----------|--------|-----------------|
| **Own Message** | Sent by user | Right-aligned | - | Teal background |
| ↳ Message Text | Content | - | - | - |
| ↳ Timestamp | Send time | Bottom-right | - | Small text |
| ↳ Read Receipt | ✓✓ | Bottom-right | - | Double check if read |
| ↳ Retry Button | If failed | - | Retry send | ↻ icon |
| **Other Message** | Received | Left-aligned | - | Gray background |
| ↳ Avatar | Small photo | Left | - | - |
| ↳ Message Text | Content | - | - | - |
| ↳ Timestamp | Receive time | Bottom-left | - | - |

### File Attachment Message

| Component | Purpose | Position | Action |
|-----------|---------|----------|--------|
| File Icon | Type indicator | Left | - |
| File Name | Name | Center | - |
| File Size | KB/MB | Below name | - |
| Download Button | Download file | Right | Download file |
| Preview | If image | Thumbnail | Opens lightbox |

---

### Interview Appointment Card (Special Message Type)

**Created by:** Company only  
**Purpose:** Structured interview scheduling within chat

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Appointment Card** | Interview invite | Full-width in chat | Same | - | Distinct border style |
| ↳ Card Header | Type indicator | Top | - | - | "📅 นัดสัมภาษณ์" |
| ↳ Date Row | Interview date | - | - | - | Thai format |
| ↳↳ Calendar Icon | 📅 | Left | - | - | - |
| ↳↳ Date | "วันพุธที่ 15 ธ.ค. 2567" | - | - | - | - |
| ↳ Time Row | Time slot | - | - | - | - |
| ↳↳ Clock Icon | 🕐 | Left | - | - | - |
| ↳↳ Time | "14:00 - 15:00 น." | - | - | - | - |
| ↳ Type Row | Interview type | - | - | - | - |
| ↳↳ Type Icon | 📹/📞/🏢 | Left | - | - | Video/Phone/In-person |
| ↳↳ Type Label | "สัมภาษณ์ทางวิดีโอ" | - | - | - | - |
| ↳ Location/Link | Where/How | - | - | - | - |
| ↳↳ Link | Video call URL | - | - | ↗ External | If video |
| ↳↳ Address | Office address | - | - | ↗ Maps | If in-person |
| ↳ Notes | Additional info | - | - | - | Optional |
| ↳ Status Badge | Current status | Top-right | - | - | - |
| ↳ Action Buttons | Candidate response | Bottom | - | - | Candidate only |
| ↳↳ Accept Button | "ยืนยัน" | Left | - | Accept appointment | Teal |
| ↳↳ Decline Button | "ปฏิเสธ" | Right | - | Decline appointment | Gray/Red |

### Appointment Status States

| Status | Thai | Badge Color | Candidate Actions |
|--------|------|-------------|-------------------|
| Pending | รอการยืนยัน | Yellow | Accept, Decline |
| Confirmed | ยืนยันแล้ว | Green | None (can message) |
| Declined | ถูกปฏิเสธ | Red | None |
| Cancelled | ยกเลิก | Gray | None |
| Rescheduled | เลื่อนนัด | Blue | New card sent |
| Completed | เสร็จสิ้น | Gray | None |
| No-show | ไม่มา | Red | None (company marks) |

---

### Schedule Interview Modal (Company Only)

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Schedule Modal** | Create appointment | Center overlay | Full-screen mobile | - | - |
| ↳ Modal Header | Title | Top | - | - | "นัดสัมภาษณ์" |
| ↳ Close Button | × | Top-right | - | Close modal | - |
| ↳ Date Picker | Select date | - | - | Select date | Min: today |
| ↳ Time Picker | Select time | - | - | - | - |
| ↳↳ Start Time | เวลาเริ่ม | Left | - | Select time | - |
| ↳↳ End Time | เวลาสิ้นสุด | Right | - | Select time | - |
| ↳ Type Selector | Interview type | - | - | - | - |
| ↳↳ Video Call | สัมภาษณ์ทางวิดีโอ | - | - | Select | Shows link field |
| ↳↳ Phone Call | สัมภาษณ์ทางโทรศัพท์ | - | - | Select | Shows phone field |
| ↳↳ In-person | สัมภาษณ์ที่บริษัท | - | - | Select | Shows address |
| ↳ Link/Location | Based on type | - | - | - | - |
| ↳ Notes | Additional info | Textarea | - | - | Optional |
| ↳ Send Button | "ส่งนัดหมาย" | Bottom | - | Send appointment | - |

---

### Mobile Layout

| Component | Purpose | Position | Action |
|-----------|---------|----------|--------|
| **List View** | Conversation list | Full-screen | - |
| ↳ Same as desktop list | - | - | - |
| **Chat View** | Active conversation | Full-screen (tap to enter) | - |
| ↳ Back Button | ← | Top-left | Returns to list |
| ↳ Same as desktop chat | - | - | - |

---

### Empty States

| State | For | Display | CTA |
|-------|-----|---------|-----|
| No conversations (Candidate) | New users | "ยังไม่มีข้อความ" + explanation | → applications "ไปที่ใบสมัคร" |
| No conversations (Company) | New companies | "ยังไม่มีข้อความ" | → applications "ดูใบสมัคร" |
| No selected chat | Desktop | "เลือกการสนทนาเพื่อเริ่มแชท" | - |

**Candidate Empty State Explanation:**
"เมื่อบริษัทตอบรับใบสมัครของคุณ คุณจะสามารถแชทกับบริษัทได้ที่นี่"

---

### Exception Components

| Exception | Display | Action |
|-----------|---------|--------|
| Conversation not found | Redirect to list | Toast error |
| Other party deleted | Disabled chat | "ผู้ใช้ลบบัญชีแล้ว" |
| Other party blocked/suspended | Disabled chat | "ไม่สามารถส่งข้อความได้" |
| Message send failed | Retry indicator | ↻ button on message |
| Message queued (offline) | "รอส่ง" badge | Auto-send when online |
| File upload failed | Toast + retry | Retry |
| File too large (>10MB) | Block | "ไฟล์ใหญ่เกิน 10MB" |
| Invalid file type | Block | "ไม่รองรับไฟล์ประเภทนี้" |
| WebSocket disconnected | Reconnecting banner | Auto-reconnect |
| Long disconnect (>30s) | Warning banner | "ขาดการเชื่อมต่อ" |
| Message rate limit | Temporary block | "กรุณารอสักครู่" |

### Appointment-Specific Exceptions

| Exception | Display | Action |
|-----------|---------|--------|
| Schedule in past | "เลือกเวลาในอนาคต" | - |
| Conflicting appointment | Warning modal with existing | Choose to proceed or cancel |
| Accept/Decline failed | Toast + retry | Retry |
| Already responded | Toast "ตอบกลับแล้ว" | - |
| Appointment cancelled | Status update in card | - |
| Past appointment | Disable action buttons, gray | - |

---

### Offline Behavior

| Feature | Offline Behavior |
|---------|------------------|
| View conversations | Show cached list |
| View messages | Show cached messages |
| Send message | Queue with "รอส่ง" indicator |
| Send file | Block until online |
| Schedule interview | Block until online |
| Respond to appointment | Queue |

**Back Online Sync:**
1. Reconnect WebSocket
2. Sync queued messages
3. Update read receipts
4. Refresh conversation list
5. Show "กลับมาออนไลน์แล้ว" banner (3s)

---

## 7.2 `/notifications` - Notification Center

**Shell:** Candidate Shell or Company Shell (based on user role)  
**Purpose:** Unified notification view

### Layout

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Page Header** | Title + actions | Top | - | - | - |
| ↳ Title | "การแจ้งเตือน" | Left | - | - | - |
| ↳ Mark All Read | "อ่านทั้งหมด" | Right | - | Mark all read | If any unread |
| ↳ Clear All | "ล้างทั้งหมด" | Right | - | Clear all | Confirmation |
| ↳ Settings Link | ⚙️ | Right | - | → /auth/settings?tab=notifications | - |
| **Filter Tabs** | Category filter | Below header | Horizontal scroll | - | - |
| ↳ ทั้งหมด | All | - | - | Filter | Default |
| ↳ ใบสมัคร | Applications | - | - | Filter | - |
| ↳ ข้อความ | Messages | - | - | Filter | - |
| ↳ การนัดหมาย | Appointments | - | - | Filter | - |
| ↳ ระบบ | System | - | - | Filter | - |
| **Notification List** | Notifications | Main | - | - | - |
| ↳ Notification Item | Single notification | Full-width | - | Navigate | Clickable |
| ↳↳ Type Icon | Category icon | Left | - | - | Color-coded |
| ↳↳ Title | Notification title | Top | - | - | Bold if unread |
| ↳↳ Description | Details | Below title | - | - | - |
| ↳↳ Timestamp | Relative time | Right | - | - | - |
| ↳↳ Unread Dot | Indicator | Left | - | - | Blue dot |
| ↳↳ Action Arrow | → | Right | - | - | - |
| **Load More** | Pagination | Bottom | - | Load more | Infinite scroll or button |

### Notification Types

| Type | Icon | Color | Example Title | Click Action |
|------|------|-------|---------------|--------------|
| Application Status | 📄 | Blue | "บริษัท ABC ดูใบสมัครของคุณแล้ว" | → Application detail |
| New Application | 📄 | Teal | "มีใบสมัครใหม่สำหรับ Software Engineer" | → Application inbox |
| New Message | 💬 | Green | "คุณมีข้อความใหม่จาก บริษัท XYZ" | → /chat |
| Appointment | 📅 | Orange | "นัดสัมภาษณ์ใหม่จาก บริษัท ABC" | → /chat (appointment card) |
| Appointment Reminder | 🔔 | Orange | "การสัมภาษณ์ในอีก 1 ชั่วโมง" | → /chat |
| System | ⚙️ | Gray | "โปรไฟล์ของคุณได้รับการยืนยันแล้ว" | Varies |
| Job Alert | 🔔 | Teal | "พบงานใหม่ที่ตรงกับความสนใจ" | → /jobs |
| Profile Reminder | 👤 | Yellow | "โปรไฟล์ของคุณยังไม่สมบูรณ์" | → Profile |

### Notification Item States

| State | Display |
|-------|---------|
| Unread | Bold title, blue dot |
| Read | Normal weight, no dot |
| Clicked | Subtle background change |
| Expired/Invalid | Disabled click, gray text |

### Empty States

| Filter | Display |
|--------|---------|
| All empty | "ยังไม่มีการแจ้งเตือน" |
| Category empty | "ไม่มีการแจ้งเตือนประเภทนี้" |

### Exception Components

| Exception | Display | Action |
|-----------|---------|--------|
| Mark read failed | Toast error | Retry |
| Clear all failed | Toast error | Retry |
| Linked content deleted | "เนื้อหาไม่พร้อมใช้งาน", disabled link | - |
| Load more failed | Retry button | Retry |

---

### Real-time Updates

Both `/chat` and `/notifications` support real-time updates via WebSocket:

| Event | Behavior |
|-------|----------|
| New message | Add to chat, update conversation list, increment unread |
| Message read | Update read receipts |
| New notification | Add to list, update badge count |
| Appointment update | Update card status in chat |
| User online/offline | Update status indicator |

### Badge Counts (Global)

| Location | What it shows |
|----------|---------------|
| Chat nav item | Total unread messages |
| Notifications nav item | Total unread notifications |
| Chat FAB | Total unread messages |
| Bottom tab (mobile) | Combined unread |

---

*End of Section 7: Communication Routes*
