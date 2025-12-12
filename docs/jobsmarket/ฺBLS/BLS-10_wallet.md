# BLS-10: Wallet Stage

**Stage:** Wallet  
**Version:** 1.0  
**Last Updated:** 2025-12-11  
**Actions Count:** 6

---

## Stage Overview

The Wallet Stage manages the platform's loyalty currency system. Candidates earn coins through platform activities (signup, referrals, milestones) and can view their balance and transaction history. This stage is primarily **read-only** for candidates—coin transactions are triggered automatically by other stages or manually by platform admins.

### Stage Boundaries

| Aspect | Scope |
|--------|-------|
| **Enters from** | Candidate Dashboard (coin widget), Registration (signup bonus) |
| **Triggered by** | BLS-01 (signup/referral), BLS-03 (first application), BLS-05 (first interview) |
| **Primary Actor** | Candidate (view), Platform Admin (deposit/withdraw) |
| **Data Sources** | `pockets` (by currency), `wallet_transactions` |

### Actions in This Stage

| Action ID | Action Name | Actor | Trigger | Primary Collection |
|-----------|-------------|-------|---------|-------------------|
| BLS-10-01 | viewWalletBalance | Candidate | Navigate to wallet | `pockets` |
| BLS-10-02 | viewTransactionHistory | Candidate | Wallet page | `wallet_transactions` |
| BLS-10-03 | awardSignupBonus | System | Registration complete | `wallet_transactions` |
| BLS-10-04 | awardReferralBonus | System | Referral code used | `wallet_transactions` |
| BLS-10-05 | awardMilestoneReward | System | First app/interview | `wallet_transactions` |
| BLS-10-06 | adminManageWallet | Platform Admin | Admin panel | `wallet_transactions` |

### Currency System

| Currency | Thai Name | Purpose | Earning Methods |
|----------|-----------|---------|-----------------|
| `coin` | เหรียญ | Primary loyalty currency | Signup, referral, milestones |
| `star` | ดาว | Premium currency (future) | Admin deposit only |

### Wallet Balance Lifecycle

```
[New User] ─── Signup ───► [100 coins]
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
         Referral      First App       First Interview
         +100 coins    +100 coins      +100 coins
              │               │               │
              └───────────────┴───────────────┘
                              │
                              ▼
                      [Current Balance]
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
        Admin Deposit                   Admin Withdraw
        +X coins                        -X coins (if balance >= X)
```

---

## BLS-10-01: viewWalletBalance

### Description
Display candidate's current wallet balance for coins and stars currencies.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| WALLET-R01_wallet_RIS.md | Section 4 | Wallet page spec |
| features_wallet.md | WALLET-001 | View Wallet Balance |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | User authenticated | `sessionStateAtom === 'valid'` | Redirect to login |
| 2 | Candidate role | `navBarAtom === 'candidate'` | Redirect |
| 3 | Owner | `params.id === user.uid` | Redirect to own wallet |
| 4 | Onboarded | `candidate.isOnboarded === true` | Redirect to onboarding |

### Inputs
| Field | Type | Required | Validation | Default | Source |
|-------|------|----------|------------|---------|--------|
| userId | string | Yes | Valid user ID | - | URL param |
| currency | string | No | 'coin' \| 'star' | 'coin' | Query param `?tab=` |

### State Changes

**SWR Cache (Read-only):**
| Key Pattern | Data Shape | Config |
|-------------|------------|--------|
| `wallet-coin-${userId}` | `PocketDocument` | `refreshInterval: 60000` |
| `wallet-star-${userId}` | `PocketDocument` | `refreshInterval: 60000` |

### Server Action
```typescript
interface PocketDocument {
  uid: string;
  currency: 'coin' | 'star';
  balance: number;
  latest: string[];  // Last 10 transaction IDs
  createdAt: number;
  updatedAt: number;
}

async function getPocketBalance(
  userId: string,
  currency: 'coin' | 'star'
): Promise<PocketDocument | null>;
```

### UI Feedback
| Scenario | Feedback Type | Display |
|----------|---------------|---------|
| Loading | Skeleton | Balance card placeholder |
| Success | Balance display | Large number with currency icon |
| No wallet | Default zero | Show 0 balance |
| Error | Toast + retry | "ไม่สามารถโหลดข้อมูลได้" |

