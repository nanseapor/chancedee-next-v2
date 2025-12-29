/**
 * COMP-R08: Match Score Breakdown Component
 *
 * Displays detailed breakdown of candidate match score:
 * - Total score
 * - Skill match percentage with progress bar
 * - Experience match percentage with progress bar
 * - Education match percentage with progress bar
 * - Salary match percentage with progress bar
 *
 * Shows "N/A" if score is null (per SA decision - Phase 2+ for AI matching)
 *
 * Per COMP-R08 RIS §4.3 (Match Breakdown)
 */

'use client';

import type { MatchBreakdown } from '@/types/jobsmarket/applications.types';

export interface MatchScoreBreakdownProps {
  score: MatchBreakdown | null;
}

/**
 * Progress bar component for score visualization
 */
function ScoreBar({ label, score }: { label: string; score: number }) {
  // Determine color based on score
  const getColor = (s: number) => {
    if (s >= 80) return 'bg-green-500';
    if (s >= 60) return 'bg-amber-500';
    return 'bg-gray-400';
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-700 tracking-wider">{label}</span>
        <span className="text-gray-900 font-medium tracking-widest">{score}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${getColor(score)} transition-all duration-300`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export function MatchScoreBreakdown({ score }: MatchScoreBreakdownProps) {
  // No score available - show N/A state
  if (!score) {
    return (
      <div className="p-6 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-gray-900 tracking-wide leading-snug mb-3">
          คะแนนความเหมาะสม
        </h2>
        <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500 tracking-wider">
            ไม่มีข้อมูลคะแนนความเหมาะสม
          </p>
        </div>
      </div>
    );
  }

  // Score available - show breakdown
  return (
    <div className="p-6 border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 tracking-wide leading-snug">
          คะแนนความเหมาะสม
        </h2>
        <span className="text-2xl font-semibold text-secondary-700 tracking-wide">
          {score.total}%
        </span>
      </div>

      <div className="space-y-4">
        <ScoreBar label="ทักษะ" score={score.skillMatch} />
        <ScoreBar label="ประสบการณ์" score={score.experienceMatch} />
        <ScoreBar label="การศึกษา" score={score.educationMatch} />
        <ScoreBar label="เงินเดือน" score={score.salaryMatch} />
      </div>
    </div>
  );
}
