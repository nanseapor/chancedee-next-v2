"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDiscard: () => void;
  onSave: () => void;
}

export function UnsavedChangesModal({
  isOpen,
  onClose,
  onDiscard,
  onSave,
}: UnsavedChangesModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <AlertDialogTitle>มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            คุณต้องการบันทึกการเปลี่ยนแปลงก่อนออกหรือไม่?
            หากไม่บันทึก การเปลี่ยนแปลงทั้งหมดจะสูญหาย
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>ยกเลิก</AlertDialogCancel>
          <AlertDialogAction
            onClick={onDiscard}
            className="bg-gray-500 hover:bg-gray-600"
          >
            ไม่บันทึก
          </AlertDialogAction>
          <AlertDialogAction onClick={onSave}>
            บันทึก
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
