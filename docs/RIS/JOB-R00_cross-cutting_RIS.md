# JOB-R00: Jobs Domain Cross-Cutting Specification

**Version:** 1.1  
**Last Updated:** 2025-12-09  
**Domain:** Jobs  
**Applies To:** All `/jobs/*` routes and job-related components in other shells

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.1 | 2025-12-09 | Added accessibility, loading states, implementation notes, rate limiting, test scenarios; fixed timeout inconsistency; clarified match score as future enhancement |
| 1.0 | 2025-12-09 | Initial cross-cutting spec consolidating JOB-R01 and JOB-R02 shared patterns |

---

## 1. Overview

This document defines shared specifications for the Jobs domain that apply across multiple routes. Individual route RIS documents (JOB-R01, JOB-R02, etc.) reference this document to avoid duplication.

### Routes Covered

| Route ID | Route Path | Primary Purpose |
|----------|------------|-----------------|
| JOB-R01 | `/jobs` | Job search & listings |
| JOB-R02 | `/jobs/[id]` | Job detail & apply |
| JOB-R03 | `/candidates/[id]/applications` | Candidate applications (planned) |
| JOB-R04 | `/candidates/[id]/saved` | Saved jobs (planned) |
| JOB-R05 | `/companies/[id]/dashboard/jobs` | Company job management (planned) |

### Cross-Reference Format

Route RIS documents should reference this document as:

```markdown
## Cross-References

This document references shared specifications from **JOB-R00_cross-cutting_RIS.md**.

| Topic | JOB-R00 Section |
|-------|-----------------|
| Save Job State Machine | Section 3.1 |
| Login Prompt Modal | Section 3.2 |
| Job Card Component | Section 4.1 |
| MeiliSearch Integration | Section 5 |
```

---

## 2. Domain Architecture

### 2.1 Jobs Domain Scope

The Jobs domain owns:
- **Job listings** - Public job search, filtering, pagination
- **Job details** - Full job information display
- **Job applications** - Apply, withdraw, edit applications
- **Job management** - Create, edit, publish, close jobs (company side)
- **Saved jobs** - Bookmark functionality for candidates

### 2.2 Domain Relationships

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                         JOBS DOMAIN                             â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                                 â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”         â”‚
â”‚  â”‚  Job List   â”‚â”€â”€â”€â–¶â”‚ Job Detail  â”‚â”€â”€â”€â–¶â”‚   Apply     â”‚         â”‚
â”‚  â”‚  (JOB-R01)  â”‚    â”‚  (JOB-R02)  â”‚    â”‚   Flow      â”‚         â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”˜         â”‚
â”‚         â”‚                  â”‚                   â”‚                â”‚
â”‚         â–¼                  â–¼                   â–¼                â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”         â”‚
â”‚  â”‚  Save Job   â”‚    â”‚ Similar     â”‚    â”‚ Application â”‚         â”‚
â”‚  â”‚  (shared)   â”‚    â”‚ Jobs        â”‚    â”‚ Management  â”‚         â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜         â”‚
â”‚                                                                 â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
         â”‚                    â”‚                    â”‚
         â–¼                    â–¼                    â–¼
    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”         â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”          â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â”‚Candidateâ”‚         â”‚ Company â”‚          â”‚  Chat   â”‚
    â”‚ Domain  â”‚         â”‚ Domain  â”‚          â”‚ Domain  â”‚
    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜         â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜          â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 2.3 Shell Context

Jobs domain routes appear in multiple shells:

| Shell | Routes | Behavior |
|-------|--------|----------|
| Public Shell | `/jobs`, `/jobs/[id]` | Guest access, login prompts |
| Candidate Shell | `/jobs`, `/jobs/[id]`, `/candidates/[id]/applications`, `/candidates/[id]/saved` | Full functionality |
| Company Shell | `/jobs`, `/jobs/[id]`, `/companies/[id]/dashboard/jobs/*` | View + manage own jobs |

### 2.4 Shell Switching Logic

```typescript
// Shared shell determination for jobs routes
function determineJobsShell(
  sessionState: SessionState,
  activeRole: string | null
): ShellType {
  if (sessionState !== 'valid' || !activeRole) {
    return 'public';
  }
  
  switch (activeRole) {
    case 'candidate':
      return 'candidate';
    case 'company':
      return 'company';
    case 'chancedee':
      return 'company'; // Admin sees company shell on public routes
    default:
      return 'public';
  }
}
```

---

## 3. Shared UI Components & State Machines

### 3.1 Save Job State Machine

The Save Job feature is used across multiple routes (job list, job detail, similar jobs, saved jobs page). This is the canonical state machine.

#### State Diagram

```
                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
         â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â–¶â”‚  UNSAVED  â”‚â—€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
         â”‚          â””â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”˜          â”‚
         â”‚                â”‚                â”‚
         â”‚         SAVE_CLICK              â”‚
         â”‚                â”‚                â”‚
         â”‚    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
         â”‚    â”‚                       â”‚    â”‚
         â”‚    â–¼ (guest)               â–¼ (logged in)
         â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
         â”‚ â”‚ LOGIN_PROMPT â”‚    â”‚  SAVING   â”‚
         â”‚ â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜    â””â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”˜
         â”‚        â”‚                  â”‚
         â”‚    â”Œâ”€â”€â”€â”´â”€â”€â”€â”        â”Œâ”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”
         â”‚    â”‚       â”‚        â”‚           â”‚
         â”‚ DISMISS  LOGIN   SUCCESS     ERROR
         â”‚    â”‚       â”‚        â”‚           â”‚
         â”‚    â–¼       â–¼        â–¼           â”‚
         â”‚  (back)  (redirect) â”Œâ”€â”€â”€â”€â”€â”€â”€â”   â”‚
         â”‚                     â”‚ SAVED â”‚   â”‚
         â”‚                     â””â”€â”€â”€â”¬â”€â”€â”€â”˜   â”‚
         â”‚                         â”‚       â”‚
         â”‚                   UNSAVE_CLICK  â”‚
         â”‚                         â”‚       â”‚
         â”‚                         â–¼       â”‚
         â”‚                   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
         â”‚                   â”‚ UNSAVING â”‚  â”‚
         â”‚                   â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”˜  â”‚
         â”‚                        â”‚        â”‚
         â”‚                  â”Œâ”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”  â”‚
         â”‚               SUCCESS     ERRORâ”€â”˜
         â”‚                  â”‚
         â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

#### State Transition Table

| Current State | Event | Next State | Guard Condition | Side Effects |
|---------------|-------|------------|-----------------|--------------|
| `unsaved` | `SAVE_CLICK` | `login_prompt` | `!isLoggedIn` | Set `loginPromptJobId` |
| `unsaved` | `SAVE_CLICK` | `saving` | `isLoggedIn` | Optimistic UI: show filled heart |
| `saving` | `SAVE_SUCCESS` | `saved` | - | Invalidate `saved-jobs-${uid}`, show toast |
| `saving` | `SAVE_ERROR` | `unsaved` | - | Revert UI, show error toast |
| `saved` | `UNSAVE_CLICK` | `unsaving` | - | Optimistic UI: show empty heart |
| `unsaving` | `UNSAVE_SUCCESS` | `unsaved` | - | Invalidate `saved-jobs-${uid}` |
| `unsaving` | `UNSAVE_ERROR` | `saved` | - | Revert UI, show error toast |
| `login_prompt` | `DISMISS` | `unsaved` | - | Clear `loginPromptJobId` |
| `login_prompt` | `LOGIN` | `unsaved` | - | Redirect to `/auth/login?redirect={currentPath}` |
| `login_prompt` | `REGISTER` | `unsaved` | - | Redirect to `/auth/register` |

#### Optimistic Update Pattern

```typescript
// Save job with optimistic update
async function toggleSaveJob(jobId: string, currentlySaved: boolean) {
  // 1. Optimistic update
  const previousSaved = savedJobIds;
  setSavedJobIds(prev => 
    currentlySaved 
      ? prev.filter(id => id !== jobId)
      : [...prev, jobId]
  );
  
  try {
    // 2. Server action
    if (currentlySaved) {
      await CandidateUnsaveJob({ candidateId: uid, jobId });
    } else {
      await CandidateSaveJob({ candidateId: uid, jobId });
    }
    
    // 3. Invalidate cache
    mutate(`saved-jobs-${uid}`);
    
  } catch (error) {
    // 4. Revert on error
    setSavedJobIds(previousSaved);
    toast.error(currentlySaved 
      ? 'à¹„à¸¡à¹ˆà¸ªà¸²à¸¡à¸²à¸£à¸–à¸¢à¸à¹€à¸¥à¸´à¸à¸à¸²à¸£à¸šà¸±à¸™à¸—à¸¶à¸à¹„à¸”à¹‰' 
      : 'à¹„à¸¡à¹ˆà¸ªà¸²à¸¡à¸²à¸£à¸–à¸šà¸±à¸™à¸—à¸¶à¸à¸‡à¸²à¸™à¹„à¸”à¹‰'
    );
  }
}
```

#### Component Interface

```typescript
interface SaveJobButtonProps {
  jobId: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'button';  // icon = heart only, button = with text
  className?: string;
}

