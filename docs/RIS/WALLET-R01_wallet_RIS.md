# WALLET-R01: Wallet Route Implementation Spec

**Version:** 1.0  
**Last Updated:** 2025-12-10  
**Route:** `/candidates/[id]/wallet`  
**Primary Domain:** Wallet

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-10 | Initial RIS creation with balance display, ways to earn, and transaction history |

---

## Cross-References

This document references shared specifications from other RIS documents.

| Topic | Source Document | Section |
|-------|-----------------|---------|
| Candidate Shell | CAND-R00_cross-cutting_RIS.md | Section 2 |
| Authentication Patterns | CAND-R00_cross-cutting_RIS.md | Section 3 |
| Ownership Redirect | CAND-R00_cross-cutting_RIS.md | Section 3.3 |
| Dashboard Coin Widget | CAND-R01_dashboard_RIS.md | Section 4, Appendix A |
| Wallet Features | features_wallet.md | All sections |
| Pocket Schema | data-entities_pockets.md | All fields |
| Transaction Schema | data-entities_wallet-transactions.md | All fields |

---

## 1. Route Metadata

| Property | Value |
|----------|-------|
| Route ID | WALLET-R01 |
| Route Path | `/candidates/[id]/wallet` |
| Shell | Candidate Shell |
| Purpose | Display wallet balance, transaction history, and ways to earn coins |
| Complexity | Low-Medium |
| Phase | Wave 7 (Supporting Features) |
| UI Spec | NOT in `04-candidate-routes.md` - New dedicated page |

### Route Parameters

| Parameter | Type | Source | Validation |
|-----------|------|--------|------------|
| `id` | `string` | URL path segment | Must be valid candidate UID, must match logged-in user |

### URL Query Parameters

| Parameter | Type | Default | Purpose | URL Format |
|-----------|------|---------|---------|------------|
| `tab` | `string` | `coins` | Currency tab selection | `?tab=coins` |

### Tab Values

| Value | Thai Label | English | Default | Notes |
|-------|------------|---------|---------|-------|
| `coins` | เหรียญ | Coins | ✅ Yes | Primary currency |
| `stars` | ดาว | Stars | | Secondary currency (future use) |

---

## 2. Domain Classification

### Primary Domain: Wallet (●)

- **Owns:** Balance display, transaction history, reward explanations
- **Mutations:** None on this route (read-only display)

### Secondary Domains (○)

| Domain | Role | Access |
|--------|------|--------|
| Candidate | User identity, onboarding status | Read `candidate_information` |
| Auth | Session validation, ownership | Read session, roles |

### Global Domains (⊙) - Via Shell

| Domain | Requirement |
|--------|-------------|
| Auth | User must be authenticated with candidate role |
| Chat | FAB in shell |
| Notifications | Bell icon in shell |

---

## 3. Feature Mapping

### Existing Features (Preserve - P0)

| Feature ID | Feature Name | Coverage | Notes |
|------------|--------------|----------|-------|
| WALLET-001 | View Coin Balance | Full | Main balance display |
| WALLET-002 | View Star Balance | Full | Secondary balance (may show 0) |
| WALLET-003 | View Transaction History | Full | Paginated list |
| WALLET-006 | Signup Reward | Display | Explain how to earn |
| WALLET-007 | Referral Reward | Display | Explain how to earn |
| WALLET-008 | First Application Reward | Display | Explain how to earn |
| WALLET-009 | First Interview Reward | Display | Explain how to earn |

### Features from Dashboard (Cross-reference)

| Feature | Source | Integration |
|---------|--------|-------------|
| Coin Balance Widget | CAND-R01 | Link "รับเพิ่ม" → This page |
| Earn More Modal | CAND-R01 | Same content as "Ways to Earn" section |

### New Features (Enhancements)

| Feature | Description | Priority |
|---------|-------------|----------|
| Dedicated Wallet Page | Full wallet view (not just widget) | P0 |
| Transaction Filtering | Filter by type/currency | P1 |
| Reward Progress | Show which rewards are claimed | P1 |

### Not Implemented in v1.0

