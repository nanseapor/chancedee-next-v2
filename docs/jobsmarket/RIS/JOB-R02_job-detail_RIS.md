# JOB-R02: Job Detail Route Implementation Spec

**Version:** 1.1  
**Last Updated:** 2025-12-09  
**Route:** `/jobs/[id]`  
**Primary Domain:** Jobs

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.1 | 2025-12-09 | Added cross-references to JOB-R00; added SEO section; clarified sidebar as computed state; added accessibility and test scenarios |
| 1.0 | 2025-12-09 | Initial RIS creation with apply flow, sidebar states, profile completion check |

---

## Cross-References

This document references shared specifications from **JOB-R00_cross-cutting_RIS.md**.

| Topic | JOB-R00 Section |
|-------|-----------------|
| Save Job State Machine | Section 3.1 |
| Login Prompt Modal | Section 3.2 |
| Job Unavailable States | Section 3.3 |
| Job Card (Similar Jobs) | Section 4.1 |
| Salary Display | Section 4.2 |
| Posted Date | Section 4.3 |
| MeiliSearch Integration | Section 5 |
| Timeout Configuration | Section 5.6 |
| Server Actions | Section 6 |
| Rate Limiting | Section 13 |
| Accessibility | Section 14 |
| Loading States | Section 15 |
| Implementation Notes | Section 16 |
| Test Scenarios | Section 17.2 |

---

## 1. Route Metadata

| Property | Value |
|----------|-------|
| Route ID | JOB-R02 |
| Route Path | `/jobs/[id]` |
| Shell | Public Shell (guest) / Candidate Shell (authenticated candidate) / Company Shell (authenticated company) |
| Purpose | Decision point for job application - full job details and apply action |
| Complexity | Medium-High |
| Phase | 2 (Public & Jobs) |
| UI Spec | `02-public-routes.md` Section 3.3 |

### Route Parameters

| Parameter | Type | Source | Validation |
|-----------|------|--------|------------|
| `id` | `string` | URL path segment | Must be valid job UID |

### Shell Switching Behavior

| User State | Shell | Determined By |
|------------|-------|---------------|
| Guest (not logged in) | Public Shell | `sessionStateAtom === 'none'` |
| Logged in as Candidate | Candidate Shell | `activeRoleAtom === 'candidate'` |
| Logged in as Company | Company Shell | `activeRoleAtom === 'company'` |

### URL Query Parameters

| Parameter | Type | Purpose | Behavior |
|-----------|------|---------|----------|
| `?apply=true` | boolean | Deep link to apply | Auto-scroll to apply section, focus apply button |
| `?from=search` | string | Referrer tracking | Show back to search link |

---

## 2. SEO & Metadata

### 2.1 Dynamic Metadata

```typescript
// app/jobs/[id]/page.tsx
import { Metadata } from 'next';

export async function generateMetadata({ params }): Promise<Metadata> {
  const job = await JobPostGet(params.id);
  
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

### 2.2 Structured Data (JSON-LD)

```typescript
// components/JobStructuredData.tsx
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