// Usage
<SaveJobButton jobId={job.uid} variant="icon" size="md" />
<SaveJobButton jobId={job.uid} variant="button" />
```

---

### 3.2 Login Prompt Modal

Shared modal for prompting unauthenticated users to log in when attempting protected actions.

#### Triggers

| Action | Route | Prompt Message |
|--------|-------|----------------|
| Save job | JOB-R01, JOB-R02 | à¹€à¸‚à¹‰à¸²à¸ªà¸¹à¹ˆà¸£à¸°à¸šà¸šà¹€à¸žà¸·à¹ˆà¸­à¸šà¸±à¸™à¸—à¸¶à¸à¸‡à¸²à¸™ |
| Apply for job | JOB-R02 | à¹€à¸‚à¹‰à¸²à¸ªà¸¹à¹ˆà¸£à¸°à¸šà¸šà¹€à¸žà¸·à¹ˆà¸­à¸ªà¸¡à¸±à¸„à¸£à¸‡à¸²à¸™ |
| View saved jobs | JOB-R04 | à¹€à¸‚à¹‰à¸²à¸ªà¸¹à¹ˆà¸£à¸°à¸šà¸šà¹€à¸žà¸·à¹ˆà¸­à¸”à¸¹à¸‡à¸²à¸™à¸—à¸µà¹ˆà¸šà¸±à¸™à¸—à¸¶à¸ |

#### Component Interface

```typescript
interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: 'save' | 'apply' | 'view_saved';
  redirectPath?: string;  // Where to return after login
  jobTitle?: string;      // Optional: show job context
}

// Translations
const loginPromptMessages: Record<LoginPromptAction, { title: string; message: string }> = {
  save: {
    title: 'à¸šà¸±à¸™à¸—à¸¶à¸à¸‡à¸²à¸™',
    message: 'à¹€à¸‚à¹‰à¸²à¸ªà¸¹à¹ˆà¸£à¸°à¸šà¸šà¹€à¸žà¸·à¹ˆà¸­à¸šà¸±à¸™à¸—à¸¶à¸à¸‡à¸²à¸™à¸—à¸µà¹ˆà¸ªà¸™à¹ƒà¸ˆà¹à¸¥à¸°à¸”à¸¹à¸ à¸²à¸¢à¸«à¸¥à¸±à¸‡',
  },
  apply: {
    title: 'à¸ªà¸¡à¸±à¸„à¸£à¸‡à¸²à¸™',
    message: 'à¹€à¸‚à¹‰à¸²à¸ªà¸¹à¹ˆà¸£à¸°à¸šà¸šà¹€à¸žà¸·à¹ˆà¸­à¸ªà¸¡à¸±à¸„à¸£à¸‡à¸²à¸™à¹à¸¥à¸°à¸•à¸´à¸”à¸•à¸²à¸¡à¸ªà¸–à¸²à¸™à¸°à¹ƒà¸šà¸ªà¸¡à¸±à¸„à¸£',
  },
  view_saved: {
    title: 'à¸‡à¸²à¸™à¸—à¸µà¹ˆà¸šà¸±à¸™à¸—à¸¶à¸',
    message: 'à¹€à¸‚à¹‰à¸²à¸ªà¸¹à¹ˆà¸£à¸°à¸šà¸šà¹€à¸žà¸·à¹ˆà¸­à¸”à¸¹à¸£à¸²à¸¢à¸à¸²à¸£à¸‡à¸²à¸™à¸—à¸µà¹ˆà¸„à¸¸à¸“à¸šà¸±à¸™à¸—à¸¶à¸à¹„à¸§à¹‰',
  },
};
```

#### Modal Layout

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                    âœ•                   â”‚
â”‚                                        â”‚
â”‚            ðŸ” [Icon]                   â”‚
â”‚                                        â”‚
â”‚         {title}                        â”‚
â”‚                                        â”‚
â”‚    {message}                           â”‚
â”‚                                        â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚         à¹€à¸‚à¹‰à¸²à¸ªà¸¹à¹ˆà¸£à¸°à¸šà¸š              â”‚  â”‚  â† Primary
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                        â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚         à¸ªà¸¡à¸±à¸„à¸£à¸ªà¸¡à¸²à¸Šà¸´à¸              â”‚  â”‚  â† Secondary
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                        â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

### 3.3 Job Unavailable States

Shared handling for jobs that are no longer available.

#### State Determination

```typescript
type JobAvailabilityState = 
  | 'available'      // Can view and apply
  | 'closed'         // Job manually closed
  | 'expired'        // Past expiry date
  | 'unpublished'    // Taken down temporarily
  | 'not_found';     // Doesn't exist

function getJobAvailability(job: JobData | null): JobAvailabilityState {
  if (!job) return 'not_found';
  if (job.jobStatus === 'closed') return 'closed';
  if (job.jobStatus === 'unpublished') return 'unpublished';
  if (job.postExpiryDate && job.postExpiryDate < Date.now()) return 'expired';
  if (!job.isActive) return 'closed';
  return 'available';
}
```

#### Display Mapping

| State | In List | In Detail | In Saved |
|-------|---------|-----------|----------|
| `available` | Normal card | Full detail + apply | Normal with link |
| `closed` | Hide from list | Gray banner, no apply | "à¹„à¸¡à¹ˆà¸žà¸£à¹‰à¸­à¸¡à¸£à¸±à¸šà¸ªà¸¡à¸±à¸„à¸£" badge, greyed |
| `expired` | Hide from list | Gray banner, no apply | "à¸«à¸¡à¸”à¸­à¸²à¸¢à¸¸à¹à¸¥à¹‰à¸§" badge, greyed |
| `unpublished` | Hide from list | 404 (unless owner) | "à¹„à¸¡à¹ˆà¸žà¸£à¹‰à¸­à¸¡à¸£à¸±à¸šà¸ªà¸¡à¸±à¸„à¸£" badge |
| `not_found` | N/A | 404 page | Remove from list |

#### Banner Component

```typescript
interface JobUnavailableBannerProps {
  state: 'closed' | 'expired' | 'unpublished';
}

const bannerMessages = {
  closed: 'à¸•à¸³à¹à¸«à¸™à¹ˆà¸‡à¸™à¸µà¹‰à¸›à¸´à¸”à¸£à¸±à¸šà¸ªà¸¡à¸±à¸„à¸£à¹à¸¥à¹‰à¸§',
  expired: 'à¸›à¸£à¸°à¸à¸²à¸¨à¸‡à¸²à¸™à¸«à¸¡à¸”à¸­à¸²à¸¢à¸¸à¹à¸¥à¹‰à¸§',
  unpublished: 'à¸‡à¸²à¸™à¸™à¸µà¹‰à¹„à¸¡à¹ˆà¸žà¸£à¹‰à¸­à¸¡à¹ƒà¸«à¹‰à¸ªà¸¡à¸±à¸„à¸£à¹ƒà¸™à¸‚à¸“à¸°à¸™à¸µà¹‰',
};
```

---

## 4. Shared Components

### 4.1 Job Card Component

Reusable job card used in job list, similar jobs, and saved jobs.

#### Variants

| Variant | Used In | Features |
|---------|---------|----------|
| `list` | JOB-R01 job list | Full info, horizontal layout |
| `compact` | Similar jobs carousel | Minimal info, vertical layout |
| `saved` | Saved jobs page | List variant + unavailable states |

#### Component Interface

```typescript
interface JobCardProps {
  job: JobCardData;
  variant?: 'list' | 'compact' | 'saved';
  showMatchScore?: boolean;      // Only for logged-in candidates
  showSaveButton?: boolean;      // Default true
  showApplyButton?: boolean;     // Only for list variant
  isUnavailable?: boolean;       // Greyed out state
  unavailableReason?: string;    // Badge text
  onClick?: () => void;          // Override navigation
}

