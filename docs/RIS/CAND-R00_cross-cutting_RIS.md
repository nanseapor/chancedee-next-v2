# CAND-R00: Candidate Domain Cross-Cutting Specification

**Version:** 1.0  
**Last Updated:** 2025-12-09  
**Domain:** Candidate  
**Scope:** All `/candidates/*` routes  
**Status:** Draft

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-09 | Initial creation based on CAND-R01, R02, R03 patterns |

---

## 1. Overview

This document defines cross-cutting patterns shared across all Candidate domain routes. Individual route RIS documents should reference this spec for common patterns rather than duplicating them.

### Routes Covered

| RIS ID | Route | Purpose | Complexity |
|--------|-------|---------|------------|
| CAND-R01 | `/candidates/[id]` | Dashboard | Medium |
| CAND-R02 | `/candidates/[id]/profile` | Profile Editor + Onboarding | High |
| CAND-R03 | `/candidates/[id]/settings` | Candidate Settings | Low |

### Routes Using Candidate Shell (But Different Primary Domain)

| RIS ID | Route | Primary Domain | Notes |
|--------|-------|----------------|-------|
| JOB-Rxx | `/candidates/[id]/applications` | Jobs | Application tracking |
| JOB-Rxx | `/candidates/[id]/saved` | Jobs | Saved jobs/searches |
| WALLET-R01 | `/candidates/[id]/wallet` | Wallet | Wallet balance |

---

## 2. Candidate Shell Specification

### 2.1 Shell Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│  HEADER                                                             │
│  ┌──────────┐  ┌──────────────────────────────┐  ┌────┐  ┌────┐   │
│  │   Logo   │  │     (empty or search)        │  │ 🔔 │  │ 👤 │   │
│  └──────────┘  └──────────────────────────────┘  └────┘  └────┘   │
├─────────────────────────────────────────────────────────────────────┤
│  ┌────────────┐  ┌─────────────────────────────────────────────┐   │
│  │  SIDEBAR   │  │  MAIN CONTENT                               │   │
│  │            │  │                                             │   │
│  │  Dashboard │  │  (Route-specific content)                   │   │
│  │  Profile   │  │                                             │   │
│  │  Jobs ───────►│  Links to /jobs (public)                    │   │
│  │  Applicat. │  │                                             │   │
│  │  Saved     │  │                                             │   │
│  │  Settings  │  │                                             │   │
│  │            │  │                                             │   │
│  │  ───────── │  │                                             │   │
│  │  💬 Chat   │  │                                             │   │
│  │            │  │                                     [💬 FAB]│   │
│  └────────────┘  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Shell Navigation Items

| Item | Route | Icon | Label (TH) | Active When |
|------|-------|------|------------|-------------|
| Dashboard | `/candidates/[id]` | 🏠 | แดชบอร์ด | Exact match |
| Profile | `/candidates/[id]/profile` | 👤 | โปรไฟล์ | Starts with |
| Jobs | `/jobs` | 💼 | ค้นหางาน | External link |
| Applications | `/candidates/[id]/applications` | 📄 | ใบสมัคร | Starts with |
| Saved | `/candidates/[id]/saved` | ❤️ | รายการที่บันทึก | Starts with |
| Settings | `/candidates/[id]/settings` | ⚙️ | การตั้งค่า | Exact match |
| Chat | `/chat` | 💬 | แชท | External link |

### 2.3 Shell State Automaton

| Current State | Event | Next State | Guard Condition | Side Effects |
|---------------|-------|------------|-----------------|--------------|
| `loading` | `USER_LOADED` | `checking_role` | - | - |
| `checking_role` | `HAS_CANDIDATE_ROLE` | `checking_onboarded` | `roles.includes('candidate')` | - |
| `checking_role` | `NO_CANDIDATE_ROLE` | `redirect_select_role` | `!roles.includes('candidate')` | `redirect('/auth/select-role')` |
| `checking_onboarded` | `IS_ONBOARDED` | `shell_ready` | `isOnboarded === true` | `setActiveRoleAtom('candidate')` |
| `checking_onboarded` | `NOT_ONBOARDED` | `shell_limited` | `isOnboarded === false` | Navigation restricted |
| `shell_ready` | `NAVIGATE` | `shell_ready` | - | Update active item |
| `shell_limited` | `NAVIGATE` | `shell_limited` | `target === '/candidates/[id]/profile'` | Allow only profile |
| `shell_limited` | `NAVIGATE` | `shell_limited` | `target !== '/candidates/[id]/profile'` | Block + show toast |

