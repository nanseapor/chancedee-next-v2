# Modals

## Overview

Modal components display content that requires user attention or input, blocking interaction with the underlying page. Modals are used for confirmations, forms, previews, and complex interactions.

**Design Reference:** See `chancedee-design-guidelines.md` for colors, typography, and button hierarchy.

---

# 1. ConfirmationDialog

## Description

A simple modal that asks the user to confirm or cancel an action. Used for destructive actions (delete, remove) or significant state changes.

## Variants

| Variant | Description | Confirm Button Style |
|---------|-------------|---------------------|
| `simple` | Standard confirmation | Secondary button |
| `destructive` | Dangerous action warning | Destructive button (red) |
| `critical` | Requires typed confirmation | Destructive button (red), disabled until typed |

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| open | `boolean` | yes | — | Dialog visibility |
| onClose | `() => void` | yes | — | Close handler |
| onConfirm | `() => void` | yes | — | Confirm handler |
| variant | `'simple'` \| `'destructive'` \| `'critical'` | no | `'simple'` | Dialog type |
| title | `string` | yes | — | Dialog title |
| description | `string` | yes | — | Explanation text |
| confirmLabel | `string` | no | "ยืนยัน" / Confirm | Confirm button text |
| cancelLabel | `string` | no | "ยกเลิก" / Cancel | Cancel button text |
| confirmPhrase | `string` | conditional | — | Required for `critical` variant |
| loading | `boolean` | no | `false` | Show loading state on confirm |

## Visual Structure

```
┌─────────────────────────────────────────────┐
│                                         [✕] │  ← Close button (optional)
│                                             │
│            ⚠️  (icon, variant-based)         │
│                                             │
│              Title Text                     │
│                                             │
│     Description text explaining the         │
│     action and its consequences.            │
│                                             │
│  ┌─────────────────────────────────────┐    │  ← Only for critical variant
│  │ Type "phrase" to confirm            │    │
│  └─────────────────────────────────────┘    │
│                                             │
│         [ยกเลิก]      [ยืนยัน]              │
│         Cancel        Confirm               │
└─────────────────────────────────────────────┘
```

## Variant-Specific Styling

| Variant | Icon | Icon Color | Confirm Button |
|---------|------|------------|----------------|
| `simple` | ❓ or none | `text-secondary-600` | `bg-secondary-900 text-white` |
| `destructive` | ⚠️ | `text-red-600` | `bg-red-600 text-white` |
| `critical` | ⚠️ | `text-red-600` | `bg-red-600 text-white` (disabled until typed) |

## Common Confirmation Scenarios

### Delete Job Post

| Property | Thai | English |
|----------|------|---------|
| variant | `destructive` | — |
| title | "ลบประกาศงาน" | Delete Job Post |
| description | "คุณแน่ใจหรือไม่ว่าต้องการลบประกาศงาน '{jobTitle}'? การดำเนินการนี้ไม่สามารถยกเลิกได้" | Are you sure you want to delete '{jobTitle}'? This action cannot be undone. |
| confirmLabel | "ลบ" | Delete |

### Remove Team Member

| Property | Thai | English |
|----------|------|---------|
| variant | `destructive` | — |
| title | "นำสมาชิกออก" | Remove Team Member |
| description | "คุณแน่ใจหรือไม่ว่าต้องการนำ {memberName} ออกจากทีม?" | Are you sure you want to remove {memberName} from the team? |
| confirmLabel | "นำออก" | Remove |

### Suspend Company (Admin)

| Property | Thai | English |
|----------|------|---------|
| variant | `destructive` | — |
| title | "ระงับบริษัท" | Suspend Company |
| description | "การระงับจะทำให้บริษัทไม่สามารถลงประกาศงานหรือดูใบสมัครได้ คุณแน่ใจหรือไม่?" | Suspending will prevent the company from posting jobs or viewing applications. Are you sure? |
| confirmLabel | "ระงับ" | Suspend |

### Delete Account (Critical)

