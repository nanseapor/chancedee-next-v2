# COMP-R08 Assessment: Company Applications Management

**Date:** 2025-12-27
**Route:** `/companies/[id]/dashboard/applications`
**Assessed By:** Claude Code
**Complexity:** High (three-panel layout, real-time updates, chat integration)

---

## 1. Route Overview

### Route Metadata
| Property | Value |
|----------|-------|
| Route Path | `/companies/[id]/dashboard/applications` |
| Shell | Company Shell (full sidebar + chat + notifications) |
| Primary Feature | JOB-019: View Company Applications |
| Related Features | JOB-016 (Accept), JOB-017 (Reject), JOB-018 (Mark Read), JOB-020 (Search) |
| Business Logic | BLS-04 Screening Stage (7 actions) |
| RIS Document | COMP-R08_applications_RIS.md |

### Complexity Assessment
- **Layout Complexity**: High (responsive three-panel layout)
- **State Management**: High (URL params, SWR cache, local filters, action states)
- **Data Fetching**: Medium (batch fetching, joins with candidate/job data)
- **Real-time Updates**: Medium (chat integration, notification triggers)
- **User Interactions**: High (filters, accept/reject flows, chat drawer)

### Dependencies
| Dependency Type | Items |
|----------------|-------|
| Previous Routes | COMP-R00 (shell), COMP-R04 (dashboard patterns), COMP-R07 (job detail patterns) |
| Server Actions | Accept, Reject, Read, GetByCompany (4 NEW actions needed) |
| Shared Components | Company Shell, Filter Panel, Status Badges, Chat Drawer |
| External Services | Chat system, notification system, email service |

---

## 2. Server Actions Audit

### Required Server Actions (from BLS-04)

| Action | Exists? | Location | Status | Changes Needed |
|--------|---------|----------|--------|----------------|
| **AcceptApplication** | ❌ NO | - | **MISSING** | Must create entire action |
| **rejectApplication** | ❌ NO | - | **MISSING** | Must create entire action |
| **readApplication** | ❌ NO | - | **MISSING** | Must create entire action |
| **JobApplicationGetByCompany** | ❌ NO | - | **MISSING** | Must create entire action |

### Existing Relevant Actions

| Action | Location | Use Case |
|--------|----------|----------|
| `webJobApplicationGetById` | `src/lib/database/actions/job-applications.ts:35` | Detail panel data |
| `webJobApplicationGetByFilter` | `src/lib/database/actions/job-applications.ts:64` | Base for GetByCompany |
| `webJobApplicationGetByCandidate` | `src/lib/database/actions/job-applications.ts:146` | Reference pattern for joins |
| `webJobGetById` | `src/lib/database/actions/jobs.ts:22` | Job filter dropdown |
| `webCompanyInformationGetById` | Referenced in layout | Company context |

### Action Implementation Plan

#### 1. AcceptApplication (BLS-04-05)
**Priority:** P0 (Core feature)

**Signature:**
```typescript
async function AcceptApplication(input: {
  companyId: string;
  candidateId: string;
  hrId: string;
  jobId: string;
  applicationId: string;
  name: string;
  jobTitle: string;
  companyName: string;
}): Promise<{ status: 200; message: string; chatId: string }>;
```

**Side Effects:**
1. Update `job_applications.status` = 'accepted'
2. Set `job_applications.hrId` = current user
3. Create chat room (MD5 hash ID)
4. Update `job_applications.chatId`
5. Send email notification to candidate
6. Create push notification
7. Check first application reward (coins)

**Complexity:** High (7 side effects, transaction required)

---

#### 2. rejectApplication (BLS-04-06)
**Priority:** P0 (Core feature)

**Signature:**
```typescript
async function rejectApplication(input: {
  applicationId: string;
  payload: JobApplicationData;
  rejectedMessage: string;
  actorId: string;
}): Promise<{ success: boolean }>;
```

**Side Effects:**
1. Update `job_applications.status` = 'rejected'
2. Set `job_applications.rejectFeedback` = message
3. Set `job_applications.hrId` = actor
4. Send rejection email with feedback
5. Create push notification

**Complexity:** Medium (5 side effects)

---

#### 3. readApplication (BLS-04-04)
**Priority:** P0 (Auto-triggered)

**Signature:**
```typescript
async function readApplication(input: {
  applicationId: string;
}): Promise<{ success: boolean }>;
```

