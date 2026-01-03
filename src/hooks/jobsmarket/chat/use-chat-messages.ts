"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  doc,
  type Unsubscribe,
} from "firebase/firestore";

import { getFirebaseFirestore } from "@/lib/firebase/client";
import {
  sendMessageFirestore,
  markMessagesAsRead,
  loadMessageHistory,
} from "@/lib/database/actions/chat-messages";
import type {
  OptimisticMessage,
  MessageWithId,
  ConnectionStatus,
  MessageType,
} from "@/types/chat.types";

interface UseChatMessagesOptions {
  roomId: string;
  userId: string;
  initialLimit?: number;
  initialMessages?: OptimisticMessage[];
}

interface FirestoreMessageData {
  sender_id?: { id?: string } | string;
  timestamp?: unknown;
  type?: string;
  sender_name?: string;
  sender_avatar?: string;
  message?: string;
  unread?: string[];
  file_url?: string;
  candidate_id?: { id?: string };
  company_id?: { id?: string };
  created_by?: { id?: string };
  updated_by?: { id?: string };
  created_at?: unknown;
  updated_at?: unknown;
}

interface UseChatMessagesReturn {
  messages: OptimisticMessage[];
  isLoading: boolean;
  error: Error | null;
  isConnected: boolean;
  hasMore: boolean;
  sendMessage: (text: string) => Promise<void>;
  loadMore: () => Promise<void>;
  markAsRead: () => Promise<void>;
  retryMessage: (tempId: string) => Promise<void>;
}

/**
 * Hook to manage real-time chat messages with optimistic updates
 * Per CHAT-R02 RIS
 */
