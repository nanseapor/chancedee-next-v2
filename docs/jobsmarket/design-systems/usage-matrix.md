# Component Usage Matrix

## Overview

This matrix maps all 115 components from the specification to the 45 routes where they're used. Use this for implementation planning, dependency tracking, and testing coverage.

**Legend:**
- ● = Primary use (key component)
- ○ = Secondary use (supporting role)
- ◐ = Conditional use (based on state/data)

---

# 1. Global Components (All Routes)

These components are available across all authenticated or all routes.

| Component | Public | Auth | Candidate | Company | Chat | Admin |
|-----------|--------|------|-----------|---------|------|-------|
| Toast | ● | ● | ● | ● | ● | ● |
| Spinner | ● | ● | ● | ● | ● | ● |
| Skeleton | ● | ● | ● | ● | ● | ● |
| ConfirmationDialog | ○ | ○ | ● | ● | ● | ● |
| SessionExpiredPage | — | — | ● | ● | ● | ● |
| OfflinePage | ● | ● | ● | ● | ● | ● |
| NotFoundPage (404) | ● | ● | ● | ● | ● | ● |
| ServerErrorPage (500) | ● | ● | ● | ● | ● | ● |

---

# 2. Atoms Usage Matrix

## 2.1 Buttons

| Component | Routes Used | Primary Contexts |
|-----------|-------------|------------------|
| **Button (primary)** | All 45 routes | CTAs, form submissions |
| **Button (secondary)** | ~40 routes | Secondary actions, cancel |
| **Button (outline)** | ~30 routes | Tertiary actions |
| **Button (ghost)** | ~35 routes | Inline actions, links |
| **Button (destructive)** | ~20 routes | Delete, remove actions |
| **IconButton** | ~40 routes | Toolbars, compact actions |
| **FAB** | 15 authenticated routes | Quick chat, create actions |
| **SocialButton** | `/auth/login`, `/auth/register` | OAuth login |
| **LinkButton** | All routes | Text-style actions |
| **ButtonGroup** | ~10 routes | Segmented controls, filters |

### Button Usage by Route Category

| Route Category | Primary | Secondary | Outline | Ghost | Destructive |
|----------------|---------|-----------|---------|-------|-------------|
| Public (9) | ● | ● | ● | ● | — |
| Auth (6) | ● | ● | ○ | ● | — |
| Candidate (5) | ● | ● | ● | ● | ● |
| Company (8) | ● | ● | ● | ● | ● |
| Communication (2) | ● | ○ | ○ | ● | ○ |
| Platform Admin (10) | ● | ● | ● | ● | ● |

---

## 2.2 Badges

| Component | Routes Used | Primary Contexts |
|-----------|-------------|------------------|
| **StatusBadge (waiting)** | 25+ routes | Pending applications, draft jobs |
| **StatusBadge (success)** | 25+ routes | Active, confirmed, verified |
| **StatusBadge (problem)** | 20+ routes | Rejected, expired, suspended |
| **StatusBadge (neutral)** | 20+ routes | Closed, withdrawn, inactive |
| **MatchScoreBadge** | `/jobs`, `/jobs/[id]`, candidate dashboard | Job-candidate match |
| **CountBadge** | Navigation, notifications, chat | Unread counts |
| **CategoryBadge** | `/jobs`, profiles, filters | Skills, categories |
| **VerifiedBadge** | Company cards, profiles | Verification status |
| **NewBadge** | Job cards, notifications | Recently posted |
| **OnlineBadge** | Chat, profiles | Online status |

### StatusBadge Usage Detail

| Badge Variant | Routes |
|---------------|--------|
| **waiting** | `/candidates/[id]/applications`, `/companies/[id]/dashboard/applications`, `/platform/companies`, `/platform/dashboard` |
| **success** | `/candidates/[id]/applications`, `/companies/[id]/dashboard/jobs`, `/platform/companies/[id]` |
| **problem** | `/candidates/[id]/applications`, `/platform/jobs`, `/platform/companies` |
| **neutral** | `/companies/[id]/dashboard/jobs`, `/candidates/[id]/applications` |