| Feature | Description | Status |
|---------|-------------|--------|
| Coin Redemption | Spend coins on features | ☆ Future (no features to spend on) |
| Star Earning | Ways to earn stars | ☆ Future (admin deposit only) |
| Transaction Export | Download history as CSV | ☆ Future |

---

## 4. Data Contract

### 4.1 Read Operations

| Data | Collection | Fields | Condition | SWR Key |
|------|------------|--------|-----------|---------|
| Coin Balance | `pockets/coin/{userId}` | `balance`, `latest` | `uid === params.id` | `wallet-coin-${id}` |
| Star Balance | `pockets/star/{userId}` | `balance`, `latest` | `uid === params.id` | `wallet-star-${id}` |
| Transactions | `wallet_transactions` | All fields | `transaction_receiver === params.id` | `wallet-transactions-${id}` |
| Candidate Info | `candidate_information` | Reward flags | `uid === params.id` | `candidate-${id}` |

### 4.2 Pocket Fields

| Field | Type | Purpose | Display |
|-------|------|---------|---------|
| `uid` | string | User ID | - |
| `currency` | string | 'coin' or 'star' | Tab selection |
| `balance` | number | Current balance | Large number display |
| `latest` | string[] | Last 10 transaction IDs | Quick access |
| `createdAt` | number | Wallet creation time | - |
| `updatedAt` | number | Last update time | - |

### 4.3 Transaction Fields

| Field | Type | Purpose | Display |
|-------|------|---------|---------|
| `uid` | string | Transaction ID | - |
| `transactionOwner` | string | Who initiated | For admin deposits |
| `transactionReceiver` | string | User receiving | Filter condition |
| `transactionOrigin` | string | Source type | Thai display text |
| `transactionType` | string | 'deposit' or 'withdraw' | +/- indicator |
| `transactionAmount` | number | Amount | Number with sign |
| `transactionCurrency` | string | 'coin' or 'star' | Filter/display |
| `transactionTime` | number | Timestamp | Thai date format |
| `remark` | string? | Optional notes | Secondary text |

### 4.4 Transaction Origin Mapping

| Origin Code | Thai Display | Icon | Type |
|-------------|--------------|------|------|
| `signup_reward` | สมัครสมาชิก | 🎁 | deposit |
| `referral_received` | แนะนำเพื่อน (ได้รับ) | 👥 | deposit |
| `referral_given` | แนะนำเพื่อน (ให้) | 👥 | deposit |
| `first_application_reward` | สมัครงานครั้งแรก | 📝 | deposit |
| `first_interview_reward` | สัมภาษณ์ครั้งแรก | 🎯 | deposit |
| `admin_deposit` | ได้รับจากระบบ | ⚙️ | deposit |
| `admin_withdraw` | หักจากระบบ | ⚙️ | withdraw |
| `onboarding` | โบนัสลงทะเบียน | 🎁 | deposit |
| `register` | โบนัสลงทะเบียน | 🎁 | deposit |

### 4.5 Candidate Reward Flags

| Field | Type | Purpose |
|-------|------|---------|
| `isFirstApplicantionRewarded` | boolean | First application reward claimed |
| `isFirstInterviewerRewarded` | boolean | First interview reward claimed |
| `referBy` | string? | Referral code used |
| `referredList` | string[] | Users referred |

### 4.6 Write Operations

**This is a READ-ONLY page. No mutations occur on this route.**

Coin transactions are created by:
- System (signup, referral, first application, first interview)
- Admin (deposit/withdraw via admin panel)

---

## 5. State Contract

### 5.1 Atoms

| Atom | Type | R/W | Purpose | Set When |
|------|------|-----|---------|----------|
| `userAtom` | `userDataProps \| null` | R | Get user data, check ownership | After auth validation |
| `candidateAtom` | `candidateDataProps \| null` | R | Candidate profile + reward flags | After data fetch |
| `activeRoleAtom` | `string` | R/W | Navigation context ('candidate') | On page mount |

### 5.2 Hooks

