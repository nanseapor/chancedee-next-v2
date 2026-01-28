"use client";

import { Menu, X } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { Button } from "../ui/button";

interface MobileNavbarProps {
  children: ReactNode;
  /** CSS class to control breakpoint visibility of the button (default: "xl:hidden") */
  breakpointClass?: string;
  /** CSS top offset for the overlay panel (default: "top-[68px]") */
  topOffset?: string;
}

export function MobileNavbar({
  children,
  breakpointClass = "xl:hidden",
  topOffset = "top-[68px]",
}: MobileNavbarProps) {
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
        className={`${breakpointClass} hover:bg-transparent`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X /> : <Menu />}
      </Button>
      {isOpen && (
        <div
          className={`fixed inset-0 ${topOffset} z-40 size-full overflow-auto bg-black/40 animate-in slide-in-from-top-24 ${breakpointClass}`}
          onClick={() => setIsOpen(false)}
        >
          {children}
        </div>
      )}
    </>
  );
}
