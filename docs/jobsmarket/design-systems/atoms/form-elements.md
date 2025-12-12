# Form Elements

## Overview

Form element atoms are the basic building blocks for user input. All form elements follow consistent styling and validation patterns.

**Design Reference:** See `chancedee-design-guidelines.md` for colors and focus states.

---

# 1. TextInput

## Description

Single-line text input for short text values.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| type | `'text'` \| `'email'` \| `'password'` \| `'tel'` \| `'url'` \| `'search'` | no | `'text'` | Input type |
| value | `string` | yes | — | Input value |
| onChange | `(value: string) => void` | yes | — | Change handler |
| placeholder | `string` | no | — | Placeholder text |
| disabled | `boolean` | no | `false` | Disabled state |
| readOnly | `boolean` | no | `false` | Read-only state |
| error | `boolean` | no | `false` | Error state |
| size | `'sm'` \| `'md'` \| `'lg'` | no | `'md'` | Input size |
| leftIcon | `ReactNode` | no | — | Icon inside left |
| rightIcon | `ReactNode` | no | — | Icon inside right |
| leftAddon | `string` | no | — | Text addon left |
| rightAddon | `string` | no | — | Text addon right |

## Sizes

| Size | Height | Padding | Font |
|------|--------|---------|------|
| `sm` | `h-8` | `px-3` | `text-sm` |
| `md` | `h-10` | `px-4` | `text-sm` |
| `lg` | `h-12` | `px-4` | `text-base` |

## States

| State | Border | Background | Text |
|-------|--------|------------|------|
| default | `border-gray-300` | `bg-white` | `text-gray-900` |
| hover | `border-gray-400` | `bg-white` | `text-gray-900` |
| focus | `border-secondary-500 ring-2 ring-secondary-100` | `bg-white` | `text-gray-900` |
| error | `border-red-500 ring-2 ring-red-100` | `bg-white` | `text-gray-900` |
| disabled | `border-gray-200` | `bg-gray-50` | `text-gray-500` |
| readOnly | `border-gray-200` | `bg-gray-50` | `text-gray-700` |

## Styling

```css
.text-input {
  @apply w-full rounded-lg border;
  @apply transition-all duration-150;
  @apply focus:outline-none;
}

.text-input::placeholder {
  @apply text-gray-400;
}
```

## With Icons

```
┌─────────────────────────────┐
│  🔍  Search...              │    ← Left icon
└─────────────────────────────┘

┌─────────────────────────────┐
│  email@example.com       ✓  │    ← Right icon (validation)
└─────────────────────────────┘
```

## With Addons

```
┌─────┬─────────────────────────┐
│ https│ example.com            │    ← Left addon
└─────┴─────────────────────────┘

┌─────────────────────────┬─────┐
│ username                │ @co │    ← Right addon
└─────────────────────────┴─────┘
```

---

# 2. Textarea

## Description

Multi-line text input for longer content.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| value | `string` | yes | — | Input value |
| onChange | `(value: string) => void` | yes | — | Change handler |
| placeholder | `string` | no | — | Placeholder text |
| rows | `number` | no | `4` | Visible rows |
| minRows | `number` | no | — | Minimum rows (auto-resize) |
| maxRows | `number` | no | — | Maximum rows (auto-resize) |
| disabled | `boolean` | no | `false` | Disabled state |
| error | `boolean` | no | `false` | Error state |
| maxLength | `number` | no | — | Character limit |
| showCount | `boolean` | no | `false` | Show character count |

## Character Count Display

```
┌─────────────────────────────┐
│                             │
│  Your message here...       │
│                             │
│                             │
└─────────────────────────────┘
                      45/500    ← Character count
```

| Count State | Tailwind |
|-------------|----------|
| Normal | `text-gray-400` |
| Near limit (90%) | `text-amber-500` |
| At limit | `text-red-500` |

## Styling

```css
.textarea {
  @apply w-full rounded-lg border border-gray-300;
  @apply px-4 py-3;
  @apply resize-y; /* or resize-none for fixed */
  @apply transition-all duration-150;
}
```

---

# 3. Select (Dropdown)

## Description

Single-selection dropdown menu.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| value | `string` | yes | — | Selected value |
| onChange | `(value: string) => void` | yes | — | Change handler |
| options | `Option[]` | yes | — | Available options |
| placeholder | `string` | no | "เลือก..." | Placeholder text |
| disabled | `boolean` | no | `false` | Disabled state |
| error | `boolean` | no | `false` | Error state |
| searchable | `boolean` | no | `false` | Enable search/filter |
| size | `'sm'` \| `'md'` \| `'lg'` | no | `'md'` | Select size |

### Option Type

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| value | `string` | yes | Option value |
| label | `string` | yes | Display text |
| disabled | `boolean` | no | Disable option |
| icon | `ReactNode` | no | Option icon |

## Visual Structure

### Closed
```
┌─────────────────────────────┐
│  เลือกจังหวัด...          ▼  │
│  Select province...         │
└─────────────────────────────┘
```

