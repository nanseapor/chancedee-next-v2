# ChanceDee Layout Component Specification
## Section 5: Candidate Routes (5 routes)

**Version:** 2.0  
**Date:** December 2024

---

## 5.1 `/candidates/[id]` - Candidate Dashboard

**Shell:** Candidate Shell  
**Purpose:** Candidate home, activity overview and quick actions

### Layout

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Welcome Header** | Personalized greeting | Top | - | - | - |
| ↳ Greeting | "สวัสดี, [ชื่อ]" | Left | - | - | First name only |
| ↳ Date | Thai format date | Below greeting | - | - | - |
| **Profile Completion Card** | Encourage completion | Top, prominent | Full-width mobile | - | Hide if 100% |
| ↳ Completion Ring | Visual progress | Left | Top mobile | Opens checklist modal | Clickable |
| ↳ Percentage Text | "โปรไฟล์ของคุณสมบูรณ์ XX%" | Center | - | - | - |
| ↳ Missing Sections | What to complete | - | - | - | - |
| ↳↳ Missing Item | Section name + quick link | - | - | → section | Top 3 items |
| ↳ CTA Button | "ทำโปรไฟล์ให้สมบูรณ์" | Right | Full-width mobile | → profile?tab=onboarding | - |
| **Coin Balance** | Loyalty display | Top-right | Below welcome mobile | - | - |
| ↳ Coin Icon | 🪙 | Left | - | - | - |
| ↳ Balance | "XXX เหรียญ" | Center | - | - | - |
| ↳ Earn More Link | "รับเพิ่ม" | Right | - | Opens modal | Ways to earn |
| **Upcoming Appointments** | Interview schedule | Below completion | - | - | Hide if empty |
| ↳ Section Title | "การนัดหมายที่กำลังจะถึง" | Left | - | - | - |
| ↳ View All Link | "ดูทั้งหมด" | Right | - | → /chat | - |
| ↳ Appointment Card | Next interview | Full-width | - | - | - |
| ↳↳ Date Badge | Day + Month | Left | - | - | Thai format |
| ↳↳ Time | Time slot | - | - | - | - |
| ↳↳ Company | Company name | - | - | - | - |
| ↳↳ Position | Job title | - | - | - | Truncate |
| ↳↳ Type Icon | Video/Phone/In-person | Right | - | - | - |
| ↳↳ Status | Confirmed/Pending | Right | - | - | Badge |
| ↳↳ Actions | View, Message | Right | - | → /chat | - |
| **Application Summary** | Status overview | Below appointments | - | - | - |
| ↳ Section Title | "สรุปการสมัครงาน" | Left | - | - | - |
| ↳ Stat Cards | 4 status cards | 4 cols | 2×2 mobile | - | - |
| ↳↳ Applied Card | สมัครแล้ว | - | - | → .../applications?status=applied | Blue, count |
| ↳↳ Reviewing Card | กำลังพิจารณา | - | - | → .../applications?status=reviewing | Yellow, count |
| ↳↳ Interview Card | นัดสัมภาษณ์ | - | - | → .../applications?status=interviewing | Teal, count |
| ↳↳ Offers Card | ได้รับข้อเสนอ | - | - | → .../applications?status=offers | Orange, count |
| **Recent Applications** | Application list | Below stats | - | - | - |
| ↳ Section Title | "ใบสมัครล่าสุด" | Left | - | - | - |
| ↳ View All Link | "ดูทั้งหมด" | Right | - | → .../applications | - |
| ↳ Application List | Last 5 | - | - | - | - |
| ↳↳ Application Row | Single application | - | - | → .../applications | - |
| ↳↳↳ Company Logo | 40×40 | Left | - | - | - |
| ↳↳↳ Company Name | Employer | - | - | - | - |
| ↳↳↳ Position | Job title | - | - | - | - |
| ↳↳↳ Applied Date | Relative time | - | - | - | - |
| ↳↳↳ Status Badge | Current status | Right | - | - | Color-coded |
| ↳↳↳ Next Action | If any | Right | - | - | E.g., interview date |
| **Recommended Jobs** | Job suggestions | Below applications | - | - | - |
| ↳ Section Title | "งานที่แนะนำสำหรับคุณ" | Left | - | - | - |
| ↳ View All Link | "ดูทั้งหมด" | Right | - | → /jobs | - |
| ↳ Job Cards | 3-4 cards | Horizontal scroll | Stack mobile | - | - |
| ↳↳ Job Card | Single job | - | - | → /jobs/[id] | With match score |
| ↳↳↳ Match Badge | Compatibility % | Top-right | - | - | Teal if >70% |

