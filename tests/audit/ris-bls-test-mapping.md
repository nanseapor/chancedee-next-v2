# RIS-BLS Test Coverage Matrix

## How to Use This Document

1. **For Claude Code**: Use this to know which BLS specs apply to each RIS
2. **For Test Verification**: Check that tests cover all listed specifications
3. **For Coverage Audit**: Verify each specification has corresponding test cases

---

## RIS to BLS Mapping Table

| RIS ID | RIS Document | Related BLS | Key Actions to Test |
|--------|--------------|-------------|---------------------|
| AUTH-R00 | Cross-cutting Auth | BLS-00 | Session validation, auth middleware |
| AUTH-R01 | Login | BLS-01 | `login`, `UserAccountGet`, post-auth routing |
| AUTH-R02 | Register | BLS-01 | `register`, `createPassword`, consent logging |
| AUTH-R03 | Verify | BLS-01 | `verifyOTP`, `sendOTP` |
| AUTH-R04 | Reset | BLS-01 | `requestPasswordReset` |
| AUTH-R05 | Status | BLS-01 | Status display, account states |
| AUTH-R06 | Settings | BLS-01 | `createPassword`, `changePassword` |
| AUTH-R07 | Select Role | BLS-01 | `selectRole`, multi-role navigation |
| AUTH-R08 | Session Expired | BLS-00 | Session timeout handling |
| CAND-R00 | Cross-cutting Candidate | BLS-00 | Candidate auth, guards |
| CAND-R01 | Dashboard | BLS-08 | Candidate stats, recent activity |
| CAND-R02 | Profile | BLS-08 | Profile CRUD, experience, education |
| CAND-R03 | Settings | BLS-08 | Account settings, preferences |
| CAND-R04 | Applications | BLS-03 | Application list, status tracking |
| CAND-R05 | Saved | BLS-02 | Saved jobs CRUD |
| COMP-R00 | Cross-cutting Company | BLS-00 | Company auth, guards |
| COMP-R01 | Pending | BLS-09 | Pending approval status |
| COMP-R02 | Team | BLS-09 | Team management, invitations |
| COMP-R03 | Settings | BLS-09 | Company settings, profile |
| COMP-R04 | Dashboard | BLS-09 | Company stats, overview |
| COMP-R05 | Jobs List | BLS-07 | Job listing, filtering |
| COMP-R06 | Jobs New | BLS-07 | `createJob`, form validation |
| COMP-R07 | Jobs Detail | BLS-07 | `updateJob`, `closeJob` |
| COMP-R08 | Applications | BLS-03, BLS-04, BLS-05 | Application review, screening, interviews |
| JOB-R00 | Cross-cutting Jobs | BLS-00, BLS-02 | Public job access |
| JOB-R01 | Jobs List | BLS-02 | Job search, filters, pagination |
| JOB-R02 | Job Detail | BLS-02 | Job view, related jobs |
| JOB-R02b | Apply Modal | BLS-03 | `applyToJob`, application form |
| CHAT-R00 | Cross-cutting Chat | BLS-00, BLS-06 | Chat auth, guards |
| CHAT-R01 | Chat List | BLS-06 | Chat list, unread counts |
| CHAT-R02 | Chat Room | BLS-06 | `sendMessage`, real-time updates |
| NOTIF-R00 | Cross-cutting Notifications | BLS-00, BLS-11 | Notification auth |
| NOTIF-R01 | Notifications | BLS-11 | Notification list, mark read |
| WALLET-R01 | Wallet | BLS-10 | Balance, transactions, transfer |
| ADM-R00 | Cross-cutting Admin | BLS-00, BLS-12 | Admin auth, guards |
| ADM-R01 | Platform Dashboard | BLS-12 | Platform stats |
| ADM-R02 | Companies | BLS-12 | Company approval, management |
| ADM-R03 | Candidates | BLS-12 | Candidate management |
| ADM-R04 | Jobs | BLS-12 | Job moderation |
| ADM-R05 | Reports | BLS-12 | Flagged content review |
| ADM-R06 | Users | BLS-12 | User management |
| ADM-R07 | Analytics | BLS-12 | Platform analytics |
| ADM-R08 | Settings | BLS-12 | Platform settings |
| ADM-R09 | Logs | BLS-12 | Activity logs |
| ADM-R10 | Notifications | BLS-12 | Admin notifications |

