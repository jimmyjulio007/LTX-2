"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";

export interface Waypoint {
  x: number;
  y: number;
  t: number;
}

interface MotionPathCanvasProps {
  points: Waypoint[];
  onPointsChange: (points: Waypoint[]) => void;
  interpolation?: "linear" | "bezier";
  width?: number;
  height?: number;
}

export function MotionPathCanvas({
  points,
  onPointsChange,
  interpolation = "linear",
  width = 640,
  height = 360,
}: MotionPathCanvasProps) {
  const t = useTranslations("MotionPath");
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const getSvgCoords = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const svg = svgRef.current;
      if (!svg) return { x: 0, y: 0 };
      const rect = svg.getBoundingClientRect();
      return {
        x: Math.round(((e.clientX - rect.left) / rect.width) * width),
        y: Math.round(((e.clientY - rect.top) / rect.height) * height),
      };
    },
    [width, height],
  );

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (isDragging) return;
      const target = e.target as SVGElement;
      if (target.tagName === "circle") return;

      const coords = getSvgCoords(e);
      const nextT = points.length > 0 ? points[points.length - 1].t + 1 : 0;
      const newPoints = [...points, { ...coords, t: nextT }];
      onPointsChange(newPoints);
      setSelectedIndex(newPoints.length - 1);
    },
    [points, onPointsChange, getSvgCoords, isDragging],
  );

  const handlePointMouseDown = useCallback(
    (e: React.MouseEvent, index: number) => {
      e.stopPropagation();
      setSelectedIndex(index);
      setIsDragging(true);

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const svg = svgRef.current;
        if (!svg) return;
        const rect = svg.getBoundingClientRect();
        const x = Math.round(((moveEvent.clientX - rect.left) / rect.width) * width);
        const y = Math.round(((moveEvent.clientY - rect.top) / rect.height) * height);
        const updated = [...points];
        updated[index] = { ...updated[index], x, y };
        onPointsChange(updated);
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [points, onPointsChange, width, height],
  );

  const handleDeleteSelected = useCallback(() => {
    if (selectedIndex === null) return;
    const updated = points.filter((_, i) => i !== selectedIndex);
    onPointsChange(updated);
    setSelectedIndex(null);
  }, [selectedIndex, points, onPointsChange]);

  const handleClearAll = useCallback(() => {
    onPointsChange([]);
    setSelectedIndex(null);
  }, [onPointsChange]);

  const buildPathD = useCallback(() => {
    if (points.length < 2) return "";

    if (interpolation === "bezier" && points.length >= 3) {
      let d = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length - 1; i++) {
        const cp1x = (points[i - 1].x + points[i].x) / 2;
        const cp1y = (points[i - 1].y + points[i].y) / 2;
        const cp2x = (points[i].x + points[i + 1].x) / 2;
        const cp2y = (points[i].y + points[i + 1].y) / 2;
        d += ` Q ${points[i].x} ${points[i].y} ${cp2x} ${cp2y}`;
      }
      const last = points[points.length - 1];
      d += ` L ${last.x} ${last.y}`;
      return d;
    }

    return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  }, [points, interpolation]);

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">{t("title")}</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDeleteSelected}
            disabled={selectedIndex === null}
            className="rounded-lg px-2.5 py-1 text-xs text-slate-400 transition-colors hover:bg-white/[0.04] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            {t("deletePoint")}
          </button>
          <button
            type="button"
            onClick={handleClearAll}
            disabled={points.length === 0}
            className="rounded-lg px-2.5 py-1 text-xs text-red-400/70 transition-colors hover:bg-red-400/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
          >
            {t("clearAll")}
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-black/40">
        {/* Grid overlay */}
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="block w-full cursor-crosshair"
          onClick={handleCanvasClick}
        >
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeOpacity="0.04" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width={width} height={height} fill="url(#grid)" />

          {/* Path */}
          {points.length >= 2 && (
            <path
              d={buildPathD()}
              fill="none"
              stroke="#eab308"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeOpacity="0.7"
            />
          )}

          {/* Direction arrows along path */}
          {points.length >= 2 &&
            points.slice(0, -1).map((p, i) => {
              const next = points[i + 1];
              const midX = (p.x + next.x) / 2;
              const midY = (p.y + next.y) / 2;
              const angle = Math.atan2(next.y - p.y, next.x - p.x) * (180 / Math.PI);
              return (
                <polygon
                  key={`arrow-${i}`}
                  points="0,-4 8,0 0,4"
                  fill="#eab308"
                  fillOpacity="0.5"
                  transform={`translate(${midX},${midY}) rotate(${angle})`}
                />
              );
            })}

          {/* Waypoints */}
          {points.map((p, i) => (
            <g key={`point-${i}`}>
              {/* Outer ring for selected */}
              {selectedIndex === i && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="10"
                  fill="none"
                  stroke="#eab308"
                  strokeWidth="1.5"
                  strokeOpacity="0.4"
                />
              )}
              <circle
                cx={p.x}
                cy={p.y}
                r="6"
                fill={selectedIndex === i ? "#eab308" : "#ffffff"}
                fillOpacity={selectedIndex === i ? 1 : 0.8}
                stroke="#050505"
                strokeWidth="2"
                className="cursor-grab active:cursor-grabbing"
                onMouseDown={(e) => handlePointMouseDown(e, i)}
              />
              <text
                x={p.x}
                y={p.y - 12}
                textAnchor="middle"
                fill="white"
                fillOpacity="0.5"
                fontSize="9"
                fontFamily="monospace"
              >
                {i + 1}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Point info */}
      {points.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {points.map((p, i) => (
            <span
              key={`label-${i}`}
              className={`rounded px-1.5 py-0.5 text-[10px] tabular-nums ${
                selectedIndex === i
                  ? "bg-[#eab308]/20 text-[#eab308]"
                  : "bg-white/[0.04] text-slate-500"
              }`}
            >
              P{i + 1}: ({p.x},{p.y}) t={p.t}
            </span>
          ))}
        </div>
      )}

      {points.length === 0 && (
        <p className="mt-3 text-center text-xs text-slate-500">{t("clickToAdd")}</p>
      )}
    </div>
  );
}
