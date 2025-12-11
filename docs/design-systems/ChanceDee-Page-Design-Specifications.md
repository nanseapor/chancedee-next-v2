# ChanceDee Platform - Page Design Specifications

**Version:** 1.0  
**Date:** December 2024  
**Total Routes:** 45 (consolidated from 82)

---

## Table of Contents

1. [Global Navigation System](#1-global-navigation-system)
2. [Public Routes (9 routes)](#2-public-routes)
3. [Authentication Routes (6 routes)](#3-authentication-routes)
4. [Candidate Routes (5 routes)](#4-candidate-routes)
5. [Company Routes (8 routes)](#5-company-routes)
6. [Communication Routes (2 routes)](#6-communication-routes)
7. [Platform Admin Routes (10 routes)](#7-platform-admin-routes)
8. [Shared Components Reference](#8-shared-components-reference)

---

## 1. Global Navigation System

### 1.1 Navigation Architecture Overview

ChanceDee uses a role-based navigation shell that adapts based on user context:

| User Type | Desktop Pattern | Mobile Pattern |
|-----------|----------------|----------------|
| Public/Guest | Minimal header with job search focus | Hamburger menu |
| Candidate | Left sidebar (240px) with profile summary | Bottom tab bar (5 items) |
| Company | Left sidebar (260px) with company branding | Collapsible sidebar |
| Platform Admin | Left sidebar (280px) with role sections | Desktop only |

---

### 1.2 Public Header (Unauthenticated)

**Description:** Clean, minimal header emphasizing job discovery and encouraging registration.

**Layout:**
- **Left:** ChanceDee logo (clickable → home)
- **Center:** Primary nav links - "หางาน" (Find Jobs), "บริษัท" (Companies)
- **Right:** "เข้าสู่ระบบ" (Login) text link, "ลงทะเบียน" (Register) teal button

**Behavior:**
- Sticky on scroll with subtle shadow after 50px
- Mobile: Hamburger menu replaces center navigation

---

### 1.3 Candidate Navigation Shell

#### Desktop (1024px+)

**Left Sidebar (240px fixed):**
- Profile summary card (avatar, name, completion ring)
- Navigation menu:
  - หน้าหลัก (Dashboard)
  - หางาน (Jobs)
  - ใบสมัคร (Applications)
  - บันทึกไว้ (Saved)
  - ข้อความ (Chat)
  - การตั้งค่า (Settings)
- Appointment tracker widget (upcoming interviews)

**Main Content:** Flexible width with top breadcrumb bar and notification bell

#### Mobile (< 768px)

**Bottom Tab Bar (5 items):**
1. หน้าหลัก (Home icon) - Dashboard
2. งาน (Briefcase icon) - Job Search
3. ใบสมัคร (Document icon) - Applications
4. ข้อความ (Chat bubble) - Messages with unread badge
5. โปรไฟล์ (Person icon) - Profile & Settings

---

### 1.4 Company Navigation Shell

#### Desktop

**Left Sidebar (260px):**
- Company logo and name
- User avatar with role badge (Admin, HR Manager, Recruiter)
- Quick action: "ลงประกาศงาน" (Post Job) - prominent teal button
- Navigation:
  - ภาพรวม (Dashboard)
  - ประกาศงาน (Jobs)
  - ใบสมัคร (Applications)
  - ค้นหาผู้สมัคร (Candidates)
  - ทีมงาน (Team)
  - การตั้งค่า (Settings)
- Appointment tracker section

#### Mobile
- Collapsible sidebar via hamburger
- Bottom action bar: View Applications, Post Job

---

### 1.5 Platform Admin Navigation

**Left Sidebar (280px):**
- ChanceDee admin badge
- User info with role: Staff, Admin, or Super-Admin
- Navigation grouped by function:
  - **Operations:** ภาพรวม, บริษัท, ผู้สมัคร, ประกาศงาน
  - **Moderation:** คำขออนุมัติ, รายงาน
  - **Analytics:** สถิติแพลตฟอร์ม
  - **System (Admin+):** Master Data, Loyalty, Settings

**Role Visibility:**
- Staff: Operations + Moderation only
- Admin: + System (except settings)
- Super-Admin: Full access

---

## 2. Public Routes

### `/` - Landing Page

**Purpose:** First impression for candidates and companies. Communicate value proposition and drive job search or registration.

**Layout:**
- **Hero Section:** Full-width banner with search bar overlay
  - Heading: "หางานที่ใช่ เจอบริษัทที่ชอบ"
  - Search: Location dropdown (Thai provinces) + job title input
  - Quick filters: งานใหม่วันนี้, Remote, Full-time
- **Featured Jobs:** Card grid (6-8 positions)
- **Top Companies:** Logo carousel of verified companies
- **How It Works:** 3-step illustration for candidates
- **For Employers CTA:** Split section for company registration
- **Footer:** Links, legal pages, social icons

**Key Actions:**
- Primary: Search jobs → /jobs with query
- Secondary: Register as candidate, Register as company

**Thai UX:**
- Province selector shows Bangkok first, then major cities
- Salary in Thai Baht (฿XX,XXX)
- Popular categories: IT, Sales, Marketing, Manufacturing

---

### `/jobs` - Job Search & Listings

**Purpose:** Primary job discovery. Most critical page for candidate engagement.

**Layout:**
- **Search Header:** Persistent search bar with current query
- **Two-Column (Desktop):**
  - Left (300px): Filter sidebar with collapsible sections
  - Right: Job listing cards in scrollable list

**Filter Categories:**
| Filter | Thai Label | Notes |
|--------|-----------|-------|
| Job Type | ประเภทงาน | Full-time, Part-time, Contract, Internship |
| Salary | เงินเดือน | Slider or preset ranges |
| Location | สถานที่ | Province, District, BTS/MRT |
| Education | ระดับการศึกษา | ม.3 to PhD |
| Experience | ประสบการณ์ | Years range |
| Remote | การทำงานระยะไกล | On-site, Hybrid, Remote |

**Job Card:**
- Company logo, Job title, Company name
- Location, Salary range, Posted date
- Quick actions: Save (heart), Apply button

**Key Actions:**
- Search with auto-complete
- Real-time filtering (no reload)
- Save job (login prompt if not authenticated)
- Click card → job detail

**Mobile:**
- Full-width stacked cards
- Floating filter button → bottom sheet
- Pull-to-refresh

---

### `/jobs/[jobId]` - Job Detail

**Purpose:** Decision point for candidates. Provide all info needed to apply.

**Layout:**
- **Header Card:**
  - Company logo (large), Job title, Company name (linked)
  - Badges: Location, Job type, Experience level
  - Salary: Range or "ตามตกลง" (Negotiable)
  - Posted date, Application deadline
- **Two-Column (Desktop):**
  - Main (65%): Description, responsibilities, requirements
  - Sidebar (35%): Apply card (sticky), company summary, similar jobs

**Job Description Sections:**
- รายละเอียดงาน (Job Description)
- คุณสมบัติ (Requirements)
- สวัสดิการ (Benefits)
- ข้อมูลเพิ่มเติม (Additional Info)

**Apply Sidebar Card:**
- Salary prominently displayed
- "สมัครงาน" (Apply) - Primary orange button
- "บันทึก" (Save) - Outline button
- Application count: "XX คนสมัครแล้ว"

**State Variations:**
| State | Display |
|-------|---------|
| Not logged in | "เข้าสู่ระบบเพื่อสมัคร" |
| Profile incomplete | Completion prompt with missing fields |
| Already applied | Application status instead of apply button |
| Job closed | Gray banner: position filled |

---

### `/companies` - Company Directory

**Purpose:** Browse all registered companies. Build trust through visibility.

**Layout:**
- Search bar: Company name search
- Filters: Industry, Company size, Location
- Company grid (3 cols desktop, 2 tablet, 1 mobile)

**Company Card:**
- Logo (centered, square)
- Company name
- Industry tag
- Open positions: "XX ตำแหน่งเปิดรับ"
- Location

---

### `/companies/[id]` - Public Company Profile

**Purpose:** Employer brand showcase. Candidates visit before applying.

**Layout:**
- **Cover Banner:** Company cover image or gradient with logo overlay
- **Header:** Logo, name, industry, quick stats, verification badge
- **About Section:** Description, mission, culture
- **Open Positions:** Active job postings in card format
- **Gallery (optional):** Office photos

**Key Actions:**
- Browse open positions
- Follow company (requires login)
- View individual jobs

---

### `/legal/[slug]` - Legal Pages

**Purpose:** Terms, Privacy, Cookie Policy pages.

**Layout:**
- Article layout with TOC sidebar
- Clean typography for readability
- Last updated date
- Print-friendly

---

### `/privacy/cookie-settings` - Cookie Preferences

**Purpose:** GDPR/PDPA compliant cookie management.

**Layout:**
- Category toggles: Essential (always on), Analytics, Marketing
- Explanation per category
- Save preferences button

---

### `/help` - Help Center (NEW)

**Purpose:** Self-service support to reduce tickets.

**Layout:**
- Prominent search bar
- Category cards: สำหรับผู้หางาน, สำหรับบริษัท
- Popular articles
- Contact support fallback

---

### `/help/[topic]` - Help Article (NEW)

**Purpose:** Individual help article with instructions.

**Layout:**
- Breadcrumb navigation
- Article title and category tag
- Rich content with screenshots
- Related articles sidebar
- Helpful feedback: "บทความนี้มีประโยชน์ไหม?"

---

## 3. Authentication Routes

### `/auth/login` - Login Page (MERGED)

**Purpose:** Unified login with Google OAuth primary, email fallback.

**Layout:**
- Centered card (max-width 400px) on muted background
- ChanceDee logo at top
- **Card Content:**
  - "เข้าสู่ระบบ" heading
  - Google button (prominent, full-width): "เข้าสู่ระบบด้วย Google"
  - Divider: "หรือ"
  - Email input
  - Password input with show/hide
  - "ลืมรหัสผ่าน?" link
  - "เข้าสู่ระบบ" submit button (teal)
- Registration prompt: "ยังไม่มีบัญชี? ลงทะเบียน"

**Query Params:**
- `?method=social` - Highlights Google button
- `?method=email` - Scrolls to email form
- `?redirect=[url]` - Return URL after login

**Error States:**
- Invalid credentials: Inline error below password
- OAuth failure: Toast with fallback to email
- Account not found: Suggest registration

---

### `/auth/register` - Registration (MERGED)

**Purpose:** User registration with role selection. Client-side wizard.

#### Step 1: Account Creation (`?step=account`)

- "สร้างบัญชี" heading
- Role selection cards:
  - ผู้หางาน (Job Seeker): Icon, description
  - บริษัท/นายจ้าง (Employer): Icon, description
- **For Candidates:** Google signup (primary) or email/password
- **For Companies:** Email/password only (security note explaining why)

#### Step 2: Company Details (`?step=company`)

Only for company registration:
- Company name (Thai)
- Business registration number (13-digit Thai format)
- Industry dropdown
- Company size
- Document upload: Business registration certificate

#### Step 3: Pending (`?step=pending`)

Confirmation for companies awaiting approval:
- Success checkmark
- "บัญชีของคุณอยู่ระหว่างการตรวจสอบ"
- Estimated: 1-2 business days
- Email notification confirmation

---

### `/auth/verify` - Email Verification

**Purpose:** Email verification via link.

**States:**
| State | Display |
|-------|---------|
| Loading | Spinner: "กำลังยืนยันอีเมล..." |
| Success | Checkmark: "ยืนยันอีเมลสำเร็จ" + redirect countdown |
| Expired | Warning: "ลิงก์หมดอายุ" + resend button |
| Invalid | Error: "ลิงก์ไม่ถูกต้อง" + contact support |

---

### `/auth/reset` - Password Reset

**Purpose:** Password reset request and confirmation.

**Request Phase:**
- "รีเซ็ตรหัสผ่าน" heading
- Email input
- Submit button
- Back to login link

**Success Phase (`?status=success`):**
- "ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว"
- Check email instruction
- Resend option

---

### `/auth/status` - Account Status (MERGED)

**Purpose:** Display account status for pending or deleted accounts.

#### Pending (`?type=pending`)
- Status card with approval step
- Progress indicator
- Estimated completion
- What to do while waiting
- Contact support option

#### Deleted (`?type=deleted`)
- Account deleted confirmation
- Data deletion timeline
- Recovery option (within grace period)
- Create new account link

---

### `/auth/settings` - Account Settings (MERGED)

**Purpose:** Unified account settings for all authenticated users.

**Tab Navigation:** Horizontal (desktop), dropdown (mobile)

#### Notifications Tab (`?tab=notifications`)
- Email toggles:
  - ใบสมัครงาน (Job applications)
  - ข้อความใหม่ (New messages)
  - การนัดสัมภาษณ์ (Interview appointments)
  - งานแนะนำ (Job recommendations)
- Frequency: ทันที, สรุปรายวัน, สรุปรายสัปดาห์

#### Password Tab (`?tab=password`)
- Current password
- New password with strength indicator
- Confirm password
- Linked accounts section

#### Privacy Tab (`?tab=privacy`)
- Profile visibility toggle (candidates)
- Data export request
- Account deletion with confirmation modal

---

## 4. Candidate Routes

### `/candidates/[id]` - Candidate Dashboard

**Purpose:** Candidate home after login. Overview of activity and quick actions.

**Layout:**

**Welcome Header:**
- "สวัสดี, [First Name]"
- Today's date in Thai format

**Profile Completion Card (if < 100%):**
- Circular progress indicator
- "โปรไฟล์ของคุณสมบูรณ์ XX%"
- Missing sections with quick-add links
- CTA: "ทำโปรไฟล์ให้สมบูรณ์"

**Upcoming Appointments:**
- Card showing next interview
- Company logo, position, date/time
- Actions: View details, Message
- "ดูการนัดหมายทั้งหมด" link

**Application Summary (4 cards):**
| Status | Thai | Color |
|--------|------|-------|
| Applied | สมัครแล้ว | Blue |
| Under Review | กำลังพิจารณา | Yellow |
| Interviewing | นัดสัมภาษณ์ | Teal |
| Offers | ได้รับข้อเสนอ | Orange |

**Recent Applications:**
- Last 5 with status badges
- Company, position, date, status
- "ดูใบสมัครทั้งหมด" link

**Recommended Jobs:**
- 3-4 cards based on profile matching
- Match percentage badge

**Empty States:**
- No applications: CTA to job search
- No appointments: Message about when they appear
- Profile incomplete: Onboarding wizard prompt

---

### `/candidates/[id]/profile` - Unified Profile Editor (MERGED)

**Purpose:** Single page for all profile editing. Consolidates 4 previous routes.

**Profile Header:**
- Large avatar with edit overlay
- Name and headline
- Completion percentage ring

**Tab Navigation:**
- ข้อมูลส่วนตัว (Personal) - `?tab=personal`
- ความต้องการ (Preferences) - `?tab=preferences`
- ประวัติ (Resume) - `?tab=resume`
- ดูตัวอย่าง (Preview) - `?tab=preview`
- Onboarding - `?tab=onboarding`

#### Personal Tab (`?tab=personal`)
- Profile photo upload
- ชื่อ-นามสกุล (ภาษาไทย)
- Name (English)
- อีเมล (read-only if verified)
- เบอร์โทรศัพท์
- วันเกิด (must be 18+)
- ที่อยู่ (Province, District, Sub-district)
- เกี่ยวกับฉัน (500 char limit)

#### Preferences Tab (`?tab=preferences`)
- ประเภทงานที่ต้องการ (checkboxes)
- ตำแหน่งที่สนใจ (tags/autocomplete)
- อุตสาหกรรมที่สนใจ (multi-select)
- เงินเดือนที่คาดหวัง (min-max range)
- สถานที่ทำงาน (multi-select provinces)
- รูปแบบการทำงาน (On-site/Hybrid/Remote)
- พร้อมเริ่มงาน (Immediately, 2 weeks, 1 month, etc.)

#### Resume Tab (`?tab=resume`)

**ประสบการณ์ทำงาน:**
- Add experience button
- Cards: Company, Position, Duration, Description
- Drag to reorder, edit/delete

**การศึกษา:**
- Cards: Institution, Degree, Field, GPA, Year

**ทักษะ:**
- Skill tags with proficiency selector
- Autocomplete from master data

**ภาษา:**
- Language with proficiency level

**ใบรับรอง:**
- Certificate name, issuer, date, link

**ไฟล์เรซูเม่:**
- Resume upload (PDF/DOC)

#### Preview Tab (`?tab=preview`)
- Read-only view as companies see it
- Match score simulation
- Print/Export option

#### Onboarding Tab (`?tab=onboarding`) - MANDATORY

**5-Step Wizard:**
1. ความต้องการงาน - Job preferences
2. ข้อมูลส่วนตัว - Personal info (**MINIMUM FOR APPLICATIONS**)
3. การศึกษา - Education
4. ประสบการณ์ - Work experience
5. ทักษะ - Skills and certifications

- Progress bar (1-5)
- Next/Previous navigation
- "ข้ามขั้นตอนนี้" for steps 3-5
- Cannot access dashboard until Step 2 complete

**Form Behavior:**
- Auto-save every 30 seconds
- Unsaved changes warning on tab switch
- Inline validation errors

---

### `/candidates/[id]/applications` - Application Tracking (NEW)

**Purpose:** Critical feature for reducing candidate anxiety. Track all applications with timeline.

**Status Filter Tabs:**
| Tab | Thai | Param |
|-----|------|-------|
| All | ทั้งหมด | `?status=all` |
| Applied | สมัครแล้ว | `?status=applied` |
| Under Review | กำลังพิจารณา | `?status=reviewing` |
| Interviewing | นัดสัมภาษณ์ | `?status=interviewing` |
| Offers | ได้รับข้อเสนอ | `?status=offers` |
| Rejected | ไม่ผ่าน | `?status=rejected` |

**Application Card:**
- Company logo and name
- Position title
- Applied date
- Status badge (color-coded)
- Next action if any (e.g., "นัดสัมภาษณ์ 15 ธ.ค.")
- Expand to see timeline

**Expanded/Modal Detail:**
- Full timeline: Applied → Viewed → Accepted → Interview → etc.
- Each step with date/time
- Interview appointments linked
- Message company button
- Withdraw application option

**Empty States:**
- No applications: Large CTA to job search
- No results in filter: Suggest other tabs

---

### `/candidates/[id]/saved` - Saved Items (NEW)

**Purpose:** Manage saved jobs, searches, and alerts.

#### Saved Jobs (`?tab=jobs`)
- Grid/List toggle
- Job cards (similar to /jobs)
- Saved date shown
- Actions: Apply, Remove, Share
- Status if job closed

#### Saved Searches (`?tab=searches`)
- Search name/label
- Filters summary
- Last run date
- Run search button
- Delete option

#### Job Alerts (`?tab=alerts`)
- Criteria summary
- Frequency: ทันที, รายวัน, รายสัปดาห์
- Active/inactive toggle
- Edit criteria
- Delete alert
- Create new alert button

---

### `/candidates/[id]/settings` - Candidate Settings

**Purpose:** Candidate-specific settings. Links to /auth/settings for account settings.

**Content:**
- Link to /auth/settings for account-level settings
- Profile visibility: ค้นหาได้โดยบริษัท (toggle)
- Application preferences
- Job recommendation notification settings

---

## 5. Company Routes

### `/companies/[id]/pending` - Company Approval Status

**Purpose:** Status page for companies awaiting approval. Reduces support inquiries.

**Status Tracker Card:**
Vertical stepper:
1. ✓ บัญชีสร้างแล้ว (Account Created)
2. ✓ ข้อมูลบริษัทส่งแล้ว (Details Submitted)
3. ⟳ กำลังตรวจสอบเอกสาร (Document Verification) - in progress
4. ○ รอการอนุมัติ (Pending Approval)
5. ○ อนุมัติแล้ว (Approved)

- Current step highlighted with animation
- Estimated: "1-2 วันทำการ"

**While You Wait (`?tab=preview`):**
- "ระหว่างรอ คุณสามารถ..."
- Browse candidate preview
- Prepare job drafts
- Complete company profile

**Contact Section:**
- "มีคำถาม?" with support contact

---

### `/companies/[id]/dashboard` - Company Dashboard

**Purpose:** Company hub with metrics and quick access.

**Welcome Header:**
- Company logo and name
- "สวัสดี, [User Name]" with role badge

**Quick Stats (4 cards):**
| Metric | Thai |
|--------|------|
| Active Jobs | ประกาศงาน |
| New Applications (7 days) | ใบสมัครใหม่ |
| Pending Actions | รอดำเนินการ |
| This Week's Interviews | สัมภาษณ์สัปดาห์นี้ |

**Upcoming Appointments:**
- Calendar-style view
- Candidate name, Position, Time
- Actions: View, Message, Reschedule

**Recent Applications:**
- Table: Candidate, Position, Date, Status, Match score
- Quick actions: View, Accept, Reject

**Job Performance:**
- Mini charts: views vs applications
- Top performing jobs highlighted

---

### `/companies/[id]/dashboard/jobs` - Job Management

**Purpose:** Manage all job postings.

**Header Actions:**
- "+ ลงประกาศงานใหม่" button (orange)
- Search jobs input

**Status Filter Tabs:**
- ทั้งหมด (All)
- กำลังเปิดรับ (Active)
- ร่าง (Draft)
- หยุดชั่วคราว (Paused)
- ปิดแล้ว (Closed)

**Job List Table:**
- Columns: Title, Department, Applications, Views, Posted, Status
- Row actions: View, Edit, Pause/Resume, Close, Duplicate
- Bulk select with bulk actions
- Sortable columns

---

### `/companies/[id]/dashboard/jobs/new` - Create Job (NEW)

**Purpose:** 4-step job creation wizard.

**Step 1 - ข้อมูลเบื้องต้น (Basic Info):**
- ตำแหน่งงาน (Title)
- แผนก (Department)
- ประเภทงาน (Job Type)
- ระดับตำแหน่ง (Level)
- เงินเดือน (Salary range or "ไม่ระบุ")

**Step 2 - รายละเอียดงาน (Details):**
- รายละเอียดงาน (Description) - Rich editor
- หน้าที่รับผิดชอบ (Responsibilities) - Bullet list
- คุณสมบัติ (Requirements) - Bullet list
- สิ่งที่จะได้รับ (Benefits) - Tags

**Step 3 - สถานที่ทำงาน (Location):**
- รูปแบบการทำงาน: On-site, Hybrid, Remote
- ที่ตั้งสำนักงาน: Province, District
- ใกล้สถานี: BTS/MRT autocomplete
- Remote percentage if Hybrid

**Step 4 - ตรวจสอบและเผยแพร่ (Review & Publish):**
- Full preview
- Options: เผยแพร่ทันที, ตั้งเวลา, บันทึกเป็นร่าง

**Form Behavior:**
- Auto-save as draft
- Step validation
- Back navigation preserves data

---

### `/companies/[id]/dashboard/jobs/[jobId]` - Job Detail/Edit (MERGED)

**Purpose:** View, edit, manage individual job. Previously 3 routes.

#### View Mode (`?mode=view`)
- Job header: Title, Status, Posted date
- Actions: Edit, Pause, Close
- Performance: Views, Applications, Conversion
- Daily chart
- Job content (read-only)
- Recent applications for this job

#### Edit Mode (`?mode=edit`)
- Same form as creation, pre-filled
- Change tracking
- Save/Discard buttons

#### Publish Mode (`?mode=publish`)
- For draft jobs
- Final review checklist
- Publish/schedule options

---

### `/companies/[id]/dashboard/applications` - Application Inbox

**Purpose:** Central inbox for reviewing applications. Three-panel layout.

**Three-Panel (Desktop):**
- **Left (Filters):** Job, Status, Date range, Match score
- **Center (List):** Application cards with summary
- **Right (Detail):** Selected candidate's profile

**Application Card:**
- Avatar and name
- Position applied
- Match score badge (0-100, color-coded)
- Applied date
- Status indicator

**Candidate Detail Panel:**
- Full profile summary
- Resume/CV viewer
- Match breakdown
- **Actions:**
  - ตอบรับ (Accept) → Opens chat, enables interview
  - ปฏิเสธ (Reject) → Optional reason
  - บันทึกภายใน (Internal Note) → HR-only

**Mobile:** Stacked panels with drill-down, swipe actions

---

### `/companies/[id]/dashboard/team` - Team Management (MERGED)

**Purpose:** Manage team members, roles, invitations.

#### Members Tab (`?tab=members`)
**Table:**
- Columns: Name, Email, Role, Status, Last Active
- Role badges: Admin, HR Manager, Recruiter, Interviewer, Viewer
- Actions: Edit Role, Remove

**Pending Invitations:**
- Sent but not accepted
- Resend/Cancel options

#### Invite Tab (`?tab=invite`)
- Email input
- Role selector with permission preview
- Personal message (optional)
- Send invitation button

**Role Permissions Display:**
- Visual matrix of permissions
- Help tooltips

---

### `/companies/[id]/dashboard/candidates` - Candidate Search

**Purpose:** Proactive sourcing. Search opt-in candidates.

**Search Bar:** Keywords (skills, titles)

**Filter Sidebar:**
- ทักษะ (Skills) - Multi-select
- ประสบการณ์ (Experience) - Years
- การศึกษา (Education) - Level
- สถานที่ (Location) - Provinces
- เงินเดือนคาดหวัง (Salary) - Range

**Candidate Cards:**
- Avatar, Name, Title
- Top skills tags
- Experience summary
- Location
- "ติดต่อ" badge if already chatting

**Detail Modal:**
- Full profile view
- "ส่งข้อเสนองาน" action

**Privacy Note:**
- Only is_searchable = true candidates appear
- Some details hidden until contact

---

### `/companies/[id]/dashboard/settings` - Company Settings (MERGED)

**Purpose:** Company profile, config, analytics.

#### Profile Tab (`?tab=profile`)
- Company logo upload
- Cover image upload
- Company name (Thai/English)
- Industry, Size, Founded year
- Description (Rich text)
- Website, Social links
- Office locations
- Gallery photos

#### Config Tab (`?tab=config`)
**Default Job Settings:**
- Default location
- Default job type
- Auto-close days

**Notifications:**
- New application alerts
- Daily summary email
- Interview reminders

#### Analytics Tab (`?tab=analytics`)
**Hiring Funnel:**
- Posted → Views → Applications → Interviews → Hires

**Job Performance:**
- Per-job metrics table
- Time-to-hire
- Source attribution

---

## 6. Communication Routes

### `/chat` - Messaging Center

**Purpose:** Real-time chat between candidates and companies. Auto-created when application accepted. Includes structured interview scheduling.

**Two-Panel Layout (Desktop):**
- **Left (300px):** Conversation list
- **Right:** Active chat window

**Conversation List:**
- Search conversations
- Cards showing:
  - Avatar (company logo / candidate photo)
  - Name and position context
  - Last message preview
  - Timestamp
  - Unread badge
  - Pending appointment indicator

**Chat Window:**
- Header: Name, position, status
- Message thread:
  - Text messages (with read receipts)
  - File attachments
  - **Interview appointment cards** (structured messages)
- Input area:
  - Text field
  - Attach file button
  - "นัดสัมภาษณ์" button (company only)

#### Interview Appointment System

**Schedule Interview (Company):**
- Date picker
- Time picker
- Type: Video call, Phone, In-person
- Location/Link field
- Notes

**Appointment Card (in chat):**
- Distinct card style with border
- Date, Time, Type, Location displayed
- **Candidate actions:** ยืนยัน (Accept), ปฏิเสธ (Decline)
- Status: รอการยืนยัน, ยืนยันแล้ว, ถูกปฏิเสธ, ยกเลิก

**After Decline:**
- Chat continues for negotiation (free text)
- Company can send new appointment

**Multiple Appointments:** One chat can have multiple (1st, 2nd, final interview)

**Offline Behavior:**
- Messages queued
- Sent indicator on sync
- Offline banner

**Mobile:** Full-screen list → tap → full-screen chat

---

### `/notifications` - Notification Center (NEW)

**Purpose:** Unified notification view.

**Filter Tabs:**
- ทั้งหมด (All)
- ใบสมัคร (Applications)
- ข้อความ (Messages)
- การนัดหมาย (Appointments)
- ระบบ (System)

**Notification List:**
- Type icon
- Title and description
- Timestamp
- Read/unread indicator
- Click → navigate to relevant page

**Actions:**
- Mark all as read
- Clear all
- Settings link

---

## 7. Platform Admin Routes

### Role Hierarchy

| Role | Access |
|------|--------|
| Staff | Operations, Moderation (company approvals, content moderation) |
| Admin | + Master data, Loyalty config, Staff management |
| Super-Admin | + System settings, Integrations, Platform config |

---

### `/platform` - Platform Admin Home (RENAMED from /admin)

**Purpose:** Landing page for platform admins.

**Quick Stats:**
- Pending approvals
- Active users today
- New registrations (week)
- Active jobs

**Pending Actions:**
- Company approvals
- Reported content

**Quick Links:** To all sections

---

### `/platform/dashboard` - Platform Dashboard (MERGED)

#### Overview Tab (`?tab=overview`)
- Platform health metrics
- Charts: DAU, Registrations, Job postings
- System status

#### Requests Tab (`?tab=requests`)
**Company Approval Queue:**
- Table: Company, Submitted, Documents, Status
- Document viewer
- Approve/Reject with reason
- History

#### Team Tab (`?tab=team`) [Admin+]
- Platform staff list
- Role management
- Activity logs
- Invite new staff

---

### `/platform/companies` - Company Management

- Search and filter
- Table: Name, Status, Jobs, Users, Joined
- Actions: View, Suspend, Verify, Contact
- Status filters: All, Pending, Active, Suspended

---

### `/platform/companies/[id]` - Company Detail (Admin View)

- Profile summary
- Verification documents
- Activity history
- Associated users
- Job postings
- Actions: Verify, Suspend, Delete, Contact

---

### `/platform/candidates` - Candidate Management

- Search candidates
- Table: Name, Email, Status, Applications, Joined
- Actions: View, Suspend, Delete
- Filters: Status, Date, Activity

---

### `/platform/candidates/[id]` - Candidate Detail (Admin View)

- Full profile
- Application history
- Account status/flags
- Actions: Suspend, Delete, Reset password, Contact

---

### `/platform/jobs` - Job Management

- Search and filter
- Table: Title, Company, Status, Applications, Posted
- Reported jobs highlighted
- Actions: View, Flag, Remove, Contact
- Moderation queue

---

### `/platform/jobs/[id]` - Job Detail (Admin View)

- Full job preview
- Company info
- Report history
- Application stats
- Actions: Approve, Remove, Flag, Contact

---

### `/platform/analytics` - Platform Analytics

- Date range selector
- Key Metrics: Users, Jobs, Applications, Matches
- User Growth Chart
- Job Market Insights: Industries, Locations, Salaries
- Funnel Analysis
- Export options

---

### `/platform/system` - System Configuration (MERGED)

#### Loyalty Tab (`?tab=loyalty`) [Admin+]
- Coin reward amounts
- Earning rules
- Spending options (future)
- Transaction history

#### Master Data Tab (`?tab=master-data`) [Admin+]
- Industry list
- Skill categories
- Education levels
- Job types/levels
- Locations (provinces, districts)
- BTS/MRT stations
- CRUD for each

#### Settings Tab (`?tab=settings`) [Super-Admin]
- Maintenance mode
- Registration settings
- Email config
- Integrations (SendGrid, Firebase, Meilisearch)
- Feature flags

---

## 8. Shared Components Reference

### 8.1 Appointment Tracker Widget

Displays upcoming interviews on dashboards.

- Compact card format
- Shows: Date, Time, Company/Candidate, Position, Type
- Status: Pending confirmation, Confirmed
- Actions: View, Message, Reschedule
- "ดูทั้งหมด" link

### 8.2 Profile Completion Ring

Circular progress indicator.

- Percentage in center
- Color: Red (< 40%) → Yellow (40-70%) → Green (> 70%)
- Click to see missing sections
- Celebration at 100%

### 8.3 Match Score Badge

Job-candidate compatibility indicator.

- Score 0-100
- Colors: Red (< 40), Yellow (40-69), Green (70-89), Teal (90+)
- Hover shows breakdown

### 8.4 Status Badges

**Application Status:**
| Status | Thai | Color |
|--------|------|-------|
| Applied | สมัครแล้ว | Blue |
| Viewed | ดูแล้ว | Gray |
| Accepted | ตอบรับ | Teal |
| Interview | นัดสัมภาษณ์ | Orange |
| Offer | ได้รับข้อเสนอ | Green |
| Rejected | ปฏิเสธ | Red |

**Job Status:**
| Status | Thai | Color |
|--------|------|-------|
| Active | กำลังเปิดรับ | Green |
| Draft | ร่าง | Gray |
| Paused | หยุดชั่วคราว | Yellow |
| Closed | ปิดแล้ว | Red |

### 8.5 Empty States

- Illustration (subtle, on-brand)
- Clear message
- Primary action button
- Secondary help text

### 8.6 Loading States

- Skeleton screens for content
- Spinner for actions
- Progress bar for uploads
- Branded animation for page transitions

### 8.7 Error States

- Inline validation (red text below field)
- Toast notifications for actions
- Full-page error (with retry, home links)
- Connection lost banner (sticky)

---

## Summary

| Section | Routes | Key Features |
|---------|--------|--------------|
| Public | 9 | Job search, Company directory, Help center |
| Auth | 6 | Google OAuth primary, Multi-step registration |
| Candidate | 5 | Unified profile, Application tracking, Saved items |
| Company | 8 | Job wizard, Application inbox, Team management |
| Chat | 2 | Interview appointments, Notifications |
| Platform | 10 | Role-based admin (Staff/Admin/Super-Admin) |
| **Total** | **45** | Consolidated from 82 routes (45% reduction) |

---

*End of Document*