### Display Format
| Element | Format | Example |
|---------|--------|---------|
| Coin balance | Number with comma | 1,350 |
| Star balance | Number with comma | 0 |
| Currency icon | Emoji | 🪙 (coin), ⭐ (star) |

---

## BLS-10-02: viewTransactionHistory

### Description
Display paginated transaction history for a candidate's wallet showing all deposits and withdrawals.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| WALLET-R01_wallet_RIS.md | Section 4.3 | Transaction history |
| features_wallet.md | WALLET-002 | View Transaction History |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | User authenticated | Session valid | Redirect |
| 2 | Owner | `params.id === user.uid` | Access denied |

### Inputs
| Field | Type | Required | Validation | Default | Source |
|-------|------|----------|------------|---------|--------|
| userId | string | Yes | Valid user ID | - | URL param |
| currency | string | No | 'coin' \| 'star' | 'coin' | Tab selection |
| limit | number | No | 1-100 | 20 | Pagination |
| startAfter | string | No | Transaction ID | null | Cursor |

### State Changes

**SWR Cache (Read-only):**
| Key Pattern | Data Shape | Config |
|-------------|------------|--------|
| `wallet-transactions-${userId}-${currency}` | `TransactionPage` | Standard |

### Server Action
```typescript
interface WalletTransaction {
  uid: string;
  transactionOwner: string;      // 'chancedee' or admin user ID
  transactionReceiver: string;   // User ID
  transactionOrigin: TransactionOrigin;
  transactionType: 'deposit' | 'withdraw';
  transactionAmount: number;     // Always positive
  transactionCurrency: 'coin' | 'star';
  transactionTime: number;
  remark?: string;
}

interface TransactionPage {
  transactions: WalletTransaction[];
  hasMore: boolean;
  lastVisible: string | null;
}

async function getTransactionHistory(
  userId: string,
  currency: 'coin' | 'star',
  limit: number,
  startAfter?: string
): Promise<TransactionPage>;
```

### Transaction Origin Mapping
| Origin Code | Thai Display | Icon | Type |
|-------------|--------------|------|------|
| `signup_reward` | สมัครสมาชิก | 🎁 | deposit |
| `onboarding` | โบนัสลงทะเบียน | 🎁 | deposit |
| `register` | โบนัสลงทะเบียน | 🎁 | deposit |
| `referral_received` | แนะนำเพื่อน (ได้รับ) | 👥 | deposit |
| `referral_given` | แนะนำเพื่อน (ให้) | 👥 | deposit |
| `first_application_reward` | สมัครงานครั้งแรก | 📝 | deposit |
| `first_interview_reward` | สัมภาษณ์ครั้งแรก | 🎯 | deposit |
| `admin_deposit` | ได้รับจากระบบ | ⚙️ | deposit |
| `admin_withdraw` | หักจากระบบ | ⚙️ | withdraw |

### UI Feedback
| Scenario | Feedback Type | Display |
|----------|---------------|---------|
| Loading | Skeleton list | Transaction row placeholders |
| Empty | Empty state | "ยังไม่มีธุรกรรม" |
| Load more | Button loading | Spinner |
| No more | Text | "ไม่มีรายการเพิ่มเติม" |
| Error | Toast | "ไม่สามารถโหลดเพิ่มได้" |

### Transaction Row Display
| Element | Format | Example |
|---------|--------|---------|
| Icon | Origin-based emoji | 🎁 |
| Title | Thai origin name | สมัครสมาชิก |
| Amount | +/- with color | +100 (green) / -50 (red) |
| Date | Thai format | 10 ธ.ค. 67 |
| Remark | Secondary text | Optional note |

---

## BLS-10-03: awardSignupBonus

### Description
Automatically award 100 coins when a new candidate completes registration. System-triggered action.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| features_wallet.md | WALLET-004 | Award Signup Bonus |

### Trigger
| Source Stage | Source Action | Condition |
|--------------|---------------|-----------|
| BLS-01 Onboarding | register | Registration successful |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | New user | Just registered | Skip (not new) |
| 2 | No existing bonus | No signup transaction exists | Skip (already awarded) |

