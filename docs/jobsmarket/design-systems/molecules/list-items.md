# List Items

## Overview

List item molecules are repeatable units used within lists, tables, and grids. They combine multiple atoms into cohesive, interactive rows.

**Design Reference:** See `chancedee-design-guidelines.md` for colors and badge variants.

---

# 1. ConversationItem

## Description

Single conversation row in a chat list.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| conversation | `Conversation` | yes | — | Conversation data |
| active | `boolean` | no | `false` | Selected state |
| onClick | `() => void` | yes | — | Click handler |

## Visual Structure

```
┌─────────────────────────────────────────────┐
│  ┌────┐  Company Name              14:30   │
│  │ 🏢 │  📋 Job Title                      │
│  └────┘  Last message preview...       🔵  │
└─────────────────────────────────────────────┘
```

## Elements

| Element | Tailwind Classes |
|---------|------------------|
| Container | `flex items-start gap-3 p-3 hover:bg-gray-50 cursor-pointer` |
| Avatar | `w-12 h-12 rounded-full flex-shrink-0` |
| Name | `font-medium text-gray-900 truncate` |
| Job context | `text-xs text-secondary-600 truncate` |
| Preview | `text-sm text-gray-600 truncate` |
| Time | `text-xs text-gray-400 flex-shrink-0` |
| Unread dot | `w-2.5 h-2.5 bg-primary rounded-full` |

## States

| State | Style Changes |
|-------|---------------|
| default | — |
| hover | `bg-gray-50` |
| active | `bg-secondary-50 border-l-2 border-secondary-500` |
| unread | Bold name, unread dot visible |

---

# 2. NotificationItem

## Description

Single notification row in notification list.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| notification | `Notification` | yes | — | Notification data |
| read | `boolean` | no | `false` | Read state |
| onClick | `() => void` | no | — | Click handler |
| onMarkRead | `() => void` | no | — | Mark read handler |

## Visual Structure

```
┌─────────────────────────────────────────────┐
│  🔵  📄  ใบสมัครใหม่จาก สมชาย ใจดี           │
│       สมัครตำแหน่ง: Software Developer      │
│       2 ชั่วโมงที่แล้ว                        │
└─────────────────────────────────────────────┘
```

## Notification Types

| Type | Icon | Thai | English |
|------|------|------|---------|
| `application_new` | 📄 | ใบสมัครใหม่ | New application |
| `application_status` | 🔄 | สถานะใบสมัครเปลี่ยน | Application status changed |
| `interview_scheduled` | 📅 | นัดสัมภาษณ์ | Interview scheduled |
| `interview_reminder` | 🔔 | เตือนสัมภาษณ์ | Interview reminder |
| `message_new` | 💬 | ข้อความใหม่ | New message |
| `job_match` | ⭐ | งานที่เหมาะกับคุณ | Job match |
| `job_expire` | ⚠️ | ประกาศงานใกล้หมดอายุ | Job expiring soon |

## States

| State | Style Changes |
|-------|---------------|
| unread | `bg-secondary-50`, show unread dot |
| read | `bg-white` |
| hover | `bg-gray-50` |

---

# 3. MenuItem

## Description

Single item in a dropdown or context menu.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| label | `string` | yes | — | Item label |
| icon | `ReactNode` | no | — | Leading icon |
| shortcut | `string` | no | — | Keyboard shortcut |
| disabled | `boolean` | no | `false` | Disabled state |
| variant | `'default'` \| `'destructive'` | no | `'default'` | Visual variant |
| onClick | `() => void` | yes | — | Click handler |

## Visual Structure

```
┌─────────────────────────────────────┐
│  ✏️  แก้ไข                    ⌘E    │
│  📋  ทำซ้ำ                    ⌘D    │
│  ───────────────────────────────   │   ← Separator
│  🗑️  ลบ                      ⌘⌫    │   ← Destructive
└─────────────────────────────────────┘
```

## Styling

