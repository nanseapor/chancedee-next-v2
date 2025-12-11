# ChanceDee Layout Component Specification
## Section 3: Public Routes (9 routes)

**Version:** 2.0  
**Date:** December 2024

---

## 3.1 `/` - Landing Page

**Shell:** Public Shell  
**Purpose:** First impression, drive job search or registration

### Main Layout

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Hero Section** | Value proposition | Top, full-width | Stack mobile | - | - |
| ↳ Background | Visual/Gradient | - | - | - | - |
| ↳ Headline | "หางานที่ใช่ เจอบริษัทที่ชอบ" | Center | Smaller mobile | - | - |
| ↳ Subheadline | Supporting text | Center | - | - | - |
| ↳ Search Box | Job search | Center | Full-width mobile | - | - |
| ↳↳ Location Dropdown | Province selector | Left | Full-width mobile | Opens dropdown | Bangkok first |
| ↳↳ Job Title Input | Keyword search | Center | Full-width mobile | - | Autocomplete |
| ↳↳ Search Button | Submit | Right | Full-width mobile | → /jobs?q=... | "ค้นหา" |
| ↳ Quick Filters | Preset searches | Below search | Horizontal scroll | - | - |
| ↳↳ งานใหม่วันนี้ | Today's jobs | - | - | → /jobs?posted=today | - |
| ↳↳ Remote | Remote jobs | - | - | → /jobs?remote=true | - |
| ↳↳ Full-time | Full-time filter | - | - | → /jobs?type=fulltime | - |
| **Featured Jobs** | Job highlights | Below hero | - | - | Hide if empty |
| ↳ Section Title | "งานแนะนำ" | Left | - | - | - |
| ↳ Job Cards Grid | 6-8 cards | 3 cols | 2 cols tablet, 1 mobile | - | - |
| ↳↳ Job Card | Single job | - | - | → /jobs/[id] | See Job Card pattern |
| ↳ View All Link | "ดูงานทั้งหมด" | Right | - | → /jobs | - |
| **Top Companies** | Company carousel | Below jobs | - | - | Hide if empty |
| ↳ Section Title | "บริษัทชั้นนำ" | Left | - | - | - |
| ↳ Company Carousel | Logo slider | - | Touch scroll mobile | - | Verified companies only |
| ↳↳ Company Logo | Clickable logo | - | - | → /companies/[id] | - |
| **How It Works** | Process steps | Below companies | Stack mobile | - | - |
| ↳ Section Title | "เริ่มต้นง่ายๆ" | Center | - | - | - |
| ↳ Step Cards | 3 steps | 3 cols | Stack mobile | - | - |
| ↳↳ Step 1 | สร้างโปรไฟล์ | - | - | - | Icon + text |
| ↳↳ Step 2 | ค้นหางานที่ใช่ | - | - | - | Icon + text |
| ↳↳ Step 3 | สมัครงานได้เลย | - | - | - | Icon + text |
| **For Employers CTA** | Company signup | Below steps | Stack mobile | - | - |
| ↳ Split Section | 2 columns | - | Stack mobile | - | - |
| ↳↳ Left Content | Value prop text | - | - | - | - |
| ↳↳ Right CTA | Register button | - | - | → /auth/register?role=company | - |

### Job Card Pattern (Reused)

| Component | Purpose | Position | Action | Notes/Edge Case |
|-----------|---------|----------|--------|-----------------|
| Company Logo | Branding | Top-left | → /companies/[id] | - |
| Job Title | Position name | Top, bold | → /jobs/[id] | - |
| Company Name | Employer | Below title | → /companies/[id] | - |
| Location Badge | Province/District | Left | - | - |
| Salary Range | Compensation | Right | - | - |
| Posted Date | Recency | Bottom-left | - | - |
| Save Button | Bookmark | Bottom-right | Toggle save | Heart icon |
| Apply Button | Quick apply | Bottom-right | Opens apply flow | - |

**Exception Components:**
- Featured jobs empty: Hide entire section
- Top companies empty: Hide entire section
- Search service down: Show slower search with fallback notice
- Slow load (>3s): Skeleton loaders

---

## 3.2 `/jobs` - Job Search & Listings

