import { redirect, notFound } from "next/navigation";
import { Metadata } from "next";

import { getSessionUser } from "@/lib/firebase/admin-auth";
import { getRoomDetails, loadMessageHistory } from "@/lib/database/actions/chat-messages";
import { ChatRoomClient } from "./_components/ChatRoomClient";

interface ChatRoomPageProps {
  params: Promise<{
    roomId: string;
  }>;
}

export async function generateMetadata(
  _props: ChatRoomPageProps
): Promise<Metadata> {
  return {
    title: "แชท | Chancedee Jobs",
    description: "ห้องสนทนา",
  };
}

export default async function ChatRoomPage({ params }: ChatRoomPageProps) {
  const { roomId } = await params;

  // Check authentication
  const session = await getSessionUser();
  if (!session) {
    redirect("/auth/login");
  }

  // Fetch room details and initial messages in parallel
  // Handle specific errors with redirects/notFound
  let roomDetails;
  let messagesResponse;

  try {
    [roomDetails, messagesResponse] = await Promise.all([
      getRoomDetails({ roomId }),
      loadMessageHistory({ roomId, limit: 50 }),
    ]);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    if (errorMessage === "ROOM_NOT_FOUND") {
      notFound();
    }

    if (errorMessage === "NOT_PARTICIPANT") {
      redirect("/chat");
    }

    // Re-throw other errors
    throw error;
  }

  return (
    <div className="h-[100dvh] flex flex-col">
      <ChatRoomClient
        roomId={roomId}
        initialRoomDetails={roomDetails}
        initialMessages={messagesResponse.messages}
        userId={session.uid}
      />
    </div>
  );
}
