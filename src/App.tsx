import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import SplashScreen from "./components/SplashScreen";
import ScanDetailModal from "./components/ScanDetailModal";
import EditProfileModal from "./components/EditProfileModal";
import LoginScreen, { type UserSession } from "./components/LoginScreen";
import BrandLogo from "./components/BrandLogo";
import PlantThumbnail from "./components/PlantThumbnail";
import DiseaseSection from "./components/DiseaseSection";
import MyPlantsScreen from "./components/MyPlantsScreen";
import EditPlantModal from "./components/EditPlantModal";
import HealthProgressModal from "./components/HealthProgressModal";
import DiseaseDetailModal from "./components/DiseaseDetailModal";
import { diseaseKnowledgeBase, findDiseaseByName } from "./data/diseases";
import type { SavedPlant, DiseaseKnowledgeItem } from "./types/garden";
import { createThumbnailDataUrl } from "./utils/imageUtils";
import { getSpeciesImage } from "./utils/speciesImages";
import { logoutUser, subscribeToAuthChanges } from "./services/firebase";
import { analyzePlantImage } from "./services/api";
import type { PlantAnalysisResult, ScanHistoryItem } from "./types/plant";
import Icon, { type IconName } from "./components/BotanicalIcon";

type Tab = "home" | "plants" | "history" | "tips" | "profile";

function BrandHeader({
  onOpenAuth,
  initial = "Y",
}: {
  onOpenAuth?: () => void;
  initial?: string;
}) {
  return (
    <header className="flex h-12 items-center justify-between">
      {/* Official Standalone Leaf Symbol + Wordmark */}
      <div className="flex items-center gap-2.5 select-none">
        <img
          src="/assets/logo_leaf_primary.png"
          alt="PlantCare AI Leaf Symbol"
          className="h-8 w-auto object-contain drop-shadow-xs"
        />
        <div className="flex flex-col">
          <img
            src="/assets/logo_wordmark.png"
            alt="PlantCare AI"
            className="h-4.5 w-auto max-w-[130px] object-contain object-left"
          />
          <span className="text-[7.5px] font-bold uppercase tracking-[1.3px] text-[#485C4E]">
            Grow better • Live greener
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenAuth}
          className="transition hover:opacity-85 active:scale-95"
          title="Account / Sign In"
        >
          <Avatar size="sm" initial={initial} />
        </button>
      </div>
    </header>
  );
}

function Avatar({
  size = "lg",
  initial = "Y",
}: {
  size?: "sm" | "lg";
  initial?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center rounded-full bg-[#EAF2EB] font-bold text-[#176B3A] border border-[#176B3A]/25 shadow-xs ${
        size === "sm" ? "size-9 text-xs" : "size-[76px] text-[26px] font-heading shadow-md"
      }`}
    >
      {initial}
    </div>
  );
}

const navItems: { id: Tab; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "plants", label: "My Plants" },
  { id: "history", label: "History" },
  { id: "tips", label: "Guides" },
  { id: "profile", label: "Profile" },
];

function BottomNav({
  active,
  onChange,
}: {
  active: Tab;
  onChange: (tab: Tab) => void;
}) {
  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      {navItems.map((item) => {
        const selected = active === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={`nav-item ${selected ? "text-[#176B3A]" : "text-[#485C4E]"}`}
            aria-current={selected ? "page" : undefined}
          >
            <span className={`nav-icon ${selected ? "bg-[#EAF2EB]" : ""}`}>
              <Icon name={item.id} size={20} strokeWidth={selected ? 2.3 : 1.8} />
            </span>
            <span className={`text-[11px] ${selected ? "font-bold" : "font-medium"}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

function ScreenTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="pt-2">
      <h1 className="font-heading text-[24px] font-extrabold leading-tight tracking-[-0.03em] text-[#1D3023]">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-1 text-[12px] leading-relaxed text-[#485C4E]">{subtitle}</p>
      )}
    </header>
  );
}

function PrimaryButton({
  children,
  icon,
  onClick,
  disabled = false,
  loading = false,
}: {
  children: ReactNode;
  icon?: IconName;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-[#176B3A] px-4 text-[13px] font-bold text-white shadow-[0_6px_16px_rgba(23,107,58,0.22)] transition active:scale-[0.98] ${
        disabled || loading
          ? "opacity-60 cursor-not-allowed"
          : "hover:bg-[#153D27] hover:shadow-[0_8px_20px_rgba(23,107,58,0.28)]"
      }`}
    >
      {loading ? (
        <span className="animate-spin">
          <Icon name="spinner" size={18} strokeWidth={2.4} />
        </span>
      ) : icon ? (
        <Icon name={icon} size={18} strokeWidth={2} />
      ) : null}
      <span>{children}</span>
    </button>
  );
}

function SecondaryButton({
  children,
  icon,
  onClick,
  disabled = false,
}: {
  children: ReactNode;
  icon?: IconName;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-[#EDF4EF] px-4 text-[13px] font-semibold text-[#075F32] transition active:scale-[0.98] ${
        disabled ? "opacity-60 cursor-not-allowed" : "hover:bg-[#DCEADF]"
      }`}
    >
      {icon && <Icon name={icon} size={18} strokeWidth={1.8} className="text-[#075F32]" />}
      <span>{children}</span>
    </button>
  );
}

function CameraGraphic() {
  return (
    <div className="relative flex size-[116px] items-center justify-center" aria-hidden="true">
      {/* Outer dashed botanical pulse ring */}
      <span className="absolute inset-0 rounded-full border border-dashed border-[#176B3A]/40 animate-pulse-subtle" />
      <span className="absolute inset-[10px] rounded-full bg-white shadow-[0_8px_20px_rgba(21,61,39,0.08)]" />
      <span className="relative flex size-14 items-center justify-center rounded-full bg-[#176B3A] text-white shadow-md">
        <Icon name="camera" size={26} strokeWidth={1.8} />
      </span>
      {/* Botanical scan reticles */}
      <i className="scan-corner left-0 top-0 border-l-2 border-t-2" />
      <i className="scan-corner right-0 top-0 border-r-2 border-t-2" />
      <i className="scan-corner bottom-0 left-0 border-b-2 border-l-2" />
      <i className="scan-corner bottom-0 right-0 border-b-2 border-r-2" />
    </div>
  );
}

function Stat({
  value,
  label,
  icon,
}: {
  value: string | number;
  label: string;
  icon?: IconName;
}) {
  return (
    <div className="min-w-0 flex-1 rounded-[16px] border border-[#E3E5DC] bg-white p-3.5 text-center shadow-xs transition hover:border-[#176B3A]/30">
      {icon ? (
        <span className="mx-auto mb-1.5 flex size-7 items-center justify-center rounded-full bg-[#EAF2EB] text-[#176B3A]">
          <Icon name={icon} size={15} strokeWidth={2} />
        </span>
      ) : null}
      <strong className="font-heading block text-[19px] font-extrabold leading-tight text-[#1D3023]">
        {value}
      </strong>
      <span className="mt-1 block truncate text-[11px] font-medium text-[#485C4E] tracking-tight">
        {label}
      </span>
    </div>
  );
}