interface JobCardData {
  uid: string;
  title: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  minSalary: number | null;
  maxSalary: number | null;
  isNegotiable: boolean;
  workLocationText: string;
  employmentText: string;
  experienceText: string;
  createdAt: number;
  _matchScore?: number;
}
```

#### Layout: List Variant

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”                                                â”‚
â”‚ â”‚ Logo â”‚  Job Title (bold, link)              [â™¡ Save] â”‚
â”‚ â”‚ 48Ã—48â”‚  Company Name (link)                          â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”˜                                                â”‚
â”‚          [Location] [Job Type] [Experience]             â”‚
â”‚                                                         â”‚
â”‚          à¸¿XX,XXX - à¸¿XX,XXX           à¹‚à¸žà¸ªà¸•à¹Œà¹€à¸¡à¸·à¹ˆà¸­ 2 à¸§à¸±à¸™    â”‚
â”‚                                                         â”‚
â”‚                                    [Match 85%] (if any) â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

#### Layout: Compact Variant

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚      â”Œâ”€â”€â”€â”€â”€â”€â”       â”‚
â”‚      â”‚ Logo â”‚       â”‚
â”‚      â”‚ 48Ã—48â”‚       â”‚
â”‚      â””â”€â”€â”€â”€â”€â”€â”˜       â”‚
â”‚                     â”‚
â”‚   Job Title         â”‚
â”‚   Company Name      â”‚
â”‚                     â”‚
â”‚   à¸¿XX,XXX-XX,XXX    â”‚
â”‚   [Location]        â”‚
â”‚                     â”‚
â”‚         [â™¡]         â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

### 4.2 Salary Display Component

Consistent salary formatting across all job displays.

```typescript
interface SalaryDisplayProps {
  minSalary: number | null;
  maxSalary: number | null;
  isNegotiable: boolean;
  size?: 'sm' | 'md' | 'lg';
  showCurrency?: boolean;  // Show à¸¿ symbol
}

function formatSalary(props: SalaryDisplayProps): string {
  const { minSalary, maxSalary, isNegotiable } = props;
  
  if (isNegotiable && !minSalary && !maxSalary) {
    return 'à¸•à¸²à¸¡à¸•à¸à¸¥à¸‡';
  }
  
  const format = (n: number) => n.toLocaleString('th-TH');
  
  if (minSalary && maxSalary) {
    if (minSalary === maxSalary) {
      return `à¸¿${format(minSalary)}`;
    }
    return `à¸¿${format(minSalary)} - à¸¿${format(maxSalary)}`;
  }
  
  if (minSalary) {
    return `à¸¿${format(minSalary)}+`;
  }
  
  if (maxSalary) {
    return `à¹„à¸¡à¹ˆà¹€à¸à¸´à¸™ à¸¿${format(maxSalary)}`;
  }
  
  return 'à¹„à¸¡à¹ˆà¸£à¸°à¸šà¸¸';
}
```

---

### 4.3 Posted Date Component

Relative time display in Thai.

```typescript
interface PostedDateProps {
  timestamp: number;
  prefix?: string;  // Default: "à¹‚à¸žà¸ªà¸•à¹Œà¹€à¸¡à¸·à¹ˆà¸­"
}

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const weeks = Math.floor(diff / 604800000);
  const months = Math.floor(diff / 2592000000);
  
  if (minutes < 1) return 'à¹€à¸¡à¸·à¹ˆà¸­à¸ªà¸±à¸à¸„à¸£à¸¹à¹ˆ';
  if (minutes < 60) return `${minutes} à¸™à¸²à¸—à¸µà¸—à¸µà¹ˆà¹à¸¥à¹‰à¸§`;
  if (hours < 24) return `${hours} à¸Šà¸±à¹ˆà¸§à¹‚à¸¡à¸‡à¸—à¸µà¹ˆà¹à¸¥à¹‰à¸§`;
  if (days === 1) return 'à¹€à¸¡à¸·à¹ˆà¸­à¸§à¸²à¸™';
  if (days < 7) return `${days} à¸§à¸±à¸™à¸—à¸µà¹ˆà¹à¸¥à¹‰à¸§`;
  if (weeks < 4) return `${weeks} à¸ªà¸±à¸›à¸”à¸²à¸«à¹Œà¸—à¸µà¹ˆà¹à¸¥à¹‰à¸§`;
  if (months < 12) return `${months} à¹€à¸”à¸·à¸­à¸™à¸—à¸µà¹ˆà¹à¸¥à¹‰à¸§`;
  
  // Fallback to date
  return new Date(timestamp).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
```

---

### 4.4 Job Badges Component

Consistent badge display for job attributes.

```typescript
type BadgeType = 
  | 'location'      // Map pin icon
  | 'employment'    // Briefcase icon
  | 'experience'    // Clock icon
  | 'education'     // Graduation cap icon
  | 'remote';       // Home/building icon

interface JobBadgeProps {
  type: BadgeType;
  value: string;
  size?: 'sm' | 'md';
}

const badgeIcons: Record<BadgeType, IconComponent> = {
  location: MapPinIcon,
  employment: BriefcaseIcon,
  experience: ClockIcon,
  education: AcademicCapIcon,
  remote: HomeIcon,
};
```



### 4.5 Application Status Badge Colors

Consistent color mapping for application status badges across all application views.

```typescript
/**
 * Application status badge color mapping
 * Used in: CAND-R04 (candidate applications), COMP-R08 (company applications)
 */
const applicationStatusColors: Record<ApplicationStatus, {
  bg: string;
  text: string;
  label: string;
  labelEn: string;
}> = {
  applied: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    label: 'รอตอบรับ',
    labelEn: 'Pending'
  },
  read: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    label: 'บริษัทดูแล้ว',
    labelEn: 'Viewed'
  },
  accepted: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    label: 'ตอบรับแล้ว',
    labelEn: 'Accepted'
  },
  rejected: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    label: 'ไม่ผ่าน',
    labelEn: 'Rejected'
  },
  scheduled: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    label: 'นัดสัมภาษณ์',
    labelEn: 'Interview Scheduled'
  },
  confirmed: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    label: 'ยืนยันแล้ว',
    labelEn: 'Interview Confirmed'
  },
  declined: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    label: 'ปฏิเสธสัมภาษณ์',
    labelEn: 'Interview Declined'
  },
  cancelled: {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    label: 'ยกเลิก',
    labelEn: 'Cancelled'
  },
  withdraw: {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    label: 'ถอนใบสมัคร',
    labelEn: 'Withdrawn'
  },
  closed: {
    bg: 'bg-gray-100',
    text: 'text-gray-500',
    label: 'ปิดรับแล้ว',
    labelEn: 'Position Closed'
  },
  systemclosed: {
    bg: 'bg-gray-100',
    text: 'text-gray-500',
    label: 'ระบบปิด',
    labelEn: 'System Closed'
  },
};

// Helper function for status badge rendering
function getApplicationStatusBadge(status: ApplicationStatus) {
  const config = applicationStatusColors[status];
  return {
    className: `${config.bg} ${config.text} px-2 py-1 rounded-full text-sm`,
    label: config.label,
  };
}
```

#### Status Badge Usage

```tsx
// In ApplicationCard or ApplicationRow component
<span className={getApplicationStatusBadge(application.status).className}>
  {getApplicationStatusBadge(application.status).label}
