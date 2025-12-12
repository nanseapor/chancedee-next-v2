# Buttons

## Overview

Button atoms are the primary interactive elements for triggering actions. All buttons follow the design system's 5-level hierarchy.

**Design Reference:** See `chancedee-design-guidelines.md` for colors and states.

---

# 1. Button

## Description

Standard button component with multiple variants, sizes, and states.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| variant | `'primary'` \| `'secondary'` \| `'outline'` \| `'ghost'` \| `'destructive'` | no | `'primary'` | Visual style |
| size | `'sm'` \| `'md'` \| `'lg'` | no | `'md'` | Button size |
| disabled | `boolean` | no | `false` | Disabled state |
| loading | `boolean` | no | `false` | Loading state with spinner |
| fullWidth | `boolean` | no | `false` | Expand to container width |
| leftIcon | `ReactNode` | no | — | Icon before label |
| rightIcon | `ReactNode` | no | — | Icon after label |
| type | `'button'` \| `'submit'` \| `'reset'` | no | `'button'` | HTML button type |
| onClick | `() => void` | no | — | Click handler |

## Variants

| Variant | Use Case | Tailwind Classes |
|---------|----------|------------------|
| `primary` | Main CTA, submit actions | `bg-primary text-white hover:bg-primary-600 active:bg-primary-700` |
| `secondary` | Secondary actions | `bg-secondary-900 text-white hover:bg-secondary-800 active:bg-secondary-950` |
| `outline` | Tertiary actions | `border border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100` |
| `ghost` | Minimal emphasis | `text-gray-700 hover:bg-gray-100 active:bg-gray-200` |
| `destructive` | Delete, remove actions | `bg-red-600 text-white hover:bg-red-700 active:bg-red-800` |

## Sizes

| Size | Padding | Font Size | Height | Icon Size |
|------|---------|-----------|--------|-----------|
| `sm` | `px-3 py-1.5` | `text-sm` | `h-8` | `w-4 h-4` |
| `md` | `px-4 py-2` | `text-sm` | `h-10` | `w-5 h-5` |
| `lg` | `px-6 py-3` | `text-base` | `h-12` | `w-5 h-5` |

## States

| State | Condition | Visual Change |
|-------|-----------|---------------|
| default | — | Base variant styles |
| hover | `:hover` | Darker background |
| active | `:active` | Even darker, slight scale `scale-[0.98]` |
| focus | `:focus-visible` | `ring-2 ring-offset-2 ring-secondary-500` |
| disabled | `disabled: true` | `opacity-50 cursor-not-allowed` |
| loading | `loading: true` | Show spinner, disable interaction |

## Loading State

When `loading: true`:
- Replace left icon with spinner (or show spinner if no icon)
- Disable pointer events
- Maintain button width (prevent layout shift)

```
[○ กำลังบันทึก...]    ← Spinner + text
[  Saving...    ]
```

## Common Styles

```css
.button-base {
  @apply inline-flex items-center justify-center gap-2;
  @apply font-medium rounded-lg;
  @apply transition-all duration-150 ease-out;
  @apply focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2;
}
```

## Accessibility

| Attribute | Value |
|-----------|-------|
| `role` | `button` (implicit) |
| `aria-disabled` | `true` when disabled |
| `aria-busy` | `true` when loading |

---

# 2. IconButton

## Description

Button containing only an icon, used for compact actions like close, menu, or toolbar items.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| icon | `ReactNode` | yes | — | Icon element |
| variant | `'primary'` \| `'secondary'` \| `'ghost'` \| `'destructive'` | no | `'ghost'` | Visual style |
| size | `'sm'` \| `'md'` \| `'lg'` | no | `'md'` | Button size |
| label | `string` | yes | — | Accessible label (aria-label) |
| disabled | `boolean` | no | `false` | Disabled state |
| loading | `boolean` | no | `false` | Loading state |
| onClick | `() => void` | no | — | Click handler |

## Sizes

| Size | Dimensions | Icon Size |
|------|------------|-----------|
| `sm` | `w-8 h-8` | `w-4 h-4` |
| `md` | `w-10 h-10` | `w-5 h-5` |
| `lg` | `w-12 h-12` | `w-6 h-6` |

## Common Uses

| Icon | Label (Thai) | English | Use Case |
|------|--------------|---------|----------|
| ✕ | ปิด | Close | Close modals, dismiss |
| ☰ | เมนู | Menu | Mobile menu toggle |
| ⋮ | ตัวเลือกเพิ่มเติม | More options | Action menu trigger |
| ← | กลับ | Back | Navigation back |
| ❤️ | บันทึก | Save | Save/bookmark toggle |
| 🔔 | การแจ้งเตือน | Notifications | Notification center |
| ✏️ | แก้ไข | Edit | Edit action |
| 🗑️ | ลบ | Delete | Delete action |

## Styling

```css
.icon-button {
  @apply inline-flex items-center justify-center;
  @apply rounded-full;
  @apply transition-all duration-150;
}
```

## Accessibility

| Attribute | Value |
|-----------|-------|
| `aria-label` | Required (from `label` prop) |
| `role` | `button` |

---

# 3. FAB (Floating Action Button)

## Description

Floating button for primary actions, typically positioned at bottom-right of the screen.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| icon | `ReactNode` | yes | — | Icon element |
| label | `string` | no | — | Text label (extended FAB) |
| onClick | `() => void` | yes | — | Click handler |
| badge | `number` | no | — | Notification badge |
| extended | `boolean` | no | `false` | Show label alongside icon |

## Variants

| Variant | Description | Tailwind |
|---------|-------------|----------|
| Standard | Icon only, circular | `w-14 h-14 rounded-full` |
| Extended | Icon + label, pill shape | `h-14 px-6 rounded-full` |
| Mini | Smaller icon only | `w-10 h-10 rounded-full` |

