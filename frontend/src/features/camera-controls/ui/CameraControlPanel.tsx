"use client";

import { useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";

interface CameraValues {
  pan: number;
  tilt: number;
  zoom: number;
  roll: number;
  dolly: number;
}

interface CameraControlPanelProps {
  initialValues?: CameraValues;
  onChange?: (cameraMotionJson: string) => void;
}

const DEFAULT_VALUES: CameraValues = {
  pan: 0,
  tilt: 0,
  zoom: 0,
  roll: 0,
  dolly: 0,
};

const SLIDER_KEYS: (keyof CameraValues)[] = ["pan", "tilt", "zoom", "roll", "dolly"];

export function CameraControlPanel({ initialValues, onChange }: CameraControlPanelProps) {
  const t = useTranslations("Camera");
  const [values, setValues] = useState<CameraValues>(initialValues ?? DEFAULT_VALUES);

  const handleSliderChange = useCallback(
    (key: keyof CameraValues, raw: string) => {
      const numericValue = parseInt(raw, 10);
      setValues((prev) => {
        const next = { ...prev, [key]: numericValue };
        onChange?.(JSON.stringify(next));
        return next;
      });
    },
    [onChange],
  );

  const handleReset = useCallback(() => {
    setValues(DEFAULT_VALUES);
    onChange?.(JSON.stringify(DEFAULT_VALUES));
  }, [onChange]);

  const cameraMotionJson = useMemo(() => JSON.stringify(values), [values]);

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">{t("title")}</h3>
        <button
          type="button"
          onClick={handleReset}
          className="rounded-lg px-2.5 py-1 text-xs text-slate-400 transition-colors hover:bg-white/[0.04] hover:text-white"
        >
          {t("reset")}
        </button>
      </div>

      <div className="space-y-4">
        {SLIDER_KEYS.map((key) => (
          <div key={key} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor={`camera-${key}`} className="text-xs font-medium text-slate-400">
                {t(key)}
              </label>
              <span className="min-w-[3ch] text-right text-xs tabular-nums text-[#eab308]">
                {values[key]}
              </span>
            </div>
            <input
              id={`camera-${key}`}
              type="range"
              min={-100}
              max={100}
              step={1}
              value={values[key]}
              onChange={(e) => handleSliderChange(key, e.target.value)}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/[0.06] accent-[#eab308] [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#eab308]"
            />
          </div>
        ))}
      </div>

      {/* Read-only JSON output */}
      <div className="mt-4 rounded-lg bg-black/30 p-2.5">
        <p className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">
          {t("jsonOutput")}
        </p>
        <code className="block break-all text-[11px] text-slate-400">{cameraMotionJson}</code>
      </div>
    </div>
  );
}
