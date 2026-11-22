import { useState } from "react";
import type { ScanHistoryItem } from "../types/plant";
import PlantThumbnail from "./PlantThumbnail";
import DiseaseSection from "./DiseaseSection";
import Icon from "./BotanicalIcon";

interface ScanDetailModalProps {
  scan: ScanHistoryItem | null;
  onClose: () => void;
  onSaveToMyPlants?: (species: string, photoUrl?: string) => void;
  onLearnMoreDisease?: (diseaseName: string) => void;
  onDeleteScan?: (scanId: string) => void;
}

export default function ScanDetailModal({
  scan,
  onClose,
  onSaveToMyPlants,
  onLearnMoreDisease,
  onDeleteScan,
}: ScanDetailModalProps) {
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  if (!scan) return null;

  const result = scan.result;

  const rawSymptoms = Array.isArray(result.symptoms)
    ? result.symptoms
    : result.symptoms
        ? result.symptoms
            .split("\n")
            .map((s) => s.replace(/^[•\-*]\s*/, "").trim())
            .filter(Boolean)
        : ["No visible symptoms detected."];

  const rawCare = Array.isArray(result.care)
    ? result.care
    : result.care
        ? result.care
            .split("\n")
            .map((c) => c.replace(/^[•\-*]\s*/, "").trim())
            .filter(Boolean)
        : ["Continue regular observation and optimal watering."];

  // Maximum 3 concise points for default view
  const conciseSymptoms = rawSymptoms.slice(0, 3);
  const additionalSymptoms = rawSymptoms.slice(3);

  // Maximum 3 actionable points for default view
  const conciseCare = rawCare.slice(0, 3);
  const additionalCare = rawCare.slice(3);

  const warningsList = result.warning
    ? Array.isArray(result.warning)
      ? result.warning
      : [result.warning]
    : [
        "Precautionary note: Photographic analysis is a preliminary screening and should not be considered a confirmed laboratory diagnosis. Consult local extension services for confirmation.",
      ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#153B27]/40 p-4 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-h-[85vh] w-full max-w-[370px] overflow-y-auto rounded-[24px] border border-[#E3E5DC] bg-white p-5 shadow-[0_20px_50px_rgba(21,61,39,0.18)] no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-full bg-[#EDF4EF] text-[#1D3023] hover:bg-[#D7E6D9] transition"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* 1. Plant Image & Plant Name */}
        <div className="flex items-start gap-3.5 pr-8">
          <PlantThumbnail
            src={scan.previewUrl}
            alt={scan.name}
            size="lg"
            className="shadow-2xs"
          />
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#075F32] uppercase tracking-wider">
              Botanical Specimen
            </span>
            <h3 className="font-heading text-[17px] font-extrabold text-[#1D3023] leading-snug">
              {scan.name}
            </h3>
            <p className="mt-0.5 text-[11px] text-[#485C4E] font-medium">
              Scanned {scan.date}
            </p>
          </div>
        </div>

        {/* 2, 3, 4: Dedicated Disease Identification Section Prominently Below Plant Name */}
        <DiseaseSection result={result} onLearnMore={onLearnMoreDisease} />

        {/* 5. Observed Symptoms (Maximum 3 concise points) */}
        <div className="mt-3.5 border-t border-[#E3E5DC]/70 pt-3.5">
          <div className="flex items-center justify-between">
            <h4 className="font-heading text-[11.5px] font-bold text-[#1D3023] flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-[#075F32]" />
              Observed Symptoms
            </h4>
            <span className="text-[11px] text-[#485C4E]">
              {conciseSymptoms.length} points
            </span>
          </div>
          <ul className="mt-2 space-y-1.5 text-[11px] text-[#1D3023]/80 leading-relaxed pl-1">
            {conciseSymptoms.map((item, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-[#075F32] font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 6. Recommended Care (Maximum 3 actionable points) */}
        <div className="mt-3.5 border-t border-[#E3E5DC]/70 pt-3.5">
          <div className="flex items-center justify-between">
            <h4 className="font-heading text-[11.5px] font-bold text-[#075F32] flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-[#075F32]" />
              Recommended Care
            </h4>
            <span className="text-[11px] text-[#075F32]/80">
              {conciseCare.length} actions
            </span>
          </div>
          <ul className="mt-2 space-y-1.5 text-[11px] text-[#153B27] leading-relaxed pl-1">
            {conciseCare.map((item, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <Icon name="check" size={12} strokeWidth={2.4} className="text-[#075F32] shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 7. Precautionary Warning */}
        {warningsList.length > 0 && (
          <div className="mt-3.5 border-t border-[#E3E5DC]/70 pt-3.5">
            <h4 className="font-heading text-[11.5px] font-bold text-[#C93C36] flex items-center gap-1.5">
              <Icon name="warning" size={13} className="text-[#C93C36]" />
              Precautionary Warning
            </h4>
            <ul className="mt-1.5 space-y-1 text-[11px] text-[#8C3A35] leading-relaxed pl-1">
              {warningsList.map((warn, idx) => (
                <li key={idx} className="flex items-start gap-1">
                  <span>•</span>
                  <span>{warn}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 8. Expandable Detailed Analysis */}
        <div className="mt-3.5">
          <button
            type="button"
            onClick={() => setShowDetailedAnalysis((prev) => !prev)}
            className="flex w-full items-center justify-between rounded-[13px] bg-[#F4F7F4] px-3 py-2 text-left text-[11px] font-bold text-[#1D3023] hover:bg-[#EAEFEA] transition"
          >
            <span>
              {showDetailedAnalysis ? "Hide Detailed Analysis" : "View Detailed Botanical Analysis"}
            </span>
            <span className="text-[12px] text-[#485C4E]">
              {showDetailedAnalysis ? "▴" : "▾"}
            </span>
          </button>

          {showDetailedAnalysis && (
            <div className="mt-2 space-y-2 rounded-[14px] border border-[#E3E5DC] bg-[#FAF9F5] p-3 animate-in fade-in duration-200">
              {result.visual_evidence && (
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#075F32]">
                    Visual Evidence Markers
                  </p>
                  <p className="mt-1 text-[11px] text-[#1D3023]/85 leading-relaxed bg-white p-2 rounded-[8px] border border-[#E3E5DC]">
                    {result.visual_evidence}
                  </p>
                </div>
              )}

              {additionalSymptoms.length > 0 && (
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#075F32]">
                    Additional Symptoms
                  </p>
                  <ul className="mt-1 space-y-1 text-[11px] text-[#1D3023]/85 bg-white p-2 rounded-[8px] border border-[#E3E5DC]">
                    {additionalSymptoms.map((s, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-[#075F32]">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {additionalCare.length > 0 && (
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#075F32]">
                    Further Recommendations
                  </p>
                  <ul className="mt-1 space-y-1 text-[11px] text-[#153B27] bg-white p-2 rounded-[8px] border border-[#E3E5DC]">
                    {additionalCare.map((c, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <Icon name="check" size={11} strokeWidth={2.4} className="text-[#075F32] shrink-0 mt-0.5" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="rounded-[8px] bg-[#EDF4EF] p-2 text-[11px] leading-relaxed text-[#153B27] border border-[#A8C9AE]/30">
                <span className="font-bold">Probabilistic screening: </span>
                Image screening indicates probable condition. Laboratory assays recommended for commercial confirmation.
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          {onSaveToMyPlants && (
            <button
              type="button"
              onClick={() => onSaveToMyPlants(scan.name, scan.previewUrl)}
              className="flex-1 flex h-10 items-center justify-center gap-1.5 rounded-[12px] border border-[#075F32] bg-[#EDF4EF] text-[11.5px] font-bold text-[#075F32] hover:bg-[#dbeee0] transition"
            >
              <Icon name="plant" size={14} className="text-[#075F32]" />
              <span>Save to My Plants</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className={`${onSaveToMyPlants ? "flex-1" : "w-full"} flex h-10 items-center justify-center rounded-[12px] bg-[#075F32] text-[12px] font-bold text-white shadow-2xs hover:bg-[#153B27] transition active:scale-98`}
          >
            Done
          </button>
        </div>

        {/* Delete Scan Action */}
        {onDeleteScan && (
          <div className="mt-3 pt-2.5 border-t border-[#E3E5DC]/70">
            {showConfirmDelete ? (
              <div className="flex items-center justify-between gap-2 rounded-[12px] bg-[#FFF0EF] p-2.5 border border-[#C93C36]/25">
                <span className="text-[11px] font-semibold text-[#C93C36]">
                  Delete this scan record permanently?
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowConfirmDelete(false)}
                    className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold text-[#485C4E] border border-[#E3E5DC]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteScan(scan.id);
                      onClose();
                    }}
                    className="rounded-lg bg-[#C93C36] px-2.5 py-1 text-[11px] font-bold text-white shadow-2xs hover:bg-[#A82B26] transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(true)}
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#C93C36] hover:text-[#A82B26] transition py-1"
                >
                  <Icon name="trash" size={13} className="text-[#C93C36]" />
                  <span>Delete Scan</span>
                </button>
                <span className="text-[10px] text-[#485C4E]">{scan.date}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
