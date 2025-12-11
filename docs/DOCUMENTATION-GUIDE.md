# ChanceDee Documentation Guide

**Version:** 1.0
**Created:** 2025-12-12
**Purpose:** Consolidated guide for using project documentation

---

## Overview

This project has three main documentation sets:

| Directory | Purpose | Document Count |
|-----------|---------|----------------|
| `docs/RIS/` | Route Implementation Specifications | 45 files |
| `docs/ฺBLS/` | Business Logic Specifications | 13 files |
| `docs/design-systems/` | UI Component Specifications | 25+ files |

---

## 1. RIS (Route Implementation Specifications)

### Purpose

RIS documents are **per-route technical specifications** that define everything needed to implement a specific route/page in the application.

### Structure

Each RIS document follows a consistent format:

1. **Route Metadata** - Path, shell type, purpose, complexity, phase
2. **Domain Classification** - Primary/secondary domains, mutations
3. **Feature Mapping** - Existing features (preserve), deprecated, new, future
4. **Data Contract** - Read/write operations, collections, fields
5. **Component Composition** - Layout, shells, organisms, molecules, atoms
6. **State Machines** - Page states, component states, transitions
7. **User Flows** - Step-by-step interaction sequences
8. **Testing Requirements** - Unit, integration, E2E test cases

### Naming Convention

```
{DOMAIN}-R{NN}_{feature}_RIS.md
```

| Prefix | Domain |
|--------|--------|
| `AUTH-R*` | Authentication (login, register, verify, reset, etc.) |
| `CAND-R*` | Candidate dashboard and profile |
| `COMP-R*` | Company dashboard and management |
| `JOB-R*` | Job listings and details (public) |
| `CHAT-R*` | Messaging system |
| `NOTIF-R*` | Notifications |
| `WALLET-R*` | Wallet/credit system |
| `ADM-R*` | Platform admin |

### Cross-Cutting Documents

Each domain has a `*-R00_cross-cutting_RIS.md` document containing:
- Shared patterns across all routes in that domain
- Server action architecture
- Error handling standards
- Session management
- Analytics events
- i18n guidelines

### How to Use

1. **Starting a new route:** Read the corresponding RIS document first
2. **Understanding shared patterns:** Check the `*-R00` cross-cutting doc for the domain
3. **Cross-referencing:** RIS documents link to AUTH-R00 for global patterns
4. **Implementation:** Follow the component composition and state machine sections

### Example Usage

```markdown
> Implementing /auth/login?

1. Read AUTH-R00_cross-cutting_RIS.md (shared auth patterns)
2. Read AUTH-R01_login_RIS.md (specific login implementation)
3. Reference Section 6 for page state machine
4. Follow Section 4 Data Contract for Firebase operations
```

---

## 2. BLS (Business Logic Specifications)

### Purpose

BLS documents define **business rules, workflows, and action specifications** independent of UI implementation. They describe *what* the system should do, not *how* it looks.

### Structure

Each BLS document contains:

1. **Stage Overview** - Purpose and scope
2. **RIS Coverage** - Which routes this BLS applies to
3. **Data Entities** - Collections and their purposes
4. **Actor-Action Matrix** - Who can perform what actions
5. **Action Specifications** - Detailed specs for each business action

### Action Specification Format

Each action includes:
- **Purpose** - What the action accomplishes
- **Actor** - Who initiates, who is affected
- **Entry Points** - RIS routes, UI triggers
- **Input Validation** - Fields, types, rules, error messages (TH/EN)
- **Security Matrix** - Checks, requirements, failure codes
- **Preconditions (Guards)** - Conditions that must be met
- **State Machine** - Action flow states
- **Business Logic** - Core logic, decisions, calculations
- **Side Effects** - What else happens (emails, notifications, etc.)
- **Error Handling** - Error scenarios and recovery

### Naming Convention

```
BLS-{NN}_{stage-name}.md
```

| File | Stage |
|------|-------|
| `BLS-00_cross-cutting.md` | Shared patterns (session, auth, rate limiting) |
| `BLS-01_onboarding.md` | User registration and initial setup |
| `BLS-02_discovery.md` | Job search and browsing |
| `BLS-03_application.md` | Job applications |
| `BLS-04_screening.md` | Application screening |
| `BLS-05_interview.md` | Interview scheduling |
| `BLS-06_communication.md` | Messaging and chat |
| `BLS-07_job-management.md` | Job posting and management |
| `BLS-08_candidate-profile.md` | Candidate profile management |
| `BLS-09_company-profile.md` | Company profile management |
| `BLS-10_wallet.md` | Credits and wallet system |
| `BLS-11_notifications.md` | Notification system |
| `BLS-12_admin.md` | Platform administration |

### How to Use

1. **Understanding business rules:** Read the relevant BLS for the workflow stage
2. **Server action implementation:** Follow the action specification format
3. **Validation rules:** Use the Input Validation tables for form validation
4. **Error handling:** Follow the Security Matrix and Error Handling sections

### Relationship to RIS

