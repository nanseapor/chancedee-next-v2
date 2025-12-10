"use client";

import { useFirebaseAuth } from "@/hooks/use-auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // This will trigger the authentication check immediately when the layout loads
  useFirebaseAuth();

  return <>{children}</>;
}
