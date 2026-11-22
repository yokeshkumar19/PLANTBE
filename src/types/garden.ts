import type { ScanHistoryItem } from "./plant";

export interface PlantCareSchedule {
  wateringDays: number;
  lastWatered: string; // ISO date string
  fertilizingDays: number;
  lastFertilized: string; // ISO date string
  repottingMonths: number;
  lastRepotted: string; // ISO date string
}

export interface SavedPlant {
  id: string;
  name: string; // User nickname, e.g. "Bella" or "Balcony Tomato"
  species: string; // Common and/or botanical name, e.g. "Tomato (Solanum lycopersicum)"
  location?: string; // e.g. "Balcony", "Living Room", "Garden Bed"
  photoUrl?: string;
  createdAt: string;
  careSchedule: PlantCareSchedule;
  scanIds: string[]; // Linked scan history item IDs
}

export interface DiseaseKnowledgeItem {
  id: string;
  name: string;
  scientificName?: string;
  category: "Fungal" | "Bacterial" | "Viral" | "Abiotic / Environmental";
  summary: string;
  causes: string[];
  symptoms: string[];
  prevention: string[];
  treatments: string[];
}
