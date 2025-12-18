"use client";

import { useRef, useState } from "react";
import { User, Eye, Pencil, Upload } from "lucide-react";
import { FirebaseCandidateData } from "@/types/candidate.types";
import { useProfileCompletion } from "@/hooks/jobsmarket/use-profile-completion";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useFileUpload } from "@/hooks/jobsmarket/use-file-upload";
import { useToast } from "@/hooks/use-toast-notification";

interface ProfileHeaderProps {
  candidate: FirebaseCandidateData;
  onToggleSearchable: (value: boolean) => void;
  onOpenPreview: () => void;
  onPhotoUploaded: (url: string) => void;
}

/**
 * CAND-R02 Batch 4B: Profile Header (with Photo Upload)
 *
 * Displays avatar, name, completion percentage, searchable toggle, and preview button.
 * Features:
 * - Click avatar to upload profile photo
 * - Image validation (JPG, PNG, max 5MB)
 * - Progress feedback during upload
 */
export function ProfileHeader({
  candidate,
  onToggleSearchable,
  onOpenPreview,
  onPhotoUploaded,
}: ProfileHeaderProps) {
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadPhoto, validatePhoto } = useFileUpload();
  const { addToast } = useToast();

  const { percentage } = useProfileCompletion({
    uid: candidate.uid,
    first_name_th: candidate.firstnameTH,
    last_name_th: candidate.lastnameTH,
    phone_number: candidate.phone,
    email: candidate.email,
    avatar_url: candidate.resumePhotoURL,
    works: candidate.works,
    educations: candidate.educations,
    about_me: candidate.aboutMe,
    area_of_expertise: candidate.areaOfExpertise,
    is_preference_set: candidate.isPreferenceSet,
  });

  const fullName = candidate.firstnameTH && candidate.lastnameTH
    ? `${candidate.firstnameTH} ${candidate.lastnameTH}`
    : "ไม่ระบุชื่อ";

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validatePhoto(file);
    if (!validation.isValid) {
      addToast(validation.error || "ไฟล์ไม่ถูกต้อง", "error");
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const url = await uploadPhoto(candidate.uid, file);
      await onPhotoUploaded(url);
      addToast("อัปโหลดรูปโปรไฟล์สำเร็จ", "success");
    } catch (error) {
      console.error("Error uploading photo:", error);
      addToast("เกิดข้อผิดพลาดในการอัปโหลดรูปโปรไฟล์", "error");
    } finally {
      setIsUploadingPhoto(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="flex flex-col md:flex-row md:items-start gap-6">
        {/* Avatar */}
        <div className="relative group">
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {candidate.resumePhotoURL ? (
              <img
                src={candidate.resumePhotoURL}
                alt={fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-gray-400" />
            )}
            {isUploadingPhoto && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <button
            onClick={handleAvatarClick}
            disabled={isUploadingPhoto}
            className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all disabled:cursor-not-allowed"
          >
            {isUploadingPhoto ? (
              <Upload className="w-6 h-6 text-white animate-pulse" />
            ) : (
              <Pencil className="w-6 h-6 text-white" />
            )}
          </button>
        </div>

        {/* Name and Progress */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{fullName}</h1>

          {/* Completion Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                ความสมบูรณ์ของโปรไฟล์
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {Math.round(percentage)}%
              </span>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>

          {/* Searchable Toggle */}
          <div className="flex items-center gap-2 mb-4">
            <Switch
              checked={candidate.isSearchable}
              onCheckedChange={onToggleSearchable}
              id="searchable-toggle"
            />
            <label
              htmlFor="searchable-toggle"
              className="text-sm text-gray-700 cursor-pointer"
            >
              โปรไฟล์สามารถค้นหาได้
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={onOpenPreview}
              variant="outline"
              size="default"
              className="gap-2"
            >
              <Eye className="w-4 h-4" />
              ดูตัวอย่างโปรไฟล์
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
