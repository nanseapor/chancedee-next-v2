"use client";

import { Pencil, Award } from "lucide-react";
import { candidateSkills, candidateLanguages } from "@/types/candidate.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SkillsSectionProps {
  skills: candidateSkills[];
  languages: candidateLanguages[];
  onEdit: () => void;
}

/**
 * CAND-R02 Batch 3C: Skills Section
 *
 * Tags display of skills and languages with edit button.
 */
export function SkillsSection({
  skills,
  languages,
  onEdit,
}: SkillsSectionProps) {
  const hasContent = skills.length > 0 || languages.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">ทักษะและภาษา</h2>
        <Button
          onClick={onEdit}
          variant="ghost"
          size="default"
          className="text-secondary-600 hover:text-secondary-700 gap-2"
        >
          <Pencil className="w-4 h-4" />
          แก้ไข
        </Button>
      </div>

      {!hasContent ? (
        <div className="text-center py-8">
          <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 italic mb-2">ยังไม่มีทักษะ</p>
          <p className="text-sm text-gray-400">คลิกแก้ไขเพื่อเพิ่มทักษะและภาษา</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Skills */}
          {skills.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">ทักษะ</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="px-3 py-1.5 text-sm"
                  >
                    {skill.skillName}
                    {skill.expertiseLevel && (
                      <span className="ml-2 text-xs opacity-75">
                        ({skill.expertiseLevel})
                      </span>
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {languages.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">ภาษา</h3>
              <div className="space-y-2">
                {languages.map((language, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm font-medium text-gray-900">
                      {language.languageName}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">
                        {language.languageLevel}
                      </span>
                      {language.isCertified && language.languageCertifiedName && (
                        <Badge variant="outline" className="text-xs">
                          {language.languageCertifiedName}
                          {language.languageCertifiedScore && (
                            <span className="ml-1">
                              ({language.languageCertifiedScore})
                            </span>
                          )}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