**Side Effects:**
1. Update `job_applications.status` from 'applied' to 'read'
2. Update `updatedAt` timestamp

**Complexity:** Low (silent background action)

**Note:** Should be idempotent (no error if already read)

---

#### 4. JobApplicationGetByCompany (BLS-04-01)
**Priority:** P0 (List data source)

**Signature:**
```typescript
async function JobApplicationGetByCompany(input: {
  companyId: string;
  status?: ApplicationStatus;
  jobId?: string;
}): Promise<ApplicationListItem[]>;
```

**Returns:**
```typescript
interface ApplicationListItem {
  uid: string;
  jobId: string;
  candidateId: string;
  companyId: string;
  hrId: string | null;
  status: ApplicationStatus;
  expectedSalary: number | null;
  isNegotiable: boolean;
  overheadDays: number;
  headlines: string;
  createdAt: number;
  updatedAt: number;
  rejectFeedback?: string;
  chatId?: string;

  // Denormalized candidate info
  candidateName: string;
  candidatePhoto: string | null;
  candidateHeadline: string | null;

  // Denormalized job info
  jobTitle: string;

  // Computed fields
  matchScore: number | null;
  isUnread: boolean;
}
```

**Implementation Pattern:** Follow `webJobApplicationGetByCandidate` pattern
- Use batch fetching to avoid N+1 queries
- Join candidate_information for profile data
- Join jobs for job titles
- Sort by updatedAt descending

**Complexity:** High (batch fetching, multiple joins)

---

## 3. Reusable Components

### From Company Shell (Available)

| Component | Source | Reuse Level | Notes |
|-----------|--------|-------------|-------|
| Company Shell | `layout.tsx` | Full | Already implemented |
| Sidebar Navigation | `CompanyLayoutClient` | Full | Applications nav item exists |
| Chat FAB | Shell | Full | Will integrate with accept flow |
| Notification Bell | Shell | Full | Will show new application alerts |
| Loading Skeleton | Pending page | Adaptable | Create applications-specific version |

### From COMP-R04 (Dashboard)

| Component | Source | Reuse Level | Notes |
|-----------|--------|-------------|-------|
| StatCard | `dashboard/_components/StatCard.tsx` | Full | For application counts |
| DashboardMetrics | Reference | Pattern | Similar metrics layout |

### From COMP-R05/R07 (Jobs List/Detail)

| Component | Source | Reuse Level | Notes |
|-----------|--------|-------------|-------|
| Status Badges | Job list | Adaptable | Map to application statuses |
| Filter patterns | Job list | Pattern | Similar filter panel approach |
| Loading states | Job detail | Full | Skeleton patterns |

### From Shared UI Components

| Component | Path | Use Case |
|-----------|------|----------|
| Badge | `@/components/ui/badge` | Match score, status indicators |
| Button | `@/components/ui/button` | Accept, Reject actions |
| Tabs | `@/components/ui/tabs` | Status filtering tabs |
| Dialog | `@/components/ui/dialog` | Reject confirmation modal |
| Sheet | `@/components/ui/sheet` | Chat drawer |
| Skeleton | `@/components/ui/skeleton` | Loading states |
| Avatar | `@/components/ui/avatar` | Candidate photos |
| Textarea | `@/components/ui/textarea` | Reject feedback |

---

## 4. New Components Required

### Component Breakdown

| Component | File Path | Responsibility | Est. Tests |
|-----------|-----------|----------------|------------|
| **ApplicationsPage** | `page.tsx` | Server component, fetch data | 5 |
| **ApplicationsClient** | `_components/ApplicationsClient.tsx` | Three-panel orchestration | 15 |
| **FilterPanel** | `_components/FilterPanel.tsx` | Job, status, date, score filters | 20 |
| **ApplicationList** | `_components/ApplicationList.tsx` | Scrollable list with cards | 15 |
| **ApplicationCard** | `_components/ApplicationCard.tsx` | Single application preview | 15 |
| **DetailPanel** | `_components/DetailPanel.tsx` | Full candidate profile display | 20 |
| **CandidateHeader** | `_components/CandidateHeader.tsx` | Photo, name, contact, match score | 10 |
| **MatchScoreBreakdown** | `_components/MatchScoreBreakdown.tsx` | Score visualization | 10 |
| **ProfileSections** | `_components/ProfileSections.tsx` | Experience, education, skills | 15 |
| **ResumeViewer** | `_components/ResumeViewer.tsx` | PDF preview/download | 10 |
| **ActionBar** | `_components/ActionBar.tsx` | Accept, Reject, Schedule buttons | 15 |
| **RejectModal** | `_components/RejectModal.tsx` | Feedback textarea + confirm | 15 |
| **AcceptFlow** | `_components/AcceptFlow.tsx` | Accept logic + chat integration | 15 |
| **FilterState** | `_components/types.ts` | TypeScript types | - |
| **ApplicationsSkeleton** | `_components/ApplicationsSkeleton.tsx` | Three-panel skeleton | 5 |
| **EmptyState** | `_components/EmptyState.tsx` | No applications, no jobs states | 10 |

