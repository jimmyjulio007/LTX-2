"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useTranslations } from "next-intl";
import { ArrowRight, Sparkles } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Text scramble effect hook — uses DOM ref to avoid setState per interval tick
const useTextScramble = (text: string, trigger: boolean) => {
  const ref = useRef<HTMLSpanElement>(null);
  const chars = "!@#$%^&*()_+-=[]{}|;:,.<>?/~`";

  useEffect(() => {
    if (!ref.current) return;
    if (!trigger) {
      ref.current.textContent = text;
      return;
    }

    let iteration = 0;
    const interval = setInterval(() => {
      const result = text
        .split("")
        .map((char, i) => {
          if (i < iteration) return text[i];
          if (char === " ") return " ";
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join("");

      if (ref.current) ref.current.textContent = result;

      if (iteration >= text.length) {
        clearInterval(interval);
      }

      iteration += 1 / 2;
    }, 30);

    return () => clearInterval(interval);
  }, [text, trigger]);

  return ref;
};

export const Cta = () => {
  const ctaRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("CTA");
  const tCommon = useTranslations("Common");
  const [scrambleActive, setScrambleActive] = useState(false);

  const scrambleRef = useTextScramble(t("titleLine1"), scrambleActive);

  const handleBtnEnter = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();

    gsap.to(btn, {
      scale: 1.06,
      y: -3,
      duration: 0.3,
      ease: "power3.out",
    });

    const arrow = btn.querySelector(".cta-arrow");
    if (arrow) {
      gsap.to(arrow, { x: 6, rotation: -45, duration: 0.3, ease: "power3.out" });
    }

    const shine = btn.querySelector(".cta-btn-shine");
    if (shine) {
      gsap.fromTo(shine, { x: "-100%" }, { x: "100%", duration: 0.6, ease: "power2.out" });
    }

    // Ripple effect
    const ripple = btn.querySelector(".cta-btn-ripple") as HTMLElement;
    if (ripple) {
      const x = rect.width / 2;
      const y = rect.height / 2;
      gsap.fromTo(ripple, {
        left: x,
        top: y,
        scale: 0,
        opacity: 0.5,
      }, {
        scale: 4,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
      });
    }
  }, []);

  const handleBtnLeave = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    gsap.to(btn, {
      scale: 1,
      y: 0,
      duration: 0.4,
      ease: "elastic.out(1, 0.5)",
    });
    const arrow = btn.querySelector(".cta-arrow");
    if (arrow) {
      gsap.to(arrow, { x: 0, rotation: 0, duration: 0.3, ease: "power2.out" });
    }
  }, []);

  useGSAP(() => {
    // Trigger scramble effect when section enters view
    ScrollTrigger.create({
      trigger: ctaRef.current,
      start: "top 80%",
      onEnter: () => setScrambleActive(true),
    });

    // Title lines with dramatic 3D reveal
    const titleTl = gsap.timeline({
      scrollTrigger: { trigger: ctaRef.current, start: "top 80%" },
    });

    titleTl
      .fromTo(".cta-line", {
        y: 80,
        opacity: 0,
        rotateX: -40,
        transformPerspective: 1000,
        filter: "blur(10px)",
      }, {
        y: 0,
        opacity: 1,
        rotateX: 0,
        filter: "blur(0px)",
        stagger: 0.15,
        duration: 1.4,
        ease: "power4.out",
      })
      .fromTo(".cta-subtitle", {
        y: 30,
        opacity: 0,
        filter: "blur(8px)",
      }, {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        duration: 1,
        ease: "power3.out",
      }, "-=0.6")
      .fromTo(".cta-button", {
        y: 40,
        opacity: 0,
        scale: 0.8,
      }, {
        y: 0,
        opacity: 1,
        scale: 1,
        stagger: 0.15,
        duration: 1,
        ease: "back.out(1.7)",
      }, "-=0.4");

    // Ambient glow breathing
    gsap.to(".cta-glow", {
      scale: 1.3,
      opacity: 0.6,
      duration: 4,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    });

    gsap.to(".cta-glow-2", {
      scale: 0.7,
      opacity: 0.4,
      duration: 5,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
      delay: 2,
    });

    // Rotating border glow
    gsap.to(".cta-border-glow", {
      rotation: 360,
      duration: 10,
      repeat: -1,
      ease: "none",
    });

    // Sparkle particles
    gsap.to(".cta-sparkle", {
      y: -20,
      opacity: 0,
      scale: 0,
      duration: 2,
      stagger: {
        each: 0.5,
        repeat: -1,
      },
      ease: "power2.out",
    });

    // Section parallax
    gsap.to(".cta-content", {
      y: -30,
      scrollTrigger: {
        trigger: ctaRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
      },
    });
  }, { scope: ctaRef });

  return (
    <section ref={ctaRef} id="cta" aria-labelledby="cta-heading" className="py-20 md:py-32 lg:py-44 text-center relative overflow-hidden flex items-center justify-center">
      {/* Decorative top rule */}
      <div className="section-divider absolute top-0 left-0 right-0" aria-hidden="true" />

      {/* Animated gradient border - smaller on mobile */}
      <div className="cta-border-glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] md:w-[600px] md:h-[600px] rounded-full pointer-events-none" aria-hidden="true" style={{ background: "conic-gradient(from 0deg, transparent, rgba(234,179,8,0.08), transparent, rgba(234,179,8,0.04), transparent)" }} />

      {/* Floating sparkles */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {Array.from({ length: 4 }).map((_, i) => (
          <Sparkles
            key={i}
            className="cta-sparkle absolute text-[#eab308]/40 w-3 h-3"
            style={{
              left: `${15 + Math.random() * 70}%`,
              top: `${20 + Math.random() * 60}%`,
            }}
          />
        ))}
      </div>

      <div className="cta-content flex flex-col items-center justify-center px-4 sm:px-6 relative z-10 max-w-4xl mx-auto">
        <h2
          id="cta-heading"
          className="text-2xl sm:text-4xl md:text-6xl lg:text-[68px] font-black tracking-[-0.03em] leading-[1.1] sm:leading-[1.05] text-center"
          style={{ perspective: "1200px" }}
        >
          <span className="cta-line block text-white"><span ref={scrambleRef}>{t("titleLine1")}</span></span>
          <span className="cta-line block">
            <span className="text-white">{t("titleLine2prefix")}</span>
            <span className="font-display italic text-[#eab308]">{t("titleLine2accent")}</span>
          </span>
        </h2>

        <p className="cta-subtitle text-slate-500 text-xs sm:text-sm md:text-base font-medium mt-6 sm:mt-8 md:mt-10 max-w-xl mx-auto leading-relaxed">
          {t("subtitle")}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 mt-8 sm:mt-10 md:mt-14 w-full sm:w-auto">
          <button
            onMouseEnter={handleBtnEnter}
            onMouseLeave={handleBtnLeave}
            className="cta-button relative w-full sm:w-auto px-8 sm:px-14 py-4 sm:py-5 rounded-xl btn-gold text-[12px] sm:text-[13px] overflow-hidden shadow-[0_0_30px_rgba(234,179,8,0.15)] cursor-pointer"
          >
            <span className="cta-btn-shine absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full pointer-events-none" />
            <span className="cta-btn-ripple absolute w-4 h-4 bg-white/30 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <span className="relative z-10 flex items-center justify-center gap-3">
              {tCommon("createNow")}
              <ArrowRight className="cta-arrow w-4 h-4" />
            </span>
          </button>
          <button
            onMouseEnter={handleBtnEnter}
            onMouseLeave={handleBtnLeave}
            className="cta-button relative w-full sm:w-auto px-8 sm:px-14 py-4 sm:py-5 rounded-xl btn-ghost text-[12px] sm:text-[13px] overflow-hidden cursor-pointer"
          >
            <span className="cta-btn-shine absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full pointer-events-none" />
            <span className="cta-btn-ripple absolute w-4 h-4 bg-white/20 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <span className="relative z-10 flex items-center justify-center gap-3">
              {tCommon("requestDemo")}
              <ArrowRight className="cta-arrow w-4 h-4" />
            </span>
          </button>
        </div>
      </div>

      {/* Ambient glows */}
      <div className="cta-glow absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[250px] sm:w-[500px] sm:h-[350px] md:w-[700px] md:h-[500px] bg-[#eab308]/[0.03] blur-[100px] sm:blur-[140px] md:blur-[180px] -z-10 rounded-full" aria-hidden="true" />
      <div className="cta-glow-2 absolute top-1/2 right-1/4 -translate-y-1/2 w-[300px] h-[200px] sm:w-[400px] sm:h-[300px] md:w-[600px] md:h-[400px] bg-[#eab308]/[0.02] blur-[80px] sm:blur-[120px] md:blur-[160px] -z-10 rounded-full" aria-hidden="true" />
    </section>
  );
};
