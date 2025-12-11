# Cards

## Overview

Card components display summarized content with actions. Cards are the primary way users browse and interact with jobs, companies, and applications.

**Design Reference:** See `chancedee-design-guidelines.md` for colors, typography, and badge variants.

---

# 1. JobCard

## Description

Displays job listing summary with company info, salary, location, and quick actions (save, apply).

## Variants

| Variant | Description | Tailwind Classes |
|---------|-------------|------------------|
| `default` | Full card, vertical layout | `min-w-[280px] flex-1 flex flex-col` |
| `compact` | Reduced info for sidebars/widgets | `min-w-[240px] max-w-[300px] flex flex-col` |
| `horizontal` | Row layout for lists and mobile | `w-full flex flex-row gap-4` |

**Common Styles (all variants):**
```
bg-white rounded-lg border border-gray-200
transition-all duration-150 ease-out
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| job | `JobData` | yes | — | Job information object |
| variant | `'default'` \| `'compact'` \| `'horizontal'` | no | `'default'` | Layout variant |
| showMatchScore | `boolean` | no | `false` | Display compatibility percentage |
| showSaveButton | `boolean` | no | `true` | Show bookmark action |
| isSaved | `boolean` | no | `false` | Current saved state |
| isApplied | `boolean` | no | `false` | User already applied |
| onSave | `() => void` | conditional | — | Required if `showSaveButton: true` |
| onClick | `() => void` | no | — | Card click handler (navigate to detail) |

## Variant Selection

| Route | Section | Device | → variant | → layout (container) |
|-------|---------|--------|-----------|----------------------|
| `/` | Featured Jobs | * | `default` | `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4` |
| `/jobs` | Search Results | desktop/tablet | `default` | `grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4` |
| `/jobs` | Search Results | mobile | `horizontal` | `flex flex-col gap-3` |
| `/jobs/[id]` | Similar Jobs | * | `compact` | `flex flex-col gap-3` |
| `/candidates/[id]` | Recommended Jobs | * | `compact` | `grid grid-cols-1 md:grid-cols-2 gap-3` |
| `/candidates/[id]/saved` | Saved Jobs | * | `default` | `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4` |
| `/companies/[id]` | Open Positions | * | `horizontal` | `flex flex-col gap-3` |

## Props Resolution

### showMatchScore

| isAuthenticated | userType | profileComplete | route | → showMatchScore |
|-----------------|----------|-----------------|-------|------------------|
| ❌ | — | — | * | `false` |
| ✅ | `company` | — | * | `false` |
| ✅ | `candidate` | < 50% | `/jobs` | `false` |
| ✅ | `candidate` | ≥ 50% | `/jobs` | `true` |
| ✅ | `candidate` | ≥ 30% | `/candidates/[id]` (recommended) | `true` |
| ✅ | `candidate` | — | `/candidates/[id]/saved` | `true` |
| ✅ | `candidate` | — | `/jobs/[id]` (similar) | `false` |
| ✅ | `candidate` | — | `/companies/[id]` | `true` |

### showSaveButton

| isAuthenticated | userType | route | → showSaveButton | → click behavior |
|-----------------|----------|-------|------------------|------------------|
| ❌ | — | * | `true` | redirect to `/auth/login?redirect={currentUrl}` |
| ✅ | `company` | * | `false` | — |
| ✅ | `candidate` | * | `true` | toggle save state |

### isSaved / isApplied

Simple lookup — check if `job.id` exists in user's `savedJobIds` or `appliedJobIds` arrays.

## Display Conditions

| Route | Condition A | Condition B | → Render |
|-------|-------------|-------------|----------|
| `/` | `featuredJobs.length > 0` | — | JobCard grid |
| `/` | `featuredJobs.length === 0` | — | *(hide section entirely)* |
| `/jobs` | `results.length > 0` | — | JobCard grid |
| `/jobs` | `results.length === 0` | `hasActiveFilters` | EmptyState: "ไม่พบงานที่ตรงกับการค้นหา" (No jobs match your search) / CTA: "ล้างตัวกรอง" (Clear filters) |
| `/jobs` | `results.length === 0` | `!hasActiveFilters` | EmptyState: "ไม่พบงาน" (No jobs found) / CTA: "ดูงานทั้งหมด" (View all jobs) |
| `/jobs/[id]` | `similarJobs.length > 0` | — | JobCard list (max 4) |
| `/jobs/[id]` | `similarJobs.length === 0` | — | *(hide section entirely)* |
| `/candidates/[id]` | `profileComplete < 30%` | — | ProfileCompletionCard *(instead of recommendations)* |
| `/candidates/[id]` | `profileComplete ≥ 30%` | `recommendations.length > 0` | JobCard grid (max 6) |
| `/candidates/[id]` | `profileComplete ≥ 30%` | `recommendations.length === 0` | EmptyState: "เรากำลังหางานที่เหมาะกับคุณ" (We're finding jobs for you) *(passive, no CTA)* |
| `/candidates/[id]/saved` | `savedJobs.length > 0` | — | JobCard grid |
| `/candidates/[id]/saved` | `savedJobs.length === 0` | — | EmptyState: "ยังไม่มีงานที่บันทึก" (No saved jobs yet) / CTA: "ค้นหางาน" (Search jobs) |
| `/companies/[id]` | `company.status !== 'active'` | — | *(hide section entirely)* |
| `/companies/[id]` | `company.status === 'active'` | `openPositions.length > 0` | JobCard list |
| `/companies/[id]` | `company.status === 'active'` | `openPositions.length === 0` | Message: "ยังไม่มีตำแหน่งเปิดรับ" (No open positions) |

## Element Visibility

| Element | Condition | Fallback | Tailwind Classes |
|---------|-----------|----------|------------------|
| Company Logo | always | First letter avatar | `w-12 h-12 rounded-lg` |
| Job Title | always | — | `text-base font-medium text-gray-900` |
| Company Name | always | — | `text-sm text-secondary-500 hover:text-secondary-600` |
| Location Badge | always | — | `text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded` |
| Job Type Badge | always | — | `text-xs bg-secondary-100 text-secondary-700 px-2 py-1 rounded` |
| Salary Range | `job.salaryMin !== null` | "ตามตกลง" | `text-sm font-medium text-gray-900` |
| Posted Date | always | — | `text-xs text-gray-400` |
| Match Score Badge | `showMatchScore && job.matchScore !== null` | *(hidden)* | See Match Score Styling below |
| Save Button | `showSaveButton` | *(hidden)* | `p-2 rounded-full hover:bg-gray-100` |
| Applied Badge | `isApplied` | *(hidden)* | `text-xs` + `neutral` variant |
| Expired Overlay | `job.status === 'expired'` | *(hidden)* | `absolute inset-0 bg-gray-900/50 rounded-lg` |
| Expired Badge | `job.status === 'expired'` | *(hidden)* | `text-xs` + `neutral` variant |

### Match Score Styling

| Score Range | Badge Color | Tailwind Classes |
|-------------|-------------|------------------|
| 0–39 | Red (problem) | `bg-rose-100 text-rose-700` |
| 40–69 | Amber (waiting) | `bg-amber-100 text-amber-700` |
| 70–89 | Green (success) | `bg-green-100 text-green-700` |
| 90–100 | Teal (excellent) | `bg-secondary-100 text-secondary-700 border border-secondary-500` |

### Variant-Specific Element Visibility

| Element | `default` | `compact` | `horizontal` |
|---------|-----------|-----------|--------------|
| Company Logo | ✅ 48×48 | ✅ 40×40 | ✅ 48×48 |
| Job Title | ✅ | ✅ truncate 1 line | ✅ |
| Company Name | ✅ | ✅ | ✅ |
| Location | ✅ badge | ✅ text only | ✅ badge |
| Job Type | ✅ badge | ❌ hidden | ✅ badge |
| Salary | ✅ prominent | ✅ smaller | ✅ prominent |
| Posted Date | ✅ | ❌ hidden | ✅ |
| Match Score | ✅ top-right | ✅ top-right smaller | ✅ right side |
| Save Button | ✅ top-right | ✅ top-right | ✅ right side |

## State Transitions

| Current State | Event | Condition | Next State | Visual Change | Transition |
|---------------|-------|-----------|------------|---------------|------------|
| default | mouseenter | — | hover | `shadow-md border-secondary-200` | `duration-150` |
| hover | mouseleave | — | default | remove shadow, reset border | `duration-150` |
| hover | mousedown | — | pressed | `scale-[0.98]` | `duration-75` |
| pressed | mouseup | — | hover | remove scale | `duration-75` |
| default | focus | — | focused | `ring-2 ring-secondary-200 ring-offset-2` | `duration-150` |
| focused | blur | — | default | remove ring | `duration-150` |
| focused | Enter/Space | — | — | trigger `onClick` | — |
| * | prop: `isSaved` → true | — | saved | heart icon: `fill-primary text-primary` | `duration-200` |
| * | prop: `isSaved` → false | — | unsaved | heart icon: `fill-none text-gray-400` | `duration-200` |
| * | prop: `isApplied` → true | — | applied | card: `opacity-75`, show applied badge | — |
| * | prop: `job.status` → expired | — | expired | grayscale filter, show overlay + badge | — |

`*` = modifier applied on top of any base state

## Save Button Interaction Flow

| Step | State | Event | Guard | Action | Next State | Side Effect |
|------|-------|-------|-------|--------|------------|-------------|
| 1 | idle | click | `!isAuthenticated` | — | idle | redirect `/auth/login?redirect={url}` |
| 1 | idle | click | `isAuthenticated && !isSaved` | call `saveJob` API | saving | show button spinner |
| 1 | idle | click | `isAuthenticated && isSaved` | call `unsaveJob` API | unsaving | show button spinner |
| 2 | saving | API success | — | update state | saved | toast: "บันทึกงานแล้ว" |
| 2 | saving | API error | — | — | idle | toast: "เกิดข้อผิดพลาด กรุณาลองใหม่" |
| 3 | unsaving | API success | — | update state | unsaved | toast: "ยกเลิกบันทึกแล้ว" + undo action |
| 3 | unsaving | API error | — | — | saved | toast: "เกิดข้อผิดพลาด กรุณาลองใหม่" |
| 4 | unsaved | undo click | within 5s | call `saveJob` API | saving | — |
| 4 | unsaved | timeout | 5s elapsed | — | idle | remove undo option |

### Toast Specifications

| Event | Type | Message (Thai) | English | Duration | Action |
|-------|------|----------------|---------|----------|--------|
| Save success | success | "บันทึกงานแล้ว" | Job saved | 3s | — |
| Unsave success | neutral | "ยกเลิกบันทึกแล้ว" | Bookmark removed | 5s | "ยกเลิก" / Undo |
| API error | error | "เกิดข้อผิดพลาด กรุณาลองใหม่" | An error occurred. Please try again. | 5s | "ลองใหม่" / Retry |

## Card Click Behavior

| Click Target | Action |
|--------------|--------|
| Save button | → Save Button Interaction Flow |
| Company name | navigate to `/companies/{companyId}` |
| Anywhere else | navigate to `/jobs/{jobId}` |

## Accessibility

| Element | Attribute | Value |
|---------|-----------|-------|
| Card container | `role` | `article` |
| Card container | `aria-labelledby` | `{uniqueId}-title` |
| Job title | `id` | `{uniqueId}-title` |
| Save button (unsaved) | `aria-label` | `"บันทึกงาน {jobTitle}"` |
| Save button (saved) | `aria-label` | `"ยกเลิกบันทึก {jobTitle}"` |
| Save button | `aria-pressed` | `true` / `false` |
| Match score | `aria-label` | `"ความเหมาะสม {score} เปอร์เซ็นต์"` |
| Expired overlay | `aria-label` | `"ประกาศงานหมดอายุ"` |
| Company name link | `aria-label` | `"ดูข้อมูลบริษัท {companyName}"` |

### Keyboard Navigation

| Key | Focus on Card | Focus on Save Button |
|-----|---------------|----------------------|
| Tab | → focus save button | → focus next card |
| Enter | trigger `onClick` | trigger `onSave` |
| Space | trigger `onClick` | trigger `onSave` |

## Related Components

| Relationship | Components |
|--------------|------------|
| Contains | Avatar, StatusBadge, MatchScoreBadge, IconButton (save) |
| Used with | Pagination, EmptyState, FilterSidebar, SkeletonCard |
| Similar pattern | CompanyCard, ApplicationCard |

---

# 2. ApplicationCard

## Description

Displays job application summary with status, timeline, and context-appropriate actions. Appears differently for candidates (viewing their applications) vs companies (reviewing applicants).

## Variants

| Variant | Description | Tailwind Classes |
|---------|-------------|------------------|
| `default` | Standard card with full info | `w-full flex flex-row gap-4 p-4` |
| `compact` | Reduced info for dashboard widgets | `w-full flex flex-row gap-3 p-3` |
| `detailed` | Expanded view in application panel | `w-full flex flex-col gap-4 p-4` |

**Common Styles (all variants):**
```
bg-white rounded-lg border border-gray-200
transition-all duration-150 ease-out
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| application | `ApplicationData` | yes | — | Application information |
| variant | `'default'` \| `'compact'` \| `'detailed'` | no | `'default'` | Layout variant |
| viewerType | `'candidate'` \| `'company'` | yes | — | Determines displayed info and actions |
| showMatchScore | `boolean` | no | `false` | Show compatibility (company view only) |
| isSelected | `boolean` | no | `false` | Selected state in list |
| onSelect | `() => void` | no | — | Selection handler |
| onAction | `(action: string) => void` | no | — | Action handler (accept, reject, etc.) |