### 2.4 Shell Limited Mode (Not Onboarded)

When `isOnboarded === false`, the shell restricts navigation:

| Navigation Item | Accessible? | Behavior |
|-----------------|-------------|----------|
| Dashboard | ❌ No | Redirect to profile |
| Profile | ✅ Yes | Shows onboarding wizard |
| Jobs | ❌ No | Block with toast |
| Applications | ❌ No | Block with toast |
| Saved | ❌ No | Block with toast |
| Settings | ❌ No | Block with toast |
| Chat | ❌ No | Block with toast |

**Toast Message:** "กรุณากรอกข้อมูลโปรไฟล์ให้ครบก่อน" (Please complete your profile first)

### 2.5 Mobile Adaptation

| Viewport | Sidebar | Bottom Tab Bar | FAB |
|----------|---------|----------------|-----|
| Desktop (≥1024px) | Visible | Hidden | Bottom-right |
| Tablet (768-1023px) | Collapsed (icons only) | Hidden | Bottom-right |
| Mobile (<768px) | Hidden | Visible (5 items) | Above tab bar |

**Mobile Bottom Tab Bar:**

| Position | Item | Icon |
|----------|------|------|
| 1 | Dashboard | 🏠 |
| 2 | Jobs | 💼 |
| 3 | Applications | 📄 |
| 4 | Saved | ❤️ |
| 5 | Profile | 👤 |

---

## 3. Authentication & Authorization Patterns

### 3.1 Common Auth Check Flow

All candidate routes follow this authentication pattern:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   loading   │────▶│  auth_check │────▶│ owner_check │────▶│ route_ready │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                           │                   │
                     AUTH_FAILED          NOT_OWNER
                           │                   │
                           ▼                   ▼
                    ┌─────────────┐     ┌─────────────┐
                    │redirect_login│    │redirect_own │
                    └─────────────┘     └─────────────┘
```

### 3.2 Auth Check Automaton (Reusable)

| Current State | Event | Next State | Guard Condition | Side Effects |
|---------------|-------|------------|-----------------|--------------|
| `loading` | `INIT` | `auth_check` | - | Start session validation |
| `auth_check` | `AUTH_SUCCESS` | `owner_check` | `session.valid && roles.includes('candidate')` | - |
| `auth_check` | `AUTH_FAILED` | `redirect_login` | `!session.valid` | `redirect('/auth/login?from=...')` |
| `auth_check` | `WRONG_ROLE` | `redirect_role` | `!roles.includes('candidate')` | `redirect('/auth/select-role')` |
| `owner_check` | `IS_OWNER` | `route_ready` | `params.id === user.uid` | - |
| `owner_check` | `NOT_OWNER` | `redirect_own` | `params.id !== user.uid` | `redirect('/candidates/${user.uid}/...')` |

### 3.3 Ownership Redirect Pattern

**Decision:** Redirect to own resource, not "Access Denied"

| Scenario | Wrong URL | Redirect To |
|----------|-----------|-------------|
| Dashboard | `/candidates/xyz/` | `/candidates/${myUid}/` |
| Profile | `/candidates/xyz/profile` | `/candidates/${myUid}/profile` |
| Settings | `/candidates/xyz/settings` | `/candidates/${myUid}/settings` |
| Applications | `/candidates/xyz/applications` | `/candidates/${myUid}/applications` |

**Rationale:** Better UX - users shouldn't see "access denied" for their own resources

---

## 4. Shared Data Patterns

### 4.1 Core Candidate Data Structure

```typescript
interface CandidateDataProps {
  // Identity
  uid: string;
  first_name_th: string;
  last_name_th: string;
  first_name_en?: string;
  last_name_en?: string;
  nick_name_th?: string;
  email: string;
  phone_number?: string;
  photo_url?: string;
  birthdate?: Timestamp;
  
