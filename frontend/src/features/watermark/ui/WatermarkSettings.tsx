"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type Position =
  | "top-left"
  | "top-center"
  | "top-right"
  | "center-left"
  | "center"
  | "center-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

interface WatermarkSettingsProps {
  enabled?: boolean;
  text?: string;
  position?: Position;
  onChange: (settings: {
    watermark_enabled: boolean;
    watermark_text: string;
    watermark_position: Position;
  }) => void;
}

const POSITIONS: Position[] = [
  "top-left",
  "top-center",
  "top-right",
  "center-left",
  "center",
  "center-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
];

export function WatermarkSettings({
  enabled = false,
  text = "",
  position = "bottom-right",
  onChange,
}: WatermarkSettingsProps) {
  const t = useTranslations("Watermark");

  const [isEnabled, setIsEnabled] = useState(enabled);
  const [watermarkText, setWatermarkText] = useState(text);
  const [watermarkPosition, setWatermarkPosition] = useState<Position>(position);

  const emitChange = (
    overrides: Partial<{
      watermark_enabled: boolean;
      watermark_text: string;
      watermark_position: Position;
    }> = {}
  ) => {
    onChange({
      watermark_enabled: isEnabled,
      watermark_text: watermarkText,
      watermark_position: watermarkPosition,
      ...overrides,
    });
  };

  const handleToggle = () => {
    const next = !isEnabled;
    setIsEnabled(next);
    emitChange({ watermark_enabled: next });
  };

  const handleTextChange = (value: string) => {
    setWatermarkText(value);
    emitChange({ watermark_text: value });
  };

  const handlePositionChange = (pos: Position) => {
    setWatermarkPosition(pos);
    emitChange({ watermark_position: pos });
  };

  return (
    <div className="glass-card space-y-5 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">{t("title")}</h2>
          <p className="mt-0.5 text-xs text-slate-500">{t("description")}</p>
        </div>

        <button
          onClick={handleToggle}
          className={`relative h-6 w-11 rounded-full transition-colors cursor-pointer ${
            isEnabled ? "bg-[#eab308]" : "bg-white/[0.1]"
          }`}
        >
          <span
            className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
              isEnabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {isEnabled && (
        <>
          {/* Watermark text */}
          <div>
            <label className="mb-1 block text-xs text-slate-400">{t("watermarkText")}</label>
            <input
              type="text"
              value={watermarkText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder={t("watermarkTextPlaceholder")}
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-[#eab308]/40"
            />
          </div>

          {/* Position picker - 3x3 grid */}
          <div>
            <label className="mb-2 block text-xs text-slate-400">{t("position")}</label>
            <div className="mx-auto w-fit">
              <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                {POSITIONS.map((pos) => (
                  <button
                    key={pos}
                    onClick={() => handlePositionChange(pos)}
                    className={`h-8 w-8 rounded-md transition-all cursor-pointer ${
                      watermarkPosition === pos
                        ? "bg-[#eab308] shadow-md shadow-[#eab308]/20"
                        : "bg-white/[0.06] hover:bg-white/[0.12]"
                    }`}
                    title={pos}
                  />
                ))}
              </div>
            </div>
            <p className="mt-2 text-center text-[10px] text-slate-600">
              {watermarkPosition.replace(/-/g, " ")}
            </p>
          </div>

          {/* Preview */}
          <div className="relative aspect-video overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02]">
            <div className="flex h-full items-center justify-center">
              <span className="text-xs text-slate-600">{t("preview")}</span>
            </div>

            {watermarkText && (
              <span
                className={`absolute px-2 py-1 text-xs text-white/40 font-medium ${
                  watermarkPosition.includes("top") ? "top-2" : ""
                } ${watermarkPosition.includes("bottom") ? "bottom-2" : ""} ${
                  watermarkPosition.includes("center") && !watermarkPosition.includes("left") && !watermarkPosition.includes("right")
                    ? "left-1/2 -translate-x-1/2"
                    : ""
                } ${
                  watermarkPosition === "center"
                    ? "top-1/2 -translate-y-1/2"
                    : ""
                } ${watermarkPosition.includes("left") ? "left-2" : ""} ${
                  watermarkPosition.includes("right") ? "right-2" : ""
                } ${
                  watermarkPosition === "center-left" || watermarkPosition === "center-right"
                    ? "top-1/2 -translate-y-1/2"
                    : ""
                }`}
              >
                {watermarkText}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
