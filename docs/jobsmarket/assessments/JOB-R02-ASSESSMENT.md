# JOB-R02 Implementation Assessment

**Route ID:** JOB-R02
**Route Path:** `/jobs/[id]` (Job Detail Page)
**Assessment Date:** 2025-12-31
**Assessed By:** Claude Code (Developer Agent)
**Complexity:** Medium
**Estimated Duration:** 1-2 days (8-16 hours)

---

## Executive Summary

JOB-R02 (Job Detail Page) is a **medium complexity route** that builds upon the solid foundation established in JOB-R01 (Job Search & Listings). The route requires implementing a **detailed job view with apply functionality**, multiple sidebar states, ISR (Incremental Static Regeneration), and SEO optimization.

**Good News:**
- ~70% of required infrastructure already exists from JOB-R00/R01
- Server actions for job detail, save/unsave, and similar jobs are implemented
- Reusable components (JobCard, SaveJobButton, LoginPromptModal, SalaryDisplay) are ready
- Type definitions and repositories are complete

**New Work Required:**
- Job detail page components (8 new components)
- Apply modal and form logic
- Profile completion checking
- ISR configuration
- SEO metadata generation
- Similar jobs carousel
- Test coverage (~28 tests total)

---

## 1. Route Analysis

### 1.1 Route Purpose

| Aspect | Details |
|--------|---------|
| **Primary Goal** | Present full job details to enable informed application decisions |
| **User Journeys** | 1. Guest views job → login → apply<br>2. Candidate views job → checks profile → applies<br>3. Company views own job → sees details (no apply) |
| **Key Actions** | View details, save job, apply for job, view similar jobs |
| **Shell Context** | Public Shell (guest), Candidate Shell (logged in candidate), Company Shell (company) |

### 1.2 Page Structure

```
/jobs/[id]/
├── page.tsx                  # Server Component with ISR + Metadata
├── loading.tsx               # Loading skeleton
├── not-found.tsx             # 404 handling
└── _components/
    ├── JobDetailClient.tsx   # Client orchestrator (state management)
    ├── JobHeader.tsx         # Title, company, badges
    ├── JobMetadata.tsx       # Salary, location, type badges row
    ├── JobDescription.tsx    # Rich text HTML content
    ├── JobRequirements.tsx   # Requirements list
    ├── CompanyInfo.tsx       # Company card/link in sidebar
    ├── SimilarJobs.tsx       # Related jobs carousel
    ├── ApplySection.tsx      # Sidebar with apply/save buttons
    └── ApplyModal.tsx        # Application form modal
```

### 1.3 Data Flow

```
┌─────────────────────────────────────────────────────────┐
│ page.tsx (Server Component)                            │
│ - generateMetadata() → SEO tags                        │
│ - getPublicJobById() → Job data                        │
│ - Revalidate: 300s (ISR)                               │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│ JobDetailClient (Client Component)                     │
│ - Hydrates server data                                 │
│ - Manages apply modal state                            │
│ - Handles save/unsave mutations                        │
│ - Checks auth & profile completion                     │
└────────┬─────────────┬──────────────┬──────────────────┘
         │             │              │
         ▼             ▼              ▼
    ┌─────────┐  ┌──────────┐  ┌────────────┐
    │ JobInfo │  │ Sidebar  │  │ SimilarJobs│
    │ Section │  │ (Apply)  │  │ Carousel   │
    └─────────┘  └──────────┘  └────────────┘
```

---

## 2. Existing Code Audit (What We Can Reuse)

### 2.1 Server Actions (100% Ready) ✅

| Action | Location | Status | Notes |
|--------|----------|--------|-------|
| `getPublicJobById(jobId)` | `public-jobs.ts:172` | ✅ Ready | Returns JobDetailData, handles active/published check |
| `getSimilarJobs(jobId, limit)` | `public-jobs.ts:221` | ✅ Ready | Returns up to 5 similar jobs (simplified) |
| `saveJob(params)` | `public-jobs.ts:259` | ✅ Ready | Idempotent, validates job exists |
| `unsaveJob(params)` | `public-jobs.ts:324` | ✅ Ready | Idempotent |
| `getSavedJobs(candidateId)` | `public-jobs.ts:366` | ✅ Ready | For checking saved status |

**Assessment:** All server actions are implemented and tested in JOB-R01. No new server actions needed for basic job detail functionality.

### 2.2 Reusable Components (70% Ready) ✅

| Component | Location | Status | Reuse Plan |
|-----------|----------|--------|------------|
| `JobCard` | `components/jobsmarket/jobs/JobCard.tsx` | ✅ Ready | Use `compact` variant for similar jobs |
| `SaveJobButton` | `components/jobsmarket/jobs/SaveJobButton.tsx` | ✅ Ready | Use in sidebar apply section |
| `SalaryDisplay` | `components/jobsmarket/jobs/SalaryDisplay.tsx` | ✅ Ready | Use in job header |
| `LocationBadge` | `components/jobsmarket/jobs/LocationBadge.tsx` | ✅ Ready | Use in metadata row |
| `JobStatusBadge` | `components/jobsmarket/jobs/JobStatusBadge.tsx` | ✅ Ready | Use for closed/expired states |
| `LoginPromptModal` | `components/jobsmarket/jobs/LoginPromptModal.tsx` | ✅ Ready | Trigger on guest apply/save |
| `PublicShell` | `components/jobsmarket/shells/PublicShell.tsx` | ✅ Ready | Wraps page for guests |
| `CandidateShell` | `components/jobsmarket/shells/CandidateShell.tsx` | ✅ Ready | Wraps page for logged-in candidates |

