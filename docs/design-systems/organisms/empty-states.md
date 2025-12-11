# Empty States

## Overview

Empty state components display when there is no data to show. They provide context, guidance, and often a call-to-action to help users understand why the area is empty and what they can do.

**Design Reference:** See `chancedee-design-guidelines.md` for colors, typography, and button hierarchy.

---

# 1. EmptyState

## Description

A flexible empty state component with illustration, message, and optional action. Used consistently across all list and collection views.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| variant | `'default'` \| `'error'` \| `'search'` | no | `'default'` | Visual variant |
| icon | `ReactNode` | no | — | Custom icon (overrides variant icon) |
| illustration | `'jobs'` \| `'applications'` \| `'messages'` \| `'notifications'` \| `'search'` \| `'error'` | no | — | Predefined illustration |
| title | `string` | yes | — | Primary message |
| description | `string` | no | — | Secondary explanation |
| primaryAction | `ActionConfig` | no | — | Primary CTA button |
| secondaryAction | `ActionConfig` | no | — | Secondary link/button |
| compact | `boolean` | no | `false` | Smaller variant for inline use |

### ActionConfig Type

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| label | `string` | yes | Button/link text |
| onClick | `() => void` | conditional | Click handler |
| href | `string` | conditional | Navigation link |
| icon | `ReactNode` | no | Button icon |

## Variants

| Variant | Use Case | Icon Color |
|---------|----------|------------|
| `default` | No data exists | `text-gray-400` |
| `error` | Failed to load | `text-red-500` |
| `search` | No search results | `text-gray-400` |

## Visual Structure

```
┌─────────────────────────────────────────┐
│                                         │
│            [Illustration]               │  ← 120×120 max
│                                         │
│           Primary Message               │  ← text-lg font-medium text-gray-900
│                                         │
│      Secondary explanation text         │  ← text-sm text-gray-600
│      that provides more context.        │
│                                         │
│         [Primary Action]                │  ← Primary or Secondary button
│                                         │
│          Secondary Link                 │  ← text-secondary-600 hover:underline
│                                         │
└─────────────────────────────────────────┘
```

## Compact Variant

For inline use (e.g., within cards or small sections):

```
┌───────────────────────────┐
│  [icon] Message           │
│         Action link →     │
└───────────────────────────┘
```

---

# 2. Context-Specific Empty States

## Jobs

### No Jobs Found (Search)

| Property | Thai | English |
|----------|------|---------|
| illustration | `search` | — |
| title | "ไม่พบงานที่ตรงกับการค้นหา" | No jobs match your search |
| description | "ลองปรับตัวกรองหรือค้นหาด้วยคำอื่น" | Try adjusting filters or search with different keywords |
| primaryAction | "ล้างตัวกรอง" | Clear Filters |
| secondaryAction | "ดูงานทั้งหมด" | View All Jobs |

### No Jobs Found (Empty)

| Property | Thai | English |
|----------|------|---------|
| illustration | `jobs` | — |
| title | "ยังไม่มีงานในระบบ" | No jobs available |
| description | "กรุณากลับมาใหม่ภายหลัง" | Please check back later |
| primaryAction | — | — |

### No Featured Jobs (Homepage)

| Condition | Behavior |
|-----------|----------|
| `featuredJobs.length === 0` | Hide section entirely |

### No Similar Jobs

| Condition | Behavior |
|-----------|----------|
| `similarJobs.length === 0` | Hide section entirely |

### No Recommended Jobs

| Property | Thai | English |
|----------|------|---------|
| illustration | `jobs` | — |
| title | "เรากำลังหางานที่เหมาะกับคุณ" | We're finding jobs for you |
| description | "เพิ่มข้อมูลในโปรไฟล์เพื่อรับการแนะนำที่ดีขึ้น" | Complete your profile for better recommendations |
| primaryAction | — (passive, no action) | — |

---

## Applications

### No Applications (Candidate)

