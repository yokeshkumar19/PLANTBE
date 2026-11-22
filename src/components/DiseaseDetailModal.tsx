import type { DiseaseKnowledgeItem } from "../types/garden";
import Icon from "./BotanicalIcon";

interface DiseaseDetailModalProps {
  disease: DiseaseKnowledgeItem | null;
  onClose: () => void;
}

export default function DiseaseDetailModal({ disease, onClose }: DiseaseDetailModalProps) {
  if (!disease) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#153D27]/40 p-4 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-h-[85vh] w-full max-w-[390px] overflow-y-auto rounded-[24px] border border-[#E3E5DC] bg-white p-5 shadow-[0_20px_50px_rgba(21,61,39,0.18)] no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close */}
        <div className="flex items-start justify-between gap-3 pr-2">
          <div>
            <span className="inline-flex rounded-full bg-[#EDF4EF] px-2.5 py-0.5 text-[11px] font-bold text-[#075F32] uppercase tracking-wider">
              {disease.category} Pathogen Guide
            </span>
            <h2 className="font-heading mt-1 text-[20px] font-extrabold text-[#1D3023] leading-snug">
              {disease.name}
            </h2>
            {disease.scientificName && (
              <p className="text-[11.5px] italic text-[#485C4E] font-serif">
                {disease.scientificName}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#EDF4EF] text-[#1D3023] hover:bg-[#D7E6D9] transition active:scale-95"
          >
            <Icon name="close" size={16} strokeWidth={2.4} />
          </button>
        </div>

        {/* 1. What it is */}
        <div className="mt-4 rounded-[16px] bg-[#EDF4EF]/60 p-3.5 border border-[#A8C9AE]/40">
          <h3 className="font-heading text-[12px] font-extrabold text-[#075F32] flex items-center gap-1.5">
            <Icon name="leaf" size={14} className="text-[#075F32]" />
            What It Is
          </h3>
          <p className="mt-1 text-[11.5px] leading-relaxed text-[#153B27]">
            {disease.summary}
          </p>
        </div>

        {/* 2. Common Causes */}
        <div className="mt-3 rounded-[16px] bg-[#F7F7F1] p-3.5 border border-[#E3E5DC]">
          <h3 className="font-heading text-[12px] font-extrabold text-[#1D3023] flex items-center gap-1.5">
            <Icon name="warning" size={14} className="text-[#C93C36]" />
            Common Causes
          </h3>
          <ul className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-[#1D3023]/80 pl-1">
            {disease.causes.map((c, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-[#C93C36] font-bold">•</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 3. Symptoms */}
        <div className="mt-3 rounded-[16px] bg-[#FFF7F5] p-3.5 border border-[#FADCD9]">
          <h3 className="font-heading text-[12px] font-extrabold text-[#C93C36] flex items-center gap-1.5">
            <Icon name="search" size={14} className="text-[#C93C36]" />
            Distinctive Symptoms
          </h3>
          <ul className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-[#8C3A35] pl-1">
            {disease.symptoms.map((s, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="font-bold">•</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 4. Prevention & Cultural Control */}
        <div className="mt-3 rounded-[16px] bg-[#EDF4EF]/80 p-3.5 border border-[#075F32]/20">
          <h3 className="font-heading text-[12px] font-extrabold text-[#075F32] flex items-center gap-1.5">
            <Icon name="shield" size={14} className="text-[#075F32]" />
            Prevention & Best Practices
          </h3>
          <ul className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-[#153B27] pl-1">
            {disease.prevention.map((p, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <Icon name="check" size={12} strokeWidth={2.4} className="text-[#075F32] shrink-0 mt-0.5" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 5. Treatments */}
        {disease.treatments && disease.treatments.length > 0 && (
          <div className="mt-3 rounded-[16px] bg-[#F7F6F0] p-3.5 border border-[#E3E5DC]">
            <h3 className="font-heading text-[12px] font-extrabold text-[#1D3023] flex items-center gap-1.5">
              <Icon name="flask" size={14} className="text-[#075F32]" />
              Cultural & Organic Treatments
            </h3>
            <ul className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-[#1D3023]/80 pl-1">
              {disease.treatments.map((t, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <Icon name="check" size={12} strokeWidth={2.4} className="text-[#075F32] shrink-0 mt-0.5" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-4 flex h-11 w-full items-center justify-center rounded-[14px] bg-[#075F32] text-[12px] font-bold text-white shadow-2xs hover:bg-[#153B27] transition"
        >
          Got It
        </button>
      </div>
    </div>
  );
}
