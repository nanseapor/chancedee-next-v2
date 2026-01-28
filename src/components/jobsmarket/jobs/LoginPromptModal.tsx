'use client';

import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LoginPromptAction } from '@/types/public-jobs';

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: LoginPromptAction;
  returnUrl?: string;
}

const ACTION_MESSAGES: Record<
  LoginPromptAction,
  { title: string; description: string }
> = {
  save: {
    title: 'บันทึกงานนี้',
    description: 'เข้าสู่ระบบเพื่อบันทึกงานที่สนใจและดูภายหลังได้ง่ายขึ้น',
  },
  apply: {
    title: 'สมัครงานนี้',
    description: 'เข้าสู่ระบบเพื่อสมัครงานและติดตามสถานะใบสมัครของคุณ',
  },
  view_saved: {
    title: 'ดูงานที่บันทึกไว้',
    description: 'เข้าสู่ระบบเพื่อดูรายการงานที่คุณบันทึกไว้',
  },
};

export function LoginPromptModal({
  isOpen,
  onClose,
  action,
  returnUrl,
}: LoginPromptModalProps) {
  const router = useRouter();
  const message = ACTION_MESSAGES[action];

  const handleLogin = () => {
    const loginUrl = returnUrl
      ? `/jobsmarket/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`
      : '/jobsmarket/auth/login';
    router.push(loginUrl);
    onClose();
  };

  const handleRegister = () => {
    const registerUrl = returnUrl
      ? `/jobsmarket/auth/register?returnUrl=${encodeURIComponent(returnUrl)}`
      : '/jobsmarket/auth/register';
    router.push(registerUrl);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{message.title}</DialogTitle>
          <DialogDescription>{message.description}</DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="sm:order-1">
            ยกเลิก
          </Button>
          <Button variant="outline" onClick={handleRegister} className="sm:order-2">
            ลงทะเบียน
          </Button>
          <Button onClick={handleLogin} className="sm:order-3">
            เข้าสู่ระบบ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
