"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchAtom } from "@/store/atom-store";
import { useAtom } from "jotai";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const SearchBar = ({
  onOpenChange,
}: { onOpenChange?(open: boolean): void }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const keyword = searchParams.get("keyword");
  const previous = keyword ? keyword : "";

  const [searchQuery, setSearchQuery] = useAtom(searchAtom);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const url = encodeURIComponent(searchQuery.trim());
      onOpenChange && onOpenChange(false);
      router.push(`/search?keyword=${url}`);
    }
  };

  useEffect(() => {
    setSearchQuery(previous);
  }, [previous]);

  return (
    <div className="relative p-4 w-full">
      <Search className="absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="ค้นหาข้อมูลบล็อก"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-10 pr-12 border-none shadow-none focus-visible:ring-0"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearch();
          }
        }}
      />
      <Button
        type="submit"
        size="sm"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10"
        onClick={handleSearch}
      >
        Search
      </Button>
    </div>
  );
};

export default SearchBar;