```css
.menu-item {
  @apply flex items-center gap-3;
  @apply px-4 py-2;
  @apply text-sm text-gray-700;
  @apply hover:bg-gray-50 cursor-pointer;
}

.menu-item-destructive {
  @apply text-red-600 hover:bg-red-50;
}

.menu-item-disabled {
  @apply text-gray-400 cursor-not-allowed;
}

.menu-item-shortcut {
  @apply ml-auto text-xs text-gray-400;
}
```

---

# 4. SelectOption

## Description

Single option in a select dropdown.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| value | `string` | yes | — | Option value |
| label | `string` | yes | — | Display label |
| selected | `boolean` | no | `false` | Selected state |
| disabled | `boolean` | no | `false` | Disabled state |
| icon | `ReactNode` | no | — | Leading icon |
| description | `string` | no | — | Secondary text |
| onClick | `() => void` | yes | — | Click handler |

## Visual Structure

### Simple
```
│  กรุงเทพมหานคร                ✓  │
│  นนทบุรี                         │
│  ปทุมธานี                        │
```

### With Description
```
│  ┌────┐  Admin                   │
│  │ 👤 │  สิทธิ์เต็ม              ✓  │
│  └────┘                          │
│  ┌────┐  HR Manager              │
│  │ 👤 │  จัดการทีมและใบสมัคร        │
│  └────┘                          │
```

## States

| State | Style |
|-------|-------|
| default | `bg-white text-gray-900` |
| hover | `bg-gray-50` |
| selected | `bg-secondary-50 text-secondary-700` |
| disabled | `bg-white text-gray-400` |

---

# 5. SkillTag

## Description

Skill or tag with optional proficiency level.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| name | `string` | yes | — | Skill name |
| level | `'beginner'` \| `'intermediate'` \| `'advanced'` \| `'expert'` | no | — | Proficiency level |
| removable | `boolean` | no | `false` | Show remove button |
| onClick | `() => void` | no | — | Click handler |
| onRemove | `() => void` | no | — | Remove handler |

## Visual Structure

### Simple
```
[JavaScript]  [React]  [Node.js]
```

### With Level
```
[JavaScript ●●●○]  [React ●●○○]  [Node.js ●●●●]
```

## Level Indicators

| Level | Thai | English | Dots |
|-------|------|---------|------|
| `beginner` | เริ่มต้น | Beginner | ●○○○ |
| `intermediate` | ปานกลาง | Intermediate | ●●○○ |
| `advanced` | ขั้นสูง | Advanced | ●●●○ |
| `expert` | เชี่ยวชาญ | Expert | ●●●● |

## Styling

```css
.skill-tag {
  @apply inline-flex items-center gap-2;
  @apply bg-secondary-100 text-secondary-700;
  @apply px-3 py-1.5 rounded-full;
  @apply text-sm;
}

.skill-level {
  @apply flex gap-0.5;
}

.skill-dot-filled {
  @apply w-1.5 h-1.5 bg-secondary-600 rounded-full;
}

.skill-dot-empty {
  @apply w-1.5 h-1.5 bg-secondary-300 rounded-full;
}
```

---

# 6. FilterChip

## Description

Active filter indicator with remove action.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| label | `string` | yes | — | Filter label |
| value | `string` | yes | — | Filter value |
| onRemove | `() => void` | yes | — | Remove handler |

## Visual Structure

```
[ตำแหน่ง: Developer ✕]  [เงินเดือน: 30,000+ ✕]  [ล้างทั้งหมด]
```

## Styling

```css
.filter-chip {
  @apply inline-flex items-center gap-1;
  @apply bg-secondary-100 text-secondary-700;
  @apply pl-3 pr-1.5 py-1 rounded-full;
  @apply text-sm;
}

.filter-chip-remove {
  @apply p-0.5 rounded-full;
  @apply hover:bg-secondary-200;
}
```

---

# 7. ExperienceItem

## Description

Work experience entry in profile/resume.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| experience | `Experience` | yes | — | Experience data |
| editable | `boolean` | no | `false` | Show edit/delete actions |
| onEdit | `() => void` | no | — | Edit handler |
| onDelete | `() => void` | no | — | Delete handler |

## Visual Structure