**Shell:** Public Shell (Candidate Shell if authenticated)  
**Purpose:** Primary job discovery

### Desktop Layout (Two-Column)

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Search Header** | Persistent search | Top, sticky | - | - | - |
| ↳ Search Input | Keyword input | Left | Full-width mobile | - | Pre-filled from query |
| ↳ Location Dropdown | Province filter | Center | - | Opens dropdown | - |
| ↳ Search Button | Submit | Right | - | Submit search | - |
| **Filter Sidebar** | Advanced filters | Left, 300px | Bottom sheet mobile | - | - |
| ↳ Filter Header | "ตัวกรอง" | Top | - | - | Clear all button |
| ↳ Active Filters | Selected filters | Top | - | Remove filter | Chips with × |
| ↳ Job Type Section | ประเภทงาน | - | - | - | Collapsible |
| ↳↳ Full-time | งานประจำ | - | - | Toggle filter | Checkbox |
| ↳↳ Part-time | งานพาร์ทไทม์ | - | - | Toggle filter | Checkbox |
| ↳↳ Contract | สัญญาจ้าง | - | - | Toggle filter | Checkbox |
| ↳↳ Internship | ฝึกงาน | - | - | Toggle filter | Checkbox |
| ↳ Salary Section | เงินเดือน | - | - | - | Collapsible |
| ↳↳ Salary Range Slider | Min-Max | - | - | Set range | Thai Baht format |
| ↳↳ Preset Ranges | Quick select | - | - | Set range | <15k, 15-30k, 30-50k, >50k |
| ↳ Location Section | สถานที่ | - | - | - | Collapsible |
| ↳↳ Province Multi-select | จังหวัด | - | - | Toggle selection | Bangkok first |
| ↳↳ BTS/MRT Autocomplete | ใกล้สถานี | - | - | Set station | Optional |
| ↳ Education Section | ระดับการศึกษา | - | - | - | Collapsible |
| ↳↳ Education Checkboxes | Levels | - | - | Toggle filter | ม.3 to PhD |
| ↳ Experience Section | ประสบการณ์ | - | - | - | Collapsible |
| ↳↳ Experience Range | ปีประสบการณ์ | - | - | Set range | 0-10+ years |
| ↳ Remote Section | การทำงานระยะไกล | - | - | - | Collapsible |
| ↳↳ Work Mode Radios | On-site/Hybrid/Remote | - | - | Select mode | - |
| **Results Area** | Job listings | Right | Full-width mobile | - | - |
| ↳ Results Header | Count + Sort | Top | - | - | - |
| ↳↳ Result Count | "พบ XX งาน" | Left | - | - | - |
| ↳↳ Sort Dropdown | Sort options | Right | - | Change sort | ใหม่สุด, เงินเดือน, ตรงที่สุด |
| ↳ Job List | Job cards | - | - | - | - |
| ↳↳ Job Card | Single job | Full-width | - | → /jobs/[id] | Clickable row |
| ↳ Pagination | Page navigation | Bottom | - | - | 20 per page |
| ↳↳ Page Numbers | 1, 2, 3... | Center | - | Go to page | - |
| ↳↳ Prev/Next | Navigation | - | - | Navigate | - |

### Mobile Layout

| Component | Purpose | Position | Action | Notes/Edge Case |
|-----------|---------|----------|--------|-----------------|
| **Mobile Search Header** | Compact search | Top, sticky | - | - |
| ↳ Search Input | Keyword | - | - | - |
| ↳ Filter Button | Open filters | Right | Opens bottom sheet | Badge for active count |
| **Filter Bottom Sheet** | Full filters | Bottom slide-up | - | - |
| ↳ Sheet Header | Title + close | Top | Close sheet | "ตัวกรอง" + × |
| ↳ Filter Content | Same as sidebar | - | - | - |
| ↳ Apply Button | "แสดงผลลัพธ์" | Bottom, sticky | Apply + close | Show count |
| **Job Cards** | Results | Stacked | - | Pull-to-refresh |

### Job List Card (Expanded Pattern)

