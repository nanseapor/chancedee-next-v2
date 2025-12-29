# COMP-R07 Implementation Plan

**Route:** `/jobsmarket/companies/[id]/dashboard/jobs/[jobId]`
**Version:** 1.0
**Created:** 2025-12-22
**Status:** Ready for Implementation
**Location:** `docs/jobsmarket/plans/`
**Assessment:** [COMP-R07-ASSESSMENT.md](../assessments/COMP-R07-ASSESSMENT.md)

---

## Overview

| Property | Value |
|----------|-------|
| Complexity | Medium-High |
| Estimated Duration | 40-53 hours (5-7 days @ 8h/day) |
| Test Count | ~76 tests (42 unit, 7 integration, 27 E2E) |
| Reuse Percentage | ~40% from COMP-R06 |
| New Components | 15 components + 5 hooks |

---

## SA Decisions (Approved 2025-12-22)

### Decision 1: Analytics Implementation ✅
- **Use dedicated `job_analytics` collection**
- Pre-aggregated daily views
- Hourly background job to update
- Trade-off: Up to 1hr data lag for better performance

### Decision 2: Edit Mode Approach ✅
- **Create inline components** extracted from COMP-R06
- Components: `JobBasicFields`, `JobDetailsFields`, `JobLocationFields`
- Remove wizard-specific logic (step navigation, progress)

### Decision 3: Status Action Permissions ✅
- **Admin + HR Manager + Recruiter** can perform status actions
- Only Admin can delete (with applicationCount = 0 constraint)
- Per COMP-R00 Section 4.2 permission matrix

### Decision 4: Duplicate Behavior ✅
- **Reset all metrics** (fresh start)
- Copy: content fields (title, description, skills, location)
- Reset: uid, dates, status → 'draft', applicationCount, viewCount

---

## Phase 1: Types & Utilities (2-3 hours)

### 1.1 Files to Create

| File | Location | Purpose |
|------|----------|---------|
| `job-detail.types.ts` | `src/types/jobsmarket/` | All COMP-R07 type definitions |

### 1.2 Types to Define

```typescript
// Page modes
export type PageMode = 'view' | 'edit';
export type ViewTab = 'overview' | 'applications' | 'settings';

// Page states
export type PageState =
  | 'loading'
  | 'auth_check'
  | 'access_check'
  | 'view_mode'
  | 'edit_mode'
  | 'saving'
  | 'confirming'
  | 'processing'
  | 'not_found'
  | 'error';

// Edit state
export type EditState = 'clean' | 'dirty' | 'saving' | 'confirming';

// Job with analytics (extends FirebaseJobData)
export interface JobWithAnalytics extends FirebaseJobData {
  // Aggregated counts
  applicationCount: number;
  unreadApplicationCount: number;
  viewCount: number;
}

// Analytics data (from job_analytics collection)
export interface JobAnalytics {
  jobId: string;
  totalViews: number;
  viewsChange: number;        // % change vs previous 30 days
  dailyViews: DailyView[];    // Last 30 days
  conversionRate: number;     // (applications / views) * 100
  conversionChange: number;   // % vs previous period
  lastUpdated: number;        // Timestamp
}

export interface DailyView {
  date: string;  // YYYY-MM-DD
  views: number;
}

// Application preview (for recent applications)
export interface ApplicationPreview {
  uid: string;
  candidateId: string;
  candidateName: string;
  candidatePhoto?: string;
  status: ApplicationStatus;
  appliedAt: number;
  isRead: boolean;
}

// Action modal state
export type ActionModalState =
  | null
  | { type: 'close'; title: string }
  | { type: 'delete'; title: string; hasApps: boolean }
  | { type: 'discard_changes' }
  | { type: 'unpublish'; title: string };

// Status action availability matrix
export const STATUS_ACTIONS: Record<JobStatus, string[]> = {
  draft: ['publish', 'close', 'delete', 'duplicate'],
  ontimer: ['activate_now', 'cancel_schedule', 'close', 'duplicate'],
  published: ['unpublish', 'close', 'duplicate'],
  unpublished: ['publish', 'close', 'duplicate'],
  closed: ['duplicate']
};

// Action result type
export interface ActionResult {
  success: boolean;
  error?: string;
  data?: any;
}
```

### 1.3 Tests to Write First (TDD RED)

| Test File | Test Cases | Count |
|-----------|------------|-------|
| `job-detail.types.test.ts` | TYPE_ACTIONS matrix validation, type guards | 3 |

**Phase 1 Checklist:**
- [ ] Write type tests
- [ ] Define all types in `job-detail.types.ts`
- [ ] Run tests → should PASS
- [ ] Export from `src/types/jobsmarket/index.ts`

---

## Phase 2: Server Actions (6-8 hours)

### 2.1 Existing Actions (Verify & Test)

| Action | File | Line | BLS | Status |
|--------|------|------|-----|--------|
| `webJobGetById` | `src/lib/database/actions/jobs.ts` | 16 | BLS-07-11 | ✅ Exists |
| `webJobUpdate` | `src/lib/database/actions/jobs.ts` | 56 | BLS-07-04 | ✅ Exists |
| `webJobPublish` | `src/lib/database/actions/jobs.ts` | 82 | BLS-07-05 | ✅ Exists |
| `webJobDelete` | `src/lib/database/actions/jobs.ts` | 69 | BLS-07-09 | ✅ Exists |

**Verification Steps:**
- [ ] Read existing action signatures
- [ ] Verify they match BLS specs
- [ ] Write integration tests if missing

### 2.2 New Actions to Create

#### Action 1: `webJobUnpublish` (BLS-07-07)

**Location:** `src/lib/database/actions/jobs.ts`

**Signature:**
```typescript
"use server";

/**
 * BLS-07-07: Unpublish Job
 * Pause published job (becomes invisible to candidates)
 *
 * @param uid Job ID
 * @returns ActionResult
 */
async function webJobUnpublish(uid: string): Promise<ActionResult>
```