**Total Components:** 16
**Estimated Total Tests:** 195

---

## 5. Test Plan

### 5.1 Unit Tests

| Test File | Component/Function | Test Cases | Count |
|-----------|-------------------|------------|-------|
| `FilterPanel.test.tsx` | Filter interactions | Job dropdown, status checkboxes, date picker, score slider, apply/clear | 20 |
| `ApplicationCard.test.tsx` | Card rendering | Props display, unread badge, match score colors, click handler | 15 |
| `ApplicationList.test.tsx` | List rendering | Empty state, loading, sorted items, scroll behavior | 15 |
| `DetailPanel.test.tsx` | Detail display | Loading, error, sections, action visibility | 20 |
| `MatchScoreBreakdown.test.tsx` | Score visualization | Total score, breakdown bars, colors, null handling | 10 |
| `ActionBar.test.tsx` | Button visibility | Status-based visibility, permission checks, loading states | 15 |
| `RejectModal.test.tsx` | Modal interactions | Open/close, feedback input, validation, submit | 15 |
| `AcceptFlow.test.tsx` | Accept logic | Success flow, error handling, chat drawer trigger | 15 |
| `filter-utils.test.ts` | Filter logic | Apply filters, sort, edge cases | 15 |
| `application-utils.test.ts` | Utilities | Status colors, withdrawable check, date formatting | 10 |

**Total Unit Tests:** 150
**Target Coverage:** ≥ 90%

---

### 5.2 Integration Tests

| Test File | Scenario | Test Cases | Count |
|-----------|----------|------------|-------|
| `applications-data-flow.test.ts` | SWR data fetching | Fetch list, cache hit, revalidation, error handling | 10 |
| `accept-application.test.ts` | Accept flow end-to-end | Accept → chat creation → cache invalidation → email sent | 15 |
| `reject-application.test.ts` | Reject flow end-to-end | Reject → status update → email sent → feedback stored | 10 |
| `filter-applications.test.ts` | Client-side filtering | All filter combinations, URL sync, count updates | 15 |
| `mark-read-integration.test.ts` | Auto-read on select | Select unread → mark read → badge removal | 10 |

**Total Integration Tests:** 60

---

### 5.3 E2E Tests

| Test File | User Flow (from RIS) | Test Cases | Count |
|-----------|---------------------|------------|-------|
| `applications.spec.ts` | COMP-R08 Happy Paths | Load page → filter → select → view detail | 10 |
| `accept-application.spec.ts` | JOB-016: Accept Application | Accept → chat drawer opens → send message | 10 |
| `reject-application.spec.ts` | JOB-017: Reject Application | Reject → feedback modal → confirm → toast | 10 |
| `filter-applications.spec.ts` | JOB-020: Search Applications | Apply filters → view results → clear filters | 10 |
| `applications-invalid-inputs.spec.ts` | Edge cases | Invalid application ID, concurrent updates, permission errors | 10 |
| `applications-mobile.spec.ts` | Mobile responsive | Mobile list → detail overlay → swipe actions (if implemented) | 10 |

**Total E2E Tests:** 60
**Target Pass Rate:** > 80%

---

## 6. State Management

### 6.1 URL Query Parameters

| Parameter | Type | Purpose | Default | Sync |
|-----------|------|---------|---------|------|
| `job` | `string \| null` | Filter by job ID | `null` (all) | Bidirectional |
| `status` | `string` | Filter by status | `all` | Bidirectional |
| `sort` | `'newest' \| 'score'` | Sort order | `newest` | Bidirectional |
| `selected` | `string \| null` | Selected application ID | First in list | Bidirectional |

