"use server";

import { getFirebaseAdminAuth } from "@/lib/firebase/admin";
import { loadEnvConfig } from "@next/env";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

type AuthHeader = {
  idToken: string;
  sessionCookie: string;
};

type FetchResponse = {
  status: number;
  data: string;
};

const createAuthHeaders = async (
  authHeader: AuthHeader,
): Promise<HeadersInit> => {
  const user = await getFirebaseAdminAuth().verifyIdToken(authHeader.idToken);
  console.log("Verified IdToken: ", user);

  const sessionCookie = await getFirebaseAdminAuth().createSessionCookie(
    authHeader.idToken,
    {
      expiresIn: 60 * 60 * 3 * 1000,
    },
  );

  return {
    Authorization: `Bearer ${authHeader.idToken}`,
    Cookie: `session=${sessionCookie}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
};

/**
 * Helper function to delay execution for retry backoff
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Determines if a status code or error should trigger a retry
 */
const shouldRetry = (status?: number, error?: unknown): boolean => {
  // Retry on network errors
  if (error) return true;

  // Retry on server errors (5xx) and specific client errors
  if (status) {
    return (
      status >= 500 || // Server errors
      status === 408 || // Request Timeout
      status === 429 // Too Many Requests
    );
  }

  return false;
};

const fetchJobMarketAPI = async (
  method: string,
  endpoint: string,
  authHeader?: AuthHeader,
  body?: Record<string, unknown> | FormData | string | null,
  maxRetries = 3,
): Promise<FetchResponse> => {
  console.log("Fetch endpoint: ", endpoint);

  const headers: HeadersInit = authHeader
    ? await createAuthHeaders(authHeader)
    : {};

  const fetchOptions: RequestInit = {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    // Use 'no-cache' for dynamic requests with server validation
    // Response.clone issue fixed in Next.js 14.2.20+
    // See: https://github.com/vercel/next.js/pull/73274
    cache: "no-cache",
  };

  let lastStatus: number | undefined;

  // Retry loop with exponential backoff
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 1) {
        // Exponential backoff: 1s, 2s, 4s
        const backoffMs = Math.pow(2, attempt - 1) * 1000;
        console.log(
          `Retrying request (attempt ${attempt}/${maxRetries}) after ${backoffMs}ms...`,
        );
        await delay(backoffMs);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_JOBS_MARKET_API_ENDPOINT}${endpoint}`,
        fetchOptions,
      );

      // Clone response BEFORE reading body to allow Next.js to process it
      // This prevents "Body has already been consumed" error
      const status = response.status;
      const ok = response.ok;
      const statusText = response.statusText;

      // Read the response body only once
      let responseData: string;
      try {
        responseData = await response.text();
      } catch (readError) {
        console.error("Error reading response body:", readError);
        return {
          status: status,
          data: ok ? "Success" : statusText,
        };
      }

      // Success case
      if (ok) {
        if (attempt > 1) {
          console.log(
            `✅ Request succeeded on attempt ${attempt}/${maxRetries}`,
          );
        }
        return { status: status, data: responseData };
      }

      // Non-success status code
      lastStatus = status;
      console.error(
        `Error getting information (attempt ${attempt}/${maxRetries}):`,
        `${process.env.NEXT_PUBLIC_JOBS_MARKET_API_ENDPOINT}${endpoint}`,
        status,
        statusText,
        responseData,
      );

      // Check if we should retry this status code
      if (attempt < maxRetries && shouldRetry(status)) {
        continue; // Retry
      }

      // No more retries or not retryable, return error
      return { status: status, data: responseData || statusText };
    } catch (error) {
      console.error(
        `Error getting information (attempt ${attempt}/${maxRetries}):`,
        error,
      );

      // If this is the last attempt or error is not retryable, return error
      if (attempt >= maxRetries || !shouldRetry(undefined, error)) {
        return { status: lastStatus || 500, data: "Internal server error" };
      }
      // Otherwise, continue to next retry attempt
    }
  }

  // Should not reach here, but just in case
  return { status: lastStatus || 500, data: "Internal server error" };
};

export default fetchJobMarketAPI;