</span>
```

---

## 5. MeiliSearch Integration

### 5.1 Index Configuration

| Index | Collection | Purpose |
|-------|------------|---------|
| `job` | `jobs` | Job search and filtering |

### 5.2 Searchable Attributes

| Attribute | Weight | Notes |
|-----------|--------|-------|
| `title` | High | Job title |
| `companyName` | Medium | Company name |
| `jobFunctionText` | Medium | Job function |
| `jobDescriptionText` | Low | Description text (plain) |
| `qualificationText` | Low | Requirements text (plain) |

### 5.3 Filterable Attributes

| Attribute | Type | Used For |
|-----------|------|----------|
| `isActive` | boolean | Visibility filter |
| `jobStatus` | enum | Status filter |
| `postStartDate` | number | Date visibility |
| `postExpiryDate` | number | Expiry check |
| `workLocation` | string | Location filter |
| `employment` | string | Job type filter |
| `educationLevel` | array | Education filter |
| `minSalary` | number | Salary range |
| `maxSalary` | number | Salary range |
| `minExperienceYear` | number | Experience filter |
| `companyId` | string | Company jobs |

### 5.4 Base Filter (Always Applied)

```typescript
const baseJobFilter = [
  'isActive = true',
  'jobStatus IN [published, ontimer]',
  `postStartDate <= ${Date.now()}`,
];
```

### 5.5 Match Score Calculation

> âš ï¸ **Implementation Status: Future Enhancement (v2.0)**
> 
> MeiliSearch does not natively support profile-based matching. This feature requires a custom scoring service. For v1.0, match scores are **not displayed**.

**Future Implementation Approach:**

```typescript
// Option A: Pre-calculated scores (Recommended)
// Run nightly batch job to calculate and store match scores
interface CandidateJobMatch {
  candidateId: string;
  jobId: string;
  matchScore: number;  // 0.0 - 1.0
  calculatedAt: number;
}

// Option B: Real-time calculation (Performance concern)
// Calculate on-demand when candidate views job list
async function calculateMatchScore(
  candidateProfile: CandidatePreference,
  job: JobData
): Promise<number> {
  let score = 0;
  let totalWeight = 0;
  
  // Job function match (weight: 0.3)
  if (candidateProfile.preferredJobFunctions?.includes(job.jobFunction)) {
    score += 0.3;
  }
  totalWeight += 0.3;
  
  // Location match (weight: 0.2)
  if (candidateProfile.preferredLocations?.includes(job.workLocation)) {
    score += 0.2;
  }
  totalWeight += 0.2;
  
  // Salary match (weight: 0.3)
  if (job.minSalary && candidateProfile.expectedSalary) {
    if (job.minSalary <= candidateProfile.expectedSalary) {
      score += 0.3;
    }
  }
  totalWeight += 0.3;
  
  // Education match (weight: 0.2)
  if (meetsEducationRequirement(candidateProfile.educationLevel, job.educationLevel)) {
    score += 0.2;
  }
  totalWeight += 0.2;
  
  return score / totalWeight;
}

// Display format
function formatMatchScore(score: number): string {
  return `à¸•à¸£à¸‡ ${Math.round(score * 100)}%`;
}
```

**v1.0 Behavior:** Match score UI elements are hidden. Sort by "relevant" uses MeiliSearch text relevance only.

### 5.6 Timeout Configuration

**Standardized Timeout Values:**

| Operation | Timeout | Behavior on Timeout |
|-----------|---------|---------------------|
| MeiliSearch query | 5 seconds | Show loading indicator at 3s, fallback to Firestore at 5s |
| Firestore fallback | 10 seconds | Show error state with retry |
| Save/unsave job | 5 seconds | Revert optimistic update, show toast |
| Apply for job | 10 seconds | Keep modal open, show error |

```typescript
const TIMEOUT_CONFIG = {
  MEILISEARCH: 5000,
  MEILISEARCH_WARNING: 3000,  // Show "à¸à¸³à¸¥à¸±à¸‡à¸„à¹‰à¸™à¸«à¸²à¸™à¸²à¸™à¸à¸§à¹ˆà¸²à¸›à¸à¸•à¸´..."
  FIRESTORE: 10000,
  MUTATION: 5000,
  APPLICATION: 10000,
} as const;
```

### 5.7 Fallback Strategy

When MeiliSearch is unavailable:

```typescript
async function searchJobsWithFallback(params: SearchParams): Promise<SearchResult> {
  try {
    // Primary: MeiliSearch
    const result = await meiliSearchJobs(params);
    return { ...result, isFallback: false };
  } catch (error) {
    console.warn('MeiliSearch unavailable, falling back to Firestore');
    
    // Fallback: Firestore with client-side filtering
    const firestoreResult = await firestoreSearchJobs(params);
    return { ...firestoreResult, isFallback: true };
  }
}
```

---

## 6. Server Actions

### 6.1 Action Registry

| Action | Domain | Purpose | Auth Required |
|--------|--------|---------|---------------|
| `JobPostGet` | Jobs | Get single job detail | No |
| `JobPostGetByFilterV3` | Jobs | Search jobs with filters | No |
| `JobApplicationSet` | Jobs | Create application | Yes (candidate) |
| `JobApplicationGetByCandidate` | Jobs | Check existing application | Yes (candidate) |
| `CandidateSaveJob` | Candidate | Save job to list | Yes (candidate) |
| `CandidateUnsaveJob` | Candidate | Remove from saved | Yes (candidate) |
| `GetSimilarJobs` | Jobs | Get related jobs | No |

### 6.2 Action Signatures

```typescript
// Job retrieval
async function JobPostGet(jobId: string): Promise<JobDetailData | null>;

async function JobPostGetByFilterV3(params: {
  keyword?: string;
  educationLevels?: string[];
  jobFunctions?: string[];
  minSalary?: number;
  maxSalary?: number;
  workLocations?: string[];
  page?: number;
  pageSize?: number;
}): Promise<{
  data: JobCardData[];
  totalCount: number;
  totalPages: number;
}>;

// Applications
async function JobApplicationSet(input: {
  jobId: string;
  candidateId: string;
  expectedSalary?: number;
  isNegotiable?: boolean;
  overheadDays?: number;
  headlines?: string;
}): Promise<{ status: number; data: string }>;

async function JobApplicationGetByCandidate(
  candidateId: string,
  jobId: string
): Promise<ApplicationData | null>;

// Saved jobs
async function CandidateSaveJob(params: {
  candidateId: string;
  jobId: string;
}): Promise<{ success: boolean }>;

async function CandidateUnsaveJob(params: {
  candidateId: string;
  jobId: string;
}): Promise<{ success: boolean }>;

// Similar jobs
async function GetSimilarJobs(
  jobId: string,
  limit?: number
): Promise<JobCardData[]>;
```

### 6.3 Error Handling

| Error Code | Meaning | UI Action |
|------------|---------|-----------|
| `UNAUTHORIZED` | Not logged in | Show login prompt |
| `JOB_NOT_FOUND` | Job doesn't exist | Show 404 |
| `ALREADY_APPLIED` | Duplicate application | Show applied state |
| `PROFILE_INCOMPLETE` | Missing required fields | Show profile block |
| `JOB_CLOSED` | Job no longer accepting | Show closed banner |
| `RATE_LIMITED` | Too many attempts | Show wait message |

---

## 7. SWR Cache Keys

### 7.1 Key Registry

| Key Pattern | Purpose | Config | Invalidate On |
|-------------|---------|--------|---------------|
| `job-${id}` | Single job detail | `defaultSWRConfig` | Job update |
| `jobs-list-${filterHash}` | Search results | `infiniteSWRConfig` | New job, job status change |
| `saved-jobs-${uid}` | User's saved job IDs | `defaultSWRConfig` | Save/unsave action |
| `similar-jobs-${jobId}` | Similar job recommendations | `staticSWRConfig` | Rarely |
| `application-${uid}-${jobId}` | Existing application check | `defaultSWRConfig` | Apply/withdraw |
| `job-application-count-${id}` | Application count | `backgroundSWRConfig` | New application |
| `master-data-provinces` | Province dropdown | `staticSWRConfig` | Never |
| `master-data-education_levels` | Education dropdown | `staticSWRConfig` | Never |
| `master-data-employment_types` | Job type dropdown | `staticSWRConfig` | Never |

### 7.2 Invalidation Patterns

```typescript
// After saving a job
async function onSaveJob(jobId: string, uid: string) {
  await mutate(`saved-jobs-${uid}`);
}

// After applying for a job
async function onApply(jobId: string, uid: string) {
  await mutate(`application-${uid}-${jobId}`);
  await mutate(`job-application-count-${jobId}`);
  await mutate(`saved-jobs-${uid}`); // May auto-save on apply
}

