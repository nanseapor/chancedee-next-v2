# ChanceDee Layout Component Specification
## Section 4: Authentication Routes (6 routes)

**Version:** 2.0  
**Date:** December 2024

---

## 4.1 `/auth/login` - Login Page

**Shell:** Minimal Shell  
**Purpose:** Unified login with Google OAuth primary

### Layout

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Login Card** | Auth container | Center, max 400px | Full-width mobile | - | - |
| ↳ Logo | ChanceDee | Top, centered | - | → / | - |
| ↳ Title | "เข้าสู่ระบบ" | Center | - | - | h1 |
| ↳ Google Button | OAuth login | Full-width | - | OAuth flow | Prominent |
| ↳↳ Google Icon | G logo | Left | - | - | - |
| ↳↳ Button Text | "เข้าสู่ระบบด้วย Google" | Center | - | - | - |
| ↳ Divider | "หรือ" | Center | - | - | With lines |
| ↳ Email Form | Email/password | - | - | - | - |
| ↳↳ Email Input | อีเมล | Full-width | - | - | Validation |
| ↳↳ Password Input | รหัสผ่าน | Full-width | - | - | Show/hide toggle |
| ↳↳ Forgot Link | "ลืมรหัสผ่าน?" | Right-aligned | - | → /auth/reset | - |
| ↳↳ Login Button | Submit | Full-width | - | Submit login | Teal, "เข้าสู่ระบบ" |
| ↳ Register Prompt | New user CTA | Bottom | - | - | - |
| ↳↳ Text | "ยังไม่มีบัญชี?" | - | - | - | - |
| ↳↳ Register Link | "ลงทะเบียน" | - | - | → /auth/register | - |

### Query Parameters

| Param | Purpose | Behavior |
|-------|---------|----------|
| `?method=social` | Highlight Google | Scroll/focus Google button |
| `?method=email` | Email focus | Focus email input |
| `?redirect=[url]` | Return URL | Redirect after success |

### Error States

| Error | Display | Position |
|-------|---------|----------|
| Invalid credentials | "อีเมลหรือรหัสผ่านไม่ถูกต้อง" | Below password field |
| Account not found | "ไม่พบบัญชี" + register link | Below email field |
| Account suspended | Block card (see below) | Replace form |
| Account deleted | Block card | Replace form |
| Account pending | Redirect | → /auth/status?type=pending |
| Too many attempts | "ลองใหม่ใน 15 นาที" + countdown | Replace form |
| Google OAuth blocked | "Popup ถูกบล็อก" + fallback link | Toast |
| Google OAuth failed | "เข้าสู่ระบบด้วย Google ไม่สำเร็จ" | Toast |
| Google - email exists | "อีเมลนี้ลงทะเบียนด้วยรหัสผ่าน" | Modal prompt |
| Network error | "เชื่อมต่อไม่สำเร็จ" + retry | Toast |
| Already logged in | Redirect | → Dashboard |

### Account Suspended Block

| Component | Purpose | Action |
|-----------|---------|--------|
| Warning Icon | Visual alert | - |
| Title | "บัญชีของคุณถูกระงับชั่วคราว" | - |
| Description | "หากคุณคิดว่านี่เป็นข้อผิดพลาด กรุณาติดต่อฝ่ายสนับสนุน" | - |
| Support Button | "ติดต่อฝ่ายสนับสนุน" | Opens support |

---

## 4.2 `/auth/register` - Registration Page

**Shell:** Minimal Shell  
**Purpose:** User registration with role selection, multi-step wizard

### Step 1: Account Creation (`?step=account`)

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Register Card** | Wizard container | Center, max 500px | Full-width mobile | - | - |
| ↳ Logo | ChanceDee | Top | - | → / | - |
| ↳ Title | "สร้างบัญชี" | Center | - | - | - |
| ↳ Step Indicator | Progress | Below title | - | - | Step 1 of 2/3 |
| ↳ Role Selection | User type | - | - | - | - |
| ↳↳ Candidate Card | ผู้หางาน | - | - | Select role | Selectable card |
| ↳↳↳ Icon | Job seeker icon | - | - | - | - |
| ↳↳↳ Title | "ผู้หางาน" | - | - | - | - |
| ↳↳↳ Description | "ค้นหางานและสมัครงาน" | - | - | - | - |
| ↳↳ Company Card | บริษัท/นายจ้าง | - | - | Select role | Selectable card |
| ↳↳↳ Icon | Building icon | - | - | - | - |
| ↳↳↳ Title | "บริษัท/นายจ้าง" | - | - | - | - |
| ↳↳↳ Description | "ลงประกาศงานและหาพนักงาน" | - | - | - | - |
| ↳ Auth Form | Based on role | Below selection | - | - | - |

