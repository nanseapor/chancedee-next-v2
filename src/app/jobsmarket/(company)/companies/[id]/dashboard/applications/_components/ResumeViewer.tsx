/**
 * COMP-R08: Resume Viewer Component
 *
 * Phase 1 Decision: Download link only (no inline preview)
 * Displays download button for candidate's resume PDF.
 *
 * Per COMP-R08 Assessment SA Decision
 */

'use client';

import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';

export interface ResumeViewerProps {
  resumeUrl: string | null;
}

export function ResumeViewer({ resumeUrl }: ResumeViewerProps) {
  return (
    <div className="p-6 border-b border-gray-200 bg-white">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-5 w-5 text-secondary-600" />
        <h2 className="text-lg font-semibold text-gray-900 tracking-wide leading-snug">
          เรซูเม่
        </h2>
      </div>

      {!resumeUrl ? (
        <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500 tracking-wider">
            ผู้สมัครไม่ได้แนบไฟล์เรซูเม่
          </p>
        </div>
      ) : (
        <Button
          asChild
          variant="outline"
          className="w-full sm:w-auto border-secondary-500 text-secondary-700 hover:bg-secondary-50 tracking-widest"
        >
          <a
            href={resumeUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
          >
            <Download className="mr-2 h-4 w-4" />
            ดาวน์โหลดเรซูเม่
          </a>
        </Button>
      )}
    </div>
  );
}
