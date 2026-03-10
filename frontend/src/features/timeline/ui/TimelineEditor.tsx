"use client";

import { useState, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import type { ProjectClip } from "@/entities/video-job/model/types";

interface TimelineClip extends ProjectClip {
  thumbnail_url?: string;
  title?: string;
  duration: number;
}

interface TimelineEditorProps {
  clips: TimelineClip[];
  totalDuration: number;
  onClipSelect?: (clipId: string) => void;
  onClipReorder?: (clipId: string, newPosition: number) => void;
  onClipTrim?: (clipId: string, startTrim: number, endTrim: number) => void;
  selectedClipId?: string;
}

const CLIP_COLORS = [
  "bg-[#eab308]/30",
  "bg-blue-500/30",
  "bg-emerald-500/30",
  "bg-purple-500/30",
  "bg-rose-500/30",
  "bg-cyan-500/30",
];

export function TimelineEditor({
  clips,
  totalDuration,
  onClipSelect,
  onClipReorder,
  onClipTrim,
  selectedClipId,
}: TimelineEditorProps) {
  const t = useTranslations("Timeline");
  const trackRef = useRef<HTMLDivElement>(null);
  const [playheadPosition, setPlayheadPosition] = useState(0);

  const handleTrackClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const fraction = (e.clientX - rect.left) / rect.width;
      setPlayheadPosition(Math.max(0, Math.min(1, fraction)));
    },
    [],
  );

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * 30);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}:${String(frames).padStart(2, "0")}`;
  }, []);

  const currentTime = playheadPosition * totalDuration;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">{t("title")}</h3>
        <div className="flex items-center gap-3">
          <span className="text-xs tabular-nums text-[#eab308]">{formatTime(currentTime)}</span>
          <span className="text-xs text-slate-500">/ {formatTime(totalDuration)}</span>
        </div>
      </div>

      {/* Timecode ruler */}
      <div className="mb-1 flex justify-between px-1">
        {Array.from({ length: 11 }).map((_, i) => (
          <span key={i} className="text-[9px] tabular-nums text-slate-600">
            {formatTime((totalDuration / 10) * i)}
          </span>
        ))}
      </div>

      {/* Timeline track */}
      <div
        ref={trackRef}
        className="relative h-16 cursor-pointer overflow-hidden rounded-lg border border-white/[0.06] bg-black/40"
        onClick={handleTrackClick}
      >
        {/* Clips */}
        <div className="absolute inset-0 flex">
          {clips.map((clip, i) => {
            const clipWidth = totalDuration > 0 ? (clip.duration / totalDuration) * 100 : 0;
            const isSelected = selectedClipId === clip.id;
            const colorClass = CLIP_COLORS[i % CLIP_COLORS.length];

            return (
              <div
                key={clip.id}
                className={`relative flex h-full items-center overflow-hidden border-r border-black/30 transition-all ${colorClass} ${
                  isSelected ? "ring-1 ring-[#eab308] ring-offset-1 ring-offset-[#050505]" : ""
                }`}
                style={{ width: `${clipWidth}%` }}
                onClick={(e) => {
                  e.stopPropagation();
                  onClipSelect?.(clip.id);
                }}
              >
                {/* Thumbnail */}
                {clip.thumbnail_url && (
                  <img
                    src={clip.thumbnail_url}
                    alt={clip.title || `Clip ${i + 1}`}
                    className="absolute inset-0 h-full w-full object-cover opacity-40"
                  />
                )}

                {/* Clip info overlay */}
                <div className="relative z-10 px-2">
                  <p className="truncate text-[10px] font-medium text-white">
                    {clip.title || `${t("clip")} ${i + 1}`}
                  </p>
                  <p className="text-[9px] tabular-nums text-white/60">
                    {clip.duration.toFixed(1)}s
                  </p>
                </div>

                {/* Transition indicator */}
                {clip.transition_type && clip.transition_type !== "cut" && (
                  <div className="absolute right-0 top-0 rounded-bl bg-black/50 px-1 py-0.5">
                    <span className="text-[8px] uppercase text-[#eab308]/70">
                      {clip.transition_type}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Playhead */}
        <div
          className="absolute top-0 z-20 h-full w-0.5 bg-[#eab308] shadow-[0_0_6px_rgba(234,179,8,0.5)]"
          style={{ left: `${playheadPosition * 100}%` }}
        >
          <div className="absolute -left-1.5 -top-1 h-2.5 w-3.5 rounded-sm bg-[#eab308]" />
        </div>
      </div>

      {/* Empty state */}
      {clips.length === 0 && (
        <div className="flex h-16 items-center justify-center">
          <p className="text-xs text-slate-500">{t("emptyTimeline")}</p>
        </div>
      )}

      {/* Clip list below timeline */}
      {clips.length > 0 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {clips.map((clip, i) => (
            <button
              key={clip.id}
              type="button"
              onClick={() => onClipSelect?.(clip.id)}
              className={`flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-left transition-all ${
                selectedClipId === clip.id
                  ? "border-[#eab308]/40 bg-[#eab308]/10"
                  : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]"
              }`}
            >
              {clip.thumbnail_url && (
                <img
                  src={clip.thumbnail_url}
                  alt=""
                  className="h-8 w-12 rounded object-cover"
                />
              )}
              <div>
                <p className="text-[11px] font-medium text-white">
                  {clip.title || `${t("clip")} ${i + 1}`}
                </p>
                <p className="text-[10px] tabular-nums text-slate-500">
                  {clip.duration.toFixed(1)}s
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
