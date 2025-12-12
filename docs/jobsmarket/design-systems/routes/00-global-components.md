# ChanceDee Layout Component Specification
## Section 1: Global Components

**Version:** 2.0  
**Date:** December 2024  
**Platform:** ChanceDee - Thai Recruitment Platform

---

## Table Structure Convention

All component tables in this specification use a 6-column structure:

| Column | Contains | Examples |
|--------|----------|----------|
| **Component** | Name with hierarchy (↳) | `↳↳ Login Button` |
| **Purpose** | What it does | `Submit credentials` |
| **Position** | Where it sits | `Bottom-right, fixed` |
| **Responsive** | Mobile behavior | `Hidden mobile`, `Stack` |
| **Action** | Click/tap behavior | `→ /jobs`, `Opens modal`, `Toggle` |
| **Notes/Edge Case** | Exceptions, conditions, specs | `Hide if 0`, `Max 3`, `Admin only` |

---

## 1.1 Overview

Global components appear across multiple routes and user contexts. They handle cross-cutting concerns like messaging, notifications, and system states.

---

## 1.2 Chat FAB (Floating Action Button)

**Appears On:** All authenticated pages (Candidate, Company shells)  
**Purpose:** Quick access to messaging without leaving current page

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Chat FAB Container** | Floating chat access | Bottom-right, fixed | Same | - | Hidden on /chat route |
| ↳ FAB Button | Toggle chat drawer | 56px circle | 48px mobile | Opens Chat Drawer | - |
| ↳ Unread Badge | Message count | Top-right of FAB | Same | - | Hide if 0 |
| ↳ Pulse Animation | New message alert | Around FAB | Same | - | 3 sec after new message |

**Expanded State (Chat Drawer):**

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Chat Drawer** | Mini chat interface | Bottom-right, 400×500px | Full-screen modal mobile | - | - |
| ↳ Drawer Header | Title + controls | Top | Same | - | - |
| ↳↳ Title | "ข้อความ" | Left | - | - | - |
| ↳↳ Expand Button | Open full chat | Center | - | → /chat | - |
| ↳↳ Close Button | Collapse to FAB | Right | - | Closes drawer | - |
| ↳ Conversation List | Recent chats | Scrollable area | Same | - | Empty: "ยังไม่มีข้อความ" |
| ↳↳ Conversation Item | Single chat preview | Row | Same | Opens conversation | Unread highlight |
| ↳↳↳ Avatar | Company/Candidate photo | Left | - | - | Initials fallback |
| ↳↳↳ Name | Party name | - | - | - | Truncate > 20 chars |
| ↳↳↳ Preview | Last message | - | - | - | Truncate > 30 chars |
| ↳↳↳ Time | Relative time | Right | - | - | - |
| ↳↳↳ Unread Dot | Unread indicator | Right | - | - | - |

**Exception States:**
- No conversations: "ยังไม่มีข้อความ" with context-appropriate CTA
- Offline: Queue indicator on pending messages
- WebSocket disconnected: Reconnecting banner

---

## 1.3 Toast Notification System

**Appears On:** All pages  
**Purpose:** Transient feedback for user actions

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Toast Container** | Stack container | Top-right, fixed | Top-center mobile | - | Max 3 visible |
| ↳ Toast Item | Individual notification | Stacked, 8px gap | Full-width mobile | - | Auto-dismiss 5s |
| ↳↳ Icon | Status indicator | Left | - | - | ✓/⚠/✗/ℹ by type |
| ↳↳ Message | Notification text | Center | - | - | Max 2 lines |
| ↳↳ Action Button | Optional action | Right | - | Context action | E.g., "ลองอีกครั้ง", "ดู" |
| ↳↳ Close Button | Manual dismiss | Right | - | Dismisses toast | - |
| ↳↳ Progress Bar | Auto-dismiss timer | Bottom | - | - | Pause on hover |

**Toast Types:**

| Type | Color | Icon | Duration | Use Case |
|------|-------|------|----------|----------|
| Success | Green/Teal | ✓ | 3s | Action completed |
| Error | Red | ✗ | 5s | Action failed |
| Warning | Orange | ⚠ | 5s | Partial success, caution |
| Info | Blue | ℹ | 4s | Informational |

**Thai Messages Examples:**
- Success: "บันทึกสำเร็จ", "สมัครงานสำเร็จ", "ส่งข้อความแล้ว"
- Error: "บันทึกไม่สำเร็จ", "เกิดข้อผิดพลาด", "อัปโหลดไม่สำเร็จ"
- Warning: "ดำเนินการสำเร็จ 3/5 รายการ"
- Info: "มีใบสมัครใหม่", "มีข้อความใหม่"