#### Candidate Auth (Google Primary)

| Component | Purpose | Position | Action | Notes/Edge Case |
|-----------|---------|----------|--------|-----------------|
| Google Button | "ลงทะเบียนด้วย Google" | Full-width | OAuth flow | - |
| Divider | "หรือ" | Center | - | - |
| Email Input | อีเมล | Full-width | - | - |
| Password Input | รหัสผ่าน | Full-width | - | - |
| Password Confirm | ยืนยันรหัสผ่าน | Full-width | - | - |
| Terms Checkbox | Accept terms | Full-width | - | - |
| Submit Button | "ลงทะเบียน" | Full-width | Submit | - |

#### Company Auth (Email Only)

| Component | Purpose | Position | Action | Notes/Edge Case |
|-----------|---------|----------|--------|-----------------|
| Security Note | Why no OAuth | Top | - | - |
| Email Input | อีเมล | Full-width | - | - |
| Password Input | รหัสผ่าน | Full-width | - | - |
| Password Confirm | ยืนยันรหัสผ่าน | Full-width | - | - |
| Terms Checkbox | Accept terms | Full-width | - | - |
| Next Button | "ถัดไป" | Full-width | Go to step 2 | - |

### Step 2: Company Details (`?step=company`) - Company Only

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Company Form Card** | Company info | Center, max 500px | Full-width mobile | - | - |
| ↳ Step Indicator | Step 2 of 3 | Top | - | - | - |
| ↳ Title | "ข้อมูลบริษัท" | - | - | - | - |
| ↳ Company Name | ชื่อบริษัท (ไทย) | Full-width | - | - | Required |
| ↳ Registration Number | เลขทะเบียนนิติบุคคล | Full-width | - | - | 13-digit validation |
| ↳ Industry Dropdown | ประเภทธุรกิจ | Full-width | - | Opens dropdown | From master data |
| ↳ Company Size | ขนาดบริษัท | Full-width | - | Opens dropdown | - |
| ↳ Document Upload | เอกสารทะเบียนบริษัท | Full-width | - | - | PDF/JPG/PNG, max 10MB |
| ↳↳ Upload Area | Drop zone | - | - | Opens file picker | Click or drag |
| ↳↳ File Preview | Uploaded file | - | - | Remove file | Name + size + remove |
| ↳ Back Button | "ย้อนกลับ" | Left | - | Go to step 1 | - |
| ↳ Submit Button | "ส่งข้อมูล" | Right | - | Submit | - |

### Step 3: Pending (`?step=pending`) - Company Only

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Confirmation Card** | Success state | Center, max 500px | Full-width mobile | - | - |
| ↳ Success Icon | ✓ checkmark | Top, centered | - | - | Green/Teal |
| ↳ Title | "บัญชีของคุณอยู่ระหว่างการตรวจสอบ" | Center | - | - | - |
| ↳ Description | Verification info | Center | - | - | - |
| ↳ Timeline | Expected duration | - | - | - | "1-2 วันทำการ" |
| ↳ Email Confirmation | Notification note | - | - | - | "เราจะแจ้งผลทางอีเมล" |
| ↳ Status Link | Check status | Bottom | - | → /auth/status?type=pending | - |

### Candidate Success Flow

After successful candidate registration:
- Google OAuth: Redirect to /candidates/[id]/profile?tab=onboarding
- Email: Redirect to /auth/verify (email verification sent)

### Error States

