import Link from "next/link";
import { FileX, Filter, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

type EmptyStateType = "no-applications" | "no-results" | "error";

interface EmptyStateProps {
  type: EmptyStateType;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

const iconMap: Record<EmptyStateType, React.ReactNode> = {
  "no-applications": <FileX className="w-12 h-12" />,
  "no-results": <Filter className="w-12 h-12" />,
  error: <AlertCircle className="w-12 h-12" />,
};

const colorMap: Record<EmptyStateType, string> = {
  "no-applications": "text-gray-400",
  "no-results": "text-gray-400",
  error: "text-red-500",
};

/**
 * Empty State Component
 * Per CAND-R04 RIS §10
 *
 * Displays empty states for:
 * - No applications (new candidate)
 * - No results in filter (specific status has no applications)
 * - Error state (failed to load)
 */
export default function EmptyState({
  type,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Icon */}
      <div
        className={`mb-4 ${colorMap[type]}`}
        aria-hidden="true"
      >
        {iconMap[type]}
      </div>

      {/* Title */}
      <h3 className="text-lg font-medium text-gray-900 mb-2 text-center">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-gray-600 text-center max-w-sm mb-6">
          {description}
        </p>
      )}

      {/* Action Button */}
      {actionLabel && (actionHref || onAction) && (
        <>
          {actionHref ? (
            <Button asChild className="bg-secondary-900 hover:bg-secondary-800">
              <Link href={actionHref}>{actionLabel}</Link>
            </Button>
          ) : (
            <Button
              onClick={onAction}
              className="bg-secondary-900 hover:bg-secondary-800"
            >
              {actionLabel}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
