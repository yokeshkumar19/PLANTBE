import type { ApiResponse, PlantAnalysisResult } from "../types/plant";

export function isCapacitorNative(): boolean {
  if (typeof window === "undefined") return false;
  const win = window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } };
  if (win.Capacitor && typeof win.Capacitor.isNativePlatform === "function") {
    return win.Capacitor.isNativePlatform();
  }
  return (
    window.location.protocol === "capacitor:" ||
    (window.location.protocol === "https:" &&
      (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") &&
      /android|iphone|ipad/i.test(navigator.userAgent))
  );
}

export function getCustomApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("plantcare_api_url");
    if (saved && saved.trim()) return saved.trim().replace(/\/+$/, "");
  }
  return "";
}

export function setCustomApiBaseUrl(url: string): void {
  if (typeof window !== "undefined") {
    const clean = url.trim().replace(/\/+$/, "");
    if (clean) {
      localStorage.setItem("plantcare_api_url", clean);
    } else {
      localStorage.removeItem("plantcare_api_url");
    }
  }
}

/**
 * Resolves the backend base URL.
 * Checks localStorage first, then VITE_API_BASE_URL.
 * Prevents relative '/api' on Capacitor native where it hits local index.html.
 */
export function getApiBaseUrl(): string {
  const custom = getCustomApiBaseUrl();
  if (custom) return custom;

  const envUrl = (import.meta.env.VITE_API_BASE_URL || "").trim().replace(/\/+$/, "");

  // Inside Capacitor Native (Android APK)
  if (isCapacitorNative()) {
    if (envUrl && !envUrl.startsWith("/")) {
      return envUrl;
    }
    return "https://plantbe.onrender.com";
  }

  if (typeof window !== "undefined") {
    // 1. If running over HTTPS (such as cloud preview), prefer explicit HTTPS URL or relative /api proxy
    if (window.location.protocol === "https:") {
      if (envUrl.startsWith("https://")) {
        return envUrl;
      }
      return envUrl || "https://plantbe.onrender.com";
    }

    // 2. If accessed via local network on mobile browser (e.g. 192.168.x.x):
    if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      return envUrl || "https://plantbe.onrender.com";
    }
  }

  return envUrl || "https://plantbe.onrender.com";
}

/**
 * Strips optional markdown formatting like ```json ... ``` often produced by LLMs.
 */