**Implementation:**
1. Fetch job by ID
2. Check job exists
3. Check jobStatus === 'published'
4. Update: `jobStatus: 'unpublished'`
5. Remove from MeiliSearch index
6. Return success

**Test Cases:**
- Unpublish published job → success
- Unpublish non-published job → error
- Job not found → error

---

#### Action 2: `webJobClose` (BLS-07-08)

**Location:** `src/lib/database/actions/jobs.ts`

**Signature:**
```typescript
/**
 * BLS-07-08: Close Job
 * Permanently close job (cannot reopen)
 *
 * @param uid Job ID
 * @returns ActionResult
 */
async function webJobClose(uid: string): Promise<ActionResult>
```

**Implementation:**
1. Fetch job by ID
2. Check job exists
3. Check jobStatus !== 'closed'
4. Update: `jobStatus: 'closed', isActive: false`
5. Remove from MeiliSearch index
6. Return success

**Test Cases:**
- Close active job → success
- Close already closed job → error
- Job not found → error

---

#### Action 3: `webJobDuplicate` (BLS-07-10)

**Location:** `src/lib/database/actions/jobs.ts`

**Signature:**
```typescript
/**
 * BLS-07-10: Duplicate Job
 * Create copy of job as new draft
 *
 * @param sourceJobId Source job ID
 * @returns { jobId: string } New job ID
 */
async function webJobDuplicate(
  sourceJobId: string
): Promise<{ success: boolean; jobId?: string; error?: string }>
```

**Implementation:**
1. Fetch source job
2. Check job exists
3. Create new job object:
   - Copy: title, description, requirements, salary, skills, location, workModel
   - Reset: uid (generate new), createdAt (now), updatedAt (now)
   - Set: jobStatus = 'draft', isActive = false
   - Clear: postStartDate, postExpiryDate, applicationCount = 0, viewCount = 0
4. Create new job document
5. Return new job ID

**Test Cases:**
- Duplicate draft → success
- Duplicate published job → success (creates draft)
- Duplicate closed job → success (creates draft)
- Source job not found → error
- Verify all fields copied correctly
- Verify metrics reset

---

#### Action 4: `fetchJobAnalytics` (BLS-07-11)

**Location:** `src/lib/database/actions/jobs.ts`

**Signature:**
```typescript
/**
 * BLS-07-11: Fetch Job Analytics
 * Get 30-day performance data
 *
 * @param jobId Job ID
 * @returns JobAnalytics
 */
async function fetchJobAnalytics(jobId: string): Promise<JobAnalytics>
```

**Implementation:**
1. Fetch from `job_analytics` collection where jobId = jobId
2. If not found, return empty analytics:
   ```typescript
   {
     jobId,
     totalViews: 0,
     viewsChange: 0,
     dailyViews: [],
     conversionRate: 0,
     conversionChange: 0,
     lastUpdated: Date.now()
   }
   ```
3. Return analytics data

**Test Cases:**
- Fetch existing analytics → returns data
- Fetch for job with no analytics → returns empty
- Invalid job ID → returns empty

---

#### Action 5: `fetchJobApplications` (BLS-07-11)

**Location:** `src/lib/database/actions/jobs.ts`

**Signature:**
```typescript
/**
 * BLS-07-11: Fetch Job Applications
 * Get recent applications for job
 *
 * @param jobId Job ID
 * @param limit Max results (default 5)
 * @returns ApplicationPreview[]
 */
async function fetchJobApplications(
  jobId: string,
  limit: number = 5
): Promise<ApplicationPreview[]>
```

**Implementation:**
1. Query `web_job_applications` collection
2. Filter: `job_id === jobId`
3. Order by: `createdAt desc`
4. Limit: limit
5. Map to ApplicationPreview[]
6. Return results

**Test Cases:**
- Fetch applications (5 exist) → returns 5
- Fetch applications (10 exist, limit 5) → returns 5
- Fetch applications (none exist) → returns []

---

### 2.3 Integration Tests to Write First (TDD RED)

| Test File | Action | Test Cases | Count |
|-----------|--------|------------|-------|
| `job-detail-actions.test.ts` | `webJobUnpublish` | Success, already unpublished, not found | 3 |
| | `webJobClose` | Success, already closed, not found | 3 |
| | `webJobDuplicate` | Success all statuses, verify copy, verify reset, not found | 6 |
| `job-analytics.test.ts` | `fetchJobAnalytics` | Existing data, no data, calculate conversion | 3 |
| | `fetchJobApplications` | Multiple results, limit works, empty | 3 |

**Total Integration Tests: 18 (updated from 7)**

**Phase 2 Checklist:**
- [ ] Write integration tests for all 5 new actions (RED)
- [ ] Implement `webJobUnpublish`
- [ ] Implement `webJobClose`
- [ ] Implement `webJobDuplicate`
- [ ] Implement `fetchJobAnalytics`
- [ ] Implement `fetchJobApplications`
- [ ] All integration tests PASS (GREEN)
- [ ] Export all actions from `jobs.ts`

---

## Phase 3: Hooks (6-8 hours)

### 3.1 Hook 1: `use-job-detail.ts`

**Location:** `src/hooks/jobsmarket/jobs/use-job-detail.ts`

**Purpose:** Fetch job data with SWR

**Signature:**
```typescript
export function useJobDetail(jobId: string | null) {
  return {
    job: JobWithAnalytics | undefined;
    isLoading: boolean;
    error: Error | undefined;
    mutate: () => void;
  };
}
```

**Implementation:**
```typescript
import useSWR from 'swr';
import { webJobGetById } from '@/lib/database/actions/jobs';

export function useJobDetail(jobId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    jobId ? `job-${jobId}` : null,
    () => webJobGetById(jobId!),
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000,
    }
  );

  return {
    job: data,
    isLoading,
    error,
    mutate,
  };
}
```

