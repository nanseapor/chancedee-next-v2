# ChanceDee Layout Component Specification
## Section 8: Platform Admin Routes (10 routes)

**Version:** 2.0  
**Date:** December 2024

---

## 8.0 Platform Admin Overview

**Shell:** Platform Admin Shell (Desktop Only)  
**Access:** Staff, Admin, Super-Admin roles only

### Role Hierarchy

| Role | Access Level |
|------|--------------|
| Staff | Operations + Moderation |
| Admin | + Master Data, Loyalty, Staff management |
| Super-Admin | + System settings, Integrations, Full access |

### Common Admin Patterns

All platform admin routes share:
- Desktop-only access (mobile shows block screen)
- Left sidebar navigation with role-based visibility
- Audit logging for all actions
- Bulk action support where applicable

---

## 8.1 `/platform` - Platform Admin Home

**Shell:** Platform Admin Shell  
**Purpose:** Landing page for platform admins, quick overview

### Layout

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Welcome Header** | Admin greeting | Top | Desktop only | - | - |
| ↳ Title | "แอดมินแพลตฟอร์ม" | Left | - | - | - |
| ↳ User Info | Name + role | Right | - | - | Role badge |
| **Quick Stats** | Key metrics | Below header | - | - | - |
| ↳ Stat Cards | 4 cards | 4 cols | - | - | - |
| ↳↳ Pending Approvals | รอการอนุมัติ | - | - | → /platform/dashboard?tab=requests | Badge, clickable |
| ↳↳ Active Users Today | ผู้ใช้วันนี้ | - | - | - | - |
| ↳↳ New Registrations | ลงทะเบียนใหม่ (สัปดาห์) | - | - | - | - |
| ↳↳ Active Jobs | ประกาศงานที่เปิดรับ | - | - | - | - |
| **Pending Actions** | Action queue | Below stats | - | - | - |
| ↳ Section Title | "รอดำเนินการ" | - | - | - | - |
| ↳ Action Cards | Pending items | 2 cols | - | - | - |
| ↳↳ Company Approvals | Pending companies | - | - | → /platform/dashboard?tab=requests | Count badge |
| ↳↳ Reported Content | Reports to review | - | - | → /platform/jobs?status=reported | Count badge |
| ↳↳ Support Tickets | Open tickets | - | - | → /platform/support | If applicable |
| **Quick Links** | Navigation | Below actions | - | - | - |
| ↳ Link Grid | All sections | 3 cols | - | - | Role-filtered |
| ↳↳ บริษัท | Companies | - | - | → /platform/companies | - |
| ↳↳ ผู้สมัคร | Candidates | - | - | → /platform/candidates | - |
| ↳↳ ประกาศงาน | Jobs | - | - | → /platform/jobs | - |
| ↳↳ สถิติ | Analytics | - | - | → /platform/analytics | - |
| ↳↳ ระบบ | System (Admin+) | - | - | → /platform/system | Admin+ only |

---

## 8.2 `/platform/dashboard` - Platform Dashboard

**Shell:** Platform Admin Shell  
**Purpose:** Detailed metrics, approval queue, team management

### Layout

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Page Header** | Title | Top | - | - | "แดชบอร์ด" |
| **Tab Navigation** | Dashboard sections | Below header | - | - | - |
| ↳ ภาพรวม | Overview | - | - | ?tab=overview | - |
| ↳ คำขออนุมัติ | Requests | - | - | ?tab=requests | Badge if pending |
| ↳ ทีมงาน | Team | - | - | ?tab=team | Admin+ only |
| **Tab Content** | Selected section | Main | - | - | - |

