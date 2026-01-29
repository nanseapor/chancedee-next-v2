"use client";

import { Pencil } from "lucide-react";
import { FirebaseCandidateData } from "@/types/candidate.types";
import { Button } from "@/components/ui/button";

interface PersonalInfoSectionProps {
  candidate: FirebaseCandidateData;
  onEdit: () => void;
}

// Helper component declared outside render to satisfy lint rules
function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-2">
      <dt className="text-sm font-medium text-gray-600 sm:w-40">{label}</dt>
      <dd className="text-sm text-gray-900">{value || "-"}</dd>
    </div>
  );
}

// Format birthdate helper
function formatBirthdate(timestamp?: number): string {
  if (!timestamp) return "-";
  const date = new Date(timestamp * 1000);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Calculate age helper
function calculateAge(timestamp?: number): string {
  if (!timestamp) return "-";
  const birthDate = new Date(timestamp * 1000);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return `${age} ปี`;
}

/**
 * CAND-R02 Batch 3C: Personal Info Section
 *
 * Read-only display of personal information with edit button.
 */
export function PersonalInfoSection({
  candidate,
  onEdit,
}: PersonalInfoSectionProps) {

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">ข้อมูลส่วนตัว</h2>
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

      {/* Personal Information */}
      <dl className="divide-y divide-gray-100">
        <InfoRow
          label="ชื่อ-นามสกุล (ไทย)"
          value={
            candidate.firstnameTH && candidate.lastnameTH
              ? `${candidate.firstnameTH} ${candidate.lastnameTH}`
              : undefined
          }
        />
        {candidate.nicknameTH && (
          <InfoRow label="ชื่อเล่น" value={candidate.nicknameTH} />
        )}
        <InfoRow label="อีเมล" value={candidate.email} />
        <InfoRow label="เบอร์โทรศัพท์" value={candidate.phone} />
        <InfoRow
          label="วันเกิด"
          value={
            candidate.birthdate
              ? `${formatBirthdate(candidate.birthdate)} (อายุ ${calculateAge(candidate.birthdate)})`
              : undefined
          }
        />
        {candidate.gender && (
          <InfoRow
            label="เพศ"
            value={candidate.gender === "male" ? "ชาย" : candidate.gender === "female" ? "หญิง" : candidate.gender}
          />
        )}
        {candidate.maritalStatus && (
          <InfoRow label="สถานภาพสมรส" value={candidate.maritalStatus} />
        )}
        <InfoRow
          label="ที่อยู่"
          value={
            [
              candidate.addressLine1,
              candidate.subDistrict,
              candidate.district,
              candidate.province,
              candidate.postCode,
            ]
              .filter(Boolean)
              .join(" ") || undefined
          }
        />
      </dl>
    </div>
  );
}