// After job status change (company side)
async function onJobStatusChange(jobId: string) {
  await mutate(`job-${jobId}`);
  await mutate((key) => 
    typeof key === 'string' && key.startsWith('jobs-list')
  );
}
```

---

## 8. Global State (Atoms)

### 8.1 Jobs Domain Atoms

| Atom | Type | Purpose | Scope |
|------|------|---------|-------|
| `savedJobIdsAtom` | `string[]` | Cached saved job IDs | Session |
| `jobSearchFiltersAtom` | `FilterState` | Current search filters | Session |
| `loginPromptJobIdAtom` | `string \| null` | Job that triggered login | Transient |

### 8.2 Shared Atoms (from other domains)

| Atom | Source | Used For |
|------|--------|----------|
| `userAtom` | Auth | Check login state |
| `candidateAtom` | Candidate | Profile completion check |
| `activeRoleAtom` | Auth | Shell determination |
| `sessionStateAtom` | Auth | Auth state |

---

## 9. Error Handling Patterns

### 9.1 Network Errors

```typescript
const networkErrorMessages = {
  TIMEOUT: {
    th: 'à¸à¸²à¸£à¹€à¸Šà¸·à¹ˆà¸­à¸¡à¸•à¹ˆà¸­à¸«à¸¡à¸”à¹€à¸§à¸¥à¸² à¸à¸£à¸¸à¸“à¸²à¸¥à¸­à¸‡à¹ƒà¸«à¸¡à¹ˆ',
    en: 'Connection timed out. Please try again.',
  },
  OFFLINE: {
    th: 'à¹„à¸¡à¹ˆà¸ªà¸²à¸¡à¸²à¸£à¸–à¹€à¸Šà¸·à¹ˆà¸­à¸¡à¸•à¹ˆà¸­à¹„à¸”à¹‰ à¸à¸£à¸¸à¸“à¸²à¸•à¸£à¸§à¸ˆà¸ªà¸­à¸šà¸­à¸´à¸™à¹€à¸—à¸­à¸£à¹Œà¹€à¸™à¹‡à¸•',
    en: 'Unable to connect. Please check your internet.',
  },
  SERVER_ERROR: {
    th: 'à¹€à¸à¸´à¸”à¸‚à¹‰à¸­à¸œà¸´à¸”à¸žà¸¥à¸²à¸” à¸à¸£à¸¸à¸“à¸²à¸¥à¸­à¸‡à¹ƒà¸«à¸¡à¹ˆà¸ à¸²à¸¢à¸«à¸¥à¸±à¸‡',
    en: 'Something went wrong. Please try again later.',
  },
};
```

### 9.2 Toast Notifications

| Action | Success | Error |
|--------|---------|-------|
| Save job | "à¸šà¸±à¸™à¸—à¸¶à¸à¸‡à¸²à¸™à¹à¸¥à¹‰à¸§" | "à¹„à¸¡à¹ˆà¸ªà¸²à¸¡à¸²à¸£à¸–à¸šà¸±à¸™à¸—à¸¶à¸à¸‡à¸²à¸™à¹„à¸”à¹‰" |
| Unsave job | "à¸¢à¸à¹€à¸¥à¸´à¸à¸à¸²à¸£à¸šà¸±à¸™à¸—à¸¶à¸à¹à¸¥à¹‰à¸§" | "à¹„à¸¡à¹ˆà¸ªà¸²à¸¡à¸²à¸£à¸–à¸¢à¸à¹€à¸¥à¸´à¸à¸à¸²à¸£à¸šà¸±à¸™à¸—à¸¶à¸à¹„à¸”à¹‰" |
| Apply | "à¸ªà¹ˆà¸‡à¹ƒà¸šà¸ªà¸¡à¸±à¸„à¸£à¹€à¸£à¸µà¸¢à¸šà¸£à¹‰à¸­à¸¢" | "à¹„à¸¡à¹ˆà¸ªà¸²à¸¡à¸²à¸£à¸–à¸ªà¹ˆà¸‡à¹ƒà¸šà¸ªà¸¡à¸±à¸„à¸£à¹„à¸”à¹‰" |
| Withdraw | "à¸–à¸­à¸™à¹ƒà¸šà¸ªà¸¡à¸±à¸„à¸£à¹à¸¥à¹‰à¸§" | "à¹„à¸¡à¹ˆà¸ªà¸²à¸¡à¸²à¸£à¸–à¸–à¸­à¸™à¹ƒà¸šà¸ªà¸¡à¸±à¸„à¸£à¹„à¸”à¹‰" |

---

## 10. i18n & Copy Guidelines

### 10.1 Common Labels

| Key | Thai | English |
|-----|------|---------|
| `job.search` | à¸„à¹‰à¸™à¸«à¸²à¸‡à¸²à¸™ | Find Jobs |
| `job.apply` | à¸ªà¸¡à¸±à¸„à¸£à¸‡à¸²à¸™ | Apply Now |
| `job.save` | à¸šà¸±à¸™à¸—à¸¶à¸ | Save |
| `job.saved` | à¸šà¸±à¸™à¸—à¸¶à¸à¹à¸¥à¹‰à¸§ | Saved |
| `job.share` | à¹à¸Šà¸£à¹Œ | Share |
| `job.closed` | à¸›à¸´à¸”à¸£à¸±à¸šà¸ªà¸¡à¸±à¸„à¸£à¹à¸¥à¹‰à¸§ | Closed |
| `job.expired` | à¸«à¸¡à¸”à¸­à¸²à¸¢à¸¸à¹à¸¥à¹‰à¸§ | Expired |
| `job.positions` | {count} à¸•à¸³à¹à¸«à¸™à¹ˆà¸‡ | {count} positions |
| `job.applicants` | {count} à¸„à¸™à¸ªà¸¡à¸±à¸„à¸£à¹à¸¥à¹‰à¸§ | {count} applicants |
| `job.posted` | à¹‚à¸žà¸ªà¸•à¹Œà¹€à¸¡à¸·à¹ˆà¸­ {time} | Posted {time} |
| `job.deadline` | à¸›à¸´à¸”à¸£à¸±à¸šà¸ªà¸¡à¸±à¸„à¸£ {date} | Closes {date} |
| `salary.negotiable` | à¸•à¸²à¸¡à¸•à¸à¸¥à¸‡ | Negotiable |
| `salary.unspecified` | à¹„à¸¡à¹ˆà¸£à¸°à¸šà¸¸ | Not specified |

### 10.2 Filter Labels

| Key | Thai | English |
|-----|------|---------|
| `filter.all` | à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸” | All |
| `filter.clear` | à¸¥à¹‰à¸²à¸‡à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸” | Clear All |
| `filter.apply` | à¹à¸ªà¸”à¸‡à¸œà¸¥à¸¥à¸±à¸žà¸˜à¹Œ | Show Results |
| `filter.jobType` | à¸›à¸£à¸°à¹€à¸ à¸—à¸‡à¸²à¸™ | Job Type |
| `filter.salary` | à¹€à¸‡à¸´à¸™à¹€à¸”à¸·à¸­à¸™ | Salary |
| `filter.location` | à¸ªà¸–à¸²à¸™à¸—à¸µà¹ˆ | Location |
| `filter.education` | à¸£à¸°à¸”à¸±à¸šà¸à¸²à¸£à¸¨à¸¶à¸à¸©à¸² | Education |
| `filter.experience` | à¸›à¸£à¸°à¸ªà¸šà¸à¸²à¸£à¸“à¹Œ | Experience |
| `filter.remote` | à¸à¸²à¸£à¸—à¸³à¸‡à¸²à¸™à¸£à¸°à¸¢à¸°à¹„à¸à¸¥ | Remote Work |

### 10.3 Employment Types

| Code | Thai | English |
|------|------|---------|
| `fulltime` | à¸‡à¸²à¸™à¸›à¸£à¸°à¸ˆà¸³ | Full-time |
| `parttime` | à¸‡à¸²à¸™à¸žà¸²à¸£à¹Œà¸—à¹„à¸—à¸¡à¹Œ | Part-time |
| `contract` | à¸ªà¸±à¸à¸à¸²à¸ˆà¹‰à¸²à¸‡ | Contract |
| `internship` | à¸à¸¶à¸à¸‡à¸²à¸™ | Internship |

### 10.4 Sort Options

| Code | Thai | English |
|------|------|---------|
| `newest` | à¹ƒà¸«à¸¡à¹ˆà¸ªà¸¸à¸” | Newest |
| `salary_desc` | à¹€à¸‡à¸´à¸™à¹€à¸”à¸·à¸­à¸™à¸¡à¸²à¸-à¸™à¹‰à¸­à¸¢ | Salary High-Low |
| `salary_asc` | à¹€à¸‡à¸´à¸™à¹€à¸”à¸·à¸­à¸™à¸™à¹‰à¸­à¸¢-à¸¡à¸²à¸ | Salary Low-High |
| `relevant` | à¸•à¸£à¸‡à¸—à¸µà¹ˆà¸ªà¸¸à¸” | Most Relevant |

---

## 11. Analytics Events

### 11.1 Job Search Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `job_search` | Search submitted | `query`, `filters`, `resultCount` |
| `job_filter_applied` | Filter changed | `filterType`, `filterValue` |
| `job_sort_changed` | Sort changed | `sortBy` |
| `job_pagination` | Page changed | `page`, `totalPages` |

### 11.2 Job Interaction Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `job_viewed` | Job detail opened | `jobId`, `companyId`, `source` |
| `job_saved` | Save button clicked | `jobId`, `source` |
| `job_unsaved` | Unsave clicked | `jobId`, `source` |
| `job_apply_started` | Apply modal opened | `jobId` |
| `job_apply_submitted` | Application submitted | `jobId`, `expectedSalary`, `hasHeadlines` |
| `job_share` | Share clicked | `jobId`, `shareMethod` |

### 11.3 Conversion Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `job_apply_completed` | Application confirmed | `jobId`, `isFirstApplication` |
| `job_login_prompt_shown` | Login prompt displayed | `action`, `jobId` |
| `job_login_prompt_converted` | User logged in from prompt | `action`, `jobId` |

---

## 12. Performance Guidelines

### 12.1 Image Optimization

| Image Type | Size | Format | Loading |
|------------|------|--------|---------|
| Company logo (list) | 48Ã—48 | WebP | Lazy |
| Company logo (detail) | 80Ã—80 | WebP | Eager |
| Company logo (similar) | 48Ã—48 | WebP | Lazy |

### 12.2 Data Fetching

| Data | Strategy | Priority |
|------|----------|----------|
| Job list | Paginated, 20/page | High |
| Job detail | Single fetch | High |
| Similar jobs | Deferred load | Low |
| Application count | Background | Low |
| Saved jobs | Parallel with main | Medium |

### 12.3 Skeleton Loaders

See **Section 15: Loading States & Skeletons** for detailed specifications.

---

## 13. Rate Limiting

### 13.1 Application Rate Limits

| Action | Limit | Window | Scope |
|--------|-------|--------|-------|
| Apply for job | 10 applications | 1 hour | Per candidate |
| Save/unsave job | 30 actions | 1 minute | Per candidate |
| Job search | 60 requests | 1 minute | Per IP |

### 13.2 Rate Limit Response

```typescript
interface RateLimitError {
  code: 'E_RATE_LIMITED';
  retryAfter: number;  // Seconds until reset
  message: string;
}