// Employment type mapping for schema.org
function mapEmploymentType(text: string): string {
  const map: Record<string, string> = {
    'งานประจำ': 'FULL_TIME',
    'งานพาร์ทไทม์': 'PART_TIME',
    'สัญญาจ้าง': 'CONTRACTOR',
    'ฝึกงาน': 'INTERN',
  };
  return map[text] || 'OTHER';
}
```

### 2.3 Canonical URL & Closed Job Handling

| Job State | Robots | Canonical | Redirect |
|-----------|--------|-----------|----------|
| Active | `index, follow` | Self | - |
| Closed | `noindex` | Self | - |
| Expired | `noindex` | Self | - |
| Not found | `noindex` | - | 404 page |
| Unpublished | `noindex` | - | 404 page (non-owner) |

---

## 3. Domain Classification

### Primary Domain: Jobs (●)

- **Owns:** Job detail display, apply action, similar jobs
- **Mutations:** Application creation (via JOB-013)
- **Data Source:** Firestore `jobs` collection

### Secondary Domains (○)

| Domain | Role | Access | Condition |
|--------|------|--------|-----------|
| Candidate | Apply for job, save job, profile check | Read candidate profile, write application | Logged in as candidate |
| Company | Company profile link | Read company info | Display only |
| Auth | Login prompt on apply/save | Check `sessionStateAtom` | Guest user attempts action |
| Chat | Message company after apply | Open chat room | Already applied |

### Global Domains (⊙) - Via Shell

| Domain | Requirement |
|--------|-------------|
| Auth | Session state for shell and apply eligibility |
| Chat | FAB in Candidate/Company shells |
| Notifications | Bell icon in Candidate/Company shells |
| Consent | Cookie banner in Public shell |

---

## 4. Feature Mapping

### Existing Features (Preserve - P0)

| Feature ID | Feature Name | Coverage | Notes |
|------------|--------------|----------|-------|
| JOB-002 | View Job Details | Full | Main job detail display |
| JOB-013 | Apply for Job | Full | Apply action with application form |

**Source:** `features_jobs.md` lines 263-302, 796-850

### Feature Implementation Details

#### JOB-002: View Job Details

| Aspect | Implementation |
|--------|----------------|
| Entry Point | `/jobs/[id]` route |
| Server Action | `JobPostGet` |
| Data Source | Firestore `jobs` collection |
| Visibility | Published/ontimer jobs visible to all; unpublished visible to owning company |

#### JOB-013: Apply for Job

| Aspect | Implementation |
|--------|----------------|
| Entry Point | Apply button on job detail |
| Server Action | `JobApplicationSet` |
| Preconditions | Authenticated, profile complete, not already applied |
| Input Fields | Expected salary, availability, cover letter (optional) |

### New Features (Enhancements)

| Feature | Description | Priority |
|---------|-------------|----------|
| Profile Completion Block | Show missing fields before apply | P0 |
| Already Applied Card | Show application status if applied | P0 |
| Similar Jobs Section | Horizontal scroll of related jobs | P0 |
| Save Job | Heart toggle with optimistic update | P0 |
| Login Prompt Modal | When guest tries to apply/save | P0 |
| Application Stats | "XX คนสมัครแล้ว" count | P1 |
| Mobile Fixed Apply Bar | Sticky bottom bar on mobile | P0 |

### State Variations (Sidebar)

| State | Condition | Display |
|-------|-----------|---------|
| Guest | `!isLoggedIn` | "เข้าสู่ระบบเพื่อสมัคร" button |
| Profile Incomplete | `isLoggedIn && !isResumeCompleted` | Profile completion block |
| Ready to Apply | `isLoggedIn && isResumeCompleted && !hasApplied` | Apply button + Save button |
| Already Applied | `isLoggedIn && hasApplied` | Already applied card |
| Job Closed | `jobStatus === 'closed'` | Gray banner "ตำแหน่งนี้ปิดรับสมัครแล้ว" |
| Job Expired | `postExpiryDate < now` | Gray banner "ประกาศงานหมดอายุแล้ว" |

### Not Implemented in v1.0

| Feature | Description | Status |
|---------|-------------|--------|
| Share Job | Social sharing buttons | ☐ Future |
| Report Job | Flag inappropriate listing | ☐ Future |
| Print Job | Printer-friendly view | ☐ Future |

---

## 4. Data Contract

### 4.1 Read Operations

| Data | Collection | Fields | Condition | SWR Key |
|------|------------|--------|-----------|---------|
| Job Detail | `jobs` | All job fields | `uid === params.id` | `job-${id}` |
| Company Info | `company_information` | `uid`, `name`, `logo`, `industry`, `size` | `uid === job.companyId` | `company-${companyId}` |
| Candidate Profile | `candidate_information` | `isResumeCompleted`, `isOnboarded`, profile fields | `uid === currentUser.uid` | `candidate-${uid}` |
| Application Status | `web_job_applications` | `status`, `createdAt`, `applicationId` | `candidateId === uid && jobId === id` | `application-${uid}-${jobId}` |
| Saved Status | `candidate_saved_jobs` | `jobId` | `candidateId === uid` | `saved-jobs-${uid}` |
| Similar Jobs | `jobs` (MeiliSearch) | Card fields | Same function/industry, active | `similar-jobs-${id}` |
| Application Count | `web_job_applications` | count | `jobId === id` | `job-application-count-${id}` |

### 4.2 Job Detail Fields

| Field | Type | Display | Format |
|-------|------|---------|--------|
| `uid` | string | - | Internal |
| `title` | string | Job Title | Bold, H1 |
| `companyId` | string | - | Link reference |
| `companyName` | string | Company Name | Link to `/companies/[id]` |
| `companyLogo` | string | Company Logo | 80×80 image |
| `minSalary` | number | Salary Range | ฿XX,XXX format |
| `maxSalary` | number | Salary Range | ฿XX,XXX format |
| `isNegotiable` | boolean | Negotiable indicator | "ตามตกลง" if true |
| `workLocationText` | string | Location | Badge |
| `employmentText` | string | Job Type | Badge |
| `experienceText` | string | Experience | Badge |
| `educationLevelText` | string[] | Education | Badge |
| `jobDescriptionDetails` | string | Description | Rich text (HTML) |
| `qualificationDetails` | string | Requirements | Rich text (HTML) |
| `benefitsDetails` | string | Benefits | Rich text (HTML) |
| `phone` | string | Contact Phone | Display |
| `email` | string | Contact Email | Display |
| `postStartDate` | number | Posted Date | Thai date format |
| `postExpiryDate` | number | Deadline | Thai date format |
| `jobStatus` | enum | - | Controls visibility |
| `isActive` | boolean | - | Controls visibility |
| `positions` | number | Open Positions | "รับ X ตำแหน่ง" |

### 4.3 Write Operations

| Action | Collection | Fields | Server Action | Trigger |
|--------|------------|--------|---------------|---------|
| Apply for Job | `web_job_applications` | See Application Fields | `JobApplicationSet` | Apply button submit |
| Save Job | `candidate_saved_jobs` | `jobId`, `candidateId`, `savedAt` | `CandidateSaveJob` | Save button click |
| Unsave Job | `candidate_saved_jobs` | - (delete) | `CandidateUnsaveJob` | Unsave button click |

### 4.4 Application Fields (Input)

| Field | Type | Required | Validation | Default |
|-------|------|----------|------------|---------|
| `jobId` | string | Yes | Valid job ID | From URL |
| `candidateId` | string | Yes | Current user UID | From session |
| `expectedSalary` | number | No | >= 0 | null |
| `isNegotiable` | boolean | No | - | true |
| `overheadDays` | number | No | 0, 7, 15, 30, 60, 90 | 0 |
| `headlines` | string | No | Max 500 chars | '' |

### 4.5 Profile Completion Requirements

To apply for a job, candidate must have `isResumeCompleted: true`. Required fields:

| Section | Required Fields |
|---------|-----------------|
| Basic Info | `firstNameTh`, `lastNameTh`, `phone`, `email` |
| Work Experience | At least 1 entry OR `isFreshGraduate: true` |
| Education | At least 1 entry |
| Skills | At least 1 skill |
| About | `aboutMe` (non-empty) |

---

## 5. State Contract

### 5.1 Atoms Used

| Atom | Type | Access | Purpose |
|------|------|--------|---------|
| `userAtom` | `userDataProps \| null` | Read | Check login state, get UID |
| `candidateAtom` | `candidateDataProps \| null` | Read | Profile completion status |
| `activeRoleAtom` | `string` | Read | Determine shell type |
| `sessionStateAtom` | `'valid' \| 'expired' \| 'none' \| 'validating'` | Read | Auth state |

### 5.2 SWR Keys

| Key Pattern | Purpose | Config |
|-------------|---------|--------|
| `job-${id}` | Job detail data | `defaultSWRConfig` |
| `company-${companyId}` | Company info | `defaultSWRConfig` |
| `candidate-${uid}` | Candidate profile | `defaultSWRConfig` |
| `application-${uid}-${jobId}` | Existing application | `defaultSWRConfig` |
| `saved-jobs-${uid}` | Saved job IDs | `defaultSWRConfig` |
| `similar-jobs-${id}` | Similar job recommendations | `staticSWRConfig` |
| `job-application-count-${id}` | Application count | `backgroundSWRConfig` |

### 5.3 Local Component State

| State | Type | Scope | Purpose |
|-------|------|-------|---------|
| `isApplyModalOpen` | `boolean` | Page | Control apply form modal |
| `isLoginPromptOpen` | `boolean` | Page | Control login prompt modal |
| `loginPromptAction` | `'apply' \| 'save'` | Page | What triggered login prompt |
| `applyFormData` | `ApplyFormState` | Apply modal | Form field values |
| `isSubmitting` | `boolean` | Apply modal | Prevent double submit |
| `isSaving` | `boolean` | Save button | Optimistic update state |

### 5.4 Apply Form State Shape

```typescript
interface ApplyFormState {
  expectedSalary: number | null;
  isNegotiable: boolean;
  overheadDays: number;       // 0 = ได้ทันที, 7, 15, 30, 60, 90
  headlines: string;          // Cover letter
}