| Property | Thai | English |
|----------|------|---------|
| variant | `critical` | — |
| title | "ลบบัญชี" | Delete Account |
| description | "การลบบัญชีจะลบข้อมูลทั้งหมดอย่างถาวร รวมถึงประวัติการสมัครและข้อความทั้งหมด" | Deleting your account will permanently remove all data, including application history and messages. |
| confirmPhrase | "ลบบัญชี" | delete account |
| confirmLabel | "ลบบัญชีถาวร" | Delete Account Permanently |

## State Transitions

| Current State | Event | Condition | Next State | Visual Change |
|---------------|-------|-----------|------------|---------------|
| closed | `open` → true | — | open | show overlay + dialog |
| open | click overlay | — | closed | hide dialog |
| open | click close button | — | closed | hide dialog |
| open | press Escape | — | closed | hide dialog |
| open | click cancel | — | closed | hide dialog |
| open | click confirm | `variant !== 'critical'` | confirming | show spinner on button |
| open | type text | `variant === 'critical'` | open | enable/disable confirm based on match |
| open | click confirm | `variant === 'critical' && text === phrase` | confirming | show spinner on button |
| confirming | confirm complete | — | closed | trigger onConfirm, close |
| confirming | confirm error | — | open | show error toast, reset button |

## Confirm Button State (Critical Variant)

| Typed Text | Matches Phrase | → Confirm Button |
|------------|----------------|------------------|
| empty | ❌ | disabled, `opacity-50` |
| partial match | ❌ | disabled, `opacity-50` |
| exact match | ✅ | enabled, normal |

## Accessibility

| Element | Attribute | Value |
|---------|-----------|-------|
| Dialog container | `role` | `alertdialog` |
| Dialog container | `aria-modal` | `true` |
| Dialog container | `aria-labelledby` | title element id |
| Dialog container | `aria-describedby` | description element id |
| Close button | `aria-label` | "ปิด" / "Close" |
| Confirm input (critical) | `aria-label` | "พิมพ์ '{phrase}' เพื่อยืนยัน" / "Type '{phrase}' to confirm" |

### Focus Management

| Event | Focus Behavior |
|-------|----------------|
| Open | Focus first focusable element (usually cancel button) |
| Tab | Cycle within dialog (focus trap) |
| Close | Return focus to trigger element |

---

# 2. FormModal

## Description

A modal containing a form for data input. Used for quick edits, invitations, and simple data entry without navigating away.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| open | `boolean` | yes | — | Modal visibility |
| onClose | `() => void` | yes | — | Close handler |
| onSubmit | `(data: T) => void` | yes | — | Form submit handler |
| title | `string` | yes | — | Modal title |
| description | `string` | no | — | Helper text below title |
| submitLabel | `string` | no | "บันทึก" / Save | Submit button text |
| cancelLabel | `string` | no | "ยกเลิก" / Cancel | Cancel button text |
| loading | `boolean` | no | `false` | Loading state |
| size | `'sm'` \| `'md'` \| `'lg'` | no | `'md'` | Modal width |

## Size Variants

| Size | Width | Use Case |
|------|-------|----------|
| `sm` | `max-w-sm` (384px) | Simple 1-2 field forms |
| `md` | `max-w-md` (448px) | Standard forms |
| `lg` | `max-w-lg` (512px) | Complex forms |

## Visual Structure

```
┌─────────────────────────────────────────────┐
│  Title                                  [✕] │
│  Optional description text                  │
├─────────────────────────────────────────────┤
│                                             │
│  Form fields...                             │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ Label *                             │    │
│  │ ┌─────────────────────────────────┐ │    │
│  │ │ Input                           │ │    │
│  │ └─────────────────────────────────┘ │    │
│  └─────────────────────────────────────┘    │
│                                             │
├─────────────────────────────────────────────┤
│                    [ยกเลิก]    [บันทึก]     │
│                    Cancel       Save        │
└─────────────────────────────────────────────┘
```

## Common Form Modal Scenarios

### Invite Team Member

| Property | Thai | English |
|----------|------|---------|
| title | "เชิญสมาชิกใหม่" | Invite Team Member |
| description | "ส่งคำเชิญทางอีเมลเพื่อเข้าร่วมทีม" | Send an email invitation to join the team |
| submitLabel | "ส่งคำเชิญ" | Send Invitation |