**Implementation:** Use `useSearchParams` + `useRouter` for updates

---

### 6.2 SWR Cache Keys

| Key Pattern | Data | TTL | Invalidate On |
|-------------|------|-----|---------------|
| `company-applications-${companyId}` | Application list | 30s | Accept, Reject, New app |
| `application-detail-${appId}` | Single application | 5min | Accept, Reject, Note add |
| `candidate-${candidateId}` | Candidate profile | 5min | Candidate update |
| `company-jobs-${companyId}` | Job dropdown | Static | Job create/update |
| `chat-${chatId}` | Chat room | 10s | Message sent |

**Config:**
```typescript
const defaultSWRConfig = {
  revalidateOnFocus: false,
  dedupingInterval: 30000,
};

const staticSWRConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 300000, // 5 min
};
```

---

### 6.3 Local Component State

| State | Type | Initial | Purpose |
|-------|------|---------|---------|
| `selectedAppId` | `string \| null` | First in list | Detail panel content |
| `filterState` | `FilterState` | Default | Applied filters |
| `showRejectModal` | `boolean` | `false` | Reject modal visibility |
| `rejectFeedback` | `string` | `''` | Reject message |
| `isAccepting` | `boolean` | `false` | Accept action state |
| `isRejecting` | `boolean` | `false` | Reject action state |
| `actionError` | `string \| null` | `null` | Error message |

**FilterState interface:**
```typescript
interface FilterState {
  jobId: string | null;
  statuses: ApplicationStatus[];
  dateFrom: Date | null;
  dateTo: Date | null;
  minScore: number;
  maxScore: number;
}
```

---

### 6.4 Atoms (if needed)

**Assessment:** Likely NOT needed for this route.

- Filter state: Local to page (not shared)
- Selected application: URL query param (shareable)
- Chat drawer: Existing atom in shell
- Company data: Already in `companyAtom` via shell

**Decision:** Use local state + URL params. No new atoms required.

---

## 7. Build Order

### Phase 1: Foundation (Days 1-2)
**Goal:** Types, schemas, and server actions

1. ✅ Create TypeScript types (`FilterState`, `ApplicationListItem`, `ApplicationDetail`)
2. ✅ Implement `JobApplicationGetByCompany` action
3. ✅ Implement `readApplication` action
4. ✅ Implement `AcceptApplication` action
5. ✅ Implement `rejectApplication` action
6. ✅ Unit test all server actions (≥90% coverage)
7. ✅ Integration test server actions

**Deliverable:** All server actions tested and working

---

### Phase 2: Core UI - Three-Panel Layout (Days 3-4)
**Goal:** Basic three-panel layout with mock data

8. ✅ Create `ApplicationsPage` (server component)
9. ✅ Create `ApplicationsClient` (client orchestrator)
10. ✅ Create `FilterPanel` with all filter controls
11. ✅ Create `ApplicationList` with scrolling
12. ✅ Create `ApplicationCard` component
13. ✅ Create `DetailPanel` skeleton
14. ✅ Create `ApplicationsSkeleton` loading state
15. ✅ Unit test all components (≥90% coverage)

**Deliverable:** Three-panel layout renders with filters functional

---

### Phase 3: Detail Panel & Data Flow (Days 5-6)
**Goal:** Populate detail panel, wire up SWR

16. ✅ Implement SWR hooks for data fetching
17. ✅ Complete `DetailPanel` with all sections:
    - `CandidateHeader`
    - `MatchScoreBreakdown`
    - `ProfileSections` (experience, education, skills)
    - `ResumeViewer`
18. ✅ Wire up `ApplicationList` ↔ `DetailPanel` selection
19. ✅ Implement mark-as-read auto-trigger
20. ✅ Integration test data flow

**Deliverable:** Full detail panel with real data

---

### Phase 4: Actions & Chat Integration (Days 7-8)
**Goal:** Accept/Reject flows working

21. ✅ Create `ActionBar` component
22. ✅ Create `RejectModal` with feedback
23. ✅ Implement `AcceptFlow` logic
24. ✅ Integrate chat drawer (use existing shell drawer)
25. ✅ Handle optimistic updates
26. ✅ Error handling and toast notifications
27. ✅ Integration test accept flow
28. ✅ Integration test reject flow

**Deliverable:** Accept/Reject actions working, chat drawer opens

---

### Phase 5: Filtering & URL Sync (Day 9)
**Goal:** Filters apply and sync with URL