### Empty States

| State | Display | CTA |
|-------|---------|-----|
| No applications | Illustration + "คุณยังไม่ได้สมัครงาน" | → /jobs "ค้นหางาน" |
| No appointments | "ยังไม่มีการนัดหมาย" | Hide section |
| No recommendations | "กรอกข้อมูลเพิ่มเพื่อรับงานแนะนำ" | → profile "ไปที่โปรไฟล์" |
| Profile at 0% | Redirect to onboarding | → profile?tab=onboarding |

### Exception Components

- Recommendation service down: Hide section gracefully
- Not owner (wrong candidate ID): Redirect to own dashboard

---

## 5.2 `/candidates/[id]/profile` - Unified Profile Editor

**Shell:** Candidate Shell  
**Purpose:** Single page for all profile editing with tabs

### Main Layout

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Profile Header** | Overview | Top | Stack mobile | - | - |
| ↳ Avatar Section | Photo display | Left | Center mobile | - | - |
| ↳↳ Avatar Image | Profile photo | 120×120 | 80×80 mobile | - | Initials fallback |
| ↳↳ Edit Overlay | Change photo | On hover | - | Opens upload | Camera icon |
| ↳ Name Display | User name | Center | Below avatar mobile | - | - |
| ↳↳ Thai Name | ชื่อ-นามสกุล | - | - | - | - |
| ↳↳ English Name | Name in English | - | - | - | Smaller text |
| ↳↳ Headline | Brief bio | - | - | - | Optional |
| ↳ Completion Ring | Progress | Right | Below name mobile | Opens checklist modal | Percentage |
| **Auto-Save Indicator** | Save status | Top-right, sticky | Same | - | - |
| ↳ Status Text | Saving/Saved/Failed | - | - | - | - |
| ↳ Time | Last saved | - | - | - | "บันทึกล่าสุด XX:XX" |
| **Tab Navigation** | Section switcher | Below header | Horizontal scroll | - | - |
| ↳ Personal Tab | ข้อมูลส่วนตัว | - | - | ?tab=personal | - |
| ↳ Preferences Tab | ความต้องการ | - | - | ?tab=preferences | - |
| ↳ Resume Tab | ประวัติ | - | - | ?tab=resume | - |
| ↳ Preview Tab | ดูตัวอย่าง | - | - | ?tab=preview | - |
| ↳ Onboarding Tab | เริ่มต้น | - | - | ?tab=onboarding | Hidden when complete |
| **Tab Content** | Selected section | Main | - | - | - |

### Personal Tab (`?tab=personal`)

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Photo Section** | Avatar management | Top | - | - | - |
| ↳ Current Photo | Display | Left | Center | - | - |
| ↳ Upload Button | "เปลี่ยนรูป" | Right | Below photo | Opens file picker | Max 5MB |
| ↳ Remove Button | "ลบรูป" | Right | - | Remove photo | If has photo |
| **Thai Name Fields** | ชื่อ-นามสกุล (ไทย) | 2 cols | Stack mobile | - | Required |
| ↳ First Name | ชื่อ | Left | - | - | - |
| ↳ Last Name | นามสกุล | Right | - | - | - |
| **English Name Fields** | Name (English) | 2 cols | Stack mobile | - | Optional |
| ↳ First Name | First Name | Left | - | - | - |
| ↳ Last Name | Last Name | Right | - | - | - |
| **Email Field** | อีเมล | Full-width | - | - | Read-only if verified |
| **Phone Field** | เบอร์โทรศัพท์ | Full-width | - | - | Thai format |
| **Birth Date** | วันเกิด | Full-width | - | Opens date picker | Must be 18+ |
| ↳ Date Picker | DD/MM/YYYY | - | - | Select date | Thai Buddhist year |
| **Address Section** | ที่อยู่ | - | - | - | - |
| ↳ Province | จังหวัด | Dropdown | - | Opens dropdown | From master data |
| ↳ District | อำเภอ/เขต | Dropdown | - | Opens dropdown | Dependent on province |
| ↳ Sub-district | ตำบล/แขวง | Dropdown | - | Opens dropdown | Dependent on district |
| **About Section** | เกี่ยวกับฉัน | Full-width | - | - | - |
| ↳ Textarea | Bio text | - | - | - | 500 char limit |
| ↳ Character Count | Remaining | Bottom-right | - | - | - |

