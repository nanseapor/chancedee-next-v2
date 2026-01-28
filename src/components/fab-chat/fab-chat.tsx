"use client";

import { usePathname } from "next/navigation";
import { useCallback, useSyncExternalStore } from "react";
import { FabChatButton } from "./fab-chat-button";
import { FabChatPanel } from "./fab-chat-panel";

// Paths where FAB should be hidden (within the (body) route group)
const EXCLUDED_PATHS = ["/ai-assistant", "/resume-builder-ai"];

function useIsDocumentLoaded() {
  const subscribe = useCallback((callback: () => void) => {
    window.addEventListener("load", callback);
    return () => window.removeEventListener("load", callback);
  }, []);

  const getSnapshot = useCallback(() => {
    return typeof document !== "undefined" && document.readyState === "complete";
  }, []);

  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function FabChat() {
  const pathname = usePathname();
  const isPageLoaded = useIsDocumentLoaded();

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
