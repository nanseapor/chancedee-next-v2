# PR: CAND-R04 - Candidate Applications Page

## Summary

Implements the candidate applications management page at `/jobsmarket/candidates/[id]/applications`, allowing candidates to view all their job applications, filter by status, view application timelines, and withdraw applications.

## 🎯 What's New

### Route
- **`/jobsmarket/candidates/[id]/applications`** - Candidate applications list page

### Features
- ✅ View all job applications with company and job details
- ✅ Filter by status with 5 tabs (All, Applied, Reviewing, Interviewing, Rejected)
- ✅ Expand cards to see application timeline and full details
- ✅ View scheduled interview information when available
- ✅ Withdraw applications with confirmation modal
- ✅ Real-time count badges on status tabs
- ✅ Optimistic UI updates for withdraw action
- ✅ Loading skeletons and empty states
- ✅ Fully responsive mobile-first design
- ✅ Complete Thai language localization

---

## 📁 Changes

### New Files (22)

**Page & Components (10 files)**
- `src/app/jobsmarket/candidates/[id]/applications/page.tsx`
- `src/app/jobsmarket/candidates/[id]/applications/_components/index.ts`
- `src/app/jobsmarket/candidates/[id]/applications/_components/ApplicationsClient.tsx`
- `src/app/jobsmarket/candidates/[id]/applications/_components/ApplicationsSkeleton.tsx`
- `src/app/jobsmarket/candidates/[id]/applications/_components/EmptyState.tsx`
- `src/app/jobsmarket/candidates/[id]/applications/_components/StatusTabs.tsx`
- `src/app/jobsmarket/candidates/[id]/applications/_components/ApplicationCard.tsx`
- `src/app/jobsmarket/candidates/[id]/applications/_components/ApplicationStatusBadge.tsx`
- `src/app/jobsmarket/candidates/[id]/applications/_components/ApplicationTimeline.tsx`
- `src/app/jobsmarket/candidates/[id]/applications/_components/InterviewCard.tsx`
- `src/app/jobsmarket/candidates/[id]/applications/_components/WithdrawModal.tsx`

**Hooks (4 files)**
- `src/hooks/jobsmarket/candidates/index.ts`
- `src/hooks/jobsmarket/candidates/use-applications.ts`
- `src/hooks/jobsmarket/candidates/use-withdraw-application.ts`
- `src/hooks/jobsmarket/candidates/use-application-counts.ts`

**Server Actions & Types (1 file)**
- `src/lib/database/actions/job-applications.constants.ts`

**Tests (6 files)**
- `tests/unit/jobsmarket/candidates/applications/use-applications.test.tsx`
- `tests/unit/jobsmarket/candidates/applications/use-application-counts.test.ts`
- `tests/unit/jobsmarket/candidates/applications/use-withdraw-application.test.tsx`
- `tests/unit/jobsmarket/candidates/applications/ApplicationStatusBadge.test.tsx`
- `tests/unit/jobsmarket/candidates/applications/StatusTabs.test.tsx`
- `tests/e2e/jobsmarket/candidates/applications.spec.ts`

**Documentation (1 file)**
- `docs/jobsmarket/implementation/CAND-R04-IMPLEMENTATION-SUMMARY.md`

### Modified Files (1)

**Server Actions**
- `src/lib/database/actions/job-applications.ts`
  - Added: `webJobApplicationGetByCandidate()` - Batch fetch with joins
  - Added: `webJobApplicationWithdraw()` - Soft delete with validation
  - Fixed: Converted 5 const arrow functions to async function declarations (Gate 1 fix)

---

## 🔧 Technical Implementation

### Server Actions
- **Batch Fetching:** Optimized N+1 queries using `Promise.all` for jobs, companies, and interviews
- **Soft Delete:** Withdraw updates status to `'withdraw'`, preserving application history
- **Validation:** Ownership check and withdrawable status validation

