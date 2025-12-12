# ChanceDee Layout Component Specification
## Section 9: Component Index

**Version:** 1.0  
**Date:** December 2024

---

## 9.1 Overview

This index provides a categorized summary of all components defined across the 45 routes.

### Document Structure

| Section | File | Content |
|---------|------|---------|
| 1 | 00-global-components.md | Global components (14 types) |
| 2 | 01-navigation-shells.md | Navigation shells (5 shells) |
| 3 | 02-public-routes.md | Public routes (9 routes) |
| 4 | 03-auth-routes.md | Authentication routes (6 routes) |
| 5 | 04-candidate-routes.md | Candidate routes (5 routes) |
| 6 | 05-company-routes.md | Company routes (8 routes) |
| 7 | 06-communication-routes.md | Communication routes (2 routes) |
| 8 | 07-platform-admin-routes.md | Platform admin routes (10 routes) |
| 9 | 08-component-index.md | This index |

---

## 9.2 Global Components

| Component | Purpose | Used In |
|-----------|---------|---------|
| Chat FAB | Quick messaging access | All authenticated pages |
| Toast Notification | Action feedback | All pages |
| Confirmation Dialog | Destructive action confirmation | All pages |
| Session Expiry Modal | Re-authentication | All authenticated pages |
| Offline Banner | Connection status | All pages |
| Page Skeleton | Loading state | All data-fetching pages |
| 404 Error Page | Not found | Route errors |
| 500 Error Page | Server error | System errors |
| Maintenance Page | System down | Platform-wide |
| Empty State | No data | Lists, collections |
| Cookie Consent Banner | PDPA compliance | All pages (new visitors) |
| Profile Completion Ring | Progress indicator | Candidate pages |
| Match Score Badge | Job compatibility | Job cards, applications |
| Status Badges | Visual indicators | Throughout platform |
| Appointment Tracker Widget | Upcoming interviews | Dashboards, sidebars |

---

## 9.3 Navigation Shells

| Shell | Primary Users | Desktop Pattern | Mobile Pattern |
|-------|---------------|-----------------|----------------|
| Public Shell | Guests | Minimal header | Hamburger menu |
| Candidate Shell | Job seekers | Left sidebar (240px) | Bottom tab bar (5 items) |
| Company Shell | Employers | Left sidebar (260px) | Collapsible sidebar |
| Platform Admin Shell | Admins | Left sidebar (280px) | Desktop only |
| Minimal Shell | Auth flows | Logo only | Logo only |

---

## 9.4 Components by Route Category

### Public Routes (9 routes)

| Route | Key Components |
|-------|----------------|
| `/` | Hero Section, Search Box, Featured Jobs Grid, Company Carousel, How It Works |
| `/jobs` | Search Header, Filter Sidebar, Job List, Job Card, Pagination |
| `/jobs/[jobId]` | Job Header Card, Description Sections, Apply Sidebar, Similar Jobs |
| `/companies` | Search Bar, Filter Bar, Company Grid, Company Card |
| `/companies/[id]` | Cover Section, Company Header, About Section, Open Positions, Gallery |
| `/legal/[slug]` | Article Layout, Table of Contents, Content Sections |
| `/privacy/cookie-settings` | Cookie Category Toggles, Save Button |
| `/help` | Search Bar, Category Cards, Popular Articles |
| `/help/[topic]` | Breadcrumb, Article Content, Related Articles, Feedback Section |

### Authentication Routes (6 routes)

| Route | Key Components |
|-------|----------------|
| `/auth/login` | Login Card, Google Button, Email Form, Error States |
| `/auth/register` | Role Selection, Step Indicator, Auth Forms, Company Details Form |
| `/auth/verify` | Verification Card, State Displays (Loading/Success/Error) |
| `/auth/reset` | Reset Form, Success State, New Password Form |
| `/auth/status` | Status Tracker, Progress Stepper, Action Cards |
| `/auth/settings` | Tab Navigation, Notification Toggles, Password Form, Privacy Settings |

### Candidate Routes (5 routes)

| Route | Key Components |
|-------|----------------|
| `/candidates/[id]` | Welcome Header, Completion Card, Appointment Widget, Application Summary, Recommended Jobs |
| `/candidates/[id]/profile` | Profile Header, Tab Navigation, Personal Form, Preferences Form, Resume Builder, Onboarding Wizard |
| `/candidates/[id]/applications` | Status Tabs, Application List, Application Card, Timeline View |
| `/candidates/[id]/saved` | Tab Navigation, Saved Jobs Grid, Saved Searches List, Job Alerts List |
| `/candidates/[id]/settings` | Account Link, Visibility Toggle, Application Preferences |

### Company Routes (8 routes)