// Display countdown
function formatRetryTime(seconds: number): string {
  if (seconds < 60) return `${seconds} à¸§à¸´à¸™à¸²à¸—à¸µ`;
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} à¸™à¸²à¸—à¸µ`;
}
```

### 13.3 UI Handling

| Action | On Rate Limit | Display |
|--------|---------------|---------|
| Apply | Keep modal open | "à¸„à¸¸à¸“à¸ªà¸¡à¸±à¸„à¸£à¸‡à¸²à¸™à¸šà¹ˆà¸­à¸¢à¹€à¸à¸´à¸™à¹„à¸› à¸à¸£à¸¸à¸“à¸²à¸£à¸­ {time}" |
| Save | Disable button | Tooltip: "à¸£à¸­à¸ªà¸±à¸à¸„à¸£à¸¹à¹ˆ..." |
| Search | Show results | Toast: "à¸à¸£à¸¸à¸“à¸²à¸£à¸­à¸ªà¸±à¸à¸„à¸£à¸¹à¹ˆà¸à¹ˆà¸­à¸™à¸„à¹‰à¸™à¸«à¸²à¹ƒà¸«à¸¡à¹ˆ" |

---

## 14. Accessibility (a11y)

### 14.1 General Requirements

| Requirement | Implementation |
|-------------|----------------|
| Color contrast | Minimum 4.5:1 for text, 3:1 for large text |
| Focus visible | 2px solid outline, offset 2px |
| Touch targets | Minimum 44Ã—44px |
| Motion | Respect `prefers-reduced-motion` |

### 14.2 Keyboard Navigation

| Component | Keys | Action |
|-----------|------|--------|
| Job card | `Enter`, `Space` | Navigate to job detail |
| Save button | `Enter`, `Space` | Toggle save state |
| Filter checkbox | `Space` | Toggle selection |
| Salary slider | `â†` `â†’` | Adjust value by step |
| Modal | `Escape` | Close modal |
| Dropdown | `â†‘` `â†“` | Navigate options |
| Dropdown | `Enter` | Select option |
| Dropdown | `Escape` | Close dropdown |

### 14.3 ARIA Labels

```tsx
// Job Card
<article 
  aria-label={`${job.title} à¸—à¸µà¹ˆ ${job.companyName}`}
  role="listitem"
>
  <button
    aria-label={isSaved ? 'à¸¢à¸à¹€à¸¥à¸´à¸à¸à¸²à¸£à¸šà¸±à¸™à¸—à¸¶à¸à¸‡à¸²à¸™à¸™à¸µà¹‰' : 'à¸šà¸±à¸™à¸—à¸¶à¸à¸‡à¸²à¸™à¸™à¸µà¹‰'}
    aria-pressed={isSaved}
  >
    <HeartIcon />
  </button>
</article>

// Filter Section
<section aria-labelledby="filter-heading">
  <h2 id="filter-heading">à¸•à¸±à¸§à¸à¸£à¸­à¸‡</h2>
  <div role="group" aria-label="à¸›à¸£à¸°à¹€à¸ à¸—à¸‡à¸²à¸™">
    <input 
      type="checkbox" 
      id="fulltime"
      aria-describedby="fulltime-count"
    />
    <label htmlFor="fulltime">à¸‡à¸²à¸™à¸›à¸£à¸°à¸ˆà¸³</label>
    <span id="fulltime-count" aria-hidden="true">(123)</span>
  </div>
</section>

// Search Results
<div 
  role="status" 
  aria-live="polite"
  aria-atomic="true"
>
  à¸žà¸š {count} à¸‡à¸²à¸™
</div>

// Loading State
<div role="status" aria-busy="true" aria-label="à¸à¸³à¸¥à¸±à¸‡à¹‚à¸«à¸¥à¸”">
  <Spinner />
</div>

// Apply Modal
<dialog
  aria-labelledby="apply-modal-title"
  aria-describedby="apply-modal-desc"
>
  <h2 id="apply-modal-title">à¸ªà¸¡à¸±à¸„à¸£à¸‡à¸²à¸™</h2>
  <p id="apply-modal-desc">à¸à¸£à¸­à¸à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¹€à¸žà¸·à¹ˆà¸­à¸ªà¸¡à¸±à¸„à¸£à¸•à¸³à¹à¸«à¸™à¹ˆà¸‡ {job.title}</p>
</dialog>
```

### 14.4 Focus Management

| Scenario | Focus Target |
|----------|--------------|
| Modal opens | First focusable element in modal |
| Modal closes | Element that triggered modal |
| Filter applied | Results count announcement |
| Page change | Top of results list |
| Error occurs | Error message |
| Toast appears | Toast (for action toasts only) |

### 14.5 Screen Reader Announcements

```typescript
// Announce state changes
function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const el = document.createElement('div');
  el.setAttribute('role', 'status');
  el.setAttribute('aria-live', priority);
  el.setAttribute('aria-atomic', 'true');
  el.className = 'sr-only';
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

// Usage
announceToScreenReader('à¸šà¸±à¸™à¸—à¸¶à¸à¸‡à¸²à¸™à¹à¸¥à¹‰à¸§');
announceToScreenReader('à¸ªà¹ˆà¸‡à¹ƒà¸šà¸ªà¸¡à¸±à¸„à¸£à¹€à¸£à¸µà¸¢à¸šà¸£à¹‰à¸­à¸¢');
announceToScreenReader('à¸žà¸š 42 à¸‡à¸²à¸™', 'polite');
```

---

## 15. Loading States & Skeletons

