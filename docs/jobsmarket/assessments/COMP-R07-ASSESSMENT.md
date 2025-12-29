# COMP-R07 Assessment: Job Detail/Edit Page

**Route:** `/companies/[id]/dashboard/jobs/[jobId]`
**Version:** 1.0
**Created:** 2025-12-22
**Status:** Pre-Implementation Assessment

---

## 1. Route Overview

### 1.1 Metadata
| Property | Value |
|----------|-------|
| Route Path | `/companies/[id]/dashboard/jobs/[jobId]` |
| Route ID | COMP-R07 |
| Shell | Company Shell |
| Purpose | View job performance, edit details, manage status |
| Complexity | High |
| Phase | 3 (Job Management) |

### 1.2 Route Parameters
| Parameter | Type | Source | Validation |
|-----------|------|--------|------------|
| `id` | `string` | URL path segment | Must be valid company ID |
| `jobId` | `string` | URL path segment | Must be valid job ID |

### 1.3 Query Parameters
| Parameter | Type | Default | Purpose |
|-----------|------|---------|---------|
| `mode` | `'view' \| 'edit'` | `'view'` | Page mode |
| `tab` | `string` | `'overview'` | Active tab in view mode |

### 1.4 Key Features
1. **View Mode**: Display job details, analytics, recent applications
2. **Edit Mode**: Inline editing of all job fields with change tracking
3. **Status Actions**: Publish, Unpublish, Close, Delete, Duplicate
4. **Analytics**: 30-day views chart, conversion rate, application count
5. **Recent Applications**: Last 5 applications preview

---

## 2. Reusable Code Audit

### 2.1 From COMP-R06 (Direct Reuse)

| File | Purpose | Reuse Type | Location |
|------|---------|------------|----------|
| `JobFormData` type | Form data structure | ✅ Direct | `src/types/jobsmarket/job-wizard.types.ts` |
| `useJobWizardForm` hook | Form state management | ⚠️ Adapt | `src/hooks/jobsmarket/jobs/use-job-wizard-form.ts` |
| `useAutoSave` hook | Auto-save debouncing | ✅ Direct | `src/hooks/jobsmarket/jobs/use-auto-save.ts` |
| `useNavigationGuard` hook | Unsaved changes warning | ✅ Direct | `src/hooks/jobsmarket/jobs/use-navigation-guard.ts` |
| `SaveIndicator` component | Auto-save status | ✅ Direct | `src/components/jobsmarket/jobs/indicators/SaveIndicator.tsx` |
| `RichTextEditor` component | Rich text fields | ✅ Direct | `src/components/jobsmarket/jobs/forms/RichTextEditor.tsx` |
| `LocationSelect` component | Location picker | ✅ Direct | `src/components/jobsmarket/jobs/forms/LocationSelect.tsx` |
| `SkillsTagInput` component | Skills input | ✅ Direct | `src/components/jobsmarket/jobs/forms/SkillsTagInput.tsx` |
| `job-form-validation.ts` | Validation logic | ✅ Direct | `src/lib/jobsmarket/company/job-form-validation.ts` |

### 2.2 From COMP-R06 (Adapt for Edit Mode)

| File | Changes Needed | Reason |
|------|----------------|--------|
| `useJobWizardForm` | Rename to `useJobEditForm`, remove wizard navigation, add change tracking | Edit mode doesn't use wizard steps |
| `Step1BasicForm` | Extract to `JobBasicFields` component | Reuse without wizard context |
| `Step2DetailsForm` | Extract to `JobDetailsFields` component | Reuse without wizard context |
| `Step3LocationForm` | Extract to `JobLocationFields` component | Reuse without wizard context |

### 2.3 Existing Server Actions (Reuse)

| Action | File | BLS Reference | Status |
|--------|------|---------------|--------|
| `webJobGetById` | `src/lib/database/actions/jobs.ts:16` | BLS-07-11 | ✅ Exists |
| `webJobUpdate` | `src/lib/database/actions/jobs.ts:56` | BLS-07-04 | ✅ Exists |
| `webJobPublish` | `src/lib/database/actions/jobs.ts:82` | BLS-07-05 | ✅ Exists |
| `webJobDelete` | `src/lib/database/actions/jobs.ts:69` | BLS-07-09 | ✅ Exists |

### 2.4 New Components Required