**Unit Tests (TDD RED):**
- Fetch success → returns job
- Fetch error → returns error
- Job not found → returns undefined
- Null jobId → does not fetch

---

### 3.2 Hook 2: `use-job-analytics.ts`

**Location:** `src/hooks/jobsmarket/jobs/use-job-analytics.ts`

**Purpose:** Fetch analytics with refresh

**Signature:**
```typescript
export function useJobAnalytics(jobId: string | null) {
  return {
    analytics: JobAnalytics | undefined;
    isLoading: boolean;
    error: Error | undefined;
  };
}
```

**Implementation:**
```typescript
import useSWR from 'swr';
import { fetchJobAnalytics } from '@/lib/database/actions/jobs';

export function useJobAnalytics(jobId: string | null) {
  const { data, error, isLoading } = useSWR(
    jobId ? `job-analytics-${jobId}` : null,
    () => fetchJobAnalytics(jobId!),
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: true,
    }
  );

  return {
    analytics: data,
    isLoading,
    error,
  };
}
```

**Unit Tests (TDD RED):**
- Fetch success → returns analytics
- Empty analytics → returns default
- Fetch error → returns error

---

### 3.3 Hook 3: `use-job-edit.ts`

**Location:** `src/hooks/jobsmarket/jobs/use-job-edit.ts`

**Purpose:** Edit mode form state management

**Signature:**
```typescript
export function useJobEdit(initialData: JobFormData) {
  return {
    formData: JobFormData;
    changedFields: Set<string>;
    isDirty: boolean;
    updateField: (field: keyof JobFormData, value: any) => void;
    resetForm: () => void;
    getChanges: () => Partial<JobFormData>;
  };
}
```

**Implementation:**
```typescript
import { useState, useCallback } from 'react';
import { useChangeTracking } from './use-change-tracking';

export function useJobEdit(initialData: JobFormData) {
  const [formData, setFormData] = useState<JobFormData>(initialData);
  const { changedFields, trackChange, resetTracking, getChanges } =
    useChangeTracking(initialData);

  const updateField = useCallback((field: keyof JobFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    trackChange(field, value);
  }, [trackChange]);

  const resetForm = useCallback(() => {
    setFormData(initialData);
    resetTracking();
  }, [initialData, resetTracking]);

  return {
    formData,
    changedFields,
    isDirty: changedFields.size > 0,
    updateField,
    resetForm,
    getChanges: () => getChanges(formData),
  };
}
```

**Unit Tests (TDD RED):**
- Initialize with data → formData matches
- Update field → changedFields updated
- Update field back to original → changedFields removed
- Reset form → clears changes
- getChanges → returns only changed fields
- Block edit for closed job → returns error state
- Validate changed fields → runs validation

---

### 3.4 Hook 4: `use-change-tracking.ts`

**Location:** `src/hooks/jobsmarket/jobs/use-change-tracking.ts`

**Purpose:** Track field-level changes

**Signature:**
```typescript
export function useChangeTracking<T extends Record<string, any>>(
  originalData: T
) {
  return {
    changedFields: Set<string>;
    trackChange: (field: keyof T, value: any) => void;
    resetTracking: () => void;
    getChanges: (currentData: T) => Partial<T>;
  };
}
```

**Implementation:**
```typescript
import { useState, useCallback } from 'react';

export function useChangeTracking<T extends Record<string, any>>(
  originalData: T
) {
  const [changedFields, setChangedFields] = useState<Set<string>>(new Set());

  const trackChange = useCallback((field: keyof T, value: any) => {
    const isChanged = originalData[field] !== value;

    setChangedFields(prev => {
      const next = new Set(prev);
      if (isChanged) {
        next.add(String(field));
      } else {
        next.delete(String(field));
      }
      return next;
    });
  }, [originalData]);

  const resetTracking = useCallback(() => {
    setChangedFields(new Set());
  }, []);

  const getChanges = useCallback((currentData: T): Partial<T> => {
    const changes: Partial<T> = {};
    changedFields.forEach(field => {
      changes[field as keyof T] = currentData[field as keyof T];
    });
    return changes;
  }, [changedFields]);

  return {
    changedFields,
    trackChange,
    resetTracking,
    getChanges,
  };
}
```

**Unit Tests (TDD RED):**
- Track change → adds to set
- Revert change → removes from set
- Reset → clears all
- getChanges → returns only changed
- Deep equality check for objects/arrays

---

### 3.5 Hook 5: `use-job-actions.ts`

**Location:** `src/hooks/jobsmarket/jobs/use-job-actions.ts`

**Purpose:** Status action handlers with SWR invalidation

**Signature:**
```typescript
export function useJobActions(jobId: string, companyId: string) {
  return {
    publish: () => Promise<ActionResult>;
    unpublish: () => Promise<ActionResult>;
    close: () => Promise<ActionResult>;
    deleteJob: () => Promise<ActionResult>;
    duplicate: () => Promise<{ jobId: string }>;
    isLoading: boolean;
  };
}
```