**Assessment:** All shared components from JOB-R00 are implemented and working. Can be reused as-is.

### 2.3 Hooks (80% Ready) ✅

| Hook | Location | Status | Reuse Plan |
|------|----------|--------|------------|
| `useSaveJobMutation` | `hooks/jobsmarket/useSaveJobMutation.ts` | ✅ Ready | Reuse for save button in sidebar |
| `useProfileCompletion` | `hooks/jobsmarket/use-profile-completion.ts` | ✅ Exists | Use to check if candidate can apply |
| `useCandidateAuth` | `hooks/jobsmarket/use-candidate-auth.ts` | ✅ Exists | Check auth state |

**Assessment:** Existing hooks cover save functionality and profile checking. May need minor adaptations.

### 2.4 Type Definitions (100% Ready) ✅

| Type | Location | Status |
|------|----------|--------|
| `JobDetailData` | `types/public-jobs.ts:149` | ✅ Ready |
| `JobCardData` | `types/public-jobs.ts:51` | ✅ Ready |
| `JobAvailabilityState` | `types/public-jobs.ts:40` | ✅ Ready |
| `LoginPromptAction` | `types/public-jobs.ts:178` | ✅ Ready |
| `SaveJobParams` | `types/public-jobs.ts:121` | ✅ Ready |

**Assessment:** All necessary types are defined. Complete.

### 2.5 Repositories (100% Ready) ✅

| Repository | Status | Notes |
|------------|--------|-------|
| `jobsRepository` | ✅ Ready | CRUD operations on jobs collection |
| `candidateSavedJobsRepository` | ✅ Ready | Save/unsave operations |
| `jobApplicationsRepository` | ✅ Ready | Check if already applied |

**Assessment:** Data layer is complete.

---

## 3. New Deliverables (What We Need to Build)

### 3.1 Page Components (NEW)

| Component | File | Complexity | Dependencies | Description |
|-----------|------|------------|--------------|-------------|
| `page.tsx` | `app/jobsmarket/jobs/[id]/page.tsx` | Medium | Next.js 15, ISR | Server component with metadata generation |
| `loading.tsx` | `app/jobsmarket/jobs/[id]/loading.tsx` | Low | Skeleton UI | Loading state while fetching |
| `not-found.tsx` | `app/jobsmarket/jobs/[id]/not-found.tsx` | Low | Error page | 404 handling |
| `JobDetailClient` | `_components/JobDetailClient.tsx` | High | State, hooks | Client orchestrator for all interactive features |
| `JobHeader` | `_components/JobHeader.tsx` | Low | SalaryDisplay, badges | Title, company, salary display |
| `JobMetadata` | `_components/JobMetadata.tsx` | Low | Badge components | Info badges row |
| `JobDescription` | `_components/JobDescription.tsx` | Low | HTML rendering | Rich text content display |
| `JobRequirements` | `_components/JobRequirements.tsx` | Low | HTML rendering | Requirements/qualifications |
| `CompanyInfo` | `_components/CompanyInfo.tsx` | Medium | Company data | Company card in sidebar |
| `SimilarJobs` | `_components/SimilarJobs.tsx` | Medium | JobCard carousel | Horizontal scroll of related jobs |
| `ApplySection` | `_components/ApplySection.tsx` | High | Multiple states | Sidebar with apply/save/profile states |
| `ApplyModal` | `_components/ApplyModal.tsx` | High | Form validation | Application form modal |

**Total: 12 new components**

### 3.2 Component Breakdown

#### A. Server Components (Static/ISR)

**1. page.tsx** (Priority: P0)
- **Purpose:** Main route entry point with ISR and SEO
- **Responsibilities:**
  - Generate dynamic metadata (title, description, OG tags)
  - Fetch job data via `getPublicJobById()`
  - Handle 404 (job not found)
  - Pass data to client component
  - Configure ISR revalidation (300s)
- **Implementation Notes:**
  ```typescript
  export const revalidate = 300; // 5 minutes ISR

  export async function generateMetadata({ params }): Promise<Metadata> {
    const job = await getPublicJobById(params.id);
    if (!job) return { title: 'ไม่พบงาน - ChanceDee', robots: 'noindex' };

    return {
      title: `${job.title} - ${job.companyName} | ChanceDee`,
      description: `${job.title} ที่ ${job.companyName} - ${formatSalary(...)} - ${job.workLocationText}`,
      openGraph: { /* ... */ },
      twitter: { /* ... */ },
      robots: job.isActive ? 'index, follow' : 'noindex',
    };
  }
  ```

**2. loading.tsx** (Priority: P0)
- **Purpose:** Loading skeleton while fetching job data
- **Responsibilities:**
  - Show skeleton for job header
  - Show skeleton for job content
  - Show skeleton for sidebar
- **Implementation:** Use shadcn Skeleton component

**3. not-found.tsx** (Priority: P0)
- **Purpose:** 404 page when job doesn't exist
- **Responsibilities:**
  - Show "ไม่พบงานที่คุณกำลังค้นหา" message
  - Provide link back to /jobs search
