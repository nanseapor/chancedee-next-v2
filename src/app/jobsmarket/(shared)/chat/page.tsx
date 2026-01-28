"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import useSWR from "swr";

import { activeRoleAtom } from "@/store/jobsmarket/global-atoms";
import { useChatRooms } from "@/hooks/jobsmarket/chat/use-chat-rooms";
import { ChatRoomList } from "@/components/jobsmarket/chat/ChatRoomList";
import { ChatSearchBar } from "@/components/jobsmarket/chat/ChatSearchBar";
import { ChatEmptyState } from "@/components/jobsmarket/chat/ChatEmptyState";
import { CandidateShell } from "@/components/jobsmarket/shells/CandidateShell";
import CompanyShell from "@/components/jobsmarket/company/shells/CompanyShell";
import { ChatRoomClient } from "./[roomId]/_components/ChatRoomClient";
import { getRoomDetails, loadMessageHistory } from "@/lib/database/actions/chat-messages";
import { fetchCompanyProfile, fetchUserMembership } from "@/lib/jobsmarket/company/fetchers";
import type { RoomDetails, OptimisticMessage } from "@/types/chat.types";
import type { Permission } from "@/types/jobsmarket/company";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Chat List Page
 * Route: /jobsmarket/chat
 *
 * Per CHAT-R01 RIS - Displays list of chat rooms for current user.
 *
 * Features:
 * - Role-based room filtering (candidate sees companies, company sees candidates)
 * - Client-side search
 * - Two-panel layout on desktop
 * - Shell integration via activeRoleAtom
 */
