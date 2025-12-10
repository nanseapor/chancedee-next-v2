import { getFirebaseAdminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";

export async function verifySessionCookie() {
  console.log("🔐 [AUTH UTILS DEBUG] verifySessionCookie() called");

  const sessionCookie = (await cookies()).get("session")?.value;
  console.log("🔐 [AUTH UTILS DEBUG] Session cookie from request:", {
    hasCookie: !!sessionCookie,
    cookieLength: sessionCookie?.length || 0,
    cookiePrefix: sessionCookie?.substring(0, 20) || "null",
  });

  if (!sessionCookie) {
    console.log("🔐 [AUTH UTILS DEBUG] ❌ No session cookie found in request");
    return null;
  }

  try {
    console.log(
      "🔐 [AUTH UTILS DEBUG] Attempting to verify session cookie with Firebase Admin",
    );
    const auth = getFirebaseAdminAuth();
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    console.log(
      "🔐 [AUTH UTILS DEBUG] ✅ Session cookie verified successfully",
      {
        uid: decodedClaims.uid,
        email: decodedClaims.email,
        exp: new Date(decodedClaims.exp * 1000).toISOString(),
      },
    );
    return decodedClaims;
  } catch (error: any) {
    // Check if this is a dev/prod environment mismatch
    if (
      error?.errorInfo?.message?.includes('incorrect "aud" (audience) claim')
    ) {
      const expectedProject = process.env.FIREBASE_ADMIN_PROJECT_ID;
      const errorMessage = error.errorInfo.message;

      // Extract the actual audience from error message
      const audMatch = errorMessage.match(/but got "([^"]+)"/);
      const actualAudience = audMatch ? audMatch[1] : "unknown";

      console.error("🔐 [AUTH UTILS DEBUG] 🚨 ENVIRONMENT MISMATCH DETECTED:", {
        issue: "Session cookie created in different environment",
        expectedProject: expectedProject,
        actualProject: actualAudience,
        environment: process.env.NODE_ENV,
        action: "Force deleting invalid cross-environment cookie",
      });

      // Force delete the cookie with all possible configurations
      console.log(
        "🔐 [AUTH UTILS DEBUG] Force deleting cross-environment session cookie",
      );
      (await cookies()).set("session", "", {
        maxAge: 0,
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      // Also try to delete with domain variants
      const domain =
        process.env.NODE_ENV === "production" ? ".chancedee.com" : undefined;
      if (domain) {
        (await cookies()).set("session", "", {
          maxAge: 0,
          path: "/",
          domain: domain,
          httpOnly: true,
          secure: true,
          sameSite: "strict",
        });
      }
    } else {
      console.error(
        "🔐 [AUTH UTILS DEBUG] ❌ Failed to verify session cookie:",
        error,
      );
      console.log("🔐 [AUTH UTILS DEBUG] Clearing invalid session cookie");
      (await cookies()).set("session", "", { maxAge: 0 });
    }
    return null;
  }
}

export async function createCustomToken(uid: string) {
  console.log("🔐 [AUTH UTILS DEBUG] createCustomToken() called for uid:", uid);

  try {
    const auth = getFirebaseAdminAuth();
    console.log(
      "🔐 [AUTH UTILS DEBUG] Attempting to create custom token with Firebase Admin",
    );
    const customToken = await auth.createCustomToken(uid);
    console.log("🔐 [AUTH UTILS DEBUG] ✅ Custom token created successfully", {
      tokenLength: customToken.length,
      tokenPrefix: customToken.substring(0, 20),
    });
    return customToken;
  } catch (error) {
    console.error(
      "🔐 [AUTH UTILS DEBUG] ❌ Failed to create custom token:",
      error,
    );
    return null;
  }
}
