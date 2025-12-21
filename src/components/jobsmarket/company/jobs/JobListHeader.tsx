"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import Link from "next/link";

interface JobListHeaderProps {
  companyId: string;
  onSearch: (query: string) => void;
  canCreateJobs: boolean;
}

export function JobListHeader({
  companyId,
  onSearch,
  canCreateJobs,
}: JobListHeaderProps) {
  const [searchValue, setSearchValue] = useState("");
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip the initial render to avoid calling onSearch with empty string
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      onSearch(searchValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue, onSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-semibold">ประกาศงาน</h1>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="ค้นหาตำแหน่งงาน"
            onChange={handleSearchChange}
            className="pl-10 w-64"
          />
        </div>

        {canCreateJobs && (
          <Link href={`/jobsmarket/companies/${companyId}/dashboard/jobs/new`}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              ลงประกาศงานใหม่
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
