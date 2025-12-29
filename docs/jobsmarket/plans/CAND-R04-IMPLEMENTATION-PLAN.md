# Route Implementation Plan: CAND-R04

**Route:** `/candidates/[id]/applications`
**RIS:** `CAND-R04_applications_RIS.md`
**Related BLS:** `BLS-03_application.md`
**Created:** 2025-12-19
**Status:** Pending SA Approval

---

## 1. Files to Create

| File | Purpose |
|------|---------|
| `src/app/jobsmarket/candidates/[id]/applications/page.tsx` | Route page (server component) |
| `src/app/jobsmarket/candidates/[id]/applications/_components/ApplicationsClient.tsx` | Client component with SWR, state management |
| `src/app/jobsmarket/candidates/[id]/applications/_components/StatusTabs.tsx` | Filter tabs with count badges |
| `src/app/jobsmarket/candidates/[id]/applications/_components/ApplicationCard.tsx` | Expandable application card with job/company info |
| `src/app/jobsmarket/candidates/[id]/applications/_components/ApplicationTimeline.tsx` | Vertical status timeline with icons |
| `src/app/jobsmarket/candidates/[id]/applications/_components/InterviewCard.tsx` | Interview details display (date/time/location) |
| `src/app/jobsmarket/candidates/[id]/applications/_components/WithdrawModal.tsx` | Confirmation modal for withdraw action |
| `src/app/jobsmarket/candidates/[id]/applications/_components/EmptyState.tsx` | No applications / no results message |
| `src/app/jobsmarket/candidates/[id]/applications/_components/ApplicationStatusBadge.tsx` | Status badge with Thai label mapping |
| `src/hooks/jobsmarket/use-applications.ts` | Fetch applications with SWR and filter |
| `src/hooks/jobsmarket/use-withdraw-application.ts` | Withdraw mutation with optimistic update |
| `src/hooks/jobsmarket/use-application-counts.ts` | Derive tab counts from applications |
| `tests/unit/jobsmarket/candidates/applications/use-applications.test.ts` | Hook unit tests |
| `tests/unit/jobsmarket/candidates/applications/use-withdraw-application.test.ts` | Hook unit tests |
| `tests/unit/jobsmarket/candidates/applications/use-application-counts.test.ts` | Hook unit tests |
| `tests/unit/jobsmarket/candidates/applications/ApplicationCard.test.tsx` | Component unit tests |
| `tests/unit/jobsmarket/candidates/applications/ApplicationTimeline.test.tsx` | Component unit tests |
| `tests/unit/jobsmarket/candidates/applications/StatusTabs.test.tsx` | Component unit tests |
| `tests/unit/jobsmarket/candidates/applications/WithdrawModal.test.tsx` | Component unit tests |
| `tests/unit/jobsmarket/candidates/applications/ApplicationStatusBadge.test.tsx` | Component unit tests |
| `tests/integration/jobsmarket/candidates/applications/job-application-actions.test.ts` | Integration tests for server actions |
| `tests/e2e/jobsmarket/candidates/applications.spec.ts` | E2E tests for all user flows |

---

## 2. Server Actions Required

| Action | Source | Signature | New/Reuse | Location |
|--------|--------|-----------|-----------|----------|
| `webJobApplicationGetByCandidate` | BLS-03 §3.1 | `(candidateId: string) => Promise<ApplicationWithDetails[]>` | **NEW** | `src/lib/database/actions/job-applications.ts` |
| `webJobApplicationWithdraw` | BLS-03 §3.3 | `(uid: string, actorId: string) => Promise<void>` | **NEW** | `src/lib/database/actions/job-applications.ts` |
| `webJobGetById` | Existing | `(uid: string) => Promise<FirebaseJobData \| null>` | **REUSE** | `src/lib/database/actions/jobs.ts` |
| `webCompanyInformationGetById` | Existing | `(uid: string) => Promise<FirebaseCompanyData \| null>` | **REUSE** | `src/lib/database/actions/company-information.ts` |
| `webJobInterviewGetByFilter` | Existing | `(filter?: Filter) => Promise<FirebaseJobInterviewData[] \| null>` | **REUSE** | `src/lib/database/actions/job-interviews.ts` |