29. ✅ Implement client-side filter logic
30. ✅ Implement sort logic (newest, score)
31. ✅ Wire up URL query params sync
32. ✅ Update tab counts dynamically
33. ✅ Empty states (no results, no jobs)
34. ✅ Unit test filter utils
35. ✅ Integration test filtering

**Deliverable:** Filters fully functional with URL deep linking

---

### Phase 6: Mobile & Responsive (Day 10)
**Goal:** Mobile-friendly layout

36. ✅ Implement mobile list view (single column)
37. ✅ Implement mobile detail overlay (full-screen)
38. ✅ Implement mobile filter sheet (bottom drawer)
39. ✅ Optional: Swipe gestures for quick actions
40. ✅ Test responsive breakpoints (sm, md, lg, xl)

**Deliverable:** Mobile-responsive UI

---

### Phase 7: E2E Tests & Polish (Days 11-12)
**Goal:** E2E tests passing, polish UI

41. ✅ Write E2E test: Load page → filter → select
42. ✅ Write E2E test: Accept flow
43. ✅ Write E2E test: Reject flow
44. ✅ Write E2E test: Invalid inputs
45. ✅ Write E2E test: Mobile responsive
46. ✅ Polish: animations, transitions, micro-interactions
47. ✅ Polish: accessibility (keyboard nav, screen reader)
48. ✅ Polish: error boundaries

**Deliverable:** E2E tests >80% pass rate, polished UI

---

### Phase 8: Quality Gates & PR (Day 13)
**Goal:** All gates pass, PR ready

49. ✅ Gate 1: `npm run build` → 0 errors
50. ✅ Gate 2: `npm run lint` → 0 errors
51. ✅ Gate 3: `npm run dev` → route loads without errors
52. ✅ Gate 4a: Unit tests → ≥90% coverage
53. ✅ Gate 4b: Integration tests → all pass
54. ✅ Gate 4c: E2E tests → >80% pass rate
55. ✅ Create PR with conventional commit
56. ✅ Fill completion checklist

**Deliverable:** PR ready for review

---

## 8. State Machine Verification

### Page State Machine (from RIS §5.1)

| State | Test Assertion | Component |
|-------|----------------|-----------|
| `loading` | Skeleton visible, data undefined | ApplicationsSkeleton |
| `ready` | Three-panel layout visible | ApplicationsClient |
| `list_view` | Applications rendered, detail panel populated | ApplicationList + DetailPanel |
| `detail` | Specific application selected, detail shows | DetailPanel |
| `filtered` | Filtered list shown, count badge updated | FilterPanel + ApplicationList |
| `empty_apps` | Empty state: "ยังไม่มีใบสมัคร" | EmptyState |
| `empty_jobs` | Empty state: "กรุณาสร้างประกาศงาน" | EmptyState |
| `error` | Error message + retry button | ErrorState |
| `redirect` | Navigate to pending page if company not approved | Page guard |

---

### Action State Machine (from RIS §5.3)

| State | Test Assertion | Component |
|-------|----------------|-----------|
| `idle` | Action buttons enabled, no loading | ActionBar |
| `accepting` | Accept button shows spinner, disabled | AcceptFlow |
| `chat_drawer` | Chat drawer slides in from right | ChatDrawer (shell) |
| `reject_modal` | Reject modal visible | RejectModal |
| `rejecting` | Reject confirm button shows spinner | RejectModal |
| `marking_read` | Silent, unread badge removed | ApplicationCard |

---

## 9. Open Questions for SA Review

### Question 1: Match Score Calculation
**Issue:** RIS mentions match score (0-100), but it's unclear:
- Is this calculated server-side or client-side?
- What's the algorithm? (Skills match + experience + education + salary)
- Should it be pre-computed and stored?

**Recommendation:** For Phase 1, use placeholder scores (random or null). Implement AI matching in Phase 2.

---

### Question 2: Internal Notes Feature
**Issue:** RIS mentions "Internal Notes" (P1), but unclear if it's in scope for COMP-R08 or separate feature.

**Recommendation:** Defer to Phase 2. Focus on P0 features (accept/reject) for initial implementation.

---

### Question 3: Bulk Actions
**Issue:** RIS mentions "Bulk Actions" (P1) for selecting multiple applications.

**Recommendation:** Defer to Phase 2. Single-action flow is sufficient for MVP.