**Fields:**

| Field | Label (Thai) | English | Type | Required |
|-------|--------------|---------|------|----------|
| email | อีเมล | Email | email | ✅ |
| role | บทบาท | Role | select | ✅ |
| message | ข้อความ (ไม่บังคับ) | Message (optional) | textarea | ❌ |

### Change Role

| Property | Thai | English |
|----------|------|---------|
| title | "เปลี่ยนบทบาท" | Change Role |
| description | "เปลี่ยนบทบาทของ {memberName}" | Change role for {memberName} |
| submitLabel | "บันทึก" | Save |

**Fields:**

| Field | Label (Thai) | English | Type | Options |
|-------|--------------|---------|------|---------|
| role | บทบาทใหม่ | New Role | select | admin, hr_manager, hr_staff, viewer |

### Quick Note (Application)

| Property | Thai | English |
|----------|------|---------|
| title | "เพิ่มโน้ต" | Add Note |
| description | "โน้ตนี้จะเห็นได้เฉพาะทีม HR" | This note is only visible to HR team |
| submitLabel | "เพิ่ม" | Add |

**Fields:**

| Field | Label (Thai) | English | Type | Required |
|-------|--------------|---------|------|----------|
| note | โน้ต | Note | textarea | ✅ |

## Validation Display

| State | Display |
|-------|---------|
| No errors | Normal input styling |
| Field error | Red border, error message below field |
| Form error | Error banner at top of form |

## State Transitions

| Current State | Event | Condition | Next State | Visual Change |
|---------------|-------|-----------|------------|---------------|
| closed | `open` → true | — | open | show modal |
| open | click overlay | no unsaved changes | closed | hide modal |
| open | click overlay | has unsaved changes | confirm_close | show unsaved changes warning |
| open | press Escape | — | closed (or confirm_close) | — |
| open | click cancel | no unsaved changes | closed | hide modal |
| open | click cancel | has unsaved changes | confirm_close | show warning |
| open | submit | form invalid | open | show validation errors |
| open | submit | form valid | submitting | show spinner, disable buttons |
| submitting | success | — | closed | hide modal, show success toast |
| submitting | error | — | open | show error message, enable buttons |

### Unsaved Changes Warning

| Element | Thai | English |
|---------|------|---------|
| Title | "ยังไม่ได้บันทึก" | Unsaved Changes |
| Description | "คุณมีข้อมูลที่ยังไม่ได้บันทึก ต้องการปิดหรือไม่?" | You have unsaved changes. Are you sure you want to close? |
| Confirm | "ปิด" | Close |
| Cancel | "กลับไปแก้ไข" | Continue Editing |

---

# 3. DetailModal

## Description

A larger modal for displaying detailed content without navigation. Used for quick previews of profiles, documents, or complex data.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| open | `boolean` | yes | — | Modal visibility |
| onClose | `() => void` | yes | — | Close handler |
| title | `string` | yes | — | Modal title |
| size | `'md'` \| `'lg'` \| `'xl'` \| `'full'` | no | `'lg'` | Modal width |
| actions | `ActionDef[]` | no | — | Header action buttons |
| footer | `ReactNode` | no | — | Custom footer content |

## Size Variants

| Size | Width | Height | Use Case |
|------|-------|--------|----------|
| `md` | `max-w-2xl` | auto | Simple previews |
| `lg` | `max-w-4xl` | auto | Standard detail views |
| `xl` | `max-w-6xl` | auto | Complex data |
| `full` | `w-[95vw]` | `h-[90vh]` | Documents, galleries |

## Visual Structure

```
┌─────────────────────────────────────────────────────────┐
│  Title                          [Action] [Action]  [✕] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                                                         │
│                    Scrollable Content                   │
│                                                         │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  Optional Footer                            [Close]     │
└─────────────────────────────────────────────────────────┘
```

## Common Detail Modal Scenarios

### Candidate Profile Preview (Company View)

| Property | Value |
|----------|-------|
| size | `lg` |
| title | Candidate name |

**Header Actions:**