### 2.1 New Action: `webJobApplicationGetByCandidate`

**Purpose:** Fetch all applications for a candidate with joined job, company, and interview data.

**Implementation Strategy:**
```typescript
async function webJobApplicationGetByCandidate(candidateId: string) {
  // 1. Fetch all applications for candidate
  const applications = await webJobApplicationGetByFilter(
    Filter.where('candidate_id', '==', candidateRef)
  );

  // 2. Batch fetch job details (title, isActive)
  const jobIds = [...new Set(applications.map(app => app.jobId))];
  const jobs = await Promise.all(jobIds.map(id => webJobGetById(id)));

  // 3. Batch fetch company details (name, logo)
  const companyIds = [...new Set(applications.map(app => app.companyId))];
  const companies = await Promise.all(companyIds.map(id => webCompanyInformationGetById(id)));

  // 4. Batch fetch interviews (optional)
  const interviews = await webJobInterviewGetByFilter(
    Filter.where('candidate_id', '==', candidateRef)
  );

  // 5. Join data
  return applications.map(app => ({
    ...app,
    jobTitle: jobs.find(j => j.uid === app.jobId)?.title,
    jobIsActive: jobs.find(j => j.uid === app.jobId)?.isActive,
    companyName: companies.find(c => c.uid === app.companyId)?.name,
    companyLogo: companies.find(c => c.uid === app.companyId)?.logo,
    interview: interviews?.find(i => i.applicationId === app.uid),
  }));
}
```

**Performance Note:** This uses batch fetching to avoid N+1 queries. Alternative: Server-side Firestore join (more complex).

### 2.2 New Action: `webJobApplicationWithdraw`

**Purpose:** Update application status to 'withdraw' (NOT hard delete).

**Implementation Strategy:**
```typescript
async function webJobApplicationWithdraw(uid: string, actorId: string) {
  // 1. Fetch current application
  const application = await jobApplicationsRepository.getById(uid);

  if (!application) {
    throw new Error('Application not found');
  }

  // 2. Validate current status allows withdraw
  const withdrawableStatuses = ['applied', 'read', 'accepted'];
  if (!withdrawableStatuses.includes(application.status)) {
    throw new Error(`Cannot withdraw application in status: ${application.status}`);
  }

  // 3. Update status to 'withdraw'
  await jobApplicationsRepository.update(uid, {
    ...application,
    status: 'withdraw',
  }, actorId);

  // 4. TODO: Notify company (out of scope for R04)
}
```

**CRITICAL:** Do NOT use `webJobApplicationDelete` - that performs hard delete!

---

## 3. State Management

| Atom/Hook | Purpose | New/Reuse | Location |
|-----------|---------|-----------|----------|
| `userAtom` | Get candidate UID | **REUSE** | `src/store/atoms.ts` |
| `activeRoleAtom` | Verify candidate role | **REUSE** | `src/store/atoms.ts` |
| `sessionStateAtom` | Auth state | **REUSE** | `src/store/atoms.ts` |
| `candidateAtom` | Candidate profile (optional) | **REUSE** | `src/store/atoms.ts` |
| `useApplications` | Fetch applications with SWR | **NEW** | `src/hooks/jobsmarket/use-applications.ts` |
| `useWithdrawApplication` | Mutation with optimistic update | **NEW** | `src/hooks/jobsmarket/use-withdraw-application.ts` |
| `useApplicationCounts` | Derive tab counts | **NEW** | `src/hooks/jobsmarket/use-application-counts.ts` |

### 3.1 Hook: `useApplications`