| Property | Thai | English |
|----------|------|---------|
| illustration | `applications` | — |
| title | "คุณยังไม่ได้สมัครงาน" | You haven't applied to any jobs yet |
| description | "เริ่มค้นหางานที่ใช่และสมัครเลย" | Start searching for the right job and apply |
| primaryAction | "ค้นหางาน" | Search Jobs |

### No Applications (Company)

| Property | Thai | English |
|----------|------|---------|
| illustration | `applications` | — |
| title | "ยังไม่มีใบสมัคร" | No applications yet |
| description | "แชร์ลิงก์ประกาศงานเพื่อเพิ่มผู้สมัคร" | Share your job posting to attract applicants |
| primaryAction | "แชร์ลิงก์ประกาศงาน" | Share Job Link |

### No Applications in Status

| Property | Thai | English |
|----------|------|---------|
| illustration | `search` | — |
| title | "ไม่มีใบสมัครในสถานะนี้" | No applications in this status |
| description | — | — |
| primaryAction | "ดูใบสมัครทั้งหมด" | View All Applications |

---

## Saved Items

### No Saved Jobs

| Property | Thai | English |
|----------|------|---------|
| illustration | `jobs` | — |
| title | "ยังไม่มีงานที่บันทึก" | No saved jobs yet |
| description | "กดไอคอน ❤️ เพื่อบันทึกงานที่สนใจ" | Tap the ❤️ icon to save jobs you're interested in |
| primaryAction | "ค้นหางาน" | Search Jobs |

### No Saved Searches

| Property | Thai | English |
|----------|------|---------|
| illustration | `search` | — |
| title | "ยังไม่มีการค้นหาที่บันทึก" | No saved searches |
| description | "บันทึกการค้นหาเพื่อเข้าถึงได้เร็วขึ้น" | Save searches for quick access |
| primaryAction | "ค้นหางาน" | Search Jobs |

### No Job Alerts

| Property | Thai | English |
|----------|------|---------|
| illustration | `notifications` | — |
| title | "ยังไม่มีการแจ้งเตือนงาน" | No job alerts set |
| description | "ตั้งการแจ้งเตือนเพื่อรับงานใหม่ที่ตรงใจ" | Set up alerts to get notified about new matching jobs |
| primaryAction | "ตั้งการแจ้งเตือน" | Create Alert |

---

## Messages & Notifications

### No Messages

| Property | Thai | English |
|----------|------|---------|
| illustration | `messages` | — |
| title | "ยังไม่มีข้อความ" | No messages yet |
| description (candidate) | "เมื่อบริษัทติดต่อคุณ ข้อความจะแสดงที่นี่" | Messages from companies will appear here |
| description (company) | "เริ่มสนทนากับผู้สมัครที่สนใจ" | Start conversations with candidates you're interested in |
| primaryAction | — | — |

### No Notifications

| Property | Thai | English |
|----------|------|---------|
| illustration | `notifications` | — |
| title | "ยังไม่มีการแจ้งเตือน" | No notifications |
| description | "การแจ้งเตือนใหม่จะแสดงที่นี่" | New notifications will appear here |
| primaryAction | — | — |

### No Notifications (Filtered)

| Property | Thai | English |
|----------|------|---------|
| illustration | `notifications` | — |
| title | "ไม่มีการแจ้งเตือนในหมวดนี้" | No notifications in this category |
| description | — | — |
| primaryAction | "ดูทั้งหมด" | View All |

---

## Company Management

### No Job Posts

| Property | Thai | English |
|----------|------|---------|
| illustration | `jobs` | — |
| title | "ยังไม่มีประกาศงาน" | No job posts yet |
| description | "เริ่มลงประกาศงานเพื่อหาผู้สมัครที่ใช่" | Start posting jobs to find the right candidates |
| primaryAction | "ลงประกาศงานใหม่" | Create Job Post |

### No Team Members

| Property | Thai | English |
|----------|------|---------|
| illustration | `applications` (people) | — |
| title | "ยังไม่มีสมาชิกในทีม" | No team members yet |
| description | "เชิญสมาชิกเพื่อร่วมจัดการประกาศงาน" | Invite team members to help manage job posts |
| primaryAction | "เชิญสมาชิก" | Invite Member |

### No Pending Invitations

