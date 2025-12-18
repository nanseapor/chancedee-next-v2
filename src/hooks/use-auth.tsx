"use client";
import { authenticateSession, login } from "@/domains/authentication/services/server/actions/session";
import { getFirebaseAuth } from "@/lib/firebase";
import { userAtom } from "@/store/atom-store";
import { sessionStateAtom, authenticatedUserIdAtom } from "@/store/jobsmarket/global-atoms";
import { signInWithCustomToken } from "firebase/auth";
import { useAtom, useSetAtom } from "jotai";
import { useCallback, useEffect, useRef, useState } from "react";

export function useFirebaseAuth() {
  const [user, setUser] = useAtom(userAtom);
  const setSessionState = useSetAtom(sessionStateAtom);
  const setAuthenticatedUserId = useSetAtom(authenticatedUserIdAtom);
  const [loading, setLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const auth = getFirebaseAuth();

  const initialized = useRef(false);

  const initAuth = useCallback(async () => {
    // Prevent multiple initializations
    if (initialized.current || isAuthenticating) {
      console.log(
        "🔐 [AUTH DEBUG] Skipping auth init - already initialized or authenticating",
        {
          initialized: initialized.current,
          isAuthenticating,
        },
      );
      return;
    }

    try {
      console.log("🔐 [AUTH DEBUG] Starting authentication initialization");
      setIsAuthenticating(true);
      console.log("🔐 [AUTH DEBUG] Set isAuthenticating to true");
      initialized.current = true;

      const currentUser = auth.currentUser;
      console.log(
        "🔐 [AUTH DEBUG] Current Firebase user:",
        currentUser?.uid || "null",
      );

      // Check if there's already a valid user session
      if (currentUser) {
        try {
          console.log("🔐 [AUTH DEBUG] Checking current user token validity");
          // Verify if the current token is still valid
          await currentUser.getIdToken(true);
          console.log(
            "🔐 [AUTH DEBUG] ✅ Current user session is valid, using existing session",
          );
          setUser(currentUser);
          setSessionState("authenticated");
          setAuthenticatedUserId(currentUser.uid);
          // We'll let the SWR hook handle fetching the user data
          setLoading(false);
          setIsAuthenticating(false);
          return;
        } catch (tokenError) {
          console.log(
            "🔐 [AUTH DEBUG] ❌ Current token is invalid, will try custom token sign in",
            tokenError,
          );
          // Continue with the custom token sign in process
        }
      } else {
        console.log(
          "🔐 [AUTH DEBUG] No current Firebase user found, checking for session cookie",
        );
      }

      // IMPROVED: Try to authenticate with session, but handle failures gracefully
      try {
        console.log(
          "🔐 [AUTH DEBUG] Calling authenticateSession() server action",
        );
        const { success, customToken, error } = await authenticateSession();

        console.log("🔐 [AUTH DEBUG] authenticateSession() response:", {
          success,
          hasCustomToken: !!customToken,
          customTokenLength: customToken?.length || 0,
          error,
        });

        if (success && customToken) {
          console.log(
            "🔐 [AUTH DEBUG] ✅ Session valid, attempting Firebase signInWithCustomToken",
          );
          const userCreds = await signInWithCustomToken(auth, customToken);
          setUser(userCreds.user);
          setSessionState("authenticated");
          setAuthenticatedUserId(userCreds.user.uid);
          console.log(
            "🔐 [AUTH DEBUG] ✅ Successfully authenticated with session cookie",
            {
              uid: userCreds.user.uid,
              email: userCreds.user.email,
            },
          );
          // User data will be fetched by the SWR hook
        } else if (error) {
          // Handle session authentication failure gracefully
          console.log(
            "🔐 [AUTH DEBUG] ❌ Session authentication failed:",
            error,
          );
          if (
            error === "Invalid session" ||
            error === "Failed to create custom token"
          ) {
            console.log(
              "🔐 [AUTH DEBUG] No valid session found, user will need to login manually",
            );
          } else {
            console.log(
              "🔐 [AUTH DEBUG] Session authentication failed with error:",
              error,
            );
          }
          // Set user to null without alarming error messages
          setUser(null);
          setSessionState("unauthenticated");
          setAuthenticatedUserId(null);
        } else {
          console.log(
            "🔐 [AUTH DEBUG] ❌ Unexpected response from authenticateSession - no success and no error",
          );
          setUser(null);
          setSessionState("unauthenticated");
          setAuthenticatedUserId(null);
        }
      } catch (sessionError) {
        console.log(
          "🔐 [AUTH DEBUG] ❌ Session authentication attempt failed with exception:",
          sessionError,
        );
        setUser(null);
        setSessionState("unauthenticated");
        setAuthenticatedUserId(null);
      }
    } catch (error) {
      console.error("🔐 [AUTH DEBUG] ❌ Firebase authentication error:", error);
      setUser(null);
    } finally {
      console.log(
        "🔐 [AUTH DEBUG] Authentication initialization complete - setting isAuthenticating to false",
      );
      setIsAuthenticating(false);
      setLoading(false);
      console.log(
        "🔐 [AUTH DEBUG] Final state set: isAuthenticating=false, loading=false",
      );
    }
  }, [auth, isAuthenticating, setIsAuthenticating, setLoading, setUser, setSessionState, setAuthenticatedUserId]);

  useEffect(() => {
    initAuth();
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser?.uid && firebaseUser?.uid !== user?.uid) {
        setUser(firebaseUser);
        setSessionState("authenticated");
        setAuthenticatedUserId(firebaseUser.uid);
        firebaseUser?.getIdToken().then((token) => {
          console.log("User token:", token);
          login(token);
        });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { user, loading };
}