| Error | Display | Position |
|-------|---------|----------|
| Email exists | "อีเมลนี้ลงทะเบียนแล้ว" + login link | Below email |
| Weak password | Requirements checklist | Below password |
| Password mismatch | "รหัสผ่านไม่ตรงกัน" | Below confirm |
| Invalid email | "รูปแบบอีเมลไม่ถูกต้อง" | Below email |
| Invalid phone | "เบอร์โทรศัพท์ไม่ถูกต้อง" | Below phone |
| Terms not accepted | Highlight checkbox | - |
| Under 18 | "ต้องมีอายุ 18 ปีขึ้นไป" | Block submit |
| Invalid business reg | "เลขทะเบียนนิติบุคคลไม่ถูกต้อง" | Below field |
| Document too large | "ไฟล์ใหญ่เกิน 10MB" | Below upload |
| Invalid document type | "รองรับเฉพาะ PDF, JPG, PNG" | Below upload |
| Company tries OAuth | "บัญชีบริษัทต้องใช้อีเมล" | Block OAuth |
| Referral code invalid | Warning (non-blocking) | Below field |

### Password Requirements Display

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

## 4.3 `/auth/verify` - Email Verification

**Shell:** Minimal Shell  
**Purpose:** Email verification via link

### Layout

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Verification Card** | Status display | Center, max 400px | Full-width mobile | - | - |
| ↳ Status Content | Dynamic | Center | - | - | Based on state |

### State Variations

| State | Display | Action |
|-------|---------|--------|
| Loading | Spinner + "กำลังยืนยันอีเมล..." | - |
| Success | ✓ + "ยืนยันอีเมลสำเร็จ" + redirect countdown | Auto-redirect |
| Expired | ⚠ + "ลิงก์หมดอายุ" + resend button | Resend link |
| Invalid | ✗ + "ลิงก์ไม่ถูกต้อง" + contact support | Contact support |
| Already verified | ✓ + "ยืนยันแล้วก่อนหน้านี้" + redirect | Auto-redirect |

### Success State Components

| Component | Purpose | Action |
|-----------|---------|--------|
| Success Icon | ✓ green checkmark | - |
| Title | "ยืนยันอีเมลสำเร็จ" | - |
| Message | "กำลังพาคุณไปหน้าถัดไป..." | - |
| Countdown | "รอสักครู่... (3s)" | - |
| Manual Link | "หรือคลิกที่นี่" | → dashboard |

### Expired State Components

| Component | Purpose | Action |
|-----------|---------|--------|
| Warning Icon | ⚠ yellow | - |
| Title | "ลิงก์หมดอายุ" | - |
| Description | "ลิงก์ยืนยันมีอายุ 15 นาที" | - |
| Resend Button | "ส่งลิงก์ใหม่" | Resend email |

**Exception Components:**
- Network error: Retry option
- Resend rate limited: "ลองใหม่ใน X นาที"

---

## 4.4 `/auth/reset` - Password Reset

**Shell:** Minimal Shell  
**Purpose:** Password reset request and confirmation

### Request Phase (Default)

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Reset Card** | Request form | Center, max 400px | Full-width mobile | - | - |
| ↳ Title | "รีเซ็ตรหัสผ่าน" | Center | - | - | - |
| ↳ Description | Instructions | Center | - | - | - |
| ↳ Email Input | อีเมล | Full-width | - | - | - |
| ↳ Submit Button | "ส่งลิงก์รีเซ็ต" | Full-width | - | Submit | - |
| ↳ Back Link | "กลับไปหน้าเข้าสู่ระบบ" | Center | - | → /auth/login | - |

### Success Phase (`?status=success`)

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Success Card** | Confirmation | Center, max 400px | Full-width mobile | - | - |
| ↳ Email Icon | Visual | Top, centered | - | - | - |
| ↳ Title | "ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว" | Center | - | - | - |
| ↳ Description | Check email | Center | - | - | - |
| ↳ Email Display | Masked email | Center | - | - | "ส่งไปที่ a***@email.com" |
| ↳ Resend Link | If not received | Bottom | - | Resend email | Rate limited |
| ↳ Back Link | Return to login | Bottom | - | → /auth/login | - |

### New Password Phase (`?token=xxx`)

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **New Password Card** | Set password | Center, max 400px | Full-width mobile | - | - |
| ↳ Title | "ตั้งรหัสผ่านใหม่" | Center | - | - | - |
| ↳ Password Input | รหัสผ่านใหม่ | Full-width | - | - | With strength |
| ↳ Confirm Input | ยืนยันรหัสผ่าน | Full-width | - | - | - |
| ↳ Requirements | Password rules | Below inputs | - | - | Live validation |
| ↳ Submit Button | "ตั้งรหัสผ่าน" | Full-width | - | Submit | - |

