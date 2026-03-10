"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useToast, type Toast, type ToastType } from "./ToastContext";

const ICONS: Record<ToastType, ReactNode> = {
  success: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const TYPE_STYLES: Record<ToastType, { icon: string; bar: string; border: string; bg: string }> = {
  success: {
    icon: "text-emerald-400",
    bar: "bg-emerald-400",
    border: "border-emerald-500/20",
    bg: "bg-emerald-500/10",
  },
  error: {
    icon: "text-red-400",
    bar: "bg-red-400",
    border: "border-red-500/20",
    bg: "bg-red-500/10",
  },
  warning: {
    icon: "text-amber-400",
    bar: "bg-amber-400",
    border: "border-amber-500/20",
    bg: "bg-amber-500/10",
  },
  info: {
    icon: "text-sky-400",
    bar: "bg-sky-400",
    border: "border-sky-500/20",
    bg: "bg-sky-500/10",
  },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const styles = TYPE_STYLES[toast.type];
  const duration = toast.duration ?? 5000;

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
    if (duration > 0) {
      const leaveTimer = setTimeout(() => setIsLeaving(true), duration - 400);
      return () => clearTimeout(leaveTimer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(onRemove, 350);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl border backdrop-blur-xl shadow-2xl shadow-black/30 transition-all duration-350 ease-out ${styles.border} ${styles.bg} bg-[#0c0c0c]/90 ${
        isVisible && !isLeaving
          ? "translate-x-0 opacity-100"
          : "translate-x-[120%] opacity-0"
      }`}
      style={{ minWidth: 320, maxWidth: 420 }}
    >
      <div className="flex items-start gap-3 px-4 py-3.5">
        <div className={`mt-0.5 shrink-0 ${styles.icon}`}>
          {ICONS[toast.type]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white leading-snug">
            {toast.message}
          </p>
          {toast.description && (
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              {toast.description}
            </p>
          )}
        </div>
        <button
          onClick={handleClose}
          className="shrink-0 mt-0.5 text-slate-500 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {duration > 0 && (
        <div className="h-[2px] w-full bg-white/[0.03]">
          <div
            className={`h-full ${styles.bar} opacity-60`}
            style={{
              animation: `toast-progress ${duration}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  );
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <>
      <style jsx global>{`
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
      <div
        aria-live="polite"
        className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none"
      >
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onRemove={() => removeToast(toast.id)} />
          </div>
        ))}
      </div>
    </>
  );
}
