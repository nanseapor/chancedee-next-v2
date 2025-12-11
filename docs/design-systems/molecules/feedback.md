# Feedback

## Overview

Feedback molecules communicate system status, validation results, and notifications to users.

**Design Reference:** See `chancedee-design-guidelines.md` for colors and the 4-variant system.

---

# 1. Toast

## Description

Temporary notification that appears and auto-dismisses.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| variant | `'success'` \| `'error'` \| `'warning'` \| `'info'` | yes | — | Toast type |
| title | `string` | no | — | Toast title |
| message | `string` | yes | — | Toast message |
| duration | `number` | no | `5000` | Auto-dismiss time (ms) |
| action | `ActionConfig` | no | — | Optional action button |
| onDismiss | `() => void` | no | — | Dismiss callback |
| dismissible | `boolean` | no | `true` | Show close button |

## Variants

| Variant | Icon | Background | Border | Use Case |
|---------|------|------------|--------|----------|
| `success` | ✓ | `bg-green-50` | `border-green-200` | Action completed |
| `error` | ✕ | `bg-red-50` | `border-red-200` | Action failed |
| `warning` | ⚠ | `bg-amber-50` | `border-amber-200` | Needs attention |
| `info` | ℹ | `bg-blue-50` | `border-blue-200` | Information |

## Visual Structure

```
┌─────────────────────────────────────────────┐
│  ✓  บันทึกสำเร็จ                        [✕] │
│     ข้อมูลของคุณถูกบันทึกแล้ว                │
│                                [ดูรายละเอียด]│
└─────────────────────────────────────────────┘
```

## Position

```css
.toast-container {
  @apply fixed bottom-4 right-4;
  @apply flex flex-col gap-2;
  @apply z-50;
}

/* Mobile: full width at bottom */
@media (max-width: 640px) {
  .toast-container {
    @apply left-4 right-4 bottom-4;
  }
}
```

## Animation

| Event | Animation |
|-------|-----------|
| Enter | Slide up + fade in (300ms) |
| Exit | Slide right + fade out (200ms) |

```css
.toast-enter {
  animation: slideUp 300ms ease-out;
}

.toast-exit {
  animation: slideOut 200ms ease-in;
}

@keyframes slideUp {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes slideOut {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(100%); opacity: 0; }
}
```

## Common Toast Messages

| Action | Variant | Message (Thai) | English |
|--------|---------|----------------|---------|
| Save success | `success` | บันทึกสำเร็จ | Saved successfully |
| Delete success | `success` | ลบสำเร็จ | Deleted successfully |
| Send success | `success` | ส่งสำเร็จ | Sent successfully |
| API error | `error` | เกิดข้อผิดพลาด กรุณาลองใหม่ | An error occurred. Please try again. |
| Network error | `error` | ไม่สามารถเชื่อมต่อได้ | Connection failed |
| Validation error | `warning` | กรุณาตรวจสอบข้อมูล | Please check your input |
| Session expire | `warning` | เซสชันหมดอายุ | Session expired |
| New message | `info` | คุณมีข้อความใหม่ | You have a new message |

## With Undo Action

```
┌─────────────────────────────────────────────┐
│  ✓  ยกเลิกบันทึกแล้ว                  [ยกเลิก]│
└─────────────────────────────────────────────┘
      ↑ Undo action (5 second window)
```

---

# 2. InlineError

## Description

Error message displayed directly below form fields.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| message | `string` | yes | — | Error message |
| icon | `boolean` | no | `true` | Show error icon |

## Visual Structure

```
⚠ กรุณากรอกอีเมลให้ถูกต้อง
  Please enter a valid email
```

## Styling

```css
.inline-error {
  @apply flex items-start gap-1.5;
  @apply text-sm text-red-600;
  @apply mt-1.5;
}

.inline-error-icon {
  @apply w-4 h-4 flex-shrink-0;
  @apply mt-0.5;
}
```

## Common Error Messages

