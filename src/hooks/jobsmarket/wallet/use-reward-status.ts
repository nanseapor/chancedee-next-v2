"use client";

/**
 * Hook for fetching reward status and ways to earn
 *
 * @specification WALLET-R01
 * @section §3.2.3 Ways to Earn
 *
 * Features:
 * - Checks claimed status for each reward type
 * - Provides reward amounts per BLS-10
 * - Returns all rewards in a summary array
 */

import { useState, useEffect, useCallback } from "react";
import { webCandidateInformationGetById } from "@/lib/database/actions/candidate-information";

interface RewardStatus {
  claimed: boolean;
  amount: number;
}

interface ReferralRewardStatus extends RewardStatus {
  available: boolean;
}

interface AllReward {
  id: string;
  titleTh: string;
  titleEn: string;
  amount: number;
  claimed: boolean;
}

interface UseRewardStatusReturn {
  firstInterviewReward: RewardStatus;
  firstApplicationReward: RewardStatus;
  signupReward: RewardStatus;
  referralReward: ReferralRewardStatus;
  allRewards: AllReward[];
  isLoading: boolean;
  error: Error | null;
}

// Reward amounts per BLS-10
const REWARD_AMOUNTS = {
  firstInterview: 100,
  firstApplication: 100,
  signup: 100,
  referral: 100,
};

/**
 * Hook to fetch and display reward status
 *
 * @param candidateId - The candidate ID to check rewards for, or null to skip
 * @returns Reward status data with loading/error states
 */
export function useRewardStatus(
  candidateId: string | null
): UseRewardStatusReturn {
  const [firstInterviewClaimed, setFirstInterviewClaimed] = useState(false);
  const [firstApplicationClaimed, setFirstApplicationClaimed] = useState(false);
  const [signupClaimed, setSignupClaimed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRewardStatus = useCallback(async () => {
    if (!candidateId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const candidateInfo = await webCandidateInformationGetById(candidateId);

      if (candidateInfo) {
        setFirstInterviewClaimed(
          candidateInfo.isFirstInterviewerRewarded ?? false
        );
        setFirstApplicationClaimed(
          candidateInfo.isFirstApplicantionRewarded ?? false
        );
        setSignupClaimed(candidateInfo.isOnboarded ?? false);
      }
    } catch (e) {
      const err =
        e instanceof Error ? e : new Error("Failed to fetch reward status");
      setError(err);
      // Reset to unclaimed on error
      setFirstInterviewClaimed(false);
      setFirstApplicationClaimed(false);
      setSignupClaimed(false);
    } finally {
      setIsLoading(false);
    }
  }, [candidateId]);

  useEffect(() => {
    fetchRewardStatus();
  }, [fetchRewardStatus]);

  // Build individual reward objects
  const firstInterviewReward: RewardStatus = {
    claimed: firstInterviewClaimed,
    amount: REWARD_AMOUNTS.firstInterview,
  };

  const firstApplicationReward: RewardStatus = {
    claimed: firstApplicationClaimed,
    amount: REWARD_AMOUNTS.firstApplication,
  };

  const signupReward: RewardStatus = {
    claimed: signupClaimed,
    amount: REWARD_AMOUNTS.signup,
  };

  const referralReward: ReferralRewardStatus = {
    claimed: false, // Referral can always be claimed (repeatable)
    available: true,
    amount: REWARD_AMOUNTS.referral,
  };

  // Build all rewards array for display
  const allRewards: AllReward[] = [
    {
      id: "first_interview",
      titleTh: "รางวัลสัมภาษณ์ครั้งแรก",
      titleEn: "First Interview Reward",
      amount: REWARD_AMOUNTS.firstInterview,
      claimed: firstInterviewClaimed,
    },
    {
      id: "first_application",
      titleTh: "รางวัลสมัครงานครั้งแรก",
      titleEn: "First Application Reward",
      amount: REWARD_AMOUNTS.firstApplication,
      claimed: firstApplicationClaimed,
    },
    {
      id: "signup",
      titleTh: "โบนัสสมัครสมาชิก",
      titleEn: "Signup Bonus",
      amount: REWARD_AMOUNTS.signup,
      claimed: signupClaimed,
    },
    {
      id: "referral",
      titleTh: "รางวัลแนะนำเพื่อน",
      titleEn: "Referral Reward",
      amount: REWARD_AMOUNTS.referral,
      claimed: false, // Repeatable reward
    },
  ];

  return {
    firstInterviewReward,
    firstApplicationReward,
    signupReward,
    referralReward,
    allRewards,
    isLoading,
    error,
  };
}
