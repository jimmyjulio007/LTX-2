"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";

interface ScriptUploaderProps {
  onScriptChange: (script: string) => void;
  value?: string;
  isLoading?: boolean;
}

export function ScriptUploader({ onScriptChange, value = "", isLoading }: ScriptUploaderProps) {
  const t = useTranslations("ScriptStudio");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onScriptChange(e.target.value);
    },
    [onScriptChange],
  );

  const handleFileRead = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text === "string") {
          onScriptChange(text);
        }
      };
      reader.readAsText(file);
    },
    [onScriptChange],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileRead(file);
    },
    [handleFileRead],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFileRead(file);
    },
    [handleFileRead],
  );

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">{t("title")}</h3>
        <span className="text-[11px] tabular-nums text-slate-500">
          {t("wordCount", { count: wordCount })}
        </span>
      </div>

      {/* Textarea */}
      <div
        className={`relative rounded-xl border transition-colors ${
          isDragOver
            ? "border-[#eab308]/40 bg-[#eab308]/5"
            : "border-white/[0.06] bg-black/30"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <textarea
          value={value}
          onChange={handleTextChange}
          placeholder={t("placeholder")}
          disabled={isLoading}
          rows={12}
          className="block w-full resize-y rounded-xl bg-transparent px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-[#eab308]/30 disabled:opacity-50"
        />

        {/* Drag overlay */}
        {isDragOver && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-[#eab308]/5">
            <div className="flex flex-col items-center gap-2">
              <svg className="h-8 w-8 text-[#eab308]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <span className="text-xs text-[#eab308]">{t("dropFile")}</span>
            </div>
          </div>
        )}
      </div>

      {/* File upload button */}
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs text-slate-400 transition-colors hover:border-white/[0.12] hover:text-white disabled:opacity-50"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          {t("uploadFile")}
        </button>

        <span className="text-[10px] text-slate-600">{t("supportedFormats")}</span>

        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.fountain,.fdx"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>
    </div>
  );
}