### Preferences Tab (`?tab=preferences`)

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Job Type Section** | ประเภทงานที่ต้องการ | - | - | - | - |
| ↳ Checkbox Group | Job types | 2 cols | 1 col mobile | - | - |
| ↳↳ Full-time | งานประจำ | - | - | Toggle | - |
| ↳↳ Part-time | งานพาร์ทไทม์ | - | - | Toggle | - |
| ↳↳ Contract | สัญญาจ้าง | - | - | Toggle | - |
| ↳↳ Internship | ฝึกงาน | - | - | Toggle | - |
| **Positions Section** | ตำแหน่งที่สนใจ | Full-width | - | - | - |
| ↳ Tag Input | Autocomplete | - | - | Add tag | From master data |
| ↳ Selected Tags | Chips | - | - | Remove tag | × to remove |
| **Industries Section** | อุตสาหกรรมที่สนใจ | Full-width | - | - | - |
| ↳ Multi-select | Dropdown | - | - | Select multiple | From master data |
| **Salary Section** | เงินเดือนที่คาดหวัง | - | - | - | - |
| ↳ Min Input | ขั้นต่ำ | Left | - | - | Thai Baht |
| ↳ Max Input | สูงสุด | Right | - | - | Thai Baht |
| **Location Section** | สถานที่ทำงาน | Full-width | - | - | - |
| ↳ Province Multi-select | จังหวัด | - | - | Select multiple | Multiple allowed |
| **Work Mode Section** | รูปแบบการทำงาน | - | - | - | - |
| ↳ Radio Group | Options | - | - | - | - |
| ↳↳ On-site | ทำงานที่ออฟฟิศ | - | - | Select | - |
| ↳↳ Hybrid | ผสมผสาน | - | - | Select | - |
| ↳↳ Remote | ทำงานทางไกล | - | - | Select | - |
| ↳↳ Any | ได้ทั้งหมด | - | - | Select | - |
| **Availability Section** | พร้อมเริ่มงาน | - | - | - | - |
| ↳ Dropdown | Options | - | - | Select | - |
| ↳↳ Immediately | ทันที | - | - | - | - |
| ↳↳ 2 Weeks | 2 สัปดาห์ | - | - | - | - |
| ↳↳ 1 Month | 1 เดือน | - | - | - | - |
| ↳↳ 2 Months+ | 2 เดือนขึ้นไป | - | - | - | - |

### Resume Tab (`?tab=resume`)

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Experience Section** | ประสบการณ์ทำงาน | - | - | - | - |
| ↳ Section Title | "ประสบการณ์ทำงาน" | Left | - | - | - |
| ↳ Add Button | "+ เพิ่มประสบการณ์" | Right | - | Opens form | - |
| ↳ Experience List | Work history | - | - | - | Drag to reorder |
| ↳↳ Experience Card | Single entry | - | - | - | - |
| ↳↳↳ Company | Company name | Bold | - | - | - |
| ↳↳↳ Position | Job title | - | - | - | - |
| ↳↳↳ Duration | Start - End | - | - | - | "ปัจจุบัน" if current |
| ↳↳↳ Description | Job duties | - | - | - | Collapsible |
| ↳↳↳ Edit Button | Modify | Right | - | Opens edit form | Pencil icon |
| ↳↳↳ Delete Button | Remove | Right | - | Confirm + delete | Trash icon |
| **Education Section** | การศึกษา | - | - | - | - |
| ↳ Section Title | "การศึกษา" | Left | - | - | - |
| ↳ Add Button | "+ เพิ่มการศึกษา" | Right | - | Opens form | - |
| ↳ Education List | Education history | - | - | - | - |
| ↳↳ Education Card | Single entry | - | - | - | - |
| ↳↳↳ Institution | School name | Bold | - | - | - |
| ↳↳↳ Degree | ปริญญา/ประกาศนียบัตร | - | - | - | - |
| ↳↳↳ Field | สาขา | - | - | - | - |
| ↳↳↳ Year | Graduation year | - | - | - | - |
| ↳↳↳ GPA | Optional | - | - | - | - |
| **Skills Section** | ทักษะ | - | - | - | - |
| ↳ Section Title | "ทักษะ" | Left | - | - | - |
| ↳ Skill Input | Add skill | - | - | Add skill | Autocomplete |
| ↳ Skill Tags | Added skills | - | - | - | - |
| ↳↳ Skill Tag | Single skill | - | - | - | - |
| ↳↳↳ Name | Skill name | - | - | - | - |
| ↳↳↳ Proficiency | Level selector | - | - | Change level | เริ่มต้น/กลาง/เชี่ยวชาญ |
| ↳↳↳ Remove | × button | Right | - | Remove skill | - |
| **Languages Section** | ภาษา | - | - | - | - |
| ↳ Language List | Known languages | - | - | - | - |
| ↳↳ Language Row | Single language | - | - | - | - |
| ↳↳↳ Language | Language name | Left | - | Select | Dropdown |
| ↳↳↳ Proficiency | Level | Right | - | Select | Dropdown |
| **Certificates Section** | ใบรับรอง | - | - | - | - |
| ↳ Certificate List | Certifications | - | - | - | - |
| ↳↳ Certificate Card | Single cert | - | - | - | - |
| ↳↳↳ Name | Certificate name | Bold | - | - | - |
| ↳↳↳ Issuer | Issuing org | - | - | - | - |
| ↳↳↳ Date | Issue date | - | - | - | - |
| ↳↳↳ Link | Verification URL | - | - | ↗ External | Optional |
| **Resume Upload** | ไฟล์เรซูเม่ | - | - | - | - |
| ↳ Upload Area | Drop zone | - | - | Opens file picker | PDF/DOC, max 10MB |
| ↳ Current File | If uploaded | - | - | - | Name + download + delete |