### Error States

| Error | Display | Action |
|-------|---------|--------|
| Email not found | Same success (security) | - |
| Rate limited | "ลองใหม่ใน 15 นาที" | - |
| Link expired | "ลิงก์หมดอายุ" + request new | Request new link |
| Link used | "ลิงก์ถูกใช้แล้ว" | → /auth/login |
| Same as old | "ต้องไม่ซ้ำกับรหัสผ่านเดิม" | - |
| OAuth-only | "บัญชีนี้ใช้ Google เข้าสู่ระบบ" | → /auth/login |

---

## 4.5 `/auth/status` - Account Status

**Shell:** Minimal Shell  
**Purpose:** Display account status for pending or deleted accounts

### Pending State (`?type=pending`)

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Status Card** | Approval status | Center, max 500px | Full-width mobile | - | - |
| ↳ Status Icon | Hourglass/Clock | Top, centered | - | - | Animated |
| ↳ Title | "บัญชีอยู่ระหว่างการตรวจสอบ" | Center | - | - | - |
| ↳ Progress Stepper | Approval steps | - | - | - | Vertical |
| ↳↳ Step 1 | ✓ บัญชีสร้างแล้ว | - | - | - | Completed |
| ↳↳ Step 2 | ✓ ข้อมูลบริษัทส่งแล้ว | - | - | - | Completed |
| ↳↳ Step 3 | ⟳ กำลังตรวจสอบเอกสาร | - | - | - | In progress |
| ↳↳ Step 4 | ○ รอการอนุมัติ | - | - | - | Pending |
| ↳↳ Step 5 | ○ อนุมัติแล้ว | - | - | - | Pending |
| ↳ Estimated Time | "โดยประมาณ 1-2 วันทำการ" | Below stepper | - | - | - |
| ↳ What To Do | While waiting tips | - | - | - | - |
| ↳↳ Tip 1 | Browse candidates preview | - | - | - | - |
| ↳↳ Tip 2 | Prepare job drafts | - | - | - | - |
| ↳ Contact Section | Support info | Bottom | - | - | - |
| ↳ Logout Button | Exit | Bottom | - | Logout | - |

### Deleted State (`?type=deleted`)

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Deleted Card** | Confirmation | Center, max 400px | Full-width mobile | - | - |
| ↳ Info Icon | ℹ blue | Top, centered | - | - | - |
| ↳ Title | "บัญชีถูกลบแล้ว" | Center | - | - | - |
| ↳ Description | Deletion info | Center | - | - | - |
| ↳ Timeline | Data deletion schedule | - | - | - | "ข้อมูลจะถูกลบภายใน 30 วัน" |
| ↳ Recovery Option | Within grace period | - | - | - | - |
| ↳↳ Recovery Button | "กู้คืนบัญชี" | Full-width | - | Recover account | If within 30 days |
| ↳ New Account Link | "สร้างบัญชีใหม่" | Bottom | - | → /auth/register | - |

### Rejected State (Company)

| Component | Purpose | Position | Action |
|-----------|---------|----------|--------|
| Rejection Icon | ✗ red | Top | - |
| Title | "การลงทะเบียนไม่ได้รับการอนุมัติ" | Center | - |
| Reason | Admin-provided reason | Center | - |
| Description | "คุณสามารถแก้ไขและส่งใหม่ได้" | Center | - |
| Edit Button | "แก้ไขข้อมูล" | Left | Edit and resubmit |
| Support Button | "ติดต่อฝ่ายสนับสนุน" | Right | Contact support |

### Error States

| Error | Display | Action |
|-------|---------|--------|
| Not pending/deleted | Redirect to dashboard | Auto-redirect |
| Long pending (>5 days) | Escalation prompt | Contact support |
| Recovery expired | "ไม่สามารถกู้คืนได้" | - |

---

## 4.6 `/auth/settings` - Account Settings

**Shell:** Candidate Shell or Company Shell (based on user role)  
**Purpose:** Unified account settings

