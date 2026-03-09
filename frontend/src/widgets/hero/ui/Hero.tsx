"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Play, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const useTypewriter = (text: string, speed = 40, delay = 1800) => {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    if (displayed.length >= text.length) return;
    const timeout = setTimeout(() => {
      setDisplayed(text.slice(0, displayed.length + 1));
    }, speed);
    return () => clearTimeout(timeout);
  }, [displayed, text, speed, started]);

  return { displayed, done: displayed.length >= text.length };
};

// Floating particles component
const FloatingParticles = () => {
  const particlesRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!particlesRef.current) return;
    const particles = particlesRef.current.querySelectorAll(".hero-particle");

    particles.forEach((particle, i) => {
      const startX = Math.random() * 100;
      const startY = Math.random() * 100;
      const duration = 8 + Math.random() * 12;
      const delay = Math.random() * 5;

      gsap.set(particle, {
        left: `${startX}%`,
        top: `${startY}%`,
        scale: 0.3 + Math.random() * 0.7,
      });

      gsap.to(particle, {
        y: -150 - Math.random() * 200,
        x: (Math.random() - 0.5) * 200,
        opacity: 0,
        duration,
        delay,
        repeat: -1,
        ease: "none",
        onRepeat: () => {
          gsap.set(particle, {
            left: `${Math.random() * 100}%`,
            top: `${60 + Math.random() * 40}%`,
            opacity: 0.6,
            y: 0,
            x: 0,
          });
        },
      });

      // Twinkle effect
      gsap.to(particle, {
        opacity: 0.2 + Math.random() * 0.6,
        duration: 1 + Math.random() * 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: Math.random() * 2,
      });
    });
  }, { scope: particlesRef });

  return (
    <div ref={particlesRef} className="absolute inset-0 pointer-events-none overflow-hidden hidden sm:block" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="hero-particle absolute w-1 h-1 rounded-full bg-[#eab308]/60"
        />
      ))}
    </div>
  );
};

