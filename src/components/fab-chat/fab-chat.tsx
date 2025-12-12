"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FabChatButton } from "./fab-chat-button";
import { FabChatPanel } from "./fab-chat-panel";

// Paths where FAB should be hidden (within the (body) route group)
const EXCLUDED_PATHS = ["/ai-assistant", "/resume-builder-ai"];

export function FabChat() {
  const pathname = usePathname();
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  useEffect(() => {
    // Reset and check if document is already loaded
    setIsPageLoaded(false);

    if (document.readyState === "complete") {
      setIsPageLoaded(true);
      return;
    } else {
      // Wait for the page to fully load
      // Use 'load' event which fires after all resources (images, styles, etc.) are loaded
      // This excludes async scripts like Google Analytics that continue loading
      const handleLoad = () => {
        setIsPageLoaded(true);
      };

      window.addEventListener("load", handleLoad);

      return () => {
        window.removeEventListener("load", handleLoad);
      };
    }
  }, [pathname]);

  // Don't show FAB on specifically excluded pages within (body)
  if (EXCLUDED_PATHS.some((path) => pathname?.startsWith(path))) {
    return null;
  }

  // Don't show FAB until page is fully loaded
  if (!isPageLoaded) {
    return null;
  }

  return (
    <>
      <FabChatButton />
      <FabChatPanel />
    </>
  );
}