| Component | Purpose | Complexity |
|-----------|---------|------------|
| `JobDetailPage.tsx` | Page orchestrator (view/edit mode switcher) | Medium |
| `JobDetailHeader.tsx` | Title, status badge, action buttons | Low |
| `StatusActionButtons.tsx` | Context-aware status actions | Medium |
| `JobStatsCards.tsx` | 4 metric cards (views, apps, conversion, days left) | Low |
| `JobViewsChart.tsx` | 30-day line chart | Medium |
| `RecentApplicationsList.tsx` | Last 5 applications preview | Low |
| `ApplicationListItem.tsx` | Single application row | Low |
| `JobPreviewCard.tsx` | Read-only job preview | Low |
| `JobEditForm.tsx` | Edit mode container with all sections | Medium |
| `EditFormSection.tsx` | Collapsible section wrapper | Low |
| `ChangesSidebar.tsx` | Modified fields summary | Medium |
| `CloseJobModal.tsx` | Close confirmation | Low |
| `DeleteJobModal.tsx` | Delete confirmation | Low |
| `DiscardChangesModal.tsx` | Unsaved changes confirmation | Low |
| `JobDetailSkeleton.tsx` | Loading skeleton | Low |

**Total New Components: 15**

### 2.5 New Hooks Required

| Hook | Purpose | Complexity |
|------|---------|------------|
| `use-job-detail.ts` | Fetch job data with SWR | Low |
| `use-job-analytics.ts` | Fetch analytics data | Low |
| `use-job-edit.ts` | Edit mode form state | Medium |
| `use-change-tracking.ts` | Track changed fields | Medium |
| `use-job-actions.ts` | Status action handlers (publish/unpublish/close/delete/duplicate) | High |

**Total New Hooks: 5**

---

## 3. Server Actions

### 3.1 Existing Actions (Reuse)

| Action | Source | BLS | Purpose | Status |
|--------|--------|-----|---------|--------|
| `webJobGetById` | `jobs.ts:16` | BLS-07-11 | Fetch job detail | ✅ |
| `webJobUpdate` | `jobs.ts:56` | BLS-07-04 | Update job fields | ✅ |
| `webJobPublish` | `jobs.ts:82` | BLS-07-05 | Publish job | ✅ |
| `webJobDelete` | `jobs.ts:69` | BLS-07-09 | Delete job | ✅ |

### 3.2 New Actions Needed

| Action | Purpose | BLS | Estimated LOC |
|--------|---------|-----|---------------|
| `webJobUnpublish` | Unpublish job | BLS-07-07 | 30 |
| `webJobClose` | Close job | BLS-07-08 | 30 |
| `webJobDuplicate` | Duplicate job | BLS-07-10 | 50 |
| `fetchJobAnalytics` | Get 30-day analytics | BLS-07-11 | 80 |
| `fetchJobApplications` | Get recent 5 apps | BLS-07-11 | 40 |

**Total New Actions: 5 (~230 LOC)**

---

## 4. State Management

### 4.1 Atoms (Reuse from COMP-R00)

| Atom | Purpose | R/W |
|------|---------|-----|
| `userAtom` | User roles, companyId | R |
| `firebaseUserAtom` | Auth check | R |
| `companyAtom` | Company data | R |

### 4.2 New Hooks (SWR)

| Hook | Key Pattern | Data Shape | Refresh |
|------|-------------|------------|---------|
| `useJobDetail` | `job-${jobId}` | `JobWithAnalytics` | Standard |
| `useJobAnalytics` | `job-analytics-${jobId}` | `JobAnalytics` | 60s |
| `useJobApplications` | `job-applications-${jobId}` | `ApplicationPreview[]` | Standard |

### 4.3 Local Component State

| State | Type | Initial | Purpose |
|-------|------|---------|---------|
| `mode` | `'view' \| 'edit'` | From URL | Page mode |
| `activeTab` | `string` | `'overview'` | View mode tab |
| `editData` | `Partial<JobFormData>` | `{}` | Edit form state |
| `changedFields` | `Set<string>` | `new Set()` | Track modifications |
| `isDirty` | `boolean` | `false` | Unsaved changes |
| `actionModal` | `ActionModalState` | `null` | Active modal |

---

## 5. Test Plan

### 5.1 Unit Tests

| File | Test Cases | Count |
|------|------------|-------|
| `use-job-detail.test.ts` | Fetch success, error, not found | 3 |
| `use-job-analytics.test.ts` | Fetch success, empty data, error | 3 |
| `use-job-edit.test.ts` | Init form, update field, validate, reset, block closed jobs | 7 |
| `use-change-tracking.test.ts` | Track changes, revert, detect dirty | 5 |
| `use-job-actions.test.ts` | Publish, unpublish, close, delete (blocked with apps), duplicate | 11 |
| `StatusActionButtons.test.tsx` | Render correct buttons per status | 5 |
| `ChangesSidebar.test.tsx` | Display changes, empty state | 3 |
| `JobStatsCards.test.tsx` | Render metrics, format numbers | 3 |
| `JobViewsChart.test.tsx` | Render chart, empty data | 2 |