| Condition | Behavior |
|-----------|----------|
| `pendingInvites.length === 0` | Hide "Pending Invitations" section |

---

## Admin/Platform

### No Companies (Filtered)

| Property | Thai | English |
|----------|------|---------|
| illustration | `search` | — |
| title | "ไม่พบบริษัทที่ตรงกับตัวกรอง" | No companies match filters |
| description | — | — |
| primaryAction | "ล้างตัวกรอง" | Clear Filters |

### No Candidates (Filtered)

| Property | Thai | English |
|----------|------|---------|
| illustration | `search` | — |
| title | "ไม่พบผู้สมัครที่ตรงกับตัวกรอง" | No candidates match filters |
| description | — | — |
| primaryAction | "ล้างตัวกรอง" | Clear Filters |

### No Pending Approvals

| Property | Thai | English |
|----------|------|---------|
| illustration | `applications` | — |
| title | "ไม่มีรายการรออนุมัติ" | No pending approvals |
| description | "ทุกรายการได้รับการตรวจสอบแล้ว 🎉" | All items have been reviewed 🎉 |
| primaryAction | — | — |

---

## Error States

### Failed to Load

| Property | Thai | English |
|----------|------|---------|
| variant | `error` | — |
| illustration | `error` | — |
| title | "ไม่สามารถโหลดข้อมูล" | Unable to load data |
| description | "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" | An error occurred. Please try again. |
| primaryAction | "ลองใหม่" | Try Again |

### Network Error

| Property | Thai | English |
|----------|------|---------|
| variant | `error` | — |
| illustration | `error` | — |
| title | "ไม่สามารถเชื่อมต่อ" | Connection failed |
| description | "กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต" | Please check your internet connection |
| primaryAction | "ลองใหม่" | Try Again |

---

# 3. Empty State Decision Table

| Context | Condition | → Empty State Type |
|---------|-----------|-------------------|
| `/jobs` | `results.length === 0 && hasFilters` | Search - with clear filters CTA |
| `/jobs` | `results.length === 0 && !hasFilters` | Default - view all jobs CTA |
| `/jobs/[id]` similar | `similarJobs.length === 0` | Hide section |
| `/candidates/[id]` recommended | `recs.length === 0` | Passive - profile completion hint |
| `/candidates/[id]/applications` | `apps.length === 0` | Default - search jobs CTA |
| `/candidates/[id]/saved` jobs | `saved.length === 0` | Default - search jobs CTA |
| `/companies/[id]/dashboard` apps | `apps.length === 0` | Default - share job CTA |
| `/companies/[id]/dashboard/jobs` | `jobs.length === 0` | Default - create job CTA |
| `/chat` | `conversations.length === 0` | Passive - context message |
| `/notifications` | `notifications.length === 0` | Passive - info message |
| Any list | API error | Error - retry CTA |
| Any list | Network error | Error - retry CTA |

---

# 4. Styling Reference

## Container

```css
/* Default */
.empty-state {
  @apply flex flex-col items-center justify-center text-center py-12 px-4;
}

/* Compact */
.empty-state-compact {
  @apply flex items-center gap-3 py-4 px-4;
}
```

## Illustration

```css
.empty-illustration {
  @apply w-24 h-24 md:w-32 md:h-32 mb-4 text-gray-300;
}
```

## Typography

| Element | Tailwind Classes |
|---------|------------------|
| Title | `text-lg font-medium text-gray-900` |
| Description | `text-sm text-gray-600 mt-1 max-w-sm` |

## Actions

| Type | Tailwind Classes |
|------|------------------|
| Primary button | Standard button styles from design guidelines |
| Secondary link | `text-secondary-600 hover:text-secondary-700 hover:underline text-sm mt-2` |

---

# 5. Accessibility

| Element | Attribute | Value |
|---------|-----------|-------|
| Container | `role` | `status` |
| Container | `aria-live` | `polite` |
| Illustration | `aria-hidden` | `true` |
| Title | — | Visible to screen readers |
| Action button | — | Standard button accessibility |

---

*End of Empty States Organism Specification*
