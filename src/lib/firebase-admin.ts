import { loadEnvConfig } from "@next/env";
import firebase from "firebase-admin";
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

function getFirebaseAdminApp() {
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n",
  );
  let admin;
  if (firebase.apps && firebase.apps.length > 0) {
    admin = firebase.app();
  } else {
    console.log(firebase.apps.length, "Firebase Admin Initialized");
    admin = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
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
