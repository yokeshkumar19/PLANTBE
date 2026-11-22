import { useState, type FormEvent } from "react";
import BrandLogo from "./BrandLogo";
import Icon from "./BotanicalIcon";
import {
  loginWithEmail,
  signUpWithEmail,
  loginWithGoogle,
  resetPassword,
  formatAuthError,
} from "../services/firebase";

export interface UserSession {
  name: string;
  email: string;
  uid?: string;
  photoURL?: string | null;
  phone?: string | null;
  isGuest?: boolean;
}

interface LoginScreenProps {
  onLoginSuccess: (user: UserSession) => void;
  onCancel?: () => void;
  isModal?: boolean;
  initialMode?: "login" | "signup";
}

export default function LoginScreen({
  onLoginSuccess,
  onCancel,
  isModal = false,
  initialMode = "login",
}: LoginScreenProps) {
  const [view, setView] = useState<"login" | "signup" | "forgot">(initialMode);

  // Email form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Password validation checks for Sign Up
  const hasMinLength = password.length >= 6;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  // Handle Google Auth (Native Capacitor Google Auth on APK, Firebase Auth on web)
  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const firebaseUser = await loginWithGoogle();
      if (firebaseUser) {
        onLoginSuccess({
          name: firebaseUser.displayName || "Google Gardener",
          email: firebaseUser.email || "user@gmail.com",
          uid: firebaseUser.uid,
          photoURL: firebaseUser.photoURL,
          isGuest: false,
        });
      }
    } catch (err: unknown) {
      console.warn("Google sign-in error:", err);
      const msg = formatAuthError(err);
      setErrorMessage(msg);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Handle Login submission
  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    try {
      const firebaseUser = await loginWithEmail(email, password, rememberMe);
      const displayName =
        firebaseUser.displayName ||
        email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ||
        "PlantCare User";

      onLoginSuccess({
        name: displayName,
        email: firebaseUser.email || email.trim().toLowerCase(),
        uid: firebaseUser.uid,
        photoURL: firebaseUser.photoURL,
        isGuest: false,
      });
    } catch (err: unknown) {
      setErrorMessage(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Sign Up submission
  const handleSignUpSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!hasMinLength) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify.");
      return;
    }

    if (!agreeTerms) {
      setErrorMessage("Please accept the Terms of Service & Privacy Policy to continue.");
      return;
    }

    setIsLoading(true);
    try {
      const firebaseUser = await signUpWithEmail(email, password, name.trim());
      onLoginSuccess({
        name: name.trim(),
        email: firebaseUser.email || email.trim().toLowerCase(),
        uid: firebaseUser.uid,
        photoURL: firebaseUser.photoURL,
        isGuest: false,
      });
    } catch (err: unknown) {
      setErrorMessage(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Forgot Password
  const handleForgotPasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address to send the reset link.");
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(email);
      setSuccessMessage(
        "A password reset link has been dispatched to your email address. Check your inbox to set a new password."
      );
    } catch (err: unknown) {
      setErrorMessage(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Continue as Guest option
  const handleGuestEntry = () => {
    onLoginSuccess({
      name: "Guest Gardener",
      email: "guest@plantcare.ai",
      isGuest: true,
    });
  };

  const containerContent = (
    <div className="w-full max-w-[400px] mx-auto flex flex-col items-center px-4 py-6 sm:py-8">
      {/* Brand Logo & Header */}
      <div className="flex flex-col items-center text-center">
        <BrandLogo
          variant="primary"
          className="h-22 sm:h-26 w-auto max-w-[210px] object-contain drop-shadow-[0_8px_20px_rgba(7,95,50,0.12)]"
          alt="PlantCare AI Official Brand Logo"
        />

        <h1 className="mt-3 font-heading text-[22px] font-extrabold text-[#1D3023] tracking-[-0.02em]">
          {view === "login" && "Welcome to PlantCare"}
          {view === "signup" && "Create an Account"}
          {view === "forgot" && "Reset Password"}
        </h1>
        <p className="mt-1 text-[12px] text-[#485C4E] max-w-[320px]">
          {view === "login" && "Sign in with Google or email to access your plant health diagnostics."}
          {view === "signup" && "Join PlantCare AI to monitor health, diagnose issues, and grow greener."}
          {view === "forgot" && "Enter your email address to receive password reset instructions."}
        </p>
      </div>

      {/* Primary: Google Sign In Button */}
      <div className="mt-6 w-full space-y-3">
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={isLoading || isGoogleLoading}
          className="flex h-12 w-full items-center justify-center gap-3 rounded-[14px] border border-[#E3E5DC] bg-white text-[13px] font-bold text-[#1D3023] shadow-xs hover:bg-[#F2F4EE] active:scale-[0.98] transition disabled:opacity-60"
        >
          {isGoogleLoading ? (
            <span className="inline-flex items-center gap-2 text-[#485C4E]">
              <Icon name="spinner" size={18} className="animate-spin text-[#075F32]" />
              <span>Connecting with Google...</span>
            </span>
          ) : (
            <>
              <svg className="size-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.27 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.17 0 9.99 0 12s.46 3.83 1.26 5.42l4.02-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.27 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* Guest Entry Button */}
        <button
          type="button"
          onClick={handleGuestEntry}
          disabled={isLoading || isGoogleLoading}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-[14px] bg-[#EDF4EF] text-[12px] font-bold text-[#075F32] hover:bg-[#DCEADF] active:scale-[0.98] transition disabled:opacity-60"
        >
          <Icon name="leaf" size={14} className="text-[#075F32]" />
          <span>Continue as Guest</span>
        </button>
      </div>

      {/* Divider */}
      <div className="relative my-5 w-full flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#E3E5DC]" />
        </div>
        <span className="relative bg-[#F7F6F0] px-3 text-[11px] font-semibold text-[#485C4E]">
          or use email
        </span>
      </div>

      {/* Mode Switcher Tabs (Log In vs Sign Up) */}
      {view !== "forgot" && (
        <div className="w-full flex rounded-[14px] bg-[#EDF4EF] p-1 border border-[#E3E5DC]">
          <button
            type="button"
            onClick={() => {
              setView("login");
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 rounded-[10px] py-2 text-[12px] font-bold transition ${
              view === "login"
                ? "bg-white text-[#075F32] shadow-xs"
                : "text-[#485C4E] hover:text-[#1D3023]"
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setView("signup");
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 rounded-[10px] py-2 text-[12px] font-bold transition ${
              view === "signup"
                ? "bg-white text-[#075F32] shadow-xs"
                : "text-[#485C4E] hover:text-[#1D3023]"
            }`}
          >
            Sign Up
          </button>
        </div>
      )}

      {/* Feedback Alert Banners */}
      {errorMessage && (
        <div className="mt-4 w-full rounded-[14px] border border-[#C93C36]/25 bg-[#FFF0EF] px-3.5 py-2.5 text-[11.5px] font-semibold text-[#C93C36] flex items-start gap-2 shadow-2xs">
          <Icon name="warning" size={15} className="text-[#C93C36] shrink-0 mt-0.5" />
          <span className="leading-tight flex-1">{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mt-4 w-full rounded-[14px] border border-[#075F32]/25 bg-[#EDF4EF] px-3.5 py-2.5 text-[11.5px] font-semibold text-[#075F32] flex items-start gap-2 shadow-2xs">
          <Icon name="leaf" size={15} className="text-[#075F32] shrink-0 mt-0.5" />
          <span className="leading-tight flex-1">{successMessage}</span>
        </div>
      )}

      {/* VIEW 1: LOGIN FORM */}
      {view === "login" && (
        <form onSubmit={handleLoginSubmit} className="mt-4 w-full space-y-3.5">
          {/* Email */}
          <div>
            <label className="block text-[11.5px] font-bold text-[#1D3023]">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. gardener@plantcare.ai"
              autoComplete="email"
              disabled={isLoading || isGoogleLoading}
              className="mt-1 w-full rounded-[12px] border border-[#E3E5DC] bg-white px-3.5 py-2.5 text-[13px] text-[#1D3023] placeholder-[#485C4E]/50 focus:border-[#075F32] focus:ring-1 focus:ring-[#075F32] focus:outline-none shadow-2xs transition"
              required
            />
          </div>

          {/* Password with Eye Toggle */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-[11.5px] font-bold text-[#1D3023]">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setView("forgot");
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="text-[11px] font-bold text-[#075F32] hover:text-[#153B27] hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={isLoading || isGoogleLoading}
                className="w-full rounded-[12px] border border-[#E3E5DC] bg-white pl-3.5 pr-11 py-2.5 text-[13px] text-[#1D3023] placeholder-[#485C4E]/50 focus:border-[#075F32] focus:ring-1 focus:ring-[#075F32] focus:outline-none shadow-2xs transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-[#485C4E] hover:text-[#075F32] active:scale-95 transition"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center gap-2 pt-0.5">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="size-4 rounded-[4px] border-[#E3E5DC] text-[#075F32] accent-[#075F32] focus:ring-[#075F32]"
            />
            <label htmlFor="rememberMe" className="text-[11.5px] font-medium text-[#1D3023] cursor-pointer select-none">
              Remember me on this device
            </label>
          </div>

          {/* Forest Green Login Button */}
          <button
            type="submit"
            disabled={isLoading || isGoogleLoading}
            className="mt-3 flex h-11.5 w-full items-center justify-center gap-2 rounded-[14px] bg-[#075F32] text-[13px] font-bold text-white shadow-[0_8px_20px_rgba(7,95,50,0.25)] hover:bg-[#153B27] active:scale-[0.98] transition disabled:opacity-60"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <Icon name="spinner" size={16} className="animate-spin text-white" />
                <span>Signing in...</span>
              </span>
            ) : (
              "Log In with Email"
            )}
          </button>
        </form>
      )}

      {/* VIEW 2: SIGN UP FORM */}
      {view === "signup" && (
        <form onSubmit={handleSignUpSubmit} className="mt-4 w-full space-y-3.5">
          {/* Full Name */}
          <div>
            <label className="block text-[11.5px] font-bold text-[#1D3023]">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Yokesh Kumar"
              autoComplete="name"
              disabled={isLoading || isGoogleLoading}
              className="mt-1 w-full rounded-[12px] border border-[#E3E5DC] bg-white px-3.5 py-2.5 text-[13px] text-[#1D3023] placeholder-[#485C4E]/50 focus:border-[#075F32] focus:ring-1 focus:ring-[#075F32] focus:outline-none shadow-2xs transition"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-[11.5px] font-bold text-[#1D3023]">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. gardener@plantcare.ai"
              autoComplete="email"
              disabled={isLoading || isGoogleLoading}
              className="mt-1 w-full rounded-[12px] border border-[#E3E5DC] bg-white px-3.5 py-2.5 text-[13px] text-[#1D3023] placeholder-[#485C4E]/50 focus:border-[#075F32] focus:ring-1 focus:ring-[#075F32] focus:outline-none shadow-2xs transition"
              required
            />
          </div>

          {/* Password with Eye Toggle */}
          <div>
            <label className="block text-[11.5px] font-bold text-[#1D3023]">
              Password
            </label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a secure password"
                autoComplete="new-password"
                disabled={isLoading || isGoogleLoading}
                className="w-full rounded-[12px] border border-[#E3E5DC] bg-white pl-3.5 pr-11 py-2.5 text-[13px] text-[#1D3023] placeholder-[#485C4E]/50 focus:border-[#075F32] focus:ring-1 focus:ring-[#075F32] focus:outline-none shadow-2xs transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-[#485C4E] hover:text-[#075F32] active:scale-95 transition"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-[11.5px] font-bold text-[#1D3023]">
              Confirm Password
            </label>
            <div className="relative mt-1">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                disabled={isLoading || isGoogleLoading}
                className="w-full rounded-[12px] border border-[#E3E5DC] bg-white pl-3.5 pr-11 py-2.5 text-[13px] text-[#1D3023] placeholder-[#485C4E]/50 focus:border-[#075F32] focus:ring-1 focus:ring-[#075F32] focus:outline-none shadow-2xs transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((p) => !p)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-[#485C4E] hover:text-[#075F32] active:scale-95 transition"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Password Validation Feedback Indicator */}
          {password.length > 0 && (
            <div className="rounded-[12px] bg-[#EDF4EF]/70 p-2.5 border border-[#E3E5DC] space-y-1 text-[11px]">
              <div className={`flex items-center gap-1.5 font-medium ${hasMinLength ? "text-[#075F32]" : "text-[#485C4E]"}`}>
                <Icon name={hasMinLength ? "check" : "minus"} size={11} strokeWidth={2.4} />
                <span>At least 6 characters</span>
              </div>
              <div className={`flex items-center gap-1.5 font-medium ${hasLetter && hasNumber ? "text-[#075F32]" : "text-[#485C4E]"}`}>
                <Icon name={hasLetter && hasNumber ? "check" : "minus"} size={11} strokeWidth={2.4} />
                <span>Contains letters and numbers</span>
              </div>
              {confirmPassword.length > 0 && (
                <div className={`flex items-center gap-1.5 font-medium ${passwordsMatch ? "text-[#075F32]" : "text-[#C93C36]"}`}>
                  <Icon name={passwordsMatch ? "check" : "close"} size={11} strokeWidth={2.4} />
                  <span>{passwordsMatch ? "Passwords match" : "Passwords do not match"}</span>
                </div>
              )}
            </div>
          )}

          {/* Terms and Privacy Policy Checkbox */}
          <div className="flex items-start gap-2 pt-1">
            <input
              type="checkbox"
              id="agreeTerms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 size-4 rounded-[4px] border-[#E3E5DC] text-[#075F32] accent-[#075F32] focus:ring-[#075F32]"
              required
            />
            <label htmlFor="agreeTerms" className="text-[11px] text-[#485C4E] leading-snug cursor-pointer select-none">
              I agree to the Terms of Service and Privacy Policy.
            </label>
          </div>

          {/* Forest Green Create Account Button */}
          <button
            type="submit"
            disabled={isLoading || isGoogleLoading || !agreeTerms || !hasMinLength}
            className="mt-3 flex h-11.5 w-full items-center justify-center gap-2 rounded-[14px] bg-[#075F32] text-[13px] font-bold text-white shadow-[0_8px_20px_rgba(7,95,50,0.25)] hover:bg-[#153B27] active:scale-[0.98] transition disabled:opacity-60"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <Icon name="spinner" size={16} className="animate-spin text-white" />
                <span>Creating Account...</span>
              </span>
            ) : (
              "Create Account"
            )}
          </button>
        </form>
      )}

      {/* VIEW 3: FORGOT PASSWORD */}
      {view === "forgot" && (
        <form onSubmit={handleForgotPasswordSubmit} className="mt-4 w-full space-y-3.5">
          <div>
            <label className="block text-[11.5px] font-bold text-[#1D3023]">
              Account Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. gardener@plantcare.ai"
              autoComplete="email"
              disabled={isLoading}
              className="mt-1 w-full rounded-[12px] border border-[#E3E5DC] bg-white px-3.5 py-2.5 text-[13px] text-[#1D3023] placeholder-[#485C4E]/50 focus:border-[#075F32] focus:ring-1 focus:ring-[#075F32] focus:outline-none shadow-2xs transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-3 flex h-11.5 w-full items-center justify-center gap-2 rounded-[14px] bg-[#075F32] text-[13px] font-bold text-white shadow-[0_8px_20px_rgba(7,95,50,0.25)] hover:bg-[#153B27] active:scale-[0.98] transition disabled:opacity-60"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <Icon name="spinner" size={16} className="animate-spin text-white" />
                <span>Sending Reset Link...</span>
              </span>
            ) : (
              "Send Reset Link"
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setView("login");
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className="w-full inline-flex items-center justify-center gap-1 text-[12px] font-bold text-[#075F32] hover:underline pt-2"
          >
            <Icon name="arrow" size={12} className="rotate-180" />
            <span>Back to Log In</span>
          </button>
        </form>
      )}
    </div>
  );

  // If used as modal
  if (isModal) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#153B27]/50 p-4 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={onCancel}
      >
        <div
          className="relative w-full max-w-[410px] max-h-[92vh] overflow-y-auto rounded-[28px] border border-[#E3E5DC] bg-[#F7F6F0] shadow-[0_24px_60px_rgba(21,59,39,0.25)]"
          onClick={(e) => e.stopPropagation()}
        >
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              aria-label="Close"
              className="absolute top-4 right-4 z-10 flex size-8 items-center justify-center rounded-full bg-white/80 text-[#1D3023] hover:bg-white shadow-xs transition"
            >
              <Icon name="close" size={15} strokeWidth={2.4} />
            </button>
          )}
          {containerContent}
        </div>
      </div>
    );
  }

  // Full-screen onboarding/login view
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#F7F6F0] overflow-y-auto safe-area-inset py-6">
      <div className="w-full max-w-[430px] my-auto sm:rounded-[36px] sm:border sm:border-[#E3E5DC] sm:bg-[#F7F6F0] sm:shadow-[0_24px_60px_rgba(21,59,39,0.12)] flex flex-col justify-center">
        {containerContent}
      </div>
    </div>
  );
}