**Implementation:**
```typescript
import { useState } from 'react';
import { useSWRConfig } from 'swr';
import {
  webJobPublish,
  webJobUnpublish,
  webJobClose,
  webJobDelete,
  webJobDuplicate,
} from '@/lib/database/actions/jobs';

export function useJobActions(jobId: string, companyId: string) {
  const { mutate } = useSWRConfig();
  const [isLoading, setIsLoading] = useState(false);

  const invalidateJobCaches = async () => {
    await mutate(`job-${jobId}`);
    await mutate(`company-jobs-${companyId}`);
    await mutate(`company-job-counts-${companyId}`);
  };

  const publish = async () => {
    setIsLoading(true);
    try {
      const result = await webJobPublish(jobId);
      if (result.success) {
        await invalidateJobCaches();
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const unpublish = async () => {
    setIsLoading(true);
    try {
      const result = await webJobUnpublish(jobId);
      if (result.success) {
        await invalidateJobCaches();
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const close = async () => {
    setIsLoading(true);
    try {
      const result = await webJobClose(jobId);
      if (result.success) {
        await invalidateJobCaches();
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteJob = async () => {
    setIsLoading(true);
    try {
      const result = await webJobDelete(jobId);
      if (result.success) {
        await invalidateJobCaches();
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const duplicate = async () => {
    setIsLoading(true);
    try {
      const result = await webJobDuplicate(jobId);
      if (result.success && result.jobId) {
        await invalidateJobCaches();
        return { success: true, jobId: result.jobId };
      }
      return { success: false, error: result.error };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    publish,
    unpublish,
    close,
    deleteJob,
    duplicate,
    isLoading,
  };
}
```

**Unit Tests (TDD RED):**
- Publish → calls action, invalidates cache
- Unpublish → calls action, invalidates cache
- Close → calls action, invalidates cache
- Delete (with apps) → returns error, does not delete
- Delete (no apps) → success, invalidates cache
- Duplicate → creates new job, invalidates cache
- Loading state → true during action, false after
- Error handling → catches errors

**Phase 3 Checklist:**
- [ ] Write unit tests for all 5 hooks (RED)
- [ ] Implement `use-job-detail`
- [ ] Implement `use-job-analytics`
- [ ] Implement `use-job-edit`
- [ ] Implement `use-change-tracking`
- [ ] Implement `use-job-actions`
- [ ] All unit tests PASS (GREEN)
- [ ] Coverage ≥ 90%

---

## Phase 4: View Mode Components (8-10 hours)

### 4.1 Component Tree

```
JobDetailPage (mode === 'view')
├── JobDetailHeader
│   ├── BackButton → /companies/[id]/dashboard/jobs
│   ├── JobTitle + StatusBadge
│   ├── EditButton → switch to edit mode
│   └── StatusActionButtons
│       ├── PublishButton (if draft/unpublished)
│       ├── UnpublishButton (if published)
│       ├── CloseButton
│       └── DuplicateButton
├── TabsContainer
│   └── OverviewTab (default)
│       ├── JobStatsCards
│       │   ├── ViewsCard
│       │   ├── ApplicationsCard
│       │   ├── ConversionCard
│       │   └── DaysLeftCard
│       ├── JobViewsChart (30-day line chart)
│       ├── RecentApplicationsList
│       │   ├── SectionHeader → Link to COMP-R08
│       │   └── ApplicationListItem × 5
│       └── JobPreviewCard (read-only)
└── JobDetailSkeleton (loading state)
```

### 4.2 Components to Create

#### Component 1: `JobDetailHeader.tsx`

**Location:** `src/app/jobsmarket/companies/[id]/dashboard/jobs/[jobId]/_components/JobDetailHeader.tsx`

**Props:**
```typescript
interface JobDetailHeaderProps {
  job: JobWithAnalytics;
  mode: PageMode;
  onEditClick: () => void;
  onActionClick: (action: string) => void;
}
```

**Features:**
- Back button with arrow
- Job title (h1)
- Status badge (colored)
- Edit button (pencil icon)
- Status action buttons (context-aware)

**Unit Tests:**
- Renders title and status
- Edit button shows in view mode
- Edit button hidden in edit mode
- Status actions match job status

---

#### Component 2: `StatusActionButtons.tsx`

**Location:** Same as above

**Props:**
```typescript
interface StatusActionButtonsProps {
  jobStatus: JobStatus;
  applicationCount: number;
  onAction: (action: string) => void;
  isLoading?: boolean;
}
```

**Logic:**
```typescript
const availableActions = STATUS_ACTIONS[jobStatus];

// Conditionally render:
if (availableActions.includes('publish')) → PublishButton
if (availableActions.includes('unpublish')) → UnpublishButton
if (availableActions.includes('close')) → CloseButton
if (availableActions.includes('delete')) → DeleteButton (disabled if applicationCount > 0)
if (availableActions.includes('duplicate')) → DuplicateButton
```

**Unit Tests:**
- Draft → shows Publish, Close, Delete, Duplicate
- Published → shows Unpublish, Close, Duplicate
- Closed → shows only Duplicate
- Delete disabled when apps > 0
- Buttons call onAction with correct action name

---

#### Component 3: `JobStatsCards.tsx`

**Location:** Same as above

**Props:**
```typescript
interface JobStatsCardsProps {
  analytics: JobAnalytics;
  job: JobWithAnalytics;
}
```

**Cards:**
1. **Views Card**: totalViews, viewsChange (% ↑/↓)
2. **Applications Card**: applicationCount, link to COMP-R08
3. **Conversion Card**: conversionRate (%)
4. **Days Left Card**: Days until expiry (postExpiryDate - now)

**Unit Tests:**
- Renders 4 cards
- Formats numbers correctly (1,234)
- Shows percentage change with color
- Days left calculation correct

---

#### Component 4: `JobViewsChart.tsx`

**Location:** Same as above

**Props:**
```typescript
interface JobViewsChartProps {
  dailyViews: DailyView[];
}
```

**Implementation:**
- Use `recharts` library (already in dependencies)
- Line chart with 30-day data
- X-axis: Date (format: "MMM DD")
- Y-axis: Views count
- Tooltip on hover

**Unit Tests:**
- Renders chart with data
- Empty state when no data
- Tooltip shows correct data

---

#### Component 5: `RecentApplicationsList.tsx`

**Location:** Same as above

**Props:**
```typescript
interface RecentApplicationsListProps {
  applications: ApplicationPreview[];
  jobId: string;
  companyId: string;
}
```