---

## 2.3 Form Elements

| Component | Routes Used |
|-----------|-------------|
| **TextInput** | All forms (~30 routes) |
| **Textarea** | Job creation, profile, messages |
| **Select** | Filters, forms (~25 routes) |
| **Checkbox** | Filters, settings, bulk select |
| **Radio** | Role selection, preferences |
| **Toggle** | Settings, preferences |
| **RangeSlider** | Salary filter, experience filter |
| **FileInput** | Profile, job creation, documents |
| **DatePicker** | Job creation, filters, scheduling |

### Form Elements by Route

| Route | TextInput | Textarea | Select | Checkbox | Radio | Toggle | Range | File | Date |
|-------|-----------|----------|--------|----------|-------|--------|-------|------|------|
| `/auth/login` | ● | — | — | ● | — | — | — | — | — |
| `/auth/register` | ● | — | ● | ● | ● | — | — | — | — |
| `/candidates/[id]/profile` | ● | ● | ● | ● | ● | ● | — | ● | ● |
| `/companies/.../jobs/new` | ● | ● | ● | ● | — | ● | ● | — | ● |
| `/jobs` (filters) | — | — | ● | ● | — | — | ● | — | — |
| `/platform/analytics` | — | — | ● | — | — | — | — | — | ● |

---

## 2.4 Indicators

| Component | Routes Used | Primary Contexts |
|-----------|-------------|------------------|
| **Spinner** | All routes | Loading states |
| **ProgressBar** | File uploads, wizards | Multi-step progress |
| **ProgressRing** | Profile completion | Completion percentage |
| **Skeleton** | All data-loading routes | Content placeholders |
| **Shimmer** | Images, cards | Loading effect |
| **Pulse** | Online status, live updates | Real-time indicators |
| **StepDot** | Onboarding, wizards | Step progress |
| **CountdownTimer** | Session expiry, appointments | Time remaining |
| **UploadProgress** | File uploads | Upload status |

### Indicator Usage by Route

| Route | Spinner | Progress | Ring | Skeleton | Pulse |
|-------|---------|----------|------|----------|-------|
| `/candidates/[id]` | ● | — | ● | ● | — |
| `/candidates/[id]/profile` | ● | ● | ● | ● | — |
| `/chat` | ● | — | — | ● | ● |
| `/auth/register` | ● | ● | — | — | — |
| `/companies/.../jobs/new` | ● | ● | — | — | — |

---

## 2.5 Typography

| Component | Usage Scope |
|-----------|-------------|
| **Heading (H1)** | Page titles (all routes) |
| **Heading (H2)** | Section titles (all routes) |
| **Heading (H3-H4)** | Card titles, subsections |
| **Text** | Body content (all routes) |
| **Link** | Navigation, inline links |
| **Label** | Form fields (all forms) |
| **Caption** | Timestamps, helper text |
| **Truncate** | Card titles, descriptions |

---

# 3. Molecules Usage Matrix

## 3.1 Form Groups

| Component | Routes Used |
|-----------|-------------|
| **FormField** | All forms (~30 routes) |
| **PasswordField** | `/auth/login`, `/auth/register`, `/auth/reset`, settings |
| **SearchInput** | `/jobs`, `/companies`, `/chat`, `/help`, admin tables |
| **DateRangePicker** | `/platform/analytics`, job filters |
| **FileUploadZone** | `/candidates/[id]/profile`, `/companies/.../settings` |
| **TagInput** | `/candidates/[id]/profile` (skills), `/companies/.../jobs/new` |
| **PhoneInput** | `/auth/register`, `/candidates/[id]/profile` |
| **AddressField** | `/candidates/[id]/profile`, `/companies/.../settings` |

### SearchInput Locations

| Route | Placeholder (Thai) | English |
|-------|-------------------|---------|
| `/jobs` | ค้นหาตำแหน่งงาน... | Search jobs... |
| `/companies` | ค้นหาบริษัท... | Search companies... |
| `/chat` | ค้นหาข้อความ... | Search messages... |
| `/help` | ค้นหาบทความ... | Search articles... |
| `/platform/companies` | ค้นหาบริษัท... | Search companies... |
| `/platform/candidates` | ค้นหาผู้สมัคร... | Search candidates... |