**Unit Tests Subtotal: ~42 tests**

### 5.2 Integration Tests

| File | Test Cases | Count |
|------|------------|-------|
| `job-detail-actions.test.ts` | Update job, publish, unpublish, close, delete | 5 |
| `job-analytics.test.ts` | Fetch analytics, calculate conversion | 2 |

**Integration Tests Subtotal: ~7 tests**

### 5.3 E2E Tests

| File | Test Cases | Count |
|------|------------|-------|
| `job-detail.spec.ts` | View mode loads, stats display, recent apps | 5 |
| `job-edit.spec.ts` | Enter edit, change fields, save, cancel, blocked for closed | 7 |
| `job-status-actions.spec.ts` | Publish, unpublish, close, delete (blocked with apps), duplicate | 9 |
| `job-edit-validation.spec.ts` | Required fields, invalid data | 4 |
| `job-navigation-guard.spec.ts` | Unsaved changes warning | 2 |

**E2E Tests Subtotal: ~27 tests**

### 5.4 Test Summary

| Type | Count | Coverage Target |
|------|-------|-----------------|
| Unit | ~42 | ≥ 90% |
| Integration | ~7 | All server actions |
| E2E | ~27 | All RIS flows |
| **Total** | **~76** | - |

---

## 6. Build Order (TDD Phases)

### Phase 1: Types and Utilities (TDD)
**Tests First:**
- [ ] Write unit tests for type validators
- [ ] Write unit tests for utility functions

**Implementation:**
- [ ] Define `JobWithAnalytics` type
- [ ] Define `JobAnalytics` type
- [ ] Define `ActionModalState` type
- [ ] Create utility functions for date formatting, number formatting

**Estimated: 2-3 hours**

---

### Phase 2: Server Actions (TDD)
**Tests First (Integration):**
- [ ] Write integration tests for `webJobUnpublish`
- [ ] Write integration tests for `webJobClose`
- [ ] Write integration tests for `webJobDuplicate`
- [ ] Write integration tests for `fetchJobAnalytics`
- [ ] Write integration tests for `fetchJobApplications`

**Implementation:**
- [ ] Implement `webJobUnpublish`
- [ ] Implement `webJobClose`
- [ ] Implement `webJobDuplicate`
- [ ] Implement `fetchJobAnalytics`
- [ ] Implement `fetchJobApplications`

**Estimated: 6-8 hours**

---

### Phase 3: Hooks (TDD)
**Tests First (Unit):**
- [ ] Write unit tests for `use-job-detail`
- [ ] Write unit tests for `use-job-analytics`
- [ ] Write unit tests for `use-job-edit`
- [ ] Write unit tests for `use-change-tracking`
- [ ] Write unit tests for `use-job-actions`

**Implementation:**
- [ ] Implement `use-job-detail`
- [ ] Implement `use-job-analytics`
- [ ] Implement `use-job-edit`
- [ ] Implement `use-change-tracking`
- [ ] Implement `use-job-actions`

**Estimated: 6-8 hours**

---

### Phase 4: View Mode Components (TDD)
**Tests First (Unit + E2E):**
- [ ] Write unit tests for `JobStatsCards`
- [ ] Write unit tests for `JobViewsChart`
- [ ] Write unit tests for `RecentApplicationsList`
- [ ] Write E2E test for view mode

**Implementation:**
- [ ] Implement `JobDetailHeader` (view mode)
- [ ] Implement `StatusActionButtons`
- [ ] Implement `JobStatsCards`
- [ ] Implement `JobViewsChart`
- [ ] Implement `RecentApplicationsList`
- [ ] Implement `ApplicationListItem`
- [ ] Implement `JobPreviewCard`

**Estimated: 8-10 hours**

---

### Phase 5: Edit Mode Components (TDD)
**Tests First (Unit + E2E):**
- [ ] Write unit tests for `ChangesSidebar`
- [ ] Write E2E test for edit mode
- [ ] Write E2E test for save/cancel

**Implementation:**
- [ ] Implement `JobEditForm`
- [ ] Implement `EditFormSection`
- [ ] Implement `ChangesSidebar`
- [ ] Adapt form components from COMP-R06
- [ ] Implement navigation guard

