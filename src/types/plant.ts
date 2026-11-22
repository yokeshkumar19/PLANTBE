export interface PlantAnalysisResult {
  plant: string;
  condition: string;
  confidence: "High" | "Medium" | "Low" | string;
  disease_name?: string;
  disease_explanation?: string;
  visual_evidence?: string;
  symptoms: string[] | string;
  care: string[] | string;
  warning?: string[] | string | null;
  detailed_analysis?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  result?: string | T;
  error?: string;
  message?: string;
  detail?: string;
}

export interface ScanHistoryItem {
  id: string;
  name: string;
  date: string;
  status: "Healthy" | "Diseased";
  confidence: string;
  condition: string;
  previewUrl?: string;
  result: PlantAnalysisResult;
}