- **Implementation:** Reuse error page pattern from design system

#### B. Client Components (Interactive)

**4. JobDetailClient.tsx** (Priority: P0)
- **Purpose:** Main client orchestrator for all interactive features
- **Responsibilities:**
  - Manage apply modal open/close state
  - Manage login prompt modal state
  - Handle save/unsave mutations (via `useSaveJobMutation`)
  - Check authentication status
  - Check profile completion status
  - Check if candidate has already applied
  - Determine sidebar state (guest/incomplete/ready/applied/closed)
  - Pass state down to child components
- **State:**
  ```typescript
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
  const [loginPromptAction, setLoginPromptAction] = useState<LoginPromptAction>('apply');

  // Hooks
  const { savedJobIds, toggleSave } = useSaveJobMutation(initialSavedIds, {
    onAuthRequired: () => { /* open login prompt */ }
  });
  const { isProfileComplete, missingFields } = useProfileCompletion();
  const { isAuthenticated, user } = useCandidateAuth();

  // Computed sidebar state
  const sidebarState = useMemo(() => {
    if (!isAuthenticated) return 'guest';
    if (jobUnavailable) return 'closed';
    if (hasApplication) return 'applied';
    if (!isProfileComplete) return 'incomplete';
    return 'ready';
  }, [isAuthenticated, jobUnavailable, hasApplication, isProfileComplete]);
  ```

**5. JobHeader.tsx** (Priority: P0)
- **Purpose:** Display job title, company, and primary metadata
- **Responsibilities:**
  - Show company logo (clickable → `/companies/[id]`)
  - Show job title (H1)
  - Show company name (clickable link)
  - Show salary (via SalaryDisplay component)
  - Show posted date and deadline
- **Layout:**
  ```
  ┌─────────────────────────────────────────────┐
  │ [Logo]  Job Title                           │
  │ 80×80   Company Name (link)                 │
  │                                             │
  │         ฿XX,XXX - ฿XX,XXX  |  Posted 2 days │
  └─────────────────────────────────────────────┘
  ```

**6. JobMetadata.tsx** (Priority: P0)
- **Purpose:** Display job metadata badges
- **Responsibilities:**
  - Location badge
  - Employment type badge (fulltime/parttime/etc.)
  - Experience badge
  - Education badge
- **Layout:**
  ```
  [📍 กรุงเทพมหานคร] [💼 งานประจำ] [🎓 1-3 ปี] [🎓 ปริญญาตรี]
  ```

**7. JobDescription.tsx** (Priority: P0)
- **Purpose:** Render rich HTML job description
- **Responsibilities:**
  - Sanitize and render `jobDescriptionDetails` HTML
  - Section title "รายละเอียดงาน"
  - Collapsible on mobile (optional)
- **Implementation:** Use `dangerouslySetInnerHTML` with DOMPurify sanitization

**8. JobRequirements.tsx** (Priority: P0)
- **Purpose:** Render requirements and qualifications
- **Responsibilities:**
  - Render `qualificationDetails` HTML
  - Render `benefitsDetails` HTML (optional section)
  - Section titles
- **Implementation:** Similar to JobDescription

**9. CompanyInfo.tsx** (Priority: P1)
- **Purpose:** Show company summary in sidebar
- **Responsibilities:**
  - Company logo
  - Company name
  - Industry
  - Company size (optional)
  - Link to company profile `/companies/[id]`
- **Layout:**
  ```
  ┌─────────────────────────┐
  │ [Logo] Company Name     │
  │        Industry         │
  │        Size: M          │
  │                         │
  │ [ดูโปรไฟล์บริษัท]       │
  └─────────────────────────┘
  ```

**10. SimilarJobs.tsx** (Priority: P1)
- **Purpose:** Show carousel of similar jobs
- **Responsibilities:**
  - Fetch similar jobs via `getSimilarJobs(jobId, 6)`
  - Display in horizontal scroll carousel
  - Use `JobCard` component with `variant="compact"`
  - Touch/swipe support on mobile
  - Navigation arrows on desktop
- **Layout:**
  ```
  งานที่คล้ายกัน
  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
  │ Job  │ │ Job  │ │ Job  │ │ Job  │
  │  1   │ │  2   │ │  3   │ │  4   │
  └──────┘ └──────┘ └──────┘ └──────┘
    ←                              →
  ```

**11. ApplySection.tsx** (Priority: P0)
- **Purpose:** Sidebar with apply/save buttons and state-based UI
- **Responsibilities:**
  - Render different UI based on sidebar state
  - **Guest state:** "เข้าสู่ระบบเพื่อสมัคร" button
  - **Incomplete state:** Profile completion checklist + "ไปที่โปรไฟล์" CTA
  - **Ready state:** "สมัครงาน" button + SaveJobButton
  - **Applied state:** "สมัครแล้ว" card with application status
  - **Closed/Expired state:** Gray banner with message
- **State-Based Rendering:**
  ```typescript
  switch (sidebarState) {
    case 'guest':
      return <GuestLoginCTA />;
    case 'incomplete':
      return <ProfileCompletionBlock missingFields={missingFields} />;
    case 'ready':
      return <ApplyReadySection onApply={openApplyModal} />;
    case 'applied':
      return <AlreadyAppliedCard application={application} />;
    case 'closed':
      return <JobClosedBanner />;
  }
  ```

