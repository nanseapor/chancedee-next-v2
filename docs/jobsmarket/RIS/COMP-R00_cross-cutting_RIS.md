# COMP-R00: Company Domain Cross-Cutting Specifications

**Document ID:** COMP-R00  
**Version:** 1.1  
**Status:** Draft  
**Created:** 2025-12-09  
**Last Updated:** 2025-12-09  
**Applies To:** COMP-R01 through COMP-R08 (RIS complete)  
**Planned Coverage:** COMP-R04 through COMP-R09 (RIS pending)

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.1 | 2025-12-09 | Added RIS Status column to Route Summary; clarified planned vs complete routes throughout document |
| 1.0 | 2025-12-09 | Initial creation with patterns extracted from COMP-R01, R02, R03 |

---

## Purpose

This document defines shared specifications, patterns, and standards that apply across all Company routes. Individual RIS documents (COMP-R01 through COMP-R08) should reference this document rather than duplicating these specifications.

**Usage Pattern:**
```markdown
> **Cross-Reference:** See COMP-R00 Section X for [topic].
```

---

## Table of Contents

1. [Domain Overview](#1-domain-overview)
2. [Company Shell Specification](#2-company-shell-specification)
3. [Access Control Framework](#3-access-control-framework)
4. [Role Permissions Matrix](#4-role-permissions-matrix)
5. [Company Status Lifecycle](#5-company-status-lifecycle)
6. [Employee Transfer Lifecycle](#6-employee-transfer-lifecycle)
7. [Global State (Atoms)](#7-global-state-atoms)
8. [SWR Key Conventions](#8-swr-key-conventions)
9. [Error Handling Standards](#9-error-handling-standards)
10. [i18n & Thai Copy Reference](#10-i18n--thai-copy-reference)

**Appendices:**
- [A: TypeScript Types](#appendix-a-typescript-types)
- [B: Server Action Signatures](#appendix-b-server-action-signatures)
- [C: Route Cross-Reference](#appendix-c-route-cross-reference)

---

## 1. Domain Overview

### 1.1 Route Summary

The Company domain contains 9 routes:

| Route ID | Path | Shell | Purpose | RIS Status |
|----------|------|-------|---------|------------|
| COMP-R01 | `/companies/[id]/pending` | Minimal Shell | Pending/rejected company status | ✅ Complete |
| COMP-R02 | `/companies/[id]/dashboard/team` | Company Shell | Team member management | ✅ Complete |
| COMP-R03 | `/companies/[id]/dashboard/settings` | Company Shell | Company profile & configuration | ✅ Complete |
| COMP-R04 | `/companies/[id]/dashboard` | Company Shell | Company dashboard with metrics | ✅ Complete |
| COMP-R05 | `/companies/[id]/dashboard/jobs` | Company Shell | Job posting management | ✅ Complete |
| COMP-R06 | `/companies/[id]/dashboard/jobs/new` | Company Shell | Create new job posting | ✅ Complete |
| COMP-R07 | `/companies/[id]/dashboard/jobs/[jobId]` | Company Shell | Job detail/edit | ✅ Complete |
| COMP-R08 | `/companies/[id]/dashboard/applications` | Company Shell | Application management | ✅ Complete |
| COMP-R09 | `/companies/[id]/dashboard/candidates` | Company Shell | Candidate search/browse | 📋 Planned |

> **Note:** Routes marked 📋 Planned are defined in `05-company-routes.md` but their individual RIS documents have not yet been created. The patterns in this document (access control, permissions, etc.) are designed for all 9 routes.

### 1.2 Feature Count

| Category | Count |
|----------|-------|
| Total Features | 20 (COMP-001 to COMP-020) |
| Admin Actions | 4 (COMP-007, COMP-008, COMP-009, COMP-020) |
| Staff Actions | 6 (COMP-014 to COMP-019) |
| Profile/Settings | 5 (COMP-003 to COMP-006, COMP-011) |
| Public/Search | 2 (COMP-001, COMP-002) |
| Dashboard | 3 (COMP-010, COMP-012, COMP-013) |

### 1.3 Critical Business Logic

**IMMEDIATE DETACHMENT STRATEGY**: When a user applies to a new company while being a member of another, they are IMMEDIATELY detached from their current company with NO restoration on rejection.

---

## 2. Company Shell Specification

### 2.1 Shell Variants

| Variant | Description | Used By |
|---------|-------------|---------|
| **Minimal Shell** | Limited header, no sidebar, no chat/notifications | COMP-R01 (pending/rejected only) |
| **Company Shell** | Full sidebar, chat FAB, notification bell | COMP-R02 through COMP-R08 |

### 2.2 Shell Selection Rules

| Company Status | Shell | Accessible Routes |
|----------------|-------|-------------------|
| `pending` | Minimal Shell | COMP-R01 only |
| `rejected` | Minimal Shell | COMP-R01 only |
| `approved` | Company Shell | All dashboard routes (R02-R08) |
| `suspended` | Company Shell | Dashboard routes (limited functionality) |

### 2.3 Company Shell Sidebar Navigation

| Item | Thai Label | Route | Icon | Badge |
|------|------------|-------|------|-------|
| Dashboard | à¹à¸”à¸Šà¸šà¸­à¸£à¹Œà¸” | `/companies/[id]/dashboard` | Home | - |
| Jobs | à¸›à¸£à¸°à¸à¸²à¸¨à¸‡à¸²à¸™ | `/companies/[id]/dashboard/jobs` | Briefcase | Count |
| Applications | à¹ƒà¸šà¸ªà¸¡à¸±à¸„à¸£ | `/companies/[id]/dashboard/applications` | FileText | Count |
| Candidates | à¸„à¹‰à¸™à¸«à¸²à¸œà¸¹à¹‰à¸ªà¸¡à¸±à¸„à¸£ | `/companies/[id]/dashboard/candidates` | Search | - |
| Team | à¸—à¸µà¸¡ | `/companies/[id]/dashboard/team` | Users | Count (pending) |
| Settings | à¸à¸²à¸£à¸•à¸±à¹‰à¸‡à¸„à¹ˆà¸² | `/companies/[id]/dashboard/settings` | Settings | - |

### 2.4 Company Shell Header

| Component | Description | Action |
|-----------|-------------|--------|
| Company Logo | 32Ã—32 logo image | â†’ Settings |
| Company Name | Truncated with tooltip | - |
| Role Badge | Color-coded role | - |
| Notification Bell | With unread count | Toggle drawer |
| User Avatar | Current user | Toggle menu |
| Chat FAB | Floating action button | Open chat drawer |

---

## 3. Access Control Framework

### 3.1 Access Control State Machine

```
                        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                        â”‚     AUTH_CHECK          â”‚
                        â”‚  (firebaseUserAtom)     â”‚
                        â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                    â”‚
                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                    â”‚ NOT_AUTHENTICATED            â”‚ AUTHENTICATED
                    â–¼                              â–¼
           â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”           â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
           â”‚ REDIRECT_LOGIN  â”‚           â”‚   MEMBERSHIP_CHECK  â”‚
           â”‚ â†’ /auth/login   â”‚           â”‚   (userAtom.companyId)â”‚
           â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜           â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                                    â”‚
                               â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                               â”‚ NOT_MEMBER                             â”‚ IS_MEMBER
                               â–¼                                        â–¼
                      â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                      â”‚ REDIRECT_403    â”‚                     â”‚   STATUS_CHECK      â”‚
                      â”‚ or â†’ /          â”‚                     â”‚  (company.status)   â”‚
                      â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                                                         â”‚
                   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                   â”‚ PENDING       â”‚ REJECTED        â”‚ APPROVED          â”‚ SUSPENDED
                   â–¼               â–¼                 â–¼                   â–¼
          â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
          â”‚ MINIMAL_ACCESS â”‚ â”‚ MINIMAL_ACCESS â”‚ â”‚ ROLE_CHECK     â”‚ â”‚ LIMITED_ACCESS â”‚
          â”‚ â†’ R01 only     â”‚ â”‚ â†’ R01 only     â”‚ â”‚ (user.roles)   â”‚ â”‚ (read-only)    â”‚
          â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                                        â”‚
                            â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                            â”‚ HAS_PERMISSION                                        â”‚ NO_PERMISSION
                            â–¼                                                       â–¼
                   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                   â”‚ GRANT_ACCESS    â”‚                                    â”‚ SHOW_403        â”‚
                   â”‚ (render page)   â”‚                                    â”‚ or limit UI     â”‚
                   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                                    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 3.2 Access Control Transition Table

| Current State | Event | Next State | Guard Condition | Side Effects |
|---------------|-------|------------|-----------------|--------------|
| `init` | `AUTH_LOADED` | `auth_check` | - | - |
| `auth_check` | `NOT_AUTHENTICATED` | `redirect_login` | `!firebaseUser` | `router.push('/auth/login')` |
| `auth_check` | `AUTHENTICATED` | `membership_check` | `firebaseUser` | Fetch user data |
| `membership_check` | `NOT_MEMBER` | `redirect_403` | `user.companyId !== id` | Show 403 or redirect |
| `membership_check` | `IS_MEMBER` | `status_check` | `user.companyId === id` | Fetch company data |
| `status_check` | `IS_PENDING` | `minimal_access` | `company.status === 'pending'` | Allow R01 only |
| `status_check` | `IS_REJECTED` | `minimal_access` | `company.status === 'rejected'` | Allow R01 only |
| `status_check` | `IS_APPROVED` | `role_check` | `company.status === 'approved'` | Check permissions |
| `status_check` | `IS_SUSPENDED` | `limited_access` | `company.status === 'suspended'` | Read-only mode |
| `role_check` | `HAS_PERMISSION` | `grant_access` | Permission satisfied | Render page |
| `role_check` | `NO_PERMISSION` | `show_403` | Permission denied | Limit UI or show error |

### 3.3 Membership Verification

| Check | Atom/SWR Key | Condition |
|-------|--------------|-----------|
| User authenticated | `firebaseUserAtom` | `firebaseUser !== null` |
| User belongs to company | `userAtom.companyId` | `user.companyId === params.id` |
| User pending for company | `userAtom.target_company` | `user.target_company === params.id` |

**Note:** For COMP-R01 (pending page), both `companyId === id` OR `target_company === id` grants access.

---

## 4. Role Permissions Matrix

### 4.1 Company Roles

| Role ID | Thai Name | English | Badge Color |
|---------|-----------|---------|-------------|
| `admin` | à¹à¸­à¸”à¸¡à¸´à¸™ | Admin | `bg-purple-100 text-purple-800` |
| `hr_manager` | à¸œà¸¹à¹‰à¸ˆà¸±à¸”à¸à¸²à¸£ HR | HR Manager | `bg-blue-100 text-blue-800` |
| `recruiter` | à¸™à¸±à¸à¸ªà¸£à¸£à¸«à¸² | Recruiter | `bg-green-100 text-green-800` |
| `interviewer` | à¸œà¸¹à¹‰à¸ªà¸±à¸¡à¸ à¸²à¸©à¸“à¹Œ | Interviewer | `bg-yellow-100 text-yellow-800` |
| `viewer` | à¸œà¸¹à¹‰à¸”à¸¹ | Viewer | `bg-gray-100 text-gray-800` |

### 4.2 Permission Matrix

| Permission ID | Thai | Admin | HR Manager | Recruiter | Interviewer | Viewer |
|---------------|------|-------|------------|-----------|-------------|--------|
| `post_jobs` | à¹‚à¸žà¸ªà¸•à¹Œà¸‡à¸²à¸™ | âœ“ | âœ“ | âœ“ | âœ— | âœ— |
| `edit_jobs` | à¹à¸à¹‰à¹„à¸‚à¸‡à¸²à¸™ | âœ“ | âœ“ | âœ“ | âœ— | âœ— |
| `view_applications` | à¸”à¸¹à¹ƒà¸šà¸ªà¸¡à¸±à¸„à¸£ | âœ“ | âœ“ | âœ“ | Limited | âœ“ |
| `accept_reject` | à¸•à¸­à¸šà¸£à¸±à¸š/à¸›à¸à¸´à¹€à¸ªà¸˜ | âœ“ | âœ“ | âœ“ | âœ— | âœ— |
| `schedule_interviews` | à¸™à¸±à¸”à¸ªà¸±à¸¡à¸ à¸²à¸©à¸“à¹Œ | âœ“ | âœ“ | âœ“ | âœ“ | âœ— |
| `manage_team` | à¸ˆà¸±à¸”à¸à¸²à¸£à¸—à¸µà¸¡ | âœ“ | âœ— | âœ— | âœ— | âœ— |
| `company_settings` | à¸•à¸±à¹‰à¸‡à¸„à¹ˆà¸²à¸šà¸£à¸´à¸©à¸±à¸— | âœ“ | âœ“ | âœ— | âœ— | âœ— |

### 4.3 Permission Check Utility

```typescript
const ROLE_PERMISSIONS: Record<CompanyRole, Permission[]> = {
  admin: ['post_jobs', 'edit_jobs', 'view_applications', 'accept_reject', 'schedule_interviews', 'manage_team', 'company_settings'],
  hr_manager: ['post_jobs', 'edit_jobs', 'view_applications', 'accept_reject', 'schedule_interviews', 'company_settings'],
  recruiter: ['post_jobs', 'edit_jobs', 'view_applications', 'accept_reject', 'schedule_interviews'],
  interviewer: ['schedule_interviews'],  // view_applications is limited
  viewer: ['view_applications'],  // read-only
};

function hasPermission(userRole: CompanyRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) ?? false;
}

function isAdmin(userRoles: string[]): boolean {
  return userRoles.includes('admin');
}
```

### 4.4 Role Descriptions

| Role | Description (Thai) | Use Case |
|------|-------------------|----------|
| Admin | à¸ªà¸´à¸—à¸˜à¸´à¹Œà¹€à¸•à¹‡à¸¡à¸£à¸¹à¸›à¹à¸šà¸š - à¸ˆà¸±à¸”à¸à¸²à¸£à¹„à¸”à¹‰à¸—à¸¸à¸à¸­à¸¢à¹ˆà¸²à¸‡ | Company owner, primary manager |
| HR Manager | à¸ˆà¸±à¸”à¸à¸²à¸£à¸—à¸¸à¸à¸­à¸¢à¹ˆà¸²à¸‡à¸¢à¸à¹€à¸§à¹‰à¸™à¸ªà¸¡à¸²à¸Šà¸´à¸à¸—à¸µà¸¡ | HR department head |
| Recruiter | à¹‚à¸žà¸ªà¸•à¹Œà¸‡à¸²à¸™, à¸ˆà¸±à¸”à¸à¸²à¸£à¹ƒà¸šà¸ªà¸¡à¸±à¸„à¸£, à¸™à¸±à¸”à¸ªà¸±à¸¡à¸ à¸²à¸©à¸“à¹Œ | Hiring staff |
| Interviewer | à¸”à¸¹à¹ƒà¸šà¸ªà¸¡à¸±à¸„à¸£à¸—à¸µà¹ˆà¸¡à¸­à¸šà¸«à¸¡à¸²à¸¢, à¸™à¸±à¸”à¸«à¸¡à¸²à¸¢à¸ªà¸±à¸¡à¸ à¸²à¸©à¸“à¹Œ | Interview panel |
| Viewer | à¸”à¸¹à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¹€à¸—à¹ˆà¸²à¸™à¸±à¹‰à¸™ | Stakeholder, observer |

---

## 5. Company Status Lifecycle

### 5.1 Entity Automaton - Company Status

```
                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                    â”‚               [none]                â”‚
                    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                        â”‚ CreateNewCompany
                                        â–¼
                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                    â”‚     [pending] + is_active:false     â”‚
                    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                               â”‚             â”‚
                approveCompany â”‚             â”‚ rejectCompany
                               â–¼             â–¼
          â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
          â”‚ [approved] is_active:T  â”‚  â”‚ [rejected] is_active:F  â”‚
          â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                       â”‚ â–²
         suspend       â”‚ â”‚ unsuspend
                       â–¼ â”‚
          â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
          â”‚ [suspended] is_active:F â”‚
          â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 5.2 Company Status Transition Table

| Entity | Current State | Event | Next State | Actor | Side Effects |
|--------|---------------|-------|------------|-------|--------------|
| Company | `none` | `CreateNewCompany` | `pending` | Authenticated user | Create company_information, address, contact docs; Set user.target_company |
| Company | `pending` | `approveCompany` | `approved` | Chancedee admin | Set is_active=true; Update staff roles; Send email notification |
| Company | `pending` | `rejectCompany` | `rejected` | Chancedee admin | Add "company-deleted" role to staff; Send email notification |
| Company | `approved` | `suspend` | `suspended` | Chancedee admin | Set is_active=false; Unpublish ALL company jobs |
| Company | `suspended` | `unsuspend` | `approved` | Chancedee admin | Set is_active=true; Jobs remain unpublished (manual re-publish required) |

### 5.3 Status â†’ Route Mapping

| Status | Allowed Routes | Redirect Behavior |
|--------|----------------|-------------------|
| `pending` | COMP-R01 only | Dashboard routes â†’ `/companies/[id]/pending` |
| `rejected` | COMP-R01 only | Dashboard routes â†’ `/companies/[id]/pending` |
| `approved` | All routes | Pending route â†’ `/companies/[id]/dashboard` |
| `suspended` | All routes (limited) | No redirect, show suspended banner |

---

## 6. Employee Transfer Lifecycle

### 6.1 Entity Automaton - Employee Transfer

```
                        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                        â”‚               [none]                â”‚
                        â”‚         (no company affiliation)    â”‚
                        â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                            â”‚ StaffRequestApply
                                            â–¼
                        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                        â”‚  [pending] + target_company set     â”‚
                        â”‚  + DETACHED from previous company   â”‚
                        â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                   â”‚             â”‚
     companyAdminAcceptNewEmployee â”‚             â”‚ companyAdminRejectNewEmployee
                                   â–¼             â–¼
          â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
          â”‚ [company] + companyId set   â”‚  â”‚ [candidate only]            â”‚
          â”‚ + transfer_approved:true    â”‚  â”‚ + companyId cleared         â”‚
          â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚ + NO RESTORATION            â”‚
                                           â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 6.2 Employee Transfer Transition Table

| Entity | Current State | Event | Next State | Actor | Side Effects |
|--------|---------------|-------|------------|-------|--------------|
| User | `none` | `StaffRequestApply` | `pending` | User | Set target_company; Add pending role |
| User | `company_A_employee` | `StaffRequestApply(B)` | `pending_for_B` | User | **IMMEDIATE DETACHMENT**: Clear companyId; Remove company roles; Set target_company |
| User | `pending` | `companyAdminAcceptNewEmployee` | `company` | Company admin | Set companyId; Remove pending role; Set transfer_approved=true |
| User | `pending` | `companyAdminRejectNewEmployee` | `candidate` | Company admin | Clear target_company; Keep only candidate role; **NO RESTORATION** |

### 6.3 Critical Warning

âš ï¸ **IMMEDIATE DETACHMENT STRATEGY**
- User is detached from current company **IMMEDIATELY** on application (not on approval)
- `companyId` is cleared
- ALL company-related roles removed (`company`, `admin`, `chancedee`)
- Only `candidate` + `pending` roles remain
- Previous company is **NOT restored** on rejection
- User must re-apply to old company if they change their mind

---

## 7. Global State (Atoms)

### 7.1 Shared Atoms

| Atom | Type | R/W | Purpose | Used By |
|------|------|-----|---------|---------|
| `firebaseUserAtom` | `User \| null` | R | Firebase Auth user object | All routes - auth check |
| `userAtom` | `userDataProps \| null` | R | User profile, roles, companyId | All routes - permissions |
| `sessionStateAtom` | `SessionState` | R | Session validity | All routes - auth check |
| `activeRoleAtom` | `string` | R/W | Current navigation context | Shell, navigation |
| `companyAtom` | `CompanyProfile \| null` | R/W | Current company data cache | R01, R03 |
| `editCompanyAtom` | `CompanyProfile \| null` | R/W | Draft state during editing | R03 |
| `sidebarLoadingAtom` | `boolean` | R/W | Sidebar loading state | Company Shell |
| `leftSidebarAtom` | `boolean` | R/W | Left sidebar open/close | Company Shell |
| `rightSidebarAtom` | `boolean` | R/W | Right sidebar open/close | Company Shell |

### 7.2 Atom Read/Write Guidelines

| Atom | Read Locations | Write Locations |
|------|----------------|-----------------|
| `firebaseUserAtom` | Everywhere | `useFirebaseAuth` hook only |
| `userAtom` | Everywhere | SWR revalidation, `UserAccountSet` action |
| `activeRoleAtom` | Shell, guards | Role switcher, login flow |
| `companyAtom` | Company pages | SWR revalidation, profile updates |
| `editCompanyAtom` | Settings form | Form initialization, user edits |

### 7.3 Atom Dependencies

```
firebaseUserAtom
    â”‚
    â””â”€â”€â–¶ userAtom (depends on auth)
              â”‚
              â”œâ”€â”€â–¶ activeRoleAtom (derived from user.roles)
              â”‚
              â””â”€â”€â–¶ companyAtom (if user.companyId exists)
                        â”‚
                        â””â”€â”€â–¶ editCompanyAtom (copy of companyAtom for editing)
```

---

## 8. SWR Key Conventions

### 8.1 Key Patterns

| Key Pattern | Purpose | Example |
|-------------|---------|---------|
| `company-${id}` | Company profile data | `company-abc123` |
| `company-jobs-${id}` | Company job listings | `company-jobs-abc123` |
| `company-applications-${id}` | Applications to company | `company-applications-abc123` |
| `company-staff-${id}` | Team member list | `company-staff-abc123` |
| `pending-employees-${id}` | Pending applications | `pending-employees-abc123` |
| `company-addresses-${id}` | Office locations | `company-addresses-abc123` |
| `company-analytics-${id}` | Analytics data | `company-analytics-abc123` |
| `user-data-${uid}` | Current user data | `user-data-xyz789` |
| `admin-count-${id}` | Number of admins | `admin-count-abc123` |

### 8.2 Invalidation Triggers

| Key | Invalidate On | Related Actions |
|-----|---------------|-----------------|
| `company-${id}` | Profile update | `updateCompanyProfile` |
| `company-jobs-${id}` | Job CRUD, status change | `createJob`, `updateJob`, `deleteJob` |
| `company-applications-${id}` | Application status change | `acceptApplication`, `rejectApplication` |
| `company-staff-${id}` | Accept/Reject/Remove employee | `companyAdminAcceptNewEmployee`, `removeEmployee` |
| `pending-employees-${id}` | Accept/Reject pending | `companyAdminAcceptNewEmployee`, `companyAdminRejectNewEmployee` |
| `company-addresses-${id}` | Location CRUD | `addCompanyAddress`, `removeCompanyAddress` |
| `user-data-${uid}` | Role change, profile update | `toggleEmployeeRole`, `UserAccountSet` |
| `admin-count-${id}` | Role change, remove | `toggleEmployeeRole`, `removeEmployee` |

### 8.3 SWR Key Factory Usage

```typescript
import { companyKeys } from '@/lib/swr/keys';

// Fetch company data
const { data: company } = useSWR(
  companyId ? companyKeys.company(companyId) : null,
  fetcher
);

// Invalidate after mutation
await mutate(companyKeys.company(companyId));

// Bulk invalidate
await mutate(companyKeys.all(companyId));
```

---

## 9. Error Handling Standards

### 9.1 Error Display Methods

| Error Type | Display Method | When to Use |
|------------|----------------|-------------|
| Field validation | Inline (red text below field) | Form field errors |
| Action feedback | Toast notification | Success/failure of actions |
| Blocking errors | Full-page error | Network error, 500, auth required |
| Confirmation needed | Modal dialog | Destructive actions |
| Access denied | 403 page or redirect | Permission/membership failure |

### 9.2 Toast Configuration

| Variant | Duration | Thai Example |
|---------|----------|--------------|
| `success` | 3 seconds | "à¸šà¸±à¸™à¸—à¸¶à¸à¸ªà¸³à¹€à¸£à¹‡à¸ˆ" |
| `error` | 5 seconds | "à¹€à¸à¸´à¸”à¸‚à¹‰à¸­à¸œà¸´à¸”à¸žà¸¥à¸²à¸” à¸¥à¸­à¸‡à¹ƒà¸«à¸¡à¹ˆ" |
| `warning` | 5 seconds | "à¸¢à¸±à¸‡à¸¡à¸µà¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¹„à¸¡à¹ˆà¸„à¸£à¸š" |
| `info` | 4 seconds | "à¸à¸£à¸¸à¸“à¸²à¸£à¸­à¸ªà¸±à¸à¸„à¸£à¸¹à¹ˆ" |

### 9.3 Company-Specific Error Codes

| Error Code | Thai Message | Recovery Action |
|------------|--------------|-----------------|
| `COMPANY_NOT_FOUND` | à¹„à¸¡à¹ˆà¸žà¸šà¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸šà¸£à¸´à¸©à¸±à¸— | Show 404 page |
| `NOT_COMPANY_MEMBER` | à¸„à¸¸à¸“à¹„à¸¡à¹ˆà¹„à¸”à¹‰à¹€à¸›à¹‡à¸™à¸ªà¸¡à¸²à¸Šà¸´à¸à¸šà¸£à¸´à¸©à¸±à¸—à¸™à¸µà¹‰ | Redirect to home |
| `COMPANY_PENDING` | à¸šà¸£à¸´à¸©à¸±à¸—à¸¢à¸±à¸‡à¸£à¸­à¸à¸²à¸£à¸­à¸™à¸¸à¸¡à¸±à¸•à¸´ | Redirect to pending page |
| `COMPANY_SUSPENDED` | à¸šà¸£à¸´à¸©à¸±à¸—à¸–à¸¹à¸à¸£à¸°à¸‡à¸±à¸šà¸Šà¸±à¹ˆà¸§à¸„à¸£à¸²à¸§ | Show banner, limit actions |
| `NOT_ADMIN` | à¸•à¹‰à¸­à¸‡à¸¡à¸µà¸ªà¸´à¸—à¸˜à¸´à¹Œà¹à¸­à¸”à¸¡à¸´à¸™à¸šà¸£à¸´à¸©à¸±à¸—à¹€à¸—à¹ˆà¸²à¸™à¸±à¹‰à¸™ | Disable action buttons |
| `LAST_ADMIN` | à¸•à¹‰à¸­à¸‡à¸¡à¸µ Admin à¸­à¸¢à¹ˆà¸²à¸‡à¸™à¹‰à¸­à¸¢ 1 à¸„à¸™ | Show warning, prevent action |
| `CANNOT_MODIFY_SELF` | à¹„à¸¡à¹ˆà¸ªà¸²à¸¡à¸²à¸£à¸–à¹à¸à¹‰à¹„à¸‚à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸•à¸™à¹€à¸­à¸‡à¹„à¸”à¹‰ | Disable self-action buttons |
| `UPLOAD_FAILED` | à¸­à¸±à¸žà¹‚à¸«à¸¥à¸”à¹„à¸Ÿà¸¥à¹Œà¹„à¸¡à¹ˆà¸ªà¸³à¹€à¸£à¹‡à¸ˆ | Toast + retry |
| `FILE_TOO_LARGE` | à¹„à¸Ÿà¸¥à¹Œà¹ƒà¸«à¸à¹ˆà¹€à¸à¸´à¸™ {size} | Show limit, ask to resize |
| `INVALID_FILE_TYPE` | à¸£à¸­à¸‡à¸£à¸±à¸š {types} | Show accepted types |

### 9.4 Retry Mechanisms

| Error Type | Retry Strategy | Max Retries |
|------------|----------------|-------------|
| Network error | Exponential backoff | 3 |
| Upload failed | Manual retry button | Unlimited |
| Rate limited | Show countdown | 1 (after cooldown) |
| Fetch error | SWR auto-retry | 3 |

---

## 10. i18n & Thai Copy Reference

### 10.1 Role Names

| Key | Thai | English |
|-----|------|---------|
| `role.admin` | à¹à¸­à¸”à¸¡à¸´à¸™ | Admin |
| `role.hr_manager` | à¸œà¸¹à¹‰à¸ˆà¸±à¸”à¸à¸²à¸£ HR | HR Manager |
| `role.recruiter` | à¸™à¸±à¸à¸ªà¸£à¸£à¸«à¸² | Recruiter |
| `role.interviewer` | à¸œà¸¹à¹‰à¸ªà¸±à¸¡à¸ à¸²à¸©à¸“à¹Œ | Interviewer |
| `role.viewer` | à¸œà¸¹à¹‰à¸”à¸¹ | Viewer |

### 10.2 Company Status Labels

| Key | Thai | English |
|-----|------|---------|
| `status.pending` | à¸£à¸­à¸à¸²à¸£à¸­à¸™à¸¸à¸¡à¸±à¸•à¸´ | Pending Approval |
| `status.approved` | à¸­à¸™à¸¸à¸¡à¸±à¸•à¸´à¹à¸¥à¹‰à¸§ | Approved |
| `status.rejected` | à¹„à¸¡à¹ˆà¸­à¸™à¸¸à¸¡à¸±à¸•à¸´ | Rejected |
| `status.suspended` | à¸£à¸°à¸‡à¸±à¸š | Suspended |

### 10.3 Common Actions

| Key | Thai | English |
|-----|------|---------|
| `action.save` | à¸šà¸±à¸™à¸—à¸¶à¸ | Save |
| `action.cancel` | à¸¢à¸à¹€à¸¥à¸´à¸ | Cancel |
| `action.edit` | à¹à¸à¹‰à¹„à¸‚ | Edit |
| `action.delete` | à¸¥à¸š | Delete |
| `action.remove` | à¸¥à¸šà¸­à¸­à¸ | Remove |
| `action.accept` | à¸•à¸­à¸šà¸£à¸±à¸š | Accept |
| `action.reject` | à¸›à¸à¸´à¹€à¸ªà¸˜ | Reject |
| `action.retry` | à¸¥à¸­à¸‡à¹ƒà¸«à¸¡à¹ˆ | Try Again |
| `action.logout` | à¸­à¸­à¸à¸ˆà¸²à¸à¸£à¸°à¸šà¸š | Logout |
| `action.upload` | à¸­à¸±à¸žà¹‚à¸«à¸¥à¸” | Upload |
| `action.view` | à¸”à¸¹ | View |
| `action.search` | à¸„à¹‰à¸™à¸«à¸² | Search |

### 10.4 Form Validation Messages

| Key | Thai | English |
|-----|------|---------|
| `validation.required` | à¸à¸£à¸¸à¸“à¸²à¸£à¸°à¸šà¸¸ | Please enter |
| `validation.invalid_url` | à¸£à¸¹à¸›à¹à¸šà¸š URL à¹„à¸¡à¹ˆà¸–à¸¹à¸à¸•à¹‰à¸­à¸‡ | Invalid URL format |
| `validation.invalid_email` | à¸£à¸¹à¸›à¹à¸šà¸šà¸­à¸µà¹€à¸¡à¸¥à¹„à¸¡à¹ˆà¸–à¸¹à¸à¸•à¹‰à¸­à¸‡ | Invalid email format |
| `validation.file_too_large` | à¹„à¸Ÿà¸¥à¹Œà¹ƒà¸«à¸à¹ˆà¹€à¸à¸´à¸™ {size} | File exceeds {size} |
| `validation.invalid_file_type` | à¸£à¸­à¸‡à¸£à¸±à¸š {types} | Supports {types} |
| `validation.min_length` | à¸•à¹‰à¸­à¸‡à¸¡à¸µà¸­à¸¢à¹ˆà¸²à¸‡à¸™à¹‰à¸­à¸¢ {n} à¸•à¸±à¸§à¸­à¸±à¸à¸©à¸£ | Minimum {n} characters |
| `validation.max_length` | à¸•à¹‰à¸­à¸‡à¹„à¸¡à¹ˆà¹€à¸à¸´à¸™ {n} à¸•à¸±à¸§à¸­à¸±à¸à¸©à¸£ | Maximum {n} characters |

### 10.5 Page Titles

| Route | Thai | English |
|-------|------|---------|
| COMP-R01 | à¸£à¸­à¸à¸²à¸£à¸­à¸™à¸¸à¸¡à¸±à¸•à¸´ | Pending Approval |
| COMP-R02 | à¸—à¸µà¸¡ | Team |
| COMP-R03 | à¸à¸²à¸£à¸•à¸±à¹‰à¸‡à¸„à¹ˆà¸²à¸šà¸£à¸´à¸©à¸±à¸— | Company Settings |
| COMP-R04 | à¹à¸”à¸Šà¸šà¸­à¸£à¹Œà¸” | Dashboard |
| COMP-R05 | à¸›à¸£à¸°à¸à¸²à¸¨à¸‡à¸²à¸™ | Jobs |
| COMP-R06 | à¸¥à¸‡à¸›à¸£à¸°à¸à¸²à¸¨à¸‡à¸²à¸™à¹ƒà¸«à¸¡à¹ˆ | Post New Job |
| COMP-R07 | à¹ƒà¸šà¸ªà¸¡à¸±à¸„à¸£ | Applications |
| COMP-R08 | à¸„à¹‰à¸™à¸«à¸²à¸œà¸¹à¹‰à¸ªà¸¡à¸±à¸„à¸£ | Search Candidates |

---



## 11. Cross-Domain Integration Patterns

### 11.1 Chat Drawer Integration

When accepting an application from COMP-R08, a chat room is created and the chat drawer should open automatically:

```typescript
// hooks/useChatDrawer.ts
import { useAtom } from 'jotai';
import { chatDrawerAtom } from '@/store/chat';

export function useChatDrawer() {
  const [chatDrawer, setChatDrawer] = useAtom(chatDrawerAtom);
  
  const openDrawer = (chatId: string) => {
    setChatDrawer({ isOpen: true, chatId });
  };
  
  const closeDrawer = () => {
    setChatDrawer({ isOpen: false, chatId: null });
  };
  
  return { chatDrawer, openDrawer, closeDrawer };
}
```

#### Accept Flow with Chat Drawer

```typescript
// COMP-R08: Accept application action
import { useChatDrawer } from '@/hooks/useChatDrawer';
import { acceptApplication } from '@/domains/jobs/services/server/actions';

function useAcceptApplication() {
  const { openDrawer } = useChatDrawer();
  const { mutate } = useSWRConfig();
  
  const handleAccept = async (applicationId: string) => {
    try {
      const result = await acceptApplication(applicationId);
      
      if (result.success && result.chatId) {
        // Invalidate application cache
        await mutate(swrKeys.company.applications(companyId));
        
        // Open chat drawer (does NOT navigate away from applications page)
        openDrawer(result.chatId);
        
        toast.success('ตอบรับใบสมัครแล้ว');
      }
    } catch (error) {
      toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่');
    }
  };
  
  return { handleAccept };
}
```

#### Chat Drawer Component (Shell Integration)

```tsx
// components/shells/ChatDrawer.tsx
import { useChatDrawer } from '@/hooks/useChatDrawer';

export function ChatDrawer() {
  const { chatDrawer, closeDrawer } = useChatDrawer();
  
  if (!chatDrawer.isOpen) return null;
  
  return (
    <Sheet open={chatDrawer.isOpen} onOpenChange={closeDrawer}>
      <SheetContent side="right" className="w-[400px]">
        <MiniChatView chatId={chatDrawer.chatId} />
      </SheetContent>
    </Sheet>
  );
}
```

> **Key Decision:** Accept → Open Chat Drawer stays on current page (does not navigate to `/chat`). This provides better UX by allowing the company user to continue reviewing other applications.

---

## Appendix A: TypeScript Types

```typescript
// Company status enum
type CompanyStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

// Company role enum
type CompanyRole = 'admin' | 'hr_manager' | 'recruiter' | 'interviewer' | 'viewer';

// Permission types
type Permission = 
  | 'post_jobs'
  | 'edit_jobs'
  | 'view_applications'
  | 'accept_reject'
  | 'schedule_interviews'
  | 'manage_team'
  | 'company_settings';

// Company profile
interface CompanyProfile {
  uid: string;
  company_name: string;
  company_name_en?: string;
  profile_photo?: string;
  cover_photo?: string;
  industry?: string;
  company_size?: 'S' | 'M' | 'L';
  founded_year?: number;
  description?: string;
  website?: string;
  facebook?: string;
  linkedin?: string;
  gallery?: string[];
  status: CompanyStatus;
  is_active: boolean;
  rejection_reason?: string;
  rejected_at?: number;
}

// Team member
interface TeamMember {
  uid: string;
  displayName: string;
  email: string;
  profilePhoto?: string;
  roles: string[];
  companyId: string;
  createdAt: number;
}

// Pending employee application
interface PendingEmployee {
  uid: string;
  displayName: string;
  email: string;
  profilePhoto?: string;
  targetCompany: string;
  requestTimestamp: number;
  transferApproved: boolean;
}

// Company address
interface CompanyAddress {
  uid: string;
  company_id: string;
  address_line1: string;
  address_line2?: string;
  province: string;
  district: string;
  sub_district?: string;
  postal_code: string;
  is_primary: boolean;
}

// Access check result
interface AccessCheckResult {
  allowed: boolean;
  reason?: 'not_authenticated' | 'not_member' | 'company_pending' | 'no_permission';
  redirect?: string;
}

// Role badge config
interface RoleBadgeConfig {
  id: CompanyRole;
  labelTh: string;
  labelEn: string;
  className: string;
}

const ROLE_BADGES: RoleBadgeConfig[] = [
  { id: 'admin', labelTh: 'à¹à¸­à¸”à¸¡à¸´à¸™', labelEn: 'Admin', className: 'bg-purple-100 text-purple-800' },
  { id: 'hr_manager', labelTh: 'à¸œà¸¹à¹‰à¸ˆà¸±à¸”à¸à¸²à¸£ HR', labelEn: 'HR Manager', className: 'bg-blue-100 text-blue-800' },
  { id: 'recruiter', labelTh: 'à¸™à¸±à¸à¸ªà¸£à¸£à¸«à¸²', labelEn: 'Recruiter', className: 'bg-green-100 text-green-800' },
  { id: 'interviewer', labelTh: 'à¸œà¸¹à¹‰à¸ªà¸±à¸¡à¸ à¸²à¸©à¸“à¹Œ', labelEn: 'Interviewer', className: 'bg-yellow-100 text-yellow-800' },
  { id: 'viewer', labelTh: 'à¸œà¸¹à¹‰à¸”à¸¹', labelEn: 'Viewer', className: 'bg-gray-100 text-gray-800' },
];
```

---

## Appendix B: Server Action Signatures

### B.1 Company Management

```typescript
// Location: src/domains/companies/services/server/actions/company-management.ts

async function CreateNewCompany(
  companyRequest: {
    companyName: string;
    companyNumber: string;
    companyLogo?: string;
  }
): Promise<{ success: boolean; companyId?: string; error?: string }>;

async function updateCompanyProfile(
  companyId: string,
  data: Partial<CompanyProfile>
): Promise<{ success: boolean; error?: string }>;

async function ListCompany(
  searchTerm?: string
): Promise<CompanyProfile[]>;
```

### B.2 Company Request Management

```typescript
// Location: src/domains/companies/services/server/actions/company-request-management.ts

async function approveCompany(
  companyId: string
): Promise<{ success: boolean; error?: string }>;
// Requires: chancedee role

async function rejectCompany(
  companyId: string,
  reason: string
): Promise<{ success: boolean; error?: string }>;
// Requires: chancedee role

async function updateCompanyStatus(
  companyId: string,
  status: CompanyStatus,
  isActive: boolean
): Promise<{ success: boolean; error?: string }>;
// Requires: chancedee role
```

### B.3 Staff Management

```typescript
// Location: src/domains/companies/services/server/actions/staff-management.ts

async function StaffRequestApply(
  companyId: string,
  data: StaffRequestData
): Promise<{ success: boolean; error?: string }>;
// Uses auth.user.uid from withServerActionAuth HOF

async function ListCompanyStaff(
  companyId: string
): Promise<TeamMember[]>;
// Requires: company member
```

### B.4 Company User Management

```typescript
// Location: src/domains/companies/services/server/actions/company-user-management.ts

async function companyAdminAcceptNewEmployee(
  targetUserId: string
): Promise<{ success: boolean; error?: string }>;
// Requires: company + admin roles

async function companyAdminRejectNewEmployee(
  targetUserId: string
): Promise<{ success: boolean; error?: string }>;
// Requires: company + admin roles

async function toggleEmployeeRole(
  targetUserId: string,
  newRole: CompanyRole
): Promise<{ success: boolean; error?: string }>;
// Requires: admin role, cannot modify self

async function removeEmployee(
  targetUserId: string
): Promise<{ success: boolean; error?: string }>;
// Requires: admin role, cannot remove self, cannot remove last admin
```

---

## Appendix C: Route Cross-Reference

### C.1 Cross-Reference Table Template

Use this table in RIS documents that reference COMP-R00:

```markdown
## Cross-References

This document references shared specifications from **COMP-R00_cross-cutting_RIS.md**.

| Topic | COMP-R00 Section |
|-------|------------------|
| Shell selection | Section 2 |
| Access control | Section 3 |
| Role permissions | Section 4 |
| Company status lifecycle | Section 5 |
| Employee transfer lifecycle | Section 6 |
| Shared atoms | Section 7 |
| SWR key patterns | Section 8 |
| Error handling | Section 9 |
| Thai copy | Section 10 |
```

### C.2 Section Usage by Route

| Section | R01 | R02 | R03 | R04* | R05* | R06* | R07* | R08* |
|---------|-----|-----|-----|------|------|------|------|------|
| Shell Selection | âœ“ | âœ“ | âœ“ | âœ“ | âœ“ | âœ“ | âœ“ | âœ“ |
| Access Control | âœ“ | âœ“ | âœ“ | âœ“ | âœ“ | âœ“ | âœ“ | âœ“ |
| Role Permissions | - | âœ“ | âœ“ | âœ“ | âœ“ | âœ“ | âœ“ | âœ“ |
| Company Status | âœ“ | - | - | - | - | - | - | - |
| Employee Transfer | - | âœ“ | - | - | - | - | - | - |
| Shared Atoms | âœ“ | âœ“ | âœ“ | âœ“ | âœ“ | âœ“ | âœ“ | âœ“ |
| SWR Keys | âœ“ | âœ“ | âœ“ | âœ“ | âœ“ | âœ“ | âœ“ | âœ“ |
| Error Handling | âœ“ | âœ“ | âœ“ | âœ“ | âœ“ | âœ“ | âœ“ | âœ“ |
| Thai Copy | âœ“ | âœ“ | âœ“ | âœ“ | âœ“ | âœ“ | âœ“ | âœ“ |

*\* R04-R08: RIS documents planned but not yet created. Check marks indicate expected usage based on route requirements.*

---

## Decisions Log

| Decision | Chosen | Rationale | Date |
|----------|--------|-----------|------|
| 8 routes in Company domain | Per UI spec | `05-company-routes.md` defines 8 routes | 2025-12-09 |
| Minimal Shell for pending/rejected | Limited access | Pending companies shouldn't have full platform access | 2025-12-09 |
| 5 company roles | Per UI spec | Role permissions matrix from `05-company-routes.md` | 2025-12-09 |
| Immediate detachment on transfer | Business logic | Per `features_companies.md` - critical strategy | 2025-12-09 |
| No restoration on rejection | Business logic | Per `features_companies.md` | 2025-12-09 |
| Admin cannot modify self | Safety | Prevent accidental lockout | 2025-12-09 |
| Last admin protection | Safety | Prevent company orphaning | 2025-12-09 |
| Use `activeRoleAtom` | Per PROJECT_INSTRUCTIONS | Renamed from `navBarAtom` for clarity | 2025-12-09 |

---

## Related Documents

| Document | Relationship | Status |
|----------|--------------|--------|
| COMP-R01_pending_RIS.md | Pending page implementation | âœ… Complete |
| COMP-R02_team_RIS.md | Team management implementation | âœ… Complete |
| COMP-R03_settings_RIS.md | Settings page implementation | âœ… Complete |
| COMP-R04 through COMP-R08 | Remaining route implementations | ðŸ“‹ Planned |
| `features_companies.md` | Business logic source | Reference |
| `05-company-routes.md` | UI specifications | Reference |
| `state-inventory_atoms.md` | Atom definitions | Reference |
| `state-inventory_swr-keys.md` | SWR key patterns | Reference |
| `data-entities_company-requests.md` | Company data schema | Reference |
| `data-entities_user-info.md` | User/employee data schema | Reference |
| `data-entities_user-transfer.md` | Transfer request schema | Reference |
| AUTH-R00_cross-cutting_RIS.md | Related cross-cutting patterns | Reference |

---

*End of COMP-R00: Company Domain Cross-Cutting Specifications v1.1*
