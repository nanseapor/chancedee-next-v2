Route Implementation Plan: CAND-R01
Route: /candidates/[id]
RIS: CAND-R01_dashboard_RIS.md
Related BLS: N/A (Read-only route, no business logic mutations)
1. Files to Create
File	Purpose
src/app/jobsmarket/candidates/[id]/page.tsx	Route page (Server Component wrapper)
src/app/jobsmarket/candidates/[id]/_components/DashboardClient.tsx	Main client component with state machine
src/app/jobsmarket/candidates/[id]/_components/WelcomeHeader.tsx	Greeting + Thai date display
src/app/jobsmarket/candidates/[id]/_components/ProfileCompletionCard.tsx	Completion ring + CTA
src/app/jobsmarket/candidates/[id]/_components/ChecklistModal.tsx	Missing fields detail modal
src/app/jobsmarket/candidates/[id]/_components/CoinBalanceCard.tsx	Wallet balance display
src/app/jobsmarket/candidates/[id]/_components/EarnMoreModal.tsx	Ways to earn coins modal
src/app/jobsmarket/candidates/[id]/_components/AppointmentsSection.tsx	Upcoming interviews
src/app/jobsmarket/candidates/[id]/_components/ApplicationSummary.tsx	4-card status overview
src/app/jobsmarket/candidates/[id]/_components/RecentApplicationsList.tsx	Last 5 applications
src/app/jobsmarket/candidates/[id]/_components/RecommendedJobsCarousel.tsx	Job recommendations
src/components/jobsmarket/shells/CandidateShell.tsx	Reusable Candidate Shell (sidebar + header)
src/components/jobsmarket/shells/CandidateSidebar.tsx	Sidebar navigation for candidates
src/components/jobsmarket/shells/CandidateHeader.tsx	Header for candidate routes
src/hooks/jobsmarket/use-profile-completion.ts	Profile completion calculation hook
src/hooks/jobsmarket/use-candidate-auth.ts	Auth + ownership check hook
tests/unit/jobsmarket/candidates/dashboard/profile-completion.test.ts	Unit: completion calculation
tests/unit/jobsmarket/candidates/dashboard/auth-guards.test.ts	Unit: auth/owner checks
tests/integration/jobsmarket/candidates/dashboard/dashboard-flow.test.tsx	Integration: full dashboard flow
tests/e2e/jobsmarket/candidates/dashboard.spec.ts	E2E: dashboard user journey
2. Server Actions Required
Action	Source	Signature	New/Reuse
webCandidateInformationGetById	candidate-information.ts:9	(uid: string) => Promise<FirebaseCandidateData>	Reuse
webUserInfoGetById	user-info.ts	(uid: string) => Promise<UserInfo>	Reuse (check if exists)
webUserAccountsGetById	user-accounts.ts	(uid: string) => Promise<UserAccount>	Reuse
webJobApplicationsGetByCandidate	job-applications.ts	(candidateId: string) => Promise<JobApplication[]>	Reuse/Create (check if exists)
webJobInterviewsGetUpcoming	job-interviews.ts	(candidateId: string) => Promise<JobInterview[]>	Reuse/Create
webPocketsGetByCurrency	pockets.ts:9	(uid: string, currency: string) => Promise<Pocket>	Reuse
CRITICAL:
✅ Use Server Actions from src/lib/database/actions/
❌ Do NOT create /api/ routes
Note: Recommended jobs feature will be mocked/gracefully degraded for v1.0 (recommendation engine not in scope)
3. State Management
Atom/Hook	Purpose	New/Reuse
activeRoleAtom	Set to 'candidate' on mount	Reuse from global-atoms.ts:33
sessionStateAtom	Check auth status	Reuse from global-atoms.ts:39
authenticatedUserIdAtom	Get current user ID	Reuse from global-atoms.ts:45
useCandidateAuth	Auth + owner check hook	New
useProfileCompletion	Calculate completion %	New
SWR Pattern:
// ✅ CORRECT - SWR with server action
const { data: candidate, isLoading } = useSWR(
  userId ? ['candidate-info', userId] : null,
  ([, id]) => webCandidateInformationGetById(id)
);

