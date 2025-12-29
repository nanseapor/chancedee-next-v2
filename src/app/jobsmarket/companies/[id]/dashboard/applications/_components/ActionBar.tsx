/**
 * COMP-R08 Phase 4: Action Bar Component
 *
 * Displays Accept/Reject buttons for managing applications.
 * Implements status-based visibility rules and loading states.
 *
 * Per COMP-R08 RIS §3 (User Actions) and BLS-04 §5-6
 */

'use client';

import { Button } from '@/components/ui/button';
import type { ApplicationListItem } from '@/types/jobsmarket/applications.types';

export interface ActionBarProps {
  application: ApplicationListItem;
  onAccept: () => void;
  onReject: () => void;
  isAccepting: boolean;
  isRejecting: boolean;
  canManageApplications: boolean;
}

/**
 * Determine if Accept button should be shown
 * Per RIS: Show for 'applied' and 'read' statuses only
 */
function canAcceptApplication(status: string): boolean {
  const acceptableStatuses = ['applied', 'read'];
  return acceptableStatuses.includes(status);
}

/**
 * Determine if Reject button should be shown
 * Per RIS: Show for 'applied', 'read', and 'accepted' statuses
 */
function canRejectApplication(status: string): boolean {
  const rejectableStatuses = ['applied', 'read', 'accepted'];
  return rejectableStatuses.includes(status);
}

export function ActionBar({
  application,
  onAccept,
  onReject,
  isAccepting,
  isRejecting,
  canManageApplications,
}: ActionBarProps) {
  // Hide all buttons if user doesn't have permission
  if (!canManageApplications) {
    return null;
  }

  const showAcceptButton = canAcceptApplication(application.status);
  const showRejectButton = canRejectApplication(application.status);

  // If no buttons to show, don't render the action bar
  if (!showAcceptButton && !showRejectButton) {
    return null;
  }

  const isLoading = isAccepting || isRejecting;

  return (
    <div className="p-6 border-t border-gray-200 bg-white sticky bottom-0">
      <div className="flex items-center gap-3">
        {showAcceptButton && (
          <Button
            onClick={onAccept}
            disabled={isLoading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium tracking-widest"
          >
            {isAccepting ? 'กำลังดำเนินการ...' : 'ยอมรับ'}
          </Button>
        )}

        {showRejectButton && (
          <Button
            onClick={onReject}
            disabled={isLoading}
            variant="destructive"
            className="flex-1 font-medium tracking-widest"
          >
            ปฏิเสธ
          </Button>
        )}
      </div>
    </div>
  );
}
