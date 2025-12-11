# Error Pages

## Overview

Error page components display when something goes wrong — whether it's a missing page, server error, or access restriction. These pages provide clear feedback and actionable next steps.

**Design Reference:** See `chancedee-design-guidelines.md` for colors, typography, and button hierarchy.

---

# 1. NotFoundPage (404)

## Description

Displayed when a user navigates to a URL that doesn't exist or a resource that has been removed.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| type | `'page'` \| `'job'` \| `'company'` \| `'candidate'` \| `'application'` | no | `'page'` | Context for messaging |
| showSearch | `boolean` | no | `true` | Show search input |
| suggestedLinks | `LinkConfig[]` | no | — | Helpful navigation links |

## Visual Structure

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                                                         │
│                    [Illustration]                       │
│                                                         │
│                        404                              │
│                                                         │
│              ไม่พบหน้าที่คุณต้องการ                       │
│              Page not found                             │
│                                                         │
│      หน้านี้อาจถูกลบ ย้าย หรือไม่เคยมีอยู่                 │
│      This page may have been removed,                   │
│      moved, or never existed.                           │
│                                                         │
│      🔍 ค้นหางาน...                                     │
│         Search jobs...                                  │
│                                                         │
│              [กลับหน้าหลัก]                              │
│              Go to Homepage                             │
│                                                         │
│      ─────────────────────────────────                  │
│                                                         │
│      หรือลองดูหน้าเหล่านี้:                               │
│      Or try these pages:                                │
│                                                         │
│      • หางาน        • บริษัท        • ศูนย์ช่วยเหลือ     │
│        Find Jobs     Companies      Help Center         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Context-Specific Messages

| Type | Title (Thai) | English | Description (Thai) | English |
|------|--------------|---------|-------------------|---------|
| `page` | ไม่พบหน้าที่คุณต้องการ | Page not found | หน้านี้อาจถูกลบ ย้าย หรือไม่เคยมีอยู่ | This page may have been removed, moved, or never existed |
| `job` | ไม่พบประกาศงานนี้ | Job not found | ประกาศงานนี้อาจถูกปิดหรือลบไปแล้ว | This job posting may have been closed or removed |
| `company` | ไม่พบบริษัทนี้ | Company not found | บริษัทนี้อาจถูกลบออกจากระบบ | This company may have been removed from the system |
| `candidate` | ไม่พบโปรไฟล์นี้ | Profile not found | โปรไฟล์นี้อาจถูกลบหรือตั้งค่าเป็นส่วนตัว | This profile may have been deleted or set to private |
| `application` | ไม่พบใบสมัครนี้ | Application not found | ใบสมัครนี้อาจถูกถอนหรือลบไปแล้ว | This application may have been withdrawn or removed |

## Context-Specific Actions

| Type | Primary Action (Thai) | English | Secondary Action (Thai) | English |
|------|----------------------|---------|------------------------|---------|
| `page` | กลับหน้าหลัก | Go to Homepage | — | — |
| `job` | ค้นหางานอื่น | Search Other Jobs | กลับหน้าหลัก | Go to Homepage |
| `company` | ดูบริษัททั้งหมด | View All Companies | กลับหน้าหลัก | Go to Homepage |
| `candidate` | กลับ | Go Back | — | — |
| `application` | ดูใบสมัครทั้งหมด | View All Applications | กลับหน้าหลัก | Go to Homepage |

## Suggested Links

| Link | Thai | English | Path |
|------|------|---------|------|
| Jobs | หางาน | Find Jobs | `/jobs` |
| Companies | บริษัท | Companies | `/companies` |
| Help | ศูนย์ช่วยเหลือ | Help Center | `/help` |
| Home | หน้าหลัก | Home | `/` |

---

# 2. ServerErrorPage (500)

## Description

Displayed when a server error occurs. Provides reassurance and options to retry or get help.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| errorId | `string` | no | — | Error reference ID for support |
| onRetry | `() => void` | no | — | Retry action handler |