### 15.1 Job Card Skeleton

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”                                                â”‚
â”‚ â”‚â–“â–“â–“â–“â–“â–“â”‚  â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘     [â–‘â–‘â–‘â–‘]  â”‚
â”‚ â”‚â–“â–“â–“â–“â–“â–“â”‚  â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘              â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”˜                                                â”‚
â”‚          [â–ˆâ–ˆâ–ˆâ–ˆâ–‘â–‘] [â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–‘â–‘] [â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–‘â–‘]               â”‚
â”‚                                                         â”‚
â”‚          â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–‘â–‘â–‘â–‘           â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–‘â–‘â–‘â–‘        â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

Legend: â–ˆ = Animated shimmer, â–‘ = Static gray, â–“ = Image placeholder
```

```tsx
interface JobCardSkeletonProps {
  variant: 'list' | 'compact';
}

function JobCardSkeleton({ variant }: JobCardSkeletonProps) {
  if (variant === 'compact') {
    return (
      <div className="animate-pulse p-4 rounded-lg border">
        <div className="w-12 h-12 bg-gray-200 rounded mx-auto mb-3" />
        <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
        <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto mb-3" />
        <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto" />
      </div>
    );
  }
  
  return (
    <div className="animate-pulse p-4 rounded-lg border flex gap-4">
      <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0" />
      <div className="flex-1">
        <div className="h-5 bg-gray-200 rounded w-2/3 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 rounded w-16" />
          <div className="h-6 bg-gray-200 rounded w-20" />
          <div className="h-6 bg-gray-200 rounded w-14" />
        </div>
      </div>
      <div className="w-8 h-8 bg-gray-200 rounded" />
    </div>
  );
}
```

### 15.2 Job List Skeleton

```tsx
function JobListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4" role="status" aria-label="à¸à¸³à¸¥à¸±à¸‡à¹‚à¸«à¸¥à¸”à¸£à¸²à¸¢à¸à¸²à¸£à¸‡à¸²à¸™">
      {Array.from({ length: count }).map((_, i) => (
        <JobCardSkeleton key={i} variant="list" />
      ))}
    </div>
  );
}
```

### 15.3 Job Detail Skeleton

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”                                                      â”‚
â”‚ â”‚â–“â–“â–“â–“â–“â–“â–“â–“â”‚  â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â”‚
â”‚ â”‚â–“â–“â–“â–“â–“â–“â–“â–“â”‚  â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â”‚
â”‚ â”‚â–“â–“â–“â–“â–“â–“â–“â–“â”‚                                                      â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”˜  [â–ˆâ–ˆâ–ˆâ–ˆâ–‘â–‘] [â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–‘â–‘] [â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–‘â–‘] [â–ˆâ–ˆâ–ˆâ–ˆâ–‘â–‘]           â”‚
â”‚                                                                 â”‚
â”‚             â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘           â”‚
â”‚             â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘           â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
â”‚                               â”‚                                 â”‚
â”‚  â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–‘â–‘â–‘â–‘â–‘â–‘â–‘  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–‘  â”‚  â”‚ â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–‘â–‘â–‘â–‘â–‘â–‘â–‘ â”‚   â”‚
â”‚  â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘  â”‚  â”‚                         â”‚   â”‚
â”‚  â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–‘â–‘â–‘â–‘â–‘  â”‚  â”‚ [â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ]  â”‚   â”‚
â”‚  â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘  â”‚  â”‚ [â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ]      â”‚   â”‚
â”‚                               â”‚  â”‚                         â”‚   â”‚
â”‚  â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–‘â–‘â–‘â–‘â–‘â–‘â–‘  â”‚  â”‚ â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘  â”‚   â”‚
â”‚  â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–‘  â”‚  â”‚ â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘  â”‚   â”‚
â”‚  â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 15.4 Loading State Guidelines

| State | Duration | UI Change |
|-------|----------|-----------|
| Initial | 0-300ms | Nothing (avoid flash) |
| Short | 300ms-2s | Show skeleton |
| Medium | 2-5s | Skeleton + "à¸à¸³à¸¥à¸±à¸‡à¹‚à¸«à¸¥à¸”..." |
| Long | 5s+ | Skeleton + "à¹ƒà¸Šà¹‰à¹€à¸§à¸¥à¸²à¸™à¸²à¸™à¸à¸§à¹ˆà¸²à¸›à¸à¸•à¸´..." |
| Timeout | 5s+ (search) | Error state with retry |

```typescript
function useDelayedLoading(isLoading: boolean, delay = 300) {
  const [showSkeleton, setShowSkeleton] = useState(false);
  
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => setShowSkeleton(true), delay);
      return () => clearTimeout(timer);
    }
    setShowSkeleton(false);
  }, [isLoading, delay]);
  
  return showSkeleton;
}
```

---

## 16. Implementation Notes

### 16.1 State Type Classification

Different states require different implementation approaches:

| State Type | Description | Implementation | Example |
|------------|-------------|----------------|---------|
| **True State Machine** | Has events, transitions, side effects | `useReducer` or XState | Save Job, Apply Flow |
| **Computed/Derived State** | Calculated from data, no events | `useMemo` | Sidebar state, Job availability |
| **Server State** | Fetched from API, cached | SWR | Job list, Job detail |
| **UI State** | Local, ephemeral | `useState` | Modal open, Filter panel open |

### 16.2 Sidebar State is Computed, Not a State Machine

The Apply Sidebar in JOB-R02 has 6 "states" but they're actually computed from conditions:

```typescript
// âŒ Don't implement as state machine
const [sidebarState, dispatch] = useReducer(sidebarReducer, 'determine');

// âœ… Implement as computed state
type SidebarState = 'guest' | 'incomplete' | 'ready' | 'applying' | 'applied' | 'closed';

