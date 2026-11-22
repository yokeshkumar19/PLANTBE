import { useState } from "react";
import type { PlantAnalysisResult } from "../types/plant";
import Icon from "./BotanicalIcon";

export interface DiseaseInfo {
  isHealthy: boolean;
  isUnclear: boolean;
  diseaseName: string;
  label: string;
  badgeType: "healthy" | "diseased" | "unclear";
  explanation: string;
}

export function resolveDiseaseInfo(result: PlantAnalysisResult): DiseaseInfo {
  const condLower = (result.condition || "").toLowerCase().trim();
  const disLower = (result.disease_name || "").toLowerCase().trim();
  const confLower = (result.confidence || "").toLowerCase().trim();
  const plantLower = (result.plant || "").toLowerCase().trim();

  // 1. Check if the image or diagnosis is unclear / uncertain
  const isUnclear =
    disLower === "uncertain" ||
    disLower.includes("unclear") ||
    condLower.includes("uncertain") ||
    condLower.includes("unable to identify") ||
    plantLower.includes("unknown") ||
    (confLower === "low" &&
      (condLower.includes("unclear") ||
        condLower.includes("ambiguous") ||
        condLower.includes("poor") ||
        condLower.includes("blurry") ||
        condLower.includes("low quality")));

  // 2. Check if plant is healthy / no active disease
  const isHealthy =
    !isUnclear &&
    (disLower === "none" ||
      disLower === "healthy" ||
      condLower.includes("healthy") ||
      condLower.includes("normal") ||
      condLower.includes("no obvious disease") ||
      condLower.includes("no disease") ||
      condLower.includes("vigorous"));

  if (isUnclear) {
    return {
      isHealthy: false,
      isUnclear: true,
      diseaseName: "Unable to identify reliably",
      label: "Suspected Disease",
      badgeType: "unclear",
      explanation:
        result.disease_explanation ||
        result.visual_evidence ||
        "The image resolution, lighting, or visible symptoms are insufficient to confirm a specific disease reliably. Capture a clear, close-up photo under natural lighting.",
    };
  }

  if (isHealthy) {
    return {
      isHealthy: true,
      isUnclear: false,
      diseaseName: "No obvious disease detected",
      label: "Health Status",
      badgeType: "healthy",
      explanation:
        result.disease_explanation ||
        "The foliage exhibits normal pigmentation and intact cellular tissue with no visible indicators of active fungal, bacterial, or viral pathogens.",
    };
  }

  // 3. Suspected Disease detected
  let rawName = "";
  if (
    result.disease_name &&
    result.disease_name.toLowerCase() !== "none" &&
    result.disease_name.toLowerCase() !== "uncertain"
  ) {
    rawName = result.disease_name;
  } else {
    rawName = result.condition;
  }

  // Strip accidental prefixes from the raw string to get the pure disease name (e.g. "Early Blight")
  const cleanedName = rawName
    .replace(/^(suspected|possible|likely|probable|potential)\s+/i, "")
    .trim() || rawName;

  return {
    isHealthy: false,
    isUnclear: false,
    diseaseName: cleanedName,
    label: "Suspected Disease",
    badgeType: "diseased",
    explanation:
      result.disease_explanation ||
      result.visual_evidence ||
      `Foliar markers and visual patterns are consistent with ${cleanedName}. Preliminary screening based on visible image evidence.`,
  };
}

interface DiseaseSectionProps {
  result: PlantAnalysisResult;
  onLearnMore?: (diseaseName: string) => void;
}

export default function DiseaseSection({ result, onLearnMore }: DiseaseSectionProps) {
  const { isHealthy, isUnclear, diseaseName, label, badgeType, explanation } =
    resolveDiseaseInfo(result);

  const conf = result.confidence || "Medium";
  const confLower = conf.toLowerCase();

  const confBadgeStyle =
    confLower === "high"
      ? "bg-[#EDF4EF] text-[#075F32] border-[#075F32]/25"
      : confLower === "low"
      ? "bg-[#FFF0EF] text-[#C93C36] border-[#C93C36]/25"
      : "bg-[#FEF6E6] text-[#B45309] border-[#B45309]/25";

  const cardStyle = isHealthy
    ? "bg-[#EDF4EF]/70 border-[#A8C9AE]/70"
    : isUnclear
    ? "bg-[#FEF8EE] border-[#FDE68A]"
    : "bg-[#FFF7F5] border-[#FADCD9]";

  const nameColor = isHealthy
    ? "text-[#075F32]"
    : isUnclear
    ? "text-[#B45309]"
    : "text-[#C93C36]";

  const labelBadgeStyle = isHealthy
    ? "bg-[#075F32] text-white"
    : isUnclear
    ? "bg-[#B45309] text-white"
    : "bg-[#C93C36] text-white";

  return (
    <section
      aria-label="Disease Identification"
      className={`mt-3.5 rounded-[18px] border p-4 shadow-2xs transition-all ${cardStyle}`}
    >
      {/* Top Header Row: Label & Confidence */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider ${labelBadgeStyle}`}
        >
          {label}
        </span>

        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${confBadgeStyle}`}
        >
          {conf} Confidence
        </span>
      </div>

      {/* Prominently Displayed Disease Name (Visual Focus) */}
      <div className="mt-2.5">
        <h3
          className={`font-heading text-[20px] font-extrabold leading-snug tracking-tight ${nameColor}`}
        >
          {diseaseName}
        </h3>
      </div>

      {/* Brief, Understandable Disease Explanation */}
      {explanation && (
        <p className="mt-2 text-[12px] leading-relaxed text-[#1D3023]/85 font-medium border-t border-black/5 pt-2">
          {explanation}
        </p>
      )}

      {/* Feature 1: What it is, causes, symptoms & prevention guide link */}
      {onLearnMore && !isHealthy && !isUnclear && (
        <div className="mt-2.5 pt-2 border-t border-black/5 flex justify-end">
          <button
            type="button"
            onClick={() => onLearnMore(diseaseName)}
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#075F32] hover:underline"
          >
            <Icon name="book" size={13} className="text-[#075F32]" />
            <span>Causes & Prevention Guide</span>
            <Icon name="arrow" size={11} strokeWidth={2.4} />
          </button>
        </div>
      )}
    </section>
  );
}
