"use server";

import { getFirebaseAdminFirestore } from "@/lib/firebase-admin";
import type {
  AdkSession,
  CreateSessionParams,
  UpdateSessionParams,
  AgentHandoffParams,
  AppendMessageParams,
  UpdateResumeProgressParams,
  UpdateTokenUsageParams,
} from "@/types/adk";
import type { ChatMessage } from "@/types/ai-message.types";

const MESSAGE_HISTORY_LIMIT = 10;
const TOKEN_LIMIT = 100000;

/**
 * Create a new ADK session
 */
export async function createSession(
  params: CreateSessionParams
): Promise<AdkSession> {
  const {userId, initialAgent = "consulting", userAgent, ipAddress} = params;

  const db = getFirebaseAdminFirestore();
  const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = Date.now();

  const session: AdkSession = {
    sessionId,
    userId,
    currentAgent: initialAgent,
    status: "active",
    messages: [],
    metadata: {
      createdAt: now,
      lastUpdated: now,
      totalMessages: 0,
      lastActiveAgent: initialAgent,
      tokenUsage: {
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        maxTokens: TOKEN_LIMIT,
        lastUpdated: now,
      },
      userAgent,
      ipAddress,
    },
  };

  await db
    .collection("users")
    .doc(userId)
    .collection("adkSessions")
    .doc(sessionId)
    .set(session);

  return session;
}

/**
 * Get an existing session
 */
export async function getSession(
  userId: string,
  sessionId: string
): Promise<AdkSession | null> {
  const db = getFirebaseAdminFirestore();

  const doc = await db
    .collection("users")
    .doc(userId)
    .collection("adkSessions")
    .doc(sessionId)
    .get();

  if (!doc.exists) {
    return null;
  }

  return doc.data() as AdkSession;
}

/**
 * Update session
 */
export async function updateSession(
  params: UpdateSessionParams
): Promise<void> {
  const { userId, sessionId, updates } = params;
  const db = getFirebaseAdminFirestore();

  await db
    .collection("users")
    .doc(userId)
    .collection("adkSessions")
    .doc(sessionId)
    .update({
      ...updates,
      "metadata.lastUpdated": Date.now(),
    });
}

/**
 * Append message to session history
 * Automatically trims to last 10 messages
 */
export async function appendMessage(
  params: AppendMessageParams
): Promise<void> {
  const { userId, sessionId, message } = params;
  const db = getFirebaseAdminFirestore();

  const sessionRef = db
    .collection("users")
    .doc(userId)
    .collection("adkSessions")
    .doc(sessionId);

  const session = await sessionRef.get();
  if (!session.exists) {
    throw new Error(`Session ${sessionId} not found`);
  }

  const sessionData = session.data() as AdkSession;
  const messages = sessionData.messages || [];

  // Add new message
  messages.push(message);

  // Keep only last 10 messages
  const trimmedMessages = messages.slice(-MESSAGE_HISTORY_LIMIT);

  await sessionRef.update({
    messages: trimmedMessages,
    "metadata.totalMessages": (sessionData.metadata.totalMessages || 0) + 1,
    "metadata.lastUpdated": Date.now(),
  });
}

/**
 * Handle agent handoff
 */
export async function handleAgentHandoff(
  params: AgentHandoffParams
): Promise<void> {
  const { userId, sessionId, toAgent, context } = params;
  const db = getFirebaseAdminFirestore();

  const updateData: Record<string, any> = {
    currentAgent: toAgent,
    "metadata.handoffTimestamp": Date.now(),
    "metadata.lastActiveAgent": toAgent,
    "metadata.lastUpdated": Date.now(),
  };

  // If switching to resume agent, save consulting context
  if (toAgent === "resume-creation" && context) {
    updateData.consultingContext = {
      summary: context,
    };
  }

  await db
    .collection("users")
    .doc(userId)
    .collection("adkSessions")
    .doc(sessionId)
    .update(updateData);
}

/**
 * Update resume progress
 */
export async function updateResumeProgress(
  params: UpdateResumeProgressParams
): Promise<void> {
  const { userId, sessionId, section, completed } = params;
  const db = getFirebaseAdminFirestore();

  const sessionRef = db
    .collection("users")
    .doc(userId)
    .collection("adkSessions")
    .doc(sessionId);

  const session = await sessionRef.get();
  if (!session.exists) {
    throw new Error(`Session ${sessionId} not found`);
  }

  const sessionData = session.data() as AdkSession;
  const progress = sessionData.progress || {
    completedSections: [],
    lastUpdated: Date.now(),
  };

  if (completed && !progress.completedSections.includes(section)) {
    progress.completedSections.push(section);
  }

  progress.currentSection = completed ? undefined : section;
  progress.lastUpdated = Date.now();

  await sessionRef.update({
    progress,
    "metadata.lastUpdated": Date.now(),
  });
}

/**
 * Update token usage
 */
export async function updateTokenUsage(
  params: UpdateTokenUsageParams
): Promise<void> {
  const { userId, sessionId, inputTokens, outputTokens } = params;
  const db = getFirebaseAdminFirestore();

  const sessionRef = db
    .collection("users")
    .doc(userId)
    .collection("adkSessions")
    .doc(sessionId);

  const session = await sessionRef.get();
  if (!session.exists) {
    throw new Error(`Session ${sessionId} not found`);
  }

  const sessionData = session.data() as AdkSession;
  const currentUsage = sessionData.metadata.tokenUsage;

  const newUsage = {
    inputTokens: currentUsage.inputTokens + inputTokens,
    outputTokens: currentUsage.outputTokens + outputTokens,
    totalTokens: currentUsage.totalTokens + inputTokens + outputTokens,
    maxTokens: TOKEN_LIMIT,
    lastUpdated: Date.now(),
  };

  await sessionRef.update({
    "metadata.tokenUsage": newUsage,
    "metadata.lastUpdated": Date.now(),
  });
}

/**
 * Check if session has reached token limit
 */
export async function checkTokenLimit(
  userId: string,
  sessionId: string
): Promise<boolean> {
  const session = await getSession(userId, sessionId);
  if (!session) {
    throw new Error(`Session ${sessionId} not found`);
  }

  return session.metadata.tokenUsage.totalTokens >= TOKEN_LIMIT;
}

/**
 * Mark session as completed
 */
export async function completeSession(
  userId: string,
  sessionId: string
): Promise<void> {
  const db = getFirebaseAdminFirestore();

  await db
    .collection("users")
    .doc(userId)
    .collection("adkSessions")
    .doc(sessionId)
    .update({
      status: "completed",
      "metadata.lastUpdated": Date.now(),
    });
}

/**
 * Mark session as error
 */
export async function markSessionError(
  userId: string,
  sessionId: string,
  errorMessage?: string
): Promise<void> {
  const db = getFirebaseAdminFirestore();

  await db
    .collection("users")
    .doc(userId)
    .collection("adkSessions")
    .doc(sessionId)
    .update({
      status: "error",
      errorMessage,
      "metadata.lastUpdated": Date.now(),
    });
}

/**
 * Get all active sessions for a user
 */
export async function getUserActiveSessions(
  userId: string
): Promise<AdkSession[]> {
  const db = getFirebaseAdminFirestore();

  const snapshot = await db
    .collection("users")
    .doc(userId)
    .collection("adkSessions")
    .where("status", "==", "active")
    .orderBy("metadata.lastUpdated", "desc")
    .limit(10)
    .get();

  return snapshot.docs.map((doc) => doc.data() as AdkSession);
}
