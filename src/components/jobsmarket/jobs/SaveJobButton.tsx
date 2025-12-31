'use client';

import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAtomValue } from 'jotai';
import { sessionStateAtom } from '@/store/jobsmarket/global-atoms';

interface SaveJobButtonProps {
  jobId: string;
  isSaved: boolean;
  onToggle: (jobId: string, newSavedState: boolean) => void;
  variant?: 'icon' | 'button';
  size?: 'sm' | 'default' | 'lg';
  disabled?: boolean;
  isLoading?: boolean;
}

export function SaveJobButton({
  jobId,
  isSaved,
  onToggle,
  variant = 'icon',
  size = 'default',
  disabled = false,
  isLoading = false,
}: SaveJobButtonProps) {
  const sessionState = useAtomValue(sessionStateAtom);
  const isAuthenticated = sessionState === 'authenticated';

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent card click
    e.stopPropagation();

    if (!isAuthenticated) {
      // Trigger login prompt (handled by parent or global state)
      onToggle(jobId, false); // Signal needs auth
      return;
    }

    onToggle(jobId, !isSaved);
  };

  const iconSize = size === 'sm' ? 16 : size === 'default' ? 20 : 24;

  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        disabled={disabled || isLoading}
        className={cn(
          'p-2 rounded-full hover:bg-muted transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-primary',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        aria-label={isSaved ? 'ยกเลิกบันทึก' : 'บันทึกงาน'}
      >
        <Heart
          size={iconSize}
          className={cn(
            'transition-colors',
            isSaved ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
          )}
        />
      </button>
    );
  }

  // Button variant
  return (
    <Button
      variant={isSaved ? 'secondary' : 'outline'}
      size={size}
      onClick={handleClick}
      disabled={disabled || isLoading}
    >
      <Heart size={16} className={cn('mr-2', isSaved && 'fill-current')} />
      {isSaved ? 'บันทึกแล้ว' : 'บันทึก'}
    </Button>
  );
}
