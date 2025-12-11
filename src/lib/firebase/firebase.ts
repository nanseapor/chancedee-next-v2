"use client";

import { FirebaseApp, getApps, initializeApp } from "firebase/app";
import {
  AppCheck,
  ReCaptchaEnterpriseProvider,
  initializeAppCheck,
} from "firebase/app-check";
import {
  Auth,
  browserLocalPersistence,
  getAuth,
  setPersistence,
} from "firebase/auth";
import { Firestore, initializeFirestore } from "firebase/firestore";
import { FirebaseStorage, getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId || !firebaseConfig.storageBucket || !firebaseConfig.messagingSenderId || !firebaseConfig.appId) {
  throw new Error("Firebase API key is not defined");
}

let firebaseApp: FirebaseApp;
let auth: Auth;
let storage: FirebaseStorage;
let appCheck: AppCheck;
let db: Firestore;

function initializeFirebase() {
  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
    auth = getAuth(firebaseApp);
    storage = getStorage(firebaseApp);
    setPersistence(auth, browserLocalPersistence)
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

export function getFirebaseAppCheck(): AppCheck {
  if (!appCheck) {
    if (!firebaseApp) {
      initializeFirebase();
    }
    if (process.env?.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
      appCheck = initializeAppCheck(firebaseApp, {
        provider: new ReCaptchaEnterpriseProvider(
          process.env?.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
        ),
        isTokenAutoRefreshEnabled: true,
      });
    }
  }
  return appCheck;
}

export function getFirebaseFirestore() {
  if (!db) {
    if (!firebaseApp) {
      initializeFirebase();
    }
    db = initializeFirestore(firebaseApp, {
      ignoreUndefinedProperties: true,
    });
  }
  return db;
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