### Layout

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Page Header** | Title | Top | - | - | "การตั้งค่าบัญชี" |
| **Tab Navigation** | Section switcher | Below header | Dropdown mobile | - | - |
| ↳ การแจ้งเตือน | Notifications tab | - | - | ?tab=notifications | - |
| ↳ รหัสผ่าน | Password tab | - | - | ?tab=password | - |
| ↳ ความเป็นส่วนตัว | Privacy tab | - | - | ?tab=privacy | - |
| **Tab Content** | Selected section | Main | - | - | - |

### Notifications Tab (`?tab=notifications`)

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Email Settings** | Email preferences | - | - | - | - |
| ↳ Section Title | "การแจ้งเตือนทางอีเมล" | Top | - | - | - |
| ↳ Toggle Group | Notification types | - | - | - | - |
| ↳↳ Applications | ใบสมัครงาน | Row | - | Toggle | - |
| ↳↳ Messages | ข้อความใหม่ | Row | - | Toggle | - |
| ↳↳ Interviews | การนัดสัมภาษณ์ | Row | - | Toggle | - |
| ↳↳ Recommendations | งานแนะนำ | Row | - | Toggle | Candidates only |
| ↳↳ New Applications | ใบสมัครใหม่ | Row | - | Toggle | Companies only |
| ↳ Frequency | Email frequency | - | - | - | - |
| ↳↳ Radio Group | Options | - | - | - | - |
| ↳↳↳ Immediate | ทันที | - | - | Select | - |
| ↳↳↳ Daily | สรุปรายวัน | - | - | Select | - |
| ↳↳↳ Weekly | สรุปรายสัปดาห์ | - | - | Select | - |
| **Save Button** | Apply changes | Bottom | - | Save settings | "บันทึก" |

### Password Tab (`?tab=password`)

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Password Change** | Update password | - | - | - | - |
| ↳ Current Password | รหัสผ่านปัจจุบัน | Full-width | - | - | - |
| ↳ New Password | รหัสผ่านใหม่ | Full-width | - | - | Strength indicator |
| ↳ Confirm Password | ยืนยันรหัสผ่าน | Full-width | - | - | - |
| ↳ Update Button | "เปลี่ยนรหัสผ่าน" | - | - | Submit change | - |
| **Linked Accounts** | OAuth connections | - | - | - | - |
| ↳ Section Title | "บัญชีที่เชื่อมต่อ" | - | - | - | - |
| ↳ Google Row | Google account | - | - | - | - |
| ↳↳ Google Icon | G icon | Left | - | - | - |
| ↳↳ Status | Connected/Not connected | Center | - | - | - |
| ↳↳ Action | Link/Unlink | Right | - | Link/Unlink | - |

### Privacy Tab (`?tab=privacy`)

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Visibility** | Profile settings | - | - | - | Candidates only |
| ↳ Toggle | "ค้นหาได้โดยบริษัท" | Row | - | Toggle | - |
| ↳ Description | Visibility explanation | - | - | - | - |
| **Data Export** | Download data | - | - | - | - |
| ↳ Description | Export info | - | - | - | - |
| ↳ Export Button | "ขอข้อมูลของฉัน" | - | - | Request export | - |
| ↳ Status | If in progress | - | - | - | "กำลังเตรียมข้อมูล..." |
| **Account Deletion** | Delete account | - | - | - | Danger zone |
| ↳ Warning | Consequences | - | - | - | Red section |
| ↳ Delete Button | "ลบบัญชี" | - | - | Opens modal | Red |

### Delete Account Modal

| Component | Purpose | Position | Action |
|-----------|---------|----------|--------|
| Warning Icon | Alert | Top | - |
| Title | "ยืนยันการลบบัญชี" | Center | - |
| Consequences | What happens | Center | - |
| Confirm Input | Type phrase | Center | - |
| Cancel Button | "ยกเลิก" | Left | Close modal |
| Delete Button | "ลบบัญชี" | Right, red | Delete account |

**Exception Components:**
- Wrong current password: "รหัสผ่านปัจจุบันไม่ถูกต้อง"
- Email change conflict: "อีเมลนี้ใช้งานแล้ว"
- Delete with active jobs: "ปิดประกาศงานก่อนลบบัญชี" (companies)
- Unlink last auth method: "ต้องมีวิธีเข้าสู่ระบบอย่างน้อย 1 วิธี"

---

*End of Section 4: Authentication Routes*