### Overview Tab (`?tab=overview`)

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Health Metrics** | Platform status | Top | - | - | - |
| ↳ Metric Cards | Key stats | Row | - | - | - |
| ↳↳ DAU | Daily active users | - | - | - | Trend arrow |
| ↳↳ WAU | Weekly active | - | - | - | - |
| ↳↳ MAU | Monthly active | - | - | - | - |
| ↳↳ Retention | User retention % | - | - | - | - |
| **Charts Section** | Visual data | Below metrics | - | - | - |
| ↳ User Growth Chart | Registrations over time | Left | - | - | Line chart |
| ↳ Job Postings Chart | Jobs over time | Right | - | - | Bar chart |
| ↳ Application Volume | Apps over time | Full-width | - | - | Area chart |
| **System Status** | Health check | Below charts | - | - | - |
| ↳ Service Status | System components | - | - | - | - |
| ↳↳ API | Status | - | - | - | Green/Yellow/Red |
| ↳↳ Database | Status | - | - | - | - |
| ↳↳ Search (Meilisearch) | Status | - | - | - | - |
| ↳↳ Storage (Firebase) | Status | - | - | - | - |
| ↳↳ Email (SendGrid) | Status | - | - | - | - |

### Requests Tab (`?tab=requests`)

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Approval Queue** | Pending companies | Main | - | - | - |
| ↳ Queue Header | Title + count | Top | - | - | "XX บริษัทรออนุมัติ" |
| ↳ Filter Bar | Filter requests | Below header | - | - | - |
| ↳↳ Status Filter | All/Pending/In Review | - | - | Filter | - |
| ↳↳ Date Sort | Oldest/Newest | - | - | Sort | - |
| ↳ Request Table | Company list | - | - | - | - |
| ↳↳ Columns | - | - | - | - | - |
| ↳↳↳ Company | บริษัท | - | - | - | Name + logo |
| ↳↳↳ Submitted | วันที่ส่ง | - | - | - | Thai date |
| ↳↳↳ Documents | เอกสาร | - | - | View documents | View button |
| ↳↳↳ Status | สถานะ | - | - | - | Badge |
| ↳↳↳ Assigned | ผู้รับผิดชอบ | - | - | - | Staff name |
| ↳↳↳ Actions | - | - | - | - | - |
| ↳↳ Request Row | Single request | - | - | - | Expandable |
| ↳↳↳ Expand Arrow | Show details | - | - | Toggle expand | - |
| **Expanded Detail** | Company info | - | - | - | - |
| ↳ Company Info | Basic details | Left | - | - | - |
| ↳ Documents | Uploaded files | Center | - | Open viewer | Clickable to view |
| ↳ Action Panel | Decisions | Right | - | - | - |
| ↳↳ Approve Button | "อนุมัติ" | - | - | Approve company | Teal |
| ↳↳ Reject Button | "ปฏิเสธ" | - | - | Opens reject modal | Red |
| ↳↳ Request More | "ขอเอกสารเพิ่ม" | - | - | Request more docs | - |

### Document Viewer Modal

| Component | Purpose | Position | Action |
|-----------|---------|----------|--------|
| Modal Overlay | Background | Full | - |
| Document Viewer | PDF/Image viewer | Center | - |
| Close Button | × | Top-right | Close modal |
| Download Button | Download file | Top | Download |
| Zoom Controls | +/- | Bottom | Zoom |

### Reject Modal

| Component | Purpose | Action |
|-----------|---------|--------|
| Title | "ปฏิเสธการลงทะเบียน" | - |
| Reason Dropdown | Common reasons | Select reason |
| Custom Reason | Textarea | - |
| Cancel Button | "ยกเลิก" | Close modal |
| Reject Button | "ปฏิเสธ" (red) | Submit rejection |

### Team Tab (`?tab=team`) - Admin+ Only

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Team Header** | Title + invite | Top | - | - | - |
| ↳ Title | "ทีมแอดมิน" | Left | - | - | - |
| ↳ Invite Button | "+ เชิญสมาชิก" | Right | - | Opens invite modal | - |
| **Staff Table** | Admin list | Main | - | - | - |
| ↳ Columns | Name, Email, Role, Status, Last Active, Actions | - | - | - | - |
| ↳ Staff Row | Single admin | - | - | - | - |
| ↳↳ Avatar | Photo | - | - | - | - |
| ↳↳ Name | Full name | - | - | - | - |
| ↳↳ Email | Email | - | - | - | - |
| ↳↳ Role Badge | Staff/Admin/Super | - | - | - | Color-coded |
| ↳↳ Status | Active/Inactive | - | - | - | - |
| ↳↳ Last Active | Timestamp | - | - | - | - |
| ↳↳ Action Menu | Edit role, Remove | - | - | Opens menu | Super-Admin only for Admin |
| **Activity Log** | Recent actions | Below table | - | - | - |
| ↳ Log Entries | Admin actions | - | - | - | Scrollable |