### State Changes

**Firestore:**
| Operation | Collection | Document ID | Fields | Condition |
|-----------|------------|-------------|--------|-----------|
| Create | `pockets/coin` | userId | `balance: 100`, `currency: 'coin'` | If wallet doesn't exist |
| Update | `pockets/coin` | userId | `balance: balance + 100` | If wallet exists |
| Create | `wallet_transactions` | Auto | See below | Always |

**Transaction Document:**
```typescript
{
  transactionOwner: 'chancedee',
  transactionReceiver: userId,
  transactionOrigin: 'signup_reward',
  transactionType: 'deposit',
  transactionAmount: 100,
  transactionCurrency: 'coin',
  transactionTime: Date.now(),
  remark: 'โบนัสสมัครสมาชิก'
}
```

### Server Action
```typescript
async function awardSignupBonus(userId: string): Promise<ActionResult>;

// Called internally by registration flow
// Returns success even if already awarded (idempotent)
```

### Side Effects
| Effect | Target | Description |
|--------|--------|-------------|
| Initialize wallet | `pockets/coin` | Create if not exists |
| Update balance | `pockets/coin` | Add 100 coins |
| Create transaction | `wallet_transactions` | Audit record |
| Update latest | `pockets/coin.latest` | Add transaction ID |

---

## BLS-10-04: awardReferralBonus

### Description
Award 100 coins to both the new user (who used a referral code) and the referrer (whose code was used).

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| features_wallet.md | WALLET-005, WALLET-006 | Referral bonuses |
| features_candidates.md | CAND-014 | Referral system |

### Trigger
| Source Stage | Source Action | Condition |
|--------------|---------------|-----------|
| BLS-01 Onboarding | register | Valid referral code provided |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | Referral code valid | Code exists in system | Skip referral bonus |
| 2 | Referrer exists | User with code found | Skip referral bonus |
| 3 | Not self-referral | referrerId !== newUserId | Skip referral bonus |

### State Changes

**For New User (receiver):**
| Operation | Collection | Document ID | Fields |
|-----------|------------|-------------|--------|
| Update | `pockets/coin` | newUserId | `balance: balance + 100` |
| Create | `wallet_transactions` | Auto | `origin: 'referral_received'` |
| Update | `candidate_information` | newUserId | `referBy: referralCode` |

**For Referrer (giver):**
| Operation | Collection | Document ID | Fields |
|-----------|------------|-------------|--------|
| Update | `pockets/coin` | referrerId | `balance: balance + 100` |
| Create | `wallet_transactions` | Auto | `origin: 'referral_given'` |
| Update | `candidate_information` | referrerId | `referredList: arrayUnion(newUserId)` |

### Server Action
```typescript
async function awardReferralBonus(
  newUserId: string,
  referralCode: string
): Promise<ActionResult>;

// Awards 100 coins to BOTH users
// Updates candidate_information for tracking
```

### Transaction Documents
```typescript
// For new user
{
  transactionOrigin: 'referral_received',
  transactionAmount: 100,
  remark: 'โบนัสจากรหัสแนะนำ'
}

// For referrer
{
  transactionOrigin: 'referral_given',
  transactionAmount: 100,
  remark: `แนะนำสมาชิกใหม่ ${newUserName}`
}
```

---

## BLS-10-05: awardMilestoneReward

### Description
Award 100 coins for first-time milestones: first application accepted, first interview confirmed. One-time rewards tracked by boolean flags.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| features_wallet.md | WALLET-007, WALLET-008 | Milestone rewards |

### Milestone Types

**First Application Reward:**
| Property | Value |
|----------|-------|
| Trigger Stage | BLS-04 Screening |
| Trigger Action | acceptApplication |
| Condition | Application accepted AND `isFirstApplicantionRewarded === false` |
| Flag Field | `candidate_information.isFirstApplicantionRewarded` |
| Origin | `first_application_reward` |

