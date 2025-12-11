# Navigation

## Overview

Navigation components provide the structural shell and wayfinding for the platform. Different user types have distinct navigation patterns optimized for their workflows.

**Design Reference:** See `chancedee-design-guidelines.md` for colors, typography, and badge variants.

---

# 1. Sidebar

## Description

The primary navigation component for authenticated users on desktop. Contains user info, navigation links, and contextual widgets.

## Variants

| Variant | User Type | Width | Background |
|---------|-----------|-------|------------|
| `candidate` | Job seekers | `240px` | `bg-white` |
| `company` | Employers | `260px` | `bg-white` |
| `admin` | Platform admins | `280px` | `bg-secondary-950` |

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| variant | `'candidate'` \| `'company'` \| `'admin'` | yes | — | Sidebar type |
| user | `UserInfo` | yes | — | Current user data |
| currentPath | `string` | yes | — | Active route path |
| collapsed | `boolean` | no | `false` | Collapsed state (icon only) |
| onCollapse | `() => void` | no | — | Toggle collapse handler |

## Visual Structure

```
┌────────────────────────────┐
│  [Logo]         [Collapse] │  ← Header
├────────────────────────────┤
│  ┌────────────────────────┐│
│  │ 👤 User Name           ││  ← User Profile
│  │    user@email.com      ││
│  │    [65%] ━━━━░░        ││     (completion ring for candidates)
│  └────────────────────────┘│
├────────────────────────────┤
│  🏠 หน้าหลัก          (●)  │  ← Navigation Items
│  💼 หางาน                  │     (● = active indicator)
│  📄 ใบสมัคร            3   │     (3 = badge count)
│  ❤️ บันทึกไว้              │
│  💬 ข้อความ            2   │
│  ⚙️ ตั้งค่า                │
├────────────────────────────┤
│  📅 การนัดหมาย             │  ← Contextual Widget
│  ┌────────────────────────┐│
│  │ 15 ธ.ค. Interview...   ││
│  │ 18 ธ.ค. Another...     ││
│  └────────────────────────┘│
│  ดูทั้งหมด →               │
├────────────────────────────┤
│  [ออกจากระบบ]              │  ← Footer
└────────────────────────────┘
```

## Navigation Items by Variant

### Candidate Sidebar

| Icon | Label (Thai) | English | Path | Badge |
|------|--------------|---------|------|-------|
| 🏠 | หน้าหลัก | Dashboard | `/candidates/[id]` | — |
| 💼 | หางาน | Find Jobs | `/jobs` | — |
| 📄 | ใบสมัคร | Applications | `/candidates/[id]/applications` | pending count |
| ❤️ | บันทึกไว้ | Saved | `/candidates/[id]/saved` | — |
| 💬 | ข้อความ | Messages | `/chat` | unread count |
| ⚙️ | ตั้งค่า | Settings | `/candidates/[id]/settings` | — |

### Company Sidebar

| Icon | Label (Thai) | English | Path | Badge |
|------|--------------|---------|------|-------|
| 🏠 | แดชบอร์ด | Dashboard | `/companies/[id]/dashboard` | — |
| 📋 | ประกาศงาน | Job Posts | `/companies/[id]/dashboard/jobs` | — |
| 📄 | ใบสมัคร | Applications | `/companies/[id]/dashboard/applications` | new count |
| 👥 | ทีม | Team | `/companies/[id]/dashboard/team` | — |
| 🔍 | ค้นหาผู้สมัคร | Find Candidates | `/companies/[id]/dashboard/candidates` | — |
| 💬 | ข้อความ | Messages | `/chat` | unread count |
| ⚙️ | ตั้งค่า | Settings | `/companies/[id]/dashboard/settings` | — |

### Admin Sidebar

| Icon | Label (Thai) | English | Path | Badge |
|------|--------------|---------|------|-------|
| 🏠 | ภาพรวม | Overview | `/platform` | — |
| 📊 | แดชบอร์ด | Dashboard | `/platform/dashboard` | — |
| 🏢 | บริษัท | Companies | `/platform/companies` | pending count |
| 👤 | ผู้สมัคร | Candidates | `/platform/candidates` | — |
| 📋 | ประกาศงาน | Job Posts | `/platform/jobs` | reports count |
| 📈 | วิเคราะห์ | Analytics | `/platform/analytics` | — |
| ⚙️ | ระบบ | System | `/platform/system` | — |

## States

### Navigation Item States

