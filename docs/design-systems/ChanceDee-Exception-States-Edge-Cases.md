# ChanceDee Platform - Exception States & Edge Cases

**Version:** 1.0  
**Date:** December 2024  
**Companion to:** Page Design Specifications

---

## Table of Contents

1. [Global Exception Patterns](#1-global-exception-patterns)
2. [Public Routes Exceptions](#2-public-routes-exceptions)
3. [Authentication Exceptions](#3-authentication-exceptions)
4. [Candidate Routes Exceptions](#4-candidate-routes-exceptions)
5. [Company Routes Exceptions](#5-company-routes-exceptions)
6. [Communication Exceptions](#6-communication-exceptions)
7. [Platform Admin Exceptions](#7-platform-admin-exceptions)
8. [Network & System States](#8-network--system-states)

---

## 1. Global Exception Patterns

### 1.1 Standard Error Display Patterns

| Error Type | Display Method | User Action |
|------------|----------------|-------------|
| Field validation | Inline red text below field | Fix and retry |
| Form submission | Toast notification (top-right) | Dismiss or retry |
| Page-level error | Full-page error state | Retry or go home |
| Permission denied | Redirect with toast | Login or contact support |
| Not found (404) | Custom 404 page | Search or go home |
| Server error (500) | Full-page error with retry | Retry or contact support |
| Network offline | Sticky banner (top) | Wait for reconnection |

### 1.2 Standard Empty State Pattern

```
┌─────────────────────────────────────┐
│         [Illustration]              │
│                                     │
│     Primary Message (Thai)          │
│     Secondary explanation           │
│                                     │
│     [Primary Action Button]         │
│     Optional secondary link         │
└─────────────────────────────────────┘
```

### 1.3 Permission Denied Pattern

**Trigger:** User attempts to access route without proper authorization

**Display:**
- Redirect to appropriate page based on context
- Toast: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้"
- Log attempt for security monitoring

**Redirect Logic:**
| User State | Redirect To |
|------------|-------------|
| Not logged in | `/auth/login?redirect=[current_url]` |
| Candidate accessing company route | `/candidates/[id]` |
| Company accessing other company | `/companies/[id]/dashboard` |
| Non-admin accessing platform | `/` (home) |
| Pending user | `/auth/status?type=pending` |
| Deleted user | `/auth/status?type=deleted` |

---

## 2. Public Routes Exceptions

### `/` - Landing Page

| Exception | Trigger | Display | Action |
|-----------|---------|---------|--------|
| Featured jobs empty | No active featured jobs | Hide section entirely | Auto-hide |
| Top companies empty | No verified companies | Hide section entirely | Auto-hide |
| Search service down | Meilisearch unavailable | Search bar works but slower | Fallback to Firestore |
| Slow load | > 3 seconds | Skeleton loaders | Progressive loading |

---

### `/jobs` - Job Search

| Exception | Trigger | Display | Action |
|-----------|---------|---------|--------|
| Zero results | No jobs match filters | Empty state with suggestions | Show filter removal hints |
| Zero results + text search | Search term has no matches | "ไม่พบงานที่ตรงกับ '[term]'" | Suggest related terms |
| Filter combination impossible | Conflicting filters | Warning badge on filter | "ลบตัวกรอง [X] เพื่อดู 45 งาน" |
| Search timeout | > 5 seconds | Loading → fallback results | "กำลังค้นหานานกว่าปกติ..." |
| Meilisearch down | Service unavailable | Silent fallback | Use Firestore (slower) |
| Invalid page number | Page > max pages | Redirect to page 1 | Auto-redirect |
| Saved job already saved | Click save on saved job | Toggle to unsave | Heart icon toggles |
| Save job not logged in | Click save, no session | Login prompt modal | "เข้าสู่ระบบเพื่อบันทึกงาน" |

**Zero Results Empty State:**
```
┌─────────────────────────────────────┐
│         [Search illustration]       │
│                                     │
│  ไม่พบงานที่ตรงกับการค้นหา            │
│                                     │
│  ลองปรับตัวกรอง:                     │
│  • ลบ "กรุงเทพ" → ดู 45 งาน          │
│  • ลบ "เงินเดือน > 80,000" → ดู 23 งาน│
│                                     │
│  [ดูงานทั้งหมด]  [ตั้งการแจ้งเตือน]    │
└─────────────────────────────────────┘
```

---

### `/jobs/[jobId]` - Job Detail

| Exception | Trigger | Display | Action |
|-----------|---------|---------|--------|
| Job not found | Invalid jobId | 404 page | Search jobs link |
| Job closed | Status = closed/filled | Gray banner + similar jobs | "ตำแหน่งนี้ปิดรับสมัครแล้ว" |
| Job expired | Past expiry date | Gray banner | Show similar jobs |
| Job paused | Temporarily hidden | 404 for public | Only visible to company |
| Company not verified | Company pending | Hide job | Shouldn't happen (validation) |
| Already applied | User has application | Show status instead of apply | "คุณสมัครงานนี้แล้ว เมื่อ [date]" |
| Profile incomplete | Missing required fields | Block apply + prompt | List missing fields |
| Not logged in + apply | Click apply, no session | Login modal | Return after login |
| Apply rate limit | Too many applies quickly | Temporary block | "กรุณารอสักครู่" |

**Already Applied State:**
```
┌─────────────────────────────────────┐
│  ✓ คุณสมัครงานนี้แล้ว                 │
│    เมื่อ 15 พ.ย. 2567                │
│                                     │
│  สถานะ: [กำลังพิจารณา]               │
│                                     │
│  [ดูใบสมัคร]  [ส่งข้อความถึงบริษัท]   │
└─────────────────────────────────────┘
```

**Profile Incomplete Block:**
```
┌─────────────────────────────────────┐
│  ⚠️ กรุณากรอกข้อมูลให้ครบก่อนสมัคร    │
│                                     │
│  ข้อมูลที่ยังไม่ครบ:                  │
│  • ชื่อ-นามสกุล (ภาษาไทย)            │
│  • ทักษะ (อย่างน้อย 1 ทักษะ)         │
│                                     │
│  [ไปที่โปรไฟล์]                      │
└─────────────────────────────────────┘
```

---

### `/companies/[id]` - Company Profile

| Exception | Trigger | Display | Action |
|-----------|---------|---------|--------|
| Company not found | Invalid id | 404 page | Browse companies link |
| Company pending | Not yet approved | 404 page | Not publicly visible |
| Company suspended | Admin action | 404 page | Not publicly visible |
| No open positions | All jobs closed | Empty section | "ยังไม่มีตำแหน่งเปิดรับ" |
| No company description | Empty about | Placeholder text | "บริษัทยังไม่ได้เพิ่มข้อมูล" |
| No logo | Missing logo | Default placeholder | Company initial avatar |

---

### `/help/[topic]` - Help Article

| Exception | Trigger | Display | Action |
|-----------|---------|---------|--------|
| Article not found | Invalid slug | 404 with search | Search help center |
| Article archived | Old content | Redirect to updated | Auto-redirect |
| No related articles | Empty relations | Hide section | Auto-hide |

---

## 3. Authentication Exceptions

### `/auth/login`

| Exception | Trigger | Display | Action |
|-----------|---------|---------|--------|
| Invalid credentials | Wrong email/password | Inline error | "อีเมลหรือรหัสผ่านไม่ถูกต้อง" |
| Account not found | Email not registered | Inline error + link | "ไม่พบบัญชี [ลงทะเบียน?]" |
| Account suspended | Admin action | Block + message | "บัญชีถูกระงับ ติดต่อฝ่ายสนับสนุน" |
| Account deleted | User deleted | Block + message | "บัญชีถูกลบแล้ว" |
| Account pending | Company awaiting approval | Redirect | → `/auth/status?type=pending` |
| Too many attempts | 5 failed logins | Temporary lock | "ลองใหม่ใน 15 นาที" |
| Google OAuth popup blocked | Browser blocks popup | Fallback flow | "Popup ถูกบล็อก [คลิกที่นี่]" |
| Google OAuth failed | Provider error | Toast + fallback | "เข้าสู่ระบบด้วย Google ไม่สำเร็จ" |
| Google OAuth - email exists | Different auth method | Link accounts prompt | "อีเมลนี้ลงทะเบียนด้วยรหัสผ่าน" |
| Network error | Connection failed | Toast + retry | "เชื่อมต่อไม่สำเร็จ [ลองอีกครั้ง]" |
| Session expired | Token expired | Auto-logout + redirect | Return to login |
| Already logged in | Active session | Redirect | → Dashboard |

**Account Suspended State:**
```
┌─────────────────────────────────────┐
│         [Warning icon]              │
│                                     │
│  บัญชีของคุณถูกระงับชั่วคราว          │
│                                     │
│  หากคุณคิดว่านี่เป็นข้อผิดพลาด        │
│  กรุณาติดต่อฝ่ายสนับสนุน             │
│                                     │
│  [ติดต่อฝ่ายสนับสนุน]                │
└─────────────────────────────────────┘
```

---

### `/auth/register`

| Exception | Trigger | Display | Action |
|-----------|---------|---------|--------|
| Email already exists | Duplicate email | Inline error | "อีเมลนี้ลงทะเบียนแล้ว [เข้าสู่ระบบ?]" |
| Weak password | Doesn't meet requirements | Inline error + requirements | Show password rules |
| Password mismatch | Confirm ≠ password | Inline error | "รหัสผ่านไม่ตรงกัน" |
| Invalid email format | Bad email syntax | Inline error | "รูปแบบอีเมลไม่ถูกต้อง" |
| Invalid phone format | Bad Thai phone | Inline error | "เบอร์โทรศัพท์ไม่ถูกต้อง" |
| Terms not accepted | Checkbox unchecked | Block submit | Highlight checkbox |
| Under 18 | DOB validation | Block | "ต้องมีอายุ 18 ปีขึ้นไป" |
| Invalid business reg | 13-digit validation | Inline error | "เลขทะเบียนนิติบุคคลไม่ถูกต้อง" |
| Document upload failed | File error | Retry prompt | "อัปโหลดไม่สำเร็จ [ลองอีกครั้ง]" |
| Document too large | > 10MB | Block + message | "ไฟล์ใหญ่เกิน 10MB" |
| Invalid document type | Not PDF/image | Block + message | "รองรับเฉพาะ PDF, JPG, PNG" |
| Google OAuth - company | Company tries OAuth | Block + explain | "บัญชีบริษัทต้องใช้อีเมล" |
| Registration disabled | Admin setting | Block page | "ระบบปิดรับสมัครชั่วคราว" |
| Referral code invalid | Bad code | Warning (non-blocking) | "รหัสแนะนำไม่ถูกต้อง" |
| Referral code self | Own code | Block | "ไม่สามารถใช้รหัสของตัวเอง" |

**Password Requirements Display:**
```
┌─────────────────────────────────────┐
│  รหัสผ่านต้องมี:                     │
│  ✓ อย่างน้อย 8 ตัวอักษร              │
│  ✗ ตัวพิมพ์ใหญ่ (A-Z)               │
│  ✓ ตัวพิมพ์เล็ก (a-z)               │
│  ✗ ตัวเลข (0-9)                    │
└─────────────────────────────────────┘
```

---

### `/auth/verify`

| Exception | Trigger | Display | Action |
|-----------|---------|---------|--------|
| Link expired | > 15 minutes | Expired state | [ส่งลิงก์ใหม่] |
| Link already used | Already verified | Success + redirect | "ยืนยันแล้วก่อนหน้านี้" |
| Invalid token | Bad/tampered token | Error state | Contact support |
| Email already verified | Re-click link | Success | Redirect to dashboard |
| Network error | Connection failed | Retry option | [ลองอีกครั้ง] |

---

### `/auth/reset`

| Exception | Trigger | Display | Action |
|-----------|---------|---------|--------|
| Email not found | Unregistered email | Success (security) | Same message as success |
| Rate limited | Too many requests | Block | "ลองใหม่ใน 15 นาที" |
| Reset link expired | > 1 hour | Expired state | [ขอลิงก์ใหม่] |
| Reset link used | Already used | Error | "ลิงก์ถูกใช้แล้ว" |
| New password same as old | Validation | Inline error | "ต้องไม่ซ้ำกับรหัสผ่านเดิม" |
| OAuth-only account | No password set | Info message | "บัญชีนี้ใช้ Google เข้าสู่ระบบ" |

---

### `/auth/status`

| Exception | Trigger | Display | Action |
|-----------|---------|---------|--------|
| Not pending/deleted | Wrong status | Redirect | → Appropriate dashboard |
| Approval rejected | Company rejected | Rejection details | Show reason + resubmit |
| Long pending (> 5 days) | Delayed approval | Escalation prompt | [ติดต่อฝ่ายสนับสนุน] |
| Recovery expired | > 30 day grace | Permanent delete | "ไม่สามารถกู้คืนได้" |

**Company Rejection State:**
```
┌─────────────────────────────────────┐
│         [Rejection icon]            │
│                                     │
│  การลงทะเบียนไม่ได้รับการอนุมัติ       │
│                                     │
│  เหตุผล: เอกสารไม่ชัดเจน            │
│                                     │
│  คุณสามารถแก้ไขและส่งใหม่ได้          │
│                                     │
│  [แก้ไขข้อมูล]  [ติดต่อฝ่ายสนับสนุน]  │
└─────────────────────────────────────┘
```

---

### `/auth/settings`

| Exception | Trigger | Display | Action |
|-----------|---------|---------|--------|
| Wrong current password | Password change | Inline error | "รหัสผ่านปัจจุบันไม่ถูกต้อง" |
| Email change conflict | New email exists | Inline error | "อีเมลนี้ใช้งานแล้ว" |
| Delete with active jobs | Company has active posts | Block | "ปิดประกาศงานก่อนลบบัญชี" |
| Delete confirmation wrong | Wrong phrase | Block submit | Highlight confirmation field |
| Data export in progress | Already requested | Disable button | "กำลังเตรียมข้อมูล..." |
| Unlink last auth method | Only Google linked | Block | "ต้องมีวิธีเข้าสู่ระบบอย่างน้อย 1 วิธี" |

---

## 4. Candidate Routes Exceptions

### `/candidates/[id]` - Dashboard

| Exception | Trigger | Display | Action |
|-----------|---------|---------|--------|
| Not owner | Other candidate's ID | Redirect | → Own dashboard |
| Profile at 0% | Brand new user | Onboarding redirect | → `/profile?tab=onboarding` |
| No applications | Never applied | Empty state | CTA to job search |
| No appointments | No interviews | Hide section | Or "ยังไม่มีการนัดหมาย" |
| No recommendations | Insufficient profile | Prompt | "กรอกข้อมูลเพิ่มเพื่อรับงานแนะนำ" |
| Recommendation service down | AI/matching error | Hide section | Graceful degradation |

**No Applications Empty State:**
```
┌─────────────────────────────────────┐
│         [Job search illustration]   │
│                                     │
│  คุณยังไม่ได้สมัครงาน                 │
│                                     │
│  เริ่มค้นหางานที่ใช่สำหรับคุณ          │
│                                     │
│  [ค้นหางาน]                         │
└─────────────────────────────────────┘
```

---

### `/candidates/[id]/profile`

| Exception | Trigger | Display | Action |
|-----------|---------|---------|--------|
| Session expired mid-form | Token expired | Save draft + re-login | "กรุณาเข้าสู่ระบบใหม่" |
| Auto-save failed | Network error | Warning banner | "บันทึกอัตโนมัติไม่สำเร็จ" |
| Photo upload failed | File error | Toast + retry | "อัปโหลดรูปไม่สำเร็จ" |
| Photo too large | > 5MB | Block + compress hint | "รูปใหญ่เกิน 5MB" |
| Invalid photo format | Not image | Block | "รองรับเฉพาะ JPG, PNG" |
| Resume upload failed | File error | Toast + retry | "อัปโหลดไม่สำเร็จ" |
| Resume too large | > 10MB | Block | "ไฟล์ใหญ่เกิน 10MB" |
| Duplicate skill | Already added | Toast | "เพิ่มทักษะนี้แล้ว" |
| Max skills reached | > 50 skills | Block | "เพิ่มได้สูงสุด 50 ทักษะ" |
| Max experience entries | > 20 entries | Block | "เพิ่มได้สูงสุด 20 รายการ" |
| Invalid date range | End < Start | Inline error | "วันที่ไม่ถูกต้อง" |
| Future end date | End > today | Warning (allowed) | "วันที่ในอนาคาร" |
| Onboarding incomplete | Try to leave | Block modal | "กรุณากรอกข้อมูลพื้นฐานก่อน" |
| Tab switch with unsaved | Pending changes | Confirm modal | "มีข้อมูลที่ยังไม่บันทึก" |

**Unsaved Changes Modal:**
```
┌─────────────────────────────────────┐
│  มีข้อมูลที่ยังไม่บันทึก               │
│                                     │
│  คุณต้องการบันทึกก่อนออกหรือไม่?       │
│                                     │
│  [บันทึก]  [ไม่บันทึก]  [ยกเลิก]      │
└─────────────────────────────────────┘
```

**Onboarding Block (Step 2 incomplete):**
```
┌─────────────────────────────────────┐
│  ⚠️ กรุณากรอกข้อมูลพื้นฐานก่อน        │
│                                     │
│  คุณต้องกรอกข้อมูลในขั้นตอนที่ 1-2     │
│  ก่อนเข้าใช้งานระบบ                  │
│                                     │
│  [กลับไปกรอกข้อมูล]                  │
└─────────────────────────────────────┘
```

---

### `/candidates/[id]/applications`

| Exception | Trigger | Display | Action |
|-----------|---------|---------|--------|
| No applications | Never applied | Empty state | CTA to search |
| Filter returns empty | No match for filter | Empty + hint | "ไม่มีใบสมัครในสถานะนี้" |
| Application not found | Invalid appId in URL | Redirect to list | Toast error |
| Withdraw failed | Server error | Toast + retry | "ถอนใบสมัครไม่สำเร็จ" |
| Already withdrawn | Double action | Toast info | "ถอนใบสมัครแล้ว" |
| Job deleted | Company removed job | Show limited info | "ประกาศงานถูกลบแล้ว" |
| Company suspended | Admin action | Show limited info | Hide company link |
| Timeline load failed | Server error | Retry button | "โหลดไทม์ไลน์ไม่สำเร็จ" |

---

### `/candidates/[id]/saved`

| Exception | Trigger | Display | Action |
|-----------|---------|---------|--------|
| No saved jobs | Empty list | Empty state | CTA to search |
| Saved job closed | Job no longer active | Badge: "ปิดแล้ว" | Gray card, remove option |
| Saved job deleted | Company removed | Remove from list | Auto-remove or "ไม่พบ" |
| No saved searches | Empty list | Empty state | "บันทึกการค้นหาจากหน้าค้นหางาน" |
| No alerts | Empty list | Empty state | [สร้างการแจ้งเตือน] |
| Alert limit reached | > 10 alerts | Block create | "สร้างได้สูงสุด 10 รายการ" |
| Search criteria invalid | Saved search outdated | Warning | "เงื่อนไขบางอย่างเปลี่ยนแปลง" |

---

## 5. Company Routes Exceptions

### `/companies/[id]/pending`

| Exception | Trigger | Display | Action |
|-----------|---------|---------|--------|
| Already approved | Status = active | Redirect | → Dashboard |
| Rejected | Status = rejected | Rejection state | Show reason + resubmit |
| Not owner | Other company's page | Redirect | → Own company |
| Document re-upload needed | Admin request | Alert banner | "กรุณาส่งเอกสารเพิ่มเติม" |

---

### `/companies/[id]/dashboard`

| Exception | Trigger | Display | Action |
|-----------|---------|---------|--------|
| No jobs posted | Empty jobs | Empty state | CTA to post job |
| No applications | No apps to any job | Empty state | "ยังไม่มีใบสมัคร" |
| No upcoming interviews | Empty calendar | Hide or message | "ไม่มีการนัดหมายในสัปดาห์นี้" |
| Analytics unavailable | Service error | Hide section | Graceful degradation |
| User role insufficient | Viewer accessing | Limited view | Hide sensitive data |

---

### `/companies/[id]/dashboard/jobs`

| Exception | Trigger | Display | Action |
|-----------|---------|---------|--------|
| No jobs | Never posted | Empty state | [ลงประกาศงานแรก] |
| Filter returns empty | No match | Empty + reset | "ไม่มีงานในสถานะนี้" |
| Bulk action failed | Partial failure | Toast with details | "ดำเนินการสำเร็จ 3/5 รายการ" |
| Delete job with apps | Has applications | Confirm modal | "งานนี้มี XX ใบสมัคร" |
| Pause limit reached | Business rule | Block | "หยุดพักได้สูงสุด X งาน" |
| Duplicate job failed | Server error | Toast + retry | "คัดลอกงานไม่สำเร็จ" |

---

### `/companies/[id]/dashboard/jobs/new`

| Exception | Trigger | Display | Action |
|-----------|---------|---------|--------|
| Draft auto-save failed | Network error | Warning banner | "บันทึกอัตโนมัติไม่สำเร็จ" |
| Required field empty | Validation | Inline error | Highlight field |
| Description too short | < 50 chars | Inline error | "ต้องมีอย่างน้อย 50 ตัวอักษร" |
| Salary min > max | Invalid range | Inline error | "เงินเดือนขั้นต่ำต้องน้อยกว่าสูงสุด" |
| Skills empty | No skills added | Block next | "เพิ่มทักษะอย่างน้อย 1 รายการ" |
| Publish failed | Server error | Toast + retry | "เผยแพร่ไม่สำเร็จ" |
| Schedule in past | Past datetime | Inline error | "เลือกเวลาในอนาคต" |
| Job limit reached | Subscription limit | Block + upsell | "ถึงขีดจำกัดแล้ว" |
| Session expired | Token timeout | Save draft + re-login | "กรุณาเข้าสู่ระบบใหม่" |
| Browser back with unsaved | Leaving wizard | Confirm modal | "มีข้อมูลที่ยังไม่บันทึก" |
| Duplicate title detected | Same title exists | Warning (non-blocking) | "มีงานชื่อนี้อยู่แล้ว" |

---

### `/companies/[id]/dashboard/jobs/[jobId]`

| Exception | Trigger | Display | Action |
|-----------|---------|---------|--------|
| Job not found | Invalid jobId | 404 | Link to job list |
| Job belongs to other company | Wrong ownership | 403 redirect | → Own jobs |
| Edit closed job | Status = closed | Warning | "งานปิดแล้ว ต้องการเปิดใหม่?" |
| Republish rejected | Admin blocked | Block | Contact support |
| View mode - no metrics | New job | Empty charts | "ยังไม่มีข้อมูล" |

---

### `/companies/[id]/dashboard/applications`

| Exception | Trigger | Display | Action |
|-----------|---------|---------|--------|
| No applications | Empty inbox | Empty state | Share job links |
| Filter returns empty | No match | Empty + hint | "ไม่มีใบสมัครในสถานะนี้" |
| Candidate profile hidden | Privacy setting | Limited view | "ผู้สมัครซ่อนข้อมูลบางส่วน" |
| Candidate deleted account | User deleted | Grayed card | "ผู้สมัครลบบัญชีแล้ว" |
| Accept failed | Server error | Toast + retry | "ตอบรับไม่สำเร็จ" |
| Reject failed | Server error | Toast + retry | "ปฏิเสธไม่สำเร็จ" |
| Already processed | Double action | Toast info | "ดำเนินการแล้ว" |
| Match score unavailable | Calculation error | Hide score | Show "N/A" |
| Resume download failed | File missing | Toast | "ดาวน์โหลดไม่สำเร็จ" |
| Bulk action limit | > 50 selected | Block | "เลือกได้สูงสุด 50 รายการ" |
| High volume (100+ apps) | Many applications | Pagination | "มีใบสมัครมาก ใช้ตัวกรองเพื่อจำกัด" |

**Candidate Deleted Empty State:**
```
┌─────────────────────────────────────┐
│         [Gray avatar]               │
│                                     │
│  ผู้สมัครลบบัญชีแล้ว                  │
│                                     │
│  ข้อมูลการสมัครถูกเก็บไว้             │
│  แต่ไม่สามารถติดต่อได้               │
│                                     │
│  [ซ่อนใบสมัครนี้]                    │
└─────────────────────────────────────┘
```

---

### `/companies/[id]/dashboard/team`

| Exception | Trigger | Display | Action |
|-----------|---------|---------|--------|
| Not admin | Non-admin access | Limited view | Hide invite, edit roles |
| Invite self | Own email | Inline error | "ไม่สามารถเชิญตัวเอง" |
| Invite existing member | Already on team | Inline error | "เป็นสมาชิกอยู่แล้ว" |
| Invite already sent | Pending invite | Inline error | "ส่งคำเชิญแล้ว [ส่งอีกครั้ง?]" |
| Remove self | Own account | Block | "ไม่สามารถลบตัวเอง" |
| Remove last admin | Only admin | Block | "ต้องมี Admin อย่างน้อย 1 คน" |
| Role change failed | Server error | Toast + retry | "เปลี่ยนบทบาทไม่สำเร็จ" |
| Invite limit reached | Subscription limit | Block | "ถึงขีดจำกัดสมาชิก" |
| Pending invite expired | > 7 days | Badge: "หมดอายุ" | [ส่งใหม่] option |

---

### `/companies/[id]/dashboard/candidates`

| Exception | Trigger | Display | Action |
|-----------|---------|---------|--------|
| Zero results | No matching candidates | Empty state | Broaden search |
| Meilisearch down | Service error | Fallback search | Slower results |
| Candidate contacted | Already in chat | Badge: "ติดต่อแล้ว" | Link to chat |
| Candidate unavailable | Changed availability | Badge: "ไม่พร้อม" | Grayed contact |
| Contact limit reached | Daily limit | Block | "ถึงขีดจำกัดรายวัน" |
| Profile incomplete | Candidate low completion | Warning badge | "ข้อมูลไม่ครบ" |

---

### `/companies/[id]/dashboard/settings`

| Exception | Trigger | Display | Action |
|-----------|---------|---------|--------|
| Logo upload failed | File error | Toast + retry | "อัปโหลดไม่สำเร็จ" |
| Logo wrong format | Not image | Block | "รองรับ JPG, PNG" |
| Logo too large | > 5MB | Block | "ไฟล์ใหญ่เกิน 5MB" |
| Cover image failed | Same as logo | Same as logo | Same handling |
| Analytics unavailable | Service error | Hide tab | Graceful degradation |
| Save failed | Server error | Toast + retry | "บันทึกไม่สำเร็จ" |
| URL invalid format | Bad website URL | Inline error | "รูปแบบ URL ไม่ถูกต้อง" |

---

## 6. Communication Exceptions

### `/chat`

| Exception | Trigger | Display | Action |
|-----------|---------|---------|--------|
| No conversations | No accepted apps | Empty state | Context-based message |
| Conversation not found | Invalid room ID | Redirect to list | Toast error |
| Other party deleted | User deleted account | Disabled chat | "ผู้ใช้ลบบัญชีแล้ว" |
| Other party blocked | Company suspended | Disabled chat | "ไม่สามารถส่งข้อความได้" |
| Message send failed | Network error | Retry indicator | [↻] retry button on message |
| Message queued | Offline | Queue indicator | "รอส่ง" badge |
| File upload failed | Network/size error | Toast + retry | "อัปโหลดไม่สำเร็จ" |
| File too large | > 10MB | Block | "ไฟล์ใหญ่เกิน 10MB" |
| Invalid file type | Blocked type | Block | "ไม่รองรับไฟล์ประเภทนี้" |
| Real-time disconnected | WebSocket error | Reconnecting banner | Auto-reconnect |
| Long disconnect | > 30 seconds | Warning banner | "ขาดการเชื่อมต่อ" |
| Message rate limit | Too fast | Temporary block | "กรุณารอสักครู่" |

**Chat Empty State (Candidate):**
```
┌─────────────────────────────────────┐
│         [Chat illustration]         │
│                                     │
│  ยังไม่มีข้อความ                     │
│                                     │
│  เมื่อบริษัทตอบรับใบสมัครของคุณ        │
│  คุณจะสามารถแชทกับบริษัทได้ที่นี่      │
│                                     │
│  [ไปที่ใบสมัคร]                      │
└─────────────────────────────────────┘
```

**Offline Message State:**
```
┌─────────────────────────────────────┐
│  ข้อความของคุณ           [รอส่ง ↻]  │
└─────────────────────────────────────┘
```

---

### Interview Appointment Exceptions

| Exception | Trigger | Display | Action |
|-----------|---------|---------|--------|
| Schedule in past | Past datetime | Inline error | "เลือกเวลาในอนาคต" |
| Conflicting appointment | Same time exists | Warning | "มีนัดหมายอื่นในเวลานี้" |
| Accept failed | Server error | Toast + retry | "ยืนยันไม่สำเร็จ" |
| Decline failed | Server error | Toast + retry | "ปฏิเสธไม่สำเร็จ" |
| Already responded | Double action | Toast info | "ตอบกลับแล้ว" |
| Appointment cancelled | Other party cancelled | Status update | "ยกเลิกโดย [party]" |
| Appointment rescheduled | Company changed | New card in chat | "นัดหมายใหม่" |
| Past appointment | Time passed | Disable actions | Gray status |
| No-show recorded | Company marked | Status update | Badge for reference |

**Appointment Conflict Warning:**
```
┌─────────────────────────────────────┐
│  ⚠️ ผู้สมัครมีนัดหมายอื่นในเวลานี้     │
│                                     │
│  15 ธ.ค. 2567, 14:00 - 15:00       │
│  สัมภาษณ์กับ บริษัท ABC             │
│                                     │
│  [เลือกเวลาอื่น]  [นัดหมายต่อไป]      │
└─────────────────────────────────────┘
```

---

### `/notifications`

| Exception | Trigger | Display | Action |
|-----------|---------|---------|--------|
| No notifications | Empty list | Empty state | "ยังไม่มีการแจ้งเตือน" |
| Filter returns empty | No match for type | Empty + hint | "ไม่มีการแจ้งเตือนประเภทนี้" |
| Mark read failed | Server error | Toast | "ทำเครื่องหมายไม่สำเร็จ" |
| Clear all failed | Server error | Toast | "ล้างไม่สำเร็จ" |
| Linked content deleted | Source removed | Disabled link | "เนื้อหาไม่พร้อมใช้งาน" |
| Load more failed | Pagination error | Retry button | "โหลดเพิ่มไม่สำเร็จ" |

---

## 7. Platform Admin Exceptions

### General Admin Exceptions

| Exception | Trigger | Display | Action |
|-----------|---------|---------|--------|
| Insufficient role | Staff accessing Admin | 403 redirect | → Allowed section |
| Action on self | Admin editing own role | Block | "ไม่สามารถแก้ไขตัวเอง" |
| Last super-admin | Remove only super-admin | Block | "ต้องมี Super-Admin อย่างน้อย 1 คน" |
| Audit log failed | Logging error | Continue + alert | Alert system admin |

---

### `/platform/dashboard`

| Exception | Trigger | Display | Action |
|-----------|---------|---------|--------|
| No pending requests | Empty queue | Empty state | "ไม่มีคำขอรออนุมัติ" |
| Approval failed | Server error | Toast + retry | "อนุมัติไม่สำเร็จ" |
| Rejection without reason | Empty reason | Block | "กรุณาระบุเหตุผล" |
| Document view failed | File missing | Toast | "เปิดเอกสารไม่สำเร็จ" |
| Bulk approval limit | > 20 at once | Block | "อนุมัติได้สูงสุด 20 รายการ" |

---

### `/platform/companies/[id]`, `/platform/candidates/[id]`, `/platform/jobs/[id]`

| Exception | Trigger | Display | Action |
|-----------|---------|---------|--------|
| Entity not found | Invalid ID | 404 | Back to list |
| Already suspended | Double action | Toast info | "ระงับแล้ว" |
| Already verified | Double action | Toast info | "ยืนยันแล้ว" |
| Delete with dependencies | Has related data | Confirm modal | Show dependencies |
| Permanent delete confirm | Destructive action | Type-to-confirm | "พิมพ์ 'ลบถาวร' เพื่อยืนยัน" |
| Contact failed | Email error | Toast | "ส่งอีเมลไม่สำเร็จ" |

---

### `/platform/analytics`

| Exception | Trigger | Display | Action |
|-----------|---------|---------|--------|
| Data unavailable | Service error | Error state per chart | "ไม่สามารถโหลดข้อมูล" |
| Date range too large | > 1 year | Block | "เลือกได้สูงสุด 1 ปี" |
| Export failed | Generation error | Toast | "ส่งออกไม่สำเร็จ" |
| Export too large | Too much data | Block | "ข้อมูลมากเกินไป ลดช่วงเวลา" |
| Real-time data delayed | Sync lag | Warning badge | "ข้อมูลอาจล่าช้า 5 นาที" |

---

### `/platform/system`

| Exception | Trigger | Display | Action |
|-----------|---------|---------|--------|
| Setting save failed | Server error | Toast + retry | "บันทึกไม่สำเร็จ" |
| Master data in use | Delete used item | Block | "รายการนี้กำลังถูกใช้งาน" |
| Duplicate master data | Same name exists | Inline error | "ชื่อนี้มีอยู่แล้ว" |
| Maintenance mode warning | Enable maintenance | Confirm modal | "ผู้ใช้จะไม่สามารถเข้าถึงได้" |
| Integration test failed | Connection error | Error status | "เชื่อมต่อไม่สำเร็จ" |
| Config validation failed | Invalid value | Inline error | Specific validation message |
| Loyalty points negative | Invalid amount | Block | "จำนวนต้องมากกว่า 0" |

---

## 8. Network & System States

### 8.1 Offline State

**Detection:** `navigator.onLine` + heartbeat check

**Global Offline Banner:**
```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️ คุณออฟไลน์อยู่ บางฟีเจอร์อาจไม่พร้อมใช้งาน                  │
└─────────────────────────────────────────────────────────────┘
```

**Behavior by Feature:**

| Feature | Offline Behavior |
|---------|------------------|
| Job Search | Show cached results + "อาจไม่เป็นปัจจุบัน" |
| Job Detail | Show if cached, else error |
| Apply | Queue + sync when online |
| Chat | Queue messages + show pending indicator |
| Profile Edit | Save locally + sync when online |
| Dashboard | Show stale data + refresh on reconnect |
| Notifications | Show cached + refresh on reconnect |

**Back Online:**
```
┌─────────────────────────────────────────────────────────────┐
│ ✓ กลับมาออนไลน์แล้ว กำลังซิงค์ข้อมูล...                       │
└─────────────────────────────────────────────────────────────┘
```

---

### 8.2 Slow Connection State

**Detection:** Request > 5 seconds

**Display:**
```
┌─────────────────────────────────────────────────────────────┐
│ ⏳ การเชื่อมต่อช้า กำลังโหลด...                               │
└─────────────────────────────────────────────────────────────┘
```

**Behavior:**
- Show skeleton loaders
- Progressive loading (text first, images later)
- Timeout after 30 seconds → error state

---

### 8.3 Server Error (5xx)

**Display:**
```
┌─────────────────────────────────────┐
│         [Error illustration]        │
│                                     │
│  เกิดข้อผิดพลาด                      │
│                                     │
│  ระบบมีปัญหาชั่วคราว                 │
│  กรุณาลองใหม่อีกครั้ง                │
│                                     │
│  [ลองอีกครั้ง]  [กลับหน้าหลัก]        │
│                                     │
│  Error ID: abc123                   │
└─────────────────────────────────────┘
```

---

### 8.4 Maintenance Mode

**Trigger:** Admin enables in `/platform/system`

**Display (all routes except /platform/*):**
```
┌─────────────────────────────────────┐
│         [Maintenance illustration]  │
│                                     │
│  ระบบอยู่ระหว่างปรับปรุง              │
│                                     │
│  กรุณากลับมาใหม่ในภายหลัง            │
│  คาดว่าจะกลับมาใช้งานได้ใน 2 ชั่วโมง  │
│                                     │
│  ติดตามข่าวสารได้ที่ [Facebook]       │
└─────────────────────────────────────┘
```

---

### 8.5 Rate Limiting

**Trigger:** Too many requests

| Limit Type | Threshold | Response |
|------------|-----------|----------|
| Login attempts | 5 per 15 min | Block + countdown |
| API requests | 100 per min | 429 + retry-after |
| Search queries | 30 per min | Throttle + warning |
| File uploads | 10 per hour | Block + message |
| Chat messages | 60 per min | Throttle + warning |
| Applications | 20 per day | Block + message |

**Display:**
```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️ คุณทำรายการเร็วเกินไป กรุณารอ [countdown] วินาที          │
└─────────────────────────────────────────────────────────────┘
```

---

### 8.6 Session Expiry

**Trigger:** Token expired (typically 7 days)

**Behavior:**
1. Detect on next API call
2. Show re-login modal (not redirect if mid-action)
3. Preserve current page state
4. Re-authenticate → continue

**Re-login Modal:**
```
┌─────────────────────────────────────┐
│  เซสชันหมดอายุ                       │
│                                     │
│  กรุณาเข้าสู่ระบบอีกครั้ง              │
│  เพื่อดำเนินการต่อ                   │
│                                     │
│  [เข้าสู่ระบบด้วย Google]            │
│                                     │
│  หรือ                               │
│                                     │
│  [Email] [Password]                 │
│  [เข้าสู่ระบบ]                       │
└─────────────────────────────────────┘
```

---

### 8.7 Browser Compatibility

**Unsupported Browsers:** IE11, old Safari (< 14)

**Display:**
```
┌─────────────────────────────────────┐
│  เบราว์เซอร์ของคุณไม่รองรับ           │
│                                     │
│  กรุณาใช้เบราว์เซอร์ที่รองรับ:        │
│  • Chrome (แนะนำ)                   │
│  • Firefox                          │
│  • Safari 14+                       │
│  • Edge                             │
│                                     │
│  [ดาวน์โหลด Chrome]                 │
└─────────────────────────────────────┘
```

---

### 8.8 JavaScript Disabled

**Display (noscript tag):**
```
┌─────────────────────────────────────┐
│  ChanceDee ต้องการ JavaScript       │
│                                     │
│  กรุณาเปิดใช้งาน JavaScript          │
│  ในเบราว์เซอร์ของคุณ                 │
└─────────────────────────────────────┘
```

---

## Summary: Exception Priority Matrix

| Priority | Category | Example | Handling |
|----------|----------|---------|----------|
| 🔴 Critical | Auth failure | Login blocked, session expired | Immediate resolution required |
| 🔴 Critical | Data loss risk | Form not saved, upload failed | Prevent loss + retry |
| 🟡 High | Action blocked | Profile incomplete, limit reached | Clear guidance to resolve |
| 🟡 High | Partial failure | Some items failed in bulk | Show partial success |
| 🟢 Medium | Empty state | No results, no data yet | Helpful guidance |
| 🟢 Medium | Degraded service | Slow search, no recommendations | Graceful degradation |
| 🔵 Low | Informational | Already done, duplicate action | Toast notification |

---

*End of Document*