---

## 1.4 Confirmation Dialog System

**Appears On:** All pages requiring destructive/important actions  
**Purpose:** Prevent accidental destructive actions

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Dialog Overlay** | Background dim | Full viewport | Same | Closes dialog | Click outside to cancel |
| **Dialog Card** | Confirmation content | Center, max 400px | Full-width mobile | - | - |
| ↳ Icon | Action indicator | Top center | - | - | Warning for destructive |
| ↳ Title | Action description | Center | - | - | E.g., "ยืนยันการลบ?" |
| ↳ Description | Consequence explanation | Center | - | - | E.g., "การดำเนินการนี้ไม่สามารถย้อนกลับได้" |
| ↳ Input Field | Type-to-confirm | Center | - | - | For critical actions only |
| ↳ Action Buttons | Confirm/Cancel | Bottom | Stack mobile | - | - |
| ↳↳ Cancel Button | Dismiss dialog | Left | - | Closes dialog | "ยกเลิก" |
| ↳↳ Confirm Button | Execute action | Right | - | Executes action | Red for destructive |

**Confirmation Types:**

| Type | Input Required | Button Color | Use Case |
|------|----------------|--------------|----------|
| Simple | No | Teal | Standard confirmations |
| Destructive | No | Red | Delete, remove actions |
| Critical | Yes (type phrase) | Red | Permanent delete, account deletion |

**Thai Confirmation Phrases:**
- Delete job: "ลบประกาศงาน" 
- Delete account: "ลบบัญชี"
- Permanent delete: "ลบถาวร"

---

## 1.5 Session Expiry Modal

**Appears On:** All authenticated pages  
**Purpose:** Handle token expiration gracefully without data loss

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Session Modal Overlay** | Block interaction | Full viewport | Same | - | Cannot dismiss |
| **Session Modal Card** | Re-authentication | Center, max 400px | Full-width mobile | - | - |
| ↳ Warning Icon | Alert user | Top center | - | - | - |
| ↳ Title | "เซสชันหมดอายุ" | Center | - | - | - |
| ↳ Description | Re-login prompt | Center | - | - | "กรุณาเข้าสู่ระบบอีกครั้งเพื่อดำเนินการต่อ" |
| ↳ Google Login Button | OAuth re-auth | Full-width | Same | OAuth flow | For OAuth users |
| ↳ Divider | "หรือ" | Center | - | - | - |
| ↳ Email Field | Email input | Full-width | Same | - | Pre-filled |
| ↳ Password Field | Password input | Full-width | Same | - | - |
| ↳ Login Button | Re-authenticate | Full-width | Same | Submit re-auth | "เข้าสู่ระบบ" |

**Behavior:**
- Triggered on 401 response during API call
- Preserves current page state
- After re-auth, retries failed request
- Token refresh: 7 days validity, refresh 24h before expiry

---

## 1.6 Offline State Banner

**Appears On:** All pages  
**Purpose:** Inform user of connectivity status

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Offline Banner** | Connection status | Top, sticky below nav | Same | - | - |
| ↳ Warning Icon | ⚠️ | Left | - | - | - |
| ↳ Message | Status text | Center | - | - | - |
| ↳ Retry Button | Manual reconnect | Right | - | Triggers reconnect | Hidden if auto-reconnecting |

**States:**

| State | Message (Thai) | Color | Behavior |
|-------|----------------|-------|----------|
| Offline | "คุณออฟไลน์อยู่ บางฟีเจอร์อาจไม่พร้อมใช้งาน" | Yellow | Persistent |
| Reconnecting | "กำลังเชื่อมต่อใหม่..." | Yellow | Animated |
| Back Online | "กลับมาออนไลน์แล้ว กำลังซิงค์ข้อมูล..." | Green | Auto-hide 3s |
| Slow Connection | "การเชื่อมต่อช้า กำลังโหลด..." | Yellow | Show after 5s |

---

## 1.7 Loading States

**Appears On:** All data-fetching contexts  
**Purpose:** Visual feedback during data loading

### Page Loading

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Page Skeleton** | Content placeholder | Main content area | Same | - | Route-specific patterns |
| ↳ Header Skeleton | Title/nav placeholder | Top | - | - | - |
| ↳ Card Skeletons | Content placeholders | Grid/List | - | - | Match expected layout |
| ↳ Shimmer Animation | Loading indicator | Overlay | - | - | Left-to-right sweep |

