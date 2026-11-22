import { useState } from "react";
import type { SavedPlant } from "../types/garden";
import Icon from "./BotanicalIcon";

interface EditPlantModalProps {
  plant?: SavedPlant | null;
  initialSpecies?: string;
  initialPhotoUrl?: string;
  initialScanId?: string;
  onSave: (plant: SavedPlant) => void;
  onClose: () => void;
}

export default function EditPlantModal({
  plant,
  initialSpecies = "",
  initialPhotoUrl = "",
  initialScanId,
  onSave,
  onClose,
}: EditPlantModalProps) {
  const [name, setName] = useState(plant?.name || initialSpecies.split("(")[0].trim() || "My Plant");
  const [species, setSpecies] = useState(plant?.species || initialSpecies || "Houseplant");
  const [location, setLocation] = useState(plant?.location || "Living Room");
  const [photoUrl, setPhotoUrl] = useState(plant?.photoUrl || initialPhotoUrl || "");

  // Customizable Reminder Schedules
  const [wateringDays, setWateringDays] = useState(plant?.careSchedule.wateringDays || 7);
  const [fertilizingDays, setFertilizingDays] = useState(plant?.careSchedule.fertilizingDays || 21);
  const [repottingMonths, setRepottingMonths] = useState(plant?.careSchedule.repottingMonths || 12);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updated: SavedPlant = {
      id: plant?.id || Date.now().toString(),
      name: name.trim() || "My Green Friend",
      species: species.trim() || "Houseplant",
      location: location.trim() || "Indoor",
      photoUrl,
      createdAt: plant?.createdAt || new Date().toISOString(),
      careSchedule: {
        wateringDays: Number(wateringDays) || 7,
        lastWatered: plant?.careSchedule.lastWatered || new Date().toISOString(),
        fertilizingDays: Number(fertilizingDays) || 21,
        lastFertilized: plant?.careSchedule.lastFertilized || new Date().toISOString(),
        repottingMonths: Number(repottingMonths) || 12,
        lastRepotted: plant?.careSchedule.lastRepotted || new Date().toISOString(),
      },
      scanIds: plant?.scanIds || (initialScanId ? [initialScanId] : []),
    };

    onSave(updated);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#153D27]/40 p-4 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-h-[88vh] w-full max-w-[390px] overflow-y-auto rounded-[24px] border border-[#E3E5DC] bg-white p-5 shadow-[0_20px_50px_rgba(21,61,39,0.18)] no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-[18px] font-extrabold text-[#1D3023]">
            {plant ? "Edit Plant & Schedule" : "Add to My Plants"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-8 items-center justify-center rounded-full bg-[#EDF4EF] text-[#1D3023] hover:bg-[#D7E6D9] transition active:scale-95"
          >
            <Icon name="close" size={15} strokeWidth={2.4} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {/* Custom Nickname */}
          <div>
            <label className="block text-[11px] font-bold text-[#1D3023] mb-1">
              Plant Nickname
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Monty, Bella, Window Basil"
              className="w-full rounded-[12px] border border-[#E3E5DC] bg-[#FAF9F5] px-3 py-2.5 text-[12px] text-[#1D3023] focus:border-[#075F32] focus:outline-none"
            />
          </div>

          {/* Plant Species */}
          <div>
            <label className="block text-[11px] font-bold text-[#1D3023] mb-1">
              Species / Variety
            </label>
            <input
              type="text"
              required
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              placeholder="e.g. Monstera Deliciosa, Roma Tomato"
              className="w-full rounded-[12px] border border-[#E3E5DC] bg-[#FAF9F5] px-3 py-2.5 text-[12px] text-[#1D3023] focus:border-[#075F32] focus:outline-none"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-[11px] font-bold text-[#1D3023] mb-1">
              Location in Garden / Home
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Sunny Balcony, Kitchen Window, Bedroom"
              className="w-full rounded-[12px] border border-[#E3E5DC] bg-[#FAF9F5] px-3 py-2.5 text-[12px] text-[#1D3023] focus:border-[#075F32] focus:outline-none"
            />
          </div>

          {/* Section: Care Reminders (Feature 2) */}
          <div className="pt-2 border-t border-[#E3E5DC]">
            <p className="font-heading text-[12.5px] font-extrabold text-[#075F32] flex items-center gap-1.5 mb-2.5">
              <Icon name="clock" size={15} className="text-[#075F32]" />
              Customizable Care Reminders
            </p>

            <div className="space-y-2.5">
              {/* Watering */}
              <div className="flex items-center justify-between rounded-[12px] bg-[#EDF4EF]/60 p-2.5 border border-[#A8C9AE]/30">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-full bg-[#EDF4EF] text-[#075F32]">
                    <Icon name="droplet" size={14} />
                  </span>
                  <div>
                    <span className="text-[11.5px] font-bold text-[#1D3023]">Watering</span>
                    <p className="text-[11px] text-[#485C4E]">Hydration frequency</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-[#485C4E]">Every</span>
                  <select
                    value={wateringDays}
                    onChange={(e) => setWateringDays(Number(e.target.value))}
                    className="rounded-[8px] border border-[#A8C9AE] bg-white px-2 py-1 text-[11px] font-bold text-[#075F32]"
                  >
                    <option value={2}>2 days</option>
                    <option value={3}>3 days</option>
                    <option value={5}>5 days</option>
                    <option value={7}>7 days (weekly)</option>
                    <option value={10}>10 days</option>
                    <option value={14}>14 days (bi-weekly)</option>
                  </select>
                </div>
              </div>

              {/* Fertilizing */}
              <div className="flex items-center justify-between rounded-[12px] bg-[#FEF6E6]/60 p-2.5 border border-[#FDE68A]/50">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-full bg-[#FEF6E6] text-[#B45309]">
                    <Icon name="leaf" size={14} />
                  </span>
                  <div>
                    <span className="text-[11.5px] font-bold text-[#1D3023]">Fertilizing</span>
                    <p className="text-[11px] text-[#485C4E]">Nutrient feeding</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-[#485C4E]">Every</span>
                  <select
                    value={fertilizingDays}
                    onChange={(e) => setFertilizingDays(Number(e.target.value))}
                    className="rounded-[8px] border border-[#FDE68A] bg-white px-2 py-1 text-[11px] font-bold text-[#B45309]"
                  >
                    <option value={7}>7 days</option>
                    <option value={14}>14 days</option>
                    <option value={21}>21 days (3 weeks)</option>
                    <option value={30}>30 days (monthly)</option>
                    <option value={60}>60 days</option>
                  </select>
                </div>
              </div>

              {/* Repotting */}
              <div className="flex items-center justify-between rounded-[12px] bg-[#F7F7F1] p-2.5 border border-[#E3E5DC]">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-full bg-[#F4F7F4] text-[#1D3023]">
                    <Icon name="plant" size={14} />
                  </span>
                  <div>
                    <span className="text-[11.5px] font-bold text-[#1D3023]">Repotting</span>
                    <p className="text-[11px] text-[#485C4E]">Root expansion</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-[#485C4E]">Every</span>
                  <select
                    value={repottingMonths}
                    onChange={(e) => setRepottingMonths(Number(e.target.value))}
                    className="rounded-[8px] border border-[#E3E5DC] bg-white px-2 py-1 text-[11px] font-bold text-[#1D3023]"
                  >
                    <option value={6}>6 months</option>
                    <option value={12}>12 months (annual)</option>
                    <option value={18}>18 months</option>
                    <option value={24}>24 months</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-[12px] border border-[#E3E5DC] py-2.5 text-[11.5px] font-bold text-[#485C4E] hover:bg-[#F7F7F1]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-[12px] bg-[#075F32] py-2.5 text-[11.5px] font-bold text-white shadow-2xs hover:bg-[#153B27]"
            >
              Save Plant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
