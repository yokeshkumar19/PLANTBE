import { useState, useEffect } from "react";
import { getSpeciesImage } from "../utils/speciesImages";

interface PlantThumbnailProps {
  src?: string | null;
  alt?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export default function PlantThumbnail({
  src,
  alt = "Botanical Specimen",
  size = "md",
  className = "",
}: PlantThumbnailProps) {
  // Verified loaded image URL (only set when verified successfully off-screen)
  const [verifiedSrc, setVerifiedSrc] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "loaded" | "fallback">("loading");

  const sizeClasses = {
    sm: "size-[44px] rounded-[10px]",
    md: "size-[56px] rounded-[12px]",
    lg: "size-[64px] rounded-[14px]",
    xl: "size-[80px] rounded-[18px]",
  }[size];

  const iconSizes = {
    sm: 18,
    md: 22,
    lg: 26,
    xl: 32,
  }[size];

  // Derive plant initial for botanical insignia badge
  const initial = (alt.replace(/[^a-zA-Z]/g, "").charAt(0) || "P").toUpperCase();

  useEffect(() => {
    let active = true;

    // Check if initial src looks usable (data URL, valid http, or local path)
    const rawCandidate = src && src.trim().length > 0 ? src.trim() : null;
    const speciesCandidate = getSpeciesImage(alt);

    // List of candidate URLs to try in priority order
    const candidates: string[] = [];
    if (rawCandidate) {
      candidates.push(rawCandidate);
    }
    if (speciesCandidate && speciesCandidate !== rawCandidate) {
      candidates.push(speciesCandidate);
    }

    if (candidates.length === 0) {
      setStatus("fallback");
      setVerifiedSrc(null);
      return;
    }

    setStatus("loading");

    // Sequential candidate loader
    let candidateIndex = 0;

    const tryNextCandidate = () => {
      if (!active) return;

      if (candidateIndex >= candidates.length) {
        setStatus("fallback");
        setVerifiedSrc(null);
        return;
      }

      const currentCandidate = candidates[candidateIndex];
      candidateIndex++;

      const img = new Image();
      img.onload = () => {
        if (!active) return;
        setVerifiedSrc(currentCandidate);
        setStatus("loaded");
      };
      img.onerror = () => {
        if (!active) return;
        // Try the next candidate (e.g. species fallback photo)
        tryNextCandidate();
      };
      img.src = currentCandidate;
    };

    tryNextCandidate();

    return () => {
      active = false;
    };
  }, [src, alt]);

  // Botanical insignia fallback view: lush mint surface, subtle border, leaf motif, and species initial
  const renderFallback = () => (
    <div
      className={`relative flex shrink-0 items-center justify-center bg-gradient-to-br from-[#EDF4EF] via-[#E2ECE5] to-[#D5E6D9] text-[#075F32] border border-[#DDE5DF] shadow-2xs select-none ${sizeClasses} ${className}`}
      aria-label={alt}
    >
      {/* Decorative leaf glyph */}
      <svg
        width={iconSizes}
        height={iconSizes}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-80"
      >
        <path d="M12 22V9" />
        <path d="M12 14C5 13 4 8 4 5c5 0 8 2.5 8 7" />
        <path d="M12 10c.5-5 3.6-7 8-7 0 4-1.8 8-8 9" />
      </svg>

      {/* Species Initial Insignia in bottom-right corner for size md, lg, xl */}
      {size !== "sm" && (
        <span
          className="absolute bottom-1 right-1 flex size-4 items-center justify-center rounded-full bg-white/90 text-[8.5px] font-bold text-[#075F32] shadow-2xs border border-[#A8C9AE]/40 leading-none"
          title={alt}
        >
          {initial}
        </span>
      )}
    </div>
  );

  if (status === "fallback" || !verifiedSrc) {
    return renderFallback();
  }

  return (
    <div
      className={`relative shrink-0 overflow-hidden border border-[#DDE5DF] bg-[#EDF4EF] shadow-2xs ${sizeClasses} ${className}`}
    >
      {/* Underlying botanical surface */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#EDF4EF] to-[#D5E6D9] text-[#075F32]">
        <svg
          width={iconSizes}
          height={iconSizes}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-40"
        >
          <path d="M12 22V9" />
          <path d="M12 14C5 13 4 8 4 5c5 0 8 2.5 8 7" />
          <path d="M12 10c.5-5 3.6-7 8-7 0 4-1.8 8-8 9" />
        </svg>
      </div>

      {/* Pre-verified Image (mounted ONLY when 100% verified to prevent browser broken image icon) */}
      <img
        src={verifiedSrc}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300 opacity-100"
        style={{ fontSize: 0, color: "transparent" }}
      />
    </div>
  );
}