### Action Loading

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Button Spinner** | Action in progress | Inside button | Same | - | Disable button |
| **Inline Spinner** | Small operation | Inline | Same | - | 16-24px |
| **Progress Bar** | Upload/download | Above content | Same | - | Show percentage |

### Skeleton Patterns by Route Type:

| Route Type | Skeleton Pattern |
|------------|------------------|
| Job List | Card grid (3×N) |
| Job Detail | Header + 2-col content |
| Dashboard | Stats row + card grid |
| Profile | Avatar + form fields |
| Table Views | Header + row placeholders |
| Chat | Conversation list + message area |

---

## 1.8 Error Pages

**Appears On:** Route-level errors  
**Purpose:** Handle unrecoverable errors gracefully

### 404 Not Found

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Error Page Container** | Error display | Center viewport | Same | - | - |
| ↳ Illustration | Visual indicator | Top | Smaller mobile | - | Thai-friendly illustration |
| ↳ Error Code | "404" | Center | - | - | Large text |
| ↳ Title | "ไม่พบหน้าที่คุณต้องการ" | Center | - | - | - |
| ↳ Description | Helpful context | Center | - | - | Route-specific |
| ↳ Primary Action | Main CTA | Center | - | Context-based | - |
| ↳ Secondary Action | Alternative | Center | - | → / | "กลับหน้าหลัก" |
| ↳ Search Bar | Find content | Center | - | Submit search | Optional |

**Context-Specific 404 Messages:**

| Context | Title | Primary Action |
|---------|-------|----------------|
| Job not found | "ไม่พบประกาศงานนี้" | → /jobs "ค้นหางานอื่น" |
| Company not found | "ไม่พบบริษัทนี้" | → /companies "ดูบริษัททั้งหมด" |
| Candidate not found | "ไม่พบผู้สมัครนี้" | Back to list |
| Help article not found | "ไม่พบบทความนี้" | → /help "ค้นหาในศูนย์ช่วยเหลือ" |

### 500 Server Error

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Error Page Container** | Error display | Center viewport | Same | - | - |
| ↳ Illustration | Server error visual | Top | Smaller mobile | - | - |
| ↳ Title | "เกิดข้อผิดพลาด" | Center | - | - | - |
| ↳ Description | "ระบบมีปัญหาชั่วคราว กรุณาลองใหม่อีกครั้ง" | Center | - | - | - |
| ↳ Retry Button | Refresh page | Center | - | Refresh page | "ลองอีกครั้ง" |
| ↳ Home Link | Go to home | Center | - | → / | "กลับหน้าหลัก" |
| ↳ Error ID | Debug reference | Bottom | - | - | Small text, for support |

### Maintenance Mode

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Maintenance Page** | System down notice | Full viewport | Same | - | - |
| ↳ Illustration | Maintenance visual | Top | Smaller mobile | - | - |
| ↳ Title | "ระบบอยู่ระหว่างปรับปรุง" | Center | - | - | - |
| ↳ Description | Expected return time | Center | - | - | - |
| ↳ Social Links | Updates channel | Center | - | ↗ External | Facebook, Line |

---

## 1.9 Empty States

**Pattern:** Consistent empty state design across all list/collection views

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Empty State Container** | No data display | Center of content area | Same | - | - |
| ↳ Illustration | Context visual | Top | Smaller mobile | - | Subtle, on-brand |
| ↳ Primary Message | Main text (Thai) | Center | - | - | Bold, descriptive |
| ↳ Secondary Message | Explanation | Center | - | - | Lighter, helpful |
| ↳ Primary CTA | Main action | Center | - | Context action | Teal button |
| ↳ Secondary Link | Alternative | Center | - | Context action | Optional |

**Empty State Examples:**

| Context | Primary Message | CTA Action |
|---------|-----------------|------------|
| No applications (candidate) | "คุณยังไม่ได้สมัครงาน" | → /jobs "ค้นหางาน" |
| No saved jobs | "ยังไม่มีงานที่บันทึก" | → /jobs "ค้นหางาน" |
| No job results | "ไม่พบงานที่ตรงกับการค้นหา" | "ดูงานทั้งหมด" |
| No applications (company) | "ยังไม่มีใบสมัคร" | "แชร์ลิงก์ประกาศงาน" |
| No chat messages | "ยังไม่มีข้อความ" | Context-based |
| No notifications | "ยังไม่มีการแจ้งเตือน" | - |