---

## 3.2 Feedback

| Component | Routes Used | Trigger Contexts |
|-----------|-------------|------------------|
| **Toast** | All routes | Action feedback |
| **InlineError** | All forms | Validation errors |
| **Alert** | Dashboard, profile | Important notices |
| **Banner** | All routes (conditional) | Announcements, warnings |
| **Tooltip** | Throughout | Icon explanations |
| **Popover** | Match scores, info buttons | Detailed info |
| **ConfirmPopover** | Quick deletes, removes | Light confirmations |
| **PasswordRequirements** | Registration, password reset | Password validation |
| **FormSuccess** | Registration, applications | Success states |

### Toast Messages by Action

| Action | Route(s) | Variant | Message (Thai) |
|--------|----------|---------|----------------|
| Save profile | Candidate profile | success | บันทึกสำเร็จ |
| Apply job | Job detail | success | สมัครงานสำเร็จ |
| Send message | Chat | success | ส่งข้อความสำเร็จ |
| Delete job | Company jobs | success | ลบประกาศงานสำเร็จ |
| API error | All | error | เกิดข้อผิดพลาด กรุณาลองใหม่ |
| Validation | Forms | warning | กรุณาตรวจสอบข้อมูล |

---

## 3.3 List Items

| Component | Routes Used |
|-----------|-------------|
| **ConversationItem** | `/chat` |
| **NotificationItem** | `/notifications` |
| **MenuItem** | Action menus (all tables) |
| **SelectOption** | All selects |
| **SkillTag** | Profiles, job details |
| **FilterChip** | `/jobs`, `/companies`, admin filters |
| **ExperienceItem** | `/candidates/[id]/profile`, candidate detail modal |
| **EducationItem** | `/candidates/[id]/profile`, candidate detail modal |
| **TeamMemberItem** | `/companies/.../team` |
| **JobListItem** | Saved jobs, similar jobs, company jobs |

---

## 3.4 Media

| Component | Routes Used |
|-----------|-------------|
| **Avatar** | All user-facing routes |
| **AvatarGroup** | Team lists, shared items |
| **CompanyLogo** | Job cards, company pages |
| **ImagePreview** | Chat attachments, galleries |
| **ImageGallery** | Company profile |
| **DocumentPreview** | Profile attachments, admin reviews |
| **VideoPlayer** | Help articles (if applicable) |
| **MapEmbed** | Company profile, job detail |
| **Icon** | Throughout all routes |

### Avatar Size Usage

| Size | Context | Routes |
|------|---------|--------|
| `xs` | Inline text, dense lists | Chat, notifications |
| `sm` | List items, compact cards | Tables, lists |
| `md` | Cards, standard displays | Job cards, app cards |
| `lg` | Headers, profiles | Profile headers |
| `xl` | Detail views | Company profile |
| `2xl` | Edit views | Profile edit |

---

# 4. Organisms Usage Matrix

## 4.1 Cards

| Component | Routes Used |
|-----------|-------------|
| **JobCard** | `/`, `/jobs`, `/candidates/[id]`, `/candidates/[id]/saved`, `/companies/[id]` |
| **ApplicationCard** | `/candidates/[id]/applications`, `/companies/.../applications` |
| **CompanyCard** | `/companies`, `/` |
| **StatCard** | `/candidates/[id]`, `/companies/.../dashboard`, `/platform`, `/platform/dashboard` |

### JobCard Variant by Route

| Route | Variant | showMatchScore | showSaveButton |
|-------|---------|----------------|----------------|
| `/` (featured) | default | false | true |
| `/jobs` (list) | default | true | true |
| `/jobs` (mobile) | horizontal | true | true |
| `/jobs/[id]` (similar) | compact | false | true |
| `/candidates/[id]` (recommended) | default | true | true |
| `/candidates/[id]/saved` | default | false | false (unsave) |
| `/companies/[id]` (positions) | compact | false | true |

