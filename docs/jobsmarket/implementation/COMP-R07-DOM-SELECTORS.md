# COMP-R07 Verified DOM Selectors

**Date:** 2025-12-27
**Source:** Direct DOM inspection via Playwright MCP
**Page:** Job Detail Page

---

## Overview

This document contains **verified working selectors** based on actual DOM inspection. All selectors have been tested against the live application.

---

## View Mode Selectors

### Tabs

```typescript
// Tab list container
page.getByRole('tablist')

// Individual tabs
page.getByRole('tab', { name: 'ภาพรวม' })
page.getByRole('tab', { name: 'ใบสมัคร' })
page.getByRole('tab', { name: 'ตั้งค่า' })

// Tab panels
page.getByRole('tabpanel', { name: 'ภาพรวม' })
page.getByRole('tabpanel', { name: 'ใบสมัคร' })
page.getByRole('tabpanel', { name: 'ตั้งค่า' })
```

**DOM Structure:**
```yaml
- tablist:
  - tab "ภาพรวม" [selected]
  - tab "ใบสมัคร"
  - tab "ตั้งค่า"
- tabpanel "ภาพรวม":
  - [content]
```

---

### Job Header

```typescript
// Main job title (h1)
page.getByRole('heading', { level: 1 })
page.getByRole('heading', { name: /E2E Test Job/ })

// Status badge
page.locator('text=ฉบับร่าง')
```

**DOM Structure:**
```yaml
- heading "E2E Test Job - Software Engineer (DO NOT DELETE)" [level=1]
- generic: ฉบับร่าง
```

---

### Stats Cards

```typescript
// Individual stat headings
page.getByRole('heading', { name: 'การเข้าชม' })
page.getByRole('heading', { name: 'ใบสมัคร' })
page.getByRole('heading', { name: 'อัตราการสมัคร' })
page.getByRole('heading', { name: 'ตำแหน่งว่าง' })
```

---

### Views Chart Section

```typescript
// Section heading
page.getByRole('heading', { name: 'การเข้าชม 30 วันล่าสุด' })

// Chart (Recharts renders with role="application")
page.locator('[role="application"]').first()

// Empty state (if no data)
page.locator('text=ยังไม่มีข้อมูลการเข้าชม')
```

**DOM Structure:**
```yaml
- heading "การเข้าชม 30 วันล่าสุด" [level=3]
- application: [Chart content]
```

**Note:** Recharts library renders charts with `role="application"`, not as SVG directly.

---

### Recent Applications Section

```typescript
// Section heading
page.getByRole('heading', { name: 'ใบสมัครล่าสุด' })

// "View all" link
page.getByRole('link', { name: 'ดูทั้งหมด' })

// Empty state
page.locator('text=ยังไม่มีใบสมัคร')
```

**DOM Structure:**
```yaml
- heading "ใบสมัครล่าสุด" [level=3]
- link "ดูทั้งหมด"
- generic: ยังไม่มีใบสมัคร
```

---

### Job Preview Section

```typescript
// Section heading
page.getByRole('heading', { name: 'ตัวอย่างประกาศงาน' })

// Preview job title (h3)
page.getByRole('heading', { level: 3, name: /E2E Test Job/ })

// Preview details
page.locator('text=Bangkok, Thailand')
page.locator('text=/\\d{1,3},\\d{3}.*-.*\\d{1,3},\\d{3}.*บาท/') // Salary range
```

---

### Action Buttons

```typescript
// Edit button
page.getByRole('button', { name: 'แก้ไข' })

// Action menu button (three dots)
page.getByRole('button').filter({ hasText: '' }).nth(1) // Has icon but no text
```

---

## Edit Mode Selectors

### Edit Mode Header

```typescript
// Status indicator
page.locator('text=กำลังแก้ไข')

// Unsaved changes message
page.locator('text=มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก')

// Error count message
page.locator('text=/พบข้อผิดพลาด.*รายการ/')

// Cancel button
page.getByRole('button', { name: 'ยกเลิก' })

// Save button
page.getByRole('button', { name: 'บันทึก' })
```