## Variant Selection

| Route | Section | viewerType | → variant |
|-------|---------|------------|-----------|
| `/candidates/[id]` | Application Summary | `candidate` | `compact` |
| `/candidates/[id]/applications` | Application List | `candidate` | `default` |
| `/companies/[id]/dashboard` | Recent Applications | `company` | `compact` |
| `/companies/[id]/dashboard/applications` | Application Panel (list) | `company` | `default` |
| `/companies/[id]/dashboard/applications` | Application Panel (detail) | `company` | `detailed` |

## Display Conditions

| Route | Condition | → Render |
|-------|-----------|----------|
| `/candidates/[id]` | `recentApplications.length > 0` | ApplicationCard list (max 3) |
| `/candidates/[id]` | `recentApplications.length === 0` | EmptyState: "คุณยังไม่ได้สมัครงาน" (You haven't applied to any jobs) / CTA: "ค้นหางาน" (Search jobs) |
| `/candidates/[id]/applications` | `applications.length > 0` | ApplicationCard list with tabs |
| `/candidates/[id]/applications` | `applications.length === 0` | EmptyState: "ยังไม่มีใบสมัคร" (No applications yet) / CTA: "ค้นหางาน" (Search jobs) |
| `/companies/[id]/dashboard` | `recentApplications.length > 0` | ApplicationCard list (max 5) |
| `/companies/[id]/dashboard` | `recentApplications.length === 0` | EmptyState: "ยังไม่มีใบสมัคร" (No applications yet) / CTA: "แชร์ลิงก์ประกาศงาน" (Share job posting link) |
| `/companies/[id]/dashboard/applications` | `applications.length > 0` | Three-panel layout |
| `/companies/[id]/dashboard/applications` | `applications.length === 0` (with filters) | EmptyState: "ไม่มีใบสมัครในสถานะนี้" (No applications in this status) / CTA: "ล้างตัวกรอง" (Clear filters) |

## Element Visibility by Viewer Type

| Element | Candidate View | Company View | Tailwind Classes |
|---------|----------------|--------------|------------------|
| Company Logo | ✅ | ❌ | `w-12 h-12 rounded-lg` |
| Candidate Avatar | ❌ | ✅ | `w-12 h-12 rounded-full` |
| Job Title | ✅ | ✅ | `text-base font-medium text-gray-900` |
| Company Name | ✅ | ❌ | `text-sm text-secondary-500` |
| Candidate Name | ❌ | ✅ | `text-base font-medium text-gray-900` |
| Applied Date | ✅ | ✅ | `text-xs text-gray-400` |
| Status Badge | ✅ | ✅ | See Status Badge Mapping |
| Match Score | ❌ | ✅ (if enabled) | See JobCard Match Score Styling |
| Next Action | ✅ (if exists) | ✅ (if exists) | `text-sm text-secondary-600` |
| Timeline | ✅ (expanded) | ✅ (detailed variant) | — |
| Internal Notes | ❌ | ✅ (detailed variant) | `text-sm text-gray-600 bg-gray-50 p-3 rounded` |

### Status Badge Mapping

Uses the 4-variant badge system from design guidelines.

**Reference Enum:** `MasterJobApplicationStatuses`

| Status (enum) | Thai | English | → Badge Variant | Icon |
|---------------|------|---------|-----------------|------|
| `applied` | สมัครใหม่ | New Application | `waiting` | — |
| `read` | เปิดอ่านแล้ว | Viewed | `waiting` | — |
| `accepted` | รอนัดสัมภาษณ์ | Accepted (Pending Interview) | `success` | ✓ |
| `scheduled` | นัดสัมภาษณ์ | Interview Scheduled | `waiting` | 🔔 |
| `confirmed` | ยืนยันนัดหมาย | Interview Confirmed | `success` | ✓ |
| `cancelled` | ยกเลิกการนัดสัมภาษณ์ | Interview Cancelled | `neutral` | — |
| `declined` | ปฏิเสธนัดหมาย | Interview Declined | `problem` | ✕ |
| `rejected` | ถูกปฏิเสธ | Rejected | `problem` | ✕ |
| `withdraw` | ยกเลิกการสมัคร | Withdrawn | `neutral` | — |
| `closed` | ปิดรับสมัคร | Position Closed | `neutral` | — |
| `systemclosed` | ปิดโดยระบบ | System Closed | `neutral` | — |

### Next Action Display

| Status | Candidate Next Action | English | Company Next Action | English |
|--------|----------------------|---------|---------------------|---------|
| `scheduled` | "สัมภาษณ์: {date} {time}" | Interview: {date} {time} | "สัมภาษณ์: {date} {time}" | Interview: {date} {time} |
| `confirmed` | "ยืนยันแล้ว: {date} {time}" | Confirmed: {date} {time} | "ยืนยันแล้ว: {date} {time}" | Confirmed: {date} {time} |
| `accepted` | "รอนัดสัมภาษณ์" | Awaiting Interview Schedule | "รอนัดหมาย" | Pending Scheduling |
| `applied` | — | — | "รอดำเนินการ {n} วัน" | Pending {n} days |
| `read` | "กำลังพิจารณา" | Under Review | "รอดำเนินการ" | Pending Action |
| others | — | — | — | — |

## Actions by Context

### Candidate Actions

| Status | Available Actions (Thai) | English |
|--------|-------------------------|---------|
| `applied`, `read` | "ถอนใบสมัคร" | Withdraw Application |
| `accepted` | "รอนัดสัมภาษณ์" *(no action, display only)* | Awaiting Schedule |
| `scheduled` | "ยืนยันนัดหมาย", "ปฏิเสธนัดหมาย", "ดูรายละเอียด" | Confirm, Decline, View Details |
| `confirmed` | "ดูรายละเอียดนัดหมาย" | View Appointment Details |
| `rejected`, `withdraw`, `closed`, `systemclosed` | *(no actions)* | — |

### Company Actions

| Status | Available Actions (Thai) | English |
|--------|-------------------------|---------|
| `applied`, `read` | "ตอบรับ", "ปฏิเสธ", "ดูโปรไฟล์" | Accept, Reject, View Profile |
| `accepted` | "นัดสัมภาษณ์", "ปฏิเสธ", "ดูโปรไฟล์" | Schedule Interview, Reject, View Profile |
| `scheduled` | "เลื่อนนัดหมาย", "ยกเลิกนัดหมาย", "ดูโปรไฟล์" | Reschedule, Cancel, View Profile |
| `confirmed` | "เลื่อนนัดหมาย", "ยกเลิกนัดหมาย", "ดูโปรไฟล์" | Reschedule, Cancel, View Profile |
| `cancelled`, `declined` | "นัดใหม่", "ปฏิเสธ", "ดูโปรไฟล์" | Reschedule, Reject, View Profile |
| `rejected`, `withdraw`, `closed`, `systemclosed` | "ดูโปรไฟล์" | View Profile |

## State Transitions

| Current State | Event | Next State | Visual Change |
|---------------|-------|------------|---------------|
| default | mouseenter | hover | `shadow-md border-secondary-200` |
| hover | mouseleave | default | remove shadow |
| default | click (when selectable) | selected | `border-secondary-500 bg-secondary-50` |
| selected | click | default | remove selection styles |
| * | status change | — | badge updates, may show next action |

## Candidate Withdraw Flow

| Step | State | Event | Guard | Action | Next State | Side Effect |
|------|-------|-------|-------|--------|------------|-------------|
| 1 | idle | click withdraw | — | show confirmation dialog | confirming | — |
| 2 | confirming | confirm click | — | call `withdrawApplication` API | withdrawing | show button spinner |
| 2 | confirming | cancel click | — | — | idle | close dialog |
| 3 | withdrawing | API success | — | update status → `withdraw` | withdrawn | toast: "ถอนใบสมัครแล้ว" (Application withdrawn) |
| 3 | withdrawing | API error | — | — | idle | toast: "เกิดข้อผิดพลาด" (An error occurred) |

### Withdraw Confirmation Dialog

| Element | Thai | English |
|---------|------|---------|
| Title | "ถอนใบสมัคร" | Withdraw Application |
| Description | "คุณแน่ใจหรือไม่ว่าต้องการถอนใบสมัครตำแหน่ง {jobTitle} ที่ {companyName}?" | Are you sure you want to withdraw your application for {jobTitle} at {companyName}? |
| Confirm button | "ถอนใบสมัคร" (destructive) | Withdraw Application |
| Cancel button | "ยกเลิก" (outline) | Cancel |

## Company Accept/Reject Flow

| Step | State | Event | Guard | Action | Next State | Side Effect |
|------|-------|-------|-------|--------|------------|-------------|
| 1 | idle | click accept | — | call `acceptApplication` API | accepting | show spinner |
| 2 | accepting | API success | — | update status → `accepted` | accepted | toast: "ตอบรับผู้สมัครแล้ว" (Applicant accepted), open chat |
| 2 | accepting | API error | — | — | idle | toast: "เกิดข้อผิดพลาด" (An error occurred) |
| 1 | idle | click reject | — | show reject modal | rejecting_modal | — |
| 2 | rejecting_modal | submit | — | call `rejectApplication` API | rejecting | show spinner |
| 2 | rejecting_modal | cancel | — | — | idle | close modal |
| 3 | rejecting | API success | — | update status → `rejected` | rejected | toast: "ปฏิเสธผู้สมัครแล้ว" (Applicant rejected) |
| 3 | rejecting | API error | — | — | idle | toast: "เกิดข้อผิดพลาด" (An error occurred) |

### Reject Modal

| Element | Thai | English |
|---------|------|---------|
| Title | "ปฏิเสธผู้สมัคร" | Reject Applicant |
| Reason dropdown | "เลือกเหตุผล" (optional) | Select reason (optional) |
| Reason options | "คุณสมบัติไม่ตรง", "ประสบการณ์ไม่เพียงพอ", "ตำแหน่งเต็มแล้ว", "อื่นๆ" | Qualifications mismatch, Insufficient experience, Position filled, Other |
| Custom reason | Textarea (if "อื่นๆ" / Other selected) | — |
| Send to candidate | Checkbox "แจ้งเหตุผลให้ผู้สมัครทราบ" | Notify applicant of reason |
| Submit button | "ปฏิเสธ" (destructive) | Reject |
| Cancel button | "ยกเลิก" (outline) | Cancel |

## Accessibility

| Element | Attribute | Value |
|---------|-----------|-------|
| Card container | `role` | `article` |
| Card container (selectable) | `role` | `button` |
| Card container (selectable) | `aria-pressed` | `true` / `false` |
| Status badge | `role` | `status` |
| Action buttons | `aria-label` | `"{action} {candidateName/jobTitle}"` |

## Related Components

| Relationship | Components |
|--------------|------------|
| Contains | Avatar, StatusBadge, MatchScoreBadge, IconButton, ActionMenu |
| Used with | EmptyState, FilterTabs, ApplicationTimeline, ConfirmationDialog |
| Similar pattern | JobCard |

---

# 3. CompanyCard

## Description

Displays company summary with logo, industry, and open position count. Used in company directory and search results.

## Variants

| Variant | Description | Tailwind Classes |
|---------|-------------|------------------|
| `default` | Full card, vertical layout | `min-w-[280px] flex-1 flex flex-col` |
| `horizontal` | Row layout | `w-full flex flex-row gap-4` |

**Common Styles:**
```
bg-white rounded-lg border border-gray-200
transition-all duration-150 ease-out
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| company | `CompanyData` | yes | — | Company information |
| variant | `'default'` \| `'horizontal'` | no | `'default'` | Layout variant |
| onClick | `() => void` | no | — | Card click handler |

## Variant Selection

| Route | Section | → variant | → layout (container) |
|-------|---------|-----------|----------------------|
| `/companies` | Search Results (desktop) | `default` | `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4` |
| `/companies` | Search Results (mobile) | `horizontal` | `flex flex-col gap-3` |
| `/` | Company Carousel | `default` | `flex gap-4 overflow-x-auto` (carousel) |

## Display Conditions

| Route | Condition | → Render |
|-------|-----------|----------|
| `/companies` | `results.length > 0` | CompanyCard grid |
| `/companies` | `results.length === 0` | EmptyState: "ไม่พบบริษัทที่ตรงกับการค้นหา" (No companies match your search) / CTA: "ล้างตัวกรอง" (Clear filters) |
| `/` | `featuredCompanies.length > 0` | CompanyCard carousel |
| `/` | `featuredCompanies.length === 0` | *(hide section)* |

## Element Visibility

| Element | Condition | Fallback | Tailwind Classes |
|---------|-----------|----------|------------------|
| Company Logo | always | First letter avatar | `w-16 h-16 rounded-lg` |
| Company Name | always | — | `text-base font-medium text-gray-900` |
| Industry | always | — | `text-sm text-gray-600` |
| Location | always | — | `text-xs text-gray-400` |
| Open Positions Count | `openPositions > 0` | "ยังไม่มีตำแหน่งเปิดรับ" | `text-sm text-secondary-600 font-medium` |
| Verified Badge | `company.isVerified` | *(hidden)* | `text-secondary-500` + checkmark icon |

## State Transitions

| Current State | Event | Next State | Visual Change |
|---------------|-------|------------|---------------|
| default | mouseenter | hover | `shadow-md border-secondary-200` |
| hover | mouseleave | default | remove shadow |
| hover | mousedown | pressed | `scale-[0.98]` |
| pressed | mouseup | hover | remove scale |
| default | focus | focused | `ring-2 ring-secondary-200 ring-offset-2` |

## Accessibility

| Element | Attribute | Value |
|---------|-----------|-------|
| Card container | `role` | `article` |
| Card container | `aria-labelledby` | `{uniqueId}-name` |
| Company name | `id` | `{uniqueId}-name` |
| Verified badge | `aria-label` | `"บริษัทยืนยันแล้ว"` |
| Open positions | `aria-label` | `"{n} ตำแหน่งเปิดรับ"` |

## Related Components

| Relationship | Components |
|--------------|------------|
| Contains | Avatar, VerifiedBadge |
| Used with | Pagination, EmptyState, FilterBar |
| Similar pattern | JobCard |

---

# 4. StatCard

## Description

Displays a single statistic with label, value, optional trend indicator, and optional icon. Used in all dashboard views.

## Variants

| Variant | Description | Tailwind Classes |
|---------|-------------|------------------|
| `default` | Standard stat display | `p-4 flex flex-col gap-2` |
| `compact` | Smaller for dense layouts | `p-3 flex flex-col gap-1` |
| `horizontal` | Icon left, content right | `p-4 flex flex-row gap-4 items-center` |

**Common Styles:**
```
bg-white rounded-lg border border-gray-200
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| label | `string` | yes | — | Stat label (Thai) |
| value | `number \| string` | yes | — | Stat value |
| variant | `'default'` \| `'compact'` \| `'horizontal'` | no | `'default'` | Layout variant |
| icon | `ReactNode` | no | — | Icon component |
| trend | `{ value: number, direction: 'up' \| 'down' \| 'neutral' }` | no | — | Change indicator |
| formatter | `(value) => string` | no | — | Value formatter (e.g., currency, percentage) |
| onClick | `() => void` | no | — | Makes card clickable |

## Variant Selection

| Route | Section | → variant | → layout (container) |
|-------|---------|-----------|----------------------|
| `/candidates/[id]` | Dashboard Stats | `default` | `grid grid-cols-2 md:grid-cols-4 gap-4` |
| `/companies/[id]/dashboard` | Quick Stats | `horizontal` | `grid grid-cols-2 lg:grid-cols-4 gap-4` |
| `/platform/dashboard` | Health Metrics | `default` | `grid grid-cols-2 lg:grid-cols-4 gap-4` |
| `/platform/analytics` | Metric Cards | `horizontal` | `grid grid-cols-2 lg:grid-cols-4 gap-4` |

## Element Visibility

| Element | Condition | Tailwind Classes |
|---------|-----------|------------------|
| Icon | `icon` provided | `w-10 h-10 p-2 rounded-lg bg-secondary-50 text-secondary-600` |
| Label | always | `text-sm text-gray-600` |
| Value | always | `text-2xl font-semibold text-gray-900` (default) / `text-xl` (compact) |
| Trend | `trend` provided | See Trend Styling below |

### Trend Styling

| Direction | Icon | Color | Tailwind Classes |
|-----------|------|-------|------------------|
| `up` | ↑ | Green (positive) | `text-green-600` |
| `down` | ↓ | Red (negative context) | `text-red-600` |
| `down` | ↓ | Green (positive context, e.g., costs down) | `text-green-600` |
| `neutral` | → | Gray | `text-gray-400` |

**Note:** Trend color semantic depends on context. Pass `trendPositive: boolean` prop if needed to override default up=good/down=bad.

### Common Stat Configurations

| Dashboard | Stats (Thai) | English |
|-----------|--------------|---------|
| Candidate | "ใบสมัครทั้งหมด", "รอการตอบรับ", "นัดสัมภาษณ์", "งานที่บันทึก" | Total Applications, Pending Response, Interviews, Saved Jobs |
| Company | "ใบสมัครใหม่", "รอดำเนินการ", "นัดสัมภาษณ์วันนี้", "ตำแหน่งเปิดรับ" | New Applications, Pending Action, Today's Interviews, Open Positions |
| Platform Overview | "บริษัทใหม่", "ผู้สมัครใหม่", "ประกาศงานใหม่", "รอตรวจสอบ" | New Companies, New Candidates, New Job Posts, Pending Review |
| Platform Analytics | "ผู้ใช้งานทั้งหมด", "บริษัททั้งหมด", "ประกาศงานทั้งหมด", "ใบสมัครทั้งหมด" | Total Users, Total Companies, Total Job Posts, Total Applications |

## State Transitions

Only applicable when `onClick` is provided:

| Current State | Event | Next State | Visual Change |
|---------------|-------|------------|---------------|
| default | mouseenter | hover | `shadow-sm border-secondary-200` |
| hover | mouseleave | default | remove shadow |
| default | focus | focused | `ring-2 ring-secondary-200` |
| focused | Enter/Space | — | trigger `onClick` |

When not clickable, card has no interactive states.

## Accessibility

| Element | Attribute | Value |
|---------|-----------|-------|
| Card container (clickable) | `role` | `button` |
| Card container (static) | `role` | `figure` |
| Value | `aria-label` | `"{label}: {formattedValue}"` |
| Trend | `aria-label` | `"เพิ่มขึ้น {value}%"` / `"ลดลง {value}%"` |

## Related Components

| Relationship | Components |
|--------------|------------|
| Contains | Icon, TrendIndicator |
| Used with | Dashboard layouts |
| Similar pattern | — |

---

# 5. Shared Patterns

## Loading States (Skeleton)

All cards share a skeleton loading pattern:

| Card Type | Skeleton Structure |
|-----------|-------------------|
| JobCard | Logo placeholder + 3 text lines + badge placeholders |
| ApplicationCard | Avatar placeholder + 2 text lines + badge placeholder |
| CompanyCard | Logo placeholder + 2 text lines |
| StatCard | Icon placeholder + 2 text lines |

**Skeleton Tailwind:**
```
animate-pulse bg-gray-200 rounded
```

## Error States

When card data fails to load:

| Scenario | Display (Thai) | English |
|----------|----------------|---------|
| Single card error | "ไม่สามารถโหลดข้อมูล" + retry button | Unable to load data |
| List error | EmptyState with error variant + retry button | — |
| Partial data | Show available fields, hide missing with graceful fallbacks | — |

## Responsive Behavior Summary

| Breakpoint | JobCard | ApplicationCard | CompanyCard | StatCard |
|------------|---------|-----------------|-------------|----------|
| Mobile (<768px) | horizontal | compact | horizontal | compact |
| Tablet (768-1023px) | default, 2-col | default | default, 2-col | default, 2-col |
| Desktop (≥1024px) | default, 3-col | default | default, 3-col | default/horizontal, 4-col |

---

*End of Cards Organism Specification*
