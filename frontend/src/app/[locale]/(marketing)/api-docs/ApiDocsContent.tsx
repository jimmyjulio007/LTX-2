"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/shared/lib/utils";
import { Footer } from "@/widgets/footer/ui/Footer";

function CodeBlock({ code, lang = "json" }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group rounded-xl overflow-hidden border border-white/[0.06] bg-[#0a0a0a]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.04] bg-white/[0.02]">
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-600">{lang}</span>
        <button
          onClick={handleCopy}
          className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 hover:text-[#eab308] transition-colors cursor-pointer"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-[13px] leading-relaxed text-slate-300 font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    POST: "bg-sky-500/15 text-sky-400 border-sky-500/20",
    PATCH: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    DELETE: "bg-red-500/15 text-red-400 border-red-500/20",
    WS: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  };
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-black tracking-wider border ${colors[method] || colors.GET}`}>
      {method}
    </span>
  );
}

function EndpointCard({
  method,
  path,
  description,
  auth,
  children,
}: {
  method: string;
  path: string;
  description: string;
  auth?: boolean;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("ApiDocs");
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/[0.02] transition-colors cursor-pointer"
      >
        <MethodBadge method={method} />
        <code className="text-[15px] font-mono font-semibold text-white flex-1">{path}</code>
        {auth && (
          <span className="hidden sm:inline text-[9px] font-bold uppercase tracking-[0.2em] text-amber-400/70 border border-amber-400/20 rounded-md px-2 py-0.5">
            {t("authRequired")}
          </span>
        )}
        <svg
          className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={`transition-all duration-200 ${open ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"} overflow-hidden`}>
        <div className="px-5 pb-5 pt-1 space-y-4 border-t border-white/[0.04]">
          <p className="text-[15px] text-slate-400">{description}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-2xl font-black text-white mt-14 mb-5 scroll-mt-24 flex items-center gap-3">
      <span className="w-1 h-6 rounded-full bg-[#eab308]" />
      {children}
    </h2>
  );
}

export default function ApiDocsContent() {
  const t = useTranslations("ApiDocs");
  const [activeSection, setActiveSection] = useState("overview");
  const sectionRefs = useRef<Map<string, IntersectionObserverEntry>>(new Map());

  const NAV = [
    { id: "overview", label: t("nav.overview") },
    { id: "auth", label: t("nav.auth") },
    { id: "prompts", label: t("nav.prompts") },
    { id: "video", label: t("nav.video") },
    { id: "upload", label: t("nav.upload") },
    { id: "websocket", label: t("nav.websocket") },
    { id: "webhook", label: t("nav.webhook") },
    { id: "promptAI", label: t("nav.promptAI") },
    { id: "gallery", label: t("nav.gallery") },
    { id: "folders", label: t("nav.folders") },
    { id: "referrals", label: t("nav.referrals") },
    { id: "notifications", label: t("nav.notifications") },
    { id: "admin", label: t("nav.admin") },
    { id: "errors", label: t("nav.errors") },
    { id: "sdk", label: t("nav.sdk") },
  ];

  // Scroll-spy: track which section is in view
  useEffect(() => {
    const ids = NAV.map((n) => n.id);
    const elements = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          sectionRefs.current.set(entry.target.id, entry);
        });

        // Find the topmost visible section
        const visible = ids.filter((id) => {
          const entry = sectionRefs.current.get(id);
          return entry?.isIntersecting;
        });

        if (visible.length > 0) {
          setActiveSection(visible[0]);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="max-w-6xl mx-auto px-6 py-16 sm:py-24">
        <header className="mb-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#eab308] mb-4">
            {t("badge")}
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4">
            {t("title")}
          </h1>
          <p className="text-slate-500 text-[15px] max-w-xl">
            {t("subtitle")}
          </p>
          <div className="mt-6 flex items-center gap-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-600">Base URL</span>
            <code className="text-[15px] font-mono text-[#eab308] bg-[#eab308]/[0.06] px-3 py-1.5 rounded-lg border border-[#eab308]/15">
              https://api.ltx-video.com
            </code>
          </div>
        </header>

        <div className="flex gap-12">
          {/* Sidebar nav */}
          <nav className="hidden lg:block w-48 shrink-0 sticky top-24 self-start">
            <ul className="space-y-1">
              {NAV.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className={cn(
                      "block text-[13px] font-semibold py-1.5 px-3 rounded-lg transition-all duration-200",
                      activeSection === item.id
                        ? "text-[#eab308] bg-[#eab308]/[0.06] border-l-2 border-[#eab308]"
                        : "text-slate-500 hover:text-white hover:bg-white/[0.03]"
                    )}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Overview */}
            <SectionTitle id="overview">{t("nav.overview")}</SectionTitle>
            <p className="text-[15px] text-slate-400 leading-relaxed mb-4">
              {t("overview.description")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-600 mb-1">{t("overview.format")}</p>
                <p className="text-[15px] font-semibold text-white">JSON</p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-600 mb-1">{t("overview.rateLimit")}</p>
                <p className="text-[15px] font-semibold text-white">100 req/min</p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-600 mb-1">{t("overview.version")}</p>
                <p className="text-[15px] font-semibold text-white">v1.0</p>
              </div>
            </div>

            {/* Authentication */}
            <SectionTitle id="auth">{t("nav.auth")}</SectionTitle>
            <p className="text-[15px] text-slate-400 leading-relaxed mb-4">
              {t("auth.description")}
            </p>
            <CodeBlock lang="bash" code={`# Cookie-based (automatic after login)
curl -X POST https://api.ltx-video.com/jobs/text-to-video \\
  -H "Content-Type: application/json" \\
  -b "better-auth.session_token=YOUR_SESSION_TOKEN" \\
  -d '{"prompt": "A cinematic sunset over mountains"}'

# Bearer token
curl -X POST https://api.ltx-video.com/jobs/text-to-video \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \\
  -d '{"prompt": "A cinematic sunset over mountains"}'`} />

            {/* Prompt Guide */}
            <SectionTitle id="prompts">{t("nav.prompts")}</SectionTitle>
            <p className="text-[15px] text-slate-400 leading-relaxed mb-6">
              {t("prompts.description")}
            </p>

            <div className="space-y-6 mb-6">
              {/* Structure */}
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                <h3 className="text-[15px] font-bold text-white mb-2">{t("prompts.structureTitle")}</h3>
                <p className="text-[15px] text-slate-400 leading-relaxed mb-3">{t("prompts.structureDesc")}</p>
                <CodeBlock lang="text" code={`[Camera movement] + [Subject] + [Action] + [Environment] + [Lighting/Mood]

Example:
"Slow dolly forward through a misty redwood forest at dawn,
 golden light filtering through ancient trees,
 volumetric fog, cinematic depth of field"`} />
              </div>

              {/* Good examples */}
              <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/[0.02] p-5">
                <h3 className="text-[15px] font-bold text-emerald-400 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {t("prompts.goodTitle")}
                </h3>
                <ul className="space-y-3">
                  <li className="text-[15px] text-slate-400">
                    <code className="text-emerald-300/80 text-sm bg-emerald-500/[0.06] px-2 py-1 rounded-md">
                      {t("prompts.good1")}
                    </code>
                  </li>
                  <li className="text-[15px] text-slate-400">
                    <code className="text-emerald-300/80 text-sm bg-emerald-500/[0.06] px-2 py-1 rounded-md">
                      {t("prompts.good2")}
                    </code>
                  </li>
                  <li className="text-[15px] text-slate-400">
                    <code className="text-emerald-300/80 text-sm bg-emerald-500/[0.06] px-2 py-1 rounded-md">
                      {t("prompts.good3")}
                    </code>
                  </li>
                </ul>
              </div>

              {/* Bad examples */}
              <div className="rounded-xl border border-red-500/10 bg-red-500/[0.02] p-5">
                <h3 className="text-[15px] font-bold text-red-400 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {t("prompts.badTitle")}
                </h3>
                <ul className="space-y-3">
                  <li className="text-[15px] text-slate-400">
                    <code className="text-red-300/80 text-sm bg-red-500/[0.06] px-2 py-1 rounded-md">
                      {t("prompts.bad1")}
                    </code>
                    <span className="text-slate-600 text-sm ml-2">— {t("prompts.bad1Reason")}</span>
                  </li>
                  <li className="text-[15px] text-slate-400">
                    <code className="text-red-300/80 text-sm bg-red-500/[0.06] px-2 py-1 rounded-md">
                      {t("prompts.bad2")}
                    </code>
                    <span className="text-slate-600 text-sm ml-2">— {t("prompts.bad2Reason")}</span>
                  </li>
                </ul>
              </div>

              {/* Negative prompts */}
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                <h3 className="text-[15px] font-bold text-white mb-2">{t("prompts.negativeTitle")}</h3>
                <p className="text-[15px] text-slate-400 leading-relaxed mb-3">{t("prompts.negativeDesc")}</p>
                <CodeBlock lang="json" code={`{
  "prompt": "Cinematic aerial shot of a coastal city at golden hour",
  "negative_prompt": "low quality, blurry, distorted, watermark, text overlay, shaky camera"
}`} />
              </div>

              {/* Parameters tips */}
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                <h3 className="text-[15px] font-bold text-white mb-3">{t("prompts.paramsTitle")}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="text-sm">
                    <span className="font-mono text-[#eab308] text-sm">width / height</span>
                    <p className="text-slate-500 text-sm mt-1">{t("prompts.paramResolution")}</p>
                  </div>
                  <div className="text-sm">
                    <span className="font-mono text-[#eab308] text-sm">num_frames</span>
                    <p className="text-slate-500 text-sm mt-1">{t("prompts.paramFrames")}</p>
                  </div>
                  <div className="text-sm">
                    <span className="font-mono text-[#eab308] text-sm">frame_rate</span>
                    <p className="text-slate-500 text-sm mt-1">{t("prompts.paramFps")}</p>
                  </div>
                  <div className="text-sm">
                    <span className="font-mono text-[#eab308] text-sm">negative_prompt</span>
                    <p className="text-slate-500 text-sm mt-1">{t("prompts.paramNegative")}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Generation */}
            <SectionTitle id="video">{t("nav.video")}</SectionTitle>
            <p className="text-[15px] text-slate-400 leading-relaxed mb-6">
              {t("video.description")}
            </p>

            <div className="space-y-4">
              {/* Text to Video */}
              <EndpointCard method="POST" path="/jobs/text-to-video" description={t("video.textToVideo")} auth>
                <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">{t("requestBody")}</p>
                <CodeBlock code={`{
  "prompt": "A cinematic drone shot flying over a foggy forest at sunrise",
  "negative_prompt": "low quality, blurry, distorted",
  "width": 1280,
  "height": 768,
  "num_frames": 121,
  "frame_rate": 24.0
}`} />
                <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">{t("response")}</p>
                <CodeBlock code={`{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "job_type": "text-to-video",
  "status": "PENDING",
  "progress": 0,
  "video_url": null,
  "runpod_job_id": "rp_abc123",
  "user_id": "user_xyz"
}`} />
              </EndpointCard>

              {/* Image to Video */}
              <EndpointCard method="POST" path="/jobs/image-to-video" description={t("video.imageToVideo")} auth>
                <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">{t("requestBody")}</p>
                <CodeBlock code={`{
  "prompt": "Camera slowly zooms into the scene, birds flying",
  "image_uri": "https://storage.example.com/input.jpg",
  "width": 1280,
  "height": 768,
  "num_frames": 121,
  "frame_rate": 24.0
}`} />
              </EndpointCard>

              {/* Audio to Video */}
              <EndpointCard method="POST" path="/jobs/audio-to-video" description={t("video.audioToVideo")} auth>
                <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">{t("requestBody")}</p>
                <CodeBlock code={`{
  "prompt": "Abstract visual journey synced to the music",
  "audio_uri": "https://storage.example.com/track.mp3",
  "width": 1280,
  "height": 768,
  "num_frames": 121,
  "frame_rate": 24.0
}`} />
              </EndpointCard>

              {/* Retake */}
              <EndpointCard method="POST" path="/jobs/retake" description={t("video.retake")} auth>
                <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">{t("requestBody")}</p>
                <CodeBlock code={`{
  "prompt": "Replace this section with an explosion effect",
  "video_uri": "https://storage.example.com/original.mp4",
  "start_time": 2.5,
  "end_time": 5.0,
  "width": 1280,
  "height": 768
}`} />
              </EndpointCard>

              {/* Extend */}
              <EndpointCard method="POST" path="/jobs/extend" description={t("video.extend")} auth>
                <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">{t("requestBody")}</p>
                <CodeBlock code={`{
  "prompt": "Continue the scene with a dramatic camera pan",
  "video_uri": "https://storage.example.com/original.mp4",
  "additional_frames": 48,
  "width": 1280,
  "height": 768
}`} />
              </EndpointCard>

              {/* Health */}
              <EndpointCard method="GET" path="/health" description={t("video.health")}>
                <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">{t("response")}</p>
                <CodeBlock code={`{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2026-03-10T12:00:00Z"
}`} />
              </EndpointCard>

              {/* Get user */}
              <EndpointCard method="GET" path="/users/me" description={t("video.userMe")} auth>
                <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">{t("response")}</p>
                <CodeBlock code={`{
  "id": "user_xyz",
  "email": "creator@example.com",
  "credits": 42,
  "role": "USER"
}`} />
              </EndpointCard>
            </div>

            {/* Upload */}
            <SectionTitle id="upload">{t("nav.upload")}</SectionTitle>
            <p className="text-[15px] text-slate-400 leading-relaxed mb-4">
              {t("upload.description")}
            </p>
            <EndpointCard method="POST" path="/v1/upload" description={t("upload.endpoint")} auth>
              <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">{t("requestBody")}</p>
              <CodeBlock lang="bash" code={`curl -X POST https://api.ltx-video.com/v1/upload \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -F "file=@./my-image.jpg"

# Max file size: 50MB
# Accepted: images, videos, audio files`} />
              <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">{t("response")}</p>
              <CodeBlock code={`{
  "storage_uri": "ltx://uploads/a1b2c3d4/my-image.jpg",
  "filename": "my-image.jpg"
}`} />
            </EndpointCard>

            {/* WebSocket */}
            <SectionTitle id="websocket">{t("nav.websocket")}</SectionTitle>
            <p className="text-[15px] text-slate-400 leading-relaxed mb-4">
              {t("websocket.description")}
            </p>
            <EndpointCard method="WS" path="/ws/progress/{job_id}?token=SESSION_TOKEN" description={t("websocket.endpoint")}>
              <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">{t("websocket.example")}</p>
              <CodeBlock lang="javascript" code={`const ws = new WebSocket(
  "wss://api.ltx-video.com/ws/progress/JOB_ID?token=SESSION_TOKEN"
);

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data);
  // { "status": "PROCESSING", "progress": 45 }
  // { "status": "COMPLETED", "progress": 100, "video_url": "https://..." }
};

ws.onerror = (error) => {
  console.error("WebSocket error:", error);
};

// Error codes:
// 4001 - Authentication failed
// 4003 - Not authorized for this job`} />
            </EndpointCard>

            {/* Webhook */}
            <SectionTitle id="webhook">{t("nav.webhook")}</SectionTitle>
            <p className="text-[15px] text-slate-400 leading-relaxed mb-4">
              {t("webhook.description")}
            </p>
            <EndpointCard method="POST" path="/webhook/runpod?token=WEBHOOK_SECRET" description={t("webhook.endpoint")}>
              <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">{t("webhook.payload")}</p>
              <CodeBlock code={`{
  "id": "rp_abc123",
  "status": "COMPLETED",
  "output": {
    "video_url": "https://storage.example.com/output.mp4"
  }
}`} />
            </EndpointCard>

            {/* Prompt Intelligence */}
            <SectionTitle id="promptAI">{t("nav.promptAI")}</SectionTitle>
            <p className="text-[15px] text-slate-400 leading-relaxed mb-6">
              {t("promptAI.description")}
            </p>

            <div className="space-y-4">
              <EndpointCard method="POST" path="/prompts/enhance" description={t("promptAI.enhance")} auth>
                <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">{t("requestBody")}</p>
                <CodeBlock code={`{
  "prompt": "A sunset over mountains",
  "style": "cinematic"
}`} />
                <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">{t("response")}</p>
                <CodeBlock code={`{
  "original": "A sunset over mountains",
  "enhanced": "Sweeping aerial drone shot of jagged mountain peaks at golden hour, warm amber light casting long shadows across snow-capped ridges, volumetric clouds drifting through valleys, cinematic depth of field, anamorphic lens flares",
  "style": "cinematic"
}`} />
              </EndpointCard>

              <EndpointCard method="GET" path="/prompts/templates" description={t("promptAI.templates")} auth>
                <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">{t("response")}</p>
                <CodeBlock code={`[
  {
    "id": "tpl_001",
    "name": "Epic Landscape",
    "category": "cinematic",
    "prompt_text": "Sweeping aerial shot of [SUBJECT] at golden hour...",
    "thumbnail_url": "https://storage.example.com/thumbs/epic.jpg"
  }
]`} />
              </EndpointCard>

              <EndpointCard method="GET" path="/prompts/templates/{template_id}" description={t("promptAI.templateById")} auth>
                <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">{t("response")}</p>
                <CodeBlock code={`{
  "id": "tpl_001",
  "name": "Epic Landscape",
  "name_fr": "Paysage Épique",
  "category": "cinematic",
  "prompt_text": "Sweeping aerial shot of [SUBJECT] at golden hour...",
  "thumbnail_url": "https://storage.example.com/thumbs/epic.jpg",
  "sort_order": 1
}`} />
              </EndpointCard>
            </div>

            {/* Gallery */}
            <SectionTitle id="gallery">{t("nav.gallery")}</SectionTitle>
            <p className="text-[15px] text-slate-400 leading-relaxed mb-6">
              {t("galleryApi.description")}
            </p>

            <div className="space-y-4">
              <EndpointCard method="GET" path="/gallery/public" description={t("galleryApi.publicFeed")}>
                <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">{t("response")}</p>
                <CodeBlock code={`{
  "items": [
    {
      "id": "job_abc",
      "title": "Mountain Sunset",
      "share_id": "xK9mZ2",
      "video_url": "https://storage.example.com/output.mp4",
      "thumbnail_url": "https://storage.example.com/thumb.jpg",
      "likes_count": 42,
      "views_count": 1280,
      "prompt": "Aerial shot of mountains at golden hour..."
    }
  ],
  "total": 156,
  "page": 1,
  "per_page": 20
}`} />
              </EndpointCard>

              <EndpointCard method="GET" path="/gallery/public/{share_id}" description={t("galleryApi.sharePage")}>
                <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">{t("response")}</p>
                <CodeBlock code={`{
  "id": "job_abc",
  "title": "Mountain Sunset",
  "share_id": "xK9mZ2",
  "video_url": "https://storage.example.com/output.mp4",
  "prompt": "Aerial shot of mountains at golden hour...",
  "likes_count": 42,
  "views_count": 1281,
  "user": { "name": "Creator" }
}`} />
              </EndpointCard>

              <EndpointCard method="POST" path="/gallery/{job_id}/like" description={t("galleryApi.like")} auth>
                <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">{t("response")}</p>
                <CodeBlock code={`{
  "liked": true,
  "likes_count": 43
}`} />
              </EndpointCard>

              <EndpointCard method="PATCH" path="/gallery/{job_id}/visibility" description={t("galleryApi.visibility")} auth>
                <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">{t("requestBody")}</p>
                <CodeBlock code={`{
  "visibility": "PUBLIC"
}`} />
              </EndpointCard>

              <EndpointCard method="POST" path="/gallery/{job_id}/remix" description={t("galleryApi.remix")} auth>
                <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">{t("response")}</p>
                <CodeBlock code={`{
  "prompt": "Aerial shot of mountains at golden hour...",
  "negative_prompt": "low quality, blurry"
}`} />
              </EndpointCard>
            </div>

            {/* Folders */}
            <SectionTitle id="folders">{t("nav.folders")}</SectionTitle>
            <p className="text-[15px] text-slate-400 leading-relaxed mb-6">
              {t("foldersApi.description")}
            </p>

            <div className="space-y-4">
              <EndpointCard method="POST" path="/folders/" description={t("foldersApi.create")} auth>
                <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">{t("requestBody")}</p>
                <CodeBlock code={`{
  "name": "My Collection"
}`} />
              </EndpointCard>

              <EndpointCard method="GET" path="/folders/" description={t("foldersApi.list")} auth>
                <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">{t("response")}</p>
                <CodeBlock code={`[
  {
    "id": "folder_001",
    "name": "My Collection",
    "parent_id": null,
    "sort_order": 0,
    "created_at": "2026-03-10T12:00:00Z"
  }
]`} />
              </EndpointCard>

              <EndpointCard method="PATCH" path="/folders/{folder_id}" description={t("foldersApi.rename")} auth>
                <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">{t("requestBody")}</p>
                <CodeBlock code={`{
  "name": "Renamed Collection"
}`} />
              </EndpointCard>

              <EndpointCard method="DELETE" path="/folders/{folder_id}" description={t("foldersApi.delete")} auth>
                <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">{t("response")}</p>
                <CodeBlock code={`{
  "message": "Folder deleted. Videos moved to root."
}`} />
              </EndpointCard>

              <EndpointCard method="POST" path="/folders/{folder_id}/move" description={t("foldersApi.move")} auth>
                <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">{t("requestBody")}</p>
                <CodeBlock code={`{
  "job_ids": ["job_abc", "job_def"]
}`} />
              </EndpointCard>
            </div>

            {/* Referrals */}
            <SectionTitle id="referrals">{t("nav.referrals")}</SectionTitle>
            <p className="text-[15px] text-slate-400 leading-relaxed mb-6">
              {t("referralsApi.description")}
            </p>

            <div className="space-y-4">
              <EndpointCard method="GET" path="/referrals/my-code" description={t("referralsApi.myCode")} auth>
                <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">{t("response")}</p>
                <CodeBlock code={`{
  "referral_code": "LTX8K2M9"
}`} />
              </EndpointCard>

              <EndpointCard method="GET" path="/referrals/stats" description={t("referralsApi.stats")} auth>
                <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">{t("response")}</p>
                <CodeBlock code={`{
  "referral_code": "LTX8K2M9",
  "total_referrals": 12,
  "completed_referrals": 8,
  "total_credits_earned": 40,
  "max_referrals": 20
}`} />
              </EndpointCard>

              <EndpointCard method="POST" path="/referrals/validate/{code}" description={t("referralsApi.validate")}>
                <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">{t("response")}</p>
                <CodeBlock code={`{
  "valid": true,
  "referrer_name": "John D."
}`} />
              </EndpointCard>
            </div>

            {/* Notifications */}
            <SectionTitle id="notifications">{t("nav.notifications")}</SectionTitle>
            <p className="text-[15px] text-slate-400 leading-relaxed mb-6">
              {t("notificationsApi.description")}
            </p>

            <div className="space-y-4">
              <EndpointCard method="GET" path="/notifications/preferences" description={t("notificationsApi.get")} auth>
                <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">{t("response")}</p>
                <CodeBlock code={`{
  "email_on_completion": true,
  "email_on_failure": true,
  "email_marketing": false
}`} />
              </EndpointCard>

              <EndpointCard method="PATCH" path="/notifications/preferences" description={t("notificationsApi.update")} auth>
                <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">{t("requestBody")}</p>
                <CodeBlock code={`{
  "email_on_completion": true,
  "email_marketing": false
}`} />
              </EndpointCard>
            </div>

            {/* Admin */}
            <SectionTitle id="admin">{t("nav.admin")}</SectionTitle>
            <p className="text-[15px] text-slate-400 leading-relaxed mb-6">
              {t("adminApi.description")}
            </p>

            <div className="space-y-4">
              <EndpointCard method="GET" path="/admin/moderation/queue" description={t("adminApi.queue")} auth>
                <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">{t("response")}</p>
                <CodeBlock code={`[
  {
    "id": "job_xyz",
    "prompt": "...",
    "moderation_status": "FLAGGED",
    "moderation_notes": "Potential policy violation detected",
    "created_at": "2026-03-10T12:00:00Z",
    "user": { "email": "user@example.com" }
  }
]`} />
              </EndpointCard>

              <EndpointCard method="POST" path="/admin/moderation/{job_id}" description={t("adminApi.review")} auth>
                <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">{t("requestBody")}</p>
                <CodeBlock code={`{
  "action": "approve",
  "notes": "Content is acceptable"
}`} />
              </EndpointCard>
            </div>

            {/* Errors */}
            <SectionTitle id="errors">{t("nav.errors")}</SectionTitle>
            <p className="text-[15px] text-slate-400 leading-relaxed mb-4">
              {t("errors.description")}
            </p>
            <div className="rounded-xl border border-white/[0.06] overflow-hidden">
              <table className="w-full text-[15px]">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                    <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">{t("errors.code")}</th>
                    <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">{t("errors.meaning")}</th>
                  </tr>
                </thead>
                <tbody className="text-slate-400">
                  <tr className="border-b border-white/[0.03]">
                    <td className="px-5 py-3 font-mono font-semibold text-white">400</td>
                    <td className="px-5 py-3">{t("errors.400")}</td>
                  </tr>
                  <tr className="border-b border-white/[0.03]">
                    <td className="px-5 py-3 font-mono font-semibold text-white">401</td>
                    <td className="px-5 py-3">{t("errors.401")}</td>
                  </tr>
                  <tr className="border-b border-white/[0.03]">
                    <td className="px-5 py-3 font-mono font-semibold text-white">402</td>
                    <td className="px-5 py-3">{t("errors.402")}</td>
                  </tr>
                  <tr className="border-b border-white/[0.03]">
                    <td className="px-5 py-3 font-mono font-semibold text-white">403</td>
                    <td className="px-5 py-3">{t("errors.403")}</td>
                  </tr>
                  <tr className="border-b border-white/[0.03]">
                    <td className="px-5 py-3 font-mono font-semibold text-white">404</td>
                    <td className="px-5 py-3">{t("errors.404")}</td>
                  </tr>
                  <tr className="border-b border-white/[0.03]">
                    <td className="px-5 py-3 font-mono font-semibold text-white">429</td>
                    <td className="px-5 py-3">{t("errors.429")}</td>
                  </tr>
                  <tr>
                    <td className="px-5 py-3 font-mono font-semibold text-white">500</td>
                    <td className="px-5 py-3">{t("errors.500")}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SDK example */}
            <SectionTitle id="sdk">{t("sdk.title")}</SectionTitle>
            <p className="text-[15px] text-slate-400 leading-relaxed mb-4">
              {t("sdk.description")}
            </p>
            <CodeBlock lang="typescript" code={`import axios from "axios";

const API_BASE = "https://api.ltx-video.com";
const TOKEN = "your_session_token";

const api = axios.create({
  baseURL: API_BASE,
  headers: { Authorization: \`Bearer \${TOKEN}\` },
});

// 1. Generate a video from text
const { data: job } = await api.post("/jobs/text-to-video", {
  prompt: "Aerial shot of waves crashing on a volcanic beach at golden hour",
  negative_prompt: "low quality, blurry",
  width: 1280,
  height: 768,
  num_frames: 121,
  frame_rate: 24.0,
});
console.log("Job created:", job.id, job.status);

// 2. Monitor progress via WebSocket
const ws = new WebSocket(
  \`wss://api.ltx-video.com/ws/progress/\${job.id}?token=\${TOKEN}\`
);

ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  console.log(\`Progress: \${update.progress}% — \${update.status}\`);

  if (update.status === "COMPLETED") {
    console.log("Video ready:", update.video_url);
    ws.close();
  }
};

// 3. Upload an image then animate it
const form = new FormData();
form.append("file", fs.readFileSync("./scene.jpg"), "scene.jpg");
const { data: upload } = await api.post("/v1/upload", form);

const { data: animJob } = await api.post("/jobs/image-to-video", {
  prompt: "Camera slowly pulls back revealing the full landscape",
  image_uri: upload.storage_uri,
});
console.log("Animation job:", animJob.id);`} />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