---

## 4.2 Tables

| Component | Routes Used |
|-----------|-------------|
| **DataTable** | `/companies/.../jobs`, `/companies/.../team`, `/platform/companies`, `/platform/candidates`, `/platform/jobs` |
| **FilterBar** | All table routes + `/jobs`, `/companies` |
| **ActionMenu** | All table rows |

### DataTable Configuration by Route

| Route | Columns | Bulk Actions | Row Actions |
|-------|---------|--------------|-------------|
| `/companies/.../jobs` | 8 | Pause, Close, Delete | Edit, View, Duplicate, Delete |
| `/companies/.../team` | 5 | Remove | Change Role, Remove |
| `/platform/companies` | 7 | Approve, Suspend | View, Approve, Suspend |
| `/platform/candidates` | 6 | — | View, Flag |
| `/platform/jobs` | 7 | Hide, Remove | View, Hide, Remove |

---

## 4.3 Modals

| Component | Routes Used | Trigger |
|-----------|-------------|---------|
| **ConfirmationDialog** | All authenticated routes | Delete, remove, destructive actions |
| **FormModal** | Team management, quick edit | Invite, role change, quick note |
| **DetailModal** | Candidate search, admin views | View full details |
| **DocumentViewer** | Admin routes, chat attachments | View PDFs, images |
| **ScheduleModal** | Chat, applications | Schedule interview |

### ConfirmationDialog Contexts

| Route | Action | Variant | Title (Thai) |
|-------|--------|---------|--------------|
| `/companies/.../jobs` | Delete job | destructive | ลบประกาศงานนี้? |
| `/companies/.../team` | Remove member | destructive | ลบสมาชิกนี้? |
| `/candidates/.../applications` | Withdraw | simple | ยกเลิกใบสมัคร? |
| `/platform/companies` | Suspend | critical | ระงับบริษัทนี้? |
| `/auth/settings` | Delete account | critical | ลบบัญชี? |

---

## 4.4 Widgets

| Component | Routes Used |
|-----------|-------------|
| **AppointmentWidget** | `/candidates/[id]`, `/companies/.../dashboard` sidebars |
| **ProfileCompletionCard** | `/candidates/[id]`, `/candidates/[id]/profile` |
| **ChatDrawer** | All authenticated routes (FAB trigger) |
| **QuickStatsRow** | `/candidates/[id]`, `/companies/.../dashboard`, `/platform` |
| **RecentActivityList** | Dashboards |
| **JobPerformanceCard** | `/companies/.../dashboard`, `/companies/.../jobs/[id]` |

### Widget Placement

| Route | Sidebar Widgets | Main Content Widgets |
|-------|-----------------|---------------------|
| `/candidates/[id]` | AppointmentWidget, ProfileCompletionCard | QuickStatsRow, RecentActivityList |
| `/companies/.../dashboard` | AppointmentWidget | QuickStatsRow, JobPerformanceCard |
| `/platform` | — | QuickStatsRow |

---

## 4.5 Empty States

| Context | Routes | Message (Thai) |
|---------|--------|----------------|
| No jobs found (search) | `/jobs` | ไม่พบงานที่ค้นหา |
| No recommended jobs | `/candidates/[id]` | ยังไม่มีงานแนะนำ |
| No applications | `/candidates/[id]/applications` | ยังไม่มีใบสมัคร |
| No saved jobs | `/candidates/[id]/saved` | ยังไม่มีงานที่บันทึก |
| No messages | `/chat` | ยังไม่มีข้อความ |
| No team members | `/companies/.../team` | ยังไม่มีสมาชิกในทีม |
| No job posts | `/companies/.../jobs` | ยังไม่มีประกาศงาน |
| No pending approvals | `/platform/dashboard` | ไม่มีรายการรอดำเนินการ 🎉 |

---

## 4.6 Navigation

