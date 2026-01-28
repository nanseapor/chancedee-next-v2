'use client';

import { SearchX, Filter, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface EmptyStateProps {
  searchQuery?: string;
  hasFilters: boolean;
  onClearFilters?: () => void;
  onClearSearch?: () => void;
}

export function EmptyState({
  searchQuery,
  hasFilters,
  onClearFilters,
  onClearSearch,
}: EmptyStateProps) {
  // Search with no results
  if (searchQuery && !hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <SearchX size={48} className="text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          ไม่พบงานสำหรับ &ldquo;{searchQuery}&rdquo;
        </h3>
        <p className="text-muted-foreground mb-4">
          ลองค้นหาด้วยคำอื่น หรือใช้คำที่กว้างขึ้น
        </p>
        {onClearSearch && (
          <Button variant="outline" onClick={onClearSearch}>
            ล้างการค้นหา
          </Button>
        )}
      </div>
    );
  }

  // Filters with no results
  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Filter size={48} className="text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          ไม่พบงานที่ตรงกับเงื่อนไข
        </h3>
        <p className="text-muted-foreground mb-4">
          ลองปรับตัวกรองให้น้อยลง หรือล้างตัวกรองทั้งหมด
        </p>
        {onClearFilters && (
          <Button variant="outline" onClick={onClearFilters}>
            ล้างตัวกรองทั้งหมด
          </Button>
        )}
      </div>
    );
  }

  // Generic no jobs
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Briefcase size={48} className="text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">
        ยังไม่มีงานในระบบ
      </h3>
      <p className="text-muted-foreground">
        กรุณากลับมาใหม่ภายหลัง
      </p>
    </div>
  );
}
