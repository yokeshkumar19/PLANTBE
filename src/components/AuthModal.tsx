import { useState, type FormEvent } from "react";
import BrandLogo from "./BrandLogo";
import Icon from "./BotanicalIcon";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (name: string, email: string) => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
}: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const userName = mode === "signup" && name.trim() ? name.trim() : email.split("@")[0] || "Botanical User";
      onLoginSuccess(userName, email.trim() || "user@plantcare.ai");
      onClose();
    }, 600);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#153B27]/50 p-4 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[370px] overflow-hidden rounded-[26px] border border-[#E3E5DC] bg-[#F7F6F0] p-6 shadow-[0_24px_60px_rgba(21,59,39,0.2)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-full bg-[#EDF4EF] text-[#1D3023] hover:bg-[#DCEADF] transition active:scale-95"
        >
          <Icon name="close" size={15} strokeWidth={2.4} />
        </button>

        {/* Official Primary Logo */}
        <div className="flex flex-col items-center text-center pt-2 pb-4">
          <BrandLogo
            variant="primary"
            className="h-20 w-auto max-w-[200px]"
            alt="PlantCare AI Official Brand"
          />
          <p className="mt-2 text-[11px] font-medium tracking-wide uppercase text-[#485C4E]">
            Botanical Intelligence Platform
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="mt-2 flex rounded-[12px] bg-[#EDF4EF] p-1 border border-[#E3E5DC]">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`flex-1 rounded-[10px] py-2 text-[12px] font-bold transition ${
              mode === "signin"
                ? "bg-white text-[#075F32] shadow-xs"
                : "text-[#485C4E] hover:text-[#1D3023]"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-[10px] py-2 text-[12px] font-bold transition ${
              mode === "signup"
                ? "bg-white text-[#075F32] shadow-xs"
                : "text-[#485C4E] hover:text-[#1D3023]"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {mode === "signup" && (
            <div>
              <label className="block text-[11px] font-bold text-[#1D3023]">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Yokesh Kumar"
                className="mt-1 w-full rounded-[12px] border border-[#E3E5DC] bg-white px-3.5 py-2.5 text-[12px] text-[#1D3023] placeholder-[#485C4E]/60 focus:border-[#075F32] focus:outline-none shadow-2xs"
                required={mode === "signup"}
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-[#1D3023]">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. yokesh@example.com"
              className="mt-1 w-full rounded-[12px] border border-[#E3E5DC] bg-white px-3.5 py-2.5 text-[12px] text-[#1D3023] placeholder-[#485C4E]/60 focus:border-[#075F32] focus:outline-none shadow-2xs"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#1D3023]">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-[12px] border border-[#E3E5DC] bg-white px-3.5 py-2.5 text-[12px] text-[#1D3023] placeholder-[#485C4E]/60 focus:border-[#075F32] focus:outline-none shadow-2xs"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 flex h-11 w-full items-center justify-center rounded-[12px] bg-[#075F32] text-[13px] font-bold text-white shadow-[0_6px_16px_rgba(7,95,50,0.25)] hover:bg-[#153B27] active:scale-[0.98] transition disabled:opacity-60"
          >
            {isSubmitting
              ? "Please wait..."
              : mode === "signin"
              ? "Sign In to PlantCare"
              : "Register Account"}
          </button>
        </form>

        <p className="mt-4 text-center text-[11px] text-[#485C4E]">
          Protected by PlantCare AI Security & Privacy Policy
        </p>
      </div>
    </div>
  );
}