---

## 8.3 `/platform/companies` - Company Management

**Shell:** Platform Admin Shell  
**Purpose:** Manage all registered companies

### Layout

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Page Header** | Title + search | Top | - | - | - |
| ↳ Title | "บริษัททั้งหมด" | Left | - | - | - |
| ↳ Search Bar | Search companies | Center | - | Search | Name, ID |
| ↳ Export Button | "ส่งออก" | Right | - | Export | CSV/Excel |
| **Filter Bar** | Filter options | Below header | - | - | - |
| ↳ Status Filter | All/Pending/Active/Suspended | - | - | Filter | Tabs or dropdown |
| ↳ Date Filter | Registration date | - | - | Filter | Range picker |
| ↳ Industry Filter | By industry | - | - | Filter | Dropdown |
| **Company Table** | Company list | Main | - | - | - |
| ↳ Bulk Select | Checkbox all | Left | - | Select all | - |
| ↳ Bulk Actions | If selected | Top | - | Bulk action | Verify, Suspend |
| ↳ Table Header | Columns | - | - | - | Sortable |
| ↳↳ Checkbox | Select | - | - | Toggle select | - |
| ↳↳ Company | บริษัท | - | - | - | Logo + name |
| ↳↳ Status | สถานะ | - | - | - | Badge |
| ↳↳ Jobs | ประกาศงาน | - | - | - | Count |
| ↳↳ Users | สมาชิก | - | - | - | Count |
| ↳↳ Joined | วันที่ลงทะเบียน | - | - | - | Thai date |
| ↳↳ Actions | - | - | - | - | - |
| ↳ Company Row | Single company | - | - | - | Clickable |
| ↳↳ Action Menu | ⋮ | Right | - | Opens menu | - |
| ↳↳↳ View | ดู | - | - | → /platform/companies/[id] | - |
| ↳↳↳ Verify | ยืนยัน | - | - | Verify company | If not verified |
| ↳↳↳ Suspend | ระงับ | - | - | Suspend company | Red |
| ↳↳↳ Contact | ติดต่อ | - | - | Opens email | - |
| **Pagination** | Page nav | Bottom | - | Navigate | - |

---

## 8.4 `/platform/companies/[id]` - Company Detail (Admin View)

**Shell:** Platform Admin Shell  
**Purpose:** Full company info with admin actions

### Layout

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Back Link** | "← กลับไปบริษัททั้งหมด" | Top | - | → /platform/companies | - |
| **Company Header** | Overview | Top | - | - | - |
| ↳ Logo | Company logo | Left | - | - | - |
| ↳ Name | Company name | - | - | - | - |
| ↳ Status Badges | Verification, Status | - | - | - | - |
| ↳ Action Buttons | Admin actions | Right | - | - | - |
| ↳↳ Verify | "ยืนยัน" | - | - | Verify company | If not verified |
| ↳↳ Suspend | "ระงับ" | - | - | Suspend | Or "ยกเลิกการระงับ" |
| ↳↳ Delete | "ลบ" | - | - | Confirm + delete | Red, confirmation |
| ↳↳ Contact | "ติดต่อ" | - | - | Opens email | - |
| **Tab Navigation** | Sections | Below header | - | - | - |
| ↳ ข้อมูลบริษัท | Profile | - | - | ?tab=profile | - |
| ↳ เอกสาร | Documents | - | - | ?tab=documents | - |
| ↳ ประวัติ | History | - | - | ?tab=history | - |
| ↳ สมาชิก | Users | - | - | ?tab=users | - |
| ↳ ประกาศงาน | Jobs | - | - | ?tab=jobs | - |

### Profile Tab

