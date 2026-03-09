"use client";

import { useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Layout } from "lucide-react";
import { useTranslations } from "next-intl";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export const Footer = () => {
  const footerRef = useRef<HTMLElement>(null);
  const t = useTranslations("Footer");

  const COLUMNS = [
    {
      title: t("platform"),
      links: [
        { label: t("features"), href: "#features" },
        { label: t("pricing"), href: "#pricing" },
      ],
    },
    {
      title: t("company"),
      links: [
        { label: t("privacy"), href: "#" },
        { label: t("terms"), href: "#" },
      ],
    },
    {
      title: t("social"),
      links: [
        { label: t("twitter"), href: "https://twitter.com/ltxvideo" },
        { label: t("linkedin"), href: "https://linkedin.com/company/ltx-video" },
      ],
    },
  ];

  // Magnetic effect for social icons
  const handleIconEnter = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1.3,
      y: -3,
      duration: 0.3,
      ease: "power3.out",
    });
  }, []);

  const handleIconLeave = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1,
      y: 0,
      duration: 0.4,
      ease: "elastic.out(1, 0.5)",
    });
  }, []);

  useGSAP(() => {
    // Staggered reveal for columns
    const tl = gsap.timeline({
      scrollTrigger: { trigger: footerRef.current, start: "top 90%" },
    });

    tl.fromTo(".footer-brand", {
      y: 30,
      opacity: 0,
    }, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: "power3.out",
    })
      .fromTo(".footer-col", {
        y: 30,
        opacity: 0,
      }, {
        y: 0,
        opacity: 1,
        stagger: 0.1,
        duration: 0.7,
        ease: "power3.out",
      }, "-=0.4")
      .fromTo(".footer-link-item", {
        x: -15,
        opacity: 0,
      }, {
        x: 0,
        opacity: 1,
        stagger: 0.05,
        duration: 0.5,
        ease: "power2.out",
      }, "-=0.3")
      .fromTo(".footer-bottom", {
        y: 15,
        opacity: 0,
      }, {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: "power3.out",
      }, "-=0.2")
      .fromTo(".footer-social-icon", {
        scale: 0,
        opacity: 0,
        rotation: -180,
      }, {
        scale: 1,
        opacity: 1,
        rotation: 0,
        stagger: 0.1,
        duration: 0.5,
        ease: "back.out(2)",
      }, "-=0.3");

    // Separator line expand animation
    gsap.fromTo(".footer-separator", {
      scaleX: 0,
      transformOrigin: "left center",
    }, {
      scrollTrigger: { trigger: footerRef.current, start: "top 90%" },
      scaleX: 1,
      duration: 1.2,
      delay: 0.5,
      ease: "power3.out",
    });

    // Logo icon subtle rotation loop
    gsap.to(".footer-logo-icon", {
      rotateY: 360,
      duration: 8,
      repeat: -1,
      ease: "none",
    });
  }, { scope: footerRef });

  return (
    <footer ref={footerRef} className="border-t border-white/[0.04] bg-[#050505] relative overflow-hidden" role="contentinfo">
      {/* Subtle background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#eab308]/[0.015] blur-[150px] pointer-events-none" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Upper section */}
        <div className="py-10 sm:py-12 lg:py-16 flex flex-col lg:flex-row justify-between gap-8 sm:gap-10 lg:gap-12">
          {/* Brand column */}
          <div className="footer-brand flex flex-col gap-4 sm:gap-5 max-w-sm">
            <div className="flex items-center space-x-3">
              <div className="footer-logo-icon w-9 h-9 bg-gradient-to-br from-[#eab308] to-[#ca8a04] rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.15)]" style={{ transformStyle: "preserve-3d" }}>
                <Layout className="text-black w-5 h-5" />
              </div>
              <span className="font-black tracking-tight text-lg text-white uppercase">
                LTX-<span className="text-[#eab308]">VIDEO</span>
              </span>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed font-medium">
              {t("tagline")}
            </p>
          </div>

          {/* Link columns */}
          <nav className="grid grid-cols-3 gap-6 sm:flex sm:gap-12 md:gap-16 lg:gap-24" aria-label="Footer navigation">
            {COLUMNS.map((col) => (
              <div key={col.title} className="footer-col flex flex-col gap-3 sm:gap-4">
                <span className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] sm:tracking-[0.25em]">
                  {col.title}
                </span>
                <div className="flex flex-col gap-2.5 sm:gap-3 text-[11px] sm:text-[12px] text-slate-600 font-medium">
                  {col.links.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      className="footer-link-item footer-link hover:text-white transition-colors duration-300"
                      {...(link.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="footer-separator h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="footer-bottom py-5 sm:py-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <p className="text-[9px] sm:text-[10px] text-slate-700 font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-center sm:text-left">
            &copy; {new Date().getFullYear()} LTX AI VISUALS. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-5">
            <a
              href="https://twitter.com/ltxvideo"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="footer-social-icon text-slate-700 hover:text-[#eab308] transition-colors duration-300"
              onMouseEnter={handleIconEnter}
              onMouseLeave={handleIconLeave}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://linkedin.com/company/ltx-video"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="footer-social-icon text-slate-700 hover:text-[#eab308] transition-colors duration-300"
              onMouseEnter={handleIconEnter}
              onMouseLeave={handleIconLeave}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