const { data: applications } = useSWR(
  userId ? ['job-applications', userId] : null,
  ([, id]) => webJobApplicationsGetByCandidate(id)
);
4. Test Coverage Plan
Coverage Targets:
Business Logic (auth guards, completion calc): ≥ 90%
Utilities (date formatting, aggregation): ≥ 80%
E2E: 100% of critical user journeys
Type	Test Case	Covers
Unit	Profile completion calculation (0%, 50%, 100%)	useProfileCompletion hook
Unit	Auth redirect (unauthenticated)	useCandidateAuth hook
Unit	Owner redirect (wrong candidate ID)	useCandidateAuth hook
Unit	Onboarding redirect (is_onboarded=false)	useCandidateAuth hook
Unit	Application status aggregation	Utility function
Unit	Thai date formatting	Utility function
Integration	Dashboard data fetching (parallel SWR)	Full component tree
Integration	Empty states (no applications, no interviews)	Conditional rendering
Integration	Error recovery (retry buttons)	Error handling
Integration	Section-level errors (graceful degradation)	Partial failure handling
E2E	Login → Dashboard (onboarded user)	Full user journey
E2E	Login → Profile redirect (not onboarded)	Onboarding guard
E2E	Wrong candidate ID → Own dashboard redirect	Ownership check
E2E	Completion card → Profile navigation	Interaction
E2E	Application stat card → Filtered applications page	Navigation
5. State Machine Verification
From RIS §6.1 (Page State Automaton):
State	Event	Next State	Test Assertion
loading	INIT	auth_check	sessionState === 'loading'
auth_check	AUTH_SUCCESS	owner_check	sessionState === 'authenticated' && roles.includes('candidate')
auth_check	AUTH_FAILED	redirect_login	sessionState === 'unauthenticated' → redirect /auth/login
auth_check	WRONG_ROLE	redirect_role	!roles.includes('candidate') → redirect /auth/select-role
owner_check	IS_OWNER	onboard_check	params.id === currentUser.uid
owner_check	NOT_OWNER	redirect_own	params.id !== currentUser.uid → redirect /candidates/${uid}
onboard_check	IS_ONBOARDED	loading_data	candidate.is_onboarded === true
onboard_check	NOT_ONBOARDED	redirect_onboarding	candidate.is_onboarded === false → redirect /candidates/${id}/profile
loading_data	DATA_SUCCESS	idle	All SWR fetches complete
loading_data	DATA_ERROR	error	Section-level error handling
idle	REFRESH	loading_data	Manual refresh trigger
Component State Machines (From RIS §6.3):
Component	State	Event	Next State	Assertion
ProfileCompletionCard	visible	CLICK_RING	visible + ChecklistModal open	Modal rendered
ProfileCompletionCard	visible	CLICK_CTA	visible + navigate	router.push('/candidates/${id}/profile') called
ChecklistModal	closed	OPEN	open	Modal isOpen={true}
ChecklistModal	open	CLICK_ITEM	closed + navigate	Navigate to section
AppointmentsSection	loading	FETCH_SUCCESS (empty)	hidden	Section not rendered
AppointmentsSection	loading	FETCH_SUCCESS (data)	loaded	Interview cards rendered
RecommendationsSection	loading	SERVICE_DOWN	service_down	Section gracefully hidden (no error shown)
6. Thai Copy Checklist
Element	Thai Text	English Text	Source
Page Title	แดชบอร์ด	Dashboard	CAND-R01 RIS §7
Welcome Greeting	สวัสดี, {first_name}	Hello, {first_name}	CAND-R01 RIS §7
Profile Completion CTA	กรอกข้อมูลให้ครบ	Complete Profile	CAND-R01 RIS Appendix C
Coin Balance Label	เหรียญของคุณ	Your Coins	CAND-R01 RIS §7
Earn More Link	รับเพิ่ม	Earn More	CAND-R01 RIS §7
Appointments Title	การนัดหมายที่จะถึง	Upcoming Appointments	CAND-R01 RIS §7
Applications Title	สรุปใบสมัครงาน	Application Summary	CAND-R01 RIS §7
View All	ดูทั้งหมด →	View All →	CAND-R01 RIS §7
Applied Card	สมัครแล้ว	Applied	CAND-R01 RIS Appendix D
Reviewing Card	กำลังพิจารณา	Reviewing	CAND-R01 RIS Appendix D
Interview Card	นัดสัมภาษณ์	Interviewing	CAND-R01 RIS Appendix D
Offers Card	ได้รับข้อเสนอ	Offers	CAND-R01 RIS Appendix D
Recommended Jobs	งานที่แนะนำสำหรับคุณ	Recommended Jobs	CAND-R01 RIS §7
Empty State (Apps)	คุณยังไม่มีใบสมัครงาน	You have no applications yet	CAND-R01 RIS §8
Error Network	เกิดข้อผิดพลาดในการเชื่อมต่อ	Network error occurred	CAND-R01 RIS §8.2
Error Retry	ลองอีกครั้ง	Retry	CAND-R01 RIS §8.2
7. Dependencies
Requires:
AUTH-R01 through AUTH-R08 (authentication system) ✅ DONE (Wave 0 complete)
Candidate Shell implementation (created in this route) ⚠️ FIRST ROUTE (creates shell)
Blocks:
CAND-R02 (Profile) - depends on Candidate Shell
CAND-R03 (Settings) - depends on Candidate Shell
CAND-R04 (Applications) - depends on Candidate Shell
CAND-R05 (Saved Jobs) - depends on Candidate Shell
Shell: Candidate Shell (New) - This route creates the shell for all subsequent candidate routes
CRITICAL: This is the first route in the Candidate domain. It establishes:
Candidate Shell component (sidebar + header pattern)
Authentication/authorization patterns (ownership check)
is_onboarded redirect logic
8. Component Reuse Analysis
Check these locations before creating new components:
Component Type	Check Location	Reusable?
Shell/Layout	src/components/jobsmarket/shells/	Create (new Candidate Shell)
Cards	src/components/ui/ (shadcn)	Reuse (card.tsx)
Stat Cards	src/components/jobsmarket/cards/	Create (ApplicationStatCard)
Progress Ring	src/components/ui/	Check (may need custom SVG component)
Modals	src/components/ui/dialog.tsx	Reuse (shadcn Dialog)
Empty States	docs/jobsmarket/design-systems/organisms/empty-states.md	Create (per spec)
Sidebar	src/components/jobsmarket/shells/	Create (CandidateSidebar)
Header	src/components/jobsmarket/shells/	Create (CandidateHeader)
Thai Date Formatter	src/lib/utils/	Create (formatThaiDate)
9. Open Questions
Recommended Jobs Engine: RIS mentions recommendation service. Should we:
Option A: Mock with random jobs for v1.0 (graceful degradation)
Option B: Wait for recommendation service implementation
Recommendation: Option A - mock with simple logic (match by preference fields)
Interview Collection: Does job_interviews collection exist in Firebase?
Need to verify schema
If not exists, hide Appointments section entirely (graceful degradation)
Wallet Collection: Verify web_pockets collection schema
Confirm currency === 'coin' filter
Check if balance can be 0 (show "0" or hide card?)
Profile Completion Calculation: Should we calculate client-side or have a server action?
Recommendation: Client-side hook (no DB writes, pure calculation)
Application Status Mapping: Confirm status values in web_job_applications collection
Per RIS Appendix D: applied, viewed, reviewing, under_review, accepted, interview, scheduled, confirmed, offer
Need to verify these match actual Firestore values
10. Estimated Complexity
Aspect	Estimate
Components	11 new, 2 reuse (Card, Dialog)
Server Actions	0 new, 6 reuse
Hooks	2 new (useCandidateAuth, useProfileCompletion)
Test Cases	~45 unit, ~20 integration, ~8 E2E
Effort	High
Estimated Tests	~73 total
Lines of Code	~1,200-1,500 (excluding tests)
Complexity Drivers:
First route in domain (establishes patterns)
Candidate Shell implementation (reused by 4+ routes)
Complex state machine (auth → owner → onboard → data)
Profile completion calculation (multi-field validation)
Multiple data sources (6 SWR fetches)
Graceful degradation logic (service unavailable states)
Implementation Strategy
Phase 1: Foundation (Must complete first)
Create auth/ownership hooks (useCandidateAuth)
Implement page state machine
Test all redirect scenarios (99% coverage target)
Phase 2: Shell (Blocks all other candidate routes)
Build Candidate Shell components
Implement sidebar navigation with routing
Test shell state management
Phase 3: Dashboard Sections (Can parallelize)
Profile Completion Card + calculation hook
Application Summary (with status aggregation)
Coin Balance Card
Appointments Section (with empty state)
Recommended Jobs (with graceful degradation)
Phase 4: Quality Gates
Run all quality gates (build, lint, dev, tests)
Achieve 90%+ coverage on auth/business logic
Verify E2E tests pass with .env.playwright credentials
Ready for SA Review ✅ Let me know if you'd like me to clarify any section or proceed with implementation after approval!