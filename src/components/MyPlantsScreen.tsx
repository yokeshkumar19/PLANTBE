import { useState } from "react";
import type { SavedPlant } from "../types/garden";
import type { ScanHistoryItem } from "../types/plant";
import PlantThumbnail from "./PlantThumbnail";
import Icon from "./BotanicalIcon";

interface MyPlantsScreenProps {
  plants: SavedPlant[];
  scans: ScanHistoryItem[];
  onAddPlant: () => void;
  onEditPlant: (plant: SavedPlant) => void;
  onInspectProgress: (plant: SavedPlant) => void;
  onUpdatePlantCare: (plantId: string, careType: "water" | "fertilize" | "repot") => void;
  onDeletePlant: (plantId: string) => void;
  onScanNewPlant?: () => void;
}

export default function MyPlantsScreen({
  plants,
  scans,
  onAddPlant,
  onEditPlant,
  onInspectProgress,
  onUpdatePlantCare,
  onDeletePlant,
  onScanNewPlant,
}: MyPlantsScreenProps) {
  const [filterLocation, setFilterLocation] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"attention" | "recent" | "name">("attention");

  const locations = ["All", ...Array.from(new Set(plants.map((p) => p.location || "Indoor").filter(Boolean)))];

  // Helper to compute care days countdown
  const getDaysRemaining = (lastActionIso: string, intervalDays: number): number => {
    try {
      const last = new Date(lastActionIso).getTime();
      const now = Date.now();
      const elapsedDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));
      return intervalDays - elapsedDays;
    } catch {
      return 0;
    }
  };

  // Filter & Sort
  const filteredPlants =
    filterLocation === "All"
      ? plants
      : plants.filter((p) => (p.location || "Indoor") === filterLocation);

  const sortedPlants = [...filteredPlants].sort((a, b) => {
    if (sortBy === "attention") {
      const aWater = getDaysRemaining(a.careSchedule.lastWatered, a.careSchedule.wateringDays);
      const bWater = getDaysRemaining(b.careSchedule.lastWatered, b.careSchedule.wateringDays);
      return aWater - bWater;
    }
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="screen-content pb-20">
      {/* Header */}
      <header className="pt-2 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-[24px] font-extrabold leading-tight tracking-[-0.03em] text-[#1D3023]">
            My Plants
          </h1>
          <p className="mt-1 text-[12px] text-[#485C4E]">
            Track care schedules, nicknames, and visual recovery progress.
          </p>
        </div>
        <button
          type="button"
          onClick={onAddPlant}
          className="flex size-10 items-center justify-center rounded-full bg-[#075F32] text-white shadow-xs hover:bg-[#153B27] active:scale-95 transition"
          aria-label="Add plant"
        >
          <Icon name="plus" size={18} strokeWidth={2.4} />
        </button>
      </header>

      {/* Filter and Sort Toolbar */}
      {plants.length > 0 && (
        <div className="mt-4 flex items-center justify-between gap-2 flex-wrap">
          {locations.length > 2 && (
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              {locations.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setFilterLocation(loc)}
                  className={`rounded-full px-3 py-1 text-[11px] font-bold transition ${
                    filterLocation === loc
                      ? "bg-[#075F32] text-white shadow-2xs"
                      : "bg-white border border-[#E3E5DC] text-[#485C4E] hover:text-[#1D3023]"
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          )}

          <div className="ml-auto flex items-center gap-1.5">
            <Icon name="filter" size={12} className="text-[#485C4E]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "attention" | "recent" | "name")}
              aria-label="Sort plants"
              className="rounded-full border border-[#E3E5DC] bg-white px-2.5 py-1 text-[11px] font-bold text-[#075F32] focus:outline-none"
            >
              <option value="attention">Needs Attention</option>
              <option value="recent">Recently Added</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>
        </div>
      )}

      {/* Plants Grid / List */}
      <section className="mt-4 space-y-3.5">
        {sortedPlants.length > 0 ? (
          sortedPlants.map((plant) => {
            const waterRemaining = getDaysRemaining(
              plant.careSchedule.lastWatered,
              plant.careSchedule.wateringDays
            );
            const fertRemaining = getDaysRemaining(
              plant.careSchedule.lastFertilized,
              plant.careSchedule.fertilizingDays
            );

            // Compute moisture percentage for circular hydration gauge ring
            const waterTotal = Math.max(1, plant.careSchedule.wateringDays);
            const waterElapsed = waterTotal - waterRemaining;
            const moisturePercent = Math.max(0, Math.min(100, Math.round(((waterTotal - waterElapsed) / waterTotal) * 100)));

            // Find matching scans
            const linkedScans = scans.filter(
              (s) =>
                plant.scanIds.includes(s.id) ||
                s.name.toLowerCase() === plant.species.toLowerCase()
            );

            const latestScan = linkedScans[0];

            return (
              <article
                key={plant.id}
                className="overflow-hidden rounded-[20px] border border-[#E3E5DC] bg-white p-4 shadow-xs transition hover:border-[#075F32]/40"
              >
                {/* Top Row: Thumbnail, Nickname, Species, and Actions */}
                <div className="flex items-start gap-3.5">
                  <PlantThumbnail
                    src={plant.photoUrl || latestScan?.previewUrl}
                    alt={plant.name}
                    size="lg"
                    className="shadow-2xs"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h2 className="font-heading truncate text-[16px] font-extrabold text-[#1D3023]">
                        {plant.name}
                      </h2>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => onEditPlant(plant)}
                          className="flex size-7 items-center justify-center rounded-full text-[#485C4E] hover:bg-[#EDF4EF] hover:text-[#075F32] transition"
                          title="Edit Schedule & Info"
                          aria-label="Edit plant"
                        >
                          <Icon name="edit" size={13} strokeWidth={2} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Remove ${plant.name} from My Plants?`)) {
                              onDeletePlant(plant.id);
                            }
                          }}
                          className="flex size-7 items-center justify-center rounded-full text-[#485C4E] hover:bg-[#FFF0EF] hover:text-[#C93C36] transition"
                          title="Remove Plant"
                          aria-label="Remove plant"
                        >
                          <Icon name="close" size={13} strokeWidth={2.4} />
                        </button>
                      </div>
                    </div>

                    <p className="text-[11px] text-[#485C4E] truncate">{plant.species}</p>

                    <div className="mt-1 flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#FAF9F5] px-2 py-0.5 text-[11px] font-semibold text-[#485C4E] border border-[#E3E5DC]">
                        <Icon name="map-pin" size={10} className="text-[#075F32]" />
                        {plant.location || "Indoor"}
                      </span>
                      {latestScan && (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                            latestScan.status === "Healthy"
                              ? "bg-[#EDF4EF] text-[#075F32]"
                              : "bg-[#FFF0EF] text-[#C93C36]"
                          }`}
                        >
                          <Icon
                            name={latestScan.status === "Healthy" ? "check" : "warning"}
                            size={10}
                            strokeWidth={2.4}
                          />
                          {latestScan.status === "Healthy" ? "Thriving" : "Under Care"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Plant Care Reminders Bar with Circular Hydration Ring */}
                <div className="mt-3.5 rounded-[14px] bg-[#FAF9F5] p-3 border border-[#E3E5DC]">
                  <div className="text-[11px] font-bold text-[#075F32] uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Icon name="clock" size={12} />
                      Care Schedule
                    </span>
                    <span className="text-[11px] text-[#485C4E] normal-case">Tap to record care</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Water Button with Circular Gauge */}
                    <button
                      type="button"
                      onClick={() => onUpdatePlantCare(plant.id, "water")}
                      className={`flex items-center justify-between rounded-[12px] p-2 text-left transition border ${
                        waterRemaining <= 0
                          ? "bg-[#FFF0EF] border-[#FADCD9] text-[#C93C36] animate-pulse-subtle"
                          : "bg-white border-[#E3E5DC] text-[#1D3023] hover:border-[#075F32]/40"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {/* Circular Hydration Ring */}
                        <div className="relative flex size-7 items-center justify-center shrink-0">
                          <svg className="size-7 -rotate-90" viewBox="0 0 36 36">
                            <path
                              className="text-[#DDE5DF]"
                              strokeWidth="3.5"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                              className={waterRemaining <= 0 ? "text-[#C93C36]" : moisturePercent < 30 ? "text-[#B45309]" : "text-[#075F32]"}
                              strokeDasharray={`${Math.max(5, Math.min(100, moisturePercent))}, 100`}
                              strokeWidth="3.5"
                              strokeLinecap="round"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <span className="absolute text-[#075F32]">
                            <Icon name="droplet" size={11} />
                          </span>
                        </div>
                        <div>
                          <p className="text-[11px] font-extrabold leading-none">Water</p>
                          <p className="text-[11px] opacity-80 mt-0.5 leading-none">
                            {waterRemaining <= 0 ? "Due today!" : `In ${waterRemaining}d`}
                          </p>
                        </div>
                      </div>
                      <span className="flex size-5 items-center justify-center rounded-full bg-[#EDF4EF] text-[#075F32]">
                        <Icon name="check" size={11} strokeWidth={2.4} />
                      </span>
                    </button>

                    {/* Fertilize Button */}
                    <button
                      type="button"
                      onClick={() => onUpdatePlantCare(plant.id, "fertilize")}
                      className={`flex items-center justify-between rounded-[12px] p-2 text-left transition border ${
                        fertRemaining <= 0
                          ? "bg-[#FEF6E6] border-[#FDE68A] text-[#B45309]"
                          : "bg-white border-[#E3E5DC] text-[#1D3023] hover:border-[#075F32]/40"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="flex size-7 items-center justify-center rounded-full bg-[#FEF6E6] text-[#B45309] shrink-0">
                          <Icon name="leaf" size={13} />
                        </span>
                        <div>
                          <p className="text-[11px] font-extrabold leading-none">Fertilize</p>
                          <p className="text-[11px] opacity-80 mt-0.5 leading-none">
                            {fertRemaining <= 0 ? "Due today!" : `In ${fertRemaining}d`}
                          </p>
                        </div>
                      </div>
                      <span className="flex size-5 items-center justify-center rounded-full bg-[#EDF4EF] text-[#075F32]">
                        <Icon name="check" size={11} strokeWidth={2.4} />
                      </span>
                    </button>
                  </div>
                </div>

                {/* Health Progress Tracker Button (Feature 4) */}
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#E3E5DC]/70">
                  <div className="flex items-center gap-1.5">
                    <span className="flex size-5 items-center justify-center rounded-full bg-[#EDF4EF] text-[#075F32]">
                      <Icon name="trending-up" size={11} strokeWidth={2.2} />
                    </span>
                    <span className="text-[11px] text-[#485C4E]">
                      {linkedScans.length} diagnostic scan{linkedScans.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onInspectProgress(plant)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#075F32] hover:underline"
                  >
                    <span>Health Progress</span>
                    <Icon name="arrow" size={12} strokeWidth={2.4} />
                  </button>
                </div>
              </article>
            );
          })
        ) : (
          <div className="rounded-[22px] border border-dashed border-[#E3E5DC] bg-white p-7 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#EDF4EF] text-[#075F32] mb-3">
              <Icon name="plants" size={24} />
            </div>
            <h3 className="font-heading text-[15px] font-extrabold text-[#1D3023]">
              Your Botanical Sanctuary is Empty
            </h3>
            <p className="mt-1 text-[11.5px] text-[#485C4E] max-w-[260px] mx-auto leading-relaxed">
              Add plants to track customized watering, fertilizing schedules, and historical recovery from diseases.
            </p>
            <div className="mt-4 flex flex-col gap-2 max-w-[200px] mx-auto">
              <button
                type="button"
                onClick={onAddPlant}
                className="rounded-[12px] bg-[#075F32] py-2.5 text-[12px] font-bold text-white shadow-2xs hover:bg-[#153B27] transition"
              >
                Add Your First Plant
              </button>
              {onScanNewPlant && (
                <button
                  type="button"
                  onClick={onScanNewPlant}
                  className="rounded-[12px] bg-[#EDF4EF] py-2 text-[11.5px] font-bold text-[#075F32] hover:bg-[#DCEADF] transition"
                >
                  Scan a New Plant
                </button>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