  // Address
  address_line_1?: string;
  district?: string;
  sub_district?: string;
  province?: string;
  post_code?: string;
  
  // Professional
  about_me?: string;
  area_of_expertise?: string;
  achievement?: string;
  experience_years?: number;
  
  // Arrays
  educations: Education[];
  works: WorkExperience[];
  skills: Skill[];
  languages: Language[];
  licenses: License[];
  documents: Document[];
  
  // Status Flags
  is_active: boolean;
  is_searchable: boolean;
  is_onboarded: boolean;
  is_preference_set: boolean;
  is_resume_completed: boolean;
  is_fresh_graduate: boolean;
  is_verified: boolean;
  
  // Settings
  auto_attach_cover_letter: boolean;
  default_cover_letter: string;
  email_job_recommendations: boolean;
  
  // Timestamps
  created_at: number;
  updated_at: number;
}
```

### 4.2 Collection Reference

| Collection | Purpose | Primary Key |
|------------|---------|-------------|
| `candidate_information` | Core profile data | `uid` |
| `candidate_preference` | Job preferences | `uid` |
| `user_info` | Account-level data | `uid` |
| `user_accounts` | Auth & roles | `uid` |
| `web_pockets` | Wallet balance | `uid` |

### 4.3 SWR Key Patterns

| Key Pattern | Usage | Shared Across |
|-------------|-------|---------------|
| `candidate-${uid}` | Core candidate data | All routes |
| `candidate-dashboard-${uid}` | Dashboard aggregated data | R01, R02 |
| `candidate-preference-${uid}` | Job preferences | R02 |
| `wallet-${uid}` | Wallet balance | R01 |
| `master-data-${type}` | Master data dropdowns | R02 |

### 4.4 Cache Invalidation Patterns

| Event | Invalidate Keys | Triggered From |
|-------|-----------------|----------------|
| Profile save | `candidate-${uid}`, `candidate-dashboard-${uid}` | R02 |
| Settings save | `candidate-${uid}` | R03 |
| Onboarding complete | `candidate-${uid}`, `candidate-dashboard-${uid}` | R02 |
| Preference update | `candidate-${uid}`, `candidate-preference-${uid}` | R02 |

---

## 5. State Management Patterns

### 5.1 Common Atoms

| Atom | Type | Purpose | Used In |
|------|------|---------|---------|
| `userAtom` | `userDataProps \| null` | Current user data | R01, R02, R03 |
| `candidateAtom` | `candidateDataProps \| null` | Candidate profile | R01, R02, R03 |
| `activeRoleAtom` | `'candidate' \| 'company' \| 'admin'` | Navigation context | All |
| `firebaseUserAtom` | `User \| null` | Firebase auth state | All |
| `sessionStateAtom` | `SessionState` | Session validity | All |
| `loadingAtom` | `boolean` | Global loading indicator | All |

### 5.2 Common Hooks

| Hook | Purpose | Returns |
|------|---------|---------|
| `useFirebaseAuth` | Auth state management | `{ user, userChancedee, loading }` |
| `useCandidate` | Candidate data with SWR | `{ candidate, isLoading, mutate }` |
| `useStepCompletion` | Profile completion % | `{ percentage, missingFields }` |

### 5.3 Atom Usage Pattern

```typescript
// Standard pattern for candidate routes
const CandidateRoutePage = () => {
  // Auth atoms
  const user = useAtomValue(userAtom);
  const sessionState = useAtomValue(sessionStateAtom);
  
  // Candidate atoms
  const candidate = useAtomValue(candidateAtom);
  const setCandidate = useSetAtom(candidateAtom);
  
  // Role context
  const setActiveRole = useSetAtom(activeRoleAtom);
  
  useEffect(() => {
    setActiveRole('candidate');
  }, []);
  
  // ... rest of component
};
```

---

## 6. Component Patterns

### 6.1 Optimistic Toggle Pattern

Used in: CAND-R03 (Settings toggles)

```typescript
// Generic toggle with optimistic update
interface OptimisticToggleState {
  current: boolean;
  saving: boolean;
  optimisticValue: boolean | null;
}