function useSidebarState(
  isLoggedIn: boolean,
  isResumeCompleted: boolean,
  hasApplication: boolean,
  jobStatus: JobStatus,
  isExpired: boolean,
  isApplying: boolean
): SidebarState {
  return useMemo(() => {
    if (isApplying) return 'applying';
    if (!isLoggedIn) return 'guest';
    if (jobStatus === 'closed' || isExpired) return 'closed';
    if (hasApplication) return 'applied';
    if (!isResumeCompleted) return 'incomplete';
    return 'ready';
  }, [isLoggedIn, isResumeCompleted, hasApplication, jobStatus, isExpired, isApplying]);
}
```

### 16.3 True State Machines to Implement

These genuinely need state machine treatment:

1. **Save Job Automaton** - Multiple async transitions, error recovery
2. **Apply Modal Automaton** - Form state, submission state, error handling
3. **Page State Automaton** - Loading, success, error states with retry

### 16.4 URL State Synchronization

```typescript
// Filter state â†” URL synchronization
function useJobFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Read from URL
  const filters = useMemo(() => urlToFilterState(searchParams), [searchParams]);
  
  // Write to URL (debounced)
  const setFilters = useCallback((newFilters: FilterState) => {
    const params = filterStateToURL(newFilters);
    router.push(`/jobs?${params.toString()}`, { scroll: false });
  }, [router]);
  
  return [filters, setFilters] as const;
}
```

### 16.5 Optimistic Update Pattern

```typescript
// Standard pattern for mutations with rollback
async function optimisticMutation<T>({
  optimisticUpdate,
  serverAction,
  onSuccess,
  onError,
  rollback,
}: {
  optimisticUpdate: () => void;
  serverAction: () => Promise<T>;
  onSuccess: (result: T) => void;
  onError: (error: Error) => void;
  rollback: () => void;
}) {
  // 1. Optimistic update
  optimisticUpdate();
  
  try {
    // 2. Server action
    const result = await serverAction();
    
    // 3. Confirm success
    onSuccess(result);
  } catch (error) {
    // 4. Rollback on failure
    rollback();
    onError(error as Error);
  }
}
```

---

## 17. Test Scenarios

### 17.1 Job List (JOB-R01)

| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| R01-01 | Initial load | Navigate to `/jobs` | Show skeleton, then job list |
| R01-02 | Empty results | Search for "xyznonexistent" | Show empty state with clear filter CTA |
| R01-03 | Filter by location | Select "à¸à¸£à¸¸à¸‡à¹€à¸—à¸žà¸¡à¸«à¸²à¸™à¸„à¸£" | URL updates, results filtered |
| R01-04 | Clear all filters | Click "à¸¥à¹‰à¸²à¸‡à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸”" | All filters reset, URL cleaned |
| R01-05 | Pagination | Click page 2 | URL updates, scroll to top, new results |
| R01-06 | Sort by salary | Select "à¹€à¸‡à¸´à¸™à¹€à¸”à¸·à¸­à¸™à¸¡à¸²à¸-à¸™à¹‰à¸­à¸¢" | Results reorder, URL updates |
| R01-07 | Guest save job | Click heart icon | Login prompt modal appears |
| R01-08 | Logged-in save job | Click heart icon | Heart fills, toast shows |
| R01-09 | Unsave job | Click filled heart | Heart empties, toast shows |
| R01-10 | Save error | Click heart (network off) | Heart reverts, error toast |
| R01-11 | Mobile filter | Tap filter button | Bottom sheet opens |
| R01-12 | Mobile apply filters | Apply in bottom sheet | Sheet closes, results update |
| R01-13 | Back navigation | Apply filter, browser back | Previous filter state restored |
| R01-14 | Share filtered URL | Copy URL with filters | Recipient sees same filters |
| R01-15 | Invalid page number | Navigate to `?page=999` | Redirect to page 1 |

### 17.2 Job Detail (JOB-R02)

| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| R02-01 | Load job detail | Navigate to `/jobs/[id]` | Show skeleton, then job content |
| R02-02 | Job not found | Navigate to `/jobs/invalid` | Show 404 page |
| R02-03 | Job closed | View closed job | Content visible, gray banner, no apply |
| R02-04 | Guest apply | Click "à¸ªà¸¡à¸±à¸„à¸£à¸‡à¸²à¸™" | Login prompt appears |
| R02-05 | Incomplete profile apply | Click "à¸ªà¸¡à¸±à¸„à¸£à¸‡à¸²à¸™" | Scroll to profile block |
| R02-06 | Complete profile apply | Click "à¸ªà¸¡à¸±à¸„à¸£à¸‡à¸²à¸™" | Apply modal opens |
| R02-07 | Submit application | Fill form, submit | Success toast, show applied card |
| R02-08 | Already applied | Revisit job | Show applied card with status |
| R02-09 | Apply network error | Submit (network off) | Error toast, modal stays open |
| R02-10 | Deep link apply | Navigate to `?apply=true` | Scroll to apply, focus button |
| R02-11 | Similar jobs load | Scroll to similar | Show carousel, lazy load images |
| R02-12 | Click similar job | Click card | Navigate to that job |
| R02-13 | Company link | Click company name | Navigate to company profile |
| R02-14 | Mobile apply bar | Scroll down (mobile) | Fixed bar appears at bottom |
| R02-15 | Rate limited apply | Submit 11th application/hour | Show rate limit message |

### 17.3 Cross-Cutting (JOB-R00)

| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| R00-01 | Login redirect save | Save â†’ Login â†’ Return | Job saved after return |
| R00-02 | Login redirect apply | Apply â†’ Login â†’ Return | Apply modal opens |
| R00-03 | Session expired | Save with expired session | Redirect to login |
| R00-04 | Offline detection | Toggle offline | Show offline message |
| R00-05 | MeiliSearch fallback | MeiliSearch unavailable | Firestore results, notice shown |
| R00-06 | Concurrent saves | Rapid save/unsave | Final state consistent |

---

## Appendix A: Error Code Reference

| Code | HTTP | Message (Thai) | Recovery |
|------|------|----------------|----------|
| `E_JOB_NOT_FOUND` | 404 | à¹„à¸¡à¹ˆà¸žà¸šà¸‡à¸²à¸™à¸—à¸µà¹ˆà¸„à¸¸à¸“à¸à¸³à¸¥à¸±à¸‡à¸„à¹‰à¸™à¸«à¸² | Link to /jobs |
| `E_JOB_CLOSED` | 410 | à¸•à¸³à¹à¸«à¸™à¹ˆà¸‡à¸™à¸µà¹‰à¸›à¸´à¸”à¸£à¸±à¸šà¸ªà¸¡à¸±à¸„à¸£à¹à¸¥à¹‰à¸§ | Show banner |
| `E_JOB_EXPIRED` | 410 | à¸›à¸£à¸°à¸à¸²à¸¨à¸‡à¸²à¸™à¸«à¸¡à¸”à¸­à¸²à¸¢à¸¸à¹à¸¥à¹‰à¸§ | Show banner |
| `E_ALREADY_APPLIED` | 409 | à¸„à¸¸à¸“à¸ªà¸¡à¸±à¸„à¸£à¸‡à¸²à¸™à¸™à¸µà¹‰à¹à¸¥à¹‰à¸§ | Show applied state |
| `E_PROFILE_INCOMPLETE` | 403 | à¸à¸£à¸¸à¸“à¸²à¸à¸£à¸­à¸à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¹ƒà¸«à¹‰à¸„à¸£à¸šà¸à¹ˆà¸­à¸™à¸ªà¸¡à¸±à¸„à¸£ | Link to profile |
| `E_UNAUTHORIZED` | 401 | à¸à¸£à¸¸à¸“à¸²à¹€à¸‚à¹‰à¸²à¸ªà¸¹à¹ˆà¸£à¸°à¸šà¸š | Login prompt |
| `E_RATE_LIMITED` | 429 | à¸à¸£à¸¸à¸“à¸²à¸£à¸­à¸ªà¸±à¸à¸„à¸£à¸¹à¹ˆ | Show countdown |
| `E_SEARCH_TIMEOUT` | 504 | à¸à¸²à¸£à¸„à¹‰à¸™à¸«à¸²à¹ƒà¸Šà¹‰à¹€à¸§à¸¥à¸²à¸™à¸²à¸™ à¸à¸£à¸¸à¸“à¸²à¸¥à¸­à¸‡à¹ƒà¸«à¸¡à¹ˆ | Retry button |

---

## Appendix B: Component Hierarchy

```
Jobs Domain Components
â”œâ”€â”€ pages/
â”‚   â”œâ”€â”€ JobListPage (JOB-R01)
â”‚   â”œâ”€â”€ JobDetailPage (JOB-R02)
â”‚   â”œâ”€â”€ SavedJobsPage (JOB-R04)
â”‚   â””â”€â”€ ApplicationsPage (JOB-R03)
â”œâ”€â”€ components/
â”‚   â”œâ”€â”€ shared/
â”‚   â”‚   â”œâ”€â”€ JobCard
â”‚   â”‚   â”œâ”€â”€ JobCardSkeleton
â”‚   â”‚   â”œâ”€â”€ SaveJobButton
â”‚   â”‚   â”œâ”€â”€ SalaryDisplay
â”‚   â”‚   â”œâ”€â”€ PostedDate
â”‚   â”‚   â”œâ”€â”€ JobBadges
â”‚   â”‚   â”œâ”€â”€ LoginPromptModal
â”‚   â”‚   â””â”€â”€ JobUnavailableBanner
â”‚   â”œâ”€â”€ search/
â”‚   â”‚   â”œâ”€â”€ SearchHeader
â”‚   â”‚   â”œâ”€â”€ FilterSidebar
â”‚   â”‚   â”œâ”€â”€ FilterBottomSheet
â”‚   â”‚   â”œâ”€â”€ SortDropdown
â”‚   â”‚   â””â”€â”€ Pagination
â”‚   â”œâ”€â”€ detail/
â”‚   â”‚   â”œâ”€â”€ JobHeader
â”‚   â”‚   â”œâ”€â”€ JobContent
â”‚   â”‚   â”œâ”€â”€ ApplySidebar
â”‚   â”‚   â”œâ”€â”€ ApplyModal
â”‚   â”‚   â”œâ”€â”€ AlreadyAppliedCard
â”‚   â”‚   â”œâ”€â”€ ProfileIncompleteBlock
â”‚   â”‚   â””â”€â”€ SimilarJobs
â”‚   â””â”€â”€ list/
â”‚       â”œâ”€â”€ JobListResults
â”‚       â”œâ”€â”€ EmptyState
â”‚       â””â”€â”€ ErrorState
â”œâ”€â”€ hooks/
â”‚   â”œâ”€â”€ useJobSearch
â”‚   â”œâ”€â”€ useJobDetail
â”‚   â”œâ”€â”€ useSaveJob
â”‚   â”œâ”€â”€ useJobApplication
â”‚   â””â”€â”€ useSimilarJobs
â””â”€â”€ lib/
    â”œâ”€â”€ meilisearch-client
    â”œâ”€â”€ job-filters
    â””â”€â”€ job-formatters
```

---

*End of JOB-R00 Cross-Cutting Specification*
