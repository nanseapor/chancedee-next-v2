"use server";

import { getFirebaseAdminAuth } from "@/lib/firebase-admin";
import { createCustomToken, verifySessionCookie } from "@/utils/auth";
import { cookies } from "next/headers";

export async function authenticateSession() {
  console.log("🔐 [AUTH SERVER DEBUG] authenticateSession() called");

  const decodedClaims = await verifySessionCookie();
  console.log("🔐 [AUTH SERVER DEBUG] verifySessionCookie() result:", {
    hasDecodedClaims: !!decodedClaims,
    uid: decodedClaims?.uid || "null",
    email: decodedClaims?.email || "null",
  });

  if (!decodedClaims) {
    console.log("🔐 [AUTH SERVER DEBUG] ❌ No valid session cookie found");
    // Don't call logout() here as it may cause the Response.clone error
    // The cookie has already been cleared by verifySessionCookie()
    return { success: false, error: "Invalid session" };
  }

  console.log(
    "🔐 [AUTH SERVER DEBUG] ✅ Valid session found, creating custom token for uid:",
    decodedClaims.uid,
  );
  const customToken = await createCustomToken(decodedClaims.uid);
  console.log("🔐 [AUTH SERVER DEBUG] createCustomToken() result:", {
    hasCustomToken: !!customToken,
    customTokenLength: customToken?.length || 0,
  });

  if (!customToken) {
    console.log("🔐 [AUTH SERVER DEBUG] ❌ Failed to create custom token");
    // Don't call logout() here as it may cause the Response.clone error
    return { success: false, error: "Failed to create custom token" };
  }

  console.log("🔐 [AUTH SERVER DEBUG] ✅ Custom token created successfully");
  return { success: true, customToken };
}

export async function login(idToken?: string) {
  // First, check if there's an existing valid session
  const existingSession = await verifySessionCookie();
  if (existingSession) {
    return { success: true, user: existingSession };
  }

  // If no valid session, proceed with login using idToken
  if (!idToken) {
    return { success: false, error: "No ID token provided" };
  }

  try {
    const auth = getFirebaseAdminAuth();

    const decodedToken = await auth.verifyIdToken(idToken);
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn,
    });

    const domain =
      process.env.NODE_ENV === "production" ? ".chancedee.com" : undefined;

    (await cookies()).set("session", sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      domain: domain,
      sameSite: "strict",
    });

    console.log("Session cookie set successfully");
    return { success: true, user: decodedToken };
  } catch (error) {
    console.error("Failed to create session:", error);
    return { success: false, error: String(error) };
  }
}

export async function logout() {
  try {
    const sessionCookie = (await cookies()).get("session")?.value;

    if (sessionCookie) {
      const auth = getFirebaseAdminAuth();
      const decodedClaims = await auth.verifySessionCookie(sessionCookie);
      await auth.revokeRefreshTokens(decodedClaims.sub);
    }

    (await cookies()).delete("session");
    return { success: true };
  } catch (error) {
    console.error("Failed to logout:", error);
    return { success: false, error: String(error) };
  }
}