**First Interview Reward:**
| Property | Value |
|----------|-------|
| Trigger Stage | BLS-05 Interview |
| Trigger Action | confirmInterview |
| Condition | Interview confirmed AND `isFirstInterviewerRewarded === false` |
| Flag Field | `candidate_information.isFirstInterviewerRewarded` |
| Origin | `first_interview_reward` |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | Milestone achieved | Application accepted OR interview confirmed | No action |
| 2 | First time | Flag is false | Skip (already rewarded) |

### State Changes

**Firestore:**
| Operation | Collection | Document ID | Fields | Condition |
|-----------|------------|-------------|--------|-----------|
| Update | `pockets/coin` | candidateId | `balance: balance + 100` | First time |
| Create | `wallet_transactions` | Auto | Milestone transaction | First time |
| Update | `candidate_information` | candidateId | `is[Milestone]Rewarded: true` | First time |

### Server Actions
```typescript
// Called by BLS-04 acceptApplication
async function awardFirstApplicationReward(candidateId: string): Promise<ActionResult>;

// Called by BLS-05 confirmInterview  
async function awardFirstInterviewReward(candidateId: string): Promise<ActionResult>;

// Both are idempotent - check flag before awarding
```

### Idempotency Check
```typescript
async function awardFirstApplicationReward(candidateId: string) {
  const candidate = await getCandidate(candidateId);
  
  // Guard: Already rewarded
  if (candidate.isFirstApplicantionRewarded) {
    return { success: true, alreadyAwarded: true };
  }
  
  // Award and set flag atomically
  await runTransaction(async (t) => {
    // Update balance
    // Create transaction
    // Set flag to true
  });
  
  return { success: true };
}
```

---

## BLS-10-06: adminManageWallet

### Description
Platform admin can deposit or withdraw coins from any user's wallet. Provides full audit trail.

### Source Documents
| Document | Section | Purpose |
|----------|---------|---------|
| features_wallet.md | WALLET-010, WALLET-011 | Admin deposit/withdraw |

### Preconditions
| # | Condition | Check | Failure Behavior |
|---|-----------|-------|------------------|
| 1 | Admin authenticated | Session valid | Redirect |
| 2 | Platform admin role | `role === 'chancedee'` | Access denied |
| 3 | Target user exists | User account found | Error toast |
| 4 | Sufficient balance (withdraw) | `balance >= amount` | Error "ยอดเงินไม่เพียงพอ" |

### Admin Route
**Route:** `/platform/loyalty/coin-system`

### Inputs
| Field | Type | Required | Validation | Source |
|-------|------|----------|------------|--------|
| targetUserId | string | Yes | Valid user ID | Search result |
| action | string | Yes | 'deposit' \| 'withdraw' | Button click |
| amount | number | Yes | > 0 | Form input |
| currency | string | Yes | 'coin' \| 'star' | Tab selection |
| remark | string | No | Max 500 chars | Form input |

### State Changes

**Deposit:**
| Operation | Collection | Document ID | Fields |
|-----------|------------|-------------|--------|
| Update | `pockets/{currency}` | targetUserId | `balance: balance + amount` |
| Create | `wallet_transactions` | Auto | `origin: 'admin_deposit'` |

**Withdraw:**
| Operation | Collection | Document ID | Fields |
|-----------|------------|-------------|--------|
| Update | `pockets/{currency}` | targetUserId | `balance: balance - amount` |
| Create | `wallet_transactions` | Auto | `origin: 'admin_withdraw'` |

### Server Actions
```typescript
async function adminDepositCoins(
  targetUserId: string,
  amount: number,
  currency: 'coin' | 'star',
  remark?: string
): Promise<ActionResult>;

async function adminWithdrawCoins(
  targetUserId: string,
  amount: number,
  currency: 'coin' | 'star',
  remark?: string
): Promise<ActionResult>;
```

### UI Feedback
| Scenario | Feedback Type | Display |
|----------|---------------|---------|
| Depositing | Button loading | Spinner |
| Deposit success | Toast + update | "เพิ่ม {amount} เหรียญสำเร็จ" |
| Withdrawing | Button loading | Spinner |
| Withdraw success | Toast + update | "หัก {amount} เหรียญสำเร็จ" |
| Insufficient balance | Error toast | "ยอดเงินไม่เพียงพอ" |
| User not found | Error toast | "ไม่พบผู้ใช้" |