| State | Tailwind Classes (Light) | Tailwind Classes (Admin Dark) |
|-------|--------------------------|------------------------------|
| default | `text-gray-600 hover:bg-gray-50` | `text-gray-300 hover:bg-secondary-900` |
| hover | `bg-gray-50 text-gray-900` | `bg-secondary-900 text-white` |
| active | `bg-secondary-50 text-secondary-700 border-r-2 border-secondary-500` | `bg-secondary-800 text-white border-r-2 border-primary` |
| disabled | `text-gray-400 cursor-not-allowed` | `text-gray-500 cursor-not-allowed` |

### Collapsed State

When collapsed (`collapsed: true`):
- Width: `64px`
- Show only icons (no labels)
- Tooltips on hover showing label
- User section: avatar only
- Widgets: hidden

## User Profile Section

| Variant | Elements Shown |
|---------|----------------|
| `candidate` | Avatar, Name, Email, Completion Ring |
| `company` | Company Logo, Company Name, User Role |
| `admin` | Avatar, Name, Role Badge |

## Badge Display

| Count | Display |
|-------|---------|
| 0 | Hidden |
| 1-99 | Show number |
| 100+ | "99+" |

**Badge Tailwind:**
```
bg-primary text-white text-xs font-medium px-2 py-0.5 rounded-full
```

## Contextual Widgets

| Variant | Widget | Condition |
|---------|--------|-----------|
| `candidate` | AppointmentWidget | `appointments.length > 0` |
| `company` | AppointmentWidget | `interviews.length > 0` |
| `admin` | PendingActionsWidget | `pendingCount > 0` |

---

# 2. BottomTabBar

## Description

Mobile navigation for candidates. Fixed at bottom of viewport with 5 primary navigation items.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| currentPath | `string` | yes | — | Active route |
| badges | `Record<string, number>` | no | `{}` | Badge counts by tab id |

## Visual Structure

```
┌─────────────────────────────────────────────┐
│  🏠      💼      📄      💬      👤        │
│ หน้าหลัก  งาน    ใบสมัคร  ข้อความ  โปรไฟล์  │
│           ●                 2              │
└─────────────────────────────────────────────┘
```

## Tab Items

| Icon | Label (Thai) | English | Path | Badge Key |
|------|--------------|---------|------|-----------|
| 🏠 | หน้าหลัก | Home | `/candidates/[id]` | — |
| 💼 | งาน | Jobs | `/jobs` | — |
| 📄 | ใบสมัคร | Apps | `/candidates/[id]/applications` | `applications` |
| 💬 | ข้อความ | Chat | `/chat` | `messages` |
| 👤 | โปรไฟล์ | Profile | `/candidates/[id]/profile` | — |

## States

| State | Icon | Label | Tailwind |
|-------|------|-------|----------|
| inactive | `text-gray-400` | `text-gray-400` | — |
| active | `text-secondary-600` | `text-secondary-600` | — |

## Styling

```css
.bottom-tab-bar {
  @apply fixed bottom-0 inset-x-0 h-16;
  @apply bg-white border-t border-gray-200;
  @apply flex items-center justify-around;
  @apply safe-area-inset-bottom; /* iOS safe area */
}

.tab-item {
  @apply flex flex-col items-center justify-center;
  @apply w-16 h-full;
}

.tab-icon {
  @apply w-6 h-6;
}

.tab-label {
  @apply text-xs mt-1;
}
```

## Badge Position

Badge appears at top-right of icon:
```
  ┌───┐
  │ 🏠│ ← Icon
  └─●─┘
    ↑ Badge (offset: -4px top, -4px right)
```

---

# 3. Header

## Description

Top navigation bar for mobile and simplified desktop views. Contains logo, page title, and action buttons.

## Variants

| Variant | Use Case | Height |
|---------|----------|--------|
| `public` | Public pages | `64px` |
| `authenticated` | Logged-in mobile | `56px` |
| `minimal` | Auth flows | `56px` |

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| variant | `'public'` \| `'authenticated'` \| `'minimal'` | no | `'public'` | Header type |
| title | `string` | no | — | Page title (mobile) |
| showBack | `boolean` | no | `false` | Show back button |
| onBack | `() => void` | conditional | — | Back button handler |
| actions | `ActionConfig[]` | no | — | Right-side actions |
| transparent | `boolean` | no | `false` | Transparent background |

## Visual Structure

### Public Header

```
┌─────────────────────────────────────────────────────────┐
│  [Logo]                    [หางาน] [บริษัท] [เข้าสู่ระบบ]│
└─────────────────────────────────────────────────────────┘
```

### Authenticated Mobile Header

```
┌─────────────────────────────────────────────────────────┐
│  [←] Page Title                           [🔔] [👤]    │
└─────────────────────────────────────────────────────────┘
```

### Minimal Header (Auth)