| Field | Error (Thai) | English |
|-------|--------------|---------|
| Required | กรุณากรอกข้อมูล | This field is required |
| Email format | กรุณากรอกอีเมลให้ถูกต้อง | Please enter a valid email |
| Min length | ต้องมีอย่างน้อย {n} ตัวอักษร | Must be at least {n} characters |
| Max length | ต้องไม่เกิน {n} ตัวอักษร | Must be no more than {n} characters |
| Password match | รหัสผ่านไม่ตรงกัน | Passwords do not match |
| File size | ไฟล์ใหญ่เกินไป | File is too large |
| File type | ประเภทไฟล์ไม่รองรับ | File type not supported |

---

# 3. Alert

## Description

Persistent alert box for important messages within page content.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| variant | `'success'` \| `'error'` \| `'warning'` \| `'info'` | yes | — | Alert type |
| title | `string` | no | — | Alert title |
| message | `string` | yes | — | Alert message |
| dismissible | `boolean` | no | `false` | Can be dismissed |
| action | `ActionConfig` | no | — | Optional action |
| onDismiss | `() => void` | no | — | Dismiss callback |

## Visual Structure

```
┌─────────────────────────────────────────────┐
│  ⚠ ข้อมูลบริษัทยังไม่สมบูรณ์                  │
│                                             │
│  กรุณาเพิ่มข้อมูลบริษัทเพื่อเริ่มลงประกาศงาน     │
│                                             │
│  [แก้ไขข้อมูลบริษัท]                          │
└─────────────────────────────────────────────┘
```

## Styling

```css
.alert {
  @apply rounded-lg border p-4;
}

.alert-success {
  @apply bg-green-50 border-green-200 text-green-800;
}

.alert-error {
  @apply bg-red-50 border-red-200 text-red-800;
}

.alert-warning {
  @apply bg-amber-50 border-amber-200 text-amber-800;
}

.alert-info {
  @apply bg-blue-50 border-blue-200 text-blue-800;
}
```

---

# 4. Banner

## Description

Full-width notification bar at top of page or section.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| variant | `'info'` \| `'warning'` \| `'promo'` | no | `'info'` | Banner type |
| message | `string` | yes | — | Banner message |
| action | `ActionConfig` | no | — | CTA button |
| dismissible | `boolean` | no | `true` | Can be dismissed |
| sticky | `boolean` | no | `false` | Stick to top on scroll |

## Variants

| Variant | Background | Text | Use Case |
|---------|------------|------|----------|
| `info` | `bg-secondary-600` | `text-white` | System announcements |
| `warning` | `bg-amber-500` | `text-white` | Maintenance notice |
| `promo` | `bg-primary` | `text-white` | Promotions |

## Visual Structure

```
┌─────────────────────────────────────────────────────────┐
│  🎉 ลงทะเบียนวันนี้ รับสิทธิ์พิเศษ!    [ลงทะเบียน]    [✕] │
└─────────────────────────────────────────────────────────┘
```

## Positioning

```css
.banner-sticky {
  @apply sticky top-0 z-40;
}
```

---

# 5. Tooltip

## Description

Contextual information shown on hover.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| content | `string \| ReactNode` | yes | — | Tooltip content |
| position | `'top'` \| `'bottom'` \| `'left'` \| `'right'` | no | `'top'` | Tooltip position |
| delay | `number` | no | `200` | Show delay (ms) |
| children | `ReactNode` | yes | — | Trigger element |

## Visual Structure

```
          ┌───────────────────┐
          │ ส่งข้อความถึงบริษัท │   ← Tooltip
          └─────────┬─────────┘
                    ▼
                  [💬]              ← Trigger
```

## Positions

| Position | Arrow |
|----------|-------|
| `top` | Bottom center |
| `bottom` | Top center |
| `left` | Right center |
| `right` | Left center |

## Styling

```css
.tooltip {
  @apply bg-gray-900 text-white;
  @apply text-sm px-3 py-2 rounded-lg;
  @apply shadow-lg;
  @apply max-w-xs;
}

.tooltip-arrow {
  @apply border-4 border-transparent;
}

.tooltip-top .tooltip-arrow {
  @apply border-t-gray-900;
}
```

## Accessibility

| Attribute | Value |
|-----------|-------|
| `role` | `tooltip` |
| Trigger `aria-describedby` | Tooltip ID |