**Features:**
- Section header: "ใบสมัครล่าสุด"
- "ดูทั้งหมด" link → `/companies/[id]/dashboard/applications?jobId=[jobId]`
- List of 5 ApplicationListItem
- Empty state: "ยังไม่มีใบสมัคร"

**Unit Tests:**
- Renders list items
- "View All" link correct
- Empty state shows

---

#### Component 6: `ApplicationListItem.tsx`

**Location:** Same as above

**Props:**
```typescript
interface ApplicationListItemProps {
  application: ApplicationPreview;
}
```

**Features:**
- Avatar (candidate photo or fallback)
- Candidate name
- Applied date (relative: "2 วันที่แล้ว")
- Status badge
- Unread indicator (dot)

**Unit Tests:**
- Renders candidate info
- Shows unread indicator
- Status badge color correct

---

#### Component 7: `JobPreviewCard.tsx`

**Location:** Same as above

**Props:**
```typescript
interface JobPreviewCardProps {
  job: JobWithAnalytics;
}
```

**Features:**
- Read-only display of all job fields
- Sections: Basic Info, Details, Location
- Same styling as job posting view

**Unit Tests:**
- Renders all sections
- Displays all fields

---

#### Component 8: `JobDetailSkeleton.tsx`

**Location:** Same as above

**Features:**
- Skeleton for header
- Skeleton for stats cards (4 cards)
- Skeleton for chart area
- Skeleton for applications list

**Unit Tests:**
- Renders skeleton structure

---

### 4.3 E2E Tests for View Mode (TDD RED)

| Test File | Scenario | Steps |
|-----------|----------|-------|
| `job-detail.spec.ts` | View mode loads | Navigate → Page loads → No errors |
| | Stats display | Check 4 stat cards render |
| | Chart displays | Check chart renders with data |
| | Recent apps display | Check 5 applications show |
| | Empty applications | Job with 0 apps → Empty state |

**Phase 4 Checklist:**
- [ ] Write unit tests for all components (RED)
- [ ] Write E2E test for view mode (RED)
- [ ] Implement all 8 view components
- [ ] All unit tests PASS (GREEN)
- [ ] E2E test PASS (GREEN)
- [ ] Visual review in browser

---

## Phase 5: Edit Mode Components (8-10 hours)

### 5.1 Component Extraction from COMP-R06

**Source Files to Read:**
- `src/app/companies/[id]/dashboard/jobs/new/_components/Step1BasicForm.tsx`
- `src/app/companies/[id]/dashboard/jobs/new/_components/Step2DetailsForm.tsx` (if exists)
- `src/app/companies/[id]/dashboard/jobs/new/_components/Step3LocationForm.tsx` (if exists)

**Extraction Strategy:**
1. Read wizard step components
2. Identify field-rendering logic
3. Extract to new inline components
4. Remove wizard-specific code:
   - Remove step navigation (Next/Previous buttons)
   - Remove progress indicators
   - Remove step-based conditional rendering

---

### 5.2 Components to Create

#### Component 1: `JobEditForm.tsx`

**Location:** `src/app/jobsmarket/companies/[id]/dashboard/jobs/[jobId]/_components/JobEditForm.tsx`

**Props:**
```typescript
interface JobEditFormProps {
  job: JobWithAnalytics;
  onSave: (changes: Partial<JobFormData>) => Promise<void>;
  onCancel: () => void;
}
```

**Features:**
- Uses `useJobEdit` hook
- Renders 3 EditFormSection components
- Each section collapsible
- Save/Cancel buttons in sticky footer

**Sections:**
1. Basic Information (JobBasicFields)
2. Job Details (JobDetailsFields)
3. Work Location (JobLocationFields)

---

#### Component 2: `EditFormSection.tsx`

**Location:** Same as above

**Props:**
```typescript
interface EditFormSectionProps {
  title: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}
```

**Features:**
- Collapsible section with chevron
- Title with optional icon
- Smooth expand/collapse animation

---

#### Component 3: `JobBasicFields.tsx`

**Location:** Same as above

**Props:**
```typescript
interface JobBasicFieldsProps {
  data: JobFormData;
  onChange: (field: keyof JobFormData, value: any) => void;
  errors: Record<string, string>;
}
```

**Fields (extracted from COMP-R06 Step 1):**
- Title (text input)
- Job Function (select)
- Job Type (select)
- Job Level (select)
- Department (text input)
- Salary Range (min/max number inputs)
- Hide Salary (checkbox)
- Number of Positions (number input)

**Unit Tests:**
- Renders all fields
- onChange called when field changes
- Displays errors

---

#### Component 4: `JobDetailsFields.tsx`

**Location:** Same as above

**Props:** Same as JobBasicFields

**Fields (extracted from COMP-R06 Step 2):**
- Job Description (RichTextEditor - reuse from COMP-R06)
- Responsibilities (RichTextEditor)
- Requirements (RichTextEditor)
- Skills (SkillsTagInput - reuse from COMP-R06)
- Benefits (textarea)

**Unit Tests:**
- Renders all fields
- RichTextEditor integration works
- Skills tag input works

---

#### Component 5: `JobLocationFields.tsx`

**Location:** Same as above

**Props:** Same as JobBasicFields

**Fields (extracted from COMP-R06 Step 3):**
- Work Model (radio: onsite/hybrid/remote)
- Province (LocationSelect - reuse from COMP-R06)
- District (LocationSelect)
- BTS Station (select)
- Remote Percentage (slider, if hybrid)
- Full Address (textarea)

**Unit Tests:**
- Renders all fields
- Conditional rendering (province only if onsite/hybrid)
- Remote percentage only if hybrid

---

#### Component 6: `ChangesSidebar.tsx`

**Location:** Same as above

**Props:**
```typescript
interface ChangesSidebarProps {
  changedFields: Set<string>;
  formData: JobFormData;
  originalData: JobFormData;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}
```

