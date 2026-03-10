"use client";

import { useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const ITEMS = [
  {
    id: 1,
    titleKey: "item1Title" as const,
    descKey: "item1Desc" as const,
    altKey: "item1Alt" as const,
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800",
  },
  {
    id: 2,
    titleKey: "item2Title" as const,
    descKey: "item2Desc" as const,
    altKey: "item2Alt" as const,
    image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=800",
  },
  {
    id: 3,
    titleKey: "item3Title" as const,
    descKey: "item3Desc" as const,
    altKey: "item3Alt" as const,
    image: "https://images.unsplash.com/photo-1493238792000-8113da705763?q=80&w=800",
  },
];



export const Showcase = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("Showcase");

  const marqueeTags = [
    t("marquee.cinematic"),
    t("marquee.photorealistic"),
    t("marquee.render4k"),
    t("marquee.aiDriven"),
    t("marquee.motionPhysics"),
    t("marquee.realTime"),
    t("marquee.neuralEngine"),
    t("marquee.hdr"),
    t("marquee.rayTracing"),
    t("marquee.volumetric"),
  ];

  const rafRef = useRef(0);

  const handleCardMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (rafRef.current) return;
    const card = e.currentTarget;
    const clientX = e.clientX;
    const clientY = e.clientY;

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      const rect = card.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 15;
      const rotateY = (centerX - x) / 15;

      gsap.to(card, {
        rotateX,
        rotateY,
        transformPerspective: 1000,
        duration: 0.4,
        ease: "power2.out",
      });

      const glow = card.querySelector(".card-neon-glow") as HTMLElement;
      if (glow) {
        gsap.to(glow, {
          left: x,
          top: y,
          opacity: 1,
          scale: 1.2,
          duration: 0.3,
          ease: "power2.out",
        });
      }

      const img = card.querySelector(".showcase-card-img") as HTMLElement;
      if (img) {
        gsap.to(img, {
          x: (x - centerX) * 0.02,
          y: (y - centerY) * 0.02,
          duration: 0.4,
          ease: "power2.out",
        });
      }
    });
  }, []);

  const handleCardMouseLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.6,
      ease: "elastic.out(1, 0.5)",
    });

    const glow = e.currentTarget.querySelector(".card-neon-glow") as HTMLElement;
    if (glow) {
      gsap.to(glow, {
        opacity: 0,
        scale: 0.8,
        duration: 0.4,
        ease: "power2.in",
      });
    }

    const img = e.currentTarget.querySelector(".showcase-card-img") as HTMLElement;
    if (img) {
      gsap.to(img, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
      });
    }
  }, []);

  useGSAP(() => {
    // Heading with split reveal
    const headingTl = gsap.timeline({
      scrollTrigger: { trigger: scrollRef.current, start: "top 85%" },
    });

    headingTl
      .fromTo(".showcase-heading-title", {
        y: 60,
        opacity: 0,
        rotateX: -15,
        transformPerspective: 800,
      }, {
        y: 0,
        opacity: 1,
        rotateX: 0,
        duration: 1.2,
        ease: "power4.out",
      })
      .fromTo(".showcase-heading-desc", {
        y: 30,
        opacity: 0,
        filter: "blur(8px)",
      }, {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.8,
        ease: "power3.out",
      }, "-=0.6")
      .fromTo(".showcase-browse-btn", {
        x: 30,
        opacity: 0,
      }, {
        x: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out",
      }, "-=0.5");

    // Cards entrance with dramatic 3D stagger
    gsap.fromTo(".showcase-card", {
      y: 120,
      opacity: 0,
      rotateX: 25,
      rotateY: -5,
      transformPerspective: 1200,
      transformOrigin: "center bottom",
    }, {
      scrollTrigger: { trigger: scrollRef.current, start: "top 70%" },
      y: 0,
      opacity: 1,
      rotateX: 0,
      rotateY: 0,
      stagger: {
        each: 0.15,
        from: "center",
      },
      duration: 1.6,
      ease: "power4.out",
    });

    // Card image parallax on scroll
    scrollRef.current?.querySelectorAll(".showcase-card").forEach((card) => {
      const img = card.querySelector(".showcase-card-img");
      if (img) {
        gsap.to(img, {
          y: -30,
          scrollTrigger: {
            trigger: card,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      }
    });

    // Card overlay line animation on scroll
    scrollRef.current?.querySelectorAll(".showcase-card").forEach((card) => {
      gsap.fromTo(card.querySelector(".card-reveal-line"), {
        scaleX: 0,
        transformOrigin: "left",
      }, {
        scrollTrigger: { trigger: card, start: "top 70%" },
        scaleX: 1,
        duration: 1,
        delay: 0.5,
        ease: "power3.out",
      });
    });

    // Marquee with dual direction
    gsap.to(".marquee-inner", {
      xPercent: -50,
      duration: 25,
      repeat: -1,
      ease: "none",
    });

    gsap.to(".marquee-inner-reverse", {
      xPercent: 50,
      duration: 30,
      repeat: -1,
      ease: "none",
    });

    // Marquee items subtle pulse
    gsap.to(".marquee-tag", {
      color: "rgba(234,179,8,0.4)",
      duration: 2,
      repeat: -1,
      yoyo: true,
      stagger: { each: 0.3, repeat: -1, yoyo: true },
      ease: "sine.inOut",
    });
  }, { scope: scrollRef });

  return (
    <section ref={scrollRef} id="showcase" aria-labelledby="showcase-heading" className="py-20 md:py-28 lg:py-36 bg-black relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#eab308]/10 to-transparent" aria-hidden="true" />

      <div className="container px-4 sm:px-6 mx-auto">
        <div className="showcase-heading flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-20 gap-6 md:gap-8">
          <div>
            <h2 id="showcase-heading" className="showcase-heading-title text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black tracking-[-0.03em]">
              <span className="text-white">{t("title")} </span>
              <span className="font-display italic text-[#eab308]">{t("titleAccent")}</span>
            </h2>
            <p className="showcase-heading-desc text-slate-500 mt-3 md:mt-5 max-w-xl text-xs sm:text-sm font-medium leading-relaxed">
              {t("description")}
            </p>
          </div>
          <button className="showcase-browse-btn flex items-center space-x-3 text-[12px] font-black uppercase tracking-widest text-[#eab308] hover:text-[#facc15] transition-colors group cursor-pointer">
            <span>{t("browse")}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
          {ITEMS.map((item) => (
            <article
              key={item.id}
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
              className="showcase-card group cursor-pointer"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-dark-card shadow-2xl transition-all duration-500">
                {/* Gradient border overlay */}
                <div className="absolute inset-0 rounded-xl border border-white/[0.04] group-hover:border-[#eab308]/30 transition-colors duration-500 z-20 pointer-events-none" />

                {/* Neon glow following cursor */}
                <div className="card-neon-glow absolute w-[250px] h-[250px] bg-[#eab308]/20 rounded-full blur-[100px] pointer-events-none -translate-x-1/2 -translate-y-1/2 opacity-0 z-10" />

                <div className="showcase-card-img relative w-full h-full">
                  <Image
                    src={item.image}
                    fill
                    alt={t(item.altKey)}
                    className="object-cover grayscale brightness-60 group-hover:grayscale-0 group-hover:brightness-100 group-hover:scale-110 transition-all duration-[1.5s]"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Hover overlay content */}
                <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-end">
                  <div className="card-reveal-line h-[2px] w-12 bg-gradient-to-r from-[#eab308] to-[#facc15] mb-2 sm:mb-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-500" />
                  <h3 className="font-black text-base sm:text-lg uppercase tracking-tight text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100 translate-y-0 sm:translate-y-4 sm:group-hover:translate-y-0 transition-all duration-500">
                    {t(item.titleKey)}
                  </h3>
                  <p className="text-white/50 text-xs mt-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 translate-y-0 sm:translate-y-4 sm:group-hover:translate-y-0 transition-all duration-700 delay-100">
                    {t(item.descKey)}
                  </p>
                </div>
              </div>

              {/* Card info below - hidden on mobile since overlay is visible */}
              <div className="hidden sm:block mt-5 px-1">
                <h3 className="text-white text-sm font-black uppercase tracking-wider group-hover:text-[#eab308] transition-colors duration-500">
                  {t(item.titleKey)}
                </h3>
                <p className="text-slate-600 text-xs font-medium mt-1.5 leading-relaxed">
                  {t(item.descKey)}
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* Dual Marquee */}
        <div className="mt-14 md:mt-24 space-y-3 md:space-y-4" aria-hidden="true">
          {/* Forward marquee */}
          <div className="overflow-hidden relative">
            <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-black to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-black to-transparent z-10" />
            <div className="marquee-inner flex whitespace-nowrap gap-6 sm:gap-10 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-slate-800">
              {[...marqueeTags, ...marqueeTags].map((tag, i) => (
                <span key={i} className="marquee-tag flex items-center gap-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#eab308]/30" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
          {/* Reverse marquee - hidden on small mobile */}
          <div className="overflow-hidden relative hidden sm:block">
            <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-black to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-black to-transparent z-10" />
            <div className="marquee-inner-reverse flex whitespace-nowrap gap-6 sm:gap-10 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-slate-800/50 -translate-x-1/2">
              {[...marqueeTags, ...marqueeTags].reverse().map((tag, i) => (
                <span key={i} className="marquee-tag flex items-center gap-4">
                  <span className="w-1 h-1 rounded-full bg-[#eab308]/20" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