---

## Reward Status Display

### Ways to Earn Section

| Reward | Amount | Status Logic | Display |
|--------|--------|--------------|---------|
| Signup Bonus | 100 coins | Always claimed after signup | ✓ รับแล้ว |
| Referral | 100 coins/person | Always available | รับได้ |
| First Application | 100 coins | Check `isFirstApplicantionRewarded` | ✓ รับแล้ว / รับได้ |
| First Interview | 100 coins | Check `isFirstInterviewerRewarded` | ✓ รับแล้ว / รับได้ |

### Reward Status Hook
```typescript
function useRewardStatus(candidateId: string) {
  const { data: candidate } = useSWR(`candidate-${candidateId}`);
  
  return {
    signup: 'claimed',  // Always claimed for existing users
    referral: 'available',  // Can always earn more
    firstApplication: candidate?.isFirstApplicantionRewarded 
      ? 'claimed' : 'available',
    firstInterview: candidate?.isFirstInterviewerRewarded 
      ? 'claimed' : 'available',
  };
}
```

---

## Stage Integration Points

### Entry Points (from other stages)
| Source Stage | Source Action | Entry Action | Trigger |
|--------------|---------------|--------------|---------|
| BLS-08 Candidate Profile | Dashboard | viewWalletBalance | Coin widget click |

### Trigger Points (other stages trigger wallet actions)
| Source Stage | Source Action | Wallet Action | Condition |
|--------------|---------------|---------------|-----------|
| BLS-01 Onboarding | register | awardSignupBonus | Always |
| BLS-01 Onboarding | register | awardReferralBonus | If referral code used |
| BLS-04 Screening | acceptApplication | awardMilestoneReward (app) | First acceptance |
| BLS-05 Interview | confirmInterview | awardMilestoneReward (interview) | First confirmation |

### Cross-Stage Dependencies
| This Stage Action | Affects Stage | Effect |
|-------------------|---------------|--------|
| awardSignupBonus | BLS-01 | Part of registration flow |
| awardMilestoneReward | BLS-04, BLS-05 | Triggered by screening/interview |

---

## Permissions Matrix

| Action | Candidate (Owner) | Candidate (Other) | Company | Platform Admin |
|--------|-------------------|-------------------|---------|----------------|
| viewWalletBalance | ✓ | ✗ | ✗ | ✓ (via admin panel) |
| viewTransactionHistory | ✓ | ✗ | ✗ | ✓ (via admin panel) |
| awardSignupBonus | System | System | ✗ | System |
| awardReferralBonus | System | System | ✗ | System |
| awardMilestoneReward | System | System | ✗ | System |
| adminManageWallet | ✗ | ✗ | ✗ | ✓ |

---

## Collection Structure

### Pocket Collections
```
pockets/
├── coin/
│   ├── {userId1}: { balance: 350, currency: 'coin', latest: [...] }
│   ├── {userId2}: { balance: 100, currency: 'coin', latest: [...] }
│   └── ...
└── star/
    ├── {userId1}: { balance: 0, currency: 'star', latest: [...] }
    └── ...
```

### Transaction Collection
```
wallet_transactions/
├── {txId1}: { receiver: userId1, origin: 'signup_reward', amount: 100, ... }
├── {txId2}: { receiver: userId1, origin: 'referral_received', amount: 100, ... }
└── ...
```

---

## Related Documents

| Document | Relationship |
|----------|--------------|
| WALLET-R01_wallet_RIS.md | Wallet page specification |
| features_wallet.md | Wallet feature definitions (WALLET-001 to WALLET-014) |
| data-entities_pockets.md | Pocket schema |
| data-entities_wallet-transactions.md | Transaction schema |
| CAND-R01_dashboard_RIS.md | Dashboard coin widget |
| BLS-01_onboarding.md | Triggers signup/referral bonus |
| BLS-04_screening.md | Triggers first application reward |
| BLS-05_interview.md | Triggers first interview reward |
| BLS-12_admin.md | Admin wallet management |

---

*End of BLS-10 Wallet Stage*
