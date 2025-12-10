"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import SearchBar from "./search-bar";

export default function SearchDialog() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const overflow = isOpen ? "hidden" : "auto";
    document.documentElement.style.overflow = overflow;
  }, [isOpen]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative h-10 w-10 mx-auto shrink-0 rounded-full hover:bg-primary-100 transition-colors font-light duration-500"
        onClick={() => setIsOpen(true)}
        aria-label="Open search"
      >
        <Search className="h-5 w-5" />
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className={cn(
            "fixed top-32",
            "border-none p-0 rounded-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=open]:slide-in-from-top-full data-[state=closed]:slide-out-to-top-full",
            "duration-300 ease-in-out",
            "shadow-lg",
          )}
        >
          <SearchBar onOpenChange={setIsOpen} />
        </DialogContent>
      </Dialog>
    </>
  );
}
