"use client";

import { useState, useCallback, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebouncedCallback } from "use-debounce";

export interface SearchHeaderProps {
  q: string;
  onKeywordChange: (keyword: string) => void;
}

/**
 * SearchHeader - Search input for company directory
 *
 * @specification COMP-R09 Company Directory
 */
export function SearchHeader({ q, onKeywordChange }: SearchHeaderProps) {
  const [localKeyword, setLocalKeyword] = useState(q);

  // Sync local state with prop when URL changes (e.g., navigation, refresh)
  useEffect(() => {
    setLocalKeyword(q);
  }, [q]);

  // Debounce the actual search to prevent excessive API calls
  const debouncedSearch = useDebouncedCallback((value: string) => {
    onKeywordChange(value);
  }, 300);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setLocalKeyword(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-wide leading-snug text-gray-900 mb-2">
        ค้นหาบริษัท
      </h1>
      <p className="text-base font-normal tracking-wider leading-relaxed text-gray-600 mb-6">
        ค้นพบบริษัทชั้นนำที่เปิดรับสมัครงาน
      </p>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          type="text"
          placeholder="ค้นหาชื่อบริษัท, คำอธิบาย..."
          value={localKeyword}
          onChange={handleChange}
          data-testid="company-search-input"
          className="pl-10 h-12 text-base border-gray-300 focus:border-secondary-500 focus:ring-2 focus:ring-secondary-200"
        />
      </div>
    </div>
  );
}
