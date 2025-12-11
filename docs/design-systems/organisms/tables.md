# Tables

## Overview

Table components display structured data with sorting, filtering, selection, and actions. Tables are primarily used in dashboard and admin views for managing jobs, applications, team members, and platform entities.

**Design Reference:** See `chancedee-design-guidelines.md` for colors, typography, and badge variants.

---

# 1. DataTable

## Description

A feature-rich table component with sortable columns, bulk selection, row actions, and pagination. Adapts to mobile with card-based alternative view.

## Variants

| Variant | Description | Tailwind Classes |
|---------|-------------|------------------|
| `default` | Full table with all features | `w-full` |
| `compact` | Reduced padding, smaller text | `w-full text-sm` |
| `simple` | No bulk actions, minimal features | `w-full` |

**Common Styles:**
```
bg-white rounded-lg border border-gray-200 overflow-hidden
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| columns | `ColumnDef[]` | yes | — | Column definitions |
| data | `T[]` | yes | — | Data array |
| variant | `'default'` \| `'compact'` \| `'simple'` | no | `'default'` | Table variant |
| selectable | `boolean` | no | `false` | Enable row selection |
| onSelectionChange | `(ids: string[]) => void` | conditional | — | Required if `selectable: true` |
| sortable | `boolean` | no | `true` | Enable column sorting |
| defaultSort | `{ column: string, direction: 'asc' \| 'desc' }` | no | — | Initial sort state |
| onSort | `(sort: SortState) => void` | no | — | Sort change handler |
| pagination | `PaginationConfig` | no | — | Pagination settings |
| onRowClick | `(row: T) => void` | no | — | Row click handler |
| rowActions | `ActionDef[]` | no | — | Actions per row |
| bulkActions | `ActionDef[]` | no | — | Actions for selected rows |
| loading | `boolean` | no | `false` | Show loading state |
| emptyState | `EmptyStateConfig` | no | — | Custom empty state |

### ColumnDef Type

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| id | `string` | yes | Column identifier |
| header | `string` | yes | Column header text |
| accessorKey | `string` | no | Data key to access |
| cell | `(row: T) => ReactNode` | no | Custom cell renderer |
| sortable | `boolean` | no | Override table-level sortable |
| width | `string` | no | Column width (Tailwind or CSS) |
| align | `'left'` \| `'center'` \| `'right'` | no | Text alignment |
| hideOnMobile | `boolean` | no | Hide column on mobile view |

## Route-Specific Configurations

### Company Jobs Table (`/companies/[id]/dashboard/jobs`)

**Columns:**

| Column ID | Header (Thai) | English | Width | Sortable | Mobile |
|-----------|---------------|---------|-------|----------|--------|
| `checkbox` | — | — | `w-12` | ❌ | ❌ |
| `title` | ตำแหน่ง | Position | `flex-1 min-w-[200px]` | ✅ | ✅ |
| `department` | แผนก | Department | `w-32` | ✅ | ❌ |
| `applications` | ใบสมัคร | Applications | `w-24` | ✅ | ✅ |
| `views` | ผู้เข้าชม | Views | `w-24` | ✅ | ❌ |
| `posted` | วันที่ลง | Posted Date | `w-28` | ✅ | ❌ |
| `status` | สถานะ | Status | `w-28` | ✅ | ✅ |
| `actions` | — | — | `w-16` | ❌ | ✅ |

**Bulk Actions:**

| Action | Thai | English | Icon | Condition |
|--------|------|---------|------|-----------|
| `pause` | หยุดชั่วคราว | Pause | ⏸ | status = `active` |
| `resume` | เปิดรับต่อ | Resume | ▶ | status = `paused` |
| `close` | ปิดรับสมัคร | Close | ✕ | status = `active` or `paused` |
| `delete` | ลบ | Delete | 🗑 | status = `draft` or `closed` |

**Row Actions:**

| Action | Thai | English | Icon | Always Visible |
|--------|------|---------|------|----------------|
| `edit` | แก้ไข | Edit | ✏️ | ✅ |
| `duplicate` | ทำซ้ำ | Duplicate | 📋 | ❌ (menu) |
| `view` | ดู | View | 👁 | ❌ (menu) |
| `delete` | ลบ | Delete | 🗑 | ❌ (menu, destructive) |

---

### Company Team Table (`/companies/[id]/dashboard/team`)

**Columns:**

| Column ID | Header (Thai) | English | Width | Sortable | Mobile |
|-----------|---------------|---------|-------|----------|--------|
| `member` | สมาชิก | Member | `flex-1 min-w-[200px]` | ✅ | ✅ |
| `email` | อีเมล | Email | `w-48` | ✅ | ❌ |
| `role` | บทบาท | Role | `w-32` | ✅ | ✅ |
| `status` | สถานะ | Status | `w-28` | ✅ | ❌ |
| `actions` | — | — | `w-16` | ❌ | ✅ |

**Member Cell Content:**
- Avatar (40×40)
- Name (bold)
- Position/title (gray, smaller)

**Role Options:**

| Role ID | Thai | English |
|---------|------|---------|
| `admin` | ผู้ดูแลระบบ | Admin |
| `hr_manager` | ผู้จัดการ HR | HR Manager |
| `hr_staff` | เจ้าหน้าที่ HR | HR Staff |
| `viewer` | ผู้ดูอย่างเดียว | Viewer |

**Row Actions:**

| Action | Thai | English | Condition |
|--------|------|---------|-----------|
| `change_role` | เปลี่ยนบทบาท | Change Role | status = `active` |
| `resend_invite` | ส่งคำเชิญอีกครั้ง | Resend Invite | status = `pending` |
| `remove` | นำออก | Remove | cannot remove self |

---

### Platform Companies Table (`/platform/companies`)

**Columns:**

| Column ID | Header (Thai) | English | Width | Sortable | Mobile |
|-----------|---------------|---------|-------|----------|--------|
| `checkbox` | — | — | `w-12` | ❌ | ❌ |
| `company` | บริษัท | Company | `flex-1 min-w-[200px]` | ✅ | ✅ |
| `industry` | ประเภทธุรกิจ | Industry | `w-36` | ✅ | ❌ |
| `jobs` | ประกาศงาน | Job Posts | `w-24` | ✅ | ❌ |
| `registered` | วันที่สมัคร | Registered | `w-28` | ✅ | ❌ |
| `status` | สถานะ | Status | `w-28` | ✅ | ✅ |
| `actions` | — | — | `w-16` | ❌ | ✅ |

**Company Cell Content:**
- Logo (40×40)
- Company name (bold)
- Verified badge (if verified)

**Status Badge Mapping:**

| Status | Thai | English | → Badge Variant |
|--------|------|---------|-----------------|
| `pending` | รอตรวจสอบ | Pending Review | `waiting` |
| `active` | ใช้งาน | Active | `success` |
| `suspended` | ถูกระงับ | Suspended | `problem` |
| `verified` | ยืนยันแล้ว | Verified | `success` + ✓ |

**Bulk Actions:**

| Action | Thai | English | Condition |
|--------|------|---------|-----------|
| `verify` | ยืนยัน | Verify | status = `active` |
| `suspend` | ระงับ | Suspend | status = `active` or `verified` |
| `unsuspend` | ยกเลิกระงับ | Unsuspend | status = `suspended` |

**Row Actions:**

| Action | Thai | English |
|--------|------|---------|
| `view` | ดูรายละเอียด | View Details |
| `edit` | แก้ไข | Edit |
| `suspend` | ระงับ | Suspend |
| `delete` | ลบ | Delete (destructive) |

---

### Platform Candidates Table (`/platform/candidates`)

**Columns:**

| Column ID | Header (Thai) | English | Width | Sortable | Mobile |
|-----------|---------------|---------|-------|----------|--------|
| `candidate` | ผู้สมัคร | Candidate | `flex-1 min-w-[200px]` | ✅ | ✅ |
| `email` | อีเมล | Email | `w-48` | ✅ | ❌ |
| `applications` | ใบสมัคร | Applications | `w-24` | ✅ | ❌ |
| `registered` | วันที่สมัคร | Registered | `w-28` | ✅ | ❌ |
| `status` | สถานะ | Status | `w-28` | ✅ | ✅ |
| `actions` | — | — | `w-16` | ❌ | ✅ |

**Row Actions:**

| Action | Thai | English |
|--------|------|---------|
| `view` | ดูโปรไฟล์ | View Profile |
| `suspend` | ระงับ | Suspend |

---

### Platform Jobs Table (`/platform/jobs`)

**Columns:**

| Column ID | Header (Thai) | English | Width | Sortable | Mobile |
|-----------|---------------|---------|-------|----------|--------|
| `checkbox` | — | — | `w-12` | ❌ | ❌ |
| `title` | ตำแหน่ง | Position | `flex-1 min-w-[200px]` | ✅ | ✅ |
| `company` | บริษัท | Company | `w-40` | ✅ | ❌ |
| `reports` | รายงาน | Reports | `w-24` | ✅ | ✅ |
| `posted` | วันที่ลง | Posted | `w-28` | ✅ | ❌ |
| `status` | สถานะ | Status | `w-28` | ✅ | ✅ |
| `actions` | — | — | `w-16` | ❌ | ✅ |

**Reports Cell:**
- Show count badge if `reports > 0`
- Badge color: `problem` variant if `reports >= 3`

**Row Actions:**

| Action | Thai | English |
|--------|------|---------|
| `view` | ดูประกาศ | View Post |
| `moderate` | ตรวจสอบ | Moderate |
| `remove` | นำออก | Remove (destructive) |

---

## Element Visibility

| Element | Condition | Tailwind Classes |
|---------|-----------|------------------|
| Select All Checkbox | `selectable: true` | `w-5 h-5` |
| Row Checkbox | `selectable: true` | `w-5 h-5` |
| Sort Icon | `column.sortable && sortable` | `w-4 h-4 text-gray-400` |
| Sort Icon (active) | currently sorted | `text-secondary-600` |
| Bulk Action Bar | `selectedIds.length > 0` | `bg-secondary-50 border-b` |
| Pagination | `pagination && data.length > 0` | — |
| Empty State | `data.length === 0 && !loading` | — |
| Loading Skeleton | `loading: true` | — |

### Bulk Action Bar

| Element | Thai | English | Tailwind |
|---------|------|---------|----------|
| Selected count | "เลือก {n} รายการ" | {n} selected | `text-sm text-gray-600` |
| Clear selection | "ยกเลิก" | Clear | `text-secondary-600 hover:underline` |
| Action buttons | — | — | `gap-2` |

## State Transitions

| Current State | Event | Condition | Next State | Visual Change |
|---------------|-------|-----------|------------|---------------|
| default | hover row | — | row_hover | `bg-gray-50` |
| row_hover | mouse leave | — | default | remove bg |
| default | click checkbox | — | selected | `bg-secondary-50`, checkbox checked |
| selected | click checkbox | — | default | remove bg, checkbox unchecked |
| default | click select all | — | all_selected | all rows `bg-secondary-50` |
| all_selected | click select all | — | default | remove all bg |
| default | click sort header | `column.sortable` | sorted_asc | show ↑ icon |
| sorted_asc | click same header | — | sorted_desc | show ↓ icon |
| sorted_desc | click same header | — | default | remove icon |
| sorted_* | click different header | — | sorted_asc (new) | move icon to new column |

## Row Action Menu Interaction

| Step | State | Event | Action | Next State | Side Effect |
|------|-------|-------|--------|------------|-------------|
| 1 | closed | click action button | — | open | show dropdown menu |
| 2 | open | click outside | — | closed | hide menu |
| 2 | open | click action | execute action | closed | trigger action callback |
| 2 | open | press Escape | — | closed | hide menu |

### Action Confirmation

| Action Type | Requires Confirmation | Confirmation Style |
|-------------|----------------------|-------------------|
| `view`, `edit`, `duplicate` | ❌ | — |
| `pause`, `resume`, `close` | ❌ | — |
| `suspend`, `unsuspend` | ✅ | Simple dialog |
| `delete`, `remove` | ✅ | Destructive dialog |
| Bulk actions | ✅ | Dialog with count |

## Pagination

| Element | Thai | English |
|---------|------|---------|
| Page info | "แสดง {start}-{end} จาก {total}" | Showing {start}-{end} of {total} |
| Previous | "ก่อนหน้า" | Previous |
| Next | "ถัดไป" | Next |
| Page size label | "แสดง" | Show |
| Page size options | 10, 20, 50, 100 | — |

**Page Size Selector:**
```
แสดง [20 ▼] รายการต่อหน้า
Show [20 ▼] per page
```

## Mobile Adaptation

On mobile (`< 768px`), DataTable transforms to card-based view:

| Desktop Element | Mobile Equivalent |
|-----------------|-------------------|
| Table row | Card |
| Visible columns | Card content |
| Hidden columns | Expandable section |
| Row checkbox | Card checkbox (top-right) |
| Row actions | Swipe actions or action button |
| Bulk action bar | Bottom sticky bar |
| Pagination | Infinite scroll or load more button |

### Mobile Card Structure

```
┌─────────────────────────────────────┐
│ [☐]                          [⋮]   │  ← Checkbox + Action menu
│ ┌────┐                              │
│ │Logo│ Title                        │  ← Primary info
│ └────┘ Subtitle                     │
│                                     │
│ Status Badge    Secondary Info      │  ← Badges + key data
│                                     │
│ [Expand ▼]                          │  ← Show hidden columns
└─────────────────────────────────────┘
```

## Empty States

| Context | Message (Thai) | English | CTA (Thai) | CTA English |
|---------|----------------|---------|------------|-------------|
| No jobs | "ยังไม่มีประกาศงาน" | No job posts yet | "ลงประกาศงานใหม่" | Create Job Post |
| No team | "ยังไม่มีสมาชิกในทีม" | No team members | "เชิญสมาชิก" | Invite Member |
| No companies | "ไม่พบบริษัท" | No companies found | "ล้างตัวกรอง" | Clear Filters |
| No candidates | "ไม่พบผู้สมัคร" | No candidates found | "ล้างตัวกรอง" | Clear Filters |
| Filter no results | "ไม่พบข้อมูลที่ตรงกับตัวกรอง" | No results match filters | "ล้างตัวกรอง" | Clear Filters |

## Loading State

| Element | Loading Behavior |
|---------|------------------|
| Header | Show normally |
| Rows | Show skeleton rows (match pagination size) |
| Pagination | Hide or disable |
| Actions | Disable |

**Skeleton Row:** 
```
animate-pulse bg-gray-200 h-4 rounded
```

Show 3-5 skeleton columns per row to match expected content.

## Accessibility

| Element | Attribute | Value |
|---------|-----------|-------|
| Table | `role` | `table` (or grid for interactive) |
| Header row | `role` | `row` |
| Header cell | `role` | `columnheader` |
| Sortable header | `aria-sort` | `ascending` / `descending` / `none` |
| Body row | `role` | `row` |
| Body cell | `role` | `cell` |
| Checkbox | `aria-label` | "เลือก {item name}" / "Select {item name}" |
| Select all | `aria-label` | "เลือกทั้งหมด" / "Select all" |
| Action menu trigger | `aria-haspopup` | `true` |
| Action menu trigger | `aria-expanded` | `true` / `false` |
| Pagination | `role` | `navigation` |
| Pagination | `aria-label` | "การแบ่งหน้า" / "Pagination" |

### Keyboard Navigation

| Key | Focus on Header | Focus on Row | Focus on Action Menu |
|-----|-----------------|--------------|----------------------|
| Tab | → first row | → next row / action | → next action |
| Enter | sort (if sortable) | row click or expand | execute action |
| Space | sort (if sortable) | toggle checkbox | execute action |
| Escape | — | — | close menu |
| Arrow Up/Down | — | navigate rows | navigate actions |

## Related Components

| Relationship | Components |
|--------------|------------|
| Contains | Checkbox, StatusBadge, Avatar, ActionMenu, Pagination, Skeleton |
| Used with | FilterBar, SearchInput, BulkActionBar, EmptyState |
| Mobile alternative | CardList |

---

# 2. FilterBar

## Description

Horizontal bar with filter controls for tables. Typically placed above the DataTable.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| filters | `FilterDef[]` | yes | — | Available filters |
| values | `FilterValues` | yes | — | Current filter values |
| onChange | `(values: FilterValues) => void` | yes | — | Change handler |
| onClear | `() => void` | no | — | Clear all filters |

### FilterDef Type

| Property | Type | Description |
|----------|------|-------------|
| id | `string` | Filter identifier |
| label | `string` | Display label |
| type | `'select'` \| `'multiselect'` \| `'date'` \| `'daterange'` \| `'search'` | Filter type |
| options | `{ value: string, label: string }[]` | For select types |
| placeholder | `string` | Placeholder text |

## Common Filter Configurations

### Jobs Filter Bar

| Filter ID | Label (Thai) | English | Type | Options |
|-----------|--------------|---------|------|---------|
| `search` | ค้นหา | Search | `search` | — |
| `status` | สถานะ | Status | `select` | active, draft, paused, closed |
| `department` | แผนก | Department | `select` | From company data |
| `posted` | วันที่ลง | Posted Date | `daterange` | — |

### Companies Filter Bar (Admin)

| Filter ID | Label (Thai) | English | Type | Options |
|-----------|--------------|---------|------|---------|
| `search` | ค้นหา | Search | `search` | — |
| `status` | สถานะ | Status | `multiselect` | pending, active, suspended, verified |
| `industry` | ประเภทธุรกิจ | Industry | `select` | From master data |
| `registered` | วันที่สมัคร | Registered | `daterange` | — |

## Active Filters Display

When filters are active, show chips below the filter bar:

| Element | Thai | English | Tailwind |
|---------|------|---------|----------|
| Active filter chip | "{label}: {value}" | — | `bg-secondary-100 text-secondary-700 px-2 py-1 rounded-full text-sm` |
| Remove filter | ✕ | — | `ml-1 hover:text-secondary-900` |
| Clear all | "ล้างตัวกรองทั้งหมด" | Clear all filters | `text-secondary-600 hover:underline text-sm` |

## Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| Desktop | Inline filters in row |
| Tablet | Wrap to 2 rows if needed |
| Mobile | Filter button → opens bottom sheet with all filters |

### Mobile Filter Button

| State | Display |
|-------|---------|
| No filters active | "ตัวกรอง" (Filters) |
| Filters active | "ตัวกรอง ({n})" with badge |

---

# 3. ActionMenu

## Description

Dropdown menu for row-level actions. Triggered by clicking the action button (⋮ or "..." icon).

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| actions | `ActionDef[]` | yes | — | Available actions |
| onAction | `(actionId: string) => void` | yes | — | Action handler |
| disabled | `boolean` | no | `false` | Disable all actions |

### ActionDef Type

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| id | `string` | yes | Action identifier |
| label | `string` | yes | Display label |
| icon | `ReactNode` | no | Action icon |
| variant | `'default'` \| `'destructive'` | no | Visual variant |
| disabled | `boolean` | no | Disable this action |
| hidden | `boolean` | no | Hide this action |

## Visual Styling

| Element | Tailwind Classes |
|---------|------------------|
| Trigger button | `p-2 rounded hover:bg-gray-100` |
| Menu container | `bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[160px]` |
| Menu item | `px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2` |
| Menu item (destructive) | `text-red-600 hover:bg-red-50` |
| Menu item (disabled) | `text-gray-400 cursor-not-allowed` |
| Separator | `border-t border-gray-100 my-1` |

## Menu Position

| Trigger Position | Menu Opens |
|------------------|------------|
| Left side of viewport | Right-aligned dropdown |
| Right side of viewport | Left-aligned dropdown |
| Near bottom | Upward (dropup) |

---

*End of Tables Organism Specification*