**Estimated: 8-10 hours**

---

### Phase 6: Status Actions & Modals (TDD)
**Tests First (E2E):**
- [ ] Write E2E tests for all status actions
- [ ] Write E2E tests for modals

**Implementation:**
- [ ] Implement `CloseJobModal`
- [ ] Implement `DeleteJobModal`
- [ ] Implement `DiscardChangesModal`
- [ ] Wire all status action handlers

**Estimated: 4-6 hours**

---

### Phase 7: Integration & Polish (TDD)
**Tests First (E2E):**
- [ ] Write E2E tests for validation
- [ ] Write E2E tests for error states

**Implementation:**
- [ ] Implement `JobDetailPage` orchestrator
- [ ] Implement `JobDetailSkeleton`
- [ ] Wire routing and query params
- [ ] Error handling
- [ ] Loading states

**Estimated: 4-6 hours**

---

### Phase 8: Quality Gates
- [ ] Gate 1: Build passes
- [ ] Gate 2: Lint passes
- [ ] Gate 3: Dev server + browser test
- [ ] Gate 4a: Unit tests ≥ 90% coverage
- [ ] Gate 4b: Integration tests pass
- [ ] Gate 4c: E2E tests pass

**Estimated: 2-3 hours**

---

## 7. Effort Estimate

### 7.1 Breakdown by Component Type

| Aspect | Count | Avg Hours | Total Hours |
|--------|-------|-----------|-------------|
| Types/Utilities | 4 types | 0.5h | 2-3h |
| Server Actions | 5 new | 1.5h | 6-8h |
| Hooks | 5 new | 1.5h | 6-8h |
| View Components | 7 new | 1.2h | 8-10h |
| Edit Components | 4 new | 2h | 8-10h |
| Modals | 3 new | 1.5h | 4-6h |
| Integration | 2 components | 2h | 4-6h |
| Tests | ~72 tests | - | (included above) |
| Quality Gates | - | - | 2-3h |

### 7.2 Total Estimate

| Category | Hours |
|----------|-------|
| **Development** | 38-50h |
| **Testing (included)** | - |
| **Documentation** | 2-3h |
| **Total** | **40-53 hours** |

### 7.3 Complexity Assessment

**Medium-High Complexity**
- Reuse: ~40% (form components, hooks, validation)
- New: ~60% (analytics, status actions, view/edit mode switching)
- Test Count: ~72 tests
- Estimated Duration: **5-7 working days** (8h/day)

---

## 8. SA Decisions (APPROVED)

**Decision Date:** 2025-12-22

### 8.1 Analytics Implementation ✅ APPROVED
**Question:** Should we use a dedicated `job_analytics` collection or calculate analytics on-the-fly from application data?

**Decision:** **Option A - Dedicated Collection**
- Pre-aggregated daily views in `job_analytics` collection
- Hourly background job to update analytics
- Indexed for fast reads on job detail page
- Trade-off: Slight data lag (up to 1 hour) for better performance

---

### 8.2 Edit Mode Approach ✅ APPROVED
**Question:** Should we reuse the wizard components or create inline edit components?

**Decision:** **Option B - Inline Components**
- Extract field components from COMP-R06 wizard steps
- Create: `JobBasicFields`, `JobDetailsFields`, `JobLocationFields`
- Remove wizard-specific logic (step navigation, progress indicators)
- Better UX: inline editing without wizard context

---

### 8.3 Status Action Permissions ✅ APPROVED
**Question:** Should all company roles be able to perform status actions (publish/close)?

**Decision:** **Option B - Admin + HR Manager + Recruiter**
- Per COMP-R00 Section 4.2 permission matrix
- Recruiters have `edit_jobs` permission
- All three roles can: publish, unpublish, close, duplicate
- Only Admin can: delete (with 0 applications constraint)

---

### 8.4 Duplicate Behavior ✅ APPROVED
**Question:** When duplicating a job, should we copy applications count/views?

**Decision:** **Option B - Reset Metrics**
- Copy: title, description, requirements, salary, skills, location
- Reset: uid, createdAt, jobStatus (→ 'draft'), dates, applicationCount, viewCount
- Rationale: Per BLS-07-10, duplicate creates new draft with fresh start

---

## 9. Risk Assessment

### 9.1 Technical Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Analytics query performance | High | Medium | Use dedicated collection with indexing |
| Change tracking complexity | Medium | Medium | Thorough unit tests, simple diff algorithm |
| MeiliSearch sync issues | High | Low | Robust error handling, retry logic |
| SWR cache invalidation | Medium | Medium | Clear invalidation strategy in docs |