| Component | Routes Used |
|-----------|-------------|
| **Sidebar (candidate)** | All `/candidates/*` routes |
| **Sidebar (company)** | All `/companies/*/dashboard/*` routes |
| **Sidebar (admin)** | All `/platform/*` routes |
| **BottomTabBar** | Candidate mobile routes |
| **Header (public)** | All public routes |
| **Header (authenticated)** | All authenticated routes |
| **Breadcrumb** | Detail pages, nested routes |
| **TabNavigation** | Profile, applications, settings, admin |
| **StepIndicator** | Registration, job creation wizard |

### Sidebar Navigation Items

| Shell | Items | Badge Contexts |
|-------|-------|----------------|
| Candidate | หน้าหลัก, หางาน, ใบสมัคร, งานที่บันทึก, ข้อความ, โปรไฟล์ | Applications (pending), Messages (unread) |
| Company | หน้าหลัก, ประกาศงาน, ใบสมัคร, ค้นหาผู้สมัคร, ข้อความ, ทีม, ตั้งค่า | Applications (new), Messages (unread) |
| Admin | หน้าหลัก, บริษัท, ผู้สมัคร, ประกาศงาน, วิเคราะห์, ระบบ | Pending approvals, Reports |

---

## 4.7 Chat

| Component | Routes Used |
|-----------|-------------|
| **ConversationList** | `/chat`, ChatDrawer |
| **MessageThread** | `/chat`, ChatDrawer |
| **MessageBubble** | `/chat`, ChatDrawer |
| **ChatInput** | `/chat`, ChatDrawer |
| **TypingIndicator** | `/chat`, ChatDrawer |
| **ChatHeader** | `/chat` |

---

## 4.8 Error Pages

| Component | Trigger |
|-----------|---------|
| **NotFoundPage** | Invalid routes, deleted resources |
| **ServerErrorPage** | API 500 errors |
| **MaintenancePage** | System maintenance |
| **ForbiddenPage** | Unauthorized access |
| **OfflinePage** | No internet |
| **SessionExpiredPage** | Token expiry |

---

# 5. Route → Component Mapping

## 5.1 Public Routes

### `/` (Homepage)

| Layer | Components |
|-------|------------|
| Atoms | Button (primary, secondary), Heading, Text, Icon |
| Molecules | SearchInput |
| Organisms | Header (public), JobCard, CompanyCard |

### `/jobs` (Job Search)

| Layer | Components |
|-------|------------|
| Atoms | Button, Checkbox, Select, RangeSlider, StatusBadge, MatchScoreBadge |
| Molecules | SearchInput, FilterChip, FormField |
| Organisms | Header (public), FilterBar, JobCard, Pagination, EmptyState |

### `/jobs/[id]` (Job Detail)

| Layer | Components |
|-------|------------|
| Atoms | Button (primary), StatusBadge, CategoryBadge, VerifiedBadge, Heading, Text |
| Molecules | CompanyLogo, SkillTag, MapEmbed |
| Organisms | Header (public), JobCard (similar), Breadcrumb |

### `/companies` (Company Directory)

| Layer | Components |
|-------|------------|
| Atoms | Button, TextInput |
| Molecules | SearchInput, FilterChip |
| Organisms | Header (public), FilterBar, CompanyCard, EmptyState |

### `/companies/[id]` (Company Profile)

| Layer | Components |
|-------|------------|
| Atoms | Button, VerifiedBadge, Heading, Text |
| Molecules | CompanyLogo, ImageGallery, MapEmbed |
| Organisms | Header (public), JobCard, TabNavigation |

---

## 5.2 Authentication Routes

### `/auth/login`

| Layer | Components |
|-------|------------|
| Atoms | Button (primary), TextInput, Checkbox |
| Molecules | FormField, PasswordField, SocialButton, InlineError, Toast |
| Organisms | Header (minimal) |

### `/auth/register`

| Layer | Components |
|-------|------------|
| Atoms | Button, TextInput, Select, Radio, Checkbox |
| Molecules | FormField, PasswordField, PasswordRequirements, SocialButton, PhoneInput, FormSuccess |
| Organisms | Header (minimal), StepIndicator |

