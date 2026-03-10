"use client";

import { useTranslations } from "next-intl";

interface CameraValues {
  pan: number;
  tilt: number;
  zoom: number;
  roll: number;
  dolly: number;
}

interface Preset {
  key: string;
  icon: string;
  values: CameraValues;
}

const PRESETS: Preset[] = [
  { key: "static", icon: "\u25CE", values: { pan: 0, tilt: 0, zoom: 0, roll: 0, dolly: 0 } },
  { key: "slowPush", icon: "\u2192", values: { pan: 0, tilt: 0, zoom: 20, roll: 0, dolly: 30 } },
  { key: "orbitLeft", icon: "\u21BA", values: { pan: -60, tilt: 0, zoom: 0, roll: 0, dolly: 0 } },
  { key: "craneUp", icon: "\u2191", values: { pan: 0, tilt: 50, zoom: 0, roll: 0, dolly: 0 } },
  { key: "dollyZoom", icon: "\u2300", values: { pan: 0, tilt: 0, zoom: -40, roll: 0, dolly: 60 } },
  { key: "tracking", icon: "\u2794", values: { pan: 30, tilt: 0, zoom: 0, roll: 0, dolly: 40 } },
  { key: "handheld", icon: "\u270B", values: { pan: 5, tilt: 3, zoom: 2, roll: 4, dolly: 2 } },
  { key: "aerialSweep", icon: "\u2708", values: { pan: 45, tilt: -30, zoom: 10, roll: 15, dolly: 50 } },
];

interface CameraPresetPickerProps {
  activePreset?: string;
  onSelectPreset: (values: CameraValues, presetKey: string) => void;
}

export function CameraPresetPicker({ activePreset, onSelectPreset }: CameraPresetPickerProps) {
  const t = useTranslations("Camera");

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
      <h3 className="mb-3 text-sm font-semibold text-white">{t("presets")}</h3>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {PRESETS.map((preset) => {
          const isActive = activePreset === preset.key;
          return (
            <button
              key={preset.key}
              type="button"
              onClick={() => onSelectPreset(preset.values, preset.key)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-center transition-all ${
                isActive
                  ? "border-[#eab308]/40 bg-[#eab308]/10 text-[#eab308]"
                  : "border-white/[0.06] bg-white/[0.02] text-slate-400 hover:border-white/[0.12] hover:text-white"
              }`}
            >
              <span className="text-lg">{preset.icon}</span>
              <span className="text-[11px] font-medium leading-tight">
                {t(`preset_${preset.key}`)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