```
┌─────────────────────────────────────────────────────────┐
│                      [Logo]                             │
└─────────────────────────────────────────────────────────┘
```

## Public Header Links

| Label (Thai) | English | Path | Desktop | Mobile |
|--------------|---------|------|---------|--------|
| หางาน | Find Jobs | `/jobs` | ✅ | ❌ (hamburger) |
| บริษัท | Companies | `/companies` | ✅ | ❌ (hamburger) |
| เกี่ยวกับเรา | About | `/about` | ✅ | ❌ (hamburger) |
| เข้าสู่ระบบ | Login | `/auth/login` | ✅ Button | ✅ |
| ลงทะเบียน | Register | `/auth/register` | ✅ Button Primary | ❌ |

## Action Icons

| Icon | Action | Badge |
|------|--------|-------|
| 🔔 | Notifications | unread count |
| 👤 | Profile menu | — |
| ☰ | Mobile menu | — |

## Scroll Behavior

| Variant | Scroll Behavior |
|---------|-----------------|
| `public` | Sticky, shadow on scroll |
| `authenticated` | Sticky |
| `minimal` | Static (no scroll behavior) |

```css
.header-scrolled {
  @apply shadow-sm;
}
```

---

# 4. Breadcrumb

## Description

Secondary navigation showing the current page's location in the site hierarchy.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| items | `BreadcrumbItem[]` | yes | — | Path items |
| separator | `ReactNode` | no | `/` | Item separator |

### BreadcrumbItem Type

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| label | `string` | yes | Display text |
| href | `string` | no | Navigation link (omit for current page) |

## Visual Structure

```
หน้าหลัก / ใบสมัครงาน / บริษัท ABC
Home     / Applications  / Company ABC
```

## Common Breadcrumb Patterns

### Job Detail

| Item | Thai | English | Link |
|------|------|---------|------|
| 1 | หน้าหลัก | Home | `/` |
| 2 | หางาน | Jobs | `/jobs` |
| 3 | {Job Title} | — | — (current) |

### Help Article

| Item | Thai | English | Link |
|------|------|---------|------|
| 1 | ศูนย์ช่วยเหลือ | Help Center | `/help` |
| 2 | {Category} | — | `/help?category=X` |
| 3 | {Article Title} | — | — (current) |

### Company Application

| Item | Thai | English | Link |
|------|------|---------|------|
| 1 | แดชบอร์ด | Dashboard | `/companies/[id]/dashboard` |
| 2 | ใบสมัคร | Applications | `/companies/[id]/dashboard/applications` |
| 3 | {Candidate Name} | — | — (current) |

## Styling

```css
.breadcrumb {
  @apply flex items-center gap-2 text-sm;
}

.breadcrumb-item {
  @apply text-gray-500;
}

.breadcrumb-link {
  @apply text-secondary-600 hover:text-secondary-700 hover:underline;
}

.breadcrumb-current {
  @apply text-gray-900 font-medium;
}

.breadcrumb-separator {
  @apply text-gray-400;
}
```

## Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| Desktop | Show all items |
| Mobile | Show only current + parent (or use "..." for deep paths) |

### Mobile Truncation

```
... / Applications / Company ABC
```

---

# 5. TabNavigation

## Description

Horizontal tabs for switching between views within a page. Used for profile sections, dashboard tabs, and filtered lists.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| tabs | `TabItem[]` | yes | — | Tab definitions |
| activeTab | `string` | yes | — | Current active tab id |
| onChange | `(tabId: string) => void` | yes | — | Tab change handler |
| variant | `'default'` \| `'pills'` \| `'underline'` | no | `'underline'` | Visual style |

### TabItem Type

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| id | `string` | yes | Tab identifier |
| label | `string` | yes | Display text |
| icon | `ReactNode` | no | Tab icon |
| badge | `number` | no | Count badge |
| disabled | `boolean` | no | Disable tab |

## Variants

### Underline (Default)

```
  ทั้งหมด     สมัครแล้ว     รอสัมภาษณ์     ได้งาน
  ───────     ─────────     ──────────     ──────
     ●            3             2
```

### Pills

```
  [ทั้งหมด]  [สมัครแล้ว 3]  [รอสัมภาษณ์ 2]  [ได้งาน]
      ●
```

## Styling

### Underline Variant

| State | Tailwind Classes |
|-------|------------------|
| inactive | `text-gray-600 hover:text-gray-900 border-b-2 border-transparent` |
| active | `text-secondary-700 border-b-2 border-secondary-500` |
| disabled | `text-gray-400 cursor-not-allowed` |

### Pills Variant

