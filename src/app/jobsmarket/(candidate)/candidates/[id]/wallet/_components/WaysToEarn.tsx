"use client";

/**
 * Ways to Earn Component
 *
 * @specification WALLET-R01 §3.2.3
 * Displays all reward opportunities and their status
 */

import { RewardCard } from "./RewardCard";

interface Reward {
  id: string;
  titleTh: string;
  titleEn: string;
  descriptionTh?: string;
  amount: number;
  claimed: boolean;
  available?: boolean;
}

interface WaysToEarnProps {
  rewards: Reward[];
  isLoading: boolean;
}

export function WaysToEarn({ rewards, isLoading }: WaysToEarnProps) {
  // Loading skeleton
  if (isLoading) {
    return (
      <div data-testid="ways-to-earn" className="mt-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          วิธีหาเหรียญ
        </h2>
        <div
          data-testid="ways-to-earn-skeleton"
          className="space-y-3"
        >
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 animate-pulse"
            >
              <div className="h-10 w-10 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/2 rounded bg-gray-200" />
                <div className="h-3 w-1/3 rounded bg-gray-200" />
              </div>
              <div className="h-6 w-16 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div data-testid="ways-to-earn" className="mt-6">
      <h2 role="heading" className="text-lg font-semibold text-gray-800 mb-4">
        วิธีหาเหรียญ
      </h2>
      <div
        data-testid="ways-to-earn-section"
        className="space-y-3"
      >
        {rewards.map((reward) => (
          <RewardCard key={reward.id} reward={reward} />
        ))}
      </div>
    </div>
  );
}