// State machine
| State | Event | Next State | Side Effects |
|-------|-------|------------|--------------|
| idle(off) | TOGGLE | saving(on) | optimisticUpdate(true), callAPI() |
| idle(on) | TOGGLE | saving(off) | optimisticUpdate(false), callAPI() |
| saving(on) | SUCCESS | idle(on) | clearOptimistic() |
| saving(on) | ERROR | idle(off) | revert(), showError() |
| saving(off) | SUCCESS | idle(off) | clearOptimistic() |
| saving(off) | ERROR | idle(on) | revert(), showError() |
```

### 6.2 Section Edit Drawer Pattern

Used in: CAND-R02 (Profile sections)

```typescript
// Generic section edit pattern
| State | Event | Next State | Side Effects |
|-------|-------|------------|--------------|
| viewing | EDIT_CLICK | editing | openDrawer(), loadDraft() |
| editing | CHANGE | editing | updateDraft() |
| editing | SAVE | saving | validateForm() |
| editing | CANCEL | viewing | discardDraft(), closeDrawer() |
| saving | SUCCESS | viewing | applyChanges(), closeDrawer(), invalidateCache() |
| saving | ERROR | editing | showError() |
```

### 6.3 Array Field CRUD Pattern

Used in: CAND-R02 (Work Experience, Education, Skills)

```typescript
// Generic array field pattern
| State | Event | Next State | Side Effects |
|-------|-------|------------|--------------|
| list | ADD | adding | openForm(empty) |
| list | EDIT(id) | editing | openForm(item) |
| list | DELETE(id) | confirming | showConfirmDialog() |
| adding | SAVE | list | appendItem(), closeForm() |
| adding | CANCEL | list | closeForm() |
| editing | SAVE | list | updateItem(id), closeForm() |
| editing | CANCEL | list | closeForm() |
| confirming | CONFIRM | list | removeItem(id) |
| confirming | CANCEL | list | - |
```

---

## 7. `isOnboarded` Flag Specification

### 7.1 Flag Locations

| Collection | Field | Authoritative? |
|------------|-------|----------------|
| `user_info` | `is_onboarded` | ✅ Primary (used for routing) |
| `candidate_information` | `is_onboarded` | Mirror (kept in sync) |

### 7.2 Flag Lifecycle

```
Account Created (AUTH-R02)
    │
    └─► isOnboarded: false
        │
        ▼
