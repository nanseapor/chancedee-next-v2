"use client";

import { Menu, X } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { Button } from "../ui/button";

export function MobileNavbar({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const overflow = isOpen ? "hidden" : "auto";
    document.documentElement.style.overflow = overflow;
  }, [isOpen]);

  useEffect(() => {
    const closeHamburgerNavigation = () => setIsOpen(false);
    window.addEventListener("orientationchange", closeHamburgerNavigation);
    window.addEventListener("resize", closeHamburgerNavigation);

    return () => {
      window.removeEventListener("orientationchange", closeHamburgerNavigation);
      window.removeEventListener("resize", closeHamburgerNavigation);
    };
  }, []);

  return (
    <>
      <Button
        variant={"ghost"}
        id="hamburger_menu"
        aria-label="Hamburger Menu"
        className="xl:hidden hover:bg-transparent"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X /> : <Menu />}
      </Button>
      {isOpen && (
        <div
          className="fixed inset-0 top-[68px] z-40 size-full overflow-auto bg-black/40 animate-in slide-in-from-top-24 xl:hidden"
          onClick={() => setIsOpen(false)}
        >
          {children}
        </div>
      )}
    </>
  );
}
