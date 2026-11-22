import type { SavedPlant } from "../types/garden";
import type { ScanHistoryItem } from "../types/plant";
import PlantThumbnail from "./PlantThumbnail";
import Icon from "./BotanicalIcon";

interface HealthProgressModalProps {
  plant: SavedPlant;
  scans: ScanHistoryItem[];
  onClose: () => void;
}

export default function HealthProgressModal({
  plant,
  scans,
  onClose,
}: HealthProgressModalProps) {
  // Find all scans associated with this plant (or matching plant name)
  const plantScans = scans
    .filter((s) => plant.scanIds.includes(s.id) || s.name.toLowerCase() === plant.species.toLowerCase())
    .sort((a, b) => Number(b.id) - Number(a.id));

  const latestScan = plantScans[0];
  const previousScan = plantScans.length > 1 ? plantScans[1] : null;

  // Compute status progression
  let progressState: "improving" | "stable" | "declining" = "stable";
  let progressText = "Stable condition";
  let progressBadgeColor = "bg-[#EDF4EF] text-[#075F32] border-[#075F32]/20";

  if (previousScan && latestScan) {
    const prevHealthy = previousScan.status === "Healthy";
    const latestHealthy = latestScan.status === "Healthy";

    if (!prevHealthy && latestHealthy) {
      progressState = "improving";
      progressText = "Improving • Infection Cleared";
      progressBadgeColor = "bg-[#EDF4EF] text-[#075F32] border-[#075F32]/30";
    } else if (prevHealthy && !latestHealthy) {
      progressState = "declining";
      progressText = "Needs Attention • New Symptoms";
      progressBadgeColor = "bg-[#FFF0EF] text-[#C93C36] border-[#C93C36]/30";
    } else if (!prevHealthy && !latestHealthy) {
      progressState = "stable";
      progressText = "Under Observation • Symptoms Persist";
      progressBadgeColor = "bg-[#FEF6E6] text-[#B45309] border-[#B45309]/30";
    } else {
      progressState = "improving";
      progressText = "Thriving • Continuous Health";
      progressBadgeColor = "bg-[#EDF4EF] text-[#075F32] border-[#075F32]/30";
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#153D27]/40 p-4 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-h-[85vh] w-full max-w-[390px] overflow-y-auto rounded-[24px] border border-[#E3E5DC] bg-white p-5 shadow-[0_20px_50px_rgba(21,61,39,0.18)] no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pr-2">
          <div>
            <span className="inline-flex rounded-full bg-[#EDF4EF] px-2.5 py-0.5 text-[11px] font-bold text-[#075F32] uppercase tracking-wider">
              Health Progress Tracker
            </span>
            <h2 className="font-heading mt-1 text-[20px] font-extrabold text-[#1D3023]">
              {plant.name}
            </h2>
            <p className="text-[11px] text-[#485C4E]">{plant.species}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#EDF4EF] text-[#1D3023] hover:bg-[#D7E6D9] transition active:scale-95"
          >
            <Icon name="close" size={15} strokeWidth={2.4} />
          </button>
        </div>

        {/* Overall Health Status Banner */}
        <div className={`mt-4 rounded-[16px] border p-3.5 ${progressBadgeColor}`}>
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-full bg-white/70 shadow-2xs shrink-0">
              {progressState === "improving" ? (
                <Icon name="trending-up" size={16} className="text-[#075F32]" />
              ) : progressState === "declining" ? (
                <Icon name="trending-down" size={16} className="text-[#C93C36]" />
              ) : (
                <Icon name="minus" size={16} className="text-[#B45309]" />
              )}
            </span>
            <div>
              <p className="font-heading text-[12.5px] font-extrabold">{progressText}</p>
              <p className="text-[11px] opacity-80 mt-0.5">
                Based on comparison of {plantScans.length} botanical scan{plantScans.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        </div>

        {/* Side-by-Side Scan Comparison */}
        {latestScan && previousScan ? (
          <div className="mt-4">
            <h3 className="font-heading text-[12px] font-bold text-[#1D3023] mb-2.5">
              Chronological Scan Comparison
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {/* Previous Scan Card */}
              <div className="rounded-[16px] border border-[#E3E5DC] bg-[#F7F7F1]/80 p-3 text-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#485C4E]">
                  Earlier Scan
                </span>
                <div className="mt-2 flex justify-center">
                  <PlantThumbnail
                    src={previousScan.previewUrl}
                    alt={previousScan.name}
                    size="md"
                  />
                </div>
                <p className="font-heading mt-2 text-[11px] font-bold text-[#1D3023] truncate">
                  {previousScan.condition}
                </p>
                <span
                  className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    previousScan.status === "Healthy"
                      ? "bg-[#EDF4EF] text-[#075F32]"
                      : "bg-[#FFF0EF] text-[#C93C36]"
                  }`}
                >
                  {previousScan.status}
                </span>
                <p className="mt-1 text-[11px] text-[#485C4E]">{previousScan.date}</p>
              </div>

              {/* Latest Scan Card */}
              <div className="rounded-[16px] border border-[#075F32]/30 bg-[#EDF4EF]/50 p-3 text-center shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#075F32]">
                  Latest Scan
                </span>
                <div className="mt-2 flex justify-center">
                  <PlantThumbnail
                    src={latestScan.previewUrl}
                    alt={latestScan.name}
                    size="md"
                  />
                </div>
                <p className="font-heading mt-2 text-[11px] font-bold text-[#1D3023] truncate">
                  {latestScan.condition}
                </p>
                <span
                  className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    latestScan.status === "Healthy"
                      ? "bg-[#EDF4EF] text-[#075F32]"
                      : "bg-[#FFF0EF] text-[#C93C36]"
                  }`}
                >
                  {latestScan.status}
                </span>
                <p className="mt-1 text-[11px] text-[#075F32] font-semibold">{latestScan.date}</p>
              </div>
            </div>

            {/* Differential Observations */}
            <div className="mt-3.5 rounded-[16px] bg-[#F7F6F0] p-3.5 border border-[#E3E5DC]">
              <h4 className="font-heading text-[11.5px] font-bold text-[#1D3023]">
                Pathological Progression Notes
              </h4>
              <p className="mt-1.5 text-[11px] leading-relaxed text-[#1D3023]/80">
                {latestScan.status === "Healthy" && previousScan.status !== "Healthy"
                  ? "Previous infection indicators have visibly diminished. Cellular margins demonstrate clear regenerative recovery. Continue your current moisture discipline."
                  : latestScan.status !== "Healthy" && previousScan.status === "Healthy"
                  ? "New foliar lesions or discoloration noted since the previous scan. Inspect soil drainage and isolate foliage to prevent adjacent spread."
                  : "Symptom density has stabilized. Follow the recommended care protocol to promote vegetative renewal."}
              </p>
            </div>
          </div>
        ) : latestScan ? (
          <div className="mt-4 rounded-[16px] border border-[#E3E5DC] bg-[#F7F7F1] p-4 text-center">
            <PlantThumbnail
              src={latestScan.previewUrl}
              alt={latestScan.name}
              size="lg"
              className="mx-auto"
            />
            <p className="font-heading mt-2.5 text-[13px] font-bold text-[#1D3023]">
              Baseline Scan Recorded
            </p>
            <p className="mt-1 text-[11px] text-[#485C4E] max-w-[240px] mx-auto leading-relaxed">
              Take another photo in 7–14 days to track whether {plant.name}&apos;s condition is improving!
            </p>
          </div>
        ) : (
          <div className="mt-4 rounded-[16px] border border-dashed border-[#E3E5DC] p-5 text-center">
            <p className="text-[12px] text-[#485C4E]">
              No scans linked yet. Scan this plant to begin tracking its visual recovery trajectory.
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-4 flex h-11 w-full items-center justify-center rounded-[14px] bg-[#075F32] text-[12px] font-bold text-white shadow-2xs hover:bg-[#153B27] transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}
