/**
 * Preview Modal Component
 * CAND-R02 Batch 3E
 *
 * Full-screen modal showing read-only profile view with PDF export.
 */

"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import type { FirebaseCandidateData } from "@/types/candidate.types";
import { usePdfExport } from "@/lib/jobsmarket/hooks/use-pdf-export";

interface PreviewModalProps {
  /** Is modal open */
  open: boolean;
  /** Callback to close modal */
  onOpenChange: (open: boolean) => void;
  /** Candidate data to preview */
  candidate: FirebaseCandidateData;
}

/**
 * Preview Modal
 *
 * Shows read-only view of candidate profile with PDF export capability.
 */
export function PreviewModal({
  open,
  onOpenChange,
  candidate,
}: PreviewModalProps) {
  const candidateName = `${candidate.firstnameTH || ''} ${candidate.lastnameTH || ''}`.trim() || 'Resume';

  const { exportPdf, isGenerating } = usePdfExport({
    candidateId: candidate.uid,
    candidateName,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">ตัวอย่างโปรไฟล์</DialogTitle>
              <DialogDescription>
                ดูตัวอย่างโปรไฟล์ของคุณก่อนส่งออกเป็น PDF
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => exportPdf('template3')}
                disabled={isGenerating}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                {isGenerating ? 'กำลังสร้าง PDF...' : 'ดาวน์โหลด PDF'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Profile Preview Content */}
        <div className="mt-6 space-y-6">
          {/* Personal Information */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold border-b pb-2">ข้อมูลส่วนตัว</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">ชื่อ-นามสกุล:</span>{' '}
                <span>{candidate.firstnameTH} {candidate.lastnameTH}</span>
              </div>
              {candidate.nicknameTH && (
                <div>
                  <span className="font-medium">ชื่อเล่น:</span>{' '}
                  <span>{candidate.nicknameTH}</span>
                </div>
              )}
              <div>
                <span className="font-medium">อีเมล:</span>{' '}
                <span>{candidate.email}</span>
              </div>
              <div>
                <span className="font-medium">เบอร์โทรศัพท์:</span>{' '}
                <span>{candidate.phone}</span>
              </div>
              {candidate.birthdate && (
                <div>
                  <span className="font-medium">วันเกิด:</span>{' '}
                  <span>{new Date(candidate.birthdate * 1000).toLocaleDateString('th-TH')}</span>
                </div>
              )}
              {candidate.gender && (
                <div>
                  <span className="font-medium">เพศ:</span>{' '}
                  <span>{candidate.gender === 'male' ? 'ชาย' : 'หญิง'}</span>
                </div>
              )}
            </div>
          </section>

          {/* Work Experience */}
          {candidate.works && candidate.works.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-lg font-semibold border-b pb-2">ประสบการณ์ทำงาน</h3>
              <div className="space-y-4">
                {candidate.works.map((work, index) => (
                  <div key={index} className="text-sm">
                    <div className="font-medium">{work.jobTitle} ที่ {work.company}</div>
                    <div className="text-muted-foreground">
                      {work.startYear} - {work.isCurrent ? 'ปัจจุบัน' : work.endYear}
                    </div>
                    {work.note && <div className="mt-1">{work.note}</div>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {candidate.educations && candidate.educations.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-lg font-semibold border-b pb-2">ประวัติการศึกษา</h3>
              <div className="space-y-4">
                {candidate.educations.map((edu, index) => (
                  <div key={index} className="text-sm">
                    <div className="font-medium">{edu.educationLabel}</div>
                    <div>{edu.major} - {edu.institution}</div>
                    <div className="text-muted-foreground">
                      จบปี {edu.endYear}
                      {edu.gpax && ` | GPAX: ${edu.gpax}`}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Skills */}
          {candidate.skills && candidate.skills.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-lg font-semibold border-b pb-2">ทักษะ</h3>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm"
                  >
                    {skill.skillName}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Languages */}
          {candidate.languages && candidate.languages.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-lg font-semibold border-b pb-2">ภาษา</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {candidate.languages.map((lang, index) => (
                  <div key={index}>
                    <span className="font-medium">{lang.languageName}:</span>{' '}
                    <span>{lang.languageLevel}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* About Me */}
          {candidate.aboutMe && (
            <section className="space-y-3">
              <h3 className="text-lg font-semibold border-b pb-2">เกี่ยวกับตัวฉัน</h3>
              <p className="text-sm whitespace-pre-wrap">{candidate.aboutMe}</p>
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
