"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";

type TransitionType = "cut" | "fade" | "dissolve" | "wipe";

interface TransitionPickerProps {
  value: TransitionType;
  onChange: (transition: TransitionType) => void;
  duration?: number;
  onDurationChange?: (duration: number) => void;
}

const TRANSITIONS: { key: TransitionType; icon: string }[] = [
  { key: "cut", icon: "\u2702" },
  { key: "fade", icon: "\u25D0" },
  { key: "dissolve", icon: "\u2588" },
  { key: "wipe", icon: "\u25B6" },
];

export function TransitionPicker({
  value,
  onChange,
  duration = 0.5,
  onDurationChange,
}: TransitionPickerProps) {
  const t = useTranslations("Timeline");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedTransition = TRANSITIONS.find((tr) => tr.key === value) ?? TRANSITIONS[0];

  return (
    <div ref={dropdownRef} className="relative inline-block">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs text-white transition-colors hover:border-white/[0.12]"
      >
        <span>{selectedTransition.icon}</span>
        <span>{t(`transition_${value}`)}</span>
        <svg
          className={`h-3 w-3 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute left-0 top-full z-30 mt-1 w-56 rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-2 shadow-xl">
          <p className="mb-2 px-2 text-[10px] uppercase tracking-wider text-slate-500">
            {t("transitionType")}
          </p>

          {TRANSITIONS.map((tr) => (
            <button
              key={tr.key}
              type="button"
              onClick={() => {
                onChange(tr.key);
                setIsOpen(false);
              }}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                value === tr.key
                  ? "bg-[#eab308]/10 text-[#eab308]"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <span className="text-base">{tr.icon}</span>
              <div>
                <span className="font-medium">{t(`transition_${tr.key}`)}</span>
                <p className="mt-0.5 text-[10px] text-slate-500">
                  {t(`transition_${tr.key}_desc`)}
                </p>
              </div>
            </button>
          ))}

          {/* Duration control */}
          {value !== "cut" && onDurationChange && (
            <div className="mt-2 border-t border-white/[0.06] px-2 pt-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-slate-500">{t("transitionDuration")}</label>
                <span className="text-[10px] tabular-nums text-[#eab308]">{duration.toFixed(1)}s</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={2}
                step={0.1}
                value={duration}
                onChange={(e) => onDurationChange(parseFloat(e.target.value))}
                className="mt-1 h-1 w-full cursor-pointer appearance-none rounded-full bg-white/[0.06] accent-[#eab308] [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#eab308]"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