**Features:**
- Fixed sidebar on right
- Shows count: "X รายการที่เปลี่ยนแปลง"
- List of changed fields with before/after preview
- Save button (primary)
- Cancel button (secondary)
- Last saved timestamp (from SaveIndicator)

**Unit Tests:**
- Shows changed field count
- Displays field changes
- Empty state when no changes
- Save/Cancel buttons work

---

### 5.3 E2E Tests for Edit Mode (TDD RED)

| Test File | Scenario | Steps |
|-----------|----------|-------|
| `job-edit.spec.ts` | Enter edit mode | Click Edit → Form loads with data |
| | Change fields | Edit title → Changes sidebar updates |
| | Save changes | Click Save → Toast success → View mode |
| | Cancel changes | Click Cancel → Discard modal → Confirm |
| | Cancel without changes | Click Cancel → Returns to view (no modal) |
| | Edit blocked for closed | Closed job → Edit button disabled |
| | Unsaved changes warning | Edit → Change field → Navigate away → Warning modal |

**Phase 5 Checklist:**
- [ ] Read COMP-R06 wizard components
- [ ] Write unit tests for edit components (RED)
- [ ] Write E2E tests for edit mode (RED)
- [ ] Extract and create JobBasicFields
- [ ] Extract and create JobDetailsFields
- [ ] Extract and create JobLocationFields
- [ ] Create EditFormSection
- [ ] Create JobEditForm
- [ ] Create ChangesSidebar
- [ ] Wire useNavigationGuard (reuse from COMP-R06)
- [ ] All tests PASS (GREEN)

---

## Phase 6: Modals & Status Actions (4-6 hours)

### 6.1 Modals to Create

#### Modal 1: `CloseJobModal.tsx`

**Location:** `src/app/jobsmarket/companies/[id]/dashboard/jobs/[jobId]/_components/CloseJobModal.tsx`

**Props:**
```typescript
interface CloseJobModalProps {
  isOpen: boolean;
  jobTitle: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}
```

**Content:**
- Title: "ปิดรับสมัครงาน?"
- Description: "งานนี้จะถูกซ่อนจากผู้สมัครและไม่สามารถเปิดใหม่ได้"
- Job title display
- Confirm button (destructive red)
- Cancel button (secondary)

**Unit Tests:**
- Renders when open
- Calls onConfirm when confirmed
- Calls onCancel when cancelled

---

#### Modal 2: `DeleteJobModal.tsx`

**Location:** Same as above

**Props:**
```typescript
interface DeleteJobModalProps {
  isOpen: boolean;
  jobTitle: string;
  hasApplications: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}
```

**Content:**
- Title: "ลบประกาศงาน?"
- Description: "การดำเนินการนี้ไม่สามารถยกเลิกได้"
- If hasApplications: Show error "ไม่สามารถลบงานที่มีใบสมัครได้"
- Confirm button (disabled if hasApplications)
- Cancel button

**Unit Tests:**
- Shows error when hasApplications
- Confirm disabled when hasApplications
- Calls onConfirm when confirmed

---

#### Modal 3: `DiscardChangesModal.tsx`

**Location:** Same as above

**Props:**
```typescript
interface DiscardChangesModalProps {
  isOpen: boolean;
  changedFieldsCount: number;
  onDiscard: () => void;
  onStay: () => void;
}
```

**Content:**
- Title: "ยกเลิกการเปลี่ยนแปลง?"
- Description: "การเปลี่ยนแปลง X รายการที่ยังไม่ได้บันทึกจะหายไป"
- Discard button (destructive red)
- Stay button (primary)

**Unit Tests:**
- Shows changed field count
- Calls onDiscard
- Calls onStay

---

### 6.2 Status Action Flow Integration

Wire `useJobActions` hook to modals:

```typescript
// In JobDetailPage
const { publish, unpublish, close, deleteJob, duplicate } = useJobActions(jobId, companyId);
const [actionModal, setActionModal] = useState<ActionModalState>(null);

const handleActionClick = (action: string) => {
  switch (action) {
    case 'publish':
      // Direct action (no modal)
      publish().then(result => {
        if (result.success) {
          toast.success('เผยแพร่งานสำเร็จ');
        }
      });
      break;

    case 'unpublish':
      // Show confirmation modal
      setActionModal({ type: 'unpublish', title: job.title });
      break;

    case 'close':
      setActionModal({ type: 'close', title: job.title });
      break;

    case 'delete':
      setActionModal({
        type: 'delete',
        title: job.title,
        hasApps: job.applicationCount > 0
      });
      break;

    case 'duplicate':
      duplicate().then(result => {
        if (result.success && result.jobId) {
          router.push(`/companies/${companyId}/dashboard/jobs/${result.jobId}?mode=edit`);
        }
      });
      break;
  }
};
```

---

### 6.3 E2E Tests for Status Actions (TDD RED)

| Test File | Scenario | Steps |
|-----------|----------|-------|
| `job-status-actions.spec.ts` | Publish draft | Click Publish → Toast success → Status = published |
| | Unpublish published | Click Unpublish → Modal → Confirm → Status = unpublished |
| | Close job | Click Close → Modal → Confirm → Status = closed |
| | Delete job (no apps) | Draft job → Click Delete → Modal → Confirm → Redirects to list |
| | Delete blocked (has apps) | Job with apps → Delete disabled or error shown |
| | Duplicate job | Any status → Click Duplicate → Redirects to new draft in edit mode |
| | Publish updates MeiliSearch | Publish → Verify searchable (mock/stub) |
| | Unpublish removes from search | Unpublish → Verify not searchable |
| | Close removes from search | Close → Verify not searchable |

**Phase 6 Checklist:**
- [ ] Write unit tests for modals (RED)
- [ ] Write E2E tests for actions (RED)
- [ ] Create CloseJobModal
- [ ] Create DeleteJobModal
- [ ] Create DiscardChangesModal
- [ ] Wire useJobActions to UI
- [ ] Wire modals to action handlers
- [ ] Add toast notifications
- [ ] All tests PASS (GREEN)

