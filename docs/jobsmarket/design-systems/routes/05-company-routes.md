# ChanceDee Layout Component Specification
## Section 6: Company Routes (8 routes)

**Version:** 2.0  
**Date:** December 2024

---

## 6.1 `/companies/[id]/pending` - Company Approval Status

**Shell:** Minimal Shell (limited Company Shell)  
**Purpose:** Status page for companies awaiting approval

### Layout

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Status Card** | Approval progress | Center, max 600px | Full-width mobile | - | - |
| ↳ Company Header | Branding | Top | - | - | - |
| ↳↳ Logo | Company logo | Left | Center mobile | - | - |
| ↳↳ Name | Company name | Right | Below logo mobile | - | - |
| ↳ Status Tracker | Progress stepper | - | - | - | Vertical |
| ↳↳ Step 1 | ✓ บัญชีสร้างแล้ว | - | - | - | Green check |
| ↳↳ Step 2 | ✓ ข้อมูลบริษัทส่งแล้ว | - | - | - | Green check |
| ↳↳ Step 3 | ⟳ กำลังตรวจสอบเอกสาร | - | - | - | Animated, highlighted |
| ↳↳ Step 4 | ○ รอการอนุมัติ | - | - | - | Gray |
| ↳↳ Step 5 | ○ อนุมัติแล้ว | - | - | - | Gray |
| ↳ Time Estimate | "โดยประมาณ 1-2 วันทำการ" | Below stepper | - | - | - |
| ↳ Email Note | "เราจะแจ้งผลทางอีเมล" | - | - | - | - |
| **While Waiting Tab** | Preparation | Below status | - | - | ?tab=preview |
| ↳ Section Title | "ระหว่างรอ คุณสามารถ..." | - | - | - | - |
| ↳ Action Cards | Suggested actions | - | - | - | - |
| ↳↳ Browse Candidates | Preview search | - | - | → .../candidates | Limited access |
| ↳↳ Prepare Job Drafts | Draft jobs | - | - | → .../jobs/new | Won't publish |
| ↳↳ Complete Profile | Edit company | - | - | → .../settings | - |
| **Contact Section** | Support | Bottom | - | - | - |
| ↳ Question Text | "มีคำถาม?" | - | - | - | - |
| ↳ Contact Link | Support channel | - | - | Contact support | - |
| **Logout Button** | Exit | Bottom | - | Logout | - |

### Exception States

| Exception | Display | Action |
|-----------|---------|--------|
| Already approved | Redirect | → Dashboard |
| Rejected | Rejection state (see below) | - |
| Document re-upload needed | Alert banner | Edit info |
| Not owner | Redirect | → own company |

### Rejection State

| Component | Purpose | Action |
|-----------|---------|--------|
| Rejection Icon | ✗ red | - |
| Title | "การลงทะเบียนไม่ได้รับการอนุมัติ" | - |
| Reason | Admin-provided reason | - |
| Description | "คุณสามารถแก้ไขและส่งใหม่ได้" | - |
| Edit Button | "แก้ไขข้อมูล" | Edit and resubmit |
| Support Button | "ติดต่อฝ่ายสนับสนุน" | Contact support |

---

## 6.2 `/companies/[id]/dashboard` - Company Dashboard

**Shell:** Company Shell  
**Purpose:** Company hub with metrics and quick access