| Document Type | Focus |
|---------------|-------|
| **RIS** | UI implementation, component composition, page states |
| **BLS** | Business logic, validation rules, workflows |

```
BLS defines WHAT happens → RIS defines HOW it's presented
```

### Example Usage

```markdown
> Implementing login server action?

1. Read BLS-01_onboarding.md Section 3.1 (login action)
2. Copy Input Validation table for form validation
3. Implement Security Matrix checks
4. Follow State Machine for action flow
5. Reference AUTH-R01_login_RIS.md for UI presentation
```

---

## 3. Design Systems

### Purpose

Design system documents define **UI components, visual standards, and usage patterns** for building consistent interfaces.

### Directory Structure

```
docs/design-systems/
├── chancedee-design-guidelines.md   # Core visual standards
├── usage-matrix.md                   # Component-to-route mapping
├── ChanceDee-Page-Design-Specifications.md
├── ChanceDee-Exception-States-Edge-Cases.md
├── atoms/                            # Basic UI elements
│   ├── buttons.md
│   ├── badges.md
│   ├── form-elements.md
│   ├── indicators.md
│   └── typography.md
├── molecules/                        # Compound components
│   ├── feedback.md
│   ├── form-groups.md
│   ├── list-items.md
│   └── media.md
├── organisms/                        # Complex UI sections
│   ├── cards.md
│   ├── chat.md
│   ├── modals.md
│   ├── navigation.md
│   ├── tables.md
│   ├── widgets.md
│   ├── empty-states.md
│   └── error-pages.md
└── routes/                           # Route-specific compositions
    ├── 00-global-components.md
    ├── 01-navigation-shells.md
    ├── 02-public-routes.md
    ├── 03-auth-routes.md
    ├── 04-candidate-routes.md
    ├── 05-company-routes.md
    ├── 06-communication-routes.md
    ├── 07-platform-admin-routes.md
    └── 08-component-index.md
```

### Key Documents

| Document | Purpose |
|----------|---------|
| `chancedee-design-guidelines.md` | Brand colors, typography, spacing rules |
| `usage-matrix.md` | Which components are used on which routes |
| `routes/*.md` | Route-specific component compositions |

### Design Guidelines Summary

**Typography:**
- Font: Kanit (Thai-optimized)
- Weights: 200-600 (prefer lighter weights for body)
- Extra letter-spacing for readability

**Colors:**
- Primary: Orange (`#DB6726`) - CTAs, brand moments (20%)
- Secondary: Teal (`#284450`) - Navigation, UI elements (80%)
- Semantic: Green/Amber/Red/Blue for status

**Component Hierarchy:**
```
Atoms → Molecules → Organisms → Pages
```

### How to Use

1. **Building a component:** Start with the atom/molecule/organism spec
2. **Styling guidance:** Reference `chancedee-design-guidelines.md`
3. **Route composition:** Check `routes/*.md` for what components each page needs
4. **Component availability:** Use `usage-matrix.md` to see where components are used

### Example Usage

```markdown
> Building a job card component?

1. Read organisms/cards.md for JobCard specification
2. Check usage-matrix.md to see where it's used
3. Reference design-guidelines.md for colors and spacing
4. Implement with shadcn/ui primitives from src/components/ui/
```

---

## Cross-Document Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                      Design Systems                          │
│                   (Visual Standards)                         │
│                                                              │
│    ┌─────────┐    ┌─────────┐    ┌─────────┐               │
│    │  Atoms  │───▶│Molecules│───▶│Organisms│               │
│    └─────────┘    └─────────┘    └─────────┘               │
└─────────────────────────┬───────────────────────────────────┘
                          │ defines appearance
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                           RIS                                │
│                (Route Implementation)                        │
│                                                              │
│    ┌───────────────────────────────────────────────────┐    │
│    │ Component Composition │ State Machines │ UI Flows │    │
│    └───────────────────────────────────────────────────┘    │
└─────────────────────────┬───────────────────────────────────┘
                          │ implements behavior from
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                           BLS                                │
│                   (Business Logic)                           │
│                                                              │
│    ┌───────────────────────────────────────────────────┐    │
│    │ Actions │ Validations │ Workflows │ Security      │    │
│    └───────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## Quick Reference

### When implementing a feature:

| Task | Documents to Read |
|------|-------------------|
| New route/page | RIS (route spec) + Design Systems (routes/) |
| Server action | BLS (action spec) + RIS (cross-cutting) |
| New component | Design Systems (atoms/molecules/organisms) |
| Form validation | BLS (input validation tables) |
| Error handling | BLS (security matrix) + RIS (error UX) |
| Styling | Design Systems (guidelines) |

### Document priority by task type:

| Task Type | 1st Priority | 2nd Priority | 3rd Priority |
|-----------|--------------|--------------|--------------|
| UI Development | RIS | Design Systems | BLS |
| Backend Logic | BLS | RIS (data contract) | - |
| Full Feature | RIS | BLS | Design Systems |
| Bug Fix | RIS (state machines) | BLS | - |
