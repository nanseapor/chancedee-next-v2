"use client";

/**
 * Reward Card Component
 *
 * @specification WALLET-R01 §3.2.3
 * Displays a single reward opportunity in ways to earn section
 */

import { Check, Gift, Users, Briefcase, Award, Coins } from "lucide-react";
import { cn } from "@/lib/utils";

interface Reward {
  id: string;
  titleTh: string;
  titleEn: string;
  descriptionTh?: string;
  amount: number;
  claimed: boolean;
  available?: boolean;
}

interface RewardCardProps {
  reward: Reward;
}

// Icon mapping for reward types
const REWARD_ICONS: Record<string, React.ElementType> = {
  signup: Gift,
  first_interview: Award,
  first_application: Briefcase,
  referral: Users,
};

export function RewardCard({ reward }: RewardCardProps) {
  const {
    id,
    titleTh,
    titleEn,
    amount,
    claimed,
    available,
  } = reward;

  const Icon = REWARD_ICONS[id] || Coins;
  const isReferral = id === "referral";

  // Determine badge text and style
  let badgeText: string;
  let badgeStyle: string;

  if (claimed) {
    badgeText = "รับแล้ว";
    badgeStyle = "bg-green-100 text-green-700";
  } else if (available || isReferral) {
    badgeText = isReferral ? "รับได้" : "รอรับ";
    badgeStyle = "bg-amber-100 text-amber-700";
  } else {
    badgeText = "รอรับ";
    badgeStyle = "bg-amber-100 text-amber-700";
  }

  return (
    <div
      data-testid={`reward-card-${id}`}
      aria-label={`${titleTh} ${claimed ? "รับแล้ว" : "รอรับ"}`}
      className={cn(
        "flex items-center justify-between rounded-lg border p-4",
        claimed
          ? "border-gray-200 bg-gray-50 opacity-60"
          : "border-amber-200 bg-amber-50"
      )}
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div
          data-testid="reward-icon"
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            claimed
              ? "bg-gray-200 text-gray-500"
              : "bg-amber-200 text-amber-700"
          )}
        >
          {claimed ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
        </div>

        {/* Title and subtitle */}
        <div>
          <p className={cn(
            "font-medium",
            claimed ? "text-gray-600" : "text-gray-800"
          )}>
            {titleTh}
          </p>
          <p className="text-sm text-gray-500">{titleEn}</p>
          {isReferral && (
            <p className="text-xs text-gray-400 mt-1">
              รับ {amount} เหรียญต่อคน
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end gap-1">
        {/* Amount */}
        <div
          data-testid="reward-amount"
          className={cn(
            "text-lg font-semibold",
            claimed ? "text-gray-500" : "text-amber-700"
          )}
        >
          {claimed ? amount : `+${amount}`}
        </div>

        {/* Status badge */}
        <span
          data-testid="reward-status-badge"
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
            badgeStyle
          )}
        >
          {badgeText}
        </span>
      </div>
    </div>
  );
}