const defaultApplyForm: ApplyFormState = {
  expectedSalary: null,
  isNegotiable: true,
  overheadDays: 0,
  headlines: '',
};
```

---

## 6. UI State Machine

### 6.1 Page State Automaton

```
                    ┌─────────────┐
                    │   LOADING   │
                    │ (fetch job) │
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
  │    IDLE     │   │  NOT_FOUND  │   │    ERROR    │
  │ (job data)  │   │   (404)     │   │  (failed)   │
  └──────┬──────┘   └─────────────┘   └──────┬──────┘
         │                                    │
         │                                    │
         ▼                                    ▼
  ┌─────────────┐                     ┌─────────────┐
  │  APPLYING   │                     │    IDLE     │
  └──────┬──────┘                     └─────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
SUCCESS    ERROR
    │         │
    ▼         ▼
 APPLIED   IDLE
```

#### Page State Transition Table

| Current State | Event | Next State | Guard Condition | Side Effects |
|---------------|-------|------------|-----------------|--------------|
| `loading` | `FETCH_SUCCESS` | `idle` | `job !== null` | Set job data |
| `loading` | `FETCH_SUCCESS` | `not_found` | `job === null` | - |
| `loading` | `FETCH_ERROR` | `error` | - | Set `errorMessage` |
| `idle` | `APPLY_CLICK` | `idle` | `!isLoggedIn` | Open login prompt |
| `idle` | `APPLY_CLICK` | `idle` | `!isResumeCompleted` | Scroll to profile block |
| `idle` | `APPLY_CLICK` | `applying` | `isLoggedIn && isResumeCompleted` | Open apply modal |
| `applying` | `SUBMIT_APPLICATION` | `applying` | - | Set `isSubmitting: true` |
| `applying` | `APPLICATION_SUCCESS` | `applied` | - | Close modal, show success toast, refresh application status |
| `applying` | `APPLICATION_ERROR` | `idle` | - | Show error toast |
| `applying` | `CANCEL` | `idle` | - | Close modal |
| `applied` | - | - | - | Terminal state (show applied card) |
| `error` | `RETRY` | `loading` | - | Re-fetch job |
| `not_found` | - | - | - | Terminal state (show 404) |

### 6.2 Apply Sidebar State (Computed)

> ⚠️ **Implementation Note:** This is **computed/derived state**, not a true state machine. See **JOB-R00 Section 16.2** for implementation guidance.

The sidebar state is determined by multiple conditions and should be implemented as `useMemo`, not `useReducer`:

```typescript
type SidebarState = 'guest' | 'incomplete' | 'ready' | 'applying' | 'applied' | 'closed';