---

# 6. Popover

## Description

Interactive tooltip with rich content.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| content | `ReactNode` | yes | — | Popover content |
| trigger | `'click'` \| `'hover'` | no | `'click'` | Trigger behavior |
| position | `'top'` \| `'bottom'` \| `'left'` \| `'right'` | no | `'bottom'` | Position |
| open | `boolean` | no | — | Controlled open state |
| onOpenChange | `(open: boolean) => void` | no | — | Open state handler |
| children | `ReactNode` | yes | — | Trigger element |

## Visual Structure

```
              [ข้อมูลเพิ่มเติม ▼]
                     │
    ┌────────────────┴────────────────┐
    │  Match Score: 85%               │
    │                                 │
    │  ✓ ทักษะตรง 80%                  │
    │  ✓ ประสบการณ์ตรง 90%             │
    │  ✓ ตำแหน่งตรง 85%                │
    │                                 │
    │  [ดูรายละเอียด]                   │
    └─────────────────────────────────┘
```

## Styling

```css
.popover {
  @apply bg-white rounded-lg shadow-xl;
  @apply border border-gray-200;
  @apply p-4;
  @apply z-50;
}
```

---

# 7. ConfirmPopover

## Description

Compact confirmation dialog in popover format.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| title | `string` | yes | — | Confirmation title |
| message | `string` | no | — | Additional message |
| confirmLabel | `string` | no | "ยืนยัน" | Confirm button text |
| cancelLabel | `string` | no | "ยกเลิก" | Cancel button text |
| variant | `'default'` \| `'destructive'` | no | `'default'` | Button variant |
| onConfirm | `() => void` | yes | — | Confirm handler |
| onCancel | `() => void` | no | — | Cancel handler |
| children | `ReactNode` | yes | — | Trigger element |

## Visual Structure

```
              [ลบ]
                │
    ┌───────────┴───────────┐
    │  ลบรายการนี้?          │
    │                       │
    │  [ยกเลิก]   [ลบ]       │
    └───────────────────────┘
```

## Use Cases

| Action | Title (Thai) | English |
|--------|--------------|---------|
| Remove tag | "ลบแท็กนี้?" | "Remove this tag?" |
| Clear all | "ล้างทั้งหมด?" | "Clear all?" |
| Unsave | "ยกเลิกบันทึก?" | "Remove from saved?" |

---

# 8. PasswordRequirements

## Description

Live checklist of password requirements.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| password | `string` | yes | — | Current password value |
| requirements | `Requirement[]` | no | default set | Custom requirements |

## Visual Structure

```
✓ อย่างน้อย 8 ตัวอักษร
✓ มีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว
✗ มีตัวเลขอย่างน้อย 1 ตัว
✗ มีอักขระพิเศษ (!@#$%^&*)
```

## States

| State | Icon | Color |
|-------|------|-------|
| Met | ✓ | `text-green-600` |
| Not met | ✗ | `text-gray-400` |

## Styling

```css
.password-requirements {
  @apply space-y-1.5;
  @apply text-sm;
}

.requirement-met {
  @apply text-green-600;
}

.requirement-unmet {
  @apply text-gray-400;
}
```

---

# 9. FormSuccess

## Description

Success state displayed after form submission.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| title | `string` | yes | — | Success title |
| message | `string` | no | — | Success message |
| action | `ActionConfig` | no | — | Next action button |

## Visual Structure

```
┌─────────────────────────────────────────┐
│                                         │
│              ✓                          │
│                                         │
│        ลงทะเบียนสำเร็จ!                   │
│                                         │
│   เราได้ส่งอีเมลยืนยันไปที่                 │
│   example@email.com                     │
│                                         │
│        [เข้าสู่ระบบ]                      │
│                                         │
└─────────────────────────────────────────┘
```

## Animation

Success checkmark with draw animation:

```css
.success-check {
  animation: checkDraw 0.5s ease-out forwards;
}

@keyframes checkDraw {
  0% { stroke-dashoffset: 100; }
  100% { stroke-dashoffset: 0; }
}
```

---

*End of Feedback Molecule Specification*