## Visual Structure

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                                                         │
│                    [Illustration]                       │
│                      (broken robot)                     │
│                                                         │
│              เกิดข้อผิดพลาดบางอย่าง                       │
│              Something went wrong                       │
│                                                         │
│      เราพบปัญหาในการโหลดหน้านี้                           │
│      กรุณาลองใหม่อีกครั้ง หรือกลับมาใหม่ภายหลัง           │
│                                                         │
│      We encountered a problem loading this page.        │
│      Please try again or come back later.               │
│                                                         │
│              [ลองใหม่]     [กลับหน้าหลัก]                │
│              Try Again     Go to Homepage               │
│                                                         │
│      ─────────────────────────────────                  │
│                                                         │
│      หากปัญหายังคงอยู่ กรุณาติดต่อเรา                     │
│      If the problem persists, please contact us         │
│                                                         │
│      📧 support@chancedee.com                           │
│      Error ID: ERR-ABC123                               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Elements

| Element | Condition | Tailwind |
|---------|-----------|----------|
| Illustration | always | `w-48 h-48 mx-auto mb-8` |
| Title | always | `text-2xl font-semibold text-gray-900` |
| Description | always | `text-gray-600 mt-2 max-w-md mx-auto` |
| Retry button | `onRetry` provided | Primary button |
| Home button | always | Secondary button |
| Support section | always | `text-sm text-gray-500 mt-8` |
| Error ID | `errorId` provided | `font-mono text-xs text-gray-400` |

---

# 3. MaintenancePage (503)

## Description

Displayed when the site is undergoing scheduled maintenance.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| estimatedEnd | `Date` | no | — | Expected completion time |
| message | `string` | no | — | Custom message |

## Visual Structure

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                                                         │
│                    [Illustration]                       │
│                    (maintenance)                        │
│                                                         │
│              กำลังปรับปรุงระบบ                            │
│              Under Maintenance                          │
│                                                         │
│      เรากำลังปรับปรุงระบบเพื่อประสบการณ์ที่ดีขึ้น           │
│      We're improving our system for a better            │
│      experience.                                        │
│                                                         │
│      คาดว่าจะกลับมาใช้งานได้ภายใน:                        │
│      Expected to be back by:                            │
│                                                         │
│              ⏰ 15:00 น. (อีก 30 นาที)                   │
│                 3:00 PM (30 minutes)                    │
│                                                         │
│      ─────────────────────────────────                  │
│                                                         │
│      ติดตามข่าวสารได้ที่:                                 │
│      Follow us for updates:                             │
│                                                         │
│      [Facebook]  [Twitter]  [Line]                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Countdown Display

| Time Remaining | Display (Thai) | English |
|----------------|----------------|---------|
| > 1 hour | "อีก {n} ชั่วโมง" | "{n} hours" |
| 1-60 minutes | "อีก {n} นาที" | "{n} minutes" |
| < 1 minute | "เกือบเสร็จแล้ว" | "Almost done" |
| Past estimated | "เร็วๆ นี้" | "Soon" |

---

# 4. ForbiddenPage (403)

## Description

Displayed when a user attempts to access a resource they don't have permission to view.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| reason | `'auth'` \| `'role'` \| `'suspended'` \| `'private'` | no | `'auth'` | Access denial reason |

## Visual Structure

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                                                         │
│                    [Illustration]                       │
│                       (lock)                            │
│                                                         │
│              ไม่มีสิทธิ์เข้าถึง                           │
│              Access Denied                              │
│                                                         │
│      คุณไม่มีสิทธิ์เข้าถึงหน้านี้                          │
│      You don't have permission to access this page.     │
│                                                         │
│              [เข้าสู่ระบบ]     [กลับ]                    │
│              Log In           Go Back                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Reason-Specific Messages

| Reason | Title (Thai) | English | Description (Thai) | English |
|--------|--------------|---------|-------------------|---------|
| `auth` | กรุณาเข้าสู่ระบบ | Please log in | คุณต้องเข้าสู่ระบบเพื่อเข้าถึงหน้านี้ | You need to log in to access this page |
| `role` | ไม่มีสิทธิ์เข้าถึง | Access Denied | คุณไม่มีสิทธิ์เข้าถึงส่วนนี้ของระบบ | You don't have permission to access this section |
| `suspended` | บัญชีถูกระงับ | Account Suspended | บัญชีของคุณถูกระงับชั่วคราว กรุณาติดต่อฝ่ายสนับสนุน | Your account has been suspended. Please contact support |
| `private` | เนื้อหาส่วนตัว | Private Content | เนื้อหานี้ถูกตั้งค่าเป็นส่วนตัว | This content has been set to private |

## Reason-Specific Actions