```
┌─────────────────────────────────────────────────┐
│  ┌────┐  Senior Developer            [✏️] [🗑️] │
│  │ 🏢 │  Company ABC                            │
│  └────┘  ม.ค. 2022 - ปัจจุบัน (2 ปี 11 เดือน)    │
│                                                 │
│  • พัฒนาระบบ e-commerce ด้วย React              │
│  • ดูแลทีม 5 คน                                 │
│  • ลดเวลาโหลดหน้าเว็บ 40%                        │
└─────────────────────────────────────────────────┘
```

## Date Formatting

| Case | Format (Thai) | English |
|------|---------------|---------|
| Current job | ม.ค. 2022 - ปัจจุบัน | Jan 2022 - Present |
| Past job | ม.ค. 2020 - ธ.ค. 2021 | Jan 2020 - Dec 2021 |
| Duration | (2 ปี 3 เดือน) | (2 years 3 months) |

---

# 8. EducationItem

## Description

Education entry in profile/resume.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| education | `Education` | yes | — | Education data |
| editable | `boolean` | no | `false` | Show edit/delete actions |
| onEdit | `() => void` | no | — | Edit handler |
| onDelete | `() => void` | no | — | Delete handler |

## Visual Structure

```
┌─────────────────────────────────────────────────┐
│  ┌────┐  ปริญญาตรี วิศวกรรมคอมพิวเตอร์  [✏️] [🗑️] │
│  │ 🎓 │  จุฬาลงกรณ์มหาวิทยาลัย                   │
│  └────┘  2558 - 2562                           │
│                                                 │
│  • GPA 3.45                                     │
│  • First Class Honors                          │
└─────────────────────────────────────────────────┘
```

---

# 9. TeamMemberItem

## Description

Team member row in team management list.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| member | `TeamMember` | yes | — | Member data |
| currentUserId | `string` | yes | — | For "you" indicator |
| onChangeRole | `() => void` | no | — | Role change handler |
| onRemove | `() => void` | no | — | Remove handler |

## Visual Structure

```
┌──────────────────────────────────────────────────────┐
│  ┌────┐  สมชาย ใจดี (คุณ)     Admin     [เปลี่ยนบทบาท] │
│  │ 👤 │  somchai@company.com                         │
│  └────┘  เข้าร่วม: 15 ม.ค. 2024                       │
└──────────────────────────────────────────────────────┘
```

## Role Badges

| Role | Thai | English | Color |
|------|------|---------|-------|
| `admin` | ผู้ดูแลระบบ | Admin | `bg-purple-100 text-purple-700` |
| `hr_manager` | ผู้จัดการ HR | HR Manager | `bg-blue-100 text-blue-700` |
| `hr_staff` | เจ้าหน้าที่ HR | HR Staff | `bg-green-100 text-green-700` |
| `viewer` | ผู้ดูอย่างเดียว | Viewer | `bg-gray-100 text-gray-600` |

## Status Indicators

| Status | Display |
|--------|---------|
| `active` | Show role badge |
| `pending` | "รอตอบรับ" / "Pending" badge (waiting variant) |
| `you` | Add "(คุณ)" / "(you)" after name |

---

# 10. JobListItem

## Description

Compact job listing for simple lists.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| job | `Job` | yes | — | Job data |
| showCompany | `boolean` | no | `true` | Show company name |
| showSalary | `boolean` | no | `true` | Show salary |
| onClick | `() => void` | no | — | Click handler |

## Visual Structure

```
┌─────────────────────────────────────────────────┐
│  Frontend Developer                    ฿30-50k  │
│  Company ABC • กรุงเทพ • Full-time             │
│  3 วันที่แล้ว                                   │
└─────────────────────────────────────────────────┘
```

## Styling

```css
.job-list-item {
  @apply flex flex-col gap-1;
  @apply p-3 border-b border-gray-100;
  @apply hover:bg-gray-50 cursor-pointer;
}

.job-list-item-title {
  @apply font-medium text-gray-900;
}

.job-list-item-meta {
  @apply text-sm text-gray-600;
  @apply flex items-center gap-2;
}

.job-list-item-salary {
  @apply text-sm font-medium text-gray-900;
}
```

---

*End of List Items Molecule Specification*
