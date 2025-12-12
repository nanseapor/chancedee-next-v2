# Form Groups

## Overview

Form group molecules combine form element atoms with labels, validation, and helper text into complete input patterns.

**Design Reference:** See `chancedee-design-guidelines.md` for colors and error states.

---

# 1. FormField

## Description

Complete form field with label, input, helper text, and error message.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| label | `string` | yes | — | Field label |
| name | `string` | yes | — | Field name/ID |
| required | `boolean` | no | `false` | Show required indicator |
| optional | `boolean` | no | `false` | Show optional indicator |
| helperText | `string` | no | — | Help text below input |
| error | `string` | no | — | Error message |
| disabled | `boolean` | no | `false` | Disabled state |
| children | `ReactNode` | yes | — | Input element |

## Visual Structure

```
ชื่อ-นามสกุล *                    ← Label
┌─────────────────────────────┐
│  สมชาย ใจดี                  │   ← Input
└─────────────────────────────┘
กรอกชื่อตามบัตรประชาชน            ← Helper text (or error)
```

### With Error

```
อีเมล *
┌─────────────────────────────┐
│  invalid-email              │   ← Error border (red)
└─────────────────────────────┘
⚠ กรุณากรอกอีเมลให้ถูกต้อง       ← Error message (red)
```

## Styling

```css
.form-field {
  @apply space-y-1.5;
}

.form-field-label {
  @apply block text-sm font-medium text-gray-700;
}

.form-field-helper {
  @apply text-xs text-gray-500;
}

.form-field-error {
  @apply text-xs text-red-600;
  @apply flex items-center gap-1;
}
```

## Accessibility

| Attribute | Value |
|-----------|-------|
| `aria-invalid` | `true` when error |
| `aria-describedby` | Links to helper/error text |
| `aria-required` | `true` when required |

---

# 2. PasswordField

## Description

Password input with visibility toggle and strength indicator.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| value | `string` | yes | — | Password value |
| onChange | `(value: string) => void` | yes | — | Change handler |
| label | `string` | no | "รหัสผ่าน" | Field label |
| showStrength | `boolean` | no | `false` | Show strength meter |
| showRequirements | `boolean` | no | `false` | Show requirement checklist |
| error | `string` | no | — | Error message |

## Visual Structure

### Basic
```
รหัสผ่าน *
┌─────────────────────────────┐
│  ••••••••               👁  │   ← Toggle visibility
└─────────────────────────────┘
```

### With Strength Meter
```
รหัสผ่าน *
┌─────────────────────────────┐
│  ••••••••               👁  │
└─────────────────────────────┘
████████████░░░░░░░░░░░░░░░░░  ← Strength: ปานกลาง
```

### With Requirements
```
รหัสผ่าน *
┌─────────────────────────────┐
│  ••••••••               👁  │
└─────────────────────────────┘
✓ อย่างน้อย 8 ตัวอักษร
✓ มีตัวพิมพ์ใหญ่
✗ มีตัวเลข
✗ มีอักขระพิเศษ
```

## Strength Levels

| Level | Label (Thai) | English | Color | Min Score |
|-------|--------------|---------|-------|-----------|
| 0 | อ่อนมาก | Very Weak | `bg-red-500` | 0 |
| 1 | อ่อน | Weak | `bg-orange-500` | 1 |
| 2 | ปานกลาง | Medium | `bg-amber-500` | 2 |
| 3 | แข็งแรง | Strong | `bg-green-500` | 3 |
| 4 | แข็งแรงมาก | Very Strong | `bg-secondary-500` | 4 |

## Requirements

| Requirement | Thai | English | Regex |
|-------------|------|---------|-------|
| Length | อย่างน้อย 8 ตัวอักษร | At least 8 characters | `.{8,}` |
| Uppercase | มีตัวพิมพ์ใหญ่ | Has uppercase | `[A-Z]` |
| Lowercase | มีตัวพิมพ์เล็ก | Has lowercase | `[a-z]` |
| Number | มีตัวเลข | Has number | `[0-9]` |
| Special | มีอักขระพิเศษ | Has special character | `[!@#$%^&*]` |

---

# 3. SearchInput

## Description