---

## 1.10 Cookie Consent Banner

**Appears On:** All pages for new/non-consented visitors  
**Purpose:** PDPA compliance

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Cookie Banner** | Consent request | Bottom, fixed | Same | - | - |
| ↳ Message | Policy summary | Left | Stack mobile | - | - |
| ↳ Link | Full policy | Inline | - | → /legal/privacy | - |
| ↳ Settings Button | Customize | Right | - | → /privacy/cookie-settings | - |
| ↳ Accept Button | Accept all | Right | - | Accept + dismiss | "ยอมรับทั้งหมด" |

---

## 1.11 Profile Completion Ring

**Appears On:** Candidate dashboard, sidebar, profile header  
**Purpose:** Encourage profile completion

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Completion Ring** | Visual progress | Various | Same | Opens checklist modal | - |
| ↳ SVG Ring | Circular progress | - | - | - | - |
| ↳ Percentage | Number in center | - | - | - | "XX%" |
| ↳ Color | Progress indicator | - | - | - | Red <40%, Yellow 40-70%, Green >70% |

**Click Behavior:** Opens completion checklist modal showing missing sections

---

## 1.12 Match Score Badge

**Appears On:** Job cards (for candidates), Application cards (for companies)  
**Purpose:** Show job-candidate compatibility

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Match Badge** | Compatibility score | Top-right of card | Same | - | - |
| ↳ Score Number | 0-100 | Center | - | - | - |
| ↳ Color Background | Score tier | - | - | - | See below |
| ↳ Tooltip | Score breakdown | On hover | On tap mobile | Shows breakdown | - |

**Score Colors:**

| Score Range | Color | Label |
|-------------|-------|-------|
| 0-39 | Red | Low match |
| 40-69 | Yellow | Moderate match |
| 70-89 | Green | Good match |
| 90-100 | Teal | Excellent match |

---

## 1.13 Status Badges

**Appears On:** Applications, Jobs, various lists  
**Purpose:** Visual status indicators

### Application Status Badges

| Status | Thai | Color | Background |
|--------|------|-------|------------|
| Applied | สมัครแล้ว | Blue | Light blue |
| Viewed | ดูแล้ว | Gray | Light gray |
| Under Review | กำลังพิจารณา | Yellow | Light yellow |
| Accepted | ตอบรับ | Teal | Light teal |
| Interview | นัดสัมภาษณ์ | Orange | Light orange |
| Offer | ได้รับข้อเสนอ | Green | Light green |
| Rejected | ปฏิเสธ | Red | Light red |
| Withdrawn | ถอนใบสมัคร | Gray | Light gray |

### Job Status Badges

| Status | Thai | Color |
|--------|------|-------|
| Active | กำลังเปิดรับ | Green |
| Draft | ร่าง | Gray |
| Paused | หยุดชั่วคราว | Yellow |
| Closed | ปิดแล้ว | Red |
| Expired | หมดอายุ | Gray |

### Company Status Badges (Admin)

| Status | Thai | Color |
|--------|------|-------|
| Pending | รอตรวจสอบ | Yellow |
| Active | ใช้งาน | Green |
| Suspended | ถูกระงับ | Red |
| Verified | ยืนยันแล้ว | Teal |

---

## 1.14 Appointment Tracker Widget

**Appears On:** Candidate dashboard sidebar, Company dashboard  
**Purpose:** Show upcoming interviews

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Appointment Widget** | Upcoming interviews | Sidebar/Dashboard card | Same | - | - |
| ↳ Widget Header | Title | Top | - | - | "การนัดหมายที่กำลังจะถึง" |
| ↳ Appointment List | Interview list | - | - | - | Max 3 visible |
| ↳↳ Appointment Card | Single interview | Row | - | → /chat | - |
| ↳↳↳ Date Badge | Day/Month | Left | - | - | Thai format |
| ↳↳↳ Time | Time slot | - | - | - | - |
| ↳↳↳ Party Name | Company/Candidate | - | - | - | - |
| ↳↳↳ Position | Job title | - | - | - | Truncate |
| ↳↳↳ Type Icon | Video/Phone/In-person | Right | - | - | - |
| ↳↳↳ Status Badge | Confirmed/Pending | - | - | - | - |
| ↳ View All Link | "ดูทั้งหมด" | Bottom | - | → /chat | - |

**Empty State:** "ไม่มีการนัดหมายที่กำลังจะถึง"

---

*End of Section 1: Global Components*