---

### Question 4: Real-time Updates
**Issue:** How should the page handle new applications arriving while HR is viewing?
- Poll every 30s?
- WebSocket?
- FCM push notification → manual refresh?

**Recommendation:** Use SWR auto-revalidation (30s interval) for Phase 1. Add real-time in Phase 2.

---

### Question 5: Resume Quick View
**Issue:** PDF preview inline vs download-only?

**Recommendation:** Phase 1 → Download link only. Phase 2 → Inline PDF viewer (use `react-pdf` or `pdfjs`).

---

## 10. Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| **Chat integration complexity** | High | Medium | Test chat drawer separately; ensure `chatId` returned from accept action |
| **Three-panel layout mobile** | Medium | High | Use responsive design patterns from COMP-R07; test early on mobile |
| **Batch fetching N+1 queries** | High | Medium | Follow `webJobApplicationGetByCandidate` pattern; use `Promise.all` |
| **AcceptApplication side effects** | High | Medium | Use Firestore transactions; test rollback scenarios |
| **Filter performance (1000+ apps)** | Medium | Low | Client-side filtering OK for <100 apps; add pagination if needed |
| **Match score missing** | Low | High | Show "N/A" if null; defer calculation to Phase 2 |
| **Concurrent HR actions** | Medium | Low | Use optimistic updates + conflict detection toast |
| **Permission checks missing** | High | Low | Use COMP-R00 role matrix; test with all roles |

---

## 11. Estimated Effort

| Phase | Description | Duration | Cumulative |
|-------|-------------|----------|------------|
| Phase 1 | Foundation (types + server actions) | 2 days | 2 days |
| Phase 2 | Core UI (three-panel layout) | 2 days | 4 days |
| Phase 3 | Detail panel & data flow | 2 days | 6 days |
| Phase 4 | Actions & chat integration | 2 days | 8 days |
| Phase 5 | Filtering & URL sync | 1 day | 9 days |
| Phase 6 | Mobile & responsive | 1 day | 10 days |
| Phase 7 | E2E tests & polish | 2 days | 12 days |
| Phase 8 | Quality gates & PR | 1 day | 13 days |

**Total Estimated Effort:** 13 days

**Confidence Level:** Medium-High
- Three-panel layout is complex but doable
- Server actions follow established patterns
- Chat integration is well-defined in RIS

---

## 12. Known Patterns from Previous Routes

### Object Memoization (from COMP-R07)
**Issue:** Passing objects to hooks causes infinite re-renders

**Solution:**
```typescript
const filterStateStr = JSON.stringify(filterState);
const filteredApplications = useMemo(
  () => filterApplications(applications, filterState, sortBy),
  [applications, filterStateStr, sortBy]
);
```

---

### SWR Error Boundaries (from COMP-R04)
**Issue:** SWR errors not caught by React error boundaries

**Solution:**
```typescript
const { data, error, isLoading } = useSWR(key, fetcher, {
  onError: (err) => {
    console.error('SWR error:', err);
    toast.error('ไม่สามารถโหลดข้อมูลได้');
  },
});

if (error) return <ErrorState onRetry={() => mutate(key)} />;
```

---

### Optimistic Updates (from COMP-R05)
**Issue:** Slow server actions feel unresponsive

**Solution:**
```typescript
const handleAccept = async (appId: string) => {
  // Optimistic update
  mutate(
    swrKeys.applications(companyId),
    (apps) => apps?.map(app =>
      app.uid === appId ? { ...app, status: 'accepted' } : app
    ),
    false // don't revalidate yet
  );

  try {
    await acceptApplication(appId);
    mutate(swrKeys.applications(companyId)); // revalidate on success
  } catch {
    mutate(swrKeys.applications(companyId)); // revert on error
  }
};
```

---

### Tab State in URL (from COMP-R07)
**Issue:** Tab state lost on refresh

**Solution:** Use query params `?status=applied` and sync bidirectionally

---

## 13. Accessibility Checklist

- [ ] Keyboard navigation: Tab through panels, Arrow keys in list
- [ ] Focus management: On select application, focus detail panel
- [ ] Screen reader: Announce application count, status changes
- [ ] ARIA roles: `role="tablist"` for status filters, `role="tab"` for each tab
- [ ] ARIA labels: `aria-label="Accept application from John Doe"`
- [ ] Color contrast: All text meets WCAG AA (4.5:1)
- [ ] Focus visible: Blue outline on all interactive elements
- [ ] Skip links: "Skip to application list"

