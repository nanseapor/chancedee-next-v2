"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  type CompanyRole,
  ROLE_LABELS,
} from "@/types/jobsmarket/company/roles";

export interface RolePickerModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Member to change role for */
  member: {
    uid: string;
    displayName: string;
    role: CompanyRole;
  };
  /** Handler for confirm action */
  onConfirm: (userId: string, newRole: CompanyRole) => void;
  /** Handler for close action */
  onClose: () => void;
  /** Loading state */
  isLoading?: boolean;
}

const AVAILABLE_ROLES: CompanyRole[] = [
  "admin",
  "hr_manager",
  "recruiter",
  "interviewer",
  "viewer",
];

const ROLE_DESCRIPTIONS: Record<CompanyRole, string> = {
  admin: "สิทธิ์เต็มรูปแบบในการจัดการบริษัท",
  hr_manager: "จัดการทีมและการตั้งค่าบริษัท",
  recruiter: "จัดการประกาศงานและใบสมัคร",
  interviewer: "เข้าถึงการสัมภาษณ์และใบสมัคร",
  viewer: "ดูข้อมูลได้อย่างเดียว",
};

/**
 * Modal for selecting a new role for a team member
 */
export function RolePickerModal({
  isOpen,
  member,
  onConfirm,
  onClose,
  isLoading = false,
}: RolePickerModalProps) {
  const [selectedRole, setSelectedRole] = useState<CompanyRole>(member.role);

  const handleConfirm = () => {
    onConfirm(member.uid, selectedRole);
  };

  const isChanged = selectedRole !== member.role;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        aria-labelledby="role-picker-title"
        className="sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle id="role-picker-title">
            เลือกบทบาทใหม่ - {member.displayName}
          </DialogTitle>
          <DialogDescription>
            บทบาทปัจจุบัน: {ROLE_LABELS[member.role]}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-4">
          {AVAILABLE_ROLES.map((role) => (
            <Button
              key={role}
              type="button"
              variant="outline"
              data-testid={`role-option-${role}`}
              onClick={() => setSelectedRole(role)}
              disabled={isLoading}
              className={`w-full h-auto justify-start p-3 text-left ${
                selectedRole === role
                  ? "border-secondary-500 bg-secondary-50 selected"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div className="flex flex-col items-start">
                <p className="font-medium text-gray-900">{ROLE_LABELS[role]}</p>
                <p className="text-sm text-gray-500 font-normal">
                  {ROLE_DESCRIPTIONS[role]}
                </p>
              </div>
            </Button>
          ))}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isChanged || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2
                  className="mr-2 h-4 w-4 animate-spin"
                  data-testid="confirm-loading"
                />
                กำลังบันทึก...
              </>
            ) : (
              "บันทึก"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
