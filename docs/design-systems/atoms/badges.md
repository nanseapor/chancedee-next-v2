# Badges

## Overview

Badge atoms display status, categories, counts, and other metadata. The design system uses a 4-variant badge system to reduce cognitive load.

**Design Reference:** See `chancedee-design-guidelines.md` for the 4-variant badge system.

---

# 1. StatusBadge

## Description

Displays status information using the 4-variant color system (waiting, success, problem, neutral).

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| variant | `'waiting'` \| `'success'` \| `'problem'` \| `'neutral'` | yes | — | Color variant |
| label | `string` | yes | — | Badge text |
| size | `'sm'` \| `'md'` | no | `'md'` | Badge size |
| icon | `ReactNode` | no | — | Leading icon |
| dot | `boolean` | no | `false` | Show status dot instead of background |

## Variants

| Variant | Use Case | Background | Text | Border |
|---------|----------|------------|------|--------|
| `waiting` | Pending, in progress | `bg-amber-100` | `text-amber-700` | `border-amber-200` |
| `success` | Completed, approved | `bg-green-100` | `text-green-700` | `border-green-200` |
| `problem` | Error, rejected | `bg-rose-100` | `text-rose-700` | `border-rose-200` |
| `neutral` | Inactive, closed | `bg-gray-100` | `text-gray-600` | `border-gray-200` |

## Sizes

| Size | Padding | Font | Height |
|------|---------|------|--------|
| `sm` | `px-2 py-0.5` | `text-xs` | `h-5` |
| `md` | `px-2.5 py-1` | `text-sm` | `h-6` |

## Common Status Mappings

### Application Status → Badge Variant

| Status | Thai | English | → Variant |
|--------|------|---------|-----------|
| `applied` | สมัครใหม่ | New Application | `waiting` |
| `read` | เปิดอ่านแล้ว | Viewed | `waiting` |
| `accepted` | รอนัดสัมภาษณ์ | Accepted | `success` |
| `scheduled` | นัดสัมภาษณ์ | Scheduled | `waiting` |
| `confirmed` | ยืนยันแล้ว | Confirmed | `success` |
| `rejected` | ถูกปฏิเสธ | Rejected | `problem` |
| `withdraw` | ยกเลิกการสมัคร | Withdrawn | `neutral` |
| `cancelled` | ยกเลิก | Cancelled | `neutral` |
| `declined` | ปฏิเสธนัดหมาย | Declined | `problem` |
| `closed` | ปิดรับสมัคร | Closed | `neutral` |
| `systemclosed` | ปิดโดยระบบ | System Closed | `neutral` |

### Job Status → Badge Variant

| Status | Thai | English | → Variant |
|--------|------|---------|-----------|
| `draft` | แบบร่าง | Draft | `neutral` |
| `active` | เปิดรับสมัคร | Active | `success` |
| `paused` | หยุดชั่วคราว | Paused | `waiting` |
| `closed` | ปิดรับสมัคร | Closed | `neutral` |
| `expired` | หมดอายุ | Expired | `problem` |

### Company Status → Badge Variant

| Status | Thai | English | → Variant |
|--------|------|---------|-----------|
| `pending` | รอตรวจสอบ | Pending Review | `waiting` |
| `active` | ใช้งาน | Active | `success` |
| `verified` | ยืนยันแล้ว | Verified | `success` |
| `suspended` | ถูกระงับ | Suspended | `problem` |

## Dot Variant

When `dot: true`, shows a small colored dot instead of full background:

```
● Active        (green dot + text)
● Pending       (amber dot + text)
```

```css
.status-dot {
  @apply w-2 h-2 rounded-full mr-2;
}
```

---

# 2. MatchScoreBadge

## Description

Displays job-candidate match percentage with color coding based on score range.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| score | `number` | yes | — | Match percentage (0-100) |
| size | `'sm'` \| `'md'` \| `'lg'` | no | `'md'` | Badge size |
| showLabel | `boolean` | no | `true` | Show "ความเหมาะสม" prefix |

## Score Ranges

| Score | Label | Background | Text | Border |
|-------|-------|------------|------|--------|
| 0-39 | ต่ำ / Low | `bg-rose-100` | `text-rose-700` | — |
| 40-69 | ปานกลาง / Medium | `bg-amber-100` | `text-amber-700` | — |
| 70-89 | สูง / High | `bg-green-100` | `text-green-700` | — |
| 90-100 | ดีเยี่ยม / Excellent | `bg-secondary-100` | `text-secondary-700` | `border border-secondary-300` |

## Visual Structure

```
┌──────────────────┐
│  ⭐ 85% เหมาะสม   │    ← With label
└──────────────────┘

┌────────┐
│  85%   │              ← Without label
└────────┘
```

## Sizes

| Size | Font | Padding |
|------|------|---------|
| `sm` | `text-xs` | `px-2 py-0.5` |
| `md` | `text-sm` | `px-2.5 py-1` |
| `lg` | `text-base` | `px-3 py-1.5` |

## Accessibility

| Attribute | Value |
|-----------|-------|
| `aria-label` | "ความเหมาะสม {score} เปอร์เซ็นต์" / "Match score {score} percent" |

---

# 3. CountBadge

## Description