---

## 5.3 Candidate Routes

### `/candidates/[id]` (Dashboard)

| Layer | Components |
|-------|------------|
| Atoms | Button, StatusBadge, MatchScoreBadge, Heading |
| Molecules | Avatar, ProgressRing |
| Organisms | Sidebar (candidate), BottomTabBar, ProfileCompletionCard, AppointmentWidget, QuickStatsRow, JobCard, ApplicationCard, EmptyState |

### `/candidates/[id]/profile`

| Layer | Components |
|-------|------------|
| Atoms | Button, TextInput, Textarea, Select, FileInput, DatePicker, Toggle |
| Molecules | FormField, FileUploadZone, TagInput, AddressField, Avatar, ExperienceItem, EducationItem, Toast |
| Organisms | Sidebar, TabNavigation, ProfileCompletionCard, ConfirmationDialog |

### `/candidates/[id]/applications`

| Layer | Components |
|-------|------------|
| Atoms | Button, StatusBadge |
| Molecules | FilterChip |
| Organisms | Sidebar, TabNavigation, ApplicationCard, EmptyState, ConfirmationDialog |

### `/candidates/[id]/saved`

| Layer | Components |
|-------|------------|
| Atoms | Button |
| Molecules | — |
| Organisms | Sidebar, TabNavigation, JobCard, EmptyState |

---

## 5.4 Company Routes

### `/companies/[id]/dashboard`

| Layer | Components |
|-------|------------|
| Atoms | Button, StatusBadge, Heading |
| Molecules | Avatar |
| Organisms | Sidebar (company), QuickStatsRow, AppointmentWidget, ApplicationCard, JobPerformanceCard, EmptyState |

### `/companies/.../jobs`

| Layer | Components |
|-------|------------|
| Atoms | Button, StatusBadge, Checkbox |
| Molecules | MenuItem |
| Organisms | Sidebar, DataTable, FilterBar, ActionMenu, TabNavigation, EmptyState, ConfirmationDialog |

### `/companies/.../jobs/new`

| Layer | Components |
|-------|------------|
| Atoms | Button, TextInput, Textarea, Select, Checkbox, Toggle, RangeSlider, DatePicker |
| Molecules | FormField, TagInput, Toast |
| Organisms | Sidebar, StepIndicator |

### `/companies/.../applications`

| Layer | Components |
|-------|------------|
| Atoms | Button, StatusBadge |
| Molecules | Avatar, FilterChip |
| Organisms | Sidebar, ApplicationCard, DetailModal, ScheduleModal, TabNavigation, EmptyState |

### `/companies/.../team`

| Layer | Components |
|-------|------------|
| Atoms | Button, Select |
| Molecules | Avatar, TeamMemberItem |
| Organisms | Sidebar, DataTable, FormModal, ConfirmationDialog, EmptyState |

---

## 5.5 Communication Routes

### `/chat`

| Layer | Components |
|-------|------------|
| Atoms | Button, TextInput, Spinner |
| Molecules | Avatar, ConversationItem, ImagePreview, DocumentPreview, Toast |
| Organisms | Sidebar, ConversationList, MessageThread, MessageBubble, ChatInput, ChatHeader, TypingIndicator, ScheduleModal, EmptyState |

### `/notifications`

| Layer | Components |
|-------|------------|
| Atoms | Button, StatusBadge |
| Molecules | NotificationItem |
| Organisms | Sidebar, TabNavigation, EmptyState |

---

## 5.6 Platform Admin Routes

### `/platform` (Admin Dashboard)

| Layer | Components |
|-------|------------|
| Atoms | Button, StatusBadge, Heading |
| Molecules | — |
| Organisms | Sidebar (admin), QuickStatsRow, EmptyState |

### `/platform/companies`

| Layer | Components |
|-------|------------|
| Atoms | Button, StatusBadge, Checkbox |
| Molecules | SearchInput, FilterChip, MenuItem, CompanyLogo |
| Organisms | Sidebar, DataTable, FilterBar, ActionMenu, DetailModal, ConfirmationDialog |

