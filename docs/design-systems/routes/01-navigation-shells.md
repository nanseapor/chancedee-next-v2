# ChanceDee Layout Component Specification
## Section 2: Navigation Shells

**Version:** 2.0  
**Date:** December 2024  
**Updated:** Multi-role user support, role switching, color theming, 6-column table structure

---

## 2.1 Overview

ChanceDee uses 5 distinct navigation shells that adapt based on user role and authentication state. Each shell provides consistent navigation patterns while optimizing for the specific user context.

| Shell | User Context | Desktop Pattern | Mobile Pattern | Theme Color |
|-------|--------------|-----------------|----------------|-------------|
| Public | Unauthenticated | Minimal header | Hamburger menu | Neutral |
| Candidate | Authenticated job seekers | Left sidebar (240px) | Bottom tab bar | Teal (#3593a5) |
| Company | Authenticated employers | Left sidebar (260px) | Collapsible sidebar | Blue (#3b82f6) |
| Platform | Platform admins | Left sidebar (280px) | Desktop only | Purple (#8b5cf6) |
| Minimal | Auth flows, errors | Logo only | Logo only | Neutral |

### Multi-Role User Support

Users may have multiple roles simultaneously:
- Candidate profile (0..1)
- Company memberships (0..n) — can belong to multiple companies
- Platform admin role (0..1)

The shell displayed is determined by the **active role context**, not by what roles a user has. See Section 2.7 for selection logic.

---

## 2.2 Public Shell

**Used On:** /, /jobs, /jobs/[jobId], /companies, /companies/[id], /legal/*, /privacy/*, /help/*

### Desktop Layout (≥1024px)

```
┌────────────────────────────────────────────────────────────────┐
│ [Logo]        หางาน    บริษัท           เข้าสู่ระบบ [ลงทะเบียน] │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│                      Main Content Area                         │
│                      (max-width: 1200px)                       │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                          Footer                                │
└────────────────────────────────────────────────────────────────┘
```

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Public Header** | Main navigation | Top, sticky | - | - | Shadow after 50px scroll |
| ↳ Logo | ChanceDee branding | Left | Smaller mobile | → / | - |
| ↳ Nav Links | Main navigation | Center | Hidden mobile | - | - |
| ↳↳ หางาน | Job search link | - | - | → /jobs | - |
| ↳↳ บริษัท | Company directory | - | - | → /companies | - |
| ↳ Auth Buttons | Login/Register | Right | - | - | - |
| ↳↳ เข้าสู่ระบบ | Login link | - | - | → /auth/login | - |
| ↳↳ ลงทะเบียน | Register button | - | - | → /auth/register | Teal button |
| **Main Content** | Page content | Below header | - | - | - |
| **Footer** | Site links | Bottom | Stack mobile | - | - |
| ↳ Logo | Branding | Left section | - | → / | - |
| ↳ Link Columns | Site navigation | Center | 2 cols mobile | - | - |
| ↳↳ สำหรับผู้หางาน | Candidate links | Column 1 | - | - | - |
| ↳↳ สำหรับบริษัท | Company links | Column 2 | - | - | - |
| ↳↳ เกี่ยวกับ | About links | Column 3 | - | - | - |
| ↳↳ ช่วยเหลือ | Help links | Column 4 | - | - | - |
| ↳ Legal Links | Terms, Privacy | Bottom | - | → /legal/* | - |
| ↳ Social Icons | Facebook, Line, etc | Bottom right | - | ↗ External | - |
| ↳ Copyright | © ChanceDee | Bottom | - | - | - |

### Mobile Layout (<768px)

```
┌──────────────────────────┐
│ [Logo]              [☰]  │
├──────────────────────────┤
│                          │
│    Main Content Area     │
│                          │
├──────────────────────────┤
│        Footer            │
└──────────────────────────┘
```

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Mobile Header** | Compact navigation | Top, sticky | - | - | - |
| ↳ Logo | ChanceDee | Left | Smaller variant | → / | - |
| ↳ Hamburger Button | Open menu | Right | - | Opens drawer | ☰ icon |
| **Mobile Menu Drawer** | Full navigation | Right slide-in | - | - | - |
| ↳ Close Button | Dismiss | Top right | - | Closes drawer | × icon |
| ↳ Nav Links | Main links | Vertical list | - | - | Large touch targets |
| ↳↳ หางาน | Job search | - | - | → /jobs | - |
| ↳↳ บริษัท | Companies | - | - | → /companies | - |
| ↳ Divider | Separator | - | - | - | - |
| ↳ เข้าสู่ระบบ | Login | - | - | → /auth/login | - |
| ↳ ลงทะเบียน | Register | - | - | → /auth/register | Teal button |

---

## 2.3 Candidate Shell

**Used On:** /candidates/[id]/*, /chat, /notifications (when activeRole = candidate)

**Theme Color:** Teal (#3593a5)

### Desktop Layout (≥1024px)

```
┌────────────────────────────────────────────────────────────────┐
│  Breadcrumb                      [🔔] [Role Switcher ▼] [👤]   │
├──────────────┬─────────────────────────────────────────────────┤
│              │                                                  │
│   Profile    │              Main Content Area                   │
│   Summary    │                                                  │
│              │                                                  │
│  ─────────── │                                                  │
│              │                                                  │
│   Nav Menu   │                                                  │
│              │                                                  │
│  ─────────── │                                                  │
│              │                                                  │
│  Appointments│                                                  │
│              │                                                  │
├──────────────┴─────────────────────────────────────────────────┤
│                    [Chat FAB]                                   │
└────────────────────────────────────────────────────────────────┘
```

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Top Bar** | Context nav | Top, full-width | Hidden mobile | - | Teal accent line |
| ↳ Breadcrumb | Location indicator | Left | - | Navigate | Home > Section > Page |
| ↳ Notification Bell | Alerts | Right | - | → /notifications | Badge for unread count |
| ↳ Role Switcher | Switch context | Right | - | Opens dropdown | **See Section 2.10** |
| ↳ Profile Dropdown | Quick actions | Right | - | Opens menu | Name + avatar |
| **Left Sidebar** | Main navigation | Left, 240px fixed | Hidden mobile | - | Teal active indicator |
| ↳ Profile Summary Card | User overview | Top | - | - | - |
| ↳↳ Avatar | Profile photo | Center | - | → .../profile | Initials fallback |
| ↳↳ Name | Full name | Center | - | - | - |
| ↳↳ Completion Ring | Profile progress | Center | - | Opens checklist modal | Click for details |
| ↳ Nav Menu | Main links | Below profile | - | - | - |
| ↳↳ หน้าหลัก | Dashboard | - | - | → /candidates/[id] | - |
| ↳↳ หางาน | Job search | - | - | → /jobs | - |
| ↳↳ ใบสมัคร | Applications | - | - | → .../applications | Badge if new |
| ↳↳ บันทึกไว้ | Saved items | - | - | → .../saved | - |
| ↳↳ ข้อความ | Chat | - | - | → /chat | Badge if unread |
| ↳↳ การตั้งค่า | Settings | - | - | → .../settings | - |
| ↳ Appointment Widget | Upcoming interviews | Bottom | - | - | Max 3, "ดูทั้งหมด" |
| **Main Content** | Page content | Right of sidebar | Full-width mobile | - | - |
| **Chat FAB** | Quick messaging | Bottom-right, fixed | Same | Opens drawer | See Global Components |

### Mobile Layout (<768px)

```
┌──────────────────────────┐
│ [Logo]    [🔔]  [👤]     │
├──────────────────────────┤
│                          │
│    Main Content Area     │
│                          │
│                          │
├──────────────────────────┤
│ 🏠  💼  📄  💬  👤       │
└──────────────────────────┘
        Bottom Tab Bar
```

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Mobile Header** | Compact top bar | Top, sticky | - | - | Teal accent |
| ↳ Logo | ChanceDee | Left | Compact variant | → / | - |
| ↳ Notification Bell | Alerts | Right | - | → /notifications | Badge count |
| ↳ Profile Avatar | Quick access | Right | - | Opens profile menu | Includes Role Switcher |
| **Main Content** | Page content | Center | - | - | - |
| **Bottom Tab Bar** | Primary navigation | Bottom, fixed | - | - | Teal active state |
| ↳ หน้าหลัก | Dashboard | Tab 1 | - | → /candidates/[id] | 🏠 Home icon |
| ↳ งาน | Job search | Tab 2 | - | → /jobs | 💼 Briefcase icon |
| ↳ ใบสมัคร | Applications | Tab 3 | - | → .../applications | 📄 Document icon |
| ↳ ข้อความ | Chat | Tab 4 | - | → /chat | 💬 Chat icon + badge |
| ↳ โปรไฟล์ | Profile/Settings | Tab 5 | - | → .../profile | 👤 Person icon |

**Tab Bar States:**
- Active: Teal icon + label
- Inactive: Gray icon only
- Badge: Red circle with count (max 99+)

---

## 2.4 Company Shell

**Used On:** /companies/[id]/pending, /companies/[id]/dashboard/*, /chat, /notifications (when activeRole = company)

**Theme Color:** Blue (#3b82f6)

### Desktop Layout (≥1024px)

```
┌────────────────────────────────────────────────────────────────┐
│  Breadcrumb              [🔔] [Company ▼] [Role ▼] [👤]        │
├──────────────┬─────────────────────────────────────────────────┤
│              │                                                  │
│  Company     │              Main Content Area                   │
│  Branding    │                                                  │
│              │                                                  │
│  ─────────── │                                                  │
│              │                                                  │
│  [Post Job]  │                                                  │
│              │                                                  │
│  ─────────── │                                                  │
│              │                                                  │
│   Nav Menu   │                                                  │
│              │                                                  │
│  ─────────── │                                                  │
│              │                                                  │
│  Appointments│                                                  │
│              │                                                  │
├──────────────┴─────────────────────────────────────────────────┤
│                    [Chat FAB]                                   │
└────────────────────────────────────────────────────────────────┘
```

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Top Bar** | Context nav | Top, full-width | Compact mobile | - | Blue accent line |
| ↳ Breadcrumb | Location indicator | Left | Hidden mobile | Navigate | - |
| ↳ Notification Bell | Alerts | Right | - | → /notifications | Badge count |
| ↳ Company Switcher | Switch company | Right | - | Opens dropdown | **Only if multiple companies** |
| ↳ Role Switcher | Switch context | Right | - | Opens dropdown | **See Section 2.10** |
| ↳ User Dropdown | Account menu | Right | - | Opens menu | Name + role badge |
| **Left Sidebar** | Main navigation | Left, 260px fixed | Collapsible mobile | - | Blue active indicator |
| ↳ Company Header | Branding | Top | - | - | - |
| ↳↳ Company Logo | Logo | Left | - | → .../dashboard | Initials fallback |
| ↳↳ Company Name | Name | Right | - | - | Truncate if long |
| ↳ User Badge | Current user | Below header | - | - | - |
| ↳↳ Avatar | User photo | Left | - | - | - |
| ↳↳ Name | User name | - | - | - | - |
| ↳↳ Role Badge | Admin/HR/Recruiter | - | - | - | Color-coded |
| ↳ Quick Action | Post job button | Prominent | - | → .../dashboard/jobs/new | - |
| ↳↳ ลงประกาศงาน | CTA button | Full-width | - | → .../dashboard/jobs/new | Blue button |
| ↳ Nav Menu | Main links | Below CTA | - | - | - |
| ↳↳ ภาพรวม | Dashboard | - | - | → .../dashboard | - |
| ↳↳ ประกาศงาน | Jobs | - | - | → .../dashboard/jobs | - |
| ↳↳ ใบสมัคร | Applications | - | - | → .../dashboard/applications | Badge if new |
| ↳↳ ค้นหาผู้สมัคร | Candidate search | - | - | → .../dashboard/candidates | - |
| ↳↳ ทีมงาน | Team | - | - | → .../dashboard/team | - |
| ↳↳ การตั้งค่า | Settings | - | - | → .../dashboard/settings | - |
| ↳ Appointment Widget | Interviews | Bottom | - | - | Max 3 |
| **Main Content** | Page content | Right of sidebar | - | - | - |
| **Chat FAB** | Messaging | Bottom-right | Same | Opens drawer | - |

### Mobile Layout (<768px)

```
┌──────────────────────────┐
│ [☰]  [Company]    [🔔]   │
├──────────────────────────┤
│                          │
│    Main Content Area     │
│                          │
├──────────────────────────┤
│ [View Apps]  [Post Job]  │
└──────────────────────────┘
     Bottom Action Bar
```

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Mobile Header** | Top bar | Top, sticky | - | - | Blue accent |
| ↳ Hamburger Button | Open sidebar | Left | - | Opens sidebar | - |
| ↳ Company Name | Current context | Center | - | - | Truncate |
| ↳ Notification Bell | Alerts | Right | - | → /notifications | - |
| **Collapsible Sidebar** | Full nav | Left slide-in | - | - | Same as desktop + Role Switcher |
| **Main Content** | Page content | Center | - | - | - |
| **Bottom Action Bar** | Quick actions | Bottom, fixed | - | - | - |
| ↳ View Apps Button | Applications | Left | - | → .../dashboard/applications | Badge count |
| ↳ Post Job Button | Create job | Right | - | → .../dashboard/jobs/new | Blue button |

---

## 2.5 Platform Admin Shell

**Used On:** /platform, /platform/*

**Theme Color:** Purple (#8b5cf6)

**Access:** Requires platform admin role + 2FA verified

### Desktop Layout (≥1024px)

```
┌────────────────────────────────────────────────────────────────┐
│  [Search all...]                    [🔔] [Role ▼] [👤 Admin]   │
├──────────────┬─────────────────────────────────────────────────┤
│              │                                                  │
│  ChanceDee   │              Main Content Area                   │
│  Admin       │                                                  │
│              │                                                  │
│  ─────────── │                                                  │
│              │                                                  │
│  User Info   │                                                  │
│  + Role      │                                                  │
│              │                                                  │
│  ─────────── │                                                  │
│              │                                                  │
│  Operations  │                                                  │
│  ─────────── │                                                  │
│  Moderation  │                                                  │
│  ─────────── │                                                  │
│  Analytics   │                                                  │
│  ─────────── │                                                  │
│  System      │                                                  │
│  (Admin+)    │                                                  │
│              │                                                  │
└──────────────┴─────────────────────────────────────────────────┘
```

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Top Bar** | Admin header | Top, full-width | Desktop only | - | Purple accent line |
| ↳ Global Search | Search all entities | Left | - | Submit search | Candidates, Companies, Jobs |
| ↳ Notification Bell | System alerts | Right | - | Opens notifications | - |
| ↳ Role Switcher | Switch context | Right | - | Opens dropdown | **See Section 2.10** |
| ↳ User Dropdown | Account | Right | - | Opens menu | Role + 2FA badge |
| **Left Sidebar** | Admin navigation | Left, 280px fixed | Desktop only | - | Purple active indicator |
| ↳ Admin Badge | ChanceDee Admin | Top | - | → /platform | Admin logo/text |
| ↳ User Info | Current admin | Below badge | - | - | - |
| ↳↳ Avatar | Photo | Left | - | - | - |
| ↳↳ Name | Full name | - | - | - | - |
| ↳↳ Role Badge | Staff/Admin/Super | - | - | - | Color-coded |
| ↳ Operations Group | Core functions | - | - | - | Label: "Operations" |
| ↳↳ ภาพรวม | Dashboard | - | - | → /platform/dashboard | - |
| ↳↳ บริษัท | Companies | - | - | → /platform/companies | - |
| ↳↳ ผู้สมัคร | Candidates | - | - | → /platform/candidates | - |
| ↳↳ ประกาศงาน | Jobs | - | - | → /platform/jobs | - |
| ↳ Moderation Group | Review functions | - | - | - | Label: "Moderation" |
| ↳↳ คำขออนุมัติ | Approval queue | - | - | → /platform/dashboard?tab=requests | Badge for pending |
| ↳↳ รายงาน | Reports | - | - | → /platform/reports | Badge for new |
| ↳ Analytics Group | Insights | - | - | - | Label: "Analytics" |
| ↳↳ สถิติแพลตฟอร์ม | Analytics | - | - | → /platform/analytics | - |
| ↳ System Group | Config (Admin+) | - | - | - | Hidden for Staff role |
| ↳↳ Master Data | Reference data | - | - | → /platform/system?tab=master-data | - |
| ↳↳ Loyalty | Coin system | - | - | → /platform/system?tab=loyalty | - |
| ↳↳ การตั้งค่า | Settings | - | - | → /platform/system?tab=settings | Super-Admin only |
| **Main Content** | Admin content | Right of sidebar | - | - | - |

### Role-Based Visibility

| Section | Staff | Admin | Super-Admin |
|---------|-------|-------|-------------|
| Operations | ✓ | ✓ | ✓ |
| Moderation | ✓ | ✓ | ✓ |
| Analytics | ✓ | ✓ | ✓ |
| System - Master Data | ✗ | ✓ | ✓ |
| System - Loyalty | ✗ | ✓ | ✓ |
| System - Settings | ✗ | ✗ | ✓ |

### Mobile Handling

Platform Admin is **desktop-only**. Mobile access shows:

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Mobile Block Screen** | Restrict access | Full viewport | - | - | - |
| ↳ Desktop Icon | Visual indicator | Center | - | - | - |
| ↳ Message | "แอดมินใช้งานได้บนคอมพิวเตอร์เท่านั้น" | Center | - | - | - |
| ↳ Switch Role Button | "สลับไปบทบาทอื่น" | Center | - | Opens Role Switcher | - |
| ↳ Logout Button | Exit admin | Center | - | Logout | - |

---

## 2.6 Minimal Shell

**Used On:** /auth/*, error pages

### Layout

```
┌────────────────────────────────────────────────────────────────┐
│                         [Logo]                                  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│                                                                │
│                      Centered Content                          │
│                      (max-width varies)                        │
│                                                                │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│              Minimal Footer (legal links only)                  │
└────────────────────────────────────────────────────────────────┘
```

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Minimal Header** | Branding only | Top, centered | Same | - | - |
| ↳ Logo | ChanceDee | Center | Smaller mobile | → / | - |
| **Main Content** | Auth/Error content | Center | Same | - | - |
| ↳ Content Card | Form/Message container | Center, max-width | Full-width mobile | - | - |
| **Minimal Footer** | Legal links | Bottom | Same | - | - |
| ↳ Legal Links | Terms, Privacy | Center | - | → /legal/* | - |

**Content Max-Widths:**

| Route Type | Max Width |
|------------|-----------|
| Login/Register | 400px |
| Multi-step wizard | 600px |
| Error pages | 500px |
| Verification | 400px |

---

## 2.7 Shell Selection Logic

Shell selection is based on **route pattern** first, then **active role context** for authenticated users.

```
// Primary: Route-based selection
if (route starts with /platform/*) → Platform Admin Shell
else if (route starts with /auth/* or is error page) → Minimal Shell
else if (route starts with /candidates/[id]/*) → Candidate Shell
else if (route starts with /companies/[id]/dashboard/*) → Company Shell

// Secondary: Context-based for shared routes
else if (user is authenticated) {
    // Shared routes like /chat, /notifications, /jobs
    use activeRole from global state → Candidate or Company Shell
} 

// Fallback
else → Public Shell
```

### Route-to-Shell Mapping

| Route Pattern | Shell | Notes |
|---------------|-------|-------|
| `/` | Public | Homepage |
| `/jobs`, `/jobs/[id]` | Public or Candidate | Candidate shell if logged in |
| `/companies`, `/companies/[id]` | Public | Company public profile |
| `/candidates/[id]/*` | Candidate | All candidate dashboard routes |
| `/companies/[id]/pending` | Company | Pending approval page |
| `/companies/[id]/dashboard/*` | Company | All company dashboard routes |
| `/chat` | Candidate or Company | Based on activeRole |
| `/notifications` | Candidate or Company | Based on activeRole |
| `/platform/*` | Platform Admin | Requires admin role + 2FA |
| `/auth/*` | Minimal | All auth flows |

### Active Role Determination

For routes that depend on `activeRole` (like /chat, /notifications):

```
function getActiveRole(user, route):
    // 1. Route explicitly defines context
    if (route contains /candidates/) return 'candidate'
    if (route contains /companies/[id]/dashboard/) return 'company'
    
    // 2. Check global state
    if (globalState.activeRole) return globalState.activeRole
    
    // 3. Check persisted preference
    if (localStorage.lastActiveRole) return localStorage.lastActiveRole
    
    // 4. Check user's default setting
    if (user.defaultRole) return user.defaultRole
    
    // 5. Fallback: first available role
    if (user.hasCandidate) return 'candidate'
    if (user.companies.length > 0) return 'company'
    
    // Edge case: should not happen
    return null
```

---

## 2.8 Responsive Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Mobile | < 768px | Bottom tabs / Hamburger |
| Tablet | 768-1023px | Collapsible sidebar |
| Desktop | ≥ 1024px | Full sidebar |
| Large | ≥ 1440px | Wider content area |

---

## 2.9 Shell Transitions

### Authentication State Change

| Transition | Animation | Duration |
|------------|-----------|----------|
| Login → Dashboard | Fade + slide sidebar in | 300ms |
| Logout → Public | Fade sidebar out | 200ms |
| Session expired → Re-auth modal | Modal overlay | Instant |

### Role Switch Transitions

| Transition | Animation | Color Change |
|------------|-----------|--------------|
| Candidate → Company | Sidebar morph + color shift | Teal → Blue |
| Company → Candidate | Sidebar morph + color shift | Blue → Teal |
| Any → Platform Admin | Full page transition | → Purple |
| Company → Company (different) | Sidebar refresh only | Blue (same) |

**Role Switch Behavior:**
1. User clicks Role Switcher
2. Selection triggers `setActiveRole(newRole)` in global state
3. Persist to `localStorage.lastActiveRole`
4. If route is role-agnostic (/chat, /notifications): Shell morphs, stay on page
5. If route is role-specific: Redirect to new role's dashboard
6. Show toast: "สลับเป็น [Role Name] แล้ว"

---

## 2.10 Role Switcher Component

**Appears in:** Candidate Shell, Company Shell, Platform Admin Shell (top bar, right section)

**Purpose:** Allow multi-role users to switch active context without logging out

### Visibility Rules

| User Type | Role Switcher Shown? |
|-----------|----------------------|
| Single role (candidate only) | Hidden |
| Single role (one company only) | Hidden |
| Multi-role (candidate + company) | ✓ Shown |
| Multi-role (candidate + multiple companies) | ✓ Shown |
| Platform admin (with other roles) | ✓ Shown |

### Desktop Component

```
┌─────────────────────────────┐
│  [Icon] Current Role    ▼  │  ← Trigger button
└─────────────────────────────┘
            │
            ▼
┌─────────────────────────────┐
│  ✓ 👤 ผู้หางาน              │  ← Current (checked)
│    🏢 บริษัท ABC            │
│    🏢 บริษัท XYZ            │
│  ─────────────────────────  │
│    🛡️ แอดมิน               │  ← If has admin role
│  ─────────────────────────  │
│    ⚙️ จัดการบัญชี           │  ← → /auth/settings
└─────────────────────────────┘
```

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Trigger Button** | Open dropdown | Header right | - | Opens dropdown | Shows current role |
| ↳ Role Icon | Visual indicator | Left | - | - | 👤 candidate, 🏢 company, 🛡️ admin |
| ↳ Role Name | Current context | Center | - | - | "ผู้หางาน" or company name |
| ↳ Chevron | Dropdown indicator | Right | - | - | ▼ rotates on open |
| **Dropdown Menu** | Role options | Below trigger | - | - | - |
| ↳ Role Option | Each available role | Row | - | Switches role | - |
| ↳↳ Check Mark | Active indicator | Left | - | - | ✓ on current role |
| ↳↳ Icon | Role type | Left | - | - | 👤 / 🏢 / 🛡️ |
| ↳↳ Name | Role/Company name | Center | - | - | - |
| ↳ Divider | Section separator | - | - | - | Before admin, before settings |
| ↳ Manage Account | Settings link | Bottom | - | → /auth/settings?tab=account | - |

### Mobile Behavior

On mobile, Role Switcher appears in:
- **Candidate Shell:** Inside profile menu (tap avatar)
- **Company Shell:** Inside hamburger sidebar (top section)
- **Platform Admin Shell:** N/A (desktop only)

### State Management

```typescript
// Global state (React Context / Redux / Zustand)
interface RoleState {
  activeRole: 'candidate' | 'company' | 'admin';
  activeCompanyId?: string; // If role is 'company'
  availableRoles: Role[];
}

// Actions
setActiveRole(role, companyId?) → updates state + localStorage
```

### Theme Color Application

When role switches, apply theme color to:
- Top bar accent line (2px bottom border)
- Sidebar active indicator
- Primary buttons (optional, can keep brand colors)
- Mobile tab bar active state

| Role | Accent Color | CSS Variable |
|------|--------------|--------------|
| Candidate | Teal #3593a5 | `--color-role-candidate` |
| Company | Blue #3b82f6 | `--color-role-company` |
| Admin | Purple #8b5cf6 | `--color-role-admin` |

---

## 2.11 Company Switcher Component

**Appears in:** Company Shell only (top bar, between notification bell and role switcher)

**Purpose:** For users with multiple company memberships, switch between companies

### Visibility Rules

| User Type | Company Switcher Shown? |
|-----------|-------------------------|
| Member of 1 company | Hidden |
| Member of 2+ companies | ✓ Shown |

### Component

```
┌─────────────────────────────┐
│  [Logo] Company ABC     ▼  │  ← Trigger
└─────────────────────────────┘
            │
            ▼
┌─────────────────────────────┐
│  ✓ 🏢 บริษัท ABC           │  ← Current
│    🏢 บริษัท XYZ           │
│  ─────────────────────────  │
│    + เพิ่ม/เข้าร่วมบริษัท   │  ← Create or join
└─────────────────────────────┘
```

| Component | Purpose | Position | Responsive | Action | Notes/Edge Case |
|-----------|---------|----------|------------|--------|-----------------|
| **Trigger Button** | Open dropdown | Header | - | Opens dropdown | Shows company logo + name |
| ↳ Company Logo | Visual | Left | - | - | 24×24, rounded |
| ↳ Company Name | Current company | Center | - | - | Truncate if > 20 chars |
| **Dropdown Menu** | Company list | Below trigger | - | - | - |
| ↳ Company Option | Each membership | Row | - | Switches company | - |
| ↳↳ Check Mark | Current indicator | Left | - | - | ✓ |
| ↳↳ Logo | Company logo | Left | - | - | Initials fallback |
| ↳↳ Name | Company name | Center | - | - | - |
| ↳↳ Role Badge | Your role there | Right | - | - | Admin/HR/Recruiter (small) |
| ↳ Add Company | Create/Join | Bottom | - | → /auth/register?role=company | Or join flow |

### Switch Behavior

1. User selects different company
2. Update `activeCompanyId` in global state
3. Redirect to `/companies/[newId]/dashboard`
4. Sidebar refreshes with new company branding
5. Toast: "สลับไปที่ [Company Name] แล้ว"

---

## 2.12 Post-Login Routing

When a user logs in, determine where to send them:

```
function getPostLoginRoute(user, redirectParam):
    // 1. Honor explicit redirect (from protected route)
    if (redirectParam && isValidRedirect(redirectParam)):
        return redirectParam
    
    // 2. Check for pending invitations
    if (user.pendingInvitation):
        return '/auth/invite/process/' + user.pendingInvitation.token
    
    // 3. Platform admin with 2FA required
    if (user.isPlatformAdmin && !user.is2FAVerified):
        return '/auth/2fa?redirect=/platform/dashboard'
    
    // 4. Use last active context
    if (localStorage.lastActiveRole === 'candidate'):
        return '/candidates/' + user.candidateId
    if (localStorage.lastActiveRole === 'company'):
        return '/companies/' + localStorage.lastCompanyId + '/dashboard'
    if (localStorage.lastActiveRole === 'admin'):
        return '/platform/dashboard'
    
    // 5. Use default role setting
    if (user.defaultRole):
        return getDashboardForRole(user.defaultRole)
    
    // 6. Smart default: most recently used or first available
    if (user.hasCandidate):
        return '/candidates/' + user.candidateId
    if (user.companies.length > 0):
        return '/companies/' + user.companies[0].id + '/dashboard'
    
    // 7. Edge case: new user with no profile
    return '/auth/register?step=profile'
```

### First-Time Multi-Role User

When a user logs in with multiple roles for the first time:
1. Route to the "primary" role (candidate if exists, else first company)
2. Show toast: "คุณมีหลายบทบาท สลับได้ที่เมนูด้านบน 👆"
3. Subtle pulse animation on Role Switcher (first time only)

---

*End of Section 2: Navigation Shells*