export function useChatMessages({
  roomId,
  userId,
  initialLimit = 50,
  initialMessages = [],
}: UseChatMessagesOptions): UseChatMessagesReturn {
  const [messages, setMessages] = useState<OptimisticMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(initialMessages.length === 0);
  const [error, setError] = useState<Error | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);

  const unsubscribeRef = useRef<Unsubscribe | null>(null);
  const isLoadingMoreRef = useRef(false);

  // Transform Firestore document to OptimisticMessage
  const transformDoc = useCallback(
    (doc: { id: string; data: () => FirestoreMessageData }): OptimisticMessage => {
      const data = doc.data();
      const senderId = typeof data.sender_id === "string"
        ? data.sender_id
        : data.sender_id?.id || "";
      return {
        uid: doc.id,
        roomId: roomId,
        messageId: doc.id,
        senderId,
        timestamp:
          data.timestamp instanceof Timestamp
            ? data.timestamp.toMillis()
            : typeof data.timestamp === "number"
              ? data.timestamp
              : Date.now(),
        type: (data.type || "text") as MessageType,
        name: data.sender_name || "",
        avatar: data.sender_avatar || "",
        message: data.message || "",
        unread: data.unread || [],
        attachments: data.file_url,
        candidateId: data.candidate_id?.id || "",
        companyId: data.company_id?.id || "",
        createdBy: data.created_by?.id || "",
        updatedBy: data.updated_by?.id || "",
        createdAt:
          data.created_at instanceof Timestamp
            ? data.created_at.toMillis()
            : 0,
        updatedAt:
          data.updated_at instanceof Timestamp
            ? data.updated_at.toMillis()
            : 0,
        status: "sent",
      };
    },
    [roomId]
  );

  // Subscribe to real-time messages
  useEffect(() => {
    if (!roomId) return;

    setIsLoading(true);
    setError(null);

    const db = getFirebaseFirestore();
    const roomDocRef = doc(db, "chats", roomId);
    const messagesRef = collection(db, "messages");

    const q = query(
      messagesRef,
      where("room_id", "==", roomDocRef),
      orderBy("timestamp", "desc"),
      limit(initialLimit)
    );

    unsubscribeRef.current = onSnapshot(
      q,
      (snapshot) => {
        const newMessages = snapshot.docs.map((doc) =>
          transformDoc({ id: doc.id, data: () => doc.data() })
        );

        setMessages((prev) => {
          // Keep optimistic messages (sending/failed)
          const optimistic = prev.filter(
            (m) => m.status === "sending" || m.status === "failed"
          );

          // Merge: new server messages + optimistic
          // Remove optimistic if confirmed message arrived
          const confirmedIds = new Set(newMessages.map((m) => m.uid));
          const remainingOptimistic = optimistic.filter(
            (m) => !confirmedIds.has(m._tempId || "")
          );

          // Reverse for chronological order
          return [...newMessages.reverse(), ...remainingOptimistic];
        });

        setIsLoading(false);
        setIsConnected(true);

        if (newMessages.length < initialLimit) {
          setHasMore(false);
        }
      },
      (err) => {
        console.error("Chat subscription error:", err);
        setError(err);
        setIsConnected(false);
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribeRef.current?.();
    };
  }, [roomId, initialLimit, transformDoc]);

  // Send message with optimistic update
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const optimisticMessage: OptimisticMessage = {
        uid: tempId,
        roomId,
        messageId: tempId,
        senderId: userId,
        timestamp: Date.now(),
        type: "text",
        name: "",
        avatar: "",
        message: text.trim(),
        unread: [],
        candidateId: "",
        companyId: "",
        createdBy: userId,
        updatedBy: userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: "sending",
        _tempId: tempId,
      };

      // Add optimistically
      setMessages((prev) => [...prev, optimisticMessage]);

      try {
        await sendMessageFirestore({ roomId, message: text.trim() });
        // Remove optimistic - real one comes via subscription
        setMessages((prev) => prev.filter((m) => m._tempId !== tempId));
      } catch (err) {
        console.error("Send message error:", err);
        // Mark as failed
        setMessages((prev) =>
          prev.map((m) =>
            m._tempId === tempId ? { ...m, status: "failed" as const } : m
          )
        );
        throw err;
      }
    },
    [roomId, userId]
  );

  // Load more (older) messages
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading || isLoadingMoreRef.current) return;

    isLoadingMoreRef.current = true;

    try {
      const oldestMessage = messages.find((m) => m.status === "sent");
      const oldestTimestamp = oldestMessage?.timestamp;

      const result = await loadMessageHistory({
        roomId,
        cursor: oldestTimestamp?.toString() || null,
        limit: 30,
      });

      const olderMessages = result.messages.map((m) => ({
        ...m,
        status: "sent" as const,
      }));

      setMessages((prev) => [...olderMessages, ...prev]);
      setHasMore(result.hasMore);
      setCursor(result.cursor);
    } catch (err) {
      console.error("Load more error:", err);
    } finally {
      isLoadingMoreRef.current = false;
    }
  }, [roomId, messages, hasMore, isLoading]);

  // Mark messages as read
  const markAsRead = useCallback(async () => {
    const unreadMessages = messages.filter(
      (m) => m.unread?.includes(userId) && m.status === "sent"
    );

    if (unreadMessages.length > 0) {
      try {
        await markMessagesAsRead({ roomId });
      } catch (err) {
        console.error("Mark as read error:", err);
      }
    }
  }, [roomId, messages, userId]);

  // Retry failed message
  const retryMessage = useCallback(
    async (tempId: string) => {
      const failedMessage = messages.find((m) => m._tempId === tempId);
      if (!failedMessage) return;

      // Mark as sending
      setMessages((prev) =>
        prev.map((m) =>
          m._tempId === tempId ? { ...m, status: "sending" as const } : m
        )
      );

      try {
        await sendMessageFirestore({ roomId, message: failedMessage.message });
        // Remove optimistic - real one comes via subscription
        setMessages((prev) => prev.filter((m) => m._tempId !== tempId));
      } catch (err) {
        console.error("Retry message error:", err);
        // Mark as failed again
        setMessages((prev) =>
          prev.map((m) =>
            m._tempId === tempId ? { ...m, status: "failed" as const } : m
          )
        );
      }
    },
    [roomId, messages]
  );

  return {
    messages,
    isLoading,
    error,
    isConnected,
    hasMore,
    sendMessage,
    loadMore,
    markAsRead,
    retryMessage,
  };
}