| Hook | Returns | Purpose |
|------|---------|---------|
| `useFirebaseAuth` | `{ user, userChancedee, loading }` | Auth state |
| `useParams` | `{ id: string }` | Route parameters |
| `useRouter` | Next.js router | Navigation |
| `useSearchParams` | URLSearchParams | Tab query param |
| `useWalletBalance` | `{ coin, star, isLoading }` | Balance for both currencies |
| `useTransactionHistory` | `{ transactions, isLoading, loadMore, hasMore }` | Paginated transactions |

### 5.3 SWR Keys

| Key Pattern | Purpose | Config | Invalidation Trigger |
|-------------|---------|--------|----------------------|
| `wallet-coin-${id}` | Coin pocket | `defaultSWRConfig` | Transaction created |
| `wallet-star-${id}` | Star pocket | `defaultSWRConfig` | Transaction created |
| `wallet-transactions-${id}` | Transaction list | `revalidateOnFocus: false` | Transaction created |
| `candidate-${id}` | Candidate info | `defaultSWRConfig` | Profile update |

---

## 6. UI State Machine

### 6.1 Page State Automaton

```
                    ┌─────────────────┐
                    │    loading      │
                    │   (initial)     │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   auth_check    │
                    └────────┬────────┘
                             │
               ┌─────────────┼─────────────┐
               │             │             │
               ▼             ▼             ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │ redirect │  │  owner   │  │redirect  │
        │ _login   │  │  _check  │  │_role     │
        └──────────┘  └────┬─────┘  └──────────┘
                           │
               ┌───────────┼───────────┐
               │           │           │
               ▼           ▼           ▼
        ┌──────────┐ ┌───────────┐ ┌──────────┐
        │redirect  │ │loading    │ │onboard   │
        │_own      │ │_data      │ │_check    │
        └──────────┘ └─────┬─────┘ └────┬─────┘
                           │            │
                           ▼            ▼
                    ┌──────────┐  ┌──────────────┐
                    │   ready  │  │redirect      │
                    └────┬─────┘  │_onboarding   │
                         │        └──────────────┘
                         ▼
                    ┌──────────┐
                    │  idle    │
                    └──────────┘
```

### 6.2 Page State Transition Table

| Current State | Event | Next State | Guard Condition | Side Effects |
|---------------|-------|------------|-----------------|--------------|
| `loading` | `INIT` | `auth_check` | - | Check session |
| `auth_check` | `AUTH_SUCCESS` | `owner_check` | `session.valid && roles.includes('candidate')` | - |
| `auth_check` | `AUTH_FAILED` | `redirect_login` | `!session.valid` | `redirect('/auth/login')` |
| `auth_check` | `WRONG_ROLE` | `redirect_role` | `!roles.includes('candidate')` | `redirect('/auth/select-role')` |
| `owner_check` | `IS_OWNER` | `onboard_check` | `params.id === user.uid` | - |
| `owner_check` | `NOT_OWNER` | `redirect_own` | `params.id !== user.uid` | `redirect('/candidates/${user.uid}/wallet')` |
| `onboard_check` | `IS_ONBOARDED` | `loading_data` | `isOnboarded === true` | Fetch wallet data |
| `onboard_check` | `NOT_ONBOARDED` | `redirect_onboarding` | `isOnboarded === false` | `redirect('/candidates/${id}/profile')` |
| `loading_data` | `DATA_SUCCESS` | `ready` | - | Set atoms |
| `loading_data` | `DATA_ERROR` | `error` | - | Show error state |
| `ready` | `TAB_CHANGE` | `ready` | - | Update URL |
| `ready` | `LOAD_MORE` | `loading_more` | `hasMore === true` | - |
| `loading_more` | `SUCCESS` | `ready` | - | Append transactions |
| `loading_more` | `ERROR` | `ready` | - | Toast error |
| `error` | `RETRY` | `loading_data` | - | Refetch |

### 6.3 Tab State Automaton

| Current Tab | Event | Next Tab | Guard | Side Effects |
|-------------|-------|----------|-------|--------------|
| `coins` | `CLICK_STARS` | `stars` | - | `router.push('?tab=stars')` |
| `stars` | `CLICK_COINS` | `coins` | - | `router.push('?tab=coins')` |

