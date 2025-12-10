import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { getFirebaseAuth } from "./firebase";

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

const auth = getFirebaseAuth();

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

export const signInWithFacebook = () => signInWithPopup(auth, facebookProvider);

export const signUpWithEmail = (email: string, password: string) =>
  createUserWithEmailAndPassword(auth, email, password);

export const signInWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);