Search input with icon, clear button, and optional suggestions.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| value | `string` | yes | — | Search value |
| onChange | `(value: string) => void` | yes | — | Change handler |
| onSearch | `(value: string) => void` | no | — | Search submit handler |
| placeholder | `string` | no | "ค้นหา..." | Placeholder |
| suggestions | `string[]` | no | — | Autocomplete suggestions |
| loading | `boolean` | no | `false` | Loading state |
| size | `'sm'` \| `'md'` \| `'lg'` | no | `'md'` | Input size |

## Visual Structure

### Empty
```
┌─────────────────────────────┐
│  🔍  ค้นหางาน, บริษัท...      │
└─────────────────────────────┘
```

### With Value
```
┌─────────────────────────────┐
│  🔍  Developer           ✕  │   ← Clear button
└─────────────────────────────┘
```

### With Suggestions
```
┌─────────────────────────────┐
│  🔍  dev                 ✕  │
├─────────────────────────────┤
│  Developer                  │
│  DevOps Engineer            │
│  Development Manager        │
└─────────────────────────────┘
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Enter | Submit search |
| Escape | Clear input / close suggestions |
| Arrow Up/Down | Navigate suggestions |

---

# 4. DateRangePicker

## Description

Two connected date inputs for selecting a date range.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| startDate | `Date` | yes | — | Start date |
| endDate | `Date` | yes | — | End date |
| onChange | `(range: DateRange) => void` | yes | — | Change handler |
| minDate | `Date` | no | — | Minimum date |
| maxDate | `Date` | no | — | Maximum date |
| presets | `DatePreset[]` | no | — | Quick select presets |

## Visual Structure

```
┌──────────────┐     ┌──────────────┐
│ 📅 เริ่มต้น   │  →  │ 📅 สิ้นสุด    │
│ 01/12/2024  │     │ 31/12/2024  │
└──────────────┘     └──────────────┘
```

### With Presets
```
┌───────────────────────────────────────┐
│  [7 วัน] [30 วัน] [3 เดือน] [กำหนดเอง] │
├───────────────────────────────────────┤
│  📅 01/12/2024  →  📅 31/12/2024     │
└───────────────────────────────────────┘
```

## Common Presets

| Preset | Thai | English | Logic |
|--------|------|---------|-------|
| `7d` | 7 วันที่แล้ว | Last 7 days | today - 7 days → today |
| `30d` | 30 วันที่แล้ว | Last 30 days | today - 30 days → today |
| `3m` | 3 เดือนที่แล้ว | Last 3 months | today - 3 months → today |
| `1y` | 1 ปีที่แล้ว | Last year | today - 1 year → today |
| `custom` | กำหนดเอง | Custom | open calendar picker |

---

# 5. FileUploadZone

## Description

Drag-and-drop file upload area with preview.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| accept | `string` | no | — | Accepted file types |
| multiple | `boolean` | no | `false` | Allow multiple files |
| maxSize | `number` | no | `10 * 1024 * 1024` | Max size (bytes) |
| maxFiles | `number` | no | `1` | Max number of files |
| value | `File[]` | yes | — | Current files |
| onChange | `(files: File[]) => void` | yes | — | Change handler |
| variant | `'default'` \| `'avatar'` \| `'document'` | no | `'default'` | Upload style |

## Variants

### Default
```
┌─────────────────────────────────────────┐
│           ╭───────────────╮             │
│           │     📁        │             │
│           ╰───────────────╯             │
│                                         │
│     ลากไฟล์มาวางที่นี่ หรือ คลิกเพื่อเลือก    │
│     Drag files here or click to select  │
│                                         │
│     รองรับ: PDF, DOC, DOCX (สูงสุด 10MB) │
└─────────────────────────────────────────┘
```

### Avatar
```
┌─────────────────┐
│    ╭───────╮    │
│    │  👤   │    │
│    ╰───────╯    │
│    [เปลี่ยน]    │
└─────────────────┘
```

### Document (with preview)
```
┌─────────────────────────────────────────┐
│  📄 resume.pdf              ✕           │
│     1.2 MB • อัปโหลดเรียบร้อย             │
├─────────────────────────────────────────┤
│  + เพิ่มไฟล์                             │
└─────────────────────────────────────────┘
```

## States

| State | Border | Background |
|-------|--------|------------|
| default | `border-gray-300 border-dashed` | `bg-gray-50` |
| hover | `border-secondary-400` | `bg-secondary-50` |
| drag-active | `border-secondary-500 border-solid` | `bg-secondary-100` |
| error | `border-red-500` | `bg-red-50` |

---

# 6. TagInput

## Description

Input for adding multiple tags with autocomplete.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| value | `string[]` | yes | — | Current tags |
| onChange | `(tags: string[]) => void` | yes | — | Change handler |
| suggestions | `string[]` | no | — | Autocomplete suggestions |
| maxTags | `number` | no | — | Maximum allowed tags |
| placeholder | `string` | no | "เพิ่มแท็ก..." | Placeholder |
| allowCustom | `boolean` | no | `true` | Allow custom tags |

## Visual Structure

```
ทักษะ
┌─────────────────────────────────────────┐
│  [JavaScript ✕] [React ✕] [Node.js ✕]   │
│  เพิ่มทักษะ...                           │
└─────────────────────────────────────────┘
```

### With Suggestions
```
┌─────────────────────────────────────────┐
│  [JavaScript ✕] [React ✕] typ          │
├─────────────────────────────────────────┤
│  TypeScript                             │
│  Python                                 │
└─────────────────────────────────────────┘
```

## Tag Chip Styling

```css
.tag-chip {
  @apply inline-flex items-center gap-1;
  @apply bg-secondary-100 text-secondary-700;
  @apply px-2 py-1 rounded-full;
  @apply text-sm;
}