### Preview Tab (`?tab=preview`)

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Preview Mode Banner** | Indicator | Top | - | - | - |
| ↳ Text | "นี่คือหน้าตาที่บริษัทจะเห็น" | - | - | - | - |
| ↳ Match Score | Simulated | Right | - | - | Mock score |
| **Profile Preview** | Read-only view | - | - | - | - |
| ↳ Same as public profile | - | - | - | - | - |
| **Action Bar** | Controls | Bottom, sticky | - | - | - |
| ↳ Print Button | "พิมพ์" | Left | - | Print page | - |
| ↳ Export Button | "ส่งออก PDF" | Right | - | Download PDF | - |

### Onboarding Tab (`?tab=onboarding`) - Mandatory for New Users

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Wizard Header** | Progress | Top | - | - | - |
| ↳ Step Indicator | 1-5 progress bar | - | - | - | - |
| ↳ Step Title | Current step name | - | - | - | - |
| **Step Content** | Current step | Main | - | - | - |
| **Navigation** | Step controls | Bottom, sticky | - | - | - |
| ↳ Back Button | "ย้อนกลับ" | Left | - | Previous step | Hidden on step 1 |
| ↳ Skip Button | "ข้ามขั้นตอนนี้" | Center | - | Skip step | Steps 3-5 only |
| ↳ Next Button | "ถัดไป" / "เสร็จสิ้น" | Right | - | Next step | - |

**5-Step Wizard:**

| Step | Title | Content | Skippable |
|------|-------|---------|-----------|
| 1 | ความต้องการงาน | Preferences form | No |
| 2 | ข้อมูลส่วนตัว | Personal info (MINIMUM) | No |
| 3 | การศึกษา | Education form | Yes |
| 4 | ประสบการณ์ | Work experience | Yes |
| 5 | ทักษะ | Skills and certs | Yes |

### Exception Components

| Exception | Display | Action |
|-----------|---------|--------|
| Session expired mid-form | Save draft + re-login modal | Re-login |
| Auto-save failed | Warning banner "บันทึกอัตโนมัติไม่สำเร็จ" | Retry |
| Photo upload failed | Toast "อัปโหลดรูปไม่สำเร็จ" | Retry |
| Photo too large | "รูปใหญ่เกิน 5MB" | - |
| Resume too large | "ไฟล์ใหญ่เกิน 10MB" | - |
| Duplicate skill | Toast "เพิ่มทักษะนี้แล้ว" | - |
| Max skills (50) | "เพิ่มได้สูงสุด 50 ทักษะ" | - |
| Max experience (20) | "เพิ่มได้สูงสุด 20 รายการ" | - |
| Tab switch unsaved | Confirm modal | Save or discard |
| Onboarding incomplete | Block modal if trying to leave before step 2 | Complete step 2 |

---

## 5.3 `/candidates/[id]/applications` - Application Tracking

**Shell:** Candidate Shell  
**Purpose:** Track all job applications with timeline