| Route | Key Components |
|-------|----------------|
| `/companies/[id]/pending` | Status Tracker, Progress Stepper, While Waiting Section |
| `/companies/[id]/dashboard` | Quick Stats, Upcoming Appointments, Recent Applications, Job Performance |
| `.../dashboard/jobs` | Job Table, Status Tabs, Bulk Actions, Action Menu |
| `.../dashboard/jobs/new` | 4-Step Wizard, Form Sections, Auto-save, Publish Options |
| `.../dashboard/jobs/[jobId]` | View Mode, Edit Mode, Performance Metrics, Application List |
| `.../dashboard/applications` | Three-Panel Layout, Filter Panel, Application List, Candidate Detail, Action Bar |
| `.../dashboard/team` | Member Table, Pending Invitations, Invite Form, Role Selector |
| `.../dashboard/candidates` | Search Bar, Filter Sidebar, Candidate Grid, Detail Modal |
| `.../dashboard/settings` | Profile Tab, Config Tab, Analytics Tab |

### Communication Routes (2 routes)

| Route | Key Components |
|-------|----------------|
| `/chat` | Conversation List, Chat Window, Message Bubbles, Appointment Cards, Schedule Modal, Input Area |
| `/notifications` | Filter Tabs, Notification List, Notification Item, Mark Read Actions |

### Platform Admin Routes (10 routes)

| Route | Key Components |
|-------|----------------|
| `/platform` | Quick Stats, Pending Actions, Quick Links |
| `/platform/dashboard` | Tab Navigation (Overview/Requests/Team), Health Metrics, Approval Queue, Staff Table |
| `/platform/companies` | Company Table, Filter Bar, Bulk Actions, Action Menu |
| `/platform/companies/[id]` | Company Header, Tab Navigation, Documents Viewer, History Timeline |
| `/platform/candidates` | Candidate Table, Filter Bar, Action Menu |
| `/platform/candidates/[id]` | Candidate Header, Profile View, Applications List, Activity History |
| `/platform/jobs` | Job Table, Moderation Queue, Report Badge, Filter Bar |
| `/platform/jobs/[id]` | Job Preview, Report Section, Moderation Actions, Statistics |
| `/platform/analytics` | Date Range Picker, Metric Cards, Charts (Growth/Market/Funnel), Export Options |
| `/platform/system` | Tab Navigation (Loyalty/Master Data/Settings), Coin Config, Data Lists, System Settings |

---

## 9.5 Reusable Component Patterns

### Card Patterns

| Pattern | Used In | Key Elements |
|---------|---------|--------------|
| Job Card | Job listings | Logo, Title, Company, Location, Salary, Save button |
| Company Card | Company directory | Logo, Name, Industry, Open positions |
| Application Card | Application lists | Company logo, Position, Date, Status badge |
| Stat Card | Dashboards | Number, Label, Trend indicator |
| Appointment Card (in chat) | Chat | Date, Time, Type, Location, Action buttons |

### Form Patterns

| Pattern | Used In | Key Elements |
|---------|---------|--------------|
| Auth Form | Login, Register | Email/Password inputs, OAuth buttons |
| Profile Form | Profile editor | Personal info fields, auto-save |
| Job Creation Wizard | Job posting | Multi-step, validation, preview |
| Filter Form | Search pages | Dropdowns, checkboxes, range sliders |

### List Patterns

| Pattern | Used In | Key Elements |
|---------|---------|--------------|
| Data Table | Admin pages | Sortable columns, bulk select, pagination |
| Card Grid | Job/Company listings | Responsive grid, card layout |
| Timeline | Application tracking | Vertical steps, status indicators |
| Conversation List | Chat | Avatar, preview, timestamp, unread badge |

### Modal Patterns

| Pattern | Used In | Key Elements |
|---------|---------|--------------|
| Confirmation Dialog | Delete actions | Warning, description, confirm/cancel |
| Form Modal | Quick edit, invite | Form fields, save/cancel |
| Detail Modal | Candidate search | Full content view, close button |
| Document Viewer | Admin pages | PDF/image viewer, zoom, download |

---

## 9.6 Responsive Breakpoints

| Breakpoint | Width | Navigation | Content |
|------------|-------|------------|---------|
| Mobile | < 768px | Bottom tabs / Hamburger | Single column |
| Tablet | 768-1023px | Collapsible sidebar | 2 columns |
| Desktop | ≥ 1024px | Full sidebar | Multi-column |
| Large | ≥ 1440px | Same as desktop | Wider content |

---

## 9.7 Exception/Error Component Summary

### Display Methods

| Type | Method | Use Case |
|------|--------|----------|
| Validation | Inline (red text) | Form field errors |
| Action | Toast notification | Success/failure feedback |
| Page-level | Full-page error | 404, 500, unauthorized |
| Blocking | Modal | Session expiry, confirmations |
| Informational | Banner (sticky) | Offline, slow connection |