## Positioning

```css
.fab {
  @apply fixed bottom-6 right-6;
  @apply z-40;
  @apply shadow-lg hover:shadow-xl;
  @apply bg-primary text-white;
  @apply transition-all duration-200;
}

/* With bottom navigation (mobile) */
.fab-with-nav {
  @apply bottom-20; /* Above bottom tab bar */
}
```

## Common FAB Actions

| Context | Icon | Label (Thai) | English |
|---------|------|--------------|---------|
| Jobs list | ➕ | — | — |
| Chat | 💬 | — | — |
| Company dashboard | ➕ | ลงประกาศงาน | Post Job |
| Candidate dashboard | 💬 | ข้อความ | Messages |

## Badge Display

| Count | Display |
|-------|---------|
| 0 | Hidden |
| 1-99 | Show number |
| 100+ | "99+" |

```css
.fab-badge {
  @apply absolute -top-1 -right-1;
  @apply min-w-[20px] h-5 px-1;
  @apply bg-red-500 text-white text-xs font-bold;
  @apply rounded-full flex items-center justify-center;
}
```

---

# 4. SocialButton

## Description

Styled buttons for social authentication (Google, Facebook, Line).

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| provider | `'google'` \| `'facebook'` \| `'line'` | yes | — | Auth provider |
| action | `'login'` \| `'register'` \| `'connect'` | no | `'login'` | Action type for label |
| loading | `boolean` | no | `false` | Loading state |
| disabled | `boolean` | no | `false` | Disabled state |
| onClick | `() => void` | yes | — | Click handler |

## Provider Styles

| Provider | Background | Text | Border | Icon |
|----------|------------|------|--------|------|
| `google` | `bg-white` | `text-gray-700` | `border border-gray-300` | Google "G" logo |
| `facebook` | `bg-[#1877F2]` | `text-white` | none | Facebook "f" logo |
| `line` | `bg-[#00B900]` | `text-white` | none | Line logo |

## Labels by Action

| Provider | Login (Thai) | Register (Thai) | Connect (Thai) |
|----------|--------------|-----------------|----------------|
| `google` | เข้าสู่ระบบด้วย Google | ลงทะเบียนด้วย Google | เชื่อมต่อ Google |
| `facebook` | เข้าสู่ระบบด้วย Facebook | ลงทะเบียนด้วย Facebook | เชื่อมต่อ Facebook |
| `line` | เข้าสู่ระบบด้วย Line | ลงทะเบียนด้วย Line | เชื่อมต่อ Line |

| Provider | Login (English) | Register (English) | Connect (English) |
|----------|-----------------|-------------------|-------------------|
| `google` | Sign in with Google | Sign up with Google | Connect Google |
| `facebook` | Sign in with Facebook | Sign up with Facebook | Connect Facebook |
| `line` | Sign in with Line | Sign up with Line | Connect Line |

## Styling

```css
.social-button {
  @apply w-full h-12 px-4;
  @apply flex items-center justify-center gap-3;
  @apply rounded-lg font-medium;
  @apply transition-all duration-150;
}

.social-button:hover {
  @apply opacity-90;
}
```

---

# 5. LinkButton

## Description

A button styled as a text link, used for inline actions or tertiary options.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| href | `string` | conditional | — | Navigation link |
| onClick | `() => void` | conditional | — | Click handler |
| size | `'sm'` \| `'md'` | no | `'md'` | Text size |
| color | `'primary'` \| `'secondary'` \| `'gray'` \| `'destructive'` | no | `'secondary'` | Text color |
| underline | `'always'` \| `'hover'` \| `'none'` | no | `'hover'` | Underline behavior |
| leftIcon | `ReactNode` | no | — | Icon before text |
| rightIcon | `ReactNode` | no | — | Icon after text |

## Colors

| Color | Tailwind Classes |
|-------|------------------|
| `primary` | `text-primary hover:text-primary-700` |
| `secondary` | `text-secondary-600 hover:text-secondary-700` |
| `gray` | `text-gray-600 hover:text-gray-700` |
| `destructive` | `text-red-600 hover:text-red-700` |

## Sizes

| Size | Tailwind |
|------|----------|
| `sm` | `text-sm` |
| `md` | `text-base` |

## Common Uses

| Use Case | Label (Thai) | English | Color |
|----------|--------------|---------|-------|
| View all | ดูทั้งหมด | View all | `secondary` |
| Cancel | ยกเลิก | Cancel | `gray` |
| Delete | ลบ | Delete | `destructive` |
| Learn more | เรียนรู้เพิ่มเติม | Learn more | `secondary` |
| Forgot password | ลืมรหัสผ่าน? | Forgot password? | `secondary` |

---

# 6. ButtonGroup

## Description

Groups related buttons together with connected styling.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| children | `ReactNode` | yes | — | Button elements |
| orientation | `'horizontal'` \| `'vertical'` | no | `'horizontal'` | Layout direction |
| size | `'sm'` \| `'md'` \| `'lg'` | no | `'md'` | Applies to all children |
| attached | `boolean` | no | `false` | Remove gaps, connect borders |

## Visual Structure

### Horizontal (default)
```
[Option A] [Option B] [Option C]
```

### Horizontal Attached
```
[Option A|Option B|Option C]
```

### Vertical
```
[Option A]
[Option B]
[Option C]
```

## Attached Styling

```css
.button-group-attached > button:first-child {
  @apply rounded-r-none;
}

.button-group-attached > button:not(:first-child):not(:last-child) {
  @apply rounded-none border-l-0;
}

.button-group-attached > button:last-child {
  @apply rounded-l-none border-l-0;
}
```

---

*End of Buttons Atom Specification*