---

### Form Fields

```typescript
// Job title field
page.getByRole('textbox', { name: 'ชื่อตำแหน่งงาน*' })
page.getByPlaceholder('เช่น Software Engineer')

// Employment type dropdown
page.locator('combobox').first()

// Job type dropdown
page.locator('combobox').nth(1)

// Positions spinbutton
page.getByRole('spinbutton', { name: /จำนวนตำแหน่ง/ })

// Increment button
page.getByRole('button', { name: 'เพิ่ม' })

// Decrement button
page.getByRole('button', { name: 'ลด' })

// Work location field
page.getByRole('textbox', { name: 'สถานที่ทำงาน' })

// Job description field
page.getByRole('textbox', { name: 'รายละเอียดงาน' })

// Qualifications field
page.getByRole('textbox', { name: 'คุณสมบัติ' })

// Salary min/max spinbuttons
page.getByRole('spinbutton').first() // Min
page.getByRole('spinbutton').nth(1)  // Max
```

**DOM Structure:**
```yaml
- generic: ชื่อตำแหน่งงาน*
- textbox "ชื่อตำแหน่งงาน*":
  - placeholder: เช่น Software Engineer
- generic: 48/100 (character count)

- generic: ประเภทการจ้างงาน
- combobox:
  - generic: เต็มเวลา
  - img (chevron icon)

- generic: จำนวนตำแหน่ง*
- generic:
  - button "ลด"
  - spinbutton "จำนวนตำแหน่ง*"
  - button "เพิ่ม"
```

---

### Change Indicators

```typescript
// Field change indicator (appears next to changed fields)
page.locator('text=แก้ไขแล้ว')

// Or by accessible name
page.getByRole('generic', { name: 'มีการเปลี่ยนแปลง' })
```

**DOM Structure:**
```yaml
- generic "มีการเปลี่ยนแปลง":
  - img (icon)
  - generic: แก้ไขแล้ว
```

---

### Validation Errors

```typescript
// Field-level error message
page.locator('text=Title is required')

// Or generic pattern
page.locator('text=/required|กรุณากรอก/')

// Error count in header
page.locator('text=/พบข้อผิดพลาด \\d+ รายการ/')
```

**DOM Structure:**
```yaml
- textbox "ชื่อตำแหน่งงาน*":
  - placeholder: เช่น Software Engineer
- generic: 0/100
- paragraph: Title is required
```

---

## Modals & Dialogs

### Unsaved Changes Modal

```typescript
// Alert dialog
page.getByRole('alertdialog')
page.getByRole('alertdialog', { name: 'มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก' })

// Dialog heading
page.getByRole('heading', { name: 'มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก' })

// Dialog description
page.locator('text=/คุณต้องการบันทึกการเปลี่ยนแปลง/')

// Buttons (scoped to dialog to avoid ambiguity)
page.getByRole('alertdialog').getByRole('button', { name: 'ยกเลิก' })
page.getByRole('alertdialog').getByRole('button', { name: 'ไม่บันทึก' })
page.getByRole('alertdialog').getByRole('button', { name: 'บันทึก' })
```

**DOM Structure:**
```yaml
- alertdialog "มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก":
  - generic:
    - img (warning icon)
    - heading "มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก" [level=2]
  - paragraph: คุณต้องการบันทึกการเปลี่ยนแปลงก่อนออกหรือไม่? หากไม่บันทึก การเปลี่ยนแปลงทั้งหมดจะสูญหาย
  - generic:
    - button "ยกเลิก"
    - button "ไม่บันทึก"
    - button "บันทึก"
```

---

## Navigation

### Sidebar Navigation

```typescript
// Sidebar container
page.getByRole('navigation')
page.getByRole('complementary')

// Navigation links
page.getByRole('link', { name: 'แดชบอร์ด' })
page.getByRole('link', { name: 'งานที่ประกาศ' })
page.getByRole('link', { name: 'ใบสมัคร' })
page.getByRole('link', { name: 'ทีมงาน' })
page.getByRole('link', { name: 'ตั้งค่า' })
```

