"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ProjectCard } from "@/features/timeline/ui/ProjectCard";
import { useProjects, useCreateProject } from "@/features/timeline/api/use-projects";

interface ProjectsPageContentProps {
  locale: string;
}

export function ProjectsPageContent({ locale }: ProjectsPageContentProps) {
  const t = useTranslations("Timeline");
  const { data: projects, isLoading, error } = useProjects();
  const createProject = useCreateProject();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;
    createProject.mutate(
      { name: newProjectName.trim(), description: newProjectDescription.trim() || undefined },
      {
        onSuccess: () => {
          setNewProjectName("");
          setNewProjectDescription("");
          setShowCreateForm(false);
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="gradient-text text-3xl font-bold">{t("projectsTitle")}</h1>
            <p className="mt-1 text-sm text-slate-500">{t("projectsSubtitle")}</p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-1.5 rounded-lg bg-[#eab308]/10 px-4 py-2 text-sm font-medium text-[#eab308] transition-colors hover:bg-[#eab308]/20"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t("newProject")}
          </button>
        </div>

        {/* Create form modal */}
        {showCreateForm && (
          <div className="mb-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <h3 className="mb-4 text-sm font-semibold text-white">{t("newProject")}</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder={t("projectName")}
                className="block w-full rounded-lg border border-white/[0.06] bg-black/30 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-[#eab308]/30 focus:outline-none focus:ring-1 focus:ring-[#eab308]/30"
              />
              <textarea
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                placeholder={t("projectDescription")}
                rows={2}
                className="block w-full resize-none rounded-lg border border-white/[0.06] bg-black/30 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-[#eab308]/30 focus:outline-none focus:ring-1 focus:ring-[#eab308]/30"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="rounded-lg px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  {t("cancel")}
                </button>
                <button
                  type="button"
                  onClick={handleCreateProject}
                  disabled={!newProjectName.trim() || createProject.isPending}
                  className="rounded-lg bg-[#eab308]/10 px-4 py-1.5 text-xs font-medium text-[#eab308] transition-colors hover:bg-[#eab308]/20 disabled:opacity-50"
                >
                  {createProject.isPending ? t("creating") : t("create")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
              >
                <div className="mb-3 aspect-video rounded-xl bg-white/[0.04]" />
                <div className="mb-2 h-4 w-2/3 rounded bg-white/[0.04]" />
                <div className="h-3 w-1/3 rounded bg-white/[0.04]" />
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="rounded-2xl border border-red-400/20 bg-red-400/5 p-6 text-center">
            <p className="text-sm text-red-400">{t("errorLoading")}</p>
          </div>
        )}

        {/* Projects grid */}
        {projects && projects.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                clipCount={0}
                locale={locale}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {projects && projects.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.06] py-20">
            <svg className="mb-4 h-12 w-12 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm text-slate-500">{t("noProjects")}</p>
            <p className="mt-1 text-xs text-slate-600">{t("createFirstProject")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