| Action | Thai | English | Icon |
|--------|------|---------|------|
| `accept` | ตอบรับ | Accept | ✓ |
| `reject` | ปฏิเสธ | Reject | ✕ |
| `schedule` | นัดสัมภาษณ์ | Schedule | 📅 |

**Content Sections:**
- Profile photo + basic info
- Match score (if available)
- Experience list
- Education list
- Skills
- Resume download link

### Job Post Preview (Admin Moderation)

| Property | Value |
|----------|-------|
| size | `lg` |
| title | Job title |

**Header Actions:**

| Action | Thai | English |
|--------|------|---------|
| `approve` | อนุมัติ | Approve |
| `reject` | ปฏิเสธ | Reject |
| `edit` | แก้ไข | Edit |

**Content:** Full job post preview as it would appear publicly.

---

# 4. DocumentViewer

## Description

A specialized modal for viewing PDF documents and images with zoom and download capabilities.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| open | `boolean` | yes | — | Modal visibility |
| onClose | `() => void` | yes | — | Close handler |
| document | `{ url: string, name: string, type: 'pdf' \| 'image' }` | yes | — | Document to display |
| allowDownload | `boolean` | no | `true` | Show download button |

## Visual Structure

```
┌─────────────────────────────────────────────────────────┐
│  document_name.pdf                      [⬇] [✕]        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                                                         │
│                                                         │
│                   Document Content                      │
│                   (scrollable)                          │
│                                                         │
│                                                         │
│                                                         │
├─────────────────────────────────────────────────────────┤
│         [−]  [100%]  [+]          Page 1 of 5          │
└─────────────────────────────────────────────────────────┘
```

## Controls

| Control | Action | Keyboard |
|---------|--------|----------|
| Zoom In | Increase zoom by 25% | `+` or `=` |
| Zoom Out | Decrease zoom by 25% | `-` |
| Reset Zoom | Reset to 100% | `0` |
| Fit Width | Fit to modal width | `w` |
| Download | Download original file | `d` |
| Close | Close modal | `Escape` |
| Next Page (PDF) | Go to next page | `→` or `PageDown` |
| Prev Page (PDF) | Go to previous page | `←` or `PageUp` |

## Zoom Levels

| Level | Percentage |
|-------|------------|
| Min | 25% |
| Default | 100% |
| Max | 400% |
| Step | 25% |

## Loading States

| State | Display |
|-------|---------|
| Loading | Skeleton placeholder with spinner |
| Error | Error message with retry button |
| Success | Document content |

### Error Messages

| Error | Thai | English |
|-------|------|---------|
| Load failed | "ไม่สามารถโหลดเอกสาร" | Unable to load document |
| Invalid format | "รูปแบบไฟล์ไม่รองรับ" | Unsupported file format |
| Network error | "เกิดข้อผิดพลาดในการเชื่อมต่อ" | Connection error |

---

# 5. ScheduleModal

## Description

A modal for scheduling appointments/interviews with date, time, and details selection.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| open | `boolean` | yes | — | Modal visibility |
| onClose | `() => void` | yes | — | Close handler |
| onSubmit | `(schedule: ScheduleData) => void` | yes | — | Submit handler |
| candidate | `CandidateInfo` | yes | — | Candidate being scheduled |
| job | `JobInfo` | yes | — | Related job |
| existingAppointments | `Appointment[]` | no | — | For conflict detection |

## Visual Structure

```
┌─────────────────────────────────────────────────────────┐
│  นัดสัมภาษณ์                                        [✕] │
│  Schedule Interview                                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  👤 Candidate Name                                      │
│  💼 Job Title                                           │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │  📅 เลือกวันที่ / Select Date                    │    │
│  │  [Calendar picker]                              │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │  🕐 เลือกเวลา / Select Time                      │    │
│  │  [ 09:00 ] [ 10:00 ] [ 11:00 ] ...              │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │  📍 รูปแบบการสัมภาษณ์ / Interview Type           │    │
│  │  ○ วิดีโอคอล  ○ โทรศัพท์  ○ พบตัว               │    │
│  │    Video      Phone      In-person              │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │  📝 รายละเอียดเพิ่มเติม / Additional Details     │    │
│  │  [                                            ] │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                      [ยกเลิก]  [ส่งนัดหมาย]            │
│                      Cancel    Send Invitation          │
└─────────────────────────────────────────────────────────┘
```