### Layout

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Page Header** | Title | Top | - | - | "ใบสมัครงานของฉัน" |
| **Status Tabs** | Filter by status | Below header | Horizontal scroll | - | - |
| ↳ ทั้งหมด | All applications | - | - | ?status=all | - |
| ↳ สมัครแล้ว | Applied | - | - | ?status=applied | - |
| ↳ กำลังพิจารณา | Under review | - | - | ?status=reviewing | - |
| ↳ นัดสัมภาษณ์ | Interviewing | - | - | ?status=interviewing | - |
| ↳ ได้รับข้อเสนอ | Offers | - | - | ?status=offers | - |
| ↳ ไม่ผ่าน | Rejected | - | - | ?status=rejected | - |
| **Results Count** | "XX ใบสมัคร" | Below tabs | - | - | - |
| **Application List** | Applications | Main | - | - | - |
| ↳ Application Card | Single application | Full-width | - | - | Expandable |
| ↳↳ Company Logo | 48×48 | Left | - | - | - |
| ↳↳ Company Name | Employer | - | - | → /companies/[id] | Link to company |
| ↳↳ Position | Job title | Bold | - | → /jobs/[id] | Link to job |
| ↳↳ Applied Date | "สมัครเมื่อ DD MMM" | - | - | - | - |
| ↳↳ Status Badge | Current status | Right | - | - | Color-coded |
| ↳↳ Next Action | If applicable | Right | - | - | E.g., interview date |
| ↳↳ Expand Arrow | Toggle timeline | Right | - | Toggle expand | ▼ |

### Expanded Application Detail

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Timeline** | Application progress | Expanded area | - | - | - |
| ↳ Timeline Items | Status changes | Vertical | - | - | - |
| ↳↳ Applied | ✓ สมัครงานแล้ว | - | - | - | Date + time |
| ↳↳ Viewed | ✓ บริษัทดูใบสมัคร | - | - | - | If applicable |
| ↳↳ Accepted | ✓ ตอบรับ | - | - | - | If applicable |
| ↳↳ Interview | ○ นัดสัมภาษณ์ | - | - | - | Link to calendar |
| **Action Buttons** | Actions | Bottom | - | - | - |
| ↳ View Job | "ดูประกาศงาน" | - | - | → /jobs/[id] | - |
| ↳ Message | "ส่งข้อความ" | - | - | → /chat | If chat open |
| ↳ Withdraw | "ถอนใบสมัคร" | - | - | Confirm modal | - |

### Empty States

| State | Display | CTA |
|-------|---------|-----|
| No applications | "คุณยังไม่ได้สมัครงาน" | → /jobs "ค้นหางาน" |
| No results in filter | "ไม่มีใบสมัครในสถานะนี้" | Suggest other tabs |

### Exception Components

| Exception | Display | Action |
|-----------|---------|--------|
| Application not found | Redirect + toast error | - |
| Withdraw failed | Toast "ถอนใบสมัครไม่สำเร็จ" | Retry |
| Job deleted | Show limited info "ประกาศงานถูกลบแล้ว" | - |
| Company suspended | Hide company link | - |
| Timeline load failed | Retry button | Retry |

---

## 5.4 `/candidates/[id]/saved` - Saved Items

**Shell:** Candidate Shell  
**Purpose:** Manage saved jobs, searches, and alerts

### Layout

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Page Header** | Title | Top | - | - | "รายการที่บันทึก" |
| **Tab Navigation** | Section switcher | Below header | - | - | - |
| ↳ งานที่บันทึก | Saved jobs | - | - | ?tab=jobs | - |
| ↳ การค้นหาที่บันทึก | Saved searches | - | - | ?tab=searches | - |
| ↳ การแจ้งเตือนงาน | Job alerts | - | - | ?tab=alerts | - |
| **Tab Content** | Selected section | Main | - | - | - |

### Saved Jobs Tab (`?tab=jobs`)

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **View Toggle** | Grid/List switch | Top-right | - | Toggle view | - |
| **Job List** | Saved jobs | Main | 2 cols grid | - | 1 col mobile |
| ↳ Job Card | Single job | - | - | → /jobs/[id] | Same as /jobs |
| ↳↳ Saved Date | "บันทึกเมื่อ XX" | Below salary | - | - | - |
| ↳↳ Job Status | If closed | - | - | - | "ปิดแล้ว" badge |
| ↳↳ Apply Button | Apply | - | - | Opens apply flow | Or "สมัครแล้ว" |
| ↳↳ Remove Button | Unsave | - | - | Remove from saved | Heart filled → outline |
| ↳↳ Share Button | Share job | - | - | Opens share | - |