---

## BLS Action Reference

### BLS-01: Onboarding Stage

| Action | RIS Entry Points | Test Categories |
|--------|------------------|-----------------|
| `login` | AUTH-R01 | Unit: credential validation, error mapping; Integration: Firebase auth, session creation |
| `register` | AUTH-R02 | Unit: form validation; Integration: user creation, consent logging |
| `verifyOTP` | AUTH-R03 | Unit: OTP validation; Integration: OTP verification flow |
| `sendOTP` | AUTH-R03 | Unit: rate limiting; Integration: email sending |
| `requestPasswordReset` | AUTH-R04 | Unit: email validation; Integration: reset email flow |
| `selectRole` | AUTH-R07 | Unit: role validation; Integration: role switching |
| `createPassword` | AUTH-R06 | Unit: password rules; Integration: password creation |
| `changePassword` | AUTH-R06 | Unit: password rules; Integration: password update |

### BLS-02: Discovery Stage

| Action | RIS Entry Points | Test Categories |
|--------|------------------|-----------------|
| `searchJobs` | JOB-R01 | Unit: query parsing; Integration: MeiliSearch |
| `getJobDetail` | JOB-R02 | Unit: ID validation; Integration: job fetch |
| `saveJob` | JOB-R01, CAND-R05 | Unit: validation; Integration: save/unsave |
| `getSavedJobs` | CAND-R05 | Unit: pagination; Integration: list fetch |

### BLS-03: Application Stage

| Action | RIS Entry Points | Test Categories |
|--------|------------------|-----------------|
| `applyToJob` | JOB-R02b | Unit: form validation; Integration: application creation |
| `getApplications` | CAND-R04, COMP-R08 | Unit: filtering; Integration: list fetch |
| `withdrawApplication` | CAND-R04 | Unit: state validation; Integration: withdrawal |

### BLS-06: Communication Stage

| Action | RIS Entry Points | Test Categories |
|--------|------------------|-----------------|
| `sendMessage` | CHAT-R02 | Unit: content validation; Integration: message creation |
| `getChatList` | CHAT-R01 | Unit: sorting; Integration: list fetch |
| `markAsRead` | CHAT-R02 | Unit: validation; Integration: read status update |

### BLS-07: Job Management Stage

| Action | RIS Entry Points | Test Categories |
|--------|------------------|-----------------|
| `createJob` | COMP-R06 | Unit: form validation; Integration: job creation |
| `updateJob` | COMP-R07 | Unit: field validation; Integration: job update |
| `closeJob` | COMP-R07 | Unit: state validation; Integration: job closure |
| `getCompanyJobs` | COMP-R05 | Unit: filtering; Integration: list fetch |

---

## Test Categories Per RIS Section

When auditing a specific RIS, ensure tests exist for:

### Standard RIS Sections to Test

| Section | Test Focus |
|---------|------------|
| Section 4: Data Contract | Data fetch/write operations |
| Section 5: UI Components | Component rendering, props |
| Section 6: Page States | State transitions, conditions |
| Section 7: Query Parameters | URL param handling |
| Section 8: Interactions | User actions, events |
| Section 9: Navigation/Routing | Route decisions, redirects |
| Section 10: Error Handling | Error states, recovery |
| Section 11: Consent/Security | Auth checks, PDPA |
| Appendix A: Types | Type validation |
| Appendix B: Server Actions | Action behavior |

---

## Quick Verification Checklist

For each RIS document, verify:

```markdown
## RIS: {RIS_ID}

### Unit Tests
- [ ] Component rendering tests
- [ ] Form validation tests  
- [ ] State management tests
- [ ] Error state tests
- [ ] Type/prop validation tests

### Integration Tests
- [ ] Server action tests (all actions in Appendix B)
- [ ] Data fetch tests (all reads in Section 4.1)
- [ ] Data write tests (all writes in Section 4.2)
- [ ] Auth/guard tests

### E2E Tests
- [ ] Happy path user journey
- [ ] Error path handling
- [ ] Navigation flows (Section 9)
```