## Fields

| Field | Label (Thai) | English | Type | Required |
|-------|--------------|---------|------|----------|
| date | วันที่ | Date | date picker | ✅ |
| time | เวลา | Time | time slot select | ✅ |
| duration | ระยะเวลา | Duration | select | ✅ |
| type | รูปแบบ | Type | radio | ✅ |
| location | สถานที่ | Location | text | conditional |
| meetingLink | ลิงก์ประชุม | Meeting Link | url | conditional |
| notes | หมายเหตุ | Notes | textarea | ❌ |

### Interview Type Options

| Type | Thai | English | Additional Field |
|------|------|---------|------------------|
| `video` | วิดีโอคอล | Video Call | meetingLink (optional) |
| `phone` | โทรศัพท์ | Phone Call | — |
| `in_person` | พบตัว | In-person | location (required) |

### Duration Options

| Duration | Thai | English |
|----------|------|---------|
| 30 | 30 นาที | 30 minutes |
| 60 | 1 ชั่วโมง | 1 hour |
| 90 | 1.5 ชั่วโมง | 1.5 hours |
| 120 | 2 ชั่วโมง | 2 hours |

## Time Slot Display

| State | Display | Tailwind |
|-------|---------|----------|
| Available | Normal button | `border border-gray-200 hover:border-secondary-500` |
| Selected | Highlighted | `bg-secondary-500 text-white border-secondary-500` |
| Conflict | Disabled with warning | `bg-gray-100 text-gray-400 cursor-not-allowed` |
| Past | Disabled | `bg-gray-100 text-gray-400 cursor-not-allowed` |

## Validation

| Validation | Message (Thai) | English |
|------------|----------------|---------|
| Date required | "กรุณาเลือกวันที่" | Please select a date |
| Time required | "กรุณาเลือกเวลา" | Please select a time |
| Past date | "ไม่สามารถเลือกวันที่ผ่านมาแล้ว" | Cannot select a past date |
| Conflict | "มีนัดหมายอื่นในช่วงเวลานี้" | Another appointment exists at this time |
| Location required | "กรุณาระบุสถานที่" | Please enter location |

---

# 6. Shared Modal Patterns

## Overlay

All modals share the same overlay:

```
bg-black/50 backdrop-blur-sm
fixed inset-0 z-50
```

## Animation

| Event | Animation |
|-------|-----------|
| Open | Overlay: fade in (150ms), Modal: scale up + fade in (200ms) |
| Close | Modal: scale down + fade out (150ms), Overlay: fade out (150ms) |

**Tailwind classes:**
```
Overlay: transition-opacity duration-150
Modal: transition-all duration-200 ease-out
       entering: scale-95 opacity-0 → scale-100 opacity-100
       leaving: scale-100 opacity-100 → scale-95 opacity-0
```

## Mobile Behavior

| Modal Type | Mobile Adaptation |
|------------|-------------------|
| ConfirmationDialog | Bottom sheet (slide up) |
| FormModal (sm, md) | Full screen |
| FormModal (lg) | Full screen |
| DetailModal | Full screen with back button |
| DocumentViewer | Full screen |
| ScheduleModal | Full screen |

### Bottom Sheet Pattern (Mobile)

```
┌─────────────────────────┐
│                         │
│      (page content)     │
│                         │
├─────────────────────────┤
│  ═══                    │  ← Drag handle
│  Title                  │
│                         │
│  Content...             │
│                         │
│  [Cancel] [Confirm]     │
└─────────────────────────┘
```

## Z-Index Layers

| Layer | z-index | Content |
|-------|---------|---------|
| Base | 0 | Page content |
| Sticky headers | 10 | Navigation, toolbars |
| Dropdowns | 20 | Menus, popovers |
| Modal overlay | 50 | Backdrop |
| Modal content | 51 | Dialog |
| Toast | 60 | Notifications |

---

*End of Modals Organism Specification*
