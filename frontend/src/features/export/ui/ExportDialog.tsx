"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useExportVideo } from "../api/use-export";

interface ExportDialogProps {
  jobId: string;
  onClose: () => void;
}

type Format = "mp4" | "webm" | "prores" | "gif";
type Quality = "720p" | "1080p" | "4k";

const FORMATS: { value: Format; label: string }[] = [
  { value: "mp4", label: "MP4" },
  { value: "webm", label: "WebM" },
  { value: "prores", label: "ProRes" },
  { value: "gif", label: "GIF" },
];

const QUALITIES: { value: Quality; label: string }[] = [
  { value: "720p", label: "720p" },
  { value: "1080p", label: "1080p" },
  { value: "4k", label: "4K" },
];

const FPS_OPTIONS = [24, 30, 60];

export function ExportDialog({ jobId, onClose }: ExportDialogProps) {
  const t = useTranslations("Export");
  const exportMutation = useExportVideo();

  const [format, setFormat] = useState<Format>("mp4");
  const [quality, setQuality] = useState<Quality>("1080p");
  const [fps, setFps] = useState(24);
  const [alpha, setAlpha] = useState(false);

  const handleExport = async () => {
    const result = await exportMutation.mutateAsync({
      job_id: jobId,
      format,
      quality,
      fps,
      alpha,
    });

    // Trigger download if a URL is returned
    if (result.download_url) {
      const a = document.createElement("a");
      a.href = result.download_url;
      a.download = `export.${format}`;
      a.click();
    }
  };

  const supportsAlpha = format === "webm" || format === "prores";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-6 space-y-5">
        <h3 className="text-lg font-semibold text-white">{t("title")}</h3>
        <p className="text-sm text-slate-400">{t("description")}</p>

        {/* Format */}
        <div>
          <label className="mb-2 block text-xs text-slate-400">{t("format")}</label>
          <div className="grid grid-cols-4 gap-2">
            {FORMATS.map((f) => (
              <button
                key={f.value}
                onClick={() => {
                  setFormat(f.value);
                  if (!["webm", "prores"].includes(f.value)) setAlpha(false);
                }}
                className={`rounded-lg border py-2.5 text-xs font-medium transition-colors cursor-pointer ${
                  format === f.value
                    ? "border-[#eab308]/40 bg-[#eab308]/10 text-[#eab308]"
                    : "border-white/[0.06] bg-white/[0.02] text-slate-400 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quality */}
        <div>
          <label className="mb-2 block text-xs text-slate-400">{t("quality")}</label>
          <div className="grid grid-cols-3 gap-2">
            {QUALITIES.map((q) => (
              <button
                key={q.value}
                onClick={() => setQuality(q.value)}
                className={`rounded-lg border py-2.5 text-xs font-medium transition-colors cursor-pointer ${
                  quality === q.value
                    ? "border-[#eab308]/40 bg-[#eab308]/10 text-[#eab308]"
                    : "border-white/[0.06] bg-white/[0.02] text-slate-400 hover:text-white"
                }`}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* FPS */}
        <div>
          <label className="mb-2 block text-xs text-slate-400">{t("fps")}</label>
          <div className="grid grid-cols-3 gap-2">
            {FPS_OPTIONS.map((f) => (
              <button
                key={f}
                onClick={() => setFps(f)}
                className={`rounded-lg border py-2.5 text-xs font-medium transition-colors cursor-pointer ${
                  fps === f
                    ? "border-[#eab308]/40 bg-[#eab308]/10 text-[#eab308]"
                    : "border-white/[0.06] bg-white/[0.02] text-slate-400 hover:text-white"
                }`}
              >
                {f} FPS
              </button>
            ))}
          </div>
        </div>

        {/* Alpha toggle */}
        <div
          className={`flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-opacity ${
            supportsAlpha ? "opacity-100" : "pointer-events-none opacity-30"
          }`}
        >
          <div>
            <p className="text-sm font-medium text-white">{t("alphaChannel")}</p>
            <p className="text-xs text-slate-500">{t("alphaDesc")}</p>
          </div>
          <button
            onClick={() => setAlpha(!alpha)}
            disabled={!supportsAlpha}
            className={`relative h-6 w-11 rounded-full transition-colors cursor-pointer ${
              alpha ? "bg-[#eab308]" : "bg-white/[0.1]"
            }`}
          >
            <span
              className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                alpha ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-white/[0.08] px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            {t("cancel")}
          </button>
          <button
            onClick={handleExport}
            disabled={exportMutation.isPending}
            className="btn-gold px-6 py-3 text-sm font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
          >
            {exportMutation.isPending ? t("exporting") : t("download")}
          </button>
        </div>

        {exportMutation.isError && (
          <p className="text-sm text-red-400">{t("exportError")}</p>
        )}
      </div>
    </div>
  );
}