| Component | Purpose | Action |
|-----------|---------|--------|
| Company Info | All profile fields (read-only) | - |
| Registration Details | Business reg number, docs | - |
| Contact Info | Email, phone, address | - |

### Documents Tab

| Component | Purpose | Action |
|-----------|---------|--------|
| Document List | Uploaded verification docs | - |
| Document Viewer | Click to view | Open viewer |
| Request More Button | Ask for additional docs | Send request |

### History Tab

| Component | Purpose |
|-----------|---------|
| Activity Timeline | All actions on company |
| ↳ Registration | When registered |
| ↳ Verification | When verified |
| ↳ Status Changes | Suspensions, etc. |
| ↳ Admin Actions | Who did what |

### Users Tab

| Component | Purpose | Action |
|-----------|---------|--------|
| User Table | Company team members | - |
| Role badges | Admin, HR, etc. | - |
| Actions | View, Suspend user | View/Suspend |

### Jobs Tab

| Component | Purpose | Action |
|-----------|---------|--------|
| Job List | All company jobs | - |
| Status | Active/Paused/Closed | - |
| Actions | View, Remove | View/Remove |

---

## 8.5 `/platform/candidates` - Candidate Management

**Shell:** Platform Admin Shell  
**Purpose:** Manage all registered candidates

### Layout

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Page Header** | Title + search | Top | - | - | - |
| ↳ Title | "ผู้สมัครทั้งหมด" | Left | - | - | - |
| ↳ Search Bar | Search candidates | Center | - | Search | Name, email |
| ↳ Export Button | "ส่งออก" | Right | - | Export | - |
| **Filter Bar** | Filters | Below header | - | - | - |
| ↳ Status Filter | All/Active/Suspended/Deleted | - | - | Filter | - |
| ↳ Date Filter | Registration date | - | - | Filter | - |
| ↳ Activity Filter | Active/Inactive | - | - | Filter | - |
| **Candidate Table** | User list | Main | - | - | - |
| ↳ Columns | Name, Email, Status, Applications, Joined, Actions | - | - | - | - |
| ↳ Candidate Row | Single user | - | - | - | - |
| ↳↳ Avatar | Photo | - | - | - | - |
| ↳↳ Name | Full name | - | - | - | Thai + English |
| ↳↳ Email | Email | - | - | - | - |
| ↳↳ Status Badge | Status | - | - | - | - |
| ↳↳ Applications | Count | - | - | - | - |
| ↳↳ Joined Date | Thai date | - | - | - | - |
| ↳↳ Action Menu | View, Suspend, Delete | - | - | Opens menu | - |
| **Pagination** | Page nav | Bottom | - | Navigate | - |

---

## 8.6 `/platform/candidates/[id]` - Candidate Detail (Admin View)

**Shell:** Platform Admin Shell  
**Purpose:** Full candidate profile with admin actions

### Layout

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Back Link** | "← กลับไปผู้สมัครทั้งหมด" | Top | - | → /platform/candidates | - |
| **Candidate Header** | Overview | Top | - | - | - |
| ↳ Avatar | Profile photo | Left | - | - | - |
| ↳ Name | Full name | - | - | - | Thai + English |
| ↳ Email | Email | - | - | - | - |
| ↳ Status Badge | Account status | - | - | - | - |
| ↳ Action Buttons | Admin actions | Right | - | - | - |
| ↳↳ Suspend | "ระงับ" | - | - | Suspend | Or unsuspend |
| ↳↳ Delete | "ลบ" | - | - | Confirm + delete | Confirmation |
| ↳↳ Reset Password | "รีเซ็ตรหัสผ่าน" | - | - | Reset password | - |
| ↳↳ Contact | "ติดต่อ" | - | - | Opens email | - |
| **Tab Navigation** | Sections | Below header | - | - | - |
| ↳ โปรไฟล์ | Full profile | - | - | ?tab=profile | - |
| ↳ ใบสมัคร | Applications | - | - | ?tab=applications | - |
| ↳ ประวัติ | Activity history | - | - | ?tab=history | - |
| ↳ ธง/รายงาน | Flags/Reports | - | - | ?tab=flags | If any |