---

## Phase 7: Integration & Page Assembly (4-6 hours)

### 7.1 Page Entry Point

**File:** `src/app/jobsmarket/companies/[id]/dashboard/jobs/[jobId]/page.tsx`

**Implementation:**
```typescript
import { notFound, redirect } from 'next/navigation';
import { JobDetailClient } from './_components/JobDetailClient';
import { webJobGetById } from '@/lib/database/actions/jobs';
import { auth } from '@/lib/firebase/admin';

interface PageProps {
  params: {
    id: string;
    jobId: string;
  };
  searchParams: {
    mode?: 'view' | 'edit';
    tab?: string;
  };
}

export default async function JobDetailPage({ params, searchParams }: PageProps) {
  // 1. Auth check
  const user = await auth.currentUser;
  if (!user) {
    redirect('/auth/login');
  }

  // 2. Fetch job
  const job = await webJobGetById(params.jobId);
  if (!job) {
    notFound();
  }

  // 3. Access check (company owns job)
  if (job.companyId !== params.id) {
    return <div>Access Denied</div>; // Or 403 page
  }

  // 4. Render client component
  return (
    <JobDetailClient
      initialJob={job}
      companyId={params.id}
      initialMode={searchParams.mode || 'view'}
      initialTab={searchParams.tab || 'overview'}
    />
  );
}
```

---

### 7.2 Client Component Orchestrator

**File:** `src/app/jobsmarket/companies/[id]/dashboard/jobs/[jobId]/_components/JobDetailClient.tsx`

**Props:**
```typescript
'use client';

interface JobDetailClientProps {
  initialJob: JobWithAnalytics;
  companyId: string;
  initialMode: PageMode;
  initialTab: string;
}
```

**State Machine:**
```typescript
const [mode, setMode] = useState<PageMode>(initialMode);
const [activeTab, setActiveTab] = useState(initialTab);
const { job, mutate } = useJobDetail(initialJob.uid);
const { analytics } = useJobAnalytics(initialJob.uid);
const jobActions = useJobActions(initialJob.uid, companyId);

// View mode
if (mode === 'view') {
  return (
    <>
      <JobDetailHeader
        job={job}
        mode="view"
        onEditClick={() => setMode('edit')}
        onActionClick={handleActionClick}
      />
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
          <TabsTrigger value="applications">ใบสมัคร</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <JobStatsCards analytics={analytics} job={job} />
          <JobViewsChart dailyViews={analytics?.dailyViews || []} />
          <RecentApplicationsList applications={applications} />
          <JobPreviewCard job={job} />
        </TabsContent>
      </Tabs>
    </>
  );
}

// Edit mode
if (mode === 'edit') {
  return (
    <>
      <JobDetailHeader
        job={job}
        mode="edit"
        onEditClick={() => {}} // No edit button in edit mode
        onActionClick={() => {}}
      />
      <JobEditForm
        job={job}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </>
  );
}
```

---

### 7.3 Error Handling

**Error States to Handle:**
- Job not found → 404 page
- Access denied → 403 or message
- Fetch error → Retry button
- Save error → Toast + keep form open
- Action error → Toast + modal stays open
- Edit closed job → Redirect to view + toast

---

### 7.4 E2E Tests for Integration (TDD RED)

| Test File | Scenario | Steps |
|-----------|----------|-------|
| `job-edit-validation.spec.ts` | Required title | Clear title → Save → Error "กรุณาระบุชื่อตำแหน่ง" |
| | Required skills | Clear skills → Save → Error "กรุณาเลือกทักษะอย่างน้อย 1 รายการ" |
| | Invalid salary | maxSalary < minSalary → Error shown |
| | Required work location | onsite + no province → Error shown |
| `job-navigation-guard.spec.ts` | Browser back with changes | Edit → Change field → Press back → Warning |
| | Tab close with changes | Edit → Change field → Close tab → beforeunload warning |

---

**Phase 7 Checklist:**
- [ ] Create page.tsx (Server Component)
- [ ] Create JobDetailClient.tsx orchestrator
- [ ] Wire all view mode components
- [ ] Wire all edit mode components
- [ ] Wire all modals
- [ ] Add error boundaries
- [ ] Add loading states
- [ ] Write E2E tests for validation (RED)
- [ ] Write E2E tests for navigation guard (RED)
- [ ] All tests PASS (GREEN)
- [ ] Manual browser testing

---

## Phase 8: Quality Gates (2-3 hours)

### 8.1 Gate 1: Build Must Pass ⛔ STOP

```bash
npm run build
```

**Common Issues to Fix:**
- `"use server"` with sync functions → Add `async`
- Type errors → Fix TypeScript issues
- Missing imports → Add imports
- Server/Client component misuse → Add `"use client"` directive

**Checklist:**
- [ ] `npm run build` exits with code 0
- [ ] 0 TypeScript errors
- [ ] 0 build errors

---

### 8.2 Gate 2: Lint Must Pass ⛔ STOP

```bash
npm run lint
```

**Checklist:**
- [ ] `npm run lint` exits with code 0
- [ ] 0 ESLint errors
- [ ] Warnings OK (document if any)

---

### 8.3 Gate 3: Dev Server + Browser ⛔ STOP

```bash
npm run dev
```

**Manual Testing:**
1. Navigate to `/jobsmarket/companies/[id]/dashboard/jobs/[jobId]`
2. Verify page loads without errors
3. Check browser console (should be no red errors)
4. Test view mode: stats, chart, applications display
5. Test edit mode: form loads, fields editable
6. Test status actions: publish, unpublish, close
7. Test modals: open, confirm, cancel