### 6.4 Transaction Loading State Machine

| Current State | Event | Next State | Guard | Side Effects |
|---------------|-------|------------|-------|--------------|
| `idle` | `LOAD_MORE_CLICK` | `loading` | `hasMore` | Fetch next page |
| `loading` | `SUCCESS` | `idle` | - | Append to list |
| `loading` | `ERROR` | `idle` | - | Toast error |
| `idle` | `END_REACHED` | `idle` | `!hasMore` | - |

---

## 7. Component-Action Wiring

### 7.1 Page Header

| Component | Purpose | Action |
|-----------|---------|--------|
| PageTitle | "กระเป๋าตังค์" | - |
| BackButton | Return to dashboard | → `/candidates/[id]` |

### 7.2 Balance Cards Section

| Component | Purpose | Condition |
|-----------|---------|-----------|
| CoinBalanceCard | Display coin balance | Always shown |
| CoinBalanceCard.Icon | 🪙 coin icon | - |
| CoinBalanceCard.Label | "เหรียญ" | - |
| CoinBalanceCard.Value | Formatted number | - |
| StarBalanceCard | Display star balance | Always shown |
| StarBalanceCard.Icon | ⭐ star icon | - |
| StarBalanceCard.Label | "ดาว" | - |
| StarBalanceCard.Value | Formatted number | Often 0 |

### 7.3 Ways to Earn Section

| Component | Purpose | Amount | Status Check |
|-----------|---------|--------|--------------|
| SectionTitle | "วิธีรับเหรียญเพิ่ม" | - | - |
| ViewAllLink | "ดูทั้งหมด →" | - | If > 4 ways |
| RewardCard.Signup | สมัครสมาชิก | 100 เหรียญ | Always claimed (user exists) |
| RewardCard.Referral | แนะนำเพื่อน | 100 เหรียญ/คน | Can earn multiple |
| RewardCard.FirstApp | สมัครงานครั้งแรก | 100 เหรียญ | `!isFirstApplicantionRewarded` |
| RewardCard.FirstInterview | สัมภาษณ์ครั้งแรก | 100 เหรียญ | `!isFirstInterviewerRewarded` |

### 7.4 Reward Card States

| State | Visual | Badge |
|-------|--------|-------|
| Available | Full opacity | - |
| Claimed | Muted, checkmark | "รับแล้ว" |
| In Progress | Normal | "อยู่ระหว่างดำเนินการ" |

### 7.5 Transaction History Section

| Component | Purpose | Condition |
|-----------|---------|-----------|
| SectionTitle | "ประวัติธุรกรรม" | - |
| CurrencyTabs | Coins/Stars filter | - |
| TransactionList | List of transactions | - |
| TransactionItem | Single transaction | - |
| TransactionItem.Icon | Origin icon | Based on `transactionOrigin` |
| TransactionItem.Label | Thai origin name | Mapped from code |
| TransactionItem.Amount | +/- amount | Green/Red based on type |
| TransactionItem.Date | Thai date | `DD MMM YY` format |
| TransactionItem.Remark | Optional note | If `remark` exists |
| LoadMoreButton | Load next page | `hasMore === true` |
| EndOfList | "ไม่มีรายการเพิ่มเติม" | `hasMore === false` |
| EmptyState | No transactions | `transactions.length === 0` |

### 7.6 Transaction Item Layout

```
┌─────────────────────────────────────────────────┐
│ 🎁 │ สมัครสมาชิก              │ +100 │ 10 ธ.ค. 67 │
├─────────────────────────────────────────────────┤
│ 👥 │ แนะนำเพื่อน (ได้รับ)      │ +100 │ 10 ธ.ค. 67 │
├─────────────────────────────────────────────────┤
│ 📝 │ สมัครงานครั้งแรก          │ +100 │ 10 ธ.ค. 67 │
└─────────────────────────────────────────────────┘
```

---

## 8. Error Handling

### 8.1 Error Scenarios