### Open
```
┌─────────────────────────────┐
│  กรุงเทพมหานคร           ▲  │
├─────────────────────────────┤
│  🔍 ค้นหา...                │  ← If searchable
├─────────────────────────────┤
│  กรุงเทพมหานคร         ✓    │  ← Selected
│  นนทบุรี                    │
│  ปทุมธานี                   │
│  สมุทรปราการ                │
└─────────────────────────────┘
```

## Option States

| State | Background | Text |
|-------|------------|------|
| default | `bg-white` | `text-gray-900` |
| hover | `bg-gray-50` | `text-gray-900` |
| selected | `bg-secondary-50` | `text-secondary-700` |
| disabled | `bg-white` | `text-gray-400` |

---

# 4. Checkbox

## Description

Binary selection control.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| checked | `boolean` | yes | — | Checked state |
| onChange | `(checked: boolean) => void` | yes | — | Change handler |
| label | `string` | no | — | Label text |
| disabled | `boolean` | no | `false` | Disabled state |
| indeterminate | `boolean` | no | `false` | Partial selection |
| error | `boolean` | no | `false` | Error state |

## Visual States

| State | Box Style | Check |
|-------|-----------|-------|
| unchecked | `border-gray-300 bg-white` | — |
| checked | `border-secondary-500 bg-secondary-500` | `text-white` ✓ |
| indeterminate | `border-secondary-500 bg-secondary-500` | `text-white` — |
| hover (unchecked) | `border-gray-400` | — |
| disabled | `border-gray-200 bg-gray-100` | `text-gray-400` |
| error | `border-red-500` | — |

## Sizing

```css
.checkbox {
  @apply w-5 h-5 rounded;
  @apply border-2;
  @apply transition-all duration-150;
}
```

## With Label

```
☑ ฉันยอมรับเงื่อนไขการใช้งาน
  I agree to the terms of service
```

---

# 5. Radio

## Description

Single selection from multiple options.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| value | `string` | yes | — | Radio value |
| checked | `boolean` | yes | — | Selected state |
| onChange | `(value: string) => void` | yes | — | Change handler |
| label | `string` | no | — | Label text |
| disabled | `boolean` | no | `false` | Disabled state |
| name | `string` | yes | — | Group name |

## Visual States

| State | Circle Style | Dot |
|-------|--------------|-----|
| unchecked | `border-gray-300 bg-white` | — |
| checked | `border-secondary-500 bg-white` | `bg-secondary-500` |
| hover (unchecked) | `border-gray-400` | — |
| disabled | `border-gray-200 bg-gray-100` | `bg-gray-400` |

## Sizing

```css
.radio {
  @apply w-5 h-5 rounded-full;
  @apply border-2;
}

.radio-dot {
  @apply w-2.5 h-2.5 rounded-full;
}
```

## Radio Group

```
○ ผู้สมัครงาน (Candidate)
● บริษัท (Company)          ← Selected
○ ทั้งสองอย่าง (Both)
```

---

# 6. Toggle (Switch)

## Description

On/off toggle control.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| checked | `boolean` | yes | — | Toggle state |
| onChange | `(checked: boolean) => void` | yes | — | Change handler |
| label | `string` | no | — | Label text |
| disabled | `boolean` | no | `false` | Disabled state |
| size | `'sm'` \| `'md'` | no | `'md'` | Toggle size |

## Visual States

| State | Track | Thumb |
|-------|-------|-------|
| off | `bg-gray-200` | `bg-white` (left) |
| on | `bg-secondary-500` | `bg-white` (right) |
| disabled off | `bg-gray-100` | `bg-gray-300` |
| disabled on | `bg-secondary-200` | `bg-white` |

## Sizes

| Size | Track | Thumb |
|------|-------|-------|
| `sm` | `w-8 h-4` | `w-3 h-3` |
| `md` | `w-11 h-6` | `w-5 h-5` |

## Animation

```css
.toggle-track {
  @apply transition-colors duration-200;
}

.toggle-thumb {
  @apply transition-transform duration-200;
}
```

## With Label

```
รับการแจ้งเตือนทางอีเมล  [====○]  ← Off
Receive email notifications

รับการแจ้งเตือนทางอีเมล  [●====]  ← On
```

---

# 7. RangeSlider

## Description

Numeric range selection control.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| value | `number` \| `[number, number]` | yes | — | Current value(s) |
| onChange | `(value) => void` | yes | — | Change handler |
| min | `number` | yes | — | Minimum value |
| max | `number` | yes | — | Maximum value |
| step | `number` | no | `1` | Step increment |
| showLabels | `boolean` | no | `true` | Show min/max labels |
| showValue | `boolean` | no | `true` | Show current value |
| formatValue | `(value) => string` | no | — | Value formatter |
| disabled | `boolean` | no | `false` | Disabled state |

## Visual Structure

### Single Value
```
        ●─────────────────────────
      10,000               100,000
       ↑ current: 10,000
```

