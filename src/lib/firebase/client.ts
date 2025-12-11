"use client";

import { type FirebaseApp, getApps, initializeApp } from "firebase/app";
import {
  type Auth,
  browserLocalPersistence,
  getAuth,
  setPersistence,
} from "firebase/auth";
import { type FirebaseStorage, getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let firebaseApp: FirebaseApp;
let auth: Auth;
let storage: FirebaseStorage;

function initializeFirebase() {
  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
    auth = getAuth(firebaseApp);
    storage = getStorage(firebaseApp);
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        console.log("Firebase persistence set to LOCAL");
      })
      .catch((error) => {
        console.error("Error setting Firebase persistence:", error);
      });
  } else {
    firebaseApp = getApps()[0];
    auth = getAuth(firebaseApp);
  }
}

export function getFirebaseApp(): FirebaseApp {
  if (!firebaseApp) {
    initializeFirebase();
  }
  return firebaseApp;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    initializeFirebase();
  }
  return auth;
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!storage) {
    initializeFirebase();
  }
  return storage;
}

// Initialize Firebase when this module is imported
initializeFirebase();

// Export initialized instances for direct use
export { auth, firebaseApp, storage };