### Layout

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Welcome Header** | Greeting | Top | - | - | - |
| ↳ Company Logo | 48×48 | Left | - | - | - |
| ↳ Company Name | Name | Center | - | - | - |
| ↳ User Greeting | "สวัสดี, [Name]" | Right | Below name mobile | - | - |
| ↳ Role Badge | Admin/HR/Recruiter | - | - | - | Color-coded |
| **Quick Stats** | Key metrics | Below header | 2×2 mobile | - | - |
| ↳ Stat Card Grid | 4 cards | 4 cols | - | - | - |
| ↳↳ Active Jobs | ประกาศงาน | - | - | → .../jobs | Count + trend |
| ↳↳ New Applications | ใบสมัครใหม่ (7 วัน) | - | - | → .../applications | Count + badge |
| ↳↳ Pending Actions | รอดำเนินการ | - | - | → .../applications | Count |
| ↳↳ Interviews | สัมภาษณ์สัปดาห์นี้ | - | - | → /chat | Count |
| **Upcoming Appointments** | Interview schedule | Below stats | - | - | Hide if empty |
| ↳ Section Title | "การนัดหมายที่กำลังจะถึง" | Left | - | - | - |
| ↳ View All Link | "ดูทั้งหมด" | Right | - | → /chat | - |
| ↳ Calendar View | Week view | - | - | - | - |
| ↳↳ Appointment Item | Single interview | - | - | - | - |
| ↳↳↳ Time | Time slot | Left | - | - | - |
| ↳↳↳ Candidate | Name + photo | - | - | - | - |
| ↳↳↳ Position | Job title | - | - | - | - |
| ↳↳↳ Actions | View, Message | Right | - | → /chat | - |
| **Recent Applications** | Latest apps | Below appointments | - | - | - |
| ↳ Section Title | "ใบสมัครล่าสุด" | Left | - | - | - |
| ↳ View All Link | "ดูทั้งหมด" | Right | - | → .../applications | - |
| ↳ Application Table | Recent apps | - | Card list mobile | - | - |
| ↳↳ Header Row | Columns | - | - | - | - |
| ↳↳↳ Candidate | ผู้สมัคร | - | - | - | - |
| ↳↳↳ Position | ตำแหน่ง | - | - | - | - |
| ↳↳↳ Date | วันที่ | - | - | - | - |
| ↳↳↳ Match | คะแนน | - | - | - | - |
| ↳↳↳ Actions | - | - | - | - | - |
| ↳↳ Application Row | Single app | - | - | - | - |
| ↳↳↳ Candidate Photo | Avatar | - | - | - | - |
| ↳↳↳ Candidate Name | Name | - | - | - | - |
| ↳↳↳ Position | Job title | - | - | - | - |
| ↳↳↳ Applied Date | Relative | - | - | - | - |
| ↳↳↳ Match Score | Badge | - | - | - | Color-coded |
| ↳↳↳ Quick Actions | Accept/Reject | - | - | Accept/Reject flow | - |
| **Job Performance** | Metrics | Below applications | - | - | - |
| ↳ Section Title | "ประสิทธิภาพประกาศงาน" | Left | - | - | - |
| ↳ Mini Chart | Views vs Apps | - | - | - | - |
| ↳ Top Jobs | Best performing | - | - | → .../jobs/[id] | - |

### Empty States

| State | Display | CTA |
|-------|---------|-----|
| No jobs | "ยังไม่มีประกาศงาน" | → .../jobs/new "ลงประกาศงานแรก" |
| No applications | "ยังไม่มีใบสมัคร" | "แชร์ลิงก์ประกาศงาน" |
| No interviews | "ไม่มีการนัดหมายในสัปดาห์นี้" | Hide section |

### Exception Components

| Exception | Display |
|-----------|---------|
| Analytics unavailable | Hide section |
| User role insufficient | Limited view, hide sensitive |

---

## 6.3 `/companies/[id]/dashboard/jobs` - Job Management

**Shell:** Company Shell  
**Purpose:** Manage all job postings

### Layout

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Page Header** | Title + actions | Top | Stack mobile | - | - |
| ↳ Title | "ประกาศงาน" | Left | - | - | - |
| ↳ Search Input | Search jobs | Center | Full-width mobile | Search | - |
| ↳ Create Button | "+ ลงประกาศงานใหม่" | Right | Full-width mobile | → .../jobs/new | Orange |
| **Status Tabs** | Filter by status | Below header | Horizontal scroll | - | - |
| ↳ ทั้งหมด | All | - | - | Filter | Count badge |
| ↳ กำลังเปิดรับ | Active | - | - | Filter | Count badge |
| ↳ ร่าง | Draft | - | - | Filter | Count badge |
| ↳ หยุดชั่วคราว | Paused | - | - | Filter | Count badge |
| ↳ ปิดแล้ว | Closed | - | - | Filter | Count badge |
| **Job Table** | Job list | Main | Card list mobile | - | - |
| ↳ Bulk Select | Checkbox all | Left | Hidden mobile | Select all | - |
| ↳ Bulk Actions | If selected | Top | - | Bulk action | Pause, Close, Delete |
| ↳ Table Header | Column labels | - | Hidden mobile | - | Sortable |
| ↳↳ Checkbox | Select | - | - | Toggle select | - |
| ↳↳ Title | ตำแหน่ง | - | - | Sort | Sortable |
| ↳↳ Department | แผนก | - | - | - | - |
| ↳↳ Applications | ใบสมัคร | - | - | Sort | Sortable |
| ↳↳ Views | ผู้เข้าชม | - | - | Sort | Sortable |
| ↳↳ Posted | วันที่ลง | - | - | Sort | Sortable |
| ↳↳ Status | สถานะ | - | - | - | - |
| ↳↳ Actions | - | - | - | - | - |
| ↳ Job Row | Single job | - | - | - | - |
| ↳↳ Checkbox | Select | - | - | Toggle select | - |
| ↳↳ Title | Job title | - | - | → .../jobs/[id] | Link to detail |
| ↳↳ Department | Department name | - | - | - | - |
| ↳↳ App Count | Number | - | - | - | Badge if unread |
| ↳↳ View Count | Number | - | - | - | - |
| ↳↳ Posted Date | Thai date | - | - | - | - |
| ↳↳ Status Badge | Status | - | - | - | Color-coded |
| ↳↳ Action Menu | ⋮ dropdown | Right | - | Opens menu | - |
| ↳↳↳ View | ดู | - | - | → .../jobs/[id] | - |
| ↳↳↳ Edit | แก้ไข | - | - | → .../jobs/[id]?mode=edit | - |
| ↳↳↳ Pause/Resume | หยุดชั่วคราว | - | - | Toggle status | Toggle |
| ↳↳↳ Close | ปิดรับสมัคร | - | - | Close job | - |
| ↳↳↳ Duplicate | คัดลอก | - | - | Duplicate job | - |
| ↳↳↳ Delete | ลบ | - | - | Confirm + delete | Red |
| **Pagination** | Page navigation | Bottom | - | Navigate | - |