function EmptyState({
  title,
  detail,
  icon = "leaf",
  actionText,
  onAction,
}: {
  title: string;
  detail?: string;
  icon?: IconName;
  actionText?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-[#E3E5DC] bg-white/60 p-6 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-[#EAF2EB] text-[#176B3A]">
        <Icon name={icon} size={26} strokeWidth={1.8} />
      </span>
      <h3 className="font-heading mt-3 text-[14px] font-bold text-[#1D3023]">{title}</h3>
      {detail && (
        <p className="mt-1 max-w-[260px] text-[11px] leading-relaxed text-[#485C4E]">
          {detail}
        </p>
      )}
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 rounded-full bg-[#176B3A] px-4 py-1.5 text-[11px] font-bold text-white shadow-xs hover:bg-[#153D27] transition"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

function PlantResultCard({
  result,
  previewUrl,
  onReset,
  onSaveToMyPlants,
  onLearnMore,
}: {
  result: PlantAnalysisResult;
  previewUrl: string | null;
  onReset: () => void;
  onSaveToMyPlants?: (species: string, photoUrl?: string) => void;
  onLearnMore?: (diseaseName: string) => void;
}) {
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);
  const [copied, setCopied] = useState(false);

  const getCareIcon = (text: string): IconName => {
    const t = text.toLowerCase();
    if (t.includes("water") || t.includes("drain") || t.includes("moist")) return "droplet";
    if (t.includes("prun") || t.includes("cut") || t.includes("trim") || t.includes("remov") || t.includes("destro")) return "scissors";
    if (t.includes("spray") || t.includes("fungicid") || t.includes("neem") || t.includes("soap") || t.includes("treatment")) return "flask";
    if (t.includes("light") || t.includes("sun") || t.includes("air") || t.includes("circulat") || t.includes("spac")) return "sun";
    return "check";
  };

  const handleCopySummary = () => {
    const text = `PlantCare AI Diagnosis
Specimen: ${result.plant}
Diagnosis: ${result.disease_name || result.condition} (${result.confidence} Confidence)
Care Recommendations:
${Array.isArray(result.care) ? result.care.map((c) => `- ${c}`).join("\n") : result.care}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const rawSymptoms = Array.isArray(result.symptoms)
    ? result.symptoms
    : result.symptoms
        ? result.symptoms
            .split("\n")
            .map((s) => s.replace(/^[•\-*]\s*/, "").trim())
            .filter(Boolean)
        : ["No visible foliar lesions detected."];

  const rawCare = Array.isArray(result.care)
    ? result.care
    : result.care
        ? result.care
            .split("\n")
            .map((c) => c.replace(/^[•\-*]\s*/, "").trim())
            .filter(Boolean)
        : ["Maintain regular observation and proper soil moisture balance."];

  // Maximum 3 concise points for default mobile view
  const conciseSymptoms = rawSymptoms.slice(0, 3);
  const additionalSymptoms = rawSymptoms.slice(3);

  // Maximum 3 actionable points for default mobile view
  const conciseCare = rawCare.slice(0, 3);
  const additionalCare = rawCare.slice(3);

  const warningsList = result.warning
    ? Array.isArray(result.warning)
      ? result.warning
      : [result.warning]
    : [
        "Precautionary note: Photographic analysis is a preliminary screening and should not be considered a confirmed laboratory diagnosis. Consult local agricultural extension services for severe infestations.",
      ];

  return (
    <div className="overflow-hidden rounded-[22px] border border-[#E3E5DC] bg-white p-4.5 shadow-[0_8px_24px_rgba(21,61,39,0.06)] animate-in fade-in duration-300">
      {/* 1. Plant Image and Plant Name */}
      <div className="flex items-start gap-3.5">
        <PlantThumbnail
          src={previewUrl || undefined}
          alt={result.plant}
          size="lg"
          className="shadow-xs"
        />
        <div className="min-w-0 flex-1">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#075F32] uppercase tracking-wider">
            <Icon name="plant" size={13} />
            Botanical Identification
          </span>
          <h2 className="font-heading mt-0.5 text-[18px] font-extrabold leading-snug text-[#1D3023]">
            {result.plant}
          </h2>
          <p className="mt-0.5 text-[11px] text-[#485C4E]">
            AI screening powered by Groq Vision
          </p>
        </div>
      </div>

      {/* 2, 3, 4: Dedicated Disease Identification Section Prominently Below Plant Name */}
      {/* Contains: Disease name, clear label 'Suspected Disease', confidence badge, brief disease explanation */}
      <DiseaseSection result={result} onLearnMore={onLearnMore} />

      {/* 5. Observed Symptoms (Maximum 3 concise points) */}
      <div className="mt-3.5 border-t border-[#E3E5DC]/70 pt-3.5">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-[12px] font-bold text-[#1D3023] flex items-center gap-1.5">
            <Icon name="info" size={14} className="text-[#075F32]" />
            Observed Symptoms
          </h3>
          <span className="text-[11px] font-medium text-[#485C4E]">
            {conciseSymptoms.length} {conciseSymptoms.length === 1 ? "marker" : "markers"}
          </span>
        </div>
        <ul className="mt-2 space-y-1.5 text-[11.5px] text-[#1D3023]/80 leading-relaxed pl-1">
          {conciseSymptoms.map((item, idx) => (
            <li key={idx} className="flex items-start gap-1.5">
              <span className="text-[#075F32] font-extrabold mt-0.5">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 6. Recommended Care (Maximum 3 actionable points) */}
      <div className="mt-3.5 border-t border-[#E3E5DC]/70 pt-3.5">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-[12px] font-bold text-[#075F32] flex items-center gap-1.5">
            <Icon name="leaf" size={14} className="text-[#075F32]" />
            Recommended Care
          </h3>
          <span className="text-[11px] font-semibold text-[#075F32]/80">
            {conciseCare.length} {conciseCare.length === 1 ? "action" : "actions"}
          </span>
        </div>
        <ul className="mt-2 space-y-1.5 text-[11.5px] text-[#153B27] leading-relaxed pl-1">
          {conciseCare.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="flex size-4 items-center justify-center rounded-full bg-[#EDF4EF] text-[#075F32] shrink-0 mt-0.5">
                <Icon name={getCareIcon(item)} size={11} strokeWidth={2.4} />
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 7. Precautionary Warning */}
      {warningsList.length > 0 && (
        <div className="mt-3.5 border-t border-[#E3E5DC]/70 pt-3.5">
          <h3 className="font-heading text-[11.5px] font-bold text-[#C93C36] flex items-center gap-1.5">
            <Icon name="warning" size={13} className="text-[#C93C36]" />
            Precautionary Warning
          </h3>
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
      <div className="mt-3.5 border-t border-[#E3E5DC]/70 pt-3">
        <button
          type="button"
          onClick={() => setShowDetailedAnalysis((prev) => !prev)}
          className="flex w-full items-center justify-between py-1 text-left text-[11.5px] font-bold text-[#1D3023] hover:text-[#075F32] transition"
        >
          <span className="flex items-center gap-1.5">
            <Icon name="search" size={14} className="text-[#075F32]" />
            {showDetailedAnalysis ? "Hide Detailed Analysis" : "View Detailed Botanical Analysis"}
          </span>
          <span className="text-[#485C4E] transition-transform">
            <Icon
              name="arrow"
              size={12}
              strokeWidth={2.4}
              className={showDetailedAnalysis ? "-rotate-90" : "rotate-90"}
            />
          </span>
        </button>

        {showDetailedAnalysis && (
          <div className="mt-2 space-y-2.5 pt-2 border-t border-[#E3E5DC]/40 animate-in fade-in duration-200">
            {/* Visual Evidence Detail */}
            {result.visual_evidence && (
              <div>
                <h4 className="font-heading text-[11px] font-extrabold uppercase tracking-wider text-[#075F32]">
                  Visual Evidence & Diagnostic Markers
                </h4>
                <p className="mt-1 text-[11px] text-[#1D3023]/85 leading-relaxed bg-white/80 p-2.5 rounded-[10px]">
                  {result.visual_evidence}
                </p>
              </div>
            )}

            {/* Additional Symptoms if any */}
            {additionalSymptoms.length > 0 && (
              <div>
                <h4 className="font-heading text-[11px] font-extrabold uppercase tracking-wider text-[#075F32]">
                  Additional Foliar Signs
                </h4>
                <ul className="mt-1 space-y-1 text-[11px] text-[#1D3023]/85 leading-relaxed bg-white/80 p-2.5 rounded-[10px]">
                  {additionalSymptoms.map((s, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-[#075F32]">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Additional Care if any */}
            {additionalCare.length > 0 && (
              <div>
                <h4 className="font-heading text-[11px] font-extrabold uppercase tracking-wider text-[#075F32]">
                  Further Horticultural Actions
                </h4>
                <ul className="mt-1 space-y-1 text-[11px] text-[#153B27] leading-relaxed bg-white/80 p-2.5 rounded-[10px]">
                  {additionalCare.map((c, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="flex size-3.5 items-center justify-center rounded-full bg-[#EDF4EF] text-[#075F32] shrink-0 mt-0.5">
                        <Icon name={getCareIcon(c)} size={10} strokeWidth={2.4} />
                      </span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Pathology Notice */}
            <div className="rounded-[10px] bg-[#EDF4EF] p-2.5 text-[11px] leading-relaxed text-[#153B27]">
              <span className="font-bold">Pathologist Note: </span>
              Image screening establishes suspected condition probability. For commercial crops or spreading infections, confirm with laboratory tissue culture or your county agricultural extension agent.
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex flex-col gap-2">
        <div className="flex gap-2">
          {onSaveToMyPlants && (
            <button
              type="button"
              onClick={() => onSaveToMyPlants(result.plant, previewUrl || undefined)}
              className="flex-1 flex h-11 items-center justify-center gap-1.5 rounded-[14px] bg-[#EDF4EF] text-[12px] font-bold text-[#075F32] hover:bg-[#dbeee0] transition active:scale-[0.98]"
            >
              <Icon name="plant" size={14} className="text-[#075F32]" />
              <span>Save to My Plants</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleCopySummary}
            className="flex h-11 px-3.5 items-center justify-center gap-1.5 rounded-[14px] border border-[#E3E5DC] bg-white text-[12px] font-bold text-[#1D3023] hover:bg-[#F4F7F4] transition active:scale-[0.98]"
            title="Copy Diagnostic Summary"
          >
            <Icon name={copied ? "check" : "copy"} size={14} className={copied ? "text-[#075F32]" : "text-[#485C4E]"} />
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
        <PrimaryButton icon="check" onClick={onReset}>
          Done
        </PrimaryButton>
      </div>
    </div>
  );
}

function HomeScreen({
  onNavigate,
  recentScans,
  plants = [],
  onAddScan,
  onInspectScan,
  onOpenAuth,
  onSaveToMyPlants,
  onLearnMoreDisease,
  userName = "Gardener",
}: {
  onNavigate: (tab: Tab) => void;
  recentScans: ScanHistoryItem[];
  plants?: SavedPlant[];
  onAddScan: (item: ScanHistoryItem) => void;
  onInspectScan: (item: ScanHistoryItem) => void;
  onOpenAuth?: () => void;
  onSaveToMyPlants?: (species: string, photoUrl?: string) => void;
  onLearnMoreDisease?: (diseaseName: string) => void;
  userName?: string;
}) {
  const cameraInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<PlantAnalysisResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);

  const analysisSteps = [
    "Analyzing leaf texture & margins...",
    "Scanning for blight & pathogen lesions...",
    "Cross-referencing botanical database...",
    "Synthesizing crop-specific care advice...",
  ];

  useEffect(() => {
    if (!isLoading) {
      setAnalysisStep(0);
      return;
    }
    const interval = setInterval(() => {
      setAnalysisStep((prev) => (prev + 1) % analysisSteps.length);
    }, 900);
    return () => clearInterval(interval);
  }, [isLoading]);

  // Time-aware greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const processSelectedFile = (file: File) => {
    setErrorMessage(null);
    setLastResult(null);

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (JPEG, PNG, WEBP).");
      setSelectedFile(null);
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage("Image file is too large. Please select an image under 15MB.");
      return;
    }

    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Pre-generate persistent Base64 thumbnail for local storage
    createThumbnailDataUrl(file).then((thumb) => {
      setThumbnailUrl(thumb || null);
    });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
      e.target.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await analyzePlantImage(selectedFile);
      setLastResult(result);

      const isHealthy =
        result.condition.toLowerCase().includes("healthy") ||
        result.condition.toLowerCase().includes("normal");

      // Use persistent Base64 thumbnail so images survive page reloads and storage
      let persistentThumb = thumbnailUrl;
      if (!persistentThumb && selectedFile) {
        try {
          persistentThumb = await createThumbnailDataUrl(selectedFile);
        } catch {
          persistentThumb = null;
        }
      }

      const historyItem: ScanHistoryItem = {
        id: Date.now().toString(),
        name: result.plant,
        date: "Just now",
        condition: result.condition,
        status: isHealthy ? "Healthy" : "Diseased",
        confidence: result.confidence,
        previewUrl: persistentThumb || undefined,
        result,
      };

      onAddScan(historyItem);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "An unexpected error occurred during plant analysis.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSelection = () => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setThumbnailUrl(null);
    setErrorMessage(null);
    setLastResult(null);
  };

  // Derived Garden Statistics
  const totalScans = recentScans.length;
  const healthyScans = recentScans.filter((s) => s.status === "Healthy").length;
  const healthyRate = totalScans > 0 ? Math.round((healthyScans / totalScans) * 100) : 100;
  const monitoredPlantsCount = new Set(recentScans.map((s) => s.name)).size;

  return (
    <div className="screen-content">
      <BrandHeader onOpenAuth={onOpenAuth} initial={userName.charAt(0).toUpperCase() || "Y"} />

      {/* Greeting Section */}
      <section className="mb-4 mt-4">
        <div className="flex items-center gap-2">
          <h1 className="font-heading text-[24px] font-extrabold leading-tight tracking-[-0.03em] text-[#1D3023]">
            {greeting}, {userName.split(" ")[0] || "Gardener"}
          </h1>
          <Icon name="sparkles" size={18} className="text-[#176B3A]" />
        </div>
        <p className="mt-1 text-[13px] text-[#485C4E]">
          How is your botanical garden doing today?
        </p>
      </section>

      {/* Feature 2: Care Reminders Due Banner on Home */}
      {plants.some((p) => {
        try {
          const elapsed = Math.floor(
            (Date.now() - new Date(p.careSchedule.lastWatered).getTime()) / (1000 * 60 * 60 * 24)
          );
          return p.careSchedule.wateringDays - elapsed <= 0;
        } catch {
          return false;
        }
      }) && (
        <div
          onClick={() => onNavigate("plants")}
          className="mb-4 flex cursor-pointer items-center justify-between rounded-[16px] border border-[#075F32]/25 bg-[#EDF4EF] p-3 shadow-xs hover:bg-[#dcefe1] transition active:scale-[0.99]"
        >
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-full bg-[#075F32] text-white">
              <Icon name="droplet" size={15} />
            </span>
            <div>
              <p className="font-heading text-[12px] font-bold text-[#075F32]">
                Care Reminders Due
              </p>
              <p className="text-[11px] text-[#153B27]/80">
                Plants need hydration today. Tap to view your sanctuary.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#075F32]">
            <span>My Plants</span>
            <Icon name="arrow" size={11} strokeWidth={2.4} />
          </span>
        </div>
      )}

      {/* Main Focus: Scan / Diagnosis Card */}
      {lastResult ? (
        <PlantResultCard
          result={lastResult}
          previewUrl={previewUrl}
          onReset={handleClearSelection}
          onSaveToMyPlants={onSaveToMyPlants}
          onLearnMore={onLearnMoreDisease}
        />
      ) : (
        <section className="overflow-hidden rounded-[22px] border border-[#E3E5DC] bg-white shadow-[0_8px_24px_rgba(21,61,39,0.06)]">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`transition-all duration-200 ${
              isDragging ? "bg-[#EDF4EF] ring-2 ring-[#075F32] ring-dashed" : ""
            }`}
          >
            {previewUrl ? (
              <div className="relative h-[220px] w-full bg-[#153B27] overflow-hidden">
                <img
                  src={previewUrl}
                  alt="Selected plant preview"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 pointer-events-none" />
                <i className="scan-corner left-3 top-3 border-l-2 border-t-2 !border-white" />
                <i className="scan-corner right-3 top-3 border-r-2 border-t-2 !border-white" />
                <i className="scan-corner bottom-3 left-3 border-b-2 border-l-2 !border-white" />
                <i className="scan-corner bottom-3 right-3 border-b-2 border-r-2 !border-white" />

                {/* Fluoroscope animated scanning laser sweep */}
                {isLoading && (
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#23834B] to-transparent shadow-[0_0_12px_#23834B] animate-fluoroscope pointer-events-none z-10" />
                )}

                {isLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#153B27]/85 backdrop-blur-xs text-white p-5 text-center">
                    <div className="relative mb-3.5 flex size-14 items-center justify-center rounded-full bg-white/15 ring-4 ring-[#A8C9AE]/30 animate-pulse">
                      <span className="animate-spin text-[#EDF4EF]">
                        <Icon name="spinner" size={28} strokeWidth={2.4} />
                      </span>
                    </div>
                    <p className="font-heading text-[14px] font-extrabold tracking-tight">
                      Diagnosing Plant...
                    </p>
                    <p className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium text-[#EDF4EF] animate-fade-in">
                      <span className="size-1.5 rounded-full bg-[#A8C9AE] animate-ping" />
                      {analysisSteps[analysisStep]}
                    </p>
                    <p className="mt-2 text-[11px] text-white/60">
                      Step {analysisStep + 1} of {analysisSteps.length} • Groq Vision
                    </p>
                  </div>
                )}

                {!isLoading && (
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    aria-label="Remove image"
                    className="absolute right-3 top-3 flex size-11 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition hover:bg-black/80 active:scale-95 shadow-md"
                  >
                    <Icon name="close" size={18} strokeWidth={2.4} />
                  </button>
                )}
              </div>
            ) : (
              <div
                onClick={() => cameraInput.current?.click()}
                className={`group flex min-h-[210px] w-full cursor-pointer flex-col items-center justify-center p-4 transition ${
                  isDragging
                    ? "bg-[#EDF4EF]"
                    : "bg-[#EDF4EF]/50 hover:bg-[#EDF4EF]/80"
                }`}
              >
                <div className="transform transition-transform group-hover:scale-105">
                  <CameraGraphic />
                </div>
                <span className="mt-3 text-[13px] font-bold text-[#075F32] group-hover:underline">
                  {isDragging ? "Drop your plant photo here" : "Tap to capture or drag & drop photo"}
                </span>

                {/* Micro-alignment diagnostic guidelines */}
                <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] font-bold text-[#485C4E] flex-wrap">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-0.5 border border-[#DDE5DF]">
                    <Icon name="sun" size={10} className="text-[#075F32]" /> Natural light
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-0.5 border border-[#DDE5DF]">
                    <Icon name="crosshair" size={10} className="text-[#075F32]" /> Focus lesions
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-0.5 border border-[#DDE5DF]">
                    <Icon name="leaf" size={10} className="text-[#075F32]" /> Foliar margins
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="p-4.5">
            <h2 className="font-heading text-[17px] font-bold text-[#1D3023]">
              {selectedFile ? "Ready for AI diagnosis" : "Diagnose your plant"}
            </h2>
            <p className="mt-1 text-[11px] leading-relaxed text-[#485C4E]">
              {selectedFile
                ? "Tap 'Analyze Plant' to connect to PlantCare AI and run health diagnosis."
                : "Capture or upload an image to identify diseases, nutritional deficiencies, and treatment."}
            </p>

            {/* Error banner */}
            {errorMessage && (
              <div className="mt-3 flex items-start gap-2.5 rounded-[14px] border border-[#FADCD9] bg-[#FFF0EF] p-3 text-left">
                <span className="text-[#C93C36] shrink-0 mt-0.5">
                  <Icon name="warning" size={16} strokeWidth={2.2} />
                </span>
                <div className="flex-1">
                  <p className="font-heading text-[11px] font-bold text-[#C93C36]">Analysis Notice</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-[#8C3A35]">{errorMessage}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="text-[#8C3A35] hover:text-[#C93C36]"
                  aria-label="Dismiss error"
                >
                  <Icon name="close" size={13} strokeWidth={2.4} />
                </button>
              </div>
            )}

            {selectedFile ? (
              <div className="mt-4 space-y-2.5">
                <PrimaryButton
                  icon="leaf"
                  onClick={handleAnalyze}
                  loading={isLoading}
                  disabled={isLoading}
                >
                  Analyze Plant Health
                </PrimaryButton>
                <div className="grid grid-cols-2 gap-2">
                  <SecondaryButton
                    icon="camera"
                    onClick={() => cameraInput.current?.click()}
                    disabled={isLoading}
                  >
                    Retake Photo
                  </SecondaryButton>
                  <SecondaryButton
                    icon="image"
                    onClick={() => galleryInput.current?.click()}
                    disabled={isLoading}
                  >
                    Choose Gallery
                  </SecondaryButton>
                </div>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <PrimaryButton icon="camera" onClick={() => cameraInput.current?.click()}>
                  Take Photo
                </PrimaryButton>
                <SecondaryButton icon="image" onClick={() => galleryInput.current?.click()}>
                  Upload Photo
                </SecondaryButton>
              </div>
            )}

            <input
              ref={cameraInput}
              className="hidden"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
            />
            <input
              ref={galleryInput}
              className="hidden"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
        </section>
      )}

      {/* Garden at a Glance (Equal Dimension Statistics Cards) */}
      <section className="mt-5">
        <h2 className="section-title">Your garden at a glance</h2>
        <div className="mt-3 flex gap-2.5">
          <Stat value={totalScans} label="Total Scans" />
          <Stat value={monitoredPlantsCount} label="Monitored" />
          <Stat value={`${healthyRate}%`} label="Healthy Rate" />
        </div>
      </section>

      {/* Recent Scans Section */}
      <section className="mt-5 pb-2">
        <div className="flex items-center justify-between">
          <h2 className="section-title">Recent scans</h2>
          {recentScans.length > 0 && (
            <button
              type="button"
              onClick={() => onNavigate("history")}
              className="text-[11px] font-bold text-[#176B3A] hover:underline"
            >
              See all ({recentScans.length})
            </button>
          )}
        </div>
        <div className="mt-3 space-y-2.5">
          {recentScans.length > 0 ? (
            recentScans.slice(0, 3).map((scan) => (
              <article
                key={scan.id}
                onClick={() => onInspectScan(scan)}
                className="group flex cursor-pointer items-center gap-3.5 rounded-[18px] border border-[#E3E5DC] bg-white p-3 shadow-xs transition hover:border-[#176B3A]/40 active:scale-[0.99]"
              >
                <PlantThumbnail
                  src={scan.previewUrl}
                  alt={scan.name}
                  size="md"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-heading truncate text-[13px] font-bold text-[#1D3023] group-hover:text-[#176B3A] transition">
                    {scan.name}
                  </h3>
                  <p className="mt-0.5 text-[11px] text-[#485C4E] truncate">{scan.condition}</p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                        scan.status === "Healthy"
                          ? "bg-[#EAF2EB] text-[#176B3A]"
                          : "bg-[#FFF0EF] text-[#C93C36]"
                      }`}
                    >
                      <Icon
                        name={scan.status === "Healthy" ? "check" : "warning"}
                        size={10}
                        strokeWidth={2.4}
                      />
                      {scan.status}
                    </span>
                    <span className="text-[11px] font-medium text-[#485C4E]">
                      {scan.confidence}
                    </span>
                  </div>
                </div>
                <span className="text-[#485C4E] group-hover:text-[#176B3A] transition">
                  <Icon name="arrow" size={16} />
                </span>
              </article>
            ))
          ) : (
            <EmptyState
              title="No plant scans yet"
              detail="Upload or photograph your first leaf to diagnose plant health."
              icon="camera"
              actionText="Scan Plant"
              onAction={() => cameraInput.current?.click()}
            />
          )}
        </div>
      </section>
    </div>
  );
}