### Profile Tab
Full candidate profile in read-only view

### Applications Tab
List of all applications with status

### History Tab
Activity timeline: logins, applications, profile changes

### Flags Tab
Any reports or flags against this user

---

## 8.7 `/platform/jobs` - Job Management

**Shell:** Platform Admin Shell  
**Purpose:** Manage and moderate all job postings

### Layout

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Page Header** | Title + search | Top | - | - | - |
| ↳ Title | "ประกาศงานทั้งหมด" | Left | - | - | - |
| ↳ Search Bar | Search jobs | Center | - | Search | Title, company |
| **Filter Bar** | Filters | Below header | - | - | - |
| ↳ Status Filter | All/Active/Paused/Closed/Reported | - | - | Filter | - |
| ↳ Company Filter | By company | - | - | Filter | Autocomplete |
| ↳ Date Filter | Posted date | - | - | Filter | - |
| **Reported Jobs Banner** | If any reported | Top of table | - | - | - |
| ↳ Alert | "XX งานถูกรายงาน" | - | - | Filter to reported | - |
| **Job Table** | Job list | Main | - | - | - |
| ↳ Columns | Title, Company, Status, Applications, Posted, Actions | - | - | - | - |
| ↳ Job Row | Single job | - | - | - | - |
| ↳↳ Title | Job title | - | - | → /platform/jobs/[id] | Link |
| ↳↳ Company | Company name | - | - | → /platform/companies/[id] | Link |
| ↳↳ Status Badge | Status | - | - | - | - |
| ↳↳ Report Badge | 🚩 | - | - | - | If reported |
| ↳↳ Applications | Count | - | - | - | - |
| ↳↳ Posted Date | Thai date | - | - | - | - |
| ↳↳ Action Menu | View, Flag, Remove | - | - | Opens menu | - |
| **Moderation Queue** | Sidebar or tab | Right or tab | - | - | Reported jobs |

---

## 8.8 `/platform/jobs/[id]` - Job Detail (Admin View)

**Shell:** Platform Admin Shell  
**Purpose:** Review job with moderation actions

### Layout

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Back Link** | "← กลับไปประกาศงานทั้งหมด" | Top | - | → /platform/jobs | - |
| **Job Header** | Overview | Top | - | - | - |
| ↳ Title | Job title | Left | - | - | - |
| ↳ Company | Company name + logo | - | - | → /platform/companies/[id] | Link to company |
| ↳ Status Badge | Status | - | - | - | - |
| ↳ Report Badge | If reported | - | - | - | 🚩 |
| ↳ Action Buttons | Moderation | Right | - | - | - |
| ↳↳ Approve | "อนุมัติ" | - | - | Approve job | If pending |
| ↳↳ Remove | "ลบ" | - | - | Confirm + remove | Red, reason required |
| ↳↳ Flag | "ติดธง" | - | - | Flag job | Mark for review |
| ↳↳ Contact | "ติดต่อบริษัท" | - | - | Opens email | - |
| **Job Preview** | Full job content | Main | - | - | Same as public view |
| **Report Section** | If reported | Below preview | - | - | - |
| ↳ Report Details | Who reported, reason | - | - | - | - |
| ↳ Report Actions | Dismiss, Take action | - | - | Dismiss/Action | - |
| **Statistics** | Job performance | Sidebar | - | - | - |
| ↳ Views | View count | - | - | - | - |
| ↳ Applications | App count | - | - | - | - |
| ↳ Posted By | Company user | - | - | - | - |
| ↳ Posted Date | When | - | - | - | - |

---

## 8.9 `/platform/analytics` - Platform Analytics

**Shell:** Platform Admin Shell  
**Purpose:** Comprehensive platform statistics