| Component | Purpose | Position | Action | Notes/Edge Case |
|-----------|---------|----------|--------|-----------------|
| Company Logo | 48×48 | Left | → /companies/[id] | - |
| Job Title | Bold, link | Top | → /jobs/[id] | - |
| Company Name | Link to company | Below title | → /companies/[id] | - |
| Location | Province + District | Badge | - | - |
| Job Type | Full-time/Part-time | Badge | - | - |
| Salary Range | ฿XX,XXX - ฿XX,XXX | Prominent | - | - |
| Posted Date | Relative time | Bottom-left | - | - |
| Match Score | Compatibility % | Top-right | - | Only if logged in |
| Save Button | Heart toggle | Right | Toggle save | - |

**Exception Components:**

| Exception | Display | Action |
|-----------|---------|--------|
| Zero results | Empty state with suggestions | "ลบตัวกรอง [X] เพื่อดู N งาน" |
| Zero + text search | "ไม่พบงานที่ตรงกับ '[term]'" | Suggest related terms |
| Filter conflict | Warning badge on filter | Hint to remove |
| Search timeout | Loading → fallback | "กำลังค้นหานานกว่าปกติ..." |
| Save not logged in | Login prompt modal | "เข้าสู่ระบบเพื่อบันทึกงาน" |

---

## 3.3 `/jobs/[jobId]` - Job Detail

**Shell:** Public Shell (Candidate Shell if authenticated)  
**Purpose:** Decision point for job application

### Desktop Layout (Two-Column)

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Job Header Card** | Key info | Top, full-width | Stack mobile | - | - |
| ↳ Company Logo | Large, 80×80 | Left | Center mobile | → /companies/[id] | Clickable |
| ↳ Job Title | Position name | Center | - | - | - |
| ↳ Company Name | Employer link | Below title | - | → /companies/[id] | - |
| ↳ Info Badges | Key details | Row | Wrap mobile | - | - |
| ↳↳ Location Badge | Province, District | - | - | - | Map icon |
| ↳↳ Job Type Badge | Full-time/Part-time | - | - | - | - |
| ↳↳ Experience Badge | Years required | - | - | - | - |
| ↳ Salary Display | Compensation | Right | Below badges mobile | - | Prominent |
| ↳ Meta Info | Posted, Deadline | Bottom | - | - | Thai date format |
| **Main Content** | Job details | Left, 65% | Full-width mobile | - | - |
| ↳ Description Section | รายละเอียดงาน | - | - | - | Rich text |
| ↳ Responsibilities | หน้าที่รับผิดชอบ | - | - | - | Bullet list |
| ↳ Requirements | คุณสมบัติ | - | - | - | Bullet list |
| ↳ Benefits | สวัสดิการ | - | - | - | Tags or list |
| ↳ Additional Info | ข้อมูลเพิ่มเติม | - | - | - | Optional section |
| **Apply Sidebar** | Action panel | Right, 35%, sticky | Bottom fixed mobile | - | - |
| ↳ Salary Card | Compensation | Top | - | - | - |
| ↳↳ Range Display | ฿XX,XXX - ฿XX,XXX | - | - | - | Or "ตามตกลง" |
| ↳ Apply Button | Primary action | Full-width | - | Opens apply flow | "สมัครงาน" orange |
| ↳ Save Button | Bookmark | Full-width | - | Toggle save | "บันทึก" outline |
| ↳ Stats | Application count | - | - | - | "XX คนสมัครแล้ว" |
| ↳ Company Summary | Brief info | - | - | - | - |
| ↳↳ Logo | Small | Left | - | - | - |
| ↳↳ Name | Company name | - | - | - | - |
| ↳↳ Industry | Category | - | - | - | - |
| ↳↳ Size | Company size | - | - | - | - |
| ↳↳ View Profile | Link | - | - | → /companies/[id] | - |
| **Similar Jobs** | Recommendations | Below main | - | - | - |
| ↳ Section Title | "งานที่คล้ายกัน" | - | - | - | - |
| ↳ Job Cards | 3-4 cards | Horizontal scroll | - | → /jobs/[id] | - |

### State Variations

| State | Apply Sidebar Display | Action |
|-------|----------------------|--------|
| Not logged in | "เข้าสู่ระบบเพื่อสมัคร" button | Opens login modal |
| Profile incomplete | Completion prompt + missing fields list | → profile |
| Already applied | Application status card (see below) | - |
| Job closed | Gray banner: "ตำแหน่งนี้ปิดรับสมัครแล้ว" | - |
| Job expired | Gray banner: "ประกาศงานหมดอายุแล้ว" | - |

