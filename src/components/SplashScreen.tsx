import { useEffect, useState } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState<"initial" | "symbol" | "wordmark" | "tagline" | "fadeout">("initial");

  useEffect(() => {
    // Respect reduced-motion preferences
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setPhase("tagline");
      const tFade = setTimeout(() => setPhase("fadeout"), 1200);
      const tEnd = setTimeout(() => onComplete(), 1600);
      return () => {
        clearTimeout(tFade);
        clearTimeout(tEnd);
      };
    }

    // Refined professional botanical animation timeline (total ~2.6s)
    const t1 = setTimeout(() => setPhase("symbol"), 200);
    const t2 = setTimeout(() => setPhase("wordmark"), 800);
    const t3 = setTimeout(() => setPhase("tagline"), 1400);
    const t4 = setTimeout(() => setPhase("fadeout"), 2400);
    const t5 = setTimeout(() => onComplete(), 2800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#F7F6F0] select-none transition-opacity duration-400 ease-out ${
        phase === "fadeout" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      aria-label="PlantCare AI Splash Screen"
      role="dialog"
      aria-modal="true"
    >
      {/* Centered Primary Logo Animation Stage */}
      <div
        className="relative flex flex-col items-center px-4 text-center"
      >
        {/* Subtle Ambient Botanical Radial Glow */}
        <div
          className={`absolute inset-0 -m-10 rounded-full bg-[#075F32]/8 blur-3xl transition-all duration-1000 ${
            phase !== "initial" ? "scale-125 opacity-100" : "scale-75 opacity-0"
          }`}
        />

        {/* 1. Leaf Symbol with Neural Network Details */}
        <div
          className={`relative transition-all duration-700 ease-out ${
            phase !== "initial"
              ? "scale-100 opacity-100 translate-y-0"
              : "scale-85 opacity-0 translate-y-4"
          }`}
        >
          <img
            src="/assets/logo_leaf_primary.png"
            alt="PlantCare AI Leaf Symbol"
            className="h-28 sm:h-32 w-auto object-contain drop-shadow-[0_8px_20px_rgba(7,95,50,0.12)]"
          />
        </div>

        {/* 2. Official PlantCare AI Wordmark */}
        <div
          className={`mt-4 transition-all duration-600 ease-out ${
            phase === "wordmark" || phase === "tagline" || phase === "fadeout"
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-3"
          }`}
        >
          <img
            src="/assets/logo_wordmark.png"
            alt="PlantCare AI Wordmark"
            className="h-10 sm:h-12 w-auto max-w-[280px] sm:max-w-[320px] object-contain drop-shadow-xs"
          />
        </div>

        {/* 3. Small Botanical Tagline */}
        <p
          className={`mt-3 text-[12px] sm:text-[13px] font-semibold tracking-[0.08em] uppercase text-[#485C4E] transition-all duration-500 delay-100 ${
            phase === "tagline" || phase === "fadeout"
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-2"
          }`}
        >
          Grow better. Live greener.
        </p>
      </div>

      {/* Bottom Progress Dots */}
      <div className="absolute bottom-8 flex flex-col items-center gap-1.5 text-center">
        <div className="flex items-center gap-1.5">
          <span
            className={`size-1.5 rounded-full bg-[#075F32] transition-all duration-300 ${
              phase === "symbol" ? "scale-125 opacity-100" : "opacity-40"
            }`}
          />
          <span
            className={`size-1.5 rounded-full bg-[#075F32] transition-all duration-300 ${
              phase === "wordmark" ? "scale-125 opacity-100" : "opacity-40"
            }`}
          />
          <span
            className={`size-1.5 rounded-full bg-[#075F32] transition-all duration-300 ${
              phase === "tagline" ? "scale-125 opacity-100" : "opacity-40"
            }`}
          />
        </div>
      </div>
    </div>
  );
}
