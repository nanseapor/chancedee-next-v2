"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { ResumePreviewProps } from "@/types/resume";
import { Download, FileText, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export function ResumePreview({
  isOpen,
  onOpenChange,
  resumeData,
  generatedResume,
  onGenerateResume,
  isGenerating = false,
  error,
}: ResumePreviewProps) {
  // Force re-render when generatedResume changes to fix visibility issue
  const [forceUpdate, setForceUpdate] = useState(0);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [progressComplete, setProgressComplete] = useState(false);

  // Fix for the issue where resume needs to be closed once to show up
  useEffect(() => {
    if (generatedResume && isOpen) {
      // Force a re-render to ensure content is visible after state changes
      const timer = setTimeout(() => {
        setForceUpdate((prev) => prev + 1);
      }, 50); // Small delay to ensure state synchronization

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [generatedResume, isOpen]);

  // Manage loading overlay visibility
  useEffect(() => {
    if (isGenerating) {
      setShowLoadingOverlay(true);
      setProgressComplete(false);
      return undefined;
    } else {
      // Hide overlay when generation is complete
      const timer = setTimeout(() => {
        setShowLoadingOverlay(false);
        setProgressComplete(false);
      }, 500); // Small delay to show completion

      return () => clearTimeout(timer);
    }
  }, [isGenerating]);

  // Debug logging to help identify the issue
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("ResumePreview state:", {
        isOpen,
        hasGeneratedResume: !!generatedResume,
        generatedResumeId: generatedResume?.conversationId,
        forceUpdate,
        isGenerating,
        error: !!error,
      });
    }
  }, [isOpen, generatedResume, forceUpdate, isGenerating, error]);

  const handleDownloadHTML = () => {
    if (generatedResume?.htmlContent) {
      // Create a complete HTML document with print styles
      const fullHtmlContent = `
        <!DOCTYPE html>
        <html lang="th">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Resume - ${resumeData?.personalInfo?.name || "Resume"}</title>
            <style>
                body {
                    font-family: 'Arial', 'Helvetica', sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                    background: white;
                }
                h1, h2, h3 { 
                    color: #2c3e50; 
                    margin-top: 20px; 
                    page-break-after: avoid;
                }
                h1 { font-size: 28px; margin-bottom: 10px; }
                h2 { font-size: 22px; margin-bottom: 8px; }
                h3 { font-size: 18px; margin-bottom: 6px; }
                p { margin-bottom: 8px; }
                ul { margin-bottom: 12px; }
                li { margin-bottom: 4px; }
                .section { 
                    margin-bottom: 25px; 
                    page-break-inside: avoid;
                }
                @media print {
                    body { 
                        margin: 0; 
                        padding: 15mm; 
                        max-width: none;
                    }
                    .no-print { display: none; }
                    h1, h2, h3 { page-break-after: avoid; }
                    .section { page-break-inside: avoid; }
                }
                @page {
                    size: A4;
                    margin: 15mm;
                }
            </style>
        </head>
        <body>
            <div class="no-print" style="background: #f8f9fa; padding: 15px; margin-bottom: 20px; border-radius: 5px; border-left: 4px solid #007bff;">
                <strong>แนะนำการพิมพ์:</strong> กด Ctrl+P (หรือ Cmd+P บน Mac) เพื่อพิมพ์เป็น PDF หรือพิมพ์ออกมาเป็นกระดาษ
            </div>
            ${generatedResume.htmlContent}
        </body>
        </html>
      `;

      const blob = new Blob([fullHtmlContent], {
        type: "text/html;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resume-${generatedResume.templateUsed}-${new Date().toISOString().split("T")[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handlePrintResume = () => {
    if (!generatedResume?.htmlContent) return;

    // Create a new window with the resume content
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Resume - ${resumeData?.personalInfo?.name || "Resume"}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.4;
            color: #000;
            background-color: white;
            margin: 0;
            padding: 20px;
          }
          @media print {
            body { margin: 0; padding: 15mm; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        ${generatedResume.htmlContent}
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    // Add a small delay to ensure content is loaded
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="font-kanit">ตัวอย่าง Resume</SheetTitle>
          <SheetDescription>
            {generatedResume ? "Resume ที่สร้างขึ้นแล้ว" : "Resume ของคุณตามข้อมูลที่ให้มา"}
          </SheetDescription>
        </SheetHeader>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4 px-4">
          {onGenerateResume && (
            <Button
              onClick={onGenerateResume}
              disabled={isGenerating}
              className="flex-1"
            >
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileText className="mr-2 h-4 w-4" />
              )}
              {isGenerating ? "กำลังสร้าง..." : "สร้าง Resume"}
            </Button>
          )}
          {generatedResume && (
            <Button
              onClick={handleDownloadHTML}
              variant="default"
              className="flex-1"
              title="ดาวน์โหลด Resume เป็นไฟล์ HTML"
            >
              <Download className="mr-2 h-4 w-4" />
              ดาวน์โหลด HTML
            </Button>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-4 mt-4 p-3 border border-red-300 bg-red-50 text-red-700 rounded-md text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium">เกิดข้อผิดพลาด:</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        <ScrollArea className="h-[calc(100vh-200px)] mt-6">
          <div className="space-y-6 px-4 relative">
            {/* Loading Overlay */}
            <LoadingOverlay
              isVisible={showLoadingOverlay}
              title="กำลังสร้าง Resume..."
              description="AI กำลังวิเคราะห์ข้อมูลและสร้าง Resume ที่เหมาะสมให้คุณ"
              showProgress={true}
              progressDuration={90000} // 1:30 seconds
              onProgressComplete={() => setProgressComplete(true)}
            />
            {generatedResume ? (
              /* Generated Resume Preview */
              <div
                className={`transition-all duration-300 ${showLoadingOverlay ? "blur-sm opacity-50" : ""}`}
              >
                <div className="mb-4 p-3 border rounded-lg bg-muted">
                  <p className="text-sm font-medium">
                    Template: {generatedResume.templateName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    สร้างเมื่อ:{" "}
                    {new Date(generatedResume.generatedAt).toLocaleString(
                      "th-TH",
                    )}
                  </p>
                </div>
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: generatedResume.htmlContent,
                  }}
                />
              </div>
            ) : (
              /* Live Preview from Chat Data */
              <div
                className={`transition-all duration-300 ${showLoadingOverlay ? "blur-sm opacity-50" : ""}`}
              >
                {/* Personal Info */}
                {resumeData.personalInfo && (
                  <div>
                    <h2 className="font-kanit text-2xl font-bold text-foreground mb-2">
                      {resumeData.personalInfo.name || "ชื่อ-นามสกุล"}
                    </h2>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {resumeData.personalInfo.email && (
                        <p>📧 {resumeData.personalInfo.email}</p>
                      )}
                      {resumeData.personalInfo.phone && (
                        <p>📱 {resumeData.personalInfo.phone}</p>
                      )}
                      {resumeData.personalInfo.address && (
                        <p>📍 {resumeData.personalInfo.address}</p>
                      )}
                      {resumeData.personalInfo.position && (
                        <p>💼 {resumeData.personalInfo.position}</p>
                      )}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Summary */}
                {resumeData.summary && (
                  <div>
                    <h3 className="font-kanit text-lg font-semibold mb-2">
                      สรุปประวัติ
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {resumeData.summary}
                    </p>
                  </div>
                )}

                {/* Experience */}
                {resumeData.experience && resumeData.experience.length > 0 && (
                  <div>
                    <h3 className="font-kanit text-lg font-semibold mb-3">
                      ประสบการณ์การทำงาน
                    </h3>
                    <div className="space-y-4">
                      {resumeData.experience.map((exp, index) => (
                        <div
                          key={index}
                          className="border-l-2 border-primary pl-4"
                        >
                          <h4 className="font-medium text-foreground">
                            {exp.position}
                          </h4>
                          <p className="text-sm text-primary font-medium">
                            {exp.company}
                          </p>
                          <p className="text-xs text-muted-foreground mb-2">
                            {exp.startDate} - {exp.endDate || "ปัจจุบัน"}
                          </p>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {exp.description}
                          </p>
                          {exp.achievements && exp.achievements.length > 0 && (
                            <ul className="mt-2 text-sm text-muted-foreground list-disc list-inside">
                              {exp.achievements.map((achievement, i) => (
                                <li key={i}>{achievement}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {resumeData.education && resumeData.education.length > 0 && (
                  <div>
                    <h3 className="font-kanit text-lg font-semibold mb-3">
                      การศึกษา
                    </h3>
                    <div className="space-y-3">
                      {resumeData.education.map((edu, index) => (
                        <div key={index}>
                          <h4 className="font-medium text-foreground">
                            {edu.degree}
                          </h4>
                          <p className="text-sm text-primary">
                            {edu.institution}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {edu.field}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {edu.graduationDate}
                          </p>
                          {edu.gpa && (
                            <p className="text-xs text-muted-foreground">
                              GPA: {edu.gpa}
                            </p>
                          )}
                          {edu.honors && (
                            <p className="text-xs text-muted-foreground">
                              {edu.honors}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {resumeData.skills && resumeData.skills.length > 0 && (
                  <div>
                    <h3 className="font-kanit text-lg font-semibold mb-3">
                      ทักษะ
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {resumeData.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects */}
                {resumeData.projects && resumeData.projects.length > 0 && (
                  <div>
                    <h3 className="font-kanit text-lg font-semibold mb-3">
                      โครงการ
                    </h3>
                    <div className="space-y-4">
                      {resumeData.projects.map((project, index) => (
                        <div
                          key={index}
                          className="border-l-2 border-secondary pl-4"
                        >
                          <h4 className="font-medium text-foreground">
                            {project.name}
                          </h4>
                          <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                            {project.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {project.technologies.map((tech, i) => (
                              <Badge
                                key={i}
                                variant="outline"
                                className="text-xs"
                              >
                                {tech}
                              </Badge>
                            ))}
                          </div>
                          {project.url && (
                            <p className="text-xs text-primary">
                              🔗 {project.url}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {resumeData.certifications &&
                  resumeData.certifications.length > 0 && (
                    <div>
                      <h3 className="font-kanit text-lg font-semibold mb-3">
                        ใบรับรอง
                      </h3>
                      <div className="space-y-3">
                        {resumeData.certifications.map((cert, index) => (
                          <div key={index}>
                            <h4 className="font-medium text-foreground">
                              {cert.name}
                            </h4>
                            <p className="text-sm text-primary">
                              {cert.issuer}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {cert.date}
                            </p>
                            {cert.credentialId && (
                              <p className="text-xs text-muted-foreground">
                                ID: {cert.credentialId}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Languages */}
                {resumeData.languages && resumeData.languages.length > 0 && (
                  <div>
                    <h3 className="font-kanit text-lg font-semibold mb-3">
                      ภาษา
                    </h3>
                    <div className="space-y-2">
                      {resumeData.languages.map((lang, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center"
                        >
                          <span className="font-medium">{lang.language}</span>
                          <Badge variant="outline">{lang.proficiency}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {!resumeData.personalInfo &&
                  !resumeData.summary &&
                  !resumeData.experience &&
                  !resumeData.education &&
                  !resumeData.skills && (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">
                        เริ่มแชทเพื่อสร้าง Resume ของคุณ
                      </p>
                    </div>
                  )}
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
