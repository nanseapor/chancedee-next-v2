"use client";
import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";

import { getBaseUrl } from "@/lib/utils/client/getBaseURL";

import { auth, getFirebaseAuth } from "@/lib/firebase";

export const resetPassword = async (email: string) => {
  const actionCodeSettings = {
    url: `${getBaseUrl()}/auth/email/sign-in`,
    handleCodeInApp: true,
  };
  const result = await sendPasswordResetEmail(auth, email, actionCodeSettings)
    .then(() => ({ code: "200", message: "success" }))
    .catch((error) => {
      console.error(error);
      return { code: "500", message: "Internal error" };
    });
  return result;
};

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export const signInWithGoogle = () =>
  signInWithPopup(getFirebaseAuth(), googleProvider);

export const signInWithFacebook = () =>
  signInWithPopup(getFirebaseAuth(), facebookProvider);

export const signUpWithEmail = (email: string, password: string) =>
  createUserWithEmailAndPassword(auth, email, password);

export const signInWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);