export const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("Hero");

  const typewriter = useTypewriter(t("description"), 30, 2000);

  // Magnetic button effect — RAF-throttled
  const heroRafRef = useRef(0);

  const handleMagneticMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (heroRafRef.current) return;
    const btn = e.currentTarget;
    const clientX = e.clientX;
    const clientY = e.clientY;

    heroRafRef.current = requestAnimationFrame(() => {
      heroRafRef.current = 0;
      const rect = btn.getBoundingClientRect();
      const x = clientX - rect.left - rect.width / 2;
      const y = clientY - rect.top - rect.height / 2;

      gsap.to(btn, {
        x: x * 0.3,
        y: y * 0.3,
        duration: 0.3,
        ease: "power2.out",
      });
    });
  }, []);

  const handleMagneticLeave = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    gsap.to(e.currentTarget, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: "elastic.out(1, 0.3)",
    });
  }, []);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

    // Cinematic curtain reveal
    tl.fromTo(".hero-curtain-left", {
      xPercent: 0,
    }, {
      xPercent: -100,
      duration: 1.4,
      ease: "power3.inOut",
    })
      .fromTo(".hero-curtain-right", {
        xPercent: 0,
      }, {
        xPercent: 100,
        duration: 1.4,
        ease: "power3.inOut",
      }, "<")

      // Badge entrance with bounce
      .fromTo(".hero-badge", {
        y: -40,
        opacity: 0,
        scale: 0.5,
      }, {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 1,
        ease: "back.out(2)",
      }, "-=0.6")

      // Character-by-character title reveal with 3D rotation
      .fromTo(".hero-title-word", {
        y: 120,
        opacity: 0,
        rotateX: -90,
        transformPerspective: 1000,
        transformOrigin: "center bottom",
      }, {
        y: 0,
        opacity: 1,
        rotateX: 0,
        stagger: {
          each: 0.06,
          from: "start",
        },
        duration: 1.4,
        ease: "power4.out",
      }, "-=0.5")

      // Description fade in
      .fromTo(".hero-desc", {
        y: 30,
        opacity: 0,
        filter: "blur(10px)",
      }, {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        duration: 1,
      }, "-=0.6")

      // Video frame cinematic entrance with clip-path
      .fromTo(".hero-video", {
        clipPath: "inset(50% 50% 50% 50% round 16px)",
        opacity: 0,
        scale: 0.8,
      }, {
        clipPath: "inset(0% 0% 0% 0% round 16px)",
        opacity: 1,
        scale: 1,
        duration: 2,
        ease: "power3.inOut",
      }, "-=0.5")

      // Video info bar slide up
      .fromTo(".hero-video-info span", {
        y: 20,
        opacity: 0,
      }, {
        y: 0,
        opacity: 1,
        stagger: 0.1,
        duration: 0.6,
        ease: "power2.out",
      }, "-=0.8")

      // Input box slide up with blur
      .fromTo(".hero-input", {
        y: 40,
        opacity: 0,
        filter: "blur(10px)",
      }, {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        duration: 1.2,
        ease: "power3.out",
      }, "-=0.6");

    // Badge shimmer loop
    gsap.to(".hero-badge-inner", {
      backgroundPosition: "200% center",
      duration: 3,
      repeat: -1,
      ease: "none",
    });

    // Badge floating animation
    gsap.to(".hero-badge", {
      y: -8,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    // Generate button pulsing glow
    gsap.to(".hero-generate-btn", {
      boxShadow:
        "0 0 20px rgba(234,179,8,0.4), 0 0 40px rgba(234,179,8,0.15), 0 0 80px rgba(234,179,8,0.05)",
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    // Video parallax with rotation
    gsap.to(".hero-video", {
      y: -80,
      rotateX: 3,
      scrollTrigger: {
        trigger: ".hero-video",
        start: "top bottom",
        end: "bottom top",
        scrub: 1.5,
      },
    });

    // Play button floating + pulsing ring
    gsap.to(".hero-play-btn", {
      y: -5,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    gsap.to(".hero-play-ring", {
      scale: 1.6,
      opacity: 0,
      duration: 2,
      repeat: -1,
      ease: "power2.out",
    });

    // Ambient lights floating
    gsap.to(".hero-ambient-1", {
      x: 40,
      y: -30,
      scale: 1.1,
      duration: 8,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    gsap.to(".hero-ambient-2", {
      x: -30,
      y: 40,
      scale: 0.9,
      duration: 10,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: 2,
    });

    gsap.to(".hero-ambient-3", {
      x: 25,
      y: 20,
      scale: 1.15,
      duration: 12,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: 4,
    });

    // Scroll-driven fade out for hero content
    gsap.to(".hero-content", {
      y: -50,
      opacity: 0.3,
      filter: "blur(5px)",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "60% top",
        end: "bottom top",
        scrub: 1,
      },
    });

    // Input glow shimmer
    gsap.to(".hero-input-glow", {
      backgroundPosition: "200% center",
      duration: 4,
      repeat: -1,
      ease: "none",
    });
  }, { scope: containerRef });

  return (
    <section
      ref={containerRef}
      aria-labelledby="hero-heading"
      className="relative pt-28 pb-20 md:pt-36 md:pb-32 lg:pt-44 lg:pb-44 flex flex-col items-center bg-[#050505] overflow-hidden"
    >
      {/* Cinematic curtain reveal */}
      <div className="hero-curtain-left fixed inset-0 bg-[#050505] z-[60] pointer-events-none" aria-hidden="true" />
      <div className="hero-curtain-right fixed inset-0 bg-[#050505] z-[60] pointer-events-none" aria-hidden="true" />

      {/* Floating particles */}
      <FloatingParticles />

      {/* Ambient lights - scaled down on mobile */}
      <div className="hero-ambient-1 absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] md:h-[500px] bg-gradient-to-b from-[#eab308]/[0.04] to-transparent pointer-events-none" aria-hidden="true" />
      <div className="hero-ambient-2 absolute top-[15%] left-[8%] w-[250px] h-[250px] md:w-[500px] md:h-[500px] bg-[#eab308]/[0.025] blur-[100px] md:blur-[180px] rounded-full pointer-events-none" aria-hidden="true" />
      <div className="hero-ambient-3 absolute top-[15%] right-[8%] w-[200px] h-[200px] md:w-[400px] md:h-[400px] bg-[#eab308]/[0.015] blur-[80px] md:blur-[150px] rounded-full pointer-events-none" aria-hidden="true" />
      <div className="hidden md:block absolute top-[40%] left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-[#eab308]/[0.01] blur-[200px] rounded-full pointer-events-none" aria-hidden="true" />

      <div className="hero-content container px-4 sm:px-6 relative z-10 text-center">
        {/* Badge */}
        <div className="hero-badge inline-flex mb-8 md:mb-12">
          <div
            className="hero-badge-inner px-6 py-2.5 rounded-full border border-[#eab308]/20 bg-[#eab308]/[0.04] text-[11px] font-black tracking-[0.3em] uppercase text-[#eab308] relative overflow-hidden flex items-center gap-2"
            style={{
              backgroundImage:
                "linear-gradient(110deg, transparent 25%, rgba(234,179,8,0.15) 50%, transparent 75%)",
              backgroundSize: "200% 100%",
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {t("badge")}
          </div>
        </div>

        {/* Title */}
        <h1
          id="hero-heading"
          className="hero-title text-3xl sm:text-5xl md:text-7xl lg:text-[92px] font-black tracking-[-0.04em] mb-8 md:mb-12 leading-[0.95] md:leading-[0.92] text-white"
          style={{ perspective: "1000px" }}
        >
          {t("titlePrefix")
            .split(" ")
            .map((word: string, i: number) => (
              <span
                key={i}
                className="hero-title-word inline-block mr-[0.3em] will-animate"
              >
                {word}
              </span>
            ))}{" "}
          <br />
          <span className="italic text-[#eab308] font-display tracking-normal">
            {t("titleSuffix")
              .split(" ")
              .map((word: string, i: number) => (
                <span
                  key={`s-${i}`}
                  className="hero-title-word inline-block mr-[0.3em] will-animate"
                >
                  {word}
                </span>
              ))}
          </span>
        </h1>

        {/* Description with typewriter */}
        <div className="hero-desc text-slate-400 text-sm sm:text-base md:text-lg max-w-3xl mx-auto mb-12 md:mb-24 leading-relaxed font-medium min-h-[2.5em] md:min-h-[3.5em]">
          <span>{typewriter.displayed}</span>
          {!typewriter.done && (
            <span className="inline-block w-[2px] h-[1em] bg-[#eab308] ml-0.5 animate-pulse align-middle" />
          )}
        </div>

        {/* Video Frame */}
        <div ref={videoRef} className="hero-video relative max-w-5xl mx-auto mb-12 md:mb-24 rounded-xl md:rounded-2xl overflow-hidden border border-white/[0.06] shadow-[0_20px_60px_rgba(0,0,0,0.9)] md:shadow-[0_40px_120px_rgba(0,0,0,0.9),_0_0_60px_rgba(234,179,8,0.03)] group" style={{ transformStyle: "preserve-3d" }}>
          <div className="absolute inset-0 rounded-2xl border border-white/[0.03] pointer-events-none z-20" />
          <div className="aspect-video bg-neutral-900 flex items-center justify-center relative">
            <Image
              src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2000"
              fill
              className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-[2s]"
              alt="Cinematic cityscape at dusk demonstrating LTX-VIDEO rendering capabilities"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1024px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            {/* Play button with pulsing ring */}
            <div className="relative">
              <div className="hero-play-ring absolute inset-0 rounded-full border-2 border-white/20" />
              <button
                className="hero-play-btn relative w-14 h-14 md:w-20 md:h-20 rounded-full bg-white/10 backdrop-blur-2xl flex items-center justify-center border border-white/20 group-hover:scale-110 group-hover:bg-white/20 transition-all duration-500 cursor-pointer"
                onMouseMove={handleMagneticMove}
                onMouseLeave={handleMagneticLeave}
              >
                <Play className="text-white fill-white w-6 h-6 md:w-8 md:h-8 ml-0.5 md:ml-1" />
              </button>
            </div>

            {/* Bottom video info bar */}
            <div className="hero-video-info absolute bottom-0 left-0 right-0 px-4 py-2 md:px-8 md:py-4 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex items-center space-x-3 md:space-x-6 text-[8px] md:text-[10px] font-bold tracking-[0.15em] md:tracking-[0.2em] text-white/60">
                <span className="flex items-center gap-1.5 md:gap-2">
                  <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-[#eab308] animate-pulse" />
                  4K RENDER
                </span>
                <span className="hidden sm:flex items-center gap-1.5 md:gap-2">
                  <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-[#eab308] animate-pulse" />
                  PHYSICAL LIGHTING ENGINE
                </span>
              </div>
              <span className="text-[8px] md:text-[10px] font-bold tracking-[0.15em] md:tracking-[0.2em] text-white/40">
                0:15 | 24FPS
              </span>
            </div>
          </div>
        </div>

        {/* Prompt InputBox */}
        <div className="hero-input w-full max-w-3xl mx-auto relative group">
          <div className="hero-input-glow absolute -inset-0.5 bg-gradient-to-r from-[#eab308]/10 via-[#eab308]/5 to-[#eab308]/10 blur-md opacity-50 group-focus-within:opacity-100 transition-opacity duration-500 rounded-2xl" style={{ backgroundSize: "200% 100%" }} />
          <div className="relative flex flex-col sm:flex-row p-1.5 rounded-xl bg-neutral-900/90 border border-white/[0.06] backdrop-blur-2xl group-focus-within:border-[#eab308]/20 transition-colors duration-300 gap-1.5 sm:gap-0">
            <div className="flex items-center flex-1 min-w-0">
              <div className="flex items-center pl-3 sm:pl-4 text-slate-500">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <input
                type="text"
                placeholder={t("placeholder")}
                className="flex-1 bg-transparent px-3 sm:px-4 py-3 sm:py-4 outline-none text-white text-sm placeholder:text-slate-600 font-medium min-w-0"
              />
            </div>
            <button
              className="hero-generate-btn relative px-6 sm:px-10 py-3 sm:py-3.5 rounded-lg btn-gold text-[11px] sm:text-[12px] cursor-pointer shrink-0"
              onMouseMove={handleMagneticMove}
              onMouseLeave={handleMagneticLeave}
            >
              <span className="relative z-10">{t("button")}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
