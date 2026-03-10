"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import type { Project } from "@/entities/video-job/model/types";

interface ProjectCardProps {
  project: Project;
  clipCount: number;
  locale: string;
}

export function ProjectCard({ project, clipCount, locale }: ProjectCardProps) {
  const t = useTranslations("Timeline");

  const formattedDate = new Date(project.updated_at).toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Link
      href={`/${locale}/projects/${project.id}`}
      className="group block rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all hover:border-[#eab308]/20 hover:bg-white/[0.04]"
    >
      {/* Thumbnail */}
      <div className="mb-3 aspect-video overflow-hidden rounded-xl bg-black/40">
        {project.thumbnail_url ? (
          <img
            src={project.thumbnail_url}
            alt={project.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg className="h-8 w-8 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div>
        <h3 className="mb-1 truncate text-sm font-medium text-white group-hover:text-[#eab308] transition-colors">
          {project.name}
        </h3>

        {project.description && (
          <p className="mb-2 line-clamp-2 text-xs text-slate-500">{project.description}</p>
        )}

        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>
            {clipCount} {t("clips", { count: clipCount })}
          </span>
          <span>{formattedDate}</span>
        </div>
      </div>
    </Link>
  );
}