### Range (Two Thumbs)
```
        ────●══════════●──────────
      10,000               100,000
           ↑              ↑
         20,000        70,000
```

## Styling

```css
.slider-track {
  @apply h-2 bg-gray-200 rounded-full;
}

.slider-fill {
  @apply h-2 bg-secondary-500 rounded-full;
}

.slider-thumb {
  @apply w-5 h-5 bg-white rounded-full;
  @apply border-2 border-secondary-500;
  @apply shadow-sm;
  @apply cursor-pointer;
}

.slider-thumb:hover {
  @apply scale-110;
}
```

## Common Uses

| Use Case | Format | Example |
|----------|--------|---------|
| Salary | Currency | ฿20,000 - ฿50,000 |
| Experience | Years | 2 - 5 ปี |
| Distance | km | 0 - 50 กม. |

---

# 8. FileInput

## Description

File selection input with drag-and-drop support.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| accept | `string` | no | — | Accepted file types |
| multiple | `boolean` | no | `false` | Allow multiple files |
| maxSize | `number` | no | — | Max file size (bytes) |
| onChange | `(files: File[]) => void` | yes | — | Change handler |
| disabled | `boolean` | no | `false` | Disabled state |
| error | `boolean` | no | `false` | Error state |

## Visual Structure

```
┌─────────────────────────────────────────┐
│                                         │
│            📁 หรือ ลากไฟล์มาวางที่นี่      │
│               or drag files here        │
│                                         │
│              [เลือกไฟล์]                 │
│              Choose File                │
│                                         │
│         รองรับ: PDF, DOC, DOCX          │
│         ขนาดไม่เกิน 10 MB               │
│                                         │
└─────────────────────────────────────────┘
```

## States

| State | Border | Background |
|-------|--------|------------|
| default | `border-gray-300 border-dashed` | `bg-gray-50` |
| hover | `border-secondary-400 border-dashed` | `bg-secondary-50` |
| drag over | `border-secondary-500 border-solid` | `bg-secondary-100` |
| error | `border-red-500 border-dashed` | `bg-red-50` |
| disabled | `border-gray-200 border-dashed` | `bg-gray-100` |

## Error Messages

| Error | Thai | English |
|-------|------|---------|
| Invalid type | "ประเภทไฟล์ไม่รองรับ" | "File type not supported" |
| Too large | "ไฟล์ใหญ่เกินไป (สูงสุด {n} MB)" | "File too large (max {n} MB)" |
| Too many | "เลือกได้สูงสุด {n} ไฟล์" | "Maximum {n} files allowed" |

---

# 9. DatePicker

## Description

Date selection input with calendar popup.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| value | `Date` | yes | — | Selected date |
| onChange | `(date: Date) => void` | yes | — | Change handler |
| minDate | `Date` | no | — | Minimum selectable date |
| maxDate | `Date` | no | — | Maximum selectable date |
| placeholder | `string` | no | "เลือกวันที่" | Placeholder text |
| disabled | `boolean` | no | `false` | Disabled state |
| error | `boolean` | no | `false` | Error state |
| locale | `'th'` \| `'en'` | no | `'th'` | Date format locale |

## Visual Structure

### Input
```
┌─────────────────────────────┐
│  📅  15/12/2567          ▼  │    ← Thai Buddhist year
│      15/12/2024             │    ← or Gregorian
└─────────────────────────────┘
```

### Calendar Popup
```
┌─────────────────────────────────────┐
│    ◀   ธันวาคม 2567   ▶            │
│        December 2024                │
├─────────────────────────────────────┤
│  อา   จ    อ    พ   พฤ   ศ    ส   │
│  Su  Mo   Tu   We   Th   Fr   Sa   │
├─────────────────────────────────────┤
│   1    2    3    4    5    6    7   │
│   8    9   10   11   12   13   14   │
│ [15]  16   17   18   19   20   21   │  ← Selected
│  22   23   24   25   26   27   28   │
│  29   30   31                       │
└─────────────────────────────────────┘
```

## Day States

| State | Style |
|-------|-------|
| default | `text-gray-900` |
| hover | `bg-gray-100` |
| selected | `bg-secondary-500 text-white` |
| today | `border border-secondary-500` |
| disabled | `text-gray-300` |
| outside month | `text-gray-400` |

---

# 10. Shared Patterns

## Focus Ring

All focusable elements use consistent focus styling:

```css
.focus-ring {
  @apply focus:outline-none;
  @apply focus-visible:ring-2 focus-visible:ring-secondary-500 focus-visible:ring-offset-2;
}
```

## Error State

All form elements with error state:

```css
.input-error {
  @apply border-red-500;
  @apply focus:ring-red-500;
}
```

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Labels | Always associate with `for`/`id` |
| Errors | Use `aria-invalid` and `aria-describedby` |
| Required | Use `aria-required` |
| Disabled | Use native `disabled` attribute |

---

*End of Form Elements Atom Specification*