function useSidebarState(
  isLoggedIn: boolean,
  isResumeCompleted: boolean,
  hasApplication: boolean,
  jobStatus: JobStatus,
  isExpired: boolean,
  isApplying: boolean  // Only this triggers local state change
): SidebarState {
  return useMemo(() => {
    // Order matters: most specific first
    if (isApplying) return 'applying';
    if (!isLoggedIn) return 'guest';
    if (jobStatus === 'closed' || isExpired) return 'closed';
    if (hasApplication) return 'applied';
    if (!isResumeCompleted) return 'incomplete';
    return 'ready';
  }, [isLoggedIn, isResumeCompleted, hasApplication, jobStatus, isExpired, isApplying]);
}
```

#### State Conditions

| State | Condition | Priority |
|-------|-----------|----------|
| `applying` | `isApplying === true` | 1 (highest) |
| `guest` | `!isLoggedIn` | 2 |
| `closed` | `jobStatus === 'closed' \|\| isExpired` | 3 |
| `applied` | `hasApplication` | 4 |
| `incomplete` | `!isResumeCompleted` | 5 |
| `ready` | All other conditions false | 6 (default) |

#### State Display Mapping

| State | Sidebar Content |
|-------|-----------------|
| `guest` | Login CTA button |
| `incomplete` | Profile completion checklist + CTA |
| `ready` | Apply button + Save button |
| `applying` | Apply button (loading) + Save button |
| `applied` | Already applied card with status |
| `closed` | Gray banner with message |

### 6.3 Apply Modal Automaton

| Current State | Event | Next State | Guard Condition | Side Effects |
|---------------|-------|------------|-----------------|--------------|
| `closed` | `OPEN` | `editing` | - | Initialize form with defaults |
| `editing` | `FIELD_CHANGE` | `editing` | - | Update form state |
| `editing` | `SUBMIT` | `submitting` | `form.isValid` | Disable submit button |
| `editing` | `CLOSE` | `closed` | - | Clear form state |
| `submitting` | `SUCCESS` | `closed` | - | Show success toast |
| `submitting` | `ERROR` | `editing` | - | Show error, enable button |

### 6.4 Save Job Automaton

> **Canonical Definition:** See **JOB-R00 Section 3.1** for the complete Save Job state machine.

This route implements the shared Save Job automaton with route-specific behavior:

| Aspect | JOB-R02 Specific |
|--------|------------------|
| Trigger location | Save button in sidebar, mobile apply bar |
| Login redirect | `/auth/login?redirect=/jobs/${id}` |
| UI feedback | Optimistic update, toast notification |
| SWR invalidation | `saved-jobs-${uid}` |

---

## 7. Component-Action Wiring

### 7.1 Job Header Components

| Component | Trigger | Action | State Transition |
|-----------|---------|--------|------------------|
| Company Logo | Click | `router.push('/companies/${companyId}')` | - (navigation) |
| Company Name | Click | `router.push('/companies/${companyId}')` | - (navigation) |
| Back Button | Click | `router.back()` or `router.push('/jobs')` | - (navigation) |

### 7.2 Apply Sidebar Components (Desktop)

| Component | Trigger | Action | State Transition |
|-----------|---------|--------|------------------|
| Apply Button | Click | `handleApplyClick()` | See Page State Automaton |
| Save Button | Click | `toggleSave(jobId)` | See Save Job Automaton |
| Login Button (guest) | Click | `openLoginPrompt('apply')` | Open login prompt |
| Go to Profile (incomplete) | Click | `router.push('/candidates/${uid}/profile')` | - (navigation) |
| View Application (applied) | Click | `router.push('/candidates/${uid}/applications')` | - (navigation) |
| Message Company (applied) | Click | `openChat(companyId)` | Open chat room |
| View Company Profile | Click | `router.push('/companies/${companyId}')` | - (navigation) |

### 7.3 Mobile Fixed Apply Bar

| Component | Trigger | Action | State Transition |
|-----------|---------|--------|------------------|
| Apply Button | Click | `handleApplyClick()` | Same as desktop |
| Save Button | Click | `toggleSave(jobId)` | Same as desktop |

### 7.4 Apply Modal Components

| Component | Trigger | Action | State Transition |
|-----------|---------|--------|------------------|
| Close Button (×) | Click | `closeApplyModal()` | Modal `editing` → `closed` |
| Backdrop | Click | `closeApplyModal()` | Modal `editing` → `closed` |
| Expected Salary Input | Change | `setFormData({...form, expectedSalary: value})` | - |
| Negotiable Checkbox | Change | `setFormData({...form, isNegotiable: !form.isNegotiable})` | - |
| Availability Dropdown | Change | `setFormData({...form, overheadDays: value})` | - |
| Cover Letter Textarea | Change | `setFormData({...form, headlines: value})` | - |
| Submit Button | Click | `submitApplication()` | Modal `editing` → `submitting` |
| Cancel Button | Click | `closeApplyModal()` | Modal `editing` → `closed` |

### 7.5 Login Prompt Modal

| Component | Trigger | Action | State Transition |
|-----------|---------|--------|------------------|
| Close Button (×) | Click | `closeLoginPrompt()` | Close modal |
| Backdrop | Click | `closeLoginPrompt()` | Close modal |
| Login Button | Click | `redirectToLogin()` | Navigate to `/auth/login?redirect=/jobs/${id}` |
| Register Button | Click | `redirectToRegister()` | Navigate to `/auth/register` |

### 7.6 Similar Jobs Section

| Component | Trigger | Action | State Transition |
|-----------|---------|--------|------------------|
| Job Card | Click | `router.push('/jobs/${jobId}')` | - (navigation) |
| Save Button (on card) | Click | `toggleSave(jobId)` | Per-card save automaton |
| Scroll Arrow (left) | Click | `scrollCarousel(-1)` | - |
| Scroll Arrow (right) | Click | `scrollCarousel(1)` | - |

### 7.7 Job Content Sections

| Component | Trigger | Action | State Transition |
|-----------|---------|--------|------------------|
| Section Toggle (mobile) | Click | `toggleSection(sectionId)` | Expand/collapse |
| External Link | Click | `window.open(url, '_blank')` | - |
| Email Link | Click | `window.location.href = 'mailto:${email}'` | - |
| Phone Link | Click | `window.location.href = 'tel:${phone}'` | - |

---

## 8. Error Handling

### 8.1 Page-Level Errors

| Error Type | Condition | UI State | Display (Thai) | Recovery |
|------------|-----------|----------|----------------|----------|
| Job Not Found | Job doesn't exist | `not_found` | ไม่พบงานที่คุณกำลังค้นหา | "ค้นหางานอื่น" → `/jobs` |
| Job Unpublished | `jobStatus === 'unpublished' && !isOwner` | `not_found` | งานนี้ไม่พร้อมให้สมัครในขณะนี้ | "ค้นหางานอื่น" → `/jobs` |
| Network Error | Fetch failed | `error` | ไม่สามารถโหลดข้อมูลได้ | Retry button |
| Server Error | 500 response | `error` | เกิดข้อผิดพลาด กรุณาลองใหม่ | Retry button |

### 8.2 Apply Errors

| Error Type | Condition | Display (Thai) | Recovery |
|------------|-----------|----------------|----------|
| Already Applied | Application exists | คุณสมัครงานนี้แล้ว | Auto-transition to `applied` state |
| Profile Incomplete | `!isResumeCompleted` | กรุณากรอกข้อมูลให้ครบก่อนสมัคร | Link to profile |
| Job Closed | `jobStatus === 'closed'` | ตำแหน่งนี้ปิดรับสมัครแล้ว | Show closed banner |
| Network Error | Submit failed | ไม่สามารถส่งใบสมัครได้ กรุณาลองใหม่ | Keep modal open, retry |
| Rate Limited | Too many attempts | กรุณารอสักครู่ | Toast with countdown |

### 8.3 Save Job Errors

Same as JOB-R01 Section 8.2.

---

## 9. Implementation Checklist

### 9.1 Page Structure

- [ ] Dynamic route `/jobs/[id]/page.tsx`
- [ ] Metadata generation (title, description, og:image)
- [ ] Structured data (JobPosting schema.org)
- [ ] Shell detection and switching

### 9.2 Job Header Component

- [ ] Company logo (80×80, clickable)
- [ ] Job title (H1)
- [ ] Company name (link)
- [ ] Info badges row
  - [ ] Location badge
  - [ ] Job type badge
  - [ ] Experience badge
  - [ ] Education badge
- [ ] Salary display (prominent)
- [ ] Meta info (posted date, deadline)

### 9.3 Main Content Section

- [ ] Job description (rich text render)
- [ ] Responsibilities section
- [ ] Requirements section
- [ ] Benefits section
- [ ] Additional info section (optional)
- [ ] Contact information
- [ ] Section collapse/expand (mobile)

### 9.4 Apply Sidebar (Desktop)

- [ ] Salary card
- [ ] Sidebar state machine implementation
- [ ] Guest state (login CTA)
- [ ] Profile incomplete state (checklist)
- [ ] Ready state (apply + save buttons)
- [ ] Applied state (status card)
- [ ] Closed/expired state (banner)
- [ ] Company summary card
- [ ] Application count display

### 9.5 Mobile Fixed Apply Bar

- [ ] Sticky bottom bar
- [ ] Apply button (primary)
- [ ] Save button (secondary)
- [ ] State-aware display

### 9.6 Apply Modal

- [ ] Modal component
- [ ] Expected salary input
- [ ] Negotiable checkbox
- [ ] Availability dropdown
- [ ] Cover letter textarea
- [ ] Character counter
- [ ] Submit button with loading
- [ ] Form validation
- [ ] Success/error handling

### 9.7 Profile Completion Block

- [ ] Warning icon
- [ ] Missing fields checklist
- [ ] "ไปที่โปรไฟล์" CTA button

### 9.8 Already Applied Card

- [ ] Check icon
- [ ] Applied date
- [ ] Current status badge
- [ ] View application link
- [ ] Message company button (if applicable)

### 9.9 Similar Jobs Section

- [ ] Section title
- [ ] Horizontal scroll carousel
- [ ] Job cards (3-4)
- [ ] Navigation arrows
- [ ] Touch/swipe support (mobile)

### 9.10 Login Prompt Modal

- [ ] Modal component
- [ ] Message based on action (apply vs save)
- [ ] Login button
- [ ] Register button
- [ ] Close handling

### 9.11 Error States

- [ ] 404 page (job not found)
- [ ] Error state with retry
- [ ] Loading skeleton

---

## 10. Decisions Log

| Decision | Value | Rationale | Date |
|----------|-------|-----------|------|
| Profile check before apply | Client-side block, server-side validation | Better UX, clear guidance | 2025-12-09 |
| Apply modal vs inline form | Modal | Clean separation, focus on action | 2025-12-09 |
| Availability options | 0, 7, 15, 30, 60, 90 days | Standard Thai market options | 2025-12-09 |
| Cover letter optional | Not required | Reduce friction, increase applications | 2025-12-09 |
| Expected salary optional | Not required | Some candidates prefer not to disclose | 2025-12-09 |
| Similar jobs algorithm | Same job function + location | Simple, effective matching | 2025-12-09 |
| Mobile apply bar | Fixed bottom | Ensure apply CTA always visible | 2025-12-09 |
| Closed job display | Show content, gray apply area | Users can still view details | 2025-12-09 |
| Already applied - chat | Show message button if applied | Enable follow-up communication | 2025-12-09 |

---

## 11. Appendices

### Appendix A: Type Definitions

```typescript
// Job Detail Response
interface JobDetailData {
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
  educationLevelText: string[];
  jobDescriptionDetails: string;  // HTML
  qualificationDetails: string;   // HTML
  benefitsDetails: string;        // HTML
  phone: string;
  email: string;
  postStartDate: number;
  postExpiryDate: number;
  jobStatus: JobStatus;
  isActive: boolean;
  positions: number;
  createdAt: number;
  updatedAt: number;
}