### Common Exception States

| State | Thai Message | Component |
|-------|--------------|-----------|
| Loading | กำลังโหลด... | Skeleton/Spinner |
| Empty | ไม่พบข้อมูล | Empty State |
| Error | เกิดข้อผิดพลาด | Error State |
| No permission | คุณไม่มีสิทธิ์เข้าถึง | Redirect + Toast |
| Session expired | เซสชันหมดอายุ | Re-login Modal |
| Offline | คุณออฟไลน์อยู่ | Offline Banner |
| Rate limited | กรุณารอสักครู่ | Toast/Banner |

---

## 9.8 Status Badge Reference

### Application Status

| Status | Thai | Color | Code |
|--------|------|-------|------|
| Applied | สมัครแล้ว | Blue | `applied` |
| Viewed | ดูแล้ว | Gray | `viewed` |
| Under Review | กำลังพิจารณา | Yellow | `reviewing` |
| Accepted | ตอบรับ | Teal | `accepted` |
| Interview | นัดสัมภาษณ์ | Orange | `interview` |
| Offer | ได้รับข้อเสนอ | Green | `offer` |
| Rejected | ปฏิเสธ | Red | `rejected` |
| Withdrawn | ถอนใบสมัคร | Gray | `withdrawn` |

### Job Status

| Status | Thai | Color | Code |
|--------|------|-------|------|
| Active | กำลังเปิดรับ | Green | `active` |
| Draft | ร่าง | Gray | `draft` |
| Paused | หยุดชั่วคราว | Yellow | `paused` |
| Closed | ปิดแล้ว | Red | `closed` |
| Expired | หมดอายุ | Gray | `expired` |

### Company Status

| Status | Thai | Color | Code |
|--------|------|-------|------|
| Pending | รอตรวจสอบ | Yellow | `pending` |
| Active | ใช้งาน | Green | `active` |
| Suspended | ถูกระงับ | Red | `suspended` |
| Verified | ยืนยันแล้ว | Teal | `verified` |

### Appointment Status

| Status | Thai | Color | Code |
|--------|------|-------|------|
| Pending | รอการยืนยัน | Yellow | `pending` |
| Confirmed | ยืนยันแล้ว | Green | `confirmed` |
| Declined | ถูกปฏิเสธ | Red | `declined` |
| Cancelled | ยกเลิก | Gray | `cancelled` |
| Completed | เสร็จสิ้น | Gray | `completed` |
| No-show | ไม่มา | Red | `no_show` |

---

## 9.9 Color Reference

| Usage | Color | Hex |
|-------|-------|-----|
| Primary | Orange | #db6726 |
| Secondary | Teal | #3593a5 |
| Success | Green | #22c55e |
| Warning | Yellow | #eab308 |
| Error | Red | #ef4444 |
| Info | Blue | #3b82f6 |
| Neutral | Gray | #6b7280 |

---

## 9.10 Typography Reference

| Element | Font | Weight | Size |
|---------|------|--------|------|
| H1 | Kanit | 600 | 2rem (32px) |
| H2 | Kanit | 600 | 1.5rem (24px) |
| H3 | Kanit | 500 | 1.25rem (20px) |
| Body | Kanit | 400 | 1rem (16px) |
| Small | Kanit | 400 | 0.875rem (14px) |
| Caption | Kanit | 400 | 0.75rem (12px) |

---

## 9.11 Route Count Summary

| Category | Count | Routes |
|----------|-------|--------|
| Public | 9 | /, /jobs, /jobs/[id], /companies, /companies/[id], /legal/[slug], /privacy/cookie-settings, /help, /help/[topic] |
| Auth | 6 | /auth/login, /auth/register, /auth/verify, /auth/reset, /auth/status, /auth/settings |
| Candidate | 5 | /candidates/[id], .../profile, .../applications, .../saved, .../settings |
| Company | 8 | /companies/[id]/pending, .../dashboard, .../jobs, .../jobs/new, .../jobs/[id], .../applications, .../team, .../candidates, .../settings |
| Communication | 2 | /chat, /notifications |
| Platform Admin | 10 | /platform, .../dashboard, .../companies, .../companies/[id], .../candidates, .../candidates/[id], .../jobs, .../jobs/[id], .../analytics, .../system |
| **Total** | **45** | - |

---

*End of Component Index*

---

# ChanceDee Layout Component Specification - Complete

**Total Documents:** 9  
**Total Routes Covered:** 45  
**Total Components Defined:** 150+ unique component patterns

This specification provides the layout-level foundation for implementing all ChanceDee platform pages with consistent patterns, responsive behavior, and exception handling.