### Empty States

| State | Display | CTA |
|-------|---------|-----|
| No jobs | "ยังไม่มีประกาศงาน" | → .../jobs/new "ลงประกาศงานแรก" |
| Filter no results | "ไม่มีงานในสถานะนี้" | Reset filter |

### Exception Components

| Exception | Display |
|-----------|---------|
| Bulk action partial fail | Toast "ดำเนินการสำเร็จ X/Y รายการ" |
| Delete with applications | Confirm modal "งานนี้มี XX ใบสมัคร" |
| Duplicate failed | Toast + retry |

---

## 6.4 `/companies/[id]/dashboard/jobs/new` - Create Job

**Shell:** Company Shell  
**Purpose:** 4-step job creation wizard

### Layout

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Wizard Header** | Progress | Top | - | - | - |
| ↳ Step Indicator | 1-4 progress | - | - | - | - |
| ↳ Step Title | Current step name | - | - | - | - |
| ↳ Auto-save Status | Save indicator | Right | - | - | "บันทึกร่างแล้ว" |
| **Step Content** | Current step | Main | - | - | - |
| **Navigation** | Step controls | Bottom, sticky | - | - | - |
| ↳ Back Button | "ย้อนกลับ" | Left | - | Previous step | Hidden on step 1 |
| ↳ Save Draft | "บันทึกร่าง" | Center | - | Save draft | - |
| ↳ Next Button | "ถัดไป" | Right | - | Next step | - |

### Step 1: Basic Info (`?step=basic`)

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Step Title** | "ข้อมูลเบื้องต้น" | Top | - | - | - |
| ↳ Job Title | ตำแหน่งงาน | Full-width | - | - | Required |
| ↳ Department | แผนก | Full-width | - | Opens dropdown | Dropdown or input |
| ↳ Job Type | ประเภทงาน | Full-width | - | Opens dropdown | - |
| ↳↳ Options | Full-time/Part-time/Contract/Internship | - | - | - | - |
| ↳ Level | ระดับตำแหน่ง | Full-width | - | Opens dropdown | - |
| ↳↳ Options | Entry/Junior/Mid/Senior/Lead/Manager | - | - | - | - |
| ↳ Salary Section | เงินเดือน | - | - | - | - |
| ↳↳ Show Salary Toggle | แสดงเงินเดือน | - | - | Toggle | - |
| ↳↳ Salary Min | ขั้นต่ำ | Left | - | - | If toggle on |
| ↳↳ Salary Max | สูงสุด | Right | - | - | If toggle on |
| ↳↳ Negotiable | ตามตกลง | - | - | - | If toggle off |
| ↳ Positions Count | จำนวนที่รับ | Full-width | - | - | Number input |

### Step 2: Details (`?step=details`)

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Step Title** | "รายละเอียดงาน" | Top | - | - | - |
| ↳ Description | รายละเอียดงาน | Full-width | - | - | Rich editor |
| ↳↳ Editor Toolbar | Formatting | Top | - | Format text | Bold, list, etc. |
| ↳↳ Character Count | Minimum check | Bottom | - | - | Min 50 chars |
| ↳ Responsibilities | หน้าที่รับผิดชอบ | Full-width | - | - | - |
| ↳↳ Bullet List | Add items | - | - | Add item | + Add button |
| ↳ Requirements | คุณสมบัติ | Full-width | - | - | - |
| ↳↳ Bullet List | Add items | - | - | Add item | + Add button |
| ↳ Skills | ทักษะที่ต้องการ | Full-width | - | - | Required min 1 |
| ↳↳ Tag Input | Autocomplete | - | - | Add skill | From master data |
| ↳↳ Selected Tags | Chips | - | - | Remove skill | × to remove |
| ↳ Benefits | สิ่งที่จะได้รับ | Full-width | - | - | - |
| ↳↳ Tag Input | Benefits tags | - | - | Add benefit | Common benefits |