function FilterChip({
  active,
  count,
  children,
  onClick,
}: {
  active: boolean;
  count?: number;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-4 text-[11px] font-bold transition active:scale-95 ${
        active
          ? "border-[#176B3A] bg-[#176B3A] text-white shadow-xs"
          : "border-[#E3E5DC] bg-white text-[#485C4E] hover:border-[#176B3A]/30 hover:text-[#1D3023]"
      }`}
    >
      <span>{children}</span>
      {count !== undefined && (
        <span
          className={`rounded-full px-1.5 py-0.2 text-[11px] font-extrabold ${
            active ? "bg-white/20 text-white" : "bg-[#F7F7F1] text-[#485C4E]"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function HistoryScreen({
  scans,
  onInspectScan,
  onNavigate,
}: {
  scans: ScanHistoryItem[];
  onInspectScan: (item: ScanHistoryItem) => void;
  onNavigate?: (tab: Tab) => void;
}) {
  const [filter, setFilter] = useState<"All" | "Healthy" | "Diseased">("All");
  const [searchQuery, setSearchQuery] = useState("");

  const counts = useMemo(
    () => ({
      all: scans.length,
      healthy: scans.filter((s) => s.status === "Healthy").length,
      diseased: scans.filter((s) => s.status === "Diseased").length,
    }),
    [scans],
  );

  const visible = useMemo(() => {
    return scans.filter((scan) => {
      const matchesFilter = filter === "All" || scan.status === filter;
      const matchesQuery =
        !searchQuery.trim() ||
        scan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scan.condition.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesQuery;
    });
  }, [scans, filter, searchQuery]);

  return (
    <div className="screen-content">
      <ScreenTitle
        title="Scan History"
        subtitle="Review and track previous botanical diagnoses and care history."
      />

      {/* Summary Banner */}
      <div className="mt-4 flex items-center justify-between rounded-[20px] border border-[#176B3A]/20 bg-[#EAF2EB] px-4.5 py-4 shadow-xs">
        <div>
          <p className="text-[11px] font-semibold text-[#176B3A]">Garden Health Log</p>
          <p className="font-heading mt-0.5 text-[22px] font-extrabold text-[#1D3023]">
            {scans.length} Total {scans.length === 1 ? "Scan" : "Scans"}
          </p>
        </div>
        <span className="flex size-11 items-center justify-center rounded-full bg-white text-[#176B3A] shadow-xs">
          <Icon name="history" size={22} strokeWidth={2} />
        </span>
      </div>

      {/* Search Input */}
      <div className="relative mt-4">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#485C4E]">
          <Icon name="search" size={15} />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by plant name or diagnosis..."
          className="w-full rounded-[14px] border border-[#E3E5DC] bg-white py-2.5 pl-9 pr-3 text-[12px] text-[#1D3023] placeholder-[#485C4E] focus:border-[#176B3A] focus:outline-none shadow-xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            aria-label="Clear search query"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#485C4E] hover:text-[#1D3023] p-1 rounded-md transition"
          >
            <Icon name="close" size={13} strokeWidth={2.4} />
          </button>
        )}
      </div>

      {/* Filter Chips */}
      <div className="mt-3.5 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        <FilterChip
          active={filter === "All"}
          count={counts.all}
          onClick={() => setFilter("All")}
        >
          All
        </FilterChip>
        <FilterChip
          active={filter === "Healthy"}
          count={counts.healthy}
          onClick={() => setFilter("Healthy")}
        >
          Healthy
        </FilterChip>
        <FilterChip
          active={filter === "Diseased"}
          count={counts.diseased}
          onClick={() => setFilter("Diseased")}
        >
          Diseased
        </FilterChip>
      </div>

      {/* Scans List */}
      <section className="mt-4 space-y-3">
        {visible.length > 0 ? (
          visible.map((scan) => (
            <article
              key={scan.id}
              onClick={() => onInspectScan(scan)}
              className="group flex cursor-pointer items-center gap-3.5 rounded-[18px] border border-[#E3E5DC] bg-white p-3.5 shadow-xs transition hover:border-[#176B3A]/40 active:scale-[0.99]"
            >
              <PlantThumbnail
                src={scan.previewUrl}
                alt={scan.name}
                size="lg"
              />
              <div className="min-w-0 flex-1">
                <h2 className="font-heading truncate text-[14px] font-bold text-[#1D3023] group-hover:text-[#176B3A] transition">
                  {scan.name}
                </h2>
                <p className="mt-0.5 text-[11px] text-[#485C4E] truncate">{scan.condition}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      scan.status === "Healthy"
                        ? "bg-[#EAF2EB] text-[#176B3A]"
                        : "bg-[#FFF0EF] text-[#C93C36]"
                    }`}
                  >
                    <Icon
                      name={scan.status === "Healthy" ? "check" : "warning"}
                      size={10}
                      strokeWidth={2.4}
                    />
                    {scan.status}
                  </span>
                  <span className="text-[11px] text-[#485C4E] font-medium">
                    {scan.confidence}
                  </span>
                </div>
              </div>
              <span className="text-[#485C4E] group-hover:text-[#176B3A] transition">
                <Icon name="arrow" size={17} />
              </span>
            </article>
          ))
        ) : (
          <EmptyState
            title={scans.length === 0 ? "No plant scans yet" : "No matching scans"}
            detail={
              scans.length === 0
                ? "Your botanical health log is empty. Scan your first plant to diagnose health and monitor progress."
                : "No scans match your current filter or search criteria."
            }
            icon={scans.length === 0 ? "camera" : "history"}
            actionText={scans.length === 0 ? "Scan Your First Plant" : undefined}
            onAction={scans.length === 0 ? () => onNavigate?.("home") : undefined}
          />
        )}
      </section>
    </div>
  );
}

const plantTips = [
  {
    category: "Watering",
    title: "Deep vs. Shallow Watering",
    time: "2 min read",
    icon: "droplet" as IconName,
    summary:
      "Most houseplants prefer deep watering every 7–10 days over shallow daily sips. Let topsoil dry 1–2 inches.",
    details:
      "Watering deeply allows moisture to reach the root ball rather than evaporating off the surface. Always check soil moisture with your finger before adding water, and ensure pots have bottom drainage holes.",
  },
  {
    category: "Sunlight",
    title: "Understanding Indirect Bright Light",
    time: "3 min read",
    icon: "sun" as IconName,
    summary:
      "Indirect light means the plant can clearly see the sky or sun without rays striking the foliage directly.",
    details:
      "Direct sunlight causes sun scorch and brown dry patches. Place plants 3–5 feet back from south-facing windows, or diffuse intense light with sheer curtains to keep leaves vibrant.",
  },
  {
    category: "Soil & Feeding",
    title: "Optimal Soil Aeration & Repotting",
    time: "3 min read",
    icon: "plant" as IconName,
    summary:
      "Dense, compacted soil suffocates roots. Mix perlite, pumice, and pine bark into potting soil.",
    details:
      "Repot during active growing seasons (spring or summer). If roots begin circling the bottom or poking through drainage holes, upgrade pot diameter by 1–2 inches maximum.",
  },
  {
    category: "Pest Prevention",
    title: "Early Pest Detection & Neem Oil",
    time: "2 min read",
    icon: "shield" as IconName,
    summary:
      "Inspect leaf undersides weekly for spider mites, mealybugs, and fungal spore patches.",
    details:
      "Wipe foliage with organic cold-pressed neem oil diluted in warm water with a drop of gentle soap. Isolate newly purchased plants for 14 days before placing them next to your collection.",
  },
];

function TipCard({ tip }: { tip: (typeof plantTips)[number] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="rounded-[18px] border border-[#E3E5DC] bg-white p-4 shadow-xs transition hover:border-[#176B3A]/40">
      <div className="flex items-start gap-3.5">
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-[#EAF2EB] text-[#176B3A]"
          aria-hidden="true"
        >
          <Icon name={tip.icon} size={20} strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex rounded-full bg-[#EAF2EB] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#176B3A]">
              {tip.category}
            </span>
            <span className="text-[11px] text-[#485C4E]">• {tip.time}</span>
          </div>
          <h2 className="font-heading mt-1.5 text-[14px] font-bold text-[#1D3023]">
            {tip.title}
          </h2>
          <p className="mt-1 text-[11px] leading-relaxed text-[#485C4E]">{tip.summary}</p>

          {expanded && (
            <div className="mt-3 rounded-[12px] bg-[#F7F7F1] p-3 text-[11px] leading-relaxed text-[#1D3023]/85 border border-[#E3E5DC] animate-in fade-in duration-200">
              {tip.details}
            </div>
          )}

          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-[#176B3A] hover:underline"
          >
            <span>{expanded ? "Show less" : "Read full guide"}</span>
            {!expanded && <Icon name="arrow" size={11} strokeWidth={2.4} />}
          </button>
        </div>
      </div>
    </article>
  );
}

function TipsScreen({
  onOpenDisease,
}: {
  onOpenDisease?: (disease: DiseaseKnowledgeItem) => void;
}) {
  const [activeSubTab, setActiveSubTab] = useState<"tips" | "diseases">("tips");
  const [searchDisease, setSearchDisease] = useState("");
  const [selectedDiseaseCategory, setSelectedDiseaseCategory] = useState("All");

  const categories = ["All", "Watering", "Sunlight", "Soil & Feeding", "Pest Prevention"];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const visible =
    selectedCategory === "All"
      ? plantTips
      : plantTips.filter((t) => t.category === selectedCategory);

  const diseaseCategories = ["All", "Fungal", "Bacterial"];

  const filteredDiseases = diseaseKnowledgeBase.filter((d) => {
    const matchesCat =
      selectedDiseaseCategory === "All" || d.category === selectedDiseaseCategory;
    const matchesQuery =
      !searchDisease.trim() ||
      d.name.toLowerCase().includes(searchDisease.toLowerCase()) ||
      (d.scientificName && d.scientificName.toLowerCase().includes(searchDisease.toLowerCase())) ||
      d.summary.toLowerCase().includes(searchDisease.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="screen-content pb-20">
      <ScreenTitle
        title="Botanical Guides"
        subtitle="Expert cultivation advice and botanical pathology encyclopedia."
      />

      {/* Segmented Switcher: Tips vs. Disease Encyclopedia */}
      <div className="mt-4 flex rounded-[14px] bg-[#EAF2EB] p-1 border border-[#176B3A]/15">
        <button
          type="button"
          onClick={() => setActiveSubTab("tips")}
          className={`flex-1 rounded-[10px] py-2 text-[12px] font-bold transition ${
            activeSubTab === "tips"
              ? "bg-white text-[#176B3A] shadow-xs"
              : "text-[#485C4E] hover:text-[#1D3023]"
          }`}
        >
          Care Tips
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab("diseases")}
          className={`flex-1 rounded-[10px] py-2 text-[12px] font-bold transition flex items-center justify-center gap-1.5 ${
            activeSubTab === "diseases"
              ? "bg-[#075F32] text-white shadow-xs"
              : "text-[#485C4E] hover:text-[#1D3023]"
          }`}
        >
          <span>Disease Encyclopedia</span>
          <span
            className={`rounded-full px-1.5 py-0.2 text-[11px] font-extrabold ${
              activeSubTab === "diseases" ? "bg-white/25 text-white" : "bg-[#176B3A]/10 text-[#176B3A]"
            }`}
          >
            {diseaseKnowledgeBase.length}
          </span>
        </button>
      </div>

      {activeSubTab === "tips" ? (
        <>
          {/* Category Pills */}
          <div className="no-scrollbar -mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1">
            {categories.map((cat) => (
              <FilterChip
                key={cat}
                active={selectedCategory === cat}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </FilterChip>
            ))}
          </div>

          {/* Tips Cards */}
          <section className="mt-4 space-y-3">
            {visible.map((tip) => (
              <TipCard key={tip.title} tip={tip} />
            ))}
          </section>

          {/* Daily Botanical Insight Banner */}
          <div className="mt-5 rounded-[20px] bg-[#153D27] p-4 text-white shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/12">
                <Icon name="sparkles" size={20} className="text-[#23834B]" />
              </span>
              <div>
                <p className="font-heading text-[13px] font-bold">Botanical Wisdom</p>
                <p className="mt-0.5 text-[11px] text-white/75 leading-relaxed">
                  "To plant a garden is to believe in tomorrow." Regular consistency trumps sporadic care.
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Feature 1: Disease Encyclopedia Library */
        <div className="mt-4 space-y-3">
          {/* Search bar */}
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#485C4E]">
              <Icon name="search" size={15} />
            </span>
            <input
              type="text"
              value={searchDisease}
              onChange={(e) => setSearchDisease(e.target.value)}
              placeholder="Search diseases (e.g. Early Blight, Mildew)..."
              className="w-full rounded-[14px] border border-[#E3E5DC] bg-white py-2.5 pl-9 pr-3 text-[12px] text-[#1D3023] placeholder-[#485C4E] focus:border-[#075F32] focus:outline-none shadow-xs"
            />
          </div>

          {/* Disease Category Filter */}
          <div className="flex gap-2">
            {diseaseCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedDiseaseCategory(cat)}
                className={`rounded-full px-3.5 py-1 text-[11px] font-bold transition ${
                  selectedDiseaseCategory === cat
                    ? "bg-[#075F32] text-white shadow-xs"
                    : "bg-white border border-[#E3E5DC] text-[#485C4E] hover:text-[#1D3023]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Disease Cards */}
          <div className="space-y-3 pt-1">
            {filteredDiseases.map((d) => (
              <article
                key={d.id}
                onClick={() => onOpenDisease?.(d)}
                className="group cursor-pointer rounded-[18px] border border-[#E3E5DC] bg-white p-4 shadow-xs transition hover:border-[#075F32]/50 active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-flex rounded-full bg-[#EDF4EF] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#075F32]">
                      {d.category} Pathogen
                    </span>
                    <h3 className="font-heading mt-1 text-[15px] font-extrabold text-[#1D3023] group-hover:text-[#075F32] transition">
                      {d.name}
                    </h3>
                    {d.scientificName && (
                      <p className="text-[11px] italic text-[#485C4E] font-serif">
                        {d.scientificName}
                      </p>
                    )}
                  </div>
                  <span className="text-[#075F32] group-hover:translate-x-0.5 transition-transform">
                    <Icon name="arrow" size={13} strokeWidth={2.4} />
                  </span>
                </div>

                <p className="mt-2 text-[11px] leading-relaxed text-[#485C4E] line-clamp-2">
                  {d.summary}
                </p>

                <div className="mt-3 flex items-center justify-between border-t border-[#E3E5DC]/60 pt-2 text-[11px]">
                  <span className="text-[#C93C36] font-semibold">
                    {d.symptoms.length} observed symptoms
                  </span>
                  <span className="inline-flex items-center gap-1 font-bold text-[#075F32] group-hover:underline">
                    <span>Causes & Prevention</span>
                    <Icon name="arrow" size={11} strokeWidth={2.4} />
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileRow({
  icon,
  label,
  value,
  arrow = false,
  onClick,
}: {
  icon: IconName;
  label: string;
  value?: string;
  arrow?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition hover:bg-[#F7F7F1]/80"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-[#EAF2EB] text-[#176B3A]">
        <Icon name={icon} size={18} strokeWidth={1.8} />
      </span>
      <span className="flex-1 text-[12px] font-semibold text-[#1D3023]">{label}</span>
      {value && <span className="text-[11px] font-medium text-[#485C4E]">{value}</span>}
      {arrow && (
        <span className="text-[#485C4E]">
          <Icon name="arrow" size={16} />
        </span>
      )}
    </button>
  );
}

function ProfileScreen({
  scans,
  userName,
  userEmail,
  user,
  onOpenAuth,
  onEditProfile,
  onLogout,
}: {
  scans: ScanHistoryItem[];
  userName: string;
  userEmail: string;
  user?: UserSession | null;
  onOpenAuth?: () => void;
  onEditProfile?: () => void;
  onLogout?: () => void;
}) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const totalScans = scans.length;
  const healthyCount = scans.filter((s) => s.status === "Healthy").length;
  const varietiesCount = new Set(scans.map((s) => s.name)).size;

  return (
    <div className="screen-content">
      <ScreenTitle title="Profile" subtitle="Manage your garden preferences and account settings." />

      {/* User Card */}
      <section className="mt-4 flex flex-col items-center rounded-[22px] border border-[#E3E5DC] bg-white px-5 py-5 shadow-xs">
        <Avatar size="lg" initial={userName.charAt(0) || "Y"} />
        <h2 className="font-heading mt-3 text-[17px] font-extrabold text-[#1D3023]">
          {userName}
        </h2>
        <p className="mt-0.5 text-[11px] text-[#485C4E]">{userEmail}</p>

        <span className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-[#EDF4EF] px-3 py-0.5 text-[11px] font-bold text-[#075F32]">
          <Icon name="leaf" size={11} /> {user?.isGuest ? "Guest Access" : "Master Botanical Enthusiast"}
        </span>

        {user?.isGuest && (
          <div className="mt-2.5 w-full rounded-[14px] border border-[#075F32]/20 bg-[#EDF4EF]/70 p-2.5 text-center">
            <p className="text-[11px] font-semibold text-[#075F32]">
              You are currently using Guest mode.
            </p>
            <button
              type="button"
              onClick={onOpenAuth}
              className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-[#075F32] px-3.5 py-1 text-[11px] font-bold text-white shadow-2xs hover:bg-[#153B27] active:scale-95 transition"
            >
              Sign In / Link Account
            </button>
          </div>
        )}

        <div className="mt-3.5 flex justify-center">
          <button
            type="button"
            onClick={onEditProfile}
            className="flex h-9 items-center gap-1.5 rounded-[12px] border border-[#E3E5DC] bg-white px-4 text-[11.5px] font-bold text-[#1D3023] shadow-2xs hover:bg-[#F7F6F0] transition active:scale-95"
          >
            <Icon name="edit" size={13} strokeWidth={2} className="text-[#075F32]" />
            Edit Profile
          </button>
        </div>
      </section>

      {/* Profile Metrics */}
      <section className="mt-4 flex gap-2.5">
        <Stat value={totalScans} label="Total Scans" icon="camera" />
        <Stat value={varietiesCount} label="Varieties" icon="plant" />
        <Stat value={healthyCount} label="Healthy" icon="check" />
      </section>

      {/* Settings Rows */}
      <section className="mt-5">
        <h2 className="section-title mb-2.5">Garden Settings</h2>
        <div className="divide-y divide-[#E3E5DC] overflow-hidden rounded-[18px] border border-[#E3E5DC] bg-white shadow-xs">
          {/* Official Standalone Leaf inside Green Rounded Square App Icon */}
          <div className="flex items-center gap-3.5 px-4 py-3 bg-[#EDF4EF]/60">
            <img
              src="/assets/app_icon.png"
              alt="PlantCare AI Official App Icon"
              className="size-10 rounded-[11px] shadow-xs object-cover border border-[#E3E5DC]"
            />
            <div className="min-w-0 flex-1">
              <p className="font-heading text-[12px] font-bold text-[#1D3023]">PlantCare AI Official</p>
              <p className="text-[11px] text-[#485C4E]">Standalone Neural Leaf • Groq Vision</p>
            </div>
          </div>

          <ProfileRow
            icon="plant"
            label="Monitored Varieties"
            value={`${varietiesCount} registered`}
          />
          <ProfileRow
            icon="bell"
            label="Plant Care Reminders"
            value="Active (Weekly)"
            arrow
          />
          <ProfileRow
            icon="sparkles"
            label="AI Diagnosis Model"
            value="Groq Qwen 3.8 Vision"
          />
          <ProfileRow
            icon="shield"
            label="Privacy Policy & Terms"
            arrow
            onClick={() =>
              alert("PlantCare AI is private and secure. All plant images are analyzed anonymously.")
            }
          />
        </div>
      </section>

      {/* Logout / Reset */}
      <div className="mt-4">
        {showLogoutConfirm ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(false)}
              className="flex-1 rounded-[12px] border border-[#E3E5DC] bg-white py-2.5 text-[11px] font-bold text-[#485C4E]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setShowLogoutConfirm(false);
                onLogout?.();
              }}
              className="flex-1 rounded-[12px] bg-[#FFF0EF] py-2.5 text-[11px] font-bold text-[#C93C36]"
            >
              Confirm Log Out
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-[14px] bg-[#FFF0EF] text-[12px] font-bold text-[#C93C36] hover:bg-[#FDE7E5] transition"
          >
            <Icon name="logout" size={16} strokeWidth={2} />
            Log Out
          </button>
        )}
      </div>
    </div>
  );
}

function getScansStorageKey(currentUser: UserSession | null): string {
  if (!currentUser) return "plantcare_scans_guest";
  if (currentUser.uid) return `plantcare_scans_${currentUser.uid}`;
  if (currentUser.email) return `plantcare_scans_${currentUser.email.replace(/[^a-zA-Z0-9]/g, "_")}`;
  return "plantcare_scans_guest";
}

function getMyPlantsStorageKey(currentUser: UserSession | null): string {
  if (!currentUser) return "plantcare_myplants_guest";
  if (currentUser.uid) return `plantcare_myplants_${currentUser.uid}`;
  if (currentUser.email) return `plantcare_myplants_${currentUser.email.replace(/[^a-zA-Z0-9]/g, "_")}`;
  return "plantcare_myplants_guest";
}

function sanitizeScans(rawScans: ScanHistoryItem[]): ScanHistoryItem[] {
  return rawScans.map((s) => ({
    ...s,
    // Ephemeral blob: URLs do not survive page reloads or local storage persistence.
    // Replace dead blob URLs with species reference image or undefined so PlantThumbnail displays curated imagery.
    // Persistent Base64 Data URLs (data:image/...) or web URLs are preserved.
    previewUrl:
      s.previewUrl &&
      (s.previewUrl.startsWith("data:image/") ||
        s.previewUrl.startsWith("http://") ||
        s.previewUrl.startsWith("https://") ||
        s.previewUrl.startsWith("/"))
        ? s.previewUrl
        : getSpeciesImage(s.name) || undefined,
  }));
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState<UserSession | null>(() => {
    try {
      const stored = localStorage.getItem("plantcare_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [userName, setUserName] = useState(() => user?.name || "Botanical User");
  const [userEmail, setUserEmail] = useState(() => user?.email || "user@plantcare.ai");
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [selectedScanDetail, setSelectedScanDetail] = useState<ScanHistoryItem | null>(null);

  // Feature 1, 2, 3, 4 Modal States
  const [editingPlant, setEditingPlant] = useState<SavedPlant | null>(null);
  const [isAddingPlant, setIsAddingPlant] = useState(false);
  const [pendingSpecies, setPendingSpecies] = useState("");
  const [pendingPhoto, setPendingPhoto] = useState("");
  const [activeProgressPlant, setActiveProgressPlant] = useState<SavedPlant | null>(null);
  const [activeDiseaseModal, setActiveDiseaseModal] = useState<DiseaseKnowledgeItem | null>(null);

  const [scans, setScans] = useState<ScanHistoryItem[]>(() => {
    try {
      const key = getScansStorageKey(user);
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        const clean = sanitizeScans(parsed);
        if (JSON.stringify(parsed) !== JSON.stringify(clean)) {
          try {
            localStorage.setItem(key, JSON.stringify(clean));
          } catch {
            // ignore
          }
        }
        return clean;
      }
    } catch {
      // ignore JSON parse error
    }
    return [];
  });

  // Feature 3: My Plants Collection
  const [savedPlants, setSavedPlants] = useState<SavedPlant[]>(() => {
    try {
      const key = getMyPlantsStorageKey(user);
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return [];
  });

  // Re-synchronize scans & saved plants whenever the logged-in user changes
  useEffect(() => {
    const scansKey = getScansStorageKey(user);
    const plantsKey = getMyPlantsStorageKey(user);
    try {
      const storedScans = localStorage.getItem(scansKey);
      if (storedScans) {
        const parsed = JSON.parse(storedScans);
        const clean = sanitizeScans(parsed);
        setScans(clean);
        if (JSON.stringify(parsed) !== JSON.stringify(clean)) {
          try {
            localStorage.setItem(scansKey, JSON.stringify(clean));
          } catch {
            // ignore
          }
        }
      } else {
        setScans([]);
      }
      const storedPlants = localStorage.getItem(plantsKey);
      setSavedPlants(storedPlants ? JSON.parse(storedPlants) : []);
    } catch {
      setScans([]);
      setSavedPlants([]);
    }
  }, [user?.uid, user?.email, user?.isGuest]);

  const savePlantsToStorage = (updated: SavedPlant[]) => {
    setSavedPlants(updated);
    const key = getMyPlantsStorageKey(user);
    try {
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {
      // ignore quota error
    }
  };

  const handleSavePlant = (plant: SavedPlant) => {
    const exists = savedPlants.some((p) => p.id === plant.id);
    let updated: SavedPlant[];
    if (exists) {
      updated = savedPlants.map((p) => (p.id === plant.id ? plant : p));
    } else {
      updated = [plant, ...savedPlants];
    }
    savePlantsToStorage(updated);
    setEditingPlant(null);
    setIsAddingPlant(false);
  };

  const handleDeletePlant = (id: string) => {
    const updated = savedPlants.filter((p) => p.id !== id);
    savePlantsToStorage(updated);
  };

  const handleUpdatePlantCare = (plantId: string, careType: "water" | "fertilize" | "repot") => {
    const nowIso = new Date().toISOString();
    const updated = savedPlants.map((p) => {
      if (p.id !== plantId) return p;
      const care = { ...p.careSchedule };
      if (careType === "water") care.lastWatered = nowIso;
      if (careType === "fertilize") care.lastFertilized = nowIso;
      if (careType === "repot") care.lastRepotted = nowIso;
      return { ...p, careSchedule: care };
    });
    savePlantsToStorage(updated);
  };

  const handleOpenAddPlant = (species: string, photoUrl?: string) => {
    setEditingPlant(null);
    setPendingSpecies(species);
    setPendingPhoto(photoUrl || "");
    setIsAddingPlant(true);
  };

  const handleLearnMoreDisease = (diseaseName: string) => {
    const found = findDiseaseByName(diseaseName);
    if (found) {
      setActiveDiseaseModal(found);
    } else {
      const dynamicItem: DiseaseKnowledgeItem = {
        id: diseaseName.toLowerCase().replace(/\s+/g, "-"),
        name: diseaseName,
        category: "Fungal",
        summary: `Foliar condition screening indicated markers consistent with ${diseaseName}.`,
        causes: [
          "Foliar moisture remaining on leaves for extended hours",
          "Warm, humid conditions accelerating fungal or bacterial spore transmission",
          "Soil splashing onto bottom foliage during watering",
        ],
        symptoms: [
          "Distinct discoloration, spots, or chlorotic halos visible on foliage",
          "Loss of chlorophyll or premature dropping of affected lower leaves",
          "Localized necrotic lesions on leaf margins or surfaces",
        ],
        prevention: [
          "Water at root zone via drip irrigation to avoid wet foliage",
          "Improve spacing and ventilation around plants",
          "Sanitize cutting tools before and after pruning",
          "Apply preventative organic copper or neem spray during early stages",
        ],
        treatments: [
          "Prune heavily infected lower leaves and safely dispose of them",
          "Isolate plant from nearby healthy plants to avoid cross-infection",
        ],
      };
      setActiveDiseaseModal(dynamicItem);
    }
  };

  useEffect(() => {
    // Listen to real-time Firebase Authentication state changes
    const unsubscribe = subscribeToAuthChanges((firebaseUser) => {
      if (firebaseUser) {
        const displayName =
          firebaseUser.displayName ||
          firebaseUser.email?.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ||
          "PlantCare User";
        const email = firebaseUser.email || "user@plantcare.ai";
        const session: UserSession = {
          name: displayName,
          email,
          uid: firebaseUser.uid,
          photoURL: firebaseUser.photoURL,
          isGuest: false,
        };
        setUser(session);
        setUserName(displayName);
        setUserEmail(email);
        try {
          localStorage.setItem("plantcare_user", JSON.stringify(session));
        } catch {
          // ignore
        }
      } else {
        // If not in guest mode, clear user session on Firebase signout
        setUser((prev) => {
          if (prev?.isGuest) return prev;
          try {
            localStorage.removeItem("plantcare_user");
          } catch {
            // ignore
          }
          return null;
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  const handleLoginSuccess = (session: UserSession) => {
    setUser(session);
    setUserName(session.name);
    setUserEmail(session.email);
    const key = getScansStorageKey(session);
    try {
      const stored = localStorage.getItem(key);
      setScans(stored ? JSON.parse(stored) : []);
      localStorage.setItem("plantcare_user", JSON.stringify(session));
    } catch {
      // ignore quota error
    }
    setIsAuthOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.warn("Firebase signout error:", e);
    }
    setUser(null);
    setScans([]);
    try {
      localStorage.removeItem("plantcare_user");
    } catch {
      // ignore
    }
  };

  const handleAddScan = (scan: ScanHistoryItem) => {
    setScans((prev) => {
      const cleanScan: ScanHistoryItem = {
        ...scan,
        previewUrl:
          scan.previewUrl &&
          (scan.previewUrl.startsWith("data:image/") ||
            scan.previewUrl.startsWith("http://") ||
            scan.previewUrl.startsWith("https://") ||
            scan.previewUrl.startsWith("/"))
            ? scan.previewUrl
            : getSpeciesImage(scan.name) || undefined,
      };
      const updated = [cleanScan, ...prev];
      const key = getScansStorageKey(user);
      try {
        localStorage.setItem(key, JSON.stringify(updated));
      } catch {
        // ignore quota error
      }
      return updated;
    });
  };

  const content = {
    home: (
      <HomeScreen
        onNavigate={setActiveTab}
        recentScans={scans}
        plants={savedPlants}
        onAddScan={handleAddScan}
        onInspectScan={(scan) => setSelectedScanDetail(scan)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSaveToMyPlants={handleOpenAddPlant}
        onLearnMoreDisease={handleLearnMoreDisease}
        userName={userName}
      />
    ),
    plants: (
      <MyPlantsScreen
        plants={savedPlants}
        scans={scans}
        onAddPlant={() => {
          setEditingPlant(null);
          setPendingSpecies("");
          setPendingPhoto("");
          setIsAddingPlant(true);
        }}
        onEditPlant={(plant) => setEditingPlant(plant)}
        onInspectProgress={(plant) => setActiveProgressPlant(plant)}
        onUpdatePlantCare={handleUpdatePlantCare}
        onDeletePlant={handleDeletePlant}
        onScanNewPlant={() => setActiveTab("home")}
      />
    ),
    history: (
      <HistoryScreen
        scans={scans}
        onInspectScan={(scan) => setSelectedScanDetail(scan)}
        onNavigate={setActiveTab}
      />
    ),
    tips: (
      <TipsScreen
        onOpenDisease={(disease) => setActiveDiseaseModal(disease)}
      />
    ),
    profile: (
      <ProfileScreen
        scans={scans}
        userName={userName}
        userEmail={userEmail}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onEditProfile={() => setShowEditModal(true)}
        onLogout={handleLogout}
      />
    ),
  };

  return (
    <>
      {/* Full-Screen Botanical Splash Screen with Official Logo */}
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

      {/* When splash completes: if user is not logged in, show Initial Login Wall */}
      {!showSplash && !user ? (
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      ) : (
        <main className="app-stage">
          <div className="phone-shell">
            <div className="screen-scroll" key={activeTab}>
              {content[activeTab]}
            </div>
            <BottomNav active={activeTab} onChange={setActiveTab} />
            <div className="gesture-bar" />

            {/* Scan Detail Modal */}
            <ScanDetailModal
              scan={selectedScanDetail}
              onClose={() => setSelectedScanDetail(null)}
              onSaveToMyPlants={handleOpenAddPlant}
              onLearnMoreDisease={handleLearnMoreDisease}
            />

            {/* Feature 2 & 3: Add / Edit Plant & Custom Reminder Schedule Modal */}
            {(editingPlant || isAddingPlant) && (
              <EditPlantModal
                plant={editingPlant}
                initialSpecies={pendingSpecies}
                initialPhotoUrl={pendingPhoto}
                onSave={handleSavePlant}
                onClose={() => {
                  setEditingPlant(null);
                  setIsAddingPlant(false);
                }}
              />
            )}

            {/* Feature 4: Health Progress Comparison Modal */}
            {activeProgressPlant && (
              <HealthProgressModal
                plant={activeProgressPlant}
                scans={scans}
                onClose={() => setActiveProgressPlant(null)}
              />
            )}

            {/* Feature 1: Disease Pathology Guide Modal */}
            {activeDiseaseModal && (
              <DiseaseDetailModal
                disease={activeDiseaseModal}
                onClose={() => setActiveDiseaseModal(null)}
              />
            )}

            {/* Edit Profile Modal */}
            {showEditModal && (
              <EditProfileModal
                initialName={userName}
                initialEmail={userEmail}
                onSave={(newName, newEmail) => {
                  setUserName(newName);
                  setUserEmail(newEmail);
                  if (user) {
                    const updated = { ...user, name: newName, email: newEmail };
                    setUser(updated);
                    try {
                      localStorage.setItem("plantcare_user", JSON.stringify(updated));
                    } catch {}
                  }
                }}
                onClose={() => setShowEditModal(false)}
              />
            )}

            {/* In-App Auth / Switch Account Modal */}
            {isAuthOpen && (
              <LoginScreen
                isModal
                onLoginSuccess={handleLoginSuccess}
                onCancel={() => setIsAuthOpen(false)}
              />
            )}
          </div>
        </main>
      )}
    </>
  );
}