User visits any /candidates/* route
    │
    └─► Shell checks isOnboarded
        │
        ├─► false: Redirect to /candidates/{uid}/profile (onboarding mode)
        │
        └─► true: Allow access
        
Onboarding Complete (CAND-R02, Step 5)
    │
    └─► setIsOnboarded(true)
        │
        ├─► Update user_info.is_onboarded
        └─► Update candidate_information.is_onboarded
        │
        ▼
    isOnboarded: true (permanent)
```

### 7.3 Onboarding Requirements

| Step | Required Fields | Sets isOnboarded |
|------|-----------------|------------------|
| 1 | Personal info (name, email, phone, birthdate, address) | ❌ |
| 2 | Work experience (1+) OR fresh_graduate flag | ❌ |
| 3 | Education (exactly 1 highest) | ❌ |
| 4 | Skills (at least 1) | ❌ |
| 5 | Job preferences (complete) | ✅ **Sets flag** |

---

## 8. Error Handling Patterns

### 8.1 Common Error Types

| Error Type | HTTP Status | Display | Recovery |
|------------|-------------|---------|----------|
| `AUTH_ERROR` | 401 | Redirect to login | Auto-redirect |
| `FORBIDDEN` | 403 | Redirect to own resource | Auto-redirect |
| `NOT_FOUND` | 404 | 404 page | Back button |
| `VALIDATION_ERROR` | 400 | Form field errors | User corrects |
| `NETWORK_ERROR` | - | Toast + retry | Retry button |
| `SERVER_ERROR` | 500 | Toast | Retry or contact support |

### 8.2 Error Toast Messages

| Error | Thai Message |
|-------|--------------|
| Network error | "ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่" |
| Save failed | "บันทึกไม่สำเร็จ กรุณาลองใหม่" |
| Load failed | "ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่" |
| Validation failed | "กรุณาตรวจสอบข้อมูล" |
| Session expired | "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" |

---

## 9. Profile Completion Calculation

### 9.1 Completion Weights

| Section | Weight | Requirement |
|---------|--------|-------------|
| Personal Info | 20% | name, email, phone, birthdate, address |
| Work Experience | 20% | ≥1 work entry OR fresh_graduate flag |
| Education | 15% | ≥1 education entry |
| Skills | 15% | ≥1 skill |
| Job Preferences | 20% | All preference fields set |
| About Me | 5% | about_me text present |
| Documents | 5% | ≥1 document uploaded |

### 9.2 Calculation Function

```typescript
function calculateProfileCompletion(
  profile: CandidateDataProps,
  preference: JobPreference
): { percentage: number; missingSections: string[] } {
  let score = 0;
  const missing: string[] = [];

  // Personal Info (20%)
  if (hasPersonalInfo(profile)) score += 20;
  else missing.push('personal_info');

  // Work Experience (20%)
  if (profile.is_fresh_graduate || profile.works.length > 0) score += 20;
  else missing.push('work_experience');

  // Education (15%)
  if (profile.educations.length > 0) score += 15;
  else missing.push('education');

  // Skills (15%)
  if (profile.skills.length > 0) score += 15;
  else missing.push('skills');

  // Job Preferences (20%)
  if (hasCompletePreferences(preference)) score += 20;
  else missing.push('job_preferences');

  // About Me (5%)
  if (profile.about_me?.length > 0) score += 5;
  else missing.push('about_me');

  // Documents (5%)
  if (profile.documents?.length > 0) score += 5;
  else missing.push('documents');

  return { percentage: score, missingSections: missing };
}
```

---

## 10. Design Decisions Registry

### 10.1 Domain-Wide Decisions

| Decision | Chosen | Rationale | Date | RIS Source |
|----------|--------|-----------|------|------------|
| Collection name | `candidate_information` | Matches existing schema | 2025-12-09 | R01 |
| Role atom | `activeRoleAtom` | Consistent with other domains | 2025-12-09 | R01 |
| Ownership redirect | Redirect to own resource | Better UX than "access denied" | 2025-12-09 | R03 |
| Toggle save pattern | Optimistic with revert | Instant feedback | 2025-12-09 | R03 |
| Profile page structure | Inline-edit (no tabs) | Industry standard, lower cognitive load | 2025-12-09 | R02 |
| Onboarding as page mode | Auto-detect via flag | Blocking flow, not parallel choice | 2025-12-09 | R02 |
| All 5 onboarding steps | Required (no skip) | Creates minimum viable resume | 2025-12-09 | R02 |
| Fresh graduate toggle | Work experience alternative | Supports users without experience | 2025-12-09 | R02 |

### 10.2 Design Supersessions

| Original Spec | Superseded By | Document | Rationale |
|---------------|---------------|----------|-----------|
| 5-tab profile layout | Inline-edit sections | CAND-R02 | UX improvement |
| Onboarding as tab | Onboarding as page mode | CAND-R02 | Blocking flow logic |
| Preview as tab | Preview as modal | CAND-R02 | View toggle, not content |
| Skippable steps 3-5 | All steps required | CAND-R02 | Minimum viable resume |

---

## 11. Related Cross-Cutting Specs

| Spec | Relationship |
|------|--------------|
| AUTH-R00 | Authentication patterns, session management |
| COMP-R00 | Company shell (for comparison) |
| CHAT-R00 | Chat FAB behavior |
| NOTIF-R00 | Notification bell behavior |

---

## 12. Implementation Notes

### 12.1 Shell Implementation

```typescript
// src/components/shells/CandidateShell.tsx
interface CandidateShellProps {
  children: React.ReactNode;
  activeRoute?: string;
}

const CandidateShell: React.FC<CandidateShellProps> = ({ children, activeRoute }) => {
  const user = useAtomValue(userAtom);
  const candidate = useAtomValue(candidateAtom);
  const setActiveRole = useSetAtom(activeRoleAtom);
  
  // Set role context
  useEffect(() => {
    setActiveRole('candidate');
  }, []);
  
  // Check onboarding status
  const isOnboarded = candidate?.is_onboarded ?? false;
  
  return (
    <ShellLayout
      sidebar={<CandidateSidebar activeRoute={activeRoute} disabled={!isOnboarded} />}
      header={<CandidateHeader />}
      fab={isOnboarded ? <ChatFAB /> : null}
    >
      {children}
    </ShellLayout>
  );
};
```

### 12.2 Auth HOC Pattern

```typescript
// src/lib/auth/withCandidateAuth.tsx
export function withCandidateAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: { requireOnboarded?: boolean }
) {
  return function AuthenticatedComponent(props: P) {
    const router = useRouter();
    const params = useParams();
    const user = useAtomValue(userAtom);
    const candidate = useAtomValue(candidateAtom);
    
    // Auth check
    if (!user) {
      router.replace(`/auth/login?from=${encodeURIComponent(window.location.pathname)}`);
      return <LoadingScreen />;
    }
    
    // Role check
    if (!user.roles?.includes('candidate')) {
      router.replace('/auth/select-role');
      return <LoadingScreen />;
    }
    
    // Owner check
    if (params.id && params.id !== user.uid) {
      router.replace(`/candidates/${user.uid}${window.location.pathname.split(params.id)[1]}`);
      return <LoadingScreen />;
    }
    
    // Onboarding check (if required)
    if (options?.requireOnboarded && !candidate?.is_onboarded) {
      router.replace(`/candidates/${user.uid}/profile`);
      return <LoadingScreen />;
    }
    
    return <Component {...props} />;
  };
}
```

---

## Appendix A: File Structure

```
src/
├── app/
│   └── candidates/
│       └── [id]/
│           ├── page.tsx                    # CAND-R01 Dashboard
│           ├── profile/
│           │   └── page.tsx                # CAND-R02 Profile
│           ├── settings/
│           │   └── page.tsx                # CAND-R03 Settings
│           ├── applications/
│           │   └── page.tsx                # JOB-Rxx Applications
│           ├── saved/
│           │   └── page.tsx                # JOB-Rxx Saved
│           └── wallet/
│               └── page.tsx                # WALLET-R01 Wallet
├── components/
│   ├── shells/
│   │   └── CandidateShell.tsx              # Shell component
│   └── candidates/
│       ├── dashboard/                       # R01 components
│       ├── profile/                         # R02 components
│       └── settings/                        # R03 components
├── domains/
│   └── candidates/
│       ├── hooks/
│       │   ├── useCandidate.ts
│       │   ├── useStepCompletion.ts
│       │   └── useCandidateSettings.ts
│       └── services/
│           └── server/
│               └── actions/
│                   ├── candidate-profile.ts
│                   └── candidate-settings.ts
└── lib/
    └── auth/
        └── withCandidateAuth.tsx            # Auth HOC
```

---

## Appendix B: Thai Label Reference

| Key | Thai | English |
|-----|------|---------|
| dashboard | แดชบอร์ด | Dashboard |
| profile | โปรไฟล์ | Profile |
| jobs | ค้นหางาน | Find Jobs |
| applications | ใบสมัคร | Applications |
| saved | รายการที่บันทึก | Saved Items |
| settings | การตั้งค่า | Settings |
| chat | แชท | Chat |
| complete_profile | กรุณากรอกข้อมูลโปรไฟล์ให้ครบก่อน | Please complete your profile first |
| loading | กำลังโหลด... | Loading... |
| error_network | ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่ | Cannot connect, please try again |
| error_save | บันทึกไม่สำเร็จ กรุณาลองใหม่ | Save failed, please try again |
| saved | บันทึกแล้ว | Saved |

---

*End of CAND-R00 Cross-Cutting Specification v1.0*
