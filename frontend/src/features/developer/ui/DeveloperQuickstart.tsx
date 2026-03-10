"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type Language = "curl" | "javascript" | "python";

const SNIPPETS: Record<Language, string> = {
  curl: `curl -X POST \\
  https://api.ltx-video.com/v1/generate \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "A golden sunset over the ocean, cinematic",
    "width": 1280,
    "height": 720,
    "num_frames": 120,
    "frame_rate": 24
  }'`,

  javascript: `import axios from "axios";

const response = await axios.post(
  "https://api.ltx-video.com/v1/generate",
  {
    prompt: "A golden sunset over the ocean, cinematic",
    width: 1280,
    height: 720,
    num_frames: 120,
    frame_rate: 24,
  },
  {
    headers: {
      Authorization: "Bearer YOUR_API_KEY",
      "Content-Type": "application/json",
    },
  }
);

console.log(response.data);`,

  python: `import requests

response = requests.post(
    "https://api.ltx-video.com/v1/generate",
    headers={
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json",
    },
    json={
        "prompt": "A golden sunset over the ocean, cinematic",
        "width": 1280,
        "height": 720,
        "num_frames": 120,
        "frame_rate": 24,
    },
)

print(response.json())`,
};

export function DeveloperQuickstart() {
  const t = useTranslations("Developer");
  const [lang, setLang] = useState<Language>("curl");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SNIPPETS[lang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs: { key: Language; label: string }[] = [
    { key: "curl", label: "cURL" },
    { key: "javascript", label: "JavaScript" },
    { key: "python", label: "Python" },
  ];

  return (
    <div className="glass-card space-y-5 p-6">
      <h2 className="text-lg font-semibold text-white">{t("quickstart")}</h2>
      <p className="text-sm text-slate-400">{t("quickstartDesc")}</p>

      {/* Language tabs */}
      <div className="flex gap-1 rounded-lg bg-white/[0.04] p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setLang(tab.key)}
            className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
              lang === tab.key
                ? "bg-[#eab308]/20 text-[#eab308]"
                : "text-slate-500 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Code block */}
      <div className="relative">
        <pre className="overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-sm leading-relaxed text-slate-300">
          <code>{SNIPPETS[lang]}</code>
        </pre>

        <button
          onClick={handleCopy}
          className="absolute right-3 top-3 rounded-lg bg-white/[0.08] px-3 py-1.5 text-xs text-slate-400 transition-colors hover:bg-white/[0.12] hover:text-white cursor-pointer"
        >
          {copied ? t("copied") : t("copy")}
        </button>
      </div>
    </div>
  );
}