function cleanJsonString(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/i, "").replace(/\s*```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }
  return cleaned.trim();
}

/**
 * Safely parses the nested result JSON string from the backend.
 */
export function parseAnalysisResult(rawResult: unknown): PlantAnalysisResult {
  let parsed: unknown = rawResult;

  if (typeof rawResult === "string") {
    try {
      const sanitized = cleanJsonString(rawResult);
      parsed = JSON.parse(sanitized);
    } catch (err) {
      console.error("Failed to parse JSON result string:", err, rawResult);
      throw new Error("Unable to parse the plant analysis result from the server.");
    }
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid analysis result structure received from server.");
  }

  const obj = parsed as Record<string, unknown>;

  // Extract plant
  const plant =
    typeof obj.plant === "string" && obj.plant.trim() ? obj.plant.trim() : "Unknown Plant";

  // Extract condition
  const condition =
    typeof obj.condition === "string" && obj.condition.trim()
      ? obj.condition.trim()
      : "Unspecified Condition";

  // Extract confidence (High | Medium | Low as documented, no fake percentage)
  let confidence: string = "Medium";
  if (typeof obj.confidence === "string" && obj.confidence.trim()) {
    const rawConf = obj.confidence.trim();
    // Normalize casing if needed
    const lower = rawConf.toLowerCase();
    if (lower === "high") confidence = "High";
    else if (lower === "medium") confidence = "Medium";
    else if (lower === "low") confidence = "Low";
    else confidence = rawConf;
  }

  // Extract visual evidence if provided
  let visual_evidence: string = "";
  if (typeof obj.visual_evidence === "string" && obj.visual_evidence.trim()) {
    visual_evidence = obj.visual_evidence.trim();
  } else if (Array.isArray(obj.visual_evidence)) {
    visual_evidence = obj.visual_evidence.join(" ").trim();
  } else if (typeof obj.visualEvidence === "string" && obj.visualEvidence.trim()) {
    visual_evidence = obj.visualEvidence.trim();
  }

  // Extract symptoms
  let symptoms: string[] | string = [];
  if (Array.isArray(obj.symptoms)) {
    symptoms = obj.symptoms.filter(
      (item): item is string => typeof item === "string" && item.trim().length > 0,
    );
  } else if (typeof obj.symptoms === "string" && obj.symptoms.trim()) {
    symptoms = obj.symptoms.trim();
  } else {
    symptoms = "No prominent symptoms detected.";
  }

  // Extract care recommendations
  let care: string[] | string = [];
  if (Array.isArray(obj.care)) {
    care = obj.care.filter(
      (item): item is string => typeof item === "string" && item.trim().length > 0,
    );
  } else if (typeof obj.care === "string" && obj.care.trim()) {
    care = obj.care.trim();
  } else {
    care = "Continue regular monitoring and optimal watering.";
  }

  // Extract warning (always ensure clear precautionary disclaimer)
  let warning: string[] | string | null = null;
  if (Array.isArray(obj.warning)) {
    const list = obj.warning.filter(
      (item): item is string => typeof item === "string" && item.trim().length > 0,
    );
    if (list.length > 0) warning = list;
  } else if (typeof obj.warning === "string" && obj.warning.trim()) {
    warning = obj.warning.trim();
  }

  if (!warning || (Array.isArray(warning) && warning.length === 0)) {
    warning =
      "Precautionary note: Photographic analysis is a preliminary screening and should not be considered a confirmed laboratory diagnosis. Consult local agricultural extension services for severe infestations.";
  }

  // Extract disease name if explicitly returned by the backend
  let disease_name: string | undefined = undefined;
  if (typeof obj.disease_name === "string" && obj.disease_name.trim()) {
    disease_name = obj.disease_name.trim();
  } else if (typeof obj.diseaseName === "string" && obj.diseaseName.trim()) {
    disease_name = obj.diseaseName.trim();
  } else if (typeof obj.disease === "string" && obj.disease.trim()) {
    disease_name = obj.disease.trim();
  }

  // Extract disease explanation if explicitly returned
  let disease_explanation: string | undefined = undefined;
  if (typeof obj.disease_explanation === "string" && obj.disease_explanation.trim()) {
    disease_explanation = obj.disease_explanation.trim();
  } else if (typeof obj.diseaseExplanation === "string" && obj.diseaseExplanation.trim()) {
    disease_explanation = obj.diseaseExplanation.trim();
  } else if (typeof obj.explanation === "string" && obj.explanation.trim()) {
    disease_explanation = obj.explanation.trim();
  }

  // Extract detailed analysis if available
  let detailed_analysis: string | undefined = undefined;
  if (typeof obj.detailed_analysis === "string" && obj.detailed_analysis.trim()) {
    detailed_analysis = obj.detailed_analysis.trim();
  } else if (typeof obj.detailedAnalysis === "string" && obj.detailedAnalysis.trim()) {
    detailed_analysis = obj.detailedAnalysis.trim();
  }

  return {
    plant,
    condition,
    confidence,
    disease_name,
    disease_explanation,
    visual_evidence,
    symptoms,
    care,
    warning,
    detailed_analysis,
  };
}

/**
 * Checks backend health via GET /
 */
export async function checkBackendHealth(): Promise<{ online: boolean; message?: string }> {
  const baseUrl = getApiBaseUrl();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${baseUrl}/`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (res.ok) {
      return { online: true };
    }
    return { online: false, message: `Server responded with HTTP ${res.status}` };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to reach backend";
    return { online: false, message };
  }
}

/**
 * Uploads an image file to POST /analyze using multipart/form-data with field 'file'.
 */
export async function analyzePlantImage(file: File): Promise<PlantAnalysisResult> {
  const baseUrl = getApiBaseUrl();
  const formData = new FormData();
  formData.append("file", file);

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/analyze`, {
      method: "POST",
      body: formData,
    });
  } catch (err) {
    console.error("Network error during /analyze request:", err);
    throw new Error(
      "Unable to connect to the analysis server. Please verify your backend is running at " +
      baseUrl +
      " and CORS is configured.",
    );
  }

  if (!response.ok) {
    let errorDetail = `Server returned status ${response.status} (${response.statusText})`;
    try {
      const errJson = await response.json();
      if (errJson.detail) {
        errorDetail =
          typeof errJson.detail === "string" ? errJson.detail : JSON.stringify(errJson.detail);
      } else if (errJson.error) {
        errorDetail = errJson.error;
      } else if (errJson.message) {
        errorDetail = errJson.message;
      }
    } catch {
      // ignore JSON parse failure for error response
    }
    throw new Error(errorDetail);
  }

  let responseText = "";
  try {
    responseText = await response.text();
  } catch (err) {
    console.error("Failed to read response from /analyze:", err);
    throw new Error("Unable to read response from the analysis server.");
  }

  // Detect HTML fallback (e.g. WebView serving index.html or 404/502 page)
  const trimmed = responseText.trim().toLowerCase();
  if (trimmed.startsWith("<!doctype") || trimmed.startsWith("<html")) {
    throw new Error(
      `Cannot reach the Python backend server at ${baseUrl}. Ensure backend/server.py is running on your network (or deployed to cloud) and verify your Backend URL in Settings.`,
    );
  }

  let data: ApiResponse;
  try {
    data = JSON.parse(responseText);
  } catch (err) {
    console.error("Failed to parse response JSON from /analyze:", err, responseText);
    throw new Error("Invalid response format received from backend: " + responseText.slice(0, 120));
  }

  if (!data.success) {
    throw new Error(data.error || data.message || "Plant analysis was not successful.");
  }

  if (!data.result) {
    throw new Error("No analysis data found in backend response.");
  }

  return parseAnalysisResult(data.result);
}