### Layout

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Page Header** | Title + controls | Top | - | - | - |
| ↳ Title | "สถิติแพลตฟอร์ม" | Left | - | - | - |
| ↳ Date Range Picker | Filter period | Center | - | Select range | Max 1 year |
| ↳ Export Button | "ส่งออก" | Right | - | Export | PDF/Excel |
| **Key Metrics Row** | Summary stats | Below header | - | - | - |
| ↳ Total Users | ผู้ใช้ทั้งหมด | - | - | - | + trend |
| ↳ Total Companies | บริษัททั้งหมด | - | - | - | + trend |
| ↳ Total Jobs | ประกาศงานทั้งหมด | - | - | - | + trend |
| ↳ Total Applications | ใบสมัครทั้งหมด | - | - | - | + trend |
| **User Growth Section** | User charts | - | - | - | - |
| ↳ Registration Chart | New users over time | - | - | - | Line chart |
| ↳ User Type Split | Candidates vs Companies | - | - | - | Pie chart |
| ↳ Retention Chart | User retention | - | - | - | Cohort |
| **Job Market Section** | Job insights | - | - | - | - |
| ↳ Jobs by Industry | Industry distribution | - | - | - | Bar chart |
| ↳ Jobs by Location | Geographic | - | - | - | Map or bar |
| ↳ Salary Insights | Salary ranges | - | - | - | Distribution |
| **Funnel Analysis** | Conversion | - | - | - | - |
| ↳ Application Funnel | Posted → Applied → Interviewed → Hired | - | - | - | Funnel chart |
| ↳ Conversion Rates | Per stage | - | - | - | - |
| **Export Options** | Data export | Bottom | - | - | - |
| ↳ Report Type | Summary/Detailed | - | - | Select | - |
| ↳ Format | PDF/Excel/CSV | - | - | Select | - |

### Exception Components

| Exception | Display | Action |
|-----------|---------|--------|
| Data unavailable | Error per chart section | - |
| Date range too large | "เลือกได้สูงสุด 1 ปี" | - |
| Export failed | Toast + retry | Retry |
| Export too large | "ข้อมูลมากเกินไป ลดช่วงเวลา" | - |
| Real-time delayed | Warning badge | - |

---

## 8.10 `/platform/system` - System Configuration

**Shell:** Platform Admin Shell  
**Purpose:** Platform settings, master data, loyalty config

### Layout

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Page Header** | Title | Top | - | - | "การตั้งค่าระบบ" |
| **Tab Navigation** | Config sections | Below header | - | - | Role-filtered |
| ↳ Loyalty | ระบบเหรียญ | - | - | ?tab=loyalty | Admin+ only |
| ↳ Master Data | ข้อมูลหลัก | - | - | ?tab=master-data | Admin+ only |
| ↳ Settings | การตั้งค่า | - | - | ?tab=settings | Super-Admin only |

### Loyalty Tab (`?tab=loyalty`) - Admin+

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Coin Rewards Config** | Earning rules | - | - | - | - |
| ↳ Section Title | "การได้รับเหรียญ" | - | - | - | - |
| ↳ Reward Rules | Editable list | - | - | - | - |
| ↳↳ Registration | ลงทะเบียน | - | - | Edit value | Default: 100 |
| ↳↳ Referral | แนะนำเพื่อน | - | - | Edit value | Default: 100 |
| ↳↳ Profile Complete | โปรไฟล์ครบ | - | - | Edit value | Default: 100 |
| ↳↳ First Application | สมัครงานครั้งแรก | - | - | Edit value | Default: 50 |
| **Spending Options** | Future redemption | - | - | - | - |
| ↳ Coming Soon | Placeholder | - | - | - | - |
| **Transaction History** | Recent coin transactions | - | - | - | - |
| ↳ Transaction Table | User, Type, Amount, Date | - | - | - | - |
| **Save Button** | Apply changes | Bottom | - | Save | - |

