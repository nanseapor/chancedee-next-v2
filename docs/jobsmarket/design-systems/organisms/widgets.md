# Widgets

## Overview

Widget components are self-contained UI blocks that display summarized information or provide quick actions. Widgets are primarily used in dashboard sidebars and content areas.

**Design Reference:** See `chancedee-design-guidelines.md` for colors, typography, and badge variants.

---

# 1. AppointmentWidget

## Description

Displays upcoming interviews and appointments. Shows a compact list with quick access to details and actions.

## Variants

| Variant | Description | Tailwind Classes |
|---------|-------------|------------------|
| `sidebar` | Compact for sidebar | `w-full max-w-[280px]` |
| `card` | Dashboard card | `w-full` |

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| appointments | `Appointment[]` | yes | — | Appointment list |
| variant | `'sidebar'` \| `'card'` | no | `'sidebar'` | Layout variant |
| maxItems | `number` | no | `3` | Maximum items to show |
| viewerType | `'candidate'` \| `'company'` | yes | — | Context for display |
| onViewAll | `() => void` | no | — | View all handler |
| onAppointmentClick | `(id: string) => void` | no | — | Item click handler |

## Visual Structure

```
┌─────────────────────────────────────┐
│  📅 การนัดหมายที่กำลังจะถึง           │  ← Header
│     Upcoming Appointments           │
├─────────────────────────────────────┤
│  ┌─────────────────────────────────┐│
│  │ 15    Interview Title           ││  ← Appointment item
│  │ ธ.ค.  Company/Candidate Name    ││
│  │       10:00 - 11:00  📹         ││
│  │       [🔔 รอยืนยัน]              ││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ 18    Another Interview         ││
│  │ ธ.ค.  ...                       ││
│  └─────────────────────────────────┘│
│                                     │
│  ดูทั้งหมด (5) →                    │  ← View all link
│  View all (5)                       │
└─────────────────────────────────────┘
```

## Appointment Item Elements

| Element | Candidate View | Company View | Tailwind |
|---------|----------------|--------------|----------|
| Date badge | Day + Month (Thai) | Day + Month (Thai) | `bg-secondary-100 text-secondary-700 rounded p-2 text-center` |
| Title | Job title | Job title | `font-medium text-gray-900` |
| Party name | Company name | Candidate name | `text-sm text-gray-600` |
| Time | Start - End | Start - End | `text-sm text-gray-500` |
| Type icon | 📹 / 📞 / 📍 | 📹 / 📞 / 📍 | — |
| Status badge | See mapping | See mapping | Badge variant |

### Appointment Type Icons

| Type | Icon | Label (Thai) | English |
|------|------|--------------|---------|
| `video` | 📹 | วิดีโอคอล | Video Call |
| `phone` | 📞 | โทรศัพท์ | Phone |
| `in_person` | 📍 | พบตัว | In-person |

### Appointment Status Badge Mapping

| Status | Thai | English | → Badge Variant |
|--------|------|---------|-----------------|
| `scheduled` | รอยืนยัน | Pending Confirmation | `waiting` + 🔔 |
| `confirmed` | ยืนยันแล้ว | Confirmed | `success` |
| `cancelled` | ยกเลิก | Cancelled | `neutral` |
| `completed` | เสร็จสิ้น | Completed | `neutral` |

## Display Conditions

| Condition | → Render |
|-----------|----------|
| `appointments.length > 0` | Appointment list |
| `appointments.length === 0` | Empty state |

### Empty State

| Viewer | Message (Thai) | English | Icon |
|--------|----------------|---------|------|
| Candidate | "ไม่มีการนัดหมายที่กำลังจะถึง" | No upcoming appointments | 📅 |
| Company | "ไม่มีการสัมภาษณ์ที่กำลังจะถึง" | No upcoming interviews | 📅 |

## State Transitions

| Current State | Event | Next State | Side Effect |
|---------------|-------|------------|-------------|
| default | click appointment | — | trigger `onAppointmentClick` |
| default | click view all | — | trigger `onViewAll` or navigate to `/chat` |
| item | hover | item_hover | `bg-gray-50` |

## Accessibility

| Element | Attribute | Value |
|---------|-----------|-------|
| Widget container | `role` | `region` |
| Widget container | `aria-label` | "การนัดหมายที่กำลังจะถึง" / "Upcoming appointments" |
| Appointment item | `role` | `button` |
| Status badge | `role` | `status` |
| View all link | `aria-label` | "ดูการนัดหมายทั้งหมด {n} รายการ" / "View all {n} appointments" |

