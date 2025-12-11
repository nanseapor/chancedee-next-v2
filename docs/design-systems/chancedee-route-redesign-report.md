# Chancedee Platform - Route Architecture Redesign
## Consolidated Analysis & Implementation Guide

**Version:** 3.0  
**Date:** December 4, 2025  
**Status:** Proposal

---

## Executive Summary

This document consolidates the route architecture analysis for the Chancedee recruitment platform. The redesign:
- Reduces **82 routes to 45 routes** (-45%)
- Renames `/admin/*` to `/platform/*` for clarity
- Adds critical missing features from user journey analysis
- Documents security using the 16-scenario matrix

### Key Changes Summary

| Change Type | Count | Description |
|-------------|-------|-------------|
| Routes Consolidated | 37 | Multiple routes merged with client-side tabs |
| Routes Renamed | 20 | `/admin/*` → `/platform/*` |
| New Routes Added | 6 | Application tracking, saved jobs, etc. |
| Routes Removed | 6 | Redundant/deprecated routes |

---

## Table of Contents

1. [Route Consolidation Map](#1-route-consolidation-map)
2. [Gap Analysis & Proposed Changes](#2-gap-analysis--proposed-changes)
3. [Route Feature Specifications](#3-route-feature-specifications)
4. [Security Matrix for All Routes](#4-security-matrix-for-all-routes)
5. [Implementation Priority](#5-implementation-priority)

---

## 1. Route Consolidation Map

### 1.1 Public Routes

| Status | Old Route(s) | New Route | Notes |
|--------|--------------|-----------|-------|
| ✅ Keep | `/` | `/` | Landing page |
| ✅ Keep | `/jobs` | `/jobs` | Job search |
| ✅ Keep | `/jobs/[jobId]` | `/jobs/[jobId]` | Job detail |
| ✅ Keep | `/companies` | `/companies` | Company directory |
| ✅ Keep | `/companies/[id]` | `/companies/[id]` | Public company profile |
| ✅ Keep | `/legal/[slug]` | `/legal/[slug]` | Legal pages |
| ✅ Keep | `/privacy/cookie-settings` | `/privacy/cookie-settings` | Cookie preferences |
| 🆕 New | - | `/help` | Help center |
| 🆕 New | - | `/help/[topic]` | Help articles |
| ❌ Remove | `/in-progress` | - | Dev-only, not for production |

**Total: 8 → 9 routes**

---

### 1.2 Authentication Routes

| Status | Old Route(s) | New Route | Query Params |
|--------|--------------|-----------|--------------|
| 🔀 Merge | `/auth/social` | `/auth/login` | `?method=social` |
| 🔀 Merge | `/auth/email/sign-in` | `/auth/login` | `?method=email` |
| 🔀 Merge | `/auth/register` | `/auth/register` | `?step=account` |
| 🔀 Merge | `/auth/register/create-account` | `/auth/register` | `?step=company` |
| 🔀 Merge | `/auth/register/create-account/pending` | `/auth/register` | `?step=pending` |
| ✅ Keep | `/auth/email/verification` | `/auth/verify` | - |
| 🔀 Merge | `/auth/reset` | `/auth/reset` | - |
| ❌ Remove | `/auth/reset/success` | `/auth/reset` | `?status=success` (same page) |
| 🔀 Merge | `/auth/pending` | `/auth/status` | `?type=pending` |
| 🔀 Merge | `/auth/deleted` | `/auth/status` | `?type=deleted` |
| 🔀 Merge | `/auth/notification-settings` | `/auth/settings` | `?tab=notifications` |
| 🔀 Merge | `/auth/password-settings` | `/auth/settings` | `?tab=password` |
| 🔀 Merge | `/auth/delete-data-request` | `/auth/settings` | `?tab=privacy` |
| ❌ Remove | `/auth/delete-data-request/[id]` | `/auth/settings` | `?tab=privacy&request=[id]` |

**Total: 14 → 6 routes**

---

### 1.3 Candidate Routes

| Status | Old Route(s) | New Route | Query Params |
|--------|--------------|-----------|--------------|
| ✅ Keep | `/candidates/[id]` | `/candidates/[id]` | Dashboard overview |
| 🔀 Merge | `/candidates/[id]/edit-profile` | `/candidates/[id]/profile` | `?tab=personal` |
| 🔀 Merge | `/candidates/[id]/edit-preference` | `/candidates/[id]/profile` | `?tab=preferences` |
| 🔀 Merge | `/candidates/[id]/resume` | `/candidates/[id]/profile` | `?tab=resume` |
| 🔀 Merge | `/candidates/[id]/preview` | `/candidates/[id]/profile` | `?tab=preview` |
| 🆕 New | - | `/candidates/[id]/profile` | `?tab=onboarding` |
| 🔀 Merge | `/candidates/[id]/config` | `/candidates/[id]/settings` | - |
| 🆕 New | - | `/candidates/[id]/applications` | `?status=all\|applied\|interviewing\|offers` |
| 🆕 New | - | `/candidates/[id]/saved` | `?tab=jobs\|searches\|alerts` |

**Total: 6 → 5 routes (with 3 new features added)**

---

### 1.4 Company Routes

| Status | Old Route(s) | New Route | Query Params |
|--------|--------------|-----------|--------------|
| ✅ Keep | `/companies/[id]` | `/companies/[id]` | Public profile |
| 🔀 Merge | `/companies/[id]/pending` | `/companies/[id]/pending` | `?tab=status` |
| 🔀 Merge | `/companies/[id]/pending/preview` | `/companies/[id]/pending` | `?tab=preview` |
| ❌ Remove | `/companies/[id]/edit-profile` | - | Moved to dashboard/settings |
| ✅ Keep | `/companies/[id]/dashboard` | `/companies/[id]/dashboard` | Main dashboard |
| ✅ Keep | `/companies/[id]/dashboard/jobs` | `/companies/[id]/dashboard/jobs` | Job list |
| 🆕 New | - | `/companies/[id]/dashboard/jobs/new` | Job creation wizard |
| 🔀 Merge | `/companies/[id]/dashboard/jobs/[jobId]` | `/companies/[id]/dashboard/jobs/[jobId]` | `?mode=view` |
| 🔀 Merge | `/companies/[id]/dashboard/jobs/[jobId]/edit` | `/companies/[id]/dashboard/jobs/[jobId]` | `?mode=edit` |
| 🔀 Merge | `/companies/[id]/dashboard/jobs/[jobId]/post` | `/companies/[id]/dashboard/jobs/[jobId]` | `?mode=publish` |
| ✅ Keep | `/companies/[id]/dashboard/applications` | `/companies/[id]/dashboard/applications` | Application inbox |
| 🔀 Merge | `/companies/[id]/dashboard/employee` | `/companies/[id]/dashboard/team` | `?tab=members` |
| 🔀 Merge | `/companies/[id]/dashboard/new-employee` | `/companies/[id]/dashboard/team` | `?tab=invite` |
| ✅ Keep | `/companies/[id]/dashboard/candidate-search` | `/companies/[id]/dashboard/candidates` | Renamed for clarity |
| 🔀 Merge | `/companies/[id]/dashboard/config` | `/companies/[id]/dashboard/settings` | `?tab=config` |
| 🔀 Merge | `/companies/[id]/dashboard/profile` | `/companies/[id]/dashboard/settings` | `?tab=profile` |
| 🆕 New | - | `/companies/[id]/dashboard/settings` | `?tab=analytics` |

**Total: 16 → 8 routes**

---

### 1.5 Platform Admin Routes (Renamed from `/admin/*`)

| Status | Old Route | New Route | Query Params |
|--------|-----------|-----------|--------------|
| 🔄 Rename | `/admin` | `/platform` | Platform admin home |
| 🔀 Merge | `/admin/dashboard` | `/platform/dashboard` | `?tab=overview` |
| 🔀 Merge | `/admin/dashboard/profile` | `/platform/dashboard` | `?tab=profile` |
| 🔀 Merge | `/admin/dashboard/employee` | `/platform/dashboard` | `?tab=team` |
| 🔀 Merge | `/admin/dashboard/new-employee` | `/platform/dashboard` | `?tab=team&action=invite` |
| ❌ Remove | `/admin/dashboard/new-employee/invite` | `/platform/dashboard` | (merged above) |
| 🔀 Merge | `/admin/dashboard/account-requests` | `/platform/dashboard` | `?tab=requests` |
| ❌ Remove | `/admin/pending` | `/platform/dashboard` | `?tab=requests` (merged) |
| 🔄 Rename | `/admin/companies` | `/platform/companies` | Company list |
| 🔄 Rename | `/admin/companies/[id]` | `/platform/companies/[id]` | Company detail |
| 🔄 Rename | `/admin/candidates` | `/platform/candidates` | Candidate list |
| 🔄 Rename | `/admin/candidates/[id]` | `/platform/candidates/[id]` | Candidate detail |
| 🔄 Rename | `/admin/jobs` | `/platform/jobs` | Job list |
| 🔄 Rename | `/admin/jobs/[id]` | `/platform/jobs/[id]` | Job detail |
| 🔄 Rename | `/admin/analytics` | `/platform/analytics` | Platform analytics |
| 🔀 Merge | `/admin/loyalty` | `/platform/system` | `?tab=loyalty` |
| 🔀 Merge | `/admin/loyalty/coin-system` | `/platform/system` | `?tab=loyalty` |
| 🔀 Merge | `/admin/master-data` | `/platform/system` | `?tab=master-data` |
| 🔀 Merge | `/admin/settings` | `/platform/system` | `?tab=settings` |
| ❌ Remove | `/admin/accounts/delete` | `/platform/system` | `?tab=settings` (merged) |

**Total: 20 → 10 routes**

---

### 1.6 Communication Routes

| Status | Old Route(s) | New Route | Query Params |
|--------|--------------|-----------|--------------|
| ✅ Keep | `/chat` | `/chat` | `?room=[roomId]` |
| 🆕 New | - | `/notifications` | Notification center |

**Total: 1 → 2 routes**

---

### 1.7 Jobs Routes (Application Access)

| Status | Old Route(s) | New Route | Notes |
|--------|--------------|-----------|-------|
| ✅ Keep | `/jobs/[jobId]/applications/[appId]` | `/jobs/[jobId]/applications/[appId]` | Dual ownership check |

**Total: 1 → 1 route (unchanged)**

---

## 2. Gap Analysis & Proposed Changes

### 2.1 Critical Gaps (P0)

| Gap | Problem | User Impact | Solution |
|-----|---------|-------------|----------|
| **No Application Tracking** | Candidates cannot see application status after applying | High anxiety, support tickets | Add `/candidates/[id]/applications` |
| **No Saved Jobs** | Candidates cannot bookmark jobs | Lost opportunities, poor UX | Add `/candidates/[id]/saved?tab=jobs` |
| **No Progressive Onboarding** | Profile blocks applications without guidance | Abandonment, confusion | Add `?tab=onboarding` wizard |
| **Fragmented Profile Editing** | 4 separate pages for profile | Lost form state, context switching | Merge into `/profile` with tabs |

### 2.2 High Priority Gaps (P1)

| Gap | Problem | User Impact | Solution |
|-----|---------|-------------|----------|
| **No Company Analytics** | Recruiters can't see job performance | Can't optimize postings | Add `?tab=analytics` |
| **Weak Approval Status** | Pending companies don't know progress | Uncertainty, support load | Enhance `/pending` with tracker |
| **No Notification Center** | Notifications scattered | Missed updates | Add `/notifications` |
| **Confusing Admin Naming** | `/admin` is platform, not company | Developer confusion | Rename to `/platform` |
| **Fragmented Job Management** | View/Edit/Publish = 3 routes | Slow workflow | Merge with `?mode=` |

### 2.3 Medium Priority Gaps (P2)

| Gap | Problem | User Impact | Solution |
|-----|---------|-------------|----------|
| **No Help Center** | No self-service support | Higher support volume | Add `/help` routes |
| **No Saved Searches** | Must recreate searches | Repetitive work | Add `/saved?tab=searches` |
| **No Job Alerts** | No proactive job notifications | Missed opportunities | Add `/saved?tab=alerts` |

### 2.4 Consolidation Rationale

| Area | Why Consolidate? |
|------|------------------|
| **Candidate Profile** | Same entity, frequent switching, form state preservation |
| **Company Job Editor** | Actions on same job, no need for separate routes |
| **Auth Settings** | All account-related, standard UX pattern |
| **Platform Dashboard** | Related admin tasks, tab navigation faster |
| **Company Pending** | Status + preview are one flow |

---

## 3. Route Feature Specifications

### 3.1 Candidate Routes

#### `/candidates/[id]` - Dashboard Overview
| Feature | Description |
|---------|-------------|
| Profile completion score | Visual % with breakdown by section |
| Recent applications | Last 5 with status badges |
| Recommended jobs | Matched based on profile |
| Unread messages count | Link to chat |
| Quick actions | Edit profile, view applications |

#### `/candidates/[id]/profile` - Unified Profile Editor
| Tab | Features |
|-----|----------|
| `?tab=personal` | Name, contact, photo, location, about me |
| `?tab=preferences` | Salary, job type, location, work style |
| `?tab=resume` | Experience, education, skills, certs |
| `?tab=preview` | How recruiters see profile |
| `?tab=onboarding` | 5-step wizard for new users |

#### `/candidates/[id]/applications` - Application Tracking
| Feature | Description |
|---------|-------------|
| Status filters | All, Applied, Read, Interviewing, Offers, Rejected |
| Application cards | Job, company, date, status, next action |
| Timeline | Status change history per application |
| Actions | Withdraw, message company, view job |

#### `/candidates/[id]/saved` - Saved Items
| Tab | Features |
|-----|----------|
| `?tab=jobs` | Bookmarked jobs, quick apply, status |
| `?tab=searches` | Saved search criteria, re-run |
| `?tab=alerts` | Job alert subscriptions, frequency |

#### `/candidates/[id]/settings` - Account Settings
| Feature | Description |
|---------|-------------|
| Notifications | Email frequency, push settings |
| Password | Change password, linked accounts |
| Privacy | Visibility, data export, deletion |

---

### 3.2 Company Routes

#### `/companies/[id]/pending` - Approval Status
| Tab | Features |
|-----|----------|
| `?tab=status` | Step tracker, ETA, current step details |
| `?tab=preview` | Activities while waiting: draft jobs, browse candidates |

#### `/companies/[id]/dashboard` - Main Dashboard
| Feature | Description |
|---------|-------------|
| Metrics | Active jobs, applications, interviews |
| Recent applications | Requiring action |
| Quick actions | Post job, review apps, messages |

#### `/companies/[id]/dashboard/jobs` - Job Management
| Feature | Description |
|---------|-------------|
| Job list | All jobs with status, app counts |
| Filters | Active, Draft, Paused, Closed |
| Bulk actions | Pause, close, duplicate |

#### `/companies/[id]/dashboard/jobs/new` - Create Job
| Step | Content |
|------|---------|
| 1 | Title, department, type |
| 2 | Description, requirements (rich editor) |
| 3 | Location, remote options |
| 4 | Preview, publish/schedule |

#### `/companies/[id]/dashboard/jobs/[jobId]` - Job Detail
| Mode | Features |
|------|----------|
| `?mode=view` | Preview, metrics |
| `?mode=edit` | Edit fields, auto-save |
| `?mode=publish` | Publish settings, schedule |

#### `/companies/[id]/dashboard/applications` - Application Inbox
| Feature | Description |
|---------|-------------|
| Three-panel | Filters, list, candidate preview |
| Match scores | 0-100 compatibility |
| Actions | Accept, reject, schedule |
| Bulk | Multi-select operations |

#### `/companies/[id]/dashboard/team` - Team Management
| Tab | Features |
|-----|----------|
| `?tab=members` | List, roles, permissions |
| `?tab=invite` | Email invite, role assignment |

#### `/companies/[id]/dashboard/candidates` - Sourcing
| Feature | Description |
|---------|-------------|
| Search | Skill-based search |
| Filters | Experience, education, location |
| Actions | Message, invite to apply |

#### `/companies/[id]/dashboard/settings` - Company Settings
| Tab | Features |
|-----|----------|
| `?tab=profile` | Name, logo, description |
| `?tab=config` | Defaults, notifications |
| `?tab=analytics` | Hiring funnel, job performance |

---

### 3.3 Platform Admin Routes

#### `/platform` - Platform Home
| Feature | Description |
|---------|-------------|
| Overview | Platform stats, health |
| Quick links | Common admin tasks |

#### `/platform/dashboard` - Admin Dashboard
| Tab | Features |
|-----|----------|
| `?tab=overview` | Key metrics, alerts |
| `?tab=requests` | Company approvals queue |
| `?tab=team` | Platform staff management |
| `?tab=profile` | Admin's own profile |

#### `/platform/companies`, `/platform/candidates`, `/platform/jobs`
| Feature | Description |
|---------|-------------|
| List view | All entities with search/filter |
| Detail view | Full entity data, actions |

#### `/platform/analytics` - Platform Analytics
| Feature | Description |
|---------|-------------|
| User metrics | Signups, active users |
| Job metrics | Postings, applications |
| Revenue | If applicable |

#### `/platform/system` - System Configuration
| Tab | Features |
|-----|----------|
| `?tab=loyalty` | Coin system settings |
| `?tab=master-data` | Industries, skills, etc. |
| `?tab=settings` | Platform configuration |

---

### 3.4 Communication Routes

#### `/chat` - Messaging
| Feature | Description |
|---------|-------------|
| Room list | Conversations with unread count |
| Real-time | Text, files, images |
| Interview | In-chat scheduling |
| Offline | Message queuing |

#### `/notifications` - Notification Center
| Feature | Description |
|---------|-------------|
| All notifications | Read/unread status |
| Categories | Applications, messages, system |
| Actions | Mark read, delete |

---

## 4. Security Matrix for All Routes

### 4.1 User Scenarios Reference

| # | Code | Roles Array | Additional Check |
|---|------|-------------|------------------|
| 1 | **Unauth** | No session | - |
| 2 | **Cand-Own** | `['candidate']` | `user.uid === resourceId` |
| 3 | **Cand-Oth** | `['candidate']` | `user.uid !== resourceId` |
| 4 | **Co-Own** | `['company']` | `user.companyId === targetCompanyId` |
| 5 | **Co-Oth** | `['company']` | `user.companyId !== targetCompanyId` |
| 6 | **Admin** | `['admin']` | No company context |
| 7 | **AdCo-Own** | `['admin', 'company']` | `user.companyId === targetCompanyId` |
| 8 | **Chance** | `['chancedee']` | Platform admin |
| 9 | **Pend-T** | `['pending']` | Has transfer target |
| 10 | **Pend-N** | `['pending']` | No transfer target |
| 11 | **Del** | `['deleted']` | Deleted account |
| 12 | **CoPd-Own** | `['company', 'pending']` | Awaiting company admin approval |
| 13 | **Auth-Any** | Any active role | Not pending/deleted |
| 14 | **Cand-AppOwn** | `['candidate']` | `app.candidateId === user.uid` |
| 15 | **Co-JobOwn** | `['company']` | `job.companyId === user.companyId` |
| 16 | **Auth-Redir** | Any | May redirect based on status |

### 4.2 Public Routes

| Route | Unauth | Cand-Own | Cand-Oth | Co-Own | Co-Oth | Admin | AdCo-Own | Chance | Pend-T | Pend-N | Del | CoPd-Own |
|-------|--------|----------|----------|--------|--------|-------|----------|--------|--------|--------|-----|----------|
| `/` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🔄 | 🔄 | 🔄 | 🔄 |
| `/jobs` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/jobs/[jobId]` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/companies` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/companies/[id]` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/legal/[slug]` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/privacy/cookie-settings` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/help` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/help/[topic]` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

🔄 = Redirect to `/auth/status?type=pending` or `/auth/status?type=deleted`

### 4.3 Authentication Routes

| Route | Unauth | Cand-Own | Cand-Oth | Co-Own | Co-Oth | Admin | AdCo-Own | Chance | Pend-T | Pend-N | Del | CoPd-Own | Auth-Any |
|-------|--------|----------|----------|--------|--------|-------|----------|--------|--------|--------|-----|----------|----------|
| `/auth/login` | ✅ | 🔄 | 🔄 | 🔄 | 🔄 | 🔄 | 🔄 | 🔄 | 🔄 | 🔄 | 🔄 | 🔄 | 🔄 |
| `/auth/register` | ✅ | 🔄 | 🔄 | 🔄 | 🔄 | 🔄 | 🔄 | 🔄 | 🔄 | 🔄 | 🔄 | 🔄 | 🔄 |
| `/auth/verify` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/auth/reset` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/auth/status?type=pending` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ |
| `/auth/status?type=deleted` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `/auth/settings` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

**Note:** `/auth/settings` requires `Auth-Any` (any authenticated, active user - not pending/deleted).

### 4.4 Candidate Routes

| Route | Unauth | Cand-Own | Cand-Oth | Co-Own | Co-Oth | Admin | AdCo-Own | Chance | Pend-T | Pend-N | Del | CoPd-Own |
|-------|--------|----------|----------|--------|--------|-------|----------|--------|--------|--------|-----|----------|
| `/candidates/[id]` | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `/candidates/[id]/profile` | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `/candidates/[id]/applications` | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `/candidates/[id]/saved` | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `/candidates/[id]/settings` | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

**Security Rule:** `['candidate']` role + `user.uid === [id]` (ownership required)

**Query params don't change security** - all tabs under `/profile` have same access.

### 4.5 Company Routes

| Route | Unauth | Cand-Own | Cand-Oth | Co-Own | Co-Oth | Admin | AdCo-Own | Chance | Pend-T | Pend-N | Del | CoPd-Own |
|-------|--------|----------|----------|--------|--------|-------|----------|--------|--------|--------|-----|----------|
| `/companies/[id]/pending` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅* | ❌ | ❌ | ❌ |
| `/companies/[id]/dashboard` | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `/companies/[id]/dashboard/jobs` | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `/companies/[id]/dashboard/jobs/new` | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `/companies/[id]/dashboard/jobs/[jobId]` | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `/companies/[id]/dashboard/applications` | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `/companies/[id]/dashboard/team` | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `/companies/[id]/dashboard/candidates` | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `/companies/[id]/dashboard/settings` | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

**Security Rules:**
- `Co-Own`: `['company']` + `user.companyId === [id]`
- `AdCo-Own`: `['admin', 'company']` + `user.companyId === [id]`
- `Pend-T*`: Only for `/pending` route, requires pending transfer TO this company

### 4.6 Platform Admin Routes

| Route | Unauth | Cand-Own | Cand-Oth | Co-Own | Co-Oth | Admin | AdCo-Own | Chance | Pend-T | Pend-N | Del | CoPd-Own |
|-------|--------|----------|----------|--------|--------|-------|----------|--------|--------|--------|-----|----------|
| `/platform` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/platform/dashboard` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/platform/companies` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/platform/companies/[id]` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/platform/candidates` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/platform/candidates/[id]` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/platform/jobs` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/platform/jobs/[id]` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/platform/analytics` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/platform/system` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |

**Security Rule:** `['chancedee']` role required. Pure `['admin']` role has NO access.

### 4.7 Communication Routes

| Route | Unauth | Cand-Own | Cand-Oth | Co-Own | Co-Oth | Admin | AdCo-Own | Chance | Pend-T | Pend-N | Del | CoPd-Own |
|-------|--------|----------|----------|--------|--------|-------|----------|--------|--------|--------|-----|----------|
| `/chat` | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `/notifications` | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

**Chat Security (4-layer):**
1. Middleware validates session
2. Permission API checks roles
3. API filters rooms by ownership
4. Data layer enforces candidate/company ownership

**Notifications:** Any authenticated active user (not pending/deleted)

### 4.8 Application Detail Route

| Route | Unauth | Cand-Own | Cand-Oth | Co-Own | Co-Oth | Admin | AdCo-Own | Chance | Pend-T | Pend-N | Del | CoPd-Own | Cand-AppOwn | Co-JobOwn |
|-------|--------|----------|----------|--------|--------|-------|----------|--------|--------|--------|-----|----------|-------------|-----------|
| `/jobs/[jobId]/applications/[appId]` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

**Security Rule:** Dual ownership - EITHER:
- `Cand-AppOwn`: `['candidate']` + `application.candidateId === user.uid`
- `Co-JobOwn`: `['company']` + `job.companyId === user.companyId`

---

## 5. Implementation Priority

### Phase 1: Critical Path (Weeks 1-2)

| Route | Type | Why |
|-------|------|-----|
| `/candidates/[id]/profile` | Merge | Unify 4 routes, best UX impact |
| `/candidates/[id]/applications` | New | Critical missing feature |
| `/candidates/[id]/saved?tab=jobs` | New | Standard feature |
| `/companies/[id]/dashboard/jobs/[jobId]` | Merge | Unify view/edit/publish |

### Phase 2: Company & Auth (Weeks 3-4)

| Route | Type | Why |
|-------|------|-----|
| `/companies/[id]/dashboard/jobs/new` | New | Job creation wizard |
| `/companies/[id]/pending` | Enhance | Better approval UX |
| `/companies/[id]/dashboard/settings?tab=analytics` | New | Recruiter visibility |
| `/auth/login` | Merge | Unify login methods |
| `/auth/settings` | Merge | Consolidate settings |

### Phase 3: Platform & Communication (Weeks 5-6)

| Route | Type | Why |
|-------|------|-----|
| `/admin/*` → `/platform/*` | Rename | Clarity |
| `/platform/dashboard` | Merge | Consolidate admin tabs |
| `/notifications` | New | Unified notifications |
| `/candidates/[id]/saved?tab=alerts` | New | Job alerts |

### Phase 4: Polish (Weeks 7-8)

| Route | Type | Why |
|-------|------|-----|
| `/help` | New | Self-service support |
| `/platform/system` | Merge | System config tabs |
| `/auth/status` | Merge | Pending/deleted pages |
| `/companies/[id]/dashboard/team` | Merge | Team management |

---

## Appendix: Redirect Configuration

```javascript
// next.config.js
module.exports = {
  async redirects() {
    return [
      // === CANDIDATE PROFILE CONSOLIDATION ===
      { source: '/candidates/:id/edit-profile', destination: '/candidates/:id/profile?tab=personal', permanent: true },
      { source: '/candidates/:id/edit-preference', destination: '/candidates/:id/profile?tab=preferences', permanent: true },
      { source: '/candidates/:id/resume', destination: '/candidates/:id/profile?tab=resume', permanent: true },
      { source: '/candidates/:id/preview', destination: '/candidates/:id/profile?tab=preview', permanent: true },
      { source: '/candidates/:id/config', destination: '/candidates/:id/settings', permanent: true },
      
      // === COMPANY CONSOLIDATION ===
      { source: '/companies/:id/dashboard/jobs/:jobId/edit', destination: '/companies/:id/dashboard/jobs/:jobId?mode=edit', permanent: true },
      { source: '/companies/:id/dashboard/jobs/:jobId/post', destination: '/companies/:id/dashboard/jobs/:jobId?mode=publish', permanent: true },
      { source: '/companies/:id/edit-profile', destination: '/companies/:id/dashboard/settings?tab=profile', permanent: true },
      { source: '/companies/:id/pending/preview', destination: '/companies/:id/pending?tab=preview', permanent: true },
      { source: '/companies/:id/dashboard/employee', destination: '/companies/:id/dashboard/team?tab=members', permanent: true },
      { source: '/companies/:id/dashboard/new-employee', destination: '/companies/:id/dashboard/team?tab=invite', permanent: true },
      { source: '/companies/:id/dashboard/candidate-search', destination: '/companies/:id/dashboard/candidates', permanent: true },
      { source: '/companies/:id/dashboard/config', destination: '/companies/:id/dashboard/settings?tab=config', permanent: true },
      { source: '/companies/:id/dashboard/profile', destination: '/companies/:id/dashboard/settings?tab=profile', permanent: true },
      
      // === AUTH CONSOLIDATION ===
      { source: '/auth/social', destination: '/auth/login?method=social', permanent: true },
      { source: '/auth/email/sign-in', destination: '/auth/login?method=email', permanent: true },
      { source: '/auth/pending', destination: '/auth/status?type=pending', permanent: true },
      { source: '/auth/deleted', destination: '/auth/status?type=deleted', permanent: true },
      { source: '/auth/reset/success', destination: '/auth/reset?status=success', permanent: true },
      { source: '/auth/notification-settings', destination: '/auth/settings?tab=notifications', permanent: true },
      { source: '/auth/password-settings', destination: '/auth/settings?tab=password', permanent: true },
      { source: '/auth/delete-data-request', destination: '/auth/settings?tab=privacy', permanent: true },
      { source: '/auth/delete-data-request/:id', destination: '/auth/settings?tab=privacy&request=:id', permanent: true },
      
      // === PLATFORM ADMIN RENAME ===
      { source: '/admin', destination: '/platform', permanent: true },
      { source: '/admin/dashboard', destination: '/platform/dashboard', permanent: true },
      { source: '/admin/dashboard/profile', destination: '/platform/dashboard?tab=profile', permanent: true },
      { source: '/admin/dashboard/employee', destination: '/platform/dashboard?tab=team', permanent: true },
      { source: '/admin/dashboard/new-employee', destination: '/platform/dashboard?tab=team&action=invite', permanent: true },
      { source: '/admin/dashboard/new-employee/invite', destination: '/platform/dashboard?tab=team&action=invite', permanent: true },
      { source: '/admin/dashboard/account-requests', destination: '/platform/dashboard?tab=requests', permanent: true },
      { source: '/admin/pending', destination: '/platform/dashboard?tab=requests', permanent: true },
      { source: '/admin/companies', destination: '/platform/companies', permanent: true },
      { source: '/admin/companies/:id', destination: '/platform/companies/:id', permanent: true },
      { source: '/admin/candidates', destination: '/platform/candidates', permanent: true },
      { source: '/admin/candidates/:id', destination: '/platform/candidates/:id', permanent: true },
      { source: '/admin/jobs', destination: '/platform/jobs', permanent: true },
      { source: '/admin/jobs/:id', destination: '/platform/jobs/:id', permanent: true },
      { source: '/admin/analytics', destination: '/platform/analytics', permanent: true },
      { source: '/admin/loyalty', destination: '/platform/system?tab=loyalty', permanent: true },
      { source: '/admin/loyalty/coin-system', destination: '/platform/system?tab=loyalty', permanent: true },
      { source: '/admin/master-data', destination: '/platform/system?tab=master-data', permanent: true },
      { source: '/admin/settings', destination: '/platform/system?tab=settings', permanent: true },
      { source: '/admin/accounts/delete', destination: '/platform/system?tab=settings', permanent: true },
    ];
  },
};
```

---

**Document Status:** Complete  
**Version:** 3.0  
**Next Steps:** Review with stakeholders, begin Phase 1 implementation