### Already Applied Card

| Component | Purpose | Action |
|-----------|---------|--------|
| ✓ Icon | Confirmation | - |
| "คุณสมัครงานนี้แล้ว" | Title | - |
| Applied date | "เมื่อ DD MMM YYYY" | - |
| Status badge | Current application status | - |
| View Application | Link to applications | → .../applications |
| Message Company | If chat is open | → /chat |

### Profile Incomplete Block

| Component | Purpose | Action |
|-----------|---------|--------|
| ⚠️ Icon | Warning | - |
| "กรุณากรอกข้อมูลให้ครบก่อนสมัคร" | Title | - |
| Missing fields list | Checklist | - |
| "ไปที่โปรไฟล์" | CTA button | → .../profile |

**Exception Components:**
- Job not found: 404 page with "ค้นหางานอื่น" CTA
- Job paused: 404 (not visible to public)
- Company not verified: Should not happen (validation)
- Apply rate limit: "กรุณารอสักครู่" toast

---

## 3.4 `/companies` - Company Directory

**Shell:** Public Shell  
**Purpose:** Browse verified companies

### Layout

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Page Header** | Title + search | Top | - | - | - |
| ↳ Title | "บริษัททั้งหมด" | Left | - | - | - |
| ↳ Search Bar | Company name search | Right | Full-width mobile | Submit search | - |
| **Filter Bar** | Quick filters | Below header | Horizontal scroll | - | - |
| ↳ Industry Filter | Dropdown | - | - | Opens dropdown | - |
| ↳ Company Size | Dropdown | - | - | Opens dropdown | - |
| ↳ Location Filter | Province | - | - | Opens dropdown | - |
| **Results Count** | "พบ XX บริษัท" | Left | - | - | - |
| **Company Grid** | Company cards | Main | 3 cols | - | 2 tablet, 1 mobile |
| ↳ Company Card | Single company | - | - | → /companies/[id] | See pattern below |
| **Pagination** | Page nav | Bottom | - | Navigate | - |

### Company Card Pattern

| Component | Purpose | Position | Action | Notes/Edge Case |
|-----------|---------|----------|--------|-----------------|
| Company Logo | 80×80, centered | Top | → /companies/[id] | - |
| Company Name | Bold | Center | → /companies/[id] | - |
| Industry Tag | Category | Below name | - | - |
| Open Positions | "XX ตำแหน่งเปิดรับ" | Below industry | - | - |
| Location | Province | Bottom | - | - |
| Verified Badge | ✓ ยืนยันแล้ว | Top-right corner | - | - |

**Exception Components:**
- Zero results: "ไม่พบบริษัทที่ตรงกับการค้นหา" + clear filters
- No companies: Should not happen (always have some)

---

## 3.5 `/companies/[id]` - Public Company Profile

**Shell:** Public Shell  
**Purpose:** Employer brand showcase

### Layout

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Cover Section** | Visual header | Top, full-width | - | - | - |
| ↳ Cover Image | Banner | Full-width | Shorter mobile | - | Gradient fallback |
| ↳ Logo Overlay | Company logo | Bottom-left, overlap | Center mobile | - | 120×120 |
| **Header Section** | Company info | Below cover | Stack mobile | - | - |
| ↳ Company Name | Name | Left | Center mobile | - | Thai + English |
| ↳ Industry | Category | Below name | - | - | - |
| ↳ Quick Stats | Key metrics | Right | Below name mobile | - | - |
| ↳↳ Employee Count | Size | - | - | - | - |
| ↳↳ Open Positions | Job count | - | - | - | - |
| ↳↳ Founded Year | Established | - | - | - | - |
| ↳ Verified Badge | Trust indicator | Top-right | - | - | If verified |
| ↳ Follow Button | Subscribe | Right | - | Toggle follow | Requires login |
| **About Section** | Description | Below header | - | - | - |
| ↳ Section Title | "เกี่ยวกับบริษัท" | - | - | - | - |
| ↳ Description | Company story | - | - | - | Rich text |
| ↳ Mission/Culture | Values | - | - | - | If provided |
| **Open Positions** | Job listings | Below about | - | - | - |
| ↳ Section Title | "ตำแหน่งที่เปิดรับ" | - | - | - | With count |
| ↳ Job Cards | Active jobs | - | - | → /jobs/[id] | Card list |
| ↳ View All | If many jobs | - | - | → /jobs?company=[id] | - |
| **Gallery** | Office photos | Below jobs | - | - | Hide if empty |
| ↳ Section Title | "รูปภาพบริษัท" | - | - | - | - |
| ↳ Photo Grid | Image gallery | 3 cols | 2 mobile | Opens lightbox | - |
| **Contact Info** | Reach company | Sidebar or bottom | - | - | - |
| ↳ Website | Link | - | - | ↗ External | External link icon |
| ↳ Social Links | FB, LinkedIn | - | - | ↗ External | Icons |
| ↳ Location | Address | - | - | ↗ Maps | Map link |

