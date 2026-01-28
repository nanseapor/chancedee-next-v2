"use client";

import Link from "next/link";
import { MessageSquare, Search, Briefcase, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ChatEmptyStateProps } from "@/types/chat.types";

/**
 * Empty state content configuration
 * Per CHAT-R01 RIS §3.4 Empty States
 */
const EMPTY_STATE_CONTENT = {
  candidate: {
    Icon: MessageSquare,
    title: "ยังไม่มีการสนทนา",
    description: "สมัครงานเพื่อเริ่มแชท",
    actionLabel: "ค้นหางาน",
    actionHref: "/jobsmarket/jobs",
  },
  company: {
    Icon: Users,
    title: "ยังไม่มีการสนทนา",
    description: "รอผู้สมัครติดต่อ",
    actionLabel: "ดูใบสมัคร",
    actionHref: "/jobsmarket/companies",
  },
  no_selected: {
    Icon: MessageSquare,
    title: "เลือกการสนทนาเพื่อเริ่มแชท",
    description: "",
    actionLabel: "",
    actionHref: "",
  },
  no_results: {
    Icon: Search,
    title: "ไม่พบการสนทนาที่ตรงกับ",
    description: "",
    actionLabel: "ล้างการค้นหา",
    actionHref: "",
  },
};

/**
 * ChatEmptyState Component
 *
 * Displays appropriate empty state based on context:
 * - candidate: No chats, prompt to apply for jobs
 * - company: No chats, prompt to wait for applicants
 * - no_selected: Desktop two-panel, no room selected
 * - no_results: Search returned no matches
 */
export function ChatEmptyState({
  type,
  searchQuery,
  onClearSearch,
  className,
}: ChatEmptyStateProps) {
  const content = EMPTY_STATE_CONTENT[type];
  const Icon = content.Icon;

  return (
    <div
      data-testid="chat-empty-state"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center min-h-[300px]",
        className
      )}
    >
      {/* Illustration */}
      <div
        data-testid="empty-illustration"
        className="mb-6 p-4 rounded-full bg-muted"
      >
        <Icon className="h-12 w-12 text-muted-foreground" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-medium text-foreground mb-2">
        {content.title}
        {type === "no_results" && searchQuery && (
          <span className="text-primary"> &quot;{searchQuery}&quot;</span>
        )}
      </h3>

      {/* Description */}
      {content.description && (
        <p className="text-sm text-muted-foreground mb-6 max-w-xs">
          {content.description}
        </p>
      )}

      {/* Action Button */}
      {type === "no_results" && onClearSearch ? (
        <Button variant="outline" onClick={onClearSearch}>
          ล้างการค้นหา
        </Button>
      ) : content.actionHref ? (
        <Button asChild variant="default">
          <Link href={content.actionHref}>
            <Briefcase className="mr-2 h-4 w-4" />
            {content.actionLabel}
          </Link>
        </Button>
      ) : null}
    </div>
  );
}