---

## 14. Completion Criteria

### Must Have (Phase 1)
- ✅ Three-panel layout functional (desktop)
- ✅ Filter panel with all controls
- ✅ Application list with cards
- ✅ Detail panel with candidate info
- ✅ Accept flow → chat drawer opens
- ✅ Reject flow with feedback modal
- ✅ Mark-as-read auto-trigger
- ✅ All quality gates pass
- ✅ Unit tests ≥90% coverage
- ✅ Integration tests pass
- ✅ E2E tests >80% pass rate

### Should Have (Phase 2)
- Match score breakdown visualization
- Resume inline PDF viewer
- Real-time updates (WebSocket or polling)
- Mobile swipe gestures
- Internal notes feature

### Could Have (Phase 3)
- Bulk actions (select multiple)
- Advanced filters (date range, score range)
- Export applications to CSV
- Application analytics

---

## 15. Next Steps

1. **SA Approval Required**
   - Review this assessment
   - Clarify open questions (§9)
   - Approve implementation plan

2. **Phase 1: Write Tests (RED)**
   - Create test files per §5
   - All tests should FAIL (components don't exist yet)
   - Verify Gates 1-2 pass (build + lint)

3. **Phase 2-8: Implementation (GREEN)**
   - Follow build order (§7)
   - Run tests after each component
   - Continue until all tests pass

4. **Quality Gates**
   - Gate 1: `npm run build` → 0 errors
   - Gate 2: `npm run lint` → 0 errors
   - Gate 3: `npm run dev` + browser test
   - Gate 4a: Unit tests ≥90% coverage
   - Gate 4b: Integration tests pass
   - Gate 4c: E2E tests >80% pass rate

5. **Create PR**
   - Fill completion checklist
   - Include test evidence
   - Request review

---

**Assessment Complete**
**Ready for SA Review and Approval**

---

## Appendix A: File Structure

```
src/app/jobsmarket/companies/[id]/dashboard/applications/
├── page.tsx                          # Server component
├── _components/
│   ├── ApplicationsClient.tsx        # Main client orchestrator
│   ├── FilterPanel.tsx               # Job, status, date, score filters
│   ├── ApplicationList.tsx           # Scrollable list
│   ├── ApplicationCard.tsx           # Single application card
│   ├── DetailPanel.tsx               # Full candidate profile
│   ├── CandidateHeader.tsx           # Photo, name, contact
│   ├── MatchScoreBreakdown.tsx       # Score visualization
│   ├── ProfileSections.tsx           # Experience, education, skills
│   ├── ResumeViewer.tsx              # PDF viewer/download
│   ├── ActionBar.tsx                 # Accept, Reject buttons
│   ├── RejectModal.tsx               # Feedback modal
│   ├── AcceptFlow.tsx                # Accept logic
│   ├── ApplicationsSkeleton.tsx      # Loading state
│   ├── EmptyState.tsx                # No applications/jobs
│   ├── types.ts                      # TypeScript interfaces
│   └── utils/
│       ├── filter-utils.ts           # Filter logic
│       └── application-utils.ts      # Status colors, helpers

src/lib/database/actions/
├── job-applications.ts               # EXTEND with 4 new actions:
│                                     #   - AcceptApplication
│                                     #   - rejectApplication
│                                     #   - readApplication
│                                     #   - JobApplicationGetByCompany

tests/unit/jobsmarket/company/applications/
├── FilterPanel.test.tsx
├── ApplicationCard.test.tsx
├── ApplicationList.test.tsx
├── DetailPanel.test.tsx
├── MatchScoreBreakdown.test.tsx
├── ActionBar.test.tsx
├── RejectModal.test.tsx
├── AcceptFlow.test.tsx
├── filter-utils.test.ts
└── application-utils.test.ts

tests/integration/jobsmarket/company/applications/
├── applications-data-flow.test.ts
├── accept-application.test.ts
├── reject-application.test.ts
├── filter-applications.test.ts
└── mark-read-integration.test.ts

tests/e2e/jobsmarket/company/
├── applications.spec.ts
├── accept-application.spec.ts
├── reject-application.spec.ts
├── filter-applications.spec.ts
├── applications-invalid-inputs.spec.ts
└── applications-mobile.spec.ts
```

---

*End of Assessment*
