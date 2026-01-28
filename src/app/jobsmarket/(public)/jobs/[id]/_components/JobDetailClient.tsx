'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { sessionStateAtom } from '@/store/jobsmarket/global-atoms';
import { userAtom } from '@/store/atom-store';
import { useSaveJobMutation } from '@/hooks/jobsmarket/useSaveJobMutation';
import { LoginPromptModal } from '@/components/jobsmarket/jobs/LoginPromptModal';
import { JobDetailSidebar } from './JobDetailSidebar';
import { SaveJobButton } from '@/components/jobsmarket/jobs/SaveJobButton';
import type { JobDetailData } from '@/types/public-jobs';

interface JobDetailClientProps {
  job: JobDetailData;
  children: React.ReactNode; // Static content from server
  autoApply?: boolean; // Deep link: ?apply=true
  referrer?: string; // Track where user came from
}

/**
 * Job Detail Client Component
 *
 * Handles client-side interactivity:
 * - Save/unsave job functionality
 * - Login prompt modal for guests
 * - Profile completion state (placeholder for now - to be integrated with real profile fetch)
 * - Sidebar with apply section and company info
 * - Deep link support: auto-scroll to apply section when ?apply=true
 */
export function JobDetailClient({
  job,
  children,
  autoApply = false,
  referrer,
}: JobDetailClientProps) {
  const sessionState = useAtomValue(sessionStateAtom);
  const user = useAtomValue(userAtom);
  const isAuthenticated = Boolean(sessionState === 'authenticated' && user);

  // Ref for apply section auto-scroll
  const applySectionRef = useRef<HTMLDivElement>(null);

  // Login prompt state
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loginPromptAction, setLoginPromptAction] = useState<'save' | 'apply'>('save');

  // Save mutation
  const { toggleSave, isJobSaved, isSaving } = useSaveJobMutation([], {
    onAuthRequired: () => {
      setLoginPromptAction('save');
      setShowLoginPrompt(true);
    },
  });

  // Handle apply click for guests
  const handleApplyAuth = useCallback(() => {
    setLoginPromptAction('apply');
    setShowLoginPrompt(true);
  }, []);

  // Auto-scroll to apply section on deep link
  useEffect(() => {
    if (autoApply && applySectionRef.current) {
      applySectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [autoApply]);

  // TODO: Fetch actual profile completion from candidate profile
  // For now, using placeholder value
  const profileCompletion = 0;

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Save button in header area */}
          <div className="flex justify-end">
            <SaveJobButton
              jobId={job.uid}
              isSaved={isJobSaved(job.uid)}
              onToggle={() => toggleSave(job.uid)}
              variant="button"
              disabled={isSaving}
            />
          </div>

          {children}
        </div>

        {/* Sidebar - with ref for auto-scroll */}
        <div className="lg:col-span-1" ref={applySectionRef}>
          <JobDetailSidebar
            job={job}
            isAuthenticated={isAuthenticated}
            profileCompletion={profileCompletion}
            onApplyAuth={handleApplyAuth}
          />
        </div>
      </div>

      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        action={loginPromptAction}
        returnUrl={`/jobs/${job.uid}`}
      />
    </>
  );
}