### 9.2 Schedule Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Underestimated test count | Medium | Medium | Buffer 10% in estimate |
| Component reuse issues | Low | Low | Audit COMP-R06 code before Phase 4 |
| Integration complexity | Medium | Low | Phase 7 buffer time |

---

## 10. Dependencies

### 10.1 Blocked By
- None (COMP-R06 already implemented)

### 10.2 Blocks
- None (COMP-R07 is final job management route)

### 10.3 Related Work
- COMP-R05 (Jobs List): Navigates to COMP-R07
- BLS-02 (Discovery): Displays published jobs from COMP-R07

---

## 11. File Structure Preview

```
src/
├── app/
│   └── jobsmarket/
│       └── companies/
│           └── [id]/
│               └── dashboard/
│                   └── jobs/
│                       └── [jobId]/
│                           ├── page.tsx              # Route entry
│                           └── _components/
│                               ├── JobDetailPage.tsx
│                               ├── JobDetailHeader.tsx
│                               ├── StatusActionButtons.tsx
│                               ├── JobStatsCards.tsx
│                               ├── JobViewsChart.tsx
│                               ├── RecentApplicationsList.tsx
│                               ├── ApplicationListItem.tsx
│                               ├── JobPreviewCard.tsx
│                               ├── JobEditForm.tsx
│                               ├── EditFormSection.tsx
│                               ├── ChangesSidebar.tsx
│                               ├── CloseJobModal.tsx
│                               ├── DeleteJobModal.tsx
│                               ├── DiscardChangesModal.tsx
│                               └── JobDetailSkeleton.tsx
├── hooks/
│   └── jobsmarket/
│       └── jobs/
│           ├── use-job-detail.ts
│           ├── use-job-analytics.ts
│           ├── use-job-edit.ts
│           ├── use-change-tracking.ts
│           └── use-job-actions.ts
├── lib/
│   └── database/
│       └── actions/
│           └── jobs.ts                 # Add new actions here
└── types/
    └── jobsmarket/
        └── job-detail.types.ts         # New types

tests/
├── unit/
│   └── jobsmarket/
│       └── company/
│           └── job-detail/
│               ├── use-job-detail.test.ts
│               ├── use-job-analytics.test.ts
│               ├── use-job-edit.test.ts
│               ├── use-change-tracking.test.ts
│               ├── use-job-actions.test.ts
│               ├── StatusActionButtons.test.tsx
│               ├── ChangesSidebar.test.tsx
│               ├── JobStatsCards.test.tsx
│               └── JobViewsChart.test.tsx
├── integration/
│   └── jobsmarket/
│       └── company/
│           └── job-detail/
│               ├── job-detail-actions.test.ts
│               └── job-analytics.test.ts
└── e2e/
    └── jobsmarket/
        └── company/
            └── job-detail/
                ├── job-detail.spec.ts
                ├── job-edit.spec.ts
                ├── job-status-actions.spec.ts
                ├── job-edit-validation.spec.ts
                └── job-navigation-guard.spec.ts
```

---

## 12. Success Criteria

### 12.1 Functional Requirements
- [ ] View mode displays all job details and analytics
- [ ] Edit mode allows inline editing of all fields
- [ ] Change tracking highlights modified fields
- [ ] All status actions work correctly per status
- [ ] Analytics chart displays 30-day trend
- [ ] Recent applications preview shows last 5
- [ ] Navigation guard prevents data loss
- [ ] All modals function correctly

### 12.2 Quality Requirements
- [ ] Unit test coverage ≥ 90%
- [ ] All integration tests pass
- [ ] All E2E tests pass covering RIS flows
- [ ] Build passes with 0 errors
- [ ] Lint passes with 0 errors
- [ ] Dev server starts without errors
- [ ] Route loads in browser without console errors

### 12.3 Performance Requirements
- [ ] Initial page load < 2s
- [ ] Analytics fetch < 1s
- [ ] Status actions complete < 500ms
- [ ] SWR cache invalidation works correctly

---

## 13. Next Steps

1. **SA Review**: Review this assessment and answer open questions
2. **Approve Estimate**: Confirm 40-53 hour estimate and 5-7 day timeline
3. **Create Implementation Plan**: Detailed phase-by-phase plan with tasks
4. **Begin Phase 1**: Types and utilities (TDD RED phase)

---

**Assessment Complete**
**Ready for PM/SA Review**