**Checklist:**
- [ ] Dev server starts without errors
- [ ] Route loads in browser
- [ ] No console errors (red)
- [ ] View mode works
- [ ] Edit mode works
- [ ] Status actions work
- [ ] Modals work

---

### 8.4 Gate 4a: Unit Tests ⛔ STOP

```bash
npm run test:unit -- --coverage
```

**Coverage Target: ≥ 90%**

**Checklist:**
- [ ] All unit tests pass
- [ ] Coverage ≥ 90% for new code
- [ ] 0 failing tests
- [ ] Coverage report reviewed

**Coverage Breakdown:**
- Types/Utilities: 100%
- Hooks: ≥ 90%
- Components: ≥ 90%
- Actions (via integration): ≥ 90%

---

### 8.5 Gate 4b: Integration Tests ⛔ STOP

```bash
npx vitest run --config vitest.integration.config.ts
```

**Checklist:**
- [ ] All integration tests pass
- [ ] All server actions tested
- [ ] Database operations verified
- [ ] 0 failing tests

**Test Count: ~18 integration tests**

---

### 8.6 Gate 4c: E2E Tests ⛔ STOP

```bash
npx playwright test tests/e2e/jobsmarket/company/job-detail/ --project=chromium
```

**Checklist:**
- [ ] All E2E tests pass
- [ ] All RIS flows covered
- [ ] View mode tested
- [ ] Edit mode tested
- [ ] Status actions tested
- [ ] Validation tested
- [ ] Navigation guard tested
- [ ] 0 failing tests

**Test Count: ~27 E2E tests**

---

### 8.7 Quality Gates Summary

| Gate | Command | Requirement | Status |
|------|---------|-------------|--------|
| **1** | `npm run build` | 0 errors | [ ] |
| **2** | `npm run lint` | 0 errors | [ ] |
| **3** | `npm run dev` + browser | Route loads, no console errors | [ ] |
| **4a** | Unit tests + coverage | All pass, ≥ 90% | [ ] |
| **4b** | Integration tests | All pass | [ ] |
| **4c** | E2E tests | All pass, RIS flows covered | [ ] |

---

## Test Summary

### By Phase

| Phase | Unit | Integration | E2E | Total |
|-------|------|-------------|-----|-------|
| 1. Types | 3 | - | - | 3 |
| 2. Actions | - | 18 | - | 18 |
| 3. Hooks | 32 | - | - | 32 |
| 4. View | 14 | - | 5 | 19 |
| 5. Edit | 15 | - | 7 | 22 |
| 6. Modals | 9 | - | 9 | 18 |
| 7. Integration | - | - | 6 | 6 |
| **Total** | **73** | **18** | **27** | **118** |

### Updated Total: ~118 Tests

**Note:** Original estimate was ~76, but detailed planning revealed:
- More integration tests needed (18 vs 7)
- More unit tests for components (73 vs 42)
- This is GOOD - better test coverage = higher quality

---

## Build Order Summary

| Order | Phase | Depends On | Hours | Tests |
|-------|-------|------------|-------|-------|
| 1 | Types & Utilities | None | 2-3h | 3 |
| 2 | Server Actions | Types | 6-8h | 18 |
| 3 | Hooks | Server Actions | 6-8h | 32 |
| 4 | View Components | Hooks | 8-10h | 19 |
| 5 | Edit Components | Hooks + COMP-R06 | 8-10h | 22 |
| 6 | Modals | Hooks | 4-6h | 18 |
| 7 | Integration | All above | 4-6h | 6 |
| 8 | Quality Gates | All above | 2-3h | - |
| **Total** | | | **40-53h** | **118** |

---

## Definition of Done

### Functional Requirements
- [ ] View mode displays all job details and analytics
- [ ] Edit mode allows inline editing of all fields
- [ ] Change tracking highlights modified fields
- [ ] All status actions work correctly per status
- [ ] Analytics chart displays 30-day trend
- [ ] Recent applications preview shows last 5
- [ ] Navigation guard prevents data loss
- [ ] All modals function correctly
- [ ] MeiliSearch sync on publish/unpublish/close

### Quality Requirements
- [ ] Unit test coverage ≥ 90%
- [ ] All integration tests pass (18 tests)
- [ ] All E2E tests pass covering RIS flows (27 tests)
- [ ] Build passes with 0 errors
- [ ] Lint passes with 0 errors
- [ ] Dev server starts without errors
- [ ] Route loads in browser without console errors

### Performance Requirements
- [ ] Initial page load < 2s
- [ ] Analytics fetch < 1s
- [ ] Status actions complete < 500ms
- [ ] SWR cache invalidation works correctly

### Documentation
- [ ] All components have JSDoc comments
- [ ] Complex logic has inline comments
- [ ] Thai copy matches RIS Appendix C
- [ ] README updated if needed

---

## Known Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation | Status |
|------|--------|------------|------------|--------|
| Analytics query performance | High | Medium | Use indexed dedicated collection | ✅ SA approved |
| Change tracking complexity | Medium | Medium | Thorough unit tests, simple diff algorithm | Planned in Phase 3 |
| MeiliSearch sync issues | High | Low | Robust error handling, retry logic | Planned in Phase 2 |
| SWR cache invalidation | Medium | Medium | Clear invalidation strategy documented | Planned in Phase 3 |
| Test count underestimated | Low | Low | Updated estimate: 118 tests | ✅ Updated |
| COMP-R06 extraction issues | Low | Low | Audit code before Phase 5 | Planned |

---

## Next Steps

1. **SA/PM Review**: Review this implementation plan
2. **Approve Estimate**: Confirm 40-53 hour estimate (now 118 tests)
3. **Begin Phase 1**: Create types and utilities (TDD RED)
4. **Daily Progress**: Update checklist after each phase

---

**Implementation Plan Complete**
**Ready to Begin Phase 1: Types & Utilities**

---

*End of COMP-R07 Implementation Plan v1.0*