### Step 3: Location (`?step=location`)

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Step Title** | "สถานที่ทำงาน" | Top | - | - | - |
| ↳ Work Mode | รูปแบบการทำงาน | - | - | - | - |
| ↳↳ Radio Group | Options | - | - | - | - |
| ↳↳↳ On-site | ทำงานที่ออฟฟิศ | - | - | Select | - |
| ↳↳↳ Hybrid | ผสมผสาน | - | - | Select | Shows % slider |
| ↳↳↳ Remote | ทำงานทางไกล | - | - | Select | - |
| ↳ Office Location | ที่ตั้งสำนักงาน | - | - | - | If On-site/Hybrid |
| ↳↳ Province | จังหวัด | Dropdown | - | Select | - |
| ↳↳ District | อำเภอ/เขต | Dropdown | - | Select | - |
| ↳↳ Address | ที่อยู่ละเอียด | Textarea | - | - | Optional |
| ↳ Near Station | ใกล้สถานี | Full-width | - | - | Optional |
| ↳↳ Autocomplete | BTS/MRT stations | - | - | Select | From master data |
| ↳ Remote Percentage | If Hybrid | - | - | Set percentage | Slider 0-100% |

### Step 4: Review & Publish (`?step=publish`)

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Step Title** | "ตรวจสอบและเผยแพร่" | Top | - | - | - |
| **Preview Card** | Full job preview | Main | - | - | Read-only |
| ↳ Job Header | Title, type, salary | - | - | - | - |
| ↳ Description | Full details | - | - | - | - |
| ↳ Requirements | Listed | - | - | - | - |
| ↳ Location | Work details | - | - | - | - |
| **Validation Checklist** | Ready check | Below preview | - | - | - |
| ↳ Required Fields | ✓/✗ status | - | - | - | All must be ✓ |
| **Publish Options** | When to publish | Bottom | - | - | - |
| ↳ Publish Now | เผยแพร่ทันที | - | - | Select | Radio |
| ↳ Schedule | ตั้งเวลา | - | - | Select | Radio + datetime picker |
| ↳ Save Draft | บันทึกเป็นร่าง | - | - | Select | Radio |
| **Publish Button** | "เผยแพร่" / "บันทึก" | Bottom, full-width | - | Publish/Save | Based on selection |

### Exception Components

| Exception | Display |
|-----------|---------|
| Draft auto-save failed | Warning banner |
| Required field empty | Inline error + block next |
| Description too short | "ต้องมีอย่างน้อย 50 ตัวอักษร" |
| Salary min > max | "เงินเดือนขั้นต่ำต้องน้อยกว่าสูงสุด" |
| No skills | "เพิ่มทักษะอย่างน้อย 1 รายการ" |
| Publish failed | Toast + retry |
| Schedule in past | "เลือกเวลาในอนาคต" |
| Job limit reached | Block + upsell message |
| Browser back unsaved | Confirm modal |
| Duplicate title | Warning (non-blocking) |

---

## 6.5 `/companies/[id]/dashboard/jobs/[jobId]` - Job Detail/Edit

**Shell:** Company Shell  
**Purpose:** View, edit, manage individual job

### View Mode (`?mode=view` or default)

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Job Header** | Overview | Top | Stack mobile | - | - |
| ↳ Back Link | "← กลับไปประกาศงาน" | Top-left | - | → .../jobs | - |
| ↳ Job Title | Title | Left | - | - | - |
| ↳ Status Badge | Current status | - | - | - | - |
| ↳ Posted Date | "ลงประกาศ DD MMM" | - | - | - | - |
| ↳ Action Buttons | Controls | Right | Full-width mobile | - | - |
| ↳↳ Edit Button | "แก้ไข" | - | - | → ?mode=edit | - |
| ↳↳ Pause/Resume | Toggle status | - | - | Toggle | - |
| ↳↳ Close Button | "ปิดรับสมัคร" | - | - | Confirm + close | - |
| ↳↳ More Menu | ⋮ | - | - | Opens menu | Duplicate, Delete |
| **Performance Section** | Metrics | Below header | - | - | - |
| ↳ Stat Cards | 3 cards | 3 cols | Stack mobile | - | - |
| ↳↳ Views | ผู้เข้าชม | - | - | - | Count + trend |
| ↳↳ Applications | ใบสมัคร | - | - | - | Count + new |
| ↳↳ Conversion | อัตราการสมัคร | - | - | - | Percentage |
| ↳ Daily Chart | Views/Apps over time | Below cards | - | - | 30 days |
| **Job Content** | Details (read-only) | Below performance | - | - | - |
| ↳ Same as job detail | - | - | - | - | - |
| **Recent Applications** | For this job | Bottom | - | - | - |
| ↳ Section Title | "ใบสมัครสำหรับตำแหน่งนี้" | - | - | - | - |
| ↳ View All Link | "ดูทั้งหมด" | - | - | → .../applications?job=[id] | - |
| ↳ Application List | Recent 5 | - | - | → detail | - |