**Exception Components:**
- Company not found: 404 → "ดูบริษัททั้งหมด"
- Company pending: 404 (not public)
- Company suspended: 404 (not public)
- No open positions: "ยังไม่มีตำแหน่งเปิดรับ" message
- No description: "บริษัทยังไม่ได้เพิ่มข้อมูล" placeholder
- No logo: Initial avatar (first letter of company name)

---

## 3.6 `/legal/[slug]` - Legal Pages

**Shell:** Public Shell (Minimal footer)  
**Purpose:** Terms, Privacy Policy, Cookie Policy

### Layout

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Article Layout** | Legal content | Center, max 800px | - | - | - |
| ↳ Page Title | Document title | Top | - | - | E.g., "ข้อกำหนดการใช้งาน" |
| ↳ Last Updated | Version date | Below title | - | - | Thai date |
| ↳ Table of Contents | Section nav | Left sidebar | Hidden mobile | - | Sticky |
| ↳↳ TOC Items | Section links | - | - | Smooth scroll | - |
| ↳ Content | Legal text | Main | - | - | Clean typography |
| ↳↳ Sections | Numbered sections | - | - | - | h2, h3 hierarchy |
| ↳↳ Paragraphs | Body text | - | - | - | - |
| ↳ Print Button | Print version | Top-right | - | Print page | - |

### Supported Slugs

| Slug | Title (Thai) |
|------|--------------|
| terms | ข้อกำหนดการใช้งาน |
| privacy | นโยบายความเป็นส่วนตัว |
| cookies | นโยบายคุกกี้ |

**Exception Components:**
- Invalid slug: 404 page

---

## 3.7 `/privacy/cookie-settings` - Cookie Preferences

**Shell:** Public Shell (Minimal)  
**Purpose:** PDPA compliant cookie management

### Layout

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Settings Card** | Cookie controls | Center, max 600px | Full-width mobile | - | - |
| ↳ Title | "การตั้งค่าคุกกี้" | Top | - | - | - |
| ↳ Description | Explanation | Below title | - | - | - |
| ↳ Category List | Toggle groups | - | - | - | - |
| ↳↳ Essential | จำเป็น | - | - | - | Always on, disabled toggle |
| ↳↳↳ Label | "คุกกี้ที่จำเป็น" | Left | - | - | - |
| ↳↳↳ Description | Purpose text | - | - | - | - |
| ↳↳↳ Toggle | On (disabled) | Right | - | - | Cannot disable |
| ↳↳ Analytics | วิเคราะห์ | - | - | - | - |
| ↳↳↳ Label | "คุกกี้วิเคราะห์" | Left | - | - | - |
| ↳↳↳ Description | Purpose text | - | - | - | - |
| ↳↳↳ Toggle | On/Off | Right | - | Toggle setting | User choice |
| ↳↳ Marketing | การตลาด | - | - | - | - |
| ↳↳↳ Label | "คุกกี้การตลาด" | Left | - | - | - |
| ↳↳↳ Description | Purpose text | - | - | - | - |
| ↳↳↳ Toggle | On/Off | Right | - | Toggle setting | User choice |
| ↳ Save Button | Apply settings | Bottom | Full-width | Save settings | "บันทึกการตั้งค่า" |
| ↳ Policy Link | Full policy | Bottom | - | → /legal/cookies | - |