| Reason | Primary Action (Thai) | English | Path/Handler |
|--------|----------------------|---------|--------------|
| `auth` | เข้าสู่ระบบ | Log In | `/auth/login?redirect={current}` |
| `role` | กลับ | Go Back | `history.back()` |
| `suspended` | ติดต่อฝ่ายสนับสนุน | Contact Support | `/help/contact` |
| `private` | กลับ | Go Back | `history.back()` |

---

# 5. OfflinePage

## Description

Displayed when the user loses internet connection (PWA/offline support).

## Visual Structure

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                                                         │
│                    [Illustration]                       │
│                   (no connection)                       │
│                                                         │
│              ไม่มีการเชื่อมต่ออินเทอร์เน็ต                 │
│              No Internet Connection                     │
│                                                         │
│      กรุณาตรวจสอบการเชื่อมต่อและลองใหม่อีกครั้ง            │
│      Please check your connection and try again.        │
│                                                         │
│                    [ลองใหม่]                            │
│                    Try Again                            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Auto-Retry Behavior

| Event | Action |
|-------|--------|
| Connection restored | Auto-reload page |
| Manual retry click | Check connection, reload if restored |
| Still offline after retry | Show message "ยังไม่มีการเชื่อมต่อ" / "Still offline" |

---

# 6. SessionExpiredPage

## Description

Displayed when the user's session has expired and they need to log in again.

## Visual Structure

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                                                         │
│                    [Illustration]                       │
│                      (clock)                            │
│                                                         │
│              เซสชันหมดอายุ                               │
│              Session Expired                            │
│                                                         │
│      เซสชันของคุณหมดอายุแล้ว กรุณาเข้าสู่ระบบใหม่          │
│      Your session has expired. Please log in again.     │
│                                                         │
│                 [เข้าสู่ระบบอีกครั้ง]                     │
│                 Log In Again                            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Behavior

| Event | Action |
|-------|--------|
| Page load | Clear local auth tokens |
| Login click | Redirect to `/auth/login?redirect={originalUrl}` |
| After login | Return to original intended page |

---

# 7. Shared Patterns

## Layout

All error pages share a consistent centered layout:

```css
.error-page {
  @apply min-h-screen flex flex-col items-center justify-center;
  @apply px-4 py-12 bg-gray-50;
}

.error-content {
  @apply text-center max-w-lg;
}
```

## Illustration Guidelines

| Error Type | Illustration Mood | Colors |
|------------|-------------------|--------|
| 404 | Confused, searching | Muted teal + gray |
| 500 | Apologetic, broken | Muted orange + gray |
| 503 | Working, progress | Teal + amber |
| 403 | Locked, restricted | Gray + muted red |
| Offline | Disconnected | Gray |
| Session | Time-related | Gray + amber |

## Typography

| Element | Tailwind Classes |
|---------|------------------|
| Error code | `text-6xl font-bold text-gray-200` (optional) |
| Title | `text-2xl font-semibold text-gray-900 mt-6` |
| Description | `text-gray-600 mt-2 max-w-md mx-auto` |
| Support info | `text-sm text-gray-500` |

## Button Layout

| Buttons | Layout |
|---------|--------|
| Single | Centered primary button |
| Two | Side by side, primary + secondary |
| With links | Buttons above, text links below |

```css
.error-actions {
  @apply flex flex-col sm:flex-row gap-3 justify-center mt-8;
}

.error-links {
  @apply flex flex-wrap gap-4 justify-center mt-6 text-sm;
}
```

## Mobile Considerations

| Breakpoint | Adjustments |
|------------|-------------|
| Mobile | Smaller illustration, stacked buttons |
| Tablet+ | Normal illustration, inline buttons |

## Accessibility

| Element | Attribute | Value |
|---------|-----------|-------|
| Page container | `role` | `main` |
| Error title | `role` | `alert` |
| Illustration | `aria-hidden` | `true` |
| Retry button | `aria-label` | "ลองโหลดหน้านี้อีกครั้ง" / "Try loading this page again" |

## Analytics Events

| Error Type | Event Name | Properties |
|------------|------------|------------|
| 404 | `page_not_found` | `path`, `referrer` |
| 500 | `server_error` | `error_id`, `path` |
| 403 | `access_denied` | `reason`, `path` |

---

*End of Error Pages Organism Specification*