### Master Data Tab (`?tab=master-data`) - Admin+

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Data Category Tabs** | Sub-navigation | Left sidebar | - | - | - |
| ↳ อุตสาหกรรม | Industries | - | - | Select category | - |
| ↳ ทักษะ | Skills | - | - | Select category | - |
| ↳ ระดับการศึกษา | Education levels | - | - | Select category | - |
| ↳ ประเภทงาน | Job types | - | - | Select category | - |
| ↳ ระดับตำแหน่ง | Job levels | - | - | Select category | - |
| ↳ จังหวัด | Provinces | - | - | Select category | - |
| ↳ สถานี BTS/MRT | Transit stations | - | - | Select category | - |
| **Data List** | Items for selected category | Main | - | - | - |
| ↳ Add Button | "+ เพิ่ม" | Top-right | - | Opens add modal | - |
| ↳ Search | Filter items | Top | - | Search | - |
| ↳ Item List | All items | - | - | - | - |
| ↳↳ Item Row | Single item | - | - | - | - |
| ↳↳↳ Name (Thai) | Thai name | - | - | - | - |
| ↳↳↳ Name (English) | English name | - | - | - | - |
| ↳↳↳ Status | Active/Inactive | - | - | Toggle status | Toggle |
| ↳↳↳ Usage Count | How many using | - | - | - | - |
| ↳↳↳ Actions | Edit, Delete | - | - | Edit/Delete | - |

### Add/Edit Item Modal

| Component | Purpose | Action |
|-----------|---------|--------|
| Name (Thai) | Thai label | - |
| Name (English) | English label | - |
| Status | Active toggle | Toggle |
| Parent | If hierarchical | Select |
| Save Button | Save item | Save |

### Settings Tab (`?tab=settings`) - Super-Admin Only

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Maintenance Mode** | System toggle | - | - | - | - |
| ↳ Toggle | Enable/Disable | - | - | Toggle | Confirmation modal |
| ↳ Message | Maintenance message | - | - | Edit | - |
| ↳ Expected Return | ETA | - | - | Set time | - |
| **Registration Settings** | User registration | - | - | - | - |
| ↳ Candidate Registration | Open/Closed | - | - | Toggle | - |
| ↳ Company Registration | Open/Closed | - | - | Toggle | - |
| **Email Configuration** | SendGrid settings | - | - | - | - |
| ↳ From Email | Sender address | - | - | Edit | - |
| ↳ Test Button | Send test email | - | - | Send test | - |
| **Integrations** | Third-party services | - | - | - | - |
| ↳ Firebase | Status + config | - | - | - | - |
| ↳ Meilisearch | Status + config | - | - | - | - |
| ↳ SendGrid | Status + config | - | - | - | - |
| ↳↳ Test Connection | Per integration | - | - | Test connection | - |
| **Feature Flags** | Toggle features | - | - | - | - |
| ↳ Feature List | All flags | - | - | - | - |
| ↳↳ Feature Toggle | Enable/Disable | - | - | Toggle | - |
| **Save Button** | Apply changes | Bottom | - | Save | Confirmation |

### Exception Components

| Exception | Display | Action |
|-----------|---------|--------|
| Setting save failed | Toast + retry | Retry |
| Master data in use | "รายการนี้กำลังถูกใช้งาน" (block delete) | - |
| Duplicate master data | "ชื่อนี้มีอยู่แล้ว" | - |
| Maintenance mode warning | Confirm "ผู้ใช้จะไม่สามารถเข้าถึงได้" | Confirm |
| Integration test failed | "เชื่อมต่อไม่สำเร็จ" + details | - |
| Config validation failed | Inline error | - |
| Loyalty points negative | "จำนวนต้องมากกว่า 0" | - |

---

### General Admin Exception Components

| Exception | Display | Action |
|-----------|---------|--------|
| Insufficient role | 403 redirect | → allowed section |
| Action on self | "ไม่สามารถแก้ไขตัวเอง" | - |
| Last super-admin | "ต้องมี Super-Admin อย่างน้อย 1 คน" | - |
| Audit log failed | Continue + alert system admin | - |
| Entity not found | 404 | → back to list |
| Already suspended | Toast "ระงับแล้ว" | - |
| Already verified | Toast "ยืนยันแล้ว" | - |
| Delete with dependencies | Confirm modal showing dependencies | Confirm |
| Permanent delete confirm | Type "ลบถาวร" to confirm | Confirm |

---

*End of Section 8: Platform Admin Routes*
