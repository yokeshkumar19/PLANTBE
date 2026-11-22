import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  GoogleAuthProvider,
  signInWithPopup,
  type Auth,
  type User as FirebaseUser,
} from "firebase/auth";
import { Capacitor } from "@capacitor/core";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";

// Existing Firebase configuration from environment / google-services
const firebaseConfig = {
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAK4CLqsRDj4m1jKtjnoEKIY2HBfxubzd0").replace(/['"]/g, ""),
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "plantcare-bea50.firebaseapp.com").replace(/['"]/g, ""),
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID || "plantcare-bea50").replace(/['"]/g, ""),
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "plantcare-bea50.firebasestorage.app").replace(/['"]/g, ""),
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "766383592694").replace(/['"]/g, ""),
  appId: (import.meta.env.VITE_FIREBASE_APP_ID || "1:766383592694:web:9dfd711cd1247cc6ce88d7").replace(/['"]/g, ""),
};

// Singleton App Initialization (reusing existing app if already initialized)
export const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Auth Instance
export const auth: Auth = getAuth(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

/**
 * Format Firebase Auth errors into clear, user-friendly messages
 */
export function formatAuthError(error: unknown): string {
  if (!error || typeof error !== "object") {
    return "An unknown error occurred. Please try again.";
  }

  const err = error as { code?: string; message?: string };
  const code = err.code || "";

  switch (code) {
    case "auth/invalid-email":
      return "The email address is improperly formatted.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact support.";
    case "auth/user-not-found":
      return "No account found with this email. Please sign up.";
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password. Please verify and try again.";
    case "auth/email-already-in-use":
      return "An account with this email address already exists. Try logging in.";
    case "auth/weak-password":
      return "Password is too weak. Please use at least 6 characters.";
    case "auth/operation-not-allowed":
      return "Email/Password sign-in is not enabled in Firebase Console.";
    case "auth/network-request-failed":
      return "Network connection error. Please check your internet connection.";
    case "auth/too-many-requests":
      return "Too many unsuccessful attempts. Please wait a moment and try again.";
    case "auth/popup-closed-by-user":
      return "Google sign-in was canceled before completing.";
    case "auth/cancelled":
      return "Sign-in was cancelled.";
    case "auth/unauthorized-domain":
      return "Sign-in via this local network IP is not authorized in Firebase. Please use Mobile Number login or Continue as Guest.";
    default:
      if (err.message && !err.message.includes("Firebase:")) {
        return err.message;
      }
      return "Authentication failed. Please check your details and try again.";
  }
}

/**
 * Sign Up with Email and Password
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<FirebaseUser> {
  const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  if (displayName.trim()) {
    try {
      await updateProfile(userCredential.user, {
        displayName: displayName.trim(),
      });
    } catch (e) {
      console.warn("Failed to update user profile display name:", e);
    }
  }
  return userCredential.user;
}

/**
 * Log In with Email and Password
 */
export async function loginWithEmail(
  email: string,
  password: string,
  rememberMe: boolean = true
): Promise<FirebaseUser> {
  try {
    await setPersistence(
      auth,
      rememberMe ? browserLocalPersistence : browserSessionPersistence
    );
  } catch (e) {
    console.warn("Persistence setting not supported in this environment:", e);
  }

  const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
  return userCredential.user;
}

/**
 * Log In with Google
 * Reuses native Capacitor Google Auth if on mobile, or Firebase Web Popup on web
 */
export async function loginWithGoogle(): Promise<FirebaseUser | null> {
  if (Capacitor.isNativePlatform()) {
    try {
      const result = await FirebaseAuthentication.signInWithGoogle();
      if (auth.currentUser) {
        return auth.currentUser;
      }
      if (result.user) {
        return {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoUrl,
        } as unknown as FirebaseUser;
      }
    } catch (err: unknown) {
      console.warn("Native Google sign-in failed, falling back to Web Popup:", err);
    }
  }

  // Web fallback using Firebase GoogleAuthProvider
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

/**
 * Log Out
 */
export async function logoutUser(): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    try {
      await FirebaseAuthentication.signOut();
    } catch (e) {
      console.warn("Native sign-out error:", e);
    }
  }
  await signOut(auth);
}

/**
 * Send Password Reset Email
 */
export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

/**
 * Auth state listener
 */
export function subscribeToAuthChanges(
  callback: (user: FirebaseUser | null) => void
): () => void {
  return onAuthStateChanged(auth, callback);
}
