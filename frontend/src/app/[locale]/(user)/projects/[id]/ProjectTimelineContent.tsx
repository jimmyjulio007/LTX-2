"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { TimelineEditor } from "@/features/timeline/ui/TimelineEditor";
import { TransitionPicker } from "@/features/timeline/ui/TransitionPicker";
import { CameraControlPanel } from "@/features/camera-controls/ui/CameraControlPanel";
import { CameraPresetPicker } from "@/features/camera-controls/ui/CameraPresetPicker";
import { MotionPathCanvas, type Waypoint } from "@/features/motion-paths/ui/MotionPathCanvas";
import { MotionPathToolbar } from "@/features/motion-paths/ui/MotionPathToolbar";
import { useProject, useProjectClips } from "@/features/timeline/api/use-projects";

interface ProjectTimelineContentProps {
  projectId: string;
  locale: string;
}

export function ProjectTimelineContent({ projectId, locale }: ProjectTimelineContentProps) {
  const t = useTranslations("Timeline");
  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: clips } = useProjectClips(projectId);

  const [selectedClipId, setSelectedClipId] = useState<string | undefined>();
  const [transitionType, setTransitionType] = useState<"cut" | "fade" | "dissolve" | "wipe">("cut");
  const [activePreset, setActivePreset] = useState<string | undefined>();
  const [motionPoints, setMotionPoints] = useState<Waypoint[]>([]);
  const [interpolation, setInterpolation] = useState<"linear" | "bezier">("linear");
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);

  const timelineClips = (clips ?? []).map((clip) => ({
    ...clip,
    duration: (clip.end_trim - clip.start_trim) || 4,
  }));

  const totalDuration = timelineClips.reduce((sum, c) => sum + c.duration, 0);

  if (projectLoading) {
    return (
      <div className="min-h-screen bg-[#050505] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 rounded bg-white/[0.04]" />
            <div className="h-32 rounded-2xl bg-white/[0.04]" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-64 rounded-2xl bg-white/[0.04]" />
              <div className="h-64 rounded-2xl bg-white/[0.04]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Project header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="gradient-text text-2xl font-bold">
              {project?.name ?? t("untitledProject")}
            </h1>
            {project?.description && (
              <p className="mt-1 text-sm text-slate-500">{project.description}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <TransitionPicker value={transitionType} onChange={setTransitionType} />
          </div>
        </div>

        {/* Timeline */}
        <TimelineEditor
          clips={timelineClips}
          totalDuration={totalDuration}
          selectedClipId={selectedClipId}
          onClipSelect={setSelectedClipId}
        />

        {/* Two-column layout: Camera + Motion */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Camera controls */}
          <div className="space-y-4">
            <CameraPresetPicker
              activePreset={activePreset}
              onSelectPreset={(_values, key) => setActivePreset(key)}
            />
            <CameraControlPanel />
          </div>

          {/* Motion path */}
          <div className="space-y-4">
            <MotionPathToolbar
              interpolation={interpolation}
              onInterpolationChange={setInterpolation}
              onAddPoint={() => {
                const nextT = motionPoints.length > 0 ? motionPoints[motionPoints.length - 1].t + 1 : 0;
                setMotionPoints([...motionPoints, { x: 320, y: 180, t: nextT }]);
              }}
              onDeleteSelected={() => {
                if (selectedPointIndex !== null) {
                  setMotionPoints(motionPoints.filter((_, i) => i !== selectedPointIndex));
                  setSelectedPointIndex(null);
                }
              }}
              onClearAll={() => {
                setMotionPoints([]);
                setSelectedPointIndex(null);
              }}
              pointCount={motionPoints.length}
              hasSelection={selectedPointIndex !== null}
            />
            <MotionPathCanvas
              points={motionPoints}
              onPointsChange={setMotionPoints}
              interpolation={interpolation}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