**12. ApplyModal.tsx** (Priority: P0)
- **Purpose:** Application form modal
- **Responsibilities:**
  - Modal dialog with form
  - Fields:
    - Expected salary (optional, number input)
    - Negotiable checkbox
    - Availability dropdown (0, 7, 15, 30, 60, 90 days)
    - Cover letter textarea (optional, max 500 chars)
  - Form validation
  - Submit to server action (TBD in BLS-03)
  - Loading state during submission
  - Success/error handling
- **Layout:**
  ```
  ┌────────────────────────────────────┐
  │ สมัครงาน: [Job Title]         ✕  │
  ├────────────────────────────────────┤
  │ เงินเดือนที่คาดหวัง              │
  │ [________] บาท  ☐ ต่อรองได้     │
  │                                    │
  │ สามารถเริ่มงานได้                │
  │ [▼ เลือกระยะเวลา]                │
  │                                    │
  │ แนะนำตัวเอง (ไม่บังคับ)          │
  │ [_____________________________]   │
  │                                    │
  │        [ยกเลิก]  [ส่งใบสมัคร]    │
  └────────────────────────────────────┘
  ```

### 3.3 New Hooks (Optional)

| Hook | Purpose | Priority | Notes |
|------|---------|----------|-------|
| `useApplyMutation` | Submit job application | P0 | To be implemented with BLS-03 (Application flow) |
| `useSidebarState` | Compute sidebar state from conditions | P1 | Can be inline `useMemo` in JobDetailClient |

**Decision:** Start with inline `useMemo` for sidebar state. Extract to hook if logic becomes complex.

---

## 4. ISR (Incremental Static Regeneration) Strategy

### 4.1 Configuration

```typescript
// app/jobsmarket/jobs/[id]/page.tsx
export const revalidate = 300; // Revalidate every 5 minutes
export const dynamicParams = true; // Generate new pages on-demand
```

### 4.2 Build-Time Pre-Rendering

**Option A:** Pre-render popular jobs at build time
```typescript
export async function generateStaticParams() {
  // Get top 100 most viewed/applied jobs
  const popularJobs = await getPopularJobs(100);

  return popularJobs.map((job) => ({
    id: job.uid,
  }));
}
```

**Option B:** Don't pre-render any jobs (fully dynamic)
```typescript
// Omit generateStaticParams
// All job detail pages generated on first request
```

**Recommendation:** Start with **Option B** (fully dynamic) for faster initial deployment. Add Option A later when we have analytics data on popular jobs.

### 4.3 Stale-While-Revalidate Behavior

| Time | Behavior |
|------|----------|
| T+0s | First request → Server render → Cache for 300s |
| T+200s | Subsequent requests → Serve cached version |
| T+300s | First request after expiry → Serve stale cache + trigger background revalidation |
| T+301s | Next request → Serve fresh version |

### 4.4 Cache Invalidation

**Manual Invalidation Triggers:**
- Job edited/updated → `revalidatePath('/jobs/[id]')`
- Job closed → `revalidatePath('/jobs/[id]')`
- Company info updated → `revalidatePath('/jobs/[id]')` for all company jobs

**Implementation:** Will be added in Company Dashboard routes (COMP-R05, COMP-R06).

---

## 5. SEO Implementation

### 5.1 Dynamic Metadata

```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const job = await getPublicJobById(params.id);

  if (!job) {
    return {
      title: 'ไม่พบงาน - ChanceDee',
      robots: 'noindex',
    };
  }

  const salary = formatSalaryRange(job.minSalary, job.maxSalary, job.isNegotiable);
  const description = `${job.title} ที่ ${job.companyName} - ${salary} - ${job.workLocationText}`;

  return {
    title: `${job.title} - ${job.companyName} | ChanceDee`,
    description: description.slice(0, 160),

    openGraph: {
      title: `${job.title} - ${job.companyName}`,
      description: description,
      type: 'website',
      url: `https://chancedee.com/jobs/${job.uid}`,
      images: [
        {
          url: job.companyLogo || '/og-default-job.png',
          width: 1200,
          height: 630,
          alt: `${job.title} at ${job.companyName}`,
        },
      ],
      siteName: 'ChanceDee',
      locale: 'th_TH',
    },

    twitter: {
      card: 'summary_large_image',
      title: `${job.title} - ${job.companyName}`,
      description: description,
    },

    alternates: {
      canonical: `https://chancedee.com/jobs/${job.uid}`,
    },

    robots: job.isActive ? 'index, follow' : 'noindex',
  };
}
```

### 5.2 Structured Data (JSON-LD)

**Component:** `JobStructuredData.tsx`

```typescript
function JobStructuredData({ job }: { job: JobDetailData }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: stripHtml(job.jobDescriptionDetails),
    identifier: {
      '@type': 'PropertyValue',
      name: 'ChanceDee Job ID',
      value: job.uid,
    },
    datePosted: new Date(job.postStartDate).toISOString(),
    validThrough: job.postExpiryDate
      ? new Date(job.postExpiryDate).toISOString()
      : undefined,
    employmentType: mapEmploymentType(job.employmentText),
    hiringOrganization: {
      '@type': 'Organization',
      name: job.companyName,
      logo: job.companyLogo,
      sameAs: `https://chancedee.com/companies/${job.companyId}`,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.workLocationText,
        addressCountry: 'TH',
      },
    },
    baseSalary: job.minSalary || job.maxSalary ? {
      '@type': 'MonetaryAmount',
      currency: 'THB',
      value: {
        '@type': 'QuantitativeValue',
        minValue: job.minSalary,
        maxValue: job.maxSalary,
        unitText: 'MONTH',
      },
    } : undefined,
    educationRequirements: job.educationLevelText?.[0],
    experienceRequirements: job.experienceText,
    directApply: true,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