| Error | Display | Recovery Action |
|-------|---------|-----------------|
| Fetch balance failed | Error state with retry | Retry button |
| Fetch transactions failed | Toast + empty list | "ไม่สามารถโหลดประวัติได้" |
| Load more failed | Toast | "ไม่สามารถโหลดเพิ่มได้" |
| Network error | Error state | "ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่" |

### 8.2 Error State Component

```typescript
interface WalletErrorProps {
  message: string;
  onRetry: () => void;
}

// Display
<ErrorState 
  icon="wallet"
  message="ไม่สามารถโหลดข้อมูลกระเป๋าตังค์ได้"
  ctaLabel="ลองใหม่"
  onRetry={refetch}
/>
```

---

## 9. Empty States

### 9.1 Empty State Configurations

| Section | Message (Thai) | CTA | Condition |
|---------|----------------|-----|-----------|
| Transactions | ยังไม่มีธุรกรรม | - | `transactions.length === 0` |
| Ways to Earn | (All claimed) | ไปค้นหางาน | All rewards claimed |

### 9.2 Transaction Empty State

```typescript
<EmptyState
  icon="receipt"
  title="ยังไม่มีธุรกรรม"
  description="เมื่อคุณได้รับหรือใช้เหรียญ จะแสดงที่นี่"
/>
```

---

## 10. Implementation Checklist

### Phase 1: Balance Display + Ways to Earn
- [ ] Page layout with candidate shell
- [ ] Balance cards (coins + stars)
- [ ] Ways to earn section
- [ ] Reward card with claimed/available states
- [ ] Link from dashboard "รับเพิ่ม"
- [ ] Loading states

### Phase 2: Transaction History
- [ ] Transaction list component
- [ ] Pagination (load more button)
- [ ] Currency tab filter (coins/stars)
- [ ] Transaction item with icons
- [ ] Date formatting (Thai Buddhist year)
- [ ] Empty state

### Phase 3: Polish
- [ ] Animations (number count up)
- [ ] Skeleton loading
- [ ] Mobile responsive
- [ ] Keyboard navigation
- [ ] Analytics events
- [ ] E2E tests

---

## 11. Decisions Log

| Decision | Chosen | Alternatives | Rationale | Date |
|----------|--------|--------------|-----------|------|
| Show stars tab | Yes (even if 0) | Hide if 0 | Future-proof, consistent | 2025-12-10 |
| Transaction pagination | Load more button | Infinite scroll | Better control, less accidental loads | 2025-12-10 |
| Reward claim status | Show checkmark | Hide claimed | Users want to see progress | 2025-12-10 |
| Balance display | Both cards always | Tab switch | Quick overview | 2025-12-10 |
| Transaction detail | Inline | Click to expand | Simple enough inline | 2025-12-10 |
| Page location | `/candidates/[id]/wallet` | `/wallet` | Consistent with candidate routes | 2025-12-10 |

---

## Appendix A: TypeScript Types

```typescript
// Page component props
interface WalletPageProps {
  params: { id: string };
  searchParams: { tab?: string };
}

// Currency type
type Currency = 'coin' | 'star';

// Balance data
interface WalletBalance {
  coin: number;
  star: number;
}

// Pocket document
interface PocketDocument {
  uid: string;
  currency: Currency;
  balance: number;
  latest: string[];
  createdAt: number;
  updatedAt: number;
}

// Transaction document
interface WalletTransaction {
  uid: string;
  transactionOwner: string;
  transactionReceiver: string;
  transactionOrigin: TransactionOrigin;
  transactionType: 'deposit' | 'withdraw';
  transactionAmount: number;
  transactionCurrency: Currency;
  transactionTime: number;
  remark?: string;
  createdAt: number;
  updatedAt: number;
}

// Transaction origins
type TransactionOrigin = 
  | 'signup_reward'
  | 'referral_received'
  | 'referral_given'
  | 'first_application_reward'
  | 'first_interview_reward'
  | 'admin_deposit'
  | 'admin_withdraw'
  | 'onboarding'
  | 'register';

// Reward status
interface RewardStatus {
  signup: 'claimed';  // Always claimed if user exists
  referral: 'available';  // Can always earn more
  firstApplication: 'claimed' | 'available';
  firstInterview: 'claimed' | 'available';
}

// Ways to earn card
interface RewardCard {
  id: string;
  title: string;
  description: string;
  amount: number;
  icon: string;
  status: 'claimed' | 'available' | 'in_progress';
}

// Transaction list item for display
interface TransactionListItem {
  uid: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  currency: Currency;
  origin: TransactionOrigin;
  originDisplay: string;  // Thai display name
  originIcon: string;     // Emoji icon
  timestamp: number;
  remark?: string;
}

// Pagination
interface TransactionPagination {
  transactions: TransactionListItem[];
  hasMore: boolean;
  lastVisible?: string;  // Cursor for next page
}
```