---

# 2. ProfileCompletionCard

## Description

Shows profile completion progress with a visual ring and checklist of incomplete sections. Encourages users to complete their profile.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| percentage | `number` | yes | — | Completion percentage (0-100) |
| sections | `ProfileSection[]` | yes | — | Section completion status |
| onSectionClick | `(sectionId: string) => void` | no | — | Section click handler |
| variant | `'full'` \| `'compact'` | no | `'full'` | Layout variant |

### ProfileSection Type

| Property | Type | Description |
|----------|------|-------------|
| id | `string` | Section identifier |
| label | `string` | Section name |
| complete | `boolean` | Is section complete |
| required | `boolean` | Is section required |

## Variants

| Variant | Description | Use Case |
|---------|-------------|----------|
| `full` | Ring + checklist + CTA | Dashboard main area |
| `compact` | Ring only with percentage | Sidebar, header |

## Visual Structure (Full)

```
┌─────────────────────────────────────┐
│  โปรไฟล์ของคุณ                       │
│  Your Profile                       │
├─────────────────────────────────────┤
│                                     │
│        ┌───────────┐                │
│        │           │                │
│        │    65%    │                │  ← Completion ring
│        │           │                │
│        └───────────┘                │
│                                     │
│  ☑ ข้อมูลส่วนตัว                     │  ← Completed
│  ☑ ประสบการณ์ทำงาน                   │  ← Completed
│  ☐ การศึกษา *                       │  ← Incomplete (required)
│  ☐ ทักษะ *                          │  ← Incomplete (required)
│  ☐ เรซูเม่                          │  ← Incomplete (optional)
│                                     │
│  [แก้ไขโปรไฟล์]                      │
│  Edit Profile                       │
└─────────────────────────────────────┘
```

## Completion Ring Colors

| Percentage | Ring Color | Background |
|------------|------------|------------|
| 0-29% | `text-red-500` | `text-red-100` |
| 30-69% | `text-amber-500` | `text-amber-100` |
| 70-99% | `text-green-500` | `text-green-100` |
| 100% | `text-secondary-500` | `text-secondary-100` |

## Section Display

| State | Icon | Text Style | Tailwind |
|-------|------|------------|----------|
| Complete | ☑ (checkmark) | Normal | `text-gray-600` |
| Incomplete (required) | ☐ (empty) | With asterisk | `text-gray-900 font-medium` |
| Incomplete (optional) | ☐ (empty) | Normal | `text-gray-600` |
| Hover | — | Underline | `hover:underline cursor-pointer` |

## Profile Sections

| Section ID | Label (Thai) | English | Required |
|------------|--------------|---------|----------|
| `personal` | ข้อมูลส่วนตัว | Personal Info | ✅ |
| `experience` | ประสบการณ์ทำงาน | Work Experience | ❌ |
| `education` | การศึกษา | Education | ✅ |
| `skills` | ทักษะ | Skills | ✅ |
| `resume` | เรซูเม่ | Resume | ❌ |
| `preferences` | ความต้องการงาน | Job Preferences | ❌ |

## Display Conditions

| Percentage | Variant | Message |
|------------|---------|---------|
| 100% | `full` | "โปรไฟล์สมบูรณ์แล้ว! 🎉" (Profile complete!) |
| < 100% | `full` | Show incomplete sections |
| < 30% | `full` | Priority message: "กรอกข้อมูลเพื่อให้บริษัทค้นพบคุณ" (Complete to be discovered) |

## State Transitions

| Current State | Event | Next State | Side Effect |
|---------------|-------|------------|-------------|
| default | click section | — | navigate to profile section |
| default | click CTA | — | navigate to profile edit page |
| ring | hover | ring_hover | show tooltip with percentage |

---

# 3. ChatDrawer

## Description

A floating mini-chat interface triggered by the Chat FAB. Allows quick messaging without leaving the current page.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| open | `boolean` | yes | — | Drawer visibility |
| onClose | `() => void` | yes | — | Close handler |
| onExpand | `() => void` | no | — | Expand to full chat |
| conversations | `Conversation[]` | yes | — | Conversation list |
| unreadCount | `number` | no | `0` | Total unread messages |

## Visual Structure