### Saved Searches Tab (`?tab=searches`)

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Search List** | Saved searches | Main | - | - | - |
| ↳ Search Card | Single search | Full-width | - | - | - |
| ↳↳ Search Name | Label/Auto name | Bold | - | - | - |
| ↳↳ Filters Summary | Applied filters | - | - | - | Tags |
| ↳↳ Last Run | "ค้นหาล่าสุด XX" | - | - | - | - |
| ↳↳ Results Count | "พบ XX งาน" | - | - | - | Current count |
| ↳↳ Run Button | "ค้นหา" | Right | - | → /jobs with filters | - |
| ↳↳ Delete Button | Remove | Right | - | Delete search | Trash icon |

### Job Alerts Tab (`?tab=alerts`)

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Create Alert Button** | "+ สร้างการแจ้งเตือน" | Top-right | - | Opens create form | Max 10 |
| **Alert List** | Active alerts | Main | - | - | - |
| ↳ Alert Card | Single alert | Full-width | - | - | - |
| ↳↳ Criteria Summary | Filter criteria | - | - | - | - |
| ↳↳ Frequency | ทันที/รายวัน/รายสัปดาห์ | - | - | - | - |
| ↳↳ Active Toggle | On/Off | Right | - | Toggle active | - |
| ↳↳ Edit Button | Modify | Right | - | Opens edit form | Pencil icon |
| ↳↳ Delete Button | Remove | Right | - | Delete alert | Trash icon |

### Empty States

| Tab | Empty Message | CTA |
|-----|---------------|-----|
| Jobs | "ยังไม่มีงานที่บันทึก" | → /jobs "ค้นหางาน" |
| Searches | "บันทึกการค้นหาจากหน้าค้นหางาน" | → /jobs "ไปค้นหางาน" |
| Alerts | "ยังไม่มีการแจ้งเตือน" | "สร้างการแจ้งเตือน" |

### Exception Components

| Exception | Display | Action |
|-----------|---------|--------|
| Saved job closed | Badge "ปิดแล้ว", gray card | - |
| Saved job deleted | Auto-remove from list | - |
| Alert limit (10) | "สร้างได้สูงสุด 10 รายการ" | - |
| Search criteria invalid | Warning "เงื่อนไขบางอย่างเปลี่ยนแปลง" | - |

---

## 5.5 `/candidates/[id]/settings` - Candidate Settings

**Shell:** Candidate Shell  
**Purpose:** Candidate-specific settings

### Layout

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Page Header** | Title | Top | - | - | "การตั้งค่า" |
| **Settings Sections** | Settings groups | Main | - | - | - |
| **Account Link** | To account settings | Top | - | - | - |
| ↳ Card | Link card | Full-width | - | - | - |
| ↳↳ Title | "การตั้งค่าบัญชี" | - | - | - | - |
| ↳↳ Description | "รหัสผ่าน, อีเมล, ความเป็นส่วนตัว" | - | - | - | - |
| ↳↳ Arrow | → | Right | - | → /auth/settings | - |
| **Profile Visibility** | Search settings | - | - | - | - |
| ↳ Section Title | "การมองเห็นโปรไฟล์" | - | - | - | - |
| ↳ Toggle Row | ค้นหาได้โดยบริษัท | Full-width | - | - | - |
| ↳↳ Label | "อนุญาตให้บริษัทค้นหาโปรไฟล์ของฉัน" | Left | - | - | - |
| ↳↳ Toggle | On/Off | Right | - | Toggle | - |
| ↳ Description | Explanation | - | - | - | Small text |
| **Application Preferences** | Default settings | - | - | - | - |
| ↳ Section Title | "การตั้งค่าการสมัคร" | - | - | - | - |
| ↳ Cover Letter Toggle | "แนบจดหมายสมัครงานอัตโนมัติ" | - | - | Toggle | - |
| ↳ Default Cover Letter | Textarea | - | - | - | If toggle on |
| **Notification Preferences** | Job notifications | - | - | - | - |
| ↳ Section Title | "การแจ้งเตือนงาน" | - | - | - | - |
| ↳ Email Recommendations | Toggle | - | - | Toggle | - |
| ↳ Push Notifications | Toggle | - | - | Toggle | If supported |

---

*End of Section 5: Candidate Routes*