export default function ChatListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeRole = useAtomValue(activeRoleAtom);

  // Determine navBar based on active role
  const navBar: "candidate" | "company" = activeRole === "company" ? "company" : "candidate";

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Desktop room detail state
  const [roomDetails, setRoomDetails] = useState<RoomDetails | null>(null);
  const [initialMessages, setInitialMessages] = useState<OptimisticMessage[]>([]);
  const [isLoadingRoom, setIsLoadingRoom] = useState(false);
  const [roomError, setRoomError] = useState<string | null>(null);

  // Fetch chat rooms
  const {
    rooms,
    filteredRooms,
    currentUser,
    isLoading,
    error,
    mutate,
  } = useChatRooms({
    navBar,
    searchQuery,
  });

  // Fetch company data for CompanyShell when user is a company user
  const { data: companyData } = useSWR(
    navBar === "company" && currentUser?.companyId
      ? ["company-profile", currentUser.companyId]
      : null,
    async () => {
      if (!currentUser?.companyId) return null;
      return fetchCompanyProfile(currentUser.companyId);
    }
  );

  // Fetch user's company role for permission checks
  const { data: membershipData } = useSWR(
    navBar === "company" && currentUser?.id && currentUser?.companyId
      ? ["company-membership", currentUser.id, currentUser.companyId]
      : null,
    async () => {
      if (!currentUser?.id || !currentUser?.companyId) return null;
      return fetchUserMembership(currentUser.id, currentUser.companyId);
    }
  );

  // Create permission check function based on user's company role
  // Per COMP-R00 Section 4.2, role-based permissions
  const hasPermission = useMemo(() => {
    const role = membershipData?.role;
    const ROLE_PERMISSIONS: Record<string, Permission[]> = {
      admin: ["post_jobs", "edit_jobs", "view_applications", "accept_reject_applications", "schedule_interviews", "manage_team", "company_settings"],
      hr_manager: ["post_jobs", "edit_jobs", "view_applications", "accept_reject_applications", "schedule_interviews", "company_settings"],
      recruiter: ["post_jobs", "edit_jobs", "view_applications", "accept_reject_applications", "schedule_interviews"],
      interviewer: ["schedule_interviews", "view_applications"],
      viewer: ["view_applications"],
    };

    return (permission: Permission) => {
      if (!role) return false;
      return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
    };
  }, [membershipData?.role]);

  // Selected room from URL
  const selectedRoomId = searchParams.get("room");

  // Handle room selection
  const handleSelectRoom = useCallback(
    (roomId: string) => {
      // Update URL with selected room
      router.push(`/chat?room=${roomId}`);
    },
    [router]
  );

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Handle clear search
  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  // Handle retry
  const handleRetry = useCallback(() => {
    mutate();
  }, [mutate]);

  // Load room details when selected (desktop only)
  useEffect(() => {
    const selectedRoomId = searchParams.get("room");
    if (!selectedRoomId) {
      setRoomDetails(null);
      setInitialMessages([]);
      return;
    }

    const loadRoomData = async () => {
      setIsLoadingRoom(true);
      setRoomError(null);

      try {
        const [details, messagesResponse] = await Promise.all([
          getRoomDetails({ roomId: selectedRoomId }),
          loadMessageHistory({ roomId: selectedRoomId, limit: 50 }),
        ]);

        setRoomDetails(details);
        setInitialMessages(messagesResponse.messages as OptimisticMessage[]);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load room";
        setRoomError(errorMessage);
        setRoomDetails(null);
        setInitialMessages([]);
      } finally {
        setIsLoadingRoom(false);
      }
    };

    loadRoomData();
  }, [searchParams]);

  // Render content
  const content = (
    <div className="flex h-full min-h-screen">
      {/* Room List Panel */}
      <div
        data-testid="chat-list-panel"
        className="w-full md:w-[320px] lg:w-[360px] md:border-r border-border flex flex-col bg-background"
      >
        {/* Header */}
        <header className="p-4 border-b border-border space-y-4">
          <h1 className="text-xl font-semibold text-foreground">ข้อความ</h1>
          <ChatSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
            onClear={handleClearSearch}
            debounceMs={300}
          />
        </header>

        {/* Room List */}
        <div className="flex-1 overflow-y-auto">
          <ChatRoomList
            rooms={searchQuery ? filteredRooms : rooms}
            isLoading={isLoading}
            error={error}
            selectedRoomId={selectedRoomId}
            onSelectRoom={handleSelectRoom}
            userRole={navBar}
            searchQuery={searchQuery}
            isSearchResult={!!searchQuery}
            onClearSearch={handleClearSearch}
            onRetry={handleRetry}
          />
        </div>
      </div>

      {/* Chat Detail Panel (Desktop) */}
      <div
        data-testid="chat-detail-panel"
        className="hidden md:flex flex-1 flex-col bg-muted/30"
      >
        {selectedRoomId ? (
          isLoadingRoom ? (
            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="flex-1 p-4 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
                  >
                    <Skeleton
                      className={`h-12 ${i % 2 === 0 ? "w-2/3" : "w-1/2"} rounded-2xl`}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : roomError ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center p-4">
                <p className="text-destructive">{roomError}</p>
                <Button
                  variant="link"
                  size="sm"
                  className="mt-2"
                  onClick={() => router.push(`/chat?room=${selectedRoomId}`)}
                >
                  ลองใหม่
                </Button>
              </div>
            </div>
          ) : roomDetails && currentUser ? (
            <ChatRoomClient
              roomId={selectedRoomId}
              initialRoomDetails={roomDetails}
              initialMessages={initialMessages}
              userId={currentUser.id}
            />
          ) : (
            <ChatEmptyState type="no_selected" />
          )
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <ChatEmptyState type="no_selected" />
          </div>
        )}
      </div>
    </div>
  );

  // Wrap in appropriate shell based on role
  // CandidateShell for candidates, CompanyShell for company users
  if (navBar === "candidate" && currentUser?.candidateId) {
    return (
      <CandidateShell
        candidateId={currentUser.candidateId}
        isOnboarded={true}
        currentPath="/chat"
      >
        {content}
      </CandidateShell>
    );
  }

  // CompanyShell for company users when company data is loaded
  if (navBar === "company" && companyData && membershipData?.isMember) {
    return (
      <CompanyShell
        company={companyData}
        hasPermission={hasPermission}
      >
        {content}
      </CompanyShell>
    );
  }

  // Fallback: show content without shell while loading company data
  // or if company data is unavailable
  return content;
}