**Signature:**
```typescript
function useApplications(candidateId: string, statusFilter?: StatusTab) {
  return {
    applications: ApplicationWithDetails[] | undefined;
    isLoading: boolean;
    error: Error | undefined;
    mutate: KeyedMutator<ApplicationWithDetails[]>;
  };
}
```

**SWR Key Pattern:**
- Base: `candidate-applications-${candidateId}`
- Filtered: `candidate-applications-${candidateId}-${statusFilter}` (if filtering client-side)

**Filter Strategy:** Client-side filtering (simpler cache invalidation) unless list is very large (>100 applications).

### 3.2 Hook: `useWithdrawApplication`

**Signature:**
```typescript
function useWithdrawApplication() {
  return {
    withdraw: (applicationId: string) => Promise<void>;
    isWithdrawing: boolean;
    error: Error | undefined;
  };
}
```

**Optimistic Update Pattern:**
```typescript
async function withdraw(applicationId: string) {
  // 1. Optimistic update
  mutate(
    (currentData) => currentData?.filter(app => app.uid !== applicationId),
    { revalidate: false }
  );

  try {
    // 2. Server action
    await webJobApplicationWithdraw(applicationId, currentUserId);

    // 3. Revalidate
    mutate();

    // 4. Toast success
    addToast({ message: 'ถอนใบสมัครสำเร็จ', variant: 'success' });
  } catch (error) {
    // 5. Revert on error
    mutate();
    addToast({ message: 'ถอนใบสมัครไม่สำเร็จ', variant: 'error' });
  }
}
```

### 3.3 Hook: `useApplicationCounts`

**Signature:**
```typescript
function useApplicationCounts(applications: ApplicationWithDetails[]) {
  return {
    all: number;
    applied: number;    // 'applied' + 'read'
    reviewing: number;  // 'accepted'
    interviewing: number; // 'scheduled' + 'confirmed'
    rejected: number;   // 'rejected' + 'declined'
  };
}
```

---

## 4. SWR Keys

| Key Pattern | Purpose | Invalidation Trigger |
|-------------|---------|---------------------|
| `candidate-applications-${uid}` | All applications for candidate | Withdraw success, application created (out of scope) |
| `job-${jobId}` | Job detail (if needed separately) | N/A (cached by job actions) |
| `company-${companyId}` | Company info (if needed separately) | N/A (cached by company actions) |