---

## Appendix B: Hooks Implementation

```typescript
// Balance hook
export function useWalletBalance(userId: string) {
  const { data: coinPocket, isLoading: coinLoading } = useSWR(
    `wallet-coin-${userId}`,
    () => webPocketsGetById(userId, 'coin')
  );
  
  const { data: starPocket, isLoading: starLoading } = useSWR(
    `wallet-star-${userId}`,
    () => webPocketsGetById(userId, 'star')
  );
  
  return {
    coin: coinPocket?.balance ?? 0,
    star: starPocket?.balance ?? 0,
    isLoading: coinLoading || starLoading,
  };
}

// Transaction history hook with pagination
export function useTransactionHistory(
  userId: string, 
  currency: Currency,
  limit: number = 20
) {
  const [transactions, setTransactions] = useState<TransactionListItem[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [lastVisible, setLastVisible] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Initial fetch
  const { data, isLoading: initialLoading, mutate } = useSWR(
    `wallet-transactions-${userId}-${currency}`,
    () => fetchTransactions(userId, currency, limit)
  );
  
  // Load more function
  const loadMore = async () => {
    if (!hasMore || isLoading) return;
    
    setIsLoading(true);
    try {
      const moreData = await fetchTransactions(
        userId, 
        currency, 
        limit, 
        lastVisible
      );
      setTransactions(prev => [...prev, ...moreData.transactions]);
      setHasMore(moreData.hasMore);
      setLastVisible(moreData.lastVisible);
    } catch (error) {
      toast.error("ไม่สามารถโหลดเพิ่มได้");
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    transactions: data?.transactions ?? transactions,
    isLoading: initialLoading,
    isLoadingMore: isLoading,
    hasMore,
    loadMore,
    mutate,
  };
}

// Reward status hook
export function useRewardStatus(candidateId: string) {
  const { data: candidate } = useSWR(`candidate-${candidateId}`);
  
  return {
    signup: 'claimed' as const,  // Always claimed
    referral: 'available' as const,  // Can always earn more
    firstApplication: candidate?.isFirstApplicantionRewarded 
      ? 'claimed' : 'available',
    firstInterview: candidate?.isFirstInterviewerRewarded 
      ? 'claimed' : 'available',
  };
}
```

---

## Appendix C: Server Actions (Read-only)

```typescript
// Get pocket balance
export async function getPocketBalance(
  userId: string,
  currency: Currency
): Promise<PocketDocument | null>;

// Get transaction history
export async function getTransactionHistory(
  userId: string,
  currency: Currency,
  limit: number,
  startAfter?: string
): Promise<TransactionPagination>;

// No write operations - transactions created by system/admin
```

---

## Appendix D: Thai Label Reference

| Key | Thai | English |
|-----|------|---------|
| page_title | กระเป๋าตังค์ | Wallet |
| coins | เหรียญ | Coins |
| stars | ดาว | Stars |
| ways_to_earn | วิธีรับเหรียญเพิ่ม | Ways to Earn |
| view_all | ดูทั้งหมด | View All |
| transaction_history | ประวัติธุรกรรม | Transaction History |
| load_more | โหลดเพิ่มเติม | Load More |
| no_more | ไม่มีรายการเพิ่มเติม | No more items |
| empty_transactions | ยังไม่มีธุรกรรม | No transactions yet |
| claimed | รับแล้ว | Claimed |
| available | รับได้ | Available |
| signup_reward | สมัครสมาชิก | Signup Bonus |
| referral_reward | แนะนำเพื่อน | Referral Bonus |
| first_application | สมัครงานครั้งแรก | First Application |
| first_interview | สัมภาษณ์ครั้งแรก | First Interview |
| admin_deposit | ได้รับจากระบบ | System Deposit |
| admin_withdraw | หักจากระบบ | System Withdrawal |
| error_fetch | ไม่สามารถโหลดข้อมูลได้ | Could not load data |
| error_load_more | ไม่สามารถโหลดเพิ่มได้ | Could not load more |
| retry | ลองใหม่ | Retry |
| coins_unit | เหรียญ | coins |
| per_referral | ต่อคน | per person |

