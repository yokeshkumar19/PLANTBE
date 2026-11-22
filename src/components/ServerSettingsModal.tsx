import { useState, useEffect } from "react";
import Icon from "./BotanicalIcon";
import { getApiBaseUrl, setCustomApiBaseUrl, checkBackendHealth } from "../services/api";

interface ServerSettingsModalProps {
  onClose: () => void;
}

export default function ServerSettingsModal({ onClose }: ServerSettingsModalProps) {
  const [url, setUrl] = useState(() => getApiBaseUrl());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setUrl(getApiBaseUrl());
  }, []);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    setSaveSuccess(false);

    try {
      const cleanUrl = url.trim().replace(/\/+$/, "");
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`${cleanUrl}/`, {
        method: "GET",
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (res.ok) {
        setTestResult({
          success: true,
          message: "Connected! Python backend is online and responding.",
        });
      } else {
        setTestResult({
          success: false,
          message: `Server reachable but returned HTTP ${res.status}.`,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to connect";
      setTestResult({
        success: false,
        message: `Unable to reach ${url}. Ensure backend/server.py is running on this IP. (${msg})`,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    setCustomApiBaseUrl(url);
    setSaveSuccess(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handlePreset = (presetUrl: string) => {
    setUrl(presetUrl);
    setTestResult(null);
    setSaveSuccess(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#153B27]/50 p-4 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[420px] rounded-[24px] border border-[#E3E5DC] bg-[#F7F6F0] p-5 shadow-[0_24px_60px_rgba(21,59,39,0.25)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-full bg-white/80 text-[#1D3023] hover:bg-white shadow-xs transition"
        >
          <Icon name="close" size={15} strokeWidth={2.4} />
        </button>

        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-[11px] bg-[#EDF4EF] text-[#075F32]">
            <Icon name="sparkles" size={18} />
          </span>
          <div>
            <h2 className="font-heading text-[16px] font-bold text-[#1D3023]">
              Backend Server URL
            </h2>
            <p className="text-[11px] text-[#485C4E]">
              Connect your mobile app to PlantCare AI backend
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-[11.5px] font-bold text-[#1D3023]">
              API Server Address
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setTestResult(null);
                setSaveSuccess(false);
              }}
              placeholder="http://192.168.31.217:8000"
              className="mt-1 w-full rounded-[12px] border border-[#E3E5DC] bg-white px-3.5 py-2.5 text-[12.5px] font-mono text-[#1D3023] focus:border-[#075F32] focus:ring-1 focus:ring-[#075F32] focus:outline-none shadow-2xs"
            />
          </div>

          {/* Quick Presets */}
          <div>
            <span className="text-[10.5px] font-bold text-[#485C4E] uppercase tracking-wider">
              Quick Presets
            </span>
            <div className="mt-1 flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handlePreset("https://plantbe.onrender.com")}
                className="rounded-lg border border-[#075F32]/30 bg-[#EDF4EF] px-2 py-1 text-[10.5px] font-bold text-[#075F32] hover:bg-[#DCEADF] transition"
              >
                Render Cloud (plantbe.onrender.com)
              </button>
              <button
                type="button"
                onClick={() => handlePreset("http://192.168.31.217:8000")}
                className="rounded-lg border border-[#E3E5DC] bg-white px-2 py-1 text-[10.5px] font-semibold text-[#485C4E] hover:bg-[#EDF4EF] transition"
              >
                Local PC Wi-Fi
              </button>
              <button
                type="button"
                onClick={() => handlePreset("http://10.0.2.2:8000")}
                className="rounded-lg border border-[#E3E5DC] bg-white px-2 py-1 text-[10.5px] font-semibold text-[#485C4E] hover:bg-[#EDF4EF] transition"
              >
                Emulator (10.0.2.2)
              </button>
              <button
                type="button"
                onClick={() => handlePreset("http://localhost:8000")}
                className="rounded-lg border border-[#E3E5DC] bg-white px-2 py-1 text-[10.5px] font-semibold text-[#485C4E] hover:bg-[#EDF4EF] transition"
              >
                Localhost
              </button>
            </div>
          </div>

          {/* Test connection output */}
          {testResult && (
            <div
              className={`rounded-[12px] p-2.5 text-[11px] font-medium flex items-start gap-2 ${
                testResult.success
                  ? "bg-[#EDF4EF] border border-[#075F32]/25 text-[#075F32]"
                  : "bg-[#FFF0EF] border border-[#C93C36]/25 text-[#C93C36]"
              }`}
            >
              <Icon
                name={testResult.success ? "check" : "warning"}
                size={14}
                className="shrink-0 mt-0.5"
              />
              <span className="leading-tight flex-1">{testResult.message}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="rounded-[12px] bg-[#EDF4EF] border border-[#075F32]/25 p-2 text-center text-[11px] font-bold text-[#075F32]">
              Settings saved successfully!
            </div>
          )}

          <div className="pt-1 flex gap-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing}
              className="flex-1 flex h-10 items-center justify-center gap-1.5 rounded-[12px] border border-[#075F32]/30 bg-white text-[12px] font-bold text-[#075F32] hover:bg-[#EDF4EF] active:scale-95 transition disabled:opacity-60"
            >
              {testing ? (
                <>
                  <Icon name="spinner" size={14} className="animate-spin text-[#075F32]" />
                  <span>Testing...</span>
                </>
              ) : (
                <>
                  <Icon name="refresh" size={13} />
                  <span>Test Connection</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="flex-1 flex h-10 items-center justify-center gap-1.5 rounded-[12px] bg-[#075F32] text-[12px] font-bold text-white hover:bg-[#153B27] active:scale-95 transition shadow-xs"
            >
              <Icon name="check" size={14} strokeWidth={2.4} />
              <span>Save & Apply</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