```
┌─────────────────────────────────────┐
│  ข้อความ           [↗] [✕]         │  ← Header: title, expand, close
│  Messages                           │
├─────────────────────────────────────┤
│  🔍 ค้นหาข้อความ...                 │  ← Search input
├─────────────────────────────────────┤
│  ┌─────────────────────────────────┐│
│  │ 🏢  Company Name          14:30 ││  ← Conversation item
│  │     Last message preview...  🔵 ││     (unread indicator)
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ 🏢  Another Company       เมื่อวาน││
│  │     You: Thanks for...         ││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ ...                             ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

## Dimensions

| Property | Value |
|----------|-------|
| Width | `400px` |
| Height | `500px` (max) |
| Position | Bottom-right, fixed |
| Offset | `24px` from edges |

## Conversation Item Elements

| Element | Condition | Tailwind |
|---------|-----------|----------|
| Avatar | always | `w-10 h-10 rounded-full` |
| Name | always | `font-medium text-gray-900` |
| Preview | always | `text-sm text-gray-600 truncate` |
| Timestamp | always | `text-xs text-gray-400` |
| Unread dot | `unread > 0` | `w-2 h-2 bg-primary rounded-full` |
| Unread highlight | `unread > 0` | `bg-primary-50` |

### Timestamp Display

| Time Difference | Display (Thai) | English |
|-----------------|----------------|---------|
| < 1 minute | "เมื่อกี้" | Just now |
| < 1 hour | "{n} นาที" | {n}m |
| < 24 hours | "{HH:mm}" | {HH:mm} |
| Yesterday | "เมื่อวาน" | Yesterday |
| < 7 days | "{day}" | {day} (Mon, Tue...) |
| Older | "{DD/MM}" | {DD/MM} |

## Empty States

| Condition | Message (Thai) | English |
|-----------|----------------|---------|
| No conversations | "ยังไม่มีข้อความ" | No messages yet |
| Search no results | "ไม่พบข้อความที่ค้นหา" | No messages found |

## State Transitions

| Current State | Event | Next State | Visual Change |
|---------------|-------|------------|---------------|
| closed | FAB click | open | slide up from FAB position |
| open | close click | closed | slide down to FAB |
| open | expand click | — | navigate to `/chat` |
| open | click outside | closed | slide down |
| open | conversation click | — | navigate to `/chat/{conversationId}` |

## Animation

| Event | Animation |
|-------|-----------|
| Open | `transform translateY(100%) → translateY(0)`, `opacity 0 → 1`, 200ms ease-out |
| Close | `transform translateY(0) → translateY(100%)`, `opacity 1 → 0`, 150ms ease-in |

## Mobile Behavior

On mobile, ChatDrawer becomes full-screen:
- Position: `fixed inset-0`
- Header: Back button instead of close
- Swipe down to close

---

# 4. QuickStatsRow

## Description

A row of StatCards displaying key metrics. Used at the top of dashboards for at-a-glance information.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| stats | `StatConfig[]` | yes | — | Stats to display |
| loading | `boolean` | no | `false` | Loading state |
| columns | `2` \| `3` \| `4` | no | `4` | Grid columns (desktop) |

### StatConfig Type

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| id | `string` | yes | Stat identifier |
| label | `string` | yes | Display label |
| value | `number \| string` | yes | Stat value |
| icon | `ReactNode` | no | Stat icon |
| trend | `TrendConfig` | no | Change indicator |
| href | `string` | no | Click navigation |

## Layout

| Breakpoint | Columns | Gap |
|------------|---------|-----|
| Mobile | 2 | `gap-3` |
| Tablet | 2 or 3 | `gap-4` |
| Desktop | 3 or 4 | `gap-4` |

## Dashboard-Specific Configurations

### Candidate Dashboard

| Stat | Label (Thai) | English | Icon |
|------|--------------|---------|------|
| `total_applications` | ใบสมัครทั้งหมด | Total Applications | 📄 |
| `pending` | รอการตอบรับ | Pending | ⏳ |
| `interviews` | นัดสัมภาษณ์ | Interviews | 📅 |
| `saved_jobs` | งานที่บันทึก | Saved Jobs | ❤️ |

### Company Dashboard

| Stat | Label (Thai) | English | Icon |
|------|--------------|---------|------|
| `new_applications` | ใบสมัครใหม่ | New Applications | 📥 |
| `pending_review` | รอดำเนินการ | Pending Review | ⏳ |
| `today_interviews` | สัมภาษณ์วันนี้ | Today's Interviews | 📅 |
| `active_jobs` | ตำแหน่งเปิดรับ | Active Positions | 💼 |

### Platform Dashboard

| Stat | Label (Thai) | English | Icon |
|------|--------------|---------|------|
| `new_companies` | บริษัทใหม่ | New Companies | 🏢 |
| `new_candidates` | ผู้สมัครใหม่ | New Candidates | 👤 |
| `new_jobs` | ประกาศงานใหม่ | New Job Posts | 📋 |
| `pending_approval` | รอตรวจสอบ | Pending Approval | ⚠️ |

---

# 5. RecentActivityList

## Description

Displays recent activity items in a timeline or list format. Used in dashboards to show recent events.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| activities | `Activity[]` | yes | — | Activity list |
| maxItems | `number` | no | `5` | Maximum items |
| showTimestamp | `boolean` | no | `true` | Show time |
| onItemClick | `(id: string) => void` | no | — | Item click handler |
| onViewAll | `() => void` | no | — | View all handler |

### Activity Type

| Property | Type | Description |
|----------|------|-------------|
| id | `string` | Activity identifier |
| type | `ActivityType` | Activity category |
| title | `string` | Activity title |
| description | `string` | Activity description |
| timestamp | `Date` | When it occurred |
| actor | `{ name: string, avatar?: string }` | Who performed |
| target | `{ name: string, href?: string }` | What was affected |

## Activity Types

| Type | Icon | Color | Example |
|------|------|-------|---------|
| `application_new` | 📄 | `text-blue-500` | New application received |
| `application_status` | 🔄 | `text-secondary-500` | Status changed |
| `interview_scheduled` | 📅 | `text-green-500` | Interview scheduled |
| `interview_completed` | ✅ | `text-green-500` | Interview completed |
| `message_received` | 💬 | `text-primary-500` | New message |
| `job_posted` | 📋 | `text-secondary-500` | Job posted |
| `job_expired` | ⚠️ | `text-amber-500` | Job expired |
| `profile_viewed` | 👁 | `text-gray-500` | Profile viewed |

## Visual Structure

```
┌─────────────────────────────────────┐
│  กิจกรรมล่าสุด                       │
│  Recent Activity                    │
├─────────────────────────────────────┤
│  📄  New application from...   14:30│
│      Applied for: Software...       │
│  ─────────────────────────────────  │
│  📅  Interview scheduled       12:00│
│      With: Candidate Name           │
│  ─────────────────────────────────  │
│  💬  New message from...    เมื่อวาน │
│      "Thank you for..."            │
│  ─────────────────────────────────  │
│                                     │
│  ดูทั้งหมด →                         │
│  View all                           │
└─────────────────────────────────────┘
```

## Empty State

| Message (Thai) | English |
|----------------|---------|
| "ยังไม่มีกิจกรรม" | No recent activity |

---

# 6. JobPerformanceCard

## Description

Shows performance metrics for a job posting including views, applications, and conversion rate.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| job | `JobWithMetrics` | yes | — | Job with performance data |
| period | `'7d'` \| `'30d'` \| `'all'` | no | `'30d'` | Time period |
| showChart | `boolean` | no | `false` | Show trend chart |

## Visual Structure

```
┌─────────────────────────────────────┐
│  Job Title                   [Edit] │
│  Posted: 15 Dec 2024                │
├─────────────────────────────────────┤
│                                     │
│   👁 1,234      📄 56      📊 4.5%  │
│   Views        Apps       Rate      │
│                                     │
│  ┌─────────────────────────────────┐│  ← Optional chart
│  │  📈 Trend chart                 ││
│  └─────────────────────────────────┘│
│                                     │
│  [ดูใบสมัคร] [แชร์] [หยุดชั่วคราว]   │
│  View Apps   Share  Pause           │
└─────────────────────────────────────┘
```

## Metrics

| Metric | Label (Thai) | English | Format |
|--------|--------------|---------|--------|
| `views` | ผู้เข้าชม | Views | Number with comma |
| `applications` | ใบสมัคร | Applications | Number |
| `conversion` | อัตราแปลง | Conversion Rate | Percentage |
| `avg_time` | เวลาเฉลี่ย | Avg. Time on Page | "X นาที" / "Xm" |

## Actions

| Action | Label (Thai) | English | Condition |
|--------|--------------|---------|-----------|
| `view_applications` | ดูใบสมัคร | View Applications | always |
| `share` | แชร์ | Share | always |
| `pause` | หยุดชั่วคราว | Pause | status = `active` |
| `resume` | เปิดรับต่อ | Resume | status = `paused` |
| `edit` | แก้ไข | Edit | always |

---

*End of Widgets Organism Specification*