**Exception Components:**
- Save failed: Toast error + retry

---

## 3.8 `/help` - Help Center

**Shell:** Public Shell  
**Purpose:** Self-service support

### Layout

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Help Header** | Search focus | Top, centered | - | - | - |
| ↳ Title | "ศูนย์ช่วยเหลือ" | Center | - | - | - |
| ↳ Subtitle | "ค้นหาคำตอบที่คุณต้องการ" | Center | - | - | - |
| ↳ Search Bar | Article search | Center, large | Full-width | Submit search | Autocomplete |
| **Category Cards** | Topic groups | Below search | 2 cols | - | 1 mobile |
| ↳ สำหรับผู้หางาน | Candidate topics | - | - | → /help/candidates | Icon + description |
| ↳↳ การสมัครงาน | Application help | - | - | → /help/applying | - |
| ↳↳ การสร้างโปรไฟล์ | Profile help | - | - | → /help/profile | - |
| ↳↳ การนัดสัมภาษณ์ | Interview help | - | - | → /help/interviews | - |
| ↳ สำหรับบริษัท | Company topics | - | - | → /help/companies | Icon + description |
| ↳↳ การลงประกาศงาน | Job posting help | - | - | → /help/posting | - |
| ↳↳ การจัดการใบสมัคร | Application management | - | - | → /help/managing | - |
| ↳↳ การตั้งค่าบริษัท | Company settings | - | - | → /help/company-settings | - |
| **Popular Articles** | Common questions | Below categories | - | - | - |
| ↳ Section Title | "บทความยอดนิยม" | - | - | - | - |
| ↳ Article List | Top articles | - | - | - | - |
| ↳↳ Article Link | Title + snippet | - | - | → /help/[topic] | - |
| **Contact Section** | Support fallback | Bottom | - | - | - |
| ↳ Title | "ยังไม่พบคำตอบ?" | - | - | - | - |
| ↳ Contact Options | Support channels | - | - | - | - |
| ↳↳ Email | support@chancedee.com | - | - | Opens mail client | - |
| ↳↳ Line | Line Official | - | - | ↗ Line | - |

**Exception Components:**
- Search no results: "ไม่พบบทความที่ตรงกัน" + contact prompt

---

## 3.9 `/help/[topic]` - Help Article

**Shell:** Public Shell  
**Purpose:** Individual help content

### Layout

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Breadcrumb** | Navigation | Top | - | Navigate | ศูนย์ช่วยเหลือ > หมวดหมู่ > บทความ |
| **Article Header** | Title + meta | Top | - | - | - |
| ↳ Category Tag | Topic category | Above title | - | → /help/[category] | Colored tag |
| ↳ Article Title | Title | - | - | - | h1 |
| ↳ Last Updated | Date | Below title | - | - | - |
| **Article Content** | Help text | Main, max 800px | - | - | - |
| ↳ Rich Content | Instructions | - | - | - | Text, images, steps |
| ↳ Screenshots | Visual guides | - | - | Opens lightbox | Clickable to enlarge |
| ↳ Step Lists | Numbered steps | - | - | - | - |
| ↳ Callout Boxes | Tips, warnings | - | - | - | Styled boxes |
| **Related Articles** | More help | Sidebar / Below | Below mobile | - | - |
| ↳ Section Title | "บทความที่เกี่ยวข้อง" | - | - | - | - |
| ↳ Article Links | Related topics | - | - | → /help/[topic] | - |
| **Feedback Section** | Usefulness | Bottom | - | - | - |
| ↳ Question | "บทความนี้มีประโยชน์ไหม?" | Center | - | - | - |
| ↳ Feedback Buttons | Yes/No | Center | - | Submit feedback | 👍 👎 icons |
| ↳ Follow-up | If No clicked | - | - | - | "ช่วยบอกเราว่าอะไรขาดไป" |
| **Contact CTA** | Support option | Bottom | - | - | - |
| ↳ Text | "ยังมีคำถาม?" | - | - | - | - |
| ↳ Contact Button | "ติดต่อเรา" | - | - | → contact | - |

**Exception Components:**
- Article not found: 404 with help center search
- Article archived: Redirect to updated version
- No related articles: Hide section

---

*End of Section 3: Public Routes*