### Client Architecture
- **SWR Data Fetching:** Cache-first with automatic revalidation
- **Client-Side Filtering:** Fast tab switching without server roundtrips
- **Optimistic Updates:** Immediate UI feedback with automatic rollback on error
- **Memoized Counts:** Performance optimization using `useMemo`

### Status Tab Mapping
| Tab | Database Statuses |
|-----|-------------------|
| All | All statuses (including `withdraw`) |
| Applied | `applied`, `read` |
| Reviewing | `accepted` |
| Interviewing | `scheduled`, `confirmed` |
| Rejected | `rejected`, `declined` |

---

## ✅ Testing

### Unit Tests
```
✓ tests/unit/jobsmarket/candidates/applications/use-applications.test.tsx (14 tests)
✓ tests/unit/jobsmarket/candidates/applications/use-application-counts.test.ts (6 tests)
✓ tests/unit/jobsmarket/candidates/applications/use-withdraw-application.test.tsx (8 tests)
✓ tests/unit/jobsmarket/candidates/applications/ApplicationStatusBadge.test.tsx (11 tests)
✓ tests/unit/jobsmarket/candidates/applications/StatusTabs.test.tsx (4 tests)

Test Files  5 passed (5)
     Tests  43 passed (43)
  Coverage  92.64%+ (hooks), 100% (components)
```

### Integration Tests
```
✓ tests/integration/jobsmarket/candidates/applications/job-application-actions.test.ts (20 tests)

All integration tests passing
```

### E2E Tests
```
⚠️ 11 scenarios written, blocked by TD-AUTH-001 (login redirect infrastructure issue)
```

E2E tests are complete and ready to run once the login redirect issue is resolved. This is a separate infrastructure issue unrelated to CAND-R04.

---

## 🎨 Design

### Thai Language Labels
All status labels follow CAND-R04 RIS §6.2:
- Applied: ส่งใบสมัครแล้ว
- Read: บริษัทดูแล้ว
- Accepted: ผ่านการคัดเลือก
- Rejected: ไม่ผ่านการคัดเลือก
- Scheduled: นัดสัมภาษณ์แล้ว
- Confirmed: ยืนยันสัมภาษณ์แล้ว
- Declined: ปฏิเสธสัมภาษณ์
- Withdraw: ถอนใบสมัครแล้ว

### Status Colors
- **Blue:** applied, read, scheduled, confirmed
- **Green:** accepted
- **Orange:** No status uses orange (reserved for CTAs)
- **Red:** rejected, declined, withdraw

### Responsive Breakpoints
- Mobile: 375px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

---

## ♿ Accessibility

- ✅ ARIA labels on all interactive elements
- ✅ Keyboard navigation (Tab order, Enter/Space activation)
- ✅ Screen reader announcements for status changes
- ✅ Focus management in modal (focus trap)
- ✅ Color-independent status indicators (icons + text)
- ✅ Semantic HTML (proper heading hierarchy)

---

## 🚀 Quality Gates

| Gate | Status | Evidence |
|------|--------|----------|
| **Gate 1: Build** | ✅ PASS | `npm run build` - Compiled successfully |
| **Gate 2: Lint** | ✅ PASS | `npm run lint` - 0 errors |
| **Gate 3: Dev Server** | ✅ PASS | Page loads without errors |
| **Gate 4a: Unit Tests** | ✅ PASS | 43/43 tests, 92.64%+ coverage |
| **Gate 4b: Integration** | ✅ PASS | 20/20 tests passing |
| **Gate 4c: E2E** | ⚠️ BLOCKED | Tests written, blocked by TD-AUTH-001 |

---

## 📊 Metrics

- **New TypeScript Files:** 13
- **Test Files:** 6
- **Total Lines of Code:** ~2,450 lines
- **Test Coverage:** 92.64%+ (hooks), 100% (components)
- **Unit Test Pass Rate:** 100% (43/43)
- **Integration Test Pass Rate:** 100% (20/20)