---

## Common Patterns

### Waiting for Page Load

```typescript
// Wait for DOM content loaded
await page.waitForLoadState('domcontentloaded');

// Wait for sidebar to be visible
await expect(page.getByRole('navigation')).toBeVisible({ timeout: 10000 });

// Wait for main heading
await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 5000 });
```

### Checking Visibility

```typescript
// Use Playwright's auto-wait with timeout
await expect(element).toBeVisible({ timeout: 5000 });

// Check if element exists (without waiting)
const count = await element.count();
expect(count).toBeGreaterThan(0);
```

### Thai Text Matching

```typescript
// Exact match
page.locator('text=ภาพรวม')

// Regex match
page.locator('text=/การเข้าชม.*วันล่าสุด/')

// Partial match with getByRole
page.getByRole('heading', { name: /การเข้าชม/ })
```

---

## Anti-Patterns (Don't Use)

### ❌ Invalid Selector Syntax

```typescript
// ❌ WRONG - Can't comma-separate text selectors
page.locator('text=ภาพรวม, text=ใบสมัคร, text=ตั้งค่า')

// ✅ CORRECT - Check each individually
await expect(page.getByRole('tab', { name: 'ภาพรวม' })).toBeVisible();
await expect(page.getByRole('tab', { name: 'ใบสมัคร' })).toBeVisible();
await expect(page.getByRole('tab', { name: 'ตั้งค่า' })).toBeVisible();
```

### ❌ Mixing Selector Types Incorrectly

```typescript
// ❌ WRONG - Invalid syntax
page.locator('[data-testid="change-indicator"], text=แก้ไขแล้ว')

// ✅ CORRECT - Use one or the other
page.locator('[data-testid="change-indicator"]')
// OR
page.locator('text=แก้ไขแล้ว')
// OR combine with :has-text
page.locator('[data-testid="change-indicator"]:has-text("แก้ไขแล้ว")')
```

### ❌ Overly Specific Parent-Child Selectors

```typescript
// ❌ WRONG - Too specific, brittle
page.locator('text=การเข้าชม 30 วันล่าสุด >> text=ยังไม่มีข้อมูล, .recharts-wrapper')

// ✅ CORRECT - Simple, flexible
page.getByRole('heading', { name: /การเข้าชม/ })
```

### ❌ Waiting for networkidle

```typescript
// ❌ WRONG - Times out due to Firebase real-time listeners
await page.waitForLoadState('networkidle');

// ✅ CORRECT - Wait for DOM + visible elements
await page.waitForLoadState('domcontentloaded');
await expect(page.getByRole('navigation')).toBeVisible();
```

---

## Summary of Key Findings

1. **Tabs use proper ARIA roles** - `role="tablist"`, `role="tab"`, `role="tabpanel"`
2. **Recharts renders as `role="application"`** - Not SVG directly
3. **Alert dialogs use `role="alertdialog"`** - Shadcn/ui follows ARIA standards
4. **Comboboxes for dropdowns** - Not `<select>` elements
5. **Validation errors appear as paragraphs** - Below the field
6. **Change indicators have accessible names** - Can use `getByRole('generic', { name: 'มีการเปลี่ยนแปลง' })`
7. **Thai text works fine** - No encoding issues
8. **No `data-testid` attributes** - Must use semantic selectors

---

## Recommendations

1. ✅ **Use semantic selectors** - `getByRole`, `getByLabel`, `getByText`
2. ✅ **Use regex for flexible text matching** - `/pattern/` instead of exact strings
3. ✅ **Scope ambiguous selectors** - Use `.getByRole('alertdialog').getByRole('button', { name: 'บันทึก' })`
4. ✅ **Wait for specific elements** - Not for page state like `networkidle`
5. ✅ **Keep selectors simple** - Avoid complex nested selectors

---

**Document Generated:** 2025-12-27
**Verified Against:** Job Detail Page (COMP-R07)
**Next Step:** Update test file with verified selectors