### Edit Mode (`?mode=edit`)

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Edit Header** | Edit controls | Top | - | - | - |
| ↳ Back Link | "← ยกเลิก" | Left | - | Confirm + back | Confirm if unsaved |
| ↳ Title | "แก้ไขประกาศงาน" | Center | - | - | - |
| ↳ Save Button | "บันทึก" | Right | - | Save changes | - |
| **Edit Form** | Same as creation | Main | - | - | Pre-filled |
| ↳ All fields from steps 1-3 | - | - | - | - | - |
| **Change Summary** | What changed | Sidebar | Bottom mobile | - | - |
| ↳ Changed Fields | List | - | - | - | Highlight |

### Publish Mode (`?mode=publish`) - For Drafts

| Component | Purpose | Position | Action |
|-----------|---------|----------|--------|
| Same as Step 4 of creation | - | - | - |
| Publish Button | "เผยแพร่" | Bottom | Publish |

### Exception Components

| Exception | Display | Action |
|-----------|---------|--------|
| Job not found | 404 | → job list |
| Wrong company | 403 redirect | → own jobs |
| Edit closed job | Warning + "ต้องการเปิดใหม่?" | Reopen option |
| View mode no metrics | "ยังไม่มีข้อมูล" | - |

---

## 6.6 `/companies/[id]/dashboard/applications` - Application Inbox

**Shell:** Company Shell  
**Purpose:** Central inbox for reviewing applications (3-panel layout)

### Desktop Layout (Three-Panel)

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Filter Panel** | Filters | Left, 250px | Bottom sheet mobile | - | Collapsible |
| ↳ Job Filter | By job | - | - | Filter | Dropdown |
| ↳ Status Filter | By status | - | - | Filter | Checkboxes |
| ↳ Date Range | Date filter | - | - | Filter | Picker |
| ↳ Match Score | Score range | - | - | Filter | Slider |
| ↳ Apply Button | "กรอง" | - | - | Apply filters | - |
| ↳ Clear Button | "ล้างตัวกรอง" | - | - | Clear filters | - |
| **List Panel** | Application list | Center, 350px | Full-width mobile | - | - |
| ↳ List Header | Count + sort | Top | - | - | - |
| ↳↳ Count | "XX ใบสมัคร" | Left | - | - | - |
| ↳↳ Sort | Dropdown | Right | - | Sort | ใหม่สุด, คะแนนสูงสุด |
| ↳ Application List | Cards | - | - | - | Scrollable |
| ↳↳ Application Card | Single app | - | - | Select | Clickable |
| ↳↳↳ Candidate Photo | Avatar | Left | - | - | - |
| ↳↳↳ Candidate Name | Name | - | - | - | - |
| ↳↳↳ Position | Job applied | - | - | - | - |
| ↳↳↳ Match Score | Badge | Top-right | - | - | Color-coded |
| ↳↳↳ Applied Date | Relative | - | - | - | - |
| ↳↳↳ Status Dot | Indicator | Bottom | - | - | - |
| ↳↳↳ Unread Badge | New | - | - | - | If not viewed |
| **Detail Panel** | Selected candidate | Right, flex | Full-screen mobile | - | - |
| ↳ Candidate Header | Overview | Top | - | - | - |
| ↳↳ Photo | Large avatar | Left | - | - | - |
| ↳↳ Name | Full name | - | - | - | - |
| ↳↳ Headline | Bio | - | - | - | - |
| ↳↳ Contact Info | Email, phone | - | - | - | If accepted |
| ↳ Match Breakdown | Score details | - | - | - | - |
| ↳↳ Total Score | Badge | - | - | - | - |
| ↳↳ Skill Match | % | - | - | - | - |
| ↳↳ Experience Match | % | - | - | - | - |
| ↳↳ Education Match | % | - | - | - | - |
| ↳ Profile Summary | Key info | - | - | - | - |
| ↳↳ Experience | Work history | - | - | - | - |
| ↳↳ Education | Education | - | - | - | - |
| ↳↳ Skills | Skill tags | - | - | - | - |
| ↳ Resume Section | Uploaded CV | - | - | - | - |
| ↳↳ View Button | Open PDF | - | - | Open PDF | - |
| ↳↳ Download Button | Download | - | - | Download | - |
| ↳ Internal Notes | HR-only notes | - | - | - | - |
| ↳↳ Note List | Previous notes | - | - | - | - |
| ↳↳ Add Note | Textarea | - | - | Add note | - |
| ↳ Action Bar | Decisions | Bottom, sticky | - | - | - |
| ↳↳ Accept Button | "ตอบรับ" | Left | - | Accept + open chat | Teal |
| ↳↳ Reject Button | "ปฏิเสธ" | Right | - | Reject + optional reason | Red |

### Mobile Layout

| Component | Purpose | Position | Action |
|-----------|---------|----------|--------|
| Filter Button | Open filters | Top-right | Opens bottom sheet |
| Application List | Full-screen | Main | - |
| Swipe Actions | Accept/Reject | On card | Accept/Reject |
| Tap → Detail | Full-screen detail | Overlay | View detail |