Displays numeric counts for notifications, messages, or items.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| count | `number` | yes | — | Count value |
| max | `number` | no | `99` | Maximum before showing "+" |
| variant | `'primary'` \| `'secondary'` \| `'gray'` | no | `'primary'` | Color variant |
| size | `'sm'` \| `'md'` | no | `'md'` | Badge size |
| dot | `boolean` | no | `false` | Show dot instead of number |

## Display Logic

| Count | Max | Display |
|-------|-----|---------|
| 0 | * | Hidden |
| 1-99 | 99 | Show number |
| 100+ | 99 | "99+" |
| * | * | Dot (if `dot: true`) |

## Variants

| Variant | Background | Text |
|---------|------------|------|
| `primary` | `bg-primary` | `text-white` |
| `secondary` | `bg-secondary-600` | `text-white` |
| `gray` | `bg-gray-500` | `text-white` |

## Sizes

| Size | Dimensions | Font |
|------|------------|------|
| `sm` | `min-w-[16px] h-4` | `text-[10px]` |
| `md` | `min-w-[20px] h-5` | `text-xs` |

## Styling

```css
.count-badge {
  @apply inline-flex items-center justify-center;
  @apply rounded-full font-medium;
  @apply px-1.5;
}

.count-dot {
  @apply w-2.5 h-2.5 rounded-full;
}
```

---

# 4. CategoryBadge

## Description

Displays category or tag information with optional removal action.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| label | `string` | yes | — | Category name |
| color | `'gray'` \| `'teal'` \| `'blue'` \| `'purple'` \| `'orange'` | no | `'gray'` | Color theme |
| size | `'sm'` \| `'md'` | no | `'md'` | Badge size |
| removable | `boolean` | no | `false` | Show remove button |
| onRemove | `() => void` | conditional | — | Remove handler |
| onClick | `() => void` | no | — | Click handler (for filters) |

## Colors

| Color | Background | Text |
|-------|------------|------|
| `gray` | `bg-gray-100` | `text-gray-700` |
| `teal` | `bg-secondary-100` | `text-secondary-700` |
| `blue` | `bg-blue-100` | `text-blue-700` |
| `purple` | `bg-purple-100` | `text-purple-700` |
| `orange` | `bg-primary-100` | `text-primary-700` |

## Visual Structure

```
┌─────────────────────┐
│  JavaScript      ✕  │    ← Removable
└─────────────────────┘

┌─────────────────────┐
│  Full-time          │    ← Standard
└─────────────────────┘
```

## Common Uses

| Use Case | Example Labels | Color |
|----------|----------------|-------|
| Skills | JavaScript, Python, React | `teal` |
| Job Type | Full-time, Part-time, Contract | `gray` |
| Industry | Technology, Finance, Healthcare | `blue` |
| Location | Bangkok, Remote, Hybrid | `gray` |
| Experience | Senior, Mid-level, Junior | `purple` |

---

# 5. VerifiedBadge

## Description

Indicates verified status for companies or users.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| size | `'sm'` \| `'md'` | no | `'md'` | Badge size |
| showLabel | `boolean` | no | `false` | Show "ยืนยันแล้ว" text |

## Visual Structure

```
✓     ← Icon only (default)

✓ ยืนยันแล้ว    ← With label
  Verified
```

## Sizes

| Size | Icon Size | Label Font |
|------|-----------|------------|
| `sm` | `w-4 h-4` | `text-xs` |
| `md` | `w-5 h-5` | `text-sm` |

## Styling

```css
.verified-badge {
  @apply inline-flex items-center gap-1;
  @apply text-secondary-600;
}

.verified-icon {
  @apply bg-secondary-600 text-white rounded-full p-0.5;
}
```

## Accessibility

| Attribute | Value |
|-----------|-------|
| `aria-label` | "บริษัทยืนยันแล้ว" / "Verified company" |

---

# 6. NewBadge

## Description

Indicates new or recently added items.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| pulse | `boolean` | no | `false` | Add pulse animation |

## Visual Structure

```
┌───────┐
│  NEW  │    ← or "ใหม่"
└───────┘
```

## Styling

```css
.new-badge {
  @apply bg-primary text-white;
  @apply text-xs font-bold uppercase;
  @apply px-1.5 py-0.5 rounded;
}

.new-badge-pulse {
  @apply animate-pulse;
}
```

---

# 7. OnlineBadge

## Description

Indicates online/offline status for users.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| online | `boolean` | yes | — | Online status |
| showLabel | `boolean` | no | `false` | Show text label |

## Visual Structure

```
🟢    ← Online (green dot)
⚪    ← Offline (gray dot)

🟢 ออนไลน์     ← With label
   Online
```

## Styling

```css
.online-dot {
  @apply w-3 h-3 rounded-full;
  @apply border-2 border-white; /* For avatar overlay */
}

.online-dot-online {
  @apply bg-green-500;
}

.online-dot-offline {
  @apply bg-gray-400;
}
```

---

# 8. Shared Patterns

## Base Badge Styling

```css
.badge-base {
  @apply inline-flex items-center gap-1;
  @apply font-medium rounded-full;
  @apply whitespace-nowrap;
}
```

## Accessibility

All badges should have:
- Appropriate color contrast (4.5:1 minimum)
- `aria-label` when icon-only
- Screen reader friendly text

## Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| Mobile | May hide labels, show icons only |
| Desktop | Show full labels |

---

*End of Badges Atom Specification*