.tag-chip-remove {
  @apply hover:bg-secondary-200 rounded-full p-0.5;
}
```

## Keyboard Navigation

| Key | Action |
|-----|--------|
| Enter | Add tag |
| Backspace (empty) | Remove last tag |
| Escape | Close suggestions |
| Arrow Up/Down | Navigate suggestions |

---

# 7. PhoneInput

## Description

Phone number input with country code selector.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| value | `string` | yes | — | Phone number |
| onChange | `(value: string) => void` | yes | — | Change handler |
| defaultCountry | `string` | no | `'TH'` | Default country code |
| onlyCountries | `string[]` | no | — | Limit country options |

## Visual Structure

```
เบอร์โทรศัพท์
┌──────┬───────────────────────────┐
│ 🇹🇭+66│ 81-234-5678              │
└──────┴───────────────────────────┘
```

### Country Selector Open
```
┌──────┬───────────────────────────┐
│ 🇹🇭+66│                          │
├──────┴───────────────────────────┤
│  🇹🇭 Thailand (+66)              │
│  🇺🇸 United States (+1)          │
│  🇯🇵 Japan (+81)                 │
└──────────────────────────────────┘
```

## Formatting

| Country | Format Example |
|---------|----------------|
| TH | 081-234-5678 |
| US | (555) 123-4567 |
| JP | 03-1234-5678 |

---

# 8. AddressField

## Description

Structured address input with province/district/subdistrict selection.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| value | `Address` | yes | — | Address object |
| onChange | `(address: Address) => void` | yes | — | Change handler |
| showPostalCode | `boolean` | no | `true` | Show postal code field |

### Address Type

| Field | Thai | English |
|-------|------|---------|
| `province` | จังหวัด | Province |
| `district` | อำเภอ/เขต | District |
| `subdistrict` | ตำบล/แขวง | Subdistrict |
| `postalCode` | รหัสไปรษณีย์ | Postal Code |
| `street` | ที่อยู่ | Street Address |

## Visual Structure

```
ที่อยู่
┌─────────────────────────────────────────┐
│  123/45 ถนนสุขุมวิท                      │
└─────────────────────────────────────────┘

จังหวัด                    อำเภอ/เขต
┌─────────────────────┐   ┌─────────────────────┐
│  กรุงเทพมหานคร    ▼  │   │  วัฒนา           ▼  │
└─────────────────────┘   └─────────────────────┘

ตำบล/แขวง                  รหัสไปรษณีย์
┌─────────────────────┐   ┌─────────────────────┐
│  คลองเตยเหนือ     ▼  │   │  10110              │
└─────────────────────┘   └─────────────────────┘
```

## Cascading Behavior

| Action | Result |
|--------|--------|
| Change province | Reset district, subdistrict, postal code |
| Change district | Reset subdistrict, postal code |
| Change subdistrict | Auto-fill postal code |

---

*End of Form Groups Molecule Specification*