### Empty States

| State | Display | CTA |
|-------|---------|-----|
| No applications | "ยังไม่มีใบสมัคร" | "แชร์ลิงก์ประกาศงาน" |
| Filter no results | "ไม่มีใบสมัครในสถานะนี้" | "ล้างตัวกรอง" |
| High volume (100+) | "มีใบสมัครมาก ใช้ตัวกรองเพื่อจำกัด" | - |

### Exception Components

| Exception | Display |
|-----------|---------|
| Candidate hidden profile | "ผู้สมัครซ่อนข้อมูลบางส่วน" |
| Candidate deleted | Gray card "ผู้สมัครลบบัญชีแล้ว" |
| Accept failed | Toast + retry |
| Reject failed | Toast + retry |
| Already processed | Toast "ดำเนินการแล้ว" |
| Match score unavailable | Show "N/A" |
| Resume download failed | Toast error |
| Bulk action limit (50) | "เลือกได้สูงสุด 50 รายการ" |

---

## 6.7 `/companies/[id]/dashboard/team` - Team Management

**Shell:** Company Shell  
**Purpose:** Manage team members, roles, invitations

### Layout

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Page Header** | Title | Top | - | - | "ทีมงาน" |
| **Tab Navigation** | Section switcher | Below header | - | - | - |
| ↳ สมาชิก | Members tab | - | - | ?tab=members | - |
| ↳ เชิญสมาชิก | Invite tab | - | - | ?tab=invite | Admin+ only |
| **Tab Content** | Selected section | Main | - | - | - |

### Members Tab (`?tab=members`)

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Member Table** | Team list | Main | Card list mobile | - | - |
| ↳ Table Header | Columns | - | Hidden mobile | - | - |
| ↳↳ Name | ชื่อ | - | - | - | - |
| ↳↳ Email | อีเมล | - | - | - | - |
| ↳↳ Role | บทบาท | - | - | - | - |
| ↳↳ Status | สถานะ | - | - | - | - |
| ↳↳ Last Active | ใช้งานล่าสุด | - | - | - | - |
| ↳↳ Actions | - | - | - | - | - |
| ↳ Member Row | Single member | - | - | - | - |
| ↳↳ Avatar | Photo | - | - | - | - |
| ↳↳ Name | Full name | - | - | - | - |
| ↳↳ Email | Email | - | - | - | - |
| ↳↳ Role Badge | Role | - | - | - | Color-coded |
| ↳↳ Status | Active/Inactive | - | - | - | - |
| ↳↳ Last Active | Relative time | - | - | - | - |
| ↳↳ Action Menu | ⋮ | Right | - | Opens menu | Admin only |
| ↳↳↳ Edit Role | "เปลี่ยนบทบาท" | - | - | Opens role picker | - |
| ↳↳↳ Remove | "ลบออก" | - | - | Confirm + remove | Red |
| **Pending Invitations** | Sent invites | Below table | - | - | - |
| ↳ Section Title | "คำเชิญที่รอการตอบรับ" | - | - | - | - |
| ↳ Invitation List | Pending | - | - | - | - |
| ↳↳ Invite Row | Single invite | - | - | - | - |
| ↳↳↳ Email | Invitee email | - | - | - | - |
| ↳↳↳ Role | Assigned role | - | - | - | - |
| ↳↳↳ Sent Date | When sent | - | - | - | - |
| ↳↳↳ Resend | "ส่งอีกครั้ง" | - | - | Resend invite | - |
| ↳↳↳ Cancel | "ยกเลิก" | - | - | Cancel invite | - |

### Invite Tab (`?tab=invite`) - Admin Only

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Invite Form** | Send invitation | Main, max 500px | - | - | - |
| ↳ Email Input | Invitee email | Full-width | - | - | - |
| ↳ Role Selector | Assign role | Full-width | - | - | - |
| ↳↳ Options | - | - | - | - | - |
| ↳↳↳ Admin | แอดมิน | - | - | Select | Full access |
| ↳↳↳ HR Manager | ผู้จัดการ HR | - | - | Select | - |
| ↳↳↳ Recruiter | นักสรรหา | - | - | Select | - |
| ↳↳↳ Interviewer | ผู้สัมภาษณ์ | - | - | Select | Limited |
| ↳↳↳ Viewer | ผู้ดู | - | - | Select | Read-only |
| ↳ Permission Preview | What can do | Below selector | - | - | Matrix |
| ↳ Personal Message | Optional note | Textarea | - | - | - |
| ↳ Send Button | "ส่งคำเชิญ" | Full-width | - | Send invite | - |

### Role Permissions Matrix