type JobStatus = 'draft' | 'published' | 'ontimer' | 'unpublished' | 'closed';

// Apply Form
interface ApplyFormState {
  expectedSalary: number | null;
  isNegotiable: boolean;
  overheadDays: number;
  headlines: string;
}

// Application Input
interface JobApplicationInput {
  jobId: string;
  candidateId: string;
  expectedSalary?: number;
  isNegotiable?: boolean;
  overheadDays?: number;
  headlines?: string;
}

// Existing Application
interface ExistingApplication {
  applicationId: string;
  status: ApplicationStatus;
  createdAt: number;
  updatedAt: number;
}

type ApplicationStatus = 
  | 'new' 
  | 'read' 
  | 'accepted' 
  | 'rejected' 
  | 'scheduled' 
  | 'confirmed' 
  | 'withdraw' 
  | 'systemclosed';

// Sidebar State
type SidebarState = 
  | 'guest' 
  | 'incomplete' 
  | 'ready' 
  | 'applying' 
  | 'applied' 
  | 'closed';
```

### Appendix B: Server Actions

| Action | Signature | Purpose |
|--------|-----------|---------|
| `JobPostGet` | `(jobId: string) => Promise<JobDetailData \| null>` | Fetch job detail |
| `JobApplicationSet` | `(input: JobApplicationInput) => Promise<ApplicationResult>` | Create application |
| `JobApplicationGetByCandidate` | `(candidateId: string, jobId: string) => Promise<ExistingApplication \| null>` | Check existing application |
| `CandidateSaveJob` | `(params: SaveJobParams) => Promise<SaveJobResult>` | Save job |
| `CandidateUnsaveJob` | `(params: SaveJobParams) => Promise<SaveJobResult>` | Unsave job |
| `GetSimilarJobs` | `(jobId: string, limit: number) => Promise<JobCardData[]>` | Get similar jobs |

### Appendix C: Thai Copy Reference

| Element | Thai | English |
|---------|------|---------|
| Page Title | {title} - ChanceDee | Job Title - ChanceDee |
| Apply Button | สมัครงาน | Apply Now |
| Save Button | บันทึก | Save |
| Saved Button | บันทึกแล้ว | Saved |
| Login to Apply | เข้าสู่ระบบเพื่อสมัคร | Login to Apply |
| Login to Save | เข้าสู่ระบบเพื่อบันทึกงาน | Login to Save Job |
| Already Applied Title | คุณสมัครงานนี้แล้ว | You've Applied |
| Applied Date | เมื่อ {date} | On {date} |
| View Application | ดูใบสมัคร | View Application |
| Message Company | ส่งข้อความ | Message |
| Profile Incomplete Title | กรุณากรอกข้อมูลให้ครบก่อนสมัคร | Please Complete Your Profile |
| Go to Profile | ไปที่โปรไฟล์ | Go to Profile |
| Job Closed | ตำแหน่งนี้ปิดรับสมัครแล้ว | This Position is Closed |
| Job Expired | ประกาศงานหมดอายุแล้ว | Job Posting Expired |
| Application Count | {count} คนสมัครแล้ว | {count} applicants |
| Similar Jobs | งานที่คล้ายกัน | Similar Jobs |
| Posted | โพสต์เมื่อ {date} | Posted {date} |
| Deadline | ปิดรับสมัคร {date} | Closes {date} |
| Positions | รับ {count} ตำแหน่ง | {count} positions |
| Negotiable | ตามตกลง | Negotiable |
| Description | รายละเอียดงาน | Job Description |
| Responsibilities | หน้าที่รับผิดชอบ | Responsibilities |
| Requirements | คุณสมบัติ | Requirements |
| Benefits | สวัสดิการ | Benefits |
| Contact | ติดต่อ | Contact |

### Appendix D: Apply Form Labels

| Field | Label (Thai) | Placeholder |
|-------|-------------|-------------|
| Expected Salary | เงินเดือนที่คาดหวัง | เช่น 25000 |
| Negotiable | ต่อรองได้ | - |
| Availability | สามารถเริ่มงานได้ | เลือกระยะเวลา |
| Cover Letter | แนะนำตัวเอง (ไม่บังคับ) | บอกเล่าเกี่ยวกับตัวคุณ ทำไมคุณสนใจงานนี้... |

### Appendix E: Availability Options

| Value | Label (Thai) | Label (English) |
|-------|-------------|-----------------|
| `0` | ได้ทันที | Immediately |
| `7` | ภายใน 1 สัปดาห์ | Within 1 week |
| `15` | ภายใน 2 สัปดาห์ | Within 2 weeks |
| `30` | ภายใน 1 เดือน | Within 1 month |
| `60` | ภายใน 2 เดือน | Within 2 months |
| `90` | ภายใน 3 เดือน | Within 3 months |

### Appendix F: Application Status Display

| Status | Badge Color | Label (Thai) |
|--------|-------------|--------------|
| `new` | Blue | ส่งใบสมัครแล้ว |
| `read` | Gray | บริษัทดูแล้ว |
| `accepted` | Green | ผ่านการคัดเลือก |
| `rejected` | Red | ไม่ผ่านการคัดเลือก |
| `scheduled` | Orange | นัดสัมภาษณ์แล้ว |
| `confirmed` | Green | ยืนยันสัมภาษณ์แล้ว |
| `withdraw` | Gray | ถอนใบสมัครแล้ว |
| `systemclosed` | Gray | ปิดโดยระบบ |

---

## 12. Accessibility

> See **JOB-R00 Section 14** for complete accessibility specifications.

### Route-Specific a11y Requirements

| Component | ARIA | Keyboard | Focus |
|-----------|------|----------|-------|
| Job header | `aria-label="{title} ที่ {company}"` | - | - |
| Company logo | `aria-label="โปรไฟล์ {company}"` | `Enter` navigates | - |
| Info badges | - | - | - |
| Apply button | `aria-label="สมัครงาน {title}"` | `Enter`/`Space` | Visible focus ring |
| Save button | `aria-pressed`, `aria-label` | `Enter`/`Space` | - |
| Apply modal | `role="dialog"`, `aria-modal="true"` | `Escape` closes | Trap focus |
| Form inputs | Standard labels | Tab navigation | Auto-focus first field |
| Content sections | `aria-labelledby` | - | - |
| Similar jobs carousel | `role="list"`, `aria-label="งานที่คล้ายกัน"` | Arrow keys | - |

### Focus Management

| Scenario | Focus Target |
|----------|--------------|
| Page load | First heading (H1) |
| Apply modal opens | Expected salary input |
| Apply modal closes (success) | Job header |
| Apply modal closes (cancel) | Apply button |
| Login prompt opens | Login button |
| Deep link `?apply=true` | Apply button |

### Screen Reader Announcements

| Event | Announcement |
|-------|--------------|
| Page loaded | "{title} - รายละเอียดงาน" |
| Apply modal opened | "กรอกใบสมัครงาน" |
| Application submitted | "ส่งใบสมัครเรียบร้อย" |
| Job saved | "บันทึกงานแล้ว" |
| Error occurred | Error message text |

---

## 13. Test Scenarios

> See **JOB-R00 Section 17.2** for complete test scenario table.

### Critical Path Tests

| ID | Scenario | Expected |
|----|----------|----------|
| R02-01 | Load job detail | Skeleton → job content |
| R02-02 | Job not found | 404 page |
| R02-03 | Job closed | Content visible, gray banner |
| R02-05 | Incomplete profile apply | Scroll to profile block |
| R02-06 | Complete profile apply | Apply modal opens |
| R02-07 | Submit application | Success toast, show applied card |
| R02-10 | Deep link `?apply=true` | Scroll to apply, focus button |

### Edge Cases

| Scenario | Expected |
|----------|----------|
| Already applied | Show applied card on load |
| Job expired mid-view | Show expired banner, disable apply |
| Apply network error | Error toast, modal stays open |
| Rate limited | Show countdown message |
| Invalid job ID | 404 page |
| Job owned by company user | Show job detail (no apply) |

### Responsive Tests

| Scenario | Expected |
|----------|----------|
| Mobile view | Fixed bottom apply bar |
| Desktop view | Sticky sidebar |
| Tablet view | Sidebar, no fixed bar |
| Orientation change | Layout adjusts smoothly |

---

## 14. Related Documents

| Document | Relationship |
|----------|--------------|
| `JOB-R00_cross-cutting_RIS.md` | Shared patterns (Save Job, Loading States, etc.) |
| `02-public-routes.md` | UI specification source |
| `features_jobs.md` | Feature definitions (JOB-002, JOB-013) |
| `data-entities_jobs.md` | Job collection schema |
| `data-entities_job-interviews.md` | Interview schema (for applied state) |
| `JOB-R01_jobs_RIS.md` | Related route (job listing) |
| `CAND-R02_profile_RIS.md` | Profile completion reference |

---

*End of JOB-R02 Route Implementation Spec*