---

## ✅ Checklist

- [x] Code follows project conventions
- [x] TypeScript types properly defined (no `any` unless necessary)
- [x] Thai labels match RIS specification exactly
- [x] Accessibility (ARIA labels, keyboard navigation)
- [x] Responsive design verified (375px - 1920px)
- [x] Loading states (skeleton, empty states)
- [x] Error handling (network errors, retry)
- [x] Auth/ownership checks (useCandidateAuth)
- [x] Unit tests passing (43/43)
- [x] Integration tests passing (20/20)
- [x] Build passes (Gate 1)
- [x] Lint passes (Gate 2)
- [x] Dev server runs (Gate 3)
- [x] No console.log statements (except error logging)
- [x] No unaddressed TODO comments
- [x] Component exports verified
- [x] Hook exports verified
- [x] Documentation complete

---

## 🔗 Related

### Implements
- **RIS:** `docs/jobsmarket/RIS/CAND-R04_applications_RIS.md`
- **BLS:** `docs/jobsmarket/BLS/BLS-03_job-applications.md`

### Documentation
- **Implementation Summary:** `docs/jobsmarket/implementation/CAND-R04-IMPLEMENTATION-SUMMARY.md`
- **Test Report:** `docs/jobsmarket/CAND-R04-PHASE-6-TEST-REPORT.md`
- **Gate 1 Fix:** `docs/jobsmarket/CAND-R04-PHASE-6B-GATE1-FIX-REPORT.md`

### Blocked By (E2E Only)
- **TD-AUTH-001:** Login redirect infrastructure issue (separate from this PR)

---

## 🎥 Manual Testing Checklist

Since E2E tests are blocked, manual testing was performed:

- [x] Navigate to `/jobsmarket/candidates/[uid]/applications`
- [x] Page loads without errors or console warnings
- [x] Applications list displays with job and company information
- [x] All 5 status tabs render with correct counts
- [x] Clicking tab filters applications correctly
- [x] "No results" empty state shows when filter has no matches
- [x] Cards expand/collapse on click
- [x] Timeline displays correct steps based on status
- [x] Interview card shows when interview is scheduled
- [x] Withdraw button only appears for withdrawable statuses
- [x] Withdraw modal opens on button click
- [x] Modal closes on cancel
- [x] Withdraw action updates UI optimistically
- [x] Error handling works (tested by killing server mid-request)
- [x] Responsive design verified on mobile (375px), tablet (768px), desktop (1920px)

---

## 💡 Known Limitations (Out of Scope)

1. **Chat Integration** - Message button hidden until CHAT-R02 implementation
2. **Pagination** - Client-side filtering used (suitable for typical application volume)
3. **Real-time Updates** - SWR revalidation on focus, not WebSocket
4. **Interview Actions** - View-only, reschedule not available on this page

---

## 📝 Notes for Reviewers

### Key Files to Review
1. **`ApplicationsClient.tsx`** - Main integration component, review state management
2. **`use-applications.ts`** - SWR hook with filtering logic
3. **`use-withdraw-application.ts`** - Optimistic update implementation
4. **`job-applications.ts`** - Server actions with batch fetching

### Design Decisions
1. **Why client-side filtering?** - Faster UX, suitable for typical candidate application volume (~10-50 applications)
2. **Why soft delete?** - Preserves application history for both candidate and company
3. **Why separate constants file?** - Next.js 15 "use server" restriction (only async functions allowed)

### Gate 1 Fix (Phase 6b)
The PR includes a fix for a pre-existing Next.js 15 "use server" violation discovered during testing. 5 const arrow functions were converted to async function declarations. See `CAND-R04-PHASE-6B-GATE1-FIX-REPORT.md` for details.

---

**Ready for Review:** ✅
**Ready to Merge:** ✅ (pending review approval)