| Permission | Admin | HR Manager | Recruiter | Interviewer | Viewer |
|------------|-------|------------|-----------|-------------|--------|
| Post jobs | ✓ | ✓ | ✓ | ✗ | ✗ |
| Edit jobs | ✓ | ✓ | ✓ | ✗ | ✗ |
| View applications | ✓ | ✓ | ✓ | Limited | ✓ |
| Accept/Reject | ✓ | ✓ | ✓ | ✗ | ✗ |
| Schedule interviews | ✓ | ✓ | ✓ | ✓ | ✗ |
| Manage team | ✓ | ✗ | ✗ | ✗ | ✗ |
| Company settings | ✓ | ✓ | ✗ | ✗ | ✗ |

### Exception Components

| Exception | Display |
|-----------|---------|
| Not admin | Hide invite tab, limit actions |
| Invite self | "ไม่สามารถเชิญตัวเอง" |
| Invite existing member | "เป็นสมาชิกอยู่แล้ว" |
| Invite already sent | "ส่งคำเชิญแล้ว [ส่งอีกครั้ง?]" |
| Remove self | "ไม่สามารถลบตัวเอง" |
| Remove last admin | "ต้องมี Admin อย่างน้อย 1 คน" |
| Invite limit | "ถึงขีดจำกัดสมาชิก" |
| Pending expired (7 days) | Badge "หมดอายุ" + resend option |

---

## 6.8 `/companies/[id]/dashboard/candidates` - Candidate Search

**Shell:** Company Shell  
**Purpose:** Proactive sourcing, search opt-in candidates

### Layout

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Page Header** | Title + search | Top | - | - | "ค้นหาผู้สมัคร" |
| ↳ Search Bar | Keywords | Center | Full-width mobile | Search | Skills, titles |
| **Two-Column Layout** | Filters + Results | Main | Stack mobile | - | - |
| **Filter Sidebar** | Search filters | Left, 280px | Bottom sheet mobile | - | - |
| ↳ Skills Section | ทักษะ | - | - | - | - |
| ↳↳ Multi-select | Skills tags | - | - | Select skills | Autocomplete |
| ↳ Experience Section | ประสบการณ์ | - | - | - | - |
| ↳↳ Range | Years | - | - | Set range | 0-10+ |
| ↳ Education Section | การศึกษา | - | - | - | - |
| ↳↳ Checkboxes | Levels | - | - | Filter | - |
| ↳ Location Section | สถานที่ | - | - | - | - |
| ↳↳ Province Multi-select | - | - | - | Select | - |
| ↳ Salary Section | เงินเดือนคาดหวัง | - | - | - | - |
| ↳↳ Range | Min-Max | - | - | Set range | - |
| ↳ Apply Button | "ค้นหา" | Bottom | - | Apply filters | - |
| **Results Area** | Candidate list | Right | Full-width mobile | - | - |
| ↳ Results Count | "พบ XX ผู้สมัคร" | Top | - | - | - |
| ↳ Candidate Grid | Cards | 2 cols | 1 col mobile | - | - |
| ↳↳ Candidate Card | Single candidate | - | - | - | - |
| ↳↳↳ Avatar | Photo | Top | - | - | Blur if not contacted |
| ↳↳↳ Name | Full name | - | - | - | Partial if not contacted |
| ↳↳↳ Headline | Title/Bio | - | - | - | - |
| ↳↳↳ Skills | Top skills | - | - | - | Tags |
| ↳↳↳ Experience | Years summary | - | - | - | - |
| ↳↳↳ Location | Province | - | - | - | - |
| ↳↳↳ Contact Badge | If already chatting | - | - | - | "ติดต่อแล้ว" |
| ↳↳↳ View Button | "ดูโปรไฟล์" | - | - | Opens modal | - |

### Candidate Detail Modal

| Component | Purpose | Position | Action |
|-----------|---------|----------|--------|
| Profile Header | Name, photo | Top | - |
| Full Profile | Same as candidate profile | Main | - |
| Action Bar | Contact options | Bottom | - |
| Send Job Offer | "ส่งข้อเสนองาน" | Primary button | Open job selection + chat |
| Close | × | Top-right | Close modal |

### Privacy Notes

- Only candidates with `is_searchable = true` appear
- Contact details hidden until chat initiated
- Partial name visible before contact
- Profile photos blurred for non-contacted

### Empty States

| State | Display | CTA |
|-------|---------|-----|
| Zero results | "ไม่พบผู้สมัครที่ตรงกับเงื่อนไข" | "ลองขยายการค้นหา" |
| No searchable candidates | Rare, system issue | - |

### Exception Components

| Exception | Display |
|-----------|---------|
| Candidate already contacted | Badge "ติดต่อแล้ว" + link to chat |
| Candidate unavailable | Badge "ไม่พร้อม" + gray contact |
| Contact limit reached | "ถึงขีดจำกัดรายวัน" |
| Profile incomplete | Warning badge "ข้อมูลไม่ครบ" |
| Search service down | Fallback with slower results |

---