### `/platform/candidates`

| Layer | Components |
|-------|------------|
| Atoms | Button, StatusBadge |
| Molecules | SearchInput, Avatar, MenuItem |
| Organisms | Sidebar, DataTable, FilterBar, ActionMenu, DetailModal |

### `/platform/jobs`

| Layer | Components |
|-------|------------|
| Atoms | Button, StatusBadge, CountBadge |
| Molecules | SearchInput, MenuItem |
| Organisms | Sidebar, DataTable, FilterBar, ActionMenu, DetailModal, ConfirmationDialog |

### `/platform/analytics`

| Layer | Components |
|-------|------------|
| Atoms | Button, Select |
| Molecules | DateRangePicker |
| Organisms | Sidebar, StatCard, TabNavigation |

---

# 6. Component Dependency Graph

## 6.1 Most Used Components (Top 20)

| Rank | Component | Route Count | Layer |
|------|-----------|-------------|-------|
| 1 | Button (primary) | 45 | Atom |
| 2 | Heading | 45 | Atom |
| 3 | Text | 45 | Atom |
| 4 | Icon | 45 | Atom |
| 5 | Toast | 40+ | Molecule |
| 6 | Spinner | 40+ | Atom |
| 7 | Skeleton | 35+ | Atom |
| 8 | Avatar | 35+ | Molecule |
| 9 | StatusBadge | 30+ | Atom |
| 10 | FormField | 30+ | Molecule |
| 11 | TextInput | 30+ | Atom |
| 12 | Button (secondary) | 30+ | Atom |
| 13 | Sidebar | 25 | Organism |
| 14 | Select | 25+ | Atom |
| 15 | InlineError | 25+ | Molecule |
| 16 | EmptyState | 20+ | Organism |
| 17 | ConfirmationDialog | 20+ | Organism |
| 18 | TabNavigation | 15+ | Organism |
| 19 | FilterBar | 12+ | Organism |
| 20 | DataTable | 8 | Organism |

---

## 6.2 Implementation Priority

Based on usage frequency and dependencies:

### Priority 1 (Foundation)
Build first — used everywhere:
- Button (all variants)
- Typography (Heading, Text, Label, Caption)
- Icon
- Spinner, Skeleton
- Toast

### Priority 2 (Form Foundation)
Required for any form:
- TextInput, Textarea, Select, Checkbox, Radio, Toggle
- FormField, InlineError
- PasswordField

### Priority 3 (Navigation)
Required for authenticated experience:
- Sidebar (all variants)
- Header (all variants)
- TabNavigation
- BottomTabBar

### Priority 4 (Cards & Lists)
Core content display:
- Avatar, CompanyLogo
- StatusBadge (all variants)
- JobCard, ApplicationCard, CompanyCard, StatCard
- EmptyState

### Priority 5 (Tables & Data)
Admin and management features:
- DataTable
- FilterBar, FilterChip
- ActionMenu, MenuItem
- Pagination

### Priority 6 (Modals & Feedback)
Interactive overlays:
- ConfirmationDialog
- FormModal, DetailModal
- Tooltip, Popover
- Alert, Banner

### Priority 7 (Specialized)
Feature-specific:
- Chat components (ConversationList, MessageBubble, etc.)
- Widgets (AppointmentWidget, ProfileCompletionCard, etc.)
- Error pages
- ScheduleModal, DocumentViewer

---

# 7. Testing Coverage Matrix

## 7.1 Component Test Requirements

| Component | Unit Test | Integration | Visual | A11y |
|-----------|-----------|-------------|--------|------|
| Button | ● | ● | ● | ● |
| StatusBadge | ● | ○ | ● | ● |
| TextInput | ● | ● | ● | ● |
| FormField | ● | ● | ● | ● |
| Toast | ● | ● | ● | ● |
| JobCard | ● | ● | ● | ● |
| DataTable | ● | ● | ● | ● |
| ConfirmationDialog | ● | ● | ● | ● |
| Chat components | ● | ● | ● | ● |

---

*End of Component Usage Matrix*