---

## Appendix E: Related Routes

| Route | RIS | Relationship |
|-------|-----|--------------|
| `/candidates/[id]` | CAND-R01 | Dashboard shows coin balance widget |
| `/candidates/[id]/profile` | CAND-R02 | Redirect if not onboarded |
| `/candidates/[id]/applications` | CAND-R04 | First application reward trigger |
| `/chat/[roomId]` | CHAT-R02 | First interview reward trigger |
| `/auth/register` | AUTH-R02 | Signup reward trigger |

---

## Appendix F: Reward Integration Points

### Reward Triggers

| Reward | Trigger Route | Server Action | Amount |
|--------|---------------|---------------|--------|
| Signup | AUTH-R02 | `grantSignupReward()` | 100 coins |
| Referral (new user) | AUTH-R02 | `grantReferralReward()` | 100 coins |
| Referral (referrer) | AUTH-R02 | `grantReferralReward()` | 100 coins |
| First Application | JOB-R02b | `grantFirstApplicationReward()` | 100 coins |
| First Interview | CHAT-R02 | `grantFirstInterviewReward()` | 100 coins |

### Reward Idempotency

| Reward | Check Field | One-time? |
|--------|-------------|-----------|
| Signup | Transaction exists | Yes |
| Referral | N/A | No (per referral) |
| First Application | `isFirstApplicantionRewarded` | Yes |
| First Interview | `isFirstInterviewerRewarded` | Yes |

---

## Appendix G: Analytics Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `wallet_page_view` | Page load | `{ coin_balance, star_balance }` |
| `wallet_tab_change` | Tab click | `{ from_currency, to_currency }` |
| `wallet_load_more` | Load more click | `{ page_number }` |
| `wallet_reward_card_click` | Reward card click | `{ reward_type, status }` |

---

## Appendix H: UI Layout Reference

```
┌─────────────────────────────────────────┐
│  กระเป๋าตังค์                            │
├─────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐     │
│  │ 🪙 เหรียญ     │  │ ⭐ ดาว       │     │
│  │    350       │  │    0         │     │
│  └──────────────┘  └──────────────┘     │
├─────────────────────────────────────────┤
│  วิธีรับเหรียญเพิ่ม  [ดูทั้งหมด →]         │
│  ┌─────────────────────────────────┐    │
│  │ 🎁 สมัครสมาชิก    ✓   100 เหรียญ │    │
│  │ 👥 แนะนำเพื่อน        100 เหรียญ │    │
│  │ 📝 สมัครงานครั้งแรก   100 เหรียญ │    │
│  │ 🎯 สัมภาษณ์ครั้งแรก   100 เหรียญ │    │
│  └─────────────────────────────────┘    │
├─────────────────────────────────────────┤
│  ประวัติธุรกรรม                          │
│  ┌──────────┐ ┌──────────┐              │
│  │ เหรียญ ▼ │ │  ดาว    │              │
│  └──────────┘ └──────────┘              │
│  ┌─────────────────────────────────┐    │
│  │ 🎁 สมัครสมาชิก   +100  10 ธ.ค. 67│    │
│  │ 👥 แนะนำเพื่อน   +100  10 ธ.ค. 67│    │
│  └─────────────────────────────────┘    │
│          [โหลดเพิ่มเติม]                  │
└─────────────────────────────────────────┘
```

---

*End of RIS: /candidates/[id]/wallet (WALLET-R01) v1.0*
