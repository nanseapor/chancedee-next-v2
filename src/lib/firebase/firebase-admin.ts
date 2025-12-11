import { loadEnvConfig } from "@next/env";
import firebase from "firebase-admin";
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
  /\\n/g,
  "\n"
);

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;

function getFirebaseAdminApp() {
  let admin;
  if (firebase.apps && firebase.apps.length > 0) {
    admin = firebase.app();
  } else {
    if (!privateKey || !projectId || !clientEmail) {
      throw new Error("Firebase Admin SDK is not configured");
    }
    admin = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    getFirestore(admin).settings({
      ignoreUndefinedProperties: true,
    });
  }

  return admin;
}

export function getFirebaseAdminAuth() {
  return getAuth(getFirebaseAdminApp());
}

export function getFirebaseAdminFirestore() {
  return getFirestore(getFirebaseAdminApp());
}

export function getFirebaseAdminStorage() {
  return getStorage(getFirebaseAdminApp());
}

export async function createSessionCookie(idToken: string, expiresIn: number) {
  const auth = getFirebaseAdminAuth();
  return auth.createSessionCookie(idToken, { expiresIn });
}