| State | Tailwind Classes |
|-------|------------------|
| inactive | `text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-2` |
| active | `text-white bg-secondary-600 rounded-full px-4 py-2` |
| disabled | `text-gray-400 bg-gray-100 cursor-not-allowed` |

## Common Tab Configurations

### Application Status Tabs

| Tab ID | Thai | English | Badge |
|--------|------|---------|-------|
| `all` | ทั้งหมด | All | total count |
| `applied` | สมัครแล้ว | Applied | count |
| `reviewing` | กำลังพิจารณา | Reviewing | count |
| `interview` | นัดสัมภาษณ์ | Interview | count |
| `offer` | ได้รับข้อเสนอ | Offer | count |
| `rejected` | ไม่ผ่าน | Rejected | count |

### Profile Tabs

| Tab ID | Thai | English |
|--------|------|---------|
| `personal` | ข้อมูลส่วนตัว | Personal Info |
| `preferences` | ความต้องการงาน | Job Preferences |
| `resume` | ประวัติการทำงาน | Resume |

### Settings Tabs

| Tab ID | Thai | English |
|--------|------|---------|
| `account` | บัญชี | Account |
| `notifications` | การแจ้งเตือน | Notifications |
| `privacy` | ความเป็นส่วนตัว | Privacy |

## Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| Desktop | All tabs visible |
| Mobile | Horizontal scroll with fade indicators |

```css
.tab-container-mobile {
  @apply flex overflow-x-auto scrollbar-hide;
  -webkit-overflow-scrolling: touch;
}

.tab-fade-left {
  @apply absolute left-0 w-8 bg-gradient-to-r from-white to-transparent;
}

.tab-fade-right {
  @apply absolute right-0 w-8 bg-gradient-to-l from-white to-transparent;
}
```

---

# 6. StepIndicator

## Description

Shows progress through a multi-step process like registration or job posting wizard.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| steps | `Step[]` | yes | — | Step definitions |
| currentStep | `number` | yes | — | Current step index (0-based) |
| variant | `'horizontal'` \| `'vertical'` | no | `'horizontal'` | Layout direction |
| clickable | `boolean` | no | `false` | Allow clicking past steps |
| onStepClick | `(stepIndex: number) => void` | conditional | — | Step click handler |

### Step Type

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| label | `string` | yes | Step name |
| description | `string` | no | Step subtitle |

## Visual Structure

### Horizontal

```
  ①───────②───────③───────④
  บัญชี    ข้อมูล    ยืนยัน   เสร็จสิ้น
  Account  Info     Verify  Complete
  
  ● = completed (filled, teal)
  ◐ = current (outlined, teal)
  ○ = upcoming (gray)
```

### Vertical

```
  ● บัญชี
  │ Account
  │
  ◐ ข้อมูลบริษัท
  │ Company Info
  │
  ○ ยืนยันเอกสาร
  │ Verify Documents
  │
  ○ เสร็จสิ้น
    Complete
```

## Step States

| State | Icon | Line | Text |
|-------|------|------|------|
| completed | `bg-secondary-500 text-white` ✓ | `bg-secondary-500` | `text-gray-900` |
| current | `border-2 border-secondary-500 bg-white` | `bg-gray-200` | `text-secondary-700 font-medium` |
| upcoming | `border-2 border-gray-300 bg-white` | `bg-gray-200` | `text-gray-500` |

## Common Step Configurations

### Candidate Registration

| Step | Thai | English |
|------|------|---------|
| 1 | สร้างบัญชี | Create Account |
| 2 | ยืนยันอีเมล | Verify Email |
| 3 | เสร็จสิ้น | Complete |

### Company Registration

| Step | Thai | English |
|------|------|---------|
| 1 | สร้างบัญชี | Create Account |
| 2 | ข้อมูลบริษัท | Company Info |
| 3 | อัปโหลดเอกสาร | Upload Documents |
| 4 | รอตรวจสอบ | Pending Review |

### Job Creation Wizard

| Step | Thai | English |
|------|------|---------|
| 1 | ข้อมูลพื้นฐาน | Basic Info |
| 2 | รายละเอียด | Details |
| 3 | สถานที่ | Location |
| 4 | ตรวจสอบ | Preview |

## Accessibility

| Element | Attribute | Value |
|---------|-----------|-------|
| Container | `role` | `navigation` |
| Container | `aria-label` | "ขั้นตอน" / "Steps" |
| Step (completed) | `aria-current` | — |
| Step (current) | `aria-current` | `step` |
| Step (completed) | `aria-label` | "{label} - เสร็จสิ้น" / "{label} - completed" |
| Step (current) | `aria-label` | "{label} - ขั้นตอนปัจจุบัน" / "{label} - current step" |

---

*End of Navigation Organism Specification*