**Cache Strategy:**
- Applications list: `revalidateOnFocus: false` (user-initiated refresh only)
- Interview data: Embedded in applications response (no separate key)
- Job/Company: Cached by existing actions (don't duplicate)

---

## 5. Test Coverage Plan

| Type | Test File | Test Cases | Covers |
|------|-----------|------------|--------|
| **Unit** | `use-applications.test.ts` | fetch success, fetch error, loading state, filter by status, empty list | Hook logic |
| **Unit** | `use-withdraw-application.test.ts` | withdraw success, withdraw error, optimistic update, rollback on error, invalid status | Mutation |
| **Unit** | `use-application-counts.test.ts` | count calculation, status grouping, empty applications | Derivation |
| **Unit** | `ApplicationCard.test.tsx` | render, expand/collapse, action buttons by status, conditional message button | Component |
| **Unit** | `ApplicationTimeline.test.tsx` | render timeline, status icons, applied date, interview date if scheduled | Component |
| **Unit** | `StatusTabs.test.tsx` | tab selection, counts display, active state | Component |
| **Unit** | `WithdrawModal.test.tsx` | open, confirm, cancel, loading state | Component |
| **Unit** | `ApplicationStatusBadge.test.tsx` | all 11 status mappings, Thai labels | Component |
| **Unit** | `EmptyState.test.tsx` | no applications variant, no results variant, CTA button | Component |
| **Integration** | `job-application-actions.test.ts` | getByCandidate with joins, withdraw updates status, invalid withdraw status, batch fetching | Database actions |
| **E2E** | `applications.spec.ts` | All user flows (see §6) | Full user journeys |

**Coverage Target:** 90%+ for all new code (hooks, components, actions).

---

## 6. E2E Test Scenarios (from RIS §13)

| Scenario ID | Description | Steps | Expected Outcome |
|-------------|-------------|-------|------------------|
| **R04-01** | Load applications list | Login as candidate → Navigate to /applications | See skeleton → Applications list renders |
| **R04-02** | Empty state - no applications | Login as new candidate → Navigate to /applications | Empty state shows with "ค้นหางาน" CTA |
| **R04-03** | Filter by status tab | Load list → Click "สมัครแล้ว" tab | List filters to applied/read only, count updates |
| **R04-04** | Empty state - no results in filter | Click tab with 0 count | "ไม่มีใบสมัครในสถานะนี้" message shows |
| **R04-05** | Expand application card | Click card header | Timeline shows, expand arrow rotates |
| **R04-06** | Collapse application card | Click expanded card header | Timeline hides |
| **R04-07** | View interview details | Expand card with scheduled interview | Interview card shows with date/time/location |
| **R04-08** | Navigate to job detail | Click job title or "ดูรายละเอียดงาน" | Navigate to /jobs/[id] |
| **R04-09** | Message company (accepted status) | Expand accepted application → Click "ส่งข้อความ" | Chat drawer opens or navigate to /chat/[roomId] |
| **R04-10** | Message button hidden (applied status) | Expand applied application | No "ส่งข้อความ" button visible |
| **R04-11** | Withdraw application - confirm | Click "ถอนใบสมัคร" → Confirm in modal | Modal closes, status updates to "ถอนใบสมัครแล้ว", toast shows |
| **R04-12** | Withdraw application - cancel | Click "ถอนใบสมัคร" → Cancel in modal | Modal closes, no change |
| **R04-13** | Withdraw button hidden (rejected status) | View rejected application | No "ถอนใบสมัคร" button |
| **R04-14** | Auth redirect | Not logged in → Navigate to /applications | Redirect to /auth/login |
| **R04-15** | Ownership redirect | Logged in as user A → Navigate to user B's /applications | Redirect to own /applications |
| **R04-16** | Multiple applications sorting | View list with 5+ applications | Sorted by updatedAt DESC (newest first) |

**Test Credentials:**
- Email: `xalanaseon@hotmail.com`
- Password: `P@ssw0rd@1`
- UID: `bywpdkLOSTWjvV8JhhQL6LNditJ3`
- Alternative: `candidate01.chancedee@gmail.com` / `Metapeople@2025#!`

---

## 7. State Machine Verification (from RIS §6)

| State | Test Assertion | How to Trigger |
|-------|----------------|----------------|
| `loading` | Skeleton/spinner displays | Page load, set isLoading=true in mock |
| `empty` | Empty state component shows | Mock empty applications array |
| `has_applications` | Application list renders | Mock applications array with data |
| `filtering` | Filtered list shows correct items | Click tab, verify filter logic |
| `card_collapsed` | Timeline hidden, arrow down | Default state |
| `card_expanded` | Timeline and actions visible, arrow up | Click card header |
| `withdraw_confirming` | Modal open with confirm/cancel | Click "ถอนใบสมัคร" button |
| `withdraw_processing` | Button shows loading state | Mock pending promise |
| `withdraw_success` | Toast shows, list updates, card removed/status updated | Mock successful withdraw |
| `withdraw_error` | Error toast shows, list reverts | Mock rejected promise |

---

## 8. Thai Copy Checklist

| Element | Thai Text | Source |
|---------|-----------|--------|
| **Page** | | |
| Page title | ใบสมัครงานของฉัน | RIS §7.1 |
| Results count | XX ใบสมัคร | RIS §7.1 |
| **Tabs** | | |
| Tab: All | ทั้งหมด | RIS §4.4 |
| Tab: Applied | สมัครแล้ว | RIS §4.4 |
| Tab: Reviewing | กำลังพิจารณา | RIS §4.4 |
| Tab: Interviewing | นัดสัมภาษณ์ | RIS §4.4 |
| Tab: Rejected | ไม่ผ่าน | RIS §4.4 |
| **Empty States** | | |
| Empty: No applications (title) | คุณยังไม่ได้สมัครงาน | RIS §10.1 |
| Empty: No applications (description) | เริ่มสมัครงานเพื่อติดตามสถานะได้ที่นี่ | RIS §10.1 |
| Empty: No applications (CTA) | ค้นหางาน | RIS §10.1 |
| Empty: No results | ไม่มีใบสมัครในสถานะนี้ | RIS §10.2 |
| **Application Card** | | |
| Applied date prefix | สมัครเมื่อ | RIS §7.2 |
| View job button | ดูประกาศงาน | RIS §7.2 |
| Message button | ส่งข้อความ | RIS §7.2 |
| Withdraw button | ถอนใบสมัคร | RIS §7.2 |
| **Timeline** | | |
| Timeline: Applied | สมัครงานแล้ว | RIS §7.3 |
| Timeline: Read | บริษัทดูใบสมัคร | RIS §7.3 |
| Timeline: Accepted | ตอบรับ | RIS §7.3 |
| Timeline: Scheduled | นัดสัมภาษณ์ | RIS §7.3 |
| Timeline: Confirmed | ยืนยันสัมภาษณ์แล้ว | RIS §7.3 |
| Timeline: Declined | ปฏิเสธสัมภาษณ์ | RIS §7.3 |
| Timeline: Rejected | ไม่ผ่านการคัดเลือก | RIS §7.3 |
| Timeline: Pending | รอการตอบรับ | RIS §7.3 |
| **Status Badges** | | |
| Status: applied | ส่งใบสมัครแล้ว | Design Guidelines |
| Status: read | บริษัทดูแล้ว | Design Guidelines |
| Status: accepted | ผ่านการคัดเลือก | Design Guidelines |
| Status: rejected | ไม่ผ่านการคัดเลือก | Design Guidelines |
| Status: scheduled | นัดสัมภาษณ์แล้ว | Design Guidelines |
| Status: confirmed | ยืนยันสัมภาษณ์แล้ว | Design Guidelines |
| Status: declined | ปฏิเสธสัมภาษณ์ | Design Guidelines |
| Status: withdraw | ถอนใบสมัครแล้ว | Design Guidelines |
| Status: closed | ปิดรับสมัครแล้ว | Design Guidelines |
| Status: cancelled | ยกเลิกการนัดสัมภาษณ์ | Design Guidelines |
| **Withdraw Modal** | | |
| Modal title | ยืนยันถอนใบสมัคร | RIS §9.2 |
| Modal message | คุณต้องการถอนใบสมัครงานนี้หรือไม่? | RIS §9.2 |
| Confirm button | ยืนยัน | RIS §9.2 |
| Cancel button | ยกเลิก | RIS §9.2 |
| **Toasts** | | |
| Withdraw success | ถอนใบสมัครสำเร็จ | RIS §9.2 |
| Withdraw error | ถอนใบสมัครไม่สำเร็จ กรุณาลองใหม่อีกครั้ง | RIS §9.2 |
| Already processed error | ใบสมัครถูกดำเนินการแล้ว | RIS §9.2 |

---

## 9. Dependencies

### Requires (must exist):
- ✅ **CAND-R00:** Candidate Shell specification
- ✅ **CAND-R01:** Dashboard (sidebar nav with Applications link)
- ✅ **Schemas:** `src/lib/database/schemas/job-applications.schema.ts`
- ✅ **Schemas:** `src/lib/database/schemas/job-interviews.schema.ts`
- ✅ **Repository:** `src/lib/database/repositories/job-applications-repository.ts`
- ✅ **Repository:** `src/lib/database/repositories/job-interviews-repository.ts`
- ✅ **Actions:** `src/lib/database/actions/job-applications.ts` (base CRUD)
- ✅ **Actions:** `src/lib/database/actions/job-interviews.ts` (getByFilter exists)
- ✅ **Actions:** `src/lib/database/actions/jobs.ts` (webJobGetById)
- ✅ **Actions:** `src/lib/database/actions/company-information.ts` (webCompanyInformationGetById)
- ✅ **Constants:** `src/constants/application.ts` (MasterJobApplicationStatuses enum)
- ✅ **UI:** `src/components/ui/badge.tsx` (shadcn badge)

### Blocks (depends on this):
- **COMP-R08:** Company Applications page (mirrors from company side)
- **CHAT-R02:** Interview confirmation flow (references application data)

---

## 10. Open Questions for SA Review

### Q1: Interview Data Fetching Strategy
**Question:** Should we fetch interviews in the main `webJobApplicationGetByCandidate` action (batch fetch) or lazy-load per expanded card?

**Option A (Recommended):** Batch fetch in main action
- ✅ Pro: Single network round-trip, simpler state
- ❌ Con: Slightly larger payload if user doesn't expand cards

**Option B:** Lazy load per card expansion
- ✅ Pro: Smaller initial payload
- ❌ Con: N additional requests, loading states per card

**Recommendation:** **Option A** - RIS §4.1 shows interview in main data contract, and most users will expand at least 1-2 cards.

---

### Q2: Chat Integration Pattern
**Question:** Should "ส่งข้อความ" button open chat drawer or navigate to `/chat/[roomId]`?

**Context:** RIS §8.2 shows `openChat(chatId)` but implementation unclear.

**Options:**
- **Option A:** Open existing chat drawer (if exists in Candidate Shell)
- **Option B:** Navigate to `/chat/[roomId]`
- **Option C:** Hybrid - drawer on desktop, navigate on mobile

**Recommendation:** Check CHAT-R02 spec and existing chat implementation. If drawer exists, use it for consistency with other routes.

---

### Q3: Pagination Strategy
**Question:** RIS doesn't specify pagination. Should we implement it for candidates with many applications?

**Context:** Most candidates will have <20 applications, but power users (frequent job seekers) might have 50+.

**Options:**
- **Option A:** No pagination initially, client-side render all (simpler)
- **Option B:** Infinite scroll (better UX for large lists)
- **Option C:** Server-side pagination with "Load More" button

**Recommendation:** **Option A** for MVP. Add infinite scroll in future if performance issues arise.

---

### Q4: Real-Time Status Updates
**Question:** Should application status update in real-time when company takes action (e.g., accepts application)?

**Options:**
- **Option A:** No real-time (current SWR polling on focus)
- **Option B:** Firebase snapshot listeners (real-time)
- **Option C:** Polling every N seconds while page is active

**Recommendation:** **Option A** for MVP. Real-time is nice-to-have but adds complexity. User can refresh or refocus tab to see updates.

---

### Q5: Job Inactive Handling
**Question:** How should we display applications for jobs that are now inactive/closed?

**Options:**
- **Option A:** Show all applications, gray out inactive jobs
- **Option B:** Filter out inactive jobs by default (optional "Show All")
- **Option C:** Show all with badge "ปิดรับสมัครแล้ว"

**Recommendation:** **Option C** - User should see their full application history, with clear indicator if job is closed.

---

## 11. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **N+1 query performance with many applications** | High | Medium | Use batch fetching in `webJobApplicationGetByCandidate` (Promise.all) |
| **Missing test data for test candidate** | High | High | Seed test applications in integration test setup, or create in E2E beforeEach |
| **Interview repository returns null instead of []** | Medium | Low | Handle null gracefully, convert to empty array |
| **SWR cache stale after withdraw** | Medium | Medium | Invalidate `candidate-applications-${uid}` key on success |
| **Status badge mapping incomplete** | Low | Low | Use MasterJobApplicationStatuses enum, create comprehensive mapping |
| **Hard delete instead of status update** | **CRITICAL** | **CRITICAL** | **DO NOT use `webJobApplicationDelete`** - create new `webJobApplicationWithdraw` |
| **Job/Company data missing (deleted entities)** | Medium | Low | Graceful fallback: show "ไม่ระบุ" if job/company not found |
| **Interview time zone issues** | Low | Medium | Store timestamps, format with candidate's locale |

---

## 12. Estimated Complexity

| Aspect | Estimate |
|--------|----------|
| **Components** | 9 new, 3 reuse (Shell, Badge, Card layout patterns) |
| **Server Actions** | 2 new (GetByCandidate, Withdraw), 3 reuse (Job, Company, Interview) |
| **Hooks** | 3 new (useApplications, useWithdrawApplication, useApplicationCounts) |
| **Test Files** | 9 unit test files, 1 integration, 1 E2E |
| **Test Cases** | ~35 unit tests, ~8 integration tests, ~16 E2E scenarios |
| **Lines of Code** | ~1200 (components + hooks + tests) |
| **Effort** | **Medium-High** (22-26 hours) |

---

## 13. Implementation Phases

| Phase | Tasks | Est. Hours | Gate | Deliverables |
|-------|-------|------------|------|--------------|
| **1. Foundation** | Route setup, page.tsx, empty state component | 2h | `npm run build` passes | Route accessible, empty state renders |
| **2. Server Actions** | `webJobApplicationGetByCandidate`, `webJobApplicationWithdraw` | 4h | Integration tests pass | Actions return correct data |
| **3. Hooks** | `useApplications`, `useWithdrawApplication`, `useApplicationCounts` | 3h | Unit tests pass (90%+ coverage) | Hooks tested and working |
| **4. Components** | StatusTabs, ApplicationCard, Timeline, Interview, Badge, Modal | 6h | Unit tests pass (90%+ coverage) | All components render correctly |
| **5. Integration** | Wire ApplicationsClient, connect hooks to components | 2h | `npm run dev` works, manual testing | Page functional end-to-end |
| **6. Testing** | E2E scenarios, edge cases, accessibility | 5h | All E2E tests pass | 16 E2E scenarios passing |
| **7. Polish** | Thai copy, loading states, error states, accessibility audit | 2h | Lint passes, manual review | Production-ready |
| **Total** | | **24h** | **All 4 gates pass** | Feature complete |

### Phase Breakdown Details:

#### Phase 1: Foundation (2h)
- Create directory structure
- Create `page.tsx` with auth/ownership checks (reuse CAND-R03 pattern)
- Create `ApplicationsClient.tsx` skeleton
- Create `EmptyState.tsx` component
- **Gate:** Build passes, route accessible at `/candidates/[id]/applications`

#### Phase 2: Server Actions (4h)
- Implement `webJobApplicationGetByCandidate` with batch fetching
- Implement `webJobApplicationWithdraw` with status validation
- Write integration tests for both actions
- Test data joins (job + company + interview)
- **Gate:** Integration tests pass, actions return expected data shape

#### Phase 3: Hooks (3h)
- Implement `useApplications` with SWR
- Implement `useWithdrawApplication` with optimistic update
- Implement `useApplicationCounts` derivation logic
- Write unit tests for all 3 hooks (15+ test cases)
- **Gate:** Unit tests pass with 90%+ coverage

#### Phase 4: Components (6h)
- `StatusTabs.tsx` - tabs with count badges
- `ApplicationStatusBadge.tsx` - status to badge variant mapping
- `ApplicationTimeline.tsx` - vertical timeline with icons
- `InterviewCard.tsx` - interview details display
- `ApplicationCard.tsx` - main card with expand/collapse
- `WithdrawModal.tsx` - confirmation dialog
- Write unit tests for all components (20+ test cases)
- **Gate:** Unit tests pass with 90%+ coverage

#### Phase 5: Integration (2h)
- Wire `ApplicationsClient.tsx` with all components
- Connect hooks to components
- Implement tab filtering
- Implement card expand/collapse state
- Manual testing in dev server
- **Gate:** `npm run dev` works, can navigate and interact with page

#### Phase 6: Testing (5h)
- Write E2E test file with 16 scenarios
- Test auth/ownership redirects
- Test filter tabs
- Test withdraw flow
- Test empty states
- Test card interactions
- **Gate:** All E2E tests pass in Chromium

#### Phase 7: Polish (2h)
- Verify all Thai copy is correct
- Add loading skeletons
- Add error boundaries
- Accessibility audit (keyboard nav, screen reader)
- Final lint check
- **Gate:** Lint passes, accessibility standards met

---

## 14. Completion Checklist

### Quality Gates (ALL must pass)
- [ ] Gate 1: `npm run build` → exits with code 0
- [ ] Gate 2: `npm run lint` → no errors (warnings OK)
- [ ] Gate 3: `npm run dev` → route loads in browser without errors
- [ ] Gate 4a: Unit tests → X passed, 0 failed, **coverage ≥ 90%**
- [ ] Gate 4b: Integration tests → X passed, 0 failed
- [ ] Gate 4c: E2E tests → X passed, 0 failed, **all RIS flows covered**

### Test Evidence (paste actual output)
- [ ] Unit test coverage report
- [ ] Integration test results
- [ ] E2E test results

### RIS Flow Coverage
- [ ] All scenarios from RIS §13 tested
- [ ] Invalid inputs tested
- [ ] Error states tested

### Manual Verification
- [ ] Visited route in browser
- [ ] Core functionality works
- [ ] Thai copy is correct
- [ ] Design guidelines followed

---

## 15. Success Criteria

This implementation is considered **complete** when:

1. ✅ All 22 files are created
2. ✅ All 4 quality gates pass
3. ✅ Test coverage ≥ 90% for new code
4. ✅ All 16 E2E scenarios pass
5. ✅ All Thai copy is correct
6. ✅ Candidate can:
   - View all their applications
   - Filter by status tabs
   - Expand cards to see timeline
   - Withdraw withdrawable applications
   - Navigate to job details
   - Message companies (if accepted)
   - See empty state if no applications
7. ✅ Auth/ownership redirects work correctly
8. ✅ No console errors in browser
9. ✅ Follows design guidelines (colors, typography, spacing)
10. ✅ Accessible (keyboard nav, ARIA labels)

---

## 16. Notes for Implementation

### Critical Implementation Rules:

1. **DO NOT hard delete applications**
   ```typescript
   // ❌ WRONG
   await webJobApplicationDelete(uid);

   // ✅ CORRECT
   await webJobApplicationWithdraw(uid, actorId);
   ```

2. **Use batch fetching to avoid N+1**
   ```typescript
   // ❌ WRONG
   for (const app of applications) {
     app.jobTitle = await webJobGetById(app.jobId);
   }

   // ✅ CORRECT
   const jobs = await Promise.all(
     [...new Set(applications.map(a => a.jobId))].map(id => webJobGetById(id))
   );
   ```

3. **Follow CAND-R03 mutation pattern**
   - Optimistic update
   - Revert on error
   - Mutate SWR cache on success
   - Show toast feedback

4. **Status badge mapping**
   - Use `MasterJobApplicationStatuses` enum as source of truth
   - Map to design guideline badge variants (waiting/success/problem/neutral)
   - Include Thai labels

5. **Timeline status icons**
   - ✓ (green) for completed steps
   - ◯ (orange) for current/pending step
   - ○ (gray) for future steps
   - ✕ (red) for rejected/declined

---

**Plan Status:** 🟡 Pending SA Approval

**Next Steps After Approval:**
1. Answer open questions (Q1-Q5)
2. Begin Phase 1 (Foundation)
3. Report progress after each phase gate