```

### 5.3 Canonical URL & Robots Handling

| Job State | Robots Meta | Canonical | Reason |
|-----------|-------------|-----------|--------|
| Active (published/ontimer) | `index, follow` | Self | Indexable |
| Closed | `noindex` | Self | Job closed but keep URL alive |
| Expired | `noindex` | Self | Job expired but keep URL alive |
| Unpublished | `noindex` | - | Hidden from public |
| Not found | `noindex` | - | 404 page |

---

## 6. Test Plan

### 6.1 Test Coverage Summary

| Test Type | Count | Priority | Focus |
|-----------|-------|----------|-------|
| **Unit Tests** | ~10 | P0 | Components, state logic, helpers |
| **Integration Tests** | ~8 | P0 | Server actions, data fetching |
| **E2E Tests** | ~10 | P0 | User journeys, apply flow, edge cases |
| **Total** | **~28** | - | - |

### 6.2 Unit Tests (Location: `tests/unit/jobsmarket/jobs/job-detail/`)

#### A. Component Tests

| Test File | Component | Tests | Focus |
|-----------|-----------|-------|-------|
| `job-header.test.tsx` | JobHeader | 3 | - Renders job title<br>- Renders company info<br>- Salary display correct |
| `job-metadata.test.tsx` | JobMetadata | 2 | - Renders all badges<br>- Handles missing data |
| `job-description.test.tsx` | JobDescription | 2 | - Renders HTML content<br>- Sanitizes XSS |
| `apply-section.test.tsx` | ApplySection | 5 | - Guest state renders login CTA<br>- Incomplete state shows checklist<br>- Ready state shows apply button<br>- Applied state shows status card<br>- Closed state shows banner |
| `apply-modal.test.tsx` | ApplyModal | 4 | - Opens/closes correctly<br>- Form validation works<br>- Submits with correct data<br>- Handles errors |
| `similar-jobs.test.tsx` | SimilarJobs | 2 | - Renders job cards<br>- Handles empty state |

**Subtotal: 18 component unit tests**

#### B. Utility/Hook Tests

| Test File | Focus | Tests |
|-----------|-------|-------|
| `sidebar-state.test.ts` | Sidebar state computation | 6 | - Computes 'guest' when not logged in<br>- Computes 'incomplete' when profile incomplete<br>- Computes 'ready' when can apply<br>- Computes 'applied' when has application<br>- Computes 'closed' when job closed<br>- Priority order correct |
| `format-salary.test.ts` | Salary formatting | 4 | - Range display<br>- Single value<br>- Negotiable only<br>- Empty values |

**Subtotal: 10 utility/hook tests**

**Total Unit Tests: ~28**

### 6.3 Integration Tests (Location: `tests/integration/jobsmarket/jobs/`)

| Test File | Focus | Tests | Description |
|-----------|-------|-------|-------------|
| `get-public-job-by-id.test.ts` | Server action | 4 | - Returns job detail for valid ID<br>- Returns null for invalid ID<br>- Returns null for unpublished job<br>- Returns null for inactive job |
| `get-similar-jobs.test.ts` | Server action | 2 | - Returns similar jobs<br>- Excludes current job |
| `job-detail-page-data.test.ts` | Page data fetching | 2 | - Fetches all required data<br>- Handles missing job |

**Total Integration Tests: ~8**

### 6.4 E2E Tests (Location: `tests/e2e/jobsmarket/jobs/job-detail.spec.ts`)

#### Critical Path Tests (From BLS-02)

| ID | Scenario | User | Expected | Maps to BLS |
|----|----------|------|----------|-------------|
| R02-01 | Load job detail | Guest | Job title, company, description visible | DISC-011 |
| R02-02 | Job not found | Any | 404 page with back link | DISC-012 |
| R02-03 | Closed job | Any | Content visible, "ปิดรับสมัครแล้ว" banner | DISC-013 |
| R02-04 | Expired job | Any | Content visible, "หมดอายุแล้ว" banner | DISC-014 |
| R02-05 | Guest clicks apply | Guest | Login prompt modal opens | - |
| R02-06 | Profile incomplete apply | Candidate | Scroll to profile block, show checklist | - |
| R02-07 | Ready to apply | Candidate | Apply modal opens with form | - |
| R02-08 | Submit application | Candidate | Success toast, show "สมัครแล้ว" card | - |
| R02-09 | Save job (guest) | Guest | Login prompt modal | DISC-019 |
| R02-10 | Save job (logged in) | Candidate | Heart fills, toast notification | DISC-020 |
| R02-11 | Deep link `?apply=true` | Candidate | Scroll to apply, focus button | DISC-015 |
| R02-12 | Similar jobs | Any | Carousel with 3-6 jobs | DISC-016 |
| R02-13 | Click company link | Any | Navigate to company profile | DISC-018 |

**Total E2E Tests: ~13**

### 6.5 BLS-02 Coverage Mapping

| BLS Scenario | Test Type | Test ID | Status |
|--------------|-----------|---------|--------|
| DISC-011: Valid job | E2E | R02-01 | ✅ Covered |
| DISC-012: Job not found | E2E | R02-02 | ✅ Covered |
| DISC-013: Closed job | E2E | R02-03 | ✅ Covered |
| DISC-014: Expired job | E2E | R02-04 | ✅ Covered |
| DISC-015: Apply deep link | E2E | R02-11 | ✅ Covered |
| DISC-016: Similar jobs | E2E | R02-12 | ✅ Covered |
| DISC-017: Application count | Unit | - | ⚠️ P1 feature, defer |
| DISC-018: Company link | E2E | R02-13 | ✅ Covered |

**Coverage: 7/8 scenarios (87.5%)** - DISC-017 deferred to P1

---

## 7. Implementation Phases

### Phase 1: Foundation (4-5 hours) ✅ MUST COMPLETE

**Goal:** Basic job detail page with ISR, SEO, and static content display

**Deliverables:**
1. ✅ File structure setup
   - Create `app/jobsmarket/jobs/[id]/` directory
   - Create `_components/` subdirectory
   - Create test directories

2. ✅ Server components
   - `page.tsx` with `generateMetadata()` and ISR config
   - `loading.tsx` with skeleton
   - `not-found.tsx` with 404 UI

3. ✅ Static content components
   - `JobHeader.tsx` - title, company, salary
   - `JobMetadata.tsx` - badges
   - `JobDescription.tsx` - HTML rendering
   - `JobRequirements.tsx` - HTML rendering

4. ✅ SEO components
   - `JobStructuredData.tsx` - JSON-LD schema
   - Metadata helper functions

**Tests:**
- Unit: JobHeader, JobMetadata (5 tests)
- Integration: getPublicJobById (4 tests)
- E2E: R02-01 (load job), R02-02 (404) (2 tests)

**Quality Gates:**
- ✅ Build passes
- ✅ Can navigate to `/jobs/[id]` and see job title
- ✅ SEO meta tags present in HTML
- ✅ ISR revalidation configured

---

### Phase 2: Sidebar & State Management (3-4 hours) ✅ MUST COMPLETE

**Goal:** Interactive sidebar with save job functionality and state-based UI

**Deliverables:**
1. ✅ Client orchestrator
   - `JobDetailClient.tsx` with state management
   - Sidebar state computation logic
   - Hook integrations (`useSaveJobMutation`, `useProfileCompletion`)

2. ✅ Sidebar components
   - `ApplySection.tsx` with 5 state variants
   - Reuse `SaveJobButton` component
   - Profile completion checklist UI

3. ✅ Company info (optional for P0)
   - `CompanyInfo.tsx` in sidebar

**Tests:**
- Unit: ApplySection (5 tests), sidebar-state logic (6 tests)
- E2E: R02-05 (guest apply), R02-06 (profile incomplete), R02-09 (save guest), R02-10 (save logged in) (4 tests)

**Quality Gates:**
- ✅ Guest sees login CTA
- ✅ Logged-in candidate sees apply button
- ✅ Save job works with optimistic updates
- ✅ Profile incomplete state shows checklist

---

### Phase 3: Apply Flow (2-3 hours) ⚠️ DEPENDS ON BLS-03

**Goal:** Apply modal and application submission

**Deliverables:**
1. ✅ Apply modal
   - `ApplyModal.tsx` with form
   - Form validation
   - Submit handler (placeholder for now)

2. ⚠️ Server action (DEFERRED TO BLS-03)
   - `submitJobApplication()` - NOT implemented yet
   - Will be part of Application flow (BLS-03)

**Tests:**
- Unit: ApplyModal (4 tests)
- E2E: R02-07 (modal opens), R02-08 (submit - will use mock) (2 tests)

**Quality Gates:**
- ✅ Apply modal opens on button click
- ✅ Form validates expected salary format
- ⚠️ Submit calls placeholder function (real implementation in BLS-03)

**Note:** Full apply functionality requires BLS-03 (Application Stage). For JOB-R02, implement UI and mock submission.

---

### Phase 4: Similar Jobs & Polish (2-3 hours) ✅ P1 PRIORITY

**Goal:** Similar jobs carousel and final touches

**Deliverables:**
1. ✅ Similar jobs carousel
   - `SimilarJobs.tsx` with horizontal scroll
   - Reuse `JobCard` component (compact variant)
   - Navigation arrows
   - Touch/swipe support

2. ✅ Deep link support
   - Handle `?apply=true` query param
   - Auto-scroll and focus apply button

3. ✅ Closed/expired job banners
   - Job unavailable states

**Tests:**
- Unit: SimilarJobs (2 tests)
- Integration: getSimilarJobs (2 tests)
- E2E: R02-11 (deep link), R02-12 (similar jobs) (2 tests)

**Quality Gates:**
- ✅ Similar jobs carousel scrolls smoothly
- ✅ Deep link opens apply section
- ✅ Closed job shows banner

---

### Phase 5: Testing & QA (2-3 hours) ✅ MUST COMPLETE

**Goal:** Achieve 90%+ test coverage and pass all quality gates

**Deliverables:**
1. ✅ Complete remaining unit tests
2. ✅ Complete remaining integration tests
3. ✅ Complete remaining E2E tests
4. ✅ Run all quality gates
5. ✅ Fix any bugs found

**Tests:**
- Remaining unit tests: ~7
- Remaining integration tests: ~2
- Remaining E2E tests: ~3

**Quality Gates (ALL MUST PASS):**
- ✅ Gate 1: `npm run build` → 0 errors
- ✅ Gate 2: `npm run lint` → 0 errors
- ✅ Gate 3: `npm run dev` + browser → route loads
- ✅ Gate 4a: Unit tests → 90%+ coverage
- ✅ Gate 4b: Integration tests → all pass
- ✅ Gate 4c: E2E tests → all pass

---

## 8. Phase Breakdown Summary

| Phase | Duration | Priority | Deliverables | Tests | Blockers |
|-------|----------|----------|--------------|-------|----------|
| **Phase 1** | 4-5 hrs | P0 | Server components, static content, SEO | 11 | None |
| **Phase 2** | 3-4 hrs | P0 | Client state, sidebar, save job | 15 | None |
| **Phase 3** | 2-3 hrs | P0 | Apply modal (UI only) | 6 | BLS-03 for real submission |
| **Phase 4** | 2-3 hrs | P1 | Similar jobs, deep links, polish | 6 | None |
| **Phase 5** | 2-3 hrs | P0 | Testing, QA, quality gates | All | None |
| **TOTAL** | **13-18 hrs** | - | **12 components** | **~28 tests** | - |

**Estimated Duration:** 1.5-2 days (13-18 hours)

---

## 9. Open Questions for PM/SA

### Q1: Apply Flow Implementation Timing

**Context:** JOB-R02 includes an "Apply for Job" button, but the full application flow is specified in BLS-03 (Application Stage).

**Question:** Should we:
- **Option A:** Implement apply button UI in JOB-R02, but leave submission logic as placeholder until BLS-03 is implemented?
- **Option B:** Skip apply functionality entirely in JOB-R02 and implement it all in BLS-03?
- **Option C:** Implement full apply flow now as part of JOB-R02 (brings BLS-03 forward)?

**Recommendation:** **Option A** - Implement UI now (modal, form validation), mock submission. Real server action in BLS-03.

**Rationale:** Maintains TDD discipline, allows testing of UI states, avoids scope creep.

---

### Q2: Similar Jobs Algorithm

**Context:** RIS specifies similar jobs should match by `jobFunction` OR `jobIndustry`, but current `getSimilarJobs()` server action is simplified and doesn't implement this logic.

**Question:** Should we:
- **Option A:** Use current simplified implementation (just returns recent jobs, no matching logic) for v1.0?
- **Option B:** Implement proper matching algorithm now (requires MeiliSearch index updates)?
- **Option C:** Defer to future enhancement?

**Recommendation:** **Option A** - Ship with simplified version, file technical debt ticket.

**Rationale:** Similar jobs is P1 priority, not blocking for launch. Better to ship basic version than delay.

---

### Q3: Application Count Display

**Context:** RIS mentions "XX คนสมัครแล้ว" (application count) as a P1 feature in the sidebar.

**Question:** Should we:
- **Option A:** Implement now (requires counting applications per job)?
- **Option B:** Show in v1.0 but with placeholder count (e.g., "10+ คนสมัครแล้ว")?
- **Option C:** Defer to v1.1?

**Recommendation:** **Option C** - Defer to v1.1. Not critical for MVP.

**Rationale:** Requires additional database queries, not high user value for MVP.

---

### Q4: ISR Pre-Rendering Strategy

**Context:** ISR can pre-render popular jobs at build time for faster initial loads.

**Question:** Should we:
- **Option A:** Pre-render top 100 popular jobs at build time?
- **Option B:** Fully dynamic (no pre-rendering)?
- **Option C:** Pre-render later when we have analytics data?

**Recommendation:** **Option B** for initial launch, then **Option C** later.

**Rationale:** We don't know which jobs are popular yet. Start dynamic, add pre-rendering based on real data.

---

### Q5: Profile Completion Requirements

**Context:** RIS states candidate must have `isResumeCompleted: true` to apply, requiring specific fields in profile.

**Question:** Is the profile completion logic in `useProfileCompletion` hook already implemented and tested from CAND-R02?

**Expected:** Yes, should be ready from candidate profile routes.

**Action:** Verify hook exists and works correctly. If not, file blocker.

---

### Q6: Company Shell Behavior

**Context:** RIS states Company Shell should be used when company views job detail, but apply section should be hidden.

**Question:** How should sidebar behave for company users viewing jobs?
- **Option A:** Show company info + "View Applications" link (if own job)?
- **Option B:** Hide sidebar entirely?
- **Option C:** Show "View on Public Site" link?

**Recommendation:** **Option B** - Hide sidebar for company users.

**Rationale:** Simplest implementation, companies don't need to apply to jobs.

---

## 10. Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Apply flow dependency on BLS-03** | High | Medium | Implement UI now, mock submission, real logic in BLS-03 |
| **Profile completion hook missing** | Low | High | Verify hook exists before Phase 2. If missing, implement basic version or defer apply flow |
| **ISR cache invalidation complexity** | Medium | Low | Start with time-based revalidation (300s), add manual invalidation later |
| **Similar jobs query performance** | Low | Medium | Use simplified algorithm for v1.0, monitor performance, optimize later |
| **HTML sanitization XSS risk** | Low | High | Use DOMPurify library for HTML rendering, test with XSS payloads |
| **Mobile responsive layout issues** | Medium | Medium | Test on mobile viewports during development, use responsive design patterns |

---

## 11. Success Criteria

### 11.1 Functional Requirements (MUST HAVE)

- ✅ Job detail page loads with job title, company, description
- ✅ ISR revalidates every 5 minutes
- ✅ SEO metadata (title, description, OG tags) present
- ✅ JSON-LD structured data included
- ✅ Guest users see login prompt when clicking apply/save
- ✅ Logged-in candidates can save/unsave jobs
- ✅ Sidebar shows correct state (guest/incomplete/ready/applied/closed)
- ✅ Profile incomplete state shows checklist
- ✅ Apply modal opens and validates input
- ✅ Closed/expired jobs show appropriate banners
- ✅ 404 page for non-existent jobs

### 11.2 Quality Gates (ALL MUST PASS)

- ✅ **Gate 1:** Build passes (`npm run build` → exit code 0)
- ✅ **Gate 2:** Lint passes (`npm run lint` → 0 errors)
- ✅ **Gate 3:** Dev server starts, route loads in browser
- ✅ **Gate 4a:** Unit tests → 90%+ coverage, all pass
- ✅ **Gate 4b:** Integration tests → all pass
- ✅ **Gate 4c:** E2E tests → all pass

### 11.3 Performance Targets

- ✅ Page load (cached): < 500ms
- ✅ Page load (uncached ISR): < 2s
- ✅ Time to Interactive: < 3s
- ✅ Lighthouse Performance: > 90

### 11.4 Accessibility Requirements

- ✅ ARIA labels on all interactive elements
- ✅ Keyboard navigation works (Tab, Enter, Esc)
- ✅ Screen reader announces page title and job status
- ✅ Focus management in modals
- ✅ Color contrast ratio ≥ 4.5:1

---

## 12. Dependencies

### 12.1 Upstream Dependencies (MUST BE COMPLETE)

| Dependency | Status | Notes |
|------------|--------|-------|
| JOB-R00 (Cross-cutting patterns) | ✅ Complete | Server actions, components, types ready |
| JOB-R01 (Job Search) | ✅ Complete | 19/19 tests passing, serves as reference |
| CAND-R02 (Profile) | ⚠️ Unknown | Need to verify `useProfileCompletion` hook exists |
| MeiliSearch job index | ✅ Complete | Used in JOB-R01, working |

**Blocker Check:** Verify CAND-R02 profile completion hook exists. If not, implement basic version or defer apply flow.

### 12.2 Downstream Dependencies (WAITING FOR JOB-R02)

| Route | Dependency on JOB-R02 | Impact |
|-------|----------------------|--------|
| BLS-03 (Application flow) | Apply modal UI, state management | Can implement server action separately |
| CAND-R03 (Applications) | "Already Applied" state pattern | Reuse applied card component |
| COMP-R05 (Company Jobs) | Job detail component | Can reuse job detail layout |

---

## 13. Technical Debt

| Issue | Severity | Plan |
|-------|----------|------|
| **Similar jobs algorithm simplified** | Low | File ticket: Implement proper jobFunction/jobIndustry matching in getSimilarJobs() |
| **Application count not implemented** | Low | File ticket: Add application count query and display in sidebar |
| **ISR no pre-rendering** | Low | File ticket: Add popular jobs pre-rendering once we have analytics |
| **Apply submission mocked** | High | MUST implement in BLS-03 before launch |

---

## 14. Conclusion

JOB-R02 (Job Detail Page) is **ready to implement** with a **clear path forward**. The route benefits from:

✅ **Strong Foundation:** 70% of infrastructure from JOB-R00/R01 is ready
✅ **Clear Specifications:** RIS and BLS documents are comprehensive
✅ **Proven Patterns:** Can reuse components and patterns from JOB-R01
✅ **Manageable Scope:** 12 new components, ~28 tests, 1.5-2 days

**Key Decisions Needed:**
1. **Apply flow timing:** Recommend implement UI now, server action in BLS-03
2. **Profile completion:** Verify `useProfileCompletion` hook exists
3. **Similar jobs:** Accept simplified algorithm for v1.0

**Next Steps:**
1. PM/SA reviews assessment and answers open questions
2. Resolve blocker: Check if `useProfileCompletion` hook exists
3. Begin Phase 1: Foundation (server components + static content)
4. Follow TDD workflow: Write tests first, then implement

**Estimated Timeline:**
- Phase 1 (Foundation): 4-5 hours
- Phase 2 (Sidebar & State): 3-4 hours
- Phase 3 (Apply Modal UI): 2-3 hours
- Phase 4 (Similar Jobs): 2-3 hours
- Phase 5 (Testing & QA): 2-3 hours
- **Total: 13-18 hours (1.5-2 days)**

**Confidence Level:** **High** ✅

---

**Assessment Complete**
**Status:** READY TO IMPLEMENT
**Blockers:** 1 (verify profile completion hook exists)
**Open Questions:** 6 (for PM/SA review)

---

*End of JOB-R02 Assessment*
