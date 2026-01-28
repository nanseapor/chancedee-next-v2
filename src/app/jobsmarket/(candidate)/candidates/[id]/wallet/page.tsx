import { Metadata } from "next";

import { WalletClient } from "./_components/WalletClient";

/**
 * Wallet Page
 * Per WALLET-R01 RIS
 *
 * Server Component wrapper that:
 * - Extracts candidateId from route params
 * - Passes candidateId to WalletClient
 * - CandidateShell wrapper is in layout.tsx (CAND-R00)
 */

export const metadata: Metadata = {
  title: "กระเป๋าเงิน | Wallet",
};

interface WalletPageProps {
  params: Promise<{ id: string }>;
}

export default async function WalletPage({ params }: WalletPageProps) {
  const { id: candidateId } = await params;

  return <WalletClient candidateId={candidateId} />;
}