## 6.9 `/companies/[id]/dashboard/settings` - Company Settings

**Shell:** Company Shell  
**Purpose:** Company profile, configuration, analytics

### Layout

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Page Header** | Title | Top | - | - | "การตั้งค่าบริษัท" |
| **Tab Navigation** | Sections | Below header | Dropdown mobile | - | - |
| ↳ โปรไฟล์บริษัท | Profile tab | - | - | ?tab=profile | - |
| ↳ การตั้งค่า | Config tab | - | - | ?tab=config | - |
| ↳ สถิติ | Analytics tab | - | - | ?tab=analytics | - |
| **Tab Content** | Selected section | Main | - | - | - |

### Profile Tab (`?tab=profile`)

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Logo Section** | Company logo | Top | - | - | - |
| ↳ Current Logo | Display | Left | Center | - | - |
| ↳ Upload Button | "เปลี่ยนโลโก้" | Right | - | Upload file | Max 5MB |
| **Cover Section** | Cover image | Below logo | - | - | - |
| ↳ Current Cover | Display | Full-width | - | - | 1200×300 recommended |
| ↳ Upload Button | "เปลี่ยนรูปปก" | - | - | Upload file | - |
| **Company Info** | Basic info | - | - | - | - |
| ↳ Thai Name | ชื่อบริษัท (ไทย) | Full-width | - | - | - |
| ↳ English Name | Company Name (English) | Full-width | - | - | - |
| ↳ Industry | ประเภทธุรกิจ | Dropdown | - | Select | - |
| ↳ Company Size | ขนาดบริษัท | Dropdown | - | Select | - |
| ↳ Founded Year | ปีที่ก่อตั้ง | Number | - | - | - |
| **Description** | เกี่ยวกับบริษัท | - | - | - | - |
| ↳ Rich Editor | Company description | Full-width | - | Edit | - |
| **Links** | External links | - | - | - | - |
| ↳ Website | เว็บไซต์ | Full-width | - | - | URL validation |
| ↳ Facebook | Facebook page | Full-width | - | - | - |
| ↳ LinkedIn | LinkedIn page | Full-width | - | - | - |
| **Locations** | Office addresses | - | - | - | - |
| ↳ Location List | Multiple offices | - | - | - | - |
| ↳↳ Add Location | + เพิ่มสถานที่ | - | - | Add location | - |
| **Gallery** | Office photos | - | - | - | - |
| ↳ Photo Grid | Uploaded photos | - | - | - | Max 10 |
| ↳ Upload Area | Add photos | - | - | Upload | - |
| **Save Button** | "บันทึก" | Bottom, sticky | - | Save changes | - |

### Config Tab (`?tab=config`)

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Default Job Settings** | Defaults | - | - | - | - |
| ↳ Section Title | "ค่าเริ่มต้นประกาศงาน" | - | - | - | - |
| ↳ Default Location | Province | Dropdown | - | Select | - |
| ↳ Default Job Type | Type | Dropdown | - | Select | - |
| ↳ Auto-close Days | Days until close | Number | - | - | - |
| **Notification Settings** | Alerts | - | - | - | - |
| ↳ Section Title | "การแจ้งเตือน" | - | - | - | - |
| ↳ New Application | Toggle | - | - | Toggle | - |
| ↳ Daily Summary | Toggle + time | - | - | Toggle + set time | - |
| ↳ Interview Reminders | Toggle + hours | - | - | Toggle + set hours | - |
| **Save Button** | "บันทึก" | Bottom | - | Save changes | - |

### Analytics Tab (`?tab=analytics`)

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Hiring Funnel** | Conversion | Top | - | - | - |
| ↳ Funnel Chart | Visual | - | - | - | - |
| ↳↳ Posted | Jobs posted | - | - | - | - |
| ↳↳ Views | Total views | - | - | - | - |
| ↳↳ Applications | Total apps | - | - | - | - |
| ↳↳ Interviews | Total interviews | - | - | - | - |
| ↳↳ Hires | Total hires | - | - | - | - |
| **Job Performance Table** | Per-job metrics | Below funnel | - | - | - |
| ↳ Columns | Job, Views, Apps, Conversion, Time-to-hire | - | - | - | - |
| **Source Attribution** | Where candidates come from | Below table | - | - | - |
| ↳ Pie Chart | Sources | - | - | - | - |
| **Date Range Selector** | Filter period | Top-right | - | Select range | - |

### Exception Components

| Exception | Display |
|-----------|---------|
| Logo upload failed | Toast + retry |
| Logo wrong format | "รองรับ JPG, PNG" |
| Logo too large | "ไฟล์ใหญ่เกิน 5MB" |
| Analytics unavailable | Hide tab or show error |
| Save failed | Toast + retry |
| URL invalid | "รูปแบบ URL ไม่ถูกต้อง" |

---

*End of Section 6: Company Routes*
